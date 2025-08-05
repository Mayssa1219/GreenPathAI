import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarHeader } from '../sidebar-header/sidebar-header';
import { DashboardService, SimpleUserDto } from '../../../Services/DashboardService';
import { Client } from '../../../models/client';

@Component({
  selector: 'app-client-management',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarHeader],
  templateUrl: './clients.html',
  styleUrls: ['./clients.css']
})
export class ClientsComponent implements OnInit {
  clients: Client[] = [];
  searchText: string = '';
  statutFilter: string = '';

  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 1;

  loading: boolean = false;
  error: string | null = null;

  // édition
  editingClient: Client | null = null;
  editableClient: Partial<Client> = {};
  previewPhoto: string | null = null;
  selectedPhotoFile: File | null = null;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients(): void {
    this.loading = true;
    this.error = null;

    this.dashboardService.searchClients(this.searchText, this.statutFilter, this.currentPage, this.pageSize)
      .subscribe({
        next: (response: any) => {
          this.clients = response.content || [];
          this.totalPages = response.totalPages ?? 1;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Erreur lors du chargement des clients';
          console.error(err);
          this.loading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0;
    this.loadClients();
  }

  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadClients();
    }
  }

  nextPage(): void {
    if (this.currentPage + 1 < this.totalPages) {
      this.currentPage++;
      this.loadClients();
    }
  }

  // version simple : modifier le statut via prompt
  editClient(client: Client): void {
    const newStatut = prompt('Nouveau statut', client.statut || '');
    if (newStatut == null) return;

    const updated: Partial<Client> = {
      statut: newStatut.trim()
    };
    this.updateClient(Number(client.id), updated);
  }

  updateClient(id: number, changes: Partial<Client>): void {
    this.loading = true;
    this.dashboardService.updateClient(id, changes).subscribe({
      next: (updatedClient) => {
        this.clients = this.clients.map(c => (c.id === updatedClient.id ? updatedClient : c));
        this.loading = false;
        alert('Client mis à jour avec succès');
      },
      error: (err) => {
        console.error('Erreur update client', err);
        this.loading = false;
        alert('Échec de la mise à jour du client');
      }
    });
  }

  deleteClient(client: Client): void {
    if (!confirm(`Voulez-vous vraiment supprimer ${client.fullname} ?`)) return;

    this.dashboardService.deleteClientById(Number(client.id)).subscribe({
      next: () => {
        alert('Client supprimé avec succès');
        this.loadClients();
      },
      error: (err) => {
        alert('Erreur lors de la suppression');
        console.error(err);
      }
    });
  }

  // modal editing
  openEditModal(client: Client): void {
    this.editingClient = { ...client };
    this.editableClient = { ...client };
    this.previewPhoto = client.photoUrl || null;
    this.selectedPhotoFile = null;
  }

  closeModal(): void {
    this.editingClient = null;
    this.editableClient = {};
    this.previewPhoto = null;
    this.selectedPhotoFile = null;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    this.selectedPhotoFile = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      this.previewPhoto = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  private isValidValue(value: any): boolean {
    return value !== null && value !== undefined && String(value).trim() !== '';
  }

  saveEdit(): void {
    if (!this.editingClient) return;

    this.loading = true;
    const id = Number(this.editingClient.id);

    const updates: any = {};
    if (this.isValidValue(this.editableClient.fullname)) {
      updates.fullname = this.editableClient.fullname!.trim();
    }
    if (this.isValidValue(this.editableClient.email)) {
      updates.email = this.editableClient.email!.trim();
    }
    if (this.isValidValue(this.editableClient.statut)) {
      updates.statut = this.editableClient.statut!.trim();
    }

    if (this.selectedPhotoFile) {
      const formData = new FormData();
      if (this.isValidValue(updates.fullname)) formData.append('fullname', updates.fullname);
      if (this.isValidValue(updates.email)) formData.append('email', updates.email);
      if (this.isValidValue(updates.statut)) formData.append('statut', updates.statut);
      formData.append('photo', this.selectedPhotoFile);

      this.dashboardService.updateClientWithPhoto(id, formData).subscribe({
        next: (updated) => {
          if (updated && updated.id) {
            this.applyUpdateLocally(updated);
            alert('Client mis à jour avec photo');
          } else {
            console.warn('Réponse invalide pour updateClientWithPhoto', updated);
            alert('Données invalides reçues');
          }
          this.closeModal();
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          alert('Échec de la mise à jour');
          this.loading = false;
        }
      });
    } else {
      if (Object.keys(updates).length === 0) {
        alert('Aucune modification à enregistrer');
        this.loading = false;
        return;
      }

      this.dashboardService.updateClient(id, updates).subscribe({
        next: (updated) => {
          if (updated && updated.id) {
            this.applyUpdateLocally(updated);
            alert('Client mis à jour');
          } else {
            console.warn('Réponse invalide pour updateClient', updated);
            alert('Données invalides reçues');
          }
          this.closeModal();
          this.loading = false;
        },
        error: (err) => {
          console.error(err);
          alert('Échec de la mise à jour');
          this.loading = false;
        }
      });
    }
  }

  private applyUpdateLocally(updated: Client | null): void {
    if (!updated || !updated.id) return;
    this.clients = this.clients.map(c => (c.id === updated.id ? updated : c));
  }
  addingClient = false;
  newClient: any = { fullname: '', email: '', password: '', statut: 'actif' };
  newClientPhotoFile: File | null = null;

  openAddModal(): void {
    this.newClient = { fullname: '', email: '', password: '', statut: 'actif' };
    this.newClientPhotoFile = null;
    this.addingClient = true;
  }

  closeAddModal(): void {
    this.addingClient = false;
  }

  onNewClientPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    this.newClientPhotoFile = input.files[0];
  }

  saveNewClient(): void {
    if (!this.newClient.fullname || !this.newClient.email || !this.newClient.password) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const formData = new FormData();
    formData.append('fullname', this.newClient.fullname);
    formData.append('email', this.newClient.email);
    formData.append('password', this.newClient.password);
    formData.append('statut', this.newClient.statut);
    if (this.newClientPhotoFile) {
      formData.append('photo', this.newClientPhotoFile);
    }

    this.dashboardService.createClient(formData).subscribe({
      next: (created) => {
        alert('Client ajouté avec succès');
        this.clients.push(created);
        this.closeAddModal();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l’ajout du client');
      }
    });
  }

}
