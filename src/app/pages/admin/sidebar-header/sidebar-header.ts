import {Component, OnInit} from '@angular/core';
import {NotificationsComponent} from '../../client/notifications/notifications';
import {Router, RouterModule} from '@angular/router';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {AdminAuthService} from '../../../Services/admin-authService';
import {DashboardService} from '../../../Services/DashboardService';
import {AppNotification} from '../../../models/Notification';
import {NotificationService} from '../../../Services/NotificationService';

@Component({
  selector: 'app-sidebar-header',
  standalone: true,
  imports: [RouterModule,ReactiveFormsModule, CommonModule,NotificationsComponent],
  templateUrl: './sidebar-header.html',
  styleUrl: './sidebar-header.css'
})
export class SidebarHeader implements OnInit {
  collapsed = false;
  isDarkTheme = false;
  isUsersExpanded = false;
  // Admin info
  adminId!: string;
  adminData: any;
  adminName: string = '';
  adminPhotoUrl: string = '';
  adminEmail: string | null = null;
  adminRole: string | null = null;
  adminStatus: string | null = null;
  toggleUsersMenu() {
    this.isUsersExpanded = !this.isUsersExpanded;
  }


  constructor(    private notificationService:NotificationService
  ,private router:Router,private dashboardService: DashboardService,private authService:AdminAuthService) {
    // Appliquer thème initial selon préférence ou stockage local
    const savedTheme = localStorage.getItem('theme');
    this.isDarkTheme = savedTheme === 'dark';
    this.updateTheme();
  }
  ngOnInit() {
    this.loadAdminInfo();
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
    this.dashboardService.getUserNotifications(Number(this.adminId)).subscribe({
      next: (notifs) => {
        this.notifications = notifs;
      },
      error: (err) => console.error("Erreur notifications", err)
    });
  }

  toggleSidebar(): void {
    this.collapsed = !this.collapsed;
  }

  toggleTheme(): void {
    this.isDarkTheme = !this.isDarkTheme;
    localStorage.setItem('theme', this.isDarkTheme ? 'dark' : 'light');
    this.updateTheme();
  }

  updateTheme(): void {
    if (this.isDarkTheme) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }



  stopVoice(): void {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  logout(): void {
    this.authService.logout(); // supprime token localement
    // navigation via le router Angular plutôt que window.location
    this.router.navigate(['/login-admin']);
  }

  performMenuSearch(query: string): void {
    // Recherche dans le menu si tu souhaites l’implémenter
    console.log('Recherche dans menu:', query);
  }
  showNotifications = false;
  notifCount = 0;
  notifications: AppNotification[] = [];

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }
  get unreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

}
