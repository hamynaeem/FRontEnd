import { Subject } from 'rxjs';
import { CartItem } from './cart.service';

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderUpdate { status: OrderStatus; date: string }

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  address?: {
    name: string;
    phone?: string;
    address: string;
    city?: string;
    province?: string;
    country?: string;
  };
  paymentMethod: 'credit' | 'cod';
  status: OrderStatus;
  updates: OrderUpdate[];
  createdAt: string;
}

const STORAGE_KEY = 'orders_v1';

export const OrderService = {
  changes: new Subject<Order[]>(),

  get(): Order[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as Order[];
    } catch {
      return [];
    }
  },

  save(items: Order[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    try { this.changes.next(items); } catch {}
  },

  add(order: Order) {
    const items = OrderService.get();
    items.push(order);
    OrderService.save(items);
  },

  updateStatus(id: string, status: OrderStatus) {
    const items = OrderService.get();
    const it = items.find(o => o.id === id);
    if (!it) return;
    it.status = status;
    it.updates = [...(it.updates || []), { status, date: new Date().toISOString() }];
    OrderService.save(items);
  },

  getById(id: string) {
    const items = OrderService.get();
    return items.find(o => o.id === id) ?? null;
  },

  clear() {
    OrderService.save([]);
  }
};
