import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardService } from '../../core/services/dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { DashboardSummary } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, BaseChartDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  summary: DashboardSummary | null = null;
  loading = true;

  statusChartData: ChartData<'doughnut'> = { labels: [], datasets: [{ data: [] }] };
  priorityChartData: ChartData<'bar'> = { labels: [], datasets: [{ data: [], label: 'Tasks' }] };

  doughnutOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: { legend: { position: 'bottom' } },
  };

  barOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } },
  };

  constructor(private dashboardService: DashboardService, public authService: AuthService) {}

  ngOnInit(): void {
    this.dashboardService.getSummary().subscribe((data) => {
      this.summary = data;
      this.loading = false;

      this.statusChartData = {
        labels: Object.keys(data.tasksByStatus),
        datasets: [
          {
            data: Object.values(data.tasksByStatus),
            backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981'],
          },
        ],
      };

      this.priorityChartData = {
        labels: Object.keys(data.tasksByPriority),
        datasets: [
          {
            data: Object.values(data.tasksByPriority),
            label: 'Tasks',
            backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          },
        ],
      };
    });
  }
}
