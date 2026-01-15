import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post as P } from '../../types/api.types';
import { PostService } from '../../services/post';
import { firstValueFrom } from 'rxjs';
import { LikeButton } from '../like-button/like-button';
import { PostActions } from '../post-actions/post-actions';
import { output } from '@angular/core';

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [DatePipe, RouterLink, LikeButton, PostActions],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class Post {
  private postService = inject(PostService);
  public post = input.required<P>();
  public deleted = output<string>();

  public toggleLike() {
    const liked = this.post().liked;

    this.post().liked = !liked;

    if (liked) {
      this.post().likes -= 1;
    } else {
      this.post().likes += 1;
    }

    firstValueFrom(this.postService.likePost(this.post().id)).catch(() => {
      this.post().liked = liked;
      if (liked) {
        this.post().likes += 1;
      } else {
        this.post().likes -= 1;
      }
    });
  }
}
