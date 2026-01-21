import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostReplybotComponent } from './post-replybot.component';

describe('PostReplybotComponent', () => {
  let component: PostReplybotComponent;
  let fixture: ComponentFixture<PostReplybotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PostReplybotComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostReplybotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
