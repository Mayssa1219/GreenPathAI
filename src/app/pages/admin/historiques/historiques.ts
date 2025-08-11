import { Component, OnInit } from '@angular/core';
import { Historique, HistoriqueAdminService } from '../../../Services/historiqueAdminService';
import { SidebarHeader } from '../sidebar-header/sidebar-header';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-historiques',
  standalone: true,
  imports: [SidebarHeader, FormsModule, CommonModule],
  templateUrl: './historiques.html',
  styleUrls: ['./historiques.css']  // <-- correction ici, au pluriel
})
export class HistoriquesComponent implements OnInit {
  historiques: Historique[] = [];
  filteredHistoriques: Historique[] = [];
  searchTerm = '';
  loading = true;

  constructor(private historiqueService: HistoriqueAdminService) {}

  ngOnInit(): void {
    this.loadAllHistoriques();
  }

  loadAllHistoriques(): void {
    this.historiqueService.getAllHistoriques().subscribe({
      next: (data) => {
        this.historiques = data;
        this.filteredHistoriques = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  filterHistoriques(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredHistoriques = this.historiques.filter(h =>
      h.typeActivite.toLowerCase().includes(term) ||
      h.description.toLowerCase().includes(term) ||
      h.dateFormatted.toLowerCase().includes(term) ||
      (h.clientFullName && h.clientFullName.toLowerCase().includes(term))
    );
  }

  // Optionnel : appeller filterHistoriques quand searchTerm change
  onSearchTermChange(term: string): void {
    this.searchTerm = term;
    this.filterHistoriques();
  }
}
