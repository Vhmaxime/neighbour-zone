import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SearchResponse } from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  public search(query: string) {
    return this.http.get<SearchResponse>(`${this.apiUrl}/search`, { params: { q: query } });
  }
}
