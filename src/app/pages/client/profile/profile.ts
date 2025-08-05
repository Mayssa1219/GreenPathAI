import { Component, OnInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClientService } from '../../../Services/ClientService';
import { Router } from '@angular/router';
import { Client } from '../../../models/client';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NavbarComponent, CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css'] // <-- correction ici, tableau
})
export class Profile implements OnInit {
  client: Client = {} as Client;
  password: string = '';
  consentement: boolean = true;
  activeTab: string = 'infos';

  ecorespScore: number = 0;
  username = 'Cher client';
  location = '';
  email = '';
  userId: string = '';
  photoUrl = 'default-avatar.png';

  // Sous-scores
  subScores: { label: string; value: number }[] = [];

  // Scores individuels
  nature: number = 0;
  culture: number = 0;
  eco: number = 0;
  sport: number = 0;

  // Rayon et circonférence pour SVG cercle
  readonly radius = 40;
  readonly circumference = 2 * Math.PI * this.radius;

  errorMessage: string = '';

  constructor(
    private clientService: ClientService,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const decoded = this.clientService.decodeToken();
    console.log('Décodage du token:', decoded);

    if (decoded && decoded.sub) {
      this.userId = decoded.sub;
      this.username = decoded['username'] || 'Utilisateur';
      this.email = decoded['email'] || '';
      this.location = decoded['location'] || '';

      this.clientService.getClientInfo(this.userId).subscribe({
        next: (client) => {
          this.client = client;
          this.loadEcoScore();

          this.username =
            client.fullname ||
            `${client.prenom || ''} ${client.nom || ''}`.trim() ||
            'Utilisateur';

          this.email = client.email || '';
          this.photoUrl = client.photoUrl || 'default-avatar.png';
          this.location = client.location || '';

          this.eco = client.ecoScore || 0;
          this.nature = client.natureScore || 0;
          this.culture = client.cultureScore || 0;
          this.sport = client.sportScore || 0;

          this.subScores = [
            { label: 'Nature', value: this.nature },
            { label: 'Culture', value: this.culture },
            { label: 'Sport', value: this.sport }
          ];
        },
        error: (err) => {
          console.error('Erreur récupération client:', err);
          this.router.navigate(['/login']);
        }
      });
    } else {
      console.warn('Token invalide ou absent');
      this.router.navigate(['/login']);
    }
  }
  updateProfile(): void {
    if (!this.client || this.client.id == null) {
      console.error("Impossible de mettre à jour : client.id est indéfini.");
      alert("Une erreur est survenue, veuillez réessayer plus tard.");
      return;
    }

    const updatedClient: Partial<Client> = {
      fullname: this.client.fullname?.trim() || '',
      email: this.client.email?.trim() || '',
      location: this.client.location?.trim() || '',
      // autres champs modifiables à ajouter ici
    };

    this.clientService.updateClient(this.client.id, updatedClient).subscribe({
      next: (updated) => {
        alert('Profil mis à jour avec succès.');
        if (updated) {
          this.client = { ...this.client, ...updated };
          this.photoUrl = updated.photoUrl ?? this.photoUrl;  // si photoUrl est null/undefined, garde l'actuel
        }
      },
      error: (err) => {
        console.error('Erreur lors de la mise à jour du profil :', err);
        alert('Erreur lors de la mise à jour du profil.');
      }
    });
  }
  supprimerCompte(): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ?")) {
      this.clientService.deleteClient().subscribe({
        next: () => {
          alert("Compte supprimé.");
          this.clientService.logout();
          this.router.navigate(['/']);
        },
        error: () => alert("Erreur lors de la suppression.")
      });
    }
  }

  getStrokeDashOffset(score?: number): number {
    const safeScore = score ?? 0;
    const percent = Math.min(Math.max(safeScore, 0), 100);
    return this.circumference * (1 - percent / 100);
  }

  getEcoColor(score?: number): string {
    const safeScore = score ?? 0;
    if (safeScore < 30) return '#e74c3c';
    if (safeScore < 60) return '#f39c12';
    if (safeScore < 80) return '#27ae60';
    return '#2ecc71';
  }

  getEcoLevel(score?: number): string {
    const safeScore = score ?? 0;
    if (safeScore < 30) return 'Faible';
    if (safeScore < 60) return 'Moyen';
    if (safeScore < 80) return 'Bon';
    return 'Excellent';
  }

  loadEcoScore(): void {
    if (!this.userId) return;
    // Assure que userId est un nombre (ou adapte selon backend)
    const idNum = Number(this.userId);
    if (isNaN(idNum)) return;

    this.clientService.getEcoScore(idNum).subscribe({
      next: (score: number) => {
        this.ecorespScore = score;
      },
      error: () => {
        this.ecorespScore = 0;
      }
    });
  }

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      this.errorMessage = 'La géolocalisation n’est pas supportée par votre navigateur.';
      return;
    }

    this.errorMessage = 'Détection en cours...';

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

        this.http.get<any>(url).subscribe({
          next: (res) => {
            const address = res.address || {};

            const road = address.road || '';
            const neighbourhood = address.neighbourhood || '';
            const suburb = address.suburb || '';
            const city =
              address.city ||
              address.town ||
              address.village ||
              address.hamlet ||
              '';
            const state = address.state || '';
            const postcode = address.postcode || '';
            const country = address.country || '';

            const fullLocation = [
              road,
              neighbourhood,
              suburb,
              city,
              state,
              postcode,
              country
            ]
              .filter((part) => part)
              .join(', ');

            this.location = fullLocation;
            this.errorMessage = '';
          },
          error: (err) => {
            console.error('Erreur reverse geocoding :', err);
            const fallback = `${latitude}, ${longitude}`;
            this.location = fallback;
            this.errorMessage =
              "Coordonnées récupérées, mais la ville n'a pas pu être identifiée.";
          }
        });
      },
      (error) => {
        this.errorMessage = 'Impossible de récupérer votre position : ' + error.message;
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }

  // Eventuellement une méthode pour changer d'onglet
  setActiveTab(tab: string) {
    this.activeTab = tab;
  }
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';

  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  oldPasswordTouched = false;
  newPasswordTouched = false;
  confirmPasswordTouched = false;

  // À appeler dans le HTML avec (blur)
  onOldPasswordBlur() {
    this.oldPasswordTouched = true;
  }

  onNewPasswordBlur() {
    this.newPasswordTouched = true;
  }

  onConfirmPasswordBlur() {
    this.confirmPasswordTouched = true;
  }

  isNewPasswordValid(): boolean {
    if (!this.newPassword) return false;
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(this.newPassword);
  }

  changerMotDePasse() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    const clientId = Number(this.userId); // ou récupéré depuis le token
    this.clientService.changerMotDePasse(clientId, this.oldPassword, this.newPassword).subscribe({
      next: () => alert("Mot de passe changé avec succès."),
      error: err => console.error("Erreur lors du changement de mot de passe", err)
    });
  }
  onPhotoSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    const file = fileInput.files?.[0];

    if (file && this.client?.id) {
      this.clientService.updateClientPhoto(this.client.id, file).subscribe({
        next: (updatedClient) => {
          this.client = updatedClient;
          this.photoUrl = updatedClient.photoUrl;
          alert('Photo mise à jour avec succès ✅');
        },
        error: (err) => {
          console.error('Erreur mise à jour photo', err);
          alert('Erreur lors de la mise à jour de la photo.');
        }
      });
    }
  }

}
