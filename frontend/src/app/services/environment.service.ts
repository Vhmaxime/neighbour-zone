import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  private readonly config = {
    supabaseUrl: (import.meta as any).env?.VITE_SUPABASE_URL || 'https://toseqhnbogjrvseaciuq.supabase.co',
    supabaseAnonKey: (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvc2VxaG5ib2dqcnZzZWFjaXVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc2OTA4NjUsImV4cCI6MjA4MzI2Njg2NX0.lKv7Z4t7Kx_pcwAdYMk0ucdKjERE9cbc0vmKpMJd4FU',
    apiUrl: (import.meta as any).env?.VITE_API_URL || 'http://localhost:3080'
  };

  getSUPABASE_URL(): string {
    return this.config.supabaseUrl;
  }

  getSUPABASE_ANON_KEY(): string {
    return this.config.supabaseAnonKey;
  }

  getAPI_URL(): string {
    return this.config.apiUrl;
  }
}
