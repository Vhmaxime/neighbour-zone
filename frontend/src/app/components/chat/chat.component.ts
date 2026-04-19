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
    <div class="flex flex-col h-full w-full bg-white font-body relative">
      
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar" #messagesList>
        <ng-container *ngIf="(filteredMessages$ | async) as messages">
          <ng-container *ngIf="messages.length > 0; else noMessages">
            <div
              *ngFor="let message of messages"
              class="flex w-full items-end gap-2 group"
              [ngClass]="message.senderId === currentUserId ? 'justify-end' : 'justify-start'"
            >
              
              <button 
                *ngIf="message.senderId === currentUserId"
                (click)="deleteMessage(message.id)"
                class="!m-0 !p-2 !bg-transparent !text-gray-300 hover:!text-red-500 hover:!bg-red-50 rounded-full md:opacity-0 group-hover:opacity-100 transition-all duration-200 shrink-0 cursor-pointer"
                title="Delete message"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>

              <div 
                class="relative max-w-[75%] md:max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm"
                [ngClass]="message.senderId === currentUserId ? '!bg-accent !text-white rounded-br-sm' : '!bg-gray-100 !text-pri rounded-bl-sm'"
              >
                <p class="m-0 text-[0.9rem] leading-relaxed break-words whitespace-pre-wrap">{{ message.content }}</p>
                <div class="flex items-center gap-1 mt-1 text-[0.65rem]" [ngClass]="message.senderId === currentUserId ? 'justify-end text-white/80' : 'justify-start text-sec'">
                  <span>{{ message.createdAt | date: 'HH:mm' }}</span>
                  <span *ngIf="message.readAt" class="ml-0.5">✓✓</span>
                </div>
              </div>

            </div>
          </ng-container>
          
          <ng-template #noMessages>
            <div class="flex flex-col items-center justify-center h-full text-sec text-center">
              <p class="m-0 text-sm bg-gray-50 px-5 py-2.5 rounded-full border border-gray-100 font-medium shadow-sm">No messages yet. Start the conversation!</p>
            </div>
          </ng-template>
        </ng-container>
      </div>

      <div class="p-3 bg-white border-t border-gray-100 shrink-0 relative z-20">
        <div class="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-[24px] p-1.5 focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all shadow-inner">
          <textarea
            [(ngModel)]="messageText"
            placeholder="Type a message..."
            (keyup.enter)="!isSending && messageText.trim() ? sendMessage() : null"
            [disabled]="isSending"
            class="flex-1 max-h-32 min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2 px-3.5 text-sm text-pri disabled:opacity-50 font-body outline-none"
            rows="1"
          ></textarea>
          
          <button
            (click)="sendMessage()"
            [disabled]="!messageText.trim() || isSending"
            class="!m-0 !p-0 shrink-0 h-10 w-10 flex items-center justify-center rounded-full !bg-accent !text-white disabled:!bg-gray-200 disabled:!text-gray-400 hover:!bg-[#c25a47] transition-colors shadow-sm cursor-pointer"
          >
            <svg *ngIf="!isSending" class="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            <svg *ngIf="isSending" class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          </button>
        </div>
      </div>
      
    </div>
  `
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

  constructor(private messagingService: MessagingService) {
    this.messages$ = this.messagingService.messages$;
  }

  private updateFilteredMessages() {
    this.filteredMessages$ = this.messages$.pipe(
      map((messages: any[]) => 
        messages.filter(m => m.conversationId === this.conversationId)
      )
    );
  }

  async ngOnInit() {
    this.updateFilteredMessages();
  }

  async ngOnChanges(changes: SimpleChanges) {
    if (changes['conversationId'] && this.conversationId) {
      this.updateFilteredMessages();
      await this.messagingService.loadMessages(this.conversationId);
      this.messagingService.subscribeToMessages(this.conversationId);
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
      this.shouldScroll = true;
    }
  }

  ngOnDestroy() {
    this.messagingService.unsubscribeFromMessages();
  }
}