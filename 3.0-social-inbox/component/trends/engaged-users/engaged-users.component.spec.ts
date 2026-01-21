import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EngagedUsersComponent } from './engaged-users.component';

describe('EngagedUsersComponent', () => {
  let component: EngagedUsersComponent;
  let fixture: ComponentFixture<EngagedUsersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EngagedUsersComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EngagedUsersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
