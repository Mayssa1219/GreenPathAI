import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import {SignupComponent} from './pages/signup/signup';

export const routes: Routes = [
  { path: '', component: HomeComponent },       // Page d'accueil
  { path: 'login', component: LoginComponent }, // Page de connexion
  { path: 'signup', component: SignupComponent }, // Page de connexion

];
