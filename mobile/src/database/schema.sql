-- Alarms table for storing alarm configurations
CREATE TABLE IF NOT EXISTS alarms (
  id TEXT PRIMARY KEY NOT NULL,
  label TEXT NOT NULL,
  time TEXT NOT NULL,
  enabled INTEGER NOT NULL DEFAULT 1,
  repeat_days TEXT NOT NULL, -- JSON array of day numbers
  tone_uri TEXT,
  tone_name TEXT NOT NULL,
  volume INTEGER NOT NULL DEFAULT 80,
  vibrate INTEGER NOT NULL DEFAULT 1,
  snooze_minutes INTEGER NOT NULL DEFAULT 5,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- Alarm instances for tracking individual alarm occurrences
CREATE TABLE IF NOT EXISTS alarm_instances (
  id TEXT PRIMARY KEY NOT NULL,
  alarm_id TEXT NOT NULL,
  scheduled_time INTEGER NOT NULL,
  triggered INTEGER NOT NULL DEFAULT 0,
  snoozed INTEGER NOT NULL DEFAULT 0,
  dismissed INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (alarm_id) REFERENCES alarms(id) ON DELETE CASCADE
);

-- Custom tones for user-imported audio files
CREATE TABLE IF NOT EXISTS custom_tones (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  uri TEXT NOT NULL UNIQUE,
  duration INTEGER NOT NULL,
  file_size INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

-- Cloud sync metadata (for optional backup)
CREATE TABLE IF NOT EXISTS sync_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL, -- 'alarm', 'tone', etc.
  entity_id TEXT NOT NULL,
  last_synced INTEGER,
  sync_version INTEGER NOT NULL DEFAULT 1,
  UNIQUE(entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_alarms_enabled ON alarms(enabled);
CREATE INDEX IF NOT EXISTS idx_alarm_instances_alarm_id ON alarm_instances(alarm_id);
CREATE INDEX IF NOT EXISTS idx_alarm_instances_scheduled_time ON alarm_instances(scheduled_time);
