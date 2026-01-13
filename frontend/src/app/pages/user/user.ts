import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketplaceItem, Post, UserPublic, Event } from '../../types/api.types';
import { Api } from '../../services/api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-user',
  imports: [],
  templateUrl: './user.html',
  styleUrl: './user.css',
})
export class User {
  // Injected services
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(Api);
  // URL parameter
  private userId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  // State signals
  public user = signal<UserPublic | null>(null);
  public posts = signal<Post[]>([]);
  public events = signal<Event[]>([]);
  public marketplaceItems = signal<MarketplaceItem[]>([]);
  public isLoading = signal(true);
  public counts = signal<number[]>([]);

  ngOnInit() {
    this.api.getUser(this.userId).subscribe({
      next: (response) => {
        this.user.set(response.user);
        this.isLoading.set(false);
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
      postsRequest: this.api.getUserPosts(this.userId),
      eventsRequest: this.api.getUserEvents(this.userId),
      marketplaceRequest: this.api.getUserMarketplaceItems(this.userId),
    }).subscribe({
      next: (response) => {
        this.posts.set(response.postsRequest.posts);
        this.events.set(response.eventsRequest.events);
        this.marketplaceItems.set(response.marketplaceRequest.marketplace);
        this.counts.set([
          this.posts().length,
          this.events().length,
          this.marketplaceItems().length,
        ]);
      },
      error: (error) => {
        console.error('Error loading user content:', error);
      },
    });
  }
}
