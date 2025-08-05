import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Avis } from './avis';

describe('Avis', () => {
  let component: Avis;
  let fixture: ComponentFixture<Avis>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avis]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Avis);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
