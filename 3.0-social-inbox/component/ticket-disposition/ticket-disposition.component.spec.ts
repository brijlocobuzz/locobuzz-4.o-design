import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketDispositionComponent } from './ticket-disposition.component';

describe('TicketDispositionComponent', () => {
  let component: TicketDispositionComponent;
  let fixture: ComponentFixture<TicketDispositionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TicketDispositionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketDispositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
