import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { LogStatus } from 'app/core/enums/LogStatus';
import { notificationType } from 'app/core/enums/notificationType';
import { CommunicationLog, noteAttachmentList } from 'app/core/models/viewmodel/CommunicationLog';
import { CustomSnackbarComponent } from 'app/shared/components';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { TicketConversationComponent } from '../ticket-conversation/ticket-conversation.component';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { VideoDialogComponent } from '../video-dialog/video-dialog.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink/dist/subsink';

@Component({
    selector: 'app-post-timeline',
    templateUrl: './post-timeline.component.html',
    styleUrls: ['./post-timeline.component.scss'],
    standalone: false
})
export class PostTimelineComponent implements OnInit, AfterViewInit, OnDestroy {
  panelOpenState = false;
  @Input() item: CommunicationLog;
   note:string='';
  MediaEnum = MediaEnum
  moreList = []
  lessList=[]
  fileList = []

  showNotes: boolean=false;
  showMoreLessMediaFlag:boolean = false;
  showMoreMediaFlag: boolean = false;
  getTicketCategoryDetailsapi: any;
  getMentionCategoryDetailsapi: any;
  getCurrentMentionTimeout: any;
  getNotesTimeout: any;
  defaultLayout = false;
  userSelectedLanguage = "en";
  layout = "ltr";
  subs = new SubSink();
  constructor(
    private elementRef: ElementRef,
    private _ngZone: NgZone,
    public dialog: MatDialog,
    private cdkRef:ChangeDetectorRef,
    private _userDetailService: UserDetailService,
    private _snackBar: MatSnackBar,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    private traslate: TranslateService

  ) {}

  ngOnInit(): void {
    this.commonService.onChangeLayoutType.subscribe((layoutType) => {
      if (layoutType) {
        this.defaultLayout = layoutType == 1 ? true : false;
        this.cdkRef.detectChanges();
      }
    })
    this.subs.add(
      this._sidebarService.selectedLanguage.subscribe(res => {
        this.userSelectedLanguage = res;
        if (this._sidebarService.rtlLanguages.includes(this.userSelectedLanguage)) {
          this.layout = "rtl";
        }
      })
    );
    this.verifyText(this.item);
    if (this.item?.status == this.logstatusEnum.PriorityChanged || this.item?.status == this.logstatusEnum.SentimentChanged){
      if (this.item?.note && typeof this.item?.note == 'string' && this.item?.note.includes('from') && this.item?.note.includes('to')){
        this.item.noteLogDetails = JSON.parse(this.item.note);
      }
    }
    console.log("dasdasdas", this.item)
  }
  public get logstatusEnum(): typeof LogStatus {
    return LogStatus;
  }
  public get actionstatusEnum(): typeof ActionTaken {
    return ActionTaken;
  }
  replaceBetween(origin, startIndex, endIndex, insertion) {
    return (
      origin.substring(0, startIndex) + insertion + origin.substring(endIndex)
    );
  }
  verifyText(item: CommunicationLog): void {
    if (item && item.logText) {
      if (
        item.logText.indexOf(`onclick='BrandTickets.GetCurrentMention`) > -1
      ) {
        const firstindex = item.logText.indexOf(
          `onclick='BrandTickets.GetCurrentMention`
        );
        const startindex = item.logText.indexOf(
          `BrandTickets.GetCurrentMention`
        );
        const endindex = item.logText.indexOf(`'`, startindex) + 1;
        const insertion = `id="this__mention__${item.tagID}"`;
        item.logText = this.replaceBetween(
          item.logText,
          firstindex,
          endindex,
          insertion
        );

        item.logText = item.logText.replace(
          `onclick='BrandTickets.GetCurrentMention`,
          `(click)=GetCurrentMention`
        );
      }

      if (
        item.logText.indexOf(`onclick='BrandTickets.ShowNotes`) > -1
      ) {
        const firstindex = item.logText.indexOf(
          `onclick='BrandTickets.ShowNotes`
        );
        const startindex = item.logText.indexOf(
          `BrandTickets.ShowNotes`
        );
        const endindex = item.logText.indexOf(`'`, startindex) + 1;
        const insertion = `id="this__note__${item.tagID}"`;
        item.logText = this.replaceBetween(
          item.logText,
          firstindex,
          endindex,
          insertion
        );
        item.logText = item.logText.replace(
          `onclick='BrandTickets.ShowNotes`,
          `(click)=getNotes`
        );
        item.logText = item.logText.replace(
          `color: #3FA9F5`,
          `color: #185edf`
        );
      }

      if (
        item.logText.indexOf(`this mention`) > -1 && !item.logText.includes(`span`)
      ) {
        const firstindex = item.logText.indexOf(
          `this mention`
        );
        const endindex = firstindex + 'this mention'.length-1;
        item.logText = item.logText.substring(0, firstindex - 1) + `<a id="this__mention__${item.tagID}" style="color: #3FA9F5; text-decoration: underline; font-weight: normal;"> this mention </a>` + item.logText.substring(endindex + 1, item.logText.length)
      }
    }

    let obj;
    if (item.note) {
        if(this.isJson(item.note))
        {
          obj = JSON.parse(item.note);
          this.note = obj?.Note != undefined ? obj.Note : obj?.toString();
        }else
        {
          this.note = item.note
        }
    }
    if (this.item?.notesAttachmentMetadata?.mediaContents?.length > 0 || obj?.NotesAttachment?.length > 0) {
      this.noteMedia();
      if(this.fileList.length > 5){
        this.showMoreMediaFlag =true
        this.showMoreLessMediaFlag = !this.showMoreLessMediaFlag
        this.moreList=this.fileList.slice(5);
        this.fileList=this.fileList.splice(0,5);
      }
    }
  }

  isJson(str):boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
  

  ngAfterViewInit() {
    this._ngZone.runOutsideAngular(() => {
      this.getCurrentMentionTimeout = setTimeout(() => {
        if (
          this.elementRef.nativeElement.querySelector(
            `#this__mention__${this.item.tagID}`
          )
        ) {
          this.elementRef.nativeElement
            .querySelector(`#this__mention__${this.item.tagID}`)
            .addEventListener('click', this.GetCurrentMention.bind(this));
        }
        console.log('setTimeout called');
      }, 0);
    });

    this._ngZone.runOutsideAngular(() => {
      this.getNotesTimeout = setTimeout(() => {
        if (
          this.elementRef.nativeElement.querySelector(
            `#this__note__${this.item.tagID}`
          )
        ) {
          this.elementRef.nativeElement
            .querySelector(`#this__note__${this.item.tagID}`)
            .addEventListener('click', this.getNotes.bind(this));
        }
        console.log('setTimeout called');
      }, 0);
    });
  }

  GetCurrentMention() {
    const inputParam = {
      BrandName: this.item.brandInfo.brandName,
      TagId: Number(this.item.tagID),
    };

    // this.ticketService.getMentionReplybyTagID(inputParam).subscribe((obj) => {
    //   if (obj && obj.success) {
    const dialogRef = this.dialog.open(TicketConversationComponent, {
      width: '1000px',
      data: { mentionHistoryFlag: true, inputParam },
    });
    //   } else {
    //     this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //       duration: 5000,
    //       data: {
    //         type: notificationType.Warn,
    //         message: 'Request failed to get mention details',
    //       },
    //     });
    //   }
    // });
  }

  getNotes(){
    this.showNotes=!this.showNotes;
    this.cdkRef.detectChanges();
  }

  noteMedia() {
    this.moreList = []
    this.fileList = []

    let obj;
    if (this.item) {
      if (this.isJson(this.item.note)) {
        obj = JSON.parse(this.item.note);
      } 
    }
    
    let attachmentObj: noteAttachmentList = {
      fileName: '',
      mediaUrl: '',
      mediaType: null,
      mediaPath: ''
    };
    if (this.item?.notesAttachmentMetadata?.mediaContents?.length > 0) {
      this.item?.notesAttachmentMetadata?.mediaContents.forEach(obj => {
        attachmentObj = {
          fileName: obj?.name,
          mediaUrl: obj?.mediaUrl,
          mediaPath: obj?.mediaUrl,
          mediaType: +obj?.mediaType,
        }
        // if (attachmentObj?.mediaType == MediaEnum.IMAGE || attachmentObj?.mediaType == MediaEnum.VIDEO || attachmentObj?.mediaType == MediaEnum.ANIMATEDGIF) {
        //   this.mediaList.push(attachmentObj);
        // } else if (attachmentObj?.mediaType == MediaEnum.PDF || attachmentObj?.mediaType == MediaEnum.DOC || attachmentObj?.mediaType == MediaEnum.EXCEL) {
        this.fileList.push(attachmentObj);
        // }
      })
    } else if (obj?.NotesAttachment?.length > 0){
      obj?.NotesAttachment.forEach(obj => {
        attachmentObj = {
          fileName: obj?.Name,
          mediaUrl: obj?.MediaUrl,
          mediaPath: obj?.MediaUrl,
          mediaType: +obj?.MediaType,
        }
        this.fileList.push(attachmentObj);
      })
    }
  }
  openNoteAttachmentDocAndAudioPreview(media, type): void {
    if ( this.fileList?.length > 0) {
      let attachments;
      if (media instanceof Object && Object.keys(media).length > 0) {
        let findMedia: noteAttachmentList;
        // if (type == 'media') {
        //   findMedia = this.mediaList?.find((item) => item.mediaUrl == media?.mediaUrl);
        // } else {
        findMedia = this.fileList?.find((item) => item.mediaUrl == media?.mediaUrl);
        // }
        findMedia.mediaType = media?.mediaType;
        attachments = [findMedia];
      }
      else {
        // if (type == 'media') {
        //   this.mediaList[0].mediaUrl = media;
        //   attachments = this.mediaList;
        // } else {
          this.fileList[0].mediaUrl = media;
          attachments = this.fileList;
        // }
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

  showMoreLessMedia(){
    this.showMoreLessMediaFlag = !this.showMoreLessMediaFlag;
    if (!this.showMoreLessMediaFlag){
      this.fileList.push(...this.moreList)
      this.moreList=[];
    }else{
      this.moreList = this.fileList.slice(5);
      this.fileList=this.fileList.splice(0,5);
    }
  }

  GetTicketCategoryDetails(log): void {
    if (log.status == this.logstatusEnum.PriorityChanged){
      return
    }
    if (log.status == this.logstatusEnum.ModifyCategoryInformation) {
      this.GetMentionCategoryDetails(log);
      return
    }
    const obj = {
      TicketID: log?.ticketID, LogID: log?.id
    }
    this.getTicketCategoryDetailsapi = this._userDetailService.GetTicketCategoryDetails(obj).subscribe(
      (data:any) => {
        if (data.success){
          this.item.logDetails = data.data;
          this.cdkRef.detectChanges();
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.traslate.instant('Unable-to-fetch-log-detail'),
            },
          });
        }
      },
      (error) => {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.traslate.instant('Unable-to-fetch-log-detail'),
              },
        });
        // console.log(error);
      }
    );
  }

  GetMentionCategoryDetails(log): void {
    const obj = {
      TagID: log?.tagID, LogID: log?.id
    }
    this.getMentionCategoryDetailsapi = this._userDetailService.GetMentionCategoryDetails(obj).subscribe(
      (data) => {
        this.item.logDetails = data.data;
        this.cdkRef.detectChanges();
      },
      (error) => {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.traslate.instant('Unable-to-fetch-log-detail'),
          },
        });
        // console.log(error);
      }
    );
  }
  
  ngOnDestroy(): void {
    this.clearAllTimelineData();
    if (this.getCurrentMentionTimeout) {
      clearTimeout(this.getCurrentMentionTimeout);
    }
    if (this.getNotesTimeout) {
      clearTimeout(this.getNotesTimeout);
    }
  }

  clearAllTimelineData() {
    if (this.getTicketCategoryDetailsapi) {
      this.getTicketCategoryDetailsapi.unsubscribe();
    }
    if (this.getMentionCategoryDetailsapi) {
      this.getMentionCategoryDetailsapi.unsubscribe();
    }
  }
}
