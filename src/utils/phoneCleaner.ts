import * as XLSX from 'xlsx';
import { Contact, ImportSummary } from '../types';

export interface PhoneValidationResult {
  isValid: boolean;
  raw: string;
  cleaned: string;
  countryCode: string;
  nationalNumber: string;
  fullPhone: string;
  error?: string;
}

/**
 * Clean & validate phone numbers.
 * Supports standard +91 Indian phone numbers as well as international numbers.
 */
export function cleanAndValidatePhone(
  rawInput: string | number | undefined | null,
  defaultCountryCode: string = '91'
): PhoneValidationResult {
  const raw = String(rawInput ?? '').trim();
  if (!raw) {
    return {
      isValid: false,
      raw: '',
      cleaned: '',
      countryCode: defaultCountryCode,
      nationalNumber: '',
      fullPhone: '',
      error: 'Empty phone number',
    };
  }

  // Remove whitespace, dashes, parens, brackets, dots
  let digitsOnly = raw.replace(/[^\d+]/g, '');

  let hasPlus = digitsOnly.startsWith('+');
  digitsOnly = digitsOnly.replace(/\+/g, '');

  // Check all zeros e.g. 0000000000
  if (/^0+$/.test(digitsOnly)) {
    return {
      isValid: false,
      raw,
      cleaned: digitsOnly,
      countryCode: defaultCountryCode,
      nationalNumber: digitsOnly,
      fullPhone: `+${digitsOnly}`,
      error: 'Invalid dummy number (all zeroes)',
    };
  }

  let countryCode = defaultCountryCode.replace(/\+/g, '');
  let nationalNumber = digitsOnly;

  // Handle leading zeros in local format, e.g. 09876543210 -> 9876543210
  if (digitsOnly.startsWith('0') && digitsOnly.length === 11) {
    nationalNumber = digitsOnly.slice(1);
  } else if (digitsOnly.startsWith(countryCode) && digitsOnly.length === 10 + countryCode.length) {
    // e.g. 919876543210 -> CC: 91, National: 9876543210
    nationalNumber = digitsOnly.slice(countryCode.length);
  } else if (hasPlus) {
    // If entered with + but another country code
    if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
      countryCode = '91';
      nationalNumber = digitsOnly.slice(2);
    } else if (digitsOnly.length >= 10) {
      // generic international
      countryCode = digitsOnly.slice(0, digitsOnly.length - 10);
      nationalNumber = digitsOnly.slice(digitsOnly.length - 10);
    }
  }

  // Validation for India (91)
  if (countryCode === '91') {
    // Indian mobile numbers must be 10 digits and start with 6, 7, 8, or 9
    if (nationalNumber.length !== 10) {
      return {
        isValid: false,
        raw,
        cleaned: digitsOnly,
        countryCode,
        nationalNumber,
        fullPhone: `+${countryCode}${nationalNumber}`,
        error: `Must be exactly 10 digits (got ${nationalNumber.length})`,
      };
    }

    if (!/^[6-9]\d{9}$/.test(nationalNumber)) {
      return {
        isValid: false,
        raw,
        cleaned: digitsOnly,
        countryCode,
        nationalNumber,
        fullPhone: `+${countryCode}${nationalNumber}`,
        error: 'Indian mobile numbers must start with 6, 7, 8, or 9',
      };
    }
  } else {
    // International standard: 7 to 15 digits
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return {
        isValid: false,
        raw,
        cleaned: digitsOnly,
        countryCode,
        nationalNumber,
        fullPhone: `+${digitsOnly}`,
        error: 'International number must be between 8 and 15 digits',
      };
    }
  }

  const fullPhone = `+${countryCode}${nationalNumber}`;

  return {
    isValid: true,
    raw,
    cleaned: nationalNumber,
    countryCode,
    nationalNumber,
    fullPhone,
  };
}

/**
 * Parse an Excel file (.xlsx, .xls) or CSV and filter duplicates and invalid numbers.
 */
export async function parseExcelOrCSV(
  fileData: ArrayBuffer | Uint8Array,
  userId: string,
  existingFullPhones: Set<string>,
  defaultCountryCode: string = '91',
  defaultTags: string[] = ['Imported']
): Promise<{
  validContacts: Contact[];
  summary: ImportSummary;
}> {
  const workbook = XLSX.read(fileData, { type: 'array' });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to array of objects
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, {
    defval: '',
  });

  const validContacts: Contact[] = [];
  const seenInBatch = new Set<string>();
  const summaryDetails: ImportSummary['details'] = [];

  let validAdded = 0;
  let duplicatesRemoved = 0;
  let invalidSkipped = 0;

  for (let i = 0; i < rawRows.length; i++) {
    const row = rawRows[i];

    // Find phone column dynamically (case-insensitive)
    const phoneKey = Object.keys(row).find((k) =>
      /phone|mobile|number|cell|whatsapp|contact_no/i.test(k)
    );
    const nameKey = Object.keys(row).find((k) =>
      /name|full_?name|contact|first_?name|user/i.test(k)
    );
    const emailKey = Object.keys(row).find((k) => /email|mail/i.test(k));
    const companyKey = Object.keys(row).find((k) => /company|org|business/i.test(k));

    const rawPhone = phoneKey ? String(row[phoneKey]) : String(Object.values(row)[1] || Object.values(row)[0] || '');
    const rawName = nameKey ? String(row[nameKey]) : String(Object.values(row)[0] || `Contact ${i + 1}`);
    const email = emailKey ? String(row[emailKey]) : undefined;
    const company = companyKey ? String(row[companyKey]) : undefined;

    const validation = cleanAndValidatePhone(rawPhone, defaultCountryCode);

    if (!validation.isValid) {
      invalidSkipped++;
      summaryDetails.push({
        name: rawName || `Row ${i + 1}`,
        rawPhone,
        cleanedPhone: validation.fullPhone || rawPhone,
        status: 'invalid',
        reason: validation.error || 'Invalid phone format',
      });
      continue;
    }

    // Check duplicate in existing database or in current file batch
    if (existingFullPhones.has(validation.fullPhone) || seenInBatch.has(validation.fullPhone)) {
      duplicatesRemoved++;
      summaryDetails.push({
        name: rawName,
        rawPhone,
        cleanedPhone: validation.fullPhone,
        status: 'duplicate',
        reason: 'Duplicate phone number',
      });
      continue;
    }

    // Valid unique contact
    seenInBatch.add(validation.fullPhone);
    validAdded++;

    const contact: Contact = {
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      userId,
      name: rawName.trim() || 'Valued Customer',
      phone: validation.nationalNumber,
      countryCode: validation.countryCode,
      fullPhone: validation.fullPhone,
      email: email?.trim(),
      company: company?.trim(),
      tags: defaultTags,
      listIds: [],
      isValid: true,
      createdAt: new Date().toISOString(),
    };

    validContacts.push(contact);
    summaryDetails.push({
      name: contact.name,
      rawPhone,
      cleanedPhone: contact.fullPhone,
      status: 'valid',
    });
  }

  const summary: ImportSummary = {
    totalRows: rawRows.length,
    validAdded,
    duplicatesRemoved,
    invalidSkipped,
    details: summaryDetails,
  };

  return { validContacts, summary };
}

/**
 * Generates an Excel (.xlsx) file with 10 sample test contacts (Step 6 verification)
 * Contains 6 valid +91 Indian numbers, 2 intentional duplicates, and 2 invalid entries.
 */
export function generateDemoExcelWorkbook(): Uint8Array {
  const sampleData = [
    { Name: 'Rajesh Kumar', Phone: '+91 98765 43210', Company: 'Tech Solutions', Email: 'rajesh@example.com' },
    { Name: 'Priya Sharma', Phone: '9876512345', Company: 'Sharma Trading', Email: 'priya@example.com' },
    { Name: 'Amit Patel', Phone: '+91-98234-56789', Company: 'Patel Logistics', Email: 'amit@example.com' },
    { Name: 'Simran Kaur', Phone: '09811122233', Company: 'Kaur Boutique', Email: 'simran@example.com' },
    { Name: 'Rajesh Kumar (Dup)', Phone: '+91 98765 43210', Company: 'Duplicate Entry', Email: 'dup@example.com' },
    { Name: 'Vikram Singh', Phone: '9899887766', Company: 'Singh Associates', Email: 'vikram@example.com' },
    { Name: 'Neha Gupta (Short)', Phone: '12345', Company: 'Invalid Entry', Email: 'invalid1@example.com' },
    { Name: 'Priya Sharma (Dup)', Phone: '9876512345', Company: 'Duplicate Entry', Email: 'dup2@example.com' },
    { Name: 'Fake Zero (Invalid)', Phone: '0000000000', Company: 'Invalid Number', Email: 'fake@example.com' },
    { Name: 'Harpreet Singh', Phone: '+91 97123 45678', Company: 'Punjab Exporters', Email: 'harpreet@example.com' },
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Contacts_Demo');

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Uint8Array(out);
}

/**
 * Triggers a browser download of the demo Excel file.
 */
export function downloadDemoExcelFile(): void {
  const data = generateDemoExcelWorkbook();
  const blob = new Blob([data as any], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'WhatsCast_Demo_5_to_10_Contacts_91.xlsx';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export contact list or logs to Excel file
 */
export function exportToExcel(data: any[], filename: string, sheetName: string = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([out as any], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
