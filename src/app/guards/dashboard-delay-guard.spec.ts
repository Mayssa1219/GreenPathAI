import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { dashboardDelayGuard } from './dashboard-delay-guard';

describe('dashboardDelayGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => dashboardDelayGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
