import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { FriendshipResponse, FriendsResponse } from '../types/api.types';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class FriendService {
  private envService: EnvironmentService = inject(EnvironmentService);
  private http = inject(HttpClient);

  private readonly apiUrl = this.envService.getAPI_URL();

  public getFriends() {
    return this.http.get<FriendsResponse>(`${this.apiUrl}/friend`);
  }

  public getFriendship(userId: string) {
    return this.http.get<FriendshipResponse>(`${this.apiUrl}/friend/friendship/${userId}`);
  }

  public sendFriendRequest(userId: string) {
    return this.http.post<void>(`${this.apiUrl}/friend/request/${userId}`, {});
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
