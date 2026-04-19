import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreSearch } from '../../components/explore-search/explore-search';
import { FriendList } from '../../components/friend-list/friend-list';
import { Calendar } from '../../components/calendar/calendar';
import { MapComponent } from '../../components/map/map';
import { MapFilterState, MapFiltersComponent } from '../../components/map-filters/map-filters';
import { EventService } from '../../services/event';
import { firstValueFrom } from 'rxjs';
import { Event } from '../../types/api.types';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, ExploreSearch, FriendList, Calendar, MapComponent, MapFiltersComponent],
  templateUrl: './explore.html'
})
export class Explore {
  private eventService = inject(EventService);
  public events = signal<Event[]>([]);
  public mapFiltersOpen = signal(false);
  public mapFilters = signal<MapFilterState>({
    upcoming: false,
    today: false,
    thisWeek: false,
    liked: false,
  });

  public activeMapFilterCount = computed(
    () => Object.values(this.mapFilters()).filter(Boolean).length,
  );

  public filteredMapEvents = computed(() => {
    const filters = this.mapFilters();
    const now = new Date();

    return this.events().filter((event) => {
      const eventDate = new Date(event.dateTime);
      if (Number.isNaN(eventDate.getTime())) {
        return false;
      }

      if (filters.upcoming && eventDate < now) {
        return false;
      }

      if (filters.today && !this.isSameDay(eventDate, now)) {
        return false;
      }

      if (filters.thisWeek && !this.isInCurrentWeek(eventDate, now)) {
        return false;
      }

      if (filters.liked && !event.liked) {
        return false;
      }

      return true;
    });
  });

  public isLoading = signal(true);
  public isError = signal(false);

  public toggleMapFiltersPanel() {
    this.mapFiltersOpen.update((open) => !open);
  }

  public updateMapFilters(nextState: MapFilterState) {
    this.mapFilters.set(nextState);
  }

  public resetMapFilters() {
    this.mapFilters.set({
      upcoming: false,
      today: false,
      thisWeek: false,
      liked: false,
    });
  }

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

  private isSameDay(left: Date, right: Date): boolean {
    return (
      left.getFullYear() === right.getFullYear() &&
      left.getMonth() === right.getMonth() &&
      left.getDate() === right.getDate()
    );
  }

  private isInCurrentWeek(date: Date, now: Date): boolean {
    const start = new Date(now);
    const dayIndex = (start.getDay() + 6) % 7;

    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - dayIndex);

    const end = new Date(start);
    end.setDate(end.getDate() + 7);

    return date >= start && date < end;
  }
}
