import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { TokenService } from './token.service';

export interface SignupRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
  [key: string]: any;
}

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
  user?: {
    name?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    [key: string]: any;
  };
  message?: string;
  success?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  /**
   * Sign up a new user
   */
  signup(signupData: SignupRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('Auth/signup', signupData).pipe(
      tap((response) => {
        // Handle token storage if provided in response
        if (response.accessToken || response.token) {
          const accessToken = response.accessToken || response.token;
          const refreshToken = response.refreshToken;
          
          if (accessToken) {
            this.tokenService.setTokens(accessToken, refreshToken);
          }
        }
      })
    );
  }

  /**
   * Login user
   */
  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('Auth/login', credentials).pipe(
      tap((response) => {
        if (response.accessToken || response.token) {
          const accessToken = response.accessToken || response.token;
          const refreshToken = response.refreshToken;
          
          if (accessToken) {
            this.tokenService.setTokens(accessToken, refreshToken);
            
            // Store user info if provided in response
            if (response.user) {
              this.setUserInfo(response.user);
            }
          }
        }
      })
    );
  }

  /**
   * Store user info in localStorage
   */
  private setUserInfo(user: any): void {
    const storage = localStorage;
    if (user.name) storage.setItem('user_name', user.name);
    if (user.email) storage.setItem('user_email', user.email);
    if (user.firstName) storage.setItem('user_firstName', user.firstName);
    if (user.lastName) storage.setItem('user_lastName', user.lastName);
  }

  /**
   * Get stored user info
   */
  getUserInfo(): { name?: string; email?: string; firstName?: string; lastName?: string } {
    const storage = localStorage;
    const tokenUserInfo = this.tokenService.getUserInfo();
    
    const firstName = tokenUserInfo?.['firstName'];
    const lastName = tokenUserInfo?.['lastName'];
    
    return {
      name: storage.getItem('user_name') || tokenUserInfo?.name || 
            (firstName && lastName 
              ? `${firstName} ${lastName}` 
              : firstName || lastName || undefined),
      email: storage.getItem('user_email') || tokenUserInfo?.email,
      firstName: storage.getItem('user_firstName') || firstName,
      lastName: storage.getItem('user_lastName') || lastName
    };
  }

  /**
   * Logout user
   */
  logout(): void {
    this.tokenService.clearTokens();
    this.router.navigate(['/']);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.tokenService.isAuthenticated();
  }
}

