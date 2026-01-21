import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostShortenedComponent } from './post-shortened.component';

describe('PostShortenedComponent', () => {
  let component: PostShortenedComponent;
  let fixture: ComponentFixture<PostShortenedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostShortenedComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostShortenedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
