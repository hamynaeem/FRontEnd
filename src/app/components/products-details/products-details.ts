
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { getProducts as getLocalProducts } from '../stores/product-store';
import { FormsModule } from '@angular/forms';
import { CartService } from '../services/cart.service';
import { SnackbarService } from '../shared/snackbar.service';

interface Product {
  id: string;
  title: string;
  image: string;
  price?: string; // display price string
  description?: string;
  available?: boolean;
  specs?: {
    ram?: string;
    rom?: string;
    battery?: string;
    display?: string;
    camera?: string;
    processor?: string;
  };
}

@Component({
  selector: 'app-products-details',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products-details.html',
  styleUrls: ['./products-details.css'],
})
export class ProductsDetails implements OnInit {
  public productId: string | null = null;
  public product: Product | null = null;
  public qty = 1;
  public showLightbox = false;
  public zoom = 1;
  public showCompareModal = false;
  public compareCandidates: Array<any> = [];
  public selectedCompareIds: string[] = [];
  public selectedCompareList: Array<any> = [];
  public compareRows: Array<{ label: string; values: string[]; diff: boolean }> = [];
  public compareOtherTitles: string[] = [];
  private readonly minZoom = 1;
  private readonly maxZoom = 4;
  private readonly zoomStep = 0.25;

  private products: Record<string, Product> = {
    'zte-nubia': {
      id: 'zte-nubia',
      title: 'ZTE Nubia Z50s Pro LCD Panel',
      image: 'assets/images/s26.png',
      price: 'Rs 19,649',
      description: 'High quality ZTE LCD panel unit. Tested and compatible with Z50s Pro.',
      available: false,
      specs: { ram: '8GB', rom: '128GB', battery: '5000mAh', display: '6.7" FHD+', camera: '64MP', processor: 'Snapdragon 8-series' }
    },
    'nokia-g300': {
      id: 'nokia-g300',
      title: 'Nokia G300 LCD Panel',
      image: 'assets/images/s26.png',
      price: 'Rs 3,999',
      description: 'Replacement LCD for Nokia G300.',
      available: false,
      specs: { ram: '4GB', rom: '64GB', battery: '4500mAh', display: '6.52" HD+', camera: '13MP', processor: 'Mediatek' }
    },
    'xiaomi-poco-x4': {
      id: 'xiaomi-poco-x4',
      title: 'Xiaomi Poco X4 Pro 5G LCD Panel',
      image: 'assets/images/s26.png',
      price: 'Rs 4,649',
      description: 'Original spec LCD panel for Xiaomi Poco X4 Pro.',
      available: true,
      specs: { ram: '6GB', rom: '128GB', battery: '5000mAh', display: '6.67" FHD+', camera: '64MP', processor: 'Snapdragon 695' }
    },
    'xiaomi-redmi-note11': {
      id: 'xiaomi-redmi-note11',
      title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel',
      image: 'assets/images/s26.png',
      price: 'Rs 4,649',
      description: 'Replacement LCD for Redmi Note 11 Pro Plus.',
      available: true,
      specs: { ram: '8GB', rom: '256GB', battery: '4500mAh', display: '6.67" AMOLED', camera: '108MP', processor: 'Mediatek' }
    }
  };

  constructor(private route: ActivatedRoute, private router: Router, private snackbar: SnackbarService) {}

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get('id');
    if (!this.productId) return;

    // try built-in map first (slug keys)
    const fromMap = this.products[this.productId];
    if (fromMap) {
      this.product = fromMap;
      return;
    }

    // try numeric id from local store
    const numericId = Number(this.productId);
    if (!isNaN(numericId)) {
      getLocalProducts().subscribe(items => {
        const found = items.find(i => i.id === numericId);
        if (found) {
          this.product = {
            id: String(found.id),
            title: found.title || found.name || '',
            image: found.image || 'assets/images/s26.png',
            price: found.price ? `Rs ${found.price}` : undefined,
            description: found.description || '',
            available: found.available ?? true,
            specs: found.specs || undefined,
          };
        }
      });
      return;
    }

    // try slug/name matching in local store
    getLocalProducts().subscribe(items => {
      const found = items.find(i => (i.slug && i.slug === this.productId) || this.slugify(i.name || '') === this.productId);
      if (found) {
        this.product = {
          id: String(found.id),
          title: found.title || found.name || '',
          image: found.image || 'assets/images/s26.png',
          price: found.price ? `Rs ${found.price}` : undefined,
          description: found.description || '',
          available: found.available ?? true,
          specs: found.specs || undefined,
        };
      }
    });
  }

  private slugify(value: string): string {
    return (value || '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  openLightbox(): void {
    this.showLightbox = true;
    this.zoom = 1;
  }

  closeLightbox(): void {
    this.showLightbox = false;
  }

  zoomIn(event?: Event): void {
    if (event) event.stopPropagation();
    this.zoom = Math.min(this.maxZoom, +(this.zoom + this.zoomStep).toFixed(2));
  }

  zoomOut(event?: Event): void {
    if (event) event.stopPropagation();
    this.zoom = Math.max(this.minZoom, +(this.zoom - this.zoomStep).toFixed(2));
  }

  resetZoom(event?: Event): void {
    if (event) event.stopPropagation();
    this.zoom = 1;
  }

  addToCart(): void {
    if (!this.product) return;
    // add to cart with selected quantity
    CartService.add({ id: this.product.id, title: this.product.title, image: this.product.image, price: this.product.price }, this.qty || 1);
    const addedQty = this.qty || 1;
    // show snackbar with Undo
    this.snackbar.show('Added to cart', {
      type: 'success',
      duration: 5000,
      actionText: 'Undo',
      action: () => {
        try{
          const items = CartService.get();
          const it = items.find(i => i.id === this.product!.id);
          if (!it) return;
          const newQty = Math.max(0, it.qty - addedQty);
          if (newQty <= 0) CartService.remove(this.product!.id);
          else CartService.updateQty(this.product!.id, newQty);
          this.snackbar.show('Add undone', { duration: 2200, type: 'info' });
        }catch{}
      }
    });
  }

  buyNow(){
    if(!this.product) return;
    // add to cart and go to checkout
    CartService.add({ id: this.product.id, title: this.product.title, image: this.product.image, price: this.product.price }, this.qty || 1);
    this.router.navigate(['/checkout']);
  }

  share(): void {
    if (!this.product) return;

    const title = this.product.title || 'Product';
    const desc = this.product.description || '';

    // prefer slug-like id for a professional link
    let idForLink = this.product.id || '';
    // if numeric id, build a slug from title
    if (/^\d+$/.test(idForLink)) {
      idForLink = this.slugify(title);
    }

    const url = `${window.location.origin}/product/${idForLink}`;

    // Try Web Share API first
    const nav: any = navigator as any;
    if (nav && typeof nav.share === 'function') {
      nav.share({ title, text: desc, url }).then(() => {
        this.snackbar.show('Shared successfully', { type: 'success', duration: 2200 });
      }).catch(() => {
        // fallback to clipboard
        this.copyToClipboard(url);
      });
      return;
    }

    // Fallback: copy to clipboard
    this.copyToClipboard(url);
  }

  private copyToClipboard(text: string): void {
    const nav: any = navigator as any;
    if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
      nav.clipboard.writeText(text).then(() => {
        this.snackbar.show('Link copied to clipboard', { type: 'success', duration: 3000 });
      }).catch(() => {
        this.snackbar.show(text, { duration: 8000, actionText: 'Copy', action: () => { try { nav.clipboard.writeText(text); } catch {} } });
      });
    } else {
      // final fallback: show link in snackbar with copy action
      this.snackbar.show(text, { duration: 8000, actionText: 'Copy', action: () => { try { (navigator as any).clipboard.writeText(text); } catch {} } });
    }
  }

  openCompare(): void {
    if (!this.product) return;
    this.selectedCompareIds = [];
    this.selectedCompareList = [];
    this.compareRows = [];
    this.compareOtherTitles = [];
    // load candidates from local store
    getLocalProducts().subscribe(items => {
        this.compareCandidates = items
          .filter(i => String(i.id) !== String(this.product!.id))
          .map(i => ({ id: String(i.id), title: i.title || i.name || '', image: i.image, price: i.price ? `Rs ${i.price}` : undefined, specs: i.specs, available: i.available ?? true } as any));
      this.showCompareModal = true;
    });
  }

  closeCompare(): void {
    this.showCompareModal = false;
    this.selectedCompareIds = [];
    this.selectedCompareList = [];
    this.compareRows = [];
    this.compareOtherTitles = [];
  }

  toggleCandidate(id: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedCompareIds.includes(id)) this.selectedCompareIds.push(id);
    } else {
      this.selectedCompareIds = this.selectedCompareIds.filter(x => x !== id);
    }
  }

  doCompare(): void {
    if (!this.product || this.selectedCompareIds.length === 0) return;
    const selected = this.compareCandidates.filter(c => this.selectedCompareIds.includes(c.id));
    if (selected.length === 0) return;
    this.selectedCompareList = selected;
    this.compareOtherTitles = selected.map(s => s.title || '');

    const rows: Array<{ label: string; values: string[]; diff: boolean }> = [];

    // basic fields
    const baseTitle = this.product.title || '';
    rows.push({ label: 'Title', values: [baseTitle, ...selected.map(s => s.title || '')], diff: selected.some(s => (s.title || '') !== baseTitle) });
    const basePrice = this.product.price || '';
    rows.push({ label: 'Price', values: [basePrice, ...selected.map(s => s.price || '')], diff: selected.some(s => (s.price || '') !== basePrice) });
    const baseAvail = this.product.available ? 'In stock' : 'Pre-order';
    rows.push({ label: 'Availability', values: [baseAvail, ...selected.map(s => (s.available ? 'In stock' : 'Pre-order'))], diff: selected.some(s => ((s.available ? 'In stock' : 'Pre-order') !== baseAvail)) });

    const specKeys = new Set<string>();
    if (this.product.specs) Object.keys(this.product.specs).forEach(k => specKeys.add(k));
    selected.forEach(s => { if (s.specs) Object.keys(s.specs).forEach(k => specKeys.add(k)); });

    const labels: Record<string, string> = { ram: 'RAM', rom: 'ROM', battery: 'Battery', display: 'Display', camera: 'Camera', processor: 'Processor' };
    for (const key of Array.from(specKeys)) {
      const baseVal = this.product.specs && (this.product.specs as any)[key] ? String((this.product.specs as any)[key]) : '-';
      const values = [baseVal, ...selected.map(s => (s.specs && (s.specs as any)[key]) ? String((s.specs as any)[key]) : '-')];
      const diff = values.slice(1).some(v => v !== baseVal);
      rows.push({ label: labels[key] || key, values, diff });
    }

    this.compareRows = rows;
  }
}
