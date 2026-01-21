import { Injectable, signal } from '@angular/core';
import { BaseSocialAuthor } from 'app/core/models/authors/locobuzz/BaseSocialAuthor';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { BehaviorSubject, Subject } from 'rxjs';
import { postDetail } from './../../app-data/post-detail';
import { postDetailProfileMenu } from './../../app-data/post-detail-profile-menu';
import { AllMentionGroupView } from 'app/shared/components/post-options/post-options.component';

@Injectable({
  providedIn: 'root',
})
export class PostDetailService {
  postDetailData: {};
  audioID: any;
  replyText?: string;
  postObj: BaseMention;
  tabIndex: number = 0;
  categoryType: string;
  openInNewTab = false;
  /* currentPostObject = new BehaviorSubject<number>(0); */
  currentPostObjectSignal = signal<number>(0);;
  setMarkInfluencer = new Subject<BaseMention>();
  setMarkInfluencerClickhouse = new Subject<BaseMention>();
  // isReplyVisibleCheck = new BehaviorSubject<AllBrandsTicketsDTO>(null);
  isReplyVisibleCheckSignal = signal<AllBrandsTicketsDTO>(null);

  /* postDetailWindowStatus = new BehaviorSubject<{
    status: boolean;
    ticketId: number;
  }>(null); */
  postDetailWindowStatusSignal = signal<{
    status: boolean;
    ticketId: number;
  }>(null);
  isBulk = false;
  pagetype: PostsType;
  postDetailPage = false;
  refreshNewTab = true;
  ticketOpenDetail: BaseMention;
  playstoreurl: string;
  notetype: number;
  crmFlag: boolean;
  voiceChannel: any;
  voiceTicketId: any;
  voiceTagId: any = '';
  startIndex?: number;
  endIndex?: number;
  openRephrasePopup: boolean = false;
  autoCloseWindow: boolean = false;
  /* public dialpadBoolean: BehaviorSubject<any> = new BehaviorSubject<boolean>(
    false
  ); */
  public dialpadBooleanSignal = signal<boolean>(false);
  public createdDate:BehaviorSubject<any> = new BehaviorSubject<any>(null);
  voipMentionTrigger = new Subject<BaseMention>();
  makeActionableFlag: boolean = false;
  // updateTicketCategory = new Subject<any>();
  updateTicketCategorySignal = signal<any>(null);

  // public ticketEscalateUpdate: Subject<{status: boolean; ticketID: any;}> = new Subject()
  public ticketEscalateUpdateSignal = signal<{ status: boolean; ticketID: any; }>(null);
  constructor() {
    if (localStorage.getItem('layoutMode') == '2'){
      this.postDetailData = postDetailProfileMenu;
    } else {
      this.postDetailData = postDetail;
    }
  }
  updateChannelList = new Subject<BaseSocialAuthor[]>();
  autoCloseWindowObs = new Subject<boolean>();
  selectedTicketType:number;
  crmPostTye:number;
  isBulkQualified :boolean= false
  mentionCount?:number=0;
  galleryIndex?:number=0;
  groupedView?:boolean=false;
  parentComponent?:boolean=false;
  childOrParentFlag?:boolean=false;
  relatedOrfullmention?:boolean=false;
  isBulkselected?:boolean=false;
  totalCount?: number = 0;
  sortHandTicketTimeUpdate = new Subject();
  emailTicketAttachmentMedia = []
  emailIdsInSameThread = []
  public postDetailEditNotesObs = new Subject<string>();
  incomingOrOutgoing:boolean;
  callAgainNumber:string;
  voipTagID:any
}
