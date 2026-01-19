import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user';
import { firstValueFrom } from 'rxjs';
import { User } from '../../types/api.types';
import { LoadingComponent } from '../loading-component/loading-component';

@Component({
  selector: 'app-profile-update-form',
  standalone: true,
  imports: [ReactiveFormsModule, LoadingComponent],
  templateUrl: './profile-update-form.html',
  styleUrl: './profile-update-form.css',
})
export class ProfileUpdateForm {
  private formBuilder = inject(FormBuilder);
  private userService = inject(UserService);
  public profileForm = this.formBuilder.nonNullable.group({
    firstname: ['', [Validators.minLength(2), Validators.maxLength(30), Validators.required]],
    lastname: ['', [Validators.minLength(2), Validators.maxLength(30), Validators.required]],
    username: ['', [Validators.minLength(2), Validators.maxLength(30), Validators.required]],
    email: ['', [Validators.email, Validators.required]],
    phoneNumber: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(15)]],
    bio: ['', [Validators.maxLength(160)]],
  });

  public isSubmitting = signal<boolean>(false);
  public isLoading = signal<boolean>(true);
  public isError = signal<boolean>(false);
  public isSuccess = signal<boolean>(false);

  public ngOnInit() {
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    this.isLoading.set(true);
    firstValueFrom(this.userService.getCurrentUser())
      .then((user) => {
        this.setFormValues(user);
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  private setFormValues(user: User) {
    const { firstname, lastname, username, email, phoneNumber, bio } = user;
    this.profileForm.setValue({
      firstname,
      lastname,
      username,
      email,
      phoneNumber,
      bio: bio || '',
    });
  }

  public onSubmit() {
    if (this.profileForm.invalid) {
      return;
    }
    this.isSubmitting.set(true);

    const { firstname, lastname, username, email, phoneNumber, bio } = this.profileForm.value;

    firstValueFrom(
      this.userService.updateCurrentUser({
        firstname,
        lastname,
        username,
        phoneNumber,
        bio,
      }),
    )
      .then((data) => {
        this.setFormValues(data);
        this.isSuccess.set(true);
        this.isError.set(false);
      })
      .catch((error) => {
        console.error('Error updating profile:', error);
        this.loadCurrentUser();
        this.isError.set(true);
        this.isSuccess.set(false);
      })
      .finally(() => {
        this.isSubmitting.set(false);
      });
  }
}
