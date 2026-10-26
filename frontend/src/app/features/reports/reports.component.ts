import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { ProjectService } from '../../core/services/project.service';
import { DashboardSummary, Project } from '../../core/models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatTableModule, MatChipsModule, BaseChartDirective],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
})
export class ReportsComponent implements OnInit {
  summary: DashboardSummary | null = null;
  projects: Project[] = [];
  loading = true;
  displayedColumns = ['name', 'status', 'priority', 'members', 'deadline'];

  statusChartData: ChartData<'pie'> = { labels: [], datasets: [{ data: [] }] };
  pieOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  completionRate = 0;

  constructor(private dashboardService: DashboardService, private projectService: ProjectService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe((data) => {
      this.summary = data;
      this.completionRate = data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

      this.statusChartData = {
        labels: Object.keys(data.tasksByStatus),
        datasets: [
          {
            data: Object.values(data.tasksByStatus),
            backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'],
          },
        ],
      };
    });

    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
      this.loading = false;
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      Planning: '#9ca3af',
      Active: '#10b981',
      'On Hold': '#f59e0b',
      Completed: '#4f46e5',
    };
    return map[status] || '#9ca3af';
  }
}
