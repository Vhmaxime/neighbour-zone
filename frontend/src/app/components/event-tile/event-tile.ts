import { Component, input, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Event } from '../../types/api.types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-event-tile',
  imports: [DatePipe],
  templateUrl: './event-tile.html',
  styleUrl: './event-tile.css',
})
export class EventTile {
  private router = inject(Router);
  public event = input.required<Event>();

  public eventDate = computed(() => {
    const dateTime = this.event().dateTime;
    return new Date(dateTime);
  });

  public navigateToEventDetails() {
    this.router.navigate(['/events', this.event().id]);
  }
}
