import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Auth {
  private baseUrl: string = 'https://example.com/api';
  
  constructor(private http: HttpClient) {}

  register(payload: { name: string; email: string; password: string }): Observable<any> {
    return this.http.post('https://example.com/api/register', payload);
  }

  login(payload: { email: string; password: string }): Observable<any> {
    return this.http.post('https://example.com/api/login', payload);
  }

   resetPassword(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, { email });
  }

}


