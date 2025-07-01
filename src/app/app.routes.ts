import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { SignupComponent } from './pages/signup/signup';
import {OtpVerifyComponent} from './pages/otp-verify/otp-verify';
import { SignupSuccessComponent } from './pages/signup-success/signup-success';
export const routes: Routes = [
  { path: '', component: HomeComponent },       // Page d'accueil
  { path: 'login', component: LoginComponent }, // Page de connexion
  { path: 'signup', component: SignupComponent }, // Page d'inscription
  { path: 'otp-verification', component: OtpVerifyComponent },// Page de vérification OTP
  {path: 'signup-success', component: SignupSuccessComponent } // Page de succès d'inscription
];
