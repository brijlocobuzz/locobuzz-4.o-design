import {
  Component,
  effect,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import {
  MatBottomSheet,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
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
import { SsreIntent } from 'app/core/enums/SsreIntentEnum';
import { SSREMode } from 'app/core/enums/SsreLogStatusEnum';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BulkOperationObject } from 'app/core/models/dbmodel/BulkOperationObject';
import { TicketHistoryDTO } from 'app/core/models/dbmodel/TicketHistoryDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { Tab } from 'app/core/models/menu/Menu';
import { CreateAttachMultipleMentionParam } from 'app/core/models/viewmodel/CreateAttachMultipleMentionParam';
import {
  PostSpecificInput,
  PostsType,
} from 'app/core/models/viewmodel/GenericFilter';
import { LocoBuzzAgent } from 'app/core/models/viewmodel/LocoBuzzAgent';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import {
  EmailReadReceipt,
  ReplyInputParams,
} from 'app/core/models/viewmodel/ReplyInputParams';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { ModalService } from 'app/shared/services/modal.service';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink/dist/subsink';
import {
  CannedResponseComponent,
  ParentPostComponent,
  PostUserinfoComponent,
} from '../../../';
import { AttachTicketComponent } from '../../../attach-ticket/attach-ticket.component';
import { CategoryFilterComponent } from '../../../category-filter/category-filter.component';
import { CopyMoveComponent } from '../../../copy-move/copy-move.component';
import { PostMarkinfluencerComponent } from '../../../post-markinfluencer/post-markinfluencer.component';
import { PostSubscribeComponent } from '../../../post-subscribe/post-subscribe.component';
import { TrendsComponent } from '../../../trends/trends.component';
import { TabService } from './../../../../../core/services/tab.service';
import { FilterGroupService } from './../../../../services/filter-group.service';
import { FilterService } from './../../../../services/filter.service';
import { FootericonsService } from './../../../../services/footericons.service';
import { PostDetailService } from './../../../../services/post-detail.service';
import { ReplyService } from './../../../../services/reply.service';
import { TicketsService } from './../../../../services/tickets.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-post-foot-action',
    templateUrl: './post-foot-action.component.html',
    styleUrls: ['./post-foot-action.component.scss'],
    standalone: false
})
export class PostFootActionComponent implements OnInit, OnChanges, OnDestroy {
  @Input() post: TicketClient;
  @Input() postData: BaseMention;
  @Input() ticketHistoryData: AllBrandsTicketsDTO;
  @Input() openReply: boolean = false;
  @Input() pageType: PostsType;
  @Input() currentUser: any;
  @Input() AllCheckBoxes = false;
  @Input() postFootDisable? = false;
  @Input() postInput?: PostSpecificInput = null;
  @Input() postDetailTab: LocobuzzTab;
  @Output() postActionTypeEvent = new EventEmitter<any>();
  private posttriggersubscription: Subscription;
  subs = new SubSink();
  actionableRef: any;
  SsreMode: SSREMode;
  SsreIntent: SsreIntent;
  @Input() replyInputParams?: ReplyInputParams;
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
    private _translate: TranslateService,
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
    }
  ) {
    let onLoadBrandMentionEmail = true;
     effect(() => {
          const value = this._replyService.emitBrandMentionEmailDataSignal();
         if (!onLoadBrandMentionEmail && value) {
            this.emitBrandMentionEmailDataChanges(value);
          } else {
            onLoadBrandMentionEmail = false;
          }
        }, { allowSignalWrites: true });

    let onLoadCannedResponse = true;
    effect(() => {
      const value = this._replyService.selectedCannedResponseSignal();
      if (!onLoadCannedResponse && value) {
        this.selectedCannedResponseSignalChanges(value)
      } else {
        onLoadCannedResponse = false;
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
  statusClass: string;
  crmClass: string;
  priorityClass: string;
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
  // csdlist for brand reject workflow
  customerAgentList: LocoBuzzAgent[] = [];
  customAgentListAsync = new Subject<LocoBuzzAgent[]>();
  customAgentListAsync$ = this.customAgentListAsync.asObservable();
  categoryToggle = true;
  makercheckerticketId: number;
  simulationCheck = false;
  ssreSimulationRight = false;
  IsreplyAndEscalate = false;
  showEscalateview = false;
  showEmailView = false;
  onlyEscalation = false;
  escalateMsg = false;
  showReplySection = true;
  onlySendMail = false;
  ngOnInit(): void {
    this.subs.add(
      this._ticketService.ticketcategoryMapChange.subscribe((value) => {
        if (value) {
          if (value.BaseMention.tagID === this.postData.tagID) {
            this.ticketshowmore();
            this.mentionshowmore();
          }
        }
      })
    );

    this.subs.add(
      this._ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.subscribe(
        (data) => {
          if (data) {
            if (data.postObj.ticketID == this.postData.ticketID) {
              this.postData.categoryMap = data.categoryCards;
              if (data.type == 'Ticket') {
                this.post.ticketCategory = data.categoryCards;
              } 
              else {
                this.post.mentioncategories = data.categoryCards;
              }
              this.ticketshowmore();
              this.mentionshowmore();
            }
          }
        }
      )
    );

    this.subs.add(
      this._ticketService.unselectbulkpostTrigger.subscribe((flag) => {
        this.AllCheckBoxes = flag;
        this.isbulkselectall = flag;
        this.disabledbrandmentioncheckbox = false;
      })
    );

    this.subs.add(
      this._ticketService.selectExcludeBrandMention.subscribe((flag) => {
        if (flag) {
          const isexcludebrand = localStorage.getItem(
            'isexcludebrandmention_' + this.currentUser.data.user.userId
          );
          this.isbrandPost = this.postData.isBrandPost;
          if (isexcludebrand === '1') {
            if (this.isbrandPost) {
              this.isbulkselectall = false;
              this.disabledbrandmentioncheckbox = true;
            }
          }
        } else {
          this.disabledbrandmentioncheckbox = false;
        }
      })
    );

    this.subs.add(
      this._ticketService.excludepostSelectTrigger.subscribe((count) => {
        if (count >= 2) {
          const isexcludebrand = localStorage.getItem(
            'isexcludebrandmention_' + this.currentUser.data.user.userId
          );
          this.isbrandPost = this.postData.isBrandPost;
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

    this.ticketPriority = Priority[this.postData.ticketInfo.ticketPriority];
    this.userpostLink = this._footericonService.setOpenPostLink(
      this.postData,
      this.openReply
    );
    const result = this._footericonService.togglePostfootClasses(
      this.postData,
      this.ticketPriority,
      this.post
    );
    this.crmClass = result.crmClass;
    this.priorityClass = result.priorityClass;
    this.statusClass = result.statusClass;

    if (this.pageType === PostsType.TicketHistory) {
      this.ticketHistoryData =
        this._footericonService.setConditionsFromCommunicationLog(
          this.currentUser,
          this.ticketHistoryData,
          this.postData
        );
    }

    const isexcludebrandmention = localStorage.getItem(
      'isexcludebrandmention_' + this.currentUser.data.user.userId
    );
    this.isbrandPost = this.postData.isBrandPost;
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

    const value = this._replyService.selectedCannedResponseSignal();
    if (value) {
      this.selectedCannedResponseSignalChanges(value)
    }
    // this.subs.add(
    //   this._replyService.selectedCannedResponse.subscribe((obj) => {
    //     if (obj?.text && obj?.text?.trim() !== '') {
    //       const notetype = this._postDetailService.notetype;
    //       if (notetype === 1) {
    //         this.cannedapprovenote = this.cannedapprovenote + obj.text;
    //       } else if (notetype === 2) {
    //         this.cannedrejectnote = this.cannedrejectnote + obj.text;
    //       }
    //     }
    //   })
    // );
    if (
      this.postData.channelGroup === ChannelGroup.WhatsApp ||
      this.postData.channelType === ChannelType.FBMessages ||
      this.postData.channelType === ChannelType.InstagramMessages
    ) {
      this.showReplyMessageExpiry();
    }
    if (
      this.postData.channelGroup === ChannelGroup.Email &&
      this.pageType === PostsType.TicketHistory
    ) {
      this.subscribeToEvents();
    }

    if (this.postInput && this.postInput.postlength == 1) {
      this.checkListLengthequaltoone = true;
    }
    if (this.post.ticketcategories.length > 0) {
      for (let i = 0; i < this.post.ticketcategories.length; i++) {
        this.post.ticketcategories[i].show = i < 3 ? true : false;
      }
    }
    if (this.post.mentioncategories.length > 0) {
      for (let i = 0; i < this.post.mentioncategories.length; i++) {
        this.post.mentioncategories[i].show = i < 3 ? true : false;
      }
    }
    this.subs.add(
      this._ticketService.hideShowCategoryObs
        .pipe(filter((res) => this.postDetailTab?.guid === res?.guid))
        .subscribe((data) => {
          if (data != null) {
            if (this.postDetailTab.guid == data.guid) {
              this.categoryToggle = data.flag;
            }
          }
        })
    );
    if (this.postData.ticketInfo.status === TicketStatus.Close) {
      this.postFootDisable = true;
    } else {
      this.postFootDisable = false;
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
    //         const roles = JSON.parse(brandEmailReadObj.markAsReadUserAccount);
    //         let checkRole;
    //         if (roles) {
    //           checkRole = roles.findIndex(
    //             (obj) => obj.UserRole === this.currentUser.data.user.role
    //           );
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
    //       }
    //     }
    //   )
    // );
  }

  selectedCannedResponseSignalChanges(obj){
    if (obj?.text && obj?.text?.trim() !== '') {
      const notetype = this._postDetailService.notetype;
      if (notetype === 1) {
        this.cannedapprovenote = this.cannedapprovenote + obj.text;
      } else if (notetype === 2) {
        this.cannedrejectnote = this.cannedrejectnote + obj.text;
      }
    }
  }

  emitBrandMentionEmailDataChanges(brandEmailReadObj){
    if (brandEmailReadObj) {
      const roles = JSON.parse(brandEmailReadObj.markAsReadUserAccount);
      let checkRole;
      if (roles) {
        checkRole = roles.findIndex(
          (obj) => obj.UserRole === this.currentUser.data.user.role
        );
      }
      if (
        brandEmailReadObj.isMentionReadCompulsory &&
        checkRole > -1 &&
        this.postData.ticketInfo.status !== TicketStatus.Close
      ) {
        this.showreadOption = true;
      } else {
        this.showreadOption = false;
      }
    }
  }

  showReplyMessageExpiry(): void {
    if (this.postData.channelGroup === ChannelGroup.WhatsApp) {
      const ticketTimings = this._ticketService.calculateTicketTimes(
        this.postData
      );
      if (ticketTimings.valDays) {
        if (
          Number(ticketTimings.valDays) === 1 ||
          Number(ticketTimings.valDays) === 0
        ) {
          this.showreplyDaysCounter = true;
        }
      }
    } else if (
      this.postData.channelType === ChannelType.FBMessages ||
      this.postData.channelType === ChannelType.InstagramMessages
    ) {
      const ticketTimings = this._ticketService.calculateTicketTimes(
        this.postData
      );
      if (ticketTimings.valDays) {
        if (Number(ticketTimings.valDays) <= 7) {
          this.showreplyDaysCounter = true;
          const remainingDays = 7 - Number(ticketTimings.valDays);
          if (remainingDays === 1 || remainingDays === 0) {
            // start the counter
          } else {
            this.replyexpirydays = String(remainingDays);
          }
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
    this.subs.unsubscribe();
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
  public get PostsType(): typeof PostsType {
    return PostsType;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.AllCheckBoxes?.currentValue) {
      const isexcludebrandmention = localStorage.getItem(
        'isexcludebrandmention_' + this.currentUser.data.user.userId
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
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.selectPost,
      param: { checkedStatus, ticketID },
    });
  }

  changePriority(event, priority): void {
    const object = {
      brandInfo: this.postData.brandInfo,
      ticketInfo: this.postData.ticketInfo,
      actionFrom: ActionTaken.Locobuzz,
    };

    object.ticketInfo.ticketPriority = event;

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
              message: this._translate.instant('Ticket-Priority-Successfully-Changed'),
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
      },
      (error) => {
        // console.log(error);
      }
    );
  }

  openCategoryDialog(event): void {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.mentionCategory, param: {mentionCategory}});
    this.postData.categoryMapText = null;
    this._postDetailService.postObj = this.postData;
    this._postDetailService.isBulk = false;
    this._postDetailService.categoryType = event;
    this._postDetailService.pagetype = this.pageType;
    this._dialog.open(CategoryFilterComponent, {
      width: '73vw',
      panelClass: ['responsive__modal--fullwidth'],
      disableClose: false,
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

    this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data.success) {
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);

        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        this.cannedapprovenote = '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('Ticket-Approved-successfully'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this._translate.instant('Some-error-occured'),
          },
        });
      }
    });
  }

  makeactionable(ticketHistoryData: AllBrandsTicketsDTO): void {
    const source = this._mapLocobuzzService.mapMention(this.postData);
    const sourceobj = {
      Source: source,
      NonActionableAuthorName: 'Anonymous',
      actionTaken: 0,
    };
    this._replyService.MarkActionable(sourceobj).subscribe((data) => {
      // ticketHistoryData.showMarkactionable = false;
      // ticketHistoryData.showTicketWindow = true;
      this.postData.isActionable = true;
      this.postData.ticketInfo.ticketID = data.ticketID;
      this.postData.ticketID = data.ticketID;
      this.post.ticketId = data.ticketID;
      this.openTicketDetail();
    });
  }

  openTicketDetail(): void {
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.openTicketDetail,
    });
  }

  replyPost(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyPost });
  }

  assignTicket(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.assignTickets });
  }

  attachTicket(): void {
    // this.postActionTypeEvent.emit({ actionType: PostActionEnum.attachTickets});
    if (this.postData.replyInitiated) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('Previous-request-pending-for-this-ticket'),
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

    this._ticketService.getAuthorTickets(keyObj).subscribe((data) => {
      if (data.success) {
        const ticketlist = data.data.filter((obj) => {
          return +obj.ticketId !== +this.postData.ticketInfo.ticketID;
        });
        if (ticketlist && ticketlist.length > 0) {
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
              message: this._translate.instant('No-Tickets-to-attach'),
            },
          });
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this._translate.instant('Some-error-occured'),
          },
        });
      }
    });
  }

  replyEscalate(): void {
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

    this._ticketService.enableTicketMakerChecker(object).subscribe((data) => {
      if (JSON.parse(JSON.stringify(data)).success) {
        // console.log('Maker Checker', data);
        if (status) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('Reply-Approval-Workflow-Enabled'),
            },
          });
          this.ticketHistoryData.isTicketAgentWorkFlowEnabled = false;
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('Reply-Approval-Workflow-Disabled'),
            },
          });
          this.ticketHistoryData.isTicketAgentWorkFlowEnabled = true;
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this._translate.instant('Error-Occured'),
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

  sendPostEmail(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.sendPostEmail });
  }
  // checkReplyInputParams(): void {
  //   this.subs.add(
  //     this._replyService.checkReplyInputParams.subscribe((paramObj) => {
  //       if (
  //         paramObj &&
  //         paramObj.postObj &&
  //         paramObj.postObj.ticketInfo.ticketID ===
  //           this._postDetailService.postObj.ticketInfo.ticketID
  //       ) {
  //         if (paramObj && paramObj.makerchticketId) {
  //           this.makercheckerticketId = paramObj.makerchticketId;
  //         }
  //         if (paramObj && paramObj.SSREMode && paramObj.SsreIntent) {
  //           this.SsreMode = paramObj.SSREMode;
  //           this.SsreIntent = paramObj.SsreIntent;
  //           this.simulationCheck = true;
  //           if (this.replyInputParams.SsreIntent === SsreIntent.Right) {
  //             this.ssreSimulationRight = true;
  //           }
  //         }
  //         if (paramObj && paramObj.onlyEscalation) {
  //           // this.showReplySection = false;```````````````
  //           this.IsreplyAndEscalate = true;
  //           this.showEscalateview = true;
  //           this.showEmailView = false;
  //           this.onlyEscalation = true;
  //         }
  //         if (this.IsreplyAndEscalate && this._postDetailService.isBulk) {
  //           this.escalateMsg = true;
  //         }
  //         if (paramObj && paramObj.onlySendMail) {
  //           this.showReplySection = false;
  //           this.onlySendMail = true;
  //         }
  //       }
  //     })
  //   );
  // }

  directCloseTicket(): void {
    if (this.postData.replyInitiated) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('Previous-request-pending-for-this-ticket'),
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
      (isticketagentworkflowenabled || this.currentUser.data.user.role)
    ) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('You-cannot-Direct-close-this-ticket-as-it-falls-under-approval-rules'),
        },
      });
      return;
    }
    const message = '';
    const dialogData = new AlertDialogModel(
      this._translate.instant('Are-you-sure-want-to-close-this-ticket'),
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
        this.postActionTypeEvent.emit({
          actionType: PostActionEnum.closeTicket,
        });
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }

  directCloseTicketWithNote(): void {
    this.postActionTypeEvent.emit({
      actionType: PostActionEnum.closeTicket,
      param: { NoteFlag: true },
    });
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
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this._translate.instant('Some-error-occured'),
              },
            });
            this.createticketnote = '';
            this.clickTicketMenuTrigger.closeMenu();
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

    this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data?.success) {
        // this._filterService.currentBrandSource.next(true);
        this._bottomSheet.dismiss();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('Ticket created successfully'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this._translate.instant('Some-error-occured'),
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

    this._replyService
      .CreateAttachMultipleMentions(keyObj)
      .subscribe((data) => {
        if (data?.success) {
          // this._filterService.currentBrandSource.next(true);
          // this._bottomSheet.dismiss();
          // this._ticketService.ticketStatusChange.next(true);
          this._ticketService.ticketStatusChangeSignal.set(true);

          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('Ticket created successfully'),
            },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data.message : this._translate.instant('Some-error-occured'),
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

    this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data?.success) {
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);

        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        this.cannedrejectnote = '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('Ticket Rejected successfully'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this._translate.instant('Some-error-occured'),
          },
        });
      }
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
    this._replyService.ReplyApproved(sourceobj).subscribe((data) => {
      // console.log('reply approved successfull ', data);
      // this._filterService.currentBrandSource.next(true);
      this._filterService.currentBrandSourceSignal.set(true);

      // this.dialogRef.close(true);
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: this._translate.instant('Reply-Approved-successfully'),
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

      this._replyService.ReplyRejected(sourceObj).subscribe((data) => {
        if(data?.success){
          // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
          // this.dialogRef.close(true);
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this._translate.instant('RReply-Rejected-successfully'),
            },
          });
        }
        else{
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data?.message : this._translate.instant('Some-error-occured'),
            },
          });
        }
      });
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this._translate.instant('Note-required'),
        },
      });
    }
  }

  acknowlegeCall(): void {
    if (this.postData.ticketInfo.ticketID) {
      this.clickacknowledgeMenuTrigger.openMenu();
    }
  }

  AcknowledgeTicket(): void {
    const performActionObj = this._replyService.BuildReply(
      this.postData,
      ActionStatusEnum.Acknowledge,
      this.acknowledgednote,
      this.postData.ticketInfo.ticketID
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

    this._replyService.Reply(performActionObj).subscribe((data) => {
      if (data?.success) {
        // this._filterService.currentBrandSource.next(true);
        this._filterService.currentBrandSourceSignal.set(true);
        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this._translate.instant('Ticket-Acknowledged-successfully'),
          },
        });
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this._translate.instant('Some-error-occured'),
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
        message: name + ' ' + this._translate.instant('copied-successfully'),
      },
    });
  }

  // type indicates whether its for approve or reject
  CannedResponse(type: number): void {
    this._postDetailService.notetype = type; // 1 - approve // 2 - reject
    this._dialog.open(CannedResponseComponent, {
      autoFocus: false,
      width: '50vw',
      //data: this.postData,
      data: { mention: this.postData },
    });
  }

  clearnote(brandRejection = false): void {
    this.cannedapprovenote = '';
    this.cannedrejectnote = '';
    this.createticketnote = '';
    if (brandRejection) {
      this.checkIfBrandReplyAndReject();
    }
  }

  deleteFromLocobuzz(): void {
    const message = '';
    const dialogData = new AlertDialogModel(
      this._translate.instant('delete-post-from-locobuzz'),
      message,
      this._translate.instant('Yes'),
      this._translate.instant('No')
    );
    const dialogRef = this._dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        // this.ssreLiveWrongKeep();
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
      this._translate.instant('Are-you-sure-you-want-to-Delete-this-post-from-Social-Media'),
      message,
      this._translate.instant('Yes'),
      this._translate.instant('No')
    );
    const dialogRef = this._dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
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
      this._translate.instant('Are-you-sure-you-want-to-Delete-this-post-from-Social-Media-and-Locobuzz'),
      message,
      this._translate.instant('Yes'),
      this._translate.instant('No')
    );
    const dialogRef = this._dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        // this.ssreLiveWrongKeep();
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
    this._replyService.MarkMentionAsRead(obj).subscribe((resp) => {
      if (resp.success) {
        this.postData.thisMentionIsRead = true;
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
                  this._replyService.mentionReadReceipt[i].tagIdList[j]
                    .tagId === this.postData.tagID
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
                  ticketId: this.postData.ticketInfo.ticketID,
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
    if (!this.mentioncategoryhidden) {
      this.mentioncategoryhidden = true;
      for (let i = 0; i < this.post.mentioncategories.length; i++) {
        this.post.mentioncategories[i].show = true;
      }
    } else {
      this.mentioncategoryhidden = false;
      for (let i = 0; i < this.post.mentioncategories.length; i++) {
        this.post.mentioncategories[i].show = i < 3 ? true : false;
      }
    }
  }

  ticketshowmore(): void {
    if (!this.ticketcategoryhidden) {
      this.ticketcategoryhidden = true;
      for (let i = 0; i < this.post.ticketcategories.length; i++) {
        this.post.ticketcategories[i].show = true;
      }
    } else {
      this.ticketcategoryhidden = false;
      for (let i = 0; i < this.post.ticketcategories.length; i++) {
        this.post.ticketcategories[i].show = i < 3 ? true : false;
      }
    }
  }
  trendsModal() {
    this._postDetailService.postObj = this.postData;
    /* this._postDetailService.currentPostObject.next(
      this.postData.ticketInfo.ticketID
    ); */
    this._postDetailService.currentPostObjectSignal.set(
      this.postData.ticketInfo.ticketID
    );
    this._dialog.open(TrendsComponent, {
      autoFocus: false,
      panelClass: ['full-screen-modal'],
      data: { postData: this.postData },
    });
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
        this._replyService
          .GetUsersWithTicketCount(this.postData.brandInfo)
          .subscribe((data) => {
            // console.log(data);
            this.buildAgentUserList(data);
          });
      }
    }
  }

  setEscalateUsers(event: UntypedFormControl): void {
    this.assignToUser = event.value;
  }

  closeMatSelect(): void {
    this._footericonService.matClosePanel.next(true);
    // this.autocomplete.closePanel();
  }
  closeWorkFlowrejectMenu(): void {
    this.clickRejectworkflowTrigger.closeMenu();
  }

  getTicketCountDetailForPost(postData) {
    console.log(postData);
    const obj = {
      brandInfo: {
        brandID: postData.brandInfo.brandID,
        brandName: postData.brandInfo.brandName,
      },
      tagID: postData.tagID,
      socialId: postData.socialID,
      contentID: postData.contentID,
      isActionableData: postData.actionableType,
      channel: postData.channelGroup,
      isTicketClose: false,
    };

    this._replyService.GetTicketCountDetailForPost(obj).subscribe((res) => {
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
        this._translate.instant('Want-user-comments-brand-post-Non-Actionable'),
        `<span class="colored__red--dark"> Note:</span> This will not be applied for Twitter nested replies.`,
        'Yes',
        'No',
        true,
        dataCount > 0
          ? [
              {
                label:
                  'Also close ' +
                  dataCount +
                  'created tickets associated with this brand post',
                id: 'Test',
                type: 'checkbox',
              },
            ]
          : []
      );
    } else {
      dialogData = new AlertDialogModel(
        this._translate.instant('Want-user-comments-brand-post'),
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
    });
    this.actionableRef.afterClosed().subscribe((dialogResult) => {
      this.actionableRef = null;
      if (dialogResult) {
        const obj = {
          brandInfo: {
            brandID: postData.brandInfo.brandID,
            brandName: postData.brandInfo.brandName,
          },
          tagID: postData.tagID,
          socialId: postData.socialID,
          contentID: postData.contentID,
          isActionableData: actionType,
          channel: postData.channelGroup,
          isTicketClose: checkBoxValue ? true : false,
        };
        this._replyService.makeTicketActionableOrNonActionable(obj).subscribe(
          (res) => {
            if (res.success) postData.actionableType = actionType;
            this.ticketHistoryData.actionOrNonActionFlag =
              actionType == 1 ? true : false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this._translate.instant('Updated-Successfully'),
              },
            });
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
      this.postData.ticketInfo.ticketID
    ); */
    this._postDetailService.currentPostObjectSignal.set(
      this.postData.ticketInfo.ticketID
    );
    const sideModalConfig = this._modalService.getSideModalConfig('saved-tabs');
    this._dialog.open(PostUserinfoComponent, {
      ...sideModalConfig,
      width: '360px',
      data: tabIndex,
      autoFocus: false,
    });
  }

  openParentPost(): void {
    this._postDetailService.postObj = this.postData;
    this._dialog.open(ParentPostComponent, {
      autoFocus: false,
      width: '65vw',
    });
  }
  getToolTip(menionSentiment): string {
    if (menionSentiment === this.getSentiment.Negative) {
      return 'Negative Sentiment';
    } else if (menionSentiment === this.getSentiment.Mixed) {
      return 'Mixed Sentiment';
    } else if (menionSentiment === this.getSentiment.Positive) {
      return 'Positive Sentiment';
    } else if (menionSentiment === this.getSentiment.Neutral) {
      return 'Neutral Sentiment';
    }
  }

  hideUnhideFromFacebook(flag: boolean): void {
    const dialogData = new AlertDialogModel(
      this._translate.instant(flag ? this.postData?.channelType === ChannelType.InstagramComments ? 'Are-you-sure-you-want-to-Unhide-this-mention-from-Instagram' : 'Are-you-sure-you-want-to-Unhide-this-mention-from-Facebook' : this.postData?.channelType === ChannelType.InstagramComments ? 'Are-you-sure-you-want-to-Hide-this-mention-from-Instagram' : 'Are-you-sure-you-want-to-Hide-this-mention-from-Facebook'),
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
        const key = this._ticketService.constructMentionObj(this.postData);
        key.IsHidden = flag ? false : true;
        key.IsHiddenFromAllBrand = false;
        delete key.Account.AccountID;
        delete key.Account.SocialID;
        key.Source.ChannelType = this.postData.channelType;
        key.Source.TagID = this.postData.tagID;
        key.Source.InstagramGraphApiID = this.postData?.instagramGraphApiID ? this.postData?.instagramGraphApiID : '';
        this._ticketService.hideUnhideFromFacebook(key).subscribe(
          (data) => {
            if (data.success) {
              if (this.postData.channelType === ChannelType.InstagramComments) {
                this.ticketHistoryData.hideUnhideInstagramFlag = flag
                  ? false
                  : true;
              } else {
                this.ticketHistoryData.hideUnhideFacebookFlag = flag
                  ? false
                  : true;
              }
            }
          },
          (err) => {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Something went wrong.',
              },
            });
          }
        );
      }
    });
  }
  categoryToggleEvent(): void {
    this.categoryToggle = !this.categoryToggle;
  }
}
