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

  public isLoading = signal(true);
  public isSaving = signal(false);

  // Added 'question' to types just in case
  public editForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    content: ['', [Validators.required, Validators.minLength(10)]],
    type: ['news', [Validators.required]]
  });

  constructor() {
    this.loadPost();
  }

  private async loadPost() {
    // Safety Check
    if (!this.postId) {
      console.error('❌ Error: No Post ID found in URL');
      this.router.navigate(['/feed']);
      return;
    }

    try {
      this.isLoading.set(true);

      // TIMEOUT FIX: If backend takes > 3s, stop spinning
      const fetchPromise = firstValueFrom(this.postService.getPost(this.postId));
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      );

      // Race the fetch against the clock
      const response: any = await Promise.race([fetchPromise, timeoutPromise]);
      
      // Handle { post: ... } vs raw response
      const post = response.post || response;

      if (post) {
        this.editForm.patchValue({
          title: post.title,
          content: post.content,
          type: post.type
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
