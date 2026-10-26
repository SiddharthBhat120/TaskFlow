import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ChatMessage } from '../models/models';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket | null = null;

  constructor(private authService: AuthService) {}

  // Called once after login (e.g. from the app shell) to open the real-time connection
  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.socketUrl, {
      auth: { token: this.authService.getToken() },
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  joinProject(projectId: string): void {
    this.socket?.emit('join_project', projectId);
  }

  leaveProject(projectId: string): void {
    this.socket?.emit('leave_project', projectId);
  }

  sendMessage(projectId: string, text: string): void {
    this.socket?.emit('send_message', { projectId, text });
  }

  onReceiveMessage(): Observable<ChatMessage> {
    return new Observable((observer) => {
      this.socket?.on('receive_message', (msg: ChatMessage) => observer.next(msg));
    });
  }

  emitTyping(projectId: string): void {
    this.socket?.emit('typing', { projectId });
  }

  emitStopTyping(projectId: string): void {
    this.socket?.emit('stop_typing', { projectId });
  }

  onUserTyping(): Observable<{ name: string }> {
    return new Observable((observer) => {
      this.socket?.on('user_typing', (data: { name: string }) => observer.next(data));
    });
  }

  onUserStopTyping(): Observable<{ name: string }> {
    return new Observable((observer) => {
      this.socket?.on('user_stop_typing', (data: { name: string }) => observer.next(data));
    });
  }

  onNotification(): Observable<{ message: string; type: string }> {
    return new Observable((observer) => {
      this.socket?.on('notification', (data: { message: string; type: string }) => observer.next(data));
    });
  }
}
