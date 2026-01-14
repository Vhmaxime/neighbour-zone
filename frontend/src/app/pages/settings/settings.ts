import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  private authService = inject(AuthService);

  error = signal<string | null>(null);
  isUpdatingPassword = signal(false);
  isDeletingAccount = signal(false);

  form: FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  constructor() {
    this.form = this.fb.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch }
    );
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  private passwordValue(): string {
    return this.form.get('newPassword')?.value || '';
  }

  hasUppercase() {
    return /[A-Z]/.test(this.passwordValue());
  }

  hasLowercase() {
    return /[a-z]/.test(this.passwordValue());
  }

  hasNumber() {
    return /[0-9]/.test(this.passwordValue());
  }

  hasSpecial() {
    return /[!@#$%^&*]/.test(this.passwordValue());
  }

  hasMinLength() {
    return this.passwordValue().length >= 8;
  }

  updatePassword() {
    if (this.form.invalid) {
      this.error.set(
        'Password must be at least 8 characters and include uppercase, lowercase, number and special character.'
      );
      return;
    }

    const { currentPassword, newPassword } = this.form.getRawValue();

    this.isUpdatingPassword.set(true);
    this.error.set(null);

    this.userService.updateCurrentUserPassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.form.reset();
        alert('Password updated successfully!');
      },
      error: (err) => {
        this.isUpdatingPassword.set(false);
        this.error.set(err.error?.message || 'Failed to update password.');
      },
    });
  }

  deleteAccount() {
    if (!confirm('Are you sure you want to delete your account?')) return;

    this.isDeletingAccount.set(true);

    this.userService.deleteCurrentUser().subscribe({
      next: () => {
        this.authService.logout();
      },
      error: (err) => {
        this.isDeletingAccount.set(false);
        this.error.set(err.error?.message || 'Delete failed.');
      },
    });
  }
}
