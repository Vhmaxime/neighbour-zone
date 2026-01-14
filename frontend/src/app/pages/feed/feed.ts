import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Post as PostType } from '../../types/api.types';
import { Post as PostComponent } from '../../components/post/post';
import { Title } from '@angular/platform-browser';
import { Observable, map, catchError, of } from 'rxjs';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, PostComponent],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private api = inject(Api);
  private titleService = inject(Title);

  // Consistency: Using the Observable stream pattern
  public posts$: Observable<PostType[]> = of([]);

  ngOnInit() {
    // Consistency: Using the Title pattern we just built
    this.titleService.setTitle('Feed | Neighbour Zone');
    
    this.posts$ = this.api.getPosts().pipe(
      map((response: any) => {
        // Accessing the 'posts' array from the API response envelope
        // and taking the last 10 for the feed
        return response.posts ? response.posts.slice(0, 10) : [];
      }),
      catchError(err => {
        console.error('Failed to load feed', err);
        return of([]); 
      })
    );
  }
}
