import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Auth } from '../../services/auth';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.html',
  styleUrls: ['./reset-password.css']
})
export class ResetPassword {
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  isSubmitting = signal(false);

  form: FormGroup;

  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit() {
    if (this.form.invalid) return;
    
    const { email } = this.form.value;

    // Reset states
    this.isSubmitting.set(true);
    this.error.set(null);
    this.success.set(null);

    this.auth.resetPassword(email).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.success.set('Check your email for reset instructions')
      },
      // Error handling
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.message || 'Failed to send reset email.');
      }
    });
  }
}

