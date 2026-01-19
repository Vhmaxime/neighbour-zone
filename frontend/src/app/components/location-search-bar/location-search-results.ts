import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NominatimLocation } from '../../types/nominatom-types';

@Component({
  selector: 'app-location-search-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './location-search-results.html',
  styleUrl: './location-search-results.css',
})
export class LocationSearchResults {
  // Input: Receives the list of locations from the parent component
  public locations = input.required<NominatimLocation[]>();

  // Output: Emits the selected location back to the parent
  public locationSelected = output<NominatimLocation>();

  public onSelectLocation(location: NominatimLocation) {
    this.locationSelected.emit(location);
  }
}
