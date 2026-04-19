import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
  templateUrl: './create-event.html'
})
export class CreateEvent {
  // Inject dependencies
  private formBuilder = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private nominatimService = inject(NominatimService);

  // State signals
  public isSubmitting = signal<boolean>(false);
  public isLoading = signal<boolean>(false);
  public isSuccess = signal<boolean>(false);
  public error = signal<string | null>(null);
  public communityId = signal<string | null>(null);

  public searchResults = signal<NominatimLocation[]>([]);
  public place = signal<NominatimLocation | null>(null);

  //Form definition
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

  public ngOnInit() {
    const cid = this.route.snapshot.queryParamMap.get('communityId');
    if (cid) this.communityId.set(cid);

    this.eventForm.controls.placeDisplayName.valueChanges
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

  // Form submission handler
  public onSubmit() {
    this.eventForm.markAllAsTouched();

    const { title, description, placeDisplayName, dateTime, endAt } = this.eventForm.value;

    const place = this.place();

    if (this.eventForm.invalid || !title || !placeDisplayName || !dateTime) {
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

    const communityId = this.communityId();

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
        ...(communityId ? { communityId } : {}),
      }),
    )
      .then(({ event }) => {
        this.isSuccess.set(true);
        if (communityId) {
          this.router.navigate(['/communities', communityId]);
        } else {
          this.router.navigate(['/events', event.id]);
        }
      })
      .catch((error) => {
        this.error.set('Failed to create event. Please try again later.');
        console.error('Submission Error:', error);
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }

  // Location selection handler
  public onLocationSelected(location: NominatimLocation) {
    this.place.set(location);
    this.searchResults.set([]);
    this.eventForm.patchValue({ placeDisplayName: location.display_name }, { emitEvent: false });
  }
}
