import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface QuizGenerationRequest {
  learnerId: number;
  quizType: string;
  difficulty: string;
  numberOfQuestions: number;
}

export interface QuizOption {
  optionId?: number;
  text: string;
  isCorrect?: boolean;
}

export interface QuizQuestion {
  questionId: number;
  question: string;
  options: string[] | QuizOption[];
  type: string;
  selectedAnswer?: string;
}

export interface Quiz {
  quizId: number;
  title: string;
  questions: QuizQuestion[];
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  constructor(private apiService: ApiService) {}

  /**
   * Generate a quiz
   * Calls: POST api/Quiz/generate
   */
  generateQuiz(request: QuizGenerationRequest): Observable<Quiz> {
    return this.apiService.post<Quiz>('Quiz/generate', request);
  }

  /**
   * Submit quiz answers
   * Calls: POST api/Quiz/submit
   */
  submitQuiz(quizId: number, learnerId: number, answers: { questionId: number; selectedAnswer: string }[]): Observable<any> {
    return this.apiService.post<any>('Quiz/submit', {
      quizId,
      learnerId,
      answers
    });
  }
}

