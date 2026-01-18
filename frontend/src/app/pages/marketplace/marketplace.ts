import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { MarketplaceService } from '../../services/marketplace';
import { MarketplaceItem } from '../../types/api.types';
import { LoadingComponent } from '../../components/loading-component/loading-component';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css',
})
export class Marketplace {
  private marketplaceService = inject(MarketplaceService);
  public items = signal<MarketplaceItem[]>([]);

  public isLoading = signal(true);
  public isError = signal(false);

  ngOnInit() {
    this.loadItems();
  }

  private loadItems() {
    firstValueFrom(this.marketplaceService.getMarketplaceItems())
      .then((data) => {
        this.items.set(data);
        this.isError.set(false);
      })
      .catch((error) => {
        console.error('Error loading items:', error);
        this.isError.set(true);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
