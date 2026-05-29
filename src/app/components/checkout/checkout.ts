import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '../shared/snackbar.service';
import { CartService } from '../services/cart.service';
import { OrderService } from '../services/order.service';

interface Address {
  id: string;
  name: string;
  phone?: string;
  address: string;
  city?: string;
  province?: string;
  country?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrls: ['./checkout.css'],
})
export class Checkout implements OnInit, OnDestroy {
  paymentMethod = signal<'credit' | 'cod'>('credit');

  // form fields (shipping / billing)
  name = '';
  city = '';
  province = '';
  country = '';
  address = '';
  phone = '';

  // payment fields (optional)
  card = '';
  expiry = '';
  cvv = '';

  // address book
  addresses: Address[] = [];
  selectedAddressId: string | null = null;
  showAddressForm = false;
  editingAddress: Address | null = null;

  private readonly draftKey = 'checkout_form_draft_v1';
  private readonly addressesKey = 'checkout_addresses_v1';
  private saveTimer: any = null;

  constructor(private snackbar: SnackbarService, private router: Router) {}

  ngOnInit(): void {
    // load saved addresses
    try {
      const aRaw = localStorage.getItem(this.addressesKey);
      if (aRaw) {
        this.addresses = JSON.parse(aRaw) as Address[];
        if (this.addresses.length) this.selectedAddressId = this.addresses[0].id;
      }
    } catch {}

    // load draft form
    try {
      const raw = localStorage.getItem(this.draftKey);
      if (raw) {
        const d = JSON.parse(raw);
        this.name = d.name || '';
        this.city = d.city || '';
        this.province = d.province || '';
        this.country = d.country || '';
        this.address = d.address || '';
        this.phone = d.phone || '';
        this.card = d.card || '';
        this.expiry = d.expiry || '';
        this.cvv = d.cvv || '';
        if (d.paymentMethod) this.paymentMethod.set(d.paymentMethod === 'cod' ? 'cod' : 'credit');
      }
    } catch {}
  }

  ngOnDestroy(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
  }

  onPaymentChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.paymentMethod.set(input.value === 'cod' ? 'cod' : 'credit');
    this.scheduleSaveDraft();
  }

  scheduleSaveDraft(): void {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => this.saveDraft(), 700);
  }

  saveDraft(): void {
    try {
      const draft = {
        name: this.name,
        city: this.city,
        province: this.province,
        country: this.country,
        address: this.address,
        phone: this.phone,
        card: this.card,
        expiry: this.expiry,
        cvv: this.cvv,
        paymentMethod: this.paymentMethod(),
        selectedAddressId: this.selectedAddressId,
      };
      localStorage.setItem(this.draftKey, JSON.stringify(draft));
    } catch {}
  }

  clearDraft(): void {
    try { localStorage.removeItem(this.draftKey); } catch {}
  }

  openNewAddress(): void {
    this.editingAddress = null;
    this.showAddressForm = true;
    // populate form with current values if any
    this.name = this.name || '';
    this.phone = this.phone || '';
    this.city = this.city || '';
    this.province = this.province || '';
    this.country = this.country || '';
    this.address = this.address || '';
  }

  editAddress(id: string): void {
    const a = this.addresses.find(x => x.id === id);
    if (!a) return;
    this.editingAddress = { ...a };
    this.showAddressForm = true;
    this.name = a.name;
    this.phone = a.phone || '';
    this.city = a.city || '';
    this.province = a.province || '';
    this.country = a.country || '';
    this.address = a.address;
  }

  saveAddress(): void {
    try {
      const addr: Address = {
        id: this.editingAddress ? this.editingAddress.id : 'addr_' + Date.now().toString(),
        name: this.name,
        phone: this.phone,
        address: this.address,
        city: this.city,
        province: this.province,
        country: this.country,
      };
      if (this.editingAddress) {
        const idx = this.addresses.findIndex(a => a.id === this.editingAddress!.id);
        if (idx >= 0) this.addresses[idx] = addr;
      } else {
        this.addresses.unshift(addr);
      }
      localStorage.setItem(this.addressesKey, JSON.stringify(this.addresses));
      this.selectedAddressId = addr.id;
      this.showAddressForm = false;
      this.editingAddress = null;
      this.snackbar.show('Address saved', { type: 'success', duration: 2200 });
      this.scheduleSaveDraft();
    } catch (e) {
      this.snackbar.show('Unable to save address', { type: 'error' });
    }
  }

  deleteAddress(id: string): void {
    this.addresses = this.addresses.filter(a => a.id !== id);
    try { localStorage.setItem(this.addressesKey, JSON.stringify(this.addresses)); } catch {}
    if (this.selectedAddressId === id) this.selectedAddressId = this.addresses.length ? this.addresses[0].id : null;
    this.snackbar.show('Address removed', { type: 'info', duration: 1800 });
    this.scheduleSaveDraft();
  }

  selectAddress(id: string): void {
    this.selectedAddressId = id;
    const a = this.addresses.find(x => x.id === id);
    if (a) {
      // populate form fields with selected address
      this.name = a.name;
      this.phone = a.phone || '';
      this.city = a.city || '';
      this.province = a.province || '';
      this.country = a.country || '';
      this.address = a.address;
    }
    this.scheduleSaveDraft();
  }

  placeOrder(ev: Event): void {
    ev.preventDefault();
    // ensure an address exists
    if (!this.selectedAddressId) {
      if (this.name && this.address) {
        this.saveAddress();
      } else {
        this.snackbar.show('Please select or add a delivery address', { type: 'error' });
        return;
      }
    }

    // prepare order
    try {
      const items = CartService.get();
      if (!items || items.length === 0) {
        this.snackbar.show('Your cart is empty', { type: 'error' });
        return;
      }

      const subtotal = items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
      const tax = Math.round(subtotal * 0.04);
      const total = subtotal + tax;
      const createdAt = new Date().toISOString();
      const selectedAddress = this.addresses.find(a => a.id === this.selectedAddressId) ?? {
        name: this.name,
        phone: this.phone,
        address: this.address,
        city: this.city,
        province: this.province,
        country: this.country,
      };

      const order = {
        id: 'ord_' + Date.now().toString(),
        items,
        subtotal,
        tax,
        total,
        address: selectedAddress,
        paymentMethod: this.paymentMethod(),
        status: 'placed' as const,
        updates: [{ status: 'placed' as const, date: createdAt }],
        createdAt
      };

      OrderService.add(order as any);

      // clear cart and draft
      CartService.clear();
      this.clearDraft();

      this.snackbar.show('Order placed. Thank you!', { type: 'success', duration: 3500 });
      // go to orders list and highlight this order
      try { setTimeout(() => this.router.navigate(['/orders'], { queryParams: { id: order.id } }), 700); } catch {}
    } catch (e) {
      this.snackbar.show('Failed to place order', { type: 'error' });
    }
  }
}
