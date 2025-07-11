import {Component, NgModule, OnInit} from '@angular/core';
import {Client} from '../../../models/client';
import {ClientService} from '../../../Services/ClientService';
import {CommonModule, NgIf} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {VoiceService} from '../../../Services/VoiceService';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, NgIf],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class NavbarComponent implements OnInit {
  collapsed = true;
  isDarkTheme = false;
  private stopTimeout: any = null;

  stopVoice() {
    if (this.stopTimeout) return;  // Ignore clics rapides

    this.voiceService.cancel();

    this.stopTimeout = setTimeout(() => {
      this.stopTimeout = null; // Réactive le bouton après 500ms
    }, 500);
  }
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }
  unreadCount = 3; // 🔴 à mettre à jour dynamiquement selon tes données

  toggleNotifications() {
    // Par exemple : ouvrir une fenêtre latérale, ou naviguer vers /notifications
    console.log("Notifications cliquées !");
  }
  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    this.applyTheme();
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');

  }

  applyTheme(): void {
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
  username = 'Utilisateur';
  email = '';
  userId = '';
  clientData: Client | null = null;

  photoUrl = 'default-avatar.png';
  constructor(
    private clientService: ClientService,
    private router:Router,
    private voiceService: VoiceService
  ) {

  }
  ngOnInit(): void {
    const storedTheme = localStorage.getItem('theme');
    this.isDarkTheme = storedTheme === 'dark';
    this.applyTheme();
    if (storedTheme === 'dark') {
      this.isDarkTheme = true;
      document.body.classList.add('dark-theme');
    } else {
      this.isDarkTheme = false;
      document.body.classList.remove('dark-theme');
    }
    const decoded = this.clientService.decodeToken();
    if (decoded && decoded.sub) {
      this.userId = decoded.sub;
      this.username = decoded['username'] || decoded.sub || 'Utilisateur';
      this.email = decoded['email'] || '';

      this.clientService.getClientInfo(this.userId).subscribe({
        next: (client) => {
          this.clientData = client;
          // Si tu veux surcharger username / email avec les données backend, fais-le ici
          this.username = client.prenom + ' ' + client.nom;
          this.email = client.email;
          this.photoUrl = client.photoUrl || 'assets/default-avatar.png'; // fallback image
        },
        error: (err) => {
          console.error('Erreur récupération client:', err);
        }
      });
    }}

}
