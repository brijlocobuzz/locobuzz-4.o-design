import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TakeBreakComponent } from './take-break.component';

describe('TakeBreakComponent', () => {
  let component: TakeBreakComponent;
  let fixture: ComponentFixture<TakeBreakComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TakeBreakComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeBreakComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
