// Enums
export type UserRole = 'user' | 'admin';
export type PostType = 'news' | 'tip';
export type MarketplaceCategory = 'wanted' | 'offered';
export type FriendshipStatus = 'pending' | 'accepted';

// Models
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  role: UserRole;
  bio: string | null;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserPublic {
  id: string;
  username: string;
  bio: string | null;
}

export interface CurrentUser {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  role: UserRole;
  bio: string | null;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
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
  placeDisplayName: string;
  placeId: number;
  lat: string;
  lon: string;
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

// Request
export interface RegisterRequest {
  username: string;
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  type: PostType;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  placeDisplayName: string;
  placeId: number;
  lat: string;
  lon: string;
  dateTime: Date | string;
  endAt?: Date | string;
}

export interface CreateMarketplaceItemRequest {
  title: string;
  description: string;
  price?: number;
  location: string;
  category: MarketplaceCategory;
}

export interface CreateMarketplaceApplicationRequest {
  message?: string;
}

export interface CreateUserRequest {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phoneNumber: string;
  bio?: string;
}

// Response
export interface AuthResponse {
  accessToken: string;
}

export interface UserResponse {
  user: UserPublic;
}

export interface CurrentUserResponse {
  user: CurrentUser;
}

export interface UserMeResponse {
  user: User;
}

export interface PostResponse {
  post: Post;
}

export interface PostsResponse {
  posts: Post[];
  count: number;
}

export interface EventResponse {
  event: Event;
}

export interface EventsResponse {
  events: Event[];
  count: number;
}

export interface MarketplaceItemResponse {
  marketplace: MarketplaceItem;
}

export interface MarketplaceItemsResponse {
  marketplace: MarketplaceItem[];
  count: number;
}

export interface FriendsResponse {
  friends: UserPublic[];
  requests: UserPublic[];
  sent: UserPublic[];
}

export interface FriendshipResponse {
  friendship: {
    id: string;
    createdAt: Date;
    userId1: string;
    userId2: string;
    status: 'pending' | 'accepted';
  };
}

export interface ErrorResponse {
  message: string;
}

export interface UserSearchResult {
  id: string;
  username: string;
}

export interface PostSearchResult {
  id: string;
  title: string;
}

export interface EventSearchResult {
  id: string;
  title: string;
  dateTime: string;
}

export interface MarketplaceItemSearchResult {
  id: string;
  title: string;
  description: string;
}

export interface SearchResponse {
  users: UserPublic[];
  posts: Post[];
  events: Event[];
  marketplace: MarketplaceItem[];
}
