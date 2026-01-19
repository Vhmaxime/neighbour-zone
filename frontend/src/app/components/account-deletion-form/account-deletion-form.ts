import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user';
import { AuthService } from '../../services/auth';
import { firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-account-deletion-form',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule],
    templateUrl: './account-deletion-form.html',
    styleUrl: './account-deletion-form.css',
})
export class AccountDeletionForm {
    private formBuilder = inject(FormBuilder);
    private userService = inject(UserService);
    private authService = inject(AuthService);

    public deleteForm = this.formBuilder.group({
        confirmation: ['', [Validators.required, Validators.pattern('DELETE')]],
    });

    public isLoading = signal<boolean>(false);
    public isError = signal<string | null>(null);
    public showConfirmation = signal<boolean>(false);

    public initiateDelete() {
        this.showConfirmation.set(true);
    }

    public cancelDelete() {
        this.showConfirmation.set(false);
        this.deleteForm.reset();
    }

    public onSubmit() {
        if (this.deleteForm.invalid) {
            return;
        }

        this.isLoading.set(true);
        firstValueFrom(this.userService.deleteCurrentUser())
            .then(() => {
                this.authService.logout();
            })
            .catch((error) => {
                console.error('Error deleting account:', error);
                this.isError.set('An unexpected error occurred. Please try again.');
                this.isLoading.set(false);
            });
    }
}
