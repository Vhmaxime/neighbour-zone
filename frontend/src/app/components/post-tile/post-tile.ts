import { Component, inject, output, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post as P } from '../../types/api.types';
import { LikeButton } from '../like-button/like-button';
import { PostActions } from '../post-actions/post-actions';

@Component({
  selector: 'app-post-tile',
  imports: [DatePipe, RouterLink, LikeButton, PostActions],
  templateUrl: './post-tile.html',
  styleUrl: './post-tile.css',
})
export class PostTile {
  public post = input.required<P>();
  public deleted = output<string>();

  // Helper method to bridge the action from the child component to the feed
  public onPostDeleted(id: string) {
    this.deleted.emit(id);
  }
}
