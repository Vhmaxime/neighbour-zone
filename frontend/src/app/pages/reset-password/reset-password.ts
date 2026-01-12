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

  form: FormGroup;

  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

 async submit() {
    if (this.form.invalid) return;
    
    // Clear previous states
    this.error.set(null);
    this.success.set(null);

    try {
      await this.auth.resetPassword(this.form.value.email);
      this.success.set('Check your email for reset instructions.');
    } catch (err) {
      this.error.set('Failed to send reset email.');
    }
  }
}

