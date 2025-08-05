import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, tap, map } from 'rxjs';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private baseUrl = 'http://localhost:8081/api/auth/admin';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap(res => {
          if (res?.token) {
            localStorage.setItem('adminToken', res.token);
          }
        }),
        catchError(this.handleError)
      );
  }

  forgotPasswordWithToken(email: string): Observable<any> {
    return this.http
      .post(`${this.baseUrl}/forgot-password-with-token`, { email })
      .pipe(catchError(this.handleError));
  }

  logout(): void {
    localStorage.removeItem('adminToken');
  }

  getToken(): string | null {
    return localStorage.getItem('adminToken');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private handleError(err: HttpErrorResponse) {
    let msg = 'Erreur inconnue';
    if (err.error?.error) {
      msg = err.error.error;
    } else if (err.status === 0) {
      msg = 'Impossible de joindre le serveur';
    }
    return throwError(() => new Error(msg));
  }
}
