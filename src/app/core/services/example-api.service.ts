import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

/**
 * Example service demonstrating how to use the ApiService
 * Replace this with your actual API endpoints
 */
@Injectable({
  providedIn: 'root'
})
export class ExampleApiService {
  constructor(private apiService: ApiService) {}

  // Example: User endpoints
  getUsers(): Observable<any[]> {
    return this.apiService.get<any[]>('users');
  }

  getUserById(id: string): Observable<any> {
    return this.apiService.get<any>(`users/${id}`);
  }

  createUser(userData: any): Observable<any> {
    return this.apiService.post<any>('users', userData);
  }

  updateUser(id: string, userData: any): Observable<any> {
    return this.apiService.put<any>(`users/${id}`, userData);
  }

  deleteUser(id: string): Observable<any> {
    return this.apiService.delete<any>(`users/${id}`);
  }

  // Example: Auth endpoints
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.apiService.post<any>('auth/login', credentials);
  }

  register(userData: any): Observable<any> {
    return this.apiService.post<any>('auth/register', userData);
  }

  refreshToken(refreshToken: string): Observable<any> {
    return this.apiService.post<any>('auth/refresh', { refreshToken });
  }

  logout(): Observable<any> {
    return this.apiService.post<any>('auth/logout', {});
  }

  // Example: Get with query parameters
  searchUsers(query: string, page: number = 1, limit: number = 10): Observable<any> {
    return this.apiService.get<any>('users/search', { q: query, page, limit });
  }

  // Example: File upload
  uploadAvatar(userId: string, file: File): Observable<any> {
    return this.apiService.uploadFile<any>(`users/${userId}/avatar`, file);
  }

  // Example: File download
  downloadReport(reportId: string): Observable<Blob> {
    return this.apiService.downloadFile(`reports/${reportId}/download`);
  }
}

