// src/app/pages/profile-page/profile-page.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  /* VERANDERING: FormsModule toegevoegd zodat de bio-teller en invoer live reageren */
  imports: [CommonModule, FormsModule], 
  templateUrl: './profile-page.html',
  styleUrls: ['./profile-page.css']
})
export class ProfilePage {
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

  /* VERANDERING: De functie die zorgt voor de 'Saving...' en 'Success!' feedback op de knop */
  saveProfile() {
    if (this.isSaving) return;

    this.isSaving = true;
    this.saveStatus = 'SAVING...';

    // Simuleert het opslaan naar een database
    setTimeout(() => {
      this.saveStatus = 'SUCCESS! ✓';
      
      // Na 2 seconden de knop weer herstellen naar de standaard tekst
      setTimeout(() => {
        this.saveStatus = 'SAVE CHANGES';
        this.isSaving = false;
      }, 2000);
    }, 1200);
  }
}