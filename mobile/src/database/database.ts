import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import type { Alarm, AlarmInstance, CustomTone } from '../types/alarm';

const DB_NAME = 'trisandhya_alarms.db';

class Database {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync(DB_NAME);
      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables() {
    if (!this.db) throw new Error('Database not initialized');

    const schema = `
      CREATE TABLE IF NOT EXISTS alarms (
        id TEXT PRIMARY KEY NOT NULL,
        label TEXT NOT NULL,
        time TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        repeat_days TEXT NOT NULL,
        tone_uri TEXT,
        tone_name TEXT NOT NULL,
        volume INTEGER NOT NULL DEFAULT 80,
        vibrate INTEGER NOT NULL DEFAULT 1,
        snooze_minutes INTEGER NOT NULL DEFAULT 5,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS alarm_instances (
        id TEXT PRIMARY KEY NOT NULL,
        alarm_id TEXT NOT NULL,
        scheduled_time INTEGER NOT NULL,
        triggered INTEGER NOT NULL DEFAULT 0,
        snoozed INTEGER NOT NULL DEFAULT 0,
        dismissed INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (alarm_id) REFERENCES alarms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS custom_tones (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        uri TEXT NOT NULL UNIQUE,
        duration INTEGER NOT NULL,
        file_size INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_alarms_enabled ON alarms(enabled);
      CREATE INDEX IF NOT EXISTS idx_alarm_instances_alarm_id ON alarm_instances(alarm_id);
    `;

    await this.db.execAsync(schema);
  }

  // Alarm CRUD operations
  async createAlarm(alarm: Omit<Alarm, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alarm> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `alarm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const newAlarm: Alarm = {
      ...alarm,
      id,
      createdAt: now,
      updatedAt: now,
    };

    await this.db.runAsync(
      `INSERT INTO alarms (id, label, time, enabled, repeat_days, tone_uri, tone_name, volume, vibrate, snooze_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newAlarm.id,
        newAlarm.label,
        newAlarm.time,
        newAlarm.enabled ? 1 : 0,
        JSON.stringify(newAlarm.repeatDays),
        newAlarm.toneUri,
        newAlarm.toneName,
        newAlarm.volume,
        newAlarm.vibrate ? 1 : 0,
        newAlarm.snoozeMinutes,
        newAlarm.createdAt,
        newAlarm.updatedAt,
      ]
    );

    return newAlarm;
  }

  async updateAlarm(id: string, updates: Partial<Alarm>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const fields: string[] = [];
    const values: any[] = [];

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'id' || key === 'createdAt') return;
      
      const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      fields.push(`${dbKey} = ?`);
      
      if (key === 'repeatDays') {
        values.push(JSON.stringify(value));
      } else if (typeof value === 'boolean') {
        values.push(value ? 1 : 0);
      } else {
        values.push(value);
      }
    });

    fields.push('updated_at = ?');
    values.push(Date.now());
    values.push(id);

    await this.db.runAsync(
      `UPDATE alarms SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
  }

  async deleteAlarm(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM alarms WHERE id = ?', [id]);
  }

  async getAlarm(id: string): Promise<Alarm | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.getFirstAsync<any>(
      'SELECT * FROM alarms WHERE id = ?',
      [id]
    );

    return result ? this.mapRowToAlarm(result) : null;
  }

  async getAllAlarms(): Promise<Alarm[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const results = await this.db.getAllAsync<any>('SELECT * FROM alarms ORDER BY time ASC');
    return results.map(row => this.mapRowToAlarm(row));
  }

  async getEnabledAlarms(): Promise<Alarm[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM alarms WHERE enabled = 1 ORDER BY time ASC'
    );
    return results.map(row => this.mapRowToAlarm(row));
  }

  // Custom tone operations
  async addCustomTone(tone: Omit<CustomTone, 'id' | 'createdAt'>): Promise<CustomTone> {
    if (!this.db) throw new Error('Database not initialized');

    const id = `tone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const now = Date.now();
    const newTone: CustomTone = { ...tone, id, createdAt: now };

    await this.db.runAsync(
      `INSERT INTO custom_tones (id, name, uri, duration, file_size, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [newTone.id, newTone.name, newTone.uri, newTone.duration, newTone.fileSize, newTone.createdAt]
    );

    return newTone;
  }

  async getAllCustomTones(): Promise<CustomTone[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const results = await this.db.getAllAsync<any>(
      'SELECT * FROM custom_tones ORDER BY created_at DESC'
    );
    return results.map(row => ({
      id: row.id,
      name: row.name,
      uri: row.uri,
      duration: row.duration,
      fileSize: row.file_size,
      createdAt: row.created_at,
    }));
  }

  async deleteCustomTone(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    // Get the tone to delete the file
    const tone = await this.db.getFirstAsync<any>(
      'SELECT uri FROM custom_tones WHERE id = ?',
      [id]
    );
    
    if (tone?.uri) {
      try {
        await FileSystem.deleteAsync(tone.uri, { idempotent: true });
      } catch (error) {
        console.error('Failed to delete tone file:', error);
      }
    }
    
    await this.db.runAsync('DELETE FROM custom_tones WHERE id = ?', [id]);
  }

  // Helper method to map database row to Alarm object
  private mapRowToAlarm(row: any): Alarm {
    return {
      id: row.id,
      label: row.label,
      time: row.time,
      enabled: row.enabled === 1,
      repeatDays: JSON.parse(row.repeat_days || '[]'),
      toneUri: row.tone_uri,
      toneName: row.tone_name,
      volume: row.volume,
      vibrate: row.vibrate === 1,
      snoozeMinutes: row.snooze_minutes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async close() {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}

export const database = new Database();
