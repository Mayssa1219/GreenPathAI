import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../Services/authService';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  templateUrl: './otp-verify.html',
  styleUrls: ['./otp-verify.css'],
  imports: [ReactiveFormsModule,CommonModule]
})
export class OtpVerifyComponent implements OnInit {
  otpForm: FormGroup;
  otpControls = ['d0', 'd1', 'd2', 'd3', 'd4', 'd5'];
  email: string = '';
  errorMessage: string = '';
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    // Création dynamique de 6 contrôles pour chaque chiffre
    const group: { [key: string]: FormControl } = {};
    this.otpControls.forEach(ctrl =>
      group[ctrl] = new FormControl('', [Validators.required, Validators.pattern('^[0-9]$')])
    );
    this.otpForm = new FormGroup(group);
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  // Déplacement du focus automatiquement d'un champ à l'autre
  onOtpInput(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;
    if (input.value.length === 1 && index < 5) {
      const next = document.querySelectorAll('.otp-digit')[index + 1] as HTMLElement;
      next?.focus();
    }
    if (event.key === 'Backspace' && !input.value && index > 0) {
      const prev = document.querySelectorAll('.otp-digit')[index - 1] as HTMLElement;
      prev?.focus();
    }
  }

  // Permet de coller le code complet d'un coup
  onPasteOtp(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData('text') ?? '';
    if (/^\d{6}$/.test(paste)) {
      paste.split('').forEach((v, i) => {
        this.otpForm.get(this.otpControls[i])?.setValue(v);
      });
      (document.querySelectorAll('.otp-digit')[5] as HTMLElement)?.focus();
      event.preventDefault();
    }
  }

  onVerifyOtp() {
    if (this.otpForm.valid && this.email) {
      this.loading = true;
      const code = this.otpControls.map(c => this.otpForm.get(c)?.value).join('');
      this.authService.verifyOtp(this.email, code).subscribe({
        next: (_res: any) => {
          this.loading = false;
          this.router.navigate(['/signup-success']);
        },
        error: err => {
          this.loading = false;
          this.errorMessage = err?.error?.message || "Code OTP incorrect ou expiré.";
        }
      });
    }
  }
}
