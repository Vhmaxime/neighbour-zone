import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable, switchMap, catchError, of, tap, map, firstValueFrom } from 'rxjs';
import { Event, EventResponse } from '../../types/api.types';
import { Title } from '@angular/platform-browser';
import { EventService } from '../../services/event';
import { EventActions } from '../events/event-actions/event-actions';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink, EventActions],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private titleService = inject(Title);
  private eventId = this.activatedRoute.snapshot.paramMap.get('id') as string;
  public isLoading = signal(false);
  public event = signal<Event | null>(null);

  public ngOnInit() {
    this.loadEvent();
  }

  private loadEvent() {
    this.isLoading.set(true);
    firstValueFrom(this.eventService.getEvent(this.eventId))
      .then(({ event }) => {
        this.event.set(event);
        this.titleService.setTitle(`${event.title} | Neighbour Zone`);
      })
      .catch((error) => {
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        }
        console.error('Error fetching event:', error);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
