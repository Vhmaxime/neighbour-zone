import { Component, input, output } from '@angular/core';
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
}
