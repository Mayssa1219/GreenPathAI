import {Component, OnInit} from '@angular/core';
import {SidebarHeader} from '../sidebar-header/sidebar-header';
import {AvisAdmin, AvisAdminService} from '../../../Services/AvisAdminService';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-avis',
  standalone: true,
  imports: [SidebarHeader,FormsModule,CommonModule],
  templateUrl: './avis.html',
  styleUrl: './avis.css'
})
export class AvisComponent implements OnInit {
  avisList: AvisAdmin[] = [];
  filteredAvis: AvisAdmin[] = [];
  searchTerm: string = '';
  loading: boolean = true;

  constructor(private avisService: AvisAdminService) {}

  ngOnInit(): void {
    this.loadAvis();
  }

  loadAvis(): void {
    this.loading = true;
    this.avisService.getAllAvis().subscribe({
      next: (data) => {
        this.avisList = data;
        this.filteredAvis = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur de chargement des avis', err);
        this.loading = false;
      }
    });
  }

  filterAvis(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredAvis = this.avisList.filter(a =>
      a.client.toLowerCase().includes(term) ||
      a.circuit.toLowerCase().includes(term) ||
      a.commentaire.toLowerCase().includes(term)
    );
  }

  deleteAvis(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cet avis ?')) {
      this.avisService.deleteAvis(id).subscribe(() => {
        this.avisList = this.avisList.filter(a => a.id !== id);
        this.filteredAvis = this.filteredAvis.filter(a => a.id !== id);
      });
    }
  }
}
