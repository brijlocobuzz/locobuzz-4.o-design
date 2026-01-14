import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostReplyPopupComponent } from './post-reply-popup.component';

describe('PostReplyPopupComponent', () => {
  let component: PostReplyPopupComponent;
  let fixture: ComponentFixture<PostReplyPopupComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostReplyPopupComponent]
    });
    fixture = TestBed.createComponent(PostReplyPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
