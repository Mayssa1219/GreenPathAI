import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Goal {
  id: number;
  texte: string;
  done: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class GoalService {
  private baseUrl = '/api/goals'; // adapte selon le chemin de ton API

  constructor(private http: HttpClient) {}

  // Récupérer tous les goals d’un client
  getGoals(clientId: number): Observable<Goal[]> {
    return this.http.get<Goal[]>(`${this.baseUrl}/${clientId}`);
  }

  // Ajouter un goal pour un client
  ajouterGoal(clientId: number, texte: string): Observable<Goal> {
    return this.http.post<Goal>(
      `${this.baseUrl}/ajouter?clientId=${clientId}&texte=${encodeURIComponent(texte)}`,
      {}
    );
  }

  // Supprimer un goal par son id
  supprimerGoal(goalId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${goalId}`);
  }

  // Bascule de l’état "done" (coché / décoché)
  toggleDone(goalId: number): Observable<Goal> {
    return this.http.patch<Goal>(`${this.baseUrl}/${goalId}/toggle`, {});
  }
}
