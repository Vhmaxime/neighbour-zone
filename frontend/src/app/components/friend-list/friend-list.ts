import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Api } from '../../services/api';

interface Friend {
  id: string;
  username: string;
}

@Component({
  selector: 'app-friend-list',
  imports: [CommonModule],
  templateUrl: './friend-list.html',
  styleUrl: './friend-list.css',
})
export class FriendList {
  private api = inject(Api);
  friends = signal<Friend[]>([]);
  requests = signal<Friend[]>([]);
  sent = signal<Friend[]>([]);

  isLoading = signal<boolean>(false);

  actionState = signal<'deleting' | 'accepting' | 'rejecting' | 'cancelling' | null>(null);

  error = signal<string | null>(null);
  activeTab = signal<'friends' | 'requests' | 'sent'>('friends');
  badges = signal<string[]>([]);

  private loadData() {
    this.isLoading.set(true);
    this.error.set(null);
    forkJoin({
      friends: this.api.getFriends(),
      requests: this.api.getFriendRequests(),
      sent: this.api.getSentFriendRequests(),
    }).subscribe({
      next: (response) => {
        this.friends.set(response.friends.friends);
        this.requests.set(response.requests.requests);
        this.sent.set(response.sent.sent);
        this.badges.set([
          this.friends().length.toString(),
          this.requests().length.toString(),
          this.sent().length.toString(),
        ]);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
    });
  }

  ngOnInit() {
    this.loadData();
  }

  setActiveTab(tab: 'friends' | 'requests' | 'sent') {
    this.activeTab.set(tab);
  }

  deleteFriend(friendId: string) {
    this.actionState.set('deleting');
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

  acceptRequest(requestId: string) {
    this.actionState.set('accepting');
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

  rejectRequest(requestId: string) {
    this.actionState.set('rejecting');
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

  cancelSentRequest(requestId: string) {
    this.actionState.set('cancelling');
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
