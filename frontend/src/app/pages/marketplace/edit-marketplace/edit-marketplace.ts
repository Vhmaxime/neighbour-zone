import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { MarketplaceService } from '../../../services/marketplace';
import { NominatimService } from '../../../services/nominatim';
import { NominatimLocation } from '../../../types/nominatom-types';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { ActionButton } from '../../../components/action-button/action-button';
import { LoadingComponent } from '../../../components/loading-component/loading-component';
import { LocationSearchResults } from '../../../components/location-search-bar/location-search-results';

@Component({
  selector: 'app-edit-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    ActionButton,
    LoadingComponent,
    LocationSearchResults,
  ],
  templateUrl: './edit-marketplace.html',
  styleUrl: './edit-marketplace.css',
})
export class EditMarketplace {
  private fb = inject(FormBuilder);
  private marketplaceService = inject(MarketplaceService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  private nominatimService = inject(NominatimService);

  private itemId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  public isLoading = signal<boolean>(true);
  public isSubmitting = signal<boolean>(false);
  public error = signal<string | null>(null);

  public item = signal<any>(null);
  public searchResults = signal<NominatimLocation[]>([]);
  public place = signal<NominatimLocation | null>(null);

  public editForm = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(150)]],
    price: [0, [Validators.min(0)]],
    category: ['offered', [Validators.required]],
    placeDisplayName: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
    ],
  });

  constructor() {
    this.loadItem();
  }

  public ngOnInit() {
    this.editForm.controls.placeDisplayName.valueChanges
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

  private async loadItem() {
    try {
      this.isLoading.set(true);
      const response = await firstValueFrom(
        this.marketplaceService.getMarketplaceItem(this.itemId),
      );
      const itemData = (response as any).marketplace || response;
      this.item.set(itemData);
      if (itemData) {
        this.editForm.patchValue({
          title: itemData.title,
          description: itemData.description,
          price: itemData.price,
          category: itemData.category,
          placeDisplayName: itemData.placeDisplayName || itemData.location || '',
        });
        // Set initial place if available
        if (itemData.lat && itemData.lon && itemData.placeDisplayName) {
          this.place.set({
            place_id: itemData.placeId || '',
            display_name: itemData.placeDisplayName,
            lat: itemData.lat,
            lon: itemData.lon,
          } as NominatimLocation);
        }
      }
    } catch (err) {
      console.error('Error loading item:', err);
      this.router.navigate(['/marketplace']);
    } finally {
      this.isLoading.set(false);
    }
  }

  public onLocationSelected(location: NominatimLocation) {
    this.place.set(location);
    this.searchResults.set([]);
    this.editForm.patchValue({ placeDisplayName: location.display_name }, { emitEvent: false });
  }

  public async onSubmit() {
    this.editForm.markAllAsTouched();
    const { title, description, price, category, placeDisplayName } = this.editForm.value;
    const place = this.place();

    if (this.editForm.invalid || !title || !placeDisplayName) {
      return;
    }

    this.isSubmitting.set(true);
    this.error.set(null);

    if (!place) {
      this.error.set('Please search for a location and select one from the list.');
      this.isSubmitting.set(false);
      return;
    }

    try {
      await firstValueFrom(
        this.marketplaceService.updateMarketplaceItem(this.itemId, {
          title,
          description,
          price: price ?? 0,
          placeId: place.place_id,
          placeDisplayName: place.display_name,
          category: category as 'offered' | 'wanted',
          lat: place.lat,
          lon: place.lon,
        }),
      );
      this.router.navigate(['/marketplace']);
    } catch (err) {
      this.error.set('Failed to update item. Please try again.');
      console.error('Update failed:', err);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  onItemDeleted() {
    this.router.navigate(['/marketplace']);
  }
}
