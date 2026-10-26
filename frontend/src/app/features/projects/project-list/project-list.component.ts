import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { AuthService } from '../../../core/services/auth.service';
import { Project } from '../../../core/models/models';
import { ProjectFormComponent } from '../project-form/project-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.scss',
})
export class ProjectListComponent implements OnInit {
  projects: Project[] = [];
  loading = true;

  constructor(
    private projectService: ProjectService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading = true;
    this.projectService.getProjects().subscribe((data) => {
      this.projects = data;
      this.loading = false;
    });
  }

  canManage(): boolean {
    return this.authService.hasRole('Admin', 'Project Manager');
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(ProjectFormComponent, { width: '500px' });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadProjects();
    });
  }

  openEditDialog(project: Project, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(ProjectFormComponent, { width: '500px', data: { project } });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadProjects();
    });
  }

  deleteProject(project: Project, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Project', message: `Delete "${project.name}"? This also removes all its tasks.` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.projectService.deleteProject(project._id).subscribe({
        next: () => {
          this.snackBar.open('Project deleted', 'Close', { duration: 3000 });
          this.loadProjects();
        },
        error: (err) => this.snackBar.open(err.error?.message || 'Delete failed', 'Close', { duration: 4000 }),
      });
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
