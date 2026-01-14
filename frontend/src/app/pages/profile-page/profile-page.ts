// src/app/pages/profile-page/profile-page.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Api } from '../../services/api';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
})
export class ProfilePage {
  private api = inject(Api);

  isLoading = signal(true);
  isSaving = false;
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
    this.api.getUserMe().subscribe({
      next: (response) => {
        const user = response.user;

        this.profileForm.patchValue({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phoneNumber: user.phoneNumber,
          bio: user.bio ?? '',
        });
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  saveProfile() {
    if (this.isSaving) return;

    this.isSaving = true;
    this.saveStatus = 'SAVING...';

    const { firstname, lastname, email, phoneNumber, bio } = this.profileForm.getRawValue();

    this.api
      .updateMyProfile({
        firstname,
        lastname,
        email,
        phoneNumber,
        bio: bio || undefined,
      })
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.saveStatus = 'SUCCESS ✓';

          setTimeout(() => {
            this.saveStatus = 'SAVE CHANGES';
          }, 1500);
        },
        error: () => {
          this.isSaving = false;
          this.saveStatus = 'SAVE CHANGES';
        },
      });
  }
}
