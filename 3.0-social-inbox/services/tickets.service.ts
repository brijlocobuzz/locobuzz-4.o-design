import { B } from '@angular/cdk/keycodes';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginService } from 'app/authentication/services/login.service';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { Priority } from 'app/core/enums/Priority';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { TicketTimings } from 'app/core/interfaces/TicketClient';
import { TicketMentionCategory } from 'app/core/interfaces/TicketMentionCategory';
import { AuthUser } from 'app/core/interfaces/User';
import { EmailAuthor } from 'app/core/models/authors/email/EmailAuthor';
import { FacebookAuthor } from 'app/core/models/authors/facebook/FacebookAuthor';
import { GenericAuthor } from 'app/core/models/authors/generic/GenericAuthor';
import { GoogleMyReviewAuthor } from 'app/core/models/authors/google/GoogleMyReviewAuthor';
import { GooglePlayStoreAuthor } from 'app/core/models/authors/google/GooglePlayStoreAuthor';
import { YoutubeAuthor } from 'app/core/models/authors/google/YoutubeAuthor';
import { InstagramAuthor } from 'app/core/models/authors/instagram/InstagramAuthor';
import { LinkedInAuthor } from 'app/core/models/authors/linkedin/LinkedInAuthor';
import { TwitterAuthor } from 'app/core/models/authors/twitter/TwitterAuthor';
import { WebsiteAuthor } from 'app/core/models/authors/website/WebsiteAuthor';
import { WhatsAppAuthor } from 'app/core/models/authors/whatsapp/WhatsAppAuthor';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { CategoryTagDetails } from 'app/core/models/dbmodel/TagsInformation';
import { BulkMentionChecked } from 'app/core/models/dbmodel/TicketReplyDTO';
import { EmailMention } from 'app/core/models/mentions/email/EmailMention';
import { FacebookMention } from 'app/core/models/mentions/facebook/FacebookMention';
import { GoogleMyReviewMention } from 'app/core/models/mentions/google/GoogleMyReviewMention';
import { GooglePlayStoreMention } from 'app/core/models/mentions/google/GooglePlayStoreMention';
import { YoutubeMention } from 'app/core/models/mentions/google/YoutubeMention';
import { InstagramMention } from 'app/core/models/mentions/instagram/InstagramMention';
import { LinkedinMention } from 'app/core/models/mentions/linkedin/LinkedinMention';
import {
  BaseMention,
  BaseMentionObj,
  BaseMentionWithCommLog,
} from 'app/core/models/mentions/locobuzz/BaseMention';
import { Mention } from 'app/core/models/mentions/locobuzz/Mention';
import { NonActionableMention } from 'app/core/models/mentions/nonactionable/NonActionableMention';
import { TwitterMention } from 'app/core/models/mentions/twitter/TwitterMention';
import { WebsiteChatbotMention } from 'app/core/models/mentions/websitechatbot/WebsiteChatbotMention';
import { WhatsAppMention } from 'app/core/models/mentions/whatsapp/WhatsAppMention';
import { Tab } from 'app/core/models/menu/Menu';
import { QueueConfiguration } from 'app/core/models/viewmodel/AgentAutoQueue';
import {
  mediaObj,
  postDetailWindow,
} from 'app/core/models/viewmodel/ChatWindowDetails';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { IApiResponse } from 'app/core/models/viewmodel/IApiResponse';
import {
  MentionCounts,
  MentionCountsResponse,
} from 'app/core/models/viewmodel/MentionCounts';
import { LocobuzzmentionService } from 'app/core/services/locobuzzmention.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { environment } from 'environments/environment';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterService } from './filter.service';
import { AssignToList } from 'app/shared/components/filter/filter-models/assign-to.model';
import { NavigationService } from 'app/core/services/navigation.service';
import { MatPaginator } from '@angular/material/paginator';
import { AllMentionGroupView } from 'app/shared/components/post-options/post-options.component';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { TranslateService } from '@ngx-translate/core';

export class TodoItemNode {
  children: TodoItemNode[];
  item: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
  item: string;
  level: number;
  expandable: boolean;
}

/**
 * The Json object for to-do list data.
 */
const TREE_DATA = {
  DebitCardIssue: {
    'Auto Detected': null,
    'Transfer Issue': null,
    'Wrong Pin': null,
  },
  InternetBanking: ['Auto Detected', 'Transfer Issue', 'Wrong Pin'],
};

@Injectable({
  providedIn: 'root',
})
export class TicketsService {
  public listPaginationSignal = signal({ status: false });
  public isPaginationSet: boolean = false;
  public paginator: MatPaginator;
  public changeUpperCategory: Subject<any> = new Subject<any>();

  dataChange = new BehaviorSubject<TodoItemNode[]>([]);
  ticketsFound: number;
  get data(): TodoItemNode[] {
    return this.dataChange.value;
  }
  MentionListObj: BaseMention[] = [];
  testingMentionObj: BaseMention[] = [];
  postDetailsAfterAssignTo = new BehaviorSubject<BaseMention>(null);
  public selectedPostList: number[] = [];
  public bulkMentionChecked: BulkMentionChecked[] = [];
  // public postSelectTrigger: BehaviorSubject<any> = new BehaviorSubject<number>(
  //   0
  // );
  public postSelectTriggerSignal = signal<any>(0);
  public refreshSRID: BehaviorSubject<any> =
    new BehaviorSubject<any>(null);
  public excludepostSelectTrigger: Subject<any> =
    new BehaviorSubject<number>(0);
  public unselectbulkpostTrigger = new Subject<boolean>();
  public deleteFromChannelSuccessMessage = new Subject<any>();
  public selectExcludeBrandMention: BehaviorSubject<any> =
    new BehaviorSubject<number>(0);
  /* public bulkActionPerformed = new BehaviorSubject<BaseMention>(null); */
  public bulkActionPerformedSignal = signal<BaseMention>(null);
  public bulkActionEnablePerformed = new BehaviorSubject<BaseMention>(null);
  /* public ssreActionPerformed = new BehaviorSubject<BaseMention>(null); */
  public ssreActionPerformedSignal = signal<BaseMention>(null);
  public ssreActionEnablePerformed = new BehaviorSubject<BaseMention>(null);
  // public loadedTicketHisotry = new BehaviorSubject<boolean>(null);
  public loadedTicketHisotrySignal = signal<boolean>(null);

  public viralAlertChatIconPosition = new BehaviorSubject<boolean>(false);
  // ticketStatusChange = new BehaviorSubject<boolean>(false);
  ticketStatusChangeSignal = signal<any>(false);

  // ticketStatusChangeObs = new Subject<{
  //   tagID: number;
  //   status: TicketStatus;
  //   guid?:string,
  //   ticketType?:number
  // }>();
  ticketStatusChangeObsSignal = signal<{
    tagID: number;
    status: TicketStatus;
    guid?: string,
    ticketType?: number
  }>(null);
  parentbulkActionChange = new BehaviorSubject<number>(0);
  // setLatestTicket = new BehaviorSubject<number>(null);

  ticketcategoryMapChange = new BehaviorSubject<{BaseMention:BaseMention,categoryType:string}>(null);
  ticketcategoryBulkMapChange = new Subject<{
    postData: BaseMention;
    tagIds: CategoryTagDetails[];
  }>();
  updateUpperCategory = new Subject<any>();
  /* noteAddedChange = new BehaviorSubject<boolean>(false); */
  noteAddedChangeSignal = signal<boolean>(false);
  /* noteAddedMediaChange = new BehaviorSubject<any>(null); */
  noteAddedMediaChangeSignal = signal<any>(null);
  public manualTicketData = new BehaviorSubject<any>(null);
  /* emailProfileDetailsObs = new Subject(); */
  emailProfileDetailsObsSignal = signal<any>(null);
  changeTicketPriorityObs = new BehaviorSubject<any>(null);
  checkAndStopYoutubeVideos = new BehaviorSubject<any>(null);
  hideGlobalNotificationObs = new BehaviorSubject<any>(null);
  hideShowCategoryObs = new BehaviorSubject<any>(null);
  // scrollEventSocialBox = new BehaviorSubject<any>(null);
  scrollEventSocialBoxSignal = signal<any>(null);
  scrollEventPostDetail = new BehaviorSubject<any>(false);
  openPostDetailWindow = new Subject<any>();
  // openCallDetailWindow = new Subject<any>();
  openCallDetailWindowSignal = signal<any>(null);

  ticketcategoryMapChangeForAllMentionUnderSameTicketId = new Subject<any>();

  changeTicketServiceMentionObj = new Subject<any>();
  changeAssignee = new BehaviorSubject<any>(null);
  /* updateTicketAssignmentList = new BehaviorSubject<any>(null); */
  updateTicketAssignmentListSignal = signal<any>(null);
  setLatestTicket: number = null;
  postReplyTypeObs = new BehaviorSubject<any>(null);
  /* ticketWorkFlowObs = new BehaviorSubject<any>(null); */
  ticketWorkFlowObsSignal = signal<any>(null);
  // setTicketForRefresh = new BehaviorSubject<boolean>(false);
  setTicketForRefreshSignal = signal<boolean>(false);
  ticketDetailWindowState = new BehaviorSubject<any>(false);
  setLikeDislikeMentionObs = new BehaviorSubject<BaseMention>(null);
  setRetweetMentionObs = new BehaviorSubject<BaseMention>(null);
  openChatObs = new Subject<BaseMention>();
  changeChatOnReassignment = new Subject();
  chatbotPositionUpdated = new BehaviorSubject<{
    status: boolean;
    level: number;
    bulkActionPanelStatus: boolean;
  }>(null);
  // closeAlreadyOpenReplyPopup = new BehaviorSubject<BaseMention>(null);
  closeAlreadyOpenReplyPopupSignal = signal<any>(null);

  refreshFillOverview = new BehaviorSubject<boolean>(null);
  /* actionableNonActionableCountObs = new BehaviorSubject<{
    guid: string;
    actionableFlag: boolean;
  }>(null); */
  actionableNonActionableCountObsSignal = signal<{
    guid: string;
    actionableFlag: boolean;
  }>(null);
  lazyLoadingObs = new Subject<{
    guid: string;
    lazyLoadingFlag: boolean;
  }>();
  autoCloseWindowObs = new Subject<{
    guid: string;
    autoCloseFlag: boolean;
  }>();
  ticketDetailData = signal<any>(null);

  /* updateCRMDetails = new Subject<{
    guid: string;
    SrID?: string;
    TagID?: number;
    leadID?: any;
    postType:PostsType,
    agentID?:number
  }>(); */
  updateCRMDetailsSignal = signal<{
    guid: string;
    SrID?: string;
    TagID?: number;
    leadID?: any;
    postType:PostsType,
    agentID?:number
  }>(null);
  ticketRenderingSetting: number;
  dialpadStatusCheck = new BehaviorSubject<boolean>(false);
  updateTaggedList = new Subject<{
    tagIDs: number[];
    guid: string;
  }>();
  /* updateCrmCreateButton = new Subject(); */
  updateCrmCreateButtonSignal = signal<any>(null);
  mentionTabCategoryChanges = new Subject<any>();
  uncheckedSelectedTickets = new Subject<string>();
  animalWildFareObs = new Subject<any>();
  // onHoldUnseenCount = new Subject<any>();
  onHoldUnseenCountSignal = signal<any>(null);

  acknowledgeSucessObs = new Subject<{ tagID :Number,guid:string}>()

  scanContentObs = new Subject<any>()
  bulkDeleteObs = new Subject<{guid:string,bulkList:any[],updateListFlag:boolean}>();
  bulkUpdateListObs = new Subject<{ guid: string, bulkList: any[] }>();
  searchTabViewObs = new Subject<{ guid: string}>()
  tabViewTicketListObs = new Subject<{ guid: string, listObj: any, selectedItem :any}>()
  tabViewMentionListObs = new Subject<{ guid: string, mentionObj: any, selectedItem: any, actionchk: boolean, nonactionchk: boolean, brandpost: boolean, brandreply :boolean}>()
  // updatePostOptionObs = new Subject<{selected:number,guid:string}>();
  updatePostOptionObsSignal = signal<{ selected: number, guid: string }>(null);
  updatePostOptionMentionObs = new Subject<{ guid: string, actionchk: boolean, nonactionchk: boolean, brandpost: boolean, brandreply: boolean }>();
  // agentAssignToObservable = new Subject<BaseMention>();
  agentAssignToObservableSignal = signal<BaseMention>(null);

  /* bulkCheckboxObs = new Subject<{checked:boolean,guid:string}>() */
  bulkCheckboxObsSignal = signal<{checked:boolean,guid:string}>(null);
  ticketHistoryAssignToObs = new Subject<boolean>();
  // emailFriendlyViewObs = new Subject<any>()
  emailFriendlyViewObsSignal = signal<any>(null)

  ticketAssignedToChange = new Subject<any>();
  ticketAssignedToListObs = new Subject<{tagIDList:any[],assignedUser:AssignToList}>();
  // ticketHistoryActionPerformObs = new Subject<number>();
  ticketHistoryActionPerformObsSignal = signal<number>(null);

  // ticketEscalationObs = new Subject<any>();
  ticketEscalationObsSignal = signal<any>(null);

  csdAssignObs = new Subject<any>();
  /* unselectedMention = new Subject<any>(); */
  unselectedMentionSignal = signal<any>(null);
  public updatephoneEmail: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  /* public unMaskedData: BehaviorSubject<any> = new BehaviorSubject<any>(null); */
  public unMaskedDataSignal = signal<any>(null);

  public newTicketSummary =  new BehaviorSubject({
    "type":null,
    "data":null,
    "status":false
  });
  public failedToUpdateTicketStatus = new Subject<{ tagId: number, ticketId: number, isOnlyUpdate?:boolean }>()
  /* updateTiktokAuthorDetails = new Subject<BaseMention>(); */
  updateTiktokAuthorDetailsSignal = signal<BaseMention>(null);
  customTabChange:Subject<any> = new Subject();
  // crmChatbotCloseTicketObs = new Subject<{status:number,refresh?:boolean}>();
  crmChatbotCloseTicketObsSignal = signal<{ status: number, refresh?: boolean }>(null);

  mentionOrGroupViewObs = new Subject<{ guid :string,value:AllMentionGroupView}>();
  updateMentionSeenUnseen = new Subject<{guid:string,tagId:number,seenOrUnseen:number}>();
  updateBulkMentionSeenUnseen = new Subject<{ guid: string, list: any[] }>();
  updateChildkMentionSeenUnseen = new Subject<{ seenOrUnseen: number,postData?:BaseMention }>();
  updateChildBulkMentionSeenUnseen = new Subject<{list: any[] }>();
  updateChildMentionInParentPost = new Subject<{seenOrUnseen:boolean}>();
  updateChildMentionInMentionList = new Subject<{ tagID:number,seenOrUnseen:boolean }>();
  updateMentionListSeenUnseen = new Subject<{ tagID: number, seenOrUnseen: boolean }>();
  updateMentionListBasedOnParentSocialID = new Subject<{ tagID: any, seenOrUnseen: boolean }>();
  updatePostOptionGroupViewObs = new Subject<{ guid: String, mentionOrGroupView: AllMentionGroupView }>();
  keyObjSubject = new BehaviorSubject<any>(null);
  ticketHistoryList: BaseMention[] = [];

  emailPopUpViewObs = new BehaviorSubject<{ status: boolean, isOpen:boolean, data:any }>({status:false, isOpen:false, data:null})
  emailPopDataObs = new BehaviorSubject<{ status: boolean, data: any }>({status:false, data:null});
  // emailPopupToPostReplySetDataObs = new BehaviorSubject<{ status: boolean, data:any }>({status:false, data:null});
  emailPopupToPostReplySetDataObsSignal = signal<{ status: boolean, data: any }>({ status: false, data: null });

  absolutTimeObs = new Subject<{
    guid: string;
    absolutTimeFlag: boolean;
  }>();

  unseenNoteCountObs = new BehaviorSubject < {guid: string,unseenCountObJ:any}> (null)
  updateUnseenNoteCountObs = new Subject<{ guid: string }>()
  hideUnssenNoteObs = new Subject<{ guid: string,ticketList:[] }>()
  emailMaximumMinimumObs = new Subject<boolean>();
  attachmentWidthCalculationObs = new Subject<any>();
  attachmentWidthCalculationDetailViewObs = new Subject<any>(); 
  mediaSideBarObs = new Subject<boolean>();
  colorPalette: string[] = [
    '#F44336', // Red
    '#E91E63', // Pink
    '#9C27B0', // Purple
    '#673AB7', // Deep Purple
    '#3F51B5', // Indigo
    '#2196F3', // Blue
    '#03A9F4', // Light Blue
    '#00BCD4', // Cyan
    '#009688', // Teal
    '#4CAF50', // Green
    '#8BC34A', // Light Green
    '#CDDC39', // Lime
    '#FFC107', // Amber
    '#FF9800', // Orange
    '#FF5722', // Deep Orange
    '#795548', // Brown
    '#607D8B'  // Blue Grey
  ];
  postLogAttachmentCalculationObs = new Subject<boolean>();
  directCloseStatus = new BehaviorSubject<boolean>(false);
  addNoteEmitFromOpenDetail = new BehaviorSubject<any>(false);
  replyInputTextData: string = '';
  generateClosingTicket = new BehaviorSubject<any>(null);
  signalBasedMentionCountUpdate = new Subject<boolean>();
  constructor(
    private _http: HttpClient,
    private _filterService: FilterService,
    private _locobuzzMentionService: LocobuzzmentionService,
    private MapLocobuzz: MaplocobuzzentitiesService,
    public dialog: MatDialog,
    private _navigationService: NavigationService,
    private _loginService: LoginService,
    private translate: TranslateService
  ) {
    this.initialize();
  }
  initialize(): void {
    // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
    //     file node as children.
    const data = this.buildFileTree(TREE_DATA, 0);

    // Notify the change.
    this.dataChange.next(data);
  }

  /**
   * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
   * The return value is the list of `TodoItemNode`.
   */
  buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
    return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
      const value = obj[key];
      const node = new TodoItemNode();
      node.item = key;

      if (value != null) {
        if (typeof value === 'object') {
          node.children = this.buildFileTree(value, level + 1);
        } else {
          node.item = value;
        }
      }

      return accumulator.concat(node);
    }, []);
  }

  /** Add an item to to-do list */
  insertItem(parent: TodoItemNode, name: string): void {
    if (parent.children) {
      parent.children.push({ item: name } as TodoItemNode);
      this.dataChange.next(this.data);
    }
  }

  updateItem(node: TodoItemNode, name: string): void {
    node.item = name;
    this.dataChange.next(this.data);
  }

  postDetailWindowTrigger(obj: postDetailWindow) {
    this.openPostDetailWindow.next(obj);
  }
  GetTickets(filterObj): Observable<BaseMention[]> {
    // const AuthToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYzY3Y2E5Zi01MmRmLTQwMTItOWUxMS1mODc0MmVmZjQ5MmMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzQ2NCIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6IkFrc2hheSIsImV4cCI6MTYxMDE5MzI2MCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.UnQElv_aLTBCDyX_3AODjnSSDpBh8s1SvJejPzl3Dxk';
    // const Theaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   Authorization: `Bearer ${AuthToken}`
    // });
    return this._http
      .post<BaseMentionObj>(environment.baseUrl + '/Tickets/List', filterObj)
      .pipe(
        map((response) => {
          if (response.success) {
            const MentionList: BaseMention[] = response.data.mentionList;
            this.ticketsFound = response.data.totalRecords;
            if (response.data.mentionList.length > 0) {
              this.MentionListObj = response.data.mentionList;
            }
            this.testingMentionObj = MentionList.slice(3);
            return MentionList;
          }
        })
      );
  }

  GetTicketsByTicketIds(filterObj): Observable<BaseMention[]> {
    return this._http
      .post<BaseMentionObj>(environment.baseUrl + '/Tickets/List', filterObj)
      .pipe(
        map((response) => {
          if (response.success) {
            const MentionList: BaseMention[] = response.data.mentionList;
            return MentionList;
          }
        })
      );
  }

  getMentionByTicketIds(key): Observable<BaseMention[]> {
    return this._http
      .post<BaseMentionObj>(environment.baseUrl + '/Tickets/MentionList', key)
      .pipe(
        map((response) => {
          if (response.success) {
            const MentionList: BaseMention[] = response.data.mentionList;
            return MentionList;
          }
        })
      );
  }

  GetEmailSettingByBrand(filterObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/GetIncommingEmailSetting',
        filterObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  CreateManualTicket(filterObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/CreateManualTicket',
        filterObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetCategoryConfig(filterObj): Observable<IApiResponse<any>> {
    const filteeObj = JSON.stringify(filterObj);
    // const options = filterObj ?
    // { params: new HttpParams().set('brand', filterObj) } : {};

    // let params = new HttpParams();
    // params = params.append('BrandID', Number(filterObj.BrandID));
    // params = params.append('BrandName', filterObj.BrandName);

    // const params = new HttpParams()
    // .set('BrandID', Number(filterObj.BrandID))
    // .set('BrandName', filterObj.BrandName);

    // const params = new HttpParams()
    //     .set('brand', filterObj);
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + `/Tickets/GetCategoryConfig`,
        filterObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getMentionList(key): Observable<BaseMention[]> {
    return this._http
      .post<BaseMentionObj>(environment.baseUrl + '/Tickets/MentionList', key)
      .pipe(
        map((response) => {
          if (response.success) {
            const MentionList: BaseMention[] = response.data.mentionList;
            this.ticketsFound = response.data.totalRecords;
            if (response.data.mentionList.length > 0) {
              this.MentionListObj = response.data.mentionList;
            }
            return MentionList;
          }
        })
      );
  }

  getMentionCount(key): Observable<MentionCounts> {
    // key.filters = [
    //   {
    //     name: 'isbrandactivity',
    //     type: 2,
    //     value: [2],
    //   },
    //   {
    //     name: 'isactionable',
    //     type: 2,
    //     value: [1],
    //   },
    // ];
    return this._http
      .post<MentionCountsResponse>(
        environment.baseUrl + '/Mention/GetMentionCounts',
        key
      )
      .pipe(
        map((response) => {
          if (response.success) {
            /* for pagination cheeck */
            this.listPaginationSignal.set({ status: true });
            /* for pagination cheeck */
            return response.data;
          }
        })
      );
  }

  MapMention(mention: any): Mention {
    switch (mention.ChannelGroup) {
      case ChannelGroup.Twitter:
        mention as TwitterMention;
        mention.author as TwitterAuthor;
        break;
      case ChannelGroup.Facebook:
        mention as FacebookMention;
        mention.author as FacebookAuthor;
        break;
      case ChannelGroup.Instagram:
        mention as InstagramMention;
        mention.author as InstagramAuthor;
        break;
      case ChannelGroup.Youtube:
        mention as YoutubeMention;
        mention.author as YoutubeAuthor;
        break;
      case ChannelGroup.LinkedIn:
        mention as LinkedinMention;
        mention.author as LinkedInAuthor;
        break;
      case ChannelGroup.GooglePlus:
        mention as NonActionableMention;
        break;
      case ChannelGroup.GooglePlayStore:
        mention as GooglePlayStoreMention;
        mention.author as GooglePlayStoreAuthor;
        break;
      case ChannelGroup.AutomotiveIndia:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.Blogs:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.Booking:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.ComplaintWebsites:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.CustomerCare:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.DiscussionForums:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.ECommerceWebsites:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.Expedia:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.HolidayIQ:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.MakeMyTrip:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.MyGov:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.News:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.ReviewWebsites:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.TeamBHP:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.TripAdvisor:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.Videos:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.Zomato:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      case ChannelGroup.Email:
        mention as EmailMention;
        mention.author as EmailAuthor;
        break;
      case ChannelGroup.GoogleMyReview:
        mention as GoogleMyReviewMention;
        mention.author as GoogleMyReviewAuthor;
        break;
      case ChannelGroup.WhatsApp:
        mention as WhatsAppMention;
        mention.author as WhatsAppAuthor;
        break;
      case ChannelGroup.WebsiteChatBot:
        mention as WebsiteChatbotMention;
        mention.author as WebsiteAuthor;
        break;
      case ChannelGroup.AppStoreReviews:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
      default:
        mention as NonActionableMention;
        mention.author as GenericAuthor;
        break;
    }
    return mention;
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
    } else if (mention.channelGroup === ChannelGroup.Instagram) {
      if (mention.channelType === ChannelType.InstagramComments) {
        channeltypeicon = 'assets/images/channelicons/Instagram_Comment.png';
      } else {
        channeltypeicon = 'assets/images/channel-logos/instagram.svg';
      }
    } else if (mention.channelGroup === ChannelGroup.GoogleMyReview) {
      if (mention.channelType === ChannelType.GMBQuestion) {
        channeltypeicon = 'assets/images/channelicons/GMBQuestion.png';
      } else if (mention.channelType === ChannelType.GMBAnswers) {
        channeltypeicon = 'assets/images/channelicons/GMBQuestion.png';
      } else {
        channeltypeicon = 'assets/images/channelicons/GoogleMyReview.png';
      }
    } else if (mention.channelGroup === ChannelGroup.AppStoreReviews) {
      channeltypeicon = 'assets/images/channelicons/AppStoreReviews.svg';
    } else if (mention.channelGroup === ChannelGroup.WebsiteChatBot) {
      channeltypeicon = 'assets/images/channelicons/WebsiteChatBot.svg';
    } else {
      channeltypeicon = `assets/images/channelicons/${
        ChannelGroup[mention.channelGroup]
      }.png`;
    }
    return channeltypeicon;
  }

  calculateTicketTimes(obj: BaseMention,guidFlag?): TicketTimings {
    
    const tickettiming: TicketTimings = {};
    const selctedSortBy = this._navigationService?.currentSelectedTab?.Filters?.orderBYColumn;
    const end = moment();
    let start, logObj;
    
    if (guidFlag != null) { guidFlag ? start = moment.utc(obj.mentionTime).local().format() :start = moment.utc(obj.ticketInfo.caseCreatedDate).local().format(); } 
    else { start = moment.utc(obj.mentionTime).local().format(); }

    if (obj?.ticketInfo?.caseCreatedDate && guidFlag && (!selctedSortBy || selctedSortBy == 'DateCreated')){
      start = moment.utc(obj.ticketInfo.caseCreatedDate).local().format();
    } 
    else if (obj?.modifiedDate && guidFlag && (selctedSortBy == 'LastUpdated')) {
      start = moment.utc(obj.modifiedDate).local().format();
    } 
    else if (obj?.latestTagIDInsertedAt && guidFlag && (selctedSortBy == 'LastAuthorUpdateDate')) {
      start = moment.utc(obj?.latestTagIDInsertedAt).local().format();
    }

    if (obj?.ticketInfo?.caseCreatedDate == '0001-01-01T00:00:00' || obj?.modifiedDate == '0001-01-01T00:00:00' || obj?.latestTagIDInsertedAt == '0001-01-01T00:00:00'){
      start = moment.utc(obj.mentionTime).local().format();
    }

    tickettiming.createdDate = obj.ticketInfo.caseCreatedDate ? moment.utc(obj.ticketInfo.caseCreatedDate).local().format('MMMM Do YYYY, h:mm:ss A') : '';
    tickettiming.modifiedDate = obj.modifiedDate ? moment.utc(obj.modifiedDate).local().format('MMMM Do YYYY, h:mm:ss A') : '';
    tickettiming.mentionDate = obj.mentionTime ? moment.utc(obj.mentionTime).local().format('MMMM Do YYYY, h:mm:ss A') : '';
    tickettiming.latestTagIDInsertedAt = obj?.latestTagIDInsertedAt ? moment.utc(obj.latestTagIDInsertedAt).local().format('MMMM Do YYYY, h:mm:ss A') : '';

      if(obj?.ticketInfo?.recordDate)
      {
        tickettiming.capturedDate = obj.ticketInfo?.recordDate
          ? moment.utc(obj.ticketInfo?.recordDate).local().format('MMMM Do YYYY, h:mm:ss A')
          : '';
      }

    const duration = moment.duration(moment(end).diff(moment(start)));

    // Get Years
    const years = Math.floor(duration.asYears());
    
    /* sort log added api call for temp */
    if (years == 2023) {
      logObj = {
        selctedSortBy: selctedSortBy,
        passDateType: {
          mentionTime: obj.mentionTime,
          caseCreatedDate: obj.ticketInfo.caseCreatedDate,
          modifiedDate: obj.modifiedDate,
          latestTagIDInsertedAt: obj?.latestTagIDInsertedAt,
          ticketId: obj?.ticketInfo.ticketID
        },
        endDate: end.toString(),
        startDate: moment(start).toString(),
        guidFlag: guidFlag
      }

      this.setLog(logObj).subscribe((res) => { console.log(res); })
    }
    /* sort log added api call for temp */

    const yearsFormatted =
      years && years > 1
        ? `${years} ${this.translate.instant('years')}`
        : years && years == 1
        ? `${years} ${this.translate.instant('year')}`
        : '';
    tickettiming.years = yearsFormatted;
    tickettiming.valMonths = String(years);

    // Get Months
    const months = Math.round(duration.asMonths());
    const monthsFormatted = months ? `${months} ${this.translate.instant('month')}` : '';
    tickettiming.months = monthsFormatted;
    tickettiming.valMonths = String(months);

    // Get Days
    const days = Math.round(duration.asDays());
    const daysFormatted =
      days && days > 1
        ? `${days} ${this.translate.instant('lower-days')}`
        : days && days == 1
          ? `${days} ${this.translate.instant('lower-day')}`
        : '';
    tickettiming.days = daysFormatted;
    tickettiming.valDays = String(days);

    // Get Hours
    const hours = duration.hours();
    const hoursFormatted = `${hours} ${this.translate.instant('hr')}`;
    tickettiming.hours = hoursFormatted;
    tickettiming.valHours = String(hours);

    // Get Minutes
    const minutes = duration.minutes();
    const minutesFormatted = `${minutes} ${this.translate.instant('min')}`;
    tickettiming.minutes = minutesFormatted;
    tickettiming.valMinutes = String(minutes);

    const seconds = duration.seconds();
    const secondsFormatted = `${minutes} ${this.translate.instant('sec')}`;
    tickettiming.seconds = secondsFormatted;
    tickettiming.valSeconds = String(seconds);

    tickettiming.timetoshow = years
      ? tickettiming.years
      : months
      ? tickettiming.months
      : days
      ? tickettiming.days
      : hours
      ? tickettiming.hours
      : minutes
      ? tickettiming.minutes
      : tickettiming.seconds;

    return tickettiming;
  }

  setLog(payload){
    return this._http.post(environment.baseUrl + '/Tickets/TimeErrorLog', payload)
  }
  calculateSSORequest(createdTime: any): string {
    const tickettiming: TicketTimings = {};

    const selctedSortBy = this._navigationService?.currentSelectedTab?.Filters?.orderBYColumn;
    const end = moment();
    let start
    start = moment.utc(createdTime).local().format();

    const duration = moment.duration(moment(end).diff(moment(start)));

    // Get Years
    const years = Math.floor(duration.asYears());
    const yearsFormatted =
      years && years > 1
        ? `${years} ${this.translate.instant('years')}`
        : years && years == 1
          ? `${years} ${this.translate.instant('year')}`
          : '';
    tickettiming.years = yearsFormatted;
    tickettiming.valMonths = String(years);

    // Get Months
    const months = Math.round(duration.asMonths());
    const monthsFormatted = months ? `${months} ${this.translate.instant('month')}` : '';
    tickettiming.months = monthsFormatted;
    tickettiming.valMonths = String(months);

    // Get Days
    const days = Math.round(duration.asDays());
    const daysFormatted =
      days && days > 1
        ? `${days} ${this.translate.instant('lower-days')}`
        : days && days == 1
          ? `${days} ${this.translate.instant('lower-day')}`
          : '';
    tickettiming.days = daysFormatted;
    tickettiming.valDays = String(days);

    // Get Hours
    const hours = duration.hours();
    const hoursFormatted = `${hours} ${this.translate.instant('hr')}`;
    tickettiming.hours = hoursFormatted;
    tickettiming.valHours = String(hours);

    // Get Minutes
    const minutes = duration.minutes();
    const minutesFormatted = `${minutes} ${this.translate.instant('min')}`;
    tickettiming.minutes = minutesFormatted;
    tickettiming.valMinutes = String(minutes);

    const seconds = duration.seconds();
    const secondsFormatted = `${seconds} ${this.translate.instant('sec')}`;
    tickettiming.seconds = secondsFormatted;
    tickettiming.valSeconds = String(seconds);

    tickettiming.timetoshow = years
      ? tickettiming.years
      : months
        ? tickettiming.months
        : days
          ? tickettiming.days
          : hours
            ? tickettiming.hours
            : minutes
              ? tickettiming.minutes
              : tickettiming.seconds;

    return tickettiming.timetoshow;
  }


  calculateBrandReplyTime(obj: BaseMention):string {
    var breachDate: any = moment.duration(
      moment().diff(moment.utc(obj?.modifiedDate).local())
    );
    const timeToShow =
      breachDate?._data?.days == 0 ? (breachDate?._data?.hours != 0 ?24- breachDate?._data?.hours + 'h' : breachDate?._data?.minutes != 0
        ?60- breachDate?._data?.minutes + 'm'
        :60- breachDate?._data?.seconds +
        's'):'';
    return timeToShow;
  }
  

  calculateCustomTicketTime(obj: any): TicketTimings {
    const tickettiming: TicketTimings = {};

    const end = moment();
    const start = moment.utc(obj).local().format();

    const duration = moment.duration(moment(end).diff(moment(start)));

    // Get Years
    const years = Math.floor(duration.asYears());
    const yearsFormatted = years ? `${years} ${this.translate.instant('year')}` : '';
    tickettiming.years = yearsFormatted;
    tickettiming.valMonths = String(years);

    // Get Months
    const months = Math.round(duration.asMonths());
    const monthsFormatted = months ? `${months} ${this.translate.instant('month')}` : '';
    tickettiming.months = monthsFormatted;
    tickettiming.valMonths = String(months);

    // Get Days
    const days = Math.round(duration.asDays());
    const daysFormatted = days ? `${days} ${this.translate.instant('lower-days')}` : '';
    tickettiming.days = daysFormatted;
    tickettiming.valDays = String(days);

    // Get Hours
    const hours = duration.hours();
    const hoursFormatted = `${hours} ${this.translate.instant('hr')} `;
    tickettiming.hours = hoursFormatted;
    tickettiming.valHours = String(hours);

    // Get Minutes
    const minutes = duration.minutes();
    const minutesFormatted = `${minutes} ${this.translate.instant('min')}`;
    tickettiming.minutes = minutesFormatted;
    tickettiming.valMinutes = String(minutes);

    const seconds = duration.seconds();
    const secondsFormatted = `${seconds} ${this.translate.instant('sec')}`;
    tickettiming.seconds = secondsFormatted;
    tickettiming.valSeconds = String(seconds);

    tickettiming.timetoshow = years
      ? tickettiming.years
      : months
      ? tickettiming.months
      : days
      ? tickettiming.days
      : hours
      ? tickettiming.hours
      : minutes
      ? tickettiming.minutes
      : tickettiming.seconds;

    return tickettiming;
  }

  GetTicketHistory(filterObj): Observable<any> {
    // if (filterObj.channel == ChannelGroup.Voice) {
    //   filterObj.IsAllChannel = 1;
    // }
    // const key =

    // {
    //   brandInfo: {
    //     brandID: mentionObj.brandInfo.brandID,
    //     brandName: mentionObj.brandInfo.brandName,
    //     categoryGroupID: 0,
    //     categoryID: 0,
    //     categoryName: 'string',
    //     mainBrandID: 0,
    //     compititionBrandIDs: [
    //       0
    //     ],
    //     brandFriendlyName: 'string',
    //     brandLogo: 'string',
    //     isBrandworkFlowEnabled: true,
    //     brandGroupName: 'string'
    //   },
    //   // startDateEpcoh: 1605033000,
    //   startDateEpcoh: 1608057000,
    //   // endDateEpoch: 1608229798,
    //   endDateEpoch: moment().utc().unix(),
    //   ticketId: mentionObj.ticketInfo.ticketID,
    //   to: 1,
    //   from: 5,
    //   authorId: mentionObj.author.socialId,
    //   isActionableData: 0,
    //   channel: mentionObj.channelGroup,
    //   IsPlainLogText: false
    // };

    const authtoken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYzY3Y2E5Zi01MmRmLTQwMTItOWUxMS1mODc0MmVmZjQ5MmMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzQ2NCIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6IkFrc2hheSIsImV4cCI6MTYxMDE5MzI2MCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.UnQElv_aLTBCDyX_3AODjnSSDpBh8s1SvJejPzl3Dxk';
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authtoken}`,
    });
    return this._http
      .post<BaseMentionWithCommLog>(
        environment.baseUrl + '/Tickets/GetUserHistory',
        filterObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          else {
            return [];
          }
        })
      );
  }

  GetNotesbyTagID(filterObj): Observable<any>{
    return this._http
      .post<BaseMentionWithCommLog>(
        environment.baseUrl + '/Tickets/GetNotesbyTagID',
        filterObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            const MentionList: BaseMention[] = response.data;
            return MentionList;
          }
        })
      );
  }

  GetTicketListbyID(payload): Observable<any> {
    return this._http
      .post<BaseMentionWithCommLog>(
        environment.baseUrl + '/Tickets/GetTicketListbyID',
        payload
      )
      .pipe(
        map((response) => {
          if (response.success) {
            const MentionList: BaseMention[] = response.data;
            return MentionList;
          }
        })
      );
  }

  changeTicketPriority(key): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    return this._http.post(
      environment.baseUrl + '/Tickets/ChangeTicketPriority',
      key,
      { headers: Theaders }
    );
  }

  getBrandInfluencerList(key): Observable<object> {
    return this._http.post(
      environment.baseUrl + '/Tickets/GetBrandInfluencer',
      key
    );
  }

  insertUpdateInfluencer(key): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });
    // let key = {"InfluencerCategoryID":"12091","InfluencerCategoryName":"Youtuber","ChannelType":"Twitter","AuthorSocialID":"1151024303506251776","ScreenName":"loco55672477","BrandName":"wrong","BrandID":7121}

    return this._http.post(
      environment.baseUrl + '/Tickets/InsertUpdateInfluencer',
      key,
      { headers: Theaders }
    );
  }

  addTicketNotes(key): Observable<object> {
    // const Theaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo'
    // });
    // let key = {"brandInfo":{"BrandID":"7121","BrandName":"wrong","BrandFriendlyName":"Wrong Brand","CategoryID":0,"CategoryName":"","BrandGroupName":"","BColor":"","CampaignName":""},"communicationLog":{"Note":"helo note added 14 jan 5 18","TicketID":"233916","TagID":"288425","AssignedToUserID":null,"Channel":"7","Status":"NotesAdded","type":"CommunicationLog","MentionTime":"01/14/2021 06:45:26"}}

    return this._http.post(
      environment.baseUrl + '/Tickets/AddTicketNotes',
      key
    );
  }
  addTicketNotesVOIP(key): Observable<object> {
    // const Theaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo'
    // });
    // let key = {"brandInfo":{"BrandID":"7121","BrandName":"wrong","BrandFriendlyName":"Wrong Brand","CategoryID":0,"CategoryName":"","BrandGroupName":"","BColor":"","CampaignName":""},"communicationLog":{"Note":"helo note added 14 jan 5 18","TicketID":"233916","TagID":"288425","AssignedToUserID":null,"Channel":"7","Status":"NotesAdded","type":"CommunicationLog","MentionTime":"01/14/2021 06:45:26"}}

    return this._http.post(
      environment.baseUrl + '/Tickets/AddTicketNotesVOIP',
      key
    );
  }
  editTicketNotes(key): Observable<object> {
    return this._http.post(
      environment.baseUrl + '/Tickets/EditNotes',
      key );
  }

  getAllfoulkeywordsOrEmailsList(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });
    let key = {
      brandInfo: {
        BrandID: '7121',
        BrandName: 'wrong',
        BrandFriendlyName: 'Wrong Brand',
        CategoryID: 0,
        CategoryName: '',
        BrandGroupName: '',
        BColor: '',
        CampaignName: '',
      },
      fag: 0,
    };
    return this._http.post(
      environment.baseUrl + '/Tickets/GetAllfoulkeywordsOrEmailsList',
      key,
      { headers: Theaders }
    );
  }

  searchByNameUsers(key): Observable<object> {
    // const Theaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo'
    // });
    // let key = {"BrandInfo":{"BrandID":"7121","BrandName":"wrong","BrandFriendlyName":"Wrong Brand","CategoryID":3398,"CategoryName":"LocobuzzTestDB","BrandGroupName":"","BColor":"","CampaignName":""},"ChannelGroup":"Twitter","SearchText":"harish","Offset":0,"NoOfRows":10}

    return this._http.post(
      environment.baseUrl + '/Tickets/GetSearchByNameUsers',
      key
    );
  }

  SaveMapSocialUsers(key): Observable<any> {
    // const Theaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo'
    // });
    // let key = {"BrandInfo":{"BrandID":"7121","BrandName":"wrong","BrandFriendlyName":"Wrong Brand","CategoryID":0,"CategoryName":"","BrandGroupName":"","BColor":"","CampaignName":""},"Author":{ "$type":"LocobuzzNG.Entities.Classes.Authors.Facebook.FacebookAuthor, LocobuzzNG.Entities", "isBlocked": false, "isVerifed": false, "isMuted": false, "isUserFollowing": false, "isBrandFollowing": false, "isMarkedInfluencer": false, "markedInfluencerID": 0, "profileUrl": null, "markedInfluencerCategoryName": null, "markedInfluencerCategoryID": 0, "canHaveUserTags": false, "canBeMarkedInfluencer": false, "canHaveConnectedUsers": false, "socialId": "2548554771896041", "isAnonymous": false, "name": "Shivam Bhattacharya", "channel": 0, "url": "", "profileImage": null, "nps": 0, "sentimentUpliftScore": 0.0, "id": 0, "picUrl": "https://platform-lookaside.fbsbx.com/platform/profilepic/?psid=2548554771896041&height=50&width=50&ext=1613302347&hash=AeSeY5EuK7obkBVGeIY", "glbMarkedInfluencerCategoryName": null, "glbMarkedInfluencerCategoryID": 0, "interactionCount": 0, "location": null, "locationXML": null, "userSentiment": 0, "channelGroup": 2, "latestTicketID": "233931", "userTags": [], "markedInfluencers": [], "connectedUsers": [], "locoBuzzCRMDetails": { "id": 0, "name": null, "emailID": null, "alternativeEmailID": null, "phoneNumber": null, "link": null, "address1": null, "address2": null, "notes": null, "city": null, "state": null, "country": null, "zipCode": null, "alternatePhoneNumber": null, "ssn": null, "customCRMColumnXml": null, "gender": null, "age": 0, "dob": null, "modifiedByUser": null, "modifiedTime": null, "modifiedDateTime": "0001-01-01T00:00:00", "modifiedTimeEpoch": 0.0, "timeoffset": 0, "dobString": null, "isInserted": false }, "previousLocoBuzzCRMDetails": null, "crmColumns": null },"MapAuthorSocialID":"136540912","Mapchannelgroupid":"1"}

    return this._http.post(
      environment.baseUrl + '/Tickets/SaveMapSocialUsers',
      key
    );
  }

  SaveLocoBuzzCRMDetail(key): Observable<any> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    return this._http.post(
      environment.baseUrl + '/Tickets/SaveLocoBuzzCRMDetail',
      key,
      { headers: Theaders }
    );
  }


  SaveLocoBuzzCRMDetailTicket(key): Observable<any> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    return this._http.post(
      environment.baseUrl + '/Tickets/SaveLocoBuzzCRMDetailTicket',
      key,
      { headers: Theaders }
    );
  }

  searchEmails(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });
    return this._http.get(
      environment.baseUrl + '/Tickets/SearchEmails?query=harish',
      { headers: Theaders }
    );
  }

  saveSubscription(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });
    const key = {
      TagID: 288451,
      TicketID: '233916',
      BrandID: '7121',
      BrandName: '',
      ID: '30038',
      EmailAddress:
        'harishkumar.jaiswal2@locobuzz.com,dipak.sharma3@locobuzz.com',
      Subject: 'Ticket status update regarding Ticket ID 233916',
      ActivityType: 2,
      IsSubscribe: true,
      Channel: '0',
      IsModified: true,
      SendOnlyNewUpdates: true,
    };
    return this._http.post(
      environment.baseUrl + '/Tickets/SaveSubscription',
      key,
      { headers: Theaders }
    );
  }

  enableTicketMakerChecker(key): Observable<object> {
    // const Theaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo'
    // });
    // let key = {"Source":{"$type":"LocobuzzNG.Entities.Classes.Mentions.FacebookMention, LocobuzzNG.Entities","parentPostSocialID":"101146514678678_235540547905940","fbPageName":"BittuLoco2030","fbPageID":101146514678678,"rating":0.0,"caption":null,"isHidden":false,"isPromoted":false,"hideFromAllBrand":false,"postClicks":null,"postVideoAvgTimeWatched":null,"canReplyPrivately":true,"mentionMetadata":{"videoView":0,"postClicks":0,"postVideoAvgTimeWatched":0,"likeCount":0,"commentCount":0,"reach":null,"impression":null,"videoViews":0,"engagementCount":0,"reachCountRate":0,"impressionsCountRate":0,"engagementCountRate":0,"isFromAPI":false},"author":{"$type":"LocobuzzNG.Entities.Classes.Authors.Facebook.FacebookAuthor, LocobuzzNG.Entities","isBlocked":false,"isVerifed":false,"isMuted":false,"isUserFollowing":false,"isBrandFollowing":false,"isMarkedInfluencer":false,"markedInfluencerID":0,"profileUrl":null,"markedInfluencerCategoryName":"Youtuber","markedInfluencerCategoryID":12092,"canHaveUserTags":false,"canBeMarkedInfluencer":false,"canHaveConnectedUsers":false,"socialId":"1446965598761128","isAnonymous":false,"name":"Harishkumar Jaiswal","channel":0,"url":null,"profileImage":null,"nps":0,"sentimentUpliftScore":0.0,"id":0,"picUrl":"https://images.locobuzz.com/1446965598761128.jpg","glbMarkedInfluencerCategoryName":"Youtuber","glbMarkedInfluencerCategoryID":12092,"interactionCount":0,"location":null,"locationXML":null,"userSentiment":0,"channelGroup":2,"latestTicketID":"213787","userTags":[],"markedInfluencers":[],"connectedUsers":[],"locoBuzzCRMDetails":{"id":0,"name":null,"emailID":null,"alternativeEmailID":null,"phoneNumber":null,"link":null,"address1":null,"address2":null,"notes":null,"city":null,"state":null,"country":null,"zipCode":null,"alternatePhoneNumber":null,"ssn":null,"customCRMColumnXml":null,"gender":null,"age":0,"dob":null,"modifiedByUser":null,"modifiedTime":null,"modifiedDateTime":"0001-01-01T00:00:00","modifiedTimeEpoch":0.0,"timeoffset":0,"dobString":null,"isInserted":false},"previousLocoBuzzCRMDetails":null,"crmColumns":null},"description":"not good","shareCount":0,"canReply":true,"parentSocialID":"235540547905940_245752053551456","parentPostID":20435,"parentID":null,"id":null,"socialID":"235540547905940_246195620173766","title":null,"isActionable":true,"channelType":8,"channelGroup":2,"mentionID":null,"url":null,"sentiment":0,"tagID":267364,"isDeleted":false,"isDeletedFromSocial":false,"mediaType":1,"mediaTypeFormat":1,"status":0,"isSendFeedback":false,"isSendAsDMLink":false,"isPrivateMessage":false,"isBrandPost":false,"updatedDateTime":null,"location":null,"mentionTime":"2020-12-17T07:09:42","contentID":11022,"isRead":true,"readBy":33084,"readAt":"2020-12-17T12:58:40.98","numberOfMentions":"7","languageName":null,"isReplied":false,"isParentPost":false,"inReplyToStatusId":43384,"replyInitiated":false,"isMakerCheckerEnable":false,"attachToCaseid":null,"mentionsAttachToCaseid":null,"insertedDate":"2020-12-17T08:22:15.053","mentionCapturedDate":null,"mentionTimeEpoch":0.0,"modifiedDateEpoch":0.0,"likeStatus":false,"modifiedDate":"2021-01-15T07:30:41.663","brandInfo":{"brandID":7121,"brandName":"wrong","categoryGroupID":0,"categoryID":0,"categoryName":null,"mainBrandID":0,"compititionBrandIDs":null,"brandFriendlyName":"Wrong Brand","brandLogo":null,"isBrandworkFlowEnabled":false,"brandGroupName":null},"upperCategory":{"id":0,"name":null,"userID":null,"brandInfo":null},"categoryMap":[{"id":33773,"name":"miscellaneous","upperCategoryID":0,"sentiment":1,"isTicket":false,"subCategories":[]}],"retweetedStatusID":null,"ticketInfo":{"ticketID":213787,"tagID":267364,"assignedBy":null,"assignedTo":null,"assignedToTeam":null,"assignToAgentUserName":null,"readByUserName":"v1gaurang sup","escalatedTotUserName":null,"escalatedToBrandUserName":null,"assignedAt":"0001-01-01T00:00:00","previousAssignedTo":0,"escalatedTo":null,"escaltedToAccountType":0,"escalatedToCSDTeam":null,"escalatedBy":null,"escalatedAt":"0001-01-01T00:00:00","escalatedToBrand":null,"escalatedToBrandTeam":null,"escalatedToBrandBy":null,"escalatedToBrandAt":"0001-01-01T00:00:00","status":0,"updatedAt":"0001-01-01T00:00:00","createdAt":"0001-01-01T00:00:00","numberOfMentions":7,"ticketPriority":2,"lastNote":"k","latestTagID":267364,"autoClose":false,"isAutoClosureEnabled":false,"isMakerCheckerEnable":false,"ticketPreviousStatus":null,"guid":null,"srid":null,"previousAssignedFrom":null,"previouAgentWorkflowWorkedAgent":null,"csdTeamId":null,"brandTeamId":null,"teamid":null,"previousAgentAccountType":null,"ticketAgentWorkFlowEnabled":false,"makerCheckerStatus":7,"messageSentforApproval":null,"replyScheduledDateTime":null,"requestedByUserid":null,"workFlowTagid":null,"workflowStatus":0,"ssreStatus":0,"isCustomerInfoAwaited":false,"utcDateTimeOfOperation":null,"toEmailList":null,"ccEmailList":null,"bccEmailList":null,"taskJsonList":null,"caseCreatedDate":"2020-12-17T08:22:15.053","tatflrBreachTime":"2020-12-17T08:38:15.053","lockUserID":null,"lockDatetime":null,"lockUserName":null,"isTicketLocked":false,"tattime":45980,"flrtatSeconds":null,"replyEscalatedToUsername":null,"replyUserName":null,"replyUserID":0,"replyApprovedOrRejectedBy":null,"ticketProcessStatus":null,"ticketProcessNote":null,"replyUseid":0,"escalationMessage":null,"isSubscribed":false,"ticketUpperCategory":{"id":0,"name":null,"userID":null,"brandInfo":null},"ticketCategoryMap":[{"id":53912,"name":"Done","upperCategoryID":0,"sentiment":null,"isTicket":false,"subCategories":[{"id":42548,"name":"Numbers","categoryID":0,"sentiment":0,"subSubCategories":[]}]}],"ticketCategoryMapText":"<CategoryMap>\r\n<Category><ID>53912</ID><Name>Done</Name><SubCategory><ID>42548</ID><Name>Numbers</Name><Sentiment>0</Sentiment></SubCategory></Category></CategoryMap>\r\n","latestResponseTime":null},"ticketInfoSsre":{"ssreOriginalIntent":0,"ssreReplyVerifiedOrRejectedBy":"v1local pari agent","latestMentionActionedBySSRE":0,"transferTo":2,"ssreEscalatedTo":0,"ssreEscalationMessage":null,"intentRuleType":0,"ssreStatus":1,"retrainTagid":0,"retrainBy":0,"retrainDate":"0001-01-01T00:00:00","ssreMode":0,"ssreIntent":1,"ssreReplyType":0,"intentFriendlyName":null,"intentOrRuleID":0,"latestSSREReply":null,"ssreReplyVerifiedOrRejectedTagid":267364,"ssreReply":{"authorid":null,"replyresponseid":null,"replymessage":null,"channelType":0,"escalatedTo":0,"escalationMessage":null}},"ticketInfoCrm":{"srUpdatedDateTime":null,"srid":null,"isPushRE":0,"srStatus":0,"srCreatedBy":null,"srDescription":null,"remarks":null,"jioNumber":null,"partyid":null,"isPartyID":0,"mapid":10076,"isFTR":null},"attachmentMetadata":{"mediaContents":[],"mediaContentText":"<Attachments></Attachments>","mediaUrls":null,"mediaAttachments":[],"attachments":"<Attachments></Attachments>"},"makerCheckerMetadata":{"workflowReplyDetailID":0,"replyMakerCheckerMessage":null,"isSendGroupMail":false,"replyStatus":null,"replyEscalatedTeamName":null,"workflowStatus":0,"isTakeOver":null},"categoryMapText":"<CategoryMap>\r\n<Category><ID>33773</ID><Name>miscellaneous</Name><Sentiment>1</Sentiment></Category></CategoryMap>\r\n","ticketID":0,"isSSRE":false},"Ismakercheckerstatus":true}
    return this._http.post(
      environment.baseUrl + '/Tickets/EnableTicketMakerChecker',
      key
    );
  }

  translateText(key): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });
    // let key = {"brandInfo":{"BrandID":"7121","BrandName":"wrong"},"model":{"TagId":"202693","Text":"@Daenery91712253  wassupp dany"},"StartDateEpoch":1610908200,"EndDateEpoch":1610994598}
    return this._http.post(environment.baseUrl + '/Tickets/TranslateText', key);
  }

  ticketReassignToUser(key): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });
    return this._http.post(
      environment.baseUrl + '/Tickets/TicketReassignToUser',
      key,
      { headers: Theaders }
    );
  }
  voipTicketReassignToUser(key): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });
    return this._http.post(
      environment.baseUrl + '/Tickets/VoipTicketReassignToUser',
      key,
      { headers: Theaders }
    );
  }

  DeleteFromSocial(keyObj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Mention/DeleteFromSocial', keyObj)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }
  DeleteFromSocialAndTool(keyObj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Mention/DeleteFromBoth', keyObj)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  BulkDeleteFromSocial(keyObj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Mention/BulkDeleteFromSocial', keyObj)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  DeleteFromLocobuzz(keyObj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Mention/DeleteFromLocobuzz', keyObj)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  makeActionable(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    let key = {
      source: {
        $type:
          'LocobuzzNG.Entities.Classes.Mentions.InstagramMention, LocobuzzNG.Entities',
        concreteClassName:
          'LocobuzzNG.Entities.Classes.Mentions.InstagramMention',
        parentPostSocialID: '2482051833051525612_17841416607413700',
        instaAccountID: 61,
        isPromoted: false,
        caption: null,
        instagramGraphApiID: 18131020900157748,
        instagramPostType: 1,
        parentInstagramGraphApiID: 0,
        saved: null,
        exists: null,
        replies: null,
        tapsForward: null,
        tapsBack: null,
        author: {
          $type:
            'LocobuzzNG.Entities.Classes.Authors.Instagram.InstagramAuthor, LocobuzzNG.Entities',
          isVerifed: false,
          screenname: 'dipa_locobuzz',
          followersCount: 0,
          isMarkedInfluencer: false,
          markedInfluencerID: 0,
          markedInfluencerCategoryName: null,
          markedInfluencerCategoryID: 0,
          canHaveUserTags: false,
          canBeMarkedInfluencer: false,
          canHaveConnectedUsers: false,
          profileUrl: null,
          socialId: 'dipa_locobuzz',
          isAnonymous: false,
          name: 'dipa_locobuzz',
          channel: 0,
          url: 'https://www.instagram.com/p/CJyBP3fJLHs/',
          profileImage: null,
          nps: 0,
          sentimentUpliftScore: 0,
          id: 0,
          picUrl: null,
          glbMarkedInfluencerCategoryName: null,
          glbMarkedInfluencerCategoryID: 0,
          interactionCount: 0,
          location: null,
          locationXML: null,
          userSentiment: 0,
          channelGroup: 3,
          latestTicketID: '0',
          userTags: [],
          markedInfluencers: [],
          connectedUsers: [],
          locoBuzzCRMDetails: {
            id: 0,
            name: null,
            emailID: null,
            alternativeEmailID: null,
            phoneNumber: null,
            link: null,
            address1: null,
            address2: null,
            notes: null,
            city: null,
            state: null,
            country: null,
            zipCode: null,
            alternatePhoneNumber: null,
            ssn: null,
            customCRMColumnXml: null,
            gender: null,
            age: 0,
            dob: null,
            modifiedByUser: null,
            modifiedTime: null,
            modifiedDateTime: '0001-01-01T00:00:00',
            modifiedTimeEpoch: 0,
            timeoffset: 0,
            dobString: null,
            isInserted: false,
          },
          previousLocoBuzzCRMDetails: null,
          crmColumns: null,
          lastActivity: null,
          firstActivity: null,
        },
        description: 'add comment before del diy gun',
        shareCount: 0,
        canReply: false,
        parentSocialID: '',
        parentPostID: 30179,
        parentID: null,
        id: null,
        socialID: '18185877718012057',
        title: null,
        isActionable: false,
        channelType: 22,
        channelGroup: 3,
        mentionID: null,
        url: 'https://www.instagram.com/p/CJyBP3fJLHs/',
        sentiment: 1,
        tagID: 288236,
        isDeleted: false,
        isDeletedFromSocial: true,
        mediaType: 1,
        mediaTypeFormat: 1,
        status: 10,
        isSendFeedback: false,
        isSendAsDMLink: false,
        isPrivateMessage: false,
        isBrandPost: false,
        updatedDateTime: '2021-01-11T10:41:12.327',
        location: null,
        mentionTime: '2021-01-11T09:13:16',
        contentID: 61201,
        isRead: false,
        readBy: null,
        readAt: null,
        numberOfMentions: null,
        languageName: null,
        isReplied: false,
        isParentPost: false,
        inReplyToStatusId: 61,
        replyInitiated: false,
        isMakerCheckerEnable: false,
        attachToCaseid: null,
        mentionsAttachToCaseid: null,
        insertedDate: null,
        mentionCapturedDate: null,
        mentionTimeEpoch: 0,
        modifiedDateEpoch: 0,
        likeStatus: false,
        modifiedDate: '0001-01-01T00:00:00',
        brandInfo: {
          brandID: 7121,
          brandName: 'wrong',
          categoryGroupID: 0,
          categoryID: 0,
          categoryName: null,
          mainBrandID: 0,
          compititionBrandIDs: null,
          brandFriendlyName: 'Wrong Brand',
          brandLogo: null,
          isBrandworkFlowEnabled: false,
          brandGroupName: null,
        },
        upperCategory: { id: 0, name: null, userID: null, brandInfo: null },
        categoryMap: [
          {
            id: 53918,
            name: 'hello category',
            upperCategoryID: 0,
            sentiment: 1,
            isTicket: false,
            subCategories: [],
          },
          {
            id: 53916,
            name: 'mahmud',
            upperCategoryID: 0,
            sentiment: null,
            isTicket: false,
            subCategories: [
              {
                id: 42552,
                name: 'random works again',
                categoryID: 0,
                sentiment: 0,
                subSubCategories: [],
              },
            ],
          },
          {
            id: 33746,
            name: 'test',
            upperCategoryID: 0,
            sentiment: null,
            isTicket: false,
            subCategories: [
              {
                id: 42549,
                name: 'test-1',
                categoryID: 0,
                sentiment: null,
                subSubCategories: [
                  {
                    id: 52418,
                    name: 'test-2',
                    categoryID: 0,
                    subCategoryID: 0,
                    sentiment: 0,
                  },
                ],
              },
            ],
          },
        ],
        retweetedStatusID: null,
        ticketInfo: {
          ticketID: 0,
          tagID: 288236,
          assignedBy: null,
          assignedTo: null,
          assignedToTeam: null,
          assignToAgentUserName: null,
          readByUserName: null,
          escalatedTotUserName: null,
          escalatedToBrandUserName: null,
          assignedAt: '0001-01-01T00:00:00',
          previousAssignedTo: 0,
          escalatedTo: null,
          escaltedToAccountType: 0,
          escalatedToCSDTeam: null,
          escalatedBy: null,
          escalatedAt: '0001-01-01T00:00:00',
          escalatedToBrand: null,
          escalatedToBrandTeam: null,
          escalatedToBrandBy: null,
          escalatedToBrandAt: '0001-01-01T00:00:00',
          status: 0,
          updatedAt: '0001-01-01T00:00:00',
          createdAt: '0001-01-01T00:00:00',
          numberOfMentions: 0,
          ticketPriority: 0,
          lastNote: null,
          latestTagID: 0,
          autoClose: false,
          isAutoClosureEnabled: false,
          isMakerCheckerEnable: false,
          ticketPreviousStatus: null,
          guid: null,
          srid: null,
          previousAssignedFrom: null,
          previouAgentWorkflowWorkedAgent: null,
          csdTeamId: null,
          brandTeamId: null,
          teamid: null,
          previousAgentAccountType: null,
          ticketAgentWorkFlowEnabled: false,
          makerCheckerStatus: 0,
          messageSentforApproval: null,
          replyScheduledDateTime: null,
          requestedByUserid: null,
          workFlowTagid: null,
          workflowStatus: 0,
          ssreStatus: 0,
          isCustomerInfoAwaited: false,
          utcDateTimeOfOperation: null,
          toEmailList: null,
          ccEmailList: null,
          bccEmailList: null,
          taskJsonList: null,
          caseCreatedDate: '0001-01-01T00:00:00',
          tatflrBreachTime: '0001-01-01T00:00:00',
          lockUserID: null,
          lockDatetime: null,
          lockUserName: null,
          isTicketLocked: false,
          tattime: null,
          flrtatSeconds: null,
          replyEscalatedToUsername: null,
          replyUserName: null,
          replyUserID: 0,
          replyApprovedOrRejectedBy: null,
          ticketProcessStatus: null,
          ticketProcessNote: null,
          replyUseid: 0,
          escalationMessage: null,
          isSubscribed: false,
          ticketUpperCategory: {
            id: 0,
            name: null,
            userID: null,
            brandInfo: null,
          },
          ticketCategoryMap: null,
          ticketCategoryMapText: '<CategoryMap>\r\n</CategoryMap>\r\n',
          latestResponseTime: null,
        },
        ticketInfoSsre: {
          ssreOriginalIntent: 0,
          ssreReplyVerifiedOrRejectedBy: null,
          latestMentionActionedBySSRE: 0,
          transferTo: 0,
          ssreEscalatedTo: 0,
          ssreEscalationMessage: null,
          intentRuleType: 0,
          ssreStatus: 0,
          retrainTagid: 0,
          retrainBy: 0,
          retrainDate: '0001-01-01T00:00:00',
          ssreMode: 0,
          ssreIntent: 0,
          ssreReplyType: 0,
          intentFriendlyName: null,
          intentOrRuleID: 0,
          latestSSREReply: null,
          ssreReplyVerifiedOrRejectedTagid: 0,
          ssreReply: {
            authorid: null,
            replyresponseid: null,
            replymessage: null,
            channelType: 0,
            escalatedTo: 0,
            escalationMessage: null,
          },
        },
        ticketInfoCrm: {
          srUpdatedDateTime: '2021-01-11T10:41:12.327',
          srid: null,
          isPushRE: 0,
          srStatus: 0,
          srCreatedBy: null,
          srDescription: null,
          remarks: null,
          jioNumber: null,
          partyid: null,
          isPartyID: 0,
          mapid: null,
          isFTR: null,
        },
        attachmentMetadata: {
          mediaContents: [],
          mediaContentText: '<Attachments></Attachments>',
          mediaUrls: null,
          mediaAttachments: [],
          attachments: '<Attachments></Attachments>',
        },
        makerCheckerMetadata: {
          workflowReplyDetailID: 0,
          replyMakerCheckerMessage: null,
          isSendGroupMail: false,
          replyStatus: null,
          replyEscalatedTeamName: null,
          workflowStatus: 0,
          isTakeOver: null,
        },
        mentionMetadata: {
          videoView: 0,
          postClicks: 0,
          postVideoAvgTimeWatched: 0,
          likeCount: null,
          commentCount: null,
          reach: 0,
          impression: 0,
          videoViews: 0,
          engagementCount: 0,
          reachCountRate: 0,
          impressionsCountRate: 0,
          engagementCountRate: 0,
          isFromAPI: false,
        },
        categoryMapText:
          '<CategoryMap>\r\n<Category><ID>53918</ID><Name>hello category</Name><Sentiment>1</Sentiment></Category><Category><ID>53916</ID><Name>mahmud</Name><SubCategory><ID>42552</ID><Name>random works again</Name><Sentiment>0</Sentiment></SubCategory></Category><Category><ID>33746</ID><Name>test</Name><SubCategory><ID>42549</ID><Name>test-1</Name><SubSubCategory><ID>52418</ID><Name>test-2</Name><Sentiment>0</Sentiment></SubSubCategory></SubCategory></Category></CategoryMap>\r\n',
        ticketID: 0,
        isSSRE: false,
        settingID: 61,
      },
      NonActionalbleAuthorName: 'Anonymous',
      actionTaken: 0,
    };
    return this._http.post(
      environment.baseUrl + '/Mention/MarkActionable',
      key,
      { headers: Theaders }
    );
  }

  forwardEmail(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    return this._http.post(environment.baseUrl + '/Tickets/ForwardEmail', {
      headers: Theaders,
    });
  }

  blockUnblockAuthor(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    let key = {
      Author: {
        $type:
          'LocobuzzNG.Entities.Classes.Authors.Twitter.TwitterAuthor, LocobuzzNG.Entities',
        SocialId: '1265888991275937792',
        name: "Joe'eeeee",
        screenname: 'Joe51893106',
        ChannelGroup: 1,
      },
      BrandInfo: { BrandID: '7121', BrandName: 'wrong' },
      Account: {
        $type:
          'LocobuzzNG.Entities.Classes.AccountConfigurations.TwitterAccountConfiguration, LocobuzzNG.Entities',
        AccountID: 10798,
        SocialID: '1054251559826141184',
        BrandInformation: { BrandID: '7121', BrandName: 'wrong' },
      },
      IsBlock: false,
    };
    return this._http.post(
      environment.baseUrl + '/Author/BlockUnblockAuthor',
      key,
      { headers: Theaders }
    );
  }

  muteUnmuteAuthor(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    let key = {
      Author: {
        $type:
          'LocobuzzNG.Entities.Classes.Authors.Twitter.TwitterAuthor, LocobuzzNG.Entities',
        SocialId: '1265888991275937792',
        name: "Joe'eeeee",
        screenname: 'Joe51893106',
        ChannelGroup: 1,
      },
      BrandInfo: { BrandID: '7121', BrandName: 'wrong' },
      Account: {
        $type:
          'LocobuzzNG.Entities.Classes.AccountConfigurations.TwitterAccountConfiguration, LocobuzzNG.Entities',
        AccountID: 10798,
        SocialID: '1054251559826141184',
        BrandInformation: { BrandID: '7121', BrandName: 'wrong' },
      },
      IsMute: false,
    };
    return this._http.post(
      environment.baseUrl + '/Author/MuteUnmuteAuthor',
      key,
      { headers: Theaders }
    );
  }

  followUnfollowAuthor(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    let key = {
      Author: {
        $type:
          'LocobuzzNG.Entities.Classes.Authors.Twitter.TwitterAuthor, LocobuzzNG.Entities',
        SocialId: '1265888991275937792',
        name: "Joe'eeeee",
        screenname: 'Joe51893106',
        ChannelGroup: 1,
      },
      BrandInfo: { BrandID: '7121', BrandName: 'wrong' },
      Account: {
        $type:
          'LocobuzzNG.Entities.Classes.AccountConfigurations.TwitterAccountConfiguration, LocobuzzNG.Entities',
        AccountID: 10798,
        SocialID: '1054251559826141184',
        BrandInformation: { BrandID: '7121', BrandName: 'wrong' },
      },
      IsFollow: false,
    };
    return this._http.post(
      environment.baseUrl + '/Author/FollowUnfollowAuthor',
      key,
      { headers: Theaders }
    );
  }

  likeDislikeMention(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Mention/LikeDislikeMention',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  retweetUnRetweetMention(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Mention/RetweetUnretweetMention',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetRetweetReplyTrend(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Mention/GetRetweetReplyTrend',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getTrendEngagedUsers(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Mention/GetTrendEngagedUsers',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getTrendRetweetLocation(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Mention/GetTrendRetweetLocation',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getTrendReplyLocation(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Mention/GetTrendReplyLocation',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getTrendsSentimentTagCloudData(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Mention/GetTrendsSentimentTagCloudData',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  hideUnhideMention(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    let key = {
      Source: {
        $type:
          'LocobuzzNG.Entities.Classes.Mentions.FacebookMention, LocobuzzNG.Entities',
        ChannelGroup: 2,
        ChannelType: 8,
        TagID: 203788,
        BrandInfo: { BrandID: '7121', BrandName: 'wrong' },
        SocialID: '192524738874188_193950238731638',
      },
      Account: {
        $type:
          'LocobuzzNG.Entities.Classes.AccountConfigurations.FacebookAccountConfiguration, LocobuzzNG.Entities',
        AccountID: 31810,
        SocialID: '101146514678678',
        BrandInformation: { BrandID: '7121', BrandName: 'wrong' },
      },
      IsHidden: false,
      IsHiddenFromAllBrand: false,
    };
    return this._http.post(
      environment.baseUrl + '/Mention/HideUnhideMention',
      key,
      { headers: Theaders }
    );
  }

  getBlockAuthorListTwitter(): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    let key = { Brand: { BrandID: 7121, BrandName: 'wrong' }, ChannelGroup: 1 };
    return this._http.post(
      environment.baseUrl + '/Account/ConfiguredBrandChannelAccount',
      key,
      { headers: Theaders }
    );
  }

  changeTicketStatus(key): Observable<object> {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    return this._http.post(
      environment.baseUrl + '/Tickets/ChangeTicketStatus',
      key,
      { headers: Theaders }
    );
  }

  checkAutoclosureEligibility(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/CheckAutoclouserEligibility',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  inActiveInfluencer(key): Observable<object> {
    return this._http.post(
      environment.baseUrl + '/Tickets/InActiveInfluencer',
      key
    );
  }

  getCannedResponseCategories(key): Observable<object> {
    return this._http.post(
      environment.baseUrl + '/Account/GetCannedResponseCategoryList',
      key
    );
  }

  getCannedResponse(key): Observable<object> {
    return this._http.post(
      environment.baseUrl + '/Account/GetCannedResponseListByCatgeoryID',
      key
    );
  }

  replyAutoSuggest(key): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/ReplySuggestion',
        key
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getEmailHtmlData(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/GetEmailHtmlContentByTagID',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getMentionCountByTicektID(ticketid): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl +
          `/Tickets/GetMentionCountByTicektID?TicketID=${ticketid}`,
        {}
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  sendAspectFeedback(data:any): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl +
        `/AIFeature/AIFeatureLogs`,
        data
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  CheckTicketIfPendingWithnewMention(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + `/Tickets/CheckTicketIfPendingWithnewMention`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetMentionCountOnTicket(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + `/Tickets/GetMentionCountOnTicket`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getAuthorTickets(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + `/Tickets/GetAuthorTickets`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  lockUnlockTicket(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/LockUnlockCase',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  getTicketLock(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/GetTicketLockedDetails',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  markTicketAsRead(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/MarkAsCaseRead',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getMentionReplybyTagID(keyObj): Observable<BaseMentionWithCommLog> {
    return this._http
      .post<BaseMentionWithCommLog>(
        environment.baseUrl + '/Tickets/GetMentionReplybyTagID',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // deleteTraits(keyObj): Observable
  mapPostByChannel(postData: BaseMention,isModified?): any {
    let assignToname = '';

    let sfdcTicketView = JSON.parse(localStorage.getItem('sfdcTicketView'));
    if (!sfdcTicketView)
    {
    if (postData.ticketInfo.assignedTo) {
      assignToname = this._filterService.getNameByID(
        postData.ticketInfo.assignedTo,
        this._filterService.fetchedAssignTo
      );
      if (assignToname == null || assignToname == undefined) {
        assignToname = postData.ticketInfo.assignToAgentUserName;
      }
      if (postData.ticketInfo.assignedToTeam) {
        assignToname += ' (' + postData.ticketInfo.assignedToTeamName + ')';
      }
    } else if (postData.ticketInfo.assignedToTeam) {
      assignToname = postData.ticketInfo.assignedToTeamName;
    }
  }

    const ticketcategories: TicketMentionCategory[] = [];
    const mentioncategories: TicketMentionCategory[] = [];
    let ticketCategory = '';
    let mentionCategory = '';
    let ticketcatcolor = null;
    let mentioncatcolor = null;
    if (
      postData.ticketInfo.ticketCategoryMap != null &&
      postData.ticketInfo.ticketCategoryMap
    ) {
      let CounterIndex = 0;
      const IsTicket = postData.categoryMap[0].isTicket;

      for (let i = 0; i < postData.ticketInfo.ticketCategoryMap.length; i++) {
        if (postData.ticketInfo.ticketCategoryMap[i].sentiment == null) {
          for (
            let j = 0;
            j < postData.ticketInfo.ticketCategoryMap[i].subCategories.length;
            j++
          ) {
            if (
              postData.ticketInfo.ticketCategoryMap[i].subCategories[j]
                .sentiment == null
            ) {
              for (
                let k = 0;
                k <
                postData.ticketInfo.ticketCategoryMap[i].subCategories[j]
                  .subSubCategories.length;
                k++
              ) {
                CounterIndex = CounterIndex + 1;
                // if ((!IsTicket && CounterIndex > 2) || (IsTicket && CounterIndex > 2)) {
                //   break;
                // }
                // else {
                // if ((!IsTicket && k < 2) || (IsTicket && k < 2)) {
                const parentticketCategory =
                  postData.ticketInfo.ticketCategoryMap[i].name;
                const subticketCategory =
                  postData.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .name;
                ticketCategory =
                  postData.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .subSubCategories[k].name;
                if (ticketCategory) {
                  ticketcatcolor =
                    postData.ticketInfo.ticketCategoryMap[i].subCategories[j]
                      .subSubCategories[k].sentiment;
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
                // }
                // else {
                //   break;
                // }
                // }
              }
            } else {
              CounterIndex = CounterIndex + 1;
              // if ((!IsTicket && CounterIndex > 2) || (IsTicket && CounterIndex > 2)) {
              //   break;
              // }
              // else {
              // if ((!IsTicket && j < 2) || (IsTicket && j < 2)) {
              const parentticketCategory =
                postData.ticketInfo.ticketCategoryMap[i].name;
              ticketCategory =
                postData.ticketInfo.ticketCategoryMap[i].subCategories[j].name;
              if (ticketCategory) {
                ticketcatcolor =
                  postData.ticketInfo.ticketCategoryMap[i].subCategories[j]
                    .sentiment;
              }

              const subcategory: TicketMentionCategory = {
                name: parentticketCategory + '/' + ticketCategory,
                sentiment: ticketcatcolor,
                show: i < 3 ? true : false,
              };
              ticketcategories.push(subcategory);
              // }
              // else {
              //   break;
              // }
              // }
            }
          }
        } else {
          CounterIndex = CounterIndex + 1;
          // if ((!IsTicket && CounterIndex > 2) || (IsTicket && CounterIndex > 2)) {
          //   break;
          // }
          // else {
          // if ((IsTicket && i < 2) || (!IsTicket && i < 2)) {
          ticketCategory = postData.ticketInfo.ticketCategoryMap[i].name;
          if (ticketCategory) {
            ticketcatcolor = postData.ticketInfo.ticketCategoryMap[i].sentiment;
          }
          const category: TicketMentionCategory = {
            name: ticketCategory,
            sentiment: ticketcatcolor,
            show: i < 3 ? true : false,
          };
          ticketcategories.push(category);
          // }
          // else if ((!IsTicket && i === 2) || (IsTicket && i === 2)) {
          //   break;
          // }
          // }
        }
      }
    }
    if (postData.categoryMap != null && postData.categoryMap.length > 0) {
      let CounterIndex = 0;
      const IsTicket = postData.categoryMap[0].isTicket;

      for (let i = 0; i < postData.categoryMap.length; i++) {
        if (postData.categoryMap[i].sentiment == null) {
          for (
            let j = 0;
            j < postData.categoryMap[i].subCategories.length;
            j++
          ) {
            if (postData.categoryMap[i].subCategories[j].sentiment == null) {
              for (
                let k = 0;
                k <
                postData.categoryMap[i].subCategories[j].subSubCategories
                  .length;
                k++
              ) {
                CounterIndex = CounterIndex + 1;
                // if ((!IsTicket && CounterIndex > 2) || (IsTicket && CounterIndex > 2)) {
                //   break;
                // }
                // else {
                //if ((!IsTicket && k < 2) || (IsTicket && k < 2)) {
                const parentmentionCategory = postData.categoryMap[i].name;
                const submentionCategory =
                  postData.categoryMap[i].subCategories[j].name;
                mentionCategory =
                  postData.categoryMap[i].subCategories[j].subSubCategories[k]
                    .name;
                if (mentionCategory) {
                  mentioncatcolor =
                    postData.categoryMap[i].subCategories[j].subSubCategories[k]
                      .sentiment;
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
                // }
                // else {
                //   break;
                // }
                //}
              }
            } else {
              CounterIndex = CounterIndex + 1;
              // if ((!IsTicket && CounterIndex > 2) || (IsTicket && CounterIndex > 2)) {
              //   break;
              // }
              // else {
              // if ((!IsTicket && j < 2) || (IsTicket && j < 2)) {
              const parentmentionCategory = postData.categoryMap[i].name;
              mentionCategory = postData.categoryMap[i].subCategories[j].name;
              if (mentionCategory) {
                mentioncatcolor =
                  postData.categoryMap[i].subCategories[j].sentiment;
              }
              const subcategory: TicketMentionCategory = {
                name: parentmentionCategory + '/' + mentionCategory,
                sentiment: mentioncatcolor,
                show: i < 3 ? true : false,
              };
              mentioncategories.push(subcategory);
              // }
              // else {
              //   break;
              // }
              // }
            }
          }
        } else {
          CounterIndex = CounterIndex + 1;
          // if ((!IsTicket && CounterIndex > 2) || (IsTicket && CounterIndex > 2)) {
          //   break;
          // }
          // else {
          // if ((IsTicket && i < 2) || (!IsTicket && i < 2)) {
          mentionCategory = postData.categoryMap[i].name;
          if (mentionCategory) {
            mentioncatcolor = postData.categoryMap[i].sentiment;
          }
          const category: TicketMentionCategory = {
            name: mentionCategory,
            sentiment: mentioncatcolor,
            show: i < 3 ? true : false,
          };
          mentioncategories.push(category);
          // }
          // else if ((!IsTicket && i === 2) || (IsTicket && i === 2)) {
          //   break;
          // }
          //}
        }
      }
    }
    const brandInfo=this._filterService.fetchedBrandData.find((obj)=>obj.brandID==postData.brandInfo.brandID);
    const engagement =
      postData.mentionMetadata.likeCount +
      postData.mentionMetadata.commentCount +
      postData.mentionMetadata.shareCount +
      postData.mentionMetadata.videoViews;
    const post = {
      brandName: brandInfo?.brandName,
      brandFriendlyName: brandInfo?.brandFriendlyName,
      brandLogo: this.getBrandLogo(brandInfo?.brandID),
      channelgroup: postData.channelGroup,
      channeltype: postData.channelType,
      channelName: this.MapChannelType(postData),
      channelNameTooltip: this.MapChannelTypeTooltip(postData),
      channelImage: this._locobuzzMentionService.getChannelIcon(postData),
      ticketId: postData.ticketID
        ? postData.ticketID
        : postData.ticketInfo.ticketID,
      mentionCount: postData.ticketInfo.numberOfMentions,
      note: this.checkLogVersionAndNote(postData.ticketInfo.lastNote)
        ? postData.ticketInfo.lastNote
        : '',
      formFilledNote: !this.checkLogVersionAndNote(
        postData.ticketInfo.lastNote, true
      ),
      ticketProcessNote: postData.ticketInfo.ticketProcessNote,
      assignTo: assignToname,
      ticketStatus: TicketStatus[postData.ticketInfo.status],
      ticketPriority: Priority[postData.ticketInfo.ticketPriority],
      ticketDescription: postData.description,
      ticketTime: this.calculateTicketTimes(postData, isModified),
      ticketCategory: {
        ticketUpperCategory: postData?.ticketInfo?.ticketUpperCategory?.name,
        mentionUpperCategory: postData?.upperCategory?.name,
      },
      Userinfo: {
        name: postData.author.name,
        image: postData.author.picUrl
          ? postData.author.picUrl
          : 'assets/images/agentimages/sample-image.svg',
        screenName: postData.author.screenname,
        bio: postData.author.bio,
        followers: postData.author.followersCount,
        following: postData.author.followingCount,
        location: postData.author.location,
        sentimentUpliftScore: postData.author.sentimentUpliftScore,
        npsScore: postData.author.nPS,
        isVerified: postData.author.isVerifed,
        socialid: postData.author.socialId,
      },
      ticketCategoryTop: ticketCategory,
      mentionCategoryTop: mentionCategory,
      ticketCatColor: ticketcatcolor,
      mentionCatColor: mentioncatcolor,
      ticketcategories,
      mentioncategories,
      srID: postData.ticketInfo.srid,
      leadID: postData.ticketInfo.leadID,
      FbPageImageUrl: sfdcTicketView ? postData.fbPageImageUrl : this.getFBPageUrl(postData),
      likecount:
        postData.mentionMetadata.likeCount != null
          ? postData.mentionMetadata.likeCount
          : 0,
      commentcount:
        postData.mentionMetadata.commentCount != null
          ? postData.mentionMetadata.commentCount
          : 0,
      retweetcount:
        postData.mentionMetadata.shareCount != null
          ? postData.mentionMetadata.shareCount
          : 0,
      videoviews:
        postData.mentionMetadata.videoViews != null
          ? postData.mentionMetadata.videoViews
          : 0,
      engagement: postData?.mentionMetadata?.engagementType != null ? this.calculateEngagementLogic(postData) 
        : ((postData?.channelType == ChannelType.InstagramPagePosts && postData?.isBrandPost) || ((postData?.channelType == ChannelType.InstagramPagePosts || postData?.channelType == ChannelType.InstagramUserPosts || postData?.channelType == ChannelType.InstagramPublicPosts ) && !postData?.isBrandPost))
        ? 0 : 'NA',
      reach:
        this.reachImpressionLogic(postData).reach == 0 || this.reachImpressionLogic(postData).reach == null
          ? ((postData?.channelType == ChannelType.InstagramPagePosts && postData?.isBrandPost) || ((postData?.channelType == ChannelType.InstagramPagePosts || postData?.channelType == ChannelType.InstagramUserPosts || postData?.channelType == ChannelType.InstagramPublicPosts) && !postData?.isBrandPost))
            ? 0 : 'NA'
            : this.reachImpressionLogic(postData).reach,
      impression:
        this.reachImpressionLogic(postData).impression == 0 || this.reachImpressionLogic(postData).impression == null
          ? ((postData?.channelType == ChannelType.InstagramPagePosts && postData?.isBrandPost) || ((postData?.channelType == ChannelType.InstagramPagePosts || postData?.channelType == ChannelType.InstagramUserPosts || postData?.channelType == ChannelType.InstagramPublicPosts) && !postData?.isBrandPost))
          ? 0 : 'NA'
          : this.reachImpressionLogic(postData).impression,
      isbrandpost: postData.isBrandPost,
      showReachFxFlag: this.showReachFxOnFrontend(postData),
      showImpressionFxFlag: this.showImpressionFxOnFrontend(postData),
      showEngagementFxFlag: this.showEngagementFxOnFrontend(postData),
      LinkedInPageImageUrl: sfdcTicketView ? postData?.LinkedInPageImageUrl : this.getLinkedInPageUrl(postData),
    };

    let temp_obj; 
    post['isLastNoteShow'] = true; 
    try { 
      temp_obj = JSON.parse(postData?.ticketInfo.lastNote) 
    } catch (error) {} 
    if (temp_obj && Object.values(temp_obj).length > 1 && (temp_obj.hasOwnProperty("from") && temp_obj.hasOwnProperty("to"))) { 
      post['isLastNoteShow'] = false; 
    } 

    if (postData.channelGroup === ChannelGroup.Reddit) {
      if (postData?.subRedditName?.trim()?.length)
        post['subRedditName'] = `r/${postData?.subRedditName}`;

      console.log('postData?.flair', postData?.flair, postData?.ticketInfo?.ticketID);
      if (postData?.flair?.trim()?.length)
        post['flair'] = postData?.flair;
    }
    return post;
  }

  checkLogVersionAndNote(note: string, isForFormFiledNote:boolean = false): boolean {
    let noteFlag = true;
    let obj;
    try {
      note ? (obj = JSON.parse(note)) : '';
    } catch (err) {}
    if (obj && Object.values(obj).length > 1 && (obj.hasOwnProperty("from") && obj.hasOwnProperty("to"))) {
      noteFlag = isForFormFiledNote ? true : false;
    }
    return noteFlag;
  }

  getBrandLogo(brandID): string {
    const brandimage = this._filterService.fetchedBrandData.filter(
      (obj) => +obj.brandID === +brandID
    )[0];
    if (brandimage.rImageURL) {
      return brandimage.rImageURL;
    } else {
      return 'assets/social-mention/post/default_brand.svg';
    }
  }

  public MapChannelTypeTooltip(obj: BaseMention): string {
    switch (obj.channelType) {
      case ChannelType.PublicTweets:
        return 'Public Tweets';
      case ChannelType.FBPageUser:
        return obj.isBrandPost?'Facebook Post':'User Post';
      case ChannelType.FBPublic:
        return 'Public Post';
      case ChannelType.Twitterbrandmention:
        return 'Twitter Brand Mention';
      case ChannelType.FBComments:
        return 'Facebook Comments';
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
        return 'Facebook Media Posts';
      case ChannelType.FBMediaComments:
        return 'Facebook Media Comments';
      case ChannelType.TeamBHPPosts:
        return 'Team BHP Posts';
      case ChannelType.TeamBHPComments:
        return 'Team BHP Comments';
      case ChannelType.TeamBHPOtherPostsComments:
        return 'Other Posts Comments';
      case ChannelType.ComplaintWebsites:
        return 'Complaint Websites';
      case ChannelType.YouTubePosts:
        return 'Youtube Posts';
      case ChannelType.YouTubeComments:
        return 'YouTube Comments';
      case ChannelType.TelegramMessages:
        return 'Telegram Direct Messages';
      case ChannelType.TelegramGroupMessages:
        return 'Telegram Group Messages';
      case ChannelType.InstagramComments:
        let channeltype = '';
        if (obj.instagramPostType !== 7) {
          channeltype = 'Comments';
        } else if (obj.instagramPostType === 7) {
          channeltype = 'IGTV Comments';
        }
        // else if (obj.instagramPostType === 5) {
        //   channeltype = 'IGTV HashTag';
        // } else if (obj.instagramPostType === 5) {
        //   channeltype = 'IGTV Story';
        // }
        return channeltype;
      case ChannelType.InstagramPagePosts:
        let instapagepost = '';
        if (obj.instagramPostType === 7) {
          instapagepost = 'IGTV Page Post';
        } 
        // else if (obj.instagramPostType === 5) {
        //   instapagepost = 'IGTV HashTag';
        // } else if (obj.instagramPostType === 5) {
        //   instapagepost = 'IGTV Story';
        // } 
        else {
          instapagepost = 'Page Posts';
        }
        return instapagepost;
      case ChannelType.InstagramUserPosts:
        let instauserpost = '';
        if (obj.instagramPostType === 7) {
          instauserpost = 'IGTV User Post';
        } 
        // else if (obj.instagramPostType === 5) {
        //   instauserpost = 'IGTV HashTag';
        // } else if (obj.instagramPostType === 5) {
        //   instauserpost = 'IGTV Story';
        // } 
        else {
          instauserpost = 'User Post';
        }
        return instauserpost;
      case ChannelType.InstagramMessages:
        return 'Instagram Messages';
      case ChannelType.InstagramPublicPosts:
        // if (obj.instagramPostType === 5) {
        //   return 'IGTV HashTag';
        // } else if (obj.instagramPostType === 5) {
        //   return 'IGTV Story';
        // } else {
          return 'Instagram Public Posts';
        // }
      case ChannelType.GooglePagePosts:
        return 'Google Page Posts';
      case ChannelType.GoogleUserPosts:
        return 'Google User Posts';
      case ChannelType.GooglePublicPosts:
        return 'Google Public Posts';
      case ChannelType.GoogleComments:
        return 'Google Comments';
      case ChannelType.CustomerCare:
        return 'CustomerCare';
      case ChannelType.Expedia:
        return 'Expedia';
      case ChannelType.Booking:
        return 'Booking.com';
      case ChannelType.ReviewWebsiteComments:
        return 'Review Website Comments';
      case ChannelType.ReviewWebsitePosts:
        return 'Review Website Posts';
      case ChannelType.ECommercePosts:
        return 'ECommerce Posts';
      case ChannelType.ECommerceComments:
        return 'Ecommmerce Comments';
      case ChannelType.HolidayIQReview:
        return 'HolidayIQ Review';
      case ChannelType.HolidayIQReview:
        return 'HolidayIQ Review';
      case ChannelType.ZomatoComment:
        return 'Zomato Comments';
      case ChannelType.ZomatoPost:
        return 'Zomato Posts';
      case ChannelType.FBMessages:
        return 'Facebook Messages';
      case ChannelType.Videos:
        return 'Videos';
      case ChannelType.GooglePlayStore:
        return 'Google PlayStore';
      case ChannelType.LinkedInPageUser:
        return obj.isBrandPost ? 'LinkedIn' : 'LinkedIn Page User';
      case ChannelType.LinkedInPublic:
        return 'LinkedIn Public';
      case ChannelType.LinkedInComments:
        return 'LinkedIn Comments';
      case ChannelType.LinkedInMediaPosts:
        return 'LinkedIn Media Posts';
      case ChannelType.LinkedInMediaComments:
        return 'LinkedIn Media Comments';
      case ChannelType.LinkedinMessage:
        return 'Linkedin Message';
      case ChannelType.FBReviews:
        return 'Facebook Reviews';
      case ChannelType.AutomotiveIndiaPost:
        return 'Automotive India Post';
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
      case ChannelType.GMBpost:
        return 'GMB Post';  
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
      case ChannelType.QuoraQuestion:
        return 'Quora Question';
      case ChannelType.QuoraAnswer:
        return 'Quora Answer';
      case ChannelType.QuoraComment:
        return 'Quora Comment';
      case ChannelType.GlassdoorReviews:
        return 'Glassdoor Reviews';
      case ChannelType.GMBChat:
        return 'GBM';
      case ChannelType.SitejabberReviews:
        return 'Sitejabber Reviews';
      case ChannelType.SitejabberComments:
        return 'Sitejabber Comments';
      case ChannelType.FbGroupComments:
        return 'FB Group Comments';
      case ChannelType.FbGroupPost:
        return 'FB Group Post';
      case ChannelType.PantipTopics:
        return 'Pantip Topics';
      case ChannelType.PantipComments:
        return 'Pantip Comments';
      case ChannelType.RedditPost:
        return 'Reddit Post';
      case ChannelType.RedditComment:
        return 'Reddit Comments';
      default:
        return ChannelType[obj.channelType];
    }

    let instchanneltype = '';
    if (obj.channelGroup === ChannelGroup.Instagram) {
      if (
        obj.instagramPostType === 7 &&
        (obj.channelType === ChannelType.InstagramPagePosts ||
          obj.channelType === ChannelType.InstagramUserPosts)
      ) {
        instchanneltype = 'Instagram IGTV';
      } else if (obj.instagramPostType === 5) {
        instchanneltype = 'Instagram IGTV HashTag';
      } else if (obj.instagramPostType === 4) {
        instchanneltype = 'Instagram IGTV Story';
      } else {
        instchanneltype = 'Instagram';
      }
      return instchanneltype;
    }
  }
  public MapChannelType(obj: BaseMention): string {
    switch (obj.channelType) {
      case ChannelType.PublicTweets:
        return 'Public Tweets';
      case ChannelType.FBPageUser:
        return obj.isBrandPost ? 'Facebook Post' : 'User Post';
      case ChannelType.FBPublic:
        return 'Public Post';
      case ChannelType.Twitterbrandmention:
        return 'Mention';
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
      case ChannelType.TelegramMessages:
        return 'Direct Messages';
      case ChannelType.TelegramGroupMessages:
        return 'Group Messages';
      case ChannelType.InstagramComments:
        let channeltype = '';
        if (obj.instagramPostType !== 7) {
          channeltype = 'Comments';
        } else if (obj.instagramPostType === 7) {
          channeltype = 'IGTV Comments';
        } 
        // else if (obj.instagramPostType === 5) {
        //   channeltype = 'IGTV HashTag';
        // } else if (obj.instagramPostType === 5) {
        //   channeltype = 'IGTV Story';
        // }
        return channeltype;
      case ChannelType.InstagramPagePosts:
        let instapagepost = '';
        if (obj.instagramPostType === 7) {
          instapagepost = 'IGTV Page Post';
        } 
        // else if (obj.instagramPostType === 5) {
        //   instapagepost = 'IGTV HashTag';
        // } else if (obj.instagramPostType === 5) {
        //   instapagepost = 'IGTV Story';
        // } 
        else {
          instapagepost = 'Page Posts';
        }
        return instapagepost;
      case ChannelType.InstagramUserPosts:
        let instauserpost = '';
        if (obj.instagramPostType === 7) {
          instauserpost = 'IGTV User Post';
        } 
        // else if (obj.instagramPostType === 5) {
        //   instauserpost = 'IGTV HashTag';
        // } else if (obj.instagramPostType === 5) {
        //   instauserpost = 'IGTV Story';
        // } 
        else {
          instauserpost = 'User Post';
        }
        return instauserpost;
      case ChannelType.InstagramMessages:
        return 'Instagram Messages';
      case ChannelType.InstagramPublicPosts:
        // if (obj.instagramPostType === 5) {
        //   return 'IGTV HashTag';
        // } else if (obj.instagramPostType === 5) {
        //   return 'IGTV Story';
        // } else {
          return 'Public Posts';
        // }
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
        return 'Booking.com';
      case ChannelType.ReviewWebsiteComments:
        return 'Comments';
      case ChannelType.ReviewWebsitePosts:
        return 'Posts';
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
        return obj.isBrandPost ? 'Linkedin' : 'User Post';
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
      case ChannelType.GMBpost:
        return 'GMB Post'
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
      case ChannelType.QuoraQuestion:
        return 'Quora Question';
      case ChannelType.QuoraAnswer:
        return 'Quora Answer';
      case ChannelType.QuoraComment:
        return 'Quora Comment';
      case ChannelType.GlassdoorReviews:
        return 'Glassdoor Reviews';
      case ChannelType.GMBChat:
        return 'GBM';
      case ChannelType.SitejabberReviews:
        return 'Reviews';
      case ChannelType.SitejabberComments:
        return 'Comments';
      case ChannelType.TikTokBrandPost:
        return 'TikTok Post';
      case ChannelType.TikTokComments:
        return 'TikTok Comments';
      case ChannelType.FbGroupComments:
        return 'Comments';
      case ChannelType.FbGroupPost:
        return 'FB Group Post';
      // case ChannelType.TikTokReply:
      //   return 'TikTok Replies';
      case ChannelType.PantipTopics:
        return 'Topics';
      case ChannelType.PantipComments:
        return 'Comments';
      case ChannelType.RedditPost:
        return 'Reddit Post';
      case ChannelType.RedditComment:
        return 'Reddit Comments';
      default:
        return ChannelType[obj.channelType];
    }

    let instchanneltype = '';
    if (obj.channelGroup === ChannelGroup.Instagram) {
      if (
        obj.instagramPostType === 7 &&
        (obj.channelType === ChannelType.InstagramPagePosts ||
          obj.channelType === ChannelType.InstagramUserPosts)
      ) {
        instchanneltype = 'Instagram IGTV';
      } else if (obj.instagramPostType === 5) {
        instchanneltype = 'Instagram IGTV HashTag';
      } else if (obj.instagramPostType === 4) {
        instchanneltype = 'Instagram IGTV Story';
      } else {
        instchanneltype = 'Instagram';
      }
      return instchanneltype;
    }
  }

  getFBPageUrl(postData: BaseMention): any {
    const ProfileList = this._filterService.fetchedSocialProfile;
    const profile = ProfileList.find(
      (x) =>
        x.btaid === Number(postData.settingID) &&
        x.brandID === postData.brandInfo.brandID
    );
    if (profile) {
      return profile.profileImageUrl;
    } else {
      return '';
    }
  }

  constructMentionObj(postData: BaseMention): any {
    postData = this.MapLocobuzz.mapMention(postData);
    const { $type, socialID, parentSocialID, brandInfo, channelGroup } =
      postData;
    const BrandInfoObj = {
      BrandID: postData.brandInfo.brandID,
      BrandName: postData.brandInfo.brandName,
    };
    const source = {
      $type,
      SocialID: socialID,
      ParentSocialID: parentSocialID,
      BrandInfo: BrandInfoObj,
      ChannelGroup: channelGroup,
    };

    const accountObj = this.MapLocobuzz.mapAccountConfiguration(postData);

    const account = {
      $type: accountObj.$type,
      BrandInformation: BrandInfoObj,
      AccountID: '',
      SocialID: '',
    };

    const mentionObj = {
      Source: source,
      Account: account,
    };

    return mentionObj;
  }

  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  GetParentPostAndComments(keyObj): any {
    return this._http
      .post<any>(
        environment.baseUrl + '/Tickets/GetParentPostAndComments',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  GetAuthorBasedPendingSuccessFailedCount(keyObj): any {
    return this._http
      .post<any>(
        environment.baseUrl +
          '/Tickets/GetAuthorBasedPendingSuccessFailedCount',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  GetNPSAutomationSetting(keyObj): any {
    return this._http
      .post<any>(
        environment.baseUrl + '/Tickets/GetNPSAutomationSetting',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  IsPremiumTwitterAccount(data): any {
    return this._http
      .post<any>(
        environment.baseUrl + '/Tickets/IsPremiumTwitterAccount',
        data
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  GetAvailableMediaTags(): any {
    return this._http
      .get<any>(environment.baseUrl + '/Tickets/GetAvailableMediaTags')
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  updateReachAndImpressionById(obj): any {
    return this._http
      .post<any>(
        environment.baseUrl + '/Tickets/GetUpdateTagsReachAndImpression',
        obj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            return response;
          }
        })
      );
  }

  GetToastMessageonPerformAction(
    actiontype,
    mention: BaseMention,
    currentUser: AuthUser,
    IsAttachingCloseTicket: boolean = false
  ): any {
    let message = '';
    let isticketagentworkflowenabled = false;
    const currentteamid = +currentUser.data.user.teamID;
    let isAgentHasTeam = false;
    if (currentteamid !== 0) {
      isAgentHasTeam = true;
    }

    isticketagentworkflowenabled =
      mention.ticketInfo.ticketAgentWorkFlowEnabled;
    const isworkflowenabled = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === mention.brandInfo.brandID
    );

    const actionEnum = this.GetActionEnum();
    if (actiontype === actionEnum.AttachTicket) {
      if (
        IsAttachingCloseTicket &&
        currentUser.data.user.role === UserRoleEnum.Agent &&
        isworkflowenabled.isEnableReplyApprovalWorkFlow &&
        (currentUser.data.user.agentWorkFlowEnabled ||
          isticketagentworkflowenabled)
      ) {
        message =
          this.translate.instant('As-per-your-ORM-workflow-settings-this-response-will-be-sent-to-the-Team-Lead-for-approval');
      } else {
        message = this.translate.instant('The-operation-Attach-Ticket-was-completed-successfully');
      }
    } else {
      if (
        actiontype !== actionEnum.Acknowledge &&
        actiontype !== actionEnum.CreateTicket &&
        currentUser.data.user.role === UserRoleEnum.Agent &&
        isworkflowenabled.isEnableReplyApprovalWorkFlow &&
        (currentUser.data.user.agentWorkFlowEnabled ||
          isticketagentworkflowenabled)
      ) {
        
        if ((actiontype == actionEnum.EscalateToBrand || actiontype == actionEnum.Escalate) && mention?.brandInfo?.isEscalatePermissionWorkFlowEnabled) {
          message = this.translate.instant('The-operation-escalate-was-completed-successfully');
        }
        else message = this.translate.instant('As-per-your-ORM-workflow-settings-this-response-will-be-sent-to-the-Team-Lead-for-approval');
      } else {
        switch (actiontype) {
          case actionEnum.DirectClose: {
            message = this.translate.instant('The-operation-Direct-close-was-completed-successfully');
            break;
          }
          case actionEnum.Reply: {
            message = this.translate.instant('The-operation-Reply-was-completed-successfully');
            break;
          }
          case actionEnum.ReplyAndClose: {
            message = this.translate.instant('The-operation-Reply-and-Close-was-completed-successfully');
            break;
          }
          case actionEnum.Escalate: {
            message = this.translate.instant('The-operation-Escalate-was-completed-successfully');
            break;
          }
          case actionEnum.ReplyAndEscalate: {
            message = this.translate.instant('The-operation-Reply-and-Escalate-was-completed-successfully');
            break;
          }
          case actionEnum.CreateTicket: {
            message = this.translate.instant('The-operation-Create-Ticket-was-completed-successfully');
            break;
          }
          case actionEnum.AttachTicket: {
            message = this.translate.instant('The-operation-Attach-Ticket-was-completed-successfully');
            break;
          }
          case actionEnum.Approve: {
            message = this.translate.instant('The-operation-Approve-was-completed-successfully');
            break;
          }
          case actionEnum.Reject: {
            message = this.translate.instant('The-operation-Reject-was-completed-successfully');
            break;
          }
          case actionEnum.EscalateToBrand: {
            message = this.translate.instant('The-operation-Escalate-to-brand-was-completed-successfully');
            break;
          }
          case actionEnum.BrandApproved: {
            message = this.translate.instant('The-operation-Brand-Approved-was-completed-successfully');
            break;
          }
          case actionEnum.BrandReject: {
            message = this.translate.instant('The-operation-Brand-Reject-was-completed-successfully');
            break;
          }
          case actionEnum.ReplyAndAwaitingCustomerResponse: {
            message = this.translate.instant('The-operation-Reply-and-Awaiting-Customer-Response-was-completed-successfully');
            break;
          }
          case actionEnum.ReplyAndOnHold: {
            message = this.translate.instant('The-operation-Reply-and-On-hold-was-completed-successfully');
            break;
          }
          case actionEnum.ReplyNewMentionCameAfterEsalatedorOnHold: {
            message = this.translate.instant('The-operation-Reply-was-completed-successfully');
            break;
          }
          case actionEnum.Acknowledge: {
            message = this.translate.instant('The-operation-Acknowledge-was-completed-successfully');
            break;
          }
          default:
            message = this.translate.instant('Operation-completed-successfully');
            break;
        }
      }
    }
    return message;
  }

  GetActionEnum(): any {
    return {
      DirectClose: 1,
      Reply: 2,
      ReplyAndClose: 3,
      Escalate: 4,
      ReplyAndEscalate: 5,
      CreateTicket: 6,
      Approve: 7,
      Reject: 8,
      AttachTicket: 9,
      EscalateToBrand: 10,
      BrandApproved: 11,
      BrandReject: 12,
      ReplyAndOnHold: 13,
      ReplyAndAwaitingCustomerResponse: 14,
      ReplyNewMentionCameAfterEsalatedorOnHold: 15,
      Acknowledge: 16,
    };
  }

  SetWebsiteChatbotDescription(
    mention: BaseMention,
    ticketHistoryData: AllBrandsTicketsDTO
  ): any {
    if (mention.title != null) {
      const MessageType =
        mention.messageType == undefined
          ? 'NOTE'
          : mention.messageType.toLowerCase();
      let messagetext = '';
      let Message = '';
      let mediaObj;
      if (mention.title.length > 0 && mention.mediaType === MediaEnum.TEXT) {
        if (mention.isBrandPost) {
          messagetext = mention.title;
          if (
            messagetext != null &&
            this.isJSON(messagetext) &&
            messagetext.includes('{')
          ) {
            const data = JSON.parse(messagetext);
            if (data) {
              messagetext = this.MessageLoader(data);
            }
            ticketHistoryData.description = messagetext;
          } else {
            ticketHistoryData.description = messagetext;
          }
        } else {
          messagetext = mention.title;
          ticketHistoryData.description = mention.title;
        }
      } else if (
        mention.description.length > 0 &&
        mention.mediaType === MediaEnum.TEXT
      ) {
        if (mention.isBrandPost) {
          messagetext = mention.description;
          if (
            messagetext != null &&
            this.isJSON(messagetext) &&
            messagetext.includes('{')
          ) {
            const data = JSON.parse(messagetext);
            if (data) {
              messagetext = this.MessageLoader(data);
            }
            ticketHistoryData.description = messagetext;
          } else {
            ticketHistoryData.description = messagetext;
          }
        } else {
          messagetext = mention.description;
          ticketHistoryData.description = mention.description;
        }
      } else if (mention.mediaType !== MediaEnum.TEXT) {
        if (
          MessageType !== 'text' &&
          mention.attachmentMetadata.mediaContents.length > 0
        ) {
          for (
            let j = 0;
            j < mention.attachmentMetadata.mediaContents.length;
            j++
          ) {
            messagetext = mention.attachmentMetadata.mediaContents[j].name;
            if (mention.isBrandPost) {
              if (
                messagetext !== null &&
                this.isJSON(messagetext) &&
                messagetext.includes('{')
              ) {
                const data = JSON.parse(messagetext);
                if (data) {
                  const ObjectOrNot = this.MessageLoader(data);
                  if (typeof ObjectOrNot === 'object') {
                    mediaObj = ObjectOrNot;
                  } else {
                    Message += ObjectOrNot;
                  }
                }
              } else {
                if (
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                  MediaEnum.IMAGE
                ) {
                  // Message += this.SingleImage(messagetext);
                } else if (
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                  MediaEnum.LOCATIONS
                ) {
                  messagetext = `<a href="${mention.attachmentMetadata.mediaContents[0].mediaUrl}" target="_blank">
                  ${mention.attachmentMetadata.mediaContents[0].mediaUrl}</a >`;
                  Message += messagetext;
                } else if (
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                  MediaEnum.VIDEO
                ) {
                  let jsonObject = {
                    message: {
                      attachment: {
                        payload: {
                          url: '',
                        },
                      },
                    },
                  };
                  // jsonObject.message = {};
                  // jsonObject.message.attachment = {};
                  // jsonObject.message.attachment.payload = {};
                  jsonObject.message.attachment.payload.url = messagetext;
                  Message += this.Video(jsonObject);
                } else if (
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.EXCEL ||
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.DOC ||
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.PDF ||
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.FILE ||
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.OTHER
                ) {
                  let name = this.GetFilename(messagetext);
                  Message += `
                                                       <a href="${messagetext}" download title="${name}" target="_blank" class="file-attachement">
                                                                    <img src="/images/tickets/attachement-blured.png"/>
                                                                    <span class="Files">
                                                                       ${name}
                                                                    </span>
                                                                </a>
                                            `;
                } else if (messagetext === 'get_started_ping') {
                  Message += `<p>Get Started</p>`;
                } else {
                  Message +=
                    `<p style="word-break:break-word">` + messagetext + `</p>`;
                }
              }
            } else {
              if (
                messagetext !== null &&
                this.isJSON(messagetext) &&
                messagetext.includes('{')
              ) {
                const data = JSON.parse(messagetext);
                if (data) {
                  Message += this.MessageLoader(data);
                }
              } else if (
                messagetext !== null &&
                messagetext.includes('STICKER|')
              ) {
                const msgtext = messagetext;
                const imgID =
                  'divSticker' + Math.floor(Math.random() * Math.floor(1000));
                const arry = msgtext.replace(/\_/g, ' ').split('|');
                const imgurl =
                  'https://app.cxmonk.com/images/linestickers/' +
                  arry[2] +
                  '.jpg';
                Message += `<p><img id="${imgID}" src="${imgurl}" style="width:70px; border-redius:0px" /></p>`;
              } else {
                if (
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                  MediaEnum.IMAGE
                ) {
                  // Message += this.SingleImage(messagetext);
                } else if (
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                  MediaEnum.LOCATIONS
                ) {
                  messagetext = `<a href="${mention.attachmentMetadata.mediaContents[0].mediaUrl}" target="_blank">
                  ${mention.attachmentMetadata.mediaContents[0].mediaUrl}</a >`;
                  Message += messagetext;
                } else if (
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                  MediaEnum.VIDEO
                ) {
                  let jsonObject = {
                    message: {
                      attachment: {
                        payload: {
                          url: '',
                        },
                      },
                    },
                  };
                  // let jsonObject;
                  // jsonObject.message = {};
                  // jsonObject.message.attachment = {};
                  // jsonObject.message.attachment.payload = {};
                  // jsonObject.message.attachment.payload.url = messagetext;
                  // Message += this.Video(jsonObject);
                } else if (
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.EXCEL ||
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.DOC ||
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.PDF ||
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.FILE ||
                  mention.attachmentMetadata.mediaContents[j].mediaType ===
                    MediaEnum.OTHER
                ) {
                  let name = this.GetFilename(messagetext);
                  Message += `
                                                        <a href="${messagetext}" download title="${name}" target="_blank" class="file-attachement">
                                                                    <img src="/images/tickets/attachement-blured.png"/>
                                                                    <span class="Files">
                                                                       ${name}
                                                                    </span>
                                                                </a>
                                            `;
                } else if (messagetext === 'get_started_ping') {
                  Message += `<p>Get Started</p>`;
                } else {
                  Message += `<p>` + messagetext + `</p>`;
                }
              }
            }
          }
          Message
            ? (ticketHistoryData.htmlData = Message)
            : (ticketHistoryData.carouselMediaObj = mediaObj);
        }
      }
    }
    return ticketHistoryData;
  }

  // check media in chat and profile relevant flag
  MessageLoader(media): any {
    if (media.message !== undefined) {
      if (media.message.hasOwnProperty('quick_replies')) {
        if (
          media.message.quick_replies.length === 1 &&
          media.message.quick_replies[0].content_type == 'location'
        ) {
          // location
          return this.Location(media);
        } else if (
          media.message.quick_replies.length > 0 &&
          media.message.quick_replies[0].hasOwnProperty('image_url')
        ) {
          // payload with icon
          return this.PayloadButtonWithIcon(media);
        } else if (
          media.message.quick_replies.length > 0 &&
          !media.message.quick_replies[0].hasOwnProperty('image_url')
        ) {
          // Quick Replies(buttons)
          return this.QuickReplies(media);
        }
      }

      if (
        media.message.hasOwnProperty('text') &&
        !media.message.hasOwnProperty('quick_replies')
      ) {
        // simple text
        return this.SimpleTextMsgSend(media.message.text);
      }

      if (media.message.hasOwnProperty('attachment')) {
        if (media.message.attachment.hasOwnProperty('type')) {
          if (media.message.attachment.type === 'image') {
            // single image
            return this.SingleImage(media.message.attachment.payload.url);
          } else if (media.message.attachment.type === 'video') {
            // video
            return this.Video(media);
          } else if (media.message.attachment.type === 'file') {
            // file
            return this.File(media);
          } else if (
            media.message.attachment.type === 'template' &&
            !media.message.attachment.payload.hasOwnProperty('buttons') &&
            !media.message.attachment.payload.elements[0].hasOwnProperty(
              'subtitle'
            ) &&
            media.message.attachment.payload.elements.length > 0
          ) {
            // Image with title
            return this.ImagewithTitle(
              media.message.attachment.payload.elements[0].image_url,
              media.message.attachment.payload.elements[0].title
            );
          } else if (
            media.message.attachment.type === 'template' &&
            !media.message.attachment.payload.hasOwnProperty('buttons') &&
            media.message.attachment.payload.elements.length > 0
          ) {
            // Image with title
            return this.ImagewithCarousel(media);
          }
        }
      }

      if (media.message.hasOwnProperty('attachment')) {
        if (media.message.attachment.hasOwnProperty('payload')) {
          if (media.message.attachment.payload.template_type === 'button') {
            if (
              media.message.attachment.payload.buttons[0].type === 'postback'
            ) {
              // Payload Button
              return this.PayLoadButtons(media);
            } else if (
              media.message.attachment.payload.buttons[0].type === 'web_url'
            ) {
              // Payload Button with web_url
              return this.PayloadButtonwithWebUrl(media);
            } else {
              // Payload Button with Phone number
              return this.PayLoadButtons(media);
            }
          }
        }
      }

      if (media.message.hasOwnProperty('attachment')) {
        if (media.message.attachment.hasOwnProperty('payload')) {
          if (media.message.attachment.payload.hasOwnProperty('elements')) {
            if (
              media.message.attachment.payload.elements[0].hasOwnProperty(
                'buttons'
              )
            ) {
              if (
                media.message.attachment.payload.elements[0].buttons[0].type ===
                'postback'
              ) {
                // slider with button
                return this.SliderWithButton(media);
              } else if (
                media.message.attachment.payload.elements[0].buttons[0].type ===
                  'web_url' ||
                media.message.attachment.payload.elements[0].buttons[0].type ===
                  'element_share'
              ) {
                // Slider with button url
                return this.SliderWithButtonUrl(media);
              }
            } else {
              if (
                media.message.attachment.payload.elements[0].hasOwnProperty(
                  'subtitle'
                )
              ) {
                // Slider without button
                return this.SliderWithoutButton(media);
              }
            }
          }
        }
      }
    }
  }

  Location(jsonData): any {
    const location = `
        <p id="Locobuzz_Bot_Location_info">Click the button to get your location.</p>
        <button class ="btnBot option-btn btn-qr locobuzz-quick-reply"  href="#Locobuzz_Bot_Location" data-toggle="modal">Send Location</button>

    `;
    return location;
  }

  PayloadButtonWithIcon(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));

    const params = `
    ${jsonObject.message.text}<br/>
    ${this.GeneratePayLoadButtonsWithIcon(jsonObject.message.quick_replies)}
  `;
    return params;
    /// $('#Locobuzz_chatMessageBox').append(HtmlDesignDivBotSendingMessagemodified(params));
  }

  GeneratePayLoadButtonsWithIcon(jsondata): any {
    let data = '';
    for (const item of jsondata) {
      data += ` <button type="button" class ="btnBot option-btn btn-qr" data-payload="${item.payload}" >${item.title}</button>`;
    }
    return data;
  }

  QuickReplies(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));
    const params = `
    <p class="chatpara" style="margin-bottom:5px">${
      jsonObject.message.text
    }</p><br/>
    ${this.GenerateQRButtons(jsonObject)}
  `;
    return params;
  }

  GenerateQRButtons(jsonObject): any {
    let data = '';
    // let bgcolor = getRGBColor(pageConfigurationModel.EditBotColor);
    for (const item of jsonObject.message.quick_replies) {
      data += ` <button type="button" class ="btnBot option-btn btn-qr" data-payload="${item.payload}" >${item.title}</button>`;
    }
    return data;
  }

  SimpleTextMsgSend(txt): any {
    if (txt) {
      txt = txt.replace(/\n/g, '<br />');
    }
    return txt;
  }

  SimpleTextMsgRecieve(txt): any {
    return `<p>` + txt + `</p>`;
  }

  // simple text Bot send

  // single image
  SingleImage(src): any {
    if (src === 'https://social.locobuzz.com') {
      src = '/images/tickets/attachement-blured.png';
    }
    const imageData = `<img src="${src}" class =" img-responsive chat-attachment" style="border-radius:8px;height:auto;display:inline-block;margin:auto;max-width:100%;max-height:200px;">`;

    return imageData;
  }

  // Image with title
  ImagewithTitle(src, title): any {
    let imgwithTitleData = '';
    if (src !== 'null') {
      imgwithTitleData = `<img src="${src}" class =" img-responsive chat-attachment" style="border-radius:8px;height:auto;display:inline-block;margin:auto;max-width:100%;max-height:200px;">
                                    <span>${title}</span>`;
    } else {
      imgwithTitleData = `<span>${title}</span>`;
    }

    return imgwithTitleData;
  }

  ImagewithCarousel(media) {
    const mediaObj: mediaObj = {
      attachmentType: null,
      mediaContent: null,
      attachmentIcon: null,
    };
    let attachmentObj: { [key: string]: any };

    if (media?.message.hasOwnProperty('attachment')) {
      if (media.message?.attachment.hasOwnProperty('payload')) {
        if (media.message.attachment?.payload.hasOwnProperty('elements')) {
          // slider with buttons
          const mediaCopy = JSON.parse(JSON.stringify(media));
          mediaObj.attachmentType = MediaEnum.SLIDERBUTTONS;
          mediaObj.mediaContent = [
            {
              text: null,
              buttons: mediaCopy.message.attachment.payload.elements,
            },
          ];
          attachmentObj = {
            attachmentHeight: null,
          };
          let size = 0;
          let maxSize = 0;
          let minSize = 0;
          if (
            mediaObj?.mediaContent?.length > 0 &&
            mediaObj.mediaContent[0]?.buttons?.length > 0
          ) {
            mediaObj.mediaContent[0].buttons.forEach((item) => {
              if (item?.buttons?.length > 0) {
                size = 46 * item.buttons.length;
              }

              if (item?.image_url !== 'null') {
                size = size + 150;
              }

              if (item?.title?.includes('null')) {
                size = size - 20;
              }

              if (item?.subtitle?.includes('null')) {
                size = size - 20;
              }

              if (size >= maxSize) {
                maxSize = size;
              }
            });
            if (
              media.message.attachment.payload?.elements[0].hasOwnProperty(
                'buttons'
              )
            ) {
              attachmentObj.attachmentHeight = `${minSize + 200}px`;
            } else {
              attachmentObj.attachmentHeight = '300px';
            }
          }
          mediaObj.mediaContent[0].attachmentObj = attachmentObj;
          return mediaObj;
          // } else {
          //   if (
          //     media.message.attachment.payload?.elements[0].hasOwnProperty(
          //       'subtitle'
          //     )
          //   ) {
          //     // Slider without button
          //     const mediaCopy = JSON.parse(JSON.stringify(media));
          //     mediaObj.attachmentType = MediaEnum.SLIDERNOBUTTONS;
          //     mediaObj.mediaContent = [
          //       {
          //         text: null,
          //         buttons: mediaCopy.message.attachment.payload.elements,
          //       },
          //     ];
          //     attachmentObj = {
          //       attachmentHeight: null,
          //     };
          //     let size = 0;
          //     let maxSize = 0;
          //     if (
          //       media?.mediaContent?.length > 0 &&
          //       media.mediaContent[0]?.buttons?.length > 0
          //     ) {
          //       media.mediaContent[0].buttons.forEach((item) => {
          //         if (item?.buttons?.length > 0) {
          //           size = 46 * item.buttons.length;
          //         }

          //         if (item?.image_url !== 'null') {
          //           size = size + 150;
          //         }

          //         if (item?.title?.includes('null')) {
          //           size = size - 20;
          //         }

          //         if (item?.subtitle?.includes('null')) {
          //           size = size - 20;
          //         }

          //         if (size >= maxSize) {
          //           maxSize = size;
          //         }
          //       });

          //       attachmentObj.attachmentHeight = `${maxSize + 145}px`;
          //     }
          //     mediaObj.mediaContent[0].attachmentObj = attachmentObj;
          //     return mediaObj;
          //   }
          // }
        }
      }
    }
  }

  // Slider without button
  SliderWithoutButton(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));

    const slider = `
    <ul class ="bxslider">
             ${this.GenerateImageForSliderWithoutButton(jsonObject)}
     </ul>
    `;

    // $('.bxslider').bxSlider({
    // 	mode: 'horizontal',
    // 	infiniteLoop: false,
    // 	hideControlOnEnd: true,
    // 	startSlide: 0,
    // 	moveslide: 1,
    // 	pager: false
    // });
    return slider;
  }

  GenerateImageForSliderWithoutButton(jsonData): any {
    let data = '';

    for (
      let i = 0;
      i < jsonData.message.attachment.payload.elements.length;
      i++
    ) {
      data += `<li style="text-align:center;"><img src="${jsonData.message.attachment.payload.elements[i].image_url}" class =" img-responsive " style="width:200px;height:100px;display:initial;" /> <div class ="titletextdetail"><b>${jsonData.message.attachment.payload.elements[i].title}</b></div><div class ="subtitletextDetail">${jsonData.message.attachment.payload.elements[i].subtitle}</div></li>`;
    }
    return data;
  }

  // slider with Button

  SliderWithButton(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));

    const slider = `
    <ul class ="bxslider bxSliderOne">
             ${this.GenerateImageForSliderWithButtonUrl(
               jsonObject.message.attachment.payload.elements
             )}
     </ul>
    `;

    return slider;
  }

  // Slider with button url
  SliderWithButtonUrl(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));

    const slider = `
    <ul class ="bxslider">
             ${this.GenerateImageForSliderWithButtonUrl(
               jsonObject.message.attachment.payload.elements
             )}
     </ul>
    `;

    return slider;
  }

  GenerateImageForSliderWithButtonUrl(jsonData): any {
    // let bgcolor = getRGBColor(pageConfigurationModel.EditBotColor);
    let data = '';
    for (let i = 0; i < jsonData.length; i++) {
      data += `<li style="text-align:center;">
            <img src="${
              jsonData[i].image_url
            }" class ="img-responsive" style="height:141px;display:initial;" />
            <div class="slider-content"><div class ="titletextdetail">${
              jsonData[i].title
            }</div>
            <div class ="subtitletextDetail"> ${this.GenerateSliderSubTitle(
              jsonData[i]
            )}</div>
            ${this.GenerateSliderButtons(jsonData[i])}

            </li>`;
    }
    return data;
  }

  GenerateSliderButtons(jsonData): any {
    let data = '';
    // let bgcolor = getRGBColor(pageConfigurationModel.EditBotColor);
    if (jsonData.buttons) {
      for (let i = 0; i < jsonData.buttons.length; i++) {
        if (jsonData.buttons[i].type == 'web_url') {
          data += `<button class="btn btn-primary mb-1" >${jsonData.buttons[i].title}</button>`;
        } else if (jsonData.buttons[i].type == 'postback') {
          data += `<button class="btn btn-primary mb-1" data-payload="${jsonData.buttons[i].payload}" >${jsonData.buttons[i].title}</button>`;
        }
      }
    }
    return data;
  }

  GenerateSliderSubTitle(jsonData): any {
    if (jsonData.subtitle) {
      return jsonData.subtitle;
    } else {
      return '';
    }
  }

  // Video
  Video(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));

    const video = `
      <video controls="" autoplay="" name="media" style="width:100%;">
        <source src="${jsonObject.message.attachment.payload.url}" type="video/mp4">
      </video>
    `;
    return video;
    // $('#Locobuzz_chatMessageBox').append(HtmlDesignDivBotSendingMessagemodified(video));
  }
  File(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));

    let name = this.GetFilename(jsonObject.message.attachment.payload.url);
    let Message = `
                 <a href="${jsonObject.message.attachment.payload.url}" download title="${name}" target="_blank" class="file-attachement">
                                                                <img src="/images/tickets/attachement-blured.png"/>
                                                                <span class="Files">
                                                                   ${name}
                                                                </span>
                                                            </a>
                                        `;
    return Message;
    // $('#Locobuzz_chatMessageBox').append(HtmlDesignDivBotSendingMessagemodified(video));
  }

  GetFilename(url): any {
    if (url) {
      return url.replace(/^.*[\\\/]/, '').split('?')[0];
    }
    return '';
  }

  PayLoadButtons(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));
    const params = `
      <p class="mb-1">${jsonObject.message.attachment.payload.text}</p><br/>
      ${this.GeneratePayLoadButtons(
        jsonObject.message.attachment.payload.buttons
      )}
    `;
    return params;
  }

  GeneratePayLoadButtons(jsondata): any {
    let data = '';

    for (let i = 0; i < jsondata.length; i++) {
      if (jsondata[i].type != 'phone_number') {
        data += ` <button type="button" class ="btn btn-primary btn-reply mb-1" data-payload="${jsondata[i].payload}" >${jsondata[i].title}</button>`;
      }
    }
    return data;
  }

  // Payload Button with web_url
  PayloadButtonwithWebUrl(jsonData): any {
    const jsonObject = JSON.parse(JSON.stringify(jsonData));

    let TextWithUrlButton = '';
    TextWithUrlButton += `<p class="chatpara" style="margin-bottom:5px">${jsonObject.message.attachment.payload.text}</p><br/>`;

    for (
      let i = 0;
      i < jsonObject.message.attachment.payload.buttons.length;
      i++
    ) {
      // TextWithUrlButton += `<button class="btn btn-primary form-control" onclick="window.open('${jsonObject.message.attachment.payload.buttons[i].url}','_blank')">${jsonObject.message.attachment.payload.buttons[i].title}</button>`
      if (jsonObject.message.attachment.payload.buttons[i].type == 'web_url') {
        TextWithUrlButton += `<button type="button" class="btn btn-primary" >${jsonObject.message.attachment.payload.buttons[i].title}</button>`;
      } else {
        TextWithUrlButton += `<button type="button" class="btn btn-primary" data-payload="${jsonObject.message.attachment.payload.buttons[i].payload}" >${jsonObject.message.attachment.payload.buttons[i].title}</button>`;
      }
    }
    return TextWithUrlButton;
    // $('#Locobuzz_chatMessageBox').append(HtmlDesignDivBotSendingMessagemodified(TextWithUrlButton));
  }

  isJSON(val: any): boolean {
    if (typeof val != 'string') {
      val = JSON.stringify(val);
    }

    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }

  GetTicketMultipleBrands_userwise_COUNT(
    filterObj
  ): Observable<QueueConfiguration> {
    return this._http
      .post<QueueConfiguration>(
        environment.baseUrl + '/Tickets/GetTicketMultipleBrands_userwise_COUNT',
        filterObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            const QueueConfiguration: QueueConfiguration = response;
            return QueueConfiguration;
          }
        })
      );
  }

  showTwitterPromotedTweet(obj) {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/ShowTwitterPromotedTweet', obj)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          }
        })
      );
  }

  showTwitterPromotedSentimentDistribution(obj) {
    return this._http
      .post<any>(
        environment.baseUrl +
          '/Tickets/ShowTwitterPromotedSentimentDistribution',
        obj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          }
        })
      );
  }

  showTwitterPromotedPostStats(obj) {
    return this._http
      .post<any>(
        environment.baseUrl + '/Tickets/ShowTwitterPromotedPostStats',
        obj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          }
        })
      );
  }

  hideUnhideFromFacebook(obj) {
    return this._http
      .post<any>(environment.baseUrl + '/Mention/HideUnhideMention', obj)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          }
        })
      );
  }

  getFacebookMediaUrl(obj) {
    return this._http
      .post<any>(environment.baseUrl + '/WebHook/GetFacebookVideoMediaUrl', obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  addPostToCampaign(obj)
  {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/AddPostToCampaign', obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  generateAnimalWildFareCrmToken(obj) {
    return this._http
      .post<any>(environment.baseUrl + '/AnimalWelfareCrm/GetCRMUrl', obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  scanTextContent(obj):any{
    return this._http
      .post<any>(environment.baseUrl + '/OCR/GetThreatMatchesUrl', obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  scanImageContent(obj):any{
    return this._http
      .post<any>(environment.baseUrl + '/OCR/GetImageExtractedText', obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  searchTwitterHandlesFromDB():any{
    return this._http
      .post<any>(environment.baseUrl + '/Account/GetTwitterHandlesByCategory', {})
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  saveBulkQualifedFilter(obj): any {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/SaveBulkTaggingCategoryV2', obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  deleteBulkQualifedFilter(obj): any {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/MentionBulkDeleteV2', obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }


  levelFilter(value, obj) {
    let category = [];
    obj.forEach(cat => {
      let dept = [];
      if (cat.category.toLowerCase().includes(value)) {
        category.push(cat);
      }
      else {
        cat?.depatments?.forEach(deptObj => {
          if (deptObj.departmentName.toLowerCase().includes(value)) {
            dept.push(deptObj);
          } else {
            if (deptObj.subCategories.length > 0 && deptObj.subCategories) {
              deptObj.subCategories = deptObj.subCategories.filter(sub => sub.subCategoryName.toLowerCase().includes(value))
              if (deptObj.subCategories.length > 0) {
                dept.push(deptObj);
              }
            }
          }
        })
        if (dept.length > 0) {
          cat.depatments = dept;
          category.push(cat)
        }
      }
    })
    return category;
  }

  reachImpressionLogic(postData: BaseMention): { reach: number, impression :number}
  {
    const obj:any={
      reach:0,
      impression:0
    }
    switch (postData?.mentionMetadata?.reachType)
    {
      case 0:
        if (postData?.channelType == ChannelType.InstagramPagePosts && postData?.isBrandPost) {
          obj.reach = 0;
          obj.impression = 0;
        }
        else if ((postData?.channelType == ChannelType.InstagramPagePosts || postData?.channelType == ChannelType.InstagramUserPosts || postData?.channelType == ChannelType.InstagramPublicPosts) && !postData?.isBrandPost){
          obj.reach = 0;
          obj.impression = 0;
        }
        else {
          obj.reach='NA'
          obj.impression = 'NA'
        }
        break;
      case 1:
        obj.reach = postData?.mentionMetadata?.reach
        obj.impression = postData?.mentionMetadata?.impression
        break;
      case 2:
        obj.reach = postData.isBrandPost ? postData?.mentionMetadata?.calculatedReach : 'NA'
        obj.impression = postData?.mentionMetadata?.impression
        break;
      case 3:
        obj.reach = postData?.mentionMetadata?.reach
        obj.impression = postData.isBrandPost ? postData?.mentionMetadata?.calculatedImpression : "NA"
        break;
      case 4:
        obj.reach = postData?.mentionMetadata?.calculatedReach
        obj.impression = postData?.mentionMetadata?.calculatedImpression
        break;
    }
    return obj;
  }

  calculateEngagementLogic(postData: BaseMention):number
  {
   let engagementCount;
    switch (postData?.mentionMetadata?.engagementType) {
      case 0:
        if (postData?.channelType == ChannelType.InstagramPagePosts && postData?.isBrandPost) {
          engagementCount = 0;
        } else if ((postData?.channelType == ChannelType.InstagramPagePosts || postData?.channelType == ChannelType.InstagramUserPosts || postData?.channelType == ChannelType.InstagramPublicPosts) && !postData?.isBrandPost){
          engagementCount = 0;
        }
        else {
          engagementCount = 'NA'
        }
        break;
      case 1:
        engagementCount =postData?.mentionMetadata?.engagementCount
        break;
      case 2:
        engagementCount = postData?.mentionMetadata?.engagementCount
        break;
    }
   return engagementCount
  }

  showReachFxOnFrontend(postData:BaseMention):boolean
  {
    let showReachFxFlag = false;

    if (postData?.channelType == ChannelType.InstagramPagePosts && postData?.isBrandPost && postData?.mentionFetchedFrom) {
      showReachFxFlag = false;
    } else if (postData?.mentionMetadata?.reachType == 2 || postData?.mentionMetadata?.reachType == 4 )
    {
      showReachFxFlag = true
    }

    return showReachFxFlag;
  }

  showImpressionFxOnFrontend(postData:BaseMention):boolean
  {
    let showImpressionFxFlag = false;
    if (postData?.channelType == ChannelType.InstagramPagePosts && postData?.isBrandPost && postData?.mentionFetchedFrom) {
      showImpressionFxFlag = false;
    } else if (postData?.mentionMetadata?.reachType == 3 || postData?.mentionMetadata?.reachType == 4)
    {
      showImpressionFxFlag = true
    }

    return showImpressionFxFlag;
  }

  showEngagementFxOnFrontend(postData:BaseMention):boolean
  {
    let showEngagementFxFlag = false;

    if (postData?.channelType == ChannelType.InstagramPagePosts && postData?.isBrandPost && postData?.mentionFetchedFrom) {
      showEngagementFxFlag = false;
    } else if (postData?.mentionMetadata?.engagementType == 2)
    {
      showEngagementFxFlag = true
    }

    return showEngagementFxFlag;
  }

  GetLangaueList(obj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/GetLangaueList', obj)
      .pipe(
        map((response) => {
          if (response) {
            const LangaueList: any = response;
            return LangaueList;
          }
        })
      );
  }

  getTiktokDetailedView(obj): Observable < any > {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/AssociateDetails', obj)
      .pipe(
        map((response) => {
          if (response) {
            const UpdateMentionLanguage: any = response;
            return UpdateMentionLanguage;
          }
        })
      );
  }

   UpdateMentionLanguage(obj): Observable < any > {
    return this._http
      .post<any>(environment.baseUrl + '/Mention/UpdateMentionLanguage', obj)
      .pipe(
        map((response) => {
          if (response) {
            const UpdateMentionLanguage: any = response;
            return UpdateMentionLanguage;
          }
        })
      );
  }

  updateSignleMentionSeen(obj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/GroupViewSeenSingle', obj)
      .pipe(
        map((response) => {
          if (response) {
            const UpdateMentionLanguage: any = response;
            return UpdateMentionLanguage;
          }
        })
      );
  }

  updateBulkSeenUnseen(obj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/GroupViewSeenBulk', obj)
      .pipe(
        map((response) => {
          if (response) {
            const UpdateMentionLanguage: any = response;
            return UpdateMentionLanguage;
          }
        })
      );
  }

  updateQualifiedBulkSeenUnseen(obj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/GroupViewSeenQualifiedBulk', obj)
      .pipe(
        map((response) => {
          if (response) {
            const UpdateMentionLanguage: any = response;
            return UpdateMentionLanguage;
          }
        })
      );
  }

  updateChildQualifiedBulkSeenUnseen(obj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/GroupViewSeenBulkchild', obj)
      .pipe(
        map((response) => {
          if (response) {
            const UpdateMentionLanguage: any = response;
            return UpdateMentionLanguage;
          }
        })
      );
  }


  updateChildBulkSeenUnseen(obj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/GroupViewSeenBulkchildMultiple', obj)
      .pipe(
        map((response) => {
          if (response) {
            const UpdateMentionLanguage: any = response;
            return UpdateMentionLanguage;
          }
        })
      );
  }


  updateInfluencerCategory(key, removeInfluencerFlag): Observable<object> {
    return this._http.post(
      removeInfluencerFlag ? environment.baseUrl + '/Tickets/InActiveInfluencer' : environment.baseUrl + '/Tickets/InsertUpdateInfluencer',
      key
    );
  }

  GetUnmaskedDescription(obj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/GetUnmaskedDescription', obj)
      .pipe(
        map((response) => {
          if (response) {
            const UnmaskedDescription: any = response;
            return UnmaskedDescription;
          }
        })
      );
  }

  //Tickets/GetUnmaskedValue

  GetUnmaskedValue(obj): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/Tickets/GetUnmaskedValue', obj)
      .pipe(
        map((response) => {
          if (response) {
            const GetUnmaskedValue: any = response;
            return GetUnmaskedValue;
          }
        })
      );
  }

  getCRMTicketStatus(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/crm/CRMTicketReopen?TicketID=${keyObj?.TicketID}`,
        {}
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getPostLabels(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/Tickets/GetPostLabels`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  updatePostLabels(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/Tickets/UpdatePostLabels`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  generateClosingTicketTag(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/AITicketTagging/GenerateClosingTicketTag`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getCrmFieldForm(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/SFDCAppExchange/GetFieldJson`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  pushTicketToCRM(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/SFDCAppExchange/SaveManualPushData`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }


  searchExitingCRMAccount(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/SFDCAppExchange/GetLookUpData`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getSRDetails(id): Observable<any> {
    return this._http
      .get<any>(
        environment.baseUrl + `/SFDCAppExchange/GetpushedData?CaseId=${id}`,
        {}
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetUnseenNoteCountCRM(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/IntegratedQuickWork/GetUnseenNoteCount`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  SFDCDataSync(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/SFDCAppExchange/SFDCDataSync`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getLinkedInPageUrl(postData: BaseMention): any {
    const ProfileList = this._filterService?.fetchedSocialProfile;
    const profile = ProfileList.find(
      (x) =>
        x.btaid === Number(postData?.settingID) &&
        x.brandID === postData?.brandInfo?.brandID
    );
    if (profile) {
      return profile?.profileImageUrl;
    } else {
      return '';
    }
  }

  getInitials(authorName: string): string {
    let initials = '';
    const name = authorName?.trim();
    const userName = name?.replace(/[^a-zA-Z ]/g, '')?.replace(/\s+/g, ' ');
    const parts = userName?.split(' ');
    if (parts?.length > 1) {
      initials = `${parts[0][0]?.toUpperCase()}${parts[parts?.length - 1][0]?.toUpperCase()}`;
    } else if (parts?.length) {
      initials = parts[0]?.slice(0, 2)?.toUpperCase();
    }
    return initials;
  }

  replaceNewlinesWithBrTags(inputText,replaceString:string) {
    let newlinePattern = /(\s{1,}|\n{2,}|\t{2,}|\r{2,}|\n\s*|&nbsp;{2,})/g;
    let textWithBrTags = inputText.replace(newlinePattern, " ").replaceAll('\\r\\n', '<br>').replaceAll('\r\n', '<br>');
    textWithBrTags = textWithBrTags.replace(/(<br>)+/g, replaceString)
    return textWithBrTags;
  }

  mergeAllAttachmentAddedInEmail(ticketHistoryData: AllBrandsTicketsDTO, postData:BaseMention):any[] {
    const attachmentList = []
    ticketHistoryData.imageurls?.forEach((x) => {
      const mediaObj = postData?.attachmentMetadata?.mediaContents?.find((y => y?.mediaUrl == x || y?.thumbUrl == x));
      let mediaType, iconUrl;
      let extenesion = x.split('.').pop()
      if (x.includes('jpg') ||
        x.includes('png') ||
        x.includes('jpeg') ||
        x.includes('gif') ||
        x.includes('jfif') ||
        x.includes('pjpeg') ||
        x.includes('pjp') ||
        x.includes('apng') ||
        x.includes('avif')) {
        mediaType = 2
        iconUrl ='assets/icons/JPEG.svg'
      } else {
        mediaType = 6
        iconUrl ='assets/icons/Other.svg'
      }

      const obj = {
        name: mediaObj ? mediaObj?.name : `untitled.${extenesion}`,
        mediaType: mediaType,
        mediaUrl: x,
        iconUrl: iconUrl,
      }
      attachmentList.push(obj)
    })


    ticketHistoryData.videoUrls?.forEach((x) => {
      const obj = {
        name: (x?.name)? x?.name : 'untitled.mp4',
        mediaType: 3,
        mediaUrl: x,
        iconUrl:'assets/icons/video-icon.svg'
      }
      attachmentList.push(obj)
    })

    ticketHistoryData.audioUrls?.forEach((x) => {
      const mediaObj = postData?.attachmentMetadata?.mediaContents?.find((y => y?.mediaUrl == x || y?.thumbUrl == x));
      const obj = {
        name: mediaObj ? mediaObj?.name : 'untitled',
        mediaType: 11,
        mediaUrl: x?.fileUrl,
        iconUrl: 'assets/icons/MP3.svg'
      }
      attachmentList.push(obj)
    }
    )

    ticketHistoryData.documentUrls?.forEach((x) => {
      const obj = {
        name: x?.fileName ? x?.fileName : 'untitled',
        mediaType: x?.fileUrl.includes('pdf') ? 8 : x?.fileUrl.includes('doc') || x?.fileUrl.includes('docx') ? 9 : x?.fileUrl.includes('ppt') || x?.fileUrl.includes('pptx') ? 19 : x?.fileUrl.includes('xls') || x?.fileUrl.includes('xlsx') ? 19 : 6,
        mediaUrl: x?.fileUrl,
        iconUrl: x?.fileUrl.includes('doc') ? 'assets/icons/DOC.svg' : x?.fileUrl.includes('docx') ? 'assets/icons/DOCX.svg' : x?.fileUrl.includes('ppt') ? 'assets/icons/PPT.svg' : x?.fileUrl.includes('pptx') ? 'assets/icons/PPTX.svg' : x?.fileUrl.includes('xls') ? 'assets/icons/Xls.svg' : x?.fileUrl.includes('xlsx') ? 'assets/icons/Xlsx.svg' : x?.fileUrl.includes('pdf') ? 'assets/icons/PDF.svg' : 'assets/icons/Other.svg'
      }
      attachmentList.push(obj)
    })

    ticketHistoryData.fileUrls?.forEach((x) => {
      const obj = {
        name: x?.fileName ? x?.fileName : 'untitled',
        mediaType: 19,
        mediaUrl: x?.fileUrl,
        iconUrl: x?.fileUrl?.includes('.csv') ? 'assets/icons/CSV.svg' :'assets/icons/Other.svg'
      }
      attachmentList.push(obj)
    })

    return attachmentList;

  }

  downloadFile(url: string, filename: string):void
  {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch file');
        }
        return response.blob();
      })
      .then(blob => {
        saveAs(blob, filename);
      })
      .catch(error => {
        console.error('Download failed:', error);
      });
  }

  async downloadFilesAsZip(files: { name: string; url: string }[], zipName: string): Promise<void> {
    const zip = new JSZip();

    for (const file of files) {
      try {
        const response = await fetch(file.url);
        const blob = await response.blob();
        zip.file(file.name, blob);
      } catch (err) {
        console.error(`Error fetching ${file.name}:`, err);
      }
    }

    zip.generateAsync({ type: 'blob' }).then((content) => {
      saveAs(content, zipName);
    });
  }

  getColorFromName(name: string): string {
    const initials = this.getInitials(name);
    const hash = this.hashString(initials);
    const index = hash % this.colorPalette.length;
    return this.colorPalette[index];
  }

  hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash);
  }
  
  errorLogsCommonFrontend(payload): Observable<any>  {
    return this._http.post(environment.baseUrl + '/Tickets/TimeErrorLog', payload)
  }

  generateAgentIQ(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/AITicketTagging/GenerateAgentIQ`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetSFDCCaseNo(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + `/SFDCAppExchange/GetSFDCCaseNo`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

}

