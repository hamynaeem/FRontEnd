
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService, CartItem } from '../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cart.html',
  styleUrls: ['./cart.css'],
})
export class Cart implements OnInit {

  public items: CartItem[] = [];

  ngOnInit(): void {
    this.load();
    try { CartService.changes.subscribe(() => this.load()); } catch {}
  }

  load(): void {
    this.items = CartService.get();
  }

  qtyChanged(item: CartItem, delta: number): void {
    const next = item.qty + delta;
    CartService.updateQty(item.id, Math.max(0, next));
    this.load();
  }

  remove(item: CartItem): void {
    CartService.remove(item.id);
    this.load();
  }

  get subtotal(): number {
    return this.items.reduce((s, i) => s + (i.price || 0) * i.qty, 0);
  }

  get tax(): number {
    return Math.round(this.subtotal * 0.04);
  }

  get total(): number {
    return this.subtotal + this.tax;
  }

  formatPrice(n: number): string {
    // simple formatting with thousands separators
    return 'Rs ' + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }


}
