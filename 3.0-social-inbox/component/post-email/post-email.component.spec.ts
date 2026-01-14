import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostEmailComponent } from './post-email.component';

describe('PostEmailComponent', () => {
  let component: PostEmailComponent;
  let fixture: ComponentFixture<PostEmailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostEmailComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
