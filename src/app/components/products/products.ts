import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { getProducts, Product as StoreProduct } from '../stores/product-store';
import { getCategories } from '../stores/category-store';

interface Product {
  id: number;
  title: string;
  subtitle?: string;
  price: number;
  rating: number;
  reviews: number;
  img: string;
  badge?: string;
  specs?: any;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule],
  templateUrl: './products.html',
  styleUrls: ['./products.css'],
})
export class Products implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';
  categoryName = '';
  expandedProductId: number | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const category = params['category'] as string | undefined;
      this.loadProducts(category);
    });
  }

  private loadProducts(categorySlug?: string): void {
    this.loading = true;
    this.error = '';
    getProducts().subscribe({
      next: (items: StoreProduct[]) => {
        let filtered = items;
        if (categorySlug) {
          const slug = (categorySlug || '').toLowerCase().trim();
          filtered = items.filter(p => {
            const pcat = (p.category || '').toString();
            if (!pcat) return false;
            if (this.slugify(pcat) === slug) return true;
            if (pcat.toLowerCase().trim() === slug) return true;
            return false;
          });

          // resolve human-friendly category name
          getCategories().subscribe({
            next: (cats) => {
              const match = cats.find(c => this.slugify(c.name) === slug || (c.name || '').toLowerCase().trim() === slug);
              this.categoryName = match ? match.name : this.unslugify(slug);
            },
            error: () => { this.categoryName = this.unslugify(slug); }
          });
        } else {
          this.categoryName = '';
        }

        this.products = filtered.map((p) => ({
          id: p.id,
          title: (p as any).title || p.name || '',
          subtitle: p.subtitle || (p as any).description || '',
          price: p.price || 0,
          rating: p.rating || 0,
          reviews: (p as any).reviews || 0,
          img: (p as any).image || 'assets/images/s26.png',
          badge: p.old_price && p.price ? `${Math.round((1 - (p.price / (p.old_price || p.price))) * 100)}% OFF` : undefined,
          specs: (p as any).specs || {},
        }));
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.products = [];
        this.loading = false;
        this.error = 'Failed to load products';
      }
    });
  }

  toggleSpecs(id: number): void {
    this.expandedProductId = this.expandedProductId === id ? null : id;
  }

  isSpecsOpen(id: number): boolean {
    return this.expandedProductId === id;
  }

  private slugify(value: string): string {
    return (value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private unslugify(slug: string): string {
    if (!slug) return '';
    return slug.replace(/-/g, ' ').replace(/\b\w/g, c => (c as string).toUpperCase());
  }
}
