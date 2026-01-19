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

  public inbox = signal<Inbox | null>(null);
  public activeThread = signal<Conversation | null>(null);
  private userId = this.authService.getUser()?.sub;
  public message = '';

  public isLoading = signal<boolean>(true);
  public error = signal<string | null>(null);

  ngOnInit() {
    this.loadInbox();
  }

  private loadInbox() {
    firstValueFrom(this.mailService.getInbox())
      .then((inbox) => {
        this.inbox.set(inbox);
      })
      .catch((err) => {
        console.error('Error loading inbox', err);
      });
  }

  public loadThread(id: string) {
    firstValueFrom(this.mailService.getThread(id))
      .then((res) => {
        this.activeThread.set(res);
      })
      .catch((err) => {
        console.error('Error loading thread', err);
      });
  }

  public getOtherUserName(convo: Conversation): string {
    if (!convo.participant1 || !convo.participant2) return 'Unknown';
    return convo.participant1.id === this.userId
      ? convo.participant2.username
      : convo.participant1.username;
  }

  public isMe(senderId: string): boolean {
    return senderId === this.userId;
  }

  public handleSend() {
    const conversation = this.activeThread();
    if (!conversation) return;
    if (this.message.trim() === '') return;

    const messageContent = this.message.trim();

    this.sendMessage(conversation.id, messageContent);
  }

  private sendMessage(conversationId: string, message: string) {
    firstValueFrom(this.mailService.sendReply(conversationId, message))
      .then(() => {
        this.message = '';
        this.loadThread(conversationId);
      })
      .catch((err) => {
        console.error('Error sending message', err);
      });
  }
}
