
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../components/shared/snackbar.service';
import { Subscription } from 'rxjs';
import { observeOrders, updateOrder, deleteOrder as deleteOrderFromStore, restoreOrder, Order } from '../../components/stores/order-store';
import { OrderService } from '../../components/services/order.service';


@Component({
  selector: 'app-view-orders',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './view-orders.html',
  styleUrls: ['./view-orders.css'],
})
export class ViewOrders implements OnInit, OnDestroy {
  orders: any[] = [];
  searchTerm = '';
  statusFilter: string = 'all';
  selectedOrder: Order | null = null;
  showModal = false;
  private ordersSub: Subscription | null = null;
  private svcSub: Subscription | null = null;
  private _svcOrders: any[] = [];
  private _storeOrders: Order[] = [];

  constructor(private snackbar: SnackbarService) {}

  ngOnInit(): void {
    // load initial orders from OrderService (orders_v1) and subscribe to changes
    try { this._svcOrders = OrderService.get() || []; } catch { this._svcOrders = []; }
    try {
      this.svcSub = (OrderService.changes as any).subscribe(() => {
        try { this._svcOrders = OrderService.get() || []; } catch { this._svcOrders = []; }
        this.mergeOrders();
      });
    } catch {}

    // subscribe to order-store (orders)
    this.ordersSub = observeOrders().subscribe((orders) => {
      this._storeOrders = orders || [];
      this.mergeOrders();
    });

    // initial merge
    this.mergeOrders();
  }

  ngOnDestroy(): void {
    if (this.ordersSub) this.ordersSub.unsubscribe();
    if (this.svcSub) this.svcSub.unsubscribe();
  }


  get filteredOrders(){
    const q = (this.searchTerm || '').toLowerCase().trim();
    return this.orders
      .filter(o => {
        if(this.statusFilter !== 'all' && o.status !== this.statusFilter) return false;
        if(!q) return true;
        if((o.orderNo||'').toLowerCase().includes(q)) return true;
        if(o.customer?.name?.toLowerCase().includes(q)) return true;
        if(o.items?.some((it: any) => (it.name || '').toLowerCase().includes(q))) return true;
        return false;
      })
      .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  openDetails(o: Order){ this.selectedOrder = o; this.showModal = true; }
  closeDetails(){ this.selectedOrder = null; this.showModal = false; }

  markStatus(o: Order, newStatus: Order['status']){
    const prev = o.status;
    // if order comes from OrderService (checkout), use its API
    if ((o as any).__source === 'service') {
      const svcId = (o as any).__origId || (o as any).id;
      const svcNew = this.mapStoreToServiceStatus(newStatus);
      try {
        OrderService.updateStatus(svcId, svcNew);
        this.snackbar.show(`Order ${o.orderNo} → ${newStatus}`, { type: 'success', duration: 3500, actionText: 'Undo', action: () => { OrderService.updateStatus(svcId, this.mapStoreToServiceStatus(prev)); this.snackbar.show('Undo successful', { duration: 2000, type: 'info' }); } });
      } catch (err) { console.error(err); this.snackbar.show('Failed to update order', { duration: 2200, type: 'error' }); }
      return;
    }

    // otherwise use order-store update
    updateOrder(o.id, { status: newStatus }).subscribe({
      next: () => {
        this.snackbar.show(`Order ${o.orderNo} → ${newStatus}`, { type: 'success', duration: 3500, actionText: 'Undo', action: () => { updateOrder(o.id, { status: prev }).subscribe(()=>{ this.snackbar.show('Undo successful', { duration: 2000, type: 'info' }); }, (err)=>{ console.error(err); }); } });
      },
      error: (err) => { console.error(err); this.snackbar.show('Failed to update order', { duration: 2200, type: 'error' }); }
    });
  }

  deleteOrder(o: Order){
    if(!confirm('Delete this order permanently?')) return;
    // handle service orders (orders_v1)
    if ((o as any).__source === 'service') {
      const svcId = (o as any).__origId || (o as any).id;
      try {
        const items = OrderService.get() || [];
        const idx = items.findIndex(x => x.id === svcId);
        if (idx === -1) return;
        const removed = items.splice(idx, 1)[0];
        OrderService.save(items);
        this.snackbar.show('Order deleted', {
          duration: 4000,
          actionText: 'Undo',
          action: () => {
            const re = OrderService.get() || [];
            re.splice(idx, 0, removed);
            OrderService.save(re);
            this.snackbar.show('Restore successful', { duration: 2200, type: 'success' });
          }
        });
      } catch (err) { console.error(err); this.snackbar.show('Failed to delete order', { duration: 2200, type: 'error' }); }
      return;
    }

    // fallback: delete from order-store
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

  // Merge orders from both stores into a display list
  private mergeOrders(){
    const storeMapped = (this._storeOrders || []).map(o => ({ ...o, __source: 'store', __origId: o.id }));
    const svcMapped = (this._svcOrders || []).map(s => this.mapServiceOrder(s));
    const combined: any[] = [...storeMapped];
    svcMapped.forEach(s => {
      const exists = combined.find(x => x.orderNo === s.orderNo || x.__origId === s.__origId);
      if(!exists) combined.push(s);
    });
    combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    this.orders = combined;
  }

  private mapServiceOrder(s: any){
    const orderNo = s.id || `ORD-${new Date(s.createdAt||Date.now()).getFullYear()}-${Math.floor(Math.random()*9000)+1000}`;
    const date = s.createdAt || new Date().toISOString();
    const customer = { name: s.address?.name || 'Guest', email: s.address?.email || '', phone: s.address?.phone || '', address: s.address?.address || '' };
    const items = (s.items || []).map((it: any) => ({ productId: it.id, name: it.title || it.name || 'Item', qty: it.qty || 1, price: it.price || 0, image: it.image || '' }));
    const total = s.total || s.subtotal || items.reduce((sum:any,it:any)=>sum + (it.price * it.qty),0);
    const status = this.mapServiceToStoreStatus(s.status || 'placed');
    return { id: s.id, orderNo, date, customer, items, total, status, __source: 'service', __origId: s.id };
  }

  private mapServiceToStoreStatus(s: string){
    switch(s){
      case 'placed': return 'pending';
      case 'processing': return 'processing';
      case 'shipped': return 'shipped';
      case 'out_for_delivery': return 'shipped';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  }

  private mapStoreToServiceStatus(s: Order['status']){
    switch(s){
      case 'pending': return 'placed';
      case 'processing': return 'processing';
      case 'shipped': return 'shipped';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      default: return 'placed';
    }
  }
}
