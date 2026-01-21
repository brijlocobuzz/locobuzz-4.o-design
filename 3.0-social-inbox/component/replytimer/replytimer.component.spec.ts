import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplytimerComponent } from './replytimer.component';

describe('ReplytimerComponent', () => {
  let component: ReplytimerComponent;
  let fixture: ComponentFixture<ReplytimerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReplytimerComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplytimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
