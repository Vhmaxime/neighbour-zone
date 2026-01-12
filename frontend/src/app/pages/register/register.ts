import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  error = signal<string | null>(null);

  form: FormGroup<{
    name: FormControl<string>;
    email: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private router = inject(Router);
  isSubmitting = signal(false);

  constructor() {
    this.form = this.fb.group(
      {
        name: this.fb.control('', { validators: Validators.required, nonNullable: true }),
        email: this.fb.control('', {
          validators: [Validators.required, Validators.email],
          nonNullable: true,
        }),
        password: this.fb.control('', { validators: Validators.required, nonNullable: true }),
        confirmPassword: this.fb.control('', {
          validators: Validators.required,
          nonNullable: true,
        }),
      },
      {
        validators: this.passwordsMatch,
      }
    ) as FormGroup<{
      name: FormControl<string>;
      email: FormControl<string>;
      password: FormControl<string>;
      confirmPassword: FormControl<string>;
    }>;
  }

  passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  submit() {
    if (this.form.invalid) return;

    const { name, email, password } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.error.set(null);

    this.auth.register({ name, email, password }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.error.set(err.error.message || 'An error occurred. Please try again.');
      },
    });
  }
}
