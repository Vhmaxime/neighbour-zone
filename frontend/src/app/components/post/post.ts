import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post as P } from '../../types/api.types';
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
  public post = input.required<P>();
}
