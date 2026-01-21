import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ClientStatusEnum } from 'app/core/enums/ActionStatus';
import { notificationType } from 'app/core/enums/notificationType';
import { PerformedAction } from 'app/core/enums/PerformedAction';
import { TicketsCommunicationLog } from 'app/core/models/dbmodel/TicketReplyDTO';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { NavigationService } from 'app/core/services/navigation.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { Observable } from 'rxjs';
import { AssignToList } from '../../../shared/components/filter/filter-models/assign-to.model';
import { PostAssignToService } from './../../services/post-assignto.service';
import { SubSink } from 'subsink';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { AccountService } from 'app/core/services/account.service';
import { take } from 'rxjs/operators';
import { AuthUser } from 'app/core/interfaces/User';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-post-assignto',
    templateUrl: './post-assignto.component.html',
    styleUrls: ['./post-assignto.component.scss'],
    standalone: false
})
export class PostAssigntoComponent implements OnInit, OnDestroy, AfterViewInit {
  assignTo: Observable<AssignToList[]>;
  assignToForm: UntypedFormGroup;
  assignToName: string;
  note: string = '';
  selectedAssignTo: number;
  defaultNote: string;
  subs = new SubSink();
  loadingUserList = false;
  assigningUser = false;
  currentUser:AuthUser;
  disableAssign: boolean = false;
  postData
  teamSelectedData: any[] = [];
  defaultLayout: boolean = false;
  constructor(
    private _postDetailService: PostDetailService,
    private formBuilder: UntypedFormBuilder,
    private _ticketService: TicketsService,
    private _snackBar: MatSnackBar,
    private _postAssignToService: PostAssignToService,
    private _replyService: ReplyService,
    private _navigationService: NavigationService,
    public dialog: MatDialog,
    private _filterService: FilterService,
    private dialogRef: MatDialogRef<PostAssigntoComponent>,
    private navigationService: NavigationService,
    private _accountService:AccountService,
    private _cdr:ChangeDetectorRef,
    private _sidebarService:SidebarService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.teamSelectedData = [];
    this.postData = this._postDetailService.postObj;
    this.assignTo = this._postAssignToService.assignTo$;
    this.subs.add(
      this._postAssignToService.loadingUsers.subscribe((data) => {
        this.loadingUserList = data;
      })
    );
    this.createAssignToForm();
    if (this._postDetailService.postObj.ticketInfo.assignedTo > 0) {
      this.selectedAssignTo =
        this._postDetailService.postObj.ticketInfo.assignedTo;
    } else {
      this.selectedAssignTo =
        this._postDetailService.postObj.ticketInfo.assignedToTeam &&
        this._postDetailService.postObj.ticketInfo.assignedToTeam > 0
          ? this._postDetailService.postObj.ticketInfo.assignedToTeam
          : 0;
    }

    this.defaultNote = this._postAssignToService.defaultNote;
    this.note = '';

    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    if (this._postDetailService.postObj.ticketInfo.assignedTo === this.assignToForm.get('assignToid').value) {
      this.disableAssign = true;
    } else {
      this.disableAssign = false;
    }
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }
  createAssignToForm(): void {
    this.assignToForm = this.formBuilder.group({
      assignToName: new UntypedFormControl(
        this._postDetailService.postObj.ticketInfo.assignedTo
      ),
      assignToid: new UntypedFormControl(this._postDetailService.postObj.ticketInfo.assignedTo == 0 ? this._postDetailService.postObj.ticketInfo.assignedToTeam : this._postDetailService.postObj.ticketInfo.assignedTo),
      note: new UntypedFormControl(''),
    });
  }

  setAssigntoFromValue(form): void {
    this.assignToForm.get('assignToid').patchValue(form.value);
    this.selectedAssignTo = form.value;
    if (this._postDetailService.postObj.ticketInfo.assignedTo === this.assignToForm.get('assignToid').value) {
      this.disableAssign = true;
    } else {
      this.disableAssign = false;
    }
  }

  onSubmit(): void {
    if(this.selectedAssignTo==0)
    {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-select-user-to-assign'),
        },
      });
      return;
    }
    this.assigningUser = true;
    if (this._postDetailService.isBulk) {
      let isTicket = false;
      if (this._postDetailService.pagetype === PostsType.Tickets) {
        isTicket = true;
      }
      const logs = [];
      let findData = this._filterService.fetchedAssignTo.find((obj) => { return obj.agentID == this.assignToForm.value.assignToid; });
      if (Object.keys(findData || {}).length === 0) {
        findData = this._filterService.fetchedAssignToBrandWise.find((obj) => { return obj.agentID == this.assignToForm.value.assignToid; });
      }
      let escalatetouser = findData;
      
      let fromteam = false;
      if (this.teamSelectedData.length > 0) { fromteam = true }
      else {
        fromteam = false;
      } 

      const log = new TicketsCommunicationLog(ClientStatusEnum.Assigned);
      let teamDetails;
      if (fromteam) {
        let findData = this._filterService.fetchedAssignTo.find((obj) => { return obj.teamID == this.teamSelectedData[0] });
        if (Object.keys(findData || {}).length === 0) {
          findData = this._filterService.fetchedAssignToBrandWise.find((obj) => { return obj.teamID == this.teamSelectedData[0] });
        }
        teamDetails = findData;
        log.AssignedToTeam = this.teamSelectedData[0];
      } 
      else {
        log.AssignedToUserID = this.assignToForm.value.assignToid;
        log.AssignedToTeam = escalatetouser.teamID;
      }

      logs.push(log);
      if (this.assignToForm?.value?.note != '') {
        const log1 = new TicketsCommunicationLog(ClientStatusEnum.NotesAdded);
        if (this.assignToForm.value.note.trim()) {
          log1.Note = this.assignToForm.value.note
            ? this.assignToForm.value.note
            : '';
        }
        log1.NotesAttachment = this._replyService.selectedNoteMediaVal;
        if (fromteam) {
          log1.AssignedToTeam = this.teamSelectedData[0];
        } 
        else {
          log1.AssignedToUserID = this.assignToForm.value.assignToid;
          log1.AssignedToTeam = escalatetouser.teamID;
        }
        logs.push(log1);
      }
      const BulkObject = [];
      const chkTicket = this._ticketService.bulkMentionChecked.filter( (obj) => obj.guid === this._navigationService.currentSelectedTab.guid );
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
        PerformedAction: PerformedAction.Assign,
        IsTicket: isTicket,
        IsReplyModified: false,
        ActionTaken: 0,
        Tasks: logs,
        BulkReplyRequests: BulkObject,
      };
      this._replyService.BulkTicketAction(sourceobj).subscribe((data) => {
        if (data?.success) {
          let message = '';
          const tagIDList = [];
          BulkObject.forEach((obj) => {
            /* this._ticketService.updateTicketAssignmentList.next({
              guid: this.navigationService.currentSelectedTab.guid,
              escalateUser: escalatetouser,
              fromTeam: teamDetails,
              tagID: obj.TagID,
            }); */
            this._ticketService.updateTicketAssignmentListSignal.set({
              guid: this.navigationService.currentSelectedTab.guid,
              escalateUser: escalatetouser,
              fromTeam: teamDetails,
              tagID: obj.TagID,
            });
            tagIDList.push(obj.TagID);
          });
          this._ticketService.selectedPostList = [];
          this._ticketService.postSelectTriggerSignal.set(0);
          this._ticketService.bulkMentionChecked = [];
          this._postDetailService.isBulk = false;
          message = this.translate.instant('Bulk-Assign-Successfully');
          this._ticketService.ticketAssignedToListObs.next({ tagIDList: tagIDList, assignedUser: escalatetouser })
          // this._filterService.currentBrandSource.next(true);
          this._filterService.currentBrandSourceSignal.set(true);
          this.dialogRef.close();
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: message,
            },
          });
          this.teamSelectedData = [];
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data.message : this.translate.instant('Something-went-wrong'),
            },
          });
        }
        this.assigningUser = false;
        // this.zone.run(() => {
      });
      //this._replyService.BulkActionAPI(sourceobj, PerformedAction.Assign);
    } 
    else {
      let findData = this._filterService.fetchedAssignTo.find((obj) => { return obj.agentID === this.assignToForm.value.assignToid; });
      if (Object.keys(findData || {}).length === 0) {
        findData = this._filterService.fetchedAssignToBrandWise.find((obj) => { return obj.agentID === this.assignToForm.value.assignToid; });
      }
      let escalatetouser = findData;
      if (this.teamSelectedData?.length == 0) {
        this._postDetailService.postObj.ticketInfo.assignedTo = this.assignToForm.value.assignToid;
        this._postDetailService.postObj.ticketInfo.assignedToTeamName = escalatetouser.teamName;
        this._postDetailService.postObj.ticketInfo.assignedToTeam = escalatetouser.teamID;
        if (this.currentUser?.data?.user?.role == UserRoleEnum.CustomerCare) {
          this._postDetailService.postObj.ticketInfo.escalatedTo = this.assignToForm.value.assignToid;
        }
      }

      if (this.teamSelectedData?.length > 0){
        this._postDetailService.postObj.ticketInfo.assignedToTeam = this.teamSelectedData[0];
        this._postDetailService.postObj.ticketInfo.assignedTo = 0;
        if (this.currentUser?.data?.user?.role == UserRoleEnum.CustomerCare) {
          this._postDetailService.postObj.ticketInfo.escalatedToCSDTeam = this.teamSelectedData[0];
        }
      }

      this._postDetailService.postObj.ticketInfo.lastNote = this.assignToForm.value.note;
      const object = {
        brandInfo: this._postDetailService.postObj.brandInfo,
        ticketInfo: this._postDetailService.postObj.ticketInfo,
        channelType: this._postDetailService.postObj.channelType,
        NotesAttachment: this._replyService.selectedNoteMediaVal.length > 0 ? this._replyService.selectedNoteMediaVal : null,
      };

      this._ticketService.ticketReassignToUser(object).subscribe(
        (data) => {
          if (JSON.parse(JSON.stringify(data)).success) {
            const team = this._filterService.fetchedAssignTo.find(
              (x) => x.teamID === this.assignToForm.value.assignToid
              );
              /* this._ticketService.updateTicketAssignmentList.next({
                guid: this.navigationService.currentSelectedTab.guid,
                escalateUser: escalatetouser,
                fromTeam: team,
                tagID: this._postDetailService.postObj.tagID,
                note: this.assignToForm.value.note,
                NotesAttachment: this._replyService.selectedNoteMediaVal.length > 0 ? this._replyService.selectedNoteMediaVal : null,
              }); */
            this._ticketService.updateTicketAssignmentListSignal.set({
                guid: this.navigationService.currentSelectedTab.guid,
                escalateUser: escalatetouser,
                fromTeam: team,
                tagID: this._postDetailService.postObj.tagID,
                note: this.assignToForm.value.note,
                NotesAttachment: this._replyService.selectedNoteMediaVal.length > 0 ? this._replyService.selectedNoteMediaVal : null,
              });
              if (this._replyService.selectedNoteMediaVal){
                this._replyService.clearNoteAttachmentSignal.set(true);
              }
            this._ticketService.ticketAssignedToChange.next(this.assignToForm.value.assignToid)
            this.dialogRef.close();
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Ticket-Assigned-Successfully'),
              },
            });
            this.teamSelectedData = [];
            if (this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare || this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount) {
              this._ticketService.csdAssignObs.next(this._postDetailService.postObj);
            }
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: JSON.parse(JSON.stringify(data)).message ? JSON.parse(JSON.stringify(data)).message : 'Error Occured',
              },
            });
          }
          this.assigningUser = false;
        },
        (error) => {
          // console.log(error);
          this.assigningUser = false;
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  ngAfterViewInit(): void {   
    this.assignToForm.get('note').valueChanges.subscribe((val) => {
      this.disableAssign = false;
    })
  }

  noteTextChange(cotrolName:string){
    const note = this.assignToForm.get(cotrolName)?.value;
    if (note && note?.length > 2500){
      const updateNote:string = note.substring(0, 2500)
      this.assignToForm.get(cotrolName)?.patchValue(updateNote);
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

  refreshList(){
    this._postAssignToService.getAssignedUsersList(this.currentUser, this._postDetailService.postObj.makerCheckerMetadata.workflowStatus, false, true );
    this._cdr.detectChanges();
  }
}
