import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClickhouseBulkPopupComponent } from './clickhouse-bulk-popup.component';

describe('ClickhouseBulkPopupComponent', () => {
  let component: ClickhouseBulkPopupComponent;
  let fixture: ComponentFixture<ClickhouseBulkPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClickhouseBulkPopupComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClickhouseBulkPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
