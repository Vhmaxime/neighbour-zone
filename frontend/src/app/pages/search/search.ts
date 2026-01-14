import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface SearchResults {
  users: Array<{ id: number; username: string }>;
  posts: Array<{ id: number; title: string }>;
  events: Array<{ id: number; title: string; dateTime: string }>;
  marketplace: Array<{ id: number; title: string; description: string }>;
}

@Component({
  selector: 'app-search',
  imports: [FormsModule, CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
})
export class Search {
  searchQuery = '';
  activeFilter = signal<'all' | 'users' | 'posts' | 'events' | 'marketplace'>('all');
  isLoading = signal(false);
  results = signal<SearchResults>({
    users: [],
    posts: [],
    events: [],
    marketplace: [],
  });

  private searchTimeout: any;

  onSearchInput() {
    clearTimeout(this.searchTimeout);

    if (!this.searchQuery.trim()) {
      this.results.set({
        users: [],
        posts: [],
        events: [],
        marketplace: [],
      });
      return;
    }

    this.isLoading.set(true);

    this.searchTimeout = setTimeout(() => {
      console.log('Searching for:', this.searchQuery);
    }, 500);
  }

  setFilter(filter: 'all' | 'users' | 'posts' | 'events' | 'marketplace') {
    this.activeFilter.set(filter);
    if (this.searchQuery.trim()) {
      this.performSearch();
    }
  }

  hasNoResults(): boolean {
    const r = this.results();
    if (this.activeFilter() === 'all') {
      return (
        r.users.length === 0 &&
        r.posts.length === 0 &&
        r.events.length === 0 &&
        r.marketplace.length === 0
      );
    }
    if (this.activeFilter() === 'users') return r.users.length === 0;
    if (this.activeFilter() === 'posts') return r.posts.length === 0;
    if (this.activeFilter() === 'events') return r.events.length === 0;
    if (this.activeFilter() === 'marketplace') return r.marketplace.length === 0;
    return false;
  }
}
