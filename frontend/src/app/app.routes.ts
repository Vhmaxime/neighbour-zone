import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { ResetPassword } from './pages/reset-password/reset-password';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProfilePage } from './pages/profile-page/profile-page';
import { Settings } from './pages/settings/settings';
import { Friends } from './pages/friends/friends';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { Home } from './pages/home/home';
import { User } from './pages/user/user';
import { NotFound } from './pages/not-found/not-found';

export const routes: Routes = [
  { path: 'not-found', component: NotFound },

  // =========================================================
  // GUEST ROUTES (Accessible only when logged out)
  // =========================================================
  { path: 'login', component: Login, canActivate: [guestGuard] },
  { path: 'register', component: Register, canActivate: [guestGuard] },
  { path: 'reset-password', component: ResetPassword, canActivate: [guestGuard] },

  // =========================================================
  // AUTHENTICATED ROUTES (Accessible only when logged in)
  // =========================================================
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' }, // Redirects root URL to /home
      { path: 'home', component: Home },
      { path: 'dashboard', component: Dashboard },
      { path: 'profile', component: ProfilePage },
      { path: 'settings', component: Settings },
      { path: 'friends', component: Friends },
      { path: 'user/:id', component: User },
    ],
  },

  // Fallback for unknown routes (404)
  { path: '**', redirectTo: '' },
];
