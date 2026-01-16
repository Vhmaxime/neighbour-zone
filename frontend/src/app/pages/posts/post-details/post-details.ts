import { Component, inject, input, signal, computed, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PostService } from '../../../services/post';
import { Post } from '../../../types/api.types';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css',
})
export class PostDetails {
  // This automatically captures the ':id' from the route
  id = input.required<string>();

  private postService = inject(PostService);
  private authService = inject(AuthService);
  
  public post = signal<Post | null>(null);
  public isLoading = signal(true);


  public isAuthor = computed(() => {
    const currentPost = this.post();
    const currentUser = this.authService.getUser() as any;

    if (!currentPost || !currentUser) return false;

    return currentPost.author.id === currentUser.id;
  });

  constructor() {
  effect(async () => {
    const postId = this.id();
    if (!postId) return;

    try {
      this.isLoading.set(true);
      const response = await firstValueFrom(this.postService.getPost(postId));
      this.post.set(response?.post || response);
    } catch (error) {
      console.error('API failed', error);
      this.post.set(null); 
    } finally {
      // Ensures the spinner disappears no matter what
      this.isLoading.set(false); 
    }
  });
  }
}