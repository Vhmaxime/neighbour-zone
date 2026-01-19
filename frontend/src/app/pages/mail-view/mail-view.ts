import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MailService, Conversation, MailMessage } from '../../services/mail';
import { AuthService } from '../../services/auth';

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

  inbox: Conversation[] = [];
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

  loadInbox() {
    console.log('1. Starting loadInbox...'); // Check if function runs

    this.mailService.getInbox().subscribe({
      next: (res: { conversations: Conversation[] }) => { 
        console.log('2. Data received from Service:', res); // See the raw object
        
        this.inbox = res.conversations || [];
        console.log('3. Inbox variable set to:', this.inbox); // See the array
        
        // Check "Who am I?"
        console.log('4. My User ID is:', this.myUserId); 
      },
      error: (err) => console.error('Error loading inbox', err)
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
      error: (err: any) => console.error('Error loading thread', err)
    });
  };
  

  sendReply() {
    if (!this.activeThread || !this.replyText.trim()) return;

    this.mailService.sendReply(this.activeThread.id, this.replyText).subscribe({
      next: () => {
        this.replyText = ''; // Clear input
        this.refreshThread(); // Reload messages to show the new one
      },
      error: (err: any) => alert('Failed to send message')
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
