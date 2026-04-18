import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface MapFilterState {
  upcoming: boolean;
  today: boolean;
  thisWeek: boolean;
  liked: boolean;
}

@Component({
  selector: 'app-map-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-filters.html',
  styleUrl: './map-filters.css',
})
export class MapFiltersComponent {
  public readonly state = input.required<MapFilterState>();
  public readonly isOpen = input<boolean>(false);
  public readonly activeCount = input<number>(0);
  public readonly visibleCount = input<number>(0);
  public readonly totalCount = input<number>(0);

  public readonly panelToggled = output<void>();
  public readonly stateChanged = output<MapFilterState>();
  public readonly resetClicked = output<void>();

  public togglePanel() {
    this.panelToggled.emit();
  }

  public toggleFilter(filterKey: keyof MapFilterState) {
    const current = this.state();
    this.stateChanged.emit({
      ...current,
      [filterKey]: !current[filterKey],
    });
  }

  public resetFilters() {
    this.resetClicked.emit();
  }
}
