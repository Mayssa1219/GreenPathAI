// geocoding.service.ts
import { Injectable } from '@angular/core';

interface RawLocation {
  location: string;
}

interface Coord {
  lat: number;
  lng: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private cache = new Map<string, Coord>();
  private pending = new Map<string, Promise<Coord | null>>();

  async geocode(location: string): Promise<Coord | null> {
    if (!location) return null;
    const key = location.trim().toLowerCase();
    if (this.cache.has(key)) {
      return this.cache.get(key)!;
    }
    if (this.pending.has(key)) {
      return this.pending.get(key)!;
    }

    const promise = this.fetchNominatim(location);
    this.pending.set(key, promise);
    const result = await promise;
    this.pending.delete(key);
    if (result) {
      this.cache.set(key, result);
    }
    return result;
  }

  private async fetchNominatim(location: string): Promise<Coord | null> {
    const encoded = encodeURIComponent(location);
    const url = `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`;
    try {
      const resp = await fetch(url, {
        headers: { 'User-Agent': 'GreenPathAI-App/1.0' } // recommandé par Nominatim
      });
      if (!resp.ok) return null;
      const data = await resp.json();
      if (Array.isArray(data) && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
    } catch (e) {
      console.warn('Géocodage échoué pour', location, e);
    }
    return null;
  }
}
