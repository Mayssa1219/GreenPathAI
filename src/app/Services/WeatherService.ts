import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: { description: string; icon: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiKey = '91ce8357749464099b4d6b168122384d'; //
  private apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private cacheKey = 'cachedWeather';

  constructor(private http: HttpClient) {}

  getWeather(city: string): Observable<WeatherData | null> {
    const cacheKey = `weather_${city.toLowerCase()}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        const now = Date.now();
        const cacheDuration = 30 * 60 * 1000; // 30 minutes

        if (now - cachedData.timestamp < cacheDuration) {
          return of(cachedData.data);
        }
      } catch (e) {
        console.warn('Cache météo invalide, suppression…');
        localStorage.removeItem(cacheKey);
      }
    }

    const url = `/weather-api/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=fr`;

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


}
