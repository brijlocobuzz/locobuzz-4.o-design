import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrmFtrDetailsComponent } from './crm-ftr-details.component';

describe('CrmFtrDetailsComponent', () => {
  let component: CrmFtrDetailsComponent;
  let fixture: ComponentFixture<CrmFtrDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmFtrDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmFtrDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
