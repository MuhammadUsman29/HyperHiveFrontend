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
  
  // Track if we're editing existing data or creating new
  isEditMode = false;
  existingLearnerId: number | null = null;

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
    // Load existing learner data
    this.loadExistingData();
  }

  loadExistingData() {
    this.isLoading = true;
    
    // Hardcoded learner ID - get from token in real scenario
    const learnerId = 2;
    
    this.learnersService.getLearnerById(learnerId).subscribe({
      next: (data) => {
        console.log('✅ Existing learner data loaded:', data);
        this.isLoading = false;
        
        if (data && data.id) {
          // Data exists - enter edit mode
          this.isEditMode = true;
          this.existingLearnerId = data.id;
          console.log('📝 Edit mode enabled - Learner ID:', this.existingLearnerId);
          
          // Populate form with existing data
          this.populateForm(data);
        } else {
          // No existing data, pre-fill name and email from token
          this.isEditMode = false;
          this.existingLearnerId = null;
          console.log('➕ Create mode - No existing data');
          this.prefillBasicInfo();
        }
      },
      error: (error) => {
        console.log('⚠️ No existing data found, starting fresh');
        this.isLoading = false;
        this.isEditMode = false;
        this.existingLearnerId = null;
        // Pre-fill name and email from token
        this.prefillBasicInfo();
      }
    });
  }

  prefillBasicInfo() {
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

  populateForm(data: any) {
    // Format the date for the date input (YYYY-MM-DD format)
    let formattedDate = '';
    if (data.joinedDate) {
      const date = new Date(data.joinedDate);
      formattedDate = date.toISOString().split('T')[0];
    }

    // Populate basic fields
    this.evaluationForm.patchValue({
      name: data.name || '',
      email: data.email || '',
      position: data.position || '',
      department: data.department || '',
      joinedDate: formattedDate,
      bio: data.bio || ''
    });

    // Populate AI Profile arrays
    if (data.aiProfile) {
      // Clear existing arrays and populate with data
      this.populateArray(this.skillsArray, data.aiProfile.skills || [], () => this.createSkillControl());
      this.populateArray(this.interestsArray, data.aiProfile.interests || [], () => this.createInterestControl());
      this.populateArray(this.goalsArray, data.aiProfile.goals || [], () => this.createGoalControl());
      this.populateArray(this.preferredTopicsArray, data.aiProfile.preferredTopics || [], () => this.createTopicControl());
      this.populateArray(this.weakAreasArray, data.aiProfile.weakAreas || [], () => this.createWeakAreaControl());

      // Populate other AI Profile fields
      this.evaluationForm.patchValue({
        aiProfile: {
          currentLevel: data.aiProfile.currentLevel || 'intermediate',
          learningStyle: data.aiProfile.learningStyle || 'hands-on',
          availableHoursPerWeek: data.aiProfile.availableHoursPerWeek || 10,
          preferredLearningTime: data.aiProfile.preferredLearningTime || 'evening',
          yearsOfExperience: data.aiProfile.yearsOfExperience || ''
        }
      });
    }
  }

  populateArray(formArray: FormArray, data: string[], createControl: () => any) {
    // Clear existing controls
    while (formArray.length > 0) {
      formArray.removeAt(0);
    }

    // Add controls with data
    if (data && data.length > 0) {
      data.forEach((value: string) => {
        const control = createControl();
        control.setValue(value);
        formArray.push(control);
      });
    } else {
      // Add at least one empty control
      formArray.push(createControl());
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
    const evaluationData: any = {
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

    // Determine if we're creating or updating
    if (this.isEditMode && this.existingLearnerId) {
      // Update existing record - PUT api/Learners/{id}
      console.log('📝 Updating existing learner data, ID:', this.existingLearnerId);
      this.updateLearner(this.existingLearnerId, evaluationData);
    } else {
      // Create new record - POST api/Learners
      console.log('➕ Creating new learner record');
      this.createLearner(evaluationData);
    }
  }

  createLearner(evaluationData: any) {
    this.learnersService.createLearner(evaluationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Skillset evaluation created successfully!';
        console.log('✅ Learner created:', response);
        
        setTimeout(() => {
          this.router.navigate(['/skillset-statistics']);
        }, 2000);
      },
      error: (error) => {
        this.handleSubmitError(error);
      }
    });
  }

  updateLearner(id: number, evaluationData: any) {
    this.learnersService.updateLearner(id, evaluationData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Skillset evaluation updated successfully!';
        console.log('✅ Learner updated:', response);
        
        setTimeout(() => {
          this.router.navigate(['/skillset-statistics']);
        }, 2000);
      },
      error: (error) => {
        this.handleSubmitError(error);
      }
    });
  }

  handleSubmitError(error: any) {
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
              window.location.href = `/skillset-statistics`;
            }
          },
          (navError) => {
            console.error('❌ Navigation promise rejected:', navError);
            window.location.href = `/skillset-statistics`;
          }
        );
      } catch (navError) {
        console.error('❌ Navigation exception:', navError);
        window.location.href = `/skillset-statistics`;
      }
    }, 1000);
    
    // Also try immediate navigation as backup
    setTimeout(() => {
      const currentUrl = this.router.url;
      if (currentUrl.includes('skillset-evaluation')) {
        console.log('⚠️ Still on skillset-evaluation page, forcing navigation...');
        window.location.href = `/skillset-statistics`;
      }
    }, 3000);
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

