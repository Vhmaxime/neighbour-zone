import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, firstValueFrom } from 'rxjs';
import { NominatimService } from '../../services/nominatim';
import { Router } from '@angular/router';
import { NominatimLocation } from '../../types/nominatom-types';

@Component({
  selector: 'app-location-search-bar',
  imports: [ReactiveFormsModule],
  templateUrl: './location-search-bar.html',
  styleUrl: './location-search-bar.css',
})
export class LocationSearchBar {
  private nominatimService = inject(NominatimService);
  public searchControl = new FormControl('');
  public isSearching = signal(false);
  public searchResults = signal<NominatimLocation[] | null>(null);

  public ngOnInit() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe((query) => (query ? this.performSearch(query) : undefined));
  }

  private performSearch(query: string) {
    if (this.isSearching()) {
      return;
    }
    this.isSearching.set(true);
    firstValueFrom(this.nominatimService.searchLocation(query))
      .then((results) => {
        this.searchResults.set(results);
      })
      .finally(() => {
        this.isSearching.set(false);
      });
  }

  public onSelectLocation(location: NominatimLocation) {
    console.log('Selected location:', location);
  }
}
