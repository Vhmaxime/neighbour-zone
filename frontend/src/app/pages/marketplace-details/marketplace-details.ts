import { Component, inject, signal, computed } from '@angular/core';
import { DatePipe, Location, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink} from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MarketplaceItem } from '../../types/api.types';
import { MarketplaceService } from '../../services/marketplace';
import { AuthService } from '../../services/auth';
import { BackButton } from '../../components/back-button/back-button';
import { EditButton } from '../../components/edit-button/edit-button';
import { DeleteButton } from '../../components/delete-button/delete-button';

@Component({
  selector: 'app-marketplace-details',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, BackButton, EditButton, DeleteButton],
  templateUrl: './marketplace-details.html',
  styleUrl: './marketplace-details.css',
})
export class MarketplaceDetails {
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);
  private marketplaceService = inject(MarketplaceService);
  private location = inject(Location);
  private authService = inject(AuthService);

  private itemId = this.activatedRoute.snapshot.paramMap.get('id') as string;

  public item = signal<MarketplaceItem | null>(null);
  public isLoading = signal(false);
  public isError = signal(false);

  public isAuthor = computed<boolean>(
    () => this.item()?.provider.id === this.authService.getUser()?.sub
  );

  public ngOnInit() {
    this.loadItem();
  }

  private loadItem() {
    this.isLoading.set(true);
    firstValueFrom(this.marketplaceService.getMarketplaceItem(this.itemId))
      .then((data: any) => {
        // Handle potential response wrapper
        this.item.set(data.marketplace || data);
      })
      .catch((error) => {
        if (error.status === 404) {
          this.router.navigate(['/not-found']);
        } else {
          console.error('Error loading item:', error);
          this.isError.set(true);
        }
      })
      .finally(() => {
        this.isLoading.set(false);
      });
  }

  public onItemDeleted() {
    this.router.navigate(['/marketplace']);
  }
}