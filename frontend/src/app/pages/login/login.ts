import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class Login {
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  public loginForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required]],
    password: ['', [Validators.required]],
    rememberMe: [false, [Validators.required]],
  });
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public isSuccess = signal<boolean>(false);

  public onSubmit() {
    const { email, password, rememberMe } = this.loginForm.value;
    if (this.loginForm.invalid || !email || !password) {
      return;
    }
    this.isLoading.set(true);
    firstValueFrom(
      this.authService.login({
        email,
        password,
        rememberMe,
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
