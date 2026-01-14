import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CreateEventRequest, EventResponse, EventsResponse } from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  public getEvents() {
    return this.http.get<EventsResponse>(`${this.apiUrl}/event`);
  }

  public getUserEvents(userId: string) {
    return this.http.get<EventsResponse>(`${this.apiUrl}/event/user/${userId}`);
  }

  public getEvent(eventId: string) {
    return this.http.get<EventResponse>(`${this.apiUrl}/event/${eventId}`);
  }

  public createEvent(data: CreateEventRequest) {
    return this.http.post<EventResponse>(`${this.apiUrl}/event`, data);
  }

  public updateEvent(eventId: string, data: Partial<CreateEventRequest>) {
    return this.http.patch<EventResponse>(`${this.apiUrl}/event/${eventId}`, data);
  }

  public deleteEvent(eventId: string) {
    return this.http.delete<void>(`${this.apiUrl}/event/${eventId}`);
  }

  public likeEvent(eventId: string) {
    return this.http.post<void>(`${this.apiUrl}/event/${eventId}/like`, {});
  }
}
