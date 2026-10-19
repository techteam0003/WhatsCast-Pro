import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Upload,
  FileSpreadsheet,
  Plus,
  Trash2,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Tag,
  PhoneCall,
  UserX,
  UserCheck,
  X,
} from 'lucide-react';
import { downloadDemoExcelFile, exportToExcel, generateDemoExcelWorkbook } from '../../utils/phoneCleaner';
import { Contact } from '../../types';

export const ContactsScreen: React.FC = () => {
  const {
    contacts,
    lists,
    addSingleContact,
    deleteContact,
    deleteMultipleContacts,
    updateContact,
    simulateIncomingStop,
    handleExcelImport,
    setImportSummary,
    settings,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedListFilter, setSelectedListFilter] = useState<string>('all');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Single Contact Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formListId, setFormListId] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fullPhone.includes(searchTerm) ||
      (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      c.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesList =
      selectedListFilter === 'all' || c.listIds.includes(selectedListFilter);

    return matchesSearch && matchesList;
  });

  // Handle file drop or selection
  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const buffer = await file.arrayBuffer();
      const summary = await handleExcelImport(buffer, ['Excel Import']);
      setImportSummary(summary);
    } catch (error) {
      console.error('File parsing error:', error);
      alert('Error parsing Excel/CSV file. Please ensure valid format (.xlsx, .xls, .csv).');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Instant Step 6 Demo Test
  const handleQuickDemoTest = async () => {
    setIsUploading(true);
    try {
      const demoData = generateDemoExcelWorkbook();
      const summary = await handleExcelImport(demoData, ['Demo Step 6']);
      setImportSummary(summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
    }
  };

  // Submit manual single contact
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formPhone.trim()) {
      alert('Please enter both name and phone number.');
      return;
    }

    const tagsArray = formTags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    await addSingleContact({
      name: formName.trim(),
      phone: formPhone.trim(),
      countryCode: settings.defaultCountryCode,
      fullPhone: formPhone.startsWith('+') ? formPhone.trim() : `+${settings.defaultCountryCode}${formPhone.replace(/\D/g, '')}`,
      email: formEmail.trim() || undefined,
      company: formCompany.trim() || undefined,
      tags: tagsArray.length > 0 ? tagsArray : ['Manual'],
      listIds: formListId ? [formListId] : [],
      isValid: true,
    });

    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormCompany('');
    setFormTags('');
    setFormListId('');
    setIsAddModalOpen(false);
  };

  // Select all or toggle
  const toggleSelectAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Delete ${selectedContactIds.length} selected contacts?`)) {
      await deleteMultipleContacts(selectedContactIds);
      setSelectedContactIds([]);
    }
  };

  const handleExportContacts = () => {
    const dataToExport = (selectedContactIds.length > 0
      ? contacts.filter((c) => selectedContactIds.includes(c.id))
      : contacts
    ).map((c) => ({
      Name: c.name,
      Phone: c.fullPhone,
      Company: c.company || '',
      Email: c.email || '',
      Tags: c.tags.join(', '),
      CreatedAt: c.createdAt,
    }));

    exportToExcel(dataToExport, `WhatsCast_Contacts_${Date.now()}`);
  };

  return (
    <div className="space-y-6">
      {/* Header and Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md mb-1.5">
            <Users className="w-3.5 h-3.5" />
            <span>Screen 3 of 9: Contact Management</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Contacts &amp; Phone Sanitizer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Import Excel sheets, automatically remove duplicate numbers, and sanitize Indian (+91) mobiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadDemoExcelFile}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition"
            title="Download sample Excel file with 5-10 numbers with 91 code (Step 6)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Download Sample Excel</span>
          </button>

          <button
            onClick={handleQuickDemoTest}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm"
            title="Step 6 Verification: Run built-in 10-contact test with duplicates and invalid numbers"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Step 6: Run Demo Test</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-md transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Single Contact</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50'
            : 'border-slate-300 hover:border-emerald-400 bg-white'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx, .xls, .csv"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFileUpload(e.target.files[0]);
            }
          }}
        />

        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            {isUploading ? 'Parsing & Cleaning Phone Numbers...' : 'Import Contacts via Excel or CSV'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md">
            Drag and drop your <strong>.xlsx</strong>, <strong>.xls</strong>, or <strong>.csv</strong> file here.
            Duplicate numbers and invalid entries are automatically filtered out.
          </p>

          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Browse File</span>
            </button>
            <span className="text-xs text-slate-400">Supports standard headers: Name, Phone/Mobile, Company, Email</span>
          </div>
        </div>
      </div>

      {/* Search, Filter & Bulk Controls */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by name, phone (+91), tag..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedListFilter}
              onChange={(e) => setSelectedListFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Lists ({contacts.length})</option>
              {lists.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedContactIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedContactIds.length})</span>
            </button>
          )}

          <button
            onClick={handleExportContacts}
            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to Excel</span>
          </button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <th className="p-3 w-8">
                  <input
                    type="checkbox"
                    checked={
                      filteredContacts.length > 0 &&
                      selectedContactIds.length === filteredContacts.length
                    }
                    onChange={toggleSelectAll}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </th>
                <th className="p-3">Contact Name</th>
                <th className="p-3">Phone Number</th>
                <th className="p-3">Company</th>
                <th className="p-3">Tags &amp; Lists</th>
                <th className="p-3">Added Date</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-sm text-slate-600">No contacts found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Upload an Excel spreadsheet or click "Step 6: Run Demo Test" to import test contacts.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredContacts.map((c) => {
                  const isSelected = selectedContactIds.includes(c.id);
                  const assignedLists = lists.filter((l) => c.listIds.includes(l.id));

                  return (
                    <tr
                      key={c.id}
                      className={`hover:bg-slate-50/80 transition ${
                        isSelected ? 'bg-emerald-50/40' : ''
                      }`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectOne(c.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                      </td>
                      <td className="p-3 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs uppercase ${c.isOptedOut ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>
                            {c.name.slice(0, 1)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className={c.isOptedOut ? 'line-through text-slate-500' : ''}>{c.name}</span>
                              {c.isOptedOut && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-700 rounded-full border border-rose-200">
                                  Opted Out (STOP)
                                </span>
                              )}
                            </div>
                            {c.email && <div className="text-[11px] text-slate-400 font-normal">{c.email}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-medium text-slate-800">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                          <span className="text-emerald-600 font-bold">+{c.countryCode}</span>
                          <span>{c.phone}</span>
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{c.company || '—'}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {assignedLists.map((l) => (
                            <span
                              key={l.id}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                backgroundColor: `${l.color}15`,
                                color: l.color,
                                border: `1px solid ${l.color}30`,
                              }}
                            >
                              {l.name}
                            </span>
                          ))}
                          {c.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {c.isOptedOut ? (
                            <button
                              onClick={() => updateContact(c.id, { isOptedOut: false, tags: c.tags.filter((t) => t !== 'Opted-Out') })}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                              title="Re-opt in contact"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={async () => {
                                await simulateIncomingStop(c.id);
                                alert(`Simulated receiving "STOP" from ${c.name}. Contact is now opted out.`);
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                              title="Step 14: Simulate customer sending STOP reply"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <a
                            href={`https://wa.me/${c.fullPhone.replace(/\+/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-md transition"
                            title="Open direct WhatsApp chat"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => deleteContact(c.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition"
                            title="Delete Contact"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Single Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-bold text-slate-900 text-base">Add New Contact</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jaspreet Kaur"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number * (e.g. 9812345678 or +91 98123 45678)
                </label>
                <input
                  type="text"
                  required
                  placeholder="10-digit mobile number"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Organization</label>
                <input
                  type="text"
                  placeholder="e.g. Kaur Enterprise"
                  value={formCompany}
                  onChange={(e) => setFormCompany(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. jaspreet@example.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target List</label>
                  <select
                    value={formListId}
                    onChange={(e) => setFormListId(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="">None (General)</option>
                    {lists.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="VIP, Lead, Retail"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-sm"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
