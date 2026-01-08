import { Component, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})

export class Dashboard {
  private auth = inject(Auth);
  private router = inject(Router);
  userEmail: string = '';
  userInitial: string = '';
  lastLogin: Date = new Date();
  today: Date = new Date();

  // fake notifications
  alerts = [
    { type: 'info', message: 'Please verify your email address.'},
    { type: 'info', message: 'You have 2 upcoming events today.' }
  ];

  profileCompletion: number = 75; // Progress value

  constructor() {
    this.userEmail = this.auth.currentUserEmail || 'Guest';
    // Get the first letter of the email for the avatar
    this.userInitial = this.userEmail.charAt(0).toUpperCase();
  }

  logout() {
    // Clear the token from storage
    this.auth.logout();
    // Redirect back to login
    this.router.navigate(['/login']);
  }
}
