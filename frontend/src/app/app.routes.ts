import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProfilePage } from './pages/profile-page/profile-page';
import { Settings } from './pages/settings/settings';
import { Friends } from './pages/friends/friends';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: 'home', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  
  {
    path: 'dashboard',
    component: Dashboard,
  },
  { path: 'profile', component: ProfilePage },
  { path: 'settings', component: Settings },
  { path: 'friends', component: Friends },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '**',
    redirectTo: '/login'
  },
];

