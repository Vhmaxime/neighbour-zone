import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Auth } from '../../services/auth';
import { catchError, EMPTY } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login {
  error = signal<string | null>(null);

  form: FormGroup<{
    email: FormControl<string>;
    password: FormControl<string>;
    rememberMe: FormControl<boolean>;
  }>;

  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  constructor() {
    this.form = this.fb.group({
      email: this.fb.control('', { validators: [Validators.required, Validators.email], nonNullable: true }),
      password: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      rememberMe: this.fb.control(false, { nonNullable: true }) // ADDED: nonNullable for boolean
    });
  }

  submit() {
    if (this.form.invalid) return;

    // Destructure rememberMe separately
    const { email, password, rememberMe } = this.form.getRawValue();

    // ADDED: only send email & password to login
    this.auth.login({ email, password })
      .pipe(
        catchError(() => {
          this.error.set('Invalid credentials');
          return EMPTY;
        })
      )
      .subscribe((response: any) => {
        // Persist token based on Remember Me checkbox
        const token = response?.token; // replace with your actual token property
        if (token) {
          if (rememberMe) {
            localStorage.setItem('authToken', token); // persists across browser sessions
          } else {
            sessionStorage.setItem('authToken', token); // clears on browser/tab close
          }
        }

        console.log('Logged in', response);
        this.error.set(null);

        // Optional redirect if desired
        // this.router.navigate(['/dashboard']);
      });
  }
}


