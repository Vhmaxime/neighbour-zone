import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MarketplaceService } from '../../../services/marketplace'; 
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-edit-marketplace',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
      
      const item = (response as any).marketplace || response;

      if (item) {
        this.editForm.patchValue({
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          location: item.location
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
}
