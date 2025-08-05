import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import { CommonModule } from '@angular/common';

interface Location {
  lat: number;
  lng: number;
  label: string;
  type?: 'client' | 'guide' | 'platform';
}

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit, OnChanges {
  @Input() locations: Location[] = [];

  private map!: L.Map;
  private markersLayer: L.LayerGroup = L.layerGroup();

  ngOnInit(): void {
    this.map = L.map('map').setView([36.8, 10.18], 6); // Centre Tunisie

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markersLayer.addTo(this.map);
    this.addMarkers(); // premier passage au cas où locations déjà présentes
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['locations'] && !changes['locations'].firstChange) {
      this.addMarkers();
    }
  }

  private addMarkers(): void {
    if (!this.map) return;

    // Vider anciens marqueurs
    this.markersLayer.clearLayers();

    this.locations.forEach(loc => {
      if (typeof loc.lat !== 'number' || typeof loc.lng !== 'number') {
        console.warn('Localisation invalide ignorée', loc);
        return;
      }

      const marker = L.marker([loc.lat, loc.lng], {
        icon: this.getFaIcon(loc.type),
        title: loc.label
      }).addTo(this.markersLayer);

      marker.bindPopup(`<strong>${loc.label}</strong><br>Type: ${loc.type ?? 'Inconnu'}`);
    });

    // Si la carte était dans un container caché ou redimensionné
    this.map.invalidateSize();
  }

  getFaIcon(type?: string): L.DivIcon {
    let iconClass = '';
    let color = '';

    switch (type) {
      case 'client':
        iconClass = 'fa-user';
        color = '#3cb371';
        break;
      case 'guide':
        iconClass = 'fa-hiking';
        color = '#51a2e3';
        break;
      case 'platform':
        iconClass = 'fa-building';
        color = '#f39c12';
        break;
      default:
        iconClass = 'fa-map-marker-alt';
        color = '#999';
    }

    return L.divIcon({
      html: `<div class="custom-marker">
              <i class="fas ${iconClass}" style="font-size: 24px; color: ${color};"></i>
            </div>`,
      className: '',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });
  }
}
