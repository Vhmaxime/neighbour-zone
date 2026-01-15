// src/app/pages/profile-page/profile-page.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../services/user';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
})
export class ProfilePage {
  private userService = inject(UserService);
  public isLoading = signal(true);
  public isSaving = signal(false);
  public saveStatus = 'SAVE CHANGES';
  public bioText: string = '';
  public maxChars = 250;

  profileForm = new FormGroup({
    firstname: new FormControl('', { nonNullable: true }),
    lastname: new FormControl('', { nonNullable: true }),
    email: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    phoneNumber: new FormControl('', { nonNullable: true }),
    bio: new FormControl(''),
  });

  public ngOnInit() {
    this.getCurrentUser();
  }

  private getCurrentUser() {
    this.isLoading.set(true);
    firstValueFrom(this.userService.getCurrentUser())
      .then(({ user }) => {
        this.profileForm.setValue({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || '',
        });
        this.bioText = user.bio || '';
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public saveProfile() {
    if (this.isSaving()) return;
    this.isSaving.set(true);
    this.saveStatus = 'SAVING...';

    const { firstname, lastname, email, phoneNumber, bio } = this.profileForm.getRawValue();

    firstValueFrom(
      this.userService.updateCurrentUser({
        firstname,
        lastname,
        email,
        phoneNumber,
        bio: bio || undefined,
      })
    )
      .then(({ user }) => {
        this.saveStatus = 'SAVED!';
        this.isSaving.set(false);
        this.profileForm.setValue({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || '',
        });
        this.bioText = user.bio || '';
      })
      .catch(() => {
        this.isSaving.set(false);
        this.saveStatus = 'SAVE CHANGES';
      });
  }
}
