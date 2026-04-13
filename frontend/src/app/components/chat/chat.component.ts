import {
  Component,
  OnInit,
  OnDestroy,
  OnChanges,
  AfterViewChecked,
  Input,
  SimpleChanges,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../services/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chat-container">
      <!-- Header -->
      <div class="chat-header">
        <h2>Chat</h2>
      </div>

      <!-- Messages List -->
      <div class="messages-list" #messagesList>
        <ng-container *ngIf="(filteredMessages$ | async) as messages">
          <ng-container *ngIf="messages.length > 0; else noMessages">
            <div
              *ngFor="let message of messages"
              [class.own-message]="message.senderId === currentUserId"
              class="message-wrapper"
            >
              <div class="message">
                <p class="content">{{ message.content }}</p>
                <div class="message-footer">
                  <span class="timestamp">{{ message.createdAt | date: 'HH:mm' }}</span>
                  <span class="read-status" *ngIf="message.readAt">✓✓</span>
                  <button 
                    *ngIf="message.senderId === currentUserId"
                    (click)="deleteMessage(message.id)"
                    class="delete-btn"
                    title="Delete message"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-template #noMessages>
            <div class="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          </ng-template>
        </ng-container>
      </div>

      <!-- Input Area -->
      <div class="input-area">
        <input
          type="text"
          [(ngModel)]="messageText"
          placeholder="Type a message..."
          (keyup.enter)="sendMessage()"
          [disabled]="isSending"
          class="message-input"
        />
        <button
          (click)="sendMessage()"
          [disabled]="!messageText.trim() || isSending"
          class="send-btn"
        >
          {{ isSending ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
      }

      .chat-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .chat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px;
        border-bottom: 1px solid #eee;
        background: #f8f9fa;

        h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #999;
          display: none;

          &:hover {
            color: #333;
          }
        }
      }

      .messages-list {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 8px;

        &::-webkit-scrollbar {
          width: 8px;
        }

        &::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        &::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;

          &:hover {
            background: #555;
          }
        }
      }

      .no-messages {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: #999;
        text-align: center;

        p {
          margin: 0;
        }
      }

      .message-wrapper {
        display: flex;
        margin-bottom: 8px;

        &.own-message {
          justify-content: flex-end;
        }
      }

      .message {
        max-width: 70%;
        padding: 8px 12px;
        border-radius: 8px;
        word-wrap: break-word;
        position: relative;

        .content {
          margin: 0 0 4px 0;
          font-size: 14px;
          line-height: 1.4;
        }

        .message-footer {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          opacity: 0.6;
        }

        .timestamp {
          margin-right: 4px;
        }

        .read-status {
          margin-right: 4px;
        }

        .delete-btn {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0;
          font-size: 18px;
          line-height: 1;
          opacity: 0.6;
          transition: opacity 0.2s;
          margin-left: auto;

          &:hover {
            opacity: 1;
          }
        }
      }

      .own-message .message {
        background-color: #D97757;
        color: white;

        .timestamp,
        .read-status {
          color: rgba(255, 255, 255, 0.7);
        }
      }

      .message-wrapper:not(.own-message) .message {
        background-color: #e9ecef;
        color: #333;
      }

      .input-area {
        display: flex;
        gap: 8px;
        padding: 16px;
        border: 3px solid #D97757;
        border-radius: 6px;
        background: #f8f9fa;
        margin: 8px;

        .message-input {
          flex: 1;
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          font-family: inherit;

          &:focus {
            outline: none;
            border-color: #D97757;
            box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.1);
          }

          &:disabled {
            background-color: #f5f5f5;
            color: #999;
          }
        }

        .send-btn {
          padding: 10px 16px;
          background-color: #D97757;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;

          &:hover:not(:disabled) {
            background-color: #c25a47;
          }

          &:disabled {
            background-color: #ccc;
            cursor: not-allowed;
          }
        }
      }
    `,
  ],
})
export class ChatComponent implements OnInit, OnChanges, AfterViewChecked, OnDestroy {
  @Input() conversationId: string = '';
  @Input() currentUserId: string = '';
  @ViewChild('messagesList') messagesListRef!: ElementRef;

  messageText: string = '';
  isSending: boolean = false;
  messages$: Observable<Message[]> = new Observable();
  filteredMessages$: Observable<Message[]> = new Observable();
  private shouldScroll = true;

  constructor(
    private messagingService: MessagingService
  ) {
    this.messages$ = this.messagingService.messages$;
  }

  private updateFilteredMessages() {
    // Filter messages by current conversationId
    this.filteredMessages$ = this.messages$.pipe(
      map((messages: any[]) => 
        messages.filter(m => m.conversationId === this.conversationId)
      )
    );
  }

  async ngOnInit() {
    // Initial setup
    this.updateFilteredMessages();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['conversationId'] && this.conversationId) {
      // Update filtered messages
      this.updateFilteredMessages();
      
      // Load initial messages for this conversation
      await this.messagingService.loadMessages(this.conversationId);

      // Subscribe to real-time updates
      this.messagingService.subscribeToMessages(this.conversationId);
      
      // Scroll to bottom when conversation changes
      this.shouldScroll = true;
    }
  }

  ngAfterViewChecked() {
    if (this.shouldScroll && this.messagesListRef?.nativeElement) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }

  private scrollToBottom() {
    const element = this.messagesListRef.nativeElement;
    setTimeout(() => {
      element.scrollTop = element.scrollHeight;
    }, 0);
  }

  async sendMessage() {
    if (!this.messageText.trim() || this.isSending) {
      return;
    }

    this.isSending = true;

    try {
      await this.messagingService.sendMessage(
        this.conversationId,
        this.messageText
      );
      this.messageText = '';
      // Scroll to bottom after sending message
      this.shouldScroll = true;
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.isSending = false;
    }
  }

  async deleteMessage(messageId: string) {
    const success = await this.messagingService.deleteMessage(messageId);
    if (!success) {
      alert('Failed to delete message');
    } else {
      // Scroll to bottom after deleting message if at the bottom
      this.shouldScroll = true;
    }
  }

ngOnDestroy() {
    this.messagingService.unsubscribeFromMessages();
  }
}
