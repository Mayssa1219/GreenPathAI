import { Component,ViewEncapsulation  } from '@angular/core';
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
import {NgSelectModule} from '@ng-select/ng-select';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule,NgSelectModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(private fb: FormBuilder) {
    this.signupForm = this.fb.group({
      firstName: ['', Validators.required],
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
      // Logique d'inscription
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
