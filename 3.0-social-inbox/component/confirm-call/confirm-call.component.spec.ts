import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmCallComponent } from './confirm-call.component';

describe('ConfirmCallComponent', () => {
  let component: ConfirmCallComponent;
  let fixture: ComponentFixture<ConfirmCallComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConfirmCallComponent]
    });
    fixture = TestBed.createComponent(ConfirmCallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
