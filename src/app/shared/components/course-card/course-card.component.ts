import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Course {
  id: string;
  title: string;
  instructor: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  imageUrl?: string;
  category?: string;
  level?: string;
  duration?: string;
  students?: number;
}

@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-card.component.html',
  styleUrl: './course-card.component.css'
})
export class CourseCardComponent {
  @Input() course!: Course;

  getRatingStars(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return Array(fullStars).fill(1).concat(hasHalfStar ? [0.5] : []);
  }
}

