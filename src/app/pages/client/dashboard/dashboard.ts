import {Component, OnInit, AfterViewInit, AfterContentInit, OnDestroy, NgModule} from '@angular/core';
import { NavbarComponent } from '../navbar/navbar';
import {CommonModule, NgFor} from '@angular/common';
import { WeatherService } from '../../../Services/WeatherService';
import flatpickr from 'flatpickr';
import { ClientService } from '../../../Services/ClientService';
import { Client } from '../../../models/client';
import { GeolocalisationService } from '../../../Services/GeolocalisationService';
import { VoiceService } from '../../../Services/VoiceService';
import { CircuitService } from '../../../Services/CircuitService';
import {Circuit} from '../../../models/Circuit';
import {firstValueFrom} from 'rxjs';
import {SuggestionIAService} from '../../../Services/SuggestionIAService';
import {ActivatedRoute, RouterModule} from '@angular/router';
import {EvenementLocal, PlanningDto, PlanningService} from '../../../Services/PlanningService';
import {FormsModule} from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent, CommonModule,NgFor,RouterModule,FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, AfterViewInit,OnDestroy {
  username = 'Cher client';
  email = '';
  userId = '';
  photoUrl = 'default-avatar.png';
  clientData: Client | null = null;
  weatherCondition = '';
  weather: any = null;
  weatherError = false;
  weatherDescriptionLogique = '';
  weatherCssClass = '';

  circuitsMeteo: Circuit[] = [];
  circuit: Circuit | null = null;
  isLoading = true;
  hasError = false;

  // UI
  currentIndex = 0;
  intervalId: any;
  showToast = false;
  toastMessage = '';
  localisation: string = 'Tunisie'; // Valeur par défaut
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
    circuits: 0,
    suggestions: 0,
    favoris: 0,
    lastActivity: '',
    ecoScore: 0
  };

  goals = [
    'Créer 10 circuits avant la fin du mois',
    'Participer à 2 événements éco-responsables',
    'Partager 3 suggestions IA avec la communauté'
  ];

  planning = {
    prochaineReservation: 'Chargement...',
    evenementLocal: null as EvenementLocal | null
  };
  evenement: any = null;


  constructor(
    private route: ActivatedRoute,
    private weatherService: WeatherService,
    private clientService: ClientService,
    private geolocService: GeolocalisationService,
    public voice: VoiceService,
    private circuitService: CircuitService,
    private suggestionService:SuggestionIAService,
    private planningService: PlanningService
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
    // Appel de la géoloc + météo
    this.geolocService.getPosition()
      .then(position => {
        const { latitude, longitude } = position.coords;
        return this.geolocService.getCityFromCoords(latitude, longitude);
      })
      .then(city => {
        this.localisation = city || 'Tunisie'; // Mise à jour locale

        this.getWeather(this.localisation);

        this.weatherService.getWeatherDescriptionLogique(this.localisation).subscribe(desc => {
          this.weatherDescriptionLogique = desc;
        });

      })
      .catch(err => {
        console.warn('Erreur géoloc, fallback sur Tunisie', err);

        this.localisation = 'Tunisie';
        this.getWeather(this.localisation);

        this.weatherService.getWeatherDescriptionLogique(this.localisation).subscribe(desc => {
          this.weatherDescriptionLogique = desc;
        });

      });

    const id = this.route.snapshot.paramMap.get('id'); // depuis l'URL
    if (id) {
      this.planningService.getEvenementById(+id).subscribe(evt => {
        this.evenement = evt;
      });
    }
// charger les circuits adaptés au météo
    this.loadCircuitsByMeteo();
    this.circuitService.countFavoris(Number(this.userId)).subscribe({
      next: (count) => this.stats.favoris = count,
      error: (err) => console.error('Erreur comptage favoris :', err)
    });
    flatpickr("#datepicker", {
      minDate: "today",
      locale: "fr",
    });
    this.circuitService.countCircuitsValides().subscribe({
      next: (count: number) => this.stats.circuits = count,
      error: (err) => console.error('Erreur comptage circuits :', err)
    });
    this.suggestionService.countSuggestions().subscribe({
      next: (count: number) => {
        this.stats.suggestions = count;
      },
      error: (err) => {
        console.error('Erreur récupération suggestions IA :', err);
      }
    });

    this.startAutoSlide();
    this.clientService.getLastActivity(Number(this.userId)).subscribe({
      next: activityDate => {
        if (activityDate) {
          this.stats.lastActivity = activityDate;
        } else {
          this.stats.lastActivity = "Aucune activité enregistrée";
        }
      },
      error: err => {
        if (err.status === 204) {
          this.stats.lastActivity = "Aucune activité enregistrée";
        } else {
          console.error("Erreur lors de la récupération :", err);
          this.stats.lastActivity = "Erreur serveur";
        }
      }
    });



    this.planningService.getPlanning(Number(this.userId)).subscribe({
      next: (res: PlanningDto) => {
        this.planning = res;
        console.log('🎯 Événement local reçu :', this.planning.evenementLocal);

      },
      error: (err) => {
        console.error('Erreur de chargement du planning', err);
        this.planning.prochaineReservation = 'Erreur lors du chargement';
        this.planning.evenementLocal = null; // ✅ garder null pour respecter le type
      }
    });


    setTimeout(() => {
      this.triggerToast(`Bienvenue sur votre tableau de bord, ${this.username} ! Découvrez les dernières tendances écoresponsables et vos statistiques personnalisées.`);
    }, 5000);

    this.selectTipOfTheDay();
  }
  getEtapesArray(etapesString?: string): string[] {
    return etapesString
      ?.split(/Étape\s*\d+:/)
      .map(e => e.trim())
      .filter(e => e.length > 0) || [];
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
    this.loadSuggestionIA();
  }


  // ===== METEO =====
  getWeather(city: string): void {
    this.weatherService.getWeather(city).subscribe({
      next: (data) => {
        if (data && data.weather && data.main) {
          this.weather = data;
          this.weatherError = false;

          // Récupération de la description logique basée sur la ville
          this.weatherService.getWeatherDescriptionLogique(city).subscribe(desc => {
            this.weatherDescriptionLogique = desc;
            this.setWeatherCssClassFromDescription(desc); // Mets à jour la classe CSS selon ta description logique
          });

        } else {
          console.warn('⛅ Données météo incomplètes pour', city, data);
          this.weatherError = true;
        }
      },
      error: (err) => {
        console.error('❌ Erreur lors de la récupération météo pour', city, err);
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

  ngOnDestroy() {
    clearInterval(this.intervalId);
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000); // change toutes les 5 sec
  }

  nextSlide() {
    if (!this.circuitsMeteo) return;
    this.currentIndex = (this.currentIndex + 1) % this.circuitsMeteo.length;
  }

  prevSlide() {
    if (!this.circuitsMeteo) return;
    this.currentIndex = (this.currentIndex - 1 + this.circuitsMeteo.length) % this.circuitsMeteo.length;
  }

  goToSlide(index: number) {
    this.currentIndex = index;
  }
  async loadCircuitsByMeteo() {
    try {
      const position = await this.geolocService.getPosition();
      const { latitude, longitude } = position.coords;

      const city = await this.geolocService.getCityFromCoords(latitude, longitude);
      const selectedCity = city || 'Tunisie';

      const condition = await firstValueFrom(this.weatherService.getWeatherCondition(selectedCity));
      this.weatherCondition = condition;

      this.circuitService.getCircuitsByMeteo(condition).subscribe(circuits => {
        this.circuitsMeteo = circuits;
      });

    } catch (err) {
      console.error('Erreur géolocalisation ou météo :', err);
      this.getWeather('Tunisie'); // fallback
    }
  }
  setWeatherCssClassFromDescription(description: string) {
    const desc = description.toLowerCase();

    if (desc.includes('pluie')) {
      this.weatherCssClass = 'weather weather-rain';
    } else if (desc.includes('canicule') || desc.includes('très chaud') || desc.includes('chaud')) {
      this.weatherCssClass = 'weather weather-clear';  // soleil chaud
    } else if (desc.includes('ciel dégagé')) {
      this.weatherCssClass = 'weather weather-clear';
    } else if (desc.includes('nuageux')) {
      this.weatherCssClass = 'weather weather-clouds';
    } else if (desc.includes('neige')) {
      this.weatherCssClass = 'weather weather-snow';
    } else if (desc.includes('orage') || desc.includes('tonnerre')) {
      this.weatherCssClass = 'weather weather-thunderstorm';
    } else if (desc.includes('bruine')) {
      this.weatherCssClass = 'weather weather-drizzle';
    } else if (desc.includes('froid') || desc.includes('frais')) {
      this.weatherCssClass = 'weather weather-clouds'; // tu peux créer une autre classe si tu veux
    } else {
      this.weatherCssClass = 'weather'; // style neutre par défaut
    }
  }
// ===== Suggestion IA personnalisée =====
  loadSuggestionIA() {
    if (!this.userId) {
      console.error('UserId manquant');
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.isLoading = true;

    this.suggestionService.getCircuitPersonnalise(Number(this.userId), this.localisation).subscribe({
      next: data => {
        this.circuit = data;        // assigne bien la donnée reçue à this.circuit
        this.isLoading = false;
        this.hasError = false;
        console.log('Suggestion IA reçue:', data);

      },
      error: err => {
        console.error('Erreur suggestion IA', err);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  popupOuverte = false;

  event = {
    titre: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    localisation: ''
  };

  ouvrirPopup() {
    this.popupOuverte = true;
  }

  fermerPopup() {
    this.popupOuverte = false;
  }

  planifier() {
    this.planningService.ajouterEvenementLocal(this.event).subscribe({
      next: res => {
        alert("✅ Événement planifié !");
        this.fermerPopup();
      },
      error: err => alert("❌ Erreur : " + err.error.message || "Impossible de créer l’événement")
    });
  }
  popupOuverteEvent = false;

  chargerEvenementLocal(id: number | undefined) {
    if (!id) {
      console.error('ID événement local invalide:', id);
      return;
    }
    this.planningService.getEvenementById(id).subscribe({
      next: (evenement) => {
        this.evenement = evenement;
        this.popupOuverteEvent = true;
      },
      error: (err) => {
        console.error('Erreur chargement événement local', err);
        this.evenement = null;
        this.popupOuverteEvent = true;
      }
    });
  }

  fermerPopupEvent() {
    this.popupOuverteEvent = false;
  }

}
