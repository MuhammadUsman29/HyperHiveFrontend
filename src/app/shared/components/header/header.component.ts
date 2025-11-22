import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { ChatbotComponent } from '../chatbot/chatbot.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ChatbotComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMenuOpen: boolean = false;
  isAuthenticated: boolean = false;
  userName: string = '';
  isChatbotOpen: boolean = false;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.checkAuthentication();
    
    // Listen to route changes to update auth status
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthentication();
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  checkAuthentication() {
    this.isAuthenticated = this.authService.isAuthenticated();
    if (this.isAuthenticated) {
      const userInfo = this.authService.getUserInfo();
      this.userName = userInfo.name || userInfo.email || '';
    } else {
      this.userName = '';
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  navigateToLogin() {
    this.isMenuOpen = false;
    this.router.navigate(['/login']);
  }

  navigateToSignup() {
    this.isMenuOpen = false;
    this.router.navigate(['/signup']);
  }

  logout() {
    this.authService.logout();
    this.isMenuOpen = false;
    this.isAuthenticated = false;
    this.userName = '';
  }

  toggleChatbot() {
    this.isChatbotOpen = !this.isChatbotOpen;
  }

  closeChatbot() {
    this.isChatbotOpen = false;
  }
}

