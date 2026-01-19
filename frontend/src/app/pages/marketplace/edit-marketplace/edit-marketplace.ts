import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, firstValueFrom, switchMap } from 'rxjs';
import { MarketplaceService } from '../../../services/marketplace';
import { AuthService } from '../../../services/auth';
import { ActionButton } from '../../../components/action-button/action-button';
import { LoadingComponent } from '../../../components/loading-component/loading-component';
import { LocationSearchResults } from '../../../components/location-search-bar/location-search-results';
import { Title } from '@angular/platform-browser';
import { NominatimLocation } from '../../../types/nominatom-types';
import { NominatimService } from '../../../services/nominatim';
import { MarketplaceItem } from '../../../types/api.types';

@Component({
  selector: 'app-edit-marketplace',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ActionButton,
    LoadingComponent,
    ReactiveFormsModule,
    LocationSearchResults,
  ],
  templateUrl: './edit-marketplace.html',
  styleUrl: './edit-marketplace.css',
})
export class EditMarketplace {
  // Injected services
  private marketplaceService = inject(MarketplaceService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private titleService = inject(Title);
  private nominatimService = inject(NominatimService);

  // Get ID from route params
  public itemId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  public user = this.authService.getUser();

  // State signals for location search
  public searchResults = signal<NominatimLocation[]>([]);
  public place = signal<NominatimLocation | null>(null);

  // State signals
  public isSubmitting = signal(false);
  public isLoading = signal(true);
  public error = signal<string | null>(null);
  public isSuccess = signal(false);

  // Store full item object for ActionButton usage
  public item = signal<MarketplaceItem | null>(null);

  // Form definition
  public editForm = this.formBuilder.nonNullable.group({
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
    this.loadItem();

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
      });
  }

  private loadItem() {
    this.isLoading.set(true);
    this.error.set(null);
    this.isSuccess.set(false);

    firstValueFrom(this.marketplaceService.getMarketplaceItemById(this.itemId))
      .then((marketplace) => {
        if (this.user?.sub !== marketplace.provider.id) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.item.set(marketplace);
        this.setFormValues(marketplace);
        this.titleService.setTitle(`Edit Marketplace Item - ${marketplace.title}`);
      })
      .catch((err) => {
        if (err.status === 404) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.error.set('An error occurred while loading the item.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private setFormValues(item: any) {
    const { title, description, price, category, placeDisplayName, lat, lon, placeId } = item;
    this.editForm.patchValue({
      title,
      description,
      price,
      category,
      placeDisplayName: placeDisplayName || item.location || '',
    });

    if (lat && lon && placeDisplayName) {
      this.place.set({
        lat,
        lon,
        display_name: placeDisplayName,
        place_id: placeId || '',
      });
    }
  }

  public onSubmit() {
    this.editForm.markAllAsTouched();

    const { title, description, price, category, placeDisplayName } = this.editForm.value;
    const place = this.place();

    if (this.editForm.invalid || !title || !placeDisplayName) {
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
    )
      .then(() => {
        this.isSuccess.set(true);
        this.location.back();
      })
      .catch((error) => {
        this.error.set('Failed to update item. Please try again.');
        console.error('Update failed:', error);
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }

  public onItemDeleted() {
    this.router.navigate(['/marketplace']);
  }

  // Location selection handler
  public onLocationSelected(location: NominatimLocation) {
    this.place.set(location);
    this.searchResults.set([]);
    // emitEvent: false prevents this update from triggering the search again!
    this.editForm.patchValue({ placeDisplayName: location.display_name }, { emitEvent: false });
  }
}
