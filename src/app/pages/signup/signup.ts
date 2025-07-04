import { Component, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
import { AuthService } from '../../Services/authService';
import {HttpClientModule} from '@angular/common/http'; // <-- Ajoute l'import

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, NgSelectModule, ],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  successMessage = '';
  errorMessage = '';

  constructor(private fb: FormBuilder, private authService: AuthService,  private http: HttpClient // <-- ici
,  private route: ActivatedRoute, // <-- à ajouter
              private router: Router ) { // <-- Injecte AuthService
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
      const clientData = {
        fullname: formValue.FullName,
        email: formValue.email,
        location: formValue.location,
        preferences: formValue.preferences,
        password: formValue.password
      };
      this.authService.register(clientData).subscribe({
        next: res => {
          console.log("Inscription réussie, on va envoyer l'OTP");
          this.authService.sendOtp(clientData.email).subscribe({
            next: () => {
              console.log("OTP envoyé, redirection...");
              this.router.navigate(['/otp-verification'], { queryParams: { email: clientData.email } });
            },
            error: err => {
              console.log("Erreur OTP:", err);
              this.errorMessage = "Inscription validée mais l'envoi du code a échoué.";
              this.successMessage = '';
            }
          });
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
  locationPreview = '';

  getCurrentLocation() {
    if (!navigator.geolocation) {
      this.errorMessage = 'La géolocalisation n’est pas supportée par votre navigateur.';
      return;
    }

    this.errorMessage = 'Détection en cours...';

    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;

        this.http.get<any>(url).subscribe({
          next: res => {
            const address = res.address;

            const road = address.road || '';
            const neighbourhood = address.neighbourhood || '';
            const suburb = address.suburb || '';
            const city = address.city || address.town || address.village || address.hamlet || '';
            const state = address.state || '';
            const postcode = address.postcode || '';
            const country = address.country || '';

            const fullLocation = [
              road,
              neighbourhood,
              suburb,
              city,
              state,
              postcode,
              country
            ].filter(part => part).join(', ');

            this.signupForm.patchValue({ location: fullLocation });
            this.locationPreview = fullLocation;
            this.errorMessage = '';
          },
          error: err => {
            console.error('Erreur reverse geocoding :', err);
            const fallback = `${latitude}, ${longitude}`;
            this.signupForm.patchValue({ location: fallback });
            this.locationPreview = fallback;
            this.errorMessage = "Coordonnées récupérées, mais la ville n'a pas pu être identifiée.";
          }
        });
      },
      error => {
        this.errorMessage = 'Impossible de récupérer votre position : ' + error.message;
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  }



}
