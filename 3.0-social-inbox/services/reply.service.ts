import { SectionEnum } from 'app/core/enums/SectionEnum';
import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActionStatusEnum,
  ClientStatusEnum,
} from 'app/core/enums/ActionStatus';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { LogStatus } from 'app/core/enums/LogStatus';
import { MakerCheckerEnum } from 'app/core/enums/MakerCheckerEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { PerformedAction } from 'app/core/enums/PerformedAction';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { BulkActionButtons } from 'app/core/interfaces/BulkTicketActions';
import { AuthUser } from 'app/core/interfaces/User';
import {
  BaseSocialAccountConfiguration,
  BaseSocialAccountConfResponse,
} from 'app/core/models/accountconfigurations/BaseSocialAccountConfiguration';
import {
  MakerChecker,
  MakerCheckerResponse,
} from 'app/core/models/dbmodel/MakerCheckerDB';
import {
  CustomResponse,
  ReplyOptions,
  TicketsCommunicationLog,
} from 'app/core/models/dbmodel/TicketReplyDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import {
  AlertMails,
  AlertMailsResponse,
} from 'app/core/models/viewmodel/AlertMails';
import {
  BrandQueueData,
  BrandQueueResponse,
} from 'app/core/models/viewmodel/BrandQueueData';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import {
  GroupEmailList,
  GroupEmailListResponse,
} from 'app/core/models/viewmodel/GroupEmailList';
import { IApiResponse } from 'app/core/models/viewmodel/IApiResponse';
import {
  LocoBuzzAgent,
  LocobuzzAgentResponse,
} from 'app/core/models/viewmodel/LocoBuzzAgent';
import { LocobuzzIntentDetectedResult } from 'app/core/models/viewmodel/LocobuzzIntentDetectResult';
import {
  MentionReadCompulsory,
  MentionReadCompulsoryResponse,
  TicketEmailReadStatus,
} from 'app/core/models/viewmodel/MentionReadCompulsory';
import {
  BaseReply,
  PerformActionParameters,
} from 'app/core/models/viewmodel/PerformActionParameters';
import { Reply } from 'app/core/models/viewmodel/Reply';
import {
  EmailReadReceipt,
  MentionReadReceipt,
  ReplyInputParams,
  ReplyTimeExpire,
} from 'app/core/models/viewmodel/ReplyInputParams';
import { NoteMedia, UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { BrandList } from '../../shared/components/filter/filter-models/brandlist.model';
import { FilterService } from './filter.service';
import { PostDetailService } from './post-detail.service';
import { TicketsService } from './tickets.service';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';

@Injectable({
  providedIn: 'root',
})
export class ReplyService {
  selectedMedia = new BehaviorSubject<{
    media: UgcMention[];
    section?: number;
    caption?: string;
  }>({ media: null, section: null, caption: null });
  selectedNoteMedia = new BehaviorSubject<{
    media: UgcMention[];
    section?: number;
  }>({ media: null, section: null });
  selectedUgcMedia = new BehaviorSubject<string[]>([]);
  // selectedCannedResponse = new BehaviorSubject<{
  //   openedFrom?: string;
  //   text: string;
  //   section?: number;
  //   textBoxIndex?:number;
  // }>({ openedFrom: '', text: '', section: null });
  selectedCannedResponseSignal = signal<{
    openedFrom?: string;
    text: string;
    section?: number;
    textBoxIndex?: number;
    tagId?:any;
    bulkMentionText?: any;
    mediaAttachments?:any[];
  }>({ openedFrom: '', text: '', section: null });
  selectedSmartSuggestion = new BehaviorSubject<any>(null);
  closeReplyBox = new BehaviorSubject<boolean>(false);
  closeReplyBoxSignal = signal<any>(false);
  // reAssignTicket = new BehaviorSubject<any>(null);
  reAssignTicketSignal = signal<any>(null);

  setTicktOverview = new BehaviorSubject<BaseMention>(null);
  // replyActionPerformed = new Subject<BaseMention>();
  replyActionPerformedSignal = signal<BaseMention>(null);

  /* postDetailObjectChanged = new BehaviorSubject<BaseMention>(null); */
  postDetailObjectChangedSignal = signal<BaseMention>(null);
  // checkReplyInputParams = new BehaviorSubject<ReplyInputParams>(null);
  checkReplyInputParamsSignal = signal<ReplyInputParams>(null);
  // checkReplyTimeExpire = new BehaviorSubject<any>(null);
  checkReplyTimeExpireSignal = signal<any>(null);

  checkReplyError = new BehaviorSubject<any>(null);
  checkEmailReadReceipt = new BehaviorSubject<EmailReadReceipt>(null);
  locobuzzIntentDetectedResult: LocobuzzIntentDetectedResult[] = [];
  brandEmailreadInformation: MentionReadCompulsory[] = [];
  // emitBrandMentionEmailData = new BehaviorSubject<MentionReadCompulsory>(null);
  emitBrandMentionEmailDataSignal = signal<MentionReadCompulsory>(null);

  // emitEmailReadStatus = new Subject<TicketEmailReadStatus>();
  emitEmailReadStatusSignal = signal<TicketEmailReadStatus>(null);

  setRetweetStatus = new BehaviorSubject<BaseMention>(null);
  smartSuggestionLoader = new BehaviorSubject<boolean>(null);
  
  mentionReadReceipt: MentionReadReceipt[] = [];
  // redirectToTagId = new BehaviorSubject<Number>(0);
  redirectToTagIdSignal = signal<number>(0);


  /* openRephrase = new Subject<any>(); */
  openRephraseSignal = signal<any>(null);
  /* openRephraseSFDC = new Subject<any>(); */
  openRephraseSFDCSignal = signal<any>(null);
  applyRephrase = new Subject<any>();
  undoRedoRephrase = new Subject<any>();
  rephraseLoader = new Subject<any>();
  undoredoChanged = new Subject<any>();

  emailList: string[];
  section: SectionEnum = SectionEnum.Chat;
  bulkActionButtons: BulkActionButtons = {
    btnbulkapprove: false,
    btnbulkassign: false,
    btnbulkdirectclose: false,
    btnbulkescalae: false,
    btnbulkonhold: false,
    btnbulkreject: false,
    btnbulkreopen: false,
    btnbulkreply: false,
    btnbulkreplyapproved: false,
    btnbulkreplyrejected: false,
    btnbulkdelete: false,
    btnbulkdeletefromchannel: false,
  };
  ticketBulkOptionUpdate = new Subject<any>();
  selectedNoteAttachment = new Subject<UgcMention[]>();
  // clearNoteAttachment = new Subject<boolean>();
  clearNoteAttachmentSignal = signal<boolean>(null);

  autoQueueConfigUpdate = new Subject < { tagID: number,BrandQueueData:BrandQueueData[]}>();
  
  openRephrasePopup = false;
  undoArr =[];
  redoArr = [];
  dispositionData: any;
  // ticketDispositionList = new BehaviorSubject<any>(null);
  ticketDispositionListSignal = signal<any>(null);


  selectedNoteMediaVal: NoteMedia[] = null;
  aiIntelligenceData: any;

  constructor(
    private _http: HttpClient,
    private _snackBar: MatSnackBar,
    private _mapLocobuzzEntity: MaplocobuzzentitiesService,
    private _filterService: FilterService,
    private _ticketService: TicketsService,
    private _navigationService: NavigationService,
    private _postDetailService: PostDetailService,
    public dialog: MatDialog,
  ) {}

  GetBrandAccountInformation(
    keyObj
  ): Observable<BaseSocialAccountConfiguration[]> {
    return this._http
      .post<BaseSocialAccountConfResponse>(
        environment.baseUrl + '/Account/ConfiguredBrandChannelAccount',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            const MentionList: BaseSocialAccountConfiguration[] = response.data;
            return MentionList;
          }
        })
      );
  }

  TwitterReTweetStatus(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Mention/TwitterReTweetStatus',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GBMAgentJoinedLeft(obj): Observable<any> {
    return this._http
      .post<any>(`${environment.baseUrl}/Tickets/GBMAgentJoinedLeft`, obj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  TwitterTweetLikeStatus(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/TwitterTweetLikeStatus',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  rephraseData(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + '/TicketDisposition/GetAIRephraseData',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  translateReply(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + '/TicketDisposition/GetAITranslateData',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  Reply(keyObj, returnErrorResponse = false): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/PerformAction',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            let JoinedAgents = localStorage.getItem('JoinedAgents') ? JSON.parse(localStorage.getItem('JoinedAgents')) : [];
            if (keyObj && keyObj?.Source && (keyObj?.PerformedActionText == 'Direct Close' || keyObj?.PerformedActionText == 'Reply & Close') && JoinedAgents && JoinedAgents.length && keyObj?.Source?.objectId && keyObj?.Source?.channelGroup == ChannelGroup.GoogleBusinessMessages ){
              if (JoinedAgents.includes(keyObj?.Source?.objectId)){
                this.GBMAgentLeft(keyObj?.Source);
              }
            }
            return response;
          } else {
            if (returnErrorResponse) {
              return response;
            }
            return response;
            /* this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: response.message ? response.message : 'Error Occurred while sending reply',
              },
            }); */
          }
        })
      );
  }

  GBMAgentLeft(data:any) {
    const obj = {
      brandInfo: {
        BrandID: data.brandInfo.brandID,
        BrandName: data?.brandInfo.brandName
      },
      AuthorSocialID: data?.author.socialID ? data?.author.socialID : data?.author?.socialId,
      EventType: 'REPRESENTATIVE_LEFT',
      AuthorName: data?.author?.name,
      ReplyFromAccountId: data?.settingID
    }
    this.GBMAgentJoinedLeft(obj).subscribe(res => {
      let JoinedAgents = localStorage.getItem('JoinedAgents') ? JSON.parse(localStorage.getItem('JoinedAgents')) : [];
      if (res.success) {
        const isExistIndex = JoinedAgents.findIndex(res => res == data?.objectId);
        if (isExistIndex > -1) {
          JoinedAgents.splice(isExistIndex, 1);
          localStorage.setItem('JoinedAgents', JSON.stringify(JoinedAgents));
        }
      }
    }, err => {
    })
  }
  CreateAttachMultipleMentions(keyObj): any {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/CreateAttachMultipleMentions',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  ReplyApproved(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/ReplyApproved',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Unable to approve reply',
              },
            });
          }
        })
      );
  }

  ReplyRejected(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/ReplyRejected',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  SSRELiveRightVerified(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Ssre/SsreLiveRightVerified',
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

  ssreLiveWrongKeep(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Ssre/SsreLiveKeepReply',
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

  ssreLiveWrongDelete(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Ssre/SsreLiveDeleteSocial',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while approving reply',
              },
            });
          }
        })
      );
  }

  GetUsersWithTicketCount(keyObj): Observable<LocoBuzzAgent[]> {
    return this._http
      .post<LocobuzzAgentResponse>(
        environment.baseUrl + '/Account/GetLocobuzzUsersWithTicketCount',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
        })
      );
  }

  getAutoQueueingConfig(keyObj): Observable<BrandQueueData[]> {
    return this._http
      .post<BrandQueueResponse>(
        environment.baseUrl + '/Account/GetAutoQueueingConfig',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
          return response.data;
        })
      );
  }

  GetMailGroup(keyObj): Observable<GroupEmailList[]> {
    return this._http
      .post<GroupEmailListResponse>(
        environment.baseUrl + '/Tickets/GetMailGroup',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
        })
      );
  }

  GetMakerCheckerData(keyObj): Observable<MakerChecker> {
    return this._http
      .post<MakerCheckerResponse>(
        environment.baseUrl + '/Tickets/GetMakerCheckerDetails',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          }
        })
      );
  }

  BuildComminicationLog(
    baseMention: BaseMention,
    selectedReplyType,
    note?,
    ticketId?,
    locobuzzAgent?: LocoBuzzAgent
  ): TicketsCommunicationLog[] {
    const tasks: TicketsCommunicationLog[] = [];
    const actionEnum = ReplyOptions.GetActionEnum();
    switch (+selectedReplyType) {
      case ActionStatusEnum.DirectClose: {
        // if ($.trim(formObject.txtNotes) != '') {
        //     let noteLog = CommunicationLogGenerator._getCommunicationLogForNote();
        //     noteLog.Note = $.trim(formObject.txtNotes);
        //     tasks.push(noteLog);
        // }

        const log = new TicketsCommunicationLog(ClientStatusEnum.Closed);
        tasks.push(log);
        const brandInfo = this._filterService.fetchedBrandData.find((brand: BrandList) => 
          +brand.brandID == baseMention.brandInfo.brandID)
        
        if (note !== undefined || this.selectedNoteMediaVal?.length > 0) {
          const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log1.Note = note;
          log1.NotesAttachment = this.selectedNoteMediaVal?.length > 0 ? this.selectedNoteMediaVal : null;
          tasks.push(log1);
        }
        else if (this.dispositionData?.note !== undefined) {
          const dispositionLog = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          dispositionLog.Note = this.dispositionData?.note;
          dispositionLog.NotesAttachment = this.dispositionData?.NoteAttachments?.length > 0 ? this.dispositionData?.NoteAttachments : null;
          tasks.push(dispositionLog);
        } else if (brandInfo?.aiTagEnabled) {
          const notes = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          notes.Note = note;
          notes.NotesAttachment = this.selectedNoteMediaVal?.length > 0 ? this.selectedNoteMediaVal : null;
          tasks.push(notes);
        }

        baseMention.ticketInfo.makerCheckerStatus =
          MakerCheckerEnum.DirectClose;
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

        const escalationMessage = note;
        if (escalationMessage?.trim() !== '' || this.selectedNoteMediaVal) {
          const log5 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log5.Note = escalationMessage?.trim();
          log5.NotesAttachment = this.selectedNoteMediaVal.length > 0 ? this.selectedNoteMediaVal : null;
          tasks.push(log5);
        }

        break;
      }
      case ActionStatusEnum.AttachTicket: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.CaseDetach);
        const log2 = new TicketsCommunicationLog(ClientStatusEnum.CaseAttach);

        log2.TicketID = ticketId;

        tasks.push(log1);
        tasks.push(log2);

        const escalationMessage = note;
        if (escalationMessage?.trim() !== '' || this.selectedNoteMediaVal) {
          const log3 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log3.Note = escalationMessage?.trim();
          log3.NotesAttachment = this.selectedNoteMediaVal.length > 0 ? this.selectedNoteMediaVal : null;
          tasks.push(log3);
        }
        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.CaseAttach;
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

        baseMention.ticketInfo.makerCheckerStatus =
          MakerCheckerEnum.ReplyAwaitingResponse;

        break;
      }
      case ActionStatusEnum.Approve: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.Approve);

        const escalationMessage = note;
        if (escalationMessage.trim() !== '' || this.selectedNoteMediaVal) {
          const log3 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log3.Note = escalationMessage.trim();
          log3.NotesAttachment = this.selectedNoteMediaVal.length > 0 ? this.selectedNoteMediaVal : null;
          tasks.push(log3);
        }

        tasks.push(log1);
        break;
      }
      case ActionStatusEnum.Reject: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.Ignore);

        const escalationMessage = note;
        if (escalationMessage.trim() !== '' || this.selectedNoteMediaVal) {
          const log2 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log2.Note = escalationMessage.trim();
          log2.NotesAttachment = this.selectedNoteMediaVal.length > 0 ? this.selectedNoteMediaVal : null;
          tasks.push(log2);
        }

        tasks.push(log1);
        break;
      }
      case ActionStatusEnum.Escalate: {
        const escalationMessage = note;
        if (escalationMessage.trim() !== '' || this.selectedNoteMediaVal) {
          const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log1.Note = escalationMessage.trim();
          log1.NotesAttachment = this.selectedNoteMediaVal.length > 0 ? this.selectedNoteMediaVal : null;
          tasks.push(log1);
        }

        const log3 = new TicketsCommunicationLog(ClientStatusEnum.Escalated);

        log3.AssignedToUserID = locobuzzAgent.agentID;
        log3.AssignedToTeam = locobuzzAgent.teamID;

        tasks.push(log3);
        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.Escalate;
        break;
      }
      case ActionStatusEnum.Acknowledge: {
        const acknowledgeMessage: string = note;
        if (acknowledgeMessage.trim().length > 0 || this.selectedNoteMediaVal.length > 0) {
          const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log1.NotesAttachment = this.selectedNoteMediaVal.length > 0 ? this.selectedNoteMediaVal : null;
          log1.Note = acknowledgeMessage.trim();
          tasks.push(log1);
        }

        const log2 = new TicketsCommunicationLog(ClientStatusEnum.Acknowledge);
        tasks.push(log2);
        break;
      }
      case ActionStatusEnum.BrandReject: {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.Ignore);

        const escalationMessage = note;
        if (escalationMessage.trim() !== '') {
          const log2 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
          log2.Note = escalationMessage.trim();
          tasks.push(log2);
        }

        tasks.push(log1);
        break;
      }

      default:
        break;
    }
    tasks.forEach((obj) => {
      obj.TagID = String(baseMention.tagID);
    });
    return tasks;
  }

  getFoulKeywords(postData: BaseMention): any {
    const foulParams = {
      brandInfo: postData.brandInfo,
      fag: 0,
    };
    return this._http
      .post(
        environment.baseUrl + '/Tickets/GetAllfoulkeywordsOrEmailsList',
        foulParams
      )
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  BuildReply(
    baseMention: BaseMention,
    selectedReplyType,
    note?,
    ticketid?,
    locobuzzAgent?: LocoBuzzAgent
  ): PerformActionParameters {
    const replyObj: PerformActionParameters = {};
    const replyArray: Reply[] = [];
    const baseReply = new BaseReply();
    const customReplyObj = baseReply.getReplyClass();
    // map the properties
    replyObj.ActionTaken = ActionTaken.Locobuzz;

    replyObj.Tasks = this.BuildComminicationLog(
      baseMention,
      selectedReplyType,
      note,
      ticketid,
      locobuzzAgent
    );
    const source = this._mapLocobuzzEntity.mapMention(baseMention);
    replyObj.Source = source;

    // replyArray = this._mapLocobuzzEntity.mapReplyObject(replyArray);
    const replyopt = new ReplyOptions();
    replyObj.PerformedActionText = replyopt.replyOption
      .find((obj) => obj.id === +selectedReplyType)
      .value.trim();
    replyObj.Replies = replyArray;

    replyObj.ReplyFromAccountId = 0;
    replyObj.ReplyFromAuthorSocialId = '';

    // call Reply Api
    return replyObj;
  }

  getSubscibeData(postData: BaseMention): any {
    const subscribeParams = {
      BrandInfo: postData.brandInfo,
      TicketId: postData.ticketID,
    };
    return this._http
      .post(
        environment.baseUrl + '/Tickets/GetTicketSubscription',
        subscribeParams
      )
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  getmailList(term): any {
    return this._http
      .get(environment.baseUrl + '/Tickets/SearchEmails/' + term)
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  postSubscribe(postParams): any {
    return this._http
      .post<any>(`${environment.baseUrl}/Tickets/SaveSubscription`, postParams)
      .pipe(
        map(
          (response) => {
            return response;
          },
          (err) => {
            // console.log(err);
          }
        )
      );
  }

  BulkTicketAction(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/SaveBulkReplyRequest',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  ConfirmBulkTicketAction(prop: any, dispositionDetails?: any,parentPostComment?:boolean, notesLog?: any , closingNote?: any): any {
    let TicketAgentWorkFlowEnabled = false;
    const BulkObject = [];
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === prop.guid
    );
    const TicketIDs = [];
    const oldAssignedTo = [];
    const oldEscalatedTo = [];
    const BrandIDs = [];
    const BrandNames = [];
    const SocialIDs = [];
    const TagIDs = [];
    const AssignToAgentUserID = 0;
    const AssignmentNote = '';
    const AssignToAgentTeamID = 0;
    const TicketAssignmentArray = [];
    const TicketGoingForApproval = [];
    const DirectCloseErrorTickets = [];
    let DirectCloseErrorflag = false;
    let IsBrandMakerEnabled = false;
    let IsTicketMakerEnabled = false;
    let IsEnableReplyApprovalWorkFlow = false;
    const currentteamid = prop.currentteamid;
    let isAgentHasTeam = false;
    let IsCSDUser = false;
    if (currentteamid !== 0) {
      isAgentHasTeam = true;
    }
    if (prop.userrole === UserRoleEnum.CustomerCare) {
      IsCSDUser = true;
    }
    if (
      prop.action === PerformedAction.Approve ||
      prop.action === PerformedAction.Reject
    ) {
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

        TicketIDs.push(checkedticket.mention.ticketInfo.ticketID);
        oldAssignedTo.push(checkedticket.mention.ticketInfo.assignedTo);
        SocialIDs.push(checkedticket.mention.socialID);
        oldEscalatedTo.push(checkedticket.mention.ticketInfo.escalatedTo);
        BrandIDs.push(checkedticket.mention.brandInfo.brandID);
        BrandNames.push(checkedticket.mention.brandInfo.brandName);
        TagIDs.push(checkedticket.mention.tagID);
      }
    } else {
      if (prop.action === PerformedAction.Assign) {
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

          TicketIDs.push(checkedticket.mention.ticketInfo.ticketID);
          oldAssignedTo.push(checkedticket.mention.ticketInfo.assignedTo);
          SocialIDs.push(checkedticket.mention.socialID);
          oldEscalatedTo.push(checkedticket.mention.ticketInfo.escalatedTo);
          BrandIDs.push(checkedticket.mention.brandInfo.brandID);
          BrandNames.push(checkedticket.mention.brandInfo.brandName);
          TagIDs.push(checkedticket.mention.tagID);
          const _ChannelType = checkedticket.mention.channelType;
          TicketAssignmentArray.push({
            ChannelType: _ChannelType ? Number(_ChannelType) : 0,
            TagID: checkedticket.mention.tagID,
            TicketID: checkedticket.mention.ticketInfo.ticketID,
          });
        }
      } else {
        for (const checkedticket of chkTicket) {
          const properties:any = {
            ReplyFromAccountId: 0,
            ReplyFromAuthorSocialId: '',
            TicketID: checkedticket.mention.ticketInfo.ticketID,
            TagID: checkedticket.mention.tagID,
            BrandID: checkedticket.mention.brandInfo.brandID,
            BrandName: checkedticket.mention.brandInfo.brandName,
            ChannelGroup: checkedticket.mention.channelGroup,
            Replies: [],
          };

          const brandInfo = this._filterService.fetchedBrandData?.find(
            (brand: BrandList) =>
              +brand.brandID === checkedticket?.mention?.brandInfo?.brandID
          );
          if (dispositionDetails && dispositionDetails?.aiTicketIntelligenceModel && dispositionDetails?.aiTicketIntelligenceModel.length) {
            const isExist = dispositionDetails?.aiTicketIntelligenceModel.find(res => res.ticketID == properties.TicketID);
            if(isExist){
              const source = this._mapLocobuzzEntity.mapMention(checkedticket.mention);
              properties.Source = source;
              properties.Source.aiTicketIntelligenceModel = isExist;
            }
          } else if (brandInfo?.aiTagEnabled) {
            const source = this._mapLocobuzzEntity.mapMention(checkedticket.mention);
            properties.Source = source;
            properties.Source.aiTicketIntelligenceModel = this.aiIntelligenceData;
          }

          BulkObject.push(properties);

          const brandid = checkedticket.mention.brandInfo.brandID;
          const tagid = checkedticket.mention.tagID;
          const ticketid = checkedticket.mention.ticketInfo.ticketID;

          TicketIDs.push(ticketid);
          oldAssignedTo.push(checkedticket.mention.ticketInfo.assignedTo);
          SocialIDs.push(checkedticket.mention.socialID);
          oldEscalatedTo.push(checkedticket.mention.ticketInfo.escalatedTo);
          BrandIDs.push(brandid);
          BrandNames.push(checkedticket.mention.brandInfo.brandName);
          TagIDs.push(tagid);

          const isworkflowenabled = this._filterService.fetchedBrandData.find(
            (brand: BrandList) =>
              +brand.brandID === checkedticket.mention.brandInfo.brandID
          );

          if (isworkflowenabled.isEnableReplyApprovalWorkFlow) {
            IsEnableReplyApprovalWorkFlow = true;
            IsBrandMakerEnabled = true;
          } else {
            IsEnableReplyApprovalWorkFlow = false;
          }

          if (checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled) {
            TicketAgentWorkFlowEnabled = true;
            IsTicketMakerEnabled = true;
          } else {
            TicketAgentWorkFlowEnabled = false;
          }

          TicketGoingForApproval.push(TicketAgentWorkFlowEnabled);

          if (
            !isAgentHasTeam &&
            prop.userrole === UserRoleEnum.Agent &&
            IsEnableReplyApprovalWorkFlow &&
            (TicketAgentWorkFlowEnabled || prop.agentWorkFlowEnabled)
          ) {
            DirectCloseErrorflag = true;
            DirectCloseErrorTickets.push(ticketid);
          }
        }

        IsEnableReplyApprovalWorkFlow = IsBrandMakerEnabled;
        TicketAgentWorkFlowEnabled = IsTicketMakerEnabled;
      }
    }

    if (DirectCloseErrorflag) {
      const length = DirectCloseErrorTickets.length;
      let tickettext = 'Ticket';
      if (length > 1) {
        tickettext = 'Tickets';
      }
      const ticketids = DirectCloseErrorTickets.join(',');

      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            length +
            tickettext +
            ' {' +
            ticketids +
            '} cannot be direct close as it falls under approval rules and needs to be escalated to a TL. Please contact supervisor to assign a TL to you.',
        },
      });
      return;
    }
    let isTicket = false;
    if (prop.pageType === PostsType.Tickets) {
      isTicket = true;
    }
    const log = [];
    if (prop.action === PerformedAction.DirectClose) {
      log.push(new TicketsCommunicationLog(ClientStatusEnum.Closed));
      const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
      if (closingNote && closingNote?.trim()) {
        log1.Note = closingNote ? closingNote : '';
        log1.NotesAttachment = this.selectedNoteMediaVal;
        log.push(log1);
      }      
    } else if (prop.action === PerformedAction.Approve) {
      log.push(new TicketsCommunicationLog(ClientStatusEnum.Approve));
      // log.push(new TicketsCommunicationLog(ClientStatusEnum.NotesAdded));
      log.push(...notesLog);
    } else if (prop.action === PerformedAction.Reject) {
      log.push(new TicketsCommunicationLog(ClientStatusEnum.Ignore));
      // log.push(new TicketsCommunicationLog(ClientStatusEnum.NotesAdded));
      log.push(...notesLog);
    }
    const sourceobj: any = {
      PerformedAction: prop.action,
      IsTicket: isTicket,
      IsReplyModified: false,
      ActionTaken: 0,
      Tasks: log,
      BulkReplyRequests: BulkObject,
    };
    if (prop.action === PerformedAction.DirectClose && (prop?.isAllMentionUnderTicketId == true || prop?.isAllMentionUnderTicketId == false)) {
      sourceobj.isAllMentionUnderTicketId = prop.isAllMentionUnderTicketId;
    }

    if (dispositionDetails) {
      sourceobj.DispositionID = dispositionDetails?.dispositionId;
      if (
        dispositionDetails?.categoryCards &&
        dispositionDetails?.categoryCards.length > 0
      ) {
        sourceobj.categoryMap = dispositionDetails?.categoryCards;
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
        Note: dispositionDetails?.note,
        NotesAttachment: dispositionDetails?.NoteAttachments,
        Status: ClientStatusEnum.NotesAdded,
        TicketID: 0,
        type: 'CommunicationLog',
      };
      if (sourceobj?.Tasks) {
        sourceobj.Tasks.push(dispositionTask);
      }
      if (sourceobj?.Tasks && (dispositionDetails?.note || (dispositionDetails?.NoteAttachments && dispositionDetails?.NoteAttachments.length > 0))) {
        sourceobj.Tasks.push(noteTask);
      }
      sourceobj.isAutoTicketCategorizationEnabled =
        dispositionDetails?.isAutoTicketCategorizationEnabled;
      sourceobj.showTicketCategory = dispositionDetails?.showTicketCategory;
    }

    if(parentPostComment)
    {
      sourceobj.IsParentPostComment=true
    }

    this.BulkActionAPI(sourceobj, prop.action);
  }

  BulkActionAPI(sourceobj, action): any {
    this.BulkTicketAction(sourceobj).subscribe((data) => {
      if (data.success) {
        let message = '';
        this._ticketService.selectedPostList = [];
        this._ticketService.postSelectTriggerSignal.set(0);
        this._ticketService.bulkMentionChecked = [];
        this._postDetailService.isBulk = false;
        if (action === PerformedAction.DirectClose) {
          this._ticketService.parentbulkActionChange.next(4);
          this._ticketService.bulkUpdateListObs.next({ bulkList: sourceobj.BulkReplyRequests ,guid:this._navigationService.currentSelectedTab.guid})
          message = 'Bulk direct close successfully';
        } else if (action === PerformedAction.Approve) {
          message = 'Bulk approved successfully';
        } else if (action === PerformedAction.Reject) {
          message = 'Bulk reject successfully';
        } else if (action === PerformedAction.OnHoldAgent) {
          message = 'Bulk Onhold successfully';
        } else if (action === PerformedAction.ReopenCase) {
          message = 'Bulk Reopen successfully';
        } else if (action === PerformedAction.Escalate) {
          message = 'Bulk Escalate successfully';
        } else if (action === PerformedAction.Assign) {
          message = 'Bulk Assign successfully';
        }
        // console.log(message, data);
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);
        // this.dialogRef.close(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message,
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data.message,
          },
        });
      }
    });
  }

  MarkActionable(keyObj): Observable<any> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Mention/MarkActionable',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while making mention actionable',
              },
            });
          }
        })
      );
  }

  BulkReplyApproved(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/BulkReplyApproved',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while approving reply',
              },
            });
          }
        })
      );
  }

  BulkReplyRejection(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/BulkReplyRejection',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while rejecting bulk reply',
              },
            });
          }
        })
      );
  }

  getTicketHtmlForEmail(keyObj): Observable<CustomResponse> {
    // ?IsRazor=true
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/GetTicketHtmlForEmail',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
          }
        })
      );
  }

  GetTagAlerEmails(keyObj): Observable<AlertMails[]> {
    return this._http
      .post<AlertMailsResponse>(
        environment.baseUrl + '/Tickets/GetTagAlerEmails',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while getting tag emails',
              },
            });
          }
        })
      );
  }

  forwardReply(keyObj, forwardEmail?:boolean): Observable<CustomResponse> {
    let endPoint = forwardEmail ? '/Tickets/ForwardEmailWithConfiguredAccount' : '/Tickets/ForwardEmail';
    return this._http
      .post<CustomResponse>(
        `${environment.baseUrl}${endPoint}`,
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getLastMentionTime(keyObj): Observable<IApiResponse<any>> {
    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/GetLastMentionTime',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            // this._snackBar.open('Error Occurred while getting mentiontimeApi response', 'Ok', {
            //   duration: 2000
            // });
          }
        })
      );
  }

  ShowHideButtonsFromTicketStatus(currentUser: AuthUser): void {
    let IsCategoryLevelBulkReply = false;
    let IsBrandLevelBulkReply = false;
    const CategoryBrandReplySetting =
      this._filterService.categoryBrandReplySetting;

    if (!CategoryBrandReplySetting) {
      IsCategoryLevelBulkReply = false;
      IsBrandLevelBulkReply = false;
    } else {
      const IsCategoryLevelBulkReplyList = CategoryBrandReplySetting.map(
        (s) => s.isCategoryBulkReplyEnabled
      ).filter(this.onlyUnique);
      if (IsCategoryLevelBulkReplyList) {
        IsCategoryLevelBulkReply = IsCategoryLevelBulkReplyList[0];
      }
      if (!IsCategoryLevelBulkReply) {
        const BulkReplyEnabledBrandIds = CategoryBrandReplySetting.filter(
          (w) => w.isBrandBulkReplyEnabled === true
        ).map((s) => s.brandID);
        if (BulkReplyEnabledBrandIds.length > 0) {
          IsBrandLevelBulkReply = true;
        }
      }
    }
    const allbrands = this._filterService.fetchedBrandData;
    const list = allbrands.filter((x) => x.isBrandworkFlowEnabled === true);

    if (currentUser.data.user.role === UserRoleEnum.CustomerCare) {
      this.bulkActionButtons.btnbulkapprove = true;
      this.bulkActionButtons.btnbulkreject = true;
      this.bulkActionButtons.btnbulkonhold = true;

      if (list && list.length > 0) {
        this.bulkActionButtons.btnbulkescalae = true;
      }
    } else if (currentUser.data.user.role === UserRoleEnum.BrandAccount) {
      if (IsBrandLevelBulkReply || IsCategoryLevelBulkReply) {
        this.bulkActionButtons.btnbulkreply = true;
      }
      this.bulkActionButtons.btnbulkapprove = true;
      this.bulkActionButtons.btnbulkreject = true;
      this.bulkActionButtons.btnbulkonhold = true;
    } else {
      if (
        (currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
          currentUser.data.user.role === UserRoleEnum.LocationManager ||
          currentUser.data.user.role === UserRoleEnum.Agent ||
          currentUser.data.user.role === UserRoleEnum.BrandAccount ||
          currentUser.data.user.role === UserRoleEnum.TeamLead) &&
        (IsBrandLevelBulkReply || IsCategoryLevelBulkReply)
      ) {
        this.bulkActionButtons.btnbulkreply = true;
      }
      this.bulkActionButtons.btnbulkdirectclose = true;
      this.bulkActionButtons.btnbulktagging = true;

      if (
        currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
        currentUser.data.user.role === UserRoleEnum.LocationManager ||
        currentUser.data.user.role === UserRoleEnum.Agent ||
        currentUser.data.user.role === UserRoleEnum.TeamLead
      ) {
        this.bulkActionButtons.btnbulkonhold = true;
        this.bulkActionButtons.btnbulkescalae = true;
        this.bulkActionButtons.btnbulkreopen = true;
      }
    }

    this.bulkActionButtons.btnbulkassign = true;


    const OpenTickets = [];
    const PendingTickets = [];
    const AwaitingTickets = [];
    const ClosedTickets = [];
    const OnHoldTickets = [];
    const AwaitingFromCustomerTickets = [];
    const WithNewMentionsTickets = [];
    const SentForApprovalTickets = [];

    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    for (const checkedticket of SelectedTickets) {
      const TicketID = checkedticket.mention.ticketInfo.ticketID;
      const ticketStatus = checkedticket.mention.ticketInfo.status;
      const WorflowStatus =
        checkedticket.mention.makerCheckerMetadata.workflowStatus;
      if (WorflowStatus === LogStatus.ReplySentForApproval) {
        SentForApprovalTickets.push(TicketID);
      }
      switch (currentUser.data.user.role) {
        case UserRoleEnum.Agent:
        case UserRoleEnum.SupervisorAgent:
        case UserRoleEnum.LocationManager:
        case UserRoleEnum.TeamLead:
          switch (ticketStatus) {
            case TicketStatus.Open:
              OpenTickets.push(TicketID);
              break;
            case TicketStatus.PendingwithCSDWithNewMention:
            case TicketStatus.OnHoldCSDWithNewMention:
            case TicketStatus.PendingWithBrandWithNewMention:
            case TicketStatus.RejectedByBrandWithNewMention:
            case TicketStatus.OnHoldBrandWithNewMention:
              WithNewMentionsTickets.push(TicketID);
              break;
            case TicketStatus.PendingwithCSD:
            case TicketStatus.OnHoldCSD:
            case TicketStatus.PendingWithBrand:
            case TicketStatus.RejectedByBrand:
            case TicketStatus.OnHoldBrand:
              AwaitingTickets.push(TicketID);
              break;
            case TicketStatus.PendingwithAgent:
            case TicketStatus.Rejected:
            case TicketStatus.ApprovedByBrand:
              PendingTickets.push(TicketID);
              break;
            case TicketStatus.Close:
              ClosedTickets.push(TicketID);
              break;
            case TicketStatus.OnHoldAgent:
              OnHoldTickets.push(TicketID);
              break;
            case TicketStatus.CustomerInfoAwaited:
              AwaitingFromCustomerTickets.push(TicketID);
              break;
          }
          break;
        case UserRoleEnum.CustomerCare:
          switch (ticketStatus) {
            case TicketStatus.PendingwithCSD:
            case TicketStatus.RejectedByBrand:
            case TicketStatus.ApprovedByBrand:
              OpenTickets.push(TicketID);
              break;
            case TicketStatus.OnHoldCSD:
              OnHoldTickets.push(TicketID);
              break;
          }
          break;

        case 8:
          switch (ticketStatus) {
            case TicketStatus.PendingWithBrand:
              OpenTickets.push(TicketID);
              break;
            case TicketStatus.OnHoldBrand:
              OnHoldTickets.push(TicketID);
              break;
          }
          break;
        default:
          break;
      }
    }

    this.bulkActionButtons.btnbulkdelete = false;
    this.bulkActionButtons.btnbulkdeletefromchannel = false;
    switch (currentUser.data.user.role) {
      case UserRoleEnum.Agent:
        if (OpenTickets.length > 0) {
          this.bulkActionButtons.btnbulkreopen = false;
          // AgentBulkReopen.hide();
        }
        if (PendingTickets.length > 0) {
          this.bulkActionButtons.btnbulkreopen = false;
          // AgentBulkReopen.hide();
        }
        if (ClosedTickets.length > 0) {
          this.bulkActionButtons.btnbulkdirectclose = false;
          this.bulkActionButtons.btnbulkescalae = false;
          this.bulkActionButtons.btnbulkonhold = false;
          this.bulkActionButtons.btnbulkreply = false;
          this.bulkActionButtons.btnbulkassign = false;
          // AgentBulkDrectClose.hide();
          // AgentBulkEscalate.hide();
          // AgentBulkOnHold.hide();
          // AgentBulkReply.hide();
          // AgentBulkAssign.hide();
        }
        if (OnHoldTickets.length > 0) {
          // AgentBulkOnHold.hide();
          this.bulkActionButtons.btnbulkonhold = false;
        }
        if (AwaitingTickets.length > 0) {
          this.bulkActionButtons.btnbulkescalae = false;
          this.bulkActionButtons.btnbulkassign = false;
          // AgentBulkEscalate.hide();
          // AgentBulkAssign.hide();
        }
        if (WithNewMentionsTickets.length > 0) {
          this.bulkActionButtons.btnbulkdirectclose = false;
          this.bulkActionButtons.btnbulkescalae = false;
          this.bulkActionButtons.btnbulkonhold = false;
          this.bulkActionButtons.btnbulkreply = false;
        }
        if (SentForApprovalTickets.length > 0) {
          this.bulkActionButtons.btnbulkdirectclose = false;
          this.bulkActionButtons.btnbulkescalae = false;
          this.bulkActionButtons.btnbulkonhold = false;
          this.bulkActionButtons.btnbulkreply = false;
          this.bulkActionButtons.btnbulkassign = false;
          this.bulkActionButtons.btnbulkreopen = false;
        }
        break;
      case UserRoleEnum.SupervisorAgent:
      case UserRoleEnum.LocationManager:
      case UserRoleEnum.TeamLead:
        if (OpenTickets.length > 0) {
          // AgentBulkReopen.hide();
          this.bulkActionButtons.btnbulkreopen = false;
        }
        if (PendingTickets.length > 0) {
          // AgentBulkReopen.hide();
          this.bulkActionButtons.btnbulkreopen = false;
        }
        if (ClosedTickets.length > 0) {
          this.bulkActionButtons.btnbulkdirectclose = false;
          this.bulkActionButtons.btnbulkescalae = false;
          this.bulkActionButtons.btnbulkonhold = false;
          this.bulkActionButtons.btnbulkreply = false;
          this.bulkActionButtons.btnbulkassign = false;
        }
        if (OnHoldTickets.length > 0) {
          // AgentBulkOnHold.hide();
          this.bulkActionButtons.btnbulkonhold = false;
        }
        if (AwaitingTickets.length > 0) {
          this.bulkActionButtons.btnbulkescalae = false;
          this.bulkActionButtons.btnbulkassign = false;
        }
        if (WithNewMentionsTickets.length > 0) {
          this.bulkActionButtons.btnbulkdirectclose = false;
          this.bulkActionButtons.btnbulkescalae = false;
          this.bulkActionButtons.btnbulkonhold = false;
          this.bulkActionButtons.btnbulkreopen = false;
          // this.bulkActionButtons.btnbulkassign = false;
        }
        if (SentForApprovalTickets.length > 0) {
          this.bulkActionButtons.btnbulkreply = false;
        }
        break;
      case UserRoleEnum.CustomerCare:
        if (OnHoldTickets.length > 0) {
          this.bulkActionButtons.btnbulkonhold = false;
        }
        break;
      case UserRoleEnum.BrandAccount:
        if (OnHoldTickets.length > 0) {
          this.bulkActionButtons.btnbulkonhold = false;
        }
        break;
      default:
        break;
    }
  }

  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  BulkDelete(keyObj, endpoint?:string): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + `${endpoint ? endpoint :'/Tickets/MentionBulkDelete'}`,
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

  TagTicketCheckbox(currentUser: AuthUser): void {
    const isbrandexcluded = false; // need to come from a checkbox
    let CheckedTickets;
    let checkticketslength;
    if (isbrandexcluded) {
      CheckedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
      const brandpost = CheckedTickets.filter(
        (s) => s.mention.isBrandPost === false
      );
      checkticketslength = brandpost.length;
    } else {
      CheckedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
      checkticketslength = CheckedTickets.length;
    }

    if (
      currentUser.data.user.role === UserRoleEnum.Agent ||
      currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
      currentUser.data.user.role === UserRoleEnum.LocationManager
    ) {
      const PendingwithCSD = [];
      const EscalatedPending = [];
      for (const checkedticket of CheckedTickets) {
        const ticketStatus = checkedticket.mention.ticketInfo.status;
        if (
          ticketStatus === TicketStatus.PendingwithCSD ||
          ticketStatus === TicketStatus.PendingWithBrand ||
          ticketStatus === TicketStatus.RejectedByBrand
        ) {
          PendingwithCSD.push('PendingwithCSD');
        } else if (
          ticketStatus === TicketStatus.PendingwithCSDWithNewMention ||
          ticketStatus === TicketStatus.OnHoldCSDWithNewMention ||
          ticketStatus === TicketStatus.PendingWithBrandWithNewMention ||
          ticketStatus === TicketStatus.RejectedByBrandWithNewMention ||
          ticketStatus === TicketStatus.OnHoldBrandWithNewMention
        ) {
          EscalatedPending.push('Close');
        }
      }

      this.bulkActionButtons.btnbulkreply = true;
      this.bulkActionButtons.btnbulktagging = true;
      if (PendingwithCSD.length > 0) {
        this.bulkActionButtons.btncreatesingleticket = false;
        this.bulkActionButtons.btnattachticketbulk = false;
      } else {
        this.bulkActionButtons.btncreatesingleticket = true;
        this.bulkActionButtons.btnattachticketbulk = true;
      }

      if (EscalatedPending.length > 0) {
        this.bulkActionButtons.btnattachticketbulk = false;
      } else {
        this.bulkActionButtons.btnattachticketbulk = true;
      }
    } else {
      this.bulkActionButtons.btncreatesingleticket = true;
      this.bulkActionButtons.btnattachticketbulk = true;
    }
  }

  GetBrandMentionReadSetting(keyObj): Observable<MentionReadCompulsory> {
    return this._http
      .post<MentionReadCompulsoryResponse>(
        environment.baseUrl + '/Account/GetBrandMentionReadSetting',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            if (this.brandEmailreadInformation.length > 0) {
              const findIndex = this.brandEmailreadInformation.findIndex(
                (obj) => obj.brandId === response.data.brandId
              );
              if (findIndex > -1) {
                this.brandEmailreadInformation =
                  this.brandEmailreadInformation.filter(
                    (obj) => obj.brandId != response.data.brandId
                  );
                this.brandEmailreadInformation.push(response.data);
              } else {
                this.brandEmailreadInformation.push(response.data);
              }
            }
            return response.data;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while getting email brand setting',
              },
            });
          }
        })
      );
  }

  MarkMentionAsRead(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Mention/MarkMentionAsRead',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while setting read flag',
              },
            });
          }
        })
      );
  }

  GetTicketCountDetailForPost(keyObj) {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/GetTicketCountDetailForPost',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          }
        })
      );
  }

  makeTicketActionableOrNonActionable(keyObj) {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/MakeTicketNonActionable',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          }
        })
      );
  }
  checkTweetExists(keyObj) {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Mention/CheckIfTweetExists',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  logAutoMatedCannedReply(keyObj) {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/LogAutoCannedReply',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getMMTLink(keyObj) {
    return this._http
      .post<any>(
        environment.baseUrl + '/ResponseManagement/PlaystoreFeedbackLink',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getAutoCannedResponseStatus(keyObj) {
    return this._http
      .post<any>(
        environment.baseUrl + '/AutoCannedResponse/GetAutoCannedResponseStatus',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetCrmCsdUserId(crmName: string) {
    return this._http
      .post<any>(
        environment.baseUrl + `/CRM/GetCrmCsdUserId?CrmClassName=${crmName}`,
        {}
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetEmailOutgoingSetting(obj: any) {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + `/Account/GetEmailOutgoingSetting`,
        obj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getDispositionDetails(obj: any) {
    return this._http
      .post<any>(
        environment.baseUrl + `/TicketDisposition/GetDispositionDetails`,
        obj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  GetAISuggestedCategory(data): Observable<any> {
    return this._http
      .post<any>(
        `${environment.baseUrl}/TicketDisposition/GetAISuggestedCategory`,
        data
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  selectNoteMediaVal(media:UgcMention[]) {
    let noteAttachments: NoteMedia[] = [];
    if (media?.length > 0) {
      media.forEach((obj:UgcMention) => {
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
    this.selectedNoteMediaVal = noteAttachments && noteAttachments?.length > 0 ?  noteAttachments : null;
  }


  logForFoulKeyword(keyObj): Observable<any> {
    return this._http
      .post<any>(
        environment.baseUrl + '/Tickets/Logforfoulkeyword',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
