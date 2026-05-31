import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Category, getCategories } from '../stores/category-store';

interface HomeCategory {
  name: string;
  icon: string;
  link: string;
  children?: { name: string; link: string }[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [RouterLink, CommonModule]
})
export class Home implements OnInit, OnDestroy {
  private _interval: any;
  private slideIds = ['slide1', 'slide2', 'slide3', 'slide4'];
  private current = 0;
  private trackEl: HTMLElement | null = null;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchDeltaX = 0;
  private touchListeners: { type: string; handler: EventListenerOrEventListenerObject }[] = [];

  categories: HomeCategory[] = [];
  expanded: boolean[] = [];
  categoriesLoading = false;
  categoriesError = '';

  constructor() {}

  ngOnInit(): void {
    this._interval = setInterval(() => this.next(), 4500);
    this.loadCategories();

    // setup swipe handlers for hero slider
    try {
      this.trackEl = document.querySelector('.hero-slider') as HTMLElement | null;
      if (this.trackEl) {
        const onStart = (ev: Event) => this.onTouchStart(ev as any);
        const onMove = (ev: Event) => this.onTouchMove(ev as any);
        const onEnd = (ev: Event) => this.onTouchEnd(ev as any);

        this.touchListeners.push({ type: 'touchstart', handler: onStart });
        this.touchListeners.push({ type: 'touchmove', handler: onMove });
        this.touchListeners.push({ type: 'touchend', handler: onEnd });

        // mouse support for desktop dragging
        this.touchListeners.push({ type: 'mousedown', handler: onStart });
        this.touchListeners.push({ type: 'mousemove', handler: onMove });
        this.touchListeners.push({ type: 'mouseup', handler: onEnd });

        this.touchListeners.forEach(t => this.trackEl!.addEventListener(t.type, t.handler as EventListener));
        // ensure initial position
        this.updateTrack();
      }
    } catch (e) {}
  }

  private loadCategories(): void {
    this.categoriesLoading = true;
    this.categoriesError = '';

    getCategories().subscribe({
      next: (categories) => {
        this.categories = this.toHomeCategories(categories);
        this.expanded = this.categories.map(() => false);
        this.categoriesLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.categories = [];
        this.expanded = [];
        this.categoriesLoading = false;
        this.categoriesError = 'Failed to load categories';
      }
    });
  }

  private toHomeCategories(categories: Category[]): HomeCategory[] {
    const childGroups = new Map<string, Category[]>();

    categories
      .filter(category => !!category.parent)
      .forEach(category => {
        const parent = category.parent || '';
        childGroups.set(parent, [...(childGroups.get(parent) || []), category]);
      });

    return categories
      .filter(category => !category.parent)
      .map(category => ({
        name: category.name,
        icon: category.icon || this.defaultIcon(category.name),
        link: this.categoryLink(category.name),
        children: (childGroups.get(category.name) || []).map(child => ({
          name: child.name,
          link: this.categoryLink(child.name)
        }))
      }));
  }

  isImageIcon(icon?: string): boolean {
    if (!icon) return false;

    return /^(https?:\/\/|\/|assets\/).+\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(icon.trim());
  }

  private categoryLink(name: string): string {
    return `/category/${this.slugify(name)}`;
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private defaultIcon(name: string): string {
    const normalized = name.toLowerCase();

    if (normalized.includes('mobile') || normalized.includes('phone')) return '📱';
    if (normalized.includes('watch')) return '⌚';
    if (normalized.includes('earbud') || normalized.includes('headphone')) return '🎧';
    if (normalized.includes('speaker')) return '🔈';
    if (normalized.includes('laptop')) return '💻';
    if (normalized.includes('power')) return '🔋';

    return '📦';
  }

  toggle(i: number, ev?: Event){
    // prevent toggle clicks from triggering navigation when inside the link
    if(ev){
      ev.stopPropagation();
      ev.preventDefault();
    }
    this.expanded[i] = !this.expanded[i];
  }

  ngOnDestroy(): void {
    if (this._interval) {
      clearInterval(this._interval);
    }
    // remove touch listeners
    try {
      if (this.trackEl) {
        this.touchListeners.forEach(t => this.trackEl!.removeEventListener(t.type, t.handler as EventListener));
      }
    } catch (e) {}
  }

  next(){
    this.current = (this.current + 1) % this.slideIds.length;
    this.updateTrack();
  }

  prev(){
    this.current = (this.current - 1 + this.slideIds.length) % this.slideIds.length;
    this.updateTrack();
  }

  private updateTrack(){
    try {
      const track = document.querySelector('.hero-track') as HTMLElement | null;
      if (track) {
        track.style.transform = `translateX(-${this.current * 25}%)`;
      }
    } catch (e) {}
  }

  private onTouchStart(ev: Event | TouchEvent | MouseEvent){
    // pause auto-advance
    if (this._interval) { clearInterval(this._interval); this._interval = null; }
    this.touchDeltaX = 0;
    if ((ev as TouchEvent).touches && (ev as TouchEvent).touches.length) {
      const t = (ev as TouchEvent).touches[0];
      this.touchStartX = t.clientX;
      this.touchStartY = t.clientY;
    } else if ((ev as MouseEvent).clientX !== undefined) {
      this.touchStartX = (ev as MouseEvent).clientX;
      this.touchStartY = (ev as MouseEvent).clientY;
    }
  }

  private onTouchMove(ev: Event | TouchEvent | MouseEvent){
    if (!this.trackEl) return;
    let x = 0;
    let y = 0;
    if ((ev as TouchEvent).touches && (ev as TouchEvent).touches.length) {
      x = (ev as TouchEvent).touches[0].clientX;
      y = (ev as TouchEvent).touches[0].clientY;
    } else if ((ev as MouseEvent).clientX !== undefined) {
      x = (ev as MouseEvent).clientX;
      y = (ev as MouseEvent).clientY;
    }
    this.touchDeltaX = x - this.touchStartX;
    // optionally we could apply a small drag transform here
  }

  private onTouchEnd(ev?: Event | TouchEvent | MouseEvent){
    const threshold = 40; // px
    if (this.touchDeltaX > threshold) {
      this.prev();
    } else if (this.touchDeltaX < -threshold) {
      this.next();
    }
    // resume auto-advance
    try {
      if (!this._interval) this._interval = setInterval(() => this.next(), 4500);
    } catch (e) {}
    this.touchDeltaX = 0;
  }
}
