import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreatePostRequest,
  EventResponse,
  Post,
  PostResponse,
  PostsResponse,
} from '../types/api.types';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private envService: EnvironmentService = inject(EnvironmentService);
  private http = inject(HttpClient);

  private readonly apiUrl = this.envService.getAPI_URL();

  public getPosts() {
    return this.http.get<PostsResponse>(`${this.apiUrl}/post`);
  }

  public getPostsByUser(userId: string) {
    return this.http.get<PostsResponse>(`${this.apiUrl}/post`, { params: { postBy: userId } });
  }

  public getPost(postId: string) {
    return this.http.get<Post>(`${this.apiUrl}/post/${postId}`);
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
    return this.http.post<{ liked: boolean }>(`${this.apiUrl}/post/${postId}/like`, {});
  }
}
