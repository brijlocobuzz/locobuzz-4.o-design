import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostUserinfoComponent } from './post-userinfo.component';

describe('PostUserinfoComponent', () => {
  let component: PostUserinfoComponent;
  let fixture: ComponentFixture<PostUserinfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostUserinfoComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostUserinfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
