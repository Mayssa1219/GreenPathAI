import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProposerCircuit } from './proposer-circuit';

describe('ProposerCircuit', () => {
  let component: ProposerCircuit;
  let fixture: ComponentFixture<ProposerCircuit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposerCircuit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProposerCircuit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
