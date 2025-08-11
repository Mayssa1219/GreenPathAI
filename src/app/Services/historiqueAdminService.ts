import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Historique {
  id: number;
  typeActivite: string;
  description: string;
  dateFormatted: string;
  clientFullName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoriqueAdminService {
  private apiUrl = 'http://localhost:8081/historique';

  constructor(private http: HttpClient) {}

  // 📌 Récupérer le dernier historique d’un client
  getLastActivity(clientId: number): Observable<string> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/derniere-activite/${clientId}`, {
      headers,
      responseType: 'text'
    });
  }

  getAllHistoriques(): Observable<Historique[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Historique[]>(`${this.apiUrl}/all`, { headers });
  }

  // 📌 Récupérer l’historique complet d’un client
  getHistoriqueByClient(clientId: number): Observable<Historique[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Historique[]>(`${this.apiUrl}/client/${clientId}`, { headers });
  }

  // 📌 Supprimer l’historique d’un client
  deleteHistoriqueByClient(clientId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/client/${clientId}`, { headers });
  }

  // 🔒 Gestion du token d’authentification
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
