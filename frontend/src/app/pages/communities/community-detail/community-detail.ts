import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommunityService } from '../../../services/community';
import { AuthService } from '../../../services/auth';
import { LoadingComponent } from '../../../components/loading-component/loading-component';
import { PostTile } from '../../../components/post-tile/post-tile';
import { EventTile } from '../../../components/event-tile/event-tile';
import { MarketplaceTile } from '../../../components/marketplace-tile/marketplace-tile';
import { BackButton } from '../../../components/back-button/back-button';
import { Community, Post, Event, MarketplaceItem } from '../../../types/api.types';
import { firstValueFrom } from 'rxjs';

type Tab = 'posts' | 'events' | 'marketplace';

@Component({
  selector: 'app-community-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingComponent,
    PostTile,
    EventTile,
    MarketplaceTile,
    BackButton,
  ],
  templateUrl: './community-detail.html'
})
export class CommunityDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private communityService = inject(CommunityService);
  private authService = inject(AuthService);

  public isLoading = signal(false);
  public isContentLoading = signal(false);
  public community = signal<Community | null>(null);
  public activeTab = signal<Tab>('posts');

  public posts = signal<Post[]>([]);
  public events = signal<Event[]>([]);
  public marketplace = signal<MarketplaceItem[]>([]);

  public isActionLoading = signal(false);
  public error = signal<string | null>(null);

  public currentUserId = computed(() => this.authService.getUser()?.sub);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadCommunity(id);
  }

  private loadCommunity(id: string) {
    this.isLoading.set(true);
    firstValueFrom(this.communityService.getCommunity(id))
      .then(({ community }) => {
        this.community.set(community);
        if (community.isMember) this.loadTab('posts');
      })
      .catch(() => this.router.navigate(['/not-found']))
      .finally(() => this.isLoading.set(false));
  }

  public setTab(tab: Tab) {
    this.activeTab.set(tab);
    this.loadTab(tab);
  }

  private loadTab(tab: Tab) {
    const id = this.community()?.id;
    if (!id) return;

    this.isContentLoading.set(true);
    let request;
    if (tab === 'posts') {
      request = firstValueFrom(this.communityService.getCommunityPosts(id)).then((res) =>
        this.posts.set(res.posts),
      );
    } else if (tab === 'events') {
      request = firstValueFrom(this.communityService.getCommunityEvents(id)).then((res) =>
        this.events.set(res.events),
      );
    } else {
      request = firstValueFrom(this.communityService.getCommunityMarketplace(id)).then((res) =>
        this.marketplace.set(res.marketplace),
      );
    }
    request.catch((err) => console.error(err)).finally(() => this.isContentLoading.set(false));
  }

  public toggleMembership() {
    const community = this.community();
    if (!community) return;

    this.isActionLoading.set(true);
    this.error.set(null);

    const action = community.isMember
      ? this.communityService.leaveCommunity(community.id)
      : this.communityService.joinCommunity(community.id);

    firstValueFrom(action)
      .then(() => {
        const wasMember = community.isMember;
        this.community.update((c) =>
          c
            ? {
                ...c,
                isMember: !c.isMember,
                memberCount: c.isMember ? c.memberCount - 1 : c.memberCount + 1,
                role: c.isMember ? null : 'member',
              }
            : c,
        );
        if (!wasMember) this.loadTab(this.activeTab());
      })
      .catch((err) => {
        this.error.set(err?.error?.message ?? 'An error occurred.');
      })
      .finally(() => this.isActionLoading.set(false));
  }

  public handlePostDeleted(id: string) {
    this.posts.update((items) => items.filter((p) => p.id !== id));
  }

  public handleMarketplaceDeleted(id: string) {
    this.marketplace.update((items) => items.filter((m) => m.id !== id));
  }
}
