import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { NominatimLocation } from '../types/nominatom-types';

@Injectable({
  providedIn: 'root',
})
export class NominatimService {
  private readonly nominatimUrl = 'https://nominatim.openstreetmap.org/search';
  private http = inject(HttpClient);

  public searchLocation(query: string) {
    return this.http.get<NominatimLocation[]>(this.nominatimUrl, {
      params: {
        q: query,
        format: 'json',
        limit: '5',
      },
    });
  }
}
