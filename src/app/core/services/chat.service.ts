import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface ChatMessage {
  message: string;
  timestamp?: Date;
  isUser: boolean;
}

export interface ChatRequest {
  message: string;
}

export interface ChatResponse {
  response: string;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  constructor(private apiService: ApiService) {}

  /**
   * Send a chat message
   * Calls: POST api/Chat
   */
  sendMessage(message: string): Observable<ChatResponse> {
    const request: ChatRequest = { message };
    return this.apiService.post<ChatResponse>('Chat', request);
  }
}

