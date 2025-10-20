import { AlarmSettings, AlarmSound } from "@shared/schema";

const ALARM_SETTINGS_KEY = "local_alarm_settings";
const ALARM_SOUNDS_KEY = "local_alarm_sounds";
const CUSTOM_SOUNDS_KEY = "custom_alarm_sounds";

export interface LocalAlarmSettings {
  pratahEnabled: boolean;
  pratahTime: string;
  madhyahnaEnabled: boolean;
  madhyahnaTime: string;
  sayamEnabled: boolean;
  sayamTime: string;
  alarmSoundId?: string;
  volume: number;
}

export interface CustomAlarmSound {
  id: string;
  name: string;
  dataUrl: string;
  duration?: number;
  fileSize: number;
  mimeType: string;
  isCustom: true;
}

// Default alarm sounds (embedded)
export const DEFAULT_ALARM_SOUNDS: AlarmSound[] = [
  {
    id: "default-bell",
    name: "Temple Bell",
    url: "", // Will use Web Audio API or embedded sound
    duration: 5,
    description: "Traditional temple bell sound",
    isDefault: true,
    fileSize: 0,
    mimeType: "audio/mpeg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-conch",
    name: "Conch Shell (Shankh)",
    url: "",
    duration: 8,
    description: "Sacred conch shell sound",
    isDefault: false,
    fileSize: 0,
    mimeType: "audio/mpeg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "default-om",
    name: "Om Chant",
    url: "",
    duration: 10,
    description: "Peaceful Om chant",
    isDefault: false,
    fileSize: 0,
    mimeType: "audio/mpeg",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Get alarm settings from localStorage
export function getLocalAlarmSettings(): LocalAlarmSettings {
  const stored = localStorage.getItem(ALARM_SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse alarm settings:", e);
    }
  }
  
  // Return default settings
  return {
    pratahEnabled: true,
    pratahTime: "05:30",
    madhyahnaEnabled: true,
    madhyahnaTime: "12:00",
    sayamEnabled: true,
    sayamTime: "18:00",
    alarmSoundId: "default-bell",
    volume: 80,
  };
}

// Save alarm settings to localStorage
export function saveLocalAlarmSettings(settings: LocalAlarmSettings): void {
  localStorage.setItem(ALARM_SETTINGS_KEY, JSON.stringify(settings));
}

// Get custom alarm sounds from localStorage
export function getCustomAlarmSounds(): CustomAlarmSound[] {
  const stored = localStorage.getItem(CUSTOM_SOUNDS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse custom sounds:", e);
      return [];
    }
  }
  return [];
}

// Save custom alarm sounds to localStorage
function saveCustomAlarmSounds(sounds: CustomAlarmSound[]): void {
  localStorage.setItem(CUSTOM_SOUNDS_KEY, JSON.stringify(sounds));
}

// Add a custom alarm sound
export async function addCustomAlarmSound(file: File): Promise<CustomAlarmSound> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const customSound: CustomAlarmSound = {
        id: `custom-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        dataUrl,
        fileSize: file.size,
        mimeType: file.type,
        isCustom: true,
      };
      
      const sounds = getCustomAlarmSounds();
      sounds.push(customSound);
      saveCustomAlarmSounds(sounds);
      resolve(customSound);
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
}

// Delete a custom alarm sound
export function deleteCustomAlarmSound(id: string): void {
  const sounds = getCustomAlarmSounds();
  const filtered = sounds.filter(s => s.id !== id);
  saveCustomAlarmSounds(filtered);
}

// Get all available alarm sounds (default + custom)
export function getAllAvailableAlarmSounds(): (AlarmSound | CustomAlarmSound)[] {
  return [...DEFAULT_ALARM_SOUNDS, ...getCustomAlarmSounds()];
}

// Get a specific alarm sound by ID
export function getAlarmSoundById(id: string): AlarmSound | CustomAlarmSound | undefined {
  const allSounds = getAllAvailableAlarmSounds();
  return allSounds.find(s => s.id === id);
}

// Sync with server (when online)
export async function syncAlarmSettingsWithServer(userId: string | undefined): Promise<void> {
  if (!userId) return;
  
  try {
    // Try to fetch from server
    const response = await fetch("/api/alarm-settings");
    if (response.ok) {
      const serverSettings = await response.json();
      // Merge with local settings (local takes precedence)
      const localSettings = getLocalAlarmSettings();
      saveLocalAlarmSettings(localSettings);
      
      // Optionally push local settings to server
      await fetch("/api/alarm-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(localSettings),
      });
    }
  } catch (error) {
    // Offline or error - continue using local storage
    console.log("Using offline alarm storage");
  }
}
