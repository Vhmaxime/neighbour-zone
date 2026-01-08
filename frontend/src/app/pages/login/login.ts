import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router, RouterModule } from '@angular/router';

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
  private router = inject(Router);

  constructor() {
    this.form = this.fb.group({
      email: this.fb.control('', { validators: [Validators.required, Validators.email], nonNullable: true }),
      password: this.fb.control('', { validators: Validators.required, nonNullable: true }),
      rememberMe: this.fb.control(false, { nonNullable: true })
    });

    if (this.auth.getToken()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async submit() {
    if (this.form.invalid) return;

    const { email, password, rememberMe } = this.form.getRawValue();

    try {
      this.error.set(null); // Clear previous errors
      
      // Await the promise from the fetch API
      const response = await this.auth.login({ email, password });
      
      // Success logic
      const token = response?.token; 
      
      if (token) {
        this.auth.saveToken(token, rememberMe);
        this.router.navigate(['/dashboard']);
      } else {
        // Handle case where login worked but no token was returned
        this.error.set('Login successful but no token received.');
      }
      
      console.log('Logged in', response);

    } catch (err: any) {
      // Error logic (catches the errors thrown by your Auth service)
      console.error(err);
      
      // If the error is an object with a message, use it; otherwise default text
      const errorMessage = err.message || 'Invalid credentials';
      this.error.set(errorMessage);
    }
  }
}

