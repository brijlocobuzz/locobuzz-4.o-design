import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import {
  MatBottomSheet,
  MAT_BOTTOM_SHEET_DATA,
} from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActionStatusEnum } from 'app/core/enums/ActionStatus';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { CreateAttachMultipleMentionParam } from 'app/core/models/viewmodel/CreateAttachMultipleMentionParam';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { take } from 'rxjs/operators';
import { TicketConversationComponent } from '../ticket-conversation/ticket-conversation.component';
import { BulkMentionChecked } from 'app/core/models/dbmodel/TicketReplyDTO';
import { SidebarService } from 'app/core/services/sidebar.service';
import { SubSink } from 'subsink';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-attach-ticket',
    templateUrl: './attach-ticket.component.html',
    styleUrls: ['./attach-ticket.component.scss'],
    standalone: false
})
export class AttachTicketComponent implements OnInit {
  postData: BaseMention;
  currentTicket: BaseMention;
  currentUser: AuthUser;
  ticketStatGroup: TicketStatGroup[] = [];
  selected = '';
  attachedNote = '';
  currentTicketList: any[] = [];
  SelectedTickets: BulkMentionChecked[] = [];
  defaultLayout: boolean = false;
  subs = new SubSink();
  constructor(
    private _bottomSheet: MatBottomSheet,
    private _postDetailService: PostDetailService,
    private _ticketService: TicketsService,
    private _snackBar: MatSnackBar,
    private _replyService: ReplyService,
    public dialog: MatDialog,
    private MapLocobuzz: MaplocobuzzentitiesService,
    private _filterService: FilterService,
    private accountService: AccountService,
    private _navigationService: NavigationService,
    private translate: TranslateService,
    private _cdr:ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    @Optional()
    @Inject(MAT_BOTTOM_SHEET_DATA)
    public data: { CurrentPost?: BaseMention }
  ) {
    if (data && data.CurrentPost) {
      this.currentTicket = data.CurrentPost;
    }
  }

  ngOnInit(): void {
    this.postData = this._postDetailService.postObj;

    this.SelectedTickets = this._ticketService.bulkMentionChecked.filter(
      (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
    );

    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));

    this.getAuthorTickets();
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }

  getAuthorTickets(): void {
    // construct author tickets
    const brandObj = {
      BrandName: this.currentTicket.brandInfo.brandName,
      BrandId: this.currentTicket.brandInfo.brandID,
    };

    const keyObj = {
      BrandInfo: brandObj,
      AuthorId: this.currentTicket.author.socialId,
      ChannelGroup: this.currentTicket.channelGroup,
    };

    this._ticketService.getAuthorTickets(keyObj).subscribe((data) => {
      if (data.success) {
        this.currentTicketList = data.data;
        this.createDropDownObj(data.data);
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this.translate.instant('Some-Error-Occurred'),
          },
        });
      }
    });
  }

  createDropDownObj(ticketlist): void {
    ticketlist = ticketlist.filter((obj) => {
      return +obj.ticketId !== +this.currentTicket.ticketInfo.ticketID;
    });
    if (ticketlist && ticketlist.length > 0) {
      const drpOpenTickets: DrpTicketStat[] = [];
      const drpClosedTickets: DrpTicketStat[] = [];

      const opentickets = ticketlist.filter((obj) => {
        return +obj.ticketStatus !== 3;
      });
      const closedtickets = ticketlist.filter((obj) => {
        return +obj.ticketStatus === 3;
      });
      if (opentickets && opentickets.length > 0) {
        for (const obj of opentickets) {
          drpOpenTickets.push({ value: obj.ticketId, viewValue: obj.ticketId });
        }

        this.ticketStatGroup.push({
          disabled: false,
          name: 'Open',
          tickets: drpOpenTickets,
        });
      }

      if (closedtickets && closedtickets.length > 0) {
        for (const obj of closedtickets) {
          drpClosedTickets.push({
            value: obj.ticketId,
            viewValue: obj.ticketId,
          });
        }
        this.ticketStatGroup.push({
          disabled: false,
          name: 'Closed',
          tickets: drpClosedTickets,
        });
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('no-tickets-to-attach'),
        },
      });
    }
  }

  closeAttachTicket(): void {
    // this.replyTextInitialValue = '';
    // this.clearInputs();
    this._bottomSheet.dismiss();
  }

  lastTalk(): void {
    const dialogRef = this.dialog.open(TicketConversationComponent, {
      width: '1000px',
    });
  }

  attachTicket(): void {
    if (this.selected && this.selected !== '') {
      const performActionObj = this._replyService.BuildReply(
        this.currentTicket,
        ActionStatusEnum.AttachTicket,
        this.attachedNote,
        this.selected
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
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Ticket-Attached-successfully'),
            },
          });
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data?.message : this.translate.instant('Some-Error-Occurred'),
            },
          });
        }
        // this.zone.run(() => {
      });
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-select-ticket-Id'),
        },
      });
    }
  }

  checkTicketAprrovalStatus(): boolean {
    if (this.selected && this.selected !== '') {
      let currentClosedStatus = false;
      const currentTicket = this.currentTicketList.find(
        (obj) =>
          Number(obj.ticketId) === Number(this.selected) &&
          Number(obj.ticketStatus) === 3
      );
      if (currentTicket) {
        currentClosedStatus = true;
      }
      let isTicketGoingForApproval = false;
      const currentBrandObj = this._filterService.fetchedBrandData.filter(
        (obj) => {
          return +obj.brandID === +this.postData.brandInfo.brandID;
        }
      );
      const currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;

      //  this.postData.ticketInfo.status --> attch ticket status from dropdown

      if (
        this.currentUser.data.user.teamID &&
        this.currentUser.data.user.teamID > 0 &&
        !isTicketGoingForApproval &&
        this.currentUser.data.user.role === UserRoleEnum.Agent &&
        currentClosedStatus &&
        currentBrand.isEnableReplyApprovalWorkFlow &&
        (this.postData.ticketInfo.ticketAgentWorkFlowEnabled ||
          this.currentUser.data.user.agentWorkFlowEnabled)
      ) {
        isTicketGoingForApproval = true;
      }
      return isTicketGoingForApproval;
    }
  }
  attachNewTicket(): void {
    // status: 99,
    // actionntype: 2
    if (this.selected && this.selected !== '') {
      if (this._postDetailService.isBulk) {
        // const SelectedTickets = this._ticketService.bulkMentionChecked.filter(
        //   (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
        // );
        let errorflag = false;
        if (this.attachedNote.trim() === '') {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Please enter notes'),
            },
          });
          return;
        }
        let DirectCloseErrorflag = false;
        const tagIds = [];
        const ticketIds = [];
        const MentionIDs = [];
        const DirectCloseErrorTickets = [];
        let isTicketGoingForApproval = false;
        let isticketagentworkflowenabled = false;
        const currentteamid = +this.currentUser.data.user.teamID;
        let isAgentHasTeam = false;
        if (currentteamid !== 0) {
          isAgentHasTeam = true;
        }
        for (const checkedticket of this.SelectedTickets) {
          const tagid = checkedticket.mention.tagID;
          const ticketid = checkedticket.mention.ticketInfo.ticketID;
          const brandid = checkedticket.mention.brandInfo.brandID;
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

          isticketagentworkflowenabled =
            checkedticket.mention.ticketInfo.ticketAgentWorkFlowEnabled;
          const isworkflowenabled = this._filterService.fetchedBrandData.find(
            (brand: BrandList) =>
              +brand.brandID === checkedticket.mention.brandInfo.brandID
          );
          let currentClosedStatus = false;
          const currentTicket = this.currentTicketList.find(
            (obj) =>
              Number(obj.ticketId) === Number(this.selected) &&
              Number(obj.ticketStatus) === 3
          );
          if (currentTicket) {
            currentClosedStatus = true;
          }
          if (
            !isAgentHasTeam &&
            this.currentUser.data.user.role === UserRoleEnum.Agent &&
            currentClosedStatus &&
            isworkflowenabled.isEnableReplyApprovalWorkFlow &&
            (isticketagentworkflowenabled ||
              this.currentUser.data.user.agentWorkFlowEnabled)
          ) {
            DirectCloseErrorflag = true;
            DirectCloseErrorTickets.push(this.selected);
          }

          if (
            isAgentHasTeam &&
            !isticketagentworkflowenabled &&
            this.currentUser.data.user.role === UserRoleEnum.Agent &&
            currentClosedStatus &&
            isworkflowenabled.isEnableReplyApprovalWorkFlow &&
            (isticketagentworkflowenabled ||
              this.currentUser.data.user.agentWorkFlowEnabled)
          ) {
            isTicketGoingForApproval = true;
          }
        }

        if (DirectCloseErrorflag) {
          const length = DirectCloseErrorTickets.length;
          let tickettext = 'Mention';
          if (length > 1) {
            tickettext = 'Mentions';
          }
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: `${length}${tickettext} ${this.translate.instant('cannot-attach-close-ticket')}`,
            },
          });
          return;
        }

        const performActionObj = this._replyService.BuildReply(
          this.currentTicket,
          ActionStatusEnum.AttachTicket,
          this.attachedNote,
          this.selected
        );

        const keyObj: CreateAttachMultipleMentionParam = {
          tasks: this.MapLocobuzz.mapCommunicationLog(performActionObj.Tasks),
          ticketIDs: ticketIds,
          tagIds,
          mentionIDs: MentionIDs,
          source: performActionObj.Source,
          status: 99,
          actionType: 2,
          isTicketGoingForApproval,
          actionTaken: ActionTaken.Locobuzz,
        };

        this._replyService
          .CreateAttachMultipleMentions(keyObj)
          .subscribe((data) => {
            if (data.success) {
              // this._filterService.currentBrandSource.next(true);
              this._bottomSheet.dismiss();
              this._postDetailService.isBulk = false;
              // this._ticketService.ticketStatusChange.next(true);
              this._ticketService.ticketStatusChangeSignal.set(true);
              let msg = '';
              if (isTicketGoingForApproval) {
                msg =
                  this.translate.instant('ORM-workflow-settings');
              } else {
                msg =
                  ticketIds.length +
                ` ${this.translate.instant('mentions-attached-to-Ticket-ID')} ` +
                  this.selected;
              }
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: msg,
                },
              });
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: data?.message ? data.message : this.translate.instant('Some-Error-Occurred'),
                },
              });
            }
            // this.zone.run(() => {
          });
      } else {
        const performActionObj = this._replyService.BuildReply(
          this.currentTicket,
          ActionStatusEnum.AttachTicket,
          this.attachedNote,
          this.selected
        );
        let currentClosedStatus = false;
        const currentTicket = this.currentTicketList.find(
          (obj) =>
            Number(obj.ticketId) === Number(this.selected) &&
            Number(obj.ticketStatus) === 3
        );
        if (currentTicket) {
          currentClosedStatus = true;
        }
        const keyObj: CreateAttachMultipleMentionParam = {
          tasks: this.MapLocobuzz.mapCommunicationLog(performActionObj.Tasks),
          ticketIDs: [this.currentTicket.ticketInfo.ticketID],
          tagIds: [this.currentTicket.tagID],
          mentionIDs: [
            this.currentTicket.brandInfo.brandID +
              '/' +
              this.currentTicket.channelType +
              '/' +
              this.currentTicket.contentID,
          ],
          source: performActionObj.Source,
          status: 99,
          actionType: 2,
          isTicketGoingForApproval: this.checkTicketAprrovalStatus(),
          actionTaken: ActionTaken.Locobuzz,
        };

        this._replyService
          .CreateAttachMultipleMentions(keyObj)
          .subscribe((data) => {
            if (data?.success) {
              // this._filterService.currentBrandSource.next(true);
              this._bottomSheet.dismiss();
              // this._ticketService.ticketStatusChange.next(true);
              this._ticketService.ticketStatusChangeSignal.set(true);
              const AttachTicket =
                this._ticketService.GetActionEnum().AttachTicket;
              const msg = this._ticketService.GetToastMessageonPerformAction(
                AttachTicket,
                this.currentTicket,
                this.currentUser,
                currentClosedStatus
              );
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: msg,
                },
              });
            } 
            else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: data?.message ? data.message : this.translate.instant('Some-Error-Occurred'),
                },
              });
            }
            // this.zone.run(() => {
          });
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-select-ticket-Id'),
        },
      });
    }
  }

  noteTextChange(nodeElement: any, holder: any) {
    if (this[holder] && this[holder]?.length > 2500) {
      this[holder] = this[holder].substring(0, 2500)
      if (nodeElement) nodeElement.value = this[holder].substring(0, 2500)
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Character-Limit-Note'),
        },
      });
      this._cdr.detectChanges();
      return false;
    }
  }
}

interface DrpTicketStat {
  value: string;
  viewValue: string;
}

interface TicketStatGroup {
  disabled?: boolean;
  name: string;
  tickets: DrpTicketStat[];
}
