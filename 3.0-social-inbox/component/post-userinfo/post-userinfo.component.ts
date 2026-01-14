import { I } from '@angular/cdk/keycodes';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  EffectRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  signal,
  SimpleChanges,
  untracked,
  ViewChild,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { ClientStatusEnum } from 'app/core/enums/ActionStatus';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { LogStatus } from 'app/core/enums/LogStatus';
import { notificationType } from 'app/core/enums/notificationType';
import { Priority } from 'app/core/enums/Priority';
import { Sentiment } from 'app/core/enums/Sentiment';
import { SSRELogStatus } from 'app/core/enums/SSRELogStatus';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import {
  CustomAuthorDetails,
  CustomConnectedUsers,
  CustomCrmColumns,
} from 'app/core/interfaces/AuthorDetails';
import { TicketMentionCategory } from 'app/core/interfaces/TicketMentionCategory';
import { ActionButton, AuthUser } from 'app/core/interfaces/User';
import { BaseSocialAuthor } from 'app/core/models/authors/locobuzz/BaseSocialAuthor';
import { LocobuzzCrmDetails } from 'app/core/models/crm/LocobuzzCrmDetails';
import { UpliftAndSentimentScore } from 'app/core/models/dbmodel/UpliftAndSentimentScore';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { CommunicationLogResponse } from 'app/core/models/viewmodel/CommunicationLog';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { TicketInfo } from 'app/core/models/viewmodel/TicketInfo';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostAssignToService } from 'app/social-inbox/services/post-assignto.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import moment from 'moment';
import { connected } from 'process';
import { Observable, Subject, Subscription } from 'rxjs';
import { distinctUntilChanged, take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { CategoryFilterComponent } from '..';
import {
  AssignToList,
  AssignToListWithTeam,
} from '../../../shared/components/filter/filter-models/assign-to.model';
import { TicketDispositionComponent, ticketDispositionList } from '../ticket-disposition/ticket-disposition.component';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from './../../../shared/components/alert-popup/alert-popup.component';
import { AddAssociateChannelsComponent } from './../add-associate-channels/add-associate-channels.component';
import { NavigationService } from 'app/core/services/navigation.service';
import { DynamicCrmIntegrationService } from 'app/accounts/services/dynamic-crm-integration.service';
import { AiFeatureService } from 'app/accounts/services/ai-feature.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { AgentIQAction } from 'app/core/enums/AgentIQActionEnum';
import { TranslateService } from '@ngx-translate/core';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { MatMenuTrigger } from '@angular/material/menu';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { postDetailProfileMenu } from 'app/app-data/post-detail-profile-menu';
import { postDetail } from 'app/app-data/post-detail';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';

@Component({
    selector: 'app-post-userinfo',
    templateUrl: './post-userinfo.component.html',
    styleUrls: ['./post-userinfo.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PostUserinfoComponent implements OnInit, OnDestroy {
  @ViewChild('menuTrigger') trigger: MatMenuTrigger;
  @Input() profileInfo?: {};
  @Input() activeTab?: number;
  @Input() tab?: LocobuzzTab;
  @Input() disableTicketOverview? = false;
  @Input() isCreditExpire: boolean = false;
  @Input() ticketSummary: boolean = false;
  @Input() selectedSummaryTab:number = 0;
  @Input() selectedSummaryType:number = 8;
  @Input() isSummaryAPICalling: boolean = false;
  @Input() TicketSummaryDetails: any = {};
  @Input() noteSpinner: boolean = false;
  @Input() selectedNoteMedia: UgcMention[] = [];
  @Input() rotate: boolean = false;
  @Input() typeOfCrm: number;
  @Input() crmGetAuthorTicketDetails: boolean = false;
  @Input() TicketSummaryType: {
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
  @Input() ticketHistoryData: AllBrandsTicketsDTO;
  Object = Object;
  @Output() someEvent = new EventEmitter<string>();
  @Output() userEvent = new EventEmitter<BaseSocialAuthor[]>();
  @Output() userPhoneNumber = new EventEmitter<any>();
  @Output() outputIndex = new EventEmitter<number>();
  @Output() expandTicketSummaryEmit = new EventEmitter<any>();
  @Output() changeTicketSummaryTypeEmit = new EventEmitter<any>();
  @Output() clearNoteEmit = new EventEmitter<any>();
  @Output() noteTextChangeEmit = new EventEmitter<any>();
  @Output() removeSelectedNoteMediaEmit = new EventEmitter<any>();
  @Output() openMediaDialogEmit = new EventEmitter<any>();
  @Output() addNoteEmit = new EventEmitter<any>();
  @Output() syncSFDCDataEmit = new EventEmitter<any>();
  @Output() getRequestPopupEmit = new EventEmitter<any>();
  @Output() CaseLeadFormOpenViewEmit = new EventEmitter<any>();
  @Output() CaseLeadFormOpenEmit = new EventEmitter<any>();
  @ViewChild('matTabGrop', { static: true }) matTabGrop: MatTabGroup;
  author: BaseSocialAuthor;
  ticketAuthor: any;
  ticketTimeline: CommunicationLogResponse;
  upliftAndSentimentScore: UpliftAndSentimentScore;
  ticketSumamry: TicketInfo;
  secondLevelDropdownOn: boolean = false;
  CRMDetails: LocobuzzCrmDetails;
  customAuthorDetails: CustomAuthorDetails;
  customCrmColumns: CustomCrmColumns[] = [];
  customTicketCrmColumns: CustomCrmColumns[] = [];
  ticketInfoOnSave: CustomCrmColumns[] = [];
 @Input() TicketData: BaseMention[] = [];
  postObj: BaseMention;
  allChannelPostObj: BaseMention;
  ticketCategory: string;
  ticketcategories: TicketMentionCategory[] = [];
  upperCategory: string;
  totalMention: number;
  selectedTicketID: number;
  ticketID: number;
  ticketStatus: TicketStatus;
  AssignedTo: number;
  ticketPriority: Priority;
  brand: string;
  ticketCreatedOn: string;
  ticketUpdatedOn: string;
  ticketAssignedToOn: string;
  ticketExcalatedToOn: string;
  userwithteam: AssignToListWithTeam[] = [];
  dates: Date;
  assignTo: Observable<AssignToList[]>;
  assignLoading = false;
  personalDetailForm: UntypedFormGroup;
  TicketFieldForm: UntypedFormGroup;
  imgPath: string = 'assets/social-mention/post/';
  CrmDetails: any[] = [];
  CrmCustomTicketDetails: any[] = [];
  disableTicketSections = false;
  showProfile = false;
  profileName: string;
  pageImageUrl: string;
  brandImageUrl: string;
  subs = new SubSink();
  ispendingwithcsd = false;
  currentUser: AuthUser;
  ticketidDisableClass = false;
  priorityDisableClass = false;
  ticketstatusDisableClass = false;
  assignToDisableClass = false;
  IsCSDUser = false;
  IsBrandUser = false;
  AwaitingResponseforAccounType = false;
  showstatusopen = false;
  showstatusclose = false;
  showstatusonhold = false;
  showstatusinfoawaited = false;
  showstatusopendisabled = false;
  showstatusclosedisabled = false;
  showstatusonholddisabled = false;
  showstatusinfoawaiteddisabled = false;
  assignAgentName = 'Assign To';
  onholdstatus: TicketStatus;
  ticketIdLabel: string;
  isAutoClosuerEnable: false;
  isEligibleForAutoclosure = false;

  postProfileLoading = signal<boolean>(true);
  postTimelineLoading = true;
  showTicketCategoryMapping: boolean = false;
  @ViewChild('ticketStatusSelectBox') ticketStatusSelectBox: MatSelect;
  previousTicketStatus: TicketStatus;
  assignUserListFlag: boolean;
  esclationFlag: boolean;
  assignementEnabled: boolean;
  changePriorityEnabled: boolean;
  editPersonalDetailsEnabled: boolean;
  updateLoader: boolean;
  updateTicketDetailsLoader: boolean = false;
  authorDetailsSubscription: Subscription;
  ticketFieldsDetailsSubscription: Subscription;
  ticketSummarySubscription: Subscription;
  loaderTypeEnum = loaderTypeEnum;
  isAutoTicketCategorizationEnabled: boolean;
  dispositionDetails: any;
  TicketStatusEnum = TicketStatus;
  ticketDetailsForm: UntypedFormGroup;
  showTicketUpdate:boolean = false;
  isBookingNumberChanged: boolean = false;
  isTicketDescriptionChanged: boolean = false;
  isCustomerIDChanged: boolean = false;
  actionableRef: any;
  customTicketFieldLoader: boolean = true;
  ticketDispositionList: ticketDispositionList[] = [];
  AiUpperCategoryList = ['Query', 'Appreciation', 'Complaint', 'suggestion', 'Suggestion', 'Request', 'news', 'News', 'Marketing/Campaign/Promotions', 'other', 'Other', 'marketing', 'Marketing'];
  showTicketSummary: boolean = false;
  isTicketSummarizationEnable: boolean = false;
  ticketSummarizationDetail: string = "";
  summarizationLoader: boolean = false;
  ticketSummaryLogo = "assets/images/common/stars__blue.svg";
  ticketSummaryTooltip = "";
  isTicketSummaryCreditExpired: boolean = false;
  searchParent:string = "";
  searchChild: string = "";
  searchSubChild:string = "";
  isReadOnly: boolean = false;
  sfdcTicketView: boolean = false;
  permissions: ActionButton;
  allMaskedDataWithName = [];
  updateTicketDetailsapi: any;
  changeTicketStatusapi: any;
  GetBrandMentionReadSettingapi: any;
  changeTicketStatusapires: any;
  changeTicketStatusapiresult: any;
  lockUnlockTicketapi: any;
  GetTicketListbyIDapi: any;
  changeTicketPriorityapi: any;
  ticketReassignToUserapi: any;
  voipTicketReassignToUserapi: any;
  SaveLocoBuzzCRMDetailapi: any;
  SaveLocoBuzzCRMDetailTicketapi: any;
  GetAuthorDetailsapi: any;
  GetTicketTimelineapi: any;
  checkAutoclosureEligibilityapi: any;
  getDispositionDetailsapi: any;
  GetAITicketSummaryDataapi: any;
  GetUnmaskedValueapi: any;
  getCRMTicketStatusapi: any;
  authorDetails: any;
  effectCurrentPostObjectSignal: EffectRef;
  effectReplyActionPerformedSignal: EffectRef;
  effectUpdateTicketCategorySignal: EffectRef;
  effectEmitEmailReadStatusSignal: EffectRef;
  effectTicketDispositionListSignal: EffectRef;
  effectBulkActionPerformedSignal: EffectRef;
  effectSsreActionPerformedSignal: EffectRef;
  effectTicketEscalationObsSignal: EffectRef;
  effectReAssignTicketSignal: EffectRef;
  effectPostDetailObjectChangedSignal: EffectRef;
  effectOnReassignVoipAgentSignal: EffectRef;
  effectEmailProfileDetailsObsSignal: EffectRef;
  effectNoteAddedChangeSignal: EffectRef;
  effectTicketWorkFlowObsSignal: EffectRef;
  getAuthorTicketMandatoryDetailsApi: any;
  public clearSignal = signal<boolean>(true);
  missingFieldsClosure;
  searchLevelFour = '';
searchLevelFive = '';
searchLevelSix = '';
  aiTicketIntelligenceModelData: any;
  selectedUpperTags = { start: 'Complaint', end: 'Appreciation' };
  selectedEmotions = { start: 4, end: 8, startColor: '', endColor: '', startLabel: '', endLabel: '' };
  selectedSentiment = { start: 0, end: 2 };
  selectedSatisfactionRating = 0;
  oldSelectedSatisfactionRating = 0;
  selectedLead = 0;
  ticketTagging = [];
  genAiData: any;
  teamSelectedData:any[] =[];
  defaultLayout: boolean = false;
  isSarcastic: number = 0;
  issueResolved: number = 0;
  agentCommitment: number = 0;
  inappropriateClosure: number = 0;
  hasChurnIntent: number = 0;
  hasUpsellOpportunity: number = 0;
  agentEmpathyScore: number = 0;
  updatedSatisfactionRating: number = 0;
  closureApproved: boolean = false;
  suggestedReply: string = '';
  foulWords: string[] = [];
  isAgentIqEnabled: boolean = false;
  showIqOnDirectClose: boolean = false;
  ticketSummaryLoader = signal<boolean>(false);
  mediaSelectedAsync = new Subject<UgcMention[]>();
  mediaSelectedAsync$ = this.mediaSelectedAsync.asObservable();
  mediaTypeEnum = MediaEnum;
  editAttributesEnabled: boolean = false;
  clickHoverMenuTriggerFlag: boolean = false;
  personalDetailsEdit: boolean = false;

  constructor(
    private accountService: AccountService,
    private filterService: FilterService,
    private _postDetailService: PostDetailService,
    private _ticketService: TicketsService,
    public dialog: MatDialog,
    private MapLocobuzz: MaplocobuzzentitiesService,
    private _snackBar: MatSnackBar,
    private _userDetailService: UserDetailService,
    private formBuilder: UntypedFormBuilder,
    private _replyService: ReplyService,
    private _postAssignToService: PostAssignToService,
    private _filterService: FilterService,
    private changeDetectionRef:ChangeDetectorRef,
    private _voip: VoiceCallService,
    private cdk:ChangeDetectorRef,
    private navigationService:NavigationService,
    private _dynamicServices:DynamicCrmIntegrationService,
    private _aiFeatureService: AiFeatureService,
    private _sidebarService: SidebarService,
    private cdkRef: ChangeDetectorRef,
    private commonService: CommonService,
    private translate: TranslateService,
    private mediaGalleryService: MediagalleryService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public data: { tabIndex: number; emailFlag: boolean ,}
  ) {
    this.ticketDetailsForm = this.formBuilder.group({
      bookingNumber: ['', [Validators.minLength(0), Validators.maxLength(100)]],
      customerID: ['', [Validators.minLength(0), Validators.maxLength(100)]],
      ticketDescription: '',
    })
    const userObj = JSON.parse(localStorage.getItem('user'));
    this.sfdcTicketView = JSON.parse(localStorage.getItem('sfdcTicketView'));

    if (userObj) {
      if (userObj?.data?.user?.role == UserRoleEnum.ReadOnlySupervisorAgent) {
        this.isReadOnly = true;
      }
      else this.isReadOnly = false;
    }
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => {
        this.currentUser = user;
        let permission: ActionButton = this.currentUser?.data?.user?.actionButton;
        this.permissions = {
          isMaskingViewOrUpdate: permission.isMaskingViewOrUpdate,
        };
      });

    this.activeTab = this.activeTab != null ? this.activeTab : this.data?.tabIndex ? this.data?.tabIndex : 0;
    let onLoadCurrentPostObject = true;
    let previouValueOfCurrentPost = this._postDetailService.currentPostObjectSignal();
    this.effectCurrentPostObjectSignal = effect(() => {
      const value = this.clearSignal() ? this._postDetailService.currentPostObjectSignal() : untracked(() => this._postDetailService.currentPostObjectSignal());
          if (!onLoadCurrentPostObject && value > 0 && previouValueOfCurrentPost != value && this.clearSignal()) {
            previouValueOfCurrentPost = this._postDetailService.currentPostObjectSignal();
            this.currentPostObjectSignalChange(value);
          } else {
            onLoadCurrentPostObject = false;
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

    let onLoadTicketCategory = true;
    this.effectUpdateTicketCategorySignal = effect(() => {
      const value = this.clearSignal() ? this._postDetailService.updateTicketCategorySignal() : untracked(() => this._postDetailService.updateTicketCategorySignal());
      if (!onLoadTicketCategory && value && this.clearSignal()) {
        this.updateTicketCategorySignalChanges(value);
      } else {
        onLoadTicketCategory = false;
      }
    }, { allowSignalWrites: true });

    let onLoadEmailReadStatus = true;
    this.effectEmitEmailReadStatusSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.emitEmailReadStatusSignal() : untracked(() => this._replyService.emitEmailReadStatusSignal());
      if (!onLoadEmailReadStatus && value && this.postObj?.channelGroup === ChannelGroup.Email && this.clearSignal()) {
        this.emitEmailReadStatusSignalChanges(value);
      } else {
        onLoadEmailReadStatus = false;
      }
    }, { allowSignalWrites: true });

    let onLoadDispositionList = true;
    this.effectTicketDispositionListSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.ticketDispositionListSignal() : untracked(() => this._replyService.ticketDispositionListSignal());
      if (!onLoadDispositionList && value && this.clearSignal()) {
        this.ticketDispositionListSignalChanges(value);
      } else {
        onLoadDispositionList = false;
      }
    }, { allowSignalWrites: true });

    let onLoadbulkActionPerformed = true;
    this.effectBulkActionPerformedSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.bulkActionPerformedSignal() : untracked(() => this._ticketService.bulkActionPerformedSignal());
      if (!onLoadbulkActionPerformed && value && this.clearSignal()) {
        if (value.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
          this.disbaleInputsAfterBulkPerformed();
          this.changeDetectionRef.detectChanges();
        }
      } else {
        onLoadbulkActionPerformed = false;
      }
    }, { allowSignalWrites: true });

    let onLoadSsreActionPerformed = true;

    this.effectSsreActionPerformedSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.ssreActionPerformedSignal() : untracked(() => this._ticketService.ssreActionPerformedSignal());
      if (!onLoadSsreActionPerformed && value && this.clearSignal()) {
        if (value.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
          this.disbaleInputsAfterBulkPerformed();
          this.changeDetectionRef.detectChanges();
        }
      } else {
        onLoadSsreActionPerformed = false;
      }
    }, { allowSignalWrites: true });

    let onLoadReAssignTicket = true;

    this.effectTicketEscalationObsSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.ticketEscalationObsSignal() : untracked(() => this._ticketService.ticketEscalationObsSignal());
      if (!onLoadReAssignTicket && value && this.clearSignal()) {
        this.ticketEscalationObsSignalChange(value)
      } else {
        onLoadReAssignTicket = false;
      }
    }, { allowSignalWrites: true });

    this.effectReAssignTicketSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.reAssignTicketSignal() : untracked(() => this._replyService.reAssignTicketSignal());
      if (!onLoadReAssignTicket && value && this.clearSignal()) {
        this.reAssignTicketSignal(value)
      } else {
        onLoadReAssignTicket = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadDetailObjectChanged = true;
    this.effectPostDetailObjectChangedSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.postDetailObjectChangedSignal() : untracked(() => this._replyService.postDetailObjectChangedSignal());
      if (!onLoadDetailObjectChanged && value && this.clearSignal()) {
        this.postDetailObjectChangedSignalChange(value)
      } else {
        onLoadDetailObjectChanged = false;
      }
    }, { allowSignalWrites: true });

    let onLoadReassignVoipAgent = true;
    this.effectOnReassignVoipAgentSignal = effect(() => {
      const value = this.clearSignal() ? this._voip.onReassignVoipAgentSignal() : untracked(() => this._voip.onReassignVoipAgentSignal());
      if (!onLoadReassignVoipAgent && value && this.clearSignal()) {
        const userId = this.currentUser.data.user.userId;
        this.voipReassign(userId)
      } else {
        onLoadReassignVoipAgent = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadProfileDetailsObs = true;
    let previouValueEmailProfileDetail = this._ticketService.emailProfileDetailsObsSignal();
    this.effectEmailProfileDetailsObsSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.emailProfileDetailsObsSignal() : untracked(() => this._ticketService.emailProfileDetailsObsSignal());
      if (!onLoadProfileDetailsObs && value && previouValueEmailProfileDetail != value && this.clearSignal()) {
        previouValueEmailProfileDetail = this._ticketService.emailProfileDetailsObsSignal();
        this.emailProfileDetailsObsSignalChange(value);
      } else {
        onLoadProfileDetailsObs = false;
      }
    }, { allowSignalWrites: true });

    let onLoadNoteAddedChange = true;

    this.effectNoteAddedChangeSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.noteAddedChangeSignal() : untracked(() => this._ticketService.noteAddedChangeSignal());
      if (!onLoadNoteAddedChange && value && this.clearSignal()) {
        this.updateTicketTimelineAfterNote();
        this.changeDetectionRef.detectChanges();
      } else {
        onLoadNoteAddedChange = false;
      }
    }, { allowSignalWrites: true });
   
    let onLoadTicketWorkFlowObs = true;

    this.effectTicketWorkFlowObsSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.ticketWorkFlowObsSignal() : untracked(() => this._ticketService.ticketWorkFlowObsSignal());
      if (!onLoadTicketWorkFlowObs && value && this.clearSignal()) {
        if (value == this.postObj.ticketID) {
          this.disbaleInputsAfterReplyPerformed();
          this.changeDetectionRef.detectChanges();
        }
      } else {
        onLoadTicketWorkFlowObs = false;
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.teamSelectedData = [];
    const userObj = JSON.parse(localStorage.getItem('user'));
    this.sfdcTicketView = JSON.parse(localStorage.getItem('sfdcTicketView'));

    if (userObj) {
      if (userObj?.data?.user?.role == UserRoleEnum.ReadOnlySupervisorAgent) {
        this.isReadOnly = true;
      }
      else this.isReadOnly = false;
    }
    this.subs.add(
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => {
        this.currentUser = user;
        let permission: ActionButton = this.currentUser?.data?.user?.actionButton;
        this.permissions = {
          isMaskingViewOrUpdate: permission.isMaskingViewOrUpdate,
        };
      })
      );

    this.activeTab = this.activeTab!=null? this.activeTab : this.data.tabIndex ? this.data.tabIndex: 0;
    const profileObj: any = localStorage.getItem('layoutMode') == '2' ? postDetailProfileMenu : postDetail;
    // this.activeTab = 1;

    this.subs.add(
      this._ticketService.ticketcategoryMapChange.subscribe((value) => {
        if (value) {
          if (this.postObj) {
            if (value.BaseMention.tagID === this.postObj.tagID) {
              this.fillTicketOverview();
              this.changeDetectionRef.detectChanges();
            }
          }
        }
      })
    );

    // this.subs.add(
    //   this._replyService.reAssignTicket.subscribe((value) => {
    //     if (value) {
    //       this.AssignedTo = value;
    //       this.assignAgentName = 'Assign To';
    //       this._replyService.reAssignTicketSignal.set(null);
    //     }
    //   })
    // );

    if (!this.profileInfo) {
      this.profileInfo = profileObj.profileInfo;
    }
    // this.TicketData = this._ticketService.MentionListObj;
    // const object1 = {
    //   BrandID: this._postDetailService.postObj.brandInfo.brandID,
    //   BrandName: this._postDetailService.postObj.brandInfo.brandName
    // };

    // this._ticketService.checkAutoclosureEligibility(object1).subscribe((data)=>
    // {

    //   console.log('Chala');
    // });

    // console.log(this.assignTo);

    const currentPostObject = this._postDetailService.currentPostObjectSignal();
    if (currentPostObject > 0) {
      this.currentPostObjectSignalChange(currentPostObject);
    }

    /* this.subs.add(
      this._postDetailService.currentPostObject.subscribe((value) => {
        if (value > 0) {
          this.postObj =
            this.TicketData.find((obj) => obj.ticketInfo.ticketID === value) ||
            this._postDetailService.postObj;
          this.allChannelPostObj= this.postObj
          // this.selectedPostID = this.postObj?.ticketInfo?.ticketID;
          this._postDetailService.postObj = this.postObj;
          this.author = {};
          this.ticketTimeline = {};
          this.upliftAndSentimentScore = {};
          this.ticketSumamry = {};
          if (this.postObj) {
            this.setParams();
            this.fillTicketOverview(); // this.filterService.fetchedAssignTo);
            if (this.postObj.channelGroup != ChannelGroup.Email) {
              this.getAuthorDetails();
            } else {
              this.postProfileLoading = true;
            }
            this.checkAutoClosureEligibility();
            this.setEventObservables();
            this.GetAuthorTicketDetails();
            // this.getTicketSummary();
            // this.getSentimentUpliftAndNPSScore();
          }
          this.assignUserListFlag = false;
          this.matTabGrop.selectedIndex = this.activeTab;
          if(this.activeTab==0)
          {
            if (!this.assignUserListFlag) {
              this.assignUserListFlag =
                this._postAssignToService.getAssignedUsersList(
                  this.currentUser,
                  this._postDetailService.postObj.makerCheckerMetadata.workflowStatus,
                  this.assignToDisableClass
                );
            }
            this.assignTo = this._postAssignToService.assignTo$;
            this.changeDetectionRef.detectChanges();
          }
          if (this.activeTab == 4 || this.activeTab == 0) {
            this.getTicketTimeline();
          }
          this.dispositionDetails = null;
          this.showTicketSummary = false;
          this.ticketSummarizationDetail = "";
          this.summarizationLoader = false;
          this.cdk.detectChanges();
        }
      })
    ); */

    if (this.data?.emailFlag) {
      this.upliftAndSentimentScore = {};
      this.postObj = this._postDetailService.postObj;
      this.setParams();
      this.fillTicketOverview(); // this.filterService.fetchedAssignTo);
      this.getAuthorDetails();
      this.getTicketTimeline();
      this.checkAutoClosureEligibility();
      this.setEventObservables()
      this.GetAuthorTicketDetails();
      this.changeDetectionRef.detectChanges();
    }

    const value = this._ticketService.noteAddedChangeSignal();
    if (value) {
      this.updateTicketTimelineAfterNote();
      this.changeDetectionRef.detectChanges();
    }
    
    /* this.subs.add(
      this._ticketService.noteAddedChange.subscribe((obj) => {
        if (obj) {
          this.updateTicketTimelineAfterNote();
          this.changeDetectionRef.detectChanges();
        }
      })
    ); */

    this.subs.add(
      this._postAssignToService.loadingUsers.subscribe((status) => {
        this.assignLoading = status;
        this.changeDetectionRef.detectChanges();
        // if (status) {
        //   this.getAuthorTicketMandatoryDetails();
        // }
      })
    );

    // this.subs.add(
    //   this._voip.onPerformAction.subscribe((obj) => {
    //     if (obj?.id ==TicketStatus.OnHoldAgent) {
    //       this.ticketStatus = TicketStatus.OnHoldAgent
    //       this._postDetailService.postObj.ticketInfo.status = TicketStatus.OnHoldAgent
    //       this.changeTicketStatus(TicketStatus.OnHoldAgent, true);
    //     }else if(obj?.id == 19){
    //       this.ticketStatus = TicketStatus.Close
    //     } else if (obj?.id == 18){
    //       this.ticketstatusDisableClass = true;
    //     }
    //   })
    // );

    const ticketWorkFlowObs = this._ticketService.ticketWorkFlowObsSignal();
    if (ticketWorkFlowObs) {
      if (ticketWorkFlowObs == this.postObj.ticketID) {
        this.disbaleInputsAfterReplyPerformed();
        this.changeDetectionRef.detectChanges();
      }
    }

    /* this.subs.add(
      this._ticketService.ticketWorkFlowObs.subscribe((data) => {
        if (data) {
          if (data == this.postObj.ticketID) {
            this.disbaleInputsAfterReplyPerformed();
            this.changeDetectionRef.detectChanges();
          }
        }
      })
    ); */
    /* this.subs.add(
      this._voip.onReassignVoipAgent.subscribe((value) => {
        if (value) {
          const userId = this.currentUser.data.user.userId;
          this.voipReassign(userId)
          // if (this.postObj) {
          //   if (value.tagID === this.postObj.tagID) {
          //     this.fillTicketOverview();
          //     this.changeDetectionRef.detectChanges();
          //   }
          // }
        }
      })
    ); */

    this.subs.add(
      this._ticketService.refreshFillOverview.subscribe((data) => {
        if (data != null) {
          if (
            this.esclationFlag ||
            this._postDetailService.postObj.ticketInfo.escalatedTo
          ) {
            this.ticketidDisableClass = true;
            this.assignToDisableClass = true;
            this.priorityDisableClass = true;
            this.ticketstatusDisableClass = true;
          } else {
            if (this.ticketStatus != TicketStatus.Close) {
              this.ticketidDisableClass = false;
              this.assignToDisableClass = this.assignementEnabled
                ? false
                : true;
              this.priorityDisableClass = this.changePriorityEnabled
                ? false
                : true;
              this.ticketstatusDisableClass = false;
            } else {
              this.ticketidDisableClass = true;
              this.assignToDisableClass = true;
              this.priorityDisableClass = true;
              this.ticketstatusDisableClass = false;
            }
          }
          this.ticketStatus = this._postDetailService.postObj.ticketInfo.status;
          this._ticketService.refreshFillOverview.next(null);
          // if (this._postDetailService.postObj.ticketInfo.escalatedTo) {
          //   this._ticketService.changeAssignee.next(
          //     this._postDetailService.postObj.ticketInfo.escalatedTo
          //   );
          // }
          this.changeDetectionRef.detectChanges();
        }
      })
    );
    this.changePriorityEnabled =
      this.currentUser?.data?.user?.actionButton?.changeTicketPriorityEnabled;
    this.editPersonalDetailsEnabled =
      this.currentUser?.data?.user?.actionButton?.editPersonalDetailsEnabled;
    if (this.activeTab == 3) {
      this.getTicketTimeline();
    }

    this.getTicketDetails();

    // this.subs.add(
    //   this._ticketService.ticketEscalationObs.subscribe((res)=>{
    //     if(res)
    //     {
    //       this.assignToDisableClass=true;
    //       this.cdk.detectChanges();
    //     }
    //   })
    // )

    const valueTicketDispositionListSignal = this._replyService.ticketDispositionListSignal();
    if (valueTicketDispositionListSignal) {
      this.ticketDispositionListSignalChanges(valueTicketDispositionListSignal);
    }
    // this.subs.add(
    //   this._replyService.ticketDispositionList.subscribe((response) => {
    //     if(response) {
    //       this.ticketDispositionList = response
    //     }
    //   })
    // )

    this.subs.add(
      this._aiFeatureService.ticketSummarization.subscribe((data) => {
        if (data) {
          if (data?.IsTicketSummarizationEnabled && data?.IsAISuggestedFeatureEnabled ) {
            this.isTicketSummarizationEnable = true;
          } else {
            this.isTicketSummarizationEnable = false;
          }
        } else {
          this.getSuggestedRresponse();
        }
      })
    )

    this.subs.add(
      this._aiFeatureService.ticketSummarizationCreditDetails.subscribe((data)=>{
        if(data){
          this.isTicketSummaryCreditExpired = data.credit_expired;
          if (!this.isTicketSummaryCreditExpired) {
            if (data.credit_expired_alert) {
              this.ticketSummaryLogo = 'assets/images/media/smart_suggestion-expirealert.svg';
              this.ticketSummaryTooltip = this.translate.instant('AI-Ticket-Summarization');
            } else {
              this.ticketSummaryLogo = "assets/images/common/stars__blue.svg";
              this.ticketSummaryTooltip = '';
            }
          } else {
            this.ticketSummaryLogo = 'assets/images/media/smart_suggestion-expire.svg';
            this.ticketSummaryTooltip = this.translate.instant('AI-Ticket-Summarization-Credit-Expired');
          }
        } else {
          this.getAICreditStatus();
        }
      })
    )

    this.subs.add(this._ticketService.failedToUpdateTicketStatus.subscribe((ticketDetails) => {
      if (ticketDetails.ticketId && this.postObj.ticketID == ticketDetails.ticketId) {
        
        if (!ticketDetails.isOnlyUpdate){
          this.ticketStatus = this.previousTicketStatus;
          this._postDetailService.postObj.ticketInfo.status = this.previousTicketStatus;
        }

        this.fillTicketOverview();
        if (!ticketDetails?.isOnlyUpdate){
          this.TicketData.unshift(this._postDetailService.postObj);
        }
        this.changeDetectionRef.detectChanges();
      }
    })
    )
    // this.getAuthorTicketMandatoryDetails();
    // this.subs.add(
    //   this._userDetailService.updateTicketFields.subscribe((res) => {
    //     if (res) {
    //       this.getAuthorTicketMandatoryDetails();
    //     }
    //   })
    // );
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.postObj?.brandInfo?.brandID
    );
    // if (brandInfo?.aiTagEnabled) {
    //   this.generateClosingTicketTag();
    // }
    this.isAgentIqEnabled = brandInfo?.isAgentIQEnabled;
    this.showIqOnDirectClose = brandInfo?.showIQOnDirectClose;
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this.cdkRef.detectChanges();
        }
      })
    )

    this.subs.add(
      this._ticketService.signalBasedMentionCountUpdate.subscribe((res) => {
        if(res){
          this._ticketService.signalBasedMentionCountUpdate.next(false);
          this.getTicketSummary();
          this.cdk.detectChanges();
        }
      })
    )

    this.subs.add(
      this._ticketService.addNoteEmitFromOpenDetail.subscribe(res => {
        if(res){
          this.selectedNoteMedia = res;
          this.mediaSelectedAsync.next(res);
        }
      })
    );
  }

  getTicketDetails(){
    this.ticketDetailsForm
      .get('bookingNumber')
      .valueChanges.subscribe((control) => {
        if (
          control !== this.ticketSumamry?.ticketDetails?.bookingNumber && this.ticketDetailsForm?.value?.bookingNumber !== control
        ) {
          this.isBookingNumberChanged = true;
        } else {
          this.isBookingNumberChanged = false;
        }
        if (
          this.isBookingNumberChanged ||
          this.isTicketDescriptionChanged ||
          this.isCustomerIDChanged
        ) {
          this.showTicketUpdate = true;
        } else {
          this.showTicketUpdate = false;
        }
      })
    this.ticketDetailsForm
      .get('customerID')
      .valueChanges.subscribe((control) => {
        if (
          control !== this.ticketSumamry?.ticketDetails?.ticketCustomerID && this.ticketDetailsForm?.value?.customerID !== control
        ) {
          this.isCustomerIDChanged = true;
        } else {
          this.isCustomerIDChanged = false;
        }
        if (
          this.isBookingNumberChanged ||
          this.isTicketDescriptionChanged ||
          this.isCustomerIDChanged
        ) {
          this.showTicketUpdate = true;
        } else {
          this.showTicketUpdate = false;
        }
      })
    this.ticketDetailsForm
      .get('ticketDescription')
      .valueChanges.subscribe((control) => {
        if (
          control !== this.ticketSumamry?.ticketDetails?.ticketDescription && this.ticketDetailsForm?.value?.ticketDescription !== control
        ) {
          this.isTicketDescriptionChanged = true;
        } else {
          this.isTicketDescriptionChanged = false;
        }
        if (
          this.isBookingNumberChanged ||
          this.isTicketDescriptionChanged ||
          this.isCustomerIDChanged
        ) {
          this.showTicketUpdate = true;
        } else {
          this.showTicketUpdate = false;
        }
      })
  }

  reAssignTicketSignal(value){
    if (value) {
      this.AssignedTo = value;
      this.assignAgentName = 'Assign To';
      this._replyService.reAssignTicketSignal.set(null);
    }
  }

  ticketEscalationObsSignalChange(res){
    if (res) {
      this.assignToDisableClass = true;
      this.cdk.detectChanges();
    }
  }

  ticketDispositionListSignalChanges(response){
    if (response) {
      this.ticketDispositionList = response
    }
  }
  replyActionPerformedSignalChanges(obj){
    if (obj) {
      if (
        obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID
        // && obj.ticketInfo.tagID === this.postObj.ticketInfo.tagID
      ) {
        if (obj.ticketInfo.status == 13) {
          if (this.IsCSDUser) {
            this.onholdstatus = TicketStatus.OnHoldCSD;
            this.ticketStatus = TicketStatus.OnHoldCSD;
          } else if (this.IsBrandUser) {
            this.onholdstatus = TicketStatus.OnHoldBrand;
            this.ticketStatus = TicketStatus.OnHoldBrand;
          } else {
            this.onholdstatus = TicketStatus.OnHoldAgent;
            this.ticketStatus = TicketStatus.OnHoldAgent;
          }
          this._postDetailService.postObj.ticketInfo.status =
            this.onholdstatus;
          this.esclationFlag = false;
        } else if (obj.ticketInfo.status == 5) {
          this.esclationFlag = true;
          this._postDetailService.postObj.ticketInfo.status = 0;
        } else if (obj.ticketInfo.status == 14) {
          this.esclationFlag = false;
          this._postDetailService.postObj.ticketInfo.status = 7;
        } else {
          this.esclationFlag = false;
          this.ticketStatus = obj.ticketInfo.status;
        }
        if (obj.ticketInfo.escalatedTo) {
          this._postDetailService.postObj.ticketInfo.escalatedTo =
            obj.ticketInfo.escalatedTo;
        }
        if (obj.ticketInfo.status == TicketStatus.Close) {
          this._postDetailService.postObj.ticketInfo.status = 3;
          this.postObj.ticketInfo.status = 3;
          this.TicketOverviewEnableDisableSection(obj);
        } else {
          if (this)
            this.disbaleInputsAfterReplyPerformed();
        }
        this.fillTicketOverview();
        this.changeDetectionRef.detectChanges();
      }
    }
  }

  updateTicketDetails(){
    this.updateTicketDetailsLoader = true
    const obj={
      BrandInfo: { BrandID: this.postObj.brandInfo.brandID },
      ticketDetailsCRM: {
        TicketID: this.ticketSumamry.ticketID,
        BookingNumber: this.ticketDetailsForm.get('bookingNumber').value,
        TicketCustomerID: this.ticketDetailsForm.get('customerID').value,
        TicketDescription: this.ticketDetailsForm.get('ticketDescription').value,
      }
    }

    this.updateTicketDetailsapi = this._userDetailService
      .updateTicketDetails(obj)
      .subscribe(
        (data) => {
          if(data.success){
            this.updateTicketDetailsLoader = false
            this.getTicketSummary();
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Ticket-details-updated-successfully'),
              },
            });
          }else{
            this.updateTicketDetailsLoader = false
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translate.instant('Unable-to-update-details'),
              },
          })
        }
        },
        (error) => {
          this.updateTicketDetailsLoader = false
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Unable-to-update-details'),
            },
          })
        })
  }

  setEventObservables(): void {
    this.subs.add(
      this._replyService.setTicktOverview.subscribe((obj) => {
        if (obj) {
          if (obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
            this.TicketOverviewEnableDisableSection(obj);
          }
        }
      })
    );

    // this.subs.add(
    //   this._replyService.replyActionPerformed.subscribe((obj) => {
    //     if (obj) {
    //       if (
    //         obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID 
    //         // && obj.ticketInfo.tagID === this.postObj.ticketInfo.tagID
    //       ) {
    //         if (obj.ticketInfo.status == 13) {
    //           if (this.IsCSDUser) {
    //             this.onholdstatus = TicketStatus.OnHoldCSD;
    //             this.ticketStatus = TicketStatus.OnHoldCSD;
    //           } else if (this.IsBrandUser) {
    //             this.onholdstatus = TicketStatus.OnHoldBrand;
    //             this.ticketStatus = TicketStatus.OnHoldBrand;
    //           } else {
    //             this.onholdstatus = TicketStatus.OnHoldAgent;
    //             this.ticketStatus = TicketStatus.OnHoldAgent;
    //           }
    //           this._postDetailService.postObj.ticketInfo.status =
    //             this.onholdstatus;
    //           this.esclationFlag = false;
    //         } else if (obj.ticketInfo.status == 5) {
    //           this.esclationFlag = true;
    //           this._postDetailService.postObj.ticketInfo.status = 0;
    //         } else if (obj.ticketInfo.status == 14) {
    //           this.esclationFlag = false;
    //           this._postDetailService.postObj.ticketInfo.status = 7;
    //         } else {
    //           this.esclationFlag = false;
    //           this.ticketStatus = obj.ticketInfo.status;
    //         }
    //         if (obj.ticketInfo.escalatedTo) {
    //           this._postDetailService.postObj.ticketInfo.escalatedTo =
    //             obj.ticketInfo.escalatedTo;
    //         }
    //         if (obj.ticketInfo.status == TicketStatus.Close) {
    //           this._postDetailService.postObj.ticketInfo.status = 3;
    //           this.postObj.ticketInfo.status = 3;
    //           this.TicketOverviewEnableDisableSection(obj);
    //         } else {
    //           if(this)
    //           this.disbaleInputsAfterReplyPerformed();
    //         }
    //         this.fillTicketOverview();
    //         this.changeDetectionRef.detectChanges();
    //       }
    //     }
    //   })
    // );

    // this.subs.add(
    //   this._postDetailService.updateTicketCategory.subscribe((res) => {
    //     if (res) {
    //       this.postObj.ticketInfo.ticketCategoryMap = res?.categoryCards;
    //       this.postObj.dispositionName = res?.dispositionName;
    //       this.changeUpperCategory();
    //     }
    //   })
    // );

    const value = this._ticketService.bulkActionPerformedSignal();
    if (value) {
      if (value.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
        this.disbaleInputsAfterBulkPerformed();
        this.changeDetectionRef.detectChanges();
      }
    }
    /* this.subs.add(
      this._ticketService.bulkActionPerformed.subscribe((obj) => {
        if (obj) {
          if (obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
            this.disbaleInputsAfterBulkPerformed();
            this.changeDetectionRef.detectChanges();
          }
        }
      })
    ); */

    this.subs.add(
      this._ticketService.bulkActionEnablePerformed.subscribe((obj) => {
        if (obj) {
          if (obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
            this.enableInputsAfterBulkPerformed();
            this.changeDetectionRef.detectChanges();
          }
        }
      })
    );

    const ssreActionPerformed = this._ticketService.ssreActionPerformedSignal();
    if (ssreActionPerformed) {
      if (ssreActionPerformed.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
        this.disbaleInputsAfterBulkPerformed();
        this.changeDetectionRef.detectChanges();
      }
    }
    /* this.subs.add(
      this._ticketService.ssreActionPerformed.subscribe((obj) => {
        if (obj) {
          if (obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
            this.disbaleInputsAfterBulkPerformed();
            this.changeDetectionRef.detectChanges();
          }
        }
      })
    ); */

    this.subs.add(
      this._ticketService.ssreActionEnablePerformed.subscribe((obj) => {
        if (obj) {
          if (obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
            this.enableInputsAfterBulkPerformed();
            this.changeDetectionRef.detectChanges();
          }
        }
      })
    );

    const postDetailObjectChanged = this._replyService.postDetailObjectChangedSignal();
    if (postDetailObjectChanged) {
      this.postDetailObjectChangedSignalChange(postDetailObjectChanged)
    }
    /* this.subs.add(
      this._replyService.postDetailObjectChanged.subscribe((obj) => {
        if (obj) {
          if (obj.ticketInfo.ticketID === this.postObj.ticketInfo.ticketID) {
            this.postObj.ticketInfo.ticketCategoryMap =
              this._postDetailService.postObj.ticketInfo.ticketCategoryMap;
            this.postObj.categoryMap =
              this._postDetailService.postObj.categoryMap;
            this.setCategoryMapping();
            // if (
            //   this.ticketStatus == TicketStatus.Open ||
            //   this.ticketStatus == TicketStatus.Close ||
            //   this.ticketStatus == TicketStatus.OnHoldCSD ||
            //   this.ticketStatus == TicketStatus.CustomerInfoAwaited
            // ) {
            //   this.ticketStatus =
            //     this._postDetailService.postObj.ticketInfo.status;
            // }
            // this.fillTicketOverview();
          }
          this.changeDetectionRef.detectChanges();
        }
      })
    ); */

    // if (this.postObj.channelGroup === ChannelGroup.Email) {
    //   this._replyService.emitEmailReadStatus.subscribe((obj) => {
    //     if (obj) {
    //       if (obj.ticketId == this.postObj.ticketInfo.ticketID) {
    //         if (obj.status) {
    //           this.postObj.allMentionInThisTicketIsRead = true;
    //         }
    //       }
    //       this.changeDetectionRef.detectChanges();
    //     }
    //   });
    // }
    this.checkTicketCategoryOptionFlag(this.postObj);
    this._replyService.setTicktOverview.next(null);
  }

  disbaleInputsAfterReplyPerformed(): void {
    this.ticketidDisableClass = true;
    this.priorityDisableClass = true;
    this.ticketstatusDisableClass = true;
  }

  emitEmailReadStatusSignalChanges(obj){
    if (obj) {
      if (obj.ticketId == this.postObj.ticketInfo.ticketID) {
        if (obj.status) {
          this.postObj.allMentionInThisTicketIsRead = true;
        }
      }
      this.changeDetectionRef.detectChanges();
    }
  }

  updateTicketCategorySignalChanges(res){
    if (res) {
      this.postObj.ticketInfo.ticketCategoryMap = res?.categoryCards;
      this.postObj.dispositionName = res?.dispositionName;
      this.changeUpperCategory();
    }
  }
  
  disbaleInputsAfterBulkPerformed(): void {
    this.ticketidDisableClass = true;
    this.priorityDisableClass = true;
    this.ticketstatusDisableClass = true;
    this.assignToDisableClass = true;
  }
  enableInputsAfterBulkPerformed(): void {
    this.ticketidDisableClass = false;
    this.priorityDisableClass = this.changePriorityEnabled ? false : true;
    this.ticketstatusDisableClass = false;
    this.assignToDisableClass = this.assignementEnabled ? false : true;
  }
  updateTicketTimelineAfterNote(): void {
    /* this._ticketService.noteAddedChange.next(false); */
    this._ticketService.noteAddedChangeSignal.set(false);
    this.getTicketTimeline(null);
  }

  public get logstatusEnum(): typeof LogStatus {
    return LogStatus;
  }
  public get actionstatusEnum(): typeof ActionTaken {
    return ActionTaken;
  }
  public get channelGroupEnum(): typeof ChannelGroup {
    return ChannelGroup;
  }

  setParams(): void {
    if (this.postObj.ticketInfo.status === TicketStatus.Close) {
      //this.disableTicketSections = true;
      this.previousTicketStatus = TicketStatus.Close;
      this.ticketStatus = TicketStatus.Close;
    } else if (this.postObj.ticketInfo.status === TicketStatus.Open) {
      //this.disableTicketSections = false;
      this.previousTicketStatus = TicketStatus.Open;
      this.ticketStatus = TicketStatus.Open;
    }
  }

  mapCRMColumns(author: BaseSocialAuthor): void {
    if (author && author.crmColumns) {
      this.customCrmColumns = [];
      for (const column of author.crmColumns.existingColumns) {
        const crmObj: CustomCrmColumns = {};
        if (!column.isDisabled && !column.isDeleted) {
          switch (column.dbColumn) {
            case 'Name':
              crmObj.id = 'PersonalDetailsName';
              crmObj.value = author.locoBuzzCRMDetails.name
                ? author.locoBuzzCRMDetails.name
                : '';
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
              crmObj.id = 'PersonalDetailsNumber';
              const phoneNumber = author.locoBuzzCRMDetails.phoneNumber ? author.locoBuzzCRMDetails.phoneNumber : this._postDetailService?.postObj?.author?.channelGroup == ChannelGroup.WhatsApp ? this._postDetailService?.postObj?.author?.socialId : '';
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
          crmObj.maxlength =
            column.characterLimit && column.characterLimit > 0
              ? column.characterLimit
              : null;
             if (column.columnDataType == 1) {
            crmObj.regex = '^[0-9]*$';
          } else if (column.columnDataType == 3) {
            crmObj.regex = '^[0][1-9][0-9]{9}$|^[1-9][0-9]{9}$';
          } else if (column.columnDataType == 7) {
            // crmObj.regex = `/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]*$/`;
          }
          crmObj.columnDataType = column.columnDataType;
          crmObj.isMaskingEnabled = column?.isMaskingEnabled && crmObj.value ? column.isMaskingEnabled : false;
          crmObj.isShow = false;
          this.customCrmColumns.push(crmObj);
          if (crmObj.value) {
            this.CrmDetails.push({ id: crmObj.dbColumn, value: crmObj.value });
          }
        }
      }
    }

    if (
      author.locoBuzzCRMDetails?.customCRMColumnXml &&
      author.locoBuzzCRMDetails?.customCRMColumnXml.length > 0
    ) {
      for (const column of author.locoBuzzCRMDetails?.customCRMColumnXml) {
        const crmObj: CustomCrmColumns = {};
        const dropDownField = author?.crmColumns?.customColumns.find((obj) => obj.orderID == column.orderID);
        if (dropDownField && !column.isDisabled && !dropDownField.isDeleted) {
          crmObj.id = column.columnLable;
          crmObj.value = column.customColumValue ? column.customColumValue : '';
          crmObj.dbColumn = column.columnLable;
          crmObj.dbColumnName = column.columnLable;
          crmObj.maxlength =
            column.characterLimit && column.characterLimit > 0
              ? column.characterLimit
              : null;
          crmObj.columnDataType = column.columnDataType;
         if (column.columnDataType == 1) {
            crmObj.regex = '^[0-9]*$';
          } else if (column.columnDataType == 3) {
            crmObj.regex = '^[0][1-9][0-9]{9}$|^[1-9][0-9]{9}$';
          } else if (column.columnDataType == 7) {
            // crmObj.regex = `/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]*$/`;
          }


          if (dropDownField &&dropDownField?.columnDataType == 5 && dropDownField?.columnLable == column.columnLable && (column.dropDownData == null || column.dropDownData==undefined))
          {
            column.dropDownData=dropDownField?.dropDownData;
            crmObj.columnDataType=5
          }

          if (crmObj.columnDataType == 5) {
            let d = column?.dropDownData?.substring(
              1,
              column?.dropDownData?.length - 1
            );

            if (d) {
              crmObj.dropDownData = JSON.parse(d);
              crmObj.dbColumn2 = crmObj.dropDownData?.DropDownName + '_2';
              crmObj.dbColumn3 = crmObj.dropDownData?.DropDownName + '_3';
              crmObj.dbColumn4 = crmObj.dropDownData?.DropDownName + '_4';
              crmObj.dbColumn5 = crmObj.dropDownData?.DropDownName + '_5';
              crmObj.dbColumn6 = crmObj.dropDownData?.DropDownName + '_6';

              // Find value2 and index for first level
              crmObj.value2 = crmObj.dropDownData?.DropDownData.find(
                (res) => crmObj.dropDownData.selected === res.Value
              )?.selected;

              crmObj.dropDownData.index = crmObj.dropDownData?.DropDownData.findIndex(
                (res) => crmObj.dropDownData.selected === res.Value
              );

              // Check if first level has data and valid index
              if (crmObj.dropDownData?.DropDownData &&
                crmObj.dropDownData?.DropDownData.length &&
                (crmObj.dropDownData.index || crmObj.dropDownData.index == 0)) {

                // Second level navigation
                if (crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData &&
                  crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.length) {

                  crmObj.value3 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.find(
                    (res) => crmObj.value2 === res.Value
                  )?.selected;

                  crmObj.dropDownData.indexOne = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.findIndex(
                    (res) => crmObj.value2 === res.Value
                  );

                  // Third level navigation for value4
                  if (crmObj.dropDownData.indexOne !== -1 &&
                    crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData &&
                    crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData.length) {

                    crmObj.value4 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData.find(
                      (res) => crmObj.value3 === res.Value
                    )?.selected;

                    crmObj.dropDownData.indexTwo = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData.findIndex(
                      (res) => crmObj.value3 === res.Value
                    );

                    // Fourth level navigation for value5
                    if (crmObj.dropDownData.indexTwo !== -1 &&
                      crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData &&
                      crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData.length) {

                      crmObj.value5 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData.find(
                        (res) => crmObj.value4 === res.Value
                      )?.selected;

                      crmObj.dropDownData.indexThree = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData.findIndex(
                        (res) => crmObj.value4 === res.Value
                      );

                      // Fifth level navigation for value6
                      if (crmObj.dropDownData.indexThree !== -1 &&
                        crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData &&
                        crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData.length) {

                        crmObj.value6 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData.find(
                          (res) => crmObj.value5 === res.Value
                        )?.selected;

                        crmObj.dropDownData.indexFour = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData.findIndex(
                          (res) => crmObj.value5 === res.Value
                        );
                      }
                    }
                  }
                }
              }
            }
          }

          if (column.columnDataType == 2) {
            crmObj.value =
              column.customColumValue != null
                ? new Date(column.customColumValue)
                : '';
          } else {
            crmObj.value = column.customColumValue
              ? column.customColumValue
              : '';
          }
          // if (column.columnDataType == 5) {
          //   crmObj.dropDownData = column
          // }
          crmObj.isMaskingEnabled = column?.isMaskingEnabled && crmObj.value ? column.isMaskingEnabled : false;
          crmObj.isShow = false;
          const isExist = author.crmColumns.customColumns.some((obj) => obj.orderID == column.orderID && obj.columnLable == column.columnLable)
          if (isExist)
          {
          this.customCrmColumns.push(crmObj);
          }
          // this.personalDetailForm.addControl(crmObj.dropDownData.DropDownName + '_2', new FormControl(''))
          if (crmObj.value && isExist) {
            this.CrmDetails.push({
              id: crmObj.dbColumn,
              value: crmObj.value,
              dataType: crmObj.columnDataType,
            });
          }
        }
      }
    } else {
      for (const column of author.crmColumns?.customColumns) {
        const crmObj: CustomCrmColumns = {};
        if (!column.isDisabled && !column.isDeleted) {
          crmObj.id = column.columnLable;
          crmObj.orderID = column.orderID;
          crmObj.value = column.customColumValue ? column.customColumValue : '';
          crmObj.dbColumn = column.columnLable;
          crmObj.dbColumnName = column.columnLable;
          crmObj.maxlength =
            column.characterLimit && column.characterLimit > 0
              ? column.characterLimit
              : null;
          crmObj.columnDataType = column.columnDataType;
          let d = column?.dropDownData?.substring(
            1,
            column?.dropDownData?.length - 1
          );
          if (d) {
            crmObj.dropDownData = JSON.parse(d);
            crmObj.dbColumn2 = crmObj.dropDownData?.DropDownName + '_2';
            crmObj.dbColumn3 = crmObj.dropDownData?.DropDownName + '_3';
            crmObj.value2 = crmObj.dropDownData?.DropDownData.find(
              (res) => crmObj.dropDownData.selected === res.Value
            )?.selected;
            crmObj.dropDownData.index = crmObj.dropDownData?.DropDownData.findIndex(
              (res) => crmObj.dropDownData.selected === res.Value
            );
            if (crmObj.dropDownData?.DropDownData && crmObj.dropDownData?.DropDownData.length && (crmObj.dropDownData.index || crmObj.dropDownData.index == 0)) {
              if (crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData && crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.length) {
                crmObj.value3 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.find(
                  (res) => crmObj.value2 === res.Value
                )?.selected;
                crmObj.dropDownData.indexOne = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.findIndex(
                  (res) => crmObj.value2 === res.Value
                );
              }
            }
            // crmObj.value2 =
            //   crmObj.dropDownData?.DropDownData[
            //     crmObj?.dropDownData?.index
            //   ]?.selected;
            // crmObj.value3 =
            //   crmObj.dropDownData?.DropDownData[
            //     crmObj?.dropDownData?.index
            //   ]?.DropDownData[crmObj?.dropDownData?.indexOne]?.selected;
          }
          if (column.columnDataType == 2) {
            crmObj.value =
              column.customColumValue != null
                ? new Date(column.customColumValue)
                : '';
          } else {
            crmObj.value = column.customColumValue
              ? column.customColumValue
              : '';
          }
          crmObj.isMaskingEnabled = column?.isMaskingEnabled && crmObj.value ? column.isMaskingEnabled : false;
          crmObj.isShow = false;
          this.customCrmColumns.push(crmObj);
          if (crmObj.value) {
            this.CrmDetails.push({
              id: crmObj.dbColumn,
              value: crmObj.value,
              dataType: crmObj.columnDataType,
            });
          }
        }
      }
    }

    this.createFormGroup(this.customCrmColumns);
    this.author = author;
    this.changeDetectionRef.detectChanges();

  }

  mapTicketCustomFieldColumns(author: any): void {
    if (author && author.ticketInfoAcconts && author.ticketInfoAcconts?.length) {
      this.customTicketCrmColumns = [];
      const customArray = author.ticketInfoAcconts[0].ticketMainCRMColumnXml
      for (const column of customArray) {
        const crmObj: CustomCrmColumns = {};
        if (!customArray.isDisabled && !customArray.isDeleted) {
          crmObj.value = '';
          switch (column.dbColumn) {
            case 'Booking/RefNo.':
              crmObj.value = author.ticketInfoOnSave && author.ticketInfoOnSave.length && author.ticketInfoOnSave[0].bookingNumber ? author.ticketInfoOnSave[0].bookingNumber : '';
              break;
            case 'BookingRefNo':
              crmObj.value = author.ticketInfoOnSave && author.ticketInfoOnSave.length && author.ticketInfoOnSave[0].bookingNumber ? author.ticketInfoOnSave[0].bookingNumber : '';
              break;
            case 'CustomerId':
              crmObj.value = author.ticketInfoOnSave && author.ticketInfoOnSave.length && author.ticketInfoOnSave[0].customerID ? author.ticketInfoOnSave[0].customerID : '';
              break;
            case 'CustomerID':
              crmObj.value = author.ticketInfoOnSave && author.ticketInfoOnSave.length && author.ticketInfoOnSave[0].customerID ? author.ticketInfoOnSave[0].customerID : '';
              break;
            case 'Description':
              crmObj.value = author.ticketInfoOnSave && author.ticketInfoOnSave.length && author.ticketInfoOnSave[0].description ? author.ticketInfoOnSave[0].description : '';
              break;
          }
          crmObj.id = column.dbColumn;
          crmObj.dbColumn = column.dbColumn;
          crmObj.dbColumnName = column.columnLable;
          crmObj.maxlength =
            column.characterLimit && column.characterLimit > 0
              ? column.characterLimit
              : null;
          if (column.columnDataType == 1) {
            crmObj.regex = '^[0-9]*$';
          } else if (column.columnDataType == 3) {
            // crmObj.regex = '^[0][1-9][0-9]{9}$|^[1-9][0-9]{9}$';
          } else if (column.columnDataType == 4) {
            crmObj.regex = `^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$`;
          }else if (column.columnDataType == 7) {
            crmObj.regex = `^[a-zA-Z0-9\\-\\s]+$`;
          }
          crmObj.columnDataType = column.columnDataType
          this.customTicketCrmColumns.push(crmObj);
          if (crmObj.value) {
            this.CrmCustomTicketDetails.push({ id: crmObj.dbColumn, value: crmObj.value });
          }
        }
      }
    }

    if (
      author.ticketInfoAcconts?.length && author.ticketInfoAcconts[0].ticketCustomCRMColumnXml &&
      author.ticketInfoAcconts[0].ticketCustomCRMColumnXml.length > 0
    ) {
      const customArray = author.ticketInfoAcconts[0].ticketCustomCRMColumnXml
      for (const column of customArray) {
        const crmObj: CustomCrmColumns = {};
        if (!column.isDisabled && !column.isDeleted) {
          crmObj.value = column.customColumValue ? column.customColumValue : '';
          if (author?.ticketInfoOnSave && author?.ticketInfoOnSave.length && author?.ticketInfoOnSave[0].ticketCustomColumnXml && author?.ticketInfoOnSave[0].ticketCustomColumnXml.length){
            const isExist = author?.ticketInfoOnSave[0].ticketCustomColumnXml.find(res => res.dbColumn == column.dbColumn);
            if(isExist) {
              crmObj.value = isExist.customColumValue ? isExist.customColumValue : '';
              if (isExist.columnDataType == 5 && isExist?.dropDownData) {
                let parsedColumn = JSON.parse(column.dropDownData);
                let parsedisExist = JSON.parse(isExist.dropDownData);
                for (const parentItem of parsedColumn) {
                  const matchParent = parsedisExist.find((x) => x.DropDownName === parentItem.DropDownName);
                  if (matchParent) {
                    for (const childItem of parentItem.DropDownData) {
                      const matchChild = matchParent.DropDownData.find((y) => y.Value === childItem.Value);
                      if (matchChild) {
                        this.copyProperties(childItem, matchChild, ['selected']);

                        for (const subChildItem of childItem.DropDownData || []) {
                          const matchSubChild = matchChild.DropDownData.find((z) => z.Value === subChildItem.Value);
                          if (matchSubChild) {
                            this.copyProperties(subChildItem, matchSubChild, ['selected']);

                            for (const subSubChildItem of subChildItem.DropDownData || []) {
                              const matchSubSubChild = matchSubChild.DropDownData.find((a) => a.Value === subSubChildItem.Value);
                              if (matchSubSubChild) {
                                this.copyProperties(subSubChildItem, matchSubSubChild, ['selected']);

                                for (const subSubSubChildItem of subSubChildItem.DropDownData || []) {
                                  const matchSubSubSubChild = matchSubSubChild.DropDownData.find((b) => b.Value === subSubSubChildItem.Value);
                                  if (matchSubSubSubChild) {
                                    this.copyProperties(subSubSubChildItem, matchSubSubSubChild, ['selected']);

                                    for (const subSubSubSubChildItem of subSubSubChildItem.DropDownData || []) {
                                      const matchSubSubSubSubChild = matchSubSubSubChild.DropDownData.find((c) => c.Value === subSubSubSubChildItem.Value);
                                      if (matchSubSubSubSubChild) {
                                        this.copyProperties(subSubSubSubChildItem, matchSubSubSubSubChild, ['selected']);

                                        for (const subSubSubSubSubChildItem of subSubSubSubChildItem.DropDownData || []) {
                                          const matchSubSubSubSubSubChild = matchSubSubSubSubChild.DropDownData.find((d) => d.Value === subSubSubSubSubChildItem.Value);
                                          if (matchSubSubSubSubSubChild) {
                                            this.copyProperties(subSubSubSubSubChildItem, matchSubSubSubSubSubChild, ['selected']);
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }

                    this.copyProperties(parentItem, matchParent, ['selected']);
                  }
                }
                column.dropDownData = JSON.stringify(parsedColumn);
              } else if (column.columnDataType == 8) {
                // crmObj.value = JSON.parse(column.dropDownData)
                column.dropDownData = isExist.dropDownData ? this.checkReturnValidJSON(isExist.dropDownData):''
                crmObj.value = isExist.dropDownData? JSON.parse(isExist.dropDownData):''
                crmObj.dropDownData = column.dropDownData
              }

            }
          }
          crmObj.id = column.columnLable;
          crmObj.dbColumn = column.columnLable;
          crmObj.dbColumnName = column.columnLable;
          crmObj.maxlength =
            column.characterLimit && column.characterLimit > 0
              ? column.characterLimit
              : null;
          crmObj.columnDataType = column.columnDataType;
          if (column.columnDataType == 1) {
            crmObj.regex = '^[0-9]*$';
          } else if (column.columnDataType == 3) {
            // crmObj.regex = '^[0][1-9][0-9]{9}$|^[1-9][0-9]{9}$';
          } else if (column.columnDataType == 4) {
            crmObj.regex = `^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$`;
          } else if (column.columnDataType == 7) {
            crmObj.regex = `^[a-zA-Z0-9\\-\\s]+$`;
          }
          if (crmObj.columnDataType == 5) {
            let d = column?.dropDownData?.substring(
              1,
              column?.dropDownData?.length - 1
            );
            if (d) {
              crmObj.dropDownData = JSON.parse(d);
              crmObj.dbColumn2 = crmObj.dropDownData?.DropDownName + '_2';
              crmObj.dbColumn3 = crmObj.dropDownData?.DropDownName + '_3';
              crmObj.dbColumn4 = crmObj.dropDownData?.DropDownName + '_4';
              crmObj.dbColumn5 = crmObj.dropDownData?.DropDownName + '_5';
              crmObj.dbColumn6 = crmObj.dropDownData?.DropDownName + '_6';
              crmObj.value2 = crmObj.dropDownData?.DropDownData.find(
                (res) => crmObj.dropDownData.selected === res.Value
              )?.selected;
              crmObj.dropDownData.index = crmObj.dropDownData?.DropDownData.findIndex(
                (res) => crmObj.dropDownData.selected === res.Value
              );
              if (crmObj.dropDownData?.DropDownData && crmObj.dropDownData?.DropDownData.length && (crmObj.dropDownData.index || crmObj.dropDownData.index == 0)) {
                if (crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData && crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.length) {
                  crmObj.value3 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.find(
                    (res) => crmObj.value2 === res.Value
                  )?.selected;
                  crmObj.dropDownData.indexOne = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData.findIndex(
                    (res) => crmObj.value2 === res.Value
                  );

                  if (crmObj.dropDownData.indexOne !== -1 &&
                    crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData &&
                    crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData.length) {

                    crmObj.value4 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData.find(
                      (res) => crmObj.value3 === res.Value
                    )?.selected;

                    crmObj.dropDownData.indexTwo = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData.findIndex(
                      (res) => crmObj.value3 === res.Value
                    );

                    if (crmObj.dropDownData.indexTwo !== -1 &&
                      crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData &&
                      crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData.length) {

                      crmObj.value5 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData.find(
                        (res) => crmObj.value4 === res.Value
                      )?.selected;

                      crmObj.dropDownData.indexThree = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData.findIndex(
                        (res) => crmObj.value4 === res.Value
                      );

                      if (crmObj.dropDownData.indexThree !== -1 &&
                        crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData &&
                        crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData.length) {

                        crmObj.value6 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData.find(
                          (res) => crmObj.value5 === res.Value
                        )?.selected;

                        crmObj.dropDownData.indexFour = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData.findIndex(
                          (res) => crmObj.value5 === res.Value
                        );

                        // if (crmObj.dropDownData.indexFour !== -1 &&
                        //   crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData[crmObj.dropDownData.indexFour]?.DropDownData &&
                        //   crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData[crmObj.dropDownData.indexFour]?.DropDownData.length) {

                        //   crmObj.value7 = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData[crmObj.dropDownData.indexFour]?.DropDownData.find(
                        //     (res) => crmObj.value6 === res.Value
                        //   )?.selected;

                        //   crmObj.dropDownData.indexFive = crmObj.dropDownData?.DropDownData[crmObj?.dropDownData?.index]?.DropDownData[crmObj.dropDownData.indexOne]?.DropDownData[crmObj.dropDownData.indexTwo]?.DropDownData[crmObj.dropDownData.indexThree]?.DropDownData[crmObj.dropDownData.indexFour]?.DropDownData.findIndex(
                        //     (res) => crmObj.value6 === res.Value
                        //   );
                        // }
                      }
                }
                    }
                  }
              }
            }
          }

          if (column.columnDataType == 2) {
            crmObj.value = column.customColumValue ? new Date(column.customColumValue) : crmObj.value ? new Date(crmObj.value) : '';
          } else if (column.columnDataType == 8)
            {} else {
            crmObj.value = column.customColumValue
              ? column.customColumValue
              : crmObj.value ;
          }

          this.customTicketCrmColumns.push(crmObj);
          if (crmObj.value) {
            this.CrmCustomTicketDetails.push({
              id: crmObj.dbColumn,
              value: crmObj.value,
              dataType: crmObj.columnDataType,
            });
          }
        }
      }
    }
    this.customTicketFieldLoader = false;
    this.createTicketFormGroup(this.customTicketCrmColumns);
    this.ticketAuthor = author;
    this.changeDetectionRef.detectChanges();

  }


  checkInputRegex(column, inputRef): boolean {
    if (column.regex) {
      if (new RegExp(column.regex).test(inputRef.value)) {
        return true;
      } else {
        return false;
      }
    }
  }

  changeTicketFirstLevelDropdown(state, index, zIndex) {
    state.index = index;
    this.customTicketCrmColumns[zIndex].dropDownData.selected =
      state.DropDownData[index].Value;
    this.changeDetectionRef.detectChanges();
  }

  changeTicketSecondLevelDropdown(state, index, zIndex) {
    state.indexOne = index;
    this.customTicketCrmColumns[zIndex].dropDownData.DropDownData[
      state?.index
    ].selected = state.DropDownData[state?.index].DropDownData[index].Value;
    this.changeDetectionRef.detectChanges();
  }

  changeTicketThirdLevelDropdown(state, index, zIndex) {
    state.indexTwo = index;
    this.customTicketCrmColumns[zIndex].dropDownData.DropDownData[
      state?.index
    ].DropDownData[state?.indexOne].selected =
      state.DropDownData[state?.index].DropDownData[
        state?.indexOne
      ].DropDownData[index].Value;
    this.changeDetectionRef.detectChanges();
  }

  changeFirstLevelDropdown(state, index, zIndex) {
    state.index = index;
    this.customCrmColumns[zIndex].dropDownData.selected =
      state.DropDownData[index].Value;
    // this.personalDetailForm.addControl(state.DropDownData[index].DropDownName, new FormControl(''))
    // this.personalDetailForm.addControl(state.DropDownData[index].DropDownName + '_2', new FormControl(''))
    // if(isload){
    //     this.changeSecondLevelDropdown(event, state, state.index, zIndex,false)
    // }
    this.changeDetectionRef.detectChanges();
  }
  changeSecondLevelDropdown(state, index, zIndex) {
    // let data = event.source.value;
    state.indexOne = index;
    this.customCrmColumns[zIndex].dropDownData.DropDownData[
      state?.index
    ].selected = state.DropDownData[state?.index].DropDownData[index].Value;

    // if (!isload){
    //   // this.personalDetailForm.controls[state.DropDownData[index].DropDownName].setValue(this.customCrmColumns[zIndex].dropDownData.DropDownData[state?.index].selected)
    //     this.changeThirdLevelDropdown(event, state, index, zIndex,false)
    // }
    this.changeDetectionRef.detectChanges();

  }
  changeThirdLevelDropdown(state, index, zIndex) {
    // let data = event.source.value;
    state.indexTwo = index;
    this.customCrmColumns[zIndex].dropDownData.DropDownData[
      state?.index
    ].DropDownData[state?.indexOne].selected =
      state.DropDownData[state?.index].DropDownData[
        state?.indexOne
      ].DropDownData[index].Value;
    // if (!isload){
    //   // this.personalDetailForm.controls[state.DropDownData[index].DropDownName + '_2'].setValue(this.customCrmColumns[zIndex].dropDownData.DropDownData[state?.index].DropDownData[state?.indexOne].selected)
    // }
    this.changeDetectionRef.detectChanges();

  }
  private createUserObject(authorObj: BaseSocialAuthor): void {
    // create an user object
    if (authorObj) {
      this.customAuthorDetails = {};
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
          this.customAuthorDetails.screenName = authorObj.name;
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
          this.customAuthorDetails.screenName = authorObj.name;
          this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          this.customAuthorDetails.profileUrl = authorObj.profileUrl;
          break;
        }
        case ChannelGroup.WhatsApp: {
          this.customAuthorDetails.screenName = authorObj.name;
          this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          this.customAuthorDetails.profileUrl = authorObj.profileUrl;
          break;
        }
        case ChannelGroup.WebsiteChatBot: {
          this.customAuthorDetails.screenName = authorObj.name;
          this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          this.customAuthorDetails.profileUrl = authorObj.profileUrl;
          break;
        }
        case ChannelGroup.Youtube: {
          this.customAuthorDetails.screenName = authorObj.name;
          this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          this.customAuthorDetails.profileUrl = authorObj.profileUrl;
          break;
        }
        case ChannelGroup.LinkedIn: {
          this.customAuthorDetails.screenName = authorObj.name;
          this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          this.customAuthorDetails.profileUrl = authorObj.profileUrl;
          break;
        }
        case ChannelGroup.GooglePlayStore: {
          this.customAuthorDetails.screenName = authorObj.name;
          this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          this.customAuthorDetails.profileUrl = authorObj.profileUrl;
          break;
        }
        case ChannelGroup.Email: {
          this.customAuthorDetails.screenName = authorObj.socialId;
          break;
        }
        default: {
          this.customAuthorDetails.screenName = authorObj.name;
          this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          this.customAuthorDetails.profileUrl = authorObj.profileUrl;
          break;
        }
      }
      if (!this.customAuthorDetails.profilePicUrl) {
        this.customAuthorDetails.profilePicUrl =
          'assets/images/agentimages/sample-image.svg';
      }

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
        authorObj.locoBuzzCRMDetails?.gender || null;
      this.customAuthorDetails.age = authorObj.locoBuzzCRMDetails?.age || null;
      this.customAuthorDetails.influencer =
        authorObj.markedInfluencerCategoryName;
      this.customAuthorDetails.email =
        authorObj.locoBuzzCRMDetails?.emailID || null;
      this.customAuthorDetails.phoneNumber =
        authorObj.locoBuzzCRMDetails?.phoneNumber || null;
      this.customAuthorDetails.Bio = authorObj.bio;
      this.customAuthorDetails.npsScrore =
        this.upliftAndSentimentScore.npsScore;
      this.customAuthorDetails.sentimentUpliftScore =
        this.upliftAndSentimentScore.upliftSentimentScore;
      this.customAuthorDetails.isNpsOn = this.upliftAndSentimentScore.isNpsOn;
      if (this.upliftAndSentimentScore.npsScore > 8) {
        this.customAuthorDetails.npsEmoji =
          'assets/images/feedback/promoters.svg';
      } else if (this.upliftAndSentimentScore.npsScore > 6) {
        this.customAuthorDetails.npsEmoji =
          'assets/images/feedback/passives.svg';
      } else if (this.upliftAndSentimentScore.npsScore >= 0) {
        this.customAuthorDetails.npsEmoji =
          'assets/images/feedback/detractors.svg';
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
      if (authorObj.connectedUsers?.length > 0) {
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
            default:
              customconnectedUsers.name = user.name;
              customconnectedUsers.profilepicURL = user.picUrl;
              customconnectedUsers.picUrl = user.profileUrl;
              customconnectedUsers.channelImage = `assets/images/channelicons/${
                ChannelGroup[user.channelGroup]
              }.png`;
              break;
          }
          this.customAuthorDetails.connectedUsers.push(customconnectedUsers);
        }
      }

      // insert traits
      this.customAuthorDetails.traits = [];
      if (authorObj.userTags?.length > 0) {
        for (const trait of authorObj.userTags) {
          this.customAuthorDetails.traits.push({
            id: trait.id,
            name: trait.name,
          });
        }
      }

      // Build an ticket summary
      let currentUser: AuthUser;
      this.subs.add(
      this.accountService.currentUser$
        .pipe(take(1))
        .subscribe((user) => (currentUser = user))
      );

      // for ticket ID
      this.customAuthorDetails.ticketIdDisable = false;
      if (
        +this.ticketSumamry.status === TicketStatus.Close ||
        (+currentUser.data.user.role === UserRoleEnum.CustomerCare &&
          (+this.ticketSumamry.status ===
            TicketStatus.PendingWithBrandWithNewMention ||
            +this.ticketSumamry.status ===
              TicketStatus.OnHoldBrandWithNewMention)) ||
        (+currentUser.data.user.role === UserRoleEnum.BrandAccount &&
          (+this.ticketSumamry.status ===
            TicketStatus.PendingwithCSDWithNewMention ||
            +this.ticketSumamry.status ===
              TicketStatus.OnHoldCSDWithNewMention ||
            +this.ticketSumamry.status ===
              TicketStatus.RejectedByBrandWithNewMention))
      ) {
        this.customAuthorDetails.ticketIdDisable = true;
      } else if (
        (+currentUser.data.user.role === UserRoleEnum.CustomerCare &&
          (+this.ticketSumamry.status ===
            TicketStatus.PendingwithCSDWithNewMention ||
            +this.ticketSumamry.status ===
              TicketStatus.OnHoldCSDWithNewMention ||
            +this.ticketSumamry.status ===
              TicketStatus.RejectedByBrandWithNewMention)) ||
        (+currentUser.data.user.role === UserRoleEnum.BrandAccount &&
          (+this.ticketSumamry.status ===
            TicketStatus.PendingWithBrandWithNewMention ||
            +this.ticketSumamry.status ===
              TicketStatus.OnHoldBrandWithNewMention))
      ) {
        this.customAuthorDetails.ticketIdDisable = false;
      } else if (
        +currentUser.data.user.role === UserRoleEnum.ReadOnlySupervisorAgent
      ) {
        this.customAuthorDetails.ticketIdDisable = true;
      }
    }
    this.changeDetectionRef.detectChanges();
    // console.log('coonected users', authorObj.connectedUsers);
  }

  GetTicketTimelineByTicketId(tickeId): void {
    this.someEvent.next(tickeId);
  }

  copyMessage(val: string): void {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = val;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);
  }

  checkTicketCategoryOptionFlag(mention: BaseMention): void {
    const currentBrandObj = this._filterService.fetchedBrandData.find(
      (obj) => Number(obj.brandID) === Number(mention.brandInfo.brandID));
    if (currentBrandObj.isTicketCategoryTagEnable) {
      this.showTicketCategoryMapping = true;
    } else {
      this.showTicketCategoryMapping = false;
    }
  }

  fillTicketOverview(): void {
    let ticketCategory = '';
    let ticketcatcolor = null;
    this.ticketCategory = this._postDetailService.postObj.ticketInfo
      .ticketCategoryMap
      ? this._postDetailService.postObj.ticketInfo.ticketCategoryMap[0].name
      : null;
    if (this.postObj.ticketInfo.ticketUpperCategory.name) 
    this.upperCategory = this.postObj.ticketInfo.ticketUpperCategory.name;
    if (
      this.postObj.ticketInfo.ticketCategoryMap != null &&
      this.postObj.ticketInfo.ticketCategoryMap
    ) {
      this.ticketcategories = [];
      for (
        let i = 0;
        i < this.postObj.ticketInfo.ticketCategoryMap.length;
        i++
      ) {
        if (this.postObj.ticketInfo.ticketCategoryMap[i].sentiment == null) {
          for (
            let j = 0;
            j <
            this.postObj.ticketInfo.ticketCategoryMap[i].subCategories.length;
            j++
          ) {
            if (
              this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                .sentiment == null
            ) {
              for (
                let k = 0;
                k <
                this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .subSubCategories.length;
                k++
              ) {
                const parentticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].name;
                const subticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .name;
                ticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .subSubCategories[k].name;
                if (ticketCategory) {
                  ticketcatcolor =
                    this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[
                      j
                    ].subSubCategories[k].sentiment;
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
                this.ticketcategories.push(subsubcategory);
              }
            } else {
              const parentticketCategory =
                this.postObj.ticketInfo.ticketCategoryMap[i].name;
              ticketCategory =
                this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .name;
              if (ticketCategory) {
                ticketcatcolor =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .sentiment;
              }

              const subcategory: TicketMentionCategory = {
                name: parentticketCategory + '/' + ticketCategory,
                sentiment: ticketcatcolor,
                show: i < 3 ? true : false,
              };
              this.ticketcategories.push(subcategory);
            }
          }
        } else {
          ticketCategory = this.postObj.ticketInfo.ticketCategoryMap[i].name;
          if (ticketCategory) {
            ticketcatcolor =
              this.postObj.ticketInfo.ticketCategoryMap[i].sentiment;
          }
          const category: TicketMentionCategory = {
            name: ticketCategory,
            sentiment: ticketcatcolor,
            show: i < 3 ? true : false,
          };
          this.ticketcategories.push(category);
        }
      }
    }

    // this.totalMention =
    //   this.postObj.ticketInfo.numberOfMentions;
    this.brand = this._postDetailService.postObj.brandInfo.brandFriendlyName;
    this.brandImageUrl = this.getBrandLogo(
      this._postDetailService.postObj.brandInfo.brandID
    );
    this.ticketID = this._postDetailService.postObj.ticketInfo.ticketID;
    this.selectedTicketID = this.ticketID;
    this.ticketStatus = this._postDetailService.postObj.ticketInfo.status;
    this.ticketPriority =
      this._postDetailService.postObj.ticketInfo.ticketPriority;
    if (this.postObj.channelGroup === ChannelGroup.Facebook) {
      this.showProfile = true;
      this.profileName = this.postObj.fbPageName;
      this.pageImageUrl = this.sfdcTicketView ? '' : this._ticketService.getFBPageUrl(this.postObj);
    }else{
      this.showProfile=false;
    }

    const mentiondate = new Date(
      this._postDetailService.postObj.ticketInfo.caseCreatedDate
    );
    // console.log(`%c ${mentiondate}`, 'background:yellow');
    const end = moment();
    const start = moment
      .utc(this._postDetailService.postObj.ticketInfo.caseCreatedDate)
      .local()
      .format();

    const duration = moment.duration(moment(end).diff(moment(start)));

    // Get Days
    const days = Math.floor(duration.asDays()); // .asDays returns float but we are interested in full days only
    const daysFormatted = days ? `${days}d ` : ''; // if no full days then do not display it at all
    // console.log(`%c ${daysFormatted}`, 'background:pink');
    // Get Hours
    const hours = duration.hours();
    const hoursFormatted = `${hours}h `;
    // console.log(`%c ${hoursFormatted}`, 'background:yellow');
    // for (const item  // for (const item of list) {

    //   for (const subItem of item.authorizedBrandsList) {
    //     if (subItem === this._postDetailService.postObj.brandInfo.brandID) {
    //       this.assignTo.push(item);
    //       if (this.userwithteam.length > 0) {
    //         for (const userObj of this.userwithteam) {
    //           if (userObj.teamID === item.teamID) {
    //             userObj.user.push(item);
    //           }
    //         }
    //       } else {
    //         const userof: AssignToListWithTeam = {
    //           teamID: item.teamID,
    //           teamName: item.teamName,
    //           user: [item]
    //         };
    //         this.userwithteam.push(userof);
    //       }
    //     }
    //   }

    // }
    // Get Minutes
    const minutes = duration.minutes();
    const minutesFormatted = `${minutes}m`;
    this.getTicketSummary(true);
    // console.log(`%c ${minutesFormatted}`, 'background:green');
    this.changeDetectionRef?.detectChanges();
    this.TicketOverviewEnableDisableSection(this._postDetailService?.postObj);
  }

  setCategoryMapping(): void {
    let ticketCategory = '';
    let ticketcatcolor = null;
    this.ticketCategory = this._postDetailService.postObj.ticketInfo
      .ticketCategoryMap
      ? this._postDetailService.postObj.ticketInfo.ticketCategoryMap[0].name
      : null;
    if (this.postObj.ticketInfo.ticketUpperCategory.name)
    this.upperCategory = this.postObj.ticketInfo.ticketUpperCategory.name;
    if (
      this.postObj.ticketInfo.ticketCategoryMap != null &&
      this.postObj.ticketInfo.ticketCategoryMap
    ) {
      this.ticketcategories = [];
      for (
        let i = 0;
        i < this.postObj.ticketInfo.ticketCategoryMap.length;
        i++
      ) {
        if (this.postObj.ticketInfo.ticketCategoryMap[i].sentiment == null) {
          for (
            let j = 0;
            j <
            this.postObj.ticketInfo.ticketCategoryMap[i].subCategories.length;
            j++
          ) {
            if (
              this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                .sentiment == null
            ) {
              for (
                let k = 0;
                k <
                this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .subSubCategories.length;
                k++
              ) {
                const parentticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].name;
                const subticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .name;
                ticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .subSubCategories[k].name;
                if (ticketCategory) {
                  ticketcatcolor =
                    this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[
                      j
                    ].subSubCategories[k].sentiment;
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
                this.ticketcategories.push(subsubcategory);
              }
            } else {
              const parentticketCategory =
                this.postObj.ticketInfo.ticketCategoryMap[i].name;
              ticketCategory =
                this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .name;
              if (ticketCategory) {
                ticketcatcolor =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .sentiment;
              }

              const subcategory: TicketMentionCategory = {
                name: parentticketCategory + '/' + ticketCategory,
                sentiment: ticketcatcolor,
                show: i < 3 ? true : false,
              };
              this.ticketcategories.push(subcategory);
            }
          }
        } else {
          ticketCategory = this.postObj.ticketInfo.ticketCategoryMap[i].name;
          if (ticketCategory) {
            ticketcatcolor =
              this.postObj.ticketInfo.ticketCategoryMap[i].sentiment;
          }
          const category: TicketMentionCategory = {
            name: ticketCategory,
            sentiment: ticketcatcolor,
            show: i < 3 ? true : false,
          };
          this.ticketcategories.push(category);
        }
      }
    }
  }

  getBrandLogo(brandID): string {
    const brandimage = this.filterService.fetchedBrandData.find(
      (obj) => Number(obj.brandID) === Number(brandID)
    );
    if (brandimage && brandimage.rImageURL) {
      return brandimage.rImageURL;
    } else {
      return 'assets/social-mention/post/default_brand.svg';
    }
  }

  changeTicketStatusDialog()
  {
    const dialogData = new AlertDialogModel(
      this.translate.instant('Are-you-sure-ticket'),
      '',
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
        this.changeTicketStatus({ value: 3, }, true, true)
      }else
      {
        this.ticketStatus=this.previousTicketStatus;
        this.cdk.detectChanges();
      }
    })
  }

  changeTicketStatus(
    event,
    checkDisposition = false,
    isVoipOnHold = false
  ): void {
    const sourceObject = this.MapLocobuzz.mapMention(
      this._postDetailService.postObj
    );
    let object: any = {
      IsEligibleForAutoclosure: false,
      IsReplyApproved: false,
      ActionTaken: 0,
      source: sourceObject,
    };

    const autoUpdateWindow = localStorage.getItem('autoUpdateWindow') ? JSON.parse(localStorage.getItem('autoUpdateWindow')) : false;

    if (
      event.value === TicketStatus.CustomerInfoAwaited &&
      this.isEligibleForAutoclosure &&
      this.isAutoClosuerEnable &&
      this.postObj.allMentionInThisTicketIsRead
    ) {
      const message = this.translate.instant('want-ticket-marked-closure');
      const dialogData = new AlertDialogModel(
        'Autoclosure',
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
          object.IsEligibleForAutoclosure = true;
        } else {
          object.IsEligibleForAutoclosure = false;
        }

        object.source.ticketInfo.status = event.value;

        if(this.currentUser.data.user.teamID==0)
        {
          object.source.ticketInfo.assignedToTeam=0;
          object.source.ticketInfo.assignedToTeamName=null;
        }
        // console.log(object);

        const brandInfo = this._filterService.fetchedBrandData.find(
          (obj) => obj.brandID == this.postObj.brandInfo.brandID
        );
        let isTicketDispositionFeatureEnabled: Boolean = false;
        let isAutoTicketCategorizationEnabled: boolean = false;
        if (brandInfo) {
          isTicketDispositionFeatureEnabled =
            brandInfo.isTicketDispositionFeatureEnabled;
          isAutoTicketCategorizationEnabled =
            brandInfo.isAutoTicketCategorizationEnabled;
        }
        if (
          checkDisposition &&
          isTicketDispositionFeatureEnabled &&
          event.value == 3 && this.ticketDispositionList.length > 0
        ) {
          this.ticketDispositionDialog();
          return;
        } else if (checkDisposition && event.value == 3 && this.isAgentIqEnabled && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled) {
          this.ticketDispositionDialog();
          return;
        }

        if (this.dispositionDetails) {
          object = this.createTicketDispositionJson(
            object,
            isAutoTicketCategorizationEnabled
          );
        }
        if (isTicketDispositionFeatureEnabled) {
          object.showTicketCategory = !!brandInfo?.isTicketCategoryTagEnable;
        }

        if (this.currentUser.data.user.teamID == 0) {
          object.source.ticketInfo.assignedToTeam = 0;
          object.source.ticketInfo.assignedToTeamName = null;
        }
        if (this.currentUser.data.user.teamID > 0) {
          object.source.ticketInfo.assignedToTeam = this.currentUser.data.user.teamID;
        }
        // if (this.currentUser.data.user.teamID > 0) {
        //   object.source.ticketInfo.assignedToTeam = this.currentUser.data.user.teamID;
        // }
        if (event.value == TicketStatus.Close){
          if (this.dispositionDetails && (this.dispositionDetails?.isAllMentionUnderTicketId == true || this.dispositionDetails?.isAllMentionUnderTicketId == false)) {
            object.isAllMentionUnderTicketId = this.dispositionDetails?.isAllMentionUnderTicketId;
          }
        }

        this.changeTicketStatusapi = this._ticketService.changeTicketStatus(object).subscribe(
          (data) => {
            if (JSON.parse(JSON.stringify(data)).success) {
              this._postDetailService.postObj.ticketInfo.status = event.value;
              this.postObj.ticketInfo.status = event.value;
              if (this.dispositionDetails) {
                if (
                  this.dispositionDetails?.categoryCards &&
                  this.dispositionDetails?.categoryCards.length > 0
                ) {
                  this.postObj.ticketInfo.ticketCategoryMap =
                    this.dispositionDetails?.categoryCards;
                  this._ticketService.ticketcategoryMapChange.next(
                    { BaseMention: this.postObj, categoryType:'ticketCategory'}
                  );
                }
              }
              if (event.value === TicketStatus.Open) {
                this._postDetailService.postObj.ticketInfo.assignedTo =
                  this.currentUser.data.user.userId;
              }
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: this.translate.instant('Ticket-Status-Changed'),
                },
              });
              // this._ticketService.ticketStatusChange.next(true);
              this._ticketService.ticketStatusChangeSignal.set(true);
              this._ticketService.ticketStatusChangeObsSignal.set({
                tagID: this.postObj.tagID,
                status: event.value,
                guid:this.navigationService.currentSelectedTab.guid,
                ticketType: this._postDetailService.selectedTicketType
              });
              if (autoUpdateWindow){
                this.closePreviousTicketCase(this._postDetailService.postObj);
                this._ticketService.agentAssignToObservableSignal.set(this._postDetailService.postObj);
              }
              this.previousTicketStatus=event.value
              this.fillTicketOverview();
              if (JSON.parse(localStorage.getItem('sfdcTicketView')) ) {
                this._ticketService.crmChatbotCloseTicketObsSignal.set({ status: event.value });
              }
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: JSON.parse(JSON.stringify(data))?.message ? JSON.parse(JSON.stringify(data))?.message :  'Error Occured',
                },
              });
            }
            // console.log(data);
          },
          (error) => {
            // console.log(error);
          }
        );
      });
    } else {
      object.IsEligibleForAutoclosure = this.isEligibleForAutoclosure;
      object.source.ticketInfo.status = event.value;

      if (
        this.postObj.channelGroup === ChannelGroup.Email &&
        !this.postObj.allMentionInThisTicketIsRead && 
        event.value!==0
      ) {
        const obj = {
          brandID: this.postObj.brandInfo.brandID,
          brandName: this.postObj.brandInfo.brandName,
        };
        this.GetBrandMentionReadSettingapi = this._replyService.GetBrandMentionReadSetting(obj).subscribe((resp) => {
          // console.log('reply approved successfull ', data);
          if (resp) {
            if (resp.isMentionReadCompulsory) {
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: this.translate.instant('read-mentions-before-performing-action', {
                  action: this.ticketStatus === 0
                    ? 'open'
                    : this.ticketStatus === 3
                    ? 'direct close'
                    : this.ticketStatus === this.onholdstatus
                    ? 'on hold'
                    : 'awaiting response from customer',
                  }),
                },
                });
              this.ticketStatus = this.previousTicketStatus;
            } else {
              const brandInfo = this._filterService.fetchedBrandData.find(
                (obj) => obj.brandID == this.postObj.brandInfo.brandID
              );
              let isTicketDispositionFeatureEnabled: Boolean = false;
              let isAutoTicketCategorizationEnabled: boolean = false;
              if (brandInfo) {
                isTicketDispositionFeatureEnabled =
                  brandInfo.isTicketDispositionFeatureEnabled;
                isAutoTicketCategorizationEnabled =
                  brandInfo.isAutoTicketCategorizationEnabled;
              }
              if (
                checkDisposition &&
                isTicketDispositionFeatureEnabled &&
                event.value == 3 && this.ticketDispositionList.length > 0
              ) {
                this.ticketDispositionDialog();
                return;
              } else if (checkDisposition && event.value == 3 && this.isAgentIqEnabled && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled) {
                this.ticketDispositionDialog();
                return;
              }

              if (this.dispositionDetails) {
                object = this.createTicketDispositionJson(
                  object,
                  isAutoTicketCategorizationEnabled
                );
              }
              if (isTicketDispositionFeatureEnabled){
                object.showTicketCategory = !!brandInfo?.isTicketCategoryTagEnable;
              }

              if (this.currentUser.data.user.teamID == 0) {
                object.source.ticketInfo.assignedToTeam = 0;
                object.source.ticketInfo.assignedToTeamName = null;
              }

              if (this.currentUser.data.user.teamID > 0) {
                object.source.ticketInfo.assignedToTeam = this.currentUser.data.user.teamID;
              }
              // if (this.currentUser.data.user.teamID > 0) {
              //   object.source.ticketInfo.assignedToTeam = this.currentUser.data.user.teamID;
              // }
              if (event.value == TicketStatus.Close) {
                if (this.dispositionDetails && (this.dispositionDetails?.isAllMentionUnderTicketId == true || this.dispositionDetails?.isAllMentionUnderTicketId == false)) {
                  object.isAllMentionUnderTicketId = this.dispositionDetails?.isAllMentionUnderTicketId;
                }
              }
              if (object?.source && this.dispositionDetails && this.dispositionDetails?.aiTicketIntelligenceModel) {
                object.source.aiTicketIntelligenceModel = this.dispositionDetails?.aiTicketIntelligenceModel;
              } else if (object?.source && brandInfo?.aiTagEnabled) {
                object.source.aiTicketIntelligenceModel = this.aiTicketIntelligenceModelData !== undefined ? this.aiTicketIntelligenceModelData : object.source.aiTicketIntelligenceModel;
              }
              object.source.aiTicketIntelligenceModel.isAgentiQueEnabled = brandInfo?.isAgentIQEnabled ? true : false;
              this.changeTicketStatusapires = this._ticketService.changeTicketStatus(object).subscribe(
                (data) => {
                  if (JSON.parse(JSON.stringify(data)).success) {
                    this._postDetailService.postObj.ticketInfo.status =
                      event.value;
                    this.postObj.ticketInfo.status = event.value;
                    if (this.dispositionDetails) {
                      if (
                        this.dispositionDetails?.categoryCards &&
                        this.dispositionDetails?.categoryCards.length > 0
                      ) {
                        this.postObj.ticketInfo.ticketCategoryMap =
                          this.dispositionDetails?.categoryCards;
                        this._ticketService.ticketcategoryMapChange.next(
                          { BaseMention: this.postObj, categoryType: 'ticketCategory' }
                        );
                      }
                    }
                    if (event.value === TicketStatus.Open) {
                      this._postDetailService.postObj.ticketInfo.assignedTo =
                        this.currentUser.data.user.userId;
                      this.fillTicketOverview();
                    }
                    this.setParams();
                    this._snackBar.openFromComponent(CustomSnackbarComponent, {
                      duration: 5000,
                      data: {
                        type: notificationType.Success,
                        message: this.translate.instant('Ticket-Status-Changed'),
                      },
                    });
                    this._ticketService.ticketStatusChangeObsSignal.set({
                      tagID: this.postObj.tagID,
                      status: event.value,
                      guid:this.navigationService.currentSelectedTab.guid,
                      ticketType: this._postDetailService.selectedTicketType
                    });
                    // this._ticketService.ticketStatusChange.next(true);
                    this._ticketService.ticketStatusChangeSignal.set(true);
                    if (autoUpdateWindow) {
                      this.closePreviousTicketCase(this._postDetailService.postObj);
                      this._ticketService.agentAssignToObservableSignal.set(this._postDetailService.postObj);
                    }
                                  this.previousTicketStatus=event.value
                    if (JSON.parse(localStorage.getItem('sfdcTicketView'))) {
                      this._ticketService.crmChatbotCloseTicketObsSignal.set({ status: event.value });
                    }
                  } else {
                    this._snackBar.openFromComponent(CustomSnackbarComponent, {
                      duration: 5000,
                      data: {
                        type: notificationType.Error,
                        message: JSON.parse(JSON.stringify(data))?.message ? JSON.parse(JSON.stringify(data))?.message : 'Error Occured',
                      },
                    });
                  }
                },
                (error) => {
                  // console.log(error);
                }
              );
            }
          }
        });
      } else {
        // if (isVoipOnHold) {
        //   object.source.ticketInfo.status = TicketStatus.OnHoldAgent
        // }
        const brandInfo = this._filterService.fetchedBrandData.find(
          (obj) => obj.brandID == this.postObj.brandInfo.brandID
        );
        let isTicketDispositionFeatureEnabled: Boolean = false;
        let isAutoTicketCategorizationEnabled: boolean = false;
        if (brandInfo) {
          isTicketDispositionFeatureEnabled =
            brandInfo.isTicketDispositionFeatureEnabled;
          isAutoTicketCategorizationEnabled =
            brandInfo.isAutoTicketCategorizationEnabled;
        }
        if (
          checkDisposition &&
          isTicketDispositionFeatureEnabled &&
          event.value == 3 && this.ticketDispositionList.length > 0
        ) {
          this.ticketDispositionDialog();
          return;
        } else if (checkDisposition && event.value == 3 && this.isAgentIqEnabled && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled) {
          this.ticketDispositionDialog();
          return;
        }

        if (this.dispositionDetails) {
          object = this.createTicketDispositionJson(
            object,
            isAutoTicketCategorizationEnabled
          );
        }
        if (isTicketDispositionFeatureEnabled){
          object.showTicketCategory = !!brandInfo?.isTicketCategoryTagEnable;
        }

        if (this.currentUser.data.user.teamID == 0) {
          object.source.ticketInfo.assignedToTeam = 0;
          object.source.ticketInfo.assignedToTeamName = null;
        }

        if (this.currentUser.data.user.teamID > 0) {
          object.source.ticketInfo.assignedToTeam = this.currentUser.data.user.teamID;
        }
        // if (this.currentUser.data.user.teamID > 0) {
        //   object.source.ticketInfo.assignedToTeam = this.currentUser.data.user.teamID;
        // }
        if (event.value == TicketStatus.Close) {
          if (this.dispositionDetails && (this.dispositionDetails?.isAllMentionUnderTicketId == true || this.dispositionDetails?.isAllMentionUnderTicketId == false)) {
            object.isAllMentionUnderTicketId = this.dispositionDetails?.isAllMentionUnderTicketId;
          }
        }

        // if (!this.authorDetails) {
        //   this.getAuthorTicketMandatoryDetails();
        // }
        // if (!this.mapTicketCustomFieldValidation(this.authorDetails)) {
        //   return;
        // }
        // if(this.missingFieldsClosure && this.missingFieldsClosure.length && this.ticketStatus == TicketStatus.Close){
        //   this.showAlert();
        //   return
        // }
        if (object?.source && this.dispositionDetails && this.dispositionDetails?.aiTicketIntelligenceModel) {
          object.source.aiTicketIntelligenceModel = this.dispositionDetails?.aiTicketIntelligenceModel;
        } else if (object?.source && brandInfo?.aiTagEnabled) {
          object.source.aiTicketIntelligenceModel = this.aiTicketIntelligenceModelData !== undefined ? this.aiTicketIntelligenceModelData : object.source.aiTicketIntelligenceModel;
        }
        if (object?.source && object?.source?.aiTicketIntelligenceModel) {
          object.source.aiTicketIntelligenceModel.isAgentiQueEnabled = brandInfo?.isAgentIQEnabled ? true : false;
        }
        this.changeTicketStatusapiresult = this._ticketService.changeTicketStatus(object).subscribe(
          (data) => {
            if (JSON.parse(JSON.stringify(data)).success) {
              this._postDetailService.postObj.ticketInfo.status = event.value;
              if (this.dispositionDetails) {
                if (
                  this.dispositionDetails?.categoryCards &&
                  this.dispositionDetails?.categoryCards.length > 0
                ) {
                  this.postObj.ticketInfo.ticketCategoryMap =
                    this.dispositionDetails?.categoryCards;
                  this._ticketService.ticketcategoryMapChange.next(
                    { BaseMention: this.postObj, categoryType: 'ticketCategory' }
                  );
                }
              }
              this.postObj.ticketInfo.status = event.value;
              if (event.value === TicketStatus.Open) {
                this._postDetailService.postObj.ticketInfo.assignedTo =
                  this.currentUser.data.user.userId;
                this.showstatusonholddisabled = false;
                this.showstatusinfoawaiteddisabled = false;
              } else if (event.value === TicketStatus.Close) {
                let assignedTo =
                  this._postDetailService.postObj.ticketInfo.assignedTo;
                const assignAgent = this.filterService.fetchedAssignTo.find(
                  (x) => x.agentID === assignedTo
                );
                const assignTeam = this.filterService.fetchedAssignTo.find(
                  (x) => x.teamID === assignedTo
                );
                if (assignAgent && assignAgent.teamID != 0) {
                  assignedTo = assignAgent.teamID;
                } else if (assignTeam) {
                } else {
                  assignedTo = 0;
                  this.assignAgentName = 'Not Assigned';
                }
                this._ticketService.changeAssignee.next(assignedTo);
                this.ticketidDisableClass = true;
                this.assignToDisableClass = true;
                this.priorityDisableClass = true;
                this.showstatusonholddisabled = true;
                this.showstatusinfoawaiteddisabled = true;
              }
              this.setParams();
              this.fillTicketOverview();
              let message = this.translate.instant('Ticket-Status-Changed');
              if (this.dispositionDetails && (this.dispositionDetails?.isAllMentionUnderTicketId == true || this.dispositionDetails?.isAllMentionUnderTicketId == false) && event.value == TicketStatus.Close) {
                message = this.translate.instant('ticket-closed-successfully');
              }
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: message,
                },
              });
              // this._ticketService.ticketStatusChange.next(true);
              this._ticketService.ticketStatusChangeSignal.set(true);
              this._ticketService.ticketStatusChangeObsSignal.set({
                tagID: this.postObj.tagID,
                status: event.value,
                guid:this.navigationService.currentSelectedTab.guid,
                ticketType:this._postDetailService.selectedTicketType
              });
              if (autoUpdateWindow) {
                this.closePreviousTicketCase(this._postDetailService.postObj);
                this._ticketService.agentAssignToObservableSignal.set(this._postDetailService.postObj);
              }
              this.previousTicketStatus=event.value
              if (JSON.parse(localStorage.getItem('sfdcTicketView'))) {
                this._ticketService.crmChatbotCloseTicketObsSignal.set({ status: event.value });
              }
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: JSON.parse(JSON.stringify(data))?.message ? JSON.parse(JSON.stringify(data))?.message : 'Error Occured',
                },
              });
            }
          },
          (error) => {
            // console.log(error);
          }
        );
      }
    }
  }

  generateClosingTicketTag(): void {
      let obj = {
        brand_name: this.postObj?.brandInfo?.brandName,
        brand_id: this.postObj?.brandInfo?.brandID,
        author_id: this.postObj?.author.socialId,
        author_name: this.postObj?.author?.name ? this.postObj?.author?.name : '',
        channel_group_id: this.postObj?.channelGroup,
        ticket_id: this.postObj?.ticketID,
        channel_type: this.postObj?.channelType,
        tag_id: this.postObj?.tagID,
      }
      const brandDetail = this._filterService.fetchedBrandData?.find(
        (brand) => +brand.brandID === this.postObj?.brandInfo?.brandID
      );
      this._ticketService.generateClosingTicketTag(obj).subscribe((result) => {
        if (result.success) {
          this.genAiData = result.data;
          const allUpperTag = { 0: "Complaint", 1: "Appreciation", 2: "Inquiry", 3: "Suggestion", 4: "Experience", 5: 'Assistance', 6: 'Issue', 7: 'Request', 8: "Other" };
          this.selectedUpperTags = {
            start: allUpperTag[this.genAiData?.result?.upper_tags?.start] ? allUpperTag[this.genAiData?.result?.upper_tags?.start] : '',
            end: allUpperTag[this.genAiData?.result?.upper_tags?.end] ? allUpperTag[this.genAiData?.result?.upper_tags?.end] : '',
          }
          if (this.genAiData?.result?.emotions) {
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
              startLabel: emotionMap[this.genAiData?.result?.emotions?.start] ? emotionMap[this.genAiData?.result?.emotions?.start] : '',
              endLabel: emotionMap[this.genAiData?.result.emotions?.end] ? emotionMap[this.genAiData?.result?.emotions?.end] : '',
              startColor: '',
              endColor: '',
              start: this.genAiData?.result?.emotions?.start,
              end: this.genAiData?.result?.emotions?.end
            }
          }
          if (this.genAiData?.result?.sentiments) {
            this.selectedSentiment = {
              start: this.genAiData?.result?.sentiments?.start,
              end: this.genAiData?.result?.sentiments?.end
            }
          }
          if (this.genAiData?.result?.ticket_tags) {
            this.ticketTagging = [];
            this.genAiData?.result?.ticket_tags.forEach((res) => {
              let subTag = [];
              if (res) {
                subTag.push(res[0]);
                subTag.push(res[1]);
                this.ticketTagging.push(subTag);
              }
            })
          }
          this.aiTicketIntelligenceModelData = {
            IsAIIntelligenceEnabled: brandDetail?.aiTagEnabled ? true : false,
            brandId: this.postObj?.brandInfo?.brandID,
            ticketID: this.postObj?.ticketID,
            brandName: this.postObj?.brandInfo?.brandName,
            authorChannelGroupID: this.postObj?.channelGroup,
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
            customerType: this.genAiData?.result?.customer_type ? this.genAiData?.result?.customer_type : 0,
            satisfactionRating: this.selectedSatisfactionRating,
            oldSatisfactionRating: this.oldSelectedSatisfactionRating,
            isModified: this.oldSelectedSatisfactionRating == this.selectedSatisfactionRating ? false : true,
            isLead: this.genAiData?.result?.lead ? this.genAiData?.result?.lead : this.selectedLead,
            categoryXML: null,
            IsSarcastic: this.genAiData?.result?.is_sarcastic,
            IssueResolved: this.genAiData?.result?.issue_resolution_status,
            AgentCommitted: this.genAiData?.result?.agent_commitment,
            InappropriateClosure: this.genAiData?.result?.inappropriate_closure,
            HasChurnIntent: this.genAiData?.result?.churn_intent,
            HasUpsellOpportunity: this.genAiData?.result?.upsell_opportunity,
            AgentEmpathyScore: this.genAiData?.result?.agent_empathy_score,
            UpdatedSatisfactionRating: this.genAiData?.result?.updated_satisfaction_rating !== null ? this.genAiData?.result?.updated_satisfaction_rating : 0,
            IsSuggested: this.genAiData?.result?.is_suggested,
            SuggestedReply: this.genAiData?.result?.suggested_reply ? this.genAiData?.result?.suggested_reply : '',
            FoulWords: this.genAiData?.result?.foul_words?.length ? this.genAiData?.result?.foul_words : [],
            isAgentiQueEnabled: brandDetail?.isAgentIQEnabled ? true : false
          }
        } else {
          this.genAiData = [];
        }
      }, (err) => {
      });
    }

  closePreviousTicketCase(postData: BaseMention): void {
    const obj = {
      BrandID: postData?.brandInfo?.brandID,
      BrandName: postData?.brandInfo?.brandName,
      TicketID: postData?.ticketInfo?.ticketID,
      Status: 'C',
    };
    this.lockUnlockTicketapi = this._ticketService.lockUnlockTicket(obj).pipe(distinctUntilChanged()).subscribe((resp) => {
      if (resp.success) {
        // success
      }
    });
  }

  ticketChange(event) {
    /* this._ticketService.newTicketSummary.next({ type: 'ticket', data: this.ticketSumamry?.ticketID, status:true }); */
    this.GetTicketListbyIDapi = this._ticketService.GetTicketListbyID({ TicketID: this.selectedTicketID, BrandID: this.postObj?.brandInfo?.brandID }).subscribe((res) => {
      if (res?.mentionList && res?.mentionList?.length > 0) {
        this._postDetailService.postObj = res?.mentionList[0];
        this._ticketService.bulkMentionChecked = [];
        this._ticketService.selectedPostList = [];
        this._ticketService.postSelectTriggerSignal.set(this._ticketService.selectedPostList.length);
        /* this._postDetailService.currentPostObject.next(this._postDetailService.postObj?.ticketInfo.ticketID); */
        this._postDetailService.currentPostObjectSignal.set(this._postDetailService.postObj?.ticketInfo.ticketID);
        this._postDetailService.makeActionableFlag = false;
        this._ticketService.newTicketSummary.next({
          status: true,
          type: 'ticket',
          data: this._postDetailService.postObj?.ticketInfo.ticketID
        })
        this._replyService.clearNoteAttachmentSignal.set(true);
        this._replyService.replyActionPerformedSignal.set(null)

        this.cdk.detectChanges();
      }
    })
  }

  changePriority(event): void {
    const object = {
      brandInfo: this._postDetailService.postObj.brandInfo,
      ticketInfo: this._postDetailService.postObj.ticketInfo,
      actionFrom: ActionTaken.Locobuzz,
    };

    object.ticketInfo.ticketPriority = Priority[
      event.value
    ] as unknown as Priority;

    this.changeTicketPriorityapi = this._ticketService.changeTicketPriority(object).subscribe(
      (data) => {
        if (JSON.parse(JSON.stringify(data)).success) {
          this._postDetailService.postObj.ticketInfo.ticketPriority = Priority[
            event.value
          ] as unknown as Priority;
          this._ticketService.changeTicketPriorityObs.next({
            ticketPriority: +event.value,
            ticketID: this._postDetailService.postObj.ticketInfo.ticketID,
          });
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Ticket-Priority-Changed'),
            },
          });
          this.getTicketSummary();
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Error-Occured'),
            },
          });
        }
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  changeAssignTo(event): void {
    const assignCheckbox = JSON.parse(localStorage.getItem('assignCheckbox'))
    if (!assignCheckbox) {
      const message =
        this.translate.instant('Are-you-sure-assign');
      let dialogData = new AlertDialogModel(
        message,
        ``,
        'Assign',
        'Cancel',
        true,
        [
          {
            label:
              'Remember my decision',
            id: 'Test',
            type: 'checkbox',
          },
        ]
      );

      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
        // width: '478px',
      });

      dialogRef.componentInstance.inputEvent.subscribe((data) => {
        localStorage.setItem('assignCheckbox', data)
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this.assignToApiCall(event)
        } else[
          this._ticketService.ticketHistoryAssignToObs.next(true)
        ]
      }
      )
    } else {
      this.assignToApiCall(event)
    }
  }

  assignToApiCall(event):void{
    const object = {
      brandInfo: this._postDetailService.postObj.brandInfo,
      ticketInfo: JSON.parse(
        JSON.stringify(this._postDetailService.postObj.ticketInfo)
      ),
      channelType: this._postDetailService.postObj.channelType,
    };

    if (object?.ticketInfo?.lastNote !== '') {
      object.ticketInfo.lastNote = null;
    }

    let findData = this._filterService.fetchedAssignTo.find((obj) => { return obj.agentID == event.value; });
    if(Object.keys(findData || {}).length === 0){
      findData = this._filterService.fetchedAssignToBrandWise.find((obj) => { return obj.agentID == event.value; });
    }
    let escalatetouser = findData
    let fromteam = false;
    if(this.teamSelectedData.length > 0){fromteam = true}
    else {
      fromteam = false;
    }

    if (fromteam) {
      object.ticketInfo.assignedToTeam = this.teamSelectedData[0];
      object.ticketInfo.assignedTo =0
      // this._postDetailService.postObj.ticketInfo.assignedToTeam = event.value;
    } else {
      object.ticketInfo.assignedTo = event.value;
      if (escalatetouser){
        object.ticketInfo.assignedToTeam = escalatetouser.teamID
      }
      // this._postDetailService.postObj.ticketInfo.assignedTo = event.value;
    }

    // console.log(event.value);
    this.assignLoading=true
    this.cdk.detectChanges()
    this.ticketReassignToUserapi = this._ticketService.ticketReassignToUser(object).subscribe(
      (data) => {
        // console.log('Assign To Data' , data);
        if (JSON.parse(JSON.stringify(data)).success) {
          
          if (fromteam) {
            let findData = this._filterService.fetchedAssignTo.find((obj) => { return obj.teamID == this.teamSelectedData[0]; });
            if (Object.keys(findData || {}).length === 0) {
              findData = this._filterService.fetchedAssignToBrandWise.find((obj) => { return obj.teamID == this.teamSelectedData[0]; });
            }
            const assignedTeam: any = findData;
            this.assignAgentName = assignedTeam?.teamName;
            this._postDetailService.postObj.ticketInfo.assignedToTeam = event.value;
              if(this.currentUser?.data?.user?.role==UserRoleEnum.CustomerCare){
                this._postDetailService.postObj.ticketInfo.escalatedToCSDTeam = event.value;
              }
          } 
          else {
            this.assignAgentName = escalatetouser.agentName;
            this._postDetailService.postObj.ticketInfo.assignedTo = event.value;
            if (this.currentUser?.data?.user?.role == UserRoleEnum.CustomerCare) {
              this._postDetailService.postObj.ticketInfo.escalatedTo =
                event.value;
            }
          }
          if (this._postDetailService.pagetype === PostsType.chatbot) this._ticketService.changeChatOnReassignment.next(event.value);
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Ticket-Assigned-Successfully'),
            },
          });
          if (this.currentUser?.data?.user?.role == UserRoleEnum.Agent) {
            if (this.currentUser?.data?.user?.userId != event.value) {
              // this.priorityDisableClass = true;
              // this.ticketstatusDisableClass = true
              if (this.currentUser?.data?.user?.actionButton?.seeAssignedTicketsEnabled)
              {
                this._ticketService.ticketStatusChangeObsSignal.set({
                tagID: this.postObj.tagID,
                status: event.value,
                guid: this.navigationService.currentSelectedTab.guid,
                ticketType: this._postDetailService.selectedTicketType
              });
              // this._ticketService.ticketStatusChange.next(true);
                this._ticketService.ticketStatusChangeSignal.set(true);
              this.cdk.detectChanges();
            }
            }
          }
          this.assignLoading = false
          this.cdk.detectChanges();
          if (this.currentUser?.data?.user?.userId != event.value){
            if (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare || this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount)
            {
              this._ticketService.csdAssignObs.next(this._postDetailService.postObj);
            }
            if (this.currentUser?.data?.user?.role !== UserRoleEnum.SupervisorAgent && this.currentUser?.data?.user?.role !== UserRoleEnum.LocationManager)
            {
              this.closePreviousTicketCase(this._postDetailService.postObj);
              this._ticketService.agentAssignToObservableSignal.set(this._postDetailService.postObj);
            }
          }

          this.teamSelectedData = [];
        } else {
          this.assignLoading = false
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: JSON.parse(JSON.stringify(data)) && JSON.parse(JSON.stringify(data)).message ? JSON.parse(JSON.stringify(data))?.message : 'Error Occured',
            },
          });
        }
        this.getTicketSummary();
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  voipReassign(userid){
    const object = {
      brandInfo: this._postDetailService.postObj.brandInfo,
      ticketInfo: JSON.parse(
        JSON.stringify(this._postDetailService.postObj.ticketInfo)
      ),
      channelType: this._postDetailService.postObj.channelType,
    };

    if (object?.ticketInfo?.lastNote !== '') {
      object.ticketInfo.lastNote = null;
    }

    let fromteam = false;
    let escalatetouser = this.filterService.fetchedAssignTo.find((obj) => {
      return obj.agentID === userid;
    });
    // if (escalatetouser) {
    // } else {
    //   fromteam = true;
    // }
    // if (fromteam) {
    //   object.ticketInfo.assignedToTeam = event.value;
    //   // this._postDetailService.postObj.ticketInfo.assignedToTeam = event.value;
    // } else {
      object.ticketInfo.assignedTo = userid;
      // this._postDetailService.postObj.ticketInfo.assignedTo = event.value;
    // }

    // console.log(event.value);
    this.voipTicketReassignToUserapi = this._ticketService.voipTicketReassignToUser(object).subscribe(
      (data) => {
        // console.log('Assign To Data' , data);
        if (JSON.parse(JSON.stringify(data)).success) {
          // if (fromteam) {
          //   this.assignAgentName = escalatetouser.teamName;
          //   this._postDetailService.postObj.ticketInfo.assignedToTeam =
          //     userid;
          // } else {
            this.assignAgentName = escalatetouser.agentName;
            this._postDetailService.postObj.ticketInfo.assignedTo = userid;
          // }

          // this._snackBar.openFromComponent(CustomSnackbarComponent, {
          //   duration: 5000,
          //   data: {
          //     type: notificationType.Success,
          //     message: 'Ticket Assigned Successfully',
          //   },
          // });
        } else {
          // this._snackBar.openFromComponent(CustomSnackbarComponent, {
          //   duration: 5000,
          //   data: {
          //     type: notificationType.Error,
          //     message: 'Error Occured',
          //   },
          // });
        }
      },
      (error) => {
        // console.log(error);
      }
    );

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

  private createFormGroup(formdetails): void {
    // console.log(formdetails);
    const object = {};
    for (const item of formdetails) {
      object[item.dbColumn] = item.value ? new UntypedFormControl(item.value) : new UntypedFormControl();
      if (item?.columnDataType == 5) {
        object[item.dbColumn2] = new UntypedFormControl(item.value2);
        object[item.dbColumn3] = new UntypedFormControl(item.value3);
        object[item.dbColumn4] = new UntypedFormControl(item.value4);
        object[item.dbColumn5] = new UntypedFormControl(item.value5);
        object[item.dbColumn6] = new UntypedFormControl(item.value6);
      }
    }

    this.personalDetailForm = this.formBuilder.group(object);
    if (!this.editPersonalDetailsEnabled) {
      this.personalDetailForm.disable();
    }
    // console.log(object);
  }

  private createTicketFormGroup(formdetails, notSetValue?: boolean): void {
    if (!notSetValue) {
        const mainData = {
          brandID: this.postObj?.brandInfo?.brandID,
          ticketDetail: formdetails
        }
        this._ticketService.ticketDetailData.set(mainData);
    }
    const object = {};
    for (const item of formdetails) {
      let value1 = item.value;
      let value2 = item.value2;
      let value3 = item.value3;
      let value4 = item.value4;
      let value5 = item.value5;
      let value6 = item.value6;

      if (!notSetValue && this.TicketFieldForm && this.TicketFieldForm.value){
        const oldData:any = JSON.parse(JSON.stringify(this.TicketFieldForm.value));
        if (oldData && oldData[item.dbColumn]){
          value1 = oldData[item.dbColumn];
        }
        if (oldData && oldData[item.dbColum2]) {
          value2 = oldData[item.dbColum2];
        }
        if (oldData && oldData[item.dbColum3]) {
          value3 = oldData[item.dbColum3];
        }
        if (oldData && oldData[item.dbColum4]) {
          value4 = oldData[item.dbColum4];
        }
        if (oldData && oldData[item.dbColum5]) {
          value5 = oldData[item.dbColum5];
        }
        if (oldData && oldData[item.dbColum6]) {
          value6 = oldData[item.dbColum6];
        }
      }
      object[item.dbColumn] = new UntypedFormControl(notSetValue ? '' : value1 ? value1 : '')
      if (item?.columnDataType == 5) {
        object[item.dbColumn2] = new UntypedFormControl(notSetValue ? '' : value2 ? value2 : '');
        object[item.dbColumn3] = new UntypedFormControl(notSetValue ? '' : value3 ? value3 : '');
        object[item.dbColumn4] = new UntypedFormControl(notSetValue ? '' : value4 ? value4 : '');
        object[item.dbColumn5] = new UntypedFormControl(notSetValue ? '' : value5 ? value5 : '');
        object[item.dbColumn6] = new UntypedFormControl(notSetValue ? '' : value6 ? value6 : '');
      }
    }

    this.TicketFieldForm = this.formBuilder.group(object);
    if (!this.editPersonalDetailsEnabled) {
      this.TicketFieldForm.disable();
    }
  }

  alertMessage(msg:string){
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Warn,
        message:msg,
      },
    });
    return;
  }

  onSubmit(): any {
    let allColumn: any = [...this.author?.crmColumns?.customColumns];
    allColumn.push(...this.author?.crmColumns?.existingColumns);

    let updatedColumns = [];
    this.customCrmColumns.forEach((x)=>{
      if (x.columnDataType != 2 && x.columnDataType != 5) {
        let columnName = x['dbColumn'];
        if (x['value'] != this.personalDetailForm.value[columnName] && (x['value'] != "" || this.personalDetailForm.value[columnName] != null)) {
          let data = allColumn.find((y) => y.excelColumn == columnName);
          if(data){
            updatedColumns.push({
              orderID: data.orderID,
              IsDefault: !data.isCustomColumn,
            });
          }
        }
      }
    })

    let allfieldsEmpty: boolean = true;
    for (const controlName in this.personalDetailForm.controls) {
      const control = this.personalDetailForm.get(controlName);
      if (control?.value) {
        allfieldsEmpty = false;
      }else
      {
      }
    }

    if (allfieldsEmpty) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            this.translate.instant('fill-fields-submitting'),
        },
      });
      return;
    }

    // console.log(this.personalDetailForm.value);
    // eslint-disable-next-line guard-for-in
    for (const column in this.personalDetailForm.value) {
      const value = this.personalDetailForm.value[column];
      switch (column) {
        case 'Name':
          this.author.locoBuzzCRMDetails.name = value;
          break;
        case 'EmailID':
          this.author.locoBuzzCRMDetails.emailID = value;
          break;
        case 'AlternativeEmailID':
          this.author.locoBuzzCRMDetails.alternativeEmailID = value;
          break;
        case 'PhoneNumber':
          this.author.locoBuzzCRMDetails.phoneNumber = value;
          break;
        case 'AlternatePhoneNumber':
          this.author.locoBuzzCRMDetails.alternatePhoneNumber = value;
          break;
        case 'Link':
          this.author.locoBuzzCRMDetails.link = value;
          break;
        case 'Address1':
          this.author.locoBuzzCRMDetails.address1 = value;
          break;
        case 'Address2':
          this.author.locoBuzzCRMDetails.address2 = value;
          break;
        case 'City':
          this.author.locoBuzzCRMDetails.city = value;
          break;
        case 'State':
          this.author.locoBuzzCRMDetails.state = value;
          break;
        case 'Country':
          this.author.locoBuzzCRMDetails.country = value;
          break;
        case 'ZIPCode':
          this.author.locoBuzzCRMDetails.zipCode = value;
          break;
        case 'SSN':
          this.author.locoBuzzCRMDetails.ssn = value;
          break;
        case 'Notes':
          this.author.locoBuzzCRMDetails.notes = value;
          break;
      }
    }

    // const namevalNot = /[\[\]'":{}!%$#;?\/><~.,|\\]/;
    // if (this.author.locoBuzzCRMDetails.name) {
    //   if (namevalNot.test(this.author.locoBuzzCRMDetails.name)) {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Warn,
    //         message:
    //           'Only alphabets number and some special characters (@, _, -,`) are allowed for Name.',
    //       },
    //     });
    //     return false;
    //   }
    // }

    // const Rgx = new RegExp(/^\+?[0-9][0-9]{7,14}$/);

    // if (
    //   this.author.locoBuzzCRMDetails.phoneNumber &&
    //   !Rgx.test(this.author.locoBuzzCRMDetails.phoneNumber)
    // ) {
    //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //     duration: 5000,
    //     data: {
    //       type: notificationType.Warn,
    //       message: 'Please enter valid mobile number',
    //     },
    //   });
    //   return false;
    // }

    // if (
    //   this.author.locoBuzzCRMDetails.alternatePhoneNumber &&
    //   !Rgx.test(this.author.locoBuzzCRMDetails.alternatePhoneNumber)
    // ) {
    //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //     duration: 5000,
    //     data: {
    //       type: notificationType.Warn,
    //       message: 'Please enter valid alternate mobile number',
    //     },
    //   });
    //   return false;
    // }

    // if (this.author.locoBuzzCRMDetails.emailID) {
    //   const existingColumnObj = this.author?.crmColumns?.existingColumns.find((obj) => obj.dbColumn == 'EmailID')
    //   const emailval =
    //     /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    //   if (!emailval.test(this.author.locoBuzzCRMDetails.emailID) && existingColumnObj?.columnDataType==4) {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Warn,
    //         message: 'Please enter valid email address',
    //       },
    //     });
    //     return false;
    //   }
    // }

    // if (this.author.locoBuzzCRMDetails.alternativeEmailID) {
    //   const existingColumnObj = this.author?.crmColumns?.existingColumns.find((obj) => obj.dbColumn == 'AlternativeEmailID')
    //   const emailval =
    //     /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    //   if (!emailval.test(this.author.locoBuzzCRMDetails.alternativeEmailID) && existingColumnObj?.columnDataType == 4) {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Warn,
    //         message: 'Please enter valid alternative email address',
    //       },
    //     });
    //     return false;
    //   }
    // }

    // const Linkval = /^(https?:\/\/)?(?:www\.|(?!www\.))(([a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]|[a-zA-Z0-9]+)\.)+(([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]|[a-zA-Z0-9]){2,})\/?$/i;
    // if (this.author.locoBuzzCRMDetails.link) {
    //   // if (!Linkval.test(this.author.locoBuzzCRMDetails.link)) {
    //   //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //   //     duration: 5000,
    //   //     data: {
    //   //       type: notificationType.Warn,
    //   //       message: 'Please enter URL for Link. Eg. https://www.locobuzz.com.',
    //   //     },
    //   //   });
    //   //   return false;
    //   // }
    // }
    // const cityStateCountry = /^[a-zA-Z \-]+$/;
    // if (
    //   this.author.locoBuzzCRMDetails.state ||
    //   this.author.locoBuzzCRMDetails.city ||
    //   this.author.locoBuzzCRMDetails.country
    // ) {
    //   if (
    //     !cityStateCountry.test(
    //       this.author.locoBuzzCRMDetails.city ||
    //         this.author.locoBuzzCRMDetails.state ||
    //         this.author.locoBuzzCRMDetails.country
    //     )
    //   ) {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Warn,
    //         message: `Please enter valid ${
    //           this.author.locoBuzzCRMDetails?.city?.length > 0
    //             ? 'City'
    //             : '' || this.author.locoBuzzCRMDetails?.state?.length > 0
    //             ? 'State'
    //             : '' || this.author.locoBuzzCRMDetails?.country?.length > 0
    //             ? 'Country'
    //             : ''
    //         }`,
    //       },
    //     });
    //     return false;
    //   }
    // }
    // const ssnVal = /^[0-9 \-]+$/;
    // const zipcode = /^[0-9\-]+$/;
    // if (this.author.locoBuzzCRMDetails.zipCode) {
    //   if (!zipcode.test(this.author.locoBuzzCRMDetails.zipCode)) {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Warn,
    //         message: 'Please enter valid Zipcode',
    //       },
    //     });
    //     return false;
    //   } else if (this.author.locoBuzzCRMDetails.zipCode.length > 10) {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Warn,
    //         message: 'Please enter valid Zipcode',
    //       },
    //     });
    //     return false;
    //   }
    // }
    // if (this.author.locoBuzzCRMDetails.ssn) {
    //   if (!ssnVal.test(this.author.locoBuzzCRMDetails.ssn)) {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Warn,
    //         message:
    //           'Please enter valid AWB/Aadhar number. Special characters are not allowed',
    //       },
    //     });
    //     return false;
    //   }
    // }

    for (const controlName in this.personalDetailForm.controls) {
      const control = this.personalDetailForm.get(controlName);
      const fieldDetails = this.customCrmColumns.find((obj) => obj.dbColumn == controlName || obj.dbColumnName == controlName)
      let dataOrderID;
      let isUpdated = false;
      const data = allColumn.filter((x) => x.dbColumn == controlName || x.columnLable == controlName);
      if(data && data?.length > 0){
        dataOrderID = data[0].orderID;
        isUpdated = updatedColumns.some((x) => x.orderID == dataOrderID)
      }
      
      let fieldName = ''
      if ((fieldDetails && !fieldDetails?.isMaskingEnabled) || isUpdated) {
        if (controlName != 'Name' && fieldDetails?.columnDataType == 0 && control?.value)
        {
          // const namevalNot = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]*$/
          if(!this.customMultilingualValidator(control.value))
          {
            fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
          }
        }
        else if (fieldDetails?.columnDataType == 1 && control?.value) {
          const numbericReg = new RegExp('^[0-9]+$');
          if (!numbericReg.test(control.value)) {
            fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
          }
        }
        // else if (fieldDetails?.columnDataType == 2) {
        //   const namevalNot = /[\[\]'":{}!%$#;?\/><~.,|\\]/
        //   if (namevalNot.test(control)) {
        //     fieldName = `Please enter valid ${fieldDetails.dbColumnName}`;
        //   }
        // }
        else if (fieldDetails?.columnDataType == 3 && control?.value) {
          const Rgx = new RegExp(/^\+?[0-9][0-9]{7,14}$/);
          if (!Rgx.test(control.value)) {
            fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
          }
        }
        else if (fieldDetails?.columnDataType == 4 && control?.value) {
          const emailval =
          /^([a-zA-Z0-9_&#\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
          if (!emailval.test(control.value)) {
            fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
          }
        }
        else if (fieldDetails?.columnDataType == 7 && control?.value) {
          const namevalNot = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]*$/
          if (!namevalNot.test(control.value)) {
            fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
          }
        }
        if (fieldName)
        {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: fieldName,
            },
          });
          return;
        }
      }
    }

    this._postDetailService.postObj.author = this.author;
    const sourceObject = this.MapLocobuzz.mapMention(
      this._postDetailService.postObj
    );
    const object = {
      brandInfo: sourceObject.brandInfo,
      authorInfo: sourceObject.author,
      ticketID: sourceObject.ticketInfo.ticketID,
      UpdatedColumns: updatedColumns
    };

    for (
      let index = 0;
      index < object.authorInfo['crmColumns'].customColumns.length;
      index++
    ) {
      const dropdownData = this.customCrmColumns.find((obj) => object.authorInfo['crmColumns'].customColumns[index].orderID ==
        obj.orderID &&
        obj.columnDataType == 5)

          if (dropdownData)
          {
            object.authorInfo['crmColumns'].customColumns[index].dropDownData =
              JSON.stringify([dropdownData.dropDownData]);
          }
    }
    let breakC = false;
    if (object.authorInfo['crmColumns'].customColumns) {
      object.authorInfo['crmColumns'].customColumns.forEach((obj) => {
        obj.customColumValue = this.personalDetailForm.value[obj.columnLable];
        if (obj.dropDownData) {
          let dropDownData = JSON.parse(obj.dropDownData)
          dropDownData = dropDownData && dropDownData.length ? dropDownData[0] : [];
          if (dropDownData && dropDownData.DropDownData && dropDownData.DropDownData.length) {
            dropDownData.selected = this.personalDetailForm.value[dropDownData?.DropDownName];
            dropDownData.DropDownData.map(res => {
              res.selected = this.personalDetailForm.value[`${dropDownData?.DropDownName}_2`];
              if (res.DropDownData && res.DropDownData.length) {
                res.DropDownData.map(subRes => {
                  subRes.selected = this.personalDetailForm.value[`${dropDownData?.DropDownName}_3`];
                  if (subRes.DropDownData && subRes.DropDownData.length) {
                    subRes.DropDownData.map(subSubRes => {
                      subSubRes.selected = this.personalDetailForm.value[`${dropDownData?.DropDownName}_4`];
                      if (subSubRes.DropDownData && subSubRes.DropDownData.length) {
                        subSubRes.DropDownData.map(subSubSubRes => {
                          subSubSubRes.selected = this.personalDetailForm.value[`${dropDownData?.DropDownName}_5`];
                          if (subSubSubRes.DropDownData && subSubSubRes.DropDownData.length) {
                            subSubSubRes.DropDownData.map(subSubSubSubRes => {
                              subSubSubSubRes.selected = this.personalDetailForm.value[`${dropDownData?.DropDownName}_6`];
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
          obj.dropDownData = JSON.stringify([dropDownData]);
        }
   
        let rgx;
        if (
          obj.columnDataType == 2 &&
          this.personalDetailForm.value[obj.columnLable]
        ) {
          obj.customColumValue = moment(
            this.personalDetailForm.value[obj.columnLable]
          ).format('MM/DD/YYYY');
        }
        // if (obj.columnDataType == 5 && this.personalDetailForm.value[obj.columnLable]) {
        //   obj.customColumValue ;
        // }
        //0->Text
        //1->Numeric
        //2->Date
        //3->Contact Number
        //4->Email ID
        //5->Dropdown
        switch (obj.columnDataType) {
          case 0:
            rgx = new RegExp(/^[\u0000-\uffff]+$/);
            break;

          case 1:
            rgx = new RegExp(/^[0-9 \-]+$/);
            break;

          case 2:
            rgx = new RegExp(/^\d{2}\/\d{2}\/\d{4}$/); //Date mm/dd/yyyy
            break;

          case 3:
            rgx = new RegExp(/^\+?[0-9][0-9]{7,14}$/);
            break;

          case 4:
            rgx = new RegExp(
              /^([a-zA-Z0-9_&#\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
            );
            break;
          case 7:
            rgx = new RegExp(/^[a-zA-Z0-9 \-]+$/);
            break;
          default:
            break;
        }

        const fieldDetails = this.customCrmColumns.find((x) => x.dbColumn == obj.columnLable || x.dbColumnName == obj.columnLable)
        let dataOrderID;
        let isUpdated = false;
        const data = allColumn.filter((x) => x.dbColumn == obj.columnLable || x.columnLable == obj.columnLable);
        if (data && data?.length > 0) {
          dataOrderID = data[0].orderID;
          isUpdated = updatedColumns.some((x) => x.orderID == dataOrderID)
        }

        if ((fieldDetails && !fieldDetails?.isMaskingEnabled) || isUpdated) {
          if (obj.customColumValue || (obj.columnDataType==2 && obj.customColumValue != 'Invalid date')) {
            if (obj.columnDataType == 3) {
              if (obj.customColumValue && !rgx.test(Number(obj.customColumValue))) {
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                  type: notificationType.Warn,
                  message: this.translate.instant('Please-enter-valid-input-field', { fieldName: obj.columnLable }),
                  },
                });
                breakC = true;
                return false;
              }
            } else if (rgx && obj.customColumValue && !rgx.test(obj.customColumValue)) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: this.translate.instant('Please-enter-valid-input-field', { fieldName: obj.columnLable }),
                },
              });
              breakC = true;
              return false;
            }
          }
        }
      });
    }

    // console.log('Object Data');
    // console.log(JSON.stringify(object));
    if (!breakC) {
      this.updateLoader = true;
      this.SaveLocoBuzzCRMDetailapi = this._ticketService.SaveLocoBuzzCRMDetail(object).subscribe(
        (data) => {
          // console.log('Api worked', data)
          this.updateLoader = false;
          if (data.success) {
            // console.log('Truell Api worked')
            if (object?.authorInfo?.locoBuzzCRMDetails?.phoneNumber){
              this._voip.onUpdatePhoneNumber.next(object.authorInfo.locoBuzzCRMDetails.phoneNumber)
            }
            if (object?.authorInfo?.locoBuzzCRMDetails?.phoneNumber || object?.authorInfo?.locoBuzzCRMDetails?.emailID){
              let obj = {
                phoneNumber: this.author?.locoBuzzCRMDetails.phoneNumber,
                emailID: object?.authorInfo?.locoBuzzCRMDetails?.emailID
              }
              this._ticketService.updatephoneEmail.next(obj);
            }
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Details-Saved-Successfully'),
              },
            });
            this._dynamicServices.updateMethodCallToApi.next(true);
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: data.message ? data.message : this.translate.instant('Unable-to-save-details'),
              },
            });
          }
          this.cdk.detectChanges();
        },
        (err) => {
          this.updateLoader = false;
          this.changeDetectionRef.detectChanges();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something went wrong'),
            },
          });
          this.cdk.detectChanges();
        }
      );
    }

    // console.log(this.personalDetailForm);
  }

  onTicketSubmit(): any {
    // if (this.TicketFieldForm.invalid){
    //   this.alertMessage(`Please enter valid Input.`);
    //   return
    // }
    let locoBuzzCRMDetailTicket = {
      bookingnumber: null,
      customerId: null,
      description: null,
      ticketcustomCRMXml: null,
      ticketcustomCRMColumnXml: []
    };

    let allfieldsEmpty: boolean = true;
    for (const controlName in this.TicketFieldForm.controls) {
      // const control = this.TicketFieldForm.get(controlName);
      const value = this.TicketFieldForm.value[controlName];
      if (value) {
        allfieldsEmpty = false;
      }
    }

    if (allfieldsEmpty) {
      this.alertMessage(this.translate.instant('fill-fields-submitting'));
      return
    }

    for (const column in this.TicketFieldForm.value) {
      const value = this.TicketFieldForm.value[column];
      switch (column) {
        case 'Booking/RefNo.':
          locoBuzzCRMDetailTicket.bookingnumber =  value;
          break;
        case 'BookingRefNo':
          locoBuzzCRMDetailTicket.bookingnumber = value;
          break;
        case 'CustomerId':
          locoBuzzCRMDetailTicket.customerId = value;
          break;
        case 'CustomerID':
          locoBuzzCRMDetailTicket.customerId = value;
          break;
        case 'Description':
          locoBuzzCRMDetailTicket.description = value;
          break;
      }
    }

    for (const controlName in this.TicketFieldForm.controls) {
      const control = this.TicketFieldForm.get(controlName);
      const fieldDetails = this.customTicketCrmColumns.find((obj) => obj.dbColumn == controlName)
      let fieldName = ''
      if (controlName != 'Name' && fieldDetails?.columnDataType == 0 && control?.value) {
        const namevalNot = /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/? ]*$/
        if (!namevalNot.test(control.value)) {
          fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
        }
      }
      else if (fieldDetails?.columnDataType == 1 && control?.value) {
        const numbericReg = new RegExp('^[0-9]+$');
        if (!numbericReg.test(control.value)) {
          fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
        }
      }
      else if (fieldDetails?.columnDataType == 3 && control?.value) {
        const Rgx = new RegExp(/^\+?[0-9][0-9]{7,14}$/);
        if (!Rgx.test(control.value)) {
          fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
        }
      }
      else if (fieldDetails?.columnDataType == 4 && control?.value) {
        const emailval =
          /^([a-zA-Z0-9_&#\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!emailval.test(control.value)) {
          fieldName = this.translate.instant('Please-enter-valid-field', { fieldName: fieldDetails.dbColumnName });
        }
      }
      else if (fieldDetails?.columnDataType == 7 && control?.value) {
        const namevalNot = /^[a-zA-Z0-9_ ]*$/
        if (!namevalNot.test(control.value)) {
          fieldName = this.translate.instant('special-characters-not-allowed', { fieldName: fieldDetails.dbColumnName.toLowerCase() });
        }
      }
      if (fieldName) {
        this.alertMessage(fieldName);
        return;
      }
    }

    let customColumns = this.ticketAuthor && this.ticketAuthor?.ticketInfoAcconts.length && this.ticketAuthor.ticketInfoAcconts[0].ticketCustomCRMColumnXml && this.ticketAuthor.ticketInfoAcconts[0].ticketCustomCRMColumnXml.length ? this.ticketAuthor.ticketInfoAcconts[0].ticketCustomCRMColumnXml.filter(res => !res.isDeleted ) : [];

    for (
      let index = 0;
      index < customColumns.length;
      index++
    ) {
      const dropdownData = this.customTicketCrmColumns.find((obj) => customColumns[index].orderID ==
        obj.orderID &&
        obj.columnDataType == 5)

      if (dropdownData) {
        customColumns.dropDownData =
          JSON.stringify([dropdownData.dropDownData]);
      }
    }
    let breakC = false;
    
    if (customColumns) {
      customColumns.forEach((obj) => {
        obj.customColumValue = this.TicketFieldForm.value[obj.columnLable];
        if (obj.dropDownData && obj.columnDataType == 5) {
          let dropDownData = JSON.parse(obj.dropDownData)
          dropDownData = dropDownData && dropDownData.length ? dropDownData[0] : [];
          if (dropDownData && dropDownData.DropDownData && dropDownData.DropDownData.length) {
            dropDownData.selected = this.TicketFieldForm.value[dropDownData?.DropDownName];
            dropDownData?.DropDownData.forEach(res => {
              res.selected = this.TicketFieldForm.value[`${dropDownData?.DropDownName}_2`];
              if (res.DropDownData && res.DropDownData.length) {
                res.DropDownData.forEach(subRes => {
                  subRes.selected = this.TicketFieldForm.value[`${dropDownData?.DropDownName}_3`];
                  if (subRes.DropDownData && subRes.DropDownData.length) {
                    subRes.DropDownData.forEach(subSubRes => {
                      subSubRes.selected = this.TicketFieldForm.value[`${dropDownData?.DropDownName}_4`];
                      if (subSubRes.DropDownData && subSubRes.DropDownData.length) {
                        subSubRes.DropDownData.forEach(subSubSubRes => {
                          subSubSubRes.selected = this.TicketFieldForm.value[`${dropDownData?.DropDownName}_5`];
                          if (subSubSubRes.DropDownData && subSubSubRes.DropDownData.length) {
                            subSubSubRes.DropDownData.forEach(subSubSubSubRes => {
                              subSubSubSubRes.selected = this.TicketFieldForm.value[`${dropDownData?.DropDownName}_6`];
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
          obj.dropDownData = JSON.stringify([dropDownData]);
        }
        else if(obj.dropDownData && obj.columnDataType == 8) {
          obj.dropDownData = obj.customColumValue? JSON.stringify(obj.customColumValue):'';
          obj.customColumValue = obj.customColumValue? JSON.stringify(obj.customColumValue):'';
        }

        let rgx;
        if (
          obj.columnDataType == 2 &&
          this.TicketFieldForm.value[obj.columnLable]
        ) {
          obj.customColumValue = moment(
            this.TicketFieldForm.value[obj.columnLable]
          ).format('MM/DD/YYYY');
        }
        switch (obj.columnDataType) {
          // case 0:
          //   rgx = new RegExp(/^[a-zA-Z0-9 \-]+$/);
          //   break;

          case 1:
            rgx = new RegExp(/^[0-9 \-]+$/);
            break;

          case 2:
            rgx = new RegExp(/^\d{2}\/\d{2}\/\d{4}$/); //Date mm/dd/yyyy
            break;

          case 3:
            rgx = new RegExp(/^\+?[0-9][0-9]{7,14}$/);
            break;

          case 4:
            rgx = new RegExp(
              /^([a-zA-Z0-9_&#\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/
            );
            break;
          case 7:
            rgx = new RegExp(/^[a-zA-Z0-9_ ]*$/);
            break;
          default:
            break;
        }
        if (obj.customColumValue || (obj.columnDataType == 2 && obj.customColumValue != 'Invalid date')) {
          if (obj.columnDataType == 3) {
            if (obj.customColumValue && !rgx.test(Number(obj.customColumValue))) {
              this.alertMessage(`Please enter Valid Input in ${obj.columnLable} field.`);
              breakC = true;
              return false;
            }
          } else if (rgx && obj.customColumValue && !rgx.test(obj.customColumValue)) {
            this.alertMessage(`Please enter Valid Input in ${obj.columnLable} field.`);
            breakC = true;
            return false;
          }
        }
      });
    }
    locoBuzzCRMDetailTicket.ticketcustomCRMColumnXml = customColumns;
    const object = {
      brandInfo: {
        brandID: this._postDetailService?.postObj?.brandInfo?.brandID,
        brandName: this._postDetailService?.postObj?.brandInfo?.brandName,
        categoryGroupID: this._postDetailService?.postObj?.brandInfo?.categoryGroupID,
        categoryID: this._postDetailService?.postObj?.brandInfo?.categoryID,
        categoryName: null,
        brandFriendlyName: this._postDetailService?.postObj?.brandInfo?.brandGroupName,
        brandLogo: null
      },
      locoBuzzCRMDetailTicket: locoBuzzCRMDetailTicket,
      ticketID: this._postDetailService?.postObj?.ticketID,
      channelGroup: this._postDetailService?.postObj?.channelGroup,
    };

    if (!breakC) {
      this.updateLoader = true;
      this.SaveLocoBuzzCRMDetailTicketapi = this._ticketService.SaveLocoBuzzCRMDetailTicket(object).subscribe(
        (data) => {
          this.updateLoader = false;
          if (data.success) {
            this._userDetailService?.updateTicketFields?.next(true);
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Details-Saved-Successfully'),
              },
            });
            this._dynamicServices.updateMethodCallToApi.next(true);
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: data.message ? data.message : this.translate.instant('Unable-to-save-details'),
              },
            });
          }
          this.cdk.detectChanges();
        },
        (err) => {
          this.updateLoader = false;
          this.changeDetectionRef.detectChanges();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something went wrong'),
            },
          });
          this.cdk.detectChanges();
        }
      );
    }

  }

  openAssociateDialog(): void {
    this.dialog.open(AddAssociateChannelsComponent, {
      autoFocus: false,
      width: '650px',
    });
  }

  private getAuthorDetails(): void {
    this.postProfileLoading.set(true);
    this.changeDetectionRef.detectChanges();
    if (this.authorDetailsSubscription) {
      this.authorDetailsSubscription.unsubscribe();
    }
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this.GetAuthorDetailsapi = this.authorDetailsSubscription = this._userDetailService.GetAuthorDetails(filterObj).subscribe(
      (data) => {
        // ('User Details', data);
        this.author = {};
        // this.author = data;
        // if (data && data.connectedUsers && data.connectedUsers.length > 0) {
        if (data && data.connectedUsers){
          this.userEvent.emit(data.connectedUsers);
        }
          // const connectedusers: ConnectedSocialAuthors = {postObj: this.postObj,authors: data.connectedUsers };
          // this._userDetailService.connectedUsers.next(connectedusers);
        // }
        if (data) {
          this.mapCRMColumns(data);
        }
        this.getTicketSummary();
        // if (!data) {
        this.postProfileLoading.set(false);
        this.cdk.detectChanges();
        // }
      },
      (error) => {
        // console.log(error);
        this.postProfileLoading.set(false);
      }
    );
  }

  private GetAuthorTicketDetails(): void {
    const brandId = this.postObj?.brandInfo?.brandID;
    const holdTicketData = this._ticketService?.ticketDetailData();
    if (brandId && holdTicketData && holdTicketData?.brandID == brandId && holdTicketData?.ticketDetail) {
      this.customTicketFieldLoader = false;
    } else {
      this.customTicketFieldLoader = true;
      this.changeDetectionRef.detectChanges();
    }
    if (this.ticketFieldsDetailsSubscription) {
      this.ticketFieldsDetailsSubscription.unsubscribe();
    }
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    const obj = {
      brandID: filterObj?.brandInfo?.brandID,
      ticketId: filterObj?.ticketId
    }
    this.ticketFieldsDetailsSubscription = this._userDetailService.GetAuthorTicketDetails(obj).subscribe(
      (data) => {
        this.mapTicketCustomFieldColumns(data);
      },
      (error) => {
        this.customTicketFieldLoader = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something went wrong'),
          },
        });
        this.cdk.detectChanges();
      }
    );
  }


  private getTicketTimeline(ticketId?: number): void {
    this.postTimelineLoading = true;
    this.changeDetectionRef.detectChanges();
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    filterObj.isPlainLogText = false;
    if (ticketId) {
      filterObj.ticketId = ticketId;
    }
    this.GetTicketTimelineapi = this._userDetailService.GetTicketTimeline(filterObj).subscribe(
      (data) => {
        this.ticketTimeline = {};
        // if(data.data && data.data.length>0)
        // {
        //   for(const obj of data.data)
        //   {
        //     obj.mentionTime = obj.mentionTime ? moment.utc(obj.mentionTime).local().format('MMMM Do YYYY, h:mm:ss a') : '';
        //   }
        // }

        this.ticketTimeline = data;
        if (ticketId) {
          this.ticketIdLabel = String(ticketId);
        } else {
          this.ticketIdLabel = String(this.postObj.ticketInfo.ticketID);
        }
        this.postTimelineLoading = false;
        this.changeDetectionRef.detectChanges();
        if (this.author) {
          this.postTimelineLoading = false;
          this.changeDetectionRef.detectChanges();
        }
      },
      (error) => {
        this.postTimelineLoading = false;
        // console.log(error);
      }
    );
  }

  public CallTicketTimeLine(ticketId): void {
    this.getTicketTimeline(+ticketId);
  }

  private getTicketSummary(loader=false): void {
    if (this.ticketSummarySubscription) {
      this.ticketSummarySubscription.unsubscribe();
    }
    let currentBrandObj;
    if (this._postDetailService.pagetype === PostsType.chatbot) {
      this.assignLoading = true;
    }
    const brandList = this.filterService.fetchedBrandData;
    let isbrandworkflow = false;
    if (brandList) {
      currentBrandObj = brandList.find((obj) => Number(obj.brandID) === Number(this.postObj.brandInfo.brandID))
      if (currentBrandObj) {
        this.brand = currentBrandObj.brandFriendlyName;
        isbrandworkflow = currentBrandObj.isBrandworkFlowEnabled;
      }

    }
   loader? this.ticketSummaryLoader.set(true):'';
    // this.postProfileLoading = true;
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this.ticketSummarySubscription = this._userDetailService
      .GetTicketSummary(filterObj)
      .subscribe(
        (data) => {
          // console.log('Ticket Summary', data);
          this.ticketSumamry = {};
          this.ticketSumamry = data;
          this.totalMention = data.numberOfMentions;
          this.cdk.detectChanges();
          this.ticketDetailsForm.setValue({
            bookingNumber: this.ticketSumamry.ticketDetails?.bookingNumber,
            ticketDescription: this.ticketSumamry.ticketDetails?.ticketDescription,
            customerID: this.ticketSumamry.ticketDetails?.ticketCustomerID
          });
          const localdate = moment
            .utc(this.ticketSumamry.createdAt)
            .local()
            .format('MMMM Do YYYY, h:mm:ss a');

          const updatelocaldate = moment
            .utc(this.ticketSumamry.updatedAt)
            .local()
            .format('MMMM Do YYYY, h:mm:ss a');

          this.ticketCreatedOn = localdate;
          this.ticketUpdatedOn = updatelocaldate;
          if (this.ticketSumamry.assignedTo > 0) {
            const assignlocaldate = moment
              .utc(this.ticketSumamry.assignedAt)
              .local()
              .format('MMMM Do YYYY, h:mm:ss a');

            this.ticketAssignedToOn =
              this.ticketSumamry.assignToAgentUserName +
              ' at ' +
              assignlocaldate;
          }

          if (
            this.ticketSumamry.status === TicketStatus.PendingwithCSD ||
            this.ticketSumamry.status ===
              TicketStatus.PendingwithCSDWithNewMention ||
            (isbrandworkflow &&
              this.ticketSumamry.status === TicketStatus.RejectedByBrand) ||
            (isbrandworkflow &&
              this.ticketSumamry.status ===
                TicketStatus.RejectedByBrandWithNewMention)
          ) {
            if (
              this.ticketSumamry.escalatedTo &&
              this.ticketSumamry.escalatedTo > 0
            ) {
              const excalatedlocaldate = moment
                .utc(this.ticketSumamry.escalatedAt)
                .local()
                .format('MMMM Do YYYY, h:mm:ss a');
              this.ticketExcalatedToOn =
                this.ticketSumamry.escalatedTotUserName +
                ' at ' +
                excalatedlocaldate;
            }
          }
          if (
            this.ticketSumamry.status === TicketStatus.PendingWithBrand ||
            this.ticketSumamry.status ===
              TicketStatus.PendingWithBrandWithNewMention
          ) {
            if (
              this.ticketSumamry.escalatedToBrand &&
              this.ticketSumamry.escalatedToBrand > 0
            ) {
              const excalatedbrandlocaldate = moment
                .utc(this.ticketSumamry.escalatedToBrandAt)
                .local()
                .format('MMMM Do YYYY, h:mm:ss a');
              this.ticketExcalatedToOn =
                this.ticketSumamry.escalatedToBrandUserName +
                ' at ' +
                excalatedbrandlocaldate;
            }
          }

          // this.getSentimentUpliftAndNPSScore();
          // if (!data) {
          this.postProfileLoading.set(false);
          this.cdk.detectChanges();
          // }
          
          if (this._postDetailService.pagetype === PostsType.chatbot) {
            // this.AssignedTo = data.assignedTo;
            this.ticketStatus = data.status;
            this.postObj.ticketInfo.assignedTo = data.assignedTo;
            this.brand = currentBrandObj ? currentBrandObj.brandFriendlyName : this.brand;
            this.assignLoading = false;
            // this._ticketService.changeAssignee.next(data.assignedTo);
            this.TicketOverviewEnableDisableSection(
              this._postDetailService.postObj
            );
          }
          this.ticketSummaryLoader.set(false);
        },
      (error) => {
        this.ticketSummaryLoader.set(false);
        this.postProfileLoading.set(false);
        this.assignLoading = false;
        this.changeDetectionRef.detectChanges();
        // console.log(error);
      }
    );
  }

  // private getSentimentUpliftAndNPSScore(): void {
  //   this.postProfileLoading = true;
  //   const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
  //   this._userDetailService.GetSentimentUpliftAndNPSScore(filterObj).subscribe(
  //     (data) => {
  //       this.upliftAndSentimentScore = {};
  //       this.upliftAndSentimentScore = data;
  //       if (this.author) {
  //         this.createUserObject(this.author);
  //       }
  //       this.postProfileLoading = false;
  //     },
  //     (error) => {
  //       // console.log(error);
  //     }
  //   );
  // }

  ngOnDestroy(): void {
    this.clearSignal.set(false);
    if (this.matTabGrop) {
      this.matTabGrop._tabBodyWrapper = null; // Remove tab body wrapper
    }
    this.matTabGrop = null;
    this.changeDetectionRef.detectChanges();
    this.cdk.detach();
    this.subs.unsubscribe();
    this._aiFeatureService.ticketSummarization.next(null);
    this._aiFeatureService.ticketSummarizationCreditDetails.next(null);
    this.clearAllVariables();
  }

  TicketOverviewEnableDisableSection(obj: BaseMention): void {
    let addDisableClass = false;

    if (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare) {
      this.IsCSDUser = true;
    } else if (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount) {
      this.IsBrandUser = true;
    }
    if (
      this.currentUser?.data?.user?.role !== UserRoleEnum.CustomerCare &&
      this.currentUser?.data?.user?.role !== UserRoleEnum.BrandAccount
    ) {
      this.AwaitingResponseforAccounType = true;
    }

    const brandList = this.filterService.fetchedBrandData;
    let isbrandworkflow = false;
    if (brandList) {
      const currentBrandObj = brandList.find((obj) => Number(obj.brandID) === Number(this.postObj.brandInfo.brandID));
      if (currentBrandObj) {
        isbrandworkflow = currentBrandObj.isBrandworkFlowEnabled;
      }

    }

    if (!this.IsCSDUser) {
      let assignedTo =
        obj?.ticketInfo?.assignedTo != null ? obj.ticketInfo.assignedTo : 0;
      let assignedToTeam =
        obj.ticketInfo.assignedToTeam != null
          ? obj.ticketInfo.assignedToTeam
          : 0;

      if (isbrandworkflow) {
        switch (obj.ticketInfo.status) {
          case TicketStatus.Open:
          case TicketStatus.PendingwithAgent:
          case TicketStatus.Rejected:
          case TicketStatus.OnHoldAgent:
          case TicketStatus.CustomerInfoAwaited:
          case TicketStatus.ApprovedByBrand:
            assignedTo =
              obj.ticketInfo.assignedTo != null ? obj.ticketInfo.assignedTo : 0;
            assignedToTeam =
              obj.ticketInfo.assignedToTeam != null
                ? obj.ticketInfo.assignedToTeam
                : 0;
            break;

          case TicketStatus.RejectedByBrand:
          case TicketStatus.PendingwithCSD:
          case TicketStatus.OnHoldCSD:
            assignedTo =
              obj.ticketInfo.escalatedTo != null
                ? obj.ticketInfo.escalatedTo
                : 0;
            assignedToTeam =
              obj.ticketInfo.escalatedToCSDTeam != null
                ? obj.ticketInfo.escalatedToCSDTeam
                : 0;
            break;

          case TicketStatus.PendingWithBrand:
          case TicketStatus.OnHoldBrand:
            assignedTo =
              obj.ticketInfo.escalatedToBrand != null
                ? obj.ticketInfo.escalatedToBrand
                : 0;
            assignedToTeam =
              obj.ticketInfo.escalatedToBrandTeam != null
                ? obj.ticketInfo.escalatedToBrandTeam
                : 0;
            break;

          case TicketStatus.PendingwithCSDWithNewMention:
          case TicketStatus.OnHoldCSDWithNewMention:
          case TicketStatus.RejectedByBrandWithNewMention:
            if (
              this.currentUser?.data?.user?.role == UserRoleEnum.CustomerCare ||
              this.currentUser?.data?.user?.role == UserRoleEnum.BrandAccount
            ) {
              assignedTo =
                obj.ticketInfo.escalatedTo != null
                  ? obj.ticketInfo.escalatedTo
                  : 0;
              assignedToTeam =
                obj.ticketInfo.escalatedToCSDTeam != null
                  ? obj.ticketInfo.escalatedToCSDTeam
                  : 0;
            } else {
              assignedTo =
                obj.ticketInfo.assignedTo != null
                  ? obj.ticketInfo.assignedTo
                  : 0;
              assignedToTeam =
                obj.ticketInfo.assignedToTeam != null
                  ? obj.ticketInfo.assignedToTeam
                  : 0;
            }
            break;

          case TicketStatus.PendingWithBrandWithNewMention:
          case TicketStatus.OnHoldBrandWithNewMention:
            if (
              this.currentUser?.data?.user?.role == UserRoleEnum.CustomerCare ||
              this.currentUser?.data?.user?.role == UserRoleEnum.BrandAccount
            ) {
              assignedTo =
                obj.ticketInfo.escalatedToBrand != null
                  ? obj.ticketInfo.escalatedToBrand
                  : 0;
              assignedToTeam =
                obj.ticketInfo.escalatedToBrandTeam != null
                  ? obj.ticketInfo.escalatedToBrandTeam
                  : 0;
            } else {
              assignedTo =
                obj.ticketInfo.assignedTo != null
                  ? obj.ticketInfo.assignedTo
                  : 0;
              assignedToTeam =
                obj.ticketInfo.assignedToTeam != null
                  ? obj.ticketInfo.assignedToTeam
                  : 0;
            }
            break;
          default:
            assignedTo =
              obj.ticketInfo.assignedTo != null ? obj.ticketInfo.assignedTo : 0;
            assignedToTeam =
              obj.ticketInfo.assignedToTeam != null
                ? obj.ticketInfo.assignedToTeam
                : 0;
            break;
        }
      } else {
        switch (obj.ticketInfo.status) {
          case TicketStatus.Open:
          case TicketStatus.PendingwithAgent:
          case TicketStatus.Rejected:
          case TicketStatus.OnHoldAgent:
          case TicketStatus.CustomerInfoAwaited:
          case TicketStatus.RejectedByBrand:
          case TicketStatus.ApprovedByBrand:
          case TicketStatus.RejectedByBrandWithNewMention:
            assignedTo =
              obj.ticketInfo.assignedTo != null ? obj.ticketInfo.assignedTo : 0;
            assignedToTeam =
              obj.ticketInfo.assignedToTeam != null
                ? obj.ticketInfo.assignedToTeam
                : 0;
            break;

          case TicketStatus.OnHoldCSD:
          case TicketStatus.PendingwithCSD:
            assignedTo =
              obj.ticketInfo.escalatedTo != null
                ? obj.ticketInfo.escalatedTo
                : 0;
            assignedToTeam =
              obj.ticketInfo.escalatedToCSDTeam != null
                ? obj.ticketInfo.escalatedToCSDTeam
                : 0;
            break;

          case TicketStatus.PendingWithBrand:
          case TicketStatus.OnHoldBrand:
            assignedTo =
              obj.ticketInfo.escalatedToBrand != null
                ? obj.ticketInfo.escalatedToBrand
                : 0;
            assignedToTeam =
              obj.ticketInfo.escalatedToBrandTeam != null
                ? obj.ticketInfo.escalatedToBrandTeam
                : 0;
            break;

          case TicketStatus.PendingwithCSDWithNewMention:
          case TicketStatus.OnHoldCSDWithNewMention:
            if (this.currentUser?.data?.user?.role == UserRoleEnum.CustomerCare) {
              assignedTo =
                obj.ticketInfo.escalatedTo != null
                  ? obj.ticketInfo.escalatedTo
                  : 0;
              assignedToTeam =
                obj.ticketInfo.escalatedToCSDTeam != null
                  ? obj.ticketInfo.escalatedToCSDTeam
                  : 0;
            } else {
              assignedTo =
                obj.ticketInfo.assignedTo != null
                  ? obj.ticketInfo.assignedTo
                  : 0;
              assignedToTeam =
                obj.ticketInfo.assignedToTeam != null
                  ? obj.ticketInfo.assignedToTeam
                  : 0;
            }
            break;

          case TicketStatus.PendingWithBrandWithNewMention:
          case TicketStatus.OnHoldBrandWithNewMention:
            if (this.currentUser?.data?.user?.role == UserRoleEnum.BrandAccount) {
              assignedTo =
                obj.ticketInfo.escalatedToBrand != null
                  ? obj.ticketInfo.escalatedToBrand
                  : 0;
              assignedToTeam =
                obj.ticketInfo.escalatedToBrandTeam != null
                  ? obj.ticketInfo.escalatedToBrandTeam
                  : 0;
            } else {
              assignedTo =
                obj.ticketInfo.assignedTo != null
                  ? obj.ticketInfo.assignedTo
                  : 0;
              assignedToTeam =
                obj.ticketInfo.assignedToTeam != null
                  ? obj.ticketInfo.assignedToTeam
                  : 0;
            }
            break;

          default:
            assignedTo =
              obj.ticketInfo.assignedTo != null ? obj.ticketInfo.assignedTo : 0;
            assignedToTeam =
              obj.ticketInfo.assignedToTeam != null
                ? obj.ticketInfo.assignedToTeam
                : 0;
            break;
        }
      }
     if(!this.sfdcTicketView)
     {
      if (assignedTo != null && assignedTo != 0) {
        this.AssignedTo = assignedTo;
        const assignAgentName = this.filterService.fetchedAssignTo.find(
          (x) => x.agentID === this.AssignedTo
        );
        if (assignAgentName) {
          this.assignAgentName = assignAgentName.agentName;
        } else {
          this.assignAgentName = 'Not Assigned';
        }
      } else if (assignedToTeam != null && assignedToTeam != 0) {
        this.AssignedTo = assignedToTeam;
        const assignAgentName = this.filterService.fetchedAssignTo.find(
          (x) => x.teamID === this.AssignedTo
        );
        if (assignAgentName) {
          this.assignAgentName = assignAgentName.teamName;
        } else {
          this.assignAgentName = 'Not Assigned';
        }
      } else {
        this.AssignedTo = 0;
        this.assignAgentName = 'Not Assigned';
      }
    }
    }

    // if (!this.IsCSDUser) {
    //   if (
    //     obj.ticketInfo.status === TicketStatus.PendingwithCSD ||
    //     obj.ticketInfo.status === TicketStatus.OnHoldCSD ||
    //     obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
    //     obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention
    //   ) {
    //     if (
    //       obj.ticketInfo.escalatedTo != null &&
    //       obj.ticketInfo.escalatedTo !== 0
    //     ) {
    //       this.AssignedTo = obj.ticketInfo.escalatedTo;
    //       const assignAgentName = this.filterService.fetchedAssignTo.filter(
    //         (x) => x.agentID === this.AssignedTo
    //       );
    //       if (assignAgentName.length > 0) {
    //         this.assignAgentName = assignAgentName[0].agentName;
    //       } else {
    //         this.assignAgentName = 'Not Assigned';
    //       }
    //     } else if (
    //       obj.ticketInfo.escalatedToCSDTeam !== null &&
    //       obj.ticketInfo.escalatedToCSDTeam !== 0
    //     ) {
    //       this.AssignedTo = obj.ticketInfo.escalatedToCSDTeam;
    //       const assignAgentName = this.filterService.fetchedAssignTo.filter(
    //         (x) => x.teamID === this.AssignedTo
    //       );
    //       if (assignAgentName.length > 0) {
    //         this.assignAgentName = assignAgentName[0].teamName;
    //       } else {
    //         this.assignAgentName = 'Not Assigned';
    //       }
    //     } else {
    //       this.AssignedTo = 0;
    //       this.assignAgentName = 'Not Assigned';
    //     }
    //   } else if (
    //     obj.ticketInfo.status === TicketStatus.PendingWithBrand ||
    //     obj.ticketInfo.status === TicketStatus.OnHoldBrand ||
    //     obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention ||
    //     obj.ticketInfo.status === TicketStatus.PendingWithBrandWithNewMention ||
    //     obj.ticketInfo.status === TicketStatus.RejectedByBrandWithNewMention
    //   ) {
    //     if (
    //       obj.ticketInfo.escalatedToBrand != null &&
    //       obj.ticketInfo.escalatedToBrand !== 0
    //     ) {
    //       this.AssignedTo = obj.ticketInfo.escalatedToBrand;
    //       const assignAgentName = this.filterService.fetchedAssignTo.filter(
    //         (x) => x.agentID === this.AssignedTo
    //       );
    //       if (assignAgentName.length > 0) {
    //         this.assignAgentName = assignAgentName[0].agentName;
    //       } else if (obj.ticketInfo.assignedToTeamName) {
    //         this.assignAgentName = obj.ticketInfo.assignedToTeamName;
    //       } else {
    //         this.assignAgentName = 'Not Assigned';
    //       }
    //     } else if (
    //       obj.ticketInfo.escalatedToBrandTeam !== null &&
    //       obj.ticketInfo.escalatedToBrandTeam !== 0
    //     ) {
    //       this.AssignedTo = obj.ticketInfo.escalatedToBrandTeam;
    //       const assignAgentName = this.filterService.fetchedAssignTo.filter(
    //         (x) => x.teamID === this.AssignedTo
    //       );
    //       if (assignAgentName.length > 0) {
    //         this.assignAgentName = assignAgentName[0].teamName;
    //       } else {
    //         this.assignAgentName = 'Not Assigned';
    //       }
    //     } else {
    //       this.AssignedTo = 0;
    //       this.assignAgentName = 'Not Assigned';
    //     }
    //   } else {
    //     if (
    //       obj.ticketInfo.assignedTo != null &&
    //       obj.ticketInfo.assignedTo !== 0
    //     ) {
    //       this.AssignedTo = obj.ticketInfo.assignedTo;
    //     } else if (obj.ticketInfo.assignedToTeam) {
    //       if (obj.ticketInfo.assignedToTeamName) {
    //         this.AssignedTo = obj.ticketInfo.assignedToTeam;
    //         this.assignAgentName = obj.ticketInfo.assignedToTeamName;
    //       }
    //     } else {
    //       this.AssignedTo = 0;
    //       this.assignAgentName = 'Not Assigned';
    //     }
    //   }
    // }
    else if (
      (obj.ticketInfo.escalatedTo && obj.ticketInfo.escalatedTo !== 0) ||
      (obj.ticketInfo.escalatedToCSDTeam &&
        obj.ticketInfo.escalatedToCSDTeam !== 0)
    ) {
      if(obj.ticketInfo.status == TicketStatus.PendingwithCSD) {
        if (obj.ticketInfo.escalatedTo != null) {
          this.AssignedTo = obj.ticketInfo.escalatedTo;
        } else if (
          obj.ticketInfo.escalatedToCSDTeam != null &&
          obj.ticketInfo.escalatedToCSDTeam !== 0
        ) {
          this.AssignedTo = obj.ticketInfo.escalatedToCSDTeam;
        } else {
          this.AssignedTo = 0;
          this.assignAgentName = 'Not Assigned';
        }
      } else if (obj.ticketInfo.status == TicketStatus.PendingWithBrand){
        if (obj.ticketInfo.escalatedToBrand != null) {
          this.AssignedTo = obj.ticketInfo.escalatedToBrand;
        } else if (
          obj.ticketInfo.escalatedToBrandTeam != null &&
          obj.ticketInfo.escalatedToBrandTeam !== 0
        ) {
          this.AssignedTo = obj.ticketInfo.escalatedToBrandTeam;
        } else {
          this.AssignedTo = 0;
          this.assignAgentName = 'Not Assigned';
        }
      }
    } else if (
      (obj.ticketInfo.escalatedToBrand &&
        obj.ticketInfo.escalatedToBrand !== 0) ||
      (obj.ticketInfo.escalatedToBrandTeam &&
        obj.ticketInfo.escalatedToBrandTeam !== 0)
    ) {
      if (obj.ticketInfo.escalatedToBrand != null) {
        this.AssignedTo = obj.ticketInfo.escalatedToBrand;
      } else if (
        obj.ticketInfo.escalatedToBrandTeam != null &&
        obj.ticketInfo.escalatedToBrandTeam !== 0
      ) {
        this.AssignedTo = obj.ticketInfo.escalatedToBrandTeam;
      } else {
        this.AssignedTo = 0;
        this.assignAgentName = 'Not Assigned';
      }
    } 
    else {
      this.AssignedTo = 0;
      this.assignAgentName = 'Not Assigned';
    }
    if (
      obj.ticketInfo.status === TicketStatus.OnHoldCSD ||
      obj.ticketInfo.status === TicketStatus.PendingwithCSD
    ) {
      this.ispendingwithcsd = true;
    }

    if (
      this.currentUser?.data?.user?.role === UserRoleEnum.Agent ||
      this.currentUser?.data?.user?.role === UserRoleEnum.SupervisorAgent ||
      this.currentUser?.data?.user?.role === UserRoleEnum.LocationManager ||
      this.currentUser?.data?.user?.role === UserRoleEnum.TeamLead
    ) {
      if (
        obj.ticketInfo.status === TicketStatus.Open ||
        obj.ticketInfo.status === TicketStatus.PendingwithAgent ||
        obj.ticketInfo.status === TicketStatus.Rejected ||
        obj.ticketInfo.status === TicketStatus.OnHoldAgent ||
        obj.ticketInfo.status === TicketStatus.CustomerInfoAwaited ||
        obj.ticketInfo.status === TicketStatus.ApprovedByBrand ||
        obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention
      ) {
        // Agent and supervisor
        addDisableClass = false;
      } else {
        addDisableClass = true;
      }

      if (
        this.currentUser?.data?.user?.role === UserRoleEnum.Agent &&
        obj.makerCheckerMetadata.workflowStatus ===
          LogStatus.ReplySentForApproval
      ) {
        addDisableClass = true;
      }

      if (
        obj.ticketInfoSsre.ssreStatus === SSRELogStatus.SSREInProcessing ||
        obj.ticketInfoSsre.ssreStatus ===
          SSRELogStatus.IntentFoundStillInProgress
      ) {
        addDisableClass = true;
      }
    } else if (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare) {
      if (
        obj.ticketInfo.status === TicketStatus.PendingwithCSD ||
        obj.ticketInfo.status === TicketStatus.OnHoldCSD ||
        obj.ticketInfo.status === TicketStatus.RejectedByBrand ||
        obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention
      ) {
        // csd
        addDisableClass = false;
      } else {
        addDisableClass = true;
      }
    } else if (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount) {
      if (
        obj.ticketInfo.status === TicketStatus.PendingWithBrand ||
        obj.ticketInfo.status === TicketStatus.OnHoldBrand ||
        obj.ticketInfo.status === TicketStatus.PendingWithBrandWithNewMention
      ) {
        // brand
        addDisableClass = false;
      } else {
        addDisableClass = true;
      }
    }

    // Ticket ID Section
    if (
      obj.ticketInfo.status === TicketStatus.Close ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare &&
        (obj.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention)) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount &&
        (obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.RejectedByBrandWithNewMention))
    ) {
      // always disabled
      this.ticketidDisableClass = true;
    } else if (
      (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare &&
        (obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status ===
            TicketStatus.RejectedByBrandWithNewMention)) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount &&
        (obj.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention))
    ) {
      // always enabled
      this.ticketidDisableClass = false;
    } else if (
      this.currentUser?.data?.user?.role === UserRoleEnum.ReadOnlySupervisorAgent
    ) {
      this.ticketidDisableClass = true;
    } else {
      // based on condition addDisableClass =="CheckboxDisable"
      this.ticketidDisableClass = addDisableClass;
    }

    // Assign To
    // if (
    //   (this.currentUser.data.user.agentTicketReassignmentEnabled &&
    //     this.currentUser?.data?.user?.role === UserRoleEnum.Agent) ||
    //   this.currentUser?.data?.user?.role !== UserRoleEnum.Agent
    // ) {
    //   this.assignToDisableClass = addDisableClass;
    //   if (!addDisableClass) {
    //     // this.assignAgentName = 'Assign To';
    //   }
    // } else {
    //   this.assignToDisableClass = true;
    // }

    // Priority

    if (
      obj.ticketInfo.status === TicketStatus.Close ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare &&
        (obj.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention)) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount &&
        (obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.RejectedByBrandWithNewMention))
    ) {
      // always disabled
      this.priorityDisableClass = true;
    } else if (
      ((this.currentUser?.data?.user?.role === UserRoleEnum.Agent ||
        this.currentUser?.data?.user?.role === UserRoleEnum.SupervisorAgent ||
        this.currentUser?.data?.user?.role === UserRoleEnum.LocationManager) &&
        (obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status ===
            TicketStatus.PendingWithBrandWithNewMention ||
          obj.ticketInfo.status ===
            TicketStatus.RejectedByBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention)) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare &&
        (obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status ===
            TicketStatus.RejectedByBrandWithNewMention)) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount &&
        (obj.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention))
    ) {
      // always enabled
      this.priorityDisableClass = false;
    } else if (
      this.currentUser?.data?.user?.role === UserRoleEnum.ReadOnlySupervisorAgent
    ) {
      this.priorityDisableClass = true;
    } else {
      // based on condition addDisableClass =="CheckboxDisable"
      this.priorityDisableClass = addDisableClass;
    }

    // Ticket Status
    this.ticketStatus = TicketStatus.Open;
    if (
      ((this.currentUser?.data?.user?.role === UserRoleEnum.Agent ||
        this.currentUser?.data?.user?.role === UserRoleEnum.SupervisorAgent ||
        this.currentUser?.data?.user?.role === UserRoleEnum.LocationManager ||
        this.currentUser?.data?.user?.role === UserRoleEnum.TeamLead) &&
        (obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status ===
            TicketStatus.PendingWithBrandWithNewMention ||
          obj.ticketInfo.status ===
            TicketStatus.RejectedByBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention)) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare &&
        (obj.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.Close ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSD)) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount &&
        (obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status ===
            TicketStatus.RejectedByBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.Close))
    ) {
      // always disabled
      this.ticketstatusDisableClass = true;
      this.showstatusopen = true;
      if (!this.IsCSDUser && !this.IsBrandUser) {
        if (this.ticketStatus === TicketStatus.Open) {
          this.ticketStatus = TicketStatus.Open;
        }
      } else if (this.IsCSDUser) {
        if (
          obj.ticketInfo.status !== TicketStatus.OnHoldCSD &&
          obj.ticketInfo.status !== TicketStatus.OnHoldCSDWithNewMention
        ) {
          this.ticketStatus = TicketStatus.Open;
        }
        this.showstatusopendisabled = true;
      } else if (this.IsBrandUser) {
        if (obj.ticketInfo.status !== TicketStatus.OnHoldBrandWithNewMention) {
          this.ticketStatus = TicketStatus.Open;
        }
        this.showstatusopendisabled = true;
      }

      if (!this.IsCSDUser) {
        this.showstatusclose = true;
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.ticketStatus = TicketStatus.Close;
        }
      } else if (this.IsCSDUser) {
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.ticketStatus = TicketStatus.Close;
          this.showstatusclose = true;
        }
      }

      if (this.IsCSDUser) {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldCSD;
        if (
          obj.ticketInfo.status === TicketStatus.OnHoldCSD ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention
        ) {
          this.ticketStatus = TicketStatus.OnHoldCSD;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      } else if (this.IsBrandUser) {
        this.onholdstatus = TicketStatus.OnHoldBrand;
        this.showstatusonhold = true;
        if (obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention) {
          this.ticketStatus = TicketStatus.OnHoldBrand;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      } else {
        this.onholdstatus = TicketStatus.OnHoldAgent;
        this.showstatusonhold = true;
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      }

      if (this.AwaitingResponseforAccounType) {
        this.showstatusinfoawaited = true;
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusinfoawaiteddisabled = true;
        }
      }
    } else if (
      ((this.currentUser?.data?.user?.role === UserRoleEnum.Agent ||
        this.currentUser?.data?.user?.role === UserRoleEnum.SupervisorAgent ||
        this.currentUser?.data?.user?.role === UserRoleEnum.LocationManager ||
        this.currentUser?.data?.user?.role === UserRoleEnum.TeamLead) &&
        obj.ticketInfo.status === TicketStatus.Close) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare &&
        (obj.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
          obj.ticketInfo.status ===
            TicketStatus.RejectedByBrandWithNewMention)) ||
      (this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount &&
        (obj.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
          obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention))
    ) {
      // always enabled
      this.ticketstatusDisableClass = false;
      this.showstatusopen = true;
      if (!this.IsCSDUser && !this.IsBrandUser) {
        if (this.ticketStatus === TicketStatus.Open) {
          this.ticketStatus = TicketStatus.Open;
        }
      } else if (this.IsCSDUser) {
        if (obj.ticketInfo.status !== TicketStatus.OnHoldCSDWithNewMention) {
          this.ticketStatus = TicketStatus.Open;
        }
        this.showstatusopendisabled = true;
      } else if (this.IsBrandUser) {
        if (obj.ticketInfo.status !== TicketStatus.OnHoldBrandWithNewMention) {
          this.ticketStatus = TicketStatus.Open;
        }
        this.showstatusopendisabled = true;
      }

      if (!this.IsCSDUser) {
        this.showstatusclose = true;
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.ticketStatus = TicketStatus.Close;
        }
      } else if (this.IsCSDUser) {
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.ticketStatus = TicketStatus.Close;
          this.showstatusclose = true;
        }
      }

      if (this.IsCSDUser) {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldCSD;
        if (obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention) {
          this.ticketStatus = TicketStatus.OnHoldCSD;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      } else if (this.IsBrandUser) {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldBrand;
        if (obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention) {
          this.ticketStatus = TicketStatus.OnHoldBrand;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      } else {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldAgent;
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      }

      if (this.AwaitingResponseforAccounType) {
        this.showstatusinfoawaited = true;
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusinfoawaiteddisabled = true;
        }
      }
    } else if (
      this.currentUser?.data?.user?.role === UserRoleEnum.ReadOnlySupervisorAgent
    ) {
      this.ticketstatusDisableClass = true;
      this.showstatusopen = true;
      if (!this.IsCSDUser && !this.IsBrandUser) {
        if (this.ticketStatus === TicketStatus.Open) {
          this.ticketStatus = TicketStatus.Open;
        }
      } else if (this.IsCSDUser) {
        if (
          obj.ticketInfo.status !== TicketStatus.OnHoldCSD &&
          obj.ticketInfo.status !== TicketStatus.OnHoldCSDWithNewMention
        ) {
          this.ticketStatus = TicketStatus.Open;
        }
        this.showstatusopendisabled = true;
      } else if (this.IsBrandUser) {
        if (obj.ticketInfo.status !== TicketStatus.OnHoldBrandWithNewMention) {
          this.ticketStatus = TicketStatus.Open;
        }
        this.showstatusopendisabled = true;
      }

      if (!this.IsCSDUser) {
        this.showstatusclose = true;
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.ticketStatus = TicketStatus.Close;
        }
      } else if (this.IsCSDUser) {
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.ticketStatus = TicketStatus.Close;
          this.showstatusclose = true;
        }
      }

      if (this.IsCSDUser) {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldCSD;
        if (
          obj.ticketInfo.status === TicketStatus.OnHoldCSD ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention
        ) {
          this.ticketStatus = TicketStatus.OnHoldCSD;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      } else if (this.IsBrandUser) {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldBrand;
        if (obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention) {
          this.ticketStatus = TicketStatus.OnHoldBrand;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      } else {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldAgent;
        if (obj.ticketInfo.status === TicketStatus.OnHoldAgent) {
          this.ticketStatus = TicketStatus.OnHoldAgent;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      }

      if (this.AwaitingResponseforAccounType) {
        this.showstatusinfoawaited = true;
        if (obj.ticketInfo.status === TicketStatus.CustomerInfoAwaited) {
          this.ticketStatus = TicketStatus.CustomerInfoAwaited;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusinfoawaiteddisabled = true;
        }
      }
    } else {
      // based on condition addDisableClass =="CheckboxDisable"
      this.ticketstatusDisableClass = addDisableClass;
      this.showstatusopen = true;
      if (!this.IsCSDUser && !this.IsBrandUser) {
        if (this.ticketStatus === TicketStatus.Open) {
          this.ticketStatus = TicketStatus.Open;
          this.showstatusonholddisabled = false;
          this.showstatusinfoawaiteddisabled = false;
        }
      } else if (this.IsCSDUser) {
        if (
          obj.ticketInfo.status !== TicketStatus.OnHoldCSD &&
          obj.ticketInfo.status !== TicketStatus.OnHoldCSDWithNewMention
        ) {
          this.ticketStatus = TicketStatus.Open;
        }
        this.showstatusopendisabled = true;
      } else if (this.IsBrandUser) {
        if (obj.ticketInfo.status !== TicketStatus.OnHoldBrandWithNewMention) {
          this.ticketStatus = TicketStatus.Open;
        }
        this.showstatusopendisabled = true;
      }

      if (!this.IsCSDUser) {
        this.showstatusclose = true;
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.ticketStatus = TicketStatus.Close;
        }
      } else if (this.IsCSDUser) {
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.ticketStatus = TicketStatus.Close;
          this.showstatusclose = true;
        }
      }

      if (this.IsCSDUser) {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldCSD;
        if (
          obj.ticketInfo.status === TicketStatus.OnHoldCSD ||
          obj.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention
        ) {
          this.ticketStatus = TicketStatus.OnHoldCSD;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      } else if (this.IsBrandUser) {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldBrand;
        if (obj.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention) {
          this.ticketStatus = TicketStatus.OnHoldBrand;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      } else {
        this.showstatusonhold = true;
        this.onholdstatus = TicketStatus.OnHoldAgent;
        if (obj.ticketInfo.status === TicketStatus.OnHoldAgent) {
          this.ticketStatus = TicketStatus.OnHoldAgent;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusonholddisabled = true;
        }
      }

      if (this.AwaitingResponseforAccounType) {
        this.showstatusinfoawaited = true;
        if (obj.ticketInfo.status === TicketStatus.CustomerInfoAwaited) {
          this.ticketStatus = TicketStatus.CustomerInfoAwaited;
        }
        if (obj.ticketInfo.status === TicketStatus.Close) {
          this.showstatusinfoawaiteddisabled = true;
        }
      }
    }
    if (this.disableTicketOverview) {
      this.disbaleInputsAfterBulkPerformed();
    }

    const currentUser: AuthUser = JSON.parse(localStorage.getItem('user'));
    if (this.ticketStatus != TicketStatus.Close) {

    if (this.currentUser?.data?.user?.role == UserRoleEnum.Agent || this.currentUser?.data?.user?.role == UserRoleEnum.TeamLead)
    {
      if (this.currentUser?.data?.user?.actionButton?.assignmentEnabled)
      {
        this.assignementEnabled =true
      }else{
        this.assignementEnabled = false
      }
    }else{
      this.assignementEnabled =this.currentUser?.data?.user?.actionButton?.allowAssignment
    }
      if (this.ispendingwithcsd && this.currentUser?.data?.user?.role !== UserRoleEnum.CustomerCare)
    {
this.assignToDisableClass = true;
    }else
    {
      if (!this.assignementEnabled) {
        this.assignToDisableClass = true;
      } else {
        this.assignToDisableClass = false;
      }
    }
  }else
  {
      this.assignToDisableClass = true;
  }


    this.changePriorityEnabled =
      currentUser?.data?.user?.actionButton?.changeTicketPriorityEnabled;
    this.editPersonalDetailsEnabled =
      currentUser?.data?.user?.actionButton?.editPersonalDetailsEnabled;

    
    if (!this.changePriorityEnabled) {
      this.priorityDisableClass = true;
    }
    if (
      this.postObj?.ticketInfo?.srid &&
      this.postObj?.ticketInfo?.status == TicketStatus.Open
    ) {
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == String(this.postObj.brandInfo.brandID)
      );
      if (brandInfo?.isUpdateWorkflowEnabled) {
        this.ticketstatusDisableClass = true;
      }
    }
    this.showstatusopendisabled = !this.currentUser?.data?.user?.actionButton?.ticketReopenEnabled
    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM)
    {
      this.assignToDisableClass = true
      this.priorityDisableClass = true
      this.ticketstatusDisableClass = true
    }
    // if(this.currentUser?.data?.user?.role==UserRoleEnum.Agent)
    // {
    //   this.assignToDisableClass = this.currentUser?.data?.user?.isTakeoverTicketEnabled?false:true
    // }
    /* tickt approval pending */
    if (this.currentUser?.data?.user?.role === UserRoleEnum.Agent && this.postObj?.makerCheckerMetadata?.workflowStatus === LogStatus.ReplySentForApproval) {
      this.assignToDisableClass = true;
    }
    /* tickt approval pending */
    /* if crm ticket reopen direct close button enable */
    if (obj?.ticketInfo?.srid && obj?.ticketInfo?.status == TicketStatus.Open) {
      const brandInfo = this._filterService.fetchedBrandData.find((brand) => brand.brandID == String(obj.brandInfo.brandID));
      if (brandInfo?.isUpdateWorkflowEnabled && (brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm')) {
        this.getCRMTicketStatus(obj?.ticketInfo?.ticketID);
      }
    }
    /* if crm ticket reopen direct close button enable */
    this._ticketService.ticketAssignedToChange.next(this.AssignedTo)
    this.changeDetectionRef.detectChanges();
  }

  checkAutoClosureEligibility(): void {
    const keyObj = {
      BrandID: this.postObj.brandInfo.brandID,
      BrandName: this.postObj.brandInfo.brandName,
    };

    this.checkAutoclosureEligibilityapi = this._ticketService
      .checkAutoclosureEligibility(keyObj)
      .subscribe((data) => {
        if (data.success) {
          this.isAutoClosuerEnable = data.data.isAutoClosuerEnable;
          this.isEligibleForAutoclosure = data.data.isAutoClosuerEnable;

          if (!this.isEligibleForAutoclosure && this.isAutoClosuerEnable) {
            this.isEligibleForAutoclosure = true;
            //ChannelCommon.Save1(thisobj, Source, formData, FoulKeywordData);
          }
          this.changeDetectionRef.detectChanges();
        }
      });
  }

  public  getSentiment= Sentiment

  openCategoryDialog(event): void {
    if (this.currentUser?.data?.user?.actionButton?.assignMentionEnabled)
    {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.mentionCategory, param: {mentionCategory}});
    this.postObj.categoryMapText = null;
    this._postDetailService.postObj = this.postObj;
    this._postDetailService.isBulk = false;
    this._postDetailService.categoryType = event;
    // this._postDetailService.pagetype = this.pageType;
    this.dialog.open(CategoryFilterComponent, {
      width: '73vw',
      disableClose: false,
    });
  }
  }

  onTabChanged(event): void {
    if (((event.tab.textLabel == 'Overview' || event.tab.textLabel == this.translate.instant('Overview')) || event.tab.textLabel == 'Ticket Overview' || event.tab.textLabel == this.translate.instant('Ticket Overview'))) {
      if (!this.assignUserListFlag) {
        this.assignUserListFlag =
          this._postAssignToService.getAssignedUsersList(
            this.currentUser,
            this._postDetailService.postObj.makerCheckerMetadata.workflowStatus,
            this.assignToDisableClass
          );
      }
      this.assignTo = this._postAssignToService.assignTo$;
      /* if crm ticket reopen direct close button enable */
      const ticketData = this._postDetailService.postObj;
      if (ticketData?.ticketInfo?.srid && ticketData?.ticketInfo?.status == TicketStatus.Open) {
        const brandInfo = this._filterService.fetchedBrandData.find((brand) => brand.brandID == String(ticketData.brandInfo.brandID));
        if (brandInfo?.isUpdateWorkflowEnabled && (brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm')) {
          this.getCRMTicketStatus(ticketData?.ticketInfo?.ticketID);
        }
      }
      /* if crm ticket reopen direct close button enable */
      this.changeDetectionRef.detectChanges();
      this.getTicketTimeline();
      // this.getAuthorTicketMandatoryDetails();
    }
    if (event.tab.textLabel == 'Timeline' || event.tab.textLabel == this.translate.instant('Timeline')) {
      this.getTicketTimeline();
    }
    this.outputIndex.emit(event.index)
  }

  ticketDispositionDialog(): void {
    // if(this.ticketDispositionList.length > 0) {
    //   const despositionObj = {
    //     baseMention: this.postObj,
    //     dispositionList: this.ticketDispositionList
    //   }
    //   const dialogRef = this.dialog.open(TicketDispositionComponent, {
    //     width: '43vw',
    //     data: despositionObj
    //   });
  
    //   dialogRef.afterClosed().subscribe((res) => {
    //     if (res) {
    //       this.dispositionDetails = res;
    //       this.changeTicketStatus({ value: 3 });
    //     } else {
    //       this.ticketStatus = this.previousTicketStatus;
    //     }
    //   });
    // } 
    if (this.ticketDispositionList.length > 0) {
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == this.postObj.brandInfo.brandID
      );
      if (brandInfo) {
        const obj = {
          CategoryGroupID: brandInfo.categoryGroupID,
          CategoryGroupName: brandInfo.categoryName,
          TicketID: this.postObj?.ticketID
        };
        this.getDispositionDetailsapi = this._replyService.getDispositionDetails(obj).subscribe((res) => {
          if (res.success) {
            this.ticketDispositionList = res.data.ticketDispositionList;
            if (this.isAgentIqEnabled && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled) {
              this.generateAgentIQ().then((closureApproved: boolean) => {
                if (!closureApproved) {
                  const despositionObj = {
                    baseMention: this.postObj,
                    dispositionList: this.ticketDispositionList,
                    note: res?.data ? res?.data?.note : '',
                    ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                  }
                  const dialogRef = this.dialog.open(TicketDispositionComponent, {
                    width: '43vw',
                    data: despositionObj
                  });

                  dialogRef.afterClosed().subscribe((res) => {
                    if (res != 'composeReply' && res != false && res != 'closeWithNote') {
                      this.dispositionDetails = res;
                      this.changeTicketStatus({ value: 3 });
                    } else {
                      this.ticketStatus = this.previousTicketStatus;
                      this.cdk.detectChanges();
                    }
                  });
                } else {
                  if (this.ticketDispositionList.length > 0) {
                    const despositionObj = {
                      baseMention: this.postObj,
                      dispositionList: this.ticketDispositionList,
                      note: res?.data ? res?.data?.note : '',
                      ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                    }
                    const dialogRef = this.dialog.open(TicketDispositionComponent, {
                      width: '43vw',
                      data: despositionObj
                    });

                    dialogRef.afterClosed().subscribe((res) => {
                      if (res) {
                        this.dispositionDetails = res;
                        this.changeTicketStatus({ value: 3 });
                      } else {
                        this.ticketStatus = this.previousTicketStatus;
                        this.cdk.detectChanges();
                      }
                    });
                  } else {
                    this.changeTicketStatus({ value: 3 });
                  }
                }
              })
            } else if (this.ticketDispositionList.length > 0) {
              this._ticketService.generateClosingTicket.next(null);
              const despositionObj = {
                baseMention: this.postObj,
                dispositionList: this.ticketDispositionList,
                note: res?.data ? res?.data?.note : '',
                ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
              }
              const dialogRef = this.dialog.open(TicketDispositionComponent, {
                width: '43vw',
                data: despositionObj
              });

              dialogRef.afterClosed().subscribe((res) => {
                if (res) {
                  this.dispositionDetails = res;
                  this.changeTicketStatus({ value: 3 });
                } else {
                  this.ticketStatus = this.previousTicketStatus;
                  this.cdk.detectChanges();
                }
              });
            } else {
              this._ticketService.generateClosingTicket.next(null);
              this.changeTicketStatus({ value: 3 });
            }
          } else {
            this._ticketService.generateClosingTicket.next(null);
            this.changeTicketStatus({ value: 3 });
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
    } else if (this.isAgentIqEnabled && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled) {
      this.generateAgentIQ().then((closureApproved: boolean) => {
        if (!closureApproved) {
          const despositionObj = {
            baseMention: this.postObj,
            dispositionList: [],
            dispositionOff: true
          }
          const dialogRef = this.dialog.open(TicketDispositionComponent, {
            width: '43vw',
            data: despositionObj
          });

          dialogRef.afterClosed().subscribe((res) => {
            if (res != 'composeReply' && res != false && res != 'closeWithNote') {
              this.dispositionDetails = res;
              this.changeTicketStatus({ value: 3 });
            } else {
              this.ticketStatus = this.previousTicketStatus;
              this.cdk.detectChanges();
            }
          });
        } else {
          this.changeTicketStatus({ value: 3 });
        }
      })
    } else {
      this._ticketService.generateClosingTicket.next(null);
    }
  }

  createTicketDispositionJson(
    object,
    isAutoTicketCategorizationEnabled
  ): Object {
    if (this.dispositionDetails) {
      object.DispositionID = this.dispositionDetails?.dispositionId;
      if (
        this.dispositionDetails?.categoryCards &&
        this.dispositionDetails?.categoryCards.length > 0
      ) {
        object.source.categoryMap = this.dispositionDetails?.categoryCards;
        object.source.categoryMapText = null;
      }
      const dispositionTask = {
        AssignedToTeam: 0,
        AssignedToUserID: 0,
        Channel: null,
        Note: '',
        Status: ClientStatusEnum.TicketDisposition,
        TagID: String(this.postObj.tagID),
        TicketID: 0,
        type: 'CommunicationLog',
      };
      const noteTask = {
        AssignedToTeam: 0,
        AssignedToUserID: 0,
        Channel: null,
        Note: this.dispositionDetails?.note,
        NotesAttachment: this.dispositionDetails?.NoteAttachments,
        Status: ClientStatusEnum.NotesAdded,
        TagID: String(this.postObj.tagID),
        TicketID: 0,
        type: 'CommunicationLog',
      };
      object.Tasks = [];
      if (this.dispositionDetails?.note !== undefined) {
        object.Tasks.push(noteTask);
      }
      object.Tasks.push(dispositionTask);
      object.isAutoTicketCategorizationEnabled =
        isAutoTicketCategorizationEnabled;
    }
    return object;
  }

  changeUpperCategory(): void {
    let ticketCategory = '';
    let ticketcatcolor = null;
    
    this.ticketCategory = this._postDetailService.postObj.ticketInfo
      .ticketCategoryMap
      ? this._postDetailService.postObj.ticketInfo.ticketCategoryMap[0].name
      : null;
    if (this.postObj.ticketInfo.ticketUpperCategory.name)
    this.upperCategory = this.postObj.ticketInfo.ticketUpperCategory.name;
    if (
      this.postObj.ticketInfo.ticketCategoryMap != null &&
      this.postObj.ticketInfo.ticketCategoryMap
    ) {
      this.ticketcategories = [];
      for (
        let i = 0;
        i < this.postObj.ticketInfo.ticketCategoryMap.length;
        i++
      ) {
        if (this.postObj.ticketInfo.ticketCategoryMap[i].sentiment == null) {
          for (
            let j = 0;
            j <
            this.postObj.ticketInfo.ticketCategoryMap[i].subCategories.length;
            j++
          ) {
            if (
              this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                .sentiment == null
            ) {
              for (
                let k = 0;
                k <
                this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .subSubCategories.length;
                k++
              ) {
                const parentticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].name;
                const subticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .name;
                ticketCategory =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .subSubCategories[k].name;
                if (ticketCategory) {
                  ticketcatcolor =
                    this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[
                      j
                    ].subSubCategories[k].sentiment;
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
                this.ticketcategories.push(subsubcategory);
              }
            } else {
              const parentticketCategory =
                this.postObj.ticketInfo.ticketCategoryMap[i].name;
              ticketCategory =
                this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .name;
              if (ticketCategory) {
                ticketcatcolor =
                  this.postObj.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .sentiment;
              }

              const subcategory: TicketMentionCategory = {
                name: parentticketCategory + '/' + ticketCategory,
                sentiment: ticketcatcolor,
                show: i < 3 ? true : false,
              };
              this.ticketcategories.push(subcategory);
            }
          }
        } else {
          ticketCategory = this.postObj.ticketInfo.ticketCategoryMap[i].name;
          if (ticketCategory) {
            ticketcatcolor =
              this.postObj.ticketInfo.ticketCategoryMap[i].sentiment;
          }
          const category: TicketMentionCategory = {
            name: ticketCategory,
            sentiment: ticketcatcolor,
            show: i < 3 ? true : false,
          };
          this.ticketcategories.push(category);
        }
      }
    }
  }

  customMultilingualValidator(control: any) {
    const value: string = control || '';
    const regex = /^[\u0000-\uffff]+$/; 
    const notAcceptRegex = /^[^`~*\uD800-\uDFFF]+$/;
    return regex.test(value) && notAcceptRegex.test(value);
  }
  onTicketSummaryClick() {
    if (!this.isTicketSummaryCreditExpired) {
      this.showTicketSummary = !this.showTicketSummary;
      if (this.showTicketSummary) {
        this.ticketSummaryData();
      } 
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('AI-Ticket-Summarization-Credit-Expired')
        },
      });
    }
  }

  ticketSummaryData() {
    if (this.ticketSummarizationDetail == "" || this.ticketSummarizationDetail == "No summary available.") {
      this.summarizationLoader = true;

      let obj = {
        brand_name: this.postObj?.brandInfo?.brandName,
        brand_id: this.postObj?.brandInfo?.brandID,
        author_id: this.postObj?.author?.socialId,
        author_name: this.postObj?.author?.name,
        channel_group_id: this.postObj?.channelGroup,
        ticket_id: this.ticketSumamry?.ticketID,
        channel_type: this.postObj?.channelType,
        user_id: this.currentUser?.data?.user?.userId,
        tag_id: +this.ticketSumamry?.tagID
      }

      this.GetAITicketSummaryDataapi = this._aiFeatureService.GetAITicketSummaryData(obj).subscribe((result) => {
        if (result.success) {
          this.summarizationLoader = false;
          this.ticketSummarizationDetail = result.data.replace('<|im_end|>', '');
          this.cdk.detectChanges();
        } else {
          this.summarizationLoader = false;
          this.ticketSummarizationDetail = this.translate.instant('No-summary-available');
          this.cdk.detectChanges();
          // this._snackBar.openFromComponent(CustomSnackbarComponent, {
          //   duration: 5000,
          //   data: {
          //     type: notificationType.Error,
          //     message: result.message ? result.message : 'Unable to fetch ticket summary.'
          //   },
          // });
        }
      }, (err) => {
        // this.summarizationLoader = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: err.message ? err.message : this.translate.instant('Unable-to-fetch-ticket-summary')
          },
        });
      })
    }
  }

  getSuggestedRresponse() {
    const aiobj = {
      user_id: this.currentUser?.data?.user?.userId,
      brand_id: Number(this.postObj?.brandInfo?.brandID,),
    }
    this.subs.add(
      this._aiFeatureService.getSuggestedRresponse(aiobj).subscribe((res) => {
        if (res?.success && res?.data?.length > 0) {
          const aiSuggestedRresponse = res.data[0];
          if (aiSuggestedRresponse?.IsTicketSummarizationEnabled && aiSuggestedRresponse?.IsAISuggestedFeatureEnabled) {
            this.isTicketSummarizationEnable = true;
          } else {
            this.isTicketSummarizationEnable = false;
          }
        }
      })
    );
  }

  getAICreditStatus() {
    const obj = {
      user_id: this.currentUser?.data?.user?.userId
    }
    this.subs.add(
      this._aiFeatureService.getCreditStatus(obj).subscribe((response) => {
        if (response.success) {
          const data = response.data.result[0];
          this.isTicketSummaryCreditExpired = data.credit_expired;
          if (!this.isTicketSummaryCreditExpired) {
            if (data.credit_expired_alert) {
              this.ticketSummaryLogo = 'assets/images/media/smart_suggestion-expirealert.svg';
              this.ticketSummaryTooltip = this.translate.instant('AI-Ticket-Summarization')
            } else {
              this.ticketSummaryLogo = "assets/images/common/stars__blue.svg";
              this.ticketSummaryTooltip = '';
            }
          } else {
            this.ticketSummaryLogo = 'assets/images/media/smart_suggestion-expire.svg';
            this.ticketSummaryTooltip = this.translate.instant('AI-Ticket-Summarization-Credit-Expired');
          }
          
        }
        this.changeDetectionRef.detectChanges();
      })
    );
  }

  copyProperties(sourceObject, targetObject, propertiesToCopy) {
    propertiesToCopy.forEach((property) => {
        // Copy the specified property from object2 to object1
        sourceObject[property] = targetObject[property];
    });
  }

  _handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === 32) {
      // do not propagate spaces to MatSelect, as this would select the currently active option
      event.stopPropagation();
    }
  }

  updateSearchText(field, value) {
    if(field === "Parent") {
      this.searchParent = value.toLowerCase();
    } else if(field === "Child") {
      this.searchChild = value.toLowerCase();
    } else if (field === "Sub Child") {
      this.searchSubChild = value.toLowerCase();
    }
    else if (field === "Level 4") {
      this.searchLevelFour = value.toLowerCase();
    }
    else if (field === "Level 5") {
      this.searchLevelFive = value.toLowerCase();
    }
    else if (field === "Level 6") {
      this.searchLevelSix = value.toLowerCase();
    }
  }

  closeDropDown(field: string) {
    if (field === "Parent") {
      this.searchParent = "";
      (document.getElementById('parentSearchText') as HTMLInputElement).value = '';
    } else if (field === "Child") {
      this.searchChild = "";
      (document.getElementById('childSearchText') as HTMLInputElement).value = '';
    } else if (field === "Sub Child") {
      this.searchSubChild = "";
      (document.getElementById('subChildSearchText') as HTMLInputElement).value = '';
    } else if (field === "Level 4") {
      this.searchLevelFour = "";
      (document.getElementById('levelFourSearchText') as HTMLInputElement).value = '';
    } else if (field === "Level 5") {
      this.searchLevelFive = "";
      (document.getElementById('levelFiveSearchText') as HTMLInputElement).value = '';
    } else if (field === "Level 6") {
      this.searchLevelSix = "";
      (document.getElementById('levelSixSearchText') as HTMLInputElement).value = '';
    }
  }


  getUnmaskedValue(column){
    let allColumn = [...this.author?.crmColumns?.customColumns];
    allColumn.push(...this.author?.crmColumns?.existingColumns);

    let data = allColumn.find((x) => x.dbColumn == column.dbColumn || x.columnLable == column.dbColumn);

    if (column?.isShow){
      let currentData = this.allMaskedDataWithName.filter((x) => x.dbColumnName == column.dbColumnName);
      if (currentData && currentData.length > 0) {
        this.customCrmColumns.forEach((x) => {
          if (x.dbColumn == column.dbColumn) {
            x.isShow = !column.isShow;
            x.value = currentData[0]?.value;
          }
        })
      }
    } else {
      const index = this.allMaskedDataWithName.findIndex((x) => x.dbColumnName == column.dbColumnName);
      if (index > -1) {
        this.allMaskedDataWithName.splice(index, 1);
      }
      this.allMaskedDataWithName.push({ dbColumnName: column.dbColumnName, value: column.value });
      
      let obj = {
        MAPID: this.author.locoBuzzCRMDetails.id,
        OrderID: data.orderID,
        ColumnLable: data.columnLable
      }
      this.GetUnmaskedValueapi = this._ticketService.GetUnmaskedValue(obj).subscribe((result) =>{
        if(result.success){
          column.value = result.data;

          this.customCrmColumns.forEach((x)=>{
            if (x.dbColumn == column.dbColumn) {
              x.isShow = !column.isShow;
            }
          })
          this.cdk.detectChanges();
        }
      })
    }
  }
  getCRMTicketStatus(ticketid: number) {
    if(ticketid){
      this.getCRMTicketStatusapi = this._ticketService.getCRMTicketStatus({ TicketID: ticketid }).subscribe((res) => {
        if (res.success) {
          if (res?.data) this.ticketstatusDisableClass = false;
        }
      })
    }
  }
  refreshAssignList() {
    this._postAssignToService.getAssignedUsersList(this.currentUser, this._postDetailService.postObj.makerCheckerMetadata.workflowStatus, false, true);
    this.cdk.detectChanges();
  }

  currentPostObjectSignalChange(value) {
    if (value > 0) {
      if (this._ticketService?.ticketDetailData() && this.postObj && this.postObj?.brandInfo?.brandID) {
        const brandId = this.postObj?.brandInfo?.brandID;
        const holdTicketData = this._ticketService?.ticketDetailData();
        if (brandId && holdTicketData && holdTicketData.brandID == brandId && holdTicketData?.ticketDetail) {
          this.createTicketFormGroup(holdTicketData.ticketDetail, true);
        }
      }
      this.postObj =
        this.TicketData.find((obj) => obj.ticketInfo.ticketID === value) ||
        this._postDetailService.postObj;
      this.allChannelPostObj = this.postObj
      // this.selectedPostID = this.postObj?.ticketInfo?.ticketID;
      this._postDetailService.postObj = this.postObj;
      this.author = {};
      this.ticketTimeline = {};
      this.upliftAndSentimentScore = {};
      this.ticketSumamry = {};
      if (this.postObj) {
        this.setParams();
        this.fillTicketOverview();
        if (this.postObj.channelGroup != ChannelGroup.Email) {
          this.getAuthorDetails();
        } else {
          this.postProfileLoading.set(true);
        }
        this.checkAutoClosureEligibility();
        this.setEventObservables();
        this.GetAuthorTicketDetails();
      }
      this.assignUserListFlag = false;
      if (this.matTabGrop){
        this.matTabGrop.selectedIndex = this.activeTab;
      }
      if (this.activeTab == 0) {
        if (!this.assignUserListFlag) {
          this.assignUserListFlag =
            this._postAssignToService.getAssignedUsersList(
              this.currentUser,
              this._postDetailService.postObj.makerCheckerMetadata.workflowStatus,
              this.assignToDisableClass
            );
        }
        this.assignTo = this._postAssignToService.assignTo$;
        this.changeDetectionRef.detectChanges();
      }
      if (this.activeTab == 4 || this.activeTab == 0) {
        this.getTicketTimeline();
      }
      this.dispositionDetails = null;
      this.showTicketSummary = false;
      this.ticketSummarizationDetail = "";
      this.summarizationLoader = false;
      this.cdk.detectChanges();
    }
  }

  postDetailObjectChangedSignalChange(obj){
    if (obj) {
      if (obj?.ticketInfo?.ticketID === this.postObj?.ticketInfo?.ticketID) {
        this.postObj.ticketInfo.ticketCategoryMap =
          this._postDetailService.postObj.ticketInfo.ticketCategoryMap;
        this.postObj.categoryMap =
          this._postDetailService.postObj.categoryMap;
        this.setCategoryMapping();
        // if (
        //   this.ticketStatus == TicketStatus.Open ||
        //   this.ticketStatus == TicketStatus.Close ||
        //   this.ticketStatus == TicketStatus.OnHoldCSD ||
        //   this.ticketStatus == TicketStatus.CustomerInfoAwaited
        // ) {
        //   this.ticketStatus =
        //     this._postDetailService.postObj.ticketInfo.status;
        // }
        // this.fillTicketOverview();
      }
      this.changeDetectionRef.detectChanges();
    }
  }

  emailProfileDetailsObsSignalChange(data){
    if (data) {
      this.postObj = data;
      this._postDetailService.postObj = data;
      this.postObj.ticketInfo.status =
        this._postDetailService.postObj.ticketInfo.status;
      this.postObj.ticketInfo.ticketPriority =
        this._postDetailService.postObj.ticketInfo.ticketPriority;
      this.postObj.allMentionInThisTicketIsRead =
        this._postDetailService.postObj.allMentionInThisTicketIsRead;
      this.postObj.ticketInfo.ticketID =
        this._postDetailService.postObj.ticketInfo.ticketID;
      this.postObj.ticketInfo.assignedTo =
        this._postDetailService.postObj.ticketInfo.assignedTo;
      this.postObj.ticketInfo.assignedToTeam =
        this._postDetailService.postObj.ticketInfo.assignedToTeam;
      this.postObj.numberOfMentions =
        this._postDetailService.postObj.numberOfMentions;
      this._postDetailService.postObj = this.postObj;
      this.author = {};
      this.ticketTimeline = {};
      this.upliftAndSentimentScore = {};
      this.ticketSumamry = {};
      if (this.postObj) {
        this.setParams();
          this.fillTicketOverview(); // this.filterService.fetchedAssignTo);
          this.getAuthorDetails();
          this.getTicketTimeline();
          this.checkAutoClosureEligibility();
          this.setEventObservables();
          this.GetAuthorTicketDetails();
      }
      this.dispositionDetails = null;
      this.cdk.detectChanges();
    }
  }

  // getAuthorTicketMandatoryDetails() {
  //   let obj = {
  //     brandID: this.postObj?.brandInfo?.brandID,
  //     ticketId: this.postObj?.ticketID
  //   };
  //   this.getAuthorTicketMandatoryDetailsApi = this._userDetailService.GetAuthorTicketMandatoryDetails(obj).subscribe((res) => {
  //     if (res.success) {
  //       this.authorDetails = res;
  //       this.mapTicketCustomFieldValidation(this.authorDetails);
  //     }
  //   })
  // }

  // mapTicketCustomFieldValidation(author?: any) {
  //   let isValid = true;
  //   this.missingFieldsClosure = [];
  //   if (author !== undefined && author?.data && author?.data?.isMandatoryForClosure) {
  //     const customArray = author?.data?.mandatoryFieldClosure;
  //     for (let i = 0; i < customArray?.length; i++) {
  //       if (customArray) {
  //         if (author?.data?.mandatoryFieldClosure && author?.data?.mandatoryFieldClosure?.length > 0) {
  //           const isExist = author?.data?.mandatoryFieldClosure[i];
  //           if (isExist && isExist?.length > 0) {
  //             this.missingFieldsClosure?.push(isExist);
  //           }
  //         }
  //       }
  //     }
  //     // if (missingFieldsClosure?.length > 0) {
  //     //   let title = 'Action cannot be completed';
  //     //   let message = `The following mandatory fields must be filled before you can proceed:<br> <ul>
  //     //   ${author?.data?.mandatoryFieldClosure?.map(field => `<li>\u25CF ${field}</li>`)?.join('')}</ul><br>
  //     //   Please complete these fields and try again.`;
  //     //   const dialogData = new AlertDialogModel(title, message, 'Go to Ticket Details', 'Cancel');
  //     //   const dialogRef = this.dialog.open(AlertPopupComponent, {
  //     //     disableClose: true,
  //     //     autoFocus: false,
  //     //     data: dialogData,
  //     //   });
  //     //   isValid = false;
  //     //   dialogRef.afterClosed().subscribe((res) => {
  //     //     if (res) {
  //     //       this.ticketStatus = this.previousTicketStatus;
  //     //       this.cdk.detectChanges();
  //     //     } else {
  //     //       this.ticketStatus = this.previousTicketStatus;
  //     //       this.cdk.detectChanges();
  //     //     }
  //     //   })
  //     // } else {
  //     //   isValid = true;
  //     // }
  //   }
  //   this.cdk.detectChanges();
  //   return isValid;
  // }

  // showAlert(){
  //   let isValid = true;

  //   if (this.missingFieldsClosure?.length > 0) {
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
  //     dialogRef.afterClosed().subscribe((res) => {
  //       if (res) {
  //         this.ticketStatus = this.previousTicketStatus;
  //         this.cdk.detectChanges();
  //       } else {
  //         this.ticketStatus = this.previousTicketStatus;
  //         this.cdk.detectChanges();
  //       }
  //     })
  //   } else {
  //     isValid = true;
  //   }
  // }

  clearAllVariables() {
    if (this.authorDetailsSubscription) {
      this.authorDetailsSubscription.unsubscribe();
    }
    if (this.updateTicketDetailsapi) {
      this.updateTicketDetailsapi.unsubscribe();
    }
    if (this.changeTicketStatusapi) {
      this.changeTicketStatusapi.unsubscribe();
    }
    if (this.GetBrandMentionReadSettingapi) {
      this.GetBrandMentionReadSettingapi.unsubscribe();
    }
    if (this.changeTicketStatusapires) {
      this.changeTicketStatusapires.unsubscribe();
    }
    if (this.changeTicketStatusapiresult) {
      this.changeTicketStatusapiresult.unsubscribe();
    }
    if (this.lockUnlockTicketapi) {
      this.lockUnlockTicketapi.unsubscribe();
    }
    if (this.GetTicketListbyIDapi) {
      this.GetTicketListbyIDapi.unsubscribe();
    }
    if (this.changeTicketPriorityapi) {
      this.changeTicketPriorityapi.unsubscribe();
    }
    if (this.ticketReassignToUserapi) {
      this.ticketReassignToUserapi.unsubscribe();
    }
    if (this.voipTicketReassignToUserapi) {
      this.voipTicketReassignToUserapi.unsubscribe();
    }
    if (this.SaveLocoBuzzCRMDetailapi) {
      this.SaveLocoBuzzCRMDetailapi.unsubscribe();
    }
    if (this.SaveLocoBuzzCRMDetailTicketapi) {
      this.SaveLocoBuzzCRMDetailTicketapi.unsubscribe();
    }
    if (this.GetAuthorDetailsapi) {
      this.GetAuthorDetailsapi.unsubscribe();
    }
    if (this.GetTicketTimelineapi) {
      this.GetTicketTimelineapi.unsubscribe();
    }
    if (this.checkAutoclosureEligibilityapi) {
      this.checkAutoclosureEligibilityapi.unsubscribe();
    }
    if (this.getDispositionDetailsapi) {
      this.getDispositionDetailsapi.unsubscribe();
    }
    if (this.GetAITicketSummaryDataapi) {
      this.GetAITicketSummaryDataapi.unsubscribe();
    }
    if (this.GetUnmaskedValueapi) {
      this.GetUnmaskedValueapi.unsubscribe();
    }
    if (this.getCRMTicketStatusapi) {
      this.getCRMTicketStatusapi.unsubscribe();
    }
    if (this.getAuthorTicketMandatoryDetailsApi) {
      this.getAuthorTicketMandatoryDetailsApi.unsubscribe();
    }
    if (this.effectCurrentPostObjectSignal) {
      this.effectCurrentPostObjectSignal.destroy();
    }
    if (this.effectReplyActionPerformedSignal) {
      this.effectReplyActionPerformedSignal.destroy();
    }
    if (this.effectUpdateTicketCategorySignal) {
      this.effectUpdateTicketCategorySignal.destroy();
    }
    if (this.effectEmitEmailReadStatusSignal) {
      this.effectEmitEmailReadStatusSignal.destroy();
    }
    if (this.effectTicketDispositionListSignal) {
      this.effectTicketDispositionListSignal.destroy();
    }
    if (this.effectBulkActionPerformedSignal) {
      this.effectBulkActionPerformedSignal.destroy();
    }
    if (this.effectSsreActionPerformedSignal) {
      this.effectSsreActionPerformedSignal.destroy();
    }
    if (this.effectTicketEscalationObsSignal) {
      this.effectTicketEscalationObsSignal.destroy();
    }
    if (this.effectReAssignTicketSignal) {
      this.effectReAssignTicketSignal.destroy();
    }
    if (this.effectPostDetailObjectChangedSignal) {
      this.effectPostDetailObjectChangedSignal.destroy();
    }
    if (this.effectOnReassignVoipAgentSignal) {
      this.effectOnReassignVoipAgentSignal.destroy();
    }
    if (this.effectEmailProfileDetailsObsSignal) {
      this.effectEmailProfileDetailsObsSignal.destroy();
    }
    if (this.effectNoteAddedChangeSignal) {
      this.effectNoteAddedChangeSignal.destroy();
    }
    if (this.effectTicketWorkFlowObsSignal) {
      this.effectTicketWorkFlowObsSignal.destroy();
    }
    this.Object = null;
    this.matTabGrop = null;
    this.ticketStatusSelectBox = null;
    this.authorDetails = null;
}

  changeFourthLevelDropdown(state, index, zIndex) {
    state.indexThree = index;

    // Store the selected value in the correct nested structure
    this.customCrmColumns[zIndex].dropDownData.DropDownData[state.index]
      .DropDownData[state.indexOne]
      .DropDownData[state.indexTwo]
      .selected = state.DropDownData[state.index]
        .DropDownData[state.indexOne]
        .DropDownData[state.indexTwo]
        .DropDownData[index].Value;

    this.changeDetectionRef.detectChanges();
  }

  changeFifthLevelDropdown(state, index, zIndex) {
    state.indexFour = index;

    // Store the selected value in the correct nested structure
    this.customCrmColumns[zIndex].dropDownData.DropDownData[state.index]
      .DropDownData[state.indexOne]
      .DropDownData[state.indexTwo]
      .DropDownData[state.indexThree]
      .selected = state.DropDownData[state.index]
        .DropDownData[state.indexOne]
        .DropDownData[state.indexTwo]
        .DropDownData[state.indexThree]
        .DropDownData[index].Value;

    this.changeDetectionRef.detectChanges();
  }

  changeTicketFourthLevelDropdown(state, index, zIndex) {
    state.indexThree = index;
    this.customTicketCrmColumns[zIndex].dropDownData
      .DropDownData[state.index]
      .DropDownData[state.indexOne]
      .DropDownData[state.indexTwo].selected =
      state.DropDownData[state.index]
        .DropDownData[state.indexOne]
        .DropDownData[state.indexTwo]
        .DropDownData[index].Value;
    this.changeDetectionRef.detectChanges();
  }

  changeTicketFifthLevelDropdown(state, index, zIndex) {
    state.indexFour = index;
    this.customTicketCrmColumns[zIndex].dropDownData
      .DropDownData[state.index]
      .DropDownData[state.indexOne]
      .DropDownData[state.indexTwo]
      .DropDownData[state.indexThree].selected =
      state.DropDownData[state.index]
        .DropDownData[state.indexOne]
        .DropDownData[state.indexTwo]
        .DropDownData[state.indexThree]
        .DropDownData[index].Value;
    this.changeDetectionRef.detectChanges();
  }

  generateAgentIQ(): Promise<boolean> {
    this._ticketService.replyInputTextData = '';
    const brandInfo = this._filterService.fetchedBrandData?.find(
      (brand) => +brand.brandID === this.postObj?.brandInfo?.brandID
    );
    return new Promise((resolve, reject) => {
      let obj = {
        action_type: AgentIQAction.DirectClose,
        closingTicketTag: {
          brand_name: this.postObj?.brandInfo?.brandName,
          brand_id: this.postObj?.brandInfo?.brandID,
          author_id: this.postObj?.author.socialId,
          author_name: this.postObj?.author?.name ? this.postObj?.author?.name : '',
          channel_group_id: this.postObj?.channelGroup,
          ticket_id: this.postObj?.ticketID,
          channel_type: this.postObj?.channelType,
          tag_id: this.postObj?.tagID,
          reply_message: this._ticketService.replyInputTextData ? this._ticketService.replyInputTextData : '',
          action_type: 6,
          brand_content_policy: brandInfo?.brand_Content_policy?.length ? brandInfo?.brand_Content_policy : '',
          brand_response_guidelines: brandInfo?.brand_Response_guidlines?.length ? brandInfo?.brand_Response_guidlines : ''
        }
      }
      this._ticketService.generateAgentIQ(obj).subscribe((result) => {
        if (result.success) {
          this.genAiData = result.data;
          this.closureApproved = this.genAiData.result.closure_approved;
          resolve(this.closureApproved);
          this._ticketService.generateClosingTicket.next(this.genAiData);
        } else {
          resolve(false);
          this._ticketService.generateClosingTicket.next(false);
          this.genAiData = [];
        }
        this.cdk.detectChanges();
      }, (err) => {
        resolve(false);
        this._ticketService.generateClosingTicket.next(false);
      });
    })
  }

  checkReturnValidJSON(value) {
    let parsedValue
    try {
      parsedValue = JSON.parse(value)
      if (typeof parsedValue === 'object') {
        parsedValue = [parsedValue]
      } else {
        parsedValue = []
      }
    } catch (e) {
      parsedValue = []
    }
    return parsedValue
  }

  public compareValuesParams = function (option, value): boolean {
    return value?.id == option?.id;
  }

  public expandTicketSummary(){
    this.expandTicketSummaryEmit.emit(true);
  }

  public changeTicketSummaryType(event){
    this.changeTicketSummaryTypeEmit.emit(event);
  }

  public clearnote(){
    this.clearNoteEmit.emit(true);
  }

  public noteTextChange(nodeElement: any, holder: any) {
    this.noteTextChangeEmit.emit({ nodeElement, holder });
  }

  public removeSelectedNoteMedia(ugcMention: UgcMention): void {
    this.removeSelectedNoteMediaEmit.emit(ugcMention);
  }

  public openMediaDialog(){
    this.openMediaDialogEmit.emit(true);
  }

  public closeMenu() {
    this.trigger.closeMenu()
  }

  public addNote(note){
    this.addNoteEmit.emit(note);
  }
  public clearInputs(){
    this.selectedNoteMedia = [];
    this._replyService.selectedNoteMedia.next({ media: [] });
    this.mediaGalleryService.selectedNoteMedia = [];
    this.mediaSelectedAsync.next(this.selectedNoteMedia);
    this._ticketService.addNoteEmitFromOpenDetail.next(this.selectedNoteMedia);
    this._replyService.selectNoteMediaVal(this.selectedNoteMedia)
  }
  
  public syncSFDCData(){
    this.syncSFDCDataEmit.next(true);
  }

  editTicketAttributes() {
    this.editAttributesEnabled = !this.editAttributesEnabled;
    if(this.editAttributesEnabled == true) {
      this.TicketFieldForm.enable();
    }
    else {
      this.TicketFieldForm.disable();
    }
  }

  getRequestPopup(){
    this.getRequestPopupEmit.emit(true);
  }

  CaseLeadFormOpenView(type: string){
    this.CaseLeadFormOpenViewEmit.emit(type);

  }
  CaseLeadFormOpen(type: string) {
    this.CaseLeadFormOpenEmit.emit(type);
  }

  editPersonalDetails() {
    this.personalDetailsEdit = !this.personalDetailsEdit;
    if (this.personalDetailsEdit == true) {
      this.personalDetailForm.enable();
    }
    else {
      this.personalDetailForm.disable();
    }
  }
}

