import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PostService } from '../../../services/post';
import { Post } from '../../../types/api.types';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../services/auth';
import { BackButton } from '../../../components/back-button/back-button';
import { EditButton } from '../../../components/edit-button/edit-button';
import { DeleteButton } from '../../../components/delete-button/delete-button';

@Component({
  selector: 'app-post-details',
  imports: [RouterLink, DatePipe, BackButton, EditButton, DeleteButton],
  templateUrl: './post-details.html',
  styleUrl: './post-details.css',
})
export class PostDetails {
  private activatedRoute = inject(ActivatedRoute);
  private postService = inject(PostService);
  private router = inject(Router);
  private location = inject(Location);
  private authService = inject(AuthService);
  private postId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  public post = signal<Post | null>(null);
  public isLoading = signal(false);
  public isError = signal(false);
  public isAuthor = computed<boolean>(
    () => this.post()?.author.id === this.authService.getUser()?.sub
  );

  public ngOnInit() {
    this.loadPost();
  }

  private loadPost() {
    this.isLoading.set(true);
    firstValueFrom(this.postService.getPost(this.postId))
      .then((data) => {
        this.post.set(data.post);
      })
      .catch((error) => {
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        } else {
          console.error('Error loading user content:', error);
          this.isError.set(true);
        }
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public onPostDeleted() {
    this.router.navigate(['/feed']);
  }

}
