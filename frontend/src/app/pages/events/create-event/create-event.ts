import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../../services/event';
import { CreateEventRequest } from '../../../types/api.types';
import { LocationSearchBar } from '../../../components/location-search-bar/location-search-bar';
import { NominatimLocation } from '../../../types/nominatom-types';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, LocationSearchBar],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEvent {
  private eventService = inject(EventService);
  private router = inject(Router);

  public place = signal<NominatimLocation | null>(null);
  public isSubmitting = signal(false);

  public eventData = {
    title: '',
    description: '',
    dateTime: '',
    endAt: '',
  };

  onSubmit() {
    const place = this.place();
    if (!this.eventData.title || !this.eventData.dateTime || !place) {
      return;
    }

    this.isSubmitting.set(true);

    const payload: CreateEventRequest = {
      title: this.eventData.title,
      description: this.eventData.description,
      placeDisplayName: place.display_name,
      placeId: place.place_id,
      lat: place.lat,
      lon: place.lon,
      dateTime: new Date(this.eventData.dateTime).toISOString(),
      endAt: this.eventData.endAt ? new Date(this.eventData.endAt).toISOString() : undefined,
    };

    console.log(payload);

    this.eventService.createEvent(payload).subscribe({
      next: () => this.router.navigate(['/events']),
      error: (err: any) => {
        console.error('Submission Error:', err.error);
        this.isSubmitting.set(false);
      },
    });
  }

  onLocationSelected(location: NominatimLocation) {
    this.place.set(location);
  }
}
