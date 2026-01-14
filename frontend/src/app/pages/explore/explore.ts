import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreSearch } from '../../components/explore-search/explore-search';
import { FriendList } from '../../components/friend-list/friend-list';

@Component({
  selector: 'app-explore',
  imports: [CommonModule, ExploreSearch, FriendList],
  templateUrl: './explore.html',
  styleUrl: './explore.css',
})
export class Explore {}
