import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostFootActionComponent } from './post-foot-action.component';

describe('PostFootActionComponent', () => {
  let component: PostFootActionComponent;
  let fixture: ComponentFixture<PostFootActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostFootActionComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostFootActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
