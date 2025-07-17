import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { Observable } from 'rxjs';
import {AppNotification} from '../models/Notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private baseUrl = '/api/notifications';

  constructor(private http: HttpClient) {}

  getUserNotifications(userId: number, page = 0, size = 10): Observable<AppNotification[]> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<AppNotification[]>(`${this.baseUrl}/${userId}`, { params });
  }

  markAsRead(notificationId: number): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/${notificationId}/read`, {});
  }
}
