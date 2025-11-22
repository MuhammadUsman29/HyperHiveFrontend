import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LearnerData {
  id: number;
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
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LearnersService {
  constructor(private apiService: ApiService) {}

  /**
   * Get learner data by ID
   * Calls: GET api/Learners/{id}
   */
  getLearnerById(id: string | number): Observable<LearnerData> {
    return this.apiService.get<LearnerData>(`Learners/${id}`);
  }

  /**
   * Create or update learner data
   * Calls: POST api/Learners
   */
  createLearner(learnerData: Partial<LearnerData>): Observable<LearnerData> {
    return this.apiService.post<LearnerData>('Learners', learnerData);
  }

  /**
   * Update learner data
   * Calls: PUT api/Learners/{id}
   */
  updateLearner(id: string | number, learnerData: Partial<LearnerData>): Observable<LearnerData> {
    return this.apiService.put<LearnerData>(`Learners/${id}`, learnerData);
  }

  /**
   * Get learner statistics
   * Calls: GET api/Learners/{id}/statistics
   */
  getLearnerStatistics(id: string | number): Observable<any> {
    return this.apiService.get<any>(`Learners/${id}/statistics`);
  }
}

