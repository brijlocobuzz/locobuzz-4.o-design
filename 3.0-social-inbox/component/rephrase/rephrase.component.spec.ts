import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RephraseComponent } from './rephrase.component';

describe('RephraseComponent', () => {
  let component: RephraseComponent;
  let fixture: ComponentFixture<RephraseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RephraseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RephraseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
