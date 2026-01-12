import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';
import { User } from '../../types/api.types';

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
  ngOnInit() {
    this.isLoading.set(true);

    this.api.getUserMe().subscribe({
      next: (response) => {
        this.user.set(response.user);
        this.userInitial.set(response.user.name.charAt(0).toUpperCase());
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  logout() {
    this.auth.logout();
  }
}
