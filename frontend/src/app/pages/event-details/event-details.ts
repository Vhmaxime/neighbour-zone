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
import { LoadingComponent } from '../../components/loading-component/loading-component';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    BackButton,
    ActionButton,
    LikeButton,
    LoadingComponent,
  ],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css',
})
export class EventDetails {
  // Inject dependencies
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private eventService = inject(EventService);
  private titleService = inject(Title);

  // Get event ID from route parameters
  private eventId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  // State signals
  public isLoading = signal(true);
  public error = signal<string | null>(null);
  public event = signal<Event | null>(null);

  public ngOnInit() {
    this.loadEvent();
  }

  // Load event by ID
  private async loadEvent() {
    this.isLoading.set(true);
    this.error.set(null);

    firstValueFrom(this.eventService.getEvent(this.eventId))
      .then(({ event }) => {
        this.event.set(event);
        this.titleService.setTitle(event.title);
      })
      .catch((err) => {
        if (err.status === 404) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.error.set('An error occurred while loading the event.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
