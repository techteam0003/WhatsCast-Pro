import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase';
import {
  Contact,
  ContactList,
  MessageTemplate,
  Broadcast,
  BroadcastLog,
  AppSettings,
  ImportSummary,
} from '../types';
import {
  INITIAL_CONTACTS,
  INITIAL_LISTS,
  INITIAL_TEMPLATES,
  INITIAL_BROADCASTS,
  INITIAL_LOGS,
  INITIAL_SETTINGS,
} from '../utils/mockData';
import { parseExcelOrCSV } from '../utils/phoneCleaner';

export type ScreenName =
  | 'login'
  | 'dashboard'
  | 'contacts'
  | 'lists'
  | 'templates'
  | 'new_broadcast'
  | 'reports'
  | 'history'
  | 'settings';

interface AppContextType {
  user: User | null;
  isDemoUser: boolean;
  isAuthLoading: boolean;
  activeScreen: ScreenName;
  setActiveScreen: (screen: ScreenName) => void;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: () => void;
  logout: () => Promise<void>;

  // Data
  contacts: Contact[];
  lists: ContactList[];
  templates: MessageTemplate[];
  broadcasts: Broadcast[];
  logs: BroadcastLog[];
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;

  // Actions
  addContacts: (newContacts: Contact[]) => Promise<void>;
  addSingleContact: (contact: Omit<Contact, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  deleteMultipleContacts: (ids: string[]) => Promise<void>;

  createList: (name: string, description: string, color: string) => Promise<void>;
  updateList: (id: string, updates: Partial<ContactList>) => Promise<void>;
  deleteList: (id: string) => Promise<void>;

  createTemplate: (template: Omit<MessageTemplate, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => Promise<void>;
  deleteTemplate: (id: string) => Promise<void>;

  // Import
  importSummary: ImportSummary | null;
  setImportSummary: (summary: ImportSummary | null) => void;
  handleExcelImport: (fileData: ArrayBuffer | Uint8Array, defaultTags?: string[]) => Promise<ImportSummary>;

  // Broadcasts
  currentBroadcastId: string | null;
  isBroadcasting: boolean;
  broadcastProgress: { sent: number; total: number; currentRecipient: string };
  startBroadcast: (broadcastData: {
    title: string;
    channel: 'whatsapp' | 'sms';
    targetType: 'all' | 'list';
    targetListId?: string;
    templateId?: string;
    messageBody: string;
    delaySeconds: number;
    scheduledAt?: string;
  }) => Promise<string>;
  cancelBroadcast: () => void;
  retryFailedLogs: (broadcastId: string) => Promise<void>;
  deleteBroadcast: (id: string) => Promise<void>;
  markOptedOut: (phoneOrId: string) => Promise<void>;
  simulateIncomingStop: (phoneOrId: string) => Promise<void>;

  // DB status
  isFirestoreConnected: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isDemoUser, setIsDemoUser] = useState<boolean>(true); // Default to demo user for immediate access
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [activeScreen, setActiveScreen] = useState<ScreenName>('dashboard');
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(true);

  // Core Data States
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const saved = localStorage.getItem('whatscast_contacts');
    return saved ? JSON.parse(saved) : INITIAL_CONTACTS;
  });

  const [lists, setLists] = useState<ContactList[]>(() => {
    const saved = localStorage.getItem('whatscast_lists');
    return saved ? JSON.parse(saved) : INITIAL_LISTS;
  });

  const [templates, setTemplates] = useState<MessageTemplate[]>(() => {
    const saved = localStorage.getItem('whatscast_templates');
    return saved ? JSON.parse(saved) : INITIAL_TEMPLATES;
  });

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>(() => {
    const saved = localStorage.getItem('whatscast_broadcasts');
    return saved ? JSON.parse(saved) : INITIAL_BROADCASTS;
  });

  const [logs, setLogs] = useState<BroadcastLog[]>(() => {
    const saved = localStorage.getItem('whatscast_logs');
    return saved ? JSON.parse(saved) : INITIAL_LOGS;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('whatscast_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [currentBroadcastId, setCurrentBroadcastId] = useState<string | null>(null);
  const [broadcastProgress, setBroadcastProgress] = useState<{
    sent: number;
    total: number;
    currentRecipient: string;
  }>({ sent: 0, total: 0, currentRecipient: '' });
  const [broadcastAbortController, setBroadcastAbortController] = useState<AbortController | null>(null);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('whatscast_contacts', JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem('whatscast_lists', JSON.stringify(lists));
  }, [lists]);

  useEffect(() => {
    localStorage.setItem('whatscast_templates', JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem('whatscast_broadcasts', JSON.stringify(broadcasts));
  }, [broadcasts]);

  useEffect(() => {
    localStorage.setItem('whatscast_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem('whatscast_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth observer
  useEffect(() => {
    testConnection().then((connected) => setIsFirestoreConnected(connected));

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setIsAuthLoading(false);
      if (firebaseUser) {
        setUser(firebaseUser);
        setIsDemoUser(false);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore if authenticated
  useEffect(() => {
    if (!user || isDemoUser) return;

    const userId = user.uid;

    // Contacts listener
    const contactsQuery = query(collection(db, 'contacts'), where('userId', '==', userId));
    const unsubContacts = onSnapshot(
      contactsQuery,
      (snapshot) => {
        const loaded: Contact[] = [];
        snapshot.forEach((doc) => loaded.push(doc.data() as Contact));
        if (loaded.length > 0) setContacts(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contacts');
      }
    );

    // Lists listener
    const listsQuery = query(collection(db, 'contactLists'), where('userId', '==', userId));
    const unsubLists = onSnapshot(
      listsQuery,
      (snapshot) => {
        const loaded: ContactList[] = [];
        snapshot.forEach((doc) => loaded.push(doc.data() as ContactList));
        if (loaded.length > 0) setLists(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'contactLists');
      }
    );

    // Templates listener
    const tplQuery = query(collection(db, 'templates'), where('userId', '==', userId));
    const unsubTpl = onSnapshot(
      tplQuery,
      (snapshot) => {
        const loaded: MessageTemplate[] = [];
        snapshot.forEach((doc) => loaded.push(doc.data() as MessageTemplate));
        if (loaded.length > 0) setTemplates(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'templates');
      }
    );

    // Broadcasts listener
    const bcastQuery = query(collection(db, 'broadcasts'), where('userId', '==', userId));
    const unsubBcast = onSnapshot(
      bcastQuery,
      (snapshot) => {
        const loaded: Broadcast[] = [];
        snapshot.forEach((doc) => loaded.push(doc.data() as Broadcast));
        if (loaded.length > 0) setBroadcasts(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'broadcasts');
      }
    );

    // Logs listener
    const logsQuery = query(collection(db, 'broadcastLogs'), where('userId', '==', userId));
    const unsubLogs = onSnapshot(
      logsQuery,
      (snapshot) => {
        const loaded: BroadcastLog[] = [];
        snapshot.forEach((doc) => loaded.push(doc.data() as BroadcastLog));
        if (loaded.length > 0) setLogs(loaded);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'broadcastLogs');
      }
    );

    return () => {
      unsubContacts();
      unsubLists();
      unsubTpl();
      unsubBcast();
      unsubLogs();
    };
  }, [user, isDemoUser]);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      setUser(result.user);
      setIsDemoUser(false);
      setActiveScreen('dashboard');

      // Sync user profile to Firestore
      try {
        await setDoc(
          doc(db, 'users', result.user.uid),
          {
            uid: result.user.uid,
            email: result.user.email || '',
            displayName: result.user.displayName || 'Marketer',
            photoURL: result.user.photoURL || '',
            defaultCountryCode: '91',
            createdAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (e) {
        console.warn('Profile save warning (will work in offline):', e);
      }
    } catch (error) {
      console.error('Google Sign In error:', error);
      // Fallback seamlessly to demo user if popup blocked in iframe
      setIsDemoUser(true);
      setActiveScreen('dashboard');
    }
  };

  const loginAsDemo = () => {
    setIsDemoUser(true);
    setUser(null);
    setActiveScreen('dashboard');
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.error(e);
    }
    setUser(null);
    setIsDemoUser(false);
    setActiveScreen('login');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // CONTACT ACTIONS
  const addContacts = async (newContacts: Contact[]) => {
    setContacts((prev) => [...prev, ...newContacts]);

    if (user && !isDemoUser) {
      for (const contact of newContacts) {
        try {
          await setDoc(doc(db, 'contacts', contact.id), contact);
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `contacts/${contact.id}`);
        }
      }
    }
  };

  const addSingleContact = async (contactData: Omit<Contact, 'id' | 'userId' | 'createdAt'>) => {
    const currentUserId = user?.uid || 'demo_user';
    const newContact: Contact = {
      ...contactData,
      id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
    };
    await addContacts([newContact]);
  };

  const updateContact = async (id: string, updates: Partial<Contact>) => {
    setContacts((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));

    if (user && !isDemoUser) {
      try {
        await updateDoc(doc(db, 'contacts', id), updates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `contacts/${id}`);
      }
    }
  };

  const deleteContact = async (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));

    if (user && !isDemoUser) {
      try {
        await deleteDoc(doc(db, 'contacts', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `contacts/${id}`);
      }
    }
  };

  const deleteMultipleContacts = async (ids: string[]) => {
    const idSet = new Set(ids);
    setContacts((prev) => prev.filter((c) => !idSet.has(c.id)));

    if (user && !isDemoUser) {
      for (const id of ids) {
        try {
          await deleteDoc(doc(db, 'contacts', id));
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  // LIST ACTIONS
  const createList = async (name: string, description: string, color: string) => {
    const currentUserId = user?.uid || 'demo_user';
    const newList: ContactList = {
      id: `list_${Date.now()}`,
      userId: currentUserId,
      name,
      description,
      color,
      createdAt: new Date().toISOString(),
      contactCount: 0,
    };

    setLists((prev) => [...prev, newList]);

    if (user && !isDemoUser) {
      try {
        await setDoc(doc(db, 'contactLists', newList.id), newList);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `contactLists/${newList.id}`);
      }
    }
  };

  const updateList = async (id: string, updates: Partial<ContactList>) => {
    setLists((prev) => prev.map((l) => (l.id === id ? { ...l, ...updates } : l)));

    if (user && !isDemoUser) {
      try {
        await updateDoc(doc(db, 'contactLists', id), updates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `contactLists/${id}`);
      }
    }
  };

  const deleteList = async (id: string) => {
    setLists((prev) => prev.filter((l) => l.id !== id));
    // Remove list from contacts
    setContacts((prev) =>
      prev.map((c) => ({
        ...c,
        listIds: c.listIds.filter((lid) => lid !== id),
      }))
    );

    if (user && !isDemoUser) {
      try {
        await deleteDoc(doc(db, 'contactLists', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `contactLists/${id}`);
      }
    }
  };

  // TEMPLATE ACTIONS
  const createTemplate = async (
    tplData: Omit<MessageTemplate, 'id' | 'userId' | 'createdAt'>
  ) => {
    const currentUserId = user?.uid || 'demo_user';
    const newTpl: MessageTemplate = {
      ...tplData,
      id: `tpl_${Date.now()}`,
      userId: currentUserId,
      createdAt: new Date().toISOString(),
    };

    setTemplates((prev) => [newTpl, ...prev]);

    if (user && !isDemoUser) {
      try {
        await setDoc(doc(db, 'templates', newTpl.id), newTpl);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, `templates/${newTpl.id}`);
      }
    }
  };

  const updateTemplate = async (id: string, updates: Partial<MessageTemplate>) => {
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));

    if (user && !isDemoUser) {
      try {
        await updateDoc(doc(db, 'templates', id), updates);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `templates/${id}`);
      }
    }
  };

  const deleteTemplate = async (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));

    if (user && !isDemoUser) {
      try {
        await deleteDoc(doc(db, 'templates', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `templates/${id}`);
      }
    }
  };

  // EXCEL IMPORT WITH DEDUPLICATION & VALIDATION (Step 6)
  const handleExcelImport = async (
    fileData: ArrayBuffer | Uint8Array,
    defaultTags: string[] = ['Excel Import']
  ): Promise<ImportSummary> => {
    const currentUserId = user?.uid || 'demo_user';
    const existingPhones = new Set(contacts.map((c) => c.fullPhone));

    const { validContacts, summary } = await parseExcelOrCSV(
      fileData,
      currentUserId,
      existingPhones,
      settings.defaultCountryCode,
      defaultTags
    );

    if (validContacts.length > 0) {
      await addContacts(validContacts);
    }

    setImportSummary(summary);
    return summary;
  };

  // BROADCAST DISPATCHER WITH ANTI-BAN RATE LIMITING
  const startBroadcast = async (broadcastData: {
    title: string;
    channel: 'whatsapp' | 'sms';
    targetType: 'all' | 'list';
    targetListId?: string;
    templateId?: string;
    messageBody: string;
    delaySeconds: number;
    scheduledAt?: string;
  }): Promise<string> => {
    const currentUserId = user?.uid || 'demo_user';
    const broadcastId = `bcast_${Date.now()}`;

    // Filter recipients - strictly exclude opted-out contacts (Step 14)
    let recipients: Contact[] = [];
    if (broadcastData.targetType === 'list' && broadcastData.targetListId) {
      recipients = contacts.filter((c) => c.listIds.includes(broadcastData.targetListId!) && !c.isOptedOut);
    } else {
      recipients = contacts.filter((c) => !c.isOptedOut);
    }

    if (recipients.length === 0) {
      throw new Error('No active recipients found. (Opted-out contacts with STOP are skipped).');
    }

    const newBroadcast: Broadcast = {
      id: broadcastId,
      userId: currentUserId,
      title: broadcastData.title,
      channel: broadcastData.channel,
      targetType: broadcastData.targetType,
      targetListId: broadcastData.targetListId,
      templateId: broadcastData.templateId,
      messageBody: broadcastData.messageBody,
      status: broadcastData.scheduledAt ? 'scheduled' : 'running',
      totalCount: recipients.length,
      sentCount: 0,
      deliveredCount: 0,
      failedCount: 0,
      delaySeconds: broadcastData.delaySeconds || settings.delayBetweenMessages,
      scheduledAt: broadcastData.scheduledAt,
      createdAt: new Date().toISOString(),
    };

    setBroadcasts((prev) => [newBroadcast, ...prev]);
    setCurrentBroadcastId(broadcastId);

    if (broadcastData.scheduledAt) {
      // It's scheduled, don't execute immediately
      return broadcastId;
    }

    // Execute Live Broadcast Dispatch
    setIsBroadcasting(true);
    const abortController = new AbortController();
    setBroadcastAbortController(abortController);

    // Run async dispatch
    (async () => {
      let sent = 0;
      let delivered = 0;
      let failed = 0;

      for (let i = 0; i < recipients.length; i++) {
        if (abortController.signal.aborted) {
          break;
        }

        const recipient = recipients[i];
        setBroadcastProgress({
          sent: i + 1,
          total: recipients.length,
          currentRecipient: `${recipient.name} (${recipient.fullPhone})`,
        });

        // Anti-ban delay simulation
        const delayMs = (broadcastData.delaySeconds || 2) * 1000;
        await new Promise((r) => setTimeout(r, Math.max(800, delayMs)));

        // Interpolate variables
        let renderedMessage = broadcastData.messageBody
          .replace(/{{name}}/gi, recipient.name)
          .replace(/{{phone}}/gi, recipient.fullPhone)
          .replace(/{{company}}/gi, recipient.company || 'your organization');

        // Simulate 95% delivery success
        const isSuccess = Math.random() > 0.05;

        const newLog: BroadcastLog = {
          id: `log_${Date.now()}_${i}`,
          broadcastId,
          userId: currentUserId,
          recipientName: recipient.name,
          phone: recipient.fullPhone,
          status: isSuccess ? 'delivered' : 'failed',
          sentAt: new Date().toISOString(),
          messagePreview: renderedMessage.slice(0, 120),
          error: isSuccess ? undefined : 'Delivery timeout / recipient unavailable',
        };

        if (isSuccess) {
          sent++;
          delivered++;
        } else {
          failed++;
        }

        setLogs((prev) => [newLog, ...prev]);

        // Update broadcast live counts
        setBroadcasts((prev) =>
          prev.map((b) =>
            b.id === broadcastId
              ? {
                  ...b,
                  sentCount: sent,
                  deliveredCount: delivered,
                  failedCount: failed,
                }
              : b
          )
        );
      }

      // Mark completed
      const isAborted = abortController.signal.aborted;
      setBroadcasts((prev) =>
        prev.map((b) =>
          b.id === broadcastId
            ? {
                ...b,
                status: isAborted ? 'paused' : 'completed',
                completedAt: new Date().toISOString(),
              }
            : b
        )
      );

      setIsBroadcasting(false);
      setBroadcastAbortController(null);
    })();

    return broadcastId;
  };

  const cancelBroadcast = () => {
    if (broadcastAbortController) {
      broadcastAbortController.abort();
    }
    setIsBroadcasting(false);
    if (currentBroadcastId) {
      setBroadcasts((prev) =>
        prev.map((b) => (b.id === currentBroadcastId ? { ...b, status: 'paused' } : b))
      );
    }
  };

  const retryFailedLogs = async (broadcastId: string) => {
    const failedLogs = logs.filter((l) => l.broadcastId === broadcastId && l.status === 'failed');
    if (failedLogs.length === 0) return;

    for (const log of failedLogs) {
      await new Promise((r) => setTimeout(r, 600));
      setLogs((prev) =>
        prev.map((l) =>
          l.id === log.id
            ? {
                ...l,
                status: 'delivered',
                sentAt: new Date().toISOString(),
                error: undefined,
              }
            : l
        )
      );
    }

    setBroadcasts((prev) =>
      prev.map((b) =>
        b.id === broadcastId
          ? {
              ...b,
              deliveredCount: b.deliveredCount + failedLogs.length,
              failedCount: Math.max(0, b.failedCount - failedLogs.length),
            }
          : b
      )
    );
  };

  const deleteBroadcast = async (id: string) => {
    setBroadcasts((prev) => prev.filter((b) => b.id !== id));
    setLogs((prev) => prev.filter((l) => l.broadcastId !== id));

    if (user && !isDemoUser) {
      try {
        await deleteDoc(doc(db, 'broadcasts', id));
      } catch (error) {
        console.error(error);
      }
    }
  };

  const markOptedOut = async (phoneOrId: string) => {
    setContacts((prev) =>
      prev.map((c) =>
        c.id === phoneOrId || c.fullPhone === phoneOrId || c.phone === phoneOrId
          ? {
              ...c,
              isOptedOut: true,
              optedOutAt: new Date().toISOString(),
              tags: c.tags.includes('Opted-Out') ? c.tags : [...c.tags, 'Opted-Out'],
            }
          : c
      )
    );
  };

  const simulateIncomingStop = async (phoneOrId: string) => {
    await markOptedOut(phoneOrId);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isDemoUser,
        isAuthLoading,
        activeScreen,
        setActiveScreen,
        loginWithGoogle,
        loginAsDemo,
        logout,
        contacts,
        lists,
        templates,
        broadcasts,
        logs,
        settings,
        updateSettings,
        addContacts,
        addSingleContact,
        updateContact,
        deleteContact,
        deleteMultipleContacts,
        createList,
        updateList,
        deleteList,
        createTemplate,
        updateTemplate,
        deleteTemplate,
        importSummary,
        setImportSummary,
        handleExcelImport,
        currentBroadcastId,
        isBroadcasting,
        broadcastProgress,
        startBroadcast,
        cancelBroadcast,
        retryFailedLogs,
        deleteBroadcast,
        markOptedOut,
        simulateIncomingStop,
        isFirestoreConnected,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
