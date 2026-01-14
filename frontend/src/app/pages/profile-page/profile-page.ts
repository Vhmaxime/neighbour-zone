// src/app/pages/profile-page/profile-page.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
})
export class ProfilePage {
  private userService = inject(UserService);

  isLoading = signal(true);
  isSaving = signal(false);
  saveStatus = 'SAVE CHANGES';
  bioText: string = '';
  maxChars = 250;

  profileForm = new FormGroup({
    firstname: new FormControl('', { nonNullable: true }),
    lastname: new FormControl('', { nonNullable: true }),
    email: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    phoneNumber: new FormControl('', { nonNullable: true }),
    bio: new FormControl(''),
  });

  ngOnInit() {
    this.userService.getCurrentUser().subscribe({
      next: (response) => {
        const { bio, firstname, lastname, email, phoneNumber } = response.user;

        this.profileForm.patchValue({
          firstname: firstname,
          lastname: lastname,
          email: email,
          phoneNumber: phoneNumber,
          bio: bio ?? '',
        });
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  saveProfile() {
    if (this.isSaving()) return;

    this.isSaving.set(true);
    this.saveStatus = 'SAVING...';

    const { firstname, lastname, email, phoneNumber, bio } = this.profileForm.getRawValue();

    this.userService
      .updateCurrentUser({
        firstname,
        lastname,
        email,
        phoneNumber,
        bio: bio || undefined,
      })
      .subscribe({
        next: () => {
          this.isSaving.set(false);
          this.saveStatus = 'SUCCESS ✓';

          setTimeout(() => {
            this.saveStatus = 'SAVE CHANGES';
          }, 1500);
        },
        error: () => {
          this.isSaving.set(false);
          this.saveStatus = 'SAVE CHANGES';
        },
      });
  }
}
