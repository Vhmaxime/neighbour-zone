import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, catchError, of, tap } from 'rxjs';
import { MarketplaceItem } from '../../types/api.types';
import { Api } from '../../services/api';

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
  private api = inject(Api);

  constructor() {
    this.item$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        
        // Safety check
        if (!id) return of(null);

        // Use the Service!
        return this.api.getMarketplaceItem(id);
      }),
      tap(data => console.log('Marketplace Item loaded:', data)),
      catchError(error => {
        console.error('Error loading item:', error);
        return of(null);
      })
    );
  }
}
