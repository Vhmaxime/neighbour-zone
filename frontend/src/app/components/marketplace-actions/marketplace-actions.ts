import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { MarketplaceService } from '../../services/marketplace';

@Component({
  selector: 'app-marketplace-actions',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOwner()) {
      <div class="flex items-center space-x-3 mr-2">
        <button 
          (click)="onEdit($event)" 
          class="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          Edit
        </button>
        <button 
          (click)="onDelete($event)" 
          class="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors"
        >
          Delete
        </button>
      </div>
    }
  `
})
export class MarketplaceActions {
  private authService = inject(AuthService);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);

  itemId = input.required<string>();
  sellerId = input.required<string>(); // The owner's ID
  itemTitle = input.required<string>();
  
  deleted = output<string>();

  isOwner = computed(() => {
    const user = this.authService.getUser();
    return user?.sub === this.sellerId();
  });

  onEdit(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.router.navigate(['/marketplace', this.itemId(), 'edit']);
  }

  onDelete(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    
    if (confirm(`Remove "${this.itemTitle()}" from the marketplace?`)) {
      this.marketplaceService.deleteMarketplaceItem(this.itemId()).subscribe({
        next: () => {
          this.deleted.emit(this.itemId());
        },
        error: (err: any) => console.error('Delete failed', err)
      });
    }
  }
}