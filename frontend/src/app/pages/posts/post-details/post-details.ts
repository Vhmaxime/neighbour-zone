import { Component, inject, input, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { PostService } from '../../../services/post';
import { Post as P } from '../../../types/api.types';
import { firstValueFrom } from 'rxjs';
import { BackButton } from '../../../components/back-button/back-button';
import { EditButton } from '../../../components/edit-button/edit-button';
import { DeleteButton } from '../../../components/delete-button/delete-button';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, DatePipe, BackButton, EditButton, DeleteButton],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css',
})
export class PostDetails {
  // Automatically bound to the ':id' in your route
  id = input.required<string>();

  private postService = inject(PostService);
  private router = inject(Router);
  
  public post = signal<P | null>(null);
  public isLoading = signal(true);
  public isError = signal(false);

  constructor() {
    // Whenever the 'id' signal changes, fetch the new post
    effect(async () => {
      const postId = this.id();
      if (!postId) return;

      try {
        this.isLoading.set(true);
        this.isError.set(false);
        const response = await firstValueFrom(this.postService.getPost(postId));
        
        // Handling nested response structure
        this.post.set(response?.post || response);
      } catch (error: any) {
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        } else {
          console.error('Error loading post:', error);
          this.isError.set(true);
        }
      } finally {
        this.isLoading.set(false);
      }
    });
  }

  // If a post is deleted while the user is viewing its details, send them back to the feed
  onPostDeleted() {
    this.router.navigate(['/feed']);
  }
}
