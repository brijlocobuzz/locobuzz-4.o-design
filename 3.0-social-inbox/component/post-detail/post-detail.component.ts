import { locobuzzAnimations } from './../../../@locobuzz/animations';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  effect,
  EffectRef,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  QueryList,
  signal,
  untracked,
  ViewChild,
  ViewChildren,
  Output,
  EventEmitter
} from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelImage } from 'app/core/enums/ChannelImgEnum';
import { ChannelType } from 'app/core/enums/ChannelType';
import { LogStatus } from 'app/core/enums/LogStatus';
import { PostActionType } from 'app/core/enums/PostActionType';
import { Priority } from 'app/core/enums/Priority';
import { SSRELogStatus } from 'app/core/enums/SsreLogStatusEnum';
import { TicketSignalEnum } from 'app/core/enums/TicketSignalEnum';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseSocialAuthor } from 'app/core/models/authors/locobuzz/BaseSocialAuthor';
import { BandhanRequest } from 'app/core/models/crm/BandhanRequest';
import { CRMMenu } from 'app/core/models/crm/CRMMenu';
import { FedralRequest } from 'app/core/models/crm/FedralRequest';
import { MagmaRequest } from 'app/core/models/crm/MagmaRequest';
import { TitanRequest } from 'app/core/models/crm/TitanRequest';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import {
  BulkMentionChecked,
  DropdownConnectedUsers,
} from 'app/core/models/dbmodel/TicketReplyDTO';
import { UpliftAndSentimentScore } from 'app/core/models/dbmodel/UpliftAndSentimentScore';
import { mentionMiniView } from 'app/core/models/dbmodel/UserOneViewDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostSignalR } from 'app/core/models/menu/Menu';
import {
  CommLogFilter,
  CommunicationLog,
  CommunicationLogResponse,
} from 'app/core/models/viewmodel/CommunicationLog';
import {
  Filter,
  GenericFilter,
  PostsType,
  postView,
} from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import {
  MentionReadReceipt,
  TagIdListRead,
} from 'app/core/models/viewmodel/ReplyInputParams';
import { TicketInfo } from 'app/core/models/viewmodel/TicketInfo';
import { AccountService } from 'app/core/services/account.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { CrmService } from 'app/social-inbox/services/crm.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { Subject, Subscription, forkJoin } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { CrmComponent, MediaGalleryComponent, VideoDialogComponent } from '..';
import { PostDetailService } from './../../services/post-detail.service';
import { AutoRenderTime } from 'app/core/models/viewmodel/AutoRenderSetting';
import { CustomSnackbarComponent } from 'app/shared/components';
import { notificationType } from 'app/core/enums/notificationType';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import {
  VoiceCallEventsEnum,
  VoiceCallTypeEnum,
} from 'app/core/enums/VoiceCallEnum';
import { truncateSync } from 'fs';
import { ApolloRequest } from 'app/core/models/crm/ApolloRequest';
import { TataUniRequest } from 'app/core/models/crm/TataUniRequest';
import { RecrmRequest } from 'app/core/models/crm/RecrmRequest';
import { ExtraMarksRequest } from 'app/core/models/crm/ExtraMarksRequest';
import { CallObj } from 'app/core/models/viewmodel/VoiceCall';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import { PostUserinfoComponent } from './../post-userinfo/post-userinfo.component';
import { ModalService } from './../../../shared/services/modal.service';
import { DOCUMENT, KeyValue } from '@angular/common';
// import { AnimalWildfarePopupComponent } from '../animal-wildfare-popup/animal-wildfare-popup.component';
import { DreamsolRequest, DuraflexRequest } from 'app/core/models/crm/DreamsolRequest';
import { I } from '@angular/cdk/keycodes';
import { TataCapitalRequest } from 'app/core/models/crm/TataCapitalRequest';
import { LookupcrmquickworkComponent } from '../quickwork-manual/lookupcrmquickwork/lookupcrmquickwork.component';
import { QuickworkManualComponent } from '../quickwork-manual/quickwork-manual.component';
import { DynamicCrmIntegrationService } from 'app/accounts/services/dynamic-crm-integration.service';
import { AnimalWildfarePopupComponent } from '../animal-wildfare-popup/animal-wildfare-popup.component';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { NoteMedia, UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { Reply } from 'app/core/models/viewmodel/Reply';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { AiFeatureService } from 'app/accounts/services/ai-feature.service';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { TicketDispositionComponent } from '../ticket-disposition/ticket-disposition.component';
import { LoaderService } from 'app/shared/services/loader.service';
import { PushTicketToCrmComponent } from '../push-ticket-to-crm/push-ticket-to-crm.component';
import { Overlay } from '@angular/cdk/overlay';
import { MatSidenavModule } from '@angular/material/sidenav';
import { TutorialModalComponent } from '../tutorial-modal/tutorial-modal.component';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { ProfileDetails } from 'app/core/models/accounts/userprofile';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { postDetailProfileMenu } from 'app/app-data/post-detail-profile-menu';
import { postDetail } from 'app/app-data/post-detail';
import { Sentiment } from 'app/core/enums/Sentiment';
@Component({
    selector: 'app-post-detail',
    templateUrl: './post-detail.component.html',
    styleUrls: ['./post-detail.component.scss'],
    animations: locobuzzAnimations,
    providers: [{ provide: MAT_DIALOG_DATA, useValue: {} }],
    standalone: false
})
export class PostDetailComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChildren('conversationItem') conversationItem: QueryList<
    ElementRef<HTMLDivElement>
  >;
  @ViewChild('postDetail', { static: false }) postDetail: ElementRef;
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  @ViewChild('menuTrigger1') trigger1: MatMenuTrigger;
  crmGetAuthorTicketDetails: boolean = false;
  formDataForQuickworkCrm: any
  @ViewChild('clickHoverMenuTrigger') clickHoverMenuTrigger: MatMenuTrigger;
  clickHoverMenuTriggerFlag: boolean = false;
  // @ViewChild('shortEnded', { static: false }) shortEnded: ElementRef;
  @ViewChild('menuTrigger3') trigger3 : MatMenuTrigger;

  @Input() postDetailTab?: LocobuzzTab;
  postDetailData: {};
  filter: any;
  selectedPostID: number;
  @Input() TicketData: BaseMention[] = [];
  postObj: BaseMention;
  shortData: {};
  baseLogObject: any[] = [];
  LogObject: any[] = [];
  mentionCount = 0;
  filterBrandInfo: BrandList;
  mentionDefaultSize = 10;
  loadMoreSize = 50;
  showLoadMoreOption = false;
  lastmentionDateEpoch = 0;
  note: string = '';  
  currentPostType: PostsType = PostsType.TicketHistory;
  currentUserName: DropdownConnectedUsers;
  showRefreshButton = false;
  replyDays = false;
  ChannelGroup = ChannelGroup;
  dropdownConnectedUsersAsync = new Subject<DropdownConnectedUsers[]>();
  ticketHistorySubscription: Subscription;
  dropdownConnectedUsers$ = this.dropdownConnectedUsersAsync.asObservable();
  ticketHistoryData: AllBrandsTicketsDTO;
  callNote: boolean = false;
  openCallDetailFlag: boolean = false;
  voipMention: BaseMention;
  showConnectedUsers = false;
  ivrDesc: any;
  userRoleEnum = UserRoleEnum;
  oneTimeLoad:boolean = true;
  mediaSelectedAsync = new Subject<UgcMention[]>();
  mediaSelectedAsync$ = this.mediaSelectedAsync.asObservable();
  selectedNoteMedia: UgcMention[] = [];
  rotate: boolean = false;
  defaultLayout: boolean = false;

  fetchedUserHistory: BaseMention[][] = [];
  selectedPostFromHistory: BaseMention[] = [];
  userList: {}[] = [
    {
      id: 1,
      label: 'John Doe',
    },
    {
      id: 2,
      label: 'Mark Doe',
    },
    {
      id: 3,
      label: 'Jane Doe',
    },
  ];
  post: TicketClient;
  authorDetails: BaseSocialAuthor;
  communicationLog: CommunicationLog;
  communicationLogResponse: CommunicationLogResponse;
  upliftAndSentimentScore: UpliftAndSentimentScore;
  ticketInfo: TicketInfo;
  currentUser: AuthUser;
  comminicationLogLoading: boolean = false;
  postShortenedData = true;
  showBlurLockStrip = false;
  showLockStrip = false;
  ticketLockUserName: string;
  ticketLockTime = 0;
  lockUnlockLabel = 'Locked';
  sendingReply = false;
  subs = new SubSink();
  lockUnlockNote = '';
  LogFilter = new CommLogFilter();
  hideQuickWindow = false;
  hideActionstatus = false;
  checkAllCheckBox = false;
  bulkActionpanelStatus: boolean = false;
  ticketsFound: number;
  postloader: boolean = false;
  result: string = '';
  tickets: BaseMention[] = [];
  currentPageType: string;
  isadvance: boolean = false;
  selectedPostList: number[] = [];
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
  testingmentionObj = `[{"concreteClassName":"LocobuzzNG.Entities.Classes.Mentions.TwitterMention","inReplyToUserID":"0","isShared":false,"urlClicks":null,"tweetClick":null,"followingCount":null,"isDMSent":false,"taggedUsersJson":"[{\"Userid\":\"1150754595016040448\",\"Name\":\"BittuLoco2030\",\"UserType\":null,\"offset\":0,\"length\":13}]","newSelectedTaggedUsersJson":null,"mainTweetid":null,"canReplyPrivately":false,"mentionMetadata":{"videoView":0,"postClicks":0,"postVideoAvgTimeWatched":0,"likeCount":0,"commentCount":null,"reach":null,"impression":null,"videoViews":0,"engagementCount":0,"reachCountRate":0,"impressionsCountRate":0,"engagementCountRate":0,"isFromAPI":false,"shareCount":0},"author":{"isVerifed":false,"screenname":"gonsalve_s","followersCount":23,"followingCount":0,"kloutScore":0,"bio":null,"tweetCount":0,"isBlocked":false,"isMuted":false,"isUserFollowing":false,"isBrandFollowing":false,"isMarkedInfluencer":false,"markedInfluencerID":0,"markedInfluencerCategoryName":"Automobile","markedInfluencerCategoryID":27,"influences":null,"interests":null,"influencesString":null,"insterestsString":null,"canHaveUserTags":false,"canBeMarkedInfluencer":false,"canHaveConnectedUsers":false,"profileUrl":null,"socialId":"1054251559826141184","isAnonymous":false,"name":"Dany Gonsalve's مرحبا","channel":0,"url":null,"profileImage":null,"nps":0,"sentimentUpliftScore":0,"id":0,"picUrl":"https://images.locobuzz.com/1054251559826141184.jpg","glbMarkedInfluencerCategoryName":"Automobile","glbMarkedInfluencerCategoryID":27,"interactionCount":0,"location":null,"locationXML":null,"userSentiment":0,"channelGroup":1,"latestTicketID":"110229","userTags":[],"markedInfluencers":[],"connectedUsers":[],"locoBuzzCRMDetails":{"id":0,"name":null,"emailID":null,"alternativeEmailID":null,"phoneNumber":null,"link":null,"address1":null,"address2":null,"notes":null,"city":null,"state":null,"country":null,"zipCode":null,"alternatePhoneNumber":null,"ssn":null,"customCRMColumnXml":null,"gender":null,"age":0,"dob":null,"modifiedByUser":null,"modifiedTime":null,"modifiedDateTime":"0001-01-01T00:00:00","modifiedTimeEpoch":0,"timeoffset":0,"dobString":null,"isInserted":false},"previousLocoBuzzCRMDetails":null,"crmColumns":null,"lastActivity":null,"firstActivity":null},"description":"@BittuLoco2030 tat chk 6","canReply":true,"parentSocialID":null,"parentPostID":null,"parentID":null,"id":null,"socialID":"1376886768742506501","title":null,"isActionable":true,"channelType":7,"channelGroup":1,"mentionID":null,"url":null,"sentiment":0,"tagID":335204,"isDeleted":false,"isDeletedFromSocial":false,"mediaType":1,"mediaTypeFormat":1,"status":0,"isSendFeedback":false,"isSendAsDMLink":false,"isPrivateMessage":false,"isBrandPost":false,"updatedDateTime":null,"location":null,"mentionTime":"2021-03-30T13:19:21","contentID":186220,"isRead":true,"readBy":33536,"readAt":"2021-03-31T21:08:12.067","numberOfMentions":"13","languageName":null,"isReplied":false,"isParentPost":false,"inReplyToStatusId":0,"replyInitiated":false,"isMakerCheckerEnable":false,"attachToCaseid":null,"mentionsAttachToCaseid":null,"insertedDate":"2020-01-23T11:55:32.053","mentionCapturedDate":null,"mentionTimeEpoch":1617110361,"modifiedDateEpoch":1617179433.9,"likeStatus":false,"modifiedDate":"2021-03-31T08:30:33.9","brandInfo":{"brandID":7121,"brandName":"wrong","categoryGroupID":0,"categoryID":0,"categoryName":null,"mainBrandID":0,"compititionBrandIDs":null,"brandFriendlyName":"Wrong Brand","brandLogo":null,"isBrandworkFlowEnabled":false,"brandGroupName":null},"upperCategory":{"id":0,"name":null,"userID":null,"brandInfo":null},"categoryMap":[{"id":53927,"name":"shivam22","upperCategoryID":0,"sentiment":0,"isTicket":false,"subCategories":[]}],"retweetedStatusID":"0","ticketInfo":{"ticketID":110229,"tagID":335204,"assignedBy":null,"assignedTo":null,"assignedToTeam":null,"assignToAgentUserName":null,"readByUserName":"aditya ghosalkar","escalatedTotUserName":"ACTCSD G","escalatedToBrandUserName":"shivam test","assignedAt":"0001-01-01T00:00:00","previousAssignedTo":0,"escalatedTo":22946,"escaltedToAccountType":0,"escalatedToCSDTeam":null,"escalatedBy":null,"escalatedAt":"2020-01-24T08:55:33.123","escalatedToBrand":22911,"escalatedToBrandTeam":null,"escalatedToBrandBy":null,"escalatedToBrandAt":"2020-01-29T13:18:34.483","status":14,"updatedAt":"0001-01-01T00:00:00","createdAt":"0001-01-01T00:00:00","numberOfMentions":13,"ticketPriority":0,"lastNote":"zxdxcx","latestTagID":335204,"autoClose":false,"isAutoClosureEnabled":false,"isMakerCheckerEnable":false,"ticketPreviousStatus":null,"guid":null,"srid":null,"previousAssignedFrom":null,"previouAgentWorkflowWorkedAgent":null,"csdTeamId":null,"brandTeamId":null,"teamid":null,"previousAgentAccountType":null,"ticketAgentWorkFlowEnabled":false,"makerCheckerStatus":0,"messageSentforApproval":null,"replyScheduledDateTime":null,"requestedByUserid":null,"workFlowTagid":null,"workflowStatus":0,"ssreStatus":0,"isCustomerInfoAwaited":false,"utcDateTimeOfOperation":null,"toEmailList":null,"ccEmailList":null,"bccEmailList":null,"taskJsonList":null,"caseCreatedDate":"2020-01-23T11:55:32.053","tatflrBreachTime":"2020-01-23T11:58:32.053","lockUserID":null,"lockDatetime":null,"lockUserName":null,"isTicketLocked":false,"tattime":624157,"flrtatSeconds":null,"replyEscalatedToUsername":null,"replyUserName":null,"replyUserID":0,"replyApprovedOrRejectedBy":null,"ticketProcessStatus":null,"ticketProcessNote":null,"replyUseid":0,"escalationMessage":null,"isSubscribed":false,"ticketUpperCategory":{"id":0,"name":null,"userID":null,"brandInfo":null},"ticketCategoryMap":[{"id":53915,"name":"other random words","upperCategoryID":0,"sentiment":0,"isTicket":false,"subCategories":[{"id":42551,"name":"FLR","categoryID":0,"sentiment":0,"subSubCategories":[]}]}],"ticketCategoryMapText":"<CategoryMap>\r\n<Category><ID>53915</ID><Name>other random words</Name><Sentiment>0</Sentiment><SubCategory><ID>42551</ID><Name>FLR</Name><Sentiment>0</Sentiment></SubCategory></Category></CategoryMap>\r\n","latestResponseTime":null},"ticketInfoSsre":{"ssreOriginalIntent":0,"ssreReplyVerifiedOrRejectedBy":null,"latestMentionActionedBySSRE":0,"transferTo":2,"ssreEscalatedTo":0,"ssreEscalationMessage":null,"intentRuleType":0,"ssreStatus":0,"retrainTagid":0,"retrainBy":0,"retrainDate":"0001-01-01T00:00:00","ssreMode":0,"ssreIntent":0,"ssreReplyType":0,"intentFriendlyName":null,"intentOrRuleID":0,"latestSSREReply":null,"ssreReplyVerifiedOrRejectedTagid":132424,"ssreReply":{"authorid":null,"replyresponseid":null,"replymessage":null,"channelType":0,"escalatedTo":0,"escalationMessage":null}},"ticketInfoCrm":{"srUpdatedDateTime":null,"srid":null,"isPushRE":0,"srStatus":0,"srCreatedBy":null,"srDescription":null,"remarks":null,"jioNumber":null,"partyid":null,"isPartyID":0,"mapid":null,"isFTR":null},"attachmentMetadata":{"mediaContents":[],"mediaContentText":"<Attachments></Attachments>","mediaUrls":"","mediaAttachments":[],"attachments":"<Attachments></Attachments>"},"makerCheckerMetadata":{"workflowReplyDetailID":0,"replyMakerCheckerMessage":null,"isSendGroupMail":false,"replyStatus":null,"replyEscalatedTeamName":null,"workflowStatus":0,"isTakeOver":null},"categoryMapText":"<CategoryMap>\r\n<Category><ID>53927</ID><Name>shivam22</Name><Sentiment>0</Sentiment></Category></CategoryMap>\r\n","ticketID":110229,"isSSRE":false,"settingID":12269,"mediaContents":null}]`;
  noDataFound = false;
  initialLoad = false;
  isCSDUser = false;
  isBrandUser = false;
  showNewMentionFound = false;
  bulkinprogress = false;
  bulkreplysuccess = false;
  ssreinprogress = false;
  ssresuccess = false;
  bulkpending = 0;
  bulksuccess = 0;
  bulkfailed = 0;
  postFootDisable = false;
  disableTicketOverview = false;
  bulkinprogresstitle = '';
  ssreinprogresstitle = '';
  replyMentionTime: any;
  mentionReadReceiptList: MentionReadReceipt[] = [];
  @Input() isreplyVisible = false;
  MediaUrl: any;
  previousDataLoader: boolean;
  replySentMiniView: mentionMiniView;
  reRenderHistory = false;
  postView: postView = postView.detailView;
  postViewEnum = postView;
  isDataReceived: boolean = false;
  enableNote = false;
  callObj: CallObj;
  userInfoToggle = false;
  startIndex = 0;
  endIndex = 15;
  startPosition: number = 0;
  showAllChannelData = true;
  deepLinkingFlag: boolean = false;
  salesForceLoader: boolean;
  userChangeLoader: boolean;
  autoCloseWindow: boolean = false;
  activeTab: number = 1;
  isAPIFailed: boolean;
  snapdealSridFound: Boolean = false;
  crmLable: string;
  selectedIndex: number;
  mentionExistsInTicketHistory:boolean = false;
  ticketSummary:boolean = false;
  loaderTypeEnum = loaderTypeEnum;
  isReadOnly:boolean = false;
  chatbotStatus = false;
  brandList = [];
  filterStartEpoch: number;
  filterEndEpoch: number;
  chatEnableMessenger: boolean;
  chatEnableWhatsapp: boolean;
  chatEnableChatbot: boolean;
  chatEnableInstagram: boolean;
  chatEnableGMB: boolean;
  chatEnableTelegram: boolean;
  disableSwitchMode: boolean=false;
  @ViewChild('forHeightGet') forHeightGet!: ElementRef;
  editedNoteData: any;
  GetAuthorBasedPendingSuccessFailedCountApi: any;
  getLastMentionTimeApi:any;
  markTicketAsReadApi: any;
  getTicketLockApi: any;
  lockUnlockTicketApi: any;
  GetTicketSummaryApi: any;
  addTicketNotesVOIPApi: any;
  addTicketNotes: any;
  GetTicketSummary2Api: any;
  GetTicketsByTicketIdsApi: any;
  getMentionCountApi: any;
  GetCrmLeftMenuApi: any;
  GetBrandCrmRequestDetailsApi: any;
  GetNotesbyTagIDApi: any;
  CreateSalesForceCrmApi: any;
  generateAnimalWildFareCrmTokenApi: any;
  getSuggestedRresponseApi: any;
  GetAITicketSummaryDataApi: any;
  getSRDetailsApi: any;
  getCrmFieldFormApi: any;
  editTicketNotesApi: any;
  GetAuthorBasedPendingSuccessFailedCount1Api: any;
  postDetailTimeOut: any;
  postDetailNativeTimeout: any;
  loadedTicketHisotrySignalTimeOut: any;
  postDetailScrollTopTimeout: any;
  conversationItemTimeOut: any;
  noteChangeTimeOut: any;
  emailProfileDetailsTimeOut: any;
  GetAuthorDetailsApi: any;
  effectFilterTabSourceSignal: EffectRef;
  effectTicketStatusChangeSignal: EffectRef;
  effectOpenCallDetailWindowSignal: EffectRef;
  effectRedirectToTagIdSignal: EffectRef;
  effectCurrentPostObjectSignal: EffectRef;
  effectIsReplyVisibleCheckSignal: EffectRef;
  effectReplyActionPerformedSignal: EffectRef;
  effectSetTicketForRefreshSignal: EffectRef;
  effectUpdateCRMDetailsSignal: EffectRef;
  effectAgentAssignToObservableSignal: EffectRef;
  effectTicketStatusChangeObsSignal: EffectRef;
  effectCrmChatbotCloseTicketObsSignal: EffectRef;
  effectTicketHistoryActionPerformObsSignal: EffectRef;
  effectTicketEscalationObsSignal: EffectRef;
  effectClearNoteAttachmentSignal: EffectRef;
  effectOpenRephraseSFDCSignal: EffectRef;
  isSideBarAttachmentOpen: boolean = false;
  emailBaseMention:any[]=[]
  noteInput: boolean = false;
  private scrollListener: () => void;
  private clearSignal = signal<boolean>(true);
  initials:string=''
  emailExpandView: boolean = false;
  minimizeEmailView: boolean = false
  receivedMedia:any[]=[]
  sentMedia:any[]=[]
  lastLogs: any[]=[];
  listOfEmotionJourney: any[] = [
    { name: 'confused', icon: 'assets/ticket-list/help_outline.svg', color:'#e1f5ff' },
    { name: 'disappointed', icon: 'assets/ticket-list/Dislike.svg', color:'#f0e6ff' },
    { name: 'anxious', icon: 'assets/ticket-list/offline_bolt.svg', color: '#fffee8' },
    { name: 'frustrated', icon: 'assets/ticket-list/sentiment_dissatisfied.svg', color: '#fff6e7' },
    { name: 'hopeful', icon: 'assets/ticket-list/volunteer_activism.svg', color:'#f3fee3' },
    { name: 'grateful', icon: 'assets/ticket-list/volunteer_activism.svg', color: '#f3fee3' },
    { name: 'relieved', icon: 'assets/ticket-list/handshake.svg', color: '#eafffd' },
    { name: 'satisfied', icon: 'assets/ticket-list/sentiment_very_satisfied.svg', color:'#f0fdf1' },
    { name: 'angry', icon: 'assets/ticket-list/report.svg', color: '#fce6e4' },
    { name: 'very disappointed', icon: 'assets/ticket-list/sentiment_very_dissatisfied.svg', color: '#fde7f4' },
    { name: 'saddened', icon: 'assets/ticket-list/sentiment_very_dissatisfied.svg', color: '#fde7f4' },
    { name: 'neutral', icon: 'assets/ticket-list/sentiment_neutral.svg', color: '#f5f6ef' },
  ];
  ChannelImage = '';
  ChannelName = '';
  userProfileImg: string = '';
  userProfileName: string = '';
  brandImage:string='';

  @Input() ozontelFlag:boolean = false
  @Output() closePostDetail = new EventEmitter<boolean>();
  constructor(
    private _postDetailService: PostDetailService,
    private _userDetailService: UserDetailService,
    private ticketService: TicketsService,
    private _filterService: FilterService,
    private _sidebarService: SidebarService,
    private snackBar: MatSnackBar,
    private accountService: AccountService,
    private _ticketSignalrService: TicketsignalrService,
    private _replyService: ReplyService,
    private _navigationService: NavigationService,
    private _accountService: AccountService,
    private _chatBotService: ChatBotService,
    private _NgZone: NgZone,
    private _crmService: CrmService,
    private _dialog: MatDialog,
    private _voip: VoiceCallService,
    private _footericonService: FootericonsService,
    private _snackBar: MatSnackBar,
    private _cdr: ChangeDetectorRef,
    private _modalService: ModalService,
    private _dynamicServices: DynamicCrmIntegrationService,
    private mediaGalleryService: MediagalleryService,
    private _mapLocobuzzEntity: MaplocobuzzentitiesService,
    private _aiFeatureService: AiFeatureService,
    private _loaderService: LoaderService,
    private overlay: Overlay,
    private exotelService:ExotelService,
    private commonService: CommonService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public replyData?: { replyVisible: boolean }
  ) {
    if (replyData && replyData.replyVisible) {
      this.isreplyVisible = replyData.replyVisible;
    }
    let onLoadTabSource = true;
    this.effectFilterTabSourceSignal = effect(() => {
      const value = this.clearSignal() ? this._filterService.filterTabSourceSignal() : untracked(() => this._filterService.filterTabSourceSignal());
      if (!onLoadTabSource && value && this.clearSignal()){
        this.filterTabChanges(value);
      } else {
        onLoadTabSource = false;
      }
    }, { allowSignalWrites: true });

    let onLoadStatusChange = true;
    this.effectTicketStatusChangeSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.ticketStatusChangeSignal() : untracked(() => this.ticketService.ticketStatusChangeSignal());
      if (!onLoadStatusChange && value && this.clearSignal()){
        this.ticketStatusChangeSignalChanges(value);
      } else {
        onLoadStatusChange = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadCallDetailWindow = true;
    this.effectOpenCallDetailWindowSignal = effect(() => {
      const response = this.clearSignal() ? this.ticketService.openCallDetailWindowSignal() : untracked(() => this.ticketService.openCallDetailWindowSignal());
      if (this.clearSignal()){
        if (response) {
          this.callNote = true;
          this.openCallDetailFlag = response;
          this.callRunning = true;
          this.noteInput = true;
        } else {
          this.openCallDetailFlag = false;
        }
      }else {
        onLoadCallDetailWindow = false;
      }

    }, { allowSignalWrites: true });

    let onLoadRedirectToTagId = true;

    this.effectRedirectToTagIdSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.redirectToTagIdSignal() : untracked(() => this._replyService.redirectToTagIdSignal());
      if (!onLoadRedirectToTagId && value && this.clearSignal()) {
        if (this.postObj && this.postObj?.channelGroup === ChannelGroup.Email) {
          this.redirectToTagIdSignalChanges(value);
        }
      } else {
        onLoadRedirectToTagId = false;
      }
    }, { allowSignalWrites: true });

    let onLoadCurrentPostObject = true;

    this.effectCurrentPostObjectSignal = effect(() => {
      const value = this.clearSignal() ? this._postDetailService.currentPostObjectSignal() : untracked(() => this._postDetailService.currentPostObjectSignal());
      if (!onLoadCurrentPostObject && value > 0 && this.clearSignal()) {
        this.currentPostObjectSignalChange(value);
      } else {
        onLoadCurrentPostObject = false;
      }
    }, { allowSignalWrites: true });

    let onLoadVisibleCheck = true;

    this.effectIsReplyVisibleCheckSignal = effect(() => {
      const value = this.clearSignal() ? this._postDetailService.isReplyVisibleCheckSignal() : untracked(() => this._postDetailService.isReplyVisibleCheckSignal());
      if (!onLoadVisibleCheck && value != null && this.clearSignal()) {
        this.isReplyVisibleCheckSignalChanges(value);
      } else {
        onLoadVisibleCheck = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadActionPerformed = true;
    this.effectReplyActionPerformedSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.replyActionPerformedSignal() : untracked(() => this._replyService.replyActionPerformedSignal());
      if (!onLoadActionPerformed && value && this.clearSignal()) {
        this.replyActionPerformedSignalChanges(value);
      } else {
        onLoadActionPerformed = false;
      }
    }, { allowSignalWrites: true });

    let onLoadTicketForRefresh = true;
    this.effectSetTicketForRefreshSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.setTicketForRefreshSignal() : untracked(() => this.ticketService.setTicketForRefreshSignal());
      if (!onLoadTicketForRefresh && value && this.clearSignal()) {
        this.baseLogObject.push({
          isCommunicationLog: true,
        });
        this.ticketService.setTicketForRefreshSignal.set(null);
      } else {
        onLoadTicketForRefresh = false;
      }
    }, { allowSignalWrites: true });

    let onLoadCRMDetails = true;
    this.effectUpdateCRMDetailsSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.updateCRMDetailsSignal() : untracked(() => this.ticketService.updateCRMDetailsSignal());
      if (!onLoadCRMDetails && value && this.clearSignal()) {
        this.updateCRMDetailsSignalChange(value);
      } else {
        onLoadCRMDetails = false;
      }
    }, { allowSignalWrites: true });

    let onLoadAssignToObservable = true;
    this.effectAgentAssignToObservableSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.agentAssignToObservableSignal() : untracked(() => this.ticketService.agentAssignToObservableSignal());
      if (!onLoadAssignToObservable && value && this.clearSignal()) {
        this.agentAssignToObservableSignalChanges(value)
      } else {
        onLoadAssignToObservable = false;
      }
    }, { allowSignalWrites: true });

    let onLoadTicketStatusChange = true;

    this.effectTicketStatusChangeObsSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.ticketStatusChangeObsSignal() : untracked(() => this.ticketService.ticketStatusChangeObsSignal());
      if (!onLoadTicketStatusChange && value && this.clearSignal()) {
        this.ticketStatusChangeObsSignal(value)
      } else {
        onLoadTicketStatusChange = false;
      }
    }, { allowSignalWrites: true });

    let onLoadCRMChatbotCloseTicketObs = true;

    this.effectCrmChatbotCloseTicketObsSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.crmChatbotCloseTicketObsSignal() : untracked(() => this.ticketService.crmChatbotCloseTicketObsSignal());
      if (!onLoadCRMChatbotCloseTicketObs && value && this.clearSignal()) {
        this.crmChatbotCloseTicketObsSignalChanges(value)
      } else {
        onLoadCRMChatbotCloseTicketObs = false;
      }
    }, { allowSignalWrites: true });

    let onLoadHistoryActionPerformObs = true;

    this.effectTicketHistoryActionPerformObsSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.ticketHistoryActionPerformObsSignal() : untracked(() => this.ticketService.ticketHistoryActionPerformObsSignal());
      if (!onLoadHistoryActionPerformObs && value > 0 && this.clearSignal()) {
        this.ticketHistoryActionPerformObsSignalChanges(value)
      } else {
        onLoadHistoryActionPerformObs = false;
      }
    }, { allowSignalWrites: true });

    let onLoadTicketEscalationObs = true;

    this.effectTicketEscalationObsSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.ticketEscalationObsSignal() : untracked(() => this.ticketService.ticketEscalationObsSignal());
      if (!onLoadTicketEscalationObs && value && this.clearSignal()) {
        this.ticketEscalationObsSignalChange(value)
      } else {
        onLoadTicketEscalationObs = false;
      }
    }, { allowSignalWrites: true });

    let onLoadNoteAttachment = true;
    this.effectClearNoteAttachmentSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.clearNoteAttachmentSignal() : untracked(() => this._replyService.clearNoteAttachmentSignal());
      if (!onLoadNoteAttachment && value && this.clearSignal()) {
        this.clearNoteAttachmentSignalChanges(value)
      } else {
        onLoadNoteAttachment = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadBrandMentionEmail = true;
    this.effectOpenRephraseSFDCSignal = effect(() => {
      const value: any = this.clearSignal() ? this._replyService.openRephraseSFDCSignal() : untracked(() => this._replyService.openRephraseSFDCSignal());
      if (!onLoadBrandMentionEmail && value && this.sfdcTicketView && this.clearSignal()) {
        this.openRephrasePopup = value?.openPopup;
        this.rephrasePosition = value?.position;
        this.rephraseOptions = value?.rephraseOptions;
        this._cdr.detectChanges();
        this._replyService.openRephraseSFDCSignal.set(null);
      } else {
        onLoadBrandMentionEmail = false;
      }
    }, { allowSignalWrites: true });
  }
  showCallPopup: boolean = false
  inbound: boolean = false;
  callRunning: boolean = false;
  voiceEventEnum = VoiceCallEventsEnum
  callTypeEnum = VoiceCallTypeEnum
  callingData = { _caller: '', _callee: '', _callerProfilePic: '', _callerName: '', _calleeName: '', _calleeProfilePic: '' }
  ivrData;
  mediaTypeEnum = MediaEnum
  showChatbot:boolean = false;
  noteSpinner: boolean = false;
  lookupCrmTicketAndAuthorApiCall: boolean = false;
  
  showLogFilter: boolean = true;
  /* ticket summary changes */
  isTicketSummarizationEnable:boolean = false;
  isSummaryCallFirstTime:boolean = false;
  isSummaryAPICalling:boolean = false;
  selectedSummaryTab:number = 0;
  selectedSummaryType:number = 8;
  ticketSummaryUserHistory:any[] = [];
  TicketSummaryType: {
    quick_summary: number,
    detailed_summary: number,
    timeline_summary: number,
    issue_summary: number,
    customer_expectation: number
  } = {
      quick_summary: 8,
      detailed_summary: 9,
      timeline_summary: 10,
      issue_summary: 11,
      customer_expectation: 12,
    }
  TicketSummaryDetails:any = {}
  emotion_dict = {
    1: 'joyful',
    2: 'sad',
    3: 'excited',
    4: 'angry',
    5: 'disgusted',
    6: 'confused',
    7: 'satisfied',
    8: 'grateful',
    9: 'frustrated',
    10: 'disappointed',
    11: 'regretful',
    12: 'happy',
    13: 'love'
  }
  sentiment_type_dict = { 1:'positive', 2:'negative', 0:'neutral' }
  isSummaryReadMore:boolean=true;
  isCreditExpire:boolean = false;
  ticketTagList = [];
  sfdcTicketView: boolean = false;
  sfdcChatModeActive: boolean = false;
  viewModeFlag: boolean = true;
  rephraseOptions: any;
  openRephrasePopup: boolean = false;
  rephrasePosition: any;
  /* ticket summary changes */
  editednote: string = '';
  mediaEnum=MediaEnum
  typeOfCrm:number
  @Input() showBackForOzontel: boolean = false;

  Profiledetails:ProfileDetails
  outboundCall:boolean;
  globalTicketID:number;
  responseGenieStatus: number[] = [133,134,135,136];
  PostsType = PostsType;
  channelGroupEnum = ChannelGroup;
  public get getSentiment(): typeof Sentiment {
    return Sentiment;
  }
  ticketTime: any;
  ngOnInit(): void {
    try {
      const selectedLanguage = localStorage.getItem('selectedLanguage');
      const lang = selectedLanguage || 'en';
      this.translate.use(lang);
    } catch (error) {}

    const userObj = JSON.parse(localStorage.getItem('user'));
    this.sfdcTicketView = JSON.parse(localStorage.getItem('sfdcTicketView'));
    if (this.sfdcTicketView) {
      this._loaderService.toggleMainLoader({ isViewLoaded: true });
      this._loaderService.toggleMainLoader({ isApiLoaded: true });
    }
    if (userObj) {
      this.userInfoToggle = localStorage.getItem(`userInfoToggle_${userObj?.data?.user?.userId}`) ? localStorage.getItem(`userInfoToggle_${userObj?.data?.user?.userId}`) == 'false' ? false : true : false;
      if(userObj?.data?.user?.role == this.userRoleEnum.ReadOnlySupervisorAgent){
        this.isReadOnly = true;
      }
      else this.isReadOnly = false;
    }
    this.clearInputs()
    this.subscribeToObservables()
    this._postDetailService.postDetailPage = true;
    this.autoCloseWindow = this._postDetailService?.autoCloseWindow;
    this.startIndex = this._postDetailService.startIndex;
    this.endIndex = this._postDetailService.endIndex;

    /* if (this.sfdcTicketView) {
      this._replyService.openRephraseSFDC.subscribe((res) => {
        if (res) {
          this.openRephrasePopup = res?.openPopup;
          this.rephrasePosition = res?.position;
          this.rephraseOptions = res?.rephraseOptions;
          this._cdr.detectChanges();
          this._replyService.openRephraseSFDC.next(null);
        }
      })
    } */
    if (this._postDetailService.openRephrasePopup && !this.sfdcTicketView) {
      this._postDetailService.openRephrasePopup = false;
      /* this._replyService.openRephrase.next({
        openPopup: false,
        position: null,
        rephraseOptions: null,
        tab: this._navigationService.currentSelectedTab
      }); */
      this._replyService.openRephraseSignal.set({
        openPopup: false,
        position: null,
        rephraseOptions: null,
        tab: this._navigationService.currentSelectedTab
      });
    }

    this.subs.add(
      this._ticketSignalrService.voipSignalCall.subscribe(
        (res) => {
          if (res) {
            this._voip.voipSignalR(res);
            this.callObj = this._voip.callObj
            this.callRunning = true
            this.ivrData = this.callObj.ivrSelectedNum ? this.callObj.ivrSelectedNum : '';
            if (this.callObj) {
              if (this.callObj.callEventType == 'inbound' || this.callObj.callEventType == 'outbound') {
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
              if (this.callObj.callEventType == this.voiceEventEnum.InboundHangup || this.callObj.callEventType == this.voiceEventEnum.OutboundHangup) {
                this.enableNote = true
                this.callRunning = false;
              }
            }
          } else {
            this.callRunning = false;
          }
          this._cdr.detectChanges();
        })
    );

    this.MediaUrl = environment.MediaUrl;
    if (this._postDetailService.openInNewTab) {
      this.hideQuickWindow = true;
      this._postDetailService.openInNewTab = false;
    }
    this.comminicationLogLoading = true;
    if (
      localStorage.getItem('commlogfilter') &&
      localStorage.getItem('commlogfilter') !== 'NaN'
    ) {
      this.LogFilter.radioButtonList = this.LogFilter.radioButtonList.filter(
        (obj) => {
          obj.checked =
            obj.value === Number(localStorage.getItem('commlogfilter'))
              ? true
              : false;
          return obj;
        }
      );
    } else {
      localStorage.setItem('commlogfilter', String(0));
      this.LogFilter.radioButtonList = this.LogFilter.radioButtonList.filter(
        (obj) => {
          obj.checked = obj.value === 0 ? true : false;
          return obj;
        }
      );
    }
    if (this.sfdcTicketView) {
      localStorage.setItem('commlogfilter', String(1));
      this.LogFilter.radioButtonList = this.LogFilter.radioButtonList.filter(
        (obj) => {
          obj.checked = obj.value === 1 ? true : false;
          return obj;
        }
      );
    }
    // check action status
    if (
      localStorage.getItem('ActionStatusFilter') &&
      localStorage.getItem('ActionStatusFilter') !== 'NaN'
    ) {
      if (Number(localStorage.getItem('commlogfilter')) === 1) {
        this.hideActionstatus = true;
      }
    } else {
      // localStorage.setItem('commlogfilter', String(0));
      this.hideActionstatus = false;
    }
     const profileObj: any = localStorage.getItem('layoutMode') == '2' ? postDetailProfileMenu : postDetail;
    this.postDetailData = profileObj;
    // this.GetTickets(this.filter);

    if (this.currentPostType === PostsType.chatbot)
    {
      this.TicketData =[this._chatBotService.selectedBaseMention]
    }

    // console.log(this.TicketData);
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    // if (this.postDetailTab) {
    this.subs.add(
      this._navigationService.fireOpenInNewTab.subscribe((guid) => {
        if (guid) {
          if (guid === this.postDetailTab.tab.guid) {
            if (
              this.postDetailTab.tab &&
              this._postDetailService.refreshNewTab
            ) {
              const filterJson = this.postDetailTab.tab.filterJson
                ? JSON.parse(this.postDetailTab.tab.filterJson)
                : null;
              if (filterJson) {
                const genericFilter = filterJson as GenericFilter;
                if (genericFilter.postsType === PostsType.TicketHistory) {
                  this.hideQuickWindow = true;
                  this._postDetailService.openInNewTab = false;
                  this.postShortenedData = false;
                  // get ticketSummary by ticketId
                  this.getTicketSummaryByTicketID(genericFilter);
                }
              }
            }
          }
        }
      })
    );

    const valueSetTicketForRefreshSignal = this.ticketService.setTicketForRefreshSignal();
    if (valueSetTicketForRefreshSignal) {
      this.baseLogObject.push({
        isCommunicationLog: true,
      });
      this.ticketService.setTicketForRefreshSignal.set(null);
    }
    // this.subs.add(
    //   this.ticketService.setTicketForRefresh.subscribe((data) => {
    //     if (data) {
    //       this.baseLogObject.push({
    //         isCommunicationLog: true,
    //       });
    //       this.ticketService.setTicketForRefresh.next(null);
    //     }
    //   })
    // );
    
    // this.subs.add(
    //   this.ticketService.openCallDetailWindow.subscribe((response) => {
    //     if (response) {
    //       this.callNote = true;
    //       this.openCallDetailFlag = response;
    //     } else {
    //       this.openCallDetailFlag = false;
    //     }
    //   })
    // );
    // this.subs.add(
    //   this._replyService.clearNoteAttachment.subscribe((response) => {
    //     if (response && this.selectedNoteMedia?.length > 0) {
    //      this.clearInputs();
    //     }
    //   })
    // );

    // this.postObj = this._postDetailService.postObj;
    // this.selectedPostID = this.postObj?.ticketInfo?.ticketID;
    // this.getCommunicationLogHistory();
    // this.getAuthorDetails();
    // this.getTicketTimeline(null);
    // this.getTicketSummary();
    // this.getSentimentUpliftAndNPSScore();
    this.setEventSubscriptions();

    this.subs.add(
      this.ticketService.changeChatOnReassignment.subscribe((data) => {
        if (data) {
          this._postDetailService.postObj.ticketInfo.assignedTo = +data;
          this.changeChatBotView()
        }
      })
    );

    if (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare) {
      this.isCSDUser = true;
    } else if (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare) {
      this.isBrandUser = true;
    }

    this.subs.add(
      this._ticketSignalrService.voipMentionSignalCall.subscribe((response) => {
        if (response) {
          const communicationLog: any = this._voip.voipMentionSignalR(
            response.message
          );
          this._postDetailService.postObj = communicationLog;
          this.postObj = this._postDetailService.postObj;
          this._postDetailService.voiceChannel = communicationLog.channelGroup;
          this._postDetailService.voiceTicketId = communicationLog.ticketID;
          this._postDetailService.voiceTagId = communicationLog.tagID;
          if (response?.message?.channel?.Title != 'ORIGINATE') {
            communicationLog.isCommunicationLog = false;
            if (communicationLog?.mediaType != MediaEnum.AUDIO) {
              this.callNote = false;
              this.callRunning = false;
            }
            this._NgZone.runOutsideAngular(() => {
              this._NgZone.run(() => {
                /* this._voip.onReassignVoipAgent.next(communicationLog); */
                this._voip.onReassignVoipAgentSignal.set(communicationLog);
                this.baseLogObject.push(communicationLog)

              });
              this.postDetailTimeOut =setTimeout(() => {
                this.postDetail.nativeElement.scrollTop =
                  this.postDetail.nativeElement.scrollHeight;
              }, 2000);
            });
          }
        }
      })
    );

    this.subs.add(
    this._postDetailService.updateChannelList.subscribe((res) => {
      if (res) {
        this.getConnectedAuthors(res);
      }
    }));

    if (this.document?.location?.ancestorOrigins && this.document?.location?.ancestorOrigins?.length > 0) {
      const ancestorOrigins = this.document?.location?.ancestorOrigins;

      if (ancestorOrigins && ancestorOrigins.length > 0) {
        this.deepLinkingFlag = ancestorOrigins.contains('https://cx.locobuzz.com') || ancestorOrigins.contains('https://demo.locobuzz.com') || ancestorOrigins.contains("https://locobuzzng-uat-aws.locobuzz.com") ? true : false;
      }
    }

    this.subs.add(
      this._postDetailService.autoCloseWindowObs.subscribe((res) => {
        if (res) {
          this.CloseTicketDetailWindow();
        }
      })
    )

    // this.subs.add(
    //   this.ticketService.agentAssignToObservable.pipe(distinctUntilChanged()).subscribe((res) => {
    //     if (res) {
    //       if (this.currentUser?.data?.user?.role == this.userRoleEnum.Agent) {
    //         if (this.TicketData.length == 0) {
    //           this.CloseTicketDetailWindow();
    //         }
    //         else if (this.TicketData.length > 0) {
    //           if (this.currentUser?.data?.user?.actionButton?.seeAssignedTicketsEnabled) {
    //             let index = this.selectedIndex == this.TicketData.length ? this.TicketData.length - 1 : this.selectedIndex
    //             const postDetail = this.TicketData[index];
    //             if (postDetail) {
    //               /* this._postDetailService.currentPostObject.next(
    //                 postDetail.ticketInfo.ticketID
    //               ); */
    //               this._postDetailService.currentPostObjectSignal.set(
    //                 postDetail.ticketInfo.ticketID
    //               );
    //             }
    //           } else {
    //             this.moveTONextTicketLogic()
    //           }
    //         }
    //       } else {
    //         this.moveTONextTicketLogic()
    //       }
    //     }
    //   })
    // )

    this.subs.add(
      this.ticketService.csdAssignObs.pipe(distinctUntilChanged()).subscribe((res) => {
        if (res) {
          if (this.currentUser?.data?.user?.role == this.userRoleEnum.Agent) {
            if (this.TicketData.length == 0) {
              this.CloseTicketDetailWindow();
            }
            else if (this.TicketData.length > 0) {
              if (this.currentUser?.data?.user?.actionButton?.seeAssignedTicketsEnabled) {
                let index = this.selectedIndex == this.TicketData.length ? this.TicketData.length - 1 : this.selectedIndex
                const postDetail = this.TicketData[index];
                if (postDetail) {
                  /* this._postDetailService.currentPostObject.next(
                    postDetail.ticketInfo.ticketID
                  ); */
                  this._postDetailService.currentPostObjectSignal.set(
                    postDetail.ticketInfo.ticketID
                  );
                }
              } else {
                this.moveTONextTicketLogic()
              }
            }
          } else {
            this.moveTONextTicketLogic()
          }
        }
      })
    )
    sessionStorage.removeItem('detailviewurl');
    // this.subscribeToEvents();

    // this.subs.add(
    //   this.ticketService.ticketHistoryActionPerformObs.subscribe((res) => {
    //     if (res > 0) {
    //       const ticketIndex = this.TicketData.findIndex(
    //         (obj) => obj.ticketInfo.tagID === res
    //       );
    //       if (ticketIndex > -1) {
    //         this.TicketData.splice(ticketIndex, 1);
    //         this._cdr.detectChanges();
    //       }
    //     }
    //   })
    // )

    // this.subs.add(
    //   this.ticketService.ticketStatusChangeObs.subscribe((res) => {
    //     if (res) {
    //       const index = this.TicketData.findIndex((obj) => obj.tagID == res?.tagID);
    //       if (index > -1) {
    //         this.TicketData.splice(index, 1);
    //       }
    //       this._cdr.detectChanges();
    //     }
    //   })
    // )

    // this.subs.add(
    //   this.ticketService.ticketEscalationObs.subscribe((res) => {
    //     if (res) {
    //       this.postFootDisable = true;
    //       this._cdr.detectChanges();
    //     }
    //   })
    // )
    this.crmLable = this.currentUser?.data?.user?.categoryId == 1597 ? this.translate.instant('Assign-Case-To-Volunteer') : this.translate.instant('crm');

    /* this.subs.add(
      this.ticketService.updateCRMDetails.subscribe((res) => {
        if (res) {
          if
            (
            res?.TagID == this.postObj.tagID
          ) {
            if (res?.SrID) {
              // this.postData.ticketInfo.leadID = res?.leadID;
              // this.post.leadID = res?.leadID;
              this.postObj.ticketInfo.srid = res.SrID;
              this.post.srID = res?.SrID;
              if (this.postObj?.ticketInfo?.leadID) {
                this.post.leadID = this.postObj?.ticketInfo?.leadID;
                this._cdr.detectChanges();
              }
            }
            if (res?.leadID) {
              this.postObj.ticketInfo.leadID = res?.leadID;
              this.post.leadID = res?.leadID;
              if (this.postObj?.ticketInfo?.srid) {
                this.post.srID = this.postObj?.ticketInfo?.srid;
                this._cdr.detectChanges();
              }
            }
            this._cdr.detectChanges();
          }
        }
      }
      )
    ) */
     this.subs.add(
     this.ticketService.animalWildFareObs.subscribe((res) => {
      if(res)
      {
        if (res?.data?.TagID == this._postDetailService?.postObj?.tagID) {
         this.postObj.ticketInfo.srid = res?.data?.SRID;
            this._postDetailService.postObj.ticketInfo.srid = res?.data?.SRID;
            this._cdr.detectChanges();
        }
      }
    }
    ));
    this.subs.add(
      this._dynamicServices.updateMethodCallToApi.subscribe((response) => {
        if (response) {
          this.lookupCrmTicketAndAuthorApiCall = true;
          // this.openCallDetailFlag = response;
        }
      })
    );

    this.subs.add(
      this.ticketService.failedToUpdateTicketStatus.subscribe((ticketDetails) => {
        if (ticketDetails.ticketId && this.postObj.ticketID == ticketDetails.ticketId) {
          this.showRefreshButton = false;
          this.postFootDisable = false;
          this.baseLogObject = [];
          const keyobj = {
            AuthorSocialID: this.postObj.author.socialId,
            brandID: this.postObj.brandInfo.brandID,
            brandName: this.postObj.brandInfo.brandName,
          };
          this.ticketService
            .GetAuthorBasedPendingSuccessFailedCount(keyobj)
            .subscribe((data) => {
              if (
                this.postObj.ticketInfoSsre.ssreStatus ===
                SSRELogStatus.SSREInProcessing ||
                this.postObj.ticketInfoSsre.ssreStatus ===
                SSRELogStatus.IntentFoundStillInProgress
              ) {
                this.ssreinprogress = true;
                this.ssresuccess = false;
                this.bulkinprogress = false;
                this.bulkreplysuccess = false;
                this.postFootDisable = true;
                /* this.ticketService.ssreActionPerformed.next(this.postObj); */
                this.ticketService.ssreActionPerformedSignal.set(this.postObj);
                const brandInfo = this.brandList.find((x)=>x.brandID == this.postObj.brandInfo.brandID);
                if(brandInfo)
                {
                  this.ssreinprogresstitle = `${(brandInfo?.isWorkflowEnabled) ? 'Workflow ' : 'SSRE '} ${this.translate.instant('working-on-it-Please-wait')}`;
                }
                // this.ssreinprogresstitle =
                //   `${this.postObj?.ticketInfoWorkflow?.workflowId ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;
              } else {
                this.ssreinprogress = false;
                this.ssresuccess = false;
                // this.ticketService.ssreActionEnablePerformed.next(this.postObj);
              }

              const pending = data.data.pending ? data.data.pending : 0;
              const success = data.data.success ? data.data.success : 0;
              const failed = data.data.failed ? data.data.pending : 0;
              if (pending + success + failed > 0 && !this.ssreinprogress) {
                this.bulkinprogress = true;
                this.bulkreplysuccess = false;
                this.postFootDisable = true;
                /* this.ticketService.bulkActionPerformed.next(this.postObj); */
                this.ticketService.bulkActionPerformedSignal.set(this.postObj);
                this.bulkpending = pending;
                this.bulksuccess = success;
                this.bulkfailed = failed;
                if (this.bulkpending > 1) {
                  this.bulkinprogresstitle =
                    this.bulkpending + ' Replies being sent';
                } else if (this.bulkpending === 1) {
                  this.bulkinprogresstitle =
                    this.bulkpending + ' Reply being sent';
                }
              } else {
                this.bulkinprogress = false;
                this.bulkreplysuccess = false;
                // this.ticketService.bulkActionEnablePerformed.next(this.postObj);
              }

              if (this.ssreinprogress || this.bulkinprogress) {
                this.postFootDisable = true;
                this.disableTicketOverview = true;
              } else {
                this.postFootDisable = false;
                this.disableTicketOverview = false;
              }
              this.reRenderHistory = true;
              this.getCommunicationLogHistory(null, null, true);
              this.getTicketDetails(this.postObj.ticketInfo.ticketID);
            });
        }
      })
    )
    /* ticket summary changes */
    this.getSuggestedRresponse();
    this.subs.add(
      this.ticketService.newTicketSummary.subscribe((res) => {
        if (res.status) {
          if (res.type == 'ticket') {
            this.isSummaryCallFirstTime = false
            this.ticketSummary = false;
            this.selectedSummaryTab = 0;
            this.selectedSummaryType = 8
            this.ticketService.newTicketSummary.next({ status: false, data: null, type: '' });
          }
        }
      })
    )

    if (this.postObj?.aiTicketIntelligenceModel?.ticketTagging) {
      this.ticketTagList = JSON.parse(this.postObj?.aiTicketIntelligenceModel?.ticketTagging);
    }
    /* ticket summary changes */

    if(localStorage.getItem('sfdcintegration') == 'true'){
      this.hideQuickWindow = false;
    }

    if (this.sfdcTicketView) {
    this._accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.currentUser = user;
      const filterObj = this._filterService.getGenericRequestFilter(this.postObj);
    
        this.brandList = this._filterService.fetchedBrandData

        this.brandList = this._filterService.fetchedBrandData.filter(
          (item) => this.postObj?.brandInfo?.brandID === +item.brandID
        );

        this.chatEnableMessenger =
          this.brandList.find(
            (brand) => brand.botEnable.showMessenger == true
          ) !== undefined;
        this.chatEnableWhatsapp =
          this.brandList.find(
            (brand) => brand.botEnable.showWhatsapp == true
          ) !== undefined;
        this.chatEnableChatbot =
          this.brandList.find(
            (brand) => brand.botEnable.showWebsiteBot == true
          ) !== undefined;
        this.chatEnableInstagram =
          this.brandList.find(
            (brand) => brand.botEnable.showInstagram == true
          ) !== undefined;
        this.chatEnableGMB =
          this.brandList.find(
            (brand) => brand.botEnable.showGMB == true
          ) !== undefined;
      this.chatEnableTelegram =
        this.brandList.find(
          (brand) => brand.botEnable.showTelegram == true
        ) !== undefined;
        this.filterStartEpoch = filterObj.startDateEpoch;
        this.filterEndEpoch = filterObj.endDateEpoch;
        const ActionButton = this.currentUser?.data?.user?.actionButton;
        this.chatbotStatus =true



    });

    this.subs.add(
      this.exotelService.exotelCallEnded.subscribe((res)=>{
        if(res)
        {
          this.callRunning = false;
          this._ticketSignalrService.exotelMultipleSignalR=[]
        }
      })
    )


  }

    this.typeOfCrm = this._filterService.fetchedBrandData?.find((x) => x.brandID == this.postObj?.brandInfo?.brandID)?.typeOfCRM


  // this.subs.add(
  //   this.ticketService.crmChatbotCloseTicketObs.subscribe((res)=>{
  //     if(res)
  //     {
  //       if(res?.status==TicketStatus.Close)
  //       {
  //         this.viewModeFlag = true;
  //         this.disableSwitchMode = true;
  //       }else
  //       {
  //         this.disableSwitchMode = false;
  //       }
  //       if(res?.refresh)
  //       {
  //         this.getCommunicationLogHistory(null, null, true);
  //         this.getTicketDetails(this.postObj.ticketInfo.ticketID);
  //       }
  //     }
  //   })
  // )

  this.initials = this.ticketService.getInitials(this.postObj.author.name)

    this.subs.add(
      this.ticketService.emailPopUpViewObs.subscribe((res) => {
        if (res.status) {
          this.ticketService.emailPopUpViewObs.next({ status: false, isOpen: false, data: null });
          this.emailExpandView = res.isOpen;
          if (res.isOpen && res.data) {
            this.minimizeEmailView = false;
            this.ticketService.emailPopDataObs.next({ status: true, data: res.data })
          }
        }
      }
    )
  )
    this.Profiledetails = this._ticketSignalrService.Profiledetails;


    this.subs.add(
      this.exotelService.exotelIncomingOutgoingCall.subscribe((res) => {
        // if (this.postDetailTab?.guid == res?.guid) {
        this.showCallPopup = true;
        this.inbound = true;
        if (res.type == 'incoming') {
          this.outboundCall = false;
          this.callingData._caller = res.callFromNumber;
          this.callingData._callee = this.currentUser?.data?.user?.firstName + ' ' + this.currentUser?.data?.user?.lastName;
          this.callingData._callerName = '';
          this.callingData._calleeName = this._voip.callObj.agentName;
          //  this.callingData._calleeProfilePic = this._voip.callObj.agentProfilePic;
          this.callingData._calleeProfilePic = this.Profiledetails?.profilePic
          this.callingData._callerProfilePic = '';
          this._postDetailService.incomingOrOutgoing = true
          this._postDetailService.callAgainNumber = res.callFromNumber
        } else {
          this.inbound = false
          this.outboundCall = true;
          this.callingData._caller = this.currentUser?.data?.user?.firstName + ' ' + this.currentUser?.data?.user?.lastName;
          this.callingData._callee = this.exotelService.callToNumber;
          this.callingData._callerName = '';
          this.callingData._calleeName = this._voip.callObj.agentName;
          this.callingData._calleeProfilePic = this._voip.callObj.agentProfilePic;
          this.callingData._callerProfilePic = this.Profiledetails?.profilePic;
          this._postDetailService.incomingOrOutgoing = false
          this._postDetailService.callAgainNumber = this.exotelService.callToNumber
        }
        this._cdr.detectChanges();
        // }
      })
    )

    this.subs.add(
      this.ticketService.emailMaximumMinimumObs.subscribe((res) => {
          this.minimizeEmailView = res;
      })
    )

    this.subs.add(
      this.ticketService.mediaSideBarObs.subscribe((res) => {
        this.userInfoToggle = false
        this.toggleMediaView()
      })
    )

    if(this.postObj.channelGroup == ChannelGroup.Email)
    {
      this.subs.add(
        this._postDetailService.postDetailEditNotesObs.subscribe((res)=>{
          this.noteChange(res)
        })
      )
    }
    this.subs.add(
      this.exotelService.exotelCallEnded.subscribe((res) => {
          this.showCallPopup = false;
          this._ticketSignalrService.exotelMultipleSignalR = []
          this._cdr.detectChanges();
      }
      )
    )


    this.subs.add(
      this._ticketSignalrService.exotelCallConnectedObs.subscribe((res) => {
        if (this._ticketSignalrService?.exotelMultipleSignalR?.length == 2 && this._ticketSignalrService?.exotelMultipleSignalR[0] == this._ticketSignalrService?.exotelMultipleSignalR[1]) {
          this.showCallPopup = false;
          if (!this.openCallDetailFlag)
          {
          this.openCallDetailFlag = true;
          this.callRunning = true;
          this.callNote = true;
            this.noteInput = true;
          }
           const mention: BaseMention = this._voip.voipMentionSignalR(res.data);
                          this._postDetailService.voipTagID = mention?.tagID;
          this._cdr.detectChanges();
        }
      }
      )
    )
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this.activeTab = layoutType == 1 ? 1 : 0;
          this._cdr.detectChanges();
        }
      })
    )
    if(this.ozontelFlag)
    {
      this.hideQuickWindow = true;
      this.userInfoToggle = false
    }
    if(!this.defaultLayout){
      this.userInfoToggle = true;
    }
    this.ChannelImage = ChannelImage[ChannelGroup[this.postObj?.channelGroup]];
    this.ChannelName = this.MapChannelType(this.postObj);
    if (this.postObj?.author) {
      this.userProfileName = this.postObj?.author?.name;
      this.userProfileImg = this.postObj?.author?.picUrl && this.postObj?.author?.picUrl.includes('assets/images/agentimages/sample-image.svg') ? 'initials' : this.postObj?.author?.picUrl;
      if (this.postObj?.channelGroup == ChannelGroup.Voice) {
        this.userProfileImg = 'assets/images/agentimages/sample-image.svg'
      }
    }
    this.brandImage = this.getBrandLogo(this.postObj?.brandInfo?.brandID);
    this.ticketTime = this.ticketService.calculateTicketTimes(this.postObj);
    this.subs.add(
      this._postDetailService.sortHandTicketTimeUpdate.subscribe((status) => {
        if (status) {
          this.ticketTime = this.ticketService.calculateTicketTimes(this.postObj);
        }
      })
    )
  }

  filterTabChanges(value){
    if (value) {
      const filterObj = this._navigationService.getFilterJsonBasedOnTabGUID(value.guid);
      if (filterObj.postsType === PostsType.Tickets) {
        this.brandList = this._filterService.fetchedBrandData.filter(
          (item) =>
            filterObj.brands.some(
              (brand) => brand.brandID === +item.brandID
            )
        );

        this.chatEnableMessenger =
          this.brandList.find(
            (brand) => brand.botEnable.showMessenger == true
          ) !== undefined;
        this.chatEnableWhatsapp =
          this.brandList.find(
            (brand) => brand.botEnable.showWhatsapp == true
          ) !== undefined;
        this.chatEnableChatbot =
          this.brandList.find(
            (brand) => brand.botEnable.showWebsiteBot == true
          ) !== undefined;
        this.chatEnableInstagram =
          this.brandList.find(
            (brand) => brand.botEnable.showInstagram == true
          ) !== undefined;
        this.chatEnableGMB =
          this.brandList.find(
            (brand) => brand.botEnable.showGMB == true
          ) !== undefined;
        this.chatEnableTelegram =
          this.brandList.find(
            (brand) => brand.botEnable.showTelegram == true
          ) !== undefined;
        this.filterStartEpoch = filterObj.startDateEpoch;
        this.filterEndEpoch = filterObj.endDateEpoch;
        const ActionButton = this.currentUser?.data?.user?.actionButton;
        this.chatbotStatus =
          this.brandList?.length > 0 &&
          (this.currentUser?.data?.user?.role === UserRoleEnum.Agent ||
            this.currentUser?.data?.user?.role ===
            UserRoleEnum.SupervisorAgent ||
          this.currentUser?.data?.user?.role ===
          UserRoleEnum.LocationManager ||
            this.currentUser?.data?.user?.role ===
            UserRoleEnum.TeamLead ||
            this.currentUser?.data?.user?.role == UserRoleEnum.NewBie) &&
          (this.chatEnableMessenger ||
            this.chatEnableWhatsapp ||
            this.chatEnableChatbot ||
            this.chatEnableInstagram || this.chatEnableGMB || this.chatEnableTelegram) && ActionButton.chatSectionEnabled


      }
    }
  }

  clearNoteAttachmentSignalChanges(response){
    if (response && this.selectedNoteMedia?.length > 0) {
      this.clearInputs();
    }
  }

  ticketEscalationObsSignalChange(res){
    if (res) {
      this.postFootDisable = true;
      this._cdr.detectChanges();
    }
  }

  crmChatbotCloseTicketObsSignalChanges(res){
    if (res) {
      if (res?.status == TicketStatus.Close) {
        this.viewModeFlag = true;
        this.disableSwitchMode = true;
      } else {
        this.disableSwitchMode = false;
      }
      if (res?.refresh) {
        this.getCommunicationLogHistory(null, null, true);
        this.getTicketDetails(this.postObj.ticketInfo.ticketID);
      }
    }
  }

  ticketHistoryActionPerformObsSignalChanges(res){
    if (res > 0) {
      const ticketIndex = this.TicketData.findIndex(
        (obj) => obj.ticketInfo.tagID === res
      );
      if (ticketIndex > -1) {
        this.TicketData.splice(ticketIndex, 1);
        this._cdr.detectChanges();
      }
    }
  }
  
  agentAssignToObservableSignalChanges(res){
    if (res) {
      if (this.currentUser?.data?.user?.role == this.userRoleEnum.Agent) {
        if (this.TicketData.length == 0) {
          this.CloseTicketDetailWindow();
        }
        else if (this.TicketData.length > 0) {
          if (this.currentUser?.data?.user?.actionButton?.seeAssignedTicketsEnabled) {
            let index = this.selectedIndex == this.TicketData.length ? this.TicketData.length - 1 : this.selectedIndex
            const postDetail = this.TicketData[index];
            if (postDetail) {
              /* this._postDetailService.currentPostObject.next(
                postDetail.ticketInfo.ticketID
              ); */
              this._postDetailService.currentPostObjectSignal.set(
                postDetail?.ticketInfo?.ticketID
              );
            }
          } else {
            this.moveTONextTicketLogic()
          }
        }
      } else {
        this.moveTONextTicketLogic()
      }
    }
  }
  openEditMenu(event: MouseEvent, obj: any) {
    this.getNote(obj);
    if (this.trigger3) {
      this.trigger3.openMenu();   
    }
  }
  ticketStatusChangeObsSignal(res){
    if (res) {
      const index = this.TicketData.findIndex((obj) => obj.tagID == res?.tagID);
      if (index > -1) {
        this.TicketData.splice(index, 1);
      }
      this._cdr.detectChanges();
    }
  }
  moveTONextTicketLogic() {
    if (this.TicketData[this.TicketData.length - 1]?.ticketInfo?.tagID === this.selectedPostID) {
      this.CloseTicketDetailWindow();
    }
    else if (this.TicketData.length > 1) {
      const index = this.TicketData.findIndex(ticket => ticket?.ticketInfo?.tagID === this.selectedPostID);
      if (index !== -1) {
        const postDetail = this.TicketData[index + 1];
        /* this._postDetailService.currentPostObject.next(
          postDetail.ticketInfo.ticketID
        ); */
        this._postDetailService.currentPostObjectSignal.set(
          postDetail.ticketInfo.ticketID
        );
      } else {
        const index = this.TicketData.findIndex(ticket => ticket?.ticketInfo?.tagID === this.selectedPostNextID);
        const postDetail = this.TicketData[index];
        /* this._postDetailService.currentPostObject.next(
          postDetail.ticketInfo.ticketID
        ); */
        this._postDetailService.currentPostObjectSignal.set(
          postDetail?.ticketInfo?.ticketID
        );
      }
    }
    else {
      this.CloseTicketDetailWindow();
    }
  }
  
  subscribeToObservables(): void {
    this.subs.add(
      this._replyService.selectedNoteMedia
        .pipe(filter((res) => res.section === SectionEnum.Ticket))
        .subscribe((ugcarray) => {
          if (ugcarray?.media && ugcarray?.media.length > 0) {
            this.mediaSelectedAsync.next(ugcarray.media);
            this.ticketService.addNoteEmitFromOpenDetail.next(ugcarray.media);
            this.selectedNoteMedia = ugcarray.media;
          }
        })
    );
  }

  openMediaDialog(): void {
    this.mediaGalleryService.startDateEpoch =
      this.postDetailTab?.tab?.Filters?.startDateEpoch;
    this.mediaGalleryService.endDateEpoch =
      this.postDetailTab?.tab?.Filters?.endDateEpoch;
    this._dialog.open(MediaGalleryComponent, {
      data: {
        brandID: this.postObj?.brandInfo?.brandID,
        type: 'AddNoteGallery',
      },
      autoFocus: false,
      panelClass: ['full-screen-modal'],
    });
  }

  removeSelectedNoteMedia(ugcMention: UgcMention): void {
    if (ugcMention) {
      this.selectedNoteMedia = this.selectedNoteMedia.filter((obj) => {
        return obj?.mediaPath !== ugcMention?.mediaPath;
      });
      this.mediaSelectedAsync.next(this.selectedNoteMedia);
      this.ticketService.addNoteEmitFromOpenDetail.next(this.selectedNoteMedia);
      this.mediaGalleryService.selectedNoteMedia = this.selectedNoteMedia;
    }
  }

  clearInputs(): void {
    this.selectedNoteMedia = [];
    this._replyService.selectedNoteMedia.next({ media: [] });
    this.mediaGalleryService.selectedNoteMedia = [];
    this.mediaSelectedAsync.next(this.selectedNoteMedia);
    this.ticketService.addNoteEmitFromOpenDetail.next(this.selectedNoteMedia);
    this._replyService.selectNoteMediaVal(this.selectedNoteMedia)
  }

  ticketStatusChangeSignalChanges(value){
    if (value) {
      this.showRefreshButton = false;
      this.postFootDisable = false;
      this.baseLogObject = [];
      this.postObj.channelGroup == ChannelGroup.Email?this.emailBaseMention =[]:''
      const keyobj = {
        AuthorSocialID: this.postObj.author.socialId,
        brandID: this.postObj.brandInfo.brandID,
        brandName: this.postObj.brandInfo.brandName,
      };
      this.GetAuthorBasedPendingSuccessFailedCountApi =this.ticketService
        .GetAuthorBasedPendingSuccessFailedCount(keyobj)
        .subscribe((data) => {
          if (
            this.postObj.ticketInfoSsre.ssreStatus ===
            SSRELogStatus.SSREInProcessing ||
            this.postObj.ticketInfoSsre.ssreStatus ===
            SSRELogStatus.IntentFoundStillInProgress
          ) {
            this.ssreinprogress = true;
            this.ssresuccess = false;
            this.bulkinprogress = false;
            this.bulkreplysuccess = false;
            this.postFootDisable = true;
            /* this.ticketService.ssreActionPerformed.next(this.postObj); */
            this.ticketService.ssreActionPerformedSignal.set(this.postObj);
            const brandInfo = this._filterService?.fetchedBrandData?.find((x) => x.brandID == this.postObj.brandInfo.brandID);
            if (brandInfo) {
              this.ssreinprogresstitle = `${(brandInfo?.isWorkflowEnabled) ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;
            }
            // this.ssreinprogresstitle =
            //   `${this.postObj?.ticketInfoWorkflow?.workflowId ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;;
          } else {
            this.ssreinprogress = false;
            this.ssresuccess = false;
            // this.ticketService.ssreActionEnablePerformed.next(this.postObj);
          }

          const pending = data.data.pending ? data.data.pending : 0;
          const success = data.data.success ? data.data.success : 0;
          const failed = data.data.failed ? data.data.pending : 0;
          if (pending + success + failed > 0 && !this.ssreinprogress) {
            this.bulkinprogress = true;
            this.bulkreplysuccess = false;
            this.postFootDisable = true;
            /* this.ticketService.bulkActionPerformed.next(this.postObj); */
            this.ticketService.bulkActionPerformedSignal.set(this.postObj);
            this.bulkpending = pending;
            this.bulksuccess = success;
            this.bulkfailed = failed;
            if (this.bulkpending > 1) {
              this.bulkinprogresstitle =
                this.bulkpending + ' Replies being sent';
            } else if (this.bulkpending === 1) {
              this.bulkinprogresstitle =
                this.bulkpending + ' Reply being sent';
            }
          } else {
            this.bulkinprogress = false;
            this.bulkreplysuccess = false;
            // this.ticketService.bulkActionEnablePerformed.next(this.postObj);
          }

          if (this.ssreinprogress || this.bulkinprogress) {
            this.postFootDisable = true;
            this.disableTicketOverview = true;
          } else {
            this.postFootDisable = false;
            this.disableTicketOverview = false;
          }
          this.reRenderHistory = true;
          this.getCommunicationLogHistory(null, null, true);
          this.getTicketDetails(this.postObj.ticketInfo.ticketID);
        });
    }
  }
  
  selectedPostNextID:number;
  selectedPostPrevID:number;
  setEventSubscriptions(): void {
    const value = this.ticketService.ticketStatusChangeSignal();
    if(value){
      this.ticketStatusChangeSignalChanges(value);
    }
    // this.subs.add(
    //   this.ticketService.ticketStatusChange.subscribe((value) => {
    //     if (value) {
    //       this.showRefreshButton = false;
    //       this.postFootDisable = false;
    //       this.baseLogObject = [];
    //       const keyobj = {
    //         AuthorSocialID: this.postObj.author.socialId,
    //         brandID: this.postObj.brandInfo.brandID,
    //         brandName: this.postObj.brandInfo.brandName,
    //       };
    //       this.ticketService
    //         .GetAuthorBasedPendingSuccessFailedCount(keyobj)
    //         .subscribe((data) => {
    //           if (
    //             this.postObj.ticketInfoSsre.ssreStatus ===
    //             SSRELogStatus.SSREInProcessing ||
    //             this.postObj.ticketInfoSsre.ssreStatus ===
    //             SSRELogStatus.IntentFoundStillInProgress
    //           ) {
    //             this.ssreinprogress = true;
    //             this.ssresuccess = false;
    //             this.bulkinprogress = false;
    //             this.bulkreplysuccess = false;
    //             this.postFootDisable = true;
    //             this.ticketService.ssreActionPerformed.next(this.postObj);
    //             const brandInfo = this._filterService?.fetchedBrandData?.find((x) => x.brandID == this.postObj.brandInfo.brandID);
    //             if (brandInfo) {
    //               this.ssreinprogresstitle = `${(brandInfo?.isWorkflowEnabled) ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;
    //             }
    //             // this.ssreinprogresstitle =
    //             //   `${this.postObj?.ticketInfoWorkflow?.workflowId ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;;
    //           } else {
    //             this.ssreinprogress = false;
    //             this.ssresuccess = false;
    //             // this.ticketService.ssreActionEnablePerformed.next(this.postObj);
    //           }

    //           const pending = data.data.pending ? data.data.pending : 0;
    //           const success = data.data.success ? data.data.success : 0;
    //           const failed = data.data.failed ? data.data.pending : 0;
    //           if (pending + success + failed > 0 && !this.ssreinprogress) {
    //             this.bulkinprogress = true;
    //             this.bulkreplysuccess = false;
    //             this.postFootDisable = true;
    //             this.ticketService.bulkActionPerformed.next(this.postObj);
    //             this.bulkpending = pending;
    //             this.bulksuccess = success;
    //             this.bulkfailed = failed;
    //             if (this.bulkpending > 1) {
    //               this.bulkinprogresstitle =
    //                 this.bulkpending + ' Replies being sent';
    //             } else if (this.bulkpending === 1) {
    //               this.bulkinprogresstitle =
    //                 this.bulkpending + ' Reply being sent';
    //             }
    //           } else {
    //             this.bulkinprogress = false;
    //             this.bulkreplysuccess = false;
    //             // this.ticketService.bulkActionEnablePerformed.next(this.postObj);
    //           }

    //           if (this.ssreinprogress || this.bulkinprogress) {
    //             this.postFootDisable = true;
    //             this.disableTicketOverview = true;
    //           } else {
    //             this.postFootDisable = false;
    //             this.disableTicketOverview = false;
    //           }
    //           this.reRenderHistory = true;
    //           this.getCommunicationLogHistory(null, null, true);
    //           this.getTicketDetails(this.postObj.ticketInfo.ticketID);
    //         });
    //     }
    //   })
    // );

    const currentPostObject = this._postDetailService.currentPostObjectSignal();
    if (currentPostObject > 0) {
      this.currentPostObjectSignalChange(currentPostObject);
    }

    /* this.subs.add(
      this._postDetailService.currentPostObject.subscribe((value) => {
        if (value > 0) {
          this.showRefreshButton = false;
          this._postDetailService.replyText = '';
          this.postObj =
            this.TicketData.find((obj) => obj.ticketInfo.ticketID === value) ||
            this._postDetailService.postObj;
          if (this.postObj) {
            this._postDetailService.postDetailWindowStatus.next({
              status: true,
              ticketId: this.postObj?.ticketID,
            });
          }

          this.selectedPostID = this.postObj?.ticketInfo?.tagID;
          let index = this.TicketData.findIndex((r) => r.tagID == this.selectedPostID)
          this.selectedPostNextID = this.TicketData[index + 1]?.tagID;
          this.selectedPostPrevID = this.TicketData[index - 1]?.tagID;
          this._postDetailService.postObj = this.postObj;
          this.authorDetails = {};
          this.communicationLogResponse = {};
          this.upliftAndSentimentScore = {};
          this.ticketInfo = {};
          this.baseLogObject = [];
          if (this.postObj) {
            this.getCommunicationLogHistory();
            if(!this.sfdcTicketView){
              this.getTicketLockDetails();
            }
            
            const keyobj = {
              AuthorSocialID: this.postObj.author.socialId,
              brandID: this.postObj.brandInfo.brandID,
              brandName: this.postObj.brandInfo.brandName,
            };
            this.ticketService
              .GetAuthorBasedPendingSuccessFailedCount(keyobj)
              .subscribe((data) => {
                if (
                  this.postObj.ticketInfoSsre.ssreStatus ===
                  SSRELogStatus.SSREInProcessing ||
                  this.postObj.ticketInfoSsre.ssreStatus ===
                  SSRELogStatus.IntentFoundStillInProgress
                ) {
                  this.ssreinprogress = true;
                  this.ssresuccess = false;
                  this.bulkinprogress = false;
                  this.bulkreplysuccess = false;
                  this.postFootDisable = true;
                  this.ticketService.ssreActionPerformed.next(this.postObj);
                  const brandInfo = this._filterService?.fetchedBrandData?.find((x) => x.brandID == this.postObj.brandInfo.brandID);
                  if (brandInfo) {
                    this.ssreinprogresstitle = `${(brandInfo?.isWorkflowEnabled) ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;
                  }
                  // this.ssreinprogresstitle =
                  //   `${this.postObj?.ticketInfoWorkflow?.workflowId ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;;
                } else {
                  this.ssreinprogress = false;
                  this.ssresuccess = false;
                  //this.ticketService.ssreActionEnablePerformed.next(this.postObj);
                }

                const pending = data.data.pending ? data.data.pending : 0;
                const success = data.data.success ? data.data.success : 0;
                const failed = data.data.failed ? data.data.pending : 0;
                if (pending + success + failed > 0 && !this.ssreinprogress) {
                  this.bulkinprogress = true;
                  this.bulkreplysuccess = false;
                  this.postFootDisable = true;
                  this.ticketService.bulkActionPerformed.next(this.postObj);
                  this.bulkpending = pending;
                  this.bulksuccess = success;
                  this.bulkfailed = failed;
                  if (this.bulkpending > 1) {
                    this.bulkinprogresstitle =
                      this.bulkpending + ' Replies being sent';
                  } else if (this.bulkpending === 1) {
                    this.bulkinprogresstitle =
                      this.bulkpending + ' Reply being sent';
                  }
                } else {
                  this.bulkinprogress = false;
                  this.bulkreplysuccess = false;
                  //this.ticketService.bulkActionEnablePerformed.next(this.postObj);
                }
                if (this.ssreinprogress || this.bulkinprogress) {
                  this.postFootDisable = true;
                  this.disableTicketOverview = true;
                } else {
                  this.postFootDisable = false;
                  this.disableTicketOverview = false;
                }
                // this.replyDays = false;
                if (
                  this.postObj.channelGroup === ChannelGroup.WhatsApp ||
                  this.postObj.channelType === ChannelType.FBMessages ||
                  this.postObj.channelType === ChannelType.InstagramMessages
                ) {
                  this.showReplyMessageExpiry();
                  this.sfdcChatModeActive = true;
                }
                this.getTicketDetails(this.postObj.ticketInfo.ticketID);
              });

            this.markIsRead();
            // this.getAuthorDetails();
            // this.getTicketTimeline(null);
            // this.getTicketSummary();
            // this.getSentimentUpliftAndNPSScore();
            this._replyService.replyActionPerformed.next(null);
          }
          this.selectedIndex = this.TicketData.findIndex((obj) => obj.ticketInfo.ticketID === value)
        }
        const postCRMdata = this._filterService.fetchedBrandData.find(
          (brand: BrandList) =>
            +brand.brandID === this.postObj?.brandInfo?.brandID
        );
        if (postCRMdata?.crmActive) {
          this.ticketHistoryData = {};
          this.ticketHistoryData = this._footericonService.SetCRMButton(
            postCRMdata,
            this.currentUser,
            this.ticketHistoryData,
            this.postObj,
            PostsType.Tickets
          );
          if (JSON.parse(localStorage.getItem('sfdcTicketView')))
          {
            this.ticketHistoryData.crmcreatereqpop=false
          }
        }
        if (this.sfdcTicketView && this.postObj?.ticketInfo.status === TicketStatus.Close) {
          this.disableSwitchMode = true;
        }
        this.getAuthorDetailsBasedOnDB()
      })
    ); */

    this.subs.add(
      this._ticketSignalrService.openTicketDetailSignalCall.subscribe(
        (postSignalObj) => {
          if (
            postSignalObj &&
            postSignalObj.ticketId &&
            this.postObj?.ticketInfo?.ticketID === postSignalObj?.ticketId &&
            postSignalObj.signalId === TicketSignalEnum.LockUnlockTicketSignalR
          ) {
            this.executeSignalCall(postSignalObj);
          } else if (
            postSignalObj &&
            this.postObj?.author?.socialId ===
            postSignalObj?.message?.AuthorID &&
            postSignalObj.signalId ===
            TicketSignalEnum.UpdateBulkReplyCountSignalR
          ) {
            this.UpdateBulkReplyCountSignalR(postSignalObj);
          } else if (
            postSignalObj &&
            postSignalObj.message.Data &&
            this.postObj.author.socialId ===
            postSignalObj.message.Data.StrAuthorID &&
            postSignalObj.signalId === TicketSignalEnum.SSREProcessCompleted
          ) {
            this.SSREProcessCompleted(postSignalObj);
          }
        }
      )
    );
    this.subs.add(
      this._ticketSignalrService.ticketHistorySignalCall.subscribe(
        (signalRobj) => {
          if (signalRobj) {
            if (this.postObj) {
              const obj = signalRobj.message;
              const Data = obj.Data;
              if (
                Data &&
                Data.StrAuthorID === this.postObj.author.socialId &&
                Data.BrandID === this.postObj.brandInfo.brandID
              ) {
                if (
                  this.ticketService.ticketRenderingSetting ==
                  AutoRenderTime.AskBeforeRender
                ) {
                  const initialState = this.showNewMentionFound;
                  this.showNewMentionFound = true;
                  if (initialState !== this.showNewMentionFound) {
                    this._cdr.detectChanges();
                  }
                  const audio = new Audio('assets/audio/new-ticket.mp3');
                  audio.play();
                }
              }
            }
          }
        }
      )
    );

    // this.subs.add(
    //   this._replyService.replyActionPerformed.subscribe((obj) => {
    //     if (obj) {
    //       if (obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
    //         if (this._postDetailService.replyText) {
    //           this.replySentMiniView = new mentionMiniView();
    //           this.replySentMiniView.mentionDescription =
    //             this._postDetailService.replyText;
    //           this.replySentMiniView.messageText = 'Reply sent';
    //           this.replySentMiniView.channelIcon =
    //             '/assets/social-mention/post/logo-icon.png';
    //           this.replySentMiniView.ticketId = String(obj.ticketID);
    //           this.replySentMiniView.brandFriendlyName =
    //             obj.brandInfo.brandFriendlyName;
    //           this.replySentMiniView.brandLogo =
    //             this.ticketService.getBrandLogo(obj.brandInfo.brandID);
    //           this._NgZone.runOutsideAngular(() => {
    //             setTimeout(() => {
    //               this.postDetail.nativeElement.scrollTop =
    //                 this.postDetail.nativeElement.scrollHeight;
    //             }, 2000);
    //           });
    //           this.showRefreshButton = true;
    //           this.postFootDisable = true;
    //           if (this.postObj.channelGroup == ChannelGroup.Voice) {
    //             // this._NgZone.runOutsideAngular(()=>{
    //             // setTimeout(()=>{
    //             // this.ticketService.ticketStatusChange.next(true);
    //             this.ticketService.ticketStatusChangeSignal.set(true);
    //             // })
    //             // })
    //             // this.baseLogObject.push(this.replySentMiniView);
    //           }
    //         } else {
    //           if (obj.ticketInfo.status == TicketStatus.Close) {
    //             this.baseLogObject.push({
    //               isCommunicationLog: true,
    //               logText: ` Closed by <span style='color: #365366; text-decoration: underline; font-weight: 600;'>${this.currentUser.data.user.firstName} ${this.currentUser.data.user.lastName}</span>`,
    //               logVersion: 7,
    //               ticketId: obj.ticketID,
    //               mentionTime: new Date(),
    //             });
    //           }
    //         }
    //       }
    //     }
    //   })
    // );
    const valueIsReplyVisibleCheckSignal = this._postDetailService.isReplyVisibleCheckSignal();
    if (valueIsReplyVisibleCheckSignal != null) {
      this.isReplyVisibleCheckSignalChanges(valueIsReplyVisibleCheckSignal);
    }

    // this._postDetailService.isReplyVisibleCheck.subscribe((obj) => {
    //   if (obj !== null) {
    //     if (obj.ticketClient.ticketId === this.postObj.ticketInfo.ticketID) {
    //       this.isreplyVisible = obj.isReplyVisible;
    //       this._postDetailService.isReplyVisibleCheckSignal.set(null);
    //       // this._postDetailService.isReplyVisibleCheck.next(null);
    //     }
    //   }
    // });

    if (this.postObj && this.postObj.channelGroup === ChannelGroup.Email) {
      const value = this._replyService.redirectToTagIdSignal();
      if (value) {
        this.redirectToTagIdSignalChanges(value);
      }
      // this.subs.add(
      //   this._replyService.redirectToTagId.subscribe((obj: any) => {
      //     if (obj > 0 && this.conversationItem) {
      //       this.conversationItem.forEach((elementItem) => {
      //         if (
      //           elementItem.nativeElement.classList.contains(obj + '_mention')
      //         ) {
      //           elementItem.nativeElement.scrollIntoView();
      //         }
      //       });
      //     }
      //   })
      // );
    }
    // this.ticketService.ticketStatusChange.next(false);
    this.ticketService.ticketStatusChangeSignal.set(false);
    this._replyService.replyActionPerformedSignal.set(null);
    // this._replyService.redirectToTagId.next(0);
    this._replyService.redirectToTagIdSignal.set(0);
  }

  isReplyVisibleCheckSignalChanges(obj){
    if (obj !== null) {
      if (obj.ticketClient.ticketId === this.postObj?.ticketInfo?.ticketID) {
        this.isreplyVisible = obj.isReplyVisible;
        this._postDetailService.isReplyVisibleCheckSignal.set(null);
        // this._postDetailService.isReplyVisibleCheck.next(null);
      }
    }
  }

  redirectToTagIdSignalChanges(obj){
    if (obj > 0 && this.conversationItem) {
      this.conversationItem.forEach((elementItem) => {
        if (
          elementItem.nativeElement.classList.contains(obj + '_mention')
        ) {
          elementItem.nativeElement.scrollIntoView();
        }
      });
    }
  }

  replyActionPerformedSignalChanges(obj){
    if (obj) {
      if (obj.ticketInfo.ticketID === this.postObj?.ticketInfo?.ticketID) {
        if (this._postDetailService?.replyText) {
          this.replySentMiniView = new mentionMiniView();
          this.replySentMiniView.mentionDescription =
            this._postDetailService.replyText;
          this.replySentMiniView.messageText = this.translate.instant('reply-sent');;
          this.replySentMiniView.channelIcon =
            '/assets/social-mention/post/logo-icon.png';
          this.replySentMiniView.ticketId = String(obj.ticketID);
          this.replySentMiniView.brandFriendlyName =
            obj.brandInfo.brandFriendlyName;
          this.replySentMiniView.brandLogo =
            this.ticketService.getBrandLogo(obj.brandInfo.brandID);
          this._NgZone.runOutsideAngular(() => {
            this.postDetailNativeTimeout =setTimeout(() => {
              this.postDetail.nativeElement.scrollTop =
                this.postDetail.nativeElement.scrollHeight;
            }, 2000);
          });
          this.showRefreshButton = true;
          this.postFootDisable = true;
          if (this.postObj.channelGroup == ChannelGroup.Voice) {
            // this._NgZone.runOutsideAngular(()=>{
            // setTimeout(()=>{
            // this.ticketService.ticketStatusChange.next(true);
            this.ticketService.ticketStatusChangeSignal.set(true);
            // })
            // })
            // this.baseLogObject.push(this.replySentMiniView);
          }
        } else {
          if (obj.ticketInfo.status == TicketStatus.Close) {
            if(this.postObj.channelGroup != ChannelGroup.Email){
            this.baseLogObject.push({
              isCommunicationLog: true,
              logText: ` Closed by <span style='color: #365366; text-decoration: underline; font-weight: 600;'>${this.currentUser?.data?.user?.firstName} ${this.currentUser?.data?.user?.lastName}</span>`,
              logVersion: 7,
              ticketId: obj.ticketID,
              mentionTime: new Date(),
            });
          }else
          {
              this.emailBaseMention.push({
                isCommunicationLog: true,
                logText: ` Closed by <span style='color: #365366; text-decoration: underline; font-weight: 600;'>${this.currentUser?.data?.user?.firstName} ${this.currentUser?.data?.user?.lastName}</span>`,
                logVersion: 7,
                ticketId: obj.ticketID,
                mentionTime: new Date(),
                showEmail:false
              });
          }
          }
        }
      }
    }
  }

  showReplyMessageExpiry(): void {
    if (this.postObj?.channelGroup === ChannelGroup.WhatsApp) {
      this.checkReplyMessageExpiry();
    } else if (
      this.postObj.channelType === ChannelType.FBMessages ||
      this.postObj.channelType === ChannelType.InstagramMessages
    ) {
      this.checkReplyMessageExpiry();
    }
  }

  checkReplyMessageExpiry(): void {
    const keyObj = {
      brandInfo: this.postObj.brandInfo,
      authorId: this.postObj.author.socialId,
      SubChannel: this.postObj.channelType,
    };
    // const currentMention: BaseMention = this.selectedPostFromHistory[0];
    // if (currentMention?.mentionTime) {
    //   this.processExpiryTimeByChannel(currentMention?.mentionTime);
    // }

    this.getLastMentionTimeApi = this._replyService.getLastMentionTime(keyObj).subscribe((data) => {
      if (data.success) {
        this.processExpiryTimeByChannel(data.data);
      }
    });
  }

  processExpiryTimeByChannel(mentiontime) {
    if (this.postObj.channelGroup === ChannelGroup.WhatsApp) {
      this.replyMentionTime = mentiontime;
      const ticketTimings =
        this.ticketService.calculateCustomTicketTime(mentiontime);
      if (ticketTimings.valDays) {
        if (
          Number(ticketTimings.valDays) === 1 ||
          Number(ticketTimings.valDays) === 0
        ) {
          this.replyDays = true;
        }
      }
    } else if (
      this.postObj.channelType === ChannelType.FBMessages ||
      this.postObj.channelType === ChannelType.InstagramMessages
    ) {
      this.replyMentionTime = mentiontime;
      const ticketTimings =
        this.ticketService.calculateCustomTicketTime(mentiontime);
      if (ticketTimings.valDays) {
        if (Number(ticketTimings.valDays) <= 7 && Number(ticketTimings.valDays) != 0) {
          this.replyDays = true;
          const remainingDays = 7 - Number(ticketTimings.valDays);
          if (remainingDays == 1 || remainingDays === 0) {
            // start the counter
          } else {
            // this.replyexpirydays = String(remainingDays);
          }
        } else {
          // reply expired
        }
      }
    }
  }

  TimerExpired(): void {
    this.replyDays = false;
  }

  selectChange(user): void {
    this.userChangeLoader = true;
    if (user.label == "All Channel") {
      this.showAllChannelData = true;
    } else {
      this.showAllChannelData = false;
    }
    const genericFilter: GenericFilter = this._filterService.getEmptyGenericFilter(); 
    const previousGenricFilter: GenericFilter = this._navigationService.getFilterJsonBasedOnTabGUID(this._navigationService?.currentSelectedTab?.guid)

    genericFilter.brands.push(this._postDetailService?.postObj?.brandInfo);
    genericFilter.simpleSearch = user.id;
    genericFilter.startDateEpoch = previousGenricFilter.startDateEpoch;
    genericFilter.endDateEpoch = previousGenricFilter.endDateEpoch;
    genericFilter.isModifiedDate = previousGenricFilter?.isModifiedDate !== undefined ? previousGenricFilter?.isModifiedDate : true;

    this.getTicketSummaryByTicketID(genericFilter);
  }

  getTicketDetails(ticketid): void {
    const genericFilter: GenericFilter =
      this._filterService.getEmptyGenericFilter();
    genericFilter.brands.push(this._postDetailService?.postObj?.brandInfo);
    genericFilter.simpleSearch = ticketid;
    this.getTicketData(genericFilter, true);
  }

  getConnectedAuthors(connectedusers: BaseSocialAuthor[]): void {

    if (connectedusers && connectedusers.length > 0) {
      this.showConnectedUsers = true
      const users: DropdownConnectedUsers[] = [];
      // set default user
      const imageprofile = this.postObj.author.picUrl
        ? this.postObj.author.picUrl
        : 'assets/images/agentimages/sample-image.svg';
      const channelIcon = ChannelImage[ChannelGroup[this.postObj.channelGroup]];
      let name = this.postObj.author.name
        ? this.postObj.author.name
        : 'Anonymous';
      const isVerified = this.postObj.author.isVerifed;
      let screenName = '';
      if (this.postObj.channelGroup === ChannelGroup.Twitter) {
        screenName = this.postObj.author.screenname;
      }
      if (this.postObj.channelGroup === ChannelGroup.Voice) {
        name = this.postObj.author.name;
        if (name != 'All Channel' && name == '') {
        name = this.postObj.author.socialId;
        }
      }
      const currentUser: DropdownConnectedUsers = {
        id: Number(this.postObj.ticketID),
        label: name,
        screenName,
        isverified: isVerified,
        channelIcon,
      };

      users.push(currentUser);
      connectedusers =
        connectedusers != null && connectedusers.length > 0
          ? connectedusers.filter((x) => x.latestTicketID !== '0')
          : [];
      const setuser = this.setConnectedAuthors(connectedusers);
      const allusers = users.concat(setuser);
      this.currentUserName = allusers[0];
      this.dropdownConnectedUsersAsync.next(allusers);
    } else {
      this.showConnectedUsers = false
    }
    // this.subs.add(this._userDetailService.connectedUsers.subscribe(authors => {
    //   if(authors && authors.postObj.ticketID === )
    // }));
  }

  setConnectedAuthors(
    connectedusers: BaseSocialAuthor[]
  ): DropdownConnectedUsers[] {
    let users: DropdownConnectedUsers[] = [];
    connectedusers.forEach((element) => {
      let ConnectedScreenname = '';
      let ConnectedisVerified = false;
      let channelicon = '';
      let istwitter = false;
      let ConnectedprofilepicURL = '';
      if (element.channelGroup === ChannelGroup.Twitter) {
        ConnectedScreenname = element.screenname;
        ConnectedisVerified = element.isVerifed;
        istwitter = true;
        ConnectedprofilepicURL = element.picUrl;
      } else if (element.channelGroup === ChannelGroup.Facebook) {
        ConnectedScreenname = element.name;
        istwitter = false;
        ConnectedprofilepicURL = 'https://graph.facebook.com/';
        if (element.socialId) {
          ConnectedprofilepicURL =
            ConnectedprofilepicURL +
            '' +
            element.socialId +
            '/picture?type=square';
        }
      } else if (element.channelGroup === ChannelGroup.Instagram) {
        ConnectedScreenname = element.screenname;

        istwitter = false;
      } else if (element.channelGroup === ChannelGroup.Youtube) {
        ConnectedScreenname = element.name;
        istwitter = false;
      } else if (element.channelGroup === ChannelGroup.LinkedIn) {
        ConnectedScreenname = element.name;
        istwitter = false;
      } else if (element.channelGroup === ChannelGroup.GooglePlayStore) {
        ConnectedScreenname = element.name;
        istwitter = false;
      } else if (element.channelGroup === ChannelGroup.Email) {
        ConnectedScreenname = element.socialId;
        istwitter = false;
      } else if (element.channelGroup === ChannelGroup.Voice) {
        ConnectedScreenname = element.name;
        if (element.name != 'All Channel' && element.name == '') {
          element.name = element.socialId;
        }
      } else {
        ConnectedScreenname = element.name;
        istwitter = false;
      }
      if (
        element.channelGroup === ChannelGroup.Twitter ||
        element.channelGroup === ChannelGroup.Facebook
      ) {
      } else if (element.channelGroup === ChannelGroup.LinkedIn) {
        ConnectedprofilepicURL =
          ChannelImage[ChannelGroup[element.channelGroup]];
      } else {
        let imagepicurl = '';
        imagepicurl = element.picUrl;
        if (imagepicurl == '') {
          imagepicurl = 'assets/images/agentimages/sample-image.svg';
        }
        ConnectedprofilepicURL = imagepicurl;
      }
      channelicon = ChannelImage[ChannelGroup[element.channelGroup]];
      let screenname = '';
      if (element.channelGroup === ChannelGroup.Instagram || istwitter) {
        screenname = ConnectedScreenname;
      }
      if (element.channelGroup === ChannelGroup.Voice) {
        screenname = ConnectedScreenname;
      }
      if (element.name === 'All Channel') {
        channelicon = 'assets/social-mention/post/default_brand.svg';
      }
      users.push({
        id: Number(element.latestTicketID),
        label: element.name,
        screenName: screenname,
        isverified: ConnectedisVerified,
        channelIcon: channelicon,
      });
    });
    return users;
  }

  markIsRead(): void {
    if (!this.postObj.isRead) {
      const filterObj = this._filterService.getGenericRequestFilter(
        this.postObj
      );
      this.markTicketAsReadApi = this.ticketService.markTicketAsRead(filterObj).subscribe((resp) => {
        if (resp.success) {
          // success
        }
      });
    }
  }

  executeSignalCall(signalObj: PostSignalR): void {
    if (signalObj.signalId === TicketSignalEnum.LockUnlockTicketSignalR) {
      if (
        signalObj.message.status === 'U' ||
        signalObj.message.status === 'L'
      ) {
        this.lockUnlockNote = `${signalObj.message.Name} ${this.translate.instant('started-working-on-this-case')}`;
        this._cdr.detectChanges();
      }else if(signalObj.message.status === 'C') {
        this.showBlurLockStrip = false;
        this.showLockStrip = false;
        this.lockUnlockNote = ''
        this._cdr.detectChanges();
      }
    }
  }

  getTicketLockDetails(): void {
    this.lockUnlockNote = '';
    const lockObj = {
      BrandID: this.postObj.brandInfo.brandID,
      BrandName: this.postObj.brandInfo.brandName,
      TicketID: this.postObj.ticketInfo.ticketID,
    };

    this.getTicketLockApi =this.ticketService.getTicketLock(lockObj).subscribe((resp) => {
      if (resp.success) {
        // success
        if (resp.data && resp.data.lockUserName) {
          this.checkTicketLock(resp.data);
        } else {
          this.showBlurLockStrip = false;
          this.showLockStrip = false;
          const obj = {
            BrandID: this.postObj.brandInfo.brandID,
            BrandName: this.postObj.brandInfo.brandName,
            TicketID: this.postObj.ticketInfo.ticketID,
            Status: 'L',
          };
          this.lockUnlockTicket(obj);
        }
      }
    });
  }

  callLockUnlock(event): void {
    this.lockUnlockNote = '';
    this._cdr.detectChanges();
    if (event.checked) {
      const obj = {
        BrandID: this.postObj.brandInfo.brandID,
        BrandName: this.postObj.brandInfo.brandName,
        TicketID: this.postObj.ticketInfo.ticketID,
        Status: 'L',
      };
      this.lockUnlockTicket(obj);
      this.showBlurLockStrip = true;
      this.lockUnlockLabel = 'Locked';
    } else {
      const obj = {
        BrandID: this.postObj.brandInfo.brandID,
        BrandName: this.postObj.brandInfo.brandName,
        TicketID: this.postObj.ticketInfo.ticketID,
        Status: 'U',
      };
      this.lockUnlockTicket(obj);
      this.showBlurLockStrip = false;
      this.lockUnlockLabel = 'Unlocked';
      this.showLockStrip = false;
    }
  }

  checkTicketLock(lockObj): void {
    if (lockObj.lockUserName) {
      // show strip
      this.ticketLockUserName = lockObj.lockUserName;
      this.ticketLockTime = lockObj.lockTime;
      this.showBlurLockStrip = true;
      this.showLockStrip = true;
    }
    // else
    // {
    //   const obj = {
    //     BrandID: this.postObj.brandInfo.brandID,
    //     BrandName: this.postObj.brandInfo.brandName,
    //     TicketID: this.postObj.ticketInfo.ticketID,
    //     Status: 'L'
    //   };

    //   this.lockUnlockTicket(obj);
    // }
  }

  lockUnlockTicket(obj): void {
    this.lockUnlockTicketApi = this.ticketService.lockUnlockTicket(obj).pipe(distinctUntilChanged()).subscribe((resp) => {
      if (resp.success) {
        // success
      }
    });
  }

  newDataFound(): void {
    this.showNewMentionFound = false;
    this.reRenderHistory = true;
    this.baseLogObject = [];
    this.postObj.channelGroup == ChannelGroup.Email ? this.emailBaseMention = [] : ''
    this.getCommunicationLogHistory();
    /* for update mention count in postoverview */
    this.ticketService.signalBasedMentionCountUpdate.next(true);
  }

  trackByTagId(index: number, el: any): number {
    return el.iD ? el.iD : el.tagID;
  }

  public getCommunicationLogHistory(
    date?,
    noOfRows?,
    updateOverview?: boolean,
    appendMention = false,
    isFirstCall:number = 1
  ): void {
    if (this.ticketHistorySubscription) {
      this.ticketHistorySubscription.unsubscribe();
    }
    let lastHeight;
    if (this.postDetail) {
      lastHeight = this.postDetail.nativeElement.scrollHeight;
    }
    const filterObj = this._filterService.getGenericRequestFilter(this.postObj);
    const ticketID = filterObj.ticketId;
    if (date) {
      filterObj.to = this.loadMoreSize;
      // console.log(moment());
      // console.log(moment(date * 1000).utc().format());
      filterObj.endDateEpoch = +moment(date * 1000)
        .utc()
        .unix();
    } else {
      filterObj.to = this.mentionDefaultSize;
    }
    if (appendMention) {
      this.showLoadMoreOption = false;
      this.previousDataLoader = true;
    }
    filterObj.isPlainLogText = false;
    filterObj.isActionableData = Number(localStorage.getItem('commlogfilter'));
    this.mentionReadReceiptList = [];
    let id = this.ticketService.setLatestTicket;
    const isOnlyTicket = JSON.parse(localStorage.getItem('commlogfilter'));
    if (id != null) {
      filterObj.ticketId = id;
      filterObj.author.latestTicketID = String(id);
    }
    if (
      this.postObj.channelGroup !== ChannelGroup.Email &&
      this.postObj.channelGroup !== ChannelGroup.Quora &&
      this.postObj.channelGroup !== ChannelGroup.GlassDoor &&
      isOnlyTicket != 1
    ) {
      filterObj.ticketId = null;
    }
    //Anonymous Users unclubbing logic 
    if (filterObj.authorId == "0" || filterObj.authorId == null) {
      this.showLogFilter = false;
      filterObj.isActionableData = 1;
      if (id != null) {
        filterObj.ticketId = id;
      } else {
        filterObj.ticketId = ticketID;
      }
    } else {
      this.showLogFilter = true;
      filterObj.isActionableData = Number(localStorage.getItem('commlogfilter'));
    }

    if (this.showAllChannelData && (this.userRoleEnum.Agent == this.currentUser?.data?.user?.role || this.userRoleEnum.SupervisorAgent == this.currentUser?.data?.user?.role || this.userRoleEnum.LocationManager == this.currentUser?.data?.user?.role)) {
      // filterObj.channel == ChannelGroup.Voice || this._postDetailService.postObj.channelGroup == ChannelGroup.Voice || this._postDetailService?.voiceChannel == ChannelGroup.Voice &&
      filterObj.IsAllChannel = 1;
      // filterObj.channel =  ChannelGroup.Voice
      // filterObj.ticketId = this._postDetailService.voiceTicketId ? this._postDetailService.voiceTicketId : filterObj.ticketId
    } else {
      filterObj.IsAllChannel = 0;
    }
    if (this._postDetailService?.makeActionableFlag) {
      filterObj.ticketId = this.postObj?.ticketID;
    }

    if (!appendMention && !this.reRenderHistory) {
      // if (this.selectedPostID) {
      //   const selectedLogs = this.fetchedUserHistory.filter(
      //     (item) =>
      //       item.findIndex(
      //         (mentionitem) => mentionitem.tagID === this.selectedPostID
      //       ) !== -1
      //   );
      //   if (selectedLogs.length > 0) {
      //     this.mapHistoryLogData(
      //       selectedLogs[0],
      //       lastHeight,
      //       updateOverview,
      //       filterObj,
      //       false,
      //       true
      //     );
      //     // return;
      //   }
      // }

      this.selectedPostFromHistory = [this._postDetailService.postObj];
      const currentMention: BaseMention = this.selectedPostFromHistory[0];
      this.replyDays = false;
      if (currentMention?.mentionTime) {
        this.processExpiryTimeByChannel(currentMention?.mentionTime);
      }
      if (this.selectedPostFromHistory[0] && this.selectedPostFromHistory[0]?.channelGroup != ChannelGroup.Email) {
        this.mapHistoryLogData(
          this.selectedPostFromHistory,
          lastHeight,
          updateOverview,
          filterObj,
          false,
          true,
        );
      } else {
        this.comminicationLogLoading = true;
      }
    }
    if (!appendMention) {
      this.isAPIFailed = false;
      this.comminicationLogLoading = true;
      this.mentionExistsInTicketHistory = false
    }
    this.isDataReceived = false;
    if (filterObj.channel == ChannelGroup.Email && filterObj.IsAllChannel == 1) {
      filterObj.isActionableData = 1
    }
    if ('caseCreatedDate' in this.postObj.ticketInfo) {
      filterObj['caseCreatedDate'] = this.postObj.ticketInfo['caseCreatedDate'];
    }
    filterObj['isFirstCall'] = isFirstCall;
    this.ticketHistorySubscription = this.ticketService
      .GetTicketHistory(filterObj)
      .subscribe(
        (response) => {
          const resp: BaseMention[] = response?.timeLine;
          if (resp) {
            this.ticketSummaryUserHistory = resp;
            this.isDataReceived = true;
            if (this.reRenderHistory) {
              const logIndex = this.fetchedUserHistory.findIndex((item) => {
                return item.some((item) => item.tagID === this.selectedPostID);
              });
              if (logIndex >= 0) {
                this.fetchedUserHistory[logIndex] = resp;
              }
            }
            if (!appendMention && !this.reRenderHistory) {
              this.fetchedUserHistory.push(resp);
            }
            resp.forEach(
              (obj) =>
                (obj.openReply = this.postObj.tagID == obj.tagID ? true : false)
            );

            this.mapHistoryLogData(
              resp,
              lastHeight,
              updateOverview,
              filterObj,
              appendMention,
              false,
              {
                isCreatedWithinLast30Days: response?.isCreatedWithinLast30Days,
                userActivityCount : response?.userActivityCount
              }
            );
            this.reRenderHistory = false;
          } 
          else {
            this.comminicationLogLoading = false;
            this.reRenderHistory = false;
            if (!appendMention) {
              this.isAPIFailed = true
            }
          }
          this._cdr.detectChanges();
          if (this.oneTimeLoad) {
            this.loadedTicketHisotrySignalTimeOut = setTimeout(() => {
              this.ticketService.loadedTicketHisotrySignal.set(true);
            }, 2000);
            this.oneTimeLoad = false;
          }
        },
        (err) => {
          this.comminicationLogLoading = false;
          this.reRenderHistory = false;
          if (!appendMention) {
            this.isAPIFailed = true
          }
          this._cdr.detectChanges();
          // console.log(err);
        }
      );
  }

  mapHistoryLogData(
    resp,
    lastHeight,
    updateOverview,
    filterObj,
    appendPost = false,
    previewFlag = false,
    paginationOptions: any = {}
  ) {
    // if (this.postObj.channelGroup == ChannelGroup.Voice && this.postObj.title == 'ORIGINATE') { appendPost = false };
    this.comminicationLogLoading = false;
    this.previousDataLoader = false;
    // this.TicketData = resp;
    // console.log('Respnse');
    this.LogObject = [];
    this.mentionCount = 0;
    for (const mention of resp) {
      if (
        mention.concreteClassName ===
        'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog'
      ) {
        // console.log("mention note: ", mention?.note);
        if (mention?.logText) {
          mention.logText = mention.logText.replace('this note', 'a note');
        }
        let communicationLog: any = this.mapAsComminucationLog(mention);
        communicationLog.isCommunicationLog = true;
        communicationLog = this.mergeEntryBasedOnBatchID(
          resp,
          communicationLog
        );
        const logcondition = this.checkLogCondition(communicationLog);
        if (logcondition > 0 && this.postObj.title != 'ORIGINATE') {
          communicationLog.loadMore = (mention.tagID == this.postObj.tagID && mention.logCount > 50) ? true : false
          communicationLog.clickHereFlag = true;
          this.LogObject.push(communicationLog);
          // }
        }
      } else {
        if (this.mentionCount === 0 ) {
          // Only set lastmentionDateEpoch for the first non-brand post mention
          const firstUserMention = resp.find(item => 
            item.concreteClassName !== 'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog' && 
            !item.isBrandPost
          );
          if (firstUserMention) {
            this.lastmentionDateEpoch = firstUserMention.mentionTimeEpoch;
          }else{
            this.lastmentionDateEpoch  = mention.mentionTimeEpoch;
          }
        }
        const communicationLog: any = mention;
        communicationLog.isCommunicationLog = false;
        if (this.postObj.title != 'ORIGINATE') {
          // communicationLog.loadMore = (mention.tagID == this.postObj.tagID && mention.logCount > 50) ? true : false
          // communicationLog.clickHereFlag = resp.some((obj) => obj.tagID == communicationLog.tagID && obj.concreteClassName === 'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog') ? false : true;
          if (appendPost) {
            if (this.baseLogObject.some((obj) => obj.tagID == communicationLog.tagID && obj.concreteClassName !==
              'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog') == false) {
              this.LogObject.push(communicationLog);
            }
          } else {
            this.LogObject.push(communicationLog);
          }
          //  }
          this.mentionCount += 1;
          if (
            this.postObj.channelGroup === ChannelGroup.Email &&
            !mention.isBrandPost
          ) {
            const mentionread: MentionReadReceipt = {};
            const ticketindex = this.mentionReadReceiptList.findIndex(
              (obj) => obj.ticketId === this.postObj.ticketID
            );
            if (ticketindex > -1) {
              const tagIdObj: TagIdListRead = {};
              tagIdObj.tagId = mention.tagID;
              tagIdObj.isRead = mention.thisMentionIsRead;
              this.mentionReadReceiptList[ticketindex].tagIdList.push(tagIdObj);
            } else {
              mentionread.ticketId = mention.ticketID;
              mentionread.tagIdList = [];
              const tagIdObj: TagIdListRead = {};
              tagIdObj.tagId = mention.tagID;
              tagIdObj.isRead = mention.thisMentionIsRead;
              mentionread.tagIdList.push(tagIdObj);
              this.mentionReadReceiptList.push(mentionread);
            }
          }
          mention.ticketInfo.replyUserName =
            this._postDetailService?.postObj?.ticketInfo?.replyUserName;
          mention.ticketInfo.replyEscalatedToUsername =
            this._postDetailService.postObj?.ticketInfo?.replyEscalatedToUsername;
          mention.makerCheckerMetadata.replyEscalatedTeamName =
            this._postDetailService.postObj?.makerCheckerMetadata?.replyEscalatedTeamName;
        }
      }
    }
    this._replyService.mentionReadReceipt = this.mentionReadReceiptList;
    if (appendPost) {
      const existingLog = JSON.parse(JSON.stringify(this.baseLogObject));
      this.baseLogObject = this.LogObject.concat(existingLog);
      this.postDetail.nativeElement.scrollTop =
        this.postDetail.nativeElement.scrollHeight - lastHeight;
      this.baseLogObject.forEach((basemention) => {
        basemention.loadMore = (basemention.tagID == this.postObj.tagID && basemention.logCount > 50) ? true : false;
        basemention.clickHereFlag = this.baseLogObject.filter((obj) => obj.tagID == basemention.tagID && obj.concreteClassName === 'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog').length < basemention.logCount ? true : false;
      })
    } else {
      this.baseLogObject = this.baseLogObject.length == 1 ? this.baseLogObject : [];
      const tagID = this.baseLogObject[0]?.tagID;
      if (tagID && !this.reRenderHistory) {
        this.LogObject.forEach((item) => {
          if (item.tagID !== tagID) {
            this.baseLogObject.push(item);
          } else {
            if (
              item.concreteClassName ===
              'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog'
            ) {
              this.baseLogObject.push(item);
            } else {
              if (item.tagID == tagID) {
                const index = this.baseLogObject.findIndex(
                  (obj) => obj.tagID == tagID
                );
                this.baseLogObject.splice(index, 1);
                item.attachmentMetadata = this.postObj.attachmentMetadata;
                item.emailContent = this.postObj.emailContent
                item.channelType = this.postObj.channelType
                this.baseLogObject.push(item);
                this.mentionExistsInTicketHistory=true
              }
            }
          }
        });
        if (!this.LogObject.some((obj) => obj.tagID == tagID && obj.concreteClassName !== 'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog')) {
          const index = this.baseLogObject.findIndex((obj) => obj.tagID == tagID && obj.concreteClassName !== 'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog');
          this.baseLogObject.splice(index, 1)
        }

        this.baseLogObject.forEach((basemention) => {
          basemention.loadMore = (basemention.tagID == this.postObj.tagID && basemention.logCount > 50) ? true : false;
          basemention.clickHereFlag = this.baseLogObject.filter((obj) => obj.tagID == basemention.tagID && obj.concreteClassName === 'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog').length < basemention.logCount ? true : false;
        })
      } else {
        if (this.LogObject[0]?.title != 'ORIGINATE') {
          this.baseLogObject = this.LogObject;
        }
      }
      if (updateOverview) {
        const currentTicketInfo = resp.find(
          (obj) => obj.tagID === this.postObj.tagID
        );
        if (currentTicketInfo) {
          // this.getTicketDetails(this.postObj.ticketInfo.ticketID);
        }
      }
    }
    // this.ticketService.ticketHistoryList=this.baseLogObject;
    if (
      this.postObj.channelGroup === ChannelGroup.Email &&
      this.postObj.isBrandPost &&
      !previewFlag &&
      !appendPost
    ) {
      /* this.ticketService.emailProfileDetailsObs.next(this.baseLogObject[0]); */
      this.ticketService.emailProfileDetailsObsSignal.set(this.baseLogObject[0]);
    }
    if (
      this.postObj.channelGroup === ChannelGroup.Email &&
      !this.postObj.isBrandPost &&
      !previewFlag &&
      !appendPost
    ) {
      /* this.ticketService.emailProfileDetailsObs.next(this.postObj); */
      this.ticketService.emailProfileDetailsObsSignal.set(this.postObj);
    }

    if (paginationOptions?.isCreatedWithinLast30Days && this.mentionCount < 10 && paginationOptions?.userActivityCount > 0) {
      this.showLoadMoreOption = true;
    }
    else {
      this.showLoadMoreOption = this.mentionCount >= filterObj.to ? true : false;
    }
    // if ((this.postObj.channelGroup === ChannelGroup.Voice || this._postDetailService?.voiceChannel === ChannelGroup.Voice) && this.isDataReceived) {
    //   this._NgZone.runOutsideAngular(() => {
    //     this.postDetailScrollTopTimeout = setTimeout(() => {
    //       this.postDetail.nativeElement.scrollTop =
    //         this.postDetail.nativeElement.scrollHeight;
    //     }, 2000);
    //   });
    // } else {
      this._NgZone.runOutsideAngular(() => {
        this.conversationItemTimeOut = setTimeout(() => {
          console.log('Conversation item: ', this.conversationItem);
          if (this.conversationItem && !appendPost && this.isDataReceived) {
            const userRepliesList = this.baseLogObject.filter(
              (obj) => !obj.isBrandPost && !obj.isCommunicationLog
            );
            const index = userRepliesList.findIndex(
              (obj) => this.postObj.tagID == obj.tagID
            );
            this.conversationItem['_results'] && this.conversationItem['_results'][
              index
            ] ? this.conversationItem['_results'][
              index
            ].nativeElement.scrollIntoView({ behavior: 'smooth' }) : '';
            // if (this.postObj.channelGroup !== ChannelGroup.Email){
            
            // }
          }
        }, this.postObj.channelGroup == ChannelGroup.Email ? 1000 : 0);
      });

    if(this.postObj.channelGroup == ChannelGroup.Email) {
      const emailMentions = this.baseLogObject?.filter((x) => !x.isCommunicationLog)
    if(emailMentions?.length > 4) {
      emailMentions?.forEach((x,index)=>{
        if (index == 0 || index == emailMentions.length - 1 || index == emailMentions.length - 2) {
           x.showEmail = true
         }
         if(index==1 && !appendPost)
         {
          x.showMore = true;
          x.showMoreCount = emailMentions?.length - 3
         }
      })
    }
  else
  {
      emailMentions?.forEach(x => {
        x.showEmail = true
        x.showMore = false
      });
  }
    this.emailBaseMention = emailMentions
  }
    this.baseLogObject = this.mergeCommunicationLogs(this.baseLogObject);

    if(this.postObj.channelGroup == ChannelGroup.Email) {
      let lastMentionIndex = -1;
      for (let i = this.baseLogObject.length - 1; i >= 0; i--) {
        const item = this.baseLogObject[i];
        if (item.concreteClassName === 'LocobuzzNG.Entities.Classes.Mentions.EmailMention') {
          lastMentionIndex = i;
          break;
        }
      }   
        if (lastMentionIndex > -1) {
        this.lastLogs = this.baseLogObject?.slice(lastMentionIndex + 1, this.baseLogObject?.length);
      }
    }
}

  logFilterChange(event): void {
    const currvalue = +event.value;
    localStorage.setItem('commlogfilter', String(currvalue));
    this.baseLogObject = [];
    this.postObj.channelGroup == ChannelGroup.Email ? this.emailBaseMention = [] : ''
    this.reRenderHistory = true;
    this.getCommunicationLogHistory();
  }

  // private getAuthorDetails(): void {
  //   const filterObj = this._filterService.getGenericRequestFilter(this.postObj);
  //   this._userDetailService.GetAuthorDetails(filterObj).subscribe((data) => {
  //     // console.log('User Details', data);
  //     this.authorDetails = {};
  //     this.authorDetails = data;
  //   });
  // }

  private getTicketTimeline(ticketId?: number): void {
    const filterObj = this._filterService.getGenericRequestFilter(this.postObj);
    if (ticketId) {
      filterObj.ticketId = ticketId;
    }
    this._userDetailService.GetTicketTimeline(filterObj).subscribe((data) => {
      this.communicationLogResponse = {};
      this.communicationLogResponse = data;
      // console.log('Ticket Timeline', data);
    });
  }

  public CallTicketTimeLine(ticketId): void {
    this.getTicketTimeline(+ticketId);
  }

  private getTicketSummary(): void {
    const filterObj = this._filterService.getGenericRequestFilter(this.postObj);
    this.GetTicketSummaryApi = this._userDetailService.GetTicketSummary(filterObj).subscribe((data) => {
      // console.log('Ticket Summary', data);
      this.ticketInfo = {};
      this.ticketInfo = data;
    });
  }

  // private getSentimentUpliftAndNPSScore(): void {
  //   const filterObj = this._filterService.getGenericRequestFilter(this.postObj);
  //   this._userDetailService
  //     .GetSentimentUpliftAndNPSScore(filterObj)
  //     .subscribe((data) => {
  //       this.upliftAndSentimentScore = {};
  //       this.upliftAndSentimentScore = data;
  //       // console.log('Uplift&NPS Score', data);
  //     });
  // }

  // private GetTickets(filterObj): void {
  //   this.ticketService.GetTickets(filterObj).subscribe(
  //     (resp) => {
  //       this.TicketData = resp;
  //       // console.log(this.TicketData);
  //     },
  //     (err) => {
  //       // console.log(err);
  //     },
  //     () => {
  //       // console.log('Done completed');
  //     }
  //   );
  // }

  change($event: any): void { }

  // private mapPostByChannel(mention: BaseMention): TicketClient {
  //   // console.log(mention);
  //   const assignToname = this._filterService.getNameByID(
  //     mention.ticketInfo.assignedTo,
  //     this._filterService.fetchedAssignTo
  //   );
  //   this.post = {
  //     ticketId: mention.ticketInfo.ticketID,
  //     mentionCount: mention.ticketInfo.numberOfMentions,
  //     note: mention.note,
  //     assignTo: assignToname,
  //     ticketStatus: TicketStatus[mention.ticketInfo.status],
  //     ticketPriority: Priority[mention.ticketInfo.ticketPriority],
  //     ticketDescription: mention.description,
  //     ticketCategory: {
  //       ticketUpperCategory: mention.ticketInfo.ticketUpperCategory.name,
  //       mentionUpperCategory: mention.upperCategory.name,
  //     },
  //     Userinfo: {
  //       name: mention.author.name,
  //       image: mention.author.picUrl,
  //       screenName: mention.author.screenname,
  //       bio: mention.author.bio,
  //       followers: mention.author.followersCount,
  //       following: mention.author.followingCount,
  //       location: mention.author.location,
  //       sentimentUpliftScore: mention.author.sentimentUpliftScore,
  //       npsScore: mention.author.nPS,
  //       isVerified: mention.author.isVerifed,
  //     },
  //     ticketCategoryTop: '',
  //     mentionCategoryTop: '',
  //   };
  //   return this.post;
  // }

  checkLogCondition(comObj: CommunicationLog): number {
    let logcondition = 0;
    if (
      comObj.logVersion === 1 &&
      comObj.status === LogStatus.GroupDisplayMessage
    ) {
      logcondition = 1;
    } else if (
      comObj.logVersion === 0 &&
      (comObj.status === LogStatus.RepliedToUser ||
        comObj.status === LogStatus.Escalated ||
        comObj.status === LogStatus.Ignore ||
        comObj.status === LogStatus.Approve ||
        comObj.status === LogStatus.NotesAdded ||
        comObj.status === LogStatus.Acknowledge ||
        comObj.status === LogStatus.SRCreated ||
        comObj.status === LogStatus.SRUpdated ||
        comObj.status === LogStatus.CopyMentionFrom ||
        comObj.status === LogStatus.CopyMentionTo ||
        comObj.status === LogStatus.MoveMentionFrom ||
        comObj.status === LogStatus.MoveMentionTo ||
        comObj.status === LogStatus.EmailSent ||
        comObj.status === LogStatus.CustomerInfoAwaited ||
        comObj.status === LogStatus.ModifiedTicketTagging ||
        comObj.status === LogStatus.TicketSubscribed ||
        comObj.status === LogStatus.TicketUnsubscribed ||
        comObj.status === LogStatus.TicketSubscriptionModified ||
        comObj.status === LogStatus.TicketSubscriptionEmailSent ||
        comObj.status === LogStatus.CrmLeadCreated ||
        comObj.status === LogStatus.PerformActionReplyFailed ||
        comObj.status === LogStatus.ReopenACase ||
        comObj.status === LogStatus.OnHold ||
        comObj.status === LogStatus.TeamDeleted ||
        comObj.status === LogStatus.BulkReplyRequestInitiated ||
        comObj.status === LogStatus.ReplyTextModified ||
        comObj.status === LogStatus.MakerCheckerSet ||
        comObj.status === LogStatus.MakerCheckerDisable ||
        comObj.status === LogStatus.SSREReplyRejected ||
        comObj.status === LogStatus.SSREReplyVerified ||
        comObj.status === LogStatus.AutoResponse ||
        comObj.status === LogStatus.SSREExclusionQualified ||
        comObj.status === LogStatus.Assigned ||
        comObj.status === LogStatus.BulkAssignmentInitiated ||
        comObj.status === LogStatus.BulkReopenInitiated ||
        comObj.status === LogStatus.BulkEscalationInitiated ||
        comObj.status === LogStatus.BulkOnHoldInitiated ||
        comObj.status === LogStatus.BulkApproveInitiated ||
        comObj.status === LogStatus.BulkRejectInitiated ||
        comObj.status === LogStatus.BulkDirectcloseInitiated ||
        comObj.status === LogStatus.BulkReplycloseRequestInitiated ||
        comObj.status === LogStatus.BulkReplyholdRequestInitiated ||
        comObj.status === LogStatus.BulkReplyawaitingRequestInitiated ||
        comObj.status === LogStatus.BulkReplyAssignRequestInitiated ||
        comObj.status === LogStatus.BulkReplyEcalatRequestInitiated ||
        comObj.status === LogStatus.ModifyCategoryInformation ||
        comObj.status === LogStatus.ForwardEmailSameThread ||
        comObj.status === LogStatus.ForwardEmailNewThread ||
        comObj.status === LogStatus.DeleteFromLocobuzz ||
        comObj.status === LogStatus.DeleteFromSocial ||
        comObj.status === LogStatus.PriorityChanged ||
        comObj.status === LogStatus.SentimentChanged ||
        comObj.status === LogStatus.Unassigned ||
        comObj.status === LogStatus.WorkflowAlert)
    ) {
      logcondition = 2;
    } else if (
      comObj.logVersion === 0 &&
      (comObj.status === LogStatus.Closed ||
        comObj.status === LogStatus.SRClosed)
    ) {
      logcondition = 3;
    } else if (
      comObj.logVersion == 1 &&
      comObj.status == LogStatus.FormSubmit
    ) {
      comObj.logText = 'Personal Details Form';

      logcondition = 4;
    } else if(
      comObj.status === LogStatus.ResponseGenieUsed ||
      comObj.status === LogStatus.ResponseGenieDiscard ||
      comObj.status === LogStatus.ResponseGenieEdited ||
      comObj.status === LogStatus.ResponseGenieAccepted
    ){
      logcondition = 9;
    }
    return logcondition;
  }

  mergeEntryBasedOnBatchID(
    resp: any[],
    comObj: CommunicationLog
  ): CommunicationLog {
    if (comObj.logVersion == 1 && comObj.status == LogStatus.FormSubmit) {
      const array = resp.filter(
        (obj) =>
          obj.batchID == comObj.batchID &&
          (obj.status == LogStatus.FormSent ||
            obj.status == LogStatus.FormSeen ||
            obj.status == LogStatus.FormSubmit)
      );

      if (array && array.length > 0) {
        comObj.batchIDFormStaus = [
          {
            name: 'Form Sent',
            mentionTime: '',
            checked: false,
            status: LogStatus.FormSent,
            jsonString: '',
          },
          {
            name: 'Form Seen',
            mentionTime: '',
            checked: false,
            status: LogStatus.FormSeen,
            jsonString: '',
          },
          {
            name: 'Form Filled',
            mentionTime: '',
            checked: false,
            status: LogStatus.FormSubmit,
            jsonString: '',
          },
        ];

        comObj.batchIDFormStaus.forEach((obj) => {
          if (
            array.some(
              (arrayObj) =>
                arrayObj?.status == LogStatus.FormSent &&
                obj.status == LogStatus.FormSent
            )
          ) {
            const formLogObj = array.find(
              (arrayObj) => arrayObj?.status == LogStatus.FormSent
            );
            if (formLogObj) {
              obj.mentionTime = formLogObj?.mentionTime;
              obj.checked = true;
            }
          }
          if (
            array.some(
              (arrayObj) =>
                arrayObj?.status == LogStatus.FormSeen &&
                obj.status == LogStatus.FormSeen
            )
          ) {
            const formLogObj = array.find(
              (arrayObj) => arrayObj?.status == LogStatus.FormSeen
            );
            if (formLogObj) {
              obj.mentionTime = formLogObj?.mentionTime;
              obj.checked = true;
            }
          }
          if (
            array.some(
              (arrayObj) =>
                arrayObj?.status == LogStatus.FormSubmit &&
                obj.status == LogStatus.FormSubmit
            )
          ) {
            const formLogObj = array.find(
              (arrayObj) => arrayObj?.status == LogStatus.FormSubmit
            );
            if (formLogObj) {
              obj.mentionTime = formLogObj?.mentionTime;
              obj.checked = true;
              obj.jsonString =
                formLogObj && formLogObj.note
                  ? JSON.parse(formLogObj?.note)
                  : null;
            }
          }
        });
      }
      return comObj;
    }
    return comObj;
  }

  mapAsComminucationLog(mention: BaseMention): CommunicationLog {

    let viewNote;
    let viewNotesAttachment=[];
    let medialist =[]
    let fileList = []
    let attachmentObj = {
      fileName: '',
      mediaUrl: '',
      mediaType: null,
      mediaPath: ''
    };
    try {
      const obj = JSON.parse(mention.note);
      viewNote = obj?.Note != undefined ? obj.Note : typeof obj == 'object' ? obj.Note : obj?.toString();
      viewNotesAttachment = obj?.NotesAttachment ? obj?.NotesAttachment : []
      if (viewNotesAttachment?.length > 0) {
        viewNotesAttachment.forEach(obj => {
          attachmentObj = {
            fileName: obj?.Name,
            mediaUrl: obj?.MediaUrl,
            mediaPath: obj?.MediaUrl,
            mediaType: +obj?.MediaType,
          }
          if (attachmentObj?.mediaType == MediaEnum.IMAGE || attachmentObj?.mediaType == MediaEnum.VIDEO || attachmentObj?.mediaType == MediaEnum.ANIMATEDGIF) {
            medialist.push(attachmentObj);
          } else if (attachmentObj?.mediaType == MediaEnum.PDF || attachmentObj?.mediaType == MediaEnum.DOC || attachmentObj?.mediaType == MediaEnum.EXCEL) {
            fileList.push(attachmentObj);
          }
        })
      }
    } catch(e){
      if (mention.status != LogStatus.ForwardEmailSameThread && mention.status != LogStatus.ForwardEmailNewThread && mention.status != LogStatus.DeleteFromLocobuzz && mention.status != LogStatus.DeleteFromSocial){
           viewNote = mention.note
        }
      // viewNotesAttachment = mention?.notesAttachmentMetadata
      if (mention?.notesAttachmentMetadata?.mediaContents?.length > 0){
        mention?.notesAttachmentMetadata?.mediaContents.forEach (obj=> {
          attachmentObj = {
            fileName: obj?.name,
            mediaUrl: obj?.mediaUrl,
            mediaPath: obj?.mediaUrl,
            mediaType: +obj?.mediaType,
          }
          if (attachmentObj?.mediaType == MediaEnum.IMAGE || attachmentObj?.mediaType == MediaEnum.VIDEO || attachmentObj?.mediaType == MediaEnum.ANIMATEDGIF){
            medialist.push(attachmentObj);
          } else if (attachmentObj?.mediaType == MediaEnum.PDF || attachmentObj?.mediaType == MediaEnum.DOC || attachmentObj?.mediaType == MediaEnum.EXCEL){
            fileList.push(attachmentObj);
          }
        })
      }
    }


    return (this.communicationLog = {
      note: mention.note,
      iD: mention.id,
      mentionTime: mention.mentionTime,
      userID: +mention.userID,
      username: mention.username,
      usernames: mention.usernames,
      ticketID: mention.ticketID,
      mentionID: mention.mentionID,
      postID: mention.postID,
      tagID: mention.tagID,
      assignedToUserID: mention.assignedToUserID,
      assignedToTeam: mention.assignedToTeam,
      assignedToTeamName: mention.assignedToTeamName,
      previousAssignToUserID: mention.previousAssignToUserID,
      previousAssignedToTeam: mention.previousAssignedToTeam,
      previousAssignedToTeamName: mention.previousAssignedToTeamName,
      assignedToUsername: mention.assignedToUsername,
      status: mention.status,
      lstStatus: mention.lstStatus,
      lstUserNames: mention.lstUserNames,
      lstUserIDs: mention.lstUserIDs,
      lstLogIDs: mention.lstLogIDs,
      lstAssignedtoUserNames: mention.lstAssignedtoUserNames,
      batchID: mention.batchID,
      agentPic: mention.agentPic,
      assignedToAgentPic: mention.assignedToAgentPic,
      assignedToAccountType: mention.assignedToAccountType,
      accountType: mention.accountType,
      postScheduledDateTime: mention.postScheduledDateTime,
      replyScheduledDateTime: mention.replyScheduledDateTime,
      replyEscalatedToUsername: mention.replyEscalatedToUsername,
      replyUserName: mention.replyUserName,
      isScheduled: mention.isScheduled,
      workflowReplyDetailID: mention.workflowReplyDetailID,
      channelType: mention.channelType,
      isLastLog: mention.isLastLog,
      author: mention.author,
      brandInfo: mention.brandInfo,
      globalTicketVersion: mention.globalTicketVersion,
      nextLogBatchID: mention.nextLogBatchID,
      nextLogStatus: mention.nextLogStatus,
      actionTakenFrom: mention.actionTakenFrom,
      logVersion: mention.logVersion,
      contentID: mention.contentID,
      isHtml: mention.isHtml,
      concreteClassName: mention.concreteClassName,
      mentionTimeEpoch: mention.mentionTimeEpoch,
      channelGroup: mention.channelGroup,
      logText: mention.logText,
      noteView: viewNote,
      isNoteFromVoice: mention.isNoteFromVoice,
      mediaList: medialist,
      fileList: fileList
    });
  }
  addCallNote(note) {
    if (this._postDetailService?.postObj?.channelGroup == ChannelGroup.Voice) {
      this.addNote(note, true);
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something went wrong'),
        },
      });
    }
    this.callNote = false;
    this.callRunning = false;
  }
  callAgainEvent(val) {
    this.callNote = val;
  }

  addNote(note, callNoteVoip = false): void {
    let noteAttachments:NoteMedia[] = [];
    if(this.selectedNoteMedia?.length > 0){
      this.selectedNoteMedia.forEach((obj)=>{
        const media={
          mediaID: obj.mediaID,
          name: obj.displayFileName,
          mediaType: obj.mediaType,
          mediaUrl: obj.mediaPath,
          thumbUrl: obj.thumbnail
        }
        noteAttachments.push(media);
      })
    }
    if ((note && note?.trim()?.length > 0) || noteAttachments && noteAttachments?.length > 0) {
      /* added on to find proper ticket id */
      const currentTicket: BaseMention = this?.TicketData?.find((ticket) => ticket?.ticketInfo?.tagID == this._postDetailService?.postObj?.ticketInfo?.tagID);
      let currentTicketID
      if (currentTicket && Object?.keys(currentTicket)?.length > 0){
        currentTicketID = currentTicket?.ticketInfo?.ticketID
      }
      /* added on to find proper ticket id */
      const object = {
        brandInfo: this._postDetailService.postObj.brandInfo,
        AttachmentUgc: noteAttachments && noteAttachments?.length > 0 ? noteAttachments : null,
        communicationLog: {
          Note: note,
          TicketID: this._postDetailService?.postObj?.ticketInfo?.ticketID || currentTicketID || this.globalTicketID,
          TagID:
            callNoteVoip && this._postDetailService.voiceTagId
              ? this._postDetailService.voiceTagId
              : this._postDetailService.voipTagID ? this._postDetailService.voipTagID : this._postDetailService.postObj.tagID,
          AssignedToUserID:
            this._postDetailService.postObj.ticketInfo.assignedTo,
          Channel: this._postDetailService.postObj.channelType,
          Status: 'NotesAdded',
          type: 'CommunicationLog',
          MentionTime: this._postDetailService.postObj.mentionTime,
        },
        actionFrom: 0,
        
        // NoteFromVoice: callNoteVoip
      };

      // console.log(object);
      if (callNoteVoip) {
        this.addTicketNotesVOIPApi = this.ticketService.addTicketNotesVOIP(object).subscribe((data) => {
          if (JSON.parse(JSON.stringify(data)).success) {
            this._NgZone.runOutsideAngular(() => {
              this.noteChangeTimeOut =setTimeout(() => {
                this._NgZone.run(() => {
                  this.noteChange()
                })
              }, 0);
            });
            this.reRenderHistory = true;
            /* this._postDetailService.currentPostObject.next(
              this.postObj.ticketInfo.ticketID
            ); */
            this._postDetailService.currentPostObjectSignal.set(
              this.postObj.ticketInfo.ticketID
            );
            // this.ticketService.openCallDetailWindow.next(false);
            this.ticketService.openCallDetailWindowSignal.set(false);
            if (callNoteVoip)
            {
              this.openCallDetailFlag = false;
            }
          }
        });
      } else {
        this.noteSpinner = true;
        this.addTicketNotes = this.ticketService.addTicketNotes(object).subscribe((data:any) => {
          if (JSON.parse(JSON.stringify(data)).success) {
            // console.log(data);
            this.noteChange()
            this.noteSpinner = false;
          }
          else {
            this.noteSpinner = false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: data?.message,
              },
            });
          }
          this._cdr.detectChanges();
        });
      }
    } 
    else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('please-add-note'),
        },
      });
      // this._cdr.detectChanges();
    }
  }
  noteChange(noteType?: string) {
    // this.ticketService.ticketStatusChange.next(true);
    this.postObj?.channelGroup == ChannelGroup.Email ? this.emailBaseMention = [] : ''
    this.getCommunicationLogHistory()
    this._cdr.detectChanges();
    /* this.ticketService.noteAddedChange.next(true); */
    this.ticketService.noteAddedChangeSignal.set(true);
    /* this.ticketService.noteAddedMediaChange.next({ media: this.selectedNoteMedia, note: this.note}); */
    this.ticketService.noteAddedMediaChangeSignal.set({ media: this.selectedNoteMedia, note: this.note});
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Success,
        message: noteType ? this.translate.instant("Note-edited-successfully") : this.translate.instant("Note-added-successfully"),
      },
    });
    if (this.selectedNoteMedia?.length > 0) {
      this.clearInputs();
    }
    // this._cdr.detectChanges();
  }
  getTicketSummaryByTicketID(genericFilter: GenericFilter): void {
    const genericRequestParameter = {
      brandInfo: genericFilter.brands[0],
      startDateEpcoh: 0,
      endDateEpoch: 0,
      ticketId: Number(genericFilter.simpleSearch),
      to: 1,
      from: 1,
      authorId: '',
      author: null,
      isActionableData: 0,
      channel: 0,
      isPlainLogText: false,
      targetBrandName: '',
      targetBrandID: 0,
      oFFSET: 0,
      noOfRows: 10,
      isCopy: true,
    };

    this.GetTicketSummary2Api = this._userDetailService
      .GetTicketSummary(genericRequestParameter)
      .subscribe((data) => {
        // console.log('Ticket Summary', data);
        /* genericFilter.startDateEpoch = moment(data.updatedAt)
          .subtract({ hours: 2 })
          .unix();
        genericFilter.endDateEpoch = moment
          .utc(data.updatedAt)
          .add({ seconds: 2 })
          .unix(); */
        // moment(data.updatedAt).unix(); // 1624370808
        // genericFilter.endDateEpoch = moment.utc(data.updatedAt).local().unix();
        // genericFilter.endDateEpoch = moment(data.updatedAt).local().unix();

        const ticketArray = [];
        ticketArray.push(+data.ticketID);
        const ticketObj: Filter = {
          name: 'CD.CaseID',
          value: ticketArray,
          type: 2,
        };

        // genericFilter.filters.push(ticketObj);
        this.getTicketsByTicketId(genericFilter);
      });
  }

  getTicketsByTicketId(genericFilter: GenericFilter): void {
    this.GetTicketsByTicketIdsApi = this.ticketService.GetTicketsByTicketIds(genericFilter).subscribe(
      (resp) => {
        if (resp && resp.length > 0) {
          this.userChangeLoader = false;
          this.initialLoad = true;
          this._postDetailService.postObj = resp[0];
          /* this._postDetailService.currentPostObject.next(
            resp[0].ticketInfo.ticketID
          ); */
          this._postDetailService.currentPostObjectSignal.set(
            resp[0].ticketInfo.ticketID
          );
        }else{
          this.userChangeLoader = false;
          this._cdr.detectChanges();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Data-not-found-for-this-user'),
            },
          });
        }
      },
      (err) => {
        this.userChangeLoader = false;
        this._cdr.detectChanges();
        // console.log(err);
      },
      () => {
        // console.log('call completed');
      }
    );
  }

  CloseTicketDetailWindow(): void {
    this.ticketService.postDetailsAfterAssignTo.next(null)
    const obj = {
      BrandID: this.postObj.brandInfo.brandID,
      BrandName: this.postObj.brandInfo.brandName,
      TicketID: this.postObj.ticketInfo.ticketID,
      Status: 'C',
    };
    this.lockUnlockTicket(obj);
    this.ticketService.bulkMentionChecked = [];
    this.ticketService.selectedPostList = [];
    this._postDetailService.replyText = '';
    this._postDetailService.ticketOpenDetail = null;
    if (this._postDetailService?.postObj) {
      /* this._postDetailService.postDetailWindowStatus.next({
        status: false,
        ticketId: this._postDetailService.postObj.ticketID,
      }); */
      this._postDetailService.postDetailWindowStatusSignal.set({
        status: false,
        ticketId: this._postDetailService.postObj.ticketID,
      });
    }
    this._postDetailService.postObj = null;
    this.ticketService.postDetailWindowTrigger({ openState: false });
    this._chatBotService.chatPositionSignal.set({
      openPostDetailWindowStatus: false,
    });
    this._postDetailService.makeActionableFlag = false;
    console.log(
      `emit from PostDetailComponent =>  CloseTicketDetailWindow() => line: 1379 . Checks: openPostDetailWindowStatus always false .`
    );
    if (this.currentUser?.data?.user?.isVOIPAgent) {
      this._voip.assignCallObjData();
    }

    this._postDetailService.postDetailPage = false;
    this._postDetailService.selectedTicketType=null;
    if(this._replyService.selectedNoteMediaVal){
      this.clearInputs()
    }

    /* if ticket action time api failed  */
    const isApiError = this.TicketData.findIndex(ticket => ticket.ticketInfo['isApiActionError']);
    if(isApiError !=-1){
      // this._filterService.filterTabSource.next(this._navigationService.currentSelectedTab);
      this._filterService.filterTabSourceSignal.set(this._navigationService.currentSelectedTab);

    }
    this.ticketService.updateUnseenNoteCountObs.next({guid:this._navigationService?.currentSelectedTab?.guid})
    this._postDetailService.emailTicketAttachmentMedia =[]
    this._postDetailService.emailIdsInSameThread=[]
    /* if ticket action time api failed  */
  }

  onScroll(event: any) {
    let lastIndex = 0;

    if (
      this.startPosition <=
      event.target.offsetHeight + event.target.scrollTop + 50
    ) {
      let index = Math.trunc((event.target.scrollTop / 130) + 1);
      if (index != lastIndex && index > 5) {
        lastIndex = index - 1;
        this.startIndex = this.TicketData.length - 10 > this.startIndex ? this.startIndex + 1 : this.startIndex;
        this.endIndex = this.TicketData.length >= this.endIndex ? this.endIndex + 1 : this.endIndex;
        this._cdr.detectChanges();
      }
    } else {
      let index1 = Math.trunc((event.target.scrollTop / 130) + 1);
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
    let el = document.getElementById('active');
    el ? el.scrollIntoView() : '';
    // let lastPosition = 0
    // let status: boolean = true;
    this._NgZone.runOutsideAngular(() => {
      if (this.postDetail?.nativeElement) {
        this.scrollListener = () => {
          this.ticketService.scrollEventPostDetail.next(true);
          console.log('Scrolling...');
        };
        this.postDetail.nativeElement.addEventListener('scroll', this.scrollListener);
      }
      // this.postDetail.nativeElement.addEventListener('scroll', (event) => {
      //   this.ticketService.scrollEventPostDetail.next(true);
      // });

      // this.shortEnded.nativeElement.addEventListener('scroll', (event) => {
      //   let index = Math.trunc((event.target.scrollTop / 130) + 1);
      //   const endTicket = this.endIndex > this.TicketData.length ? this.TicketData.length - this.startIndex - 10 : this.endIndex - this.startIndex - 10;
      //   if (index > endTicket && status && this.endIndex < this.TicketData.length && lastPosition < event.target.scrollTop) {
      //     this.endIndex = this.endIndex + 35;
      //     this.startIndex = index - 10 > 0 ? index - 10 : 0;
      //     status = false;
      //     this._cdr.detectChanges();
      //     setTimeout(() => {
      //       status = true;
      //     }, 500);
      //   }
      //   if (index < 5 && status && this.startIndex > 5 && lastPosition > event.target.scrollTop) {
      //     this.startIndex = this.startIndex - 5 > 5 ? this.startIndex - 5 : 0;
      //     this.endIndex = this.startIndex + 35;
      //     status = false;
      //     this._cdr.detectChanges();
      //     setTimeout(() => {
      //       status = true;
      //     }, 100);
      //   }
      //   lastPosition = event.target.scrollTop;
      // });
    });
  }

  ngOnDestroy(): void {
    this.clearSignal.set(false);
    this._cdr.detectChanges();
    this._cdr.detach();
    if (this.postDetail?.nativeElement && this.scrollListener) {
      this.postDetail.nativeElement.removeEventListener('scroll', this.scrollListener);
      this.postDetail = null;
    }
    // this._postDetailService.currentPostObject.unsubscribe();
    // this.CloseTicketDetailWindow();
    if(this._replyService.selectedNoteMediaVal){
      this.clearInputs()
    }
    this.subs.unsubscribe();
    this.destroyApiRelatedData();
    this.clearAllVariables();
    this.clearSetTimeout();
  }

  onHideActionStatusChange(event): void {
    if (event.checked) {
      this.hideActionstatus = true;
      localStorage.setItem('commlogfilter', String(1));
    } else {
      this.hideActionstatus = false;
      localStorage.setItem('commlogfilter', String(0));
    }
  }

  clearnote(): void {
    this.note = '';
    if(this._replyService.selectedNoteMediaVal){
      this.clearInputs()
    }
  }

  toggleBulkSelect(selectedPost: [boolean, number]): void {
    if (selectedPost[0] === true) {
      this.ticketService.selectedPostList.push(+selectedPost[1]);
      this.ticketService.postSelectTriggerSignal.set(
        this.ticketService.selectedPostList.length
      );
    } else {
      const index = this.ticketService.selectedPostList.indexOf(
        +selectedPost[1]
      );
      if (index > -1) {
        this.ticketService.selectedPostList.splice(index, 1);
        this.ticketService.postSelectTriggerSignal.set(
          this.ticketService.selectedPostList.length
        );
      }
    }
    this.bulkActionpanelStatus =
      this.ticketService.selectedPostList.length >= 2 ? true : false;
  }

  postBulkAction(event): void {
    if (event === 'dismiss') {
      this.bulkActionpanelStatus = false;
      //this._chatBotService.chatPosition.next(false);
      this._chatBotService.chatPositionSignal.set({
        bulkActionpanelFalg: this.bulkActionpanelStatus,
      });
      console.log(
        `emit from PostDetailComponent => postBulkAction(event) => line 1440. Check: bulkActionpanelFalg always false`
      );
      this._postDetailService.isBulk = false
      //this.refreshcountafterbulk();
    } else if (event === 'selectAll') {
      this.ticketService.bulkMentionChecked = [];
      this.ticketService.selectedPostList = [];
      if (this.checkAllCheckBox) {
        this.checkAllCheckBox = false;
      } else {
        this.checkAllCheckBox = true;
      }

      const ticketList = this.baseLogObject.filter(
        (x) =>
          x.concreteClassName !==
          'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog'
      );
      const isexcludebrandmention = localStorage.getItem(
        'isexcludebrandmention_' + this.currentUser?.data?.user?.userId
      );
      let List;
      if (isexcludebrandmention === '1') {
        List = ticketList.filter((x) => x.isBrandPost === false);
      } else {
        List = ticketList;
      }
      for (const ticket of List) {
        if (this.checkAllCheckBox) {
          const obj: BulkMentionChecked = {
            guid: this._navigationService.currentSelectedTab.guid,
            mention: ticket,
          };
          this.ticketService.bulkMentionChecked.push(obj);
          this.ticketService.selectedPostList.push(ticket.ticketInfo.ticketID);
          this.ticketService.postSelectTriggerSignal.set(
            this.ticketService.selectedPostList.length
          );
        } else {
          this.ticketService.postSelectTriggerSignal.set(
            this.ticketService.selectedPostList.length
          );
        }

        this.bulkActionpanelStatus =
          this.ticketService.selectedPostList.length >= 2 ? true : false;

        const CheckedTickets = this.ticketService.bulkMentionChecked.filter(
          (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
        );
        if (CheckedTickets.length > 1) {
          const forapproval = CheckedTickets.map(
            (s) =>
              s.mention.makerCheckerMetadata.workflowStatus ===
              LogStatus.ReplySentForApproval
          ).filter(this.onlyUnique);
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

        // this.ShowHideButtonsFromTicketStatus();
        // this.postSelectEvent.emit([checked, id]);
      }
    } else if (event === 'hideactionpanel') {
      this.ticketService.bulkMentionChecked = [];
      this.ticketService.selectedPostList = [];
      this.checkAllCheckBox = false;
      this.bulkActionpanelStatus = false;
      this.ticketService.unselectbulkpostTrigger.next(false);
      this._postDetailService.isBulk = false
    } else if (event === 'excludebrand') {
      const isexcludebrandmention = localStorage.getItem(
        'isexcludebrandmention_' + this.currentUser?.data?.user?.userId
      );
      let flag;
      if (isexcludebrandmention === '1') {
        flag = true;
      } else {
        flag = false;
        this.ticketService.bulkMentionChecked = [];
        this.ticketService.selectedPostList = [];
      }
      const ticketList = this.baseLogObject.filter(
        (x) =>
          x.concreteClassName !==
          'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog'
      );
      let List;
      if (isexcludebrandmention === '1') {
        List = ticketList.filter((x) => x.isBrandPost === true);
      } else {
        List = ticketList;
      }
      for (const checkedticket of List) {
        if (flag) {
          if (checkedticket.isBrandPost) {
            const ticketIndex = this.ticketService.selectedPostList.findIndex(
              (obj) => obj === checkedticket.ticketInfo.ticketID
            );
            if (ticketIndex > -1) {
              this.ticketService.selectedPostList.splice(ticketIndex, 1);
            }
            const ticketIndex1 =
              this.ticketService.bulkMentionChecked.findIndex(
                (obj) =>
                  obj.mention.ticketInfo.ticketID ===
                  checkedticket.ticketInfo.ticketID
              );
            if (ticketIndex1 > -1) {
              this.ticketService.bulkMentionChecked.splice(ticketIndex1, 1);
            }
          }
        } else {
          if (this.checkAllCheckBox) {
            const obj: BulkMentionChecked = {
              guid: this._navigationService.currentSelectedTab.guid,
              mention: checkedticket,
            };
            this.ticketService.bulkMentionChecked.push(obj);
            this.ticketService.selectedPostList.push(
              checkedticket.ticketInfo.ticketID
            );
            this.ticketService.excludepostSelectTrigger.next(
              this.ticketService.selectedPostList.length
            );
          } else {
            this.ticketService.excludepostSelectTrigger.next(
              this.ticketService.selectedPostList.length
            );
          }
        }
      }
      this.ticketService.excludepostSelectTrigger.next(
        this.ticketService.selectedPostList.length
      );

      this.ticketService.selectExcludeBrandMention.next(flag);
    }
  }

  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  postActionClicked(data: any): void {
    if (data.post) {
      if (data.operation) {
        if (data.operation === PostActionType.Close) {
          this.closeTicket(data.post.ticketInfo.ticketID);
        }
      }
    }
  }

  closeTicket(ticketID): void {
    const ticketIndex = this.TicketData.findIndex(
      (obj) => obj.ticketInfo.ticketID === ticketID
    );
    if (ticketIndex > -1) {
      this.TicketData.splice(ticketIndex, 1);
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
    }
  }

  private getMentionsCount(filterObj): void {
    this.postloader = true;
    this.checkWhichActionIsClicked(filterObj);
    const removeBrandActivity = this.removeBrandActivity(filterObj);
    this.getMentionCountApi = this.ticketService
      .getMentionCount(removeBrandActivity)
      .subscribe((data) => {
        // this.TicketData = data;
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
            } else if (this.brandpost && this.brandreply === false) {
              this.pagerCount = data.brandPost;
              this.ticketsFound = data.brandPost;
            } else if (this.brandreply && this.brandpost === false) {
              this.pagerCount = data.brandReply;
              this.ticketsFound = data.brandReply;
            }
          }
        }
        this.postloader = false;
      });
  }

  removeBrandActivity(genericFilter: GenericFilter): GenericFilter {
    const filterObj = JSON.parse(JSON.stringify(genericFilter));
    if (filterObj.filters.length > 0) {
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

  checkWhichActionIsClicked(genericFilter: GenericFilter): GenericFilter {
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    const filterObj = JSON.parse(JSON.stringify(genericFilter));
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
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

  refreshcountafterbulk(): void {
    const chkTicket = this.ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    for (const checkedticket of chkTicket) {
      const ticketIndex = this.TicketData.findIndex(
        (obj) =>
          obj.ticketInfo.ticketID === checkedticket.mention.ticketInfo.ticketID
      );
      if (ticketIndex > -1) {
        this.TicketData.splice(ticketIndex, 1);
        --this.ticketsFound;
      }
    }
    this.ticketService.bulkMentionChecked = [];
    this.ticketService.selectedPostList = [];
    this.ticketService.postSelectTriggerSignal.set(
      this.ticketService.selectedPostList.length
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
  }

  UpdateBulkReplyCountSignalR(signalObj: PostSignalR): void {
    const AuthorID = signalObj.message.AuthorID;
    const ReplySuccess = signalObj.message.ReplySuccess;
    if (this.bulkinprogress && AuthorID === this.postObj.author.socialId) {
      if (this.bulkpending > 0) {
        this.bulkpending = +this.bulkpending - 1;
        if (ReplySuccess) {
          this.bulksuccess = this.bulksuccess + 1;
        } else {
          this.bulkfailed = this.bulkfailed + 1;
        }
      } else {
        this.bulkpending = 0;
      }

      if (this.bulkpending === 0) {
        this.bulkinprogress = false;
        this.bulkreplysuccess = true;
        this.bulkinprogresstitle = 'Replies Sent: ' + this.bulksuccess;
      }
      this._cdr.detectChanges();
    }
  }

  SSREProcessCompleted(signalObj: PostSignalR): void {
    const AuthorID = signalObj.message.Data.StrAuthorID;

    if (this.ssreinprogress && AuthorID === this.postObj.author.socialId) {
      this.postObj.ticketInfoSsre.ssreStatus = SSRELogStatus.Successful;

      this.ssreinprogress = false;
      this.ssresuccess = true;
      const brandInfo = this._filterService?.fetchedBrandData?.find((x) => x.brandID == this.postObj.brandInfo.brandID);
      if (brandInfo) {
        this.ssreinprogresstitle = `${(brandInfo?.isWorkflowEnabled) ? 'Workflow ' : 'SSRE '} Process Completed`;
      }
      // this.ssreinprogresstitle = `${this.postObj?.ticketInfoWorkflow?.workflowId ? 'Workflow ' : 'SSRE '}  Process Completed`;;
      this._cdr.detectChanges();
    }
  }

  refreshTicketHistory(): void {
    this.bulkinprogress = false;
    this.bulkreplysuccess = false;
    this.ssreinprogress = false;
    this.ssresuccess = false;
    // this.ticketService.ticketStatusChange.next(true);
    this.ticketService.ticketStatusChangeSignal.set(true);

  }

  getTicketData(genericFilter: GenericFilter, callfunction = false): void {
    const genericRequestParameter = {
      brandInfo: genericFilter.brands[0],
      startDateEpcoh: 0,
      endDateEpoch: 0,
      ticketId: Number(genericFilter.simpleSearch),
      to: 1,
      from: 1,
      authorId: '',
      author: null,
      isActionableData: 0,
      channel: 0,
      isPlainLogText: false,
      targetBrandName: '',
      targetBrandID: 0,
      oFFSET: 0,
      noOfRows: 10,
      isCopy: true,
    };

    this.getTicketWithId(genericFilter, callfunction);

    // this._userDetailService
    //   .GetTicketSummary(genericRequestParameter)
    //   .subscribe((data) => {
    //     // console.log('Ticket Summary', data);
    //     genericFilter.startDateEpoch = moment(data.updatedAt)
    //       .subtract({ hours: 2 })
    //       .unix();
    //     genericFilter.endDateEpoch = moment
    //       .utc(data.updatedAt)
    //       .add({ seconds: 2 })
    //       .unix(); // moment(data.updatedAt).unix(); // 1624370808
    //     // genericFilter.endDateEpoch = moment.utc(data.updatedAt).local().unix();
    //     // genericFilter.endDateEpoch = moment(data.updatedAt).local().unix();

    //     const ticketArray = [];
    //     ticketArray.push(+data.ticketID);
    //     const ticketObj: Filter = {
    //       name: 'CD.CaseID',
    //       value: ticketArray,
    //       type: 2,
    //     };

    //     // genericFilter.filters.push(ticketObj);
    //     this.getTicketWithId(genericFilter, callfunction);
    //   });
  }

  getTicketWithId(genericFilter: GenericFilter, callfunction = false): void {
    // this.ticketService.GetTicketsByTicketIds(genericFilter).subscribe(
    //   (resp) => {
    //     if (resp && resp.length > 0) {
    this.initialLoad = true;
    (this._postDetailService.postObj.channelGroup==ChannelGroup.Voice)?'':this._postDetailService.postObj = this.selectedPostFromHistory[0];
    if (this.TicketData && this.TicketData.length > 0) {
      const findTicket = this.TicketData.findIndex(
        (obj) =>
          obj.ticketInfo.ticketID ===
          this.selectedPostFromHistory[0].ticketInfo.ticketID &&
          obj.tagID === this.selectedPostFromHistory[0].tagID
      );
      if (findTicket > -1) {
        this.TicketData[findTicket] = this.selectedPostFromHistory[0];
      }
    }
    this.changeChatBotView()
    if (callfunction) {
      /* this._replyService.postDetailObjectChanged.next(
        this._postDetailService.postObj
      ); */
      this._replyService.postDetailObjectChangedSignal.set(
        this._postDetailService.postObj
      );
    }
    // }
    //   },
    //   (err) => {
    //     // console.log(err);
    //   },
    //   () => {
    //     // console.log('call completed');
    //   }
    // );
  }

  changePostView(event): void {
    //this._postDetailService.setTicketView.next(true);
    this.postView = event.value;
  }

  getRequestPopup(): void {
    const BrandIds = [];
    BrandIds.push(this.postObj.brandInfo.brandID);
    const postCRMdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postObj.brandInfo.brandID
    );
    const TicketParams = {
      UtcOffset: new Date().getTimezoneOffset(),
      Accounttype: +this.currentUser?.data?.user?.role,
      BrandFriendlyName: this.postObj?.brandInfo?.brandFriendlyName,
      BrandIds,
      NoOfRows: 50,
      RecordOffset: 0,
      TicketID: this.postObj.ticketInfo.ticketID,
      AuthorID: this.postObj.author.socialId,
      ChannelGroupID: this.postObj.channelGroup,
      ChannelType: this.postObj.channelType,
      SocialID: this.postObj.socialID,
      PostType: 1,
      IsTakeOver: null,
      From: 0,
      To: 50,
      TagID: this.postObj.tagID,
    };

    const sourceobj = {
      AuthorName: this.postObj.author.name,
      AuthorFullName: '',
      AuthorProfileURL: this.postObj.author.profileUrl,
      AuthorFollowerCount: this.postObj.author.followersCount,
      AuthorFollowingCount: this.postObj.author.followingCount,
      TimeOffset: new Date().getTimezoneOffset(),
      TicketParams,
      BrandID: this.postObj.brandInfo.brandID,
      BrandName: this.postObj.brandInfo.brandName,
      SrID: this.postObj.ticketInfo.srid,
      AuthorProfilePicUrl: this.postObj.author.picUrl,
      CRMClassName: postCRMdata.crmClassName,
      ChannelType: this.postObj.channelType,
      IsRequestPopup: false,
      EndDateEpoch: this.postObj.mentionTimeEpoch,
    };

    const leftmenuobject = {
      BrandInfo: this.postObj.brandInfo,
      AuthorSocialId: this.postObj.author.socialId,
      ChannelGroup: this.postObj.channelGroup,
      CrmClassName: postCRMdata.crmClassName,
    };
    if (postCRMdata.crmClassName.toLowerCase() == 'snapdealcrm') {
      if (this.postObj.ticketInfo.srid == null || this.postObj.ticketInfo.srid == '') {
        this.filterBrandInfo = postCRMdata;
        this.lookupshow = true
        this.snapdealSridFound = false
        return;
      } else {
        this.filterBrandInfo = postCRMdata;
        this.lookupshow = true
        this.snapdealSridFound = true
        return;
      }
    }

    if (postCRMdata.typeOfCRM == 101 && postCRMdata.crmActive && postCRMdata.isManualPush == 1) {
      if ((this.postObj.ticketInfo.srid == null || this.postObj.ticketInfo.srid == '') && (this.postObj.ticketInfo.leadID == '' || this.postObj.ticketInfo.leadID == null)) {
        this.filterBrandInfo = postCRMdata;
        this.getAuthorDetails(postCRMdata, this.postObj,false)
        this.Data1ForFormData=null;
        return;
      } else {
        this.filterBrandInfo = postCRMdata;
        this.getAuthorDetails(postCRMdata, this.postObj,true)
        // this.lookupshowquickwork = true
        // this.quickworkSridFound = true
        return;
      }
    }

    if (postCRMdata.typeOfCRM == 102 && postCRMdata.crmActive && postCRMdata.isManualPush == 1) {
      this.openPushToTicketCRM();
      return;
    }

    this._postDetailService.postObj = this.postObj;
    this._postDetailService.crmPostTye = 3;
    this.GetCrmLeftMenuApi = this._crmService.GetCrmLeftMenu(leftmenuobject).subscribe((data) => {
      const crmMenu: CRMMenu = data;
      this._crmService.crmName = postCRMdata.crmClassName;
      this._crmService.crmmenu = crmMenu;
      this._NgZone.run(() => {
        const dialogRef = this._dialog.open(CrmComponent, {
          width: '1050px',
        });
      })
    });
    this._NgZone.run(() => { })
    this.GetBrandCrmRequestDetailsApi = this._crmService.GetBrandCrmRequestDetails(sourceobj).subscribe((data) => {
      if (postCRMdata.crmClassName.toLowerCase() === 'bandhancrm') {
        let FirstName = '';
        let LastName = '';
        if (data.details.authorDetails) {
          const PersonalDetailsName = data.details.userName;
          if (PersonalDetailsName) {
            let names = PersonalDetailsName.split(' ');
            if (names.length === 0) {
              names = PersonalDetailsName.split('.');
            }
            if (names.length === 0) {
              names = PersonalDetailsName.split('_');
            }

            if (names.length > 1) {
              FirstName = names[0];
              LastName = names[1];
            } else if (names.length === 1) {
              FirstName = names[0];
            }
          }
        }
        let bandhanrequest: BandhanRequest;
        bandhanrequest = {
          UserProfileurl: data.details.userProfileurl,
          FollowingCount: data.details.authorDetails
            ? data.details.authorDetails.followingCount
            : 0,
          FollowerCount: data.details.authorDetails
            ? data.details.authorDetails.followersCount
            : 0,
          LocobuzzTicketID: data.details.locobuzzTicketID,
          MobileNumber: data.details ? data.details.mobileNumber : '',
          EmailAddress: data.details ? data.details.emailAddress : '',
          FirstName,
          LastName,
          RequestType: data.details.requestType,
          UCIC: data.details.authorDetails ? this.postObj.author.socialId : '',
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks,
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          TagID: data.tagID,
          ChannelType: data.details.channelType,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          ProductGroup: data.details.productgroup,
          QueryType: data.details.querytype,
          QueryName: data.details.queryname,
          SubChannel: data.details.subChannel,
          UserName: data.details.userName,
          FullName: data.details.fullname,
          CreatedBy: data.details.createdBy,
          SrID: data.details.srID,
          IsUserFeedback: data.details.isUserFeedback,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          Source: data.details.source,
          LosLeadID: '',
          AuthorDetails: data.details.authorDetails
            ? data.details.authorDetails
            : '',
          SubType: '',
          SubCategoryType: '',
          LatestTagId: data.details.latestTagId,
          LatestTagIdEpochTime: data.details.latestTagIdEpochTime,
        };
        this._crmService.bandhanrequest = bandhanrequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'fedralcrm') {
        let FirstName = '';
        let LastName = '';
        if (data && data.details && data.details.authorDetails) {
          const PersonalDetailsName = data.details.authorDetails.name;
          if (PersonalDetailsName) {
            let names = PersonalDetailsName.split(' ');
            if (names.length === 0) {
              names = PersonalDetailsName.split('.');
            }
            if (names.length === 0) {
              names = PersonalDetailsName.split('_');
            }

            if (names.length > 1) {
              FirstName = names[0];
              LastName = names[1];
            } else if (names.length === 1) {
              FirstName = names[0];
            }
          }
        }
        let fedralrequest: FedralRequest;
        fedralrequest = {
          Source: data.details.source,
          LocobuzzTicketID: data.details.locobuzzTicketID,
          MobileNumber: data.details ? data.details.mobileNumber : '',
          EmailAddress: data.details ? data.details.emailAddress : '',
          FirstName,
          LastName: data.details.lastName ? data.details.lastName : LastName,
          Category: data.details.categoryName,
          RequestType: data.details.requestType,
          UCIC: data.details.authorDetails ? this.postObj.author.socialId : '',
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks ? data.details.remarks : '',
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          TagID: data.details.tagID,
          ChannelType: data.details.channelType,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          Severity: '',
          City: '',
          State: '',
          Address: '',
          PostalCode: '',
          Country: '',
          UserProfileurl: data.details.userProfileurl,
          FollowingCount: data.details.authorDetails
            ? data.details.authorDetails.followingCount
            : '',
          FollowerCount: data.details.authorDetails
            ? data.details.authorDetails.followersCount
            : '',
          SubChannel: data.details.subChannel,
          UserName: data.details.userName,
          FullName: data.details.fullname,
          CreatedBy: data.details.createdBy,
          SrID: data.details.srID,
          IsUserFeedback: data.details.isUserFeedback,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          LosLeadID: '',
          SubCategory: data.details.subCategoryName,
          SubSubCategory: data.details.subSubCategoryName,
          Gender:
            data.details.gender == 'Male'
              ? 'M'
              : data.details.gender == 'Female'
                ? 'F'
                : data.details.gender == 'Transgender'
                  ? 'O'
                  : 'Not Applicable',
          Location: data.details.storeLocation,
          CountryCode: data.details.countryCode
            ? Number(data.details.countryCode)
            : 0,
        };
        this._crmService.fedralrequest = fedralrequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'magmacrm') {
        let FirstName = '';
        let LastName = '';
        if (data.details.authorDetails) {
          const PersonalDetailsName = data.details.userName;
          if (PersonalDetailsName) {
            let names = PersonalDetailsName.split(' ');
            if (names.length === 0) {
              names = PersonalDetailsName.split('.');
            }
            if (names.length === 0) {
              names = PersonalDetailsName.split('_');
            }

            if (names.length > 1) {
              FirstName = names[0];
              LastName = names[1];
            } else if (names.length === 1) {
              FirstName = names[0];
            }
          }
        }
        let magmarequest: MagmaRequest;
        magmarequest = {
          Source: data.details.source,
          LocobuzzTicketID: data.details.locobuzzTicketID,
          MobileNumber: data.details
            ? data.details?.authorDetails?.locoBuzzCRMDetails?.phoneNumber
            : '',
          EmailAddress: data.details
            ? data.details?.authorDetails?.locoBuzzCRMDetails?.emailID
            : '',
          PanCard: data.details?.panCard,
          FirstName,
          LastName,
          Product: data.details?.product,
          UCIC: data?.details?.authorDetails ? this.postObj?.author?.socialId : '',
          ConversationLog: data?.details?.conversationLog,
          Remarks: data?.details?.remarks,
          Channel: data?.details?.channel
            ? data?.details?.channel
            : ChannelGroup[this?.postObj?.channelGroup],
          TagID: data?.details?.tagID,
          ChannelType: data?.details?.channelType,
          LocobuzChannelGroup: data?.details?.locobuzChannelGroup,
          UserProfileurl: data?.details?.userProfileurl,
          FollowingCount: data?.details?.authorDetails
            ? data?.details?.authorDetails?.followingCount
            : '',
          FollowerCount: data?.details?.authorDetails
            ? data?.details?.authorDetails?.followersCount
            : '',
          SubChannel: data?.details?.subChannel,
          UserName: data?.details?.userName,
          FullName: data?.details?.fullname,
          CreatedBy: data?.details?.createdBy,
          SrID: data?.details?.srID,
          IsUserFeedback: data?.details?.isUserFeedback,
          LoggedInUserEmailAddress: data?.details?.loggedInUserEmailAddress,
          LosLeadID: data?.details?.losLeadID,
          Customer: data?.details?.customer,
          Disposition: data?.details?.disposition,
          SubDisposition: data?.details?.subDisposition,
          LeadStatus: data?.details?.leadStatus,
          LeadStage: data?.details?.leadStage,
          LeadSubStage: data?.details?.leadSubStage,
          NewAppointmentDate: data?.details?.newAppointmentDate,
          CurrentOwner: data?.details?.currentOwner,
          Owner: data?.details?.owner,
          RequestType: data?.details?.requestType ? data?.details?.requestType : '',
        };
        this._crmService.magmarequest = magmarequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'titancrm') {
        let FirstName = '';
        let LastName = '';
        if (data.details.authorDetails) {
          const PersonalDetailsName = data.details.authorDetails.name;
          if (PersonalDetailsName) {
            let names = PersonalDetailsName.split(' ');
            if (names.length === 0) {
              names = PersonalDetailsName.split('.');
            }
            if (names.length === 0) {
              names = PersonalDetailsName.split('_');
            }

            if (names.length > 1) {
              FirstName = names[0];
              LastName = names[1];
            } else if (names.length === 1) {
              FirstName = names[0];
            }
          }
        }
        let titanrequest: TitanRequest;
        titanrequest = {
          CaseSource: data.details.caseSource ? data.details.caseSource : '',
          UserName: this.postObj.author.screenname
            ? this.postObj.author.screenname
            : this.postObj.author.name
              ? this.postObj.author.name
              : '',
          LocobuzzTicketID: data.details.locobuzzTicketID
            ? data.details.locobuzzTicketID
            : '',
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          SubChannel: data.details.subChannel ? data.details.subChannel : '',
          UserProfileurl: data.details.userProfileurl
            ? data.details.userProfileurl
            : '',
          FollowingCount: data.details.authorDetails
            ? data.details.authorDetails.followingCount
            : '',
          FollowerCount: data.details.authorDetails
            ? data.details.authorDetails.followersCount
            : '',
          ConversationLog: data.details.conversationLog,
          FullName: data.details.fullname
            ? data.details.fullname
            : this.postObj.author.name,
          MobileNumber: data.details ? data.details.mobileNumber : '',
          EmailAddress: data.details ? data.details.emailAddress : '',
          CustomerId: data.details.customerId ? data.details.customerId : '',
          StoreLocation: data.details.storeLocation
            ? data.details.storeLocation
            : '',
          Remarks: data.details.remarks ? data.details.remarks : '',
          QueryType: '',
          FunctionalArea: '',
          DomainArea: '',
          TagID: data.tagID,
          ChannelType: data.details.channelType,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress
            ? data.details.loggedInUserEmailAddress
            : '',
          CreatedBy: data.details.createdBy ? data.details.createdBy : '',
          SrID: data.details.srID ? data.details.srID : '',
          IsUserFeedback: data.details.isUserFeedback,
          UCIC: data.details.authorDetails ? this.postObj.author.socialId : '',
        };
        this._crmService.titanrequest = titanrequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'apollocrm') {
        let FirstName = '';
        let LastName = '';
        if (data.details.authorDetails) {
          const PersonalDetailsName = data.details.userName;
          if (PersonalDetailsName) {
            let names = PersonalDetailsName.split(' ');
            if (names.length === 0) {
              names = PersonalDetailsName.split('.');
            }
            if (names.length === 0) {
              names = PersonalDetailsName.split('_');
            }

            if (names.length > 1) {
              FirstName = names[0];
              LastName = names[1];
            } else if (names.length === 1) {
              FirstName = names[0];
            }
          }
        }
        let apollorequest: ApolloRequest;
        apollorequest = {
          FirstName: data.details.firstName
            ? data.details.firstName
            : FirstName,
          Hospital: data.details.hospital ? data.details.hospital : '',
          HospitalId:
            data.details.hospitalId && data.details.hospitalId != '0'
              ? data.details.hospitalId
              : '',
          LastName: data.details.lastName ? data.details.lastName : LastName,
          LatestTagId: 0,
          LatestTagIdEpochTime: 0,
          LeadName: data.details.leadName ? data.details.leadName : '',
          LeadRequestType: data.details.leadRequestType
            ? data.details.leadRequestType
            : '',
          LeadSource: data.details.leadSource ? data.details.leadSource : '',
          LosLeadID: data.details.losLeadID ? data.details.losLeadID : '',
          RequestType: data.details.requestType,
          Source: data.details.source,
          Speciality: data.details.speciality ? data.details.speciality : '',
          SpecialityId:
            data.details.specialityId && data.details.specialityId != '0'
              ? data.details.specialityId
              : '',
          UCIC: this.postObj.author.socialId,
          $type: '',
          AuthorDetails: null,
          CreatedDate: data.details.createdDate
            ? data.details.createdDate
            : null,
          PostUrl: data.details.postUrl ? data.details.postUrl : '',
          UserName: data.details.username ? data.details.username : '',
          LocobuzzTicketID: data.details.locobuzzTicketID
            ? data.details.locobuzzTicketID
            : '',
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          SubChannel: data.details.subChannel ? data.details.subChannel : '',
          UserProfileurl: data.details.userProfileurl
            ? data.details.userProfileurl
            : '',
          FollowingCount: data.details.authorDetails
            ? data.details.authorDetails.followingCount
            : '',
          FollowerCount: data.details.authorDetails
            ? data.details.authorDetails.followersCount
            : '',
          ConversationLog: data.details.conversationLog,
          FullName: data.details.fullname ? data.details.fullname : '',
          MobileNumber: data.details ? data.details.mobileNumber : '',
          EmailAddress: data.details ? data.details.emailAddress : '',
          Remarks: data.details.remarks ? data.details.remarks : '',
          TagID: data.details.tagID,
          ChannelType: data.details.channelType,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress
            ? data.details.loggedInUserEmailAddress
            : '',
          CreatedBy: data.details.createdBy ? data.details.createdBy : '',
          SrID: data.details.srID ? data.details.srID : '',
          IsUserFeedback: data.details.isUserFeedback,
          City: data.details.city ? data.details.city : '',
          CityId:
            data.details.cityId && data.details.cityId != 0
              ? data.details.cityId
              : '',
          Doctor: data.details.doctor ? data.details.doctor : '',
          DoctorId:
            data.details.doctorId && data.details.doctorId != 0
              ? data.details.doctorId
              : '',
          Category: data.details.category ? data.details.category : '',
          CategoryId:
            data.details.categoryId && data.details.categoryId != 0
              ? data.details.categoryId
              : '',
          SubCategory: data.details.subCategory ? data.details.subCategory : '',
          SubCategoryId:
            data.details.subCategoryId && data.details.subCategoryId != 0
              ? data.details.subCategoryId
              : '',
          Attribute: data.details.attribute ? data.details.attribute : '',
          AttributeId: data.details.attributeId ? data.details.attributeId : '',
          CaseType: data.details.caseType ? data.details.caseType : '',
          CaseTypeId: data.details.caseTypeID ? data.details.caseTypeID : '',
        };
        this._crmService.apollorequest = apollorequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'recrm') {
        let FirstName = '';
        let LastName = '';
        if (data.details) {
          const PersonalDetailsName = data.details.userName;
          if (PersonalDetailsName) {
            let names = PersonalDetailsName.split(' ');
            if (names.length === 0) {
              names = PersonalDetailsName.split('.');
            }
            if (names.length === 0) {
              names = PersonalDetailsName.split('_');
            }

            if (names.length > 1) {
              FirstName = names[0];
              LastName = names[1];
            } else if (names.length === 1) {
              FirstName = names[0];
            }
          }
        }
        let recrmRequest: RecrmRequest;
        recrmRequest = {
          UserProfileurl: data.details.userProfileurl,
          FollowingCount: data.details.authorDetails
            ? data.details.authorDetails.followingCount
            : 0,
          FollowerCount: data.details.authorDetails
            ? data.details.authorDetails.followersCount
            : 0,
          LocobuzzTicketID: data.details.locobuzzTicketID,
          MobileNumber: data.details ? data.details.mobileNumber : '',
          EmailAddress: data.details ? data.details.emailAddress : '',
          FirstName,
          LastName,
          RequestType: data.details.requestType,
          UCIC: data.details.authorDetails ? this.postObj.author.socialId : '',
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks,
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          TagID: data.tagID,
          ChannelType: data.details.channelType,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          QueryType: data.details.querytype,
          SubChannel: data.details.subChannel,
          UserName: data.details.userName,
          FullName: data.details.fullname,
          CreatedBy: data.details.createdBy,
          SrID: data.details.srID,
          IsUserFeedback: data.details.isUserFeedback,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          Source: data.details.source,
          LosLeadID: '',
          AuthorDetails: data.details.authorDetails
            ? data.details.authorDetails
            : '',
          LatestTagId: data.details.latestTagId,
          LatestTagIdEpochTime: data.details.latestTagIdEpochTime,
          City: data.details.city,
          QueryReason: data.details.queryReason,
          QuerySubCategory: data.details.querySubCategory,
          ComplaintType: data.details.complaintType,
          ComplaintSubCategory: data.details.complaintSubCategory,
          ComplaintSubSubCategory: data.details.complaintSubSubCategory,
        };
        this._crmService.rercrmRequest = recrmRequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'tataunicrm') {
        const attachments =
          this.postObj?.attachmentMetadata?.mediaContents &&
            this.postObj?.attachmentMetadata?.mediaContents.length > 1
            ? this.postObj?.attachmentMetadata?.mediaContents[0].mediaUrl
            : '';

        let tataUnicrmRequest: TataUniRequest;
        tataUnicrmRequest = {
          DOB: 0,
          $type:
            'LocobuzzNG.Entities.Classes.Crm.BrandCrm.TataUniCrmRequest, LocobuzzNG.Entities',
          attachments: attachments,
          AuthorName: data.details.authorName,
          Brand: data.details.brand,
          Brandid: data.details.brandid,
          Category: data.details.category,
          CategoryId: data.details.categoryId,
          CorporateEmailId: data.details.corporateEmailId,
          CustomerHash: data.details.customerHash,
          Gender: data.details.gender,
          IssueCategory: data.details.issueCategory,
          IssueCategoryId: data.details.issueCategoryId,
          IssueClassification: data.details.issueClassification,
          IssueClassificationId: data.details.issueClassificationId,
          FullName: data.details.userName,
          ParentPost: data.details.parentPost,
          posttimeline: data.details.posttimeline,
          PostUrl: data.details.postUrl,
          PrimaryEmailId: data.details.primaryEmailId,
          PrimaryMobileNo: data.details.primaryMobileNo,
          Priority: data.details.priority,
          Sentiment: data.details.sentiment,
          SocialID: data.details.sourceid,
          SourceHandle: data.details.sourceHandle,
          Sourceid: data.details.sourceid,
          SRID: data.details.srID,
          Type: data.details.type,
          Typeid: data.details.typeid,
          VIP: data.details.vip,
          UserProfileurl: data.details.userProfileurl,
          FollowingCount: data.details.authorDetails
            ? data.details.authorDetails.followingCount
            : '0',
          FollowerCount: data.details.authorDetails
            ? data.details.authorDetails.followersCount
            : '0',
          LocobuzzTicketID: data.details.locobuzzTicketID,
          MobileNumber: data.details ? data.details.mobileNumber : '',
          EmailAddress: data.details ? data.details.emailAddress : '',
          // FirstName,
          // LastName,
          // RequestType: data.details.requestType,
          UCIC: this.postObj.author.socialId,
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks,
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          TagID: data.tagID,
          ChannelType: data.details.channelType
            ? data.details.channelType
            : ChannelType[this.postObj.channelType],
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          // QueryType: data.details.querytype,
          SubChannel: data.details.subChannel,
          UserName: data.details.userName,
          CreatedBy: data.details.createdBy,
          SrID: data.details.srID,
          IsUserFeedback: data.details.isUserFeedback,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          Source: data.details.source,
          // LosLeadID: '',
          // AuthorDetails: data.details.authorDetails
          //   ? data.details.authorDetails
          //   : '',
          // LatestTagId: data.details.latestTagId,
          // LatestTagIdEpochTime: data.details.latestTagIdEpochTime,
        };
        this._crmService.tataUniRequest = tataUnicrmRequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'octafxcrm') {
        let octafxCrm: any;

        let FirstName = '';
        let LastName = '';
        if (data.details) {
          const PersonalDetailsName = data.details.userName;
          if (PersonalDetailsName) {
            let names = PersonalDetailsName.split(' ');
            if (names.length === 0) {
              names = PersonalDetailsName.split('.');
            }
            if (names.length === 0) {
              names = PersonalDetailsName.split('_');
            }

            if (names.length > 1) {
              FirstName = names[0];
              LastName = names[1];
            } else if (names.length === 1) {
              FirstName = names[0];
            }
          }
        }

        octafxCrm = {
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          ChannelType: data.details.channelType,
          ConversationLog: data.details.conversationLog,
          CreatedBy: data.details.createdBy,
          EmailAddress: data.details.emailAddress
            ? data.details.emailAddress
            : '',
          FollowerCount: data.details.followerCount,
          FollowingCount: data.details.followingCount,
          FullName: data.details.authorDetails
            ? data.details.authorDetails.name
            : '',
          IsUserFeedback: data.details.isUserFeedback,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          LocobuzzTicketID: data.details.locobuzzTicketID,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          MobileNumber: data.details.mobileNumber,
          Remarks: data.details.remarks,
          SrID: data.details.srID,
          SubChannel: data.details.subChannel,
          TagID: data.details.tagID,
          UserName: data.details.userName,
          UserProfileurl: data.details.userProfileurl,
          $type:
            'LocobuzzNG.Entities.Classes.Crm.BrandCrm.OctaCrmRequest, LocobuzzNG.Entities',
          AuthorDetails: data.details.authorDetails,
          cf_account_number: data.details.cf_account_number,
          cf_info_new_demat_account: data.details.cf_info_new_demat_account,
          IssueSubType: data.details.cf_issue_subtype,
          IssueType: data.details.cf_issue_type,
          cf_pan_no_of_applicant: data.details.cf_pan_no_of_applicant,
          CreatedDate: 0,
          FirstName: FirstName,
          Language: '',
          LastName: LastName,
          LatestTagId: data.details.latestTagId,
          LatestTagIdEpochTime: data.details.latestTagIdEpochTime,
          LosLeadID: data.details.losLeadID,
          OctaFXRequestType: 0,
          PostUrl: '',
          Priority: data.details.priority,
          Rating: data.details.rating,
          RequestTypeText: '',
          ScreenName: '',
          Sentiment: data.details.sentiment,
          Source: data.details.source,
          TicketType: data.details.ticket_type,
          UCIC: this.postObj.author.socialId,
        };
        this._crmService.octafxCrmRequest = octafxCrm;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'extramarkscrm') {
        let FirstName = '';
        let LastName = '';
        if (data.details) {
          const PersonalDetailsName = data.details.userName;
          if (PersonalDetailsName) {
            let names = PersonalDetailsName.split(' ');
            if (names.length === 0) {
              names = PersonalDetailsName.split('.');
            }
            if (names.length === 0) {
              names = PersonalDetailsName.split('_');
            }

            if (names.length > 1) {
              FirstName = names[0];
              LastName = names[1];
            } else if (names.length === 1) {
              FirstName = names[0];
            }
          }
        }
        let extraMarkRequest: ExtraMarksRequest;
        extraMarkRequest = {
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          ChannelType: data.details.channelType,
          ConversationLog: data.details.conversationLog,
          CreatedBy: data.details.createdBy,
          EmailAddress: data.details.emailAddress
            ? data.details.emailAddress
            : '',
          FollowerCount: data.details.followerCount,
          FollowingCount: data.details.followingCount,
          FullName: data.details.authorDetails
            ? data.details.authorDetails.name
            : '',
          IsUserFeedback: data.details.isUserFeedback,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          LocobuzzTicketID: data.details.locobuzzTicketID,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          MobileNumber: data.details.mobileNumber,
          Remarks: data.details.remarks,
          SrID: data.details.srID,
          SubChannel: data.details.subChannel,
          TagID: data.details.tagID,
          UserName: data.details.userName,
          UserProfileurl: data.details.userProfileurl,
          $type:
            'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities',
          Source: data.details.source,
          FirstName: FirstName,
          LastName: LastName,
          LosLeadID: data.details.losLeadID,
          UCIC: this.postObj.author.socialId,
          AuthorDetails: data.details.authorDetails,
          PostUrl: '',
          CreatedDate: data.details.createdDate,
          LatestTagId: data.details.latestTagId,
          LatestTagIdEpochTime: data.details.latestTagIdEpochTime,
          Category: data.details.categoryId,
          CategoryId: data.details.categoryId,
          CaseType: data.details.caseType,
          Priority: data.details.priority,
          CaseTypeID: data.details.caseTypeID,
          Sentiment: data.details.sentiment,
          Rating: data.details.rating,
          RequestType: data.details.requestType ? data.details.requestType : '',
        };
        this._crmService.extramarksRequest = extraMarkRequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'dreamsolcrm') {
        let FirstName = '';
        let LastName = '';
        const PersonalDetailsName = data.details.userName;
        if (PersonalDetailsName) {
          let names = PersonalDetailsName.split(' ');
          if (names.length === 0) {
            names = PersonalDetailsName.split('.');
          }
          if (names.length === 0) {
            names = PersonalDetailsName.split('_');
          }

          if (names.length > 1) {
            FirstName = names[0];
            LastName = names[1];
          } else if (names.length === 1) {
            FirstName = names[0];
          }
        }
        let dreamsolRequest: DreamsolRequest;
        dreamsolRequest = {
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          ChannelType: data.details.channelType,
          ConversationLog: data.details.conversationLog,
          CreatedBy: data.details.createdBy,
          EmailAddress: data.details.emailAddress,
          FollowerCount: data.details.followerCount,
          FollowingCount: data.details.followingCount,
          FullName: data.details.fullName,
          IsUserFeedback: data.details.isUserFeedback,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          LocobuzzTicketID: data.details.locobuzzTicketID,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          MobileNumber: data.details.mobileNumber,
          Remarks: data.details.remarks,
          SrID: data.details.srID,
          SubChannel: data.details.subChannel,
          TagID: data.details.tagID,
          UserName: data.details.userName,
          UserProfileurl: data.details.userProfileurl,
          $type:
            'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities',
          RequestType: data.details.requestType,
          uhid: data.details.uhid,
          first_name: data.details.first_name?.length > 1 ? data.details.first_name : FirstName,
          last_name: data.details.last_name?.length > 1 ? data.details.last_name : LastName,
          mobile_number: (data.details.mobile_number == 0 ? '' : data.details.mobile_number),
          email_id: data.details.email_id,
          unit_name: data.details.unit_name,
          comments: data.details.comments,
          gmb_text: data.details.gmb_text,
          type: data.details.type,
          submitted_on: data.details.submitted_on,
          gmb_rating: data.details.gmb_rating,
          source: data.details.source,
          source_name: data.details?.source_name ? data.details?.source_name : data.details?.channel,
          unit_name_displayname: data.details?.unit_name_displayname,
          type_name: data.details?.type_name,
        };
        this._crmService.dreamsolRequest = dreamsolRequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'tatacapitalcrm') {
        let FirstName = '';
        let LastName = '';
        const PersonalDetailsName = data.details.userName;
        if (PersonalDetailsName) {
          let names = PersonalDetailsName.split(' ');
          if (names.length === 0) {
            names = PersonalDetailsName.split('.');
          }
          if (names.length === 0) {
            names = PersonalDetailsName.split('_');
          }

          if (names.length > 1) {
            FirstName = names[0];
            LastName = names[1];
          } else if (names.length === 1) {
            FirstName = names[0];
          }
        }
        let tataCapitalRequest: TataCapitalRequest;
        tataCapitalRequest = {
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postObj.channelGroup],
          ChannelType: data.details.channelType,
          ConversationLog: data.details.description ? data.details.description : data.details.conversationLog,
          CreatedBy: data.details.createdBy,
          EmailAddress: data.details.emailAddress,
          FollowerCount: data.details.followerCount,
          FollowingCount: data.details.followingCount,
          FullName: data.details.fullName ? data.details.fullName : FirstName + ' ' + LastName,
          IsUserFeedback: data.details.isUserFeedback,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          LocobuzzTicketID: data.details.locobuzzTicketID,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          MobileNumber: data.details.mobileNumber,
          Remarks: data.details.remarks,
          SrID: data.details.srID,
          SubChannel: data.details.subChannel,
          TagID: data.details.tagID,
          UserName: data.details.userName,
          UserProfileurl: data.details.userProfileurl,
          $type:
            'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities',
          RequestType: data.details.requestType,
          LoanAccountType: data.details.loanAccountType,
          Attachments: data.details.attachments,
          Attachment: data.details.attachment,
          ProductName: data.details.productName,
          PostType: data.details.postType,
          Sentiments: data.details.sentiments,
          ComplaintCategory: data.details.complaintCategory,
          ORMTray: data.details.ormTray,
          SubmittedOn: data.details.submittedOn
        };
        this._crmService.tataCapitalRequest = tataCapitalRequest;
      }

      else if (postCRMdata.crmClassName.toLowerCase() === 'duraflexcrm') { let FirstName = ''; let LastName = ''; const PersonalDetailsName = data?.details?.userName; if (PersonalDetailsName) { let names = PersonalDetailsName.split(' '); if (names.length === 0) { names = PersonalDetailsName.split('.'); } if (names.length === 0) { names = PersonalDetailsName.split('_'); } if (names.length > 1) { FirstName = names[0]; LastName = names[1]; } else if (names.length === 1) { FirstName = names[0]; } } let duraflexRequest: DuraflexRequest; duraflexRequest = { Channel: data?.details?.channel ? data.details?.channel : ChannelGroup[this.postObj.channelGroup], ChannelType: data?.details?.channelType, ConversationLog: data?.details?.conversationLog, CreatedBy: data?.details?.createdBy, EmailAddress: data?.details?.emailAddress, FollowerCount: data?.details?.followerCount, FollowingCount: data?.details?.followingCount, FullName: data?.details?.fullName, IsUserFeedback: data?.details?.isUserFeedback, LocobuzChannelGroup: data?.details?.locobuzChannelGroup, LocobuzzTicketID: data?.details?.locobuzzTicketID ? data?.details?.locobuzzTicketID : this.postObj.ticketInfo.ticketID, LoggedInUserEmailAddress: data?.details?.loggedInUserEmailAddress, MobileNumber: data?.details?.mobileNumber, Remarks: data?.details?.remarks, SrID: data?.details?.srID, SubChannel: data?.details?.subChannel, TagID: data?.details?.tagID, UserName: data?.details?.userName, UserProfileurl: data?.details?.userProfileurl, $type: 'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities', RequestType: data?.details?.requestType, }; this._crmService.duraflexRequest = duraflexRequest; }
      this.ticketService.updateCrmCreateButtonSignal.set(true);
      /* this.ticketService.updateCrmCreateButton.next(true); */
    });
  }
  postUserInfoToggle(): void {
    this.userInfoToggle = !this.userInfoToggle;
    localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(this.userInfoToggle));
    if (
      this.userInfoToggle &&
      this.postObj.channelGroup == ChannelGroup.Email
    ) {
      this._NgZone.runOutsideAngular(() => {
        this.noteChangeTimeOut = setTimeout(() => {
          /* this.ticketService.emailProfileDetailsObs.next(this.baseLogObject[0]); */
          this.ticketService.emailProfileDetailsObsSignal.set(this.baseLogObject[0]);
        }, 300);
      });
    }
    this.ticketService.attachmentWidthCalculationDetailViewObs.next(this.userInfoToggle)
  }
  getUserPhoneNumber(number) {
    if (number && this.postObj) {
      this.postObj.author.locoBuzzCRMDetails.phoneNumber = number;
    }
  }
  openUserProfile(tabIndex?: number): void {
    const sideModalConfig = this._modalService.getSideModalConfig('saved-tabs');
    this._dialog.open(PostUserinfoComponent, {
      ...sideModalConfig,
      width: '360px',
      data: { tabIndex, emailFlag: true },
      autoFocus: false,
    });
  }

  openNotes(baseMention: BaseMention, index: number, loadMore = false): void {
    const obj = {
      brandInfo: {
        BrandName: baseMention.brandInfo.brandName,
        BrandID: baseMention.brandInfo.brandID,
      },
      TagID: baseMention.tagID,
      EndDateEpoch: !loadMore ? moment().endOf('day').utc().unix() : baseMention.mentionTimeEpoch
    }

    this.GetNotesbyTagIDApi = this.ticketService.GetNotesbyTagID(obj).subscribe((res) => {
      if (res && res.length > 0) {
        const logObject = []
        res.forEach(mention => {
          let communicationLog: any = this.mapAsComminucationLog(mention);
          communicationLog.isCommunicationLog = true;
          communicationLog = this.mergeEntryBasedOnBatchID(
            mention,
            communicationLog
          );
          const logcondition = this.checkLogCondition(communicationLog);
          if (logcondition > 0) {
            if (this.baseLogObject.some((obj) => obj.iD === communicationLog.iD) || logObject.some((obj) => obj.logText == communicationLog.logText && obj.mentionTime == communicationLog.mentionTime)) {
            } else {
              logObject.push(communicationLog);
            }
          }
        });
        if (logObject.length > 0) {
          baseMention.clickHereFlag = false;
          if (res && res.length == 50 && baseMention.logCount > 50) {
            logObject[logObject.length - 1].loadMore = true
            logObject[logObject.length - 1].logCount = baseMention.logCount
          }
          this.baseLogObject.splice(index + 1, 0, ...logObject);
        }
        this._cdr.detectChanges();
      }
    })
  }

  loadMore(index: number): void {
    this.openNotes(this.baseLogObject[index], index, true);
  }
      Data1ForFormData:any;
    Data2ForFormData:any;
    leadFormFilledFlag:Boolean=false
    caseFormFilledFlag:Boolean=false
  
     CaseLeadFormOpenView(formType){
      if(formType =='Case' && this.Data2ForFormData){
        this.Data2ForFormData.data.datafieldsGroups = this.Data2ForFormData.data.datafieldsGroups ? this.Data2ForFormData.data?.datafieldsGroups.filter(r=>r.id!=0) : []
        if (this.Data2ForFormData?.data?.datafieldsGroups) {
          this.Data2ForFormData?.data?.datafieldsGroups.unshift({
              "name": "",
              "id": 0,
              "color": "",
              "fieldsCount": 0,
              "mandatoryFields": "",
            })
            this.Data2ForFormData.data.datafieldsGroups = this.Data2ForFormData?.data?.datafieldsGroups?.map(obj => ({ ...obj, fields: this.Data1ForFormData?.data?.caseFields?.filter((r) => r.groupId == obj.id).sort((a, b) => a.priority - b.priority).filter((r) => r.field != "TagId" && r.field != "ConversationLog") }))
            this.quickLookupFormFieldsEdit(this.filterBrandInfo,this.postObj,formType,this.Data2ForFormData.data.datafieldsGroups)
          }
         } else if(formType =='Lead' && this.Data2ForFormData){
              this.Data2ForFormData.data.leadDatafieldsGroups = this.Data2ForFormData.data.leadDatafieldsGroups ? this.Data2ForFormData.data?.leadDatafieldsGroups.filter(r=>r.id!=0) : []
          if (this.Data2ForFormData?.data?.leadDatafieldsGroups) {
          this.Data2ForFormData?.data?.leadDatafieldsGroups.unshift({
              "name": "",
              "id": 0,
              "color": "",
              "fieldsCount": 0,
              "mandatoryFields": "",
            })
            this.Data2ForFormData.data.leadDatafieldsGroups = this.Data2ForFormData?.data?.leadDatafieldsGroups?.map(obj => ({ ...obj, fields: this.Data1ForFormData?.data?.leadFields?.filter((r) => r.groupId == obj.id).sort((a, b) => a.priority - b.priority).filter((r) => r.field != "TagId" && r.field != "ConversationLog") }))
         
          }
            this.quickLookupFormFieldsEdit( this.filterBrandInfo,this.postObj,formType,this.Data2ForFormData.data.leadDatafieldsGroups)
          }
        }
  createSalesForceCrm(type: number): void {
    this.salesForceLoader = true;
    const obj = {
      BrandInfo: {
        BrandID: this.postObj?.brandInfo.brandID,
        BrandName: this.postObj?.brandInfo?.brandName
      },
      AuthorSocialID: this.postObj?.author?.socialId,
      TicketID: this.postObj?.ticketID,
      TitleDescription: this.ticketHistoryData?.description ? this.ticketHistoryData?.description : this.ticketHistoryData?.title,
      Channel: ChannelGroup[this.postObj?.channelGroup],
      TicketStatus: TicketStatus[this.postObj?.ticketInfo?.status],
      AuthorName: this.postObj?.author?.name,
      AuthorEmail: this.postObj?.author?.locoBuzzCRMDetails?.emailID,
      AuthorMobile: this.postObj?.author?.locoBuzzCRMDetails?.phoneNumber
    }

    this.CreateSalesForceCrmApi = this._crmService.CreateSalesForceCrm(obj, type).subscribe((res) => {
      this.salesForceLoader = false;
      if (res.success) {
        if (!this.postObj.ticketInfo.srid && res.data) {
          /* this.ticketService.updateCRMDetails.next({
            TagID: this.postObj.tagID,
            SrID: res.data,
            guid: this._navigationService.currentSelectedTab.guid,
            postType: PostsType.TicketHistory
          }); */
          this.ticketService.updateCRMDetailsSignal.set({
            TagID: this.postObj.tagID,
            SrID: res.data,
            guid: this._navigationService.currentSelectedTab.guid,
            postType: PostsType.TicketHistory
          });
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: res.message ? res.message : this.translate.instant('Unable-to-generate-SR-request'),
          },
        });
      }
    }, err => {
      this.salesForceLoader = false;
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something went wrong'),
        },
      });
    })
  }

  openAnimalWildfare(): void {
    const obj = {
      TicketID: this.postObj?.ticketID,
      AgentID: this.currentUser?.data?.user?.userId,
      IsCRMCreated: this.postObj?.ticketInfo?.srid ? false : true
    }

    this.generateAnimalWildFareCrmTokenApi =this.ticketService.generateAnimalWildFareCrmToken(obj).subscribe((res) => {
      if (res.success) {
        if (res.data)
        {
          window.open(res.data);
        }
        // const dialogRef = this._dialog.open(AnimalWildfarePopupComponent, {
        //   data: { baseMention: this.postObj, url: res.data },
        //   width: '1200px',
        //   height: '620px'
        // });

        // dialogRef.afterClosed().subscribe(result => {
        //   if (result) {
        //     this.postObj.ticketInfo.srid = result;
        //     this._postDetailService.postObj.ticketInfo.srid = result;
        //   }
        // });
      }
    })
  }

  outputIndexRes(data): void {
    if (data != null) {
      this.activeTab = data
    }
  }
  openChatBox() {
    this.ticketService.openChatObs.next(this.postObj);
  }
  changeChatBotView() {
    if (this._postDetailService.postObj?.ticketInfo?.assignedTo == this.currentUser?.data?.user?.userId && this._postDetailService?.postObj?.ticketInfo?.status != TicketStatus.Close) {
      const indices = this._chatBotService.getIndex(this._postDetailService.postObj?.channelGroup, this._postDetailService.postObj?.author?.socialId, this._postDetailService.postObj?.brandInfo?.brandID, this._postDetailService.postObj.ticketID);
      if (indices.channelIndex >= 0 && indices.authorIndex >= 0 && indices.ticketIndex >= 0) {
        this.showChatbot = true;
      }
      else {
        this.showChatbot = false;
      }
    } else {
      this.showChatbot = false;
    }
    this._cdr.detectChanges()
  }
  lookupshow: Boolean = false
  snapdealCrmLookUpPopUp(brandObj) {
    this.lookupshow = true
    // this._dialog.open(LoopupcrmComponent, {
    //   width: '85vw',
    //   panelClass: 'crm-wrapper',
    //   data:brandObj
    // });
  }

  private getAuthorDetails(brandObj, ticketData, srIDLeadID): void {
    this.crmGetAuthorTicketDetails = true
    const filterObj = this._filterService.getGenericRequestFilter(ticketData);
    const obj = {
      brandID: filterObj?.brandInfo?.brandID,
      ticketId: filterObj?.ticketId
    }
    let sources = srIDLeadID ? [
      this._userDetailService.GetAuthorDetails(filterObj),
      this._userDetailService.GetAuthorTicketDetails(obj),
      this._dynamicServices.GetFieldJson(brandObj?.brandID),
      this._dynamicServices.GetpushedData(ticketData?.ticketID)
    ] : [
      this._userDetailService.GetAuthorDetails(filterObj),
      this._userDetailService.GetAuthorTicketDetails(obj),  
      this._dynamicServices.GetFieldJson(brandObj?.brandID)
    ];
    forkJoin(sources).subscribe(
      (res) => {
        this.formDataForQuickworkCrm = res;
        this.Data2ForFormData = res[2]
        // if (res[2]?.data?.dataFields?.length>0 && res[2]?.data?.leadDataFields?.length>0 ){
        if (brandObj?.isCreateCase && brandObj?.isCreateLead) {
          this.clickHoverMenuTriggerFlag = true
          setTimeout(() => {
          this.clickHoverMenuTrigger?.openMenu();
          },100)
        } else {
          if (!brandObj?.isCreateCase && brandObj?.isCreateLead && !res[3]?.data?.leadFields && !res[3]?.data?.caseFields) {
            // setTimeout(() => {
            // }, 500);
            this.CaseLeadFormOpen('Lead')
          } else if (brandObj?.isCreateCase && !brandObj?.isCreateLead && !res[3]?.data?.leadFields && !res[3]?.data?.caseFields) {
            // setTimeout(() => {
            // }, 500);
            this.CaseLeadFormOpen('Case')
          }
          this.clickHoverMenuTriggerFlag = false
          this.clickHoverMenuTrigger?.closeMenu();
        }
        if (res[3]) {
          // this.Data2ForFormData = data2
          this.Data1ForFormData = res[3]
          if (res[3]?.data?.leadFields && res[3]?.data?.caseFields && brandObj?.isCreateCase && brandObj?.isCreateLead) {
            this.clickHoverMenuTriggerFlag = true
            this.leadFormFilledFlag = true
            this.caseFormFilledFlag = true
            this.clickHoverMenuTrigger?.openMenu();
          } else {
            if (res[3]?.data?.leadFields && !res[3]?.data?.caseFields && !brandObj?.isCreateCase && brandObj?.isCreateLead && ticketData?.ticketInfo?.leadID != null) {
              this.leadFormFilledFlag = true
              this.CaseLeadFormOpenView('Lead')
            }
            else if (!res[3]?.data?.leadFields && res[3]?.data?.caseFields && brandObj?.isCreateCase && !brandObj?.isCreateLead && ticketData?.ticketInfo?.srid != null) {
              this.clickHoverMenuTriggerFlag = true
              this.CaseLeadFormOpenView('Case')
            }
            else if (!res[3]?.data?.leadFields && res[3]?.data?.caseFields && brandObj?.isCreateCase && brandObj?.isCreateLead && ticketData?.ticketInfo?.leadID == null) {
              this.caseFormFilledFlag = true
              this.clickHoverMenuTriggerFlag = true
              this.clickHoverMenuTrigger?.openMenu();
            }
            else if (res[3]?.data?.leadFields && !res[3]?.data?.caseFields && brandObj?.isCreateCase && brandObj?.isCreateLead && ticketData?.ticketInfo?.srid == null) {
              this.leadFormFilledFlag = true
              this.clickHoverMenuTriggerFlag = true
              this.clickHoverMenuTrigger?.openMenu();
            }
          }
          this._cdr.detectChanges()
        }
        this.crmGetAuthorTicketDetails = false;
        this._cdr.detectChanges()
        // return;

      })
  }
  CaseLeadFormOpen(formType) {
    let formDataLookupDataFields = {
      success: true,
      data: {
        dataFields: formType == 'Case' ? this.formDataForQuickworkCrm[2]?.data?.dataFields : this.formDataForQuickworkCrm[2]?.data?.leadDataFields,
        datafieldsGroups: formType == 'Case' ? this.formDataForQuickworkCrm[2]?.data?.datafieldsGroups : this.formDataForQuickworkCrm[2]?.data?.leadDatafieldsGroups,
        lookupFields: formType == 'Case' ? this.formDataForQuickworkCrm[2]?.data?.lookupFields : this.formDataForQuickworkCrm[2]?.data?.leadLookupFields,
        lookupfieldsGroups: formType == 'Case' ? this.formDataForQuickworkCrm[2]?.data?.lookupfieldsGroups : this.formDataForQuickworkCrm[2]?.data?.leadLookupfieldsGroups
      }
    };
    // this.formDataForQuickworkCrm = res;
    if (this.formDataForQuickworkCrm) {
      let AuthorDetails = this.formDataForQuickworkCrm[0]
      let CrmticketDetails = this.formDataForQuickworkCrm[1]
      this.quickLookupFormFields(this.filterBrandInfo, AuthorDetails, CrmticketDetails, formDataLookupDataFields, formType)
    } else {
      this.quickLookupFormFields(this.filterBrandInfo, null, null, formDataLookupDataFields, formType)
    }
  }
  quickLookupFormFields(brandObj, AuthorDetails, CrmticketDetails, formDataLookupDataFields, formType) {
   this.clickHoverMenuTriggerFlag = false
    this.clickHoverMenuTrigger?.closeMenu();
    this._dialog.open(LookupcrmquickworkComponent, {
      autoFocus: true,
      width: '82vw',
      disableClose:true,
      data: { brandObj: brandObj, ticketInfo: this.postObj, AuthorDetails: AuthorDetails, CrmticketDetails: CrmticketDetails, CurrentUser: this.currentUser, PageType: this.currentPageType, FormData: formDataLookupDataFields, FormType: formType },
    });
    localStorage.removeItem('AuthorDetails');
    localStorage.removeItem('CrmticketDetails');
  }
  quickLookupFormFieldsEdit(brandObj,ticketData,formType,formData) {
   this.clickHoverMenuTriggerFlag = false
    this.clickHoverMenuTrigger?.closeMenu();
    this._dialog.open(QuickworkManualComponent, {
      autoFocus: true,
      width: '82vw',
      disableClose:true,
      data: { brandObj: brandObj, ticketInfo: this.postObj, formType:formType,formData:formData },
    });
  }

  closeMenu(){
    this.trigger.closeMenu()
  }
  closeEditMenu(){
    this.trigger3.closeMenu();
  }
  /* ticket summary changes */

  expandTicketSummary(event?): void {
    this.ticketSummary = !this.ticketSummary;
    if (this.ticketSummary){
      this.isSummaryCallFirstTime = true
      this.ticketSummary = false;
      this.selectedSummaryTab = 0;
      this.selectedSummaryType = 8
      this.getAITicketSummaryData(this.postObj.ticketID, 8)
    }
  }

  changeTicketSummaryType(event) {
    this.selectedSummaryType = event.tab.textLabel
    // this.TicketSummaryDetails['summaryText'] = null;
    // this.getAITicketSummaryData(this.postObj.ticketID, event.tab.textLabel)
  }

  getSuggestedRresponse() {
    const aiobj = {
      user_id: this.currentUser?.data?.user?.userId,
      brand_id: Number(this.postObj?.brandInfo?.brandID,),
    }
    this.getSuggestedRresponseApi =this._aiFeatureService.getSuggestedRresponse(aiobj).subscribe((res) => {
      if (res?.success && res?.data?.length > 0) {
        const aiSuggestedRresponse = res.data[0];
        if (aiSuggestedRresponse?.IsTicketSummarizationEnabled && aiSuggestedRresponse?.IsAISuggestedFeatureEnabled) {
          this.isTicketSummarizationEnable = true;
        } else {
          this.isTicketSummarizationEnable = false;
        }
      }
    })
  }

  getAITicketSummaryData(ticketId: number, ticket_summary_enum: number) {
    if (this.isSummaryCallFirstTime) { this.isSummaryCallFirstTime = false; this.isSummaryAPICalling = true };
    let reqObj = {
      AITicketSummaryData: {
        brand_name: this.postObj?.brandInfo?.brandName,
        brand_id: this.postObj?.brandInfo?.brandID,
        author_id: this.postObj?.author?.socialId,
        author_name: this.postObj?.author?.name,
        channel_group_id: this.postObj?.channelGroup,
        ticket_id: ticketId,
        channel_type: this.postObj?.channelType,
        user_id: this.currentUser?.data?.user?.userId,
        tag_id: this.postObj?.tagID,
        // ticket_summary_enum: ticket_summary_enum
      },
      LastActivityID: null,
    }

    for (let i = this.ticketSummaryUserHistory.length - 1; i >= 0; i--) {
      const userHistory = this.ticketSummaryUserHistory[i];
      if ('note' in userHistory && userHistory.note && userHistory.status == 45) {
        reqObj['LastActivityID'] = userHistory.id;
        break
      }
      else if ('concreteClassName' in userHistory && userHistory?.concreteClassName) {
        reqObj['LastActivityID'] = userHistory.id;
        break
      }
    }

    this.GetAITicketSummaryDataApi =this._aiFeatureService.GetAITicketSummaryData(reqObj).subscribe(
      (res) => {
        if (res.success) {
          res.data['ticketID'] = this.postObj.ticketID;
          /* hours calculate */
          res.data['diffHours'] = this.calculateCustomTicketTime(res.data.createdDate);
          /* hours calculate */

          if (res.success && res.message.includes('Creadit limit exceeded')) {
            this.TicketSummaryDetails = res.data
            this.TicketSummaryDetails['message'] = res.message;
            this.isCreditExpire = true;
            this.isSummaryAPICalling = false;
            this._cdr.detectChanges();
          }
          else {
          
            this.TicketSummaryDetails = res.data;
            if (res?.data?.emotionalJourney && res?.data?.emotionalJourney.includes('->')){
              const journey = res?.data?.emotionalJourney.split('->');
              this.TicketSummaryDetails['startJourney'] = journey && journey.length ? journey[0].trim() : res?.data?.emotionalJourney.trim();
              const emotion = this.listOfEmotionJourney.find(res => res.name.toLowerCase() == this.TicketSummaryDetails['startJourney'].toLowerCase() || res.name.toLowerCase() == 'neutral');
              if (emotion) {
                this.TicketSummaryDetails['startJourneyIcon'] = emotion.icon;
                this.TicketSummaryDetails['startJourneyColor'] = emotion.color;
              }
              this.TicketSummaryDetails['middleJourney'] = journey && journey.length == 2 ? journey[1].trim() : null;
              if (this.TicketSummaryDetails['middleJourney']) {
                const emotion1 = this.listOfEmotionJourney.find(res => res.name.toLowerCase() == this.TicketSummaryDetails['middleJourney'].toLowerCase() || res.name.toLowerCase() == 'neutral');
                if (emotion1) {
                  this.TicketSummaryDetails['middleJourneyIcon'] = emotion1.icon;
                  this.TicketSummaryDetails['middleJourneyColor'] = emotion1.color;
                }
              }
              this.TicketSummaryDetails['endJourney'] = journey && journey.length == 3 ? journey[2].trim() : null;
              if (this.TicketSummaryDetails['endJourney']){
                const emotion2 = this.listOfEmotionJourney.find(res => res.name.toLowerCase() == this.TicketSummaryDetails['endJourney'].toLowerCase() || res.name.toLowerCase() == 'neutral');
                if (emotion2) {
                  this.TicketSummaryDetails['endJourneyIcon'] = emotion2.icon;
                  this.TicketSummaryDetails['endJourneyColor'] = emotion2.color;
                }
              }
            } else {
              this.TicketSummaryDetails['startJourney'] = res?.data?.emotionalJourney.trim();
              const emotion3 = this.listOfEmotionJourney.find(res => res.name.toLowerCase() == this.TicketSummaryDetails['startJourney'].toLowerCase() || res.name.toLowerCase() == 'neutral');
              if (emotion3) {
                this.TicketSummaryDetails['startJourneyIcon'] = emotion3.icon;
                this.TicketSummaryDetails['startJourneyColor'] = emotion3.color;
              }
            }
            this.TicketSummaryDetails['summaryText'] = res.data.quick_Summary;
            this.TicketSummaryDetails['brandImage'] = this.getBrandLogo(this.postObj?.brandInfo?.brandID)
            if (this.isSummaryAPICalling) this.ticketSummary = !this.ticketSummary;
            this.isSummaryAPICalling = false;
            // this.isSummaryReadMore = true;
            this.TicketSummaryDetails['detailedSummary'] = res.data.detailed_Summary;
            this.isSummaryReadMore = false;
            const data = [];
            let timelineSummary = res?.data?.timeline_Summary;
            if (res?.data?.timeline_Summary && typeof res?.data?.timeline_Summary === 'string') {
              timelineSummary = JSON.parse(res?.data?.timeline_Summary);
            }
            for (const key in timelineSummary || []) {
              if (Object.prototype.hasOwnProperty.call(timelineSummary, key)) {
                let className = 'colored__blue';
                if (key.toString().toLowerCase().includes('escalation')) className = 'colored__yellow--dark'
                if (key.toString().toLowerCase().includes('note')) className = 'colored__blue--dark'
                data.push({
                  key: key,
                  value: timelineSummary[key],
                  className: className
                })
              }
            }
            this.TicketSummaryDetails['timelineSummary'] = data;
            this.TicketSummaryDetails['issueSummary'] = res.data.issue_Summary;
            this.TicketSummaryDetails['customerExpectation'] = res.data.customer_Expectation;
            this._cdr.detectChanges();
            // if (this.selectedSummaryType == this.TicketSummaryType.quick_summary) {
            //   this.TicketSummaryDetails = res.data;
            //   this.TicketSummaryDetails['summaryText'] = res.data.quick_Summary;
            //   this.TicketSummaryDetails['brandImage'] = this.getBrandLogo(this.postObj?.brandInfo?.brandID)
            //   if (this.isSummaryAPICalling) this.ticketSummary = !this.ticketSummary;
            //   this.isSummaryAPICalling = false;
            //   this.isSummaryReadMore = true; 
            //   this._cdr.detectChanges();
            // }
            // else if (this.selectedSummaryType == this.TicketSummaryType.detailed_summary) {
            //   this.TicketSummaryDetails['detailedSummary'] = res.data.detailed_Summary;
            //   this.isSummaryReadMore = false;
            //   this._cdr.detectChanges();
            // }
            // else if (this.selectedSummaryType == this.TicketSummaryType.timeline_summary) {
            //   const data = [];
            //   let timelineSummary = res?.data?.timeline_Summary;
            //   if (res?.data?.timeline_Summary && typeof res?.data?.timeline_Summary === 'string') {
            //     timelineSummary = JSON.parse(res?.data?.timeline_Summary);
            //   }
            //   for (const key in timelineSummary || []) {
            //     if (Object.prototype.hasOwnProperty.call(timelineSummary, key)) {
            //       let className = 'colored__blue';
            //       if (key.toString().toLowerCase().includes('escalation')) className = 'colored__yellow--dark'
            //       if (key.toString().toLowerCase().includes('note')) className = 'colored__blue--dark'
            //       data.push({
            //         key: key,
            //         value: timelineSummary[key],
            //         className: className
            //       })
            //     }
            //   }
            //   this.TicketSummaryDetails['timelineSummary'] = data;
            //   this._cdr.detectChanges();
            // }
            // else if (this.selectedSummaryType == this.TicketSummaryType.issue_summary) {
            //   this.TicketSummaryDetails['issueSummary'] = res.data.issue_Summary;
            //   this._cdr.detectChanges();
            // }
            // else if (this.selectedSummaryType == this.TicketSummaryType.customer_expectation) {
            //   this.TicketSummaryDetails['customerExpectation'] = res.data.customer_Expectation;
            //   this._cdr.detectChanges();
            // }
            this.isCreditExpire = false;
            this._cdr.detectChanges();
          }
        }
      },
      (err) => { console.log(err); })
  }

  getBrandLogo(brandID): string {
    const brandimage = this._filterService.fetchedBrandData.find(
      (obj) => Number(obj.brandID) === Number(brandID)
    );
    if (brandimage && brandimage.rImageURL) {
      return brandimage.rImageURL;
    } else {
      return 'assets/social-mention/post/default_brand.svg';
    }
  }

  calculateCustomTicketTime(date: any) {

    const end = moment();
    const start = moment.utc(date).local().format();

    const duration = moment.duration(moment(end).diff(moment(start)));

    const years = Math.floor(duration.asYears());
    const months = Math.round(duration.asMonths());
    const days = Math.round(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const seconds = duration.seconds();

    return years ? `${years} ${this.translate.instant(`Year${years > 1 ? 's' : ''}`)}` : months ? `${months} ${this.translate.instant(`Month${months > 1 ? 's' : ''}`)}` : days ? `${days} ${this.translate.instant(`Day${days > 1 ? 's' : ''}`)}` : hours ? `${hours} ${this.translate.instant(`Hour${hours > 1 ? 's' : ''}`)}` : minutes ? `${minutes} ${this.translate.instant(`Minute${minutes > 1 ? 's' : ''}`)}` : `${seconds} ${this.translate.instant(`Second${seconds > 1 ? 's' : ''}`)}`;
  }
  /* ticket summary changes */

  toggleView() {
    this.viewModeFlag = !this.viewModeFlag;
    // this.showChatbot = !this.showChatbot;
  }

  crmCloseEventRes(event):void{
    if(event)
      {
      this.viewModeFlag = !this.viewModeFlag;
      }
    }
  noteTextChange(nodeElement: any, holder: any) {
    if (this[holder] && this[holder]?.length > 2500) {
      this[holder] = this[holder].substring(0, 2500)
      if (nodeElement) nodeElement.value = this[holder].substring(0, 2500)
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('character-limit-note'),
        },
      });
      this._cdr.detectChanges();
      return false;
    }
  }

  openTicketDisposiion() {
    const despositionObj = {
      baseMention: this.postObj,
      dispositionList: [],
      ticketIntelligenceView: true,
      openFromPostDetail: true
    }
    const dialogRef = this._dialog.open(TicketDispositionComponent, {
      width: '50vw',
      data: despositionObj,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
      }
    });
  }

  private getAuthorDetailsBasedOnDB(): void {
    this._filterService.autherDetail.set({loader:true,data:null});
    const filterObj = this._filterService.getGenericRequestFilter(this.postObj);
    this.GetAuthorDetailsApi = this._userDetailService.GetAuthorDetails(filterObj).subscribe(
      (data) => {
        this._filterService.autherDetail.set({ loader: false, data: data });
        if (data && data.connectedUsers) {
          this.getConnectedAuthors(data.connectedUsers);
        }
      },error => {
        this._filterService.autherDetail.set({ loader: false, data: null });
      });
  }

  calculateHeight(){
    const height: number = this?.forHeightGet?.nativeElement?.offsetHeight;
    if(this.ticketSummary){
      return `calc(100vh - ${height || 406}px)`
    }
    else{
      return `calc(100vh - ${height || 106}px)`
    }
    /* [style.height] = "!ticketSummary ? 'calc(100vh - ' + 100 + 51 + 'px)' : ''" */
  }
  
  openPushToTicketCRM(): void {
    this._postDetailService.postObj = this.postObj;
    if (this.postObj?.ticketInfo?.srid) {
      // this.lookupshow = true;
      this.getSRDetailsApi =this.ticketService.getSRDetails(this.postObj?.ticketInfo?.ticketID).subscribe((res) => {
        this.lookupshow = false
        if (res.success) {
          this._dialog.open(PushTicketToCrmComponent, {
            autoFocus: true,
            width: '82vw',
            disableClose: true,
            data: { pageType: 3, fieldData: res.data, editFlag: true }
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Unable-to-fetch-field-details'),
            },
          });
        }
      })
    } else {
      // this.lookupshow = true;
      const obj = {
        "BrandID": this?.postObj?.brandInfo?.brandID,
        "TicketID": this.postObj.ticketInfo.ticketID,
        "TagID": this.postObj.tagID,
      }
      this.getCrmFieldFormApi = this.ticketService.getCrmFieldForm(obj).subscribe((res) => {
        if (res.success) {
          this.lookupshow = false
          this._dialog.open(PushTicketToCrmComponent, {
            autoFocus: true,
            width: '82vw',
            disableClose: true,
            data: { pageType: 3, fieldData: res.data, editFlag: false }
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Unable-to-fetch-field-details'),
            },
          });
        }
      })

    }
  }

  getNote(noteObj){
    if (noteObj){
      this.editednote = noteObj?.note ;
      this.selectedNoteMedia = noteObj?.mediaList || [];
      this._replyService.selectedNoteMedia.next({ media: noteObj?.mediaList });
      this.mediaSelectedAsync.next(this.selectedNoteMedia);
      this.ticketService.addNoteEmitFromOpenDetail.next(this.selectedNoteMedia);
      this._replyService.selectNoteMediaVal(this.selectedNoteMedia);
      this.mediaGalleryService.selectedNoteMedia = this.selectedNoteMedia;
    }
  }

  editNote(editednote){
    let noteAttachments: NoteMedia[] = [];
    if (this.selectedNoteMedia?.length > 0) {
      this.selectedNoteMedia.forEach((obj) => {
        const media = {
          mediaID: obj.mediaID,
          name: obj.displayFileName,
          mediaType: obj.mediaType,
          mediaUrl: obj.mediaPath,
          thumbUrl: obj.thumbnail
        }
        noteAttachments.push(media);
      })
    }
    const obj = {
      "BrandID": this._postDetailService.postObj?.brandInfo?.brandID,
      "TagID": Number(this._postDetailService.postObj.ticketInfo.tagID),
      "TicketID": this._postDetailService.postObj.ticketInfo.ticketID,
      "NoteContent": editednote,
      "LogID": this.editedNoteData?.iD,
      "AttachmentUgc": noteAttachments && noteAttachments?.length > 0 ? noteAttachments : null,
    };
    if ((editednote && editednote?.trim()?.length > 0) || noteAttachments && noteAttachments?.length > 0) {
      this.editTicketNotesApi =this.ticketService.editTicketNotes(obj).subscribe((data: any) => {
        if (JSON.parse(JSON.stringify(data)).success) {
          // console.log(data);
          this.noteChange("editNote")
          this.noteSpinner = false;
        }
        else {
          this.noteSpinner = false;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message,
            },
          });
        }
        this._cdr.detectChanges();
      });
    }
    else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('please-add-note'),
        },
      });
      // this._cdr.detectChanges();
    }
  }
  recieveData(data){
    this.editedNoteData = data;
  }

  sortHandPostReFreshTime() {
    this._postDetailService.sortHandTicketTimeUpdate.next(true);
  }

  currentPostObjectSignalChange(value){
    if (value > 0) {
      this.showRefreshButton = false;
      this._postDetailService.replyText = '';
      this.postObj =
        this.TicketData.find((obj) => obj.ticketInfo.ticketID === value) ||
        this._postDetailService.postObj;
        if (this.postObj) {
        this.globalTicketID = this.postObj.ticketInfo.ticketID;
        /* this._postDetailService.postDetailWindowStatus.next({
          status: true,
          ticketId: this.postObj?.ticketID,
        }); */
        this._postDetailService.postDetailWindowStatusSignal.set({
          status: true,
          ticketId: this.postObj?.ticketID,
        });
      }

      this.selectedPostID = this.postObj?.ticketInfo?.tagID;
      let index = this.TicketData.findIndex((r) => r.tagID == this.selectedPostID)
      this.selectedPostNextID = this.TicketData[index + 1]?.tagID;
      this.selectedPostPrevID = this.TicketData[index - 1]?.tagID;
      this._postDetailService.postObj = this.postObj;
      this.authorDetails = {};
      this.communicationLogResponse = {};
      this.upliftAndSentimentScore = {};
      this.ticketInfo = {};
      this.baseLogObject = [];
      this.postObj.channelGroup == ChannelGroup.Email ? this.emailBaseMention = [] : ''
      if (this.postObj) {
        this.getCommunicationLogHistory();
        if (!this.sfdcTicketView) {
          this.getTicketLockDetails();
        }

        const keyobj = {
          AuthorSocialID: this.postObj.author.socialId,
          brandID: this.postObj.brandInfo.brandID,
          brandName: this.postObj.brandInfo.brandName,
        };
        this.GetAuthorBasedPendingSuccessFailedCount1Api =this.ticketService
          .GetAuthorBasedPendingSuccessFailedCount(keyobj)
          .subscribe((data) => {
            if (
              this.postObj?.ticketInfoSsre?.ssreStatus ===
              SSRELogStatus.SSREInProcessing ||
              this.postObj?.ticketInfoSsre?.ssreStatus ===
              SSRELogStatus.IntentFoundStillInProgress
            ) {
              this.ssreinprogress = true;
              this.ssresuccess = false;
              this.bulkinprogress = false;
              this.bulkreplysuccess = false;
              this.postFootDisable = true;
              /* this.ticketService.ssreActionPerformed.next(this.postObj); */
              this.ticketService.ssreActionPerformedSignal.set(this.postObj);
              const brandInfo = this._filterService?.fetchedBrandData?.find((x) => x.brandID == this.postObj.brandInfo.brandID);
              if (brandInfo) {
                this.ssreinprogresstitle = `${(brandInfo?.isWorkflowEnabled) ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;
              }
              // this.ssreinprogresstitle =
              //   `${this.postObj?.ticketInfoWorkflow?.workflowId ? 'Workflow ' : 'SSRE '} is woking on it, Please wait...`;;
            } else {
              this.ssreinprogress = false;
              this.ssresuccess = false;
              //this.ticketService.ssreActionEnablePerformed.next(this.postObj);
            }

            const pending = data.data.pending ? data.data.pending : 0;
            const success = data.data.success ? data.data.success : 0;
            const failed = data.data.failed ? data.data.pending : 0;
            if (pending + success + failed > 0 && !this.ssreinprogress) {
              this.bulkinprogress = true;
              this.bulkreplysuccess = false;
              this.postFootDisable = true;
              /* this.ticketService.bulkActionPerformed.next(this.postObj); */
              this.ticketService.bulkActionPerformedSignal.set(this.postObj);
              this.bulkpending = pending;
              this.bulksuccess = success;
              this.bulkfailed = failed;
              if (this.bulkpending > 1) {
                this.bulkinprogresstitle =
                  this.bulkpending + ' Replies being sent';
              } else if (this.bulkpending === 1) {
                this.bulkinprogresstitle =
                  this.bulkpending + ' Reply being sent';
              }
            } else {
              this.bulkinprogress = false;
              this.bulkreplysuccess = false;
              //this.ticketService.bulkActionEnablePerformed.next(this.postObj);
            }
            if (this.ssreinprogress || this.bulkinprogress) {
              this.postFootDisable = true;
              this.disableTicketOverview = true;
            } else {
              this.postFootDisable = false;
              this.disableTicketOverview = false;
            }
            // this.replyDays = false;
            if (
              this.postObj.channelGroup === ChannelGroup.WhatsApp ||
              this.postObj.channelType === ChannelType.FBMessages ||
              this.postObj.channelType === ChannelType.InstagramMessages
            ) {
              this.showReplyMessageExpiry();
              this.sfdcChatModeActive = true;
            }
            this.getTicketDetails(this.postObj.ticketInfo.ticketID);
          });

        this.markIsRead();
        // this.getAuthorDetails();
        // this.getTicketTimeline(null);
        // this.getTicketSummary();
        // this.getSentimentUpliftAndNPSScore();
        this._replyService.replyActionPerformedSignal.set(null);
      }
      this.selectedIndex = this.TicketData.findIndex((obj) => obj.ticketInfo.ticketID === value)
      this.checkEmailGuideValid()
    }
    const postCRMdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) =>
        +brand.brandID === this.postObj?.brandInfo?.brandID
    );
    if (postCRMdata?.crmActive) {
      this.ticketHistoryData = {};
      this.ticketHistoryData = this._footericonService.SetCRMButton(
        postCRMdata,
        this.currentUser,
        this.ticketHistoryData,
        this.postObj,
        PostsType.Tickets
      );
      if (JSON.parse(localStorage.getItem('sfdcTicketView'))) {
        this.ticketHistoryData.crmcreatereqpop = false
      }
    }
    if (this.sfdcTicketView && this.postObj?.ticketInfo.status === TicketStatus.Close) {
      this.disableSwitchMode = true;
    }
    this.getAuthorDetailsBasedOnDB()
    if (this.postObj?.author) {
      this.userProfileName = this.postObj?.author?.name;
      this.userProfileImg = this.postObj?.author?.picUrl && this.postObj?.author?.picUrl.includes('assets/images/agentimages/sample-image.svg') ? 'initials' : this.postObj?.author?.picUrl;
      if (this.postObj?.channelGroup == ChannelGroup.Voice) {
        this.userProfileImg = 'assets/images/agentimages/sample-image.svg'
      }
    }
    this.brandImage = this.getBrandLogo(this.postObj?.brandInfo?.brandID);
    this.ticketTime = this.ticketService.calculateTicketTimes(this.postObj);
  }

  updateCRMDetailsSignalChange(res) {
    if (res) {
      if
        (
        res?.TagID == this.postObj.tagID
      ) {
        if (res?.SrID) {
          // this.postData.ticketInfo.leadID = res?.leadID;
          // this.post.leadID = res?.leadID;
          this.postObj.ticketInfo.srid = res.SrID;
          // this.post.srID = res?.SrID;
          if (this.postObj?.ticketInfo?.leadID) {
            // this.post.leadID = this.postObj?.ticketInfo?.leadID;
            this._cdr.detectChanges();
          }
        }
        if (res?.leadID) {
          this.postObj.ticketInfo.leadID = res?.leadID;
          // this.post.leadID = res?.leadID;
          if (this.postObj?.ticketInfo?.srid) {
            // this.post.srID = this.postObj?.ticketInfo?.srid;
            this._cdr.detectChanges();
          }
        }
        this._cdr.detectChanges();
      }
    }
  }


  destroyApiRelatedData():void{
    if (this.GetAuthorBasedPendingSuccessFailedCountApi) {
      this.GetAuthorBasedPendingSuccessFailedCountApi.unsubscribe();
    }
    if (this.getLastMentionTimeApi) {
      this.getLastMentionTimeApi.unsubscribe();
    }
    if (this.markTicketAsReadApi) {
      this.markTicketAsReadApi.unsubscribe();
    }
    if (this.getTicketLockApi) {
      this.getTicketLockApi.unsubscribe();
    }
    if (this.lockUnlockTicketApi) {
      this.lockUnlockTicketApi.unsubscribe();
    }
    if (this.GetTicketSummaryApi) {
      this.GetTicketSummaryApi.unsubscribe();
    }
    if (this.addTicketNotesVOIPApi) {
      this.addTicketNotesVOIPApi.unsubscribe();
    }
    if (this.addTicketNotes) {
      this.addTicketNotes.unsubscribe();
    }
    if (this.GetTicketSummary2Api) {
      this.GetTicketSummary2Api.unsubscribe();
    }
    if (this.GetTicketsByTicketIdsApi) {
      this.GetTicketsByTicketIdsApi.unsubscribe();
    }
    if (this.getMentionCountApi) {
      this.getMentionCountApi.unsubscribe();
    }
    if (this.GetCrmLeftMenuApi) {
      this.GetCrmLeftMenuApi.unsubscribe();
    }
    if (this.GetBrandCrmRequestDetailsApi) {
      this.GetBrandCrmRequestDetailsApi.unsubscribe();
    }
    if (this.GetNotesbyTagIDApi) {
      this.GetNotesbyTagIDApi.unsubscribe();
    }
    if (this.CreateSalesForceCrmApi) {
      this.CreateSalesForceCrmApi.unsubscribe();
    }
    if (this.generateAnimalWildFareCrmTokenApi) {
      this.generateAnimalWildFareCrmTokenApi.unsubscribe();
    }
    if (this.getSuggestedRresponseApi) {
      this.getSuggestedRresponseApi.unsubscribe();
    }
    if (this.GetAITicketSummaryDataApi) {
      this.GetAITicketSummaryDataApi.unsubscribe();
    }
    if (this.getSRDetailsApi) {
      this.getSRDetailsApi.unsubscribe();
    }
    if (this.getCrmFieldFormApi) {
      this.getCrmFieldFormApi.unsubscribe();
    }
    if (this.editTicketNotesApi) {
      this.editTicketNotesApi.unsubscribe();
    }
    if (this.GetAuthorBasedPendingSuccessFailedCount1Api) {
      this.GetAuthorBasedPendingSuccessFailedCount1Api.unsubscribe();
    }
    if (this.GetAuthorDetailsApi){
      this.GetAuthorDetailsApi.unsubscribe();
    }
  }
  clearAllVariables(): void{
    if(this.trigger){
      this.trigger.closeMenu();
    }
    this.trigger = null;
    if (this.trigger1) {
      this.trigger1.closeMenu();
    }
    this.trigger1 = null;
    if (this.clickHoverMenuTrigger) {
      this.clickHoverMenuTrigger?.closeMenu();
    }
    if (this.trigger3) {
      this.trigger3.closeMenu();
    }
    this.conversationItem = null;
    this.postDetail = null;
    this.trigger = null;
    this.trigger1 = null;
    this.clickHoverMenuTrigger = null;
    this.trigger3 = null;
    this.forHeightGet = null;
  }
  clearSetTimeout():void{
    if (this.postDetailTimeOut) {
      clearTimeout(this.postDetailTimeOut)
      this.postDetailTimeOut = null;
    }
    if (this.postDetailNativeTimeout) {
      clearTimeout(this.postDetailNativeTimeout);
      this.postDetailNativeTimeout = null;
    }
    if (this.loadedTicketHisotrySignalTimeOut) {
      clearTimeout(this.loadedTicketHisotrySignalTimeOut)
    }
    if (this.postDetailScrollTopTimeout) {
      clearTimeout(this.postDetailScrollTopTimeout);
    }
    if (this.conversationItemTimeOut) {
      clearTimeout(this.conversationItemTimeOut);
    }
    if (this.noteChangeTimeOut) {
      clearTimeout(this.noteChangeTimeOut)
    }
    if (this.emailProfileDetailsTimeOut) {
      clearTimeout(this.emailProfileDetailsTimeOut)
    }
    if (this.effectFilterTabSourceSignal) {
      this.effectFilterTabSourceSignal.destroy();
    }
    if (this.effectTicketStatusChangeSignal) {
      this.effectTicketStatusChangeSignal.destroy();
    }
    if (this.effectOpenCallDetailWindowSignal) {
      this.effectOpenCallDetailWindowSignal.destroy();
    }
    if (this.effectRedirectToTagIdSignal) {
      this.effectRedirectToTagIdSignal.destroy();
    }
    if (this.effectCurrentPostObjectSignal) {
      this.effectCurrentPostObjectSignal.destroy();
    }
    if (this.effectIsReplyVisibleCheckSignal) {
      this.effectIsReplyVisibleCheckSignal.destroy();
    }
    if (this.effectReplyActionPerformedSignal) {
      this.effectReplyActionPerformedSignal.destroy();
    }
    if (this.effectSetTicketForRefreshSignal) {
      this.effectSetTicketForRefreshSignal.destroy();
    }
    if (this.effectUpdateCRMDetailsSignal) {
      this.effectUpdateCRMDetailsSignal.destroy();
    }
    if (this.effectAgentAssignToObservableSignal) {
      this.effectAgentAssignToObservableSignal.destroy();
    }
    if (this.effectTicketStatusChangeObsSignal) {
      this.effectTicketStatusChangeObsSignal.destroy();
    }
    if (this.effectCrmChatbotCloseTicketObsSignal) {
      this.effectCrmChatbotCloseTicketObsSignal.destroy();
    }
    if (this.effectTicketHistoryActionPerformObsSignal) {
      this.effectTicketHistoryActionPerformObsSignal.destroy();
    }
    if (this.effectTicketEscalationObsSignal) {
      this.effectTicketEscalationObsSignal.destroy();
    }
    if (this.effectClearNoteAttachmentSignal) {
      this.effectClearNoteAttachmentSignal.destroy();
    }
    if (this.effectOpenRephraseSFDCSignal) {
      this.effectOpenRephraseSFDCSignal.destroy();
    }
  }

  /* mergeCommunicationLogs(logs: any[]): any[] {
    let mergedLogs: any[] = [];
    let tempLog: any = null;
    let indexToReplace: number | null = null;

    for (const log of logs) {
      if (log.isCommunicationLog) {
        if (tempLog) {
          // Merge into tempLog
          tempLog.mergedLogs.push(log);
        } else {
          // Store first occurrence and its index
          tempLog = { ...log, mergedLogs: [log] };
          indexToReplace = mergedLogs.length;
          mergedLogs.push(tempLog); // Placeholder for merged log
        }
      } else {
        // If tempLog exists, replace its index and reset
        if (tempLog && indexToReplace !== null) {
          mergedLogs[indexToReplace] = tempLog;
          tempLog = null;
          indexToReplace = null;
        }
        mergedLogs.push(log); // Push non-communication log directly
      }
    }

    // Replace last tempLog if exists
    if (tempLog && indexToReplace !== null) {
      mergedLogs[indexToReplace] = tempLog;
    }

    return mergedLogs;
  } */

  mergeCommunicationLogs(logs) {
    let mergedLogs = [];
    let tempGroup = null;
    let communicationLogCount = 0;

    for (let log of logs) {
      if (log.isCommunicationLog && !log.isBrandPost && (log?.status != 133 && log?.status != 134 && log?.status != 135 && log?.status != 136)) {
        communicationLogCount++;
        if (tempGroup) {
          tempGroup.logs.push(log);
        } else {
          tempGroup = {
            isBrandPost: log.isBrandPost,
            isCommunicationLog: log.isCommunicationLog,
            iscombine: true,
            logs: [log]
          };
        }
      } 
      else {
        if (tempGroup) {
          if (communicationLogCount > 1) {
            mergedLogs.push(tempGroup);
          } else {
            mergedLogs.push(tempGroup.logs[0]);
          }
          tempGroup = null;
          communicationLogCount = 0;
        }
        mergedLogs.push(log);
      }
    }

    if (tempGroup) {
      if (communicationLogCount > 1) {
        mergedLogs.push(tempGroup);
      } else {
        mergedLogs.push(tempGroup.logs[0]);
      }
    }

    console.log(mergedLogs)
    return mergedLogs;
  }

  expandAllEmails():void
  {
    this.emailBaseMention?.forEach((x)=>{
      if(!x?.showEmail)
      {
        x.showEmail = true;
        x.showMore = false
      }
    })
  }

  toggleMediaView():void
  {
    if (this.isSideBarAttachmentOpen)
    {
      return;
    }
    if (this.userInfoToggle){
      this.isSideBarAttachmentOpen=false
    }else{
      this.selectedIndex = 0
      this.sentMedia = []
      this.receivedMedia = []
      const brandPost = this._postDetailService.emailTicketAttachmentMedia.filter((x) => x.brandPost);
      const userPost = this._postDetailService.emailTicketAttachmentMedia.filter((x) => !x.brandPost);
      if (brandPost?.length > 0)
      {
        this.sentMedia = this.transformMediaList(brandPost);
      }
      if (userPost?.length > 0)
      {
        this.receivedMedia = this.transformMediaList(userPost);
      }
      this.isSideBarAttachmentOpen=true
    }
    this.ticketService.attachmentWidthCalculationDetailViewObs.next(this.isSideBarAttachmentOpen)
  }

  transformMediaList(data: any[]): any[] {
    const tempGroup: Record<string, any[]> = {};

    data.forEach(entry => {
      entry.attachment.forEach((file: any) => {
        const fileDate = moment(file.date || entry.date).local();
        let label = '';

        if (moment().isSame(fileDate, 'day')) {
          label = 'Today';
        } else if (moment().subtract(1, 'day').isSame(fileDate, 'day')) {
          label = 'Yesterday';
        } else if (moment().diff(fileDate, 'days') < 7) {
          label = 'This Week';
        } else {
          label = fileDate.format('MMM DD, YYYY');
        }

        const formattedItem = {
          ...file,
          brandPost: entry.brandPost
          // size: `${file.size} MB`,
        };

        if (!tempGroup[label]) {
          tempGroup[label] = [];
        }

        tempGroup[label].push(formattedItem);
      });
    });

    // Convert object to sorted array
    const sorted = Object.entries(tempGroup)
      .map(([label, items]) => ({
        label,
        items: items.sort((a, b) => moment(b.date).diff(moment(a.date))),
      }))
      .sort((a, b) => {
        // Sort groups by latest item date
        const latestA = moment(a.items[0].date);
        const latestB = moment(b.items[0].date);
        return latestB.diff(latestA);
      });

    return sorted;
  }

  downloadAllFiles():void{
    const fileList = []
    if (this.selectedIndex==0)
    {
      this.receivedMedia.forEach(x => {
        x?.items?.forEach(file => {
        fileList.push({ name: file.name, url: file.mediaUrl });
        })
      });
      this.ticketService.downloadFilesAsZip(fileList, `Attachment of ${this.postObj.ticketID}`)
    }else
    {
      this.sentMedia.forEach(x => {
        x?.items?.forEach(file => {
          fileList.push({ name: file.name, url: file.mediaUrl });
        })
      });
        this.ticketService.downloadFilesAsZip(fileList, `Attachment of ${this.postObj.ticketID}`)
  }
}

  downloadFile(url: string, filename: string):void{
    this.ticketService.downloadFile(url, filename)
  }

  previewFile(item):void{
    const attachments = [item]
          if (attachments.length > 0) {
                this._dialog.open(VideoDialogComponent, {
                  panelClass: 'overlay_bgColor',
                  data: attachments,
                  autoFocus: false,
                });
              }
  }

  previewAllFiles():void
  {
    const attachments = [];
   if(this.selectedIndex==0)
   {
    this.receivedMedia?.forEach((x) => {
      x?.items?.forEach((file)=>{
      if (file.mediaType == 2 || file.mediaType == 3) {
        attachments.push(file)
      }
    })
    })
  }else
  {
     this.sentMedia.forEach((x) => {
       x?.items?.forEach((file) => {
         if (file.mediaType == 2 || file.mediaType == 3) {
           attachments.push(file)
         }
       })
     })
  }
    if (attachments.length > 0) {
      this._dialog.open(VideoDialogComponent, {
        panelClass: 'overlay_bgColor',
        data: attachments,
        autoFocus: false,
      });
    }

  }

  closeMediaPopup():void
  {
    this.isSideBarAttachmentOpen = false;
    this.selectedIndex = 0
    this.sentMedia = []
    this.receivedMedia = []
    this.ticketService.attachmentWidthCalculationDetailViewObs.next(this.isSideBarAttachmentOpen)
  }

  checkEmailGuideValid(): void {
    if (this.postObj?.channelGroup === ChannelGroup.Email) {
      const cookie = this.accountService.getCookie('EmailGuide');
      if (cookie) {
        const settings = JSON.parse(cookie);
        if (settings.showFlag && settings.skipCount < 1) {
          this._dialog.open(TutorialModalComponent, {
            width: '55vw',
          });
        }
      }
    }
  }

  syncSFDCData(): void {
      this.rotate = true;
      const obj = {
        "TicketID": this.postObj?.ticketID,
        "TagID": this.postObj?.tagID,
        "BrandID": this.postObj?.brandInfo?.brandID,
        "channelGroup": this.postObj?.channelGroup
      }
     
      this.ticketService.SFDCDataSync(obj).subscribe((res) => {
        this.rotate = false;
        if (res.success) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Data-pushed-successfully'),
            },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: res.message,
            },
          });
        }
      }
      , (err) => {  
        this.rotate = false;
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

  goBack():void
  {
    this.closePostDetail.emit(true);
  }

  acceptCallEventRes(event) {
    if (event) {
      this.showCallPopup = false;
      this._cdr.detectChanges();
    }
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



