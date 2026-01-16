import {
  Component,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as L from 'leaflet';

export interface MapEvent {
  id: string;
  title: string;
  placeDisplayName: string;
  lat: string;
  lon: string;
}

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {

  @Input() events: MapEvent[] = [];

  private map!: L.Map;
  private markers: L.Layer[] = [];
  private resizeObserver: ResizeObserver | null = null;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initMap();
      this.renderMarkers();
      this.initResizeObserver();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && this.map) {
      this.renderMarkers();
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initResizeObserver(): void {
    this.resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        if (this.map) {
          this.map.invalidateSize();
        }
      });
    });
    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  private initMap(): void {
    this.map = L.map('map', {
      center: [50.965, 5.500],
      zoom: 12,
      zoomControl: false
    });

    L.control.zoom({
      position: 'topright'
    }).addTo(this.map);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private renderMarkers(): void {
    this.clearMarkers();

    for (const event of this.events) {
      const lat = Number(event.lat);
      const lon = Number(event.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lon)) continue;

      const marker = L.circleMarker([lat, lon], {
        radius: 7,
        fillColor: '#D97757',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      })
        .addTo(this.map)
        .bindPopup(`
          <div class="event-popup">
            <h3>${event.title}</h3>
            <p class="place">${event.placeDisplayName}</p>
          </div>
        `);

      this.markers.push(marker);
    }
  }

  private clearMarkers(): void {
    if (!this.map) return;
    for (const marker of this.markers) {
      this.map.removeLayer(marker);
    }
    this.markers = [];
  }
}
