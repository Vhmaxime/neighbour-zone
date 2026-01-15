import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventService } from '../../services/event';
import { Event } from '../../types/api.types';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit{
  private eventService = inject(EventService);

  events$: Observable<Event[]> | undefined;

  ngOnInit() {
    this.events$ = this.eventService.getEvents().pipe(
      map((response) => response.events || [])
    );
  }
}
