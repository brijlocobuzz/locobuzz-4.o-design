import { AfterViewInit, ChangeDetectorRef, Component, effect, ElementRef, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, signal, untracked, ViewChild, ViewChildren } from '@angular/core';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostsType, postView } from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { SubSink } from 'subsink';
import moment from 'moment';
import { MatDialog } from '@angular/material/dialog';
import { VideoDialogComponent } from '../video-dialog/video-dialog.component';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { noteAttachmentList } from 'app/core/models/viewmodel/CommunicationLog';
import { PostActionEnum } from 'app/core/enums/postActionEnum';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { notificationType } from 'app/core/enums/notificationType';
import { TicketDispositionComponent, ticketDispositionList } from '../ticket-disposition/ticket-disposition.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuTrigger } from '@angular/material/menu';
import { CustomSnackbarComponent } from 'app/shared/components';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { BulkOperationObject } from 'app/core/models/dbmodel/BulkOperationObject';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { AlertDialogModel, AlertPopupComponent } from 'app/shared/components/alert-popup/alert-popup.component';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { ActionStatusEnum } from 'app/core/enums/ActionStatus';
import { CreateAttachMultipleMentionParam } from 'app/core/models/viewmodel/CreateAttachMultipleMentionParam';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { Subject } from 'rxjs';
import { LocoBuzzAgent } from 'app/core/models/viewmodel/LocoBuzzAgent';
import { TagMentionCampaignComponent } from '../tag-mention-campaign/tag-mention-campaign.component';
import { PostMarkinfluencerComponent } from '../post-markinfluencer/post-markinfluencer.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AttachTicketComponent } from '../attach-ticket/attach-ticket.component';
import { DOCUMENT } from '@angular/common';
import { CannedResponseComponent } from '../canned-response/canned-response.component';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'app-post-email-node',
    templateUrl: './post-email-node.component.html',
    styleUrls: ['./post-email-node.component.scss'],
    standalone: false
})
export class PostEmailNodeComponent implements OnInit, AfterViewInit,OnDestroy {


  @Input() post: TicketClient;
  @Input() postData: BaseMention;
  @Input() ticketHistoryData: AllBrandsTicketsDTO;
  @Input() pageType: PostsType;
  @Input() openDetailOnClick = false;
  @Input() parentPostFlag: boolean = false;
  @Output() postActionTypeEvent = new EventEmitter<any>();
  @Input() postReplyBlock = false;
  @Input() postDetailTab: LocobuzzTab;
  @Input() showParentPostHeader: boolean = false;
  @Input() hideActionableButton: boolean = false;
  @Input() showActionPerform: boolean = true;
  @Input() postView: postView = postView.detailView;
  @Input() openReply: boolean = false;
  @Input() searchedText: string = '';
  @Input() expandedView: boolean = false;
  @Input() showActionMenu: boolean = false;
  @Input() subject: string;
  @ViewChild('attachmentContainer') attachmentContainer: ElementRef
  @ViewChildren('attachmentRef') attachmentRef: ElementRef[];
  @ViewChild('attachmentNoteContainer') attachmentNoteContainer: ElementRef
  @ViewChildren('attachmentNoteRef') attachmentNoteRef: ElementRef[];
  @ViewChild('clickTicketMenuTrigger') clickTicketMenuTrigger: MatMenuTrigger;


  @Output() expanedViewEvent = new EventEmitter<boolean>();


  absolutTime: boolean = false;
  subs = new SubSink();
  userProfileImg: string = ''
  initials: string = ''
  AllMentionedEmailAddress = ''
  innerHtmlContent: string = '';
  mentionTime: string = '';
  disableHideShowEvent: boolean = false;
  isTicketDispositionFeatureEnabled: boolean = false;
  emailHTMLView: boolean = false;
  effectEmailFriendlyViewObsSignal: any;
  attachmentList: any[] = []
  mediaEnum = MediaEnum
  private clearSignal = signal<boolean>(true);
  domainName: string;
  htmlViewFlag: boolean = true
  maximumAttachmentLength: number;
  maximumAttachmentNoteLength: number;
  showMoreAttachment: boolean = false;
  showMoreNoteAttachment: boolean = false;
  remainingCount: number;
  colorCode: string;
  brandPost: boolean;
  brandLogo: string;
  note: string;
  noteMediaCount = {
    pdfCount: 0,
    xlsCount: 0,
    mediaCount: 0,
    docCount: 0,
    csvCount: 0,
    showDownload: false,
  }
  notesAttachmentList: any = []
  medialist: any = []
  fileList: any = []
  ticketDispositionList: ticketDispositionList[] = [];
  @Output() ticketDispositionEmit = new EventEmitter<boolean>();
  @ViewChild('dispositionMenuTrigger') dispositionMenuTrigger: MatMenuTrigger;
  isAITicketTagEnabled: boolean;
  createticketnote: string;
  createTicketStatus: number;
  currentUser:AuthUser
  currentBrand: BrandList;
  cannedapprovenote: string;
  cannedrejectnote: string;
  @Input() mentionHistory:boolean =false
  remainingNotesCount: number;
  internalEmail:boolean;


  constructor(private _ticketService: TicketsService,
    private cdr: ChangeDetectorRef,
    private _mapLocobuzzService: MaplocobuzzentitiesService,
    private _dialog: MatDialog,
    private _postDetailService: PostDetailService,
    private filterService: FilterService,
    private _replyService: ReplyService,
    private _snackBar: MatSnackBar,
     private _bottomSheet: MatBottomSheet,
     private translate: TranslateService,
     @Inject(DOCUMENT) private doucument: Document
  ) {
    let onLoadEmailFriendly = true;
    this.effectEmailFriendlyViewObsSignal = effect(() => {
      const value = this.clearSignal() ? this._ticketService.emailFriendlyViewObsSignal() : untracked(() => this._ticketService.emailFriendlyViewObsSignal());
      if (!onLoadEmailFriendly && value && this.clearSignal()) {
        this.emailFriendlyViewObsSignalChanges(value);
      } else {
        onLoadEmailFriendly = false;
      }
    }, { allowSignalWrites: true });

  }

  ngOnInit(): void {
    this.disableHideShowEvent = this.expandedView
    this.getEmailHtmlData(this.ticketHistoryData, this.postData);
    this.userProfileImg = this.post?.Userinfo?.image?.includes('assets/images/agentimages/sample-image.svg') ? 'initials' : this.post?.Userinfo?.image;
    this.initials = this._ticketService.getInitials(this.post?.Userinfo?.name);
    this.colorCode = this._ticketService.getColorFromName(this.post?.Userinfo?.name);
    this.brandPost = this.postData.isBrandPost;
    this.absolutTime = localStorage.getItem('absolutTimeFlag') == 'true' ? true : false;
    this.subs.add(
      this._ticketService.absolutTimeObs.subscribe((res) => {
        this.absolutTime = res.absolutTimeFlag;
      })
    )
    this.mentionTime = moment.utc(this.postData.mentionTime).local().format('MMMM D, YYYY, h:mm a')
    this.AllMentionedEmailAddress = this.ticketHistoryData.toMailList?.concat(this.ticketHistoryData.ccMailList, this.ticketHistoryData.bccMailList).join(', ');
    this.attachmentList = this._ticketService.mergeAllAttachmentAddedInEmail(this.ticketHistoryData, this.postData);
    this._postDetailService.emailTicketAttachmentMedia.push({ attachment: this.attachmentList, brandPost: this.postData.isBrandPost, date: this.postData.mentionTime })
    this.domainName = this.getEmailDomain(this.postData?.fromMail)


    this.subs.add(
      this._ticketService.attachmentWidthCalculationDetailViewObs.subscribe((res) => {
        if (res!=null) {
          if (this.postData?.channelGroup == ChannelGroup.Email){
          if ((this.attachmentList?.length > 0 && this.attachmentContainer) || (this.notesAttachmentList?.length>0 && this.attachmentNoteContainer)) {
            this.attachmentContainer? this.maximumAttachmentLength = this.attachmentList.length:'';
            this.attachmentNoteContainer? this.maximumAttachmentNoteLength = this.notesAttachmentList.length:'';
            this.cdr.detectChanges()
            setTimeout(() => {
              if (this.attachmentNoteContainer && this.attachmentNoteRef)
              {
                this.checkEmailAttachmentNoteWidth()
              }
              if (this.attachmentContainer)
              {
                this.checkEmailAttachmentWidth();
              }
            }, 300);
          }
        }
        }
      })
    )

    this.note = this._ticketService.checkLogVersionAndNote(
      this.postData.ticketInfo.lastNote
    )
      ? this.postData.ticketInfo.lastNote
      : '';
    this.isTicketDispositionFeatureEnabled = this.filterService?.fetchedBrandData?.find((x) => x.brandID == this.postData?.brandID)?.isTicketDispositionFeatureEnabled;
    this.noteMedia()
    this.isAITicketTagEnabled = this.filterService?.fetchedBrandData?.find((x) => x.brandID == this.postData?.brandID)?.aiTagEnabled;
    this.currentBrand = this.filterService.fetchedBrandData.find((obj) => obj.brandID == this.postData?.brandID);
    this.currentUser = JSON.parse(localStorage.getItem('user'))
    if (!this.postData?.fromMail?.includes('noreply') && !this.postData?.fromMail?.includes('no-reply') && !this.postData?.fromMail?.includes('no.reply')) {
    this._postDetailService.emailIdsInSameThread.push(this.postData?.fromMail)
    }
    if (this.postData.replytoEmail && this.postData?.provider != 'Gmail') {
      if (!this.postData.replytoEmail.includes('noreply') && !this.postData.replytoEmail.includes('no-reply') && !this.postData.replytoEmail.includes('no.reply')) {
        this._postDetailService.emailIdsInSameThread.push(this.cleanEmail(this.postData.replytoEmail));
      }
    }
    if (this.postData?.toMailList?.length > 0) {
      this._postDetailService.emailIdsInSameThread = this._postDetailService.emailIdsInSameThread.concat(this.postData?.toMailList)
    }
    if (this.postData?.ccMailList?.length>0)
    {
      this._postDetailService.emailIdsInSameThread=  this._postDetailService.emailIdsInSameThread.concat(this.postData?.ccMailList)
    }
    if (this.postData?.bccMailList?.length>0)
    {
      this._postDetailService.emailIdsInSameThread =  this._postDetailService.emailIdsInSameThread.concat(this.postData?.bccMailList)
    }
    // this.internalEmail = this.checkInternalEmail(this.postData?.fromMail, this.postData?.toMailList)
  }

  toogleView(): void {
    if (!this.disableHideShowEvent) {
      this.expandedView = !this.expandedView;
      if (this.expandedView) {
        setTimeout(() => {
          if (this.attachmentNoteContainer && this.attachmentNoteRef) {
          this.checkEmailAttachmentNoteWidth()
          }
          this.checkEmailAttachmentWidth()
        }, 300);
      }
      this.cdr.detectChanges();
      this.expanedViewEvent.emit(this.expandedView);
    }
  }

  getEmailHtmlData(
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    const source = this._mapLocobuzzService.mapMention(mention);
    const object = {
      BrandInfo: source.brandInfo,
      TagId: source.tagID,
    };

    ticketHistoryData.emailPlainText = this._ticketService.replaceNewlinesWithBrTags(mention?.description, '');
    // this.innerHtmlContent = this._ticketService.replaceNewlinesWithBrTags(mention?.description, '<br>');
    this._ticketService.getEmailHtmlData(object).subscribe((data) => {
      if (data.success) {
        if (data.data) {
          data.data = data.data.replace(
            'cid:icon.png',
            'https://images.locobuzz.com/Email/Attachment/7172/a3f18571-7a47-448e-8a9e-a3e4f17cc699.png'
          );
          ticketHistoryData.htmlData = `<div >${data.data}</div>`;
          if (this.searchedText && this.pageType !== PostsType.TicketHistory) {
            const re = new RegExp('\\b(' + this.searchedText + '\\b)', 'igm');
            ticketHistoryData.htmlData = ticketHistoryData.htmlData.replace(
              re,
              '<mark>$&</mark>'
            );
          }
          mention.emailContent = data.data;
          this.innerHtmlContent = ticketHistoryData.htmlData
          this.cdr.detectChanges();
        }
      }
    });

    return ticketHistoryData;
  }


  emailFriendlyViewObsSignalChanges(res) {
    if (res?.tagID == this.postData?.tagID) {
      if (res.show) {
        this.innerHtmlContent = this.ticketHistoryData.htmlData
      } else {
        this.innerHtmlContent = this._ticketService.replaceNewlinesWithBrTags(this.postData?.description, '<br>');
      }
    }
  }



  downloadAllFiles(): void {
    const fileList = []
    this.attachmentList.forEach(file => {
      fileList.push({ name: file.name, url: file.mediaUrl });
    });
    this._ticketService.downloadFilesAsZip(fileList, `Attachment of ${this.postData.ticketID}`)
  }



  downloadFile(url: string, filename: string): void {
    this._ticketService.downloadFile(url, filename)
  }


  openMediaPreview(obj): void {
    if (obj.mediaType != 2 && obj.mediaType != 3) {
      return
    }
    const attachments = [];

    this.attachmentList.forEach((x) => {
      if (x.mediaType == 2 || x.mediaType == 3) {
        attachments.push(x)
      }
    })

    this._postDetailService.galleryIndex = attachments.findIndex((x) => x.mediaUrl == obj.mediaUrl)

    if (attachments.length > 0) {
      this._dialog.open(VideoDialogComponent, {
        panelClass: 'overlay_bgColor',
        data: attachments,
        autoFocus: false,
      });
    }
  }

  getEmailDomain(email): string {
    if (!email || typeof email !== 'string') return null;

    const parts = email.split('@');
    return parts.length === 2 ? parts[1] : null;
  }

  toggleHTMLView(): void {
    this.htmlViewFlag = !this.htmlViewFlag
    if (this.htmlViewFlag) {
      this.innerHtmlContent = this.ticketHistoryData.htmlData
    } else {
      this.innerHtmlContent = this._ticketService.replaceNewlinesWithBrTags(this.postData?.description, '<br>');
    }
    this.cdr.detectChanges();
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
    this.remainingCount = this.attachmentList.length - this.maximumAttachmentLength;
    this.cdr.detectChanges();
  }

  checkEmailAttachmentNoteWidth(): void {
    const containerWidth = this.attachmentNoteContainer.nativeElement.offsetWidth;
    let totalWidth = 0;
    this.attachmentNoteRef.forEach((ref, index) => {
      const width = ref.nativeElement.offsetWidth + 15;
      totalWidth += width;
      if (totalWidth > containerWidth) {
        this.showMoreNoteAttachment = true;
      } else {
        this.maximumAttachmentNoteLength = index + 1;
      }
    });
    this.remainingNotesCount = this.notesAttachmentList.length - this.maximumAttachmentNoteLength;
    this.cdr.detectChanges();
  }

  iframeViewLoaded(iframeRef) {
    // if (this._sidebarService?.iframeStyleStatus) {
    //   if (this.iframeStyle && this.iframeStyle?.nativeElement?.contentWindow?.document?.body?.style)
    //     this.iframeStyle.nativeElement.contentWindow.document.body.style.color =
    //       '#c3cbd7';
    //   this.iframeStyle.nativeElement.contentWindow.document.body.style.backgroundColor =
    //     '#131e33';

    //   this.clickHandler = (event: Event) => event.preventDefault(); // Store reference
    //   this.iframeStyle.nativeElement.addEventListener(
    //     'click',
    //     this.clickHandler
    //   );
    // }
    // this.ngZone.runOutsideAngular((res) => {
    //   this.timeoutId = setTimeout(() => {
    //     const imageTagList = this.iframeStyle?.nativeElement?.contentWindow?.document.getElementsByTagName('img');
    //     for (let item of imageTagList) {
    //       item.addEventListener('click',
    //         this.openImagePreview.bind(this))
    //     };
    //   }, 100);
    // })
    this.adjustIframeHeight(iframeRef)
  }

  adjustIframeHeight(iframe: HTMLIFrameElement) {
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      const updateHeight = () => {
        // if (iframeDoc.body.scrollHeight>100)
        // {
        //   iframe.style.height = (iframeDoc.body.scrollHeight + 30) + 'px';
        // }else{
          iframe.style.height = iframeDoc.body.scrollHeight + 'px';
        // }
      };

      const links = iframeDoc.querySelectorAll('a[href]');
      links.forEach((link: HTMLAnchorElement) => {
        link.target = '_blank';
      });

      const style = iframeDoc.createElement('style');
      style.innerHTML = `body { margin: 0; overflow-y: auto; overflow-x: auto; }`;
      iframeDoc.head.appendChild(style);

      updateHeight();

      // Re-adjust height when images load
      const images: any = iframeDoc.images;
      for (let img of images) {
        img.onload = updateHeight;
      }
    }
    this.expanedViewEvent.emit(this.expandedView);
    this.cdr.detectChanges();
  }

  noteMedia(data?) {
    this.noteMediaCount = {
      pdfCount: 0,
      xlsCount: 0,
      mediaCount: 0,
      docCount: 0,
      csvCount: 0,
      showDownload: false,
    }
    let attachmentObj: noteAttachmentList = {
      fileName: '',
      mediaUrl: '',
      mediaType: null,
      mediaPath: ''
    };
    if (data) {
      // this.postData.ticketInfo.lastNote  = data?.note;
      if (data?.media && data?.media.length > 0) {

        data?.media.forEach(obj => {
          let iconPath = 'assets/images/other-attachment.svg';

          switch (obj?.mediaType) {
            case MediaEnum.IMAGE:
            case MediaEnum.ANIMATEDGIF:
              iconPath = 'assets/icons/JPEG.svg';
              break;
            case MediaEnum.VIDEO:
              iconPath = 'assets/icons/video-icon.svg';
              break;
            case MediaEnum.PDF:
              iconPath = 'assets/icons/PDF.svg';
              break;
            case MediaEnum.DOC:
              iconPath = 'assets/icons/DOC.svg';
              break;
            case MediaEnum.EXCEL:
              iconPath = 'assets/icons/Xls.svg';
              break;
          }
          attachmentObj = {
            fileName: obj?.displayFileName,
            mediaUrl: obj?.mediaPath,
            mediaPath: obj?.mediaPath,
            mediaType: +obj?.mediaType,
            iconUrl: iconPath
          }
          if (attachmentObj?.mediaType == MediaEnum.IMAGE || attachmentObj?.mediaType == MediaEnum.VIDEO || attachmentObj?.mediaType == MediaEnum.ANIMATEDGIF) {
            this.noteMediaCount.mediaCount += 1;
            this.medialist.push(attachmentObj);
          } else if (attachmentObj?.mediaType == MediaEnum.PDF || attachmentObj?.mediaType == MediaEnum.DOC || attachmentObj?.mediaType == MediaEnum.EXCEL) {
            if (attachmentObj?.mediaType == MediaEnum.PDF) {
              this.noteMediaCount.pdfCount += 1;
            } else if (attachmentObj?.mediaType == MediaEnum.DOC) {
              this.noteMediaCount.docCount += 1;
            } else if (attachmentObj?.mediaType == MediaEnum.EXCEL) {
              this.noteMediaCount.xlsCount += 1;
            }
            this.fileList.push(attachmentObj);
          }
        })
      }
    } else {
      if (this.postData?.notesAttachmentMetadata?.mediaContents?.length > 0) {
        this.postData?.notesAttachmentMetadata?.mediaContents.forEach(obj => {
          let iconPath = 'assets/images/other-attachment.svg';

          switch (obj?.mediaType) {
            case MediaEnum.IMAGE:
            case MediaEnum.ANIMATEDGIF:
              iconPath = 'assets/icons/JPEG.svg';
              break;
            case MediaEnum.VIDEO:
              iconPath = 'assets/icons/video-icon.svg';
              break;
            case MediaEnum.PDF:
              iconPath = 'assets/icons/PDF.svg';
              break;
            case MediaEnum.DOC:
              iconPath = 'assets/icons/DOC.svg';
              break;
            case MediaEnum.EXCEL:
              iconPath = 'assets/icons/Xls.svg';
              break;
          }
          attachmentObj = {
            fileName: obj?.name,
            mediaUrl: obj?.mediaUrl,
            mediaPath: obj?.mediaUrl,
            mediaType: +obj?.mediaType,
            iconUrl: iconPath

          }
          if (attachmentObj?.mediaType == MediaEnum.IMAGE || attachmentObj?.mediaType == MediaEnum.VIDEO || attachmentObj?.mediaType == MediaEnum.ANIMATEDGIF) {
            this.noteMediaCount.mediaCount += 1;
            this.medialist.push(attachmentObj);
          } else if (attachmentObj?.mediaType == MediaEnum.PDF || attachmentObj?.mediaType == MediaEnum.DOC || attachmentObj?.mediaType == MediaEnum.EXCEL) {
            if (attachmentObj?.mediaType == MediaEnum.PDF) {
              this.noteMediaCount.pdfCount += 1;
            } else if (attachmentObj?.mediaType == MediaEnum.DOC) {
              this.noteMediaCount.docCount += 1;
            } else if (attachmentObj?.mediaType == MediaEnum.EXCEL) {
              this.noteMediaCount.xlsCount += 1;
            }
            this.fileList.push(attachmentObj);
          }
        })
      }
    }

    this.notesAttachmentList = this.medialist.concat(this.fileList);
  }

  replyPost(): void {
    // this._ticketService.closeAlreadyOpenReplyPopup.next(this.postData);
    this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);

    this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyPost });
  }

  sendPostForwardEmail(newThread?) {
    // this._ticketService.closeAlreadyOpenReplyPopup.next(this.postData);
    this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.sendPostForwardEmail, emailType: newThread });
  }


  emailThreadAttachment(): void {
    this._ticketService.mediaSideBarObs.next(true)
  }





  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.attachmentContainer) {
        if (this.attachmentList?.length > 0) {
          this.checkEmailAttachmentWidth();
          if (this.attachmentNoteContainer && this.attachmentNoteRef) {
          this.checkEmailAttachmentNoteWidth();
          }
        }
      }
    }, 300);
  }

  ticketDispositionDialog(): void {
    if (
      this.postData?.channelGroup === ChannelGroup.Email &&
      !this.postData?.allMentionInThisTicketIsRead
    ) {
      const obj = {
        brandID: this.postData?.brandInfo.brandID,
        brandName: this.postData?.brandInfo.brandName,
      };
      // console.log('reply approved successfull ', data);
      this._replyService.GetBrandMentionReadSetting(obj).subscribe((resp) => {
        if (resp) {
          if (resp.isMentionReadCompulsory) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message:
                  this.translate.instant('Please-read-all-mentions'),
              },
            });
          } else {
            const brandInfo = this.filterService.fetchedBrandData.find(
              (obj) => obj.brandID == this.postData?.brandInfo.brandID
            );
            if (brandInfo) {
              const obj = {
                CategoryGroupID: brandInfo.categoryGroupID,
                CategoryGroupName: brandInfo.categoryName,
                TicketID: this.postData?.ticketID
              };
              this._replyService.getDispositionDetails(obj).subscribe((res) => {
                if (res.success) {
                  this.ticketDispositionList = res.data.ticketDispositionList;
                  if (this.ticketDispositionList.length > 0) {
                    const despositionObj = {
                      baseMention: this.postData,
                      dispositionList: this.ticketDispositionList,
                      note: res?.data ? res?.data?.note : '',
                      ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
                    }
                    const dialogRef = this._dialog.open(TicketDispositionComponent, {
                      width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                      data: despositionObj,
                    });

                    dialogRef.afterClosed().subscribe((res) => {
                      if (res) {
                        this.ticketDispositionEmit.emit(res);
                      }
                    });
                  } else {
                    this.dispositionMenuTrigger.openMenu();
                  }
                } else {
                  this.dispositionMenuTrigger.openMenu();
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

          }
        }
      });
    } else {
      const brandInfo = this.filterService.fetchedBrandData.find(
        (obj) => obj.brandID == this.postData?.brandInfo.brandID
      );
      if (brandInfo) {
        const obj = {
          CategoryGroupID: brandInfo.categoryGroupID,
          CategoryGroupName: brandInfo.categoryName,
          TicketID: this.postData?.ticketID
        };
        this._replyService.getDispositionDetails(obj).subscribe((res) => {
          if (res.success) {
            this.ticketDispositionList = res.data.ticketDispositionList;
            if (this.ticketDispositionList.length > 0) {
              const despositionObj = {
                baseMention: this.postData,
                dispositionList: this.ticketDispositionList,
                note: res?.data ? res?.data?.note : '',
                ticketdispositionID: res?.data ? res?.data?.ticketdispositionID : 0
              }
              const dialogRef = this._dialog.open(TicketDispositionComponent, {
                width: this.isAITicketTagEnabled ? '72vw' : '55vw',
                data: despositionObj,
              });

              dialogRef.afterClosed().subscribe((res) => {
                if (res) {
                  this.ticketDispositionEmit.emit(res);
                }
              });
            } else {
              this.dispositionMenuTrigger.openMenu();
            }
          } else {
            this.dispositionMenuTrigger.openMenu();
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
    }
  }

  replyEscalate(): void {
    // this._ticketService.closeAlreadyOpenReplyPopup.next(this.postData);
    this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.replyEscalate });
  }

  assignTicket(): void {
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.assignTickets });
  }

  createTicketCall(): void {
    if (this.postData?.ticketInfo.ticketID) {
      this._ticketService
        .getMentionCountByTicektID(this.postData?.ticketInfo.ticketID)
        .subscribe((data) => {
          if (data.success) {
            if (+data.data === 1) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this.translate.instant('Ticket-not-multiple'),
                },
              });
              this.clickTicketMenuTrigger.closeMenu();
            } else {
              this.createticketnote = '';
              this.clickTicketMenuTrigger.openMenu();
            }
            this.cdr.detectChanges();
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translate.instant('Error-Occured'),
              },
            });
            this.createticketnote = '';
            this.clickTicketMenuTrigger.closeMenu();
            this.cdr.detectChanges();
          }
        });
    }

    if (
      this.postData?.ticketInfo.status ===
      TicketStatus.PendingwithCSDWithNewMention ||
      this.postData?.ticketInfo.status ===
      TicketStatus.OnHoldCSDWithNewMention ||
      this.postData?.ticketInfo.status ===
      TicketStatus.PendingWithBrandWithNewMention ||
      this.postData?.ticketInfo.status ===
      TicketStatus.RejectedByBrandWithNewMention ||
      this.postData?.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention
    ) {
      // call api
      const bulkcreateTicket: BulkOperationObject[] = [];

      const obj = {
        ticketID: this.postData?.ticketID,
        tagID: this.postData?.tagID,
        mentionID: null,
        brandID: this.postData?.brandInfo.brandID,
        brandName: this.postData?.brandInfo.brandName,
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

    directCloseTicket(): void {
      if (this.postData?.replyInitiated) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Previous-request-pending'),
          },
        });
        return;
      }
  
      let isticketagentworkflowenabled = false;
      const currentteamid = +this.currentUser?.data?.user?.teamID;
      let isAgentHasTeam = false;
      if (currentteamid !== 0) {
        isAgentHasTeam = true;
      }
  
      isticketagentworkflowenabled =
        this.postData?.ticketInfo.ticketAgentWorkFlowEnabled;
      const isworkflowenabled = this.filterService.fetchedBrandData.find(
        (brand: BrandList) => +brand.brandID === this.postData?.brandInfo.brandID
      );
  
      if (
        !isAgentHasTeam &&
        this.currentUser?.data?.user?.role === UserRoleEnum.Agent &&
        isworkflowenabled.isEnableReplyApprovalWorkFlow &&
        (isticketagentworkflowenabled ||
          this.currentUser.data.user.agentWorkFlowEnabled)
      ) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message:
              this.translate.instant('Direct-close-approval'),
          },
        });
        return;
      }
  
      const directCloseFlag = localStorage.getItem('directCloseFlag')
      if (directCloseFlag == 'true') {
        this.postActionTypeEvent.emit({
          actionType: PostActionEnum.closeTicket,
        });
      }
      else {
        const message = '';
        const dialogData = new AlertDialogModel(
          this.translate.instant('Want-to-close-ticket'),
          message,
          'Yes',
          'No',
          false,
          [
            {
              label: 'Skip this confirmation',
              id: '',
              type: 'checkbox',
              // catMapCheckBox:true,
            },
          ],
        );
        const dialogRef = this._dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });
  
        let checkboxFlag:boolean = false;
        dialogRef.componentInstance.inputEvent.subscribe((data) => {
          checkboxFlag = data;
        });
  
        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult) {
            // const brandInfo = this.filterService.fetchedBrandData.find((obj) => obj.brandID = this.postData?.brandInfo.brandID)
            // if (brandInfo && brandInfo.isTicketDispositionFeatureEnabled ) {
            //   this.ticketDispositionDialog();
            // }else{
            localStorage.setItem('directCloseFlag', `${checkboxFlag}`)
            this.postActionTypeEvent.emit({
              actionType: PostActionEnum.closeTicket,
            });
            // }
            // this.postFootDisable = true;
            // this.ssreLiveWrongKeep();
          } else {
            // this.ssreLiveWrongDelete();
          }
        });
      }
      // this.directCloseAction.emit();
    }
  
    directCloseTicketWithNote(): void {
      this.postActionTypeEvent.emit({
        actionType: PostActionEnum.closeTicket,
        param: { NoteFlag: true },
        isDispositionList: this.ticketDispositionList.length > 0 ? true : false
      });
      // this.directCloseAction.emit();
    }
  

      createNewTicket(): void {
        const performActionObj = this._replyService.BuildReply(
          this.postData,
          ActionStatusEnum.CreateTicket,
          this.createticketnote
        );
    
        const keyObj: CreateAttachMultipleMentionParam = {
          tasks: this._mapLocobuzzService.mapCommunicationLog(performActionObj.Tasks),
          ticketIDs: [this.postData?.ticketInfo.ticketID],
          tagIds: [this.postData?.tagID],
          mentionIDs: [
            this.postData?.brandInfo.brandID +
              '/' +
              this.postData?.channelType +
              '/' +
              this.postData?.contentID,
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
              this._ticketService.setTicketForRefreshSignal.set(true);
              this._ticketService.setLatestTicket = data.newTicketID;
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: this.translate.instant('Ticket-created-successfully'),
                },
              });
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: data?.message ? data.message : this.translate.instant('Some-error-occurred'),
                },
              });
            }
            // this.zone.run(() => {
          });
      }

  clearnote(brandRejection = false): void {
    this.cannedapprovenote = '';
    this.cannedrejectnote = '';
    this.createticketnote = '';
    if (brandRejection) {
      this.checkIfBrandReplyAndReject();
    }
    this.cdr.detectChanges();
  }

  checkIfBrandReplyAndReject(): void {
    const brandList: BrandList[] = this.filterService.fetchedBrandData;
    if (brandList) {
      const currentBrandObj = brandList.filter((obj) => {
        return +obj.brandID === +this.postData?.brandInfo.brandID;
      });
      this.currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;
    }
    if (+this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount) {
      if (this.currentBrand?.isBrandworkFlowEnabled) {
        const payload_update = {
          filters: this.postData?.brandInfo,
          isrefresh: false,
        }
        this._replyService
          .GetUsersWithTicketCount(payload_update)
          .subscribe((data) => {
            // console.log(data);
            this.buildAgentUserList(data);
          });
        // show assigntoList
      }
    }
  }

   buildAgentUserList(csdList: LocoBuzzAgent[]): void {
      let agentCSdList: LocoBuzzAgent[] = csdList;
      if (+this.currentUser?.data?.user?.role === UserRoleEnum.CustomerCare) {
        agentCSdList = csdList.filter((obj) => {
          return obj.userRole === UserRoleEnum.BrandAccount;
        });
      } else if (+this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount) {
        agentCSdList = csdList.filter((obj) => {
          return obj.userRole === UserRoleEnum.CustomerCare;
        });
      } else {
        if (csdList && csdList.length > 0) {
          agentCSdList = csdList.filter((obj) => {
            if (this.currentBrand?.isBrandworkFlowEnabled) {
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

  assignToUser: number;
   customAgentListAsync = new Subject<LocoBuzzAgent[]>();
    customAgentListAsync$ = this.customAgentListAsync.asObservable();
  customerAgentList: LocoBuzzAgent[] = [];
  acknowledgednote?: string = '';
  @ViewChild('clickacknowledgeMenuTrigger')
  clickacknowledgeMenuTrigger: MatMenuTrigger;

  setAssignToUser(agentList): void {
    if (
      this.postData?.ticketInfo.escalatedTo > 0 ||
      this.postData?.ticketInfo.escalatedToCSDTeam > 0
    ) {
      let idtoattch = 0;

      if (this.postData?.ticketInfo.escalatedTo > 0) {
        idtoattch = this.postData?.ticketInfo.escalatedTo;
      } else {
        idtoattch = this.postData?.ticketInfo.escalatedToCSDTeam;
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

    addCampaign():void
    {
      const dialogRef = this._dialog.open(TagMentionCampaignComponent,{
        width:'65vw',
        data:this.postData
      })
  
    }

     markInfluencer(): void {
        this._postDetailService.postObj = this.postData;
        this._dialog.open(PostMarkinfluencerComponent, {
          autoFocus: false,
          width: '650px',
        });
      }

  AcknowledgeTicket(): void {
    const performActionObj = this._replyService.BuildReply(
      this.postData,
      ActionStatusEnum.Acknowledge,
      this.acknowledgednote,
      this.postData?.ticketInfo.ticketID
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
        this.filterService.currentBrandSourceSignal.set(true);
        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        this._ticketService.acknowledgeSucessObs.next({ tagID: this.postData?.tagID, guid: this.postDetailTab?.guid })
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Ticket-Acknowledged-successfully'),
          },
        });
        this.cdr.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this.translate.instant('Some-error-occurred'),
          },
        });
      }
    });
  }

  acknowlegeCall(): void {
    if (this.postData?.ticketInfo.ticketID) {
      this.clickacknowledgeMenuTrigger.openMenu();
      this.acknowledgednote = ''
    }
  }

   attachTicket(): void {
      // this.postActionTypeEvent.emit({ actionType: PostActionEnum.attachTickets});
      if (this.postData?.replyInitiated) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Previous-request-pending'),
          },
        });
        return;
      }
  
      this._postDetailService.postObj = this.postData;
  
      const brandObj = {
        BrandName: this.postData.brandInfo.brandName,
        BrandId: this.postData?.brandInfo.brandID,
      };
  
      const keyObj = {
        BrandInfo: brandObj,
        AuthorId: this.postData?.author.socialId,
        ChannelGroup: this.postData?.channelGroup,
      };
  
       this._ticketService.getAuthorTickets(keyObj).subscribe((data) => {
        if (data.success) {
          const ticketlist = data.data.find((obj) => Number(obj.ticketId) !== Number(this.postData?.ticketInfo.ticketID));
          if (ticketlist) {
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
                message: this.translate.instant('No-Tickets-to-attach'),
              },
            });
          }
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Some-error-occurred'),
            },
          });
        }
      });
    }

      translateText(): void {
        this.postActionTypeEvent.emit({ actionType: PostActionEnum.translateText });
      }

  sendPostEmail(): void {
    // this._ticketService.closeAlreadyOpenReplyPopup.next(this.postData);
    this._ticketService.closeAlreadyOpenReplyPopupSignal.set(this.postData);
    this.postActionTypeEvent.emit({ actionType: PostActionEnum.sendPostEmail });
  }

  downloadTemplate(): void {
      const keyObj = {
        brandInfo: this.postData?.brandInfo,
        ticketId: this.postData?.ticketInfo.ticketID,
        to: 1,
        from: 10,
        authorId: this.postData?.author.socialId,
        channel: this.postData?.channelGroup,
        TagId: this.postData?.tagID,
      };
  
      let emailTemplate = '';
  
       this._replyService.getTicketHtmlForEmail(keyObj).subscribe(
        (data) => {
          if (data) {
            const replaceText = `<a href="${this.doucument.baseURI + 'login'}"`;
            emailTemplate = String(data.data).replace(
              '<a href="https://social.locobuzz.com/"',
              replaceText
            );
            if (emailTemplate && emailTemplate != '') {
              var blob = new Blob([emailTemplate], { type: 'text/html' });
              var url = window.URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.href = url;
              //FileName
              a.download = 'EmailTrail_TickectID_' + this.postData?.ticketID;
              a.click();
            }
          }
          // alert('calling done');
        },
        (err) => {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Something-went-wrong'),
            },
          });
        }
      );
    }

  deleteFromLocobuzz(): void {
    const message = '';
    const dialogData = new AlertDialogModel(
      this.translate.instant('delete-post-from-locobuzz'),
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
      this.translate.instant('Want-to-delete-post-from-social-media'),
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
          actionType: PostActionEnum.deleteFromSocial,
        });
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
  }

  deleteFromSocialAndTool() {
    const message = '';
    const dialogData = new AlertDialogModel(
      this.translate.instant('Delete-Post-From-Social-And-Locobuzz'),
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
          actionType: PostActionEnum.deleteFromBoth,
        });
      } else {
        // this.ssreLiveWrongDelete();
      }
    });
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
              message: this.translate.instant('Reply-Approval-Workflow-Enabled'),
            },
          });
          this.ticketHistoryData.isTicketAgentWorkFlowEnabled = false;
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Reply-Approval-Workflow-Disabled'),
            },
          });
          this.ticketHistoryData.isTicketAgentWorkFlowEnabled = true;
        }
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Error-Occured'),
          },
        });
      }
    });
  }

    CannedResponse(type: number): void {
      this._postDetailService.notetype = type; // 1 - approve // 2 - reject
      this._dialog.open(CannedResponseComponent, {
        autoFocus: false,
        width: '50vw',
        //data: this.postData,
        data: { mention: this.postData },
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
        this.filterService.currentBrandSourceSignal.set(true);

        this._bottomSheet.dismiss();
        // this._ticketService.ticketStatusChange.next(true);
        this._ticketService.ticketStatusChangeSignal.set(true);
        /* this._ticketService.ticketWorkFlowObs.next(
          this.postData?.ticketInfo.ticketID
        ); */
        this._ticketService.ticketWorkFlowObsSignal.set(
          this.postData?.ticketInfo.ticketID
        );
        this.cannedapprovenote = '';
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Ticket-Approved-Successfully'),
          },
        });
        this.cdr.detectChanges();
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: data?.message ? data?.message : this.translate.instant('Some-error-occurred'),
          },
        });
      }
    });
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
        +this.currentUser?.data?.user?.role === UserRoleEnum.BrandAccount
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
          this.filterService.currentBrandSourceSignal.set(true);
  
          this._bottomSheet.dismiss();
          // this._ticketService.ticketStatusChange.next(true);
          this._ticketService.ticketStatusChangeSignal.set(true);
          /* this._ticketService.ticketWorkFlowObs.next(
            this.postData?.ticketInfo.ticketID
          ); */
          this._ticketService.ticketWorkFlowObsSignal.set(
            this.postData?.ticketInfo.ticketID
          );
          this.cannedrejectnote = '';
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Ticket-Rejected-Successfully'),
            },
          });
          this.cdr.detectChanges();
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: data?.message ? data?.message : this.translate.instant('Some-error-occurred'),
            },
          });
        }
      });
    }

  checkInternalEmail(fromEmail: string, toMailList: string[]): boolean {
    if (!fromEmail || !toMailList) return false;

    const getDomain = (email: string) => email.trim().split('@')[1]?.toLowerCase();

    const fromDomain = getDomain(fromEmail);
    if (!fromDomain) return false;
    return toMailList.every(email => getDomain(email) === fromDomain);
  }

  cleanEmail(rawEmail: string): string {
    // Use a regular expression to extract the email part
    const emailRegex = /<([^>]+)>/;
    const match = rawEmail.match(emailRegex);

    // If there's a match, return the email address; otherwise, return the original string
    return match ? match[1] : rawEmail;
  }


  onClickNotes():void{
    if (this.noteMediaCount.showDownload)
    {
    setTimeout(() => {
      if (this.attachmentNoteContainer && this.attachmentNoteRef) {
        this.checkEmailAttachmentNoteWidth()
      }
    }, 300);
  }
  }


  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  
}

