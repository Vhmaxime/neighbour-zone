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
  template: `
    <div class="search-container">
      <input 
        [formControl]="searchControl" 
        type="text" 
        placeholder="Search events or items..." 
        class="search-input"
      />

      <div *ngIf="results$ | async as results" class="results-dropdown">
        
        <div *ngIf="results.events.length > 0">
          <div class="section-header">Events</div>
          <div *ngFor="let event of results.events" class="result-item" (click)="onSelectEvent(event)">
            <span class="title">{{ event.title }}</span>
            <span class="meta">{{ event.dateTime | date:'shortDate' }}</span>
          </div>
        </div>

        <div *ngIf="results.marketplaceItems.length > 0">
          <div class="section-header">Marketplace</div>
          <div *ngFor="let item of results.marketplaceItems" class="result-item" (click)="onSelectMarketplace(item)">
            <span class="title">{{ item.title }}</span>
            <span class="meta">{{ item.description.slice(0, 30) }}...</span>
          </div>
        </div>

        <div *ngIf="results.events.length === 0 && results.marketplaceItems.length === 0 && searchControl.value" 
             class="no-results">
          No matches found.
        </div>
      </div>
    </div>
  `,
  styles: [`
    .search-container { position: relative; width: 100%; max-width: 500px; }
    .search-input { width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 8px; }
    .results-dropdown { 
      position: absolute; top: 100%; left: 0; right: 0; 
      background: white; border: 1px solid #eee; 
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      z-index: 50; max-height: 400px; overflow-y: auto;
      border-radius: 0 0 8px 8px;
    }
    .section-header { background-color: #f3f4f6; color: #6b7280; padding: 8px 12px; font-size: 0.75rem; font-weight: bold; text-transform: uppercase; }
    .result-item { padding: 10px 12px; cursor: pointer; display: flex; justify-content: space-between; border-bottom: 1px solid #f3f4f6; }
    .result-item:hover { background-color: #f9fafb; }
    .title { font-weight: 500; }
    .meta { font-size: 0.85rem; color: #9ca3af; }
    .no-results { padding: 16px; text-align: center; color: #9ca3af; }
  `]
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