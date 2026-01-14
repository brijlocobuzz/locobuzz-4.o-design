import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostSubscribeComponent } from './post-subscribe.component';

describe('PostSubscribeComponent', () => {
  let component: PostSubscribeComponent;
  let fixture: ComponentFixture<PostSubscribeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostSubscribeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostSubscribeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
