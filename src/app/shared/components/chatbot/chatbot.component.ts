import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService, ChatMessage } from '../../../core/services/chat.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrl: './chatbot.component.css'
})
export class ChatbotComponent {
  @Output() close = new EventEmitter<void>();
  
  messages: ChatMessage[] = [];
  userMessage = '';
  isLoading = false;
  isMinimized = false;

  constructor(private chatService: ChatService) {
    // Add welcome message
    this.messages.push({
      message: 'Hello! I\'m your AI learning assistant. How can I help you today?',
      timestamp: new Date(),
      isUser: false
    });
  }

  sendMessage() {
    if (!this.userMessage.trim() || this.isLoading) {
      return;
    }

    // Add user message to chat
    const userMsg: ChatMessage = {
      message: this.userMessage,
      timestamp: new Date(),
      isUser: true
    };
    this.messages.push(userMsg);

    // Store message and clear input
    const messageToSend = this.userMessage;
    this.userMessage = '';
    this.isLoading = true;

    // Call chat API
    this.chatService.sendMessage(messageToSend).subscribe({
      next: (response) => {
        // Add bot response to chat
        const botMsg: ChatMessage = {
          message: response.response,
          timestamp: new Date(),
          isUser: false
        };
        this.messages.push(botMsg);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Chat error:', error);
        // Add error message
        const errorMsg: ChatMessage = {
          message: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date(),
          isUser: false
        };
        this.messages.push(errorMsg);
        this.isLoading = false;
        this.scrollToBottom();
      }
    });

    this.scrollToBottom();
  }

  scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector('.chat-messages');
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }

  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }

  closeChat() {
    this.close.emit();
  }

  clearChat() {
    this.messages = [{
      message: 'Hello! I\'m your AI learning assistant. How can I help you today?',
      timestamp: new Date(),
      isUser: false
    }];
  }

  formatTime(date: Date | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
