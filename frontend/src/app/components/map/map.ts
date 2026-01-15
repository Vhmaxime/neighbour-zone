import {
  Component,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import * as L from 'leaflet';

export interface MapEvent {
  id: string;
  title: string;
  placeDisplayName: string;
  lat: string; // jouw huidige shape
  lon: string; // jouw huidige shape
}

@Component({
  selector: 'app-map',
  standalone: true,
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class MapComponent implements AfterViewInit, OnChanges {

  @Input() events: MapEvent[] = [];

  private map!: L.Map;
  private markers: L.Marker[] = [];

  ngAfterViewInit(): void {
    this.initMap();
    this.renderMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['events'] && this.map) {
      this.renderMarkers();
    }
  }

  private initMap(): void {
    this.map = L.map('map', { center: [50.965, 5.500], zoom: 12 });

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

      const marker = L.marker([lat, lon])
        .addTo(this.map)
        .bindPopup(`<strong>${event.title}</strong><br/>${event.placeDisplayName}`);

      this.markers.push(marker);
    }
  }

  private clearMarkers(): void {
    for (const marker of this.markers) {
      this.map.removeLayer(marker);
    }
    this.markers = [];
  }
}
