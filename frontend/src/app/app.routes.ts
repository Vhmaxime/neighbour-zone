import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ProfilePage } from './pages/profile-page/profile-page';
import { Settings } from './pages/settings/settings';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { NotFound } from './pages/not-found/not-found';
import { Explore } from './pages/explore/explore';
import { Feed } from './pages/feed/feed';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { Privacy } from './pages/privacy/privacy';
import { Terms } from './pages/terms/terms';
import { Events } from './pages/events/events';
import { CreateEvent } from './pages/events/create-event/create-event';
import { Marketplace } from './pages/marketplace/marketplace';
import { CreateItem } from './pages/marketplace/create-item/create-item';
import { CreatePost } from './pages/posts/create-post/create-post';

export const routes: Routes = [
  { path: 'not-found', title: '404 - Page Not Found | Neighbour Zone', component: NotFound },

  // =========================================================
  // GUEST ROUTES (Accessible only when logged out)
  // =========================================================
  { path: 'login', component: Login, title: 'Login | Neighbour Zone', canActivate: [guestGuard] },
  {
    path: 'register',
    component: Register,
    title: 'Register | Neighbour Zone',
    canActivate: [guestGuard],
  },
  // =========================================================
  // PUBLIC ROUTES (Accessible to everyone)
  // =========================================================
  { path: 'about', title: 'About Us | Neighbour Zone', component: About },
  { path: 'contact', title: 'Contact | Neighbour Zone', component: Contact },
  { path: 'privacy', title: 'Privacy Policy | Neighbour Zone', component: Privacy },
  { path: 'terms', title: 'Terms & Conditions | Neighbour Zone', component: Terms },

  // =========================================================
  // AUTHENTICATED ROUTES (Accessible only when logged in)
  // =========================================================
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'explore', pathMatch: 'full' }, // Redirects root URL to /explore
      { path: 'explore', title: 'Explore | Neighbour Zone', component: Explore },
      { path: 'feed', title: 'Feed | Neighbour Zone', component: Feed },
      { path: 'settings', title: 'Settings | Neighbour Zone', component: Settings },
      { path: 'user/:id', loadComponent: () => import('./pages/user/user').then((m) => m.User) },
      {
        path: 'events',
        children: [
          {
            path: '',
            title: 'Events | Neighbour Zone',
            component: Events,
          },
          {
            path: 'create',
            title: 'Organize an Event | Neighbour Zone',
            component: CreateEvent,
          },
          {
            path: ':id',
            title: 'Event Details | Neighbour Zone',
            loadComponent: () =>
              import('./pages/event-details/event-details').then((m) => m.EventDetails),
          },
          {
            path: ':id/edit',
            title: 'Edit Event | Neighbour Zone',
            loadComponent: () =>
              import('./pages/events/edit-event/edit-event').then((m) => m.EditEvent),
          },
        ],
      },
      {
        path: 'marketplace',
        children: [
          {
            path: '',
            title: 'Marketplace | Neighbour Zone',
            component: Marketplace,
          },
          {
            path: 'create',
            title: 'List an Item | Neighbour Zone',
            component: CreateItem,
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./pages/marketplace-details/marketplace-details').then(
                (m) => m.MarketplaceDetails
              ),
          },
        ],
      },
      {
        path: 'post',
        children: [
          {
            path: 'create',
            title: 'Create Post | Neighbour Zone',
            component: CreatePost,
          },
          {
            path: ':id',
            title: 'Post Details | Neighbour Zone',
            loadComponent: () =>
              import('./pages/posts/post-details/post-details').then((m) => m.PostDetails),
          },
          {
            path: ':id/edit',
            title: 'Edit Post | Neighbour Zone',
            loadComponent: () =>
              import('./pages/posts/edit-post/edit-post').then((m) => m.EditPost),
          },
        ],
      },
      { path: '**', redirectTo: 'not-found' },
    ],
  },
];
