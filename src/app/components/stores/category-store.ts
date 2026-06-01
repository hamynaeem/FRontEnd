import { Observable, of, throwError, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Category {
  id: number;
  name: string;
  icon?: string;
  parent?: string;
  created_at?: string;
  updated_at?: string;
}

const STORAGE_KEY = 'app_categories_v1';
const NEXT_ID_KEY = 'app_categories_next_id_v1';

function ensureInit() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(NEXT_ID_KEY, '1');
  }
}

function readAll(): Category[] {
  ensureInit();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Category[];
  } catch (e) {
    console.error('Failed to parse categories from localStorage', e);
    return [];
  }
}

function writeAll(items: Category[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getNextId(): number {
  const raw = localStorage.getItem(NEXT_ID_KEY);
  let id = raw ? Number(raw) : Date.now();
  if (!id || isNaN(id)) id = Date.now();
  localStorage.setItem(NEXT_ID_KEY, String(id + 1));
  return id;
}

export function getCategories(): Observable<Category[]> {
  return of(readAll());
}

export function fetchCategories(): Observable<Category[]> {
  ensureInit();
  // If `useApi` is explicitly disabled in environment, return local store immediately
  if ((environment as any).useApi === false) {
    console.info('category-store: useApi disabled, returning local categories');
    return of(readAll());
  }

  const base = environment && (environment as any).apiBaseUrl;
  if (!base) {
    return of(readAll());
  }

  const url = `${base.replace(/\/$/, '')}/categories`;
  return from(fetch(url).then(async (res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) return data as Category[];
    if (data && Array.isArray((data as any).data)) return (data as any).data as Category[];
    return readAll();
  })).pipe(
    catchError((err) => {
      console.warn('fetchCategories failed, falling back to local store', err);
      return of(readAll());
    })
  );
}

export function createCategory(payload: { name: string; icon?: string; parent?: string }): Observable<Category> {
  const items = readAll();
  const id = getNextId();
  const now = new Date().toISOString();
  const newCat: Category = {
    id,
    name: payload.name,
    icon: payload.icon,
    parent: payload.parent,
    created_at: now,
    updated_at: now,
  };
  items.unshift(newCat);
  writeAll(items);
  return of(newCat);
}

export function updateCategory(id: number, payload: { name: string; icon?: string; parent?: string }): Observable<Category> {
  const items = readAll();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return throwError(() => new Error('Category not found'));
  const updated: Category = {
    ...items[idx],
    name: payload.name,
    icon: payload.icon,
    parent: payload.parent,
    updated_at: new Date().toISOString(),
  };
  items[idx] = updated;
  writeAll(items);
  return of(updated);
}

export function deleteCategory(id: number): Observable<any> {
  const items = readAll();
  const idx = items.findIndex((c) => c.id === id);
  if (idx === -1) return throwError(() => new Error('Category not found'));
  items.splice(idx, 1);
  writeAll(items);
  return of({ success: true });
}
