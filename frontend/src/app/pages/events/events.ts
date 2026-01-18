import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EventService } from '../../services/event';
import { Event } from '../../types/api.types';
import { LoadingComponent } from '../../components/loading-component/loading-component';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './events.html',
  styleUrl: './events.css',
})
export class Events implements OnInit {
  private eventService = inject(EventService);
  public events = signal<Event[]>([]);

  public isLoading = signal(true);
  public isError = signal(false);

  ngOnInit() {
    this.loadEvents();
  }

  private loadEvents() {
    firstValueFrom(this.eventService.getEvents())
      .then((data) => {
        this.events.set(data.events);
        this.isError.set(false);
      })
      .catch((error) => {
        console.error('Error loading events:', error);
        this.isError.set(true);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
