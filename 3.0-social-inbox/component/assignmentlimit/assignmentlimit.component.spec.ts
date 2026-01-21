import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignmentlimitComponent } from './assignmentlimit.component';

describe('AssignmentlimitComponent', () => {
  let component: AssignmentlimitComponent;
  let fixture: ComponentFixture<AssignmentlimitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignmentlimitComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignmentlimitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
