import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

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

    // Simple hard-coded check (change to real auth as needed)
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
