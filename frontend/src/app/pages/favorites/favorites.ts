import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { Post, Event as ApiEvent, MarketplaceItem } from '../../types/api.types';
import { PostService } from '../../services/post';
import { EventService } from '../../services/event';
import { MarketplaceService } from '../../services/marketplace';
import { PostTile } from '../../components/post-tile/post-tile';
import { LoadingComponent } from '../../components/loading-component/loading-component';
import { SaveButton } from '../../components/save-button/save-button';
import { RouterLink } from '@angular/router';

type Tab = 'posts' | 'events' | 'marketplace';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, PostTile, LoadingComponent, SaveButton, RouterLink],
  templateUrl: './favorites.html',
})
export class Favorites implements OnInit {
  private titleService = inject(Title);
  private postService = inject(PostService);
  private eventService = inject(EventService);
  private marketplaceService = inject(MarketplaceService);

  public activeTab = signal<Tab>('posts');

  public likedPosts = signal<Post[]>([]);
  public likedEvents = signal<ApiEvent[]>([]);
  public savedItems = signal<MarketplaceItem[]>([]);

  public isLoadingPosts = signal(false);
  public isLoadingEvents = signal(false);
  public isLoadingMarketplace = signal(false);

  ngOnInit() {
    this.titleService.setTitle('Favorites | Neighbour Zone');
    this.loadAll();
  }

  public setTab(tab: Tab) {
    this.activeTab.set(tab);
  }

  public handlePostDeleted(id: string) {
    this.likedPosts.update((posts) => posts.filter((p) => p.id !== id));
  }

  private loadAll() {
    this.isLoadingPosts.set(true);
    firstValueFrom(this.postService.getLikedPosts())
      .then((res) => this.likedPosts.set(res.posts))
      .catch((err) => console.error('Error loading liked posts:', err))
      .finally(() => this.isLoadingPosts.set(false));

    this.isLoadingEvents.set(true);
    firstValueFrom(this.eventService.getLikedEvents())
      .then((res) => this.likedEvents.set(res.events))
      .catch((err) => console.error('Error loading liked events:', err))
      .finally(() => this.isLoadingEvents.set(false));

    this.isLoadingMarketplace.set(true);
    firstValueFrom(this.marketplaceService.getSavedItems())
      .then((res) => this.savedItems.set(res.marketplace))
      .catch((err) => console.error('Error loading saved items:', err))
      .finally(() => this.isLoadingMarketplace.set(false));
  }
}
