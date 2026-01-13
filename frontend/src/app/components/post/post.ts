import { Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Post as P } from '../../types/api.types';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-post',
  imports: [DatePipe, RouterLink, Post],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class Post {
  public post = input.required<P>();
}
