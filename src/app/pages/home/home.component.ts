import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CourseCardComponent, Course } from '../../shared/components/course-card/course-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, CourseCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  featuredCourses: Course[] = [
    {
      id: '1',
      title: 'Complete Web Development Bootcamp',
      instructor: 'John Doe',
      rating: 4.7,
      reviews: 12345,
      price: 89.99,
      originalPrice: 199.99,
      category: 'Development',
      level: 'Beginner',
      duration: '45 hours',
      students: 125000
    },
    {
      id: '2',
      title: 'Advanced React and Redux',
      instructor: 'Jane Smith',
      rating: 4.8,
      reviews: 8900,
      price: 79.99,
      originalPrice: 149.99,
      category: 'Programming',
      level: 'Advanced',
      duration: '32 hours',
      students: 89000
    },
    {
      id: '3',
      title: 'UI/UX Design Masterclass',
      instructor: 'Sarah Johnson',
      rating: 4.6,
      reviews: 5600,
      price: 69.99,
      originalPrice: 129.99,
      category: 'Design',
      level: 'Intermediate',
      duration: '28 hours',
      students: 45000
    },
    {
      id: '4',
      title: 'Python for Data Science',
      instructor: 'Mike Wilson',
      rating: 4.9,
      reviews: 15200,
      price: 94.99,
      originalPrice: 179.99,
      category: 'Data Science',
      level: 'Beginner',
      duration: '50 hours',
      students: 200000
    },
    {
      id: '5',
      title: 'Machine Learning Fundamentals',
      instructor: 'Emily Chen',
      rating: 4.7,
      reviews: 7800,
      price: 99.99,
      originalPrice: 199.99,
      category: 'AI/ML',
      level: 'Intermediate',
      duration: '40 hours',
      students: 95000
    },
    {
      id: '6',
      title: 'Mobile App Development with Flutter',
      instructor: 'David Brown',
      rating: 4.8,
      reviews: 11200,
      price: 84.99,
      originalPrice: 159.99,
      category: 'Mobile',
      level: 'Intermediate',
      duration: '35 hours',
      students: 67000
    }
  ];

  categories = [
    { name: 'Development', icon: '💻', count: 1200 },
    { name: 'Design', icon: '🎨', count: 850 },
    { name: 'Business', icon: '📊', count: 650 },
    { name: 'Marketing', icon: '📈', count: 450 },
    { name: 'Photography', icon: '📷', count: 320 },
    { name: 'Music', icon: '🎵', count: 280 }
  ];
}

