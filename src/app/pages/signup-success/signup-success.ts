import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-signup-success',
  standalone: true,
  imports: [],
  templateUrl: './signup-success.html',
  styleUrl: './signup-success.css'
})
export class SignupSuccessComponent {
  constructor(private router: Router) {}

  gotoLogin() {
    this.router.navigate(['/login']);
  }
}
