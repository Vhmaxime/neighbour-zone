import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Api } from '../../services/api';

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
  private api = inject(Api);

  // We initialize it with the token value (which might be the ID),
  // but because it's a signal, when we update it later, the UI will snap to the new value instantly
  userEmail: string = '';

  // Computed Signal for the initial
  // This automatically updates whenever userEmail changes! No manual calculation needed
  userInitial = computed(() => this.userEmail.charAt(0).toUpperCase());

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
    console.log(this.auth.getUser());
    try {
      const me = await this.api.getUserMe();

      console.log('Fetched user data:', me);
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
