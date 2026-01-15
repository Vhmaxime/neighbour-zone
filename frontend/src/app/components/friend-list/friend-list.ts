import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FriendsResponse } from '../../types/api.types';
import { FriendService } from '../../services/friend';
import { firstValueFrom } from 'rxjs';

interface State {
  tabs: 'Friends' | 'Requests' | 'Sent';
  actions: 'deleting' | 'accepting' | 'rejecting' | 'cancelling' | null;
}

@Component({
  selector: 'app-friend-list',
  imports: [CommonModule],
  templateUrl: './friend-list.html',
  styleUrl: './friend-list.css',
})
export class FriendList {
  private friendService = inject(FriendService);
  public tabs: State['tabs'][] = ['Friends', 'Requests', 'Sent'];
  public friends = signal<FriendsResponse | null>(null);
  public isLoading = signal<boolean>(false);
  public actionState = signal<State['actions']>(null);
  public targetUserId = signal<string | null>(null);
  public error = signal<string | null>(null);
  public activeTab = signal<State['tabs']>('Friends');
  public badgeCounts = signal<number[]>([]);

  public ngOnInit() {
    this.getFriends();
  }

  public getFriends() {
    this.isLoading.set(true);
    this.error.set(null);
    firstValueFrom(this.friendService.getFriends())
      .then((data) => {
        this.friends.set(data);
        this.badgeCounts.set([data.friends.length, data.requests.length, data.sent.length]);
      })
      .catch((error) => {
        console.error('Error fetching friends:', error);
        this.error.set('Something went wrong. Please try again later.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public setActiveTab(tab: (typeof this.tabs)[number]) {
    this.activeTab.set(tab);
  }

  public deleteFriend(friendId: string) {
    this.actionState.set('deleting');
    this.targetUserId.set(friendId);
    firstValueFrom(this.friendService.deleteFriend(friendId))
      .then(() => {
        this.getFriends();
      })
      .catch((error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      })
      .finally(() => {
        this.actionState.set(null);
      });
  }

  public acceptRequest(requestId: string) {
    this.actionState.set('accepting');
    this.targetUserId.set(requestId);
    firstValueFrom(this.friendService.acceptFriendRequest(requestId))
      .then(() => {
        this.getFriends();
      })
      .catch((error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      })
      .finally(() => {
        this.actionState.set(null);
      });
  }

  public rejectRequest(requestId: string) {
    this.actionState.set('rejecting');
    this.targetUserId.set(requestId);
    firstValueFrom(this.friendService.rejectFriendRequest(requestId))
      .then(() => {
        this.getFriends();
        this.actionState.set(null);
      })
      .catch((error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      })
      .finally(() => {
        this.actionState.set(null);
      });
  }

  public cancelSentRequest(requestId: string) {
    this.actionState.set('cancelling');
    this.targetUserId.set(requestId);
    firstValueFrom(this.friendService.cancelFriendRequest(requestId))
      .then(() => {
        this.getFriends();
        this.actionState.set(null);
      })
      .catch((error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      })
      .finally(() => {
        this.actionState.set(null);
      });
  }
}
