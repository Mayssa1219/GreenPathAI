// src/app/services/home.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Circuit {
  id: number;
  titre: string;
  description: string;
  niveauEcoresponsabilite: number;
  photoUrl: string;
}

export interface Avis {
  id: number;
  note: number;
  commentaire: string;
  dateAvis: string;
  clientName?: string;
  circuitId?: number;
  clientPhotoUrl?: string;
}
export interface FunFactsDto {
  clientsSatisfaits: number;
  circuitsExceptionnels: number;
  partenaires: number;
}


@Injectable({
  providedIn: 'root',
})
export class HomeService {
  private apiUrl = 'http://localhost:8081/api/home';

  constructor(private http: HttpClient) {}

  getRecentCircuits(): Observable<Circuit[]> {
    return this.http.get<Circuit[]>(`${this.apiUrl}/recent-circuits`);
  }

  getRecentAvis(): Observable<Avis[]> {
    return this.http.get<Avis[]>(`${this.apiUrl}/recent-avis`);
  }
  getFunFacts(): Observable<FunFactsDto> {
    return this.http.get<FunFactsDto>(`${this.apiUrl}/fun-facts`);
  }
}
