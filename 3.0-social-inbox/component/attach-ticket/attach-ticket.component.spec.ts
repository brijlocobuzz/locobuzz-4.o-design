import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AttachTicketComponent } from './attach-ticket.component';

describe('AttachTicketComponent', () => {
  let component: AttachTicketComponent;
  let fixture: ComponentFixture<AttachTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AttachTicketComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
