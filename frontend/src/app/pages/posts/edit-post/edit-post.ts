import { Component, inject, input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PostService } from '../../../services/post'; 
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.css',
})
export class EditPost implements OnInit {
  // Automatically captured from :id in the route
  id = input.required<string>();

private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);

  isLoading = signal(true);
  isSaving = signal(false);

  editForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    type: ['news', [Validators.required]]
  });

  async ngOnInit() {
    try {
      const response = await firstValueFrom(this.postService.getPost(this.id()));
      const post = response.post;

      this.editForm.patchValue({
        title: post.title,
        content: post.content,
        type: post.type
      });
    } catch (err) {
      console.error('Error loading post:', err);
      this.router.navigate(['/feed']);
    } finally {
      this.isLoading.set(false);
    }
  }

  async onSubmit() {
    if (this.editForm.invalid) return;

    this.isSaving.set(true);
    try {
      await firstValueFrom(
        this.postService.updatePost(this.id(), this.editForm.value as any)
      );
      this.router.navigate(['/feed']);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      this.isSaving.set(false);
    }
  }
}
