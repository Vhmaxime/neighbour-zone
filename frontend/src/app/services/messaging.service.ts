import { Injectable } from '@angular/core';
import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { BehaviorSubject, Observable } from 'rxjs';
import { EnvironmentService } from './environment.service';
import { AuthService } from './auth';

interface Message {
  id: string;
  senderId: string;
  conversationId: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  participant1?: { id: string; username: string };
  participant2?: { id: string; username: string };
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private supabase;

  private messagesSubject = new BehaviorSubject<Message[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private currentConversationId: string = '';
  private realtimeChannel: RealtimeChannel | null = null;

  constructor(private envService: EnvironmentService, private authService: AuthService) {
    this.supabase = createClient(
      this.envService.getSUPABASE_URL(),
      this.envService.getSUPABASE_ANON_KEY()
    );
  }

  /**
   * Get all messages for a conversation (server-side fetched)
   */
  async loadMessages(conversationId: string): Promise<Message[]> {
    try {
      const url = `${this.envService.getAPI_URL()}/api/messages/${conversationId}`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load messages: ${response.statusText}`);
      }

      const data = await response.json();
      const messages = data.messages || [];
      this.messagesSubject.next(messages);
      return messages;
    } catch (error) {
      console.error('Error loading messages:', error);
      return [];
    }
  }

  /**
   * Send a message via backend API
   */
  async sendMessage(conversationId: string, content: string): Promise<Message | null> {
    try {
      const response = await fetch(
        `${this.envService.getAPI_URL()}/api/messages/${conversationId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
          body: JSON.stringify({ message: content }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      const message = await response.json();
      
      // Add to local state
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, message]);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.envService.getAPI_URL()}/api/messages/${messageId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete message: ${response.statusText}`);
      }

      // Remove from local state
      const currentMessages = this.messagesSubject.value;
      const updatedMessages = currentMessages.filter(m => m.id !== messageId);
      this.messagesSubject.next(updatedMessages);

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.envService.getAPI_URL()}/api/messages/${messageId}/read`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to mark as read: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  /**
   * Subscribe to real-time message updates via Supabase
   */
  subscribeToMessages(conversationId: string): void {
    this.currentConversationId = conversationId;

    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
    }

    // Subscribe to broadcast events from backend
    this.realtimeChannel = this.supabase
      .channel(`conversation:${conversationId}`)
      .on('broadcast', { event: 'new_message' }, (payload: any) => {
        const newMessage = payload.payload?.message as Message;
        if (newMessage) {
          const currentMessages = this.messagesSubject.value;
          const isDuplicate = currentMessages.some(m => m.id === newMessage.id);
          if (!isDuplicate) {
            this.messagesSubject.next([...currentMessages, newMessage]);
          }
        }
      })
      .on('broadcast', { event: 'message_deleted' }, (payload: any) => {
        const messageId = payload.payload?.messageId;
        if (messageId) {
          const currentMessages = this.messagesSubject.value;
          const updatedMessages = currentMessages.filter(m => m.id !== messageId);
          this.messagesSubject.next(updatedMessages);
        }
      })
      .subscribe();
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribeFromMessages(): void {
    if (this.realtimeChannel) {
      this.supabase.removeChannel(this.realtimeChannel);
      this.realtimeChannel = null;
    }
  }

  /**
   * Get or create conversation with another user
   */
  async getOrCreateConversation(otherUserId: string): Promise<Conversation | null> {
    try {
      const response = await fetch(
        `${this.envService.getAPI_URL()}/api/conversation`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
          body: JSON.stringify({ participantId: otherUserId }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create conversation: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform backend response to match Conversation interface
      const conversation: Conversation = {
        id: data.id,
        participant1Id: data.participant1?.id || data.participant1Id,
        participant2Id: data.participant2?.id || data.participant2Id,
        participant1: data.participant1,
        participant2: data.participant2,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      
      return conversation;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  /**
   * Get all conversations for authenticated user
   */
  async loadConversations(): Promise<Conversation[]> {
    try {
      const response = await fetch(
        `${this.envService.getAPI_URL()}/api/conversation`,
        {
          headers: {
            Authorization: `Bearer ${this.authService.getToken()}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to load conversations: ${response.statusText}`);
      }

      const data = await response.json();
      const conversations = (data.conversations || []).map((conv: any) => ({
        id: conv.id,
        participant1Id: conv.participant1?.id || conv.participant1Id,
        participant2Id: conv.participant2?.id || conv.participant2Id,
        participant1: conv.participant1,
        participant2: conv.participant2,
        createdAt: conv.createdAt || new Date().toISOString(),
      }));
      
      this.conversationsSubject.next(conversations);
      return conversations;
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    }
  }

  /**
   * Delete a conversation for the current user
   */
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const url = `${this.envService.getAPI_URL()}/api/conversation/${conversationId}`;
      console.log('Deleting conversation:', conversationId, 'URL:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.authService.getToken()}`,
        },
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Delete failed:', errorData);
        throw new Error(`Failed to delete conversation: ${response.statusText}`);
      }

      // Remove from local state
      const currentConversations = this.conversationsSubject.value;
      const updated = currentConversations.filter(c => c.id !== conversationId);
      this.conversationsSubject.next(updated);

      console.log('Conversation deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }
}
