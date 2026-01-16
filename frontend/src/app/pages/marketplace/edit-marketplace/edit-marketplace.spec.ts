import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMarketplace } from './edit-marketplace';

describe('EditMarketplace', () => {
  let component: EditMarketplace;
  let fixture: ComponentFixture<EditMarketplace>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditMarketplace]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditMarketplace);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
