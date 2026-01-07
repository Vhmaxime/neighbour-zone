import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Auth } from '../../services/auth';
import { catchError, EMPTY } from 'rxjs';
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

  submit() {
    if (this.form.invalid) return;

    this.auth.resetPassword(this.form.value.email)
      .pipe(
        catchError(() => {
          this.error.set('Failed to send reset email.');
          return EMPTY;
        })
      )
      .subscribe(() => {
        this.success.set('Check your email for reset instructions.');
        this.error.set(null);
      });
  }
}

