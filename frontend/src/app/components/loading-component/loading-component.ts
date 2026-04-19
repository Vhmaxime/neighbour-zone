import { Component, input } from '@angular/core';

@Component({
  selector: 'app-loading-component',
  imports: [],
  templateUrl: './loading-component.html'
})
export class LoadingComponent {
  public message = input<string>();
}
