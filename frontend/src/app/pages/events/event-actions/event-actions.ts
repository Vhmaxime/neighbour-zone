import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../services/auth';
import { EventService } from '../../../services/event';

@Component({
  selector: 'app-event-actions',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-actions.html'
})
export class EventActions {
  private authService = inject(AuthService);
  private eventService = inject(EventService);
  private router = inject(Router);

  eventId = input.required<string>();
  organizerId = input.required<string>();
  eventTitle = input.required<string>();
  
  // Output to notify parent (like Profile) that an item was removed
  deleted = output<string>();

  // Use the authService getUser() method to check ownership
  public isOwner(): boolean {
    const user = this.authService.getUser();
    // Comparing JWT 'sub' with event 'organizer.id'
    return user?.sub === this.organizerId();
  }

  // Alternative to routerLink if you want to navigate via TS
  onEdit() {
    this.router.navigate(['/events', this.eventId(), 'edit']);
  }

  onDelete() {
    if (confirm(`Are you sure you want to delete "${this.eventTitle()}"?`)) {
      this.eventService.deleteEvent(this.eventId()).subscribe({
        next: () => {
          this.deleted.emit(this.eventId());
          // If we are on the details page, we need to navigate away
          if (this.router.url.includes(this.eventId())) {
            this.router.navigate(['/events']);
          }
        },
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}