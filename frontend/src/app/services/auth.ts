import { inject, Injectable, signal } from '@angular/core';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/api.types';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

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
  private http = inject(HttpClient);

  // Ensure this API URL matches your backend configuration
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private readonly accessToken = 'accessToken';

  private readonly user = signal<JwtPayload | null>(null);
  isAuthenticated = signal<boolean>(!!this.getToken());

  constructor() {
    if (this.isAuthenticated()) {
      this.setUser(this.getToken() as string);
    }
  }

  public getUser(): JwtPayload | null {
    return this.user();
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

  private authenticate(token: string, rememberMe: boolean = false): void {
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

  // =================================================================
  // PUBLIC API METHODS
  // =================================================================

  public async register(data: RegisterRequest): Promise<AuthResponse> {
    // 1. Await the HTTP request
    const response = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data)
    );
    
    // 2. Handle side effects (setting token)
    this.authenticate(response.accessToken);
    
    // 3. Return the data
    return response;
  }

  public async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await lastValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data)
    );
    
    this.authenticate(response.accessToken, data.rememberMe);
    
    return response;
  }

  public async resetPassword(email: string): Promise<void> {
    // We expect the backend to return 200 OK (and maybe a message),
    // but we don't necessarily need the response body here.
    await lastValueFrom(
      this.http.post(`${this.apiUrl}/auth/reset-password`, { email })
    );
  }

  public logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }
}
