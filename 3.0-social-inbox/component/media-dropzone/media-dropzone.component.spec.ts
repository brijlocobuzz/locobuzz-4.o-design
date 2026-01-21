import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MediaDropzoneComponent } from './media-dropzone.component';

describe('MediaDropzoneComponent', () => {
  let component: MediaDropzoneComponent;
  let fixture: ComponentFixture<MediaDropzoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MediaDropzoneComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MediaDropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
