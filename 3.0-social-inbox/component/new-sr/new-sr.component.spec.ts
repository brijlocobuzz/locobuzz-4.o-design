import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NewSrComponent } from './new-sr.component';

describe('NewSrComponent', () => {
  let component: NewSrComponent;
  let fixture: ComponentFixture<NewSrComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NewSrComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSrComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
