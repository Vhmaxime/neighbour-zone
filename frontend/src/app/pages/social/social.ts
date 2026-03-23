import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessagingService } from '../../services/messaging.service';
import { AuthService } from '../../services/auth';
import { EnvironmentService } from '../../services/environment.service';
import { ChatComponent } from '../../components/chat/chat.component';

interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1?: { id: string; username: string };
  participant2?: { id: string; username: string };
  createdAt: string;
}

interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

@Component({
  selector: 'app-social',
  standalone: true,
  imports: [CommonModule, FormsModule, ChatComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="social-container">
      <!-- Header -->
      <div class="social-header">
        <h1>Social</h1>
        <button class="new-chat-btn" (click)="openNewChat()">+ New Chat</button>
      </div>

      <div class="social-content">
        <!-- Conversations List -->
        <div class="conversations-panel">
          <div class="conversations-header">
            <h2>Conversations</h2>
          </div>

          <div class="conversations-list">
            <ng-container *ngIf="conversations.length > 0; else noConversations">
              <div
                *ngFor="let conv of conversations"
                [class.active]="selectedConversation?.id === conv.id"
                class="conversation-item"
                (click)="selectConversation(conv)"
              >
                <div class="conversation-avatar">
                  {{ getOtherParticipantName(conv).charAt(0).toUpperCase() }}
                </div>
                <div class="conversation-info">
                  <h3 class="conversation-name">
                    {{ getOtherParticipantName(conv) }}
                  </h3>
                  <p class="conversation-date">
                    {{ conv.createdAt | date: 'short' }}
                  </p>
                </div>
                <button 
                  class="delete-conversation-btn"
                  (click)="deleteConversation($event, conv.id)"
                  title="Delete conversation"
                >
                  🗑️
                </button>
              </div>
            </ng-container>
            <ng-template #noConversations>
              <div class="empty-state">
                <p>No conversations yet</p>
                <small>Start a new chat with a friend</small>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Chat Panel -->
        <div class="chat-panel">
          <ng-container *ngIf="selectedConversation; else noConversationSelected">
            <app-chat
              [conversationId]="selectedConversation.id"
              [currentUserId]="currentUserId"
            ></app-chat>
          </ng-container>
          <ng-template #noConversationSelected>
            <div class="empty-chat-state">
              <div class="empty-icon">💬</div>
              <h2>Select a conversation</h2>
              <p>Choose a conversation from the list to start messaging</p>
            </div>
          </ng-template>
        </div>
      </div>

      <!-- New Chat Modal -->
      <div
        class="modal-overlay"
        *ngIf="showNewChatModal"
        (click)="closeNewChat()"
      >
        <div class="modal-content" (click)="$event.stopPropagation()">
          <h2>Start New Chat</h2>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="onSearchChange($event)"
            placeholder="Search users by username..."
            class="search-input"
          />
          <div class="search-results">
            <ng-container *ngIf="filteredUsers.length > 0; else noResults">
              <div
                *ngFor="let user of filteredUsers"
                class="user-result"
                (click)="startChatWithUser(user)"
              >
                <div class="user-avatar">{{ user.username.charAt(0).toUpperCase() }}</div>
                <div>
                  <h4>{{ user.username }}</h4>
                </div>
              </div>
            </ng-container>
            <ng-template #noResults>
              <div class="empty-results">
                <p *ngIf="searchQuery">No users found</p>
                <p *ngIf="!searchQuery">Type to search for users</p>
              </div>
            </ng-template>
          </div>
          <button class="cancel-btn" (click)="closeNewChat()">Cancel</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .social-container {
        display: flex;
        flex-direction: column;
        height: 100vh;
        background: #f8f9fa;
      }

      .social-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px;
        background: white;
        border: 3px solid #D97757;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        margin: 16px 16px 0 16px;

        h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          color: #1C1917;
        }

        .new-chat-btn {
          padding: 8px 16px;
          background-color: #D97757;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;

          &:hover {
            background-color: #c25a47;
          }
        }
      }

      .social-content {
        display: flex;
        flex: 1;
        gap: 0;
        overflow: hidden;
        min-height: 0;
        border: 3px solid #D97757;
        border-radius: 8px;
        margin: 0 16px 16px 16px;
      }

      .conversations-panel {
        width: 320px;
        min-width: 320px;
        background: white;
        border-right: 3px solid #D97757;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-radius: 5px 0 0 5px;

        .conversations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #eee;

          h2 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }

          .conversation-count {
            background: #D97757;
            color: white;
            border-radius: 12px;
            padding: 2px 8px;
            font-size: 12px;
            font-weight: 600;
          }
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 8px;

          &::-webkit-scrollbar {
            width: 8px;
          }

          &::-webkit-scrollbar-track {
            background: #f5f5f5;
          }

          &::-webkit-scrollbar-thumb {
            background: #bbb;
            border-radius: 4px;

            &:hover {
              background: #888;
            }
          }
        }

        .conversation-item {
          display: flex;
          gap: 12px;
          padding: 12px;
          margin: 6px 0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          border-left: 3px solid transparent;

          &:hover {
            background-color: #f8f8f8;
            transform: translateX(2px);
          }

          &.active {
            background-color: #e3f2fd;
            border-left: 3px solid #D97757;
            box-shadow: 0 2px 8px rgba(0, 123, 255, 0.15);
          }

          .conversation-avatar {
            width: 44px;
            height: 44px;
            border-radius: 50%;
            background: #D97757;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 16px;
            flex-shrink: 0;
            box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
          }

          .conversation-info {
            flex: 1;
            min-width: 0;

            h3 {
              margin: 0;
              font-size: 15px;
              font-weight: 600;
              color: #222;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            p {
              margin: 4px 0 0 0;
              font-size: 12px;
              color: #888;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          .delete-conversation-btn {
            background: white;
            border: 2px solid #D97757;
            color: #D97757;
            cursor: pointer;
            font-size: 18px;
            padding: 6px;
            border-radius: 50%;
            opacity: 0.8;
            transition: opacity 0.2s;
            flex-shrink: 0;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .delete-conversation-btn:hover {
            opacity: 1;
          }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #999;
          text-align: center;
          padding: 20px;

          p {
            margin: 0;
            font-weight: 500;
          }

          small {
            font-size: 12px;
            margin-top: 4px;
          }
        }
      }

      .chat-panel {
        flex: 1;
        background: white;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-width: 0;
        min-height: 0;
        border-radius: 0 5px 5px 0;

        .empty-chat-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #999;
          text-align: center;

          .empty-icon {
            font-size: 64px;
            margin-bottom: 16px;
            opacity: 0.5;
          }

          h2 {
            margin: 0 0 8px 0;
            font-size: 18px;
          }

          p {
            margin: 0 0 24px 0;
            color: #bbb;
          }

          .new-chat-btn {
            padding: 10px 20px;
            background-color: #D97757;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;

            &:hover {
              background-color: #c25a47;
            }
          }
        }
      }

      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;

        .modal-content {
          background: white;
          border-radius: 8px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          border: 3px solid #D97757;

          h2 {
            margin: 0 0 16px 0;
            font-size: 20px;
            font-weight: 600;
          }

          .search-input {
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 14px;
            margin-bottom: 16px;

            &:focus {
              outline: none;
              border-color: #007bff;
              box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
            }
          }

          .search-results {
            flex: 1;
            overflow-y: auto;
            margin-bottom: 16px;
            border: 1px solid #eee;
            border-radius: 4px;

            &::-webkit-scrollbar {
              width: 6px;
            }

            &::-webkit-scrollbar-track {
              background: #f1f1f1;
            }

            &::-webkit-scrollbar-thumb {
              background: #ccc;
              border-radius: 3px;
            }

            .user-result {
              display: flex;
              gap: 12px;
              padding: 12px;
              border-bottom: 1px solid #eee;
              cursor: pointer;
              transition: background-color 0.2s;

              &:hover {
                background-color: #f8f9fa;
              }

              &:last-child {
                border-bottom: none;
              }

              .user-avatar {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #D97757;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: 600;
                flex-shrink: 0;
              }

              h4 {
                margin: 0;
                font-size: 14px;
                font-weight: 600;
              }

              p {
                margin: 4px 0 0 0;
                font-size: 12px;
                color: #999;
              }
            }

            .empty-results {
              padding: 24px;
              text-align: center;
              color: #999;

              p {
                margin: 0;
              }
            }
          }

          .cancel-btn {
            padding: 10px 16px;
            background: #D97757;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 500;
            color: white;

            &:hover {
              background: #c25a47;
            }
          }
        }
      }
    `,
  ],
})
export class SocialComponent implements OnInit, OnDestroy {
  conversations: Conversation[] = [];
  selectedConversation: Conversation | null = null;
  currentUserId: string = '';
  showNewChatModal: boolean = false;
  searchQuery: string = '';
  filteredUsers: any[] = [];
  allUsers: any[] = [];

  constructor(
    private messagingService: MessagingService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
    private envService: EnvironmentService
  ) {}

  async ngOnInit() {
    this.currentUserId = this.authService.getUser()?.sub || '';

    // Load conversations
    await this.loadConversations();

    // Load all users for search
    await this.loadAllUsers();
  }

  async loadConversations() {
    try {
      const conversations = await this.messagingService.loadConversations();
      this.conversations = conversations;
      this.cdr.markForCheck();
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }

  async loadAllUsers() {
    try {
      // Fetch users from backend
      const response = await fetch(
        `${this.envService.getAPI_URL()}/api/user`,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        this.allUsers = data.users || [];
        this.cdr.markForCheck();
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  }

  getOtherParticipantName(conversation: Conversation): string {
    if (!conversation) return '';

    const otherParticipantId =
      conversation.participant1Id === this.currentUserId
        ? conversation.participant2Id
        : conversation.participant1Id;

    if (conversation.participant1Id === otherParticipantId) {
      return conversation.participant1?.username || 'Unknown';
    }
    return conversation.participant2?.username || 'Unknown';
  }



  selectConversation(conversation: Conversation) {
    this.selectedConversation = conversation;
    this.cdr.markForCheck();
  }

  openNewChat() {
    this.showNewChatModal = true;
    this.cdr.markForCheck();
  }

  closeNewChat() {
    this.showNewChatModal = false;
    this.searchQuery = '';
    this.filteredUsers = [];
    this.cdr.markForCheck();
  }

  async deleteConversation(event: Event, conversationId: string) {
    event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this conversation?')) {
      const success = await this.messagingService.deleteConversation(conversationId);
      if (success) {
        console.log('Conversation deleted successfully');
        this.cdr.markForCheck();
      } else {
        alert('Failed to delete conversation');
      }
    }
  }

  async startChatWithUser(user: any) {
    try {
      const conversation = await this.messagingService.getOrCreateConversation(
        user.id
      );

      if (conversation) {
        this.selectedConversation = conversation as Conversation;
        this.closeNewChat();
        this.cdr.markForCheck();

        // Reload conversations to include the new one
        await this.loadConversations();
      }
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  }

  // Filter users based on search query
  onSearchChange(event: any) {
    const value = event.target?.value || '';
    this.searchQuery = value;
    if (!this.searchQuery.trim()) {
      this.filteredUsers = [];
      return;
    }

    this.filteredUsers = this.allUsers.filter(
      (user) =>
        user.username
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase()) && user.id !== this.currentUserId
    );
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.messagingService.unsubscribeFromMessages();
  }
}
