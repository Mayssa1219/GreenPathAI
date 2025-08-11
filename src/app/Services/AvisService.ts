// src/app/services/avis.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Avis {
  circuitId: number;
  note: number;
  commentaire: string;
}

export interface AvisRequest {
  clientId: number;
  circuitId: number;
  note: number;
  commentaire: string;
}

@Injectable({ providedIn: 'root' })
export class AvisService {
  private apiUrl = 'http://localhost:8081/avis'; // À adapter selon ton backend

  constructor(private http: HttpClient) {}

  ajouterAvis(avis: AvisRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/ajouter`, avis);
  }

  getAvisByUser(clientId: number): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.apiUrl}/client/${clientId}`);
  }



}
