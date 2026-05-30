import { Routes } from '@angular/router';
import { Home } from './components/home/home';

export const routes: Routes = [
     {
    path: '',
    redirectTo: 'Home',
    pathMatch: 'full' // important: ensures exact match of ''
  },
    {
        path: 'Home',
        component: Home
    },
    {
        path: 'Contact',
        loadComponent: () => import('./components/contact/contact').then(m => m.Contact)
    },
    {
        path: 'Store',
        loadComponent: () => import('./components/store/store').then(m => m.Store)
    }
    ,
    {
        path: 'product/:id',
        loadComponent: () => import('./components/products-details/products-details').then(m => m.ProductsDetails)
    }
    ,
    {
        path: 'cart',
        loadComponent: () => import('./components/cart/cart').then(m => m.Cart)
    },
    {
      path: 'account',
      loadComponent: () => import('./components/profile/profile').then(m => m.Profile)
    },
    {
      path: 'notifications',
      loadComponent: () => import('./components/notifications/notifications').then(m => m.Notifications)
    },
    {
      path: 'orders',
      loadComponent: () => import('./components/history/history').then(m => m.History)
    },
    {
      path: 'checkout',
      loadComponent: () => import('./components/checkout/checkout').then(m => m.Checkout)
    },
    {
      path: 'category/:smartwatches',
      loadComponent: () => import('./components/smartwatches/smartwatches').then(m => m.Smartwatches)
    },
    {
      path: 'smartphones',
      loadComponent: () => import('./components/smartphones/smartphones').then(m => m.Smartphones)
    },
    {
      path: 'track',
      loadComponent: () => import('./components/history/history').then(m => m.History)
    }
    
    // Admin Routes
      ,
      {
        path: 'admin/admin-login',
        loadComponent: () => import('./ADMIN/admin-login/admin-login').then(m => m.AdminLogin)
      },
      {
        path: 'admin',
        loadComponent: () => import('./ADMIN/dashboard/dashboard').then(m => m.Dashboard),
        children: [
          { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
          { path: 'dashboard', loadComponent: () => import('./ADMIN/dashboard/overview').then(m => m.Overview) },
          { path: 'add-category', loadComponent: () => import('./ADMIN/add-category/add-category').then(m => m.AddCategory) },
          { path: 'add-products', loadComponent: () => import('./ADMIN/add-products/add-products').then(m => m.AddProducts) },
          { path: 'view-orders', loadComponent: () => import('./ADMIN/view-orders/view-orders').then(m => m.ViewOrders) }
        ]
      }
];
