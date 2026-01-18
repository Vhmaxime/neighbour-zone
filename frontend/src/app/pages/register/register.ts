import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public registerForm = this.formBuilder.nonNullable.group({
    firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public isSuccess = signal<boolean>(false);

  public hasUppercase() {
    return /[A-Z]/.test(this.registerForm.get('password')?.value || '');
  }

  public hasLowercase() {
    return /[a-z]/.test(this.registerForm.get('password')?.value || '');
  }

  public hasNumber() {
    return /[0-9]/.test(this.registerForm.get('password')?.value || '');
  }

  public hasSpecial() {
    return /[!@#$%^&*]/.test(this.registerForm.get('password')?.value || '');
  }

  public hasMinLength() {
    return (this.registerForm.get('password')?.value || '').length >= 8;
  }

  public onSubmit() {
    const { firstname, lastname, username, email, phoneNumber, password } = this.registerForm.value;
    if (
      this.registerForm.invalid ||
      !email ||
      !password ||
      !firstname ||
      !lastname ||
      !phoneNumber ||
      !username
    ) {
      return;
    }
    this.isLoading.set(true);
    firstValueFrom(
      this.authService.register({
        firstname,
        lastname,
        username,
        email,
        phoneNumber,
        password,
      })
    )
      .then(() => {
        this.isSuccess.set(true);
        this.error.set(null);
        this.router.navigate(['/explore']);
      })
      .catch((error) => {
        if (error.error.message) {
          this.error.set(error.error.message);
          this.isSuccess.set(false);
          return;
        }
        console.error('Error logging in:', error);
        this.error.set('An unexpected error occurred. Please try again.');
        this.isSuccess.set(false);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
