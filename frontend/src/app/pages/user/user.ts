import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  UserPublic,
  PostsResponse,
  EventsResponse,
  MarketplaceItemsResponse,
} from '../../types/api.types';
import { firstValueFrom } from 'rxjs';
import { Post as PostComponent } from '../../components/post/post';
import { EventTile } from '../../components/event-tile/event-tile';
import { MarketplaceTile } from '../../components/marketplace-tile/marketplace-tile';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../services/user';
import { PostService } from '../../services/post';
import { EventService } from '../../services/event';
import { MarketplaceService } from '../../services/marketplace';
import { FriendButton } from '../../components/fiend-button/friend-button';
import { FriendList } from '../../components/friend-list/friend-list';

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
  // Get user ID from route parameters
  private userId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  // Signals to hold user data and loading state
  public user = signal<UserPublic | null>(null);
  public posts = signal<PostsResponse | null>(null);
  public events = signal<EventsResponse | null>(null);
  public marketplaceItems = signal<MarketplaceItemsResponse | null>(null);
  public isLoading = signal(false);

  public ngOnInit() {
    this.loadUser();
    this.loadUserPosts();
    this.loadUserEvents();
    this.loadUserMarketplaceItems();
  }

  private loadUser() {
    this.isLoading.set(true);
    firstValueFrom(this.userService.getUser(this.userId))
      .then((data) => {
        this.user.set(data.user);
        this.titleService.setTitle(`${data.user.username} - Neighbour Zone`);
      })
      .catch((error) => {
        console.error('Error fetching user:', error);
        this.router.navigate(['/not-found']);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private loadUserPosts() {
    this.isLoading.set(true);
    firstValueFrom(this.postService.getUserPosts(this.userId))
      .then((data) => {
        this.posts.set(data);
      })
      .catch((error) => {
        console.error('Error loading user content:', error);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private loadUserEvents() {
    this.isLoading.set(true);
    firstValueFrom(this.eventService.getUserEvents(this.userId))
      .then((data) => {
        this.events.set(data);
      })
      .catch((error) => {
        console.error('Error loading user content:', error);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private loadUserMarketplaceItems() {
    this.isLoading.set(true);
    firstValueFrom(this.marketplaceService.getUserMarketplaceItems(this.userId))
      .then((data) => {
        this.marketplaceItems.set(data);
      })
      .catch((error) => {
        console.error('Error loading user content:', error);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
