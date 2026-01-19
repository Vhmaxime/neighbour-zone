import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationSearchResults } from '../../../components/location-search-bar/location-search-results';
import { NominatimService } from '../../../services/nominatim';
import { EventService } from '../../../services/event';
import { NominatimLocation } from '../../../types/nominatom-types';
import { firstValueFrom } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, filter } from 'rxjs/operators';
import { BackButton } from '../../../components/back-button/back-button';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LocationSearchResults, BackButton],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEvent {
  private formBuilder = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);
  private nominatimService = inject(NominatimService);

  public isLoading = signal<boolean>(false);
  public isSuccess = signal<boolean>(false);
  public error = signal<string | null>(null);

  public searchResults = signal<NominatimLocation[]>([]);
  public place = signal<NominatimLocation | null>(null);

  public eventForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(150)]],
    placeDisplayName: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
    ],
    dateTime: ['', [Validators.required]],
    endAt: [''],
  });

  ngOnInit() {
    this.eventForm.controls.placeDisplayName.valueChanges
      .pipe(
        filter((query) => !!query && query.length >= 3), // Only search if 3+ chars
        debounceTime(300), // Wait 300ms after user stops typing
        distinctUntilChanged(), // Don't search if the text is effectively the same
        switchMap((query) => this.nominatimService.searchLocation(query)), // Cancel old search if new one starts
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
    this.eventForm.markAllAsTouched();
    const { title, description, placeDisplayName, dateTime, endAt } = this.eventForm.value;
    const place = this.place();

    if (this.eventForm.invalid || !title || !description || !placeDisplayName || !dateTime) {
      return;
    }

    if (!place) {
      this.error.set('Please search for a location and select one from the list.');
      return;
    }

    this.isLoading.set(true);

    firstValueFrom(
      this.eventService.createEvent({
        title,
        description,
        placeDisplayName,
        dateTime: new Date(dateTime).toISOString(),
        endAt: endAt ? new Date(endAt).toISOString() : undefined,
        lat: place.lat,
        lon: place.lon,
        placeId: place.place_id,
      }),
    )
      .then(({ event }) => {
        this.isSuccess.set(true);
        this.error.set(null);
        this.router.navigate(['/events', event.id]);
      })
      .catch((error) => {
        console.error('Submission Error:', error);
        const msg = error.error?.message || 'An unexpected error occurred.';
        this.error.set(msg);
        this.isSuccess.set(false);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public onLocationSelected(location: NominatimLocation) {
    this.place.set(location);
    this.searchResults.set([]);

    // emitEvent: false prevents this update from triggering the search again!
    this.eventForm.patchValue({ placeDisplayName: location.display_name }, { emitEvent: false });
  }
}
