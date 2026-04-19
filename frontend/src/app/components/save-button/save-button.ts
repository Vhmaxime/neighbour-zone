import { Component, inject, input, signal, OnInit } from '@angular/core';
import { MarketplaceService } from '../../services/marketplace';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-save-button',
  standalone: true,
  imports: [],
  templateUrl: './save-button.html'
})
export class SaveButton implements OnInit {
  private marketplaceService = inject(MarketplaceService);

  public id = input.required<string>();
  public isSaved = input.required<boolean>();
  public readonly = input<boolean>(false);
  public isLoading = signal<boolean>(false);

  public saveState = signal<boolean>(false);

  ngOnInit() {
    this.saveState.set(this.isSaved());
  }

  public async handleSave() {
    if (this.isLoading()) return;

    this.isLoading.set(true);

    const previousState = this.saveState();
    this.saveState.set(!previousState);

    try {
      await firstValueFrom(this.marketplaceService.saveItem(this.id()));
    } catch (error) {
      console.error('Failed to toggle save:', error);
      this.saveState.set(previousState);
    } finally {
      this.isLoading.set(false);
    }
  }
}
