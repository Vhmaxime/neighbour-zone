import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MarketplaceService } from '../../../services/marketplace'; 
import { firstValueFrom } from 'rxjs';
import { ActionButton } from '../../../components/action-button/action-button';

@Component({
  selector: 'app-edit-marketplace',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ActionButton],
  templateUrl: './edit-marketplace.html',
  styleUrl: './edit-marketplace.css',
})
export class EditMarketplace {
  private fb = inject(FormBuilder);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  private itemId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  public isLoading = signal(true);
  public isSaving = signal(false);

  // Signal to store the fetched item data safely
  public item = signal<any>(null);

  public editForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [0, [Validators.min(0)]],
    category: ['offered', [Validators.required]],
    location: ['', [Validators.required]]
  });

  constructor() {
    this.loadItem();
  }

  private async loadItem() {
    try {
      this.isLoading.set(true);
      const response = await firstValueFrom(this.marketplaceService.getMarketplaceItem(this.itemId));
      
      const itemData = (response as any).marketplace || response;

      // Save to signal for the HTML to see
      this.item.set(itemData);

      if (itemData) {
        this.editForm.patchValue({
          title: itemData.title,
          description: itemData.description,
          price: itemData.price,
          category: itemData.category,
          location: itemData.location
        });
      }
    } catch (err) {
      console.error('Error loading item:', err);
      this.router.navigate(['/marketplace']);
    } finally {
      this.isLoading.set(false);
    }
  }

  public async onSubmit() {
    if (this.editForm.invalid) return;

    this.isSaving.set(true);
    try {
      await firstValueFrom(
        this.marketplaceService.updateMarketplaceItem(this.itemId, this.editForm.value as any)
      );
      this.router.navigate(['/marketplace']);
    } catch (err) {
      console.error('Update failed:', err);
    } finally {
      this.isSaving.set(false);
    }
  }

  onItemDeleted() {
    this.router.navigate(['/marketplace']);
  }
}
