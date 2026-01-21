import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SocialboxComponent } from './socialbox.component';

describe('SocialboxComponent', () => {
  let component: SocialboxComponent;
  let fixture: ComponentFixture<SocialboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SocialboxComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SocialboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
