import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
  FormGroup,
  FormControl,
} from '@angular/forms';
import { AuthService } from '../../services/auth';
import { UserService } from '../../services/user';
import { firstValueFrom } from 'rxjs';
import { ProfileUpdateForm } from '../../components/profile-update-form/profile-update-form';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileUpdateForm],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings implements OnInit {
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  // -- PROFILE STATE --
  public isLoadingProfile = signal(true);
  public isSavingProfile = signal(false);
  public saveProfileStatus = 'SAVE CHANGES';
  public maxChars = 250;

  // -- SECURITY STATE --
  error = signal<string | null>(null);
  isUpdatingPassword = signal(false);
  isDeletingAccount = signal(false);

  // -- FORMS --
  profileForm = new FormGroup({
    firstname: new FormControl('', { nonNullable: true }),
    lastname: new FormControl('', { nonNullable: true }),
    email: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    phoneNumber: new FormControl('', { nonNullable: true }),
    bio: new FormControl(''),
  });

  securityForm: FormGroup<{
    currentPassword: FormControl<string>;
    newPassword: FormControl<string>;
    confirmPassword: FormControl<string>;
  }>;

  constructor() {
    this.securityForm = this.formBuilder.group(
      {
        currentPassword: ['', [Validators.required]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#$%^&*])/),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatch }
    );
  }

  ngOnInit() {
    this.loadProfile();
  }

  private loadProfile() {
    this.isLoadingProfile.set(true);
    firstValueFrom(this.userService.getCurrentUser())
      .then(({ user }) => {
        this.profileForm.setValue({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || '',
        });
      })
      .finally(() => {
        this.isLoadingProfile.set(false);
      });
  }

  public saveProfile() {
    if (this.isSavingProfile()) return;
    this.isSavingProfile.set(true);
    this.saveProfileStatus = 'SAVING...';

    const { firstname, lastname, phoneNumber, bio } = this.profileForm.getRawValue();

    firstValueFrom(
      this.userService.updateCurrentUser({
        firstname,
        lastname,
        phoneNumber,
        bio: bio || undefined,
      })
    )
      .then(({ user }) => {
        this.saveProfileStatus = 'SAVED!';
        this.isSavingProfile.set(false);
        this.profileForm.setValue({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || '',
        });

        setTimeout(() => (this.saveProfileStatus = 'SAVE CHANGES'), 3000);
      })
      .catch(() => {
        this.isSavingProfile.set(false);
        this.saveProfileStatus = 'SAVE CHANGES';
      });
  }

  passwordsMatch(group: FormGroup) {
    const password = group.get('newPassword')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  private passwordValue(): string {
    return this.securityForm.get('newPassword')?.value || '';
  }

  hasUppercase() {
    return /[A-Z]/.test(this.passwordValue());
  }

  hasLowercase() {
    return /[a-z]/.test(this.passwordValue());
  }

  hasNumber() {
    return /[0-9]/.test(this.passwordValue());
  }

  hasSpecial() {
    return /[!@#$%^&*]/.test(this.passwordValue());
  }

  hasMinLength() {
    return this.passwordValue().length >= 8;
  }

  updatePassword() {
    if (this.securityForm.invalid) {
      this.error.set(
        'Password must be at least 8 characters and include uppercase, lowercase, number and special character.'
      );
      return;
    }

    const { currentPassword, newPassword } = this.securityForm.getRawValue();

    this.isUpdatingPassword.set(true);
    this.error.set(null);

    this.userService.updateCurrentUserPassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.isUpdatingPassword.set(false);
        this.securityForm.reset();
        alert('Password updated successfully!');
      },
      error: (err) => {
        this.isUpdatingPassword.set(false);
        this.error.set(err.error?.message || 'Failed to update password.');
      },
    });
  }

  deleteAccount() {
    if (!confirm('Are you sure you want to delete your account?')) return;

    this.isDeletingAccount.set(true);

    this.userService.deleteCurrentUser().subscribe({
      next: () => {
        this.authService.logout();
      },
      error: (err) => {
        this.isDeletingAccount.set(false);
        this.error.set(err.error?.message || 'Delete failed.');
      },
    });
  }
}
