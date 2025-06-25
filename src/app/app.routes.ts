import { Routes } from '@angular/router';
import { HomeComponent } from './home/home';
import { LoginComponent } from './login/login';
import {SignupComponent} from './signup/signup';

export const routes: Routes = [
  { path: '', component: HomeComponent },       // Page d'accueil
  { path: 'login', component: LoginComponent }, // Page de connexion
  { path: 'signup', component: SignupComponent }, // Page de connexion

];
