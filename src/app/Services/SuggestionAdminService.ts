import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ClientMinimal {
  id: number;
  nom?: string;
  email?: string;
}

export interface CircuitMinimal {
  id: number;
  titre?: string;
  duree?: number; // durée en heures par exemple
}

export interface SuggestionIA {
  id?: number;
  client: ClientMinimal;
  circuit: CircuitMinimal;
  score?: number;          // score de suggestion entre 0 et 1
  date?: string;           // ISO 8601 format string
}

export interface ClientMinimal {
  id: number;
  nom?: string;
  email?: string;
}

export interface CircuitMinimal {
  id: number;
  titre?: string;
  duree?: number; // durée en heures par exemple
}


@Injectable({
  providedIn: 'root'
})
export class SuggestionAdminIaService {

  private baseUrl = 'http://localhost:8081/suggestions';  // URL de ton API

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken') || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  countSuggestions(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`, { headers: this.getAuthHeaders() });
  }

  getAllSuggestions(): Observable<SuggestionIA[]> {
    return this.http.get<SuggestionIA[]>(this.baseUrl, { headers: this.getAuthHeaders() });
  }

  getSuggestionById(id: number): Observable<SuggestionIA> {
    return this.http.get<SuggestionIA>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createSuggestion(suggestion: SuggestionIA): Observable<SuggestionIA> {
    return this.http.post<SuggestionIA>(this.baseUrl, suggestion, { headers: this.getAuthHeaders() });
  }

  updateSuggestion(id: number, suggestion: SuggestionIA): Observable<SuggestionIA> {
    return this.http.put<SuggestionIA>(`${this.baseUrl}/${id}`, suggestion, { headers: this.getAuthHeaders() });
  }

  deleteSuggestion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
