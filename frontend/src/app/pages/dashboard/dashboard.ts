import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);

  // We initialize it with the token value (which might be the ID),
  // but because it's a signal, when we update it later, the UI will snap to the new value instantly
  userEmail = signal<string>('Guest');

  // Computed Signal for the initial
  // This automatically updates whenever userEmail changes! No manual calculation needed
  userInitial = computed(() => this.userEmail().charAt(0).toUpperCase());

  lastLogin: Date = new Date();
  today: Date = new Date();
  isLoading = signal<boolean>(true); // State for loading data

  // We can make alerts reactive if we plan to fetch them
  alerts: any[] = [
    { type: 'info', message: 'Please verify your email address.' },
    { type: 'info', message: 'You have 2 upcoming events today.' },
  ];

  profileCompletion: number = 75;

  constructor() {}

  // ngOnInit to fetch data when the component loads
  async ngOnInit() {
    const token = this.auth.getToken();

    // Safety check: if no token, the Guard usually catches this, but good to be safe
    if (!token) {
      this.isLoading.set(false);
      return;
    }

    try {
      // The "Protected" Fetch Call
      const response = await fetch('https://neighbour-zone.vercel.app/api/user/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Sends token to server. Without it, server would reject request with 401 error
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data loaded:', data); // CHECK THIS LOG IN BROWSER CONSOLE

        if (data.email) {
          this.userEmail.set(data.email);
        } else if (data.user && data.user.email) {
          this.userEmail.set(data.user.email);
        }
      } else {
        console.warn('Failed to load dashboard data', response.status);
      }
    } catch (error) {
      console.error('Network error loading dashboard', error);
    } finally {
      this.isLoading.set(false); // Stop loading spinner (if you had one)
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
