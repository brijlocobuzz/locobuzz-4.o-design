import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostAssigntoComponent } from './post-assignto.component';

describe('PostAssigntoComponent', () => {
  let component: PostAssigntoComponent;
  let fixture: ComponentFixture<PostAssigntoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostAssigntoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostAssigntoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
