import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCaptionComponent } from './add-caption.component';

describe('AddCaptionComponent', () => {
  let component: AddCaptionComponent;
  let fixture: ComponentFixture<AddCaptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddCaptionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCaptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
