import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallingDisconnectComponent } from './calling-disconnect.component';

describe('CallingDisconnectComponent', () => {
  let component: CallingDisconnectComponent;
  let fixture: ComponentFixture<CallingDisconnectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CallingDisconnectComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallingDisconnectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
