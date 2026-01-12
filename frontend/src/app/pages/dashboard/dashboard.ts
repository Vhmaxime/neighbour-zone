import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { User } from '../../types/api.types';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class Dashboard implements OnInit {
  private auth = inject(Auth);
  private api = inject(Api);

  // We initialize it with the token value (which might be the ID),
  // but because it's a signal, when we update it later, the UI will snap to the new value instantly
  user = signal<User | null>(null);

  // Computed Signal for the initial
  // This automatically updates whenever userEmail changes! No manual calculation needed
  userInitial = signal('');
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
    this.isLoading.set(true);

    try {
      // We "consume" the observable as a promise right here.
      // This is safe, standard, and doesn't affect api.ts
      const response = await lastValueFrom(this.api.getUserMe());
      
      this.user.set(response.user);
      // specific check to avoid error if username is missing
      if (response.user?.username) {
        this.userInitial.set(response.user.username.charAt(0).toUpperCase());
      }
    } catch (error) {
      console.error('Failed to load user data', error);
      // Optional: Add logic here to handle error (e.g., redirect to login)
    } finally {
      // CHANGE: This runs whether the request succeeds OR fails
      this.isLoading.set(false);
    }
  }

  logout() {
    this.auth.logout();
  }
}
