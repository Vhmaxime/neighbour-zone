import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceDetails } from './marketplace-details';

describe('MarketplaceDetails', () => {
  let component: MarketplaceDetails;
  let fixture: ComponentFixture<MarketplaceDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
