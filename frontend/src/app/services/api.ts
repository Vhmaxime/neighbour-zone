import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  EventResponse,
  EventsResponse,
  FriendsResponse,
  MarketplaceItemResponse,
  MarketplaceItemsResponse,
  Post,
  PostResponse,
  PostsResponse,
  UserMeResponse,
  UserResponse,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  getUser(userId: string) {
    return this.http.get<UserResponse>(`${this.apiUrl}/user/${userId}`);
  }

  getUserPosts(userId: string) {
    return this.http.get<PostsResponse>(`${this.apiUrl}/post/user/${userId}`);
  }

  getUserEvents(userId: string) {
    return this.http.get<EventsResponse>(`${this.apiUrl}/event/user/${userId}`);
  }

  getUserMarketplaceItems(userId: string) {
    return this.http.get<MarketplaceItemsResponse>(`${this.apiUrl}/marketplace/user/${userId}`);
  }

  getUserMe() {
    return this.http.get<UserMeResponse>(`${this.apiUrl}/user/me`);
  }

  getFriends() {
    return this.http.get<FriendsResponse>(`${this.apiUrl}/friend`);
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

  cancelFriendRequest(requestId: string) {
    return this.http.delete(`${this.apiUrl}/friend/request/${requestId}`);
  }

  updateMyPassword(currentPassword: string, newPassword: string) {
    return this.http.patch(`${this.apiUrl}/user/me/password`, {
      currentPassword,
      newPassword,
    });
  }

  deleteMyAccount() {
    return this.http.delete(`${this.apiUrl}/user/me`);
  }

  tooglePostLike(postId: string) {
    return this.http.post(`${this.apiUrl}/post/like/${postId}`, {});
  }

  getPost(postId: string) {
    return this.http.get<PostResponse>(`${this.apiUrl}/post/${postId}`);
  }

  getPosts() {
    return this.http.get<PostsResponse>(`${this.apiUrl}/post`);
  }

  getEvent(eventId: string) {
    return this.http.get<EventResponse>(`${this.apiUrl}/event/${eventId}`);
  }

  getMarketplaceItem(itemId: string) {
    return this.http.get<MarketplaceItemResponse>(`${this.apiUrl}/marketplace/${itemId}`);
  }
  updateMyProfile(data: {
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    bio: string | undefined;
  }) {
    return this.http.patch(`${this.apiUrl}/user/me`, data);
  }

  createPost(data: { title: string; content: string; type: 'news' | 'tip' }) {
    return this.http.post<PostResponse>(`${this.apiUrl}/post`, data);
  }
}
