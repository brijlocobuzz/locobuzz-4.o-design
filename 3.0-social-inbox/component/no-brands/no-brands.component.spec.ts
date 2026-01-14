import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NoBrandsComponent } from './no-brands.component';

describe('NoBrandsComponent', () => {
  let component: NoBrandsComponent;
  let fixture: ComponentFixture<NoBrandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NoBrandsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NoBrandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
