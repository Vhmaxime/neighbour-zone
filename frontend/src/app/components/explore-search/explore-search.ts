import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { debounceTime, firstValueFrom } from 'rxjs';
import { SearchService } from '../../services/search';
import { Event, MarketplaceItem, Post, SearchResponse, UserPublic } from '../../types/api.types';

@Component({
  selector: 'app-explore-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './explore-search.html',
  styleUrl: './explore-search.css',
})
export class ExploreSearch {
  private router = inject(Router);
  private searchService = inject(SearchService);
  public searchControl = new FormControl('');
  public isSearching = signal(false);
  public searchResults = signal<SearchResponse | null>(null);

  public ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((term) => this.performSearch(term || ''));
  }

  private performSearch(term: string) {
    if (this.isSearching()) {
      return;
    }
    this.isSearching.set(true);
    firstValueFrom(this.searchService.search(term))
      .then((results) => {
        this.searchResults.set(results);
      })
      .finally(() => {
        this.isSearching.set(false);
      });
  }

  onSelectUser(userId: string) {
    this.router.navigate(['/user', userId]);
  }

  onSelectPost(postId: string) {
    this.router.navigate(['/posts', postId]);
  }

  onSelectEvent(eventId: string) {
    this.router.navigate(['/events', eventId]);
  }

  onSelectMarketplace(itemId: string) {
    this.router.navigate(['/marketplace', itemId]);
  }
}
