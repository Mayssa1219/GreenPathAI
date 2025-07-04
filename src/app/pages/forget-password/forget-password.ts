import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../Services/authService';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forget-password.html',
  styleUrl: './forget-password.css'
})
export class ForgetPasswordComponent {
  sent = false;
  loading = false;
  error: string | null = null;
  forgotForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;
    this.loading = true;
    this.error = null;
    this.auth.requestResetPassword(this.forgotForm.value.email!).subscribe({
      next: () => {
        this.sent = true;
        this.loading = false;
      },
      error: err => {
        this.error = err?.error?.message || "Erreur lors de l'envoi du mail.";
        this.loading = false;
      }
    });
  }
}
