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

  async submit() {
    if (this.form.invalid) return;

    const { name, email, password } = this.form.getRawValue();

    try {
      this.error.set(null);

      await this.auth.register({ name, email, password });

      this.router.navigate(['/']);
    } catch (err: any) {
      console.error(err);
      this.error.set(err.message || 'Something went wrong. Please try again.');
    }
  }
}
