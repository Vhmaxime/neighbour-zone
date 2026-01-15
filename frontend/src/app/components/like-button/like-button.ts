import { Component, inject, input, signal, computed, effect } from '@angular/core';
import { PostService } from '../../services/post';
import { EventService } from '../../services/event';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-like-button',
  imports: [],
  templateUrl: './like-button.html',
  styleUrl: './like-button.css',
})
export class LikeButton {
  private postService = inject(PostService);
  private eventService = inject(EventService);
  public likes = input.required<number>();
  public isLiked = input.required<boolean>();
  public type = input.required<'post' | 'event'>();
  public id = input.required<string>();
  public isLoading = signal<boolean>(false);

  public likeCounter = signal<number>(0);
  public likeState = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.likeCounter.set(this.likes());
      this.likeState.set(this.isLiked());
    });
  }

  public async handleLike() {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    const currentlyLiked = this.likeState();
    const currentCount = this.likeCounter();

    if (this.likeState()) {
      this.likeCounter.set(this.likeCounter() - 1);
      this.likeState.set(false);
    } else {
      this.likeCounter.set(this.likeCounter() + 1);
      this.likeState.set(true);
    }

    try {
      if (this.type() === 'post') {
        await this.handlePostLike();
      } else if (this.type() === 'event') {
        await this.handleEventLike();
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      this.likeCounter.set(currentCount);
      this.likeState.set(currentlyLiked);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async handlePostLike() {
    await firstValueFrom(this.postService.likePost(this.id()));
  }

  private async handleEventLike() {
    await firstValueFrom(this.eventService.likeEvent(this.id()));
  }
}
