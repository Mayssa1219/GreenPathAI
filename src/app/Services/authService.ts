import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/auth'; // adapte à ton backend

  constructor(private http: HttpClient) {}

  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
      })
    );
  }

  register(clientData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, clientData);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  loginWithGoogle(): void {
    window.location.href = 'http://localhost:8081/api/auth/google/login';
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`,
      {}
    );
  }

  sendOtp(email: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/send-otp?email=${encodeURIComponent(email)}`, {});
  }

  requestResetPassword(email: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/request-reset-password`,
      null,
      { params: { email } }
    );
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/reset-password`,
      null,
      { params: { token, newPassword } }
    );
  }
}
