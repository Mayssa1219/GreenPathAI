import { Component, OnInit } from '@angular/core';
import { SidebarHeader } from '../sidebar-header/sidebar-header';
import { CommonModule } from '@angular/common';
import { MapComponent } from '../../../map/map';
import { Client } from '../../../models/client';
import { DashboardService } from '../../../Services/DashboardService';
import { BaseChartDirective } from 'ng2-charts';
import { ChartDataset, ChartOptions } from 'chart.js';
import { AdminAuthService } from '../../../Services/admin-authService';
import { Router } from '@angular/router';
import {GeocodingService} from '../../../Services/GeocodingService';
import {concatMap, delay, filter, from, map, of, toArray} from 'rxjs';
import {catchError} from 'rxjs/operators';
import { VoiceService } from '../../../Services/VoiceService';


interface RawLocation {
  location?: string;
  label?: string;
  type?: string;
}
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [SidebarHeader, CommonModule, MapComponent, BaseChartDirective],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  // Admin info
  adminId!: string;
  adminData: any;
  adminName: string = '';
  adminPhotoUrl: string = '';
  adminEmail: string | null = null;
  adminRole: string | null = null;
  adminStatus: string | null = null;

  // Statistiques principales
  totalUsers = 0;
  totalCircuits = 0;
  satisfactionAvg = 0;
  totalReviews = 0;
  recentCircuits = 0;
  totalFavorites = 0;

  // Graphiques
  months: string[] = [];
  reservationData: ChartDataset<'line'>[] = [];
  roles: string[] = ['Client', 'Admin','Guide'];
  userDistribution: any[] = [];

  // Utilisateurs récents
  latestUsers: Client[] = [];

  // Localisations
  userLocations: any[] = [];

  // Widgets supplémentaires
  alerts: { message: string }[] = [];
  topCircuits: { name: string; score: number }[] = [];
  feedbackMessage = '';

  constructor(
    private router: Router,
    private dashboardService: DashboardService,
    private authService: AdminAuthService,
    private geocoding: GeocodingService ,// Utilisation du service pour géocodage
    private voice: VoiceService // Service pour la synthèse vocale
  ) {}

  ngOnInit(): void {

    this.loadAdminInfo();
    this.loadStats();
    this.loadCharts();
    this.loadLatestUsers();
    this.loadLocations();
    this.loadWidgets();
    setTimeout(() => {
      this.triggerToast(`Bienvenue sur votre tableau de bord, ${this.adminName} ! Découvrez les dernières tendances écoresponsables et vos statistiques personnalisées.`);
    }, 5000);

  }
  showToast = false;
  toastMessage = '';
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
  stopVoice(): void {
    // 1) Annule la lecture vocale
    this.voice.cancel();

  }

  private loadAdminInfo(): void {
    const decoded = this.dashboardService.getDecodedToken();
    console.log('Décodage du token admin:', decoded);

    if (decoded && decoded.sub) {
      this.adminId = decoded.sub;
      this.adminEmail = decoded.email || '';
      this.adminRole = decoded.role || 'admin';

      this.dashboardService.getAdminInfo(this.adminId).subscribe({
        next: (admin) => {
          this.adminData = admin;
          this.adminName =  `${admin.prenom} ${admin.nom}` || 'Admin';
          this.adminEmail = admin.email;
          this.adminPhotoUrl = admin.photoUrl || 'default-avatar.png';
        },
        error: (err) => {
          console.error('Erreur récupération admin:', err);
          this.authService.logout();
          this.router.navigate(['/login-admin']);
        }
      });
    } else {
      this.authService.logout();
      this.router.navigate(['/login-admin']);
    }
  }

  loadStats() {
    this.dashboardService.getStats().subscribe(stats => {
      this.totalUsers = stats.totalUsers;
      this.totalCircuits = stats.totalCircuits;
      this.satisfactionAvg = stats.satisfactionAvg;
      this.totalReviews = stats.totalReviews;
      this.recentCircuits = stats.recentCircuits;
      this.totalFavorites = stats.totalFavorites;
    });
  }

  loadCharts() {
    this.dashboardService.getReservationStats().subscribe(data => {
      this.months = data.labels;
      this.reservationData = [{ data: data.values, label: 'Réservations mensuelles' }];
    });

    this.dashboardService.getUserRoleDistribution().subscribe(data => {
      this.userDistribution = [
        { data: data.values, backgroundColor: ['#4CAF50', '#2196F3'], label: 'Répartition' }
      ];
    });
  }

  loadLatestUsers() {
    this.dashboardService.getLatestUsers().subscribe(users => {
      this.latestUsers = users.map(user => ({
        ...user,
        motDePasse: '',
        location: ''
      } as Client));
    });
  }

  loadLocations() {
    this.dashboardService.getUserLocations().subscribe((rawLocations: RawLocation[]) => {
      console.log('raw locations', rawLocations);

      from(rawLocations).pipe(
        concatMap(loc => {
          const address = loc.label || loc.location || '';
          return from(this.geocoding.geocode(address)).pipe(
            delay(300), // throttle pour Nominatim
            map(coords => {
              if (coords) {
                const enriched = {
                  location: address,
                  lat: coords.lat,
                  lng: coords.lng,
                  label: address,
                  type: (loc.type || 'client') as string
                };
                return enriched;
              }
              console.warn('Pas de coord pour', address);
              return null;
            }),
            catchError(err => {
              console.warn('Erreur géocodage pour', loc, err);
              return of(null);
            })
          );
        }),
        filter((x): x is { location: string; lat: number; lng: number; label: string; type: string } => x !== null),
        toArray()
      ).subscribe({
        next: (enriched: any[]) => {
          this.userLocations = enriched;
          console.log('locations géocodées pour la carte', this.userLocations);
        },
        error: err => {
          console.error('Erreur lors de la construction des locations géocodées', err);
          this.userLocations = [];
        }
      });
    });
  }

  loadWidgets() {
    this.dashboardService.getAlerts().subscribe(alerts => {
      this.alerts = alerts;
    });

    this.dashboardService.getTopCircuits().subscribe(circuits => {
      this.topCircuits = circuits;
    });

    this.dashboardService.getDailyFeedback().subscribe(feedback => {
      this.feedbackMessage = feedback.message;
    });
  }

  satisfactionData: ChartDataset<'line'>[] = [
    {
      label: 'Satisfaction Moyenne',
      data: [4.2, 4.5, 4.1, 4.7, 4.6, 4.3, 4.4, 4.8],
      fill: false,
      borderColor: '#3cb371',
      backgroundColor: '#3cb371',
      tension: 0.3,
      pointRadius: 5,
      pointHoverRadius: 7
    }
  ];

  chartOptions: ChartOptions<'line'> = {
    responsive: true,
    animation: {
      duration: 800,
      easing: 'easeOutQuart'
    },
    scales: {
      y: {
        min: 0,
        max: 5,
        border: {
          display: true,
          color: '#ccc'
        },
        ticks: {
          stepSize: 1,
          color: '#666',
          font: { size: 12, weight: '600' as any },
          callback: (value) => `${value}⭐`
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'Satisfaction (étoiles)',
          color: '#444',
          font: { size: 14, weight: '700' as any }
        }
      },
      x: {
        border: {
          display: true,
          color: '#ccc'
        },
        ticks: {
          color: '#666',
          font: { size: 12, weight: '600' as any }
        },
        grid: {
          color: 'transparent'
        },
        title: {
          display: true,
          text: 'Mois',
          color: '#444',
          font: { size: 14, weight: '700' as any }
        }
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: '#25915a',
          font: { size: 14, weight: '700' as any }
        }
      },
      tooltip: {
        backgroundColor: '#3cb371',
        titleFont: { size: 14, weight: '700' as any },
        bodyFont: { size: 13 },
        padding: 10,
        cornerRadius: 6,
        callbacks: {
          label: (ctx) => `${ctx.parsed.y} étoiles`
        }
      }
    }
  };
}
