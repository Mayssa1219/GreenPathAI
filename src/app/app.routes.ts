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


export const routes: Routes = [
  { path: '', component: HomeComponent },       // Page d'accueil
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'otp-verification', component: OtpVerifyComponent },
  { path: 'signup-success', component: SignupSuccessComponent },
  { path: 'forgot-password', component: ForgetPasswordComponent },
  { path: 'reset-password', loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPasswordComponent) },

  {
    path: 'dashboard',
    component: DashboardComponent, canActivate: [AuthGuard, RoleStatutGuard],
    data: { roles: ['client','admin'] } },
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
