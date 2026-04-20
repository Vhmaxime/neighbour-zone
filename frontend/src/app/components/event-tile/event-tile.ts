import { Component, input, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Event } from '../../types/api.types';
import { Router } from '@angular/router';
import { LikeButton } from '../like-button/like-button';
import { ActionButton } from '../../components/action-button/action-button';


@Component({
  selector: 'app-event-tile',
  imports: [DatePipe, LikeButton, ActionButton],
  templateUrl: './event-tile.html'
})
export class EventTile {
  private router = inject(Router);
  public event = input.required<Event>();

  public eventDate = computed(() => {
    const dateTime = this.event().dateTime;
    return new Date(this.event().dateTime);
  });

  public viewEvent() {
    this.router.navigate(['/events', this.event().id]);
  }
}
