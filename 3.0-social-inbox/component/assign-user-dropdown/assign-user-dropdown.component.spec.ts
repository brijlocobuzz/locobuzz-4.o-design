import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AssignUserDropdownComponent } from './assign-user-dropdown.component';

describe('AssignUserDropdownComponent', () => {
  let component: AssignUserDropdownComponent;
  let fixture: ComponentFixture<AssignUserDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AssignUserDropdownComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AssignUserDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
