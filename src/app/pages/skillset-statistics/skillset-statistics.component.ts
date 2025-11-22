import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
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

export interface SkillsetStatistics {
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
  selector: 'app-skillset-statistics',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './skillset-statistics.component.html',
  styleUrl: './skillset-statistics.component.css'
})
export class SkillsetStatisticsComponent implements OnInit {
  statistics: SkillsetStatistics | null = null;
  isLoading = true;
  errorMessage = '';
  userName: string = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    console.log('📊 Skillset Statistics Component initialized');
    console.log('📍 Current route:', this.router.url);
    console.log('🔍 Route params:', this.route.snapshot.params);
    console.log('🔍 Query params:', this.route.snapshot.queryParams);
    
    // Prevent any automatic redirects - just load the page
    try {
      const userInfo = this.authService.getUserInfo();
      this.userName = userInfo.name || userInfo.email || 'User';
      
      this.loadStatistics();
    } catch (error) {
      console.error('Error initializing component:', error);
      // Don't redirect on error, just show error state
      this.isLoading = false;
      this.errorMessage = 'Error loading statistics. Please try again.';
    }
  }

  loadStatistics() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Hardcoded request data
    const requestData = {
      learnerId: 2,
      gitHubUsername: "ali-akbar784"
    };
    
    console.log('📡 Loading statistics from ProfileValidation/validate with data:', requestData);
    this.apiService.post<SkillsetStatistics>('ProfileValidation/validate', requestData).subscribe({
      next: (response) => {
        console.log('✅ Statistics loaded successfully:', response);
        console.log('📊 Response structure:', JSON.stringify(response, null, 2));
        // Handle both direct response and wrapped response
        if (response && typeof response === 'object') {
          this.statistics = response as SkillsetStatistics;
        } else {
          console.error('Unexpected response format:', response);
          this.errorMessage = 'Invalid response format from server.';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.warn('⚠️ Statistics API not available:', error);
        console.warn('Error details:', {
          status: error.status,
          message: error.message,
          url: error.url
        });
        
        // Don't redirect on error - just show error message
        this.isLoading = false;
        this.errorMessage = 'Unable to load statistics from server. Please try again later.';
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

  getScoreLabel(score: number): string {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Average';
    return 'Needs Improvement';
  }

  formatDate(dateString: string): string {
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

  navigateToCourses() {
    this.router.navigate(['/courses']);
  }
}

