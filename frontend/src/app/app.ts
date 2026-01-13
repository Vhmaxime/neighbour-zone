import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar';
import { FriendList } from './components/friend-list/friend-list';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, FriendList],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent {}
