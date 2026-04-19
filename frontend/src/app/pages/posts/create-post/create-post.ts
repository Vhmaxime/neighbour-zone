import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../services/post';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-post',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-post.html'
})
export class CreatePost implements OnInit {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  public isSubmitting = signal(false);
  public error = signal<string | null>(null);
  public communityId = signal<string | null>(null);

  ngOnInit() {
    const cid = this.route.snapshot.queryParamMap.get('communityId');
    if (cid) this.communityId.set(cid);
  }

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

    const communityId = this.communityId();

    firstValueFrom(
      this.postService.createPost({ title, content, ...(communityId ? { communityId } : {}) }),
    )
      .then((data) => {
        if (communityId) {
          this.router.navigate(['/communities', communityId]);
        } else {
          this.router.navigate(['/post', data.post.id]);
        }
      })
      .catch(() => {
        this.error.set('An unknown error occurred.');
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }
}
