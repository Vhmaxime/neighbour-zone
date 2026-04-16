import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommunityService } from '../../../services/community';
import { BackButton } from '../../../components/back-button/back-button';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-community',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BackButton],
  templateUrl: './create-community.html',
  styleUrl: './create-community.css',
})
export class CreateCommunity {
  private fb = inject(FormBuilder);
  private communityService = inject(CommunityService);
  private router = inject(Router);

  public isSubmitting = signal(false);
  public error = signal<string | null>(null);

  public form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
  });

  public onSubmit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const { name, description } = this.form.value;
    if (!name) return;

    this.isSubmitting.set(true);
    this.error.set(null);

    firstValueFrom(this.communityService.createCommunity({ name, description }))
      .then(({ community }) => {
        this.router.navigate(['/communities', community.id]);
      })
      .catch((err) => {
        const msg = err?.error?.message;
        if (msg?.includes('unique') || msg?.includes('duplicate')) {
          this.error.set('A community with this name already exists.');
        } else {
          this.error.set('An error occurred. Please try again.');
        }
      })
      .finally(() => this.isSubmitting.set(false));
  }
}
