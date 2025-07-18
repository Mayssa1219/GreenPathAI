import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpVerifyComponent } from './otp-verify';

describe('OtpVerify', () => {
  let component: OtpVerifyComponent;
  let fixture: ComponentFixture<OtpVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtpVerifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
