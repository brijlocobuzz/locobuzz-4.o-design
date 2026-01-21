import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostEmailNodeComponent } from './post-email-node.component';

describe('PostEmailNodeComponent', () => {
  let component: PostEmailNodeComponent;
  let fixture: ComponentFixture<PostEmailNodeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PostEmailNodeComponent]
    });
    fixture = TestBed.createComponent(PostEmailNodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
