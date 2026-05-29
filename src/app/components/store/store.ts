import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-store',
  standalone: true,
  templateUrl: './store.html',
  styleUrls: ['./store.css'],
  imports: [CommonModule]
})
export class Store {
  products = [
    { id: 1, title: 'ZTE Nubia Z50s Pro LCD Panel', subtitle: 'ZTE LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'preorder', oldPrice: 22499, price: 19649 },
    { id: 2, title: 'Nokia G300 LCD Panel', subtitle: 'Nokia LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'preorder', oldPrice: 4999, price: 3999 },
    { id: 3, title: 'Xiaomi Poco X4 Pro 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 4, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 5, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 6, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 7, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 8, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 9, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 10, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 11, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 },
    { id: 12, title: 'Xiaomi Redmi Note 11 Pro Plus 5G LCD Panel', subtitle: 'Xiaomi LCD Panel Unit', image: 'assets/images/s26.png', rating: 5, status: 'in-stock', price: 4649 }
  ];

  constructor() {}

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
