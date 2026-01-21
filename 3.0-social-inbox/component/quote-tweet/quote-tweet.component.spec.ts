import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuoteTweetComponent } from './quote-tweet.component';

describe('QuoteTweetComponent', () => {
  let component: QuoteTweetComponent;
  let fixture: ComponentFixture<QuoteTweetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoteTweetComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoteTweetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
