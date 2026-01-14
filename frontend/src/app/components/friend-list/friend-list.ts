import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { FriendsResponse } from '../../types/api.types';

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
  private api = inject(Api);
  public tabs: State['tabs'][] = ['Friends', 'Requests', 'Sent'];
  public friends = signal<FriendsResponse | null>(null);
  public badge = signal<number[]>([]);
  public isLoading = signal<boolean>(false);
  public actionState = signal<State['actions']>(null);
  public targetUserId = signal<string | null>(null);
  public error = signal<string | null>(null);
  public activeTab = signal<State['tabs']>('Friends');
  public badges = signal<string[]>([]);

  public ngOnInit() {
    this.loadData();
  }

  private loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    this.api.getFriends().subscribe({
      next: (response) => {
        this.friends.set(response);
        this.badge.set([response.friends.length, response.requests.length, response.sent.length]);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error fetching friends:', error);
        this.error.set('Something went wrong. Please try again later.');
        this.isLoading.set(false);
      },
    });
  }

  public setActiveTab(tab: (typeof this.tabs)[number]) {
    this.activeTab.set(tab);
  }

  public deleteFriend(friendId: string) {
    this.actionState.set('deleting');
    this.targetUserId.set(friendId);
    this.api.deleteFriend(friendId).subscribe({
      next: () => {
        this.loadData();
        this.actionState.set(null);
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
    });
  }

  public acceptRequest(requestId: string) {
    this.actionState.set('accepting');
    this.targetUserId.set(requestId);
    this.api.acceptFriendRequest(requestId).subscribe({
      next: () => {
        this.loadData();
        this.actionState.set(null);
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
    });
  }

  public rejectRequest(requestId: string) {
    this.actionState.set('rejecting');
    this.targetUserId.set(requestId);
    this.api.rejectFriendRequest(requestId).subscribe({
      next: () => {
        this.loadData();
        this.actionState.set(null);
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
    });
  }

  public cancelSentRequest(requestId: string) {
    this.actionState.set('cancelling');
    this.targetUserId.set(requestId);
    this.api.cancelFriendRequest(requestId).subscribe({
      next: () => {
        this.loadData();
        this.actionState.set(null);
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
    });
  }
}
