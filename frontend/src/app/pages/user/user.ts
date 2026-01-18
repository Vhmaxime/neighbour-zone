import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UserPublic,
  PostsResponse,
  EventsResponse,
  MarketplaceItemsResponse,
} from '../../types/api.types';
import { firstValueFrom } from 'rxjs';
import { PostTile as PostComponent } from '../../components/post-tile/post-tile';
import { EventTile } from '../../components/event-tile/event-tile';
import { MarketplaceTile } from '../../components/marketplace-tile/marketplace-tile';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../services/user';
import { PostService } from '../../services/post';
import { EventService } from '../../services/event';
import { MarketplaceService } from '../../services/marketplace';
import { FriendButton } from '../../components/friend-button/friend-button';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [PostComponent, EventTile, MarketplaceTile, FriendButton],
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
  // Signals to hold user data and loading state
  public user = signal<UserPublic | null>(null);
  public posts = signal<PostsResponse | null>(null);
  public events = signal<EventsResponse | null>(null);
  public marketplaceItems = signal<MarketplaceItemsResponse | null>(null);
  public isLoading = signal(true);
  private userId: string = '';

  public ngOnInit() {
    this.activatedRoute.paramMap.subscribe((params) => {
      this.isLoading.set(true);
      const userId = params.get('id');

      if (!userId) {
        this.router.navigate(['/not-found']);
        return;
      }

      this.userId = userId;

      Promise.all([
        this.loadUser(),
        this.loadUserPosts(),
        this.loadUserEvents(),
        this.loadUserMarketplaceItems(),
      ]).finally(() => {
        this.isLoading.set(false);
      });
    });
  }

  private loadUser() {
    return firstValueFrom(this.userService.getUser(this.userId))
      .then((data) => {
        this.user.set(data);
        this.titleService.setTitle(`${data.username} - Neighbour Zone`);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        this.router.navigate(['/not-found']);
      });
  }

  private loadUserPosts() {
    return firstValueFrom(this.postService.getPostsByUser(this.userId))
      .then((data) => {
        this.posts.set(data);
      })
      .catch((error) => {
        console.error('Error loading user content:', error);
      });
  }

  private loadUserEvents() {
    return firstValueFrom(this.eventService.getEventsByUser(this.userId))
      .then((data) => {
        this.events.set(data);
      })
      .catch((error) => {
        console.error('Error loading user content:', error);
      });
  }

  private loadUserMarketplaceItems() {
    return firstValueFrom(this.marketplaceService.getMarketplaceItemsByUser(this.userId))
      .then((data) => {
        this.marketplaceItems.set(data);
      })
      .catch((error) => {
        console.error('Error loading user content:', error);
      });
  }
}
