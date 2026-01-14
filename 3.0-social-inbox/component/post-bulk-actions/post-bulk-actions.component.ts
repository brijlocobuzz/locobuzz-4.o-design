import {
  ChangeDetectorRef,
  Component,
  effect,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
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
import { notificationType } from 'app/core/enums/notificationType';
import { PerformedAction } from 'app/core/enums/PerformedAction';
import { SsreIntent } from 'app/core/enums/SsreIntentEnum';
import { SSRELogStatus } from 'app/core/enums/SSRELogStatus';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { BulkActionButtons } from 'app/core/interfaces/BulkTicketActions';
import { AuthUser } from 'app/core/interfaces/User';
import { BulkOperationObject } from 'app/core/models/dbmodel/BulkOperationObject';
import { TicketsCommunicationLog } from 'app/core/models/dbmodel/TicketReplyDTO';
import { CreateAttachMultipleMentionParam } from 'app/core/models/viewmodel/CreateAttachMultipleMentionParam';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { PostAssignToService } from 'app/social-inbox/services/post-assignto.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink/dist/subsink';
import { AttachTicketComponent } from '..';
import { BrandList } from '../../../shared/components/filter/filter-models/brandlist.model';
import { CategoryFilterComponent } from '../category-filter/category-filter.component';
import { PostAssigntoComponent } from '../post-assignto/post-assignto.component';
import { PostReplyComponent } from '../post-reply/post-reply.component';
import { TicketDispositionComponent, ticketDispositionList } from '../ticket-disposition/ticket-disposition.component';
import { ClickhouseBulkPopupComponent } from 'app/social-inbox/clickhouse-bulk-popup/clickhouse-bulk-popup.component';
import { SidebarService } from 'app/core/services/sidebar.service';
import { AllMentionGroupView } from 'app/shared/components/post-options/post-options.component';
import { TabService } from 'app/core/services/tab.service';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { AiTicketTagService } from 'app/accounts/services/ai-ticket-tag.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-post-bulk-actions',
    templateUrl: './post-bulk-actions.component.html',
    styleUrls: ['./post-bulk-actions.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class PostBulkActionsComponent implements OnInit, OnDestroy {
  @ViewChildren('onholdnote') onholdnote: MatMenuTrigger;
  @ViewChild('bulkreopennote') bulkreopennote: MatMenuTrigger;
  @ViewChild('bulkreplyrejectnote') bulkreplyrejectnote: MatMenuTrigger;
  @ViewChild('clickBulkTicketMenuTrigger')
  clickBulkTicketMenuTrigger: MatMenuTrigger;
  postCount: number = this._ticketService.selectedPostList.length;
  @Input() pageType: PostsType;
  @Input() postDetailTab: LocobuzzTab;
  @Output() bulkActionEvent = new EventEmitter<string>();
  @Output() postActionTypeEvent = new EventEmitter<any>();
  @Input() bulkActionPositionLevel: number = 0;
  @Input() ticketsFound:number = 0 ;
  @Input() mentionOrGroupView: AllMentionGroupView = AllMentionGroupView.mentionView;
  @Input() ticketList:BaseMention[]=[]
  activityType: number;
  AllMentionGroupViewEnum = AllMentionGroupView
  currentUser: AuthUser;
  bulkActionbtn: BulkActionButtons = {};
  private posttriggersubscription: Subscription;
  rejectnote: string = '';
  reopennote: string = '';
  holdnote: string = '';
  approvenote: string ='';
  ticketRejectednote: string = '';
  createticketnote: string = '';
  closingNote: string = '';
  createTicketStatus = 0;
  isexcludebrandmention = false;
  showexcludemention = false;
  subs = new SubSink();
  allowAssignement: boolean;
  ticketEscalationEnabled: boolean;
  replyEnabled: boolean;
  assignMentionORTagCategoryEnabled: boolean;
  createNewTicketEnabled: boolean;
  deleteLocobuzzEnabled: boolean;
  ticketsCheckBoxCount: number;
  dispositionDetails: any;
  ticketDispositionList: ticketDispositionList[] = [];
  clickhouseEnabled: boolean=false;
  showSelected:boolean=true;
  selectedAllMentions:boolean=false;
  showQualifiedOption: boolean=false;
  selectAllBulk:boolean = false
  selectedTicketBrandId: number[] = [];
  showMarkAsSeen: boolean = false;
  showMarkAsUnSeen: boolean = false;
  reopenEnabled: boolean;
  isAITicketTagEnabled: boolean = false;
  isfullThreadSelected: boolean = false;
   filterObj :any
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
  defaultLayout: boolean = false;
  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _replyService: ReplyService,
    private _navigationService: NavigationService,
    private _accountService: AccountService,
    private _filterService: FilterService,
    private _postDetailService: PostDetailService,
    private _bottomSheet: MatBottomSheet,
    private _ticketService: TicketsService,
    private _dialog: MatDialog,
    private _postAssignToService: PostAssignToService,
    private MapLocobuzz: MaplocobuzzentitiesService,
    private _footService: FootericonsService,
    private sidebarService:SidebarService,
    private _mapLocobuzz: MaplocobuzzentitiesService,
    private _cdr:ChangeDetectorRef,
    private _tabService:TabService,
    private _aiTicketTagService: AiTicketTagService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {
    let onLoadSelectTrigger = true;

    effect(() => {
      const value = this._ticketService.postSelectTriggerSignal();
      if (!onLoadSelectTrigger){
        this.postSelectTriggerSignalChanges(value);
      }else {
        onLoadSelectTrigger = false;
      }
    }, { allowSignalWrites: true });

    let onLoadMention = true;
    effect(() => {
      const value = this._ticketService.unselectedMentionSignal();
      if (!onLoadMention && value) {
        if (this.clickhouseEnabled) {
          this.selectAllBulk = false;
        }
      } else {
        onLoadMention = false;
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    if (this.pageType === PostsType.TicketHistory) {
      this.showexcludemention = true;
    }
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    const isexcludebrandmention = localStorage.getItem(
      'isexcludebrandmention_' + this.currentUser.data.user.userId
    );
    if (isexcludebrandmention === '1') {
      this.isexcludebrandmention = true;
    } else {
      this.isexcludebrandmention = false;
    }
    const valuePostSelectTriggerSignal = this._ticketService.postSelectTriggerSignal();
    this.postSelectTriggerSignalChanges(valuePostSelectTriggerSignal);
    // this.subs.add(
    //   this._ticketService.postSelectTrigger.subscribe((count) => {
    //     this.postCount = count;
    //     this.bulkActionbtn = this._replyService.bulkActionButtons;
    //     if (this.postCount == this.ticketsFound) {
    //       if (this.clickhouseEnabled) {
    //       this.selectAllBulk = true
    //       }
    //     }
    //     this.ticketsCheckBoxCount = this.getTicketsCheckboxCount();
    //     if (this.postCount === 0) {
    //       this.bulkAction('hideactionpanel');
    //     }
    //     if (this._ticketService.bulkMentionChecked && this._ticketService.bulkMentionChecked.length) {
    //       const isExist = this._ticketService.bulkMentionChecked.some(x => x.mention.channelGroup == ChannelGroup.Yotpo || x.mention.channelGroup == ChannelGroup.Survey);
    //       if (isExist) {
    //         this.bulkActionbtn.btnbulkreply = false;
    //       }

    //       const isDeleteFromChannel = this._ticketService.bulkMentionChecked.some(x => !x.mention.isDeleteFromChannel);
    //       if (isDeleteFromChannel) {
    //         this.bulkActionbtn.btnbulkdeletefromchannel = false;
    //       } else {
    //         this.bulkActionbtn.btnbulkdeletefromchannel = true;
    //       }

    //       this.showMarkAsSeen = this._ticketService.bulkMentionChecked.some(x => x.mention?.mentionMetadata?.isMarkSeen == 0 || (x.mention?.mentionMetadata?.isMarkSeen == 1 && x.mention?.mentionMetadata?.unseencount > 0))
    //       this.showMarkAsUnSeen = this._ticketService.bulkMentionChecked.some(x => x.mention?.mentionMetadata?.isMarkSeen == 1 && x.mention?.mentionMetadata?.unseencount==0)
    //     }
    //   })
    // );

    this.subs.add(
      this._ticketService.excludepostSelectTrigger.subscribe((count) => {
        if (count > 0) {
          this.postCount = count;
          this._ticketService.excludepostSelectTrigger.next(0);
        }
      })
    );

    this.subs.add(
      this._replyService.ticketBulkOptionUpdate.subscribe((res) => {
        if (res) {
          this.bulkActionbtn = this._replyService.bulkActionButtons;
        }
      })
    );

    this.allowAssignement =
      this.currentUser.data.user.role == UserRoleEnum.Agent ? this.currentUser.data.user.actionButton.assignmentEnabled: this.currentUser.data.user.actionButton.allowAssignment;
    this.ticketEscalationEnabled =
      this.currentUser?.data?.user?.actionButton?.ticketEscalationEnabled;
    this.replyEnabled =
      this.currentUser?.data?.user?.actionButton?.replyEnabled;
    this.assignMentionORTagCategoryEnabled =
      this.currentUser?.data?.user?.actionButton?.assignMentionEnabled;
    this.createNewTicketEnabled =
      this.currentUser?.data?.user?.actionButton?.createNewTicketEnabled;
    this.deleteLocobuzzEnabled =
      this.currentUser?.data?.user?.actionButton?.deleteLocobuzzEnabled;
    this.reopenEnabled = this.currentUser?.data?.user?.actionButton?.ticketReopenEnabled;

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM)
      {
        this.bulkActionbtn.btnbulkreply=false;
        this.bulkActionbtn.btnbulkapprove = false;
        this.bulkActionbtn.btnbulkreject = false;
        this.bulkActionbtn.btnbulkonhold = false;
        this.bulkActionbtn.btnbulkescalae = false;
        this.bulkActionbtn.btnbulkassign = false;
        this.bulkActionbtn.btnbulkreopen = false;
        this.bulkActionbtn.btnbulkreplyapproved = false;
        this.bulkActionbtn.btncreatesingleticket = false;
        this.bulkActionbtn.btnattachticketbulk = false;
        // this.bulkActionbtn.btnbulkdelete = false;
        this.bulkActionbtn.btnbulkdirectclose = false;
      if (this.currentUser?.data?.user?.isClickhouseEnabled==1)
      {
        this.clickhouseEnabled =true;
      }
      }

    /* this.subs.add(
      this._ticketService.unselectedMention.subscribe((res)=>{
        if(res)
        {
          if(this.clickhouseEnabled)
          {
          this.selectAllBulk =false;
          }
        }
      })
    ) */
    this.getStartDateAndEndDate()

    //get if it is User Activity or Brand Activity
    this._filterService.setHighlightedMentionItem.subscribe((tickettype) => {
      this.activityType = tickettype;
      // Use the tickettype value here tickettype 1 = Brand Activity, 2 = User Activity
      // console.log('Received tickettype:', tickettype);
    });
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }

  postSelectTriggerSignalChanges(count){
    this.postCount = count;
    this.bulkActionbtn = this._replyService.bulkActionButtons;
    if (this.postCount == this.ticketsFound) {
      if (this.clickhouseEnabled) {
        this.selectAllBulk = true
      }
    }
    this.ticketsCheckBoxCount = this.getTicketsCheckboxCount();
    if (this.postCount === 0) {
      this.bulkAction('hideactionpanel');
    }
    if (this._ticketService.bulkMentionChecked && this._ticketService.bulkMentionChecked.length) {
      const isExist = this._ticketService.bulkMentionChecked.some(x => x.mention.channelGroup == ChannelGroup.Yotpo || x.mention.channelGroup == ChannelGroup.Survey || x.mention.channelGroup == ChannelGroup.Voice);
      if (isExist) {
        this.bulkActionbtn.btnbulkreply = false;
      }

      const isDeleteFromChannel = this._ticketService.bulkMentionChecked.some(x => !x.mention.isDeleteFromChannel);
      if (isDeleteFromChannel) {
        this.bulkActionbtn.btnbulkdeletefromchannel = false;
      } else {
        this.bulkActionbtn.btnbulkdeletefromchannel = true;
      }

      this.showMarkAsSeen = this._ticketService.bulkMentionChecked.some(x => x.mention?.mentionMetadata?.isMarkSeen == 0 || (x.mention?.mentionMetadata?.isMarkSeen == 1 && x.mention?.mentionMetadata?.unseencount > 0))
      this.showMarkAsUnSeen = this._ticketService.bulkMentionChecked.some(x => x.mention?.mentionMetadata?.isMarkSeen == 1 && x.mention?.mentionMetadata?.unseencount == 0)
    }
  }

  ngOnDestroy(): void {
    this.bulkAction('hideactionpanel');
    this._ticketService.selectedPostList = [];
    this._ticketService.postSelectTriggerSignal.set(0);
    this._ticketService.bulkMentionChecked = [];
    this.subs.unsubscribe();
  }

  bulkAction(actionType, dispositionFlag = false): void {
    // this.onholdnote.closeMenu();
    if (actionType === 'approve') {
      if(this.approvenote.trim().length == 0 && this._replyService.selectedNoteMediaVal.length == 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Please-add-note'),
          },
        });
        return;
      }
      const logs = [];
      const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
      if (this.approvenote.trim()) {
        log1.Note = this.approvenote ? this.approvenote : '';
      }
      if (this._replyService?.selectedNoteMediaVal && this._replyService?.selectedNoteMediaVal.length > 0) {
        log1.NotesAttachment = this._replyService?.selectedNoteMediaVal;
      }
      logs.push(log1);
      let message = '';
      let IsCSDUser = false;

      const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );

      const SelectedTicketsReplyInitiated = SelectedTickets.map(
        (s) => s.mention.replyInitiated
      ).filter(this.onlyUnique);
      if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
        message = this.translate.instant('Previous-request-pending-for-this-ticket');
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: message,
          },
        });
        return;
      }

      if (+this.currentUser.data.user.role === UserRoleEnum.CustomerCare) {
        IsCSDUser = true;
      }
      if (IsCSDUser) {
        message = this.translate.instant('Selected-tickets-have-brand-workflow');
      } else {
        message = this.translate.instant('Approve-selected-tickets');
      }
      const dialogData = new AlertDialogModel(message, '', 'Continue');
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          const prop = {
            action: PerformedAction.Approve,
            guid: this._navigationService.currentSelectedTab.guid,
            currentteamid: +this.currentUser.data.user.teamID,
            userrole: +this.currentUser.data.user.role,
            pageType: this.pageType,
            agentWorkFlowEnabled:
              this.currentUser.data.user.agentWorkFlowEnabled,
          };
          this._replyService.ConfirmBulkTicketAction(prop, null, false, logs);
          // this.BulkTicketAction(PerformedAction.Approve);
        } else {
        }
      });
    } else if (actionType === 'ignore') {
      if (this.ticketRejectednote.trim().length == 0 && this._replyService.selectedNoteMediaVal.length == 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Please-add-note'),
          },
        });
        return;
      }
      const logs = [];
      const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
      if (this.ticketRejectednote.trim()) {
        log1.Note = this.ticketRejectednote ? this.ticketRejectednote : '';
      }
      if (this._replyService?.selectedNoteMediaVal && this._replyService?.selectedNoteMediaVal.length > 0) {
        log1.NotesAttachment = this._replyService?.selectedNoteMediaVal;
      }
      logs.push(log1);
      let message = '';
      let IsCSDUser = false;
      const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );

      const SelectedTicketsReplyInitiated = SelectedTickets.map(
        (s) => s.mention.replyInitiated
      ).filter(this.onlyUnique);
      if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
        message = this.translate.instant('Previous-request-pending-for-this-ticket');
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: message,
          },
        });
        return;
      }

      if (+this.currentUser.data.user.role === UserRoleEnum.CustomerCare) {
        IsCSDUser = true;
      }
      if (IsCSDUser) {
        message = this.translate.instant('Selected-tickets-have-brand-workflow');
      } else {
        message = this.translate.instant('Reject-selected-tickets');
      }
      const dialogData = new AlertDialogModel(message, '', 'Continue');
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          const prop = {
            action: PerformedAction.Reject,
            guid: this._navigationService.currentSelectedTab.guid,
            currentteamid: +this.currentUser.data.user.teamID,
            userrole: +this.currentUser.data.user.role,
            pageType: this.pageType,
            agentWorkFlowEnabled:
              this.currentUser.data.user.agentWorkFlowEnabled,
          };
          // this._replyService.ConfirmBulkTicketAction(prop);
          this._replyService.ConfirmBulkTicketAction(prop, null, false, logs);
          //this.BulkTicketAction(PerformedAction.Reject);
        } else {
        }
      });
    } else if (actionType === 'assign') {
      this.ShowUserPopupForAssignTickets();
    } else if (actionType === 'hold') {
      const ValidationData = this.ValidateTicketsToBeOnHold();
      if (ValidationData.IsValid) {
        // show onhold popup
        this.onholdnote.openMenu();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: ValidationData.Message,
          },
        });
      }
    } else if (actionType === 'reject') {
      const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );

      const SelectedTicketsReplyInitiated = SelectedTickets.map(
        (s) => s.mention.replyInitiated
      ).filter(this.onlyUnique);
      if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Previous-request-pending-for-this-ticket'),
          },
        });
      } else {
        this.bulkreplyrejectnote.openMenu();
      }
    } else if (actionType === 'escalate') {
      this.checkAllEmailMentionRead('escalate')
    } else if (actionType === 'reopen') {
      const ValidationData = this.ValidateTicketsToBeReopened();
      if (ValidationData.IsValid) {
        // show reopen notes
        this.bulkreopennote.openMenu();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: ValidationData.Message,
          },
        });
      }
    } else if (actionType === 'reply') {
      this.ShowBulkReplyPreview();
    } else if (actionType === 'close') {
      this.checkAllEmailMentionRead('direct close', dispositionFlag);
    } else if (actionType === 'closeWithNote') {
      if (this.closingNote.trim().length == 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-enter-note-before-closing'),
          },
        });
      }
      else{
      this.checkAllEmailMentionRead('direct close', dispositionFlag);
      }
    } else if (actionType === 'tagcategory') {
     this.GetBulkTagggingCategoryFromOutSide();
    } else if (actionType === 'delete') {
      if (this.selectAllBulk && this.clickhouseEnabled) {
        this.deleteAllQualifiedCategory();
      }else{
      const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );

      const SelectedTicketsReplyInitiated = SelectedTickets.map(
        (s) => s.mention.replyInitiated
      ).filter(this.onlyUnique);
      if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Previous-request-pending-for-this-ticket'),
          },
        });
      } else {
        const IsReadList = SelectedTickets.filter(
          (s) => s.mention.allMentionInThisTicketIsRead === false
        );
        const IsEmailChannel = SelectedTickets.some(
          (s) => s.mention.channelGroup === ChannelGroup.Email
        );
        if (IsEmailChannel && IsReadList.length > 0) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Read-all-mentions-before-delete'),
            },
          });
        } else {
          const message = '';
          const dialogData = new AlertDialogModel(
            this.translate.instant('Delete-selected-mentions-from-tool'),
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
              this.bulkdelete();
            } else {
              // this.ssreLiveWrongDelete();
            }
          });
        }
      }
    }
    } else if (actionType === 'deletefromchannel') {
      // if (this.selectAllBulk && this.clickhouseEnabled) {
      //   this.deleteAllQualifiedCategory();
      // }else{
      const message = this.translate.instant('Action-may-take-5-minutes');
      const dialogData = new AlertDialogModel(
        this.translate.instant('Delete-selected-posts-from-social-media'),
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
              this.bulkdeletefromchannel();
            }
          });
        
    // }
    }
    this.bulkActionEvent.emit(actionType);
}

  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  GetBulkDirectClose(dispositionFlag): void {
    const ValidationData = this.ValidateTicketsToBeClosed();
    if (ValidationData.IsValid) {
      const qualifiedforapproval = [];
      let isticketagentworkflowenabled = false;
      const GoingForApproval = [];
      let TotalTickets = 0;
      const qualifiedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
      TotalTickets = qualifiedTickets.length;
      if (qualifiedTickets.length > 0) {
        for (const checkedticket of qualifiedTickets) {
          isticketagentworkflowenabled =
            checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled;

          const isworkflowenabled = this._filterService.fetchedBrandData.find(
            (brand: BrandList) =>
              +brand.brandID === checkedticket.mention.brandInfo.brandID
          );
          if (
            +this.currentUser.data.user.role === UserRoleEnum.Agent &&
            isworkflowenabled.isEnableReplyApprovalWorkFlow &&
            (this.currentUser.data.user.agentWorkFlowEnabled ||
              isticketagentworkflowenabled)
          ) {
            qualifiedforapproval.push(checkedticket);
            GoingForApproval.push(isticketagentworkflowenabled);
          }
        }

        if (GoingForApproval.length > 0) {
          const brandinfo = this._filterService.fetchedBrandData?.find(
            (brand: BrandList) =>
              +brand.brandID === qualifiedTickets[0]?.mention?.brandInfo?.brandID
          );
          if (brandinfo?.aiTagEnabled) {
            const dialogData = new AlertDialogModel(
              `${GoingForApproval.length} of ${TotalTickets} tickets are qualified for bulk Direct Close`,
              '',
              'Continue'
            );
            dialogData.bulkClose = true;
            const dialogRef = this.dialog.open(AlertPopupComponent, {
              disableClose: true,
              autoFocus: false,
              data: dialogData,
            });
            dialogRef.afterOpened().subscribe(() => {
              dialogRef.componentInstance?.bulkContinue?.subscribe(() => {
                this.GenerateClosingTicket().then(() => {
                  if (dialogRef?.componentInstance) {
                    dialogRef?.componentInstance?.setLoading(false);
                  }
                  dialogRef.close(true);
                  this.directCloseCommonFunc(dispositionFlag, qualifiedforapproval);
                })
              })
            })
          } else {
            const dialogData = new AlertDialogModel(
              `${GoingForApproval.length} of ${TotalTickets} tickets are qualified for bulk Direct Close`,
              '',
              'Continue'
            );
            const dialogRef = this.dialog.open(AlertPopupComponent, {
              disableClose: true,
              autoFocus: false,
              data: dialogData,
            });
            dialogRef.afterClosed().subscribe((dialogResult) => {
              if (dialogResult) {
                this.directCloseCommonFunc(dispositionFlag, qualifiedforapproval);
                // const prop = {
                //   action: PerformedAction.DirectClose,
                //   guid: this._navigationService.currentSelectedTab.guid,
                //   currentteamid: +this.currentUser.data.user.teamID,
                //   userrole: +this.currentUser.data.user.role,
                //   pageType: this.pageType,
                //   agentWorkFlowEnabled:
                //     this.currentUser.data.user.agentWorkFlowEnabled,
                // };
                // this._replyService.ConfirmBulkTicketAction(prop);
              } else {
              }
            });
          }
        } 
        else {
          const brandinfo = this._filterService.fetchedBrandData?.find(
            (brand: BrandList) =>
              +brand.brandID === qualifiedTickets[0]?.mention?.brandInfo?.brandID
          );
          if (brandinfo?.aiTagEnabled) {
            const dialogData = new AlertDialogModel(
              `Are you sure to close selected tickets?`,
              '',
              'Continue'
            );
            dialogData.bulkClose = true;
            const dialogRef = this.dialog.open(AlertPopupComponent, {
              disableClose: true,
              autoFocus: false,
              data: dialogData,
            });
            dialogRef.afterOpened().subscribe(() => {
              dialogRef.componentInstance?.bulkContinue?.subscribe(() => {
                const brandInfo = this._filterService.fetchedBrandData.find(
                  (obj) => obj.brandID == qualifiedTickets[0].mention.brandInfo.brandID
                );
                this.GenerateClosingTicket().then(() => {
                  if (dialogRef?.componentInstance) {
                    dialogRef?.componentInstance?.setLoading(false);
                  }
                  dialogRef.close(true);
                  const obj = {
                    CategoryGroupID: brandInfo.categoryGroupID,
                    CategoryGroupName: brandInfo.categoryName,
                  };
                  this._replyService.getDispositionDetails(obj).subscribe((res) => {
                    if (res.success) {
                      this.ticketDispositionList = res.data.ticketDispositionList;
                      this.directCloseCommonFunc(dispositionFlag, qualifiedTickets);
                    }
                    else {
                      this.directCloseCommonFunc(dispositionFlag, qualifiedTickets);
                    }
                  }, (error) => {
                    if (dialogRef?.componentInstance) {
                      dialogRef?.componentInstance?.setLoading(false);
                    }
                    dialogRef.close(true);
                    this._snackBar.openFromComponent(CustomSnackbarComponent, {
                      duration: 5000,
                      data: {
                        type: notificationType.Error,
                        message: error,
                      },
                    });
                  });
                })
              })
            })
          } else {
            const dialogData = new AlertDialogModel(
              `Are you sure to close selected tickets?`,
              '',
              'Continue'
            );
            const dialogRef = this.dialog.open(AlertPopupComponent, {
              disableClose: true,
              autoFocus: false,
              data: dialogData,
            });
            dialogRef.afterClosed().subscribe((dialogResult) => {
              if (dialogResult) {
                const brandInfo = this._filterService.fetchedBrandData?.find(
                  (obj) => obj.brandID == qualifiedTickets[0]?.mention?.brandInfo?.brandID
                );
                if (brandInfo) {
                  const obj = {
                    CategoryGroupID: brandInfo.categoryGroupID,
                    CategoryGroupName: brandInfo.categoryName,
                  };
                  this._replyService.getDispositionDetails(obj).subscribe((res) => {
                    if (res.success) {
                      this.ticketDispositionList = res.data.ticketDispositionList;
                      this.directCloseCommonFunc(dispositionFlag, qualifiedTickets);
                    } 
                    else {
                      this.directCloseCommonFunc(dispositionFlag, qualifiedTickets);
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
                // this.directCloseCommonFunc(dispositionFlag, qualifiedTickets);
                // const prop = {
                //   action: PerformedAction.DirectClose,
                //   guid: this._navigationService.currentSelectedTab.guid,
                //   currentteamid: +this.currentUser.data.user.teamID,
                //   userrole: +this.currentUser.data.user.role,
                //   pageType: this.pageType,
                //   agentWorkFlowEnabled:
                //     this.currentUser.data.user.agentWorkFlowEnabled,
                // };
                // this._replyService.ConfirmBulkTicketAction(prop);
              } 
              else {
              }
            });
          }
        }
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: ValidationData.Message,
        },
      });
    }
  }

  ValidateTicketsToBeClosed(): any {
    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    let IsValid = false;
    let Message = '';

    // const IsEmailChannel = SelectedTickets.filter(
    //   (s) => s.mention.channelGroup === ChannelGroup.Email
    // );
    // const IsNotReadList = SelectedTickets.filter(
    //   (s) => s.mention.allMentionInThisTicketIsRead === false
    // );
    // if (IsEmailChannel.length > 0 && IsNotReadList.length > 0) {
    //   IsValid = false;
    //   Message =
    //     'Please read all the mentions before performing bulk direct close action';
    //   return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
    // }

    // for (const checkedticket of SelectedTickets) {
    //   if (checkedticket.mention.isSSRE
    //     && checkedticket.mention.ticketInfoSsre.ssreIntent === SsreIntent.NoActionTaken
    //     && checkedticket.mention.ticketInfoSsre.ssreStatus === SSRELogStatus.Successful) {
    //     SelectedMentionOrSSRETicket.push(true);
    //   }
    //   SelectedMentionOrTicketAlreadyInitiated.push(checkedticket.mention.replyInitiated);
    // }

    if (
      +this.currentUser.data.user.role === UserRoleEnum.Agent ||
      +this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
      +this.currentUser.data.user.role === UserRoleEnum.LocationManager ||
      +this.currentUser.data.user.role === UserRoleEnum.TeamLead ||
      +this.currentUser.data.user.role === UserRoleEnum.BrandAccount
    ) {
      const SelectedTicketsStatus = SelectedTickets.map(
        (s) => s.mention.ticketInfo.status
      ).filter(this.onlyUnique);

      switch (+this.currentUser.data.user.role) {
        case UserRoleEnum.Agent:
        case UserRoleEnum.SupervisorAgent:
        case UserRoleEnum.TeamLead:
          if (
            SelectedTicketsStatus.indexOf(1) >= 0 ||
            SelectedTicketsStatus.indexOf(3) >= 0 ||
            SelectedTicketsStatus.indexOf(6) >= 0 ||
            SelectedTicketsStatus.indexOf(8) >= 0 ||
            SelectedTicketsStatus.indexOf(11) >= 0 ||
            SelectedTicketsStatus.indexOf(12) >= 0 ||
            SelectedTicketsStatus.indexOf(13) >= 0 ||
            SelectedTicketsStatus.indexOf(14) >= 0 ||
            SelectedTicketsStatus.indexOf(15) >= 0 ||
            SelectedTicketsStatus.indexOf(16) >= 0
          ) {
            IsValid = false;
            Message = this.translate.instant('Select-open-approved-customer');
          } else {
            IsValid = true;
            Message = '';
          }
          break;
        case UserRoleEnum.BrandAccount:
          if (
            SelectedTicketsStatus.indexOf(0) >= 0 ||
            SelectedTicketsStatus.indexOf(1) >= 0 ||
            SelectedTicketsStatus.indexOf(2) >= 0 ||
            SelectedTicketsStatus.indexOf(3) >= 0 ||
            SelectedTicketsStatus.indexOf(4) >= 0 ||
            SelectedTicketsStatus.indexOf(5) >= 0 ||
            SelectedTicketsStatus.indexOf(6) >= 0 ||
            SelectedTicketsStatus.indexOf(7) >= 0 ||
            SelectedTicketsStatus.indexOf(9) >= 0 ||
            SelectedTicketsStatus.indexOf(10) >= 0 ||
            SelectedTicketsStatus.indexOf(12) >= 0 ||
            SelectedTicketsStatus.indexOf(13) >= 0 ||
            SelectedTicketsStatus.indexOf(14) >= 0 ||
            SelectedTicketsStatus.indexOf(15) >= 0 ||
            SelectedTicketsStatus.indexOf(16) >= 0
          ) {
            IsValid = false;
            Message = this.translate.instant('Select-onhold-escalated-tickets');
          } else {
            IsValid = true;
            Message = '';
          }
          break;
        default:
          IsValid = false;
          Message = this.translate.instant('Not-authorized-direct-close');
          break;
      }
    } else {
      IsValid = false;
      Message = this.translate.instant('Not-authorized-direct-close');
    }

    const SelectedTicketsReplyInitiated = SelectedTickets.map(
      (s) => s.mention.replyInitiated
    ).filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      IsValid = false;
      Message = this.translate.instant('Previous-request-pending-for-this-ticket');
    }

    return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
  }

  ValidateTicketsToBeOnHold(): any {
    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    let IsValid = false;
    let Message = '';

    // const IsEmailChannel = SelectedTickets.filter(
    //   (s) => s.mention.channelGroup === ChannelGroup.Email
    // );
    // const IsNotReadList = SelectedTickets.filter(
    //   (s) => s.mention.allMentionInThisTicketIsRead === false
    // );
    // if (IsEmailChannel.length > 0 && IsNotReadList.length > 0) {
    //   IsValid = false;
    //   Message =
    //     'Please read all the mentions before performing bulk onhold action';

    //   return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
    // }

    if (
      +this.currentUser.data.user.role === UserRoleEnum.Agent ||
      +this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
      +this.currentUser.data.user.role === UserRoleEnum.LocationManager ||
      +this.currentUser.data.user.role === UserRoleEnum.TeamLead ||
      +this.currentUser.data.user.role === UserRoleEnum.BrandAccount ||
      +this.currentUser.data.user.role === UserRoleEnum.CustomerCare
    ) {
      if (SelectedTickets.length > 1 && SelectedTickets.length <= 50) {
        const SelectedTicketsStatus = SelectedTickets.map(
          (s) => s.mention.ticketInfo.status
        ).filter(this.onlyUnique);

        switch (+this.currentUser.data.user.role) {
          case UserRoleEnum.Agent:
          case UserRoleEnum.SupervisorAgent:
          case UserRoleEnum.LocationManager:
          case UserRoleEnum.TeamLead:
            if (
              SelectedTicketsStatus.indexOf(1) >= 0 ||
              SelectedTicketsStatus.indexOf(3) >= 0 ||
              SelectedTicketsStatus.indexOf(5) >= 0 ||
              SelectedTicketsStatus.indexOf(6) >= 0 ||
              SelectedTicketsStatus.indexOf(8) >= 0 ||
              SelectedTicketsStatus.indexOf(11) >= 0 ||
              SelectedTicketsStatus.indexOf(12) >= 0 ||
              SelectedTicketsStatus.indexOf(13) >= 0 ||
              SelectedTicketsStatus.indexOf(14) >= 0 ||
              SelectedTicketsStatus.indexOf(16) >= 0
            ) {
              IsValid = false;
              Message = this.translate.instant('Select-tickets-status-open-approved-rejected');
            } else {
              IsValid = true;
              Message = '';
            }
            break;
          case UserRoleEnum.CustomerCare:
            if (
              SelectedTicketsStatus.indexOf(3) >= 0 ||
              SelectedTicketsStatus.indexOf(5) >= 0 ||
              SelectedTicketsStatus.indexOf(6) >= 0 ||
              SelectedTicketsStatus.indexOf(8) >= 0 ||
              SelectedTicketsStatus.indexOf(11) >= 0 ||
              SelectedTicketsStatus.indexOf(12) >= 0 ||
              SelectedTicketsStatus.indexOf(13) >= 0 ||
              SelectedTicketsStatus.indexOf(14) >= 0 ||
              SelectedTicketsStatus.indexOf(16) >= 0
            ) {
              IsValid = false;
              Message = this.translate.instant('Select-tickets-status-escalated-rejected');
            } else {
              IsValid = true;
              Message = '';
            }
            break;
          case UserRoleEnum.BrandAccount:
            if (
              SelectedTicketsStatus.indexOf(1) >= 0 ||
              SelectedTicketsStatus.indexOf(3) >= 0 ||
              SelectedTicketsStatus.indexOf(5) >= 0 ||
              SelectedTicketsStatus.indexOf(6) >= 0 ||
              SelectedTicketsStatus.indexOf(11) >= 0 ||
              SelectedTicketsStatus.indexOf(12) >= 0 ||
              SelectedTicketsStatus.indexOf(13) >= 0 ||
              SelectedTicketsStatus.indexOf(14) >= 0 ||
              SelectedTicketsStatus.indexOf(15) >= 0 ||
              SelectedTicketsStatus.indexOf(16) >= 0
            ) {
              IsValid = false;
              Message = this.translate.instant('Select-tickets-status-escalated');
            } else {
              IsValid = true;
              Message = '';
            }
            break;
          default:
            IsValid = false;
            Message = this.translate.instant('Not-authorized-onhold-operation');
            break;
        }
      } else {
        if (SelectedTickets.length < 2) {
          IsValid = false;
          Message = this.translate.instant('Select-minimum-2-tickets-onhold');
        } else {
          IsValid = false;
          Message = this.translate.instant('Select-maximum-50-tickets-onhold');
        }
      }
    } else {
      IsValid = false;
      Message = this.translate.instant('Not-authorized-onhold-operation');
    }

    const SelectedTicketsReplyInitiated = SelectedTickets.map(
      (s) => s.mention.replyInitiated
    ).filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      IsValid = false;
      Message = this.translate.instant('Previous-request-pending-for-this-ticket');
    }
    return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
  }

  ValidateTicketsToBeEscalate(): any {
    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    let IsValid = false;
    let Message = '';
    let _TicketAgentWorkFlowEnabled = false;
    let _IsEnableReplyApprovalWorkFlow = false;
    const currentteamid = +this.currentUser.data.user.teamID;
    let isAgentHasTeam = false;
    if (currentteamid !== 0) {
      isAgentHasTeam = true;
    }

    // const IsEmailChannel = SelectedTickets.filter(
    //   (s) => s.mention.channelGroup === ChannelGroup.Email
    // );
    // const IsNotReadList = SelectedTickets.filter(
    //   (s) => s.mention.allMentionInThisTicketIsRead === false
    // );
    // if (IsEmailChannel.length > 0 && IsNotReadList.length > 0) {
    //   IsValid = false;
    //   Message =
    //     'Please read all the mentions before performing bulk escalate action';

    //   return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
    // }

    if (
      +this.currentUser.data.user.role === UserRoleEnum.Agent ||
      +this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
      +this.currentUser.data.user.role === UserRoleEnum.LocationManager ||
      +this.currentUser.data.user.role === UserRoleEnum.TeamLead ||
      +this.currentUser.data.user.role === UserRoleEnum.BrandAccount ||
      +this.currentUser.data.user.role === UserRoleEnum.CustomerCare
    ) {
      if (SelectedTickets.length > 1 && SelectedTickets.length <= 50) {
        const SelectedTicketsBrandIDs = SelectedTickets.map(
          (s) => s.mention.brandInfo.brandID
        ).filter(this.onlyUnique);

        if (SelectedTicketsBrandIDs.length === 1) {
          _TicketAgentWorkFlowEnabled = false;

          const isworkflowenabled = this._filterService.fetchedBrandData.find(
            (brand: BrandList) => +brand.brandID === SelectedTicketsBrandIDs[0]
          );
          _IsEnableReplyApprovalWorkFlow =
            isworkflowenabled.isEnableReplyApprovalWorkFlow;

          const SelectedTicketAgentWorkFlowEnabled = SelectedTickets.map(
            (s) => s.mention.ticketInfo.ticketAgentWorkFlowEnabled
          ).filter(this.onlyUnique);
          if (SelectedTicketAgentWorkFlowEnabled.length === 0) {
            IsValid = false;
            Message = this.translate.instant('Something-went-wrong-try-again');
          } else if (SelectedTicketAgentWorkFlowEnabled.length === 1) {
            _TicketAgentWorkFlowEnabled = SelectedTicketAgentWorkFlowEnabled[0];
          } else if (SelectedTicketAgentWorkFlowEnabled.length > 1) {
            if (SelectedTicketAgentWorkFlowEnabled.indexOf(true) >= 0) {
              _TicketAgentWorkFlowEnabled = true;
            }
          }

          if (
            !isAgentHasTeam &&
            +this.currentUser.data.user.role === UserRoleEnum.Agent &&
            _IsEnableReplyApprovalWorkFlow &&
            (_TicketAgentWorkFlowEnabled ||
              +this.currentUser.data.user.agentWorkFlowEnabled)
          ) {
            IsValid = false;
            Message = this.translate.instant('Cannot-escalate-approval-needs-TL');
          } else {
            const SelectedTicketsStatus = SelectedTickets.map(
              (s) => s.mention.ticketInfo.status
            ).filter(this.onlyUnique);

            switch (+this.currentUser.data.user.role) {
              case UserRoleEnum.Agent:
              case UserRoleEnum.SupervisorAgent:
              case UserRoleEnum.LocationManager:
              case UserRoleEnum.TeamLead:
                if (
                  SelectedTicketsStatus.indexOf(1) >= 0 ||
                  SelectedTicketsStatus.indexOf(3) >= 0 ||
                  SelectedTicketsStatus.indexOf(6) >= 0 ||
                  SelectedTicketsStatus.indexOf(8) >= 0 ||
                  SelectedTicketsStatus.indexOf(11) >= 0 ||
                  SelectedTicketsStatus.indexOf(12) >= 0 ||
                  SelectedTicketsStatus.indexOf(13) >= 0 ||
                  SelectedTicketsStatus.indexOf(14) >= 0 ||
                  SelectedTicketsStatus.indexOf(16) >= 0
                ) {
                  IsValid = false;
                  Message = this.translate.instant('Select-tickets-status-open-approved-rejected');
                } else {
                  IsValid = true;
                  Message = '';
                }
                break;
              case 2:
                const SelectedTicketsBrandWorflowArray = SelectedTickets.map(
                  (s) => s.mention.brandInfo.isBrandworkFlowEnabled
                ).filter(this.onlyUnique);

                if (
                  SelectedTicketsBrandWorflowArray.length === 1 &&
                  SelectedTicketsBrandWorflowArray[0] === true
                ) {
                  if (
                    SelectedTicketsStatus.indexOf(3) >= 0 ||
                    SelectedTicketsStatus.indexOf(5) >= 0 ||
                    SelectedTicketsStatus.indexOf(8) >= 0 ||
                    SelectedTicketsStatus.indexOf(11) >= 0 ||
                    SelectedTicketsStatus.indexOf(14) >= 0 ||
                    SelectedTicketsStatus.indexOf(16) >= 0
                  ) {
                    IsValid = false;
                    Message =
                      this.translate.instant('select-ticket-status-escalated');
                  } else {
                    IsValid = true;
                    Message = '';
                  }
                } else {
                  IsValid = false;
                  Message =
                    this.translate.instant('"Cannot-escalate-ticket');
                }
                break;
              default:
                IsValid = false;
                Message = this.translate.instant('Not-authorized-escalate-operation');
                break;
            }
          }
        } else {
          IsValid = false;
          Message = this.translate.instant('Cannot-select-multiple-brands-escalate');
        }
      } else {
        if (SelectedTickets.length < 2) {
          IsValid = false;
          Message = this.translate.instant('Select-minimum-2-tickets-escalate');
        } else {
          IsValid = false;
          Message = this.translate.instant('Select-maximum-50-tickets-escalate');
        }
      }
    } else {
      IsValid = false;
      Message = this.translate.instant('Not-authorized-escalate-operation');
    }

    const SelectedTicketsReplyInitiated = SelectedTickets.map(
      (s) => s.mention.replyInitiated
    ).filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      IsValid = false;
      Message = this.translate.instant('Previous-request-pending-for-this-ticket');
    }

    return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
  }

  ValidateTicketsToBeReopened(): any {
    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    let IsValid = false;
    let Message = '';

    if (
      +this.currentUser.data.user.role === UserRoleEnum.Agent ||
      +this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
      +this.currentUser.data.user.role === UserRoleEnum.LocationManager ||
      +this.currentUser.data.user.role === UserRoleEnum.TeamLead ||
      +this.currentUser.data.user.role === UserRoleEnum.BrandAccount ||
      +this.currentUser.data.user.role === UserRoleEnum.CustomerCare
    ) {
      if (SelectedTickets.length > 1 && SelectedTickets.length <= 50) {
        const SelectedTicketsStatus = SelectedTickets.map(
          (s) => s.mention.ticketInfo.status
        ).filter(this.onlyUnique);
        const SelectedSSRETicket = SelectedTickets.filter(
          (s) =>
            s.mention.ticketInfoSsre.ssreOriginalIntent ===
              SsreIntent.NoActionTaken &&
            s.mention.isSSRE &&
            s.mention.ticketInfoSsre.ssreStatus === SSRELogStatus.Successful
        );

        if (SelectedSSRETicket.length > 0) {
          IsValid = false;
          Message = this.translate.instant('Select-tickets-not-in-SSRE');
        } else {
          switch (+this.currentUser.data.user.role) {
            case UserRoleEnum.Agent:
            case UserRoleEnum.SupervisorAgent:
            case UserRoleEnum.LocationManager:
            case UserRoleEnum.TeamLead:
              if (
                SelectedTicketsStatus.indexOf(0) >= 0 ||
                SelectedTicketsStatus.indexOf(1) >= 0 ||
                SelectedTicketsStatus.indexOf(2) >= 0 ||
                SelectedTicketsStatus.indexOf(4) >= 0 ||
                SelectedTicketsStatus.indexOf(6) >= 0 ||
                SelectedTicketsStatus.indexOf(8) >= 0 ||
                SelectedTicketsStatus.indexOf(9) >= 0 ||
                SelectedTicketsStatus.indexOf(10) >= 0 ||
                SelectedTicketsStatus.indexOf(11) >= 0 ||
                SelectedTicketsStatus.indexOf(12) >= 0 ||
                SelectedTicketsStatus.indexOf(13) >= 0 ||
                SelectedTicketsStatus.indexOf(14) >= 0 ||
                SelectedTicketsStatus.indexOf(15) >= 0 ||
                SelectedTicketsStatus.indexOf(16) >= 0
              ) {
                IsValid = false;
                Message = this.translate.instant('Select-tickets-status-closed-onhold');
              } else {
                IsValid = true;
                Message = '';
              }
              break;
            case UserRoleEnum.CustomerCare:
              if (
                SelectedTicketsStatus.indexOf(0) >= 0 ||
                SelectedTicketsStatus.indexOf(1) >= 0 ||
                SelectedTicketsStatus.indexOf(2) >= 0 ||
                SelectedTicketsStatus.indexOf(3) >= 0 ||
                SelectedTicketsStatus.indexOf(4) >= 0 ||
                SelectedTicketsStatus.indexOf(5) >= 0 ||
                SelectedTicketsStatus.indexOf(7) >= 0 ||
                SelectedTicketsStatus.indexOf(8) >= 0 ||
                SelectedTicketsStatus.indexOf(9) >= 0 ||
                SelectedTicketsStatus.indexOf(10) >= 0 ||
                SelectedTicketsStatus.indexOf(11) >= 0 ||
                SelectedTicketsStatus.indexOf(12) >= 0 ||
                SelectedTicketsStatus.indexOf(13) >= 0 ||
                SelectedTicketsStatus.indexOf(14) >= 0 ||
                SelectedTicketsStatus.indexOf(5) >= 0 ||
                SelectedTicketsStatus.indexOf(16) >= 0
              ) {
                IsValid = false;
                Message = this.translate.instant('Select-tickets-status-onhold');
              } else {
                IsValid = true;
                Message = '';
              }
              break;
            case UserRoleEnum.BrandAccount:
              if (
                SelectedTicketsStatus.indexOf(0) >= 0 ||
                SelectedTicketsStatus.indexOf(1) >= 0 ||
                SelectedTicketsStatus.indexOf(2) >= 0 ||
                SelectedTicketsStatus.indexOf(3) >= 0 ||
                SelectedTicketsStatus.indexOf(4) >= 0 ||
                SelectedTicketsStatus.indexOf(5) >= 0 ||
                SelectedTicketsStatus.indexOf(6) >= 0 ||
                SelectedTicketsStatus.indexOf(7) >= 0 ||
                SelectedTicketsStatus.indexOf(8) >= 0 ||
                SelectedTicketsStatus.indexOf(9) >= 0 ||
                SelectedTicketsStatus.indexOf(10) >= 0 ||
                SelectedTicketsStatus.indexOf(12) >= 0 ||
                SelectedTicketsStatus.indexOf(13) >= 0 ||
                SelectedTicketsStatus.indexOf(14) >= 0 ||
                SelectedTicketsStatus.indexOf(5) >= 0 ||
                SelectedTicketsStatus.indexOf(16) >= 0
              ) {
                IsValid = false;
                Message = this.translate.instant('Select-tickets-status-onhold');
              } else {
                IsValid = true;
                Message = '';
              }
              break;
            default:
              IsValid = false;
              Message = this.translate.instant('Not-authorized-onhold-operation');
              break;
          }
        }
      } else {
        if (SelectedTickets.length < 2) {
          IsValid = false;
          Message = this.translate.instant('Select-minimum-2-tickets-reopen');
        } else {
          IsValid = false;
          Message = this.translate.instant('Select-maximum-50-tickets-reopen');
        }
      }
    } else {
      IsValid = false;
      Message = this.translate.instant('Not-authorized-reopen-multiple-tickets');
    }

    const SelectedTicketsReplyInitiated = SelectedTickets.map(
      (s) => s.mention.replyInitiated
    ).filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      IsValid = false;
      Message = this.translate.instant('Previous-request-pending-for-this-ticket');
    }

    return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
  }

  ShowBulkReplyPreview(): any {
    let IsEnableReplyApprovalWorkFlow = false;
    const settings = this.GetCategoryBrandLevelBulkReplySetting();
    if (settings.IsCategory || settings.IsBrand) {
      const CheckedMentionsOrTickets =
        this._ticketService.bulkMentionChecked.filter(
          (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
        );

      let _ChannelGroupID = 0;
      const ticketagentworkflowenabled = false;
      if (CheckedMentionsOrTickets.length > 0) {
        const firstElement = CheckedMentionsOrTickets[0].mention;
        _ChannelGroupID = firstElement.channelGroup;
        const brandid = firstElement.brandInfo.brandID;
        const isworkflowenabled = this._filterService.fetchedBrandData.find(
          (brand: BrandList) => +brand.brandID === brandid
        );

        IsEnableReplyApprovalWorkFlow =
          isworkflowenabled.isEnableReplyApprovalWorkFlow;
      }

      const TicketApprovalEnable = [];
      const FBMessageReplyEnable = [];
      for (const checkedticket of CheckedMentionsOrTickets) {
        if (checkedticket.mention.channelType === ChannelType.FBMessages) {
          const ticketTimings = this._ticketService.calculateTicketTimes(
            checkedticket.mention
          );
          if (ticketTimings.valDays) {
            if (Number(ticketTimings.valDays) > 7) {
              FBMessageReplyEnable.push(
                checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled
              );
            }
          }
        }
        if (checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled) {
          TicketApprovalEnable.push(
            checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled
          );
        }
      }

      if (FBMessageReplyEnable.length > 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Cannot-select-FB-Message-7-days-expired'),
          },
        });
        return;
      }

      /* if (+this.currentUser.data.user.role === UserRoleEnum.Agent) {
        if (IsEnableReplyApprovalWorkFlow && (this.currentUser.data.user.agentWorkFlowEnabled || TicketApprovalEnable.length > 0)) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message:
                'Selected mentions cannot be used for bulk reply while reply approval workflow is on.',
            },
          });
          return;
        }
      } */

      // Page/account level restriction
      if (
        _ChannelGroupID !== 25 &&
        _ChannelGroupID !== 29 &&
        _ChannelGroupID !== 9 &&
        _ChannelGroupID !== 8 &&
        _ChannelGroupID !== 10 &&
        _ChannelGroupID !== 11 &&
        _ChannelGroupID !== 12 &&
        _ChannelGroupID !== 13 &&
        _ChannelGroupID !== 14 &&
        _ChannelGroupID !== 15 &&
        _ChannelGroupID !== 16 &&
        _ChannelGroupID !== 17 &&
        _ChannelGroupID !== 18 &&
        _ChannelGroupID !== 19 &&
        _ChannelGroupID !== 20 &&
        _ChannelGroupID !== 21 &&
        _ChannelGroupID !== 22 &&
        _ChannelGroupID !== 23 &&
        _ChannelGroupID !== 24 &&
        _ChannelGroupID !== 27
      ) {
        let _MaxSizeOfBulkReply = 0;
        switch (_ChannelGroupID) {
          case 1:
            _MaxSizeOfBulkReply =
              this.currentUser.data.user.config
                .MaxMentionsOrTicketsForBulkReplyTwitter; // MaxSizeOfBulkReplyTwitter;
            break;
          case 2:
          case 3:
            _MaxSizeOfBulkReply =
              this.currentUser.data.user.config
                .MaxMentionsOrTicketsForBulkReplyFacebook; // MaxSizeOfBulkReplyFacebook;
            break;
          default:
            _MaxSizeOfBulkReply =
              this.currentUser.data.user.config
                .MaxMentionsOrTicketsForBulkReply; // MaxSizeOfBulkReply;
            break;
        }

        if (
          CheckedMentionsOrTickets.length > 1 &&
          CheckedMentionsOrTickets.length <= _MaxSizeOfBulkReply
        ) {
          const CaBulkReply = this.IsValidToBulkReply();

          if (CaBulkReply.success) {
            if (CheckedMentionsOrTickets.length > 0) {
              CaBulkReply.message = [];
              const qualifiedforapproval = [];
              let isticketagentworkflowenabled = false;
              const GoingForApproval = [];
              let TotalTickets = 0;
              const qualifiedTickets =
                this._ticketService.bulkMentionChecked.filter(
                  (obj) =>
                    obj.guid === this._navigationService.currentSelectedTab.guid
                );
              TotalTickets = qualifiedTickets.length;

              if (qualifiedTickets.length > 0) {
                for (const checkedticket of qualifiedTickets) {
                  isticketagentworkflowenabled =
                    checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled;

                  const isworkflowenabled =
                    this._filterService.fetchedBrandData.find(
                      (brand: BrandList) =>
                        +brand.brandID ===
                        checkedticket.mention.brandInfo.brandID
                    );
                  if (
                    +this.currentUser.data.user.role === UserRoleEnum.Agent &&
                    isworkflowenabled.isEnableReplyApprovalWorkFlow &&
                    (this.currentUser.data.user.agentWorkFlowEnabled ||
                      isticketagentworkflowenabled)
                  ) {
                    qualifiedforapproval.push(this);
                    GoingForApproval.push(isticketagentworkflowenabled);
                  }
                }

                /* if (GoingForApproval.length > 0) {
                  // show popup
                } else { */
                  let isTicket = false;
                  if (this.pageType === PostsType.Tickets) {
                    isTicket = true;
                  }
                  this.GetBulkReply(isTicket);
                /* } */
              }
            } else {
              // ErrorModal("Something went wrong, please try again later");
              // BulkReply.HideBulkReplySection();
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this.translate.instant('Something-went-wrong-try-again'),
                },
              });
            }
          } else {
            if (CaBulkReply.message) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: CaBulkReply.message,
                },
              });
            }
            // BulkReply.HideBulkReplySection();
          }
        } else {
          let message = '';
          let isTicket = false;
          if (this.pageType === PostsType.Tickets) {
            isTicket = true;
          }
          if (
            CheckedMentionsOrTickets.length > 1 &&
            CheckedMentionsOrTickets.length > _MaxSizeOfBulkReply
          ) {
            message = isTicket
              ? this.translate.instant('Cannot-reply-more-than-tickets', { count: _MaxSizeOfBulkReply })
              : this.translate.instant('Cannot-reply-more-than-mentions', { count: _MaxSizeOfBulkReply });
          } else if (CheckedMentionsOrTickets.length <= 1) {
            message = isTicket
              ? this.translate.instant('Minimum-2-tickets-required')
              : this.translate.instant('Minimum-2-mentions-required');
          }
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: message,
            },
          });
        }
      } else {
        switch (_ChannelGroupID) {
          case 25:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Bulk-reply-not-supported-email'),
              },
            });
            break;
          case 29:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Bulk-reply-not-supported-chatbot'),
              },
            });
            break;
          case 19:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Bulk-reply-not-supported-news'),
              },
            });
            break;
          default:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Bulk-reply-not-supported-selected-channel'),
              },
            });
            break;
        }
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Bulk-reply-not-enabled-selected-brands'),
        },
      });
    }
  }

  GetBulkReply(IsTicket): void {
    const settings = this.GetCategoryBrandLevelBulkReplySetting();
    if (settings.IsCategory || settings.IsBrand) {
      // _BulkReplyHtmlModalPopup = $('#BulkReplyPopup');
      // BulkReply.EmptyBulkReplySection();
      // _BulkReplyHtmlPlaceHolder = $('#BulkReplyPopup .replyclosebox .post__card #Replycloseform');
      // _BulkReplyHtmlInputLocobuzzMention = $('#BulkReplyPopup #ticketcontants');

      let CheckedMentionsOrTickets = undefined;

      if (IsTicket) {
        CheckedMentionsOrTickets =
          this._ticketService.bulkMentionChecked.filter(
            (obj) =>
              obj.guid === this._navigationService.currentSelectedTab.guid
          );
      } else {
        CheckedMentionsOrTickets =
          this._ticketService.bulkMentionChecked.filter(
            (obj) =>
              obj.guid === this._navigationService.currentSelectedTab.guid
          );
      }

      let _ChannelGroupID;
      let ticketagentworkflowenabled = false;
      if (CheckedMentionsOrTickets.length > 0) {
        const firstElement = CheckedMentionsOrTickets[0];
        _ChannelGroupID = CheckedMentionsOrTickets[0].mention.channelGroup;
      }

      const TicketApprovalEnable = [];
      for (const ticket of CheckedMentionsOrTickets) {
        ticketagentworkflowenabled =
          ticket.mention.ticketInfo.ticketagentworkflowenabled;
        if (ticketagentworkflowenabled) {
          TicketApprovalEnable.push(ticketagentworkflowenabled);
        }
      }

      const isworkflowenabled = this._filterService.fetchedBrandData.find(
        (brand: BrandList) =>
          +brand.brandID ===
          CheckedMentionsOrTickets[0].mention.brandInfo.brandID
      );

      if (
        IsTicket === undefined &&
        this.currentUser.data.user.role === UserRoleEnum.Agent
      ) {
        if (
          isworkflowenabled.isEnableReplyApprovalWorkFlow &&
          (this.currentUser.data.user.agentWorkFlowEnabled ||
            TicketApprovalEnable.length > 0)
        ) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Bulk-reply-not-allowed-approval-workflow'),
            },
          });
          return;
        }
      }

      this.currentUser.data.user.isCanPerformActionEnable;

      // Page/account level restriction
      if (
        _ChannelGroupID !== ChannelGroup.Email &&
        _ChannelGroupID !== ChannelGroup.WebsiteChatBot &&
        _ChannelGroupID !== ChannelGroup.Blogs &&
        _ChannelGroupID !== ChannelGroup.AutomotiveIndia &&
        _ChannelGroupID !== ChannelGroup.Booking &&
        _ChannelGroupID !== ChannelGroup.ComplaintWebsites &&
        _ChannelGroupID !== ChannelGroup.CustomerCare &&
        _ChannelGroupID !== ChannelGroup.DiscussionForums &&
        _ChannelGroupID !== ChannelGroup.ECommerceWebsites &&
        _ChannelGroupID !== ChannelGroup.Expedia &&
        _ChannelGroupID !== ChannelGroup.MakeMyTrip &&
        _ChannelGroupID !== ChannelGroup.MyGov &&
        _ChannelGroupID !== ChannelGroup.HolidayIQ &&
        _ChannelGroupID !== ChannelGroup.News &&
        _ChannelGroupID !== ChannelGroup.ReviewWebsites &&
        _ChannelGroupID !== ChannelGroup.TeamBHP &&
        _ChannelGroupID !== ChannelGroup.TripAdvisor &&
        _ChannelGroupID !== ChannelGroup.Videos &&
        _ChannelGroupID !== ChannelGroup.Zomato &&
        _ChannelGroupID !== ChannelGroup.ElectronicMedia
      ) {
        let _MaxSizeOfBulkReply = 0;
        switch (_ChannelGroupID) {
          case ChannelGroup.Twitter:
            _MaxSizeOfBulkReply = 6;
            break;
          case ChannelGroup.Facebook:
          case ChannelGroup.Instagram:
            _MaxSizeOfBulkReply = 10;
            break;
          default:
            _MaxSizeOfBulkReply = 10;
            break;
        }

        if (
          CheckedMentionsOrTickets.length > 1 &&
          CheckedMentionsOrTickets.length <= _MaxSizeOfBulkReply
        ) {
          const CaBulkReply = this.IsValidToBulkReply();

          if (CaBulkReply.success) {
            let ticketormention = '';
            if (this.pageType === PostsType.Tickets) {
              ticketormention = this.translate.instant('Tickets');
            } else {
              ticketormention = this.translate.instant('Mentions');
            }
            if (CheckedMentionsOrTickets.length > 0) {
              const firstElement = CheckedMentionsOrTickets[0];
              const ChannelGroupID = firstElement.mention.channelGroup;
              if (
                ChannelGroupID !== undefined &&
                ChannelGroupID !== null &&
                ChannelGroupID !== '' &&
                (ChannelGroupID === ChannelGroup.Twitter ||
                  ChannelGroupID === ChannelGroup.Facebook)
              ) {
                let ContainsDM = false;
                let DMElement;
                for (const ticketmention of CheckedMentionsOrTickets) {
                  const currentElementChannelType =
                    ticketmention.mention.channelType;

                  if (
                    currentElementChannelType &&
                    (currentElementChannelType === ChannelType.DirectMessages ||
                      currentElementChannelType === ChannelType.FBMessages)
                  ) {
                    ContainsDM = true;
                    DMElement = ticketmention;
                    // return;
                  }
                }

                if (ContainsDM) {
                  if (
                    DMElement !== undefined &&
                    DMElement != null &&
                    DMElement !== ''
                  ) {
                    this._postDetailService.postObj = DMElement.mention;
                    this._postDetailService.isBulk = true;
                    this._postDetailService.pagetype = this.pageType;
                    const replyPostRef = this._bottomSheet.open(
                      PostReplyComponent,
                      {
                        ariaLabel: 'Reply',
                        panelClass: 'post-reply__wrapper',
                        backdropClass: 'no-blur',
                        data: {
                          inBottomSheet: true,
                          bulkmessage:
                            this.translate.instant('Bulk-Reply-on', { count: this._ticketService.bulkMentionChecked.length, type: ticketormention }),
                          pageType: this.pageType,
                        },
                      }
                    );
                  } else {
                    this._postDetailService.postObj = firstElement.mention;
                    this._postDetailService.isBulk = true;
                    this._postDetailService.pagetype = this.pageType;
                    const replyPostRef = this._bottomSheet.open(
                      PostReplyComponent,
                      {
                        ariaLabel: 'Reply',
                        panelClass: 'post-reply__wrapper',
                        backdropClass: 'no-blur',
                        data: {
                          inBottomSheet: true,
                          bulkmessage:
                            this.translate.instant('Bulk-Reply-on', { count: this._ticketService.bulkMentionChecked.length, type: ticketormention }),
                          pageType: this.pageType,
                        },
                      }
                    );
                  }
                } else {
                  // CalculateTime(start, "Request");
                  this._postDetailService.postObj = firstElement.mention;
                  this._postDetailService.isBulk = true;
                  this._postDetailService.pagetype = this.pageType;
                  const replyPostRef = this._bottomSheet.open(
                    PostReplyComponent,
                    {
                      ariaLabel: 'Reply',
                      panelClass: 'post-reply__wrapper',
                      backdropClass: 'no-blur',
                      data: {
                        inBottomSheet: true,
                        bulkmessage:
                          this.translate.instant('Bulk-Reply-on', { count: this._ticketService.bulkMentionChecked.length, type: ticketormention }),
                        pageType: this.pageType,
                      },
                    }
                  );
                }
              } else {
                this._postDetailService.postObj = firstElement.mention;
                this._postDetailService.isBulk = true;
                this._postDetailService.pagetype = this.pageType;
                const replyPostRef = this._bottomSheet.open(
                  PostReplyComponent,
                  {
                    ariaLabel: 'Reply',
                    panelClass: 'post-reply__wrapper',
                    backdropClass: 'no-blur',
                    data: {
                      inBottomSheet: true,
                      bulkmessage:
                        this.translate.instant('Bulk-Reply-on', { count: this._ticketService.bulkMentionChecked.length, type: ticketormention }),
                      pageType: this.pageType,
                    },
                  }
                );
              }
            } else {
              // ErrorModal("Something went wrong, please try again later");
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this.translate.instant('Something-went-wrong-try-again'),
                },
              });
              // BulkReply.HideBulkReplySection();
            }
          } else {
            if (CaBulkReply.message) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: CaBulkReply.message,
                },
              });
            }
            // BulkReply.HideBulkReplySection();
          }
        } else {
          let message = '';
          if (
            CheckedMentionsOrTickets.length > 1 &&
            CheckedMentionsOrTickets.length > _MaxSizeOfBulkReply
          ) {
            message = IsTicket
              ? this.translate.instant('Cannot-reply-more-than-tickets', { count: _MaxSizeOfBulkReply })
              : this.translate.instant('Cannot-reply-more-than-mentions', { count: _MaxSizeOfBulkReply });
          } else if (CheckedMentionsOrTickets.length <= 1) {
            message = IsTicket
              ? this.translate.instant('Minimum-2-tickets-required')
              : this.translate.instant('Minimum-2-mentions-required');
          }
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: message,
            },
          });
        }
      } else {
        switch (_ChannelGroupID) {
          case ChannelGroup.Email:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Bulk-reply-not-supported-email'),
              },
            });
            break;
          case ChannelGroup.WebsiteChatBot:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Bulk-reply-not-supported-chatbot'),
              },
            });
            break;
          case ChannelGroup.News:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Bulk-reply-not-supported-news'),
              },
            });
            break;
          default:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Bulk-reply-not-supported-selected-channel'),
              },
            });
            break;
        }
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Bulk-reply-not-enabled-selected-brands'),
        },
      });
    }
  }

  IsValidToBulkReply(): any {
    let isTicket = false;
    if (this.pageType === PostsType.Tickets) {
      isTicket = true;
    }
    const SelectedMentionsOrTickets =
      this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
    const AllSeclectedMentions = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    const BrandReplies = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    let message = '';
    let AllSelectedMentionsOrTicketsBelongsToSameBand = false;
    let AllSelectedMentionsOrTicketsBelongsToSameChannelGroups = false;
    const SelectedMentionOrTicketsSources = new Array();
    const SelectedMentionOrTicketBrandIDs = new Array();
    const SelectedMentionOrTicketChannelGroup = new Array();
    const SelectedMentionOrTicketAlreadyInitiated = new Array();
    const SelectedMentionOrTicketBelongsToSamePage = new Array();

    const SelectedMentionOrTicketIsSentForApproval = new Array();
    const SelectedMentionOrSSRETicket = new Array();

    const IsEmailChannel = SelectedMentionsOrTickets.filter(
      (s) => s.mention.channelGroup === ChannelGroup.Email
    );
    const IsNotReadList = SelectedMentionsOrTickets.filter(
      (s) => s.mention.allMentionInThisTicketIsRead === false
    );
    if (IsEmailChannel.length > 0 && IsNotReadList.length > 0) {
      message =
        this.translate.instant('Bulk-reply-action');
      return { success: false, message };
    }

    for (const checkedticket of SelectedMentionsOrTickets) {
      if (
        checkedticket.mention.isSSRE &&
        checkedticket.mention.ticketInfoSsre.ssreIntent ===
          SsreIntent.NoActionTaken &&
        checkedticket.mention.ticketInfoSsre.ssreStatus ===
          SSRELogStatus.Successful
      ) {
        SelectedMentionOrSSRETicket.push(true);
      }
      const ObjectToSave = {
        Source: checkedticket,
        TagID: checkedticket.mention.tagID,
        TicketID: checkedticket.mention.ticketInfo.ticketID,
        ChannelGroup: checkedticket.mention.channelGroup,
        TicketStatus: checkedticket.mention.ticketInfo.status,
      };

      SelectedMentionOrTicketsSources.push(ObjectToSave);
      SelectedMentionOrTicketBrandIDs.push(
        checkedticket.mention.brandInfo.brandID
      );
      SelectedMentionOrTicketChannelGroup.push(
        checkedticket.mention.channelGroup
      );

      SelectedMentionOrTicketAlreadyInitiated.push(
        checkedticket.mention.replyInitiated
      );

      switch (checkedticket.mention.channelGroup) {
        case ChannelGroup.Facebook:
          SelectedMentionOrTicketBelongsToSamePage.push(
            checkedticket.mention.fbPageID
          );
          break;
        case ChannelGroup.GooglePlayStore:
          SelectedMentionOrTicketBelongsToSamePage.push(
            checkedticket.mention.appID
          );
          break;
        case ChannelGroup.Instagram:
          SelectedMentionOrTicketBelongsToSamePage.push(
            checkedticket.mention.pageID
          );
          break;
        case ChannelGroup.Youtube:
          SelectedMentionOrTicketBelongsToSamePage.push(
            checkedticket.mention.inReplyToStatusId
          );
          break;
        case ChannelGroup.LinkedIn:
          SelectedMentionOrTicketBelongsToSamePage.push(
            checkedticket.mention.inReplyToStatusId
          );
          break;
      }
    }

    if (SelectedMentionOrSSRETicket.length > 0) {
      message = this.translate.instant('Ticket-which-are-not-ssre');
      return { success: false, message };
    }
    if (SelectedMentionOrTicketAlreadyInitiated.length > 0) {
      const NewArrayOfInitiation = SelectedMentionOrTicketAlreadyInitiated.map(
        (s) => s
      ).filter(this.onlyUnique);
      if (NewArrayOfInitiation.indexOf(true) !== -1) {
        message = this.translate.instant('Previous-request-pending');

        return { success: false, message };
      }
    }

    if (
      SelectedMentionOrTicketBrandIDs.length > 0 &&
      SelectedMentionOrTicketBrandIDs.map((s) => s).filter(this.onlyUnique)
        .length === 1
    ) {
      AllSelectedMentionsOrTicketsBelongsToSameBand = true;

      const Settings = this.GetCategoryBrandLevelBulkReplySetting();

      if (Settings.IsCategory) {
        // Go ahed
      } else if (Settings.IsBrand) {
        if (
          Settings.BrandArray.indexOf(
            SelectedMentionOrTicketBrandIDs[0].toString()
          ) !== -1
        ) {
          // Go ahed
        } else {
          return {
            success: false,
            message: this.translate.instant('Bulk-reply-not-enabled-selected-brands'),
          };
        }
      } else {
        return {
          success: false,
          message: this.translate.instant('Bulk-reply-not-enabled-selected-brands'),
        };
      }
    }

    if (
      SelectedMentionOrTicketChannelGroup.length > 0 &&
      SelectedMentionOrTicketChannelGroup.map((s) => s).filter(this.onlyUnique)
        .length === 1
    ) {
      AllSelectedMentionsOrTicketsBelongsToSameChannelGroups = true;
    }

    if (SelectedMentionsOrTickets.length > 0) {
      if (
        !AllSelectedMentionsOrTicketsBelongsToSameBand &&
        !AllSelectedMentionsOrTicketsBelongsToSameChannelGroups
      ) {
        message =
          this.translate.instant('Select-mention-brand-channel');

        return { success: false, message };
      }

      if (
        AllSelectedMentionsOrTicketsBelongsToSameBand &&
        !AllSelectedMentionsOrTicketsBelongsToSameChannelGroups
      ) {
        message = this.translate.instant('Select-mention-channel');

        return { success: false, message };
      }

      if (
        SelectedMentionOrTicketBelongsToSamePage.length > 0 &&
        AllSelectedMentionsOrTicketsBelongsToSameChannelGroups
      ) {
        const DistinctPageID = SelectedMentionOrTicketBelongsToSamePage.map(
          (s) => s !== undefined && s !== null
        ).filter(this.onlyUnique);
        switch (
          SelectedMentionOrTicketChannelGroup.map((s) => s).filter(
            this.onlyUnique
          )[0]
        ) {
          case ChannelGroup.Twitter:
            break;
          case ChannelGroup.Facebook:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Select-mention-page');

              return { success: false, message };
            }
            break;
          case ChannelGroup.GooglePlayStore:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Select-mention-app');

              return { success: false, message };
            }
            break;
          case ChannelGroup.Instagram:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Select-mention-action-reply');

              return { success: false, message };
            }
            break;
          case ChannelGroup.Youtube:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Select-mention-channel');

              return { success: false, message };
            }
            break;
          case ChannelGroup.LinkedIn:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Select-mention-page');

              return { success: false, message };
            }
            break;
          default:
            break;
        }
      }

      if (
        !AllSelectedMentionsOrTicketsBelongsToSameBand &&
        AllSelectedMentionsOrTicketsBelongsToSameChannelGroups
      ) {
        message = this.translate.instant('Select-mention-brand');

        return { success: false, message };
      } else if (
        AllSelectedMentionsOrTicketsBelongsToSameBand &&
        AllSelectedMentionsOrTicketsBelongsToSameChannelGroups
      ) {
        if (SelectedMentionOrTicketsSources.length > 0) {
          const SelectedMentionsOrTicketStatus = new Array();
          for (const checkedticket of SelectedMentionOrTicketsSources) {
            const _ticketStatus = checkedticket.TicketStatus;
            if (
              _ticketStatus !== undefined &&
              _ticketStatus != null &&
              _ticketStatus !== ''
            ) {
              SelectedMentionsOrTicketStatus.push(_ticketStatus);
            } else {
              SelectedMentionsOrTicketStatus.push(0);
            }
          }

          if (SelectedMentionsOrTicketStatus.length > 0) {
            const DistincetTicketStatus = SelectedMentionsOrTicketStatus.map(
              (s) => s
            ).filter(this.onlyUnique);
            if (DistincetTicketStatus.length > 1) {
              message = this.translate.instant('Reply-same-ticket');

              return {
                success: false,
                message,
              };
            } else {
              if (
                DistincetTicketStatus.length === 1 &&
                (DistincetTicketStatus[0] === 3 ||
                  DistincetTicketStatus[0] === 1 ||
                  DistincetTicketStatus[0] === 6 ||
                  DistincetTicketStatus[0] === 8 ||
                  DistincetTicketStatus[0] === 11) &&
                (this.currentUser.data.user.role === UserRoleEnum.Agent ||
                  this.currentUser.data.user.role ===
                  UserRoleEnum.SupervisorAgent || this.currentUser.data.user.role ===
                  UserRoleEnum.LocationManager)
              ) {
                switch (DistincetTicketStatus[0]) {
                  case TicketStatus.PendingwithCSD:
                  message = isTicket
                    ? this.translate.instant('Cannot-select-tickets-pending-with-CSD')
                    : this.translate.instant('Cannot-select-mentions-pending-with-CSD');
                  break;
                  case 3:
                  message = isTicket
                    ? this.translate.instant('Cannot-select-tickets-closed')
                    : this.translate.instant('Cannot-select-mentions-closed');
                  break;
                  case 6:
                  message = isTicket
                    ? this.translate.instant('Cannot-select-tickets-onhold-with-CSD')
                    : this.translate.instant('Cannot-select-mentions-onhold-with-CSD');
                  break;
                  case 8:
                  message = isTicket
                    ? this.translate.instant('Cannot-select-tickets-pending-with-brand')
                    : this.translate.instant('Cannot-select-mentions-pending-with-brand');
                  break;
                  case 11:
                  message = isTicket
                    ? this.translate.instant('Cannot-select-tickets-onhold-with-brand')
                    : this.translate.instant('Cannot-select-mentions-onhold-with-brand');
                  break;
                  default:
                  message = isTicket
                    ? this.translate.instant('Cannot-select-tickets-with-status')
                    : this.translate.instant('Cannot-select-mentions-with-status');
                  break;
                }

                return {
                  success: false,
                  message,
                };
              } else {
                if (!isTicket) {
                  if (
                    BrandReplies.length > 0 &&
                    AllSeclectedMentions.length ===
                      BrandReplies.length + SelectedMentionsOrTickets.length
                  ) {
                    for (const checkedticket of BrandReplies) {
                      const SourceElement = checkedticket;
                      // if (SourceElement.is(":checked")) {
                      //   SourceElement.click();
                      // }
                    }
                  }
                }

                return {
                  success: true,
                  message: SelectedMentionOrTicketsSources,
                };
              }
            }
          } else {
            return; // BulkReply.GenericErrorModal(IsTicket);
          }
        } else {
          return; // BulkReply.GenericErrorModal(IsTicket);
        }
      } else {
        return; // BulkReply.GenericErrorModal(IsTicket);
      }
    } else {
      return {
        success: false,
        message,
      };
    }
  }

  GetCategoryBrandLevelBulkReplySetting(): any {
    const checkedticket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    const isworkflowenabled = this._filterService.fetchedBrandData.find(
      (brand: BrandList) =>
        +brand.brandID === checkedticket[0].mention.brandInfo.brandID
    );

    const bulkreplyenabledbrandlist =
      this._filterService.fetchedBrandData.filter(
        (obj) => obj.isBrandBulkReply === true
      );

    const bulkbrandlist = bulkreplyenabledbrandlist
      .map((obj) => obj.brandID)
      .filter(this.onlyUnique);

    const IsCategoryBulkReplyEnabledStr = isworkflowenabled.isCategoryBulkReply;
    const IsBrandBulkReplyEnabledStr = isworkflowenabled.isBrandBulkReply;
    const BulkReplyEnabledBrandIdJsonStr = '';
    if (IsCategoryBulkReplyEnabledStr) {
      return { IsCategory: true, IsBrand: false, BrandArray: [] };
    } else if (IsBrandBulkReplyEnabledStr) {
      // if (BulkReplyEnabledBrandIdJsonStr) {

      //const ParsedJson = JSON.parse(BulkReplyEnabledBrandIdJsonStr);

      if (bulkreplyenabledbrandlist.length > 0) {
        return { IsCategory: false, IsBrand: true, BrandArray: bulkbrandlist };
      } else {
        return { IsCategory: false, IsBrand: false, BrandArray: [] };
      }
      //}
      // else {
      //   return { IsCategory: false, IsBrand: false, BrandArray: [] };
      // }
    } else {
      return { IsCategory: false, IsBrand: false, BrandArray: [] };
    }
  }

  ShowUserPopupForAssignTickets(): void {
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    const BulkAssignBrandIDs = [];
    const WorkFlowIDs = [];

    for (const checkedticket of chkTicket) {
      if (BulkAssignBrandIDs.length === 0) {
        BulkAssignBrandIDs.push(checkedticket.mention.brandInfo.brandID);
        WorkFlowIDs.push(
          checkedticket.mention.makerCheckerMetadata.workflowStatus
        );
      } else {
        const brandid = checkedticket.mention.brandInfo.brandID;
        const workflowstatuss =
          checkedticket.mention.makerCheckerMetadata.workflowStatus;
        if (BulkAssignBrandIDs.indexOf(brandid) > -1) {
          BulkAssignBrandIDs.push(brandid);
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message:
                this.translate.instant('You-cannot-select-assigning'),
            },
          });
          return;
          break;
        }

        WorkFlowIDs.push(workflowstatuss);
      }
    }

    const replyforapprovallength = chkTicket.filter(
      (s) =>
        s.mention.makerCheckerMetadata.workflowStatus ===
        LogStatus.ReplySentForApproval
    );
    if (WorkFlowIDs.length === replyforapprovallength.length) {
      // workflowstatus = 58;
    } else if (
      replyforapprovallength.length > 0 &&
      WorkFlowIDs.length !== replyforapprovallength.length
    ) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message:
            this.translate.instant('selected-ticket-cannot-be-reassigned'),
        },
      });
      return;
    }

    const SelectedTicketsReplyInitiated = chkTicket
      .map((s) => s.mention.replyInitiated)
      .filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Previous-request-pending'),
        },
      });
      return;
    }

    this._postDetailService.postObj = chkTicket[0].mention;
    this._postDetailService.isBulk = true;
    this._postDetailService.pagetype = this.pageType;
    this._postAssignToService.getAssignedUsersList(
      this.currentUser,
      chkTicket[0].mention.makerCheckerMetadata.workflowStatus
    );
    this.dialog.open(PostAssigntoComponent, {
      autoFocus: false,
      width: '650px',
    });
  }

  bulkonHold(): void {
    const ValidationData = this.ValidateTicketsToBeOnHold();
    if (ValidationData.IsValid) {
      let isTicket = false;
      if (this.pageType === PostsType.Tickets) {
        isTicket = true;
      }
      const logs = [];
      const log = new TicketsCommunicationLog(ClientStatusEnum.OnHold);
      if (this.holdnote.trim()) {
        log.Note = this.holdnote ? this.holdnote : '';
      }
      logs.push(log);

      const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
      if (this.holdnote.trim()) {
        log1.Note = this.holdnote ? this.holdnote : '';
      }
      log1.NotesAttachment = this._replyService?.selectedNoteMediaVal;
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

      const sourceobj = {
        PerformedAction: PerformedAction.OnHoldAgent,
        IsTicket: isTicket,
        IsReplyModified: false,
        ActionTaken: 0,
        Tasks: logs,
        BulkReplyRequests: BulkObject,
      };

      this._replyService.BulkTicketAction(sourceobj).subscribe((data) => {
        if(data?.success){
          let message = '';
          this._ticketService.selectedPostList = [];
          this._ticketService.postSelectTriggerSignal.set(0);
          this._postDetailService.isBulk = false;
          message = this.translate.instant('Bulk-Onhold-successful');
          // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
          const CountData = {
            MentionCount: null,
            tab: this.postDetailTab.tab,
            posttype: PostsType.Tickets,
          };
          // this._filterService.currentCountData.next(CountData);
          this._filterService.currentCountDataSignal.set(CountData);

          // this.dialogRef.close(true);
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: message,
            },
          });
        }
        else{
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data?.message : this.translate.instant('Some-Error-Occurred'),
            },
          });
        }

        return data;
        // this.zone.run(() => {
      });
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: ValidationData.Message,
        },
      });
    }
  }

  bulkReopen(): void {
    const ValidationData = this.ValidateTicketsToBeReopened();
    if (ValidationData.IsValid) {
      let isTicket = false;
      if (this.pageType === PostsType.Tickets) {
        isTicket = true;
      }
      const logs = [];
      const log = new TicketsCommunicationLog(ClientStatusEnum.ReopenACase);
      if (this.reopennote.trim()) {
        log.Note = this.reopennote ? this.reopennote : '';
      }
      logs.push(log);

      const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
      if (this.reopennote.trim()) {
        log1.Note = this.reopennote ? this.reopennote : '';
      }
      log1.NotesAttachment = this._replyService?.selectedNoteMediaVal;
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

      const sourceobj = {
        PerformedAction: PerformedAction.ReopenCase,
        IsTicket: isTicket,
        IsReplyModified: false,
        ActionTaken: 0,
        Tasks: logs,
        BulkReplyRequests: BulkObject,
      };

      this._replyService.BulkActionAPI(sourceobj, PerformedAction.ReopenCase);
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: ValidationData.Message,
        },
      });
    }
  }

  bulkReplyApproved(): void {
    const CaBulkReply = this.IsValidToBulkApprove();
    if (CaBulkReply.success) {
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
        };

        BulkObject.push(properties);
      }

      const sourceobj = {
        SourceArray: BulkObject,
        ActionTaken: 0,
        CurrentTicketStatus: 3,
      };

      this._replyService.BulkReplyApproved(sourceobj).subscribe((data) => {
        const message = this.translate.instant('Bulk-Reply-Approved-successful');
        this._ticketService.selectedPostList = [];
        this._ticketService.postSelectTriggerSignal.set(0);
        //this._ticketService.bulkMentionChecked = [];
        this._postDetailService.isBulk = false;
        // console.log(message, data);
        // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
        // this.dialogRef.close(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: message,
          },
        });
        this.bulkAction('dismiss');
        // this.zone.run(() => {
      });
    } else {
      if (CaBulkReply.message) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: CaBulkReply.message,
          },
        });
      }
    }
  }

  bulkreplyRejected(): void {
    const BulkObject = [];
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    const SelectedTicketsReplyInitiated = chkTicket
      .map((s) => s.mention.replyInitiated)
      .filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Previous-request-pending-for-this-ticket'),
        },
      });
    } else {
      for (const checkedticket of chkTicket) {
        const properties = {
          ReplyFromAccountId: 0,
          ReplyFromAuthorSocialId: '',
          TicketID: checkedticket.mention.ticketInfo.ticketID,
          TagID: checkedticket.mention.tagID,
          BrandID: checkedticket.mention.brandInfo.brandID,
          BrandName: checkedticket.mention.brandInfo.brandName,
          ChannelGroup: checkedticket.mention.channelGroup,
          ChannelType: checkedticket.mention.channelType,
        };

        BulkObject.push(properties);
      }

      const sourceobj = {
        SourceArray: BulkObject,
        RejectionNote: this.rejectnote ? this.rejectnote : '',
      };

      this._replyService.BulkReplyRejection(sourceobj).subscribe((data) => {
        const message = this.translate.instant('Bulk-Reply-Rejected-successful');
        this._ticketService.selectedPostList = [];
        this._ticketService.postSelectTriggerSignal.set(0);
        //this._ticketService.bulkMentionChecked = [];
        // console.log(message, data);
        // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
        // this.dialogRef.close(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: message,
          },
        });
        this.bulkAction('dismiss');
        // this.zone.run(() => {
      });
    }
  }

  IsValidToBulkApprove(): any {
    let isTicket = false;
    if (this.pageType === PostsType.Tickets) {
      isTicket = true;
    }
    const SelectedMentionsOrTickets =
      this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
    const AllSeclectedMentions = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    const BrandReplies = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    let message = '';
    const SelectedMentionOrTicketsSources = new Array();
    const SelectedMentionOrTicketBrandIDs = new Array();
    const SelectedMentionOrTicketChannelGroup = new Array();
    const SelectedMentionOrTicketAlreadyInitiated = new Array();
    const SelectedMentionOrTicketBelongsToSamePage = new Array();

    const SelectedMentionOrTicketIsSentForApproval = new Array();
    const SelectedMentionOrSSRETicket = new Array();

    for (const checkedticket of SelectedMentionsOrTickets) {
      const currentElement = checkedticket;
      const ObjectToSave = {
        Source: checkedticket,
        TagID: checkedticket.mention.tagID,
        TicketID: checkedticket.mention.ticketInfo.ticketID,
        ChannelGroup: checkedticket.mention.channelGroup,
        TicketStatus: checkedticket.mention.ticketInfo.status,
      };

      SelectedMentionOrTicketsSources.push(ObjectToSave);
      SelectedMentionOrTicketBrandIDs.push(
        checkedticket.mention.brandInfo.brandID
      );
      SelectedMentionOrTicketChannelGroup.push(
        checkedticket.mention.channelGroup
      );

      let BulkRequestInitiated = checkedticket.mention.replyInitiated;
      if (BulkRequestInitiated) {
        BulkRequestInitiated = true;
      } else {
        BulkRequestInitiated = false;
      }

      SelectedMentionOrTicketAlreadyInitiated.push(BulkRequestInitiated);
    }

    if (SelectedMentionsOrTickets.length > 0) {
      return {
        success: true,
        SelectedMentionOrTicketsSources,
      };
    } else {
      return {
        success: false,
        message,
      };
    }
  }

  GetBulkTagggingCategoryFromOutSide(): void {
    let IsTwitter = false;

    const TwitterChannelTypes = [
      ChannelType.PublicTweets,
      ChannelType.Twitterbrandmention,
      ChannelType.BrandTweets,
    ];

    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    for (const checkedticket of chkTicket) {
      const channelId = checkedticket.mention.channelType;
      if (TwitterChannelTypes.indexOf(channelId) > -1) {
        IsTwitter = true;
      }
    }

    if (IsTwitter) {
      // $("#tagAlltagcategory").show();
    } else {
      // $("#tagAlltagcategory").hide();
    }

    // InitializeTagControl();
    // $('#ulControl input:radio').click(function () {
    //   $(this).attr('checked', 'checked');
    // });
    // //Show hide
    // $('.categorycb input').each(function () {
    //   if (this.checked) {
    //     $(this).removeAttr('checked');
    //   };
    // });
    // $('.Departmentcb input').each(function () {
    //   if (this.checked) {
    //     $(this).removeAttr('checked');
    //   };
    // });
    // $('.SubCategorycb input').each(function () {
    //   if (this.checked) {
    //     $(this).removeAttr('checked');
    //   };
    // });
    // $('.spCategoryRDs input').each(function () {
    //   if (this.checked) {
    //     $(this).removeAttr('checked');
    //   };
    // });
    // $('.spDepartmentRDs input').each(function () {
    //   if (this.checked) {
    //     $(this).removeAttr('checked');
    //   };
    // });
    // $('.spSubCategoryRDs input').each(function () {
    //   if (this.checked) {
    //     $(this).removeAttr('checked');
    //   };
    // });

    // $(".ulDepartments").hide();
    // $(".ulSubcategory").hide();
    // $(".spCategoryRDs").hide();
    const tagIds = [];
    let CatBrandID;
    let CategoryGroupIDs = [];
    let logicalGroupCategoryIDs =[]
    let IsCategoryGroupSame = false;
    const brandList = this._filterService.fetchedBrandData;

    if (
      brandList.map((s) => s.categoryGroupID).filter(this.onlyUnique).length ===
      1
    ) {
      IsCategoryGroupSame = true;
    } else {
      IsCategoryGroupSame = false;
    }

    for (const checkedticket of chkTicket) {
      //tagIds.push(item.value);

      CatBrandID = checkedticket.mention.brandInfo.brandID;
      const isworkflowenabled = this._filterService.fetchedBrandData.find(
        (brand: BrandList) =>
          +brand.brandID === checkedticket.mention.brandInfo.brandID
      );
      CategoryGroupIDs.push(isworkflowenabled.categoryGroupID);
    }
    const filter = this._navigationService.getFilterJsonBasedOnTabGUID(this._navigationService?.currentSelectedTab?.guid)
    if(this.clickhouseEnabled && this.selectAllBulk)
      {
      if (filter?.brandGroups?.length>0)
          {
            filter?.brandGroups?.forEach((x)=>{
              const logicalGroupObj = this._filterService?.fetchedLogicalGroupData?.find((res)=>res.brandGroup==x.brandGroup);
              if(logicalGroupObj)
                {
                  logicalGroupObj?.brandIDs?.forEach((res)=>{
                    const brandObj = this._filterService?.fetchedBrandData?.find((z) => z.brandID == res);
                    if(brandObj)
                      {
                      logicalGroupCategoryIDs.push(brandObj.categoryGroupID)
                      }
                  })
                }
            })
          logicalGroupCategoryIDs = logicalGroupCategoryIDs.map((s) => s).filter(this.onlyUnique);
          }
      if (filter?.brands?.length > 0) {
        filter?.brands?.forEach((x) => {
              const brandObj = this._filterService?.fetchedBrandData?.find((z) => z.brandID == x.brandID);
              if (brandObj) {
                logicalGroupCategoryIDs.push(brandObj.categoryGroupID)
              }
            })
          }
        logicalGroupCategoryIDs = logicalGroupCategoryIDs.map((s) => s).filter(this.onlyUnique);
      }

    CategoryGroupIDs = CategoryGroupIDs.map((s) => s).filter(this.onlyUnique);
    if (CategoryGroupIDs.length !== 1) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: (this.clickhouseEnabled && this.selectAllBulk) ? filter?.brands?.length > 0 ? this.translate.instant('Multiple-category-groups-exist-for-selected-brands') : this.translate.instant('Multiple-category-groups-exist-for-selected-logical-groups') : this.translate.instant('Please-select-mentions-with-same-category-map-for-tagging'),
        },
      });
      return;
    } else if (this.clickhouseEnabled && this.selectAllBulk && logicalGroupCategoryIDs?.length > 1)
      {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 7000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Multiple-category-groups-exist-for-selected-brands-logical-groups', { type: (filter?.brands?.length > 0) ? 'brands' : 'logical groups' }),
        },
      });
      return;
      } else if (!IsCategoryGroupSame) {
      // if (this.pageType === PostsType.Tickets) {
      //   this.openbulkCategoryDialog('ticketCategory');
      // }
      // else {
      this.openbulkCategoryDialog('mentionCategory');
      // }
    } else {
      // if (this.pageType === PostsType.Tickets) {
      //   this.openbulkCategoryDialog('ticketCategory');
      // }
      // else {
      this.openbulkCategoryDialog('mentionCategory');
      // }
    }
  }

  openbulkCategoryDialog(event): void {
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    const postObjList = [];
    chkTicket.forEach((obj) => {
      obj.mention.categoryMapText = null;
      postObjList.push(obj.mention);
    });
    chkTicket[0].mention.categoryMapText = null;
    this._postDetailService.postObj = chkTicket[0].mention;
    this._postDetailService.categoryType = event;
    this._postDetailService.isBulk = true;
    this._postDetailService.pagetype = this.pageType;
    this._postDetailService.isBulkQualified =this.selectAllBulk?true:false;
    this._postDetailService.mentionCount=this.ticketsFound;
    this._postDetailService.groupedView = this.mentionOrGroupView == AllMentionGroupView.groupView ? true : false;
    this._postDetailService.childOrParentFlag=false
    const dialogRef = this.dialog.open(CategoryFilterComponent, {
      width: '73vw',
      disableClose: false,
    });

    /* via bulk mention category not update instantly */
    /* dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        postObjList.forEach((obj) => {
          obj.categoryMap = result.categoryData;
          this._ticketService.ticketcategoryMapChange.next(obj);
        });
      }
    }); */
    /* via bulk mention category not update instantly */
  }

  bulkpostselect(checked): void {
    this.bulkActionEvent.emit('selectAll');
  }

  selectAllQualifiedMentions()
  {
    this.showSelected = false; 
    this.selectedAllMentions = true
    this.bulkActionEvent.emit('qualifiedMention');
  }

  excludebrandmention(checked): void {
    if (checked) {
      this.isexcludebrandmention = true;
      localStorage.setItem(
        'isexcludebrandmention_' + this.currentUser.data.user.userId,
        '1'
      );
    } else {
      this.isexcludebrandmention = false;
      localStorage.setItem(
        'isexcludebrandmention_' + this.currentUser.data.user.userId,
        '0'
      );
    }

    this.bulkActionEvent.emit('excludebrand');
  }

  bulkdelete(): void {
    const BulkObject = [];
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    const SelectedTicketsReplyInitiated = chkTicket
      .map((s) => s.mention.replyInitiated)
      .filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Previous-request-pending-for-this-ticket'),
        },
      });
    } else {
      for (const checkedticket of chkTicket) {
        let properties = {
          contentID: checkedticket.mention.contentID,
          TagID: checkedticket.mention.tagID,
          ChannelType: checkedticket.mention.channelType,
          BrandID: checkedticket.mention.brandInfo.brandID,
          BrandName: checkedticket.mention.brandInfo.brandName,
          StrTagID: ''
        };
        if (this.clickhouseEnabled && this.mentionOrGroupView == AllMentionGroupView.groupView) {
          properties.StrTagID = checkedticket.mention.socialIdForunseenCount
        }

        BulkObject.push(properties);
      }

      const sourceobj = {
        BulkObject,
      };

      let endpoint = '';
      
      if(this.mentionOrGroupView == AllMentionGroupView.groupView)
        {
        endpoint ='/Tickets/MentionBulkDeletegroupview'
        }

      this._replyService.BulkDelete(BulkObject, endpoint).subscribe((data) => {
        const message = this.translate.instant('Bulk-Delete-successful');
        this._ticketService.selectedPostList = [];
        this._ticketService.postSelectTriggerSignal.set(0);
        //this._ticketService.bulkMentionChecked = [];
        this._postDetailService.isBulk = false;
        // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
        this._ticketService.bulkDeleteObs.next({ guid: this.postDetailTab?.guid, bulkList: BulkObject, updateListFlag:false })
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: message,
          },
        });
        this.bulkAction('dismiss');
        // this.zone.run(() => {
      });
    }
  }

  CreateTicketMultipleMentions(flag): void {
    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    const SelectedTicketsReplyInitiated = SelectedTickets.map(
      (s) => s.mention.replyInitiated
    ).filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Previous-request-pending-for-this-ticket'),
        },
      });
      this.createticketnote = '';
      this.clickBulkTicketMenuTrigger.closeMenu();
    } else {
      const IsReadList = SelectedTickets.filter(
        (s) => s.mention.allMentionInThisTicketIsRead === false && s.mention?.channelGroup == ChannelGroup.Email
      );
      if (IsReadList.length > 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message:
              this.translate.instant('Please-read-mentions'),
          },
        });
        this.createticketnote = '';
        this.clickBulkTicketMenuTrigger.closeMenu();
      } else {
        const Brandselection = SelectedTickets.filter(
          (s) => s.mention.isBrandPost === true
        );
        if (Brandselection.length > 0) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-select-only-user-mentions'),
            },
          });
          this.createticketnote = '';
          this.clickBulkTicketMenuTrigger.closeMenu();
          return;
        } else {
          if (flag === 2) {
            this.createTicketStatus = 99;
          }

          const tagIds = [];
          const ticketIds = [];
          const MentionIDs = [];
          let errorflag = false;
          const CloseTicket = [];
          const EscalatedPending = [];
          const bulkcreateTicket: BulkOperationObject[] = [];
          for (const checkedticket of SelectedTickets) {
            const ticketstatus = checkedticket.mention.ticketInfo.status;
            if (ticketstatus === TicketStatus.Close) {
              CloseTicket.push('Close');
            }

            if (
              ticketstatus === TicketStatus.PendingwithCSDWithNewMention ||
              ticketstatus === TicketStatus.OnHoldCSDWithNewMention ||
              ticketstatus === TicketStatus.PendingWithBrandWithNewMention ||
              ticketstatus === TicketStatus.RejectedByBrandWithNewMention ||
              ticketstatus === TicketStatus.OnHoldBrandWithNewMention
            ) {
              EscalatedPending.push('Close');
            }
            if (!errorflag) {
              const tagid = checkedticket.mention.tagID;
              const ticketid = checkedticket.mention.ticketInfo.ticketID;
              const MentionID =
                checkedticket.mention.brandInfo.brandID +
                '/' +
                checkedticket.mention.channelType +
                '/' +
                checkedticket.mention.contentID;

              MentionIDs.push(MentionID);
              tagIds.push(tagid);
              if (ticketIds.length === 0) {
                ticketIds.push(ticketid);
              } else {
                if (ticketIds.indexOf(ticketid) > -1) {
                  ticketIds.push(ticketid);
                } else {
                  errorflag = true;
                }
              }
            }
          }
          if (CloseTicket.length > 0) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Select-Closed-Ticket'),
              },
            });
            this.createticketnote = '';
            this.clickBulkTicketMenuTrigger.closeMenu();
            return;
          }

          if (!errorflag) {
            if (flag === 1) {
              if (EscalatedPending.length > 0) {
                this._ticketService
                  .CheckTicketIfPendingWithnewMention(bulkcreateTicket)
                  .subscribe((resp) => {
                    if (resp.success) {
                      if (Number(resp.data) !== 3) {
                        this.createTicketStatus = Number(resp.data);
                      } else {
                        this._snackBar.openFromComponent(
                          CustomSnackbarComponent,
                          {
                            duration: 5000,
                            data: {
                              type: notificationType.Error,
                              message: this.translate.instant('Select-Closed-Ticket'),
                            },
                          }
                        );
                        return;
                      }
                    }
                  });
              } else {
                this.createTicketStatus = 99;
                this.clickBulkTicketMenuTrigger.openMenu();
              }
            } else {
              const TicketID = ticketIds[0];

              this._ticketService
                .getMentionCountByTicektID(TicketID)
                .subscribe((data) => {
                  if (data.success) {
                    if (data === ticketIds.length) {
                      this._snackBar.openFromComponent(
                        CustomSnackbarComponent,
                        {
                          duration: 5000,
                          data: {
                            type: notificationType.Warn,
                            message:
                              this.translate.instant('Select-Mentions-Ticket'),
                          },
                        }
                      );
                      this.createticketnote = '';
                      this.clickBulkTicketMenuTrigger.closeMenu();
                    } else {
                      if (+data.data === 1) {
                        this._snackBar.openFromComponent(
                          CustomSnackbarComponent,
                          {
                            duration: 5000,
                            data: {
                              type: notificationType.Warn,
                              message: this.translate.instant('Ticket-multiple-mentions'),
                            },
                          }
                        );
                        this.createticketnote = '';
                        this.clickBulkTicketMenuTrigger.closeMenu();
                      } else {
                        const performActionObj = this._replyService.BuildReply(
                          SelectedTickets[0].mention,
                          ActionStatusEnum.CreateTicket,
                          this.createticketnote
                        );

                        const keyobj: CreateAttachMultipleMentionParam = {
                          tasks: this.MapLocobuzz.mapCommunicationLog(
                            performActionObj.Tasks
                          ),
                          ticketIDs: ticketIds,
                          tagIds,
                          mentionIDs: MentionIDs,
                          source: performActionObj.Source,
                          status: this.createTicketStatus,
                          actionType: 1,
                          isTicketGoingForApproval: false,
                          actionTaken: ActionTaken.Locobuzz,
                        };

                        this._replyService
                          .CreateAttachMultipleMentions(keyobj)
                          .subscribe((data) => {
                            if (data.success) {
                              // this._ticketService.ticketStatusChange.next(true);
                              this._ticketService.ticketStatusChangeSignal.set(true);
                                const msg = this.translate.instant('User-detached-mentions-created-ticket', {
                                username: this.currentUser.data.user.username,
                                mentionCount: ticketIds.length,
                                ticketId: data.data.newTicketID,
                                });
                              this.bulkAction('dismiss');
                              this._snackBar.openFromComponent(
                                CustomSnackbarComponent,
                                {
                                  duration: 5000,
                                  data: {
                                    type: notificationType.Success,
                                    message: msg,
                                  },
                                }
                              );
                            } else {
                              this._snackBar.openFromComponent(
                                CustomSnackbarComponent,
                                {
                                  duration: 5000,
                                  data: {
                                    type: notificationType.Error,
                                    message: data?.message ? data.message : this.translate.instant('Some-Error-Occurred'),
                                  },
                                }
                              );
                              this.createticketnote = '';
                              this.clickBulkTicketMenuTrigger.closeMenu();
                            }
                            // this.zone.run(() => {
                          });
                      }
                    }
                  } else {
                    this._snackBar.openFromComponent(CustomSnackbarComponent, {
                      duration: 5000,
                      data: {
                        type: notificationType.Error,
                        message: data?.message ? data.message : this.translate.instant('Some-Error-Occurred'),
                      },
                    });
                    this.createticketnote = '';
                    this.clickBulkTicketMenuTrigger.closeMenu();
                  }
                });
            }
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Select-mention-different'),
              },
            });
            return;
          }
        }
      }
    }
  }

  bulkAttach(): void {
    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    const SelectedTicketsReplyInitiated = SelectedTickets.map(
      (s) => s.mention.replyInitiated
    ).filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Previous-request-pending-for-this-ticket'),
        },
      });
    } else {
      const IsReadList = SelectedTickets.filter(
        (s) => s.mention.allMentionInThisTicketIsRead === false && s.mention?.channelGroup == ChannelGroup.Email
      );
      if (IsReadList.length > 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Mentions-before-performing'),
          },
        });
      }
      const Brandselection = SelectedTickets.filter(
        (s) => s.mention.isBrandPost === true
      );
      if (Brandselection.length > 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Select-User-Mentions'),
          },
        });
        return;
      } else {
        const ticketIds = [];
        let errorflag = false;
        for (const checkedticket of SelectedTickets) {
          const ticketid = checkedticket.mention.ticketInfo.ticketID;
          if (ticketIds.length === 0) {
            ticketIds.push(ticketid);
          } else {
            if (ticketIds.indexOf(ticketid) > -1) {
              ticketIds.push(ticketid);
            } else {
              errorflag = true;
            }
          }
        }
        if (!errorflag) {
          this._postDetailService.isBulk = true;
          const replyPostRef = this._bottomSheet.open(AttachTicketComponent, {
            ariaLabel: 'Attach Ticket',
            panelClass: 'post-reply__wrapper',
            backdropClass: 'no-blur',
            data: { CurrentPost: SelectedTickets[0].mention },
          });
          this.bulkAction('dismiss');
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Select-mention-different'),
            },
          });
          return;
        }
      }
    }
  }

  clearnote(): void {
    this.createticketnote = '';
    this.holdnote = '';
    this.rejectnote = '';
    this.reopennote = '';
    this.approvenote = '';
    this.ticketRejectednote = '';
    this.closingNote = '';
    this._replyService.clearNoteAttachmentSignal.set(null);
    this._replyService.clearNoteAttachmentSignal.set(true);
  }

  getTicketsCheckboxCount(): number {
    let count = 0;
    this._ticketService.MentionListObj.forEach((obj) => {
      let ticketHistoryData = this._footService.SetUserRole(
        this.pageType,
        {},
        this.currentUser,
        obj
      );
      ticketHistoryData = this._footService.SetBulkCheckbox(
        this.pageType,
        this.currentUser,
        ticketHistoryData,
        obj
      );
      if (ticketHistoryData && ticketHistoryData.showcheckbox) {
        count++;
      }
    });
    return count;
  }

  ticketDispositionDialog(qualifiedTickets?, aiTagEnabled?): void {
    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    let despositionObj:any = {
      baseMention: SelectedTickets[0]?.mention,
      dispositionList: this.ticketDispositionList,
      qualifiedTickets: qualifiedTickets
    }
    if (aiTagEnabled) {
      despositionObj.dispositionOff = true;
    }
    const dialogRef = this.dialog.open(TicketDispositionComponent, {
      width: aiTagEnabled ? '55vw' : (this.isAITicketTagEnabled && this.isAIInsightsEnabled) ? '72vw' : '55vw',
      data: despositionObj,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        this.dispositionDetails = res;
        this.directCloseCommonFunc(true, qualifiedTickets);
      }
    });
  }

  directCloseCommonFunc(dispositionFlag, qualifiedTickets): void {
    let brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == qualifiedTickets[0].mention?.brandInfo?.brandID
    );
    brandInfo.isShowTicketIntelligenceNotification = false;
    this.isAITicketTagEnabled = brandInfo.aiTagEnabled;
    this.isAIInsightsEnabled = brandInfo?.isShowTicketIntelligenceNotification;
    if (
      brandInfo &&
      brandInfo.isTicketDispositionFeatureEnabled && !dispositionFlag && this.ticketDispositionList.length > 0
    ) {
      this.ticketDispositionDialog(qualifiedTickets);
      return;
    } else if (brandInfo.aiTagEnabled && brandInfo?.isShowTicketIntelligenceNotification && !dispositionFlag) {
      this.ticketDispositionDialog(qualifiedTickets, true);
      return;
    }

    const prop:any = {
      action: PerformedAction.DirectClose,
      guid: this._navigationService.currentSelectedTab.guid,
      currentteamid: +this.currentUser.data.user.teamID,
      userrole: +this.currentUser.data.user.role,
      pageType: this.pageType,
      agentWorkFlowEnabled: this.currentUser.data.user.agentWorkFlowEnabled,
    };
    if (this.dispositionDetails && (this.dispositionDetails?.isAllMentionUnderTicketId == true || this.dispositionDetails?.isAllMentionUnderTicketId == false)) {
      prop.isAllMentionUnderTicketId = this.dispositionDetails?.isAllMentionUnderTicketId;
    }
    if (this.dispositionDetails) {
      this.dispositionDetails.isAutoTicketCategorizationEnabled =
        brandInfo.isAutoTicketCategorizationEnabled;
      this.dispositionDetails.showTicketCategory = !!brandInfo?.isTicketCategoryTagEnable;
    }
    this._replyService.ConfirmBulkTicketAction(prop, this.dispositionDetails, false, null , this.closingNote);
  }

  checkAllEmailMentionRead(actionFlag: string, dispositionFlag?):void{

      const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

     const IsEmailChannel = SelectedTickets.some(
      (s) => s.mention.channelGroup === ChannelGroup.Email
    );
    const IsNotReadList = SelectedTickets.some(
      (s) => s.mention.allMentionInThisTicketIsRead === false
    );
    if (IsEmailChannel) {
      if (IsNotReadList)
      {
      const obj = {
        brandID: SelectedTickets[0].mention.brandInfo.brandID,
        brandName: SelectedTickets[0].mention.brandInfo.brandName,
      };
      this._replyService.GetBrandMentionReadSetting(obj).subscribe((resp) => {
        // console.log('reply approved successfull ', data);
        if (resp) {
          if (resp.isMentionReadCompulsory) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-read-mentions-before-performing-bulk-action', { actionFlag })
              },
            });
          return
          }else{
            this.callFunctionBasedOnFlag(dispositionFlag,actionFlag)
          }
        }
      })

    }
      else {
        this.callFunctionBasedOnFlag(dispositionFlag,actionFlag)
      }
    }else{
      this.callFunctionBasedOnFlag(dispositionFlag,actionFlag)
    }
  }

  callFunctionBasedOnFlag(dispositionFlag,actionType):void{
   if(actionType=='direct close')
   {
     this.GetBulkDirectClose(dispositionFlag)
   }else if(actionType=='on hold')
   {
    this.bulkonHold()
   } else if(actionType=='escalate')
   {
    this.getbulkEscalate();
   }
  }

  getbulkEscalate()
  {
    const ValidationData = this.ValidateTicketsToBeEscalate();
    if (ValidationData.IsValid) {
      const qualifiedforapproval = [];
      let isticketagentworkflowenabled = false;
      const GoingForApproval = [];
      let TotalTickets = 0;
      const qualifiedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
      TotalTickets = qualifiedTickets.length;
      let ticketormention = '';
      if (this.pageType === PostsType.Tickets) {
        ticketormention = 'Tickets';
      } else {
        ticketormention = 'Mentions';
      }
      if (qualifiedTickets.length > 0) {
        for (const checkedticket of qualifiedTickets) {
          isticketagentworkflowenabled =
            checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled;

          const isworkflowenabled = this._filterService.fetchedBrandData.find(
            (brand: BrandList) =>
              +brand.brandID === checkedticket.mention.brandInfo.brandID
          );
          if (
            +this.currentUser.data.user.role === UserRoleEnum.Agent &&
            isworkflowenabled.isEnableReplyApprovalWorkFlow &&
            (this.currentUser.data.user.agentWorkFlowEnabled ||
              isticketagentworkflowenabled)
          ) {
            qualifiedforapproval.push(this);
            GoingForApproval.push(isticketagentworkflowenabled);
          }
        }
        if (GoingForApproval.length > 0) {
            const dialogData = new AlertDialogModel(
            this.translate.instant('Tickets-qualified-for-escalate', { GoingForApproval: GoingForApproval.length, TotalTickets }),
            '',
            this.translate.instant('Continue')
            );
          const dialogRef = this.dialog.open(AlertPopupComponent, {
            disableClose: true,
            autoFocus: false,
            data: dialogData,
          });
          dialogRef.afterClosed().subscribe((dialogResult) => {
            if (dialogResult) {
              this._postDetailService.postObj = qualifiedTickets[0].mention;
              this._postDetailService.pagetype = this.pageType;
              this._postDetailService.isBulk = true;
              const replyPostRef = this._bottomSheet.open(
                PostReplyComponent,
                {
                  ariaLabel: 'Reply',
                  panelClass: 'post-reply__wrapper',
                  backdropClass: 'no-blur',
                  data: {
                    onlyEscalation: true,
                    inBottomSheet: true,
                    bulkmessage: this.translate.instant('Bulk-Escalate-On', { count: this._ticketService.bulkMentionChecked.length }) + ' ' + this.translate.instant(ticketormention),
                  },
                }
              );
            } else {
            }
          });
        } else {
          // show escalate popup
          this._postDetailService.postObj = qualifiedTickets[0].mention;
          this._postDetailService.pagetype = this.pageType;
          this._postDetailService.isBulk = true;
          const replyPostRef = this._bottomSheet.open(PostReplyComponent, {
            ariaLabel: 'Reply',
            panelClass: 'post-reply__wrapper',
            backdropClass: 'no-blur',
            data: {
              onlyEscalation: true,
              inBottomSheet: true,
              pageType: this.pageType,
              bulkmessage: this.translate.instant('Bulk-Escalate-On', { count: this._ticketService.bulkMentionChecked.length }) + ' ' + this.translate.instant(ticketormention)
            },
          });
        }
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: ValidationData.Message,
        },
      });
    }
  }


  deleteAllQualifiedCategory(): void {
    const dialogRef = this.dialog.open(ClickhouseBulkPopupComponent, {
      data: {},
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        const obj = {
          filter: this._navigationService.getFilterJsonBasedOnTabGUID(this._navigationService.currentSelectedTab.guid),
          mentionCount:this.ticketsFound,
          IsgroupView: this.mentionOrGroupView==AllMentionGroupView.groupView?true:false
        }

        this._ticketService.deleteBulkQualifedFilter(obj).subscribe((res) => {
          if (res?.success) {
            const tagIDObj = [];
            this._ticketService.bulkMentionChecked.forEach(element => {
              tagIDObj.push({ TagID: element.mention.tagID })
            });
            this._ticketService.bulkDeleteObs.next({ guid: this.postDetailTab?.guid, bulkList: tagIDObj,updateListFlag:true })
            this.sidebarService.bulkProgressSub.next(true)
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Data-processing-initiated'),
              },
            });
          }else
          {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: res?.message,
              },
            });
          }
        }, err => {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something-went-wrong'),
            },
          });
        })
      }
    })
  }

  bulkActionClick() {
    this.selectedTicketBrandId = [...new Set(this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    ).map((x) => x.mention.brandInfo.brandID))];
  }

  bulkdeletefromchannel(): void {
    const BulkObject = [];
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    for (const checkedticket of chkTicket) {
      const account = this._mapLocobuzz.mapAccountConfiguration(checkedticket.mention);

      account.BrandInformation = checkedticket.mention.brandInfo;
      account.ChannelGroup = checkedticket.mention.channelGroup;
      account.SocialID = checkedticket.mention.author.socialId;

      const source = this._mapLocobuzz.mapMention(checkedticket.mention);
      BulkObject.push({
        Source: source,
        Account: account,
      });
    }

    this._ticketService.BulkDeleteFromSocial(BulkObject).subscribe((data) => {
      const message = this.translate.instant('Successfully-deleted-from-Social');
      this._ticketService.selectedPostList = [];
      this._ticketService.postSelectTriggerSignal.set(0);
      //this._ticketService.bulkMentionChecked = [];
      this._postDetailService.isBulk = false;
      // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
      this._ticketService.bulkDeleteObs.next({ guid: this.postDetailTab?.guid, bulkList: BulkObject, updateListFlag: false })
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: message,
        },
      });
      this.bulkAction('dismiss');
      // this.zone.run(() => {
    });
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

  markAsSeenOrUnseen(flag:number):void{
    if(this.selectAllBulk)
      {
      const dialogRef = this.dialog.open(ClickhouseBulkPopupComponent, {
        data: {
          actionType: 0
        },
        autoFocus: false,
      });
      dialogRef.afterClosed().subscribe((res) => {
        if (res) {

      const chkTicket = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
      const list = []
      chkTicket.forEach(element => {
        list.push(
          {
            PostSocialId: element.mention.socialID,
            UniqueId: element.mention?.ticketInfo?.uniqueId,
            IsGroupView: true,
            Ismarkseen: flag,
            Tagid: element.mention?.tagID,
            Brandid: element.mention?.brandInfo?.brandID,
            Createddate: element.mention?.ticketInfo?.createdDate,
            ChannelGroupId:element?.mention?.channelGroup,
            ChannelType: element?.mention?.channelType
          }
        )
      });
            let dialogData = new AlertDialogModel(
            this.translate.instant(flag == 1 ? 'Marking-these-mentions-as-read-will-also-mark-related-mentions-as-read-in-this-duration' : 'Marking-these-mentions-as-unread-will-also-mark-related-mentions-as-unread-in-this-duration'),
            '',
            this.translate.instant(flag == 1 ? 'Mark-As-read' : 'Mark-As-unread'),
            this.translate.instant('Cancel'),
            );
          dialogData.isGroupview = true;
          const dialogRef = this.dialog.open(AlertPopupComponent, {
            disableClose: true,
            autoFocus: false,
            data: dialogData,
          });
          dialogRef.componentInstance.fullThreadChecked.subscribe((checked) => {
            this.isfullThreadSelected = checked;
          });

          dialogRef.afterClosed().subscribe((dialogResult) => {
            if (dialogResult){
            const obj = {
              filter: {...this._navigationService.getFilterJsonBasedOnTabGUID(this._navigationService.currentSelectedTab.guid),
                isDaterange: !this.isfullThreadSelected,
                startDateEpoch1: !this.isfullThreadSelected? this.filterObj?.startDateEpoch: null,
                endDateEpoch1: !this.isfullThreadSelected ?  this.filterObj?.endDateEpoch:null,
              },
              IsGroupView: true,
              Ismarkseen: flag,
              mentionCount:this.ticketsFound
            }
      this._ticketService.updateQualifiedBulkSeenUnseen(obj).subscribe((res) => {
        if (res?.success) {
          if (flag == 0)
            {
               this.showMarkAsSeen = false;
               this.showMarkAsUnSeen = true;
            }else{
            this.showMarkAsSeen = true;
            this.showMarkAsUnSeen = false;
            }
          this._ticketService.updateBulkMentionSeenUnseen.next({ guid: this.postDetailTab?.guid, list: list })
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Mention-marked-as-successfully', { status: flag == 1 ? 'Read' : 'Unread' }),
            },
            });;
          if (this.isfullThreadSelected){
            this.isfullThreadSelected=false
          }
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: res.message ? res.message : this.translate.instant('Something-went-wrong'),
            },
          });
        }
      }, err => {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something-went-wrong'),
          },
        });
      }
      ) }
      else{
          return
      }
    })
        }
      })
      }else
      {
      if (!localStorage.getItem('markAsSeenPopupDisabled')) {
  let dialogData = new AlertDialogModel(
    this.translate.instant('Marking-these-mentions-will-also-mark-related-mentions-in-this-duration', { status: flag == 1 ? 'Read' : 'Unread' }),
    '',
    this.translate.instant('Mark-As', { status: flag == 1 ? 'read' : 'unread' }),
    this.translate.instant('Cancel'),
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
        dialogRef.componentInstance.fullThreadChecked.subscribe((checked) => {
          this.isfullThreadSelected = checked;
        });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
      this.bulkSeenUneenApiCall(flag)
      }
  })
}else{
  this.bulkSeenUneenApiCall(flag)
}
}
  }

  bulkSeenUneenApiCall(flag:number):void{
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    const list = []
    let totalMentions=0
    chkTicket.forEach(element => {
      list.push(
        {
          PostSocialId: element.mention.socialIdForunseenCount,
          UniqueId: element.mention?.ticketInfo?.uniqueId,
          IsGroupView: true,
          Ismarkseen: flag,
          Tagid: element.mention?.tagID,
          Brandid: element.mention?.brandInfo?.brandID,
          Createddate: element.mention?.ticketInfo?.createdDate,
          ChannelGroupId: element?.mention?.channelGroup,
          ChannelType: element?.mention?.channelType
        }
      )
      totalMentions += element.mention.mentionMetadata.childmentioncount+1
    });
    let obj = {
      SelectedPosts: list,
      IsDateRange: !this.isfullThreadSelected ? true : false,
      StartDateEpoch: !this.isfullThreadSelected ? this.filterObj?.startDateEpoch : null,
      EndDateEpoch: !this.isfullThreadSelected ? this.filterObj?.endDateEpoch : null,
    }

    this._ticketService.updateBulkSeenUnseen(obj).subscribe((res) => {
      if (res?.success) {
        if (flag == 1) {
          this.showMarkAsSeen = false;
          this.showMarkAsUnSeen = true;
        } else {
          this.showMarkAsSeen = true;
          this.showMarkAsUnSeen = false;
        }
        this._ticketService.updateBulkMentionSeenUnseen.next({ guid: this.postDetailTab?.guid, list: list })
        this._tabService.seenUnseenTabCountUpdateObs.next({ guid: this.postDetailTab.guid, count: totalMentions, seenUnseen: flag });
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Mention-marked-as-successfully', { status: flag == 1 ? 'Read' : 'Unread' }),
          },
        });;
        if (this.isfullThreadSelected){
          this.isfullThreadSelected=false
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: res.message ? res.message : this.translate.instant('Something-went-wrong'),
          },
        });
      }
    }, err => {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something-went-wrong'),
        },
      });
    }
    )
  }
  getStartDateAndEndDate(){
    if (this.postDetailTab && this.postDetailTab?.tab && this.postDetailTab?.tab?.guid) this.filterObj = this._navigationService.getFilterJsonBasedOnTabGUID(this.postDetailTab?.tab?.guid);
  }

  GenerateClosingTicket(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const qualifiedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );

      const brandinfo = this._filterService.fetchedBrandData?.find(
        (brand: BrandList) =>
          +brand.brandID === qualifiedTickets[0]?.mention?.brandInfo?.brandID
      );
      if (brandinfo?.aiTagEnabled) {
        let payload = [];
        const qualifiedTickets = this._ticketService.bulkMentionChecked.filter(
          (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
        );
        if (qualifiedTickets && qualifiedTickets?.length) {
          for (const checkedTicket of qualifiedTickets) {
            if (checkedTicket?.mention) {
              const brandInfo = checkedTicket?.mention?.brandInfo;
              const obj = {
                brand_name: brandInfo?.brandName,
                brand_id: brandInfo?.brandID,
                author_id: checkedTicket?.mention?.author?.socialId,
                author_name: checkedTicket?.mention?.author?.name ? checkedTicket?.mention?.author?.name : '',
                channel_group_id: checkedTicket?.mention?.channelGroup,
                ticket_id: checkedTicket?.mention?.ticketID,
                channel_type: checkedTicket?.mention?.channelType,
                tag_id: checkedTicket?.mention?.tagID,
              }
              payload.push(obj);
            }
          }
        }
        this._aiTicketTagService.GenerateBulkClosingTicket(payload).subscribe((res) => {
          if (res.success) {
            this.genAiData = res.data[0].output[0];
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
              IsAIIntelligenceEnabled: brandinfo?.aiTagEnabled ? true : false,
              brandId: qualifiedTickets[0]?.mention?.brandInfo?.brandID,
              ticketID: qualifiedTickets[0]?.mention?.ticketID,
              brandName: qualifiedTickets[0]?.mention?.brandInfo?.brandName,
              authorChannelGroupID: qualifiedTickets[0]?.mention?.channelGroup,
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
              isAgentiQueEnabled: brandinfo?.isAgentIQEnabled ? true : false,
            }
            this._replyService.aiIntelligenceData = this.aiTicketIntelligenceModelData;
            resolve(true);
          } else {
            resolve(true);
          }
        }, (err) => {
          resolve(true);
        });
      }
    })
  }
}
