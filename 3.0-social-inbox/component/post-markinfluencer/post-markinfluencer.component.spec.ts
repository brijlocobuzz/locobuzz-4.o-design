import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostMarkinfluencerComponent } from './post-markinfluencer.component';

describe('PostMarkinfluencerComponent', () => {
  let component: PostMarkinfluencerComponent;
  let fixture: ComponentFixture<PostMarkinfluencerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostMarkinfluencerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostMarkinfluencerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
