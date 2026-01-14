import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Observable, switchMap, catchError, of, tap, map } from 'rxjs';
import { Event } from '../../types/api.types';
import { Api } from '../../services/api';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  event$: Observable<Event | null>;

  private route = inject(ActivatedRoute);
  private api = inject(Api);

  constructor() {
    this.event$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');

        // If id is null (broken URL), return null immediately,
        // effectively skipping the API call so it doesn't crash
        if(!id) return of (null);

        // Now TypeScript knows 'id' is definitely a string
        return this.api.getEvent(id).pipe(
          map((response: any) => {
            return response.event ? response.event : response;
          })
        );
      }),
      tap(data => console.log('Event loaded:', data)), // To see it work
      catchError(error => {
        console.error('Error loading event:', error);
        return of(null);
      })
    );
  }
}
