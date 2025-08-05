import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { catchError, map } from 'rxjs/operators';
import { TopCircuitRatingDto } from '../models/TopCircuitRatingDto';
import { Admin } from '../models/Admin';
import { AppNotification } from '../models/Notification';
import { Client } from '../models/client';
import {Page} from './ClientService';

interface DecodedToken extends JwtPayload {
  sub: string;
  email?: string;
  role?: string;
  status?: string;
  [key: string]: any;
}

// Réponses DTO
export interface StatsResponse {
  totalUsers: number;
  totalCircuits: number;
  satisfactionAvg: number;
  totalReviews: number;
  recentCircuits: number;
  totalFavorites: number;
}

export interface TimeSeriesResponse {
  labels: string[];
  values: number[];
}

export interface RoleDistributionResponse {
  labels: string[];
  values: number[];
}

export interface SimpleUserDto {
  fullname: string;
  email: string;
  inscriptionDate: string;
  actif: boolean;
}

export interface LocationDto {
  location?: string;
  lat: number;
  lng: number;
  label: string;
  type?: 'client' | 'guide' | 'platform' | string;
}

export interface CircuitSummaryDto {
  name: string;
  score: number;
}

export interface AlertDto {
  message: string;
}

export interface FeedbackDto {
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiBaseUrl = 'http://localhost:8081/api/admin/dashboard';
  private notificationsBase = 'http://localhost:8081/api/notifications';
  private readonly clientsBase = 'http://localhost:8081/api/clients';

  constructor(private http: HttpClient) {}

  // ----- Auth helpers -----
  private getToken(): string | null {
    const token = localStorage.getItem('adminToken');
    if (!token) console.warn('🔔 Aucun token trouvé dans localStorage.');
    return token;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getToken() || '';
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  private decodeRaw(): DecodedToken | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      return jwtDecode<DecodedToken>(token);
    } catch (err) {
      console.error('❌ Erreur décodage JWT', err);
      return null;
    }
  }

  getDecodedToken(): DecodedToken | null {
    const decoded = this.decodeRaw();
    if (!decoded) return null;
    if (this.isTokenExpired()) {
      console.warn('⚠️ Token expiré');
      return null;
    }
    return decoded;
  }

  getUserRole(): string | null {
    return this.getDecodedToken()?.role ?? null;
  }

  getUserEmail(): string | null {
    return this.getDecodedToken()?.email ?? null;
  }

  getUserStatus(): string | null {
    return this.getDecodedToken()?.status ?? null;
  }

  isTokenExpired(): boolean {
    const raw = this.decodeRaw();
    if (!raw || !raw.exp) return true;
    return Date.now() >= raw.exp * 1000;
  }

  isLoggedIn(): boolean {
    return !!this.getDecodedToken();
  }

  // ----- Error factory -----
  private handleError<T>(fallback?: T) {
    return (error: any): Observable<T> => {
      console.error('🛑 Erreur HTTP détectée :', error);
      if (fallback !== undefined) return of(fallback);
      return throwError(() => error);
    };
  }

  // ----- Dashboard endpoints -----
  getStats(): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${this.apiBaseUrl}/stats`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<StatsResponse>({
        totalUsers: 0,
        totalCircuits: 0,
        satisfactionAvg: 0,
        totalReviews: 0,
        recentCircuits: 0,
        totalFavorites: 0
      }))
    );
  }

  getAdminInfo(adminId: string): Observable<Admin> {
    if (!adminId) return throwError(() => new Error('Identifiant admin invalide ou absent'));
    return this.http.get<Admin>(`${this.apiBaseUrl}/${adminId}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<Admin>(null as any))
    );
  }

  getReservationStats(): Observable<TimeSeriesResponse> {
    return this.http.get<TimeSeriesResponse>(`${this.apiBaseUrl}/reservation-stats`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<TimeSeriesResponse>({ labels: [], values: [] }))
    );
  }

  getUserRoleDistribution(): Observable<RoleDistributionResponse> {
    return this.http.get<RoleDistributionResponse>(`${this.apiBaseUrl}/user-role-distribution`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<RoleDistributionResponse>({ labels: ['Client', 'Admin'], values: [0, 0] }))
    );
  }

  getLatestUsers(limit = 10): Observable<SimpleUserDto[]> {
    return this.http.get<SimpleUserDto[]>(`${this.apiBaseUrl}/latest-users?limit=${limit}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<SimpleUserDto[]>([]))
    );
  }

  getUserLocations(): Observable<LocationDto[]> {
    return this.http.get<LocationDto[]>(`${this.apiBaseUrl}/user-locations`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<LocationDto[]>([]))
    );
  }

  getAlerts(): Observable<AlertDto[]> {
    return this.http.get<AlertDto[]>(`${this.apiBaseUrl}/alerts`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<AlertDto[]>([]))
    );
  }

  getTopCircuits(limit = 5): Observable<CircuitSummaryDto[]> {
    return this.http.get<CircuitSummaryDto[]>(`${this.apiBaseUrl}/top-circuits?limit=${limit}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<CircuitSummaryDto[]>([]))
    );
  }

  getDailyFeedback(): Observable<FeedbackDto> {
    return this.http.get<FeedbackDto>(`${this.apiBaseUrl}/daily-feedback`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<FeedbackDto>({ message: '' }))
    );
  }

  getTopRatedCircuits(limit = 5): Observable<TopCircuitRatingDto[]> {
    return this.http.get<TopCircuitRatingDto[]>(`${this.apiBaseUrl}/top-rated-circuits?limit=${limit}`, { headers: this.getAuthHeaders() }).pipe(
      catchError(this.handleError<TopCircuitRatingDto[]>([]))
    );
  }

  // ----- Notifications -----
  getUserNotifications(userId: number, page = 0, size = 10): Observable<AppNotification[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AppNotification[]>(`${this.notificationsBase}/${userId}`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(() => of([]))
    );
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.notificationsBase}/${notificationId}/read`, {}, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((err) => {
        console.error('Échec markAsRead', err);
        return throwError(() => err);
      })
    );
  }

  // ----- Clients management -----
  searchClients(
    search: string | null = null,
    statut: string | null = null,
    page: number = 0,
    size: number = 20
  ): Observable<Page<Client>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (search && search.trim().length > 0) {
      params = params.set('search', search.trim());
    }

    if (statut && statut.toLowerCase() !== 'all') {
      params = params.set('statut', statut.trim());
    }

    return this.http.get<Page<Client>>(`${this.clientsBase}/search`, {
      params,
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<Page<Client>>(null as any))
    );
  }


  deleteClientById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.clientsBase}/${id}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<void>(undefined as any))
    );
  }

  updateClient(id: number, data: Partial<Client>): Observable<Client> {
    return this.http.put<Client>(`${this.clientsBase}/${id}`, data, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<Client>(null as any))
    );
  }
  createClient(formData: FormData): Observable<Client> {
    return this.http.post<Client>(`${this.clientsBase}`, formData, {
      headers: this.getAuthHeaders() // pas de Content-Type, le navigateur le gère
    }).pipe(
      catchError(this.handleError<Client>(null as any))
    );
  }


  // Exemple d'URL corrigée avec PATCH et le chemin exact
  updateClientWithPhoto(id: number, formData: FormData): Observable<Client> {
    return this.http.patch<Client>(`${this.clientsBase}/client/${id}`, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError<Client>(null as any))
    );
  }




}
