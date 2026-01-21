import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  EffectRef,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  signal,
  untracked,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locobuzzAnimations } from '@locobuzz/animations';
import { Language } from 'app/app-data/post';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelImage } from 'app/core/enums/ChannelImgEnum';
import { ChannelType } from 'app/core/enums/ChannelType';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { MentionActions } from 'app/core/enums/MentionActions';
import { notificationType } from 'app/core/enums/notificationType';
import { PostActionEnum } from 'app/core/enums/postActionEnum';
import { PostDisplayTypeEnum } from 'app/core/enums/PostDisplayTypeEnum';
import { Sentiment } from 'app/core/enums/Sentiment';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { BaseSocialAccountConfiguration } from 'app/core/models/accountconfigurations/BaseSocialAccountConfiguration';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import {
  LikeSocialHandle,
  RetweetSocialHandle,
  SocialHandle,
} from 'app/core/models/dbmodel/TicketReplyDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { StreamState } from 'app/core/models/viewmodel/ChatWindowDetails';
import { PostsType, postView } from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { ReplyInputParams } from 'app/core/models/viewmodel/ReplyInputParams';
import { TranslateData } from 'app/core/models/viewmodel/TranslateData';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { ChatbotAudioService } from 'app/shared/services/chatbot-audio.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { PostOverviewComponent } from 'app/social-schedule/component/post-overview/post-overview.component';
import moment from 'moment';
// import { NgxLinkifyOptions } from 'ngx-linkifyjs';
import { NgxLinkifyOptions } from 'ngx-linkifyjs-v2';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink/dist/subsink';
import { CannedResponseComponent } from '../../canned-response/canned-response.component';
import { CategoryFilterComponent } from '../../category-filter/category-filter.component';
import { ParentPostComponent } from '../../parent-post/parent-post.component';
import { QuoteTweetComponent } from '../../quote-tweet/quote-tweet.component';
import { VideoDialogComponent } from '../../video-dialog/video-dialog.component';
import { FilterService } from './../../../services/filter.service';
import { PostDetailService } from './../../../services/post-detail.service';
import { ReplyService } from './../../../services/reply.service';
import { TicketsService } from './../../../services/tickets.service';
import { MediaContent } from 'app/core/models/viewmodel/MediaContent';
import { LinkStatusEnum } from 'app/core/enums/LinkStatusEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { TimerService } from 'app/social-inbox/services/timer.service';
import { noteAttachmentList } from 'app/core/models/viewmodel/CommunicationLog';
import { NavigationService } from 'app/core/services/navigation.service';
import { WorkflowLogStatus } from 'app/core/enums/SsreLogStatusEnum';
import { element } from 'protractor';
import { ElementTypeEnum } from 'app/core/enums/DynamicFormTypeEnum';
import { HttpClient } from '@angular/common/http';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { SSRELogStatus } from 'app/core/enums/SSRELogStatus';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';

export interface scanUrl {
  url?: string;
  status?: LinkStatusEnum;
  notes?: string;
}
@Component({
    selector: 'app-post-body',
    templateUrl: './post-body.component.html',
    styleUrls: ['./post-body.component.scss'],
    // animations: locobuzzAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PostBodyComponent
  implements OnInit, OnDestroy, AfterViewChecked, AfterViewInit
{
  @Input() post: TicketClient;
  @Input() postData: BaseMention;
  @Input() ticketHistoryData: AllBrandsTicketsDTO;
  @Input() pageType: PostsType;
  @Input() openDetailOnClick = false;
  @Input() parentPostFlag: boolean = false;
  @Output() postActionTypeEvent = new EventEmitter<any>();
  @Input() postReplyBlock = false;
  @Input() postDetailTab: LocobuzzTab;
  @Input() showParentPostHeader: boolean = false;
  @Input() hideActionableButton: boolean = false;
  @Input() showActionPerform: boolean = true;
  @Input() postView: postView = postView.detailView;
  @Input() openReply: boolean = false;
  @Input() searchedText: string = '';
  @ViewChild('clickhandleMenuTrigger') clickTicketMenuTrigger: MatMenuTrigger;
  @ViewChild('clickLikehandleMenuTrigger') clickLikeMenuTrigger: MatMenuTrigger;
  @ViewChild('txtArea') inputElement: ElementRef;
  @ViewChild('iframeStyle') iframeStyle: ElementRef;
  @ViewChild('emailSpanWidth') widthSpanElement: ElementRef;
  @ViewChild('attachmentContainer') attachmentContainer: ElementRef
  @ViewChildren('attachmentRef') attachmentRef: ElementRef[];
  @ViewChild('attachmentContainer') attachmentNoteContainer: ElementRef
  @ViewChildren('attachmentNoteRef') attachmentNoteRef: ElementRef[];

  // translation
  MediaEnum = MediaEnum;
  showTranslated = false;
  translatedText = '';
  translateFrom: string;
  translateTo: string = 'Unknown';
  translateToFrom: string = 'Unknown';
  isTranslateError = false;
  translatedData: TranslateData;
  languages = Language;
  Object = Object;
  objBrandSocialAcount: BaseSocialAccountConfiguration[];
  handleNames?: SocialHandle[] = [];
  retweetedHandles?: SocialHandle[] = [];
  handleNamesObs = new Subject<SocialHandle[]>();
  handleNamesObs$ = this.handleNamesObs.asObservable();
  likeRetweetHandleList?: SocialHandle[] = [];
  unLikeUndoRetweetHandleList?: SocialHandle[] = [];
  mentionAction: number;
  mentionActionFlag: boolean;
  selectedHandle?: SocialHandle = {};
  channelGroupEnum = ChannelGroup;
  channelTypeEnum = ChannelType;
  getMentionAction = MentionActions;
  postActionEnum = PostActionEnum;
  postDisplayTypeEnum = PostDisplayTypeEnum;
  getSentiment = Sentiment;
  PostsType = PostsType;
  voipDate: any;
  voipTime: any;
  playerVars = {
    cc_lang_pref: 'en',
  };
  id = 'KWWFMW-sAUY';
  

  linkifyOptions: NgxLinkifyOptions = {
    attributes: null,
    className: 'linkified',
    defaultProtocol: 'http',
    events: {
      mouseover: (e) => alert('Link hovered!'),
    },
    tagName: 'a',
    target: {
      url: '_blank',
    },
    validate: true,
  };
  private player;
  replyInputParams: ReplyInputParams = {};
  makercheckerrejectnote = '';
  subs = new SubSink();
  ticketDetailsPopup = false;
  likeCount: any;
  retweetCount: any;
  iconPlayAudio = true;
  iconPauseAudio = false;
  state: StreamState;
  audioID;
  submitButtonName: string;
  postViewEnum = postView;
  authorName: string;
  note: string;
  medialist = []
  fileList = []
  noteMediaCount = {
    pdfCount: 0,
    xlsCount:0,
    mediaCount:0,
    docCount: 0,
    csvCount:0,
    showDownload: false,
  }
  readMore: boolean = false;
  descriptionCount: number = 0;
  showMoreLessCount: number = 0;
  EmailShowMoreLessCount: number = 600;
  minimalViewBody = false;
  scannedLinks:{url:string,status:number}[] = []
  scanContentUrlList: scanUrl[]=[];
  noLinkFound: boolean;
  emailImageOpenCount: number=0;
  moreNote=true;
  ivrData=''
  ivrBrandData:any
  replyCount: number=0;

  selectedTicketView:any = 1;
  attachmentLength: number;
  attchmentFlag:boolean=false;
  showEngagementFormula:boolean=true
  timeToShow: string;
  currentUser:AuthUser;
  showReachImpression: boolean=true;
  clickhouseEnabled: boolean=false;
  retweetFlag: boolean=false;
  hideReplyFlag: boolean = false;
  hideLikeFlag:boolean=false;
  hideRetweetFlag:boolean=false;
  hideVideoFlag: boolean=false;
  selectedSortBy: string = 'DateCreated';
  hideStatsCount: boolean;
  pollsDetails: any;
  endIndex: number=3;
  surveyData:any;
  singleLineAttribute = [];
  multiLineAttribute = [];
  public fieldTypeEnum = ElementTypeEnum;
  public ratings = [{ value: 5, isSelecteded: false }, { value: 4, isSelected: false }, { value: 3, isSelected: false }, { value: 2, isSelected: false }, { value: 1, isSelected: false }];
  public npsRating = [{ value: 0, isSelecteded: false },{ value: 1, isSelecteded: false }, { value: 2, isSelected: false }, { value: 3, isSelected: false }, { value: 4, isSelected: false }, { value: 5, isSelected: false }, { value: 6, isSelected: false }, { value: 7, isSelected: false }, { value: 8, isSelected: false }, { value: 9, isSelected: false }, { value: 10, isSelected: false }]
  public starRatings = [{ value: 1, isSelected: false }, { value: 2, isSelected: false }, { value: 3, isSelected: false }, { value: 4, isSelected: false }, { value: 5, isSelected: false }];
  surveyImages = [];
  responsiveOptions = [
  {
    breakpoint: '1199px',
    numVisible: 1,
    numScroll: 1
  },
  {
    breakpoint: '991px',
    numVisible: 2,
    numScroll: 1
  },
  {
    breakpoint: '767px',
    numVisible: 1,
    numScroll: 1
  }
];
  attachmentList: any[] = []
  mediaEnum = MediaEnum
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  private clickHandler: (event: Event) => void;
  private timeoutId: any; // Store timeout ID
  private refGetEmailHtmlData;
  private refGetFacebookMediaUrl;
  private refUpdateReachAndImpressionById;
  private refRetweetUnRetweetMention;
  private refReplyApproved;
  private refGetBrandAccountInformation;
  private refGetBrandAccountInformation1;
  private refTwitterReTweetStatus;
  private refTwitterTweetLikeStatus;
  private refLikeDislikeMention;
  private refRetweetUnRetweetMention1;
  effectUpdateTicketAssignmentListSignal:EffectRef;
  effectUnMaskedDataSignal: EffectRef;
  effectNoteAddedMediaChangeSignal: EffectRef
  effectEmailFriendlyViewObsSignal: EffectRef
  effectSelectedCannedResponseSignal: EffectRef;
  private clearSignal = signal<boolean>(true);
  maximumAttachmentLength: number;
  showMoreAttachment:boolean = false
  remainingCount:number
  remainingNotesCount:number
  notesAttachmentList:any=[]
  mentionTime: string;
  showMetricColor: boolean = false;
  showMoreNoteAttachment: boolean = false
  maximumAttachmentNoteLength: number;
  reactions: any;
  pantipContent: any;
  defaultLayout: boolean = false;
  showreplyDaysCounter = false;
  workflowProgressMessage: string = '';
  constructor(
    private _dialog: MatDialog,
    private _ticketService: TicketsService,
    private _audioService: ChatbotAudioService,
    private _postDetailService: PostDetailService,
    private _replyService: ReplyService,
    private _sidebarService: SidebarService,
    private _snackBar: MatSnackBar,
    private _filterService: FilterService,
    private _mapLocobuzzService: MaplocobuzzentitiesService,
    private _footericonservice: FootericonsService,
    private dialog: MatDialog,
    private _sidebar: SidebarService,
    private cdkRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private timerService:TimerService,
    private _footericonService: FootericonsService,
    private navigationService: NavigationService,
    private commonService: CommonService,
    private http: HttpClient,
    private translate: TranslateService,
    private ticketSignalRService: TicketsignalrService
  ) {
    this.currentUser = JSON.parse(localStorage.getItem('user'))
    this.audioID = '';
    this.translateToFrom = 'en';
    this.ivrBrandData = this._filterService.voipBrandIVRData;
    this.selectedTicketView = localStorage.getItem('selctedView') ? parseInt(JSON.parse(localStorage.getItem('selctedView'))) : 1;
    let onLoadUpdateTicket = true;
    this.effectUpdateTicketAssignmentListSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.updateTicketAssignmentListSignal() : untracked(() => this._ticketService.updateTicketAssignmentListSignal());
      if (!onLoadUpdateTicket && value && this.clearSignal()) {
        this.updateTicketAssignmentListSignalChange(value);
      } else {
        onLoadUpdateTicket = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadUnMaskedData = true;
    this.effectUnMaskedDataSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.unMaskedDataSignal() : untracked(() => this._ticketService.unMaskedDataSignal());
      if (!onLoadUnMaskedData && value && this.clearSignal()) {
        this.unMaskedDataSignal(value);
      } else {
        onLoadUnMaskedData = false;
      }
    }, { allowSignalWrites: true });

    let onLoadNoteAddedMedia = true;
    this.effectNoteAddedMediaChangeSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.noteAddedMediaChangeSignal() : untracked(() => this._ticketService.noteAddedMediaChangeSignal());
      if (!onLoadNoteAddedMedia && value && this.clearSignal()) {
        this.noteAddedMediaChangeSignalChange(value);
      } else {
        onLoadNoteAddedMedia = false;
      }
    }, { allowSignalWrites: true });

    let onLoadEmailFriendly = true;
    this.effectEmailFriendlyViewObsSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.emailFriendlyViewObsSignal() : untracked(() => this._ticketService.emailFriendlyViewObsSignal());
      if (!onLoadEmailFriendly && value && this.clearSignal()) {
        this.emailFriendlyViewObsSignalChanges(value);
      } else {
        onLoadEmailFriendly = false;
      }
    }, { allowSignalWrites: true });

    let onLoadSelectedCannedResponse = true;
    this.effectSelectedCannedResponseSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.selectedCannedResponseSignal() : untracked(() => this._replyService.selectedCannedResponseSignal());
      if (!onLoadSelectedCannedResponse && value && this.clearSignal()) {
        this.selectedCannedResponseSignalChanges(value)
      } else {
        onLoadSelectedCannedResponse = false;
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this.cdkRef.detectChanges();
        }
      })
    )
    if (
      this.postData?.channelGroup === ChannelGroup.WhatsApp ||
      this.postData?.channelGroup === ChannelGroup.GoogleBusinessMessages ||
      this.postData?.channelType === ChannelType.FBMessages ||
      this.postData?.channelType === ChannelType.InstagramMessages
    ) {
      this.showReplyMessageExpiry();
    }

    if(this.postData && this.postData?.channelGroup == ChannelGroup.Twitter && this.postData?.instagramPostType == 3) {
      this.postData.emailContent = this.postData?.emailContentHtml ? JSON.parse(this.postData.emailContentHtml) : null;
    }
    if (this.postData && this.postData?.channelGroup == ChannelGroup.Telegram && this.postData?.emailContentHtml) {
      this.postData.emailContent = this.postData?.emailContentHtml ? JSON.parse(this.postData.emailContentHtml) : null;
    }
    if (this.postData && this.postData?.channelGroup == ChannelGroup.Survey && this.postData?.emailContentHtml) {
      this.surveyData = this.postData.emailContentHtml ? JSON.parse(this.postData.emailContentHtml) : this.postData.emailContentHtml;
      this.fieldsMapping();
    }
    if (this.ticketHistoryData?.description && this.ticketHistoryData?.description.includes('<I ')){
      this.ticketHistoryData.description = this.ticketHistoryData?.description.replace('<I ','&lt;I ');
    }
    if (this.ticketHistoryData?.description && this.ticketHistoryData?.description.includes('@')) {
      this.ticketHistoryData.description = this.transform(this.ticketHistoryData?.description);
    }
    
    if (this.postData?.channelGroup == ChannelGroup.Voice && this.postData?.mentionTime){
      // // console.log(this.ticketHistoryData.description)
      // this.ivrData=''
      // if (this.ticketHistoryData?.description?.indexOf('IVR') > -1) {
      //   // ticketHistoryData.showVoipDesc = false;
      //   // ticketHistoryData.voipNote = mention.description.split(',', 1)[1]
      //   let ivrNum=''
      //   if(this.ticketHistoryData?.description?.indexOf(",")>0){
      //     this.ivrData = this.ticketHistoryData?.description?.substring(this.ticketHistoryData.description?.indexOf("IVR"), this.ticketHistoryData.description?.indexOf(","))
      //   }else{
      //     this.ivrData = this.ticketHistoryData?.description?.substring(this.ticketHistoryData.description?.indexOf("IVR"))
      //   }
      //   if (this.ivrBrandData && this.ivrData){
      //     ivrNum = this.ivrData.substring(this.ivrData?.indexOf(":") + 1).trim()
      //     const brandIVRJson= this.ivrBrandData?.find(x => x.brandID == this.postData?.brandInfo?.brandID)
      //     let brandIVRDesc = brandIVRJson?.description;
      //     // if(ivrNum){
      //       if (brandIVRDesc && ivrNum){
      //         brandIVRDesc = brandIVRDesc[ivrNum]
      //         this.ivrData = brandIVRDesc ? this.ivrData.replace(ivrNum,` ${brandIVRDesc}`) : ''
      //         this.ivrData = this.ivrData ? this.ivrData.replace("IVR", "Selected IVR option").trim() : '';
      //       }else{
      //         this.ivrData=''
      //       }
      //   }
      // }
      // const index = this.ticketHistoryData?.description?.indexOf('on');
      // if(index >=0){
      //   if (this.ticketHistoryData?.description?.includes('disconnected')){
      //     const onIndex = this.ticketHistoryData?.description?.indexOf(' on ')
      //     this.ticketHistoryData.description = this.ticketHistoryData?.description?.substring(0, onIndex + 4)
      //   }else{
      //     this.ticketHistoryData.description = this.ticketHistoryData?.description?.substring(0, index + 2)
      //   }
      // }
      // this.voipDate = moment.utc(this.postData.mentionTime).local().format('ll')
      // this.voipTime = moment.utc(this.postData.mentionTime).local().format('h:mm a')

    }else{
      this.voipDate = ''
      this.voipTime = ''
    }
    if (this.postData && this.postData?.channelGroup == ChannelGroup.Pantip && this.postData?.emailContentHtml) {
      if (this.postData?.title && this.postData?.emailContentHtml && this.postData?.channelType == ChannelType.PantipTopics) {
        this.pantipContent = `${this.postData?.title}<br><br>${this.postData?.emailContentHtml}`;
      } else if (this.postData?.emailContentHtml) {
        this.pantipContent = this.postData?.emailContentHtml
      }
    }
    // console.log(this.post);
    this.authorName = this.postData?.author?.name
      ? this.postData?.author?.name
      : 'Anonymous';
    const valueCannedResponseSignal = this._replyService.selectedCannedResponseSignal();
    if (valueCannedResponseSignal) {
      this.selectedCannedResponseSignalChanges(valueCannedResponseSignal)
    }
    // this.subs.add(
    //   this._replyService.selectedCannedResponse.subscribe((obj) => {
    //     if (obj?.text && obj.text.trim() !== '') {
    //       const notetype = this._postDetailService.notetype;
    //       if (notetype === 3) {
    //         this.noteTextChange(undefined, 'makercheckerrejectnote', true, this.makercheckerrejectnote + obj?.text) 
    //       }
    //       this.cdkRef.detectChanges();
    //     }
    //   })
    // );
    this.subscribetoEvents();
    if (this.postData?.channelType === this.channelTypeEnum.Email) {
      this.getEmailHtmlData(this.ticketHistoryData, this.postData);
    }

    this.subs.add(
      this._ticketService.checkAndStopYoutubeVideos
        .pipe(filter((res) => this.postDetailTab?.guid === res?.guid))
        .subscribe((data) => {
          if (data) {
            if (this.postDetailTab) {
              if (data.guid == this.postDetailTab.guid)
                if (this.ticketHistoryData.youtubeSanitizeUrlObject) {
                  this.stopVideo();
                }
            }
          }
        })
    );
    if (
      this.ticketHistoryData &&
      this.ticketHistoryData.communicationLogProperty &&
      this.postData?.channelGroup!=ChannelGroup.Quora
    ) {
      if (
        this.ticketHistoryData.communicationLogProperty.likeStatus &&
        this.ticketHistoryData.communicationLogProperty.likeCount === '0'
      ) {
        this.postData.mentionMetadata.likeCount = 1;
        this.ticketHistoryData.communicationLogProperty.likeCount = '1';
        this.likeCount =
          this.ticketHistoryData.communicationLogProperty.likeCount;
      } else if (this.postData?.channelGroup == ChannelGroup.TikTok)
      {
        this.likeCount =
          this.ticketHistoryData.communicationLogProperty.likeCount;
        this.ticketHistoryData.communicationLogProperty.likeCount = String(this.likeCount);
      } else {
        this.likeCount = this.postData.mentionMetadata.likeCount
      }
    } else {
      if (
        this.postData?.likeStatus &&
        this.postData?.mentionMetadata.likeCount === 0
      ) {
        this.postData.mentionMetadata.likeCount = 1;
        this.likeCount = String(this.postData.mentionMetadata.likeCount);
      } else if (this.postData?.mentionMetadata) {
          this.likeCount? this.postData.mentionMetadata.likeCount = +this.likeCount:'';
        this.likeCount = this.postData.mentionMetadata.likeCount
          ? String(this.postData.mentionMetadata.likeCount)
          : '0';
      }
    }
    this.retweetCount = String(this.postData?.mentionMetadata?.shareCount);
    if (
      this.postData?.isShared &&
      this.postData?.mentionMetadata.shareCount == 0
    ) {
      this.retweetCount = 1;
    }

    if (this.retweetCount < 0) {
      this.retweetCount = 0;
    }

    this.subs.add(
      this._ticketService.setLikeDislikeMentionObs.subscribe((res) => {
        if (res) {
          if (
            res.tagID == this.postData?.tagID &&
            res.ticketID == this.postData?.ticketID
          ) {
            this.likeCount = String(res.mentionMetadata.likeCount);
            if (this.likeCount == -1) {
              this.likeCount = 0;
            }
            this._ticketService.setLikeDislikeMentionObs.next(null);
          }
        }
      })
    );

    this.subs.add(
      this._ticketService.setRetweetMentionObs.subscribe((res) => {
        if (res) {
          if (
            res.tagID == this.postData?.tagID &&
            res.ticketID == this.postData?.ticketID
          ) {
            this.retweetCount = String(res.mentionMetadata.shareCount);
            if (this.retweetCount == -1) {
              this.retweetCount = 0;
            }
            this.cdkRef.detectChanges();
            this._ticketService.setRetweetMentionObs.next(null);
          }
        }
      })
    );

    if (this.pageType == PostsType.TicketHistory && this.openReply) {
      this.note = this._ticketService.checkLogVersionAndNote(
        this.postData.ticketInfo.lastNote
      )
        ? this.postData.ticketInfo.lastNote
        : '';

        this.noteMedia();
    }
    if (
      this.pageType == PostsType.Tickets ||
      this.pageType == PostsType.Mentions
    ) {
      this.note = this._ticketService.checkLogVersionAndNote(
        this.postData.ticketInfo.lastNote
      )
        ? this.postData.ticketInfo.lastNote
        : '';
        this.noteMedia()
    }

    this.subs.add(
      this._audioService.getState().subscribe((state) => {
        this.state = state;
      })
    );
    // this.ticketHistoryData.description = this.ticketHistoryData.description?.includes("\\") ? JSON.parse(`"${this.ticketHistoryData.description}"`) : this.ticketHistoryData.description;
    this.descriptionCount = this.ticketHistoryData?.description
      ? this.ticketHistoryData?.description.length
      : 0;
    if (this.descriptionCount > 600) {
      this.showMoreLessCount = 600;
      this.readMore = true;
    } else {
      this.showMoreLessCount = this.ticketHistoryData?.description
        ? this.ticketHistoryData?.description.length
        : 0;
    }

    this.subs.add(
      this._ticketService.scanContentObs.pipe(filter((res) => res?.tagID ==this.postData?.tagID)).subscribe((res)=>{
        if(res)
        {
          this.scanContentUrlList = res?.List;
          if (this.scanContentUrlList.length==1)
          {
            this.noLinkFound = this.scanContentUrlList.some((obj) => obj.status == LinkStatusEnum.Nolink) ? true : false
          }
          this.cdkRef.detectChanges();
        }
      })
    )
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.postData?.brandInfo?.brandID
    );
    this.scanContentUrlList = this.postData?.phishingJson ? JSON.parse(this.postData?.phishingJson) : [];
    this.noLinkFound = this.scanContentUrlList.some((obj) => obj.status == LinkStatusEnum.Nolink) || !brandInfo?.isPhishingSiteEnabled?true:false;

    if (this.postData?.channelGroup === this.channelGroupEnum.Twitter &&
      this.postData.channelType !== this.channelTypeEnum.DirectMessages)
      {
      this.replyCount = (this.postData?.mentionMetadata?.commentCount) ? this.postData?.mentionMetadata?.commentCount:0
      }

      this.subs.add(
        this._sidebar.minimalViewSource.subscribe(res => {
          if (res == true || res == false) {
            this.minimalViewBody = res;
            this.cdkRef.detectChanges();
          }
        })
      )

      if(this.postData?.channelGroup != ChannelGroup.Email)
      {
    /* view change code */
    this.subs.add(
      this._sidebar.onTicketViewChange.subscribe(view => {
        if (view) {
          this.selectedTicketView = view;
          this.EmailShowMoreLessCount = 600;
          if(this.selectedTicketView==1)
          {
            this.attchmentFlag=true;
          }else{
            this.attchmentFlag = false;
          }
          this.cdkRef.detectChanges();
        }
      })
    )
  }else
  {
    this.selectedTicketView = 3;
    this.attchmentFlag = false;
        this.attachmentList = this._ticketService.mergeAllAttachmentAddedInEmail(this.ticketHistoryData, this.postData);

  }
    
    const value = this._ticketService.updateTicketAssignmentListSignal();
    if (value) {
      this.updateTicketAssignmentListSignalChange(value);
    }
    /* this.subs.add(
      this._ticketService.updateTicketAssignmentList.subscribe((data) => {
        if (data) {
          if (data.guid == this.postDetailTab?.guid) {
            if (data.tagID == this.postData.tagID) {
              if (data.note || data.NotesAttachment) {
                this.postData.ticketInfo.lastNote = data.note;
                this.postData.notesAttachmentMetadata.mediaContents = data.NotesAttachment
                if (
                  this.pageType == PostsType.Tickets ||
                  this.pageType == PostsType.Mentions
                ) {
                  this.note = this._ticketService.checkLogVersionAndNote(
                    this.postData.ticketInfo.lastNote
                  )
                    ? this.postData.ticketInfo.lastNote
                    : '';
                  this.noteMedia()
                }
              }
              this.cdkRef.detectChanges();
            }
          }
        }
      })
    ); */

    this.attachmentLength = this.postData?.attachmentMetadata?.mediaContents?.length || 0;
    if (this.selectedTicketView == 1) {
      this.attchmentFlag = true;
    }else{
      this.attchmentFlag = false;
    }

    // this.subs.add(
    //   this._ticketService.emailFriendlyViewObs.subscribe((res)=>{
    //     if (res?.tagID == this.postData?.tagID){
    //       this.selectedTicketView= res?.show ? 1 : 3;
    //       this.cdkRef.detectChanges();
    //     }
    //   })
    // )
    /* view change code */

    for (const doc of this.ticketHistoryData?.documentUrls || []) {
      if(doc) doc.fileName = doc?.fileName?.split("/").pop();
    }
   const AuthUser:AuthUser=JSON.parse(localStorage.getItem('user'))
    if (AuthUser?.data?.user?.isListening && !AuthUser?.data?.user?.isORM && AuthUser?.data?.user?.isClickhouseEnabled==1)
    {
      this.clickhouseEnabled=true
      // this.showEngagementFormula=false;
      this.cdkRef.detectChanges();
    }

    this.subs.add(
      this.timerService.timerSubscription.subscribe((res) => {
        if (res) {
          if (this.postData?.isBrandPost && this.ticketHistoryData?.showPendingMessageStatus && this.postData?.channelGroup==ChannelGroup.AppStoreReviews)
          {
              this.timeToShow = this._ticketService.calculateBrandReplyTime(this.postData);
              if(this.timeToShow='')
              {
                this.ticketHistoryData.showPendingMessageStatus =false;
              }
              this.cdkRef.detectChanges();
          }
        }
      })
    )
    this.timeToShow = this._ticketService.calculateBrandReplyTime(this.postData)

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled==1)
    {
      if (this.postData?.channelType == ChannelType.FBComments || this.postData?.channelType == ChannelType.YouTubeComments || this.postData?.channelType == ChannelType.InstagramComments )
      {
        this.showReachImpression = false
        this.cdkRef.detectChanges();
      }else{
        this.showReachImpression = true
      }
    }else{
      if(this.ticketHistoryData?.isDarkAdPost){
        this.showReachImpression = false
      }
      else{
      this.showReachImpression = true
      }
    }

    const noteAddedMedia = this._ticketService.noteAddedMediaChangeSignal();
    if (noteAddedMedia) {
      this.noteAddedMediaChangeSignalChange(noteAddedMedia);
    }
    /* this.subs.add(
      this._ticketService.noteAddedMediaChange.subscribe((data) =>{
        if(data){
          this.noteMedia(data);
          this._ticketService.noteAddedMediaChange.next(null);
        }
      })
    ) */

    if (this.clickhouseEnabled && this.postData?.channelGroup == ChannelGroup.Twitter && this.postData?.retweetedStatusID != '0' && this.postData.retweetedStatusID != null)
    {
      this.showEngagementFormula=false;
      this.hideReplyFlag=true
      this.hideLikeFlag=true
      this.hideRetweetFlag = true
      this.hideVideoFlag = true
    }
    if (this.navigationService?.currentSelectedTab && this.navigationService?.currentSelectedTab?.Filters && this.navigationService?.currentSelectedTab?.Filters?.orderBYColumn) {
      this.selectedSortBy = this.navigationService?.currentSelectedTab?.Filters?.orderBYColumn;
    }

    if (this.postData?.channelGroup === ChannelGroup.Email || this.postData?.channelGroup === ChannelGroup.TikTok || this.postData?.channelGroup === ChannelGroup.Quora || this.postData?.channelGroup === ChannelGroup.AppStoreReviews || this.postData?.channelGroup === ChannelGroup.Blogs || this.postData?.channelGroup === ChannelGroup.ComplaintWebsites || this.postData?.channelGroup === ChannelGroup.ECommerceWebsites || this.postData?.channelGroup === ChannelGroup.GooglePlayStore || this.postData?.channelGroup === ChannelGroup.TripAdvisor || this.postData?.channelGroup === ChannelGroup.GlassDoor || this.postData?.channelGroup === ChannelGroup.DiscussionForums)
    {
      this.hideStatsCount = true
    }else{
      this.hideStatsCount = false
    }
    this.subs.add(
      this._ticketService.customTabChange.subscribe((res) => {
        if (Object.keys(res).length > 0) {
          if (this.navigationService?.currentSelectedTab && this.navigationService?.currentSelectedTab?.Filters && this.navigationService?.currentSelectedTab?.Filters?.orderBYColumn) {
            this.selectedSortBy = this.navigationService?.currentSelectedTab?.Filters?.orderBYColumn;
          }
          this.cdkRef.detectChanges();
        }
      })
    )


    if (this.postData?.polldatajson)
      {
      this.pollsDetails = JSON.parse(this.postData.polldatajson);

      if (this.pollsDetails?.options)
        {
        this.pollsDetails.options = this.pollsDetails.options.map((obj) => {
          obj.vote_percent = obj.vote_percent ? Math.round(obj.vote_percent)+'%' : 0;
          return obj;
        });
        }
      }

    const unMaskedData = this._ticketService.unMaskedDataSignal();
    if (unMaskedData) {
      this.unMaskedDataSignal(unMaskedData);
    }

    /* this.subs.add(
      this._ticketService.unMaskedData.subscribe((result) => {
        if (result) {
          const pageType = this.parentPostFlag ? PostsType.parentPost : this.pageType;
          if (result.tagID == this.postData.tagID && result.pageType == pageType) {
            this.postData.description = result.data.description ? this.replaceNewlinesAndSpaces(result.data.description).replace(/\n/g, '') : this.postData.description;
            this.postData.title = result.data.title ? this.replaceNewlinesAndSpaces(result.data.title).replace(/\n/g, '') : this.postData.title;
            this.postData.caption = result.data.caption ? this.replaceNewlinesAndSpaces(result.data.caption).replace(/\n/g, '') : this.postData.caption;

            this.ticketHistoryData.description = result.data.description ? this.replaceNewlinesAndSpaces(result.data.description).replace(/\n/g, '') : this.ticketHistoryData.description;
            this.ticketHistoryData.title = result.data.title ? this.replaceNewlinesAndSpaces(result.data.title).replace(/\n/g, '') : this.ticketHistoryData.title;
            // this.ticketHistoryData.caption = result.data.caption ? this.replaceNewlinesAndSpaces(result.data.caption).replace(/\n/g, '') : this.ticketHistoryData.caption;
            this.cdkRef.detectChanges();
            // this._ticketService.unMaskedData.next(null);
            this._ticketService.unMaskedDataSignal.set(null);
          }
        }
      })
    ) */
    this.cdkRef.detectChanges();

    this.subs.add(
      this._ticketService.updateBulkMentionSeenUnseen.subscribe((res) => {
        if (res?.guid == this.postDetailTab?.guid) {
          if (res?.list.some((x) => x.Tagid == this.postData.tagID)) {
            this.cdkRef.detectChanges();
          }
        }
      }
      )
    )


    this.subs.add(
      this._ticketService.updateChildkMentionSeenUnseen.subscribe((res) => {
        if (!this.showParentPostHeader && this.pageType == PostsType.TicketHistory) {
          this.cdkRef.detectChanges();
        }
      })
    )

    this.subs.add(
      this._ticketService.updateChildBulkMentionSeenUnseen.subscribe((res) => {
        if (!this.showParentPostHeader && this.pageType == PostsType.TicketHistory) {
          if (res?.list.some((x) => x.Tagid == this.postData.tagID)) {
            this.cdkRef.detectChanges();
          }
        }
      })
    )

    this.subs.add(
      this._ticketService.updateMentionSeenUnseen.subscribe((res) => {
        if (res) {
          if (res?.tagId == this.postData.tagID) {
            this.cdkRef.detectChanges();
          }
        }
      }
      )
    )

    this.subs.add(
      this._ticketService.updateChildMentionInMentionList.subscribe((res) => {
        if (res?.tagID == this.postData.tagID) 
          this.cdkRef.detectChanges();
        })
    )

    this.subs.add(
      this._ticketService.updateMentionListSeenUnseen.subscribe((res) => {
        if (res?.tagID == this.postData.tagID) {
          this.cdkRef.detectChanges()
        }
      })
    )

    this.subs.add(
      this._ticketService.updateMentionListBasedOnParentSocialID.subscribe((res) => {
        if (res?.tagID == this.postData.socialIdForunseenCount) {
          this.cdkRef.detectChanges()
        }
      })
    )

    this.subs.add(
      this._ticketService.attachmentWidthCalculationObs.subscribe((res)=>{
        if(res)
        {
          if(this.postData?.channelGroup == ChannelGroup.Email)
          {
            this.maximumAttachmentLength = this.attachmentList.length;
            this.maximumAttachmentNoteLength = this.notesAttachmentList.length;
            this.cdkRef.detectChanges()
            setTimeout(() => {
              if (this.attachmentList?.length > 0)
              {
              this.checkEmailAttachmentWidth();
              }
              if (this.notesAttachmentList?.length > 0) {
                this.checkEmailAttachmentNoteWidth();
              }
            }, 300);
          }
        }
      })
    )

        this.mentionTime = moment.utc(this.postData.mentionTime).local().format('MMMM D, YYYY, h:mm a')
    
    if (this.postData?.reactionJson == null || this.postData?.reactionJson == 'null') {
      this.reactions = {
        like: 0,
        laugh: 0,
        love: 0,
        impress: 0,
        scary: 0,
        wow: 0
      }
    } else if (typeof(this.postData?.reactionJson) == 'string') {
      this.reactions = JSON.parse(this.postData?.reactionJson);
    }
    if (this.postData?.ticketInfoSsre.ssreStatus == SSRELogStatus.SSREInProcessing)
    {
      this.workflowProgressMessage ='Hang tight! We’re checking if this ticket qualifies for an automated workflow.'
      this.cdkRef.detectChanges();
    }
    if (this.postData?.ticketInfoSsre.ssreStatus == SSRELogStatus.IntentFoundStillInProgress) {
      this.workflowProgressMessage = 'Hang tight! Our workflow is handling this ticket. We\'ll update you soon.'
                this.cdkRef.detectChanges();
    }
    this.subs.add(
      this.ticketSignalRService.workflowSSREUpdateSignalRCall.subscribe((res) => {
        if (res?.TagID == this.postData?.tagID) {
          this.workflowProgressMessage = 'Hang tight! Our workflow is handling this ticket. We\'ll update you soon.'
          this.cdkRef.detectChanges();
        }
      })
  )
  }

  ngOnDestroy(): void {
    this.clearSignal.set(false);
    this.clickTicketMenuTrigger = null;
    this.clickLikeMenuTrigger = null;
    this.inputElement = null;
    this.iframeStyle = null;
    this.widthSpanElement = null;
    this.cdkRef.detectChanges();
    this.subs.unsubscribe();
    if (this.iframeStyle?.nativeElement?.contentWindow?.document?.body) {
      this.iframeStyle.nativeElement.removeEventListener(
        'click',
        this.clickHandler
      );
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.clearVariables();

  }

  emailFriendlyViewObsSignalChanges(res){
    if (res?.tagID == this.postData?.tagID) {
      this.selectedTicketView = res?.show ? 1 : 3;
      this.cdkRef.detectChanges();
    }
  }

  selectedCannedResponseSignalChanges(obj){
    if (obj?.text && obj.text.trim() !== '') {
      const notetype = this._postDetailService.notetype;
      if (notetype === 3) {
        this.noteTextChange(undefined, 'makercheckerrejectnote', true, this.makercheckerrejectnote + obj?.text)
      }
      this.cdkRef.detectChanges();
    }
  }

  transform(value: string): string {
    if (!value) return value;

    // Match @mentions preceded by start, whitespace, punctuation, end of HTML tag, or any non-word character
    const highlightedText = value.replace(/(^|[\s.,!?>]|[^\w])(@[\w_]+)/g, '$1<span class="hashtag_highlight">$2</span>');

    return highlightedText;
  }

  isEllipsisActive(e: HTMLElement): boolean {
    return e ? e.offsetWidth < e.scrollWidth : false;
  }

  likeDisLikePopup(handle?: SocialHandle) {
    const dialogData = new AlertDialogModel(
      !this.mentionActionFlag ? this.translate.instant('LIKE') : this.translate.instant('UNLIKE'),
      this.translate.instant('CONFIRM_LIKE_UNLIKE', {
      action: !this.mentionActionFlag ? this.translate.instant('LIKE') : this.translate.instant('UNLIKE'),
      }),
      !this.mentionActionFlag ? this.translate.instant('LIKE') : this.translate.instant('UNLIKE'),
      this.translate.instant('Cancel')
    );
    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.setLikeDislike();
      }
    });
  }

  public fieldsMapping(): void {
    console.log(this.surveyData,'surveyData');
    if (this.surveyData && this.surveyData.length) {
      this.surveyData.forEach(res => {
        if (res.showonMentionDescription){
          if (Number(res.fieldType) == this.fieldTypeEnum.rating || Number(res.fieldType) == this.fieldTypeEnum.textarea) {
            if (Number(res.fieldType) == this.fieldTypeEnum.rating){
              res.rating_type = res?.ratingType ? res.ratingType : 'emoji';
              if (res.rating_type == 'star'){
                this.starRatings.forEach((item, index) => {
                  if (item.value <= res.value) {
                    item.isSelected = true;
                  } else {
                    item.isSelected = false;
                  }
                });
              }
            }
            this.multiLineAttribute.push(res);
          }
          if (Number(res.fieldType) != this.fieldTypeEnum.rating && Number(res.fieldType) != this.fieldTypeEnum.textarea && res.labelname != 'images') {
            this.singleLineAttribute.push(res);
          }
          if(res.labelname == 'images'){
            this.surveyImages = res.mediaList && res.mediaList.length ? res.mediaList : [];
          }
        }
      });
    }
  }

  subscribetoEvents() {
    this.subs.add(
      this._replyService.setRetweetStatus.subscribe((obj) => {
        if (obj) {
          if (obj.tagID === this.postData.tagID) {
            this.ticketHistoryData.communicationLogProperty
              ? (this.ticketHistoryData.communicationLogProperty.retweetStatus =
                  true)
              : '';

            this.postData.mentionMetadata.shareCount =
              +this.postData.mentionMetadata.shareCount + 1;
            // this.ticketHistoryData.communicationLogProperty.shareCount =
            //   this._footericonservice.kFormatter(
            //     +this.postData.mentionMetadata.shareCount
            //   );
            this.retweetCount = this.postData.mentionMetadata.shareCount;
          }
        }
      })
    );
  }

  ngAfterViewChecked(): void {
    // if (this._elementRef.nativeElement.querySelector('.linkified')) {
    //   this._elementRef.nativeElement
    //     .querySelector('.linkified')
    //     .addEventListener('click', (event) => event.stopPropagation());
    // }
  }
  ngAfterViewInit(): void {
    this.subs.add(
      this._sidebarService?._iframeStyleChange.subscribe((res) => {
        if (res == true) {
          if (this.iframeStyle && this.iframeStyle?.nativeElement?.contentWindow?.document?.body?.style)
            this.iframeStyle.nativeElement.contentWindow.document.body.style.color =
              '#c3cbd7';
        } else {
          if (this.iframeStyle && this.iframeStyle?.nativeElement?.contentWindow?.document?.body?.style)
            this.iframeStyle.nativeElement.contentWindow.document.body.style.color =
              '';
        }
      })
    );
    if(this.postData?.channelGroup == ChannelGroup.Email && this.attachmentList?.length>0)
    {
      this.checkEmailAttachmentWidth();
    }
  }
  iframeViewLoaded(iframeRef) {
    if (this._sidebarService?.iframeStyleStatus) {
      if (this.iframeStyle && this.iframeStyle?.nativeElement?.contentWindow?.document?.body?.style)
        this.iframeStyle.nativeElement.contentWindow.document.body.style.color =
          '#c3cbd7';
      this.iframeStyle.nativeElement.contentWindow.document.body.style.backgroundColor =
        '#131e33';
      
      this.clickHandler = (event: Event) => event.preventDefault(); // Store reference
      this.iframeStyle.nativeElement.addEventListener(
        'click',
        this.clickHandler
      );
    }
    this.ngZone.runOutsideAngular((res)=>{
      this.timeoutId = setTimeout(() => {
        const imageTagList = this.iframeStyle?.nativeElement?.contentWindow?.document.getElementsByTagName('img');
        for (let item of imageTagList) {
          item.addEventListener('click',
            this.openImagePreview.bind(this))
        };
      }, 100);
    })
    this.adjustIframeHeight(iframeRef)
  }
  preventDetailedPopupFromOpening(evt): void {
    const href = evt.target.getAttribute('href');
    if (href) {
      evt.stopPropagation();
    }
  }

  stopVideo(): void {
    this.player ? this.player.stopVideo() : '';
  }

  savePlayer(player): void {
    this.player = player;
  }

  getEmailHtmlData(
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    const source = this._mapLocobuzzService.mapMention(mention);
    const object = {
      BrandInfo: source.brandInfo,
      TagId: source.tagID,
    };

    ticketHistoryData.emailPlainText = this._ticketService.replaceNewlinesWithBrTags(mention?.description,'<br>');
    
    this.refGetEmailHtmlData = this._ticketService.getEmailHtmlData(object).subscribe((data) => {
      if (data.success) {
        if (data.data)
        {
        data.data = data.data.replace(
          'cid:icon.png',
          'https://images.locobuzz.com/Email/Attachment/7172/a3f18571-7a47-448e-8a9e-a3e4f17cc699.png'
        );
        ticketHistoryData.htmlData = `<div >${data.data}</div>`;
        if (this.searchedText && this.pageType !== PostsType.TicketHistory) {
          const re = new RegExp('\\b(' + this.searchedText + '\\b)', 'igm');
          ticketHistoryData.htmlData = ticketHistoryData.htmlData.replace(
            re,
            '<mark>$&</mark>'
          );
        }
        mention.emailContent = data.data;
        this.cdkRef.detectChanges();
      }
      }
    });

    return ticketHistoryData;
  }

  replaceNewlinesWithBrTags(inputText) {
    let newlinePattern = /(\s{1,}|\n{2,}|\t{2,}|\r{2,}|\n\s*|&nbsp;{2,})/g;
    let textWithBrTags = inputText.replace(newlinePattern, " ").replaceAll('\\r\\n', '<br>').replaceAll('\r\n', '<br>');
    textWithBrTags = textWithBrTags.replace(/(<br>)+/g, "<br>")
    return textWithBrTags;
  }

  openImagePreview(event):void{
    this.emailImageOpenCount++;
    if(this.emailImageOpenCount==1)
    {
      const attachments: MediaContent[] = [{ mediaType: MediaEnum.IMAGE, mediaUrl: event?.target?.currentSrc }]
      const dialogRef = this._dialog.open(VideoDialogComponent, {
        panelClass: 'overlay_bgColor',
        data: attachments,
        autoFocus: false,
      });
      this.cdkRef.detectChanges();
dialogRef.afterClosed().subscribe((res)=>{
  this.emailImageOpenCount=0;
})
    }
  }

  surveyImagePreview(data) {
    let attachments: any = [];
    if(data && data.length){
      data.forEach((element) => {
        const obj = {
          mediaType: MediaEnum.IMAGE,
          mediaUrl: element
        }
        attachments.push(obj);
      });
    }
    this._dialog.open(VideoDialogComponent, {
      panelClass: 'overlay_bgColor',
      data: attachments,
      autoFocus: false,
    });
  }

  openAttachmentPreview(url?:string): void {
    let idx = this.postData?.attachmentMetadata?.mediaContents.findIndex((element) => element.thumbUrl === url)
    if (this.postData.channelGroup == ChannelGroup.Instagram && this.clickhouseEnabled) {
      idx = this.ticketHistoryData.imageurls.findIndex((element) => element === url)
    }
    if(idx==-1){
      idx = this.postData?.attachmentMetadata?.mediaContents.findIndex((element) => element.mediaUrl === url)
    }
    this._postDetailService.galleryIndex=idx > -1 ? idx : 0
    if (this.postData.channelGroup == ChannelGroup.Facebook) {
      const videoAttachment = this.postData?.attachmentMetadata?.mediaContents.find((element) => element.thumbUrl===url)
      const attachment = videoAttachment ? videoAttachment: this.postData?.attachmentMetadata?.mediaContents[0];
      if (
        attachment.mediaType == MediaEnum.VIDEO ||
        attachment.mediaType == MediaEnum.AUDIO || attachment.mediaType === MediaEnum.LOCATIONS
      ) {
        if (attachment.mediaUrl.includes('https://www.facebook.com/')) {
          window.open(attachment.mediaUrl, '_blank');
        } 
        else if(attachment.mediaUrl && this.clickhouseEnabled){
          const attachments =
            this.postData?.attachmentMetadata?.mediaContents
          this._dialog.open(VideoDialogComponent, {
            panelClass: 'overlay_bgColor',
            data: attachments,
            autoFocus: false,
          });
        }
        else {
          const obj = {
            mediaType: attachment.mediaType,
            BrandID: this.postData.brandInfo.brandID,
            BrandName: this.postData.brandInfo.brandName,
            PageID: this.postData.fbPageID,
            PostSocialID: this.postData.socialID,
            InreplyToStatusID: this.postData.inReplyToStatusId,
          };
          this.refGetFacebookMediaUrl = this._ticketService.getFacebookMediaUrl(obj).subscribe((data) => {
            if (data.success) {
              if (this.postData?.attachmentMetadata) {
                const attachments =
                  this.postData?.attachmentMetadata?.mediaContents;
                if (attachments.length > 0) {
                  const url =
                    attachment.mediaType == MediaEnum.AUDIO
                      ? data.data.data[0].file_url
                      : data.data.data[0].video_data.url;
                  attachments[0].mediaUrl = url;
                  this._dialog.open(VideoDialogComponent, {
                    panelClass: 'overlay_bgColor',
                    data: attachments,
                    autoFocus: false,
                  });
                }
              }
            }
          });
        }
      } else if (attachment.mediaType == MediaEnum.ANIMATEDGIF) {
        let userpostLink;
        if (this.postData.url) {
          userpostLink = this.postData.url;
        } else {
          userpostLink = this._footericonService.setOpenPostLink(
            this.postData,
            this.openReply
          );
        }
        window.open(userpostLink, '_blank');
      } else {
        if (this.postData?.attachmentMetadata) {
          let attachments = this.postData?.attachmentMetadata?.mediaContents;
          attachments = attachments.map((attachment) => ({
            ...attachment,
            channel: this.postData.channelGroup,
          }));
          if (attachments.length > 0) {
            this._dialog.open(VideoDialogComponent, {
              panelClass: 'overlay_bgColor',
              data: attachments,
              autoFocus: false,
            });
          }
        }
      }
    } else if (this.postData.channelGroup == ChannelGroup.TikTok && !this.clickhouseEnabled) {
      const attachment = this.postData?.attachmentMetadata?.mediaContents[0];
      if (attachment.mediaUrl.includes('https://www.tiktok.com/')) {
        window.open(attachment.mediaUrl, '_blank');
      }
    } else if (this.clickhouseEnabled && this.postData.channelGroup == ChannelGroup.TikTok && this.postData.author?.authorizedtype ){
      const attachment = this.postData?.attachmentMetadata?.mediaContents[idx];
      if (attachment.mediaUrl.includes('https://www.tiktok.com/')) {
        window.open(attachment.mediaUrl, '_blank');
      }
    } else if (this.postData.channelGroup == ChannelGroup.Twitter) {
      const attachment = this.postData?.attachmentMetadata?.mediaContents[idx];
      if (attachment.mediaUrl.includes('https://video.twimg.com')) {
        window.open(attachment.mediaUrl, '_blank', 'noopener,noreferrer');
      }else
      {
        if (this.postData?.attachmentMetadata) {
          let attachments =
            this.postData.attachmentMetadata.mediaContents.filter(
              (obj) =>
                obj.mediaType == MediaEnum.IMAGE ||
                obj.mediaType == MediaEnum.VIDEO ||
                obj.mediaType == MediaEnum.ANIMATEDGIF ||
                obj.mediaType == MediaEnum.AUDIO ||
                obj.mediaUrl.includes('.png') ||
                obj.mediaUrl.includes('.jpg') ||
                obj.mediaUrl.includes('.gif') ||
                (obj.mediaUrl.includes('.jpeg') &&
                  !obj.mediaUrl.includes('.pdf') &&
                  !obj.mediaUrl.includes('.doc') &&
                  !obj.mediaUrl.includes('.docx') &&
                  !obj.mediaUrl.includes('.xls') &&
                  !obj.mediaUrl.includes('.xlsx'))
            );
          if (attachments.length > 0) {

            attachments = attachments.map((attachment) => ({
              ...attachment,
              channel: this.postData.channelGroup,
            }));

            if (this.postData?.channelType === ChannelType?.DirectMessages && attachments[0]?.mediaType == MediaEnum?.IMAGE) {
              if (!attachments[0]?.mediaUrl?.includes('images.locobuzz') && !attachments[0]?.mediaUrl?.includes('s3.amazonaws')) {
                attachments[0].mediaUrl = url;
              }
            }  
            this._dialog.open(VideoDialogComponent, {
              panelClass: 'overlay_bgColor',
              data: attachments,
              autoFocus: false,
            });
          }
        } 
      }
    }
     else {
      if (this.postData?.attachmentMetadata) {
        const attachments =
          this.postData.attachmentMetadata.mediaContents.filter(
            (obj) =>
              obj.mediaType == MediaEnum.IMAGE ||
              obj.mediaType == MediaEnum.VIDEO ||
              obj.mediaType == MediaEnum.ANIMATEDGIF ||
              obj.mediaType == MediaEnum.AUDIO ||
              obj.mediaUrl.includes('.png') ||
              obj.mediaUrl.includes('.jpg') ||
              obj.mediaUrl.includes('.gif') ||
              (obj.mediaUrl.includes('.jpeg') &&
                !obj.mediaUrl.includes('.pdf') &&
                !obj.mediaUrl.includes('.doc') &&
                !obj.mediaUrl.includes('.docx') &&
                !obj.mediaUrl.includes('.xls') &&
                !obj.mediaUrl.includes('.xlsx'))
          );
        if (attachments.length > 0) {
          if (this.postData?.channelType === ChannelType?.DirectMessages && attachments[0]?.mediaType == MediaEnum?.IMAGE){
            if (!attachments[0]?.mediaUrl?.includes('images.locobuzz') && !attachments[0]?.mediaUrl?.includes('s3.amazonaws')) {
              attachments[0].mediaUrl = url;
            }            
          }       
          this._dialog.open(VideoDialogComponent, {
            panelClass: 'overlay_bgColor',
            data: attachments,
            autoFocus: false,
          });
        }
      }
    }
  }

  openAttachmentDocAndAudioPreview(media): void {
    if (this.postData?.attachmentMetadata) {
      let attachments;
      console.log(this.postData.attachmentMetadata, media)
      if(media instanceof Object && Object.keys(media).length > 0){
        const findMedia = this.postData.attachmentMetadata.mediaContents.find((item) => item.mediaUrl == media?.fileUrl);
        findMedia.mediaType = media?.mediaType;
        attachments = [findMedia];
      }
      else{
        this.postData.attachmentMetadata.mediaContents[0].mediaUrl = media;
        attachments = this.postData.attachmentMetadata.mediaContents;
      }

      if (attachments.length > 0) {
        this._dialog.open(VideoDialogComponent, {
          panelClass: 'overlay_bgColor',
          data: attachments,
          autoFocus: false,
        });
      }
    }
  }

  openAttachmentDocAndAudioPreviewForTelegram(media): void {
    let attachments = [media];
    if (attachments.length > 0) {
      this._dialog.open(VideoDialogComponent, {
        panelClass: 'overlay_bgColor',
        data: attachments,
        autoFocus: false,
      });
    }
  }

  openNoteAttachmentDocAndAudioPreview(media): void {
    if (this.postData?.notesAttachmentMetadata) {
      let attachments;
      console.log(this.postData.notesAttachmentMetadata, media)
      if (media instanceof Object && Object.keys(media).length > 0) {
        const findMedia = this.postData?.notesAttachmentMetadata?.mediaContents?.find((item) => item.mediaUrl == media?.mediaUrl);
        findMedia.mediaType = media?.mediaType;
        attachments = [findMedia];
      }
      else {
        this.postData.notesAttachmentMetadata.mediaContents[0].mediaUrl = media;
        attachments = this.postData.notesAttachmentMetadata.mediaContents;
      }

      if (attachments.length > 0) {
        this._dialog.open(VideoDialogComponent, {
          panelClass: 'overlay_bgColor',
          data: attachments,
          autoFocus: false,
        });
      }
    }
  }

  translateText(): void {
    this._postDetailService.postObj = this.postData;
    const object = {
      brandInfo: {
        BrandID: this._postDetailService.postObj.brandInfo.brandID,
        BrandName: this._postDetailService.postObj.brandInfo.brandName,
      },
      model: {
        DestinationLanguage: this.translateToFrom,
        TagId: this._postDetailService.postObj.ticketInfo.tagID,
        Text: (this.postData?.channelType === this.channelTypeEnum.GlassdoorReviews)
          ? [this.postData?.title + '<br>', `Pros: ${this.postData?.caption}<br>`, `Cons: ${this.ticketHistoryData?.description}`].filter(Boolean).join(' ')
          : (this.postData?.channelType === this.channelTypeEnum.ECommerceComments)
          ? [this.ticketHistoryData?.title + '<br>', this.ticketHistoryData?.description].filter(Boolean).join(' ')
          : (this.postData?.channelType == this.channelTypeEnum.Email)
          ? this.ticketHistoryData?.ticketClient?.ticketDescription
            : (this.postData?.channelType == this.channelTypeEnum.SitejabberReviews || this.postData?.channelType == this.channelTypeEnum.News || this.postData?.channelType == this.channelTypeEnum.TripAdvisor || this.postData?.channelType == this.channelTypeEnum.ComplaintWebsites || this.postData?.channelType == this.channelTypeEnum.Blogs || this.postData?.channelType == this.channelTypeEnum.DiscussionForums) 
            ? (this.postData?.title !== this.ticketHistoryData?.description
            ? `${this.postData?.title}<br>${this.ticketHistoryData?.description}` : this.ticketHistoryData?.description)
          : this.ticketHistoryData?.description
          ? this.ticketHistoryData?.description
          : this.ticketHistoryData?.descriptionWithTitle,
      },
      StartDateEpoch:
        this._filterService.filterForm.controls.brandDateDuration.value.Duration
          .StartDate,
      EndDateEpoch:
        this._filterService.filterForm.controls.brandDateDuration.value.Duration
          .EndDate,
    };

    if (this._filterService._filterFilledData !== undefined) {
      object.StartDateEpoch =
        this._filterService._filterFilledData.brandDateDuration.Duration.StartDate;
      object.EndDateEpoch =
        this._filterService._filterFilledData.brandDateDuration.Duration.EndDate;
    }

    // console.log(JSON.stringify(object));
    this._ticketService
      .translateText(object)
      .subscribe((data: TranslateData) => {
        this.translatedData = data;
        this.showTranslated = true;
        this.purifyTranslated();
        // console.log('Translate Text', this.translatedData);
      });
  }

  updateReachAndImpression() {
    const obj = {
      brandInfo: {
        brandID: this.postData.brandInfo.brandID,
        brandName: this.postData.brandInfo.brandName,
      },
      TagID: this.postData.tagID,
      ChannelGroupID: this.postData.channelGroup,
    };
    this.refUpdateReachAndImpressionById = this._ticketService.updateReachAndImpressionById(obj).subscribe(
      (res) => {
        if (res.success) {

          /* 
          this.post.reach = res.data.r;
          this.post.impression = res.data.i;
          this.post.engagement = res.data.e ? res.data.e:0 
          */
          this.postData.mentionMetadata.reach = res.data.r;
          this.postData.mentionMetadata.impression = res.data.i;
          this.postData.mentionMetadata.engagementCount = res.data.e
        if(!this.clickhouseEnabled)
        {  
          this.post.engagement = this.postData?.mentionMetadata?.engagementType != null ? this._ticketService.calculateEngagementLogic(this.postData) : 'NA'
          this.post.reach = this._ticketService.reachImpressionLogic(this.postData).reach == 0 || this._ticketService.reachImpressionLogic(this.postData).reach == null
            ? 'NA' : this._ticketService.reachImpressionLogic(this.postData).reach,
            this.post.impression = this._ticketService.reachImpressionLogic(this.postData).impression == 0 || this._ticketService.reachImpressionLogic(this.postData).impression == null
              ? 'NA' : this._ticketService.reachImpressionLogic(this.postData).impression,
            this.post.showReachFxFlag = this._ticketService.showReachFxOnFrontend(this.postData),
            this.post.showImpressionFxFlag = this._ticketService.showImpressionFxOnFrontend(this.postData),
            this.post.showEngagementFxFlag = this._ticketService.showEngagementFxOnFrontend(this.postData)
        }
            this.cdkRef.detectChanges();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Updated-Successfully'),
            },
          });
        }
      },
      (err) => {}
    );
  }

  setTranslateTo(name, val): void {
    this.translateTo = name;
    this.translateToFrom = val;
    this.translateText();
  }

  closeMenu() {
    this.menuTrigger.closeMenu();
  }

  resetTranslation() {
    this.showTranslated = false;
    this.translateToFrom = 'en';
  }

  purifyTranslated(): void {
    if (
      this.translatedData.data.translatedText !== '' &&
      this.translatedData.data.translatedText !== null
    ) {
      for (const each of Object.keys(Language)) {
        if (
          this.translatedData.data.sourceLanguage === Language[each].PassingName
        ) {
          this.translateFrom = Language[each].DisplayName;
        }
        if (
          this.translatedData.data.destinationLanguage ===
          Language[each].PassingName
        ) {
          this.translateTo = Language[each].DisplayName;
        }
      }
      this.translatedText = this.translatedData.data.translatedText;
      this.isTranslateError = false;
    } 
    /* else if (this.translatedData.data.sourceLanguage == 'en') {
      this.translatedText =
        'The text you are trying to translate is already in English.';
      this.isTranslateError = true;
    } */
    else if (
      this.translatedData.data.requestUsed >=
      this.translatedData.data.totalRequestCount
    ) {
      this.translatedText =
        this.translate.instant('translation-daily-limit', { count: this.translatedData.data.totalRequestCount });
      this.isTranslateError = true;
    } else if (
      this.translatedData.data.exceptionMessage !== '' &&
      this.translatedData.data.exceptionMessage != null
    ) {
      this.translatedText = this.translatedData.data.exceptionMessage;
      this.isTranslateError = true;
    } else {
      this.translatedText = this.translate.instant('no-translation-found');
      this.isTranslateError = true;
    }
    this.cdkRef.detectChanges();
  }

  setMentionFlag(type, mentionflag, isretweet = false): void {
    console.log(type, mentionflag, isretweet);

    this.mentionAction = type;
    this.mentionActionFlag = mentionflag;

    // this.selectedHandle = null;
    // get handlenames
    if (!isretweet) {
      this.GetBrandAccountInformation();
    } else {
      this.GetBrandAccountInformationForRetweet();
    }
  }

  // setSocialHandle(socialObj: SocialHandle): void {
  //   if (!socialObj.isactive) {
  //     this.selectedHandle = socialObj;
  //   } else {
  //     this.selectedHandle = {};
  //   }

  //   this.handleNames = this.handleNames.filter((obj) => {
  //     if (obj.handleId === socialObj.handleId) {
  //       obj.isactive = !obj.isactive;
  //     } else {
  //       obj.isactive = false;
  //     }
  //     return obj;
  //   });

  //
  // }

  submitActionHandle(): void {
    if (this.mentionAction && this.selectedHandle.handleId) {
      switch (this.mentionAction) {
        case MentionActions.LikeUnlike:
          this.setLikeDislike(this.selectedHandle);
          break;
        case MentionActions.RetweetUntweet:
          // this.setTweetRetweet(this.selectedHandle);
          this.openRetweetPopup(this.selectedHandle);
          break;
        case MentionActions.Dislike:
          // this.blockUnblockAuthor(this.selectedHandle);
          break;
        default:
          break;
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('please-select-social-handle'),
        },
      });
    }
  }

  openRetweetPopup(handle: SocialHandle) {
    const findIndex = this.likeRetweetHandleList.findIndex(
      (obj) => obj.socialId === handle.socialId
    );
    if (findIndex > -1) {
      const message = '';
      const dialogData = new AlertDialogModel(
        this.translate.instant('undo-retweet-title'),
        message,
        'Yes',
        'No'
      );
      const dialogRef = this._dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          const key = this._ticketService.constructMentionObj(this.postData);
          key.Account.AccountID = handle.accountId;
          key.Account.SocialID = handle.socialId;
          key.IsRetweet = false;
          key.Source.TicketID = this.postData.ticketID;
          key.Source.TagID = this.postData.tagID;
          this.refRetweetUnRetweetMention = this._ticketService.retweetUnRetweetMention(key).subscribe((data) => {
            if (data.success) {
              this.retweetedHandles = this.retweetedHandles.filter(
                (obj) => obj.socialId !== handle.socialId
              );
              this.selectedHandle = {};
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: this.translate.instant('undo-retweeted-success'),
                },
              });
              this.ticketHistoryData.communicationLogProperty.retweetStatus =
                false;
              this.postData.mentionMetadata.shareCount =
                +this.postData.mentionMetadata.shareCount - 1;
              this.ticketHistoryData.communicationLogProperty.shareCount =
                this._footericonservice.kFormatter(
                  +this.postData.mentionMetadata.shareCount
                );
              this.retweetCount =
                this.ticketHistoryData.communicationLogProperty.shareCount;
              this._ticketService.setRetweetMentionObs.next(this.postData);
            } else {
              if (data?.data?.apiErrorMessage) {
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                    type: notificationType.Error,
                    message: data.data.apiErrorMessage,
                  },
                });
              } else {
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                    type: notificationType.Error,
                    message: this.translate.instant('some-error-occurred'),
                  },
                });
              }
            }
          });
          this.clickTicketMenuTrigger.closeMenu();
        } else {
          this.clickTicketMenuTrigger.closeMenu();
        }
      });
    } else {
      const key = this._ticketService.constructMentionObj(this.postData);
      key.Account.AccountID = handle.accountId;
      key.Account.SocialID = handle.socialId;
      key.IsRetweet = !this.mentionActionFlag;
      this.clickTicketMenuTrigger.closeMenu();
      this._dialog.open(QuoteTweetComponent, {
        width: '45vw',
        panelClass: ['responsive__quote--modal'],
        disableClose: false,
        data: { postData: this.postData, keyObj: key, handle: handle },
      });
    }
  }

  ssreSimulationWrongPopupLogic(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.ssreSimWrong });
  }

  ssreSimulationRightPopupLogic(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.ssreSimRight });
  }

  ssreLiveWrongPopupLogic(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.ssreLiveWrong });
  }

  ssreLiveRightVerified(): void {
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.ssreLiveRightVerified,
    });
  }
  WorkflowLogStatus: WorkflowLogStatus;
  replyApproved(): void {
    if (this.postData?.ticketInfoWorkflow?.workflowId){
      this.postData.ticketInfoWorkflow.workflowLogStatus = WorkflowLogStatus.WorkflowReplyApproved
    }
    const source = this._mapLocobuzzService.mapMention(this.postData);
    const sourceobj = {
      Source: source,
      EscalationNote: '',
      ActionTaken: 0,
    };

    const message = '';
    const dialogData = new AlertDialogModel(
      this.translate.instant('Approve-Ticket-Confirmation-Message'),
      message,
      this.translate.instant('continue'),
    );
    const dialogRef = this._dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
         this._replyService.ReplyApproved(sourceobj).subscribe((data) => {
          // console.log('reply approved successfull ', data);
          if (data) {
            // this._filterService.currentBrandSource.next(true);
            this._filterService.currentBrandSourceSignal.set(true);
            // this.dialogRef.close(true);
            // this._ticketService.ticketStatusChange.next(true);
            this._ticketService.ticketStatusChangeSignal.set(true);
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('reply-approved-success'),
              },
            });
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translate.instant('Something went wrong'),
              },
            });
          }
          // this.zone.run(() => {
        });
      } else {
      }
    });
  }

  replyRejected(): void {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyRejected, param: {note}});
    if (this.makercheckerrejectnote.trim() !== '') {
      const source = this._mapLocobuzzService.mapMention(this.postData);

      const rejectnote = {
        $type:
          'LocobuzzNG.Entities.Classes.CommunicationLog, LocobuzzNG.Entities',
        Note: this.makercheckerrejectnote ? this.makercheckerrejectnote : '',
      };
      if (this.postData?.ticketInfoWorkflow?.workflowId) {
        this.postData.ticketInfoWorkflow.workflowLogStatus = WorkflowLogStatus.WorkflowReplyRejected
      }
      const sourceObj = {
        Source: source,
        RejectNote: rejectnote,
        ActionTaken: ActionTaken.Locobuzz,
      };

      this.refReplyApproved = this._replyService.ReplyRejected(sourceObj).subscribe((data) => {
        if (data.success) {
          // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
          this.makercheckerrejectnote = '';
          // this._ticketService.ticketStatusChange.next(true);
          this._ticketService.ticketStatusChangeSignal.set(true);
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('reply-rejected-success'),
            },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data?.message : this.translate.instant('Error-occurred-while-Rejecting'),
            },
          });
        }
        // this.zone.run(() => {
      });
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('note-required'),
        },
      });
    }
  }

  replyModified(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyModified });
  }

  private GetBrandAccountInformation(): void {
    this.unLikeUndoRetweetHandleList = [];
    this.likeRetweetHandleList = [];
    this.submitButtonName = '';
    const obj = {
      Brand: this.postData.brandInfo,
      ChannelGroup: this.postData.channelGroup,
    };

    // call api to get socialaccountlist

    this.refGetBrandAccountInformation = this._replyService.GetBrandAccountInformation(obj).subscribe((data) => {
      if (data) {
        this.objBrandSocialAcount = data.filter((x) => {
          return x.channelGroup === obj.ChannelGroup;
        });
        if (this.objBrandSocialAcount) {
          this.handleNames = [];
          this.objBrandSocialAcount.forEach((item) => {
            const profilepic = this._filterService.fetchedSocialProfile.filter(
              (obj) =>
                obj.btaid === item.btaid &&
                obj.brandID === this.postData.brandInfo.brandID
            )[0].profileImageUrl;
            this.handleNames.push({
              handleId: item.socialID,
              handleName: item.userName,
              accountId: item.accountID,
              socialId: item.socialID,
              isactive: false,
              profilepic: profilepic
                ? profilepic
                : ChannelImage[ChannelGroup[obj.ChannelGroup]],
            });
          });
          this.TwitterTweetLikeStatus();
        }
      }
    });
  }

  private GetBrandAccountInformationForRetweet(): void {
    this.unLikeUndoRetweetHandleList = [];
    this.likeRetweetHandleList = [];
    this.submitButtonName = '';
    const obj = {
      Brand: this.postData.brandInfo,
      ChannelGroup: this.postData.channelGroup,
    };

    // call api to get socialaccountlist

    this.refGetBrandAccountInformation1 = this._replyService.GetBrandAccountInformation(obj).subscribe((data) => {
      if (data) {
        this.objBrandSocialAcount = data.filter((x) => {
          return x.channelGroup === obj.ChannelGroup;
        });
        if (this.objBrandSocialAcount) {
          this.handleNames = [];
          this.objBrandSocialAcount.forEach((item) => {
            const profilepic = this._filterService.fetchedSocialProfile.filter(
              (obj) =>
                obj.btaid === item.btaid &&
                obj.brandID === this.postData.brandInfo.brandID
            )[0].profileImageUrl;
            this.handleNames.push({
              handleId: item.socialID,
              handleName: item.userName,
              accountId: item.accountID,
              socialId: item.socialID,
              isactive: false,
              profilepic: profilepic
                ? profilepic
                : ChannelImage[ChannelGroup[obj.ChannelGroup]],
            });
          });
          this.TwitterReTweetStatus();
        }
      }
    });
  }

  private TwitterReTweetStatus() {
    const obj = {
      BrandInfo: {
        BrandID: this.postData.brandInfo.brandID,
        BrandName: this.postData.brandInfo.brandName,
      },
      PostSocialID: this.postData.socialID,
    };

    this.refTwitterReTweetStatus = this._replyService.TwitterReTweetStatus(obj).subscribe((resp) => {
      if (resp.success) {
        const authorlist: RetweetSocialHandle[] = resp.data;
        if (authorlist && authorlist.length > 0) {
          for (const handle of this.handleNames) {
            if (
              authorlist.some(
                (author) =>
                  handle.socialId === author.authorID && author.isRetweet
              )
            ) {
              // handle.isactive = true;
              this.likeRetweetHandleList.push(handle);
              // this.selectedHandle = handle;
            } else {
              this.unLikeUndoRetweetHandleList.push(handle);
            }
          }
        } else {
          this.unLikeUndoRetweetHandleList = this.handleNames;
        }
        this.cdkRef.detectChanges();
      }
    });
  }

  private TwitterTweetLikeStatus() {
    const obj = {
      $type:
        'LocobuzzNG.Entities.Classes.Mentions.TwitterMention, LocobuzzNG.Entities',
      brandinfo: {
        BrandID: this.postData.brandInfo.brandID,
      },
      SocialID: this.postData.socialID,
    };

    this.refTwitterTweetLikeStatus = this._replyService.TwitterTweetLikeStatus(obj).subscribe((resp) => {
      if (resp.success) {
        console.log(resp);
        const authorlist: LikeSocialHandle[] = resp.data;
        if (resp.data && resp.data.length > 0) {
          if (authorlist && authorlist.length > 0) {
            console.log(this.handleNames);
            for (const handle of this.handleNames) {
              if (
                authorlist.some(
                  (obj) =>
                    handle.socialId === obj.authorSocialID && obj.like_Status
                )
              ) {
                // handle.isactive = true;
                this.likeRetweetHandleList.push(handle);
                // this.selectedHandle = handle;
              } else {
                this.unLikeUndoRetweetHandleList.push(handle);
              }
            }

            // for (const author of authorlist) {
            //   if (
            //     handle.socialId === author.authorSocialID &&
            //     author.like_Status
            //   ) {
            //     handle.isactive = true;
            //     // this.retweetedHandles.push(handle);
            //     this.selectedHandle = handle;
            //   }
            // }
          }
        } else {
          this.unLikeUndoRetweetHandleList = this.handleNames;
        }
        this.cdkRef.detectChanges();
      }
    });
  }

  private setLikeDislike(handle?: SocialHandle): void {
    const key = this._ticketService.constructMentionObj(this.postData);
    if(handle)
    {
      key.Account.AccountID = handle.accountId;
      key.Account.SocialID = handle.socialId;
    }else
    {
      key.Account.AccountID = this.postData?.settingID;
      key.Account.SocialID = this.postData?.author?.socialId;
    }
    key.IsLike = !this.mentionActionFlag;

    this.refLikeDislikeMention = this._ticketService.likeDislikeMention(key).subscribe((data) => {
      if (data.success) {
        if (key.IsLike) {
          this.postData.mentionMetadata.likeCount =
            +this.postData.mentionMetadata.likeCount + 1;
          this.ticketHistoryData.communicationLogProperty.likeCount =
            this._footericonservice.kFormatter(
              +this.postData.mentionMetadata.likeCount
            );
          this.likeCount =
            this.ticketHistoryData.communicationLogProperty.likeCount;
          this.ticketHistoryData.communicationLogProperty.likeStatus = true;
        } else {
          this.postData.mentionMetadata.likeCount =
            +this.postData.mentionMetadata.likeCount - 1;
          this.ticketHistoryData.communicationLogProperty.likeCount =
            this._footericonservice.kFormatter(
              +this.postData.mentionMetadata.likeCount
            );
          this.likeCount =
            this.ticketHistoryData.communicationLogProperty.likeCount;
          if (+this.postData.mentionMetadata.likeCount === 0) {
            this.ticketHistoryData.communicationLogProperty.likeStatus = false;
          }
        }

        this._ticketService.setLikeDislikeMentionObs.next(this.postData);

        this.clickLikeMenuTrigger ? this.clickLikeMenuTrigger.closeMenu() : '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.mentionActionFlag
              ? this.translate.instant('unliked-success')
              : this.translate.instant('liked-success'),
          },
        });
      } else {
        let message = this.translate.instant('error-occurred');
        if (data?.data['apiErrorMessage']){
          message = data?.data['apiErrorMessage'] + this.translate.instant('please-reauthorize-account');
          if (data?.data['apiErrorMessage']?.includes('Permissions error')){
            message = data?.data?.message || this.translate.instant('error-occurred');
          }
        }

        this.clickLikeMenuTrigger ? this.clickLikeMenuTrigger.closeMenu() : '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: message,
          },
        });
      }
      this.cdkRef.detectChanges();
    });
  }

  private setTweetRetweet(handle: SocialHandle): void {
    const key = this._ticketService.constructMentionObj(this.postData);
    key.Account.AccountID = handle.accountId;
    key.Account.SocialID = handle.socialId;
    key.IsRetweet = !this.mentionActionFlag;

    this.refRetweetUnRetweetMention1 = this._ticketService.retweetUnRetweetMention(key).subscribe((data) => {
      if (data.success) {
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
            type: notificationType.Success,
            message: this.translate.instant('Error-Occured'),
          },
        });
      }
    });
  }

  openCategoryDialog(event): void {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.mentionCategory, param: {mentionCategory}});
    this.postData.categoryMapText = null;
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    this._postDetailService.categoryType = event;
    this._dialog.open(CategoryFilterComponent, {
      width: '73vw',
      panelClass: ['responsive__modal--fullwidth'],
      disableClose: false,
    });
  }

  CannedResponse(type: number): void {
    this._postDetailService.notetype = type;
    this._dialog.open(CannedResponseComponent, {
      autoFocus: false,
      width: '50vw',
      data: { mention: this.postData, isByPassMedia: type === 3 ? true : false },
    });
  }

  clearnote(): void {
    this.makercheckerrejectnote = '';
    if (this.inputElement) {
      this.inputElement.nativeElement.focus();
    }
    this.cdkRef.detectChanges();
  }

  openParentPost(): void {
    this._postDetailService.postObj = this.postData;
    this._dialog.open(ParentPostComponent, {
      data: { parentPostFlag: true },
      autoFocus: false,
      width: '65vw',
      panelClass: ['responsive__parent--modal'],
    });
  }

  openTicketDetail(): void {
    if (this.openDetailOnClick && this.ticketHistoryData.showTicketWindow) {
      this.postActionTypeEvent.emit({
        actionType: PostActionEnum.openTicketDetail,
      });
    }
    // this.ticketDetailsPopup = true;
  }

  openPostOverview() {
    this._dialog.open(PostOverviewComponent, {
      autoFocus: false,
      panelClass: ['full-screen-modal'],
      data: {
        postOverviewSection: 1,
        postData: this.postData,
      },
    });
  }

  openCaroselMedia(imageUrl: string): void {
    const attachments = [{ mediaUrl: imageUrl, mediaType: MediaEnum.IMAGE }];
    this._dialog.open(VideoDialogComponent, {
      panelClass: 'overlay_bgColor',
      data: attachments,
      autoFocus: false,
    });
  }

  // openFile(id,url): void {
  //   // this.audioID=''
  //   this._audioService.stop();
  //   this.iconPauseAudio = true;
  //   this.iconPlayAudio = false;
  //   this._postDetailService.audioID = id;
  //   this._audioService.playStream(url).subscribe((events) => {
  //     // listening for fun here
  //   });
  // }
  // onSliderChangeEnd(change): void {
  //   // this.audioID = this.postData.contentID;
  //   this._audioService.seekTo(change.value);
  // }
  // playAudio(): void {
  //   this.iconPauseAudio = true;
  //   this.iconPlayAudio = false;
  //   // this.audioID = this.postData.contentID;
  //   this._audioService.play();
  // }
  // pauseAudio(): void {
  //   this.iconPauseAudio = false;
  //   this.iconPlayAudio = true;
  //   // this.audioID = this.postData.contentID;
  //   this._audioService.pause();
  // }
  setSocialHandle(
    socialObj: SocialHandle,
    actionType: number,
    title: string
  ): void {
    socialObj.isactive = true;
    if (actionType == 1) {
      this.likeRetweetHandleList.forEach((obj) => {
        if (obj.socialId == socialObj.socialId) {
          obj.isactive = true;
          this.selectedHandle = obj;
        } else {
          obj.isactive = false;
        }
      });
      this.unLikeUndoRetweetHandleList.forEach((obj) => (obj.isactive = false));
      if (title.includes('Like')) {
        this.submitButtonName = this.translate.instant('UNLIKE');
      } else {
        this.submitButtonName = this.translate.instant('Undo-Retweet');
      }
      this.mentionActionFlag = true;
    } else {
      this.unLikeUndoRetweetHandleList.forEach((obj) => {
        if (obj.socialId == socialObj.socialId) {
          obj.isactive = true;
          this.selectedHandle = obj;
        } else {
          obj.isactive = false;
        }
      });
      this.likeRetweetHandleList.forEach((obj) => (obj.isactive = false));
      if (title.includes('Like')) {
        this.submitButtonName = this.translate.instant('Like');
      } else {
        this.submitButtonName = this.translate.instant('Retweet');
      }
      this.mentionActionFlag = false;
      console.log(this.selectedHandle);
    }
    this.cdkRef.detectChanges();
  }
  copied(name): void {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Success,
        message: this.translate.instant('copied-success', { name }),
      },
    });
  }

  noteMedia(data?){
    this.medialist = []
    this.fileList = []
    this.noteMediaCount = {
      pdfCount: 0,
      xlsCount: 0,
      mediaCount: 0,
      docCount: 0,
      csvCount: 0,
      showDownload: false,
    }
    let attachmentObj:noteAttachmentList = {
      fileName: '',
      mediaUrl: '',
      mediaType: null,
      mediaPath: '',
      iconUrl: '',
    };
    
    if (data) {
      // this.postData.ticketInfo.lastNote  = data?.note;
      if (data?.media && data?.media.length > 0){

        data?.media.forEach(obj => {

          let iconPath = 'assets/images/other-attachment.svg';

          switch (obj?.mediaType) {
            case MediaEnum.IMAGE:
            case MediaEnum.ANIMATEDGIF:
              iconPath = 'assets/icons/JPEG.svg';
              break;
            case MediaEnum.VIDEO:
              iconPath = 'assets/icons/video-icon.svg';
              break;
            case MediaEnum.PDF:
              iconPath = 'assets/icons/PDF.svg';
              break;
            case MediaEnum.DOC:
              iconPath = 'assets/icons/DOC.svg';
              break;
            case MediaEnum.EXCEL:
              iconPath = 'assets/icons/Xls.svg';
              break;
          }

          attachmentObj = {
            fileName: obj?.displayFileName,
            mediaUrl: obj?.mediaPath,
            mediaPath: obj?.mediaPath,
            mediaType: +obj?.mediaType,
            iconUrl: iconPath
          }
          if (attachmentObj?.mediaType == MediaEnum.IMAGE || attachmentObj?.mediaType == MediaEnum.VIDEO || attachmentObj?.mediaType == MediaEnum.ANIMATEDGIF) {
            this.noteMediaCount.mediaCount += 1;
            this.medialist.push(attachmentObj);
          } else if (attachmentObj?.mediaType == MediaEnum.PDF || attachmentObj?.mediaType == MediaEnum.DOC || attachmentObj?.mediaType == MediaEnum.EXCEL) {
            if (attachmentObj?.mediaType == MediaEnum.PDF) {
              this.noteMediaCount.pdfCount += 1;
            } else if (attachmentObj?.mediaType == MediaEnum.DOC) {
              this.noteMediaCount.docCount += 1;
            } else if (attachmentObj?.mediaType == MediaEnum.EXCEL) {
              this.noteMediaCount.xlsCount += 1;
            }
            this.fileList.push(attachmentObj);
          }
        })
      }

    } else{
      if (this.postData?.notesAttachmentMetadata?.mediaContents?.length > 0) {
        this.postData?.notesAttachmentMetadata?.mediaContents.forEach(obj => {
          let iconPath = 'assets/images/other-attachment.svg';

          switch (obj?.mediaType) {
            case MediaEnum.IMAGE:
            case MediaEnum.ANIMATEDGIF:
              iconPath = 'assets/icons/JPEG.svg';
              break;
            case MediaEnum.VIDEO:
              iconPath = 'assets/icons/video-icon.svg';
              break;
            case MediaEnum.PDF:
              iconPath = 'assets/icons/PDF.svg';
              break;
            case MediaEnum.DOC:
              iconPath = 'assets/icons/DOC.svg';
              break;
            case MediaEnum.EXCEL:
              iconPath = 'assets/icons/Xls.svg';
              break;
          }
          attachmentObj = {
            fileName: obj?.name,
            mediaUrl: obj?.mediaUrl,
            mediaPath: obj?.mediaUrl,
            mediaType: +obj?.mediaType,
            iconUrl: iconPath
          }
          if (attachmentObj?.mediaType == MediaEnum.IMAGE || attachmentObj?.mediaType == MediaEnum.VIDEO || attachmentObj?.mediaType == MediaEnum.ANIMATEDGIF) {
            this.noteMediaCount.mediaCount += 1;
            this.medialist.push(attachmentObj);
          } else if (attachmentObj?.mediaType == MediaEnum.PDF || attachmentObj?.mediaType == MediaEnum.DOC || attachmentObj?.mediaType == MediaEnum.EXCEL) {
            if (attachmentObj?.mediaType == MediaEnum.PDF) {
              this.noteMediaCount.pdfCount += 1;
            } else if (attachmentObj?.mediaType == MediaEnum.DOC) {
              this.noteMediaCount.docCount += 1;
            } else if (attachmentObj?.mediaType == MediaEnum.EXCEL) {
              this.noteMediaCount.xlsCount += 1;
            }
            this.fileList.push(attachmentObj);
          }
        })
      }
    }
    this.notesAttachmentList = this.medialist.concat(this.fileList);

  }
  // quoraParentPost():void{
  //  //   this._dialog.open(QuoraParentPostComponent, {
  //     width:'65vw',
  //   });
  // }

  getToolTipData(data, length) {
    if (data) {
      if (data.length > length) {
        let msg = '';
        msg = data;
        return msg;
      }
    }
  }

  replaceNewlinesAndSpaces(input) {
    let result = input.replace(/\n/g, (match, offset, string) => {
      const before = string[offset - 1];
      const after = string[offset + 1];

      if ((before && before.trim() === '') || (after && after.trim() === '')) {
        return '';
      }
      return ' ';
    });

    result = result.replace(/\s+/g, ' ');

    return result;
  }

  noteTextChange(nodeElement: any, holder: any, byPass: boolean, text: string) {
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
      this.cdkRef.detectChanges();
      return false;
    }

    if (!nodeElement && byPass && text?.trim()?.length > 0) {
      if (text && text?.length > 2500) {
        this[holder] = text?.substring(0, 2500);
        this.inputElement.nativeElement.value = text?.substring(0, 2500);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('character-limit-note'),
          },
        });
        return false;
      }
      else if (byPass) {
        this[holder] = text;
        byPass = false
        return false;
      }
      this.cdkRef.detectChanges()
    }
  }
  

  downloadTextFile(file) {
    if (file && file.fileUrl && file.fileUrl.endsWith('.txt')){
      const fileUrl = file.fileUrl; // Your text content
      const fileName = file.fileName;

      this.http.get(fileUrl, { responseType: 'blob' }).subscribe(blob => {
        // Create a link to download the file
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;

        // Append the link, trigger the download, and remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }
  
  getTruncatedText(text: string | undefined, limit): string {
    if (!text) return '';
    return text.length > limit ? text.substring(0, limit) + '...' : text;
  }

  updateTicketAssignmentListSignalChange(data){
    if (data) {
      if (data.guid == this.postDetailTab?.guid) {
        if (data.tagID == this.postData.tagID) {
          if (data.note || data.NotesAttachment) {
            this.postData.ticketInfo.lastNote = data.note;
            this.postData.notesAttachmentMetadata.mediaContents = data.NotesAttachment
            if (
              this.pageType == PostsType.Tickets ||
              this.pageType == PostsType.Mentions
            ) {
              this.note = this._ticketService.checkLogVersionAndNote(
                this.postData.ticketInfo.lastNote
              )
                ? this.postData.ticketInfo.lastNote
                : '';
              this.noteMedia()
            }
          }
          this.cdkRef.detectChanges();
        }
      }
    }
  }

  unMaskedDataSignal(result){
    if (result) {
      const pageType = this.parentPostFlag ? PostsType.parentPost : this.pageType;
      if (result.tagID == this.postData.tagID && result.pageType == pageType) {
        this.postData.description = result.data.description ? this.replaceNewlinesAndSpaces(result.data.description).replace(/\n/g, '') : this.postData.description;
        this.postData.title = result.data.title ? this.replaceNewlinesAndSpaces(result.data.title).replace(/\n/g, '') : this.postData.title;
        this.postData.caption = result.data.caption ? this.replaceNewlinesAndSpaces(result.data.caption).replace(/\n/g, '') : this.postData.caption;

        this.ticketHistoryData.description = result.data.description ? this.replaceNewlinesAndSpaces(result.data.description).replace(/\n/g, '') : this.ticketHistoryData.description;
        this.ticketHistoryData.title = result.data.title ? this.replaceNewlinesAndSpaces(result.data.title).replace(/\n/g, '') : this.ticketHistoryData.title;
        // this.ticketHistoryData.caption = result.data.caption ? this.replaceNewlinesAndSpaces(result.data.caption).replace(/\n/g, '') : this.ticketHistoryData.caption;
        this.cdkRef.detectChanges();
        /* this._ticketService.unMaskedData.next(null); */
        this._ticketService.unMaskedDataSignal.set(null);
      }
    }
  }

  noteAddedMediaChangeSignalChange(data){
    if (data) {
      this.noteMedia(data);
      this._ticketService.noteAddedMediaChangeSignal.set(null);
    }
  }

  detectArabic(text: string = ""): boolean {
    text = text?.replace(/<[^>]*>/g, '');
    const arabicChars = text?.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || [];
    const totalChars = text?.replace(/\s/g, '').length;
    const arabicRatio = arabicChars?.length / totalChars;
    return arabicRatio > 0.3;
  }

  getTextDirection(): 'rtl' | 'ltr' {
    return this.detectArabic(`${this.ticketHistoryData?.description}`) ? 'rtl' : 'ltr';
  }

  formatTextForDirection(text: string, dir: 'rtl' | 'ltr'): string {
    if (this.stripHtml(this.ticketHistoryData?.description)?.length > 700){
      text = text.substr(0, this.getTruncationIndexForVisibleText(this.ticketHistoryData?.description, this.showMoreLessCount));
    }
    if (dir === 'rtl') {
      return text?.replace(/(@\w+)/g, '<span dir="ltr">$1</span>');
    }
    return text;
  }

  private clearVariables(): void {
    this.clickHandler = null;
    if (this.refGetEmailHtmlData) {
      this.refGetEmailHtmlData.unsubscribe();
    }
    if (this.refGetFacebookMediaUrl) {
      this.refGetFacebookMediaUrl.unsubscribe();
    }
    if (this.refUpdateReachAndImpressionById) {
      this.refUpdateReachAndImpressionById.unsubscribe();
    }
    if (this.refRetweetUnRetweetMention) {
      this.refRetweetUnRetweetMention.unsubscribe();
    }
    if (this.refReplyApproved) {
      this.refReplyApproved.unsubscribe();
    }
    if (this.refGetBrandAccountInformation) {
      this.refGetBrandAccountInformation.unsubscribe();
    }
    if (this.refGetBrandAccountInformation1) {
      this.refGetBrandAccountInformation1.unsubscribe();
    }
    if (this.refTwitterReTweetStatus) {
      this.refTwitterReTweetStatus.unsubscribe();
    }
    if (this.refTwitterTweetLikeStatus) {
      this.refTwitterTweetLikeStatus.unsubscribe();
    }
    if (this.refLikeDislikeMention) {
      this.refLikeDislikeMention.unsubscribe();
    }
    if (this.refRetweetUnRetweetMention1) {
      this.refRetweetUnRetweetMention1.unsubscribe();
    }
    this.handleNamesObs.complete();
    if (this.effectEmailFriendlyViewObsSignal) {
      this.effectEmailFriendlyViewObsSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectNoteAddedMediaChangeSignal) {
      this.effectNoteAddedMediaChangeSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectSelectedCannedResponseSignal) {
      this.effectSelectedCannedResponseSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectUnMaskedDataSignal) {
      this.effectUnMaskedDataSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectUpdateTicketAssignmentListSignal) {
      this.effectUpdateTicketAssignmentListSignal.destroy();  // Clean up any active signal effect
    }
    this.clickTicketMenuTrigger = null;
    this.clickLikeMenuTrigger = null;
    this.inputElement = null;
    this.iframeStyle = null;
    this.widthSpanElement = null;
    this.menuTrigger = null;
  }
  triggerWebhookForVideo() {
    if (this.postData?.channelGroup == ChannelGroup.Twitter && this.postData?.channelType == this.channelTypeEnum.DirectMessages) {
      const attachmentData =
        this.postData?.attachmentMetadata?.mediaContents;
      if(attachmentData && attachmentData.length){
          if (attachmentData[0]?.thumbUrl?.includes('images.locobuzz') || attachmentData[0]?.thumbUrl?.includes('s3.amazonaws')) {
            return;
          }
          else {
            fetch(attachmentData[0]?.thumbUrl, {
              method: 'GET'
            })
              .catch(error => console.error('Error:', error));
          }
      }
    }
    else {
      return;
    }
  }

    openMediaPreview(obj,notesAttachmentFlag):void
    {

      if (obj.mediaType != 2 && obj.mediaType != 3) {
        return
      }

      const attachments =[];
      if (notesAttachmentFlag)
      {
        this.notesAttachmentList.forEach((x) => {
          if (x.mediaType == 2 || x.mediaType == 3) {
            attachments.push(x)
          }
        })
      }else
      {
        this.attachmentList.forEach((x) => {
          if (x.mediaType == 2 || x.mediaType == 3) {
            attachments.push(x)
          }
        })
      }
  
      this._postDetailService.galleryIndex  = attachments.findIndex((x) => x.mediaUrl == obj.mediaUrl)
  
         if (attachments.length > 0) {
              this._dialog.open(VideoDialogComponent, {
                panelClass: 'overlay_bgColor',
                data: attachments,
                autoFocus: false,
              });
            }
    }


  downloadFile(url: string, filename: string): void {
   this._ticketService.downloadFile(url, filename)
  }

  checkEmailAttachmentWidth():void
  {
    const containerWidth = this.attachmentContainer.nativeElement.offsetWidth;
    let totalWidth = 0;
    this.attachmentRef.forEach((ref, index) => {
      const width = ref.nativeElement.offsetWidth + 15;
      totalWidth += width;
      if (totalWidth > containerWidth) {
       this.showMoreAttachment = true; 
      }else{
        this.maximumAttachmentLength = index+1;
      }
    });
    this.remainingCount = this.attachmentList.length - this.maximumAttachmentLength;
    this.cdkRef.detectChanges();
  }

  downloadAllFiles(): void {
    const fileList = []
    this.attachmentList.forEach(file => {
      fileList.push({ name: file.name, url: file.mediaUrl });
    });
    this._ticketService.downloadFilesAsZip(fileList,`Attachment of ${this.postData.ticketID}`)
  }

  adjustIframeHeight(iframe: HTMLIFrameElement) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      const updateHeight = () => {
        if (this.postData?.channelGroup == ChannelGroup.Pantip && iframeDoc?.images?.length == 0) {
          iframe.style.height = iframeDoc.body.scrollHeight + 16 + 'px';
        } else if (this.postData?.channelGroup == ChannelGroup.Pantip && iframeDoc?.images?.length > 0) {
          iframe.style.height = iframeDoc.body.scrollHeight < 350 ? iframeDoc.body.scrollHeight + 16 + 'px' : '350px';
        } else {
          iframe.style.height = iframeDoc.body.scrollHeight + 'px';
        }
      };

      updateHeight();

      // Re-adjust height when images load
      const images:any = iframeDoc.images;
      for (let img of images) {
        img.onload = updateHeight;
      }
    }
  }

  checkNotesWidth():void
  {
    this.maximumAttachmentNoteLength = this.notesAttachmentList.length
    setTimeout(() => {
      this.checkEmailAttachmentNoteWidth()
    }, 300);
  }

  checkEmailAttachmentNoteWidth(): void {
    const containerWidth = this.attachmentContainer.nativeElement.offsetWidth;
    let totalWidth = 0;
    this.attachmentNoteRef.forEach((ref, index) => {
      const width = ref.nativeElement.offsetWidth + 15;
      totalWidth += width;
      if (totalWidth > containerWidth) {
        this.showMoreNoteAttachment = true;
      } else {
        this.maximumAttachmentNoteLength = index + 1;
      }
    });
    this.remainingNotesCount = this.notesAttachmentList.length - this.maximumAttachmentNoteLength;
    this.cdkRef.detectChanges();
  }

    showReplyMessageExpiry(): void {
      if (this.postData?.channelGroup === ChannelGroup.WhatsApp || this.postData?.channelGroup === ChannelGroup.GoogleBusinessMessages) {
        const ticketTimings = this._ticketService.calculateTicketTimes(
          this.postData
        );
        if (ticketTimings.valDays) {
          if (
            Number(ticketTimings.valDays) === 1 ||
            Number(ticketTimings.valDays) === 0
          ) {
            this.showreplyDaysCounter = true;
            this.cdkRef.detectChanges();
          }
        }
      } else if (
        this.postData?.channelType === ChannelType.FBMessages ||
        this.postData?.channelType === ChannelType.InstagramMessages
      ) {
        const ticketTimings = this._ticketService.calculateTicketTimes(
          this.postData
        );
        if (ticketTimings.valDays) {
          if (Number(ticketTimings.valDays) <= 7 && Number(ticketTimings.valDays) != 0) {
            this.showreplyDaysCounter = true;
            const remainingDays = 7 - Number(ticketTimings.valDays);
            if (remainingDays === 1 || remainingDays === 0) {
              // start the counter
            } else {
              // this.replyexpirydays = String(remainingDays);
            }
            this.cdkRef.detectChanges();
          } else {
            // reply expired
          }
        }
      }
    }
  
    TimerExpired(): void {
      this.showreplyDaysCounter = false;
    }

  stripHtml(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    return tempDiv.textContent || tempDiv.innerText || '';
  }

  getTruncationIndexForVisibleText(html: string, visibleCharLimit: number): number {
    if (!html) return 0;

    let validTags: string[] = [
      "a",
      "abbr",
      "address",
      "area",
      "article",
      "aside",
      "audio",
      "b",
      "base",
      "bdi",
      "bdo",
      "blockquote",
      "body",
      "br",
      "button",
      "canvas",
      "caption",
      "cite",
      "code",
      "col",
      "colgroup",
      "data",
      "datalist",
      "dd",
      "del",
      "details",
      "dfn",
      "dialog",
      "div",
      "dl",
      "dt",
      "em",
      "embed",
      "fieldset",
      "figcaption",
      "figure",
      "footer",
      "form",
      "h",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "head",
      "header",
      "hr",
      "html",
      "i",
      "iframe",
      "img",
      "input",
      "ins",
      "kbd",
      "label",
      "legend",
      "li",
      "link",
      "main",
      "map",
      "mark",
      "meta",
      "meter",
      "nav",
      "noscript",
      "object",
      "ol",
      "optgroup",
      "option",
      "output",
      "p",
      "param",
      "picture",
      "pre",
      "progress",
      "q",
      "rp",
      "rt",
      "ruby",
      "s",
      "samp",
      "script",
      "section",
      "select",
      "slot",
      "small",
      "source",
      "span",
      "strong",
      "style",
      "sub",
      "summary",
      "sup",
      "svg",
      "table",
      "tbody",
      "td",
      "template",
      "textarea",
      "tfoot",
      "th",
      "thead",
      "time",
      "title",
      "tr",
      "track",
      "u",
      "ul",
      "var",
      "video",
      "wbr",
      "font",
      "o:p",
      "o"
    ];

    let visibleCount = 0;
    let i = 0;

    while (i < html.length && visibleCount < visibleCharLimit) {
      const char = html[i];

      if (char === '<') {
        // Extract potential tag name
        let j = i + 1;
        let tagName = '';
        let isClosingTag = false;

        // Check if it's a closing tag
        if (html[j] === '/') {
          isClosingTag = true;
          j++;
        }

        // Extract tag name (letters, numbers, colon, hyphen)
        while (j < html.length && /[a-zA-Z0-9:-]/.test(html[j])) {
          tagName += html[j].toLowerCase();
          j++;
        }

        // Check if this tag name is in our valid tags list
        if (validTags.includes(tagName)) {
          // Skip to the end of the tag
          while (i < html.length && html[i] !== '>') {
            i++;
          }
          if (i < html.length && html[i] === '>') {
            i++; // Skip the '>'
          }
          continue; // Don't increment i again since we already moved past the tag
        } else {
          // Not a valid HTML tag, treat '<' as visible text
          visibleCount++;
          if (visibleCount >= visibleCharLimit) {
            break; // Stop immediately when limit is reached
          }
        }
      } else if (char === '&') {
        // Handle HTML entities
        const remainingHtml = html.substring(i);
        const entityMatch = remainingHtml.match(/^&(?:[a-zA-Z0-9]+|#[0-9]+|#x[0-9a-fA-F]+);/);

        if (entityMatch) {
          // Skip the entire entity and count as one visible character
          i += entityMatch[0].length;
          visibleCount++;
          if (visibleCount >= visibleCharLimit) {
            break; // Stop immediately when limit is reached
          }
          continue; // Don't increment i again
        } else {
          // Not a valid entity, treat as visible text
          visibleCount++;
          if (visibleCount >= visibleCharLimit) {
            break; // Stop immediately when limit is reached
          }
        }
      } else {
        // Regular character
        visibleCount++;
        if (visibleCount >= visibleCharLimit) {
          i++; // Move to next position before breaking
          break; // Stop immediately when limit is reached
        }
      }

      i++;
    }

    return i;
  }


}
