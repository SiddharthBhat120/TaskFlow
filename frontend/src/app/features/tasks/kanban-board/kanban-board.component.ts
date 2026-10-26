import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { Task, TaskStatus, User } from '../../../core/models/models';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

interface Column {
  status: TaskStatus;
  title: string;
  tasks: Task[];
}

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule, MatMenuModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.scss',
})
export class KanbanBoardComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
  @Input() projectMembers: User[] = [];

  columns: Column[] = [
    { status: 'To Do', title: 'To Do', tasks: [] },
    { status: 'In Progress', title: 'In Progress', tasks: [] },
    { status: 'Review', title: 'Review', tasks: [] },
    { status: 'Completed', title: 'Completed', tasks: [] },
  ];

  loading = true;

  constructor(
    private taskService: TaskService,
    public authService: AuthService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasks(this.projectId).subscribe((tasks) => {
      this.columns.forEach((col) => {
        col.tasks = tasks.filter((t) => t.status === col.status).sort((a, b) => (a.order || 0) - (b.order || 0));
      });
      this.loading = false;
    });
  }

  // Fired by the CDK drag-drop directive when a card is dropped, whether in the
  // same column (reorder) or a different column (status change).
  drop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      const task = event.previousContainer.data[event.previousIndex];
      transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

      const newColumn = this.columns.find((c) => c.tasks === event.container.data)!;
      task.status = newColumn.status;

      this.taskService.updateStatus(task._id, newColumn.status, event.currentIndex).subscribe({
        error: () => this.snackBar.open('Failed to move task, reloading board', 'Close', { duration: 3000 }),
        complete: () => {},
      });
    }
  }

  canManage(): boolean {
    return this.authService.hasRole('Admin', 'Project Manager');
  }

  openCreateTask(status: TaskStatus): void {
    const ref = this.dialog.open(TaskFormComponent, {
      width: '480px',
      data: { projectId: this.projectId, members: this.projectMembers, status },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadTasks();
    });
  }

  openEditTask(task: Task): void {
    const ref = this.dialog.open(TaskFormComponent, {
      width: '480px',
      data: { projectId: this.projectId, members: this.projectMembers, task },
    });
    ref.afterClosed().subscribe((result) => {
      if (result) this.loadTasks();
    });
  }

  deleteTask(task: Task, event: Event): void {
    event.stopPropagation();
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Task', message: `Delete "${task.title}"?` },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.taskService.deleteTask(task._id).subscribe(() => this.loadTasks());
    });
  }

  priorityColor(priority: string): string {
    const map: Record<string, string> = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
    return map[priority] || '#9ca3af';
  }

  assigneeName(task: Task): string {
    const a = task.assignedTo as User;
    return a && typeof a === 'object' ? a.name : 'Unassigned';
  }
}
