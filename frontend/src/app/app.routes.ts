import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Dashboard } from './pages/dashboard/dashboard';
// import { authGuard } from './guards/auth-guard'; // commented this out so we don't need to worry about tokens for the moment
// import { ResetPassword } from './pages/reset-password/reset-password'; // commented this out because we won't use a reset-password page for now

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  // { path: 'reset-password', component: ResetPassword }, // commented this out because we won't use a reset-password page for now
  {
    path: 'dashboard',
    component: Dashboard,
    // canActivate: [authGuard] // commented this out so I don't need to worry about tokens for the moment
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  {
    path: '**',
    redirectTo: 'login' // Catch all invalid URLs and sends user to login
  }
];

