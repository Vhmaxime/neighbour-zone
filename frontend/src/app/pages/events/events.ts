import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../services/event';
import { Event, UserPublic } from '../../types/api.types';
import { LoadingComponent } from '../../components/loading-component/loading-component';
import { FriendService } from '../../services/friend';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterLink, LoadingComponent],
  templateUrl: './events.html'
})
export class Events {
  private eventService = inject(EventService);
  private friendService = inject(FriendService);
  public events = signal<Event[]>([]);

  public isLoading = signal(true);
  public isError = signal(false);
  public showingFriends = signal(false);

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

  public async filterFriends() {
    this.isLoading.set(true);
    this.showingFriends.set(true);
    try {
      const friendsResp = await firstValueFrom(this.friendService.getFriends());
      const friends: UserPublic[] = friendsResp.friends;
      const allEventsResp = await firstValueFrom(this.eventService.getEvents());
      const allEvents = allEventsResp.events;
      // Filter events waarvan de organizer.id in friends zit
      const friendIds = new Set(friends.map(f => f.id));
      const friendEvents = allEvents.filter(ev => friendIds.has(ev.organizer.id));
      this.events.set(friendEvents);
    } catch (e) {
      this.isError.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }
}
