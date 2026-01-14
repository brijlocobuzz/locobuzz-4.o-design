import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PushTicketToCrmComponent } from './push-ticket-to-crm.component';

describe('PushTicketToCrmComponent', () => {
  let component: PushTicketToCrmComponent;
  let fixture: ComponentFixture<PushTicketToCrmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PushTicketToCrmComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PushTicketToCrmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
