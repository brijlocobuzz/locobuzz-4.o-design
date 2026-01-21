import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostBulkActionsComponent } from './post-bulk-actions.component';

describe('PostBulkActionsComponent', () => {
  let component: PostBulkActionsComponent;
  let fixture: ComponentFixture<PostBulkActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostBulkActionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostBulkActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
