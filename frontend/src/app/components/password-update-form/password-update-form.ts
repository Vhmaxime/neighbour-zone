import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-password-update-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './password-update-form.html',
  styleUrl: './password-update-form.css',
})
export class PasswordUpdateForm {
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  public passwordForm = this.formBuilder.nonNullable.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.minLength(8), Validators.maxLength(32), Validators.required]],
    confirmPassword: ['', [Validators.minLength(8), Validators.maxLength(32), Validators.required]],
  });
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public isSuccess = signal<boolean>(false);

  public onSubmit() {
    if (this.passwordForm.invalid) {
      return;
    }
    this.isLoading.set(true);
    const { currentPassword, newPassword } = this.passwordForm.value;
    firstValueFrom(
      this.userService.updateCurrentUserPassword({
        currentPassword,
        newPassword,
      })
    )
      .then(() => {
        this.isSuccess.set(true);
        this.error.set(null);
      })
      .catch((error) => {
        if (error.error.message) {
          this.error.set(error.error.message);
          this.isSuccess.set(false);
          return;
        }
        console.error('Error updating password:', error);
        this.error.set('An unexpected error occurred. Please try again.');
        this.isSuccess.set(false);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public hasUppercase() {
    return /[A-Z]/.test(this.passwordForm.get('newPassword')?.value || '');
  }

  public hasLowercase() {
    return /[a-z]/.test(this.passwordForm.get('newPassword')?.value || '');
  }

  public hasNumber() {
    return /[0-9]/.test(this.passwordForm.get('newPassword')?.value || '');
  }

  public hasSpecial() {
    return /[!@#$%^&*]/.test(this.passwordForm.get('newPassword')?.value || '');
  }

  public hasMinLength() {
    return (this.passwordForm.get('newPassword')?.value || '').length >= 8;
  }
}
