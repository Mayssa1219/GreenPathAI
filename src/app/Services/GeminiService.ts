import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {Observable} from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private backendUrl = 'http://localhost:8081/api/gemini';

  constructor(private http: HttpClient) {}

  generateContent(userInput: string): Observable<any> {
    const payload = {
      contents: [
        {
          parts: [
            { text: userInput }
          ]
        }
      ]
    };

    return this.http.post(this.backendUrl, payload);
  }
}
