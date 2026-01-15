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
  public initLikeCount = input.required<number>();
  public initIsLiked = input.required<boolean>();
  public type = input.required<'post' | 'event'>();
  public id = input.required<string>();
  public isLoading = signal<boolean>(false);

  public counter = signal<number>(0);
  public isLiked = signal<boolean>(false);

  constructor() {
    effect(() => {
      this.counter.set(this.initLikeCount());
      this.isLiked.set(this.initIsLiked());
    });
  }

  public async handleLike() {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    const currentlyLiked = this.isLiked();
    const currentCount = this.counter();

    // Optimistically update UI
    if (this.isLiked()) {
      this.counter.set(this.counter() - 1);
      this.isLiked.set(false);
    } else {
      this.counter.set(this.counter() + 1);
      this.isLiked.set(true);
    }

    try {
      if (this.type() === 'post') {
        await this.handlePostLike();
      } else if (this.type() === 'event') {
        await this.handleEventLike();
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
      this.counter.set(currentCount);
      this.isLiked.set(currentlyLiked);
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
