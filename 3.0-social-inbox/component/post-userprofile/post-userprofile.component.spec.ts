import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostUserprofileComponent } from './post-userprofile.component';

describe('PostUserprofileComponent', () => {
  let component: PostUserprofileComponent;
  let fixture: ComponentFixture<PostUserprofileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostUserprofileComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostUserprofileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
