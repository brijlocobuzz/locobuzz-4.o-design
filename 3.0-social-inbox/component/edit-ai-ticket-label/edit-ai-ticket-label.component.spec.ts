import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAiTicketLabelComponent } from './edit-ai-ticket-label.component';

describe('EditAiTicketLabelComponent', () => {
  let component: EditAiTicketLabelComponent;
  let fixture: ComponentFixture<EditAiTicketLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditAiTicketLabelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditAiTicketLabelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
