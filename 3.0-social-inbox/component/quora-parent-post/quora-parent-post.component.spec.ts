import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoraParentPostComponent } from './quora-parent-post.component';

describe('QuoraParentPostComponent', () => {
  let component: QuoraParentPostComponent;
  let fixture: ComponentFixture<QuoraParentPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [QuoraParentPostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(QuoraParentPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
