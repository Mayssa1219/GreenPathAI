import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarHeader } from './sidebar-header';

describe('SidebarHeader', () => {
  let component: SidebarHeader;
  let fixture: ComponentFixture<SidebarHeader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SidebarHeader]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SidebarHeader);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
