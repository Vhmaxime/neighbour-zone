import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreatePostRequest, PostResponse, UserResponse } from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  getUserMe() {
    return this.http.get<UserResponse>(`${this.apiUrl}/user/me`);
  }

  getPosts() {
    return this.http.get<PostResponse>(`${this.apiUrl}/post`);
  }

  createPost(content: CreatePostRequest) {
    return this.http.post<PostResponse>(`${this.apiUrl}/post`, content);
  }

  getPost(postId: string) {
    return this.http.get<PostResponse>(`${this.apiUrl}/post/${postId}`);
  }

  updatePost(postId: string, content: Partial<CreatePostRequest>) {
    return this.http.patch<PostResponse>(`${this.apiUrl}/post/${postId}`, content);
  }
}
