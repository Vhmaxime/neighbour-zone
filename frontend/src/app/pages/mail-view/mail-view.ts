import { Component, inject, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MailService, Conversation, MailMessage, Inbox } from '../../services/mail';
import { AuthService } from '../../services/auth';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-mail-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mail-view.html',
  styleUrl: './mail-view.css',
})
export class MailView {
  private mailService = inject(MailService);
  private authService = inject(AuthService);
  private router = inject(Router);

  public inbox = signal<Inbox | null>(null);
  activeThread: Conversation | null = null;
  selectedId: string | null = null;
  replyText: string = '';
  myUserId: string = '';

  @Input()
  set id(conversationId: string) {
    this.selectedId = conversationId;
  }

  ngOnInit() {
    const user = this.authService.getUser();

    if (user && user.sub) {
      this.myUserId = user.sub; // 'sub' is the ID in JWT
    }

    this.refreshThread();

    this.loadInbox();
  }

  public loadInbox() {
    firstValueFrom(this.mailService.getInbox())
      .then((inbox) => {
        this.inbox.set(inbox);
      })
      .catch((err) => {
        console.error('Error loading inbox', err);
      });
  }

  selectThread(id: string) {
    // Changes URL to messages/[ID]
    // The Input setter above will trigger automatically and load the messages
    this.router.navigate(['/messages', id]);
  }

  refreshThread() {
    if (!this.selectedId) return;

    this.mailService.getThread(this.selectedId).subscribe({
      next: (res: { conversation: Conversation }) => {
        this.activeThread = res.conversation;
      },
      error: (err: any) => console.error('Error loading thread', err),
    });
  }

  sendReply() {
    if (!this.activeThread || !this.replyText.trim()) return;

    this.mailService.sendReply(this.activeThread.id, this.replyText).subscribe({
      next: () => {
        this.replyText = ''; // Clear input
        this.refreshThread(); // Reload messages to show the new one
      },
      error: (err: any) => alert('Failed to send message'),
    });
  }

  // --- Helpers for HTML ---

  isMe(senderId: string): boolean {
    return senderId === this.myUserId;
  }

  getOtherUserName(convo: Conversation): string {
    if (!convo.participant1 || !convo.participant2) return 'Unknown';
    return convo.participant1.id === this.myUserId
      ? convo.participant2.username
      : convo.participant1.username;
  }
}
