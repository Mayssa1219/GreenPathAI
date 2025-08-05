import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NotificationService } from '../../../Services/NotificationService';
import { AppNotification, NotificationType } from '../../../models/Notification';
import { CommonModule } from '@angular/common';
import {animate, style, transition, trigger} from '@angular/animations';
import {catchError} from 'rxjs/operators';
import {DashboardService} from '../../../Services/DashboardService';
import {of} from 'rxjs';
@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class NotificationsComponent implements OnInit {
  notifications: AppNotification[] = [];
  @Output() closePanel = new EventEmitter<void>();
  filteredNotifications: AppNotification[] = [];
  activeTab: 'all' | 'unread' | 'important' = 'all';

  // IMPORTANT : adapte userId ici selon ta logique d'authentification
  userId = 16;  // mettre 16 pour correspondre à ta base ou injecter dynamiquement

  loading = false;

  constructor(private dashboardService:DashboardService,private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.loading = true;
    this.notificationService.getUserNotifications(this.userId).subscribe({
      next: (data) => {
        console.log('Raw data reçue:', data);
        if (!Array.isArray(data)) {
          console.error('Erreur : la réponse n\'est pas un tableau');
          this.notifications = [];
        } else {
          this.notifications = data.map(n => ({
            ...n,
            timestamp: new Date(n.timestamp),
            read: n.read ?? false,
            type: n.type ? (n.type.toUpperCase() as NotificationType) : 'INFORMATIONAL'
          }));
        }
        this.updateFiltered();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des notifications :', err);
        this.loading = false;

        // Optionnel : test mock local si erreur réseau
        // this.notifications = this.mockNotifications();
        // this.updateFiltered();
      }
    });
  }

  markAsRead(notification: AppNotification) {
    if (notification.read) return;

    this.notificationService.markAsRead(notification.id).pipe(
      catchError(err => {
        console.error('Erreur lors du marquage comme lu :', err);
        // fallback : par exemple, rafraîchir les alertes du tableau de bord
        this.dashboardService.getAlerts().subscribe({
          next: alerts => {
            // tu peux afficher une notification visuelle ici si besoin
            console.log('Alertes rechargées en fallback', alerts);
          },
          error: e => console.warn('Échec du fallback alert reload', e)
        });
        // tu peux aussi retourner un observable vide pour éviter de propager l'erreur
        return of(void 0);
      })
    ).subscribe({
      next: () => {
        notification.read = true;
        this.updateFiltered(); // mise à jour de l'affichage
      }
    });
  }

  setTab(tab: 'all' | 'unread' | 'important') {
    this.activeTab = tab;
    this.updateFiltered();
  }

  updateFiltered() {
    switch (this.activeTab) {
      case 'all':
        this.filteredNotifications = [...this.notifications];
        break;
      case 'unread':
        this.filteredNotifications = this.notifications.filter(n => !n.read);
        break;
      case 'important':
        this.filteredNotifications = this.notifications.filter(n =>
          n.type?.toLowerCase().includes('important')
        );
        break;
    }
  }



}
