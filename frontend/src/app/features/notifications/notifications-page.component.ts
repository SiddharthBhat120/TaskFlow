import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NotificationService } from '../../core/services/notification.service';
import { AppNotification } from '../../core/models/models';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  templateUrl: './notifications-page.component.html',
  styleUrl: './notifications-page.component.scss',
})
export class NotificationsPageComponent implements OnInit {
  notifications: AppNotification[] = [];
  loading = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.notificationService.getNotifications().subscribe((data) => {
      this.notifications = data;
      this.loading = false;
    });
  }

  markRead(n: AppNotification): void {
    if (n.isRead) return;
    this.notificationService.markAsRead(n._id).subscribe(() => this.load());
  }

  markAllRead(): void {
    this.notificationService.markAllAsRead().subscribe(() => this.load());
  }

  iconFor(type: string): string {
    const map: Record<string, string> = {
      task_assigned: 'assignment_ind',
      task_updated: 'update',
      project_update: 'folder',
      chat_message: 'chat',
      deadline: 'event',
    };
    return map[type] || 'notifications';
  }
}
