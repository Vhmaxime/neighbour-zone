import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap, catchError, of, tap, map } from 'rxjs';
import { Event } from '../../types/api.types';
import { Api } from '../../services/api';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  event$: Observable<Event | null>;

  private route = inject(ActivatedRoute);
  private api = inject(Api);
  private titleService = inject(Title);

  constructor() {
    this.event$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const id = params.get('id');
        if (!id) return of(null);

        return this.api
          .getEvent(id)
          .pipe(map((response: any) => (response.event ? response.event : response)));
      }),
      tap((data) => {
        console.log('Event loaded:', data);
        if (data) {
          // Browser tab title
          this.titleService.setTitle(`${data.title} | Neighbour Zone`);
        }
      }),
      catchError((error) => {
        console.error('Error loading event:', error);
        return of(null);
      })
    );
  }
}
