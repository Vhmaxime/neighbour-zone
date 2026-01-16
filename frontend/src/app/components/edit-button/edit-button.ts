import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

type ItemType = 'post' | 'event' | 'marketplace';

@Component({
  selector: 'app-edit-button',
  imports: [CommonModule],
  templateUrl: './edit-button.html',
  styleUrl: './edit-button.css',
})
export class EditButton {
  private authService = inject(AuthService);
  private router = inject(Router);

  itemId = input.required<string>();
  authorId = input.required<string>();

  routePath = input.required<string>();

  isAuthor(): boolean {
    const user = this.authService.getUser();
    return user?.sub === this.authorId();
  }

  onEdit(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.router.navigate([`/${this.routePath}`, this.itemId(), 'edit']);
  }
}
