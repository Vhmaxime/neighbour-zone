import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { EventService } from '../../../services/event';
import { CreateEventRequest, Event } from '../../../types/api.types';
import { AuthService } from '../../../services/auth';
import { ActionButton } from '../../../components/action-button/action-button';
import { BackButton } from '../../../components/back-button/back-button';
import { LoadingComponent } from '../../../components/loading-component/loading-component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, ActionButton, BackButton, LoadingComponent],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.html',
})
export class EditEvent {
  // Injected services
  private eventService = inject(EventService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private formBuilder = inject(FormBuilder);
  private titleService = inject(Title);

  // Get ID from route params
  public eventId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  // State signals
  public isLoading = signal(true);
  public error = signal<string | null>(null);
  public isSuccess = signal(false);

  // Store full event object for ActionButton usage (need organizer id)
  public event = signal<Event | null>(null);

  // Form definition
  public editForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    description: ['', [Validators.maxLength(150)]],
    placeDisplayName: [
      '',
      [Validators.required, Validators.minLength(1), Validators.maxLength(100)],
    ],
    dateTime: ['', [Validators.required]],
    endAt: [''],
  });

  public ngOnInit() {
    this.isLoading.set(true);
    this.loadEvent();
    this.isLoading.set(false);
  }

  private loadEvent() {
    this.isLoading.set(true);
    this.error.set(null);

    firstValueFrom(this.eventService.getEvent(this.eventId))
      .then(({ event }) => {
        this.event.set(event);
        this.titleService.setTitle(event.title);
      })
      .catch((err) => {
        if (err.status === 404) {
          this.router.navigate(['/not-found']);
          return;
        }
        this.error.set('An error occurred while loading the event.');
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  onSubmit() {}

  onEventDeleted() {
    this.router.navigate(['/events']);
  }
}
