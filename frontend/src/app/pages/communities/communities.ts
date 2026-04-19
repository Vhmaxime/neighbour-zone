import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CommunityService } from '../../services/community';
import { LoadingComponent } from '../../components/loading-component/loading-component';
import { CommunityListItem } from '../../types/api.types';
import { finalize } from 'rxjs';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-communities',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './communities.html'
})
export class Communities implements OnInit {
  private communityService = inject(CommunityService);

  public isLoading = signal(false);
  public communities = signal<CommunityListItem[]>([]);
  public joiningId = signal<string | null>(null);

  ngOnInit() {
    this.loadCommunities();
  }

  private loadCommunities() {
    this.isLoading.set(true);
    this.communityService
      .getCommunities()
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res) => this.communities.set(res.communities),
        error: (err) => console.error('Error loading communities:', err),
      });
  }

  public toggleMembership(community: CommunityListItem) {
    this.joiningId.set(community.id);
    const action = community.isMember
      ? this.communityService.leaveCommunity(community.id)
      : this.communityService.joinCommunity(community.id);

    firstValueFrom(action)
      .then(() => {
        this.communities.update((list) =>
          list.map((c) =>
            c.id === community.id
              ? {
                  ...c,
                  isMember: !c.isMember,
                  memberCount: c.isMember ? c.memberCount - 1 : c.memberCount + 1,
                  role: c.isMember ? null : 'member',
                }
              : c,
          ),
        );
      })
      .catch((err) => console.error('Error toggling membership:', err))
      .finally(() => this.joiningId.set(null));
  }
}
