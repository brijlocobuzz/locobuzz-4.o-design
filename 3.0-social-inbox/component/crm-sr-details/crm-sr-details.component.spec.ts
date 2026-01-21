import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrmSrDetailsComponent } from './crm-sr-details.component';

describe('CrmSrDetailsComponent', () => {
  let component: CrmSrDetailsComponent;
  let fixture: ComponentFixture<CrmSrDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmSrDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmSrDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
