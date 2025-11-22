import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { GrowthPlanService, GrowthPlan } from '../../core/services/growth-plan.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-growth-plan',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './growth-plan.component.html',
  styleUrl: './growth-plan.component.css'
})
export class GrowthPlanComponent implements OnInit {
  growthPlan: GrowthPlan | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private growthPlanService: GrowthPlanService,
    private router: Router
  ) {}

  ngOnInit() {
    this.generateGrowthPlan();
  }

  generateGrowthPlan() {
    this.isLoading = true;
    this.errorMessage = '';

    // Hardcoded learnerId as specified
    const learnerId = 2;

    console.log('Generating growth plan for learner ID:', learnerId);

    this.growthPlanService.generateGrowthPlan(learnerId).subscribe({
      next: (plan) => {
        console.log('Growth plan generated successfully:', plan);
        this.growthPlan = plan;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error generating growth plan:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to generate growth plan. Please try again.';
      }
    });
  }

  getPriorityColor(priority: string): string {
    const priorityLower = priority.toLowerCase();
    if (priorityLower === 'high') return 'priority-high';
    if (priorityLower === 'medium') return 'priority-medium';
    if (priorityLower === 'low') return 'priority-low';
    return '';
  }

  getDifficultyColor(difficulty: string): string {
    const difficultyLower = difficulty.toLowerCase();
    if (difficultyLower === 'beginner') return 'difficulty-beginner';
    if (difficultyLower === 'intermediate') return 'difficulty-intermediate';
    if (difficultyLower === 'advanced') return 'difficulty-advanced';
    return '';
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

  regeneratePlan() {
    this.generateGrowthPlan();
  }

  navigateToCourses() {
    this.router.navigate(['/courses']);
  }
}

