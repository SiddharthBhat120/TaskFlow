import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TaskService } from '../../../core/services/task.service';
import { UploadService } from '../../../core/services/upload.service';
import { Task, TaskStatus, User } from '../../../core/models/models';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.scss',
})
export class TaskFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  isEdit = false;
  saving = false;
  uploading = false;
  priorities = ['Low', 'Medium', 'High'];
  serverUrl = environment.socketUrl;

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    assignedTo: [''],
    priority: ['Medium'],
    deadline: [null as Date | null],
  });

  constructor(
    private taskService: TaskService,
    private uploadService: UploadService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { projectId: string; members: User[]; status?: TaskStatus; task?: Task }
  ) {
    this.isEdit = !!data?.task;
  }

  ngOnInit(): void {
    if (this.data?.task) {
      const t = this.data.task;
      this.form.patchValue({
        title: t.title,
        description: t.description,
        assignedTo: typeof t.assignedTo === 'string' ? t.assignedTo : (t.assignedTo as User)?._id || '',
        priority: t.priority,
        deadline: t.deadline ? new Date(t.deadline) : null,
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;

    const raw = this.form.value;
    const payload: Partial<Task> = {
      title: raw.title || '',
      description: raw.description || '',
      assignedTo: raw.assignedTo || undefined,
      priority: (raw.priority as Task['priority']) || 'Medium',
      deadline: raw.deadline ? new Date(raw.deadline).toISOString() : undefined,
      project: this.data.projectId,
      status: this.data.task?.status || this.data.status || 'To Do',
    };

    const request = this.isEdit
      ? this.taskService.updateTask(this.data.task!._id, payload)
      : this.taskService.createTask(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.isEdit ? 'Task updated' : 'Task created', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Something went wrong', 'Close', { duration: 4000 });
      },
    });
  }

  onFileSelected(event: Event): void {
    if (!this.data.task) {
      this.snackBar.open('Save the task first, then reopen it to attach files', 'Close', { duration: 4000 });
      return;
    }
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.uploading = true;
    this.uploadService.uploadTaskFile(this.data.task._id, file).subscribe({
      next: (res) => {
        this.uploading = false;
        this.data.task!.attachments = res.task.attachments;
        this.snackBar.open('File uploaded', 'Close', { duration: 3000 });
      },
      error: (err) => {
        this.uploading = false;
        this.snackBar.open(err.error?.message || 'Upload failed', 'Close', { duration: 4000 });
      },
    });
  }
}
