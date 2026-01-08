import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
import { ProfilePage } from './pages/profile-page/profile-page';


export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  
  {
    path: 'dashboard',
    component: Dashboard,
    
  },
  { path: 'profile', component: ProfilePage },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '**',
    redirectTo: '/login'
  },
  
  
  
];

