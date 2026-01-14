import { Component } from '@angular/core';
import { FriendList } from '../../components/friend-list/friend-list';

@Component({
  selector: 'app-friends',
  imports: [FriendList],
  templateUrl: './friends.html',
  styleUrl: './friends.css',
})
export class Friends {}
