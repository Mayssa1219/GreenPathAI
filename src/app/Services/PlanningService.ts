import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReservationRequest {
  clientId: number;
  circuitId: number;
  dateReservation?: string; // format 'YYYY-MM-DD'
}

export interface EvenementLocal {
  id: number;
  titre: string;
  description?: string;
  dateDebut: string;  // ISO date string
  dateFin?: string;   // ISO date string
  localisation?: string;
}

export interface PlanningDto {
  prochaineReservation: string;
  evenementLocal: EvenementLocal | null; // objet ou null
}

export interface EvenementLocalRequest {
  titre: string;
  description?: string;
  dateDebut: string;
  dateFin?: string;
  localisation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlanningService {
  private apiUrl = 'http://localhost:8081/reservations'; // adapte selon ton backend

  constructor(private http: HttpClient) {}

  reserverCircuit(request: ReservationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reserver`, request);
  }

  planifierReservation(request: ReservationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/planifier`, request);
  }

  getPlanning(clientId: number): Observable<PlanningDto> {
    return this.http.get<PlanningDto>(`${this.apiUrl}/planning/${clientId}`);
  }

  ajouterEvenementLocal(request: EvenementLocalRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/evenement-local`, request);
  }

  getEvenementById(id: number): Observable<EvenementLocal> {
    return this.http.get<EvenementLocal>(`${this.apiUrl}/evenement-local/${id}`);
  }
}
