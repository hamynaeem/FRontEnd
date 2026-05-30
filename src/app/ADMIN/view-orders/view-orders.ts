
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../components/shared/snackbar.service';

interface OrderItem {
  productId?: number;
  name: string;
  qty: number;
  price: number;
  image?: string;
}

interface Order {
  id: number;
  orderNo: string;
  date: string; // ISO
  customer: { name: string; email?: string; phone?: string; address?: string };
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: string;
  shippingMethod?: string;
  notes?: string;
}

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

  constructor(private snackbar: SnackbarService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  private loadOrders(){
    try{
      const raw = localStorage.getItem('orders');
      if(raw){
        this.orders = JSON.parse(raw);
      } else {
        this.orders = this.sampleOrders();
        localStorage.setItem('orders', JSON.stringify(this.orders));
      }
    }catch{
      this.orders = [];
    }
  }

  private sampleOrders(): Order[]{
    const now = new Date();
    return [
      {
        id: Date.now(),
        orderNo: `ORD-${now.getFullYear()}-${Math.floor(Math.random()*9000)+1000}`,
        date: now.toISOString(),
        customer: { name: 'Alice Johnson', email: 'alice@example.com', phone: '+1 555-0100', address: '123 Main St, Springfield' },
        items: [
          { productId: 1, name: 'Smartphone X', qty: 1, price: 599, image: '' },
          { productId: 2, name: 'Protective Case', qty: 1, price: 29 }
        ],
        total: 628,
        status: 'pending',
        paymentMethod: 'Card',
        shippingMethod: 'Standard',
        notes: 'Deliver between 9am-5pm'
      },
      {
        id: Date.now()+1,
        orderNo: `ORD-${now.getFullYear()}-${Math.floor(Math.random()*9000)+1000}`,
        date: new Date(now.getTime()-1000*60*60*24*2).toISOString(),
        customer: { name: 'Bob Martin', email: 'bob@example.com', phone: '+1 555-0111', address: '45 Elm Ave, Rivertown' },
        items: [
          { productId: 3, name: 'Phone Charger', qty: 2, price: 19 }
        ],
        total: 38,
        status: 'shipped',
        paymentMethod: 'PayPal',
        shippingMethod: 'Express',
        notes: ''
      }
    ];
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
    o.status = newStatus;
    this.saveOrders();
    this.snackbar.show(`Order ${o.orderNo} → ${newStatus}`, { type: 'success', duration: 3500, actionText: 'Undo', action: () => { o.status = prev; this.saveOrders(); this.snackbar.show('Undo successful', { duration: 2000, type: 'info' }); } });
  }

  deleteOrder(o: Order){
    if(!confirm('Delete this order permanently?')) return;
    const idx = this.orders.findIndex(x => x.id === o.id);
    if(idx === -1) return;
    this.orders.splice(idx,1);
    this.saveOrders();
    this.snackbar.show('Order deleted', { duration: 4000, actionText: 'Undo', action: () => { this.orders.splice(idx,0,o); this.saveOrders(); this.snackbar.show('Restore successful', { duration: 2200, type: 'success' }); } });
  }

  saveOrders(){
    try{ localStorage.setItem('orders', JSON.stringify(this.orders)); }catch{}
  }

  orderItemCount(o: Order){ return o.items?.reduce((s,i)=>s+i.qty,0) || 0; }
  orderSubtotal(o: Order){ return o.items?.reduce((s,i)=>s + (i.price * i.qty),0) || 0; }
  formatDate(dateStr?: string){ if(!dateStr) return ''; const d = new Date(dateStr); return d.toLocaleString(); }
}
