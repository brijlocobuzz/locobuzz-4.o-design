import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { ProfileService } from 'app/accounts/services/profile.service';
import { post } from 'app/app-data/post';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { LogStatus } from 'app/core/enums/LogStatus';
import { notificationType } from 'app/core/enums/notificationType';
import { PostActionEnum } from 'app/core/enums/postActionEnum';
import { PostActionType } from 'app/core/enums/PostActionType';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import {
  VoiceCallEventsEnum,
  VoiceCallTypeEnum,
} from 'app/core/enums/VoiceCallEnum';
import { ActionButton, AuthUser } from 'app/core/interfaces/User';
import { ProfileDetails } from 'app/core/models/accounts/userprofile';
import { countryCodeList } from 'app/core/models/crm/CountryCodes';
import { BulkMentionChecked } from 'app/core/models/dbmodel/TicketReplyDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { Tab, TabEvent, TabSignalR } from 'app/core/models/menu/Menu';
import {
  AutoRenderSetting,
  AutoRenderTime,
} from 'app/core/models/viewmodel/AutoRenderSetting';
import {
  Filter,
  GenericFilter,
  PostSpecificInput,
  PostsType,
} from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { AccountService } from 'app/core/services/account.service';
import { CommonService } from 'app/core/services/common.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { MainService } from 'app/social-inbox/services/main.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import { stat } from 'fs';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, first, take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { AdvanceFilterService } from './../../services/advance-filter.service';
import { TabService } from 'app/core/services/tab.service';
import { FilterEvents } from 'app/core/enums/FilterEvents';
import { AllMentionGroupView } from 'app/shared/components/post-options/post-options.component';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { TranslateService } from '@ngx-translate/core';
import { MatButton } from '@angular/material/button';
import { SidebarService } from 'app/core/services/sidebar.service';
import { trigger, transition, style, animate, query, group } from '@angular/animations';
@Component({
    selector: 'app-socialbox',
    templateUrl: './socialbox.component.html',
    styleUrls: ['./socialbox.component.scss'],
    animations: [
      trigger('slideAnimation', [
        transition(':increment', [
          group([
            query(':enter', [
              style({ transform: 'translateX(100%)', opacity: 0 }),
              animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ], { optional: true }),
            query(':leave', [
              animate('300ms ease-out', style({ transform: 'translateX(-100%)', opacity: 0 }))
            ], { optional: true })
          ])
        ]),
        transition(':decrement', [
          group([
            query(':enter', [
              style({ transform: 'translateX(-100%)', opacity: 0 }),
              animate('300ms ease-out', style({ transform: 'translateX(0)', opacity: 1 }))
            ], { optional: true }),
            query(':leave', [
              animate('300ms ease-out', style({ transform: 'translateX(100%)', opacity: 0 }))
            ], { optional: true })
          ])
        ])
      ])
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SocialboxComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('socialBox') socialBoxDiv: ElementRef;
  @ViewChild('newDataFoundBtn') newDataFoundBtn: MatButton;
  @Input() postData: {}[] = post;
  @Input() postDetailTab: LocobuzzTab;
  
  TicketList: BaseMention[] = [];
  MentionList: BaseMention[] = [];
  filter: GenericFilter;
  postloader: boolean = true;
  loaderTypeEnum = loaderTypeEnum;
  ticketsFound: number;
  result: string = '';
  tickets: BaseMention[] = [];
  currentPageType: string;
  currentPostType: PostsType;
  isadvance: boolean = false;
  selectedPostList: number[] = [];
  bulkActionpanelStatus: boolean = false;
  assignmentlimitmsg: boolean = false;
  firstFilterApply: boolean = false;
  firstFilterJson: GenericFilter;
  loadedNavLinks = [];
  brandactivity = false;
  useractivity = false;
  actionchk = false;
  nonactionchk = false;
  brandpost = false;
  brandreply = false;
  pagerCount: number;
  ticketInterval: any;
  mentionInterval: any;
  showDataFound = false;
  currentAutoRenderSetting: number;
  checkAllCheckBox = false;
  audioPlay = true;
  currentUser: AuthUser;
  testingmentionObj = `[{"concreteClassName":"LocobuzzNG.Entities.Classes.Mentions.TwitterMention","inReplyToUserID":"0","isShared":false,"urlClicks":null,"tweetClick":null,"followingCount":null,"isDMSent":false,"taggedUsersJson":"[{\"Userid\":\"1150754595016040448\",\"Name\":\"BittuLoco2030\",\"UserType\":null,\"offset\":0,\"length\":13}]","newSelectedTaggedUsersJson":null,"mainTweetid":null,"canReplyPrivately":false,"mentionMetadata":{"videoView":0,"postClicks":0,"postVideoAvgTimeWatched":0,"likeCount":0,"commentCount":null,"reach":null,"impression":null,"videoViews":0,"engagementCount":0,"reachCountRate":0,"impressionsCountRate":0,"engagementCountRate":0,"isFromAPI":false,"shareCount":0},"author":{"isVerifed":false,"screenname":"gonsalve_s","followersCount":23,"followingCount":0,"kloutScore":0,"bio":null,"tweetCount":0,"isBlocked":false,"isMuted":false,"isUserFollowing":false,"isBrandFollowing":false,"isMarkedInfluencer":false,"markedInfluencerID":0,"markedInfluencerCategoryName":"Automobile","markedInfluencerCategoryID":27,"influences":null,"interests":null,"influencesString":null,"insterestsString":null,"canHaveUserTags":false,"canBeMarkedInfluencer":false,"canHaveConnectedUsers":false,"profileUrl":null,"socialId":"1054251559826141184","isAnonymous":false,"name":"Dany Gonsalve's مرحبا","channel":0,"url":null,"profileImage":null,"nps":0,"sentimentUpliftScore":0,"id":0,"picUrl":"https://images.locobuzz.com/1054251559826141184.jpg","glbMarkedInfluencerCategoryName":"Automobile","glbMarkedInfluencerCategoryID":27,"interactionCount":0,"location":null,"locationXML":null,"userSentiment":0,"channelGroup":1,"latestTicketID":"110229","userTags":[],"markedInfluencers":[],"connectedUsers":[],"locoBuzzCRMDetails":{"id":0,"name":null,"emailID":null,"alternativeEmailID":null,"phoneNumber":null,"link":null,"address1":null,"address2":null,"notes":null,"city":null,"state":null,"country":null,"zipCode":null,"alternatePhoneNumber":null,"ssn":null,"customCRMColumnXml":null,"gender":null,"age":0,"dob":null,"modifiedByUser":null,"modifiedTime":null,"modifiedDateTime":"0001-01-01T00:00:00","modifiedTimeEpoch":0,"timeoffset":0,"dobString":null,"isInserted":false},"previousLocoBuzzCRMDetails":null,"crmColumns":null,"lastActivity":null,"firstActivity":null},"description":"@BittuLoco2030 tat chk 6","canReply":true,"parentSocialID":null,"parentPostID":null,"parentID":null,"id":null,"socialID":"1376886768742506501","title":null,"isActionable":true,"channelType":7,"channelGroup":1,"mentionID":null,"url":null,"sentiment":0,"tagID":335204,"isDeleted":false,"isDeletedFromSocial":false,"mediaType":1,"mediaTypeFormat":1,"status":0,"isSendFeedback":false,"isSendAsDMLink":false,"isPrivateMessage":false,"isBrandPost":false,"updatedDateTime":null,"location":null,"mentionTime":"2021-03-30T13:19:21","contentID":186220,"isRead":true,"readBy":33536,"readAt":"2021-03-31T21:08:12.067","numberOfMentions":"13","languageName":null,"isReplied":false,"isParentPost":false,"inReplyToStatusId":0,"replyInitiated":false,"isMakerCheckerEnable":false,"attachToCaseid":null,"mentionsAttachToCaseid":null,"insertedDate":"2020-01-23T11:55:32.053","mentionCapturedDate":null,"mentionTimeEpoch":1617110361,"modifiedDateEpoch":1617179433.9,"likeStatus":false,"modifiedDate":"2021-03-31T08:30:33.9","brandInfo":{"brandID":7121,"brandName":"wrong","categoryGroupID":0,"categoryID":0,"categoryName":null,"mainBrandID":0,"compititionBrandIDs":null,"brandFriendlyName":"Wrong Brand","brandLogo":null,"isBrandworkFlowEnabled":false,"brandGroupName":null},"upperCategory":{"id":0,"name":null,"userID":null,"brandInfo":null},"categoryMap":[{"id":53927,"name":"shivam22","upperCategoryID":0,"sentiment":0,"isTicket":false,"subCategories":[]}],"retweetedStatusID":"0","ticketInfo":{"ticketID":110229,"tagID":335204,"assignedBy":null,"assignedTo":null,"assignedToTeam":null,"assignToAgentUserName":null,"readByUserName":"aditya ghosalkar","escalatedTotUserName":"ACTCSD G","escalatedToBrandUserName":"shivam test","assignedAt":"0001-01-01T00:00:00","previousAssignedTo":0,"escalatedTo":22946,"escaltedToAccountType":0,"escalatedToCSDTeam":null,"escalatedBy":null,"escalatedAt":"2020-01-24T08:55:33.123","escalatedToBrand":22911,"escalatedToBrandTeam":null,"escalatedToBrandBy":null,"escalatedToBrandAt":"2020-01-29T13:18:34.483","status":14,"updatedAt":"0001-01-01T00:00:00","createdAt":"0001-01-01T00:00:00","numberOfMentions":13,"ticketPriority":0,"lastNote":"zxdxcx","latestTagID":335204,"autoClose":false,"isAutoClosureEnabled":false,"isMakerCheckerEnable":false,"ticketPreviousStatus":null,"guid":null,"srid":null,"previousAssignedFrom":null,"previouAgentWorkflowWorkedAgent":null,"csdTeamId":null,"brandTeamId":null,"teamid":null,"previousAgentAccountType":null,"ticketAgentWorkFlowEnabled":false,"makerCheckerStatus":0,"messageSentforApproval":null,"replyScheduledDateTime":null,"requestedByUserid":null,"workFlowTagid":null,"workflowStatus":0,"ssreStatus":0,"isCustomerInfoAwaited":false,"utcDateTimeOfOperation":null,"toEmailList":null,"ccEmailList":null,"bccEmailList":null,"taskJsonList":null,"caseCreatedDate":"2020-01-23T11:55:32.053","tatflrBreachTime":"2020-01-23T11:58:32.053","lockUserID":null,"lockDatetime":null,"lockUserName":null,"isTicketLocked":false,"tattime":624157,"flrtatSeconds":null,"replyEscalatedToUsername":null,"replyUserName":null,"replyUserID":0,"replyApprovedOrRejectedBy":null,"ticketProcessStatus":null,"ticketProcessNote":null,"replyUseid":0,"escalationMessage":null,"isSubscribed":false,"ticketUpperCategory":{"id":0,"name":null,"userID":null,"brandInfo":null},"ticketCategoryMap":[{"id":53915,"name":"other random words","upperCategoryID":0,"sentiment":0,"isTicket":false,"subCategories":[{"id":42551,"name":"FLR","categoryID":0,"sentiment":0,"subSubCategories":[]}]}],"ticketCategoryMapText":"<CategoryMap>\r\n<Category><ID>53915</ID><Name>other random words</Name><Sentiment>0</Sentiment><SubCategory><ID>42551</ID><Name>FLR</Name><Sentiment>0</Sentiment></SubCategory></Category></CategoryMap>\r\n","latestResponseTime":null},"ticketInfoSsre":{"ssreOriginalIntent":0,"ssreReplyVerifiedOrRejectedBy":null,"latestMentionActionedBySSRE":0,"transferTo":2,"ssreEscalatedTo":0,"ssreEscalationMessage":null,"intentRuleType":0,"ssreStatus":0,"retrainTagid":0,"retrainBy":0,"retrainDate":"0001-01-01T00:00:00","ssreMode":0,"ssreIntent":0,"ssreReplyType":0,"intentFriendlyName":null,"intentOrRuleID":0,"latestSSREReply":null,"ssreReplyVerifiedOrRejectedTagid":132424,"ssreReply":{"authorid":null,"replyresponseid":null,"replymessage":null,"channelType":0,"escalatedTo":0,"escalationMessage":null}},"ticketInfoCrm":{"srUpdatedDateTime":null,"srid":null,"isPushRE":0,"srStatus":0,"srCreatedBy":null,"srDescription":null,"remarks":null,"jioNumber":null,"partyid":null,"isPartyID":0,"mapid":null,"isFTR":null},"attachmentMetadata":{"mediaContents":[],"mediaContentText":"<Attachments></Attachments>","mediaUrls":"","mediaAttachments":[],"attachments":"<Attachments></Attachments>"},"makerCheckerMetadata":{"workflowReplyDetailID":0,"replyMakerCheckerMessage":null,"isSendGroupMail":false,"replyStatus":null,"replyEscalatedTeamName":null,"workflowStatus":0,"isTakeOver":null},"categoryMapText":"<CategoryMap>\r\n<Category><ID>53927</ID><Name>shivam22</Name><Sentiment>0</Sentiment></Category></CategoryMap>\r\n","ticketID":110229,"isSSRE":false,"settingID":12269,"mediaContents":null}]`;
  noDataFound = false;
  nodataFoundLabel = 'Tickets not found';
  subs = new SubSink();
  postInput: PostSpecificInput = { postlength: 0 };
  AssignmentLimitData = {
    TotalAssignedTicketsList: [],
    BrandMaxAssignLimitsList: [],
  };
  BrandFriendlyName = [];
  infinteLoader: boolean = false;
  scrollTopIcon = false;
  stopInfiniteSCrolling: boolean = false;
  scrollApiCalled: boolean = false;
  notificationToggle: boolean = true;
  showbreachnotification: boolean = false;
  ticketAbouttoBreach: number;
  ticketListSubscription: Subscription;
  mentionListSubscription: Subscription;
  postDetailOpenFlag: boolean = false;
  isReplyVisible: boolean = false;
  scrollTopPosition: boolean = false;
  scrollTopPositionLevel: number = 0;
  bulkActionPositionLevel: number = 0;
  showCallPopup = false;
  inbound = false;
  caller;
  callee;
  pageIndex: number = 1;
  paginationFlag: boolean = false;
  Profiledetails: ProfileDetails;
  newDataFoundCount: number = 0;
  mentionCountSubscription: Subscription;
  voiceEventEnum = VoiceCallEventsEnum
  callTypeEnum = VoiceCallTypeEnum
  callingData = { _caller: '', _callee: '', _callerProfilePic: '', _callerName: '', _calleeName: '', _calleeProfilePic: '' }
  onVoiceCallDisable=false;
  showResumeAssignment: boolean = false;
  isAgentAssignmentFlag: boolean = false;
  startIndex = 0;
  endIndex = 15;
  startPosition: number = 0;
  openRephrasePopup: boolean = false;

  rephrasePosition:any;
  showAIPrompt = false;
  rephraseOptions:any;

  voipSubs: Subscription;
  message: string = "";
  permissions: ActionButton;
  currentUserID: number;
  currentAccountTypeId: number;
  autoCloseWindow: boolean=false;
  showTabView:boolean =false;
  ticketCountList: any;
  selectedItem: any;
  selectedTicketOption: { label: any; dbvalue: any; } = {
    label: 'More',
    dbvalue: null,
};
  mentionCountObj: any;
  disableScrollPosition;
  scrollTopPixel: any;
  isFetchingData: any;
  audioPlayTimeout:any;
  viralAlertNotificationData: any = null;
  viralAlertNotificationToggle: boolean = true;
  SLAStatusForViralAlert: any = {};
  multiTicketsSelected:boolean = false;
  mentionOrGroupView: AllMentionGroupView=AllMentionGroupView.mentionView;
  clickhouseEnabled: boolean=false;
  groupViewFlag:boolean=false;
  mentionOrGroupViewEnum = AllMentionGroupView
  emailExpandView: boolean = false;
  mentionsCountTimeout: any;
  getMentionsTimeout: any;
  ticketStatusTimeout: any;
  GetTicketsByTicketIdapi: any;
  getMentionByTicketIdapi: any;
  GetAssignmentLimitapi: any;
  getMentionListInfiniteapi: any;
  AgentAssignmentResumedapi: any;
  unseenNoteCountList:[]=[]
  outboundCall:boolean = false;
  aggreementPopupFlag:string = '';
  defaultLayout: boolean = false;
  ticketsPreview = [
    { name: 'Rajesh Kumar', text: 'Complaint about flight delay...', priority: 'High', type: 'high' },
    { name: 'Sonia Sharma', text: 'Baggage lost at Terminal 3', priority: 'Urgent', type: 'high' },
    { name: 'Amit Patel', text: 'Issue with meal preference', priority: 'Medium', type: 'medium' }
  ];
  currentIndex = 0;
  constructor(
    private _ticketService: TicketsService,
    private _filterService: FilterService,
    private _advanceFilterService: AdvanceFilterService,
    public dialog: MatDialog,
    private navService: NavigationService,
    private route: ActivatedRoute,
    private _ticketSignalrService: TicketsignalrService,
    private _commonService: CommonService,
    private _navigationService: NavigationService,
    private _replyService: ReplyService,
    private _accountService: AccountService,
    private _chatBotService: ChatBotService,
    private mainService: MainService,
    private _snackBar: MatSnackBar,
    private router: Router,
    private _ngZone: NgZone,
    private _cdr: ChangeDetectorRef,
    private _footService: FootericonsService,
    private _voip: VoiceCallService,
    private _profileService: ProfileService,
    private _postDetailService: PostDetailService,
    private _tabService:TabService,
    private exotelService:ExotelService,
    private sidebarService: SidebarService,
    private commonService: CommonService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));

    this._accountService.currentUser$.pipe(take(1)).subscribe((currentUser) => {
      this.currentUserID = currentUser?.data?.user?.userId;
      this.currentAccountTypeId = currentUser?.data?.user.role;
      let permission: ActionButton = currentUser?.data?.user?.actionButton;
      this.permissions = {
        agentManualPauseAssignment:
          permission.agentManualPauseAssignment === undefined
            ? false
            : permission.agentManualPauseAssignment,
      };
    });
    this.Profiledetails = this._ticketSignalrService.Profiledetails;
    let onLoadFilterTabSource = true;

    effect(() => {
      const value = this._filterService.filterTabSourceSignal();
      if (!onLoadFilterTabSource && value && this.postDetailTab) {
        this.filterTabChanges(value); // This modifies a signal
      } else {
        onLoadFilterTabSource = false;
      }
    }, { allowSignalWrites: true });

    let onLoadSelectedTabInitial = true;

    effect(() => {
      const value = this.navService.fireSelectedTabInitialEventSignal();
      if (!onLoadSelectedTabInitial && this.postDetailTab && value === this.postDetailTab.guid) {
        this.fireSelectedTabInitialEventChanges(value); // This modifies a signal
      } else {
        onLoadSelectedTabInitial = false;
      }
    }, { allowSignalWrites: true });

    let onLoadTicketStatusChange = true;

    effect(() => {
      const value = this._ticketService.ticketStatusChangeSignal();
      if (!onLoadTicketStatusChange && value){
        console.log('Changes comming');
        this.ticketStatusChangeSignalChanges(value);
      } else {
        onLoadTicketStatusChange = false;
      }
    }, { allowSignalWrites: true });

    let onLoadTiktokAuthorDetails = true;

    effect(() => {
      const value = this._ticketService.updateTiktokAuthorDetailsSignal();
      if (!onLoadTiktokAuthorDetails && value) {
        this.TicketList.forEach((obj) => {
          if (obj?.author?.socialId == value?.author?.socialId) {
            obj.author.profileDetails = value?.author?.profileDetails;
            obj.author.profileDetails.isUpdated = value?.author?.profileDetails?.isUpdated
          }
        })
      } else {
        onLoadTiktokAuthorDetails = false;
      }
    }, { allowSignalWrites: true });

    let onLoadAssignToObservable = true;

    effect(() => {
      const value = this._ticketService.agentAssignToObservableSignal();
      if (!onLoadAssignToObservable && value) {
        this.agentAssignToObservableSignalChanges(value)
      } else {
        onLoadAssignToObservable = false;
      }
    }, { allowSignalWrites: true });

    let onLoadTicketStatusChangeObs = true;

    effect(() => {
      const value = this._ticketService.ticketStatusChangeObsSignal();
      if (!onLoadTicketStatusChangeObs && value) {
        this.ticketStatusChangeObsSignalChanges(value)
      } else {
        onLoadTicketStatusChangeObs = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadOpenRephrase = true;

    effect(() => {
      const value = this._replyService.openRephraseSignal();
      if (!onLoadOpenRephrase && value) {
        if (value?.tab?.guid === this.postDetailTab?.guid) {
          this.openRephrasePopup = value?.openPopup;
          this.rephrasePosition = value?.position;
          this.rephraseOptions = value?.rephraseOptions;
          this._cdr.detectChanges();
        }
      } else {
        onLoadOpenRephrase = false;
      }
    }, { allowSignalWrites: true });

    let listPaginationSignal = true;
    effect(() => {
      const value = this._ticketService.listPaginationSignal();
      if (!listPaginationSignal && value) {
        if (value?.status && this._ticketService.isPaginationSet) {
          console.log("=====> listPaginationSignal", value, this._ticketService.isPaginationSet)
          if (this._ticketService?.paginator?.length > 0 && this._ticketService?.paginator?.pageIndex > 0 && this.TicketList.length == 0) {
            this._ticketService?.paginator.firstPage();
            this._cdr.detectChanges();
          }
          this._ticketService.listPaginationSignal.set({ status: false });
        }
      } 
      else { listPaginationSignal = false; }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )

    if (this.permissions.agentManualPauseAssignment) {
      this.message = this.translate.instant('ResumeTooltip');
    } else {
      this.message = this.translate.instant('ticket-assignment-paused');
    }

    // if (this.currentUser.data.user.role === UserRoleEnum.Agent && this.currentUser.data.user.assignmentSettingStatus == 1) {
    //   this.isAgentAssignmentFlag = true;
    // }
    if (this.currentUser.data.user.role === UserRoleEnum.Agent) {
      let assignmentSettingStatus = JSON.parse(
        localStorage.getItem('AssignmentSettingStatus')
      );
      if (assignmentSettingStatus == 1) {
        this.isAgentAssignmentFlag = true;
      }
    }

    let isUserAssisnmentDisable = JSON.parse(localStorage.getItem('IsUserAssignmentDisabled'));
    this.showResumeAssignment = isUserAssisnmentDisable == 0 ? false : true;

    if (!this.Profiledetails){
      this.subs.add(
        this._profileService
          .GetUserDetailsByUserID(this.currentUser.data.user.userId)
          .subscribe((result) => {
            if (result.success) {
              this.Profiledetails = result.data;
              this._ticketSignalrService.Profiledetails = result.data;
              const countrycode = this.Profiledetails?.phoneCountryCode ? countryCodeList.find(x => String(x.value) == this.Profiledetails?.phoneCountryCode) : '';
              let phoneNumber = String(this.Profiledetails?.contactNumber);
              phoneNumber = countrycode ? '+' + countrycode.code + phoneNumber : '+91' + phoneNumber;
              this._ticketSignalrService.voipPhoneNumber = phoneNumber;
            }
          })
      );
    } else {
      const countrycode = this.Profiledetails?.phoneCountryCode ? countryCodeList.find(x => String(x.value) == this.Profiledetails?.phoneCountryCode) : '';
      let phoneNumber = String(this.Profiledetails?.contactNumber);
      phoneNumber = countrycode ? '+' + countrycode.code + phoneNumber : '+91' + phoneNumber;
      this._ticketSignalrService.voipPhoneNumber = phoneNumber;
    }

    const value = this._ticketService.ticketStatusChangeSignal();
    if(value){
      this.ticketStatusChangeSignalChanges(value);
    }

    // this.subs.add(
    //   this._ticketService.ticketStatusChange.subscribe((value) => {
    //     if (value) {
    //       if (this.currentPostType === PostsType.Tickets) {
    //         // this._ticketService.ticketStatusChange.next(false);
    //         this._ticketService.ticketStatusChangeSignal.set(false);
    //         if (this.TicketList.length === 1) {
    //           this.noDataFound = true;
    //           this.TicketList = [];
    //           this.postloader = false;
    //           this._cdr.detectChanges();
    //         }
    //       }
    //     }
    //   })
    // );

    if (this.currentUser?.data?.user?.isVOIPAgent) {
      this._voip.assignCallObjData();
    }
    this.subs.add(
      this._ticketSignalrService.voipSignalCall.subscribe((voipResponse) => {
        this._voip.voipSignalR(voipResponse);
      })
    );
    this.subs.add(
      this._voip.onCallPick.subscribe((res) => {
        // this._voip.voipSignalR(voipResponse)
        if (res == 'CallInitiated' || res == 'inbound' || res == 'outbound') {
          this.onVoiceCallDisable = true
        } else {
          this.onVoiceCallDisable = false
        }
        if (res == 'inbound' || res == 'outbound') {
          this.showCallPopup = true;
          if (this._voip.callObj.callEventType == 'inbound') {
            this.inbound = true;
            this.callingData._caller = this._voip.callObj.customerContactNo;
            this.callingData._callee = this._voip.callObj.agentContactNo;
            this.callingData._callerName = this._voip.callObj.customerName;
            this.callingData._calleeName = this._voip.callObj.agentName;
            this.callingData._calleeProfilePic = this._voip.callObj.agentProfilePic;
            this.callingData._callerProfilePic = '';
          } else {
            this.inbound = false;
            this.callingData._caller = this._voip.callObj.agentContactNo;
            this.callingData._callee = this._voip.callObj.customerContactNo;
            this.callingData._callerName = this._voip.callObj.agentName;
            this.callingData._callerProfilePic = this._voip.callObj.agentProfilePic;
            this.callingData._calleeProfilePic = ''
            this.callingData._calleeName = this._voip.callObj.customerName;
          }
        } else {
          this.showCallPopup = false;
        }
        this._cdr.detectChanges();
      })
    );

    if (this.navService.currentSelectedTab.guid == this.postDetailTab.guid) {
      // this.subs.add(
        this.voipSubs=this._ticketSignalrService.voipMentionSignalCall.subscribe((response) => {
          if (response) {
            const mention: BaseMention = this._voip.voipMentionSignalR(response.message);
            this._voip.onCallPick.subscribe(
              (res) => {
                if (response?.message?.channel?.Title == 'ORIGINATE' && res == VoiceCallEventsEnum.Answer) {
                    // this._ticketService.openCallDetailWindow.next(true);
                  this._ticketService.openCallDetailWindowSignal.set(true);

                  // if (this._voip.callObj.callEventType == this.voiceEventEnum.Answer){
                  if (mention) {
                    this.openTicketDetailVoip(mention);
                  }
                  // }
                }
              });
            }
        })
      // )
    }

    this.subs.add(
      this.mainService.selectedTabCountObs.subscribe((data) => {
        if (data) {
          if (data.guid == this.postDetailTab.guid) {
            this.ticketsFound = null;
            this.ticketsFound = Number(data.count);
            this._cdr.detectChanges();
          }
        }
      })
    );

    this.subs.add(
      this._filterService.ticketAboutToBreachedObs.subscribe((data) => {
        if (data) {
          this.ticketAbouttoBreach = data.value;
          this.showbreachnotification = data.status;
          //this._chatBotService.chatPosition.next(true);
          this.notificationToggle = this.showbreachnotification;
          this._chatBotService.chatPositionSignal.set({
            globalNotificationFlag: this.showbreachnotification,
            tabID: this.navService.currentSelectedTab?.guid,
          });
          // console.log(
          //   `emit from SocialboxComponent =>  ticketAboutToBreachedObs => line:208 . Checks: globalNotificationFlag :`,
          //   this.showbreachnotification,
          //   'and tabID : ',
          //   this.navService.currentSelectedTab?.guid
          // );
          //this._chatBotService.chatPosition.next(this.showbreachnotification);
          this.SLAStatusForViralAlert = { showbreachnotification: this.showbreachnotification, notificationToggle: this.notificationToggle };
          this._cdr.detectChanges();
        }
      })
    );

    this.subs.add(
      this._ticketService.hideGlobalNotificationObs.subscribe((data) => {
        if (data != null) {
          this.notificationToggle = data;
          this.showbreachnotification = data;
          // if (!this.assignmentlimitmsg && !this.bulkActionpanelStatus) {
          //   this._chatBotService.chatPosition.next(false);
          // }
          this._chatBotService.chatPositionSignal.set({
            globalNotificationFlag: false,
            tabID: this.navService.currentSelectedTab?.guid,
          });
          console.log(
            `emit from SocialboxComponent => ngOnInit() => line 208. Check: showbreachnotification : ` +
              this.showbreachnotification +
              'notificationToggle : ' +
              this.notificationToggle
          );
          this.SLAStatusForViralAlert = { showbreachnotification: this.showbreachnotification, notificationToggle: this.notificationToggle };
          this._cdr.detectChanges();
        }
      })
    );

    this.subs.add(
      this._ticketService.changeTicketServiceMentionObj.subscribe((index) => {
        if (index != null) {
          if (this._navigationService.tabs.length > 0) {
            const tabs = this._navigationService.tabs;
            if (tabs[index]?.guid) {
              const guid = tabs[index]?.guid;
              if (this.postDetailTab?.guid == guid) {
                this._ticketService.MentionListObj = this.TicketList;
              } 
            }
            const absolutTimeFlag = localStorage.getItem('absolutTimeFlag') == 'true' ? true : false;
            this._ticketService.absolutTimeObs.next({
              guid: this.postDetailTab.tab.guid,
              absolutTimeFlag: absolutTimeFlag,
            });
          }
        }
      })
    );
    
    this.subs.add(
      this._ticketService.openPostDetailWindow.pipe(debounceTime(300),distinctUntilChanged()).subscribe((response) => {
        if (response) {
          console.log(response,'response');
          if ((response && response.openState && response.guid == this.postDetailTab.guid) || response?.pageType === PostsType.chatbot) {
            this.postDetailOpenFlag = response.openState;
          }
          else { this.postDetailOpenFlag = false; }
          
          if (response?.pageType === PostsType.chatbot) {
            this._ticketService.openPostDetailWindow.next(null);
          }
          if (response?.replyVisible) { this.isReplyVisible = response.replyVisible; }
          if (response?.pageType === PostsType.chatbot) {
            this._ticketService.openPostDetailWindow.next(null);
          }
          this._cdr.detectChanges();
        }
      })
    );

    this.subs.add(
      this._accountService.resetBulkOperationList.subscribe((data) => {
        if (data) {
          this.postBulkAction('hideactionpanel');
        }
      })
    );
    this.subs.add(
      // this._chatBotService.chatPosition.subscribe((response) => {
      //   // if (response != null && response) {
      //   //   this.scrollTopPosition = true;
      //   // } else {
      //   //   this.scrollTopPosition = false;
      //   // }
      //   if (
      //     response.assignmentLimitMsgFlag ||
      //     response.bulkActionpanelFlag ||
      //     response.globalNotificationFlag
      //   ) {
      //     this.scrollTopPosition = true;
      //   } else {
      //     this.scrollTopPosition = false;
      //   }
      // })
      this._ticketService.chatbotPositionUpdated.subscribe((response) => {
        if (response == null) return;
        if (response.status != undefined && response.level != undefined) {
          this.scrollTopPosition = response.status;
          this.scrollTopPositionLevel = response.level;
          this._cdr.detectChanges();
        }
        if (response.bulkActionPanelStatus != undefined) {
          this.bulkActionPositionLevel = response.level;
          this._cdr.detectChanges();
        }
      })
    );
    this.subs.add(
      this.navService.tabSub.subscribe((obj) => {
        let assLimit = JSON.parse(localStorage.getItem('assignmentlimitmsg'));
        if (assLimit != null) {
          //console.log('assLimit : ', assLimit);
          this.assignmentlimitmsg = assLimit;
          this._cdr.detectChanges();
        }
      })
    );

    this.subs.add(
      this._ticketService.lazyLoadingObs.subscribe((res) => {
        if (res) {
          if (res?.guid == this.postDetailTab?.tab?.guid) {
            this.paginationFlag = res.lazyLoadingFlag;
            this._ticketService.isPaginationSet = this.paginationFlag;
            this._ngZone.run(() => this.paginationFlag);
            this._cdr.detectChanges();
          }
        }
      })
    );

    this.subs.add(
      this._ticketService.autoCloseWindowObs.subscribe((res) => {
        if (res) {
          if (res?.guid == this.postDetailTab?.tab?.guid) {
            this.autoCloseWindow=res?.autoCloseFlag
          }
        }
      })
    );

    this.subs.add(
      this._accountService.onNotificationSoundToggle.subscribe((value) => {
        this.audioPlay = value;
        clearTimeout(this.audioPlayTimeout);
        this._cdr.detectChanges();
      })
    );

    this.subs.add(
      this._ticketService.updateTaggedList.subscribe((res) => {
        if (res) {
          if (res?.guid == this.postDetailTab?.tab?.guid) {
            const TagIds = res.tagIDs;
            this._ticketService.selectedPostList = [];
            this._ticketService.postSelectTriggerSignal.set(0);
          this._ticketService.bulkMentionChecked = [];
            this.TicketList = this.TicketList.filter((obj)=>{
              if(!TagIds.includes(obj.tagID))
              {
                return obj;
              }
            })
            this.ticketsFound == 0 ? (this.noDataFound = true) : '';
            this._cdr.detectChanges();
            this._ngZone.runOutsideAngular((res)=>{
              this.mentionsCountTimeout = setTimeout(() => {
                this.getMentionsCount(this.filter);
              }, 700);
            })
          }
        }
      })
    )
    // this.subs.add(
    //   this._voip.onCallPick.subscribe((data) => {
    //     if (data == 'CallInitiated') {
    //       this.onVoiceCallDisable = true
    //     } else {
    //       this.onVoiceCallDisable = false
    //     }
    //   })
    // );

    this.subs.add(
      this._accountService.isUserAssignmentEnable.subscribe((res) => {
        if (res) {
          if (res.IsUserAssignmentDisabled == 0) {
            this.showResumeAssignment = false;
          } else {
            this.showResumeAssignment = true;
          }
          if (res.message) {
            this.message = res.message;
          } else {
            if(this.permissions.agentManualPauseAssignment) {
              this.message = this.translate.instant('ResumeTooltip');
            } else {
              this.message = this.translate.instant('ticket-assignment-paused');
            }
          }
          this._cdr.detectChanges();
          this._accountService.isUserAssignmentEnable.next(null);
        }
      })
    );

    this.subs.add(
      this._ticketSignalrService.enableDisablePauseResumeAssignmentOptionSignalRCall.subscribe(
        (result) => {
          if (result) {
            if (result.AssignmentStatus == 1) {
              // localStorage.removeItem('AssignmentSettingStatus');
              // localStorage.setItem('AssignmentSettingStatus', "1");
              this.isAgentAssignmentFlag = true;
            } else {
              // localStorage.removeItem('AssignmentSettingStatus');
              // localStorage.setItem('AssignmentSettingStatus', "0");
              this.isAgentAssignmentFlag = false;
            }
            this._cdr.detectChanges();
            this._ticketSignalrService.enableDisablePauseResumeAssignmentOptionSignalRCall.next(
              null
            );
          }
      })
    )
    // this.subs.add(
    //   this._ticketService.ticketStatusChange.subscribe((value) => {
    //     if (value) {
    //       if (this.currentPostType === PostsType.Tickets) {
    //         // this._ticketService.ticketStatusChange.next(false);
    //         this._ticketService.ticketStatusChangeSignal.set(false);
    //         if (this.TicketList.length === 1) {
    //           this.noDataFound = true;
    //           this.TicketList = [];
    //           this.postloader = false;
    //         }
    //       }
    //     }
    //   })
    // );


    /* this.subs.add(
      this._replyService.openRephrase.subscribe((res) => {
        if(res?.tab?.guid === this.postDetailTab?.guid){
          this.openRephrasePopup = res?.openPopup;
          this.rephrasePosition = res?.position;
          this.rephraseOptions = res?.rephraseOptions;
          this._cdr.detectChanges();
        }
      })
    ); */

    this.subs.add(
      this._ticketService.bulkDeleteObs.subscribe((res)=>{
        if(res?.guid == this.postDetailTab?.guid)
        {
          res?.bulkList.forEach((obj)=>{
          const index =  this.TicketList.findIndex((baseMention) => baseMention.tagID == obj?.TagID);
          if(index>-1)
          {
            this.TicketList.splice(index, 1)
          }
          })
          this.getMentionsCount(this.filter);
          if(res?.updateListFlag)
          {
            this._ngZone.runOutsideAngular((res)=>{
              this.getMentionsTimeout = setTimeout(() => {
                this.getMentions(this.filter, true);
              }, 500);
            })
          }
          this._cdr.detectChanges();
        }
      })
    )

    this.subs.add(
      this._ticketService.bulkUpdateListObs.subscribe((res) => {
        if (res?.guid == this.postDetailTab?.guid) {
          res?.bulkList.forEach((obj) => {
            const index = this.TicketList.findIndex((baseMention) => baseMention.tagID == obj?.TagID);
            if (index > -1) {
              this.TicketList.splice(index, 1)
            }
          })
          if (this.currentPostType === PostsType.Tickets) {
            const CountData = {
              MentionCount: null,
              tab: this.postDetailTab.tab,
              posttype: PostsType.Tickets,
            };
            // this._filterService.currentCountData.next(CountData);
            this._filterService.currentCountDataSignal.set(CountData);

          }
          if (this.currentPostType === PostsType.Mentions) {
            this.getMentionsCount(this.filter);
          }
          this._cdr.detectChanges();
        }
      })
    )

    this.subs.add(
      this._ticketService.acknowledgeSucessObs.subscribe((res)=>{
        if(res)
        {
          const index = this.TicketList.findIndex((baseMention) => baseMention.tagID == res?.tagID);
          if (index > -1) {
            this.TicketList.splice(index, 1)
            this._cdr.detectChanges();
          }
        } 
      })
    )
    if (localStorage.getItem('notification') != null){
      this.audioPlay = localStorage.getItem('notification') == 'true' ? true : false;
    }

    this.subs.add(
      this._ticketService.searchTabViewObs.subscribe((res)=>{
        if(res?.guid == this.postDetailTab?.guid)
        {
          this.showTabView=!this.showTabView;
          this._cdr.detectChanges();
        }
      })
    )

    this.subs.add(
      this._ticketService.tabViewTicketListObs.subscribe((res)=>{
        if(res?.guid == this.postDetailTab?.guid)
        {
          this.ticketCountList= res.listObj;
          this.selectedItem=res.selectedItem;
          const SrStatus = [22,23,24,25];
          if (!this.selectedItem || SrStatus.includes(this.selectedItem)){
            this.multiTicketsSelected = true;
          } else {
            this.multiTicketsSelected = false;
          }
          this.activeTabBasedOnTicketId(this.selectedItem)
          this._cdr.detectChanges();
        }
      })
    )

    this.subs.add(
      this._ticketService.tabViewMentionListObs.subscribe((res) => {
        if (res?.guid == this.postDetailTab?.guid) {
          this.selectedItem = res.selectedItem;
          this.brandpost=res.brandpost
          this.brandreply = res.brandreply
          this.actionchk = res.actionchk
          this.nonactionchk = res.nonactionchk
          this.mentionCountObj=res.mentionObj
          this._cdr.detectChanges();
        }
      })
    )

    // this.subs.add(
    //   this._ticketService.agentAssignToObservable.subscribe((res)=>{
    //     if(res)
    //     {
    //       this.TicketList.forEach((obj)=>{
    //         if(obj.tagID==res?.tagID)
    //         {
    //           obj.ticketInfo.assignedTo = res.ticketInfo.assignedTo;
    //           obj.ticketInfo.assignedToTeam = res.ticketInfo.assignedToTeam;
    //           this._cdr.detectChanges();
    //         }
    //       })
    //     }
    //   })
    // )

    // this.subs.add(
    //   this._ticketService.ticketStatusChangeObs.subscribe((res)=>{
    //     if(res?.guid==this.postDetailTab?.guid && res?.ticketType!=0)
    //     {
    //       const index = this.TicketList.findIndex((obj)=>obj.tagID==res?.tagID);
    //       if(index>-1)
    //       {
    //         this.TicketList.splice(index,1);
    //       }
    //       this._cdr.detectChanges(); 
    //     }
    //   })
    // )

    this.subs.add(
      this._ticketService.ticketcategoryBulkMapChange.subscribe((res) => {
        if (res) {
          this.TicketList.forEach((obj) => {
            if (res.tagIds.some((tagObj) => tagObj.tagID == obj.tagID)) {
              obj.upperCategory = (res?.postData?.upperCategory) ? res?.postData?.upperCategory : { id: 0, name: null, userID: null, brandInfo: null };
              obj.categoryMap = res?.postData?.categoryMap;
              obj.ticketInfo.ticketUpperCategory =
                res?.postData?.ticketInfo?.ticketUpperCategory;
            }
          })
        }
      }
      )
    )

    this.subs.add(
      this._ticketService.ticketAssignedToListObs.subscribe((res)=>{
        this.TicketList.forEach((obj)=>{
          if(res.tagIDList.some((TagId)=>TagId==obj.tagID))
          {
            obj.ticketInfo.assignedTo=res.assignedUser.agentID
            obj.ticketInfo.assignedToTeam = res.assignedUser.teamID
            obj.ticketInfo.assignToAgentUserName = res.assignedUser.agentName
            obj.ticketInfo.assignedToTeamName = res.assignedUser.teamName
          }
        })
      })
    )
    // this.showTabView = this._navigationService.currentSelectedTab?.Filters?.simpleSearch ? true : false

    this.subs.add(
      this._postDetailService.setMarkInfluencer.subscribe((postObj) => {
        if (postObj) {
          this.TicketList.forEach((obj)=>{
            if(obj.author.socialId==postObj.author.socialId &&
              obj.brandInfo.brandID==postObj.brandInfo.brandID)
            {
              if (postObj.author.markedInfluencerCategoryID) {
                obj.author.markedInfluencerCategoryID =
                  postObj.author.markedInfluencerCategoryID;
                obj.author.markedInfluencerCategoryName =
                  postObj.author.markedInfluencerCategoryName;
              } else {
                obj.author.markedInfluencerCategoryID =
                  0;
                obj.author.markedInfluencerCategoryName =
                  null;
              }
          }
          })
            this._cdr.detectChanges();
          }
      })
    );

    this.subs.add(
      this._ticketSignalrService.viralAlertSignalR.subscribe((data) => {
        if (data) {
          // let signalRData = JSON.parse(data);
          let userRole = data?.UserRoles?.split(',').map(Number);
          let assignedBrand = this._filterService.fetchedBrandData.map((x) => x.brandID);

          if (assignedBrand?.includes(data?.BrandID) && userRole?.includes(this.currentAccountTypeId)) {
            this.viralAlertNotificationData = data;
            this.viralAlertNotificationToggle = true;
            this.SLAStatusForViralAlert = { showbreachnotification: this.showbreachnotification, notificationToggle: this.notificationToggle };
            this._ticketService.viralAlertChatIconPosition.next(true);
            this._cdr.detectChanges();
          }
        }
      })
    )
    this.subs.add(
      this._postDetailService.setMarkInfluencerClickhouse.subscribe((postObj) => {
        if (postObj) {
          this.TicketList.forEach((obj) => {
            if (obj.author.socialId == postObj.author.socialId &&
              obj.brandInfo.brandID == postObj.brandInfo.brandID) {
              if (postObj.author.influencerDetailsList?.length > 0) {
                obj.author.influencerDetailsList =
                  postObj.author.influencerDetailsList;
              } else {
                obj.author.influencerDetailsList =
                  [];
              }
            }
          })
          this._cdr.detectChanges();
        }
      })
    );
      /* this.subs.add(
        this._ticketService.updateTiktokAuthorDetails.subscribe((res) => {
          if (res) {
            this.TicketList.forEach((obj)=>{
              if (obj?.author?.socialId == res?.author?.socialId) {
              obj.author.profileDetails = res?.author?.profileDetails;
                obj.author.profileDetails.isUpdated = res?.author?.profileDetails?.isUpdated
            }
          })
          }
        })
      ) */
    /* pagination update logic for last page*/
    /* this.subs.add(
      this._ticketService.listPagination.subscribe((res) => {
        if (res?.status) {
          if (this._ticketService.isPaginationSet) {
            if (this._ticketService?.paginator?.length > 0 && this._ticketService?.paginator?.pageIndex > 0 && this.TicketList.length == 0) {
              this._ticketService?.paginator.firstPage();
              this._cdr.detectChanges();
            }
            this._ticketService.listPagination.set({ status: false });
          }
        }
      })
    ) */
    /* pagination update logic for last page*/

      this.subs.add(
      this._ticketService.mentionOrGroupViewObs.subscribe((res)=>{
        if(res?.guid == this.postDetailTab?.guid)
        {
          this.mentionOrGroupView = res?.value;
          this.filter = this._navigationService.getFilterJsonBasedOnTabGUID(
            this.postDetailTab.tab.guid
          );
          this.groupViewFlag = this.filter.isGroupView
          this.getMentionsCount(this.filter)
         this.getMentions(this.filter,true)
        }
      })
      )

      this.subs.add(
        this._ticketService.updateMentionSeenUnseen.subscribe((res) => {
          if (res) {
            this.TicketList.forEach((obj) => {
             if(res?.tagId==obj.tagID)
              {
                obj.mentionMetadata.isMarkSeen=res?.seenOrUnseen
               res?.seenOrUnseen == 1 ? obj.mentionMetadata.unseencount = 0 : obj.mentionMetadata.unseencount = obj.mentionMetadata.childmentioncount;
              }
            })
            this._cdr.detectChanges();
          }
        }
      )
    )

    this.subs.add(
      this._ticketService.updateBulkMentionSeenUnseen.subscribe((res) => {
        if (res?.guid == this.postDetailTab?.guid) {
          this.TicketList.forEach((obj) => {
            if (res?.list.some((x) => x.Tagid == obj.tagID)) {
              obj.mentionMetadata.isMarkSeen = res?.list.find((x) => x.Tagid == obj.tagID).Ismarkseen
              obj.mentionMetadata.isMarkSeen == 1 ? obj.mentionMetadata.unseencount = 0 : obj.mentionMetadata.unseencount = obj.mentionMetadata.childmentioncount;
            }
          })
          this._cdr.detectChanges();
        }
      }
      )
    )

    this.subs.add(
      this._ticketService.updateChildMentionInMentionList.subscribe((res) => {
        this.TicketList.forEach((x) => {
        if (res?.tagID == x.tagID) {
          if (res.seenOrUnseen) {
            x.mentionMetadata.unseencount = x.mentionMetadata.unseencount - 1
          } else {
            x.mentionMetadata.unseencount = x.mentionMetadata.unseencount + 1
          }
        }
      })
      this._cdr.detectChanges();
      })
    )

    this.subs.add(
      this._ticketService.updateMentionListSeenUnseen.subscribe((res)=>{
        this.TicketList.forEach((x) => {  
          if (res?.tagID == x.tagID) {
            if (res.seenOrUnseen) {
              x.mentionMetadata.unseencount = 0
            } else {
              x.mentionMetadata.unseencount = x.mentionMetadata.childmentioncount
            }
          }
        })
      })
    )

    this.subs.add(
      this._ticketService.emailPopUpViewObs.subscribe((res) => {
        if (res.status) {
          this.emailExpandView = res.isOpen;
        }
      })
    )

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1){
     this.clickhouseEnabled = true;
    }

    this.subs.add(
      this._ticketService.unseenNoteCountObs.subscribe((res) => { 
        if (res?.guid == this.postDetailTab?.guid) {
          this.unseenNoteCountList = res?.unseenCountObJ;
        }
      }
    )
  )
    this.subs.add(
      this.exotelService.exotelIncomingOutgoingCall.subscribe((res)=>{
        if(this.postDetailTab?.guid == res?.guid){
          this.showCallPopup = true;
          this.inbound = true;
          this.onVoiceCallDisable = true
         if(res.type=='incoming')
         {
          this.outboundCall = false;
           this.callingData._caller = res.callFromNumber;
           this.callingData._callee = this.currentUser?.data?.user?.firstName + ' ' + this.currentUser?.data?.user?.lastName;
           this.callingData._callerName = '';
           this.callingData._calleeName = this._voip.callObj.agentName;
          //  this.callingData._calleeProfilePic = this._voip.callObj.agentProfilePic;
           this.callingData._calleeProfilePic =''
           this.callingData._callerProfilePic = '';
           this._postDetailService.incomingOrOutgoing = true
           this._postDetailService.callAgainNumber = res.callFromNumber
         }else
         {
          this.inbound = false
           this.outboundCall = true;
           this.callingData._caller = this.currentUser?.data?.user?.firstName + ' ' + this.currentUser?.data?.user?.lastName;
           this.callingData._callee = this.exotelService.callToNumber;
           this.callingData._callerName = '';
           this.callingData._calleeName = this._voip.callObj.agentName;
           this.callingData._calleeProfilePic = this._voip.callObj.agentProfilePic;
           this.callingData._callerProfilePic ='';
           this._postDetailService.incomingOrOutgoing = false
           this._postDetailService.callAgainNumber = this.exotelService.callToNumber
         }
          this._cdr.detectChanges();
        }
      })
    )

    this.subs.add(
      this.exotelService.exotelCallEnded.subscribe((res)=>{
        if(this.postDetailTab?.guid == res?.guid){
          this.showCallPopup = false;
          this.onVoiceCallDisable = false
          this._ticketSignalrService.exotelMultipleSignalR=[]
          this._cdr.detectChanges();
        }
      } 
    )
    )

    this.subs.add(
      this._ticketSignalrService.exotelCallConnectedObs.subscribe((res) => {
        if (res?.guid==this.postDetailTab?.guid && this._ticketSignalrService?.exotelMultipleSignalR?.length == 2 && this._ticketSignalrService?.exotelMultipleSignalR[0] == this._ticketSignalrService?.exotelMultipleSignalR[1]) {
          const mention: BaseMention = this._voip.voipMentionSignalR(res.data);
        this.showCallPopup = false;
          this.onVoiceCallDisable = false
          this._cdr.detectChanges();
          this._ticketService.openCallDetailWindowSignal.set(true);
          this._postDetailService.voiceTagId = mention.tagID;
          this.openTicketDetailVoip(mention); 
        }
      }
      )
    )

    this.aggreementPopupFlag = this.currentUser?.data?.user?.agreementMessageToShow;
  }

  ticketStatusChangeSignalChanges(value){
    if (value) {
      if (this.currentPostType === PostsType.Tickets) {
        // this._ticketService.ticketStatusChange.next(false);
        if (this.TicketList.length === 1) {
          this.noDataFound = true;
          this.TicketList = [];
          this.postloader = false;
          this._cdr.detectChanges();
        }
        this.ticketStatusTimeout = setTimeout(() => {
          this._ticketService.ticketStatusChangeSignal.set(false);
        }, 500);
      }
    }
  }

  ticketStatusChangeObsSignalChanges(res){
    if (res?.guid == this.postDetailTab?.guid && res?.ticketType != 0) {
      const index = this.TicketList.findIndex((obj) => obj.tagID == res?.tagID);
      if (index > -1) {
        this.TicketList.splice(index, 1);
      }
      this._cdr.detectChanges();
    }
  }

  agentAssignToObservableSignalChanges(res){
    if (res) {
      this.TicketList.forEach((obj) => {
        if (obj.tagID == res?.tagID) {
          obj.ticketInfo.assignedTo = res.ticketInfo.assignedTo;
          obj.ticketInfo.assignedToTeam = res.ticketInfo.assignedToTeam;
          this._cdr.detectChanges();
        }
      })
    }
  }

  fireSelectedTabInitialEventChanges(guid){
    if (guid === this.postDetailTab.guid) {
      this.firstFilterApply = true;
      this.initializePageComponent(this.postDetailTab.tab);
      this.setAutoRenderSetting();
      this._cdr.detectChanges();
    }
  }

  filterTabChanges(tabObj){
    if (tabObj) {
      if (tabObj.guid === this.postDetailTab.tab.guid) {
        // if (tabObj.userID !== -1)
        // {
        // this._filterService.reverseApply(JSON.parse(tabObj.filterJson));
        // }
        // this.filter = this.firstFilterApply && genricfilterObj ? this.getDefaultTabJson(tabObj, genricfilterObj)
        // : this._filterService.getGenericFilter() ;
        // this.filter = this._filterService.getGenericFilter() ;
        // reverseApply when it is first call

        // this.filter = this.firstFilterApply && genricfilterObj ? this.reverseApplyGetFilter(tabObj.filterJson)
        // : this._navigationService.getFilterJsonBasedOnTabGUID(this.postDetailTab.tab.guid);

        this.filter = this._navigationService.getFilterJsonBasedOnTabGUID(
          this.postDetailTab.tab.guid
        );


        if (this.filter.postsType == PostsType.unknown) {
          this.filter.postsType = PostsType.Tickets;
        }

        this.subs.add(
        this._filterService.setHighlightedMentionItem.subscribe((flag) => {
          if (
            flag &&
            this.filter.filters.some((obj) => obj.name == 'isbrandactivity')
          ) {
            this.filter.filters = this.filter.filters.map((obj) => {
              if (obj.name == 'isbrandactivity') {
                obj.value = [flag];
              }
              return obj;
            });
          }
        })
        );

        // if (
        //   this.filter.filters.some(
        //     (obj) =>
        //       obj.name == 'SSREStatus' || obj.name == 'TicketActionStatus'
        //   )
        // ) {
        //   this.filter.ticketType = [];
        // }
        if (this.currentUser?.data?.user?.role === UserRoleEnum.Agent && this.currentPostType == PostsType.Tickets) {
          if (!this.currentUser?.data?.user?.actionButton?.seeAllTicketsEnabled) {

            if (this.filter?.filters?.some(
              (obj) => obj.name == "UsersWithTeam" && !obj?.value?.UserIDs?.includes(this.currentUser?.data?.user?.userId)
            )) {
              this.filter.filters = this.filter?.filters?.filter(
                (obj) => obj.name != "users"
              );
            }
            // else
            // {
            //   this.filter.filters = this.filter.filters.filter((obj) => obj.name !== 'UsersWithTeam')
            //   this.filter.filters.push({ name: "UsersWithTeam", type: 2, value: { UserIDs: [this.currentUser?.data?.user?.userId], TeamIds: [] } });
            // }
          }
          // else
          // {
          //   this.filter.filters = this.filter.filters.filter((obj) => obj.name !== 'UsersWithTeam')
          //   this.filter.filters.push({ name: "UsersWithTeam", type: 2, value: { UserIDs: [this.currentUser?.data?.user?.userId], TeamIds: [] } });
          // }
          // const filters = this.filter.filters.filter(
          //   (obj) => obj.name != 'UsersWithTeam'
          // );
          // this.filter.filters = [
          //   {
          //     name: 'UsersWithTeam',
          //     type: 2,
          //     value: {
          //       UserIDs: [this.currentUser.data.user.userId],
          //       TeamIds: [],
          //     },
          //   },
          // ];
          // if (filters.length > 0) {
          //   this.filter.filters = this.filter.filters.concat(filters);
          // }
          //  if (
          //    filterObj.filters.some((obj) => obj.name == 'UsersWithTeam')
          //  ) {
          //  } else {
          //    filterObj.filters.push({
          //      name: 'UsersWithTeam',
          //      type: 2,
          //      value: {
          //        UserIDs: [this.currentUser.data.user.userId],
          //        TeamIds: [],
          //      },
          //    });
          //  }
        }

        if (this.currentUser?.data?.user?.role === UserRoleEnum.Agent && this.currentPostType == PostsType.Mentions) {
          this.filter.filters = this.filter.filters.filter((obj) => obj.name !== 'UsersWithTeam')
        }


        const currentUser = JSON.parse(localStorage.getItem('user')).data;
        const currentUserRole = currentUser.user.role;
        const show = currentUser.user.userRole
          ? currentUser.user.userRole.isSelfAssigned
          : false;

        if (
          UserRoleEnum.CustomerCare === currentUserRole ||
          UserRoleEnum.BrandAccount === currentUserRole
        ) {
          if (show) {
            this.filter.filters = this.filter.filters.filter((obj) => obj.name !== 'UsersWithTeam')
            this.filter.filters.push({ name: "UsersWithTeam", type: 2, value: { UserIDs: [this.currentUser?.data?.user?.userId], TeamIds: [] } });
          }
        }

        // : this._filterService.getGenericFilter();
        // const filterFromObject: FilterFilledData = this._filterService.reverseApply(this.filter, true);
        // console.log(`%c reverse filter object -> ${JSON.stringify(filterFromObject)}`, 'background: #222; color: #bada55');
        // console.log(`%c filter object -> ${JSON.stringify(this.filter)}`, 'background: #222; color: #bada55');
        // console.log(`%c start date ->  ${this.filter.startDateEpoch}`, 'background: #222; color: #bada55');
        // console.log(`%c end date -> ${this.filter.endDateEpoch}`, 'background: #222; color: #bada55');

        this.postDetailTab.tab.Filters = this.filter;

        this.firstFilterApply = false;
        if (currentUser?.user?.role === UserRoleEnum.LocationManager && this._filterService?.fillFilterBasicListData && this._filterService?.fillFilterBasicListData?.locationProfiles && this._filterService?.fillFilterBasicListData?.locationProfiles?.length) {
          if (this.filter?.filters && this.filter?.filters.length ){
            const isExist = this.filter?.filters.find(res => res.name == 'LocationManager');
            if (!isExist){
              this.applySelectedProfile(this._filterService?.fillFilterBasicListData?.locationProfiles);
            }
          } else {
            this.applySelectedProfile(this._filterService?.fillFilterBasicListData?.locationProfiles);
          }
        }

        if (this.filter.postsType === PostsType.Tickets) {
          this.currentPageType = 'ticket';
          this.currentPostType = this.filter.postsType;
          const CountData = {
            MentionCount: null,
            tab: this.postDetailTab.tab,
            posttype: PostsType.Tickets,
          };
          // this._filterService.currentCountData.next(CountData);
          this._filterService.currentCountDataSignal.set(CountData);

          this.GetTickets(this.filter, true);
        }
        if (this.filter.postsType === PostsType.Mentions) {
          this.currentPageType = 'mention';
          this.currentPostType = this.filter.postsType;
          this.getMentionsCount(this.filter);
          this.getMentions(this.filter, true);
        }
        this.isadvance = false;
        // this._filterService.filterTabSource.next(null);
        this._filterService.filterTabSourceSignal.set(null);

      }
    }
  }

  applySelectedProfile(locationList): void {
  
      let channelGroup = {
        name: 'LocationManagerChannel',
        type: 2,
        value: []
      }
      let locationManager = {
        name: 'LocationManager',
        type: 2,
        value: [
        ]
      }
      locationList.forEach((obj) => {
        if (obj?.channelGroup && !channelGroup.value.includes(obj?.channelGroup)) {
          channelGroup.value.push(obj.channelGroup);
        }
        if (obj.channelGroup == ChannelGroup.GoogleMyReview && obj?.gmbLocations && obj?.gmbLocations.length) {
          const allGMBIds = obj.gmbLocations.map(res => Number(res.locationID));
          locationManager.value = [...locationManager.value, ...allGMBIds];
        } else if (obj?.channelGroup == ChannelGroup.Facebook || obj?.channelGroup == ChannelGroup.Instagram) {
          locationManager.value.push(Number(obj.accountID));
        }
      })
    this._navigationService.selectedLocationChannles = channelGroup;
    this._navigationService.selectedGMBLocations = locationManager;
    
      const removeFilters: any[] = ['LocationManager', 'LocationManagerChannel'];
    if (this.filter?.filters){
        this.filter.filters =
          this.filter.filters.filter(item => !removeFilters.includes(item?.name));
        if (locationManager.value.length) {
          this.filter.filters.push(locationManager);
        }
        if (channelGroup.value.length) {
          this.filter.filters.push(channelGroup);
        }
      }
    }
  onScroll(event: any) {
    let lastIndex = 0;

    if (this.document.getElementById('post_reply') || this.document.getElementById('direct_close'))
    {
      return;
    }

    if (
      this.startPosition <=
      event.target.offsetHeight + event.target.scrollTop + 50
    ) {
      let index = Math.trunc((event.target.scrollTop / 250) + 1);
      if (index != lastIndex && index > 5) {
        lastIndex = index - 1;
        this.startIndex = this.TicketList.length - 10 > this.startIndex ? this.startIndex + 1 : this.startIndex;
        this.endIndex = this.TicketList.length >= this.endIndex ? this.endIndex + 1 : this.endIndex;
        this._cdr.detectChanges();
      }
    } else {
      let index1 = Math.trunc((event.target.scrollTop / 250) + 1);
      if (index1 != lastIndex && index1 <= 3) {
        lastIndex = index1 - 1;
        this.startIndex = this.startIndex - 1 > 0 ? this.startIndex - 1 : 0;
        this.endIndex = this.endIndex - 1 > 15 ? this.endIndex - 1 : 15;
        this._cdr.detectChanges();
      }
    }
    this.startPosition =
      event.target.offsetHeight + event.target.scrollTop + 50;
  }

  ngAfterViewInit(): void {
    let status:boolean = true;
    this._ngZone.runOutsideAngular(() => {
      this.socialBoxDiv.nativeElement.addEventListener('scroll', (event) => {
        // let index = Math.trunc((event.target.scrollTop / 250) + 1);
        // const endTicket = this.endIndex > this.TicketList.length ? this.TicketList.length - this.startIndex - 10 : this.endIndex - this.startIndex - 10;
        // if (index > endTicket && status && this.endIndex < this.TicketList.length) {
        //   this.endIndex = this.endIndex + 35;
        //   this.startIndex = index - 10 > 0 ? index - 10 : 0;
        //   status = false;
        //   this._cdr.detectChanges();
        //   setTimeout(() => {
        //     status = true;
        //   }, 500);
        // }
        // if (index < 10 && status && this.startIndex > 10) {
        //   this.startIndex = this.startIndex - 10 > 10 ? this.startIndex - 10 : 0;
        //   this.endIndex = this.startIndex + 35;
        //   status = false;
        //   this._cdr.detectChanges();
        //   setTimeout(() => {
        //     status = true;
        //   }, 100);
        // }

        if (this.document.getElementById('post_reply') || this.document.getElementById('direct_close')) {
          return;
        }

        if (
          event.target.offsetHeight + event.target.scrollTop + 10 >=
          event.target.scrollHeight
        ) {
          this.filter.oFFSET = this.TicketList.length;
          if (
            this.infinteLoader === false &&
            this.stopInfiniteSCrolling == false &&
            !this.paginationFlag && this.TicketList.length>49
          ) {
            if (this.currentPostType === PostsType.Tickets) {
              this.GetTicketsInfiniteScrolling(this.filter);
            } else if (this.currentPostType === PostsType.Mentions) {
              this.getMentionsInfiniteScrolling(this.filter);
            }
          }
        }
        // this._chatBotService.chatBotHideObs.next({
        //   status: false,
        // });
        this._chatBotService.chatBotHideObsSignal.set({ status: false });

        const topIconStatus = this.scrollTopIcon;
        if (event.target.scrollTop > 200) {
          this.scrollTopIcon = true;
        } else {
          this.scrollTopIcon = false;
        }
        if (topIconStatus != this.scrollTopIcon) {
          this._cdr.detectChanges();
        }
        this._ticketService.scrollEventSocialBoxSignal.set({
          guid: this.postDetailTab.guid,
        });
      });
    });
    this._ticketService.paginator = this.paginator;
  }

  hideNotification(status): void {
    this._ticketService.hideGlobalNotificationObs.next(status);
  }

  applyAboutToBreachedEvent(event):void{
    if (this.currentPostType == this.postTypeEnum.Tickets) {
      if (!this.filter.filters.some((obj) => obj.name == 'TATBreached')) {
        this.filter.filters.push({
          name: "TATBreached",
          type: 0,
          value: 1
        })
        const CountData = {
          MentionCount: null,
          tab: this.postDetailTab.tab,
          posttype: PostsType.Tickets,
        };
        // this._filterService.currentCountData.next(CountData);
        this._filterService.currentCountDataSignal.set(CountData);

        this.GetTickets(this.filter, true);
      }
    }
    if (this.currentPostType == this.postTypeEnum.Mentions) {

    }
  }

  assignmentLimitNotificationToggle(val: any) {
    //console.log('assignmentLimitNotificationClosed : ', event);
    this.assignmentlimitmsg = val;
    if (val) {
      this._chatBotService.chatPositionSignal.set({
        assignmentLimitMsgFlag: true,
        tabID: this.navService.currentSelectedTab?.guid,
      });
      localStorage.setItem('assignmentlimitmsg', JSON.stringify(val));
    } else {
      this._chatBotService.chatPositionSignal.set({
        assignmentLimitMsgFlag: false,
        tabID: this.navService.currentSelectedTab?.guid,
      });
      localStorage.setItem('assignmentlimitmsg', JSON.stringify(val));
    }
    console.log(
      `emit from SocialboxComponent => assignmentLimitNotificationToggle() => line 370. Check:  assignmentLimitMsgFlag : `,
      val,
      ' tabId : ',
      this.navService.currentSelectedTab?.guid
    );
  }
  setAutoRenderSetting(): void {
    this.subs.add(
      this.navService.autoRenderSetting.subscribe((renderSetting) => {
        if (renderSetting) {
          if (renderSetting.tab.guid === this.postDetailTab?.guid) {
            this.setRenderTiming(renderSetting.autoRender);
            this._cdr.detectChanges();
          }
        }
      })
    );
    this.subs.add(
      this._ticketSignalrService.ticketSignalCall.subscribe((tabObj) => {
        if (tabObj) {
          if (tabObj.tab.guid === this.postDetailTab?.guid) {
            if (this.router.url.includes(tabObj.tab.guid)) {
              this.checkIfTicketsRecieved(tabObj);
              this._cdr.detectChanges();
            }
          }
        }
      })
    );
    this.subs.add(
      this._ticketSignalrService.voipMentionSignalCall.subscribe((res) => {
        if (res && res?.message?.channel?.Title != 'ORIGINATE') {
              this.voipMentionReceived();
            }
      })
    );
    this.subs.add(
      this._ticketSignalrService.removeTicketCall.subscribe((ticketId) => {
        if (ticketId && +ticketId > 0) {
          if (
            this.postDetailTab?.tab?.guid ==
            this.navService?.currentSelectedTab?.guid
          ) {
            this.closeTicket(+ticketId);
            this._cdr.detectChanges();
          }
        }
      })
    );

    this.subs.add(
      this._ticketSignalrService.removeTicketCallWithoutAPI.subscribe(
        (ticketId) => {
          if (ticketId && +ticketId > 0) {
            this._ticketSignalrService.removeTicketCallWithoutAPI.next(null);
            if (this.postDetailTab?.tab?.guid == this.navService?.currentSelectedTab?.guid) {
              this.closeTicketWithoutCount(+ticketId);
              this._cdr.detectChanges();
            }
          }
        }
      )
    );

    this.subs.add(
      this._ticketSignalrService.mentionSignalCall.subscribe((ticketId) => {
        if (ticketId && +ticketId > 0) {
          this.closeMention(+ticketId);
          this._cdr.detectChanges();
        }
      })
    );

    const autorenderjson = localStorage.getItem('IsTicketAutoRender');
    if (autorenderjson && autorenderjson !== '') {
      const autorenderTabs = JSON.parse(autorenderjson);
      if (autorenderTabs && autorenderTabs.length > 0) {
        const tabexist = autorenderTabs.findIndex(
          (obj) => obj.tab.guid === this.postDetailTab.guid
        );
        if (tabexist > -1) {
          const currentRenderSetting: AutoRenderSetting =
            autorenderTabs[tabexist];
          this.setRenderTiming(currentRenderSetting.autoRender);
        } else {
          this.setRenderTiming(AutoRenderTime.AutoRender);
        }
      }
    } else {
      this.setRenderTiming(AutoRenderTime.AskBeforeRender);
    }
  }

  setRenderTiming(value): void {
    // const tabindex = this.navService.fetchedTabList.findIndex(obj => obj.guid === this.postDetailTab.guid);
    // let genericFilter: GenericFilter;
    // if (tabindex > -1)
    // {
    //   genericFilter = JSON.parse(this.navService.fetchedTabList[tabindex].filterJson);
    // }
    // this.filter = this.isadvance ? this._advanceFilterService.getGenericFilter()
    //  : this._filterService.getGenericFilter();
    this.currentAutoRenderSetting = value;
    this._ticketService.ticketRenderingSetting = value;
    if (this.ticketInterval) {
      clearInterval(this.ticketInterval);
      this.ticketInterval = null;
    }

    if (+value === AutoRenderTime.AskBeforeRender) {
      if (this.currentPostType === PostsType.Tickets) {
      } else if (this.currentPostType === PostsType.Mentions) {
      }
    }

    // to be refactord
    else if (+value === AutoRenderTime.AutoRender) {
      this._ngZone.runOutsideAngular(() => {
        this.ticketInterval = setInterval(() => {
          // this.checkIfTicketsRecieved();
        }, 10000);
      });
    } else if (+value === AutoRenderTime.RenderThirtySec) {
      this._ngZone.runOutsideAngular(() => {
        this.ticketInterval = setInterval(() => {
          // this.checkIfTicketsRecieved();
          this.autoRenderData();
        }, 30000);
      });
    } else if (+value === AutoRenderTime.RenderOneMinute) {
      this._ngZone.runOutsideAngular(() => {
        this.ticketInterval = setInterval(() => {
          this.autoRenderData();
        }, 60000);
      });
    } else if (+value === AutoRenderTime.RenderTwoMinute) {
      this._ngZone.runOutsideAngular(() => {
        this.ticketInterval = setInterval(() => {
          this.autoRenderData();
        }, 120000);
      });
    } 
    console.log((this.currentAutoRenderSetting &&
      Number(this.currentAutoRenderSetting) ===
      AutoRenderTime.AskBeforeRender) ||
      (Number(this.currentAutoRenderSetting) !==
        AutoRenderTime.AskBeforeRender &&
        !this.document.hasFocus()));
    
  }

  openTicketDetailVoip(mention): void {
    this._postDetailService.voiceChannel = mention.channelGroup;
    this._postDetailService.postObj = mention;
    this._postDetailService.pagetype = PostsType.TicketHistory;
    /* this._postDetailService.currentPostObject.next(mention.ticketInfo.ticketID); */
    this._postDetailService.currentPostObjectSignal.set(mention.ticketInfo.ticketID);
    this._ticketService.postDetailWindowTrigger({
      replyVisible: true,
      openState: true,
      guid: this.postDetailTab.guid,
    });
    // this._cdr.detectChanges()
  }

  getCurrentFilter(): void {}

  checkIfTicketsRecieved(tabObj: TabSignalR): void {
    const tabindex = this.navService.fetchedTabList.findIndex(
      (obj) => obj.guid === this.postDetailTab?.guid
    );
    let genericFilter: GenericFilter;
    if (tabindex > -1) {
      // genericFilter = JSON.parse(
      //   this.navService.fetchedTabList[tabindex].filterJson
      // );
      genericFilter = JSON.parse(
        JSON.stringify(
          this._navigationService.getFilterJsonBasedOnTabGUID(this.postDetailTab?.tab?.guid)
        )
      );
    }

    const isWindowFocused = this.document.hasFocus() && !this.document.hidden;
    if (
      (this.currentAutoRenderSetting &&
        Number(this.currentAutoRenderSetting) ===
          AutoRenderTime.AskBeforeRender) ||
      (Number(this.currentAutoRenderSetting) !==
        AutoRenderTime.AskBeforeRender &&
        !isWindowFocused)
    ) {
      this.showDataFound = true;
      this.newDataFoundCount =
        this._ticketSignalrService.TicketSignalRObj.length;
      this.updateButtonZindex();
      if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled==1)
      {
        if (this.audioPlay && this.document.hidden) {

          if (!this.isFetchingData) {
            this.isFetchingData = true;
           this.audioPlayTimeout= setTimeout(() => {
              console.log("on new tab", this.document.hidden);
              const audio = new Audio('assets/audio/new-ticket.mp3');
              audio.play();
              this.isFetchingData = false;
            }, 5000);
          }
        }
      }else{
        if (this.audioPlay) {
          console.log("on new tab", this.document.hidden);
          const audio = new Audio('assets/audio/new-ticket.mp3');
          audio.play();
        }
      }
      this._cdr.detectChanges();
    } else {
      if (this.currentPostType === PostsType.Tickets) {
        // if (Number(tabObj.signalId) === 1)
        {
          const ticketArray = [];
          for (const tickets of this._ticketSignalrService.TicketSignalRObj) {
            ticketArray.push(+tickets.CaseID);
          }
          const ticketObj: Filter = {
            name: 'CD.CaseID',
            value: ticketArray,
            type: 2,
          };

        ticketArray?.length>0?  genericFilter.filters.push(ticketObj):'';
          if (Number(tabObj.signalId) !== 1) {
            this.closeTicket(tabObj.message.TicketID);
          }
          this.getTicketsByTicketId(genericFilter);

          // change filter count data
          const CountData = {
            MentionCount: null,
            tab: this.postDetailTab.tab,
            posttype: PostsType.Tickets,
          };
          // this._filterService.currentCountData.next(CountData);
          this._filterService.currentCountDataSignal.set(CountData);

        }
      } else if (this.currentPostType === PostsType.Mentions) {
        let ticketArray = [];
        for (const tickets of this._ticketSignalrService.TicketSignalRObj) {
          ticketArray.push(+tickets.CaseID);
        }
        ticketArray = ticketArray.filter((x) => x !== 0);
        const ticketObj: Filter = {
          name: 'CD.CaseID',
          value: ticketArray,
          type: 2,
        };
        if(ticketArray?.length>0)
          {
        ticketArray?.length > 0 ?   genericFilter.filters.push(ticketObj):'';
        if (Number(tabObj.signalId) !== 1) {
          this.closeTicket(tabObj.message.TicketID);
        }
        this.getMentionsByTicketId(genericFilter);

        // change filter count data
        // const CountData = {
        //   MentionCount: null,
        //   tab: this.postDetailTab.tab,
        //   posttype: PostsType.Tickets,
        // };
        this.getMentionsCount(this.filter);
      }
      }
    }
  }

  voipMentionReceived(){
    this.showDataFound = true;
    this.newDataFoundCount =
      this._ticketSignalrService.TicketSignalRObj.length;
    this.updateButtonZindex();
    if (!this.audioPlay) {
      const audio = new Audio('assets/audio/new-ticket.mp3');
      audio.play();
    }
  }

  getTicketsByTicketId(genericFilter: GenericFilter): void {
    this._ticketSignalrService.TicketSignalRObj = [];
    this.newDataFoundCount = 0;
    this.GetTicketsByTicketIdapi = this._ticketService.GetTicketsByTicketIds(genericFilter).subscribe(
      (resp) => {
        if (resp && resp.length > 0) {
          let currentTicketList = this.TicketList;
          if (this.currentPostType === PostsType.Tickets) {
            resp.forEach((ticket) => {
              currentTicketList = currentTicketList.filter(
                (obj) => obj.ticketInfo.ticketID !== ticket.ticketInfo.ticketID
              );
            });
          }

          this.postloader = false;
          const MentionList = JSON.parse(JSON.stringify(currentTicketList));
          MentionList.unshift(...resp);
          this.TicketList = [];
          this.TicketList = MentionList;
          this.showDataFound = false;
          this.bulkActionpanelStatus = false;
          this._chatBotService.chatPositionSignal.set({
            bulkActionpanelFlag: this.bulkActionpanelStatus,
            tabID: this.navService.currentSelectedTab?.guid,
          });
          console.log(
            `emit from SocialboxComponent => getTicketsByTicketId() => line 603. Check: bulkActionpanelFlag : `,
            this.bulkActionpanelStatus,
            ' tabID : ',
            this.navService.currentSelectedTab?.guid
          );
          this._cdr.detectChanges();
          // this.ticketsFound++;
          // console.log('TikcetList', this.TicketList);
        }
      },
      (err) => {
        // console.log(err);
        this.postloader = false;
        this._cdr.detectChanges();
      },
      () => {
        // console.log('call completed');
      }
    );
  }

  getMentionsByTicketId(genericFilter: GenericFilter): void {
    this._ticketSignalrService.TicketSignalRObj = [];
    this.newDataFoundCount = 0;
    this.getMentionByTicketIdapi = this._ticketService.getMentionByTicketIds(genericFilter).subscribe(
      (resp) => {
        if (resp && resp.length > 0) {
          let currentTicketList = this.TicketList;
          if (this.currentPostType === PostsType.Tickets) {
            resp.forEach((ticket) => {
              currentTicketList = currentTicketList.filter(
                (obj) => obj.ticketInfo.ticketID !== ticket.ticketInfo.ticketID
              );
            });
          }

          this.postloader = false;
          const MentionList = JSON.parse(JSON.stringify(currentTicketList));
          MentionList.unshift(...resp);
          this.TicketList = [];
          this.TicketList = MentionList;
          this._cdr.detectChanges();
          // this.ticketsFound++;
          // console.log('TikcetList', this.TicketList);
        }
      },
      (err) => {
        // console.log(err);
        this.postloader = false;
        this._cdr.detectChanges();
      },
      () => {
        // console.log('call completed');
      }
    );
  }

  loadNewData(): void {
    this.showDataFound = false;
    this.newDataFoundCount = 0;
    this._ticketSignalrService.TicketSignalRObj = [];
    this._ticketService.bulkMentionChecked = [];
    this._ticketService.selectedPostList = [];
    this._ticketService.postSelectTriggerSignal.set(0);
    if (this.isadvance) {
      this.filter = this._advanceFilterService.getGenericFilter();
    } else {
      // this.filter = this._filterService.getGenericFilter();
      this.filter = this._navigationService.getFilterJsonBasedOnTabGUID(
        this.postDetailTab.tab.guid
      );
    }

    if (this.currentUser?.data?.user?.role === UserRoleEnum.Agent && this.currentPostType == PostsType.Tickets) {
      if (this.currentUser?.data?.user?.actionButton?.seeAllTicketsEnabled) {

        if (this.filter?.filters?.some(
          (obj) => obj.name == "UsersWithTeam" && !obj?.value?.UserIDs?.includes(this.currentUser?.data?.user?.userId)
        )) {
          this.filter.filters = this.filter?.filters?.filter(
            (obj) => obj.name != "users"
          );
        } else {
          this.filter.filters = this.filter.filters.filter((obj) => obj.name !== 'UsersWithTeam')
          this.filter.filters.push({ name: "UsersWithTeam", type: 2, value: { UserIDs: [this.currentUser?.data?.user?.userId], TeamIds: [] } });
        }
      } else {
        this.filter.filters = this.filter.filters.filter((obj) => obj.name !== 'UsersWithTeam')
        this.filter.filters.push({ name: "UsersWithTeam", type: 2, value: { UserIDs: [this.currentUser?.data?.user?.userId], TeamIds: [] } });
      }
    }

    if (this.currentUser?.data?.user?.role === UserRoleEnum.Agent && this.currentPostType == PostsType.Mentions) {
      this.filter.filters = this.filter.filters.filter((obj) => obj.name !== 'UsersWithTeam')
    }


    const currentUser = JSON.parse(localStorage.getItem('user')).data;
    const currentUserRole = currentUser.user.role;
    const show = currentUser.user.userRole
      ? currentUser.user.userRole.isSelfAssigned
      : false;

    if (
      UserRoleEnum.CustomerCare === currentUserRole ||
      UserRoleEnum.BrandAccount === currentUserRole
    ) {
      if (show) {
        this.filter.filters = this.filter.filters.filter((obj) => obj.name !== 'UsersWithTeam')
        this.filter.filters.push({ name: "UsersWithTeam", type: 2, value: { UserIDs: [this.currentUser?.data?.user?.userId], TeamIds: [] } });
      }
    }

    if (this.currentPostType === PostsType.Tickets) {
      const CountData = {
        MentionCount: null,
        tab: this.postDetailTab.tab,
        posttype: PostsType.Tickets,
      };
      // this._filterService.currentCountData.next(CountData);
      this._filterService.currentCountDataSignal.set(CountData);

      this.GetTickets(this.filter, true);
    }
    if (this.currentPostType === PostsType.Mentions) {
      this.getMentionsCount(this.filter);
      this.getMentions(this.filter, true);
    }
  }

  public get postTypeEnum(): typeof PostsType {
    return PostsType;
  }

  initializePageComponent(tab?: Tab): void {
    let genricfilterObj;
    if (tab) {
      const filterJson = tab.filterJson ? JSON.parse(tab.filterJson) : null;
      if (filterJson) {
        genricfilterObj = filterJson as GenericFilter;
        if (genricfilterObj) {
          // this.firstFilterJson = tab.userID === -1 ? this.getDefaultTabJson(genricfilterObj) :  genricfilterObj;
          if (genricfilterObj.postsType) {
            this.currentPostType = genricfilterObj.postsType;
            if (this.currentPostType === PostsType.Tickets) {
              this.currentPageType = 'ticket';
              this.GetAssignmentLimit();
            }
            if (this.currentPostType === PostsType.Mentions) {
              this.currentPageType = 'mention';
            }
          }
        }
      }
    }
    this.subs.add(
      this._advanceFilterService.filterTabSource.subscribe((tabObj) => {
        if (tabObj) {
          if (tabObj.guid === tab.guid) {
            // if (tabObj.userID !== -1)
            // {
            // }
            // this.filter = this.firstFilterApply && genricfilterObj ? this.getDefaultTabJson(tabObj, genricfilterObj)
            // :  this._advanceFilterService.getGenericFilter();

            // reverseApply when it is first call
            this.filter =
              this.firstFilterApply && genricfilterObj
                ? this.reverseApplyGetFilter(tabObj.filterJson)
                : this._advanceFilterService.getGenericFilter();

            // console.log(`%c filter object -> ${JSON.stringify(this.filter)}`, 'background: #222; color: #bada55');
            // console.log(`%c start date ->  ${this.filter.startDateEpoch}`, 'background: #222; color: #bada55');
            // console.log(`%c end date -> ${this.filter.endDateEpoch}`, 'background: #222; color: #bada55');

            // this.filter = this._advanceFilterService.getGenericFilter();
            this.postDetailTab.tab.Filters = this.filter;

            this.firstFilterApply = false;
            if (this.filter.postsType === PostsType.Tickets) {
              this.currentPageType = 'ticket';
              this.currentPostType = this.filter.postsType;
              const CountData = {
                MentionCount: null,
                tab: this.postDetailTab.tab,
                posttype: PostsType.Tickets,
              };
              // this._filterService.currentCountData.next(CountData);
              this._filterService.currentCountDataSignal.set(CountData);

              this.GetTickets(this.filter, true);
            }
            if (this.filter.postsType === PostsType.Mentions) {
              this.currentPageType = 'mention';
              this.currentPostType = this.filter.postsType;
              this.getMentionsCount(this.filter);
              this.getMentions(this.filter, true);
            }
            this.isadvance = true;
          }
        }
      })
    );
  }

  getDefaultTabJson(tab: Tab, genericFilter: GenericFilter): GenericFilter {
    if (tab.userID === -1) {
      // const genfilterObj = this._filterService.getGenericFilter();
      const genfilterObj = this._navigationService.getFilterJsonBasedOnTabGUID(
        this.postDetailTab.tab.guid
      );
      genfilterObj.orderBYColumn = genericFilter.orderBYColumn;
      genfilterObj.orderBY = genericFilter.orderBY;
      genfilterObj.postsType = genericFilter.postsType;
      return genfilterObj;
    }
    return genericFilter;
  }

  reverseApplyGetFilter(filterJson: string): GenericFilter {
    const genericFilter: GenericFilter = JSON.parse(filterJson);
    if (genericFilter.isAdvance) {
      this._filterService.reverseApply(JSON.parse(filterJson));
      this._commonService.changeTabFilterJson();
      return this._advanceFilterService.getGenericFilter();
    } else {
      this._filterService.reverseApply(JSON.parse(filterJson));
      this._commonService.changeTabFilterJson();
      return this._filterService.getGenericFilter();
    }
  }

  private GetTickets(filterObj, firstCall) {
    this.startIndex = 0;
    this.endIndex = 15;
    this.noDataFound = false;
    this.postloader = true;
    this.scrollTopPixel = null;
    this.disableScrollPosition = null
    // if (this.ticketListSubscription) {
    //   this.ticketListSubscription.unsubscribe();
    // }
    this._cdr.detectChanges();
    // filterObj = this.checkAutoEnableforAgent(filterObj);
    // console.log(`%c filter object -> ${JSON.stringify(filterObj)}`, 'background: #222; color: #bada55');

    const user = this.currentUser?.data?.user;
    const hasLocationManagerChannel = filterObj?.filters?.some((filter) => filter?.name === "LocationManagerChannel");
    if (!hasLocationManagerChannel && user?.role === UserRoleEnum.LocationManager) {
      try {
        this.postloader = false;
        this.scrollApiCalled = false;
        this.nodataFoundLabel = 'No social channels are assigned to location';
        this.noDataFound = true;
        this.TicketList = [];
        this.postInput = { postlength: this.TicketList.length };
        this._ticketService.MentionListObj = [];
        this.showDataFound = false;
        this.bulkActionpanelStatus = false;
        this._chatBotService.chatPositionSignal.set({
          bulkActionpanelFlag: this.bulkActionpanelStatus,
          tabID: this.navService.currentSelectedTab?.guid,
        });
        this.stopInfiniteSCrolling = false;
        this.ticketsFound = this._ticketService.ticketsFound;
        this.pagerCount = this._ticketService.ticketsFound;
        if (firstCall) {
          if (this.paginator) {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          }
        }
      } catch (error) {}
      this._cdr.detectChanges();
    }
    else {
      this.ticketListSubscription = this._ticketService
        .GetTickets(filterObj)
        .subscribe(
          (resp) => {
            // console.log(`%c response object -> ${JSON.stringify(resp)}`, 'background: #222; color: #bada55');
            this.postloader = false;
            this.scrollApiCalled = false;
            if (
              (resp && resp.length === 0) ||
              resp == undefined ||
              resp == null
            ) {
              this.noDataFound = true;
              this.nodataFoundLabel = 'Tickets not found';
              resp = [];
            }
            this.postInput = { postlength: this.TicketList.length };
            this.TicketList = resp;
            this.TicketList = this.getUniqueListBy(this.TicketList, 'tagID');
            this._ticketService.MentionListObj = resp;
            this.showDataFound = false;
            this.bulkActionpanelStatus = false;
            this._chatBotService.chatPositionSignal.set({
              bulkActionpanelFlag: this.bulkActionpanelStatus,
              tabID: this.navService.currentSelectedTab?.guid,
            });
            console.log(
              `emit from SocialboxComponent => GetTickets() => line 920. Check: bulkActionpanelFlag : `,
              this.bulkActionpanelStatus,
              ' tabID : ',
              this.navService.currentSelectedTab?.guid
            );
            this.stopInfiniteSCrolling = false;
            // console.log('TikcetList', this.TicketList);
            this.ticketsFound = this._ticketService.ticketsFound;
            this.pagerCount = this._ticketService.ticketsFound;
            if (firstCall) {
              if (this.paginator) {
                this.paginator.pageIndex = 0;
                this.paginator._changePageSize(this.paginator.pageSize);
              }
            }
            this._cdr.detectChanges();
          },
          (err) => {
            this.stopInfiniteSCrolling = false;
            // console.log(err);
            this.postloader = false;
            this.noDataFound = true;
            this.nodataFoundLabel = 'Something went wrong';
            this.TicketList = [];
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Something went wrong. Please try again.',
              },
            });
            this._cdr.detectChanges();
          },
          () => {
            // console.log('call completed');
          }
        );
    }
  }

  OnPageChange(event: PageEvent): void {
    // console.log(event);
    if (this.isadvance) {
      this.filter = this._advanceFilterService.getGenericFilter();
    } else {
      // this.filter = this._filterService.getGenericFilter();
      this.filter = this._navigationService.getFilterJsonBasedOnTabGUID(
        this.postDetailTab.tab.guid
      );
    }
    this.pageIndex = event.pageIndex;
    this.filter.oFFSET = event.pageIndex * event.pageSize;
    this._cdr.detectChanges();
    if (event.pageIndex !== event.previousPageIndex) {
      if (this.currentPostType === PostsType.Tickets) {
        this.GetTickets(this.filter, false);
      } else if (this.currentPostType === PostsType.Mentions) {
        this.getMentions(this.filter, false);
      }
    }
    this._ticketService.paginator = this.paginator;
  }

  checkAutoEnableforAgent(filterObj: GenericFilter): GenericFilter {
    if (+this.currentUser.data.user.role === UserRoleEnum.Agent) {
      if (filterObj.brands) {
        for (const brand of filterObj.brands) {
          const autoindex = this._filterService.fetchedBrandData.findIndex(
            (obj) =>
              +obj.brandID === brand.brandID && obj.autoQueuingEnabled === 1
          );
          if (autoindex > -1) {
            // filterObj
            filterObj.filters = filterObj.filters.filter((obj) => {
              return obj.name !== 'users';
            });
            filterObj.filters = filterObj.filters.filter((obj) => {
              return obj.name !== 'UsersWithTeam';
            });

            filterObj.filters.push({
              name: 'UsersWithTeam',
              type: 2,
              value: {
                UserIDs: [+this.currentUser.data.user.userId],
                TeamIds: [],
              },
            });
            return filterObj;
          }
        }
      }
    }
    return filterObj;
  }

  ngOnDestroy(): void {
    // this._filterService.currentBrandSource.unsubscribe();
    if(this.voipSubs){
      this.voipSubs.unsubscribe()
    }
    this.subs.unsubscribe();
    if (this.ticketInterval) {
      clearInterval(this.ticketInterval);
    }
    this._cdr.detectChanges();
    if (this.audioPlayTimeout) {
      clearTimeout(this.audioPlayTimeout);
    }
    if (this.mentionsCountTimeout) {
      clearTimeout(this.mentionsCountTimeout);
    }
    if (this.getMentionsTimeout) {
      clearTimeout(this.getMentionsTimeout);
    }
    if (this.ticketStatusTimeout) {
      clearTimeout(this.ticketStatusTimeout);
    }
    this.clearAllSocialboxVariables();
  }

  private getMentions(filterObj:GenericFilter, firstCall): void {
    this.startIndex = 0;
    this.endIndex = 15;
    this.postloader = true;
    this.noDataFound = false;
    this.scrollTopPixel = null;
    this.disableScrollPosition = null
    // const removeBrandActFilter = this.removeBrandActivityIfBoth(filterObj);
    // if (this.mentionListSubscription) {
    //   this.mentionListSubscription.unsubscribe();
    // }
    this._cdr.detectChanges();
    const user = this.currentUser?.data?.user;
    const hasLocationManagerChannel = filterObj?.filters?.some((filter) => filter?.name === "LocationManagerChannel");
    if (!hasLocationManagerChannel && user?.role === UserRoleEnum.LocationManager) {
      try{
        this.scrollApiCalled = false;
        this.noDataFound = true;
        this.nodataFoundLabel = 'No social channels are assigned to location';
        this.TicketList = [];
        this._ticketService.MentionListObj = this.TicketList;
        this.showDataFound = false;
        this.postInput = { postlength: this.TicketList.length };
        this.stopInfiniteSCrolling = false;
        this.bulkActionpanelStatus = false;
        if (firstCall) {
          if (this.paginator) {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          }
        }
        // this.ticketsFound = this._ticketService.ticketsFound;
        this.postloader = false;
      }
      catch(error){}
      this._cdr.detectChanges();
    }
    else {
      this.mentionListSubscription = this._ticketService
        .getMentionList(filterObj)
        .subscribe(
          (data) => {
            this.scrollApiCalled = false;
            if (
              (data && data.length === 0) ||
              data == undefined ||
              data == null
            ) {
              this.noDataFound = true;
              this.nodataFoundLabel = 'Mentions not found';
              this.TicketList = [];
              data = [];
            }
            this.TicketList = data;
            this.TicketList = this.getUniqueListBy(this.TicketList, 'tagID');
            this._ticketService.MentionListObj = this.TicketList;
            this.showDataFound = false;
            this.postInput = { postlength: this.TicketList.length };
            this.stopInfiniteSCrolling = false;
            this.bulkActionpanelStatus = false;
            // this.ticketsFound = data.length;
            if (firstCall) {
              if (this.paginator) {
                this.paginator.pageIndex = 0;
                this.paginator._changePageSize(this.paginator.pageSize);
              }
            }
            // this.ticketsFound = this._ticketService.ticketsFound;
            this.postloader = false;
            this._cdr.detectChanges();
          },
          (err) => {
            // console.log(err);
            this.stopInfiniteSCrolling = false;
            this.postloader = false;
            this.noDataFound = true;
            this.nodataFoundLabel = 'Something went wrong';
            this.TicketList = [];
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Something went wrong. Please try again.',
              },
            });
            this._cdr.detectChanges();
          },
          () => {
            // console.log('call completed');
          }
        );
    }
    
    // this.showTabView = this._navigationService.currentSelectedTab.Filters.simpleSearch ? true : false
    this.selectedItem = filterObj.filters.some((obj) => obj.name == 'isbrandactivity' && obj.value.includes(2)) ? 2 :1
  }

  private getMentionsCount(filterObj): void {
    // this.postloader = true;
    if (this.mentionCountSubscription) {
      this.mentionCountSubscription.unsubscribe();
    }
    this.checkWhichActionIsClicked(filterObj);
    const removeBrandActivity = this.removeBrandActivity(filterObj);
    const user = this.currentUser?.data?.user;
    const hasLocationManagerChannel = filterObj?.filters?.some((filter) => filter?.name === "LocationManagerChannel");
    if (!hasLocationManagerChannel && user?.role === UserRoleEnum.LocationManager) { 
      this.resetMentionCount({
        "userActivityCount": 0,
        "brandActivityCount": 0,
        "actionable": 0,
        "nonActinable": 0,
        "brandPost": 0,
        "brandReply": 0,
        "totalRecords": 0,
        "userActivityGroupCount": 0,
        "brandActivityGroupCount": 0,
        "totalUnreadMentions": 0
      })
    }
    else{
      this.mentionCountSubscription = this._ticketService
        .getMentionCount(removeBrandActivity)
        .subscribe((data) => {
          // this.TicketList = data;
          // this._filterService.filterFirstTimeDataCount.next({
          //   data: data,
          //   guid: this.postDetailTab.guid,
          //   ticketType: PostsType.Mentions,
          // });
          const CountData = {
            MentionCount: data,
            tab: this.postDetailTab.tab,
            posttype: PostsType.Mentions,
          };
          // this._filterService.currentCountData.next(CountData);
          this._filterService.currentCountDataSignal.set(CountData);

          if (data && data.totalRecords) {
            if (this.useractivity) {
              if (this.actionchk && this.nonactionchk) {
                this.pagerCount = data.userActivityCount;
                this.ticketsFound = data.userActivityCount;
                if (this.mentionOrGroupView == AllMentionGroupView.mentionView) {
                  this._tabService.headerTabCountObsSignal.set({ guid: this.postDetailTab?.guid, count: this.ticketsFound })
                } else {
                  this.ticketsFound = data.userActivityGroupCount
                  this._tabService.unseenTabCountObs.next({ guid: this.postDetailTab?.guid, count: data.totalUnreadMentions })
                }
              } else if (this.actionchk && this.nonactionchk === false) {
                this.pagerCount = data.actionable;
                this.ticketsFound = data.actionable;
              } else if (this.nonactionchk && this.actionchk === false) {
                this.pagerCount = data.nonActinable;
                this.ticketsFound = data.nonActinable;
              }
            } else if (this.brandactivity) {
              if (this.brandpost && this.brandreply) {
                this.pagerCount = data.brandActivityCount;
                this.ticketsFound = data.brandActivityCount;
                if (this.mentionOrGroupView == AllMentionGroupView.mentionView) {
                  this._tabService.headerTabCountObsSignal.set({ guid: this.postDetailTab?.guid, count: this.ticketsFound })
                } else {
                  this.ticketsFound = data.brandActivityGroupCount
                  this._tabService.unseenTabCountObs.next({ guid: this.postDetailTab?.guid, count: data.totalUnreadMentions })
                }
              } else if (this.brandpost && this.brandreply === false) {
                this.pagerCount = data.brandPost;
                this.ticketsFound = data.brandPost;
              } else if (this.brandreply && this.brandpost === false) {
                this.pagerCount = data.brandReply;
                this.ticketsFound = data.brandReply;
              }
            } else {
              this.pagerCount = data.userActivityCount;
              this.ticketsFound = data.userActivityCount;
            }
            this._cdr.detectChanges();
          }
          // this.postloader = false;
        });
    }
  }

  toggleBulkSelect(selectedPost: [boolean, number]): void {
    if (selectedPost[0] === true) {
      this._ticketService.selectedPostList.push(+selectedPost[1]);
      this._ticketService.postSelectTriggerSignal.set(
        this._ticketService.selectedPostList.length
      );
    } else {
      const index = this._ticketService.selectedPostList.indexOf(
        +selectedPost[1]
      );
      if (index > -1) {
        this._ticketService.selectedPostList.splice(index, 1);
        this._ticketService.postSelectTriggerSignal.set(
          this._ticketService.selectedPostList.length
        );
      }
    }
    this.bulkActionpanelStatus =
      this._ticketService.selectedPostList.length >= 2 ? true : false;
    // Add class for chatbot icon position
    if (this._ticketService.selectedPostList.length >= 2) {
      //this._chatBotService.chatPosition.next(true);
      this._chatBotService.chatPositionSignal.set({
        bulkActionpanelFlag: true,
        tabID: this.navService.currentSelectedTab?.guid,
      });
    } else {
      this._chatBotService.chatPositionSignal.set({
        bulkActionpanelFlag: false,
        tabID: this.navService.currentSelectedTab?.guid,
      });
    }
    console.log(
      `emit from SocialboxComponent => toggleBulkSelect(selectedPost: [boolean, number]) => line 856. Check: ${
        this._ticketService.selectedPostList.length >= 2
      }`
    );
    const totalCount = this.getTicketsCheckboxCount();
    if (totalCount == this._ticketService.selectedPostList.length) {
      this.checkAllCheckBox = true;
    }else
    {
        this.checkAllCheckBox = false;
    }
    this._cdr.detectChanges();
  }

  getTicketsCheckboxCount(): number {
    let count = 0;
    this._ticketService.MentionListObj.forEach((obj) => {
      let ticketHistoryData = this._footService.SetUserRole(
        this.currentPostType,
        {},
        this.currentUser,
        obj
      );
      ticketHistoryData = this._footService.SetBulkCheckbox(
        this.currentPostType,
        this.currentUser,
        ticketHistoryData,
        obj
      );
      if (ticketHistoryData && ticketHistoryData.showcheckbox) {
        count++;
      }
    });
    return count;
  }

  postActionClicked(data: any): void {
    if (data.post) {
      if (data.operation) {
        if (data.operation === PostActionType.Close) {
          this.closeTicket(data.post.ticketInfo.ticketID);
        }else if (data.operation === PostActionType.escalate) {
          this.closeTicket(data.post.ticketInfo.ticketID);
        }
         else if (data.operation === PostActionType.onhold) {
        }
      }
    }
  }

  closeTicket(ticketID): void {
    const ticketIndex = this.TicketList.findIndex(
      (obj) => obj.ticketInfo.ticketID === ticketID
    );
    if (ticketIndex > -1) {
      this.TicketList.splice(ticketIndex, 1);
      --this.ticketsFound;
      if (this.currentPostType === PostsType.Tickets) {
        const CountData = {
          MentionCount: null,
          tab: this.postDetailTab.tab,
          posttype: PostsType.Tickets,
        };
        // this._filterService.currentCountData.next(CountData);
        this._filterService.currentCountDataSignal.set(CountData);

      }
      if (this.currentPostType === PostsType.Mentions) {
        this.getMentionsCount(this.filter);
      }
      this.ticketsFound == 0 ? (this.noDataFound = true) : '';
      this._ticketService.MentionListObj=this.TicketList;
      this._cdr.detectChanges();
    }
  }

  closeTicketWithoutCount(ticketID): void {
    const ticketIndex = this.TicketList.findIndex(
      (obj) => obj.ticketInfo.ticketID === ticketID
    );
    if (ticketIndex > -1 && !(this.TicketList[ticketIndex].ticketInfo['isApiActionError'])) {
      this.TicketList.splice(ticketIndex, 1);
      if (this.currentPostType === PostsType.Mentions) {
        // this.getMentionsCount(this.filter);
      }
      this.ticketsFound == 0 ? (this.noDataFound = true) : '';
      this._cdr.detectChanges();
    }
  }

  closeMention(ticketId): void {
    const ticketIndex = this.TicketList.findIndex(
      (obj) => obj.ticketInfo.ticketID === ticketId
    );
    if (ticketIndex > -1) {
      if (this.currentPostType === PostsType.Mentions) {
        this.TicketList.splice(ticketIndex, 1);
        --this.ticketsFound;
        this._cdr.detectChanges();
        this.getMentionsCount(this.filter);
      }
    }
  }

  postBulkAction(event): void {
    if (event === 'dismiss') {
      this.bulkActionpanelStatus = false;

      this._chatBotService.chatPositionSignal.set({
        bulkActionpanelFlag: false,
        tabID: this.navService.currentSelectedTab?.guid,
      });
      console.log(
        `emit from SocialboxComponent => postBulkAction(event) => line 909. Check: ${
          this._ticketService.selectedPostList.length >= 2
        }`
      );

      this.refreshcountafterbulk();
    } else if (event === 'selectAll') {
      this._ticketService.bulkMentionChecked = [];
      this._ticketService.selectedPostList = [];
      if (this.checkAllCheckBox) {
        this.checkAllCheckBox = false;
      } else {
        this.checkAllCheckBox = true;
      }
      /* this._ticketService.bulkCheckboxObs.next({ guid: this.postDetailTab?.guid, checked: this.checkAllCheckBox }) */
      this._ticketService.bulkCheckboxObsSignal.set({ guid: this.postDetailTab?.guid, checked: this.checkAllCheckBox })
      for (const ticket of this.TicketList) {
        if (this.checkAllCheckBox) {
          let ticketHistoryData = this._footService.SetUserRole(
            this.currentPostType,
            {},
            this.currentUser,
            ticket
          );
          ticketHistoryData = this._footService.SetBulkCheckbox(
            this.currentPostType,
            this.currentUser,
            ticketHistoryData,
            ticket
          );
          if (ticketHistoryData && ticketHistoryData.showcheckbox) {
            const obj: BulkMentionChecked = {
              guid: this._navigationService.currentSelectedTab.guid,
              mention: ticket,
            };
            this._ticketService.bulkMentionChecked.push(obj);
            this._ticketService.selectedPostList.push(
              ticket.ticketInfo.ticketID
            );
          }
        } else {
          // this._ticketService.postSelectTrigger.next(
          //   this._ticketService.selectedPostList.length
          // );
        }
        // this.ShowHideButtonsFromTicketStatus();
        // this.postSelectEvent.emit([checked, id]);
      }
      this.bulkActionpanelStatus =
        this._ticketService.selectedPostList.length >= 2 ? true : false;
      this._chatBotService.chatPositionSignal.set({
        bulkActionpanelFlag: this.bulkActionpanelStatus,
        tabID: this.navService.currentSelectedTab?.guid,
      });
      console.log(
        `emit from SocialboxComponent => postBulkAction(event === 'selectAll') => line: 1284. Check: bulkActionpanelFlag : `,
        this.bulkActionpanelStatus,
        ' tabID : ',
        this.navService.currentSelectedTab?.guid
      );
      if (this.currentPostType != this.postTypeEnum.Mentions) {
        this._replyService.ShowHideButtonsFromTicketStatus(this.currentUser);
        this._replyService.ticketBulkOptionUpdate.next(true);
      } else {
        this._replyService.bulkActionButtons = {};
        this._replyService.bulkActionButtons.btnbulktagging = true;
        this._replyService.bulkActionButtons.btnbulkdelete = true;
        this._replyService.bulkActionButtons.btnbulkdeletefromchannel = true;
        const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
          (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
        );
        const isbrandpost = [];
        for (const checkedticket of SelectedTickets) {
          if (checkedticket.mention.isBrandPost) {
            isbrandpost.push('1');
          }
        }
        if (isbrandpost.length <= 0) {
          this._replyService.bulkActionButtons.btnbulkdirectclose = true;
        }
        this._replyService.bulkActionButtons.btncreatesingleticket = false;
        this._replyService.bulkActionButtons.btnattachticketbulk = false;
      }

      const CheckedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
      if (CheckedTickets.length > 1) {
        const forapproval = CheckedTickets.filter(
          (s) =>
            s.mention.makerCheckerMetadata.workflowStatus ===
            LogStatus.ReplySentForApproval
        );
        if (forapproval.length > 1) {
          // show makerchecker approve and reject
          this._replyService.bulkActionButtons.btnbulkreplyapproved = true;
          this._replyService.bulkActionButtons.btnbulkreplyrejected = true;
        } else {
          // hide makerchecker approve/reject
          this._replyService.bulkActionButtons.btnbulkreplyapproved = false;
          this._replyService.bulkActionButtons.btnbulkreplyrejected = false;
        }
      } else {
      }

      this._ticketService.postSelectTriggerSignal.set(
        this._ticketService.selectedPostList.length
      );
    } else if (event === 'hideactionpanel') {
      this._ticketService.bulkMentionChecked = [];
      this._ticketService.selectedPostList = [];
      this.checkAllCheckBox = false;
      this.bulkActionpanelStatus = false;
      this._ticketService.unselectbulkpostTrigger.next(false);

      this._chatBotService.chatPositionSignal.set({
        bulkActionpanelFlag: false,
        tabID: this.navService.currentSelectedTab?.guid,
      });
      this._ticketService.uncheckedSelectedTickets.next(this.postDetailTab?.tab?.guid)
      console.log(
        `emit from SocialboxComponent => postBulkAction(event) => line: 1330. Check: bulkActionpanelFlag : `,
        false,
        ' tabID : ',
        this.navService.currentSelectedTab?.guid
      );
    } else if (event =='qualifiedMention')
    {
      this._ticketService.bulkMentionChecked = [];
      this._ticketService.selectedPostList = [];
        this.checkAllCheckBox = true;
      /* this._ticketService.bulkCheckboxObs.next({ guid: this.postDetailTab?.guid, checked: this.checkAllCheckBox }) */
      this._ticketService.bulkCheckboxObsSignal.set({ guid: this.postDetailTab?.guid, checked: this.checkAllCheckBox })
      for (const ticket of this.TicketList) {
        if (this.checkAllCheckBox) {
          let ticketHistoryData = this._footService.SetUserRole(
            this.currentPostType,
            {},
            this.currentUser,
            ticket
          );
          ticketHistoryData = this._footService.SetBulkCheckbox(
            this.currentPostType,
            this.currentUser,
            ticketHistoryData,
            ticket
          );
          if (ticketHistoryData && ticketHistoryData.showcheckbox) {
            const obj: BulkMentionChecked = {
              guid: this._navigationService.currentSelectedTab.guid,
              mention: ticket,
            };
            this._ticketService.bulkMentionChecked.push(obj);
            this._ticketService.selectedPostList.push(
              ticket.ticketInfo.ticketID
            );
          }
        } else {
          // this._ticketService.postSelectTrigger.next(
          //   this._ticketService.selectedPostList.length
          // );
        }
        // this.ShowHideButtonsFromTicketStatus();
        // this.postSelectEvent.emit([checked, id]);
      }
      this._ticketService.postSelectTriggerSignal.set(
        this._ticketService.selectedPostList.length
      );
    }
    this._cdr.detectChanges();
  }

  removeBrandActivity(genericFilter: GenericFilter): GenericFilter {
    const filterObj = JSON.parse(JSON.stringify(genericFilter));
    if (filterObj.filters.length > 0) {
      filterObj.filters = filterObj.filters.filter((obj) => {
        return obj.name !== 'users';
      });
      filterObj.filters = filterObj.filters.filter((obj) => {
        return obj.name !== 'UsersWithTeam';
      });
      filterObj.filters = filterObj.filters.filter((obj) => {
        return obj.name !== 'isbrandactivity';
      });
      filterObj.filters = filterObj.filters.filter((obj) => {
        return obj.name !== 'isactionable';
      });
      filterObj.filters = filterObj.filters.filter((obj) => {
        return obj.name !== 'brandpostorreply';
      });
    }
    return filterObj;
  }

  removeBrandActivityIfBoth(genericFilter: GenericFilter): GenericFilter {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    const filterObj = JSON.parse(JSON.stringify(genericFilter));
    if (filterObj.filters.length > 0) {
      // remove user filter
      filterObj.filters = filterObj.filters.filter((obj) => {
        return obj.name !== 'users';
      });
      filterObj.filters = filterObj.filters.filter((obj) => {
        return obj.name !== 'UsersWithTeam';
      });

      const brandindex = filterObj.filters.findIndex(
        (obj) => obj.name === 'isbrandactivity'
      );
      if (brandindex > -1) {
        const actionableindex = filterObj.filters.findIndex(
          (obj) => obj.name === 'isactionable'
        );

        if (actionableindex > -1) {
          if (filterObj.filters[actionableindex].value.length > 1) {
            // filterObj.filters = filterObj.filters.filter(obj => {
            //   return obj.name !== 'isbrandactivity';
            // });
            filterObj.filters = filterObj.filters.filter((obj) => {
              return obj.name !== 'isactionable';
            });
          }
        }

        const brandpostindex = filterObj.filters.findIndex(
          (obj) => obj.name === 'brandpostorreply'
        );

        if (brandpostindex > -1) {
          if (filterObj.filters[brandpostindex].value.length > 1) {
            // filterObj.filters = filterObj.filters.filter(obj => {
            //   return obj.name !== 'isbrandactivity';
            // });
            filterObj.filters = filterObj.filters.filter((obj) => {
              return obj.name !== 'brandpostorreply';
            });
          }
        }
      }
    }

    return filterObj;
  }

  checkWhichActionIsClicked(genericFilter: GenericFilter): GenericFilter {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    const filterObj = JSON.parse(JSON.stringify(genericFilter));
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    const checkBrandpostorreply = filterObj.filters.find(res => res.name != 'brandpostorreply') 
    if (checkBrandpostorreply) {
      this.brandpost = true;
      this.brandreply = true;
    }
    const checkisactionableReply = filterObj.filters.find(res => res.name != 'isactionable')
    if (checkisactionableReply) {
      this.actionchk = true;
      this.nonactionchk = true;
    }
    for (let i = 0; i < filterObj.filters.length; i++) {
      if (filterObj.filters[i].name === 'isbrandactivity') {
        if (
          filterObj.filters[i].value &&
          filterObj.filters[i].value.length > 0
        ) {
          this.brandactivity = filterObj.filters[i].value.includes(1);
          this.useractivity = filterObj.filters[i].value.includes(2);
        }
      }
      if (filterObj.filters[i].name === 'isactionable') {
        if (
          filterObj.filters[i].value &&
          filterObj.filters[i].value.length > 0
        ) {
          this.actionchk = filterObj.filters[i].value.includes(1);
          this.nonactionchk = filterObj.filters[i].value.includes(0);
        }
      }
      if (filterObj.filters[i].name === 'brandpostorreply') {
        if (
          filterObj.filters[i].value &&
          filterObj.filters[i].value.length > 0
        ) {
          this.brandpost = filterObj.filters[i].value.includes(0);
          this.brandreply = filterObj.filters[i].value.includes(1);
        }
      }
    }
    return filterObj;
  }

  testingMention(): void {
    // const MentionList =  JSON.parse(JSON.stringify(this.TicketList));
    // MentionList.unshift(...this._ticketService.testingMentionObj);
    // this.TicketList = [];
    // this.TicketList = MentionList;
    this.TicketList.splice(0, 1);
  }
  autoRenderData(): void {
    this.showDataFound = false;

    if (this.isadvance) {
      this.filter = this._advanceFilterService.getGenericFilter();
    } else {
      // this.filter = this._filterService.getGenericFilter();
      this.filter = this._navigationService.getFilterJsonBasedOnTabGUID(
        this.postDetailTab.tab.guid
      );
    }

    if (this.currentPostType === PostsType.Tickets) {
      const CountData = {
        MentionCount: null,
        tab: this.postDetailTab.tab,
        posttype: PostsType.Tickets,
      };
      // this._filterService.currentCountData.next(CountData);
      this._filterService.currentCountDataSignal.set(CountData);

      this.GetTickets(this.filter, true);
    }
    if (this.currentPostType === PostsType.Mentions) {
      this.getMentionsCount(this.filter);
      this.getMentions(this.filter, true);
    }
    this._cdr.detectChanges();
  }

  // openCofirmDialog(): void {
  //   console.log('dialog called');
  //   const message = `By choosing to the delete action,
  // please note that the reply to customers previously published by the SSRE will also be erased from your configured platforms as well.?`;
  //   const dialogData = new AlertDialogModel('Would you like to delete the SSRE reply?', message, 'Keep SSRE Reply','Delete SSRE Reply');
  //   const dialogRef = this.dialog.open(AlertPopupComponent, {
  //     disableClose: true,
  //     autoFocus: false,
  //     data: dialogData
  //   });

  //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     this.result = dialogResult;
  //     if(dialogResult){
  //       console.log(this.result);
  //     }else{
  //       console.log(this.result);
  //     }
  //   });
  // }

  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  refreshcountafterbulk(): void {
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    for (const checkedticket of chkTicket) {
      const ticketIndex = this.TicketList.findIndex(
        (obj) =>
          obj.ticketInfo.ticketID === checkedticket.mention.ticketInfo.ticketID
      );
      if (ticketIndex > -1) {
        this.TicketList.splice(ticketIndex, 1);
        --this.ticketsFound;
      }
    }
    this._ticketService.bulkMentionChecked = [];
    this._ticketService.selectedPostList = [];
    this._ticketService.postSelectTriggerSignal.set(
      this._ticketService.selectedPostList.length
    );
    if (this.currentPostType === PostsType.Tickets) {
      const CountData = {
        MentionCount: null,
        tab: this.postDetailTab.tab,
        posttype: PostsType.Tickets,
      };
      // this._filterService.currentCountData.next(CountData);
      this._filterService.currentCountDataSignal.set(CountData);

    }
    if (this.currentPostType === PostsType.Mentions) {
      this.getMentionsCount(this.filter);
    }
    this._cdr.detectChanges();
  }

  public get PostActionEnum(): typeof PostActionEnum {
    return PostActionEnum;
  }

  CheckAssignmentLimit(): any {
    const brands = this._filterService.fetchedBrandData;

    for (const brandobj of brands) {
      let brand = '';
      let currntlyassignedtickets = 0;
      let MaxAssignmenLimit = 0;
      let UserQueueSize = 0;
      let AutoQueuingEnabled = false;
      let AgentAutoQueuingEnabled = true;
      if (typeof this.AssignmentLimitData !== 'undefined') {
        if (
          typeof this.AssignmentLimitData.TotalAssignedTicketsList !==
            'undefined' &&
          this.AssignmentLimitData.TotalAssignedTicketsList.length > 0
        ) {
          if (
            this.AssignmentLimitData.TotalAssignedTicketsList.filter(
              (x) => x.brandID === +brandobj.brandID
            ).length > 0
          ) {
            const assignData =
              this.AssignmentLimitData.TotalAssignedTicketsList.filter(
                (x) => x.brandID === +brandobj.brandID
              );

            if (assignData.length > 0) {
              AgentAutoQueuingEnabled = assignData[0].isAutoAssignment;
              currntlyassignedtickets = assignData[0].pendingCount;
              UserQueueSize = assignData[0].queueSize;
            } else {
              currntlyassignedtickets = 0;
            }
          } else {
            currntlyassignedtickets = 0;
          }
        } else {
          currntlyassignedtickets = 0;
        }

        if (
          typeof this.AssignmentLimitData.BrandMaxAssignLimitsList !==
            'undefined' &&
          this.AssignmentLimitData.BrandMaxAssignLimitsList.length > 0
        ) {
          if (
            this.AssignmentLimitData.BrandMaxAssignLimitsList.filter(
              (x) => x.brandID === +brandobj.brandID
            ).length > 0
          ) {
            const maxData =
              this.AssignmentLimitData.BrandMaxAssignLimitsList.filter(
                (x) => x.brandID === +brandobj.brandID
              );

            if (maxData.length > 0) {
              AutoQueuingEnabled = maxData[0].autoQueuingEnabled;
              brand = maxData[0].brandFriendlyName;
              MaxAssignmenLimit = maxData[0].maxAssignmentLimit;
            } else {
              MaxAssignmenLimit = 0;
            }
          } else {
            MaxAssignmenLimit = 0;
          }
        } else {
          MaxAssignmenLimit = 0;
        }
        if (AutoQueuingEnabled) {
          if (AgentAutoQueuingEnabled) {
            if (
              currntlyassignedtickets >= MaxAssignmenLimit &&
              MaxAssignmenLimit > 0
            ) {
              if (brand) {
                this.BrandFriendlyName.push(brand);
                console.log(
                  'data ' + currntlyassignedtickets + '  ' + MaxAssignmenLimit
                );
              }
            }
          }
        }
      }
    }
    if (
      this.BrandFriendlyName.length > 0 &&
      (this.currentUser.data.user.role === UserRoleEnum.Agent ||
        this.currentUser.data.user.role === UserRoleEnum.TeamLead)
    ) {
      this.assignmentlimitmsg = true;
      //this._chatBotService.chatPosition.next(this.assignmentlimitmsg);
      this._chatBotService.chatPositionSignal.set({
        assignmentLimitMsgFlag: this.assignmentlimitmsg,
        tabID: this.navService.currentSelectedTab?.guid,
      });
    } else {
      this.assignmentlimitmsg = false;

      this._chatBotService.chatPositionSignal.set({
        assignmentLimitMsgFlag: this.assignmentlimitmsg,
        tabID: this.navService.currentSelectedTab?.guid,
      });
    }
    console.log(
      `emit from SocialboxComponent => CheckAssignmentLimit() => line: 1498. Check: ${
        this.BrandFriendlyName.length > 0 &&
        (this.currentUser.data.user.role === UserRoleEnum.Agent ||
          this.currentUser.data.user.role === UserRoleEnum.TeamLead)
      }`
    );
    localStorage.setItem(
      'assignmentlimitmsg',
      JSON.stringify(this.assignmentlimitmsg)
    );
    this._cdr.detectChanges();
  }

  GetAssignmentLimit(): any {
    if (
      this.currentUser?.data?.user?.role === UserRoleEnum.Agent ||
      this.currentUser?.data?.user?.role === UserRoleEnum.TeamLead
    ) {
      this.filter = this._navigationService.getFilterJsonBasedOnTabGUID(
        this.postDetailTab.tab.guid
      );
      this.GetAssignmentLimitapi = this._ticketService
        .GetTicketMultipleBrands_userwise_COUNT(this.filter)
        .subscribe((result) => {
          this.AssignmentLimitData.TotalAssignedTicketsList =
            result.data.totalAssignedTicketsList;
          this.AssignmentLimitData.BrandMaxAssignLimitsList =
            result.data.brandMaxAssignLimitsList;
          this.CheckAssignmentLimit();
        });
    }
  }

  private GetTicketsInfiniteScrolling(filterObj): void {
    this.infinteLoader = true;
    this._cdr.detectChanges();
    this.ticketListSubscription = this._ticketService
      .GetTickets(filterObj)
      .subscribe(
        (resp) => {
          this.scrollApiCalled = true;
          this.infinteLoader = false;
          if (
            (resp && resp.length === 0) ||
            resp == undefined ||
            resp == null
          ) {
            this.stopInfiniteSCrolling = true;
            return;
          } else {
            this.TicketList =
              this.TicketList.length == 0 ? resp : this.TicketList.concat(resp);
            this.TicketList = this.getUniqueListBy(this.TicketList, 'tagID');
            this._ticketService.MentionListObj = this.TicketList;
            this.postInput = { postlength: this.TicketList.length };
            // this.ticketsFound = this._ticketService.ticketsFound;
            this.pagerCount = this._ticketService.ticketsFound;
            this.stopInfiniteSCrolling = false;
            if (this.checkAllCheckBox) {
              this.checkAllCheckBox = false;
              this.postBulkAction('selectAll');
            }
          }
          this._cdr.detectChanges();
        },
        (err) => {
          this.infinteLoader = false;
          this._cdr.detectChanges();
        },
        () => {}
      );
  }

  private getMentionsInfiniteScrolling(filterObj): void {
    this.infinteLoader = true;
    this._cdr.detectChanges();
    // const removeBrandActFilter = this.removeBrandActivityIfBoth(filterObj);
    this.getMentionListInfiniteapi = this._ticketService.getMentionList(filterObj).subscribe(
      (data) => {
        this.scrollApiCalled = true;
        this.infinteLoader = false;
        if ((data && data.length === 0) || data == undefined || data == null) {
          this.stopInfiniteSCrolling = true;
          return;
        } else {
          this.TicketList =
            this.TicketList.length == 0 ? data : this.TicketList.concat(data);
          this.TicketList = this.getUniqueListBy(this.TicketList, 'tagID');
          this._ticketService.MentionListObj = this.TicketList;
          this.postInput = { postlength: this.TicketList.length };
          this.stopInfiniteSCrolling = false;
          if (this.checkAllCheckBox) {
            this.checkAllCheckBox = false;
            this.postBulkAction('selectAll');
          }
        }
        this._cdr.detectChanges();
      },
      (err) => {
        this.infinteLoader = false;
        this._cdr.detectChanges();
      },
      () => {}
    );
  }

  scrollEvent(event) {}
  scrollBottomToTop() {
    this.startIndex = 0;
    this.endIndex = 15;
    // console.log('scroll ' + this.scroll.nativeElement.scrollHeight);
    // console.log(this.scroll.nativeElement.scrollTop);
    // this.socialBoxDiv.nativeElement.scrollTop = 0;
    this.document.getElementById('post_reply').scrollIntoView({behavior:'smooth'})
    this._cdr.detectChanges();
  }

  trackByTicket(index: number, ticket: BaseMention): any {
    return ticket.ticketID + ticket.tagID + ticket.ticketInfo.status;
  }

  resumeAssignment() {
    this.AgentAssignmentResumedapi = this._accountService.AgentAssignmentResumed().subscribe((result) => {
      if (result.success) {
        localStorage.removeItem('IsUserAssignmentDisabled');
        localStorage.setItem('IsUserAssignmentDisabled', '0');
        this.showResumeAssignment = false;
        this._accountService.isUserAssignmentEnable.next({
          IsUserAssignmentDisabled: 0,
        });
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('AssignmentResumedSuccess'),
          },
        });
        this._cdr.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: result.message ? result.message : this.translate.instant('UnableToResumeAssignment'),
          },
        });
      }
    });
  }

  selectTab(item):void{

    const filterObj = this._navigationService.getFilterJsonBasedOnTabGUID(
      this.postDetailTab.tab.guid
    );
    if (
      filterObj.filters.some(
        (obj) =>
          obj.name == 'SSREStatus' ||
          obj.name == 'TicketActionStatus' ||
          obj.name == 'FeedbackRating'
      )
    ) {
      // this._filterService.removeAllAppliedFiltersObs.next({
      //   guid: this.postDetailTab.guid,
      //   flag: true,
      // });
      this._filterService.removeAllAppliedFiltersObsSignal.set({
        guid: this.postDetailTab.guid,
        flag: true,
      })
    } else if (filterObj.filters.some((obj) => obj.name == 'isbrandactivity')) {
      this._filterService.setHighlightedMentionItem.next(item.dbValue);
    }
    this._ticketService.selectedPostList = [];
    this._ticketService.postSelectTriggerSignal.set(0);
    this._ticketService.bulkMentionChecked = [];
    if (this.currentPostType === PostsType.Tickets) {
      this._navigationService.currentSelectedTab.Filters.ticketType = [item.dbValue];
      this._filterService.setTicketTypeObsSignal.set(item.dbValue);
      // this._filterService.setTicketType(+tickettype);
      const tabevent: TabEvent = {
        tab: this.postDetailTab.tab,
        event: FilterEvents.ticketType,
        value: +item.dbValue,
      };
      this._filterService.filterTabSignal.set(tabevent);

      this._commonService.changeTabFilterJson();
      // this._filterService.filterTabSource.next(this.postDetailTab.tab);
      this._filterService.filterTabSourceSignal.set(this.postDetailTab.tab);
      this.selectedItem = item.dbValue;
      if (+item.level === 2) {
        this.selectedTicketOption = {
          label: item.name,
          dbvalue: item.dbValue,
        };
      } else {
        this.selectedTicketOption = {
          label: "More",
          dbvalue: null
        }
      }
    } else {
      this.selectedItem = item;
      this._navigationService.currentSelectedTab.Filters.filters.forEach((obj) => {
        if (obj.name == 'isbrandactivity') {
          obj.value = [item]
        }
      })
      if (item == 2) {
        this.actionchk = true;
        this.nonactionchk = true;
        this._navigationService.currentSelectedTab.Filters.filters = this._navigationService.currentSelectedTab.Filters.filters.filter((obj) =>
          obj.name !== 'brandpostorreply'
        )
      } else {
        this.brandpost = true;
        this.brandreply = true;
        this._navigationService.currentSelectedTab.Filters.filters = this._navigationService.currentSelectedTab.Filters.filters.filter((obj) =>
          obj.name !== 'isactionable'
        )
      }
      // this._filterService.setMention([tickettype]);
      const tabevent: TabEvent = {
        tab: this.postDetailTab.tab,
        event: FilterEvents.setMentionType,
        value: [item],
      };
      this._filterService.filterTabSignal.set(tabevent);
      this._commonService.changeTabFilterJson();
      this._filterService.filterTabSourceSignal.set(this.postDetailTab.tab);
    }
    // if (item == '') {
    //   let count;
    //   count = (tickettype == 1) ? this.mentionCount?.brandActivityCount : this.mentionCount?.userActivityCount
    //   this._tabService.headerTabCountObs.next({ guid: this.postDetailTab?.guid, count: count })
    // } else {
    //   this._tabService.headerTabCountObs.next({ guid: this.postDetailTab?.guid, count: obj?.value })
    // }

    this._ticketService.updatePostOptionObsSignal.set({selected:this.selectedItem,guid:this.postDetailTab?.guid})
  }

  activeTabBasedOnTicketId(ticketType: number): void {
    const label: string = '';

    switch (ticketType) {
      case 8:
        this.selectedTicketOption = {
          dbvalue: 8,
          label: this.translate.instant('Awaiting From Customer'),
        };
        break;
      case 2:
        this.selectedTicketOption = {
          dbvalue: 2,
          label: this.translate.instant('Closed Tickets'),
        };
        break;
      case 0:
        this.selectedTicketOption = {
          dbvalue: 0,
          label: this.translate.instant('All Tickets'),
        };
        break;
      case 6:
        this.selectedTicketOption = {
          dbvalue: 6,
          label: this.translate.instant('Unassigned Tickets'),
        };
        break;
      case 12:
        this.selectedTicketOption = {
          dbvalue: 12,
          label: this.translate.instant('SSRE'),
        };
        break;
      case 20:
        this.selectedTicketOption = {
          dbvalue: 20,
          label: this.translate.instant('Manually Created Tickets'),
        };
        break;
      // case 9:
      //   this.selectedTicketOption = {
      //     dbvalue: 9,
      //     label: 'Not Closed',
      //   };
      //   break;
      default:
        this.selectedTicketOption = {
          dbvalue: null,
          label: 'More',
        };
    }
    if (this.currentUser?.data?.user?.role != UserRoleEnum.BrandAccount && ticketType == 9) {
      this.selectedTicketOption = {
        dbvalue: 9,
        label: 'Not Closed',
      };
    }
  }

  toggleActionable(event): void {
    const tabevent: TabEvent = {
      tab: this.postDetailTab.tab,
      event: FilterEvents.togleActionable,
      value: { actionchk: event.checked, nonactionchk: this.nonactionchk },
    };
    this.actionchk = event.checked;
    // this.filterService.togleActionable(event.checked);
    this._filterService.filterTabSignal.set(tabevent);

    //this.checkIfbothFalse()

    if (!event.checked && !this.nonactionchk) {
      this.nonactionchk = true;
      const event = { checked: true };
      this.toggleNonActionable(event);
    } else {
      this._navigationService.currentSelectedTab.Filters.filters = this._navigationService.currentSelectedTab.Filters.filters.filter((obj) => obj.name !== 'isactionable')
      if (this.actionchk && this.nonactionchk) {
      }
      else if (!this.actionchk && this.nonactionchk) {
        this._navigationService.currentSelectedTab.Filters.filters.push({ name: 'isactionable', type: 2, value: [0] })
      } else {
        this._navigationService.currentSelectedTab.Filters.filters.push({ name: 'isactionable', type: 2, value: [1] })
      }
      this._filterService.filterTabSourceSignal.set(this.postDetailTab.tab);
    }
    this._ticketService.updatePostOptionMentionObs.next({actionchk:this.actionchk,brandpost:this.brandpost,brandreply:this.brandreply,nonactionchk:this.nonactionchk,guid:this.postDetailTab?.guid})
  }

  toggleNonActionable(event): void {
    const tabevent: TabEvent = {
      tab: this.postDetailTab.tab,
      event: FilterEvents.togleNonActionable,
      value: { actionchk: this.actionchk, nonactionchk: event.checked },
    };
    this.nonactionchk = event.checked;
    this._filterService.filterTabSignal.set(tabevent);
    // this.filterService.togleNonActionable(event.checked);

    if (!event.checked && !this.actionchk) {
      this.actionchk = true;
      const event = { checked: true };
      this.toggleActionable(event);
    } else {
      this._navigationService.currentSelectedTab.Filters.filters = this._navigationService.currentSelectedTab.Filters.filters.filter((obj) => obj.name !== 'isactionable')
      if (this.actionchk && this.nonactionchk) {
      } else if (!this.actionchk && this.nonactionchk) {
        this._navigationService.currentSelectedTab.Filters.filters.push({ name: 'isactionable', type: 2, value: [0] })
      } else {
        this._navigationService.currentSelectedTab.Filters.filters.push({ name: 'isactionable', type: 2, value: [1] })
      }
      this._filterService.filterTabSourceSignal.set(this.postDetailTab.tab);
    }
    this._ticketService.updatePostOptionMentionObs.next({ actionchk: this.actionchk, brandpost: this.brandpost, brandreply: this.brandreply, nonactionchk: this.nonactionchk, guid: this.postDetailTab?.guid })
  }

  togleBrandReplies(event): void {
    const tabevent: TabEvent = {
      tab: this.postDetailTab.tab,
      event: FilterEvents.togleBrandReplies,
      value: { brandreply: event.checked, brandpost: this.brandpost },
    };
    this.brandreply = event.checked;
    this._filterService.filterTabSignal.set(tabevent);
    // this.filterService.togleBrandReplies(event.checked);

    if (!event.checked && !this.brandpost) {
      this.brandpost = true;
      const event = { checked: true };
      this.togleBrandPost(event);
    } else {
      this._navigationService.currentSelectedTab.Filters.filters = this._navigationService.currentSelectedTab.Filters.filters.filter((obj) => obj.name !== 'brandpostorreply')
      if (this.brandreply && this.brandpost) {
      } else if (!this.brandreply && this.brandpost) {
        this._navigationService.currentSelectedTab.Filters.filters.push({ name: 'brandpostorreply', type: 2, value: [0] })
      } else {
        this._navigationService.currentSelectedTab.Filters.filters.push({ name: 'brandpostorreply', type: 2, value: [1] })
      }
      this._filterService.filterTabSourceSignal.set(this.postDetailTab.tab);
    }
    this._ticketService.updatePostOptionMentionObs.next({ actionchk: this.actionchk, brandpost: this.brandpost, brandreply: this.brandreply, nonactionchk: this.nonactionchk, guid: this.postDetailTab?.guid })
  }

  togleBrandPost(event): void {
    const tabevent: TabEvent = {
      tab: this.postDetailTab.tab,
      event: FilterEvents.togleBrandPost,
      value: { brandreply: this.brandreply, brandpost: event.checked },
    };
    this.brandpost = event.checked;
    this._filterService.filterTabSignal.set(tabevent);
    // this.filterService.togleBrandPost(event.checked);

    if (!event.checked && !this.brandreply) {
      this.brandreply = true;
      const event = { checked: true };
      this.togleBrandReplies(event);
    } else {
      this._navigationService.currentSelectedTab.Filters.filters = this._navigationService.currentSelectedTab.Filters.filters.filter((obj) => obj.name !== 'brandpostorreply')
      if (this.actionchk && this.brandpost) {
      } else if (!this.actionchk && this.brandpost) {
        this._navigationService.currentSelectedTab.Filters.filters.push({ name: 'brandpostorreply', type: 2, value: [0] })
      } else {
        this._navigationService.currentSelectedTab.Filters.filters.push({ name: 'brandpostorreply', type: 2, value: [1] })
      }
      this._filterService.filterTabSourceSignal.set(this.postDetailTab.tab);
    }
    this._ticketService.updatePostOptionMentionObs.next({ actionchk: this.actionchk, brandpost: this.brandpost, brandreply: this.brandreply, nonactionchk: this.nonactionchk, guid: this.postDetailTab?.guid })
  }

  getUniqueListBy(arr, key) {
    return [...new Map(arr.map(item => [item[key], item])).values()]
  }

  hideNotificationViralAlert(status): void {
    this.viralAlertNotificationToggle = status;
    this._ticketService.viralAlertChatIconPosition.next(status);
    this._cdr.detectChanges();
  }

  openGroupOrMentionView(flag):void
  {
    this.mentionOrGroupView = flag ?AllMentionGroupView.groupView:AllMentionGroupView.mentionView
    this._ticketService.updatePostOptionGroupViewObs.next({ guid: this.postDetailTab?.guid,mentionOrGroupView:flag?AllMentionGroupView.groupView:AllMentionGroupView.mentionView})
    this._navigationService.currentSelectedTab.Filters.isGroupView=flag
    this.groupViewFlag=flag
    this._ticketService.selectedPostList = [];
    this._ticketService.postSelectTriggerSignal.set(0);
    this._ticketService.bulkMentionChecked = [];
    const tabevent: TabEvent = {
      tab: this.postDetailTab.tab,
      event: FilterEvents.setMentionType,
      value: [this.selectedItem],
    };
    this._filterService.filterTabSignal.set(tabevent);
    this._commonService.changeTabFilterJson();
    this._filterService.filterTabSourceSignal.set(this.postDetailTab.tab);
    this._cdr.detectChanges();
  }

  clearAllSocialboxVariables() {
    this.paginator = null;
    this.socialBoxDiv = null;
    if (this.ticketListSubscription) {
      this.ticketListSubscription.unsubscribe();
    }
    if (this.mentionListSubscription) {
      this.mentionListSubscription.unsubscribe();
    }
    if (this.mentionCountSubscription) {
      this.mentionCountSubscription.unsubscribe();
    }
    if (this.GetTicketsByTicketIdapi) {
      this.GetTicketsByTicketIdapi.unsubscribe();
    }
    if (this.getMentionByTicketIdapi) {
      this.getMentionByTicketIdapi.unsubscribe();
    }
    if (this.GetAssignmentLimitapi) {
      this.GetAssignmentLimitapi.unsubscribe();
    }
    if (this.getMentionListInfiniteapi) {
      this.getMentionListInfiniteapi.unsubscribe();
    }
    if (this.AgentAssignmentResumedapi) {
      this.AgentAssignmentResumedapi.unsubscribe();
    }
  }


  acceptCallEventRes(event)
  {
    if(event)
    {
      this.showCallPopup = false;
      this._cdr.detectChanges();
    }
  }

  updateButtonZindex(): void {
    setTimeout(() => {
      if (this.newDataFoundBtn) {
        const isCalenderOpen = localStorage.getItem('isCalenderOpen');
        if (isCalenderOpen === 'true') this.newDataFoundBtn._elementRef.nativeElement.style.zIndex = 'inherit !important';
        else this.newDataFoundBtn._elementRef.nativeElement.style.zIndex = '1';
      }
    }, 1000);
  }

  resetMentionCount(data){
    const CountData = {
      MentionCount: data,
      tab: this.postDetailTab.tab,
      posttype: PostsType.Mentions,
    };
    // this._filterService.currentCountData.next(CountData);
    this._filterService.currentCountDataSignal.set(CountData);

    if (data && data.totalRecords) {
      if (this.useractivity) {
        if (this.actionchk && this.nonactionchk) {
          this.pagerCount = data.userActivityCount;
          this.ticketsFound = data.userActivityCount;
          if (this.mentionOrGroupView == AllMentionGroupView.mentionView) {
            this._tabService.headerTabCountObsSignal.set({ guid: this.postDetailTab?.guid, count: this.ticketsFound })
          } else {
            this.ticketsFound = data.userActivityGroupCount
            this._tabService.unseenTabCountObs.next({ guid: this.postDetailTab?.guid, count: data.totalUnreadMentions })
          }
        } else if (this.actionchk && this.nonactionchk === false) {
          this.pagerCount = data.actionable;
          this.ticketsFound = data.actionable;
        } else if (this.nonactionchk && this.actionchk === false) {
          this.pagerCount = data.nonActinable;
          this.ticketsFound = data.nonActinable;
        }
      } else if (this.brandactivity) {
        if (this.brandpost && this.brandreply) {
          this.pagerCount = data.brandActivityCount;
          this.ticketsFound = data.brandActivityCount;
          if (this.mentionOrGroupView == AllMentionGroupView.mentionView) {
            this._tabService.headerTabCountObsSignal.set({ guid: this.postDetailTab?.guid, count: this.ticketsFound })
          } else {
            this.ticketsFound = data.brandActivityGroupCount
            this._tabService.unseenTabCountObs.next({ guid: this.postDetailTab?.guid, count: data.totalUnreadMentions })
          }
        } else if (this.brandpost && this.brandreply === false) {
          this.pagerCount = data.brandPost;
          this.ticketsFound = data.brandPost;
        } else if (this.brandreply && this.brandpost === false) {
          this.pagerCount = data.brandReply;
          this.ticketsFound = data.brandReply;
        }
      } else {
        this.pagerCount = data.userActivityCount;
        this.ticketsFound = data.userActivityCount;
      }
      this._cdr.detectChanges();
    }
  }

  get currentTicket() {
    return this.ticketsPreview[this.currentIndex];
  }

  nextTicket() {
    if (this.currentIndex < this.ticketsPreview.length - 1) {
      this.currentIndex++;
    }
  }

  prevTicket() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    }
  }
}
