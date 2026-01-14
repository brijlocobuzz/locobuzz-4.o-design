import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParentPostBulkActionsComponent } from './parent-post-bulk-actions.component';

describe('ParentPostBulkActionsComponent', () => {
  let component: ParentPostBulkActionsComponent;
  let fixture: ComponentFixture<ParentPostBulkActionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParentPostBulkActionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentPostBulkActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
