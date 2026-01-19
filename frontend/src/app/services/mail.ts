import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MailMessage {
  content: string;
  senderId: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant1: { id: string; username: string };
  participant2: { id: string; username: string };
  marketplaceItem?: { title: string };
  messages?: MailMessage[];
}

export interface Inbox {
  conversations: Conversation[];
  count: number;
}

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private http = inject(HttpClient);

  private apiUrl = 'https://neighbour-zone.vercel.app/api';

  getInbox(): Observable<Inbox> {
    return this.http.get<Inbox>(`${this.apiUrl}/conversation`);
  }

  getThread(id: string): Observable<Conversation> {
    return this.http.get<Conversation>(`${this.apiUrl}/conversation/${id}`);
  }

  sendReply(conversationId: string, message: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/conversation/${conversationId}/message`, {
      message,
    });
  }

  startConversation(participantId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/conversation`, { participantId });
  }
}
