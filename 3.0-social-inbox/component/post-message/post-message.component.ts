import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { Priority } from 'app/core/enums/Priority';
import { SsreIntent } from 'app/core/enums/SsreIntentEnum';
import { SSREMode } from 'app/core/enums/SsreLogStatusEnum';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { AuthUser } from 'app/core/interfaces/User';
import {
  TicketCustomReply,
  TicketHistoryDTO,
  TicketSpecificProfile,
} from 'app/core/models/dbmodel/TicketHistoryDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { AccountService } from 'app/core/services/account.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { take } from 'rxjs/operators';
import { BrandList } from '../../../shared/components/filter/filter-models/brandlist.model';
import { PostSubscribeComponent } from './../post-subscribe/post-subscribe.component';

@Component({
    selector: 'app-post-message',
    templateUrl: './post-message.component.html',
    styleUrls: ['./post-message.component.scss'],
    standalone: false
})
export class PostMessageComponent implements OnInit {
  @Input() baseMention: BaseMention;
  postMessage: any;
  post: TicketClient;
  currentUser: AuthUser;
  brandList: BrandList[];
  currentBrand: BrandList;
  ticketHistoryData: TicketHistoryDTO;

  constructor(
    private accountService: AccountService,
    private filterService: FilterService,
    private ticketService: TicketsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // console.log('Post Message');
    // console.log(this.postMessage);
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    this.postMessage = this.mapPostByChannel(this.baseMention);
    this.ticketHistoryData = {};
    this.ticketHistoryData.ticketClient = this.postMessage;
    this.mapwithRespectiveObject(this.baseMention);
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
  }

  private mapwithRespectiveObject(mention: BaseMention): void {
    const ActionButton = this.currentUser.data.user.actionButton;
    let IsCSDUser = false;
    let IsReadOnlySupervisor = false;
    if (
      +this.currentUser.data.user.role === UserRoleEnum.CustomerCare ||
      +this.currentUser.data.user.role === UserRoleEnum.BrandAccount
    ) {
      IsCSDUser = true;
    }

    if (
      +this.currentUser.data.user.role === UserRoleEnum.ReadOnlySupervisorAgent
    ) {
      IsReadOnlySupervisor = true;
    }

    // var OrderedList = Model.OrderBy(o => o.MentionTime);
    // var latestMention = OrderedList.Where(w => w.ConcreteClassName ==
    // "LocoBuzzRespondDashboardMVCBLL.Classes.ChannelClasses.TicketTwitter").LastOrDefault();//.TagID;

    const MentionCount = 0;
    const addDisableClass = '';
    let IsCategoryLevelBulkReply = false;
    let IsBrandLevelBulkReply = false;
    this.ticketHistoryData.IsCategoryLevelBulkReply = false;
    this.ticketHistoryData.isBrandLevelBulkReply = false;
    // let BulkReplyEnabledBrandIdsJson = '';
    this.brandList = this.filterService.fetchedBrandData;
    const currentBrandObj = this.brandList.filter((obj) => {
      return +obj.brandID === +mention.brandInfo.brandID;
    });
    this.currentBrand =
      currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;
    if (this.currentBrand === null && this.currentBrand === undefined) {
      IsCategoryLevelBulkReply = false;
      IsBrandLevelBulkReply = false;
      this.ticketHistoryData.IsCategoryLevelBulkReply = false;
      this.ticketHistoryData.isBrandLevelBulkReply = false;
    } else {
      // List < CategoryBrandLevelBulkReplySetting >
      // eslint-disable-next-line max-len
      // list; = JsonConvert.DeserializeObject<List<CategoryBrandLevelBulkReplySetting>>(Session['CategoryBrandReplySetting'].ToString());
      IsBrandLevelBulkReply = this.currentBrand.isBrandBulkReply;
      IsCategoryLevelBulkReply = this.currentBrand.isCategoryBulkReply;
      this.ticketHistoryData.IsCategoryLevelBulkReply =
        this.currentBrand.isCategoryBulkReply;
      this.ticketHistoryData.isBrandLevelBulkReply =
        this.currentBrand.isBrandBulkReply;
      // IsCategoryLevelBulkReply = list.Select(s => s.IsCategoryBulkReplyEnabled).FirstOrDefault();
      if (!this.currentBrand.isCategoryBulkReply) {
        // List < long > BulkReplyEnabledBrandIds; = new List<long>();
        // BulkReplyEnabledBrandIds = list.Where(w => w.IsBrandBulkReplyEnabled == true).Select(s => s.BrandID).ToList();
        // if (BulkReplyEnabledBrandIds.Count > 0)
        {
          // IsBrandLevelBulkReply = true;
          // BulkReplyEnabledBrandIdsJson = JsonConvert.SerializeObject(BulkReplyEnabledBrandIds);
        }
      }
    }

    // Show attach ticket button
    if (
      +this.currentUser.data.user.role === UserRoleEnum.Agent ||
      this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
      this.currentUser.data.user.role === UserRoleEnum.LocationManager ||
      this.currentUser.data.user.role === UserRoleEnum.TeamLead
    ) {
      this.ticketHistoryData.showAttachTicket = true;
      this.ticketHistoryData.showCreateSingleTicket = true;
      // eslint-disable-next-line max-len
      // <button class="btn SaveMentionAction TagAllForMentions__actions--btn dropdown-toggle" onclick="BrandTickets.GetBulkTicketsAssociatedwithAuthorID()" data-toggle="dropdown" id="btnattachticketbulk">Attach Ticket</button>
    }

    if (
      (+this.currentUser.data.user.role === UserRoleEnum.TeamLead ||
        +this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
        +this.currentUser.data.user.role === UserRoleEnum.LocationManager ||
        +this.currentUser.data.user.role === UserRoleEnum.Agent ||
        +this.currentUser.data.user.role === UserRoleEnum.BrandAccount) &&
      (IsBrandLevelBulkReply || IsCategoryLevelBulkReply)
    ) {
      this.ticketHistoryData.showReplyButton = true;
    }

    if (this.currentBrand.isBrandworkFlowEnabled) {
      this.ticketHistoryData.isBrandWorkFlowEnabled = true;
    }

    if (
      +this.currentUser.data.user.role === UserRoleEnum.Agent ||
      +this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
      +this.currentUser.data.user.role === UserRoleEnum.LocationManager ||
      +this.currentUser.data.user.role === UserRoleEnum.TeamLead
    ) {
      if (
        mention.ticketInfo.status !== TicketStatus.PendingwithCSD &&
        mention.ticketInfo.status !== TicketStatus.PendingWithBrand &&
        mention.ticketInfo.status !== TicketStatus.RejectedByBrand &&
        mention.ticketInfo.status !== TicketStatus.OnHoldCSD &&
        mention.ticketInfo.status !== TicketStatus.OnHoldBrand
      ) {
        this.ticketHistoryData.addDisableClass = '';
      } else {
        if (
          !this.currentBrand.isBrandworkFlowEnabled &&
          mention.ticketInfo.status === TicketStatus.RejectedByBrand
        ) {
          this.ticketHistoryData.addDisableClass = '';
        } else {
          this.ticketHistoryData.addDisableClass = 'CheckboxDisable';
        }
      }
    } else if (+this.currentUser.data.user.role === UserRoleEnum.CustomerCare) {
      if (
        mention.ticketInfo.status === TicketStatus.PendingWithBrand ||
        mention.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
        mention.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention ||
        mention.ticketInfo.status === TicketStatus.OnHoldBrand ||
        mention.ticketInfo.status === TicketStatus.PendingwithAgent ||
        mention.ticketInfo.status === TicketStatus.Rejected ||
        mention.ticketInfo.status === TicketStatus.ApprovedByBrand ||
        mention.ticketInfo.status === TicketStatus.Open ||
        mention.ticketInfo.status === TicketStatus.OnHoldAgent ||
        mention.ticketInfo.status === TicketStatus.CustomerInfoAwaited
      ) {
        this.ticketHistoryData.addDisableClass = 'CheckboxDisable';
      } else {
        this.ticketHistoryData.addDisableClass = '';
      }
    } else if (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount) {
      if (
        mention.ticketInfo.status === TicketStatus.ApprovedByBrand ||
        mention.ticketInfo.status === TicketStatus.RejectedByBrand ||
        mention.ticketInfo.status ===
          TicketStatus.RejectedByBrandWithNewMention ||
        mention.ticketInfo.status === TicketStatus.Close ||
        mention.ticketInfo.status === TicketStatus.PendingwithCSD ||
        mention.ticketInfo.status === TicketStatus.Open ||
        mention.ticketInfo.status === TicketStatus.OnHoldAgent ||
        mention.ticketInfo.status === TicketStatus.OnHoldCSD ||
        mention.ticketInfo.status === TicketStatus.CustomerInfoAwaited ||
        mention.ticketInfo.status === TicketStatus.PendingwithAgent ||
        mention.ticketInfo.status === TicketStatus.Rejected ||
        mention.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
        mention.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention
      ) {
        this.ticketHistoryData.addDisableClass = 'CheckboxDisable';
      } else {
        this.ticketHistoryData.addDisableClass = '';
      }
    }

    if (mention.isDeletedFromSocial) {
      // addDisableClass = "CheckboxDisable";
      this.ticketHistoryData.deletedMentionDisable = 'DeletedMentionDisable';
    }

    if (!mention.isActionable) {
      this.ticketHistoryData.addDisableClass = 'CheckboxDisable';
    }

    this.ticketHistoryData.profileObj = this.getchannelSpecificProfile(mention);
    this.ticketHistoryData.isDMSent = mention.isDMSent;
    this.ticketHistoryData.canReplyPrivately = mention.canReplyPrivately;
    this.ticketHistoryData.ticketCustomReply =
      this.getTicketCustomReply(mention);

    this.ticketHistoryData.isCanPerformActionEnable = false;
    // if (Session["IsCanPerformActionEnable"] != null)
    // {
    // IsCanPerformActionEnable = (bool)Session["IsCanPerformActionEnable"];
    // }
    // else
    // {
    // IsCanPerformActionEnable = false;
    // }
    this.ticketHistoryData.intentssre = 0;
    if (
      mention.ssreMode === SSREMode.Simulation &&
      mention.ssreIntent === SsreIntent.NoActionTaken
    ) {
      this.ticketHistoryData.intentssre = SsreIntent.Right;
    } else {
      this.ticketHistoryData.intentssre = mention.ssreIntent;
    }

    this.ticketHistoryData.channelTypeIcon =
      this.getChannelCustomeIcon(mention);

    if (
      !IsReadOnlySupervisor &&
      (mention.isActionable || mention.isBrandPost)
    ) {
      this.ticketHistoryData.isCheckBoxEnable = true;
    }
    if (
      mention.ticketInfo.lastNote &&
      mention.ticketInfo != null &&
      mention.ticketInfo.latestTagID === mention.ticketInfo.tagID
    ) {
      this.ticketHistoryData.isLastNote = true;
      this.ticketHistoryData.LastNote = mention.ticketInfo.lastNote;
    }

    if (!mention.isBrandPost) {
      if (!mention.isActionable) {
        this.ticketHistoryData.ticketMentionActionBtn = true;
      }
    }

    if (
      mention.ticketInfo.status === TicketStatus.Close ||
      (+this.currentUser.data.user.role === 2 &&
        +this.currentUser.data.user.role === TicketStatus.ApprovedByBrand) ||
      (+this.currentUser.data.user.role === 8 &&
        (mention.ticketInfo.status === TicketStatus.ApprovedByBrand ||
          mention.ticketInfo.status === TicketStatus.RejectedByBrand))
    ) {
      this.ticketHistoryData.performActionEnabled = true;
    }
    if (this.currentUser.data.user.actionButton.deleteLocobuzzEnabled) {
      this.ticketHistoryData.isDeleteFromLocobuzz = true;
    }
    if (
      this.currentUser.data.user.actionButton.deleteSocialEnabled &&
      ((mention.channelType === 10 && mention.isBrandPost) ||
        (mention.channelType === 17 && mention.isBrandPost) || (mention.channelType === ChannelType.InstagramComments && mention.instagramPostType === 1))
    ) {
      this.ticketHistoryData.isDeleteFromChannel = true;
    }
    this.ticketHistoryData.isSubscriptionActive = mention.isSubscribed
      ? 'active'
      : '';
    this.ticketHistoryData.isVisible =
      mention.ticketInfo.status === TicketStatus.Close || mention.isBrandPost
        ? false
        : true;

    this.ticketHistoryData.actionLikeEnabled =
      this.currentUser.data.user.actionButton.likeEnabled;
    this.ticketHistoryData.actionRetweetEnabled =
      this.currentUser.data.user.actionButton.retweetEnabled;
  }

  getChannelCustomeIcon(mention: BaseMention): string {
    let channeltypeicon = '';
    if (mention.channelGroup === ChannelGroup.Twitter) {
      if (mention.channelType === ChannelType.DirectMessages) {
        channeltypeicon = '~/images/channelsv/Twitter_DM.svg';
      } else if (mention.channelType === ChannelType.PublicTweets) {
        channeltypeicon = 'assets/images/channelsv/Public_Tweet.svg';
        // eslint-disable-next-line max-len
        // <img src='~/images/channelsv/Public_Tweet.svg' title='Twitter Public Tweet' alt='Twitter Public Tweet' />
      } else if (
        mention.channelType === ChannelType.BrandTweets &&
        !mention.isBrandPost
      ) {
        channeltypeicon = 'assets/images/channelsv/Brand_Mention.svg';
        // <img src='~/images/channelsv/Brand_Mention.svg' title='Twitter Tweet' alt='Twitter Tweet' />
      } else if (
        mention.channelType === ChannelType.Twitterbrandmention &&
        !mention.isBrandPost
      ) {
        channeltypeicon = 'assets/images/channelsv/Brand_Mention.svg';
        // eslint-disable-next-line max-len
        // <img src='~/images/channelsv/Brand_Mention.svg' title='Twitter Brand Mentions' alt='Twitter Brand Mentions' />
      } else {
        channeltypeicon = 'assets/images/channel-logos/twitter.svg';
        // <img src='~/images/channelsv/Brand_Tweet.svg' alt='Twitter Mention' title='Twitter Mention' />
      }
    } else if (mention.channelGroup === ChannelGroup.Facebook) {
      if (mention.channelType === ChannelType.FBComments) {
        channeltypeicon = 'assets/images/channelsv/FB_Comment.svg';
      } else if (mention.channelType === ChannelType.FBMediaComments) {
        channeltypeicon =
          'assets/images/channelsv/FB_Public_Post_Comment_1.svg';
      } else if (mention.channelType === ChannelType.FBMessages) {
        channeltypeicon = 'assets/images/channelsv/Facebook_DM.svg';
      } else if (mention.channelType === ChannelType.FBReviews) {
        channeltypeicon = 'assets/images/channelsv/FB_Review.svg';
      } else if (mention.channelType === ChannelType.FBPublic) {
        channeltypeicon = 'assets/images/channelsv/FB_Public_post_1.svg';
      } else if (
        mention.channelType === ChannelType.FBPageUser &&
        !mention.isBrandPost
      ) {
        channeltypeicon = 'assets/images/channelsv/FB_User_Post.svg';
      } else {
        channeltypeicon = 'assets/images/channel-logos/facebook.svg';
      }
    } else if (mention.channelGroup === ChannelGroup.WhatsApp) {
      channeltypeicon = 'assets/images/channelicons/WhatsApp.png';
    } else if (mention.channelGroup === ChannelGroup.LinkedIn) {
      if (mention.channelType === ChannelType.LinkedInPageUser) {
        channeltypeicon = 'assets/images/channelicons/linkedinicon.png';
      } else {
        channeltypeicon = 'assets/images/channel-logos/linkedin.svg';
      }
    } else if (mention.channelGroup === ChannelGroup.GooglePlus) {
      if (mention.channelType === ChannelType.GoogleComments) {
        channeltypeicon = 'assets/images/channelicons/googlepluscomment.png';
      } else {
        channeltypeicon = 'assets/images/channelicons/googlePlus.png';
      }
    } else {
      channeltypeicon = `assets/images/channelicons/${
        ChannelGroup[mention.channelGroup]
      }.png`;
    }
    return channeltypeicon;
  }

  getTicketCustomReply(mention: BaseMention): TicketCustomReply {
    const ticketReplyObj: TicketCustomReply = {};
    if (
      mention.channelGroup === ChannelGroup.Facebook ||
      mention.channelGroup === ChannelGroup.Twitter ||
      mention.channelGroup === ChannelGroup.Instagram ||
      mention.channelGroup === ChannelGroup.Youtube ||
      mention.channelGroup === ChannelGroup.LinkedIn
    ) {
      if (mention.isBrandPost) {
        ticketReplyObj.BrandPostClass = 'TicketPostReply';
        ticketReplyObj.chkTagTicket = 'chkTagTicket_BrandPost';
        if (mention.replyUseid === -1 || mention.replyUseid > 0) {
          ticketReplyObj.replyfrom = 'This reply was sent from Locobuzz';
          ticketReplyObj.replyImg = '/images/locobuzz-icon.svg';
          ticketReplyObj.isreply = true;
        } else if (mention.replyUseid === -2) {
          ticketReplyObj.replyfrom = `This reply was sent from ${
            ChannelGroup[mention.channelGroup]
          }`;
          ticketReplyObj.replyImg = '/images/social-generic.svg';
          ticketReplyObj.isreply = true;
        }
      }
    }
    if (
      mention.channelGroup === ChannelGroup.WhatsApp ||
      mention.channelGroup === ChannelGroup.WebsiteChatBot ||
      mention.channelGroup === ChannelGroup.GooglePlus
    ) {
      ticketReplyObj.BrandPostClass = 'TicketPostReply';
      ticketReplyObj.chkTagTicket = 'chkTagTicket_BrandPost';
      ticketReplyObj.replyfrom = `This reply was sent from ${
        ChannelGroup[mention.channelGroup]
      }`;
      ticketReplyObj.replyImg = '/images/locobuzz-icon.svg';
      if (mention.isBrandPost) {
        if (mention.mainTweetid) {
          ticketReplyObj.replyfrom = 'This reply was sent from Locobuzz';
          ticketReplyObj.replyImg = '/images/locobuzz-icon.svg';
        }
      }
    }
    return ticketReplyObj;
  }

  getchannelSpecificProfile(mention: BaseMention): TicketSpecificProfile {
    const profileObj: TicketSpecificProfile = {};
    if (mention.channelGroup === ChannelGroup.Facebook) {
      profileObj.profilepicurl = 'https://graph.facebook.com/';
      if (mention.author.socialId && mention.author.socialId !== '0') {
        profileObj.profileurl =
          'http://www.facebook.com/' + mention.author.socialId;
        profileObj.profilepicurl = mention.author.picUrl;
        if (!profileObj.profilepicurl) {
          profileObj.profilepicurl =
            'assets/images/agentimages/sample-image.svg';
        }
      } else {
        profileObj.profilepicurl = '/images/AgentImages/sample-image.jpg';
        profileObj.profileurl = 'javascript:void(0)';
      }
    }
    if (mention.channelGroup === ChannelGroup.WhatsApp) {
      if (mention.author.socialId && mention.author.socialId !== '0') {
        profileObj.profilepicurl = '/images/AgentImages/sample-image.jpg';
        profileObj.profileurl = 'javascript:void(0)';
      } else {
        profileObj.profilepicurl = '/images/AgentImages/sample-image.jpg';
        profileObj.profileurl = 'javascript:void(0)';
      }
    } else {
      profileObj.profilepicurl = mention.author.picUrl;
      if (!profileObj.profilepicurl) {
        profileObj.profilepicurl = 'assets/images/agentimages/sample-image.svg';
        profileObj.profileurl = 'javascript:void(0)';
      }
    }

    return profileObj;
  }

  openSubscribePopup(): void {
    this.dialog.open(PostSubscribeComponent, {
      autoFocus: false,
      width: '800px',
    });
  }

  private mapPostByChannel(mention: BaseMention): TicketClient {
    // console.log(mention);

    let ticketCategory = '';
    let mentionCategory = '';
    if (mention.ticketInfo.ticketCategoryMap != null) {
      ticketCategory = mention.ticketInfo.ticketCategoryMap[0].name
        ? mention.ticketInfo.ticketCategoryMap[0].name
        : '';
    }
    if (mention.categoryMap != null) {
      mentionCategory = mention.categoryMap[0].name
        ? mention.categoryMap[0].name
        : '';
    }
    const assignToname = this.filterService.getNameByID(
      mention.ticketInfo.assignedTo,
      this.filterService.fetchedAssignTo
    );
    this.post = {
      brandName: mention.brandInfo.brandName,
      channelName: this.MapChannelType(mention),
      ticketId: mention.ticketInfo.ticketID,
      mentionCount: mention.ticketInfo.numberOfMentions,
      note: mention.note,
      ticketTime: this.ticketService.calculateTicketTimes(mention),
      assignTo: assignToname,
      ticketStatus: TicketStatus[mention.ticketInfo.status],
      ticketPriority: Priority[mention.ticketInfo.ticketPriority],
      ticketDescription: mention.description,
      ticketCategory: {
        ticketUpperCategory: mention.ticketInfo.ticketUpperCategory.name,
        mentionUpperCategory: mention.upperCategory.name,
      },
      Userinfo: {
        name: mention.author.name,
        image: mention.author.picUrl
          ? mention.author.picUrl
          : 'assets/images/agentimages/sample-image.svg',
        screenName: mention.author.screenname,
        bio: mention.author.bio,
        followers: mention.author.followersCount,
        following: mention.author.followingCount,
        location: mention.author.location,
        sentimentUpliftScore: mention.author.sentimentUpliftScore,
        npsScore: mention.author.nPS,
        isVerified: mention.author.isVerifed,
      },
      ticketCategoryTop: ticketCategory,
      mentionCategoryTop: mentionCategory,
      channelImage: this.ticketService.getChannelCustomeIcon(mention),
    };
    return this.post;
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
      default:
        return ChannelType[obj.channelType];
    }
  }
}
