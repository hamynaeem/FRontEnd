import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../components/shared/snackbar.service';
import { Subscription } from 'rxjs';
import {
  AdminSettings,
  observeAdminSettings,
  updateAdminSettings,
  changeAdminPassword,
  getAdminSettingsSnapshot,
} from '../../components/stores/admin-store';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings implements OnInit, OnDestroy {
  settings: AdminSettings | null = null;
  form: AdminSettings | null = null;

  // password fields (kept separate)
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  revealedPassword: string | null = null;

  private sub: Subscription | null = null;

  constructor(private snackbar: SnackbarService) {}

  // example contact data (from provided design)
  sampleContact: Partial<AdminSettings> = {
    storeName: 'TechZone',
    phone: '+92 300 123 4567',
    city: 'Lahore',
    country: 'Pakistan',
    email: 'info@techzone.pk',
  };

  ngOnInit(): void {
    this.sub = observeAdminSettings().subscribe((s) => {
      this.settings = s;
      // clone for editing so changes aren't immediately persisted until Save
      this.form = JSON.parse(JSON.stringify(s));
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }

  saveSettings() {
    if (!this.form) return;
    updateAdminSettings(this.form).subscribe({
      next: () => {
        this.snackbar.show('Settings saved', { type: 'success', duration: 2500 });
      },
      error: (err) => {
        console.error(err);
        this.snackbar.show('Failed to save settings', { type: 'error', duration: 2500 });
      },
    });
  }

  changePassword() {
    if (!this.oldPassword || !this.newPassword) {
      this.snackbar.show('Please provide current and new password', { type: 'error' });
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.snackbar.show('New passwords do not match', { type: 'error' });
      return;
    }
    changeAdminPassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.snackbar.show('Password changed', { type: 'success', duration: 2500 });
        this.oldPassword = this.newPassword = this.confirmPassword = '';
      },
      error: (err) => {
        console.error(err);
        this.snackbar.show(err?.message || 'Failed to change password', { type: 'error', duration: 3000 });
      },
    });
  }

  revealCurrentPassword() {
    try {
      const cur = getAdminSettingsSnapshot();
      const hash = cur?.passwordHash || '';
      if (!hash) {
        this.snackbar.show('No admin password is set', { type: 'error', duration: 2500 });
        return;
      }
      if (this.revealedPassword) {
        this.revealedPassword = null;
        return;
      }
      // btoa/atob used in store — decode safely
      const decoded = atob(hash);
      this.revealedPassword = decoded;
      this.snackbar.show('Current password revealed (development only)', { type: 'info', duration: 3500 });
    } catch (err) {
      console.error(err);
      this.snackbar.show('Failed to reveal password', { type: 'error', duration: 2500 });
    }
  }

  copyRevealedPassword() {
    if (!this.revealedPassword) return;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(this.revealedPassword).then(() => {
        this.snackbar.show('Password copied to clipboard', { type: 'success', duration: 2000 });
      }, () => {
        this.snackbar.show('Could not copy to clipboard', { type: 'error' });
      });
    } else {
      this.snackbar.show('Clipboard API not available', { type: 'error' });
    }
  }

  useRevealedPassword() {
    if (!this.revealedPassword) return;
    this.oldPassword = this.revealedPassword;
    this.snackbar.show('Password filled into the current password field', { type: 'success', duration: 1800 });
  }

  loadSampleContact() {
    if (!this.form) return this.snackbar.show('Form not ready', { type: 'error' });
    Object.assign(this.form, this.sampleContact);
    this.snackbar.show('Sample contact loaded into form — review and Save', { type: 'info', duration: 2500 });
  }

  replaceWithSampleContact() {
    updateAdminSettings(this.sampleContact as Partial<AdminSettings>).subscribe({
      next: (s) => {
        this.snackbar.show('Settings replaced with sample contact', { type: 'success', duration: 2500 });
      },
      error: (err) => {
        console.error(err);
        this.snackbar.show('Failed to replace settings', { type: 'error', duration: 2500 });
      },
    });
  }
}
