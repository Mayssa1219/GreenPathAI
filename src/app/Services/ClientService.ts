import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { catchError } from 'rxjs/operators';
import { Client } from '../models/client';

interface DecodedToken extends JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  role?: string;
  status?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private readonly apiUrl = 'http://localhost:8081/api/clients';

  constructor(private http: HttpClient) {}

  private getToken(): string | null {
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('🔔 Aucun token trouvé dans localStorage.');
    }
    return token;
  }

  decodeToken(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<DecodedToken>(token);
    } catch (error) {
      console.error('❌ Erreur lors du décodage du token JWT', error);
      return null;
    }
  }

  getClientInfo(id: string): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }


  updateClient(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  changerMotDePasse(id: number, oldPassword: string, newPassword: string): Observable<void> {
    const body = {
      oldPassword,
      newPassword
    };
    return this.http.put<void>(
      `${this.apiUrl}/${id}/password`,
      body,
      this.getAuthHeaders() // ⬅️ ajoute les headers ici
    );
  }

  isClientEmpty(clientId: number): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/${clientId}/isEmpty`,
      this.getAuthHeaders()
    ).pipe(catchError(this.handleError));
  }

  getAllClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/all`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  getLastActivity(clientId: number): Observable<string> {
    return this.http.get<string>(
      `http://localhost:8081/historique/derniere-activite/${clientId}`,
      {
        ...this.getAuthHeaders(),
        responseType: 'text' as 'json'
      }
    ).pipe(catchError(this.handleError));
  }

  getEcoScore(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/ecoresponsable/${id}`, this.getAuthHeaders()).pipe(
      catchError(this.handleError)
    );
  }

  deleteClient(): Observable<void> {
    const decoded = this.decodeToken();
    if (!decoded || !decoded.sub) return throwError(() => new Error('Utilisateur non connecté'));
    return this.http.delete<void>(`${this.apiUrl}/${decoded.sub}`, this.getAuthHeaders());
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  private getAuthHeaders(): { headers: HttpHeaders } {
    const token = this.getToken();
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`
      })
    };
  }

  private handleError(error: HttpErrorResponse) {
    console.error('🛑 Erreur HTTP détectée :', error);
    return throwError(() => new Error('Erreur de communication avec le serveur.'));
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.role || null;
    } catch {
      return null;
    }
  }

  updateClientPhoto(clientId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.put(`${this.apiUrl}/${clientId}/photo`, formData);
  }

  getUserStatut(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decoded = jwtDecode<DecodedToken>(token);
      return decoded.status || null;
    } catch {
      return null;
    }
  }
}
