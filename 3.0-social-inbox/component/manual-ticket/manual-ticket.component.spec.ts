import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ManualTicketComponent } from './manual-ticket.component';

describe('ManualTicketComponent', () => {
  let component: ManualTicketComponent;
  let fixture: ComponentFixture<ManualTicketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ManualTicketComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManualTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
