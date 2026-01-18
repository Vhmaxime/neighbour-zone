import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-component',
  imports: [],
  templateUrl: './loading-component.html',
  styleUrl: './loading-component.css',
})
export class LoadingComponent {
  public message = input<string>();
}
