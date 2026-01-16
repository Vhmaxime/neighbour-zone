import { Component, inject, input, signal, effect } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PostService } from '../../../services/post';
import { Post as P} from '../../../types/api.types';
import { firstValueFrom } from 'rxjs';


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
  private router = inject(Router);
  
  public post = signal<P | null>(null);
  public isLoading = signal(true);
  public handleDeleted() {
  this.router.navigate(['/feed']);
  }

  constructor() {
    effect(async () => {
      const postId = this.id();
      if (!postId) return;

      try {
        this.isLoading.set(true);
        const response = await firstValueFrom(this.postService.getPost(postId));

        // Handle potential nested response structures
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

  public onPostDeleted() {
    this.router.navigate(['/feed']);
  }
}