import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  loading = false;
  submitted = false;
  errorMsg = '';
  // Demo-friendly: since there's no email service wired up, we surface the token
  // returned by the backend so you can complete the reset flow while testing locally.
  demoResetToken = '';

  private fb = inject(FormBuilder);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  constructor(private authService: AuthService) {}

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.errorMsg = '';

    this.authService.forgotPassword(this.form.value.email!).subscribe({
      next: (res) => {
        this.loading = false;
        this.submitted = true;
        this.demoResetToken = res.resetToken;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || 'Something went wrong';
      },
    });
  }
}
