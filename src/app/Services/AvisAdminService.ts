// src/app/services/avis-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AvisAdmin {
  id: number;
  client: string;
  circuit: string;
  note: number;
  commentaire: string;
  dateAvis: string;
}

@Injectable({
  providedIn: 'root'
})
export class AvisAdminService {
  private apiUrl = 'http://localhost:8081/avis'; // Ton backend

  constructor(private http: HttpClient) {}

  getAllAvis(): Observable<AvisAdmin[]> {
    return this.http.get<AvisAdmin[]>(`${this.apiUrl}/all`, {
      headers: this.getAuthHeaders()
    });
  }

  deleteAvis(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/supprimer/${id}`, {
      headers: this.getAuthHeaders()
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('adminToken');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}
