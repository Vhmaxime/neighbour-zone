import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  error: string | null = null;
  form: FormGroup;

  constructor(private fb: FormBuilder, private auth: Auth) { 
    this.form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  }

  submit() {
    if (this.form.invalid) return;

    this.auth.login(this.form.value).subscribe({
      next: (response) => {
        // TODO: redirect after backend confirms token
        console.log('Logged in', response);
        this.error = null;
      },
      error: () => {
        this.error = 'Invalid credentials';
      }
    });
  }
}

