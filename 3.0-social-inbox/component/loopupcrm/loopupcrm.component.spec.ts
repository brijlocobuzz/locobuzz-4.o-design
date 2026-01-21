import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoopupcrmComponent } from './loopupcrm.component';

describe('LoopupcrmComponent', () => {
  let component: LoopupcrmComponent;
  let fixture: ComponentFixture<LoopupcrmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoopupcrmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoopupcrmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
