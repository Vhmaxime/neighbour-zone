import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProfilePage } from './pages/profile-page/profile-page';
import { Settings } from './pages/settings/settings';
import { Friends } from './pages/friends/friends';
import { authGuard } from './guards/auth-guard';
import { guestGuard } from './guards/guest-guard';
import { Home } from './pages/home/home';

export const routes: Routes = [
  // =========================================================
  // GUEST ROUTES (Accessible only when logged out)
  // =========================================================
      { path: 'login', component: Login, canActivate: [guestGuard] },
      { path: 'register', component: Register, canActivate: [guestGuard] },
  
  // =========================================================
  // AUTHENTICATED ROUTES (Accessible only when logged in)
  // =========================================================
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', component: Home }, // The actual homepage (/)
      { path: 'dashboard', component: Dashboard },
      { path: 'profile', component: ProfilePage },
      { path: 'settings', component: Settings },
      { path: 'friends', component: Friends },
    ],
  },
  
  // Fallback for unknown routes (404)
  { path: '**', redirectTo: '' }
];
