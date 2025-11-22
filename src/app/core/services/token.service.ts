import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly STORAGE_TYPE: 'localStorage' | 'sessionStorage' = 'localStorage';

  /**
   * Set the storage type (localStorage or sessionStorage)
   */
  setStorageType(type: 'localStorage' | 'sessionStorage'): void {
    (this as any).STORAGE_TYPE = type;
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return this.getStorage().getItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    return this.getStorage().getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set access token
   */
  setAccessToken(token: string): void {
    this.getStorage().setItem(this.ACCESS_TOKEN_KEY, token);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(token: string): void {
    this.getStorage().setItem(this.REFRESH_TOKEN_KEY, token);
  }

  /**
   * Set both tokens
   */
  setTokens(accessToken: string, refreshToken?: string): void {
    this.setAccessToken(accessToken);
    if (refreshToken) {
      this.setRefreshToken(refreshToken);
    }
  }

  /**
   * Remove access token
   */
  removeAccessToken(): void {
    this.getStorage().removeItem(this.ACCESS_TOKEN_KEY);
  }

  /**
   * Remove refresh token
   */
  removeRefreshToken(): void {
    this.getStorage().removeItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Remove all tokens
   */
  clearTokens(): void {
    this.removeAccessToken();
    this.removeRefreshToken();
  }

  /**
   * Check if user is authenticated (has access token)
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get token payload (decoded JWT)
   */
  getTokenPayload(token?: string): any {
    try {
      const tokenToDecode = token || this.getAccessToken();
      if (!tokenToDecode) {
        return null;
      }

      const base64Url = tokenToDecode.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token?: string): boolean {
    const payload = this.getTokenPayload(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const expirationDate = new Date(payload.exp * 1000);
    return expirationDate < new Date();
  }

  /**
   * Get user info from token
   */
  getUserInfo(): { name?: string; email?: string; id?: string | number; [key: string]: any } | null {
    const payload = this.getTokenPayload();
    if (!payload) {
      return null;
    }

    // Common JWT claim names for user info
    return {
      name: payload.name || payload.fullName || payload.username || payload.sub,
      email: payload.email || payload.emailAddress,
      id: payload.id || payload.userId || payload.sub || payload.nameid,
      ...payload
    };
  }

  /**
   * Get user ID from token
   */
  getUserId(): string | number | null {
    const userInfo = this.getUserInfo();
    return userInfo?.id || null;
  }

  /**
   * Get storage instance
   */
  private getStorage(): Storage {
    return this.STORAGE_TYPE === 'localStorage' ? localStorage : sessionStorage;
  }
}

