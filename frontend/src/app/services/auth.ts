import { Injectable } from '@angular/core';

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

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Decode the token payload
      const payloadBase64 = token.split('.')[1];
      const payloadJson = atob(payloadBase64);
      const payload = JSON.parse(payloadJson);

      // Check Expiration (exp is in seconds, Date.now() is in ms)
      if (payload.exp) {
        const isExpired = Date.now() >= payload.exp * 1000;
        if (isExpired) {
          this.logout(); // Clean up the expired token automatically
          return false;
        }
      }
      return true;
    } catch (e) {
      // If token is malformed, treat as not logged in
      return false;
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

  // --- Helper to handle Fetch logic & Errors ---
  private async request(endpoint: string, body: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Handle "Success" (Status 200-299)
    if (response.ok) {
      // Check if there is actually content before parsing
      if (response.status === 204) {
        return {}; // Return empty object for "No Content"
      }
      return response.json();
    }

    // Parse the backend error message (if available)
    let errorData;
    try {
      errorData = await response.json();
    } catch (parseError) {
      errorData = { message: 'An unexpected error occurred.' };
    }

    const errorMessage = errorData.message || 'Unknown error';

    // Handle Specific Status Codes
    switch (response.status) {
      case 400:
        // Bad Request: User entered wrong data (e.g., invalid email format)
        throw new Error(`Validation Error: ${errorMessage}`);
      
      case 401:
        // Unauthorized: Wrong password or email
        throw new Error(`Login Failed: ${errorMessage}`);

      case 500:
        // Server Error: Something broke on the backend
        throw new Error('Server Error: Please try again later.');

      default:
        // Catch-all for other weird errors (e.g. 503 Service Unavailable)
        throw new Error(`Error (${response.status}): ${errorMessage}`);
    }
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


