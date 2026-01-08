import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Auth {
  // URL is defined here
  private baseUrl: string = 'https://neighbour-zone.vercel.app/api';

  constructor() {}

  get currentUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);
      return payload.email || payload.sub || null;
    } catch (e) {
      console.error('Error decoding token', e);
      return null;
    }
  }

  async register(payload: { name: string; email: string; password: string }): Promise<any> {
    return this.request('/register', payload);
  }

  async login(payload: { email: string; password: string }): Promise<any> {
    return this.request('/login', payload);
  }

  async resetPassword(email: string): Promise<any> {
    return this.request('/reset-password', { email });
  }

  // --- Helper to keep the fetch logic DRY ---
  private async request(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw error;
    }

    return response.json();
  }

  // Token Logic

  getToken(): string | null {
    return localStorage.getItem('authToken')
      || sessionStorage.getItem('authToken');
  }

  saveToken(token: string, rememberMe: boolean): void {
    if (rememberMe) {
      localStorage.setItem('authToken', token);
      sessionStorage.removeItem('authToken');
    } else {
      sessionStorage.setItem('authToken', token);
      localStorage.removeItem('authToken');
    }
  }

  logout(): void {
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('authToken');
  }
}


