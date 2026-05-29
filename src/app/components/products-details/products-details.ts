
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { SnackbarService } from '../../shared/snackbar.service';

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
    if (this.productId) {
      this.product = this.products[this.productId] ?? null;
    }
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
}
