import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { SearchResponse } from '../types/api.types';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  private envService: EnvironmentService = inject(EnvironmentService);
  private http = inject(HttpClient);

  private readonly apiUrl = this.envService.getAPI_URL();

  public search(query: string) {
    return this.http.get<SearchResponse>(`${this.apiUrl}/search`, { params: { q: query } });
  }
}
