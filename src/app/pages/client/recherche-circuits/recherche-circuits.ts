import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { CircuitResponse, CircuitService } from '../../../Services/CircuitService';
import { Circuit } from '../../../models/Circuit';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Client } from '../../../models/client';
import { ClientService } from '../../../Services/ClientService';
import { FavorisService } from '../../../Services/FavorisService';
import {VoiceAssistantComponent} from '../voice-assistant/voice-assistant';

@Component({
  selector: 'app-recherche-circuits',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule, FormsModule, VoiceAssistantComponent],
  templateUrl: './recherche-circuits.html',
  styleUrl: './recherche-circuits.css'
})
export class RechercheCircuits implements OnInit {
  circuits: Circuit[] = [];
  favorisIds: number[] = [];

  userId: string = '';
  username = '';
  email = '';
  photoUrl = 'default-avatar.png';
  clientData: Client | null = null;

  loading = false;

  // Filtres
  searchTerm = '';
  filterGuide = 'all'; // 'all' | 'with-guide' | 'without-guide'
  availableTags = ['nature', 'patrimoine', 'gastronomie', 'sport', 'bien-être'];
  selectedTags: string[] = [];
  filterDuree = 'all'; // 'all' | 'short' | 'medium' | 'long'
  filterEcoScore = 0;
  filterStatus = 'all';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  pageSize = 5;

  constructor(
    private circuitService: CircuitService,
    private clientService: ClientService,
    private favorisService: FavorisService
  ) {}

  ngOnInit(): void {
    const decoded = this.clientService.decodeToken();
    if (decoded && decoded.sub) {
      this.userId = decoded.sub;
      this.username = decoded['username'] || decoded.sub;
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

      // Charger les favoris au démarrage
      this.favorisService.getFavoris(Number(this.userId)).subscribe({
        next: (circuits: Circuit[]) => {
          this.favorisIds = circuits.map(c => c.id);
        },
        error: () => console.error('Erreur lors du chargement des favoris')
      });
    }

    this.loadCircuits();
  }

  // ---- Calculs dynamiques ----
  get minDuree(): number | null {
    switch (this.filterDuree) {
      case 'short': return 0;
      case 'medium': return 24;
      case 'long': return 73;
      default: return null;
    }
  }

  get maxDuree(): number | null {
    switch (this.filterDuree) {
      case 'short': return 23;
      case 'medium': return 72;
      case 'long': return null;
      default: return null;
    }
  }

  get minEcoresp(): number | null {
    return this.filterEcoScore > 0 ? this.filterEcoScore : null;
  }

  get maxEcoresp(): number | null {
    return null;
  }

  get withGuide(): boolean | null {
    if (this.filterGuide === 'with-guide') return true;
    if (this.filterGuide === 'without-guide') return false;
    return null;
  }

  // ---- Chargement des circuits ----
  loadCircuits(): void {
    this.loading = true;
    const guideParam = this.withGuide === null ? null : this.withGuide ? 'true' : 'false';

    this.circuitService.searchCircuits(
      this.searchTerm,
      this.selectedTags,
      guideParam,
      this.minDuree,
      this.maxDuree,
      this.filterStatus !== 'ALL' ? this.filterStatus : null,
      this.minEcoresp,
      this.maxEcoresp,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (resJson) => {
        try {
          const res: CircuitResponse = JSON.parse(resJson);
          this.circuits = res.content;
          this.totalPages = res.totalPages;
          this.currentPage = res.number + 1;
        } catch (e) {
          console.error('Erreur parsing JSON', e);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement circuits:', err);
        this.circuits = [];
        this.loading = false;
      }
    });
  }

  // ---- Filtres ----
  toggleTagSelection(tag: string): void {
    const index = this.selectedTags.indexOf(tag);
    if (index > -1) this.selectedTags.splice(index, 1);
    else this.selectedTags.push(tag);
    this.currentPage = 1;
    this.loadCircuits();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.filterGuide = 'all';
    this.selectedTags = [];
    this.filterDuree = 'all';
    this.filterEcoScore = 0;
    this.filterStatus = 'ALL';
    this.currentPage = 1;
    this.loadCircuits();
  }

  // ---- Événements filtres ----
  onSearchTermChange(): void {
    this.currentPage = 1;
    this.loadCircuits();
  }

  onFilterStatusChange(): void {
    this.currentPage = 1;
    this.loadCircuits();
  }

  onFilterEcoScoreChange(): void {
    this.currentPage = 1;
    this.loadCircuits();
  }

  onFilterGuideChange(): void {
    this.currentPage = 1;
    this.loadCircuits();
  }

  onDureeFilterChange(): void {
    this.currentPage = 1;
    this.loadCircuits();
  }

  // ---- Pagination ----
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadCircuits();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadCircuits();
    }
  }

  // ---- Favoris ----
  isFavori(circuit: Circuit): boolean {
    return this.favorisIds.includes(circuit.id);
  }

  toggleFavoris(circuit: Circuit): void {
    if (this.isFavori(circuit)) {
      this.favorisService.supprimerFavori(Number(this.userId), circuit.id).subscribe({
        next: () => {
          this.favorisIds = this.favorisIds.filter(id => id !== circuit.id);
        },
        error: () => alert('Erreur lors de la suppression du favori')
      });
    } else {
      this.favorisService.ajouterFavori(Number(this.userId), circuit.id).subscribe({
        next: () => {
          this.favorisIds.push(circuit.id);
        },
        error: () => alert('Erreur lors de l\'ajout du favori')
      });
    }
  }

  // ---- Affichage ----
  formatDuree(duree: number): string {
    if (duree < 24) return `${duree} ${duree === 1 ? 'heure' : 'heures'}`;
    const jours = Math.floor(duree / 24);
    const heures = duree % 24;
    return heures > 0
      ? `${jours} ${jours === 1 ? 'jour' : 'jours'} et ${heures} ${heures === 1 ? 'heure' : 'heures'}`
      : `${jours} ${jours === 1 ? 'jour' : 'jours'}`;
  }

  getStatusClass(status?: string): string {
    switch(status) {
      case 'PROPOSE': return 'badge-propose';
      case 'VALIDATED': return 'badge-validated';
      case 'REJECTED': return 'badge-rejected';
      case 'SUGGESTED': return 'badge-suggested';
      default: return 'badge-default';
    }
  }

  getStatusIcon(status?: string): string {
    switch(status) {
      case 'PROPOSE': return 'fas fa-hourglass-start';
      case 'VALIDATED': return 'fas fa-check-circle';
      case 'REJECTED': return 'fas fa-times-circle';
      case 'SUGGESTED': return 'fas fa-lightbulb';
      default: return 'fas fa-question-circle';
    }
  }

  viewDetails(circuit: Circuit): void {
    alert(`Voir détails pour ${circuit.titre}`);
  }
  reserverCircuit(circuit: Circuit): void {
    alert(`Veuillez réserver pour accéder aux consignes du circuit : ${circuit.titre}`);
    // Exemple de redirection (si tu as un composant réservation)
    // this.router.navigate(['/reservation', circuit.id]);
  }

  voirDetailsSansGuide(circuit: Circuit): void {
    alert(`Consignes du circuit : ${circuit.consignes ?? 'Aucune consigne'}`);
  }

  demarrerAssistanceVocale(circuit: Circuit): void {
    const consignes = circuit.consignes ?? 'Aucune consigne disponible pour ce circuit.';
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(consignes);
    synth.speak(utterance);
  }

}
