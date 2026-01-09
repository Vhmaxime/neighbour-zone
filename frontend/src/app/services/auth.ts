import { inject, Injectable, signal } from '@angular/core';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/api.types';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private router = inject(Router);

  private readonly apiUrl = 'http://localhost:3000/api';
  private readonly accessToken = 'accessToken';

  isAuthenticated = signal<boolean>(this.hasToken());

  public getToken(): string | null {
    return localStorage.getItem(this.accessToken) || sessionStorage.getItem(this.accessToken);
  }

  private hasToken(): boolean {
    return !!this.getToken();
  }

  private setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.accessToken, token);
    } else {
      sessionStorage.setItem(this.accessToken, token);
    }
    this.isAuthenticated.set(true);
  }

  private removeToken(): void {
    localStorage.removeItem(this.accessToken);
    sessionStorage.removeItem(this.accessToken);
    this.isAuthenticated.set(false);
  }

  async register(data: RegisterRequest): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Registration failed');
    }

    const result: AuthResponse = await response.json();

    this.setToken(result.accessToken, false);
  }

  async login(data: LoginRequest, rememberMe: boolean): Promise<void> {
    const response = await fetch(`${this.apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const result: AuthResponse = await response.json();

    this.setToken(result.accessToken, rememberMe);
  }

  public logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }
}
