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

  // Simple event object to bind to the form using [(ngModel)]
  public eventData = {
    title: '',
    description: '',
    location: '',
    dateTime: '',
  };

  onSubmit() {
    // Basic validation check before submitting
    if (!this.eventData.title || !this.eventData.dateTime || !this.eventData.location) {
      return;
    }

    this.isSubmitting.set(true);

    // To see what the raw form data is
    console.log('Raw Form Data:', this.eventData);

    // Create a clean object that matches CreateEventRequest exactly
    const payload: CreateEventRequest = {
      title: this.eventData.title,
      description: this.eventData.description,
      location: this.eventData.location,
      dateTime: new Date(this.eventData.dateTime).toISOString(), // Ensure ISO format for Zod validation
    };

    // This is what actually goes over the wire
    console.log('Final Request Payload:', JSON.stringify(payload));

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        this.router.navigate(['/events']);
      },
      error: (err: any) => {
        console.error('HTTP Error Status:', err.status);
        console.error('Full Backend Error:', err.error);
        this.isSubmitting.set(false);
        alert(`Error ${err.status}: The server rejected the data. Check the console.`);
      }
    });
  }
}