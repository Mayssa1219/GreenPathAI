import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Circuit} from '../models/Circuit';


export interface CircuitResponse {
  content: Circuit[];
  totalPages: number;
  number: number;  // page actuelle (0-based)
  totalElements: number;
  size: number;
}

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
  searchCircuits(
    searchTerm: string,
    selectedTags: string[],
    filterGuide: string | null,
    minDuree: number | null,
    maxDuree: number | null,
    filterStatus: string | null,
    minEcoresp: number | null,
    maxEcoresp: number | null,
    page: number,
    pageSize?: number
  ): Observable<string> {
    let params = new HttpParams();

    if (searchTerm && searchTerm.trim() !== '') {
      params = params.set('keyword', searchTerm.trim());
    }

    if (filterGuide && filterGuide !== 'all' && filterGuide !== '') {
      params = params.set('withGuide', filterGuide);
    }

    if (filterStatus && filterStatus.toUpperCase() !== 'ALL' && filterStatus !== '') {
      params = params.set('status', filterStatus.toUpperCase());
    }

    if (minDuree !== null) {
      params = params.set('minDuree', minDuree.toString());
    }

    if (maxDuree !== null) {
      params = params.set('maxDuree', maxDuree.toString());
    }

    if (minEcoresp !== null) {
      params = params.set('minEcoresp', minEcoresp.toString());
    }

    if (maxEcoresp !== null) {
      params = params.set('maxEcoresp', maxEcoresp.toString());
    }

    // Envoie chaque tag comme un paramètre 'tags' séparé (ex: ?tags=tag1&tags=tag2)
    if (selectedTags.length > 0) {
      selectedTags.forEach(tag => {
        params = params.append('tags', tag);
      });
    }

    // Corrige la page : backend attend page >= 0, Angular page peut commencer à 1
    const backendPage = page > 0 ? page - 1 : 0;
    params = params.set('page', backendPage.toString());

    if (pageSize) {
      params = params.set('size', pageSize.toString());
    }

    return this.http.get(`${this.apiUrl}/search`, { params, responseType: 'text' });
  }
}
