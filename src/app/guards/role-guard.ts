import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ClientService } from '../Services/ClientService';

@Injectable({
  providedIn: 'root'
})
export class RoleStatutGuard implements CanActivate {

  constructor(private clientService: ClientService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const expectedRoles = route.data['roles'] as string[] || [];
    const userRole = this.clientService.getUserRole();
    const userStatut = this.clientService.getUserStatut();

    if (!userRole || !userStatut) {
      this.router.navigate(['/login']);
      return false;
    }

    if (!expectedRoles.includes(userRole)) {
      // Rôle non autorisé
      this.router.navigate(['/unauthorized']); // page d'accès refusé (à créer)
      return false;
    }

    if (userStatut !== 'actif') {
      // Compte non actif => rediriger ou afficher message
      this.router.navigate(['/compte-inactif']); // page compte inactif (à créer)
      return false;
    }

    return true;
  }
}
