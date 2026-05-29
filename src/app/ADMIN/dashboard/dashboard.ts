
import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard {
  collapsed = false;

  stats = {
    orders: 123,
    revenue: 12450,
    products: 43,
    customers: 67
  };

  constructor(private router: Router) {}

  openInPage(route: string){
    this.router.navigate([route]);
  }

  logout(){
    localStorage.removeItem('adminAuth');
    this.router.navigate(['/admin/admin-login']);
  }

  toggleSidebar(){
    this.collapsed = !this.collapsed;
  }

}
