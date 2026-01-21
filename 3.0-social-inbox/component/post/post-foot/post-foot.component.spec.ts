import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostFootComponent } from './post-foot.component';

describe('PostFootComponent', () => {
  let component: PostFootComponent;
  let fixture: ComponentFixture<PostFootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostFootComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostFootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
