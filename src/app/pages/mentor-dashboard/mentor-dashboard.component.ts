import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LearnersService, LearnerData } from '../../core/services/learners.service';
import { GrowthPlanService, GrowthPlan } from '../../core/services/growth-plan.service';
import { ApiService } from '../../core/services/api.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

interface CompetencyProfile {
  learnerId: number;
  gitHubUsername: string;
  validationScore: number;
  validationLevel: string;
  gitHubProfile: any;
  skillsComparison: any;
  aiAnalysis: string;
  recommendations: string[];
  validatedAt: string;
}

@Component({
  selector: 'app-mentor-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './mentor-dashboard.component.html',
  styleUrl: './mentor-dashboard.component.css'
})
export class MentorDashboardComponent implements OnInit {
  // Hardcoded learner ID
  learnerId = 2;
  gitHubUsername = 'ali-akbar784';
  
  // Data from different APIs
  learnerData: LearnerData | null = null;
  competencyProfile: CompetencyProfile | null = null;
  growthPlan: GrowthPlan | null = null;
  
  // Loading states
  isLoading = true;
  errorMessage = '';
  
  // Computed metrics
  overallProgress = 0;
  completedMilestones = 0;
  totalMilestones = 0;

  constructor(
    private learnersService: LearnersService,
    private growthPlanService: GrowthPlanService,
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.isLoading = true;
    this.errorMessage = '';

    // Fetch all data in parallel using forkJoin
    forkJoin({
      learner: this.learnersService.getLearnerById(this.learnerId),
      competency: this.apiService.post<CompetencyProfile>('ProfileValidation/validate', {
        learnerId: this.learnerId,
        gitHubUsername: this.gitHubUsername
      }),
      growthPlan: this.growthPlanService.generateGrowthPlan(this.learnerId)
    }).subscribe({
      next: (results) => {
        console.log('Dashboard data loaded:', results);
        this.learnerData = results.learner;
        this.competencyProfile = results.competency;
        this.growthPlan = results.growthPlan;
        
        this.calculateMetrics();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.isLoading = false;
        this.errorMessage = 'Failed to load dashboard data. Please try again.';
      }
    });
  }

  calculateMetrics() {
    // Calculate overall progress based on validation score and growth plan
    if (this.competencyProfile && this.growthPlan) {
      const validationProgress = (this.competencyProfile.validationScore / 100) * 50;
      const phaseProgress = this.calculatePhaseProgress() * 50;
      this.overallProgress = Math.round(validationProgress + phaseProgress);
    }

    // Calculate milestone progress
    if (this.growthPlan) {
      this.totalMilestones = this.growthPlan.keyMilestones.length;
      // Simulate some completed milestones based on progress
      this.completedMilestones = Math.floor(this.totalMilestones * (this.overallProgress / 100));
    }
  }

  calculatePhaseProgress(): number {
    // Simulate phase progress - in real scenario, this would come from actual completion data
    return 0.3; // 30% of phases completed
  }

  getValidationScoreColor(score: number | undefined): string {
    if (!score) return 'needs-improvement';
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'needs-improvement';
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return 'excellent';
    if (progress >= 60) return 'good';
    if (progress >= 40) return 'average';
    return 'needs-improvement';
  }

  getPriorityColor(priority: string): string {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return 'priority-high';
    if (priorityLower === 'medium') return 'priority-medium';
    if (priorityLower === 'low') return 'priority-low';
    return '';
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  navigateToGrowthPlan() {
    this.router.navigate(['/growth-plan']);
  }

  navigateToCompetency() {
    this.router.navigate(['/profile-competency']);
  }

  navigateToQuiz() {
    this.router.navigate(['/quiz', this.learnerId]);
  }

  navigateToSkillsetEvaluation() {
    this.router.navigate(['/skillset-evaluation']);
  }

  refreshDashboard() {
    this.loadDashboardData();
  }

  getHighPrioritySkills(): any[] {
    if (!this.growthPlan) return [];
    return this.growthPlan.skillGaps.filter(gap => 
      gap.priority.toLowerCase() === 'high'
    ).slice(0, 5);
  }

  getCurrentPhase(): any {
    if (!this.growthPlan || !this.growthPlan.learningPhases.length) return null;
    // Return first phase as current (in real scenario, track actual progress)
    return this.growthPlan.learningPhases[0];
  }

  getUpcomingPhases(): any[] {
    if (!this.growthPlan || this.growthPlan.learningPhases.length <= 1) return [];
    return this.growthPlan.learningPhases.slice(1, 3);
  }

  getRecentRecommendations(): any[] {
    if (!this.growthPlan) return [];
    return this.growthPlan.recommendedResources.slice(0, 3);
  }
}

