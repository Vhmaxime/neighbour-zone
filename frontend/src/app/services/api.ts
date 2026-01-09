import { Injectable, inject } from '@angular/core';
import { Auth } from './auth';
import { UserResponse } from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private auth = inject(Auth);

  async getUserMe(): Promise<UserResponse> {
    const token = this.auth.getToken();

    const response = await fetch(`${this.apiUrl}/user/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status}`);
    }

    const data: UserResponse = await response.json();

    return data;
  }
}
