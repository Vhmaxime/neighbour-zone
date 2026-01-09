import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Checks if token exists AND is valid/not expired
  if (auth.isAuthenticated()) {
    return true;
  }
  // Redirect to login if token is missing or expired
  return router.navigate(['/login']);
};
