import {AfterContentInit, AfterViewInit, Component, OnInit} from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../../Services/WeatherService';
import flatpickr from 'flatpickr';
import { ClientService } from '../../../Services/ClientService';
import { Client } from '../../../models/client';
import { GeolocalisationService } from '../../../Services/GeolocalisationService';

@Component({
  selector: 'app-dashboard',
  imports: [NavbarComponent, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  standalone: true
})
export class DashboardComponent implements OnInit,AfterViewInit  {
  username = 'Utilisateur';
  email = '';
  userId = '';
  clientData: Client | null = null;

  weather: any = null;
  weatherError = false;
  photoUrl = 'assets/default-avatar.png';

  // ✅ ASTUCE
  greenTips: string[] = [
    "Éteins les lumières inutiles.",
    "Prends une douche plus courte.",
    "Utilise un sac réutilisable.",
    "Privilégie les transports en commun.",
    "Plante un arbre aujourd’hui.",
    "Réduis ta consommation de viande.",
    "Recycle tes déchets correctement.",
    "Achète local et de saison.",
    "Désactive les appareils en veille.",
    "Marche ou pédale pour les trajets courts."
  ];
  greenTip: string = '';

  // ✅ STATS DÉMO (ecoScore sera mis à jour dynamiquement)
  stats = {
    circuits: 8,
    suggestions: 15,
    favoris: 6,
    lastActivity: '04 Juillet 2025',
    ecoScore: 0
  };

  // ✅ Autres données UI
  suggestion: any = null;

  tendances = [
    { nom: 'Cap Bon', region: 'Nabeul', image: 'assets/capbon.jpg' },
    { nom: 'Ichkeul', region: 'Bizerte', image: 'assets/ichkeul.jpg' },
    { nom: 'Tamerza', region: 'Tozeur', image: 'assets/tamerza.jpg' }
  ];

  planning = {
    prochaineReservation: '10 Juillet 2025',
    evenementLocal: 'Nettoyage plage Korba'
  };

  goals = [
    'Créer 10 circuits avant la fin du mois',
    'Participer à 2 événements éco-responsables',
    'Partager 3 suggestions IA avec la communauté'
  ];

  upcomingEvents = [
    { message: "Atelier écoresponsable à Sousse", date: new Date("2025-07-12") },
    { message: "Visite guidée de la Médina", date: new Date("2025-07-15") },
  ];

  showToast = false;
  toastMessage = '';

  constructor(
    private weatherService: WeatherService,
    private clientService: ClientService,
    private geolocService: GeolocalisationService
  ) {}
  ngAfterViewInit() {
    // Petite pause pour déclencher l’animation proprement
    setTimeout(() => {
      const fill = document.querySelector('.eco-progress-fill') as HTMLElement;
      if (fill) {
        fill.style.setProperty('--score-width', `${this.stats.ecoScore}%`);
      }
    }, 200);
  }

  ngOnInit() {
    const decoded = this.clientService.decodeToken();
    if (decoded && decoded.sub) {
      this.userId = decoded.sub;
      this.username = decoded['username'] || decoded.sub || 'Utilisateur';
      this.email = decoded['email'] || '';

      this.clientService.getClientInfo(this.userId).subscribe({
        next: (client) => {
          this.clientData = client;
          this.username = client.fullname || `${client.prenom} ${client.nom}` || 'Utilisateur';
          this.email = client.email;
          this.photoUrl = client.photoUrl || 'assets/default-avatar.png';

          // Une fois qu'on a l'id, on charge le score éco
          this.loadEcoScore();
        },
        error: (err) => {
          console.error('Erreur récupération client:', err);
        }
      });
    }

    // Géolocalisation + météo
    this.geolocService.getPosition()
      .then(position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        return this.geolocService.getCityFromCoords(lat, lon);
      })
      .then(city => {
        this.getWeather(city);
      })
      .catch(() => {
        this.getWeather('Tunis'); // fallback
      });

    // Flatpickr init
    flatpickr("#datepicker", {
      minDate: "today",
      locale: "fr",
    });

    // Toast de bienvenue
    setTimeout(() => {
      this.triggerToast(`🌱 Bienvenue sur votre tableau de bord, ${this.username} ! Découvrez les dernières tendances écoresponsables et vos statistiques personnalisées.`);
    }, 5000);

    this.selectTipOfTheDay();
  }

  // ✅ MÉTHODES

  loadEcoScore(): void {
    if (!this.userId) return;
    this.clientService.getEcoScore(Number(this.userId)).subscribe({
      next: (score: number) => {
        this.stats.ecoScore = score;
      },
      error: (err) => {
        console.error('Erreur récupération ecoScore:', err);
        this.stats.ecoScore = 0;
      }
    });
  }
  getEcoColor(score: number): string {
    if (score >= 80) return '#4CAF50'; // Vert
    if (score >= 50) return '#FFC107'; // Jaune
    return '#F44336'; // Rouge
  }
  getEcoTooltip(score: number): string {
    if (score >= 20) return "Excellent niveau d’écoresponsabilité 🌿";
    if (score >= 10) return "Bon début, continuez à faire des choix durables 🌱";
    return "Niveau faible — essayez d’adopter plus de pratiques écologiques 🍃";
  }

  getEcoLevel(score: number): string {
    if (score >= 20) return 'Élevé';
    if (score >= 10) return 'Moyen';
    return 'Faible';
  }

  getWeather(city: string) {
    this.weatherService.getWeather(city).subscribe(data => {
      if (data) {
        this.weather = data;
        this.weatherError = false;
      } else {
        this.weatherError = true;
      }
    });
  }

  generateSuggestion() {
    this.suggestion = {
      id: 42,
      nom: 'Djerba Eco-Tour',
      region: 'Medenine',
      image: 'public/djerba.jpg'
    };
  }

  triggerToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    setTimeout(() => this.showToast = false, 6000);
  }

  closeToast() {
    this.showToast = false;
  }

  selectTipOfTheDay(): void {
    const today = new Date();
    const dayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;

    let hash = 0;
    for (let i = 0; i < dayKey.length; i++) {
      hash = dayKey.charCodeAt(i) + ((hash << 5) - hash);
    }

    const index = Math.abs(hash) % this.greenTips.length;
    this.greenTip = this.greenTips[index];
  }
}
