import { Component, inject, OnInit, signal } from '@angular/core';
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
export class Dashboard implements OnInit { // Added OnInit interface
  private auth = inject(Auth);
  private router = inject(Router);

  userEmail: string = '';
  userInitial: string = '';
  lastLogin: Date = new Date();
  today: Date = new Date();
  
  // State for loading data
  isLoading = true;

  // We can make alerts reactive if we plan to fetch them
  alerts: any[] = [
    { type: 'info', message: 'Please verify your email address.'},
    { type: 'info', message: 'You have 2 upcoming events today.' }
  ];

  profileCompletion: number = 75;

  constructor() {
    this.userEmail = this.auth.currentUserEmail || 'Guest';
    this.userInitial = this.userEmail.charAt(0).toUpperCase();
  }

  // ngOnInit to fetch data when the component loads
  async ngOnInit() {
    const token = this.auth.getToken();
    
    // Safety check: if no token, the Guard usually catches this, but good to be safe
    if (!token) {
       this.isLoading = false;
       return; 
    }

    try {
      // The "Protected" Fetch Call
      const response = await fetch('https://neighbour-zone.vercel.app/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`, // Sends token to server. Without it, server would reject request with 401 error
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data loaded:', data);
        
        // Example: If the API returned real alerts, you would update them here:
        // this.alerts = data.alerts;
        
        // Example: If API returned real profile status
        // this.profileCompletion = data.completionPercentage;
      } else {
        console.warn('Failed to load dashboard data', response.status);
      }

    } catch (error) {
      console.error('Network error loading dashboard', error);
    } finally {
      this.isLoading = false; // Stop loading spinner (if you had one)
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
