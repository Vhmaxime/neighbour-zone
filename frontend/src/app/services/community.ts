import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import {
  CommunitiesResponse,
  CommunityResponse,
  CreateCommunityRequest,
  PostsResponse,
  EventsResponse,
  MarketplaceItemsResponse,
} from '../types/api.types';
import { EnvironmentService } from './environment.service';

@Injectable({
  providedIn: 'root',
})
export class CommunityService {
  private envService = inject(EnvironmentService);
  private http = inject(HttpClient);
  private readonly apiUrl = this.envService.getAPI_URL();

  public getCommunities() {
    return this.http.get<CommunitiesResponse>(`${this.apiUrl}/community`);
  }

  public getCommunity(communityId: string) {
    return this.http.get<CommunityResponse>(`${this.apiUrl}/community/${communityId}`);
  }

  public createCommunity(data: CreateCommunityRequest) {
    return this.http.post<CommunityResponse>(`${this.apiUrl}/community`, data);
  }

  public updateCommunity(communityId: string, data: Partial<CreateCommunityRequest>) {
    return this.http.patch<CommunityResponse>(`${this.apiUrl}/community/${communityId}`, data);
  }

  public deleteCommunity(communityId: string) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/community/${communityId}`);
  }

  public joinCommunity(communityId: string) {
    return this.http.post<{ message: string; isMember: boolean }>(
      `${this.apiUrl}/community/${communityId}/join`,
      {},
    );
  }

  public leaveCommunity(communityId: string) {
    return this.http.delete<{ message: string; isMember: boolean }>(
      `${this.apiUrl}/community/${communityId}/leave`,
    );
  }

  public getCommunityPosts(communityId: string) {
    return this.http.get<PostsResponse>(`${this.apiUrl}/community/${communityId}/posts`);
  }

  public getCommunityEvents(communityId: string) {
    return this.http.get<EventsResponse>(`${this.apiUrl}/community/${communityId}/events`);
  }

  public getCommunityMarketplace(communityId: string) {
    return this.http.get<MarketplaceItemsResponse>(
      `${this.apiUrl}/community/${communityId}/marketplace`,
    );
  }
}
