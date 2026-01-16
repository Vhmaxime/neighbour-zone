import { Component, inject} from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [],
  templateUrl: './back-button.html',
  styleUrl: './back-button.css',
})
export class BackButton {
  private location = inject(Location);

  goBack(): void {
    this.location.back();
  }
}
