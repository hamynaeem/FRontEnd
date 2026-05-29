import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SnackbarService, SnackbarMessage } from '../snackbar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.css']
})
export class SnackbarComponent implements OnDestroy {
  visible = false;
  message = '';
  actionText?: string;
  private action?: () => void;
  type: 'success' | 'error' | 'info' = 'info';
  private sub: Subscription | null = null;
  private timeoutId: any;

  constructor(private svc: SnackbarService){
    this.sub = this.svc.messages$.subscribe(m => this.show(m));
  }

  show(m: SnackbarMessage){
    this.message = m.message;
    this.type = m.type ?? 'info';
    this.actionText = m.actionText;
    this.action = m.action;
    this.visible = true;
    if(this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => this.hide(), m.duration ?? 3000);
  }

  doAction(){
    if(this.action) {
      try{ this.action(); }catch{}
    }
    this.hide();
  }

  hide(){
    this.visible = false;
    if(this.timeoutId) clearTimeout(this.timeoutId);
  }

  ngOnDestroy(){
    if(this.sub) this.sub.unsubscribe();
    if(this.timeoutId) clearTimeout(this.timeoutId);
  }
}
