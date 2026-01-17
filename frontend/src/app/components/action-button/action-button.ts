import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../services/auth';
import { PostService } from '../../services/post';
import { EventService } from '../../services/event';
import { MarketplaceService } from '../../services/marketplace';

export type ItemType = 'post' | 'event' | 'marketplace';
export type ActionMode = 'edit' | 'delete';

@Component({
  selector: 'app-action-button',
  imports: [CommonModule],
  templateUrl: './action-button.html',
  styleUrl: './action-button.css',
})
export class ActionButton {
  private authService = inject(AuthService);
  private router = inject(Router);

  private postService = inject(PostService);
  private eventService = inject(EventService);
  private marketplaceService = inject(MarketplaceService);

  itemId = input.required<string>();
  authorId = input.required<string>();
  itemType = input.required<ItemType>();
  itemTitle = input<string>('');
  routePath = input<string>('');
  mode = input<ActionMode>('edit');

  deleted = output<string>();

  isAuthor(): boolean {
    const user = this.authService.getUser();
    const itemAuthorId = this.authorId();

    // DEBUG LOG
    console.log('Action Button Debug:', { 
    userSub: user?.sub, 
    itemAuthorId: itemAuthorId, 
    match: user?.sub == itemAuthorId 
  });

  return user?.sub == itemAuthorId;
}

  // Handle the click based on the current mode
  async handleClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.mode() === 'edit') {
      this.handleNavigation();
    } else {
      await this.handleDelete();
    }
  }

  private handleNavigation() {
    const path = this.routePath() || `${this.itemType()}s`;
    this.router.navigate([`/${path}`, this.itemId(), 'edit']);
  }

  private async handleDelete() {
    if (!confirm(`Are you sure you want to delete "${this.itemTitle()}"?`)) {
      return;
    }

    const id = this.itemId();
    const type = this.itemType();

    try {
      console.log(`Deleting ${type}:`, id);
      await firstValueFrom(this.getServiceCall(id, type));
      this.deleted.emit(id);
    } catch (err) {
      console.error(`Delete failed for ${type}:`, err);
    }
  }

  private getServiceCall(id: string, type: ItemType) {
    switch (type) {
      case 'post':
        return this.postService.deletePost(id);
      case 'event':
        return this.eventService.deleteEvent(id);
      case 'marketplace':
        return this.marketplaceService.deleteMarketplaceItem(id);
    }
  }
}
