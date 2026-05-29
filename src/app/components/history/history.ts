
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { OrderService, Order, OrderStatus } from '../../services/order.service';
import { CartService } from '../../services/cart.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './history.html',
  styleUrls: ['./history.css'],
})
export class History implements OnInit {
  public orders: Order[] = [];
  public expanded: Record<string, boolean> = {};

  private readonly steps: OrderStatus[] = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

  constructor(private router: Router, private route: ActivatedRoute, private snackbar: SnackbarService) {}

  ngOnInit(): void {
    this.load();
    try { OrderService.changes.subscribe(() => this.load()); } catch {}
    const id = this.route.snapshot.queryParamMap.get('id');
    if (id) this.expanded[id] = true;
  }

  load(): void {
    this.orders = OrderService.get().slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  formatPrice(n: number): string {
    return 'Rs ' + (n || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  toggle(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  reorder(o: Order): void {
    try {
      (o.items || []).forEach(i => CartService.add({ id: i.id, title: i.title, image: i.image, price: i.price || i.priceText || 0 }, i.qty));
      this.snackbar.show('Items added to cart', { type: 'success', duration: 2200 });
      this.router.navigate(['/cart']);
    } catch {
      this.snackbar.show('Unable to add items to cart', { type: 'error' });
    }
  }

  stepLabel(step: OrderStatus): string {
    switch (step) {
      case 'placed': return 'Placed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'out_for_delivery': return 'Out for delivery';
      case 'delivered': return 'Delivered';
      default: return step;
    }
  }

  isStepActive(o: Order, step: OrderStatus): boolean {
    const last = this.steps.indexOf(o.status);
    const idx = this.steps.indexOf(step);
    return idx <= last;
  }

  getStepDate(o: Order, step: OrderStatus): string {
    const u = (o.updates || []).find(x => x.status === step);
    return u ? new Date(u.date).toLocaleString() : '';
  }
}
