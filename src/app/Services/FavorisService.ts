import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Circuit} from '../models/Circuit';

@Injectable({
  providedIn: 'root'
})
export class FavorisService {
  private baseUrl = 'http://localhost:8081/favoris'; // base URL de ton backend

  constructor(private http: HttpClient) {}

  // Récupérer les favoris du client
  getFavoris(clientId: number): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.baseUrl}/${clientId}`);
  }

  // Ajouter un favori
  ajouterFavori(clientId: number, circuitId: number): Observable<void> {
    const params = new HttpParams()
      .set('clientId', clientId.toString())
      .set('circuitId', circuitId.toString());

    return this.http.post<void>(`${this.baseUrl}/ajouter`, null, { params });
  }

  // Supprimer un favori
  supprimerFavori(clientId: number, circuitId: number): Observable<void> {
    const params = new HttpParams()
      .set('clientId', clientId.toString())
      .set('circuitId', circuitId.toString());

    return this.http.delete<void>(`${this.baseUrl}/supprimer`, { params });
  }

  // Compter le nombre de favoris
  countFavoris(clientId: number): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/${clientId}/count`);
  }
}
