import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  signal,
  SimpleChanges,
  untracked,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locobuzzAnimations } from '@locobuzz/animations';
import {
  ActionStatusEnum,
  ClientStatusEnum,
} from 'app/core/enums/ActionStatus';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { LogStatus } from 'app/core/enums/LogStatus';
import { MentionActions } from 'app/core/enums/MentionActions';
import { notificationType } from 'app/core/enums/notificationType';
import { PostActionEnum } from 'app/core/enums/postActionEnum';
import { PostActionType } from 'app/core/enums/PostActionType';
import { Sentiment } from 'app/core/enums/Sentiment';
import { SsreIntent } from 'app/core/enums/SsreIntentEnum';
import { SSRELogStatus } from 'app/core/enums/SSRELogStatus';
import { SSREMode } from 'app/core/enums/SsreLogStatusEnum';
import { TicketSignalEnum } from 'app/core/enums/TicketSignalEnum';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { TicketMentionCategory } from 'app/core/interfaces/TicketMentionCategory';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseSocialAccountConfiguration } from 'app/core/models/accountconfigurations/BaseSocialAccountConfiguration';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import {
  BulkMentionChecked,
  SocialHandle,
} from 'app/core/models/dbmodel/TicketReplyDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostSignalR, Tab } from 'app/core/models/menu/Menu';
import {
  PostSpecificInput,
  PostsType,
  postView,
} from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
// import { PostSubscribeComponent, NewSrComponent } from '..';
// import { MdePopoverModule } from '@material-extended/mde';
import {
  EmailReadReceipt,
  ReplyInputParams,
  ReplyTimeExpire,
} from 'app/core/models/viewmodel/ReplyInputParams';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { TabService } from 'app/core/services/tab.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { BrandSettingService } from 'app/social-inbox/services/brand-setting.service';
import { FilterGroupService } from 'app/social-inbox/services/filter-group.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { PostAssignToService } from 'app/social-inbox/services/post-assignto.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import { environment } from 'environments/environment';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, take, filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { BrandList } from '../../../shared/components/filter/filter-models/brandlist.model';
import { QuoteTweetComponent } from '../quote-tweet/quote-tweet.component';
import { TicketDispositionComponent } from '../ticket-disposition/ticket-disposition.component';
import { Language } from './../../../app-data/post';
import { TicketClient } from './../../../core/interfaces/TicketClient';
import { TranslateData } from './../../../core/models/viewmodel/TranslateData';
import { ChatBotService } from './../../services/chatbot.service';
import { CategoryFilterComponent } from './../category-filter/category-filter.component';
import { PostAssigntoComponent } from './../post-assignto/post-assignto.component';
import { PostDetailComponent } from './../post-detail/post-detail.component';
import { PostBodyComponent } from './post-body/post-body.component';
import { SidebarService } from 'app/core/services/sidebar.service';
import { AttachTicketComponent } from '../attach-ticket/attach-ticket.component';
import { PostMarkinfluencerComponent } from '../post-markinfluencer/post-markinfluencer.component';
import { BulkOperationObject } from 'app/core/models/dbmodel/BulkOperationObject';
import { DOCUMENT } from '@angular/common';
import { CannedResponseComponent } from '../canned-response/canned-response.component';
import { LocoBuzzAgent } from 'app/core/models/viewmodel/LocoBuzzAgent';
import { CreateAttachMultipleMentionParam } from 'app/core/models/viewmodel/CreateAttachMultipleMentionParam';
import { TagMentionCampaignComponent } from '../tag-mention-campaign/tag-mention-campaign.component';
import moment from 'moment';
import { AllMentionGroupView } from 'app/shared/components/post-options/post-options.component';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { NoteMedia, UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { MediaGalleryComponent } from '../media-gallery/media-gallery.component';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
// import { PostFootComponent } from './post-foot/post-foot.component';
import { PostFootComponent } from './post-foot/post-foot.component';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-post',
    templateUrl: './post.component.html',
    styleUrls: ['./post.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class PostComponent implements OnInit,AfterViewInit, OnDestroy {
  ren: any;
  prevButtonTrigger: any;
  directCloseBlock: boolean;
  directCloseLoader: boolean = false;
  errorTitle: string;
  selectedTicketView: any;
  selectedEmailView: any;
  isTicketDispositionFeatureEnabled: any;
  isAITicketTagEnabled: boolean = false;
  emailHTMLView: boolean = false;
  createticketnote: string;
  createTicketStatus: number;
  cannedapprovenote = '';
  cannedrejectnote = '';
  customAgentListAsync = new Subject<LocoBuzzAgent[]>();
  customerAgentList: LocoBuzzAgent[] = [];
  assignToUser: number;
  defaultAgentID:number
 
  clickhouseEnabled: boolean=false;
  logDetails: any;
  postHeight: number;
  editedNoteData: any;
  editednote: any;
    selectedNoteMedia: UgcMention[] = [];
  noteSpinner: boolean;
  showMoreMenu: boolean=true;

 
  public get channelGroupEnum(): typeof ChannelGroup {
    return ChannelGroup;
  }
  public get getMentionAction(): typeof MentionActions {
    return MentionActions;
  }
  @Input() postData: BaseMention;
  @Input() pageType: PostsType;
  @Input() AllCheckBoxes = false;
  @Input() openReply: boolean = false;
  @Input() openDetailOnClick = false;
  @Input() postFootDisable? = false;
  @Input() showPostFooter? = true;
  @Input() parentPostFlag: boolean = false;
  @Input() parentPostFirstFlag: boolean = false;
  @Input() postDetailTab: LocobuzzTab;
  @Input() postInput?: PostSpecificInput = {};
  @Input() mentionHistory?: boolean = false;
  @Input() mentionHistoryForSubject?: boolean = false;
  @Input() showParentPostHeader?: boolean = false;
  @Input() hideActionableButton?: boolean = false;
  @Input() showActionPerform?: boolean = true;
  @Input() crmFlag?: boolean = false;
  @Input() postView: postView = postView.detailView;
  @Input() postDetailExpandView: boolean = false;
  @Input() userPostView: boolean = false;
  @Input() startIndex:number;
  @Input() endIndex:number;
  @Input() autoCloseWindow:boolean=false;
  @Input() hideCheckBox:boolean =false ;
  @Input() mentionOrGroupView:AllMentionGroupView=AllMentionGroupView.mentionView;
  @Input() TicketList:BaseMention[]=[]  
  @Input() unseenNoteCountList:[]=[]
  @Input() expandedView: boolean = false;
  @Input() allMentionList:any[] = [];
  @Input() subject:string =''
  @Input() ozontelFlag:boolean = false;
  @Output() postSelectEvent = new EventEmitter<any>();
  @Output() postDetailEvent = new EventEmitter<any>();
  @ViewChild('clickTicketMenuTrigger') clickTicketMenuTrigger: MatMenuTrigger;
  @ViewChildren('checkboxes') checkboxes: QueryList<ElementRef>;
  @ViewChild('postBody') postBodyComponent: PostBodyComponent;
  postViewEnum = postView;
  post: TicketClient;
  imgPath: string = 'assets/social-mention/post/';
  brandImg: string = 'brand-logo.png';
  userpostLink?: string;
  currentUser: AuthUser;
  brandList: BrandList[];
  currentBrand: BrandList;
  Object = Object;
  ticketHistoryData: AllBrandsTicketsDTO;
  MediaUrl: string;
  objBrandSocialAcount: BaseSocialAccountConfiguration[];
  handleNames?: SocialHandle[] = [];

  handleNamesObs = new Subject<SocialHandle[]>();
  handleNamesObs$ = this.handleNamesObs.asObservable();

  selectedHandle?: SocialHandle = {};
  mentionAction: number;
  mentionActionFlag: boolean;
  translatedData: TranslateData;
  // crm selected country code
  selected = '+91';
  showTranslated = false;
  translatedText = '';
  translateFrom: string;
  translateTo: string = 'Unknow';
  translateToForm: string = 'Unknow';
  languages = Language;
  isTranslateError = false;
  replyInputParams: ReplyInputParams = {};
  isReplyTimeExpired = false;
  replyErrorFlag = false;
  replytTimeExpireMessage = '';
  @Output() postActionClicked = new EventEmitter<any>();
  subs = new SubSink();
  // video

  videoIcon = false;
  postReplyBlock = false;
  enteredButton = false;
  isMatMenuOpen = false;
  isMatMenu2Open = false;
  likeUnlike = false;
  isbrandPost = false;
  isbulkselectall = false;
  isEmailRead = false;
  markAllAsRead = false;
  uparrow = false;
  downarrow = false;
  botharrows = false;
  hidearrows = false;
  backMentionIdToMove = 0;
  nextMentionIdToMove = 0;
  ShowMarkAsRead = false;
  showReply = true;
  showVoipReply = false;
  dialpadStatusOpenClose: boolean;
  directCloseNote = '';
  dispositionDetails: any;
  IDName =''
  AllMentionGroupViewEnum = AllMentionGroupView;
  public get PostActionEnum(): typeof PostActionEnum {
    return PostActionEnum;
  }
  searchedText?: string;
  isDispositionList: boolean;
  @Input() showLockStrip?= false;
  @Input() isPostDetailsLogView?: boolean = false;
  marginBottoom:string=''

  public newThreadEmail:boolean = false;
  checkReplyParamsSignalTimeout:any;
  clearPostReplySetTimeout :any;
  clearDirectBlockTimeOut : any;
  markAsseenApiRes :any;
  getAuthorTicketsApiRes: any;
  replyApprovedApiRes :any;
  replyRejectedApiRes :any;
  ssreLiveRightVerifiedApiRes :any;
  ssrLiveWrongKeepApiRes :any;
  ssreLiveWrongDeleteApiRes :any;
  getBrandMentionReadSettingApiRes: any;
  replyApiRes : any;
  loclUnlockTicketAPiRes : any;
  getEmailHtmlDataApiRes :any;
  deleteFromLocobuzzApiRes:any;
  deleteFromSocialApiRes : any;
  deleteFromSocialAndToolApiRes : any;
  getTicketHtmlForEmail : any;
  getUserswithTicketCountAPiRes : any;
  workFlowReplyApiRes : any;
  workFlowRejectedApiRes : any;
  createAttachMultipleMentionApiRes : any;
  enableTicketMakerCheckerApiRes : any;
  updateMentionLanguageApiRes : any;
  public clearSignal = signal<boolean>(true);
  closeReplyBoxSignalRef;
  closeAlreadyOpenReplyPopupSignalRef;
  updateCRMDetailsSignalRef;
  agentAssignToObservableSignal
  emitEmailReadStatusSignal;
  checkReplyTimeExpireSignal;
  emitBrandMentionEmailDataSignal;
  ticketEscalateUpdateSignal;
  authorDetails: any;
  getAuthorTicketMandatoryDetailsApi: any;
  // @ViewChild('postFoot') postFootComponent: PostFootComponent;
  missingFieldsClosure;
   @ViewChild('menuTrigger3') trigger3 : MatMenuTrigger;
    mediaSelectedAsync = new Subject<UgcMention[]>();
     mediaSelectedAsync$ = this.mediaSelectedAsync.asObservable();
     mediaTypeEnum = MediaEnum
     @Input() showEmailPopup:boolean = true;
     showFooterIcons:boolean = false
  aiTicketIntelligenceModelData: any;
  selectedUpperTags = { start: 'Complaint', end: 'Appreciation' };
  selectedEmotions = { start: 4, end: 8, startColor: '', endColor: '', startLabel: '', endLabel: '' };
  selectedSentiment = { start: 0, end: 2 };
  selectedSatisfactionRating = 0;
  oldSelectedSatisfactionRating = 0;
  selectedLead = 0;
  ticketTagging = [];
  sentimentColorClass = 'sentiment-border__positive';
  sentimentBackgroundColorClass = 'sentiment-background-neutral';
  public defaultLayout: boolean = false;

  constructor(
    public dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    private _filterService: FilterService,
    private _postDetailService: PostDetailService,
    private _accountService: AccountService,
    private _ticketService: TicketsService,
    private _snackBar: MatSnackBar,
    private _mapLocobuzz: MaplocobuzzentitiesService,
    private _replyService: ReplyService,
    private _navigationService: NavigationService,
    private _tabService: TabService,
    private _filterGroupService: FilterGroupService,
    private _ticketSignalrService: TicketsignalrService,
    private _postAssignToService: PostAssignToService,
    private _footericonService: FootericonsService,
    private _brandsettingService: BrandSettingService,
    private _chatBotService: ChatBotService,
    private _voip: VoiceCallService,
    private _ngZone: NgZone,
    private _cdr: ChangeDetectorRef,
    private sidebarService: SidebarService,
    private MapLocobuzz: MaplocobuzzentitiesService,
    private _userDetailService: UserDetailService,
    @Inject(DOCUMENT) private doucument: Document,
    private mediaGalleryService: MediagalleryService,
    private exotelService: ExotelService,
    private commonService: CommonService,
    private _translate: TranslateService // <-- add this
  ) {
    this.MediaUrl = environment.MediaUrl;
    this.translateToForm = 'en';
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    let onLoadCloseReply = true;
    // this.closeReplyBoxSignalRef = effect(() => {
    //   const value = this.clearSignal() ? this._replyService.closeReplyBoxSignal() : untracked(() => this._replyService.closeReplyBoxSignal());
    //   if (!onLoadCloseReply && this.clearSignal()) {
    //     this.closeReplyBoxSignalChanges(value);
    //   } else {
    //     onLoadCloseReply = false;
    //   }
    // }, { allowSignalWrites: true });

    let onLoadCloseAlready = true;
    this.closeAlreadyOpenReplyPopupSignalRef = effect(() => {
      const value = this.clearSignal() ? this._ticketService.closeAlreadyOpenReplyPopupSignal() : untracked(() => this._ticketService.closeAlreadyOpenReplyPopupSignal());
      if (!onLoadCloseAlready && value && this.clearSignal()) {
        this.closeAlreadyOpenReplyPopupSignalChanges(value);
      } else {
        onLoadCloseAlready = false;
      }
    }, { allowSignalWrites: true });

    let onLoadUpdateCRMDetails = true;
    this.updateCRMDetailsSignalRef = effect(() => {
      const value = this.clearSignal() ? this._ticketService.updateCRMDetailsSignal() : untracked(() => this._ticketService.updateCRMDetailsSignal());
      if (!onLoadUpdateCRMDetails && value && this.clearSignal()) {
        this.updateCRMDetailsSignalChange(value)
      } else {
        onLoadUpdateCRMDetails = false;
      }
    }, { allowSignalWrites: true });

    let onLoadAgentAssign = true;
    this.agentAssignToObservableSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.agentAssignToObservableSignal() : untracked(() => this._ticketService.agentAssignToObservableSignal());
      if (!onLoadAgentAssign && value && this.clearSignal()) {
        this.agentAssignToObservableSignalChanges(value)
      } else {
        onLoadAgentAssign = false;
      }
    }, { allowSignalWrites: true });

    let onLoadEmitEmail = true;
    this.emitEmailReadStatusSignal=  effect(() => {
      const value = this.clearSignal() ? this._replyService.emitEmailReadStatusSignal() : untracked(() => this._replyService.emitEmailReadStatusSignal());
      if (!onLoadEmitEmail && value && this.clearSignal()) {
        this.emitEmailReadStatusSignalChanges(value);
      } else {
        onLoadEmitEmail = false;
      }
    }, { allowSignalWrites: true });

    let onLoadCheckReplyTimeExpire = true;
    this.checkReplyTimeExpireSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.checkReplyTimeExpireSignal() : untracked(() => this._replyService.checkReplyTimeExpireSignal());
      if (!onLoadCheckReplyTimeExpire && value && this.clearSignal()) {
        this.checkReplyTimeExpireSignalChanges(value);
      } else {
        onLoadCheckReplyTimeExpire = false;
      }
    }, { allowSignalWrites: true });

    let onLoadBrandMentionEmail = true;
    this.emitBrandMentionEmailDataSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.emitBrandMentionEmailDataSignal() : untracked(() => this._replyService.emitBrandMentionEmailDataSignal());
      if (!onLoadBrandMentionEmail && value && this.clearSignal()) {
        this.emitBrandMentionEmailDataChanges(value);
      } else {
        onLoadBrandMentionEmail = false;
      }
    }, { allowSignalWrites: true });

    let onLoadTicketEscalateUpdateSignal = true;
    this.ticketEscalateUpdateSignal = effect(() => {
      const value = this.clearSignal() ? this._postDetailService.ticketEscalateUpdateSignal() : untracked(() => this._postDetailService.ticketEscalateUpdateSignal());
      if (!onLoadTicketEscalateUpdateSignal && value && this.clearSignal()) {
        this.ticketEscalateUpdateSignalChanges(value);
      } else {
        onLoadTicketEscalateUpdateSignal = false;
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // console.log('post called');
    // console.log(this.postData)

    //  console.log(this.postData);
    
    if ('toMailList' in this.postData && this.postData?.toMailList?.length > 0){
      this.postData.toMailList = this.postData.toMailList.filter(item=>item.trim().length > 0);
    }

    this.userpostLink = this._footericonService.setOpenPostLink(
      this.postData,
      this.openReply
    );
    if (this.postData.mentionMetadata) {
      this.postData.mentionMetadata.likeCount = isNaN(
        this.postData.mentionMetadata.likeCount
      )
        ? 0
        : this.postData.mentionMetadata.likeCount;
    }
    this.post = this._ticketService.mapPostByChannel(this.postData, this.pageType == this.postType.TicketHistory ? null : this._navigationService?.currentSelectedTab?.Filters?.isModifiedDate);
    this.post['tagId'] = this.postData?.ticketInfo.tagID;
    if (this.post?.channelgroup !== this.postData?.channelGroup || this.post?.channeltype !== this.postData?.channelType) {
      this._ticketService.errorLogsCommonFrontend({ mentionFetch: this.postData, frontendpost: this.post })
        .subscribe((res) => { })
    }
    this.post = this._footericonService.setAuthorName(this.post, this.postData,this.currentUser); 

    if (this.pageType === PostsType.TicketHistory) {
      this.post.note = '';
      if (
        this.postData.ticketInfo.lastNote &&
        this.postData.ticketInfo.latestTagID === this.postData.ticketInfo.tagID
      ) {
        this.post.note = this.postData.ticketInfo.lastNote;
      }
    }

    if (this.post) {
      this.ticketHistoryData = {};
      this.ticketHistoryData.ticketClient = this.post;
      this.ticketHistoryData.deleteSocialEnabled =
        this.currentUser.data.user.actionButton.deleteSocialEnabled;
    }
    this.isbrandPost = this.postData.isBrandPost;
    if (this.AllCheckBoxes) {
      this.isbulkselectall = true;
    } else {
      this.isbulkselectall = false;
    }
    if (this.parentPostFlag) {
      this.postData['parentCheckBoxFlag'] = this.postData.isParentPost
        ? true
        : false;
    } else {
      this.postData['parentCheckBoxFlag'] = false;
    }
    // this._postDetailService.postObj = this.postData;
    this.mapwithRespectiveObject(this.postData);
    // const value = this._replyService.closeReplyBoxSignal();
    // this.closeReplyBoxSignalChanges(value);
    this.subs.add(
      this._replyService.closeReplyBox.subscribe((obj) => {
        if (obj != null) {
          this.postReplyBlock = obj;
          if (this.pageType !== PostsType.TicketHistory) {
            this._chatBotService.chatBotHideObsSignal.set({
              status: this.postReplyBlock,
            });
          }
          this._cdr.detectChanges();
          this._replyService.closeReplyBox.next(null);
        }
      })
    );
    this.subs.add(
      this._ticketSignalrService.postSignalCall.subscribe((postSignalObj) => {
        if (
          postSignalObj &&
          postSignalObj.ticketId &&
          this.postData.ticketInfo.ticketID === postSignalObj.ticketId
        ) {
          this.executeSignalCall(postSignalObj);
        }
      })
    );
    if (this.openReply) {
      if (
        this.postData.ticketInfo.status === TicketStatus.Open &&
        this.postData.makerCheckerMetadata.workflowStatus !==
          LogStatus.ReplySentForApproval &&
        this.postData.ticketInfoSsre.ssreStatus !==
          SSRELogStatus.SSREInProcessing &&
        this.postData.ticketInfoSsre.ssreStatus !==
          SSRELogStatus.IntentFoundStillInProgress &&
        this.currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
        this.currentUser.data.user.role !== UserRoleEnum.BrandAccount &&
        this.currentUser.data.user.actionButton.replyEnabled
      ) {
        if (
          this.postData.channelGroup === ChannelGroup.Discourse ||
          this.postData.channelGroup === ChannelGroup.ComplaintWebsites ||
          this.postData.channelGroup === ChannelGroup.DiscussionForums ||
          this.postData.channelGroup === ChannelGroup.ECommerceWebsites ||
          this.postData.channelGroup === ChannelGroup.News ||
          this.postData.channelGroup === ChannelGroup.TeamBHP ||
          this.postData.channelGroup === ChannelGroup.Quora ||
          this.postData.channelGroup === ChannelGroup.TikTok ||
          this.postData.channelGroup === ChannelGroup.GlassDoor ||
          this.postData.channelGroup === ChannelGroup.Survey ||
          this.postData.channelGroup === ChannelGroup.TripAdvisor || 
          this.postData.channelGroup === ChannelGroup.Blogs ||
          this.postData.channelGroup === ChannelGroup.Yotpo
        ) {
        } else {
          if (!this.crmFlag) {
            // this._ticketService.closeAlreadyOpenReplyPopup.next(null);
            this._ticketService.closeAlreadyOpenReplyPopupSignal.set(null);
            if ((!this.currentUser?.data?.user?.isListening && this.currentUser?.data?.user?.isORM) || (this.currentUser?.data?.user?.isListening && this.currentUser?.data?.user?.isORM))
            {
              this.replyPost();
            }
          }
        }
      }
    }

    // this.subs.add(
    //   this._ticketService.ticketcategoryMapChange.subscribe((value) => {
    //     if (value) {
    //       if (value.tagID === this.postData.tagID) {
    //         this.categorymapdisplay(value);
    //       }
    //     }
    //   })
    // );

    // this.subs.add(
    //   this._ticketService.updateUpperCategory.subscribe((value) => {
    //     if (value) {
    //       if (value.TagIds.some((obj) => obj.tagID==this.postData.tagID)) {
    //         this.post.ticketCategory = {
    //           ticketUpperCategory: value.ticketUpperCategory ? value.ticketUpperCategory.name:null,
    //           mentionUpperCategory: value.mentionUpperCategory?value.mentionUpperCategory.name:null,
    //         };
    //       }
    //     }
    //   })
    // );

    const valueReplyTimeExpireSignal = this._replyService.checkReplyTimeExpireSignal();
    if (valueReplyTimeExpireSignal) {
      this.checkReplyTimeExpireSignalChanges(valueReplyTimeExpireSignal);
    }

    // this.subs.add(
    //   this._replyService.checkReplyTimeExpire.subscribe((data) => {
    //     if (data && !this.showReply) {
    //       if (data.tagId == this.postData.tagID) {
    //         this.checkReplyTimeExpired(data.obj);
    //       }
    //     }
    //   })
    // );

    this.subs.add(
      this._replyService.checkReplyError.subscribe((data) => {
        if (data) {
          if (data.tagID == this.postData.tagID) {
            this.checkReplyError(data.obj);
          }
        }
      })
    );

    this.subs.add(
      this._postDetailService.setMarkInfluencer.subscribe((postObj) => {
        if (postObj) {
          if (
            postObj?.author?.socialId === this.postData.author?.socialId &&
            postObj?.brandInfo?.brandID === this.postData.brandInfo?.brandID
          ) {
            if (postObj.author.markedInfluencerCategoryID) {
              this.postData.author.markedInfluencerCategoryID =
                postObj.author.markedInfluencerCategoryID;
              this.postData.author.markedInfluencerCategoryName =
                postObj.author.markedInfluencerCategoryName;
              this.ticketHistoryData.isInfluencermarked = true;
            } else {
              this.postData.author.markedInfluencerCategoryID =
               0;
              this.postData.author.markedInfluencerCategoryName =
                null;
              this.ticketHistoryData.isInfluencermarked = false;
            }
            this._cdr.detectChanges();
          }
        }
      })
    );

    this.subs.add(
      this._postDetailService.setMarkInfluencerClickhouse.subscribe((postObj) => {
        if (postObj) {
          if (
            postObj?.author?.socialId === this.postData.author?.socialId && 
            postObj?.brandInfo?.brandID === this.postData.brandInfo?.brandID
          ) {
            if (postObj.author.influencerDetailsList?.length > 0) {
              this.postData.author.influencerDetailsList =
                postObj.author.influencerDetailsList;
              this.ticketHistoryData.isInfluencermarked = true;
            } else {
              this.postData.author.influencerDetailsList =
                [];
              this.ticketHistoryData.isInfluencermarked = false;
            }
            this._cdr.detectChanges();
          }
        }
      })
    );

    if (this.postData.channelGroup === ChannelGroup.Email) {
      this.subs.add(
        this._replyService.checkEmailReadReceipt.subscribe((res) => {
          if (res) {
            this.checkIfEmailIsRead(res);
          }
        })
      );
      this.subscribeToEvents();
      // this.subs.add(
      //   this._userDetailService.updateTicketFields.subscribe((res) => {
      //     if (res) {
      //       this.getAuthorTicketMandatoryDetails();
      //     }
      //   })
      // );
    }

    const valueOpenReplyPopup = this._ticketService.closeAlreadyOpenReplyPopupSignal();
    if (valueOpenReplyPopup) {
      this.closeAlreadyOpenReplyPopupSignalChanges(valueOpenReplyPopup);
    }

    // this.subs.add(
    //   this._ticketService.closeAlreadyOpenReplyPopup.subscribe((data) => {
    //     if (data) {
    //       if (
    //         data.ticketID != this.postData.ticketID &&
    //         data.tagID != this.postData.tagID
    //       ) {
    //         if (this.postReplyBlock) {
    //           this.postReplyBlock = false;
    //           this._cdr.detectChanges();
    //         }
    //       }
    //     }
    //   })
    // );
    // this.subs.add(
    //   this._ticketService.openCallDetailWindow.subscribe((res) => {
    //     this.showVoipReply = res;
    //   })
    // );

    if (this.crmFlag) {
      this.ticketHistoryData.showTicketWindow = false;
      this.ticketHistoryData.isSendEmailVisible = false;
      this.ticketHistoryData.isDirectCloseVisible = false;
      this.ticketHistoryData.isAssignVisible = false;
      this.ticketHistoryData.isAttachTicketVisible = false;
      this.ticketHistoryData.isEscalateVisible = false;
      this.ticketHistoryData.isTranslationVisible = false;
      this.ticketHistoryData.isMarkInfluencerVisible = false;
      this.ticketHistoryData.sendmailallmention = false;
      this.ticketHistoryData.crmcreatereqpop = false;
      this.ticketHistoryData.isReplyVisible = false;
      this.ticketHistoryData.isDeleteFromLocobuzz = false;
      this.ticketHistoryData.isEnableDisableMakercheckerVisible = false;
      this.ticketHistoryData.moreOptionFlag = false;
      this.ticketHistoryData.showcheckbox = false;
    } else {
      this.ticketHistoryData.moreOptionFlag = true;
    }

    if(this.ozontelFlag)
    {
      this.ticketHistoryData.showTicketWindow = true;
    }

    /* this.subs.add(
      this._ticketService.updateCRMDetails.subscribe((res) => {
        if (res) {
          if (
            ((res?.guid == this.postDetailTab?.guid && res?.postType == this.pageType) || res?.postType == this.pageType ) &&
            res?.TagID == this.postData.tagID
          ) {
            if (res?.SrID) {
              // this.postData.ticketInfo.leadID = res?.leadID;
              // this.post.leadID = res?.leadID;
              this.postData.ticketInfo.srid = res.SrID;
              this.post.srID = res?.SrID;
              if (this.postData?.ticketInfo?.leadID) {
                this.post.leadID = this.postData?.ticketInfo?.leadID;
                this._cdr.detectChanges();
              }
            }
            if (res?.leadID) {
              this.postData.ticketInfo.leadID = res?.leadID;
              this.post.leadID = res?.leadID;
              if (this.postData?.ticketInfo?.srid) {
                this.post.srID = this.postData?.ticketInfo?.srid;
                this._cdr.detectChanges();
              }
            }
            if ((res?.postType == this.pageType))
            {
              this.postReplyBlock=false
              this._cdr.detectChanges();
            this.post.srID = res.SrID;
            const brandInfo = this._filterService.fetchedBrandData.find(
              (obj) => obj.brandID == String(this.postData.brandInfo.brandID)
            );
            this.ticketHistoryData = this._footericonService.SetUserRole(
              this.pageType,
              this.ticketHistoryData,
              this.currentUser,
              this.postData,
              brandInfo
            );
            if (brandInfo?.isUpdateWorkflowEnabled && brandInfo.crmClassName.toLowerCase() === 'fedralcrm') {
              this.replyPost();
              this._cdr.detectChanges();
              return;
            }
            if (brandInfo?.isUpdateWorkflowEnabled && brandInfo.typeOfCRM!=101) {
              this.replyEscalate(true);
            } else if (brandInfo?.isUpdateWorkflowEnabled && brandInfo.typeOfCRM == 101){
              this.replyPost()
            }
            else if (brandInfo.typeOfCRM == 102 && brandInfo.isManualPush == 1 && res?.agentID) {
              this.defaultAgentID = res?.agentID
              this.replyPost()
            }
            if (brandInfo?.crmClassName.toLowerCase() === 'dreamsolcrm')
            {
              this.ticketHistoryData.isEscalateVisible = true;
              this.ticketHistoryData.isDirectCloseVisible = true
            }
          }
            this._cdr.detectChanges();
        }
        }
      })
    ); */
    this.subs.add(
      this._ticketService.dialpadStatusCheck.subscribe((value) => {
        if (value) {
          this.dialpadStatusOpenClose = true;
          this._cdr.detectChanges();
        }
      })
    );

    this.subs.add(
      this._ticketService.updateUpperCategory.subscribe((value) => {
        if (value) {
          if (value.TagIds.some((obj) => obj.tagID == this.postData.tagID)) {
            // this.categorymapdisplay(value);
            if (value.ticketType == PostsType.Tickets) {
              this.postData.ticketInfo.ticketUpperCategory =
                value.selectedUpperCategory;
            }
            if (value.ticketType == PostsType.Mentions) {
              this.postData.upperCategory = value?.selectedUpperCategory ? value?.selectedUpperCategory : { id: 0, name: null, userID: null, brandInfo: null };
            }
            this.postData.upperCategory = (value?.postObj?.upperCategory) ? value?.postObj?.upperCategory : { id: 0, name: null, userID: null, brandInfo: null };
            this.postData.categoryMap = value?.postObj?.categoryMap;
            this.postData.ticketInfo.ticketUpperCategory =
              value?.postObj?.ticketInfo?.ticketUpperCategory;
            this.post = this._ticketService.mapPostByChannel(this.postData,this._navigationService?.currentSelectedTab?.Filters?.isModifiedDate);
            this._cdr.detectChanges();
          }
        }
      })
    );

    this.subs.add(
      this._ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.subscribe(
        (data) => {
          if (data) {
            if (data?.postObj?.ticketID == this.postData?.ticketID) {
              if (data.type == 'Ticket') {
                this.postData.ticketInfo.ticketCategoryMap = data?.categoryCards;
                this.postData.ticketInfo.ticketUpperCategory = data?.upperCategories;
              } else {
                this.postData.categoryMap = data?.categoryCards;
                this.postData.upperCategory = data?.upperCategories ? data?.upperCategories:{ id: 0, name: null, userID: null, brandInfo: null };
              }
              if(this.post['tagId'] == this.postData?.ticketInfo?.tagID){
                this.post = this._ticketService.mapPostByChannel(this.postData, this._navigationService?.currentSelectedTab?.Filters?.isModifiedDate);
              }
              // this.categorymapdisplay(this.postData);
              // this.ticketshowmore();
              // this.mentionshowmore();
              this._cdr.detectChanges();
            }
          }
        }
      )
    );

    this.subs.add(
      this._ticketService.mentionTabCategoryChanges.subscribe((data) => {
        if (data) {
          if (data.postObj.ticketID == this.postData.ticketID) {
            if (data.type == 'Ticket') {
              this.postData.ticketInfo.ticketCategoryMap = data.categoryCards;
              this.postData.ticketInfo.ticketUpperCategory = data.upperCategories;
            } else {
              this.postData.categoryMap = data.categoryCards;
              this.postData.upperCategory = data.upperCategories;
            }
            this.post = this._ticketService.mapPostByChannel(data.postObj, this._navigationService?.currentSelectedTab?.Filters?.isModifiedDate);
            // this.categorymapdisplay(this.postData);
            // this.ticketshowmore();
            // this.mentionshowmore();
            this._cdr.detectChanges();
          }
        }
      })
    );

    {
      this.subs.add(
      this._ticketService.animalWildFareObs.subscribe((res)=>{
        if ((res?.guid == this.postDetailTab?.guid && res?.data?.TagID==String(this.postData?.tagID)) )
        {
          this.postData.ticketInfo.srid = res?.data?.SRID;
          this.post.srID  = res?.data?.SRID;
          this._cdr.detectChanges();
        }
      }))
    }

    // this.subs.add(
    //   this._ticketService.agentAssignToObservable.subscribe((res)=>{
    //     if(res?.tagID == this.postData?.tagID)
    //     {
    //       this.postData.ticketInfo.assignedTo = res.ticketInfo.assignedTo;
    //       this.postData.ticketInfo.assignedToTeam = res.ticketInfo.assignedToTeam;
    //       let assignToname;
    //       const assignToDetails = this._filterService.fetchedAssignTo.find((obj) => obj.agentID == this.postData.ticketInfo.assignedTo)
    //       if (this.postData.ticketInfo.assignedTo) {
    //         assignToname = this._filterService.getNameByID(
    //           this.postData.ticketInfo.assignedTo,
    //           this._filterService.fetchedAssignTo
    //         );
    //         if (assignToDetails?.agentName) {
    //           assignToname = assignToDetails?.agentName;
    //         }
    //         if (assignToDetails?.teamName) {
    //           assignToname += ' (' + assignToDetails?.teamName + ')';
    //         }
    //       } else if (assignToDetails?.teamName) {
    //         assignToname = assignToDetails?.teamName;
    //       }
    //       this.post.assignTo=assignToname;
    //       this._cdr.detectChanges();
    //     }
    //   })
    // )

    this.subs.add(
      this._ticketService.csdAssignObs.subscribe((res) => {
        if (res?.tagID == this.postData?.tagID) {
          this.postData.ticketInfo.assignedTo = res.ticketInfo.assignedTo;
          this.postData.ticketInfo.assignedToTeam = res.ticketInfo.assignedToTeam;
          this.postData.ticketInfo.escalatedTo = res.ticketInfo.assignedTo;
          this.postData.ticketInfo.escalatedToCSDTeam = res.ticketInfo.assignedToTeam;
          this.postData.ticketInfo.escalatedToBrand = res.ticketInfo.assignedTo;
          this.postData.ticketInfo.escalatedToBrandTeam = res.ticketInfo.assignedToTeam;
          let assignToname;
          const assignToDetails = this._filterService.fetchedAssignTo.find((obj) => obj.agentID == this.postData.ticketInfo.assignedTo)
          if (this.postData.ticketInfo.escalatedTo) {
            assignToname = this._filterService.getNameByID(
              this.postData.ticketInfo.escalatedTo,
              this._filterService.fetchedAssignTo
            );
            if (assignToDetails?.agentName) {
              assignToname = assignToDetails?.agentName;
            }
            if (assignToDetails?.teamName) {
              assignToname += ' (' + assignToDetails?.teamName + ')';
            }
          }
          if (this.postData.ticketInfo.escalatedToBrand) {
            assignToname = this._filterService.getNameByID(
              this.postData.ticketInfo.escalatedToBrand,
              this._filterService.fetchedAssignTo
            );
            if (assignToDetails?.agentName) {
              assignToname = assignToDetails?.agentName;
            }
            if (assignToDetails?.teamName) {
              assignToname += ' (' + assignToDetails?.teamName + ')';
            }
          }
           else if (assignToDetails?.teamName) {
            assignToname = assignToDetails?.teamName;
          }
          this.post.assignTo ? this.post.assignTo = assignToname: this.ticketHistoryData.currentassignTo = assignToname;
          if (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount) {
            this.ticketHistoryData.currentassignTo = assignToname
          }
          this._cdr.detectChanges();
        }
      })
    )

    // this.subs.add(
    //   this.sidebarService.onTicketViewChange.subscribe(view => {
    //     if (view) {
    //       this.selectedTicketView = view;
    //       this._cdr.detectChanges();
    //     }
    //   })
    // )
    if(this.postData?.channelGroup!=ChannelGroup.Email)
    {
    localStorage.getItem('selctedView') ? this.selectedEmailView = parseInt(JSON.parse(localStorage.getItem('selctedView'))):1;
   this.selectedTicketView=this.selectedEmailView
    }else{
      this.selectedEmailView = 3 
      // this.selectedTicketView = 3
    }

    if (this.hideCheckBox){
    this.ticketHistoryData.showcheckbox = false
    }

    this.IDName = `Post_${this.postData.tagID}`;

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled==1)
    {
      this.post.reach = this.postData?.mentionMetadata?.reachType==0? 'NA':this.postData.mentionMetadata.reach
      this.post.engagement = this.postData?.mentionMetadata?.engagementType==0 ?'NA' :this.postData.mentionMetadata.engagementCount
      this.post.impression = this.postData?.mentionMetadata?.reachType == 0 ? 'NA' : this.postData.mentionMetadata.impression;
      this.clickhouseEnabled = true;
    }

    this.subs.add(
      this._ticketService.customTabChange.subscribe((res) => {
        if (Object.keys(res).length > 0) {
          const showingYear = (this.post?.ticketTime?.timetoshow).split(' ')[0]; 
          const currentYear = (moment().subtract('year', 1).year()).toString();
          if (showingYear == currentYear) {
            console.log("update call", showingYear, currentYear, this._navigationService?.currentSelectedTab)
            this.post = this._ticketService.mapPostByChannel(this.postData, this.pageType == this.postType.TicketHistory ? null : this._navigationService?.currentSelectedTab?.Filters?.isModifiedDate);
          }
          this._cdr.detectChanges();
        }
      })
    )

    if (this.isPostDetailsLogView && this.ticketHistoryData.isMakerCheckerPreview && !this.showActionPerform) {
      this.showActionPerform = true;
    }

    this.subs.add(
      this._ticketService.updateBulkMentionSeenUnseen.subscribe((res) => {
        if (res?.guid == this.postDetailTab?.guid) {
          if (res?.list.some((x) => x.Tagid == this.postData.tagID)) {
            this.postData.mentionMetadata.isMarkSeen = res?.list.find((x) => x.Tagid == this.postData.tagID).Ismarkseen
            this.postData.mentionMetadata.isMarkSeen == 1 ? this.postData.mentionMetadata.unseencount = 0 : this.postData.mentionMetadata.childmentioncount;
            this.LogicAfterMarkAsSeenUnseen()
          }
          this._cdr.detectChanges();
        }
      }
      )
    )


    this.subs.add(
      this._ticketService.updateChildkMentionSeenUnseen.subscribe((res) => {
        if (!this.showParentPostHeader && this.pageType == PostsType.TicketHistory) {
          if(res?.postData)
            {
              this.postData.categoryMap = res?.postData?.categoryMap
            this.postData.upperCategory = res?.postData?.upperCategory
            }
          this.postData.mentionMetadata.isMarkSeen = res?.seenOrUnseen;
          res?.seenOrUnseen == 1 ? this.postData.mentionMetadata.unseencount = 0 : this.postData.mentionMetadata.unseencount = this.postData.mentionMetadata.childmentioncount;
          this.LogicAfterMarkAsSeenUnseen()
          this._cdr.detectChanges();

        }
      })
    )

    this.subs.add(
      this._ticketService.updateChildBulkMentionSeenUnseen.subscribe((res) => {
        if (!this.showParentPostHeader && this.pageType == PostsType.TicketHistory) {
          if (res?.list.some((x) => x.Tagid == this.postData.tagID)) {
            this.postData.mentionMetadata.isMarkSeen = res?.list.find((x) => x.Tagid == this.postData.tagID).Ismarkseen
            this.postData.mentionMetadata.isMarkSeen == 1 ? this.postData.mentionMetadata.unseencount = 0 : this.postData.mentionMetadata.childmentioncount;
            this.LogicAfterMarkAsSeenUnseen()
          }
        }
      })
    )
    
    // this.subs.add(
    //   this._postDetailService.ticketEscalateUpdate.subscribe((res) => {
    //     if (res.status) {
    //       if (res.ticketID == this.postData.ticketInfo.ticketID) {
    //         this.ticketHistoryData.isEscalateVisible = false;
    //         console.log("call")
    //       }
    //     }
    //   })
    // )

    this.subs.add(
      this._ticketService.updateMentionSeenUnseen.subscribe((res) => {
        if (res) {
          if (res?.tagId == this.postData.tagID) {
            this.postData.mentionMetadata.isMarkSeen = res?.seenOrUnseen
            res?.seenOrUnseen == 1 ? this.postData.mentionMetadata.unseencount = 0 : this.postData.mentionMetadata.unseencount = this.postData.mentionMetadata.childmentioncount;
            this.LogicAfterMarkAsSeenUnseen()
          }
          this._cdr.detectChanges();
        }
      }
      )
    )

    this.subs.add(
      this._ticketService.updateChildMentionInMentionList.subscribe((res) => {
        if (res?.tagID == this.postData.tagID) {
          this.LogicAfterMarkAsSeenUnseen()
          this._cdr.detectChanges();
        }
      })
    )

    this.subs.add(
      this._ticketService.updateMentionListSeenUnseen.subscribe((res) => {
        if (res?.tagID == this.postData.tagID) {
          if (res.seenOrUnseen) {
            this.postData.mentionMetadata.unseencount = 0
            // this.ticketHistoryData.showGroupView=false
          } else {
            this.postData.mentionMetadata.unseencount = this.postData.mentionMetadata.childmentioncount
            // this.ticketHistoryData.showGroupView = true
          }
          this.LogicAfterMarkAsSeenUnseen();
        }
        this._cdr.detectChanges()
      })
    )

    this.subs.add(
      this._ticketService.updateMentionListBasedOnParentSocialID.subscribe((res) => {
        if (res?.tagID == this.postData.socialIdForunseenCount) {
          if (res.seenOrUnseen) {
            this.postData.mentionMetadata.unseencount = 0;
            this.postData.mentionMetadata.isMarkSeen = 1
            // this.ticketHistoryData.showGroupView=false
          } else {
            this.postData.mentionMetadata.unseencount = this.postData.mentionMetadata.childmentioncount
            // this.ticketHistoryData.showGroupView = true
          }
          this.LogicAfterMarkAsSeenUnseen();
        }
        this._cdr.detectChanges()
      })
    )

    this.subs.add(
      this._ticketService.updateMentionListBasedOnParentSocialID.subscribe((res) => {
        if (res?.tagID == this.postData.socialIdForunseenCount) {
          if (res.seenOrUnseen) {
            this.postData.mentionMetadata.unseencount = 0
            // this.ticketHistoryData.showGroupView=false
          } else {
            this.postData.mentionMetadata.unseencount = this.postData.mentionMetadata.childmentioncount
            // this.ticketHistoryData.showGroupView = true
          }
          this.LogicAfterMarkAsSeenUnseen();
        }
        this._cdr.detectChanges()
      })
    )

    if(this.clickhouseEnabled)
      {
       if(this.mentionOrGroupView===AllMentionGroupView.groupView)
        {
          if(this.TicketList?.length>1)
            {
              const index = this.TicketList.findIndex((x)=>x.tagID==this.postData?.tagID)
            if (index>-1 && index<=this.TicketList?.length)
              {
              if (this.TicketList?.[index + 1]?.mentionMetadata?.childmentioncount > 0) {
                this.marginBottoom = '24px';
              } else {
                this.marginBottoom = ''
              }
              }
             
            }
        }
      }
    // this.getAuthorTicketMandatoryDetails();
    // this.handleCloseAction();

    if(this.postData?.channelGroup == ChannelGroup.Email && this.pageType== PostsType.TicketHistory)
    {
      const tagIndex = this.allMentionList?.findIndex((obj) => obj?.tagID == this.postData?.tagID);
      if (this.allMentionList?.[tagIndex - 1]?.isCommunicationLog) {
        this.logDetails = this.allMentionList?.[tagIndex - 1];
      }

        this.subs.add(
            this._replyService.selectedNoteMedia
              .pipe(filter((res) => res.section === SectionEnum.Ticket))
              .subscribe((ugcarray) => {
                if (ugcarray?.media && ugcarray?.media.length > 0) {
                  this.mediaSelectedAsync.next(ugcarray.media);
                  this.selectedNoteMedia = ugcarray.media;
                }
              })
          );
      this.showPostFooter =false
      if(this.mentionHistory)
      {
        this.ticketHistoryData.isSendEmailVisible = false;
        if(this.postData?.channelGroup ==ChannelGroup.Email)
        {
        this.showMoreMenu = false;
        }
      }
  }

    if (this.postData?.replytoEmail?.trim()?.length > 0) {
      console.log("random email", this.postData?.replytoEmail, this.postData?.ticketID)
    }
    
    this.subs.add(
      this.exotelService.outGoingConnectedCallObs.subscribe((res)=>{
        if(res?.guid == this.postDetailTab?.guid && this.postData?.tagID == res?.baseMention?.tagID)
        {
         this.openTicketDetail(true)
        }
      })
    )

    // this.subs.add(
    //   this._ticketSignalrService.exotelCallConnectedObs.subscribe((res)=>{
    //     if (res?.guid == this.postDetailTab?.guid && this.postData?.author?.socialId == res?.data?.ToNumber && this._ticketSignalrService?.exotelMultipleSignalR?.length == 2 && this._ticketSignalrService?.exotelMultipleSignalR[0] == this._ticketSignalrService?.exotelMultipleSignalR[1])
    //     {
    //       const postDetailArrowBackRef = document.getElementById('arrow_back');
    //       if(!postDetailArrowBackRef)
    //       {
    //         this.openTicketDetail(true)
    //       }
    //     }
    //   })
    // )
    this.sentimentMapping();
   
    this.subs.add(
      this._ticketService.changeUpperCategory.subscribe(res => {
        if(res){
          this.sentimentMapping();
          this._cdr.detectChanges();
          this._ticketService.changeUpperCategory.next(null);
        }
      })
    )
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }
  
  sentimentMapping(){
    if (this.post?.mentioncategories && this?.post?.mentioncategories.length) {
      const topSentiment = [...this.post.mentioncategories]
        .sort((a, b) => b.sentiment - a.sentiment)[0]?.sentiment;
      switch (topSentiment) {
        case this.getSentiment.Positive:
          this.sentimentColorClass = 'sentiment-border__positive';
          this.sentimentBackgroundColorClass = 'sentiment-background-positive';
          break;
        case this.getSentiment.Mixed:
          this.sentimentColorClass = 'sentiment-border__mixed';
          this.sentimentBackgroundColorClass = 'sentiment-background-negative';
          break;
        case this.getSentiment.Negative:
          this.sentimentColorClass = 'sentiment-border__negative';
          this.sentimentBackgroundColorClass = 'sentiment-background-negative';
          break;
        case this.getSentiment.Neutral:
          this.sentimentColorClass = 'sentiment-border__neutral';
          this.sentimentBackgroundColorClass = 'sentiment-background-neutral';
          break;
      }
    } else if (this.post?.ticketcategories && this.post?.ticketcategories.length) {
      const topSentiment = [...this.post.ticketcategories]
        .sort((a, b) => b.sentiment - a.sentiment)[0]?.sentiment;
      switch (topSentiment) {
        case this.getSentiment.Positive:
          this.sentimentColorClass = 'sentiment-border__positive';
          this.sentimentBackgroundColorClass = 'sentiment-background-positive';
          break;
        case this.getSentiment.Mixed:
          this.sentimentColorClass = 'sentiment-border__mixed';
          this.sentimentBackgroundColorClass = 'sentiment-background-negative';
          break;
        case this.getSentiment.Negative:
          this.sentimentColorClass = 'sentiment-border__negative';
          this.sentimentBackgroundColorClass = 'sentiment-background-negative';
          break;
        case this.getSentiment.Neutral:
          this.sentimentColorClass = 'sentiment-border__neutral';
          this.sentimentBackgroundColorClass = 'sentiment-background-neutral';
          break;
      }
    }
  }

  closeAlreadyOpenReplyPopupSignalChanges(data){
    if (data) {
      if (
        data?.ticketID != this.postData?.ticketID &&
        data?.tagID != this.postData?.tagID
      ) {
        if (this.postReplyBlock) {
          this.postReplyBlock = false;
          // this._cdr.detectChanges();
        }
      }
    }
  }

  ticketEscalateUpdateSignalChanges(res){
    if (res && res.status) {
      if (res.ticketID == this.postData?.ticketInfo?.ticketID) {
        this.ticketHistoryData.isEscalateVisible = false;
        console.log("call")
      }
    }
  }

  checkReplyTimeExpireSignalChanges(data){
    if (data && !this.showReply) {
      if (data.tagId == this.postData?.tagID) {
        this.checkReplyTimeExpired(data.obj);
      }
    }
  }

  emitEmailReadStatusSignalChanges(obj){
    if (obj) {
      if (obj.ticketId == this.postData?.ticketInfo?.ticketID) {
        if (obj.status) {
          this.postData.allMentionInThisTicketIsRead = true;
        }
      }
    }
  }

  agentAssignToObservableSignalChanges(res){
    if (res?.tagID == this.postData?.tagID) {
      this.postData.ticketInfo.assignedTo = res.ticketInfo.assignedTo;
      this.postData.ticketInfo.assignedToTeam = res.ticketInfo.assignedToTeam;
      let assignToname;
      const assignToDetails = this._filterService.fetchedAssignTo.find((obj) => obj.agentID == this.postData.ticketInfo.assignedTo)
      if (this.postData.ticketInfo.assignedTo) {
        assignToname = this._filterService.getNameByID(
          this.postData.ticketInfo.assignedTo,
          this._filterService.fetchedAssignTo
        );
        if (assignToDetails?.agentName) {
          assignToname = assignToDetails?.agentName;
        }
        if (assignToDetails?.teamName) {
          assignToname += ' (' + assignToDetails?.teamName + ')';
        }
      } else if (assignToDetails?.teamName) {
        assignToname = assignToDetails?.teamName;
      }
      this.post.assignTo = assignToname;
      this._cdr.detectChanges();
    }
  }

  closeReplyBoxSignalChanges(obj){
    if (obj != null) {
      this.postReplyBlock = obj;
      if (this.pageType !== PostsType.TicketHistory) {
        // this._chatBotService.chatBotHideObs.next({
        //   status: this.postReplyBlock,
        // });
        this._chatBotService.chatBotHideObsSignal.set({
          status: this.postReplyBlock,
        });
      }
        this._cdr.detectChanges();
      // this._replyService.closeReplyBox.next(null);
      this._replyService.closeReplyBoxSignal.set(null);
    }
  }

  public get getSentiment(): typeof Sentiment {
    return Sentiment;
  }

  public get postType(): typeof PostsType {
    return PostsType;
  }

  checkReplyTimeExpired(obj: ReplyTimeExpire): void {
    if (obj.baseMention.ticketID === this.postData.ticketID) {
      if (obj.status) {
        this.isReplyTimeExpired = true;
        this.replytTimeExpireMessage = obj.message;
      } else {
        this.isReplyTimeExpired = false;
        this.showReply = true;
      }
      this._cdr.detectChanges();
    }
  }

  checkReplyError(obj: ReplyTimeExpire): void {
    if (obj.baseMention.ticketID === this.postData.ticketID) {
      if (obj.status) {
        this.replyErrorFlag = true;
        this.replytTimeExpireMessage = obj.message;
        this.errorTitle = obj.title;
      } else {
        this.replyErrorFlag = false;
      }
      this._cdr.detectChanges();
    }
  }

  checkEmailReadReceiptRes(obj) {
    if (obj) {
      this.checkIfEmailIsRead(obj);
    }
  }

  checkIfEmailIsRead(obj: EmailReadReceipt): void {
    if (obj.baseMention.ticketID === this.postData.ticketID) {
      if (obj.status) {
        this.isEmailRead = true;
        // this.replytTimeExpireMessage = obj.message;
      } else {
        this.isEmailRead = false;
      }
      const findTicketIndex = this._replyService.mentionReadReceipt.findIndex(
        (obj) => obj.ticketId === this.postData.ticketID
      );
      if (findTicketIndex > -1) {
        // const findUnreadIndex =
        //   this._replyService.mentionReadReceipt[0].tagIdList.findIndex(
        //     (obj) => obj.isRead === false
        //   );
        this._replyService.mentionReadReceipt.forEach((obj) => {
          if (obj.ticketId == this.postData.ticketID) {
            if (
              obj.tagIdList.some(
                (tag) =>
                  tag.tagId === this.postData.tagID && tag.isRead == false
              )
            ) {
            } else {
              this.isEmailRead = false;
            }
          }
        });

        // if (findUnreadIndex > -1) {
        // } else {
        //   this.isEmailRead = false;
        // }
      } else {
        if (this.postData.allMentionInThisTicketIsRead) {
          this.isEmailRead = false;
        } else {
          if (this.postData.thisMentionIsRead) {
            this.isEmailRead = false;
          } else {
            this.isEmailRead = true;
          }
        }
      }
      this._cdr.detectChanges();
    }
  }
  subscribeToEvents() {
    const value = this._replyService.emitBrandMentionEmailDataSignal();
    if (value) {
      this.emitBrandMentionEmailDataChanges(value);
    }
    // this.subs.add(
    //   this._replyService.emitBrandMentionEmailData.subscribe(
    //     (brandEmailReadObj) => {
    //       if (brandEmailReadObj) {
    //         this.ShowMarkAsRead = true;
    //         if (brandEmailReadObj.isMarkAllAsRead) {
    //           this.markAllAsRead = true;
    //         } else {
    //           this.markAllAsRead = false;
    //         }

    //         //check to show which button to show
    //         if (this._replyService.mentionReadReceipt.length > 0) {
    //           const mentionReadReceipt =
    //             this._replyService.mentionReadReceipt.filter(
    //               (obj) => obj.ticketId === this.postData.ticketInfo.ticketID
    //             );
    //           if (mentionReadReceipt.length > 0) {
    //             if (mentionReadReceipt[0].tagIdList.length == 1) {
    //               if (mentionReadReceipt[0].tagIdList[0].isRead == true) {
    //                 this.ShowMarkAsRead = false;
    //               }
    //             } else {
    //               if (
    //                 mentionReadReceipt[0].tagIdList.findIndex(
    //                   (obj) => obj.isRead === false
    //                 ) > -1
    //               ) {
    //                 const currenttagIdIndex =
    //                   mentionReadReceipt[0].tagIdList.findIndex(
    //                     (obj) => obj.tagId === this.postData.tagID
    //                   );
    //                 for (
    //                   let i = 0;
    //                   i < mentionReadReceipt[0].tagIdList.length;
    //                   i++
    //                 ) {
    //                   const tagdetail = mentionReadReceipt[0].tagIdList[i];
    //                   if (!tagdetail.isRead && i > currenttagIdIndex) {
    //                     this.downarrow = true;
    //                     this.uparrow = false;
    //                     this.nextMentionIdToMove =
    //                       mentionReadReceipt[0].tagIdList[i].tagId;
    //                     break;
    //                     // this.nextMentionIdToMove =
    //                   } else if (!tagdetail.isRead && i < currenttagIdIndex) {
    //                     this.downarrow = false;
    //                     this.uparrow = true;
    //                     this.backMentionIdToMove =
    //                       mentionReadReceipt[0].tagIdList[i].tagId;
    //                     break;
    //                   }
    //                   // else{
    //                   //   this.botharrows = true;
    //                   // }
    //                 }
    //                 if (!this.uparrow && !this.downarrow) {
    //                   this.hidearrows = false;
    //                 } else {
    //                   this.hidearrows = true;
    //                 }
    //                 // this.setNextMentionIdToMove();
    //               }

    //               const currenttagIdIndex =
    //                 mentionReadReceipt[0].tagIdList.findIndex(
    //                   (obj) => obj.tagId === this.postData.tagID
    //                 );
    //               if (currenttagIdIndex > -1) {
    //                 if (
    //                   mentionReadReceipt[0].tagIdList[currenttagIdIndex]
    //                     .isRead === true
    //                 ) {
    //                   this.ShowMarkAsRead = false;
    //                 }
    //               }
    //             }
    //           }
    //         }
    //         this._cdr.detectChanges();
    //       }
    //     }
    //   )
    // );

    // this._replyService.emitEmailReadStatus.subscribe((obj) => {
    //   if (obj) {
    //     if (obj.ticketId == this.postData.ticketInfo.ticketID) {
    //       if (obj.status) {
    //         this.postData.allMentionInThisTicketIsRead = true;
    //       }
    //     }
    //   }
    // });
  }

  emitBrandMentionEmailDataChanges(brandEmailReadObj){
    if (brandEmailReadObj) {
      this.ShowMarkAsRead = true;
      if (brandEmailReadObj.isMarkAllAsRead) {
        this.markAllAsRead = true;
      } else {
        this.markAllAsRead = false;
      }

      //check to show which button to show
      if (this._replyService.mentionReadReceipt.length > 0) {
        const mentionReadReceipt =
          this._replyService.mentionReadReceipt.filter(
            (obj) => obj?.ticketId === this.postData?.ticketInfo?.ticketID
          );
        if (mentionReadReceipt.length > 0) {
          if (mentionReadReceipt[0].tagIdList.length == 1) {
            if (mentionReadReceipt[0].tagIdList[0].isRead == true) {
              this.ShowMarkAsRead = false;
            }
          } else {
            if (
              mentionReadReceipt[0].tagIdList.findIndex(
                (obj) => obj.isRead === false
              ) > -1
            ) {
              const currenttagIdIndex =
                mentionReadReceipt[0].tagIdList.findIndex(
                  (obj) => obj.tagId === this.postData?.tagID
                );
              for (
                let i = 0;
                i < mentionReadReceipt[0].tagIdList.length;
                i++
              ) {
                const tagdetail = mentionReadReceipt[0].tagIdList[i];
                if (!tagdetail.isRead && i > currenttagIdIndex) {
                  this.downarrow = true;
                  this.uparrow = false;
                  this.nextMentionIdToMove =
                    mentionReadReceipt[0].tagIdList[i].tagId;
                  break;
                  // this.nextMentionIdToMove =
                } else if (!tagdetail.isRead && i < currenttagIdIndex) {
                  this.downarrow = false;
                  this.uparrow = true;
                  this.backMentionIdToMove =
                    mentionReadReceipt[0].tagIdList[i].tagId;
                  break;
                }
                // else{
                //   this.botharrows = true;
                // }
              }
              if (!this.uparrow && !this.downarrow) {
                this.hidearrows = false;
              } else {
                this.hidearrows = true;
              }
              // this.setNextMentionIdToMove();
            }

            const currenttagIdIndex =
              mentionReadReceipt[0].tagIdList.findIndex(
                (obj) => obj.tagId === this.postData?.tagID
              );
            if (currenttagIdIndex > -1) {
              if (
                mentionReadReceipt[0].tagIdList[currenttagIdIndex]
                  .isRead === true
              ) {
                this.ShowMarkAsRead = false;
              }
            }
          }
        }
      }
      // this._cdr.detectChanges();
    }
  }

  setNextMentionIdToMove(): void {
    const mentionReadReceipt = this._replyService.mentionReadReceipt.filter(
      (obj) => obj.ticketId === this.postData?.ticketInfo?.ticketID
    );
    const tagIdList = mentionReadReceipt[0].tagIdList;

    for (let i = 0; i < mentionReadReceipt[0].tagIdList.length; i++) {
      if (this.uparrow) {
        if (mentionReadReceipt[0].tagIdList[i].tagId === this.postData?.tagID) {
          this.backMentionIdToMove =
            mentionReadReceipt[0].tagIdList[i - 1].tagId;
        }
      } else if (this.downarrow) {
        if (mentionReadReceipt[0].tagIdList[i].tagId === this.postData?.tagID) {
          this.nextMentionIdToMove =
            mentionReadReceipt[0].tagIdList[i + 1].tagId;
        }
      } else if (this.botharrows) {
        if (mentionReadReceipt[0].tagIdList[i].tagId === this.postData?.tagID) {
          this.nextMentionIdToMove =
            mentionReadReceipt[0].tagIdList[i + 1].tagId;
          this.backMentionIdToMove =
            mentionReadReceipt[0].tagIdList[i - 1].tagId;
        }
      }
      this._cdr.detectChanges();
    }
  }

  markAsRead(markall = false): void {
    let obj: any = {};
    if (!markall) {
      obj = {
        brandInfo: {
          brandID: this.postData.brandInfo.brandID,
          brandName: this.postData.brandInfo.brandName,
        },
        TicketTagIds: [
          {
            CaseID: this.postData.ticketInfo.ticketID,
            TagID: this.postData.tagID,
          },
        ],
      };
    } else {
      const mentionReadReceipt = this._replyService.mentionReadReceipt.filter(
        (obj) => obj.ticketId === this.postData.ticketInfo.ticketID
      );
      if (mentionReadReceipt.length > 0) {
        const tagidlist = [];
        for (const tagid of mentionReadReceipt[0].tagIdList) {
          if (!tagid.isRead) {
            tagidlist.push({
              CaseID: this.postData.ticketInfo.ticketID,
              TagID: tagid.tagId,
            });
          }
        }
        obj = {
          brandInfo: {
            brandID: this.postData.brandInfo.brandID,
            brandName: this.postData.brandInfo.brandName,
          },
          TicketTagIds: tagidlist,
        };
      }
    }

    this.markAsseenApiRes= this._replyService.MarkMentionAsRead(obj).subscribe((resp) => {
      if (resp.success) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('mention-marked-as-read'),
          },
        });
        this.ShowMarkAsRead = false;
        this.postData.thisMentionIsRead = true;
        let ticketIDNotFound = true;
        if (this._replyService.mentionReadReceipt.length > 0) {
          for (
            let i = 0;
            i < this._replyService.mentionReadReceipt.length;
            i++
          ) {
            if (
              this._replyService.mentionReadReceipt[i].ticketId ===
              this.postData.ticketInfo.ticketID
            ) {
              for (
                let j = 0;
                j < this._replyService.mentionReadReceipt[i].tagIdList.length;
                j++
              ) {
                if (
                  obj.TicketTagIds.findIndex(
                    (obj) =>
                      obj.TagID ===
                      this._replyService.mentionReadReceipt[i].tagIdList[j]
                        .tagId
                  ) > -1
                ) {
                  this._replyService.mentionReadReceipt[i].tagIdList[j].isRead =
                    true;
                  ticketIDNotFound = false;
                }
              }

              const findUnreadIndex = this._replyService.mentionReadReceipt[
                i
              ].tagIdList.findIndex((obj) => obj.isRead === false);
              if (findUnreadIndex > -1) {
                this.isEmailRead = false;
              } else {
                this._replyService.emitEmailReadStatusSignal.set({
                  ticketId: this.postData.ticketInfo.ticketID,
                  status: true,
                });
                this.isEmailRead = false;
              }
            }
          }
          if (ticketIDNotFound) {
            this._replyService.emitEmailReadStatusSignal.set({
              ticketId: this.postData.ticketInfo.ticketID,
              status: true,
            });
            this.isEmailRead = false;
          }
        }
        this._cdr.detectChanges();
      }
    });
  }

  markAsReadEventRes(flag: boolean) {
    if (flag != null) {
      this.isEmailRead = false;
      this._cdr.detectChanges();
    }
  }

  moveToNextMention(mentionId): void {
    // this._replyService.redirectToTagId.next(Number(mentionId));
    this._replyService.redirectToTagIdSignal.set(Number(mentionId));
  }

  executeSignalCall(signalObj: PostSignalR): void {
    if (signalObj.signalId === TicketSignalEnum.TicketNoteAdd) {
      this.post.note = signalObj.message.Note;
      this._cdr.detectChanges();
    }
  }

  openCategoryDialog(event): void {
    this.postData.categoryMapText = null;
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    this._postDetailService.categoryType = event;
    this.dialog.open(CategoryFilterComponent, {
      width: '73vw',
      disableClose: false,
    });
  }

  // triggered from child
  replyPost(): void {
    this.showReply = false;
    if (this.postData.replyInitiated) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this._translate.instant('previous-request-pending'),
        },
      });
      return;
    }
    if (this._postDetailService.postObj) {
      this.postData.allMentionInThisTicketIsRead =
        this._postDetailService.postObj.allMentionInThisTicketIsRead;
    }
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    // const replyPostRef = this._bottomSheet.open(PostReplyComponent, {
    //   ariaLabel: 'Reply',
    //   panelClass: 'post-reply__wrapper',
    //   backdropClass: 'no-blur',
    // });
    const currentreplyBox = this.postReplyBlock;
    this.postReplyBlock = false;
    this.replyInputParams = {};
    this.replyInputParams.replySection = true;
    if (this.postData.channelType == ChannelType.Email) {
      this.replyInputParams.replyEmailSection = true;
    }
    this.replyInputParams.postObj = this.postData;
    if (!this.mentionHistory) {
      // this._ngZone.run(() => {
      this.postReplyBlock = true;
      // });
    }
    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({
      //   status: this.postReplyBlock,
      // });
      this._chatBotService.chatBotHideObsSignal.set({
        status: this.postReplyBlock,
      });
    }
    // this._replyService.checkReplyInputParams.next(this.replyInputParams);
    this._replyService.checkReplyInputParamsSignal.set(this.replyInputParams);
    this._cdr.detectChanges();
  }

  closeReplyBox(): void {
    this.postReplyBlock = !this.postReplyBlock;
    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({ status: this.postReplyBlock });
      this._chatBotService.chatBotHideObsSignal.set({
        status: this.postReplyBlock,
      });
    }
    this._cdr.detectChanges();
  }

  // triggered from child
  sendPostEmail(forwardEmail?: boolean, newThreadEmail?:boolean): void {
    this.newThreadEmail = newThreadEmail == true || newThreadEmail == false ? newThreadEmail : this.newThreadEmail;
    this._postDetailService.postObj = this.postData;
    const currentreplyBox = this.postReplyBlock;
    this.postReplyBlock = false;

    this.replyInputParams = {};
    this.replyInputParams.onlySendMail = true;
    this.replyInputParams.forwardEmail = forwardEmail;
    this.replyInputParams.newThreadEmail = this.newThreadEmail;
    this.replyInputParams.postObj = this.postData;
    this.checkReplyParamsSignalTimeout= setTimeout(() => {
      this.postReplyBlock = true;
      // this._replyService.checkReplyInputParams.next(this.replyInputParams);
      this._replyService.checkReplyInputParamsSignal.set(this.replyInputParams);
      this._cdr.detectChanges();
    }, 0);

    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({ status: this.postReplyBlock });
      this._chatBotService.chatBotHideObsSignal.set({
        status: this.postReplyBlock,
      });
    }
    this.showReply = true;
    console.log("testing", `Post_${this.postData?.contentID}`);
    
    this._cdr.detectChanges();
  }

  // triggered from child
  attachTicket(): void {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.attachTickets});
    if (this.postData.replyInitiated) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('previous-request-pending'),
        },
      });
      return;
    }

    this._postDetailService.postObj = this.postData;

    const brandObj = {
      BrandName: this.postData.brandInfo.brandName,
      BrandId: this.postData.brandInfo.brandID,
    };

    const keyObj = {
      BrandInfo: brandObj,
      AuthorId: this.postData.author.socialId,
      ChannelGroup: this.postData.channelGroup,
    };

   this.getAuthorTicketsApiRes= this._ticketService.getAuthorTickets(keyObj).subscribe((data) => {
      if (data.success) {
        const ticketlist = data.data.find((obj) => Number(obj.ticketId) !== Number(this.postData.ticketInfo.ticketID));
        if (ticketlist) {
          const replyPostRef = this._bottomSheet.open(AttachTicketComponent, {
            ariaLabel: 'Attach Ticket',
            panelClass: 'post-reply__wrapper',
            backdropClass: 'no-blur',
            data: { CurrentPost: this.postData },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this._translate.instant('no-tickets-to-attach'),
            },
          });
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this._translate.instant('some-error-occurred'),
          },
        });
      }
    });
  }

  replyApproved(): void {
    const source = this._mapLocobuzz.mapMention(this.postData);
    const sourceobj = {
      Source: source,
      EscalationNote: '',
      ActionTaken: 0,
    };
    this.replyApprovedApiRes = this._replyService.ReplyApproved(sourceobj).subscribe(() => {
      // console.log('reply approved successfull ', data);
      // this._filterService.currentBrandSource.next(true);
      this._filterService.currentBrandSourceSignal.set(true);

      // this.dialogRef.close(true);
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: this._translate.instant('reply-approved-success'),
        },
      });
      // this.zone.run(() => {
    });
  }

  replyRejected(note?: string): void {
    if (note.trim() !== '') {
      const source = this._mapLocobuzz.mapMention(this.postData);

      const rejectnote = {
        $type:
          'LocobuzzNG.Entities.Classes.CommunicationLog, LocobuzzNG.Entities',
        Note: note ? note : '',
      };

      const sourceObj = {
        Source: source,
        RejectNote: rejectnote,
        ActionTaken: ActionTaken.Locobuzz,
      };

      this.replyRejectedApiRes= this._replyService.ReplyRejected(sourceObj).subscribe((data) => {
        if(data?.success){
          // this._filterService.currentBrandSource.next(true);
      this._filterService.currentBrandSourceSignal.set(true);

          // this.dialogRef.close(true);
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('reply-rejected-success'),
            },
          });
        }
        else{
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data?.message : this._translate.instant('some-error-occurred'),
            },
          });
        }
      });
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('note-required'),
        },
      });
    }
  }

  // triggered from child
  replyModified(): void {
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    // const replyPostRef = this._bottomSheet.open(PostReplyComponent, {
    //   ariaLabel: 'Reply',
    //   panelClass: 'post-reply__wrapper',
    //   backdropClass: 'no-blur',
    //   data: { makerchticketId: +this.postData.ticketInfo.ticketID },
    // });
    this.replyInputParams = {};
    this.replyInputParams.makerchticketId = +this.postData.ticketInfo.ticketID;
    this.replyInputParams.postObj = this.postData;
    // this._replyService.checkReplyInputParams.next(this.replyInputParams);
    this._replyService.checkReplyInputParamsSignal.set(this.replyInputParams);
    this.postReplyBlock = !this.postReplyBlock;
    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({ status: this.postReplyBlock });
      this._chatBotService.chatBotHideObsSignal.set({
        status: this.postReplyBlock,
      });
    }
    this._cdr.detectChanges();
  }

  // triggered from child
  replyEscalate(srCreatedFlag=false): void {
    if (this.postData.replyInitiated) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('previous-request-pending'),
        },
      });
      return;
    }
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    // const replyPostRef = this._bottomSheet.open(PostReplyComponent, {
    //   ariaLabel: 'Reply',
    //   panelClass: 'post-reply__wrapper',
    //   backdropClass: 'no-blur',
    //   data: { onlyEscalation: true },
    // });
    this.replyInputParams = {};
    this.replyInputParams.postObj = this.postData;
    this.replyInputParams.onlyEscalation = true;
    this.replyInputParams.srCreated = srCreatedFlag?true:false;
    this.clearPostReplySetTimeout =setTimeout(() => {
      this.postReplyBlock = true;
      // this._replyService.checkReplyInputParams.next(this.replyInputParams);
      this._replyService.checkReplyInputParamsSignal.set(this.replyInputParams);
      this._cdr.detectChanges();
      console.log('setTimeout called');
    }, 10);

    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({
      //   status: this.postReplyBlock,
      //   pageType: this.pageType,
      // });
      this._chatBotService.chatBotHideObsSignal.set({
        status: this.postReplyBlock,
        pageType: this.pageType,
      });
    }
    this._cdr.detectChanges();
  }

  // triggered from child
  ssreLiveRightVerified(): void {
    const source = this._mapLocobuzz.mapMention(this.postData);
    source.ticketInfoSsre.ssreMode = SSREMode.Live;
    source.ticketInfoSsre.ssreIntent = SsreIntent.Right;
    this.ssreLiveRightVerifiedApiRes = this._replyService.SSRELiveRightVerified(source).subscribe((data) => {
      if (data.success) {
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);

        this.postData.ticketInfoSsre.ssreReplyVerifiedOrRejectedBy =
          this.currentUser.data.user.firstName +
          ' ' +
          this.currentUser.data.user.lastName;
        this.ticketHistoryData.isSSREVerified = true;
        this.ticketHistoryData.isLiveSSRE = false;
        // this.dialogRef.close(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: `${ this.ticketHistoryData?.isWorkflowEnabled ? 'Workflow ' : 'SSRE ' } Reply verified successfully`,
          },
        });
        this._cdr.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this._translate.instant('some-error-occurred-verify'),
          },
        });
      }
      // this.zone.run(() => {
    });
  }

  private ssreLiveWrongKeep(): void {
    const source = this._mapLocobuzz.mapMention(this.postData);
    source.ticketInfoSsre.ssreMode = SSREMode.Live;
    source.ticketInfoSsre.ssreIntent = SsreIntent.Wrong;

    const keyObj = {
      Source: source,
      ActionTaken: ActionTaken.SSRE,
    };
   this.ssrLiveWrongKeepApiRes= this._replyService.ssreLiveWrongKeep(keyObj).subscribe((data) => {
      // console.log('reply approved successfull ', data);
      if (data.success) {
        this.ticketHistoryData.isSSREPreview = false;
        // this._filterService.currentBrandSource.next(true);
      this._filterService.currentBrandSourceSignal.set(true);

        // this.dialogRef.close(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('operation-performed-success'),
          },
        });
        this._cdr.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this._translate.instant('error-occurred-operation'),
          },
        });
      }
      // this.zone.run(() => {
    });
  }

  private ssreLiveWrongDelete(): void {
    const source = this._mapLocobuzz.mapMention(this.postData);
    source.ticketInfoSsre.ssreMode = SSREMode.Live;
    source.ticketInfoSsre.ssreIntent = SsreIntent.Wrong;
    source.socialID = source.ticketInfoSsre.ssreReply.replyresponseid;
    const keyObj = {
      Source: source,
      AccountId: 0,
      AccountSocialId: source.ticketInfoSsre.ssreReply.authorid,
      ActionTaken: ActionTaken.SSRE,
    };
   this.ssreLiveWrongDeleteApiRes = this._replyService.ssreLiveWrongDelete(keyObj).subscribe(() => {
      // console.log('reply approved successfull ', data);
      // this._filterService.currentBrandSource.next(true);
      this._filterService.currentBrandSourceSignal.set(true);

      // this.dialogRef.close(true);
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: this._translate.instant('reply-approved-success'),
        },
      });
      // this.zone.run(() => {
    });
  }

  // triggered from child
  openTicketDetail(isVoip = false): void {
    if (isVoip) {
      // this._ticketService.openCallDetailWindow.next(true);
      this._ticketService.openCallDetailWindowSignal.set(true);
      this.postReplyBlock = false;
      if (this._postDetailService.postDetailPage) {
        return;
      }
    } else {
      // this._ticketService.openCallDetailWindow.next(false);
      this._ticketService.openCallDetailWindowSignal.set(false);
    }
    this._ticketService.bulkMentionChecked = [];
    this._ticketService.selectedPostList = [];
    this._ticketService.postSelectTriggerSignal.set(
      this._ticketService.selectedPostList.length
    );
    this._postDetailService.postObj = this.postData;
    this._postDetailService.startIndex = this.startIndex;
    this._postDetailService.endIndex = this.endIndex;

    this._postDetailService.pagetype = this.pageType;
    this._postDetailService.ticketOpenDetail = this.postData;
    this._postDetailService.autoCloseWindow = this.autoCloseWindow;
    /* this._postDetailService.currentPostObject.next(
      this.postData.ticketInfo.ticketID
    ); */
    this._postDetailService.currentPostObjectSignal.set(
      this.postData.ticketInfo.ticketID
    );
    if (this.postData.channelGroup === ChannelGroup.GooglePlayStore) {
      this._postDetailService.playstoreurl = this.postData.url;
    }
    // this._postDetailService.isReplyVisibleCheck.next(this.ticketHistoryData);
    this._postDetailService.isReplyVisibleCheckSignal.set(this.ticketHistoryData);
    this._postDetailService.autoCloseWindow=this.autoCloseWindow;
    this._postDetailService.selectedTicketType = this._navigationService.getFilterJsonBasedOnTabGUID(this._navigationService.currentSelectedTab.guid).ticketType[0];
    // console.log(this._postDetailService.postObj);
    // const dialogRef = this.dialog.open(PostDetailComponent, {
    //   disableClose: true,
    //   autoFocus: false,
    //   data: { replyVisible: this.ticketHistoryData.isReplyVisible },
    //   panelClass: ['full-screen-modal'],
    // });

    // dialogRef.afterClosed().subscribe((result) => {
    //   if (this.postData.allMentionInThisTicketIsRead) {
    //     this.isEmailRead = false;
    //   }
    // });
    if (this.postDetailTab?.guid)
    {
    this._ticketService.postDetailWindowTrigger({
      replyVisible: this.ticketHistoryData.isReplyVisible,
      openState: true,
      guid: this.postDetailTab.guid,
    });
  }
    // this._chatBotService.chatPosition.next({
    //   openPostDetailWindowStatus: true,
    // });
    this._chatBotService.chatPositionSignal.set({
      openPostDetailWindowStatus: true,
    })
    console.log(
      `emit from PostComponent =>  openTicketDetail() => line:1071 . Checks: openPostDetailWindowStatus always true .`
    );
    this.subs.add(
      this._ticketService.openPostDetailWindow.subscribe((response) => {
        if (response && !response.openState) {
          if (this.postData.allMentionInThisTicketIsRead) {
            this.isEmailRead = false;
          }
        }
      })
    );
    if(!this.postData.isRead) {
      // this.postData.isRead = true;
     (this.postDetailTab?.guid)? this._ticketService.onHoldUnseenCountSignal.set(this.postDetailTab.guid):'';
    }
    this._ticketService.emailPopUpViewObs.next({ status: true, isOpen: false, data: null });
    this._postDetailService.emailTicketAttachmentMedia = []
    this._postDetailService.emailIdsInSameThread =[]
    if (isVoip)
    {
      this._ticketSignalrService.exotelMultipleSignalR = []
    }
    this._postDetailService.voiceTagId =null;
    if(this.ozontelFlag)
      {
        this.postDetailEvent.emit({action:'Open'})
      }
  }
  openTicketDetailVoip(mention): void {
    this._postDetailService.postObj = mention;
    this._postDetailService.pagetype = PostsType.TicketHistory;
    this._ticketService.postDetailWindowTrigger({
      replyVisible: false,
      openState: true,
      guid: this.postDetailTab.guid,
    });
  }

  // triggered from child
  openTicketDetailInNewTab(): void {
    this._postDetailService.postObj = this.postData;
    this._postDetailService.ticketOpenDetail = this.postData;
    this._postDetailService.refreshNewTab = false;
    this._postDetailService.openInNewTab = true;
    /* this._postDetailService.currentPostObject.next(
      this.postData.ticketInfo.ticketID
    ); */
    this._postDetailService.currentPostObjectSignal.set(
      this.postData.ticketInfo.ticketID
    );
    const tab: Tab = {};
    tab.tabName = this.postData.author.name;
    // const filterObj = this._filterService.getGenericFilter();
    const filterObj = this._filterService.getGenericFilterByTab(
      this._navigationService.currentSelectedTab.guid
    );
    const brands = [];
    brands.push(this.postData.brandInfo);
    filterObj.brands = brands;
    filterObj.simpleSearch = String(this.postData.ticketInfo.ticketID);
    filterObj.postsType = PostsType.TicketHistory;
    tab.tabDescription = `Ticket Detail - ${this.postData.ticketInfo.ticketID}`;
    tab.Filters = filterObj;
    this._filterGroupService.saveNewTab(tab).subscribe((response) => {
      if (response.success) {
        this._tabService.OpenNewTab(response.tab);
      }
    });
  }

  // triggered when init
  private mapwithRespectiveObject(mention: BaseMention): void {
    if (mention.attachmentMetadata) {
      if (mention.attachmentMetadata.mediaContents) {
        const ReplaceTextImages: string = 'https://images.locobuzz.com/';
        const ReplaceText: string =
          'https://s3.amazonaws.com/locobuzz.socialimages/';
        mention.attachmentMetadata.mediaContents.forEach((obj) => {
          obj.thumbUrl = obj.thumbUrl
            ? obj.thumbUrl.replace(ReplaceText, ReplaceTextImages)
            : obj.thumbUrl;
          obj.mediaUrl = obj.mediaUrl
            ? obj.mediaUrl.replace(ReplaceText, ReplaceTextImages)
            : obj.mediaUrl;
        });
      }
    }

    this.brandList = this._filterService.fetchedBrandData;
    this._footericonService.SetDefaultTicketHistoryData(
      this.ticketHistoryData,
      this.currentUser
    );
    if (this.brandList) {
      const currentBrandObj = this.brandList.filter((obj) => {
        return +obj.brandID === +mention.brandInfo.brandID;
      });
      this.currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;

      if (this.currentBrand) {
        mention.brandInfo.isEscalatePermissionWorkFlowEnabled = this.currentBrand?.isEscalatePermissionWorkFlowEnabled || false;
        this.ticketHistoryData = this._brandsettingService.GetBrandSettings(
          this.currentBrand,
          this.ticketHistoryData
        );
        this.ticketHistoryData = this.workflowAllConditionHandle(this.currentBrand,this.ticketHistoryData)
      }
   
      this.isTicketDispositionFeatureEnabled = this.currentBrand?.isTicketDispositionFeatureEnabled;
      this.isAITicketTagEnabled = this.currentBrand?.aiTagEnabled;

      this.ticketHistoryData = this._footericonService.SetUserRole(
        this.pageType,
        this.ticketHistoryData,
        this.currentUser,
        mention,
        this.currentBrand
      );

      this.ticketHistoryData = this._footericonService.SetFooterIcons(
        this.ticketHistoryData,
        this.currentUser,
        mention,
        this.pageType,
        this.brandList.length,
        this.parentPostFlag,
        this.currentUser,
        this.mentionHistoryForSubject,
        this.mentionOrGroupView,
        this.showParentPostHeader
      );

      this.ticketHistoryData =
        this._footericonService.SetMakerCheckerandSSREIcons(
          this.ticketHistoryData,
          this.currentUser,
          mention,
          this.MediaUrl,
          this.isPostDetailsLogView
        );

      this.ticketHistoryData = this._footericonService.SetMentionID(
        this.pageType,
        this.ticketHistoryData,
        mention,
        this.currentBrand
      );

      this.ticketHistoryData = this._footericonService.SetDeleteMention(
        this.currentUser,
        this.pageType,
        this.ticketHistoryData,
        mention
      );

      this.ticketHistoryData = this._footericonService.setLanguageDetected(
        this.pageType,
        this.ticketHistoryData,
        mention
      );

      if (+mention.inReplyToUserID === -3) {
        mention.ticketInfo.replyUserName = 'SSRE';
      }
    }

    this.ticketHistoryData = this._footericonService.SetTicketOrMentionIcon(
      this.currentUser,
      this.pageType,
      this.ticketHistoryData,
      mention
    );

    this.ticketHistoryData = this._footericonService.SetPriorityIcon(
      this.pageType,
      this.ticketHistoryData,
      mention
    );

    this.ticketHistoryData.channelTypeIcon =
      this._footericonService.getChannelCustomeIcon(mention);

    this.ticketHistoryData = this._footericonService.SetBulkCheckbox(
      this.pageType,
      this.currentUser,
      this.ticketHistoryData,
      mention,
      this.parentPostFlag
    );

    this.ticketHistoryData = this._footericonService.SetTicketStatusandAssignTo(
      this.currentBrand,
      this.currentUser,
      this.ticketHistoryData,
      mention
    );

    this.ticketHistoryData = this._footericonService.SetChannelWiseProperty(
      this.ticketHistoryData,
      mention
    );
    if (this.postDetailTab)
    {
    this.searchedText = this._navigationService.getFilterJsonBasedOnTabGUID(
      this.postDetailTab?.tab?.guid
    )?.simpleSearch;
    }

    this.ticketHistoryData = this._footericonService.SetTicketDescription(
      this.currentUser,
      this.ticketHistoryData,
      mention,
      this.pageType,
      this.searchedText
    );

    this.ticketHistoryData = this._footericonService.setReplyHoverIcon(
      this.ticketHistoryData,
      mention
    );

    if (this.pageType === PostsType.TicketHistory) {
      this.ticketHistoryData =
        this._footericonService.setConditionsFromCommunicationLog(
          this.currentUser,
          this.ticketHistoryData,
          this.postData
        );
    }

    if (this.mentionHistory) {
      this._footericonService.SetDefaultTicketHistoryData(
        this.ticketHistoryData,
        this.currentUser
      );
      this.ticketHistoryData = this._footericonService.SetFooterIcons(
        this.ticketHistoryData,
        this.currentUser,
        mention,
        this.pageType,
        this.brandList.length,
        this.parentPostFlag,
        this.currentUser,
        this.mentionHistoryForSubject
      );
      this.ticketHistoryData.communicationLogProperty.likeEnabled = false;
      this.ticketHistoryData.isDeleteFromLocobuzz = true;
    }

    const postCRMdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postData.brandInfo.brandID
    );
    if (postCRMdata.crmActive) {
      this.ticketHistoryData = this._footericonService.SetCRMButton(
        postCRMdata,
        this.currentUser,
        this.ticketHistoryData,
        mention,
        this.pageType
      );
    }

    // Media Content for twitter Channels

    this.ticketHistoryData = this._footericonService.SetMedia(
      this.ticketHistoryData,
      mention,
      this.MediaUrl
    );

    this.ticketHistoryData = this._footericonService.SetNote(
      this.currentUser,
      this.ticketHistoryData,
      mention,
      this.MediaUrl
    );
    this.ticketHistoryData = this._footericonService.setDeletedTicketIcon(
      this.ticketHistoryData,
      mention
    );

    this.post = this._footericonService.setAuthorName(this.post, mention,this.currentUser);

    this.ticketHistoryData =
      this._footericonService.setFooterIconsForParentPost(
        this.ticketHistoryData,
        this.parentPostFlag
      );

    if (mention.channelGroup == ChannelGroup.Voice) {
      this.ticketHistoryData = this._footericonService.setVoipIcons(
        this.currentUser,
        this.pageType,
        this.ticketHistoryData,
        mention
      );
    }

    if (this.parentPostFlag) {
      if (this.postData.ticketID == 0) {
        this.ticketHistoryData.isDirectCloseVisible = false;
      }
    }

    this.ticketHistoryData.isReadBy = mention.isRead ? mention.isRead : false;
    if (mention.readBy && this._filterService?.fetchedAssignTo) {
            const readbyAgent = this._filterService.fetchedAssignTo.find(
        (obj) => obj.agentID === mention.readBy
      );
      if (readbyAgent) {
        this.ticketHistoryData.readBy = `${this._translate.instant('Seen-By')}- ${readbyAgent.agentName }`
      }
    }
    
    if(this.mentionOrGroupView==AllMentionGroupView.groupView)
      {
      this.ticketHistoryData.isReadBy = mention.mentionMetadata.isMarkSeen == 0 ? false : (mention.mentionMetadata.isMarkSeen == 1 && mention.mentionMetadata.unseencount >0)?false:true;
      this.ticketHistoryData.readBy = `${this._translate.instant('Seen-By')}- ${mention.mentionMetadata.mark_seen_by}`;
      }
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == String(this.postData.brandInfo.brandID)
    );
    this._footericonService.setEmailWhitelist(brandInfo,this.ticketHistoryData);
  }

  // triggered from child
  assignTicket(): void {
    this._postDetailService.postObj = this.postData;
    this._postAssignToService.getAssignedUsersList(
      this.currentUser,
      this.postData.makerCheckerMetadata.workflowStatus
    );
    this._postDetailService.isBulk = false;
    this.dialog.open(PostAssigntoComponent, {
      autoFocus: false,
      width: '650px',
    });
  }

  // triggered from child
  postSelect(checked, id): void {
    if (checked) {
      const obj: BulkMentionChecked = {
        guid: this._navigationService.currentSelectedTab.guid,
        mention: this.postData,
      };

      this._ticketService.bulkMentionChecked.push(obj);
    } else {
      const mentionIndex = this._ticketService.bulkMentionChecked.findIndex(
        (obj) => obj.mention.tagID === this.postData.tagID
      );
      if (mentionIndex > -1) {
        this._ticketService.bulkMentionChecked.splice(mentionIndex, 1);
      }
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
        
        this._replyService.bulkActionButtons.btnbulkreplyapproved = true;
        this._replyService.bulkActionButtons.btnbulkreplyrejected = true;

        if(this.currentUser.data.user.role === UserRoleEnum.Agent){  
          this._replyService.bulkActionButtons.btnbulkreplyapproved = false;
          this._replyService.bulkActionButtons.btnbulkreplyrejected = false;
        }
        // show makerchecker approve and reject
        
      } 
      else {
        // hide makerchecker approve/reject
        this._replyService.bulkActionButtons.btnbulkreplyapproved = false;
        this._replyService.bulkActionButtons.btnbulkreplyrejected = false;
      }
    } else {
    }
    
    if (this.pageType === PostsType.Tickets) {
      this._replyService.ShowHideButtonsFromTicketStatus(this.currentUser);
      this._replyService.bulkActionButtons.btncreatesingleticket = false;
      this._replyService.bulkActionButtons.btnattachticketbulk = false;
    } else if (this.pageType === PostsType.Mentions) {
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
        
        const ActionButton = this.currentUser.data.user.actionButton;
        if (ActionButton.deleteSocialEnabled) {
          if (
              // checkedticket.mention.channelType === ChannelType.FBPageUser ||
              checkedticket.mention.channelType === ChannelType.FBComments 
              // ||
              // checkedticket.mention.channelType === ChannelType.BrandTweets ||
              // checkedticket.mention.channelType === ChannelType.DirectMessages ||
              // checkedticket.mention.channelType === ChannelType.YouTubePosts ||
              // checkedticket.mention.channelType === ChannelType.YouTubeComments
              // || checkedticket.mention.channelType === ChannelType.InstagramComments
            
          ) {
            // if (
            //   checkedticket.mention.channelType === ChannelType.YouTubePosts ||
            //   checkedticket.mention.channelType === ChannelType.YouTubeComments
            //   || checkedticket.mention.channelType === ChannelType.InstagramComments
            // ) {
            //   if (
            //     checkedticket.mention.channelType === ChannelType.InstagramComments &&
            //     checkedticket.mention.instagramPostType === 1
            //   ) {
            //     checkedticket.mention.isDeleteFromChannel = true;
            //   } else if (checkedticket.mention.isBrandPost) {
            //     checkedticket.mention.isDeleteFromChannel = true;
            //   }
            // } else {
              checkedticket.mention.isDeleteFromChannel = true;
            // }
          }


          // if ((checkedticket.mention.channelType === ChannelType.FBPageUser || checkedticket.mention.channelType === ChannelType.DirectMessages) && !checkedticket.mention.isBrandPost) {
          //   checkedticket.mention.isDeleteFromChannel = false
          // }
        }
      }
      if (isbrandpost.length > 0) {
        this._replyService.bulkActionButtons.btnbulkdirectclose = true;
      }
      this._replyService.bulkActionButtons.btncreatesingleticket = false;
      this._replyService.bulkActionButtons.btnattachticketbulk = false;
    } else if (this.pageType === PostsType.TicketHistory) {
      this._replyService.bulkActionButtons = {};
      this._replyService.TagTicketCheckbox(this.currentUser);
    }

    /* for user approval pending tickets action hide for agent role */
    if (this.currentUser?.data?.user?.role === UserRoleEnum.Agent) {
      const selectTickets = this._ticketService.bulkMentionChecked.filter((obj) => obj?.guid === this._navigationService?.currentSelectedTab?.guid);
      const approvalPendingTickets = selectTickets.filter((obj) => obj?.mention?.makerCheckerMetadata?.workflowStatus === LogStatus.ReplySentForApproval);
      const ticketBrand = this._filterService.fetchedBrandData.find((brand: BrandList) => +brand.brandID === selectTickets[0]?.mention.brandInfo.brandID);
      if (ticketBrand.isEnableReplyApprovalWorkFlow && approvalPendingTickets.length > 0) {
        this._replyService.bulkActionButtons.btnbulkescalae = false;
        this._replyService.bulkActionButtons.btnbulkassign = false;
        this._replyService.bulkActionButtons.btnattachticketbulk = false;
        this._replyService.bulkActionButtons.btnbulkreopen = false;
        this._replyService.bulkActionButtons.btnbulkapprove = false;
        this._replyService.bulkActionButtons.btnbulkreject = false; 
        this._replyService.bulkActionButtons.btncreatesingleticket = false; 
        this._replyService.bulkActionButtons.btnbulkdelete = false;

      }
    }
    /* for user approval pending tickets action hide for agent role */

    this.postSelectEvent.emit([checked, id]);
  }

  // triggered from child
  ssreLiveWrongPopupLogic(): void {
    let message = `By choosing to the delete action, please note that the reply to customers previously published by the SSRE will also be erased from your configured platforms as well.`;

    if (
      this.ticketHistoryData.deleteSocialEnabled &&
      (this.postData.channelType === ChannelType.FBPageUser ||
        this.postData.channelType === ChannelType.FBComments ||
        this.postData.channelType === ChannelType.BrandTweets ||
        this.postData.channelType === ChannelType.YouTubePosts ||
        this.postData.channelType === ChannelType.YouTubeComments ||
        (this.postData.channelType === ChannelType.InstagramComments &&
          this.postData.instagramPostType === 1))
    ) {
      const dialogData = new AlertDialogModel(
        `Do you want to delete the  ${this.ticketHistoryData?.isWorkflowEnabled ? 'Workflow':'SSRE'} reply?`,
        message,
        `Keep ${this.ticketHistoryData?.isWorkflowEnabled ? 'Workflow':'SSRE'} Reply`,
        `Delete ${this.ticketHistoryData?.isWorkflowEnabled ? 'Workflow':'SSRE'} Reply`
      );
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this.ssreLiveWrongKeep();
        } else {
          this.ssreLiveWrongDelete();
        }
      });
    } else {
      message = '';
      const dialogData = new AlertDialogModel(
        `You don't have an access to delete the reply!`,
        message,
        'Continue'
      );
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this.ssreLiveWrongKeep();
        } else {
        }
      });
    }
  }

  // triggered from child
  closeThisTicket(note?, dispositionFlag = false): void {
    if (this.dispositionDetails && this.dispositionDetails?.NoteAttachments) {
      this._replyService.selectedNoteMediaVal = this.dispositionDetails?.NoteAttachments;
    }
    const performActionObj = this._replyService.BuildReply(
      this.postData,
      ActionStatusEnum.DirectClose,
      note
    );
    if (this.dispositionDetails && ( this.dispositionDetails?.isAllMentionUnderTicketId == true || this.dispositionDetails?.isAllMentionUnderTicketId == false )){
      performActionObj.isAllMentionUnderTicketId = this.dispositionDetails?.isAllMentionUnderTicketId;
    }
    if (dispositionFlag) {
      performActionObj.DispositionID = this.dispositionDetails?.dispositionId;
      if (
        this.dispositionDetails?.categoryCards &&
        this.dispositionDetails?.categoryCards.length > 0
      ) {
        performActionObj.Source.categoryMap =
          this.dispositionDetails?.categoryCards;
        performActionObj.Source.categoryMapText = null;
      }
      const dispositionTask = {
        AssignedToTeam: 0,
        AssignedToUserID: 0,
        Channel: null,
        Note: '',
        Status: ClientStatusEnum.TicketDisposition,
        TagID: String(this.postData.tagID),
        TicketID: 0,
        type: 'CommunicationLog',
      };
      if (performActionObj?.Tasks) {
        performActionObj.Tasks.push(dispositionTask);
      }
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == this.postData.brandInfo.brandID
      );
      performActionObj.isAutoTicketCategorizationEnabled =
        brandInfo.isAutoSuggestionEnabled;
      performActionObj.showTicketCategory = this.ticketHistoryData?.isTicketCategoryTagEnable;
    } else {
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == this.postData.brandInfo.brandID
      );
      if (brandInfo?.aiTagEnabled) {
        const dispositionTask = {
          AssignedToTeam: 0,
          AssignedToUserID: 0,
          Channel: null,
          Note: '',
          Status: ClientStatusEnum.TicketDisposition,
          TagID: String(this.postData.tagID),
          TicketID: 0,
          type: 'CommunicationLog',
        };
        if (performActionObj?.Tasks) {
          performActionObj.Tasks.push(dispositionTask);
        }
      }
    }
    if (
      this.postData.channelGroup === ChannelGroup.Email &&
      !this.postData.allMentionInThisTicketIsRead
    ) {
      const obj = {
        brandID: this.postData.brandInfo.brandID,
        brandName: this.postData.brandInfo.brandName,
      };
      // console.log('reply approved successfull ', data);
      this.getBrandMentionReadSettingApiRes = this._replyService.GetBrandMentionReadSetting(obj).subscribe((resp) => {
        if (resp) {
          if (resp.isMentionReadCompulsory) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this._translate.instant('please-read-all-mentions'),
              },
            });
          } else {
            this.directCloseTicket(performActionObj);
          }
        }
      });
    } else {
      this.directCloseTicket(performActionObj);
    }
  }

  closeTicketWithNote(): void {
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    this.replyInputParams = {};
    this.replyInputParams.postObj = this.postData;
    this.replyInputParams.closeWithNote = true;
    // this._ngZone.runOutsideAngular(() => {
     this.clearDirectBlockTimeOut =setTimeout(() => {
        // this._ngZone.run(() => {
          this.directCloseBlock = true;
          this.postReplyBlock = false;
        // });
        // this._replyService.checkReplyInputParams.next(this.replyInputParams);
        this._replyService.checkReplyInputParamsSignal.set(this.replyInputParams);
        this._cdr.detectChanges();
        console.log('setTimeout called');
      }, 10);
    // });

    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({
      //   status: this.directCloseBlock,
      //   pageType: this.pageType,
      // });
      this._chatBotService.chatBotHideObsSignal.set({
        status: this.directCloseBlock,
        pageType: this.pageType,
      });
    }
  }

  callDirectCloseEvent(note: string) {
    if (note != null) {
      this.directCloseNote = note;
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == this.postData.brandInfo.brandID
      );
      if (brandInfo && brandInfo.isTicketDispositionFeatureEnabled) {
        if(this.isDispositionList) {
          this.directCloseLoader = true;
        this.ticketDispositionDialog();
      } else {
          this.directCloseLoader = true;
          this.closeThisTicket(note);
        }
      } else {
        this.directCloseLoader = true;
        this.closeThisTicket(note);
      }
    }
  }

  ticketDispositionDialog(): void {
    const dialogRef = this.dialog.open(TicketDispositionComponent, {
      width: '43vw',
      data: this.postData,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.dispositionDetails = res;
        this.directCloseLoader = true;
        this.closeThisTicket(this.directCloseNote,true);
      }
    });
  }
  workflowAllConditionHandle(currentBrand: BrandList, ticketHistoryData: AllBrandsTicketsDTO): AllBrandsTicketsDTO {
    if (currentBrand?.SSREReplyType) {
      ticketHistoryData.SSREReplyType = currentBrand?.SSREReplyType
    }
    return ticketHistoryData;
  }

  aiTicketIntelligenceData(event) {
    if (event && event.result) {
      const allUpperTag = { 0: "Complaint", 1: "Appreciation", 2: "Inquiry", 3: "Suggestion", 4: "Experience", 5: 'Assistance', 6: 'Issue', 7: 'Request', 8: "Other" };
      this.selectedUpperTags = {
        start: allUpperTag[event.result?.upper_tags?.start] ? allUpperTag[event.result?.upper_tags?.start] : '',
        end: allUpperTag[event.result?.upper_tags?.end] ? allUpperTag[event.result?.upper_tags?.end] : '',
      }
      if (event.result?.emotions) {
        let emotionMap = {
          1: 'Joy',
          2: 'Sad',
          3: 'Excited',
          4: 'Angry',
          5: 'Disgusted',
          6: 'Confused',
          7: 'Satisfied',
          8: 'Grateful',
          9: 'Frustrated',
          10: 'Disappointed',
          11: 'Regretful',
          12: 'Happy',
          13: 'Love',
          14: 'Neutral'
        };
        this.selectedEmotions = {
          startLabel: emotionMap[event.result?.emotions?.start] ? emotionMap[event.result?.emotions?.start] : '',
          endLabel: emotionMap[event.result.emotions?.end] ? emotionMap[event.result?.emotions?.end] : '',
          startColor: '',
          endColor: '',
          start: event.result?.emotions?.start,
          end: event.result?.emotions?.end
        }
      }
      if (event.result?.sentiments) {
        this.selectedSentiment = {
          start: event.result?.sentiments?.start,
          end: event.result?.sentiments?.end
        }
      }
      if (event.result?.ticket_tags) {
        this.ticketTagging = [];
        event.result?.ticket_tags.forEach((res) => {
          let subTag = [];
          if (res) {
            subTag.push(res[0]);
            subTag.push(res[1]);
            this.ticketTagging.push(subTag);
          }
        })
      }
    } 
    const brandDetail = this._filterService.fetchedBrandData?.find(
      (brand: BrandList) => +brand.brandID === this.postData?.brandInfo?.brandID
    );
    this.aiTicketIntelligenceModelData = {
      IsAIIntelligenceEnabled: brandDetail?.aiTagEnabled ? true : false,
      brandId: this.postData?.brandInfo?.brandID,
      ticketID: this.postData?.ticketID,
      brandName: this.postData?.brandInfo?.brandName,
      authorChannelGroupID: this.postData?.channelGroup,
      ticketTagging: JSON.stringify(this.ticketTagging),
      upperCategoriesDeltaStart: this.selectedUpperTags.start,
      oldUpperCategoriesDeltaStart: this.selectedUpperTags.start,
      upperCategoriesDeltaEnd: this.selectedUpperTags.end,
      oldUpperCategoriesDeltaEnd: this.selectedUpperTags.end,
      emotionsDeltaStart: this.selectedEmotions.start,
      emotionsDeltaEnd: this.selectedEmotions.end,
      oldEmotionsDeltaStart: this.selectedEmotions.start,
      oldEmotionsDeltaEnd: this.selectedEmotions.end,
      sentimentDeltaStart: this.selectedSentiment.start,
      oldSentimentDeltaStart: this.selectedSentiment.start,
      sentimentDeltaEnd: this.selectedSentiment.end,
      oldSentimentDeltaEnd: this.selectedSentiment.end,
      customerType: event.result?.customer_type ? event.result?.customer_type : 0,
      satisfactionRating: this.selectedSatisfactionRating,
      oldSatisfactionRating: this.oldSelectedSatisfactionRating,
      isModified: this.oldSelectedSatisfactionRating == this.selectedSatisfactionRating ? false : true,
      isLead: event.result?.lead ? event.result?.lead : this.selectedLead,
      categoryXML: null,
      IsSarcastic: event?.result?.is_sarcastic ? event?.result?.is_sarcastic : 0,
      IssueResolved: event?.result?.issue_resolution_status ? event?.result?.issue_resolution_status : 0,
      AgentCommitted: event?.result?.agent_commitment ? event?.result?.agent_commitment : 0,
      InappropriateClosure: event?.result?.inappropriate_closure ? event?.result?.inappropriate_closure : 0,
      HasChurnIntent: event?.result?.churn_intent ? event?.result?.churn_intent : 0,
      HasUpsellOpportunity: event?.result?.upsell_opportunity ? event?.result?.upsell_opportunity : 0,
      AgentEmpathyScore: event?.result?.agent_empathy_score ? event?.result?.agent_empathy_score : 0,
      UpdatedSatisfactionRating: event?.result?.updated_satisfaction_rating !== null ? event?.result?.updated_satisfaction_rating : 0,
      IsSuggested: event?.result?.is_suggested ? event?.result?.is_suggested : false,
      SuggestedReply: event?.result?.suggested_reply ? event?.result?.suggested_reply : '',
      FoulWords: event?.result?.length ? event?.result?.foul_words : '',
      isAgentiQueEnabled: brandDetail?.isAgentIQEnabled ? true : false
    }
  }

  directCloseTicket(performActionObj): void {
    /* extra flag added */
    const brandDetail = this._filterService.fetchedBrandData?.find(
      (brand: BrandList) => +brand.brandID === this.postData?.brandInfo?.brandID
    );
    const logdinUser = JSON?.parse(localStorage?.getItem('user') || '{}');
    if (logdinUser && Object.keys(logdinUser)?.length > 0) {
      const actionButton = logdinUser?.data?.user?.actionButton;
      if (Object.keys(actionButton)?.length > 0) {
        if (performActionObj?.Source) performActionObj.Source['IsChatBotEnable'] = actionButton?.chatSectionEnabled || false;
      }
    }
    if (performActionObj?.Source && this.dispositionDetails && this.dispositionDetails?.aiTicketIntelligenceModel){
      performActionObj.Source.aiTicketIntelligenceModel = this.dispositionDetails.aiTicketIntelligenceModel;
    } else if(performActionObj?.Source && brandDetail?.aiTagEnabled) {
      performActionObj.Source.aiTicketIntelligenceModel = this.aiTicketIntelligenceModelData !== undefined ? this.aiTicketIntelligenceModelData : performActionObj.Source.aiTicketIntelligenceModel;
    }
    if (performActionObj?.Source && performActionObj?.Source?.aiTicketIntelligenceModel) {
      performActionObj.Source.aiTicketIntelligenceModel.isAgentiQueEnabled = brandDetail?.isAgentIQEnabled ? true : false;
    }
    /* extra flag added */
    // if (!this.authorDetails) {
    //   this.getAuthorTicketMandatoryDetails();
    // }
    // if (!this.mapTicketCustomFieldColumns(this.authorDetails)) {
    //   return;
    // }
    // if(this.missingFieldsClosure && this.missingFieldsClosure.length){
    //   this.showAlert();
    //   return
    // }
   this.replyApiRes = this._replyService.Reply(performActionObj).subscribe(
      (data) => {
        if (data?.success) {
          // console.log('closed successfull ', data);
          // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);

          // this.dialogRef.close(true);
          this.postData.ticketInfo.status = TicketStatus.Close;
          // this._replyService.setTicktOverview.next(this.postData);
          if (this.pageType === PostsType.TicketHistory) {
            // this._replyService.replyActionPerformed.next(this.postData);
            this._replyService.replyActionPerformedSignal.set(this.postData)
            this._ticketService.setTicketForRefreshSignal.set(true);
          }
          this._bottomSheet.dismiss();
          const DirectClose = this._ticketService.GetActionEnum().DirectClose;
          const msg = this._ticketService.GetToastMessageonPerformAction(
            DirectClose,
            this.postData,
            this.currentUser
          );
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: msg,
            },
          });
          this.directCloseLoader = false;
          this.callReplyEvent(false);
          if (this.dispositionDetails) {
            this._postDetailService.updateTicketCategorySignal.set(
              this.dispositionDetails
            );
          }
          const autoUpdateWindow = localStorage.getItem('autoUpdateWindow') ? JSON.parse(localStorage.getItem('autoUpdateWindow')) : false;
          if (autoUpdateWindow && this.pageType == PostsType.TicketHistory) {
            this.closePreviousTicketCase(this.postData);
            this._ticketService.agentAssignToObservableSignal.set(this.postData);
            console.log('agent assign calling');
          }
          this._cdr.detectChanges();
          
          if (JSON.parse(localStorage.getItem('sfdcTicketView'))) {
            this._ticketService.crmChatbotCloseTicketObsSignal.set({ status: 3 });
          }

          setTimeout(() => {
            this._ticketService.ticketStatusChangeObsSignal.set({
              tagID: this.postData.tagID,
              status: 3,
              guid: this._navigationService.currentSelectedTab.guid,
              ticketType: this._postDetailService.selectedTicketType
            });
            const ObjPost = {
              post: this.postData,
              operation: PostActionType.Close,
            };
            this.postActionClicked.emit(ObjPost);
          }, 1000);
        
        } 
        else {
          this.directCloseLoader = false;
          this._cdr.detectChanges();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data?.message :this._translate.instant('some-error-occurred'),
            },
          });
        }
        // this.zone.run(() => {
      },
      (err) => {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message:this._translate.instant('some-error-occurred'),
          },
        });
      }
    );
  }

  closePreviousTicketCase(postData: BaseMention): void {
    const obj = {
      BrandID: postData?.brandInfo?.brandID,
      BrandName: postData?.brandInfo?.brandName,
      TicketID: postData?.ticketInfo?.ticketID,
      Status: 'C',
    };
     this.loclUnlockTicketAPiRes = this._ticketService.lockUnlockTicket(obj).pipe(distinctUntilChanged()).subscribe((resp) => {
      if (resp.success) {
        // success
      }
    });
  }

  // called from child
  ssreSimulationWrongPopupLogic(): void {
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    // const replyPostRef = this._bottomSheet.open(PostReplyComponent, {
    //   ariaLabel: 'Reply',
    //   panelClass: 'post-reply__wrapper',
    //   backdropClass: 'no-blur',
    //   data: { SSREMode: SSREMode.Simulation, SsreIntent: SsreIntent.Wrong },
    // });
    this.replyInputParams = {};
    this.replyInputParams.SSREMode = SSREMode.Simulation;
    this.replyInputParams.SsreIntent = SsreIntent.Wrong;
    this.replyInputParams.postObj = this.postData;
    // this._replyService.checkReplyInputParams.next(this.replyInputParams);
    this._replyService.checkReplyInputParamsSignal.set(this.replyInputParams);
    this.postReplyBlock = !this.postReplyBlock;
    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({ status: this.postReplyBlock });
      this._chatBotService.chatBotHideObsSignal.set({ status: this.postReplyBlock });
    }
    this._cdr.detectChanges();
  }

  // called from child
  ssreSimulationRightPopupLogic(): void {
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    // const replyPostRef = this._bottomSheet.open(PostReplyComponent, {
    //   ariaLabel: 'Reply',
    //   panelClass: 'post-reply__wrapper',
    //   backdropClass: 'no-blur',
    //   data: { SSREMode: SSREMode.Simulation, SsreIntent: SsreIntent.Right },
    // });
    this.replyInputParams = {};
    this.replyInputParams.SSREMode = SSREMode.Simulation;
    this.replyInputParams.SsreIntent = SsreIntent.Right;
    this.replyInputParams.postObj = this.postData;
    // this._replyService.checkReplyInputParams.next(this.replyInputParams);
    this._replyService.checkReplyInputParamsSignal.set(this.replyInputParams);
    this.postReplyBlock = !this.postReplyBlock;
    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({ status: this.postReplyBlock });
      this._chatBotService.chatBotHideObsSignal.set({ status: this.postReplyBlock });
    }
    this._cdr.detectChanges();
  }

  callReplyEvent(status): void {
    this.postReplyBlock = status;
    this.directCloseBlock = status;
    if (this.pageType !== PostsType.TicketHistory) {
      // this._chatBotService.chatBotHideObs.next({ status: this.postReplyBlock });
      this._chatBotService.chatBotHideObsSignal.set({ status: this.postReplyBlock });

    }
  }

  // CRM Search dialog

  openCrmDialog(): void {}

  getEmailHtmlData(): void {
    this._postDetailService.postObj = this.postData;
    const source = this._mapLocobuzz.mapMention(
      this._postDetailService.postObj
    );
    const object = {
      BrandInfo: source.brandInfo,
      TagId: source.tagID,
    };

    this.getEmailHtmlDataApiRes = this._ticketService.getEmailHtmlData(object).subscribe((data) => {
      if (data.success) {
        if (this.postData.ticketInfo.ticketID === 244436) {
        }

        this.ticketHistoryData.htmlData = data.data;
        this._cdr.detectChanges();
      }
    });
  }

  // trigger not found
  vidoPlayDialog(): void {}

  likeUnlikeActive(): void {
    this.likeUnlike = !this.likeUnlike;
  }

  postActionTrigger(actionObj: { actionType: number; param?: any, isDispositionList?: boolean, emailType?:boolean }): void {
    this.newThreadEmail = actionObj?.emailType ? actionObj.emailType : false;
    this.directCloseBlock = false;
    switch (actionObj.actionType) {
      case this.PostActionEnum.assignTickets:
        this.assignTicket();
        break;
      case this.PostActionEnum.ssreSimWrong:
        this.ssreSimulationWrongPopupLogic();
        break;
      case this.PostActionEnum.ssreSimRight:
        this.ssreSimulationRightPopupLogic();
        break;
      case this.PostActionEnum.replyModified:
        this.replyModified();
        break;
      case this.PostActionEnum.replyEscalate:
        this.replyEscalate();
        break;
      case this.PostActionEnum.translateText:
        this.postBodyComponent.translateText();
        break;
      case this.PostActionEnum.sendPostEmail:
        this.sendPostEmail();
        break;
      case this.PostActionEnum.sendPostForwardEmail:
        this.sendPostEmail(true);
        break;
      case this.PostActionEnum.openTicketDetail:
        this.openTicketDetail();
        this.postReplyBlock=false;
        break;
      case this.PostActionEnum.closeTicket:
        this.isDispositionList = actionObj?.isDispositionList;
        if (actionObj.param && actionObj.param.NoteFlag) {
          this.closeTicketWithNote();
        } else {
          this.closeThisTicket();
        }
        break;
      case this.PostActionEnum.ssreLiveWrong:
        this.ssreLiveWrongPopupLogic();
        break;
      case this.PostActionEnum.ssreLiveRightVerified:
        this.ssreLiveRightVerified();
        break;
      case this.PostActionEnum.ssreLiveWrong:
        this.ssreLiveRightVerified();
        break;
      case this.PostActionEnum.replyPost:
        this.replyPost();
        break;
      case this.PostActionEnum.selectPost:
        this.postSelect(
          actionObj.param.checkedStatus,
          actionObj.param.ticketID
        );
        break;
      case this.PostActionEnum.deleteFromLocobuzz:
        this.DeleteFromLocobuzz();
        break;
      case this.PostActionEnum.deleteFromSocial:
        this.DeleteFromSocial();
        break;
      case this.PostActionEnum.deleteFromBoth:
        this.DeleteFromSocialAndTool();
        break;
      case this.PostActionEnum.VoipCall:
        this.openTicketDetail(true);
        break;
      case this.PostActionEnum.tagLanguage:
        this.updateTaggedLanguage(actionObj?.param);
        break;
      default:
      // code block
    }
  }

  ngOnDestroy(): void {
    this.clearSignal.set(false);
    this.postData = null;
    this.directCloseBlock = null;
    this.postReplyBlock = null;
    this.clickTicketMenuTrigger= null;
    this.postBodyComponent = null;
    this.checkboxes = null;
    // this.postFootComponent = null;
    this._cdr.detectChanges();
    this._cdr.detach();
    if (this.closeReplyBoxSignalRef){
      this.closeReplyBoxSignalRef.destroy();
    }
    if (this.closeAlreadyOpenReplyPopupSignalRef) {
      this.closeAlreadyOpenReplyPopupSignalRef.destroy();
    } 
    if (this.updateCRMDetailsSignalRef) {
      this.updateCRMDetailsSignalRef.destroy();
    } 
    if (this.agentAssignToObservableSignal) {
      this.agentAssignToObservableSignal.destroy();
    } 
    if (this.emitEmailReadStatusSignal) {
      this.emitEmailReadStatusSignal.destroy();
    } 
    if (this.checkReplyTimeExpireSignal) {
      this.checkReplyTimeExpireSignal.destroy();
    } 
    if (this.emitBrandMentionEmailDataSignal) {
      this.emitBrandMentionEmailDataSignal.destroy();
    }
    if (this.ticketEscalateUpdateSignal) {
      this.ticketEscalateUpdateSignal.destroy();
    }
 
    this.clearVariables();
    // this._postDetailService.currentPostObject.unsubscribe();
    this.subs.unsubscribe();
    if (this.checkReplyParamsSignalTimeout){
      clearTimeout(this.checkReplyParamsSignalTimeout);
    }
    if (this.clearPostReplySetTimeout){
      clearTimeout(this.clearPostReplySetTimeout);
    }
    if (this.clearDirectBlockTimeOut){
      clearTimeout(this.clearDirectBlockTimeOut)
    }
  }

  categorymapdisplay(updatedmention: BaseMention): void {
    let ticketCategory = '';
    let mentionCategory = '';
    let ticketcatcolor = null;
    let mentioncatcolor = null;
    const ticketcategories: TicketMentionCategory[] = [];
    const mentioncategories: TicketMentionCategory[] = [];
    if (
      updatedmention.ticketInfo.ticketCategoryMap != null &&
      updatedmention.ticketInfo.ticketCategoryMap
    ) {
      let CounterIndex = 0;
      const IsTicket = updatedmention.categoryMap[0].isTicket;

      for (
        let i = 0;
        i < updatedmention.ticketInfo.ticketCategoryMap.length;
        i++
      ) {
        if (updatedmention.ticketInfo.ticketCategoryMap[i].sentiment == null) {
          for (
            let j = 0;
            j <
            updatedmention.ticketInfo.ticketCategoryMap[i].subCategories.length;
            j++
          ) {
            if (
              updatedmention.ticketInfo.ticketCategoryMap[i].subCategories[j]
                .sentiment == null
            ) {
              for (
                let k = 0;
                k <
                updatedmention.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .subSubCategories.length;
                k++
              ) {
                CounterIndex = CounterIndex + 1;

                const parentticketCategory =
                  updatedmention.ticketInfo.ticketCategoryMap[i].name;
                const subticketCategory =
                  updatedmention.ticketInfo.ticketCategoryMap[i].subCategories[
                    j
                  ].name;
                ticketCategory =
                  updatedmention.ticketInfo.ticketCategoryMap[i].subCategories[
                    j
                  ].subSubCategories[k].name;
                if (ticketCategory) {
                  ticketcatcolor =
                    updatedmention.ticketInfo.ticketCategoryMap[i]
                      .subCategories[j].subSubCategories[k].sentiment;
                }
                const subsubcategory: TicketMentionCategory = {
                  name:
                    parentticketCategory +
                    '/' +
                    subticketCategory +
                    '/' +
                    ticketCategory,
                  sentiment: ticketcatcolor,
                  show: i < 3 ? true : false,
                };
                ticketcategories.push(subsubcategory);
              }
            } else {
              CounterIndex = CounterIndex + 1;

              ticketCategory =
                updatedmention.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .name;
              if (ticketCategory) {
                ticketcatcolor =
                  updatedmention.ticketInfo.ticketCategoryMap[i].subCategories[
                    j
                  ].sentiment;
              }

              const parentticketCategory =
                updatedmention.ticketInfo.ticketCategoryMap[i].name;
              const subsubcategory: TicketMentionCategory = {
                name: parentticketCategory + '/' + ticketCategory,
                sentiment: ticketcatcolor,
                show: i < 3 ? true : false,
              };
              ticketcategories.push(subsubcategory);
            }
          }
        } else {
          CounterIndex = CounterIndex + 1;
          ticketCategory = updatedmention.ticketInfo.ticketCategoryMap[i].name;
          if (ticketCategory) {
            ticketcatcolor =
              updatedmention.ticketInfo.ticketCategoryMap[i].sentiment;
          }
          const category: TicketMentionCategory = {
            name: ticketCategory,
            sentiment: ticketcatcolor,
            show: i < 3 ? true : false,
          };
          ticketcategories.push(category);
        }
      }
    }
    if (
      updatedmention.categoryMap != null &&
      updatedmention.categoryMap.length > 0
    ) {
      let CounterIndex = 0;
      const IsTicket = updatedmention.categoryMap[0].isTicket;

      for (let i = 0; i < updatedmention.categoryMap.length; i++) {
        if (updatedmention.categoryMap[i].sentiment == null) {
          for (
            let j = 0;
            j < updatedmention.categoryMap[i].subCategories.length;
            j++
          ) {
            if (
              updatedmention.categoryMap[i].subCategories[j].sentiment == null
            ) {
              for (
                let k = 0;
                k <
                updatedmention.categoryMap[i].subCategories[j].subSubCategories
                  .length;
                k++
              ) {
                CounterIndex = CounterIndex + 1;
                const parentmentionCategory =
                  updatedmention.categoryMap[i].name;
                const submentionCategory =
                  updatedmention.categoryMap[i].subCategories[j].name;
                mentionCategory =
                  updatedmention.categoryMap[i].subCategories[j]
                    .subSubCategories[k].name;
                if (mentionCategory) {
                  mentioncatcolor =
                    updatedmention.categoryMap[i].subCategories[j]
                      .subSubCategories[k].sentiment;
                }

                const subsubcategory: TicketMentionCategory = {
                  name:
                    parentmentionCategory +
                    '/' +
                    submentionCategory +
                    '/' +
                    mentionCategory,
                  sentiment: mentioncatcolor,
                  show: i < 3 ? true : false,
                };
                mentioncategories.push(subsubcategory);
              }
            } else {
              CounterIndex = CounterIndex + 1;
              const parentmentionCategory = updatedmention.categoryMap[i].name;
              mentionCategory =
                updatedmention.categoryMap[i].subCategories[j].name;
              if (mentionCategory) {
                mentioncatcolor =
                  updatedmention.categoryMap[i].subCategories[j].sentiment;
              }

              const subcategory: TicketMentionCategory = {
                name: parentmentionCategory + '/' + mentionCategory,
                sentiment: mentioncatcolor,
                show: i < 3 ? true : false,
              };
              mentioncategories.push(subcategory);
            }
          }
        } else {
          CounterIndex = CounterIndex + 1;

          mentionCategory = updatedmention.categoryMap[i].name;
          if (mentionCategory) {
            mentioncatcolor = updatedmention.categoryMap[i].sentiment;
          }
          const category: TicketMentionCategory = {
            name: mentionCategory,
            sentiment: mentioncatcolor,
            show: i < 3 ? true : false,
          };
          mentioncategories.push(category);
        }
      }
    }

    this.post.ticketCategoryTop = ticketCategory;
    this.post.mentionCategoryTop = mentionCategory;
    this.post.ticketCatColor = ticketcatcolor;
    this.post.mentionCatColor = mentioncatcolor;
    this.post.ticketcategories = ticketcategories;
    this.post.mentioncategories = mentioncategories;
    this.post.ticketCategory = {
      ticketUpperCategory: updatedmention.ticketInfo.ticketUpperCategory.name,
      mentionUpperCategory: updatedmention.upperCategory.name,
    };
  }

  DeleteFromLocobuzz(): void {
    let DeleteParameter:any = {
      ChannelType: this.postData.channelType,
      ContentId: this.postData.contentID,
      TagId: this.postData.tagID,
      StrTagID:''
    };
    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      if (this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
    delete DeleteParameter.TagId;
        DeleteParameter.StrTagID = this.postData.tagID
        if(this.mentionOrGroupView ==AllMentionGroupView.groupView && this.pageType==PostsType.Mentions)
          {
          DeleteParameter.IsGroupView = true;
          DeleteParameter.StrTagID = this.postData.socialIdForunseenCount
          }
      }
    }else{
      delete DeleteParameter.StrTagID;
    }
    const source = this._mapLocobuzz.mapMention(this.postData);
    const obj = {
      BrandInfo: this.postData.brandInfo,
      DeleteParameter,
      Source: source,
    };

   this.deleteFromLocobuzzApiRes = this._ticketService.DeleteFromLocobuzz(obj).subscribe((data) => {
      if (data.success) {
        this.postData.ticketInfo.status = TicketStatus.Close;
        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('successfully-deleted-tool'),
          },
        });
        setTimeout(() => {
          const ObjPost = {
            post: this.postData,
            operation: PostActionType.Close,
          };
          this.postActionClicked.emit(ObjPost);
        }, 1500);
        setTimeout(() => {
          this.ticketHistoryData.isDeleteFromLocobuzz = false;
          this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
        }, 2000);
       
      } else {
        this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message && data?.message.includes('Account configuration') ? data?.message : this._translate.instant('some-error-occurred'),
          },
        });
      }
    },error => {
     this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
    });
  }

  DeleteFromSocial(): void {
    const account = this._mapLocobuzz.mapAccountConfiguration(this.postData);

    account.BrandInformation = this.postData.brandInfo;
    account.ChannelGroup = this.postData.channelGroup;
    account.SocialID = this.postData.author.socialId;

    const source = this._mapLocobuzz.mapMention(this.postData);
    const obj = {
      Source: source,
      Account: account,
    };

    this.deleteFromSocialApiRes =this._ticketService.DeleteFromSocial(obj).subscribe(
      (data) => {
        if (data.success) {
          this.postData.ticketInfo.status = TicketStatus.Close;
          this._bottomSheet.dismiss();
          // this._ticketService.ticketStatusChange.next(true);
          this._ticketService.ticketStatusChangeSignal.set(true);
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('successfully-deleted-social'),
            },
          });
          setTimeout(() => {
            const ObjPost = {
              post: this.postData,
              operation: PostActionType.Close,
            };
            this.postActionClicked.emit(ObjPost);
          }, 1500);
          this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
          this.ticketHistoryData.isDeleteFromChannel = false
          this.postData.isDeletedFromSocial = true;
          this._cdr.detectChanges();
        } else {
          this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
          const message: string = (data?.data?.message || data?.data?.error?.message) || '';
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message && data?.message.includes('Account configuration') ? data?.message :`Delete from social failed ${message ? 'As' : ''} ${message}`,
            },
          });
        }
        // this.zone.run(() => {
      },
      (err) => {
        this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this._translate.instant('Something went wrong'),
          },
        });
      }
    );
  }

  DeleteFromSocialAndTool(): void{
    const account = this._mapLocobuzz.mapAccountConfiguration(this.postData);

    account.BrandInformation = this.postData.brandInfo;
    account.ChannelGroup = this.postData.channelGroup;
    account.SocialID = this.postData.author.socialId;

    const source = this._mapLocobuzz.mapMention(this.postData);
    const obj = {
      Source: source,
      Account: account,
    };

    this.deleteFromSocialAndToolApiRes= this._ticketService.DeleteFromSocialAndTool(obj).subscribe(
      (data) => {
        if (data.success) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('successfully-deleted-social-locobuzz'),
            },
          });
          this.postData.ticketInfo.status = TicketStatus.Close;
          this._bottomSheet.dismiss();
          this.ticketHistoryData.isDeleteFromLocobuzz = false;
          // this._ticketService.ticketStatusChange.next(true);
          this.postData.isDeletedFromSocial = true;
          this.postData.isDeleteFromChannel = false;
          this._ticketService.ticketStatusChangeSignal.set(true);
          setTimeout(() => {
            const ObjPost = {
              post: this.postData,
              operation: PostActionType.Close,
            };
            this.postActionClicked.emit(ObjPost);
          }, 1500);
          this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
          this._cdr.detectChanges();
        } else {
          this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
          const message: string = (data?.data?.message || data?.data?.error?.message) || '';
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message && data?.message.includes('Account configuration') ? data?.message : `Delete from social and locobuzz failed ${message ? 'as' : ''} ${message}`,
            },
          });
        }
        // this.zone.run(() => {
      },
      (err) => {
        this._ticketService.deleteFromChannelSuccessMessage.next({ loader: false });
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this._translate.instant('Something went wrong'),
          },
        });
      }
    );
  }


  quoteTweet(): void {
    this.dialog.open(QuoteTweetComponent, {
      width: '50vw',
      disableClose: false,
    });
  }

  ticketDispositionEmitRes(event) {
    if (event) {
      this.dispositionDetails = event;
      this.closeThisTicket(event.note, true);
    }
  }

  directCloseEmailTicket(): void {
    if (this.postData.replyInitiated) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('previous-request-pending'),
        },
      });
      return;
    }

    let isticketagentworkflowenabled = false;
    const currentteamid = +this.currentUser.data.user.teamID;
    let isAgentHasTeam = false;
    if (currentteamid !== 0) {
      isAgentHasTeam = true;
    }

    isticketagentworkflowenabled =
      this.postData.ticketInfo.ticketAgentWorkFlowEnabled;
    const isworkflowenabled = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postData.brandInfo.brandID
    );

    if (
      !isAgentHasTeam &&
      this.currentUser.data.user.role === UserRoleEnum.Agent &&
      isworkflowenabled.isEnableReplyApprovalWorkFlow &&
      (isticketagentworkflowenabled ||
        this.currentUser.data.user.agentWorkFlowEnabled)
    ) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('direct_close_msg'),
        },
      });
      return;
    }
    const message = '';
    const dialogData = new AlertDialogModel(
      this._translate.instant('Are-you-sure-ticket'),
      message,
      'Yes',
      'No'
    );
    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        // const brandInfo = this._filterService.fetchedBrandData.find((obj) => obj.brandID = this.postData.brandInfo.brandID)
        // if (brandInfo && brandInfo.isTicketDispositionFeatureEnabled ) {
        //   this.ticketDispositionDialog();
        // }else{
       this.closeThisTicket();
        // }
        // this.postFootDisable = true;
        // this.ssreLiveWrongKeep();
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }
  translateText()
  {
    this.postBodyComponent.translateText();
  }

  markInfluencer(): void {
    this._postDetailService.postObj = this.postData;
    this.dialog.open(PostMarkinfluencerComponent, {
      autoFocus: false,
      width: '650px',
    });
  }

  viewInHTML(showFlag: boolean): void {
    this._ticketService.emailFriendlyViewObsSignal.set({
      show: showFlag,
      tagID: this.postData?.tagID
    })
    /* this.selectedTicketView = 1; */
    this.emailHTMLView = showFlag;
    this._cdr.detectChanges();
  }

  createTicketCall(): void {
    if (this.postData.ticketInfo.ticketID) {
      this._ticketService
        .getMentionCountByTicektID(this.postData.ticketInfo.ticketID)
        .subscribe((data) => {
          if (data.success) {
            if (+data.data === 1) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this._translate.instant('Ticket-does-not-have-multiple-mentions'),
                },
              });
              this.clickTicketMenuTrigger.closeMenu();
            } else {
              this.createticketnote = '';
              this.clickTicketMenuTrigger.openMenu();
            }
            this._cdr.detectChanges();
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this._translate.instant('some-error-occurred'),
              },
            });
            this.createticketnote = '';
            this.clickTicketMenuTrigger.closeMenu();
            this._cdr.detectChanges();
          }
        });
    }

    if (
      this.postData.ticketInfo.status ===
      TicketStatus.PendingwithCSDWithNewMention ||
      this.postData.ticketInfo.status ===
      TicketStatus.OnHoldCSDWithNewMention ||
      this.postData.ticketInfo.status ===
      TicketStatus.PendingWithBrandWithNewMention ||
      this.postData.ticketInfo.status ===
      TicketStatus.RejectedByBrandWithNewMention ||
      this.postData.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention
    ) {
      // call api
      const bulkcreateTicket: BulkOperationObject[] = [];

      const obj = {
        ticketID: this.postData.ticketID,
        tagID: this.postData.tagID,
        mentionID: null,
        brandID: this.postData.brandInfo.brandID,
        brandName: this.postData.brandInfo.brandName,
        assignedTo: 0,
      };
      bulkcreateTicket.push(obj);
      this._ticketService
        .CheckTicketIfPendingWithnewMention(bulkcreateTicket)
        .subscribe((resp) => {
          if (resp.success) {
            if (Number(resp.data) != 3) {
              this.createTicketStatus = Number(resp.data);
            } else {
              this.createTicketStatus = 99;
            }
          }
        });
    }
  }

  downloadTemplate(): void {
    const keyObj = {
      brandInfo: this.postData.brandInfo,
      ticketId: this.postData.ticketInfo.ticketID,
      to: 1,
      from: 10,
      authorId: this.postData.author.socialId,
      channel: this.postData.channelGroup,
      TagId: this.postData.tagID,
    };

    let emailTemplate = '';

    this.getTicketHtmlForEmail = this._replyService.getTicketHtmlForEmail(keyObj).subscribe(
      (data) => {
        if (data) {
          const replaceText = `<a href="${this.doucument.baseURI + 'login'}"`;
          emailTemplate = String(data.data).replace(
            '<a href="https://social.locobuzz.com/"',
            replaceText
          );
          if (emailTemplate && emailTemplate != '') {
            var blob = new Blob([emailTemplate], { type: 'text/html' });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            //FileName
            a.download = 'EmailTrail_TickectID_' + this.postData.ticketID;
            a.click();
          }
        }
        // alert('calling done');
      },
      (err) => {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('Something went wrong'),
          },
        });
      }
    );
  }

  clearnote(brandRejection = false): void {
    this.cannedapprovenote = '';
    this.cannedrejectnote = '';
    this.createticketnote = '';
    if (brandRejection) {
      this.checkIfBrandReplyAndReject();
    }
    this._cdr.detectChanges();
  }

  checkIfBrandReplyAndReject(): void {
    const brandList: BrandList[] = this._filterService.fetchedBrandData;
    if (brandList) {
      const currentBrandObj = brandList.filter((obj) => {
        return +obj.brandID === +this.postData.brandInfo.brandID;
      });
      this.currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;
    }
    if (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount) {
      if (this.currentBrand.isBrandworkFlowEnabled) {
        // show assigntoList
       this.getUserswithTicketCountAPiRes = this._replyService
          .GetUsersWithTicketCount(this.postData.brandInfo)
          .subscribe((data) => {
            // console.log(data);
            this.buildAgentUserList(data);
          });
      }
    }
  }

  buildAgentUserList(csdList: LocoBuzzAgent[]): void {
    let agentCSdList: LocoBuzzAgent[] = csdList;
    if (+this.currentUser.data.user.role === UserRoleEnum.CustomerCare) {
      agentCSdList = csdList.filter((obj) => {
        return obj.userRole === UserRoleEnum.BrandAccount;
      });
    } else if (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount) {
      agentCSdList = csdList.filter((obj) => {
        return obj.userRole === UserRoleEnum.CustomerCare;
      });
    } else {
      if (csdList && csdList.length > 0) {
        agentCSdList = csdList.filter((obj) => {
          if (this.currentBrand.isBrandworkFlowEnabled) {
            return obj.userRole === UserRoleEnum.CustomerCare;
          } else {
            return (
              obj.userRole === UserRoleEnum.BrandAccount ||
              obj.userRole === UserRoleEnum.CustomerCare
            );
          }
        });
      }
    }
    this.setAssignToUser(agentCSdList);
    this.customAgentListAsync.next(agentCSdList);
    this.customerAgentList = agentCSdList;
  }

  setAssignToUser(agentList): void {
    if (
      this.postData.ticketInfo.escalatedTo > 0 ||
      this.postData.ticketInfo.escalatedToCSDTeam > 0
    ) {
      let idtoattch = 0;

      if (this.postData.ticketInfo.escalatedTo > 0) {
        idtoattch = this.postData.ticketInfo.escalatedTo;
      } else {
        idtoattch = this.postData.ticketInfo.escalatedToCSDTeam;
      }

      if (
        agentList.findIndex(
          (obj) => obj.agentID === idtoattch || obj.teamID === idtoattch
        ) > -1
      ) {
        this.assignToUser = idtoattch;
      }
    }
  }

  CannedResponse(type: number): void {
    this._postDetailService.notetype = type; // 1 - approve // 2 - reject
    this.dialog.open(CannedResponseComponent, {
      autoFocus: false,
      width: '50vw',
      //data: this.postData,
      data: { mention: this.postData },
    });
  }

  workFlowApproved(): void {
    const performActionObj = this._replyService.BuildReply(
      this.postData,
      ActionStatusEnum.Approve,
      this.cannedapprovenote
    );

    /* extra flag added */
    const logdinUser = JSON?.parse(localStorage?.getItem('user') || '{}');
    if (logdinUser && Object.keys(logdinUser)?.length > 0) {
      const actionButton = logdinUser?.data?.user?.actionButton;
      if (Object.keys(actionButton)?.length > 0) {
        if (performActionObj?.Source) performActionObj.Source['IsChatBotEnable'] = actionButton?.chatSectionEnabled || false;
      }
    }
    /* extra flag added */

     this.workFlowReplyApiRes = this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data.success) {
        // this._filterService.currentBrandSource.next(true);
      this._filterService.currentBrandSourceSignal.set(true);

        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        /* this._ticketService.ticketWorkFlowObs.next(
          this.postData.ticketInfo.ticketID
        ); */
        this._ticketService.ticketWorkFlowObsSignal.set(
          this.postData.ticketInfo.ticketID
        );
        this.cannedapprovenote = '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('ticket-approved-success'),
          },
        });
        this._cdr.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message :this._translate.instant('some-error-occurred'),
          },
        });
      }
    });

  }

  workFlowRejected(): void {
    const performActionObj = this._replyService.BuildReply(
      this.postData,
      ActionStatusEnum.Reject,
      this.cannedrejectnote
    );

    if (
      this.currentBrand &&
      this.currentBrand.isBrandworkFlowEnabled &&
      +this.currentUser.data.user.role === UserRoleEnum.BrandAccount
    ) {
      if (this.customerAgentList && this.customerAgentList.length > 0) {
        let escalatetouser = this.customerAgentList.find((obj) => {
          return obj.agentID === +this.assignToUser;
        });

        if (!escalatetouser) {
          escalatetouser = this.customerAgentList.find((obj) => {
            return obj.teamID === +this.assignToUser;
          });
          escalatetouser.agentID = null;
        }

        const ignoreTaskIndex = performActionObj.Tasks.findIndex(
          (obj) => obj.Status == 5
        ); // find ignore status

        performActionObj.Tasks[ignoreTaskIndex].AssignedToUserID =
          escalatetouser.agentID;
        performActionObj.Tasks[ignoreTaskIndex].AssignedToTeam =
          escalatetouser.teamID;
      }
    }

    /* extra flag added */
    const logdinUser = JSON?.parse(localStorage?.getItem('user') || '{}');
    if (logdinUser && Object.keys(logdinUser)?.length > 0) {
      const actionButton = logdinUser?.data?.user?.actionButton;
      if (Object.keys(actionButton)?.length > 0) {
        if (performActionObj?.Source) performActionObj.Source['IsChatBotEnable'] = actionButton?.chatSectionEnabled || false;
      }
    }
    /* extra flag added */

     this.workFlowRejectedApiRes = this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data?.success) {
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);

        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        /* this._ticketService.ticketWorkFlowObs.next(
          this.postData.ticketInfo.ticketID
        ); */
        this._ticketService.ticketWorkFlowObsSignal.set(
          this.postData.ticketInfo.ticketID
        );
        this.cannedrejectnote = '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('ticket-rejected-success'),
          },
        });
        this._cdr.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message :this._translate.instant('some-error-occurred'),
          },
        });
      }
    });
  }

  createNewTicket(): void {
    const performActionObj = this._replyService.BuildReply(
      this.postData,
      ActionStatusEnum.CreateTicket,
      this.createticketnote
    );

    const keyObj: CreateAttachMultipleMentionParam = {
      tasks: this.MapLocobuzz.mapCommunicationLog(performActionObj.Tasks),
      ticketIDs: [this.postData.ticketInfo.ticketID],
      tagIds: [this.postData.tagID],
      mentionIDs: [
        this.postData.brandInfo.brandID +
        '/' +
        this.postData.channelType +
        '/' +
        this.postData.contentID,
      ],
      source: performActionObj.Source,
      status: this.createTicketStatus,
      actionType: 1,
      isTicketGoingForApproval: false,
      actionTaken: ActionTaken.Locobuzz,
    };

    this.createAttachMultipleMentionApiRes = this._replyService
      .CreateAttachMultipleMentions(keyObj)
      .subscribe((data) => {
        if (data?.success) {
          // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);

          // this._bottomSheet.dismiss();
          // this._ticketService.ticketStatusChange.next(true);
          if (this._replyService?.selectNoteMediaVal && this._replyService?.selectNoteMediaVal?.length > 0) {
            this._replyService.clearNoteAttachmentSignal.set(true);
          }
          this._ticketService.setTicketForRefreshSignal.set(true);
          this._ticketService.setLatestTicket = data.newTicketID;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('ticket-created-success'),
            },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data.message :this._translate.instant('some-error-occurred'),
            },
          });
        }
        // this.zone.run(() => {
      });
  }

  enableMakerChecker(status): void {
    this._postDetailService.postObj = this.postData;
    const source = this._mapLocobuzz.mapMention(
      this._postDetailService.postObj
    );
    const object = {
      Source: source,
      Ismakercheckerstatus: status,
      actionFrom: 0,
    };

   this.enableTicketMakerCheckerApiRes = this._ticketService.enableTicketMakerChecker(object).subscribe((data) => {
      if (JSON.parse(JSON.stringify(data)).success) {
        // console.log('Maker Checker', data);
        if (status) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('reply-approval-enabled'),
            },
          });
          this.ticketHistoryData.isTicketAgentWorkFlowEnabled = false;
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('reply-approval-disabled'),
            },
          });
          this.ticketHistoryData.isTicketAgentWorkFlowEnabled = true;
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this._translate.instant('error-occurred'),
          },
        });
      }
    });
  }

  addCampaign(): void {
    const dialogRef = this.dialog.open(TagMentionCampaignComponent, {
      width: '50vw',
      data: this.postData
    })

  }

  deleteFromLocobuzz(): void {
    const message = '';
    const dialogData = new AlertDialogModel(
      this._translate.instant('delete-post-from-locobuzz'),
      message,
      'Yes',
      'No'
    );
    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        // this.ssreLiveWrongKeep();
       this.DeleteFromLocobuzz();
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }

  deleteFromSocial(): void {
    const message = '';
    const dialogData = new AlertDialogModel(
      this._translate.instant('sure-you-delete-this-post-from-social-media'),
      message,
      'Yes',
      'No'
    );
    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        // this.ssreLiveWrongKeep();
        this.DeleteFromSocial();
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }

  deleteFromSocialAndTool(): void{
    const message = '';
    const dialogData = new AlertDialogModel(
      this._translate.instant('sure-you-delete-this-post-from-social-media'),
      message,
      'Yes',
      'No'
    );
    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        // this.ssreLiveWrongKeep();
        this.DeleteFromSocialAndTool();
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }

  updateTaggedLanguage(lanuageObj) {
    let obj = {
      brandInfo: 
      { 
        BrandID: this.postData?.brandInfo?.brandID,
        BrandName: this.postData?.brandInfo?.brandName,
      }, 
      model: 
      {
        DestinationLanguage: lanuageObj.lang.value, 
        TagId: this.postData?.ticketInfo?.tagID,
      } 
    };

   this.updateMentionLanguageApiRes = this._ticketService.UpdateMentionLanguage(obj).subscribe((result) => {
      if(result.success) {
        this.ticketHistoryData.languageName = lanuageObj.lang.key;
        this._cdr.detectChanges();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('language-tagged-success'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: result.message ? result.message : this._translate.instant('unable-to-update'),
          },
        });
      }
    })
  }

  LogicAfterMarkAsSeenUnseen(): void {
    // if (this.postData?.mentionMetadata?.unseencount > 0) {
    //   this.ticketHistoryData.showGroupView = true;
    // } else {
    //   this.ticketHistoryData.showGroupView = false;
    // }
    if (!this.postData?.isBrandPost || this.pageType == PostsType.TicketHistory)
    {
    this.ticketHistoryData.viewparentpost = false;

    if (this.postData?.mentionMetadata?.isMarkSeen == 0) {
      this.ticketHistoryData.isMarkUnseen = false;
      this.ticketHistoryData.isMarkAsSeen = true;
      this.ticketHistoryData.isReadBy = false
    }
    if (this.postData?.mentionMetadata?.isMarkSeen == 1 && this.postData?.mentionMetadata?.unseencount == 0) {
      this.ticketHistoryData.isMarkAsSeen = false;
      this.ticketHistoryData.isMarkUnseen = true;
      this.ticketHistoryData.isReadBy = true
      this.ticketHistoryData.readBy = `${this._translate.instant('Seen-By')}- ${this.currentUser?.data?.user?.firstName} ${this.currentUser?.data?.user?.lastName}`;
    }
    if (this.postData?.mentionMetadata?.isMarkSeen == 1 && this.postData?.mentionMetadata?.unseencount > 0) {
      this.ticketHistoryData.isMarkUnseen = false;
      this.ticketHistoryData.isMarkAsSeen = true;
      this.ticketHistoryData.isReadBy = false
      // this.ticketHistoryData.readBy = 'Seen By- ' + this.currentUser?.data?.user?.firstName + ' ' + this.currentUser?.data?.user?.lastName;
    }
  }else
  {
      if (this.postData?.mentionMetadata?.isMarkSeen == 0) {
        this.ticketHistoryData.isMarkUneenBrandPost = false
      }
      if (this.postData?.mentionMetadata?.isMarkSeen == 1 && this.postData?.mentionMetadata?.unseencount == 0) {
        this.ticketHistoryData.isMarkUneenBrandPost = true
      }
      if (this.postData?.mentionMetadata?.isMarkSeen == 1 && this.postData?.mentionMetadata?.unseencount > 0) {
        this.ticketHistoryData.isMarkUneenBrandPost = false
      }
  }
}
  cancelAssignRes(event)
  {
    if(event)
    {
      this.defaultAgentID=0
    }
  }

  updateCRMDetailsSignalChange(res){
    if (res) {
      if (
        ((res?.guid == this.postDetailTab?.guid && res?.postType == this.pageType) || res?.postType == this.pageType) &&
        res?.TagID == this.postData.tagID
      ) {
        if (res?.SrID) {
          // this.postData.ticketInfo.leadID = res?.leadID;
          // this.post.leadID = res?.leadID;
          this.postData.ticketInfo.srid = res.SrID;
          this.post.srID = res?.SrID;
          if (this.postData?.ticketInfo?.leadID) {
            this.post.leadID = this.postData?.ticketInfo?.leadID;
            this._cdr.detectChanges();
          }
        }
        if (res?.leadID) {
          this.postData.ticketInfo.leadID = res?.leadID;
          this.post.leadID = res?.leadID;
          if (this.postData?.ticketInfo?.srid) {
            this.post.srID = this.postData?.ticketInfo?.srid;
            this._cdr.detectChanges();
          }
        }
        if ((res?.postType == this.pageType)) {
          this.postReplyBlock = false
          this._cdr.detectChanges();
          this.post.srID = res.SrID;
          const brandInfo = this._filterService.fetchedBrandData.find(
            (obj) => obj.brandID == String(this.postData.brandInfo.brandID)
          );
          this.ticketHistoryData = this._footericonService.SetUserRole(
            this.pageType,
            this.ticketHistoryData,
            this.currentUser,
            this.postData,
            brandInfo
          );
          if (brandInfo?.isUpdateWorkflowEnabled && brandInfo.crmClassName.toLowerCase() === 'fedralcrm') {
            this.replyPost();
            this._cdr.detectChanges();
            return;
          }
          if (brandInfo?.isUpdateWorkflowEnabled && brandInfo.typeOfCRM != 101) {
            this.replyEscalate(true);
          } else if (brandInfo?.isUpdateWorkflowEnabled && brandInfo.typeOfCRM == 101) {
            this.replyPost()
          }
          else if (brandInfo.typeOfCRM == 102 && brandInfo.isManualPush == 1 && res?.agentID) {
            this.defaultAgentID = res?.agentID
            this.replyPost()
          }
          if (brandInfo?.crmClassName.toLowerCase() === 'dreamsolcrm') {
            this.ticketHistoryData.isEscalateVisible = true;
            this.ticketHistoryData.isDirectCloseVisible = true
          }
        }
        this._cdr.detectChanges();
      }
    }
  }

  // handleCloseAction() {
  //   this.getAuthorTicketMandatoryDetails();
  // }

  // getAuthorTicketMandatoryDetails() {
  //   let obj = {
  //     brandID: this.postData?.brandInfo?.brandID,
  //     ticketId: this.postData?.ticketID
  //   };
  //   this.getAuthorTicketMandatoryDetailsApi = this._userDetailService.GetAuthorTicketMandatoryDetails(obj).subscribe((res) => {
  //     if (res.success) {
  //       this.authorDetails = res;
  //       this.mapTicketCustomFieldColumns(this.authorDetails);
  //     }
  //   })
  // }

  // mapTicketCustomFieldColumns(author?: any) {
  //   let isValid = true;
  //   this.missingFieldsClosure = [];
  //   if (author !== undefined && author?.data && author?.data?.isMandatoryForClosure) {
  //     const customArray = author?.data?.mandatoryFieldClosure;
  //     for (let i = 0; i < customArray?.length; i++) {
  //       if (customArray) {
  //         if (author?.data?.mandatoryFieldClosure && author?.data?.mandatoryFieldClosure?.length > 0){
  //           const isExist = author?.data?.mandatoryFieldClosure[i];
  //           if (isExist && isExist?.length > 0) {
  //            this.missingFieldsClosure?.push(isExist);
  //           }
  //         }
  //       }
  //     }

  //   }
  //   // this._cdr.detectChanges();
  //   // return isValid;
  // }

  // showAlert(){
  //   let isValid = true;

  //   if (this.missingFieldsClosure?.length > 0) {
  //     let userInfoToggle = null;
  //     let userObj = null;
  //     const currentUserObj = localStorage.getItem('user');
  //     if (currentUserObj) {
  //       userObj = JSON.parse(currentUserObj);
  //       userInfoToggle = JSON.parse(localStorage.getItem(`userInfoToggle_${userObj?.data?.user?.userId}`));
  //     }
  //     let title = 'Action cannot be completed';
  //     let message = `The following mandatory fields must be filled before you can proceed:<br> <ul>
  //       ${this.authorDetails?.data?.mandatoryFieldClosure?.map(field => `<li>\u25CF ${field}</li>`)?.join('')}</ul><br>
  //       Please complete these fields and try again.`;
  //     const dialogData = new AlertDialogModel(title, message, 'Go to Ticket Details', 'Cancel');
  //     const dialogRef = this.dialog.open(AlertPopupComponent, {
  //       disableClose: true,
  //       autoFocus: false,
  //       data: dialogData,
  //     });
  //     isValid = false;
  //     dialogRef.afterClosed().subscribe((dialogResult) => {
  //       if (dialogResult) {
  //         this.postFootComponent?.openTicketDetail();
  //         if ((this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
  //           if (userInfoToggle === false) {
  //             userInfoToggle = true;
  //             localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
  //           } else {
  //             localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
  //           }
  //         }
  //         this.directCloseLoader = false;
  //         this._cdr.detectChanges();
  //       } else {
  //         this.directCloseLoader = false;
  //         this._cdr.detectChanges();
  //       }
  //     })
  //   } else {
  //     this.directCloseLoader = false;
  //     this._cdr.detectChanges();
  //     isValid = true;
  //   }
  // }
  clearVariables(){
    this.ren = null;
    this.prevButtonTrigger = null;
    this.directCloseBlock = null;
    this.directCloseLoader = null;
    this.errorTitle = null;
    this.selectedTicketView = null;
    this.selectedEmailView = null;
    this.isTicketDispositionFeatureEnabled = null;
    this.emailHTMLView = null;
    this.createticketnote = null;
    this.createTicketStatus = null;
    this.cannedapprovenote = null;
    this.cannedrejectnote = null;
    this.customAgentListAsync = null;
    this.customerAgentList = null;
    this.assignToUser = null;
    this.defaultAgentID = null;
    this.clickhouseEnabled = null;
    this.postData = null;
    this.pageType = null;
    this.AllCheckBoxes = null;
    this.openReply = null;
    this.openDetailOnClick = null;
    this.postFootDisable = null;
    this.showPostFooter = null;
    this.parentPostFlag = null;
    this.parentPostFirstFlag = null;
    this.postDetailTab = null;
    this.postInput = null;
    this.mentionHistory = null;
    this.mentionHistoryForSubject = null;
    this.showParentPostHeader = null;
    this.hideActionableButton = null;
    this.showActionPerform = null;
    this.crmFlag = null;
    this.postView = null;
    this.postDetailExpandView = null;
    this.userPostView = null;
    this.startIndex = null;
    this.endIndex = null;
    this.autoCloseWindow = null;
    this.hideCheckBox = null;
    this.mentionOrGroupView = null;
    this.TicketList = null;
    this.clickTicketMenuTrigger = null;
    this.checkboxes = null;
    this.postViewEnum = null;
    this.post = null;
    this.imgPath = null;
    this.brandImg = null;
    this.userpostLink = null;
    this.currentUser = null;
    this.brandList = null;
    this.currentBrand = null;
    this.Object = null;
    this.ticketHistoryData = null;
    this.MediaUrl = null;
    this.objBrandSocialAcount = null;
    this.handleNames = null;
    this.selectedHandle = null;
    this.mentionAction = null;
    this.mentionActionFlag = null;
    this.translatedData = null;
    this.selected = null;
    this.showTranslated = null;
    this.translatedText = null;
    this.translateFrom = null;
    this.translateTo = null;
    this.translateToForm = null;
    this.languages = null;
    this.isTranslateError = null;
    this.replyInputParams = null;
    this.isReplyTimeExpired = null;
    this.replyErrorFlag = null;
    this.replytTimeExpireMessage = null;
    this.videoIcon = null;
    this.postReplyBlock = false;
    this.enteredButton = null;
    this.isMatMenuOpen = null;
    this.isMatMenu2Open = null;
    this.likeUnlike = null;
    this.isbrandPost = null;
    this.isbulkselectall = null;
    this.isEmailRead = null;
    this.markAllAsRead = null;
    this.uparrow = null;
    this.downarrow = null;
    this.botharrows = null;
    this.hidearrows = null;
    this.backMentionIdToMove = null;
    this.nextMentionIdToMove = null;
    this.ShowMarkAsRead = null;
    this.showReply = null;
    this.showVoipReply = null;
    this.dialpadStatusOpenClose = null;
    this.directCloseNote = null;
    this.dispositionDetails = null;
    this.IDName = null;
    this.AllMentionGroupViewEnum = null;
    this.searchedText = null;
    this.isDispositionList = null;
    this.showLockStrip = null;
    this.isPostDetailsLogView = null;
    this.marginBottoom = null;
    this.newThreadEmail = null;
    this.checkReplyParamsSignalTimeout =null;
    this.clearDirectBlockTimeOut =null;
    this.clearPostReplySetTimeout = null;
    if (this.markAsseenApiRes){
      this.markAsseenApiRes.unsubscribe()
    }
    if (this.getAuthorTicketsApiRes){
      this.getAuthorTicketsApiRes.unsubscribe()
    }
    if (this.replyApprovedApiRes){
      this.replyApprovedApiRes.unsubscribe()
    }
    if (this.replyRejectedApiRes){
      this.replyRejectedApiRes.unsubscribe()
    }
    if (this.ssreLiveRightVerifiedApiRes){
      this.ssreLiveRightVerifiedApiRes.unsubscribe()
    }
    if (this.ssrLiveWrongKeepApiRes){
      this.ssrLiveWrongKeepApiRes.unsubscribe();
    }
    if (this.ssreLiveWrongDeleteApiRes){
      this.ssreLiveWrongDeleteApiRes.unsubscribe()
    }
    if (this.getBrandMentionReadSettingApiRes){
      this.getBrandMentionReadSettingApiRes.unsubscribe();
    }
    if (this.replyApiRes){
      this.replyApiRes.unsubscribe()
    }
    if (this.loclUnlockTicketAPiRes){
      this.loclUnlockTicketAPiRes.unsubscribe();
    }
    if (this.getEmailHtmlDataApiRes){
      this.getEmailHtmlDataApiRes.unsubscribe()
    }
    if (this.deleteFromLocobuzzApiRes){
      this.deleteFromLocobuzzApiRes.unsubscribe()
    }
    if (this.deleteFromSocialApiRes){
      this.deleteFromSocialApiRes.unsubscribe()
    }
    if (this.deleteFromSocialAndToolApiRes){
      this.deleteFromSocialAndToolApiRes.unsubscribe()
    }
    if (this.getTicketHtmlForEmail){
      this.getTicketHtmlForEmail.unsubscribe()
    }
    if (this.getUserswithTicketCountAPiRes){
      this.getUserswithTicketCountAPiRes.unsubscribe()
    }
    if (this.workFlowReplyApiRes){
      this.workFlowReplyApiRes.unsubscribe()
    }
    if (this.workFlowRejectedApiRes){
      this.workFlowRejectedApiRes.unsubscribe();
    }
    if (this.createAttachMultipleMentionApiRes){
      this.createAttachMultipleMentionApiRes.unsubscribe()
    }
    if (this.enableTicketMakerCheckerApiRes){
      this.enableTicketMakerCheckerApiRes.unsubscribe()
    }
    if (this.updateMentionLanguageApiRes){
      this.updateMentionLanguageApiRes.unsubscribe()
    }
    if (this.getAuthorTicketMandatoryDetailsApi) {
      this.getAuthorTicketMandatoryDetailsApi.unsubscribe();
    }
    this.dialog = null;
    this._bottomSheet = null;
    this._filterService = null;
    this._postDetailService = null;
    this._accountService = null;
    this._ticketService = null;
    this._snackBar = null;
    this._mapLocobuzz = null;
    this._replyService = null;
    this._navigationService = null;
    this._tabService = null;
    this._filterGroupService = null;
    this._ticketSignalrService = null;
    this._postAssignToService = null;
    this._footericonService = null;
    this._brandsettingService = null;
    this._chatBotService = null;
    this._voip = null;
    this._ngZone = null;
    this._cdr = null;
    this.handleNamesObs.complete();
    this.sidebarService = null;
    this.MapLocobuzz =  null;
    this.doucument = null;
    this.IDName = null;
    this.AllCheckBoxes = null;
    this.MediaUrl = null;
    this.authorDetails = null;
  }

  expanedViewEventRes(event)
  {
    this.showPostFooter = event;
    this.showFooterIcons = event
    const element = document.getElementById(`Post_${this.postData.tagID}`);
    this.postHeight = element.offsetHeight;
    this._cdr.detectChanges();
  }

  emailThreadAttachment():void
  {
    this._ticketService.mediaSideBarObs.next(true)
  }

  ngAfterViewInit(): void {
    const element = document.getElementById(this.IDName);
    this.postHeight = element?.offsetHeight;
  }

  recieveData(data) {
    this.editedNoteData = data;
  }

  openEditMenu(event: MouseEvent, obj: any) {
    this.getNote(obj);
    if (this.trigger3) {
      this.trigger3.openMenu();
    }
  }

    getNote(noteObj){
    if (noteObj){
      this.editednote = noteObj?.note ;
      this.selectedNoteMedia = noteObj?.mediaList || [];
      this._replyService.selectedNoteMedia.next({ media: noteObj?.mediaList });
      this.mediaSelectedAsync.next(this.selectedNoteMedia);
      this._replyService.selectNoteMediaVal(this.selectedNoteMedia);
      this.mediaGalleryService.selectedNoteMedia = this.selectedNoteMedia;
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
            message: this._translate.instant('character-limit-note'),
          },
        });
        this._cdr.detectChanges();
        return false;
      }
    }

  closeEditMenu() {
    this.trigger3.closeMenu();
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
       this._ticketService.editTicketNotes(obj).subscribe((data: any) => {
          if (JSON.parse(JSON.stringify(data)).success) {
            // console.log(data);
            // this.noteChange("editNote")
            this._postDetailService.postDetailEditNotesObs.next('editNote')
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
            message: this._translate.instant('please-add-note'),
          },
        });
        // this._cdr.detectChanges();
      }
    }

     openMediaDialog(): void {
        this.mediaGalleryService.startDateEpoch =
          this.postDetailTab?.tab?.Filters?.startDateEpoch;
        this.mediaGalleryService.endDateEpoch =
          this.postDetailTab?.tab?.Filters?.endDateEpoch;
        this.dialog.open(MediaGalleryComponent, {
          data: {
            brandID: this.postData?.brandInfo?.brandID,
            type: 'AddNoteGallery',
          },
          autoFocus: false,
          panelClass: ['full-screen-modal'],
        });
      }

      onMenuOpened():void
      {
        this._ticketService.postLogAttachmentCalculationObs.next(true);
      }

  ticketDispositionDialog_new(): void {
    if (this.postData?.channelGroup === ChannelGroup.Email && !this.postData?.allMentionInThisTicketIsRead) {
      const obj = {
        brandID: this.postData?.brandInfo.brandID,
        brandName: this.postData?.brandInfo.brandName,
      };
      this._replyService.GetBrandMentionReadSetting(obj).subscribe((resp) => {
        if (resp) {
          if (resp.isMentionReadCompulsory) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message:
                  'Please read all the mentions before performing direct close action',
              },
            });
          } else {
            const brandInfo = this._filterService.fetchedBrandData.find(
              (obj) => obj.brandID == this.postData?.brandInfo.brandID
            );
            if (brandInfo) {
              const obj = {
                CategoryGroupID: brandInfo.categoryGroupID,
                CategoryGroupName: brandInfo.categoryName,
                TicketID: this.postData?.ticketID
              };
              this._replyService.getDispositionDetails(obj).subscribe((res) => {
                if (res.success) {
                  const ticketDispositionList = res.data.ticketDispositionList;
                  if (ticketDispositionList.length > 0) {
                    const despositionObj = {
                      baseMention: this.postData,
                      dispositionList: ticketDispositionList,
                      note: res?.data ? res?.data?.note : '',
                      ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                    }
                    const dialogRef = this.dialog.open(TicketDispositionComponent, {
                      width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                      data: despositionObj,
                    });
                    dialogRef.afterClosed().subscribe((res) => {
                      if (res) {
                        this.ticketDispositionEmitRes(res);
                      }
                    });

                  } 
                }
              }, (error) => {
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                    type: notificationType.Error,
                    message: error,
                  },
                });
              });
            }

          }
        }
      });
    }
  }

}

