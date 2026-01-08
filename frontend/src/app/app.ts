import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Auth } from './services/auth';
import { NavbarComponent } from './navbar/navbar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {
  private auth = inject(Auth);

  constructor() {
    const token = this.auth.getToken();
    if (token) {
      console.log('Session restored');
    }
  }
}
