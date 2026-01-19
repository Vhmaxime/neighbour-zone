import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PostService } from '../../../services/post';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-post',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-post.html',
  styleUrl: './create-post.css',
})
export class CreatePost {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);

  isSaving = signal(false);
  public error = signal<string | null>(null);

  // Initialize form with empty values
  createForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)], Validators.maxLength(255)],
    content: ['', [Validators.maxLength(500)]],
  });

  async onSubmit() {
    if (this.createForm.invalid) return;

    this.isSaving.set(true);
    try {

      await firstValueFrom(
        this.postService.createPost(this.createForm.value as any)
      );
      // Go back to feed after success
      this.router.navigate(['/feed']);
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      this.isSaving.set(false);
    }
  }
}
