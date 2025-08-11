import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import {OtpVerifyComponent} from './pages/otp-verify/otp-verify';
import { SignupSuccessComponent } from './pages/signup-success/signup-success';
import {ForgetPasswordComponent} from './pages/forget-password/forget-password';
import {DashboardComponent} from './pages/client/dashboard/dashboard';
import {DashboardDelayGuard} from './guards/dashboard-delay-guard';
import { AuthGuard } from './guards/auth-guard';
import { RoleStatutGuard } from './guards/role-guard';
import {Dashboard} from './pages/admin/dashboard/dashboard';
import {Login} from './pages/admin/login/login';
import {AdminAuthGuard} from './guards/AdminAuthGuard';
import {ClientsComponent} from './pages/admin/clients/clients';
import {ForgetPassword} from './pages/admin/forget-password/forget-password';
import {CircuitsComponent} from './pages/admin/circuits/circuits';
import {AvisComponent} from './pages/admin/avis/avis';
import {HistoriquesComponent} from './pages/admin/historiques/historiques';
import {SuggestionsIAComponent} from './pages/admin/suggestions-ia/suggestions-ia';


export const routes: Routes = [
  { path: '', component: HomeComponent },       // Page d'accueil
  { path: 'login', component: LoginComponent },
  { path: 'login-admin',component:Login}, // Page de connexion admin
  { path: 'signup', component: SignupComponent },
  { path: 'otp-verification', component: OtpVerifyComponent },
  { path: 'signup-success', component: SignupSuccessComponent },
  { path: 'forgot-password', component: ForgetPasswordComponent },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPasswordComponent) },
  {
    path: 'admin-dashboard',
    component: Dashboard, canActivate: [DashboardDelayGuard]},
  {
    path: 'admin-suggestions',
    component: SuggestionsIAComponent, canActivate: [DashboardDelayGuard]},
  { path: 'forgot-password-admin', component: ForgetPassword },

  {
    path: 'admin-clients',
    component: ClientsComponent, canActivate: [DashboardDelayGuard]},
  {
    path: 'admin-circuits',
    component: CircuitsComponent, canActivate: [DashboardDelayGuard]},
  {
    path: 'admin-avis',
    component: AvisComponent, canActivate: [DashboardDelayGuard]},
  {
    path: 'admin-historiques',
    component: HistoriquesComponent, canActivate: [DashboardDelayGuard]},
  {
    path: 'dashboard',
    component: DashboardComponent, canActivate: [AuthGuard, RoleStatutGuard,DashboardDelayGuard],
    data: { roles: ['client'] } },
  {
    path: 'profile',
    loadComponent: () => import('./pages/client/profile/profile').then(m => m.Profile),
    canActivate: [AuthGuard, RoleStatutGuard,DashboardDelayGuard],
    data: { roles: ['client'] }  // accessible uniquement aux clients
  },
  {
    path: 'favoris',
    loadComponent: () => import('./pages/client/favorites/favorites').then(m => m.FavoritesComponent),
    canActivate: [AuthGuard, RoleStatutGuard, DashboardDelayGuard],
    data: { roles: ['client'] }
  },
  {   path: 'circuits',
    loadComponent: () => import('./pages/client/recherche-circuits/recherche-circuits').then(m => m.RechercheCircuits),
    canActivate: [AuthGuard, RoleStatutGuard,DashboardDelayGuard],
    data: { roles: ['client'] } },

  { path: 'loading', loadComponent: () => import('./loading/loading').then(m => m.LoadingComponent) },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
