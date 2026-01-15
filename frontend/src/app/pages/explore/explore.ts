import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreSearch } from '../../components/explore-search/explore-search';
import { FriendList } from '../../components/friend-list/friend-list';
import { Calendar } from '../../components/calendar/calendar';
import { MapComponent } from '../../components/map/map';
import { EventService } from '../../services/event';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [
    CommonModule,
    ExploreSearch,
    FriendList,
    Calendar,
    MapComponent
  ],
  templateUrl: './explore.html',
  styleUrls: ['./explore.css'],
})
export class Explore {

  events$: Observable<any[]>;

  constructor(private eventService: EventService) {
    this.events$ = this.eventService.getEvents().pipe(
      // we geven alleen de events array door
      map(res => res.events)
    );
  }
}
