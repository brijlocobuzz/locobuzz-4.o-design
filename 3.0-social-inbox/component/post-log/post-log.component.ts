import { I } from '@angular/cdk/keycodes';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LogStatus } from 'app/core/enums/LogStatus';
import { notificationType } from 'app/core/enums/notificationType';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { AuthUser } from 'app/core/interfaces/User';
import {
  batchIDFormStaus,
  CommunicationLog,
} from 'app/core/models/viewmodel/CommunicationLog';
import { AccountService } from 'app/core/services/account.service';
import { CustomSnackbarComponent } from 'app/shared/components/custom-snackbar/custom-snackbar.component';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { take } from 'rxjs/operators';
import { TicketConversationComponent } from '../ticket-conversation/ticket-conversation.component';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { VideoDialogComponent } from '../video-dialog/video-dialog.component';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { SubSink } from 'subsink';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-post-log',
    templateUrl: './post-log.component.html',
    styleUrls: ['./post-log.component.scss'],
    standalone: false
})
export class PostLogComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() logMessage?: CommunicationLog;
  @Input() replyText?: string;
  @Input() logObj?:any;
  @Input() isCombineLog?:boolean = false;
  @Output() editClicked = new EventEmitter<MouseEvent>();
  @Output() noteDataObj = new EventEmitter<any>();
  // @Input() ticketUpdateLog = false;
  currentUser: AuthUser;
  style: string;
  cssClass: string;
  isNoteNull: boolean;
  LogCondition: number;
  isApproved: boolean;
  matIcon: string;
  moreNote=true;
  formSubmittedFlag:boolean=false;
  @Input() showIcon: boolean = false;
  formSubmittedEntry: batchIDFormStaus;
  authorName: string;
  MediaEnum = MediaEnum
  editedNoteLog: any[] = [];
  LogStatus = LogStatus;
  getTicketCategoryDetailsApiRes : any;
  getMentionCategoryDetailsApiRes : any;
  elementRedTimeOut : any;
  attachmentList:any[]=[]
     @ViewChild('attachmentContainer') attachmentContainer: ElementRef
      @ViewChildren('attachmentRef') attachmentRef: ElementRef[];
  showMoreAttachment: boolean;
  maximumAttachmentLength: number;
  remainingAttachmentCount: number;
subs = new SubSink();
  defaultLayout: boolean = false;
  object: any;
  showFullSuggestionText: boolean = false;
  parsedNoteData: any = null;
  userSelectedLanguage = "en";
  layout = "ltr";
  constructor(
    private accountService: AccountService,
    private ticketService: TicketsService,
    private _snackBar: MatSnackBar,
    public dialog: MatDialog,
    private elementRef: ElementRef,
    private _ngZone: NgZone,
    private changeDetechRef: ChangeDetectorRef,
    private postDetailedService: PostDetailService,
    private _userDetailService: UserDetailService,
    private cdkRef: ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {   
    if (this.logMessage) {
      this.accountService.currentUser$
        .pipe(take(1))
        .subscribe((user) => (this.currentUser = user));
      // construct an object
      this.mapCommunicatioObject(this.logMessage);
      this.object = this.logMessage;
      if(this.LogCondition == 9){
        this.parsedNoteData = this.getParsedNote(this.object?.note);
      }
    } else {
      // ticket reply action is performed show refresh button
      this.LogCondition = 5;
      if (this.replyText) {
        this.LogCondition = 6;
      }
    }
    if(this.logMessage && this.logObj){
      this.getEditNote();
    }
    if (this.logMessage?.status == this.LogStatus.PriorityChanged || this.logMessage?.status == this.LogStatus.SentimentChanged) {
      if (this.logMessage?.note && typeof this.logMessage?.note == 'string' && this.logMessage?.note.includes('from') && this.logMessage?.note.includes('to')) {
        this.logMessage.noteLogDetails = JSON.parse(this.logMessage.note);
      }
    }
    if(this.logMessage?.mediaList?.length > 0 || this.logMessage?.fileList?.length > 0){
    const attachmentList = this.logMessage?.mediaList?.concat(this.logMessage?.fileList);
      attachmentList.forEach((item) => {
        item.iconUrl= (item?.mediaType == MediaEnum.IMAGE) ? 'assets/icons/JPEG.svg' : (item?.mediaType == MediaEnum.VIDEO) ? 'assets/icons/video-icon.svg' : (item?.mediaType == MediaEnum.PDF) ? 'assets/icons/PDF.svg' : (item?.mediaType == MediaEnum.EXCEL) ? 'assets/icons/Xls.svg' : item?.mediaType == MediaEnum.DOC ? 'assets/icons/DOC.svg' : item?.mediaPath.includes('doc') ? 'assets/icons/DOC.svg' : item?.mediaPath.includes('docx') ? 'assets/icons/DOCX.svg' : item?.mediaPath.includes('ppt') ? 'assets/icons/PPT.svg' : item?.mediaPath.includes('pptx') ? 'assets/icons/PPTX.svg' : item?.mediaPath.includes('xls') ? 'assets/icons/Xls.svg' : item?.mediaPath.includes('xlsx') ? 'assets/icons/Xlsx.svg' : item?.mediaPath.includes('pdf') ? 'assets/icons/PDF.svg' : 'assets/icons/Other.svg',
      this.attachmentList = attachmentList;
    })
    this.maximumAttachmentLength = this.attachmentList.length;
  }
  this.subs.add(
    this.ticketService.postLogAttachmentCalculationObs.subscribe((data) => {
      if (data) {
        this.maximumAttachmentLength = this.attachmentList.length;
        if (this.attachmentContainer) {
        this.checkEmailAttachmentWidth();
        }
      }
    })
  )
  this.subs.add(
    this.commonService.onChangeLayoutType.subscribe((layoutType) => {
      if (layoutType) {
        this.defaultLayout = layoutType == 1 ? true : false;
        this.cdkRef.detectChanges();
      }
    })
  )
  this.subs.add(
    this._sidebarService.selectedLanguage.subscribe(res => {
      this.userSelectedLanguage = res;
      if (this._sidebarService.rtlLanguages.includes(this.userSelectedLanguage)) {
        this.layout = "rtl";
      }
    })
  );
}
  replaceBetween(origin, startIndex, endIndex, insertion) {
    return (
      origin.substring(0, startIndex) + insertion + origin.substring(endIndex)
    );
  }
  mapCommunicatioObject(comObj: CommunicationLog): void {
    this.style = '';
    this.cssClass = '';
    //check click method
    if (comObj && comObj.logText) {
      if (
        comObj.logText.indexOf(`onclick='BrandTickets.GetCurrentMention`) > -1
      ) {
        const firstindex = comObj.logText.indexOf(
          `onclick='BrandTickets.GetCurrentMention`
        );
        const startindex = comObj.logText.indexOf(
          `BrandTickets.GetCurrentMention`
        );
        const endindex = comObj.logText.indexOf(`'`, startindex) + 1;
        const insertion = `id="this__mention__${comObj.tagID}"`;
        comObj.logText = this.replaceBetween(
          comObj.logText,
          firstindex,
          endindex,
          insertion
        );

        comObj.logText = comObj.logText.replace(
          `onclick='BrandTickets.GetCurrentMention`,
          `(click)=GetCurrentMention`
        );
      }
      if (!comObj.logText.includes('has dettached ')) {
        comObj.logText = comObj.logText.replace(
          'has dettached',
          'has dettached '
        );
      }

      if (!comObj.logText.includes('has attached ')) {
        comObj.logText = comObj.logText.replace(
          'has attached',
          'has attached '
        );
      }
      const noteTxt = `<a onclick='BrandTickets.ShowNotes(${comObj.iD})' style='color: #3FA9F5; text-decoration: underline; font-weight: normal;'>a note</a>`;
      const noteTxt1 = `<a onclick='BrandTickets.ShowNotes(${comObj.iD})' style='color: #56A9FA; text-decoration: underline; font-weight: normal;'>a note</a>`;

      if (
        comObj.logText.includes(noteTxt) ||
        comObj.logText.includes(noteTxt1)
      ) {
        comObj.logText = comObj.logText.replace(noteTxt, 'a note');
      }

      if (!comObj.logText.includes(' with')) {
        comObj.logText = comObj.logText.replace('with ', ' with ');
      }
    }
    if (comObj.status === LogStatus.NotesAdded) {
      this.style = 'display:none';
    } else {
      this.style = 'display:block';
    }
    if (comObj.status === LogStatus.Approve) {
      // this.cssClass = 'post__log--approved';
      this.cssClass = 'post-log__success';
      this.isApproved = true;
    } else if (
      comObj.status === LogStatus.Ignore ||
      comObj.status === LogStatus.SSREReplyRejected
    ) {
      // this.cssClass = 'post__log--rejected';
      this.cssClass = 'post-log__danger';
      this.isApproved = false;
    }

    if (
      comObj.logVersion === 1 &&
      comObj.status === LogStatus.GroupDisplayMessage
    ) {
      this.LogCondition = 1;
      if (comObj.logText.includes('approved')) {
        this.cssClass = 'post-log__success';
        this.isApproved = true;
      } else if (
        comObj.logText.includes('ignored') ||
        comObj.logText.includes('rejected')
      ) {
        this.cssClass = 'post-log__danger';
        this.isApproved = false;
      }

      if (comObj.note) {
        this.isNoteNull = false;
        const obj = JSON.parse(comObj.note);
        // this.logMessage.noteView = obj.Note;
        this.changeDetechRef.detectChanges();
        if (obj.Note) {
          let ClassName: LogStatus;
          if (obj.Note.length > 0) {
            if (
              +this.currentUser.data.user.role === UserRoleEnum.BrandAccount
            ) {
              ClassName = comObj.status;
            }
          }
        }
      }
    } else if (
      comObj.logVersion === 0 &&
      (comObj.status === LogStatus.RepliedToUser ||
        comObj.status === LogStatus.Escalated ||
        comObj.status === LogStatus.Ignore ||
        comObj.status === LogStatus.Approve ||
        comObj.status === LogStatus.NotesAdded ||
        comObj.status === LogStatus.Acknowledge ||
        comObj.status === LogStatus.SRCreated ||
        comObj.status === LogStatus.SRUpdated ||
        comObj.status === LogStatus.CopyMentionFrom ||
        comObj.status === LogStatus.CopyMentionTo ||
        comObj.status === LogStatus.MoveMentionFrom ||
        comObj.status === LogStatus.MoveMentionTo ||
        comObj.status === LogStatus.EmailSent ||
        comObj.status === LogStatus.CustomerInfoAwaited ||
        comObj.status === LogStatus.ModifiedTicketTagging ||
        comObj.status === LogStatus.TicketSubscribed ||
        comObj.status === LogStatus.TicketUnsubscribed ||
        comObj.status === LogStatus.TicketSubscriptionModified ||
        comObj.status === LogStatus.TicketSubscriptionEmailSent ||
        comObj.status === LogStatus.CrmLeadCreated ||
        comObj.status === LogStatus.PerformActionReplyFailed ||
        comObj.status === LogStatus.ReopenACase ||
        comObj.status === LogStatus.OnHold ||
        comObj.status === LogStatus.TeamDeleted ||
        comObj.status === LogStatus.BulkReplyRequestInitiated ||
        comObj.status === LogStatus.ReplyTextModified ||
        comObj.status === LogStatus.MakerCheckerSet ||
        comObj.status === LogStatus.MakerCheckerDisable ||
        comObj.status === LogStatus.SSREReplyRejected ||
        comObj.status === LogStatus.SSREReplyVerified ||
        comObj.status === LogStatus.AutoResponse ||
        comObj.status === LogStatus.SSREExclusionQualified ||
        comObj.status === LogStatus.Assigned ||
        comObj.status === LogStatus.BulkAssignmentInitiated ||
        comObj.status === LogStatus.BulkReopenInitiated ||
        comObj.status === LogStatus.BulkEscalationInitiated ||
        comObj.status === LogStatus.BulkOnHoldInitiated ||
        comObj.status === LogStatus.BulkApproveInitiated ||
        comObj.status === LogStatus.BulkRejectInitiated ||
        comObj.status === LogStatus.BulkDirectcloseInitiated ||
        comObj.status === LogStatus.BulkReplycloseRequestInitiated ||
        comObj.status === LogStatus.BulkReplyholdRequestInitiated ||
        comObj.status === LogStatus.BulkReplyawaitingRequestInitiated ||
        comObj.status === LogStatus.BulkReplyAssignRequestInitiated ||
        comObj.status === LogStatus.BulkReplyEcalatRequestInitiated ||
        comObj.status === LogStatus.ModifyCategoryInformation ||
        comObj.status === LogStatus.ForwardEmailSameThread ||
        comObj.status === LogStatus.ForwardEmailNewThread ||
        comObj.status === LogStatus.DeleteFromLocobuzz ||
        comObj.status === LogStatus.DeleteFromSocial ||
        comObj.status === LogStatus.PriorityChanged ||
        comObj.status === LogStatus.SentimentChanged ||
        comObj.status === LogStatus.Unassigned ||
        comObj.status === LogStatus.WorkflowAlert)
    ) {
      this.LogCondition = 2;
      if (comObj.note) {
        if (comObj.logText.includes('a note')) {
          comObj.logText = comObj.logText.replace(
            `<a onclick='BrandTickets.ShowNotes(4761254)' style='color: #3FA9F5; text-decoration: underline; font-weight: normal;'>a note</a>`,
            'a note'
          );
        }
        let ClassName: LogStatus;
        if (comObj.note.length > 0) {
          if (+this.currentUser.data.user.role === UserRoleEnum.BrandAccount) {
            ClassName = comObj.status;
          }
        }
      }
      if (comObj.status === LogStatus.Escalated) {
        this.matIcon = 'escalator_warning';
      }
      if (comObj.status === LogStatus.Assigned) {
        this.matIcon = 'account_circle';
      }
      if (comObj.status === LogStatus.Approve) {
        this.matIcon = 'check_circle';
      }
      if (
        comObj.status === LogStatus.BulkReplyRequestInitiated ||
        comObj.status === LogStatus.ReplyTextModified ||
        comObj.status === LogStatus.SSREReplyRejected ||
        comObj.status === LogStatus.SSREReplyVerified ||
        comObj.status === LogStatus.RepliedToUser
      ) {
        this.matIcon = 'reply';
      }
      if (
        comObj.status === LogStatus.Ignore ||
        comObj.status === LogStatus.TeamDeleted
      ) {
        this.matIcon = 'cancel';
      }
      if (
        comObj.status === LogStatus.NotesAdded ||
        comObj.status === LogStatus.PerformActionReplyFailed ||
        comObj.status === LogStatus.Acknowledge
      ) {
        this.matIcon = 'text_snippet';
      }
      if (
        comObj.status === LogStatus.CopyMentionFrom ||
        comObj.status === LogStatus.CopyMentionTo ||
        comObj.status === LogStatus.MoveMentionFrom ||
        comObj.status === LogStatus.MoveMentionTo
      ) {
        this.matIcon = 'content_copy';
      }
      if (
        comObj.status === LogStatus.SRCreated ||
        comObj.status === LogStatus.SRUpdated ||
        comObj.status === LogStatus.ModifiedTicketTagging
      ) {
        this.matIcon = 'security_update_good';
      }
      if (
        comObj.status === LogStatus.EmailSent ||
        comObj.status === LogStatus.TicketSubscriptionEmailSent
      ) {
        this.matIcon = 'email';
      }
      if (comObj.status === LogStatus.CustomerInfoAwaited) {
        this.matIcon = 'hourglass_bottom';
      }
      if (
        comObj.status === LogStatus.TicketSubscribed ||
        comObj.status === LogStatus.TicketSubscriptionModified
      ) {
        this.matIcon = 'subscriptions';
      }
      if (comObj.status === LogStatus.TicketUnsubscribed) {
        this.matIcon = 'unsubscribe';
      }
      if (comObj.status === LogStatus.CrmLeadCreated) {
        this.matIcon = 'mode_edit';
      }
      if (comObj.status === LogStatus.ReopenACase) {
        this.matIcon = 'task';
      }
      if (comObj.status === LogStatus.OnHold) {
        this.matIcon = 'pending_actions';
      }
      if (comObj.status === LogStatus.AutoResponse) {
        this.matIcon = 'autorenew';
      }
    } else if (
      comObj.logVersion === 0 &&
      (comObj.status === LogStatus.Closed ||
        comObj.status === LogStatus.SRClosed)
    ) {
      this.LogCondition = 3;
    } else if (comObj.logVersion == 7) {
      this.LogCondition = 7;
    } else if (
      comObj.logVersion == 1 &&
      comObj.status == LogStatus.FormSubmit
    ) {
      this.LogCondition = 8;
      this.formSubmittedEntry = comObj.batchIDFormStaus.find(
        (obj) => obj.status == LogStatus.FormSubmit && obj.checked
      );
      this.authorName = this.postDetailedService.postObj.author.name;
    } else if (
      comObj.status == LogStatus.ResponseGenieAccepted 
      || comObj.status == LogStatus.ResponseGenieDiscard 
      || comObj.status == LogStatus.ResponseGenieUsed 
      || comObj.status == LogStatus.ResponseGenieEdited) {
        this.LogCondition = 9;
    }
  }

  GetCurrentMention() {
    const inputParam = {
      BrandName: this.logMessage.brandInfo.brandName,
      TagId: Number(this.logMessage.tagID),
    };

    // this.ticketService.getMentionReplybyTagID(inputParam).subscribe((obj) => {
    //   if (obj && obj.success) {
    //     const sorter = (a, b) => {
    //       if (a.isBrandPost === false) {
    //         return -1;
    //       }
    //       if (b.isBrandPost === true) {
    //         return 1;
    //       }
    //     };
    //     obj.data = obj.data.sort(sorter);
    const dialogRef = this.dialog.open(TicketConversationComponent, {
      width: '1000px',
      data: { mentionHistoryFlag: true, inputParam },
    });
    //   } else {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Error,
    //         message: 'Request failed to get mention details',
    //       },
    //     });
    //   }
    // });
  }

  ngAfterViewInit() {
    if (this.logMessage) {
      this._ngZone.runOutsideAngular(() => {
        this.elementRedTimeOut = setTimeout(() => {
          if (
            this.elementRef.nativeElement.querySelector(
              `#this__mention__${this.logMessage.tagID}`
            )
          ) {
            this.elementRef.nativeElement
              .querySelector(`#this__mention__${this.logMessage.tagID}`)
              .addEventListener('click', this.GetCurrentMention.bind(this));
            this.elementRef.nativeElement.querySelector(
              `#this__mention__${this.logMessage.tagID}`
            ).style.color = '#3fa9f5';
            this.elementRef.nativeElement.querySelector(
              `#this__mention__${this.logMessage.tagID}`
            ).style.textDecoration = 'underline';
            this.elementRef.nativeElement.querySelector(
              `#this__mention__${this.logMessage.tagID}`
            ).style.fontWeight = 'normal';
          }
          console.log('setTimeout called');
        }, 0);
      });
    }
   if(this.attachmentList?.length>0)
   {
    this.checkEmailAttachmentWidth();
   }
  }

  refreshTicketHistory(): void {
    if (this.postDetailedService.postObj.ticketInfo['isApiActionError']) {
      this.ticketService.failedToUpdateTicketStatus.next({ tagId: this.postDetailedService.postObj.ticketInfo.tagID, ticketId: this.postDetailedService.postObj.ticketInfo.ticketID });
    }
    else {
      // this.ticketService.ticketStatusChange.next(true);
      this.ticketService.ticketStatusChangeSignal.set(true);
      this.ticketService.refreshFillOverview.next(true);
    }
  }

  copied(name): void {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Success,
        message: name + this.translate.instant('copied-success'),
      },
    });
  }
  openNoteAttachmentDocAndAudioPreview(media , type): void {
    let list;
    if(type == 'media'){
      list = this.logMessage.mediaList;
    }else{
      list = this.logMessage.fileList;
    }
    if (list) {
      let attachments;
      console.log(this.logMessage.mediaList, media)
      if (media instanceof Object && Object.keys(media).length > 0) {
        const findMedia = list?.find((item) => item.mediaUrl == media?.mediaUrl);
        findMedia.mediaType = media?.mediaType;
        attachments = [findMedia];
      }
      else {
        list[0].mediaUrl = media;
        attachments = list;
      }
      if (type == 'media') {
        this.logMessage.mediaList = list;
      } else {
        this.logMessage.fileList = list;
      }

      if (attachments.length > 0) {
        this.dialog.open(VideoDialogComponent, {
          panelClass: 'overlay_bgColor',
          data: attachments,
          autoFocus: false,
        });
      }
    }
  }
  getEditNote(){
    const noteId = this.logMessage?.iD;
    this.editedNoteLog = this.logObj.filter((obj)=> obj.id == noteId);
  }  
  onEditClick(event: MouseEvent, noteData) {
    this.editClicked.emit(event);
    this.noteDataObj.emit(noteData);
  }  


  GetTicketCategoryDetails(log): void {
    if (log.status == this.LogStatus.PriorityChanged || log.status == this.LogStatus.SentimentChanged) {
      return
    }
    if (log.status == this.LogStatus.ModifyCategoryInformation) {
      this.GetMentionCategoryDetails(log);
      return
    }
    const obj = {
      TicketID: log?.ticketID, LogID: log?.iD
    }
    this.getTicketCategoryDetailsApiRes = this._userDetailService.GetTicketCategoryDetails(obj).subscribe(
      (data: any) => {
        if (data.success) {
          this.logMessage.logDetails = data.data;
          this.cdkRef.detectChanges();
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Unable-to-fetch-log-detail'),
            },
          });
        }
      },
      (error) => {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Unable-to-fetch-log-detail'),
          },
        });
        // console.log(error);
      }
    );
  }

  GetMentionCategoryDetails(log): void {
    const obj = {
      TagID: log?.tagID, LogID: log?.iD
    }
    this.getMentionCategoryDetailsApiRes = this._userDetailService.GetMentionCategoryDetails(obj).subscribe(
      (data) => {
        this.logMessage.logDetails = data.data;
        this.cdkRef.detectChanges();
      },
      (error) => {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Unable-to-fetch-log-detail'),
          },
        });
        // console.log(error);
      }
    );
  }


  checkEmailAttachmentWidth(): void {
    const containerWidth = this.attachmentContainer.nativeElement.offsetWidth;
    let totalWidth = 0;
    this.attachmentRef.forEach((ref, index) => {
      const width = ref.nativeElement.offsetWidth + 15;
      totalWidth += width;
      if (totalWidth > containerWidth) {
        this.showMoreAttachment = true;
      } else {
        this.maximumAttachmentLength = index + 1;
      }
    });
    this.remainingAttachmentCount = this.attachmentList.length - this.maximumAttachmentLength;
    this.cdkRef.detectChanges();
  }

  downloadFile(url: string, filename: string): void {
    this.ticketService.downloadFile(url, filename)
  }

 openMediaPreview(obj):void
    {

      if (obj.mediaType != 2 && obj.mediaType != 3) {
        return
      }

      const attachments =[];  
        this.attachmentList.forEach((x) => {
          if (x.mediaType == 2 || x.mediaType == 3) {
            attachments.push(x)
          }
        })

  
      this.postDetailedService.galleryIndex  = attachments.findIndex((x) => x.mediaUrl == obj.mediaUrl)
  
         if (attachments.length > 0) {
              this.dialog.open(VideoDialogComponent, {
                panelClass: 'overlay_bgColor',
                data: attachments,
                autoFocus: false,
              });
            }
    }
    


  ngOnDestroy(): void {
    if(this.subs){
      this.subs.unsubscribe();
    }
    if (this.elementRedTimeOut){
      clearTimeout(this.elementRedTimeOut)
    }
    this.clearVariables()
  }
  clearVariables(){
    this.logMessage = null;
    this.replyText = null;
    this.logObj = null;
    this.currentUser = null;
    this.style = null;
    this.cssClass = null;
    this.isNoteNull = null;
    this.LogCondition = null;
    this.isApproved = null;
    this.matIcon = null;
    this.moreNote = null;
    this.formSubmittedFlag = null;
    this.showIcon = null;
    this.formSubmittedEntry = null;
    this.authorName = null;
    this.MediaEnum = null;
    this.editedNoteLog = null;
    this.LogStatus = null;
    if (this.getTicketCategoryDetailsApiRes){
      this.getTicketCategoryDetailsApiRes.unsubscribe();
    }
    if (this.getMentionCategoryDetailsApiRes){
      this.getMentionCategoryDetailsApiRes.unsubscribe();
    }
    this.elementRedTimeOut = null
    this.accountService = null;
    this.ticketService = null;
    this._snackBar = null;
    this.dialog = null;
    this.elementRef = null;
    this._ngZone = null;
    this.changeDetechRef = null;
    this.postDetailedService = null;
    this._userDetailService = null;
    this.noteDataObj = null;
    this.editClicked = null;
    this.cdkRef = null;
    this.changeDetechRef = null;
  }

  getParsedNote(note: any) {
    try {
      return typeof note === 'string' ? JSON.parse(note) : note;
    } catch {
      return {};
    }
  }

  getTruncatedText(text: string, maxLength: number = 600): string {
    if (!text) return text;
    const normalizedText = text.replace(/\s+/g, ' ').trim();

    if (normalizedText.length <= maxLength) return normalizedText;
    return normalizedText.slice(0, maxLength);
  }

  get shouldShowReadMore(): boolean {
    if (!this.parsedNoteData?.Text) return false;
    const normalizedText = this.parsedNoteData.Text.replace(/\s+/g, ' ').trim();
    return normalizedText.length > 600;
  }

  get truncatedText(): string {
    return this.getTruncatedText(this.parsedNoteData?.Text, 600);
  }
}
