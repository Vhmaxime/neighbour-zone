import { Component, computed, inject, input, signal } from '@angular/core';
import { FriendService } from '../../services/friend';
import { AuthService } from '../../services/auth';
import { FriendshipResponse } from '../../types/api.types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-friend-button',
  imports: [],
  templateUrl: './friend-button.html',
  styleUrl: './friend-button.css',
})
export class FriendButton {
  private friendService = inject(FriendService);
  private authService = inject(AuthService);
  public friendId = input.required<string>();
  public friendship = signal<FriendshipResponse | null>(null);
  public isLoading = signal<boolean>(true);
  public isError = signal<boolean>(false);

  public isSelf = computed(() => {
    const currentUser = this.authService.getUser();
    return currentUser?.sub === this.friendId();
  });

  public ngOnInit() {
    this.getFriendship();
  }

  private getFriendship() {
    this.isLoading.set(true);
    firstValueFrom(this.friendService.getFriendship(this.friendId()))
      .then((data) => {
        this.friendship.set(data);
      })
      .catch((error) => {
        if (error.status === 404) {
          this.friendship.set(null);
          return;
        }
        console.error('Error fetching friendship status:', error);
        this.isError.set(true);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public sendFriendRequest() {
    this.isLoading.set(true);
    firstValueFrom(this.friendService.sendFriendRequest(this.friendId()))
      .then(() => {
        this.getFriendship();
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public cancelFriendRequest() {
    this.isLoading.set(true);
    firstValueFrom(this.friendService.deleteFriend(this.friendId()))
      .then(() => {
        this.getFriendship();
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public acceptFriendRequest() {
    this.isLoading.set(true);
    firstValueFrom(this.friendService.acceptFriendRequest(this.friendId()))
      .then(() => {
        this.getFriendship();
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public rejectFriendRequest() {
    this.isLoading.set(true);
    firstValueFrom(this.friendService.rejectFriendRequest(this.friendId()))
      .then(() => {
        this.getFriendship();
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public deleteFriend() {
    this.isLoading.set(true);
    firstValueFrom(this.friendService.deleteFriend(this.friendId()))
      .then(() => {
        this.getFriendship();
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
