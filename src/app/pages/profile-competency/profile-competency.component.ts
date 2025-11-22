import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { GitHubService, GitHubDeveloperAnalysis } from '../../core/services/github.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

export interface GitHubProfile {
  username: string;
  publicRepos: number;
  followers: number;
  following: number;
  topLanguages: string[];
  topicInterests: string[];
  bio: string;
  totalCommits: number;
  yearsActive: number;
}

export interface SkillsComparison {
  claimedSkills: string[];
  gitHubSkills: string[];
  matchedSkills: string[];
  unverifiedSkills: string[];
  additionalGitHubSkills: string[];
  matchPercentage: number;
}

export interface ProfileCompetencyData {
  learnerId: number;
  gitHubUsername: string;
  validationScore: number;
  validationLevel: string;
  gitHubProfile: GitHubProfile;
  skillsComparison: SkillsComparison;
  aiAnalysis: string;
  recommendations: string[];
  validatedAt: string;
}

@Component({
  selector: 'app-profile-competency',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './profile-competency.component.html',
  styleUrl: './profile-competency.component.css'
})
export class ProfileCompetencyComponent implements OnInit {
  competencyData: ProfileCompetencyData | null = null;
  gitHubAnalysis: GitHubDeveloperAnalysis | null = null;
  isLoading = true;
  errorMessage = '';
  userName: string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private gitHubService: GitHubService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('📊 Profile Competency Component initialized');
    console.log('📍 Current route:', this.router.url);
    
    // Remove the try-catch to see if there's an authentication error
    this.isLoading = false; // Set to false initially to show the page
    
    try {
      const userInfo = this.authService.getUserInfo();
      this.userName = userInfo.name || userInfo.email || 'User';
      console.log('👤 User info:', this.userName);
    } catch (error) {
      console.warn('⚠️ Could not get user info (user may not be logged in):', error);
      this.userName = 'Guest';
    }
    
    // Load data
    this.loadCompetencyData();
  }

  loadCompetencyData() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Hardcoded request data as specified
    const validationRequest = {
      learnerId: 2,
      gitHubUsername: "ali-akbar784"
    };
    
    // GitHub analysis request
    const currentDate = new Date();
    const threeYearsAgo = new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), currentDate.getDate());
    
    const gitHubRequest = {
      owner: "ali-akbar784",
      repository: "CleanArchitecture",
      username: "ali-akbar784",
      since: threeYearsAgo.toISOString(),
      until: currentDate.toISOString()
    };
    
    console.log('📡 Loading competency data and GitHub analysis...');
    
    // Load both APIs in parallel
    forkJoin({
      competency: this.apiService.post<ProfileCompetencyData>('ProfileValidation/validate', validationRequest),
      github: this.gitHubService.analyzeDeveloper(gitHubRequest)
    }).subscribe({
      next: (response) => {
        console.log('✅ All data loaded successfully:', response);
        
        if (response.competency && typeof response.competency === 'object') {
          this.competencyData = response.competency as ProfileCompetencyData;
        }
        
        if (response.github && typeof response.github === 'object') {
          this.gitHubAnalysis = response.github;
          console.log('📊 GitHub Analysis:', this.gitHubAnalysis);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.warn('⚠️ Error loading data:', error);
        console.warn('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        
        this.isLoading = false;
        this.errorMessage = 'Unable to load data from server. Please try again later.';
      }
    });
  }

  getValidationLevelColor(level: string | null | undefined): string {
    if (!level) return 'needs-improvement';
    const levelLower = level.toLowerCase();
    if (levelLower.includes('excellent') || levelLower.includes('outstanding')) return 'excellent';
    if (levelLower.includes('good') || levelLower.includes('strong')) return 'good';
    if (levelLower.includes('fair') || levelLower.includes('moderate')) return 'average';
    return 'needs-improvement';
  }

  getScoreColor(score: number | null | undefined): string {
    if (score === null || score === undefined) return 'needs-improvement';
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'needs-improvement';
  }

  getScoreLabel(score: number | null | undefined): string {
    if (score === null || score === undefined) return 'N/A';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  }

  formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  navigateToQuiz() {
    this.router.navigate(['/quiz']);
  }

  // Heatmap helpers
  getContributionLevel(percentage: number): string {
    if (percentage >= 40) return 'level-4';
    if (percentage >= 25) return 'level-3';
    if (percentage >= 10) return 'level-2';
    if (percentage > 0) return 'level-1';
    return 'level-0';
  }

  getTopDomainAreas() {
    if (!this.gitHubAnalysis?.domainAreas) return [];
    return this.gitHubAnalysis.domainAreas.slice(0, 6);
  }

  getTopTechnologies() {
    if (!this.gitHubAnalysis?.technologies) return [];
    return this.gitHubAnalysis.technologies.slice(0, 6);
  }

  getTopLanguages() {
    if (!this.gitHubAnalysis?.languages) return [];
    return this.gitHubAnalysis.languages.slice(0, 5);
  }
}

