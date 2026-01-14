import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FriendsResponse } from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  public getFriends() {
    return this.http.get<FriendsResponse>(`${this.apiUrl}/friend`);
  }

  public deleteFriend(friendId: string) {
    return this.http.delete(`${this.apiUrl}/friend/remove/${friendId}`);
  }

  public acceptFriendRequest(requestId: string) {
    return this.http.patch(`${this.apiUrl}/friend/accept/${requestId}`, {});
  }

  public rejectFriendRequest(requestId: string) {
    return this.http.delete(`${this.apiUrl}/friend/reject/${requestId}`);
  }

  public cancelFriendRequest(requestId: string) {
    return this.http.delete(`${this.apiUrl}/friend/request/${requestId}`);
  }
}
