import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NominatimLocation } from '../../types/nominatom-types';

@Component({
  selector: 'app-location-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-search-results.html'
})
export class LocationSearchResults {
  public locations = input.required<NominatimLocation[]>();
  public locationSelected = output<NominatimLocation>();

  public onSelectLocation(location: NominatimLocation) {
    this.locationSelected.emit(location);
  }
}
