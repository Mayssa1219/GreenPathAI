import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import {OtpVerifyComponent} from './pages/otp-verify/otp-verify';
import { SignupSuccessComponent } from './pages/signup-success/signup-success';
import {ForgetPasswordComponent} from './pages/forget-password/forget-password';
import {DashboardComponent} from './pages/client/dashboard/dashboard';
export const routes: Routes = [
  { path: '', component: HomeComponent },       // Page d'accueil
  { path: 'login', component: LoginComponent }, // Page de connexion
  { path: 'signup', component: SignupComponent }, // Page d'inscription
  { path: 'otp-verification', component: OtpVerifyComponent },// Page de vérification OTP
  {path: 'signup-success', component: SignupSuccessComponent } ,// Page de succès d'inscription
  {path:'forgot-password', component:ForgetPasswordComponent}, // Page de mot de passe oublié
  {path:'reset-password', loadComponent: () => import('./pages/reset-password/reset-password').then(m => m.ResetPasswordComponent)}, // Page de réinitialisation de mot de passe
  { path: 'dashboard', component: DashboardComponent }, // Page de tableau de bord du client
  {path: '**', redirectTo: '', pathMatch: 'full' } // Redirection pour les routes inconnues
];
