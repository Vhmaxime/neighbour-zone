import { Component } from '@angular/core';

import { ProfileUpdateForm } from '../../components/profile-update-form/profile-update-form';
import { PasswordUpdateForm } from '../../components/password-update-form/password-update-form';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ProfileUpdateForm, PasswordUpdateForm],
  templateUrl: './settings.html',
  styleUrls: ['./settings.css'],
})
export class Settings {}
