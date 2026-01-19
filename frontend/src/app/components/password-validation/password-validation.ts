import { Component, input } from '@angular/core';

@Component({
  selector: 'app-password-validation',
  imports: [],
  templateUrl: './password-validation.html',
  styleUrl: './password-validation.css',
})
export class PasswordValidation {
  public value = input.required<string>();

  public hasUppercase() {
    return /[A-Z]/.test(this.value());
  }

  public hasLowercase() {
    return /[a-z]/.test(this.value());
  }

  public hasNumber() {
    return /[0-9]/.test(this.value());
  }

  public hasSpecial() {
    return /[!@#$%^&*]/.test(this.value());
  }

  public hasMinLength() {
    return this.value().length >= 8;
  }
}
