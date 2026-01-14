import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReplyLoaderComponent } from './reply-loader.component';

describe('ReplyLoaderComponent', () => {
  let component: ReplyLoaderComponent;
  let fixture: ComponentFixture<ReplyLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReplyLoaderComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplyLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
