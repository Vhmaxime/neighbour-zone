import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreSearch } from './explore-search';

describe('ExploreSearch', () => {
  let component: ExploreSearch;
  let fixture: ComponentFixture<ExploreSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExploreSearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExploreSearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
