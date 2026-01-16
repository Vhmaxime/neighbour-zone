import { Component, input, output } from '@angular/core';
import { MarketplaceItem } from '../../types/api.types';
import { MarketplaceActions } from '../marketplace-actions/marketplace-actions'

@Component({
  selector: 'app-marketplace-tile',
  imports: [MarketplaceActions],
  templateUrl: './marketplace-tile.html',
  styleUrl: './marketplace-tile.css',
})
export class MarketplaceTile {
  public item = input.required<MarketplaceItem>();
  
  public deleted = output<string>();
}
