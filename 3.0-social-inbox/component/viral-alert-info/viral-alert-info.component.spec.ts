import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViralAlertInfoComponent } from './viral-alert-info.component';

describe('ViralAlertInfoComponent', () => {
  let component: ViralAlertInfoComponent;
  let fixture: ComponentFixture<ViralAlertInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViralAlertInfoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViralAlertInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
