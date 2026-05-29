import { Component } from '@angular/core';
import { DecimalPipe, CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface Product {
  id: string;
  title: string;
  price: number;
  rating: number;
  reviews: number;
  img: string;
  discount: string;
}

@Component({
  selector: 'app-smartwatches',
  standalone: true,
  imports: [CommonModule, DecimalPipe, RouterModule],
  templateUrl: './smartwatches.html',
  styleUrls: ['./smartwatches.css'],
})
export class Smartwatches {
  products: Product[] = Array.from({ length: 10 }).map((_, i) => {
    const slugs = ['zte-nubia', 'nokia-g300', 'xiaomi-poco-x4', 'xiaomi-redmi-note11'];
    return {
      id: slugs[i % slugs.length],
      title: ['D18 Smart Watch', 'Samsung Galaxy Fit 3', 'Redmi Watch 5 Lite', 'Ultra Smart Watch'][i % 4] + (i > 3 ? ` ${i}` : ''),
      price: Math.round(1000 + Math.random() * 10000),
      rating: +(4 + Math.random()).toFixed(1),
      reviews: Math.floor(3 + Math.random() * 300),
      img: `assets/images/s26.png`,
      discount: `${20 + (i % 5) * 10}%`
    } as Product;
  });
}
