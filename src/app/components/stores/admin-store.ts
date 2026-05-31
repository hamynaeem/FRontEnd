import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

export interface AdminSettings {
  name: string;
  email: string;
  avatar?: string;
  storeName?: string;
  phone?: string;
  city?: string;
  country?: string;
  theme?: 'light' | 'dark';
  notifications?: boolean;
  maintenanceMode?: boolean;
  passwordHash?: string;
  updated_at?: string;
}

const STORAGE_KEY = 'admin_settings_v1';

function defaultSettings(): AdminSettings {
  return {
    name: 'Administrator',
    email: 'admin@example.com',
    storeName: 'My Store',
    phone: '',
    city: '',
    country: '',
    avatar: '',
    theme: 'light',
    notifications: true,
    maintenanceMode: false,
    passwordHash: btoa('admin123'), // default password: admin123 (development only)
    updated_at: new Date().toISOString(),
  };
}

function readSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const s = defaultSettings();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
      return s;
    }
    return JSON.parse(raw) as AdminSettings;
  } catch (e) {
    console.error('Failed to read admin settings', e);
    const s = defaultSettings();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }
}

function writeSettings(s: AdminSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.error('Failed to write admin settings', e);
  }
}

const subject = new BehaviorSubject<AdminSettings>(readSettings());

export function observeAdminSettings(): Observable<AdminSettings> {
  return subject.asObservable();
}

export function getAdminSettingsSnapshot(): AdminSettings {
  return subject.getValue();
}

function persistAndEmit(s: AdminSettings) {
  s.updated_at = new Date().toISOString();
  writeSettings(s);
  subject.next(s);
}

export function updateAdminSettings(patch: Partial<AdminSettings>): Observable<AdminSettings> {
  const cur = readSettings();
  const updated: AdminSettings = { ...cur, ...patch, updated_at: new Date().toISOString() };
  persistAndEmit(updated);
  return of(updated);
}

export function changeAdminPassword(oldPass: string, newPass: string): Observable<boolean> {
  const cur = readSettings();
  const expected = cur.passwordHash || '';
  if (btoa(oldPass) !== expected) return throwError(() => new Error('Incorrect current password'));
  const next = { ...cur, passwordHash: btoa(newPass), updated_at: new Date().toISOString() };
  persistAndEmit(next);
  return of(true);
}

// Keep admin settings in sync across browser tabs/windows.
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', (e: StorageEvent) => {
    if (!e || e.key !== STORAGE_KEY) return;
    try {
      if (!e.newValue) return;
      const parsed = JSON.parse(e.newValue) as AdminSettings;
      const current = subject.getValue();
      // Emit only if different to avoid extra notifications
      if (JSON.stringify(current) !== JSON.stringify(parsed)) {
        subject.next(parsed);
      }
    } catch (err) {
      console.error('Failed to parse admin settings from storage event', err);
    }
  });
}
