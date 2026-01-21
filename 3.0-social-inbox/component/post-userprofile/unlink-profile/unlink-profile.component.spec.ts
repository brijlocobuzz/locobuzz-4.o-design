import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlinkProfileComponent } from './unlink-profile.component';

describe('UnlinkProfileComponent', () => {
  let component: UnlinkProfileComponent;
  let fixture: ComponentFixture<UnlinkProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnlinkProfileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlinkProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
