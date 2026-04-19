import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class NavbarComponent {
  public authService = inject(AuthService);
  public today: Date = new Date();
  
  // Hiermee houden we bij of het mobiele menu open is
  public isMobileMenuOpen = signal(false);

  public logout() {
    this.authService.logout();
  }

  public toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  public closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
