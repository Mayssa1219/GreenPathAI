import { Component, OnInit } from '@angular/core';
import { Circuit } from '../../../models/Circuit';
import { NavbarComponent } from '../navbar/navbar';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FavorisService } from '../../../Services/FavorisService';
import { ClientService } from '../../../Services/ClientService';
import { Client } from '../../../models/client';
import {Historique, HistoriqueService} from '../../../Services/HistoriqueService';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [
    NavbarComponent,
    FormsModule,
    CommonModule
  ],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css']
})
export class FavoritesComponent implements OnInit {
  userId: string = '';
  email = '';
  photoUrl = 'default-avatar.png';
  username = '';
  clientData: Client | null = null;
  favoris: Circuit[] = [];
  loading = false;
  errorMessage = '';

  constructor(private historiqueService:HistoriqueService,private favorisService: FavorisService, private clientService: ClientService) {}

  ngOnInit(): void {
    const decoded = this.clientService.decodeToken();
    console.log('Décodage du token:', decoded);
    if (decoded && decoded.sub) {
      this.userId = decoded.sub;
      this.username = decoded['username'] || decoded.sub || 'Utilisateur';
      this.email = decoded['email'] || '';

      this.clientService.getClientInfo(this.userId).subscribe({
        next: (client) => {
          this.clientData = client;
          this.username = client.fullname || `${client.prenom} ${client.nom}` || 'Utilisateur';
          this.email = client.email;
          this.photoUrl = client.photoUrl || 'default-avatar.png';
        },
        error: (err) => console.error('Erreur récupération client:', err)
      });
    }
    this.chargerHistorique();
    this.chargerFavoris();
  }

  chargerFavoris(): void {
    if (!this.userId) {
      this.errorMessage = 'ID utilisateur non défini';
      return;
    }
    this.loading = true;
    this.favorisService.getFavoris(Number(this.userId)).subscribe({
      next: (data) => {
        this.favoris = data;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = 'Erreur lors du chargement des favoris';
        this.loading = false;
      }
    });
  }

  retirerFavori(circuitId: number): void {
    if (!this.userId) return;
    this.favorisService.supprimerFavori(Number(this.userId), circuitId).subscribe({
      next: () => {
        this.favoris = this.favoris.filter(c => c.id !== circuitId);
      },
      error: () => alert('Erreur lors de la suppression du favori')
    });
  }

  ajouterFavori(circuitId: number): void {
    if (!this.userId) return;
    this.favorisService.ajouterFavori(Number(this.userId), circuitId).subscribe({
      next: () => {
        this.chargerFavoris();
      },
      error: () => alert('Erreur lors de l\'ajout du favori')
    });
  }
  historique: Historique[] = [];

  chargerHistorique(): void {
    if (!this.userId) return;
    this.historiqueService.getHistoriqueByClient(Number(this.userId)).subscribe({
      next: (data) => this.historique = data,
      error: (err) => console.error('Erreur chargement historique', err)
    });
  }


  viderHistorique(): void {
    if (!this.userId) return;
    this.historiqueService.viderHistoriqueClient(Number(this.userId)).subscribe({
      next: () => this.historique = [],
      error: () => alert("Erreur lors du vidage de l'historique.")
    });
  }

}
