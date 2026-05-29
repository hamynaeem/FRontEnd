import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

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

  ngOnInit(): void {
    this._interval = setInterval(() => this.next(), 4500);
  }

  categories = [
    { name: 'Mobiles', icon: '📱', link: '/smartphones', children: [
      { name: 'Samsung', link: '/smartphones/samsung' },
      { name: 'Infinix', link: '/smartphones/infinix' },
      { name: 'Oppo', link: '/smartphones/oppo' },
      { name: 'Xiaomi', link: '/smartphones/xiaomi' },
      { name: 'Vivo', link: '/smartphones/vivo' },
      { name: 'Honor', link: '/smartphones/honor' },
      { name: 'Tecno', link: '/smartphones/tecno' },
      { name: 'Realme', link: '/smartphones/realme' },
      { name: 'More Brands', link: '/smartphones/brands' }
    ] },
    { name: 'Smart Watches', icon: '⌚', link: '/category/smart-watches' },
    { name: 'Wireless Earbuds', icon: '🎧', link: '/category/wireless-earbuds' },
    { name: 'Air Purifiers', icon: '🌀', link: '/category/air-purifiers' },
    { name: 'Personal Cares', icon: '🧴', link: '/category/personal-cares' },
    { name: 'Mobiles Accessories', icon: '🔌', link: '/category/mobiles-accessories' },
    { name: 'Bluetooth Speakers', icon: '🔈', link: '/category/bluetooth-speakers' },
    { name: 'Power Banks', icon: '🔋', link: '/category/power-banks' },
    { name: 'Tablets', icon: '📱', link: '/category/tablets' },
    { name: 'Laptops', icon: '💻', link: '/category/laptops' },
    { name: 'TV & Home Appliances', icon: '📺', link: '/category/tv-home-appliances' },
    { name: 'Auto', icon: '🚗', link: '/category/auto' }
  ];

  expanded: boolean[] = this.categories.map(() => false);

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
  }

  next(){
    this.current = (this.current + 1) % this.slideIds.length;
    const id = this.slideIds[this.current];
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (el) el.checked = true;
  }
}
