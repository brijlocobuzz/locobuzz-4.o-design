import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrmLeadDetailsComponent } from './crm-lead-details.component';

describe('CrmLeadDetailsComponent', () => {
  let component: CrmLeadDetailsComponent;
  let fixture: ComponentFixture<CrmLeadDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmLeadDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmLeadDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
