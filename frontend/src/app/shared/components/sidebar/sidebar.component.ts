import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles?: string[]; // if omitted, visible to everyone
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatListModule, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Projects', icon: 'folder', route: '/projects' },
    { label: 'Calendar', icon: 'calendar_month', route: '/calendar' },
    { label: 'Reports', icon: 'bar_chart', route: '/reports', roles: ['Admin', 'Project Manager'] },
    { label: 'Activity', icon: 'history', route: '/activity' },
  ];

  constructor(public authService: AuthService) {}

  isVisible(item: NavItem): boolean {
    if (!item.roles) return true;
    return this.authService.hasRole(...item.roles);
  }
}
