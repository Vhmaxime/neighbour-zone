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

  public isSubmitting = signal(false);
  public error = signal<string | null>(null);

  // Initialize form with empty values
  public createForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    content: ['', [Validators.maxLength(500)]],
  });

  public onSubmit() {
    if (this.createForm.invalid) return;

    const { content, title } = this.createForm.value;

    if (!title) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    firstValueFrom(this.postService.createPost({ title, content }))
      .then((data) => {
        this.router.navigate(['/post', data.post.id]);
      })
      .catch(() => {
        this.error.set('An unknown error occurred.');
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }
}
