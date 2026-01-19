import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, filter, firstValueFrom, switchMap } from 'rxjs';
import { EventService } from '../../../services/event';
import { Event } from '../../../types/api.types';
import { AuthService } from '../../../services/auth';
import { ActionButton } from '../../../components/action-button/action-button';
import { BackButton } from '../../../components/back-button/back-button';
import { LoadingComponent } from '../../../components/loading-component/loading-component';
import { Title } from '@angular/platform-browser';
import { NominatimLocation } from '../../../types/nominatom-types';
import { LocationSearchResults } from '../../../components/location-search-bar/location-search-results';
import { NominatimService } from '../../../services/nominatim';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    ActionButton,
    BackButton,
    LoadingComponent,
    ReactiveFormsModule,
    LocationSearchResults,
  ],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.html',
})
export class EditEvent {
  // Injected services
  private eventService = inject(EventService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private titleService = inject(Title);
  private nominatimService = inject(NominatimService);

  // Get ID from route params
  public eventId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  public user = this.authService.getUser();

  // State signals for location search
  public searchResults = signal<NominatimLocation[]>([]);
  public place = signal<NominatimLocation | null>(null);

  // State signals
  public isSubmitting = signal(false);
  public isLoading = signal(true);
  public error = signal<string | null>(null);
  public isSuccess = signal(false);

  // Store full event object for ActionButton usage (need organizer id)
  public event = signal<Event | null>(null);

  // Form definition
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
    this.loadEvent();

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
      });
  }

  private loadEvent() {
    this.isLoading.set(true);
    this.error.set(null);
    this.isSuccess.set(false);

    firstValueFrom(this.eventService.getEvent(this.eventId))
      .then(({ event }) => {
        if (this.user?.sub !== event.organizer.id) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.event.set(event);
        this.setFormValues(event);
        this.titleService.setTitle(`Edit Event - ${event.title}`);
      })
      .catch((err) => {
        if (err.status === 404) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.error.set('An error occurred while loading the event.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private setFormValues(event: Event) {
    const { title, description, placeDisplayName, dateTime, endAt, lat, lon, placeId } = event;
    this.eventForm.patchValue({
      title,
      description,
      placeDisplayName,
      dateTime,
      endAt: endAt ?? undefined,
    });

    this.place.set({
      lat,
      lon,
      display_name: placeDisplayName,
      place_id: placeId,
    });
  }

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
      .then(() => {
        this.isSuccess.set(true);
        this.location.back();
      })
      .catch((error) => {
        this.error.set('Failed to create event. Please try again later.');
        console.error('Submission Error:', error);
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }

  public onEventDeleted() {
    this.location.back();
  }

  // Location selection handler
  public onLocationSelected(location: NominatimLocation) {
    this.place.set(location);
    this.searchResults.set([]);

    // emitEvent: false prevents this update from triggering the search again!
    this.eventForm.patchValue({ placeDisplayName: location.display_name }, { emitEvent: false });
  }
}
