import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent {
  // We make this public so the HTML can access 'isAuthenticated' and 'getUser'
  public authService = inject(AuthService);

  public today: Date = new Date();

  public logout() {
    this.authService.logout();
  }
}
