import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getProducts, Product as StoreProduct } from '../stores/product-store';

interface StoreCardProduct {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  rating: number;
  status: string;
  oldPrice?: number;
  price: number;
}

@Component({
  selector: 'app-store',
  standalone: true,
  templateUrl: './store.html',
  styleUrls: ['./store.css'],
  imports: [CommonModule]
})
export class Store implements OnInit {
  products: StoreCardProduct[] = [];
  private allProducts: StoreCardProduct[] = [];
  searchTerm = '';
  sortBy: 'popular' | 'new' | 'price-asc' | 'price-desc' = 'popular';
  loading = false;
  error = '';

  constructor() {}

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.loading = true;
    this.error = '';
    getProducts().subscribe({
      next: (items: StoreProduct[]) => {
        this.allProducts = items.map((p) => ({
          id: p.id,
          title: (p.title || p.name || '').trim() || 'Untitled Product',
          subtitle: p.subtitle || p.description || `${p.category || 'General'} Product`,
          image: p.image || 'assets/images/s26.png',
          rating: Math.max(1, Math.min(5, Number(p.rating) || 5)),
          status: p.status || (p.available === false ? 'out-of-stock' : 'in-stock'),
          oldPrice: p.old_price,
          price: Number(p.price) || 0
        }));
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.products = [];
        this.error = 'Failed to load products';
      }
    });
  }

  onSearch(value: string): void {
    this.searchTerm = value || '';
    this.applyFilters();
  }

  onSortChange(value: string): void {
    if (value === 'new' || value === 'price-asc' || value === 'price-desc' || value === 'popular') {
      this.sortBy = value;
      this.applyFilters();
    }
  }

  private applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    let items = this.allProducts.filter((p) => {
      if (!term) return true;
      return p.title.toLowerCase().includes(term) || p.subtitle.toLowerCase().includes(term);
    });

    items = [...items].sort((a, b) => {
      if (this.sortBy === 'price-asc') return a.price - b.price;
      if (this.sortBy === 'price-desc') return b.price - a.price;
      if (this.sortBy === 'new') return b.id - a.id;
      return b.rating - a.rating;
    });

    this.products = items;
  }

  onCardEnter(card: HTMLElement | null) {
    if (!card) return;
    card.style.setProperty('--card-scale', '1.01');
    card.style.setProperty('--shadow-scale', '1.25');
    card.style.setProperty('--shadow-opacity', '0.9');
    card.style.transition = 'transform 160ms cubic-bezier(.2,.9,.2,1), box-shadow 160ms';
  }

  onCardMove(event: MouseEvent, el: HTMLElement | null) {
    if (!el) return;
    const card = el as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const maxRot = 12; // degrees
    const ry = ((x - cx) / cx) * maxRot;
    const rx = -((y - cy) / cy) * maxRot;
    card.style.setProperty('--card-rotate-x', `${rx}deg`);
    card.style.setProperty('--card-rotate-y', `${ry}deg`);
    const translateY = -Math.min(14, (Math.abs(rx) + Math.abs(ry)) * 0.6 + 6);
    card.style.setProperty('--card-translate-y', `${translateY}px`);
    const shadowScale = 1 + Math.min(0.6, (Math.abs(rx) + Math.abs(ry)) * 0.02 + 0.2);
    const shadowOpacity = Math.min(1, 0.7 + (Math.abs(rx) + Math.abs(ry)) * 0.01);
    card.style.setProperty('--shadow-scale', `${shadowScale}`);
    card.style.setProperty('--shadow-opacity', `${shadowOpacity}`);
  }

  onCardLeave(card: HTMLElement | null) {
    if (!card) return;
    card.style.setProperty('--card-rotate-x', '0deg');
    card.style.setProperty('--card-rotate-y', '0deg');
    card.style.setProperty('--card-translate-y', '0px');
    card.style.setProperty('--card-scale', '1');
    card.style.setProperty('--shadow-scale', '1');
    card.style.setProperty('--shadow-opacity', '0.7');
    card.style.transition = 'transform 400ms cubic-bezier(.2,.9,.2,1), box-shadow 400ms';
  }

}
