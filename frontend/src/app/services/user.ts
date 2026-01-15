import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreatePostRequest,
  CreateUserRequest,
  CurrentUserResponse,
  UserResponse,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  public getCurrentUser() {
    return this.http.get<CurrentUserResponse>(`${this.apiUrl}/user/me`);
  }

  public getUser(userId: string) {
    return this.http.get<UserResponse>(`${this.apiUrl}/user/${userId}`);
  }

  public updateCurrentUser(data: Partial<CreateUserRequest>) {
    return this.http.patch<CurrentUserResponse>(`${this.apiUrl}/user/me`, data);
  }

  public updateCurrentUserPassword(
    data: Partial<{ currentPassword: string; newPassword: string }>
  ) {
    return this.http.patch<void>(`${this.apiUrl}/user/me/password`, data);
  }

  public deleteCurrentUser() {
    return this.http.delete<void>(`${this.apiUrl}/user/me`);
  }
}
