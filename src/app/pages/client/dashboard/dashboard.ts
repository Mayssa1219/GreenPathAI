import { Component } from '@angular/core';
import {NavbarComponent} from '../navbar/navbar';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NavbarComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {

  constructor() {
    // Initialisation des données ou des services nécessaires
  }

}
