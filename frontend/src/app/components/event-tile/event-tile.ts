import { Component, input, computed, inject, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Event } from '../../types/api.types';
import { Router } from '@angular/router';
import { LikeButton } from '../like-button/like-button';
import { EventActions } from '../../pages/events/event-actions/event-actions';

@Component({
  selector: 'app-event-tile',
  imports: [DatePipe, LikeButton, EventActions],
  templateUrl: './event-tile.html',
  styleUrl: './event-tile.css',
})
export class EventTile {
  private router = inject(Router);
  public event = input.required<Event>();
  deleted = output<string>();

  public eventDate = computed(() => {
    const dateTime = this.event().dateTime;
    return new Date(dateTime);
  });

  public navigateToEventDetails() {
    this.router.navigate(['/events', this.event().id]);
  }
}
