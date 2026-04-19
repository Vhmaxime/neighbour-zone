import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreSearch } from '../../components/explore-search/explore-search';
import { FriendList } from '../../components/friend-list/friend-list';
import { Calendar } from '../../components/calendar/calendar';
import { MapComponent } from '../../components/map/map';
import { MapFilterState, MapFiltersComponent } from '../../components/map-filters/map-filters';
import { EventService } from '../../services/event';
import { FriendService } from '../../services/friend';
import { firstValueFrom } from 'rxjs';
import { Event, UserPublic } from '../../types/api.types';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, ExploreSearch, FriendList, Calendar, MapComponent, MapFiltersComponent],
  templateUrl: './explore.html'
})
export class Explore {
  private eventService = inject(EventService);
  private friendService = inject(FriendService);
  public events = signal<Event[]>([]);
  public mapFiltersOpen = signal(false);
  public mapFilters = signal<MapFilterState>({
    upcoming: false,
    today: false,
    friends: false,
    liked: false,
  });

  public friends = signal<UserPublic[]>([]);
  public friendsLoaded = signal(false);

  public activeMapFilterCount = computed(
    () => Object.values(this.mapFilters()).filter(Boolean).length,
  );

  public filteredMapEvents = computed(() => {
    const filters = this.mapFilters();
    const now = new Date();
    let filtered = this.events();

    if (filters.upcoming) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.dateTime);
        return eventDate >= now;
      });
    }

    if (filters.today) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.dateTime);
        return this.isSameDay(eventDate, now);
      });
    }

    if (filters.liked) {
      filtered = filtered.filter(event => event.liked);
    }

    if (filters.friends) {
      const friendIds = new Set(this.friends().map(f => f.id));
      filtered = filtered.filter(event => friendIds.has(event.organizer.id));
    }

    return filtered;
  });

  public isLoading = signal(true);
  public isError = signal(false);


  public toggleMapFiltersPanel() {
    this.mapFiltersOpen.update((open) => !open);
  }

  public async updateMapFilters(nextState: MapFilterState) {
    // If friends filter is toggled on and friends not loaded, fetch them
    if (nextState.friends && !this.friendsLoaded()) {
      try {
        const resp = await firstValueFrom(this.friendService.getFriends());
        this.friends.set(resp.friends);
        this.friendsLoaded.set(true);
      } catch (e) {
        // fallback: no friends loaded
        this.friends.set([]);
        this.friendsLoaded.set(true);
      }
    }
    this.mapFilters.set(nextState);
  }

  public resetMapFilters() {
    this.mapFilters.set({
      upcoming: false,
      today: false,
      friends: false,
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
}
