import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post as P } from '../../types/api.types';
import { PostService } from '../../services/post';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-post',
  imports: [DatePipe, RouterLink],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class Post {
  private postService = inject(PostService);
  public post = input.required<P>();

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
