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
  templateUrl: './social.html',
  styleUrl: './social.css',
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
    private envService: EnvironmentService,
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
      const response = await fetch(`${this.envService.getAPI_URL()}/user`, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      });

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
      const conversation = await this.messagingService.getOrCreateConversation(user.id);

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
        user.username.toLowerCase().includes(this.searchQuery.toLowerCase()) &&
        user.id !== this.currentUserId,
    );
    this.cdr.markForCheck();
  }

  ngOnDestroy() {
    this.messagingService.unsubscribeFromMessages();
  }
}
