import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RechercheCircuits } from './recherche-circuits';

describe('RechercheCircuits', () => {
  let component: RechercheCircuits;
  let fixture: ComponentFixture<RechercheCircuits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RechercheCircuits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RechercheCircuits);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
