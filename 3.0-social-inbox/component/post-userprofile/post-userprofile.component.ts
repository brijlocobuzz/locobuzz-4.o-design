import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthorActions } from 'app/core/enums/AuthorActions';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelImage } from 'app/core/enums/ChannelImgEnum';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import {
  CustomAuthorDetails,
  CustomConnectedUsers,
  CustomCrmColumns,
} from 'app/core/interfaces/AuthorDetails';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseSocialAccountConfiguration } from 'app/core/models/accountconfigurations/BaseSocialAccountConfiguration';
import { BaseSocialAuthor } from 'app/core/models/authors/locobuzz/BaseSocialAuthor';
import { SocialHandle } from 'app/core/models/dbmodel/TicketReplyDTO';
import { UpliftAndSentimentScore } from 'app/core/models/dbmodel/UpliftAndSentimentScore';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { TicketInfo } from 'app/core/models/viewmodel/TicketInfo';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink/dist/subsink';
import { PostMarkinfluencerComponent } from '../post-markinfluencer/post-markinfluencer.component';
import { AddAssociateChannelsComponent } from './../add-associate-channels/add-associate-channels.component';
import { EnrichViewComponent } from './../enrich-view/enrich-view.component';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { UnlinkProfileComponent } from './unlink-profile/unlink-profile.component';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { MicrophonePermissionComponent } from 'app/shared/components/microphone-permission/microphone-permission.component';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { VoIPEnum } from 'app/shared/components/brand-select/brand-select.component';
import { OzontelService } from 'app/core/services/ozontel.service';

@Component({
    selector: 'app-post-userprofile',
    templateUrl: './post-userprofile.component.html',
    styleUrls: ['./post-userprofile.component.scss'],
    standalone: false
})
export class PostUserprofileComponent implements OnInit, OnDestroy {
  @Input() author?: BaseSocialAuthor;
  @Input() upliftAndSentimentScore?: UpliftAndSentimentScore;
  @Input() ticketSumamry?: TicketInfo;
  @Input() showActions?: boolean = true;
  @Output() loaderOutputEmitFlag = new EventEmitter();
  @Output() setLoader = new EventEmitter();
  @Output() userProfileLinkEmit = new EventEmitter();
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  customAuthorDetails: CustomAuthorDetails;
  postObj: BaseMention;
  objBrandSocialAcount: BaseSocialAccountConfiguration[];
  CrmDetails: any[] = [];
  currentUser: AuthUser;
  customCrmColumns: CustomCrmColumns[] = [];
  handleNames?: SocialHandle[] = [];
  followBlockMuteandleList?: SocialHandle[] = [];
  unFollowUnBlockUnMuteHandleList?: SocialHandle[] = [];
  selectedHandle?: SocialHandle = {};
  authorAction: number;
  authorActionFlag: boolean;
  loaderTypeEnum = loaderTypeEnum;
  profileLoading = true;
  likeUnlike = false;
  traitName = '';
  selectable = true;
  removable = true;
  addOnBlur = true;
  subs = new SubSink();
  submitButtonName = '';
  refereshData = false;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  markInfluencerEnabled: boolean;
  blockUnblockFlag: boolean;
  followUnfollowFlag: boolean;
  muteUnmuteFlag: boolean;
  showNps: boolean=false;
  @ViewChild('followUnfollowMenuTrigger') followUnfollowMenuTrigger: MatMenuTrigger;
  userProfileImg: string = '';
  initials: string = '';
  refGetAuthorDetails;
  refGetAuthorDetails2;
  refGetTicketSummary;
  refGetSentimentUpliftAndNPSScore;
  refGetBrandAccountInformation;
  refFollowUnfollowAuthor;
  refMuteUnmuteAuthor;
  refBlockUnblockAuthor;
  refGetStatusofFollowUnfollow;
  refGetStatusofBlockUnblockUser;
  refGetStatusofMuteUnmute;
  refDeleteTraits;
  refUnlinkMapSocialUsers;
  voipAgent:boolean = false;
  defaultLayout: boolean = false;
  addTraitEnabled: boolean = false;

  constructor(
    private accountService: AccountService,
    private filterService: FilterService,
    private _userDetailService: UserDetailService,
    private _postDetailService: PostDetailService,
    private dialog: MatDialog,
    private _mapLocobuzzEntity: MaplocobuzzentitiesService,
    private replyService: ReplyService,
    private _snackBar: MatSnackBar,
    private cdk: ChangeDetectorRef,
    private _ticketService: TicketsService,
    private exotelService:ExotelService,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    private translate: TranslateService,
    private ozontelService:OzontelService
  ) {}
  trackByIndex(index: number): any {
    return index;
  }
   channelGroupEnum= ChannelGroup;
   userRoleEnum= UserRoleEnum
   getAuthorAction=AuthorActions;

  ngOnInit(): void {
    this.postObj = this._postDetailService.postObj;
    this.subs.add(
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user)));
    if (this.author && this.ticketSumamry) {
      this.profileLoading = false;
      this.mapCRMColumns(this.author);
      this.createUserObject(this.author);
    } else {
      //
      this.getAuthorDetails();
    }

    // if (this.postObj.channelGroup == ChannelGroup.ECommerceWebsites ||
    //   this.postObj.channelGroup == ChannelGroup.AppStoreReviews ||
    //   this.postObj.channelGroup == ChannelGroup.ComplaintWebsites ) {
    //   this.showActions = false;
    // }

    if (this.postObj.channelGroup == this.channelGroupEnum.Twitter ||
       this.postObj.channelGroup == this.channelGroupEnum.Facebook ||
        this.postObj.channelGroup == this.channelGroupEnum.Instagram ||
         this.postObj.channelGroup == this.channelGroupEnum.Youtube ||
          this.postObj.channelGroup == this.channelGroupEnum.WhatsApp ||
           this.postObj.channelGroup == this.channelGroupEnum.LinkedIn ||
            this.postObj.channelGroup == this.channelGroupEnum.Voice ||
            this.postObj.channelGroup == this.channelGroupEnum.GoogleMyReview ||
             this.postObj.channelGroup == this.channelGroupEnum.Email)
             {

             }else{
      this.showActions = false;
    }
    this.markInfluencerEnabled= this.currentUser.data.user.actionButton.markInfluencerEnabled;
    this.blockUnblockFlag = this.currentUser?.data?.user?.actionButton?.blockUnblockEnabled;
    this.followUnfollowFlag = this.currentUser?.data?.user?.actionButton?.followUnfollowEnabled;
    this.muteUnmuteFlag = this.currentUser?.data?.user?.actionButton?.muteUnmuteEnabled;

    this.subs.add(
      this._ticketService.updatephoneEmail.subscribe((data) => {
        if (data) {
          this.customAuthorDetails.phoneNumber = data.phoneNumber;
          this.customAuthorDetails.email = data.emailID;
        }
      })
    );
    this.userProfileImg = this.customAuthorDetails?.profilePicUrl?.includes('assets/images/agentimages/sample-image.svg') ? 'initials' : this.customAuthorDetails?.profilePicUrl;
    this.initials = this._ticketService.getInitials(this.customAuthorDetails?.authorName);
    if(this.postObj?.channelGroup== ChannelGroup.Voice)
    {
      this.userProfileImg = 'assets/images/agentimages/sample-image.svg'
    }
    this.voipAgent = this.currentUser?.data?.user?.isVOIPAgent;
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this.cdk.detectChanges();
        }
      })
    )
  }

  ngOnDestroy(): void {
    this._ticketService.updatephoneEmail.next(null);
    this.clearAllVeriable();
  }

  // getInitials() {
  //   const name = this.customAuthorDetails?.authorName?.trim();
  //   const userName = name?.replace(/[^a-zA-Z ]/g, '')?.replace(/\s+/g, ' ');
  //   const parts = userName?.split(' ');
  //   if (parts?.length > 1) {
  //     this.initials = `${parts[0][0]?.toUpperCase()}${parts[parts?.length - 1][0]?.toUpperCase()}`;
  //   } else if (parts?.length) {
  //     this.initials = parts[0]?.slice(0, 2)?.toUpperCase();
  //   }
  // }

  private createUserObject(authorObj: BaseSocialAuthor): void {
    // create an user object
    this.customAuthorDetails = {};
    this.customAuthorDetails.authorName = authorObj?.name;
    switch (authorObj.channelGroup) {
      case ChannelGroup.Twitter: {
        this.customAuthorDetails.screenName = authorObj.screenname;
        // console.log(authorObj.name);
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        this.customAuthorDetails.isVerified = authorObj.isVerifed;
        this.customAuthorDetails.followersCount = authorObj.followersCount;
        this.customAuthorDetails.kloutScore = authorObj.kloutScore;
        this.customAuthorDetails.profileUrl =
          'https://www.twitter.com/' + authorObj.screenname;
        break;
      }
      case ChannelGroup.Facebook: {
        // this.customAuthorDetails.screenName = authorObj.name;
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        if (authorObj.socialId && authorObj.socialId !== '0') {
          this.customAuthorDetails.profileUrl =
            'http://www.facebook.com/' + authorObj.socialId;
          if (!authorObj.picUrl) {
            this.customAuthorDetails.profilePicUrl =
              'assets/images/agentimages/sample-image.svg';
          }
        } else {
          this.customAuthorDetails.profilePicUrl =
            'assets/images/agentimages/sample-image.svg';
          this.customAuthorDetails.profileUrl = undefined;
        }
        break;
      }
      case ChannelGroup.Instagram: {
        this.customAuthorDetails.screenName = authorObj.screenname;
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        this.customAuthorDetails.profileUrl =
          'https://www.instagram.com/' + authorObj.screenname;
        break;
      }
      case ChannelGroup.WhatsApp: {
        // this.customAuthorDetails.screenName = authorObj.name;
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        this.customAuthorDetails.profileUrl = authorObj.profileUrl;
        break;
      }
      case ChannelGroup.WebsiteChatBot: {
        // this.customAuthorDetails.screenName = authorObj.name;
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        this.customAuthorDetails.profileUrl = authorObj.profileUrl;
        break;
      }
      case ChannelGroup.Youtube: {
        // this.customAuthorDetails.screenName = authorObj.name;
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        this.customAuthorDetails.profileUrl = authorObj.profileUrl;
        break;
      }
      case ChannelGroup.LinkedIn: {
        // this.customAuthorDetails.screenName = authorObj.name;
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        this.customAuthorDetails.profileUrl = authorObj.profileUrl;
        break;
      }
      case ChannelGroup.GooglePlayStore: {
        // this.customAuthorDetails.screenName = authorObj.name;
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        this.customAuthorDetails.profileUrl = authorObj.profileUrl;
        break;
      }
      case ChannelGroup.Email: {
        this.customAuthorDetails.screenName = authorObj.socialId;
        break;
      }
      case ChannelGroup.Voice: {
        this.customAuthorDetails.screenName = authorObj.socialId;

        break;
      }
      default: {
        // this.customAuthorDetails.screenName = authorObj.name;
        this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        this.customAuthorDetails.profileUrl = authorObj.profileUrl;
        break;
      }
    }
    if (!this.customAuthorDetails.profilePicUrl) {
      this.customAuthorDetails.profilePicUrl =
        'assets/images/agentimages/sample-image.svg';
    }

    this.userProfileLinkEmit.emit(this.customAuthorDetails.profileUrl);

    this.customAuthorDetails.isValidAuthorSocialIntegervalue = true;
    this.customAuthorDetails.showPersonalDetails = false;
    const IntegerAuthorSocialID: number = 0;
    if (authorObj && authorObj.socialId) {
      this.customAuthorDetails.isValidAuthorSocialIntegervalue = !isNaN(
        +authorObj.socialId
      );
    }

    if (
      this.customAuthorDetails.isValidAuthorSocialIntegervalue &&
      IntegerAuthorSocialID === 0
    ) {
      this.customAuthorDetails.showPersonalDetails = false;
    } else {
      this.customAuthorDetails.showPersonalDetails = true;
    }

    try {
      // Display Locobuzz previuos CRM Details
      if (
        (authorObj.locoBuzzCRMDetails.name ||
          authorObj.previousLocoBuzzCRMDetails.name) &&
        authorObj.previousLocoBuzzCRMDetails.name !==
          authorObj.locoBuzzCRMDetails.name
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'Name';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }
      if (
        (authorObj.locoBuzzCRMDetails.emailID ||
          authorObj.previousLocoBuzzCRMDetails.emailID) &&
        authorObj.previousLocoBuzzCRMDetails.emailID !==
          authorObj.locoBuzzCRMDetails.emailID
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'EmailID';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }
      if (
        (authorObj.locoBuzzCRMDetails.alternativeEmailID ||
          authorObj.previousLocoBuzzCRMDetails.alternativeEmailID) &&
        authorObj.previousLocoBuzzCRMDetails.alternativeEmailID !==
          authorObj.locoBuzzCRMDetails.alternativeEmailID
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'AlternativeEmailID';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.phoneNumber ||
          authorObj.previousLocoBuzzCRMDetails.phoneNumber) &&
        authorObj.previousLocoBuzzCRMDetails.phoneNumber !==
          authorObj.locoBuzzCRMDetails.phoneNumber
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'PhoneNumber';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.link ||
          authorObj.previousLocoBuzzCRMDetails.link) &&
        authorObj.previousLocoBuzzCRMDetails.link !==
          authorObj.locoBuzzCRMDetails.link
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'Link';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.address1 ||
          authorObj.previousLocoBuzzCRMDetails.address1) &&
        authorObj.previousLocoBuzzCRMDetails.address1 !==
          authorObj.locoBuzzCRMDetails.address1
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'Address1';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.address2 ||
          authorObj.previousLocoBuzzCRMDetails.address2) &&
        authorObj.previousLocoBuzzCRMDetails.address2 !==
          authorObj.locoBuzzCRMDetails.address2
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'Address2';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.alternatePhoneNumber ||
          authorObj.previousLocoBuzzCRMDetails.alternatePhoneNumber) &&
        authorObj.previousLocoBuzzCRMDetails.alternatePhoneNumber !==
          authorObj.locoBuzzCRMDetails.alternatePhoneNumber
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'AlternatePhoneNumber';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.notes ||
          authorObj.previousLocoBuzzCRMDetails.notes) &&
        authorObj.previousLocoBuzzCRMDetails.notes !==
          authorObj.locoBuzzCRMDetails.notes
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'Notes';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.zipCode ||
          authorObj.previousLocoBuzzCRMDetails.zipCode) &&
        authorObj.previousLocoBuzzCRMDetails.zipCode !==
          authorObj.locoBuzzCRMDetails.zipCode
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'ZIPCode';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }
      if (
        (authorObj.locoBuzzCRMDetails.city ||
          authorObj.previousLocoBuzzCRMDetails.city) &&
        authorObj.previousLocoBuzzCRMDetails.city !==
          authorObj.locoBuzzCRMDetails.city
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'City';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.state ||
          authorObj.previousLocoBuzzCRMDetails.state) &&
        authorObj.previousLocoBuzzCRMDetails.state !==
          authorObj.locoBuzzCRMDetails.state
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'State';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.country ||
          authorObj.previousLocoBuzzCRMDetails.country) &&
        authorObj.previousLocoBuzzCRMDetails.country !==
          authorObj.locoBuzzCRMDetails.country
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'Country';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }

      if (
        (authorObj.locoBuzzCRMDetails.ssn ||
          authorObj.previousLocoBuzzCRMDetails.ssn) &&
        authorObj.previousLocoBuzzCRMDetails.ssn !==
          authorObj.locoBuzzCRMDetails.ssn
      ) {
        const result = authorObj.crmColumns.existingColumns.find((obj) => {
          return obj.dbColumn === 'SSN';
        });
        this.customAuthorDetails.fieldsChanged = result
          ? this.customAuthorDetails.fieldsChanged + result.columnLable + ','
          : '';
      }
      if (this.customAuthorDetails.fieldsChanged) {
        this.customAuthorDetails.fieldsChanged =
          this.customAuthorDetails.fieldsChanged.replace(/,\s*$/, '');
      }
    } catch (error) {
      // console.log(error);
    }
    this.customAuthorDetails.location = authorObj.location;
    this.customAuthorDetails.channelGroup = authorObj.channelGroup;
    this.customAuthorDetails.gender =
      authorObj.locoBuzzCRMDetails.gender === '0'
        ? 'Male'
        : authorObj.locoBuzzCRMDetails.gender === '1'
        ? 'Female'
        : null;
    this.customAuthorDetails.age = authorObj.locoBuzzCRMDetails.age;
    this.customAuthorDetails.influencer =
      authorObj.markedInfluencerCategoryName;
    this.customAuthorDetails.email = authorObj.locoBuzzCRMDetails.emailID;
    const phoneNumber = authorObj.locoBuzzCRMDetails.phoneNumber ? authorObj.locoBuzzCRMDetails.phoneNumber : this._postDetailService?.postObj?.author?.channelGroup == ChannelGroup.WhatsApp ? this._postDetailService?.postObj?.author?.socialId : '';
    this.customAuthorDetails.phoneNumber = phoneNumber;
    this.customAuthorDetails.Bio = authorObj.bio;
    this.customAuthorDetails.npsScrore = this.upliftAndSentimentScore.npsScore;
    this.customAuthorDetails.sentimentUpliftScore =
      this.upliftAndSentimentScore.upliftSentimentScore;
    this.customAuthorDetails.isNpsOn = this.upliftAndSentimentScore.isNpsOn;
    this.customAuthorDetails.lastNpsUpdatedDate =
      this.upliftAndSentimentScore.npsLastRecordDate;
    this.customAuthorDetails.lastNpsUpliftUpdatedDate =
      this.upliftAndSentimentScore.upliftLastupdatedDatetime;
    if (this.upliftAndSentimentScore.npsScore > 8) {
      this.customAuthorDetails.npsEmoji =
        'assets/images/feedback/promoters.svg';
    } else if (this.upliftAndSentimentScore.npsScore > 6) {
      this.customAuthorDetails.npsEmoji = 'assets/images/feedback/passives.svg';
    } else if (this.upliftAndSentimentScore.npsScore >= 0) {
      this.customAuthorDetails.npsEmoji =
        'assets/images/feedback/detractors.svg';
      this.customAuthorDetails.hasNpsUpdatedYet = false;
    }
    if (
      this.upliftAndSentimentScore.npsLastRecordDate === '0001-01-01T00:00:00'
    ) {
      this.customAuthorDetails.hasNpsUpdatedYet = false;
    }
    if (
      this.upliftAndSentimentScore.upliftLastupdatedDatetime ===
      '0001-01-01T00:00:00'
    ) {
      this.customAuthorDetails.hasNpsUpliftUpdatedYet = false;
    }

    if (this.upliftAndSentimentScore.upliftSentimentScore > 70) {
      // set some color
      this.customAuthorDetails.sentimentUpliftScore =
        Math.round(
          (+this.upliftAndSentimentScore.upliftSentimentScore +
            Number.EPSILON) *
            100
        ) / 100;
    } else if (this.upliftAndSentimentScore.upliftSentimentScore > 35) {
      // set some color
      this.customAuthorDetails.sentimentUpliftScore =
        Math.round(
          (+this.upliftAndSentimentScore.upliftSentimentScore +
            Number.EPSILON) *
            100
        ) / 100;
    } else {
      // set some color
      this.customAuthorDetails.sentimentUpliftScore =
        Math.round(
          (+this.upliftAndSentimentScore.upliftSentimentScore +
            Number.EPSILON) *
            100
        ) / 100;
    }

    // connected Users Logic
    this.customAuthorDetails.connectedUsers = [];
    if (
      authorObj &&
      authorObj.connectedUsers &&
      authorObj.connectedUsers.length > 0
    ) {
      authorObj.connectedUsers = authorObj.connectedUsers.filter(
        (obj) => obj.latestTicketID != '0'
      );
    }
    if (authorObj && authorObj.connectedUsers.length === 0) {
      const customconnectedUsers: CustomConnectedUsers = {};
      switch (authorObj.channelGroup) {
        case ChannelGroup.Twitter: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.screenName = authorObj.screenname;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.followers = authorObj.followersCount;
          customconnectedUsers.following = authorObj.followingCount;
          customconnectedUsers.tweets = authorObj.tweetCount;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/twitter.svg';
          customconnectedUsers.picUrl =
            'https://www.twitter.com/' + authorObj.screenname;
          break;
        }
        case ChannelGroup.Facebook: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/facebook.svg';
          if (authorObj.socialId && authorObj.socialId !== '0') {
            customconnectedUsers.picUrl =
              'http://www.facebook.com/' + authorObj.socialId;
            if (!authorObj.picUrl) {
              customconnectedUsers.profilepicURL =
                'assets/images/agentimages/sample-image.svg';
            }
          } else {
            customconnectedUsers.profilepicURL =
              'assets/images/agentimages/sample-image.svg';
            customconnectedUsers.picUrl = undefined;
          }
          break;
        }
        case ChannelGroup.Instagram: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/instagram.svg';
          if (!authorObj.profileUrl) {
            customconnectedUsers.picUrl = `https://www.instagram.com/${authorObj.screenname}`;
          }
          break;
        }
        case ChannelGroup.Youtube: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channelicons/Youtube.png';
          if (!authorObj.profileUrl) {
            customconnectedUsers.picUrl = `http://www.youtube.com/channel/${authorObj.socialId}`;
          }
          break;
        }
        case ChannelGroup.LinkedIn: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/linkedin.svg';
          break;
        }
        case ChannelGroup.Voice: {
          customconnectedUsers.name = authorObj.socialId;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            '/assets/images/channelicons/Voip.svg';
            break;
        }
        case ChannelGroup.Quora: {
          customconnectedUsers.name = authorObj.name
            ? authorObj.name
            : 'Anonymous';
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage = ChannelImage.Quora;
          break;
        }
        case ChannelGroup.GoogleMyReview: {
          customconnectedUsers.name = authorObj?.name ? authorObj.name : 'Anonymous';
          customconnectedUsers.profilepicURL = authorObj?.picUrl;
          customconnectedUsers.picUrl = authorObj?.profileUrl;
          customconnectedUsers.channelImage = 'assets/images/channelicons/GoogleMyReview.svg';
          break;
        }
        case ChannelGroup.Email: {
          customconnectedUsers.name = authorObj?.name ? authorObj.name : 'Anonymous';
          customconnectedUsers.profilepicURL = authorObj?.picUrl;
          customconnectedUsers.picUrl = authorObj?.profileUrl;
          customconnectedUsers.channelImage = 'assets/images/channel-logos/email.svg';
          break;
        }
        default:
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            ChannelImage[ChannelGroup[authorObj.channelGroup]];
          break;
      }
      customconnectedUsers.showRemoveIcon = false
      customconnectedUsers.socialId = authorObj.socialId
      this.customAuthorDetails.connectedUsers.push(customconnectedUsers);
    } else {
      const customconnectedUsers: CustomConnectedUsers = {};
      switch (authorObj.channelGroup) {
        case ChannelGroup.Twitter: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.screenName = authorObj.screenname;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.followers = authorObj.followersCount;
          customconnectedUsers.following = authorObj.followingCount;
          customconnectedUsers.tweets = authorObj.tweetCount;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/twitter.svg';
          customconnectedUsers.picUrl =
            'https://www.twitter.com/' + authorObj.screenname;
          break;
        }
        case ChannelGroup.Facebook: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/facebook.svg';
          if (authorObj.socialId && authorObj.socialId !== '0') {
            customconnectedUsers.picUrl =
              'http://www.facebook.com/' + authorObj.socialId;
            if (!authorObj.picUrl) {
              customconnectedUsers.profilepicURL =
                'assets/images/agentimages/sample-image.svg';
            }
          } else {
            customconnectedUsers.profilepicURL =
              'assets/images/agentimages/sample-image.svg';
            customconnectedUsers.picUrl = undefined;
          }
          break;
        }
        case ChannelGroup.Instagram: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/instagram.svg';
          if (!authorObj.profileUrl) {
            customconnectedUsers.picUrl = `https://www.instagram.com/${authorObj.screenname}`;
          }
          break;
        }
        case ChannelGroup.Youtube: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channelicons/Youtube.png';
          if (!authorObj.profileUrl) {
            customconnectedUsers.picUrl = `http://www.youtube.com/channel/${authorObj.socialId}`;
          }
          break;
        }
        case ChannelGroup.LinkedIn: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/linkedin.svg';
          break;
        }
        case ChannelGroup.Voice: {
          customconnectedUsers.name = authorObj.socialId;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            '/assets/images/channelicons/Voip.svg';
          break;
        }
        case ChannelGroup.GoogleMyReview: {
          customconnectedUsers.name = authorObj?.name ? authorObj.name : 'Anonymous';
          customconnectedUsers.profilepicURL = authorObj?.picUrl;
          customconnectedUsers.picUrl = authorObj?.profileUrl;
          customconnectedUsers.channelImage = 'assets/images/channelicons/GoogleMyReview.svg';
          break;
        }
        case ChannelGroup.Email: {
          customconnectedUsers.name = authorObj?.name ? authorObj.name : 'Anonymous';
          customconnectedUsers.profilepicURL = authorObj?.picUrl;
          customconnectedUsers.picUrl = authorObj?.profileUrl;
          customconnectedUsers.channelImage = 'assets/images/channel-logos/email.svg';
          break;
        }
        default:
          customconnectedUsers.name = authorObj.name
            ? authorObj.name
            : 'Anonymous';
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            ChannelImage[ChannelGroup[authorObj.channelGroup]];
          break;
      }
      customconnectedUsers.showRemoveIcon = false;
      customconnectedUsers.socialId = authorObj.socialId;
      this.customAuthorDetails.connectedUsers.push(customconnectedUsers);
      for (const user of authorObj.connectedUsers) {
        const customconnectedUsers: CustomConnectedUsers = {};
        switch (user.channelGroup) {
          case ChannelGroup.Twitter: {
            customconnectedUsers.name = user.name;
            customconnectedUsers.screenName = user.screenname;
            customconnectedUsers.profilepicURL = user.picUrl;
            customconnectedUsers.followers = user.followersCount;
            customconnectedUsers.following = user.followingCount;
            customconnectedUsers.tweets = user.tweetCount;
            customconnectedUsers.channelImage =
              'assets/images/channel-logos/twitter.svg';
            customconnectedUsers.picUrl =
              'https://www.twitter.com/' + authorObj.screenname;
            break;
          }
          case ChannelGroup.Facebook: {
            customconnectedUsers.name = user.name;
            customconnectedUsers.profilepicURL = user.picUrl;
            customconnectedUsers.channelImage =
              'assets/images/channel-logos/facebook.svg';
            if (user.socialId && user.socialId !== '0') {
              customconnectedUsers.picUrl =
                'http://www.facebook.com/' + user.socialId;
              if (!user.picUrl) {
                customconnectedUsers.profilepicURL =
                  'assets/images/agentimages/sample-image.svg';
              }
            } else {
              customconnectedUsers.profilepicURL =
                'assets/images/agentimages/sample-image.svg';
              customconnectedUsers.picUrl = undefined;
            }
            break;
          }
          case ChannelGroup.Instagram: {
            customconnectedUsers.name = user.name;
            customconnectedUsers.profilepicURL = user.picUrl;
            customconnectedUsers.picUrl = user.profileUrl;
            customconnectedUsers.channelImage =
              'assets/images/channel-logos/instagram.svg';
            if (!user.profileUrl) {
              customconnectedUsers.picUrl = `https://www.instagram.com/${user.screenname}`;
            }
            break;
          }
          case ChannelGroup.Youtube: {
            customconnectedUsers.name = user.name;
            customconnectedUsers.profilepicURL = user.picUrl;
            customconnectedUsers.picUrl = user.profileUrl;
            customconnectedUsers.channelImage =
              'assets/images/channelicons/Youtube.png';
            if (!user.profileUrl) {
              customconnectedUsers.picUrl = `http://www.youtube.com/channel/${user.socialId}`;
            }
            break;
          }
          case ChannelGroup.LinkedIn: {
            customconnectedUsers.name = user.name;
            customconnectedUsers.profilepicURL = user.picUrl;
            customconnectedUsers.picUrl = user.profileUrl;
            customconnectedUsers.channelImage =
              'assets/images/channel-logos/linkedin.svg';
            break;
          }
          case ChannelGroup.Voice: {
            customconnectedUsers.name = user?.name == 'All Channel' ? user?.name :user?.socialId;
            customconnectedUsers.profilepicURL = authorObj.picUrl;
            customconnectedUsers.picUrl = authorObj.profileUrl;
            customconnectedUsers.channelImage =
              '/assets/images/channelicons/Voip.svg';
            break;
          }
          case ChannelGroup.GoogleMyReview: {
            customconnectedUsers.name = user?.name ? user.name : 'Anonymous';
            customconnectedUsers.profilepicURL = user?.picUrl;
            customconnectedUsers.picUrl = user?.profileUrl;
            customconnectedUsers.channelImage = 'assets/images/channelicons/GoogleMyReview.svg';
            break;
          }
          case ChannelGroup.Email: {
            customconnectedUsers.name = user?.name ? user.name : 'Anonymous';
            customconnectedUsers.profilepicURL = user?.picUrl;
            customconnectedUsers.picUrl = user?.profileUrl;
            customconnectedUsers.channelImage = 'assets/images/channel-logos/email.svg';
            break;
          }
          default:
            customconnectedUsers.name = user.name;
            customconnectedUsers.profilepicURL = user.picUrl;
            customconnectedUsers.picUrl = user.profileUrl;
            customconnectedUsers.channelImage = `assets/images/channelicons/${
              ChannelGroup[user.channelGroup]
            }.png`;
            break;
        }
        if (customconnectedUsers.name != 'All Channel'){
          customconnectedUsers.showRemoveIcon = true;
          customconnectedUsers.channelGroup = user.channelGroup;
          customconnectedUsers.socialId = user.socialId;
          this.customAuthorDetails.connectedUsers.push(customconnectedUsers);
        }
      }
    }

    // insert traits
    this.customAuthorDetails.traits = [];
    for (const trait of authorObj.userTags) {
      this.customAuthorDetails.traits.push({ id: trait.id, name: trait.name });
    }
    // this.traitName = this.customAuthorDetails.traits;

    // Build an ticket summary
    // let currentUser: AuthUser;
    // this.accountService.currentUser$.pipe(take(1)).subscribe(user => currentUser = user);

    // for ticket ID
    this.customAuthorDetails.ticketIdDisable = false;
    if (
      +this.ticketSumamry.status === TicketStatus.Close ||
      (+this.currentUser.data.user.role === UserRoleEnum.CustomerCare &&
        (+this.ticketSumamry.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
          +this.ticketSumamry.status ===
            TicketStatus.OnHoldBrandWithNewMention)) ||
      (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount &&
        (+this.ticketSumamry.status ===
          TicketStatus.PendingwithCSDWithNewMention ||
          +this.ticketSumamry.status === TicketStatus.OnHoldCSDWithNewMention ||
          +this.ticketSumamry.status ===
            TicketStatus.RejectedByBrandWithNewMention))
    ) {
      this.customAuthorDetails.ticketIdDisable = true;
    } else if (
      (+this.currentUser.data.user.role === UserRoleEnum.CustomerCare &&
        (+this.ticketSumamry.status ===
          TicketStatus.PendingwithCSDWithNewMention ||
          +this.ticketSumamry.status === TicketStatus.OnHoldCSDWithNewMention ||
          +this.ticketSumamry.status ===
            TicketStatus.RejectedByBrandWithNewMention)) ||
      (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount &&
        (+this.ticketSumamry.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
          +this.ticketSumamry.status ===
            TicketStatus.OnHoldBrandWithNewMention))
    ) {
      this.customAuthorDetails.ticketIdDisable = false;
    } else if (
      +this.currentUser.data.user.role === UserRoleEnum.ReadOnlySupervisorAgent
    ) {
      this.customAuthorDetails.ticketIdDisable = true;
    }

    // console.log('conected users', authorObj.connectedUsers);

    this.subs.add(
      this._postDetailService.setMarkInfluencer.subscribe((postObj) => {
        if (postObj) {
          if (
            postObj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID
          ) {
            if (postObj.author.markedInfluencerCategoryID) {
              this.customAuthorDetails.influencer =
                postObj.author.markedInfluencerCategoryName;
            } else {
              this.customAuthorDetails.influencer = null;
            }
            this.cdk.detectChanges();
          }
        }
      })
    );

    if (this.customAuthorDetails && Object.keys(this.customAuthorDetails).length>0) {
      this.setLoader.emit(false);
    }
    this.cdk.detectChanges();
  }

  // getSentimentUpliftAndNPSScore(): void {
  //   const filterObj = this.filterService.getGenericRequestFilter(this._postDetailService.postObj);
  //   this._userDetailService
  //     .GetSentimentUpliftAndNPSScore(filterObj)
  //     .subscribe((data) => {
  //       this.upliftAndSentimentScore.upliftSentimentScore = data.upliftSentimentScore;
  //       this.upliftAndSentimentScore.upliftLastupdatedDatetime = data.upliftLastupdatedDatetime;
  //       this.upliftAndSentimentScore.npsLastRecordDate = data.npsLastRecordDate;
  //       this.upliftAndSentimentScore.npsScore = data.npsScore;

  //       console.log('Uplift&NPS Score', data);
  //     });
  // }

  mapCRMColumns(author: BaseSocialAuthor): void {
    for (const column of author.crmColumns.existingColumns) {
      const crmObj: CustomCrmColumns = {};
      if (!column.isDisabled && !column.isDeleted) {
        switch (column.dbColumn) {
          case 'Name':
            crmObj.id = 'PersonalDetailsName';
            crmObj.value = author.locoBuzzCRMDetails.name;
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'EmailID':
            crmObj.id = 'PersonalDetailsEmail';
            crmObj.value = author.locoBuzzCRMDetails.emailID
              ? author.locoBuzzCRMDetails.emailID
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'AlternativeEmailID':
            crmObj.id = 'PersonalDetailsAlternateEmail';
            crmObj.value = author.locoBuzzCRMDetails.alternativeEmailID
              ? author.locoBuzzCRMDetails.alternativeEmailID
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'PhoneNumber':
            const phoneNumber = author.locoBuzzCRMDetails.phoneNumber ? author.locoBuzzCRMDetails.phoneNumber : this._postDetailService?.postObj?.author?.channelGroup == ChannelGroup.WhatsApp ? this._postDetailService?.postObj?.author?.socialId : '';

            crmObj.id = 'PersonalDetailsNumber';
            crmObj.value = phoneNumber;
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'AlternatePhoneNumber':
            crmObj.id = 'PersonalDetailsAlternateNumber';
            crmObj.value = author.locoBuzzCRMDetails.alternatePhoneNumber
              ? author.locoBuzzCRMDetails.alternatePhoneNumber
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Link':
            crmObj.id = 'PersonalDetailsLink';
            crmObj.value = author.locoBuzzCRMDetails.link
              ? author.locoBuzzCRMDetails.link
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Address1':
            crmObj.id = 'PersonalDetailsAddress1';
            crmObj.value = author.locoBuzzCRMDetails.address1
              ? author.locoBuzzCRMDetails.address1
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Address2':
            crmObj.id = 'PersonalDetailsAddress2';
            crmObj.value = author.locoBuzzCRMDetails.address2
              ? author.locoBuzzCRMDetails.address2
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'City':
            crmObj.id = 'PersonalDetailsCity';
            crmObj.value = author.locoBuzzCRMDetails.city
              ? author.locoBuzzCRMDetails.city
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'State':
            crmObj.id = 'PersonalDetailsState';
            crmObj.value = author.locoBuzzCRMDetails.state
              ? author.locoBuzzCRMDetails.state
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Country':
            crmObj.id = 'PersonalDetailsCountry';
            crmObj.value = author.locoBuzzCRMDetails.country
              ? author.locoBuzzCRMDetails.country
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'ZIPCode':
            crmObj.id = 'PersonalDetailsZipcode';
            crmObj.value = author.locoBuzzCRMDetails.zipCode
              ? author.locoBuzzCRMDetails.zipCode
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'SSN':
            crmObj.id = 'PersonalDetailsSSN';
            crmObj.value = author.locoBuzzCRMDetails.ssn
              ? author.locoBuzzCRMDetails.ssn
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Notes':
            crmObj.id = 'PersonalDetailsNotes';
            crmObj.value = author.locoBuzzCRMDetails.notes
              ? author.locoBuzzCRMDetails.notes
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
        }
        this.customCrmColumns.push(crmObj);
        if (crmObj.value) {
          this.CrmDetails.push({ id: crmObj.dbColumn, value: crmObj.value });
        }
      }
    }
  }

  openEnrichView(): void {
    this.dialog.open(EnrichViewComponent, {
      disableClose: true,
      autoFocus: false,
      panelClass: ['full-screen-modal', 'overflow-hidden'],
    });
  }

  private getAuthorDetails(): void {
    this.profileLoading = true;
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this.refGetAuthorDetails = this._userDetailService.GetAuthorDetails(filterObj).subscribe(
      (data) => {
        // console.log('User Details', data);
        this.author = {};
        this.author = data;
        this.mapCRMColumns(data);
        this.getTicketSummary();
        this.loaderOutputEmitFlag.emit(false);
        if (!data) {
          this.profileLoading = false;
        }
      },
      (err) => {
        this.profileLoading = false;
        this.loaderOutputEmitFlag.emit(false);
      }
    );
  }

  getAuthorConnectedUserDetails(): void {
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this.refGetAuthorDetails2 = this._userDetailService.GetAuthorDetails(filterObj).subscribe(
      (data) => {
        let baseSocialAuthor: BaseSocialAuthor[] = data.connectedUsers;
        this._postDetailService.updateChannelList.next(baseSocialAuthor);
        this.getAuthorConnectedUserDetailsRes(data);
        this.createConnectedUser(this.author);
        // console.log('User Details', data);
      },
      (err) => {}
    );
  }

  getAuthorConnectedUserDetailsRes(authorObj): void {
    this.customAuthorDetails.connectedUsers = [];
    for (const user of authorObj.connectedUsers) {
      const customconnectedUsers: CustomConnectedUsers = {};
      switch (user.channelGroup) {
        case ChannelGroup.Twitter: {
          customconnectedUsers.name = user.name;
          customconnectedUsers.screenName = user.screenname;
          customconnectedUsers.profilepicURL = user.picUrl;
          customconnectedUsers.followers = user.followersCount;
          customconnectedUsers.following = user.followingCount;
          customconnectedUsers.tweets = user.tweetCount;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/twitter.svg';
          customconnectedUsers.picUrl =
            'https://www.twitter.com/' + authorObj.screenname;
          break;
        }
        case ChannelGroup.Facebook: {
          customconnectedUsers.name = user.name;
          customconnectedUsers.profilepicURL = user.picUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/facebook.svg';
          if (user.socialId && user.socialId !== '0') {
            customconnectedUsers.picUrl =
              'http://www.facebook.com/' + user.socialId;
            if (!user.picUrl) {
              customconnectedUsers.profilepicURL =
                'assets/images/agentimages/sample-image.svg';
            }
          } else {
            customconnectedUsers.profilepicURL =
              'assets/images/agentimages/sample-image.svg';
            customconnectedUsers.picUrl = undefined;
          }
          break;
        }
        case ChannelGroup.Instagram: {
          customconnectedUsers.name = user.name;
          customconnectedUsers.profilepicURL = user.picUrl;
          customconnectedUsers.picUrl = user.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/instagram.svg';
          if (!user.profileUrl) {
            customconnectedUsers.picUrl = `https://www.instagram.com/${user.screenname}`;
          }
          break;
        }
        case ChannelGroup.Youtube: {
          customconnectedUsers.name = user.name;
          customconnectedUsers.profilepicURL = user.picUrl;
          customconnectedUsers.picUrl = user.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channelicons/Youtube.png';
          if (!user.profileUrl) {
            customconnectedUsers.picUrl = `http://www.youtube.com/channel/${user.socialId}`;
          }
          break;
        }
        case ChannelGroup.LinkedIn: {
          customconnectedUsers.name = user.name;
          customconnectedUsers.profilepicURL = user.picUrl;
          customconnectedUsers.picUrl = user.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/linkedin.svg';
          break;
        }
        case ChannelGroup.GoogleMyReview: {
          customconnectedUsers.name = user?.name ? user.name : 'Anonymous';
          customconnectedUsers.profilepicURL = user?.picUrl;
          customconnectedUsers.picUrl = user?.profileUrl;
          customconnectedUsers.channelImage = 'assets/images/channelicons/GoogleMyReview.svg';
          break;
        }
        case ChannelGroup.Email: {
          customconnectedUsers.name = user?.name ? user.name : 'Anonymous';
          customconnectedUsers.profilepicURL = user?.picUrl;
          customconnectedUsers.picUrl = user?.profileUrl;
          customconnectedUsers.channelImage = 'assets/images/channel-logos/email.svg';
          break;
        }
        default:
          customconnectedUsers.name = user.name;
          customconnectedUsers.profilepicURL = user.picUrl;
          customconnectedUsers.picUrl = user.profileUrl;
          customconnectedUsers.channelImage = `assets/images/channelicons/${
            ChannelGroup[user.channelGroup]
          }.png`;
          break;
      }
      customconnectedUsers.showRemoveIcon = true;
      customconnectedUsers.channelGroup = user.channelGroup;
      customconnectedUsers.socialId = user.socialId;
      this.customAuthorDetails.connectedUsers.push(customconnectedUsers);
      this.cdk.detectChanges();
    }

    if (authorObj.connectedUsers.length === 0) {
      const customconnectedUsers: CustomConnectedUsers = {};
      switch (authorObj.channelGroup) {
        case ChannelGroup.Twitter: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.screenName = authorObj.screenname;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.followers = authorObj.followersCount;
          customconnectedUsers.following = authorObj.followingCount;
          customconnectedUsers.tweets = authorObj.tweetCount;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/twitter.svg';
          customconnectedUsers.picUrl =
            'https://www.twitter.com/' + authorObj.screenname;
          break;
        }
        case ChannelGroup.Facebook: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/facebook.svg';
          if (authorObj.socialId && authorObj.socialId !== '0') {
            customconnectedUsers.picUrl =
              'http://www.facebook.com/' + authorObj.socialId;
            if (!authorObj.picUrl) {
              customconnectedUsers.profilepicURL =
                'assets/images/agentimages/sample-image.svg';
            }
          } else {
            customconnectedUsers.profilepicURL =
              'assets/images/agentimages/sample-image.svg';
            customconnectedUsers.picUrl = undefined;
          }
          break;
        }
        case ChannelGroup.Instagram: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/instagram.svg';
          if (!authorObj.profileUrl) {
            customconnectedUsers.picUrl = `https://www.instagram.com/${authorObj.screenname}`;
          }
          break;
        }
        case ChannelGroup.Youtube: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channelicons/Youtube.png';
          if (!authorObj.profileUrl) {
            customconnectedUsers.picUrl = `http://www.youtube.com/channel/${authorObj.socialId}`;
          }
          break;
        }
        case ChannelGroup.LinkedIn: {
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            'assets/images/channel-logos/linkedin.svg';
          break;
        }
        case ChannelGroup.GoogleMyReview: {
          customconnectedUsers.name = authorObj?.name ? authorObj.name : 'Anonymous';
          customconnectedUsers.profilepicURL = authorObj?.picUrl;
          customconnectedUsers.picUrl = authorObj?.profileUrl;
          customconnectedUsers.channelImage = 'assets/images/channelicons/GoogleMyReview.svg';
          break;
        }
        case ChannelGroup.Email: {
          customconnectedUsers.name = authorObj?.name ? authorObj.name : 'Anonymous';
          customconnectedUsers.profilepicURL = authorObj?.picUrl;
          customconnectedUsers.picUrl = authorObj?.profileUrl;
          customconnectedUsers.channelImage = 'assets/images/channel-logos/email.svg';
          break;
        }
        default:
          customconnectedUsers.name = authorObj.name;
          customconnectedUsers.profilepicURL = authorObj.picUrl;
          customconnectedUsers.picUrl = authorObj.profileUrl;
          customconnectedUsers.channelImage =
            ChannelImage[ChannelGroup[authorObj.channelGroup]];
          break;
      }
      customconnectedUsers.showRemoveIcon = false;
      customconnectedUsers.socialId = authorObj.socialId
      this.customAuthorDetails.connectedUsers.push(customconnectedUsers);
      this.cdk.detectChanges();
    }
  }

  private getTicketSummary(): void {
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this.refGetTicketSummary = this._userDetailService.GetTicketSummary(filterObj).subscribe((data) => {
      // console.log('Ticket Summary', data);
      this.ticketSumamry = {};
      this.ticketSumamry = data;
      this.getSentimentUpliftAndNPSScore();
      if (!data) {
        this.profileLoading = false;
      }
    });
  }

  private getSentimentUpliftAndNPSScore(): void {
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this.refGetSentimentUpliftAndNPSScore = this._userDetailService.GetSentimentUpliftAndNPSScore(filterObj).subscribe(
      (data) => {
        this.showNps=true;
        if(this.postObj.channelGroup!=this.channelGroupEnum.GlassDoor)
        {
          this.upliftAndSentimentScore = {};
          this.upliftAndSentimentScore = data;
        }
        this.createUserObject(this.author);
        this.profileLoading = false;
        this.refereshData = false;
        // console.log('Uplift&NPS Score', data);
      },
      (err) => {
        this.refereshData = true;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something went wrong'),
          },
        });
      }
    );
  }

  openAssociateDialog(): void {
    const dialogRef = this.dialog.open(AddAssociateChannelsComponent, {
      autoFocus: false,
      width: '550px',
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.getAuthorConnectedUserDetails();
      }
    });
  }
  private GetBrandAccountInformation(flag): void {
    const obj = {
      Brand: this.postObj.brandInfo,
      ChannelGroup: this.postObj.channelGroup,
    };
    this.handleNames = [];
    // call api to get socialaccountlist
    this.cdk.detectChanges();
    this.refGetBrandAccountInformation = this.replyService.GetBrandAccountInformation(obj).subscribe((data) => {
      // console.log(data);
      // this.zone.run(() => {
      if (data) {
        this.objBrandSocialAcount = data.filter((x) => {
          return x.channelGroup === obj.ChannelGroup;
        });
        if (this.objBrandSocialAcount) {
          this.objBrandSocialAcount.forEach((item) => {
            this.handleNames.push({
              handleId: item.socialID,
              handleName: item.userName,
              accountId: item.accountID,
              socialId: item.socialID,
              isactive: false,
              profilepic: item.profileImageURL
                ? item.profileImageURL
                : 'assets/images/channel-logos/twitter.svg',
            });
          });
        }
        this.cdk.detectChanges();
        if (flag == 'follow') {
          this.getFollowUnfollowList();
        } else if (flag == 'mute') {
          this.getMuteUnmuteList();
        } else if (flag == 'block') {
          this.getBlockUnblockList();
        }
      }
    });
  }

  setSocialHandle(
    socialObj: SocialHandle,
    actionType: number,
    title: string
  ): void {
    socialObj.isactive = true;
    if (actionType == 1) {
      this.followBlockMuteandleList.forEach((obj) => {
        if (obj.socialId == socialObj.socialId) {
          obj.isactive = true;
          this.selectedHandle = obj;
          this.authorActionFlag = true;
        } else {
          obj.isactive = false;
        }
      });
      this.unFollowUnBlockUnMuteHandleList.forEach(
        (obj) => (obj.isactive = false)
      );
      if (title.includes('Follow')) {
        this.submitButtonName = 'Unfollow';
      } else if (title.includes('Mute')) {
        this.submitButtonName = 'Unmute';
      } else {
        this.submitButtonName = 'Unblock';
      }
    } else {
      this.unFollowUnBlockUnMuteHandleList.forEach((obj) => {
        if (obj.socialId == socialObj.socialId) {
          obj.isactive = true;
          this.selectedHandle = obj;
          this.authorActionFlag = false;
        } else {
          obj.isactive = false;
        }
      });
      this.followBlockMuteandleList.forEach((obj) => (obj.isactive = false));
      if (title.includes('Follow')) {
        this.submitButtonName = 'Follow';
      } else if (title.includes('Mute')) {
        this.submitButtonName = 'Mute';
      } else {
        this.submitButtonName = 'Block';
      }
    }
    console.log(this.selectedHandle);
  }
  setAuthorFlag(type, authorflag): void {
    this.authorAction = type;
    this.authorActionFlag = authorflag;
    // this.selectedHandle = null;
  }

  submitActionOnTwitter(): void {
    let dialogData;
    if (this.submitButtonName) {
      dialogData = new AlertDialogModel(
        this.submitButtonName,
        `Are you sure you want to ${this.submitButtonName} this user?`,
        this.submitButtonName,
        'Cancel'
      );
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          if (this.authorAction) {
            switch (this.authorAction) {
              case AuthorActions.FollowUnFollow:
                this.followUnfollowAuthor(this.selectedHandle);
                break;
              case AuthorActions.MuteUnMute:
                this.muteUnmuteAuthor(this.selectedHandle);
                break;
              case AuthorActions.BlockUnBlock:
                this.blockUnblockAuthor(this.selectedHandle);
                break;
              case AuthorActions.HideUnHide:
                break;
              default:
                break;
            }
          }
        }
      });
    }
  }

  submitActionHandle(): void {
    var dialogData;
    if (this.authorAction) {
      switch (this.authorAction) {
        case AuthorActions.FollowUnFollow:
          dialogData = new AlertDialogModel(
            !this.authorActionFlag ? 'Follow' : 'Unfollow',
            `Are you sure you want to ${
              !this.authorActionFlag ? 'follow' : 'unfollow'
            } this user?`,
            !this.authorActionFlag ? 'Follow' : 'Unfollow',
            'Cancel'
          );
          break;
        case AuthorActions.MuteUnMute:
          dialogData = new AlertDialogModel(
            !this.authorActionFlag ? 'Mute' : 'Unmute',
            `Are you sure you want to ${
              !this.authorActionFlag ? 'mute' : 'unmute'
            } this user?`,
            !this.authorActionFlag ? 'Mute' : 'Unmute',
            'Cancel'
          );
          break;
        case AuthorActions.BlockUnBlock:
          dialogData = new AlertDialogModel(
            !this.authorActionFlag ? 'Block' : 'Unblock',
            `Are you sure you want to ${
              !this.authorActionFlag ? 'block' : 'unblock'
            } this user?`,
            !this.authorActionFlag ? 'Block' : 'Unblock',
            'Cancel'
          );
          break;
        case AuthorActions.HideUnHide:
          dialogData = new AlertDialogModel(
            !this.authorActionFlag ? 'Hide' : 'Unhide',
            `Are you sure you want to ${
              !this.authorActionFlag ? 'hide' : 'unhide'
            } this user?`,
            !this.authorActionFlag ? 'Hide' : 'Unhide',
            'Cancel'
          );
          break;
        default:
          break;
      }
    }

    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        if (this.authorAction) {
          switch (this.authorAction) {
            case AuthorActions.FollowUnFollow:
              this.followUnfollowAuthor(this.selectedHandle);
              break;
            case AuthorActions.MuteUnMute:
              this.muteUnmuteAuthor(this.selectedHandle);
              break;
            case AuthorActions.BlockUnBlock:
              this.blockUnblockAuthor(this.selectedHandle);
              break;
            case AuthorActions.HideUnHide:
              break;
            default:
              break;
          }
        }
      }
    });
  }

  private followUnfollowAuthor(socialObj: SocialHandle): void {
    const keyObj = this.constructAuthorObj();
    keyObj.Account.AccountID = socialObj.accountId;
    keyObj.Account.SocialID = socialObj.socialId;
    keyObj.IsFollow = !this.authorActionFlag;

    this.refFollowUnfollowAuthor =this._userDetailService.followUnfollowAuthor(keyObj).subscribe((data) => {
      if (data.success) {
        this.author.isBrandFollowing = !this.authorActionFlag;
        this.followUnfollowMenuTrigger?.closeMenu();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Action-Completed-Successfully'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: !this.authorActionFlag
              ? this.translate.instant('Unable-to-follow-user')
              : this.translate.instant('Unable-to-unfollow-user'),
          },
        });
      }
    });
  }

  private muteUnmuteAuthor(socialObj: SocialHandle): void {
    const keyObj = this.constructAuthorObj();
    keyObj.Account.AccountID = socialObj.accountId;
    keyObj.Account.SocialID = socialObj.socialId;
    keyObj.IsMute = !this.authorActionFlag;

    this.refMuteUnmuteAuthor = this._userDetailService.muteUnmuteAuthor(keyObj).subscribe((data) => {
      if (data.success) {
        this.author.isMuted = !this.authorActionFlag;
        this.followUnfollowMenuTrigger?.closeMenu();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Action-Completed-Successfully'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: !this.authorActionFlag
              ? this.translate.instant('Unable-to-mute-user')
              : this.translate.instant('Unable-to-unmute-user'),
          },
        });
      }
    });
  }

  blockUnblockUserWithPopup(socialObj: SocialHandle): void {
    const dialogData = new AlertDialogModel(
      !this.authorActionFlag ? this.translate.instant('Block') : this.translate.instant('Unblock'),
      !this.authorActionFlag
      ? this.translate.instant('Are-you-sure-block-user')
      : this.translate.instant('Are-you-sure-unblock-user'),
      !this.authorActionFlag ? this.translate.instant('Block') : this.translate.instant('Unblock'),
      this.translate.instant('Cancel')
    );
    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.blockUnblockAuthor(socialObj);
      }
    });
  }

  private blockUnblockAuthor(socialObj: SocialHandle): void {
    const keyObj = this.constructAuthorObj();
    keyObj.Account.AccountID = socialObj.accountId;
    keyObj.Account.SocialID = socialObj.socialId;
    keyObj.IsBlock = !this.authorActionFlag;

    this.refBlockUnblockAuthor = this._userDetailService.blockUnblockAuthor(keyObj).subscribe((data) => {
      if (data.success) {
        this.author.isBlocked = !this.authorActionFlag;
        this.followUnfollowMenuTrigger?.closeMenu();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Action-Completed-Successfully'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: !this.authorActionFlag
              ? this.translate.instant('Unable-to-block-user')
              : this.translate.instant('Unable-to-unblock-user'),
          },
        });
      }
    });
  }

  getFollowUnfollowList(): void {
    this.submitButtonName = '';
    this.followBlockMuteandleList = [];
    this.unFollowUnBlockUnMuteHandleList = [];
    const obj = {
      $type:
        'LocobuzzNG.Entities.Classes.AccountConfigurations.TwitterAccountConfiguration, LocobuzzNG.Entities',
      ChannelGroup: this.postObj.channelGroup,
      SocialID: this.postObj.author.socialId,
      BrandInformation: {
        BrandID: this.postObj.brandInfo.brandID,
        BrandName: this.postObj.brandInfo.brandFriendlyName,
      },
    };
    this.refGetStatusofFollowUnfollow = this._userDetailService.GetStatusofFollowUnfollow(obj).subscribe((data) => {
      if (data) {
        this.handleNames.forEach((socialObj) => {
          if (
            data.some(
              (obj) =>
                obj.authorSocialID == socialObj.socialId &&
                obj.follow_Status == 1
            )
          ) {
            this.followBlockMuteandleList.push(socialObj);
          } else {
            this.unFollowUnBlockUnMuteHandleList.push(socialObj);
          }
          socialObj.isactive = false;
        });
      } else {
        this.unFollowUnBlockUnMuteHandleList = this.handleNames;
      }
      this.cdk.detectChanges();
    });
  }

  getBlockUnblockList(): void {
    this.submitButtonName = '';
    this.followBlockMuteandleList = [];
    this.unFollowUnBlockUnMuteHandleList = [];
    const obj = {
      $type:
        'LocobuzzNG.Entities.Classes.AccountConfigurations.TwitterAccountConfiguration, LocobuzzNG.Entities',
      ChannelGroup: this.postObj.channelGroup,
      SocialID: this.postObj.author.socialId,
      BrandInformation: {
        BrandID: this.postObj.brandInfo.brandID,
        BrandName: this.postObj.brandInfo.brandFriendlyName,
      },
    };
    this.refGetStatusofBlockUnblockUser = this._userDetailService
      .GetStatusofBlockUnblockUser(obj)
      .subscribe((data) => {
        if (data) {
          this.handleNames.forEach((socialObj) => {
            if (
              data.some(
                (obj) =>
                  obj.authorSocialID == socialObj.socialId &&
                  obj.block_Status == 3
              )
            ) {
              this.followBlockMuteandleList.push(socialObj);
            } else {
              this.unFollowUnBlockUnMuteHandleList.push(socialObj);
            }
            socialObj.isactive = false;
          });
        }
        this.cdk.detectChanges();
      });
  }

  getMuteUnmuteList(): void {
    this.submitButtonName = '';
    this.followBlockMuteandleList = [];
    this.unFollowUnBlockUnMuteHandleList = [];
    const obj = {
      $type:
        'LocobuzzNG.Entities.Classes.AccountConfigurations.TwitterAccountConfiguration, LocobuzzNG.Entities',
      ChannelGroup: this.postObj.channelGroup,
      SocialID: this.postObj.author.socialId,
      BrandInformation: {
        BrandID: this.postObj.brandInfo.brandID,
        BrandName: this.postObj.brandInfo.brandFriendlyName,
      },
    };
    this.refGetStatusofMuteUnmute = this._userDetailService.GetStatusofMuteUnmute(obj).subscribe((data) => {
      if (data) {
        this.handleNames.forEach((socialObj) => {
          if (
            data.some(
              (obj) =>
                obj.authorSocialID == socialObj.socialId && obj.mute_Status == 1
            )
          ) {
            this.followBlockMuteandleList.push(socialObj);
          } else {
            this.unFollowUnBlockUnMuteHandleList.push(socialObj);
          }
          socialObj.isactive = false;
        });
      }
      this.cdk.detectChanges();
    });
  }

  private constructAuthorObj(): any {
    this.postObj = this._mapLocobuzzEntity.mapMention(this.postObj);
    const { $type, socialId, name, screenname, channelGroup } =
      this.postObj.author;
    const author = {
      $type,
      SocialId: socialId,
      name,
      screenname,
      ChannelGroup: channelGroup,
    };

    const BrandInfoObj = {
      BrandID: this.postObj.brandInfo.brandID,
      BrandName: this.postObj.brandInfo.brandName,
    };

    const accountObj = this._mapLocobuzzEntity.mapAccountConfiguration(
      this.postObj
    );

    accountObj.BrandInformation = BrandInfoObj;

    const authorObj = {
      Author: author,
      BrandInfo: this.postObj.brandInfo,
      Account: accountObj,
    };

    return authorObj;
  }

  markInfluencer(): void {
    this._postDetailService.postObj = this.postObj;
    this.dialog.open(PostMarkinfluencerComponent, {
      autoFocus: false,
      width: '650px',
    });
  }

  likeUnlikeActive(): void {
    this.likeUnlike = !this.likeUnlike;
  }

  addTrait(event: MatChipInputEvent): void {
    const value = event.value;
    const index = this.customAuthorDetails?.traits?.findIndex(trait => trait.name == value)
    if(index > -1){
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message:
            this.translate.instant('Trait-already-used'),
        },
      });
      event.input.value = '';
      return;
    }
    if (value) {
      const tagsArray = [];
      const tags = {
        ID: 0,
        Name: value,
      };
      tagsArray.push(tags);
      const obj = {
        brand: this.postObj.brandInfo,
        userTag: tagsArray,
        AuthorIdentity: this.postObj.author.id, // 121940
      };

      this._userDetailService.saveTraits(obj).subscribe((data) => {
        if (data.success) {
          this.customAuthorDetails.traits.push({
            id: data.data[0].id,
            name: value,
          });
          this.cdk.detectChanges();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Trait-Added-Successfully'),
            },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Some-Error-Occurred'),
            },
          });
          this.cdk.detectChanges();
        }
        // this.zone.run(() => {
        this.cdk.detectChanges()
      });
    }
    event.input.value = '';
  }

  removeTrait(tag): void {
    const tags = {
      ID: tag.id,
      Name: tag.name,
    };

    const obj = {
      brand: this.postObj.brandInfo,
      userTag: tags,
    };

    this.refDeleteTraits = this._userDetailService.deleteTraits(obj).subscribe((data) => {
      if (data.success) {
        const index = this.customAuthorDetails.traits.indexOf(tag);
        if (index >= 0) {
          this.customAuthorDetails.traits.splice(index, 1);
        }
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Trait-Removed-Successfully'),
          },
        })
        this.cdk.detectChanges();

      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Some-Error-Occurred'),
          },
        });
      }
      // this.zone.run(() => {
      this.cdk.detectChanges()
    });
  }

  copied(name): void {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Success,
        message: `${this.translate.instant(name)} ${this.translate.instant('copied-success')}`,
      },
    });
  }

  openUnlinkProfile(connectedUserObj: CustomConnectedUsers): void {
    const dialogRef = this.dialog.open(UnlinkProfileComponent);
    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.unlinkMapSocialUsers(connectedUserObj);
      }
    })
  }

  unlinkMapSocialUsers(connectedUserObj: CustomConnectedUsers): void {
    const source = this._mapLocobuzzEntity.mapMention(
      this._postDetailService.postObj
    );
    const obj = {
      BrandInfo: source.brandInfo,
      Author: source.author,
      MapAuthorSocialID: connectedUserObj.socialId,
      Mapchannelgroupid: connectedUserObj.channelGroup,
    };
    this.refUnlinkMapSocialUsers = this._userDetailService.unlinkMapSocialUsers(obj).subscribe((res) => {
      if (res.success) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Profile-unlinked-successfully'),
          },
        });
        this.getAuthorConnectedUserDetails();
      } else {
        const msg = res.message ? res.message : this.translate.instant('Unable-to-unlink-profile')
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: msg,
          },
        });
      }
    }, err => {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something went wrong'),
        },
      });
    })
  }

  createConnectedUser(authorObj) {
    // this.customAuthorDetails.connectedUsers=[];
    const customconnectedUsers: CustomConnectedUsers = {};
    switch (authorObj.channelGroup) {
      case ChannelGroup.Twitter: {
        customconnectedUsers.name = authorObj.name;
        customconnectedUsers.screenName = authorObj.screenname;
        customconnectedUsers.profilepicURL = authorObj.picUrl;
        customconnectedUsers.followers = authorObj.followersCount;
        customconnectedUsers.following = authorObj.followingCount;
        customconnectedUsers.tweets = authorObj.tweetCount;
        customconnectedUsers.channelImage =
          'assets/images/channel-logos/twitter.svg';
        customconnectedUsers.picUrl =
          'https://www.twitter.com/' + authorObj.screenname;
        break;
      }
      case ChannelGroup.Facebook: {
        customconnectedUsers.name = authorObj.name;
        customconnectedUsers.profilepicURL = authorObj.picUrl;
        customconnectedUsers.channelImage =
          'assets/images/channel-logos/facebook.svg';
        if (authorObj.socialId && authorObj.socialId !== '0') {
          customconnectedUsers.picUrl =
            'http://www.facebook.com/' + authorObj.socialId;
          if (!authorObj.picUrl) {
            customconnectedUsers.profilepicURL =
              'assets/images/agentimages/sample-image.svg';
          }
        } else {
          customconnectedUsers.profilepicURL =
            'assets/images/agentimages/sample-image.svg';
          customconnectedUsers.picUrl = undefined;
        }
        break;
      }
      case ChannelGroup.Instagram: {
        customconnectedUsers.name = authorObj.name;
        customconnectedUsers.profilepicURL = authorObj.picUrl;
        customconnectedUsers.picUrl = authorObj.profileUrl;
        customconnectedUsers.channelImage =
          'assets/images/channel-logos/instagram.svg';
        if (!authorObj.profileUrl) {
          customconnectedUsers.picUrl = `https://www.instagram.com/${authorObj.screenname}`;
        }
        break;
      }
      case ChannelGroup.Youtube: {
        customconnectedUsers.name = authorObj.name;
        customconnectedUsers.profilepicURL = authorObj.picUrl;
        customconnectedUsers.picUrl = authorObj.profileUrl;
        customconnectedUsers.channelImage =
          'assets/images/channelicons/Youtube.png';
        if (!authorObj.profileUrl) {
          customconnectedUsers.picUrl = `http://www.youtube.com/channel/${authorObj.socialId}`;
        }
        break;
      }
      case ChannelGroup.LinkedIn: {
        customconnectedUsers.name = authorObj.name;
        customconnectedUsers.profilepicURL = authorObj.picUrl;
        customconnectedUsers.picUrl = authorObj.profileUrl;
        customconnectedUsers.channelImage =
          'assets/images/channel-logos/linkedin.svg';
        break;
      }
      case ChannelGroup.GoogleMyReview: {
        customconnectedUsers.name = authorObj.name
          ? authorObj.name
          : 'Anonymous';
        customconnectedUsers.profilepicURL = authorObj.picUrl;
        customconnectedUsers.picUrl = authorObj.profileUrl;
        customconnectedUsers.channelImage = ChannelImage.GoogleMyReview;
        break;
      }
      case ChannelGroup.Email: {
        customconnectedUsers.name = authorObj.name
          ? authorObj.name
          : 'Anonymous';
        customconnectedUsers.profilepicURL = authorObj.picUrl;
        customconnectedUsers.picUrl = authorObj.profileUrl;
        customconnectedUsers.channelImage = ChannelImage.Email;
        break;
      }
      default:
        customconnectedUsers.name = authorObj.name;
        customconnectedUsers.profilepicURL = authorObj.picUrl;
        customconnectedUsers.picUrl = authorObj.profileUrl;
        customconnectedUsers.channelImage =
          ChannelImage[ChannelGroup[authorObj.channelGroup]];
        break;
    }
    customconnectedUsers.showRemoveIcon = false;
    (this.customAuthorDetails.connectedUsers.some((obj) => obj.name != authorObj.name)) ? this.customAuthorDetails.connectedUsers.unshift(customconnectedUsers) : '';
    this.cdk.detectChanges();
  }
  clearAllVeriable(): void {
    // Unsubscribe from all subscriptions
    this.subs.unsubscribe();

    if (this.refGetAuthorDetails) {
      this.refGetAuthorDetails.unsubscribe();
      this.refGetAuthorDetails = null;
    }

    if (this.refGetAuthorDetails2) {
      this.refGetAuthorDetails2.unsubscribe();
      this.refGetAuthorDetails2 = null;
    }

    if (this.refGetTicketSummary) {
      this.refGetTicketSummary.unsubscribe();
      this.refGetTicketSummary = null;
    }

    if (this.refGetSentimentUpliftAndNPSScore) {
      this.refGetSentimentUpliftAndNPSScore.unsubscribe();
      this.refGetSentimentUpliftAndNPSScore = null;
    }

    if (this.refGetBrandAccountInformation) {
      this.refGetBrandAccountInformation.unsubscribe();
      this.refGetBrandAccountInformation = null;
    }

    if (this.refFollowUnfollowAuthor) {
      this.refFollowUnfollowAuthor.unsubscribe();
      this.refFollowUnfollowAuthor = null;
    }

    if (this.refMuteUnmuteAuthor) {
      this.refMuteUnmuteAuthor.unsubscribe();
      this.refMuteUnmuteAuthor = null;
    }

    if (this.refBlockUnblockAuthor) {
      this.refBlockUnblockAuthor.unsubscribe();
      this.refBlockUnblockAuthor = null;
    }

    if (this.refGetStatusofFollowUnfollow) {
      this.refGetStatusofFollowUnfollow.unsubscribe();
      this.refGetStatusofFollowUnfollow = null;
    }

    if (this.refGetStatusofBlockUnblockUser) {
      this.refGetStatusofBlockUnblockUser.unsubscribe();
      this.refGetStatusofBlockUnblockUser = null;
    }

    if (this.refGetStatusofMuteUnmute) {
      this.refGetStatusofMuteUnmute.unsubscribe();
      this.refGetStatusofMuteUnmute = null;
    }

    if (this.refDeleteTraits) {
      this.refDeleteTraits.unsubscribe();
      this.refDeleteTraits = null;
    }

    if (this.refUnlinkMapSocialUsers) {
      this.refUnlinkMapSocialUsers.unsubscribe();
      this.refUnlinkMapSocialUsers = null;
    }
    this.followUnfollowMenuTrigger = null;
  }

  makeCall():void{
    if(this.voipAgent)
    {

        const brandInfo = this.filterService?.fetchedBrandData?.find((x)=> x.brandID == this.postObj?.brandInfo?.brandID);
      if (brandInfo?.brandVOIPConfig?.voipProvider == VoIPEnum.Ozonetel) {
        this.ozontelService.makePhoneCall.next(this.customAuthorDetails.phoneNumber);
      }

      if (brandInfo?.brandVOIPConfig?.voipProvider == VoIPEnum.Exotel) {
       navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
              console.log('✅ Microphone access granted.');
              stream.getTracks().forEach(track => track.stop());
              this.exotelService.SendDTMF(this.customAuthorDetails.phoneNumber?.replace('+91', '0'));
              this.exotelService.dialNumber(this.customAuthorDetails.phoneNumber?.replace('+91', '0'));
              setTimeout(() => {
                this.exotelService.acceptCall()
              }, 300);
            })
            .catch(async (err) => {
              console.error('❌ Microphone access denied:', err);
      
              if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
                try {
                  const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                  if (result.state === 'denied') {
                    this.dialog.open(MicrophonePermissionComponent, {
                      width: '400px',
                    })
                  }
                } catch {
                }
              }
            });
          }
    }
  }

  showAddTrait() {
    this.addTraitEnabled = !this.addTraitEnabled;
  }

}
