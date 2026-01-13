import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const guestGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // If NOT authenticated, allow access to login page
  if (!auth.isAuthenticated()) {
    return true;
  }

  if (router.navigated) {
    return false; // (Cancels navigation)
  }

  // If authenticated, redirect to explore and block login page
  await router.navigate(['/explore']);
  return false;
};