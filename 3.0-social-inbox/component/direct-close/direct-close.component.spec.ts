import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectCloseComponent } from './direct-close.component';

describe('DirectCloseComponent', () => {
  let component: DirectCloseComponent;
  let fixture: ComponentFixture<DirectCloseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DirectCloseComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DirectCloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
