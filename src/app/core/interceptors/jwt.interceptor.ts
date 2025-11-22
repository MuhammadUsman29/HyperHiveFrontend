import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  // Get token from TokenService
  const token = tokenService.getAccessToken();

  // Clone the request and add the authorization header if token exists
  // Skip adding token for login/register endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') || 
                         req.url.includes('/auth/register') ||
                         req.url.includes('/auth/signup') ||
                         req.url.includes('/Auth/signup') ||
                         req.url.includes('/Auth/login') ||
                         req.url.includes('/auth/refresh');

  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // BYPASSED: JWT interceptor redirects disabled for now
      // Handle 401 Unauthorized - token expired or invalid
      if (error.status === 401) {
        // Clear stored tokens
        tokenService.clearTokens();
        console.warn('⚠️ 401 Unauthorized - Token cleared, but redirect bypassed');
        // Redirects disabled - just log the error
        // router.navigate(['/login']); // DISABLED
      }

      // Handle 403 Forbidden
      if (error.status === 403) {
        console.error('Access forbidden:', error);
        // You can add custom handling here, e.g., show a message
      }

      return throwError(() => error);
    })
  );
};

