import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  CreateMarketplaceApplicationRequest,
  CreateMarketplaceItemRequest,
  MarketplaceItem,
  MarketplaceItemResponse,
  MarketplaceItemsResponse,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  // Localhost for development
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';

  private http = inject(HttpClient);

  public getMarketplaceItems(): Observable<MarketplaceItem[]> {
    return this.http
      .get<MarketplaceItemsResponse>(`${this.apiUrl}/marketplace`)
      .pipe(map((response) => response.marketplace || []));
  }

  public getMarketplaceItemsByUser(userId: string) {
    return this.http.get<MarketplaceItemsResponse>(`${this.apiUrl}/marketplace`, {
      params: { itemBy: userId },
    });
  }

  public getMarketplaceItemById(itemId: string) {
    return this.http.get<MarketplaceItem>(`${this.apiUrl}/marketplace/${itemId}`);
  }

  public createMarketplaceItem(data: CreateMarketplaceItemRequest) {
    return this.http.post<MarketplaceItemResponse>(`${this.apiUrl}/marketplace`, data);
  }

  public updateMarketplaceItem(itemId: string, data: Partial<CreateMarketplaceItemRequest>) {
    return this.http.patch<MarketplaceItemResponse>(`${this.apiUrl}/marketplace/${itemId}`, data);
  }

  public deleteMarketplaceItem(itemId: string) {
    return this.http.delete<void>(`${this.apiUrl}/marketplace/${itemId}`);
  }

  public applyForItem(itemId: string, data: CreateMarketplaceApplicationRequest) {
    return this.http.post<void>(`${this.apiUrl}/marketplace/${itemId}/apply`, data);
  }
}
