import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupDetailscrmComponent } from './lookup-detailscrm.component';

describe('LookupDetailscrmComponent', () => {
  let component: LookupDetailscrmComponent;
  let fixture: ComponentFixture<LookupDetailscrmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LookupDetailscrmComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LookupDetailscrmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
