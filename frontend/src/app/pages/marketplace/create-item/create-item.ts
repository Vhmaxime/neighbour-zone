import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MarketplaceService } from '../../../services/marketplace';

@Component({
  selector: 'app-create-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-item.html',
  styleUrl: './create-item.css',
})
export class CreateItem {
  private fb = inject(FormBuilder);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);

  isSubmitting = false;

  form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    description: ['', [Validators.required, Validators.minLength(10)]],
    price: [0, [Validators.min(0)]],
    category: ['offered', [Validators.required]], // Default to 'offered'
    location: ['Neighborhood', [Validators.required]]
  });
  
  onSubmit() {
    if (this.form.invalid) return;

    this.isSubmitting = true;

    // Send data to the backend
    this.marketplaceService.createMarketplaceItem({
      title: this.form.value.title!,
      description: this.form.value.description!,
      price: this.form.value.price ?? 0,
      category: this.form.value.category as 'offered' | 'wanted',
      location: this.form.value.location!
    }).subscribe({
      next: () => {
        // On success, redirect back to the list
        this.router.navigate(['/marketplace']);
      },
      error: (err) => {
        console.error('Failed to create item', err);
        this.isSubmitting = false;
        alert('Failed to post item. Please try again.');
      }
    });
  }
}
