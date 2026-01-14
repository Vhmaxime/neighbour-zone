import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api } from '../../services/api';
import { Title } from '@angular/platform-browser';
import { Observable, map, catchError, of } from 'rxjs';
import { forkJoin } from 'rxjs';
import { EventTile } from '../../components/event-tile/event-tile';
import { MarketplaceTile } from '../../components/marketplace-tile/marketplace-tile';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, EventTile, MarketplaceTile],
  templateUrl: './feed.html',
  styleUrl: './feed.css',
})
export class Feed implements OnInit {
  private api = inject(Api);
  private titleService = inject(Title);

  // Consistency: Using the Observable stream pattern
  public feedItems$: Observable<any[]> = of([]);

  ngOnInit() {
    this.titleService.setTitle('Feed | Neighbour Zone');

    this.feedItems$ = forkJoin({
      eventsReq: this.api.getEvents(),
      marketplaceReq: this.api.getMarketplaceItems()
    }).pipe(
      map(response => {
        // Grab the arrays from the envelopes
        const events = response.eventsReq.events || [];
        const items = response.marketplaceReq.marketplace || [];

        //  Combine them into one "activity" array
        const combined = [...events, ...items];

        // Sort by date (Newest first) and take the last 10
        return combined
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10);
      }),
      catchError(err => {
        console.error('Error loading feed:', err);
        return of([]);
      })
    );
  }
}
