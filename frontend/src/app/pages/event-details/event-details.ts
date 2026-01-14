import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, catchError, of, tap } from 'rxjs';
import { Event } from '../../types/api.types';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  event$: Observable<Event | null>;
  private apiUrl = 'https://neighbour-zone.vercel.app/api';

  constructor(private route: ActivatedRoute, private http: HttpClient) {
    this.event$ = this.route.paramMap.pipe(
      switchMap(params => {
        const id = params.get('id');
        // Tell HTTP Client we expect a raw 'Event' object
        return this.http.get<Event>(`${this.apiUrl}/event/${id}`);
      }),
      tap(data => console.log('Event loaded:', data)), // To see it work
      catchError(error => {
        console.error('Error loading event:', error);
        return of(null);
      })
    );
  }
}
