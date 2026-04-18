import { Component, ElementRef, input, OnDestroy, output, signal, ViewChild } from '@angular/core';
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
  @ViewChild('dragRoot', { static: true }) private dragRoot!: ElementRef<HTMLElement>;

  public readonly state = input.required<MapFilterState>();
  public readonly isOpen = input<boolean>(false);
  public readonly activeCount = input<number>(0);
  public readonly visibleCount = input<number>(0);
  public readonly totalCount = input<number>(0);
  public readonly dragOffset = signal({ x: 0, y: 0 });
  public readonly isDragging = signal(false);

  public readonly panelToggled = output<void>();
  public readonly stateChanged = output<MapFilterState>();
  public readonly resetClicked = output<void>();

  private dragStartPointer = { x: 0, y: 0 };
  private dragStartOffset = { x: 0, y: 0 };
  private dragBounds = {
    minX: Number.NEGATIVE_INFINITY,
    maxX: Number.POSITIVE_INFINITY,
    minY: Number.NEGATIVE_INFINITY,
    maxY: Number.POSITIVE_INFINITY,
  };
  private movedDuringDrag = false;
  private suppressNextToggleClick = false;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngOnDestroy(): void {
    this.detachDragListeners();
  }

  public startDrag(event: PointerEvent) {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    this.isDragging.set(true);
    this.movedDuringDrag = false;
    this.dragStartPointer = { x: event.clientX, y: event.clientY };
    this.dragStartOffset = this.dragOffset();
    this.dragBounds = this.calculateDragBounds();

    window.addEventListener('pointermove', this.onDragMove);
    window.addEventListener('pointerup', this.onDragEnd);
    window.addEventListener('pointercancel', this.onDragEnd);
  }

  public onToggleClick() {
    if (this.suppressNextToggleClick) {
      this.suppressNextToggleClick = false;
      return;
    }

    this.togglePanel();
  }

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

  private onDragMove = (event: PointerEvent) => {
    if (!this.isDragging()) {
      return;
    }

    const deltaX = event.clientX - this.dragStartPointer.x;
    const deltaY = event.clientY - this.dragStartPointer.y;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      this.movedDuringDrag = true;
    }

    const nextX = this.dragStartOffset.x + deltaX;
    const nextY = this.dragStartOffset.y + deltaY;

    this.dragOffset.set({
      x: this.clamp(nextX, this.dragBounds.minX, this.dragBounds.maxX),
      y: this.clamp(nextY, this.dragBounds.minY, this.dragBounds.maxY),
    });
  };

  private onDragEnd = () => {
    if (!this.isDragging()) {
      return;
    }

    this.isDragging.set(false);
    this.detachDragListeners();

    if (this.movedDuringDrag) {
      this.suppressNextToggleClick = true;
    }
  };

  private detachDragListeners() {
    window.removeEventListener('pointermove', this.onDragMove);
    window.removeEventListener('pointerup', this.onDragEnd);
    window.removeEventListener('pointercancel', this.onDragEnd);
  }

  private calculateDragBounds() {
    const draggableElement = this.dragRoot?.nativeElement ?? this.elementRef.nativeElement;
    const boundary = draggableElement.closest('[data-map-filter-boundary]') as HTMLElement | null;

    const boundaryRect = boundary?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      right: window.innerWidth,
      bottom: window.innerHeight,
    };
    const elementRect = draggableElement.getBoundingClientRect();

    let minX = this.dragStartOffset.x + (boundaryRect.left - elementRect.left);
    let maxX = this.dragStartOffset.x + (boundaryRect.right - elementRect.right);
    let minY = this.dragStartOffset.y + (boundaryRect.top - elementRect.top);
    let maxY = this.dragStartOffset.y + (boundaryRect.bottom - elementRect.bottom);

    if (minX > maxX) {
      minX = this.dragStartOffset.x;
      maxX = this.dragStartOffset.x;
    }

    if (minY > maxY) {
      minY = this.dragStartOffset.y;
      maxY = this.dragStartOffset.y;
    }

    return { minX, maxX, minY, maxY };
  }

  private clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }
}
