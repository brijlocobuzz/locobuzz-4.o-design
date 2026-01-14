import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LookupcrmquickworkComponent } from './lookupcrmquickwork.component';

describe('LookupcrmquickworkComponent', () => {
  let component: LookupcrmquickworkComponent;
  let fixture: ComponentFixture<LookupcrmquickworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LookupcrmquickworkComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LookupcrmquickworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
