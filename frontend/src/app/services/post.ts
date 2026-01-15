import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreatePostRequest, EventResponse, PostResponse, PostsResponse } from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  public getPosts() {
    return this.http.get<PostsResponse>(`${this.apiUrl}/post`);
  }

  public getPostsByUser(userId: string) {
    return this.http.get<PostsResponse>(`${this.apiUrl}/post`, { params: { userId } });
  }

  public getPost(postId: string) {
    return this.http.get<PostResponse>(`${this.apiUrl}/post/${postId}`);
  }

  public createPost(data: CreatePostRequest) {
    return this.http.post<PostResponse>(`${this.apiUrl}/post`, data);
  }

  public updatePost(postId: string, data: Partial<CreatePostRequest>) {
    return this.http.patch<PostResponse>(`${this.apiUrl}/post/${postId}`, data);
  }

  public deletePost(postId: string) {
    return this.http.delete<void>(`${this.apiUrl}/post/${postId}`);
  }

  public likePost(postId: string) {
    return this.http.post<void>(`${this.apiUrl}/post/${postId}/like`, {});
  }
}
