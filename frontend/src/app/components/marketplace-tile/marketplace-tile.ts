import { Component, input, output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceItem } from '../../types/api.types';
import { ActionButton } from '../../components/action-button/action-button';

@Component({
  selector: 'app-marketplace-tile',
  imports: [ActionButton],
  templateUrl: './marketplace-tile.html',
  styleUrl: './marketplace-tile.css',
})
export class MarketplaceTile {
  public item = input.required<MarketplaceItem>();
  public deleted = output<string>();

  private router = inject(Router);

  public viewItem() {
    this.router.navigate(['/marketplace', this.item().id]);
  }

}
