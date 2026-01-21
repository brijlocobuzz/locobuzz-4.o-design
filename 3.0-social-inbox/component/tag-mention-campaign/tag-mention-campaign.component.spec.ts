import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagMentionCampaignComponent } from './tag-mention-campaign.component';

describe('TagMentionCampaignComponent', () => {
  let component: TagMentionCampaignComponent;
  let fixture: ComponentFixture<TagMentionCampaignComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TagMentionCampaignComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TagMentionCampaignComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
