import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateEventRequest,
  EventDetailResponse,
  EventResponse,
  EventsResponse,
} from '../types/api.types';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class EventService {
  private envService: EnvironmentService = inject(EnvironmentService);
  private http = inject(HttpClient);

  private readonly apiUrl = this.envService.getAPI_URL();

  public getEvents() {
    return this.http.get<EventsResponse>(`${this.apiUrl}/event`);
  }

  public getEventsByUser(userId: string) {
    return this.http.get<EventsResponse>(`${this.apiUrl}/event`, { params: { eventBy: userId } });
  }

  public getEvent(eventId: string) {
    return this.http.get<EventDetailResponse>(`${this.apiUrl}/event/${eventId}`);
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
    return this.http.post<{ liked: boolean }>(`${this.apiUrl}/event/${eventId}/like`, {});
  }

  public getLikedEvents() {
    return this.http.get<EventsResponse>(`${this.apiUrl}/event/liked`);
  }
}
