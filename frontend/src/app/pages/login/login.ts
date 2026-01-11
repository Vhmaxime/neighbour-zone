import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormControl, Validators, FormGroup } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
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
      this.error.set(null); // Clear old errors

      // Await the Promise directly
      const response = await this.auth.login({ email, password });

      const token = response?.accessToken;

      if (token) {
        this.auth.saveToken(token, rememberMe);
        this.router.navigate(['/dashboard']);
      } else {
        // Fallback if the login worked but no token came back
        console.log('Login response:', response);
        this.error.set('Login successful, but no token received.');
      }

    } catch (err: any) {
      console.error(err);
      // Auth service throws nice errors
      // We can display those directly, or fall back to a generic message
      this.error.set(err.message || 'Invalid credentials');
    }
  }
}

