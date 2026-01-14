import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import { debounceTime, distinctUntilChanged, switchMap, catchError, map } from 'rxjs/operators';
import { Observable, forkJoin, of } from 'rxjs';

import { 
  EventsResponse, 
  MarketplaceItemsResponse, 
  SearchResult,
  EventSearchResult,
  MarketplaceItemSearchResult
} from '../../types/api.types';

@Component({
  selector: 'app-explore-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './explore-search.html',
  styleUrl: './explore-search.css',
})

export class ExploreSearch {
  searchControl = new FormControl('');
  results$!: Observable<SearchResult>;
  private apiUrl = 'https://neighbour-zone.vercel.app/api';

  constructor(private http: HttpClient, private router: Router) {
    this.results$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || !term.trim()) {
          return of({ users: [], posts: [], events: [], marketplaceItems: [] });
        }
        return this.performSearch(term);
      })
    );
  }

  private performSearch(term: string): Observable<SearchResult> {
    const events$ = this.http.get<EventsResponse>(`${this.apiUrl}/event`, { params: { search: term } });
    const market$ = this.http.get<MarketplaceItemsResponse>(`${this.apiUrl}/marketplace`, { params: { search: term } });

    return forkJoin([events$, market$]).pipe(
      map(([eventsRes, marketRes]) => {
        return {
          users: [],
          posts: [],
          events: eventsRes.events.map(e => ({
            id: e.id, 
            title: e.title, 
            dateTime: e.dateTime
          })),
          marketplaceItems: marketRes.marketplace.map(i => ({
            id: i.id, 
            title: i.title, 
            description: i.description
          }))
        };
      }),
      catchError(err => {
        console.error(err);
        return of({ users: [], posts: [], events: [], marketplaceItems: [] });
      })
    );
  }

  onSelectEvent(event: EventSearchResult) {
    this.router.navigate(['/events', event.id]);
  }

  onSelectMarketplace(item: MarketplaceItemSearchResult) {
    this.router.navigate(['/marketplace', item.id]);
  }
}