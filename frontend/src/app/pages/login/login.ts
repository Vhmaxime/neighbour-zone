import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Auth } from '../../services/auth';
import { catchError, EMPTY } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class Login {
  error = signal<string | null>(null);
  form: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
  }>;

  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  constructor() {
    this.form = this.fb.group({
      email: this.fb.control('', { validators: [Validators.required, Validators.email], nonNullable: true }),
      password: this.fb.control('', { validators: Validators.required, nonNullable: true })
    }) as FormGroup<{
      email: FormControl<string>;
      password: FormControl<string>;
    }>;
  }

  submit() {
    if (this.form.invalid) return;

    this.auth.login(this.form.getRawValue())
      .pipe(
        catchError(() => {
          this.error.set('Invalid credentials');
          return EMPTY;
        })
      )
      .subscribe((response) => {
        console.log('Logged in', response);
        this.error.set(null);
      });
  }
}


