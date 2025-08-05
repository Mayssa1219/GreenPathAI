import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Circuits } from './circuits';

describe('Circuits', () => {
  let component: Circuits;
  let fixture: ComponentFixture<Circuits>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Circuits]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Circuits);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
