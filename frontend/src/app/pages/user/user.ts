import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketplaceItem, Post, UserPublic, Event } from '../../types/api.types';
import { forkJoin } from 'rxjs';
import { Post as PostComponent } from '../../components/post/post';
import { EventTile } from '../../components/event-tile/event-tile';
import { MarketplaceTile } from '../../components/marketplace-tile/marketplace-tile';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../services/user';
import { PostService } from '../../services/post';
import { EventService } from '../../services/event';
import { MarketplaceService } from '../../services/marketplace';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [PostComponent, EventTile, MarketplaceTile],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  // Injected services
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private userService = inject(UserService);
  private postService = inject(PostService);
  private eventService = inject(EventService);
  private marketplaceService = inject(MarketplaceService);
  private titleService = inject(Title);
  // URL parameter
  private userId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  // State signals
  public user = signal<UserPublic | null>(null);
  public posts = signal<Post[] | null>(null);
  public events = signal<Event[] | null>(null);
  public marketplaceItems = signal<MarketplaceItem[] | null>(null);
  public isLoading = signal(true);
  public counts = signal<number[]>([]);

  public ngOnInit() {
    this.userService.getUser(this.userId).subscribe({
      next: (response) => {
        this.user.set(response.user);

        if (response.user) {
          this.titleService.setTitle(`${response.user.username}'s Profile | Neighbour Zone`);
        }

        this.loadUserContent();
      },
      error: (error) => {
        console.error('Error fetching user:', error);
        this.router.navigate(['/not-found']);
      },
    });
  }

  private loadUserContent() {
    forkJoin({
      postsRequest: this.postService.getUserPosts(this.userId),
      eventsRequest: this.eventService.getUserEvents(this.userId),
      marketplaceRequest: this.marketplaceService.getUserMarketplaceItems(this.userId),
    }).subscribe({
      next: (response) => {
        this.posts.set(response.postsRequest.posts);
        this.events.set(response.eventsRequest.events);
        this.marketplaceItems.set(response.marketplaceRequest.marketplace);
        this.counts.set([
          response.postsRequest.count,
          response.eventsRequest.count,
          response.marketplaceRequest.count,
        ]);
      },
      error: (error) => {
        console.error('Error loading user content:', error);
      },
    });
  }
}
