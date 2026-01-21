import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyMoveComponent } from './copy-move.component';

describe('CopyMoveComponent', () => {
  let component: CopyMoveComponent;
  let fixture: ComponentFixture<CopyMoveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CopyMoveComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyMoveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
