import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ResetPassword } from './pages/reset-password/reset-password';
// import { Dashboard } from './pages/dashboard/dashboard'; // We don't use a dashboard for now
import { ProfilePage } from './pages/profile-page/profile-page';
import { Settings } from './pages/settings/settings';
import { Friends } from './pages/friends/friends';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { User } from './pages/user/user';
import { NotFound } from './pages/not-found/not-found';
import { Explore } from './pages/explore/explore';

export const routes: Routes = [
  { path: 'not-found', title: '404 - Page Not Found | Neighbour Zone', component: NotFound },

  // =========================================================
  // GUEST ROUTES (Accessible only when logged out)
  // =========================================================
  { path: 'login', component: Login, title: 'Login | Neighbour Zone', canActivate: [guestGuard] },
  { path: 'register', component: Register, title: 'Register | Neighbour Zone', canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPassword, title: 'Reset Password | Neighbour Zone', canActivate: [guestGuard] },

  // =========================================================
  // AUTHENTICATED ROUTES (Accessible only when logged in)
  // =========================================================
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'explore', pathMatch: 'full' }, // Redirects root URL to /explore
      { path: 'explore', title: 'Explore | Neighbour Zone', component: Explore },
      // { path: 'dashboard', component: Dashboard }, // We don't use a dashboard for now
      { path: 'profile', title: 'Profile | Neighbour Zone', component: ProfilePage },
      { path: 'settings', title: 'Settings | Neighbour Zone', component: Settings },
      { path: 'friends', title: 'Friends | Neighbour Zone', component: Friends },
      { path: 'user/:id', component: User },
      { path: 'events/:id', loadComponent: () => import('./pages/event-details/event-details').then(m => m.EventDetails) },
      { path: 'marketplace/:id', loadComponent: () => import('./pages/marketplace-details/marketplace-details').then(m => m.MarketplaceDetails) }
    ],
  },

  // Fallback for unknown routes (404)
  { path: '**', redirectTo: 'not-found' },
];
