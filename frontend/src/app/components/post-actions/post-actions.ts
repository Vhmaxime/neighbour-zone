import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PostService } from '../../services/post';

@Component({
  selector: 'app-post-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isAuthor()) {
      <div class="flex items-center space-x-3 mr-2">
        <button 
          (click)="onEdit($event)" 
          class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Edit
        </button>
        <button 
          (click)="onDelete($event)" 
          class="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
        >
          Delete
        </button>
      </div>
    }
  `
})
export class PostActions {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private router = inject(Router);

  postId = input.required<string>();
  authorId = input.required<string>();
  postTitle = input.required<string>();
  
  deleted = output<string>();

  isAuthor(): boolean {
    const user = this.authService.getUser();
    // Using .sub because that's where the ID is stored in your JWT
    return user?.sub === this.authorId();
  }

  onEdit(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/posts', this.postId(), 'edit']);
  }

  onDelete(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm(`Are you sure you want to delete "${this.postTitle()}"?`)) {
      this.postService.deletePost(this.postId()).subscribe({
        next: () => {
          this.deleted.emit(this.postId());
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}
