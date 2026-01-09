import { Injectable, inject } from '@angular/core';
import { Auth } from './auth';
import { CreatePostRequest, Post, PostResponse, UserResponse } from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private auth = inject(Auth);

  private async fetchApi<T>(endpoint: string, options: RequestInit): Promise<T> {
    const token = this.auth.getToken();

    const response = await fetch(`${this.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.status === 401) {
      this.auth.logout();
    }

    if (!response.ok) {
      const errorMessage = await response.json();
      return errorMessage.message || 'Something went wrong';
    }

    const data = await response.json();
    return data;
  }

  async getUserMe(): Promise<UserResponse> {
    return await this.fetchApi<UserResponse>('/user/me', {
      method: 'GET',
    });
  }

  async getPosts() {
    return await this.fetchApi<PostResponse>('/post', {
      method: 'GET',
    });
  }

  async createPost(content: CreatePostRequest) {
    return await this.fetchApi<PostResponse>('/post', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async getPost(postId: string) {
    return await this.fetchApi<PostResponse>(`/post/${postId}`, {
      method: 'GET',
    });
  }

  updatePost(postId: string, content: Partial<CreatePostRequest>) {
    return this.fetchApi<PostResponse>(`/post/${postId}`, {
      method: 'PATCH',
      body: JSON.stringify(content),
    });
  }
}
