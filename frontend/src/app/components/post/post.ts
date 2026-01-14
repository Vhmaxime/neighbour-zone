import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post as P } from '../../types/api.types';
import { Api } from '../../services/api';

@Component({
  selector: 'app-post',
  imports: [DatePipe, RouterLink],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class Post {
  private api = inject(Api);
  public post = input.required<P>();

  public toggleLike() {
    const liked = this.post().liked;

    this.post().liked = !liked;

    if (liked) {
      this.post().likes -= 1;
    } else {
      this.post().likes += 1;
    }

    this.api.tooglePostLike(this.post().id).subscribe({
      error: () => {
        this.post().liked = liked;
        if (liked) {
          this.post().likes += 1;
        } else {
          this.post().likes -= 1;
        }
      },
    });
  }
}
