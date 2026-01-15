import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, catchError, of, tap, map } from 'rxjs';
import { MarketplaceItem } from '../../types/api.types';
import { Title } from '@angular/platform-browser';
import { MarketplaceService } from '../../services/marketplace';

@Component({
  selector: 'app-marketplace-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marketplace-details.html',
  styleUrl: './marketplace-details.css',
})
export class MarketplaceDetails {
  item$: Observable<MarketplaceItem | null>;

  private route = inject(ActivatedRoute);
  private marketplaceService = inject(MarketplaceService);
  private titleService = inject(Title);

  constructor() {
    this.item$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (!id) return of(null);

        return this.marketplaceService
          .getMarketplaceItem(id)
          .pipe(map((response: any) => (response.marketplace ? response.marketplace : response)));
      }),
      tap((data) => {
        if (data) {
          // Set dynamic title with Price
          this.titleService.setTitle(`${data.title} - ${data.price}€ | Neighbour Zone`);
        }
      }),
      catchError((error) => {
        console.error('Error loading item:', error);
        return of(null);
      })
    );
  }
}
