import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MarketplaceItem } from '../../types/api.types';
import { Title } from '@angular/platform-browser';
import { MarketplaceService } from '../../services/marketplace';

@Component({
  selector: 'app-marketplace-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './marketplace-details.html',
  styleUrl: './marketplace-details.css',
})
export class MarketplaceDetails {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private marketplaceService = inject(MarketplaceService);
  private titleService = inject(Title);
  private itemId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  public isLoading = signal(false);
  public item = signal<MarketplaceItem | null>(null);

  public ngOnInit() {
    this.loadItem();
  }

  private loadItem() {
    this.isLoading.set(true);
    firstValueFrom(this.marketplaceService.getMarketplaceItem(this.itemId))
      .then((response: any) => {
        const item = response.marketplace ? response.marketplace : response;
        this.item.set(item);
        console.log(item);
        this.titleService.setTitle(`${item.title} - ${item.price}€ | Neighbour Zone`);
      })
      .catch((error) => {
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        }
        console.error('Error loading item:', error);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
