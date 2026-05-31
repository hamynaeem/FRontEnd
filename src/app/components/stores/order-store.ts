import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

export interface OrderItem {
  productId?: number;
  name: string;
  qty: number;
  price: number;
  image?: string;
}

export interface Order {
  id: number;
  orderNo: string;
  date: string; // ISO
  customer: { name: string; email?: string; phone?: string; address?: string };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  shippingMethod?: string;
  notes?: string;
}

const STORAGE_KEY = 'orders';

function sampleOrders(): Order[] {
  const now = new Date();
  return [
    {
      id: Date.now(),
      orderNo: `ORD-${now.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      date: now.toISOString(),
      customer: { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 555-0100', address: '123 Main St, Springfield' },
      items: [
        { productId: 1, name: 'Smartphone X', qty: 1, price: 599, image: '' },
        { productId: 2, name: 'Protective Case', qty: 1, price: 29 }
      ],
      total: 628,
      status: 'pending',
      paymentMethod: 'Card',
      shippingMethod: 'Standard',
      notes: 'Deliver between 9am-5pm'
    },
    {
      id: Date.now() + 1,
      orderNo: `ORD-${now.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      customer: { name: 'Bob Martin', email: 'bob@example.com', phone: '+1 555-0111', address: '45 Elm Ave, Rivertown' },
      items: [
        { productId: 3, name: 'Phone Charger', qty: 2, price: 19 }
      ],
      total: 38,
      status: 'shipped',
      paymentMethod: 'PayPal',
      shippingMethod: 'Express',
      notes: ''
    }
  ];
}

function readAll(): Order[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = sampleOrders();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as Order[];
  } catch (e) {
    console.error('Failed to read orders from localStorage', e);
    return [];
  }
}

function writeAll(items: Order[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to write orders to localStorage', e);
  }
}

const subject = new BehaviorSubject<Order[]>(readAll());

// listen for storage changes from other tabs/windows and update
if (typeof window !== 'undefined' && window.addEventListener) {
  window.addEventListener('storage', (ev: StorageEvent) => {
    if (ev.key === STORAGE_KEY) {
      try {
        const data = ev.newValue ? (JSON.parse(ev.newValue) as Order[]) : [];
        subject.next(data);
      } catch (e) {
        // ignore parse errors
      }
    }
  });
}

export function observeOrders(): Observable<Order[]> {
  return subject.asObservable();
}

export function getOrdersSnapshot(): Order[] {
  return subject.getValue();
}

function persistAndEmit(items: Order[]) {
  writeAll(items);
  subject.next(items);
}

export function addOrder(order: Omit<Order, 'id' | 'orderNo' | 'date'>): Observable<Order> {
  const items = readAll();
  const id = Date.now();
  const now = new Date().toISOString();
  const newOrder: Order = {
    id,
    orderNo: `ORD-${new Date().getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`,
    date: now,
    ...order
  } as Order;
  items.unshift(newOrder);
  persistAndEmit(items);
  return of(newOrder);
}

export function updateOrder(id: number, patch: Partial<Order>): Observable<Order> {
  const items = readAll();
  const idx = items.findIndex((o) => o.id === id);
  if (idx === -1) return throwError(() => new Error('Order not found'));
  const updated: Order = { ...items[idx], ...patch, updated_at: new Date().toISOString() } as Order;
  items[idx] = updated;
  persistAndEmit(items);
  return of(updated);
}

export function deleteOrder(id: number): Observable<any> {
  const items = readAll();
  const idx = items.findIndex((o) => o.id === id);
  if (idx === -1) return throwError(() => new Error('Order not found'));
  items.splice(idx, 1);
  persistAndEmit(items);
  return of({ success: true });
}

export function restoreOrder(order: Order, index?: number): Observable<Order> {
  const items = readAll();
  if (typeof index === 'number' && index >= 0 && index <= items.length) {
    items.splice(index, 0, order);
  } else {
    items.unshift(order);
  }
  persistAndEmit(items);
  return of(order);
}
