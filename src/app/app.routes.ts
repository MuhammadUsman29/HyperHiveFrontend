import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'courses', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
  { path: 'signup', loadComponent: () => import('./pages/auth/signup/signup.component').then(m => m.SignupComponent) },
  { path: 'login', loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'skillset-evaluation', loadComponent: () => import('./pages/skillset-evaluation/skillset-evaluation.component').then(m => m.SkillsetEvaluationComponent) },
  { path: 'profile-competency', loadComponent: () => import('./pages/profile-competency/profile-competency.component').then(m => m.ProfileCompetencyComponent) },
  { 
    path: 'skillset-statistics', 
    loadComponent: () => import('./pages/skillset-statistics/skillset-statistics.component').then(m => m.SkillsetStatisticsComponent),
    title: 'Competency Profile'
  },
  { path: 'quiz', loadComponent: () => import('./pages/quiz/quiz.component').then(m => m.QuizComponent) },
  { path: 'quiz/:learnerId', loadComponent: () => import('./pages/quiz/quiz.component').then(m => m.QuizComponent) },
  { path: '**', redirectTo: '' }
];
