import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {map, Observable, of} from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: { main: string; description: string; icon: string }[];  // ajouté main ici
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '91ce8357749464099b4d6b168122384d'; //
  private apiUrl = '/weather-api/data/2.5/weather';
  private cacheKey = 'cachedWeather';

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<WeatherData | null> {
    const cacheKey = `weather_${city.toLowerCase()}`; // Clé de cache unique par ville
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const now = Date.now();
        const cacheDuration = 30 * 60 * 1000; // 30 minutes

        if (now - cachedData.timestamp < cacheDuration) {
          return of(cachedData.data); // Retourne le cache valide
        }
      } catch (e) {
        console.warn('Cache météo invalide, suppression…');
        localStorage.removeItem(cacheKey);
      }
    }

    // Requête API si pas de cache ou expiré
    const url = `${this.apiUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=fr`;

    return this.http.get<WeatherData>(url).pipe(
      tap(data => {
        localStorage.setItem(cacheKey, JSON.stringify({
          timestamp: Date.now(),
          data
        }));
      }),
      catchError(err => {
        console.error('Erreur météo :', err);
        return of(null);
      })
    );
  }
  getWeatherDescriptionLogique(city: string): Observable<string> {
    return this.getWeather(city).pipe(
      map(data => {
        if (!data || !data.weather || !data.weather[0]) return 'Météo non disponible';

        const temp = data.main.temp;
        const description = data.weather[0].description;  // exemple : "partiellement nuageux"
        const main = data.weather[0].main.toLowerCase();

        let ressenti = '';

        // Déterminer le ressenti thermique
        if (temp >= 35) {
          ressenti = 'canicule';
        } else if (temp >= 30) {
          ressenti = 'très chaud';
        } else if (temp >= 25) {
          ressenti = 'chaud';
        } else if (temp >= 18) {
          ressenti = 'doux';
        } else if (temp >= 10) {
          ressenti = 'frais';
        } else {
          ressenti = 'froid';
        }

        // Formulation logique
        if (main.includes('rain') || main.includes('drizzle') || main.includes('thunderstorm')) {
          return `Pluie avec un temps ${ressenti}`;
        }

        if (main.includes('clear')) {
          return `Ciel dégagé et temps ${ressenti}`;
        }

        if (main.includes('cloud')) {
          return `Temps nuageux et ${ressenti}`;
        }

        return `${description} avec un temps ${ressenti}`;
      }),
      catchError(err => {
        console.error('Erreur lors de la description météo logique :', err);
        return of('Météo non disponible');
      })
    );
  }

  getWeatherCondition(city: string): Observable<string> {
    return this.getWeather(city).pipe(
      map(data => {
        if (!data) return 'standard';

        const main = data.weather[0].main.toLowerCase();
        const temp = data.main.temp;

        if (main.includes('rain') || main.includes('drizzle') || main.includes('thunderstorm')) {
          return 'pluvieux';
        } else if (temp >= 30) {
          return 'chaud';
        } else if (main.includes('clear')) {
          return 'ensoleillé';
        } else if (main.includes('clouds')) {
          return 'nuageux';
        } else {
          return 'standard';
        }
      }),
      catchError(err => {
        console.error('Erreur condition météo :', err);
        return of('standard');
      })
    );
  }

}
