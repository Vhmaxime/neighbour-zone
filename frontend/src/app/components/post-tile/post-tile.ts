import { Component, output, input, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink, Router} from '@angular/router';
import { Post as P } from '../../types/api.types';
import { LikeButton } from '../like-button/like-button';
import { ActionButton } from '../../components/action-button/action-button';

@Component({
  selector: 'app-post-tile',
  imports: [DatePipe, RouterLink, LikeButton, ActionButton],
  templateUrl: './post-tile.html',
  styleUrl: './post-tile.css',
})
export class PostTile {
  public post = input.required<P>();
  public deleted = output<string>();

  private router = inject(Router);

  public viewPost() {
    console.log('Navigating to post:', this.post().id);
    this.router.navigate(['/post', this.post().id]);
  }

  // Helper method to bridge the action from the child component to the feed
  public onPostDeleted(id: string) {
    this.deleted.emit(id);
  }
}
