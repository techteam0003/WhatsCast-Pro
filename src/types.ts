export interface Contact {
  id: string;
  userId: string;
  name: string;
  phone: string; // 10-digit national number
  countryCode: string; // e.g. "91"
  fullPhone: string; // e.g. "+919876543210"
  email?: string;
  company?: string;
  tags: string[];
  listIds: string[];
  isValid: boolean;
  isOptedOut?: boolean;
  optedOutAt?: string;
  notes?: string;
  createdAt: string;
}

export interface ContactList {
  id: string;
  userId: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  contactCount?: number;
}

export interface TemplateButton {
  type: 'url' | 'quick_reply' | 'phone';
  label: string;
  value: string;
}

export interface MessageTemplate {
  id: string;
  userId: string;
  name: string;
  category: 'Marketing' | 'Utility' | 'Transactional';
  channel: 'whatsapp' | 'sms';
  body: string;
  variables: string[];
  headerType: 'none' | 'text' | 'image';
  headerText?: string;
  headerUrl?: string;
  footer?: string;
  buttons: TemplateButton[];
  metaStatus?: 'APPROVED' | 'IN_REVIEW' | 'DRAFT';
  createdAt: string;
}

export interface Broadcast {
  id: string;
  userId: string;
  title: string;
  channel: 'whatsapp' | 'sms';
  targetType: 'all' | 'list';
  targetListId?: string;
  templateId?: string;
  messageBody: string;
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'failed' | 'paused';
  totalCount: number;
  sentCount: number;
  deliveredCount: number;
  failedCount: number;
  delaySeconds: number;
  scheduledAt?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BroadcastLog {
  id: string;
  broadcastId: string;
  userId: string;
  recipientName: string;
  phone: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
  error?: string;
  messagePreview?: string;
}

export interface AppSettings {
  senderName: string;
  defaultCountryCode: string;
  delayBetweenMessages: number; // in seconds
  batchSize: number;
  batchPauseSeconds: number;
  gateway: 'simulator' | 'cloud_api' | 'twilio';
  webhookVerifyToken: string;
  whatsappConfig: {
    phoneNumberId: string;
    wabaId: string;
    accessToken: string;
  };
  twilioConfig: {
    accountSid: string;
    authToken: string;
    fromNumber: string;
  };
}

export interface ImportSummary {
  totalRows: number;
  validAdded: number;
  duplicatesRemoved: number;
  invalidSkipped: number;
  details: {
    name: string;
    rawPhone: string;
    cleanedPhone: string;
    status: 'valid' | 'duplicate' | 'invalid';
    reason?: string;
  }[];
}
