import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  FriendsRequestsResponse,
  FriendsResponse,
  SentFriendsRequestsResponse,
  UserResponse,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  getUserMe() {
    return this.http.get<UserResponse>(`${this.apiUrl}/user/me`);
  }

  getFriends() {
    return this.http.get<FriendsResponse>(`${this.apiUrl}/friend/list`);
  }

  getFriendRequests() {
    return this.http.get<FriendsRequestsResponse>(`${this.apiUrl}/friend/requests`);
  }

  getSentFriendRequests() {
    return this.http.get<SentFriendsRequestsResponse>(`${this.apiUrl}/friend/sent`);
  }

  deleteFriend(friendId: string) {
    return this.http.delete(`${this.apiUrl}/friend/remove/${friendId}`);
  }

  acceptFriendRequest(requestId: string) {
    return this.http.patch(`${this.apiUrl}/friend/accept/${requestId}`, {});
  }

  rejectFriendRequest(requestId: string) {
    return this.http.delete(`${this.apiUrl}/friend/reject/${requestId}`);
  }
}
