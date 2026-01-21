import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SmartSuggestionComponent } from './smart-suggestion.component';

describe('SmartSuggestionComponent', () => {
  let component: SmartSuggestionComponent;
  let fixture: ComponentFixture<SmartSuggestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SmartSuggestionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SmartSuggestionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
