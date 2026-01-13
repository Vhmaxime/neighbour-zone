import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings {
  error = signal<string | null>(null);
  isSubmitting = signal(false);

  form: FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group(
      {
        currentPassword: this.fb.control('', {
          validators: Validators.required,
          nonNullable: true,
        }),
        newPassword: this.fb.control('', {
          validators: Validators.required,
          nonNullable: true,
        }),
        confirmPassword: this.fb.control('', {
          validators: Validators.required,
          nonNullable: true,
        }),
      },
      { validators: this.passwordsMatch }
    );
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  updatePassword() {
    if (this.form.invalid) return;

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.error.set(null);

    this.http
      .patch('api/user/me/password', {
        currentPassword,
        newPassword,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.form.reset();
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.error.set(err.error?.message || 'Failed to update password.');
        },
      });
  }

  deleteAccount() {
    const confirmed = confirm(
      'Are you sure you want to delete your account? This action is irreversible.'
    );

    if (!confirmed) return;

    this.http.delete('/user/me').subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to delete account.');
      },
    });
  }
}
