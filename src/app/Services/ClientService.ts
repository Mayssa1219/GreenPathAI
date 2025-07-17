import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders, HttpParams} from '@angular/common/http';
import {map, Observable, of, throwError} from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import {Client} from '../models/client';
import {catchError} from 'rxjs/operators';

interface DecodedToken {
  sub: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = 'http://localhost:8081/api/clients';

  constructor(private http: HttpClient) {}

  // 🔐 Récupère le token depuis localStorage
  getToken(): string | null {
    if (!localStorage.getItem('token')) {
      console.warn('Aucun token trouvé dans localStorage');
      return null;
    }
    return localStorage.getItem('token');}

  // 🔓 Décode le token JWT
  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      console.log('Token récupéré depuis localStorage', jwtDecode(token));
      // attention : jwt_decode est importé en tant que namespace, la fonction est sous .default
      return (jwtDecode(token));
    } catch (error) {
      console.error('Erreur de décodage du token', error);
      return null;
    }
  }

  // 👤 Récupère les infos du client connecté
  getClientInfo(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`);
  }

  // 📤 Mise à jour du profil client
  updateClient(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getAuthHeaders());
  }

  // 🔒 Auth headers (optionnel)
  getAuthHeaders() {
    const token = this.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getLastActivity(clientId: number): Observable<string> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get<string>(
      `http://localhost:8081/historique/derniere-activite/${clientId}`,
      { headers, responseType: 'text' as 'json' } // important !
    );
  }


  getEcoScore(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ecoresponsable/${id}`, this.getAuthHeaders());
  }
}
