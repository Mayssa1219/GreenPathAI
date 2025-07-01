import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupSuccess } from './signup-success';

describe('SignupSuccess', () => {
  let component: SignupSuccess;
  let fixture: ComponentFixture<SignupSuccess>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupSuccess]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupSuccess);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
