import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttachMediaComponent } from './attach-media.component';

describe('AttachMediaComponent', () => {
  let component: AttachMediaComponent;
  let fixture: ComponentFixture<AttachMediaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AttachMediaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AttachMediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
