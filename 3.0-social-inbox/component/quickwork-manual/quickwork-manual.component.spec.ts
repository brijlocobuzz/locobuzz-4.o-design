import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickworkManualComponent } from './quickwork-manual.component';

describe('QuickworkManualComponent', () => {
  let component: QuickworkManualComponent;
  let fixture: ComponentFixture<QuickworkManualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuickworkManualComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuickworkManualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
