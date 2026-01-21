import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddAssociateChannelsComponent } from './add-associate-channels.component';

describe('AddAssociateChannelsComponent', () => {
  let component: AddAssociateChannelsComponent;
  let fixture: ComponentFixture<AddAssociateChannelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddAssociateChannelsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddAssociateChannelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
