import { Component, signal, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { SnackbarComponent } from './components/shared/snackbar/snackbar.component';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { CartService } from './components/services/cart.service';
import { SnackbarService } from './components/shared/snackbar.service';
import { AdminSettings, updateAdminSettings } from './components/stores/admin-store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, NgIf, SnackbarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnDestroy {
  protected readonly title = signal('Projects');
  public showMobileSearch = false;
  public currentYear = new Date().getFullYear();
  public showHeaderFooter = true;
  public cartCount = signal<number>(0);
  public showSettingsMenu = false;
  public navOpen = false;
  private _routerSub: Subscription | null = null;
  private _outsideClickHandler: ((ev: Event) => void) | null = null;

   // example contact data (from provided design)
  sampleContact: Partial<AdminSettings> = {
    storeName: 'TechZone',
    phone: '+92 300 123 4567',
    city: 'Lahore',
    country: 'Pakistan',
    email: 'info@techzone.pk',
  };

  constructor(private router: Router, private snackbarSvc: SnackbarService) {
    const initialUrl = this.router.url || '/';
    this.updateHeaderFooterVisibility(initialUrl);
    this._routerSub = this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((ev: any) => {
      const url = ev.urlAfterRedirects ?? ev.url ?? this.router.url;
      this.updateHeaderFooterVisibility(url);
      // close mobile nav when route changes
      this.navOpen = false;
    });

    // initialize and subscribe to cart changes
    try {
      this.cartCount.set(CartService.get().length);
      CartService.changes.subscribe((items: any[]) => {
        this.cartCount.set((items || []).length);
      });
    } catch {}

    // handle clicks outside the settings menu to close it
    this._outsideClickHandler = (ev: Event) => {
      if (this.showSettingsMenu) this.showSettingsMenu = false;
    };
    try { document.addEventListener('click', this._outsideClickHandler); } catch {}
  }

  private updateHeaderFooterVisibility(url: string) {
    const path = (url || '').split(/[?#]/)[0];
    this.showHeaderFooter = !/^\/admin(\/|$)/.test(path);
  }

  ngOnDestroy(): void {
    if (this._routerSub) {
      this._routerSub.unsubscribe();
      this._routerSub = null;
    }
    try { if (this._outsideClickHandler) document.removeEventListener('click', this._outsideClickHandler); } catch {}
  }

  onSearch(ev: Event){
    ev.preventDefault();
    const form = ev.target as HTMLFormElement;
    const input = form.querySelector('input[type="search"]') as HTMLInputElement | null;
    const q = input ? input.value.trim() : '';
    if(!q) return;
    // navigate to /search?q=... (create route later)
    this.router.navigate(['/search'], { queryParams: { q } });
    // close mobile search if open
    this.showMobileSearch = false;
  }

  toggleMobileSearch(){
    this.showMobileSearch = !this.showMobileSearch;
  }

  toggleNav(){
    this.navOpen = !this.navOpen;
  }

  toggleSettings(ev: Event){
    ev.stopPropagation();
    this.showSettingsMenu = !this.showSettingsMenu;
  }

  openAccount(){
    this.showSettingsMenu = false;
    try { this.router.navigate(['/account']); } catch {}
  }
openOrders(){

    this.showSettingsMenu = false;
    try { this.router.navigate(['/History']); } catch {}
  }
  openNotifications(){
    this.showSettingsMenu = false;
    try { this.router.navigate(['/notifications']); } catch {}
  }
  

  logout(){
    this.showSettingsMenu = false;
    // simple client-side logout: clear local session-like keys
    try { localStorage.removeItem('app_cart_items_v1'); } catch {}
    try { localStorage.removeItem('orders_v1'); } catch {}
    try { localStorage.removeItem('checkout_form_draft_v1'); } catch {}
    this.snackbarSvc.show('You have been logged out', { type: 'info', duration: 2200 });
    try { this.router.navigate(['/Home']); } catch {}
  }
   loadSampleContact() {
      this.snackbarSvc.show('Sample contact loaded into form — review and Save', { type: 'info', duration: 2500 });
    }
  
    replaceWithSampleContact() {
      updateAdminSettings(this.sampleContact as Partial<AdminSettings>).subscribe({
        next: (s) => {
          this.snackbarSvc.show('Settings replaced with sample contact', { type: 'success', duration: 2500 });
        },
        error: (err) => {
          console.error(err);
          this.snackbarSvc.show('Failed to replace settings', { type: 'error', duration: 2500 });
        },
      });
    }
}
