import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface SkillGap {
  skillName: string;
  currentProficiency: string;
  targetProficiency: string;
  priority: string;
  reasoning: string;
}

export interface LearningPhase {
  phaseNumber: number;
  title: string;
  description: string;
  durationWeeks: number;
  skillsToCover: string[];
  learningObjectives: string[];
  practicalProjects: string[];
  successMetrics: string;
}

export interface RecommendedResource {
  title: string;
  type: string;
  url: string;
  provider: string;
  description: string;
  skillsCovered: string[];
  difficulty: string;
  isFree: boolean;
  estimatedHours: number;
}

export interface GrowthPlan {
  learnerId: number;
  learnerName: string;
  currentLevel: string;
  targetLevel: string;
  estimatedDurationMonths: number;
  overview: string;
  skillGaps: SkillGap[];
  learningPhases: LearningPhase[];
  recommendedResources: RecommendedResource[];
  keyMilestones: string[];
  successCriteria: string;
  generatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class GrowthPlanService {
  constructor(private apiService: ApiService) {}

  /**
   * Generate a growth plan
   * Calls: POST api/GrowthPlan/generate
   */
  generateGrowthPlan(learnerId: number): Observable<GrowthPlan> {
    return this.apiService.post<GrowthPlan>('GrowthPlan/generate', { learnerId });
  }
}

