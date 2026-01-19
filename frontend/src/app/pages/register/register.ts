import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PasswordValidation } from '../../components/password-validation/password-validation';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, PasswordValidation],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {
  // Inject dependencies
  private formBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  //Form definition
  public registerForm = this.formBuilder.nonNullable.group({
    firstname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    lastname: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    username: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  // State signals
  public isLoading = signal<boolean>(false);
  public error = signal<string | null>(null);
  public isSuccess = signal<boolean>(false);

  // Form submission handler
  public onSubmit() {
    const { firstname, lastname, username, email, phoneNumber, password } = this.registerForm.value;

    if (
      this.registerForm.invalid ||
      !email ||
      !password ||
      !firstname ||
      !lastname ||
      !phoneNumber ||
      !username
    ) {
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);
    this.isSuccess.set(false);

    firstValueFrom(
      this.authService.register({
        firstname,
        lastname,
        username,
        email,
        phoneNumber,
        password,
      }),
    )
      .then(() => {
        this.isSuccess.set(true);
        this.router.navigate(['/explore']);
      })
      .catch((error) => {
        if (error.error.message) {
          this.error.set(error.error.message);
          return;
        }
        console.error('Error registering:', error);
        this.error.set('An unexpected error occurred. Please try again.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }
}
