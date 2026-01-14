import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrmQueryDetailsComponent } from './crm-query-details.component';

describe('CrmQueryDetailsComponent', () => {
  let component: CrmQueryDetailsComponent;
  let fixture: ComponentFixture<CrmQueryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmQueryDetailsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmQueryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
