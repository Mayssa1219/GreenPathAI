import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Historique {
  id: number;
  clientId: number;
  circuitId: number;
  date: string;
  typeActivite: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class HistoriqueService {

  private baseUrl = 'http://localhost:8081/historique';

  constructor(private http: HttpClient) { }

  // 🔹 Récupérer la dernière activité
  getDerniereActivite(clientId: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/derniere-activite/${clientId}`, { responseType: 'text' });
  }

  // 🔹 Récupérer tout l’historique d’un client
  getHistoriqueByClient(clientId: number): Observable<Historique[]> {
    return this.http.get<Historique[]>(`${this.baseUrl}/client/${clientId}`);
  }

  // 🔹 Vider l’historique d’un client
  viderHistoriqueClient(clientId: number): Observable<void> {
    const token = localStorage.getItem('token'); // ou autre stockage
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return this.http.delete<void>(`${this.baseUrl}/client/${clientId}`, { headers });
  }
}
