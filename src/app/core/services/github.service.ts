import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface LanguageStats {
  language: string;
  fileCount: number;
  linesOfCode: number;
  percentage: number;
}

export interface TechnologyStats {
  technology: string;
  usageCount: number;
  percentage: number;
  files: string[];
}

export interface DomainAreaStats {
  area: string;
  contributionCount: number;
  percentage: number;
  examples: string[];
}

export interface ConceptStats {
  concept: string;
  occurrenceCount: number;
  percentage: number;
  examples: string[];
}

export interface GitHubDeveloperAnalysis {
  developerUsername: string;
  developerName: string;
  totalCommits: number;
  totalPullRequests: number;
  totalLinesAdded: number;
  totalLinesDeleted: number;
  languages: LanguageStats[];
  technologies: TechnologyStats[];
  domainAreas: DomainAreaStats[];
  concepts: ConceptStats[];
  analysisDate: string;
}

export interface GitHubAnalyzeRequest {
  owner: string;
  repository: string;
  username: string;
  since: string;
  until: string;
}

@Injectable({
  providedIn: 'root'
})
export class GitHubService {
  constructor(private apiService: ApiService) {}

  /**
   * Analyze GitHub developer
   * Calls: POST api/GitHub/analyze-developer
   */
  analyzeDeveloper(request: GitHubAnalyzeRequest): Observable<GitHubDeveloperAnalysis> {
    return this.apiService.post<GitHubDeveloperAnalysis>('GitHub/analyze-developer', request);
  }
}

