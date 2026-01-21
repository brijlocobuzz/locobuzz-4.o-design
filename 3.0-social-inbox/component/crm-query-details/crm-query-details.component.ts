import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ChannelType } from 'app/core/enums/ChannelType';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { TicketTimings } from 'app/core/interfaces/TicketClient';
import { CRMMentionMetaData } from 'app/core/models/crm/CRMMentionMetaData';
import { BTCCrmRequestType } from 'app/core/models/crm/NonTelecomRequest';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { CommonService } from 'app/core/services/common.service';
import { LocobuzzmentionService } from 'app/core/services/locobuzzmention.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { CrmService } from 'app/social-inbox/services/crm.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-crm-query-details',
    templateUrl: './crm-query-details.component.html',
    styleUrls: ['./crm-query-details.component.scss'],
    standalone: false
})
export class CrmQueryDetailsComponent implements OnInit {
  isLoading: boolean;
  constructor(
    private _crmService: CrmService,
    private _postDetailService: PostDetailService,
    private _filterService: FilterService,
    private _locobuzzMentionService: LocobuzzmentionService,
    private _ticketService: TicketsService,
    private _cdr: ChangeDetectorRef, 
    private _sidebarService: SidebarService,
    private commonService: CommonService
  ) {}

  @Input() postData: BaseMention;
  crmMentionData: CRMMentionMetaData;
  channelName: string;
  channelImage: string;
  mentionList: BaseMention[];
  ticketTime: TicketTimings;
  loaderTypeEnum = loaderTypeEnum;
  defaultLayout: boolean = false;
  subs = new SubSink();
  ngOnInit(): void {
    this.postData = this._postDetailService.postObj;
    this.channelName = this.MapChannelType(this.postData);
    this.channelImage = this._locobuzzMentionService.getChannelIcon(
      this.postData
    );
    this.ticketTime = this._ticketService.calculateTicketTimes(this.postData);
    const postCRMdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postData.brandInfo.brandID
    );

    const BrandInfo = {
      BrandID: this.postData.brandInfo.brandID,
      BrandName: this.postData.brandInfo.brandName,
    };

    const crmdetailsobject = {
      BrandInfo,
      AuthorSocialId: this.postData.author.socialId,
      ChannelGroup: this.postData.channelGroup,
      CrmClassName: postCRMdata.crmClassName,
      RequestTypes: BTCCrmRequestType.Query,
    };
    this.isLoading = true;
    this._crmService.GetCrmMentionList(crmdetailsobject).subscribe((data) => {
      if (data.success) {
        const crmMentionData: CRMMentionMetaData = data;
        this.crmMentionData = crmMentionData;
        this._crmService.crmMentionData = crmMentionData;
        if (this.crmMentionData.data.details) {
          this.mentionList = this.crmMentionData.data.details;
        }
      }
      this.isLoading = false;
    });
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }

  private MapChannelType(obj: BaseMention): string {
    switch (obj.channelType) {
      case ChannelType.PublicTweets:
        return 'Public Tweets';
      case ChannelType.FBPageUser:
        return 'User Post';
      case ChannelType.FBPublic:
        return 'Public Post';
      case ChannelType.Twitterbrandmention:
        return 'Brand Mention';
      case ChannelType.FBComments:
        return 'Comments';
      case ChannelType.BrandTweets:
        return 'Brand Tweets';
      case ChannelType.DirectMessages:
        return 'Direct Messages';
      case ChannelType.Blogs:
        return 'Blogs';
      case ChannelType.DiscussionForums:
        return 'Discussion Forums';
      case ChannelType.News:
        return 'News';
      case ChannelType.TripAdvisor:
        return 'TripAdvisor';
      case ChannelType.FbMediaPosts:
        return 'Media Posts';
      case ChannelType.FBMediaComments:
        return 'Media Comments';
      case ChannelType.TeamBHPPosts:
        return 'Posts';
      case ChannelType.TeamBHPComments:
        return 'Comments';
      case ChannelType.TeamBHPOtherPostsComments:
        return 'Other Posts Comments';
      case ChannelType.ComplaintWebsites:
        return 'Complaint Websites';
      case ChannelType.YouTubePosts:
        return 'Posts';
      case ChannelType.YouTubeComments:
        return 'Comments';
      case ChannelType.InstagramPagePosts:
        return 'Page Posts';
      case ChannelType.InstagramUserPosts:
        return 'User Posts';
      case ChannelType.InstagramComments:
        return 'Comments';
      case ChannelType.InstagramPublicPosts:
        return 'Public Posts';
      case ChannelType.GooglePagePosts:
        return 'Page Posts';
      case ChannelType.GoogleUserPosts:
        return 'User Posts';
      case ChannelType.GooglePublicPosts:
        return 'Public Posts';
      case ChannelType.GoogleComments:
        return 'Comments';
      case ChannelType.CustomerCare:
        return 'CustomerCare';
      case ChannelType.Expedia:
        return 'Expedia';
      case ChannelType.Booking:
        return 'Booking';
      case ChannelType.ReviewWebsiteComments:
        return 'Posts';
      case ChannelType.ReviewWebsitePosts:
        return 'Comments';
      case ChannelType.ECommercePosts:
        return 'Posts';
      case ChannelType.ECommerceComments:
        return 'Comments';
      case ChannelType.HolidayIQReview:
        return 'HolidayIQ Review';
      case ChannelType.HolidayIQReview:
        return 'HolidayIQ Review';
      case ChannelType.ZomatoComment:
        return 'Comments';
      case ChannelType.ZomatoPost:
        return 'Posts';
      case ChannelType.FBMessages:
        return 'Messages';
      case ChannelType.Videos:
        return 'Videos';
      case ChannelType.GooglePlayStore:
        return 'PlayStore';
      case ChannelType.LinkedInPageUser:
        return 'Page User';
      case ChannelType.LinkedInPublic:
        return 'Public';
      case ChannelType.LinkedInComments:
        return 'Comments';
      case ChannelType.LinkedInMediaPosts:
        return 'MediaPosts';
      case ChannelType.LinkedInMediaComments:
        return 'Comments';
      case ChannelType.LinkedinMessage:
        return 'Message';
      case ChannelType.FBReviews:
        return 'Reviews';
      case ChannelType.AutomotiveIndiaPost:
        return 'AutomotiveIndia Post';
      case ChannelType.AutomotiveIndiaComment:
        return 'AutomotiveIndia Comment';
      case ChannelType.AutomotiveIndiaOtherPostsComments:
        return 'AutomotiveIndia Other Posts Comments';
      case ChannelType.MakeMyTrip:
        return 'Make My Trip';
      case ChannelType.Email:
        return 'Email';
      case ChannelType.GoogleMyReview:
        return 'GMB Reviews';
      case ChannelType.Survey:
        return 'Survey';
      case ChannelType.ElectronicMedia:
        return 'Electronic Media';
      case ChannelType.GMBQuestion:
        return 'GMB Questions';
      case ChannelType.GMBAnswers:
        return 'GMB Answers';
      case ChannelType.WhatsApp:
        return 'WhatsApp';
      case ChannelType.FacebookChatbot:
        return 'Facebook Chatbot';
      case ChannelType.WesiteChatbot:
        return 'Website Chatbot';
      case ChannelType.AndroidChatbot:
        return 'Android Chatbot';
      case ChannelType.IOSChatbot:
        return 'IOS Chatbot';
      case ChannelType.LineChatbot:
        return 'Line Chatbot';
      case ChannelType.WhatsAppChatbot:
        return 'WhatsApp Chatbot';

      default:
        return ChannelType[obj.channelType];
    }
  }
}
