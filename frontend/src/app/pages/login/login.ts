import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  Validators,
  FormGroup,
} from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

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
  private auth = inject(Auth);
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

  async submit() {
    if (this.form.invalid) return;

    const { email, password, rememberMe } = this.form.getRawValue();

    try {
      this.isSubmitting.set(true);
      this.error.set(null);

      await this.auth.login({ email, password }, rememberMe);

      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error(err);
      this.error.set(err.message || 'Something went wrong. Please try again.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
