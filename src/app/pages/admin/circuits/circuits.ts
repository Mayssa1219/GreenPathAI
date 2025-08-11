import { Component, OnInit } from '@angular/core';
import { SidebarHeader } from '../sidebar-header/sidebar-header';
import {CircuitCreation, CircuitsManagementService} from '../../../Services/circuits-managementsService';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Circuit } from '../../../models/Circuit';
import {forkJoin, map} from 'rxjs';

export interface Page<T> {
  content: T[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // page courante (0-based)
  first: boolean;
  last: boolean;
  numberOfElements: number;
}

@Component({
  selector: 'app-circuits',
  standalone: true,
  imports: [SidebarHeader, CommonModule, FormsModule],
  templateUrl: './circuits.html',
  styleUrls: ['./circuits.css']  // correct : styleUrls (tableau)
})
export class CircuitsComponent implements OnInit {
  circuits: Circuit[] = [];
  favoris: Set<number> = new Set();

  // Filtres
  searchTerm = '';
  filterGuide: string | null = null; // ici null si pas de filtre, ou 'all', 'with-guide', 'without-guide'
  selectedTags: string[] = [];
  filterStatus: string | null = null;
  minDuree: number | null = null;
  maxDuree: number | null = null;
  filterEcoScore: number | null = null;

  // Pagination
  currentPage = 1; // Frontend 1-based
  totalPages = 1;
  totalElements = 0;
  pageSize = 6;

  constructor(private circuitService: CircuitsManagementService) {}

  ngOnInit(): void {
    this.loadCircuits();
  }

  loadCircuits() {
    this.circuitService.searchCircuits(
      this.searchTerm,
      this.selectedTags,
      this.filterGuide,
      this.minDuree,
      this.maxDuree,
      this.filterStatus,
      this.filterEcoScore,
      null,
      this.currentPage,
      this.pageSize
    ).subscribe({
      next: (response: Page<Circuit>) => {
        this.circuits = response.content;
        this.currentPage = response.number + 1;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;

        // Charger les avis et calculer moyenne
        const observables = this.circuits.map(circuit =>
          this.circuitService.getAvisByCircuit(circuit.id).pipe(
            map(avisList => {
              if (!avisList || avisList.length === 0) return 0;
              const somme = avisList.reduce((acc, avis) => acc + avis.note, 0);
              return somme / avisList.length;
            })
          )
        );

        forkJoin(observables).subscribe(moyennes => {
          this.circuits.forEach((circuit, index) => {
            circuit.moyenneAvis = moyennes[index];
          });
        });
      },
      error: (error) => {
        console.error('Erreur chargement circuits', error);
      }
    });
  }

  onSearch() {
    this.currentPage = 1; // reset page au début
    this.loadCircuits();
  }

  refresh() {
    this.searchTerm = '';
    this.filterGuide = null;
    this.selectedTags = [];
    this.filterStatus = null;
    this.minDuree = null;
    this.maxDuree = null;
    this.filterEcoScore = null;
    this.currentPage = 1;
    this.loadCircuits();
  }

  validateCircuit(id?: number) {
    if (!id) return;
    this.circuitService.validateCircuit(id).subscribe({
      next: () => {
        alert('Circuit validé');
        this.loadCircuits();
      },
      error: () => alert('Erreur lors de la validation')
    });
  }

  rejectCircuit(id?: number) {
    if (!id) return;
    this.circuitService.rejectCircuit(id).subscribe({
      next: () => {
        alert('Circuit rejeté');
        this.loadCircuits();
      },
      error: () => alert('Erreur lors du rejet')
    });
  }

  toggleFavoris(circuit: Circuit) {
    if (!circuit.id) return;
    if (this.favoris.has(circuit.id)) {
      this.favoris.delete(circuit.id);
    } else {
      this.favoris.add(circuit.id);
    }
    // TODO: appeler backend pour sauvegarder favoris si nécessaire
  }

  isFavoris(circuit: Circuit): boolean {
    if (!circuit.id) return false;
    return this.favoris.has(circuit.id);
  }

  changePage(newPage: number) {
    if (newPage < 1 || newPage > this.totalPages) return;
    this.currentPage = newPage;
    this.loadCircuits();
  }

  nouveauCircuit: CircuitCreation = {
    titre: '',
    description: '',
    etapes:'',
    duree: undefined,
    tags: [],
    status: 'VALIDATED'
  };

  showAddCircuitPopup = false;
  newTags = ''; // Tags en texte séparé par virgules
  selectedFile: File | null = null; // à gérer depuis ton input type="file"

  ajouterCircuit() {
    // Vérification des champs requis
    if (!this.nouveauCircuit.titre || !this.nouveauCircuit.description || !this.nouveauCircuit.duree) {
      alert('❗ Veuillez remplir tous les champs obligatoires.');
      return;
    }

    // Transformation des tags depuis l’input texte
    if (this.newTags.trim()) {
      this.nouveauCircuit.tags = this.newTags.split(',').map(t => t.trim()).filter(t => t !== '');
    }

    this.circuitService.ajouterCircuitAvecPhoto(
      this.nouveauCircuit,
      this.selectedFile!
    ).subscribe({
      next: () => {
        alert('✅ Circuit ajouté avec succès');
        this.loadCircuits();
        this.closePopup();
      },
      error: (err) => {
        alert('❌ Erreur lors de l’ajout : ' + err.message);
      }
    });
  }


  closePopup() {
    this.showAddCircuitPopup = false;
    this.nouveauCircuit = {
      titre: '',
      description: '',
      etapes: '',
      duree: undefined,
      tags: [],
      status: 'VALIDATED'
    };
    this.newTags = '';
    this.selectedFile = null;
  }


  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }


}
