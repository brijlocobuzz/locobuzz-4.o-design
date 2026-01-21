import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaDropitemComponent } from './media-dropitem.component';

describe('MediaDropitemComponent', () => {
  let component: MediaDropitemComponent;
  let fixture: ComponentFixture<MediaDropitemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaDropitemComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaDropitemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
