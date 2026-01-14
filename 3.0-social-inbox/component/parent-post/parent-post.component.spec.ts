import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParentPostComponent } from './parent-post.component';

describe('ParentPostComponent', () => {
  let component: ParentPostComponent;
  let fixture: ComponentFixture<ParentPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ParentPostComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
