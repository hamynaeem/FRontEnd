import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Category, fetchCategories } from '../stores/category-store';

// ── Interfaces ───────────────────────────────────────────────────────────────
export interface HomeCategory {
  name: string; icon: string; link: string; slug: string;
  children?: { name: string; link: string; slug: string }[];
}
export interface Brand {
  id: number; name: string; logo: string; popularModel: string;
  startingPrice: string; warranty: string; color: string;
}
export interface WatchBrand {
  id: number; name: string; model: string; image: string;
  rating: number; price: string; warranty: string;
}
export interface Product {
  id: number; name: string; category: string; image: string;
  price: number; oldPrice?: number; rating: number; reviews: number;
  discount?: number; wishlisted: boolean;
}
export interface Review {
  id: number; name: string; avatar: string; rating: number; text: string; date: string;
}

// ── Sample Data ───────────────────────────────────────────────────────────────
const BRANDS: Brand[] = [
  { id:1, name:'Samsung',      logo:'🌟', popularModel:'Galaxy S25 Ultra', startingPrice:'Rs 299,999', warranty:'1 Year Official', color:'linear-gradient(135deg,#1428A0,#2563EB)' },
  { id:2, name:'Apple',        logo:'🍎', popularModel:'iPhone 16 Pro',    startingPrice:'Rs 349,999', warranty:'1 Year Official', color:'linear-gradient(135deg,#1C1C1E,#48484A)' },
  { id:3, name:'Xiaomi',       logo:'📱', popularModel:'Xiaomi 14 Pro',    startingPrice:'Rs 119,999', warranty:'1 Year Official', color:'linear-gradient(135deg,#FF6900,#FF8C42)' },
  { id:4, name:'OnePlus',      logo:'🔴', popularModel:'OnePlus 13',       startingPrice:'Rs 159,999', warranty:'1 Year Official', color:'linear-gradient(135deg,#EB0029,#FF4D6D)' },
  { id:5, name:'Google Pixel', logo:'🔵', popularModel:'Pixel 9 Pro',      startingPrice:'Rs 199,999', warranty:'1 Year Official', color:'linear-gradient(135deg,#4285F4,#0F9D58)' },
];
const WATCHES: WatchBrand[] = [
  { id:1, name:'Apple Watch',          model:'Series 10 GPS',    image:'assets/images/s26.png', rating:5, price:'Rs 79,999',  warranty:'1 Year' },
  { id:2, name:'Samsung Galaxy Watch', model:'Galaxy Watch 7',   image:'assets/images/s26.png', rating:5, price:'Rs 59,999',  warranty:'1 Year' },
  { id:3, name:'Huawei Watch',         model:'GT 5 Pro',         image:'assets/images/s26.png', rating:4, price:'Rs 49,999',  warranty:'1 Year' },
  { id:4, name:'Garmin',               model:'Fenix 8 Sapphire', image:'assets/images/s26.png', rating:5, price:'Rs 129,999', warranty:'1 Year' },
  { id:5, name:'Amazfit',              model:'Balance 2',        image:'assets/images/s26.png', rating:4, price:'Rs 29,999',  warranty:'1 Year' },
];
const PRODUCTS: Product[] = [
  { id:1,  name:'Samsung Galaxy S25 Ultra', category:'Smartphones',   image:'assets/images/s26.png', price:349999, oldPrice:399999, rating:5, reviews:248, discount:13, wishlisted:false },
  { id:2,  name:'iPhone 16 Pro Max',        category:'Smartphones',   image:'assets/images/s26.png', price:429999, oldPrice:469999, rating:5, reviews:312, discount:9,  wishlisted:false },
  { id:3,  name:'Google Pixel 9 Pro',       category:'Smartphones',   image:'assets/images/s26.png', price:219999, oldPrice:249999, rating:5, reviews:184, discount:12, wishlisted:false },
  { id:4,  name:'OnePlus 13 5G',            category:'Smartphones',   image:'assets/images/s26.png', price:169999, oldPrice:189999, rating:4, reviews:139, discount:11, wishlisted:false },
  { id:5,  name:'Xiaomi 14 Ultra',          category:'Smartphones',   image:'assets/images/s26.png', price:149999, oldPrice:179999, rating:4, reviews:97,  discount:17, wishlisted:false },
  { id:6,  name:'Apple Watch Series 10',    category:'Smart Watches', image:'assets/images/s26.png', price:79999,  oldPrice:89999,  rating:5, reviews:201, discount:11, wishlisted:false },
  { id:7,  name:'Samsung Galaxy Watch 7',   category:'Smart Watches', image:'assets/images/s26.png', price:59999,  oldPrice:69999,  rating:5, reviews:155, discount:14, wishlisted:false },
  { id:8,  name:'Garmin Fenix 8 Sapphire', category:'Smart Watches', image:'assets/images/s26.png', price:129999, oldPrice:149999, rating:5, reviews:88,  discount:13, wishlisted:false },
  { id:9,  name:'Huawei GT 5 Pro',         category:'Smart Watches', image:'assets/images/s26.png', price:49999,  oldPrice:59999,  rating:4, reviews:73,  discount:17, wishlisted:false },
  { id:10, name:'Amazfit Balance 2',        category:'Smart Watches', image:'assets/images/s26.png', price:29999,  oldPrice:34999,  rating:4, reviews:112, discount:14, wishlisted:false },
];
const REVIEWS: Review[] = [
  { id:1, name:'Ali Hassan',   avatar:'👨‍💼', rating:5, text:'Absolutely love my new iPhone! The delivery was super fast and packaging was perfect. Will definitely shop here again.', date:'May 2026' },
  { id:2, name:'Ayesha Khan',  avatar:'👩‍💻', rating:5, text:'Best online mobile store in Pakistan! Got a genuine Samsung S25 with official warranty. Great experience overall.', date:'May 2026' },
  { id:3, name:'Usman Tariq',  avatar:'👨‍🎓', rating:5, text:'The compare feature helped me choose between OnePlus and Xiaomi. Incredibly helpful and the UI is stunning.', date:'Apr 2026' },
  { id:4, name:'Fatima Malik', avatar:'👩‍🏫', rating:4, text:'Great product selection and real-time stock info. Received my Apple Watch exactly as described with all accessories.', date:'Apr 2026' },
  { id:5, name:'Bilal Ahmed',  avatar:'👨‍🔧', rating:5, text:'The 1 year brand warranty really gives peace of mind. Bought a Garmin watch and the support team was very helpful.', date:'Mar 2026' },
];

// ── Component ─────────────────────────────────────────────────────────────────
@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [RouterLink, CommonModule, FormsModule],
})
export class Home implements OnInit, OnDestroy {
  private _interval: any;
  private _reviewInterval: any;

  currentSlide = signal(0);
  totalSlides   = 4;
  currentReview = signal(0);

  categories: HomeCategory[] = [];
  expanded: boolean[] = [];
  categoriesLoading = false;
  categoriesError   = '';

  readonly brands   = BRANDS;
  readonly watches  = WATCHES;
  readonly reviews  = REVIEWS;
  readonly products = signal<Product[]>(PRODUCTS);

  nlEmail   = '';
  nlSuccess = false;

  // ── Wishlist ─────────────────────────────────────────────────────────────
  toggleWishlist(p: Product) {
    this.products.update(list =>
      list.map(x => x.id === p.id ? { ...x, wishlisted: !x.wishlisted } : x)
    );
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  stars5 = [1,2,3,4,5];

  formatPrice(p: number): string { return 'Rs ' + p.toLocaleString('en-PK'); }

  subscribeNewsletter() {
    if (!this.nlEmail) return;
    this.nlSuccess = true; this.nlEmail = '';
    setTimeout(() => { this.nlSuccess = false; }, 4000);
  }

  // ── Hero Slider ───────────────────────────────────────────────────────────
  slides = [
    { badge:'🔥 New Arrivals', headline:'Latest Smartphones', highlight:'& Smart Watches', sub:'Premium Devices With Official Warranty & Guarantee' },
    { badge:'🛡️ Official Warranty', headline:'Genuine Products', highlight:'Certified Quality', sub:'Every device comes with brand warranty and bill of purchase' },
    { badge:'⚡ Best Prices', headline:'Unbeatable Deals', highlight:'On Top Brands', sub:'Samsung, Apple, Xiaomi, OnePlus, Pixel — all in one place' },
    { badge:'🚀 Fast Delivery', headline:'Order Today,', highlight:'Delivered Tomorrow', sub:'All Over Pakistan — Fast, Insured & Tracked Shipping' },
  ];

  goToSlide(i: number) { this.currentSlide.set(i); this.resetInterval(); }
  nextSlide()  { this.currentSlide.update(c => (c + 1) % this.totalSlides); }
  prevSlide()  { this.currentSlide.update(c => (c - 1 + this.totalSlides) % this.totalSlides); }
  private resetInterval() {
    if (this._interval) clearInterval(this._interval);
    this._interval = setInterval(() => this.nextSlide(), 5000);
  }

  // ── Review Slider ─────────────────────────────────────────────────────────
  goToReview(i: number) { this.currentReview.set(i); }

  // ── Lifecycle ─────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.resetInterval();
    this._reviewInterval = setInterval(() => {
      this.currentReview.update(c => (c + 1) % REVIEWS.length);
    }, 4500);
    this.loadCategories();
  }

  ngOnDestroy(): void {
    if (this._interval) clearInterval(this._interval);
    if (this._reviewInterval) clearInterval(this._reviewInterval);
  }

  // ── Categories ────────────────────────────────────────────────────────────
  private loadCategories(): void {
    this.categoriesLoading = true;
    fetchCategories().subscribe({
      next: cats => {
        this.categories = this.toHomeCategories(cats);
        this.expanded = this.categories.map(() => false);
        this.categoriesLoading = false;
      },
      error: () => { this.categories = []; this.expanded = []; this.categoriesLoading = false; this.categoriesError = 'Failed to load categories'; },
    });
  }

  private toHomeCategories(categories: Category[]): HomeCategory[] {
    const childGroups = new Map<string, Category[]>();
    categories.forEach(c => { if (c.parent) childGroups.set(c.parent, [...(childGroups.get(c.parent) || []), c]); });
    const roots = categories.filter(c => !c.parent);
    const source = roots.length ? roots : categories;
    return source.map(c => ({
      name: c.name, icon: c.icon || this.defaultIcon(c.name),
      link: `/products?category=${this.slugify(c.name)}`, slug: this.slugify(c.name),
      children: (childGroups.get(c.name) || []).map(ch => ({ name: ch.name, link: `/products?category=${this.slugify(ch.name)}`, slug: this.slugify(ch.name) })),
    }));
  }

  isImageIcon(icon?: string): boolean {
    if (!icon) return false;
    return /^(https?:\/\/|\/|assets\/).+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(icon.trim());
  }

  private slugify(v: string): string {
    return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  }

  private defaultIcon(name: string): string {
    const n = name.toLowerCase();
    if (n.includes('mobile') || n.includes('phone')) return '📱';
    if (n.includes('watch')) return '⌚';
    if (n.includes('earbud') || n.includes('headphone')) return '🎧';
    if (n.includes('laptop')) return '💻';
    return '📦';
  }

  toggle(i: number, ev?: Event) { ev?.stopPropagation(); ev?.preventDefault(); this.expanded[i] = !this.expanded[i]; }
}
