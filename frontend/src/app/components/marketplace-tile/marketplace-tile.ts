import { Component, input, output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MarketplaceItem } from '../../types/api.types';
import { EditButton } from '../../components/edit-button/edit-button'; 
import { DeleteButton } from '../../components/delete-button/delete-button';

@Component({
  selector: 'app-marketplace-tile',
  imports: [EditButton, DeleteButton],
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
