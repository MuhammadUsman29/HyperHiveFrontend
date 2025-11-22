import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  success?: boolean;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'https://localhost:7250/api'; // Update with your API base URL

  constructor(private http: HttpClient) {}

  /**
   * Set the base URL for API calls
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Get the current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Generic GET request
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    const url = `${this.baseUrl}/${endpoint}`;
    console.log('API GET Request:', { url, params: httpParams.toString() });
    
    return this.http.get<ApiResponse<T> | T>(url, { params: httpParams })
      .pipe(
        map(response => {
          console.log('API GET Response:', response);
          // Handle both wrapped (ApiResponse) and direct response formats
          if (response && typeof response === 'object' && 'data' in response) {
            return (response as ApiResponse<T>).data || response as any;
          }
          return response as T;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, body: any, options?: { headers?: HttpHeaders }): Observable<T> {
    const url = `${this.baseUrl}/${endpoint}`;
    console.log('API Request:', {
      method: 'POST',
      url: url,
      body: body
    });
    
    return this.http.post<ApiResponse<T>>(url, body, options)
      .pipe(
        map(response => {
          console.log('API Response:', response);
          return response.data || response as any;
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, body: any, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(
        map(response => response.data || response as any),
        catchError(this.handleError)
      );
  }

  /**
   * Generic PATCH request
   */
  patch<T>(endpoint: string, body: any, options?: { headers?: HttpHeaders }): Observable<T> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, body, options)
      .pipe(
        map(response => response.data || response as any),
        catchError(this.handleError)
      );
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string, params?: any): Observable<T> {
    const httpParams = this.buildHttpParams(params);
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, { params: httpParams })
      .pipe(
        map(response => response.data || response as any),
        catchError(this.handleError)
      );
  }

  /**
   * Upload file(s)
   */
  uploadFile<T>(endpoint: string, file: File | File[], additionalData?: any): Observable<T> {
    const formData = new FormData();
    
    if (file instanceof File) {
      formData.append('file', file);
    } else {
      file.forEach((f, index) => {
        formData.append(`files[${index}]`, f);
      });
    }

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${endpoint}`, formData)
      .pipe(
        map(response => response.data || response as any),
        catchError(this.handleError)
      );
  }

  /**
   * Download file
   */
  downloadFile(endpoint: string, params?: any, filename?: string): Observable<Blob> {
    const httpParams = this.buildHttpParams(params);
    return this.http.get(`${this.baseUrl}/${endpoint}`, {
      params: httpParams,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Build HttpParams from object
   */
  private buildHttpParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          if (Array.isArray(params[key])) {
            params[key].forEach((value: any) => {
              httpParams = httpParams.append(key, value.toString());
            });
          } else {
            httpParams = httpParams.set(key, params[key].toString());
          }
        }
      });
    }
    return httpParams;
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse): Observable<never> => {
    let errorMessage = 'An unknown error occurred';
    
    // Handle status 0 (CORS, network, or server not reachable)
    if (error.status === 0) {
      console.error('Connection Error Details:', {
        url: error.url,
        status: error.status,
        statusText: error.statusText,
        message: error.message,
        baseUrl: this.baseUrl
      });
      
      errorMessage = `Unable to connect to the server at ${this.baseUrl}. 
      
Please check:
1. Is the API server running on http://localhost:5179?
2. Is CORS configured on the backend to allow requests from http://localhost:4200?
3. Check the browser console Network tab for more details.`;
    } else if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error) {
        // Try to extract error message from response
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.error.message) {
          errorMessage = error.error.message;
        } else if (error.error.error) {
          errorMessage = error.error.error;
        } else {
          errorMessage = `Error Code: ${error.status} - ${error.message}`;
        }
      } else {
        errorMessage = `Error Code: ${error.status} - ${error.message}`;
      }
    }
    
    console.error('API Error:', errorMessage, error);
    // Preserve the original error with status code
    const customError: any = new Error(errorMessage);
    customError.status = error.status;
    customError.statusText = error.statusText;
    customError.url = error.url;
    customError.error = error.error;
    return throwError(() => customError);
  };
}

