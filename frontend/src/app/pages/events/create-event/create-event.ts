import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { EventService } from '../../../services/event';
import { CreateEventRequest } from '../../../types/api.types';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css',
})
export class CreateEvent {
  private eventService = inject(EventService);
  private router = inject(Router);

  public isSubmitting = signal(false);

  public eventData = {
    title: '',
    description: '',
    placeDisplayName: '',
    dateTime: '',
    endAt: '',
  };

  onSubmit() {
    // Basic validation for the required location fields
    if (!this.eventData.title || !this.eventData.dateTime || !this.eventData.placeDisplayName) {
      return;
    }

    this.isSubmitting.set(true);

    const payload: CreateEventRequest = {
      title: this.eventData.title,
      description: this.eventData.description,
      placeDisplayName: this.eventData.placeDisplayName,
      // Default/Placeholder values for the required backend fields
      placeId: 0, 
      lat: "50.9650", 
      lon: "5.5000", 
      dateTime: new Date(this.eventData.dateTime).toISOString(),
      endAt: this.eventData.endAt ? new Date(this.eventData.endAt).toISOString() : undefined,
    };

    this.eventService.createEvent(payload).subscribe({
      next: () => this.router.navigate(['/events']),
      error: (err: any) => {
        console.error('Submission Error:', err.error);
        this.isSubmitting.set(false);
      }
    });
  }
}