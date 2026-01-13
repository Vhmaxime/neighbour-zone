import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Api } from '../../services/api';
import { UserPublic } from '../../types/api.types';

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
  public friends = signal<UserPublic[] | null>(null);
  public requests = signal<UserPublic[] | null>(null);
  public sent = signal<UserPublic[] | null>(null);
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
    forkJoin({
      friends: this.api.getFriends(),
      requests: this.api.getFriendRequests(),
      sent: this.api.getSentFriendRequests(),
    }).subscribe({
      next: ({ friends, requests, sent }) => {
        this.friends.set(friends.friends);
        this.requests.set(requests.requests);
        this.sent.set(sent.sent);
        this.badge.set([friends.friends.length, requests.requests.length, sent.sent.length]);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
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
