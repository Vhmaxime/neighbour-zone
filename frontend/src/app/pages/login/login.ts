import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
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
  error = signal<string | null>(null);
  isSubmitting = signal(false);

  form: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    rememberMe: FormControl<boolean>;
  }>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      email: this.fb.control('', {
        validators: [Validators.required, Validators.email],
        nonNullable: true,
      }),
      password: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      rememberMe: this.fb.control(false, { nonNullable: true }),
    });
  }

  public onSubmit() {
    if (this.form.invalid) return;

    const { email, password, rememberMe } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.error.set(null);

    firstValueFrom(this.authService.login({ email, password, rememberMe }))
      .then(() => {
        this.isSubmitting.set(false);
        this.router.navigate(['/explore']);
      })
      .catch((err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error?.message || 'An error occurred. Please try again.');
      });
  }
}
