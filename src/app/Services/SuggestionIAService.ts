import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Circuit} from '../models/Circuit';

@Injectable({
  providedIn: 'root'
})
export class SuggestionIAService {
  constructor(private http:HttpClient) {
  }
  private apiUrl = 'http://localhost:8081/suggestions';
  countSuggestions(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }

}
