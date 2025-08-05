import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Historiques } from './historiques';

describe('Historiques', () => {
  let component: Historiques;
  let fixture: ComponentFixture<Historiques>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Historiques]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Historiques);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
