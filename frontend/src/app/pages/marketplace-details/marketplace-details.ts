import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MarketplaceItem, MarketplaceItemResponse } from '../../types/api.types';
import { Title } from '@angular/platform-browser';
import { MarketplaceService } from '../../services/marketplace';

@Component({
  selector: 'app-marketplace-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './marketplace-details.html',
  styleUrl: './marketplace-details.css',
})
export class MarketplaceDetails implements OnInit {
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
        console.log('Backend Response:', response); // For checking stuff
        const itemData = response.marketplace || response;

        if (itemData && itemData.title) {
          this.item.set(itemData);
          this.titleService.setTitle(`${itemData.title} | Neighbour Zone`);
        } else {
          console.error('Data received but item structure is missing:', itemData);
        }
      })
      .catch((error) => {
        console.error('Error loading item:', error);
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        }
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
