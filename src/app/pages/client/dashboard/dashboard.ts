import { Component, OnInit, AfterViewInit } from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import { CommonModule } from '@angular/common';
import { WeatherService } from '../../../Services/WeatherService';
import flatpickr from 'flatpickr';
import { ClientService } from '../../../Services/ClientService';
import { Client } from '../../../models/client';
import { GeolocalisationService } from '../../../Services/GeolocalisationService';
import { VoiceService } from '../../../Services/VoiceService';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  username = 'Cher client';
  email = '';
  userId = '';
  clientData: Client | null = null;

  weather: any = null;
  weatherError = false;
  photoUrl = 'default-avatar.png';

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
  private highlightTimeouts: any[] = [];
  highlightedWords: string[] = [];
  startHighlightReading(): void {
    const words = this.greenTip.split(' ');
    this.highlightedWords = [];

    // Annule d'éventuels timers précédents
    this.clearHighlightTimeouts();

    this.voice.cancel();
    this.voice.speak(`Astuce verte du jour : ${this.greenTip}`);

    words.forEach((word, index) => {
      const t = setTimeout(() => {
        this.highlightedWords = words.map((w, i) =>
          i === index ? `<mark>${w}</mark>` : w
        );
      }, index * 400);
      this.highlightTimeouts.push(t);
    });

    // Timer pour remettre à zéro
    const endT = setTimeout(() => {
      this.clearHighlightTimeouts();
      this.highlightedWords = [];
    }, words.length * 450 + 800);
    this.highlightTimeouts.push(endT);
  }

  private clearHighlightTimeouts(): void {
    this.highlightTimeouts.forEach(t => clearTimeout(t));
    this.highlightTimeouts = [];
  }

  stopVoice(): void {
    // 1) Annule la lecture vocale
    this.voice.cancel();
    // 2) Annule tous les timers de surbrillance
    this.clearHighlightTimeouts();
    // 3) Réinitialise le texte (retire toute surbrillance)
    this.highlightedWords = [];
  }
  stats = {
    circuits: 8,
    suggestions: 15,
    favoris: 6,
    lastActivity: '04 Juillet 2025',
    ecoScore: 0
  };

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
    { message: "Visite guidée de la Médina", date: new Date("2025-07-15") }
  ];

  showToast = false;
  toastMessage = '';

  constructor(
    private weatherService: WeatherService,
    private clientService: ClientService,
    private geolocService: GeolocalisationService,
    public voice: VoiceService
  ) {}

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
          this.photoUrl = client.photoUrl || 'default-avatar.png';
          this.loadEcoScore();
        },
        error: (err) => console.error('Erreur récupération client:', err)
      });
    }

    this.geolocService.getPosition()
      .then(position => this.geolocService.getCityFromCoords(position.coords.latitude, position.coords.longitude))
      .then(city => this.getWeather(city || 'Tunisie'))
      .catch(() => this.getWeather('Tunisie'));

    flatpickr("#datepicker", {
      minDate: "today",
      locale: "fr",
    });

    setTimeout(() => {
      this.triggerToast(`Bienvenue sur votre tableau de bord, ${this.username} ! Découvrez les dernières tendances écoresponsables et vos statistiques personnalisées.`);
    }, 5000);

    this.selectTipOfTheDay();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      const fill = document.querySelector('.eco-progress-fill') as HTMLElement;
      if (fill) {
        fill.style.setProperty('--score-width', `${this.stats.ecoScore}%`);
      }
    }, 200);
  }

  // ===== 🌿 ASTUCE ÉCO =====
  selectTipOfTheDay(): void {
    const today = new Date();
    const dayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    let hash = 0;
    for (let i = 0; i < dayKey.length; i++) {
      hash = dayKey.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % this.greenTips.length;
    this.greenTip = this.greenTips[index];

    this.voice.speak(`Astuce verte du jour : ${this.greenTip}`);
  }
  generateSuggestion() {
    this.suggestion = {
      id: 42,
      nom: 'Djerba Eco-Tour',
      region: 'Medenine',
      image: 'public/djerba.jpg'
    };
  }


  // ===== METEO =====
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

  // ===== SCORE =====
  loadEcoScore(): void {
    if (!this.userId) return;
    this.clientService.getEcoScore(Number(this.userId)).subscribe({
      next: (score: number) => this.stats.ecoScore = score,
      error: () => this.stats.ecoScore = 0
    });
  }

  getEcoColor(score: number): string {
    if (score >= 80) return '#4CAF50';
    if (score >= 50) return '#FFC107';
    return '#F44336';
  }

  getEcoLevel(score: number): string {
    if (score >= 20) return 'Élevé';
    if (score >= 10) return 'Moyen';
    return 'Faible';
  }

  getEcoTooltip(score: number): string {
    if (score >= 20) return "Excellent niveau d’écoresponsabilité 🌿";
    if (score >= 10) return "Bon début, continuez à faire des choix durables 🌱";
    return "Niveau faible — essayez d’adopter plus de pratiques écologiques 🍃";
  }

  // ===== TOAST =====
  triggerToast(message: string) {
    this.toastMessage = message;
    this.showToast = true;
    this.voice.speak(message);
    setTimeout(() => this.showToast = false, 6000);
  }
  closeToast() {
    this.showToast = false;
    this.stopVoice()
  }
}
