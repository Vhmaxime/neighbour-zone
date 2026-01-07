import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Auth {
  // URL is defined here
  private baseUrl: string = 'https://example.com/api';

  constructor(private http: HttpClient) {}

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

  register(payload: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, payload);
  }

  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/login`, payload);
  }

  resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { email });
  }

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


