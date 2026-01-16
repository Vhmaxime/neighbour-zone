import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post as P } from '../../types/api.types';
import { LikeButton } from '../like-button/like-button';

@Component({
  selector: 'app-post-tile',
  imports: [DatePipe, RouterLink, LikeButton],
  templateUrl: './post-tile.html',
  styleUrl: './post-tile.css',
})
export class PostTile {
  public post = input.required<P>();
}
