import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Event } from '../../types/api.types';
import { Title } from '@angular/platform-browser';
import { EventService } from '../../services/event';
import { BackButton } from '../../components/back-button/back-button';
import { ActionButton } from '../../components/action-button/action-button';
import { LikeButton } from '../../components/like-button/like-button';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [CommonModule, RouterLink, DatePipe, BackButton, ActionButton, LikeButton],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private titleService = inject(Title);

  // Captures ID from route snapshot
  private eventId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  public isLoading = signal(true);
  public event = signal<Event | null>(null);

  ngOnInit() {
    this.loadEvent();
  }

  private async loadEvent() {
    try {
      this.isLoading.set(true);
      const response = await firstValueFrom(this.eventService.getEvent(this.eventId));
      
      // Safety: handles { event: {} } or direct {} responses
      const eventData = response?.event || response;
      this.event.set(eventData);
      
      if (eventData) {
        this.titleService.setTitle(`${eventData.title} | Neighbour Zone`);
      }
    } catch (error: any) {
      if (error.status === 404) {
        this.router.navigate(['/not-found']);
      }
      console.error('Error fetching event:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}
