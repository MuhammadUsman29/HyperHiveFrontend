import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LearnersService } from '../../core/services/learners.service';
import { AuthService } from '../../core/services/auth.service';
import { TokenService } from '../../core/services/token.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

export interface SkillsetEvaluationData {
  name: string;
  email: string;
  position: string;
  department: string;
  joinedDate: string;
  bio: string;
  aiProfile: {
    skills: string[];
    interests: string[];
    goals: string[];
    currentLevel: string;
    learningStyle: string;
    availableHoursPerWeek: number;
    preferredLearningTime: string;
    yearsOfExperience: string;
    preferredTopics: string[];
    weakAreas: string[];
  };
}

@Component({
  selector: 'app-skillset-evaluation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './skillset-evaluation.component.html',
  styleUrl: './skillset-evaluation.component.css'
})
export class SkillsetEvaluationComponent implements OnInit, OnDestroy {
  evaluationForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  private navigationTimeout: any = null;

  currentLevels = ['beginner', 'intermediate', 'advanced'];
  learningStyles = ['hands-on', 'theoretical', 'visual', 'reading', 'mixed'];
  learningTimes = ['morning', 'afternoon', 'evening', 'flexible'];

  constructor(
    private fb: FormBuilder,
    private learnersService: LearnersService,
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {
    this.evaluationForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      position: ['', [Validators.required]],
      department: ['', [Validators.required]],
      joinedDate: ['', [Validators.required]],
      bio: ['', [Validators.required]],
      aiProfile: this.fb.group({
        skills: this.fb.array([this.createSkillControl()]),
        interests: this.fb.array([this.createInterestControl()]),
        goals: this.fb.array([this.createGoalControl()]),
        currentLevel: ['intermediate', [Validators.required]],
        learningStyle: ['hands-on', [Validators.required]],
        availableHoursPerWeek: [10, [Validators.required, Validators.min(1), Validators.max(40)]],
        preferredLearningTime: ['evening', [Validators.required]],
        yearsOfExperience: ['', [Validators.required]],
        preferredTopics: this.fb.array([this.createTopicControl()]),
        weakAreas: this.fb.array([this.createWeakAreaControl()])
      })
    });
  }

  ngOnInit() {
    // Pre-fill name and email from token or stored user info
    const userInfo = this.authService.getUserInfo();
    if (userInfo.name) {
      this.evaluationForm.patchValue({
        name: userInfo.name
      });
    }
    if (userInfo.email) {
      this.evaluationForm.patchValue({
        email: userInfo.email
      });
    }
  }

  ngOnDestroy() {
    // Clean up navigation timeout if component is destroyed
    if (this.navigationTimeout) {
      clearTimeout(this.navigationTimeout);
    }
  }

  // Form Array Helpers
  get skillsArray() {
    return this.evaluationForm.get('aiProfile.skills') as FormArray;
  }

  get interestsArray() {
    return this.evaluationForm.get('aiProfile.interests') as FormArray;
  }

  get goalsArray() {
    return this.evaluationForm.get('aiProfile.goals') as FormArray;
  }

  get preferredTopicsArray() {
    return this.evaluationForm.get('aiProfile.preferredTopics') as FormArray;
  }

  get weakAreasArray() {
    return this.evaluationForm.get('aiProfile.weakAreas') as FormArray;
  }

  // Create form controls
  createSkillControl() {
    return this.fb.control('', [Validators.required]);
  }

  createInterestControl() {
    return this.fb.control('', [Validators.required]);
  }

  createGoalControl() {
    return this.fb.control('', [Validators.required]);
  }

  createTopicControl() {
    return this.fb.control('', [Validators.required]);
  }

  createWeakAreaControl() {
    return this.fb.control('', [Validators.required]);
  }

  // Add/Remove array items
  addSkill() {
    this.skillsArray.push(this.createSkillControl());
  }

  removeSkill(index: number) {
    if (this.skillsArray.length > 1) {
      this.skillsArray.removeAt(index);
    }
  }

  addInterest() {
    this.interestsArray.push(this.createInterestControl());
  }

  removeInterest(index: number) {
    if (this.interestsArray.length > 1) {
      this.interestsArray.removeAt(index);
    }
  }

  addGoal() {
    this.goalsArray.push(this.createGoalControl());
  }

  removeGoal(index: number) {
    if (this.goalsArray.length > 1) {
      this.goalsArray.removeAt(index);
    }
  }

  addTopic() {
    this.preferredTopicsArray.push(this.createTopicControl());
  }

  removeTopic(index: number) {
    if (this.preferredTopicsArray.length > 1) {
      this.preferredTopicsArray.removeAt(index);
    }
  }

  addWeakArea() {
    this.weakAreasArray.push(this.createWeakAreaControl());
  }

  removeWeakArea(index: number) {
    if (this.weakAreasArray.length > 1) {
      this.weakAreasArray.removeAt(index);
    }
  }

  // Get form controls for template
  get f() {
    return this.evaluationForm.controls;
  }

  get aiProfile() {
    return (this.evaluationForm.get('aiProfile') as FormGroup).controls;
  }

  onSubmit() {
    if (this.evaluationForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const formValue = this.evaluationForm.value;
    
    // Format joinedDate to ISO string
    let joinedDateISO = formValue.joinedDate;
    if (joinedDateISO && !joinedDateISO.includes('T')) {
      // If it's just a date (YYYY-MM-DD), convert to ISO string
      joinedDateISO = new Date(joinedDateISO + 'T00:00:00').toISOString();
    }
    
    // Prepare data for API
    const evaluationData: SkillsetEvaluationData = {
      name: formValue.name,
      email: formValue.email,
      position: formValue.position,
      department: formValue.department,
      joinedDate: joinedDateISO,
      bio: formValue.bio,
      aiProfile: {
        skills: formValue.aiProfile.skills.filter((s: string) => s.trim() !== ''),
        interests: formValue.aiProfile.interests.filter((i: string) => i.trim() !== ''),
        goals: formValue.aiProfile.goals.filter((g: string) => g.trim() !== ''),
        currentLevel: formValue.aiProfile.currentLevel,
        learningStyle: formValue.aiProfile.learningStyle,
        availableHoursPerWeek: Number(formValue.aiProfile.availableHoursPerWeek),
        preferredLearningTime: formValue.aiProfile.preferredLearningTime,
        yearsOfExperience: formValue.aiProfile.yearsOfExperience,
        preferredTopics: formValue.aiProfile.preferredTopics.filter((t: string) => t.trim() !== ''),
        weakAreas: formValue.aiProfile.weakAreas.filter((w: string) => w.trim() !== '')
      }
    };

    // Post to Learners API endpoint - api/Learners
    console.log('Submitting skillset evaluation to api/Learners:', evaluationData);
    this.learnersService.createLearner(evaluationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Skillset evaluation submitted successfully!';
        
        setTimeout(() => {
          this.router.navigate(['/skillset-statistics']);
        }, 2000);
      },
      error: (error) => {
        console.error('❌ Evaluation error occurred:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          error: error.error
        });
        
        this.isLoading = false;
        this.errorMessage = error.message || 'An error occurred. Please try again.';
        
        // Clear any existing navigation timeout
        if (this.navigationTimeout) {
          clearTimeout(this.navigationTimeout);
        }
        
        // Always navigate to skillset-statistics screen on error
        console.log('⚠️ Error submitting skillset evaluation');
        console.log('🔄 Navigating to /skillset-statistics in 1 second...');
        
        // Navigate immediately (reduced delay for better UX)
        this.navigationTimeout = setTimeout(() => {
          console.log('🚀 Executing navigation to /skillset-statistics');
          try {
            this.router.navigate(['/skillset-statistics']).then(
              (success) => {
                if (success) {
                  console.log('✅ Successfully navigated to skillset-statistics page');
                } else {
                  console.error('❌ Navigation returned false, trying window.location');
                  // Fallback: use window.location if router navigation fails
                  window.location.href = `/skillset-statistics`;
                }
              },
              (navError) => {
                console.error('❌ Navigation promise rejected:', navError);
                // Fallback: use window.location if router navigation fails
                window.location.href = `/skillset-statistics`;
              }
            );
          } catch (navError) {
            console.error('❌ Navigation exception:', navError);
            // Fallback: use window.location if router navigation fails
            window.location.href = `/skillset-statistics`;
          }
        }, 1000); // Show error message for 1 second before navigating
        
        // Also try immediate navigation as backup (in case setTimeout fails)
        setTimeout(() => {
          const currentUrl = this.router.url;
          if (currentUrl.includes('skillset-evaluation')) {
            console.log('⚠️ Still on skillset-evaluation page, forcing navigation...');
            window.location.href = `/skillset-statistics`;
          }
        }, 3000); // Backup navigation after 3 seconds
      }
    });
  }

  private markFormGroupTouched() {
    Object.keys(this.evaluationForm.controls).forEach(key => {
      const control = this.evaluationForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });
  }
}

