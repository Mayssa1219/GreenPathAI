import { Component, ViewEncapsulation } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  ValidatorFn,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { AuthService } from '../../Services/authService'; // <-- Ajoute l'import

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService) { // <-- Injecte AuthService
    this.signupForm = this.fb.group({
      FullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      location: ['', Validators.required],
      preferences: [[], Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordsMatchValidator });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordsMismatch: true };
  };

  onSignUp() {
    if (this.signupForm.valid) {
      const formValue = this.signupForm.value;
      // Prépare l'objet à envoyer au backend (ajuste les noms de champs selon ton backend)
      const clientData = {
        fullname: formValue.FullName,
        email: formValue.email,
        location: formValue.location,
        preferences: formValue.preferences,
        password: formValue.password
        // Ajoute d'autres champs si besoin (le backend doit accepter ces noms)
      };
      this.authService.register(clientData).subscribe({
        next: res => {
          this.successMessage = "Inscription réussie !";
          this.errorMessage = '';
          this.signupForm.reset();
        },
        error: err => {
          this.errorMessage = "Erreur lors de l'inscription";
          this.successMessage = '';
        }
      });
    }
  }

  preferencesList = [
    { label: 'Nature', value: 'nature' },
    { label: 'Patrimoine', value: 'patrimoine' },
    { label: 'Gastronomie', value: 'gastronomie' },
    { label: 'Sport', value: 'sport' },
    { label: 'Bien-être', value: 'bien-etre' }
  ];
}
