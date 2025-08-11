import { Component, OnInit } from '@angular/core';
import { SuggestionAdminIaService, SuggestionIA } from '../../../Services/SuggestionAdminService';
import { SidebarHeader } from '../sidebar-header/sidebar-header';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-suggestions-ia',
  standalone: true,
  imports: [SidebarHeader, CommonModule, FormsModule],
  templateUrl: './suggestions-ia.html',
  styleUrls: ['./suggestions-ia.css']
})
export class SuggestionsIAComponent implements OnInit {
  suggestions: SuggestionIA[] = [];
  loading = false;
  errorMessage: string | null = null;

  showModal = false;
  editingSuggestion: SuggestionIA | null = null;

  // Modèle pour formulaire (création ou update)
  formModel: Partial<SuggestionIA> = {
    client: { id: 0, nom: '' },
    circuit: { id: 0, titre: '' },
    score: 0,
    date: ''
  };


  constructor(private suggestionService: SuggestionAdminIaService) {}

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.loading = true;
    this.errorMessage = null;
    this.suggestionService.getAllSuggestions().subscribe({
      next: (data: SuggestionIA[]) => {
        this.suggestions = data;
        this.loading = false;
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors du chargement des suggestions.';
        this.loading = false;
        console.error('Erreur API suggestions:', err);
      }
    });
  }

  deleteSuggestion(id: number | undefined): void {
    if (!id) return;
    if (!confirm('Voulez-vous vraiment supprimer cette suggestion ?')) return;

    this.suggestionService.deleteSuggestion(id).subscribe({
      next: () => {
        this.suggestions = this.suggestions.filter(s => s.id !== id);
      },
      error: (err) => {
        this.errorMessage = 'Erreur lors de la suppression.';
        console.error('Erreur suppression suggestion:', err);
      }
    });
  }

  openCreateModal(): void {
    this.editingSuggestion = null;
    this.formModel = {
      client: { id: 0 },
      circuit: { id: 0 },
      score: 0,
      date: new Date().toISOString().substring(0,16)
    };
    this.showModal = true;
    this.errorMessage = null;
  }

  openEditModal(suggestion: SuggestionIA): void {
    this.editingSuggestion = suggestion;
    this.formModel = {
      client: { ...suggestion.client },
      circuit: { ...suggestion.circuit },
      score: suggestion.score,
      date: suggestion.date ? suggestion.date.substring(0,16) : ''
    };
    this.showModal = true;
    this.errorMessage = null;
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      this.errorMessage = "Veuillez remplir tous les champs correctement.";
      return;
    }
    this.errorMessage = null;

    const suggestionPayload: SuggestionIA = {
      client: { id: Number(this.formModel.client?.id) },
      circuit: { id: Number(this.formModel.circuit?.id) },
      score: Number(this.formModel.score),
      date: new Date(this.formModel.date!).toISOString()
    };

    if (this.editingSuggestion && this.editingSuggestion.id) {
      this.suggestionService.updateSuggestion(this.editingSuggestion.id, suggestionPayload).subscribe({
        next: () => {
          this.loadSuggestions();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la mise à jour.';
          console.error(err);
        }
      });
    } else {
      this.suggestionService.createSuggestion(suggestionPayload).subscribe({
        next: () => {
          this.loadSuggestions();
          this.closeModal();
        },
        error: (err) => {
          this.errorMessage = 'Erreur lors de la création.';
          console.error(err);
        }
      });
    }
  }

  closeModal(): void {
    this.showModal = false;
  }
}
