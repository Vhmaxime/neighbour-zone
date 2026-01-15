import { Component, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post as P } from '../../types/api.types';
import { LikeButton } from '../like-button/like-button';

@Component({
  selector: 'app-post',
  imports: [DatePipe, RouterLink, LikeButton],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class Post {
  public post = input.required<P>();
}
