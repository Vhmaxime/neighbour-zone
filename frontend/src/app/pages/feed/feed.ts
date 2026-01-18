import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';
import { PostService } from '../../services/post';
import { CreatePostButton } from '../../components/create-post-button/create-post-button';
import { PostTile } from '../../components/post-tile/post-tile';
import { Post as P } from '../../types/api.types';
import { LoadingComponent } from "../../components/loading-component/loading-component";

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, CreatePostButton, PostTile, LoadingComponent],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private postService = inject(PostService);
  private titleService = inject(Title);

  public isLoading = signal(false);
  public feedItems = signal<P[]>([]);

  ngOnInit() {
    this.titleService.setTitle('Feed | Neighbour Zone');
    this.loadFeed();
  }

  public handleItemDeleted(id: string) {
    this.feedItems.update((items) => items.filter((item) => item.id !== id));
  }

  private loadFeed() {
    this.isLoading.set(true);

    this.postService.getPosts()
      .pipe(
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: (response) => {
          const posts = response.posts || [];

          const sorted = [...posts].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          this.feedItems.set(sorted);
        },
        error: (err) => {
          console.error('Error loading feed:', err);
        }
      });
  }
}
