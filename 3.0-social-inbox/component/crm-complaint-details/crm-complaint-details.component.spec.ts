import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrmComplaintDetailsComponent } from './crm-complaint-details.component';

describe('CrmComplaintDetailsComponent', () => {
  let component: CrmComplaintDetailsComponent;
  let fixture: ComponentFixture<CrmComplaintDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmComplaintDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmComplaintDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
