import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  effect,
  EffectRef,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  signal,
  SimpleChanges,
  untracked,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActionStatusEnum } from 'app/core/enums/ActionStatus';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { notificationType } from 'app/core/enums/notificationType';
import { PostActionEnum } from 'app/core/enums/postActionEnum';
import { PostDisplayTypeEnum } from 'app/core/enums/PostDisplayTypeEnum';
import { Priority } from 'app/core/enums/Priority';
import { Sentiment } from 'app/core/enums/Sentiment';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { AuthUser, User } from 'app/core/interfaces/User';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BulkOperationObject } from 'app/core/models/dbmodel/BulkOperationObject';
import { TicketHistoryDTO } from 'app/core/models/dbmodel/TicketHistoryDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { Tab } from 'app/core/models/menu/Menu';
import { CreateAttachMultipleMentionParam } from 'app/core/models/viewmodel/CreateAttachMultipleMentionParam';
import {
  PostSpecificInput,
  PostsType,
  postView,
} from 'app/core/models/viewmodel/GenericFilter';
import { LocoBuzzAgent } from 'app/core/models/viewmodel/LocoBuzzAgent';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { EmailReadReceipt } from 'app/core/models/viewmodel/ReplyInputParams';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { ModalService } from 'app/shared/services/modal.service';
import moment from 'moment';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink/dist/subsink';
import {
  CannedResponseComponent,
  ParentPostComponent,
  PostUserinfoComponent,
  TrendsComponent,
} from '../..';
import { AttachTicketComponent } from '../../attach-ticket/attach-ticket.component';
import { CategoryFilterComponent } from '../../category-filter/category-filter.component';
import { CopyMoveComponent } from '../../copy-move/copy-move.component';
import { PostMarkinfluencerComponent } from '../../post-markinfluencer/post-markinfluencer.component';
import { PostSubscribeComponent } from '../../post-subscribe/post-subscribe.component';

import { TabService } from './../../../../core/services/tab.service';
import { FilterGroupService } from './../../../services/filter-group.service';
import { FilterService } from './../../../services/filter.service';
import { FootericonsService } from './../../../services/footericons.service';
import { PostDetailService } from './../../../services/post-detail.service';
import { ReplyService } from './../../../services/reply.service';
import { TicketsService } from './../../../services/tickets.service';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { LinkStatusEnum } from 'app/core/enums/LinkStatusEnum';
import { TicketMentionCategory } from 'app/core/interfaces/TicketMentionCategory';
import { TicketDispositionComponent, ticketDispositionList } from '../../ticket-disposition/ticket-disposition.component';
import { TagMentionCampaignComponent } from '../../tag-mention-campaign/tag-mention-campaign.component';
import { E } from '@angular/cdk/keycodes';
import { NavigationService } from 'app/core/services/navigation.service';
import { AspectFeedbackPageComponent } from 'app/accounts/component/aspect-feedback-page/aspect-feedback-page.component';
import { EditAiTicketLabelComponent } from '../../edit-ai-ticket-label/edit-ai-ticket-label.component';
import { AllMentionGroupView } from 'app/shared/components/post-options/post-options.component';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { TranslateService } from '@ngx-translate/core';
import { AiTicketTagService } from 'app/accounts/services/ai-ticket-tag.service';
import { CommonService } from 'app/core/services/common.service';
import { AgentIQAction } from 'app/core/enums/AgentIQActionEnum';

@Component({
    selector: 'app-post-foot',
    templateUrl: './post-foot.component.html',
    styleUrls: ['./post-foot.component.scss'],
    standalone: false
})
export class PostFootComponent implements OnInit, OnChanges, OnDestroy {
  @Input() post: TicketClient;
  @Input() postData: BaseMention;
  @Input() ticketHistoryData: AllBrandsTicketsDTO;
  @Input() openReply: boolean = false;
  @Input() parentPostFirstFlag: boolean = false;
  @Input() pageType: PostsType;
  @Input() currentUser: AuthUser;
  @Input() AllCheckBoxes = false;
  @Input() postFootDisable? = false;
  @Input() postInput?: PostSpecificInput = null;
  @Input() postDetailTab: LocobuzzTab;
  @Input() showParentPostHeader: boolean = false;
  @Output() postActionTypeEvent = new EventEmitter<any>();
  @Output() markAsReadEvent = new EventEmitter<boolean>();
  @Output() ticketDispositionEmit = new EventEmitter<boolean>();
  @Input() postView: postView = postView.detailView;
  @Input() mentionOrGroupView: AllMentionGroupView;
  @Input() parentPostFlag: boolean = false;
  @Input() mentionHistory:boolean = false
  @Input() sentimentBackgroundColorClass: string = 'sentiment-background-neutral';
  @Input () ozontelFlag: boolean = false;
  // private posttriggersubscription: Subscription;
  subs = new SubSink();
  actionableRef: any;
  makeactionableEnabled: boolean;
  isMaskingViewOrUpdateEnabled:boolean;
  assignMentionORTagCategoryEnabled: boolean;
  postViewEnum = postView;
  isTicketDispositionFeatureEnabled: boolean;
  checkedBox:boolean=false;
  minimalViewFooter = false;
  scanContentFlag: boolean=true;
  scanContentUrlList: any;
  noScanLinkFound: boolean;
  LinkStatusEnum = LinkStatusEnum
  safeorUnsafeLink: boolean;
  selectedTicketView: number;
  @ViewChild('rightFoot') rightFoot : ElementRef;
  rightFootWidth:number =0;
  sfdcTicketViewUI = false;
  toggleMasking: boolean = false;
  allMaskedDataWithTagId = [];
  aiTagEnabled:boolean = false;
  isAITicketTagEnabled:boolean = false;
  clickhouseEnabled: boolean = false;
  isfullThreadSelected:boolean =false;
  filterObj: any
  createdDate: any;
  checkboxVariable: boolean = false;
  actionableRef1: any;
  actionableParentPost: boolean =true;
  currentPostType: PostsType;
  blocked: boolean = false;
  showblockchannels: boolean = false;
  UnBlockPagesAndHandlesApi: any;
  BlockPagesAndHandlesApi: any;

  changeTicketPriorityApi: any;
  sendAspectFeedbackApi: any;
  ReplyApi1: any;
  MarkActionableApi: any;
  getAuthorTicketsapi: any;
  enableTicketMakerCheckerApi: any;
  saveNewTabApi:any;
  getMentionCountByTicektIDApi: any;
  CheckTicketIfPendingWithnewMentionApi: any;
  ReplyApi2: any;
  CreateAttachMultipleMentionsApi:any;
  Reply3Api: any;
  ReplyApprovedApi:any;
  ReplyRejectedApi:any;
  Reply4Api:any;
  MarkMentionAsReadApi: any;
  GetUsersWithTicketCountApi: any;
  GetTicketCountDetailForPostApi: any;
  makeTicketActionableOrNonActionableApi:any;
  hideUnhideFromFacebookApi: any;
  getTicketHtmlForEmail1Api: any;
  getTicketHtmlForEmail2Api:any;
  getDispositionDetails1Api: any;
  getDispositionDetails2Api: any;
  scanImageContentApi: any;
  scanTextContentApi: any;
  GetLangaueListApi: any;
  GetUnmaskedDescriptionApi: any;
  getCRMTicketStatusApi: any;
  getPostLabelsApi: any;
  updatePostLabelsApi: any;
  updateSignleMentionSeen1Api: any;
  updateSignleMentionSeen2Api:  any;
  createdDateApi: any;
  updateChildBulkSeenUnseenApi: any;
  makeTicketActionableOrNonActionable1Api:any;
  effectOpenCallDetailWindowSignal: EffectRef;
  effectSetTicketForRefreshSignal: EffectRef;
  effectUpdateCRMDetailsSignal: EffectRef;
  effectPostDetailObjectChangedSignal: EffectRef;
  effectSelectedCannedResponseSignal: EffectRef;
  effectBulkCheckboxObsSignal: EffectRef;
  effectEmitBrandMentionEmailDataSignal: EffectRef;
  // @Output() directCloseAction = new EventEmitter<void>();
  private clearSignal = signal<boolean>(true);
  userToggleState: boolean = false;
  isAiInsightsEnabled: boolean = false;
  generateClosingTicketTagData: any;
  @Output() aiTicketIntelligence = new EventEmitter<any>();
  public aspectSentiment = Sentiment;
  public showCategoryWithAI =  true;
  public showReplyButtonInSideCategory = false;
  isAgentIqEnabled: boolean = false;
  genAiData: any;
  closureApproved: boolean = false;
  loader: boolean = false;
  noteLoader: boolean = false;
  showIqOnDirectClose: boolean = false;
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
  mediaAttachments: any[] = [];
  deleteFromLoader: boolean = false;
  channelgroup =  ChannelGroup;
  constructor(
    private _ticketService: TicketsService,
    private _postDetailService: PostDetailService,
    private _replyService: ReplyService,
    private _filterService: FilterService,
    private _mapLocobuzzService: MaplocobuzzentitiesService,
    private _tabService: TabService,
    private _filterGroupService: FilterGroupService,
    private _footericonService: FootericonsService,
    private _dialog: MatDialog,
    private _bottomSheet: MatBottomSheet,
    private _snackBar: MatSnackBar,
    private MapLocobuzz: MaplocobuzzentitiesService,
    private _modalService: ModalService,
    private dialog: MatDialog,
    private ngZone: NgZone,
    private cdkRef:ChangeDetectorRef,
    private _sidebar: SidebarService,
    private cdk: ChangeDetectorRef,
    private _navService: NavigationService,
    private _userDetailService: UserDetailService,
    private translateService : TranslateService,
    private _aiTicketTagService: AiTicketTagService,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    @Inject(DOCUMENT) private doucument: Document
  ) {
    let onLoadOpenCallDetail = true;
    this.effectOpenCallDetailWindowSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.openCallDetailWindowSignal() : untracked(() => this._ticketService.openCallDetailWindowSignal());
        if (!onLoadOpenCallDetail && this.clearSignal()){
          this.voipFootDisable = value;
        } else {
          onLoadOpenCallDetail = false;
        }
          // this.cdkRef.detectChanges();
      }, { allowSignalWrites: true });

    let onLoadTicketForRefresh = true;
    this.effectSetTicketForRefreshSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.setTicketForRefreshSignal() : untracked(() => this._ticketService.setTicketForRefreshSignal());
      if (!onLoadTicketForRefresh && value && this.clearSignal()) {
        this.postFootDisable = true;
        // this.cdkRef.detectChanges();
        this._ticketService.setTicketForRefreshSignal.set(null);
      } else {
        onLoadTicketForRefresh = false;
      }
    }, { allowSignalWrites: true });

    let onLoadCRMDetails = true;

    this.effectUpdateCRMDetailsSignal =effect(() => {
      const value = this.clearSignal() ? this._ticketService.updateCRMDetailsSignal() : untracked(() => this._ticketService.updateCRMDetailsSignal());
      if (!onLoadCRMDetails && value && this.clearSignal()) {
        this.updateCRMDetailsSignalChange(value)
      } else  {
        onLoadCRMDetails = false;
      }
    }, { allowSignalWrites: true });

    let onLoadBrandMentionEmail = true;
    this.effectEmitBrandMentionEmailDataSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.emitBrandMentionEmailDataSignal() : untracked(() => this._replyService.emitBrandMentionEmailDataSignal());
      if (!onLoadBrandMentionEmail && value && this.clearSignal()) {
        this.emitBrandMentionEmailDataChanges(value);
      } else {
        onLoadBrandMentionEmail = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadPostDetailObject = true;
    this.effectPostDetailObjectChangedSignal = effect(() => {
      const value = this.clearSignal() ? this._replyService.postDetailObjectChangedSignal() : untracked(() => this._replyService.postDetailObjectChangedSignal());
      if (!onLoadPostDetailObject && value && this.clearSignal()) {
        if (value?.tagID == this.postData?.tagID) {
          this.postData.ticketInfo.ticketCategoryMap = value.ticketInfo.ticketCategoryMap
          this.postData.ticketInfo.ticketUpperCategory = value.ticketInfo.ticketUpperCategory
        }
      } else {
        onLoadPostDetailObject = false;
      }
    }, { allowSignalWrites: true });
    
    let onLoadCannedResponse = true;
    this.effectSelectedCannedResponseSignal= effect(() => {
      const value = this.clearSignal() ? this._replyService.selectedCannedResponseSignal() : untracked(() => this._replyService.selectedCannedResponseSignal());
      if (!onLoadCannedResponse && value && this.clearSignal()) {
        this.selectedCannedResponseSignalChanges(value)
      } else {
        onLoadCannedResponse = false;
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

  @ViewChild('clickTicketMenuTrigger') clickTicketMenuTrigger: MatMenuTrigger;
  @ViewChild('clickacknowledgeMenuTrigger')
  clickacknowledgeMenuTrigger: MatMenuTrigger;
  @ViewChild('clickRejectworkflowTrigger')
  clickRejectworkflowTrigger: MatMenuTrigger;
  isbrandPost = false;
  isbulkselectall = false;
  disabledbrandmentioncheckbox = false;
  ticketPriority: string;
  statusClass: string ='';
  crmClass: string ='';
  priorityClass: string = '';
  userpostLink?: string;
  createTicketStatus = 0;
  acknowledgednote?: string = '';
  cannedrejectnote = '';
  cannedapprovenote = '';
  createticketnote = '';
  ticketcategoryhidden = false;
  mentioncategoryhidden = false;
  replyexpirydays = '';
  showreplyDaysCounter = false;
  replyDays = false;
  showreadOption = false;
  currentBrand: BrandList;
  assignToUser: number;
  checkListLengthequaltoone = false;
  channelGroup = ChannelGroup;
  // csdlist for brand reject workflow
  customerAgentList: LocoBuzzAgent[] = [];
  customAgentListAsync = new Subject<LocoBuzzAgent[]>();
  customAgentListAsync$ = this.customAgentListAsync.asObservable();
  categoryToggle = true;
  voipFootDisable = false;
  scanLoader: boolean;
  emailHTMLView:boolean = false;
  ticketDispositionList: ticketDispositionList[] = [];
  @ViewChild('dispositionMenuTrigger') dispositionMenuTrigger: MatMenuTrigger;
  LanguageList: any[] = [];
  LanguageListCopy: any[] = [];
  selectedLanguage: string = "";
  otherAspectsDetailsList = [];
  aiAspectsDetailsList = [];
  aspectsDetailsList = {};
  tooltipPositionAbove = true;
  aiabsaEnabled:boolean = false;
  ticketToggle = true;
  showMaskedButton: boolean = false;
  labelSearchText: string = '';
  postLabels: any = [];
  postLabelsCopy: any = [];
  selectedTag: any = [];
  addLabelData: any;
  addLabelFlag: boolean = false;
  @ViewChild('labelMenuTrigger') labelMenuTrigger: MatMenuTrigger;
  @ViewChild('optionMenuTrigger') optionMenuTrigger: MatMenuTrigger;
  color: any = '#002342';
  // distinctColor = [];
  BrandWithColor = [];
  colorList = ["#4276FE", "#9D48FF", "#10DBAA", "#00DBE9", "#D739FF", "#FF44CB", "#8F8CFF", "#32E043", "#FF6E31", "#FFBC7E", "#31EF71", "#FF3939", "#F12D97", "#FF8787", "#FFF279", "#79FD76", "#50FFC0", "#55F5FF", "#89AAFF", "#EA94FF", "#FF82C5", "#FF8E95", "#ABAAF9", "#E4730A", "#F2DC16", "#0FB80B", "#00AE70", "#02A8B2", "#0F47D7", "#A906D1", "#C7086F", "#CD0410", "#4240A0"];
  filteredColorList = ["#4276FE", "#9D48FF", "#10DBAA", "#00DBE9", "#D739FF", "#FF44CB", "#8F8CFF", "#32E043", "#FF6E31", "#FFBC7E", "#31EF71", "#FF3939", "#F12D97", "#FF8787", "#FFF279", "#79FD76", "#50FFC0", "#55F5FF", "#89AAFF", "#EA94FF", "#FF82C5", "#FF8E95", "#ABAAF9", "#E4730A", "#F2DC16", "#0FB80B", "#00AE70", "#02A8B2", "#0F47D7", "#A906D1", "#C7086F", "#CD0410", "#4240A0"];
  currentSelectedLabel: any;
  usedColor = [];
  selectedLabel: any;
  addedLabels = [];
  ticketTagList = [];
  postTypeEnum = PostsType;
  defaultLayout: boolean = false;
  characterLimit: number = 35;
  userSelectedLanguage = "en";
  layout = "ltr";
  fbInstaHideTooltip: string = '';

  ngOnInit(): void {
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if(layoutType){
          this.defaultLayout = layoutType == 1 ? true : false;
          this.cdkRef.detectChanges();
        }
      })
    );
    this.subs.add(
      this._sidebarService.selectedLanguage.subscribe(res => {
        this.userSelectedLanguage = res;
        if (this._sidebarService.rtlLanguages.includes(this.userSelectedLanguage)) {
          this.layout = "rtl";
        }
      })
    );
    this.subs.add(
      this._ticketService.ticketcategoryMapChange.subscribe((value) => {
        if (value) {
          if (value?.BaseMention?.tagID === this.postData?.tagID) {
            if (value.categoryType =='ticketCategory')
            {
              this.postData.ticketInfo.ticketUpperCategory =
                value?.BaseMention.ticketInfo?.ticketUpperCategory;
            }else{
              this.postData.upperCategory = (value.BaseMention?.upperCategory) ? value.BaseMention?.upperCategory : { id: 0, name: null, userID: null, brandInfo: null };
            }
            this.postData.categoryMap = value.BaseMention?.categoryMap;
            // this.postData.upperCategory = value.upperCategory
            this.categorymapdisplay(value.BaseMention);
            this.ticketshowmore();
            this.mentionshowmore();
            this.cdkRef.detectChanges();
          }
        }
      })
    );

    this.subs.add(
      this._ticketService.ticketcategoryBulkMapChange.subscribe((value) => {
        if (value) {
          if (value.tagIds.some((obj) => obj.tagID == this.postData?.tagID)) {
            // this.postData.upperCategory = value.upperCategory
            this.postData.upperCategory = value?.postData?.upperCategory ? value.postData?.upperCategory : { id: 0, name: null, userID: null, brandInfo: null };
            this.postData.categoryMap = value?.postData?.categoryMap;
            this.postData.ticketInfo.ticketUpperCategory =
              value?.postData?.ticketInfo?.ticketUpperCategory;
            this.post = this._ticketService.mapPostByChannel(this.postData);
            this.ticketshowmore();
            this.mentionshowmore();
            this.cdkRef.detectChanges();
          }
        }
      })
    );

    this.subs.add(
      this._ticketService.unselectbulkpostTrigger.subscribe((flag:any) => {
        this.AllCheckBoxes = flag;
        this.isbulkselectall = flag;
        this.disabledbrandmentioncheckbox = false;
        this.cdkRef.detectChanges();
      })
    );


    this.subs.add(
      this._ticketService.selectExcludeBrandMention.subscribe((flag:any) => {
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
        this.cdkRef.detectChanges();
      })
    );

    this.subs.add(
      this._ticketService.deleteFromChannelSuccessMessage.subscribe(res => {
        if(res){
          this.deleteFromLoader = res?.loader;
          this.cdkRef.detectChanges();
        }
      })
    )

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

    this.ticketPriority = Priority[this.postData?.ticketInfo?.ticketPriority];
    /* thai related changes */
    const userdetals: any = this.currentUser?.data?.user || {};
    if (Object?.keys(userdetals).length > 0) {
      /* && userdetals?.isClickhouseEnabled == 1 */
      if (userdetals?.isListening && !userdetals?.isORM && userdetals.isClickhouseEnabled==1) {
        if (this.postData?.url)
        {
          this.userpostLink = this.postData?.url;
        }else{      
          this.userpostLink = this._footericonService.setOpenPostLink(
            this.postData,
            this.openReply
          );
      }
        if (this.postData?.channelType === ChannelType.InstagramMessages || this.postData?.channelType === ChannelType.DirectMessages || this.postData?.channelType === ChannelType.FBMessages) {
          this.userpostLink = null
        }
      }
      else {
        this.userpostLink = this._footericonService.setOpenPostLink(
          this.postData,
          this.openReply
        );
      }
    }
    /* thai related changes */
    // this.userpostLink = this._footericonService.setOpenPostLink(
    //   this.postData,
    //   this.openReply
    // );
    const result = this._footericonService.togglePostfootClasses(
      this.postData,
      this.ticketPriority,
      this.post
    );
    this.crmClass = result?.crmClass || '';
    this.priorityClass = result?.priorityClass || '';
    this.statusClass = result?.statusClass || '';

    // if (this.pageType === PostsType.TicketHistory) {
    //   this.ticketHistoryData =
    //     this._footericonService.setConditionsFromCommunicationLog(
    //       this.currentUser,
    //       this.ticketHistoryData,
    //       this.postData
    //     );
    // }

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

    const valueCannedResponseSignal = this._replyService.selectedCannedResponseSignal();
    if (valueCannedResponseSignal) {
      this.selectedCannedResponseSignalChanges(valueCannedResponseSignal)
    }
    // this.subs.add(
    //   this._replyService.selectedCannedResponse.subscribe((obj) => {
    //     if (obj?.text && obj?.text?.trim() !== '') {
    //       const notetype = this._postDetailService.notetype;
    //       if (notetype === 1) {
    //         this.noteTextChange(undefined, 'cannedapprovenote', true, `${this.cannedapprovenote + obj.text}`) 
    //       } 
    //       else if (notetype === 2) {
    //         this.noteTextChange(undefined, 'cannedrejectnote', true, `${this.cannedrejectnote + obj?.text}`) 
    //       }
    //       this.cdkRef.detectChanges();
    //     }
    //   })
    // );
    if (
      this.postData?.channelGroup === ChannelGroup.WhatsApp ||
      this.postData?.channelGroup === ChannelGroup.GoogleBusinessMessages ||
      this.postData?.channelType === ChannelType.FBMessages ||
      this.postData?.channelType === ChannelType.InstagramMessages
    ) {
      this.showReplyMessageExpiry();
    }
    if (
      this.postData?.channelGroup === ChannelGroup.Email &&
      this.pageType === PostsType.TicketHistory
    ) {
      this.subscribeToEvents();
    }

    if (this.postInput && this.postInput.postlength == 1) {
      this.checkListLengthequaltoone = true;
    }
    this.userToggleState = localStorage.getItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`) ? localStorage.getItem(`userInfoToggle_${this.currentUser?.data?.user?.userId}`) == 'false' ? false : true : false;
    if (this.post?.ticketcategories.length > 0) {
      for (let i = 0; i < this.post?.ticketcategories.length; i++) {
        this.post.ticketcategories[i].show = i < 3 ? true : false;
      }
    }
    if (this.post?.mentioncategories.length > 0) {
      const limit = this.userToggleState ? 1 : 3;
      for (let i = 0; i < this.post?.mentioncategories.length; i++) {
        this.post.mentioncategories[i].show = i < limit ? true : false;
      }
    }
    this.subs.add(
      this._ticketService.hideShowCategoryObs
        .pipe(filter((res) => this.postDetailTab?.guid === res?.guid))
        .subscribe((data) => {
          if (data != null) {
            if (this.postDetailTab.guid == data.guid) {
              this.categoryToggle = data.flag;
              this.cdkRef.detectChanges();
            }
          }
        })
    );
    if (this.postData?.ticketInfo.status === TicketStatus.Close) {
      this.postFootDisable = true;
    } else {
      this.postFootDisable = false;
    }

    if (this.postData?.ticketInfo.status !== TicketStatus.Close) {
      this.showreadOption = true;
    } else {
      this.showreadOption = false;
    }

    const value = this._ticketService.setTicketForRefreshSignal();
    if (value) {
      this.postFootDisable = true;
      this.cdkRef.detectChanges();
      this._ticketService.setTicketForRefreshSignal.set(null);
    }
    // this.subs.add(
    //   this._ticketService.setTicketForRefresh.subscribe((data) => {
    //     if (data) {
    //       this.postFootDisable = true;
    //       this.cdkRef.detectChanges();
    //       this._ticketService.setTicketForRefreshSignal.set(null);
    //     }
    //   })
    // );

    if (this.ticketHistoryData?.mentionid == '') {
      this.ticketHistoryData.mentionid =
        this.postData?.brandInfo.brandID +
        '/' +
        this.postData?.channelType +
        '/' +
        this.postData?.contentID;
    }
    this.makeactionableEnabled =
      this.currentUser?.data?.user?.actionButton?.makeNonactionableToActionableEnabled;
    this.isMaskingViewOrUpdateEnabled = this.currentUser?.data?.user?.actionButton?.isMaskingViewOrUpdate;

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      this.makeactionableEnabled = false
    }
    this.assignMentionORTagCategoryEnabled =
      this.currentUser?.data?.user?.actionButton?.assignMentionEnabled;
    this.ngZone.run(() => this.postData);

    // this.subs.add(
    //   this._ticketService.openCallDetailWindow.subscribe((res) => {
    //     this.voipFootDisable = res;
    //     this.cdkRef.detectChanges();
    //     // if(res){
    //     //   voipFootDisable=true
    //     // }else{

    //     // }
    //   })
    // );
    this.ngZone.run(() => this.postData);
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.postData?.brandInfo.brandID
    );
    this.scanContentFlag = brandInfo?.isPhishingSiteEnabled && this.postData?.phishingStatus == LinkStatusEnum.Unscanned?true:false;
    this.noScanLinkFound = brandInfo?.isPhishingSiteEnabled && this.postData?.phishingStatus == LinkStatusEnum.Nolink?true:false;
    this.safeorUnsafeLink = brandInfo?.isPhishingSiteEnabled && (this.postData?.phishingStatus == LinkStatusEnum.Safe) ? true : brandInfo?.isPhishingSiteEnabled && (this.postData?.phishingStatus == LinkStatusEnum.Unsafe)?false:null;
    this.isTicketDispositionFeatureEnabled =
      brandInfo?.isTicketDispositionFeatureEnabled;
      if (this._ticketService?.bulkMentionChecked?.some((obj) => obj?.guid == this.postDetailTab?.guid && obj?.mention?.tagID == this.postData?.tagID)) {
        this.checkedBox = true
      }else{
        this.checkedBox = false
      }

    this.subs.add(
      this._ticketService.uncheckedSelectedTickets.subscribe((res)=>{
        if(res==this.postDetailTab?.tab?.guid)
        {
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
    this.isTicketDispositionFeatureEnabled = brandInfo?.isTicketDispositionFeatureEnabled

    // if(this.currentUser.data.user.role == UserRoleEnum.Agent && this.currentUser.data.user.userId != this.ticketHistoryData.currentassignToId){
    //   this.postFootDisable = true;
    // }
    this.subs.add(
      this._sidebar.minimalViewSource.subscribe(res => {
        if (res == true || res == false) {
          this.minimalViewFooter = res;
          this.cdk.detectChanges();
        }
      })
    )

    /* this.subs.add(
      this._ticketService.bulkCheckboxObs.subscribe((res)=>{
        if(res?.guid===this.postDetailTab?.guid)
        {
          if(this.ticketHistoryData.showcheckbox)
          {
            this.checkedBox = res.checked;
            this.cdk.detectChanges();
          }
        }
      })
    ) */

    const postDetailObjectChanged = this._replyService.postDetailObjectChangedSignal();
    if (postDetailObjectChanged) {
      if (postDetailObjectChanged?.tagID == this.postData?.tagID) {
        this.postData.ticketInfo.ticketCategoryMap = postDetailObjectChanged.ticketInfo.ticketCategoryMap
        this.postData.ticketInfo.ticketUpperCategory = postDetailObjectChanged.ticketInfo.ticketUpperCategory
      }
    }
    /* this.subs.add(
      this._replyService.postDetailObjectChanged.subscribe((obj) => {
        if (obj?.tagID == this.postData?.tagID) {
          this.postData.ticketInfo.ticketCategoryMap = obj.ticketInfo.ticketCategoryMap
          this.postData.ticketInfo.ticketUpperCategory = obj.ticketInfo.ticketUpperCategory
        }
      }
      )
    ) */

    this.selectedTicketView =localStorage.getItem('selctedView') ?  parseInt(JSON.parse(localStorage.getItem('selctedView'))) : 1;

    this.subs.add(
      this._sidebar.onTicketViewChange.subscribe(view => {
        if (view) {
          this.selectedTicketView = view;
          this.cdkRef.detectChanges();
        }
      })
    )
    /* this.subs.add(
      this._ticketService.updateCRMDetails.subscribe((res) => {
        if (this.postData.ticketInfo.tagID == res.TagID) {
          if (res?.SrID) {
            // this.postData.ticketInfo.leadID = res?.leadID;
            // this.post.leadID = res?.leadID;
            this.postData.ticketInfo.srid = res.SrID;
            this.post.srID = res?.SrID;
            if (this.postData?.ticketInfo?.leadID) {
              this.post.leadID = this.postData?.ticketInfo?.leadID;
              this.cdk.detectChanges();
            }
          }
          if (res?.leadID) {
            this.postData.ticketInfo.leadID = res?.leadID;
            this.post.leadID = res?.leadID;
            if (this.postData?.ticketInfo?.srid) {
              this.post.srID = this.postData?.ticketInfo?.srid;
              this.cdk.detectChanges();
            }
          }
        }
      })
    ); */
    this.subs.add(
      this._ticketService.refreshSRID.subscribe((flag: any) => {
        if (flag?.TicketId == this.post?.ticketId && flag) {
          this.post.srID = flag?.SrID;
          this.cdk.detectChanges()
        }
      })
    );
    this.rightFootWidth = this.rightFoot?.nativeElement?.offsetWidth || 0;

    if (this.postData?.aspectGroupJson && this.postData?.aspectGroupJson.length) {
      this.aiAspectsDetailsList = [];
      this.otherAspectsDetailsList = [];
      // let neutralData = [];
      // let negativeData = [];
      // let positiveData = [];
      // this.postData?.aspectGroupJson.sort((a, b) => {
      //   if (a?.aspectGroupName === 'other') return 1; // push 'Other' to the end
      //   if (b?.aspectGroupName === 'other') return -1;
      //   return a?.aspectGroupName.localeCompare(b?.aspectGroupName); // normal alphabetical sort
      // });
      this.postData?.aspectGroupJson.forEach(x => {
        if (x?.scope == 1){
          if (this.postData?.aspectGroupJson.length == 1 && x?.aspectGroupName?.toLowerCase() == 'other') {
            if (x?.aspectsWithOpinion && x?.aspectsWithOpinion.length) {
              x?.aspectsWithOpinion.forEach((aspect) => {
                x.feedbackStatus = 0;
                aspect.entity = x?.entity;
                aspect.entityType = x?.entityType;
                if (aspect.sentiment == 0) {
                  if (this.postData && this.postData?.aspectNeutralFeedback && this.postData?.aspectNeutralFeedback.length) {
                    x.feedbackStatus = this.postData?.aspectNeutralFeedback[0].feedbackType;
                  }
                } else if (aspect.sentiment == 1) {
                  if (this.postData && this.postData?.aspectPostiveFeedback && this.postData?.aspectPostiveFeedback.length) {
                    x.feedbackStatus = this.postData?.aspectPostiveFeedback[0].feedbackType;
                  }
                } else if (aspect.sentiment == 2) {
                  if (this.postData && this.postData?.aspectNegativeFeedback && this.postData?.aspectNegativeFeedback.length) {
                    x.feedbackStatus = this.postData?.aspectNegativeFeedback[0].feedbackType;
                  }
                }
                if (!this.otherAspectsDetailsList.includes(aspect)) {
                  this.otherAspectsDetailsList.push(aspect);
                }
              });
            }
          } else if (x?.aspectGroupName?.toLowerCase() != 'other') {
            // const emojiMatch = x?.aspectGroupName.match(/^\p{Emoji_Presentation}|\p{Emoji}/u);
            // const emoji = emojiMatch && emojiMatch.length ? emojiMatch[0] : '';
            if (x?.icon) {
              x.aspectGroupIcon = x?.icon;
            }
            // if (emoji){
            //   x.aspectGroupName = x?.aspectGroupName.replace(emoji, '').trim();
            //   x.aspectGroupIcon = emoji;
            // }
            const firstAspectSentiment = x?.aspectsWithOpinion?.length ? x?.aspectsWithOpinion.reduce((prev, current) => {
              return (prev.sentiment > current.sentiment) ? prev : current;
            }).sentiment : 0;
            x.feedbackStatus = 0;
            x.aspectSentiment = firstAspectSentiment;
            if (firstAspectSentiment == 0) {
              if (this.postData && this.postData?.aspectNeutralFeedback && this.postData?.aspectNeutralFeedback.length) {
                x.feedbackStatus = this.postData?.aspectNeutralFeedback[0].feedbackType;
              }
            } else if (firstAspectSentiment == 1) {
              if (this.postData && this.postData?.aspectPostiveFeedback && this.postData?.aspectPostiveFeedback.length) {
                x.feedbackStatus = this.postData?.aspectPostiveFeedback[0].feedbackType;
              }
            } else if (firstAspectSentiment == 2) {
              if (this.postData && this.postData?.aspectNegativeFeedback && this.postData?.aspectNegativeFeedback.length) {
                x.feedbackStatus = this.postData?.aspectNegativeFeedback[0].feedbackType;
              }
            }
            this.aiAspectsDetailsList.push(x);
          }
        }
      });
    }
    if (this.postData?.aspectsDetailsList) {
      this.aspectsDetailsList = {};
      let neutralData = [];
      let negativeData = [];
      let positiveData = [];
      this.postData?.aspectsDetailsList.forEach(x => {
        x.feedbackStatus = 0;
        if (x.sentiment == 0) {
          if (this.postData && this.postData?.aspectNeutralFeedback && this.postData?.aspectNeutralFeedback.length) {
            x.feedbackStatus = this.postData?.aspectNeutralFeedback[0].feedbackType;
          }
          neutralData.push(x);
        } else if (x.sentiment == 1) {
          if (this.postData && this.postData?.aspectPostiveFeedback && this.postData?.aspectPostiveFeedback.length) {
            x.feedbackStatus = this.postData?.aspectPostiveFeedback[0].feedbackType;
          }
          positiveData.push(x);
        } else if (x.sentiment == 2) {
          if (this.postData && this.postData?.aspectNegativeFeedback && this.postData?.aspectNegativeFeedback.length) {
            x.feedbackStatus = this.postData?.aspectNegativeFeedback[0].feedbackType;
          }
          negativeData.push(x);
        }
      });
      this.aspectsDetailsList = {
        neutralAspect: neutralData,
        positiveAspect: positiveData,
        negativeAspect: negativeData,
      };
    }
    if (this.postData?.aiIntentIDs?.length && (this.postData?.aspectGroupJson?.length || this.postData?.aspectsDetailsList?.length)) {
      this.characterLimit = this.postData?.aiIntentIDs?.length > 1 ? 25 : 30;
    }
    if (this.postData?.aiIntentIDs?.length && (this.postData?.aspectGroupJson?.length > 1 || this.postData?.aspectsDetailsList?.length > 1)) {
      this.characterLimit = this.postData?.aiIntentIDs?.length > 1 ? 20 : 25;
    }
    const brandList: BrandList[] = this._filterService.fetchedBrandData;
    if (brandList && brandList.length) {
      const currentBrandObj = brandList.filter((obj) => {
        return +obj.brandID === +this.postData?.brandInfo?.brandID;
      });
      const currentBrand: any = currentBrandObj.length && currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;
      if (this.postData?.description && (this.postData?.description).trim()){
        const urlPattern = /^(http|https):\/\/[^\s$.?#].[^\s]*$/;
        const result = urlPattern.test((this.postData?.description).trim());
        if (!result){
          this.aiTagEnabled = currentBrand?.aiTagEnabled;
          this.isAITicketTagEnabled = currentBrand?.aiTagEnabled;
          // this.isAiInsightsEnabled = currentBrand?.isShowTicketIntelligenceNotification;
          this.isAiInsightsEnabled = false;
        }
      }

      if (currentBrand){
        this.aiabsaEnabled = currentBrand?.aiabsaEnabled;
      }
    }

    let sfdcTicketView = localStorage.getItem('sfdcTicketView');
    if(sfdcTicketView) {
      if(this.postData?.channelGroup!== ChannelGroup.Email) {
      this.ticketToggle = false;
      }
      this.sfdcTicketViewUI = true;
    }
    this.showMaskedButton = this.postData?.isMaskedMention;

    /* if crm ticket reopen direct close button enable */
    if (this.postData?.ticketInfo?.srid && this.postData?.ticketInfo?.status == TicketStatus.Open) {
      const brandInfo = this._filterService.fetchedBrandData.find((obj) => obj.brandID == String(this.postData?.brandInfo.brandID));
      if (brandInfo?.isUpdateWorkflowEnabled && (brandInfo?.crmClassName == 'TataCapitalCRM' || brandInfo?.crmClassName == 'tataunicrm' || brandInfo?.crmClassName == 'TataUniCrm')) {
        this.getCRMTicketStatus(this.postData?.ticketInfo?.ticketID);
      }
    }

    if (this.postData?.aiTicketIntelligenceModel?.ticketTagging){
      const ticketTagList = JSON.parse(this.postData?.aiTicketIntelligenceModel?.ticketTagging);
      if(ticketTagList && ticketTagList.length){
        this.ticketTagList = [];
        ticketTagList.forEach((res,index) => {
          if(res.length){
            if (typeof res[0] != 'string' && Object?.keys(res[0])?.length > 0 && 'tagName' in res[0]){
              res[0] = res[0]?.tagName
            }
            this.ticketTagList.push({ tagName: res[0], score: res[1]});
            if ((index + 1) == ticketTagList.length){
              this.cdkRef.detectChanges();
            }
          }
        })
      }
    }
    /* if crm ticket reopen direct close button enable */

    if (this.postData?.ticketInfo?.postLabelJson) {
      let selectedTag = JSON.parse(this.postData?.ticketInfo?.postLabelJson);
      selectedTag = this.normalizeLabelColors(selectedTag);
      this.addedLabels = [...selectedTag];
      this.usedColor = [...new Set(this.addedLabels.map((label) => label.color))];
      this.cdk.detectChanges();
    }
    if (userdetals?.isListening && !userdetals?.isORM && userdetals.isClickhouseEnabled == 1) {
      this.clickhouseEnabled=true
    }
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
    if(this.postDetailTab)
    {
      this.getStarttimeAndEndtime();
    }
    this.actionableParentPost = (this.postData?.markParentPostSpamType == 0 || this.postData?.markParentPostSpamType == 1 ) ? true : false;
    this.blocked = this.ticketHistoryData?.isBlockedUser;
    this.showblockchannels = (this.postData?.channelGroup == ChannelGroup.Facebook || this.postData?.channelGroup == ChannelGroup.Twitter || this.postData?.channelGroup == ChannelGroup.Youtube) ? true : false;
    
    this.subs.add(
      this._ticketService.attachmentWidthCalculationDetailViewObs
        .subscribe((res) => {
          if (res && this.mentionHistory == false && this.parentPostFlag == false) {
            this.userToggleState = true;
            if (this.post?.mentioncategories?.length > 0) {
              for (let i = 0; i < this.post?.mentioncategories?.length; i++) {
                this.post.mentioncategories[i].show = i < 1 ? true : false;
              }
            }
          } else if (this.mentionHistory == false && this.parentPostFlag == false) {
            this.userToggleState = false;
            this.mentioncategoryhidden = false;
            if (this.post?.mentioncategories?.length > 0) {
              for (let i = 0; i < this.post?.mentioncategories?.length; i++) {
                this.post.mentioncategories[i].show = i < 3 ? true : false;
              }
            }
          }
        })
    );
    if ((this.aiAspectsDetailsList?.length && this.aiabsaEnabled) || (this.otherAspectsDetailsList?.length && this.aiabsaEnabled) || (this.postData?.aiIntentIDs?.length && (this.pageType === PostsType.Tickets || this.pageType === PostsType.Mentions || this.pageType === PostsType.TicketHistory))){
      this.showCategoryWithAI = false;
    } else {
      this.showReplyButtonInSideCategory = true;
    }
    this.isAgentIqEnabled = brandInfo?.isAgentIQEnabled;
    this.showIqOnDirectClose = brandInfo?.showIQOnDirectClose;
    if ((this.postData?.channelType === ChannelType.FBComments && this.ticketHistoryData?.hideUnhideFacebookFlag) || (this.postData?.channelType === ChannelType.InstagramComments && this.ticketHistoryData?.hideUnhideInstagramFlag)) {
      this.ticketHistoryData.replyDisabled = true;
      this.fbInstaHideTooltip = this.translateService.instant(this.postData.channelType === ChannelType.FBComments ? 'This-comment-hidden-from-facebook' : 'This-comment-hidden-from-instagram');
    }
  }


  checkSpaceAndSetPosition(aspectTooltip: HTMLElement) {
    if (aspectTooltip){
      const buttonRect = aspectTooltip.getBoundingClientRect();
      const spaceAboveElement = buttonRect.top;

      if (spaceAboveElement > 400) {
        this.tooltipPositionAbove = true;
      } else {
        this.tooltipPositionAbove = false;
      }
    }
  }

  selectedCannedResponseSignalChanges(obj){
    if (obj && obj?.text && obj?.text?.trim() !== '') {
      const notetype = this._postDetailService.notetype;
      if (notetype === 1) {
        this.noteTextChange(undefined, 'cannedapprovenote', true, `${this.cannedapprovenote + obj.text}`)
      }
      else if (notetype === 2) {
        this.noteTextChange(undefined, 'cannedrejectnote', true, `${this.cannedrejectnote + obj?.text}`)
      }
      this.cdkRef.detectChanges();
    }

    if (obj && obj?.mediaAttachments?.length > 0){
      this.mediaAttachments = obj?.mediaAttachments?.map((item, index) => {
        return {
          mediaType: item?.mediaType,
          displayFileName: item?.name || item?.displayFileName,
          mediaPath: item?.url || item?.mediaPath,
          thumbUrl: item?.thumbUrl,
          mediaID: parseInt(`${item?.mediaID || 0}`),
          isCannedMedia: true
        };
      });
      this.cdkRef.detectChanges();
    }
  }

  openAspectFeedback(typePositive: boolean, aspectData: any, aspect) {
    let aspectArr = [];
    if(aspectData && aspectData.length){
      aspectData.forEach(element => {
        const data = {
          aspect: element.aspect,
          sentiment: element.sentiment,
          feedbackType: typePositive ? 1 : 2,
          feedbackmessage: typePositive ? "Thanks for your feedback." : '',
        }
        aspectArr.push(data);
      });
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translateService.instant('Something-went-wrong-later'),
        },
      });
      return
    }
    const obj = {
      Brandinfo: {
        BrandID: this.postData?.brandInfo.brandID
      },
      tagId: this.postData?.tagID,
      feedbackEnum: 1,
      feedbacktype: typePositive ? 1 : 2,
      feedback: typePositive ? "Thanks for your feedback." : '',
      AspectSentimentJson: aspectArr
    }
    if(typePositive){
      if (this.postData && this.postData?.aspectNeutralFeedback && this.postData?.aspectNeutralFeedback.length && aspectData[0].sentiment != 0){
        aspectArr = [...aspectArr, ...this.postData?.aspectNeutralFeedback]
      }
      if (this.postData && this.postData?.aspectNegativeFeedback && this.postData?.aspectNegativeFeedback.length && aspectData[0].sentiment != 2) {
        aspectArr = [...aspectArr, ...this.postData?.aspectNegativeFeedback]
      }
      if (this.postData && this.postData?.aspectPostiveFeedback && this.postData?.aspectPostiveFeedback.length && aspectData[0].sentiment != 1) {
        aspectArr = [...aspectArr, ...this.postData?.aspectPostiveFeedback]
      }
      obj.AspectSentimentJson = aspectArr
      aspectData[0].feedbackStatus = 1;
      this.cdkRef.detectChanges();
      this.sendAspectFeedbackApi = this._ticketService.sendAspectFeedback(obj).subscribe(res => {
        if (res?.success) {
          aspect.feedbackStatus = 1;
          switch (aspectData[0].sentiment) {
            case 0:
              this.postData.aspectNeutralFeedback = aspectArr.filter(aspect => aspect.sentiment == 0);
              break;
            case 1:
              this.postData.aspectPostiveFeedback = aspectArr.filter(aspect => aspect.sentiment == 1);;
              break;
            case 2:
              this.postData.aspectNegativeFeedback = aspectArr.filter(aspect => aspect.sentiment == 2);;
              break;
          }
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translateService.instant('Thanks-for-your-feedback'),
            },
          });
        } else {
          aspect.feedbackStatus = 0;
          aspectData[0].feedbackStatus = 0;
          this.cdkRef.detectChanges();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translateService.instant('Something-went-wrong-later'),
            },
          });
        }
      }, err => {
        aspect.feedbackStatus = 0;
        aspectData[0].feedbackStatus = 0;
        this.cdkRef.detectChanges();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translateService.instant('Something-went-wrong-later'),
          },
        });
      })

    } else {
      const dialogRef = this.dialog.open(AspectFeedbackPageComponent, {
        width: '40vw',
        data: {aspectData:obj, postData:this.postData},
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          aspectData[0].feedbackStatus = 2;
          aspect.feedbackStatus = 2;
          switch (aspectData[0].sentiment) {
            case 0:
              this.postData.aspectNeutralFeedback = result.filter(aspect => aspect.sentiment == 0);
              break;
            case 1:
              this.postData.aspectPostiveFeedback = result.filter(aspect => aspect.sentiment == 1);;
              break;
            case 2:
              this.postData.aspectNegativeFeedback = result.filter(aspect => aspect.sentiment == 2);;
              break;
          }
          this.cdkRef.detectChanges();
        }
      });
    }
  };

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

  subscribeToEvents() {
    const value = this._replyService.emitBrandMentionEmailDataSignal();
    if (value) {
      this.emitBrandMentionEmailDataChanges(value);
    }
    // this.subs.add(
    //   this._replyService.emitBrandMentionEmailData.subscribe(
    //     (brandEmailReadObj) => {
    //       if (brandEmailReadObj) {
    //         let checkRole;
    //         if (brandEmailReadObj.markAsReadUserAccount !== '') {
    //           const roles = JSON.parse(brandEmailReadObj.markAsReadUserAccount);
    //           if (roles) {
    //             checkRole = roles.findIndex(
    //               (obj) => obj.UserRole === this.currentUser.data.user.role
    //             );
    //           }
    //         }
    //         if (
    //           brandEmailReadObj.isMentionReadCompulsory &&
    //           checkRole > -1 &&
    //           this.postData.ticketInfo.status !== TicketStatus.Close
    //         ) {
    //           this.showreadOption = true;
    //         } else {
    //           this.showreadOption = false;
    //         }
    //         this.cdkRef.detectChanges();
    //       }
    //     }
    //   )
    // );
  }

  emitBrandMentionEmailDataChanges(brandEmailReadObj){
    if (brandEmailReadObj) {
      let checkRole;
      if (brandEmailReadObj?.markAsReadUserAccount !== '') {
        const roles = JSON.parse(brandEmailReadObj.markAsReadUserAccount);
        if (roles) {
          checkRole = roles.findIndex(
            (obj) => obj.UserRole === this.currentUser?.data?.user?.role
          );
        }
      }
      if (
        brandEmailReadObj?.isMentionReadCompulsory &&
        checkRole > -1 &&
        this.postData?.ticketInfo?.status !== TicketStatus.Close
      ) {
        this.showreadOption = true;
      } else {
        this.showreadOption = false;
      }
      // this.cdkRef.detectChanges();
    }
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
            this.replyexpirydays = String(remainingDays);
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

  ngOnDestroy(): void {
    this.clearSignal.set(false);
    this.rightFoot = null;
    this.cdkRef.detectChanges();
    this.subs.unsubscribe();
    if (this.UnBlockPagesAndHandlesApi){
    this.UnBlockPagesAndHandlesApi.unsubscribe();
    }
    if (this.BlockPagesAndHandlesApi){
    this.BlockPagesAndHandlesApi.unsubscribe();
    }
    this.clearAllVariables();    
  }
  public get postActionEnum(): typeof PostActionEnum {
    return PostActionEnum;
  }
  public get getSentiment(): typeof Sentiment {
    return Sentiment;
  }
  public get postDisplayTypeEnum(): typeof PostDisplayTypeEnum {
    return PostDisplayTypeEnum;
  }
   PostsType= PostsType;
  

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

  postSelect(checkedStatus, ticketID): void {
    this.checkedBox=checkedStatus
    /* this._ticketService.unselectedMention.next(true) */
    this._ticketService.unselectedMentionSignal.set(true)
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.selectPost,
      param: { checkedStatus, ticketID },
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
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translateService.instant('Ticket-Priority-Successfully-Changed'),
            },
          });
        }

        const result = this._footericonService.togglePostfootClasses(
          this.postData,
          this.ticketPriority,
          this.post
        );
        this.crmClass = result.crmClass;
        this.priorityClass = result.priorityClass;
        this.statusClass = result.statusClass;
        this.cdkRef.detectChanges();
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  openCategoryDialog(event, aI_Category?:boolean,isUppercategory?:boolean): void {
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
        width: isUppercategory ? '20vw' : '73vw',
        panelClass: ['responsive__modal--fullwidth'],
        disableClose: false, 
        data: isUppercategory ? { onlyUpperCategory: true, manualUpperCategory: !aI_Category } : null
    });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this.cdk.detectChanges();
        }
      });
  }
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
        this.cdkRef.detectChanges();
      }
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
    this.ReplyApi1 = this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data.success) {
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);

        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        /* this._ticketService.ticketWorkFlowObs.next(
          this.postData?.ticketInfo.ticketID
        ); */
        this._ticketService.ticketWorkFlowObsSignal.set(
          this.postData?.ticketInfo.ticketID
        );
        this.cannedapprovenote = '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translateService.instant('ticket-approved-success'),
          },
        });
        this.cdkRef.detectChanges();
      } 
      else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this.translateService.instant('Some-error-occurred'),
          },
        });
      }
      this.mediaAttachments = [];
    });
  }

  makeactionable(ticketHistoryData: AllBrandsTicketsDTO): void {
    const source = this._mapLocobuzzService.mapMention(this.postData);
    const sourceobj = {
      Source: source,
      NonActionableAuthorName: 'Anonymous',
      actionTaken: 0,
    };
    this.MarkActionableApi = this._replyService.MarkActionable(sourceobj).subscribe((data) => {
      // ticketHistoryData.showMarkactionable = false;
      // ticketHistoryData.showTicketWindow = true;
      this.postData.isActionable = true;
      this.postData.ticketInfo.caseCreatedDate = moment().format("yyyy-MM-DDTHH:MM:ss");
      this.postData.modifiedDate = moment().format("yyyy-MM-DDTHH:MM:ss");
      this.postData.ticketInfo.ticketID = data.ticketID;
      this.postData.ticketID = data.ticketID;
      this.post.ticketId = data.ticketID;
      this._postDetailService.makeActionableFlag = true;
      /* this._ticketService.actionableNonActionableCountObs.next({
        guid: this.postDetailTab.tab.guid,
        actionableFlag: true,
      }); */
      this._ticketService.actionableNonActionableCountObsSignal.set({
        guid: this.postDetailTab.tab.guid,
        actionableFlag: true,
      });
      this.cdkRef.detectChanges();
      this.openTicketDetail();
    });
  }

  openTicketDetail(): void {
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.openTicketDetail,
    });
  }

  replyPost(): void {
    // this._ticketService.closeAlreadyOpenReplyPopup.next(this.postData);
    this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);

    this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyPost });
  }

  assignTicket(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.assignTickets });
  }

  changeAssignTicket(): void {
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

  attachTicket(): void {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.attachTickets});
    if (this.postData?.replyInitiated) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translateService.instant('Previous-request-pending-for-this-ticket'),
        },
      });
      return;
    }

    this._postDetailService.postObj = this.postData;

    const brandObj = {
      BrandName: this.postData.brandInfo.brandName,
      BrandId: this.postData?.brandInfo.brandID,
    };

    const keyObj = {
      BrandInfo: brandObj,
      AuthorId: this.postData?.author.socialId,
      ChannelGroup: this.postData?.channelGroup,
    };

    this.getAuthorTicketsapi = this._ticketService.getAuthorTickets(keyObj).subscribe((data) => {
      if (data.success) {
        const ticketlist = data.data.find((obj) => Number(obj.ticketId) !== Number(this.postData?.ticketInfo.ticketID));
        if (ticketlist) {
          const replyPostRef = this._bottomSheet.open(AttachTicketComponent, {
            ariaLabel: 'Attach Ticket',
            panelClass: ['post-reply__wrapper', 'post-attach__ticket'],
            backdropClass: 'no-blur',
            data: { CurrentPost: this.postData },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translateService.instant('no-tickets-to-attach'),
            },
          });
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translateService.instant('Some-error-occurred'),
          },
        });
      }
    });
  }

  replyEscalate(): void {
    // this._ticketService.closeAlreadyOpenReplyPopup.next(this.postData);
    this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyEscalate });
  }

  openCopyMove(): void {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyEscalate});
    const dialogRef = this._dialog.open(CopyMoveComponent, {
      width: '650px',
    });
  }

  translateText(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.translateText });
  }

  enableMakerChecker(status): void {
    this._postDetailService.postObj = this.postData;
    const source = this._mapLocobuzzService.mapMention(
      this._postDetailService.postObj
    );
    const object = {
      Source: source,
      Ismakercheckerstatus: status,
      actionFrom: 0,
    };

    this.enableTicketMakerCheckerApi = this._ticketService.enableTicketMakerChecker(object).subscribe((data) => {
      if (JSON.parse(JSON.stringify(data)).success) {
        // console.log('Maker Checker', data);
        if (status) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translateService.instant('reply-approval-enabled'),
            },
          });
          this.ticketHistoryData.isTicketAgentWorkFlowEnabled = false;
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translateService.instant('reply-approval-disabled'),
            },
          });
          this.ticketHistoryData.isTicketAgentWorkFlowEnabled = true;
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translateService.instant('Error-Occured'),
          },
        });
      }
    });
  }

  markInfluencer(): void {
    this._postDetailService.postObj = this.postData;
    this._dialog.open(PostMarkinfluencerComponent, {
      autoFocus: false,
      width: '650px',
    });
  }

  sendPostForwardEmail(newThread?) {
    // this._ticketService.closeAlreadyOpenReplyPopup.next(this.postData);
    this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.sendPostForwardEmail, emailType: newThread });
  }

  sendPostEmail(): void {
    // this._ticketService.closeAlreadyOpenReplyPopup.next(this.postData);
    this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.sendPostEmail });
  }

  openTicketDetailInNewTab(): void {
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.openTicketInNewTab,
    });
    this._postDetailService.postObj = this.postData;
    this._postDetailService.ticketOpenDetail = this.postData;
    this._postDetailService.refreshNewTab = false;
    this._postDetailService.openInNewTab = true;
    /* this._postDetailService.currentPostObject.next(
      this.postData?.ticketInfo.ticketID
    ); */
    this._postDetailService.currentPostObjectSignal.set(
      this.postData?.ticketInfo.ticketID
    );
    const tab: Tab = {};
    tab.tabName = this.postData?.author.name
      ? this.postData?.author.name
      : 'Anonymous';
    const filterObj = this._filterService.getGenericFilter();
    const brands = [];
    brands.push(this.postData?.brandInfo);
    filterObj.brands = brands;
    filterObj.simpleSearch = String(this.postData?.ticketInfo.ticketID);
    filterObj.postsType = PostsType.TicketHistory;
    tab.tabDescription = `Ticket Detail - ${this.postData?.ticketInfo.ticketID}`;
    tab.Filters = filterObj;
    this.saveNewTabApi = this._filterGroupService.saveNewTab(tab).subscribe((response) => {
      if (response.success) {
        this._tabService.OpenNewTab(response.tab);
      }
    });
  }

  directCloseTicket(): void {
    if (this.postData?.replyInitiated) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translateService.instant('Previous-request-pending-for-this-ticket'),
        },
      });
      return;
    }

    let isticketagentworkflowenabled = false;
    const currentteamid = +this.currentUser?.data?.user?.teamID;
    let isAgentHasTeam = false;
    if (currentteamid !== 0) {
      isAgentHasTeam = true;
    }

    isticketagentworkflowenabled =
      this.postData?.ticketInfo.ticketAgentWorkFlowEnabled;
    const isworkflowenabled = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postData?.brandInfo.brandID
    );

    if (
      !isAgentHasTeam &&
      this.currentUser?.data?.user?.role === UserRoleEnum.Agent &&
      isworkflowenabled.isEnableReplyApprovalWorkFlow &&
      (isticketagentworkflowenabled ||
        this.currentUser.data.user.agentWorkFlowEnabled)
    ) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            this.translateService.instant('direct_close_msg'),
        },
      });
      return;
    }

    const directCloseFlag = localStorage.getItem('directCloseFlag')
    let obj = {
      brand_name: this.postData?.brandInfo?.brandName,
      brand_id: this.postData?.brandInfo?.brandID,
      author_id: this.postData?.author.socialId,
      author_name: this.postData?.author?.name ? this.postData?.author?.name : '',
      channel_group_id: this.postData?.channelGroup,
      ticket_id: this.postData?.ticketID,
      channel_type: this.postData?.channelType,
      tag_id: this.postData?.tagID,
    };
    if (directCloseFlag == 'true') {
      if (this.aiTagEnabled) {
        this.loader = true;
        this._ticketService.generateClosingTicketTag(obj).subscribe(
          (result) => {
            this.loader = false;
            if (result.success) {
              this.generateClosingTicketTagData = result.data;
              this.aiTicketIntelligence.emit(this.generateClosingTicketTagData);
            } else {
              this.generateClosingTicketTagData = [];
              this.aiTicketIntelligence.emit({});
            }
            this.postActionTypeEvent.emit({
              actionType: PostActionEnum.closeTicket,
            });
          }, (error) => {
            this.loader = false;
            this.postActionTypeEvent.emit({
              actionType: PostActionEnum.closeTicket,
            });
          }
        );
        this.getBrandAllTicketTags();
        return;
      } else {
        this.postActionTypeEvent.emit({
          actionType: PostActionEnum.closeTicket,
        });
      }
    }
    else {
      const message = '';
      if (this.aiTagEnabled) {
        const dialogData = new AlertDialogModel(
          'Are you sure you want to close this ticket?',
          message,
          'Yes',
          'No',
          false,
          [
            {
              label: 'Skip this confirmation',
              id: '',
              type: 'checkbox',
              // catMapCheckBox:true,
            },
          ],
        );
        dialogData.bulkClose = true;
        const dialogRef = this._dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });

        let checkboxFlag:boolean = false;
        dialogRef.componentInstance.inputEvent.subscribe((data) => {
          checkboxFlag = data;
        });
        dialogRef.afterOpened().subscribe(() => {
          dialogRef?.componentInstance?.bulkContinue?.subscribe(() => {
            this._ticketService.generateClosingTicketTag(obj).subscribe((result) => {
              if (dialogRef?.componentInstance) {
                dialogRef?.componentInstance?.setLoading(false);
              }
              dialogRef.close(true);
              if (result.success) {
                this.generateClosingTicketTagData = result.data;
                this.aiTicketIntelligence.emit(this.generateClosingTicketTagData);
              } else {
                this.generateClosingTicketTagData = [];
                this.aiTicketIntelligence.emit({});
              }
              localStorage.setItem('directCloseFlag', `${checkboxFlag}`)
              this.postActionTypeEvent.emit({
                actionType: PostActionEnum.closeTicket,
              });
            }, (error) => {
              dialogRef.close(true);
              localStorage.setItem('directCloseFlag', `${checkboxFlag}`)
              this.postActionTypeEvent.emit({
                actionType: PostActionEnum.closeTicket,
              });
            });
            this.getBrandAllTicketTags();
          });
        });
      } else {
      const dialogData = new AlertDialogModel(
        this.translateService.instant('Are-you-sure-close-ticket'),
        message,
        'Yes',
        'No',
        false,
        [
          {
            label: 'Skip this confirmation',
            id: '',
            type: 'checkbox',
            // catMapCheckBox:true,
          },
        ],
      );
      const dialogRef = this._dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });

      let checkboxFlag:boolean = false;
      dialogRef.componentInstance.inputEvent.subscribe((data) => {
        checkboxFlag = data;
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          // const brandInfo = this._filterService.fetchedBrandData.find((obj) => obj.brandID = this.postData?.brandInfo.brandID)
          // if (brandInfo && brandInfo.isTicketDispositionFeatureEnabled ) {
          //   this.ticketDispositionDialog();
          // }else{
          localStorage.setItem('directCloseFlag', `${checkboxFlag}`)
          this.postActionTypeEvent.emit({
            actionType: PostActionEnum.closeTicket,
          });
          // }
          // this.postFootDisable = true;
          // this.ssreLiveWrongKeep();
        } else {
          // this.ssreLiveWrongDelete();
        }
      });
    }
    }
    // this.directCloseAction.emit();
  }

  directCloseTicketWithNote(): void {
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.closeTicket,
      param: { NoteFlag: true },
      isDispositionList: this.ticketDispositionList.length > 0 ? true : false
    });
    if (this.aiTagEnabled && !this.closureApproved) {
      this.generateClosingTicketTag();
      this.getBrandAllTicketTags();
    }
    // this.directCloseAction.emit();
  }

  generateClosingTicketTag(): void {
    let obj = {
      brand_name: this.postData?.brandInfo?.brandName,
      brand_id: this.postData?.brandInfo?.brandID,
      author_id: this.postData?.author.socialId,
      author_name: this.postData?.author?.name ? this.postData?.author?.name : '',
      channel_group_id: this.postData?.channelGroup,
      ticket_id: this.postData?.ticketID,
      channel_type: this.postData?.channelType,
      tag_id: this.postData?.tagID,
    }
    this._ticketService.directCloseStatus.next(true);
    this._ticketService.generateClosingTicketTag(obj).subscribe((result) => {
      this._ticketService.directCloseStatus.next(false);
      if (result.success) {
        this.generateClosingTicketTagData = result.data;
        this.aiTicketIntelligence.emit(this.generateClosingTicketTagData);
      } else {
        this.generateClosingTicketTagData = [];
        this.aiTicketIntelligence.emit({});
      }
    }, (err) => {
      this._ticketService.directCloseStatus.next(false);
    });
  }

  getBrandAllTicketTags(): void {
    this._aiTicketTagService.GetAllBrandTags(this.postData?.brandInfo?.brandID).subscribe((res) => {
    });
  }

  createTicketCall(): void {
    if (this.postData?.ticketInfo.ticketID) {
      this.getMentionCountByTicektIDApi =this._ticketService
        .getMentionCountByTicektID(this.postData?.ticketInfo.ticketID)
        .subscribe((data) => {
          if (data.success) {
            if (+data.data === 1) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this.translateService.instant('Ticket-does-not-have-multiple-mentions'),
                },
              });
              this.clickTicketMenuTrigger.closeMenu();
            } else {
              this.createticketnote = '';
              this.clickTicketMenuTrigger.openMenu();
            }
            this.cdkRef.detectChanges();
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                  type: notificationType.Error,
                  message: this.translateService.instant('Error-Occured'),
              },
            });
            this.createticketnote = '';
            this.clickTicketMenuTrigger.closeMenu();
            this.cdkRef.detectChanges();
          }
        });
    }

    if (
      this.postData?.ticketInfo.status ===
        TicketStatus.PendingwithCSDWithNewMention ||
      this.postData?.ticketInfo.status ===
        TicketStatus.OnHoldCSDWithNewMention ||
      this.postData?.ticketInfo.status ===
        TicketStatus.PendingWithBrandWithNewMention ||
      this.postData?.ticketInfo.status ===
        TicketStatus.RejectedByBrandWithNewMention ||
      this.postData?.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention
    ) {
      // call api
      const bulkcreateTicket: BulkOperationObject[] = [];

      const obj = {
        ticketID: this.postData?.ticketID,
        tagID: this.postData?.tagID,
        mentionID: null,
        brandID: this.postData?.brandInfo.brandID,
        brandName: this.postData?.brandInfo.brandName,
        assignedTo: 0,
      };
      bulkcreateTicket.push(obj);
      this.CheckTicketIfPendingWithnewMentionApi = this._ticketService
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

  createTicket(note): void {
    const performActionObj = this._replyService.BuildReply(
      this.postData,
      ActionStatusEnum.CreateTicket,
      note
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

    this.ReplyApi2 =this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data?.success) {
        // this._filterService.currentBrandSource.next(true);
        this._bottomSheet.dismiss();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translateService.instant('ticket-created-success'),
          },
        });
        this.cdkRef.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this.translateService.instant('Some-error-occurred'),
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
      ticketIDs: [this.postData?.ticketInfo.ticketID],
      tagIds: [this.postData?.tagID],
      mentionIDs: [
        this.postData?.brandInfo.brandID +
          '/' +
          this.postData?.channelType +
          '/' +
          this.postData?.contentID,
      ],
      source: performActionObj.Source,
      status: this.createTicketStatus,
      actionType: 1,
      isTicketGoingForApproval: false,
      actionTaken: ActionTaken.Locobuzz,
    };

    this.CreateAttachMultipleMentionsApi = this._replyService
      .CreateAttachMultipleMentions(keyObj)
      .subscribe((data) => {
        if (data?.success) {
          // this._filterService.currentBrandSource.next(true);
          // this._bottomSheet.dismiss();
          // this._ticketService.ticketStatusChange.next(true);
          this._ticketService.setTicketForRefreshSignal.set(true);
          this._ticketService.setLatestTicket = data.newTicketID;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translateService.instant('ticket-created-success'),
            },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data.message : this.translateService.instant('some-error-occurred'),
            },
          });
        }
        // this.zone.run(() => {
      });
  }

  ssreSimulationRightPopupLogic(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.ssreSimRight });
  }

  ssreSimulationWrongPopupLogic(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.ssreSimWrong });
  }

  ssreLiveRightVerified(): void {
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.ssreLiveRightVerified,
    });
  }

  ssreLiveWrongPopupLogic(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.ssreLiveWrong });
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
      +this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount
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

    this.Reply3Api = this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data?.success) {
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);

        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        /* this._ticketService.ticketWorkFlowObs.next(
          this.postData?.ticketInfo.ticketID
        ); */
        this._ticketService.ticketWorkFlowObsSignal.set(
          this.postData?.ticketInfo.ticketID
        );
        this.cannedrejectnote = '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translateService.instant('ticket-rejected-success'),
          },
        });
        this.cdkRef.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this.translateService.instant('some-error-occurred'),
          },
        });
      }
      this.mediaAttachments = [];
    });
  }

  openSubscribePopup(): void {
    this._dialog.open(PostSubscribeComponent, {
      autoFocus: false,
      width: '800px',
      data: this.postData,
      disableClose: true,
    });
  }

  replyModified(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyModified });
  }

  replyApproved(): void {
    const source = this._mapLocobuzzService.mapMention(this.postData);
    const sourceobj = {
      Source: source,
      EscalationNote: '',
      ActionTaken: 0,
    };
    this.ReplyApprovedApi = this._replyService.ReplyApproved(sourceobj).subscribe((data) => {
      // console.log('reply approved successfull ', data);
      // this._filterService.currentBrandSource.next(true);
      this._filterService.currentBrandSourceSignal.set(true);
      // this.dialogRef.close(true);
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: this.translateService.instant('reply-approved-success'),
        },
      });
      // this.zone.run(() => {
    });
  }

  replyRejected(note): void {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyRejected, param: {note}});
    if (note.trim()) {
      const source = this._mapLocobuzzService.mapMention(this.postData);

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

      this.ReplyRejectedApi = this._replyService.ReplyRejected(sourceObj).subscribe((data) => {
        if (data?.success){
          // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);

          // this.dialogRef.close(true);
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translateService.instant('reply-rejected-success'),
            },
          });
        }
        else{
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data?.message : this.translateService.instant('some-error-occurred'),
            },
          });
        }
      });
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translateService.instant('note-required'),
        },
      });
    }
  }

  acknowlegeCall(): void {
    if (this.postData?.ticketInfo.ticketID) {
      this.clickacknowledgeMenuTrigger.openMenu();
      this.acknowledgednote = ''
    }
  }

  AcknowledgeTicket(): void {
    const performActionObj = this._replyService.BuildReply(
      this.postData,
      ActionStatusEnum.Acknowledge,
      this.acknowledgednote,
      this.postData?.ticketInfo.ticketID
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

    this.Reply4Api = this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data?.success) {
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);
        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        this._ticketService.acknowledgeSucessObs.next({tagID:this.postData?.tagID,guid:this.postDetailTab?.guid})
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translateService.instant('ticket-acknowledged-successfully'),
          },
        });
        this.cdkRef.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message :  this.translateService.instant('some-error-occurred'),
          },
        });
      }
    });
  }

  copied(name): void {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Success,
        message: this.translateService.instant(name) + ' ' + this.translateService.instant('copied-success'),
      },
    });
  }

  // type indicates whether its for approve or reject
  CannedResponse(type: number): void {
    this._postDetailService.notetype = type; // 1 - approve // 2 - reject
    
    this.mediaAttachments = [];
    
    this._dialog.open(CannedResponseComponent, {
      autoFocus: false,
      width: '50vw',
      //data: this.postData,
      data: { mention: this.postData, isMediaValidationBypass: true },
    });
  }

  clearnote(brandRejection = false): void {
    this.cannedapprovenote = '';
    this.cannedrejectnote = '';
    this.createticketnote = '';
    if (brandRejection) {
      this.checkIfBrandReplyAndReject();
    }
    this.cdkRef.detectChanges();
  }

  deleteFromLocobuzz(): void {
    const message = '';
    const dialogData = new AlertDialogModel(
      this.translateService.instant('delete-post-from-locobuzz'),
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
        // this.ssreLiveWrongKeep();
        this.deleteFromLoader = true;
        this.postActionTypeEvent.emit({
          actionType: PostActionEnum.deleteFromLocobuzz,
        });
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }

  deleteFromSocial(): void {
    const message = '';
    const dialogData = new AlertDialogModel(
      this.translateService.instant('sure-you-delete-this-post-from-social-media'),
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
        this.deleteFromLoader = true;
        // this.ssreLiveWrongKeep();
        this.postActionTypeEvent.emit({
          actionType: PostActionEnum.deleteFromSocial,
        });
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }

  deleteFromSocialAndTool(){
    const message = '';
    const dialogData = new AlertDialogModel(
      this.translateService.instant('sure-you-want-locobuzz'),
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
        // this.ssreLiveWrongKeep();
        this.deleteFromLoader = true;
        this.postActionTypeEvent.emit({
          actionType: PostActionEnum.deleteFromBoth,
        });
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }

  markAsRead(): void {
    const obj = {
      brandInfo: {
        brandID: this.postData?.brandInfo.brandID,
        brandName: this.postData?.brandInfo.brandName,
      },
      TicketTagIds: [
        {
          CaseID: this.postData?.ticketInfo.ticketID,
          TagID: this.postData?.tagID,
        },
      ],
    };
    this.MarkMentionAsReadApi = this._replyService.MarkMentionAsRead(obj).subscribe((resp) => {
      if (resp.success) {
        this.markAsReadEvent.emit(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translateService.instant('mention-marked-as-read'),
            },
        });
        this.postData.thisMentionIsRead = true;
        if (this._replyService.mentionReadReceipt.length > 0) {
          for (
            let i = 0;
            i < this._replyService.mentionReadReceipt.length;
            i++
          ) {
            if (
              this._replyService.mentionReadReceipt[i].ticketId ===
              this.postData?.ticketInfo.ticketID
            ) {
              for (
                let j = 0;
                j < this._replyService.mentionReadReceipt[i].tagIdList.length;
                j++
              ) {
                if (
                  this._replyService.mentionReadReceipt[i].tagIdList[j]
                    .tagId === this.postData?.tagID
                ) {
                  this._replyService.mentionReadReceipt[i].tagIdList[j].isRead =
                    true;
                }
              }
              const findUnreadIndex = this._replyService.mentionReadReceipt[
                i
              ].tagIdList.findIndex((obj) => obj.isRead === false);
              if (findUnreadIndex > -1) {
              } else {
                const obj: EmailReadReceipt = {
                  message: 'setting expire to false',
                  baseMention: this.postData,
                  status: false,
                };
                this._replyService.checkEmailReadReceipt.next(obj);
                this._replyService.emitEmailReadStatusSignal.set({
                  ticketId: this.postData?.ticketInfo.ticketID,
                  status: true,
                });
              }
            }
          }
        }
      }
    });
  }
  mentionshowmore(): void {
    if (this.userToggleState == true && this.mentionHistory == false && this.parentPostFlag == false) {
      this.mentioncategoryhidden = false;
      for (let i = 0; i < this.post?.mentioncategories?.length; i++) {
        this.post.mentioncategories[i].show = i < 1 ? true : false;
      }
    } else if (this.mentioncategoryhidden == true) {
      this.mentioncategoryhidden = true;
      for (let i = 0; i < this.post?.mentioncategories.length; i++) {
        this.post.mentioncategories[i].show = true;
      }
    } else {
      this.mentioncategoryhidden = false;
      for (let i = 0; i < this.post?.mentioncategories.length; i++) {
        this.post.mentioncategories[i].show = i < 3 ? true : false;
      }
    }

    // this.postData?.categoryMap.forEach((obj) => {
    //   if (this.post.mentioncategories.some((post) => post.name == obj.name)) {
    //     const mentionCategoy = this.post.mentioncategories.find(
    //       (post) => post.name == obj.name
    //     );
    //     obj.sentiment = mentionCategoy.sentiment;
    //   }
    // });
  }

  ticketshowmore(): void {
    if (!this.ticketcategoryhidden) {
      this.ticketcategoryhidden = true;
      for (let i = 0; i < this.post?.ticketcategories.length; i++) {
        this.post.ticketcategories[i].show = true;
      }
    } else {
      this.ticketcategoryhidden = false;
      for (let i = 0; i < this.post?.ticketcategories.length; i++) {
        this.post.ticketcategories[i].show = i < 3 ? true : false;
      }
    }
    // this.postData?.ticketInfo.ticketCategoryMap.forEach((obj) => {
    //   if (this.post.ticketcategories.some((post) => post.name == obj.name)) {
    //     const ticketCategoy = this.post.ticketcategories.find(
    //       (post) => post.name == obj.name
    //     );
    //     obj.sentiment = ticketCategoy.sentiment;
    //   }
    // });
  }
  trendsModal() {
    this._postDetailService.postObj = this.postData;
    /* this._postDetailService.currentPostObject.next(
      this.postData?.ticketInfo.ticketID
    ); */
    this._postDetailService.currentPostObjectSignal.set(
      this.postData?.ticketInfo.ticketID
    );
    this._dialog.open(TrendsComponent, {
      autoFocus: false,
      panelClass: ['full-screen-modal'],
      data: { postData: this.postData },
    });
  }

  buildAgentUserList(csdList: LocoBuzzAgent[]): void {
    let agentCSdList: LocoBuzzAgent[] = csdList;
    if (+this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare) {
      agentCSdList = csdList.filter((obj) => {
        return obj.userRole === UserRoleEnum.BrandAccount;
      });
    } else if (+this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount) {
      agentCSdList = csdList.filter((obj) => {
        return obj.userRole === UserRoleEnum.CustomerCare;
      });
    } else {
      if (csdList && csdList.length > 0) {
        agentCSdList = csdList.filter((obj) => {
          if (this.currentBrand?.isBrandworkFlowEnabled) {
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
      this.postData?.ticketInfo.escalatedTo > 0 ||
      this.postData?.ticketInfo.escalatedToCSDTeam > 0
    ) {
      let idtoattch = 0;

      if (this.postData?.ticketInfo.escalatedTo > 0) {
        idtoattch = this.postData?.ticketInfo.escalatedTo;
      } else {
        idtoattch = this.postData?.ticketInfo.escalatedToCSDTeam;
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

  checkIfBrandReplyAndReject(): void {
    const brandList: BrandList[] = this._filterService.fetchedBrandData;
    if (brandList) {
      const currentBrandObj = brandList.filter((obj) => {
        return +obj.brandID === +this.postData?.brandInfo.brandID;
      });
      this.currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;
    }
    if (+this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount) {
      if (this.currentBrand?.isBrandworkFlowEnabled) {
        const payload_update = {
          filters: this.postData?.brandInfo,
          isrefresh: false,
        }
        this.GetUsersWithTicketCountApi = this._replyService
          .GetUsersWithTicketCount(payload_update)
          .subscribe((data) => {
            // console.log(data);
            this.buildAgentUserList(data);
          });
        // show assigntoList
      }
    }
  }

  setEscalateUsers(event: UntypedFormControl): void {
    this.assignToUser = event.value;
    this.cdkRef.detectChanges();
  }

  closeMatSelect(): void {
    this._footericonService.matClosePanel.next(true);
    // this.autocomplete.closePanel();
  }
  closeWorkFlowrejectMenu(): void {
    this.clickRejectworkflowTrigger.closeMenu();
    this.mediaAttachments = [];
    this.cdkRef.detectChanges();
  }

  getTicketCountDetailForPost(postData) {
    console.log(postData);
    const obj = {
      brandInfo: {
        brandID: postData?.brandInfo.brandID,
        brandName: postData?.brandInfo.brandName,
      },
      tagID: postData?.tagID,
      socialId: postData?.socialID,
      contentID: postData?.contentID,
      isActionableData: postData?.actionableType,
      channel: postData?.channelGroup,
      isTicketClose: false,
    };

    this.GetTicketCountDetailForPostApi = this._replyService.GetTicketCountDetailForPost(obj).subscribe((res) => {
      if (res.success) {
        this.openActionablePopup(2, postData, res.data);
      }
    });
  }

  openActionablePopup(actionType, postData, dataCount?) {
    if (this.actionableRef) {
      return;
    }
    let dialogRef, dialogData;
    if (actionType == 2) {
      dialogData = new AlertDialogModel(
        this.translateService.instant('sure-you-want-this-post-non-actionable'),
        postData?.channelGroup === this.channelGroup.Twitter
          ? `<span class="colored__red--dark"> ${this.translateService.instant('note')}</span> ${this.translateService.instant('this-will-twitter-nested-replies')}`
          : '',
        'Yes',
        'No',
        true,
        dataCount > 0
          ? [
              {
              label: this.translateService.instant('Also-close-created-tickets', { dataCount: dataCount }),
                id: 'Test',
                type: 'checkbox',
              },
            ]
          : []
      );
    } else {
      dialogData = new AlertDialogModel(
        this.translateService.instant('sure-you-want-this-post-actionable'),
        '',
        'Yes',
        'No'
      );
    }
    this.actionableRef = this._dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });
    let checkBoxValue;
    this.actionableRef.componentInstance.inputEvent.subscribe((data) => {
      checkBoxValue = data;
      this.checkboxVariable = data;
    });
    this.actionableRef.afterClosed().subscribe((dialogResult) => {
      this.actionableRef = null;
      if (dialogResult) {
        const obj = {
          brandInfo: {
            brandID: postData?.brandInfo.brandID,
            brandName: postData?.brandInfo.brandName,
          },
          tagID: postData?.tagID,
          socialId: postData?.socialID,
          contentID: postData?.contentID,
          isActionableData: actionType,
          channel: postData?.channelGroup,
          isTicketClose: checkBoxValue ? true : false,
          markParentPostSpamType: postData?.markParentPostSpamType
        };
        this.makeTicketActionableOrNonActionableApi = this._replyService.makeTicketActionableOrNonActionable(obj).subscribe(
          (res) => {
            if (res.success) postData.actionableType = actionType;
            this.ticketHistoryData.actionOrNonActionFlag =
              actionType == 1 ? true : false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translateService.instant('Updated-Successfully'),
              },
            });
            this.cdkRef.detectChanges();
          },
          (err) => {}
        );
      } else {
      }
    });
  }

  openUserProfile(tabIndex?: number): void {
    this._postDetailService.postObj = this.postData;
    /* this._postDetailService.currentPostObject.next(
      this.postData?.ticketInfo.ticketID
    ); */
    this._postDetailService.currentPostObjectSignal.set(
      this.postData?.ticketInfo.ticketID
    );
    const sideModalConfig = this._modalService.getSideModalConfig('saved-tabs');
    this._dialog.open(PostUserinfoComponent, {
      ...sideModalConfig,
      width: '360px',
      data: { tabIndex, emailFlag: true },
      autoFocus: false,
    });
  }

  openParentPost(viewCommentFlag?:boolean): void {
    this._postDetailService.postObj = this.postData;
    this._postDetailService.groupedView=false
    if (viewCommentFlag)
    {
      this._dialog.open(ParentPostComponent, {
        data: {viewCommentFlag:viewCommentFlag,parentPostFlag:true},
        autoFocus: false,
        width: '80vw',
      });
    }else{
      this._dialog.open(ParentPostComponent, {
        data: { parentPostFlag: true },
        autoFocus: false,
        width: '80vw',
      });
    }
    this._ticketService.bulkMentionChecked = [];
    this._ticketService.selectedPostList = [];
    this._ticketService.postSelectTriggerSignal.set(0);
  }

  openGroupView(): void {
    this._postDetailService.groupedView = this.mentionOrGroupView==AllMentionGroupView.groupView?true:false;
    this._postDetailService.postObj = this.postData;
      this._dialog.open(ParentPostComponent, {
        data: { groupView: true },
        autoFocus: false,
        width: '80vw',
      });
    this._ticketService.bulkMentionChecked = [];
    this._ticketService.selectedPostList = [];
    this._ticketService.postSelectTriggerSignal.set(0);
  }

  getToolTip(menionSentiment): string {
    if (menionSentiment === this.getSentiment.Negative) {
      return this.translateService.instant('Negative-Sentiment');
    } else if (menionSentiment === this.getSentiment.Mixed) {
      return this.translateService.instant('Mixed-Sentiment');
    } else if (menionSentiment === this.getSentiment.Positive) {
      return this.translateService.instant('Positive-Sentiment');
    } else if (menionSentiment === this.getSentiment.Neutral) {
      return this.translateService.instant('Neutral-Sentiment');
    }
  }

  hideUnhideFromFacebook(flag: boolean): void {
    const dialogData = new AlertDialogModel(
      this.translateService.instant(
        flag ? this.postData?.channelType === ChannelType.InstagramComments ? 'Are-you-sure-you-want-to-Unhide-this-mention-from-Instagram' : 'Are-you-sure-you-want-to-Unhide-this-mention-from-Facebook' : this.postData?.channelType === ChannelType.InstagramComments ? 'Are-you-sure-you-want-to-Hide-this-mention-from-Instagram' : 'Are-you-sure-you-want-to-Hide-this-mention-from-Facebook'
      ),
      '',
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
        this.deleteFromLoader = true;
        const key = this._ticketService.constructMentionObj(this.postData);
        key.IsHidden = flag ? false : true;
        key.IsHiddenFromAllBrand = false;
        delete key.Account.AccountID;
        key.Account.SocialID = this.postData?.fbPageID;
        key.Source.InstagramGraphApiID = this.postData?.instagramGraphApiID ? this.postData?.instagramGraphApiID : '';
        key.Source.ChannelType = this.postData?.channelType;
        key.Source.TagID = this.postData?.tagID;
        this.hideUnhideFromFacebookApi = this._ticketService.hideUnhideFromFacebook(key).subscribe(
          (data) => {
            this.deleteFromLoader = false;
            if (data && data.success) {
             if (this.postData.channelType === ChannelType.InstagramComments) {
                            this.ticketHistoryData.hideUnhideInstagramFlag = flag
                              ? false
                              : true;
                          } else {
                            this.ticketHistoryData.hideUnhideFacebookFlag = flag
                              ? false
                              : true;
                }
              if ((this.postData?.channelType === ChannelType.FBComments && this.ticketHistoryData?.hideUnhideFacebookFlag) || (this.postData?.channelType === ChannelType.InstagramComments && this.ticketHistoryData?.hideUnhideInstagramFlag)) {
                  this.ticketHistoryData.replyDisabled = true;
                  this.fbInstaHideTooltip = this.translateService.instant(this.postData.channelType === ChannelType.FBComments ? 'This-comment-hidden-from-facebook' : 'This-comment-hidden-from-instagram');
                } else {
                  this.fbInstaHideTooltip = '';
                  this.ticketHistoryData.replyDisabled = false;
                }
              this.postData.isHidden = flag ? false : true;
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: this.translateService.instant(`${flag ? this.postData.channelType === ChannelType.InstagramComments ? 'Unhide-successfully-from-instagram' : 'Unhide-successfully-from-facebook' : this.postData.channelType === ChannelType.InstagramComments ? 'Hide-successfully-from-instagram' : 'Hide-successfully-from-facebook'}`),
                },
                });
              this.cdkRef.detectChanges();
            } else {
                this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: data?.message && data?.message.includes('Account configuration') ? data?.message : this.translateService.instant(data?.message ? data.message : `Unable-to-${flag ? 'Unhide' : 'Hide'}`),
                },
                });
            }
            this.cdkRef.detectChanges();
          },
          (err) => {
            this.deleteFromLoader = false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translateService.instant('something-went-wrong'),
              },
            });
          }
        );
      }
    });
  }

  downloadTemplate(): void {
    const keyObj = {
      brandInfo: this.postData?.brandInfo,
      ticketId: this.postData?.ticketInfo.ticketID,
      to: 1,
      from: 10,
      authorId: this.postData?.author.socialId,
      channel: this.postData?.channelGroup,
      TagId: this.postData?.tagID,
    };

    let emailTemplate = '';

    this.getTicketHtmlForEmail1Api = this._replyService.getTicketHtmlForEmail(keyObj).subscribe(
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
            a.download = 'EmailTrail_TickectID_' + this.postData?.ticketID;
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
            message: this.translateService.instant('something-went-wrong'),
          },
        });
      }
    );
  }

  categoryToggleEvent(): void {
    this.categoryToggle = !this.categoryToggle;
    this.cdkRef.detectChanges();
  }

  showTicketCategory(): void {
    this.showCategoryWithAI = !this.showCategoryWithAI;
    this.cdkRef.detectChanges();
  }
  ticketDispositionDialog(): void {
    if (
      this.postData?.channelGroup === ChannelGroup.Email &&
      !this.postData?.allMentionInThisTicketIsRead
    ) {
      const obj = {
        brandID: this.postData?.brandInfo.brandID,
        brandName: this.postData?.brandInfo.brandName,
      };
      // console.log('reply approved successfull ', data);
      this.getTicketHtmlForEmail2Api = this._replyService.GetBrandMentionReadSetting(obj).subscribe((resp) => {
        if (resp) {
          if (resp.isMentionReadCompulsory) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message:
                  this.translateService.instant('read-mentions-before-performing-direct-close-action'),
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
              if (this.isAgentIqEnabled && this.showIqOnDirectClose) {
                this.loader = true;
              }
              this.getDispositionDetails1Api = this._replyService.getDispositionDetails(obj).subscribe((res) => {
                this.noteLoader = false;
                if (res.success) {
                  this.ticketDispositionList = res.data.ticketDispositionList;
                  if (this.isAgentIqEnabled && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled) {
                    this.generateAgentIQ().then((closureApproved: boolean) => {
                      this.loader = false;
                      if (!closureApproved) {
                        const despositionObj = {
                          baseMention: this.postData,
                          dispositionList: this.ticketDispositionList,
                          note: res?.data ? res?.data?.note : '',
                          ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                        }
                        const dialogRef = this.dialog.open(TicketDispositionComponent, {
                          width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                          data: despositionObj,
                        });

                        dialogRef.afterClosed().subscribe((res) => {
                          if (res != 'composeReply' && res != false && res != 'closeWithNote') {
                            this.ticketDispositionEmit.emit(res);
                          } else if (res == 'composeReply') {
                            this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
                            this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyPost });
                          }
                        });
                      } else {
                        if (this.ticketDispositionList.length > 0) {
                          const despositionObj = {
                            baseMention: this.postData,
                            dispositionList: this.ticketDispositionList,
                            note: res?.data ? res?.data?.note : '',
                            ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                          }
                          const dialogRef = this.dialog.open(TicketDispositionComponent, {
                            width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                            data: despositionObj,
                          });

                          dialogRef.afterClosed().subscribe((res) => {
                            if (res) {
                              this.ticketDispositionEmit.emit(res);
                            }
                          });
                        } else {
                          this.dispositionMenuTrigger.openMenu();
                        }
                      }
                    })
                  } else if(this.ticketDispositionList.length > 0) {
                    this._ticketService.generateClosingTicket.next(null);
                    this.loader = false;
                    const despositionObj = {
                      baseMention: this.postData,
                      dispositionList: this.ticketDispositionList,
                      note: res?.data ? res?.data?.note : '',
                      ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                    }
                    const dialogRef = this.dialog.open(TicketDispositionComponent, {
                      width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                      data: despositionObj,
                    });

                    dialogRef.afterClosed().subscribe((res) => {
                      if (res) {
                        this.ticketDispositionEmit.emit(res);
                      }
                    });
                  } else {
                    this._ticketService.generateClosingTicket.next(null);
                    this.loader = false;
                    this.dispositionMenuTrigger.openMenu();
                  }
                } else {
                  this._ticketService.generateClosingTicket.next(null);
                  this.loader = false;
                  this.dispositionMenuTrigger.openMenu();
                }
              }, (error) => {
                this.loader = false;
                this.noteLoader = false;
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
        if (this.isAgentIqEnabled && this.showIqOnDirectClose) {
          this.loader = true;
        }
        this.getDispositionDetails2Api = this._replyService.getDispositionDetails(obj).subscribe((res) => {
          this.noteLoader = false;
          if (res.success) {
            this.ticketDispositionList = res.data.ticketDispositionList;
            if ((this.isAgentIqEnabled && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled 
              && this.ticketDispositionList.length > 0) || (this.isAgentIqEnabled && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled)) {
              this.generateAgentIQ().then((closureApproved: boolean) => {
                this.loader = false;
                if (!closureApproved) {
                  const despositionObj = {
                    baseMention: this.postData,
                    dispositionList: this.ticketDispositionList,
                    note: res?.data ? res?.data?.note : '',
                    ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                  }
                  const dialogRef = this.dialog.open(TicketDispositionComponent, {
                    width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                    data: despositionObj,
                  });

                  dialogRef.afterClosed().subscribe((res) => {
                    if (res != 'composeReply' && res != false && res != 'closeWithNote') {
                      this.ticketDispositionEmit.emit(res);
                    } else if (res == 'composeReply') {
                      this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
                      this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyPost });
                    }
                  });
                } else {
                  if (this.ticketDispositionList.length > 0) {
                    const despositionObj = {
                      baseMention: this.postData,
                      dispositionList: this.ticketDispositionList,
                      note: res?.data ? res?.data?.note : '',
                      ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                    }
                    const dialogRef = this.dialog.open(TicketDispositionComponent, {
                      width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                      data: despositionObj,
                    });

                    dialogRef.afterClosed().subscribe((res) => {
                      if (res) {
                        this.ticketDispositionEmit.emit(res);
                      }
                    });
                  } else {
                    this.dispositionMenuTrigger.openMenu();
                  }
                }
              })
            } else if(this.ticketDispositionList.length > 0) {
              this._ticketService.generateClosingTicket.next(null);
              this.loader = false;
              const despositionObj = {
                baseMention: this.postData,
                dispositionList: this.ticketDispositionList,
                note: res?.data ? res?.data?.note : '',
                ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
              }
              const dialogRef = this.dialog.open(TicketDispositionComponent, {
                width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                data: despositionObj,
              });
  
              dialogRef.afterClosed().subscribe((res) => {
                if (res) {
                  this.ticketDispositionEmit.emit(res);
                }
              });
            } else {
              this._ticketService.generateClosingTicket.next(null);
              this.loader = false;
              this.dispositionMenuTrigger.openMenu();
            }
          } else {
            this._ticketService.generateClosingTicket.next(null);
            this.loader = false;
            this.dispositionMenuTrigger.openMenu();
          }
        }, (error) => {
          this.loader = false;
          this.noteLoader = false;
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

  ticketIntelligence(){
    if (this.aiTagEnabled && this.isAiInsightsEnabled){
      const despositionObj = {
        baseMention: this.postData,
        dispositionList: [],
        dispositionOff: true
      }
      const dialogRef = this.dialog.open(TicketDispositionComponent, {
        width: '50vw',
        data: despositionObj,
      });

      dialogRef.afterClosed().subscribe((res) => {
        if (res) {
          this.ticketDispositionEmit.emit(res);
        }
      });
    }
  }

  addCampaign():void
  {
    const dialogRef = this.dialog.open(TagMentionCampaignComponent,{
      width:'65vw',
      data:this.postData
    })

  }

  serachForVirusUrl(): void {
    this.scanLoader = true;
    this.cdkRef.detectChanges();
    const _contenturllist = this.getContentUrlList();
    const _imageList = this.getImageList();
    if (_imageList.length > 0) {
      this.GetOCRImgExtract(_contenturllist, _imageList);
    } else {
      this.GetSerachForVirusUrl([], _contenturllist, '')
    }
  }

  GetOCRImgExtract(_contenturllist, _imageList): void {
    const _urllist = [];
    let extractednotes = "";
    const chkregexp = new RegExp(/ht[a-z]{2,4}:[\W\ ]{1,4}[a-z0-9\.]+([\]{1}[\W\ ]{0,4}[a-zA-Z0-9]+)/gi);
    const imgurlexp = new RegExp(/[a-z]+\.[a-z]{1,3}\/\ [a-zA-Z0-9]+/gi);
    const imgurlexp1 = new RegExp(/[(ht(s)?):\/\/(www\.)?\/\/(-\.)a-zA-Z0-9@:%.\+#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%\+.#?&//=]*)|ht[a-z]{2,4}:[\W\ ]{1,4}[a-z0-9\.]+([\]{1}[\W\ ]{0,4}[a-zA-Z0-9]+)|[a-z]+\.[a-z]{1,3}\/\ [a-zA-Z0-9]+/gi);
    let totalCount = 0;
    _imageList.forEach((url) => {
      this.scanImageContentApi = this._ticketService.scanImageContent({ url: url, debug: true }).subscribe((res) => {
        if (res.success) {
          totalCount++;
          if (res.data != "" && res.data != null && res.data != undefined) {
            var urlmatches = res.data.match(chkregexp);
            if (urlmatches == null) {
              urlmatches = res.data.match(imgurlexp);
            }
            if (urlmatches == null) {
              urlmatches = res.data.match(imgurlexp1);
            }
            if (urlmatches != null) {
              urlmatches.forEach((i, v1) => {
                var urlmatch = v1.trim().replace(" ", "");
                if (urlmatch.indexOf("‘") > -1) {
                  urlmatch = urlmatch.replace("‘", "");
                }
                if (urlmatch.indexOf("htto") > -1) {
                  urlmatch = urlmatch.replace("htto", "http");
                }
                if (urlmatch.indexOf(")") > -1) {
                  urlmatch = urlmatch.replace(")", "/");
                }
                _urllist.push(urlmatch);
              });
            }
            if (res.data.indexOf("‘") > -1) {
              res.data = escape(res.data);
            }
            extractednotes += res.data + ",";
          }
          if (totalCount == _imageList.length) {
            this.GetSerachForVirusUrl(_imageList, _contenturllist, extractednotes)
          }
        }
      })
    })
  }

  getContentUrlList(): any[] {
    var phishingurlexp = new RegExp(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gi);
    const contenturllist = [];
    if (this.postData?.description && this.postData?.channelGroup!=ChannelGroup.Email) {
      const urlmatches = this.postData?.description.match(phishingurlexp);
      if (urlmatches) {
        urlmatches.forEach((url) => contenturllist.push(url))
      }
    } else if (this.postData?.channelGroup == ChannelGroup.Email){
      const urlmatches = this.postData?.emailContent.match(phishingurlexp);
      if (urlmatches) {
        urlmatches.forEach((url) => contenturllist.push(url))
      }
    }
    if (contenturllist.length == 0) {
      if (this.postData?.title) {
        const urlmatches = this.postData?.title.match(phishingurlexp);
        if (urlmatches) {
          urlmatches.forEach((url) => contenturllist.push(url))
        }
      }
    }
    return contenturllist
  }

  getImageList(): any[] {
    const imageList = [];
    if (this.postData?.attachmentMetadata?.mediaContents) {
      this.postData?.attachmentMetadata?.mediaContents.forEach((obj) => {
        if (obj.mediaType == MediaEnum.IMAGE) {
          imageList.push(obj.mediaUrl);
        }
      })
    }
    return imageList;
  }

  GetSerachForVirusUrl(_imageurl: any[], _contenturllist: any[], imgextractednotes: string): void {

    const _urllist = [], domainlist = [], _domainmatches = [];
    const domainexp = new RegExp(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);

    if (_contenturllist && _contenturllist.length > 0) {
      _contenturllist.forEach((res) => {
        _urllist.push(res);
      })
    }
    if (_imageurl && _imageurl.length > 0) {
      _imageurl.forEach((res) => {
        _urllist.push(res);
      })
    }

    if (_urllist && _urllist.length > 0) {
      _urllist.forEach((res) => {
        let _domainlist = res.trim().match(domainexp);
        _domainlist = this.removeItemAll(_domainlist);
        if (_domainlist && _domainlist.length > 0) {
          _domainmatches.push(_domainlist[0]);
        }
      }
      )
    }

    if (_domainmatches && _domainmatches.length > 0) {
      _domainmatches.forEach((res) => {
        domainlist.push({
          domainname: res,
          domainstatus: 1
        })
      })
    }
    this.scanLoader = true;
    const obj = {
      BrandInfo: {
        BrandID: this.postData?.brandInfo?.brandID,
        BrandName: this.postData?.brandInfo?.brandName
      },
      TicketId: this.postData?.ticketID,
      TagID: this.postData?.tagID,
      ThreatEntry: {
        urllist: [... new Set(_urllist)],
        urlstatus: 0,
        notes: imgextractednotes
      },
      domain: [... new Set(domainlist)]
    }

    this.scanTextContentApi = this._ticketService.scanTextContent(obj).subscribe((res) => {
      this.scanLoader = false;
      if (res.success) {
        this.scanContentFlag = false;
        if (res?.data && res?.data?.length==1)
        {
          this.noScanLinkFound = res?.data[0].status==LinkStatusEnum.Nolink?true:false;
          this.safeorUnsafeLink = res?.data.some((obj) => obj.statusstatus == LinkStatusEnum.Unsafe) ? false : res?.data.some((obj) => obj.statusstatus == LinkStatusEnum.Safe) ? true : null;
          this.cdk.detectChanges();
        }
        this._ticketService.scanContentObs.next({ List: res?.data, tagID :this.postData?.tagID});
      }
    }, err => {
      this.scanLoader = false;
      this.cdkRef.detectChanges();
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translateService.instant('something-went-wrong'),
        },
      });
    })
  }

  removeItemAll(arr) {
    var i = 0;
    while (i < arr?.length) {
      if (arr[i].indexOf("http") > -1) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }

  viewInHTML(showFlag:boolean):void {
    this._ticketService.emailFriendlyViewObsSignal.set({
      show:showFlag,
      tagID:this.postData?.tagID
    })
    /* this.selectedTicketView = 1; */
    this.emailHTMLView = showFlag;
    this.cdk.detectChanges();
  }

  getLanguageList(){
    this.LanguageList = [];
    this.LanguageListCopy = [];
    (document.getElementById('languageSearchText') as HTMLInputElement).value = '';
    this.selectedLanguage = this.ticketHistoryData?.languageName == "Undefined" || this.ticketHistoryData?.languageName == "Undetected" ? "" : this.ticketHistoryData?.languageName.trim();

    const genericFilter = this._navService.getFilterJsonBasedOnTabGUID(
      this._navService.currentSelectedTab.guid
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

    this.GetLangaueListApi = this._ticketService.GetLangaueList(obj).subscribe((result)=>{
      if(result.success){
        this.LanguageList = result.data;
        this.LanguageListCopy = result.data;
        this.cdkRef.detectChanges();
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
          message: this.translateService.instant("Please-select-a-language"),
        },
      });
    } else if (this.selectedLanguage.trim() === this.ticketHistoryData?.languageName.trim()) {
      event.stopPropagation();
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translateService.instant("this-language-is-already-tagged"),
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
  ticketToggleEvent(): void {
    this.ticketToggle = !this.ticketToggle;
    this.cdkRef.detectChanges();
  }

  showMaskedData() {
    if (this.toggleMasking) {
      let data = this.allMaskedDataWithTagId.filter((x) => x.tagID == this.postData?.tagID);
      if (data && data.length > 0) {
        const pageType = this.parentPostFlag ? PostsType.parentPost : this.pageType;
        data[0].pageType = pageType;
        /* this._ticketService.unMaskedData.next(data[0]); */
        this._ticketService.unMaskedDataSignal.set(data[0]);
      }
    } else {
      const index = this.allMaskedDataWithTagId.findIndex((x) => x.tagID == this.postData?.tagID);
      if (index > -1) {
        this.allMaskedDataWithTagId.splice(index, 1);
      }
      let data = { title: this.postData?.title, description: this.postData?.description, caption: this.postData?.caption };
      this.allMaskedDataWithTagId.push({ tagID: this.postData?.tagID, data: data });

      let obj = {
        brandInfo: {
          BrandID: this.postData?.brandInfo.brandID,
          BrandName: this.postData?.brandInfo.brandName,
        },
        TagID: this.postData?.tagID
      };

      this.GetUnmaskedDescriptionApi = this._ticketService.GetUnmaskedDescription(obj).subscribe((result) => {
        if (result.success && result.data) {
          const pageType = this.parentPostFlag ? PostsType.parentPost : this.pageType;
          //result.data?.description ? result.data?.description : result.data?.title ? result.data?.title : result.data?.caption
          /* this._ticketService.unMaskedData.next({ tagID: this.postData?.tagID, data: result.data, pageType: pageType }); */
          this._ticketService.unMaskedDataSignal.set({ tagID: this.postData?.tagID, data: result.data, pageType: pageType });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: result.message ? result.message : this.translateService.instant('Unable-to-get-data'),
            },
          });
        }
      })
    }
  }

  getCRMTicketStatus(ticketid: number) {
    if (ticketid){
      this.getCRMTicketStatusApi = this._ticketService.getCRMTicketStatus({ TicketID: ticketid }).subscribe((res) => {
        if (res.success) {
          if (res?.data) {
            this.ticketHistoryData.isDirectCloseVisible = true;
            this.cdk.detectChanges()
          }
        }
      })
    }
  }

  public get UserRoleEnum(): typeof UserRoleEnum {
    return UserRoleEnum;
  }

  getPostLabels() {
    let obj = {
      brandId: [this.postData?.brandInfo?.brandID],
      searchLabel: this.labelSearchText.trim(),
    };

    this.getPostLabelsApi = this._ticketService.getPostLabels(obj).subscribe((result) =>{
      if(result.success) {
        this.postLabels = [...result.data];
        this.postLabels.forEach((label) => {
          label.isChecked = false;
        })

        if (this.postData?.ticketInfo?.postLabelJson) {
          let selectedTag = this.normalizeLabelColors(JSON.parse(this.postData?.ticketInfo?.postLabelJson));
          this.selectedTag = [...selectedTag];

          this.selectedTag.forEach(selectedItem => {
            let found = this.postLabels.find(postItem => postItem.tag === selectedItem.tag && postItem.color === selectedItem.color);
            if (found) {
              found.isChecked = true;
            } else {
              this.postLabels.push({ ...selectedItem, isChecked: true });
            }
          });

          if(this.labelSearchText.trim().length > 0){
            this.postLabels = this.postLabels.filter((x) => x.tag.toLowerCase().includes(this.labelSearchText.trim().toLowerCase()));
          }
        }

        if(this.postLabels.length == 0 && this.labelSearchText.trim().length > 0) {
          this.addLabelData = [{ tag: this.labelSearchText, color: this.getRandomColor()}];
        } else {
          this.addLabelData = [];
        }

        this.usedColor = [...new Set(this.selectedTag.map((label) => label.color))];
        this.addLabelFlag = false;
        this.cdkRef.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: result.message ? result.message : this.translateService.instant('Unable-to-get-data'),
          },
        });
      }
    })
  }

  menuClosed(){
    this.labelSearchText = '';
  }

  selectTag(event, data){
    if (event.checked) {
      if (this.selectedTag.length == 5) {
        event.source.checked = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translateService.instant('You-can-select-maximum-labels'),
          },
        });
        return false;
      }
      this.postLabels.map((label) => {
        if (label.tag == data.tag && label.color == data.color) {
          label.isChecked = event.checked;
          this.selectedTag.push({ tag: label.tag, color: label.color });
        }
      });
    } else {
      this.postLabels.map((label) => {
        if (label.tag == data.tag && label.color == data.color) {
          label.isChecked = event.checked;
          this.selectedTag = this.selectedTag.filter((x) => x.tag != label.tag || x.color != label.color);
        }
      })  
    }
    this.usedColor = [...new Set(this.selectedTag.map((label) => label.color))];
    this.cdkRef.detectChanges();
  }

  selectLabel(item) {
    this.selectedLabel = item;
  }

  saveSelectedTag(){
    // if (this.selectedTag.length == 0) {
    //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //     duration: 5000,
    //     data: {
    //       type: notificationType.Error,
    //       message: 'Please select at least one label.',
    //     },
    //   });
    //   return;
    // } else {
      let obj = {
        brandId: this.postData?.brandInfo?.brandID,
        tagId: this.postData?.tagID,
        labelJson: JSON.stringify(this.selectedTag),
      };

    this.updatePostLabelsApi = this._ticketService.updatePostLabels(obj).subscribe((result) => {
        if(result.success) {
          this.postData.ticketInfo.postLabelJson = JSON.stringify(this.selectedTag);
          this.addedLabels = [...this.selectedTag];
          this.labelMenuTrigger.closeMenu();
          this.optionMenuTrigger.closeMenu();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translateService.instant('Labels-saved-successfully'),
            },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: result.message ? result.message : this.translateService.instant('Unable-to-save'),
            },
          });
        }
      })
    // }  
  }

  addLabel(){
    if (this.selectedTag.length == 5) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: 'You can select maximum 5 labels.',
        },
      });
      return false;
    } else{
      this.addLabelFlag = true;
      this.addLabelData[0].isChecked = true;
      this.selectedTag.push({ tag: this.addLabelData[0].tag, color: this.addLabelData[0].color});
      this.usedColor = [...new Set(this.selectedTag.map((label) => label.color))];
      this.saveSelectedTag();
    }
  }

  colorPicker(color) {
    this.color = color;
    this.colorValidation(this.color);
  }

  getColor() {
    var x = (document.getElementById('manageColorPicker') as HTMLInputElement)
      .value;
    this.color = x;
    this.colorValidation(this.color);
  }

  colorValidation(color) {
    let isExist = this.selectedTag.some((x) => x.color == color && this.currentSelectedLabel.color != color);
    if (isExist) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translateService.instant('this-color-selected-already'),
        },
      });
    } else {
      this.changeSelectedLabelColor();
    }
  }

  public onEventLog(value: string, color: string): void {
    this.color = color;
    this.colorValidation(this.color);
  }

  selectColor(color) {
    this.color = color;
    this.colorValidation(this.color);
  }

  changeSelectedLabelColor() {
    if (this.postLabels.length > 0) {
      this.postLabels.map((label) => {
        if (label.tag == this.selectedLabel.tag) {
          label.color = this.color;
        }
      });
      this.selectedTag.map((label) => {
        if (label.tag == this.selectedLabel.tag) {
          label.color = this.color;
        }
      });
      this.selectedLabel.color = this.color;
    } else {
      this.addLabelData[0].color = this.color;
    }
    this.usedColor = [];
    this.usedColor = [...new Set(this.selectedTag.map((label) => label.color))];
    this.cdkRef.detectChanges();
  }

  getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  checkLabelLength(e): void {
    if (e.target.value.length >= 20) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translateService.instant('You-exceeded-character-limit'),
        },
      });
    }
  }

  normalizeLabelColors(arr) {
    return arr.map(item => ({
      tag: item.tag,
      color: item.Color || item.color
    }));
  }

  noteTextChange(nodeElement: any, holder: any, byPass: boolean, text: string) {
    if (this[holder] && this[holder]?.length > 2500) {
      this[holder] = this[holder].substring(0, 2500)
      if (nodeElement) nodeElement.value = this[holder].substring(0, 2500)
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translateService.instant('character-limit-note'),
        },
      });
      this.cdkRef.detectChanges();
      return false;
    }

    if (!nodeElement && byPass && text?.trim()?.length > 0) {
      if (text && text?.length > 2500) {
        this[holder] = text?.substring(0, 2500);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translateService.instant('character-limit-note'),
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

  markAsSeenMention(): void {
    let dialogData;
    if (this.postData?.mentionMetadata?.childmentioncount > 0) {
      dialogData = new AlertDialogModel(
        this.translateService.instant('mark-mentions-as-read-info', { mentionCount: this.postData?.mentionMetadata?.unseencount }),
        '',
        'Mark As Read',
        'Cancel',
      );
      dialogData.isGroupview = true
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
        // width: '478px',
      });

      // dialogRef.componentInstance.inputEvent.subscribe((data) => {
      //   localStorage.setItem('markAsSeenPopupDisabled', data)
      // });
      // dialogRef.componentInstance.inputEvent.subscribe((data) => {
      //   this.isfullThreadSelected = true
      // })
      dialogRef.componentInstance.fullThreadChecked.subscribe((data)=>{
          this.isfullThreadSelected =data;
      })

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this.markAsSeenApiCall()
        }
        else { this.isfullThreadSelected = false; }
      }
      )

    } else {
      let dialogData = new AlertDialogModel(
        this.translateService.instant('mark-mentions-as-read-info', { mentionCount: this.postData?.mentionMetadata?.unseencount }),
        '',
        'Mark As Read',
        'Cancel',
      );
      dialogData.isGroupview = true

      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
        // width: '478px',
      });
      dialogRef.componentInstance.fullThreadChecked.subscribe((checked) => {
        this.isfullThreadSelected = checked;
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          this.markAsSeenApiCall()
          if (this.isfullThreadSelected) {
            this.isfullThreadSelected = false
          }
        }
        else {
          this.isfullThreadSelected = false;
          return
        }

      })
    }

  }

  markAsSeenApiCall(): void {
    let obj = {
      PostSocialId: this.postData?.socialID,
      UniqueId: this.postData?.ticketInfo?.uniqueId,
      IsGroupView: true,
      Ismarkseen: 1,
      Tagid: this.postData?.tagID,
      Brandid: this.postData?.brandInfo?.brandID,
      Createddate: this.postData?.ticketInfo?.createdDate,
      ChannelGroupId: this.postData?.channelGroup,
      StartDateEpoch: !this.isfullThreadSelected ? this._navService?.currentFilterObj?.startDateEpoch : null,
      EndDateEpoch: !this.isfullThreadSelected ? this._navService?.currentFilterObj?.endDateEpoch : null,
      IsDateRange: !this.isfullThreadSelected ? true : false
    }
    if (this.mentionOrGroupView == AllMentionGroupView.groupView && !this.parentPostFlag) {
      obj.PostSocialId = this.postData?.socialIdForunseenCount;
    }
    this.updateSignleMentionSeen1Api = this._ticketService.updateSignleMentionSeen(obj).subscribe((res) => {
      if (res.success) {
        this.postData.mentionMetadata.isMarkSeen = 1;
        this.ticketHistoryData.isMarkAsSeen = false
        this.ticketHistoryData.isMarkUnseen = true
        // this.ticketHistoryData.showGroupView = false;
        this.postData.mentionMetadata.unseencount = 0
        if (this.pageType == PostsType.Mentions) {
          this._ticketService.updateMentionSeenUnseen.next({ tagId: this.postData?.tagID, guid: this.postDetailTab.guid, seenOrUnseen: 1 });
        }
        if (this.pageType == PostsType.TicketHistory && this.showParentPostHeader) {
          this._ticketService.updateChildkMentionSeenUnseen.next({ seenOrUnseen: 1 });
          this._ticketService.updateMentionListSeenUnseen.next({ tagID: this.postData?.tagID, seenOrUnseen: true })
          this._ticketService.updateMentionListBasedOnParentSocialID.next({ tagID: this.postData?.socialID, seenOrUnseen: true })
        }
        (this.postDetailTab?.guid) ? this._tabService.seenUnseenTabCountUpdateObs.next({ guid: this.postDetailTab.guid, count: this.postData?.mentionMetadata.childmentioncount, seenUnseen: 1 }) : '';
        this.cdkRef.detectChanges();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translateService.instant('Mention-marked-read-sucessfully'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: (res?.message) ? res.message : this.translateService.instant('something-went-wrong'),
          },
        });
      }
    }, err => {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translateService.instant('something-went-wrong'),
        },
      });
    })

  }

  markAsUnSeenMention() {
    // if ( this.postData?.mentionMetadata?.childmentioncount > 0) {
    let dialogData = new AlertDialogModel(
      `Marking ${this.postData?.mentionMetadata?.childmentioncount > 0} this mention as unread will also mark related mentions as unread in this duration`,
      ``,
      'Mark As Unread',
      'Cancel',
    );
    dialogData.isGroupview = true
    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
      // width: '478px',
    });

    // dialogRef.componentInstance.inputEvent.subscribe((data) => {
    //   localStorage.setItem('markAsUnSeenPopupDisabled', data)
    // });
    dialogRef.componentInstance.fullThreadChecked.subscribe((checked) => {
      this.isfullThreadSelected = checked;
    })

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.markAsUnSeenApiCall()
        if (this.isfullThreadSelected) {
          this.isfullThreadSelected = false
        }
      }
      else {
        this.isfullThreadSelected = false
        return
      }
    }
    )
    // } else {

    //   this.markAsUnSeenApiCall()
    // }
  }

  markAsUnSeenApiCall(): void {
    let obj = {
      PostSocialId: this.postData?.socialID,
      UniqueId: this.postData?.ticketInfo?.uniqueId,
      IsGroupView: true,
      Ismarkseen: 0,
      Tagid: this.postData?.tagID,
      Brandid: this.postData?.brandInfo?.brandID,
      Createddate: this.postData?.ticketInfo?.createdDate,
      ChannelGroupId: this.postData?.channelGroup,
      StartDateEpoch: !this.isfullThreadSelected ? this._navService?.currentFilterObj?.startDateEpoch : null,
      EndDateEpoch: !this.isfullThreadSelected ? this._navService?.currentFilterObj?.endDateEpoch : null,
      IsDateRange: !this.isfullThreadSelected ? true : false
    }
    if (this.mentionOrGroupView == AllMentionGroupView.groupView && !this.parentPostFlag) {
      obj.PostSocialId = this.postData?.socialIdForunseenCount;
    }
    this.updateSignleMentionSeen2Api = this._ticketService.updateSignleMentionSeen(obj).subscribe((res) => {
      if (res.success) {
        this.postData.mentionMetadata.isMarkSeen = 0
        this.ticketHistoryData.isMarkUnseen = false
        this.ticketHistoryData.isMarkAsSeen = true;
        this.postData.mentionMetadata.unseencount = this.postData?.mentionMetadata.childmentioncount
        // if (this.postData.mentionMetadata.unseencount > 0) {
        //   this.ticketHistoryData.showGroupView = true;
        // }
        if (this.pageType == PostsType.Mentions) {
          this._ticketService.updateMentionSeenUnseen.next({ tagId: this.postData?.tagID, guid: this.postDetailTab.guid, seenOrUnseen: 0 });
        }
        if (this.pageType == PostsType.TicketHistory && this.showParentPostHeader) {
          this._ticketService.updateChildkMentionSeenUnseen.next({ seenOrUnseen: 0 });
          this._ticketService.updateMentionListSeenUnseen.next({ tagID: this.postData?.tagID, seenOrUnseen: false })
          this._ticketService.updateMentionListBasedOnParentSocialID.next({ tagID: this.postData?.socialID, seenOrUnseen: false })
        }
        (this.postDetailTab?.guid) ? this._tabService.seenUnseenTabCountUpdateObs.next({ guid: this.postDetailTab.guid, count: this.postData?.mentionMetadata.childmentioncount, seenUnseen: 0 }) : '';
        this.cdkRef.detectChanges();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translateService.instant('Mention-marked-unread-sucessfully'),
          },
        });
        if (this.isfullThreadSelected) {
          this.isfullThreadSelected = false
        }
      }
      else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: (res?.message) ? res.message : this.translateService.instant('something-went-wrong'),
          },
        });
      }
    }, err => {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translateService.instant('something-went-wrong'),
        },
      });
    })
  }

  getEntityIcon(entityType){
    switch (entityType) {
      case 1:
        return 'assets/ticket-list/brand-entity.svg';
        break;
      case 2:
        return 'assets/ticket-list/person-entity.svg';
        break;
      case 3:
        return 'assets/ticket-list/location-entity.svg';
        break;
      case 4:
        return 'assets/ticket-list/product-entity.svg';
        break;
      case 5:
        return 'assets/ticket-list/organisation-entity.svg';
        break;
      case 6:
        return 'assets/ticket-list/other_entity.svg';
        break;
    }
  }

  markSeenOrUnseenChildMention(flag: number): void {
    // if (!localStorage.getItem('markAsSeenPopupDisabled')) {
    // let dialogData = new AlertDialogModel(
    //   `Mark ${flag == 1 ? 'Read' : 'Unread'}`,
    //   `Are you sure you want to mark this mention as ${flag == 1 ? 'read' : 'unread'}?`,
    //   `Mark As ${flag == 1 ? 'Read' : 'Unread'}`,
    //   'Cancel',
    //   true,
    // );

    // const dialogRef = this.dialog.open(AlertPopupComponent, {
    //   disableClose: true,
    //   autoFocus: false,
    //   data: dialogData,
    //   // width: '478px',
    // });

    // // dialogRef.componentInstance.inputEvent.subscribe((data) => {
    // //   localStorage.setItem('markAsUnSeenPopupDisabled', data)
    // // });

    // dialogRef.afterClosed().subscribe((dialogResult) => {
    //   if (dialogResult) {
    let list = [{
      PostSocialId: this.postData?.socialID,
      UniqueId: this.postData?.ticketInfo?.uniqueId,
      IsGroupView: true,
      Ismarkseen: flag,
      Tagid: this.postData?.tagID,
      Brandid: this.postData?.brandInfo?.brandID,
      Createddate: this.postData?.ticketInfo?.createdDate,
      ChannelGroupId: this.postData?.channelGroup
    }]
    this.createdDateApi = this._postDetailService.createdDate.subscribe((date) => {
      this.createdDate = date
    })
    let obj = {
      SelectedPosts: list,
      createdDate: this.createdDate
    }
    this.updateChildBulkSeenUnseenApi = this._ticketService.updateChildBulkSeenUnseen(obj).subscribe((res) => {
      if (res.success) {
        this.postData.mentionMetadata.isMarkSeen = flag
        this.ticketHistoryData.isMarkUnseen = flag == 1 ? true : false
        this.ticketHistoryData.isMarkAsSeen = flag == 1 ? false : true;
        this._ticketService.updateMentionSeenUnseen.next({ tagId: this.postData?.tagID, guid: this._navService.currentSelectedTab.guid, seenOrUnseen: flag });
        this._ticketService.updateChildMentionInParentPost.next({ seenOrUnseen: flag == 1 ? true : false });
        (this.postDetailTab?.guid) ? this._tabService.seenUnseenTabCountUpdateObs.next({ guid: this.postDetailTab?.guid, count: 1, seenUnseen: flag }) : '';
        this.cdkRef.detectChanges();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translateService.instant(`Mention-marked-as-${flag == 1 ? 'Read' : 'Unread'}-successfully`),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: (res?.message) ? res.message : this.translateService.instant('something-went-wrong'),
          },
        });
      }
    }, err => {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translateService.instant('something-went-wrong'),
        },
      });
    })
    // }
    // }
    // )
    // }
  }
  getStarttimeAndEndtime() {
    this._navService.currentFilterObj = this._navService.getFilterJsonBasedOnTabGUID(
      this.postDetailTab?.tab.guid
    );
  }
  makeParentPostSpam(postData){
    if (this.actionableRef1) {
      return;
    }    
    let  dialogData;
    //if(actionable)
    if (this.actionableParentPost) {
      dialogData = new AlertDialogModel(
        this.translateService.instant('sure-you-want-post-non-actionable'),'' ,       
        'Yes',
        'No'
      );
    } else {
      dialogData = new AlertDialogModel(
        this.translateService.instant('sure-you-want-post-actionable-msg'),'',
        'Yes',
        'No'
      );
    }
    this.actionableRef1 = this._dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });
    this.actionableRef1.afterClosed().subscribe((dialogResult) => {
      this.actionableRef1 = null;
      if (dialogResult) {
        const obj = {
          brandInfo: {
            brandID: this.postData?.brandInfo.brandID,
            brandName: this.postData?.brandInfo.brandName,
          },
          tagID: this.postData?.tagID,
          socialId: this.postData?.strInReplyToStatusId,
          contentID: this.postData?.contentID,
          isActionableData: postData?.actionableType,
          channel: this.postData?.channelGroup,
          isTicketClose: this.checkboxVariable ? true : false,
          markParentPostSpamType: this.actionableParentPost ? 2 : 1
        };
        this.makeTicketActionableOrNonActionable1Api =this._replyService.makeTicketActionableOrNonActionable(obj).subscribe((res) => {
          if (res.success) {
            this.actionableParentPost = !this.actionableParentPost;
            this.cdkRef.detectChanges();
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translateService.instant('Updated-Successfully'),
              },              
            });
          }
          else {
            (err) => { };
          }
        });
      }
    })
  }

  updateCRMDetailsSignalChange(res){
    if (this.postData?.ticketInfo.tagID == res.TagID) {
      if (res?.SrID) {
        // this.postData?.ticketInfo.leadID = res?.leadID;
        // this.post.leadID = res?.leadID;
        this.postData.ticketInfo.srid = res.SrID;
        this.post.srID = res?.SrID;
        if (this.postData?.ticketInfo?.leadID) {
          this.post.leadID = this.postData?.ticketInfo?.leadID;
          this.cdk.detectChanges();
        }
      }
      if (res?.leadID) {
        this.postData.ticketInfo.leadID = res?.leadID;
        this.post.leadID = res?.leadID;
        if (this.postData?.ticketInfo?.srid) {
          this.post.srID = this.postData?.ticketInfo?.srid;
          this.cdk.detectChanges();
        }
      }
    }
  }

  blockUnblockAuthor(alreadyblocked: boolean) {
    if (alreadyblocked) {
      const title = this.translateService.instant('Do-you-want-to-Unblock-this-author')
      const message = this.translateService.instant('going-forward-mentions-actionability-rules-msg')
      const confirmButtonLabel = 'Unblock'
      const cancelButtonLabel = 'Cancel'
      const dialogData = new AlertDialogModel(
        title,
        message,
        confirmButtonLabel,
        cancelButtonLabel
      );
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          const obj = {
            "blockAuthors": { "AuthorSocialID": this.postData?.author?.socialId, "ChannelGroupID": this.postData?.channelGroup },
            "brandInfo": { "brandID": Number(this.postData?.brandInfo?.brandID), "brandName": this.postData?.brandInfo?.brandName }
          }
          this.UnBlockPagesAndHandlesApi =this._userDetailService.UnBlockPagesAndHandles(obj).subscribe((res) => {
            if (res.success) {
              this.blocked = false;
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: this.translateService.instant('Author-unblocked-Successfully'),
                },
              });
            }
            else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: res.message,
                },
              });
            }
          });
        }
      });
    }
    else {
      const title = this.translateService.instant('Do-you-want-to-Block-this-author');
      const message = this.translateService.instant('going-forward-ticket-mention-msg');
      const confirmButtonLabel = 'Block'
      const cancelButtonLabel = 'Cancel'
      const dialogData = new AlertDialogModel(
        title,
        message,
        confirmButtonLabel,
        cancelButtonLabel
      );
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          const obj = {
            "blockAuthors": [{ "AuthorName": this.postData?.author?.name, "ScreenName": this.postData?.author?.screenname,  "AuthorSocialID": this.postData?.author?.socialId, "Brand": { "brandID": Number(this.postData?.brandInfo?.brandID), "brandName": this.postData?.brandInfo?.brandName }, "ChannelGroupID": this.postData?.channelGroup }],
            "brandInfo": { "brandID": Number(this.postData?.brandInfo?.brandID), "brandName": this.postData?.brandInfo?.brandName }, "isApiCall": false
          };
          this.BlockPagesAndHandlesApi =this._userDetailService.BlockPagesAndHandles(obj).subscribe((res) => {
            if (res.success) {
              this.blocked = true;
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: this.translateService.instant('Author-blocked-Successfully'),
                },
              });
            }
            else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: res.message,
                },
              });
            }
          });
        }
      })
    }

  }
  clearAllVariables(){
    if (this.GetLangaueListApi){
      this.GetLangaueListApi.unsubscribe();
    }
    if (this.sendAspectFeedbackApi) {
      this.sendAspectFeedbackApi.unsubscribe();
    }
    if (this.ReplyApi1) {
      this.ReplyApi1.unsubscribe();
    }
    if (this.MarkActionableApi) {
      this.MarkActionableApi.unsubscribe();
    }
    if (this.getAuthorTicketsapi) {
      this.getAuthorTicketsapi.unsubscribe();
    }
    if (this.enableTicketMakerCheckerApi) {
      this.enableTicketMakerCheckerApi.unsubscribe();
    }
    if (this.saveNewTabApi) {
      this.saveNewTabApi.unsubscribe();
    }
    if (this.getMentionCountByTicektIDApi) {
      this.getMentionCountByTicektIDApi.unsubscribe();
    }
    if (this.changeTicketPriorityApi) {
      this.changeTicketPriorityApi.unsubscribe();
    }
    if (this.CheckTicketIfPendingWithnewMentionApi) {
      this.CheckTicketIfPendingWithnewMentionApi.unsubscribe();
    }
    if (this.ReplyApi2) {
      this.ReplyApi2.unsubscribe();
    }
    if (this.CreateAttachMultipleMentionsApi) {
      this.CreateAttachMultipleMentionsApi.unsubscribe();
    }
    if (this.Reply3Api) {
      this.Reply3Api.unsubscribe();
    }
    if (this.ReplyApprovedApi) {
      this.ReplyApprovedApi.unsubscribe();
    }
    if (this.ReplyRejectedApi) {
      this.ReplyRejectedApi.unsubscribe();
    }
    if (this.Reply4Api) {
      this.Reply4Api.unsubscribe();
    }
    if (this.MarkMentionAsReadApi) {
      this.MarkMentionAsReadApi.unsubscribe();
    }
    if (this.GetUsersWithTicketCountApi) {
      this.GetUsersWithTicketCountApi.unsubscribe();
    }
    if (this.GetTicketCountDetailForPostApi) {
      this.GetTicketCountDetailForPostApi.unsubscribe();
    }
    if (this.makeTicketActionableOrNonActionableApi) {
      this.makeTicketActionableOrNonActionableApi.unsubscribe();
    }
    if (this.hideUnhideFromFacebookApi) {
      this.hideUnhideFromFacebookApi.unsubscribe();
    }
    if (this.getTicketHtmlForEmail1Api) {
      this.getTicketHtmlForEmail1Api.unsubscribe();
    }
    if (this.getTicketHtmlForEmail2Api) {
      this.getTicketHtmlForEmail2Api.unsubscribe();
    }
    if (this.getDispositionDetails1Api) {
      this.getDispositionDetails1Api.unsubscribe();
    }
    if (this.getDispositionDetails2Api) {
      this.getDispositionDetails2Api.unsubscribe();
    }
    if (this.scanImageContentApi) {
      this.scanImageContentApi.unsubscribe();
    }
    if (this.scanTextContentApi) {
      this.scanTextContentApi.unsubscribe();
    }
    if (this.GetUnmaskedDescriptionApi) {
      this.GetUnmaskedDescriptionApi.unsubscribe();
    }
    if (this.getCRMTicketStatusApi) {
      this.getCRMTicketStatusApi.unsubscribe();
    }
    if (this.getPostLabelsApi) {
      this.getPostLabelsApi.unsubscribe();
    }
    if (this.updatePostLabelsApi) {
      this.updatePostLabelsApi.unsubscribe();
    }
    if (this.updateSignleMentionSeen1Api) {
      this.updateSignleMentionSeen1Api.unsubscribe();
    }
    if (this.updateSignleMentionSeen2Api) {
      this.updateSignleMentionSeen2Api.unsubscribe();
    }
    if (this.createdDateApi) {
      this.createdDateApi.unsubscribe();
    }
    if (this.updateChildBulkSeenUnseenApi) {
      this.updateChildBulkSeenUnseenApi.unsubscribe();
    }
    if (this.makeTicketActionableOrNonActionable1Api) {
      this.makeTicketActionableOrNonActionable1Api.unsubscribe();
    }
    this._snackBar.dismiss();
    this.customAgentListAsync.complete()
    if (this.effectOpenCallDetailWindowSignal) {
      this.effectOpenCallDetailWindowSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectSetTicketForRefreshSignal) {
      this.effectSetTicketForRefreshSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectUpdateCRMDetailsSignal) {
      this.effectUpdateCRMDetailsSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectPostDetailObjectChangedSignal) {
      this.effectPostDetailObjectChangedSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectSelectedCannedResponseSignal) {
      this.effectSelectedCannedResponseSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectBulkCheckboxObsSignal) {
      this.effectBulkCheckboxObsSignal.destroy();  // Clean up any active signal effect
    }
    if (this.effectEmitBrandMentionEmailDataSignal) {
      this.effectEmitBrandMentionEmailDataSignal.destroy();
    }
    this.rightFoot = null;
  }

  agentIQ(data?: string) {
    if (this.isAgentIqEnabled) {
      const despositionObj = {
        baseMention: this.postData,
        dispositionList: [],
        dispositionOff: true,
        closeWithNote: data == 'closeWithNote' ? true : false,
      }
      this.generateAgentIQ(data).then((closureApproved: boolean) => {
        if (!closureApproved && this.showIqOnDirectClose && this.currentUser?.data?.user?.isAccountAIEnabled) {
          const dialogRef = this.dialog.open(TicketDispositionComponent, {
            width: '50vw',
            data: despositionObj,
          });
          dialogRef.afterClosed().subscribe((res) => {
            if (res != 'composeReply' && res != false && res != 'closeWithNote') {
              this.ticketDispositionEmit.emit(res);
            } else if (res == 'composeReply') {
              this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
              this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyPost });
            } else if (res == 'closeWithNote') {
              this.postActionTypeEvent.emit({
                actionType: PostActionEnum.closeTicket,
                param: { NoteFlag: true },
                isDispositionList: this.ticketDispositionList.length > 0 ? true : false
              });
            }
          });
        } else {
          if (data == 'close') {
            this.directCloseTicket();
          }
        }        
      });

    }
  }
  
  generateAgentIQ(data?: string): Promise<boolean> {
    this._ticketService.replyInputTextData = '';
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.postData?.brandInfo.brandID
    );
    return new Promise((resolve, reject) => {
      let obj = {
        action_type: AgentIQAction.DirectClose,
        closingTicketTag: {
          brand_name: this.postData?.brandInfo?.brandName,
          brand_id: this.postData?.brandInfo?.brandID,
          author_id: this.postData?.author.socialId,
          author_name: this.postData?.author?.name ? this.postData?.author?.name : '',
          channel_group_id: this.postData?.channelGroup,
          ticket_id: this.postData?.ticketID,
          channel_type: this.postData?.channelType,
          tag_id: this.postData?.tagID,
          reply_message: this._ticketService.replyInputTextData ? this._ticketService.replyInputTextData : '',
          action_type: AgentIQAction.DirectClose,
          brand_content_policy: brandInfo?.brand_Content_policy?.length ? brandInfo?.brand_Content_policy : '',
          brand_response_guidelines: brandInfo?.brand_Response_guidlines?.length ? brandInfo?.brand_Response_guidlines : ''
        }
      }
      if (data == 'close') {
        this.loader = true;
      } else if (data == 'closeWithNote') {
        this.noteLoader = true;
      }
      this._ticketService.generateAgentIQ(obj).subscribe((result) => {
        this.loader = false;
        this.noteLoader = false;
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
        this.loader = false;
        this.noteLoader = false;
        resolve(false);
        this._ticketService.generateClosingTicket.next(false);
      });
    })
  }

  getCategorysIcons(category: string): string {
    if (category) {
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
}

