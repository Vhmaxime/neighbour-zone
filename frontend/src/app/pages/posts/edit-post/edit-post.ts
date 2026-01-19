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
  // Injected services
  private postService = inject(PostService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);

  // Get ID from route params
  public postId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  // State signals
  public isLoading = signal(true);
  public isSaving = signal(false);
  public error = signal<string | null>(null);
  public isSuccess = signal(false);

  // Store full post object for ActionButton usage
  public post = signal<any>(null);

  // Form definition
  public editForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(255)]],
    content: ['', [Validators.maxLength(500)]],
  });

  public ngOnInit() {
    this.loadPost();
  }

  private loadPost() {
    this.isLoading.set(true);
    this.error.set(null);
    this.isSuccess.set(false);

    if (!this.postId) {
      this.router.navigate(['/feed']);
      return;
    }

    firstValueFrom(this.postService.getPost(this.postId))
      .then((response: any) => {
        const postData = response.post || response;
        if (!postData) {
          this.router.navigate(['/feed']);
          return;
        }
        this.post.set(postData);
        this.setFormValues(postData);
      })
      .catch((err) => {
        this.error.set('An error occurred while loading the post.');
        console.error('rror loading post:', err);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private setFormValues(post: any) {
    const { title, content } = post;
    this.editForm.patchValue({
      title,
      content,
    });
  }

  public onSubmit() {
    this.editForm.markAllAsTouched();
    const { title, content } = this.editForm.value;
    if (this.editForm.invalid || !title) {
      return;
    }

    this.isSaving.set(true);
    this.error.set(null);
    this.isSuccess.set(false);

    firstValueFrom(this.postService.updatePost(this.postId, { title, content }))
      .then((data) => {
        this.isSuccess.set(true);
        this.router.navigate(['/post', data.post.id]);
      })
      .catch((err) => {
        this.error.set('Failed to update post. Please try again later.');
        console.error('Update failed:', err);
      })
      .finally(() => {
        this.isSaving.set(false);
      });
  }

  public onPostDeleted() {
    this.router.navigate(['/feed']);
  }
}
