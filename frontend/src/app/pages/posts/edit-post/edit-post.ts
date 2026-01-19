import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PostService } from '../../../services/post';
import { firstValueFrom } from 'rxjs';
import { ActionButton } from '../../../components/action-button/action-button';
import { LoadingComponent } from '../../../components/loading-component/loading-component';

@Component({
  selector: 'app-edit-post',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ActionButton, LoadingComponent],
  templateUrl: './edit-post.html',
  styleUrl: './edit-post.css',
})
export class EditPost {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private postId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  public isLoading = signal(true);
  public isSaving = signal(false);
  public error = signal<string | null>(null);

  public post = signal<any>(null);

  public editForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)], Validators.maxLength(255)],
    content: ['', [Validators.maxLength(500)]]
  });

  constructor() {
    this.loadPost();
  }

  private async loadPost() {
    // Safety Check
    if (!this.postId) {
      this.router.navigate(['/feed']);
      return;
    }

    try {
      this.isLoading.set(true);

      // TIMEOUT FIX: If backend takes > 3s, stop spinning
      const fetchPromise = firstValueFrom(this.postService.getPost(this.postId));
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 3000),
      );

      // Race the fetch against the clock
      const response: any = await Promise.race([fetchPromise, timeoutPromise]);

      // Handle { post: ... } vs raw response
      const postData = response.post || response;

      console.log('✅ Setting post signal:', postData);

      // Must save the data to the signal
      this.post.set(postData);

      if (postData) {
        this.editForm.patchValue({
          title: postData.title,
          content: postData.content
        });
      }
    } catch (err) {
      console.error('❌ Error loading post:', err);
    } finally {
      // Stop loading no matter what
      this.isLoading.set(false);
    }
  }

  public async onSubmit() {
    if (this.editForm.invalid) return;

    this.isSaving.set(true);
    try {
      await firstValueFrom(this.postService.updatePost(this.postId, this.editForm.value as any));
      this.router.navigate(['/feed']);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      this.isSaving.set(false);
    }
  }

  onPostDeleted(id: string) {
    this.router.navigate(['/feed']);
  }
}
