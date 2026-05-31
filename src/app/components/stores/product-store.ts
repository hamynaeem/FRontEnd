import { Observable, of, throwError } from 'rxjs';

export interface ProductSpecs {
  ram?: string;
  rom?: string;
  battery?: string;
  display?: string;
  camera?: string;
  processor?: string;
}

export interface Product {
  id: number;
  name: string;
  title?: string;
  slug?: string;
  subtitle?: string;
  price: number;
  old_price?: number;
  rating?: number;
  status?: string;
  category?: string;
  description?: string;
  image?: string;
  available?: boolean;
  specs?: ProductSpecs;
  created_at?: string;
  updated_at?: string;
}

export interface ProductPayload {
  name: string;
  price: number;
  category?: string;
  description?: string;
  image?: string;
  specs?: ProductSpecs;
}

const STORAGE_KEY = 'app_products_v1';
const NEXT_ID_KEY = 'app_products_next_id_v1';

function ensureInit() {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    localStorage.setItem(NEXT_ID_KEY, '1');
  }
}

function readAll(): Product[] {
  ensureInit();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') as Product[];
  } catch (e) {
    console.error('Failed to parse products from localStorage', e);
    return [];
  }
}

function writeAll(items: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function getNextId(): number {
  const raw = localStorage.getItem(NEXT_ID_KEY);
  let id = raw ? Number(raw) : Date.now();
  if (!id || isNaN(id)) id = Date.now();
  localStorage.setItem(NEXT_ID_KEY, String(id + 1));
  return id;
}

export function getProducts(): Observable<Product[]> {
  return of(readAll());
}

export function createProduct(payload: ProductPayload): Observable<Product> {
  const items = readAll();
  const id = getNextId();
  const now = new Date().toISOString();
  const product: Product = {
    id,
    name: payload.name,
    price: payload.price,
    category: payload.category,
    description: payload.description,
    image: payload.image,
    specs: payload.specs,
    created_at: now,
    updated_at: now,
    available: true
  };
  items.unshift(product);
  writeAll(items);
  return of(product);
}

export function updateProduct(id: number, payload: ProductPayload): Observable<Product> {
  const items = readAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return throwError(() => new Error('Product not found'));
  const updated: Product = {
    ...items[idx],
    name: payload.name,
    price: payload.price,
    category: payload.category,
    description: payload.description,
    image: payload.image,
    specs: payload.specs,
    updated_at: new Date().toISOString(),
  };
  items[idx] = updated;
  writeAll(items);
  return of(updated);
}

export function deleteProduct(id: number): Observable<any> {
  const items = readAll();
  const idx = items.findIndex((p) => p.id === id);
  if (idx === -1) return throwError(() => new Error('Product not found'));
  items.splice(idx, 1);
  writeAll(items);
  return of({ success: true });
}
