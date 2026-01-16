import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { PostService } from '../../services/post';
import { EventService } from '../../services/event';
import { MarketplaceService } from '../../services/marketplace';
import { firstValueFrom } from 'rxjs';

// Define the valid activity types
type ItemType = 'post' | 'event' | 'marketplace';

@Component({
  selector: 'app-delete-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-button.html',
  styleUrl: './delete-button.css',
})
export class DeleteButton {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private eventService = inject(EventService);
  private marketplaceService = inject(MarketplaceService);

  // Inputs
  itemId = input.required<string>();
  authorId = input.required<string>();
  itemTitle = input.required<string>();
  itemType = input.required<ItemType>();

  deleted = output<string>();

  isAuthor(): boolean {
    const user = this.authService.getUser();
    return user?.sub === this.authorId();
  }

  async onDelete(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (!confirm(`Are you sure you want to delete "${this.itemTitle()}"?`)) return;

    const id = this.itemId();

    try {
      await firstValueFrom(this.getServiceCall(id));
      this.deleted.emit(id);
    } catch (err) {
      console.error(`Delete failed for ${this.itemType()}:`, err);
    }
  }

  private getServiceCall(id: string) {
    switch (this.itemType()) {
      case 'post':
        return this.postService.deletePost(id);
      case 'event':
        return this.eventService.deleteEvent(id);
      case 'marketplace':
        // Ensure this matches your service method name (e.g., .delete() or .deleteItem())
        return this.marketplaceService.deleteMarketplaceItem(id);
    }
  }
}