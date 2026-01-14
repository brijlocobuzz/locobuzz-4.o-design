import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CallingNoteComponent } from './calling-note.component';

describe('CallingNoteComponent', () => {
  let component: CallingNoteComponent;
  let fixture: ComponentFixture<CallingNoteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CallingNoteComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CallingNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
