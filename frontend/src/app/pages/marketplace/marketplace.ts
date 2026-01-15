import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { MarketplaceService } from '../../services/marketplace';
import { MarketplaceItem } from '../../types/api.types';

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css'
})
export class Marketplace implements OnInit {
  private marketplaceService = inject(MarketplaceService);

  items$: Observable<MarketplaceItem[]> | undefined;

  ngOnInit() {
    this.items$ = this.marketplaceService.getMarketplaceItems();
  }
}
