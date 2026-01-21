import {
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
  Renderer2,
  signal,
  SimpleChanges,
  untracked,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { PostActionEnum } from 'app/core/enums/postActionEnum';
import { TicketSignalEnum } from 'app/core/enums/TicketSignalEnum';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { ApolloRequest } from 'app/core/models/crm/ApolloRequest';
import { BandhanRequest } from 'app/core/models/crm/BandhanRequest';
import { CRMMenu } from 'app/core/models/crm/CRMMenu';
import { ExtraMarksRequest } from 'app/core/models/crm/ExtraMarksRequest';
import { FedralRequest } from 'app/core/models/crm/FedralRequest';
import { MagmaRequest } from 'app/core/models/crm/MagmaRequest';
import { OctafxRequest } from 'app/core/models/crm/OctafxRequest';
import { RecrmRequest } from 'app/core/models/crm/RecrmRequest';
import { TataUniRequest } from 'app/core/models/crm/TataUniRequest';
import { TitanRequest } from 'app/core/models/crm/TitanRequest';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostSignalR } from 'app/core/models/menu/Menu';
import { postDetailWindow } from 'app/core/models/viewmodel/ChatWindowDetails';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { AccountService } from 'app/core/services/account.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { BrandSettingService } from 'app/social-inbox/services/brand-setting.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import moment from 'moment';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { CrmComponent } from '../../crm/crm.component';
import { ModalService } from './../../../../shared/services/modal.service';
import { CrmService } from './../../../services/crm.service';
import { FilterService } from './../../../services/filter.service';
import { PostUserinfoComponent } from './../../post-userinfo/post-userinfo.component';
import { PhoneMaskDirective } from 'app/social-inbox/directives/phone-mask.directive';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from 'app/shared/components';
import { notificationType } from 'app/core/enums/notificationType';
import { VoiceCallEventsEnum } from 'app/core/enums/VoiceCallEnum';
import { TimerService } from 'app/social-inbox/services/timer.service';
import { NavigationService } from 'app/core/services/navigation.service';
// import { AnimalWildfarePopupComponent } from '../../animal-wildfare-popup/animal-wildfare-popup.component';
import { AuthUser } from 'app/core/interfaces/User';
import { DreamsolRequest, DuraflexRequest } from 'app/core/models/crm/DreamsolRequest';
import { SidebarService } from 'app/core/services/sidebar.service';
import { LoopupcrmComponent } from '../../loopupcrm/loopupcrm.component';
import { BrandInfo } from 'app/core/models/viewmodel/BrandInfo';
import { TataCapitalRequest } from 'app/core/models/crm/TataCapitalRequest';
import { LookupcrmquickworkComponent } from '../../quickwork-manual/lookupcrmquickwork/lookupcrmquickwork.component';
import { QuickworkManualComponent } from '../../quickwork-manual/quickwork-manual.component';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { forkJoin } from 'rxjs';
import { DynamicCrmIntegrationService } from 'app/accounts/services/dynamic-crm-integration.service';
import { MatMenuTrigger } from '@angular/material/menu';
import { WorkflowService } from 'app/accounts/services/workflow.service';
import { ChannelImage } from 'app/core/enums/ChannelImgEnum';
import { AllMentionGroupView } from 'app/shared/components/post-options/post-options.component';
import { PushTicketToCrmComponent } from '../../push-ticket-to-crm/push-ticket-to-crm.component';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { MicrophonePermissionComponent } from 'app/shared/components/microphone-permission/microphone-permission.component';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { Priority } from 'app/core/enums/Priority';
import { CategoryFilterComponent } from '../../category-filter/category-filter.component';
import { Sentiment } from 'app/core/enums/Sentiment';
import { TicketMentionCategory } from 'app/core/interfaces/TicketMentionCategory';
import { CommonService } from 'app/core/services/common.service';
import { EditAiTicketLabelComponent } from '../../edit-ai-ticket-label/edit-ai-ticket-label.component';
import { OzontelService } from 'app/core/services/ozontel.service';
import { VoIPEnum } from 'app/shared/components/brand-select/brand-select.component';
import { TranslateService } from '@ngx-translate/core';

export enum WorkflowVersion {
  Workflow_v1 = 1,
  Workflow_v2 = 2
}

@Component({
    selector: 'app-post-head',
    templateUrl: './post-head.component.html',
    styleUrls: ['./post-head.component.scss'],
    standalone: false
})
export class PostHeadComponent implements OnInit, OnDestroy {
  @ViewChild('clickHoverMenuTrigger') clickHoverMenuTrigger: MatMenuTrigger;
  formDataForQuickworkCrm: any
  clickHoverMenuTriggerFlag:Boolean = false
  @Input() post: TicketClient;
  @Input() postData: BaseMention;
  @Input() ticketHistoryData: AllBrandsTicketsDTO;
  @Input() currentUser: AuthUser;
  @Input() pageType: PostsType;
  @Input() postDetailTab: LocobuzzTab;
  @Input() mentionOrGroupView: AllMentionGroupView = AllMentionGroupView.mentionView;
  @Input() unseenNoteCountList:[]=[]
  @Input() showParentPostHeader: boolean = false;
  @Input() AllCheckBoxes = false;
  @Input() openDetailOnClick = false;

  AllMentionGroupViewEnum = AllMentionGroupView
  //@Input() OnlyNumber:PhoneMaskDirective
  @Output() postActionTypeEvent = new EventEmitter<{
    actionType: number;
    params?: { [k: string]: any };
    param?:any;
  }>();
  filterBrandInfo:BrandList;
  channelGroupEnum = ChannelGroup;
  PostsType = PostsType;
  subs = new SubSink();
  isDisabled: boolean = true;
  lockUnlockNote: string;
  updateBreachCounterInzone: boolean = false;
  crmClass: string;
  contactNo = '';
  isVOIPAgent:boolean= false;
  isVOIPBrand: boolean = false;
  isTicketDetailOpen = false;
  breachInterval: ReturnType<typeof setInterval>;
  salesForceLoader: boolean;
  crmLable: string;
  clickhouseEnabled: boolean=false;
  tikTokAuthorDetails: any;
  spinner: boolean=false;
  unseenCountFlag: boolean=false;
  rotate: boolean = false;
  isbrandPost: boolean = false;
  isbulkselectall: boolean = false;
  disabledbrandmentioncheckbox: boolean = false;
  public get PostActionEnum(): typeof PostActionEnum {
    return PostActionEnum;
  }

  lookupshow: Boolean = false
  lookupshowquickwork: Boolean = false
  snapdealSridFound: Boolean = false
  quickworkSridFound: Boolean = false
  contactNumber: number = 0;
  contactNumberList = [];
  contactData;
  dialPad = false;
  showDialPad = true;
  openCallDetail = false;
  voiceEventEnum = VoiceCallEventsEnum;
  @ViewChild('contactNumber') phoneNumber: ElementRef;
  @ViewChild('padToggle') padToggle: ElementRef;
  @ViewChild('contactPadToggle') contactPadToggle: ElementRef;
  @ViewChild('dial') dial: ElementRef;
  minimalViewHead = false;
  @ViewChild('mainNav') mainNav: ElementRef<HTMLInputElement>;
  leftArrowSlideDisable = false;
  scrollLeft = false;
  scrollRight = false;
  selectedSortBy: string = 'DateCreated';
  activeWorkflow = false;
  // selectedSortBy: string;
  fetchDetails: boolean = false;
  socialHandle: boolean = false;
  channelImageEnum = ChannelImage
  channelType = ChannelType
  effectUpdateTicketAssignmentListSignal: EffectRef
  effectDialpadBooleanSignal: EffectRef
  effectUpdateCRMDetailsSignal: EffectRef
  effectUpdateTiktokAuthorDetailsSignal: EffectRef
  effectBulkCheckboxObsSignal: EffectRef;
  typeOfCrm:number;
  aiUpperCategoryListWithIcon = [
    { name: 'query', icon: 'help', sentimentColor: 'sentiment-background-neutral' },
    { name: 'appreciation', icon: 'thumb_up', sentimentColor: 'sentiment-background-positive' },
    { name: 'complaint', icon: 'feedback', sentimentColor: 'sentiment-background-negative' },
    // { name: 'suggestion', icon: 'lightbulb', sentimentColor: 'sentiment-background-neutral' },
    { name: 'request', icon: 'post_add', sentimentColor: 'sentiment-background-neutral' },
    // { name: 'news', icon: 'article', sentimentColor: 'sentiment-background-neutral' },
    // { name: 'marketing/campaign/promotions', icon: 'campaign', sentimentColor: 'sentiment-background-positive' },
    // { name: 'other', icon: 'more_horiz', sentimentColor: 'sentiment-background-neutral' },
    // { name: 'marketing', icon: 'local_offer', sentimentColor: 'sentiment-background-positive' },
    // { name: 'feedback', icon: 'lightbulb', sentimentColor: 'sentiment-background-neutral' },
    { name: 'opportunity', icon: 'rocket_launch', sentimentColor: 'sentiment-background-positive' },
    { name: 'brand promotion', icon: 'campaign', sentimentColor: 'sentiment-background-positive' },
    { name: 'Moderation', icon: 'admin_panel_settings', sentimentColor: 'sentiment-background-neutral' },
    { name: 'feedback/review', icon: 'lightbulb', sentimentColor: 'sentiment-background-neutral' }
  ];
  private clearSignal = signal<boolean>(true);
  public defaultLayout: boolean = false;
  changeTicketPriorityApi: any;
  ticketPriority: string;
  LanguageList: any[] = [];
  LanguageListCopy: any[] = [];
  selectedLanguage: string = "";
  assignMentionORTagCategoryEnabled: boolean;
  @Input() sentimentBackgroundColorClass: string = 'sentiment-background-neutral';
  checkedBox: boolean = false;
  constructor(
    private _postDetailService: PostDetailService,
    private _modalService: ModalService,
    private _dialog: MatDialog,
    private _filterService: FilterService,
    private _crmService: CrmService,
    private _brandsettingService: BrandSettingService,
    private _accountService: AccountService,
    private ticketService: TicketsService,
    private _ngZone: NgZone,
    private _ticketSignalrService: TicketsignalrService,
    private _ticketService: TicketsService,
    private _voip: VoiceCallService,
    private renderer: Renderer2,
    private _cdr: ChangeDetectorRef,
    private _snackBar: MatSnackBar,
    private footerService: FootericonsService,
    private timerService:TimerService,
    private navigationService:NavigationService,
    private _sidebar : SidebarService,
    private _userDetailService : UserDetailService,
    private _dynamicCrmIntegrationService: DynamicCrmIntegrationService,
    private _workflowService: WorkflowService,
    private _replyService: ReplyService,
    private exotelService:ExotelService,
    private commonService: CommonService,
    private ozontelService:OzontelService,
     private translate: TranslateService
  ) {

    // this.renderer.listen('window', 'click', (e: Event) => {
    //   // console.log('target ', e.target);
    //   if (this.dialPad == true) {
    //     if (
    //       e.target !== this.padToggle.nativeElement &&
    //       e.target !== this.dial.nativeElement && e.target !== this.contactPadToggle.nativeElement
    //     ) {
    //       this.dialPad = false;
    //       console.log('dialpad boolean ', this.dialPad);
    //     }
    //   }
    // });

    let onLoadTicketAssignment = true;

    this.effectUpdateTicketAssignmentListSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.updateTicketAssignmentListSignal() : untracked(() => this._ticketService.updateTicketAssignmentListSignal());
      if (!onLoadTicketAssignment && value && this.clearSignal()) {
        this.updateTicketAssignmentListSignalChange(value);
      } else {
        onLoadTicketAssignment = false;
      }
    }, { allowSignalWrites: true });

    let onLoadDialpadBoolean = true;

    this.effectDialpadBooleanSignal = effect(() => {
      const dialpadBoolean = this.clearSignal() ? this._postDetailService.dialpadBooleanSignal() : untracked(() => this._postDetailService.dialpadBooleanSignal());
      if (this.clearSignal()){
        this.dialPad = dialpadBoolean;
      }else {
        onLoadDialpadBoolean = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadCRMDetails = true;
    this.effectUpdateCRMDetailsSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.updateCRMDetailsSignal() : untracked(() => this._ticketService.updateCRMDetailsSignal());
      if (!onLoadCRMDetails && value && this.clearSignal()) {
       this.updateCRMDetailsSignalChange(value)
      } else {
        onLoadCRMDetails = false;
      }
    }, { allowSignalWrites: true });

    let onLoadTiktokAuthor = true;
    this.effectUpdateTiktokAuthorDetailsSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.updateTiktokAuthorDetailsSignal() : untracked(() => this._ticketService.updateTiktokAuthorDetailsSignal());
      if (!onLoadTiktokAuthor && value && this.clearSignal()) {
        if (this.postData?.author?.socialId == value?.author?.socialId) {
          this.tikTokAuthorDetails = value?.author?.profileDetails;
          this.postData.author.profileDetails.isUpdated = value?.author?.profileDetails?.isUpdated
        }
      } else {
        onLoadTiktokAuthor = false;
      }
    }, { allowSignalWrites: true });

    let onLoadCheckboxObs = true;
        this.effectBulkCheckboxObsSignal = effect(() => {
          const value = this.clearSignal() ? this._ticketService.bulkCheckboxObsSignal() : untracked(() => this._ticketService.bulkCheckboxObsSignal());
          if (!onLoadCheckboxObs && value && this.clearSignal()) {
            if (value?.guid === this.postDetailTab?.guid) {
              if (this.ticketHistoryData?.showcheckbox) {
                this.checkedBox = value.checked;
                // this.cdk.detectChanges();
              }
            }
          } else {
            onLoadCheckboxObs = false;
          }
        }, { allowSignalWrites: true });
  }

  isPostActive = true;
  fblocationdetail: string = '';
  mentionBackGround:string = 'White';
  absolutTime: boolean = false;
  colour: string = '';
  userProfileImg: string = '';
  initials: string = '';
  clickHoverMenuTimeout: any;
  GetCrmLeftMenuapi: any;
  GetBrandCrmRequestDetailsapi: any;
  GetFBlocationInfoapi: any;
  CreateSalesForceCrmapi: any;
  generateAnimalWildFareCrmTokenapi: any;
  GetExcecutedWorkflowDetailsapi: any;
  getTiktokDetailedViewapi: any;
  getSRDetailsapi: any;
  getCrmFieldFormapi: any;
  colorCode:string=''
  priorityClass: string;
  statusClass: string;
  GetLangaueListApi: any;
  openProfileMoreOptions = false;
  aiUpperCategoryEnabled: boolean = false;
  ticketTagList = [];


  ngOnInit(): void {
    const message: any[] = [this.channelType.DirectMessages, this.channelType.FBMessages, this.channelType.LinkedinMessage, this.channelType.InstagramMessages, this.channelType.TelegramMessages, this.channelType.TelegramGroupMessages, this.channelType.WhatsApp, this.channelType.Email]
    const comment: any[] = [this.channelType.RedditComment, this.channelType.FBComments, this.channelType.FBMediaComments, this.channelType.TeamBHPComments, this.channelType.TeamBHPOtherPostsComments, this.channelType.YouTubeComments, this.channelType.InstagramComments, this.channelType.GoogleComments, this.channelType.ReviewWebsiteComments, this.channelType.ECommerceComments, this.channelType.MyGovComments, this.channelType.LinkedInComments, this.channelType.LinkedInMediaComments, this.channelType.AutomotiveIndiaOtherPostsComments, this.channelType.TikTokComments, this.channelType.SitejabberComments, this.channelType.FbGroupComments, this.channelType.QuoraComment, this.channelType.PantipComments, ...((this.postData?.parentPostSocialID != '0' && this.postData?.parentPostSocialID != null && this.postData?.channelGroup == ChannelGroup.Twitter) ? [this.postData?.parentPostSocialID] : [])]
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
    this.ticketPriority = Priority[this.postData?.ticketInfo?.ticketPriority];
    const result = this.footerService.togglePostfootClasses(
      this.postData,
      this.ticketPriority,
      this.post
    );
    this.crmClass = result.crmClass;
    this.priorityClass = result?.priorityClass ? result?.priorityClass : '';
    this.statusClass = result?.statusClass ? result?.statusClass : '';
    this.colour = localStorage.getItem('theme');
    this.subs.add(
    this._sidebar.changesColor.subscribe((res) => {
      if (res.length > 0) {
        this.colour = res;
        if (this.pageType == this.PostsType.Tickets || this.pageType == this.PostsType.TicketHistory || this.pageType == this.PostsType.Mentions) {
          if (comment.includes(this.post?.channeltype) || comment.includes(this.postData?.parentPostSocialID)) {
            if (this.colour) {
              this.mentionBackGround = this.colour == 'light' ? '#E1F2FF' : '#29538D';
            }
            // this.mentionBackGround = '#D0EAFF'; 
          }
          else if (message.includes(this.post?.channeltype)) {
            if (this.colour) {
              this.mentionBackGround = this.colour == 'light' ? '#F6F0FF' : '#5B288D';
            }
            // this.mentionBackGround = '#F6F0FF';
          }
          else if (![...comment, ...message].includes(this.post?.channeltype) && !this.post?.isBrandPost) {
            if (this.colour) {
              this.mentionBackGround = this.colour == 'light' ? '#FFF7E3' : '#7F4919';
            }
            // this.mentionBackGround = '#FFF3E3';
          }
        }
        else {
          this.mentionBackGround = 'White';
        }
        this._cdr.detectChanges();
      }
    })
    );
    if (this.pageType == this.PostsType.Tickets || this.pageType == this.PostsType.TicketHistory || this.pageType == this.PostsType.Mentions) {
      if (comment.includes(this.post?.channeltype) || comment.includes(this.postData?.parentPostSocialID)) {
        if (this.colour) {
          this.mentionBackGround = this.colour == 'light' ? '#E1F2FF' : '#29538D';
        }
        // this.mentionBackGround = '#D0EAFF'; 
      }
      else if (message.includes(this.post?.channeltype)) {
        if (this.colour) {
          this.mentionBackGround = this.colour == 'light' ? '#F6F0FF' : '#5B288D';
        }
        // this.mentionBackGround = '#F6F0FF';
      }
      else if (![...comment, ...message].includes(this.post?.channeltype) && !this.post?.isBrandPost) {
        if (this.colour) {
          this.mentionBackGround = this.colour == 'light' ? '#FFF7E3' : '#7F4919';
        }
        // this.mentionBackGround = '#FFF3E3';
      }
    }
    else {
      this.mentionBackGround = 'White';
    }
    this.isVOIPAgent = this.currentUser?.data?.user?.isVOIPAgent;
    this.aiUpperCategoryEnabled = this.currentUser?.data?.user?.isBasicEnrichmentEnabled ? true : false;
    this.isVOIPBrand = this.ticketHistoryData?.isVOIPBrand ? this.ticketHistoryData?.isVOIPBrand : false;
    const mention = this.postData;
    this.contactData = this.postData?.channelGroup == ChannelGroup.Voice ? this.postData?.author?.socialId : this.postData?.author?.locoBuzzCRMDetails?.phoneNumber
    // if (this._postDetailService.postDetailPage){
    //   this.showDialPad=false;
    // }
    if (this._postDetailService.postDetailPage) {
      /* this._postDetailService.dialpadBoolean.next(false) */
      this._postDetailService.dialpadBooleanSignal.set(false)
    }

    this.subs.add(
      this._voip.onUpdatePhoneNumber.subscribe(number=>{
        this.contactData = number;
      })
    )

    if (this.contactData?.includes('+91')) {
      this.contactNo = this.contactData;
    } else {
      this.contactNo = this.contactData ? '+91' + this.contactData : '';
    }
    const brandList = this._filterService.fetchedBrandData;
    if (brandList) {
      const currentBrandObj = brandList.find((obj) => Number(obj?.brandID) === Number(mention?.brandInfo?.brandID));
      const currentBrand =
        currentBrandObj ? currentBrandObj : undefined;

      if (currentBrand) {
        this.ticketHistoryData = this._brandsettingService.GetBrandSettings(
          currentBrand,
          this.ticketHistoryData
        );

        if (
          currentBrand.isSLAFLRBreachEnable &&
          this.pageType === PostsType.Tickets
        ) {
          this.ticketHistoryData.SLACounterStartInSecond =
            currentBrand.slaCounterStartInSecond;
          this.ticketHistoryData.typeOfShowTimeInSecond =
            currentBrand.typeOfShowTimeInSecond;
          if (currentBrand.isEnableShowTimeInSecond) {
            this.ticketHistoryData.iSEnableShowTimeInSecond = 1;
          } else {
            this.ticketHistoryData.iSEnableShowTimeInSecond = 0;
          }
          if (
            +this.currentUser.data.user.role === UserRoleEnum.Agent ||
            +this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
            +this.currentUser.data.user.role === UserRoleEnum.LocationManager ||
            +this.currentUser.data.user.role === UserRoleEnum.TeamLead
          ) {
            if (
              mention.ticketInfo.status === TicketStatus.Open ||
              mention.ticketInfo.status === TicketStatus.PendingwithAgent ||
              mention.ticketInfo.status === TicketStatus.CustomerInfoAwaited ||
              mention.ticketInfo.status === TicketStatus.PendingWithBrand ||
              mention.ticketInfo.status === TicketStatus.PendingwithCSD ||
              mention.ticketInfo.status ===
                TicketStatus.RejectedByBrandWithNewMention ||
              mention.ticketInfo.status === TicketStatus.RejectedByBrand ||
              mention.ticketInfo.status === TicketStatus.ApprovedByBrand ||
              mention.ticketInfo.status ===
                TicketStatus.PendingwithCSDWithNewMention ||
              mention.ticketInfo.status === TicketStatus.OnHoldAgent ||
              mention.ticketInfo.status === TicketStatus.OnHoldBrand ||
              mention.ticketInfo.status === TicketStatus.OnHoldCSD
            ) {
              if (
                mention.ticketInfo.flrtatSeconds == null ||
                mention.ticketInfo.flrtatSeconds <= 0
              ) {
                if (mention.ticketInfo.tattime > 0) {
                  this.ticketHistoryData.isbreached = true;
                } else if (mention.ticketInfo.tattime <= 0) {
                  /*&& item.TATTIME >= -SLAMinutes*/
                  this.ticketHistoryData.isabouttobreach = true;
                  this.updateBreachCounterInzone =
                    this.pageType === PostsType.Tickets ||
                    this.pageType === PostsType.Mentions;

                  // this._ngZone.runOutsideAngular(() => {
                  //   this.breachInterval = setInterval(() => {
                  //     this.aboutToBreach(mention);
                  //   }, 1000);
                  // });
                }
              }
            }
          }
        }
      }
      this.ticketHistoryData = this.footerService.setGmbLocationAndLocality(
        this.ticketHistoryData,
        this.postData
      );
      this.subs.add(
        this._ticketSignalrService.openTicketDetailSignalCall.subscribe(
          (postSignalObj) => {
            if (
              postSignalObj &&
              postSignalObj.ticketId &&
              this.postData.ticketInfo.ticketID === postSignalObj.ticketId &&
              postSignalObj.signalId ===
                TicketSignalEnum.LockUnlockTicketSignalR
            ) {
              if (
                this.pageType == PostsType.Tickets ||
                this.pageType == PostsType.Mentions
              ) {
                this.executeSignalCall(postSignalObj);
              }
            }
          }
        )
      );

      this.subs.add(
        this.timerService.timerSubscription.subscribe((res)=>{
          if(res)
          {
            if (this.ticketHistoryData?.isabouttobreach) {
              this._ngZone.runOutsideAngular((res)=>{
                this.aboutToBreach(mention)
                this._cdr.detectChanges();
              })
            }
          }
        })
      )
      this.typeOfCrm = currentBrandObj.typeOfCRM
    }
    // this.subs.add(
    //   this._ticketSignalrService.voipSignalCall.subscribe((voipResponse) => {
    //     this._voip.voipSignalR(voipResponse);
    //   })
    // );
    
    const value = this._ticketService.updateTicketAssignmentListSignal();
    if (value) {
      this.updateTicketAssignmentListSignalChange(value);
    }
    /* this.subs.add(
      this._ticketService.updateTicketAssignmentList.subscribe((data) => {
        if (data) {
          if (data.guid == this.postDetailTab?.guid) {
            if (data.tagID == this.postData.tagID) {
              if (
                data.escalateUser &&
                (data.escalateUser.teamName || data.escalateUser.agentName)
              ) {
                this.post?.assignTo = data.escalateUser.teamName
                  ? data.escalateUser.agentName +
                    ` (${data.escalateUser.teamName})`
                  : data.escalateUser.agentName;
              }
              if (data.fromTeam && data.fromTeam.teamName) {
                this.post?.assignTo = data.fromTeam.teamName;
              }
              this._cdr.detectChanges();
              // this._ticketService.updateTicketAssignmentList.next(null);
              this._ticketService.updateTicketAssignmentListSignal.set(null);
            }
          }
        }
      })
    ); */

    if (this.ticketHistoryData?.crmcreatereqpop) {
      if (this.postData.ticketInfo.srid !== null) {
        this.crmClass = 'colored__red';
        if (this.postData.ticketInfoCrm.isPartyID > 0) {
          this.crmClass = 'colored__yellow--dark';
        }
      }
    }
    this.subs.add(
      this._ticketService.openPostDetailWindow
        .pipe(filter(() => this.ticketHistoryData?.isabouttobreach))
        .subscribe((response: postDetailWindow) => {
          if (response) {
            this.isTicketDetailOpen = response.openState;
          }
        })
    );
    // requestAnimationFrame(() => {
    //   if (this.ResponsiveTooltip.nativeElement.clientWidth < 38) {
    //     this.isDisabled = false;
    //   }
    // });
    const dialpadBoolean = this._postDetailService.dialpadBooleanSignal();
    this.dialPad = dialpadBoolean;
    /* this.subs.add(
      this._postDetailService.dialpadBoolean.subscribe((response) => {
        this.dialPad = response;
      })
    ); */
    /* this.subs.add(
      this.ticketService.updateCRMDetails.subscribe((res) => {
        if (this.postData.ticketInfo.tagID == res.TagID){
          if (res?.SrID){
            // this.postData.ticketInfo.leadID = res?.leadID;
            // this.post?.leadID = res?.leadID;
            this.postData.ticketInfo.srid = res.SrID;
            this.post?.srID = res?.SrID;
            if (this.postData?.ticketInfo?.leadID) {
              this.post?.leadID = this.postData?.ticketInfo?.leadID;
              this._cdr.detectChanges();
            }
          }
          if(res?.leadID){
            this.postData.ticketInfo.leadID = res?.leadID;
            this.post?.leadID = res?.leadID;
            if (this.postData?.ticketInfo?.srid){
              this.post?.srID = this.postData?.ticketInfo?.srid;
              this._cdr.detectChanges();
            }
          }
        }
      })
    ); */

    this.subs.add(
      this._sidebar.minimalViewSource.subscribe(res => {
        if (res == true || res == false) {
          this.minimalViewHead = res;
          this._cdr.detectChanges();
        }
      })
    )
    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1)
    {
      this.clickhouseEnabled = true
    if (this.postData && this.postData?.author?.socialId =='0') {
      this.ticketHistoryData.isInfluencermarked = false;
    }
      if (this.postData?.channelType == ChannelType.FbGroupComments || this.postData?.channelType == ChannelType.FbGroupPost)
        {
          this.postData.fbPageName=''
        }
  }
    if (this.postData && this.postData?.author && this.postData?.author?.markedInfluencerCategoryID && !this.ticketHistoryData?.isInfluencermarked && !this.clickhouseEnabled) {
      this.ticketHistoryData.isInfluencermarked = true;
    }

    if (this.postData && this.postData?.author && this.postData?.author?.influencerDetailsList?.length>0 && !this.ticketHistoryData?.isInfluencermarked && this.clickhouseEnabled) {
      this.ticketHistoryData.isInfluencermarked = true;
    }
    
    this.crmLable = this.currentUser?.data?.user?.categoryId == 1597 ?'Assign Case To Volunteer':'CRM'

    this.subs.add(
      this.ticketService.animalWildFareObs.subscribe((res) => {
        if (res) {
          if (res?.data?.TagID==this.postData?.tagID)
          {
          this.postData.ticketInfo.srid = res?.data?.SRID;
          this._cdr.detectChanges();
          }
        }
      }
      )
    )
    if (this.postData?.aiTicketIntelligenceModel?.ticketTagging) {
      const ticketTagList = JSON.parse(this.postData?.aiTicketIntelligenceModel?.ticketTagging);
      if (ticketTagList && ticketTagList.length) {
        this.ticketTagList = [];
        ticketTagList.forEach((res, index) => {
          if (res.length) {
            if (typeof res[0] != 'string' && Object?.keys(res[0])?.length > 0 && 'tagName' in res[0]) {
              res[0] = res[0]?.tagName
            }
            this.ticketTagList.push({ tagName: res[0], score: res[1] });
            if ((index + 1) == ticketTagList.length) {
              this._cdr.detectChanges();
            }
          }
        })
      }
    }

    /* this.subs.add(
      this._ticketService.updateTiktokAuthorDetails.subscribe((res)=>{
        if(res)
        {
          if(this.postData?.author?.socialId == res?.author?.socialId)
          {
            this.tikTokAuthorDetails = res?.author?.profileDetails;
            this.postData.author.profileDetails.isUpdated = res?.author?.profileDetails?.isUpdated

          }
        }
      })
    ) */

     const followCount:any= this.abbreviateNumber(this.post?.Userinfo.followers)
    if (this.post && this.post?.Userinfo) this.post.Userinfo.followers = followCount
    if (this.navigationService?.currentSelectedTab && this.navigationService?.currentSelectedTab?.Filters && this.navigationService?.currentSelectedTab?.Filters?.orderBYColumn){
      this.selectedSortBy = this.navigationService?.currentSelectedTab?.Filters?.orderBYColumn;
    }

    if(this.postData?.author?.profileDetails)
    {
      this.tikTokAuthorDetails = this.postData?.author?.profileDetails;
      if (this.tikTokAuthorDetails?.userLocation && this.tikTokAuthorDetails?.userCountry) {
        this.tikTokAuthorDetails.locationName = this.tikTokAuthorDetails.userLocation + ', ' + this.tikTokAuthorDetails.userCountry
      } else if (this.tikTokAuthorDetails?.userLocation) {
        this.tikTokAuthorDetails.locationName = this.tikTokAuthorDetails.userLocation
      } else if (this.tikTokAuthorDetails?.userCountry) {
        this.tikTokAuthorDetails.locationName = this.tikTokAuthorDetails.userCountry
      }
    }
    this._cdr.detectChanges();

    this.subs.add(
      this._ticketService.customTabChange.subscribe((res) => {
        if (Object.keys(res).length > 0) {
          if (this.navigationService?.currentSelectedTab && this.navigationService?.currentSelectedTab?.Filters && this.navigationService?.currentSelectedTab?.Filters?.orderBYColumn) {
            this.selectedSortBy = this.navigationService?.currentSelectedTab?.Filters?.orderBYColumn;
          }
          this._cdr.detectChanges();
        }
      })
    )
    this.socialHandle = this.post?.Userinfo?.screenName && this.postData?.channelGroup != this.channelGroupEnum.Survey && (this.post?.Userinfo?.name?.toLowerCase() != 'anonymous' || (this.post?.Userinfo?.name?.toLowerCase() == 'anonymous' && this.postData?.channelGroup != this.channelGroupEnum.Instagram && this.postData?.instagramPostType != 5 && this.postData?.instagramPostType != 7));
    
    this.absolutTime = localStorage.getItem('absolutTimeFlag') == 'true' ? true : false; 
    this.subs.add(
      this._ticketService.absolutTimeObs.subscribe((res) => {
        this.absolutTime = res.absolutTimeFlag;
        this._cdr.detectChanges();
      })
    )
    this.subs.add(
      this._postDetailService.sortHandTicketTimeUpdate.subscribe((status) => {
        if (status) {
          this.post = this._ticketService.mapPostByChannel(this.postData, this.pageType == PostsType.TicketHistory ? null : this.navigationService?.currentSelectedTab?.Filters?.isModifiedDate);
          this._cdr.detectChanges();
        }
      })
    )
    this.userProfileImg = this.post?.Userinfo?.image?.includes('assets/images/agentimages/sample-image.svg') ? 'initials' : this.post?.Userinfo?.image;
    this.initials = this.ticketService.getInitials(this.post?.Userinfo?.name);
    this.colorCode = this._ticketService.getColorFromName(this.post?.Userinfo?.name);
    if(this.unseenNoteCountList?.some((x)=>x==this.postData?.ticketInfo?.ticketID))
    {
      this.unseenCountFlag = true;
    }

    this.subs.add(
      this._ticketService.hideUnssenNoteObs.subscribe((res) => {
        if (res) {
          if(res?.guid==this.postDetailTab?.guid)
            {
              if(!(res?.ticketList?.some((x)=>x==this.postData?.ticketInfo?.ticketID)))
              {
                this.unseenCountFlag = false;
              }
            }
        }
      })
    )

    if (this.postData?.channelGroup == ChannelGroup.Voice) {
      this.userProfileImg = 'assets/images/agentimages/sample-image.svg'
    }
    this.assignMentionORTagCategoryEnabled =
      this.currentUser?.data?.user?.actionButton?.assignMentionEnabled;
    this.subs.add(
        this._ticketService.updateChildkMentionSeenUnseen.subscribe((res) => {
          if (!this.showParentPostHeader && this.pageType == PostsType.TicketHistory) {
            if (res?.postData) {
              this.postData.categoryMap = res?.postData?.categoryMap;
              this.postData.upperCategory = res?.postData?.upperCategory
              this.categorymapdisplay(this.postData)
            }
          }
        })
      )

    this.subs.add(
      this._ticketService.unselectbulkpostTrigger.subscribe((flag: any) => {
        this.AllCheckBoxes = flag;
        this.isbulkselectall = flag;
        this.disabledbrandmentioncheckbox = false;
        this._cdr.detectChanges();
      })
    );

    this.subs.add(
      this._ticketService.selectExcludeBrandMention.subscribe((flag: any) => {
        if (flag) {
          const isexcludebrand = localStorage.getItem(
            'isexcludebrandmention_' + this.currentUser?.data?.user?.userId
          );
          this.isbrandPost = this.postData?.isBrandPost;
          if (isexcludebrand === '1') {
            if (this.isbrandPost) {
              this.isbulkselectall = false;
              this.disabledbrandmentioncheckbox = true;
            }
          }
        } else {
          this.disabledbrandmentioncheckbox = false;
        }
        this._cdr.detectChanges();
      })
    );

    this.subs.add(
      this._ticketService.excludepostSelectTrigger.subscribe((count) => {
        if (count >= 2) {
          const isexcludebrand = localStorage.getItem(
            'isexcludebrandmention_' + this.currentUser?.data?.user?.userId
          );
          this.isbrandPost = this.postData?.isBrandPost;
          if (isexcludebrand === '1') {
            if (this.isbrandPost) {
              this.isbulkselectall = false;
              this.disabledbrandmentioncheckbox = true;
            }
          } else {
            if (this.AllCheckBoxes) {
              this.isbulkselectall = true;
            }
          }
        } else {
          if (this.AllCheckBoxes) {
            this.isbulkselectall = true;
          }
          this.disabledbrandmentioncheckbox = false;
        }
      })
    );

    const isexcludebrandmention = localStorage.getItem(
      'isexcludebrandmention_' + this.currentUser?.data?.user?.userId
    );
    this.isbrandPost = this.postData?.isBrandPost;
    if (isexcludebrandmention === '1') {
      if (this.isbrandPost) {
        this.disabledbrandmentioncheckbox = true;
      } else {
        this.disabledbrandmentioncheckbox = false;
      }
      if (this.AllCheckBoxes && !this.isbrandPost) {
        this.isbulkselectall = true;
      } else {
        this.isbulkselectall = false;
      }
    } else {
      this.disabledbrandmentioncheckbox = false;
      if (this.AllCheckBoxes) {
        this.isbulkselectall = true;
      } else {
        this.isbulkselectall = false;
      }
    }

    if (this._ticketService?.bulkMentionChecked?.some((obj) => obj?.guid == this.postDetailTab?.guid && obj?.mention?.tagID == this.postData?.tagID)) {
      this.checkedBox = true
    } else {
      this.checkedBox = false
    }

    this.subs.add(
      this._ticketService.uncheckedSelectedTickets.subscribe((res) => {
        if (res == this.postDetailTab?.tab?.guid) {
          if (!this.AllCheckBoxes) {
            if (this._ticketService.selectedPostList.some((number) => number == this.postData?.ticketID)) {
              this.checkedBox = true
            } else {
              this.checkedBox = false
            }
          }
        }
      })
    )
  }

  getCategorysIcons(category: string): string {
    if (category){
      const categoryIcons = this.aiUpperCategoryListWithIcon.find(res => res?.name.toLowerCase() == category.toLowerCase());
      if (categoryIcons) {
        return categoryIcons.icon;
      } else {
        return null;
     } 
    } else {
      return null;
    }
  }

  getCategorysSentiment(category: string, aI_Category: boolean): string {
    if (category) {
      const categorySentiment = this.aiUpperCategoryListWithIcon.find(res => res?.name.toLowerCase() == category.toLowerCase());
      if (categorySentiment && aI_Category) {
        return categorySentiment?.sentimentColor;
      } else {
        return 'manual-category-sentiment-color';
      }
    } else {
      return 'manual-category-sentiment-color';
    }
  }

  // getInitials() {
  //   const name = this.post?.Userinfo?.name?.trim();
  //   const userName = name?.replace(/[^a-zA-Z ]/g, '')?.replace(/\s+/g, ' ');
  //   const parts = userName?.split(' ');
  //   if (parts?.length > 1) {
  //     this.initials = `${parts[0][0]?.toUpperCase()}${parts[parts?.length - 1][0]?.toUpperCase()}`;
  //   } else if (parts?.length) {
  //     this.initials = parts[0]?.slice(0, 2)?.toUpperCase();
  //   }
  // }

  visibilityChangeHandler(status) {
    this.isPostActive = status;
  }

  openTicketTagDialog(): void {
    const dialogRef = this._dialog.open(EditAiTicketLabelComponent, {
      width: '40vw',
      panelClass: ['responsive__modal--fullwidth'],
      disableClose: false,
      data: { brandInfo: this.postData?.brandInfo, selectedTagList: this.ticketTagList, ticketID: this.postData?.ticketInfo.ticketID }
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        const ticketTagList = JSON.parse(dialogResult);
        if (ticketTagList && ticketTagList.length) {
          this.ticketTagList = [];
          ticketTagList.forEach(res => {
            if (res.length) {
              if (typeof res[0] != 'string' && Object.keys(res[0]).length > 0 && 'tagName' in res[0]) {
                res[0] = res[0]?.tagName
              }
              this.ticketTagList.push({ tagName: res[0], score: res[1] });
            }
          })
        }
        this._cdr.detectChanges();
      }
    });
  }
  executeSignalCall(signalObj: PostSignalR): void {
    if (signalObj.signalId === TicketSignalEnum.LockUnlockTicketSignalR) {
      if (
        signalObj.message.status === 'U' ||
        signalObj.message.status === 'L'
      ) {
        this.lockUnlockNote = `${signalObj.message.Name} ${this.translate.instant('started-working-on-this-case')}`;
      } else {
        this.lockUnlockNote = '';
      }
      this._cdr.detectChanges();
    }
  }

  private aboutToBreach(mention): void {
    const utcdate = moment.utc();
    const breachtimeutc = moment.utc(mention.ticketInfo.tatflrBreachTime);
    const h = moment.utc(new Date(null));
    const timeString = breachtimeutc.diff(h, 'seconds');
    const ticketid = mention.ticketInfo.ticketID;
    const slacounterstartinsecond =
      this.ticketHistoryData?.SLACounterStartInSecond;
    const isenableshowtimeinsecond =
      this.ticketHistoryData?.iSEnableShowTimeInSecond;
    const typeofshowtimeinsecond =
      this.ticketHistoryData?.typeOfShowTimeInSecond;
    const currenttime = moment();
    const abouttobreach = moment.utc(+timeString * 1000).local();
    let timetobreach = moment(abouttobreach, 'DD/MM/YYYY').from(
      moment(currenttime, 'DD/MM/YYYY')
    );

    const diffTime = +abouttobreach - +currenttime;
    let duration = moment.duration(diffTime, 'milliseconds');
    const interval = 1000;

    const timeminandsec = +slacounterstartinsecond / 60;
    let mincounter = Math.round(timeminandsec);

    if (mincounter === 0) {
      mincounter = 3;
    }

    duration = moment.duration(+duration - +interval, 'milliseconds');

    if (isenableshowtimeinsecond === 1) {
      if (typeofshowtimeinsecond === 0) {
        // always show
        if (
          duration.hours() > 0 &&
          duration.minutes() > 0 &&
          duration.seconds() > 0
        ) {
          timetobreach =
            duration.hours() +
            'h ' +
            duration.minutes() +
            'm ' +
            duration.seconds() +
            's';
        } else if (
          duration.hours() <= 0 &&
          duration.minutes() > 0 &&
          duration.seconds() > 0
        ) {
          timetobreach = duration.minutes() + 'm ' + duration.seconds() + 's';
        } else if (
          duration.hours() <= 0 &&
          duration.minutes() <= 0 &&
          duration.seconds() > 0
        ) {
          timetobreach = duration.seconds() + 's';
        } else if (
          duration.hours() < 0 &&
          duration.minutes() < 0 &&
          duration.seconds() < 0
        ) {
          timetobreach =
            -duration.hours() +
            'h ' +
            -duration.minutes() +
            'm ' +
            -duration.seconds() +
            's ago';
        } else if (
          duration.hours() === 0 &&
          duration.minutes() < 0 &&
          duration.seconds() < 0
        ) {
          timetobreach =
            -duration.minutes() + 'm' + -duration.seconds() + 's ago';
        } else if (
          duration.hours() === 0 &&
          duration.minutes() === 0 &&
          duration.seconds() < 0
        ) {
          timetobreach = -duration.seconds() + 's ago';
        }
      } else {
        // below min counter
        if (
          duration.hours() === 0 &&
          duration.minutes() < mincounter &&
          duration.seconds() > 0
        ) {
          if (
            duration.hours() > 0 &&
            duration.minutes() > 0 &&
            duration.seconds() > 0
          ) {
            timetobreach =
              duration.hours() +
              'h ' +
              duration.minutes() +
              'm ' +
              duration.seconds() +
              's';
          } else if (
            duration.hours() <= 0 &&
            duration.minutes() > 0 &&
            duration.seconds() > 0
          ) {
            timetobreach = duration.minutes() + 'm ' + duration.seconds() + 's';
          } else if (
            duration.hours() <= 0 &&
            duration.minutes() <= 0 &&
            duration.seconds() > 0
          ) {
            timetobreach = duration.seconds() + 's';
          } else if (
            duration.hours() < 0 &&
            duration.minutes() < 0 &&
            duration.seconds() < 0
          ) {
            timetobreach =
              -duration.hours() +
              'h ' +
              -duration.minutes() +
              'm ' +
              -duration.seconds() +
              's ago';
          } else if (
            duration.hours() === 0 &&
            duration.minutes() < 0 &&
            duration.seconds() < 0
          ) {
            timetobreach =
              -duration.minutes() + 'm ' + -duration.seconds() + 's ago';
          } else if (
            duration.hours() === 0 &&
            duration.minutes() === 0 &&
            duration.seconds() < 0
          ) {
            timetobreach = -duration.seconds() + 's ago';
          }
        }
      }
    }
    if (
      this.updateBreachCounterInzone &&
      this.ticketHistoryData?.timetobreach !== timetobreach &&
      !this.isTicketDetailOpen &&
      this.isPostActive
    ) {
      this._ngZone.run(() => {
        this.ticketHistoryData.timetobreach = timetobreach;
      });
    } else {
      this.ticketHistoryData.timetobreach = timetobreach;
    }

    if (timetobreach.indexOf('ago') > -1) {
      this.ticketHistoryData.isbreached = true;
      this.ticketHistoryData.isabouttobreach = false;
      this.updateBreachCounterInzone = false;
    }
  }

  assignTicket(): void {
    const allowAssignement =
      this.currentUser.data.user.actionButton.assignmentEnabled;
    if ((this.currentUser?.data?.user?.role === UserRoleEnum.Agent || this.currentUser?.data?.user?.role === UserRoleEnum.TeamLead) && allowAssignement) {
      this.postActionTypeEvent.emit({
        actionType: PostActionEnum.assignTickets,
      });
      return
    }
    if (
      this.postData.ticketInfo.status != TicketStatus.Close &&
      this.currentUser?.data?.user?.role !== UserRoleEnum.Agent &&
      this.currentUser?.data?.user?.role !== UserRoleEnum.TeamLead &&
      this.currentUser.data.user.actionButton.allowAssignment
    ) {
      this.postActionTypeEvent.emit({
        actionType: PostActionEnum.assignTickets,
      });
    }
  }

  openUserProfile(tabIndex?: number): void {
    this.openProfileMoreOptions = false;
    this._postDetailService.postObj = this.postData;
    // if (this.postData.channelGroup != this.channelGroupEnum.Email) {
      /* this._postDetailService.currentPostObject.next(
        this.postData.ticketInfo.ticketID
      ); */
    this._postDetailService.currentPostObjectSignal.set( this.postData.ticketInfo.ticketID );
    // } else {
    // }

    const sideModalConfig = this._modalService.getSideModalConfig('saved-tabs');
    const brandInfo = this._filterService?.fetchedBrandData?.find((brand) => brand?.brandID == String(this.postData?.brandInfo?.brandID));
    if (brandInfo && brandInfo?.isTicketDispositionFeatureEnabled) {
      const obj = {
        CategoryGroupID: brandInfo?.categoryGroupID,
        CategoryGroupName: brandInfo?.categoryName,
        TicketID: this.postData?.ticketInfo?.ticketID
      };
      this._replyService?.getDispositionDetails(obj)?.subscribe((res) => {
        if (res?.success) {
          this._replyService?.ticketDispositionListSignal?.set(res?.data?.ticketDispositionList);       
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
    this._dialog.open(PostUserinfoComponent, {
      ...sideModalConfig,
      width: '360px',
      data: { tabIndex, emailFlag: true },
      autoFocus: false,
    });
  }
  
  getRequestPopup(): void {
    const BrandIds = [];
    BrandIds.push(this.postData.brandInfo.brandID);
    const postCRMdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postData.brandInfo.brandID
    );
    const TicketParams = {
      UtcOffset: new Date().getTimezoneOffset(),
      Accounttype: +this.currentUser.data.user.role,
      BrandFriendlyName: this.postData.brandInfo.brandFriendlyName,
      BrandName: this.postData.brandInfo.brandName,
      BrandIds,
      NoOfRows: 50,
      RecordOffset: 0,
      TicketID: this.postData.ticketInfo.ticketID,
      AuthorID: this.postData.author.socialId,
      ChannelGroupID: this.postData.channelGroup,
      ChannelType: this.postData.channelType,
      SocialID: this.postData.socialID,
      PostType: 1,
      IsTakeOver: null,
      From: 0,
      To: 50,
      TagID: this.postData.tagID,
    };

    let IsRequestPopup = false;
    const brandObj = this._filterService.fetchedBrandData.find(
      (obj) => +obj.brandID == this.postData.brandInfo.brandID
    );
    if (brandObj.crmClassName.toLowerCase() == 'snapdealcrm'){
      if (this.postData.ticketInfo.srid == null || this.postData.ticketInfo.srid == ''){
        this.filterBrandInfo = brandObj;
        this.lookupshow = true
        this.snapdealSridFound=false
        return;
      }else{
        this.filterBrandInfo = brandObj;
        this.lookupshow=true
        this.snapdealSridFound=true
        return;
      }
    }
    if (postCRMdata.typeOfCRM == 101 && postCRMdata.crmActive && postCRMdata.isManualPush == 1){
      this.filterBrandInfo = brandObj;
      if ((this.postData.ticketInfo.srid == null || this.postData.ticketInfo.srid == '') && (this.postData.ticketInfo.leadID == '' || this.postData.ticketInfo.leadID == null)) {
        this.getAuthorDetails(brandObj, this.postData,false)
        return;
      } else {
        // // this.GetFormDetailsForView(brandObj,this.postData)
        // this.filterBrandInfo = brandObj;
        this.getAuthorDetails(brandObj, this.postData,true)
      }
      return;
    }

    if (postCRMdata.typeOfCRM == 102 && postCRMdata.crmActive && postCRMdata.isManualPush == 1) {
     this.openPushToTicketCRM();
      return;
    }
    if (this.postData.ticketInfo.srid) {
      if (
        (brandObj.crmClassName.toLowerCase() == 'bandhancrm' ||
          brandObj.crmClassName.toLowerCase() == 'apollocrm' ||
          brandObj.crmClassName.toLowerCase() == 'fedralcrm' ||
          brandObj.crmClassName.toLowerCase() == 'tataunicrm' ||
          brandObj.crmClassName.toLowerCase() == 'recrm' || brandObj.crmClassName.toLowerCase() == 'dreamsolcrm' ||
          brandObj.crmClassName.toLowerCase() == 'extramarkscrm' || brandObj.crmClassName.toLowerCase() == 'tatacapitalcrm' ||
          brandObj.crmClassName.toLowerCase() == 'octafxcrm' || brandObj.crmClassName.toLowerCase() == 'duraflexcrm') &&
        (this.postData.ticketInfo.status ==
          TicketStatus.PendingwithCSDWithNewMention ||
          this.postData.ticketInfo.status ==
            TicketStatus.OnHoldCSDWithNewMention ||
          this.postData.ticketInfo.status ==
            TicketStatus.PendingWithBrandWithNewMention ||
          this.postData.ticketInfo.status ==
            TicketStatus.RejectedByBrandWithNewMention ||
          (this.postData.ticketInfo.status ==
            TicketStatus.OnHoldBrandWithNewMention &&
            brandObj.isBrandworkFlowEnabled))
      ) {
        IsRequestPopup = true;
      }
    }

    const sourceobj = {
      AuthorName: this.postData.author.name,
      AuthorFullName: '',
      AuthorProfileURL: this.postData.author.profileUrl,
      AuthorFollowerCount: this.postData.author.followersCount,
      AuthorFollowingCount: this.postData.author.followingCount,
      TimeOffset: new Date().getTimezoneOffset(),
      TicketParams,
      BrandID: this.postData.brandInfo.brandID,
      BrandName: this.postData.brandInfo.brandName,
      SrID: this.postData.ticketInfo.srid,
      AuthorProfilePicUrl: this.postData.author.picUrl,
      CRMClassName: postCRMdata.crmClassName,
      ChannelType: this.postData.channelType,
      IsRequestPopup: IsRequestPopup,
      EndDateEpoch: moment().endOf('day').unix(),
    };

    if (this.postData.channelGroup == ChannelGroup.Email && this.postData.channelType == ChannelType.Email && this.postData.isBrandPost) {
      this.postData.author.socialId = this.postData.inReplyToMail;
    }

    const leftmenuobject = {
      BrandInfo: this.postData.brandInfo,
      AuthorSocialId: this.postData.author.socialId,
      ChannelGroup: this.postData.channelGroup,
      CrmClassName: postCRMdata.crmClassName,
    };

    this._postDetailService.postObj = this.postData;
    this._postDetailService.crmPostTye = this.pageType
    this.GetCrmLeftMenuapi = this._crmService.GetCrmLeftMenu(leftmenuobject).subscribe((data) => {
      const crmMenu: CRMMenu = data;
      this._crmService.crmName = postCRMdata.crmClassName;
      this._crmService.crmmenu = crmMenu;
      this._ngZone.run(() => {
        const dialogRef = this._dialog.open(CrmComponent, {
          width: '85vw',
          panelClass: 'crm-wrapper',
        });
      })
    });

    this._ngZone.run(() => { })

    this.GetBrandCrmRequestDetailsapi = this._crmService.GetBrandCrmRequestDetails(sourceobj).subscribe((data) => {
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
          UCIC: data.details.authorDetails ? this.postData.author.socialId : '',
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks,
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postData.channelGroup],
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
          UCIC: data.details.authorDetails ? this.postData.author.socialId : '',
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks ? data.details.remarks : '',
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postData.channelGroup],
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
            ? data?.details?.authorDetails?.locoBuzzCRMDetails?.phoneNumber
            : '',
          EmailAddress: data.details
            ? data.details?.authorDetails?.locoBuzzCRMDetails?.emailID
            : '',
          PanCard: data.details.panCard,
          FirstName,
          LastName,
          Product: data.details.product,
          UCIC: data.details.authorDetails ? this.postData.author.socialId : '',
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks,
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postData.channelGroup],
          TagID: data.details.tagID,
          ChannelType: data.details.channelType,
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
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
          LosLeadID: data.details.losLeadID,
          Customer: data.details.customer,
          Disposition: data.details.disposition,
          SubDisposition: data.details.subDisposition,
          LeadStatus: data.details.leadStatus,
          LeadStage: data.details.leadStage,
          LeadSubStage: data.details.leadSubStage,
          NewAppointmentDate: data.details.newAppointmentDate,
          CurrentOwner: data.details.currentOwner,
          Owner: data.details.owner,
          RequestType: data.details.requestType ? data.details.requestType : '',
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
          UserName: this.postData.author.screenname
            ? this.postData.author.screenname
            : this.postData.author.name
            ? this.postData.author.name
            : '',
          LocobuzzTicketID: data.details.locobuzzTicketID
            ? data.details.locobuzzTicketID
            : '',
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postData.channelGroup],
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
            : this.postData.author.name,
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
          UCIC: data.details.authorDetails ? this.postData.author.socialId : '',
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
          UCIC: this.postData.author.socialId,
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
            : ChannelGroup[this.postData.channelGroup],
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
          UCIC: data.details.authorDetails ? this.postData.author.socialId : '',
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks,
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postData.channelGroup],
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
          this.postData?.attachmentMetadata?.mediaContents &&
          this.postData?.attachmentMetadata?.mediaContents.length > 1
            ? this.postData?.attachmentMetadata?.mediaContents[0].mediaUrl
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
          UCIC: this.postData.author.socialId,
          ConversationLog: data.details.conversationLog,
          Remarks: data.details.remarks,
          Channel: data.details.channel
            ? data.details.channel
            : ChannelGroup[this.postData.channelGroup],
          TagID: data.tagID,
          ChannelType: data.details.channelType
            ? data.details.channelType
            : ChannelType[this.postData.channelType],
          LocobuzChannelGroup: data.details.locobuzChannelGroup,
          // QueryType: data.details.querytype,
          SubChannel: data.details.subChannel,
          UserName: data.details.userName,
          CreatedBy: data.details.createdBy,
          SrID: data.details.srID,
          IsUserFeedback: data.details.isUserFeedback,
          LoggedInUserEmailAddress: data.details.loggedInUserEmailAddress,
          Source: data.details.source,
          RequestType: data.details.requestType ? data.details.requestType : '',
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
            : ChannelGroup[this.postData.channelGroup],
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
          UCIC: this.postData.author.socialId,
          RequestType: data.details.requestType ? data.details.requestType : '',
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
            : ChannelGroup[this.postData.channelGroup],
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
          UCIC: this.postData.author.socialId,
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
            : ChannelGroup[this.postData.channelGroup],
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
          first_name: data.details.first_name?.length>1 ? data.details.first_name : FirstName,
          last_name: data.details.last_name?.length>1 ? data.details.last_name :LastName,
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
          type_name:data.details?.type_name,
        };
        this._crmService.dreamsolRequest = dreamsolRequest;
      } else if (postCRMdata.crmClassName.toLowerCase() === 'tatacapitalcrm') {
        let FirstName = '';
        let LastName = '';
        const PersonalDetailsName = data?.details?.userName;
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
            : ChannelGroup[this.postData.channelGroup],
          ChannelType: data.details.channelType,
          ConversationLog: data.details.description,
          CreatedBy: data.details.createdBy,
          EmailAddress: data.details.emailAddress,
          FollowerCount: data.details.followerCount,
          FollowingCount: data.details.followingCount,
          FullName:FirstName + ' ' + LastName ,
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
      } else if (postCRMdata.crmClassName.toLowerCase() === 'duraflexcrm') { let FirstName = ''; let LastName = ''; const PersonalDetailsName = data?.details?.userName; if (PersonalDetailsName) { let names = PersonalDetailsName.split(' '); if (names.length === 0) { names = PersonalDetailsName.split('.'); } if (names.length === 0) { names = PersonalDetailsName.split('_'); } if (names.length > 1) { FirstName = names[0]; LastName = names[1]; } else if (names.length === 1) { FirstName = names[0]; } } let duraflexRequest: DuraflexRequest; duraflexRequest = { Channel: data?.details?.channel ? data.details?.channel : ChannelGroup[this.postData.channelGroup], ChannelType: data?.details?.channelType, ConversationLog: data?.details?.conversationLog, CreatedBy: data?.details?.createdBy, EmailAddress: data?.details?.emailAddress, FollowerCount: data?.details?.followerCount, FollowingCount: data?.details?.followingCount, FullName: data?.details?.fullName, IsUserFeedback: data?.details?.isUserFeedback, LocobuzChannelGroup: data?.details?.locobuzChannelGroup, LocobuzzTicketID: data.details.locobuzzTicketID ? data?.details?.locobuzzTicketID : this.postData.ticketInfo.ticketID, LoggedInUserEmailAddress: data?.details?.loggedInUserEmailAddress, MobileNumber: data?.details?.mobileNumber, Remarks: data?.details?.remarks, SrID: data?.details?.srID, SubChannel: data?.details?.subChannel, TagID: data?.details?.tagID, UserName: data?.details?.userName, UserProfileurl: data?.details?.userProfileurl, $type: 'LocobuzzNG.Entities.Classes.Crm.BrandCrm.ExtraMarksRequest, LocobuzzNG.Entities', RequestType: data?.details?.requestType, }; this._crmService.duraflexRequest = duraflexRequest; }

      /* this._ticketService.updateCrmCreateButton.next(true); */
      this._ticketService.updateCrmCreateButtonSignal.set(true);
    });
  }

  postActionTrigger(
    actionType: number,
    actionData?: { [k: string]: any }
  ): void {
    this.postActionTypeEvent.emit({
      actionType,
      params: actionData,
    });
  }

  // postActionTrigger(actionObj: { actionType: number; params?: any }): void {
  //   switch (actionObj.actionType) {
  //     case this.PostActionEnum.assignTickets:
  //       this.assignTicket();
  //       break;
  //     case this.PostActionEnum.ssreSimWrong:
  //       this.ssreSimulationWrongPopupLogic();
  //       break;
  //     case this.PostActionEnum.ssreSimRight:
  //       this.ssreSimulationRightPopupLogic();
  //       break;
  //     case this.PostActionEnum.replyModified:
  //       this.replyModified();
  //       break;
  //     case this.PostActionEnum.replyEscalate:
  //       this.replyEscalate();
  //       break;
  //     case this.PostActionEnum.translateText:
  //       this.translateText();
  //       break;
  //     case this.PostActionEnum.sendPostEmail:
  //       this.sendPostEmail();
  //       break;
  //     case this.PostActionEnum.openTicketDetail:
  //       this.openTicketDetail();
  //       break;
  //     case this.PostActionEnum.closeTicket:
  //       this.closeThisTicket();
  //       break;
  //     case this.PostActionEnum.ssreLiveWrong:
  //       this.ssreLiveWrongPopupLogic();
  //       break;
  //     case this.PostActionEnum.ssreLiveRightVerified:
  //       this.ssreLiveRightVerified();
  //       break;
  //     case this.PostActionEnum.ssreLiveWrong:
  //       this.ssreLiveRightVerified();
  //       break;
  //     default:
  //     // code block
  //   }
  // }

  getFbLocation(): void {
    const fbobj = {
      BrandInfo: this.postData.brandInfo,
      FBPageID: this.postData.fbPageID,
    };
    const fblocationexistingdetail = localStorage.getItem(
      'fblocationdetail_' + this.postData.fbPageID
    );
    if (!fblocationexistingdetail) {
      this.GetFBlocationInfoapi = this._accountService.GetFBlocationInfo(fbobj).subscribe((response) => {
        // not implemented
        if (response.success) {
          if (response.data.fBpageID > 0) {
            if (response.data && response.data.name) {
              this.fblocationdetail += response.data.name;
            }
            if (response.street && response.data.street) {
              this.fblocationdetail += ',' + response.data.street;
            }
            if (response.data && response.data.city) {
              this.fblocationdetail += ',' + response.data.city;
            }
            if (response.data && response.data.zip) {
              this.fblocationdetail += '-' + response.data.zip;
            }
            if (response.data && response.data.country) {
              this.fblocationdetail += ',' + response.data.country;
            }
          } else {
            this.fblocationdetail = this.translate.instant('Location-Info-not-available');
          }

          localStorage.setItem(
            'fblocationdetail_' + this.postData.fbPageID,
            this.fblocationdetail
          );
        }
      });
      // Andheri kurla road, Chakala, Mumbai, Maharastra: 400009
    } else {
      this.fblocationdetail = fblocationexistingdetail;
    }
  }
  dialPadPopup(contact?: any): void {
    this.contactNo = contact ? contact : '';
    this.dialPad = !this.dialPad;
    console.log('open dialpad ', this.dialPad);
    this.ticketService.dialpadStatusCheck.next(true);
  }
  makeCall(contactNo): void {
    this.dialPad = false;
    const brandInfo = this._filterService?.fetchedBrandData?.find((x)=> x.brandID == this.postData?.brandInfo?.brandID);
    if (brandInfo?.brandVOIPConfig?.voipProvider == VoIPEnum.Ozonetel)
    {
    this.ozontelService.makePhoneCall.next(contactNo);
    }
    if (brandInfo?.brandVOIPConfig?.voipProvider == VoIPEnum.Exotel) {
      this._voip.assignCallObjData();
      this.exotelService.SendDTMF(contactNo?.replace('+91', '0'));
      this.exotelService.dialNumber(contactNo?.replace('+91', '0'));
      this.exotelService.callToNumber = contactNo;
      this.exotelService.selectedMention = this.postData;
      setTimeout(() => {
        this.exotelService.acceptCall()
      }, 300);
    }
    // this.dialPad = false;
    // const agentId = this.currentUser?.data?.user?.userId;
    // const brandId = this.postData?.brandInfo?.brandID;
    // const brandName = this.postData?.brandInfo?.brandName;
    // if (!contactNo?.includes('+91')) {``
    //   contactNo = contactNo ? '+91' + contactNo : '';
    // }
    // const voipParams = {
    //   Brand: { brandID: brandId, brandName: brandName },
    //   CustomerNumber: contactNo,
    //   AgentID: agentId,
    // };

        navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            console.log('✅ Microphone access granted.');
            stream.getTracks().forEach(track => track.stop());
            this._voip.assignCallObjData();
            this.exotelService.SendDTMF(contactNo?.replace('+91', '0'));
            this.exotelService.dialNumber(contactNo?.replace('+91', '0'));
            this.exotelService.callToNumber = contactNo;
            this.exotelService.selectedMention = this.postData;
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
                  this._dialog.open(MicrophonePermissionComponent, {
                    width: '400px',
                  })
                }
              } catch {
              }
            }
          });
    // this._voip.assignCallObjData();
    // this.exotelService.SendDTMF(contactNo?.replace('+91', '0'));
    // this.exotelService.dialNumber(contactNo?.replace('+91', '0'));
    // this.exotelService.callToNumber = contactNo;
    // this.exotelService.selectedMention = this.postData;
    // setTimeout(() => {
    //   this.exotelService.acceptCall()
    // }, 300);
    // this.subs.add(
    //   this._voip.makeCall(voipParams).subscribe((response) => {
    //     if(response.success){
    //       this._postDetailService.voiceChannel= ChannelGroup.Voice
    //       this._voip.onCallPick.next('CallInitiated');
    //       if(this._voip.callObj){
    //         this._voip.callObj.customerContactNo = contactNo;
    //       }
    //       this._voip.onCallPick.subscribe((res) => {
    //         if (res == VoiceCallEventsEnum.AgentAnswer) {
    //           if (this._voip.callObj) {
    //             this._voip.callObj.isCallDisconnect = false;
    //           }
    //           this.openCallDetail = true;
    //           this.postActionTypeEvent.emit({
    //             actionType: PostActionEnum.VoipCall,
    //           });
    //         }
    //       });
    //     } else {
    //       this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //         duration: 5000,
    //         data: {
    //           type: notificationType.Error,
    //           message: response.message,
    //         },
    //       });
    //     }
    //   })
    // );
  }

  ngOnDestroy(): void {
    this.clearSignal.set(false);
    this._cdr.detectChanges();
    if (this.breachInterval) {
      clearInterval(this.breachInterval);
    }
    if(!this._postDetailService.postDetailPage){
      this.showDialPad =false;
    }
    this.subs.unsubscribe();
    if (this.clickHoverMenuTimeout) {
      clearTimeout(this.clickHoverMenuTimeout);
    }
    this.clearAllPostheadVariable();
  }
  leftButton(event): void {
    this.mainNav.nativeElement.scrollLeft -= 300;
    event.preventDefault();
    this.scrollLeft = true;
    this.scrollRight = false;
    if (this.mainNav.nativeElement.scrollLeft === 0) {
      this.leftArrowSlideDisable = true;
    }
  }
  rightButton(event): void {
    this.mainNav.nativeElement.scrollLeft += 300;
    event.preventDefault();
    console.log(this.mainNav.nativeElement.scrollLeft);
    this.scrollRight = true;
    this.scrollLeft = false;
    if (this.mainNav.nativeElement.scrollLeft !== 0) {
      this.leftArrowSlideDisable = false;
    }
  }

  createSalesForceCrm(type:number):void
  {
    this.salesForceLoader=true;
    const obj = {
      BrandInfo: {
        BrandID: this.postData?.brandInfo.brandID,
        BrandName: this.postData?.brandInfo?.brandName
      },
      AuthorSocialID: this.postData?.author?.socialId,
      TicketID: this.postData?.ticketID,
      TitleDescription: this.ticketHistoryData?.description ? this.ticketHistoryData?.description:this.ticketHistoryData?.title,
      Channel: ChannelGroup[this.postData?.channelGroup],
      TicketStatus: TicketStatus[this.postData?.ticketInfo?.status],
      AuthorName: this.postData?.author?.name,
      AuthorEmail: this.postData?.author?.locoBuzzCRMDetails?.emailID,
      AuthorMobile: this.postData?.author?.locoBuzzCRMDetails?.phoneNumber
    }

    const brandObj = this._filterService.fetchedBrandData.find(
      (obj) => +obj.brandID == this.postData.brandInfo.brandID
    );

    this.CreateSalesForceCrmapi = this._crmService.CreateSalesForceCrm(obj, type, brandObj.crmClassName.toLowerCase()).subscribe((res)=>{
      this.salesForceLoader = false;
      if(res.success)
      {
        if (!this.postData.ticketInfo.srid && res.data) {
          /* this.ticketService.updateCRMDetails.next({
            TagID: this.postData.tagID,
            SrID: res.data,
            guid: this.navigationService.currentSelectedTab.guid,
            postType:PostsType.Tickets
          }); */
          this.ticketService.updateCRMDetailsSignal.set({
            TagID: this.postData.tagID,
            SrID: res.data,
            guid: this.navigationService.currentSelectedTab.guid,
            postType:PostsType.Tickets
          });
        }
      }else{
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: res.message ? res.message : this.translate.instant('Unable-to-generate-SR-request'),
          },
        });
      }
    },err=>{
      this.salesForceLoader=false;
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something went wrong'),
        },
      });
    })
  }

  openAnimalWildfare():void{

    const obj={
      TicketID: this.postData?.ticketID,
      AgentID: this.currentUser?.data?.user?.userId,
      IsCRMCreated: this.postData?.ticketInfo?.srid?false:true
    }

    this.generateAnimalWildFareCrmTokenapi = this._ticketService.generateAnimalWildFareCrmToken(obj).subscribe((res)=>{
      if(res.success)
      {
        if (res.data) {
          window.open(res.data);
        }

        // const dialogRef = this._dialog.open(AnimalWildfarePopupComponent, {
        //   data: {baseMention:this.postData,url:res.data},
        //   width: '1200px',
        //   height: '620px'
        // });

        // dialogRef.afterClosed().subscribe(result => {
        //   if (result) {
        //     this.postData.ticketInfo.srid = result;
        //     this.post?.srID = res?.data?.SRID;
        //     if (this._postDetailService?.postObj)
        //     {
        //       this._postDetailService.postObj.ticketInfo.srid = result;
        //     }
        //     this._cdr.detectChanges();
        //   }
        // });
      }
    })
  }

  private getAuthorDetails(brandObj,ticketData,srIDLeadID): void {
    this.crmGetAuthorTicketDetails=true
    const filterObj = this._filterService.getGenericRequestFilter(ticketData);
    const obj = {
      brandID: filterObj?.brandInfo?.brandID,
      ticketId: filterObj?.ticketId
    }
    let sources = srIDLeadID? [
      this._userDetailService.GetAuthorDetails(filterObj),
      this._userDetailService.GetAuthorTicketDetails(obj),
      this._dynamicCrmIntegrationService.GetFieldJson(brandObj?.brandID),
      this._dynamicCrmIntegrationService.GetpushedData(ticketData?.ticketID)
    ] : [
      this._userDetailService.GetAuthorDetails(filterObj),
      this._userDetailService.GetAuthorTicketDetails(obj),
      this._dynamicCrmIntegrationService.GetFieldJson(brandObj?.brandID)
    ];
    this.subs.add(
    forkJoin(sources).subscribe(
      (res) => {
        this.formDataForQuickworkCrm = res;
        this.Data2ForFormData = res[2]
        // if (res[2]?.data?.dataFields?.length>0 && res[2]?.data?.leadDataFields?.length>0 ){
        if (brandObj?.isCreateCase && brandObj?.isCreateLead ){
          this.clickHoverMenuTriggerFlag = true
          this.clickHoverMenuTimeout = setTimeout(() => {
            this.clickHoverMenuTrigger.openMenu();
          }, 100);
        } else{
          if (!brandObj?.isCreateCase && brandObj?.isCreateLead && !res[3]?.data?.leadFields && !res[3]?.data?.caseFields ){
            // setTimeout(() => {
            // }, 500);
              this.CaseLeadFormOpen('Lead')
          } else if(brandObj?.isCreateCase && !brandObj?.isCreateLead && !res[3]?.data?.leadFields && !res[3]?.data?.caseFields ){
            // setTimeout(() => {
            // }, 500);
            this.CaseLeadFormOpen('Case')
          }
          this.clickHoverMenuTriggerFlag = false
          this.clickHoverMenuTrigger.closeMenu();
        }
        if (res[3]) {
          // this.Data2ForFormData = data2
          this.Data1ForFormData = res[3]
          if (res[3]?.data?.leadFields && res[3]?.data?.caseFields && brandObj?.isCreateCase && brandObj?.isCreateLead) {
            this.clickHoverMenuTriggerFlag = true
            this.leadFormFilledFlag = true
            this.caseFormFilledFlag = true
            this.clickHoverMenuTrigger.openMenu();
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
              this.clickHoverMenuTrigger.openMenu();
            }
            else if (res[3]?.data?.leadFields && !res[3]?.data?.caseFields && brandObj?.isCreateCase && brandObj?.isCreateLead && ticketData?.ticketInfo?.srid == null) {
              this.leadFormFilledFlag = true
              this.clickHoverMenuTriggerFlag = true
              this.clickHoverMenuTrigger.openMenu();
            }
          }
          this._cdr.detectChanges()
        }
        this.crmGetAuthorTicketDetails = false;
        this._cdr.detectChanges()
        // return;
        
      })
    );
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
          this.Data2ForFormData.data.datafieldsGroups = this.Data2ForFormData?.data?.datafieldsGroups?.map(obj => ({ ...obj, fields: this.Data1ForFormData?.data?.caseFields?.filter((r) => r.groupId == obj.id).sort((a, b) => a.priority - b.priority).filter((r) => r.field != "TagId" && r.field != "ConversationLog" && r.field !='formAttachment') }))
          const formAttachment = this.Data1ForFormData?.data?.caseFields?.find((r) => r.field == 'formAttachment')
          this.quickLookupFormFieldsEdit(this.filterBrandInfo, this.postData, formType, this.Data2ForFormData.data.datafieldsGroups, formAttachment)
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
            this.Data2ForFormData.data.leadDatafieldsGroups = this.Data2ForFormData?.data?.leadDatafieldsGroups?.map(obj => ({ ...obj, fields: this.Data1ForFormData?.data?.leadFields?.filter((r) => r.groupId == obj.id).sort((a, b) => a.priority - b.priority).filter((r) => r.field != "TagId" && r.field != "ConversationLog" && r.field != 'formAttachment') }))
         
          }
        const formAttachment = this.Data1ForFormData?.data?.leadFields?.find((r) => r.field == 'formAttachment')
        this.quickLookupFormFieldsEdit(this.filterBrandInfo, this.postData, formType, this.Data2ForFormData.data.leadDatafieldsGroups, formAttachment)
          }
        }
    CaseLeadFormOpen(formType){
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
      if( this.formDataForQuickworkCrm){
        let AuthorDetails =  this.formDataForQuickworkCrm[0]
        let CrmticketDetails =  this.formDataForQuickworkCrm[1]
        this.quickLookupFormFields(this.filterBrandInfo, AuthorDetails, CrmticketDetails, formDataLookupDataFields, formType)
      } else{
        this.quickLookupFormFields(this.filterBrandInfo, null, null, formDataLookupDataFields, formType)
      }
    }
    quickLookupFormFields(brandObj, AuthorDetails, CrmticketDetails, formDataLookupDataFields, formType){
      this.crmGetAuthorTicketDetails = false;
      this.clickHoverMenuTriggerFlag = false
      if (this.clickHoverMenuTrigger){
        this.clickHoverMenuTrigger.closeMenu();
      }
      this._cdr.detectChanges()
      this._dialog.open(LookupcrmquickworkComponent, {
        autoFocus: true,
        width: '82vw',
        disableClose:true,
        data: { brandObj: brandObj, ticketInfo: this.postData, AuthorDetails: AuthorDetails, CrmticketDetails: CrmticketDetails, CurrentUser: this.currentUser, PageType: this.pageType, FormData: formDataLookupDataFields, FormType: formType },
      });
    }
    crmGetAuthorTicketDetails=false
    quickLookupFormFieldsEdit(brandObj,ticketData,formType,formData,formAttachment) {
    this.clickHoverMenuTriggerFlag = false
    this.clickHoverMenuTrigger.closeMenu();
    this._dialog.open(QuickworkManualComponent, {
      autoFocus: true,
      width: '82vw',
      disableClose:true,
      data: { brandObj: brandObj, ticketInfo: ticketData, formType: formType, formData: formData, formAttachment },
    });
  }

  abbreviateNumber(value):string {
    let newValue = value;
    if (value >= 1000) {
      let suffixes = ["", "K", "M", "B", "T"];
      let suffixNum = Math.floor(("" + value).length / 3);
      let shortValue: any = '';
      for (let precision = 2; precision >= 1; precision--) {
        shortValue = parseFloat((suffixNum != 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(precision));
        let dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
        if (dotLessShortValue.length <= 2) { break; }
      }
      if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
      newValue = shortValue + suffixes[suffixNum];
    }
    return newValue;
  }
  workflowActionShowFlag = false
  workflowAction:any;
  workflowActionShow(data){
    this.workflowActionShowFlag =true
    let obj

    if (this.postData?.ticketID!=0)
    {
      obj = {
        "workflowID": data?.workflowId,
        "brandID": this.postData?.brandInfo?.brandID,
        "ticketID": this.postData?.ticketID,
        "tagID": 0,
      }
    }else{
      obj = {
        "workflowID": data?.workflowId,
        "brandID": this.postData?.brandInfo?.brandID,
        "tagID": this.postData?.tagID,
        ticketID:0
      }
    }
    this.GetExcecutedWorkflowDetailsapi = this._workflowService.GetExcecutedWorkflowDetails(obj).subscribe((res)=>{
      this.workflowActionShowFlag = false
      if(res.success){
        if (res?.data?.workflowVersion == WorkflowVersion.Workflow_v1)
        {
          this.workflowAction = res?.data?.executorLogs
        }else
        {
          this.workflowAction = this.createActionsArray(res?.data?.executorLogsv2)
        }
        this.workflowActionShowFlag = false
        this._cdr.detectChanges()
      }
    },err=>{
      this.workflowActionShowFlag = false
    })
  }

  getTiktokDetailedView():void{
    this.spinner = true
   const obj = {
     brandid:this.postData.brandInfo.brandID,
     uniqueid:this.postData.ticketInfo.uniqueId,
     username:this.postData.author.profileDetails?.author,
     tagid:this.postData.tagID,
     createddate: this.postData.ticketInfo.createdAt,
     authorchannelgroupid:this.postData.channelGroup,
     authorsocialid:this.postData?.author?.socialId
  }
this._cdr.detectChanges() 
    this.getTiktokDetailedViewapi = this._ticketService.getTiktokDetailedView(obj).subscribe((res)=>{
      this.spinner = false
      if(res.success)
      {
        this.tikTokAuthorDetails = res.data;
        this.postData.author.profileDetails = res.data;
        if (this.tikTokAuthorDetails?.userLocation && this.tikTokAuthorDetails?.userCountry)
        {
         this.tikTokAuthorDetails.locationName = this.tikTokAuthorDetails.userLocation + ', ' + this.tikTokAuthorDetails.userCountry
        }else if (this.tikTokAuthorDetails?.userLocation)
        {
          this.tikTokAuthorDetails.locationName = this.tikTokAuthorDetails.userLocation
        }else if (this.tikTokAuthorDetails?.userCountry)
        {
          this.tikTokAuthorDetails.locationName = this.tikTokAuthorDetails.userCountry
        }
        this.postData.author.profileDetails.isUpdated =true
        /* this.ticketService.updateTiktokAuthorDetails.next(this.postData) */
        this.ticketService.updateTiktokAuthorDetailsSignal.set(this.postData)
      }else{
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: res.message ? res.message : this.translate.instant('Something went wrong'),
          },
        });
      }
      this._cdr.detectChanges() 
    },err=>{
      this.spinner = false
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something went wrong'),
        },
      });
      this._cdr.detectChanges() 
    })
}

  redirectToUrl(url:string){
    window.open(url, "_blank");
  }

  openPushToTicketCRM():void
  {
    this._postDetailService.postObj = this.postData;
    if (this.postData?.ticketInfo?.srid) {
      // this.lookupshow = true;
      this.getSRDetailsapi = this.ticketService.getSRDetails(this.postData?.ticketInfo?.ticketID).subscribe((res) => {
        this.lookupshow = false
        if (res.success) {
          this._dialog.open(PushTicketToCrmComponent, {
            autoFocus: true,
            width: '82vw',
            disableClose: true,
            data: { pageType: this.pageType, fieldData: res.data,editFlag:true }
          });
        }else{
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
        "BrandID": this?.postData?.brandInfo?.brandID,
        "TicketID": this.postData.ticketInfo.ticketID,
        "TagID": this.postData.tagID,
      }
      this.getCrmFieldFormapi = this.ticketService.getCrmFieldForm(obj).subscribe((res) => {
        if (res.success) {
          this.lookupshow = false
      this._dialog.open(PushTicketToCrmComponent, {
        autoFocus: true,
        width: '82vw',
        disableClose: true,
        data: { pageType: this.pageType, fieldData: res.data, editFlag: false }
      });
    }else{
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

  createActionsArray(excecutionList:any[]):any[]
  {
    const actionArray = [];
    excecutionList?.forEach(element => {
      if (element.pathID == null && element?.stepID && element?.actionName) {
        actionArray.push({
          "actionName": element?.actionName,
          "isSuccess": element?.status == 'Success' ? true : false,
          message: element?.message,
                    actionEnum: (element?.actionName&& element?.actionEnum) ? element?.actionEnum : null
        })
      }
    })
    return actionArray;
  }
  
  updateTicketAssignmentListSignalChange(data){
    if (data) {
      if (data.guid == this.postDetailTab?.guid) {
        if (data.tagID == this.postData.tagID) {
          if (
            data.escalateUser &&
            (data.escalateUser.teamName || data.escalateUser.agentName)
          ) {
            this.post.assignTo = data.escalateUser.teamName
              ? data.escalateUser.agentName +
              ` (${data.escalateUser.teamName})`
              : data.escalateUser.agentName;
          }
          if (data.fromTeam && data.fromTeam.teamName) {
            this.post.assignTo = data.fromTeam.teamName;
          }
          this._cdr.detectChanges();
          /* this._ticketService.updateTicketAssignmentList.next(null); */
          this._ticketService.updateTicketAssignmentListSignal.set(null);
        }
      }
    }
  }

  updateCRMDetailsSignalChange(res){
    if (this.postData.ticketInfo.tagID == res.TagID) {
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
    }
  }

  clearAllPostheadVariable() {
    if (this.GetLangaueListApi) {
      this.GetLangaueListApi.unsubscribe();
    }
    if (this.changeTicketPriorityApi) {
      this.changeTicketPriorityApi.unsubscribe();
    }
    if (this.GetCrmLeftMenuapi) {
      this.GetCrmLeftMenuapi.unsubscribe();
    }
    if (this.GetBrandCrmRequestDetailsapi) {
      this.GetBrandCrmRequestDetailsapi.unsubscribe();
    }
    if (this.GetFBlocationInfoapi) {
      this.GetFBlocationInfoapi.unsubscribe();
    }
    if (this.CreateSalesForceCrmapi) {
      this.CreateSalesForceCrmapi.unsubscribe();
    }
    if (this.generateAnimalWildFareCrmTokenapi) {
      this.generateAnimalWildFareCrmTokenapi.unsubscribe();
    }
    if (this.GetExcecutedWorkflowDetailsapi) {
      this.GetExcecutedWorkflowDetailsapi.unsubscribe();
    }
    if (this.getTiktokDetailedViewapi) {
      this.getTiktokDetailedViewapi.unsubscribe();
    }
    if (this.getSRDetailsapi) {
      this.getSRDetailsapi.unsubscribe();
    }
    if (this.getCrmFieldFormapi) {
      this.getCrmFieldFormapi.unsubscribe();
    }
    if (this.effectDialpadBooleanSignal) {
      this.effectDialpadBooleanSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectUpdateCRMDetailsSignal) {
      this.effectUpdateCRMDetailsSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectUpdateTicketAssignmentListSignal) {
      this.effectUpdateTicketAssignmentListSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectUpdateTiktokAuthorDetailsSignal) {
      this.effectUpdateTiktokAuthorDetailsSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectBulkCheckboxObsSignal) {
      this.effectBulkCheckboxObsSignal.destroy();  // Clean up any active signal effect
    }
    this.clickHoverMenuTrigger = null;
    this.phoneNumber = null;
    this.padToggle = null;
    this.contactPadToggle = null;
    this.dial = null;
    this.minimalViewHead = null;
    this.mainNav = null;
  }

  syncSFDCData(): void {
    this.rotate = true;  
    const obj = {
      "TicketID": this.postData?.ticketID,
      "TagID": this.postData?.tagID,
      "BrandID": this.postData?.brandInfo?.brandID,
      "channelGroup": this.postData?.channelGroup
    }
   
    this._ticketService.SFDCDataSync(obj).subscribe((res) => {
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
  closeEventRes(event)
  {
    if(event!=null)
    {
      this.dialPad = event;
      this._cdr.detectChanges();
  }
}
  copied(name): void {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Success,
        message: name + ' copied successfully',
      },
    });
  }

  changePriority(event, priority): void {
    const object = {
      brandInfo: this.postData?.brandInfo,
      ticketInfo: this.postData?.ticketInfo,
      actionFrom: ActionTaken.Locobuzz,
    };

    object.ticketInfo.ticketPriority = event;
    this.changeTicketPriorityApi=
    this._ticketService.changeTicketPriority(object).subscribe(
      (data) => {
        const data1 = JSON.parse(JSON.stringify(data));
        if (data1.success) {
          this.ticketPriority = priority;
          this.postData.ticketInfo.ticketPriority = event;
          if (this._postDetailService.postObj) {
            this._postDetailService.postObj.ticketInfo.ticketPriority = event;
          }
          this._cdr.detectChanges();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: 'Ticket Priority Successfully Changed',
            },
          });
        }

        const result = this.footerService.togglePostfootClasses(
          this.postData,
          this.ticketPriority,
          this.post
        );
        this.crmClass = result.crmClass;
        this.priorityClass = result.priorityClass;
        this.statusClass = result.statusClass;
      },
      (error) => {
        // console.log(error);
      }
    );
  }
  translateText(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.translateText });
  }
  getLanguageList() {
    this.LanguageList = [];
    this.LanguageListCopy = [];
    (document.getElementById('languageSearchText') as HTMLInputElement).value = '';
    this.selectedLanguage = this.ticketHistoryData?.languageName == "Undefined" || this.ticketHistoryData?.languageName == "Undetected" ? "" : this.ticketHistoryData?.languageName.trim();

    const genericFilter = this.navigationService.getFilterJsonBasedOnTabGUID(
      this.navigationService.currentSelectedTab.guid
    );

    let obj = {
      brands: [
        {
          brandID: this.postData?.brandInfo?.brandID,
          brandName: this.postData?.brandInfo?.brandName
        }
      ],
      startDateEpoch: genericFilter.startDateEpoch,
      endDateEpoch: genericFilter.endDateEpoch
    };

    this.GetLangaueListApi = this._ticketService.GetLangaueList(obj).subscribe((result) => {
      if (result.success) {
        this.LanguageList = result.data;
        this.LanguageListCopy = result.data;
      }
    })
  }
  searchLanguage(searchText) {
    this.LanguageList = this.LanguageListCopy.filter((language) => language?.key.toLowerCase().includes(searchText.toLowerCase()));
  }

  selectLanguage(language) {
    this.selectedLanguage = language?.key.trim();
  }
  updateLanguage(event) {
    if(this.selectedLanguage === "") {
      event.stopPropagation();
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: "Please select a language.",
        },
      });
    } else if (this.selectedLanguage.trim() === this.ticketHistoryData?.languageName.trim()) {
      event.stopPropagation();
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: "This language is already tagged.",
        },
      });
    } else {
      let lang = this.LanguageListCopy.filter((language) => language.key.trim() == this.selectedLanguage.trim())[0];
      this.postActionTypeEvent.emit({ actionType: PostActionEnum.tagLanguage, param: { lang } });
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === 32) {
      // do not propagate spaces to MatSelect, as this would select the currently active option
      event.stopPropagation();
    }
  }

    openCategoryDialog(event, aI_Category:boolean): void {
      if (this.assignMentionORTagCategoryEnabled)
      {
      // this.postActionTypeEvent.emit({ actionType: PostActionEnum.mentionCategory, param: {mentionCategory}});
      this.postData.categoryMapText = null;
      this._postDetailService.postObj = this.postData;
      this._postDetailService.isBulk = false;
      this._postDetailService.categoryType = event;
      this._postDetailService.pagetype = this.pageType;
      this._postDetailService.crmFlag = !this.ticketHistoryData?.moreOptionFlag;
      this._postDetailService.isBulkQualified=false;
        this._postDetailService.groupedView = this.mentionOrGroupView==AllMentionGroupView.groupView?true:false;
        this._postDetailService.parentComponent = this.showParentPostHeader;
        if(!this.showParentPostHeader && this.pageType==PostsType.TicketHistory)
          {
            this._postDetailService.childOrParentFlag=true
          }else
          {
          this._postDetailService.childOrParentFlag = false
          }
        const dialogRef = this._dialog.open(CategoryFilterComponent, {
            width: '20vw',
            panelClass: ['responsive__modal--fullwidth'],
            disableClose: false,
          data: aI_Category ? { onlyUpperCategory: true, manualUpperCategory: false } : { onlyUpperCategory: true,manualUpperCategory:true }
          });
        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            this._cdr.detectChanges();
          }
        });
    }
  }

  public get getSentiment(): typeof Sentiment {
    return Sentiment;
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
      ticketUpperCategory: updatedmention?.ticketInfo?.ticketUpperCategory?.name,
      mentionUpperCategory: updatedmention?.upperCategory?.name,
    };
  }

  getAssignedToText(): string {
    const brandWorkFlowEnabled = this.postData?.brandInfo?.isBrandworkFlowEnabled;
    const ticketStatus = this.postData?.ticketInfo?.status;
    const isEscalatedStatus = ticketStatus === 9 || ticketStatus === 15;

    if (brandWorkFlowEnabled && isEscalatedStatus) {
      const escalatedUser = this.postData?.ticketInfo?.escalatedTotUserName;
      const csdTeamName = this.postData?.ticketInfo?.escalatedToCSDTeamName;

      return escalatedUser ? `${escalatedUser} (${csdTeamName})` : csdTeamName;
    }

    return this.post?.assignTo;
  }
  getAiIntentPillWidth() {
    const firstIntentText = this.postData.aiIntentIDs[0] || '';
    const displayText = firstIntentText.length > 10 ? firstIntentText.substr(0, 10) + '...' : firstIntentText;

    const baseWidth = 46; // Icon + padding + margins
    const textWidth = displayText.length * 6.5; // Approximate 6.5px per character
    const countCircleWidth = this.postData.aiIntentIDs.length > 1 ? 35 : 0;

    const calculatedWidth = baseWidth + textWidth + countCircleWidth;

    // Set minimum width to prevent too small pills
    const minWidth = 80;
    const finalWidth = Math.max(calculatedWidth, minWidth);

    return { width: `${finalWidth}px`,
      background: 'linear-gradient(90deg, rgba(252, 14, 159, 0.15) 0%, rgba(116, 20, 239, 0.15) 100%) !important'
   };
  }

    openTicketDetail(): void {
      if (this.openDetailOnClick && this.ticketHistoryData.showTicketWindow) {
        this.postActionTypeEvent.emit({
          actionType: PostActionEnum.openTicketDetail,
        });
      }
      // this.ticketDetailsPopup = true;
    }
  postSelect(checkedStatus, ticketID): void {
    this.checkedBox = checkedStatus
    /* this._ticketService.unselectedMention.next(true) */
    this._ticketService.unselectedMentionSignal.set(true)
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.selectPost,
      param: { checkedStatus, ticketID },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.AllCheckBoxes?.currentValue) {
      const isexcludebrandmention = localStorage.getItem(
        'isexcludebrandmention_' + this.currentUser?.data?.user?.userId
      );
      if (isexcludebrandmention === '1') {
        if (this.AllCheckBoxes && !this.isbrandPost) {
          this.isbulkselectall = true;
        } else {
          this.isbulkselectall = false;
        }
      } else {
        if (this.AllCheckBoxes) {
          this.isbulkselectall = true;
        } else {
          this.isbulkselectall = false;
        }
      }
    }
  }
}

