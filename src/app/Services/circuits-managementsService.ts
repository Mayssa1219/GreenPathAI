import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import {Circuit} from '../models/Circuit';
import {Avis} from './AvisService';
export interface CircuitCreation {
  titre: string;
  description: string;
  etapes: string;
  duree: number | undefined;
  tags: string[];
  status: string; // exemple: 'VALIDATED'
  photoUrl?: string; // facultatif, utile si tu veux stocker l'URL retournée après upload
}


export interface CircuitResponse {
  id: number;
  titre: string;
  description: string;
  // autres champs selon besoin
}
export interface Page<T> {
  content: T[];
  pageable: any;       // ou typer plus précisément
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;      // page courante (0-based)
  first: boolean;
  last: boolean;
  numberOfElements: number;
  // ajouter d'autres champs selon backend
}


@Injectable({
  providedIn: 'root'
})
export class CircuitsManagementService {

  private baseUrl = 'http://localhost:8081';

  constructor(private http: HttpClient) {}

  /** 🔐 Récupère le token depuis localStorage */
  private getToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  /** 🔐 Applique le header Authorization */
  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  /** 🔁 Gestion d'erreur générique */
  private handleError(err: HttpErrorResponse) {
    let msg = 'Erreur inconnue';
    if (err.error?.error) {
      msg = err.error.error;
    } else if (err.status === 0) {
      msg = 'Serveur injoignable';
    } else if (err.status >= 400) {
      msg = `Erreur ${err.status}`;
    }
    return throwError(() => new Error(msg));
  }

  // 🔍 Suggestions
  getSuggestions(clientId: number): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.baseUrl}/suggestions/${clientId}`);
  }

  getCircuitPersonnalise(clientId: number, localisation: string): Observable<Circuit> {
    return this.http.get<Circuit>(`${this.baseUrl}/suggestions/personnalise/${clientId}/${localisation}`);
  }

  // ➕ Ajouter circuit (auth)
  ajouterCircuitAvecPhoto(circuit: any, file: File): Observable<Circuit> {
    const formData = new FormData();

    // Convertir le circuit en JSON avec un Blob
    formData.append('request', new Blob(
      [JSON.stringify(circuit)],
      { type: 'application/json' }
    ));

    // Ajouter le fichier image
    formData.append('file', file);

    return this.http.post<Circuit>(
      `${this.baseUrl}/ajouter`,
      formData,
      {
        headers: this.getAuthHeaders() // Ne surtout pas ajouter 'Content-Type' ici
      }
    );
  }



  // 📤 Proposer circuit avec fichier (FormData)
  proposerCircuit(formData: FormData): Observable<Circuit> {
    return this.http.post<Circuit>(`${this.baseUrl}/proposer`, formData, {
      headers: this.getAuthHeaders()
    });
  }

  proposerCircuitParGuide(circuit: any): Observable<Circuit> {
    return this.http.post<Circuit>(`${this.baseUrl}/proposer-par-guide`, circuit, {
      headers: this.getAuthHeaders()
    });
  }

  // 📄 Lire circuits
  getAllCircuits(): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.baseUrl}/circuits`, {
      headers: this.getAuthHeaders()
    });
  }

  getCircuitsPourClient(): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.baseUrl}/circuits/client`);
  }

  countValidatedCircuits(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/circuits/client/count`);
  }

  getCircuitsAdaptesMeteo(condition: string): Observable<CircuitResponse[]> {
    return this.http.get<CircuitResponse[]>(`${this.baseUrl}/circuits/meteo/${condition}`);
  }

  // ✅ Statut circuit
  validateCircuit(circuitId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/circuits/${circuitId}/validate`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  rejectCircuit(circuitId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/circuits/${circuitId}/reject`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // 🔍 Recherche circuits
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
  ): Observable<any> {
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

    if (selectedTags.length > 0) {
      selectedTags.forEach(tag => {
        params = params = params.append('tags', tag);
      });
    }

    const backendPage = page > 0 ? page - 1 : 0;
    params = params.set('page', backendPage.toString());

    if (pageSize) {
      params = params.set('size', pageSize.toString());
    }

    const token = localStorage.getItem('adminToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    return this.http.get<Page<Circuit>>(`${this.baseUrl}/search`, {
      params,
      headers
      // ne pas mettre responseType ou mettre 'json' (par défaut)
    });

  }


  // 🆔 Détails circuit
  getCircuitById(id: number): Observable<Circuit> {
    return this.http.get<Circuit>(`${this.baseUrl}/circuits/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✏️ Mise à jour circuit
  updateCircuit(id: number, circuit: Circuit): Observable<Circuit> {
    return this.http.put<Circuit>(`${this.baseUrl}/circuits/${id}`, circuit, {
      headers: this.getAuthHeaders()
    });
  }

  // ❌ Suppression
  deleteCircuit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/circuits/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  // 📊 Statistiques
  getCircuitStatistics(): Observable<Record<string, number>> {
    return this.http.get<Record<string, number>>(`${this.baseUrl}/circuits/statistics`, {
      headers: this.getAuthHeaders()
    });
  }

  // 📚 Circuits d’un guide
  getCircuitsByGuide(guideId: number): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.baseUrl}/circuits/guide/${guideId}`, {
      headers: this.getAuthHeaders()
    });
  }


  // 📸 Upload photo
  uploadCircuitPhoto(id: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<string>(`${this.baseUrl}/circuits/${id}/photo`, formData, {
      headers: this.getAuthHeaders()
    });
  }


  getAvisByCircuit(circuitId: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.baseUrl}/avis/circuit/${circuitId}`, {
      headers: this.getAuthHeaders()
    });
  }
}
