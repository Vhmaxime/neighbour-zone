import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostActions } from './post-actions';

describe('PostActions', () => {
  let component: PostActions;
  let fixture: ComponentFixture<PostActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostActions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostActions);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
