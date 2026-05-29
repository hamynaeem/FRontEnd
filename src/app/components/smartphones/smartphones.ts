import { Component } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';

interface Phone {
  id: number;
  title: string;
  subtitle?: string;
  price: number;
  rating: number;
  reviews: number;
  img: string;
  badge?: string;
}

@Component({
  selector: 'app-smartphones',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './smartphones.html',
  styleUrls: ['./smartphones.css'],
})
export class Smartphones {
  products: Phone[] = [
    { id: 1, title: 'Samsung Galaxy A07', subtitle: '', price: 26999, rating: 4.8, reviews: 358, img: 'assets/images/s26.png', badge: '23% OFF' },
    { id: 2, title: 'Samsung Galaxy A17', subtitle: '', price: 51999, rating: 4.8, reviews: 97, img: 'assets/images/s26.png', badge: '23% OFF' },
    { id: 3, title: 'Samsung Galaxy S25 FE', subtitle: '', price: 184999, rating: 4.9, reviews: 50, img: 'assets/images/s26.png', badge: '16% OFF' },
    { id: 4, title: 'Samsung Galaxy A56 5G', subtitle: '', price: 114999, rating: 4.9, reviews: 121, img: 'assets/images/s26.png', badge: '17% OFF' },
    { id: 5, title: 'Samsung Galaxy A36 5G', subtitle: '', price: 98999, rating: 4.8, reviews: 9, img: 'assets/images/s26.png', badge: '18% OFF' },
    { id: 6, title: 'Samsung Galaxy A26 5G', subtitle: '', price: 77999, rating: 4.9, reviews: 77, img: 'assets/images/s26.png', badge: '18% OFF' },
    { id: 7, title: 'Samsung Galaxy S25 Ultra', subtitle: '', price: 351999, rating: 4.9, reviews: 46, img: 'assets/images/s26.png', badge: '23% OFF' },
    { id: 8, title: 'Samsung Galaxy S25', subtitle: '', price: 257999, rating: 5.0, reviews: 9, img: 'assets/images/s26.png', badge: '23% OFF' }
  ];
}
