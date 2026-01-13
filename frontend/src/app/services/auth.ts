import { inject, Injectable, signal } from '@angular/core';
import type { RegisterRequest, LoginRequest, AuthResponse } from '../types/api.types';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

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

  // Ensure this API URL matches the backend configuration
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

  public register(data: RegisterRequest) {
      return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data).pipe(
        tap((response) => {
          this.authenticate(response.accessToken);
        })
      );
  }

  public login(data: LoginRequest) {
      return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
        tap((response)=> {
          this.authenticate(response.accessToken, data.rememberMe);
        }) 
      );
  }

  public resetPassword(email: string) {
    // We expect the backend to return 200 OK (and maybe a message),
    // but we don't necessarily need the response body here.
      return this.http.post<void>(`${this.apiUrl}/auth/reset-password`, { email });
  }

  public logout(): void {
    this.removeToken();
    this.router.navigate(['/login']);
  }
}
