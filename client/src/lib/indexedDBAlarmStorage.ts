// IndexedDB-based alarm storage for robust offline capability
// This provides smartphone-level reliability for web alarms

const DB_NAME = 'TrisandhyaAlarms';
const DB_VERSION = 2;
const ALARMS_STORE = 'alarms';
const TONES_STORE = 'customTones';
const INSTANCES_STORE = 'alarmInstances';

export interface IndexedDBAlarm {
  id: string;
  label: string;
  time: string; // HH:MM format
  enabled: boolean;
  repeatDays: number[]; // 0-6 (Sunday-Saturday)
  toneId: string | null;
  toneName: string;
  volume: number; // 0-100
  vibrate: boolean;
  snoozeMinutes: number;
  fadeInDuration: number; // Fade-in duration in seconds (0 = disabled)
  enablePreAlarm: boolean; // Enable gentle alarm before main alarm
  preAlarmMinutes: number; // Minutes before main alarm (default 30)
  createdAt: number;
  updatedAt: number;
}

export interface CustomTone {
  id: string;
  name: string;
  dataUrl: string; // base64 encoded audio
  duration: number | null;
  fileSize: number;
  mimeType: string;
  createdAt: number;
}

export interface AlarmInstance {
  id: string;
  alarmId: string;
  scheduledTime: number; // Unix timestamp
  triggered: boolean;
  snoozed: boolean;
  dismissed: boolean;
}

class IndexedDBAlarmStorage {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create alarms store
        if (!db.objectStoreNames.contains(ALARMS_STORE)) {
          const alarmStore = db.createObjectStore(ALARMS_STORE, { keyPath: 'id' });
          alarmStore.createIndex('enabled', 'enabled', { unique: false });
          alarmStore.createIndex('time', 'time', { unique: false });
        }

        // Create custom tones store
        if (!db.objectStoreNames.contains(TONES_STORE)) {
          db.createObjectStore(TONES_STORE, { keyPath: 'id' });
        }

        // Create alarm instances store
        if (!db.objectStoreNames.contains(INSTANCES_STORE)) {
          const instanceStore = db.createObjectStore(INSTANCES_STORE, { keyPath: 'id' });
          instanceStore.createIndex('alarmId', 'alarmId', { unique: false });
          instanceStore.createIndex('scheduledTime', 'scheduledTime', { unique: false });
        }
      };
    });
  }

  private async ensureDB(): Promise<IDBDatabase> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    return this.db;
  }

  // Alarm CRUD operations
  async createAlarm(alarm: Omit<IndexedDBAlarm, 'id' | 'createdAt' | 'updatedAt'>): Promise<IndexedDBAlarm> {
    const db = await this.ensureDB();
    const now = Date.now();
    const newAlarm: IndexedDBAlarm = {
      ...alarm,
      id: `alarm_${now}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: now,
      updatedAt: now,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ALARMS_STORE], 'readwrite');
      const store = transaction.objectStore(ALARMS_STORE);
      const request = store.add(newAlarm);

      request.onsuccess = () => resolve(newAlarm);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAlarm(id: string, updates: Partial<IndexedDBAlarm>): Promise<void> {
    const db = await this.ensureDB();
    const alarm = await this.getAlarm(id);
    if (!alarm) throw new Error('Alarm not found');

    const updatedAlarm = {
      ...alarm,
      ...updates,
      id: alarm.id,
      createdAt: alarm.createdAt,
      updatedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ALARMS_STORE], 'readwrite');
      const store = transaction.objectStore(ALARMS_STORE);
      const request = store.put(updatedAlarm);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteAlarm(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ALARMS_STORE], 'readwrite');
      const store = transaction.objectStore(ALARMS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAlarm(id: string): Promise<IndexedDBAlarm | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ALARMS_STORE], 'readonly');
      const store = transaction.objectStore(ALARMS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllAlarms(): Promise<IndexedDBAlarm[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ALARMS_STORE], 'readonly');
      const store = transaction.objectStore(ALARMS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getEnabledAlarms(): Promise<IndexedDBAlarm[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ALARMS_STORE], 'readonly');
      const store = transaction.objectStore(ALARMS_STORE);
      const index = store.index('enabled');
      const request = index.getAll(IDBKeyRange.only(true));

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Custom Tone operations
  async addCustomTone(tone: Omit<CustomTone, 'id' | 'createdAt'>): Promise<CustomTone> {
    const db = await this.ensureDB();
    const newTone: CustomTone = {
      ...tone,
      id: `tone_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      createdAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TONES_STORE], 'readwrite');
      const store = transaction.objectStore(TONES_STORE);
      const request = store.add(newTone);

      request.onsuccess = () => resolve(newTone);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteCustomTone(id: string): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TONES_STORE], 'readwrite');
      const store = transaction.objectStore(TONES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllCustomTones(): Promise<CustomTone[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TONES_STORE], 'readonly');
      const store = transaction.objectStore(TONES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  async getCustomTone(id: string): Promise<CustomTone | null> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([TONES_STORE], 'readonly');
      const store = transaction.objectStore(TONES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  // Alarm Instance operations
  async createAlarmInstance(instance: Omit<AlarmInstance, 'id'>): Promise<AlarmInstance> {
    const db = await this.ensureDB();
    const newInstance: AlarmInstance = {
      ...instance,
      id: `instance_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INSTANCES_STORE], 'readwrite');
      const store = transaction.objectStore(INSTANCES_STORE);
      const request = store.add(newInstance);

      request.onsuccess = () => resolve(newInstance);
      request.onerror = () => reject(request.error);
    });
  }

  async updateAlarmInstance(id: string, updates: Partial<AlarmInstance>): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INSTANCES_STORE], 'readwrite');
      const store = transaction.objectStore(INSTANCES_STORE);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const instance = getRequest.result;
        if (!instance) {
          reject(new Error('Instance not found'));
          return;
        }

        const updated = { ...instance, ...updates };
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getAlarmInstances(alarmId: string): Promise<AlarmInstance[]> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([INSTANCES_STORE], 'readonly');
      const store = transaction.objectStore(INSTANCES_STORE);
      const index = store.index('alarmId');
      const request = index.getAll(alarmId);

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([ALARMS_STORE, TONES_STORE, INSTANCES_STORE], 'readwrite');
      
      const promises = [
        transaction.objectStore(ALARMS_STORE).clear(),
        transaction.objectStore(TONES_STORE).clear(),
        transaction.objectStore(INSTANCES_STORE).clear(),
      ];

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const indexedDBAlarmStorage = new IndexedDBAlarmStorage();
