import { CommonModule, DatePipe } from '@angular/common';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
// import { AngularD3CloudModule } from 'angular-d3-cloud';
import { FilterjsonresolverService } from 'app/core/services/filterjsonresolver.service';
import { RouteguidResolverService } from 'app/core/services/routeguid-resolver.service';
import { SharedModule } from 'app/shared/shared.module';
import { HighchartsChartModule } from 'highcharts-angular';
import { ColorSketchModule } from 'ngx-color/sketch';
import { AssignmentlimitComponent } from './component/assignmentlimit/assignmentlimit.component';
import * as SocialInboxComponents from './component/index';
import { ParentPostBulkActionsComponent } from './component/parent-post-bulk-actions/parent-post-bulk-actions.component';
import { ReplytimerComponent } from './component/replytimer/replytimer.component';
import { NoBrandsComponent } from './component/no-brands/no-brands.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { DirectCloseComponent } from './component/direct-close/direct-close.component';
import { NgxYoutubePlayerModule } from 'ngx-youtube-player';
import { PostFootActionComponent } from './component/post/post-foot/post-foot-action/post-foot-action.component';
import { CallingComponent } from './component/calling/calling.component';
import { CallingDisconnectComponent } from './component/calling-disconnect/calling-disconnect.component';
import { CallingNoteComponent } from './component/calling-note/calling-note.component';
import { PhoneMaskDirective } from './directives/phone-mask.directive';
import { DialPadComponent } from './component/dial-pad/dial-pad.component';
import { IncomingCallComponent } from './component/incoming-call/incoming-call.component';
// import { AudioSliderComponent } from './component/audio-slider/audio-slider.component';
import { GalleryPreviewComponent } from './component/gallery-preview/gallery-preview.component';
import { QuoraParentPostComponent } from './component/quora-parent-post/quora-parent-post.component';
import { TagMentionCampaignComponent } from './component/tag-mention-campaign/tag-mention-campaign.component';
// import { AnimalWildfarePopupComponent } from './component/animal-wildfare-popup/animal-wildfare-popup.component';
import { RephraseComponent } from './component/rephrase/rephrase.component';
import { MentionModule } from 'angular-mentions';
import { AttachMediaComponent } from './component/attach-media/attach-media.component';
import { LoopupcrmComponent } from './component/loopupcrm/loopupcrm.component';
import { LookupDetailscrmComponent } from './component/lookup-detailscrm/lookup-detailscrm.component';
import { SrNewCrmformComponent } from './component/sr-new-crmform/sr-new-crmform.component';
import { QuickworkManualComponent } from './component/quickwork-manual/quickwork-manual.component';
import { LookupcrmquickworkComponent } from './component/quickwork-manual/lookupcrmquickwork/lookupcrmquickwork.component';
// import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { ClickhouseBulkPopupComponent } from './clickhouse-bulk-popup/clickhouse-bulk-popup.component';
import { ViralAlertInfoComponent } from './component/viral-alert-info/viral-alert-info.component';
import { UnlinkProfileComponent } from './component/post-userprofile/unlink-profile/unlink-profile.component';
import { EditAiTicketLabelComponent } from './component/edit-ai-ticket-label/edit-ai-ticket-label.component';
import { MatTabsModule } from '@angular/material/tabs';
import { GoogleMapsModule } from '@angular/google-maps';
import { CarouselModule } from 'primeng/carousel';
import { ColorPickerModule } from 'primeng/colorpicker';
import { PushTicketToCrmComponent } from './component/push-ticket-to-crm/push-ticket-to-crm.component';
import { AddCaptionComponent } from './component/media-gallery/add-caption/add-caption.component';
import { TicketDispositionComponent } from './component/ticket-disposition/ticket-disposition.component';
import { NgxDaterangepickerMd } from 'app/daterangepicker/daterangepicker.module';
import { PostEmailNodeComponent } from './component/post-email-node/post-email-node.component';
import { PostReplyPopupComponent } from './component/post-reply-popup/post-reply-popup.component';
import { TutorialModalComponent } from './component/tutorial-modal/tutorial-modal.component';
import { ConfirmCallComponent } from './component/confirm-call/confirm-call.component';

export const routes: Routes = [
  {
    path: '',
    component: SocialInboxComponents.PageComponent,
    resolve: { resolvedguid: RouteguidResolverService },
  },
  {
    path: ':guid',
    component: SocialInboxComponents.PageComponent,
    resolve: { resolvedjson: FilterjsonresolverService },
  },
];
@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    SocialInboxComponents.PageComponent,
    SocialInboxComponents.CategoryFilterComponent,
    SocialInboxComponents.PostComponent,
    SocialInboxComponents.PostDetailComponent,
    SocialInboxComponents.PostShortenedComponent,
    SocialInboxComponents.PostUserinfoComponent,
    SocialInboxComponents.PostReplyComponent,
    SocialInboxComponents.PostLogComponent,
    SocialInboxComponents.PostMessageComponent,
    SocialInboxComponents.PostAssigntoComponent,
    SocialInboxComponents.PostMarkinfluencerComponent,
    SocialInboxComponents.PostAssigntoComponent,
    SocialInboxComponents.PostBulkActionsComponent,
    SocialInboxComponents.PostEmailComponent,
    SocialInboxComponents.EnrichViewComponent,
    SocialInboxComponents.PostUserprofileComponent,
    SocialInboxComponents.UserActivitiesComponent,
    SocialInboxComponents.UserOverviewComponent,
    SocialInboxComponents.AddAssociateChannelsComponent,
    SocialInboxComponents.MediaGalleryComponent,
    SocialInboxComponents.CannedResponseComponent,
    SocialInboxComponents.SmartSuggestionComponent,
    SocialInboxComponents.MediaDropzoneComponent,
    SocialInboxComponents.MediaDropitemComponent,
    SocialInboxComponents.PostSubscribeComponent,
    SocialInboxComponents.TakeBreakComponent,
    SocialInboxComponents.CrmComponent,
    SocialInboxComponents.NewSrComponent,
    SocialInboxComponents.CrmCustomerComponent,
    SocialInboxComponents.CrmSrDetailsComponent,
    SocialInboxComponents.CrmFtrDetailsComponent,
    SocialInboxComponents.CrmRecomProductComponent,
    SocialInboxComponents.AttachTicketComponent,
    SocialInboxComponents.TicketConversationComponent,
    SocialInboxComponents.CopyMoveComponent,
    SocialInboxComponents.SocialboxComponent,
    SocialInboxComponents.ReplyLoaderComponent,
    SocialInboxComponents.VideoDialogComponent,
    SocialInboxComponents.PostHeadComponent,
    SocialInboxComponents.PostFootComponent,
    SocialInboxComponents.PostBodyComponent,
    SocialInboxComponents.BreakComponent,
    SocialInboxComponents.CrmLeadDetailsComponent,
    SocialInboxComponents.CrmQueryDetailsComponent,
    SocialInboxComponents.CrmComplaintDetailsComponent,
    SocialInboxComponents.PostTimelineComponent,
    SocialInboxComponents.ParentPostComponent,
    SocialInboxComponents.QuoteTweetComponent,
    ReplytimerComponent,
    SocialInboxComponents.TrendsComponent,
    SocialInboxComponents.ManualTicketComponent,
    SocialInboxComponents.EngagedUsersComponent,
    SocialInboxComponents.AudioSliderComponent,
    ParentPostBulkActionsComponent,
    AssignmentlimitComponent,
    NoBrandsComponent,
    DirectCloseComponent,
    PostFootActionComponent,
    CallingComponent,
    CallingDisconnectComponent,
    CallingNoteComponent,
    PhoneMaskDirective,
    DialPadComponent,
    IncomingCallComponent,
    SocialInboxComponents.ChatbotComponent,
    SocialInboxComponents.ChatbotHistoryComponent,
    SocialInboxComponents.ChatlogComponent,
    SocialInboxComponents.ChatbotReplytimerComponent,
    GalleryPreviewComponent,
    TicketDispositionComponent,
    QuoraParentPostComponent,
    TagMentionCampaignComponent,
    RephraseComponent,
    AttachMediaComponent,
    LoopupcrmComponent,
    LookupDetailscrmComponent,
    SrNewCrmformComponent,
    QuickworkManualComponent,
    LookupcrmquickworkComponent,
    ClickhouseBulkPopupComponent,
    ViralAlertInfoComponent, 
    UnlinkProfileComponent, 
    EditAiTicketLabelComponent, 
    PushTicketToCrmComponent,
    AddCaptionComponent,
    PostEmailNodeComponent,
    PostReplyPopupComponent,
    TutorialModalComponent,
    ConfirmCallComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    // AngularD3CloudModule,
    RouterModule.forChild(routes),
    NgxYoutubePlayerModule.forRoot(),
    ColorSketchModule,
    NgxDocViewerModule,
    NgxDaterangepickerMd.forRoot(),
    MentionModule,
    MatTabsModule,
    GoogleMapsModule,
    CarouselModule,
    ColorPickerModule,
  ],
  providers: [
    DatePipe,
  ],
  exports: [HighchartsChartModule,
    SocialInboxComponents.PostComponent,SocialInboxComponents.PostDetailComponent
  ],
})
export class SocialInboxModule {}
