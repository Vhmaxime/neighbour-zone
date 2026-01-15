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
  error = signal<string | null>(null);

  form: FormGroup<{
    username: FormControl<string>;
    firstname: FormControl<string>;
    lastname: FormControl<string>;
    email: FormControl<string>;
    phoneNumber: FormControl<string>;
    password: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  isSubmitting = signal(false);

  constructor() {
    this.form = this.fb.group(
      {
        username: this.fb.control('', { validators: Validators.required, nonNullable: true }),
        firstname: this.fb.control('', { validators: Validators.required, nonNullable: true }),
        lastname: this.fb.control('', { validators: Validators.required, nonNullable: true }),
        email: this.fb.control('', {
          validators: [Validators.required, Validators.email],
          nonNullable: true,
        }),
        phoneNumber: this.fb.control('', { validators: Validators.required, nonNullable: true }),
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
      username: FormControl<string>;
      firstname: FormControl<string>;
      lastname: FormControl<string>;
      email: FormControl<string>;
      phoneNumber: FormControl<string>;
      password: FormControl<string>;
      confirmPassword: FormControl<string>;
    }>;
  }

  passwordsMatch(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  public onSubmit() {
    if (this.form.invalid) return;

    const { username, firstname, lastname, email, phoneNumber, password } = this.form.getRawValue();

    this.isSubmitting.set(true);
    this.error.set(null);

    firstValueFrom(
      this.authService.register({ username, firstname, lastname, email, phoneNumber, password })
    )
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
