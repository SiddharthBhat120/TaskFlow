import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskStatus } from '../models/models';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = `${environment.apiUrl}/tasks`;

  constructor(private http: HttpClient) {}

  getTasks(projectId?: string): Observable<Task[]> {
    const url = projectId ? `${this.apiUrl}?project=${projectId}` : this.apiUrl;
    return this.http.get<Task[]>(url);
  }

  createTask(data: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.apiUrl, data);
  }

  updateTask(id: string, data: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.apiUrl}/${id}`, data);
  }

  updateStatus(id: string, status: TaskStatus, order?: number): Observable<Task> {
    return this.http.patch<Task>(`${this.apiUrl}/${id}/status`, { status, order });
  }

  deleteTask(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}
