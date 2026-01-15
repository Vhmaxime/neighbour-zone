import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CreateMarketplaceApplicationRequest,
  CreateMarketplaceItemRequest,
  MarketplaceItemResponse,
  MarketplaceItemsResponse,
} from '../types/api.types';

@Injectable({
  providedIn: 'root',
})
export class MarketplaceService {
  private readonly apiUrl = 'https://neighbour-zone.vercel.app/api';
  private http = inject(HttpClient);

  public getMarketplaceItems() {
    return this.http.get<MarketplaceItemsResponse>(`${this.apiUrl}/marketplace`);
  }

  public getUserMarketplaceItems(userId: string) {
    return this.http.get<MarketplaceItemsResponse>(`${this.apiUrl}/marketplace/user/${userId}`);
  }

  public getMarketplaceItem(itemId: string) {
    return this.http.get<MarketplaceItemResponse>(`${this.apiUrl}/marketplace/${itemId}`);
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
