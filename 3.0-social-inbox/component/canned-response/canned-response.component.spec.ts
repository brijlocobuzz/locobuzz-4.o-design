import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CannedResponseComponent } from './canned-response.component';

describe('CannedResponseComponent', () => {
  let component: CannedResponseComponent;
  let fixture: ComponentFixture<CannedResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CannedResponseComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CannedResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
