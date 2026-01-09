import { Injectable } from '@angular/core';
import { AuthResponse, ErrorResponse } from '../types/api.types';

@Injectable({ providedIn: 'root' })
export class Auth {
  // URL is defined here
  private apiUrl: string = 'https://neighbour-zone.vercel.app/api';

  constructor() {}

  private setToken(token: string, rememberMe: boolean) {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
    } else {
      sessionStorage.setItem('authToken', token);
    }
  }

  public getToken(): string | null {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  }

  public isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token;
  }

  public async login(email: string, password: string, rememberMe: boolean) {
    try {
      const response = await fetch(`${this.apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data: AuthResponse = await response.json();

      this.setToken(data.accessToken, rememberMe);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  public async register(
    name: string,
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorData: ErrorResponse = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      const data: AuthResponse = await response.json();

      this.setToken(data.accessToken, rememberMe);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  public logout() {
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
  }
}
