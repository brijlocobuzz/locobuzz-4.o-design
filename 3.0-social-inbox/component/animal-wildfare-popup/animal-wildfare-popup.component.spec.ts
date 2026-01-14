import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimalWildfarePopupComponent } from './animal-wildfare-popup.component';

describe('AnimalWildfarePopupComponent', () => {
  let component: AnimalWildfarePopupComponent;
  let fixture: ComponentFixture<AnimalWildfarePopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AnimalWildfarePopupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AnimalWildfarePopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
