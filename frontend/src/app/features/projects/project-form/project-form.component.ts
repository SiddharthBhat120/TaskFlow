import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectService } from '../../../core/services/project.service';
import { UserService } from '../../../core/services/user.service';
import { Project, User } from '../../../core/models/models';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrl: './project-form.component.scss',
})
export class ProjectFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  isEdit = false;
  saving = false;
  users: User[] = [];
  statuses = ['Planning', 'Active', 'On Hold', 'Completed'];
  priorities = ['Low', 'Medium', 'High'];

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    status: ['Planning'],
    priority: ['Medium'],
    deadline: [null as Date | null],
    members: [[] as string[]],
  });

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ProjectFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { project?: Project }
  ) {
    this.isEdit = !!data?.project;
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe((users) => (this.users = users));

    if (this.data?.project) {
      const p = this.data.project;
      this.form.patchValue({
        name: p.name,
        description: p.description,
        status: p.status,
        priority: p.priority,
        deadline: p.deadline ? new Date(p.deadline) : null,
        members: (p.members as User[])?.map((m) => (typeof m === 'string' ? m : m._id)) || [],
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.saving = true;
    const raw = this.form.value;
    const payload: Partial<Project> = {
      name: raw.name || '',
      description: raw.description || '',
      status: (raw.status as Project['status']) || 'Planning',
      priority: (raw.priority as Project['priority']) || 'Medium',
      deadline: raw.deadline ? new Date(raw.deadline).toISOString() : undefined,
      members: (raw.members || []) as string[],
    };

    const request = this.isEdit
      ? this.projectService.updateProject(this.data.project!._id, payload)
      : this.projectService.createProject(payload);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.snackBar.open(this.isEdit ? 'Project updated' : 'Project created', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Something went wrong', 'Close', { duration: 4000 });
      },
    });
  }
}
