import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard {
  private auth = inject(Auth);
  private router = inject(Router);

  logout() {
    // 1. Clear the token from storage
    this.auth.logout();
    
    // 2. Redirect back to login
    this.router.navigate(['/login']);
  }
}
