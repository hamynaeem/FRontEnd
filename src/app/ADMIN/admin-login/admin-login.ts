import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getAdminSettingsSnapshot } from '../../components/stores/admin-store';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-login.html',
  styleUrls: ['./admin-login.css'],
})
export class AdminLogin {
  error = '';

  constructor(private router: Router) {}

  login(ev: Event, username: string, password: string) {
    ev.preventDefault();
    const u = (username || '').trim();
    const p = (password || '').trim();
    if (!u || !p) {
      this.error = 'Please enter username and password';
      return;
    }

    // Prefer the stored admin settings for authentication so password changes take effect
    try {
      const settings = getAdminSettingsSnapshot();
      const acceptedUsernames = [settings?.name?.toString(), settings?.email?.toString(), 'admin']
        .filter(Boolean)
        .map(s => s!.toLowerCase());
      const storedHash = settings?.passwordHash || '';
      const storedPassword = storedHash ? atob(storedHash) : null;
      if (acceptedUsernames.includes(u.toLowerCase()) && storedPassword && p === storedPassword) {
        localStorage.setItem('adminAuth', '1');
        this.router.navigate(['/admin/dashboard']);
        return;
      }
    } catch (err) {
      // fall back to default hard-coded check below
      console.warn('Failed to check stored admin settings', err);
    }

    // Fallback to legacy hard-coded credentials
    const validUser = 'admin';
    const validPass = 'admin123';
    if (u === validUser && p === validPass) {
      localStorage.setItem('adminAuth', '1');
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.error = 'Invalid username or password';
    }
  }

}
