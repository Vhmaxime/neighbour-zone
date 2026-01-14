import { Component, input, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Event } from '../../types/api.types';

@Component({
  selector: 'app-event-tile',
  imports: [DatePipe],
  templateUrl: './event-tile.html',
  styleUrl: './event-tile.css',
})
export class EventTile {
  public event = input.required<Event>();

  public eventDate = computed(() => {
    const dateTime = this.event().dateTime;
    return new Date(dateTime);
  });
}
