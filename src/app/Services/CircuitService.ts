import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Circuit} from '../models/Circuit';

@Injectable({
  providedIn: 'root'
})
export class CircuitService {

  private apiUrl = 'http://localhost:8081'; // 🔁 adapte l'URL si besoin

  constructor(private http: HttpClient) {}

  // 🟢 Tous les circuits validés (interface client)
  getCircuitsPourClient(): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.apiUrl}/circuits/client`);
  }

  getCircuitsByMeteo(condition: string): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.apiUrl}/circuits/meteo/${condition}`);
  }
  // Dans CircuitService
  countCircuitsValides(): Observable<number> {
    return this.http.get<number>('http://localhost:8081/circuits/client/count');
  }


  // 🔎 Circuit personnalisé
  getCircuitPersonnalise(clientId: number, localisation: string): Observable<Circuit> {
    return this.http.get<Circuit>(`${this.apiUrl}/suggestions/personnalise/${clientId}/${localisation}`);
  }

  // ⭐ Ajouter un circuit aux favoris
  ajouterFavori(clientId: number, circuitId: number): Observable<void> {
    const params = new HttpParams()
      .set('clientId', clientId)
      .set('circuitId', circuitId);
    return this.http.post<void>(`${this.apiUrl}/favoris/ajouter`, null, { params });
  }

  // ❌ Supprimer un circuit des favoris
  supprimerFavori(clientId: number, circuitId: number): Observable<void> {
    const params = new HttpParams()
      .set('clientId', clientId)
      .set('circuitId', circuitId);
    return this.http.delete<void>(`${this.apiUrl}/favoris/supprimer`, { params });
  }

  // 📋 Récupérer les favoris d’un client
  getFavoris(clientId: number): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.apiUrl}/favoris/${clientId}`);
  }


  // 🧮 Compter les favoris
  countFavoris(clientId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/favoris/${clientId}/count`);
  }
}
