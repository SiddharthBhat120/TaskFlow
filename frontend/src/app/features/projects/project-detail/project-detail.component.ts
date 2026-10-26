import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { ProjectService } from '../../../core/services/project.service';
import { Project, User } from '../../../core/models/models';
import { KanbanBoardComponent } from '../../tasks/kanban-board/kanban-board.component';
import { ChatComponent } from '../../chat/chat.component';
import { ActivityComponent } from '../../activity/activity.component';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatTabsModule,
    MatIconModule,
    MatChipsModule,
    MatButtonModule,
    KanbanBoardComponent,
    ChatComponent,
    ActivityComponent,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.scss',
})
export class ProjectDetailComponent implements OnInit {
  project: Project | null = null;
  loading = true;

  constructor(private route: ActivatedRoute, private projectService: ProjectService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.projectService.getProject(id).subscribe((data) => {
      this.project = data;
      this.loading = false;
    });
  }

  get members(): User[] {
    return (this.project?.members as User[]) || [];
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
