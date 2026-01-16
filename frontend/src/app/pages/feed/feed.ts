import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { forkJoin, firstValueFrom } from 'rxjs';
import { EventTile } from '../../components/event-tile/event-tile';
import { MarketplaceTile } from '../../components/marketplace-tile/marketplace-tile';
import { EventService } from '../../services/event';
import { MarketplaceService } from '../../services/marketplace';
import { PostService } from '../../services/post';
import { Post } from '../../components/post/post';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, EventTile, MarketplaceTile, Post],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private eventService = inject(EventService);
  private marketplaceService = inject(MarketplaceService);
  private postService = inject(PostService);
  private titleService = inject(Title);

  public isLoading = signal(false);
  public feedItems = signal<any[]>([]);

  ngOnInit() {
    this.titleService.setTitle('Feed | Neighbour Zone');
    this.loadFeed();
  }

  public handleItemDeleted(id: string) {
    this.feedItems.update(items => items.filter(item => item.id !== id));
  }

  private loadFeed() {
    this.isLoading.set(true);
    firstValueFrom(
      forkJoin({
        eventsReq: this.eventService.getEvents(),
        marketplaceReq: this.marketplaceService.getMarketplaceItems(),
        postsReq: this.postService.getPosts(),
      })
    )
      .then((response) => {
        // Grab the arrays from the envelopes
        const events = response.eventsReq.events || [];
        const items = response.marketplaceReq || [];
        const posts = response.postsReq.posts || [];

        //  Combine them into one "activity" array
        const combined = [...events, ...items, ...posts];

        // Sort by date (Newest first) and take the last 10
        const sorted = combined
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);

        this.feedItems.set(sorted);
      })
      .catch((err) => {
        console.error('Error loading feed:', err);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
