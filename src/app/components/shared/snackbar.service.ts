import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export type SnackbarType = 'success' | 'error' | 'info';

export interface SnackbarMessage {
  message: string;
  duration?: number;
  type?: SnackbarType;
  actionText?: string;
  action?: () => void;
}

@Injectable({ providedIn: 'root' })
export class SnackbarService {
  private subject = new Subject<SnackbarMessage>();
  messages$ = this.subject.asObservable();

  show(message: string, options?: Partial<SnackbarMessage>){
    this.subject.next({ message, duration: options?.duration ?? 3000, type: options?.type ?? 'info', actionText: options?.actionText, action: options?.action });
  }
}
