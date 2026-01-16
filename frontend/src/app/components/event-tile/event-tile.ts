import { Component, input, computed, inject, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Event } from '../../types/api.types';
import { Router } from '@angular/router';
import { LikeButton } from '../like-button/like-button';
import { EditButton } from '../../components/edit-button/edit-button'; 
import { DeleteButton } from '../../components/delete-button/delete-button';

@Component({
  selector: 'app-event-tile',
  imports: [DatePipe, LikeButton, EditButton, DeleteButton],
  templateUrl: './event-tile.html',
  styleUrl: './event-tile.css',
})
export class EventTile {
  private router = inject(Router);
  public event = input.required<Event>();
  deleted = output<string>();

  public eventDate = computed(() => {
    const dateTime = this.event().dateTime;
    return new Date(this.event().dateTime);
  });

  public viewEvent() {
    // Navigates to /events/:id to match the routes
    this.router.navigate(['/events', this.event().id]);
  }
}
