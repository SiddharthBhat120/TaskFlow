import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { TaskService } from '../../core/services/task.service';
import { Task } from '../../core/models/models';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatDatepickerModule, MatNativeDateModule, MatChipsModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  selectedDate: Date = new Date();
  allTasks: Task[] = [];
  tasksForSelectedDate: Task[] = [];
  loading = true;

  // Marks the mini-calendar cells that have at least one task due
  dateFilter = (date: Date | null): boolean => true; // required by API, not used to disable dates

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.taskService.getTasks().subscribe((tasks) => {
      this.allTasks = tasks.filter((t) => !!t.deadline);
      this.loading = false;
      this.filterForDate(this.selectedDate);
    });
  }

  onDateSelected(date: Date | null): void {
    if (!date) return;
    this.selectedDate = date;
    this.filterForDate(date);
  }

  filterForDate(date: Date): void {
    const dayStr = date.toDateString();
    this.tasksForSelectedDate = this.allTasks.filter((t) => new Date(t.deadline!).toDateString() === dayStr);
  }

  // Custom CSS class applied to calendar cells that have a task due that day
  dateClass = (date: Date): string => {
    const has = this.allTasks.some((t) => new Date(t.deadline!).toDateString() === date.toDateString());
    return has ? 'has-task' : '';
  };

  priorityColor(priority: string): string {
    const map: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
    return map[priority] || '#9ca3af';
  }
}
