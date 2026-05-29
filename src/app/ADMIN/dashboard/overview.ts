import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.html',
  styleUrls: ['./overview.css']
})
export class Overview {
  stats = {
    orders: 13647,
    revenue: 123600,
    deals: 976,
    leads: 9526
  };

  chart = [40,55,70,60,80,45,50,65,90,75,85,95];

  topPages = [
    { path: '/store/product-1', views: 465, exit: '4.4%' },
    { path: '/dashboard', views: 426, exit: '20.4%' },
    { path: '/chat', views: 254, exit: '12.6%' },
    { path: '/auth-login', views: 3369, exit: '5.2%' },
    { path: '/email', views: 985, exit: '64.2%' }
  ];

  recentOrders = [
    { id: '#1001', customer: 'Aisha Khan', total: 2499, status: 'Processing' },
    { id: '#1002', customer: 'Imran Ali', total: 1299, status: 'Shipped' },
    { id: '#1003', customer: 'Sara Noor', total: 3499, status: 'Delivered' },
    { id: '#1004', customer: 'Omar Farooq', total: 899, status: 'Cancelled' }
  ];
}
