import { inject, Injectable, signal } from '@angular/core';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/api.types';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  roles: string;
  exp: number;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private router = inject(Router);

  private readonly apiUrl = 'http://localhost:3000/api';
  private readonly accessToken = 'accessToken';

  private readonly user = signal<JwtPayload | null>(null);
  isAuthenticated = signal<boolean>(!!this.getToken());

  constructor() {
    if (this.isAuthenticated()) {
      this.setUser(this.getToken() as string);
    }
  }

  private setUser(token: string): void {
    try {
      const user = jwtDecode<JwtPayload>(token);
      this.user.set(user);
    } catch (e) {
      this.logout();
    }
  }

  public getToken(): string | null {
    return localStorage.getItem(this.accessToken) || sessionStorage.getItem(this.accessToken);
  }

  private setToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem(this.accessToken, token);
    } else {
      sessionStorage.setItem(this.accessToken, token);
    }
    this.isAuthenticated.set(true);
    this.setUser(token);
  }

  private removeToken(): void {
    localStorage.removeItem(this.accessToken);
    sessionStorage.removeItem(this.accessToken);
    this.isAuthenticated.set(false);
    this.user.set(null);
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
