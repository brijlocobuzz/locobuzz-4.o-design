import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialModalComponent } from './tutorial-modal.component';

describe('TutorialModalComponent', () => {
  let component: TutorialModalComponent;
  let fixture: ComponentFixture<TutorialModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TutorialModalComponent]
    });
    fixture = TestBed.createComponent(TutorialModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
