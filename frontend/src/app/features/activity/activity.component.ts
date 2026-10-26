import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DashboardService } from '../../core/services/dashboard.service';
import { Activity } from '../../core/models/models';

@Component({
  selector: 'app-activity',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './activity.component.html',
  styleUrl: './activity.component.scss',
})
export class ActivityComponent implements OnInit {
  @Input() projectId?: string; // if omitted, shows activity across all accessible projects

  activities: Activity[] = [];
  loading = true;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.dashboardService.getActivity(this.projectId).subscribe((data) => {
      this.activities = data;
      this.loading = false;
    });
  }

  iconFor(entityType: string): string {
    const map: Record<string, string> = {
      project: 'folder',
      task: 'checklist',
      chat: 'chat',
      file: 'attach_file',
    };
    return map[entityType] || 'circle';
  }

  projectName(activity: Activity): string {
    const p = activity.project;
    return typeof p === 'object' ? p.name : '';
  }
}
