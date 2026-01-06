import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormControl, AbstractControl, ValidationErrors } from '@angular/forms';
import { Auth } from '../../services/auth';
import { catchError, EMPTY } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
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

  constructor() {
    this.form = this.fb.group(
      {
        name: this.fb.control('', { validators: Validators.required, nonNullable: true }),
        email: this.fb.control('', { validators: [Validators.required, Validators.email], nonNullable: true }),
        password: this.fb.control('', { validators: Validators.required, nonNullable: true }),
        confirmPassword: this.fb.control('', { validators: Validators.required, nonNullable: true })
      },
      {
        validators: this.passwordsMatch
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

  submit(): void {
    if (this.form.invalid) return;

    this.auth
      .register(this.form.getRawValue())
      .pipe(
        catchError(() => {
          this.error.set('Registration failed');
          return EMPTY;
        })
      )
      .subscribe(() => {
        console.log('Registered');
        this.error.set(null);
      });
  }
}


