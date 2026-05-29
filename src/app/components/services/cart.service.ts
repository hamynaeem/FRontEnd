import { Subject } from 'rxjs';

export interface CartItem {
  id: string;
  title: string;
  image?: string;
  price: number; // numeric price in smallest unit
  priceText?: string; // display price
  qty: number;
}

const STORAGE_KEY = 'app_cart_items_v1';

function parsePrice(text?: string | undefined): number {
  if (!text) return 0;
  // remove non-digits and parse integer
  const digits = text.replace(/[^0-9]/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

export const CartService = {
  // emits the current cart items after any change
  changes: new Subject<CartItem[]>(),

  get(): CartItem[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as CartItem[];
    } catch {
      return [];
    }
  },

  save(items: CartItem[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    try { this.changes.next(items); } catch {}
  },

  add(product: { id: string; title: string; image?: string; price?: string | number; }, qty = 1) {
    const items = CartService.get();
    const id = product.id;
    const existing = items.find(i => i.id === id);
    const priceNum = typeof product.price === 'number' ? product.price : parsePrice(product.price as string);
    const priceText = typeof product.price === 'string' ? product.price as string : (product.price ? String(product.price) : '');
    if (existing) {
      existing.qty += qty;
      existing.price = priceNum || existing.price;
      existing.priceText = existing.priceText || priceText;
    } else {
      items.push({ id, title: product.title, image: product.image, price: priceNum, priceText, qty });
    }
    CartService.save(items);
  },

  remove(id: string) {
    const items = CartService.get().filter(i => i.id !== id);
    CartService.save(items);
  },

  updateQty(id: string, qty: number) {
    const items = CartService.get();
    const it = items.find(i => i.id === id);
    if (it) {
      it.qty = Math.max(0, qty);
      const filtered = items.filter(i => i.qty > 0);
      CartService.save(filtered);
    }
  },

  clear() {
    CartService.save([]);
  }
};
