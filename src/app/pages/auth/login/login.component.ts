import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LearnersService } from '../../../core/services/learners.service';
import { TokenService } from '../../../core/services/token.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private hasNavigated = false; // Prevent double navigation

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private learnersService: LearnersService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  /**
   * Get form control for easy access in template
   */
  get f() {
    return this.loginForm.controls;
  }

  /**
   * Handle form submission
   */
  onSubmit() {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.hasNavigated = false; // Reset navigation flag

    const loginData = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };
    this.authService.login(loginData).subscribe({
      next: (response) => {
        console.log('✅ Login successful, response:', response);
        this.successMessage = response.message || 'Login successful! Checking your profile...';
        
        // Verify token was stored
        const tokenAfterLogin = this.tokenService.getAccessToken();
        console.log('🔑 Token after login:', tokenAfterLogin ? 'Token exists' : 'Token missing');
        
        // Wait a moment for token to be stored
        setTimeout(() => {
          // Get user ID from token or response
          const tokenUserId = this.tokenService.getUserId();
          const responseUser = response.user as any;
          const responseUserId = responseUser && responseUser['id'];
          
          console.log('🔍 User ID sources:', {
            fromToken: tokenUserId,
            fromResponse: responseUserId,
            tokenPayload: this.tokenService.getTokenPayload()
          });
          
          const userId = tokenUserId || responseUserId || '2';
          console.log('📌 Using User ID:', userId);
          console.log('📡 About to call: GET api/Learners/' + userId);
          
          // Check if learner data exists - call api/Learners/{userId}
          this.learnersService.getLearnerById(userId).subscribe({
            next: (learnerData) => {
              console.log('✅ SUCCESS: Learner data received from api/Learners/' + userId + ':', learnerData);
              const learnerDataCheck = learnerData as any;
              console.log('📊 Data validation:', {
                hasData: !!learnerData,
                hasId: !!(learnerDataCheck && learnerDataCheck['id']),
                idValue: learnerDataCheck && learnerDataCheck['id'],
                keysCount: learnerData ? Object.keys(learnerData).length : 0,
                dataType: typeof learnerData,
                isArray: Array.isArray(learnerData)
              });
              
              this.isLoading = false;
              
              // Check if data exists - must have id or be a non-empty object
              const learnerDataAny = learnerData as any;
              const hasId = learnerDataAny && learnerDataAny['id'] !== undefined && learnerDataAny['id'] !== null;
              const hasContent = learnerData && typeof learnerData === 'object' && !Array.isArray(learnerData) && Object.keys(learnerData).length > 0;
              const hasValidData = hasId || hasContent;
              
              console.log('🔍 Validation result:', {
                hasId,
                hasContent,
                hasValidData
              });
              
              if (this.hasNavigated) {
                console.log('⚠️ Already navigated, skipping');
                return;
              }
              
              if (hasValidData) {
                console.log('✅✅✅ VALID DATA FOUND! Navigating to /skillset-statistics');
                this.hasNavigated = true;
                this.router.navigate(['/skillset-statistics']);
              } else {
                console.log('⚠️⚠️⚠️ NO VALID DATA! Navigating to /skillset-evaluation');
                this.hasNavigated = true;
                this.router.navigate(['/skillset-evaluation']);
              }
            },
            error: (error) => {
              console.error('❌ ERROR: Failed to fetch learner data from api/Learners/' + userId);
              console.error('❌ Full error object:', error);
              console.error('❌ Error status:', error.status);
              console.error('❌ Error message:', error.message);
              console.error('❌ Error details:', {
                status: error.status,
                statusText: error.statusText,
                message: error.message,
                error: error.error,
                url: error.url
              });
              
              this.isLoading = false;
              
              if (this.hasNavigated) {
                console.log('⚠️ Already navigated, skipping');
                return;
              }
              
              // STRICT: Only navigate to skillset evaluation on 404 (not found) or connection errors
              if (error.status === 404) {
                console.log('⚠️ 404 - Learner data not found, navigating to skillset evaluation');
                this.hasNavigated = true;
                this.router.navigate(['/skillset-evaluation']);
              } else if (error.status === 0 || !error.status) {
                // Connection error - might be CORS or server not running
                console.log('⚠️ Connection error (status 0) - CORS/server issue, navigating to skillset evaluation');
                this.hasNavigated = true;
                this.router.navigate(['/skillset-evaluation']);
              } else {
                // Other HTTP errors - DO NOT auto-navigate, show error instead
                console.error('❌ HTTP error ' + error.status + ' - NOT navigating, showing error message');
                this.errorMessage = `Error checking profile: ${error.message || 'Unknown error'}. Please try again.`;
                // Don't navigate on other errors - let user see the error
              }
            }
          });
        }, 200); // Increased delay to ensure token is stored
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message || 'Invalid email or password. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  /**
   * Mark all form fields as touched to show validation errors
   */
  private markFormGroupTouched() {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}

