import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Usage in routes: canActivate: [roleGuard(['Admin', 'Project Manager'])]
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.hasRole(...allowedRoles)) return true;

    router.navigate(['/dashboard']);
    return false;
  };
};
