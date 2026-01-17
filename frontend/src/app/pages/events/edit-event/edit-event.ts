import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../../services/event';
import { CreateEventRequest } from '../../../types/api.types';
import { AuthService } from '../../../services/auth';
import { ActionButton } from '../../../components/action-button/action-button';


@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ActionButton],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.html',
})
export class EditEvent {
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  
  public eventId = this.route.snapshot.paramMap.get('id') as string;
  public isSubmitting = signal(false);
  public isLoading = signal(true);

  // Store full event object for ActionButton usage (need organizer id)
  public eventSource = signal<any>(null);

  public eventData = {
    title: '',
    description: '',
    placeDisplayName: '',
    dateTime: '',
    endAt: '',
  };

  private coords = { lat: '', lon: '', placeId: 0 };

  async ngOnInit() {
    try {
      const response = await firstValueFrom(this.eventService.getEvent(this.eventId));
      const data = response.event;

      // Save full object to signal for template
      this.eventSource.set(data);

        const user = this.authService.getUser();
        if (user?.sub !== data.organizer.id) {
            this.router.navigate(['/events', this.eventId]);
            return;
        }

      // Populate the form
      this.eventData = {
        title: data.title,
        description: data.description,
        placeDisplayName: data.placeDisplayName,
        dateTime: data.dateTime ? new Date(data.dateTime).toISOString().slice(0, 16) : '',
        endAt: data.endAt ? new Date(data.endAt).toISOString().slice(0, 16) : '',
      };
      this.coords = { lat: data.lat, lon: data.lon, placeId: data.placeId };
    } catch (error) {
      console.error('Error loading event:', error);
      this.router.navigate(['/events']);
    } finally {
      this.isLoading.set(false);
    }
  }

  onSubmit() {
    this.isSubmitting.set(true);
    const payload: Partial<CreateEventRequest> = {
      ...this.eventData,
      dateTime: new Date(this.eventData.dateTime).toISOString(),
      endAt: this.eventData.endAt ? new Date(this.eventData.endAt).toISOString() : undefined,
      lat: this.coords.lat,
      lon: this.coords.lon,
      placeId: this.coords.placeId
    };

    this.eventService.updateEvent(this.eventId, payload).subscribe({
      next: () => this.router.navigate(['/events', this.eventId]),
      error: () => this.isSubmitting.set(false)
    });
  }

  onEventDeleted() {
    this.router.navigate(['/events']);
  }
}