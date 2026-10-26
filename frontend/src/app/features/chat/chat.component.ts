import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { ChatService } from '../../core/services/chat.service';
import { SocketService } from '../../core/services/socket.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatMessage } from '../../core/models/models';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent implements OnInit, OnDestroy {
  @Input({ required: true }) projectId!: string;
  @ViewChild('scrollAnchor') scrollAnchor!: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  newMessage = '';
  typingUser = '';
  private destroy$ = new Subject<void>();
  private typingTimeout: any;

  constructor(
    private chatService: ChatService,
    private socketService: SocketService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    // Load history first, then join the room for live updates
    this.chatService.getMessages(this.projectId).subscribe((msgs) => {
      this.messages = msgs;
      this.scrollToBottom();
    });

    this.socketService.joinProject(this.projectId);

    this.socketService
      .onReceiveMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((msg) => {
        if (msg.project === this.projectId) {
          this.messages.push(msg);
          this.scrollToBottom();
        }
      });

    this.socketService
      .onUserTyping()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => (this.typingUser = data.name));

    this.socketService
      .onUserStopTyping()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => (this.typingUser = ''));
  }

  ngOnDestroy(): void {
    this.socketService.leaveProject(this.projectId);
    this.destroy$.next();
    this.destroy$.complete();
  }

  send(): void {
    if (!this.newMessage.trim()) return;
    this.socketService.sendMessage(this.projectId, this.newMessage.trim());
    this.newMessage = '';
    this.socketService.emitStopTyping(this.projectId);
  }

  onTyping(): void {
    this.socketService.emitTyping(this.projectId);
    clearTimeout(this.typingTimeout);
    this.typingTimeout = setTimeout(() => this.socketService.emitStopTyping(this.projectId), 1500);
  }

  isMine(msg: ChatMessage): boolean {
    const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
    return senderId === this.authService.currentUser()?._id;
  }

  senderName(msg: ChatMessage): string {
    return typeof msg.sender === 'object' ? msg.sender.name : '';
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      this.scrollAnchor?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }
}
