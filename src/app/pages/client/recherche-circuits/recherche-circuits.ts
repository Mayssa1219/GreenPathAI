import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { CircuitRequest, CircuitResponse, CircuitService } from '../../../Services/CircuitService';
import { Circuit } from '../../../models/Circuit';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Client } from '../../../models/client';
import { ClientService } from '../../../Services/ClientService';
import { FavorisService } from '../../../Services/FavorisService';
import { VoiceAssistantComponent } from '../voice-assistant/voice-assistant';
import {PlanningService} from '../../../Services/PlanningService';
import {HttpClient} from '@angular/common/http';
import {AvisRequest, AvisService} from '../../../Services/AvisService';

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

  message: string = '';

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
  pageSize = 6;
  showForm = false;
  circuitForm: FormGroup;
  uploadedPhotoPreview: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;
  reservationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private circuitService: CircuitService,
    private clientService: ClientService,
    private favorisService: FavorisService,
  private reservationService: PlanningService,
    private avisService:AvisService

) {
    this.reservationForm = this.fb.group({
      date: ['', Validators.required],
      nbPersonnes: [1, [Validators.required, Validators.min(1)]],
      message: ['']
    });

    this.circuitForm = this.fb.group({
      photoUrl: [''],
      titre: ['', Validators.required],
      description: ['', Validators.required],
      etapes: this.fb.array([this.fb.control('', Validators.required)]),
      duree: ['', [Validators.required, Validators.min(1)]],
      tags: this.fb.array([this.fb.control('', Validators.required)])
    });
  }

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

      this.favorisService.getFavoris(Number(this.userId)).subscribe({
        next: (circuits: Circuit[]) => {
          this.favorisIds = circuits.map(c => c.id);
        },
        error: () => console.error('Erreur lors du chargement des favoris')
      });
    }

    this.loadCircuits();
    this.loadAvisClient();
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
    this.filterStatus = 'all';
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
    switch (status) {
      case 'PROPOSE': return 'badge-propose';
      case 'VALIDATED': return 'badge-validated';
      case 'REJECTED': return 'badge-rejected';
      case 'SUGGESTED': return 'badge-suggested';
      default: return 'badge-default';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'PROPOSE': return 'fas fa-hourglass-start';
      case 'VALIDATED': return 'fas fa-check-circle';
      case 'REJECTED': return 'fas fa-times-circle';
      case 'SUGGESTED': return 'fas fa-lightbulb';
      default: return 'fas fa-question-circle';
    }
  }

  reserverCircuit(circuit: Circuit): void {
    alert(`Veuillez réserver pour accéder aux consignes du circuit : ${circuit.titre}`);
    // Exemple de redirection (si tu as un composant réservation)
    // this.router.navigate(['/reservation', circuit.id]);
  }

  demarrerAssistanceVocale(circuit: Circuit): void {
    const consignes = circuit.consignes ?? 'Aucune consigne disponible pour ce circuit.';
    const synth = window.speechSynthesis;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(consignes);
    synth.speak(utterance);
  }

  get etapes(): FormArray {
    return this.circuitForm.get('etapes') as FormArray;
  }

  get tags(): FormArray {
    return this.circuitForm.get('tags') as FormArray;
  }

  ajouterEtape(): void {
    this.etapes.push(this.fb.control('', Validators.required));
  }

  supprimerEtape(index: number): void {
    this.etapes.removeAt(index);
  }

  ajouterTag(): void {
    this.tags.push(this.fb.control('', Validators.required));
  }

  supprimerTag(index: number): void {
    this.tags.removeAt(index);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.uploadedPhotoPreview = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    } else {
      this.selectedFile = null;
      this.uploadedPhotoPreview = null;
    }
  }

  submitForm(): void {
    if (this.circuitForm.invalid) {
      this.circuitForm.markAllAsTouched();
      return;
    }

    const formValue = this.circuitForm.value;
    const formData = new FormData();

    // Append form fields as JSON
    formData.append('request', new Blob([JSON.stringify({
      clientId: Number(this.userId),
      titre: formValue.titre,
      description: formValue.description,
      etapes: formValue.etapes.join('; '),
      duree: formValue.duree,
      tags: formValue.tags
        .map((tag: string) => tag.trim())
        .filter((t: string, i: number, arr: string[]) => t && arr.indexOf(t) === i),
      niveauEcoresponsabilite: 0,
    })], { type: 'application/json' }));

    // Append file if selected
    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    this.circuitService.proposerCircuit(formData).subscribe({
      next: () => {
        alert('Circuit proposé avec succès');
        this.circuitForm.reset();
        this.selectedFile = null;
        this.uploadedPhotoPreview = null;
        while (this.etapes.length > 1) this.etapes.removeAt(1);
        while (this.tags.length > 1) this.tags.removeAt(1);
      },
      error: (err) => {
        console.error('Erreur lors de la proposition:', err);
        alert('Erreur lors de la proposition');
      }
    });
  }
  selectedCircuit: Circuit | null = null;
  showReservationForm=false;
  openReservationForm(circuit: Circuit): void {
    console.log('Ouverture du formulaire de réservation pour :', circuit);
    this.selectedCircuit = circuit;
    this.showReservationForm = true;
  }

  closeReservationPopup() {
    this.showReservationForm = false;
    this.reservationForm.reset();
    this.selectedCircuit = null;
  }
  submitReservation() {
    if (!this.selectedCircuit || !Number(this.userId)) return;

    const reservationData = {
      clientId: Number(this.userId),
      circuitId: this.selectedCircuit.id,
      dateReservation: this.reservationForm.value.date,
      nbPersonnes: this.reservationForm.value.nbPersonnes,
      message: this.reservationForm.value.message
    };

    this.reservationService.reserverCircuit(reservationData).subscribe({
      next: () => {
        alert("Réservation réussie !");
        this.closeReservationPopup();
      },
      error: () => {
        alert("Erreur lors de la réservation.");
      }
    });
  }
  avisNotes: { [circuitId: number]: number } = {};
  avisCommentaires: { [circuitId: number]: string } = {};
  showPopup: boolean = false;
  popupCircuitId: number | null = null;

  stars: number[] = [1, 2, 3, 4, 5];

// Ouvre la popup pour un circuit donné
  openPopup(circuitId: number): void {
    this.popupCircuitId = circuitId;
    this.showPopup = true;

    // Préremplir si déjà noté
    this.selectedRating = this.avisNotes[circuitId] || 0;
    this.commentaire = this.avisCommentaires[circuitId] || '';
  }

// Ferme la popup
  closePopup(): void {
    this.showPopup = false;
    this.popupCircuitId = null;
    this.resetForm();
  }

  selectedRating: number = 0;
  commentaire: string = '';

// Sélection d'une note (étoile)
  setRating(star: number): void {
    this.selectedRating = star;
    if (this.popupCircuitId !== null) {
      this.avisNotes[this.popupCircuitId] = star;
    }
  }

// Soumettre l’avis depuis le popup
  submitAvis(): void {
    if (this.popupCircuitId === null) return;

    const note = this.selectedRating;
    const commentaire = this.commentaire.trim();

    if (!note || !commentaire) {
      alert('Veuillez donner une note et un commentaire.');
      return;
    }

    const avis: AvisRequest = {
      clientId: Number(this.userId),
      circuitId: this.popupCircuitId,
      note,
      commentaire
    };

    this.avisService.ajouterAvis(avis).subscribe({
      next: () => {
        alert('Merci pour votre avis !');
        this.avisNotes[this.popupCircuitId!] = 0;
        this.avisCommentaires[this.popupCircuitId!] = '';
        this.closePopup();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l\'envoi de l\'avis.');
      }
    });
  }
  existingRatingByUser: { [circuitId: number]: { note: number; commentaire: string } } = {};

// Réinitialise les champs internes
  private resetForm(): void {
    this.selectedRating = 0;
    this.commentaire = '';
  }
  loadAvisClient(): void {
    this.avisService.getAvisByUser(Number(this.userId)).subscribe({
      next: (avisList) => {
        for (let avis of avisList) {
          this.existingRatingByUser[avis.circuitId] = {
            note: avis.note,
            commentaire: avis.commentaire
          };
        }
      },
      error: (err) => console.error('Erreur de chargement des avis :', err)
    });
  }
  getAriaLabel(circuitId: number): string {
    const rating = this.existingRatingByUser[circuitId]?.note;
    return rating ? `Votre note : ${rating} étoiles` : 'Aucune note';
  }
  modifierAvis(circuitId: number) {
    // Même popup que openPopup, mais pré-rempli avec existingRatingByUser[circuitId]
  }

}
