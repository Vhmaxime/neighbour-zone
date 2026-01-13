import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class NavbarComponent {
  // We make this public so the HTML can access 'isAuthenticated' and 'getUser'
  public auth = inject(Auth);

  today: Date = new Date();

  logout() {
    this.auth.logout();
  }
}