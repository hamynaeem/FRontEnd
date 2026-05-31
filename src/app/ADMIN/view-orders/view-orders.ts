
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../components/shared/snackbar.service';
import { Subscription } from 'rxjs';
import { observeOrders, updateOrder, deleteOrder as deleteOrderFromStore, restoreOrder, Order } from '../../components/stores/order-store';


@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-orders.html',
  styleUrls: ['./view-orders.css'],
})
export class ViewOrders implements OnInit {
  orders: Order[] = [];
  searchTerm = '';
  statusFilter: string = 'all';
  selectedOrder: Order | null = null;
  showModal = false;
  private ordersSub: Subscription | null = null;

  constructor(private snackbar: SnackbarService) {}

  ngOnInit(): void {
    this.ordersSub = observeOrders().subscribe((orders) => {
      this.orders = orders;
    });
  }

  ngOnDestroy(): void {
    if (this.ordersSub) this.ordersSub.unsubscribe();
  }


  get filteredOrders(){
    const q = (this.searchTerm || '').toLowerCase().trim();
    return this.orders
      .filter(o => {
        if(this.statusFilter !== 'all' && o.status !== this.statusFilter) return false;
        if(!q) return true;
        if((o.orderNo||'').toLowerCase().includes(q)) return true;
        if(o.customer?.name?.toLowerCase().includes(q)) return true;
        if(o.items?.some(it => it.name.toLowerCase().includes(q))) return true;
        return false;
      })
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  openDetails(o: Order){ this.selectedOrder = o; this.showModal = true; }
  closeDetails(){ this.selectedOrder = null; this.showModal = false; }

  markStatus(o: Order, newStatus: Order['status']){
    const prev = o.status;
    updateOrder(o.id, { status: newStatus }).subscribe({
      next: () => {
        this.snackbar.show(`Order ${o.orderNo} → ${newStatus}`, { type: 'success', duration: 3500, actionText: 'Undo', action: () => { updateOrder(o.id, { status: prev }).subscribe(()=>{ this.snackbar.show('Undo successful', { duration: 2000, type: 'info' }); }, (err)=>{ console.error(err); }); } });
      },
      error: (err) => { console.error(err); this.snackbar.show('Failed to update order', { duration: 2200, type: 'error' }); }
    });
  }

  deleteOrder(o: Order){
    if(!confirm('Delete this order permanently?')) return;
    const idx = this.orders.findIndex(x => x.id === o.id);
    if(idx === -1) return;
    deleteOrderFromStore(o.id).subscribe({
      next: () => {
        this.snackbar.show('Order deleted', {
          duration: 4000,
          actionText: 'Undo',
          action: () => {
            restoreOrder(o, idx).subscribe({
              next: () => this.snackbar.show('Restore successful', { duration: 2200, type: 'success' }),
              error: (err) => { console.error(err); this.snackbar.show('Failed to restore order', { duration: 2200, type: 'error' }); }
            });
          }
        });
      },
      error: (err) => { console.error(err); this.snackbar.show('Failed to delete order', { duration: 2200, type: 'error' }); }
    });
  }

  orderItemCount(o: Order){ return o.items?.reduce((s,i)=>s+i.qty,0) || 0; }
  orderSubtotal(o: Order){ return o.items?.reduce((s,i)=>s + (i.price * i.qty),0) || 0; }
  formatDate(dateStr?: string){ if(!dateStr) return ''; const d = new Date(dateStr); return d.toLocaleString(); }
}
