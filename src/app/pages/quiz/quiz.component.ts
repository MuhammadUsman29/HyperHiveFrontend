import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { QuizService, Quiz, QuizQuestion, QuizGenerationRequest } from '../../core/services/quiz.service';
import { TokenService } from '../../core/services/token.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, HeaderComponent],
  templateUrl: './quiz.component.html',
  styleUrl: './quiz.component.css'
})
export class QuizComponent implements OnInit {
  quiz: Quiz | null = null;
  quizForm: FormGroup;
  isLoading = false;
  isSubmitting = false;
  errorMessage = '';
  currentQuestionIndex = 0;
  answers: { [questionId: number]: string } = {};
  showResults = false;
  quizResult: any = null;
  learnerId: number = 0; // Store learner ID

  constructor(
    private fb: FormBuilder,
    private quizService: QuizService,
    private tokenService: TokenService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.quizForm = this.fb.group({});
  }

  ngOnInit() {
    this.generateQuiz();
  }

  generateQuiz() {
    this.isLoading = true;
    this.errorMessage = '';
    
    // Get learner ID from token or route params
    this.learnerId = Number(this.tokenService.getUserId() || 
                     this.route.snapshot.params['learnerId'] || 
                     2);

    const request: QuizGenerationRequest = {
      learnerId: this.learnerId,
      quizType: 'Software engineer',
      difficulty: 'medium',
      numberOfQuestions: 10
    };

    console.log('Generating quiz with request:', request);

    this.quizService.generateQuiz(request).subscribe({
      next: (quiz) => {
        console.log('Quiz generated:', quiz);
        this.quiz = quiz;
        this.isLoading = false;
        this.initializeForm();
      },
      error: (error) => {
        console.error('Error generating quiz:', error);
        this.isLoading = false;
        this.errorMessage = error.message || 'Failed to generate quiz. Please try again.';
      }
    });
  }

  initializeForm() {
    if (!this.quiz) return;

    const formControls: { [key: string]: any } = {};
    this.quiz.questions.forEach((question) => {
      formControls[`question_${question.questionId}`] = [''];
    });
    this.quizForm = this.fb.group(formControls);
  }

  selectAnswer(questionId: number, answer: string) {
    this.answers[questionId] = answer;
    const controlName = `question_${questionId}`;
    this.quizForm.patchValue({ [controlName]: answer });
  }

  isAnswerSelected(questionId: number, answer: string): boolean {
    return this.answers[questionId] === answer;
  }

  getCurrentQuestion(): QuizQuestion | null {
    if (!this.quiz || !this.quiz.questions[this.currentQuestionIndex]) {
      return null;
    }
    return this.quiz.questions[this.currentQuestionIndex];
  }

  getCurrentQuestionOptions(): string[] {
    const question = this.getCurrentQuestion();
    if (!question || !question.options) {
      return [];
    }
    // Handle both string[] and QuizOption[] formats
    if (question.options.length > 0 && typeof question.options[0] === 'string') {
      return question.options as string[];
    } else {
      return (question.options as any[]).map((opt: any) => opt.text || opt);
    }
  }

  getSelectedAnswer(questionId: number): string {
    return this.answers[questionId] || '';
  }

  nextQuestion() {
    if (this.currentQuestionIndex < (this.quiz?.questions.length || 0) - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < (this.quiz?.questions.length || 0)) {
      this.currentQuestionIndex = index;
    }
  }

  getAnsweredCount(): number {
    return Object.keys(this.answers).length;
  }

  getTotalQuestions(): number {
    return this.quiz?.questions.length || 0;
  }

  isAllAnswered(): boolean {
    return this.getAnsweredCount() === this.getTotalQuestions();
  }

  submitQuiz() {
    if (!this.quiz || !this.isAllAnswered()) {
      this.errorMessage = 'Please answer all questions before submitting.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const answers = Object.keys(this.answers).map(questionId => ({
      questionId: Number(questionId),
      selectedAnswer: this.answers[Number(questionId)]
    }));

    const submitPayload = {
      quizId: this.quiz.quizId,
      learnerId: this.learnerId,
      answers: answers
    };

    console.log('Submitting quiz with payload:', submitPayload);

    this.quizService.submitQuiz(this.quiz.quizId, this.learnerId, answers).subscribe({
      next: (result) => {
        console.log('Quiz submitted successfully:', result);
        this.quizResult = result;
        this.showResults = true;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error submitting quiz:', error);
        this.isSubmitting = false;
        this.errorMessage = error.message || 'Failed to submit quiz. Please try again.';
      }
    });
  }

  restartQuiz() {
    this.currentQuestionIndex = 0;
    this.answers = {};
    this.showResults = false;
    this.quizResult = null;
    this.quizForm.reset();
    this.generateQuiz();
  }

  getScoreColor(score: number): string {
    if (score >= 80) return 'excellent';
    if (score >= 60) return 'good';
    if (score >= 40) return 'average';
    return 'needs-improvement';
  }
}

