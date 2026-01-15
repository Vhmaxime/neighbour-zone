import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarketplaceActions } from './marketplace-actions';

describe('MarketplaceActions', () => {
  let component: MarketplaceActions;
  let fixture: ComponentFixture<MarketplaceActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketplaceActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarketplaceActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
