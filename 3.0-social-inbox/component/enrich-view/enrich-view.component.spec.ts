import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EnrichViewComponent } from './enrich-view.component';

describe('EnrichViewComponent', () => {
  let component: EnrichViewComponent;
  let fixture: ComponentFixture<EnrichViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnrichViewComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnrichViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
