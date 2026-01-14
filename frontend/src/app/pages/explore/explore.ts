import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExploreSearch } from '../../components/explore-search/explore-search';

@Component({
  selector: 'app-explore',
  imports: [CommonModule, ExploreSearch],
  templateUrl: './explore.html',
  styleUrl: './explore.css',
})
export class Explore {

}
