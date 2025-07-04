import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/authService';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPasswordComponent {
  loading = false;
  error: string | null = null;
  success: string | null = null;
  showPassword = false;
  showConfirm = false;
  token: string = '';
  resetForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: ['', Validators.required]
    }, { validators: this.passwordsMatch });

    // Récupère le token depuis l'URL (query param)
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
  }

  passwordsMatch(form: FormGroup) {
    const pass = form.get('password')?.value;
    const conf = form.get('confirm')?.value;
    return pass === conf ? null : { mismatch: true };
  }

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }

  onSubmit() {
    if (this.resetForm.invalid) return;
    this.loading = true;
    this.error = null;
    this.auth.resetPassword(this.token, this.resetForm.value.password!).subscribe({
      next: () => {
        this.success = "Mot de passe réinitialisé avec succès !";
        this.loading = false;
        setTimeout(() => this.router.navigate(['/login']), 2000);
      },
      error: err => {
        this.error = err?.error?.message || "Erreur lors de la réinitialisation.";
        this.loading = false;
      }
    });
  }
}
