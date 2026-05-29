import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css']
})
export class Notifications implements OnInit {
  notifications: { id?: string; message: string; time: string }[] = [];

  constructor(private router: Router, private snackbar: SnackbarService) {}

  ngOnInit(): void {
    try {
      const orders = OrderService.get();
      // convert recent order updates into notifications
      this.notifications = [];
      orders.slice().reverse().forEach(o => {
        const last = (o.updates || []).slice(-1)[0];
        const status = last ? last.status : o.status;
        const when = last ? new Date(last.date).toLocaleString() : new Date(o.createdAt).toLocaleString();
        this.notifications.push({ id: o.id, message: `Order ${o.id} is ${status}`, time: when });
      });
    } catch {
      this.notifications = [];
    }
  }

  openOrder(id?: string){
    if(!id) return;
    try { this.router.navigate(['/orders'], { queryParams: { id } }); } catch {}
  }

  clearAll(){
    // simple local clear: not persisted elsewhere
    this.notifications = [];
    this.snackbar.show('Notifications cleared', { type: 'info', duration: 1600 });
  }
}
