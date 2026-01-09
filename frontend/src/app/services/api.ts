import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Api {
  private readonly apiUrl = 'http://localhost:3000/api';
}
