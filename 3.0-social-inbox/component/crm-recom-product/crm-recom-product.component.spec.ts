import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrmRecomProductComponent } from './crm-recom-product.component';

describe('CrmRecomProductComponent', () => {
  let component: CrmRecomProductComponent;
  let fixture: ComponentFixture<CrmRecomProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrmRecomProductComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrmRecomProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
