import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestionsIA } from './suggestions-ia';

describe('SuggestionsIA', () => {
  let component: SuggestionsIA;
  let fixture: ComponentFixture<SuggestionsIA>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestionsIA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestionsIA);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
