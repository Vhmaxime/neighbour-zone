import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  login(credentials: { email: string; password: string }) {
    return of({ token: 'abc' }); // example Observable
  }
}
