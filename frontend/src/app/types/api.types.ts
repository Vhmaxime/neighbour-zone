// Enums
export type UserRole = 'user' | 'admin';
export type PostType = 'news' | 'tip';
export type MarketplaceCategory = 'wanted' | 'offered';
export type FriendshipStatus = 'pending' | 'accepted';

// Models
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  name: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  type: PostType;
  createdAt: string;
  author: UserPublic;
  likes: number;
  liked: boolean;
  likedBy?: UserPublic[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  dateTime: string;
  endAt: string | null;
  createdAt: string;
  organizer: UserPublic;
  likes: number;
  liked: boolean;
  likedBy?: UserPublic[];
}

export interface MarketplaceItem {
  id: string;
  title: string;
  description: string;
  price: number | null;
  location: string;
  category: MarketplaceCategory;
  createdAt: string;
  provider: UserPublic;
  applied: boolean;
  applications?: MarketplaceApplication[];
}

export interface MarketplaceApplication {
  id: string;
  message: string | null;
  createdAt: string;
  applicant: UserPublic;
}

export interface Friendship {
  id: string;
  userId1: string;
  userId2: string;
  status: FriendshipStatus;
  createdAt: string;
}

// Request
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  type: PostType;
}

export interface UpdatePostRequest {
  title?: string;
  content?: string;
  type?: PostType;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  dateTime: Date | string;
  endAt?: Date | string;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  location?: string;
  dateTime?: Date | string;
  endAt?: Date | string;
}

export interface CreateMarketplaceItemRequest {
  title: string;
  description: string;
  price?: number;
  location: string;
  category: MarketplaceCategory;
}

export interface UpdateMarketplaceItemRequest {
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  category?: MarketplaceCategory;
}

export interface CreateMarketplaceApplicationRequest {
  message?: string;
}

// Response
export interface AuthResponse {
  accessToken: string;
}

export interface UserResponse {
  user: User;
}

export interface PostResponse {
  post: Post;
}

export interface PostsResponse {
  posts: Post[];
}

export interface EventResponse {
  event: Event;
}

export interface EventsResponse {
  events: Event[];
}

export interface MarketplaceItemResponse {
  marketplace: MarketplaceItem;
}

export interface MarketplaceItemsResponse {
  marketplace: MarketplaceItem[];
}

export interface ErrorResponse {
  message: string;
}
