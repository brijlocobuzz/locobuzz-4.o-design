import {
  Component,
  effect,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { notificationType } from 'app/core/enums/notificationType';
import { PerformedAction } from 'app/core/enums/PerformedAction';
import { SsreIntent } from 'app/core/enums/SsreIntentEnum';
import { SSRELogStatus } from 'app/core/enums/SsreLogStatusEnum';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { BulkActionButtons } from 'app/core/interfaces/BulkTicketActions';
import { AuthUser } from 'app/core/interfaces/User';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostAssignToService } from 'app/social-inbox/services/post-assignto.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink/dist/subsink';
import { CategoryFilterComponent, PostReplyComponent } from '..';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { TabService } from 'app/core/services/tab.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-parent-post-bulk-actions',
    templateUrl: './parent-post-bulk-actions.component.html',
    styleUrls: ['./parent-post-bulk-actions.component.scss'],
    standalone: false
})
export class ParentPostBulkActionsComponent implements OnInit, OnDestroy {
  parentpostCount: number = this._ticketService.selectedPostList.length;
  @Input() pageType: PostsType;
  @Input() mentionListLength: number=0;
  @Input() totalCount: number;
  @Input() createdDate: Date;
  @Input() mentionType: boolean;
  @Input() postData:BaseMention
  @Input() groupView:boolean=false;
  @Output() bulkActionEvent = new EventEmitter<string>();
  @Output() postActionTypeEvent = new EventEmitter<any>();
  currentUser: AuthUser;
  bulkActionbtn: BulkActionButtons = {};
  private posttriggersubscription: Subscription;
  rejectnote: string = '';
  reopennote: string = '';
  holdnote: string = '';
  createticketnote: string = '';
  createTicketStatus = 0;
  isexcludebrandmention = false;
  keyObj: any;
  subs = new SubSink();

  public selectAllIsChecked: Boolean = false;
  showActionableButtons: boolean=true;
  showMarkAsSeen: boolean;
  showMarkAsUnSeen: boolean;
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
    private _postAssignToService: PostAssignToService,
    private MapLocobuzz: MaplocobuzzentitiesService,
    private accountService: AccountService,
    private _tabService:TabService,
    private translate: TranslateService
  ) {
    let onLoadFilterTab = true;
     effect(() => {
       const value = this._ticketService.postSelectTriggerSignal();
       if (onLoadFilterTab){
         this.postSelectTriggerSignalChanges(value);
       } else {
         onLoadFilterTab = false;
       }
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));

    const value = this._ticketService.postSelectTriggerSignal();
    this.postSelectTriggerSignalChanges(value);
    // this.subs.add(
    //   this._ticketService.postSelectTrigger.subscribe((count) => {
    //     this.parentpostCount = count;
    //     if (this.parentpostCount === 0) {
    //       this.bulkAction('hideactionpanel');
    //     } else if (this.parentpostCount === 1 && !this.selectAllIsChecked) {
    //       this._ticketService.selectedPostList = [];
    //       this._ticketService.postSelectTrigger.next(0);
    //       this.bulkAction('hideactionpanel');
    //     }
    //     this.showMarkAsSeen = this._ticketService.bulkMentionChecked.some(x => x.mention?.mentionMetadata?.isMarkSeen == 0 || (x.mention?.mentionMetadata?.isMarkSeen == 1 && x.mention?.mentionMetadata?.unseencount > 0))
    //     this.showMarkAsUnSeen = this._ticketService.bulkMentionChecked.some(x => x.mention?.mentionMetadata?.isMarkSeen == 1 && x.mention?.mentionMetadata?.unseencount == 0)
    //     // if (this.parentpostCount < this.mentionListLength) {
    //     //   this.selectAllIsChecked = false;
    //     // } else if (this.parentpostCount === this.mentionListLength) {
    //     //   this.selectAllIsChecked = true;
    //     // }
    //     if(this.groupView ){
    //       this._postDetailService.totalCount = this.totalCount;
    //       if (this.totalCount === count || count >= 20){
    //       this._postDetailService.isBulkselected =true;
    //       this.selectAllIsChecked = true;
    //     }else{
    //       this._postDetailService.isBulkselected=false;
    //       this.selectAllIsChecked = false;
    //     }
    //   }
    //   })
    // );

    this.subs.add(
      this._ticketService.keyObjSubject.subscribe((obj) => {
        if(obj) {
          this.keyObj = obj;
        }
      })
    );

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      if (this.currentUser?.data?.user?.isClickhouseEnabled==1)
      {
        this.showActionableButtons = false
      }
    }
  }

  postSelectTriggerSignalChanges(count){
    this.parentpostCount = count;
    if (this.parentpostCount === 0) {
      this.bulkAction('hideactionpanel');
    } else if (this.parentpostCount === 1 && !this.selectAllIsChecked) {
      this._ticketService.selectedPostList = [];
      this._ticketService.postSelectTriggerSignal.set(0);
      this.bulkAction('hideactionpanel');
    }
    this.showMarkAsSeen = this._ticketService.bulkMentionChecked.some(x => x.mention?.mentionMetadata?.isMarkSeen == 0 || (x.mention?.mentionMetadata?.isMarkSeen == 1 && x.mention?.mentionMetadata?.unseencount > 0))
    this.showMarkAsUnSeen = this._ticketService.bulkMentionChecked.some(x => x.mention?.mentionMetadata?.isMarkSeen == 1 && x.mention?.mentionMetadata?.unseencount == 0)
    // if (this.parentpostCount < this.mentionListLength) {
    //   this.selectAllIsChecked = false;
    // } else if (this.parentpostCount === this.mentionListLength) {
    //   this.selectAllIsChecked = true;
    // }
    if (this.groupView) {
      this._postDetailService.totalCount = this.totalCount;
      if (this.totalCount === count || count >= 20) {
        this._postDetailService.isBulkselected = true;
        this.selectAllIsChecked = true;
      } else {
        this._postDetailService.isBulkselected = false;
        this.selectAllIsChecked = false;
      }
    }
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  bulkAction(actionType): void {
    // this.onholdnote.closeMenu();
    if (actionType === 'reply') {
      this.ShowBulkReplyPreview();
    } else if (actionType === 'close') {
      this.GetBulkDirectClose();
    } else if (actionType === 'tagcategory') {
      this.GetBulkTagggingCategoryFromOutSide();
    } else if (actionType === 'delete') {
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
        const IsEmailChannel = SelectedTickets.filter(
          (s) => s.mention.channelGroup === ChannelGroup.Email
        );
        const IsNotReadList = SelectedTickets.filter(
          (s) => s.mention.isRead !== false
        );
        if (IsEmailChannel.length > 0 && IsNotReadList.length > 0) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-read-all-mentions-before-bulk-delete'),
            },
          });
        } else {
          const message = '';
          const dialogData = new AlertDialogModel(
            this.translate.instant('Are-you-sure-you-want-to-delete-selected-mentions'),
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
              this.bulkdelete();
            } else {
              // this.ssreLiveWrongDelete();
            }
          });
        }
      }
    }
    this.bulkActionEvent.emit(actionType);
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
        const properties = {
          contentID: checkedticket.mention.contentID,
          TagID: checkedticket.mention.tagID,
          ChannelType: checkedticket.mention.channelType,
          BrandID: checkedticket.mention.brandInfo.brandID,
          BrandName: checkedticket.mention.brandInfo.brandName,
        };

        BulkObject.push(properties);
      }

      const sourceobj = {
        BulkObject,
      };

      let endpoint = '';

      if (this._postDetailService.groupedView) {
        endpoint = '/Tickets/MentionChildBulkDeletegroupview'
      }

      this._replyService.BulkDelete(BulkObject, endpoint).subscribe((data) => {
        if (data.success) {
          const message = this.translate.instant('Bulk-Delete-successful');
          this._ticketService.selectedPostList = [];
          this._ticketService.postSelectTriggerSignal.set(0);
          this._postDetailService.isBulk = false;
          // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message,
            },
          });
          this.bulkAction('dismiss');
          this._ticketService.parentbulkActionChange.next(3);
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Error-occurred-while-deleting-bulk-mentions'),
            },
          });
        }
        // this.zone.run(() => {
      });
    }
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
      const TicketNonActionable = [];
      const isemailnotread = [];
      for (const checkedticket of CheckedMentionsOrTickets) {
        if (checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled) {
          TicketApprovalEnable.push(
            checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled
          );
        }

        if (!checkedticket.mention.isActionable) {
          TicketNonActionable.push(checkedticket.mention.isActionable);
        }

        if (
          checkedticket.mention.channelGroup === ChannelGroup.Email &&
          !checkedticket.mention.allMentionInThisTicketIsRead
        ) {
          isemailnotread.push(
            checkedticket.mention.allMentionInThisTicketIsRead
          );
        }
      }

      if (TicketNonActionable.length > 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('nonActionableMentionsBulkReply'),
          },
        });
        return;
      }

      if (isemailnotread.length > 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('readAllMentionsBeforeBulkReply'),
          },
        });

        return false;
      }

      if (+this.currentUser.data.user.role === UserRoleEnum.Agent) {
        if (
          IsEnableReplyApprovalWorkFlow &&
          (this.currentUser.data.user.agentWorkFlowEnabled ||
            TicketApprovalEnable.length > 0)
        ) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('selectedMentionsCannotBulkReplyApprovalWorkflow'),
            },
          });
          return;
        }
      }

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

                if (GoingForApproval.length > 0) {
                  // show popup
                } else {
                  let isTicket = false;
                  if (this.pageType === PostsType.Tickets) {
                    isTicket = true;
                  }
                  this.GetBulkReply(isTicket);
                }
              }
            } else {
              // ErrorModal("Something went wrong, please try again later");
              // BulkReply.HideBulkReplySection();
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this.translate.instant('somethingWentWrongTryAgain'),
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
              ? this.translate.instant('cannotReplyMoreThanTickets', { count: _MaxSizeOfBulkReply })
              : this.translate.instant('cannotReplyMoreThanMentions', { count: _MaxSizeOfBulkReply });
          } else if (CheckedMentionsOrTickets.length <= 1) {
            message = isTicket
              ? this.translate.instant('minimumTicketsRequired')
              : this.translate.instant('minimumMentionsRequired');
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
                message: this.translate.instant('bulkReplyNotSupportedEmail'),
              },
            });
            break;
          case 29:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('bulkReplyNotSupportedChatbot'),
              },
            });
            break;
          case 19:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('bulkReplyNotSupportedNews'),
              },
            });
            break;
          default:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('bulkReplyNotSupportedSelectedChannel'),
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
          message: this.translate.instant('bulkReplyNotEnabledSelectedBrands'),
        },
      });
    }
  }

  GetBulkDirectClose(): any {
    const ValidationData = this.ValidateTicketsToBeClosed();
    if (ValidationData.IsValid) {
      const qualifiedforapproval = [];
      let isticketagentworkflowenabled = false;
      const GoingForApproval = [];
      const isemailnotread = [];
      let TotalTickets = 0;
      const qualifiedTickets = this._ticketService.bulkMentionChecked.filter(
        (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
      );
      TotalTickets = qualifiedTickets.length;
      if (qualifiedTickets.length > 0) {
        for (const checkedticket of qualifiedTickets) {
          isticketagentworkflowenabled =
            checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled;
          if (
            checkedticket.mention.channelGroup === ChannelGroup.Email &&
            !checkedticket.mention.allMentionInThisTicketIsRead
          ) {
            isemailnotread.push(
              checkedticket.mention.allMentionInThisTicketIsRead
            );
          }
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
        if (isemailnotread.length > 0) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('readAllMentionsBeforeDirectClose'),
            },
          });

          return false;
        }

        if (GoingForApproval.length > 0) {
          const dialogData = new AlertDialogModel(
            this.translate.instant('ticketsQualifiedForBulkDirectClose', { count: GoingForApproval.length, total: TotalTickets }),
            '',
            this.translate.instant('continue')
          );
          const dialogRef = this.dialog.open(AlertPopupComponent, {
            disableClose: true,
            autoFocus: false,
            data: dialogData,
          });
          dialogRef.afterClosed().subscribe((dialogResult) => {
            if (dialogResult) {
              const prop = {
                action: PerformedAction.DirectClose,
                guid: this._navigationService.currentSelectedTab.guid,
                currentteamid: +this.currentUser.data.user.teamID,
                userrole: +this.currentUser.data.user.role,
                pageType: this.pageType,
                agentWorkFlowEnabled:
                  this.currentUser.data.user.agentWorkFlowEnabled,
              };
              this._replyService.ConfirmBulkTicketAction(prop,null,true);
            } else {
            }
          });
        } else {
          const dialogData = new AlertDialogModel(
            this.translate.instant('areYouSureCloseSelectedTickets'),
            `<span class='colored__red'>${this.translate.instant('closeTicketOpenStateWarning')}</span>`,
            this.translate.instant('continue'),
            '',
            true
          );
          const dialogRef = this.dialog.open(AlertPopupComponent, {
            disableClose: true,
            autoFocus: false,
            data: dialogData,
          });
          dialogRef.afterClosed().subscribe((dialogResult) => {
            if (dialogResult) {
              const prop = {
                action: PerformedAction.DirectClose,
                guid: this._navigationService.currentSelectedTab.guid,
                currentteamid: +this.currentUser.data.user.teamID,
                userrole: +this.currentUser.data.user.role,
                pageType: this.pageType,
                agentWorkFlowEnabled:
                  this.currentUser.data.user.agentWorkFlowEnabled,
              };
              this._replyService.ConfirmBulkTicketAction(prop, null, true);
            } else {
            }
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

  ValidateTicketsToBeClosed(): any {
    const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    let IsValid = false;
    let Message = '';

    const TicketNonActionable = [];

    for (const checkedticket of SelectedTickets) {
      if (!checkedticket.mention.isActionable) {
        TicketNonActionable.push(checkedticket.mention.isActionable);
      }
    }

    if (TicketNonActionable.length > 0) {
      IsValid = false;
      Message = this.translate.instant('nonActionableMentionsBulkDirectClose')
      return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
    }

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
            SelectedTicketsStatus.indexOf(15) >= 0 ||
            SelectedTicketsStatus.indexOf(16) >= 0
          ) {
            IsValid = false;
            Message =
              this.translate.instant('onlyOpenOnHoldApprovedAwaitingTicketsDirectClose');
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
            Message =
              this.translate.instant('onlyOnHoldEscalatedTicketsDirectClose');
          } else {
            IsValid = true;
            Message = '';
          }
          break;
        default:
          IsValid = false;
          Message = this.translate.instant('notAuthorizedDirectCloseMultipleTickets');
          break;
      }
    } else {
      IsValid = false;
      Message = this.translate.instant('notAuthorizedDirectCloseMultipleTickets');
    }

    const SelectedTicketsReplyInitiated = SelectedTickets.map(
      (s) => s.mention.replyInitiated
    ).filter(this.onlyUnique);
    if (SelectedTicketsReplyInitiated.indexOf(true) > -1) {
      IsValid = false;
      Message = this.translate.instant('previousRequestPendingForThisTicket')
    }

    return { IsValid, Message, SelectedTicketCount: SelectedTickets.length };
  }

  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
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

    // const TicketNonActionable = [];

    for (const checkedticket of chkTicket) {
      const channelId = checkedticket.mention.channelType;
      if (TwitterChannelTypes.indexOf(channelId) > -1) {
        IsTwitter = true;
      }
      // if (!checkedticket.mention.isActionable) {
      //   TicketNonActionable.push(checkedticket.mention.isActionable);
      // }
    }

    // if (TicketNonActionable.length > 0) {
    //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //     duration: 5000,
    //     data: {
    //       type: notificationType.Warn,
    //       message: 'Non Actionable mentions cannot be used for bulk Tagging.',
    //     },
    //   });
    //   return;
    // }

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

    CategoryGroupIDs = CategoryGroupIDs.map((s) => s).filter(this.onlyUnique);
    if (CategoryGroupIDs.length !== 1) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-select-mentions-with'),
        },
      });
      return;
    } else if (!IsCategoryGroupSame) {
      this.openbulkCategoryDialog('mentionCategory');
    } else {
      this.openbulkCategoryDialog('mentionCategory');
    }
  }

  openbulkCategoryDialog(event): void {
    const chkTicket = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );
    chkTicket[0].mention.categoryMapText = null;
    this._postDetailService.postObj = chkTicket[0].mention;
    this._postDetailService.categoryType = event;
    this._postDetailService.isBulk = true;
    this._postDetailService.pagetype = this.pageType;
    this._postDetailService.childOrParentFlag = true
    this.dialog.open(CategoryFilterComponent, {
      width: '73vw',
      disableClose: false,
    });
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
      message = this.translate.instant('Please-select-ticket-ssre');
      return { success: false, message };
    }
    if (SelectedMentionOrTicketAlreadyInitiated.length > 0) {
      const NewArrayOfInitiation = SelectedMentionOrTicketAlreadyInitiated.map(
        (s) => s
      ).filter(this.onlyUnique);
      if (NewArrayOfInitiation.indexOf(true) !== -1) {
        message = this.translate.instant('previousRequestPendingForThisTicket');

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
            message: this.translate.instant('bulkReplyNotEnabledSelectedBrands'),
          };
        }
      } else {
        return {
          success: false,
          message: this.translate.instant('bulkReplyNotEnabledSelectedBrands')
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
          this.translate.instant('Please-mentions-reply');

        return { success: false, message };
      }

      if (
        AllSelectedMentionsOrTicketsBelongsToSameBand &&
        !AllSelectedMentionsOrTicketsBelongsToSameChannelGroups
      ) {
        message = this.translate.instant('Select-mentions-reply');

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
              message = this.translate.instant('Please-select-some-page');

              return { success: false, message };
            }
            break;
          case ChannelGroup.GooglePlayStore:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Please-select-some-app');

              return { success: false, message };
            }
            break;
          case ChannelGroup.Instagram:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Please-select-some-account');

              return { success: false, message };
            }
            break;
          case ChannelGroup.Youtube:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Please-select-some-channel');

              return { success: false, message };
            }
            break;
          case ChannelGroup.LinkedIn:
            if (DistinctPageID.length > 1) {
              message = this.translate.instant('Please-select-some-page');

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
        message = this.translate.instant('Select-mentions-brand-reply');

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
              message = this.translate.instant('Metions-of-same-ticket');

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
                  UserRoleEnum.SupervisorAgent ||
                  this.currentUser.data.user.role ===
                  UserRoleEnum.LocationManager)
              ) {
                switch (DistincetTicketStatus[0]) {
                  case TicketStatus.PendingwithCSD:
                    message = isTicket
                      ? this.translate.instant('cannotSelectTicketsPendingWithCSD')
                      : this.translate.instant('cannotSelectMentionsPendingWithCSD');
                    break;
                  case 3:
                    message = isTicket
                      ? this.translate.instant('cannotSelectTicketsAlreadyClosed')
                      : this.translate.instant('cannotSelectMentionsAlreadyClosed');
                    break;
                  case 6:
                    message = isTicket
                      ? this.translate.instant('cannotSelectTicketsOnHoldWithCSD')
                      : this.translate.instant('cannotSelectMentionsOnHoldWithCSD');
                    break;
                  case 8:
                    message = isTicket
                      ? this.translate.instant('cannotSelectTicketsPendingWithBrand')
                      : this.translate.instant('cannotSelectMentionsPendingWithBrand');
                    break;
                  case 11:
                    message = isTicket
                      ? this.translate.instant('cannotSelectTicketsOnHoldWithBrand')
                      : this.translate.instant('cannotSelectMentionsOnHoldWithBrand');
                    break;
                  default:
                    message = isTicket
                      ? this.translate.instant('cannotSelectTicketsWithThisStatus')
                      : this.translate.instant('cannotSelectMentionsWithThisStatus');
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
              message:
                this.translate.instant('selectedMentionsCannotBulkReplyApprovalWorkflow'),
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
              ticketormention = 'Tickets';
            } else {
              ticketormention = 'Mentions';
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
                            'Bulk Reply on ' +
                            this._ticketService.bulkMentionChecked.length +
                            ' ' +
                            ticketormention,
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
                            'Bulk Reply on ' +
                            this._ticketService.bulkMentionChecked.length +
                            ' ' +
                            ticketormention,
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
                          'Bulk Reply on ' +
                          this._ticketService.bulkMentionChecked.length +
                          ' ' +
                          ticketormention,
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
                        'Bulk Reply on ' +
                        this._ticketService.bulkMentionChecked.length +
                        ' ' +
                        ticketormention,
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
                  message: this.translate.instant('somethingWentWrongTryAgain'),
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
              ? this.translate.instant('cannotReplyMoreThanTickets', { count: _MaxSizeOfBulkReply })
              : this.translate.instant('cannotReplyMoreThanMentions', { count: _MaxSizeOfBulkReply });
          } else if (CheckedMentionsOrTickets.length <= 1) {
            message = IsTicket
              ? this.translate.instant('minimumTicketsRequired')
              : this.translate.instant('minimumMentionsRequired');
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
                message: this.translate.instant('bulkReplyNotSupportedEmail'),
              },
            });
            break;
          case ChannelGroup.WebsiteChatBot:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('bulkReplyNotSupportedChatBot'),
              },
            });
            break;
          case ChannelGroup.News:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('bulkReplyNotSupportedNews'),
              },
            });
            break;
          default:
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('bulkReplyNotSupportedSelectedChannel'),
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
          message: this.translate.instant('bulkReplyNotEnabledSelectedBrands'),
        },
      });
    }
  }
  bulkpostselect(checked): void {
    if(checked){
      this.selectAllIsChecked =true;
      this.bulkActionEvent.emit('selectAll');
      this._postDetailService.isBulkselected = true;
    } else{
      this.selectAllIsChecked =false;
      this._ticketService.selectedPostList = [];
      this._ticketService.postSelectTriggerSignal.set(0);
      this._postDetailService.isBulkselected = false;
    }
  }

  markAsSeenOrUnseen(flag): void {
    if(this.selectAllIsChecked) {
      console.log('leyobj inside bulk', this.keyObj, this.mentionType);
      let obj: any = {
        param: this.keyObj || {}, // Fallback to an empty object if keyObj is null/undefined
        IsDateRange: this.mentionType,
        StartDateEpoch: this.keyObj?.startDateEpoch ?? null, // Optional chaining
        EndDateEpoch: this.keyObj?.endDateEpoch ?? null,
        mentionCount: this.totalCount || 0 // Default to 0 if totalCount is null/undefined
      };
      if (flag) {
        obj.param.IsMarkSeen = true;
      } else {
        obj.param.IsMarkSeen = false;
      }
      // mentionType true means it is RelatedMentions, false would mean it is FullThread
      if (!this.mentionType) {
        obj.CreatedDate = this.createdDate ?? null; // Add createdDate for FullThread
      }

      this._ticketService.updateChildQualifiedBulkSeenUnseen(obj).subscribe((res) => {
        if (res?.success) {
          // this._ticketService.updateBulkMentionSeenUnseen.next({ guid: this.postDetailTab?.guid, list: list })
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant(`Mentions-marked-as-${flag == 1 ? 'Read' : 'Unread'}-successfully`),
            },
            });;
          // if (this.isfullThreadSelected) {
          //   this.isfullThreadSelected = false
          // }
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
    else {
    let dialogData = new AlertDialogModel(
      this.translate.instant(`Action-Mark-${flag == 1 ? 'Read' : 'Unread'}`),
      this.translate.instant(`Confirm-Mark-As-${flag == 1 ? 'Read' : 'Unread'}`),
      this.translate.instant(`Mark-As-${flag == 1 ? 'Read' : 'Unread'}`),
      this.translate.instant('Cancel'),
      true,
      []
    );

    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
      // width: '478px',
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        const chkTicket = this._ticketService.bulkMentionChecked.filter(
          (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
        );
        const list = []
        let totalMentions = 0
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
              ChannelGroupId: element?.mention?.channelGroup,
              ChannelType: element?.mention?.channelType
            }
          )
          totalMentions += element.mention.mentionMetadata.childmentioncount + 1
        });

        let obj = {
          SelectedPosts: list,
          createdDate: this.createdDate
        }

        this._ticketService.updateChildBulkSeenUnseen(obj).subscribe((res) => {
          if (res?.success) {
            this._ticketService.updateChildBulkMentionSeenUnseen.next({list});
            list.forEach(x => {
              this._ticketService.updateChildMentionInMentionList.next({ tagID: this.postData.tagID, seenOrUnseen: flag==1?true:false})
            })
            this._tabService.seenUnseenTabCountUpdateObs.next({ guid: this._navigationService.currentSelectedTab.guid, count: totalMentions, seenUnseen: flag });
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant(`Mentions-marked-as-${flag == 1 ? 'Read' : 'Unread'}-successfully`),
              },
            });;
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
    })
  }
  }
}
