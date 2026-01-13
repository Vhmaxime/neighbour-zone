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

  isLoading = signal<boolean>(true);
  isDeleting = signal<boolean>(false);
  isAccepting = signal<boolean>(false);
  isDeclining = signal<boolean>(false);

  error = signal<string | null>(null);
  activeTab = signal<'friends' | 'requests' | 'sent'>('friends');
  badges = signal<string[]>([]);

  ngOnInit() {
    this.isLoading.set(true);
    forkJoin({
      friends: this.api.getFriends(),
      requests: this.api.getFriendRequests(),
      sent: this.api.getSentFriendRequests(),
    }).subscribe({
      next: (response) => {
        this.friends.set(response.friends.friends);
        this.requests.set(response.requests.requests);
        this.sent.set(response.sent.sent);
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
      complete: () => {
        this.isLoading.set(false);
        this.badges.set([
          this.friends().length.toString(),
          this.requests().length.toString(),
          this.sent().length.toString(),
        ]);
      },
    });
  }

  setActiveTab(tab: 'friends' | 'requests' | 'sent') {
    this.activeTab.set(tab);
  }

  deleteFriend(friendId: string) {
    this.isDeleting.set(true);
    this.api.deleteFriend(friendId).subscribe({
      next: () => {
        this.ngOnInit();
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
      complete: () => {
        this.isDeleting.set(false);
      },
    });
  }

  acceptRequest(requestId: string) {
    this.isAccepting.set(true);
    this.api.acceptFriendRequest(requestId).subscribe({
      next: () => {
        this.ngOnInit();
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
      complete: () => {
        this.isAccepting.set(false);
      },
    });
  }

  declineRequest(requestId: string) {
    this.isDeclining.set(true);
    this.api.declineFriendRequest(requestId).subscribe({
      next: () => {
        this.ngOnInit();
      },
      error: (error) => {
        console.error(error);
        this.error.set('Something went wrong. Please try again later.');
      },
      complete: () => {
        this.isDeclining.set(false);
      },
    });
  }
}
