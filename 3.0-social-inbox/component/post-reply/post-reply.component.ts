import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
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
  Optional,
  Output,
  QueryList,
  Renderer2,
  signal,
  untracked,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormControl,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import {
  MatBottomSheet,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { Emoji } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { locobuzzAnimations } from '@locobuzz/animations';
import { AccountSettingService } from 'app/accounts/services/account-setting.service';
import { AgentSignatureService } from 'app/accounts/services/agent-signature.service';
import { excludeEmojis } from 'app/app-data/emoji';
import { smartSuggestion } from 'app/app-data/smartSuggestion';
import {
  ActionStatusEnum,
  ClientStatusEnum,
} from 'app/core/enums/ActionStatus';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { AutoReplyStatus } from 'app/core/enums/AutoReplyStatus';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { ImageEditorEnum } from 'app/core/enums/ImageEditor';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { MakerCheckerEnum } from 'app/core/enums/MakerCheckerEnum';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { PerformedAction } from 'app/core/enums/PerformedAction';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { SsreIntent } from 'app/core/enums/SsreIntentEnum';
import { SSREMode, WorkflowLogStatus } from 'app/core/enums/SsreLogStatusEnum';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseSocialAccountConfiguration } from 'app/core/models/accountconfigurations/BaseSocialAccountConfiguration';
import { SignatureSymbolDetails } from 'app/core/models/accounts/getSignatureSymbol';
import {
  ReplyLinkCheckbox,
  Replylinks,
  ReplyOptions,
  TextAreaCount,
  TicketReplyDto,
  TicketsCommunicationLog,
} from 'app/core/models/dbmodel/TicketReplyDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { AttachmentFile } from 'app/core/models/viewmodel/AttachmentFile';
import { BrandInfo } from 'app/core/models/viewmodel/BrandInfo';
import {
  ForwardEmailRequestParameters,
  SignatureParam,
} from 'app/core/models/viewmodel/ForwardEmailRequestParameters';
import {
  GenericFilter,
  PostsType,
} from 'app/core/models/viewmodel/GenericFilter';
import { GroupEmailList } from 'app/core/models/viewmodel/GroupEmailList';
import { LocoBuzzAgent } from 'app/core/models/viewmodel/LocoBuzzAgent';
import { LocobuzzIntentDetectedResult } from 'app/core/models/viewmodel/LocobuzzIntentDetectResult';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { MentionReadCompulsory } from 'app/core/models/viewmodel/MentionReadCompulsory';
import {
  BaseReply,
  PerformActionParameters,
} from 'app/core/models/viewmodel/PerformActionParameters';
import { Reply } from 'app/core/models/viewmodel/Reply';
import {
  EmailReadReceipt,
  ReplyInputParams,
  ReplyTimeExpire,
} from 'app/core/models/viewmodel/ReplyInputParams';
import { TaggedUser } from 'app/core/models/viewmodel/TaggedUser';
import { NoteMedia, UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { LoaderService } from 'app/shared/services/loader.service';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { environment } from 'environments/environment.prod';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import moment from 'moment';
import { element } from 'protractor';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { BrandList } from '../../../shared/components/filter/filter-models/brandlist.model';
import { CannedResponseComponent } from '../canned-response/canned-response.component';
import { SmartSuggestionComponent } from '../smart-suggestion/smart-suggestion.component';
import { TicketDispositionComponent, ticketDispositionData, ticketDispositionList } from '../ticket-disposition/ticket-disposition.component';
import { MediaGalleryComponent } from './../media-gallery/media-gallery.component';
import { PostReplyPopupComponent } from '../post-reply-popup/post-reply-popup.component';
import { MatMenuTrigger } from '@angular/material/menu';

import { AIFeatureStyle } from 'app/core/interfaces/AIFeatureInterface';
import { AiFeatureService } from 'app/accounts/services/ai-feature.service';
import { WhatsappTemplatesComponent } from 'app/accounts/component/whatsapp-templates/whatsapp-templates.component';
import { SocialScheduleService } from 'app/social-schedule/social-schedule.service';
import { PostReplybotComponent } from '../post/post-replybot/post-replybot.component';
import { SidebarService } from 'app/core/services/sidebar.service';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { ReplyTagUserSettingService } from 'app/accounts/services/reply-tag-user-setting-service';
import { AiFeedbackPageComponent } from 'app/accounts/component/ai-feedback-page/ai-feedback-page.component';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AssignToList } from 'app/shared/components/filter/filter-models/assign-to.model';
import { PostAssignToService } from 'app/social-inbox/services/post-assignto.service';
import { FeedbackFromPreviewComponent } from 'app/accounts/component/feedback-from-preview/feedback-from-preview.component';
import { DynamicFormService } from 'app/accounts/services/dynamic-form.service';
import { CdkDragDrop} from '@angular/cdk/drag-drop';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { CustomCrmColumns } from 'app/core/interfaces/AuthorDetails';
import { BaseSocialAuthor } from 'app/core/models/authors/locobuzz/BaseSocialAuthor';
import { PostActionEnum } from 'app/core/enums/postActionEnum';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { VideoDialogComponent } from '../video-dialog/video-dialog.component';
import { CommonService } from 'app/core/services/common.service';
import { AgentIQAction } from 'app/core/enums/AgentIQActionEnum';
import { TranslateService } from '@ngx-translate/core';

export interface brandData {
  brandID: number;
  signature: string;
};

@Component({
    selector: 'app-post-reply',
    templateUrl: './post-reply.component.html',
    styleUrls: ['./post-reply.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class PostReplyComponent implements OnInit, OnDestroy,AfterViewInit {
  @Input() postMessage: any;
  @Input() replyInputParams?: ReplyInputParams;
  @Input() autoRenderAi?: boolean;
  @Input() postDetailTab: LocobuzzTab;
  @Input() autoCloseWindow: boolean = false;
  @Input() ticketHistoryData: AllBrandsTicketsDTO;
  @Output() replyEvent = new EventEmitter<boolean>();
  @Output() postReplyType = new EventEmitter<any>();
  @Output() checkEmailReadReceipt = new EventEmitter<any>();
  @Output() cancelAssign = new EventEmitter<boolean>();
  @Input() userPostView: boolean = false;
  @ViewChild(MatMenuTrigger) trigger: MatMenuTrigger;
  @ViewChild('clipboardArea') clipboardArea: ElementRef;
   @ViewChild('attachmentContainer') attachmentContainer: ElementRef
    @ViewChildren('attachmentRef') attachmentRef: ElementRef[];

  pageTypeEnum = PostsType;
  replyForm: UntypedFormGroup;
  makercheckerticketId: number;
  SsreMode: SSREMode;
  SsreIntent: SsreIntent;
  simulationCheck = false;
  // Ssre Simulation check
  ssreSimulationRight = false;
  ckeditorLoading = false;
  ssreSimulationWrong = false;
  sendEmailSubject = '';
  inBottomSheet: boolean = false;
  bulkmessage = '';
  selectedPostBasedOnBrandName: BrandList;
  ckeditorRef: any;
  ActionStatusEnum = ActionStatusEnum;
  feedbackText:string = '';
  isAIAutoResponse:boolean = false;
  mmtLinkLoader:boolean = false;
  previousMMTLink:string = '';
  brandSignatureData: brandData[] = [];

  @ViewChild('newTextArea')
  private animateThis: ElementRef;
  @ViewChildren('txtArea') textAreas: QueryList<ElementRef>;
  @ViewChildren('textAreaDiv') textAreaDiv: QueryList<ElementRef>;
  @ViewChild('txtArea') inputElement: ElementRef;
  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;
  @ViewChild('emailFieldCc') emailFieldsCc: ElementRef;
  @ViewChild('emailFieldBcc') emailFieldsBcc: ElementRef;
  @ViewChild('emaigroupInput') emailgroupInputField: ElementRef;
  @ViewChild('postReplyScroll') postReplyScroll: ElementRef;
  // @ViewChild(MatMenuTrigger) promptMenuTrigger: MatMenuTrigger;
  @ViewChild('promptMenu', { read: MatMenuTrigger, static: false }) promptMenuTrigger: MatMenuTrigger;
  @ViewChildren('emailToChipElement') emailToChipElement: QueryList<ElementRef>;
  @ViewChild('emailToChipContainer') emailToChipContainer: ElementRef<HTMLDivElement>;
  @ViewChild('emailToInputRef') emailToInputRef: ElementRef;
  @Input() pageType: PostsType;
  mediaTypeEnum = MediaEnum;
  isAutoClosuerEnable: boolean;
  isEligibleForAutoclosure = false;
  autoclosureSettingChecked = false;
  escalateMsg = false;
  TicketList: BaseMention[] = [];
  chatBotView: boolean = false;
  userListLoading: boolean = false;
  showSuggestionButton: boolean = false;
  textAreaPos: number;
  isSendFeedBackClosedCheckedDisabledFlag: boolean = false;
  isSendFeedBackClosedCheckedFlag: boolean = false;
  channelGroup = ChannelGroup;
  channelType = ChannelType;
  autoSugeestedResponse: string = '';
  localAiApiRequestCannedResponse: string = '';
  intentId: number = 0;
  cannedResponseNotSelected: boolean = true;
  autoSuggestionLoader: boolean;
  aiSuggestionLoader: boolean;
  csdUserId: number = 0;
  handlesLoader: boolean;
  replyGroupEmailcc: boolean = false;
  replyGroupEmailBcc: boolean = false;
  showPrevoiusMail = true;
  base64ImageArray: string[] = [];
  uploadedServerLink: string[] = [];
  ckEditorLoader: boolean;
  dispositionDetails: any;
  formJsonLink: string = '';
  allSignatureSymbol: SignatureSymbolDetails[] = [];
  tempToEmail: string[];
  settingOption = '';
  messageTone = '';
  messageManner = '';
  promptText = ''
  rephraseText =''
  rephraseLoader:boolean=false;
  rephraseLoaderForTextarea: boolean = false;
  isOpenRephrasePopup: boolean = false;
  selectedLanguageTo= ''
  undoArr = []
  redoArr = []
  promptIconSrc = "assets/images/media/replyRephrase__prompt.svg"
  showAISmartSuggestion = false;
  showAiFeature = false;
  loadAiFeature = false;
  showAICreditExpired = false;
  showAICreditExpiredAlert = false;
  aiRephraseIcon='';
  AIFeatureStyleObj:AIFeatureStyle ={
    rephraseIcon:'assets/images/media/rephrase-inactive.svg',
    suggestIcon:'',
    suggestionBorder: '',
    rephraseTootip: '',
    suggestTootip:''
  };
  isRephraseToolbar = false;
  isAICaution = false;
  CautionFlagForLogs :number = 0;
  cautionText =''
  aiFeatureCategory=[
    {
      categoryId: 1237,
      categoryName:"TataDigitalDb"
    },
    {
      categoryId: 434,
      categoryName: "LocobuzzNewDB"
    },
    {
      categoryId: 1287,
      categoryName: "LocobuzzSupportDB"
    },
    {
      categoryId: 1452,
      categoryName: "LocobuzzPRDB"
    },
    {
      categoryId: 1475,
      categoryName: "LocobuzzDemoDB"
    },
    {
      categoryId: 1523,
      categoryName: "LBTestingDB - Testing DB"
    },
    {
      categoryId: 1533,
      categoryName: "LBTestingNewDB - Testing DB"
    }
]
  rephraseOptions:any= {
    isGlobal: false,
    isAISuggestion: false,
    isAIAutopPopulate: true,
    isRephrase: false,
    isTranslate: false,
    isShowPrompt: false,
    rephraseActions: ''
  };

  feedbackFormValue: number=0;
  // surveyFormSetting:any
  
  srCreated: boolean;
  isNPSAutomationOn: any;
  sendFeedBack: boolean=false;
  assignToPopup: boolean=false;
  focusIndex: any;
  twitterHandleList: any[];
  selectedTicketView: any;
  replyTypeName: any;
  autoUpdateWindow: any;
  IDName: string;
  srCreatedMessage: string = '';
  aiMessageFeedback: number = 2;

  assignTo: Observable<AssignToList[]>;
  loadingUserList = false;
  assignToName: string;
  selectedAssignTo: number;
  @Input() showLockStrip?= false;
  // public selectedSurveyForm:any;
  selectedNoteMedia:NoteMedia[]= null;
  disableSaveButton: boolean = false;
  sfdcTicketViewUI = false;
  crmTicketStatus:boolean;
  disableSendButton:boolean = false;

  emailForward: boolean = false;
  newThreadEmail:boolean = false;
  allGroupEmailList = [];
  tempAllGroupEmailList:string[]=[];
  isAITicketTagEnabled: boolean = false;
  selectedChips: { [key: string]: string[] } = {};
  ctrlKeyPressed: boolean = false;
  currentType: string = '';
  draggedEmail: string[] = [];
  outsideEmailFlag:boolean =false;
  outsideEmails:String[]=[]

  caption:string;
 @Input() defaultAgentID
  inputRecvd: { [key: string]: boolean } = {
    'groupto': false,
    'groupcc': false,
    'groupbcc': false,
    'rTo': false,
    'rCC': false,
    'rBCC': false,
    'to': false,
    'cc': false,
    'bcc': false,
    'replyTo': false,
    'replyCC': false,
    'replyBCC': false,
    'EFreplyTo': false,
    'EFreplyCC': false,
    'EFreplyBCC': false
  };
  dispatchEventTimeout: any;
  nativeElementTimeout:any;
  postDetailServiceTimeout: any;
  mediaUrlTimeout: any;
  mediaPathTimeout: any;
  textTimeout: any;
  textAreaTimeout: any;
  replyTimeout: any;
  baseTimeout: any;
  mediaSelectedTimeout: any;
  emailSignTimeout: any;
  autoTimeout: any;
  ParamsTimeout: any;
  inputTimeout: any;
  input2Timeout: any;
  ElementTimeout: any;


  GetNPSAutomationSettingApi: any;
  getFoulKeywordsApi: any;
  getIrctcTagDetailsApi: any;
  getDispositionDetailsApi: any;
  IsPremiumTwitterAccountApi: any;
  getEmailHtmlDataApi: any;
  getLastMentionTimeApi: any;
  GetBrandMentionReadSettingApi: any;
  GetCrmCsdUserIdApi: any;
  GetTagAlerEmailsApi: any;
  getTicketHtmlForEmailApi: any;
  replyAutoSuggestApi: any;
  GetCrmCsdUserId2Api: any;
  GetBrandAccountInformationApi:any;
  GetBrandAccountInformation2Api: any;
  GetUsersWithTicketCountApi: any;
  GetMailGroupApi: any;
  getAutoQueueingConfigApi: any;
  GetMakerCheckerDataApi: any;
  GetCrmCsdUserId3Api: any;
  logForFoulKeywordApi: any;
  Reply1Api: any;
  lockUnlockTicketApi: any;
  getMMTLinkApi: any;
  getAutoCannedResponseStatusApi: any;
  logAutoMatedCannedReplyApi: any;
  checkAutoclosureEligibilityApi: any;
  forwardReplyApi: any;
  Reply2Api: any;
  loadingUsersApi: any;
  BulkTicketActionApi: any;
  getMentionCountApi: any;
  BulkTicketAction2Api: any;
  GetEmailOutgoingSettingApi: any;
  UploadUserProfilePicOnS3Api: any;
  GetSignatureSymbolListApi: any;
  getAISmartSuggestionsApi: any;
  translateReplyApi: any;
  rephraseDataApi: any;
  GetTaggingAccountsApi: any;
  GetMentionSettingsApi: any;
  trackAIResponseApi: any;
  getCRMTicketStatusApi: any;
  private clearSignal = signal<boolean>(true);
  getAuthorTicketMandatoryDetailsApi: any;
  authorDetails: any;
  missingFieldsClosure;
  missingFieldsEscalation;
  emailToChipPosition: number =2;
  remainingEmailTooltip: string;
  showMoreAttachment: boolean;
  maximumAttachmentLength: number;
  whiteList :string[] = [];
  blackListedChips: { [key: string]: Set<string> } = {
    'to': new Set(),
    'cc': new Set(),
    'bcc': new Set()
  };
  blackListDisabled: boolean = false;
  blackListedGrpChips: { [key: string]: Set<string> } = {
    'groupto': new Set(),
    'groupcc': new Set(),
    'groupbcc': new Set()
  };
  groupBlackListDisabled: boolean = false;
  showBlackList: boolean = false;
  isAIInsightsEnabled: boolean = false;
  genAiData: any;
  aiTicketIntelligenceModelData: any;
  selectedUpperTags = { start: 'Complaint', end: 'Appreciation' };
  selectedEmotions = { start: 4, end: 8, startColor: '', endColor: '', startLabel: '', endLabel: '' };
  selectedSentiment = { start: 0, end: 2 };
  selectedSatisfactionRating = 0;
  oldSelectedSatisfactionRating = 0;
  selectedLead = 0;
  ticketTagging = [];
  ticketData: boolean = false;
  teamSelectedData: any[] = [];
  isSarcastic: number = 0;
  issueResolved: number = 0;
  agentCommitment: number = 0;
  inappropriateClosure: number = 0;
  hasChurnIntent: number = 0;
  hasUpsellOpportunity: number = 0;
  agentEmpathyScore: number = 0;
  updatedSatisfactionRating: number = 0;
  isSuggested: boolean = false;
  suggestedReply: string = '';
  foulWords: string[] = [];
  isIqFalse: boolean = false;
  defaultLayout: boolean = false;
  caseNoSubscription:any
  PopTypeReasons: any;
  responseGenieUsed: boolean = false;
  responseGenieDiscarded: boolean = false;
  responseGenieAccepted: boolean = false;
  responseGenieReply: string = '';
  userSelectedLanguage = "en";
  layout = "ltr";
  constructor(
    private agentSignatureService: AgentSignatureService,
    private _ngZone: NgZone,
    private _bottomSheet: MatBottomSheet,
    private dialog: MatDialog,
    private _postDetailService: PostDetailService,
    private accountService: AccountService,
    private _filterService: FilterService,
    private fb: UntypedFormBuilder,
    private replyService: ReplyService,
    private _ticketService: TicketsService,
    private _mapLocobuzzEntity: MaplocobuzzentitiesService,
    private elementRef: ElementRef,
    private mediaGalleryService: MediagalleryService,
    private _snackBar: MatSnackBar,
    public cdr: ChangeDetectorRef,
    private _ticketSignalrService: TicketsignalrService,
    private renderer: Renderer2,
    private _navigationService: NavigationService,
    private _loaderService: LoaderService,
    private _chatBotService: ChatBotService,
    private _mapLocobuzz: MaplocobuzzentitiesService,
    private _voip: VoiceCallService,
    private accountSettingService: AccountSettingService,
    private _aiFeatureService: AiFeatureService,
    private socialService:SocialScheduleService,
    private _sidebar:SidebarService,
    private cdkRef:ChangeDetectorRef,
    private overlayContainer: OverlayContainer,
    private _replyTagUserSettingService: ReplyTagUserSettingService,
    private _postAssignToService: PostAssignToService,
    private _dynamicFormSerive: DynamicFormService,
    private _userDetailService: UserDetailService,
    private commonService: CommonService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private doucument: Document,
    @Optional()
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: {
      inBottomSheet?: boolean;
      makerchticketId?: number;
      SSREMode?: SSREMode;
      SsreIntent?: SsreIntent;
      onlyEscalation?: boolean;
      bulkmessage?: string;
      pageType?: PostsType;
    } // public dialogRef: MatDialogRef<PostReplyComponent>
  ) {
    this.replyForm = this.fb.group({
      replyType: [
        { value: '', disabled: this.ssreSimulationRight },
        [Validators.required],
      ],
      replyHandler: [''],
      // TeamLeader: [''],
      // replyText: [{ value: '', disabled: this.ssreSimulationRight }, [Validators.required]],
      replyEscalateNote: [{ value: '', disabled: this.ssreSimulationRight }],
      escalateUsers: [
        { value: '', disabled: this.ssreSimulationRight },
        [Validators.required],
      ],
      ckeditorText: [{ value: '', disabled: this.ssreSimulationRight }],
      assignToName: new UntypedFormControl(
        this._postDetailService?.postObj?.ticketInfo?.assignedTo
      ),
      assignToid: new UntypedFormControl(this._postDetailService?.postObj?.ticketInfo?.assignedTo == 0 ? this._postDetailService?.postObj?.ticketInfo?.assignedToTeam : this._postDetailService?.postObj?.ticketInfo?.assignedTo),
    });

    this.clearInputs();
    this.ticketReplyDTO = {};
    this.ticketReplyDTO.handleNames = [];
    this.ticketReplyDTO.taggedUsers = [];
    this.ticketReplyDTO.replyOptions = [];
    this.ticketReplyDTO.groupEmailList = [];
    this.ticketReplyDTO.agentUsersList = [];
    this.customGroupEmailList = [];
    this.maxLengthInput = 0;
    this.replyLinkCheckbox = [];
    // console.log('ReplyMessage');
    this.baseMentionObj = this._postDetailService?.postObj;
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    this.currentUser = JSON.parse(localStorage.getItem('user'));

    let onLoadReplyInputParams = true;
     effect(() => {
       const value = this.clearSignal() ? this.replyService.checkReplyInputParamsSignal() : untracked(() => this.replyService.checkReplyInputParamsSignal());
       if (!onLoadReplyInputParams && value && this.clearSignal()){
         this.checkReplyInputParamsSignalChanges(value);
       } else {
         onLoadReplyInputParams = false;
       }
      }, { allowSignalWrites: true });

    let onLoadPopupToPostReplySetDataObs = true;
    effect(() => {
      const value = this.clearSignal() ? this._ticketService.emailPopupToPostReplySetDataObsSignal() : untracked(() => this._ticketService.emailPopupToPostReplySetDataObsSignal());
      if (!onLoadPopupToPostReplySetDataObs && value && this.clearSignal()) {
        this.emailPopupToPostReplySetDataObsSignalChanges(value);
      } else {
        onLoadPopupToPostReplySetDataObs = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadTicketHisotry = true;
    effect(() => {
      const value = this.clearSignal() ? this._ticketService.loadedTicketHisotrySignal() : untracked(() => this._ticketService.loadedTicketHisotrySignal());
      if (!onLoadTicketHisotry && value && this.clearSignal()) {
        this.loadedTicketHisotrySignalChanges(value);
      } else {
        onLoadTicketHisotry = false;
      }
    }, { allowSignalWrites: true });

    let onLoadCannedResponse = true;
    effect(() => {
      const value = this.clearSignal() ? this.replyService.selectedCannedResponseSignal() : untracked(() => this.replyService.selectedCannedResponseSignal());
      if (!onLoadCannedResponse && value && this.clearSignal()) {
        this.selectedCannedResponseSignalChanges(value)
      } else {
        onLoadCannedResponse = false;
      }
    }, { allowSignalWrites: true });

    let onLoadScrollEventSocialBox = true;

    effect(() => {
      const value = this.clearSignal() ? this._ticketService.scrollEventSocialBoxSignal() : untracked(() => this._ticketService.scrollEventSocialBoxSignal());
      if (!onLoadScrollEventSocialBox && value && this.clearSignal()) {
        this.scrollEventSocialBoxSignalChanges(value)
      } else {
        onLoadScrollEventSocialBox = false;
      }
    }, { allowSignalWrites: true });

    let sfdcTicketView = localStorage.getItem('sfdcTicketView');
    if (sfdcTicketView) {
      this.sfdcTicketViewUI = true;
    }
    if (data && data.inBottomSheet) {
      this.inBottomSheet = data.inBottomSheet;
      this.bulkmessage = data.bulkmessage;
      this.pageType = data.pageType;
      this.assignToPopup=true
    }
    if (data && data.makerchticketId) {
      this.makercheckerticketId = data.makerchticketId;
    }
    if (data && data.SSREMode && data.SsreIntent) {
      this.SsreMode = data.SSREMode;
      this.SsreIntent = data.SsreIntent;
      this.simulationCheck = true;
      if (data.SsreIntent === SsreIntent.Right) {
        this.ssreSimulationRight = true;
      }
    }

    if (data && data.onlyEscalation) {
      // this.showReplySection = false;
      this.IsreplyAndEscalate = true;
      this.showEscalateview = true;
      this.showEmailView = false;
      this.onlyEscalation = true;
      this.callEscalationListAPI({
        Brand: this._postDetailService?.postObj.brandInfo,
      });
    }

    if (this.IsreplyAndEscalate && this._postDetailService.isBulk) {
      this.escalateMsg = true;
    }
    this.checkReplyInputParams();
    if (this._postDetailService.pagetype === PostsType.chatbot) {
      this.chatBotView = true;
      if (this.showEscalateview) {
        this.escalateMsg = true;
      } else {
        this.escalateMsg = false;
      }
    } else {
      this.chatBotView = false;
    }

  }
  ngAfterViewInit(): void {
  }
  voipEscalateUser = '';
  voipEscalateMsg = '';
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = false;
  currentUser: AuthUser;
  ticketReplyDTO: TicketReplyDto;
  maxLengthInput: number;
  brandList: BrandList[];
  IsreplyAndEscalate = false;
  IsreplyAndAssign = false;
  showEscalateview = false;
  showReplyAssignView = false;
  textResponse: string = '';
  selectedReplyType: number;
  sendtoGroupsClicked = false;
  showGroupsView = false;
  showReplySection = true;
  isEmailChannel = false;
  sendEmailChannelClicked = false;
  showEmailView = false;
  onlyEscalation = false;
  onlySendMail = false;
  currentReplyLink: number;
  taggedUsersAsync = new Subject<TaggedUser[]>();
  taggedUsersAsync$ = this.taggedUsersAsync.asObservable();
  subs = new SubSink();

  escalateUsers: number;
  escalationLabel = this.translate.instant('Escalate-To');
  escalationPlaceholder = this.translate.instant('Write-escalation-note-here');
  splittedTweets = new Array();
  taggedUsers: TaggedUser[] = [];
  selectedTagUsers: TaggedUser[];
  unSelectedTagUsers:TaggedUser[];
  replyLinkCheckbox: ReplyLinkCheckbox[];
  currentBrand: BrandList;
  baseMentionObj: BaseMention;
  customAgentList: LocoBuzzAgent[];

  customAgentListAsync = new Subject<LocoBuzzAgent[]>();
  customAgentListAsync$ = this.customAgentListAsync.asObservable();

  modAgentList?: LocoBuzzAgent[] = [];
  locobuzzIntentDetectedResult: LocobuzzIntentDetectedResult[] = [];

  mediaSelectedAsync = new Subject<UgcMention[]>();
  mediaSelectedAsync$ = this.mediaSelectedAsync.asObservable();

  cannedResponse = new Subject<string>();
  cannedResponseAsync$ = this.cannedResponse.asObservable();

  smartSuggestion = new BehaviorSubject<string>('');
  smartSuggestionAsync$ = this.smartSuggestion.asObservable();

  groupEmailList = new Subject<GroupEmailList[]>();
  groupEmailListAsync$ = this.groupEmailList.asObservable();

  customGroupEmailList: GroupEmailList[];
  emailGroupList: GroupEmailList[];
  emailGroupSuggestList: GroupEmailList[];
  selectedGroupEmailList: GroupEmailList[] = [];

  loaderTypeEnum = loaderTypeEnum;
  selectedMedia: UgcMention[] = [];
  objBrandSocialAcount: BaseSocialAccountConfiguration[];
  objBrandFBInstaAcount: BaseSocialAccountConfiguration[];
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  emails: { id: string }[] = [{ id: 'john.doe@example.com' }];
  // demo tags for pill
  groupToEmails: string[] = [];
  groupCCEmails: string[] = [];
  groupBCCEmails: string[] = [];

  emailToEmail: string[] = [];
  emailCCEmails: string[] = [];
  emailBCCEmails: string[] = [];

  groupIDs: string[] = [];
  sendEmailcc: boolean = false;
  sendEmailBcc: boolean = false;
  replyEmailcc: boolean = false;
  replyEmailBcc: boolean = false;
  replyTextInitialValue: string = '';
  actionProcessing: boolean = false;
  emailPlaceHolder: string = this.translate.instant('New-Group');
  emailReplyText = '';
  storedReceivedText = '';
  textAreaCount: TextAreaCount[] = [];
  toDos: string[] = ['', ''];
  inputTextArea = {};
  // Reply Modified Values
  IsReplyModified = false;
  eligibleForAutoclosure = false;
  isReplyScheduled = false;
  emojiSet: string = 'facebook';
  public Editor = ClassicEditor;
  foulKeywordArr: { emailID: string; id: string; name: string }[];
  FoulKeywordData = { ContainFoulKeywords: [], replyText: '', Status: '' };
  allowFoul: boolean = false;
  specificTwitterReply = true;
  showMediaButton = false;
  emailSignatureParams: SignatureParam = {};
  editorConfig = {
    format_tags: 'p;h1;h2;h3;h4;h5;h6;pre',
    toolbar: [
      // ['Table'],
      // ['Format'],
      ['Font'],
      // ['RemoveFormat'],
      ['Bold'],
      ['Italic'],
      ['Underline'],
      ['Link'],
      ['BulletedList'],
      ['NumberedList'],
      // ['Indent'],
      // ['Outdent'],
      ['BlockQuote'],
      ['Undo'],
      ['Redo'],
      ['TextColor'],
      ['BGColor'],
      ['JustifyLeft'],
      ['JustifyCenter'],
      ['JustifyRight'],
      ['JustifyBlock'],
    ],
    allowedContent: true,
    emailCCEmails: true,
    extraPlugins: 'button,panelbutton,panel,floatpanel,colorbutton,colordialog,menu,font,justify, clipboard, pastefromword,autogrow',
    removeButtons: 'Subscript,Superscript',
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'en',
    autoParagraph: false,
    font_names: 'Arial/Arial, Helvetica, sans-serif;' +
      'Courier New/Courier New, Courier, monospace;' +
      'Georgia/Georgia, serif;' +
      'Times New Roman/Times New Roman, Times, serif;' +
      'Verdana/Verdana, Geneva, sans-serif;' +
      'Tahoma/Tahoma, Geneva, sans-serif;' +
      'Trebuchet MS/Trebuchet MS, Helvetica, sans-serif;' +
      'Comic Sans MS/Comic Sans MS, cursive, sans-serif;' +
      'Impact/Impact, Charcoal, sans-serif;' +
      'Lucida Sans Unicode/Lucida Sans Unicode, Lucida Grande, sans-serif;' +
      'Palatino Linotype/Palatino Linotype, Book Antiqua, Palatino, serif;' +
      'Segoe UI/Segoe UI, Tahoma, Geneva, sans-serif;' +
      'Roboto/Roboto, sans-serif;' +
      'Open Sans/Open Sans, sans-serif;' +
      'Lora/Lora, serif;' +
      'Montserrat/Montserrat, sans-serif;' +
      'Poppins/Poppins, sans-serif;' +
      'Noto Sans/Noto Sans, sans-serif;' +
      'Source Sans Pro/Source Sans Pro, sans-serif;' +
      'Droid Sans/Droid Sans, sans-serif;' +
      'Raleway/Raleway, sans-serif;',
    fontSize_sizes: '8/8px;10/10px;12/12px;14/14px;16/16px;18/18px;' +
      '20/20px;22/22px;24/24px;28/28px;32/32px;' +
      '36/36px;40/40px;48/48px;60/60px;72/72px;', 
    toolbarLocation:'bottom',
    autoGrow_minHeight:'200',
    autoGrow_maxHeight:'300',
    autoGrow_bottomSpace: 50,
    enterMode: 2, 
  };

  twitterHandleSearch = new Subject<any>();
  emailOutlook = false;
  twitterAccountPremium:boolean = false;
  premiumTwitterCharacter:number = 25000;
  nonPremiumTwitterCharecter:number = 280;
  addedSignatureForUser:any = null;
  isUserNameAddedOnce:boolean = false;


  loadEmojiSheet: Emoji['backgroundImageFn'] = (set, sheetSize) => {
    return `assets/images/emoji-sheets/${set}-emoji-sheet.png`;
  };

  filteredEmojis = (emoji) => {
    const emojiIndex = excludeEmojis.indexOf(emoji);
    if (emojiIndex > 0) {
      return false;
    } else {
      return true;
    }
  };
  showEmailFriendlyView:boolean = false
  ticketDispositionList: ticketDispositionList[] = [];
  ticketDispositionDetails: ticketDispositionData;
  @Output() postActionTypeEvent = new EventEmitter<any>();
  showEmailWarning:boolean = true
       @Input() showEmailPopup:boolean = true;
       selectedAttachmentList:any[]=[]
  remainingAttachmentCount:number
  isBulkPostReply: boolean = false;
  bulkMentionText:any = {};
  agentIQResponseGenieEditMode:boolean = false;
  ngOnInit(): void {
    this.responseGenieReply = '';
    this.responseGenieDiscarded = false;
    this.responseGenieUsed = false;
    this.responseGenieAccepted = false;
    this.isBulkPostReply = this._postDetailService.isBulk || false;
    this.teamSelectedData = [];
    this.setMaxLengthInput();
    let textareaObj = new TextAreaCount();
    textareaObj.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
    this.textAreaCount.push(textareaObj);
    // console.log(this.postMessage);

    // if (
    //   this.aiFeatureCategory.some(
    //     (obj) => obj.categoryId === this.currentUser.data.user.categoryId && obj.categoryName === this.currentUser.data.user.categoryName
    //   )) {
    //   this.showAiFeature = true;
    // }

    this.showAiFeature = true;

    if (
      this.baseMentionObj.channelGroup === ChannelGroup.Email &&
      !this.baseMentionObj.allMentionInThisTicketIsRead &&
      !this.onlyEscalation
    ) {
      this.checkEmailReadOption();
    }

    if (
      (this._postDetailService?.postObj.channelGroup === ChannelGroup.Twitter ||
        this._postDetailService?.postObj.channelGroup ===
          ChannelGroup.Facebook
               || this._postDetailService?.postObj?.channelGroup === ChannelGroup.Email ||
        this._postDetailService?.postObj?.channelGroup === ChannelGroup.WhatsApp ||
        (this._postDetailService?.postObj?.channelGroup === ChannelGroup.Instagram) ||
        this._postDetailService?.postObj?.channelGroup === ChannelGroup.WebsiteChatBot) &&
      !this.onlySendMail
    ) {
      const source = this._mapLocobuzz.mapMention(
        this._postDetailService?.postObj
      );
      // this._dynamicFormSerive.GetSurveyFeedbackSettings(this.baseMentionObj.brandInfo.brandID).subscribe(
      //   (response) => {
      //     if (response.success) {
      //       this.surveyFormSetting = response.data;
      //     }
      //   },
      //   (err) => {
      //   }
      // );
      this.GetNPSAutomationSettingApi = this._ticketService.GetNPSAutomationSetting(source).subscribe(
        (response) => {
          if (response.success) {
            this.feedbackFormValue=response.data.feedbackForm;
            this.isNPSAutomationOn = response.data.isNPSAutomationOn
            this.buildCustomInputBySource(
              this._postDetailService?.postObj,
              response.data.isNPSAutomationOn,
              response.data.feedbackForm
            );
          } else {
            this.buildCustomInputBySource(
              this._postDetailService?.postObj,
              false,
              0
            );
          }
        },
        (err) => {
          this.buildCustomInputBySource(
            this._postDetailService?.postObj,
            false,
            0
          );
        }
      );
     
    } else {
      this.buildCustomInputBySource(this._postDetailService?.postObj, false, 0);
    }
    if (!this.onlySendMail) {
      this.GetBrandAccountInformation(this._postDetailService?.postObj);
    }
    if(this.emailForward){
      this.GetBrandAccountInformationForForwardEmail(this._postDetailService?.postObj);
    }
    if (this.baseMentionObj.channelGroup === ChannelGroup.Email) {
      this.showReplySection = false;
      this.isEmailChannel = true;
      this.showEmailView = true;
      if (this.baseMentionObj.fromMail) {
        if (!this.baseMentionObj.fromMail.includes('noreply') && !this.baseMentionObj.fromMail.includes('no-reply') && !this.baseMentionObj.fromMail.includes('no.reply')){
          this.emailToEmail.push(this.baseMentionObj.fromMail);
        }
        // if (this.baseMentionObj.toMailList && this.baseMentionObj.toMailList.length>0)
        // {
        //   this.emailToEmail = this.emailToEmail.concat(this.baseMentionObj.toMailList)
        //   this.emailToEmail = this.emailToEmail.filter((email) => email != this.replyForm
        //     .get('replyHandler').value)
        // }
      }

      if (this.baseMentionObj?.replytoEmail?.trim()?.length > 0) {
        if (!this.isSystemGeneratedEmail(this.baseMentionObj?.replytoEmail)) {
          this.emailToEmail.push(this.cleanEmail(this.baseMentionObj?.replytoEmail));
        }
      }

      // if (this.baseMentionObj.ccMailList) {
      //   this.emailCCEmails = this.baseMentionObj.ccMailList;
      // }
      // if (this.baseMentionObj.bccMailList) {
      //   this.emailBCCEmails = this.baseMentionObj.bccMailList;
      // }
    } else if (this.baseMentionObj.channelGroup === ChannelGroup.Voice) {
      this.showReplySection = false;
    }
    if (this.onlyEscalation) {
      this.showReplySection = true;
      this.isEmailChannel = false;
      this.showEmailView = false;
    }
    const channeltype = this._postDetailService?.postObj.channelType;
    if (
      channeltype === 8 ||
      channeltype === 61 ||
      channeltype === 11 ||
      channeltype === 12 ||
      channeltype === 2 ||
      channeltype === 49
    ) {
      this.emojiSet = 'facebook';
    } else if (channeltype === 1 || channeltype === 7) {
      this.emojiSet = 'twitter';
    }
    if (!this.onlySendMail) {
      this.getFoulKeywordsApi = this.replyService
        .getFoulKeywords(this.baseMentionObj)
        .subscribe((res) => {
          this.foulKeywordArr = res.foulEmailIDsKeyWords;
        });
    }

    this.subscribeToObservables();
    if (
      this.baseMentionObj.channelType === ChannelType.PublicTweets ||
      this.baseMentionObj.channelType === ChannelType.Twitterbrandmention
    ) {
      this.textAreaCount[0].postCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      this.textAreaCount[0].showAddNewReply = true;
      this.textAreaCount[0].totalCharacters = this.twitterAccountPremium ? 100000 : this.maxLengthInput;
      this.textAreaCount[0].showPost = true;
      this.textAreaCount[0].showTotal = true;
      // const testarea = new TextAreaCount();
      // testarea.id = 1;
      // this.textAreaCount.push(testarea);
    } else {
      this.textAreaCount[0].postCharacters = this.twitterAccountPremium ? 100000 : this.maxLengthInput;
      this.textAreaCount[0].showAddNewReply = false;
      this.textAreaCount[0].totalCharacters = this.twitterAccountPremium ? 100000 : this.maxLengthInput;
      this.textAreaCount[0].showPost = false;
      this.textAreaCount[0].showTotal = true;
      this.textAreaCount[0].maxPostCharacters = this.twitterAccountPremium ? 100000 : this.maxLengthInput;
    }

    // showMedia Gallery
    if (
      this.baseMentionObj.channelGroup === ChannelGroup.Twitter ||
      this.baseMentionObj.channelGroup === ChannelGroup.Facebook ||
      this.baseMentionObj.channelGroup === ChannelGroup.WhatsApp ||
      this.baseMentionObj.channelGroup === ChannelGroup.Email ||
      this.baseMentionObj.channelGroup === ChannelGroup.GoogleBusinessMessages ||
      this.baseMentionObj.channelGroup === ChannelGroup.Telegram ||
      this.baseMentionObj.channelType === ChannelType.InstagramMessages
    ) {
      this.showMediaButton = true;
    }

    if (this.onlySendMail) {
      this.showEmailView = false;
      this.emailToEmail = [];
      this.emailCCEmails = [];
      this.emailBCCEmails = [];
      let ticormention = String(this.baseMentionObj.ticketInfo.ticketID);
      if (!this.baseMentionObj.isActionable) {
        ticormention = `Mention ID : ${this.baseMentionObj.brandInfo.brandID}/${this.baseMentionObj.channelType}/${this.baseMentionObj.contentID}`;
      }
      
      if(this.emailForward){
        this.sendEmailSubject = this.baseMentionObj?.title;
      } else {
        this.sendEmailSubject = `Locobuzz Alert: ${this.baseMentionObj.brandInfo.brandFriendlyName
          } : ${ChannelGroup[this.baseMentionObj.channelGroup]}: ${ChannelType[this.baseMentionObj.channelType]
          } : ${ticormention} : ${this.baseMentionObj.author.screenname
            ? this.baseMentionObj.author.screenname
            : this.baseMentionObj.author.name
              ? this.baseMentionObj.author.name
              : 'Anonymous'
          } `;
      }
     
    
      this.getTicketHtmlForEmail();
      this.replyLinkCheckbox = this.replyLinkCheckbox.filter((obj) => {
        if (obj.replyLinkId === Replylinks.SendToGroups) {
          return obj;
        }
      });
    } else {
      if (this.baseMentionObj.channelGroup === ChannelGroup.Email) {
        if (this.baseMentionObj.emailContent) {
          let updatedAt = moment.utc(this.baseMentionObj.mentionTime).local().format('MMMM Do YYYY, h:mm:ss A')
          let authorName = this.baseMentionObj.author.socialId;
          let receivedText = this.baseMentionObj.emailContent;
          let createdText = ' <br /> <br /> On ' + updatedAt + ', ' + authorName + ' wrote: ';
          // this.emailReplyText = createdText.concat(receivedText);
          this.storedReceivedText = createdText.concat(receivedText);
        } else {
          this.getEmailHtmlData(this.baseMentionObj);
        }
      }
    }

    this.brandList = this._filterService.fetchedBrandData;
    if (this.brandList) {
      const currentBrandObj = this.brandList.filter((obj) => {
        return +obj.brandID === +this.baseMentionObj.brandInfo.brandID;
      });
      this.currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;

      if (this.currentBrand) {
        if (
          this.currentBrand.isBrandworkFlowEnabled &&
          // this.currentBrand.categoryID == '1010' &&
          this.currentUser.data.user.role === UserRoleEnum.BrandAccount
        ) {
          this.textAreaCount[0].text = this.baseMentionObj?.ticketInfo?.lastNote || '';
          this.dispatchEventTimeout =setTimeout(() => {
            const event = new Event('input', {
              bubbles: true,
              cancelable: true
            });
            this.inputElement?.nativeElement?.dispatchEvent(event);
          }, 2000);
        }
      }
    }
    if (
      (this.baseMentionObj.channelGroup === ChannelGroup.WhatsApp || 
        this.baseMentionObj.channelGroup === ChannelGroup.GoogleBusinessMessages || 
        this.baseMentionObj.channelType === ChannelType.FBMessages ||
        this.baseMentionObj.channelType === ChannelType.InstagramMessages) &&
      !this.onlyEscalation
    ) {
      this.checkReplyMessageExpiry();
    }
    // for email channel

    if (this.onlyEscalation) {
      const obj: ReplyTimeExpire = {
        message: 'setting expire to false',
        baseMention: this.baseMentionObj,
        status: false,
      };
      this.replyService.checkReplyTimeExpireSignal.set({
        obj,
        tagId: this.baseMentionObj.tagID,
      });
    }

    const valueLoadedTicketHisotrySignal = this._ticketService.loadedTicketHisotrySignal();
    if (valueLoadedTicketHisotrySignal) {
      this.loadedTicketHisotrySignalChanges(valueLoadedTicketHisotrySignal);
    }
    // window.addEventListener('scroll', this.scrollEvent, true);
    // this.subs.add(
    //   this._ticketService.loadedTicketHisotry.subscribe((data) => {
    //     if (data && this.userPostView && this.isAIAutoResponse && this.baseMentionObj.channelGroup != ChannelGroup.Email) {
    //         this._ngZone.run(() => {
    //           const menu = document.querySelector('.aiSmartSuggesionMenu');
    //           if (menu) {
    //             menu.dispatchEvent(new Event('click'));
    //           }
    //         });
    //       this._ticketService.loadedTicketHisotrySignal.set(null);
    //       }
    //     })
    // );
    const value = this._ticketService.scrollEventSocialBoxSignal();
    if (value) {
      this.scrollEventSocialBoxSignalChanges(value)
    }
    // this.subs.add(
    //   this._ticketService.scrollEventSocialBox
    //     .pipe(filter((res) => this.postDetailTab?.guid == res?.guid))
    //     .subscribe((data) => {
    //       if (data) {
    //         this.scrollEvent();
    //       }
    //     })
    // );
    this.subs.add(
      this._ticketService.scrollEventPostDetail.subscribe((data) => {
        if (data) {
          this.scrollEvent();
        }
      })
    );

    this.subs.add(
      this.replyService.applyRephrase.subscribe((res) => {
        if (res && !('isFromEmailPopUp' in res)) {
          this.applyRephraseData(res);
        }
      })
    );

    this.subs.add(
      this.replyService.undoRedoRephrase.subscribe((res) => {
        if(res && res.value){
          if (res.value == 'undo') {
            this.undoRephrase(res.isNotFromInsertPopover);
          } else if (res.value == 'redo') {
            this.redoRephrase(res.isNotFromInsertPopover);
          }
        }
      })
    );
    if (!this.onlySendMail && !this.onlyEscalation)
    {
    this.getSuggestedResponse();
    }

    if (
      !this.makercheckerticketId &&
      !this.simulationCheck &&
      !this.onlyEscalation &&
      this.currentBrand.isAutoSuggestionEnabled &&
      !this.onlySendMail
    ) {
      this.getSmartSuggestion(this._postDetailService?.postObj);
    }

    if (this.currentBrand.signatureSymbol != null && !this.onlySendMail) {
      this.getSignatureSymbol();
    } else {
      this.createReplySignature();
    }

    this.nativeElementTimeout =setTimeout(() => {
      this._ngZone.runOutsideAngular(() => {
        if (this.inputElement) {
          this.inputElement?.nativeElement.focus();
        }
      });
      console.log('setTimeout called');
    }, 50);

      this.subs.add(this.inputSplitObs.pipe(
        debounceTime(1000)
      ).subscribe((res)=>{
        this.ReplyInputChangesModified(res.event, res.inputid, res.text, res.index)
        this.disableSaveButton = false;
        this.cdr.detectChanges()
      }));

      this.subs.add(
      this.twitterHandleSearch.pipe(
         debounceTime(500)
       ).subscribe((res)=>{
        if(res)
        {
          // this.searchFbTwitterHandles(res);
          if (this.currentUser?.data?.user?.isShowTwitterHandleEnable) {
            this.searchFbTwitterHandles(res);
          } else {
            this.getTwitterHandleListFromDB(res);
          }
        }
       }));
    this.getIrctcTagDetailsApi = this.accountService.getIrctcTagDetails().subscribe((res)=>{
      this.irctcZoneData = res.irctcTaggingData
    })
   if(this.baseMentionObj?.channelGroup != ChannelGroup.Email){
    this.subs.add(
      this._sidebar.onTicketViewChange.subscribe(view => {
        if (view) {
          this.selectedTicketView = view;
          this.cdkRef.detectChanges();
        }
      })
    )
     
  }
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this.cdkRef.detectChanges();
        }
      })
    )
    this.subs.add(
      this._sidebar.selectedLanguage.subscribe(res => {
        this.userSelectedLanguage = res;
        if (this._sidebar.rtlLanguages.includes(this.userSelectedLanguage)) {
          this.layout = "rtl";
        }
      })
    );
    this.selectedTicketView = localStorage.getItem('selctedView')? parseInt(JSON.parse(localStorage.getItem('selctedView'))):1;

    if(this.baseMentionObj?.channelGroup == ChannelGroup.Email){
        this.selectedTicketView = 3;
        this.showEmailFriendlyView = true
        this.cdkRef.detectChanges();
      if (this.pageType != PostsType.TicketHistory) {
        {
          if (!this.baseMentionObj.fromMail.includes('noreply') && !this.baseMentionObj.fromMail.includes('no-reply') && !this.baseMentionObj.fromMail.includes('no.reply')) {
            this.tempAllGroupEmailList.push(this.baseMentionObj?.fromMail)
          }
          if (this.baseMentionObj?.toMailList?.length > 0) {
            this.tempAllGroupEmailList = this.tempAllGroupEmailList.concat(this.baseMentionObj?.toMailList)
          }
          if (this.baseMentionObj?.ccMailList?.length > 0) {
            this.tempAllGroupEmailList = this.tempAllGroupEmailList.concat(this.baseMentionObj?.ccMailList)
          }
          if (this.baseMentionObj?.bccMailList?.length > 0) {
            this.tempAllGroupEmailList = this.tempAllGroupEmailList.concat(this.baseMentionObj?.bccMailList)
          }
        }
    }
    
        this.subs.add(
          this._ticketService.attachmentWidthCalculationObs.subscribe((res)=>{
            if(res!== null)
            {
              if(this.baseMentionObj?.channelGroup == ChannelGroup.Email )
              {
                if (this.selectedAttachmentList?.length > 0)
                {
                this.maximumAttachmentLength = this.selectedAttachmentList.length;
                this.cdkRef.detectChanges()
                setTimeout(() => {
                  this.checkEmailAttachmentWidth();
                }, 300);
              }

                if (res == true) {
                  this.emailToChipPosition = 2
                } else {
                  this.emailToChipPosition = 3
                }
              }
            }
          })
        )


            this.subs.add(
              this._ticketService.attachmentWidthCalculationDetailViewObs.subscribe((res) => {
                if (res!== null) {
                  if (this.baseMentionObj?.channelGroup == ChannelGroup.Email)
                  {
                  if (this.selectedAttachmentList?.length > 0 && this.attachmentContainer) {
                    this.maximumAttachmentLength = this.selectedAttachmentList.length;
                    this.cdr.detectChanges()
                    setTimeout(() => {
                      this.checkEmailAttachmentWidth();
                    }, 300);
                  }
                  if(res==true)
                  {
                    this.emailToChipPosition = 1
                  }else
                  {
                    this.emailToChipPosition = 2
                  }
                }
                }
              })
            )
          const postUserToogle   = localStorage.getItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`) ? localStorage.getItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`) == 'false' ? false : true : false;
      if (postUserToogle && this.pageType == PostsType.TicketHistory) {
        this.emailToChipPosition = 1
      }else{
        this.emailToChipPosition = 2
      }

  }

    this.autoUpdateWindow = localStorage.getItem('autoUpdateWindow') ? JSON.parse(localStorage.getItem('autoUpdateWindow')) : false;

    this.IDName = `Post_reply_${this.baseMentionObj.tagID}`;
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.baseMentionObj.brandInfo.brandID
    );
    if (brandInfo?.sridMessages && brandInfo?.sridMessages[0]?.settingFor == 'Srid default message' && brandInfo?.sridMessages[0]?.settings?.isActive){
      this.srCreatedMessage = this.getRamdomSrMessage(brandInfo?.sridMessages[0]?.settings?.messages.filter(r => r.isChecked == true).map(({ message }) =>  message))
    } else if (brandInfo?.sridMessages && brandInfo?.sridMessages[0]?.settingFor == 'Srid default message' && brandInfo?.sridMessages[0]?.settings?.isActive==false){
      this.srCreatedMessage = '';
    }

    
    if (brandInfo &&
      brandInfo.isTicketDispositionFeatureEnabled) {
      const obj = {
        CategoryGroupID: brandInfo.categoryGroupID,
        CategoryGroupName: brandInfo.categoryName,
        TicketID: this.ticketHistoryData?.ticketClient?.ticketId
      };
      this.getDispositionDetailsApi =this.replyService.getDispositionDetails(obj).subscribe((res) => {
        if (res.success) {
          this.ticketDispositionList = res?.data?.ticketDispositionList;
          this.replyService.ticketDispositionListSignal.set(this.ticketDispositionList);
          this.ticketDispositionDetails = res?.data ? { data: { note: res?.data?.note, ticketdispositionID: res?.data?.ticketdispositionID }} : { data : { note : '', ticketdispositionID : 0 } };
        } else {
          this.ticketDispositionList = [];
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

    if (this.baseMentionObj?.channelGroup == ChannelGroup.Email){
      this.getEmailGroups(this.baseMentionObj.brandInfo);
      if(this.pageType==PostsType.TicketHistory){
        this.tempAllGroupEmailList = this._postDetailService.emailIdsInSameThread
      }

    }

    if (this.baseMentionObj?.provider == 'Outlook'){
      this.emailOutlook = true;
    } else {
      this.emailOutlook = false;
    }

    const valueEmailPopupSignal = this._ticketService.emailPopupToPostReplySetDataObsSignal();
    if (valueEmailPopupSignal) {
      this.emailPopupToPostReplySetDataObsSignalChanges(valueEmailPopupSignal);
    }

    // this.subs.add(
    //   this._ticketService.emailPopupToPostReplySetDataObs.subscribe((res:any)=>{
    //     if (res.status){
    //       console.log("emailPopupToPostReplySetDataObs", res);
    //       this._ticketService.emailPopupToPostReplySetDataObsSignal.set({status:false, data:null});
    //       const resposne = res.data;
    //       if (!(resposne?.isForward) && 'reply' in resposne && Object.keys(resposne?.reply?.value).length > 0) {
    //         if(this.selectedReplyType != resposne?.reply?.value?.id){
    //           this.selectedReplyType = resposne?.reply?.value?.id;
    //           this.replyTypeChange(resposne?.reply?.value?.id);
    //         }
    //       }

    //       if ('handle' in resposne){
    //         if (resposne?.handle?.value) this.replyForm.patchValue({
    //           replyHandler: resposne?.handle?.value
    //         })
    //       }

    //       if ('emails' in resposne) {

    //         if ('subject' in resposne?.emails && resposne?.emails?.subject){
    //           this.sendEmailSubject = resposne.emails.subject;
    //         }

    //         if (resposne?.emails && resposne?.emails?.to && resposne?.emails?.to?.value?.length > 0) {
    //           this.emailToEmail = resposne?.emails?.to?.value;
    //         }

    //         if (resposne?.emails && resposne?.emails?.cc && resposne?.emails?.cc?.value?.length > 0) {
    //           this.emailCCEmails = resposne?.emails?.cc?.value;
    //           this.replyEmailcc = true;
    //         }

    //         if (resposne?.emails && resposne?.emails?.bcc && resposne?.emails?.bcc?.value?.length > 0) {
    //           this.emailBCCEmails = resposne?.emails?.bcc?.value;
    //           this.replyEmailBcc = true;
    //         }

    //         if(this.selectedTicketView == 3){
    //           this.showEmailFriendlyView = true
    //         }

    //         if (resposne?.emails?.replyText?.trim()?.length > 0) {
    //           this.emailReplyText = resposne?.emails?.replyText
    //           this.showPrevoiusMail = resposne?.emails?.showPrevoiusMail
    //         }
    //       }
    //       if ('replyCheckbox' in resposne && resposne?.replyCheckbox?.length > 0) {
    //         for (const rcheck of resposne?.replyCheckbox) {
    //           if (rcheck.checked && this.replyLinkCheckbox.some(item => item?.replyLinkId == rcheck.replyLinkId)) {
    //             this.onReplyLinkChange({
    //               checked: rcheck.checked,
    //               source: {
    //                 value: rcheck.replyLinkId
    //               }
    //             }, rcheck.name)
    //           }
    //         }
    //       }
    //       if ('selectedMedia' in resposne && resposne?.selectedMedia?.length > 0) {
    //         this.selectedMedia = resposne?.selectedMedia;
    //         this.mediaSelectedAsync.next(this.selectedMedia);
    //       }  
          
    //       this.cdr.detectChanges();
    //     }
    //   })
    // )
    this.getAuthorTicketMandatoryDetails();
    this.whiteList = this._filterService.fetchedEmailWhitelistData[this.baseMentionObj?.brandInfo?.brandID] || [];
    this.blackListedChips = {
      'to': new Set(),
      'cc': new Set(),
      'bcc': new Set()
    };
    this.blackListedGrpChips = {
      'groupto': new Set(),
      'groupcc': new Set(),
      'groupbcc': new Set()
    };
    this.showBlackList = this.ticketHistoryData?.showBlackList;
    this._ticketService.replyInputTextData = '';
    // if (brandInfo?.aiTagEnabled) {
    //   this.generateClosingTicketTag();
    // }

    if(this.defaultAgentID)
    {
      this.replyForm.get('assignToid').setValue(this.defaultAgentID);
    }
  }

  scrollEventSocialBoxSignalChanges(res){
    if (this.postDetailTab?.guid == res?.guid) {
      this.scrollEvent();
    }
  }

  isPremiumTwitterAccount(accountInfo){
    if (accountInfo){
      this.IsPremiumTwitterAccountApi = this._ticketService.IsPremiumTwitterAccount({ "brandID": this.baseMentionObj?.brandInfo?.brandID, "TwitterID": accountInfo.accountId}).subscribe(res => {
        if (res.success && res.message == 'Premium User'){
          this.twitterAccountPremium = true;
        }else {
          this.twitterAccountPremium = false;
        }
        if (
          this.baseMentionObj.channelType === ChannelType.PublicTweets ||
          this.baseMentionObj.channelType === ChannelType.Twitterbrandmention
        ) {
          this.ticketReplyDTO.maxlength = this.twitterAccountPremium ? 100000 : 1500;
          this.maxLengthInput = this.twitterAccountPremium ? 100000 : 1500;
          this.textAreaCount[0].postCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
          this.textAreaCount[0].maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
          this.textAreaCount[0].showAddNewReply = true;
          this.textAreaCount[0].totalCharacters = this.maxLengthInput;
          this.textAreaCount[0].showPost = true;
          this.textAreaCount[0].showTotal = true;
          this.cdr.detectChanges();
        }
      });
    }
  }

  loadedTicketHisotrySignalChanges(data){
    if (data && this.userPostView && this.isAIAutoResponse && this.baseMentionObj.channelGroup != ChannelGroup.Email) {
      this._ngZone.run(() => {
        const menu = document.querySelector('.aiSmartSuggesionMenu');
        if (menu) {
          menu.dispatchEvent(new Event('click'));
        }
      });
      this._ticketService.loadedTicketHisotrySignal.set(null);
    }
  }

  getEmailHtmlData(mention: BaseMention): any {
    const source = this._mapLocobuzz.mapMention(mention);
    const object = {
      BrandInfo: source.brandInfo,
      TagId: source.tagID,
    };
    let updatedAt = moment.utc(this.baseMentionObj.mentionTime).local().format('MMMM Do YYYY, h:mm:ss A')
    let authorName = mention.author.name;
    this.ckEditorLoader=true;
    this.cdr.detectChanges();
    this.getEmailHtmlDataApi = this._ticketService.getEmailHtmlData(object).subscribe((data) => {
      this.ckEditorLoader = false;
            this.cdr.detectChanges();
      if (data.success && data.data) {
        data.data = data.data.replace(
          'cid:icon.png',
          'https://images.locobuzz.com/Email/Attachment/7172/a3f18571-7a47-448e-8a9e-a3e4f17cc699.png'
        );
        let receivedText = data.data;
        let createdText = ' <br /> <br /> On ' + updatedAt + ', ' + authorName + ' wrote: ';
        // this.emailReplyText = createdText.concat(receivedText);
        this.storedReceivedText = createdText.concat(receivedText);
        mention.emailContent = data.data;
      }
    },err=>{
      this.ckEditorLoader = false;
      this.cdr.detectChanges();
    });
  }

  scrollEvent(): void {
    if (this.autoComplete && this.autoComplete.panelOpen)
      this.autoComplete.closePanel();
  }

  emailPopupToPostReplySetDataObsSignalChanges(res) {
    if (res && res.status) {
      this._ticketService.emailPopupToPostReplySetDataObsSignal.set({ status: false, data: null });
      const resposne = res.data;
      if (!(resposne?.isForward) && 'reply' in resposne && Object.keys(resposne?.reply?.value).length > 0) {
        if (this.selectedReplyType != resposne?.reply?.value?.id) {
          this.selectedReplyType = resposne?.reply?.value?.id;
          this.replyForm.get('replyType').setValue(this.selectedReplyType);
          this.replyTypeChange(resposne?.reply?.value?.id);
        }
      }

      if ('handle' in resposne) {
        if (resposne?.handle?.value) this.replyForm.patchValue({
          replyHandler: resposne?.handle?.value
        })
      }

      if ('emails' in resposne) {

        if ('subject' in resposne?.emails && resposne?.emails?.subject) {
          this.sendEmailSubject = resposne.emails.subject;
        }

        if (resposne?.emails && resposne?.emails?.to && resposne?.emails?.to?.value?.length > 0) {
          this.emailToEmail = resposne?.emails?.to?.value;
        }

        if (resposne?.emails && resposne?.emails?.cc && resposne?.emails?.cc?.value?.length > 0) {
          this.emailCCEmails = resposne?.emails?.cc?.value;
          this.replyEmailcc = true;
        }

        if (resposne?.emails && resposne?.emails?.bcc && resposne?.emails?.bcc?.value?.length > 0) {
          this.emailBCCEmails = resposne?.emails?.bcc?.value;
          this.replyEmailBcc = true;
        }

        if (this.selectedTicketView == 3) {
          this.showEmailFriendlyView = true
        }

        if (resposne?.emails?.replyText?.trim()?.length > 0) {
          this.emailReplyText = resposne?.emails?.replyText
          this.showPrevoiusMail = resposne?.emails?.showPrevoiusMail
        }
        this.checkEmailIDOutsideOrganizationOrNot()
      }
      if ('replyCheckbox' in resposne && resposne?.replyCheckbox?.length > 0) {
        for (const rcheck of resposne?.replyCheckbox) {
          if (rcheck.checked && this.replyLinkCheckbox.some(item => item?.replyLinkId == rcheck.replyLinkId)) {
            this.onReplyLinkChange({
              checked: rcheck.checked,
              source: {
                value: rcheck.replyLinkId
              }
            }, rcheck.name)
          }
        }
      }
      if ('selectedMedia' in resposne && resposne?.selectedMedia?.length > 0) {
        this.selectedMedia = resposne?.selectedMedia;
        this.mediaSelectedAsync.next(this.selectedMedia);
        this.createAttachmentMediaPillView();
        setTimeout(() => {
          this.checkEmailAttachmentWidth();
        }, 300);
      }

      this.cdr.detectChanges();
    }
  }

  checkReplyMessageExpiry(): void {
    const keyObj = {
      brandInfo: this.baseMentionObj.brandInfo,
      authorId: this.baseMentionObj.author.socialId,
      SubChannel: this.baseMentionObj.channelType,
    };

    this.getLastMentionTimeApi = this.replyService.getLastMentionTime(keyObj).subscribe((data) => {
      if (data.success) {
        if (this.baseMentionObj.channelGroup === ChannelGroup.WhatsApp || this.baseMentionObj.channelGroup === ChannelGroup.GoogleBusinessMessages) {
          // const sampledat1 = moment(data.data).unix();
          const mentiondate = moment.utc(data.data).unix();
          // const currentdate3 = moment.utc().unix(); // moment(data.updatedAt).unix(); // 1624370808
          const currentDateMinus24 = moment
            .utc()
            .subtract({ hours: 24 })
            .unix();
          // const dhd = 0;
          if (mentiondate < currentDateMinus24) {
            const message = this.baseMentionObj.channelGroup === ChannelGroup.WhatsApp ?
              this.translate.instant('Message-received-than-24') :
              this.translate.instant('Message-received-than-24-GBM');
            this.ticketReplyDTO.showCannedResponse = false;
            const obj: ReplyTimeExpire = {
              message: message,
              baseMention: this.baseMentionObj,
              status: true,
            };
            this.replyService.checkReplyTimeExpireSignal.set({
              obj,
              tagId: this.baseMentionObj.tagID,
            });
          }
        } else if (
          this.baseMentionObj.channelType === ChannelType.FBMessages ||
          this.baseMentionObj.channelType === ChannelType.InstagramMessages
        ) {
          // const sampledat1 = moment(data.data).unix();
          const mentiondate = moment.utc(data.data).unix();
          let channel = '';
          if (this.baseMentionObj.channelType === ChannelType.FBMessages) {
            channel = 'Facebook';
          } else {
            channel = 'Instagram';
          }
          // const currentdate3 = moment.utc().unix(); // moment(data.updatedAt).unix(); // 1624370808
          const currentDateMinus24 = moment
            .utc()
            .subtract({ hours: 168 })
            .unix();
          {
            if (mentiondate < currentDateMinus24) {
              this.ticketReplyDTO.showCannedResponse = false;
              const obj: ReplyTimeExpire = {
                message:
                  this.translate.instant('Message-received-than-7', { channel: channel }),
                baseMention: this.baseMentionObj,
                status: true,
              };
              this.replyService.checkReplyTimeExpireSignal.set({
                obj,
                tagId: this.baseMentionObj.tagID,
              });
            }
          }
        }
      }
    });
  }

  checkEmailReadOption(): void {
    if (
      this.baseMentionObj.channelGroup === ChannelGroup.Email &&
      !this.baseMentionObj.allMentionInThisTicketIsRead
    ) {
      const obj = {
        brandID: this.baseMentionObj.brandInfo.brandID,
        brandName: this.baseMentionObj.brandInfo.brandName,
      };
      const findIndex = this.replyService.brandEmailreadInformation.findIndex(
        (obj) => obj.brandId === this.baseMentionObj.brandInfo.brandID
      );
      if (findIndex > -1) {
        this.setEmailReadOptions(
          this.replyService.brandEmailreadInformation[findIndex]
        );
      } else {
        this.GetBrandMentionReadSettingApi = this.replyService.GetBrandMentionReadSetting(obj).subscribe((resp) => {
          // console.log('reply approved successfull ', data);
          if (resp) {
            this.setEmailReadOptions(resp);
          }
        });
      }
    }
  }

  setEmailReadOptions(resp: MentionReadCompulsory): void {
    this.replyService.emitBrandMentionEmailDataSignal.set(resp);
    if (resp.isMentionReadCompulsory) {
      const obj: EmailReadReceipt = {
        message: 'setting expire to false',
        baseMention: this.baseMentionObj,
        status: true,
      };
      // this.replyService.checkEmailReadReceipt.next(obj);
      this.checkEmailReadReceipt.emit(obj);
    } else {
    }
  }

  getSeletedBrandFromThePost(): any {
    return this._filterService.fetchedBrandData.find(
      (obj) =>
        obj.brandID ===
        this._postDetailService?.postObj.brandInfo.brandID.toString()
    );
  }
  createReplySignature(): void {
    const currentBrand:any = this._filterService.fetchedBrandData.find(
      (obj) => Number(obj.brandID) === this.baseMentionObj.brandInfo.brandID
    );
    if (currentBrand) {
      if (currentBrand.channelGroupIds) {
        const supportedChannels = currentBrand.channelGroupIds.split(',');
        if (
          supportedChannels.includes(
            String(Number(this.baseMentionObj.channelGroup))
          )
        ) {
          if (
            (this.baseMentionObj.channelGroup == ChannelGroup.Instagram &&
              this.baseMentionObj.channelType !=
                ChannelType.InstagramMessages &&
              currentBrand.skipPrivateChannels) ||
            (this.baseMentionObj.channelGroup == ChannelGroup.Instagram &&
              !currentBrand.skipPrivateChannels) ||
            (this.baseMentionObj.channelGroup == ChannelGroup.Facebook &&
              this.baseMentionObj.channelType != ChannelType.FBMessages &&
              currentBrand.skipPrivateChannels) ||
            (this.baseMentionObj.channelGroup == ChannelGroup.Facebook &&
              !currentBrand.skipPrivateChannels) ||
            (this.baseMentionObj.channelGroup == ChannelGroup.Twitter &&
              this.baseMentionObj.channelType != ChannelType.DirectMessages &&
              currentBrand.skipPrivateChannels) ||
            (this.baseMentionObj.channelGroup == ChannelGroup.Twitter &&
              !currentBrand.skipPrivateChannels) ||
            this.baseMentionObj.channelGroup == ChannelGroup.Youtube ||
            this.baseMentionObj.channelGroup == ChannelGroup.LinkedIn ||
            this.baseMentionObj.channelGroup == ChannelGroup.GooglePlayStore ||
            this.baseMentionObj.channelGroup == ChannelGroup.Sitejabber ||
            this.baseMentionObj.channelGroup == ChannelGroup.Email ||
            this.baseMentionObj.channelGroup == ChannelGroup.GoogleMyReview ||
            this.baseMentionObj.channelGroup == ChannelGroup.GoogleBusinessMessages ||
            this.baseMentionObj.channelGroup == ChannelGroup.WhatsApp ||
            this.baseMentionObj.channelGroup == ChannelGroup.WebsiteChatBot ||
            this.baseMentionObj.channelGroup == ChannelGroup.AppStoreReviews ||
            this.baseMentionObj.channelGroup == ChannelGroup.TikTok ||
            this.baseMentionObj.channelGroup == ChannelGroup.Pantip
          ) {
            if (currentBrand.isSignatureEnabled) {
              // IsSignatireEnabled = true;
              this.emailSignatureParams = {};
              this.emailSignatureParams.isSignatureEnabled = true;
              this.emailSignatureParams.isAppendNewLine =
                currentBrand.skipPrivateChannels;
              this.emailSignatureParams.isAppendNewLineForSignature =
                currentBrand.isAppendNewLine;
              this.emailSignatureParams.userSignature = '';
              const IsEmailSignature = false;
              if (this.baseMentionObj.channelGroup == ChannelGroup.Email) {
                this.emailSignatureParams.userSignature =
                  currentBrand.emailTemplate;
                this.emailSignatureParams.userSignatureSymbol = undefined;
                this.emailSignatureParams.isEmailSignature = true;
              } else {

                if (this.currentUser.data.user.brandSignature){
                  let selectedBrand = this.currentUser.data.user.brandSignature.find(brand => brand.brandID == currentBrand.brandID);
                  this.emailSignatureParams.userSignature = selectedBrand.signature;
                } else {
                  this.emailSignatureParams.userSignature = currentBrand.userSignature;
                }
            

                // switch (parseInt(currentBrand.signatureSymbol)) {
                //   case 1:
                //     this.emailSignatureParams.userSignatureSymbol = '*';
                //     break;
                //   case 2:
                //     this.emailSignatureParams.userSignatureSymbol = '-';
                //     break;
                //   case 3:
                //     this.emailSignatureParams.userSignatureSymbol = '_';
                //     break;
                //   case 4:
                //     this.emailSignatureParams.userSignatureSymbol = ':';
                //     break;
                //   case 5:
                //     this.emailSignatureParams.userSignatureSymbol = '>';
                //     break;
                //   case 6:
                //     this.emailSignatureParams.userSignatureSymbol = '∞';
                //     break;
                //   default:
                //     this.emailSignatureParams.userSignatureSymbol = ' ';
                //     break;
                // }

                if (
                  this.allSignatureSymbol &&
                  this.allSignatureSymbol.length > 0
                ) {
                  if (currentBrand.signatureSymbol) {
                    const signatureSymbolObj = this.allSignatureSymbol.find(
                      (obj) => obj.id == +currentBrand.signatureSymbol
                    );
                    if (signatureSymbolObj) {
                      this.emailSignatureParams.userSignatureSymbol =
                        signatureSymbolObj.symbol;
                    }else
                    {
                      this.emailSignatureParams.userSignatureSymbol=''
                    }
                  }
                }

                this.emailSignatureParams.isEmailSignature = false;
              }
              this.emailSignatureParams.emailFooter = '';
              if (this.emailSignatureParams.userSignature == '') {
                this.emailSignatureParams.userSignature =
                  this.emailSignatureParams.userSignatureSymbol;
                this.emailSignatureParams.userSignatureSymbol = '';
              }
              this.SetSignatureAndFocus(this.emailSignatureParams);
            }
          }
        }
      }
    }
  }

  SetEmailFooterAndFocus(): void {
    const textareavalue = this.emailReplyText;

    let signatureText = '';

    if (this.emailSignatureParams.isAppendNewLine) {
      signatureText =
        textareavalue +
        '<br /><br /><br /><br />' +
        this.emailSignatureParams.emailFooter;
    } else {
      signatureText =
        textareavalue + '<br /><br />' + this.emailSignatureParams.emailFooter;
    }

    // setTimeout(function () {
    this.emailReplyText = signatureText;
    // }, 1000);
  }

  SetSignatureAndFocus(signatureParam: SignatureParam, event?: any, index?, cursorStart?, cursorEnd?): void {
    // var textarea = $('#txtReplyText');
    // var textareavalue = textarea.val();
    this.addedSignatureForUser = signatureParam;
    let textareavalue = '';
    if (signatureParam.isEmailSignature) {
      textareavalue = this.emailReplyText;
      // textareavalue = CKEDITOR.instances["txtReplyText"].getData()
      let FirstName = '';
      let LastName = '';
      // var NameArray = SignatureUserFullName.split(' ');
      FirstName = this.currentUser.data.user.firstName;
      LastName = this.currentUser.data.user.lastName;

      let newEmailTemplateSignature = '';
      if (
        signatureParam.userSignature.indexOf('{firstname}') > 0 &&
        signatureParam.userSignature.indexOf('{lastname}') > 0
      ) {
        newEmailTemplateSignature = signatureParam.userSignature
          .replace('{firstname}', FirstName)
          .replace('{lastname}', LastName);
      } else if (
        signatureParam.userSignature.indexOf('{firstinitial}') > 0 &&
        signatureParam.userSignature.indexOf('{lastname}') > 0
      ) {
        newEmailTemplateSignature = signatureParam.userSignature
          .replace('{firstinitial}', FirstName.charAt(0))
          .replace('{lastname}', LastName);
      } else if (
        signatureParam.userSignature.indexOf('{firstname}') > 0 &&
        signatureParam.userSignature.indexOf('{lastinitial}') > 0
      ) {
        newEmailTemplateSignature = signatureParam.userSignature
          .replace('{firstname}', FirstName)
          .replace('{lastinitial}', LastName.charAt(0));
      } else if (
        signatureParam.userSignature.indexOf('{firstinitial}') > 0 &&
        signatureParam.userSignature.indexOf('{lastinitial}') > 0
      ) {
        newEmailTemplateSignature = signatureParam.userSignature
          .replace('{firstinitial}', FirstName.charAt(0))
          .replace('{lastinitial}', LastName.charAt(0));
      } else {
        newEmailTemplateSignature = signatureParam.userSignature.replace('{firstname}', FirstName)
          .replace('{lastname}', LastName)
          .replace('{firstinitial}', FirstName.charAt(0))
          .replace('{lastinitial}', LastName.charAt(0));;
      }
      let signatureText = '';
      if (
        this.IsSignatureAlreadyAdded(textareavalue, newEmailTemplateSignature)
      ) {
        textareavalue = this.CleanUpString(
          textareavalue,
          [newEmailTemplateSignature],
          ''
        );
      }
      if (signatureParam.isAppendNewLine) {
        signatureText =
          textareavalue +
          '<br /><br /><br /><br />' +
          newEmailTemplateSignature;
      } else {
        signatureText =
          textareavalue + '<br /><br />' + newEmailTemplateSignature;
      }

      // if (EmailFooter != "" && EmailFooter != undefined) {
      //     signatureText = (signatureText + EmailFooter);
      // }

      // setTimeout(function () {
      // CKEDITOR.instances["txtReplyText"].setData(signatureText);
      // }, 1000);

      this.emailReplyText = this.emailReplyText + signatureText;
    } else {
      textareavalue = this.textAreaCount[this.textAreaCount.length-1]?.text;
      const strUserSignature =
        signatureParam.userSignatureSymbol + ' ' + signatureParam.userSignature;
      if (this.textAreaCount.some((obj) => obj.text.includes(strUserSignature.trim())) == false && signatureParam.userSignatureSymbol){
        const textIndex = index == 0 || index ? index : this.textAreaCount.length - 1;

        if (signatureParam.isAppendNewLineForSignature) {
          this.textAreaCount[this.textAreaCount.length - 1].text = this.textAreaCount[this.textAreaCount.length - 1]?.text + ' ' + strUserSignature.trim();
        }  
        else {
          this.textAreaCount[textIndex].text = this.textAreaCount[textIndex]?.text ;
          if (!this.textAreaCount[this.textAreaCount.length - 1].text.includes(strUserSignature.trim())) {
            this.textAreaCount[this.textAreaCount.length - 1].text = this.textAreaCount[this.textAreaCount.length - 1]?.text + ' ' + strUserSignature.trim();
          } 
        }
        // if (event && event.inputType == 'deleteContentBackward' && this.textAreaCount[this.textAreaCount.length - 1].text.length){
        //   const lastCharacter = strUserSignature[strUserSignature.length - 1];
        //   this.textAreaCount[this.textAreaCount.length - 1].text = this.textAreaCount[this.textAreaCount.length - 1]?.text + '' + lastCharacter;
        // } else {
        //   if (this.textAreaCount[this.textAreaCount.length - 1].text.length){
        //     this.textAreaCount[this.textAreaCount.length - 1].text = this.textAreaCount[this.textAreaCount.length - 1]?.text + ' ' + strUserSignature.trim();
        //   }else {
        //     this.textAreaCount[this.textAreaCount.length - 1].text = this.textAreaCount[this.textAreaCount.length - 1]?.text + '' + strUserSignature.trim();
        //     if (signatureParam.isAppendNewLine){
        //       requestAnimationFrame(() => {
        //         this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.setSelectionRange(0, 0);
        //         this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.focus();
        //       })
        //     }
        //   }
        // }

        requestAnimationFrame(() => {
          this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.setSelectionRange(cursorStart || 0, cursorEnd || 0);
          this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.focus();
        })
      }
    }

    if (!this.isUserNameAddedOnce && this.baseMentionObj.channelGroup === ChannelGroup.Instagram && this.baseMentionObj.channelType === ChannelType.InstagramComments) {
      if (this.baseMentionObj?.author?.screenname && !this.textAreaCount[0].text?.includes(`@${this.baseMentionObj?.author?.screenname}`)){
        this.isUserNameAddedOnce = true;
        this.textAreaCount[0].text = `@${this.baseMentionObj?.author?.screenname} ${this.textAreaCount[0].text}`;
      }
    }
    this.cdr.detectChanges();
  }

  eventHandler(event: any, index:number) {
    let startPos = event.target.value.length;
    if (this.textAreas['_results'][index] && this.textAreas['_results'][index]?.nativeElement) {
      const textareaElement = this.textAreas['_results'][index]?.nativeElement;
      // this.textAreas['_results'][index]?.nativeElement
      startPos = textareaElement.selectionStart;
      // endPos = textareaElement.selectionEnd;
    }
    const strUserSignature =
      this.emailSignatureParams.userSignatureSymbol + ' ' + this.emailSignatureParams.userSignature;
    if (this.textAreaCount.some((obj) => obj.text.includes(strUserSignature.trim())) == true && this.emailSignatureParams.userSignatureSymbol) {
      const startIndex = this.textAreaCount[index].text.indexOf(strUserSignature.trim());
      const endIndex = strUserSignature.trim().length
      if (startIndex >= 0 && (startPos >= (startIndex + 1) && startPos <= (startIndex + endIndex)) && (event.code == "Backspace" || event.code == "Delete")) {
        return false;
      }
      return true;
    } else {
      return true;
    }
  }

  CleanUpString(MainString, ReplaceWordArray, replacewith): string {
    if (typeof replacewith == 'undefined') {
      replacewith = '';
    }
    const re = new RegExp(
      `(?<![\w\d])${ReplaceWordArray.join('|')}(?![\w\d])`,
      'g'
    );

    return (MainString || '').replace(re, replacewith).replace(/[ ]{2,}/, ' ');
  }

  IsSignatureAlreadyAdded(textareavalue, UserSignature) {
    if (textareavalue != undefined && textareavalue != null) {
      if (textareavalue.indexOf(UserSignature) != -1) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  checkReplyInputParamsSignalChanges(paramObj){
    if (
      paramObj &&
      paramObj.postObj &&
      paramObj.postObj.ticketInfo.ticketID ===
      this._postDetailService?.postObj.ticketInfo.ticketID
    ) {
      if (paramObj && paramObj.makerchticketId) {
        this.makercheckerticketId = paramObj.makerchticketId;
      }
      if (paramObj && paramObj.SSREMode && paramObj.SsreIntent) {
        this.SsreMode = paramObj.SSREMode;
        this.SsreIntent = paramObj.SsreIntent;
        this.simulationCheck = true;
        if (this.replyInputParams.SsreIntent === SsreIntent.Right) {
          this.ssreSimulationRight = true;
        }
      }
      if (paramObj && paramObj.onlyEscalation) {
        // this.showReplySection = false;```````````````
        this.getAutoQueueConfig(this._postDetailService?.postObj.brandInfo);
        this.IsreplyAndEscalate = true;
        this.showEscalateview = true;
        this.showEmailView = false;
        this.onlyEscalation = true;
        this.isEmailChannel = true;
        this.onlySendMail = false;
        this.emailForward = false;
        this.srCreated = paramObj.srCreated
        this.baseMentionObj = this._postDetailService?.postObj;
        this.postReplyType.emit({ type: 'Escalate' });
        this.postDetailServiceTimeout =setTimeout(() => {
          this.callEscalationListAPI({
            Brand: this._postDetailService?.postObj.brandInfo,
          });
        }, 1000);

        if (this.srCreated) {
          if (
            this.baseMentionObj?.ticketInfo?.srid &&
            this.baseMentionObj?.ticketInfo?.status == TicketStatus.Open
          ) {
            const brandInfo = this._filterService.fetchedBrandData.find(
              (obj) => obj.brandID == String(this.baseMentionObj.brandInfo.brandID)
            );
            if (brandInfo?.isUpdateWorkflowEnabled) {
              if (this.showReplySection) {
                if (brandInfo.crmClassName == 'DreamSOLCRM') {
                  this.ticketReplyDTO.replyOptions = [
                    { id: 3, value: ' Reply & Close' },
                    { id: 5, value: ' Reply & Escalate' }
                  ];

                } else if ((brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm') && this.crmTicketStatus) {
                  /* in that case showing only option whihc one allow you to user */
                  /* this.ticketReplyDTO.replyOptions = [
                    { "id": 3, "value": " Reply & Close" },
                    { "id": 18, "value": "Reply & Assign" },
                    { "id": 5, "value": " Reply & Escalate" },
                    { "id": 13, "value": "Reply & On Hold" },
                    { "id": 14, "value": "Reply & Awaiting response from Customer" }
                  ] */
                  /* in that case showing only option whihc one allow you to user */
                } else {
                  if (this.ticketReplyDTO) this.ticketReplyDTO.replyOptions = [{ id: 5, value: ' Reply & Escalate' }];
                }
                this.textAreaCount[0].text = brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage;
                let customReplyStatus:number = 5;
                if ((brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm') && this.crmTicketStatus){
                  customReplyStatus = 3;
                }
                this.replyForm.get('replyType').setValue(customReplyStatus);
                this.replyTypeName = this.ticketReplyDTO.replyOptions.find((obj) => obj.id == (customReplyStatus)).value;
                this.replyTypeChange(customReplyStatus);
              }
              if (this.showEscalateview && brandInfo?.crmClassName != 'TataCapitalCRM' && brandInfo?.crmClassName != 'TataUniCrm') {
                this.replyForm
                  .get('replyEscalateNote')
                  .setValue(
                    brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage
                  );
                if (brandInfo.typeOfCRM !== 2 && brandInfo.typeOfCRM !== 3 && brandInfo.crmClassName != 'DreamSOLCRM' && brandInfo.typeOfCRM !== 101 && brandInfo.crmClassName) {
                  this.GetCrmCsdUserIdApi = this.replyService
                    .GetCrmCsdUserId(brandInfo.crmClassName)
                    .subscribe((res) => {
                      if (res.success) {
                        this.csdUserId = res.data.csdUserId;
                        this.escalateUsers = res.data.csdUserId;
                        this.replyForm.get('escalateUsers').setValue(res.data.csdUserId);
                      }
                    });
                }
              }
            }
          }
          if (this.IsreplyAndEscalate && this._postDetailService.isBulk) {
            this.escalateMsg = true;
          }
          if (paramObj && paramObj.onlySendMail) {
            this.showReplySection = false;
            this.emailForward = paramObj?.forwardEmail;
            this.onlySendMail = true;
            this.newThreadEmail = paramObj?.newThreadEmail ? paramObj?.newThreadEmail : false;
            this.postReplyType.emit({ type: 'SendEmail' });
            if (this.emailForward && paramObj && paramObj?.postObj && paramObj.postObj?.attachmentMetadata && paramObj.postObj?.attachmentMetadata?.mediaContents && paramObj.postObj?.attachmentMetadata?.mediaContents.length){
              let mediaList = paramObj?.postObj?.attachmentMetadata?.mediaContents;
              this.mediaUrlTimeout =setTimeout(() => {
                mediaList.forEach((res, index) => {
                  const mediaPath = res.mediaUrl.replace(
                    's3.amazonaws.com/locobuzz.socialimages',
                    'images.locobuzz.com'
                  );
                  const extension = mediaPath.substr(
                    mediaPath.lastIndexOf('.') + 1
                  );
                  const obj = {
                    displayFileName: res.name,
                    mediaPath: mediaPath,
                    mediaType: extension == 'xlsx' ? this.mediaTypeEnum.EXCEL : res.mediaType,
                    forwardEmail: true
                  }
                  this.selectedMedia.push(obj);
                  if ((mediaList.length - 1) == index) {
                    this.mediaSelectedAsync.next(this.selectedMedia);
                    this.createAttachmentMediaPillView();
                    setTimeout(() => {
                      this.checkEmailAttachmentWidth();
                    }, 300);
                    this.cdr.detectChanges();
                  }
                });
              }, 1500);
            }
          }
          if (paramObj && paramObj.replySection) {
            this.showReplySection = true;
            this.onlySendMail = false;
            this.emailForward = false;
            this.IsreplyAndEscalate = false;
            this.showEscalateview = false;
            this.showEmailView = false;
            this.onlyEscalation = false;
            this.isEmailChannel = false;
            this.selectedReplyType = this.currentUser?.data?.user?.categoryId == 1905 ? 14 : 3;
            this.GetBrandAccountInformation(this._postDetailService?.postObj);
          }
          if (paramObj && paramObj.replyEmailSection) {
            this.showEmailView = true;
            this.isEmailChannel = true;
          }
          //  this.postReplyType.emit({ type: 'replySection' });
        }
        if (this.authorDetails) {
          this.mapTicketCustomFieldColumns(this.authorDetails, true);
        } else {
          this.getAuthorTicketMandatoryDetails();
        }
      }
      if (this.IsreplyAndEscalate && this._postDetailService.isBulk) {
        this.escalateMsg = true;
      }
      if (paramObj && paramObj.onlySendMail) {
        this.showReplySection = false;
        this.emailForward = paramObj?.forwardEmail;
        this.onlySendMail = true;
        this.newThreadEmail = paramObj?.newThreadEmail ? paramObj?.newThreadEmail : false;
        this.postReplyType.emit({ type: 'SendEmail' });
        if (this.emailForward && paramObj && paramObj?.postObj && paramObj.postObj?.attachmentMetadata && paramObj.postObj?.attachmentMetadata?.mediaContents && paramObj.postObj?.attachmentMetadata?.mediaContents.length) {
          let mediaList = paramObj?.postObj?.attachmentMetadata?.mediaContents;
          this.mediaPathTimeout = setTimeout(() => {
            mediaList.forEach((res, index) => {
              const mediaPath = res.mediaUrl.replace(
                's3.amazonaws.com/locobuzz.socialimages',
                'images.locobuzz.com'
              );
              const extension = mediaPath.substr(
                mediaPath.lastIndexOf('.') + 1
              );
              const obj = {
                displayFileName: res.name,
                mediaPath: mediaPath,
                mediaType: extension == 'xlsx' ? this.mediaTypeEnum.EXCEL : res.mediaType,
                forwardEmail: true
              }
              this.selectedMedia.push(obj);
              if ((mediaList.length - 1) == index) {
                this.mediaSelectedAsync.next(this.selectedMedia);
                this.createAttachmentMediaPillView();
                setTimeout(() => {
                  this.checkEmailAttachmentWidth();
                }, 300);
                this.cdr.detectChanges();
              }
            });
          }, 1500);
        }
      }
      if (paramObj && paramObj.replySection) {
        this.showReplySection = true;
        this.onlySendMail = false;
        this.emailForward = false;
        this.IsreplyAndEscalate = false;
        this.showEscalateview = false;
        this.showEmailView = false;
        this.onlyEscalation = false;
        this.isEmailChannel = false;
        this.selectedReplyType = 3;
        this.GetBrandAccountInformation(this._postDetailService?.postObj);
      }
      if (paramObj && paramObj.replyEmailSection) {
        this.showEmailView = true;
        this.isEmailChannel = true;
      }
      //  this.postReplyType.emit({ type: 'replySection' });
    }
  }

  checkReplyInputParams(): void {
    this.getCRMTicketStatus(this._postDetailService?.postObj?.ticketInfo?.ticketID);
    const value = this.replyService.checkReplyInputParamsSignal();
    if(value){
      this.checkReplyInputParamsSignalChanges(value);
    }
    // this.subs.add(
    //   this.replyService.checkReplyInputParams.subscribe((paramObj) => {
    //     if (
    //       paramObj &&
    //       paramObj.postObj &&
    //       paramObj.postObj.ticketInfo.ticketID ===
    //         this._postDetailService?.postObj.ticketInfo.ticketID
    //     ) {
    //       if (paramObj && paramObj.makerchticketId) {
    //         this.makercheckerticketId = paramObj.makerchticketId;
    //       }
    //       if (paramObj && paramObj.SSREMode && paramObj.SsreIntent) {
    //         this.SsreMode = paramObj.SSREMode;
    //         this.SsreIntent = paramObj.SsreIntent;
    //         this.simulationCheck = true;
    //         if (this.replyInputParams.SsreIntent === SsreIntent.Right) {
    //           this.ssreSimulationRight = true;
    //         }
    //       }
    //       if (paramObj && paramObj.onlyEscalation) {
    //         // this.showReplySection = false;```````````````
    //         this.getAutoQueueConfig(this._postDetailService?.postObj.brandInfo);
    //         this.IsreplyAndEscalate = true;
    //         this.showEscalateview = true;
    //         this.showEmailView = false;
    //         this.onlyEscalation = true;
    //         this.isEmailChannel = true;
    //         this.onlySendMail = false;
    //         this.emailForward = false;
    //         this.srCreated=paramObj.srCreated
    //         this.baseMentionObj = this._postDetailService?.postObj;
    //         this.postReplyType.emit({ type: 'Escalate' });
    //         setTimeout(() => {
    //           this.callEscalationListAPI({
    //             Brand: this._postDetailService?.postObj.brandInfo,
    //           });
    //         }, 1000);

    //         if (this.srCreated) {
    //           if (
    //             this.baseMentionObj?.ticketInfo?.srid &&
    //             this.baseMentionObj?.ticketInfo?.status == TicketStatus.Open
    //           ) {
    //             const brandInfo = this._filterService.fetchedBrandData.find(
    //               (obj) => obj.brandID == String(this.baseMentionObj.brandInfo.brandID)
    //             );
    //             if (brandInfo?.isUpdateWorkflowEnabled) {
    //               if (this.showReplySection) {
    //                 if (brandInfo.crmClassName == 'DreamSOLCRM') {
    //                   this.ticketReplyDTO.replyOptions = [
    //                     { id: 3, value: ' Reply & Close' },
    //                     { id: 5, value: ' Reply & Escalate' }
    //                   ];

    //                 } else if ((brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm') && this.crmTicketStatus) {
    //                   /* in that case showing only option whihc one allow you to user */
    //                   /* this.ticketReplyDTO.replyOptions = [
    //                     { "id": 3, "value": " Reply & Close" },
    //                     { "id": 18, "value": "Reply & Assign" },
    //                     { "id": 5, "value": " Reply & Escalate" },
    //                     { "id": 13, "value": "Reply & On Hold" },
    //                     { "id": 14, "value": "Reply & Awaiting response from Customer" }
    //                   ] */
    //                   /* in that case showing only option whihc one allow you to user */
    //                 } else {
    //                   if (this.ticketReplyDTO) this.ticketReplyDTO.replyOptions = [ { id: 5, value: ' Reply & Escalate' }];
    //                 }
    //                 this.textAreaCount[0].text = brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage;
    //                 this.replyForm.get('replyType').setValue(this.crmTicketStatus ? 3 : 5);
    //                 this.replyTypeName = this.ticketReplyDTO.replyOptions.find((obj) => obj.id == (this.crmTicketStatus ? 3: 5)).value;
    //                 this.replyTypeChange(this.crmTicketStatus ? 3 : 5);
    //               }
    //               if (this.showEscalateview && brandInfo?.crmClassName != 'TataCapitalCRM' && brandInfo?.crmClassName != 'TataUniCrm') {
    //                 this.replyForm
    //                   .get('replyEscalateNote')
    //                   .setValue(
    //                     brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage
    //                   );
    //                 if (brandInfo.typeOfCRM !== 2 && brandInfo.typeOfCRM !== 3 && brandInfo.crmClassName != 'DreamSOLCRM' && brandInfo.typeOfCRM !== 101 && brandInfo.crmClassName) {
    //                   this.replyService
    //                     .GetCrmCsdUserId(brandInfo.crmClassName)
    //                     .subscribe((res) => {
    //                       if (res.success) {
    //                         this.csdUserId = res.data.csdUserId;
    //                         this.escalateUsers = res.data.csdUserId;
    //                         this.replyForm.get('escalateUsers').setValue(res.data.csdUserId);
    //                       }
    //                     });
    //                 }
    //               }
    //             }
    //           }
    //         }
    //       }
    //       if (this.IsreplyAndEscalate && this._postDetailService.isBulk) {
    //         this.escalateMsg = true;
    //       }
    //       if (paramObj && paramObj.onlySendMail) {
    //         this.showReplySection = false;
    //         this.emailForward = paramObj?.forwardEmail;
    //         this.onlySendMail = true;
    //         this.newThreadEmail = paramObj?.newThreadEmail ? paramObj?.newThreadEmail : false;
    //         this.postReplyType.emit({ type: 'SendEmail' });
    //         if (this.emailForward && paramObj && paramObj?.postObj && paramObj.postObj?.attachmentMetadata && paramObj.postObj?.attachmentMetadata?.mediaContents && paramObj.postObj?.attachmentMetadata?.mediaContents.length){
    //           let mediaList = paramObj?.postObj?.attachmentMetadata?.mediaContents;
    //           setTimeout(() => {
    //             mediaList.forEach((res, index) => {
    //               const mediaPath = res.mediaUrl.replace(
    //                 's3.amazonaws.com/locobuzz.socialimages',
    //                 'images.locobuzz.com'
    //               );
    //               const extension = mediaPath.substr(
    //                 mediaPath.lastIndexOf('.') + 1
    //               );
    //               const obj = {
    //                 displayFileName: res.name,
    //                 mediaPath: mediaPath,
    //                 mediaType: extension == 'xlsx' ? this.mediaTypeEnum.EXCEL : res.mediaType,
    //                 forwardEmail: true
    //               }
    //               this.selectedMedia.push(obj);
    //               if ((mediaList.length - 1) == index) {
    //                 this.mediaSelectedAsync.next(this.selectedMedia);
    //                 this.cdr.detectChanges();
    //               }
    //             });
    //           }, 1500);
    //         }
    //       }
    //       if (paramObj && paramObj.replySection) {
    //         this.showReplySection = true;
    //         this.onlySendMail = false;
    //         this.emailForward = false;
    //         this.IsreplyAndEscalate = false;
    //         this.showEscalateview = false;
    //         this.showEmailView = false;
    //         this.onlyEscalation = false;
    //         this.isEmailChannel = false;
    //         this.selectedReplyType = 3;
    //         this.GetBrandAccountInformation(this._postDetailService?.postObj);
    //       }
    //       if (paramObj && paramObj.replyEmailSection) {
    //         this.showEmailView = true;
    //         this.isEmailChannel = true;
    //       }
    //       //  this.postReplyType.emit({ type: 'replySection' });
    //     }
    //   })
    // );
  }

  getTicketHtmlForEmail(): void {
    const keyObj = {
      brandInfo: this.baseMentionObj.brandInfo,
      ticketId: this.baseMentionObj.ticketInfo.ticketID,
      to: 1,
      from: 10,
      authorId: this.baseMentionObj.author.socialId,
      channel: this.baseMentionObj.channelGroup,
      TagId: this.baseMentionObj.tagID,
    };

    this.GetTagAlerEmailsApi = this.replyService
      .GetTagAlerEmails(this.baseMentionObj.brandInfo)
      .subscribe((data) => {
        if (data) {
          for (const mailObj of data) {
            if (mailObj.email) {
              if (+mailObj.recipientsType === 0) {
                if (!mailObj?.email.includes('noreply') && !mailObj?.email.includes('no-reply') && !mailObj?.email.includes('no.reply')){
                  this.emailToEmail.push(mailObj.email);
                  if (!this.isEmailAllowed(mailObj.email)) {
                    this.blackListedChips['to'].add(mailObj.email);
                    this.checkAndUpdateBlackListStatus('to');
                  }
                }
              }
              if (+mailObj.recipientsType === 1) {
                if(!mailObj?.email.includes('noreply') && !mailObj?.email.includes('no-reply') && !mailObj?.email.includes('no.reply')){
                  this.emailCCEmails.push(mailObj.email);
                  if (!this.isEmailAllowed(mailObj.email)) {
                    this.blackListedChips['cc'].add(mailObj.email);
                    this.checkAndUpdateBlackListStatus('cc');
                  }
                }
              }
              if (+mailObj.recipientsType === 2) {
                if (!mailObj?.email.includes('noreply') && !mailObj?.email.includes('no-reply') && !mailObj?.email.includes('no.reply')) {
                  this.emailBCCEmails.push(mailObj.email);
                  if (!this.isEmailAllowed(mailObj.email)) {
                    this.blackListedChips['bcc'].add(mailObj.email);
                    this.checkAndUpdateBlackListStatus('bcc');
                  }
                }
              }
              this.checkCcBccEmpty();
              this.checkEmailIDOutsideOrganizationOrNot()
            }
          }
        }
      });

    if (!this.emailForward) {
      this.ckeditorLoading = true;
      this.cdr.detectChanges();
      this.disableSendButton = true;
      this.getTicketHtmlForEmailApi = this.replyService.getTicketHtmlForEmail(keyObj).subscribe((data) => {
        if (data) {
          const domain = this.doucument.baseURI;
          const replaceText = `<a href="${this.doucument.baseURI + 'login'}"`;
          this.emailReplyText = String(data.data).replace(
            '<a href="https://social.locobuzz.com/"',
            replaceText
          );
          /* removing fontsize zero in html */
          const fontSizeZeroRegex = /font-size\s*:\s*0(px)?/i;
          if (fontSizeZeroRegex?.test(this.emailReplyText)){
            this.emailReplyText = this.emailReplyText?.replace(/font-size\s*:\s*0(px)?;?/gi, '')
          }
          /* removing fontsize zero in html */
          this.disableSendButton = false;

          const postMedia = this.baseMentionObj?.attachmentMetadata?.mediaContents || [];
          if (postMedia.length > 0 && (!this.onlySendMail || this.emailForward)) {
            const mapMedia = []
            for (const [index, item] of postMedia.entries()) {
              let mediaType = item?.mediaType;
              if ([MediaEnum?.IMAGE, MediaEnum?.VIDEO, MediaEnum.PDF, MediaEnum?.DOC, MediaEnum.EXCEL].includes(mediaType)) {
                /* if post channel instagram and media type is video so that attachment is skip */
                if ([MediaEnum?.VIDEO].includes(mediaType) && this.baseMentionObj.channelGroup === ChannelGroup.Instagram){
                  continue;
                }
                /* if post channel instagram and media type is video so that attachment is skip */
                const extension: string = item?.name?.substr(item?.name?.lastIndexOf('.') + 1);
                if (extension?.toLowerCase() == 'doc' || extension?.toLowerCase() == 'docx') mediaType = 9;
                if (extension?.toLowerCase() == 'xls' || extension?.toLowerCase() == 'xlsx') mediaType = 10;
                mapMedia.push({
                  displayFileName: item?.name,
                  mediaPath: item?.mediaUrl,
                  mediaType: mediaType,
                  isPostMedia: true,
                  mediaID: index + 1
                }) 
              }
            }
            this.selectedMedia = [...this.selectedMedia,...mapMedia];
            this.mediaSelectedAsync.next(this.selectedMedia);
            this.createAttachmentMediaPillView();
            setTimeout(() => {
              this.checkEmailAttachmentWidth();
            }, 300);
          }

          this.ckeditorLoading = false;
          this.cdr.detectChanges();
        } else {
          this.disableSendButton = false;
        }
        // alert('calling done');
      }, error => {
          this.disableSendButton = false;
        });
    }
  }
  setEscalateUsers(event: UntypedFormControl): void {
    (this.replyForm.get('escalateUsers') as UntypedFormControl).patchValue(
      event.value
    );
    if (!this.inBottomSheet) {
      // this._chatBotService.chatBotHideObs.next({ status: true });
      this._chatBotService.chatBotHideObsSignal.set({ status: true });

    }
  }

  setMaxLengthInput(): void {
    this.ticketReplyDTO.maxlength = 8000;
    if (
      ChannelType.PublicTweets === this.baseMentionObj.channelType ||
      ChannelType.Twitterbrandmention === this.baseMentionObj.channelType
    ) {
      this.ticketReplyDTO.maxlength = this.twitterAccountPremium ? 100000 : 1500;
    } else if (ChannelGroup.Instagram === this.baseMentionObj.channelGroup) {
      this.ticketReplyDTO.maxlength = 1000;
    } else if (
      ChannelGroup.GooglePlayStore === this.baseMentionObj.channelGroup
    ) {
      this.ticketReplyDTO.maxlength = 350;
    } else if (ChannelGroup.Email === this.baseMentionObj.channelGroup) {
      this.ticketReplyDTO.maxlength = 350;
    } else if (
      ChannelGroup.GoogleMyReview === this.baseMentionObj.channelGroup
    ) {
      this.ticketReplyDTO.maxlength = 350;
    } else if (
      ChannelGroup.GoogleBusinessMessages === this.baseMentionObj.channelGroup
    ) {
      this.ticketReplyDTO.maxlength = 3072;
    } else if (ChannelGroup.WhatsApp === this.baseMentionObj.channelGroup || ChannelGroup.AppStoreReviews === this.baseMentionObj.channelGroup) {
      this.ticketReplyDTO.maxlength = 4000;
    } else if (ChannelGroup.TikTok === this.baseMentionObj.channelGroup) {
      this.ticketReplyDTO.maxlength = 150;
    }
    this.maxLengthInput = this.ticketReplyDTO.maxlength;
  }

  clearInputs(): void {
    // this.replyForm.patchValue({
    //   replyText: '',
    // });
    this.clearAllTextBoxes();
    this.replyTextInitialValue = '';
    this.selectedMedia = [];
    this.replyService.selectedMedia.next({ media: [] });
    this.replyService.selectedUgcMedia.next([]);
    this.mediaGalleryService.selectedMedia = [];
    this.replyService.locobuzzIntentDetectedResult = [];
  }

  clearAllTextBoxes(): void {
    this.textAreaCount = [];
  }

  getSmartSuggestion(mention: BaseMention): void {
    const object = this._mapLocobuzzEntity.mapMention(mention);
    if (!object.title) {
      object.title = object.description;
    }
    this.autoSuggestionLoader = true;
    this.aiSuggestionLoader =false;
    this.replyAutoSuggestApi =this._ticketService.replyAutoSuggest(object).subscribe((data) => {
      this.autoSuggestionLoader = false;
      if (data.success) {
        this.locobuzzIntentDetectedResult = data.data.localIntentSuggestion;
        this.localAiApiRequestCannedResponse = data.data.localAiApiRequest;
        if (
          this.locobuzzIntentDetectedResult &&
          this.locobuzzIntentDetectedResult.length > 0
        ) {
          this.showSuggestionButton = true;
          this.replyService.locobuzzIntentDetectedResult =
            this.locobuzzIntentDetectedResult;
          this.replyService.smartSuggestionLoader.next(true);
          if (
            this.locobuzzIntentDetectedResult[0].recommended_response &&
            this.locobuzzIntentDetectedResult[0].category_name === 'Recommended'
          ) {
            // this.replyForm.patchValue({
            //   replyText: this.locobuzzIntentDetectedResult[0].recommended_response,
            // });
            // this.ReplyInputChangesCopy(this.locobuzzIntentDetectedResult[0].recommended_response);
            // this.textAreaCount[0].text = this.locobuzzIntentDetectedResult[0].recommended_response;
            // this.ReplyInputChangesModifiedCopy(this.locobuzzIntentDetectedResult[0].recommended_response, 0);
          }
        } else {
          this.showSuggestionButton = false;
          this.replyService.locobuzzIntentDetectedResult = [];
        }
      } else {
        this.autoSuggestionLoader = false;
        this.showSuggestionButton = false;
        this.replyService.smartSuggestionLoader.next(false);
        this.replyService.locobuzzIntentDetectedResult = [];
      }
    });
  }

  subscribeToObservables(): void {
    this.getCRMTicketStatus(this._postDetailService?.postObj?.ticketInfo?.ticketID);
    this.subs.add(
      this._userDetailService.updateTicketFields.subscribe((res) => {
        if (res) {
          this.getAuthorTicketMandatoryDetails();
        }
      })
    );
    this.subs.add(
      this.replyService.selectedMedia
        .pipe(filter((res) => res.section === SectionEnum.Ticket))
        .subscribe((ugcarray) => {
          if (ugcarray?.media && ugcarray?.media.length > 0) {
            let tempPostMedia = [];
            if (this.selectedMedia.some((item) => item?.isPostMedia)) {
              tempPostMedia = this.selectedMedia.filter((item) => item?.isPostMedia)
            }
            // this.mediaSelectedAsync.next(ugcarray.media);
            const allMedia = this.selectedMedia && this.selectedMedia.length ? JSON.parse(JSON.stringify(this.selectedMedia)) : [];
            let forwardEmailMedia = allMedia && allMedia.length ? allMedia.filter((res: any) => res.forwardEmail) : [];
            this.selectedMedia = [...tempPostMedia, ...ugcarray?.media];
            if (forwardEmailMedia && forwardEmailMedia.length){
              this.selectedMedia.unshift(...forwardEmailMedia);
            }
            this.mediaSelectedAsync.next(this.selectedMedia);
            this.createAttachmentMediaPillView();
            setTimeout(() => {
              this.checkEmailAttachmentWidth()
            }, 300);
          }
          this.caption = ugcarray?.caption;
        })
    );

    this.subs.add(
      this.replyService.selectedUgcMedia.subscribe((ugcarray) => {
        if (ugcarray && ugcarray.length > 0) {
          const ugclinks = ugcarray.join(' ');
          this.textAreaCount[this.textAreaCount.length - 1].text =
            this.textAreaCount[this.textAreaCount.length - 1].text + ugclinks;
          this._ngZone.runOutsideAngular(() => {
            this.textTimeout = setTimeout(() => {
              this.textAreaDiv.forEach((element, index) => {
                this.auto_grow(
                  this.textAreas['_results'][index]?.nativeElement,
                  element?.nativeElement
                );
              });
            }, 250);
          });
        }
      })
    );

    /* const value = this.replyService.selectedCannedResponseSignal();
    if (value) {
      this.selectedCannedResponseSignalChanges(value)
    } */

    // this.subs.add(
    //   this.replyService.selectedCannedResponse.subscribe((obj) => {
    //     const changeIndexTextBox: number = obj?.textBoxIndex || 0;
    //     if (
    //       obj?.openedFrom === 'postReply' &&
    //       obj?.text &&
    //       obj?.text?.trim() !== ''
    //     ) {
    //       this.cannedResponseNotSelected = false;
    //       /* this.textAreaCount = this.textAreaCount.filter((textAreaObj) => textAreaObj.id == 0); */
    //       const strUserSignature = this.emailSignatureParams.userSignatureSymbol ?
    //        this.emailSignatureParams.userSignatureSymbol + ' ' + this.emailSignatureParams.userSignature : '';
    //       this.cannedResponse.next(this.textAreaCount[changeIndexTextBox].text + obj.text);
    //       if (this.emailSignatureParams.isAppendNewLineForSignature) {
    //         this.textAreaCount[changeIndexTextBox].text = strUserSignature.trim() 
    //           ? this.textAreaCount[changeIndexTextBox].text + ' ' + obj.text.trim() + ' ' + strUserSignature.trim() 
    //           : this.textAreaCount[changeIndexTextBox].text + ' ' + obj.text.trim();
    //         requestAnimationFrame(() => {
    //           let focus = this.textAreaCount[changeIndexTextBox].text.length - strUserSignature.length - 1;
    //           this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.setSelectionRange(focus, focus);
    //           this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.focus();
    //         });

    //       } else {
    //         this.textAreaCount[changeIndexTextBox].text = strUserSignature.trim() ? strUserSignature + ' ' + this.textAreaCount[changeIndexTextBox].text + ' ' + obj.text.trim() : this.textAreaCount[changeIndexTextBox].text + ' ' + obj.text.trim();
    //         requestAnimationFrame(() => {
    //           this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.focus();
    //         });
    //       }
    //       // this.changeTextArea(this.textAreaCount);
    //       this.ReplyInputChangesModifiedCopy(this.textAreaCount[changeIndexTextBox].text, changeIndexTextBox);
    //       this._ngZone.runOutsideAngular(() => {
    //         setTimeout(() => {
    //           this.textAreaDiv.forEach((element, index) => {
    //             this.auto_grow(
    //               this.textAreas['_results'][index]?.nativeElement,
    //               element?.nativeElement
    //             );
    //           });
    //         }, 250);
    //       });
    //       // this._chatBotService.chatBotHideObs.next({ status: true });
    //       this._chatBotService.chatBotHideObsSignal.set({ status: true });

    //       if (this.baseMentionObj.channelGroup === this.channelGroup.Email) {
    //         this.emailReplyText = this.emailReplyText.concat(obj.text);
    //         // this.storedReceivedText = `${this.baseMentionObj.emailContent}<br> ${obj.text}`;
    //       }
    //     }

    //     if (this.showEscalateview && this.pageType !== PostsType.chatbot) {
    //       if (this.srCreated)
    //       {
    //         if (
    //           this.baseMentionObj?.ticketInfo?.srid &&
    //           this.baseMentionObj?.ticketInfo?.status == TicketStatus.Open
    //         ) {
    //           const brandInfo = this._filterService.fetchedBrandData.find(
    //             (obj) => obj.brandID == String(this.baseMentionObj.brandInfo.brandID)
    //           );
    //           if (brandInfo?.isUpdateWorkflowEnabled) {
    //             if (this.showReplySection) {
    //               if (brandInfo.crmClassName == 'DreamSOLCRM')
    //               {
    //                 this.ticketReplyDTO.replyOptions = [
    //                   { id: 3, value: ' Reply & Close' },
    //                   { id: 5, value: ' Reply & Escalate' }
    //                 ];

    //               } else if ((brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm') && this.crmTicketStatus) {
    //                 /* in that case showing only option whihc one allow you to user */
    //                 /* this.ticketReplyDTO.replyOptions = [
    //                   { "id": 3, "value": " Reply & Close" },
    //                   { "id": 18, "value": "Reply & Assign" },
    //                   { "id": 5, "value": " Reply & Escalate" },
    //                   { "id": 13, "value": "Reply & On Hold" },
    //                   { "id": 14, "value": "Reply & Awaiting response from Customer" }
    //                 ] */
    //                 /* in that case showing only option whihc one allow you to user */
    //               }else{
    //                 this.ticketReplyDTO.replyOptions = [
    //                   { id: 5, value: ' Reply & Escalate' },
    //                 ];
    //               }
    //               this.textAreaCount[changeIndexTextBox].text = brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage;
    //               this.replyForm.get('replyType').setValue(this.crmTicketStatus ? 3 : 5);
    //               this.replyTypeName = this.ticketReplyDTO.replyOptions.find((obj) => obj.id == (this.crmTicketStatus ? 3 : 5)).value;
    //               this.replyTypeChange(this.crmTicketStatus ? 3 : 5);
    //             }
    //             if (this.showEscalateview && brandInfo?.crmClassName != 'TataCapitalCRM' && brandInfo?.crmClassName != 'TataUniCrm')
    //             {
    //               this.replyForm
    //                 .get('replyEscalateNote')
    //                 .setValue(
    //                   brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage
    //                 );
    //             if (brandInfo.typeOfCRM !== 2 && brandInfo.typeOfCRM !== 3 && brandInfo.crmClassName !='DreamSOLCRM') {
    //               this.replyService
    //                 .GetCrmCsdUserId(brandInfo.crmClassName)
    //                 .subscribe((res) => {
    //                   if (res.success) {
    //                     this.csdUserId = res.data.csdUserId;
    //                     this.escalateUsers = res.data.csdUserId;
    //                     this.replyForm.get('escalateUsers').setValue(res.data.csdUserId);
    //                   }
    //                 });
    //             }
    //           }
    //         }
    //         }
    //       }else{
    //         this.replyForm
    //           .get('replyEscalateNote')
    //           .setValue(this.textAreaCount[changeIndexTextBox].text);
    //       }
    //     }
    //     this._ngZone.runOutsideAngular(() => {
    //       requestAnimationFrame(() => {
    //         const lastTextArea = this.textAreas?.last?.nativeElement;
    //         if (lastTextArea) {
    //           lastTextArea.focus();
    //           lastTextArea.setSelectionRange(lastTextArea.value.length, lastTextArea.value.length);
    //         }
    //       });
    //     });

    //     this.cdr.detectChanges();
    //     // this.cannedResponse.next(this.textResponse + obj);
    //     // this.textResponse = this.textResponse + ' ' + obj;
    //     // this.replyForm.patchValue({
    //     //   replyText: this.textResponse,
    //     // });
    //     // this.ReplyInputChangesCopy(this.textResponse);
    //   })
    // );

    this.subs.add(
      this.replyService.selectedSmartSuggestion.subscribe((obj) => {
        if (obj && obj.text.trim() !== '') {
          const activetextBox = this.textAreaCount.findIndex(
            (object) => object.isSelected === true
          );
          this.autoSugeestedResponse = obj.text;
          if (activetextBox > -1) {
            this.smartSuggestion.next(obj.text);
            this.textAreaCount[activetextBox].text = obj.text;
            this.ReplyInputChangesModifiedCopy(
              this.textAreaCount[activetextBox].text,
              activetextBox
            );
            // this.changeTextArea(this.textAreaCount);
          }
          this.intentId = obj.intentId;
          this.cdr.detectChanges();
        }
        // this.smartSuggestion.next(obj);
        // this.textResponse = obj;
        // this.replyForm.patchValue({
        //   replyText: this.textResponse,
        // });
        // this.ReplyInputChangesCopy(this.textResponse);
      })
    );
  }

  selectedCannedResponseSignalChanges(obj) {
    const changeIndexTextBox: number = obj?.textBoxIndex || 0;
    if (obj && obj?.text && obj?.openedFrom === 'postReply' && obj?.text?.trim() !== '' && obj.tagId == this.baseMentionObj.tagID) {
      this.cannedResponseNotSelected = false;
      /* this.textAreaCount = this.textAreaCount.filter((textAreaObj) => textAreaObj.id == 0); */
      const strUserSignature = this.emailSignatureParams.userSignatureSymbol ? this.emailSignatureParams.userSignatureSymbol + ' ' + this.emailSignatureParams.userSignature : '';
      this.cannedResponse.next(this.textAreaCount[changeIndexTextBox].text + obj.text);
      if (this.baseMentionObj.channelGroup !== ChannelGroup.TikTok) {
        /* reseting signature for add new on last */
        this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text?.replace(strUserSignature, '');
        /* reseting signature for add new on last */
        if (this.emailSignatureParams.isAppendNewLineForSignature) {
          this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text + ' ' + obj?.text?.trim();
          if (strUserSignature?.trim()?.length > 0) {
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox].text + '\n' + strUserSignature.trim();
          }
          requestAnimationFrame(() => {
            let focus = this.textAreaCount[changeIndexTextBox].text.length - strUserSignature.length - 1;
            this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.setSelectionRange(focus, focus);
            this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.focus();
          });

        } 
        else {
          this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text + ' ' + obj?.text?.trim();
          if (strUserSignature?.trim()?.length > 0) {
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox].text + ' ' + strUserSignature.trim();
          }
          requestAnimationFrame(() => {
            this.textAreas['_results'][this.textAreaCount.length - 1]?.nativeElement.focus();
          });
        }
      }
      // this.changeTextArea(this.textAreaCount);
      if (this.baseMentionObj.channelGroup === ChannelGroup.TikTok) {
        const escapedSignature = strUserSignature?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const signatureRegex = new RegExp(escapedSignature, 'g');
        this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text?.replace(signatureRegex, '')
        if ((this.textAreaCount[changeIndexTextBox]?.text?.length + obj?.text?.length) > 150) {
          if (this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature && this.emailSignatureParams.isAppendNewLineForSignature) {
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text?.trim() + ' ' + obj?.text?.trim();
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text?.substring(0, 149 - strUserSignature?.length) + '\n' + strUserSignature.trim();
          } else if (this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature && !this.emailSignatureParams.isAppendNewLineForSignature) {
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text?.trim() + ' ' + obj?.text?.trim();
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text?.substring(0, 149 - strUserSignature?.length) + ' ' + strUserSignature
          } else {
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text?.trim() + ' ' + obj?.text?.trim();
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text?.substring(0, 150);
          }
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Tiktok-150-Char-Limit'),
            },
          });
        } else {
          if (this.emailSignatureParams.isAppendNewLineForSignature) {
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text + ' ' + obj?.text?.trim() + '\n' + strUserSignature.trim();
          } else if (!this.emailSignatureParams.isAppendNewLineForSignature) {
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text + ' ' + obj?.text?.trim() + ' ' + strUserSignature.trim();
          } else {
            this.textAreaCount[changeIndexTextBox].text = this.textAreaCount[changeIndexTextBox]?.text + ' ' + obj?.text?.trim();
          }
        }
      }

      this.ReplyInputChangesModifiedCopy(this.textAreaCount[changeIndexTextBox].text, changeIndexTextBox);
      this._ngZone.runOutsideAngular(() => {
        this.textAreaTimeout = setTimeout(() => {
          this.textAreaDiv.forEach((element, index) => {
            this.auto_grow(
              this.textAreas['_results'][index]?.nativeElement,
              element?.nativeElement
            );
          });
        }, 250);
      });
      // this._chatBotService.chatBotHideObs.next({ status: true });
      this._chatBotService.chatBotHideObsSignal.set({ status: true });

      if (this.baseMentionObj.channelGroup === this.channelGroup.Email) {
        this.emailReplyText = this.emailReplyText.concat(obj.text);
        // this.storedReceivedText = `${this.baseMentionObj.emailContent}<br> ${obj.text}`;
      }

      if (obj && 'bulkMentionText' in obj && Object.keys(obj?.bulkMentionText || {}).length > 0) {
        if(Object.keys(this.bulkMentionText || {}).length > 0){
          for (const mentionTagId of Object.keys(obj?.bulkMentionText)) {
            if(this.bulkMentionText[mentionTagId] && (this.bulkMentionText[mentionTagId])?.trim()?.length > 0){
              this.bulkMentionText[mentionTagId] = `${this.bulkMentionText[mentionTagId]}-bulksplit-${obj?.bulkMentionText[mentionTagId]?.trim()}`;
            }
            else this.bulkMentionText[mentionTagId] = obj?.bulkMentionText[mentionTagId]?.trim();
          }
        }
        else this.bulkMentionText = obj.bulkMentionText;
      }

      if (obj?.mediaAttachments.length > 0) {
        const mediaList = [...this.selectedMedia, ...obj?.mediaAttachments];
        this.selectedMedia = mediaList.map((item, index) => {
          return { 
            mediaType: item?.mediaType,
            displayFileName: item?.name || item?.displayFileName,
            mediaPath: item?.url || item?.mediaPath,
            thumbUrl: item?.thumbUrl,
            mediaID: parseInt(`${item?.mediaID || 0}`),
            isCannedMedia: true
           };
        })
        this.mediaGalleryService.selectedMedia = this.selectedMedia;
        this.mediaSelectedAsync.next(this.selectedMedia);
        if (this.baseMentionObj.channelGroup === this.channelGroup.Email) {
          this.createAttachmentMediaPillView();
        }
        this.cdr.detectChanges();
      }

    }

    if (this.showEscalateview && this.pageType !== PostsType.chatbot) {
      if (this.srCreated) {
        if (
          this.baseMentionObj?.ticketInfo?.srid &&
          this.baseMentionObj?.ticketInfo?.status == TicketStatus.Open
        ) {
          const brandInfo = this._filterService.fetchedBrandData.find(
            (obj) => obj.brandID == String(this.baseMentionObj.brandInfo.brandID)
          );
          if (brandInfo?.isUpdateWorkflowEnabled) {
            if (this.showReplySection) {
              if (brandInfo.crmClassName == 'DreamSOLCRM') {
                this.ticketReplyDTO.replyOptions = [
                  { id: 3, value: ' Reply & Close' },
                  { id: 5, value: ' Reply & Escalate' }
                ];

              } else if ((brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm') && this.crmTicketStatus) {
                /* in that case showing only option whihc one allow you to user */
                /* this.ticketReplyDTO.replyOptions = [
                  { "id": 3, "value": " Reply & Close" },
                  { "id": 18, "value": "Reply & Assign" },
                  { "id": 5, "value": " Reply & Escalate" },
                  { "id": 13, "value": "Reply & On Hold" },
                  { "id": 14, "value": "Reply & Awaiting response from Customer" }
                ] */
                /* in that case showing only option whihc one allow you to user */
              } else {
                this.ticketReplyDTO.replyOptions = [
                  { id: 5, value: ' Reply & Escalate' },
                ];
              }
              this.textAreaCount[changeIndexTextBox].text = brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage;
              let customReplyStatus: number = 5;
              if ((brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm') && this.crmTicketStatus) {
                customReplyStatus = 3;
              }
              this.replyForm.get('replyType').setValue(customReplyStatus);
              this.replyTypeName = this.ticketReplyDTO.replyOptions.find((obj) => obj.id == (customReplyStatus)).value;
              this.replyTypeChange(customReplyStatus);
            }
            if (this.showEscalateview && brandInfo?.crmClassName != 'TataCapitalCRM' && brandInfo?.crmClassName != 'TataUniCrm') {
              this.replyForm
                .get('replyEscalateNote')
                .setValue(
                  brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage
                );
              if (brandInfo.typeOfCRM !== 2 && brandInfo.typeOfCRM !== 3 && brandInfo.crmClassName != 'DreamSOLCRM') {
                this.GetCrmCsdUserId2Api = this.replyService
                  .GetCrmCsdUserId(brandInfo.crmClassName)
                  .subscribe((res) => {
                    if (res.success) {
                      this.csdUserId = res.data.csdUserId;
                      this.escalateUsers = res.data.csdUserId;
                      this.replyForm.get('escalateUsers').setValue(res.data.csdUserId);
                    }
                  });
              }
            }
          }
        }
      } else {
        this.replyForm
          .get('replyEscalateNote')
          .setValue(this.textAreaCount[changeIndexTextBox].text);
      }
    }

    this._ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        if (obj.tagId == this.baseMentionObj.tagID){
          const lastTextArea = this.textAreas?.last?.nativeElement;
          if (lastTextArea) {
            lastTextArea.focus();
            lastTextArea.setSelectionRange(lastTextArea.value.length, lastTextArea.value.length);
          }
        }
      });
    });

    this.cdr.detectChanges();
  }

  removeSelectedMedia(ugcMention: UgcMention): void {
    if (ugcMention) {
      this.selectedMedia = this.selectedMedia.filter((obj) => {
        return obj.mediaID !== ugcMention.mediaID;
      });
      this.mediaSelectedAsync.next(this.selectedMedia);
      this.createAttachmentMediaPillView();
      setTimeout(() => {
        this.checkEmailAttachmentWidth()
      }, 300);
      this.mediaGalleryService.selectedMedia = this.selectedMedia;
      if(this.selectedMedia && !this.selectedMedia.length){
        this.caption = '';
      }
    }
  }

  buildCustomInputBySource(
    basemention: BaseMention,
    IsNPSAutomationOn: boolean,
    feedbackForm?: number
  ): void {
    // let isSurveyFeedbackEnabled = this.surveyFormSetting?.isSurveyFeedbackEnabled;
    // let isSurveyFeedback = this.surveyFormSetting?.feedBackType;
    // let isSurveyFormUrl = this.surveyFormSetting?.formURL;

    if (
      basemention?.channelGroup === ChannelGroup.Facebook ||
      basemention?.channelGroup === ChannelGroup.Twitter ||
      basemention?.channelGroup === ChannelGroup.Email ||
      basemention?.channelGroup === ChannelGroup.WhatsApp ||
      (basemention?.channelGroup === ChannelGroup.Instagram && (basemention?.channelType === ChannelType.InstagramMessages || (feedbackForm == 3 && !basemention.isDMSent && basemention.canReplyPrivately))) ||
      basemention?.channelGroup === ChannelGroup.WebsiteChatBot
    ) {
      const currentBrand = this._filterService.fetchedBrandData.filter(
        (obj) => Number(obj.brandID) === basemention.brandInfo.brandID
      );

      if (IsNPSAutomationOn && !this.showEscalateview) {
        if (
          basemention.ssreMode === SSREMode.Simulation &&
          basemention.ssreIntent === SsreIntent.Right
        ) {
          this.replyLinkCheckbox.push({
            name: 'Send Feedback',
            socialId: basemention.socialID,
            replyLinkId: Replylinks.SendFeedback,
            checked: true,
            disabled: feedbackForm == 0 ? true : false,
            feedbackForm: feedbackForm
          });
          // this.replyLinkCheckbox.push({
          //   name: 'Send Survey Form',
          //   socialId: basemention.socialID,
          //   channelType: basemention.channelType,
          //   replyLinkId: Replylinks.SendSurveyForm,
          //   checked: isSurveyFeedbackEnabled && (isSurveyFeedback == 1 || isSurveyFeedback == 3) ? true : false,
          //   disabled: isSurveyFeedbackEnabled ? false : true,
          //   feedbackForm: isSurveyFormUrl
          // });
        } else {
          this.replyLinkCheckbox.push({
            name: 'Send Feedback',
            socialId: basemention.socialID,
            channelType: basemention.channelType,
            replyLinkId: Replylinks.SendFeedback,
            checked: true,
            disabled: feedbackForm == 0 ? true : false,
            feedbackForm: feedbackForm
          });
          // this.replyLinkCheckbox.push({
          //   name: 'Send Survey Form',
          //   socialId: basemention.socialID,
          //   channelType: basemention.channelType,
          //   replyLinkId: Replylinks.SendSurveyForm,
          //   checked: isSurveyFeedbackEnabled && (isSurveyFeedback == 1 || isSurveyFeedback == 3) ? true : false,
          //   disabled: isSurveyFeedbackEnabled ? false : true,
          //   feedbackForm: isSurveyFormUrl
          // });
        }
        this.sendFeedBack=true
      } else {
        if (
          basemention.ssreMode === SSREMode.Simulation &&
          basemention.ssreIntent === SsreIntent.Right &&
          !this.showEscalateview
        ) {
          this.replyLinkCheckbox.push({
            name: 'Send Feedback',
            socialId: basemention.socialID,
            replyLinkId: Replylinks.SendFeedback,
            checked: currentBrand[0].isFeedbackEnabled && (feedbackForm == 1 || feedbackForm == 3) ? true : false,
            disabled: !currentBrand[0].isFeedbackEnabled,
            feedbackForm: feedbackForm
          });
          // this.replyLinkCheckbox.push({
          //   name: 'Send Survey Form',
          //   socialId: basemention.socialID,
          //   channelType: basemention.channelType,
          //   replyLinkId: Replylinks.SendSurveyForm,
          //   checked: isSurveyFeedbackEnabled && (isSurveyFeedback == 1 || isSurveyFeedback == 3) ? true : false,
          //   disabled: isSurveyFeedbackEnabled ? false : true,
          //   feedbackForm: isSurveyFormUrl
          // });
          this.sendFeedBack = true
        } else {
          if (!this.showEscalateview) {
            if(this.baseMentionObj?.channelGroup==ChannelGroup.Facebook)
            {
              if (this.baseMentionObj?.channelType == ChannelType.FBMessages || (feedbackForm == 3 && !basemention.isDMSent && basemention.canReplyPrivately))
              {
                this.replyLinkCheckbox.push({
                  name: 'Send Feedback',
                  socialId: basemention.socialID,
                  channelType: basemention.channelType,
                  replyLinkId: Replylinks.SendFeedback,
                  checked: currentBrand[0].isFeedbackEnabled && (feedbackForm == 1 || feedbackForm == 3) ? true : false,
                  disabled: !currentBrand[0].isFeedbackEnabled,
                  feedbackForm: feedbackForm
                });
                // this.replyLinkCheckbox.push({
                //   name: 'Send Survey Form',
                //   socialId: basemention.socialID,
                //   channelType: basemention.channelType,
                //   replyLinkId: Replylinks.SendSurveyForm,
                //   checked: isSurveyFeedbackEnabled && (isSurveyFeedback == 1 || isSurveyFeedback == 3) ? true : false,
                //   disabled: isSurveyFeedbackEnabled ? false : true,
                //   feedbackForm: isSurveyFormUrl
                // });
              }
            }else{
              this.replyLinkCheckbox.push({
                name: 'Send Feedback',
                socialId: basemention.socialID,
                channelType: basemention.channelType,
                replyLinkId: Replylinks.SendFeedback,
                checked: currentBrand[0].isFeedbackEnabled && (feedbackForm == 1 || feedbackForm == 3) ? true : false,
                disabled: !currentBrand[0].isFeedbackEnabled,
                feedbackForm: feedbackForm
              });
              // this.replyLinkCheckbox.push({
              //   name: 'Send Survey Form',
              //   socialId: basemention.socialID,
              //   channelType: basemention.channelType,
              //   replyLinkId: Replylinks.SendSurveyForm,
              //   checked: isSurveyFeedbackEnabled && (isSurveyFeedback == 1 || isSurveyFeedback == 3) ? true : false,
              //   disabled: isSurveyFeedbackEnabled ? false : true,
              //   feedbackForm: isSurveyFormUrl
              // });
            }
            this.sendFeedBack = true
          }
        }
      }
    }

    if (
      !this.showEscalateview &&
      (basemention.channelType === ChannelType.Twitterbrandmention ||
        basemention.channelType === ChannelType.PublicTweets)
    ) {
      this.replyLinkCheckbox.push({
        name: 'Send as DM',
        socialId: basemention.socialID,
        channelType: basemention.channelType,
        replyScreenName: basemention.author.screenname,
        replyLinkId: Replylinks.SendAsDM,
        checked: false,
        disabled: false,
      });

      this.replyLinkCheckbox.push({
        name: 'Send DM Link',
        socialId: basemention.socialID,
        channelType: basemention.channelType,
        replyScreenName: basemention.author.screenname,
        replyLinkId: Replylinks.SendDMLink,
        checked: false,
        disabled: false,
      });
    }

    if (!this._postDetailService.isBulk) {
      this.replyLinkCheckbox.push({
        name: 'Send to Groups',
        socialId: basemention.socialID,
        replyLinkId: Replylinks.SendToGroups,
        checked: false,
        disabled: false,
      });
    }

    // if (
    //   basemention.channelGroup === ChannelGroup.Email &&
    //   !this.showEscalateview
    // ) {
    //   this.isEmailChannel = true;
    //   this.replyLinkCheckbox.push({
    //     name: 'Add previous mail trail',
    //     socialId: basemention.socialID,
    //     replyLinkId: Replylinks.PreviousMailTrail,
    //     checked: false,
    //     disabled: false,
    //     tooltip:
    //       'Add previous mail trail setting is enabled in channel configuration',
    //   });
    // }

    if (
      (basemention.channelGroup == ChannelGroup.Facebook &&
        basemention.channelType === ChannelType.FBPageUser) ||
      basemention.channelType === ChannelType.FBComments ||
      basemention.channelType === ChannelType.InstagramComments
    ) {
      if (
        basemention.channelType === ChannelType.InstagramComments &&
        basemention.instagramPostType != 1
      ) {
      } else {
        this.replyLinkCheckbox.push({
          name: 'Send as Private Message',
          socialId: basemention.socialID,
          channelType: basemention.channelType,
          replyScreenName: basemention.author.screenname,
          replyLinkId: Replylinks.SendAsDM,
          checked: false,
          disabled:
            basemention.isDMSent || !basemention.canReplyPrivately
              ? true
              : false,
        });
      }
    }

    this.brandList = this._filterService.fetchedBrandData;
    let isEnableReplyApprovalWorkFlow = false;
    if (this.brandList) {
      const currentBrandObj = this.brandList.filter((obj) => {
        return +obj.brandID === +basemention.brandInfo.brandID;
      });
      this.currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;

      if (this.currentBrand) {
        if (this.currentBrand.isEnableReplyApprovalWorkFlow) {
          isEnableReplyApprovalWorkFlow = true;
        }
      }
    }

    if (
      this.currentUser.data.user.role === UserRoleEnum.Agent &&
      isEnableReplyApprovalWorkFlow &&
      !this.currentUser.data.user.agentWorkFlowEnabled &&
      !basemention.ticketInfo.ticketAgentWorkFlowEnabled
    ) {
      this.replyLinkCheckbox.push({
        name: 'Send For Approval',
        socialId: basemention.socialID,
        replyLinkId: Replylinks.SendForApproval,
        checked: false,
        disabled: false,
      });
    }

    if (this.onlySendMail) {
      this.replyLinkCheckbox = [
        {
          name: 'Send to Groups',
          socialId: basemention.socialID,
          replyLinkId: Replylinks.SendToGroups,
          checked: false,
          disabled: false,
        },
      ];
    }
    this.checkPreviousMailStatus();
  }

  GetBrandAccountInformationForForwardEmail(basemention: BaseMention):void{
    const obj = {
      Brand: basemention.brandInfo,
      ChannelGroup: basemention.channelGroup,
    };
    this.handlesLoader = true;
    this.GetBrandAccountInformationApi =this.replyService.GetBrandAccountInformation(obj).subscribe((data) => {
      this.handlesLoader = false;
      if (data && data.length > 0) {
        const allBrandData = data.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.isTokenExpired === false &&
            obj.active === true
          );
        });
        allBrandData.filter((obj) => {
          if (basemention.channelGroup === ChannelGroup.Email) {
            this.ticketReplyDTO.handleNames.push({
              handleId: obj.socialID,
              handleName: obj.userName,
              accountId: obj.accountID,
              socialId: obj.socialID,
            });
          }
        });
      if (
        this.ticketReplyDTO.handleNames &&
        this.ticketReplyDTO.handleNames.length > 0
      ) {
        const isExist = this.ticketReplyDTO.handleNames.find((res: any) => res.accountId === +basemention.settingID);
        if (isExist){
          this.replyForm
            .get('replyHandler')
            .setValue(isExist?.socialId);
        }
      }
      }
    }, error => {
      this.handlesLoader = false;
    });
  }

  GetBrandAccountInformation(basemention: BaseMention): void {
    const obj = {
      Brand: basemention.brandInfo,
      ChannelGroup: basemention.channelGroup,
    };

    this.getCRMTicketStatus(this._postDetailService?.postObj?.ticketInfo?.ticketID);
    // call api to get socialaccountlist
    if (!this.showEscalateview) {
      this.handlesLoader = true;
      this.GetBrandAccountInformation2Api =this.replyService.GetBrandAccountInformation(obj).subscribe((data) => {
        // console.log(data);
        // this.zone.run(() => {
        this.handlesLoader = false;
        this.objBrandSocialAcount = data;
        this.checkOptions(this._postDetailService?.postObj);
      });
      // Get AgentListwith ticket Count
      this.getAutoQueueConfig(obj.Brand);

      if (this.baseMentionObj?.channelGroup == ChannelGroup.Email) {
        this.GetEmailOutgoingSetting();
      }
      if (this.onlySendMail) {
        if (this.baseMentionObj.ccMailList) {
          this.emailCCEmails = this.baseMentionObj.ccMailList;
        }
        if (this.baseMentionObj.bccMailList) {
          this.emailBCCEmails = this.baseMentionObj.bccMailList;
        }
        this.removeReplyHandleFromCcOrBcc();
        this.checkCcBccEmpty();
      }
    }

    // if (this.showEscalateview) {
    //   this.callEscalationListAPI(obj);
    // }

    // Get Mail Group
    obj.Brand.categoryGroupID = +this._filterService.fetchedBrandData.find(
      (object) => {
        return +object.brandID === obj.Brand.brandID;
      }
    ).categoryGroupID;

    // this.getAutoQueueConfig(obj.Brand);
  }

  callEscalationListAPI(obj, isRefresh?:boolean): void {
    this.userListLoading = true;
    const payload_update = {
      filters: obj.Brand,
      isrefresh: isRefresh || false,
    }
    this.GetUsersWithTicketCountApi = this.replyService.GetUsersWithTicketCount(payload_update).subscribe((data) => {
      // console.log(data);
      this.modAgentList = data;
      // console.log('AgentList', this.modAgentList);
      this.ticketReplyDTO.agentUsersList = data;
      this.userListLoading = false;
      this.getAutoQueueConfig(obj.Brand, true);
      this.buildAgentUserList();
    });
  }

  onChangeTo(event,type?:string){
    let allGroupEmailList = [];
    if (event && event.data !== '') {
      this.inputRecvd[type] = true;
      this.cdr.detectChanges();
    }
    else {
      this.inputRecvd[type] = false;
      this.cdr.detectChanges();
    }
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement && inputElement?.value ? inputElement.value.trim() : '';
    if(value.length){
      const filterValue = value.toLowerCase();
      if (this.emailGroupList && this.emailGroupList.length){
        this.emailGroupList.map(res => {

          const email_to = res.email_to.split(',');
          if (email_to && email_to.length) {
            email_to.forEach((obj) => {
              if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply') && !allGroupEmailList.includes(obj)) {
                allGroupEmailList.push(obj);
              }
            });
          }

          const email_cc = res.email_cc.split(',');
          if (email_cc && email_cc.length) {
            email_cc.forEach((obj) => {
              if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply') && !allGroupEmailList.includes(obj)) {
                allGroupEmailList.push(obj);
              }
            });
          }

          const bccEmail = res.email_bcc.split(',');
          if (bccEmail && bccEmail.length) {
            bccEmail.forEach((obj) => {
              if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply') && !allGroupEmailList.includes(obj)) {
                allGroupEmailList.push(obj);
              }
            });
          }
        });
        this.emailGroupSuggestList = this.emailGroupList.filter(email => email.groupName.toLowerCase().includes(filterValue));
        this.allGroupEmailList = allGroupEmailList.filter(email => email.toLowerCase().includes(filterValue));
      }
    } else {
      this.emailGroupSuggestList = [];
      this.allGroupEmailList = [];
    }
  }

  onClickInput(){
    this.emailGroupSuggestList = [];
  }

  getEmailGroups(brandObj: BrandInfo): void {
    const brandData= this._filterService.fetchedBrandData.find((obj)=>obj?.brandID == brandObj.brandID)
    brandObj.categoryGroupID = Number(brandData.categoryGroupID);
    this.GetMailGroupApi = this.replyService.GetMailGroup(brandObj).subscribe((data) => {
      // console.log(data);
      this.ticketReplyDTO.groupEmailList = [];
      this.customGroupEmailList = data;
      this.emailGroupList = data;
      this.ticketReplyDTO.groupEmailList = data;
      if (this.customGroupEmailList && this.customGroupEmailList.length > 0) {
      } else {
        this.emailPlaceHolder = this.translate.instant('Email-group-not-found');
      }
      this.getAllInternalEmailIDs();
      this.checkEmailIDOutsideOrganizationOrNot()
    });
  }

  getAutoQueueConfig(obj,dontCallMakerChecker?:boolean): void {
    this.getAutoQueueingConfigApi = this.replyService.getAutoQueueingConfig(obj).subscribe((data) => {
      // console.log(data);
      this.ticketReplyDTO.autoQueueConfig = data;
      this.cdr.detectChanges();
      // this.replyService?.autoQueueConfigUpdate.next({BrandQueueData:this.ticketReplyDTO.autoQueueConfig,tagID:this.baseMentionObj?.tagID});
      // call maker checker data if ticket id present in dialogue data
      if (this.makercheckerticketId && !dontCallMakerChecker) {
        this.getMakerCheckerData();
      }
      if (this.simulationCheck) {
        this.fillSSRELiveData();
      }
    });
  }

  getMakerCheckerData(): void {
    const makercheckerObj = {
      BrandInfo: {
        BrandId: this.baseMentionObj.brandInfo.brandID,
        BrandName: this.baseMentionObj.brandInfo.brandName,
      },
      TicketId: this.makercheckerticketId,
    };

    this.GetMakerCheckerDataApi = this.replyService.GetMakerCheckerData(makercheckerObj).subscribe((data) => {
      // console.log(data);
      // if (this.currentUser?.data?.user?.role == UserRoleEnum?.SupervisorAgent || this.currentUser?.data?.user?.role == UserRoleEnum?.TeamLead) {
      //   this.ticketReplyDTO.replyOptions = this.ticketReplyDTO.replyOptions?.filter(obj => obj.id != 5);
      // }
      this.ticketReplyDTO.makerCheckerData = data;
      this._ngZone.runOutsideAngular(() => {
        this.replyTimeout = setTimeout(() => {
          this.setReplyWindow();
          console.log('setTimeout called');
        }, 0);
      });
      // call maker checker data if ticket id present in dialogue data
    });
  }

  buildAgentUserList(): void {
    this.ticketReplyDTO.agentUsersList = [];
    this.ticketReplyDTO.agentUsersList = this.modAgentList;
    this.customAgentList = [];
    if (+this.currentUser.data.user.role === UserRoleEnum.CustomerCare) {
      this.customAgentList = this.ticketReplyDTO.agentUsersList.filter(
        (obj) => {
          return obj.userRole === UserRoleEnum.BrandAccount;
        }
      );
    } else if (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount) {
      this.customAgentList = this.ticketReplyDTO.agentUsersList.filter(
        (obj) => {
          return obj.userRole === UserRoleEnum.CustomerCare;
        }
      );
    } else {
      if (
        this.ticketReplyDTO.agentUsersList &&
        this.ticketReplyDTO.agentUsersList.length > 0
      ) {
        this.customAgentList = this.ticketReplyDTO.agentUsersList.filter(
          (obj) => {
            if (this.currentBrand.isBrandworkFlowEnabled) {
              return obj.userRole === UserRoleEnum.CustomerCare;
            } else {
              return (
                obj.userRole === UserRoleEnum.BrandAccount ||
                obj.userRole === UserRoleEnum.CustomerCare
              );
            }
          }
        );
      }
    }
    this.ticketReplyDTO.agentUsersList = this.customAgentList;
    this.checkIfBrandReplyAndReject();
    this.customAgentListAsync.next(this.customAgentList);
    this.cdr.detectChanges();
  }

  checkOptions(basemention: BaseMention): void {
    this._ngZone.runOutsideAngular(() => {
     this.baseTimeout = setTimeout(() => {}, 200);
    });
    const agentList = this.ticketReplyDTO.agentUsersList;
    this.ticketReplyDTO = {};
    this.ticketReplyDTO.isCSDUser = false;
    this.ticketReplyDTO.isBrandUser = false;
    this.ticketReplyDTO.isBrandworkFlowEnabled = false;
    this.ticketReplyDTO.showCannedResponse = true;
    if (agentList && agentList.length > 0) {
      this.ticketReplyDTO.agentUsersList = agentList;
    }

    if (
      basemention?.channelGroup === ChannelGroup.WhatsApp ||
      basemention?.channelType === ChannelType.FBMessages ||
      basemention?.channelType === ChannelType.InstagramMessages
    ) {
      const utcMoment = moment.utc().subtract(-24, 'hours');
      const mentiondate = new Date(basemention.mentionTime);
      const mentiontime = moment(mentiondate);
      if (basemention.channelGroup === ChannelGroup.WhatsApp) {
        // let LastmentionTime = this._ticketService.calculateTicketTimes(this._postDetailService?.postObj);
        // LastmentionTime = AccountWrapper.GetWhatsappLastMentionTime(Model.BrandInfo, objsocialauthor.SocialID);
        // if (LastmentionTime < DateTime.UtcNow.AddHours(-24))
        // {
        //     disableReplyTextBox = "style=pointer-events:none;";
        //     NoReplyTextStyle = "display:block;";
        //     hideCannedResponse = "display:none;";
        // }
        if (mentiontime < utcMoment) {
          this.ticketReplyDTO.showCannedResponse = false;
        }

        this.ticketReplyDTO.apiWarningMessage =
          this.translate.instant('Message-received-than-24');
      } else if (basemention.channelType === ChannelType.FBMessages) {
        // if (LastmentionTime < DateTime.UtcNow.AddHours(-24))
        // {
        //     disableReplyTextBox = "style=pointer-events:none;";
        //     NoReplyTextStyle = "display:block;";
        //     hideCannedResponse = "display:none;";
        // }
        if (mentiontime < utcMoment) {
          this.ticketReplyDTO.showCannedResponse = false;
        }

        this.ticketReplyDTO.apiWarningMessage =
          this.translate.instant('Message-from-received-more-then-7');
      } else if (basemention.channelType === ChannelType.InstagramMessages) {
        // if (LastmentionTime < DateTime.UtcNow.AddHours(-24))
        // {
        //     disableReplyTextBox = "style=pointer-events:none;";
        //     NoReplyTextStyle = "display:block;";
        //     hideCannedResponse = "display:none;";
        // }
        if (mentiontime < utcMoment) {
          this.ticketReplyDTO.showCannedResponse = false;
        }

        this.ticketReplyDTO.apiWarningMessage =
          this.translate.instant('Message-from-received-more-then-7-Instagram');
      }
    }

    if (basemention.channelType === ChannelType.DirectMessages) {
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandSocialAcount = this.objBrandSocialAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.active &&
            obj.isPrimary &&
            obj.socialID === basemention.inReplyToUserID
          );
        });
      }
    } else if (basemention.channelGroup === ChannelGroup.Instagram) {
      // TicketInstagram ticketInstagram = (TicketInstagram)Model;
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandFBInstaAcount = this.objBrandSocialAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.active &&
            (obj.isPrimary || obj.isFacebookMigration)
          );
        });
      }

      if (
        basemention.instaAccountID > 0 &&
        this.objBrandSocialAcount !== null &&
        this.objBrandSocialAcount.length > 0
      ) {
        this.objBrandSocialAcount = this.objBrandSocialAcount.filter((obj) => {
          return obj.accountID === basemention.instaAccountID;
        });
      }
    } else if (basemention.channelGroup === ChannelGroup.WhatsApp) {
      this.objBrandFBInstaAcount = this.objBrandSocialAcount;
      if (
        basemention.whatsAppAccountID > 0 &&
        this.objBrandSocialAcount !== null &&
        this.objBrandSocialAcount.length > 0
      ) {
        this.objBrandSocialAcount = this.objBrandSocialAcount.filter((obj) => {
          return obj.accountID === basemention.whatsAppAccountID;
        });
      }
    } else if (basemention.channelGroup === ChannelGroup.GooglePlayStore) {
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandSocialAcount = this.objBrandSocialAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.active &&
            obj.isPrimary
          );
        });

        this.objBrandSocialAcount = this.objBrandSocialAcount.filter((obj) => {
          return obj.accountID === +basemention.appID;
        });
      }
    } else if (basemention.channelGroup === ChannelGroup.Facebook) {
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandSocialAcount = this.objBrandSocialAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.active &&
            obj.isPrimary
          );
        });
      }

      if (
        basemention.fbPageID > 0 &&
        this.objBrandSocialAcount != null &&
        this.objBrandSocialAcount.length > 0
      ) {
        this.objBrandSocialAcount = this.objBrandSocialAcount.filter(
          (x) => x.socialID === String(basemention.fbPageID)
        );
        if (
          this.objBrandSocialAcount == null ||
          this.objBrandSocialAcount.length === 0
        ) {
          // this.objBrandSocialAcount = BrandAccountWrapper.GetBrandAccountInformationForFBLocation(Model.BrandInfo,
          // ticketFaceboook.FBPageID).Where(n => n.ChannelGroup == Model.ChannelGroup && n.Active == true
          // && n.IsPrimary == true && n.SocialID == Convert.ToString(ticketFaceboook.FBPageID)).ToList();
        }
      }
    } else if (basemention.channelGroup === ChannelGroup.WebsiteChatBot) {
      this.objBrandFBInstaAcount = this.objBrandSocialAcount;
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandSocialAcount = this.objBrandFBInstaAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.active &&
            (obj.isPrimary || obj.isFacebookMigration)
          );
        });
      }
    } else if (basemention.channelGroup === ChannelGroup.LinkedIn) {
      this.objBrandFBInstaAcount = this.objBrandSocialAcount;
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandSocialAcount = this.objBrandFBInstaAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.accountID === +basemention.inReplyToStatusId
          );
        });
      }
    } else if (basemention.channelGroup === ChannelGroup.Email) {
      this.objBrandFBInstaAcount = this.objBrandSocialAcount;
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandSocialAcount = this.objBrandFBInstaAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.accountID === +basemention.settingID &&
            obj.isTokenExpired === false &&
            obj.active === true
          );
        });
        let socialAccount;
        if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
          socialAccount = this.objBrandSocialAcount[0];
        }
        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.name === 'Add previous mail trail') {
            obj.checked = true;
            obj.disabled = socialAccount
              ? socialAccount.isEnableAdddPrevMailTrail
              : false;
            !socialAccount.isEnableAdddPrevMailTrail ? (obj.tooltip = '') : '';
          }
        });
        this.checkPreviousMailStatus();
      }
    }
    // for app store use ///
    else if (basemention.channelGroup === ChannelGroup.AppStoreReviews) {
      this.objBrandFBInstaAcount = this.objBrandSocialAcount;
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandSocialAcount = this.objBrandFBInstaAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.accountID === +basemention.settingID &&
            obj.isTokenExpired === false &&
            obj.active === true
          );
        });
      }
    }
     else {
      if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
        this.objBrandSocialAcount = this.objBrandSocialAcount.filter((obj) => {
          return (
            obj.channelGroup === basemention.channelGroup &&
            obj.active &&
            obj.isPrimary
          );
        });
      }
    }

    if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
      this.objBrandSocialAcount = this.objBrandSocialAcount.filter((obj) => {
        return (
          obj.channelGroup === basemention.channelGroup &&
          !obj.isTokenExpired
        );
      });
    }

    if (+this.currentUser.data.user.role === UserRoleEnum.CustomerCare) {
      this.ticketReplyDTO.isCSDUser = true;
    } else if (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount) {
      this.ticketReplyDTO.isBrandUser = true;
    }
    this.ticketReplyDTO.maxlength = 8000;
    if (
      ChannelType.PublicTweets === basemention.channelType ||
      ChannelType.Twitterbrandmention === basemention.channelType
    ) {
      this.ticketReplyDTO.maxlength = 1500;
    } else if (ChannelGroup.Instagram === basemention.channelGroup) {
      this.ticketReplyDTO.maxlength = 1000;
    } else if (ChannelGroup.GooglePlayStore === basemention.channelGroup) {
      this.ticketReplyDTO.maxlength = 350;
    } else if (ChannelGroup.Email === basemention.channelGroup) {
      this.ticketReplyDTO.maxlength = 350;
    } else if (ChannelGroup.GoogleMyReview === basemention.channelGroup) {
      this.ticketReplyDTO.maxlength = 350;
    } else if (ChannelGroup.GoogleBusinessMessages === basemention.channelGroup) {
      this.ticketReplyDTO.maxlength = 3072;
    } else if (ChannelGroup.WhatsApp === basemention.channelGroup) {
      this.ticketReplyDTO.maxlength = 4000;
    } else if (ChannelGroup.TikTok === basemention.channelGroup) {
      this.ticketReplyDTO.maxlength = 150;
    }
    this.maxLengthInput = this.ticketReplyDTO.maxlength;
    this.brandList = this._filterService.fetchedBrandData;

    if (this.brandList) {
      const currentBrandObj = this.brandList.filter((obj) => {
        return +obj.brandID === +basemention?.brandInfo?.brandID;
      });
      this.currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;

      if (this.currentBrand) {
        if (this.currentBrand.isBrandworkFlowEnabled) {
          this.ticketReplyDTO.isBrandworkFlowEnabled = true;
        }
        if (this.currentBrand.isEnableReplyApprovalWorkFlow) {
          this.ticketReplyDTO.isEnableReplyApprovalWorkFlow = true;
        }

        if (this.currentBrand.isSSREEnable) {
          this.ticketReplyDTO.isSSREEnabled = true;
        }
        if (this.currentBrand.isWorkflowEnabled) {
          this.ticketReplyDTO.isWorkflowEnabled = true;
        }
        if (this.currentBrand.isCSDApprove) {
          this.ticketReplyDTO.isCSDApprove = true;
        }

        if (this.currentBrand.isCSDReject) {
          this.ticketReplyDTO.isCSDReject = true;
        }
      }
    }
    const replyOptions = new ReplyOptions();

    if (!this.ticketReplyDTO.isCSDUser && !this.ticketReplyDTO.isBrandUser) {
      if (
        basemention.ticketInfo.status ===
          TicketStatus.PendingwithCSDWithNewMention ||
        basemention.ticketInfo.status ===
          TicketStatus.OnHoldCSDWithNewMention ||
        basemention.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
        basemention.ticketInfo.status ===
          TicketStatus.RejectedByBrandWithNewMention ||
        basemention.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention
      ) {
        // <option value="15" data-id="15">Reply</option>
        // <option value="16" data-id="16">Acknowledge</option>
        // <option value="6" data-id="6">Create Ticket</option>
        const dropdown = replyOptions.replyOption.filter((obj) => {
          return obj.id === 15;
        });
        this.ticketReplyDTO.replyOptions = [];
        this.ticketReplyDTO.replyOptions = dropdown;
        this.replyForm.get('replyType').setValue(15);
        this.replyTypeName = this.ticketReplyDTO.replyOptions.find((obj) => obj.id == 15).value;
      } else if (
        basemention.ticketInfo.status !== TicketStatus.PendingwithCSD &&
        basemention.ticketInfo.status !== TicketStatus.PendingWithBrand &&
        basemention.ticketInfo.status !== TicketStatus.OnHoldCSD &&
        basemention.ticketInfo.status !== TicketStatus.OnHoldBrand
      ) {
        if (
          basemention.ticketInfo.status === TicketStatus.RejectedByBrand &&
          this.ticketReplyDTO.isBrandworkFlowEnabled
        ) {
        } else {
          if (
            basemention.channelGroup === ChannelGroup.Facebook ||
            basemention.channelGroup === ChannelGroup.Twitter ||
            basemention.channelGroup === ChannelGroup.Instagram ||
            basemention.channelGroup === ChannelGroup.LinkedIn ||
            basemention.channelGroup === ChannelGroup.GooglePlayStore ||
            basemention.channelGroup === ChannelGroup.Youtube ||
            basemention.channelGroup === ChannelGroup.Email ||
            basemention.channelGroup === ChannelGroup.GoogleMyReview ||
            basemention.channelGroup === ChannelGroup.GoogleBusinessMessages ||
            basemention.channelGroup === ChannelGroup.TikTok ||
            basemention.channelGroup === ChannelGroup.WhatsApp ||
            basemention.channelGroup === ChannelGroup.WebsiteChatBot || 
            basemention.channelGroup === ChannelGroup.Sitejabber || 
            basemention.channelGroup === ChannelGroup.Telegram || 
            basemention.channelGroup === ChannelGroup.AppStoreReviews ||
            basemention.channelGroup === ChannelGroup.Pantip
          ) {
            if (
              this.pageType === PostsType.TicketHistory &&
              this._postDetailService.isBulk
            ) {
              const dropdown = replyOptions.replyOption.filter((obj) => {
                return obj.id === 3 || obj.id === 13;
              });
              this.ticketReplyDTO.replyOptions = [];
              this.ticketReplyDTO.replyOptions = dropdown;
            } else {
              const dropdown = replyOptions.replyOption.filter((obj) => {
                return (
                  obj.id === 3 || obj.id === 5 || obj.id === 13 || obj.id === 14 || obj.id === 18
                );
              });
              this.ticketReplyDTO.replyOptions = [];
              this.ticketReplyDTO.replyOptions = dropdown;
            }

            // setTimeout(() => {
            //   this.selectedReplyType = 3;
            // }, 1000);
            let tempReplyType = this.currentUser?.data?.user?.categoryId == 1905 ? 14:3;
            this.replyForm.get('replyType').setValue(tempReplyType);
            this.replyTypeName = this.ticketReplyDTO.replyOptions.find((obj) => obj.id == tempReplyType).value;

            // <optgroup label="Reply">
            //     <option value="3" data-id="3" selected="selected">Reply & Close</option>
            //     <option value="5" data-id="5">Reply & Escalate</option>
            //     <option value="13" data-id="13">Reply & On Hold</option>
            //     <option value="14" data-id="14">Reply & Awaiting response from Customer</option>
            // </optgroup>
            // <option value="6" data-id="6">Create Ticket</option>
            // <option value="9" data-id="9">Attach Ticket</option>
          }

          // <option value="4" data-id="4">Escalate</option>
        }
      }
    } else if (this.ticketReplyDTO.isCSDUser) {
      if (this.ticketReplyDTO.isBrandworkFlowEnabled) {
        if (this.ticketReplyDTO.isCSDApprove) {
          // <option value;='7' data - id;='7'> Approve < /option>;
        }
        if (this.ticketReplyDTO.isCSDReject) {
          // <option value;='8' data - id;='8'> Reject < /option>;
        }
        // <option value;='10' data - id;='10'> Escalate < /option>;
      } else {
        // <option value="7" data-id="7">Approve</option>
        // <option value="8" data-id="8">Reject</option>
      }
    } else {
      if (this.ticketReplyDTO.isBrandworkFlowEnabled) {
        const dropdown = replyOptions.replyOption.filter((obj) => {
          return obj.id === 3 || obj.id === 13 || obj.id === 17;
        });

        this.ticketReplyDTO.replyOptions = [];
        this.ticketReplyDTO.replyOptions = dropdown;
      } else {
        const dropdown = replyOptions.replyOption.filter((obj) => {
          return obj.id === 3 || obj.id === 13;
        });

        this.ticketReplyDTO.replyOptions = [];
        this.ticketReplyDTO.replyOptions = dropdown;
      }

      // <optgroup label="Reply">
      //     <option value="3" data-id="3" selected="selected">Reply & Close</option>
      //     <option value="13" data-id="13">Reply & On Hold</option>
      // </optgroup>
      // <option value="11" data-id="11">Approve</option>
      if (this.ticketReplyDTO.isBrandworkFlowEnabled) {
        // <option value="12" data-id="12">Reject</option>
      }
    }

    if (
      this.baseMentionObj?.ticketInfo?.srid &&
      this.baseMentionObj?.ticketInfo?.status == TicketStatus.Open
    ) {
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == String(this.baseMentionObj.brandInfo.brandID)
      );
      if (brandInfo?.isUpdateWorkflowEnabled) {
        if(this.showReplySection || this.baseMentionObj?.channelGroup == ChannelGroup.Email)
        {
          if (brandInfo.crmClassName == 'DreamSOLCRM') {
            this.ticketReplyDTO.replyOptions = [
              { id: 3, value: ' Reply & Close' },
              { id: 5, value: ' Reply & Escalate' }
            ];

          } else if ((brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm') && this.crmTicketStatus){
            /* in that case showing only option whihc one allow you to user */
            /* this.ticketReplyDTO.replyOptions = [
              { "id": 3, "value": " Reply & Close" },
              { "id": 18, "value": "Reply & Assign" },
              { "id": 5, "value": " Reply & Escalate" },
              { "id": 13, "value": "Reply & On Hold" },
              { "id": 14, "value": "Reply & Awaiting response from Customer" }
            ] */
            /* in that case showing only option whihc one allow you to user */
          } else if (brandInfo?.typeOfCRM == 101){
            this.ticketReplyDTO.replyOptions = [
              { id: 5, value: ' Reply & Escalate' },
              { id: 4, value: ' Escalate' },
            ];
          } else {
          this.ticketReplyDTO.replyOptions = [
            { id: 5, value: ' Reply & Escalate' }
          ];
        }
          this.textAreaCount[0].text = brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage;
          let customReplyStatus: number = 5;
          if ((brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm') && this.crmTicketStatus) {
            customReplyStatus = 3;
          }
          this.replyForm.get('replyType').setValue(customReplyStatus);
          this.replyTypeName = this.ticketReplyDTO.replyOptions.find((obj) => obj.id == (customReplyStatus)).value;
          this.replyTypeChange(customReplyStatus);
        }
        if (this.showEscalateview && brandInfo?.crmClassName != 'TataCapitalCRM' && brandInfo?.crmClassName != 'TataUniCrm') {
          if (brandInfo.typeOfCRM !== 2 && brandInfo.typeOfCRM !== 3 && brandInfo.crmClassName != 'DreamSOLCRM') {
            this.replyForm
              .get('replyEscalateNote')
              .setValue(
                brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage
              );
            this.GetCrmCsdUserId3Api = this.replyService
              .GetCrmCsdUserId(brandInfo.crmClassName)
              .subscribe((res) => {
                if (res.success) {
                  this.csdUserId = res.data.csdUserId;
                  this.escalateUsers = res.data.csdUserId;
                  this.replyForm.get('escalateUsers').setValue(res.data.csdUserId);
                }
              });
          }
        }
    }

      if (brandInfo?.typeOfCRM == 102 && brandInfo?.isManualPush == 1 && this.baseMentionObj?.ticketInfo?.srid && this.defaultAgentID) {
        this.ticketReplyDTO.replyOptions = [
          { id: 18, value: 'Reply & Assign' }
        ];
        this.GetSFDCCaseNo()
        // this.srCreatedMessage = `Thank you for reaching out to us. We wanted to let you know that we have received your request and we have created a support ticket for you. Your service request number is ${this.baseMentionObj?.ticketInfo?.srid}.`;
        // if(this.baseMentionObj?.channelGroup==ChannelGroup.Email)
        // {
        //   this.emailReplyText = this.srCreatedMessage
        // }else
        // {
        //   this.textAreaCount[0].text = this.srCreatedMessage;
        // }
        this.replyForm.get('replyType').setValue(18);
        this.selectedReplyType=18;
        this.IsreplyAndAssign = true;
        this.selectedAssignTo = this.defaultAgentID;
        this.replyLinkCheckbox?.forEach((x) => {
          if (x.replyLinkId == Replylinks.SendFeedback)
          {
            x.checked=false
          }
        })
        
      }
    }

    if (basemention.channelGroup === ChannelGroup.Twitter) {
      if (basemention.channelType === ChannelType.PublicTweets || basemention.channelType === ChannelType.Twitterbrandmention) {  
        if (basemention.taggedUsersJson) {

          /* reset local taggedUsers */
          this.taggedUsers = [];
          /* reset local taggedUsers */
          this.taggedUsers = JSON.parse(basemention.taggedUsersJson);

          if (this.taggedUsers && this.taggedUsers.length > 0) {
            this.taggedUsers = this.taggedUsers.filter((x) => x.Name.toLowerCase() !== basemention.author.screenname.toLowerCase());
            if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
              // string SocialIDs = string.Join(",", objBrandSocialAcount.Select(x => x.SocialID).ToList());
              // TaggedUsers = TaggedUsers.Where(x => !SocialIDs.Contains(x.Userid)).ToList();
              this.ticketReplyDTO.brandUserIds = this.objBrandSocialAcount.map((obj) => obj.socialID);
            }
          }

        }
      }
    }

    if (basemention.channelType === ChannelType.PublicTweets || basemention.channelType === ChannelType.Twitterbrandmention) {
      if (this.taggedUsers && this.taggedUsers.length > 0) {
        this.ticketReplyDTO.taggedUsers = [];

        this.ticketReplyDTO.taggedUsers.push({
          Userid: basemention.author.socialId,
          Name: basemention.author.screenname,
          Checked: true,
          Disabled: true,
        });

        for (const item of this.taggedUsers) {
          if (this.ticketReplyDTO.brandUserIds && this.ticketReplyDTO.brandUserIds.length > 0 && this.ticketReplyDTO.brandUserIds.includes(item.Userid)) {
            this.ticketReplyDTO.taggedUsers.push({
              Userid: item.Userid,
              Name: item.Name,
              Checked: false,
              Disabled: false,
            });
          } 
          else {
            this.ticketReplyDTO.taggedUsers.push({
              Userid: item.Userid,
              Name: item.Name,
              Checked: false,
              Disabled: false,
            });
          }
        }
        this.taggedUsersAsync.next(this.ticketReplyDTO.taggedUsers);
        if (this.ticketReplyDTO.taggedUsers && this.ticketReplyDTO.taggedUsers.length > 0) {
          this.selectedTagUsers = this.ticketReplyDTO.taggedUsers.filter((obj) => { return obj.Checked === true;});
        }
        this.unSelectedTagUsers = this.ticketReplyDTO?.taggedUsers.filter(item => !item.Checked);
      }
    }

    if (basemention.channelGroup === ChannelGroup.WhatsApp) {
      this.ticketReplyDTO.showTemplateMessage = true;
      // <a onclick="WhatsAppChannel.WhatsAppTemplatePopup(this)" id="btnWhatsappTemplat">Template Messages</a>
    }
    if (
      basemention.channelGroup === ChannelGroup.Facebook ||
      basemention.channelGroup === ChannelGroup.Twitter
    ) {
      this.ticketReplyDTO.showUGC = true;
    }

    this.ticketReplyDTO.handleNames = [];
    if (this.objBrandSocialAcount && this.objBrandSocialAcount.length > 0) {
      for (const item of this.objBrandSocialAcount) {
        if (basemention.channelGroup === ChannelGroup.LinkedIn) {
          this.ticketReplyDTO.handleNames.push({
            handleId: item.companyId,
            handleName: item.companyName,
            accountId: item.accountID,
            socialId: item.companyId,
          });
        } else if (
          basemention.channelGroup === ChannelGroup.Instagram &&
          basemention.instaAccountID > 0
        ) {
          this.ticketReplyDTO.handleNames.push({
            handleId: item.socialID,
            handleName: item.userName,
            accountId: item.accountID,
            socialId: item.socialID,
          });
        } else if (
          basemention.channelGroup === ChannelGroup.Instagram &&
          basemention.instagramGraphApiID <= 0
        ) {
          const index = this.objBrandFBInstaAcount.findIndex(
            (obj) => obj.channelGroup === ChannelGroup.Facebook && obj.mapId > 0
          );
          const isExist = index ? true : false;
          const accId =
            isExist && index >= 0 ? this.objBrandFBInstaAcount[index].mapId : 0;
          const instaExist = this.objBrandFBInstaAcount.findIndex(
            (obj) => obj.channelGroup === ChannelGroup.Instagram
          );
          if ((isExist && item.accountID !== accId) || !isExist || instaExist) {
            this.ticketReplyDTO.handleNames.push({
              handleId: item.socialID,
              handleName: item.userName,
              accountId: item.accountID,
              socialId: item.socialID,
            });
          }
        } else if (basemention.channelGroup === ChannelGroup.GooglePlayStore) {
          this.ticketReplyDTO.handleNames.push({
            handleId: item.socialID,
            handleName: item.appFriendlyName,
            accountId: item.accountID,
            socialId: item.socialID,
          });
        } else if (basemention.channelGroup === ChannelGroup.GoogleMyReview) {
          if (basemention.googleMyBusinessLocationID == item.googleMyBusinessLocationID) {
            this.ticketReplyDTO.handleNames.push({
              handleId: item.socialID,
              handleName: item.userName,
              accountId: item.accountID,
              socialId: item.socialID,
            });
          }
        } else if (basemention.channelGroup === ChannelGroup.Facebook) {
          this.ticketReplyDTO.handleNames.push({
            handleId: item.socialID,
            handleName: item.userName,
            accountId: item.accountID,
            socialId: item.socialID,
          });
        }
          // for app store use
           else if (basemention.channelGroup === ChannelGroup.AppStoreReviews) {
            this.ticketReplyDTO.handleNames.push({
              handleId: item.socialID,
              handleName: item.userName,
              accountId: item.accountID,
              socialId: item.socialID,
            });
        } 
        else {
          this.ticketReplyDTO.handleNames.push({
            handleId: item.socialID,
            handleName: item.userName,
            accountId: item.accountID,
            socialId: item.socialID,
          });
        }
      }
      if (
        this.ticketReplyDTO.handleNames &&
        this.ticketReplyDTO.handleNames.length > 0
      ) {
        if (
          basemention.channelGroup === ChannelGroup.Telegram
        ) {
          this.ticketReplyDTO.handleNames = this.ticketReplyDTO.handleNames.filter((res: any) => res.accountId === +basemention.settingID);
          const isExist = this.ticketReplyDTO.handleNames.find((res: any) => res.accountId === +basemention.settingID);
          if (isExist) {
            this.replyForm
              .get('replyHandler')
              .setValue(isExist?.socialId);
          }
        } else {
          this.replyForm
            .get('replyHandler')
            .setValue(this.ticketReplyDTO.handleNames[0].socialId);
            this.isPremiumTwitterAccount(this.ticketReplyDTO.handleNames[0]);
        }

        if (
          this.baseMentionObj.toMailList &&
          this.baseMentionObj.toMailList.length > 0
        ) {
          this.emailToEmail = this.emailToEmail.concat(
            this.baseMentionObj.toMailList
          );
          this.emailToEmail = this.emailToEmail.filter(
            (email) =>
              !email?.toLowerCase()?.includes(this.replyForm.get('replyHandler').value.toLowerCase())
          );
          this.emailToEmail = [...new Set(this.emailToEmail)];
          this.tempToEmail = [this.baseMentionObj.fromMail];
        }
        if (
          basemention.channelType == ChannelType.PublicTweets ||
          basemention.channelType == ChannelType.Twitterbrandmention
        ) {
          if (
            !basemention.isDeletedFromSocial &&
            !this.onlySendMail &&
            !this.onlyEscalation
          ) {
            /* this.checkTweetAlreadyExistsOrNot(basemention); */
          } else {
            const obj: ReplyTimeExpire = {
              message: 'Cannot reply on this ticket',
              baseMention: this.baseMentionObj,
              status: false,
            };
            this.replyService.checkReplyError.next({
              obj,
              tagID: this.baseMentionObj.tagID,
            });
          }
        }
      }
    }
    this.isSendFeedBackClosedCheckedDisabledFlag = this.replyLinkCheckbox.some(
      (obj) =>
        obj.replyLinkId == Replylinks.SendFeedback &&
        obj.disabled == true &&
        obj.checked == true
    );
    this.isSendFeedBackClosedCheckedFlag = this.replyLinkCheckbox.some(
      (obj) =>
        obj.replyLinkId == Replylinks.SendFeedback &&
        obj.disabled == false &&
        obj.checked == true
    );

    if (this.sfdcTicketViewUI && this.currentUser?.data?.user?.role == UserRoleEnum.Agent) {
      this.ticketReplyDTO.replyOptions = this.ticketReplyDTO.replyOptions.filter((x) => x.id != 18)
    }

    if (this.objBrandSocialAcount && this.objBrandSocialAcount?.length && this._postDetailService?.postObj?.channelGroup === ChannelGroup.Email && this.baseMentionObj?.provider == 'Gmail') {
      const selectedHandle:any = this.objBrandSocialAcount.find(
        (obj: any) => obj?.socialID == this.replyForm.get('replyHandler')?.value
      );
      if (selectedHandle && selectedHandle?.outgoingAlias && this.emailToEmail && this.emailToEmail?.length){
        this.emailToEmail = this.emailToEmail.filter(res => res != selectedHandle?.outgoingAlias);
      }
    }
  }

  checkTweetAlreadyExistsOrNot(mention: BaseMention) {
    const keyObj = {
      Source: {
        $type:
          'LocobuzzNG.Entities.Classes.Mentions.TwitterMention, LocobuzzNG.Entities',
        SocialID: mention.socialID,
        BrandInfo: {
          BrandId: mention.brandInfo.brandID,
          BrandName: mention.brandInfo.brandName,
        },
        ChannelGroup: mention.channelGroup,
      },
      Account: {
        $type:
          'LocobuzzNG.Entities.Classes.AccountConfigurations.TwitterAccountConfiguration, LocobuzzNG.Entities',
        SocialID: this.ticketReplyDTO.handleNames[0].socialId,
        // AccountID: this.ticketReplyDTO.handleNames[0].accountId,
      },
    };
    this.replyService.checkTweetExists(keyObj).subscribe((data) => {
      if (data.success) {
      } else {
        if (data.data) {
          const obj: ReplyTimeExpire = {
            message: data.message
              ? this.capitalizeFirstLetter(data.message)
              : 'Cannot reply on this ticket',
            baseMention: this.baseMentionObj,
            status: true,
            title: data?.data?.['apiErrorMessage']
          };
          this.replyService.checkReplyError.next({
            obj,
            tagID: this.baseMentionObj.tagID,
          });
        }
      }
    });
  }

  capitalizeFirstLetter(string): string {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  private checkFoulBeforReply(): any {
    const _self = this;
    this.FoulKeywordData.ContainFoulKeywords = [];
    let allresponse = '';
    this.textAreaCount.forEach((obj) => {
      allresponse = allresponse + obj.text + ' ';
    });
    this.foulKeywordArr.forEach((item) => {
      const regx = new RegExp(`\\b${item.name.toLowerCase()}\\b`);
      if (regx.test(allresponse.toLowerCase())) {
        _self.FoulKeywordData.ContainFoulKeywords.push({
          Id: item.id,
          Keyword: item.name,
        });
      }
      if (!/^[a-zA-Z]+$/.test(item.name.toLowerCase())) {
        const megx = new RegExp(
          `(?:^|[^\\p{L}\\p{N}])'${item.name.toLowerCase()}'(?=[^\\p{L}\\p{N}]|$)`
        );
        if (megx.test(allresponse.toLowerCase())) {
          _self.FoulKeywordData.ContainFoulKeywords.push({
            Id: item.id,
            Keyword: item.name,
          });
        }
      }
    });
    if (this.FoulKeywordData.ContainFoulKeywords.length > 0) {
      this.FoulKeywordData.replyText = allresponse;
      const highlighRegx = new RegExp(
        `${this.FoulKeywordData.ContainFoulKeywords.map(
          (keyItem) => keyItem.Keyword
        ).join('|')}`,
        'gi'
      );
      this.FoulKeywordData.replyText = this.FoulKeywordData.replyText.replace(
        highlighRegx,
        '<span class="text__highlight">$&</span>'
      );
      const isworkflowenabled = this._filterService.fetchedBrandData.find(
        (brand: BrandList) =>
          +brand.brandID === this._postDetailService?.postObj.brandInfo.brandID
      );
      if (
        isworkflowenabled.isEnableReplyApprovalWorkFlow &&
        this._postDetailService?.postObj.isMakerCheckerEnable &&
        (this.currentUser.data.user.role === UserRoleEnum.Agent ||
          this.currentUser.data.user.role === UserRoleEnum.NewBie)
      ) {
        // for confirmation
        const dialogData = new AlertDialogModel(
          this.translate.instant('Your-reply-message-following-keywords'),
          this.FoulKeywordData.replyText,
          'Yes',
          'No',
          true
        );
        const dialogRef = this.dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });

        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            this.allowFoul = true;
            /* foul keyword log */
            const brandInfo = this._filterService.fetchedBrandData.find((obj) => obj.brandID == this.baseMentionObj.brandInfo.brandID);
            if(this.selectedReplyType == 3){
              if (brandInfo && brandInfo?.isTicketDispositionFeatureEnabled && this.ticketDispositionList?.length > 0) {
                this.saveReply();
              }
              else {
                this.logForFoulKeyword(allresponse);
              }
            }
            else { this.logForFoulKeyword(allresponse); }
            this.actionProcessing = true;
            this.cdr.detectChanges();
            /* foul keyword log */
          } else {
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
          }
        });
      } else {
        // just Prompt
        const dialogData = new AlertDialogModel(
          this.translate.instant('Your-reply-message-foul-keywords'),
          this.FoulKeywordData.replyText,
          'Yes',
          'No',
          true
        );
        const dialogRef = this.dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });

        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            this.allowFoul = true;
            /* foul keyword log */
            const brandInfo = this._filterService.fetchedBrandData.find((obj) => obj.brandID == this.baseMentionObj.brandInfo.brandID);
            if (this.selectedReplyType == 3) {
              if (brandInfo && brandInfo?.isTicketDispositionFeatureEnabled && this.ticketDispositionList?.length > 0) {
                this.saveReply();
              }
              else {
                this.logForFoulKeyword(allresponse);
              }
            }
            else this.logForFoulKeyword(allresponse);
            this.actionProcessing = true;
            this.cdr.detectChanges();
            /* foul keyword log */
          } else {
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
          }
        });
      }
      return false;
    }
    return true;
  }

  logForFoulKeyword(replyText, flag:boolean = false){
    const dmSent = this.replyLinkCheckbox.find((obj) => obj.replyLinkId == Replylinks.SendAsDM && obj.checked);
    const post = this._postDetailService.postObj;
    const req = {
      brandInfo: {
        brandName: post?.brandInfo?.brandName,
        brandID: post?.brandInfo?.brandID
      },
      logFoulkeyword: {
        ChannelID: post.channelType,
        AccountID: this.replyForm.get('replyHandler')?.value,
        IsSendAsDM: Object.keys(dmSent || {}).length > 0 ? dmSent?.checked : false,
        Status: this.selectedReplyType,
        Tagid: post?.tagID,
        TicketId: post?.ticketInfo?.ticketID,
        ReplyText: replyText,
        foulkeywordlist: this.FoulKeywordData?.ContainFoulKeywords || []
      }
    }
    this.logForFoulKeywordApi = this.replyService.logForFoulKeyword(req).subscribe((res)=>{
      if(res){
        this.saveReply(flag);
      }
    })
  }

  saveReply(saveReplyButtonFlag = false): void {
    this.disableSaveButton = true;
    // let replyinputtext = this.replyForm.get('replyText').value;
    const checkReplyType = +this.replyForm?.get('replyType')?.value;
    let brandInfo = this._filterService?.fetchedBrandData?.find(
      (obj) => obj?.brandID == this.baseMentionObj?.brandInfo?.brandID
    );
    if (brandInfo?.aiTagEnabled && checkReplyType == 3) {
      this.generateClosingTicketTag();
    }
    if (this.onlySendMail) {
      this.forwardEmail();
      return;
    }
    let replyinputtext = this.textAreaCount[0].text;
    if (!this.allowFoul) {
      const nofoul = this.checkFoulBeforReply();
      if (!nofoul) {
        return;
      }
    }

    if (
      (this.baseMentionObj.channelGroup == ChannelGroup.Sitejabber && this.textAreaCount.length > 0 &&
        this.textAreaCount[0].text && this.textAreaCount[0].text.length < 10)
    ) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            this.translate.instant('Ensure-your-response'),
        },
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
      return;
    }

    if (
      (this.selectedMedia.length > 0 && this.textAreaCount.length > 0 &&
        this.textAreaCount[0].text) &&
      this.baseMentionObj.channelGroup == ChannelGroup.GoogleBusinessMessages
    ) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            this.translate.instant('attachment-replying-on-GBM'),
        },
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.baseMentionObj.channelGroup === ChannelGroup.Instagram && this.baseMentionObj.channelType === ChannelType.InstagramComments && !this.onlyEscalation) {
      if (`${this.baseMentionObj?.author?.screenname}`.length > 0){

        const commentHandler: string = `@${this.baseMentionObj?.author?.screenname}`;
        const withOutCommentHandleReplayText = replyinputtext.split(commentHandler);

        if (replyinputtext.includes(commentHandler)){
          if (withOutCommentHandleReplayText.length == 1) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Reply-cannot-be-empty'),
              },
            });
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
            return;
          }

          if (withOutCommentHandleReplayText.length > 1 && withOutCommentHandleReplayText[1].trim().length == 0) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message:  this.translate.instant('Reply-cannot-be-empty'),
              },
            });
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
            return;
          }
        }
 
      }
    }

    // else{
    //   replyinputtext = this.textResponse;
    // }
    if (this.isEmailChannel && this.emailReplyText.trim()) {
      let emailText = this.emailReplyText.trim();
      if (this.showPrevoiusMail) {
        emailText = emailText.concat(this.storedReceivedText);
      }
      replyinputtext = emailText;
    }
    if (this.onlyEscalation) {
      // only escalation
      if (this._postDetailService.isBulk) {
        this.bulkEscalateTo();
      } else {
        this.replyEscalateTo();
      }
    } else {
      let replyValid: boolean = true;
      if (
        this.baseMentionObj.channelGroup == ChannelGroup.Twitter ||
        this.baseMentionObj.channelGroup == ChannelGroup.Facebook ||
        this.baseMentionObj.channelGroup == ChannelGroup.WhatsApp ||
        this.baseMentionObj.channelType == ChannelType.InstagramComments ||
        this.baseMentionObj.channelGroup == ChannelGroup.Telegram
      ) {
        if (replyinputtext == '') {
          if (this.selectedMedia.length == 0) {
            replyValid = false;
          } else {
            if (this.selectedMedia.length > 0) {
              replyValid = true;
            }
          }
        }
        if (this.baseMentionObj.channelGroup == ChannelGroup.Telegram){
          if (replyinputtext) {
            if (this.selectedMedia.length > 0) {
              this.disableSaveButton = false;
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: `Telegram doesn't support sending text and media together in a reply. Please send one at a time.`,
                },
              });
              return
            } else {
              replyValid = true;
            }
          } if (this.selectedMedia.length > 0) {
            replyValid = true;
          }
        }
      } else {
        if (this.baseMentionObj.channelGroup == ChannelGroup.Email) {
          const result = this.replyLinkCheckbox.find(
            (res) => res.name == 'Add previous mail trail'
          );
          if (result && result.checked && !replyinputtext.trim()) {
            replyinputtext = this.storedReceivedText;
          }
        }

        if (!replyinputtext.trim()) {
          replyValid = false;
        }
      }
      if ((this.selectedMedia.length > 0 || (this.textAreaCount.length > 0 && this.textAreaCount[0].text)) &&
          this.baseMentionObj.channelGroup == ChannelGroup.GoogleBusinessMessages){
            replyValid = true;
          }
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == this.baseMentionObj?.brandInfo?.brandID
      );
      if (brandInfo?.typeOfCRM == 101){
        replyValid = true;
      }
      if (replyValid) {
        if (this._postDetailService.isBulk) {
          this.bulkReplyEscalateTo(saveReplyButtonFlag);
        } else {
          const checkReplyType = +this.replyForm.get('replyType').value;
          let brandInfo = this._filterService.fetchedBrandData.find(
            (obj) => obj.brandID == this.baseMentionObj.brandInfo.brandID
          );

          brandInfo.isShowTicketIntelligenceNotification = false;
          
          //check autoClosureEligibitlity
          if (checkReplyType === 14 && !this.autoclosureSettingChecked) {
            // Reply & Awaiting response from Customer
            this.checkAutoClosureEligibility();
            return;
          }

          

          const replyObj: PerformActionParameters = {};
          const replyArray: Reply[] = [];
          const baseReply = new BaseReply();
          const customReplyObj = baseReply.getReplyClass();
          // map the properties
          replyObj.ActionTaken = ActionTaken.Locobuzz;

          // if (this.splittedTweets.length > 0) {
          //   for (const tweet of this.splittedTweets) {
          //     const customReply = baseReply.getReplyClass();
          //     customReply.replyText = tweet;

          //     replyArray.push(customReply);
          //   }
          // } else {
          //   customReplyObj.replyText = replyinputtext;
          //   replyArray.push(customReplyObj);
          // }
          if (this.textAreaCount.length > 0 && !this.isEmailChannel) {
            for (const tweet of this.textAreaCount) {
              const customReply = baseReply.getReplyClass();
              // customReply.replyText = tweet?.text
              if (this.baseMentionObj?.channelGroup == ChannelGroup.TikTok) {
                customReply.replyText = tweet?.text?.substring(0, 150);
              } else {
                customReply.replyText = tweet?.text;
              }
              replyArray.push(customReply);
            }
            this._ticketService.replyInputTextData = replyArray?.map(item => item?.replyText).join('');
          } else {
            customReplyObj.replyText = replyinputtext
            replyArray.push(customReplyObj);
            this._ticketService.replyInputTextData = this.emailReplyText;
          }

          replyObj.Tasks = this.BuildComminicationLog(
            this._postDetailService?.postObj
          );
          const source = this._mapLocobuzzEntity.mapMention(
            this._postDetailService?.postObj
          );
          if (this.simulationCheck) {
            source.ticketInfoSsre.ssreMode = SSREMode.Simulation;
            source.ticketInfoSsre.ssreIntent = this.SsreIntent;
          }
          replyObj.Source = source;

          /* tagged user Json */
          replyArray[0].excludedReplyUserIds = ''
          if (this.ticketReplyDTO.taggedUsers && this.ticketReplyDTO.taggedUsers.length > 0) {
            const arrayuser = [];
            for (const obj of this.ticketReplyDTO.taggedUsers) {
              arrayuser.push({
                Userid: obj.Userid,
                Name: obj.Name,
                UserType: obj.UserType,
                offset: 0,
                length: 10,
              });
            }
            replyArray[0].taggedUsersJson = JSON.stringify(arrayuser);
            if (this.unSelectedTagUsers?.length > 0) {
              /* extra check that user avaibale on taggedUsers */
              const temp_excludedReplyUserIds = this.unSelectedTagUsers.filter((item)=>{
                return arrayuser.some((user) => user?.Userid == item?.Userid)
              })
              /* extra check that user avaibale on taggedUsers */
              replyArray[0].excludedReplyUserIds = [...temp_excludedReplyUserIds.map((obj) => obj?.Userid)]?.join(',')?.replace(/,\s*$/, '')
            }
          }
          // if (this.selectedSurveyForm) {
          //   replyArray[0].surveyFormURL = this.selectedSurveyForm.formURL;
          //   replyArray[0].sendSurvey = true;
          // }
          // autoclosureeligibility
          replyArray[0].eligibleForAutoclosure = this.isEligibleForAutoclosure;
          // replyArray = this._mapLocobuzzEntity.mapReplyObject(replyArray);
          const replyopt = new ReplyOptions();
          replyObj.PerformedActionText = replyopt.replyOption
            .find((obj) => obj.id === +this.replyForm.get('replyType').value)
            .value.trim();
          replyObj.IsReplyModified = this.IsReplyModified;
          replyObj.Replies = replyArray;

          if (
            !this.ticketReplyDTO.handleNames ||
            (this.ticketReplyDTO.handleNames &&
              this.ticketReplyDTO.handleNames.length == 0 &&
              this.baseMentionObj.channelGroup != ChannelGroup.WebsiteChatBot)
          ) {
            let message = '';
            if (this.baseMentionObj.channelType == ChannelType.DirectMessages) {
              message = this.translate.instant('Account-Unconfigured');
            } else {
              message = this.translate.instant('Account-not-configured');
            }
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: message,
              },
            });
            this.actionProcessing = false;
            this.disableSaveButton = false;
            return;
          }

          const selectedHandle = this.ticketReplyDTO.handleNames.find(
            (obj) => obj.socialId === this.replyForm.get('replyHandler').value
          );

          const ActionType = +this.replyForm.get('replyType').value;
          if (!this.isEmailChannel && selectedHandle) {
            replyObj.ReplyFromAccountId = selectedHandle.accountId;
            replyObj.ReplyFromAuthorSocialId = selectedHandle.socialId;
          }

          if (this.replyLinkCheckbox && this.replyLinkCheckbox.length > 0) {
            this.replyLinkCheckbox.forEach((obj) => {
              if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
                replyObj.Replies[0].sendFeedback = true;
                replyObj.Replies[0].FeedbackForm = obj?.feedbackForm;
              } else if (
                obj.checked &&
                obj.replyLinkId === Replylinks.SendAsDM
              ) {
                replyObj.Replies[0].sendAsPrivate = true;
              } else if (
                obj.checked &&
                obj.replyLinkId === Replylinks.SendDMLink
              ) {
                replyObj.Replies[0].sendPrivateAsLink = true;
              } else if (
                obj.checked &&
                obj.replyLinkId === Replylinks.SendToGroups
              ) {
                replyObj.Replies[0].sendToGroups = true;
              } else if (
                obj.checked &&
                obj.replyLinkId === Replylinks.SendForApproval
              ) {
                // replyObj.replies[0].sen = true;
              }
            });
          }
          // check attachments
          if (this.selectedMedia && this.selectedMedia.length > 0) {
            this.selectedMedia = this._mapLocobuzzEntity.mapUgcMention(
              this.selectedMedia
            );
        
            if (this.baseMentionObj?.channelGroup == ChannelGroup.Telegram){
              this.selectedMedia.forEach(res => res.TelegramCaption = this.caption ? this.caption : '');
            }
            replyObj.Replies[0].attachmentsUgc = this.selectedMedia;
          } else {
            replyObj.Replies.forEach((obj) => {
              obj.attachmentsUgc = null;
            });
          }

          // check send to groups clicked
          if (this.sendtoGroupsClicked) {
            if (this.groupToEmails.length > 0) {
              replyObj.Replies[0].groupEmailList.email_to =
                this.groupToEmails.toString();
              replyObj.Replies[0].groupEmailList.email_cc = this.groupCCEmails
                ? this.groupCCEmails.toString()
                : '';
              replyObj.Replies[0].groupEmailList.email_bcc = this.groupBCCEmails
                ? this.groupBCCEmails.toString()
                : '';
              replyObj.Replies[0].groupEmailList.groupIDs = this.groupIDs;
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: 'Please select an email group to forward the email.',
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
              return;
            }
          }
          if (this.isEmailChannel) {
            replyObj.ReplyFromAccountId = +this.baseMentionObj.settingID;
            replyObj.Replies[0].toEmails =
              this.emailToEmail.length > 0 ? this.emailToEmail : [];
            replyObj.Replies[0].ccEmails =
              this.emailCCEmails.length > 0 ? this.emailCCEmails : [];
            replyObj.Replies[0].bccEmails =
              this.emailBCCEmails.length > 0 ? this.emailBCCEmails : [];
            if ((this.emailToEmail && this.emailToEmail.length) || (this.emailCCEmails && this.emailCCEmails.length || (this.emailBCCEmails && this.emailBCCEmails.length))) {

            } else {
              if (this.baseMentionObj?.channelGroup == ChannelGroup.Email && !this.showEscalateview) {
                this.actionProcessing = false;
                this.disableSaveButton = false;
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                    type: notificationType.Warn,
                    message: this.translate.instant('Please-Add-Email-Ids'),
                  },
                });
                this.cdr.detectChanges();
                return;
              }
              
            }
          }
          const isFeedBackOptionSelected = replyObj.Tasks.some(
            (obj) => obj.Status == 47
          );
          const sendAsDm = this.replyLinkCheckbox.some(
            (obj) => obj.replyLinkId == Replylinks.SendAsDM && obj.checked
          );
          if (
            (this.baseMentionObj.channelType == ChannelType.FBComments ||
              this.baseMentionObj.channelType ==
                ChannelType.InstagramPublicPosts) &&
            sendAsDm
          ) {
            if (
              replyObj.Replies.length > 0 &&
              replyObj.Replies[0].replyText &&
              replyObj.Replies[0].replyText != null &&
              replyObj.Replies[0].replyText != undefined &&
              replyObj.Replies[0].replyText != '' &&
              this.selectedMedia.length > 0 &&
              isFeedBackOptionSelected
            ) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message:
                    'You can either use text/attachment/feedback while replying as private message',
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
              return;
            } else if (
              replyObj.Replies.length > 0 &&
              replyObj.Replies[0].replyText &&
              replyObj.Replies[0].replyText != null &&
              replyObj.Replies[0].replyText != undefined &&
              replyObj.Replies[0].replyText != '' &&
              isFeedBackOptionSelected
            ) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message:
                    'You can either use text or feedback while replying as private message',
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
              return;
            } else if (
              replyObj.Replies.length > 0 &&
              replyObj.Replies[0].replyText &&
              replyObj.Replies[0].replyText != null &&
              replyObj.Replies[0].replyText != undefined &&
              replyObj.Replies[0].replyText != '' &&
              this.selectedMedia.length > 0
            ) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message:
                    'You can either use text or feedback while replying as private message',
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
              return;
            } else if (
              this.selectedMedia.length > 0 &&
              isFeedBackOptionSelected
            ) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message:
                    'You can either use attachment or feedback while replying as private message',
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
              return;
            }
          }
          if (replyObj.Replies && replyObj.Replies.length > 0) {
            replyObj.Replies.map((obj) => {
              if (obj.replyText) {
                obj.replyText = obj?.replyText?.trim()
              }
            });
          }

          if (this.dispositionDetails) {
            replyObj.DispositionID = this.dispositionDetails?.dispositionId;
            if (replyObj?.Source && this.dispositionDetails && this.dispositionDetails?.aiTicketIntelligenceModel && brandInfo?.aiTagEnabled && checkReplyType == 3) {
              replyObj.Source.aiTicketIntelligenceModel = this.aiTicketIntelligenceModelData !== undefined ? this.aiTicketIntelligenceModelData : this.dispositionDetails?.aiTicketIntelligenceModel;
            }
            if (replyObj?.Source && replyObj?.Source?.aiTicketIntelligenceModel) {
              replyObj.Source.aiTicketIntelligenceModel.isAgentiQueEnabled = brandInfo?.isAgentIQEnabled ? true : false;
            }
            const MAX_TWEET_LENGTH = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
            if (replyObj?.Replies && this.dispositionDetails && this.dispositionDetails?.applySuggestion) {
              if (this.dispositionDetails.suggestedReply !== undefined) {
                const strUserSignature = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ?
                  ' ' + this.emailSignatureParams.userSignatureSymbol + ' ' + this.emailSignatureParams.userSignature : '';
                replyObj.Replies[0].replyText = brandInfo?.isSignatureEnabled ? this.dispositionDetails?.suggestedReply + strUserSignature : this.dispositionDetails.suggestedReply;
                replyObj.Replies[0].replyText = replyObj.Replies[0].replyText?.replace(/<br\s*\/?>/gi, '\n');
                this.dispositionDetails.suggestedReply = replyObj?.Replies[0]?.replyText;
              }
              if (this.dispositionDetails.suggestedReply !== undefined && this.baseMentionObj.channelGroup == ChannelGroup.Twitter && replyObj?.Replies?.length > 1) {

                const strUserSignature = brandInfo?.isSignatureEnabled && this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ?
                  ' ' + this.emailSignatureParams.userSignatureSymbol + ' ' + this.emailSignatureParams.userSignature : '';

                let offset = 0;
                let lastValidReplyIndex = -1;

                for (let i = 0; i <= 4; i++) {
                  const reply = replyObj?.Replies[i];
                  if (reply?.replyText) {
                    const remainingLength = this.dispositionDetails?.suggestedReply?.length - strUserSignature?.length - offset;
                    const sliceLength = Math.min(reply?.replyText?.length, remainingLength);
                    reply.replyText = this.dispositionDetails?.suggestedReply?.substring(offset, offset + sliceLength);
                    offset += sliceLength;
                    lastValidReplyIndex = i;
                  }
                }
                if (strUserSignature?.length > 0 && lastValidReplyIndex >= 0 && replyObj?.Replies[lastValidReplyIndex]?.replyText) {
                  replyObj.Replies[lastValidReplyIndex].replyText += strUserSignature
                }


                if (replyObj && replyObj?.Replies && replyObj?.Replies.length) {
                  // clone original replies so we can safely modify while iterating
                  const newReplies: any[] = [];

                  replyObj.Replies.forEach(res => {
                    if (res.replyText) {
                      let tweettext = res.replyText.trim();

                      while (tweettext.length > 0) {
                        // take substring up to 280 characters
                        let chunk = tweettext.substring(0, MAX_TWEET_LENGTH);
                        if (chunk)
                          // push new reply object
                          newReplies.push({
                            ...res,
                            replyText: chunk
                          });

                        // remove that chunk from original text
                        tweettext = tweettext.substring(MAX_TWEET_LENGTH);
                      }

                    } else {
                      // if no replyText, just push original
                      // newReplies.push(res);
                    }
                  });

                  // replace Replies with split replies
                  replyObj.Replies = newReplies;
                }
              }
            }
            if (
              this.dispositionDetails?.categoryCards &&
              this.dispositionDetails?.categoryCards.length > 0
            ) {
              replyObj.Source.categoryMap =
                this.dispositionDetails?.categoryCards;
              replyObj.Source.categoryMapText = null;
            }
            if (this.dispositionDetails && (this.dispositionDetails?.isAllMentionUnderTicketId == true || this.dispositionDetails?.isAllMentionUnderTicketId == false)) {
              replyObj.isAllMentionUnderTicketId = this.dispositionDetails?.isAllMentionUnderTicketId;
            }
            const dispositionTask = {
              AssignedToTeam: 0,
              AssignedToUserID: 0,
              Channel: null,
              Note: '',
              Status: ClientStatusEnum.TicketDisposition,
              TagID: String(this.baseMentionObj.tagID),
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
              TagID: String(this.baseMentionObj.tagID),
              TicketID: 0,
              type: 'CommunicationLog',
            };
            if (replyObj?.Tasks && this.dispositionDetails?.note !== undefined) {
              replyObj.Tasks.push(noteTask);
            }
            if (replyObj?.Tasks) {
              replyObj.Tasks.push(dispositionTask);
            }
            replyObj.isAutoTicketCategorizationEnabled =
              brandInfo.isAutoTicketCategorizationEnabled;
            if (brandInfo && brandInfo?.isTicketDispositionFeatureEnabled) {
              replyObj.showTicketCategory = !!brandInfo?.isTicketCategoryTagEnable;
            }
          } else {
            if (replyObj?.Source && brandInfo?.aiTagEnabled && checkReplyType == 3) {
              replyObj.Source.aiTicketIntelligenceModel = this.aiTicketIntelligenceModelData !== undefined ? this.aiTicketIntelligenceModelData : replyObj.Source.aiTicketIntelligenceModel;
            }
            if (replyObj?.Source && replyObj?.Source?.aiTicketIntelligenceModel) {
              replyObj.Source.aiTicketIntelligenceModel.isAgentiQueEnabled = brandInfo?.isAgentIQEnabled ? true : false;
            }
            const dispositionTask = {
              AssignedToTeam: 0,
              AssignedToUserID: 0,
              Channel: null,
              Note: '',
              Status: ClientStatusEnum.TicketDisposition,
              TagID: String(this.baseMentionObj.tagID),
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
              TagID: String(this.baseMentionObj.tagID),
              TicketID: 0,
              type: 'CommunicationLog',
            };
            if (replyObj?.Tasks && brandInfo?.aiTagEnabled && checkReplyType == 3) {
              replyObj.Tasks.push(noteTask);
              replyObj.Tasks.push(dispositionTask);
            }
          }

          const personalDetailsRequiredFlag = this.replyLinkCheckbox?.some(
            (res) =>
              res?.replyLinkId == Replylinks.PersonalDetailsRequired &&
              res?.checked
          );
          if (personalDetailsRequiredFlag != null) {
            replyObj.isSafeForm = personalDetailsRequiredFlag;
            if (
              personalDetailsRequiredFlag &&
              !replyObj.Replies[0].replyText.includes('{formLink}')
            ) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message:
                    '{formLink} placeholder is compulsory if you have selected personal details required option.',
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
              return;
            }
          }
          /* Ticket Disposition */
          if (checkReplyType == 3) {
            if (this.baseMentionObj?.description && (this.baseMentionObj?.description).trim()) {
              const urlPattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/;
              const result = urlPattern.test((this.baseMentionObj?.description).trim());
              if (!result) {
                this.isAITicketTagEnabled = brandInfo.aiTagEnabled
                this.isAIInsightsEnabled = brandInfo?.isShowTicketIntelligenceNotification;
              }
            }
            if (
              brandInfo &&
              brandInfo.isTicketDispositionFeatureEnabled &&
              !saveReplyButtonFlag && this.ticketDispositionList.length > 0
            ) {
              if (brandInfo?.isAgentIQEnabled && this.currentUser?.data?.user?.isAccountAIEnabled) {
                this.generateAgentIQ().then((isSuggested: boolean) => {
                  if (isSuggested) {
                    this.ticketDispositionDialog();
                  } else {
                    this.ticketDispositionDialog();
                  }
                });
              } else {
                this._ticketService.generateClosingTicket.next(null);
                this.ticketDispositionDialog();
              }
              return;
            } else if (this.isAITicketTagEnabled && this.isAIInsightsEnabled && !saveReplyButtonFlag) {
              this.ticketDispositionDialog(null,true);
              return;
            } else if (brandInfo?.isAgentIQEnabled && this.currentUser?.data?.user?.isAccountAIEnabled && !saveReplyButtonFlag) {
              this.generateAgentIQ().then((isSuggested: boolean) => {
                if (isSuggested || this.isIqFalse == true) {
                  this.ticketDispositionDialog(null, true);
                } else {
                  this.saveReply(true);
                }
              });
              return;
            }
          } else if (brandInfo?.isAgentIQEnabled && brandInfo?.isApplicableForAllResponses && this.currentUser?.data?.user?.isAccountAIEnabled
            && (checkReplyType == 18 || checkReplyType == 5 || checkReplyType == 13 || checkReplyType == 14)) {
            if (!saveReplyButtonFlag) {
              this.generateAgentIQ().then((isSuggested: boolean) => {
                if (isSuggested || this.isIqFalse == true) {
                  this.ticketDispositionDialog(null, true);
                } else {
                  this.saveReply(true);
                }
              });
              return;
            }
          } else {
            this._ticketService.generateClosingTicket.next(null);
          }
          /* Ticket Disposition */
          
          this.actionProcessing = true;

          // check if it is reply and assign
          if (checkReplyType === 18) {
            if (this.IsreplyAndAssign) {
              if (!this.selectedAssignTo) {
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                    type: notificationType.Warn,
                    message: 'Please select user to assign the ticket',
                  },
                });
                this.actionProcessing = false;
                this.disableSaveButton = false;
                this.cdr.detectChanges();
                return;
              }
            }
          }

          // check if it is reply and escalate
          if (checkReplyType === 5) {
            if (+this.replyForm.get('escalateUsers').value > 0) {
              // check whether user is selected
              let escalatetouser = this.ticketReplyDTO.agentUsersList.find(
                (obj) => {
                  return (
                    obj.agentID === +this.replyForm.get('escalateUsers').value
                  );
                }
              );

              //check whether team is selected
              if (!escalatetouser) {
                escalatetouser = this.ticketReplyDTO.agentUsersList.find(
                  (obj) => {
                    return (
                      obj.teamID === +this.replyForm.get('escalateUsers').value
                    );
                  }
                );
                escalatetouser.agentID = null;
              }

              if (escalatetouser) {
              } else {
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                    type: notificationType.Warn,
                    message: 'Please select user to escalate the ticket',
                  },
                });
                this.actionProcessing = false;
                this.disableSaveButton = false;
                this.cdr.detectChanges();
                return;
              }
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: 'Please select user to escalate the ticket',
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
              return;
            }
          }
          if (replyObj?.Source?.ticketInfoWorkflow?.workflowId){
            replyObj.Source.ticketInfoWorkflow.workflowLogStatus = WorkflowLogStatus.WorkflowReplyModified;
          }
          // call Reply Api
          // console.log(replyObj);
          /* extra flag added */
          const logdinUser = JSON?.parse(localStorage?.getItem('user') || '{}');
          if (logdinUser && Object.keys(logdinUser)?.length > 0) {
            const actionButton = logdinUser?.data?.user?.actionButton;
            if (Object.keys(actionButton)?.length > 0) {
              if (replyObj?.Source) replyObj.Source['IsChatBotEnable'] = actionButton?.chatSectionEnabled || false;
            }
          }
          if (this.currentUser?.data?.user?.role == UserRoleEnum?.Agent && this.currentBrand?.isEnableReplyApprovalWorkFlow && checkReplyType == 18) {
            if (replyObj?.Source && replyObj?.Source?.ticketInfo) replyObj.Source.ticketInfo['makerCheckerStatus'] = MakerCheckerEnum.ReplyAndAssign;
          }
          /* extra flag added */
          if (this.baseMentionObj?.channelGroup == ChannelGroup.Twitter && this.baseMentionObj?.channelType == ChannelType.Twitterbrandmention){
            const MAX_TWEET_LENGTH = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
            if (replyObj && replyObj?.Replies && replyObj?.Replies.length){
              replyObj?.Replies.forEach(res => {
                if (res.replyText){
                  const tweettext = res.replyText.trim();
                  const twitterLibrary = require('twitter-text');
                  let twitterObj = twitterLibrary.default.parseTweet(tweettext);
                  if (twitterObj.weightedLength > MAX_TWEET_LENGTH) {
                    this._snackBar.openFromComponent(CustomSnackbarComponent, {
                      duration: 5000,
                      data: {
                        type: notificationType.Error,
                        message: 'Twitter mentions are limited to 280 characters per reply textbox.',
                      },
                    });
                    this.actionProcessing = false;
                    this.disableSaveButton = false;
                    return
                  }
                }
              })
            }
          }
          if (this.baseMentionObj?.channelGroup == ChannelGroup.Telegram){
            replyObj.TelegramReplyType = 1
          }

          if (this.baseMentionObj?.channelGroup == ChannelGroup.Telegram && this.baseMentionObj?.ticketInfo?.latestTagID && this.baseMentionObj?.ticketInfo?.tagID && this.pageType == PostsType.TicketHistory) {
            if (Number(this.baseMentionObj?.ticketInfo?.latestTagID) != Number(this.baseMentionObj?.ticketInfo?.tagID)){
              replyObj.TelegramReplyType = 2
            }
          } 
          if (this.baseMentionObj?.channelType == ChannelType.TelegramGroupMessages ) {
            replyObj.TelegramReplyType = 2
          } 

        if (checkReplyType === 3 || checkReplyType === 5) {
          if(this.missingFieldsClosure && this.missingFieldsClosure.length){
            this.showAlert();
            return
          }
          if (this.missingFieldsEscalation && this.missingFieldsEscalation.length) {
            this.showAlert();
            return
          }
        }
          // let rephraseTextWithoutSignature = this.rephraseText;
          // if(this.emailSignatureParams){
          //   let textToRemove = this.emailSignatureParams?.userSignatureSymbol + ' ' + this.emailSignatureParams?.userSignature;
          //   rephraseTextWithoutSignature = this.rephraseText?.replace(textToRemove, '').trim();
          // }
          let rephraseTextWithoutSignature = this.responseGenieReply;
          let ResponseGenieStatusObj = {
            Note: JSON.stringify({ Text: this.rephraseText, Caution: this.CautionFlagForLogs }),
            TicketID: 0,
            TagID: String(this.baseMentionObj.tagID),
            AssignedToUserID: 0,
            AssignedToTeam: 0,
            Channel: null,
            Status: 134,
            type: "CommunicationLog",
            NotesAttachment: null
          }
         if(this.responseGenieUsed){
          const maxPostCharactersLimit = this.textAreaCount[this.textAreaCount?.length-1]?.maxPostCharacters;
          const verifyText = maxPostCharactersLimit ? this.rephraseText?.slice(0,maxPostCharactersLimit) : this.rephraseText
           if (this.textAreaCount && this.textAreaCount[this.textAreaCount?.length - 1]?.text?.trim() == this.rephraseText?.trim()){
            ResponseGenieStatusObj.Status = 136;
            replyObj?.Tasks?.push(ResponseGenieStatusObj);
          }
          else{
            ResponseGenieStatusObj.Status = 135;             
            let editedText = this.textAreaCount[this.textAreaCount?.length-1]?.text;
            ResponseGenieStatusObj.Note = JSON.stringify({ Text: editedText, Caution: this.CautionFlagForLogs });
            replyObj?.Tasks?.push(ResponseGenieStatusObj);
          }
          
        }
         this.Reply1Api = this.replyService.Reply(replyObj,true).subscribe((data) => {
            if (data.success) {
              // console.log('reply successfull ', data);
              // this._filterService.currentBrandSource.next(true);
               this._filterService.currentBrandSourceSignal.set(true);

              this._ticketSignalrService.removeTicketCall.next(
                this._postDetailService?.postObj.ticketInfo.ticketID
              );
              if (checkReplyType === 18 && this.selectedAssignTo){
                this.replyService.reAssignTicketSignal.set(this.selectedAssignTo);
              }
              this.replyService.closeReplyBox.next(false);
              // this.replyService.closeReplyBoxSignal.set(false);

              if (checkReplyType !== 18) {
                this._postDetailService.postObj.ticketInfo.status =
                  +this.replyForm.get('replyType').value;
              }
              // this._replyService.setTicktOverview.next(
              //   this._postDetailService?.postObj
              // );
              // this._ticketService.ticketStatusChange.next(true);
              // this.dialogRef.close(true);
              this._postDetailService.replyText = replyObj.Replies[0].replyText;
              this._postDetailService.postObj.brandInfo.brandLogo =
                this.baseMentionObj.brandInfo.brandLogo;
              if (this._postDetailService.replyText) {
                this.replyService.replyActionPerformedSignal.set(
                  this._postDetailService?.postObj
                );
              }
              this._bottomSheet.dismiss();
              const msg = this._ticketService.GetToastMessageonPerformAction(
                ActionType,
                this._postDetailService?.postObj,
                this.currentUser
              );
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: msg,
                },
              });
              this.allowFoul = false;
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.checkLogAutoReply(
                this.baseMentionObj,
                replyObj.Replies[0].replyText
              );
              if (this.dispositionDetails) {
                this._postDetailService.updateTicketCategorySignal.set(
                  this.dispositionDetails
                );
              }
              if(this.currentUser?.data?.dynamicCrmFlag)
              {
                window.parent.postMessage('Refresh','*');
              }
              this.cdr.detectChanges();
              const autoUpdateWindow = localStorage.getItem('autoUpdateWindow') ? JSON.parse(localStorage.getItem('autoUpdateWindow')) : false;
              if (autoUpdateWindow && this.pageType==PostsType.TicketHistory)
              {
                this.closePreviousTicketCase(this.baseMentionObj);
                this._ticketService.agentAssignToObservableSignal.set(this.baseMentionObj);
              }
              if(this.pageType==PostsType.TicketHistory)
              {
                this._ticketService.ticketHistoryActionPerformObsSignal.set(this.baseMentionObj.tagID)
              }
              if(this.baseMentionObj?.isSmartSuggestionGenerated){
                this.baseMentionObj.smartSuggestion = []
                this.baseMentionObj.isSmartSuggestionGenerated =false
              }
              if (JSON.parse(localStorage.getItem('sfdcTicketView'))) {
                this._ticketService.crmChatbotCloseTicketObsSignal.set({ status: this._postDetailService?.postObj.ticketInfo?.status });
              }
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: data?.message ? data?.message:'Unable to reply.',
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
            }
            // this.zone.run(() => {
          },err=>{
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translate.instant('Something went wrong'),
              },
            });
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
          });

          if (this.replyService?.selectNoteMediaVal && this.replyService?.selectNoteMediaVal?.length > 0){
            this.replyService.clearNoteAttachmentSignal.set(true);
          }
          // console.log(replyObj);
        }
      } else {
        this.disableSaveButton = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message:  this.translate.instant('Reply-cannot-be-empty'),
          },
        });
      }
    }
  }
  closePreviousTicketCase(postData: BaseMention): void {
    const obj = {
      BrandID: postData?.brandInfo?.brandID,
      BrandName: postData?.brandInfo?.brandName,
      TicketID: postData?.ticketInfo?.ticketID,
      Status: 'C',
    };
    this.lockUnlockTicketApi = this._ticketService.lockUnlockTicket(obj).pipe(distinctUntilChanged()).subscribe((resp) => {
      if (resp.success) {
        // success
      }
    });
  }

  onTaggedMMTLink() {
    if (this.textAreaCount && this.textAreaCount.length && this.textAreaCount[0].text && this.previousMMTLink && this.textAreaCount[0].text.includes(this.previousMMTLink)){
        return
      }
    const brandFriendlyName = this.baseMentionObj?.brandInfo && this.baseMentionObj?.brandInfo?.brandFriendlyName ? this.baseMentionObj.brandInfo.brandFriendlyName.toLocaleLowerCase() : 'makemytrip';
      this.mmtLinkLoader = true;
      const obj = {
        referenceId: this.baseMentionObj?.ticketID,
        referenceType: "SocialMedia",
        org: brandFriendlyName == 'makemytrip' ? "MMT" : 'GI',
        ticketdetails: null,
        extraInfo: {
          starrating: this.baseMentionObj?.rating ? this.baseMentionObj?.rating : null,
          appversionname: this.baseMentionObj?.appVersionName ? this.baseMentionObj?.appVersionName : null,
          appversioncode: this.baseMentionObj?.appVersion ? this.baseMentionObj?.appVersion : null,
          device: this.baseMentionObj?.appFriendlyName ? this.baseMentionObj?.appFriendlyName : null,
          platform: this.baseMentionObj?.channelGroup == ChannelGroup.GooglePlayStore ? 'PlayStore' : 'AppStore',
        }
      }
    this.getMMTLinkApi = this.replyService.getMMTLink(obj).subscribe(res => {
        this.mmtLinkLoader = false;
        if (res && res.data && (res.data.errorDTO == null || res.data.errorDTO?.errorCode == 'DUPLICATE_REFERENCE')) {
          const link = res?.data?.response?.extraInfo?.shortUrl;
          if (link) {
            this.previousMMTLink = link
            if (this.textAreaCount && this.textAreaCount.length && !this.textAreaCount[0].text.includes(link)) {
              this.textAreaCount[0].text = `${this.textAreaCount[0].text} ${link}`;
            }
          }
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: res?.data?.errorDTO && res?.data?.errorDTO?.message ? res.data.errorDTO.message : this.translate.instant('Something-went-wrong-try-again'),
            },
          });
        }
        this.cdr.detectChanges();
      }, err => {
        this.mmtLinkLoader = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something-went-wrong-try-again'),
          },
        });
        this.cdr.detectChanges();
      })
  }
  
  checkLogAutoReply(postData: BaseMention, title: string): void {
    if (postData.channelGroup != 25) {
      const LogAutoReply = {
        BrandId: postData.brandInfo.brandID,
        logAutoReply: {
          IntentID: this.intentId,
          TagID: postData.tagID,
          MessageID: 0,
          SourceMessage: this.autoSugeestedResponse,
          CustomerMessage: title,
          ChannelType: postData.channelType,
          Status: AutoReplyStatus.Unsuccessful,
          UserID: postData.userID,
          LocalSuggestion: this.autoSugeestedResponse,
          LocalSuggestionList: JSON.stringify(
            this.locobuzzIntentDetectedResult
          ),
          LocalApiRequest: this.localAiApiRequestCannedResponse,
        },
      };

      const brandInfo = {
        BrandID: this.baseMentionObj.brandInfo.brandID,
        BrandName: this.baseMentionObj.brandInfo.brandName,
        BrandFriendlyName: this.baseMentionObj.brandInfo.brandFriendlyName,
      };

      this.getAutoCannedResponseStatusApi = this.replyService
        .getAutoCannedResponseStatus(brandInfo)
        .subscribe((res) => {
          if (res.data && res.data.isActive) {
            this.logAutoReply(LogAutoReply, this.autoSugeestedResponse);
          }
        });
    }
  }

  logAutoReply(LogAutoReplyJson, PersonalizedText: string): void {
    if (PersonalizedText != '') {
      let regxString = this.escapeRegExp(PersonalizedText.toLowerCase());
      let regx = new RegExp('(?<=(s|^))' + regxString + '(?=(s|$))');

      if (
        regx.test(LogAutoReplyJson.logAutoReply.CustomerMessage.toLowerCase())
      ) {
        LogAutoReplyJson.logAutoReply.Status = AutoReplyStatus.Successful;
      } else {
        let simplifiedtext =
          LogAutoReplyJson.logAutoReply.CustomerMessage.replace(/(\r\n)/gm, ' ')
            .replace(/(\n)/gm, ' ')
            .replace(/ +(?= )/g, '')
            .replace(
              this.emailSignatureParams
                ? this.emailSignatureParams.userSignature
                : '',
              ''
            )
            .toLowerCase();

        if (
          this.checkStringDifferenceInPercentage(
            PersonalizedText,
            simplifiedtext
          ) <= 25
        ) {
          LogAutoReplyJson.logAutoReply.Status = AutoReplyStatus.Successful;
        } else {
          LogAutoReplyJson.logAutoReply.Status = AutoReplyStatus.Unsuccessful;
        }
      }
    } else {
      LogAutoReplyJson.logAutoReply.Status = AutoReplyStatus.Unsuccessful;
    }
    // else if (isRejected) {
    // }
    //  else {
    //   LogAutoReply.Status = AutoReplyStatus.Untrained;
    // }

    // API call code
    this.logAutoMatedCannedReplyApi = this.replyService
      .logAutoMatedCannedReply(LogAutoReplyJson)
      .subscribe((data) => {});
  }

  escapeRegExp(string: string) {
    //return string.replace(/[\s.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    return string.replace(/(\\d|\\s|\\w|[.*+?^${}()|[\]\\])/g, '\\$&'); // $& means the whole matched string
  }

  checkStringDifferenceInPercentage(a: string, b: string): number {
    let equivalency = 0;
    let minLength = a.length > b.length ? b.length : a.length;
    let maxLength = a.length < b.length ? b.length : a.length;
    for (let i = 0; i < minLength; i++) {
      if (a[i].toLowerCase() == b[i].toLowerCase()) {
        equivalency++;
      }
    }
    let weight = equivalency / maxLength;
    return Math.round(100 - weight * 100);
  }

  checkAutoClosureEligibility(): void {
    const keyObj = {
      BrandID: this.baseMentionObj.brandInfo.brandID,
      BrandName: this.baseMentionObj.brandInfo.brandName,
    };

    this.checkAutoclosureEligibilityApi = this._ticketService
      .checkAutoclosureEligibility(keyObj)
      .subscribe((data) => {
        if (data.success) {
          this.autoclosureSettingChecked = true;
          this.isAutoClosuerEnable = data.data.isAutoClosuerEnable;
          this.isEligibleForAutoclosure = data.data.isAutoClosuerEnable;

          if (this.isEligibleForAutoclosure && this.isAutoClosuerEnable) {
            // thisobject1 = thisobj;
            // ConfirmModal("Do you want this ticket to be marked for auto closure as well?", "ChannelCommon.ConfirmOK(''," + JSON.stringify(Source) + "," + JSON.stringify(formData) + ", " + JSON.stringify(FoulKeywordData) + ")", "ChannelCommon.ConfirmCancel(''," + JSON.stringify(Source) + "," + JSON.stringify(formData) + ", " + JSON.stringify(FoulKeywordData) + ")");
            //ChannelCommon.Save1(thisobj, Source, formData, FoulKeywordData);
            const rememberMyAction = localStorage.getItem('isAutoClosure');
            if (rememberMyAction){
              if (rememberMyAction == 'true') {
                this.isEligibleForAutoclosure = true;
                this.saveReply();
              } else if (rememberMyAction == 'false') {
                this.isEligibleForAutoclosure = false;
                this.saveReply();
              }
            } else {
              const message = `Do you want this ticket to be marked for auto closure as well`;
              const dialogData = new AlertDialogModel(
                'Autoclosure',
                message,
                'Yes',
                'No'
              );
              dialogData.isAutoclosure = true;
              const dialogRef = this.dialog.open(AlertPopupComponent, {
                disableClose: true,
                autoFocus: false,
                data: dialogData,
              });

              dialogRef.afterClosed().subscribe((dialogResult) => {
                if (dialogResult == true) {
                  this.isEligibleForAutoclosure = true;
                  this.saveReply();
                } else if (dialogResult == false) {
                  this.isEligibleForAutoclosure = false;
                  this.saveReply();
                } else {
                  this.autoclosureSettingChecked = false;
                  this.isEligibleForAutoclosure = true;
                  this.actionProcessing = false;
                  this.disableSaveButton = false;
                  this.cdr.detectChanges();
                }
                // this.saveReply();
              });
            }
          } else if (
            !this.isEligibleForAutoclosure &&
            this.isAutoClosuerEnable
          ) {
            this.isEligibleForAutoclosure = true;
            this.saveReply();
            //ChannelCommon.Save1(thisobj, Source, formData, FoulKeywordData);
          } else {
            this.saveReply();
            // ChannelCommon.Save1(thisobj, Source, formData, FoulKeywordData);
          }
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: 'Api error while checking autoclosure setting',
            },
          });
        }
      });
  }

  forwardEmail(): void {
    this.actionProcessing = true;

    const sendToGroup = this.replyLinkCheckbox.find(
      (obj) => obj.replyLinkId == Replylinks.SendToGroups
    );
    if (this.emailToEmail.length == 0 && !sendToGroup.checked) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-Add-Email-Ids'),
        },
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      return;
    }

    if (this.groupToEmails.length == 0 && sendToGroup.checked) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-Add-Email-Ids'),
        },
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      return;
    }

    const forwardEmail: ForwardEmailRequestParameters = {};
    // forwardEmail.mention = this.baseMentionObj ;
    forwardEmail.mention = this._mapLocobuzzEntity.mapMention(
      this.baseMentionObj
    );
    forwardEmail.isSendGroupMail = this.sendtoGroupsClicked;
    forwardEmail.subject = this.sendEmailSubject;
    forwardEmail.emailContent = this.emailReplyText;
    forwardEmail.emailContent = forwardEmail.emailContent.replace(/'/g, '"');
    if (forwardEmail.emailContent) {
      forwardEmail.toEmailList =
        this.emailToEmail.length > 0 ? this.emailToEmail : [];
      forwardEmail.ccEmailList =
        this.emailCCEmails.length > 0 ? this.emailCCEmails : [];
      forwardEmail.bccEmailList =
        this.emailBCCEmails.length > 0 ? this.emailBCCEmails : [];

      if (this.sendtoGroupsClicked) {
        if (this.groupToEmails.length > 0) {
          forwardEmail.groupEmailList = {};
          forwardEmail.groupEmailList.email_to = this.groupToEmails.toString();
          forwardEmail.groupEmailList.email_cc = this.groupCCEmails
            ? this.groupCCEmails.toString()
            : '';
          forwardEmail.groupEmailList.email_bcc = this.groupBCCEmails
            ? this.groupBCCEmails.toString()
            : '';
          forwardEmail.groupEmailList.groupIDs = this.groupIDs;
        } else {
          this.actionProcessing = false;
          this.disableSaveButton = false;
          return;
        }
      }

      if (this.selectedMedia && this.selectedMedia.length > 0) {
        /* if(this.emailOutlook && !this.newThreadEmail){
          this.selectedMedia = this.selectedMedia.filter((res: any) => !res.forwardEmail);
        } */
        const attachments: AttachmentFile[] = [];
        this.selectedMedia.forEach((obj) => {
          const extension = obj?.isPostMedia ? obj?.displayFileName?.substr(obj?.displayFileName?.lastIndexOf('.') + 1) || null : obj?.mediaPath?.substr(obj?.mediaPath?.lastIndexOf('.') + 1);
          if (obj) {
            attachments.push({
              fileName: obj?.displayFileName,
              fullPath: obj.mediaPath,
              path: obj.mediaPath,
              mediaType: obj.mediaType,
              originalFileName: obj?.displayFileName,
              extension: extension,
              fileType: MediaEnum[obj.mediaType].toLowerCase(),
            });
          }
        });
        forwardEmail.filePathList = attachments;
      }

      if(this.emailForward){
        forwardEmail.isNewThread = this.newThreadEmail;
        if (forwardEmail && forwardEmail.emailContent){
          if (forwardEmail.emailContent.includes('---------- Forwarded message ---------<br />')){
            // if (this.emailOutlook && !this.newThreadEmail) {
            //   let stringArray: string[] = forwardEmail.emailContent.split('---------- Forwarded message ---------<br />');
            //   stringArray.pop();
            //   forwardEmail.emailContent = stringArray.join(' ');
            // }
          }  else {
            let authorName = this.baseMentionObj.author.socialId;
            let name = this.baseMentionObj.author.name;
            let data = '';
            let receivedText = this.baseMentionObj?.emailContent ? this.baseMentionObj.emailContent : '';
            if (this.baseMentionObj.mentionTime) {
              data = this.baseMentionObj.mentionTime ? moment.utc(this.baseMentionObj.mentionTime).local().format('ddd, MMM D, YYYY [at] h:mm A') : '';
            }
            let forwardedContent = "---------- Forwarded message ---------<br />";
            forwardedContent += "From: " + "<b>" + name + "</b>" + "&lt;" + authorName + "&gt;" + "<br/>";
            if (data) {
              forwardedContent += "Date: " + data + "<br/>";
            }
            forwardedContent += "Subject: " + this.baseMentionObj?.title + "<br/>";

            if (this.baseMentionObj?.toMailList && this.baseMentionObj?.toMailList.length) {
              forwardedContent += "To: " + "&lt;" + this.baseMentionObj?.toMailList.join() + "&gt;" + "<br/>";
            }
            if (this.baseMentionObj?.ccMailList && this.baseMentionObj?.ccMailList.length) {
              forwardedContent += "CC: " + "&lt;" + this.baseMentionObj?.ccMailList.join() + "&gt;" + "<br/>";
            }
            if (this.baseMentionObj?.bccMailList && this.baseMentionObj?.bccMailList.length) {
              forwardedContent += "BCC: " + "&lt;" + this.baseMentionObj?.bccMailList.join() + "&gt;" + "<br/>";
            }
            forwardedContent += "<br/>" + receivedText;
            forwardEmail.emailContent = forwardEmail.emailContent.concat(
              `<br>${forwardedContent}`
            );
          }
        }
      }

      const selectedHandle:any = this.ticketReplyDTO.handleNames.find(
        (obj) => obj.socialId === this.replyForm.get('replyHandler').value
      );

      if (this.emailForward && selectedHandle && selectedHandle?.accountId && forwardEmail?.mention?.settingID){
        forwardEmail.mention.settingID = selectedHandle?.accountId;
      }

      this.forwardReplyApi =this.replyService.forwardReply(forwardEmail, this.emailForward).subscribe(
        (response) => {
          if (response?.success) {
            this.replyService.closeReplyBox.next(false);
            // this.replyService.closeReplyBoxSignal.set(false);
            this.replyForm.get('ckeditorText').setValue('');
            this.emailReplyText = '';
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Email-sent-successfully'),
              },
            });
            this.cdr.detectChanges();
          } else {
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: response?.message ? response?.message: 'Unable to sent email',
              },
            });
            this.cdr.detectChanges();
          }
        },
        (err) => {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something went wrong'),
            },
          });
          this.actionProcessing = false;
          this.disableSaveButton = false;
          this.cdr.detectChanges();
        }
      );
    } 
    else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Sorry-email-body-is-empty'),
        },
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
    }
  }

  replyEscalateTo(): void {
    this.actionProcessing = true;
    let escalationMessage = this.replyForm.get('replyEscalateNote').value;
    if (this.voipEscalateMsg) {
      escalationMessage = this.voipEscalateMsg;
    }
    if (this.inBottomSheet && escalationMessage.trim() === '') {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-enter-escalation-message'),
        },
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
      return;
    }

    if (this.chatBotView && escalationMessage == '') {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-add-escalation-message'),
        },
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
      return;
    }

    if (
      this.ticketReplyDTO.agentUsersList &&
      this.ticketReplyDTO.agentUsersList.length > 0
    ) {
      if (
        +this.replyForm.get('escalateUsers').value > 0 ||
        this.voipEscalateUser
      ) {
        // check whether user is selected
        let escalatetouser = this.ticketReplyDTO.agentUsersList.find((obj) => {
          return obj.agentID === +this.replyForm.get('escalateUsers').value;
        });
        if (this.voipEscalateUser) {
          escalatetouser = this.ticketReplyDTO.agentUsersList.find((obj) => {
            return obj.agentID === +this.voipEscalateUser;
          });
        }

        //check whether team is selected
        let isTeam = false;
        if (!escalatetouser) {
          isTeam = true;
          escalatetouser = this.ticketReplyDTO.agentUsersList.find((obj) => {
            return obj.teamID === +this.replyForm.get('escalateUsers').value;
          });
          escalatetouser.agentID = null;
        }

        if (escalatetouser) {
          const performActionObj = this.replyService.BuildReply(
            this._postDetailService?.postObj,
            ActionStatusEnum.Escalate,
            escalationMessage,
            0,
            escalatetouser
          );
          const replyArray: Reply[] = [];

          const baseReply = new BaseReply();
          const customReplyObj = baseReply.getReplyClass();
          if (this.textAreaCount.length > 0 && !this.isEmailChannel) {
            for (const tweet of this.textAreaCount) {
              const customReply = baseReply.getReplyClass();
              customReply.replyText = tweet.text;

              replyArray.push(customReply);
            }
          } else {
            customReplyObj.replyText = escalationMessage;
            replyArray.push(customReplyObj);
          }
          performActionObj.Replies = replyArray;
          if (this.sendtoGroupsClicked) {
            if (this.groupToEmails.length > 0) {
              performActionObj.Replies[0].groupEmailList.email_to =
                this.groupToEmails.toString();
              performActionObj.Replies[0].groupEmailList.email_cc = this
                .groupCCEmails
                ? this.groupCCEmails.toString()
                : '';
              performActionObj.Replies[0].groupEmailList.email_bcc = this
                .groupBCCEmails
                ? this.groupBCCEmails.toString()
                : '';
              performActionObj.Replies[0].groupEmailList.groupIDs =
                this.groupIDs;
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: this.translate.instant('Please-Enter-Email-To-Forward'),
                },
              });
              this.actionProcessing = false;
              this.disableSaveButton = false;
              this.cdr.detectChanges();
              return;
            }
          }
          if (this.isEmailChannel) {
            performActionObj.ReplyFromAccountId =
              +this.baseMentionObj.settingID;
            performActionObj.Replies[0].toEmails =
              this.emailToEmail.length > 0 ? this.emailToEmail : [];
            performActionObj.Replies[0].ccEmails =
              this.emailCCEmails.length > 0 ? this.emailCCEmails : [];
            performActionObj.Replies[0].bccEmails =
              this.emailBCCEmails.length > 0 ? this.emailBCCEmails : [];
            if ((this.emailToEmail && this.emailToEmail.length) || (this.emailCCEmails && this.emailCCEmails.length || (this.emailBCCEmails && this.emailBCCEmails.length))){

            } else {
              if (this.baseMentionObj?.channelGroup == ChannelGroup.Email && !this.showEscalateview){
                this.actionProcessing = false;
                this.disableSaveButton = false;
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                    type: notificationType.Warn,
                    message: this.translate.instant('Please-Add-Email-Ids'),
                  },
                });
                this.cdr.detectChanges();
                return;
              }
            }
          }
          this.cdr.detectChanges();
          /* extra flag added */
          const logdinUser = JSON?.parse(localStorage?.getItem('user') || '{}');
          if (logdinUser && Object.keys(logdinUser)?.length > 0) {
            const actionButton = logdinUser?.data?.user?.actionButton;
            if (Object.keys(actionButton)?.length > 0) {
              if (performActionObj?.Source) performActionObj.Source['IsChatBotEnable'] = actionButton?.chatSectionEnabled || false;
            }
          }
          if (this.baseMentionObj?.channelGroup == ChannelGroup.Telegram) {
            performActionObj.TelegramReplyType = 1
          }
          if (this.baseMentionObj?.channelGroup == ChannelGroup.Telegram && this.baseMentionObj?.ticketInfo?.latestTagID && this.baseMentionObj?.ticketInfo?.tagID) {
            if (Number(this.baseMentionObj?.ticketInfo?.latestTagID) == Number(this.baseMentionObj?.ticketInfo?.tagID)) {
              performActionObj.TelegramReplyType = 2
            }
          } 
          /* extra flag added */
          // if (!this.authorDetails) {
          //   this.getAuthorTicketMandatoryDetails();
          // }
          // if (!this.mapTicketCustomFieldColumns(this.authorDetails)) {
          //   return;
          // }
          if (this.missingFieldsEscalation && this.missingFieldsEscalation.length && this.pageType !=  PostsType.chatbot) {
            this.showAlert();
            return
          }
          this.Reply2Api =this.replyService.Reply(performActionObj).subscribe((data) => {
            if (data?.success) {
              // console.log('closed successfull ', data);
              // this._filterService.currentBrandSource.next(true);
              this._filterService.currentBrandSourceSignal.set(true);

              this.replyService.closeReplyBox.next(false);
              // this.replyService.closeReplyBoxSignal.set(false);
              // this.dialogRef.close(true);
              this._postDetailService.postObj.ticketInfo.escalatedTo = isTeam
                ? escalatetouser.teamID
                : escalatetouser.agentID;
              this.replyService.replyActionPerformedSignal.set(
                this._postDetailService?.postObj
              );
              this._bottomSheet.dismiss();
              const Escalate = this._ticketService.GetActionEnum().Escalate;
              const msg = this._ticketService.GetToastMessageonPerformAction(
                Escalate,
                this._postDetailService?.postObj,
                this.currentUser
              );
              if (this.postDetailTab) {
                const CountData = {
                  MentionCount: null,
                  tab: this.postDetailTab.tab,
                  posttype: PostsType.Tickets,
                };
                // this._filterService.currentCountData.next(CountData);
                this._filterService.currentCountDataSignal.set(CountData);

              }
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: msg,
                },
              });
              // this._snackBar.open('Ticket escalated successfully', 'Ok', {
              //   duration: 2000,
              // });
              const autoUpdateWindow = localStorage.getItem('autoUpdateWindow') ? JSON.parse(localStorage.getItem('autoUpdateWindow')) : false;
              if (autoUpdateWindow && this.pageType == PostsType.TicketHistory) {
                this.closePreviousTicketCase(this.baseMentionObj);
                this._ticketService.agentAssignToObservableSignal.set(this.baseMentionObj);
              }
              this._ticketSignalrService.removeTicketCall.next(
                this._postDetailService?.postObj.ticketInfo.ticketID
              );
              if (this.pageType == PostsType.TicketHistory) {
                this._ticketService.ticketHistoryActionPerformObsSignal.set(this.baseMentionObj.tagID)
                if(escalatetouser.userRole==UserRoleEnum.CustomerCare)
                {
                  this._ticketService.ticketEscalationObsSignal.set(true)
                }
                this._postDetailService.ticketEscalateUpdateSignal.set({ status: true, ticketID: this._postDetailService?.postObj?.ticketInfo?.ticketID});
              }
              this.cdr.detectChanges();
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: data?.message ? data?.message : this.translate.instant('Some-Error-Occurred'),
                },
              });
            }
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
            // this.zone.run(() => {
          },err=>{
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translate.instant('Something-Went-Wrong'),
              },
            });
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-select-user-escalate-ticket'),
            },
          });
          this.actionProcessing = false;
          this.disableSaveButton = false;
          this.cdr.detectChanges();
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-select-user-escalate-ticket'),
          },
        });
        this.actionProcessing = false;
        this.disableSaveButton = false;
        this.cdr.detectChanges();
      }
    } else {
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
    }
  }

  BuildComminicationLog(baseMention: BaseMention): TicketsCommunicationLog[] {
    const tasks: TicketsCommunicationLog[] = [];
    const actionEnum = ReplyOptions.GetActionEnum();
    const selectedReplyType = this.replyForm.get('replyType').value;
    switch (+selectedReplyType) {
      case ActionStatusEnum.DirectClose: {
        // if ($.trim(formObject.txtNotes) != '') {
        //     let noteLog = CommunicationLogGenerator._getCommunicationLogForNote();
        //     noteLog.Note = $.trim(formObject.txtNotes);
        //     tasks.push(noteLog);
        // }

        const log = new TicketsCommunicationLog(ClientStatusEnum.Closed);

        tasks.push(log);

        baseMention.ticketInfo.makerCheckerStatus =
          MakerCheckerEnum.DirectClose;
        break;
      }
      case ActionStatusEnum.Reply: {
        const logreply = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        tasks.push(logreply);
        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
            const log2 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log2);
          }
        });
        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.Reply;
        break;
      }
      case ActionStatusEnum.ReplyAndClose: {
        const log1 = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        const log2 = new TicketsCommunicationLog(ClientStatusEnum.Closed);

        tasks.push(log1);
        tasks.push(log2);
        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
            const log3 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log3);
          }
        });
        // this.replyLinkCheckbox.forEach((obj) => {
        //   if (obj.checked && obj.replyLinkId === Replylinks.SendSurveyForm) {
        //     const log4 = new TicketsCommunicationLog(
        //       ClientStatusEnum.SurveyFormSent
        //     );
        //     tasks.push(log4);
        //   }
        // });

        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.ReplyClose;
        break;
      }
      case ActionStatusEnum.Escalate: {
        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '' || this.replyService.selectedNoteMediaVal) {
          const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log1.Note = escalationMessage.trim();
          log1.NotesAttachment = this.replyService.selectedNoteMediaVal.length > 0 ? this.replyService.selectedNoteMediaVal : null;
          tasks.push(log1);
        }

        const log3 = new TicketsCommunicationLog(ClientStatusEnum.Escalated);

        if (
          this.ticketReplyDTO.agentUsersList &&
          this.ticketReplyDTO.agentUsersList.length > 0
        ) {
          let escalatetouser = this.ticketReplyDTO.agentUsersList.find(
            (obj) => {
              return obj.agentID === +this.replyForm.get('escalateUsers').value;
            }
          );

          if (!escalatetouser) {
            escalatetouser = this.ticketReplyDTO.agentUsersList.find((obj) => {
              return obj.teamID === +this.replyForm.get('escalateUsers').value;
            });
            escalatetouser.agentID = null;
          }

          log3.AssignedToUserID = escalatetouser.agentID;
          log3.AssignedToTeam = escalatetouser.teamID;
        }

        tasks.push(log3);
        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.Escalate;
        break;
      }
      case ActionStatusEnum.ReplyAndEscalate: {
        const log1 = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        const log2 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
        const log3 = new TicketsCommunicationLog(ClientStatusEnum.Escalated);
        if (
          this.ticketReplyDTO.agentUsersList &&
          this.ticketReplyDTO.agentUsersList.length > 0
        ) {
          let escalatetouser = this.ticketReplyDTO.agentUsersList.find(
            (obj) => {
              return obj.agentID === +this.replyForm.get('escalateUsers').value;
            }
          );
          if (!escalatetouser) {
            escalatetouser = this.ticketReplyDTO.agentUsersList.find((obj) => {
              return obj.teamID === +this.replyForm.get('escalateUsers').value;
            });
            escalatetouser.agentID = null;
          }

          log3.AssignedToUserID = escalatetouser.agentID;
          log3.AssignedToTeam = escalatetouser.teamID;
        }

        tasks.push(log1);
        const escalationMessage = this.replyForm.get('replyEscalateNote').value;

        if (escalationMessage.trim() !== '' || this.replyService.selectedNoteMediaVal) {
          log2.Note = escalationMessage.trim();
          log2.NotesAttachment = this.replyService.selectedNoteMediaVal.length > 0 ? this.replyService.selectedNoteMediaVal : null;
          tasks.push(log2);
        }
        tasks.push(log3);
        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
            const log4 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log4);
          }
        });

        baseMention.ticketInfo.makerCheckerStatus =
          MakerCheckerEnum.ReplyEscalate;
        // throw new Error();
        break;
      }
      case ActionStatusEnum.ReplyAndAssign: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.RepliedToUser);
        const log2 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
        const postObj:BaseMention = this._postDetailService.postObj;
        
        let findData = this._filterService.fetchedAssignTo.find((obj) => { return obj.agentID == this.replyForm.value.assignToid; });
        if (Object.keys(findData || {}).length === 0) {
          findData = this._filterService.fetchedAssignToBrandWise.find((obj) => { return obj.agentID == this.replyForm.value.assignToid; });
        }
        let escalatetouser = findData;

        let fromteam = false;
        if(this.teamSelectedData.length > 0) { fromteam = true}
        else { fromteam = false }

        const log = new TicketsCommunicationLog(ClientStatusEnum.Assigned);
        let teamDetails;
        if (fromteam) {
          let findData = this._filterService.fetchedAssignTo.find((obj) => { return obj.teamID == this.teamSelectedData[0] });
          if (Object.keys(findData || {}).length === 0) {
            findData = this._filterService.fetchedAssignToBrandWise.find((obj) => { return obj.teamID == this.teamSelectedData[0] });
          }
          teamDetails = findData;
          log.AssignedToTeam = this.teamSelectedData[0];
        } 
        else {
          log.AssignedToUserID = this.replyForm.value.assignToid;
          log.AssignedToTeam = escalatetouser.teamID;
        }

        tasks.push(log1);
        const escalationMessage = this.replyForm.get('replyEscalateNote').value;

        if (escalationMessage.trim() !== '' || this.replyService.selectedNoteMediaVal) {
          log2.Note = escalationMessage.trim();
          log2.NotesAttachment = this.replyService.selectedNoteMediaVal.length > 0 ? this.replyService.selectedNoteMediaVal : null;
          tasks.push(log2);
        }
        tasks.push(log);
        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
            const log4 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log4);
          }
        });

        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.Reply;
        break;
      }
      case ActionStatusEnum.CreateTicket: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.CaseDetach);
        const log2 = new TicketsCommunicationLog(ClientStatusEnum.CaseCreated);
        const log3 = new TicketsCommunicationLog(ClientStatusEnum.CaseAttach);
        const log4 = new TicketsCommunicationLog(ClientStatusEnum.Acknowledge);

        tasks.push(log4);
        tasks.push(log1);
        tasks.push(log2);
        tasks.push(log3);

        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log5 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log5.Note = escalationMessage.trim();
          tasks.push(log5);
        }

        break;
      }
      case ActionStatusEnum.AttachTicket: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.CaseDetach);
        const log2 = new TicketsCommunicationLog(ClientStatusEnum.CaseAttach);

        // log2.TicketID = formObject.ddlCaseAttachmentList;

        tasks.push(log1);
        tasks.push(log2);

        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log3 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log3.Note = escalationMessage.trim();
          tasks.push(log3);
        }
        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.CaseAttach;
        break;
      }
      case ActionStatusEnum.Approve: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.Approve);

        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log2 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log2.Note = escalationMessage.trim();
          tasks.push(log2);
        }

        tasks.push(log1);
        break;
      }
      case ActionStatusEnum.Reject: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.Ignore);

        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log2 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log2.Note = escalationMessage.trim();
          tasks.push(log2);
        }

        tasks.push(log1);
        break;
      }
      case ActionStatusEnum.EscalateToBrand: {
        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log1.Note = escalationMessage.trim();
          tasks.push(log1);
        }

        const log2 = new TicketsCommunicationLog(ClientStatusEnum.Escalated);
        if (
          this.ticketReplyDTO.agentUsersList &&
          this.ticketReplyDTO.agentUsersList.length > 0
        ) {
          let escalatetouser = this.ticketReplyDTO.agentUsersList.find(
            (obj) => {
              return obj.agentID === +this.replyForm.get('escalateUsers').value;
            }
          );

          if (!escalatetouser) {
            escalatetouser = this.ticketReplyDTO.agentUsersList.find((obj) => {
              return obj.teamID === +this.replyForm.get('escalateUsers').value;
            });
            escalatetouser.agentID = null;
          }

          log2.AssignedToUserID = escalatetouser.agentID;
          log2.AssignedToTeam = escalatetouser.teamID;
        }
        tasks.push(log2);
        break;
      }
      case ActionStatusEnum.BrandApproved: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.Approve);

        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log2 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log2.Note = escalationMessage.trim();
          tasks.push(log2);
        }

        tasks.push(log1);
        break;
      }
      case ActionStatusEnum.BrandReject: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.Ignore);

        if (this.currentBrand.isBrandworkFlowEnabled) {
          if (
            this.ticketReplyDTO.agentUsersList &&
            this.ticketReplyDTO.agentUsersList.length > 0
          ) {
            let escalatetouser = this.ticketReplyDTO.agentUsersList.find(
              (obj) => {
                return (
                  obj.agentID === +this.replyForm.get('escalateUsers').value
                );
              }
            );

            if (!escalatetouser) {
              escalatetouser = this.ticketReplyDTO.agentUsersList.find(
                (obj) => {
                  return (
                    obj.teamID === +this.replyForm.get('escalateUsers').value
                  );
                }
              );
              escalatetouser.agentID = null;
            }

            log1.AssignedToUserID = escalatetouser.agentID;
            log1.AssignedToTeam = escalatetouser.teamID;
          }
        }
        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log2 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log2.Note = escalationMessage.trim();
          tasks.push(log2);
        }

        tasks.push(log1);
        break;
      }
      case ActionStatusEnum.ReplyAndAwaitingCustomerResponse: {
        const log1 = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        const log2 = new TicketsCommunicationLog(
          ClientStatusEnum.CustomerInfoAwaited
        );
        tasks.push(log1);
        tasks.push(log2);
        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
            const log3 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log3);
          }
        });

        baseMention.ticketInfo.makerCheckerStatus =
          MakerCheckerEnum.ReplyAwaitingResponse;

        break;
      }
      case ActionStatusEnum.ReplyAndOnHold: {
        const log1 = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        const log2 = new TicketsCommunicationLog(ClientStatusEnum.OnHold);
        tasks.push(log1);
        tasks.push(log2);
        // this.replyLinkCheckbox.forEach((obj) => {
        //   if (obj.checked && obj.replyLinkId === Replylinks.SendSurveyForm) {
        //     const log4 = new TicketsCommunicationLog(
        //       ClientStatusEnum.SurveyFormSent
        //     );
        //     tasks.push(log4);
        //   }
        // });
        /* in frontend we make condition like feedback option available when replyand close option selected on line 442 */
        /* this.replyLinkCheckbox.forEach((obj) => {
          if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
            const log3 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log3);
          }
        }); */
        /* in frontend we make condition like feedback option available when replyand close option selected line 442 */

        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.ReplyHold;
        break;
      }
      case ActionStatusEnum.ReplyNewMentionCameAfterEsalatedorOnHold: {
        const log1 = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        const log2 = new TicketsCommunicationLog(
          ClientStatusEnum.NewMentionCameAfterEsalatedorOnHold
        );

        tasks.push(log1);
        tasks.push(log2);

        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
            const log3 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log3);
          }
        });
        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.Reply;
        break;
      }
      case ActionStatusEnum.Acknowledge: {
        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log1.Note = escalationMessage.trim();
          tasks.push(log1);
        }

        const log2 = new TicketsCommunicationLog(ClientStatusEnum.Acknowledge);
        tasks.push(log2);
        break;
      }
      case ActionStatusEnum.ReplyAndReject: {
        const log1 = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        tasks.push(log1);
        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
            const log2 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log2);
          }
        });
        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.Reply;

        const logReject = new TicketsCommunicationLog(ClientStatusEnum.Ignore);

        if (this.currentBrand.isBrandworkFlowEnabled) {
          if (
            this.ticketReplyDTO.agentUsersList &&
            this.ticketReplyDTO.agentUsersList.length > 0
          ) {
            let escalatetouser = this.ticketReplyDTO.agentUsersList.find(
              (obj) => {
                return (
                  obj.agentID === +this.replyForm.get('escalateUsers').value
                );
              }
            );

            if (!escalatetouser) {
              escalatetouser = this.ticketReplyDTO.agentUsersList.find(
                (obj) => {
                  return (
                    obj.teamID === +this.replyForm.get('escalateUsers').value
                  );
                }
              );
              escalatetouser.agentID = null;
            }

            logReject.AssignedToUserID = escalatetouser.agentID;
            logReject.AssignedToTeam = escalatetouser.teamID;
          }
        }
        const escalationMessage = this.replyForm.get('replyEscalateNote').value;
        if (escalationMessage.trim() !== '') {
          const log3 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log3.Note = escalationMessage.trim();
          tasks.push(log3);
        }

        tasks.push(logReject);
      }
      default:
        break;
    }
    tasks.forEach((obj) => {
      obj.TagID = String(baseMention.tagID);
    });
    return tasks;
  }

  onTaggedUserChange(event): void {
    const tagObj = this.ticketReplyDTO.taggedUsers.find((obj) => obj.Userid === event.source.value);
    if (tagObj) {
      
      tagObj.Checked = event.checked

      if (event.checked) { this.selectedTagUsers.push(tagObj); }
      else {
        this.selectedTagUsers = this.selectedTagUsers.filter((obj) => { return obj.Userid !== tagObj?.Userid; });
      }
      const tempSelectID = this.selectedTagUsers.map(item => { return item.Userid })
      this.unSelectedTagUsers = this.ticketReplyDTO.taggedUsers.filter(item => !(tempSelectID.includes(item.Userid)));
    }
  }

  replyTypeChange(event): void {
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.baseMentionObj?.brandInfo?.brandID
    );
    if (event == 4 && brandInfo?.typeOfCRM == 101){
        this.callEscalationListAPI({
          Brand: this._postDetailService?.postObj.brandInfo,
        });
        this.showEscalateview = true;
        this.showEmailView = false;
        this.setEscalationLabel();
      this.replyForm
        .get('replyEscalateNote')
        .setValue(
          brandInfo.typeOfCRM != 101 ? `Your SR is created, Your SR ID is: ${this.baseMentionObj.ticketInfo.srid}. We will get back to you soon` : this.srCreatedMessage
        );
      return;
    }
    const replyopt = new ReplyOptions();
    this.IsreplyAndEscalate = +event === 5 ? true : false;
    if (+event !== 5) {
      this.IsreplyAndEscalate = +event === 17 ? true : false;
    }
    this.IsreplyAndAssign = +event === 18 ? true : false;

    if (this.isSendFeedBackClosedCheckedDisabledFlag) {
      this.replyLinkCheckbox.forEach((element) => {
        if (element.replyLinkId == Replylinks.SendFeedback) {
          element.checked = true;
          element.disabled = true;
        }
      });
    } else if (this.isSendFeedBackClosedCheckedFlag) {
      this.replyLinkCheckbox.forEach((element) => {
        if (element.replyLinkId == Replylinks.SendFeedback) {
          element.checked = true;
          element.disabled = false;
        }
      });
    }
    if (this.IsreplyAndEscalate && this._postDetailService.isBulk) {
      this.escalateMsg = true;
    } else {
      this.escalateMsg = false;
    }
   
    if (event == 14) {
      if (brandInfo && brandInfo.isSafeFormActive) {
        if (
          this.baseMentionObj.channelType == ChannelType.FBMessages ||
          this.baseMentionObj.channelType == ChannelType.Email ||
          this.baseMentionObj.channelType == ChannelType.WhatsApp ||
          this.baseMentionObj.channelType == ChannelType.InstagramMessages ||
          this.baseMentionObj.channelType == ChannelType.DirectMessages ||
          this.baseMentionObj.channelType == ChannelType.WesiteChatbot
        ) {
          const index = this.replyLinkCheckbox.findIndex(
            (obj) => obj.replyLinkId == Replylinks.PersonalDetailsRequired
          );
          if (index > -1) {
          } else {
            this.replyLinkCheckbox.push({
              name: 'Personal Details Required',
              socialId: '',
              replyLinkId: Replylinks.PersonalDetailsRequired,
              checked: false,
              disabled: false,
            });
          }
        } else {
          const sendDmLinkFlag = this.replyLinkCheckbox.some(
            (obj) => obj.replyLinkId == Replylinks.SendAsDM && obj.checked
          );
          if (sendDmLinkFlag) {
            const index = this.replyLinkCheckbox.findIndex(
              (obj) => obj.replyLinkId == Replylinks.PersonalDetailsRequired
            );
            if (index > -1) {
              // this.replyLinkCheckbox.splice(index, 1);
            } else {
              this.replyLinkCheckbox.push({
                name: 'Personal Details Required',
                socialId: '',
                replyLinkId: Replylinks.PersonalDetailsRequired,
                checked: false,
                disabled: false,
              });
            }
          }
        }
      }
    } else {
      if (brandInfo && brandInfo.isSafeFormActive) {
        const index = this.replyLinkCheckbox.findIndex(
          (obj) => obj.replyLinkId == Replylinks.PersonalDetailsRequired
        );
        if (index > -1) {
          this.replyLinkCheckbox.splice(index, 1);
        }
      }
    }

    if (brandInfo.isFeedbackEnabled && this.feedbackFormValue == 0 && this.sendFeedBack)
    {
      if (event != 3) {
        const index = this.replyLinkCheckbox.findIndex((obj)=>obj.replyLinkId==Replylinks.SendFeedback);
       index>-1? this.replyLinkCheckbox.splice(index,1):0;
      } else {
        this.replyLinkCheckbox.unshift({
          name: 'Send Feedback',
          socialId: this.baseMentionObj.socialID,
          replyLinkId: Replylinks.SendFeedback,
          checked: true,
          disabled:  true,
          feedbackForm: this.feedbackFormValue
        })
      }
    }

    if (brandInfo.isFeedbackEnabled && (this.feedbackFormValue == 1 || this.feedbackFormValue == 2 || this.feedbackFormValue == 3) && this.sendFeedBack) {
      if(event!=3)
      {
        this.replyLinkCheckbox.forEach((obj)=>
        {
          if (obj.replyLinkId == Replylinks.SendFeedback)
          {
            obj.checked=false;
          }
        })
      }else{
        this.replyLinkCheckbox.forEach((obj) => {
          if (obj.replyLinkId == Replylinks.SendFeedback) {
            obj.checked = true;
          }
        })
      }
    }

    // this._chatBotService.chatBotHideObs.next({ status: true });
    this._chatBotService.chatBotHideObsSignal.set({ status: true });

    this.replyTypeName = this.ticketReplyDTO.replyOptions.find((obj) => obj.id == event).value;
    if(this.authorDetails){
      this.mapTicketCustomFieldColumns(this.authorDetails);
    }
  }
  setAssigntoFromValue(form): void {
    this.replyForm.get('assignToid').patchValue(form.value);
    this.selectedAssignTo = form.value;
  }

  SetNextClick(): void {
    if ((this.emailToEmail && this.emailToEmail.length) || (this.emailCCEmails && this.emailCCEmails.length || (this.emailBCCEmails && this.emailBCCEmails.length))) {
    } else {
      if (this.baseMentionObj?.channelGroup == ChannelGroup.Email && !this.onlyEscalation) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-Add-Email-Ids'),
          },
        });
        this.cdr.detectChanges();
        return;
      }
    }
    // const replytext = this.replyForm.get('replyText').value;
    let replytext = this.textAreaCount[0].text;
    if (this.onlySendMail || this.isEmailChannel) {
      replytext = this.emailReplyText;
    }
    let telegramContentValid = false;
    if (this.baseMentionObj.channelGroup == ChannelGroup.Telegram) {
      if (replytext.trim()) {
        if (this.selectedMedia.length > 0) {
           telegramContentValid = false;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('support-media-reply-limit-message'),
            },
          });
          return
        } else {
          telegramContentValid = true;
        }
      } if (this.selectedMedia.length > 0) {
        telegramContentValid = true;
      }
    }

    if (this.baseMentionObj.channelGroup === ChannelGroup.Instagram && this.baseMentionObj.channelType === ChannelType.InstagramComments) {
      if (`${this.baseMentionObj?.author?.screenname}`.length > 0) {

        const commentHandler: string = `@${this.baseMentionObj?.author?.screenname} `;
        const withOutCommentHandleReplayText = replytext.split(commentHandler);

        if (replytext.includes(commentHandler)) {
          if (withOutCommentHandleReplayText.length == 1) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message:  this.translate.instant('Reply-cannot-be-empty'),
              },
            });
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
            return;
          }

          if (withOutCommentHandleReplayText.length > 1 && withOutCommentHandleReplayText[1].trim().length == 0) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message:  this.translate.instant('Reply-cannot-be-empty'),
              },
            });
            this.actionProcessing = false;
            this.disableSaveButton = false;
            this.cdr.detectChanges();
            return;
          }
        }
      }
    }

    if (this.IsreplyAndAssign && (replytext.trim() || telegramContentValid)){
      if (this.showReplyAssignView && this.sendtoGroupsClicked) {
        this.showEscalateview = false;
        this.showReplyAssignView = false;
        this.showGroupsView = true;
        this.showReplySection = false;
        this.showEmailView = false;
      } else {
        if (!this.showGroupsView){
          this.showReplyAssignView = true;
          this.showEmailView = false;
        }
        this._postAssignToService.getAssignedUsersList(
          this.currentUser,
          this.baseMentionObj?.makerCheckerMetadata?.workflowStatus
        );
        // this._postDetailService.isBulk = false;
        this.assignTo = this._postAssignToService.assignTo$;
        this.subs.add(
          this.loadingUsersApi = this._postAssignToService.loadingUsers.subscribe((data) => {
            this.loadingUserList = data;
          })
        );
        if (this._postDetailService.postObj.ticketInfo.assignedTo > 0) {
          this.selectedAssignTo =
            this._postDetailService.postObj.ticketInfo.assignedTo;
        } else {
          this.selectedAssignTo =
            this._postDetailService.postObj.ticketInfo.assignedToTeam &&
              this._postDetailService.postObj.ticketInfo.assignedToTeam > 0
              ? this._postDetailService.postObj.ticketInfo.assignedToTeam
            : this.selectedAssignTo;
        }
      }
    } else {
      this.showReplyAssignView = false;
    }

    if ((!this.showEscalateview && (replytext.trim() || telegramContentValid)) || this.showEscalateview) {
      if (this.showEscalateview && this.sendtoGroupsClicked) {
        this.showEscalateview = false;
        this.showGroupsView = true;
        this.showReplySection = false;
        this.showEmailView = false;
      }
      if (this.IsreplyAndEscalate && !this.showGroupsView) {
        this.callEscalationListAPI({
          Brand: this._postDetailService?.postObj.brandInfo,
        });
        this.showEscalateview = true;
        this.showEmailView = false;
        const obj = {
          Brand: this.baseMentionObj.brandInfo,
          ChannelGroup: this.baseMentionObj.channelGroup,
        };
        // if (this.baseMentionObj.channelGroup == this.channelGroup.Email) {
        //   this.replyService
        //     .GetUsersWithTicketCount(obj.Brand)
        //     .subscribe((data) => {
        //       this.modAgentList = data;
        //       this.ticketReplyDTO.agentUsersList = data;
        //       this.buildAgentUserList();
        //       this.userListLoading = false;
        //     });
        // }
        this.setEscalationLabel();
      }
      if (!this.IsreplyAndEscalate && !this.IsreplyAndAssign && this.sendtoGroupsClicked) {
        this.showEscalateview = false;
        this.showGroupsView = true;
        this.showReplySection = false;
        this.showEmailView = false;
      }

      if (this.IsreplyAndEscalate && this._postDetailService.isBulk) {
        this.escalateMsg = true;
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:  this.translate.instant('Reply-cannot-be-empty'),
        },
      });
    }
    this.cdr.detectChanges();
    console.log(this.selectedAssignTo, 'selectedAssignTo');

  }
  SetBackClick(): void {
    console.log(this.selectedAssignTo, 'selectedAssignTo');
    if(this.IsreplyAndAssign && this.showReplyAssignView) {
      this.showReplyAssignView = false;
    }
    if (this.IsreplyAndAssign && !this.showReplyAssignView) {
      if (this.showGroupsView) {
        this.showGroupsView = false;
        this.showReplySection = true;
        this.showReplyAssignView = true;
      } else {
        if (this.isEmailChannel) {
          this.showEmailView = true;
          this.showReplySection = false;
        }
      }
    }

    if (this.showGroupsView) {
      this.showGroupsView = false;
      this.showReplySection = true;
      if (this.IsreplyAndEscalate) {
        this.showEscalateview = true;
      } else {
        if (this.isEmailChannel) {
          this.showEmailView = true;
          this.showReplySection = false;
        }
      }
    } else if (this.showEscalateview) {
      this.showEscalateview = false;
        this.selectedReplyType = 5;
      if (this.isEmailChannel) {
        this.showEmailView = true;
        this.showReplySection = false;
      }
    }

    if (this.IsreplyAndEscalate && this._postDetailService.isBulk) {
      this.escalateMsg = true;
    }
    this.mediaSelectedTimeout = setTimeout(() => {
      this.mediaSelectedAsync.next(this.selectedMedia);
      this.createAttachmentMediaPillView();
      setTimeout(() => {
        this.checkEmailAttachmentWidth();
      }, 300);
      this.taggedUsersAsync.next(this.ticketReplyDTO.taggedUsers);
      this.cdr.detectChanges();
    },0);
    // this.ReplyInputChangesCopy(this.replyTextInitialValue);
  }

  setEscalationLabel(): void {
    if (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount) {
      const checkReplyType = +this.replyForm.get('replyType').value;
      if (checkReplyType === 17) {
        this.escalationLabel = this.translate.instant('Assign-To');
        this.escalationPlaceholder = this.translate.instant('Write-assignment-message-here');
      }
    }
  }

  checkIfBrandReplyAndReject(): void {
    if (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount) {
      if (this.currentBrand.isBrandworkFlowEnabled) {
        if (
          this.baseMentionObj.ticketInfo.escalatedTo > 0 ||
          this.baseMentionObj.ticketInfo.escalatedToCSDTeam > 0
        ) {
          let idtoattch = 0;

          if (this.baseMentionObj.ticketInfo.escalatedTo > 0) {
            idtoattch = this.baseMentionObj.ticketInfo.escalatedTo;
          } else {
            idtoattch = this.baseMentionObj.ticketInfo.escalatedToCSDTeam;
          }

          if (
            this.customAgentList.findIndex(
              (obj) => obj.agentID === idtoattch || obj.teamID === idtoattch
            ) > -1
          ) {
            this.replyForm.patchValue({
              escalateUsers: idtoattch,
            });
            this.escalateUsers = idtoattch;
          }
        }
      }
    }
  }

  ShowEmailGroups(): void {}

  checkPreviousMailStatus(): void {
    const result = this.replyLinkCheckbox.find(
      (res) => res.name == 'Add previous mail trail'
    );
    if (result) {
      this.showPrevoiusMail = result.checked;
    }
    this.cdr.detectChanges();
  }

  // selectSurveyForm(event){
  //   const dialogRef = this.dialog.open(FeedbackFromPreviewComponent, {
  //     width: '80vw',
  //     data: this.currentBrand,
  //   });

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       this.selectedSurveyForm = result;
  //     } else {
  //       this.replyLinkCheckbox.forEach((obj) => {
  //         if (obj.replyLinkId === +event.source.value) {
  //           obj.checked = false;
  //           this.cdkRef.detectChanges();
  //         }
  //       });
  //     }
  //   });
  // }
  onReplyLinkChange(event, checkboxTitle?: string): void {
    if (checkboxTitle == 'Add previous mail trail') {
      this.showPrevoiusMail = event.checked;
      if (event.checked) {
        // let updatedAt = moment(this.baseMentionObj.mentionTime).format(
        //   'DD-MMMM-YYYY HH:mm a'
        // );
        // let authorName = this.baseMentionObj.author.socialId;
        // let receivedText = this.baseMentionObj.emailContent;
        // let createdText = 'On ' + updatedAt + ', ' + authorName + ' wrote: ';
        // this.storedReceivedText = createdText.concat(receivedText);
        // this.emailReplyText = this.emailReplyText.concat(this.storedReceivedText);
      } else {
        // const strArry = this.emailReplyText.split('<p><br />');
        // if(strArry && strArry.length) {
        //   this.emailReplyText = strArry[0];
        // }
        this.emailReplyText = '';
      }
      this.ckeditorRef.focus();
    }
    // console.log(event);
    if (event.checked) {
      this.replyLinkCheckbox.forEach((obj) => {
        if (obj.replyLinkId === +event.source.value) {
          obj.checked = true;
        }
        return obj;
      });
      if (+event.source.value === Replylinks.SendAsDM) {
        this.replyLinkCheckbox = this.replyLinkCheckbox.map((obj) => {
          if (obj.replyLinkId === Replylinks.SendDMLink) {
            obj.checked = false;
            obj.disabled = true;
          }
          return obj;
        });
        this.sendDMClicked(true);
        this.createPersonalDetailsRequiredCheckBox();
        if(this.baseMentionObj?.channelGroup==ChannelGroup.Facebook)
        {
          const currentBrand = this._filterService.fetchedBrandData.filter(
            (obj) => Number(obj.brandID) === this.baseMentionObj?.brandInfo?.brandID
          );
          if(this.feedbackFormValue != 3){
            this.replyLinkCheckbox.unshift({
              name: 'Send Feedback',
              socialId: this.baseMentionObj?.socialID,
              channelType: this.baseMentionObj?.channelType,
              replyLinkId: Replylinks.SendFeedback,
              checked: this.feedbackFormValue == 1 ? true : false,
              disabled: !currentBrand[0].isFeedbackEnabled,
              feedbackForm: this.feedbackFormValue
            });
          }
        }
      }
      if (+event.source.value === Replylinks.SendToGroups) {
        this.sendtoGroupsClicked = true;
        this.getEmailGroups(this.baseMentionObj.brandInfo);
      }
      if (+event.source.value === Replylinks.SendDMLink) {
        this.setDMLink(true);
      }
      if (+event.source.value === Replylinks.PersonalDetailsRequired) {
        this.setPersonalDetailsForm(true);
      }
      // if (+event.source.value === Replylinks.SendSurveyForm) {
      //   this.selectSurveyForm(event);
      // }
    } else {
      this.replyLinkCheckbox.forEach((obj) => {
        if (obj.replyLinkId === +event.source.value) {
          obj.checked = false;
        }
        return obj;
      });

      if (+event.source.value === Replylinks.SendAsDM) {
        this.replyLinkCheckbox = this.replyLinkCheckbox.map((obj) => {
          if (obj.replyLinkId === Replylinks.SendDMLink) {
            obj.checked = false;
            obj.disabled = false;
          }
          return obj;
        });
        this.sendDMClicked(false);
        this.createPersonalDetailsRequiredCheckBox();
        if (this.baseMentionObj?.channelGroup == ChannelGroup.Facebook) {
        const index = this.replyLinkCheckbox.findIndex((obj) => obj.replyLinkId === Replylinks.SendFeedback);
          if (index > -1 && this.feedbackFormValue != 3)
        {
          this.replyLinkCheckbox.splice(index,1);
        }
      }
      }

      if (+event.source.value === Replylinks.SendToGroups) {
        this.sendtoGroupsClicked = false;
      }
      if (+event.source.value === Replylinks.SendDMLink) {
        this.setDMLink(false);
      }
      if (+event.source.value === Replylinks.PersonalDetailsRequired) {
        this.setPersonalDetailsForm(false);
      }
    }
  }

  setDMLink(checked): void {
    const replylinkObj = this.replyLinkCheckbox.find((obj) => {
      return obj.replyLinkId === Replylinks.SendDMLink;
    });

    if (
      (replylinkObj.channelType === ChannelType.Twitterbrandmention ||
        replylinkObj.channelType === ChannelType.PublicTweets) &&
      replylinkObj.replyScreenName
    ) {
      const selectedHandle = this.ticketReplyDTO.handleNames.find(
        (obj) => obj.socialId === this.replyForm.get('replyHandler').value
      );

      if (checked) {
        if (this.maxLengthInput >= 24) {
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          let found = false;
          // eslint-disable-next-line @typescript-eslint/prefer-for-of
          for (let i = 0; i < this.textAreaCount.length; i++) {
            // if (this.textAreaCount[i].postCharacters >= 24) {
            this.textAreaCount[this.textAreaCount.length - 1].text =
              this.textAreaCount[this.textAreaCount.length - 1].text +
              ' ' +
              `https://twitter.com/messages/compose?recipient_id=${selectedHandle.socialId}`;
            this.ReplyInputChangesModifiedCopy(
              this.textAreaCount[i].text,
              this.textAreaCount[i].id
            );
            found = true;
            break;
          }
          // }
          if (!found) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Reply-Max-Length-Reached'),
              },
            });
            return;
          }
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Reply-Max-Length-Reached'),
            },
          });
          return;
        }
      } else {
        const url = `https://twitter.com/messages/compose?recipient_id=${selectedHandle.socialId}`;
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.textAreaCount.length; i++) {
          if (this.textAreaCount[i].text.indexOf(url) > -1) {
            this.textAreaCount[i].text = this.textAreaCount[i].text.replace(
              url,
              ''
            );
            this.ReplyInputChangesModifiedCopy(
              this.textAreaCount[i].text,
              this.textAreaCount[i].id
            );
            break;
          }
        }
      }
    }
  }

  sendDMClicked(checked): void {
    const selectedHandle = this.ticketReplyDTO.handleNames.find(
      (obj) => obj.socialId === this.replyForm.get('replyHandler').value
    );

    if (checked) {
      let allresponse = '';
      this.textAreaCount.forEach((obj) => {
        allresponse = allresponse + obj.text + ' ';
      });

      const url = `https://twitter.com/messages/compose?recipient_id=${selectedHandle.socialId}`;

      if (allresponse) {
        if (allresponse.indexOf(url) > -1) {
          allresponse = allresponse.replace(url, '');
        }
      }

      this.textAreaCount = [];
      let newTextarea = new TextAreaCount();
      newTextarea.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      newTextarea.postCharacters = this.ticketReplyDTO.maxlength;
      newTextarea.showAddNewReply = false;
      newTextarea.totalCharacters = this.ticketReplyDTO.maxlength;
      newTextarea.showPost = false;
      newTextarea.showTotal = true;
      newTextarea.text = allresponse;
      this.textAreaCount.push(newTextarea);

      this.ReplyInputChangesModifiedCopy(newTextarea.text, newTextarea.id);
    } else {
      const allresponse = this.textAreaCount[0].text;
      this.textAreaCount = [];
      let newTextarea = new TextAreaCount();
      newTextarea.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      newTextarea.postCharacters = newTextarea.maxPostCharacters;
      this.baseMentionObj.channelGroup == ChannelGroup.Twitter
        ? (newTextarea.showAddNewReply = true)
        : (newTextarea.showAddNewReply = false);
      newTextarea.totalCharacters = this.ticketReplyDTO.maxlength;
      newTextarea.showPost = true;
      newTextarea.showTotal = true;
      newTextarea.text = allresponse;
      this.textAreaCount.push(newTextarea);

      this.ReplyInputChangesModifiedCopy(newTextarea.text, newTextarea.id);
    }
  }

  emailGroupChange(event): void {
    // console.log(event.source.value);
    if (this.customGroupEmailList && this.customGroupEmailList.length > 0) {
      const selectedGroup = this.customGroupEmailList.find((obj) => {
        return obj.groupID === +event.source.value;
      });
      if (selectedGroup) {
        this.selectedGroupEmailList.push(selectedGroup);
        this.groupIDs.push(String(event.source.value));
        if (selectedGroup.email_to) {
          const toEmail = selectedGroup.email_to.split(',');
          toEmail.forEach((obj) => {
            if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply')){
              this.groupToEmails.push(obj);
            }
          });
        }
        if (selectedGroup.email_cc) {
          const ccEmail = selectedGroup.email_cc.split(',');
          ccEmail.forEach((obj) => {
            if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply')) {
              this.groupCCEmails.push(obj);
            }
          });
          this.replyGroupEmailcc = this.groupCCEmails.length > 0 ? true : false;
        }
        if (selectedGroup.email_bcc) {
          const bccEmail = selectedGroup.email_bcc.split(',');
          bccEmail.forEach((obj) => {
            if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply')) {
              this.groupBCCEmails.push(obj);
            }
          });
          this.replyGroupEmailBcc =
            this.groupBCCEmails.length > 0 ? true : false;
        }
      }
    }
  }

  matEmailGroupChange(event: MatAutocompleteSelectedEvent): void {
    // console.log(event.option.value);
    this.emailgroupInputField?.nativeElement.blur();
    if (this.customGroupEmailList && this.customGroupEmailList.length > 0) {
      const selectedGroup = this.customGroupEmailList.find((obj) => {
        return obj.groupID === +event.option.value;
      });
      if (selectedGroup) {
        this.selectedGroupEmailList.push(selectedGroup);
        this.groupIDs.push(String(event.option.value));
        if (selectedGroup.email_to) {
          const toEmail = selectedGroup.email_to.split(',');
          toEmail.forEach((obj) => {
            if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply')) {
              this.groupToEmails.push(obj);
              if (!this.isEmailAllowed(obj) && (this.onlySendMail || this.emailForward )) {
                this.blackListedGrpChips['groupto'].add(obj);
                this.checkAndUpdateBlackListStatus('groupto');
              }
            }
          });
        }
        if (selectedGroup.email_cc) {
          const ccEmail = selectedGroup.email_cc.split(',');
          ccEmail.forEach((obj) => {
            this.groupCCEmails.push(obj);
            if (!this.isEmailAllowed(obj) && (this.onlySendMail || this.emailForward)) {
              this.blackListedGrpChips['groupcc'].add(obj);
              this.checkAndUpdateBlackListStatus('groupcc');
            }
          });
          this.replyGroupEmailcc = this.groupCCEmails.length > 0 ? true : false;
        }
        if (selectedGroup.email_bcc) {
          const bccEmail = selectedGroup.email_bcc.split(',');
          bccEmail.forEach((obj) => {
            this.groupBCCEmails.push(obj);
            if (!this.isEmailAllowed(obj) && (this.onlySendMail || this.emailForward)) {
              this.blackListedGrpChips['groupbcc'].add(obj);
              this.checkAndUpdateBlackListStatus('groupbcc');
            }
          });
          this.replyGroupEmailBcc =
            this.groupBCCEmails.length > 0 ? true : false;
        }
      }
      this.customGroupEmailList = this.customGroupEmailList.filter(
        (obj) => obj.groupID != selectedGroup.groupID
      );
    }
  }
  removeEmailGroup(groupid): void {
    if (this.emailGroupList && this.emailGroupList.length > 0) {
      const selectedGroup = this.emailGroupList.find((obj) => {
        return obj.groupID === groupid;
      });
      if (selectedGroup) {
        this.selectedGroupEmailList = this.selectedGroupEmailList.filter(
          (obj) => {
            if (obj.groupID !== groupid) {
              return obj;
            }
          }
        );
        const selectedGroupIndex = this.emailGroupList.findIndex((obj) => {
          return obj.groupID === groupid;
        });
        if (selectedGroupIndex > -1) {
          this.customGroupEmailList.splice(
            selectedGroupIndex,
            0,
            selectedGroup
          );
        }
        this.groupIDs = this.groupIDs.filter((e) => e !== String(groupid));
        if (selectedGroup.email_to) {
          const toEmail = selectedGroup.email_to.split(',');
          toEmail.forEach((obj) => {
            this.groupToEmails = this.groupToEmails.filter((e) => e !== obj);
            if (this.blackListedGrpChips['groupto']?.has(obj)) {
              this.blackListedGrpChips['groupto'].delete(obj);
              this.checkAndUpdateBlackListStatus('groupto');
            }
          });
        }
        if (selectedGroup.email_cc) {
          const ccEmail = selectedGroup.email_cc.split(',');
          ccEmail.forEach((obj) => {
            this.groupCCEmails = this.groupCCEmails.filter((e) => e !== obj);
            if (this.blackListedGrpChips['groupcc']?.has(obj)) {
              this.blackListedGrpChips['groupcc'].delete(obj);
              this.checkAndUpdateBlackListStatus('groupcc');
            }
          });
        }
        if (selectedGroup.email_bcc) {
          const bccEmail = selectedGroup.email_bcc.split(',');
          bccEmail.forEach((obj) => {
            this.groupBCCEmails = this.groupBCCEmails.filter((e) => e !== obj);
            if (this.blackListedGrpChips['groupbcc']?.has(obj)) {
              this.blackListedGrpChips['groupbcc'].delete(obj);
              this.checkAndUpdateBlackListStatus('groupbcc');
            }
          });
        }
      }
    }
  }

  addEmail(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim() && this.isEmail(value)) {
      this.emails.push({ id: value.trim() });
    }

    if (input) {
      input.value = '';
    }
  }

  removeEmail(email): void {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  closePostReply(): void {
    this.replyForm.get('ckeditorText').setValue('');
    this.emailReplyText = '';
    this.replyTextInitialValue = '';
    this.clearInputs();
    this._bottomSheet.dismiss();
    this.replyEvent.emit(false);
    if(this.defaultAgentID)
    {
      this.cancelAssign.emit(true)
    }
    this._ticketService.emailPopUpViewObs.next({ status: true, isOpen: false, data: null });
  }

  openMediaDialog(): void {
    this.mediaGalleryService.startDateEpoch =
      this.postDetailTab?.tab?.Filters?.startDateEpoch;
    this.mediaGalleryService.endDateEpoch =
      this.postDetailTab?.tab?.Filters?.endDateEpoch;
    this.dialog.open(MediaGalleryComponent, {
      autoFocus: false,
      panelClass: ['full-screen-modal'],
    });
  }

  openTemplateDialog():void {
    const dialogRef = this.dialog.open(WhatsappTemplatesComponent, {
      autoFocus: false,
      width: '70vw',
      data: { brandInfo: this.baseMentionObj.brandInfo, baseMentionObj: this.baseMentionObj }
    });
    dialogRef.afterClosed().subscribe((media) => {
      if (media) {
        this.closePostReply();
      }
    });
  }

  openCannedResponse(textBoxIndex?:number): void {
    this.dialog.open(CannedResponseComponent, {
      autoFocus: false,
      width: '50vw',
      //data: this.baseMentionObj,
      data: { openedFrom: 'postReply', mention: this.baseMentionObj, textBoxIndex: textBoxIndex },
    });
  }

  openSmartSuggestion(): void {
    this.dialog.open(SmartSuggestionComponent, {
      autoFocus: false,
      width: '73vw',
    });
  }

  ReplyInputChangesModifiedCopy(text, inputid): void {
    const textareacountlength = this.textAreaCount.length - 1;
    if (
      this.textAreaCount[inputid].postCharacters === 0 &&
      textareacountlength !== inputid
    ) {
      this.textAreaCount[inputid].text = this.textAreaCount[
        inputid
      ].text.substring(0, this.textAreaCount[inputid].maxPostCharacters);
      // this.changeTextArea(this.textAreaCount);
      return;
    }
    // console.log(text);
    let inputText = text;
    this.textResponse = text;
    // this.textAreaCount[+inputid].text = event.target.value;

    // calculate overall structure

    if (inputText) {
      inputText = inputText
        .replace(new RegExp('<', 'g'), '&lt;')
        .replace(new RegExp('>', 'g'), '&gt;');
      // this.maxLengthInput = this.ticketReplyDTO.maxlength - inputText.length;
      let lengthAllTextBox = 0;
      this.textAreaCount.forEach((element) => {
        lengthAllTextBox = lengthAllTextBox + element.text.length;
      });
      this.maxLengthInput = this.ticketReplyDTO.maxlength - lengthAllTextBox;
      this.maxLengthInput = this.maxLengthInput < 0 ? 0 : this.maxLengthInput;

      // this.textAreaCount[inputid].postCharacters =  this.textAreaCount[inputid].maxPostCharacters - inputText.length;

      // check for twitter channel
      const replylinkObj = this.replyLinkCheckbox.find((obj) => {
        return obj.replyLinkId === Replylinks.SendAsDM;
      });
      const isDmChechecked = replylinkObj ? replylinkObj.checked : false;
      if (
        (this.baseMentionObj.channelType === ChannelType.PublicTweets || this.baseMentionObj.channelType === ChannelType.Twitterbrandmention) &&
        !isDmChechecked
      ) {
        this.BuildReplyModified(text, +inputid);
      } else {
        this.textAreaCount[inputid].postCharacters =
          this.textAreaCount[inputid].maxPostCharacters - inputText.length;
      }
    } else {
      let lengthAllTextBox = 0;
      this.textAreaCount.forEach((element) => {
        lengthAllTextBox = lengthAllTextBox + element.text.length;
      });
      this.maxLengthInput = this.ticketReplyDTO.maxlength - lengthAllTextBox;
      this.maxLengthInput = this.maxLengthInput < 0 ? 0 : this.maxLengthInput;

      this.textAreaCount[inputid].postCharacters =
        this.textAreaCount[inputid].maxPostCharacters;
      // this.maxLengthInput = this.ticketReplyDTO.maxlength;
      // const elemObj = this.elementRef?.nativeElement.querySelectorAll(
      //   '.previewTextarea'
      // );
      // if (elemObj) {
      //   for (const elobj of elemObj) {
      //     elobj.remove();
      //   }
      // }
    }
  }

  ReplyInputChangesModified(event, inputid, text, index?): void {
    if(this.isAICaution){
      this.isAICaution = false;
    }

    if (
      this.baseMentionObj.channelGroup == ChannelGroup.GooglePlayStore &&
      event.target.value.trim().length > 350
    ) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            this.translate.instant('Playstore-350-Char-Limit'),
        },
      });
      event.target.value = event.target.value.substring(0, 350);
      return;
    }
    if (
      this.baseMentionObj.channelGroup == ChannelGroup.TikTok &&
      event?.target?.value?.length > 150
    ) {
      const strUserSignature = this.emailSignatureParams?.userSignatureSymbol + ' ' + this.emailSignatureParams?.userSignature;
      if (event?.target?.value?.includes(strUserSignature)) {
        event.target.value = event?.target?.value?.replace(strUserSignature, '');
      }
      if (this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature && !this.emailSignatureParams?.isAppendNewLineForSignature) {
        event.target.value = event?.target?.value?.substring(0, 149 - strUserSignature?.length) + ' ' + strUserSignature;
      } else if (this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature && this.emailSignatureParams?.isAppendNewLineForSignature) {
        event.target.value = event?.target?.value?.substring(0, 149 - strUserSignature?.length) + '\n' + strUserSignature
      } else {
        event.target.value = event?.target?.value?.substring(0, 150);
      }
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            this.translate.instant('Tiktok-150-Char-Limit'),
        },
      });
      return;
    }
    if (
      this.maxLengthInput == 0 &&
      event.inputType !== 'deleteContentBackward'
    ) {
      const replylinkObj = this.replyLinkCheckbox.find((obj) => {
        return obj.replyLinkId === Replylinks.SendAsDM;
      });
      const isDmChechecked = replylinkObj ? replylinkObj.checked : false;
      if (
        (this.baseMentionObj.channelType === ChannelType.PublicTweets ||
          this.baseMentionObj.channelType ===
            ChannelType.Twitterbrandmention) &&
        !isDmChechecked
      ) {
        const selectionStart = event.target.selectionStart
        const postCharacterCount = this.textAreaCount.find(
          (obj) => obj.id == inputid
        ).postCharacters;
        const limit = this.twitterAccountPremium ? 24999 : 279;
        event.target.value = event.target.value.substring(
          0,
          limit - postCharacterCount
        );
        requestAnimationFrame(() => {
          if (index != null) {
            this.textAreas['_results'][index]?.nativeElement.setSelectionRange(this.focusIndex, this.focusIndex);
            this.textAreas['_results'][index]?.nativeElement.focus();
          }
        })
      }
      // this.textAreas[inputid-1].tex
      return;
    }

    // this._chatBotService.chatBotHideObs.next({ status: true });
    this._chatBotService.chatBotHideObsSignal.set({ status: true });

    const textareacountlength = this.textAreaCount.length - 1;

    // if (this.textAreaCount[inputid].postCharacters === 0) {
    //   const twitterLibrary = require('twitter-text');
    //   const setText = this.getTwitterRequiredText(
    //     this.textAreaCount[inputid].text
    //   );
    //   this.textAreaCount[inputid].postCharacters =
    //     280 - twitterLibrary.default.parseTweet(setText).weightedLength;
    //   event.target.value = setText;
    //   // this.textAreaCount[inputid].text = this.textAreaCount[inputid].text.substring(0, this.textAreaCount[inputid].maxPostCharacters);
    //   // this.changeTextArea(this.textAreaCount);
    //   return;
    // }
    // else{
    // console.log(event.target.value);
    let inputText = event.target.value;
    this.textResponse = event.target.value;

    // this.textAreaCount[+inputid].text = event.target.value;

    // calculate overall structure

    if (inputText) {
      inputText = inputText
        .replace(new RegExp('<', 'g'), '&lt;')
        .replace(new RegExp('>', 'g'), '&gt;');
      // this.maxLengthInput = this.ticketReplyDTO.maxlength - inputText.length;
      let lengthAllTextBox = 0;
      this.textAreaCount.forEach((element) => {
        lengthAllTextBox = lengthAllTextBox + element.text.length;
      });
      this.maxLengthInput = this.ticketReplyDTO.maxlength - lengthAllTextBox;
      this.maxLengthInput = this.maxLengthInput < 0 ? 0 : this.maxLengthInput;

      // check for twitter channel
      const replylinkObj = this.replyLinkCheckbox.find((obj) => {
        return obj.replyLinkId === Replylinks.SendAsDM;
      });
      const isDmChechecked = replylinkObj ? replylinkObj.checked : false;
      if (
        (this.baseMentionObj.channelType === ChannelType.PublicTweets ||
          this.baseMentionObj.channelType ===
            ChannelType.Twitterbrandmention) &&
        !isDmChechecked
      ) {
        const limit = this.twitterAccountPremium ? 100000 : 25000;
        event.target.value = event.target.value.substring(0, limit);
        this.BuildReplyModified(event.target.value, +inputid, index, event.target.selectionStart);
      } else {
        this.textAreaCount[inputid].postCharacters =
          this.textAreaCount[inputid].maxPostCharacters - inputText.length;
      }
    } else {
      let lengthAllTextBox = 0;
      if (this.textAreaCount.length > 1) {
        if (text === 'remove') {
          this.textAreaCount.splice(inputid, 1);
          console.log('removed');
        }
        // this.textAreas['_results'][inputid - 1]?.nativeElement.focus();
      }
      this.textAreaCount.forEach((element, index) => {
        if (text === 'remove') {
          element.id = index;
        }
        element.spanCount = `${index + 1}/${this.textAreaCount.length}`;
        lengthAllTextBox = lengthAllTextBox + element.text.length;
      });
      this.maxLengthInput = this.ticketReplyDTO.maxlength - lengthAllTextBox;
      this.maxLengthInput = this.maxLengthInput < 0 ? 0 : this.maxLengthInput;
      if (this.textAreaCount[inputid])
      {
      this.textAreaCount[inputid].postCharacters =
        this.textAreaCount[inputid].maxPostCharacters;
      }
      // this.maxLengthInput = this.ticketReplyDTO.maxlength;
      // const elemObj = this.elementRef?.nativeElement.querySelectorAll(
      //   '.previewTextarea'
      // );
      // if (elemObj) {
      //   for (const elobj of elemObj) {
      //     elobj.remove();
      //   }
      // }
    }
    // checksignature
    this._ngZone.runOutsideAngular(() => {
      this.emailSignTimeout = setTimeout(() => {
        if (
          this.emailSignatureParams &&
          this.emailSignatureParams.isSignatureEnabled
        ) {
          if (this.emailSignatureParams.userSignature) {
            this.SetSignatureAndFocus(this.emailSignatureParams, event, index, this.inputElement?.nativeElement.selectionStart, this.inputElement?.nativeElement.selectionEnd);
          } else if (this.emailSignatureParams.emailFooter) {
            // BrandTickets.SetEmailFooterAndFocus();
          }
        }
        console.log('setTimeout called');
      }, 0);
    });
    // }
    // remove textarea if empty and more that one textarea
    // setTimeout(()=>{
    //   const dummyTextareaCount = this.textAreaCount.length - 1;
    //   if (dummyTextareaCount > 0 && this.textAreaCount[inputid].text === '') {
    //     this.textAreaCount = this.textAreaCount.filter(obj=> obj.id !== inputid);
    //     this.recursiveInputChangesModified(this.textAreaCount[this.textAreaCount.length - 1].text,this.textAreaCount.length - 1);
    //   }
    //   },5);4
    this._ngZone.runOutsideAngular(() => {
      this.autoTimeout = setTimeout(() => {
        if (event.target.value != '') {
          this.textAreaDiv.forEach((element, index) => {
            this.auto_grow(
              this.textAreas['_results'][index]?.nativeElement,
              element?.nativeElement
            );
          });
        }
        // if (this.inputElement?.nativeElement.selectionStart) {
        // this.inputElement?.nativeElement.selectionStart;
        // this.inputElement?.nativeElement.focus();
        // }
        console.log('setTimeout called');
      }, 1);
    });
    console.log(
      'cusror position start: ',
      this.inputElement?.nativeElement.selectionStart
    );
    console.log(
      'cusror position end: ',
      this.inputElement?.nativeElement.selectionEnd
    );
    // if (this.inputElement?.nativeElement.selectionStart) {
    //   // this.inputElement?.nativeElement.selectionStart;
    //   this.inputElement?.nativeElement.focus();
    // }
    this.textAreaPos = this.inputElement?.nativeElement.selectionStart;
  }

  recursiveInputChangesModified(inputtext, inputid): void {
    const textareacountlength = this.textAreaCount.length - 1;
    let inputText = inputtext;
    this.textResponse = inputtext;

    // this.textAreaCount[+inputid].text = event.target.value;

    // calculate overall structure

    if (inputText) {
      inputText = inputText
        .replace(new RegExp('<', 'g'), '&lt;')
        .replace(new RegExp('>', 'g'), '&gt;');
      // this.maxLengthInput = this.ticketReplyDTO.maxlength - inputText.length;
      let lengthAllTextBox = 0;
      this.textAreaCount.forEach((element) => {
        lengthAllTextBox = lengthAllTextBox + element.text.length;
      });
      this.maxLengthInput = this.ticketReplyDTO.maxlength - lengthAllTextBox;
      this.maxLengthInput = this.maxLengthInput < 0 ? 0 : this.maxLengthInput;

      // check for twitter channel
      const replylinkObj = this.replyLinkCheckbox.find((obj) => {
        return obj.replyLinkId === Replylinks.SendAsDM;
      });
      const isDmChechecked = replylinkObj ? replylinkObj.checked : false;
      if (
        (this.baseMentionObj.channelType === ChannelType.PublicTweets ||
          this.baseMentionObj.channelType ===
            ChannelType.Twitterbrandmention) &&
        !isDmChechecked
      ) {
        this.BuildReplyModified(inputtext, +inputid);
      } else {
        this.textAreaCount[inputid].postCharacters =
          this.textAreaCount[inputid].maxPostCharacters - inputText.length;
      }
    } else {
      let lengthAllTextBox = 0;
      this.textAreaCount.forEach((element) => {
        lengthAllTextBox = lengthAllTextBox + element.text.length;
      });
      this.maxLengthInput = this.ticketReplyDTO.maxlength - lengthAllTextBox;
      this.maxLengthInput = this.maxLengthInput < 0 ? 0 : this.maxLengthInput;

      this.textAreaCount[inputid].postCharacters =
        this.textAreaCount[inputid].maxPostCharacters;
      // this.maxLengthInput = this.ticketReplyDTO.maxlength;
      // const elemObj = this.elementRef?.nativeElement.querySelectorAll(
      //   '.previewTextarea'
      // );
      // if (elemObj) {
      //   for (const elobj of elemObj) {
      //     elobj.remove();
      //   }
      // }
    }

    this.ParamsTimeout =setTimeout(() => {
      if (
        this.emailSignatureParams &&
        this.emailSignatureParams.isSignatureEnabled
      ) {
        if (this.emailSignatureParams.userSignature) {
          this.SetSignatureAndFocus(this.emailSignatureParams);
        } else if (this.emailSignatureParams.emailFooter) {
          // BrandTickets.SetEmailFooterAndFocus();
        }
      }
      console.log('setTimeout called');
    }, 10);
  }

  ReplyInputChanges(event, inputid): void {
    // console.log(event.target.value);
    let inputText = event.target.value;
    this.textResponse = event.target.value;
    if (inputText) {
      inputText = inputText
        .replace(new RegExp('<', 'g'), '&lt;')
        .replace(new RegExp('>', 'g'), '&gt;');
      this.maxLengthInput = this.ticketReplyDTO.maxlength - inputText.length;
      // check for twitter channel
      const replylinkObj = this.replyLinkCheckbox.find((obj) => {
        return obj.replyLinkId === Replylinks.SendAsDM;
      });
      const isDmChechecked = replylinkObj ? replylinkObj.checked : false;
      if (
        (this.baseMentionObj.channelType === ChannelType.PublicTweets ||
          this.baseMentionObj.channelType ===
            ChannelType.Twitterbrandmention) &&
        !isDmChechecked
      ) {
        this.BuildReply(event.target.value);
      }
    } else {
      this.maxLengthInput = this.ticketReplyDTO.maxlength;
      const elemObj =
        this.elementRef?.nativeElement.querySelectorAll('.previewTextarea');
      if (elemObj) {
        for (const elobj of elemObj) {
          elobj.remove();
        }
      }
    }
  }
  BuildReply(inputText: string): void {
    const MAX_TWEET_LENGTH = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
    const EXTRA_CHARACTERS = 8;

    let tweettext = inputText;
    tweettext = tweettext.trim();
    const splittedTweets = new Array();
    const twitterLibrary = require('twitter-text');
    let twitterObj = twitterLibrary.default.parseTweet(tweettext);

    // if (tweettext.length > MAX_TWEET_LENGTH) {
    if (twitterObj.weightedLength > MAX_TWEET_LENGTH) {
      let tempScreenName = ''; // screenName;

      // while (tweettext.length + EXTRA_CHARACTERS > MAX_TWEET_LENGTH) {
      while (twitterObj.weightedLength + EXTRA_CHARACTERS > MAX_TWEET_LENGTH) {
        // let length = tweettext.length;
        const words = tweettext.split(' ');
        let newTweet = tempScreenName; // screenName;
        let oldTweet = newTweet;
        let i = 0;
        let twitObj;
        do {
          newTweet += i > 0 ? ' ' : '' + words[i];
          i++;
          twitObj = twitterLibrary.default.parseTweet(newTweet);
          // if (newTweet.length + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH) {
          if (twitObj.weightedLength + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH) {
            oldTweet = newTweet;
          }
        } while (twitObj.weightedLength + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH);
        // while (newTweet.length + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH);

        splittedTweets.push(oldTweet);
        tempScreenName = '';

        tweettext = tweettext.split(oldTweet.trim())[1].trim();
        twitterObj = twitterLibrary.default.parseTweet(tweettext);
      }
    }

    splittedTweets.push(tweettext);
    this.splittedTweets = splittedTweets;
    // remove the previous textarea
    const elemObj =
      this.elementRef?.nativeElement.querySelectorAll('.previewTextarea');
    if (elemObj) {
      for (const elobj of elemObj) {
        elobj.remove();
      }
    }

    if (splittedTweets.length > 1) {
      for (const [i, tweet] of splittedTweets.entries()) {
        const d1 = this.elementRef?.nativeElement.querySelector(
          '.textarea-featured__body'
        );
        if (i > 0 && d1) {
          // d1.insertAdjacentHTML(
          //   'beforeend',
          //   `<div class="previewTextarea"><textarea  rows="2" [(ngModel)]="${tweet}" style="background:white;" class="textarea-featured__input previewTextarea" disabled>${tweet}</textarea><span class="previewTextarea__count">${i + 1
          //   }/${splittedTweets.length}</span><div>`
          // );
          d1.insertAdjacentHTML(
            'beforeend',
            `<div class="textarea-featured__block">
            <textarea class="textarea-featured__input customClassReplyText"></textarea>
        <div class="textarea-featured__left">
            <a class="textarea-featured__left--emoji"  [matMenuTriggerFor]="emojiMenu" mat-icon-button href="javacript:void(0)">
                <mat-icon>sentiment_satisfied_alt</mat-icon>
            </a>
            <span class="textarea-featured__left--warn"><mat-icon>error_outline</mat-icon> Attachment will be link with this reply</span>
        </div>
        <div class="textarea-featured__right">
            <span >Add New Reply | </span>
            <span >30 reply characters remaining | </span>
            <span class="textarea-featured__right--character">0 post characters remaining</span>
        </div>
        <mat-menu #emojiMenu="matMenu" class="custom__matmenu"  xPosition="before" yPosition="above">
            <div (click)="$event.stopPropagation();$event.preventDefault();">
                <emoji-mart [set]="emojiSet" [enableSearch]="false" [emojisToShowFilter]="filteredEmojis" [showPreview]="false"  (emojiSelect)="selectEmoji($event)"></emoji-mart>
            </div>
        </mat-menu>
        <span class="previewTextarea__count"></span>
        </div>`
          );
        }
      }
      this.cdr.markForCheck();
    }
  }
  BuildReplyModified(inputText: string, inputid: number, index?: number, selectionStart?:number): void {
    const MAX_TWEET_LENGTH = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
    const textareacountlength = this.textAreaCount.length - 1;
    // if (
    //   this.textAreaCount[inputid].postCharacters !== 0 ||
    //   textareacountlength === inputid
    // ) {
    let tweettext = inputText;
    tweettext = tweettext.trimStart();
    const splittedTweets = new Array();
    const twitterLibrary = require('twitter-text');
    const maxTextBoxs = Math.round((inputText.trim().length / MAX_TWEET_LENGTH)) > 5 ? 5 : Math.round((inputText.trim().length / MAX_TWEET_LENGTH))
    let strUserSignature = '';
    if (this.addedSignatureForUser && !this.addedSignatureForUser?.isEmailSignature && (maxTextBoxs - 1) == inputid) {
      strUserSignature = this.addedSignatureForUser.userSignatureSymbol + ' ' + this.addedSignatureForUser.userSignature;
      tweettext = tweettext?.replace(strUserSignature, '');
    }

    let twitterObj = twitterLibrary.default.parseTweet(tweettext);

    // if (tweettext.length > MAX_TWEET_LENGTH) {
    if ((twitterObj.weightedLength + strUserSignature.length )> MAX_TWEET_LENGTH) {
      let tempScreenName = ''; // screenName;

      // while (tweettext.length + EXTRA_CHARACTERS > MAX_TWEET_LENGTH) {
      // while (twitterObj.weightedLength + EXTRA_CHARACTERS > MAX_TWEET_LENGTH) {
      while ((twitterObj.weightedLength + strUserSignature.length) > MAX_TWEET_LENGTH) {
        // let length = tweettext.length;
        const words = tweettext.split(' ');
        let newTweet = tempScreenName; // screenName;
        let oldTweet = newTweet;
        let i = 0;
        let twitObj;
        do {
          newTweet += ' ' + words[i];
          i++;
          twitObj = twitterLibrary.default.parseTweet(newTweet);
          // if (newTweet.length + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH) {
          // if (twitObj.weightedLength + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH) {
          if ((twitObj.weightedLength + strUserSignature.length) <= MAX_TWEET_LENGTH) {
            oldTweet = newTweet;
          }
        } while ((twitObj.weightedLength + strUserSignature.length) <= MAX_TWEET_LENGTH);
        // while (twitObj.weightedLength + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH);
        // while (newTweet.length + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH);

        splittedTweets.push(oldTweet);
        tempScreenName = '';

        tweettext = tweettext.split(oldTweet.trimStart())[1].trimStart();
        twitterObj = twitterLibrary.default.parseTweet(tweettext);
      }
    } else {
      this.textAreaCount[inputid].postCharacters =
        this.textAreaCount[inputid].maxPostCharacters -
        twitterObj.weightedLength;
    }

    splittedTweets.push(tweettext);
    this.splittedTweets = splittedTweets;
    // remove the previous textarea

    if (splittedTweets.length > 1) {
      const limit = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      this.textAreaCount[inputid].postCharacters =
        limit -
        twitterLibrary.default.parseTweet(splittedTweets[0]).weightedLength;
    }
    for (const [i, tweet] of splittedTweets.entries()) {
      if (i > 0) {
        // this.textAreaCount[0].postCharacters = 280 - text.length;
        this.textAreaCount[inputid].showPost = true;
        this.textAreaCount[inputid].showSpan = true;
        this.textAreaCount[inputid].showTotal = true;
        this.textAreaCount[inputid].showAddNewReply = true;
        this.textAreaCount[inputid].showAttachmentText = false;
        // check the maxlength
        let lengthAllTextBox = 0;
        this.textAreaCount.forEach((element) => {
          lengthAllTextBox = lengthAllTextBox + element.text.length;
        });
        if (lengthAllTextBox + tweet.length <= this.ticketReplyDTO.maxlength) {
          //  if(this.textAreaCount.length > inputid)
          //  {
          // //   // this.BuildReplyModified(tweet, inputid+1);
          //  }
          //  else{
          if (textareacountlength > inputid) {
            const currentInputText =
              tweet + ' ' + this.textAreaCount[inputid + 1].text;
            this.recursiveInputChangesModified(currentInputText, inputid + 1);
            // this._ngZone.runOutsideAngular(() => {
            //   setTimeout(() => {
            // this.textAreas['_results'][inputid + 1]?.nativeElement.focus();
            //   }, 500);
            // })
          } else {
            this.addNewTextArea(tweet);
          }

          // }
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: 'Reply max length reached',
            },
          });
          return;
        }
      } else {
        this.textAreaCount[inputid].text = tweet.trimStart();
          requestAnimationFrame(() => {
            if(index!=null)
            {
              console.log(selectionStart);
              this.textAreas['_results'][index]?.nativeElement.setSelectionRange(this.focusIndex, this.focusIndex);
              this.textAreas['_results'][index]?.nativeElement.focus();
            }
          })
        // this.textAreaCount[inputid].postCharacters = 280 - tweet.length;
        if (
          this.textAreaCount.length > 1 &&
          this.textAreaCount.length - 1 !== inputid
        ) {
          this.textAreaCount[inputid].showPost = true;
          this.textAreaCount[inputid].showSpan = true;
          this.textAreaCount[inputid].showTotal = false;
          this.textAreaCount[inputid].showAddNewReply = false;
          this.textAreaCount[inputid].showAttachmentText = false;
          if (+inputid === 0) {
            this.textAreaCount[inputid].showAttachmentText = true;
          }
        } else {
          this.textAreaCount[inputid].showSpan = false;
          this.textAreaCount[inputid].showTotal = true;
          this.textAreaCount[inputid].showAddNewReply = true;
          this.textAreaCount[inputid].showAttachmentText = false;
        }
      }
    }
    this.setShowSpanCount();
    // this.cdr.markForCheck();
    // }
  }

  ReplyInputChangesCopy(value): void {
    let inputText = value;
    if (inputText.trim()) {
      inputText = inputText
        .replace(new RegExp('<', 'g'), '&lt;')
        .replace(new RegExp('>', 'g'), '&gt;');
      this.maxLengthInput = this.ticketReplyDTO.maxlength - inputText.length;
      // check for twitter channel
      const replylinkObj = this.replyLinkCheckbox.find((obj) => {
        return obj.replyLinkId === Replylinks.SendAsDM;
      });
      const isDmChechecked = replylinkObj ? replylinkObj.checked : false;
      if (
        (this.baseMentionObj.channelType === ChannelType.PublicTweets ||
          this.baseMentionObj.channelType ===
            ChannelType.Twitterbrandmention) &&
        !isDmChechecked
      ) {
        this.BuildReply(value);
      }
    } else {
      this.maxLengthInput = this.ticketReplyDTO.maxlength;
      const elemObj =
        this.elementRef?.nativeElement.querySelectorAll('.previewTextarea');
      if (elemObj) {
        for (const elobj of elemObj) {
          elobj.remove();
        }
      }
    }
  }

  getTwitterRequiredText(text): string {
    const MAX_TWEET_LENGTH = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
    const EXTRA_CHARACTERS = 8;
    let tweettext = text;
    tweettext = tweettext.trim();
    const splittedTweets = new Array();
    const twitterLibrary = require('twitter-text');
    let twitterObj = twitterLibrary.default.parseTweet(tweettext);

    // if (tweettext.length > MAX_TWEET_LENGTH) {
    if (twitterObj.weightedLength > MAX_TWEET_LENGTH) {
      let tempScreenName = ''; // screenName;

      // while (tweettext.length + EXTRA_CHARACTERS > MAX_TWEET_LENGTH) {
      while (twitterObj.weightedLength > MAX_TWEET_LENGTH) {
        // let length = tweettext.length;
        const words = tweettext.split(' ');
        let newTweet = tempScreenName; // screenName;
        let oldTweet = newTweet;
        let i = 0;
        let twitObj;
        do {
          newTweet += ' ' + words[i];
          i++;
          twitObj = twitterLibrary.default.parseTweet(newTweet);
          // if (newTweet.length + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH) {
          if (twitObj.weightedLength <= MAX_TWEET_LENGTH) {
            oldTweet = newTweet;
          }
        } while (twitObj.weightedLength <= MAX_TWEET_LENGTH);
        // while (newTweet.length + EXTRA_CHARACTERS <= MAX_TWEET_LENGTH);

        splittedTweets.push(oldTweet);
        tempScreenName = '';

        tweettext = tweettext.split(oldTweet.trim())[1].trim();
        twitterObj = twitterLibrary.default.parseTweet(tweettext);
      }
    }

    splittedTweets.push(tweettext);
    return splittedTweets[0];
  }

  addPill(event: MatChipInputEvent, type: string): void {
    const input = event.input;
    const value = event.value;
    const splittedEmail = value.split(/[\s,]+/).filter(email => email.trim() !== '');
    splittedEmail.forEach((email) => {
    if (email.trim() && this.isEmail(email.trim())) {
      // add to emails
      if (type === 'groupto') {
        if (!email.includes('noreply') && !email.includes('no-reply') && !email.includes('no.reply')) {
          if (!this.groupToEmails.some((grpEmail) => grpEmail.includes(email))) {
            this.groupToEmails.push(email.trim());
            if (!this.isEmailAllowed(email) && type === 'groupto') {
              this.blackListedGrpChips['groupto'].add(email);
              this.checkAndUpdateBlackListStatus('groupto');
            }
          }
        }

      }
      // add cc emails
      if (type === 'groupcc') {
        if (!email.includes('noreply') && !email.includes('no-reply') && !email.includes('no.reply')) {
          if (!this.groupCCEmails.some((grpEmail) => grpEmail.includes(email))) {
            this.groupCCEmails.push(email.trim());
            if (!this.isEmailAllowed(email) && type === 'groupcc') {
              this.blackListedGrpChips['groupcc'].add(email);
              this.checkAndUpdateBlackListStatus('groupcc');
            }
          }
        }
      }
      // add bcc emails
      if (type === 'groupbcc') {
        if (!email.includes('noreply') && !email.includes('no-reply') && !email.includes('no.reply')) {
          if (!this.groupBCCEmails.some((grpEmail) => grpEmail.includes(email))) {
            this.groupBCCEmails.push(email.trim());
            if (!this.isEmailAllowed(email) && type === 'groupbcc') {
              this.blackListedGrpChips['groupbcc'].add(email);
              this.checkAndUpdateBlackListStatus('groupbcc');
            }
          }
        }
      }
    }
})

    // Reset the input value
    if (input) {
      input.value = '';
      this.inputTimeout = setTimeout(() => {
        this.inputRecvd[type] = false;
      }, 500);
    }
  }

  removePill(tag, type: string): void {
    // remove from to emails
    if (type === 'to') {
      const index = this.groupToEmails.indexOf(tag);
      if (index > -1) {
        this.groupToEmails.splice(index, 1);
      }
    }
    // remove from cc emails
    if (type === 'cc') {
      const index = this.groupCCEmails.indexOf(tag);
      if (index > -1) {
        this.groupCCEmails.splice(index, 1);
      }
    }
    // remove from bcc emails
    if (type === 'bcc') {
      const index = this.groupBCCEmails.indexOf(tag);
      if (index > -1) {
        this.groupBCCEmails.splice(index, 1);
      }
    }
    let groupType = 'group' + type;
    if (this.blackListedGrpChips[groupType]?.has(tag)) {
      this.blackListedGrpChips[groupType].delete(tag);
      this.checkAndUpdateBlackListStatus(groupType);
    }
  }

  addEmailPill(event: MatChipInputEvent, type: string): void {
    const input = event.input;
    const value = event.value;
    const splittedEmail = value.split(/[\s,]+/).filter(email => email.trim() !== '');
    splittedEmail.forEach((email) => {
      email=email.trim();
    if (email.trim() && this.isEmail(email.trim())) {
      if (!email.includes('noreply') && !email.includes('no-reply') && !email.includes('no.reply')){
        if (type == 'to' || type == 'rTo' || type == 'replyTo' || type == 'EFreplyTo') {
          if(!this.emailToEmail.some((grpEmail) => grpEmail.includes(email))){
            this.emailToEmail.push(email);
            if (!this.isEmailAllowed(email) && type == 'to') {
              this.blackListedChips[type].add(email);
              this.checkAndUpdateBlackListStatus('to');
            }
          }
        }
        // add cc emails
        if (type == 'cc' || type == 'rCC' || type == 'replyCC' || type == 'EFreplyCC') {
          if (!this.emailCCEmails.some((grpEmail) => grpEmail.includes(email))) {
            this.emailCCEmails.push(email);
            if (!this.isEmailAllowed(email) && type == 'cc') {
              this.blackListedChips[type].add(email);
              this.checkAndUpdateBlackListStatus('cc');
            }
          }
        }
        // add bcc emails
        if (type == 'bcc' || type == 'rBCC' || type == 'replyBCC' || type == 'EFreplyBCC') {
          if (!this.emailBCCEmails.some((grpEmail) => grpEmail.includes(email))) {
            this.emailBCCEmails.push(email);
            if (!this.isEmailAllowed(email) && type == 'bcc') {
              this.blackListedChips[type].add(email);
              this.checkAndUpdateBlackListStatus('bcc');
            }
          }
        }
      }
    }
    })

    // Reset the input value
    if (input) {
      input.value = '';
      this.input2Timeout = setTimeout(() => {
        this.inputRecvd[type] = false;
      }, 500);
    }
    //  this.emailToChipPosition = this.emailToEmail.length;
    this.checkEmailIDOutsideOrganizationOrNot()
  //  setTimeout(() => {
  //    this.calculateEmailToListLength();
  //  }, 100);
  }

  addForwardEmailGroup(event, type,inputRef, suggestionBlacklist?: boolean) {
    if (event && event?.option && event?.option?.value && typeof event?.option?.value == 'string'){
      const value = event?.option?.value;
      if (!this.emailToEmail.includes(value.trim()) && type == 'to') {
        this.emailToEmail.push(value.trim());
        if (!this.isEmailAllowed(value.trim()) && suggestionBlacklist){
          this.blackListedChips['to'].add(value.trim());
          this.checkAndUpdateBlackListStatus('to');
        }
      }
      if (!this.emailCCEmails.includes(value.trim()) && type == 'cc') {
        this.emailCCEmails.push(value.trim());
        this.replyEmailcc = true;
        if (!this.isEmailAllowed(value.trim()) && suggestionBlacklist) {
          this.blackListedChips['cc'].add(value.trim());
          this.checkAndUpdateBlackListStatus('cc');
        }
      }
      if (!this.emailBCCEmails.includes(value.trim()) && type == 'bcc') {
        this.emailBCCEmails.push(value.trim());
        this.replyEmailBcc = true;
        if (!this.isEmailAllowed(value.trim()) && suggestionBlacklist) {
          this.blackListedChips['bcc'].add(value.trim());
          this.checkAndUpdateBlackListStatus('bcc');
        }
      }
    } else if (event && event?.option && event?.option?.value) {
      const value = event.option.value;
      const toEmails = value.email_to ? value.email_to.split(',') : [];
      const ccEmails = value.email_cc ? value.email_cc.split(',') : [];
      const bccEmail = value.email_bcc ? value.email_bcc.split(',') : [];

      if (toEmails && toEmails.length) {
        toEmails.forEach(groupEmail => {
          groupEmail = groupEmail.trim();
          if (!this.emailToEmail.includes(groupEmail)) {
            this.emailToEmail.push(groupEmail);
            if (!this.isEmailAllowed(groupEmail) && suggestionBlacklist) {
              this.blackListedChips['to'].add(groupEmail);
              this.checkAndUpdateBlackListStatus('to');
            }
          }
        });
      }
      if (ccEmails && ccEmails.length) {
        ccEmails.forEach(groupEmail => {
          groupEmail = groupEmail.trim();
          if (!this.emailCCEmails.includes(groupEmail)) {
            this.emailCCEmails.push(groupEmail);
            this.replyEmailcc = true;
            if (!this.isEmailAllowed(groupEmail) && suggestionBlacklist) {
              this.blackListedChips['cc'].add(groupEmail);
              this.checkAndUpdateBlackListStatus('cc');
            }
          }
        });
      }
      if (bccEmail && bccEmail.length) {
        bccEmail.forEach(groupEmail => {
          groupEmail = groupEmail.trim();
          if (!this.emailBCCEmails.includes(groupEmail)) {
            this.emailBCCEmails.push(groupEmail);
            this.replyEmailBcc = true;
            if (!this.isEmailAllowed(groupEmail) && suggestionBlacklist) {
              this.blackListedChips['bcc'].add(groupEmail);
              this.checkAndUpdateBlackListStatus('bcc');
            }
          }
        });
      }
    }
    if(inputRef)
    {
      inputRef.value = '';
    }
    this.emailGroupSuggestList = [];
    this.allGroupEmailList = [];
    this.checkEmailIDOutsideOrganizationOrNot()
  }

  addEmailGroup(event){
    if (event && event?.option && event?.option?.value) {
      const value = event.option.value;
      const toEmails = value.email_to ? value.email_to.split(',') : [];
      const ccEmails = value.email_cc ? value.email_cc.split(',') : [];
      const bccEmail = value.email_bcc ? value.email_bcc.split(',') : [];

      if (toEmails && toEmails.length) {
        toEmails.forEach(groupEmail => {
          if (!this.emailToEmail.includes(groupEmail.trim())){
            this.emailToEmail.push(groupEmail.trim());
            this.replyEmailBcc = true;
          }
        });
      }
      if (ccEmails && ccEmails.length) {
        ccEmails.forEach(groupEmail => {
          if (!this.emailCCEmails.includes(groupEmail.trim())) {
            this.emailCCEmails.push(groupEmail.trim());
            this.replyEmailcc = true;
          }
        });
      }
      if (bccEmail && bccEmail.length) {
        bccEmail.forEach(groupEmail => {
          if (!this.emailBCCEmails.includes(groupEmail.trim())) {
            this.emailBCCEmails.push(groupEmail.trim());
            this.replyEmailBcc = true;
          }
        });
      }

    }
    this.emailGroupSuggestList = [];
    this.checkEmailIDOutsideOrganizationOrNot()
  }

  addGroupBCC(event, type) {
    if (event && event?.option && event?.option?.value && typeof event?.option?.value == 'string') {
      const value = event?.option?.value;
      if (!this.groupToEmails.includes(value.trim()) && type == 'to') {
        this.groupToEmails.push(value.trim());
        if (!this.isEmailAllowed(value.trim()) && (this.onlySendMail || this.emailForward)) {
          this.blackListedGrpChips['groupto']?.add(value.trim());
          this.checkAndUpdateBlackListStatus('groupto');
        }
      }
      if (!this.groupCCEmails.includes(value.trim()) && type == 'cc') {
        this.groupCCEmails.push(value.trim());
        this.replyEmailcc = true;
        if (!this.isEmailAllowed(value.trim()) && (this.onlySendMail || this.emailForward)) {
          this.blackListedGrpChips['groupcc']?.add(value.trim());
          this.checkAndUpdateBlackListStatus('groupcc');
        }
      }
      if (!this.groupBCCEmails.includes(value.trim()) && type == 'bcc') {
        this.groupBCCEmails.push(value.trim());
        this.replyEmailBcc = true;
        if (!this.isEmailAllowed(value.trim()) && (this.onlySendMail || this.emailForward)) {
          this.blackListedChips['groupbcc']?.add(value.trim());
          this.checkAndUpdateBlackListStatus('groupbcc');
        }
      }
    } else if (event && event?.option && event?.option?.value) {
      const value = event.option.value;
      const toEmails = value.email_to ? value.email_to.split(',') : [];
      const ccEmails = value.email_cc ? value.email_cc.split(',') : [];
      const bccEmail = value.email_bcc ? value.email_bcc.split(',') : [];

      if (toEmails && toEmails.length) {
        toEmails.forEach(groupEmail => {
          if (!this.groupToEmails.includes(groupEmail.trim())) {
            this.groupToEmails.push(groupEmail.trim());
            // this.replyEmailBcc = true;
            if (!this.isEmailAllowed(groupEmail.trim()) && (this.onlySendMail || this.emailForward)) {
              this.blackListedGrpChips['groupto']?.add(groupEmail.trim());
              this.checkAndUpdateBlackListStatus('groupto');
            }
          }
        });
      }
      if (ccEmails && ccEmails.length) {
        ccEmails.forEach(groupEmail => {
          if (!this.groupCCEmails.includes(groupEmail.trim())) {
            this.groupCCEmails.push(groupEmail.trim());
            this.replyEmailcc = true;
            if (!this.isEmailAllowed(groupEmail.trim()) && (this.onlySendMail || this.emailForward)) {
              this.blackListedGrpChips['groupcc']?.add(groupEmail.trim());
              this.checkAndUpdateBlackListStatus('groupcc');
            }
          }
        });
      }
      if (bccEmail && bccEmail.length) {
        bccEmail.forEach(groupEmail => {
          if (!this.groupBCCEmails.includes(groupEmail.trim())) {
            this.groupBCCEmails.push(groupEmail.trim());
            this.replyEmailBcc = true;
            if (!this.isEmailAllowed(groupEmail.trim()) && (this.onlySendMail || this.emailForward)) {
              this.blackListedGrpChips['groupbcc']?.add(groupEmail.trim());
              this.checkAndUpdateBlackListStatus('groupbcc');
            }
          }
        });
      }

    }
    this.emailGroupSuggestList = [];
    this.allGroupEmailList = [];

  }

  removeEmailPill(tag, type: string): void {
    // remove from to emails
    if (type === 'to') {
      // if (
      //   !this.onlySendMail &&
      //   this.tempToEmail &&
      //   this.tempToEmail.some((email) => email == tag)
      // ) {
      //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
      //     duration: 5000,
      //     data: {
      //       type: notificationType.Warn,
      //       message: 'You cannot remove original sender from the email list.',
      //     },
      //   });
      //   return;
      // }
      const index = this.emailToEmail.indexOf(tag);
      if (index > -1) {
        this.emailToEmail.splice(index, 1);
      }
    }
    // remove from cc emails
    if (type === 'cc') {
      const index = this.emailCCEmails.indexOf(tag);
      if (index > -1) {
        this.emailCCEmails.splice(index, 1);
      }
    }
    // remove from bcc emails
    if (type === 'bcc') {
      const index = this.emailBCCEmails.indexOf(tag);
      if (index > -1) {
        this.emailBCCEmails.splice(index, 1);
      }
    }
    if (this.blackListedChips[type]?.has(tag)) {
      this.blackListedChips[type].delete(tag);
      this.checkAndUpdateBlackListStatus(type);
    }
    this.checkEmailIDOutsideOrganizationOrNot();
  }
  // Called when key is released to stop multi-selection mode
  onParentKeyup(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.metaKey) {
      this.ctrlKeyPressed = false; // Disable multi-selection mode when Ctrl is released
    }
  }
  // Handles chip click to select/deselect it
  selectChip(event: MouseEvent, mail: string, type: string) {
    event.stopPropagation();

    if (this.currentType && this.currentType !== type) {
      this.selectedChips[this.currentType] = []; // Clear previous type's selection
    }

    // Update the current type
    this.currentType = type;

    if (!this.selectedChips[type]) {
      this.selectedChips[type] = []; // Initialize as an empty array if undefined
    }
    if (this.ctrlKeyPressed) {
      // If Ctrl key is pressed, toggle the selection of the clicked chip
      const isSelected = this.selectedChips[type]?.includes(mail);
      if (isSelected) {
        // Deselect the chip
        this.selectedChips[type] = this.selectedChips[type].filter(item => item !== mail);
        console.log(`${mail} deselected`);
      } else {
        // Select the chip
        this.selectedChips[type].push(mail);
        console.log(`${mail} selected`);
      }
    }
    else{
      //single chip selection when ctrl key is not pressed
      this.selectedChips[type] = [];
      this.selectedChips[type].push(mail);
    }
  }
  handleCtrlKey(event: KeyboardEvent, copyEmail: any, emailType: string) {
    if (event.ctrlKey || event.metaKey) {
      event.stopPropagation(); // Prevent the event from propagating to the parent
      this.ctrlKeyPressed = true;
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'c') {
      event.preventDefault();
      const selectedText = this.selectedChips[emailType].join(',');
      navigator.clipboard.writeText(selectedText);
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'x') {
      event.preventDefault();
      if (this.selectedChips[emailType]?.length > 0) {
        const selectedText = this.selectedChips[emailType].join(',');
        navigator.clipboard.writeText(selectedText);
      }

      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
  }

  handleKeyboardEvent(event: KeyboardEvent, copyEmail: any, emailType: string): void {
    if (event.ctrlKey || event.metaKey) {
      this.ctrlKeyPressed = true;  // Enable multi-selection mode when Ctrl is pressed
    }
    if (copyEmail?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      this.selectedChips[emailType] = [...copyEmail];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'c') {
      event.preventDefault();
      const selectedText = this.selectedChips[emailType].join(',');
      navigator.clipboard.writeText(selectedText);
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'x') {
      event.preventDefault();
      if (this.selectedChips[emailType]?.length > 0) {
        const selectedText = this.selectedChips[emailType].join(',');
        navigator.clipboard.writeText(selectedText);
      }

      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && event.key === 'Escape'){
      this.selectedChips[emailType] = [];
    }
    if (emailType) {
      const emailTypeMapping: { [key: string]: { previous:string,current: string, next: string } } = {
        to: { previous: null ,current: 'to', next: 'cc' },
        cc: { previous: 'to' ,current: 'cc', next: 'bcc' },
        bcc: { previous: 'cc',current: 'bcc', next: null }, // No further shifting from bcc
        rTo: { previous: null,current: 'rTo', next: 'rCC' },
        rCC: { previous: 'rTo',current: 'rCC', next: 'rBCC' },
        rBCC: { previous: 'rCC',current: 'rBCC', next: null },
        replyTo: { previous: null, current: 'replyTo', next: 'replyCC' },
        replyCC: { previous: 'replyTo', current: 'replyCC', next: 'replyBCC' },
        replyBCC: { previous: 'replyCC', current: 'replyBCC', next: null },
        EFreplyTo: { previous: null, current: 'EFreplyTo', next: 'EFreplyCC' },
        EFreplyCC: { previous: 'EFreplyTo', current: 'EFreplyCC', next: 'EFreplyBCC' },
        EFreplyBCC: { previous: 'EFreplyCC', current: 'EFreplyBCC', next: null },
        groupto: { previous: null, current: 'groupto', next: 'groupcc' },
        groupcc: { previous: 'groupto', current: 'groupcc', next: 'groupbcc' },
        groupbcc: { previous: 'groupcc', current: 'groupbcc', next: null }
      };
      const { previous,current, next } = emailTypeMapping[emailType];
      if (this.selectedChips[emailType]?.length > 0 && event.shiftKey && event.code === 'ArrowDown') {
        event.preventDefault();
        if ((emailType == 'to' || emailType == 'rTo' || emailType == 'replyTo' || emailType == 'EFreplyTo') && this.emailToEmail) {
          this.emailToEmail = this.emailToEmail.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.emailCCEmails = [...this.emailCCEmails, ...this.selectedChips[current].filter((email) => !this.emailCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[next] = [];
        }
        if ((emailType == 'cc' || emailType == 'rCC' || emailType == 'replyCC' || emailType == 'EFreplyCC') && this.emailCCEmails) {
          this.emailCCEmails = this.emailCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.emailBCCEmails = [...this.emailBCCEmails, ...this.selectedChips[current].filter((email) => !this.emailBCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[next] = [];
        }
        if (emailType == 'groupto' && this.groupToEmails){
          this.groupToEmails = this.groupToEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.groupCCEmails = [...this.groupCCEmails, ...this.selectedChips[current].filter((email) => !this.groupCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[next] = [];
        }
        if (emailType == 'groupcc' && this.groupCCEmails){
          this.groupCCEmails = this.groupCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.groupBCCEmails = [...this.groupBCCEmails, ...this.selectedChips[current].filter((email) => !this.groupBCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[next] = [];
        }
      }
      if (this.selectedChips[emailType]?.length > 0 && event.shiftKey && event.code === 'ArrowUp') {
        event.preventDefault();
        if ((emailType == 'bcc' || emailType == 'rBCC' || emailType == 'replyBCC' || emailType == 'EFreplyBCC') && this.emailBCCEmails) {
          this.emailBCCEmails = this.emailBCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.emailCCEmails = [...this.emailCCEmails,...this.selectedChips[current].filter((email) => !this.emailCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[previous] = [];
        }
        if ((emailType == 'cc' || emailType == 'rCC' || emailType == 'replyCC' || emailType == 'EFreplyCC') && this.emailCCEmails) {
          this.emailCCEmails = this.emailCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.emailToEmail = [...this.emailToEmail,...this.selectedChips[current].filter((email) => !this.emailToEmail.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[previous] = [];
        }
        if (emailType == 'groupcc' && this.groupCCEmails) {
          this.groupCCEmails = this.groupCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.groupToEmails = [...this.groupToEmails,...this.selectedChips[current].filter((email) => !this.groupToEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[previous] = [];
        }
        if (emailType == 'groupbcc' && this.groupBCCEmails) {
          this.groupBCCEmails = this.groupBCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.groupCCEmails = [...this.groupCCEmails,...this.selectedChips[current].filter((email) => !this.groupCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[previous] = [];
        }
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      if (event.code === 'ArrowLeft') {
          let remainingItems = copyEmail.slice(0, copyEmail?.length - this.selectedChips[emailType]?.length);
          if (remainingItems?.length > 0) {
            this.selectedChips[emailType].push(remainingItems[remainingItems?.length - 1]);
          }
      } else if (event.code === 'ArrowRight') {
        if (this.selectedChips[emailType]?.length > 0) {
          this.selectedChips[emailType].pop();
        }
      }
    }
  }

  
  setReplyWindow(): void {
    if (this.ticketReplyDTO.makerCheckerData) {
      if (
        this.ticketReplyDTO.makerCheckerData.operationType &&
        this.ticketReplyDTO.makerCheckerData.operationType > 0
      ) {
        // this.replyForm.get('replyType').setValue(this.ticketReplyDTO.makerCheckerData.operationType);
        // if (this.ticketReplyDTO.replyOptions.findIndex(obj => +obj.value === +this.ticketReplyDTO.makerCheckerData.operationType) > -1)
        // {
        let replytypeObj = 0;
        switch (Number(this.ticketReplyDTO.makerCheckerData.operationType)) {
          case 13:
            replytypeObj = 18;
            break;
          case 7:
            replytypeObj = 1;
            break;
          case 6:
            replytypeObj = 4;
            break;
          case 5:
            replytypeObj = 14;
            break;
          case 4:
            replytypeObj = 13;
            break;
          case 3:
            replytypeObj = 5;
            break;
          case 2:
            replytypeObj = 3;
            break;
        }

        this.replyForm.patchValue({
          replyType: replytypeObj,
        });
        this.replyTypeChange(+replytypeObj);
        // }
        // this.selectedReplyType = +this.ticketReplyDTO.makerCheckerData.operationType;
      }
      if (this.ticketReplyDTO.makerCheckerData.accountSocialID) {
        if (
          this.ticketReplyDTO.handleNames.findIndex(
            (obj) =>
              obj.socialId ===
              this.ticketReplyDTO.makerCheckerData.accountSocialID
          ) > -1
        ) {
          if (this.baseMentionObj.channelGroup !== ChannelGroup.LinkedIn) {
            this.replyForm.patchValue({
              replyHandler: String(
                this.ticketReplyDTO.makerCheckerData.accountSocialID
              ),
            });
            // this.replyForm.get('replyHandler').setValue(this.ticketReplyDTO.makerCheckerData.accountSocialID);
          }
        }
      }
      if (this.ticketReplyDTO.makerCheckerData.replyMessage) {
        const replytext = this.ticketReplyDTO.makerCheckerData.replyMessage;
        // this.replyForm.patchValue({
        //   replyText: replytext,
        // });
        // this.ReplyInputChangesCopy(replytext);
        this.textAreaCount[0].text = replytext;
        this.ReplyInputChangesModifiedCopy(replytext, 0);
        if (this.baseMentionObj.channelGroup === ChannelGroup.Email) {
          this.emailReplyText = replytext;
          this.replyForm.patchValue({
            ckeditorText: replytext,
          });
          this.emailReplyText = replytext;
          if (this.baseMentionObj.fromMail) {
            if (!this.baseMentionObj.fromMail.includes('noreply') && !this.baseMentionObj.fromMail.includes('no-reply') && !this.baseMentionObj.fromMail.includes('no.reply')){
              this.emailToEmail.push(this.baseMentionObj.fromMail);
            }
          }
          this.emailCCEmails = this.baseMentionObj.ccMailList
            ? this.baseMentionObj.ccMailList
            : [];
          this.emailBCCEmails = this.baseMentionObj.bccMailList
            ? this.baseMentionObj.bccMailList
            : [];

          this.removeReplyHandleFromCcOrBcc();
        }
      }

      // Link Clicked Logic
      this.changeReplyLinkObj(
        Replylinks.SendAsDM,
        this.ticketReplyDTO.makerCheckerData.sendAsPrivate
      );
      this.changeReplyLinkObj(
        Replylinks.SendDMLink,
        this.ticketReplyDTO.makerCheckerData.sendPrivateAsLink
      );
      this.changeReplyLinkObj(
        Replylinks.SendToGroups,
        this.ticketReplyDTO.makerCheckerData.sendToGroups
      );
      this.changeReplyLinkObj(
        Replylinks.SendFeedback,
        this.ticketReplyDTO.makerCheckerData.sendFeedback
      );

      // set escalated user
      if (
        this.ticketReplyDTO.makerCheckerData.escalatedToUserID &&
        +this.ticketReplyDTO.makerCheckerData.escalatedToUserID > 0
      ) {
        if (
          this.customAgentList?.findIndex(
            (obj) =>
              obj.agentID ===
              this.ticketReplyDTO.makerCheckerData.escalatedToUserID
          )
        ) {
          this.replyForm.patchValue({
            escalateUsers:
              this.ticketReplyDTO.makerCheckerData.escalatedToUserID,
          });
          this.escalateUsers =
            this.ticketReplyDTO.makerCheckerData.escalatedToUserID;
        }

        // set escalation note
        if (this.ticketReplyDTO.makerCheckerData.escalatedMessage) {
          this.replyForm.patchValue({
            replyEscalateNote:
              this.ticketReplyDTO.makerCheckerData.escalatedMessage,
          });
        }
      }

      if ((this.ticketReplyDTO?.makerCheckerData?.assignToUserId && +this.ticketReplyDTO?.makerCheckerData?.assignToUserId > 0) ||
        (this.ticketReplyDTO?.makerCheckerData?.teamID && +this.ticketReplyDTO?.makerCheckerData?.teamID > 0)
      ) {
        // set escalation note
        const assignedNote = this.baseMentionObj?.ticketInfo?.assignedMessage || this.ticketReplyDTO.makerCheckerData?.ticketNote;
        if (assignedNote) {
          this.replyForm.patchValue({
            replyEscalateNote: assignedNote
          });
        }

        if ((this.ticketReplyDTO?.makerCheckerData?.teamID && +this.ticketReplyDTO?.makerCheckerData?.teamID > 0) && (this.ticketReplyDTO?.makerCheckerData?.assignToUserId && +this.ticketReplyDTO?.makerCheckerData?.assignToUserId == 0)){
          this.selectedAssignTo = this.ticketReplyDTO?.makerCheckerData?.teamID
        }
      }

      // generate send to groups logic
      if (this.ticketReplyDTO.makerCheckerData.sendToGroups) {
        if (this.ticketReplyDTO.makerCheckerData.groupEmailList) {
          this.groupToEmails = this.ticketReplyDTO.makerCheckerData
            .groupEmailList.email_to
            ? this.ticketReplyDTO.makerCheckerData.groupEmailList.email_to.split(
                ','
              )
            : [];

          this.groupCCEmails = this.ticketReplyDTO.makerCheckerData
            .groupEmailList.email_cc
            ? this.ticketReplyDTO.makerCheckerData.groupEmailList.email_cc.split(
                ','
              )
            : [];

          this.groupBCCEmails = this.ticketReplyDTO.makerCheckerData
            .groupEmailList.email_bcc
            ? this.ticketReplyDTO.makerCheckerData.groupEmailList.email_bcc.split(
                ','
              )
            : [];

          this.groupIDs = this.ticketReplyDTO.makerCheckerData.groupEmailList
            .groupIDs
            ? this.ticketReplyDTO.makerCheckerData.groupEmailList.groupIDs
            : [];
        }
      }

      this.IsReplyModified = true;
      this.eligibleForAutoclosure = this.ticketReplyDTO.makerCheckerData.isEligibleForAutoclosure;
      const replyMedia: any[] = this.ticketReplyDTO?.makerCheckerData?.replies[0]?.attachmentsUgc; 
      if (replyMedia.length > 0 && (!this.onlySendMail || this.emailForward) ){

        for (const [index, item] of replyMedia.entries()) {
          let mediaType = item?.mediaType;
          if ([MediaEnum?.IMAGE, MediaEnum?.VIDEO, MediaEnum.PDF, MediaEnum?.DOC, MediaEnum.EXCEL].includes(mediaType)) {
            const extension: string = item?.displayFileName?.substr(item?.displayFileName?.lastIndexOf('.') + 1);

            if (extension?.toLowerCase() == 'doc' || extension?.toLowerCase() == 'docx') mediaType = 9;
            if (extension?.toLowerCase() == 'xls' || extension?.toLowerCase() == 'xlsx') mediaType = 10;

            this.selectedMedia.push({
              displayFileName: item?.displayFileName,
              mediaPath: item?.mediaPath,
              mediaType: mediaType,
              isPostMedia: true,
              mediaID: index + 1
            })
          }
        }
        this.mediaSelectedAsync.next(this.selectedMedia);
        this.createAttachmentMediaPillView();
        setTimeout(() => {
          this.checkEmailAttachmentWidth();
        }, 300);
        this.cdr.detectChanges();
      }
    }
  }

  changeReplyLinkObj(linkId, value): void {
    if (value) {
      this.replyLinkCheckbox.forEach((obj) => {
        if (obj.replyLinkId === linkId) {
          obj.checked = true;
        }
        return obj;
      });
      if (linkId === Replylinks.SendAsDM) {
        this.replyLinkCheckbox = this.replyLinkCheckbox.map((obj) => {
          if (obj.replyLinkId === Replylinks.SendDMLink) {
            obj.checked = false;
            obj.disabled = true;
          }
          return obj;
        });
      }
      if (linkId === Replylinks.SendToGroups) {
        this.sendtoGroupsClicked = true;
      }
    } else {
      this.replyLinkCheckbox.forEach((obj) => {
        if (obj.replyLinkId === linkId) {
          obj.checked = false;
        }
        return obj;
      });

      if (linkId === Replylinks.SendAsDM) {
        this.replyLinkCheckbox = this.replyLinkCheckbox.map((obj) => {
          if (obj.replyLinkId === Replylinks.SendDMLink) {
            obj.checked = false;
            obj.disabled = false;
          }
          return obj;
        });
      }

      if (linkId === Replylinks.SendToGroups) {
        this.sendtoGroupsClicked = false;
      }
    }
  }

  fillSSRELiveData(): void {
    if (this.baseMentionObj) {
      if (this.baseMentionObj.ticketInfoSsre) {
        if (
          this.baseMentionObj.ticketInfoSsre.ssreReplyType &&
          this.baseMentionObj.ticketInfoSsre.ssreReplyType > 0
        ) {
          // this.replyForm.get('replyType').setValue(this.ticketReplyDTO.makerCheckerData.operationType);
          // if (this.ticketReplyDTO.replyOptions.findIndex(obj => +obj.value === +this.ticketReplyDTO.makerCheckerData.operationType) > -1)
          // {
          let replytypeObj = 0;
          switch (Number(this.baseMentionObj.ticketInfoSsre.ssreReplyType)) {
            case 7:
              replytypeObj = 1;
              break;
            case 6:
              replytypeObj = 4;
              break;
            case 5:
              replytypeObj = 14;
              break;
            case 4:
              replytypeObj = 13;
              break;
            case 3:
              replytypeObj = 5;
              break;
            case 2:
              replytypeObj = 3;
              break;
          }
          this.replyForm.patchValue({
            replyType: replytypeObj,
          });
          this.replyTypeChange(+replytypeObj);
          // }
          // this.selectedReplyType = +this.ticketReplyDTO.makerCheckerData.operationType;
        }
        if (this.baseMentionObj.ticketInfoSsre.ssreReply.replymessage) {
          const replytext =
            this.baseMentionObj.ticketInfoSsre.ssreReply.replymessage;
          // this.replyForm.patchValue({
          //   replyText: replytext,
          // });
          // this.ReplyInputChangesCopy(replytext);
          this.textAreaCount[0].text = replytext;
          this.ReplyInputChangesModifiedCopy(replytext, 0);
          if (this.baseMentionObj.channelGroup === ChannelGroup.Email) {
            this.emailReplyText = replytext;
            this.replyForm.patchValue({
              ckeditorText: replytext,
            });
            this.emailReplyText = replytext;
            if (this.baseMentionObj.fromMail) {
              if (!this.baseMentionObj.fromMail.includes('noreply') && !this.baseMentionObj.fromMail.includes('no-reply') && !this.baseMentionObj.fromMail.includes('no.reply')){
                this.emailToEmail.push(this.baseMentionObj.fromMail);
              }
            }
            this.emailCCEmails = this.baseMentionObj.ccMailList
              ? this.baseMentionObj.ccMailList
              : [];
            this.emailBCCEmails = this.baseMentionObj.bccMailList
              ? this.baseMentionObj.bccMailList
              : [];
            this.removeReplyHandleFromCcOrBcc();
          }
        }

        // Link Clicked Logic
        // this.changeReplyLinkObj(Replylinks.SendAsDM, this.ticketReplyDTO.makerCheckerData.sendAsPrivate);
        // this.changeReplyLinkObj(Replylinks.SendDMLink, this.ticketReplyDTO.makerCheckerData.sendPrivateAsLink);
        // this.changeReplyLinkObj(Replylinks.SendToGroups, this.ticketReplyDTO.makerCheckerData.sendToGroups);
        // this.changeReplyLinkObj(Replylinks.SendFeedback, this.ticketReplyDTO.makerCheckerData.sendFeedback);

        // set escalated user
        if (
          this.baseMentionObj.ticketInfoSsre.ssreReply.escalatedTo &&
          +this.baseMentionObj.ticketInfoSsre.ssreReply.escalatedTo > 0
        ) {
          if (
            this.customAgentList.findIndex(
              (obj) =>
                obj.agentID ===
                this.baseMentionObj.ticketInfoSsre.ssreReply.escalatedTo
            )
          ) {
            this.replyForm.patchValue({
              escalateUsers:
                this.baseMentionObj.ticketInfoSsre.ssreReply.escalatedTo,
            });
            this.escalateUsers =
              this.baseMentionObj.ticketInfoSsre.ssreReply.escalatedTo;
          }

          // set escalation note
          if (this.baseMentionObj.ticketInfoSsre.ssreReply.escalationMessage) {
            this.replyForm.patchValue({
              replyEscalateNote:
                this.baseMentionObj.ticketInfoSsre.ssreReply.escalationMessage,
            });
          }
        }
      }
    }
  }

  bulkEscalateTo(): void {
    this.actionProcessing = true;
    let isTicket = false;
    if (this._postDetailService.pagetype === PostsType.Tickets) {
      isTicket = true;
    }
    let escalatetouser = this.ticketReplyDTO.agentUsersList.find((obj) => {
      return obj.agentID === +this.replyForm.get('escalateUsers').value;
    });
    if (!escalatetouser) {
      escalatetouser = this.ticketReplyDTO.agentUsersList.find((obj) => {
        return obj.teamID === +this.replyForm.get('escalateUsers').value;
      });
      escalatetouser.agentID = null;
    }
    const logs = [];
    const log = new TicketsCommunicationLog(ClientStatusEnum.Escalated);
    if (escalatetouser) {
      if (escalatetouser.agentID) {
        log.AssignedToUserID = escalatetouser.agentID;
      } else {
        log.AssignedToTeam = escalatetouser.teamID;
      }
    }

    logs.push(log);

    const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
    if (this.replyForm.get('replyEscalateNote').value.trim()) {
      log1.Note = this.replyForm.get('replyEscalateNote').value
        ? this.replyForm.get('replyEscalateNote').value
        : '';
    }
    log1.NotesAttachment = this.replyService.selectedNoteMediaVal;

    if (escalatetouser) {
      log1.AssignedToUserID = escalatetouser.agentID;
    }
    logs.push(log1);

    const BulkObject = [];
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    for (const checkedticket of chkTicket) {
      const properties = {
        ReplyFromAccountId: 0,
        ReplyFromAuthorSocialId: '',
        TicketID: checkedticket.mention.ticketInfo.ticketID,
        TagID: checkedticket.mention.tagID,
        BrandID: checkedticket.mention.brandInfo.brandID,
        BrandName: checkedticket.mention.brandInfo.brandName,
        ChannelGroup: checkedticket.mention.channelGroup,
        Replies: [],
      };

      BulkObject.push(properties);
    }

    const sourceobj:any = {
      PerformedAction: PerformedAction.Escalate,
      IsTicket: isTicket,
      IsReplyModified: false,
      ActionTaken: 0,
      Tasks: logs,
      BulkReplyRequests: BulkObject,
    };
    if (this.baseMentionObj?.channelGroup == ChannelGroup.Telegram) {
      sourceobj.TelegramReplyType = 1
    }

    // this._replyService.BulkActionAPI(sourceobj, PerformedAction.OnHoldAgent);
    this.BulkTicketActionApi =this.replyService.BulkTicketAction(sourceobj).subscribe((data) => {
      if (data.success) {
        let message = '';
        this._ticketService.selectedPostList = [];
        this._ticketService.postSelectTriggerSignal.set(0);
        this._ticketService.bulkMentionChecked = [];
        this._postDetailService.isBulk = false;
        message = this.translate.instant('Bulk-Escalate-Successful');
        if (this.pageType === PostsType.Tickets) {
          const CountData = {
            MentionCount: null,
            tab: this._navigationService.currentSelectedTab,
            posttype: PostsType.Tickets,
          };
          // this._filterService.currentCountData.next(CountData);
          this._filterService.currentCountDataSignal.set(CountData);

        }
        if (this.pageType === PostsType.Mentions) {
          this.getMentionsCount();
        }

        // console.log(message, data);
        // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);

        this._bottomSheet.dismiss();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message,
          },
        });
      }
      else{
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data.message :  this.translate.instant('Something-Went-Wrong'),
          },
        });
        
      }
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
    },err=>{
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something-Went-Wrong'),
        },
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
    });
  }

  getMentionsCount() {
    const filterObj = this._navigationService.getFilterJsonBasedOnTabGUID(
      this._navigationService.currentSelectedTab.guid
    );
    const removeBrandActivity = this.removeBrandActivity(filterObj);
    this.getMentionCountApi =this._ticketService
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

      });
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

  bulkReplyEscalateTo(saveReplyButtonFlag): void {
    const checkReplyType = +this.replyForm.get('replyType').value;
    let brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.baseMentionObj.brandInfo.brandID
    );
    brandInfo.isShowTicketIntelligenceNotification = false;

    this.actionProcessing = true;
    // const replyinputtext = this.replyForm.get('replyText').value;
    const replyinputtext = this.textAreaCount[0].text;
    let isTicket = false;
    if (this._postDetailService.pagetype === PostsType.Tickets) {
      isTicket = true;
    }
    // const logs = [];
    // const log = new TicketsCommunicationLog(ClientStatusEnum.RepliedToUser);
    // logs.push(log);

    const BulkObject = [];
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    const NoOfTicketsOrMentions = chkTicket.length;

    // console.log(this.replyForm);
    // console.log('Saved: ' + JSON.stringify(this.replyForm.value));
    const replyObj: PerformActionParameters = {};
    const replyArray: Reply[] = [];
    const baseReply = new BaseReply();
    const customReplyObj = baseReply.getReplyClass();
    // map the properties
    replyObj.ActionTaken = ActionTaken.Locobuzz;

    // if (this.splittedTweets.length > 0) {
    //   for (const tweet of this.splittedTweets) {
    //     const customReply = baseReply.getReplyClass();
    //     customReply.replyText = tweet;

    //     replyArray.push(customReply);
    //   }
    // } else {
    //   customReplyObj.replyText = replyinputtext;
    //   replyArray.push(customReplyObj);
    // }

    if (this.textAreaCount.length > 0) {
      for (const tweet of this.textAreaCount) {
        const customReply = baseReply.getReplyClass();
        customReply.replyText = tweet?.text

        replyArray.push(customReply);
      }
    } else {
      customReplyObj.replyText = replyinputtext
      replyArray.push(customReplyObj);
    }

    replyObj.Tasks = this.BuildComminicationLog(
      this._postDetailService?.postObj
    );
    const source = this._mapLocobuzzEntity.mapMention(
      this._postDetailService?.postObj
    );
    if (this.simulationCheck) {
      source.ticketInfoSsre.ssreMode = SSREMode.Simulation;
      source.ticketInfoSsre.ssreIntent = this.SsreIntent;
    }
    replyObj.Source = source;

    /* tagged user Json */
    replyArray[0].excludedReplyUserIds = '';
    if (this.ticketReplyDTO.taggedUsers && this.ticketReplyDTO.taggedUsers.length > 0) {
      const arrayuser = [];
      for (const obj of this.ticketReplyDTO.taggedUsers) {
        arrayuser.push({
          Userid: obj.Userid,
          Name: obj.Name,
          UserType: obj.UserType,
          offset: 0,
          length: 10,
        });
      }
      replyArray[0].taggedUsersJson = JSON.stringify(arrayuser);
      if (this.unSelectedTagUsers?.length > 0) {
        /* extra check that user avaibale on taggedUsers */
        const temp_excludedReplyUserIds = this.unSelectedTagUsers.filter((item) => {
          return arrayuser.some((user) => user?.Userid == item?.Userid)
        })
        /* extra check that user avaibale on taggedUsers */
        replyArray[0].excludedReplyUserIds = [...temp_excludedReplyUserIds.map((obj) => obj?.Userid)]?.join(',')?.replace(/,\s*$/, '')
      }
    }

    // replyArray = this._mapLocobuzzEntity.mapReplyObject(replyArray);
    const replyopt = new ReplyOptions();
    // const checkReplyType = +this.replyForm.get('replyType').value;
    replyObj.PerformedActionText = replyopt.replyOption
      .find((obj) => obj.id === +this.replyForm.get('replyType').value)
      .value.trim();
    replyObj.IsReplyModified = this.IsReplyModified;
    replyObj.Replies = replyArray;

    const selectedHandle = this.ticketReplyDTO.handleNames.find(
      (obj) => obj.socialId === this.replyForm.get('replyHandler').value
    );

    replyObj.ReplyFromAccountId = selectedHandle.accountId;
    replyObj.ReplyFromAuthorSocialId = selectedHandle.socialId;

    if (this.replyLinkCheckbox && this.replyLinkCheckbox.length > 0) {
      this.replyLinkCheckbox.forEach((obj) => {
        if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
          replyObj.Replies[0].sendFeedback = true;
          replyObj.Replies[0].FeedbackForm = obj?.feedbackForm;
        } else if (obj.checked && obj.replyLinkId === Replylinks.SendAsDM) {
          replyObj.Replies[0].sendAsPrivate = true;
        } else if (obj.checked && obj.replyLinkId === Replylinks.SendDMLink) {
          replyObj.Replies[0].sendPrivateAsLink = true;
        } else if (obj.checked && obj.replyLinkId === Replylinks.SendToGroups) {
          replyObj.Replies[0].sendToGroups = true;
        } else if (
          obj.checked &&
          obj.replyLinkId === Replylinks.SendForApproval
        ) {
          // replyObj.replies[0].sen = true;
        }
      });
    }
    // check attachments
    if (this.selectedMedia && this.selectedMedia.length > 0) {
      this.selectedMedia = this._mapLocobuzzEntity.mapUgcMention(
        this.selectedMedia
      );
      if (this.baseMentionObj?.channelGroup == ChannelGroup.Telegram) {
        this.selectedMedia.forEach(res => res.TelegramCaption = this.caption ? this.caption : '');
      }
      replyObj.Replies[0].attachmentsUgc = this.selectedMedia;
    } else {
      replyObj.Replies.forEach((obj) => {
        obj.attachmentsUgc = null;
      });
    }

    // check send to groups clicked
    if (this.sendtoGroupsClicked) {
      if (this.groupToEmails.length > 0) {
        replyObj.Replies[0].groupEmailList.email_to =
          this.groupToEmails.toString();
        replyObj.Replies[0].groupEmailList.email_cc = this.groupCCEmails
          ? this.groupCCEmails.toString()
          : '';
        replyObj.Replies[0].groupEmailList.email_bcc = this.groupBCCEmails
          ? this.groupBCCEmails.toString()
          : '';
        replyObj.Replies[0].groupEmailList.groupIDs = this.groupIDs;
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-Enter-Email-To-Forward'),
          },
        });
        return;
      }
    }
    if (this.isEmailChannel) {
      replyObj.ReplyFromAccountId = +this.baseMentionObj.settingID;
      replyObj.Replies[0].toEmails =
        this.emailToEmail.length > 0 ? this.emailToEmail : [];
      replyObj.Replies[0].ccEmails =
        this.emailCCEmails.length > 0 ? this.emailCCEmails : [];
      replyObj.Replies[0].bccEmails =
        this.emailCCEmails.length > 0 ? this.emailBCCEmails : [];
      if ((this.emailToEmail && this.emailToEmail.length) || (this.emailCCEmails && this.emailCCEmails.length || (this.emailBCCEmails && this.emailBCCEmails.length))) {

      } else {
        if (this.baseMentionObj?.channelGroup == ChannelGroup.Email && !this.showEscalateview) {
          this.actionProcessing = false;
          this.disableSaveButton = false;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-Add-Email-Ids'),
            },
          });
          this.cdr.detectChanges();
          return;
        }
       
      }
    }

    for (const checkedticket of chkTicket) {
      const replies:any[] = []
      for (const replyBox of replyArray || []) {
        const mentionWiseText:string = this.getMentionWiseText(checkedticket?.mention, replyBox?.replyText);
        console.log("mentionWiseText", mentionWiseText);
        replies.push({...replyBox, replyText: mentionWiseText})
      }
      console.log("replies", replies);
      const properties:any = {
        ReplyFromAccountId: selectedHandle.accountId,
        ReplyFromAuthorSocialId: selectedHandle.socialId,
        TicketID: checkedticket.mention.ticketInfo.ticketID,
        TagID: checkedticket.mention.tagID,
        BrandID: checkedticket.mention.brandInfo.brandID,
        BrandName: checkedticket.mention.brandInfo.brandName,
        ChannelGroup: checkedticket.mention.channelGroup,
        Replies: replies,
      };

      if ( this.dispositionDetails && this.dispositionDetails?.aiTicketIntelligenceModel && this.dispositionDetails?.aiTicketIntelligenceModel.length) {
        const isExist = this.dispositionDetails?.aiTicketIntelligenceModel.find(res => res.ticketID == properties.TicketID);
        if (isExist) {
          const source = this._mapLocobuzzEntity.mapMention(checkedticket.mention);
          properties.Source = source;
          properties.Source.aiTicketIntelligenceModel = isExist;
        }
      } else if (brandInfo.aiTagEnabled && checkReplyType == 3) {
        const source = this._mapLocobuzzEntity.mapMention(checkedticket.mention);
        properties.Source = source;
        properties.Source.aiTicketIntelligenceModel = this.aiTicketIntelligenceModelData !== undefined ? this.aiTicketIntelligenceModelData : properties.Source.aiTicketIntelligenceModel;
      }
      BulkObject.push(properties);
    }

    const actionEnum = this._ticketService.GetActionEnum();
    let PerformAction;
    if (checkReplyType === actionEnum.ReplyAndClose) {
      PerformAction = PerformedAction.ReplyClose;
    } else if (checkReplyType === actionEnum.ReplyAndEscalate) {
      PerformAction = PerformedAction.ReplyEscalate;
    } else if (checkReplyType === actionEnum.ReplyAndOnHold) {
      PerformAction = PerformedAction.ReplyHold;
    } else if (checkReplyType === actionEnum.ReplyAndAwaitingCustomerResponse) {
      PerformAction = PerformedAction.ReplyAwaitingResponse;
    }
    const sourceobj: any = {
      PerformedAction: PerformAction,
      IsTicket: isTicket,
      IsReplyModified: false,
      ActionTaken: 0,
      Tasks: replyObj.Tasks,
      BulkReplyRequests: BulkObject,
    };
    /* extra flag added */
    if (this.currentUser?.data?.user?.role == UserRoleEnum?.Agent && this.currentBrand?.isEnableReplyApprovalWorkFlow && checkReplyType == 18) {
      sourceobj['makerCheckerStatus'] = MakerCheckerEnum?.ReplyAndAssign;
    }
    /* extra flag added */

    if (this.dispositionDetails) {
      sourceobj.DispositionID = this.dispositionDetails?.dispositionId;
      if (
        this.dispositionDetails?.categoryCards &&
        this.dispositionDetails?.categoryCards.length > 0
      ) {
        sourceobj.categoryMap = this.dispositionDetails?.categoryCards;
      }
      const dispositionTask = {
        AssignedToTeam: 0,
        AssignedToUserID: 0,
        Channel: null,
        Note: '',
        Status: ClientStatusEnum.TicketDisposition,
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
        TagID: String(this.baseMentionObj.tagID),
        TicketID: 0,
        type: 'CommunicationLog',
      };
      if (sourceobj?.Tasks) {
        sourceobj.Tasks.push(dispositionTask);
      }
      if (sourceobj?.Tasks && this.dispositionDetails?.note) {
        sourceobj.Tasks.push(noteTask);
      }
      sourceobj.isAutoTicketCategorizationEnabled =
        brandInfo.isAutoTicketCategorizationEnabled;
      if(brandInfo){
        sourceobj.showTicketCategory = !!brandInfo?.isTicketCategoryTagEnable;
      }
    }

    const personalDetailsRequiredFlag = this.replyLinkCheckbox?.some(
      (res) =>
        res?.replyLinkId == Replylinks.PersonalDetailsRequired && res?.checked
    );
    if (personalDetailsRequiredFlag != null) {
      replyObj.isSafeForm = personalDetailsRequiredFlag;
      if (
        personalDetailsRequiredFlag &&
        !replyObj.Replies[0].replyText.includes('{formLink}')
      ) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message:
              this.translate.instant('FormLink-Required'),
          },
        });
        this.actionProcessing = false;
        this.disableSaveButton = false;
        this.cdr.detectChanges();
        return;
      }
    }

    if (checkReplyType == 3) {
      if (this.baseMentionObj?.description && (this.baseMentionObj?.description).trim()) {
        const urlPattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/;
        const result = urlPattern.test((this.baseMentionObj?.description).trim());
        if (!result) {
          this.isAITicketTagEnabled = brandInfo.aiTagEnabled
          this.isAIInsightsEnabled = brandInfo?.isShowTicketIntelligenceNotification;
        }
      }
      if (
        brandInfo &&
        brandInfo.isTicketDispositionFeatureEnabled &&
        !saveReplyButtonFlag && this.ticketDispositionList.length > 0
      ) {
        this.ticketDispositionDialog(chkTicket);
        return;
      } else if (this.isAITicketTagEnabled && this.isAIInsightsEnabled && !saveReplyButtonFlag) {
        this.ticketDispositionDialog(chkTicket, true);
        return;
      }
    }

    if (this.baseMentionObj?.channelGroup == ChannelGroup.Telegram) {
      sourceobj.TelegramReplyType = 1
    }

    // this._replyService.BulkActionAPI(sourceobj, PerformedAction.Reply);
    this.BulkTicketAction2Api = this.replyService.BulkTicketAction(sourceobj).subscribe((data) => {
      if (data.success) {
        let message = '';
        this._ticketService.selectedPostList = [];
        this._ticketService.postSelectTriggerSignal.set(0);
        this._ticketService.bulkMentionChecked = [];
        this._postDetailService.isBulk = false;
        if (checkReplyType === 18 && this.selectedAssignTo) {
          this.replyService.reAssignTicketSignal.set(this.selectedAssignTo);
        }
        message = this.translate.instant('Ticket-reply-submitted', { NoOfTicketsOrMentions });
        if (this.pageType === PostsType.Tickets) {
          const CountData = {
            MentionCount: null,
            tab: this._navigationService.currentSelectedTab,
            posttype: PostsType.Tickets,
          };
          // this._filterService.currentCountData.next(CountData);
          this._filterService.currentCountDataSignal.set(CountData);

        }
        if (this.pageType === PostsType.Mentions) {
          this.getMentionsCount();
        }
        // console.log(message, data);
        // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);

        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        this._ticketService.parentbulkActionChange.next(1);
        this._bottomSheet.dismiss();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message,
          },
        });
      }
      else{
        this.actionProcessing = false;
        this.disableSaveButton = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this.translate.instant('Some-Error-Occurred'),
          },
        });
        this.cdr.detectChanges();
      }
    },err=>{
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: this.translate.instant('Some-Error-Occurred'),
        },
      });
      this.cdr.detectChanges();
    });
  }

  selectEmoji(event, inputid): void {
    this.replyTextInitialValue = this.replyTextInitialValue.concat(
      event.emoji.native
    );
    // this.ReplyInputChangesCopy(this.replyTextInitialValue );
    if (this.textAreaCount[inputid].postCharacters !== 0) {
      this.textAreaCount[+inputid].text = this.textAreaCount[
        +inputid
      ].text.concat(event.emoji.native);
      
      if (this.addedSignatureForUser && !this.addedSignatureForUser?.isEmailSignature) {
        const strUserSignature = this.addedSignatureForUser.userSignatureSymbol + ' ' + this.addedSignatureForUser.userSignature;
        this.textAreaCount[+inputid].text = this.textAreaCount[+inputid]?.text?.replace(strUserSignature, '');
        this.textAreaCount[+inputid].text = `${this.textAreaCount[+inputid].text} ${strUserSignature}`
      }

      if(this.baseMentionObj?.channelGroup === ChannelGroup.Twitter)
      {
      const twitterLibrary = require('twitter-text');
      const setText = this.getTwitterRequiredText(
        this.textAreaCount[inputid].text
      );
      const limit = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      this.textAreaCount[inputid].postCharacters =
        limit - twitterLibrary.default.parseTweet(setText).weightedLength;
      this.textAreaCount[+inputid].text = setText;
      }
       // set max length
      let lengthAllTextBox = 0;
      this.textAreaCount.forEach((element) => {
        lengthAllTextBox = lengthAllTextBox + element.text.length;
      });
      this.maxLengthInput = this.ticketReplyDTO.maxlength - lengthAllTextBox;
    }
    // this.changeTextArea(this.textAreaCount);
  }
  ngOnDestroy(): void {
    this.clearSignal.set(false);
    this.cdr.detectChanges();
    this.cdr.detach();
    // this._postDetailService.currentPostObject.unsubscribe();
    this.subs.unsubscribe();
    this.replyService.selectedCannedResponseSignal.set({ text: '' });
    this.replyService.selectedSmartSuggestion.next(null);
    if(this.isOpenRephrasePopup){
      this._postDetailService.openRephrasePopup = false;
      if(this.sfdcTicketViewUI) {
        /* this.replyService.openRephraseSFDC.next(
          {
            openPopup: false,
            position: null,
            rephraseOptions: null,
            tab: this._navigationService.currentSelectedTab
          }) */
        this.replyService.openRephraseSFDCSignal.set(
          {
            openPopup: false,
            position: null,
            rephraseOptions: null,
            tab: this._navigationService.currentSelectedTab
          })
      } else {
        /* this.replyService.openRephrase.next({
          openPopup: false,
          position: null,
          rephraseOptions: null,
          tab: this._navigationService.currentSelectedTab
        }); */
        this.replyService.openRephraseSignal.set({
          openPopup: false,
          position: null,
          rephraseOptions: null,
          tab: this._navigationService.currentSelectedTab
        });
      }
    }
    this.clearVariables();
    this.clearTimeout();
    this.destroyApiCalls();
  }

  addNewElement(inputid): void {
    if (this.maxLengthInput <= 0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Reply-Max-Length-Reached'),
        },
      });
      return;
    } else {
      const textareaindex = this.textAreaCount.findIndex(
        (obj) => obj.id === +inputid
      );
      if (textareaindex > -1) {
        if (this.textAreaCount[+inputid].text == '') {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-Type-Something'),
            },
          });
          return;
        }
        this.textAreaCount[+inputid].showPost = true;
        this.textAreaCount[+inputid].showSpan = false;
        this.textAreaCount[+inputid].showTotal = false;
        this.textAreaCount[+inputid].showAddNewReply = false;
        if (+inputid === 0) {
          this.textAreaCount[+inputid].showAttachmentText = true;
        }
      }

      let textarea = new TextAreaCount();
      textarea.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      textarea.id = this.textAreaCount.length - 1 + 1;

      textarea.postCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      textarea.showPost = true;
      textarea.showSpan = true;
      textarea.showTotal = true;
      textarea.showAddNewReply = true;
      textarea.showAttachmentText = false;
      this.setTextArea(null, textarea.id);
      this.textAreaCount.push(textarea);
      this.setShowSpanCount();
      // setTimeout(() => {
      //   this.textAreas.find((item, idx) => {
      //   return idx === 1;
      // })?.nativeElement.focus(); }, 1);
      // this.textAreaCount[0].text = 'lol are you';
    }
  }

  addNewTextArea(text): void {
    this.setValuesOfAllPreviousTextArea();
    let textarea = new TextAreaCount();
    textarea.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
    textarea.id = this.textAreaCount[this.textAreaCount.length - 1].id + 1;
    textarea.text = text;

    textarea.showPost = true;
    textarea.showSpan = true;
    textarea.showTotal = true;
    textarea.showAddNewReply = true;
    textarea.showAttachmentText = false;

    const twitterLibrary = require('twitter-text');
    const twitterObj = twitterLibrary.default.parseTweet(text);
    const limit = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
    textarea.postCharacters = limit - twitterObj.weightedLength;
    this.setTextArea(null, textarea.id);
    // set the first TextReply
    this.textAreaCount.push(textarea);
    this.setShowSpanCount();
    this.changeTextArea(this.textAreaCount);
    // this._ngZone.runOutsideAngular(() => {
    //   setTimeout(() => {
    //     this.textAreas.last?.nativeElement.focus();
    //   }, 500);
    // });
  }

  setShowSpanCount(): void {
    if (this.textAreaCount.length > 1) {
      // eslint-disable-next-line @typescript-eslint/prefer-for-of
      for (let i = 0; i < this.textAreaCount.length; i++) {
        this.textAreaCount[i].spanCount = `${this.textAreaCount[i].id + 1}/${
          this.textAreaCount.length
        }`;
        this.textAreaCount[i].showSpan = true;
      }
    } else {
      this.textAreaCount[0].showSpan = false;
    }
  }

  setValuesOfAllPreviousTextArea(): void {
    for (let i = 0; i < this.textAreaCount.length; i++) {
      this.textAreaCount[i].showPost = true;
      this.textAreaCount[i].showSpan = true;
      this.textAreaCount[i].showTotal = false;
      this.textAreaCount[i].showAddNewReply = false;
      this.textAreaCount[i].showAttachmentText = false;
      if (i === 0) {
        this.textAreaCount[i].showAttachmentText = true;
      }
    }
  }

  setTextArea(event, id): void {
    const textareaindex = this.textAreaCount.findIndex((obj) => obj.id === +id);
    if (textareaindex > -1) {
      this.textAreaCount.forEach((obj) => (obj.isSelected = false));
      this.textAreaCount[textareaindex].isSelected = true;
    }
  }

  changeTextArea(textareaCount): void {
    this.textAreaCount = [];
    this.textAreaCount = textareaCount;
  }
  trackByIndex(index: number, obj: any): any {
    return index;
  }

  testingTwiiter(event, inputid): void {
    const twitterLibrary = require('twitter-text');
    const twitterObj = twitterLibrary.default.parseTweet(event.target.value);
    // console.log(twitterObj);
    // this.textAreaCount[inputid].text = 'Hello';
    if (event.target.value.length > 9) {
      event.target.value = 'wow';
    }
    this.changeTextArea(this.textAreaCount);
  }

  isEmail(email): any {
    const regex =
      /^([a-zA-Z0-9_&#.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  replyHandleChanged(): void {
    // this._chatBotService.chatBotHideObs.next({ status: true });
    this._chatBotService.chatBotHideObsSignal.set({ status: true });

    if (this.ticketReplyDTO && this.ticketReplyDTO?.handleNames && this.ticketReplyDTO?.handleNames.length){
      const isExist = this.ticketReplyDTO.handleNames.find(res => res?.socialId == this.replyForm.get('replyHandler').value);
      if(isExist){
        this.isPremiumTwitterAccount(isExist);
      }
    }
    if (this.objBrandSocialAcount && this.objBrandSocialAcount?.length && this._postDetailService?.postObj?.channelGroup === ChannelGroup.Email && this.baseMentionObj?.provider == 'Gmail') {
      const selectedHandle: any = this.objBrandSocialAcount.find(
        (obj: any) => obj?.socialId == this.replyForm.get('replyHandler')?.value
      );
      if (selectedHandle && selectedHandle?.outgoingAlias && this.emailToEmail && this.emailToEmail?.length) {
        this.emailToEmail = this.emailToEmail.filter(res => res != selectedHandle?.outgoingAlias);
      }
    }
  }

  checkCcBccEmpty(): void {
    // check CC & Bcc empty or not
    if (this.emailCCEmails.length > 0) {
      this.replyEmailcc = true;
    } else {
      this.replyEmailcc = false;
    }
    if (this.emailBCCEmails.length > 0) {
      this.replyEmailBcc = true;
    } else {
      this.replyEmailBcc = false;
    }
  }

  checkSendCcEmpty(): void {
    if (this.emailCCEmails.length > 0) {
      this.sendEmailcc = true;
    } else {
      this.sendEmailcc = false;
    }
  }

  checkSendBccEmpty(): void {
    // check CC & Bcc empty or not

    if (this.emailBCCEmails.length > 0) {
      this.sendEmailBcc = true;
    } else {
      this.sendEmailBcc = false;
    }
  }

  checkReplyEmailCc(): void {
    // focus on cc email field
    this.replyEmailcc = true;
    this._ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        if (this.emailFieldsCc) {
          this.emailFieldsCc?.nativeElement.focus();
        }
      });
    });
  }
  checkReplyEmailBcc(): void {
    // focus on bcc email field
    this.replyEmailBcc = true;
    this._ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        if (this.emailFieldsBcc) {
          this.emailFieldsBcc?.nativeElement.focus();
        }
      });
    });
  }

  auto_grow(element, textAreaDiv) {
    element.style.height = '1px';
    element.style.height = element.scrollHeight + 'px';
    /* if (element.style.height > 150 + 'px') {
      textAreaDiv.style.height = element.scrollHeight + 20 + 'px';
      console.log(textAreaDiv.style.height);
    } */
    // this.postReplyScroll?.nativeElement.scrollTop = this.postReplyScroll?.nativeElement.scrollHeight;
  }

  onKey() {
    // without type info
    this.inputElement.nativeElement.selectionStart = this.textAreaPos;
    this.inputElement.nativeElement.selectionEnd = this.textAreaPos;
    // this.inputElement?.nativeElement.focus();
  }

  GetEmailOutgoingSetting(): void {
    const obj = {
      Brandinfo: {
        BrandID: this.baseMentionObj.brandInfo.brandID,
        BrandName: this.baseMentionObj.brandInfo.brandName,
      },
      AccountId: this.baseMentionObj.settingID,
    };

    this.GetEmailOutgoingSettingApi = this.replyService.GetEmailOutgoingSetting(obj).subscribe((res) => {
      if (res.success) {
        if (res?.data && res?.data['cc'] && res?.data['cc'] != '') {
          if (res.data['cc'].includes(',')) {
            this.emailCCEmails = res.data['cc'].split(',');
          } else {
            this.emailCCEmails = [res.data['cc']];
          }
        }
        if (this.emailCCEmails?.length==0) {
          this.emailCCEmails = this.emailCCEmails.concat(
            this.baseMentionObj.ccMailList
          );
        }
        if (res?.data && res.data['bcc'] && res.data['bcc'] != '') {
          if (res.data['bcc'].includes(',')) {
            this.emailBCCEmails = res.data['bcc'].split(',');
          } else {
            this.emailBCCEmails = [res.data['bcc']];
          }
        }
        this.removeReplyHandleFromCcOrBcc();
        this.checkCcBccEmpty();
      }
    });
  }

  // onPaste(){
  //     let id = this.textAreaCount.length - 1;
  //     setTimeout(() => {
  //       this.textAreas.find((item, idx) => {
  //         return idx === id;
  //       })?.nativeElement.focus();
  //     }, 1);
  // }
  onReady(event: any) {
    this.ckeditorRef = event.editor;
    this.ckeditorRef.focus();
  }

  togglePrevMail(): void {
    console.log(this.storedReceivedText, 'storedReceivedText');
    this.showPrevoiusMail = false;
    this.emailReplyText = this.emailReplyText.concat(
      `${this.storedReceivedText}`
    );
    this.ckeditorRef.focus();
  }

  toggleForForwardEmail():void{
    let authorName = this.baseMentionObj.author.socialId;
    let name = this.baseMentionObj.author.name;
    let data = '';
    let receivedText = this.baseMentionObj?.emailContent ? this.baseMentionObj.emailContent : '';
    if (this.baseMentionObj?.mentionTime){
      data = this.baseMentionObj.mentionTime ? moment.utc(this.baseMentionObj.mentionTime).local().format('ddd, MMM D, YYYY [at] h:mm A') : '';
    }
    let forwardedContent = "---------- Forwarded message ---------<br />";
    forwardedContent += "From: " + "<b>" + name + "</b>" + "&lt;" + authorName +  "&gt;" + "<br/>";
    if (data) {
      forwardedContent += "Date: " + data + "<br/>";
    }
    forwardedContent += "Subject: " + this.baseMentionObj?.title + "<br/>";
    
    if (this.baseMentionObj?.toMailList && this.baseMentionObj?.toMailList.length){
      forwardedContent += "To: " + "&lt;" + this.baseMentionObj?.toMailList.join() + "&gt;" + "<br/>";
    }
    if (this.baseMentionObj?.ccMailList && this.baseMentionObj?.ccMailList.length) {
      forwardedContent += "CC: " + "&lt;" + this.baseMentionObj?.ccMailList.join() + "&gt;" + "<br/>";
    }
    if (this.baseMentionObj?.bccMailList && this.baseMentionObj?.bccMailList.length) {
      forwardedContent += "BCC: " + "&lt;" + this.baseMentionObj?.bccMailList.join() + "&gt;" + "<br/>";
    }
    forwardedContent += "<br/>" + receivedText;
    this.emailReplyText = this.emailReplyText.concat(
      `<br>${forwardedContent}`
    );
    this.showPrevoiusMail = false;
    this.ckeditorRef.focus();
  }

  // drag & drop changes

  drop(event): void {
    if (event?.data?.dataTransfer?.$?.files) {
      const files = event?.data?.dataTransfer?.$?.files;
      if (files && Object.values(files).length == 1) {
        // this.ckEditorLoader=true;
        // this.base64ImageArray = [];
        // this.uploadedServerLink = []
        // Object.values(files).forEach(mediaObj => {
        //   if (mediaObj['type'] == 'image/png' || mediaObj['type'] == 'image/jpeg' || mediaObj['type'] == 'image/gif')
        //   {
        //   this.fileToBase64(mediaObj).then((result) => {
        //     this.base64ImageArray.push(result);
        //     const base64String = result.replace('data:', '').replace(/^.+,/, '');
        //     const obj = {
        //       Image: base64String,
        //       Imagelocation: ImageEditorEnum.EmailContent,
        //     };
        //     this.accountSettingService
        //       .UploadUserProfilePicOnS3(obj)
        //       .subscribe((result) => {
        //         this.ckEditorLoader = false;
        //         if (result.success) {
        //           this.uploadedServerLink.push(result.data)
        //           if (this.uploadedServerLink.length == this.base64ImageArray.length) {
        //             this.base64ImageArray.forEach((mediaString,index)=>{
        //               this.emailReplyText = this.emailReplyText.replace(mediaString, this.uploadedServerLink[index])
        //             })
        //           }
        //         }
        //       },err=>{
        //         this.ckEditorLoader = false;
        //       });
        //   });
        // }
        // });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Drag-and-Drop-Image-Message'),
          },
        });
      }
    }
  }

  paste(event): void {
    if (event?.data?.dataValue) {
      let htmlValue: string = event.data.dataValue;
      if (htmlValue && htmlValue.includes('<img')) {
        this.ckEditorLoader = true;
        htmlValue = htmlValue.replace('<img src="', '');
        htmlValue = htmlValue.replace('" />', '');
        htmlValue = htmlValue.trim();
        const base64String = htmlValue.replace('data:', '').replace(/^.+,/, '');
        const obj = {
          Image: base64String,
          Imagelocation: ImageEditorEnum.EmailContent,
        };
        this.cdr.detectChanges()
        this.UploadUserProfilePicOnS3Api = this.accountSettingService.UploadUserProfilePicOnS3(obj).subscribe(
          (result) => {
            this.ckEditorLoader = false;
            if (result.success) {
              this.emailReplyText = this.emailReplyText.replace(
                htmlValue,
                result.data
              );
              this.ckEditorLoader = false;
              this.cdr.detectChanges()
            }
          },
          (err) => {
            this.ckEditorLoader = false;
            this.cdr.detectChanges()
          }
        );
      }
    }
  }

  fileToBase64 = (file: any): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.toString());
      reader.onerror = (error) => reject(error);
    });
  };

  ticketDispositionDialog(qualifiedTickets?,aiTagEnabled?): void {
    const despositionObj:any = {
      baseMention: this.baseMentionObj,
      dispositionList: this.ticketDispositionList,
      note: this.ticketDispositionDetails?.data ? this.ticketDispositionDetails?.data?.note : '',
      ticketdispositionID: this.ticketDispositionDetails?.data ? this.ticketDispositionDetails?.data?.ticketdispositionID : 0,
      isReply: true,
      PopTypeReasons: this.PopTypeReasons,
      agentIQResponseGenieEditMode: this.agentIQResponseGenieEditMode
    } 
    if (aiTagEnabled){
      despositionObj.dispositionOff = true;
    }
    if (qualifiedTickets){
      despositionObj.qualifiedTickets = qualifiedTickets
    }
    const dialogRef = this.dialog.open(TicketDispositionComponent, {
      width: aiTagEnabled ? '55vw' : (this.isAITicketTagEnabled && this.isAIInsightsEnabled) ? '72vw' : '55vw',
      data: despositionObj,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.dispositionDetails = res;
        /* foul keyword log */
        let allresponse = this.textAreaCount[0].text;
        this.FoulKeywordData.ContainFoulKeywords = [];
        for (const item of this.foulKeywordArr) {
          const regx = new RegExp(`\\b${item.name.toLowerCase()}\\b`);
          if (regx.test(allresponse.toLowerCase())) {
            this.FoulKeywordData.ContainFoulKeywords.push({
              Id: item.id,
              Keyword: item.name,
            });
          }
          if (!/^[a-zA-Z]+$/.test(item.name.toLowerCase())) {
            const megx = new RegExp(`(?:^|[^\\p{L}\\p{N}])'${item.name.toLowerCase()}'(?=[^\\p{L}\\p{N}]|$)`);
            if (megx.test(allresponse.toLowerCase())) {
              this.FoulKeywordData.ContainFoulKeywords.push({
                Id: item.id,
                Keyword: item.name,
              });
            }
          } 
        }
        if (this.FoulKeywordData.ContainFoulKeywords.length > 0) this.logForFoulKeyword(allresponse, true);
        else if(res?.editFlag)
        {
          this.actionProcessing=false;
              this.disableSaveButton = false;
          this.agentIQResponseGenieEditMode = true;
          this.suggestionInsert();
          if (this.replyForm.get('replyType').value == 5 || this.replyForm.get('replyType').value == 18)
          {
            this.SetBackClick();
          }
        }else if (res?.composeReplyFlag)
        {
          
        }
        else this.saveReply(true);
        /* foul keyword log */
      } 
      else {
        this.disableSaveButton = false;
        this.allowFoul = false;
        this.cdr.detectChanges();
      }
    });
  }
  getSignatureSymbol(): void {
    this.GetSignatureSymbolListApi = this.agentSignatureService.GetSignatureSymbolList().subscribe((result) => {
      if (result.success) {
        this.allSignatureSymbol = result.data;
        this.createReplySignature();
      }
    });
  }

  setPersonalDetailsForm(flag: boolean): void {
    if (flag) {
      if (this.baseMentionObj.channelGroup == ChannelGroup.Email) {
        this.emailReplyText = this.emailReplyText + ' {formLink}';
      } else {
        for (let i = 0; i < this.textAreaCount.length; i++) {
          // if (this.textAreaCount[i].postCharacters >= 24) {
          this.textAreaCount[i].text =
            this.textAreaCount[i].text + ' ' + `{formLink}`;
          this.ReplyInputChangesModifiedCopy(
            this.textAreaCount[i].text,
            this.textAreaCount[i].id
          );
        }
      }
    } else {
      if (this.baseMentionObj.channelGroup == ChannelGroup.Email) {
        if (this.emailReplyText.indexOf('{formLink}') > -1) {
          this.emailReplyText = this.emailReplyText.replace('{formLink}', '');
        }
      } else {
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.textAreaCount.length; i++) {
          if (this.textAreaCount[i].text.indexOf('{formLink}') > -1) {
            this.textAreaCount[i].text = this.textAreaCount[i].text.replace(
              '{formLink}',
              ''
            );
            this.ReplyInputChangesModifiedCopy(
              this.textAreaCount[i].text,
              this.textAreaCount[i].id
            );
            break;
          }
        }
      }
    }
  }

  createPersonalDetailsRequiredCheckBox(): void {
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.baseMentionObj?.brandInfo?.brandID
    );
    if (brandInfo && brandInfo.isSafeFormActive) {
      const sendDmLinkFlag = this.replyLinkCheckbox.some(
        (obj) => obj.replyLinkId == Replylinks.SendAsDM && obj.checked
      );
      const checkReplyType = +this.replyForm.get('replyType').value;
      const index = this.replyLinkCheckbox.findIndex(
        (obj) => obj.replyLinkId == Replylinks.PersonalDetailsRequired
      );
      if (sendDmLinkFlag && checkReplyType == 14) {
        if (index > -1) {
          this.replyLinkCheckbox.splice(index, 1);
        } else {
          this.replyLinkCheckbox.push({
            name: 'Personal Details Required',
            socialId: '',
            replyLinkId: Replylinks.PersonalDetailsRequired,
            checked: false,
            disabled: false,
          });
        }
      } else {
        if (index > -1) {
          this.replyLinkCheckbox.splice(index, 1);
        }
      }
    }
  }

  applyRephraseData(event) {
    let arr = []
    let replyText = ''
    const isEmail = this.baseMentionObj.channelGroup == ChannelGroup.Email ? true : false;

    if (isEmail) {
      replyText = this.emailReplyText;
      if (event.isNotFromInsertPopover){
        this.emailReplyText = '';
      }
    } else {
      replyText = this.textAreaCount.map(x => x.text).join('');
      if (event.isNotFromInsertPopover) {
        this.textAreaCount = [];
        let textareaObj = new TextAreaCount();
        textareaObj.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
        this.textAreaCount.push(textareaObj);
      }
    }
    if (event?.isNotFromInsertPopover == false){
      replyText = this.rephraseText;
    }

    if (this.undoArr.length == 0 && replyText != '' && replyText) {
      this.undoArr.push({ text: replyText, language: '' });
      this.replyService.undoredoChanged.next({ status: true, language: event.language });
    }

    if(event.isNotFromInsertPopover){
      this.rephraseLoaderForTextarea = true;
    } else {
      this.rephraseLoader = true;
    }
    this.replyService.rephraseLoader.next(true);
    switch(event.settingOption){
      case 'AISuggestions':
        if (!this.showLockStrip) {
          this.getAiSmartSuggestion(isEmail, event);
        }
        break;
      case 'Translate':
        this.getTranslate(isEmail, event, replyText);
        break;
      case 'Rephrase':
        this.getRephrase(isEmail, event, replyText);
        break;
      case 'Prompt':
        this.getRephrase(isEmail, event, replyText);
        break;
    }
    this.cdr.detectChanges();
  }

  getAiSmartSuggestion(isEmail, event) {
    const category = this.baseMentionObj.categoryMap?.map((x) => x.name);
    let lastAuthorMsg=""
    if (this.baseMentionObj.channelGroup == ChannelGroup.WhatsApp){
      lastAuthorMsg = this.baseMentionObj?.title || this.baseMentionObj.description
    } else if (this.baseMentionObj.channelGroup == ChannelGroup.Email){
      lastAuthorMsg = this.baseMentionObj?.description || this.baseMentionObj?.emailContent || this.baseMentionObj?.emailContentHtml
    } else{
      lastAuthorMsg = this.baseMentionObj?.description
    }
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.baseMentionObj.brandInfo.brandID
    );
    let isAgentIQ = brandInfo?.isAgentIQEnabled ? true : false;
    const isBypass: boolean = (this.baseMentionObj.channelGroup == ChannelGroup.GoogleMyReview || this.baseMentionObj.channelGroup == ChannelGroup.GooglePlayStore)
    if (lastAuthorMsg || isBypass){
      const obj = {
        brand_name: this.baseMentionObj.brandInfo?.brandName,
        brand_id: this.baseMentionObj.brandInfo?.brandID,
        author_id: this.baseMentionObj.author?.socialId,
        author_name: this.baseMentionObj.author?.name,
        channel_group_id: this.baseMentionObj.channelGroup,
        ticket_id: this.baseMentionObj.ticketID,
        ticket_category: category,
        last_author_msg: lastAuthorMsg,
        channel_type: this.baseMentionObj.channelType,
        rating: this.baseMentionObj.rating,
        user_id: this.currentUser?.data?.user?.userId,
        tag_id: this.baseMentionObj?.tagID,
        is_agentiq: isAgentIQ,
        agent_guidelines: brandInfo?.brand_Response_guidlines ? brandInfo?.brand_Response_guidlines : '',
        agent_reasons: null,
        mention_datetime: this.baseMentionObj.mentionTime,

      };
      this.getAISmartSuggestionsApi =this._chatBotService.getAISmartSuggestions(obj).subscribe((res) => {
        if (res?.success && res?.data && res?.data?.result[0]) {
          const obj = [{
            text: res?.data?.result[0],
            isAICaution: res?.data?.caution,
            caution: res?.data?.caution_text,
            isSelected: false
          }]
          this.rephraseText = res?.data?.result[0];
          this.responseGenieReply = res?.data?.result[0];
          this.baseMentionObj.isSmartSuggestionGenerated = true;
          this.baseMentionObj.smartSuggestion = obj;
          this.rephraseLoader = false;
          this.rephraseLoaderForTextarea = false;
          this.isAICaution = res?.data?.caution
          this.CautionFlagForLogs = res?.data?.caution
          this.cautionText = res?.data?.caution_text
          this.replyService.rephraseLoader.next(false);
          if (isEmail) {
            this.rephraseText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
            if (event.isNotFromInsertPopover) {
              this.emailReplyText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
            }
            // this.emailReplyText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
          } else {
            if (event.isNotFromInsertPopover) {
              this.replaceInputFromRephraseData()
            }
            // this.replaceInputFromRephraseData()
          }
          // this.cdr.detectChanges();
          if (this.undoArr.length == 3) {
            this.undoArr.splice(0, 1);
          }
  
          this.undoArr.push({ text: this.rephraseText, language: '' });
          this.replyService.undoArr = this.undoArr
          this.replyService.undoredoChanged.next({ status: true, language: '' });
          this.aiSuggestionLoader = false
          this.getAICreditStatus(event.isNotFromInsertPopover);
          this.cdr.detectChanges();
        } else {
          const error = JSON.parse(res?.data)?.error
          if(error && error?.length > 0 ){
            this.rephraseLoader = false;
            this.rephraseLoaderForTextarea = false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: error[0]
              },
            });
          }else{
            this.onErrorAiApi(isEmail, 'generate ai smart suggestion');
          }
          this.aiSuggestionLoader = false;
          this.cdr.detectChanges()
        }
      }, err => {
        
        this.onErrorAiApi(isEmail, 'generate ai smart suggestion')
        this.aiSuggestionLoader = false;
        this.cdr.detectChanges()
      })
    } else{
      this.rephraseLoader = false;
      this.rephraseLoaderForTextarea = false;
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Unable-Generate-AI-Suggestion')
        },
      });
    }
  }

  getTranslate(isEmail, event, replyText) {
    let arr=[];
    const obj = {
      language: event.language,
      text: replyText,
      user_id: this.currentUser?.data?.user?.userId,
      tag_id: this.baseMentionObj?.tagID,
      brand_name: this.baseMentionObj?.brandInfo?.brandName,
      brand_id: Number(this.baseMentionObj?.brandInfo?.brandID),
      ticket_id: this.baseMentionObj?.ticketID,
    }
    arr.push(obj);

    this.translateReplyApi =this.replyService.translateReply(arr).subscribe(res => {
      if (res?.success && res.data[0].translate) {
        this.rephraseText = res.data[0].translate;
        this.rephraseLoader = false;
        this.rephraseLoaderForTextarea = false;
        this.replyService.rephraseLoader.next(false);

        if (isEmail) {
          if (event.isNotFromInsertPopover) {
            this.emailReplyText = this.rephraseText;
          }
        } else {
          if (event.isNotFromInsertPopover) {
            this.replaceInputFromRephraseData()
          }
          // this.replaceInputFromRephraseData()
        }
        this.getAICreditStatus(event.isNotFromInsertPopover);
        // this.cdr.detectChanges();
        this.setSelectText(res.success, isEmail)
        if (this.undoArr.length == 3) {
          this.undoArr.splice(0, 1);
        }
        this.undoArr.push({ text: this.rephraseText, language: event.language });
        this.replyService.undoArr = this.undoArr
        this.replyService.undoredoChanged.next({ status: true, language: event.language });
      } 
      else {
        this.onErrorAiApi(isEmail, 'translate');
      }
    }, err => {
      this.onErrorAiApi(isEmail, 'translate')
    })
  }

  getRephrase(isEmail, event, replyText) {
    let obj = {
      prompt: event.promptText,
      text: replyText,
      language: event.language,
      user_id: this.currentUser?.data?.user?.userId,
      channel_group: this.baseMentionObj.channelGroup,
      channel_type: this.baseMentionObj.channelType,
      tag_id: this.baseMentionObj?.tagID,
      brand_id: Number(this.baseMentionObj?.brandInfo?.brandID),
      brand_name: this.baseMentionObj?.brandInfo?.brandName,
      ticket_id: this.baseMentionObj?.ticketID,
    };
    if(event.settingOption != 'Prompt'){

      const data = {
        manner: event.messageManner == 'medium' ? 'standard' : event.messageManner,
        tone: event.messageTone
      }
      obj = Object.assign(obj, data);
    //   obj = {
    //     prompt: event.promptText,
    //     text: replyText,
    //     language: event.language,
    //     user_id: this.currentUser?.data?.user?.userId,
    //     channel_group: this._postDetailService.postObj?.channelGroup,
    //     channel_type: this._postDetailService.postObj?.channelType
    //   }
    // }else{
      // obj = {
      //   manner: event.messageManner == 'medium' ? 'standard' : event.messageManner,
      //   tone: event.messageTone,
      //   text: replyText,
      //   prompt: event.promptText,
      //   language: event.language,
      //   user_id: this.currentUser?.data?.user?.userId,
      //   channel_group: this._postDetailService.postObj?.channelGroup,
      //   channel_type: this._postDetailService.postObj?.channelType
      // }
    }

    this.rephraseDataApi = this.replyService.rephraseData(obj).subscribe(res => {
      if (res?.success && res?.data?.length > 0 && res.data[0].rephrase) {
        this.rephraseText = res.data[0].rephrase;
        this.rephraseLoader = false;
        this.rephraseLoaderForTextarea = false;
        this.replyService.rephraseLoader.next(false);
        if (isEmail) {
          if (event.isNotFromInsertPopover) {
            this.emailReplyText = this.rephraseText
          }
        } else {
          if (event.isNotFromInsertPopover) {
            this.replaceInputFromRephraseData()
          }
          // this.replaceInputFromRephraseData()
        }
        this.getAICreditStatus(event.isNotFromInsertPopover);
        // this.cdr.detectChanges();
        this.setSelectText(res.success, isEmail)
        if (this.undoArr.length == 3) {
          this.undoArr.splice(0, 1);
        }
        this.undoArr.push({ text: this.rephraseText, language: event.language });
        this.replyService.undoArr = this.undoArr
        this.replyService.undoredoChanged.next({ status: true, language: event.language });
      } else {
        this.onErrorAiApi(isEmail, 'rephrase');
      }
    }, err => {
      this.onErrorAiApi(isEmail, 'rephrase')
    })
  }

  onErrorAiApi(isEmail, type){
    this.rephraseLoader = false;
    this.rephraseLoaderForTextarea = false;
    this.replyService.rephraseLoader.next(false);
    if (this.undoArr.length > 0) {
      this.rephraseText = this.undoArr[this.undoArr.length - 1].text;
      if (isEmail) {
        this.emailReplyText = this.rephraseText
      } else {
        // this.replaceInputFromRephraseData();
      }
    }
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Error,
        message: `Unable to ${type} text. Please try again.`,
      },
    });
    this.cdkRef.detectChanges();
  }

  getAICreditStatus(isNotFromInsertPopover?:boolean){
    const obj = {
      user_id: this.currentUser?.data?.user?.userId
    }
    this.subs.add(
      this._aiFeatureService.getCreditStatus(obj).subscribe((response)=>{
        if(response.success){
          const data = response.data.result[0]
          this.showAICreditExpired = data.credit_expired;
          this.showAICreditExpiredAlert = data.credit_expired_alert
          if (!this.showAICreditExpired){
            if (data.credit_expired_alert){
              if (this.isRephraseToolbar) {
                this.AIFeatureStyleObj.rephraseIcon = 'assets/images/media/rephrase-credit-expired-alert.svg';
                this.AIFeatureStyleObj.rephraseTootip = this.translate.instant('AI-Rephrase-Feature-Expiration');
              }
              if(this.rephraseOptions.isAISuggestion){
                this.AIFeatureStyleObj.suggestIcon = 'assets/images/media/smart_suggestion-expirealert.svg';
                this.AIFeatureStyleObj.suggestionBorder = '1px solid #1C9F00'
                this.AIFeatureStyleObj.suggestTootip = this.translate.instant('AI-Smart-Suggestion-Expiration');
              }
            }else{
              if(this.isRephraseToolbar){
                this.AIFeatureStyleObj.rephraseIcon = 'assets/images/media/rephrase-active.svg';
                this.AIFeatureStyleObj.rephraseTootip = this.translate.instant('Rephrase')
              }
              if (this.rephraseOptions.isAISuggestion) {
                this.AIFeatureStyleObj.suggestIcon = 'assets/images/media/smart_suggestion-active.svg';
                this.AIFeatureStyleObj.suggestionBorder = '1px solid #1C9F00'
                this.AIFeatureStyleObj.suggestTootip = this.translate.instant('Generate-Response')
              }
            }
            if (this.rephraseOptions.isAIAutopopulate && !this.autoRenderAi) {
              if (this.baseMentionObj.isSmartSuggestionGenerated) {
                this.rephraseText = isNotFromInsertPopover == false ? this.rephraseText : this.baseMentionObj?.smartSuggestion[0]?.text;
                this.isAICaution = this.baseMentionObj.smartSuggestion[0].isAICaution
                this.cautionText = this.baseMentionObj?.smartSuggestion[0]?.caution
                if (this.baseMentionObj.channelGroup === ChannelGroup.Email) {
                  this.rephraseText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
                  if (isNotFromInsertPopover){
                    this.emailReplyText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
                  }
                } 
                // this.replaceInputFromRephraseData()
              } else {
                const obj = {
                  settingOption: 'AISuggestions'
                }
                this.applyRephraseData(obj);
                this.isAIAutoResponse = true;
                if(!this.userPostView){
                  this._ngZone.run(() => {
                    const menu = document.querySelector('.aiSmartSuggesionMenu');
                    if (menu) {
                      menu.dispatchEvent(new Event('click'));
                    }
                  });
                }
              }
            }
          }else{
            if (this.isRephraseToolbar) {
              this.AIFeatureStyleObj.rephraseIcon = 'assets/images/media/rephrase-credit-expired.svg';
              this.AIFeatureStyleObj.rephraseTootip = this.translate.instant('AI-Rephrase-Feature-Expired')
            }
            if (this.rephraseOptions.isAISuggestion) {
              this.AIFeatureStyleObj.suggestIcon = 'assets/images/media/smart_suggestion-expire.svg';
              this.AIFeatureStyleObj.suggestionBorder = '1px solid #1C9F00'
              this.AIFeatureStyleObj.suggestTootip = this.translate.instant('AI-Smart-Suggestion-Expired')
            }
          }
          this._aiFeatureService.ticketSummarizationCreditDetails.next(data);
        }
        this.cdr.detectChanges();
      })
    );
  }

  getSuggestedResponse(){
    const aiobj = {
      user_id: this.currentUser?.data?.user?.userId,
      brand_id: Number(this.baseMentionObj?.brandInfo?.brandID),
    }
    this.subs.add(
      this._aiFeatureService.getSuggestedRresponse(aiobj).subscribe((res) => {
        if (res?.success && res?.data?.length > 0) {
        const aiSuggestedRresponse = res.data[0];
        let showAIPrompt = true;
        if (aiSuggestedRresponse && aiSuggestedRresponse?.IsCustomFeature) {
          showAIPrompt = (this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent || this.currentUser.data.user.role === UserRoleEnum.LocationManager) ? true : false;
        } else {
          showAIPrompt = true;
        }
        const option = {
          isGlobal: aiSuggestedRresponse?.IsAISuggestedFeatureEnabled,
          isAISuggestion: aiSuggestedRresponse?.IsSuggestedResponseEnabled,
          isRephrase: aiSuggestedRresponse?.IsRephraseFeatureEnabled,
          isTranslate: aiSuggestedRresponse?.IsTranslateFeatureEnabled,
          isShowPrompt: showAIPrompt,
          rephraseActions: JSON.parse(aiSuggestedRresponse?.RephraseActionJson),
          isAIAutopopulate: aiSuggestedRresponse?.auto_reply ? true : false
        }
        this.rephraseOptions = option;
        if (!option.isTranslate && !option.isRephrase) {
          this.AIFeatureStyleObj = {
            rephraseIcon: 'assets/images/media/rephrase-inactive.svg',
            suggestIcon: '',
            suggestionBorder: '',
            rephraseTootip: this.translate.instant('AI-Rephrase-current-disabled'),
          }
          this.isRephraseToolbar = false;
        } else {
          this.isRephraseToolbar = true;
        }

        if(!option?.isAISuggestion){
          this.AIFeatureStyleObj.suggestIcon = 'assets/images/media/smart_suggestion-inactive.svg'
          this.AIFeatureStyleObj.suggestionBorder = '1px solid #C3CBD7'
          this.AIFeatureStyleObj.suggestTootip = this.translate.instant('AI-Smart-Suggestion-current-disabled')
        }

        if (this.rephraseOptions.isGlobal) {
          this.loadAiFeature = true;
        } else {
          this.AIFeatureStyleObj = {
            rephraseIcon: 'assets/images/media/rephrase-premium.svg',
            suggestIcon: 'assets/images/media/smart_suggestion-premium.svg',
            suggestionBorder: '1px solid #DEAA0C',
            rephraseTootip: this.translate.instant('AI-Rephrase-Feature-Premium-Only'),
            suggestTootip: this.translate.instant('AI-Smart-Suggestion-Feature-Premium-Only')
          }
          this.loadAiFeature = false;
        }
        if(this.loadAiFeature && (this.isRephraseToolbar || this.rephraseOptions?.isAISuggestion)){
          this.getAICreditStatus();
        }

          this._aiFeatureService.ticketSummarization.next({
            IsTicketSummarizationEnabled: aiSuggestedRresponse?.IsTicketSummarizationEnabled, IsAISuggestedFeatureEnabled: aiSuggestedRresponse?.IsTicketSummarizationEnabled});

        }
      })
    );
  }

  aiResponseInsert() {
    const isEmail = this.baseMentionObj.channelGroup == ChannelGroup.Email ? true : false;
    this.responseGenieUsed = true;
    this.responseGenieAccepted = true;
    if (isEmail) {
      this.emailReplyText = this.rephraseText
    } else {
      this.textAreaCount = [];
      let textareaObj = new TextAreaCount();
      textareaObj.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      this.textAreaCount.push(textareaObj);
    }
    this.replaceInputFromRephraseData();
    this.trackAIResponse(true);
    const replyObj: PerformActionParameters = {};
    const replyArray: Reply[] = [];
    const baseReply = new BaseReply();
    const customReplyObj = baseReply.getReplyClass();
    let replyinputtext = this.textAreaCount[0].text;
    if (this.isEmailChannel && this.emailReplyText.trim()) {
      let emailText = this.emailReplyText.trim();
      if (this.showPrevoiusMail) {
        emailText = emailText.concat(this.storedReceivedText);
      }
      replyinputtext = emailText;
    }
    if (!this.onlyEscalation && this.baseMentionObj.channelGroup == ChannelGroup.Email) {
      const result = this.replyLinkCheckbox.find(
        (res) => res.name == 'Add previous mail trail'
      );
      if (result && result.checked && !replyinputtext.trim()) {
        replyinputtext = this.storedReceivedText;
      }
    }
    // map the properties
    replyObj.ActionTaken = ActionTaken.Locobuzz;
    if (this.textAreaCount.length > 0 && !this.isEmailChannel) {
      for (const tweet of this.textAreaCount) {
        const customReply = baseReply.getReplyClass();
        // customReply.replyText = tweet?.text
        if (this.baseMentionObj?.channelGroup == ChannelGroup.TikTok) {
          customReply.replyText = tweet?.text?.substring(0, 150);
        } else {
          customReply.replyText = tweet?.text;
        }
        replyArray.push(customReply);
      }
      this._ticketService.replyInputTextData = replyArray?.map(item => item?.replyText).join('');
    } else {
      customReplyObj.replyText = replyinputtext
      replyArray.push(customReplyObj);
      this._ticketService.replyInputTextData = this.emailReplyText;
    }

    
    const source = this._mapLocobuzzEntity.mapMention(
      this._postDetailService?.postObj
    );
    if (this.simulationCheck) {
      source.ticketInfoSsre.ssreMode = SSREMode.Simulation;
      source.ticketInfoSsre.ssreIntent = this.SsreIntent;
    }
    replyObj.Source = source;

    /* tagged user Json */
    replyArray[0].excludedReplyUserIds = ''
    if (this.ticketReplyDTO.taggedUsers && this.ticketReplyDTO.taggedUsers.length > 0) {
      const arrayuser = [];
      for (const obj of this.ticketReplyDTO.taggedUsers) {
        arrayuser.push({
          Userid: obj.Userid,
          Name: obj.Name,
          UserType: obj.UserType,
          offset: 0,
          length: 10,
        });
      }
      replyArray[0].taggedUsersJson = JSON.stringify(arrayuser);
      if (this.unSelectedTagUsers?.length > 0) {
        /* extra check that user avaibale on taggedUsers */
        const temp_excludedReplyUserIds = this.unSelectedTagUsers.filter((item) => {
          return arrayuser.some((user) => user?.Userid == item?.Userid)
        })
        /* extra check that user avaibale on taggedUsers */
        replyArray[0].excludedReplyUserIds = [...temp_excludedReplyUserIds.map((obj) => obj?.Userid)]?.join(',')?.replace(/,\s*$/, '')
      }
    }
    // if (this.selectedSurveyForm) {
    //   replyArray[0].surveyFormURL = this.selectedSurveyForm.formURL;
    //   replyArray[0].sendSurvey = true;
    // }
    // autoclosureeligibility
    replyArray[0].eligibleForAutoclosure = this.isEligibleForAutoclosure;
    // replyArray = this._mapLocobuzzEntity.mapReplyObject(replyArray);
    const replyopt = new ReplyOptions();
    replyObj.PerformedActionText = ''
    replyObj.IsReplyModified = this.IsReplyModified;
    replyObj.Replies = replyArray;
    const selectedHandle = this.ticketReplyDTO.handleNames.find(
      (obj) => obj.socialId === this.replyForm.get('replyHandler').value
    );
    if (!this.onlyEscalation) {
      if (!this.isEmailChannel && selectedHandle) {
        replyObj.ReplyFromAccountId = selectedHandle.accountId;
        replyObj.ReplyFromAuthorSocialId = selectedHandle.socialId;
      }
      if (this.isEmailChannel) {
        replyObj.ReplyFromAccountId = +this.baseMentionObj.settingID;
        replyObj.Replies[0].toEmails =
          this.emailToEmail.length > 0 ? this.emailToEmail : [];
        replyObj.Replies[0].ccEmails =
          this.emailCCEmails.length > 0 ? this.emailCCEmails : [];
        replyObj.Replies[0].bccEmails =
          this.emailBCCEmails.length > 0 ? this.emailBCCEmails : [];
      }
      const personalDetailsRequiredFlag = this.replyLinkCheckbox?.some(
        (res) =>
          res?.replyLinkId == Replylinks.PersonalDetailsRequired &&
          res?.checked
      );
      if (personalDetailsRequiredFlag != null) {
        replyObj.isSafeForm = personalDetailsRequiredFlag;
      }
    }
    let rephraseTextWithoutSignature = this.responseGenieReply;
    let ResponseGenieStatusObj = {
      Note: JSON.stringify({ Text: rephraseTextWithoutSignature, Caution: this.CautionFlagForLogs }),
      TicketID: 0,
      TagID: String(this.baseMentionObj.tagID),
      AssignedToUserID: 0,
      AssignedToTeam: 0,
      Channel: null,
      Status: 133,
      type: "CommunicationLog",
      NotesAttachment: null
    }
    replyObj.Tasks = [ResponseGenieStatusObj];
    if (rephraseTextWithoutSignature && rephraseTextWithoutSignature.length > 0) {
      this.replyService.Reply(replyObj, true).subscribe();
    }
  }
  
  replaceInputFromRephraseData(){
    const inputevent = {
      target: {
        value: this.rephraseText
      }
    }
    this.textAreaCount = [];
    let textareaObj = new TextAreaCount();
    textareaObj.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
    if (this.baseMentionObj.channelGroup == ChannelGroup.Twitter &&
      (this.baseMentionObj.channelType === ChannelType.PublicTweets ||
      this.baseMentionObj.channelType === ChannelType.Twitterbrandmention)){
      let text = this.baseMentionObj.channelGroup == ChannelGroup.Twitter ? 'remove' : 'dontremove';
      const limit = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      if (this.rephraseText?.length <= limit){
        textareaObj.showPost = true;
        textareaObj.postCharacters = limit - this.rephraseText.length;
      }
      textareaObj.text = this.rephraseText;
      this.textAreaCount.push(textareaObj);
      this.ReplyInputChangesModified(inputevent, 0, text);
    }else{
      textareaObj.text= this.rephraseText;
      this.textAreaCount.push(textareaObj);
    }
    const strUserSignature =
      this.emailSignatureParams?.userSignatureSymbol + ' ' + this.emailSignatureParams?.userSignature;
    if (this.baseMentionObj.channelGroup !== ChannelGroup.TikTok) { 
    if (this.emailSignatureParams?.isAppendNewLineForSignature) {
      this.rephraseText = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ? this.rephraseText + ' ' + strUserSignature.trim() : this.rephraseText;
    } else {
      this.rephraseText = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ? this.rephraseText + ' ' + strUserSignature.trim() : this.rephraseText;
    }
    if (this.textAreaCount?.length) {
      this.textAreaCount[this.textAreaCount?.length - 1].text = this.rephraseText;
    }
    }
    if (this.baseMentionObj.channelGroup === ChannelGroup.TikTok && this.textAreaCount[this.textAreaCount?.length - 1]?.text?.length > 150) {
      if (this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature && !this.emailSignatureParams?.isAppendNewLineForSignature) {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.rephraseText?.substring(0, 149 - strUserSignature?.length) + ' ' + strUserSignature
      } else if (this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature && this.emailSignatureParams?.isAppendNewLineForSignature) {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.rephraseText?.substring(0, 149 - strUserSignature?.length) + '\n' + strUserSignature
      } else {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.rephraseText?.substring(0, 150);
      }
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            this.translate.instant('Tiktok-150-Char-Limit'),
        },
      });
    } else if (this.baseMentionObj.channelGroup === ChannelGroup.TikTok) {
      if (this.emailSignatureParams?.isAppendNewLineForSignature) {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ? this.rephraseText + '\n' + strUserSignature.trim() : this.rephraseText;
      } else {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ? this.rephraseText + ' ' + strUserSignature.trim() : this.rephraseText;
      }
    }
    this.cdr.detectChanges();
  }

  setSelectText(apiSuccess= false,isEmail = false) {
    if ( this.openRephrasePopup) {
      if (isEmail ) {
        let iframe = document.getElementById("ckeditor").getElementsByClassName('cke_inner')[0].getElementsByClassName('cke_contents')[0].getElementsByClassName('cke_wysiwyg_frame')[0] as HTMLIFrameElement
        var e = iframe.contentWindow.document.getElementsByTagName('body')[0];
        var r = document.createRange(); r.selectNodeContents(e);
        var s = iframe.contentWindow.document.getSelection();
        s.removeAllRanges();
        s.addRange(r);
      } else {
        this.textAreas['_results'].forEach(textareaElement => {
          this.ElementTimeout = setTimeout(() => {
            textareaElement?.nativeElement.select();
          }, 0)
        });
      }
     }
  }

  undoRephrase(isNotFromInsertPopover:boolean){
    if(this.undoArr.length > 1){
      const obj= this.undoArr.pop();
      this.rephraseText =  this.undoArr[this.undoArr.length - 1].text;
      // this.selectedLanguageTo = this.undoArr[this.undoArr.length - 1].language;
      const isEmail = this.baseMentionObj.channelGroup == ChannelGroup.Email ? true : false;
      if (isEmail) {
        this.emailReplyText = this.rephraseText
      } else {
        if (isNotFromInsertPopover){
          this.replaceInputFromRephraseData();
        }
      }
      if (this.redoArr.length >= 3) {
        this.redoArr.splice(0, 1);
      }
      this.redoArr.push({ text: obj.text, language: obj.language });
      this.replyService.redoArr = this.redoArr
      this.replyService.undoArr = this.undoArr
      this.replyService.undoredoChanged.next({ status: true, language: this.undoArr[this.undoArr.length - 1].language });
    }
  }

  redoRephrase(isNotFromInsertPopover: boolean){
    const obj = this.redoArr.pop();
    this.rephraseText= obj.text
    // this.selectedLanguageTo = obj.language
    const isEmail = this.baseMentionObj.channelGroup == ChannelGroup.Email ? true : false;
    if (isEmail) {
      this.emailReplyText = this.rephraseText
    } else {
      if (isNotFromInsertPopover){
        this.replaceInputFromRephraseData();
      }
    }
    this.undoArr.push({ text: obj.text, language: obj.language });
    this.replyService.redoArr = this.redoArr
    this.replyService.undoArr = this.undoArr
    this.replyService.undoredoChanged.next({ status: true, language: obj.language });
  }

  openAISmartSuggestion(event) {
    this.isAICaution = false;
    this.showAISmartSuggestion = event.checked;
    this.aiSuggestionLoader=true
      const obj={
        settingOption: 'AISuggestions'
      }
      this.applyRephraseData(obj)
  }

  openRephrasePopup(index){
    this.isOpenRephrasePopup = this._postDetailService.openRephrasePopup;
    this.isOpenRephrasePopup = !this.isOpenRephrasePopup;
    const element = document.getElementById('rephrase_' + index);
    const rect = element.getBoundingClientRect()
    this._postDetailService.openRephrasePopup = this.isOpenRephrasePopup;
    if (this.sfdcTicketViewUI) {
      /* this.replyService.openRephraseSFDC.next(
        {
          openPopup: this.isOpenRephrasePopup,
          position: rect,
          rephraseOptions: this.rephraseOptions,
          tab: this._navigationService.currentSelectedTab
        }) */
      this.replyService.openRephraseSFDCSignal.set(
        {
          openPopup: this.isOpenRephrasePopup,
          position: rect,
          rephraseOptions: this.rephraseOptions,
          tab: this._navigationService.currentSelectedTab
        })
    } else {
      /* this.replyService.openRephrase.next(
        {
          openPopup: this.isOpenRephrasePopup,
          position: rect,
          rephraseOptions: this.rephraseOptions,
          tab: this._navigationService.currentSelectedTab
        }) */
      this.replyService.openRephraseSignal.set(
        {
          openPopup: this.isOpenRephrasePopup,
          position: rect,
          rephraseOptions: this.rephraseOptions,
          tab: this._navigationService.currentSelectedTab
        })
    }
  }

  inputSplitObs = new Subject<any>();
  irctcZoneData:any[]=[]
  inputReplyEvent(event, inputid, text, index?){
    this.disableSaveButton = true;
    if (event.data == '@' && this.currentUser?.data?.user?.isShowTwitterHandleEnable==false && this.currentUser?.data?.user?.categoryId != 1905)
    {
      this.twitterHandleList = [];
      this.cdr.detectChanges();
    }
    if (event.data == '@' && this.currentUser?.data?.user?.isShowTwitterHandleEnable && this.currentUser?.data?.user?.categoryId != 1905) {
      this.twitterHandleList=[];
      this.cdr.detectChanges();
    }
    if (event.data == '@' && this.currentUser?.data?.user?.categoryId == 1905){
        this.twitterHandleList=[]
    }
    this.focusIndex = event.target.selectionEnd;
    this.inputSplitObs.next({ event, inputid, text, index})
  }

  itemSelected(data): any {
    if (data?.handle){
      
      data.handle = data.handle ? `${data.handle} ` : data.handle;
    } else {
      data.screen_name = data.screen_name ? `${data.screen_name} ` : data.screen_name;
    }
  }

  searchitem(data):void
  {
    if (this.baseMentionObj.channelGroup == ChannelGroup.Twitter && this.currentUser?.data?.user?.isShowTwitterHandleEnable && this.currentUser?.data?.user?.categoryId != 1905)
    {
      // this.twitterHandleList = []
      this.twitterHandleSearch.next(data);
    }
    //irctc
    if (data && this.baseMentionObj.channelGroup == ChannelGroup.Twitter && this.currentUser?.data?.user?.categoryId == 1905){
      this.twitterHandleList = this.searchFunctionForIrctc(data,this.irctcZoneData);
      this.cdr.detectChanges()
    }else{
      this.twitterHandleList = []
    }
    if (data && this.baseMentionObj.channelGroup == ChannelGroup.Twitter && this.currentUser?.data?.user?.isShowTwitterHandleEnable == false && this.currentUser?.data?.user?.categoryId != 1905) {
      this.twitterHandleSearch.next(data);
    }
  }
  itemMentioned(tag) {
    let currentUser = JSON.parse(localStorage.getItem("user"));
    if (currentUser?.data?.user?.categoryId == 1905){
      return tag.handle;
    }else{
      return '@'+tag.screen_name
    }
  }
  searchFunctionForIrctc(searchtext, data):[] {
    const resultER = data.filter((item) => data.some(r => r.code == searchtext.toUpperCase()) ? item.code == searchtext.toUpperCase() : (item.handle?.toUpperCase().includes(searchtext.toUpperCase()) ? item.handle?.toUpperCase().includes(searchtext.toUpperCase()) : item.zone?.toUpperCase().includes(searchtext.toUpperCase())));
    if (resultER.length==1) {
      return resultER[0].innerHandleData;
    } else if (resultER.length> 1){
      let ans:any = [];
      resultER.forEach((r) => ans.push(r.innerHandleData[0]))
      return ans;
    }else{
      return []
    }
  }
  searchFbTwitterHandles(value: string): void {
    this.twitterHandleList = [];
    this.cdr.detectChanges();
    const obj = {
      SearchText: value,
      BrandID: this.baseMentionObj.brandInfo.brandID,
      HasFacebook: false,
      HasTwitter: true,
    };
    this.GetTaggingAccountsApi = this.socialService.GetTaggingAccounts(obj).subscribe(
      (res) => {
        if (res.success) {
          if (res.data) {
            this.twitterHandleList = res.data.twitter ? res.data.twitter : [];
            this.cdr.detectChanges();
          }
        }
      },
      (err) => {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Unable-To-Search-Handles'),
          },
        });
      }
    );
  }

  getTwitterHandleListFromDB(value: string):void{
    this.twitterHandleList = [];
    const obj = {
      screenName: value,
      from: 0,
      to: 1000000
    }
    this.cdr.detectChanges();
    this.GetMentionSettingsApi = this._replyTagUserSettingService.GetMentionSettings(obj).subscribe((res) => {
      if (res.success) {
        if (res?.data && res?.data?.mentionSettings && res?.data?.mentionSettings.length) {
          const screenNameList = []
          res.data.mentionSettings.forEach(res => {
            screenNameList.push({ screen_name: res.screenName })
          });
          this.twitterHandleList = screenNameList
        }
        this.cdr.detectChanges();
      }
    });
    // this.twitterHandleList=[];
    // this.cdr.detectChanges();
    // this._ticketService.searchTwitterHandlesFromDB().subscribe((res)=>{
    //   if(res.success)
    //   {
    //     if(res?.data?.length>0)
    //     {
    //       const screenNameList =[]
    //       res.data.forEach(screenName => {
    //         screenNameList.push({ screen_name :screenName})
    //       });
    //       this.twitterHandleList=screenNameList
    //     }
    //     this.cdr.detectChanges();
    //   }
    // })
  }
  openEmailPopUp():void{
    this.dialog.open(PostReplybotComponent, {
      width: '60vw'
    });
  }

  changeReplyHandleEvent(obj):void
  {
  this.replyForm.get('replyType').setValue(obj.id);
  this.replyTypeName= obj.value
  this.replyTypeChange(obj.id);
  }
  getRamdomSrMessage(srCreatedMessage):string{
    if (srCreatedMessage?.length>0){
      const randomIndex = Math.floor(Math.random() * srCreatedMessage.length);
      const randomMessage = srCreatedMessage[randomIndex];
      let parts = randomMessage?.split('{SR ID:}');
      // Replace the placeholder with the actual value
      let updatedStr = `${parts[0] ? parts[0] : ''}${this.baseMentionObj.ticketInfo.srid}${parts[1] ? parts[1]:''}`;
      console.log(updatedStr);
      return updatedStr;
    }
    return '';
  }

  rejectAi(thumbDown?:boolean) {
    this.responseGenieDiscarded = true;
    if (thumbDown){
      this.aiMessageFeedback = 0;
    }
    const category = this.baseMentionObj.categoryMap?.map((x) => x.name);
    let lastAuthorMsg = ""
    if (this.baseMentionObj.channelGroup == ChannelGroup.WhatsApp) {
      lastAuthorMsg = this.baseMentionObj?.title || this.baseMentionObj.description
    } else if (this.baseMentionObj.channelGroup == ChannelGroup.Email) {
      lastAuthorMsg = this.baseMentionObj?.description || this.baseMentionObj?.emailContent || this.baseMentionObj?.emailContentHtml
    } else {
      lastAuthorMsg = this.baseMentionObj?.description
    }
    const replyObj: PerformActionParameters = {};
    const replyArray: Reply[] = [];
    const baseReply = new BaseReply();
    const customReplyObj = baseReply.getReplyClass();
    let replyinputtext = this.textAreaCount[0].text;
    if (this.isEmailChannel && this.emailReplyText.trim()) {
      let emailText = this.emailReplyText.trim();
      if (this.showPrevoiusMail) {
        emailText = emailText.concat(this.storedReceivedText);
      }
      replyinputtext = emailText;
    }
    if (!this.onlyEscalation && this.baseMentionObj.channelGroup == ChannelGroup.Email) {
      const result = this.replyLinkCheckbox.find(
        (res) => res.name == 'Add previous mail trail'
      );
      if (result && result.checked && !replyinputtext.trim()) {
        replyinputtext = this.storedReceivedText;
      }
    }
    // map the properties
    replyObj.ActionTaken = ActionTaken.Locobuzz;
    if (this.textAreaCount.length > 0 && !this.isEmailChannel) {
      for (const tweet of this.textAreaCount) {
        const customReply = baseReply.getReplyClass();
        // customReply.replyText = tweet?.text
        if (this.baseMentionObj?.channelGroup == ChannelGroup.TikTok) {
          customReply.replyText = tweet?.text?.substring(0, 150);
        } else {
          customReply.replyText = tweet?.text;
        }
        replyArray.push(customReply);
      }
      this._ticketService.replyInputTextData = replyArray?.map(item => item?.replyText).join('');
    } else {
      customReplyObj.replyText = replyinputtext
      replyArray.push(customReplyObj);
      this._ticketService.replyInputTextData = this.emailReplyText;
    }

    
    const source = this._mapLocobuzzEntity.mapMention(
      this._postDetailService?.postObj
    );
    if (this.simulationCheck) {
      source.ticketInfoSsre.ssreMode = SSREMode.Simulation;
      source.ticketInfoSsre.ssreIntent = this.SsreIntent;
    }
    replyObj.Source = source;

    /* tagged user Json */
    replyArray[0].excludedReplyUserIds = ''
    if (this.ticketReplyDTO.taggedUsers && this.ticketReplyDTO.taggedUsers.length > 0) {
      const arrayuser = [];
      for (const obj of this.ticketReplyDTO.taggedUsers) {
        arrayuser.push({
          Userid: obj.Userid,
          Name: obj.Name,
          UserType: obj.UserType,
          offset: 0,
          length: 10,
        });
      }
      replyArray[0].taggedUsersJson = JSON.stringify(arrayuser);
      if (this.unSelectedTagUsers?.length > 0) {
        /* extra check that user avaibale on taggedUsers */
        const temp_excludedReplyUserIds = this.unSelectedTagUsers.filter((item) => {
          return arrayuser.some((user) => user?.Userid == item?.Userid)
        })
        /* extra check that user avaibale on taggedUsers */
        replyArray[0].excludedReplyUserIds = [...temp_excludedReplyUserIds.map((obj) => obj?.Userid)]?.join(',')?.replace(/,\s*$/, '')
      }
    }
    // if (this.selectedSurveyForm) {
    //   replyArray[0].surveyFormURL = this.selectedSurveyForm.formURL;
    //   replyArray[0].sendSurvey = true;
    // }
    // autoclosureeligibility
    replyArray[0].eligibleForAutoclosure = this.isEligibleForAutoclosure;
    // replyArray = this._mapLocobuzzEntity.mapReplyObject(replyArray);
    const replyopt = new ReplyOptions();
    replyObj.PerformedActionText = '';
    replyObj.IsReplyModified = this.IsReplyModified;
    replyObj.Replies = replyArray;
    const selectedHandle = this.ticketReplyDTO.handleNames.find(
      (obj) => obj.socialId === this.replyForm.get('replyHandler').value
    );
    if (!this.onlyEscalation) {
      if (!this.isEmailChannel && selectedHandle) {
        replyObj.ReplyFromAccountId = selectedHandle.accountId;
        replyObj.ReplyFromAuthorSocialId = selectedHandle.socialId;
      }
      if (this.isEmailChannel) {
        replyObj.ReplyFromAccountId = +this.baseMentionObj.settingID;
        replyObj.Replies[0].toEmails =
          this.emailToEmail.length > 0 ? this.emailToEmail : [];
        replyObj.Replies[0].ccEmails =
          this.emailCCEmails.length > 0 ? this.emailCCEmails : [];
        replyObj.Replies[0].bccEmails =
          this.emailBCCEmails.length > 0 ? this.emailBCCEmails : [];
      }
      const personalDetailsRequiredFlag = this.replyLinkCheckbox?.some(
        (res) =>
          res?.replyLinkId == Replylinks.PersonalDetailsRequired &&
          res?.checked
      );
      if (personalDetailsRequiredFlag != null) {
        replyObj.isSafeForm = personalDetailsRequiredFlag;
      }
    }
    let rephraseTextWithoutSignature = this.responseGenieReply;
    let ResponseGenieStatusObj = {
      Note: JSON.stringify({ Text: rephraseTextWithoutSignature, Caution: this.CautionFlagForLogs }),
      TicketID: 0,
      TagID: String(this.baseMentionObj.tagID),
      AssignedToUserID: 0,
      AssignedToTeam: 0,
      Channel: null,
      Status: 134,
      type: "CommunicationLog",
      NotesAttachment: null
    }
    replyObj.Tasks = [ResponseGenieStatusObj];
    if(rephraseTextWithoutSignature && rephraseTextWithoutSignature.length > 0){
    this.replyService.Reply(replyObj, true).subscribe();
    }
    const obj = {
      brand_name: this.baseMentionObj.brandInfo?.brandName,
      brand_id: this.baseMentionObj.brandInfo?.brandID,
      author_id: this.baseMentionObj.author?.socialId,
      author_name: this.baseMentionObj.author?.name,
      channel_group_id: this.baseMentionObj.channelGroup,
      ticket_id: this.baseMentionObj.ticketID,
      ticket_category: category,
      last_author_msg: lastAuthorMsg,
      channel_type: this.baseMentionObj.channelType,
      rating: this.baseMentionObj.rating,
      user_id: this.currentUser?.data?.user?.userId,
      tag_id: this.baseMentionObj?.tagID,
      Feedback_like: thumbDown ? 0 : this.aiMessageFeedback == 0 ? 0 : '',
      is_response_inserted: thumbDown ? '' : 0
    };
    const dialogRef = this.dialog.open(AiFeedbackPageComponent, {
      width: '40vw',
      data: obj,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        this.aiMessageFeedback = 0;
      }else {
        this.aiMessageFeedback = 2;
      }
    });
  }

  trackAIResponse(isInsert?: boolean) {
    // this.aiMessageFeedback = 1;
    const category = this.baseMentionObj.categoryMap?.map((x) => x.name);
    let lastAuthorMsg = ""
    if (this.baseMentionObj.channelGroup == ChannelGroup.WhatsApp) {
      lastAuthorMsg = this.baseMentionObj?.title || this.baseMentionObj.description
    } else if (this.baseMentionObj.channelGroup == ChannelGroup.Email) {
      lastAuthorMsg = this.baseMentionObj?.description || this.baseMentionObj?.emailContent || this.baseMentionObj?.emailContentHtml
    } else {
      lastAuthorMsg = this.baseMentionObj?.description
    }
    if (lastAuthorMsg){
      const obj = {
        brand_name: this.baseMentionObj.brandInfo?.brandName,
        brand_id: this.baseMentionObj.brandInfo?.brandID,
        author_id: this.baseMentionObj.author?.socialId,
        author_name: this.baseMentionObj.author?.name,
        channel_group_id: this.baseMentionObj.channelGroup,
        ticket_id: this.baseMentionObj.ticketID,
        ticket_category: category,
        last_author_msg: lastAuthorMsg,
        channel_type: this.baseMentionObj.channelType,
        rating: this.baseMentionObj.rating,
        user_id: this.currentUser?.data?.user?.userId,
        tag_id: this.baseMentionObj?.tagID,
        Feedback_like: isInsert && this.aiMessageFeedback != 1 ? '' : 1,
        is_response_inserted: isInsert ? 1 : '',
        rejection_feedback: ''
      };

      this.trackAIResponseApi = this._chatBotService.trackAIResponse(obj).subscribe(res => {
        if (res?.success) {
          if (isInsert) {
            this.aiMessageFeedback = 2;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Thanks-For-Feedback'),
              },
            });
          }
        } else {
          this.aiMessageFeedback = 2;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something-Went-Wrong'),
            },
          });
          this.cdr.detectChanges();
        }
      }, err => {
        this.aiMessageFeedback = 2;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something-Went-Wrong'),
          },
        });
        this.cdr.detectChanges();
      });
    }
 
  }

  preventCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.add('disable-backdrop-click');
  }

  allowCloseOnClickOut() {
    this.overlayContainer.getContainerElement().classList.remove('disable-backdrop-click');
  }
  
  validate() {
    this.createCustomBackdrop();
  }

  createCustomBackdrop() {
    const clones = document.querySelectorAll('.clone');
    if (clones?.length === 0) {
      const overlayers = document.querySelectorAll('.controlled');
      if (overlayers) {
        overlayers.forEach((element) => {
          const clone = element.cloneNode(true);
          (clone as Element).classList.add('clone');
          clone.addEventListener('click', this.select.bind(this));
          element.parentNode.insertBefore(clone, element.nextSibling);
        });
      }
    }
  }

  removeCloneBackdrop() {
    document.querySelectorAll('.clone').forEach((element) => element.remove());
  }
  
  select(event: Event) {
    event.stopPropagation();
  }

  noteTextChange(cotrolName: string) {
    const note = this.replyForm.get(cotrolName)?.value;
    if (note && note?.length > 2500) {
      const updateNote: string = note.substring(0, 2500)
      this.replyForm.get(cotrolName)?.patchValue(updateNote);
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: "Character limit for note is 2500.",
        },
      });
      this.cdr.detectChanges();
      return false;
    }
  }
  
  getCRMTicketStatus(ticketid:number){
    if (ticketid){
      this.getCRMTicketStatusApi =this._ticketService.getCRMTicketStatus({ TicketID: ticketid }).subscribe((res) => {
        if (res.success) {
          this.crmTicketStatus = res?.data;
        }
      })
    }
  }

  onSearchTagUser(event){
    const searchText:string = (event?.target?.value)?.trim();
    if(searchText.length > 0){
      const filterdTag = this.ticketReplyDTO?.taggedUsers?.filter((item) => (item?.Name)?.toLowerCase()?.includes(searchText?.toLowerCase()))
      this.taggedUsersAsync.next(filterdTag);
    }
    else {
      this.taggedUsersAsync.next(this.ticketReplyDTO.taggedUsers);
    }
  }

 cleanEmail(rawEmail: string): string {
  // Use a regular expression to extract the email part
  const emailRegex = /<([^>]+)>/;
  const match = rawEmail.match(emailRegex);

  // If there's a match, return the email address; otherwise, return the original string
  return match ? match[1] : rawEmail;
}

  reorderDroppedItem(event: CdkDragDrop<string[]>) {
    
    if (this.selectedChips[event.previousContainer.id]?.length) {
      this.draggedEmail = [...this.selectedChips[event.previousContainer.id]];
    }
    else {
      this.draggedEmail = [event.item.data];
    } 
    console.log(event,'event');

    if (event.previousContainer.id === event.container.id) {
      // Same container, no need to process
      return;
    }

    // Remove email from the source list
    if (event.previousContainer.id === 'to' || event.previousContainer.id === 'rTo' || event.previousContainer.id === 'replyTo' || event.previousContainer.id === 'EFreplyTo') {
      this.emailToEmail = this.emailToEmail.filter((email) => !this.draggedEmail.includes(email));      
      if (event.previousContainer.id === 'to') {
        this.draggedEmail.forEach(email => {
          this.blackListedChips['to'].delete(email);
        });
        this.checkAndUpdateBlackListStatus('to');
      }
    } else if (event.previousContainer.id === 'cc' || event.previousContainer.id === 'rCC' || event.previousContainer.id === 'replyCC' || event.previousContainer.id === 'EFreplyCC') {
      this.emailCCEmails = this.emailCCEmails.filter((email) => !this.draggedEmail.includes(email));
      if (event.previousContainer.id === 'cc') {
        this.draggedEmail.forEach(email => {
          this.blackListedChips['cc'].delete(email);
        });
        this.checkAndUpdateBlackListStatus('cc');
      }
    } else if (event.previousContainer.id === 'bcc' || event.previousContainer.id === 'rBCC' || event.previousContainer.id === 'replyBCC' || event.previousContainer.id === 'EFreplyBCC') {
      this.emailBCCEmails = this.emailBCCEmails.filter((email) => !this.draggedEmail.includes(email));
      if (event.previousContainer.id === 'bcc') {
        this.draggedEmail.forEach(email => {
          this.blackListedChips['bcc'].delete(email);
        });
        this.checkAndUpdateBlackListStatus('bcc');
      }
    }

    // Add email to the target list
    if (
      (event.container.id === 'to' || event.container.id === 'rTo' || event.container.id === 'replyTo' || event.container.id === 'EFreplyTo') &&
      this.draggedEmail.some(email => !this.emailToEmail.includes(email))
    ) {
      let newDraggedMails = this.draggedEmail.filter(email => !this.emailToEmail.includes(email));
      this.emailToEmail.push(...newDraggedMails); 
      if (event.container.id == 'to') {
        newDraggedMails.forEach(email => {
          if (!this.isEmailAllowed(email)) {
            this.blackListedChips['to'].add(email);
            this.checkAndUpdateBlackListStatus('to');
          }
        });
      }
    } else if (
      (event.container.id === 'cc' || event.container.id === 'rCC' || event.container.id === 'replyCC' || event.container.id === 'EFreplyCC') &&
      this.draggedEmail.some(email => !this.emailCCEmails.includes(email))
    ) {
      // this.emailCCEmails.push(...this.draggedEmail.filter(email => !this.emailCCEmails.includes(email)));
      let newDraggedMails = this.draggedEmail.filter(email => !this.emailCCEmails.includes(email));
      this.emailCCEmails.push(...newDraggedMails);
      if (event.container.id == 'cc') {
        newDraggedMails.forEach(email => {
          if (!this.isEmailAllowed(email)) {
            this.blackListedChips['cc'].add(email);
            this.checkAndUpdateBlackListStatus('cc');
          }
        });
      }
    } else if (
      (event.container.id === 'bcc' || event.container.id === 'rBCC' || event.container.id === 'replyBCC' || event.container.id === 'EFreplyBCC') &&
      this.draggedEmail.some(email => !this.emailBCCEmails.includes(email))
    ) {
      // this.emailBCCEmails.push(...this.draggedEmail.filter(email => !this.emailBCCEmails.includes(email)));
      let newDraggedMails = this.draggedEmail.filter(email => !this.emailBCCEmails.includes(email));
      this.emailBCCEmails.push(...newDraggedMails);
      if (event.container.id == 'bcc') {
        newDraggedMails.forEach(email => {
          if (!this.isEmailAllowed(email)) {
            this.blackListedChips['bcc'].add(email);
            this.checkAndUpdateBlackListStatus('bcc');
          }
        });
      }
    }
    //after adding draggedEmail to target container, clearing the selected chips
    if (this.selectedChips[event.container.id]?.length > 0){
      this.selectedChips[event.container.id] = [];
    }
    this.checkEmailIDOutsideOrganizationOrNot()
  }


  droppedItem(event: CdkDragDrop<string[]>) {
    if (this.selectedChips[event.previousContainer.id]?.length) {
      this.draggedEmail = [...this.selectedChips[event.previousContainer.id]];
    }
    else {
      this.draggedEmail = [event.item.data];
    }

    if (event.previousContainer.id === event.container.id) {
      // Same container, no need to process
      return;
    }

    // Remove email from the source list
    if (event.previousContainer.id === 'groupto') {
      this.groupToEmails = this.groupToEmails.filter((email) => !this.draggedEmail.includes(email));
      this.draggedEmail.forEach(email => {
        this.blackListedGrpChips['groupto'].delete(email);
      });
      this.checkAndUpdateBlackListStatus('groupto');
    } else if (event.previousContainer.id === 'groupcc') {
      this.groupCCEmails = this.groupCCEmails.filter((email) => !this.draggedEmail.includes(email));
      this.draggedEmail.forEach(email => {
        this.blackListedGrpChips['groupcc'].delete(email);
      });
      this.checkAndUpdateBlackListStatus('groupcc');
    } else if (event.previousContainer.id === 'groupbcc') {
      this.groupBCCEmails = this.groupBCCEmails.filter((email) => !this.draggedEmail.includes(email));
      this.draggedEmail.forEach(email => {
        this.blackListedChips['groupbcc'].delete(email);
      });
      this.checkAndUpdateBlackListStatus('groupbcc');
    }

    // Add email to the target list
    if (
      event.container.id === 'groupto' &&
      this.draggedEmail.some(email => !this.groupToEmails.includes(email))
    ) {
      let newDraggedMails = this.draggedEmail.filter(email => !this.groupToEmails.includes(email));
      this.groupToEmails.push(...newDraggedMails);
      if (event.container.id == 'groupto') {
        newDraggedMails.forEach(email => {
          if (!this.isEmailAllowed(email)) {
            this.blackListedGrpChips['groupto'].add(email);
            this.checkAndUpdateBlackListStatus('groupto');
            }});
      }
    } else if (
      event.container.id === 'groupcc' &&
      this.draggedEmail.some(email => !this.groupCCEmails.includes(email))
    ) {
      let newDraggedMails = this.draggedEmail.filter(email => !this.groupCCEmails.includes(email));
      this.groupCCEmails.push(...newDraggedMails);
      if (event.container.id == 'groupcc') {
        newDraggedMails.forEach(email => {
          if (!this.isEmailAllowed(email)) {
            this.blackListedGrpChips['groupcc'].add(email);
            this.checkAndUpdateBlackListStatus('groupcc');
          }
        });
      }
    } else if (
      event.container.id === 'groupbcc' &&
      this.draggedEmail.some(email => !this.groupBCCEmails.includes(email))
    ) {
      let newDraggedMails = this.draggedEmail.filter(email => !this.groupBCCEmails.includes(email));
      this.groupBCCEmails.push(...newDraggedMails);
      if (event.container.id == 'groupbcc') {
        newDraggedMails.forEach(email => {
          if (!this.isEmailAllowed(email)) {
            this.blackListedGrpChips['groupbcc'].add(email);
            this.checkAndUpdateBlackListStatus('groupbcc');
          }
        });
      }
    }
    //after adding draggedEmail to target container, clearing the selected chips
    if (this.selectedChips[event.container.id]?.length > 0){
      this.selectedChips[event.container.id] = [];
    }
  }

  emailPopUpView(isForward:boolean = false){
    const data = {
      reply: {
        value: this.ticketReplyDTO?.replyOptions?.find(item => item?.id == this.replyForm.value?.replyType),
        options: this.ticketReplyDTO.replyOptions,
      },
      handle: {
        value: this.replyForm.value?.replyHandler,
        options: this.ticketReplyDTO.handleNames,
      },
      emails: {
        to: {
          value: [...this.emailToEmail],
        },
        cc: {
          value: [...this.emailCCEmails],
        },
        bcc: {
          value: [...this.emailBCCEmails],
        },
        suggestion: [],
        groupSuggestion: [],
        replyText:this.emailReplyText,
        showPrevoiusMail: this.showPrevoiusMail,
        emailSignatureParams: this.emailSignatureParams,
        subject: this.sendEmailSubject,
        isSameThred: (this.emailForward && !this.newThreadEmail)
      },
      replyCheckbox: this.replyLinkCheckbox,
      baseMention:this.baseMentionObj,
      postDetailTab: this.postDetailTab,
      selectedMedia:this.selectedMedia,
      isSmartSuggestionEnabled: (this.showAiFeature && this.rephraseOptions?.isAISuggestion && this.loadAiFeature && !this.showAICreditExpired),
      isRephresEnabled: (this.showAiFeature && this.loadAiFeature && this.isRephraseToolbar && !this.showAICreditExpired),
      showLockStrip: this.showLockStrip,
      userPostView: this.userPostView,
      autoRenderAi: this.autoRenderAi,
      onlySendMail: this.onlySendMail,
      onlyEscalation: this.onlyEscalation,
      isSendFeedBackClosedCheckedDisabledFlag: this.isSendFeedBackClosedCheckedDisabledFlag,
      isSendFeedBackClosedCheckedFlag: this.isSendFeedBackClosedCheckedFlag,
      feedbackFormValue: this.feedbackFormValue,
      sendFeedBack: this.sendFeedBack,
      ticketHistoryData: this.ticketHistoryData,
      isForward: isForward,
      tempAllGroupEmailList: this.tempAllGroupEmailList,
      pageType:this.pageType
    }

    for (const email of this.emailGroupList) {
      if ('email_to' in email && email?.email_to?.trim()?.length > 0) {
        data.emails.suggestion = [...data.emails.suggestion, ...email?.email_to?.split(',')]
      }
      if ('email_cc' in email && email?.email_cc?.trim()?.length > 0) {
        data.emails.suggestion = [...data.emails.suggestion, ...email?.email_cc?.split(',')]
      }
      if ('email_bcc' in email && email?.email_bcc?.trim()?.length > 0){
        data.emails.suggestion = [...data.emails.suggestion, ...email?.email_bcc?.split(',')]
      }
      data.emails.groupSuggestion.push(email);
    }
    if(data?.emails?.suggestion){
      data.emails.suggestion = [...new Set(data?.emails?.suggestion)];
    }
    this.replyService.selectedMedia.next({ media: [] });
    this._ticketService.emailPopUpViewObs.next({ status: true, isOpen: true, data: data })
  }

  refreslList(isRefresh:boolean){
    this.callEscalationListAPI({
      Brand: this._postDetailService?.postObj.brandInfo,
    }, isRefresh);
    this.cdr.detectChanges();
  }

  refreshAssignList() {
    this._postAssignToService.getAssignedUsersList(this.currentUser, this._postDetailService.postObj.makerCheckerMetadata.workflowStatus, false, true);
    this.cdr.detectChanges();
  }

  getAuthorTicketMandatoryDetails() {
    let obj = {
      brandID: this.baseMentionObj?.brandInfo?.brandID,
      ticketId: this.baseMentionObj?.ticketID
    };
    this.getAuthorTicketMandatoryDetailsApi = this._userDetailService.GetAuthorTicketMandatoryDetails(obj).subscribe((res) => {
      if (res.success) {
        this.authorDetails = res;
        this.mapTicketCustomFieldColumns(this.authorDetails);
      }
    })
  }

  mapTicketCustomFieldColumns(author?: any, isOnlyEscalation?: boolean) {
    let isValid = true;
    this.missingFieldsClosure = [];
    this.missingFieldsEscalation = [];
    const checkReplyType = isOnlyEscalation ? 0 : +this.replyForm.get('replyType').value;
  
    if (author !== undefined && author?.data) {
      const customArray = checkReplyType === 3 ? author?.data?.mandatoryFieldClosure : checkReplyType === 5 ? author?.data?.mandatoryFieldEscalation : author?.data?.mandatoryFieldEscalation;
      for (let i = 0; i < customArray?.length; i++) {
        if (customArray) {
          if (checkReplyType === 3 && author?.data?.isMandatoryForClosure && author?.data?.mandatoryFieldClosure &&
            author?.data?.mandatoryFieldClosure?.length > 0){
            const isExist = author?.data?.mandatoryFieldClosure[i];
            if (isExist && isExist?.length > 0) {
              this.missingFieldsClosure?.push(isExist);
            }
          } else if (checkReplyType === 5 && author?.data?.isMandatoryForEscalation && author?.data?.mandatoryFieldEscalation &&
            author?.data?.mandatoryFieldEscalation?.length > 0) {
            const isExist = author?.data?.mandatoryFieldEscalation[i];
            if (isExist && isExist?.length > 0) {
              this.missingFieldsEscalation?.push(isExist);
            }
          } else if (author?.data?.isMandatoryForEscalation && author?.data?.mandatoryFieldEscalation &&
            author?.data?.mandatoryFieldEscalation?.length > 0) {
            const isExist = author?.data?.mandatoryFieldEscalation[i];
            if (isExist && isExist?.length > 0) {
              this.missingFieldsEscalation?.push(isExist);
            }
          }
        }
      }
      // if (this.missingFieldsClosure?.length > 0) 
      //   {
      //   let userInfoToggle = null;
      //   let userObj = null;
      //   const currentUserObj = localStorage.getItem('user');
      //   if (currentUserObj) {
      //     userObj = JSON.parse(currentUserObj);
      //     userInfoToggle = JSON.parse(localStorage.getItem(`userInfoToggle_${userObj?.data?.user?.userId}`));
      //   }
      //   let title = 'Action cannot be completed';
      //   let message = `The following mandatory fields must be filled before you can proceed:<br> <ul>
      //   ${author?.data?.mandatoryFieldClosure?.map(field => `<li>\u25CF ${field}</li>`)?.join('')}</ul><br>
      //   Please complete these fields and try again.`;
      //   const dialogData = new AlertDialogModel(title, message, 'Go to Ticket Details', 'Cancel');
      //   const dialogRef = this.dialog.open(AlertPopupComponent, {
      //     disableClose: true,
      //     autoFocus: false,
      //     data: dialogData,
      //   });
      //   this.actionProcessing = false;
      //   this.disableSaveButton = false;
      //   this.cdr.detectChanges();
      //   isValid = false;
      //   dialogRef.afterClosed().subscribe((res) => {
      //     if (res && (this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
      //       this.postActionTypeEvent.emit({
      //         actionType: PostActionEnum.openTicketDetail,
      //       });
      //       if ((this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
      //         if (userInfoToggle === false) {
      //           userInfoToggle = true;
      //           localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
      //         } else {
      //           localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
      //         }
      //       }
      //     }
      //   })
      // } 
      // else if (this.missingFieldsEscalation?.length > 0) {
      //   let userInfoToggle = null;
      //   let userObj = null;
      //   const currentUserObj = localStorage.getItem('user');
      //   if (currentUserObj) {
      //     userObj = JSON.parse(currentUserObj);
      //     userInfoToggle = JSON.parse(localStorage.getItem(`userInfoToggle_${userObj?.data?.user?.userId}`));
      //   }
      //   let title = 'Action cannot be completed';
      //   let message = `The following mandatory fields must be filled before you can proceed:<br> <ul>
      //   ${author?.data?.mandatoryFieldEscalation?.map(field => `<li>\u25CF ${field}</li>`)?.join('')}</ul><br>
      //   Please complete these fields and try again.`;
      //   const dialogData = new AlertDialogModel(title, message, 'Go to Ticket Details', 'Cancel');
      //   const dialogRef = this.dialog.open(AlertPopupComponent, {
      //     disableClose: true,
      //     autoFocus: false,
      //     data: dialogData,
      //   });
      //   this.actionProcessing = false;
      //   this.disableSaveButton = false;
      //   this.cdr.detectChanges();
      //   isValid = false;
      //   dialogRef.afterClosed().subscribe((res) => {
      //     if (res && (this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
      //       this.postActionTypeEvent.emit({
      //         actionType: PostActionEnum.openTicketDetail,
      //       });
      //       if ((this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
      //         if (userInfoToggle === false) {
      //           userInfoToggle = true;
      //           localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
      //         } else {
      //           localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
      //         }
      //       }
      //     } 
      //   })
      // } else {
      //   this.actionProcessing = false;
      //   this.disableSaveButton = false;
      //   this.cdr.detectChanges();
      //   isValid = true;
      // }
    }
    // this.cdr.detectChanges();
    // return isValid;
    }


  showAlert(){
    let isValid = true;
    if (this.missingFieldsClosure?.length > 0) {
      let userInfoToggle = null;
      let userObj = null;
      const currentUserObj = localStorage.getItem('user');
      if (currentUserObj) {
        userObj = JSON.parse(currentUserObj);
        userInfoToggle = JSON.parse(localStorage.getItem(`userInfoToggle_${userObj?.data?.user?.userId}`));
      }
      let title = this.translate.instant('Action-cannot-be-completed');
      let message = `${this.translate.instant('Following-mandatory-fields')}:<br> <ul>
      ${this.authorDetails?.data?.mandatoryFieldClosure?.map(field => `<li>\u25CF ${field}</li>`)?.join('')}</ul><br>
      ${this.translate.instant('Complete-these-fields')}`;
      const dialogData = new AlertDialogModel(title, message, this.translate.instant('Go-to-Ticket-Details'), this.translate.instant('Cancel'));
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
      isValid = false;
      dialogRef.afterClosed().subscribe((res) => {
        if (res && (this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
          this.postActionTypeEvent.emit({
            actionType: PostActionEnum.openTicketDetail,
          });
          if ((this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
            if (userInfoToggle === false) {
              userInfoToggle = true;
              localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
            } else {
              localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
            }
          }
        }
      })
    } else if (this.missingFieldsEscalation?.length > 0) {
      let userInfoToggle = null;
      let userObj = null;
      const currentUserObj = localStorage.getItem('user');
      if (currentUserObj) {
        userObj = JSON.parse(currentUserObj);
        userInfoToggle = JSON.parse(localStorage.getItem(`userInfoToggle_${userObj?.data?.user?.userId}`));
      }
      let title = this.translate.instant('Action-cannot-be-completed');
      let message = `${this.translate.instant('Following-mandatory-fields')}:<br> <ul>
      ${this.authorDetails?.data?.mandatoryFieldEscalation?.map(field => `<li>\u25CF ${field}</li>`)?.join('')}</ul><br>
      ${this.translate.instant('Complete-field-try-again')}`;
      const dialogData = new AlertDialogModel(title, message, this.translate.instant('Go-to-Ticket-Details'), this.translate.instant('Cancel'));
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
      isValid = false;
      dialogRef.afterClosed().subscribe((res) => {
        if (res && (this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
          this.postActionTypeEvent.emit({
            actionType: PostActionEnum.openTicketDetail,
          });
          if ((this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions)) {
            if (userInfoToggle === false) {
              userInfoToggle = true;
              localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
            } else {
              localStorage.setItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`, JSON.stringify(userInfoToggle));
            }
          }
        }
      })
    } else {
      this.actionProcessing = false;
      this.disableSaveButton = false;
      this.cdr.detectChanges();
      isValid = true;
    }
  }
 
  clearVariables(){
    this.loadEmojiSheet = null;
    this.filteredEmojis = null;
    this.trigger = null;
    this.clipboardArea = null;
    this.animateThis = null;
    this.textAreas = null;
    this.textAreaDiv = null;
    this.inputElement = null;
    this.emailFieldsCc = null;
    this.autoComplete = null;
    this.emailFieldsBcc = null;
    this.emailgroupInputField = null;
    this.postReplyScroll = null;
    this.promptMenuTrigger = null;
    this.authorDetails = null;
  }
  clearTimeout(){
    if (this.dispatchEventTimeout) {
      clearTimeout(this.dispatchEventTimeout);
    }
    if (this.nativeElementTimeout) {
      clearTimeout(this.nativeElementTimeout);
    }
    if (this.postDetailServiceTimeout) {
      clearTimeout(this.postDetailServiceTimeout);
    }
    if (this.mediaUrlTimeout) {
      clearTimeout(this.mediaUrlTimeout);
    }
    if (this.mediaPathTimeout) {
      clearTimeout(this.mediaPathTimeout);
    }
    if (this.textTimeout) {
      clearTimeout(this.textTimeout);
    }
    if (this.textAreaTimeout) {
      clearTimeout(this.textAreaTimeout);
    }
    if (this.replyTimeout) {
      clearTimeout(this.replyTimeout);
    }
    if (this.baseTimeout) {
      clearTimeout(this.baseTimeout);
    }
    if (this.mediaSelectedTimeout) {
      clearTimeout(this.mediaSelectedTimeout);
    }
    if (this.emailSignTimeout) {
      clearTimeout(this.emailSignTimeout);
    }
    if (this.autoTimeout) {
      clearTimeout(this.autoTimeout);
    }
    if (this.ParamsTimeout) {
      clearTimeout(this.ParamsTimeout);
    }
    if (this.inputTimeout) {
      clearTimeout(this.inputTimeout);
    }
    if (this.input2Timeout) {
      clearTimeout(this.input2Timeout);
    }
    if (this.ElementTimeout) {
      clearTimeout(this.ElementTimeout);
    }
  }

  destroyApiCalls(){
    if (this.GetNPSAutomationSettingApi) {
      this.GetNPSAutomationSettingApi.unsubscribe();
    }
    if (this.getFoulKeywordsApi) {
      this.getFoulKeywordsApi.unsubscribe();
    }
    if (this.getIrctcTagDetailsApi) {
      this.getIrctcTagDetailsApi.unsubscribe();
    }
    if (this.getDispositionDetailsApi) {
      this.getDispositionDetailsApi.unsubscribe();
    }
    if (this.IsPremiumTwitterAccountApi) {
      this.IsPremiumTwitterAccountApi.unsubscribe();
    }
    if (this.getEmailHtmlDataApi) {
      this.getEmailHtmlDataApi.unsubscribe();
    }
    if (this.getLastMentionTimeApi) {
      this.getLastMentionTimeApi.unsubscribe();
    }
    if (this.GetBrandMentionReadSettingApi) {
      this.GetBrandMentionReadSettingApi.unsubscribe();
    }
    if (this.GetCrmCsdUserIdApi) {
      this.GetCrmCsdUserIdApi.unsubscribe();
    }
    if (this.GetTagAlerEmailsApi) {
      this.GetTagAlerEmailsApi.unsubscribe();
    }
    if (this.getTicketHtmlForEmailApi) {
      this.getTicketHtmlForEmailApi.unsubscribe();
    }
    if (this.replyAutoSuggestApi) {
      this.replyAutoSuggestApi.unsubscribe();
    }
    if (this.GetCrmCsdUserId2Api) {
      this.GetCrmCsdUserId2Api.unsubscribe();
    }
    if (this.GetBrandAccountInformationApi) {
      this.GetBrandAccountInformationApi.unsubscribe();
    }
    if (this.GetBrandAccountInformation2Api) {
      this.GetBrandAccountInformation2Api.unsubscribe();
    }
    if (this.GetUsersWithTicketCountApi) {
      this.GetUsersWithTicketCountApi.unsubscribe();
    }
    if (this.GetMailGroupApi) {
      this.GetMailGroupApi.unsubscribe();
    }
    if (this.getAutoQueueingConfigApi) {
      this.getAutoQueueingConfigApi.unsubscribe();
    }
    if (this.GetMakerCheckerDataApi) {
      this.GetMakerCheckerDataApi.unsubscribe();
    }
    if (this.GetCrmCsdUserId3Api) {
      this.GetCrmCsdUserId3Api.unsubscribe();
    }
    if (this.logForFoulKeywordApi) {
      this.logForFoulKeywordApi.unsubscribe();
    }
    if (this.Reply1Api) {
      this.Reply1Api.unsubscribe();
    }
    if (this.lockUnlockTicketApi) {
      this.lockUnlockTicketApi.unsubscribe();
    }
    if (this.getMMTLinkApi) {
      this.getMMTLinkApi.unsubscribe();
    }
    if (this.getAutoCannedResponseStatusApi) {
      this.getAutoCannedResponseStatusApi.unsubscribe();
    }
    if (this.logAutoMatedCannedReplyApi) {
      this.logAutoMatedCannedReplyApi.unsubscribe();
    }
    if (this.checkAutoclosureEligibilityApi) {
      this.checkAutoclosureEligibilityApi.unsubscribe();
    }
    if (this.forwardReplyApi) {
      this.forwardReplyApi.unsubscribe();
    }
    if (this.Reply2Api) {
      this.Reply2Api.unsubscribe();
    }
    if (this.loadingUsersApi) {
      this.loadingUsersApi.unsubscribe();
    }
    if (this.BulkTicketActionApi) {
      this.BulkTicketActionApi.unsubscribe();
    }
    if (this.getMentionCountApi) {
      this.getMentionCountApi.unsubscribe();
    }
    if (this.BulkTicketAction2Api) {
      this.BulkTicketAction2Api.unsubscribe();
    }
    if (this.GetEmailOutgoingSettingApi) {
      this.GetEmailOutgoingSettingApi.unsubscribe();
    }
    if (this.UploadUserProfilePicOnS3Api) {
      this.UploadUserProfilePicOnS3Api.unsubscribe();
    }
    if (this.GetSignatureSymbolListApi) {
      this.GetSignatureSymbolListApi.unsubscribe();
    }
    if (this.getAISmartSuggestionsApi) {
      this.getAISmartSuggestionsApi.unsubscribe();
    }
    if (this.translateReplyApi) {
      this.translateReplyApi.unsubscribe();
    }
    if (this.rephraseDataApi) {
      this.rephraseDataApi.unsubscribe();
    }
    if (this.GetTaggingAccountsApi) {
      this.GetTaggingAccountsApi.unsubscribe();
    }
    if (this.GetMentionSettingsApi) {
      this.GetMentionSettingsApi.unsubscribe();
    }
    if (this.trackAIResponseApi) {
      this.trackAIResponseApi.unsubscribe();
    }
    if (this.getCRMTicketStatusApi) {
      this.getCRMTicketStatusApi.unsubscribe();
    }
    this.inputSplitObs.complete();
    if (this.getAuthorTicketMandatoryDetailsApi) {
      this.getAuthorTicketMandatoryDetailsApi.unsubscribe();
    }
    if(this.caseNoSubscription) {
      this.caseNoSubscription.unsubscribe();
    }
  }

  getAllInternalEmailIDs():void
  {
    if (this.emailGroupList && this.emailGroupList.length) {
      const allGroupEmailList = [];
      this.emailGroupList.map(res => {

        const email_to = res.email_to.split(',');
        if (email_to && email_to.length) {
          email_to.forEach((obj) => {
            if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply') && !allGroupEmailList.includes(obj)) {
              allGroupEmailList.push(obj);
            }
          });
        }

        const email_cc = res.email_cc.split(',');
        if (email_cc && email_cc.length) {
          email_cc.forEach((obj) => {
            if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply') && !allGroupEmailList.includes(obj)) {
              allGroupEmailList.push(obj);
            }
          });
        }

        const bccEmail = res.email_bcc.split(',');
        if (bccEmail && bccEmail.length) {
          bccEmail.forEach((obj) => {
            if (!obj.includes('noreply') && !obj.includes('no-reply') && !obj.includes('no.reply') && !allGroupEmailList.includes(obj)) {
              allGroupEmailList.push(obj);
            }
          });
        }
      });
    }
  }

  checkEmailIDOutsideOrganizationOrNot(): void {
    this.outsideEmailFlag = false;

    const allOrgEmails = this.tempAllGroupEmailList || [];
    const toEmails = this.emailToEmail || [];
    const ccEmails = this.emailCCEmails || [];
    const bccEmails = this.emailBCCEmails || [];

    const allEmails = [...toEmails, ...ccEmails, ...bccEmails];

    const outsideSet = [];
    this.outsideEmails = []
    allEmails.forEach(email => {
      if (email && !allOrgEmails.includes(email)) {
        outsideSet.push(email);
      }
    });

    if (outsideSet?.length > 0) {
      outsideSet.forEach(email => {
        if (!this.outsideEmails.includes(email)) {
          this.outsideEmails.push(email);
        }
      });
      this.remainingEmailTooltip = outsideSet.splice(1, outsideSet.length-1).join(', ');
      this.outsideEmailFlag = true;
      this.cdr.detectChanges();
    }
  }

  openBottomSheet(): void {
    this._bottomSheet.open(PostReplyPopupComponent, {
      panelClass: 'reply-popup',
      hasBackdrop: false
    });

  }

  createAttachmentMediaPillView():void{
    this.selectedAttachmentList =[]
    const selectedMedia =[]
    this.selectedMedia?. forEach((item) => {
      const obj = {
        mediaType: item?.mediaType,
        mediaUrl: item?.mediaPath,
        fileName: item?.displayFileName || "Unname",
        iconUrl: (item?.mediaType == MediaEnum.IMAGE) ? 'assets/icons/JPEG.svg' : (item?.mediaType == MediaEnum.VIDEO) ? 'assets/icons/video-icon.svg' : (item?.mediaType == MediaEnum.PDF) ? 'assets/icons/PDF.svg' : (item?.mediaType == MediaEnum.EXCEL) ? 'assets/icons/Xls.svg' : item?.mediaType == MediaEnum.DOC ? 'assets/icons/DOC.svg' : item?.mediaPath.includes('doc') ? 'assets/icons/DOC.svg' : item?.mediaPath.includes('docx') ? 'assets/icons/DOCX.svg' : item?.mediaPath.includes('ppt') ? 'assets/icons/PPT.svg' : item?.mediaPath.includes('pptx') ? 'assets/icons/PPTX.svg' : item?.mediaPath.includes('xls') ? 'assets/icons/Xls.svg' : item?.mediaPath.includes('xlsx') ? 'assets/icons/Xlsx.svg' : item?.mediaPath.includes('pdf') ? 'assets/icons/PDF.svg' : 'assets/icons/Other.svg',
        mediaID: item?.mediaID,
      }
      selectedMedia.push(obj);
    }
  )
    this.selectedAttachmentList = selectedMedia;
    this.maximumAttachmentLength = this.selectedAttachmentList.length;
    this.cdr.detectChanges();
  }


    previewFile(item):void{
      const attachments = [item]
            if (attachments.length > 0) {
                  this.dialog.open(VideoDialogComponent, {
                    panelClass: 'overlay_bgColor',
                    data: attachments,
                    autoFocus: false,
                  });
                }
    }

  checkEmailAttachmentWidth(): void {
    const containerWidth = this.attachmentContainer.nativeElement.offsetWidth;
    let totalWidth = 0;
    this.attachmentRef.forEach((ref, index) => {
      const width = ref.nativeElement.offsetWidth + 15;
      totalWidth += width;
      if (totalWidth > containerWidth) {
        this.showMoreAttachment = true;
      } else {
        this.maximumAttachmentLength = index + 1;
      }
    });
    this.remainingAttachmentCount = this.selectedAttachmentList.length - this.maximumAttachmentLength;
    this.cdkRef.detectChanges();
  }

  isSystemGeneratedEmail(email) {
    if (!email || typeof email !== 'string') return false;

    const [localPart, domainPart] = email.toLowerCase().split('@');
    if (!localPart || !domainPart) return false;

    // 1. Common system-generated local part prefixes
    const systemPrefixes = [
      'noreply', 'no-reply', 'no.reply', 'donotreply',
      'do-not-reply', 'mailer-daemon', 'system', 'bounce',
      'notification', 'daemon'
    ];

    // 2. System or transactional domains
    const systemDomains = [
      'mail.gmail.com',
      'prod.outlook.com',
      'amazonses.com',
      'mandrillapp.com',
      'facebookmail.com',
      'sendgrid.net',
      'notifications.google.com',
      'outbound-mail.sendinblue.com',
      'bounce.mailgun.org'
    ];

    // 3. If local part starts with known system prefix
    if (systemPrefixes.some(prefix => localPart?.toLowerCase()?.startsWith(prefix))) {
      return true;
    }

    // 4. If local part is very long (≥ 25) and unreadable (no vowels)
    const hasFewVowels = (localPart?.toLowerCase()?.match(/[aeiou]/g) || []).length <= 2;
    if (localPart.length >= 25 && hasFewVowels) {
      return true;
    }

    // 5. If domain matches any known system/transactional domain
    if (systemDomains.some(systemDomain => domainPart?.toLowerCase()?.includes(systemDomain))) {
      return true;
    }

    return false;
  }

  isEmailAllowed(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    const emailLower = email.toLowerCase();
    return this.whiteList.some(entry => {
      return entry.includes('@')
        ? entry.toLowerCase() === emailLower
        : entry.toLowerCase() === domain; 
    });    
  }

  checkAndUpdateBlackListStatus(type: string) {
    if(type == 'to' || type == 'cc' || type == 'bcc') {
    this.blackListDisabled = Object.values(this.blackListedChips).some(set => set.size > 0);
    }
    else if (type == 'groupto' || type == 'groupcc' || type == 'groupbcc') {
      this.groupBlackListDisabled = Object.values(this.blackListedGrpChips).some(set => set.size > 0);
    }
  }

  generateClosingTicketTag(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let obj = {
        brand_name: this.baseMentionObj?.brandInfo?.brandName,
        brand_id: this.baseMentionObj?.brandInfo?.brandID,
        author_id: this.baseMentionObj?.author.socialId,
        author_name: this.baseMentionObj?.author?.name ? this.baseMentionObj?.author?.name : '',
        channel_group_id: this.baseMentionObj?.channelGroup,
        ticket_id: this.baseMentionObj?.ticketID,
        channel_type: this.baseMentionObj?.channelType,
        tag_id: this.baseMentionObj?.tagID,
        reply_message: this._ticketService.replyInputTextData ? this._ticketService.replyInputTextData : ''
      }
      const brandDetail = this._filterService.fetchedBrandData?.find(
        (brand: BrandList) => +brand.brandID === this.baseMentionObj?.brandInfo?.brandID
      );
      this.ticketData = true;
      if (this.disableSaveButton) {
        this.actionProcessing = true;
      }
      this._ticketService.generateClosingTicketTag(obj).subscribe((result) => {
        this.actionProcessing = false;
        if (result.success) {
          this.ticketData = false;
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
          this.isSarcastic = this.genAiData.result.is_sarcastic;
          this.issueResolved = this.genAiData.result.issue_resolution_status;
          this.agentCommitment = this.genAiData.result.agent_commitment;
          this.inappropriateClosure = this.genAiData.result.inappropriate_closure;
          this.hasChurnIntent = this.genAiData.result.churn_intent;
          this.hasUpsellOpportunity = this.genAiData.result.upsell_opportunity;
          this.agentEmpathyScore = this.genAiData.result.agent_empathy_score;
          this.updatedSatisfactionRating = this.genAiData.result.updated_satisfaction_rating !== null ? this.genAiData.result.updated_satisfaction_rating : 0;
          this.isSuggested = this.genAiData.result.is_suggested;
          this.suggestedReply = this.genAiData.result.suggested_reply;
          this.foulWords = this.genAiData.result?.foul_words?.length ? this.genAiData.result.foul_words : [];
          this.aiTicketIntelligenceModelData = {
            IsAIIntelligenceEnabled: brandDetail?.aiTagEnabled ? true : false,
            brandId: this.baseMentionObj?.brandInfo?.brandID,
            ticketID: this.baseMentionObj?.ticketID,
            brandName: this.baseMentionObj?.brandInfo?.brandName,
            authorChannelGroupID: this.baseMentionObj?.channelGroup,
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
            IsSarcastic: this.isSarcastic,
            IssueResolved: this.issueResolved,
            AgentCommitted: this.agentCommitment,
            InappropriateClosure: this.inappropriateClosure,
            HasChurnIntent: this.hasChurnIntent,
            HasUpsellOpportunity: this.hasUpsellOpportunity,
            AgentEmpathyScore: this.agentEmpathyScore,
            UpdatedSatisfactionRating: this.updatedSatisfactionRating,
            IsSuggested: this.isSuggested,
            SuggestedReply: this.suggestedReply,
            FoulWords: this.foulWords,
            isAgentiQueEnabled: brandDetail?.isAgentIQEnabled ? true : false
          }
          resolve(this.isSuggested);
          this.cdr.detectChanges();
        } else {
          resolve(false);
          this.ticketData = false;
          this.genAiData = [];
        }
      }, (err) => {
        resolve(false);
        this.actionProcessing = false;
        this.ticketData = false;
      });
    })    
  }

  generateAgentIQ(): Promise<boolean> {
    const checkReplyType = +this.replyForm.get('replyType').value;
    const actionType = checkReplyType == 3 ? AgentIQAction.ReplyClose : checkReplyType == 5 ? AgentIQAction.ReplyEscalate : checkReplyType == 13 ? AgentIQAction.ReplyOnHold : checkReplyType == 14 ? AgentIQAction.ReplyAwaiting : AgentIQAction.ReplyAssign;
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.baseMentionObj.brandInfo.brandID
    );
    return new Promise((resolve, reject) => {
      let obj = {
        action_type: actionType,
        closingTicketTag: {
          brand_name: this.baseMentionObj?.brandInfo?.brandName,
          brand_id: this.baseMentionObj?.brandInfo?.brandID,
          author_id: this.baseMentionObj?.author.socialId,
          author_name: this.baseMentionObj?.author?.name ? this.baseMentionObj?.author?.name : '',
          channel_group_id: this.baseMentionObj?.channelGroup,
          ticket_id: this.baseMentionObj?.ticketID,
          channel_type: this.baseMentionObj?.channelType,
          tag_id: this.baseMentionObj?.tagID,
          reply_message: this._ticketService.replyInputTextData ? this._ticketService.replyInputTextData : '',
          action_type: actionType,
          brand_content_policy: brandInfo?.brand_Content_policy?.length ? brandInfo?.brand_Content_policy : '',
          brand_response_guidelines: brandInfo?.brand_Response_guidlines?.length ? brandInfo?.brand_Response_guidlines : ''
        }
      }
      this.ticketData = true;
      if (this.disableSaveButton) {
        this.actionProcessing = true;
      }
      this._ticketService.generateAgentIQ(obj).subscribe((result) => {
        this.actionProcessing = false;
        if (result.success) {
          this.isIqFalse = false;
          this.ticketData = false;
          this.genAiData = result.data;
          this.isSuggested = this.genAiData?.result.is_suggested;
          this.PopTypeReasons = this.genAiData?.popTypeReasons;
          resolve(this.isSuggested);
          this._ticketService.generateClosingTicket.next(this.genAiData);
          this.cdr.detectChanges();
        } else {
          this.isIqFalse = true;
          resolve(false);
          this._ticketService.generateClosingTicket.next(false);
          this.ticketData = false;
          this.genAiData = [];
          this.cdr.detectChanges();
        }
      }, (err) => {
        this.isIqFalse = true;
        resolve(false);
        this._ticketService.generateClosingTicket.next(false);
        this.actionProcessing = false;
        this.ticketData = false;
        this.cdr.detectChanges();
      });
    })    
  }

  GetSFDCCaseNo():void
  {
    if (!this.caseNoSubscription)
    {
    const obj = {
      "SRID": this.baseMentionObj?.ticketInfo?.srid,
      "BrandID": this.baseMentionObj?.brandInfo?.brandID
    }

  this.caseNoSubscription = this._ticketService.GetSFDCCaseNo(obj).subscribe((result) => {
      if (result.success) {
        this.srCreatedMessage = `Thank you for reaching out to us. We wanted to let you know that we have received your request and we have created a support ticket for you. Your service request number is ${this.baseMentionObj?.ticketInfo?.srid} and case number is ${result?.data}.`;
        if (this.baseMentionObj?.channelGroup == ChannelGroup.Email) {
          this.emailReplyText = this.srCreatedMessage
        } else {
          this.textAreaCount[0].text = this.srCreatedMessage;
        }
      this.cdkRef.detectChanges();
      } else {
       
      }
    });
  }
  }

  getMentionWiseText(mention: any, replyText: string): string {
    let replaceReplyText: any[] = (this.bulkMentionText[`${this.baseMentionObj?.tagID}`])?.split('-bulksplit-');
    let mentionReplyTexts: any[] = (this.bulkMentionText[`${mention?.tagID}`])?.split('-bulksplit-');
    if (replaceReplyText && mentionReplyTexts){
      for (const [index, mentionRText] of (mentionReplyTexts || [])?.entries()) {
        if (this.baseMentionObj?.tagID != mention?.tagID && mentionRText?.trim()?.length > 0) {
          replyText = replyText?.replace(replaceReplyText[index], mentionRText);
        }
      }
    }
    return replyText;
  }

  suggestionInsert() {
    const isEmail = this.baseMentionObj.channelGroup == ChannelGroup.Email ? true : false;
    if (isEmail) {
      this.emailReplyText = this.dispositionDetails?.suggestedReply
    } else {
      this.textAreaCount = [];
      let textareaObj = new TextAreaCount();
      textareaObj.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      this.textAreaCount.push(textareaObj);
    }
    this.replaceInputFromSuggestionData();
  }

  replaceInputFromSuggestionData() {
    const inputevent = {
      target: {
        value: this.dispositionDetails?.suggestedReply
      }
    }
    this.textAreaCount = [];
    let textareaObj = new TextAreaCount();
    textareaObj.maxPostCharacters = this.twitterAccountPremium ? this.premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
    if (this.baseMentionObj.channelGroup == ChannelGroup.Twitter &&
      (this.baseMentionObj.channelType === ChannelType.PublicTweets ||
        this.baseMentionObj.channelType === ChannelType.Twitterbrandmention)) {
      let text = this.baseMentionObj.channelGroup == ChannelGroup.Twitter ? 'remove' : 'dontremove';
      const limit = this.twitterAccountPremium ? this.
        premiumTwitterCharacter : this.nonPremiumTwitterCharecter;
      if (this.dispositionDetails?.suggestedReply?.length <= limit) {
        textareaObj.showPost = true;
        textareaObj.postCharacters = limit - this.dispositionDetails?.suggestedReply.length;
      }
      textareaObj.text = this.dispositionDetails?.suggestedReply;
      this.textAreaCount.push(textareaObj);
      this.ReplyInputChangesModified(inputevent, 0, text);
    } else {
      textareaObj.text = this.dispositionDetails?.suggestedReply;
      this.textAreaCount.push(textareaObj);
    }
    const strUserSignature =
      this.emailSignatureParams?.userSignatureSymbol + ' ' + this.emailSignatureParams?.userSignature;
    if (this.baseMentionObj.channelGroup !== ChannelGroup.TikTok) {
      if (this.emailSignatureParams?.isAppendNewLineForSignature) {
        this.dispositionDetails.suggestedReply = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ? this.dispositionDetails?.suggestedReply + ' ' + strUserSignature.trim() : this.dispositionDetails?.suggestedReply;
      } else {
        this.dispositionDetails.suggestedReply = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ? this.dispositionDetails?.suggestedReply + ' ' + strUserSignature.trim() : this.dispositionDetails?.suggestedReply;
      }
      // if (this.textAreaCount?.length) {
      //   this.textAreaCount[this.textAreaCount?.length - 1].text = this.dispositionDetails?.suggestedReply;
      // }
    }
    if (this.baseMentionObj.channelGroup === ChannelGroup.TikTok && this.textAreaCount[this.textAreaCount?.length - 1]?.text?.length > 150) {
      if (this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature && !this.emailSignatureParams?.isAppendNewLineForSignature) {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.dispositionDetails?.suggestedReply?.substring(0, 149 - strUserSignature?.length) + ' ' + strUserSignature
      } else if (this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature && this.emailSignatureParams?.isAppendNewLineForSignature) {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.dispositionDetails?.suggestedReply?.substring(0, 149 - strUserSignature?.length) + '\n' + strUserSignature
      } else {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.dispositionDetails?.suggestedReply?.substring(0, 150);
      }
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            'Tiktok does not allow more than 150 characters while replying.',
        },
      });
    } else if (this.baseMentionObj.channelGroup === ChannelGroup.TikTok) {
      if (this.emailSignatureParams?.isAppendNewLineForSignature) {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ? this.dispositionDetails?.suggestedReply + '\n' + strUserSignature.trim() : this.dispositionDetails?.suggestedReply;
      } else {
        this.textAreaCount[this.textAreaCount?.length - 1].text = this.emailSignatureParams?.userSignatureSymbol && this.emailSignatureParams?.userSignature ? this.dispositionDetails?.suggestedReply + ' ' + strUserSignature.trim() : this.dispositionDetails?.suggestedReply;
      }
    }
    this.cdr.detectChanges();
  }

  onCloseDiscardAIResponse(): void{
    this.rephraseLoader = false; 
    this.aiSuggestionLoader = false;
    const replyObj: PerformActionParameters = {};
    const replyArray: Reply[] = [];
    const baseReply = new BaseReply();
    const customReplyObj = baseReply.getReplyClass();
    let replyinputtext = this.textAreaCount[0].text;
    if (this.isEmailChannel && this.emailReplyText.trim()) {
      let emailText = this.emailReplyText.trim();
      if (this.showPrevoiusMail) {
        emailText = emailText.concat(this.storedReceivedText);
      }
      replyinputtext = emailText;
    }
    if (!this.onlyEscalation && this.baseMentionObj.channelGroup == ChannelGroup.Email) {
      const result = this.replyLinkCheckbox.find(
        (res) => res.name == 'Add previous mail trail'
      );
      if (result && result.checked && !replyinputtext.trim()) {
        replyinputtext = this.storedReceivedText;
      }
    }
    // map the properties
    replyObj.ActionTaken = ActionTaken.Locobuzz;
    if (this.textAreaCount.length > 0 && !this.isEmailChannel) {
      for (const tweet of this.textAreaCount) {
        const customReply = baseReply.getReplyClass();
        // customReply.replyText = tweet?.text
        if (this.baseMentionObj?.channelGroup == ChannelGroup.TikTok) {
          customReply.replyText = tweet?.text?.substring(0, 150);
        } else {
          customReply.replyText = tweet?.text;
        }
        replyArray.push(customReply);
      }
      this._ticketService.replyInputTextData = replyArray?.map(item => item?.replyText).join('');
    } else {
      customReplyObj.replyText = replyinputtext
      replyArray.push(customReplyObj);
      this._ticketService.replyInputTextData = this.emailReplyText;
    }

    
    const source = this._mapLocobuzzEntity.mapMention(
      this._postDetailService?.postObj
    );
    if (this.simulationCheck) {
      source.ticketInfoSsre.ssreMode = SSREMode.Simulation;
      source.ticketInfoSsre.ssreIntent = this.SsreIntent;
    }
    replyObj.Source = source;

    /* tagged user Json */
    replyArray[0].excludedReplyUserIds = ''
    if (this.ticketReplyDTO.taggedUsers && this.ticketReplyDTO.taggedUsers.length > 0) {
      const arrayuser = [];
      for (const obj of this.ticketReplyDTO.taggedUsers) {
        arrayuser.push({
          Userid: obj.Userid,
          Name: obj.Name,
          UserType: obj.UserType,
          offset: 0,
          length: 10,
        });
      }
      replyArray[0].taggedUsersJson = JSON.stringify(arrayuser);
      if (this.unSelectedTagUsers?.length > 0) {
        /* extra check that user avaibale on taggedUsers */
        const temp_excludedReplyUserIds = this.unSelectedTagUsers.filter((item) => {
          return arrayuser.some((user) => user?.Userid == item?.Userid)
        })
        /* extra check that user avaibale on taggedUsers */
        replyArray[0].excludedReplyUserIds = [...temp_excludedReplyUserIds.map((obj) => obj?.Userid)]?.join(',')?.replace(/,\s*$/, '')
      }
    }
    // if (this.selectedSurveyForm) {
    //   replyArray[0].surveyFormURL = this.selectedSurveyForm.formURL;
    //   replyArray[0].sendSurvey = true;
    // }
    // autoclosureeligibility
    replyArray[0].eligibleForAutoclosure = this.isEligibleForAutoclosure;
    // replyArray = this._mapLocobuzzEntity.mapReplyObject(replyArray);
    const replyopt = new ReplyOptions();
    replyObj.PerformedActionText = '';
    replyObj.IsReplyModified = this.IsReplyModified;
    replyObj.Replies = replyArray;
    const selectedHandle = this.ticketReplyDTO.handleNames.find(
      (obj) => obj.socialId === this.replyForm.get('replyHandler').value
    );
    if (!this.onlyEscalation) {
      if (!this.isEmailChannel && selectedHandle) {
        replyObj.ReplyFromAccountId = selectedHandle.accountId;
        replyObj.ReplyFromAuthorSocialId = selectedHandle.socialId;
      }
      if (this.isEmailChannel) {
        replyObj.ReplyFromAccountId = +this.baseMentionObj.settingID;
        replyObj.Replies[0].toEmails =
          this.emailToEmail.length > 0 ? this.emailToEmail : [];
        replyObj.Replies[0].ccEmails =
          this.emailCCEmails.length > 0 ? this.emailCCEmails : [];
        replyObj.Replies[0].bccEmails =
          this.emailBCCEmails.length > 0 ? this.emailBCCEmails : [];
      }
      const personalDetailsRequiredFlag = this.replyLinkCheckbox?.some(
        (res) =>
          res?.replyLinkId == Replylinks.PersonalDetailsRequired &&
          res?.checked
      );
      if (personalDetailsRequiredFlag != null) {
        replyObj.isSafeForm = personalDetailsRequiredFlag;
      }
    }
    let rephraseTextWithoutSignature = this.responseGenieReply;
    let ResponseGenieStatusObj = {
      Note: JSON.stringify({ Text: rephraseTextWithoutSignature, Caution: this.CautionFlagForLogs }),
      TicketID: 0,
      TagID: String(this.baseMentionObj.tagID),
      AssignedToUserID: 0,
      AssignedToTeam: 0,
      Channel: null,
      Status: 134,
      type: "CommunicationLog",
      NotesAttachment: null
    }
    replyObj.Tasks = [ResponseGenieStatusObj];
    if (this.responseGenieReply && this.responseGenieReply.trim().length > 0) {
      this.replyService.Reply(replyObj, true).subscribe();
    }
  }
  removeReplyHandleFromCcOrBcc(){
    if(this.baseMentionObj.channelGroup == ChannelGroup.Email){
      const replyHandle = this.ticketReplyDTO.handleNames;
      if(replyHandle && replyHandle.length == 1){
        this.emailCCEmails = this.emailCCEmails.filter(email => email !== replyHandle[0]?.handleId);
        this.emailBCCEmails = this.emailBCCEmails.filter(email => email !== replyHandle[0]?.handleId);
      }
    }
  }

}

