import { Component, inject, signal, output, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, firstValueFrom } from 'rxjs';
import { NominatimService } from '../../services/nominatim';
import { Router } from '@angular/router';
import { NominatimLocation } from '../../types/nominatom-types';

@Component({
  selector: 'app-location-search-results',
  imports: [ReactiveFormsModule],
  templateUrl: './location-search-results.html',
  styleUrl: './location-search-results.css',
})
export class LocationSearchResults {
  private nominatimService = inject(NominatimService);

  public isSearching = signal(false);
  public searchResults = signal<NominatimLocation[] | null>(null);
  public selectedLocation = output<NominatimLocation>();
  public placeDisplayName = output<string>();
  public searchTerm = input.required<string>();

  public performSearch() {
    if (this.isSearching()) {
      return;
    }
    const searchTerm = this.searchTerm();

    this.isSearching.set(true);
    firstValueFrom(this.nominatimService.searchLocation(searchTerm))
      .then((results) => {
        this.searchResults.set(results);
      })
      .finally(() => {
        this.isSearching.set(false);
      });
  }

  public onSelectLocation(location: NominatimLocation) {
    this.searchResults.set(null);
    this.selectedLocation.emit(location);
    this.placeDisplayName.emit(location.display_name);
  }
}
