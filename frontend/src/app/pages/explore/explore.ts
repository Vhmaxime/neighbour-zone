import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreSearch } from '../../components/explore-search/explore-search';
import { FriendList } from '../../components/friend-list/friend-list';
import { Calendar } from '../../components/calendar/calendar';
import { MapComponent } from '../../components/map/map';
import { EventService } from '../../services/event';
import { firstValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Event } from '../../types/api.types';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, ExploreSearch, FriendList, Calendar, MapComponent],
  templateUrl: './explore.html',
  styleUrls: ['./explore.css'],
})
export class Explore {
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
