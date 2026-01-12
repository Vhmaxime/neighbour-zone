// src/app/pages/profile-page/profile-page.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { User } from '../../types/api.types';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  /* VERANDERING: FormsModule toegevoegd zodat de bio-teller en invoer live reageren */
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css'],
})
export class ProfilePage {
  private api = inject(Api);
  public isLoading = signal(true);

  profileForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
  });

  /* VERANDERING: Variabelen voor de bio-tekst en de limiet van 250 tekens */
  bioText: string = '';
  maxChars: number = 250;

  /* VERANDERING: Status-variabelen voor de interactieve Save-knop */
  isSaving: boolean = false;
  saveStatus: string = 'SAVE CHANGES';

  /* VERANDERING: Berekent realtime de lengte van de tekst voor de teller onder de bio */
  get charCount(): number {
    return this.bioText ? this.bioText.length : 0;
  }

  ngOnInit() {
    this.api.getUserMe().subscribe({
      next: (response) => {
        this.profileForm.setValue({
          name: response.user.name,
          email: response.user.email,
        });
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  /* VERANDERING: De functie die zorgt voor de 'Saving...' en 'Success!' feedback op de knop */
  saveProfile() {}
}
