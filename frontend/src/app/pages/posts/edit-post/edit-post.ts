import { Component, inject, signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PostService } from '../../../services/post'; 
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.css',
})
export class EditPost {

  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private postId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  isLoading = signal(true);
  isSaving = signal(false);

  editForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    type: ['news', [Validators.required]]
  });

  constructor() {
    this.loadPost();
  }

  private async loadPost() {
    try {
      this.isLoading.set(true);
      // Use the snapshot ID, not an input signal
      const response = await firstValueFrom(this.postService.getPost(this.postId));
      
      const post = response.post || response;

      if (post) {
        this.editForm.patchValue({
          title: post.title,
          content: post.content,
          type: post.type
        });
      }
    } catch (err) {
      console.error('Error loading post:', err);
      this.router.navigate(['/feed']);
    } finally {
      this.isLoading.set(false);
    }
  }

  public async onSubmit() {
    if (this.editForm.invalid) return;

    this.isSaving.set(true);
    try {
      await firstValueFrom(
        this.postService.updatePost(this.postId, this.editForm.value as any)
      );
      this.router.navigate(['/feed']);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      this.isSaving.set(false);
    }
  }
}
