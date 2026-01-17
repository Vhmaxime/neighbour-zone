import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../../services/event';
import { CreateEventRequest } from '../../../types/api.types';
import { LocationSearchResults } from '../../../components/location-search-bar/location-search-results';
import { NominatimLocation } from '../../../types/nominatom-types';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LocationSearchResults, ReactiveFormsModule],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEvent {
  private formBuilder = inject(FormBuilder);
  private eventService = inject(EventService);
  private router = inject(Router);

  public isLoading = signal<boolean>(false);
  public isSuccess = signal<boolean>(false);
  public error = signal<string | null>(null);

  public place = signal<NominatimLocation | null>(null);

  public eventForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(300)]],
    placeDisplayName: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
    ],
    dateTime: ['', [Validators.required]],
    endAt: ['', [Validators.required]],
  });

  public onSubmit() {
    const { title, description, placeDisplayName, dateTime, endAt } = this.eventForm.value;
    const place = this.place();

    if (this.eventForm.invalid || !title || !description || !placeDisplayName || !dateTime) {
      return;
    }
    if (!place) {
      return;
    }

    this.isLoading.set(true);
    firstValueFrom(
      this.eventService.createEvent({
        title,
        description,
        placeDisplayName,
        dateTime,
        endAt,
        lat: place.lat,
        lon: place.lon,
        placeId: place.place_id,
      })
    )
      .then(({ event }) => {
        this.isSuccess.set(true);
        this.error.set(null);
        this.router.navigate(['/event', event.id]);
      })
      .catch((error) => {
        if (error.error.message) {
          this.error.set(error.error.message);
          this.isSuccess.set(false);
          return;
        }
        console.error('Error logging in:', error);
        this.error.set('An unexpected error occurred. Please try again.');
        this.isSuccess.set(false);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public onLocationSelected(location: NominatimLocation) {
    this.place.set(location);
  }
}
