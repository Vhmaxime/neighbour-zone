import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MarketplaceService } from '../../../services/marketplace';
import { NominatimService } from '../../../services/nominatim';
import { NominatimLocation } from '../../../types/nominatom-types';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { BackButton } from '../../../components/back-button/back-button';
import { LocationSearchResults } from '../../../components/location-search-bar/location-search-results';

@Component({
  selector: 'app-create-item',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, BackButton, LocationSearchResults],
  templateUrl: './create-item.html',
  styleUrl: './create-item.css',
})
export class CreateItem {
  private fb = inject(FormBuilder);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);
  private nominatimService = inject(NominatimService);

  public isSubmitting = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public isSuccess = signal<boolean>(false);
  public error = signal<string | null>(null);

  public searchResults = signal<NominatimLocation[]>([]);
  public place = signal<NominatimLocation | null>(null);

  public itemForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(150)]],
    price: [0, [Validators.min(0)]],
    category: ['offered', [Validators.required]],
    placeDisplayName: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
    ],
  });

  public ngOnInit() {
    this.itemForm.controls.placeDisplayName.valueChanges
      .pipe(
        filter((query) => !!query && query.length >= 3),
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => this.nominatimService.searchLocation(query)),
      )
      .subscribe({
        next: (results) => {
          this.searchResults.set(results);
        },
        error: (err) => {
          console.error('Error searching location:', err);
        },
      });
  }

  public onSubmit() {
    this.itemForm.markAllAsTouched();
    const { title, description, price, category, placeDisplayName } = this.itemForm.value;
    const place = this.place();

    if (this.itemForm.invalid || !title || !placeDisplayName) {
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);
    this.isSuccess.set(false);

    if (!place) {
      this.error.set('Please search for a location and select one from the list.');
      this.isSubmitting.set(false);
      return;
    }

    firstValueFrom(
      this.marketplaceService.createMarketplaceItem({
        title,
        description,
        price: price ?? 0,
        placeId: place.place_id,
        placeDisplayName: place.display_name,
        category: category as 'offered' | 'wanted',
        lat: place.lat,
        lon: place.lon,
      }),
    )
      .then((data) => {
        this.isSuccess.set(true);
        this.router.navigate(['/marketplace', data.marketplace.id]);
      })
      .catch((error) => {
        this.error.set('Failed to post item. Please try again.');
        console.error('Submission Error:', error);
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }

  public onLocationSelected(location: NominatimLocation) {
    this.place.set(location);
    this.searchResults.set([]);
    this.itemForm.patchValue({ placeDisplayName: location.display_name }, { emitEvent: false });
  }
}
