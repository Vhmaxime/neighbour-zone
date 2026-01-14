import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If NOT authenticated, allow access to login page
  if (!authService.isAuthenticated()) {
    return true;
  }

  if (router.navigated) {
    return false; // (Cancels navigation)
  }

  // If authenticated, redirect to explore and block login page
  await router.navigate(['/explore']);
  return false;
};
