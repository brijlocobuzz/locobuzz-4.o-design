import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrNewCrmformComponent } from './sr-new-crmform.component';

describe('SrNewCrmformComponent', () => {
  let component: SrNewCrmformComponent;
  let fixture: ComponentFixture<SrNewCrmformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SrNewCrmformComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SrNewCrmformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
