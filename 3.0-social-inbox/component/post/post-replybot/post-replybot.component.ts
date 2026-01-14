import { ChangeDetectorRef, Component, NgZone, OnInit, SimpleChange, Input, Output, EventEmitter, OnDestroy, effect, ElementRef, ViewChild, ViewChildren, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChannelType } from 'app/core/enums/ChannelType';
import { AuthUser } from 'app/core/interfaces/User';
import { AccountService } from 'app/core/services/account.service';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import moment from 'moment';
import { debounceTime, filter, take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { MediaGalleryComponent } from '../../media-gallery/media-gallery.component';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { BehaviorSubject, Subject } from 'rxjs';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { ActionStatusEnum } from 'app/core/enums/ActionStatus';
import { CannedResponseComponent } from '../../canned-response/canned-response.component';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { SignatureParam } from 'app/core/models/viewmodel/ForwardEmailRequestParameters';
import { TextAreaCount, Replylinks } from 'app/core/models/dbmodel/TicketReplyDTO';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from 'app/shared/components';
import { notificationType } from 'app/core/enums/notificationType';
import { AiFeedbackPageComponent } from 'app/accounts/component/ai-feedback-page/ai-feedback-page.component';
import { AiFeatureService } from 'app/accounts/services/ai-feature.service';
import { AIFeatureStyle } from 'app/core/interfaces/AIFeatureInterface';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { WorkflowService } from 'app/accounts/services/workflow.service';
import { ProfileService } from 'app/accounts/services/profile.service';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { VideoDialogComponent } from '../../video-dialog/video-dialog.component';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-post-replybot',
    templateUrl: './post-replybot.component.html',
    styleUrls: ['./post-replybot.component.scss'],
    standalone: false
})
export class PostReplybotComponent implements OnInit,AfterViewInit,OnDestroy {

  currentUser: AuthUser;
  subs = new SubSink();
  pageData: any = {
    reply: {
      value: {},
      options: [],
    },
    handle: {
      value: {},
      options: [],
    },
    emails: {
      to: {
        value: [],
      },
      cc: {
        value: [],
      },
      bcc: {
        value: [],
      },
      suggestion: [],
      groupSuggestion: [],
      replyText: '',
      showPrevoiusMail: true,
      subject:null,
      isSameThred:false
    },
    replyCheckbox: [],
    baseMention: {},
    postDetailTab: {},
    selectedMedia: [],
    rephraseOptions: {},
    showLockStrip: false
  };
  duplicate_suggestion: any[]=[];
  duplicate_groupSuggestion: any[]=[];
  config = {
    format_tags: 'p;h1;h2;h3;h4;h5;h6;pre',
    toolbar: [
      // ['Table'],
      // ['Format'],
      ['Font'],
      ['RemoveFormat'],
      ['Bold'],
      ['Italic'],
      ['Underline'],
      ['Link'],
      ['BulletedList'],
      ['NumberedList'],
      // ['Indent'],
      // ['Outdent'],
      ['BlockQuote'],
      ['Undo'],
      ['Redo'],
      ['TextColor'],
      ['BGColor'],
      ['JustifyLeft'],
      ['JustifyCenter'],
      ['JustifyRight'],
      ['JustifyBlock'],
    ],
    allowedContent: true,
    emailCCEmails: true,
    extraPlugins: 'button,panelbutton,panel,floatpanel,colorbutton,colordialog,menu,font,justify, clipboard, pastefromword',
    removeButtons: 'Subscript,Superscript',
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'en',
    autoParagraph: false,
    font_names: 'Arial/Arial, Helvetica, sans-serif;' +
      'Courier New/Courier New, Courier, monospace;' +
      'Georgia/Georgia, serif;' +
      'Times New Roman/Times New Roman, Times, serif;' +
      'Verdana/Verdana, Geneva, sans-serif;' +
      'Tahoma/Tahoma, Geneva, sans-serif;' +
      'Trebuchet MS/Trebuchet MS, Helvetica, sans-serif;' +
      'Comic Sans MS/Comic Sans MS, cursive, sans-serif;' +
      'Impact/Impact, Charcoal, sans-serif;' +
      'Lucida Sans Unicode/Lucida Sans Unicode, Lucida Grande, sans-serif;' +
      'Palatino Linotype/Palatino Linotype, Book Antiqua, Palatino, serif;' +
      'Segoe UI/Segoe UI, Tahoma, Geneva, sans-serif;' +
      'Roboto/Roboto, sans-serif;' +
      'Open Sans/Open Sans, sans-serif;' +
      'Lora/Lora, serif;' +
      'Montserrat/Montserrat, sans-serif;' +
      'Poppins/Poppins, sans-serif;' +
      'Noto Sans/Noto Sans, sans-serif;' +
      'Source Sans Pro/Source Sans Pro, sans-serif;' +
      'Droid Sans/Droid Sans, sans-serif;' +
      'Raleway/Raleway, sans-serif;',
    fontSize_sizes: '8/8px;10/10px;12/12px;14/14px;16/16px;18/18px;' +
      '20/20px;22/22px;24/24px;28/28px;32/32px;' +
      '36/36px;40/40px;48/48px;60/60px;72/72px;',
    toolbarLocation: 'bottom',
    enterMode: 2,
  };

  mediaSelectedAsync = new BehaviorSubject<UgcMention[]>([]);
  mediaSelectedAsync$ = this.mediaSelectedAsync.asObservable();
  emailSignatureParams: SignatureParam = {};
  textAreaCount: TextAreaCount[] = [];
  cautionText: string = '';
  loadAiFeature: boolean = false;
  sfdcTicketViewUI:boolean = false;

  /* Enums */
  channelType = ChannelType;
  mediaTypeEnum = MediaEnum;
  channelGroup = ChannelGroup;
  loaderTypeEnum = loaderTypeEnum;
  ActionStatusEnum = ActionStatusEnum;

  /* Rephres */
  isOpenRephrasePopup: boolean = false;
  undoArr: any[] = [];
  redoArr: any[] = [];
  rephraseText: string = '';
  rephraseLoader: boolean = false;
  rephraseLoaderForTextarea: boolean = false;
  isRephraseToolbar: boolean = false;
  rephraseOptions: any = {
    isGlobal: false,
    isAISuggestion: false,
    isAIAutopPopulate: true,
    isRephrase: false,
    isTranslate: false,
    isShowPrompt: false,
    rephraseActions: ''
  };

  /* Ai Suggestion */
  isAICaution: boolean = false;
  aiMessageFeedback: number = 2;
  isAIAutoResponse: boolean = false;
  aiSuggestionLoader: boolean = false;
  showAICreditExpired: boolean = false;
  showAISmartSuggestion: boolean = false;
  showAICreditExpiredAlert: boolean = false;
  AIFeatureStyleObj: AIFeatureStyle = {
    rephraseIcon: '',
    suggestIcon: '',
    suggestionBorder: '',
    rephraseTootip: '',
    suggestTootip: ''
  };
  selectedChips: { [key: string]: string[] } = {};
  separatorKeysCodes: number[] = [ENTER, COMMA];
  isCcEmailShow:boolean = false;
  isBccEmailShow:boolean = false;
  ctrlKeyPressed: boolean =false;
  currentType: string = '';
  draggedEmail: string[] = [];
  inputRecvd: { [key: string]: boolean } = {};
  maximize: boolean = false;
  hideMaximizeView: boolean = false;
  formAttributes: string[] = []
  locationProfileAttributes: string[] = []
  emaillocationAttributes: any[] = []
  tempEmaillocationAttributes: any[] = []
  tempAgentList:string[]=[]
  private editorInstance: any;
  @Input() templateFlag:boolean =false
  @Input() emailTemplateData:any;
  @Input() preDefinedSubject = '';
  @Input() preDefinedBody = '';
  @Input() locationDetails: any;
  @Input() agentEmailIds:string[]=[]
  @Input() sendAlert:boolean = false
  @Input() questionList:[]=[]
  @Input() formSubmissionFlag:boolean = false
  defaultLocationProfiles=[]
  customLocationProfiles = []

  @Output() saveTemplate = new EventEmitter<{}>();
  emailMaxLength: number;
  tempAllGroupEmailList: any[] = [];
  outsideEmailFlag: boolean = false;
  outsideEmails: string[] = []
  removable:boolean = true
  remainingEmailTooltip: string = '';
  ticketHistoryFlag:boolean = false;
  selectedAttachmentList: any[];
    @ViewChild('attachmentContainer') attachmentContainer: ElementRef
      @ViewChildren('attachmentRef') attachmentRef: ElementRef[];
  showMoreAttachment: boolean;
  maximumAttachmentLength: number;
  remainingAttachmentCount: number;
  ticketAttributes: string[] = [];
  authorAttiributes: string[] = [];
  mentionAttributes: string[] = [];
  defaultLayout: boolean = false;
  emailTemplatesList: any[] = [];

  constructor(private _ticketService: TicketsService,
    private replyService: ReplyService,
    private _filterService: FilterService,
    private accountService: AccountService,
    private _chatBotService: ChatBotService,
    private _aiFeatureService: AiFeatureService,
    private _postDetailService: PostDetailService,
    private _navigationService: NavigationService,
    private mediaGalleryService: MediagalleryService,
    private _ngZone: NgZone,
    private dialog: MatDialog,
    private _snackBar: MatSnackBar,
    public cdr: ChangeDetectorRef,
    private workflowservice: WorkflowService,
    private profileService:ProfileService,
    private commonService: CommonService,
    private translate: TranslateService
  ) { 
    let onLoadCannedResponse = true;
     effect(() => {
          const value = this.replyService.selectedCannedResponseSignal();
       if (!onLoadCannedResponse && value) {
            this.selectedCannedResponseSignalChanges(value)
          } else {
            onLoadCannedResponse = false;
          }
        }, { allowSignalWrites: true });
  }



  ngOnInit(): void {
    let sfdcTicketView = localStorage.getItem('sfdcTicketView');
    if (sfdcTicketView) {
      this.sfdcTicketViewUI = true;
    }

    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
        }
      })
    )
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));

    this.subs.add(
      this._ticketService.emailPopDataObs.subscribe((res) => {
        if (res.status) {
          console.log("emailPopDataObs", res, this.pageData);
          /* this._ticketService.emailPopDataObs.next({status:false, data:null}); */
          this.pageData = { ...res?.data };
          if (!this.pageData?.onlySendMail && !this.pageData?.onlyEscalation) {
            this.getSuggestedResponse();
          }

          if(this.pageData?.isForward){
            if (this?.pageData.emails?.subject) this.pageData.ticketHistoryData.title = this?.pageData.emails?.subject 
          }
          
          if(this.pageData?.emails?.cc?.value?.length > 0){
            this.isCcEmailShow = true;
          }
          
          if (this.pageData?.emails?.bcc?.value?.length > 0) {
            this.isBccEmailShow = true
          }
          this.duplicate_suggestion = this.pageData?.emails?.suggestion;
          this.duplicate_groupSuggestion = this.pageData?.emails?.groupSuggestion;
          this.mediaSelectedAsync.next(this?.pageData?.selectedMedia);
          this.createAttachmentMediaPillView()
          this.tempAllGroupEmailList = this.pageData ?.tempAllGroupEmailList
          this.ticketHistoryFlag = this.pageData?.pageType == PostsType.TicketHistory?true:false
        }
      })
    )

    this.subs.add(
      this.replyService.selectedMedia
        .pipe(filter((res) => res.section === SectionEnum.Ticket))
        .subscribe((ugcarray) => {
          if (ugcarray?.media && ugcarray?.media.length > 0) {
            let tempPostMedia = [];
            if (this.pageData?.selectedMedia.some((item) => item?.isPostMedia)) {
              tempPostMedia = this.pageData?.selectedMedia.filter((item) => item?.isPostMedia)
            }
            // this.mediaSelectedAsync.next(ugcarray.media);
            const allMedia = this.pageData?.selectedMedia && this.pageData?.selectedMedia.length ? JSON.parse(JSON.stringify(this.pageData?.selectedMedia)) : [];
            let forwardEmailMedia = allMedia && allMedia.length ? allMedia.filter((res: any) => res.forwardEmail) : [];
            this.pageData.selectedMedia = [...tempPostMedia, ...ugcarray?.media];
            if (forwardEmailMedia && forwardEmailMedia.length) {
              this.pageData?.selectedMedia.unshift(...forwardEmailMedia);
            }
            this.mediaSelectedAsync.next(this?.pageData?.selectedMedia);
            this.createAttachmentMediaPillView()
            this.maximumAttachmentLength = this.pageData?.selectedMedia?.length;
            setTimeout(() => {
              this.checkEmailAttachmentWidth()
            }, 300);
          }
        })
    );

    const valueCannedResponseSignal = this.replyService.selectedCannedResponseSignal();
    if (valueCannedResponseSignal) {
      this.selectedCannedResponseSignalChanges(valueCannedResponseSignal)
    }

    // this.subs.add(
    //   this.replyService.selectedCannedResponse.subscribe((obj) => {
    //     if (obj?.openedFrom === 'emailPopup' && obj?.text?.trim()?.length > 0) {
    //       this.pageData.emails.replyText = this.pageData?.emails?.replyText?.concat(obj.text);
    //     }
    //   })
    // )

    this.subs.add(
      this.replyService.undoRedoRephrase.subscribe((res) => {
        if (res && res.value) {
          if (res.value == 'undo') {
            this.undoRephrase(res.isNotFromInsertPopover);
          } else if (res.value == 'redo') {
            this.redoRephrase(res.isNotFromInsertPopover);
          }
        }
      })
    );

    this.subs.add(
      this.replyService.applyRephrase.subscribe((res) => {
        if (res && ('isFromEmailPopUp' in res)) {
          this.applyRephraseData(res);
        }
      })
    );

    this.subs.add(
      this.workflowservice.saveEmailTemplate.subscribe((res)=>{
        if(res)
        {
          this.saveOnlyEmailDetails()
        }
      })
    )

    if (this.templateFlag)
    {
    if (this.emailTemplateData?.EmailDetails && Object.keys(this.emailTemplateData?.EmailDetails).length > 0) {
       
      this.pageData.emails.to.value = this.emailTemplateData?.EmailDetails?.SendToEmailIDs;
      this.pageData.emails.cc.value = this.emailTemplateData?.EmailDetails?.CC;
      this.pageData.emails.bcc.value = this.emailTemplateData?.EmailDetails?.BCC;
      this.pageData.emails.subject = this.emailTemplateData?.EmailDetails?.Subject;
      this.pageData.emails.replyText = this.emailTemplateData?.EmailDetails?.Body;  
      
      if (this.pageData.emails.cc.value.length > 0) {
        this.isCcEmailShow = true;
      }
      if (this.pageData.emails.bcc.value.length > 0) {
        this.isBccEmailShow = true
      }
    }else
    {
      this.pageData.emails.subject =this.preDefinedSubject
      this.pageData.emails.replyText =this.preDefinedBody
    }
      this.formAttributes = this.locationDetails?.formAttributes || []
      this.ticketAttributes = this.locationDetails?.ticketAttributes || []
      this.mentionAttributes = this.locationDetails?.mentioAttributes || []
      this.authorAttiributes = this.locationDetails?.authorAttributes || []
      this.mergeLocationProfileAttributes(this.locationDetails)
      this.tempAgentList = this.agentEmailIds
      this.mentionAttributes = this.locationDetails?.mentioAttributes || []
      this.authorAttiributes = this.locationDetails?.authorAttributes || []
      this.getEmailTemplate();
  }

      this.emailMaxLength = 1
    this.checkEmailIDOutsideOrganizationOrNot();
}

  onChange(type: string, item: any) {
    if (type == 'replyType') {
      this.pageData.reply.value = item;
      if (item.id != ActionStatusEnum?.ReplyAndClose) {
        for (const rcheck of this.pageData?.replyCheckbox) {
          if (rcheck.name == 'Send Feedback' && rcheck.checked) {
            rcheck.checked = false;
          }
        }
      }
      this.replyTypeChange(item.id)
    }

    if (type == 'replyHandle'){
      this.pageData.handle.value = item.socialId
    }
  }

  selectedCannedResponseSignalChanges(obj){
    if (obj && obj?.openedFrom === 'emailPopup' && obj?.text?.trim()?.length > 0) {
      this.pageData.emails.replyText = this.pageData?.emails?.replyText?.concat(obj.text);
      if (obj?.mediaAttachments.length > 0) {
        const mediaList = [...this.pageData.selectedMedia, ...obj?.mediaAttachments];
        this.pageData.selectedMedia = mediaList.map((item, index) => {
          return {
            mediaType: item?.mediaType,
            displayFileName: item?.name || item?.displayFileName,
            mediaPath: item?.url || item?.mediaPath,
            thumbUrl: item?.thumbUrl,
            mediaID: parseInt(`${item?.mediaID || 0}`),
            isCannedMedia: true
          };
        })
        this.mediaGalleryService.selectedMedia = this.pageData?.selectedMedia;
        this.mediaSelectedAsync.next(this.pageData.selectedMedia);
        this.createAttachmentMediaPillView();
        this.cdr.detectChanges();
      }
    }
  }

  togglePrevMail(): void {
    const storedReceivedText: string = `On ${moment.utc(this.pageData?.baseMention?.mentionTime).local().format('MMMM Do YYYY, h:mm:ss A')}, 
    ${this.pageData?.baseMention?.author?.socialId} wrote: `.concat(this.pageData?.baseMention.emailContent);
    this.pageData.emails.replyText = this.pageData.emails.replyText.concat(`<br>${storedReceivedText}`);
    this.pageData.emails.showPrevoiusMail = false;
  }

  getSuggestedResponse() {
    const aiobj = {
      user_id: this.currentUser?.data?.user?.userId,
      brand_id: Number(this.pageData.baseMention?.brandInfo?.brandID),
    }
    this.subs.add(
      this._aiFeatureService.getSuggestedRresponse(aiobj).subscribe((res) => {
        if (res?.success && res?.data?.length > 0) {
          const aiSuggestedRresponse = res.data[0];
          let showAIPrompt = true;
          if (aiSuggestedRresponse && aiSuggestedRresponse?.IsCustomFeature) {
            showAIPrompt = (this.currentUser.data.user.role === UserRoleEnum.SupervisorAgent || this.currentUser.data.user.role === UserRoleEnum.LocationManager) ? true : false;
          } else {
            showAIPrompt = true;
          }
          const option = {
            isGlobal: aiSuggestedRresponse?.IsAISuggestedFeatureEnabled,
            isAISuggestion: aiSuggestedRresponse?.IsSuggestedResponseEnabled,
            isRephrase: aiSuggestedRresponse?.IsRephraseFeatureEnabled,
            isTranslate: aiSuggestedRresponse?.IsTranslateFeatureEnabled,
            isShowPrompt: showAIPrompt,
            rephraseActions: JSON.parse(aiSuggestedRresponse?.RephraseActionJson),
            isAIAutopopulate: aiSuggestedRresponse?.auto_reply ? true : false
          }
          this.rephraseOptions = option;
          if (!option.isTranslate && !option.isRephrase) {
            this.AIFeatureStyleObj = {
              rephraseIcon: 'assets/images/media/rephrase-inactive.svg',
              suggestIcon: '',
              suggestionBorder: '',
              rephraseTootip: this.translate.instant('Rephrase-feature-disabled'),
            }
            this.isRephraseToolbar = false;
          } else {
            this.isRephraseToolbar = true;
          }

          if (!option?.isAISuggestion) {
            this.AIFeatureStyleObj.suggestIcon = 'assets/images/media/smart_suggestion-inactive.svg'
            this.AIFeatureStyleObj.suggestionBorder = '1px solid #C3CBD7'
            this.AIFeatureStyleObj.suggestTootip = this.translate.instant('AI-Smart-Suggestion-feature-is-currently-disabled');
          }

          if (this.rephraseOptions.isGlobal) {
            this.loadAiFeature = true;
          } else {
            this.AIFeatureStyleObj = {
              rephraseIcon: 'assets/images/media/rephrase-premium.svg',
              suggestIcon: 'assets/images/media/smart_suggestion-premium.svg',
              suggestionBorder: '1px solid #DEAA0C',
              rephraseTootip: this.translate.instant('AI-Rephrase-feature-premium'),
              suggestTootip: this.translate.instant('AI-Smart-Suggestion-feature-premium')
            }
            this.loadAiFeature = false;
          }
          if (this.loadAiFeature && (this.isRephraseToolbar || this.rephraseOptions?.isAISuggestion)) {
            this.getAICreditStatus();
          }

          this._aiFeatureService.ticketSummarization.next({
            IsTicketSummarizationEnabled: aiSuggestedRresponse?.IsTicketSummarizationEnabled, IsAISuggestedFeatureEnabled: aiSuggestedRresponse?.IsTicketSummarizationEnabled
          });
        }
      })
    );
  }

  /* Rephrase Methods */
  openRephrasePopup(index) {
    this.isOpenRephrasePopup = this._postDetailService.openRephrasePopup;
    this.isOpenRephrasePopup = !this.isOpenRephrasePopup;
    const element = document.getElementById('rephrase_emailpop_' + index);
    const rect = element.getBoundingClientRect()
    this._postDetailService.openRephrasePopup = this.isOpenRephrasePopup;
    if (this.sfdcTicketViewUI) {
      /* this.replyService.openRephraseSFDC.next({
          openPopup: this.isOpenRephrasePopup,
          position: rect,
          rephraseOptions: this.rephraseOptions,
          tab: this._navigationService.currentSelectedTab
        }) */
      this.replyService.openRephraseSFDCSignal.set({
          openPopup: this.isOpenRephrasePopup,
          position: rect,
          rephraseOptions: this.rephraseOptions,
          tab: this._navigationService.currentSelectedTab
        })
    } 
    else {
      /* this.replyService.openRephrase.next({
          openPopup: this.isOpenRephrasePopup,
          position: rect,
          rephraseOptions: this.rephraseOptions,
          tab: this._navigationService.currentSelectedTab
        }) */
      this.replyService.openRephraseSignal.set({
          openPopup: this.isOpenRephrasePopup,
          position: rect,
          rephraseOptions: this.rephraseOptions,
          tab: this._navigationService.currentSelectedTab
        })
    }
  }

  undoRephrase(isNotFromInsertPopover: boolean) {
    if (this.undoArr.length > 1) {
      const obj = this.undoArr.pop();
      this.rephraseText = this.undoArr[this.undoArr.length - 1].text;
      // this.selectedLanguageTo = this.undoArr[this.undoArr.length - 1].language;
      const isEmail = this.pageData?.baseMention.channelGroup == ChannelGroup.Email ? true : false;
      if (isEmail) {
        this.pageData.emails.replyText = this.rephraseText
      } 
      else {
        if (isNotFromInsertPopover) {
          this.replaceInputFromRephraseData();
        }
      }
      if (this.redoArr.length >= 3) {
        this.redoArr.splice(0, 1);
      }
      this.redoArr.push({ text: obj.text, language: obj.language });
      this.replyService.redoArr = this.redoArr
      this.replyService.undoArr = this.undoArr
      this.replyService.undoredoChanged.next({ status: true, language: this.undoArr[this.undoArr.length - 1].language });
    }
  }

  redoRephrase(isNotFromInsertPopover: boolean) {
    const obj = this.redoArr.pop();
    this.rephraseText = obj.text
    // this.selectedLanguageTo = obj.language
    const isEmail = this.pageData?.baseMention.channelGroup == ChannelGroup.Email ? true : false;
    if (isEmail) {
      this.pageData.emails.replyText = this.rephraseText
    } else {
      if (isNotFromInsertPopover) {
        this.replaceInputFromRephraseData();
      }
    }
    this.undoArr.push({ text: obj.text, language: obj.language });
    this.replyService.redoArr = this.redoArr
    this.replyService.undoArr = this.undoArr
    this.replyService.undoredoChanged.next({ status: true, language: obj.language });
  }

  applyRephraseData(event) {
    let arr = []
    let replyText = ''

    replyText = this.pageData.emails.replyText;
    if (event.isNotFromInsertPopover) {
      this.pageData.emails.replyText = '';
    }

    if (event?.isNotFromInsertPopover == false) {
      replyText = this.rephraseText;
    }

    if (this.undoArr.length == 0 && replyText != '' && replyText) {
      this.undoArr.push({ text: replyText, language: '' });
      this.replyService.undoredoChanged.next({ status: true, language: event.language });
    }

    if (event.isNotFromInsertPopover) {
      this.rephraseLoaderForTextarea = true;
    }
    else {
      this.rephraseLoader = true;
    }

    this.replyService.rephraseLoader.next(true);
    switch (event.settingOption) {
      case 'AISuggestions':
        if (!this.pageData?.showLockStrip) {
          this.getAiSmartSuggestion(true, event);
        }
        break;
      case 'Translate':
        this.getTranslate(true, event, replyText);
        break;
      case 'Rephrase':
        this.getRephrase(true, event, replyText);
        break;
      case 'Prompt':
        this.getRephrase(true, event, replyText);
        break;
    }
    this.cdr.detectChanges();
  }

  getTranslate(isEmail, event, replyText) {
    let arr = [];
    const obj = {
      language: event.language,
      text: replyText,
      user_id: this.currentUser?.data?.user?.userId,
      tag_id: this.pageData?.baseMention?.tagID,
      brand_name: this.pageData?.baseMention?.brandInfo?.brandName,
      brand_id: Number(this.pageData?.baseMention?.brandInfo?.brandID)
    }
    arr.push(obj);

    this.replyService.translateReply(arr).subscribe(res => {
      if (res?.success && res.data[0].translate) {
        this.rephraseText = res.data[0].translate;
        this.rephraseLoader = false;
        this.rephraseLoaderForTextarea = false;
        this.replyService.rephraseLoader.next(false);

        if (isEmail) {
          if (event.isNotFromInsertPopover) {
            this.pageData.emails.replyText = this.rephraseText;
          }
        } else {
          if (event.isNotFromInsertPopover) {
            this.replaceInputFromRephraseData()
          }
          // this.replaceInputFromRephraseData()
        }
        this.getAICreditStatus(event.isNotFromInsertPopover);
        // this.cdr.detectChanges();
        this.setSelectText(res.success, isEmail)
        if (this.undoArr.length == 3) {
          this.undoArr.splice(0, 1);
        }
        this.undoArr.push({ text: this.rephraseText, language: event.language });
        this.replyService.undoArr = this.undoArr
        this.replyService.undoredoChanged.next({ status: true, language: event.language });
      } else {
        this.onErrorAiApi(isEmail, this.translate.instant('Translate'));
      }
    }, err => {
      this.onErrorAiApi(isEmail, this.translate.instant('Translate'));
    })
  }

  setSelectText(apiSuccess = false, isEmail = false) {
    if (isEmail) {
      let iframe = document.getElementById("ckeditor_emailpop").getElementsByClassName('cke_inner')[0].getElementsByClassName('cke_contents')[0].getElementsByClassName('cke_wysiwyg_frame')[0] as HTMLIFrameElement
      var e = iframe.contentWindow.document.getElementsByTagName('body')[0];
      var r = document.createRange(); r.selectNodeContents(e);
      var s = iframe.contentWindow.document.getSelection();
      s.removeAllRanges();
      s.addRange(r);
    }
  }

  getRephrase(isEmail, event, replyText) {
    let obj = {
      prompt: event.promptText,
      text: replyText,
      language: event.language,
      user_id: this.currentUser?.data?.user?.userId,
      channel_group: this.pageData?.baseMention?.channelGroup,
      channel_type: this.pageData?.baseMention?.channelType,
      tag_id: this.pageData?.baseMention?.tagID,
      brand_id: Number(this.pageData?.baseMention?.brandInfo?.brandID),
      brand_name: this.pageData?.baseMention?.brandInfo?.brandName,
      ticket_id: this.pageData?.baseMention?.ticketID
    };
    if (event.settingOption != 'Prompt') {

      const data = {
        manner: event.messageManner == 'medium' ? 'standard' : event.messageManner,
        tone: event.messageTone
      }
      obj = Object.assign(obj, data);
    }

    this.replyService.rephraseData(obj).subscribe(res => {
      if (res?.success && res?.data?.length > 0 && res.data[0].rephrase) {
        this.rephraseText = res.data[0].rephrase;
        this.rephraseLoader = false;
        this.rephraseLoaderForTextarea = false;
        this.replyService.rephraseLoader.next(false);
        if (isEmail) {
          if (event.isNotFromInsertPopover) {
            this.pageData.emails.replyText = this.rephraseText
          }
        } else {
          if (event.isNotFromInsertPopover) {
            this.replaceInputFromRephraseData()
          }
          // this.replaceInputFromRephraseData()
        }
        this.getAICreditStatus(event.isNotFromInsertPopover);
        // this.cdr.detectChanges();
        this.setSelectText(res.success, isEmail)
        if (this.undoArr.length == 3) {
          this.undoArr.splice(0, 1);
        }
        this.undoArr.push({ text: this.rephraseText, language: event.language });
        this.replyService.undoArr = this.undoArr
        this.replyService.undoredoChanged.next({ status: true, language: event.language });
      } else {
        this.onErrorAiApi(isEmail, this.translate.instant('Rephrase'));
      }
    }, err => {
      this.onErrorAiApi(isEmail, this.translate.instant('Rephrase'));
    })
  }
  /* Rephrase Methods */

  /* Ai Suggestion Methods */
  select(event: Event) {
    event.stopPropagation();
  }

  validate() {
    this.createCustomBackdrop();
  }

  createCustomBackdrop() {
    const clones = document.querySelectorAll('.clone');
    if (clones?.length === 0) {
      const overlayers = document.querySelectorAll('.controlled');
      if (overlayers) {
        overlayers.forEach((element) => {
          const clone = element.cloneNode(true);
          (clone as Element).classList.add('clone');
          clone.addEventListener('click', this.select.bind(this));
          element.parentNode.insertBefore(clone, element.nextSibling);
        });
      }
    }
  }

  removeCloneBackdrop() {
    document.querySelectorAll('.clone').forEach((element) => element.remove());
  }

  openAISmartSuggestion(event) {
    this.isAICaution = false;
    this.showAISmartSuggestion = event.checked;
    this.aiSuggestionLoader = true
    const obj = {
      settingOption: 'AISuggestions'
    }
    this.applyRephraseData(obj)
  }

  getAiSmartSuggestion(isEmail, event) {
    const category = this.pageData?.baseMention.categoryMap?.map((x) => x.name);
    let lastAuthorMsg = ""
    if (this.pageData?.baseMention.channelGroup == ChannelGroup.Email) {
      lastAuthorMsg = this.pageData?.baseMention?.description || this.pageData?.baseMention?.emailContent || this.pageData?.baseMention?.emailContentHtml
    }
    else {
      lastAuthorMsg = this.pageData?.baseMention?.description
    }

    if (lastAuthorMsg) {
      const obj = {
        brand_name: this.pageData?.baseMention?.brandInfo?.brandName,
        brand_id: this.pageData?.baseMention?.brandInfo?.brandID,
        author_id: this.pageData?.baseMention?.author?.socialId,
        author_name: this.pageData?.baseMention?.author?.name,
        channel_group_id: this.pageData?.baseMention?.channelGroup,
        ticket_id: this.pageData?.baseMention?.ticketID,
        ticket_category: category,
        last_author_msg: lastAuthorMsg,
        channel_type: this.pageData?.baseMention?.channelType,
        rating: this.pageData?.baseMention?.rating,
        user_id: this.currentUser?.data?.user?.userId,
        tag_id: this.pageData?.baseMention?.tagID,
        mention_datetime: this.pageData?.baseMention?.mentionTime

      };
      this._chatBotService.getAISmartSuggestions(obj).subscribe((res) => {
        if (res?.success && res?.data && res?.data?.result[0]) {
          const obj = [{
            text: res?.data?.result[0],
            isAICaution: res?.data?.caution,
            caution: res?.data?.caution_text,
            isSelected: false
          }]
          this.rephraseText = res?.data?.result[0];
          this.pageData.baseMention.isSmartSuggestionGenerated = true;
          this.pageData.baseMention.smartSuggestion = obj;
          this.rephraseLoader = false;
          this.rephraseLoaderForTextarea = false;
          this.isAICaution = res?.data?.caution
          this.cautionText = res?.data?.caution_text
          this.replyService.rephraseLoader.next(false);
          if (isEmail) {
            this.rephraseText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
            if (event.isNotFromInsertPopover) {
              this.pageData.emails.replyText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
            }
            // this.emailReplyText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
          }
          else {
            if (event.isNotFromInsertPopover) {
              this.replaceInputFromRephraseData()
            }
            // this.replaceInputFromRephraseData()
          }
          // this.cdr.detectChanges();
          if (this.undoArr.length == 3) {
            this.undoArr.splice(0, 1);
          }

          this.undoArr.push({ text: this.rephraseText, language: '' });
          this.replyService.undoArr = this.undoArr
          this.replyService.undoredoChanged.next({ status: true, language: '' });
          this.aiSuggestionLoader = false
          this.getAICreditStatus(event.isNotFromInsertPopover);
          this.cdr.detectChanges();
        }
        else {
          const error = JSON.parse(res?.data)?.error
          if (error && error?.length > 0) {
            this.rephraseLoader = false;
            this.rephraseLoaderForTextarea = false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: error[0]
              },
            });
          } else {
            this.onErrorAiApi(isEmail, this.translate.instant('generate-ai-smart-suggestion'));
          }
          this.aiSuggestionLoader = false;
          this.cdr.detectChanges()
        }
      }, err => {

        this.onErrorAiApi(isEmail, this.translate.instant('generate-ai-smart-suggestion'))
        this.aiSuggestionLoader = false;
        this.cdr.detectChanges()
      })
    } else {
      this.rephraseLoader = false;
      this.rephraseLoaderForTextarea = false;
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Unable-to-generate-ai-smart-suggestion-No-text-found')
        },
      });
    }
  }

  getAICreditStatus(isNotFromInsertPopover?: boolean) {
    const obj = {
      user_id: this.currentUser?.data?.user?.userId
    }
    this.subs.add(
      this._aiFeatureService.getCreditStatus(obj).subscribe((response) => {
        if (response.success) {
          const data = response.data.result[0]
          this.showAICreditExpired = data.credit_expired;
          this.showAICreditExpiredAlert = data.credit_expired_alert
          if (!this.showAICreditExpired) {
            if (data.credit_expired_alert) {
              if (this.isRephraseToolbar) {
                this.AIFeatureStyleObj.rephraseIcon = 'assets/images/media/rephrase-credit-expired-alert.svg';
                this.AIFeatureStyleObj.rephraseTootip = this.translate.instant('AI-Rephrase-feature-credit-approaching-expiration');
              }
              if (this.rephraseOptions.isAISuggestion) {
                this.AIFeatureStyleObj.suggestIcon = 'assets/images/media/smart_suggestion-expirealert.svg';
                this.AIFeatureStyleObj.suggestionBorder = '1px solid #1C9F00'
                this.AIFeatureStyleObj.suggestTootip = this.translate.instant('AI-Smart-Suggestion-credit-approaching-expiration');
              }
            } else {
              if (this.isRephraseToolbar) {
                this.AIFeatureStyleObj.rephraseIcon = 'assets/images/media/rephrase-active.svg';
                this.AIFeatureStyleObj.rephraseTootip = this.translate.instant('Rephrase');
              }
              if (this.rephraseOptions.isAISuggestion) {
                this.AIFeatureStyleObj.suggestIcon = 'assets/images/media/smart_suggestion-active.svg';
                this.AIFeatureStyleObj.suggestionBorder = '1px solid #1C9F00'
                this.AIFeatureStyleObj.suggestTootip = this.translate.instant('Generate-response');
              }
            }
            if (this.rephraseOptions.isAIAutopopulate && !this.pageData.autoRenderAi) {
              if (this.pageData?.baseMention?.isSmartSuggestionGenerated) {
                this.rephraseText = isNotFromInsertPopover == false ? this.rephraseText : this.pageData?.baseMention?.smartSuggestion[0]?.text;
                this.isAICaution = this.pageData?.baseMention?.smartSuggestion[0].isAICaution
                this.cautionText = this.pageData?.baseMention?.smartSuggestion[0]?.caution
                if (this.pageData?.baseMention?.channelGroup === ChannelGroup.Email) {
                  this.rephraseText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
                  if (isNotFromInsertPopover) {
                    this.pageData.emails.replyText = this.rephraseText.replace(/(?:\r\n|\r|\n)/g, '<br>');
                  }
                }
                // this.replaceInputFromRephraseData()
              } else {
                const obj = {
                  settingOption: 'AISuggestions'
                }
                this.applyRephraseData(obj);
                this.isAIAutoResponse = true;
                if (!this.pageData.userPostView) {
                  this._ngZone.run(() => {
                    const menu = document.querySelector('.aiSmartSuggesionMenu');
                    if (menu) {
                      menu.dispatchEvent(new Event('click'));
                    }
                  });
                }
              }
            }
          } else {
            if (this.isRephraseToolbar) {
              this.AIFeatureStyleObj.rephraseIcon = 'assets/images/media/rephrase-credit-expired.svg';
              this.AIFeatureStyleObj.rephraseTootip = this.translate.instant('AI-Rephrase-feature-credit-expired');
            }
            if (this.rephraseOptions.isAISuggestion) {
              this.AIFeatureStyleObj.suggestIcon = 'assets/images/media/smart_suggestion-expire.svg';
              this.AIFeatureStyleObj.suggestionBorder = '1px solid #1C9F00'
              this.AIFeatureStyleObj.suggestTootip = this.translate.instant('AI-Smart-Suggestion-feature-credit-expired');
            }
          }
          this._aiFeatureService.ticketSummarizationCreditDetails.next(data);
        }
        this.cdr.detectChanges();
      })
    );
  }

  onErrorAiApi(isEmail, type) {
    this.rephraseLoader = false;
    this.rephraseLoaderForTextarea = false;
    this.replyService.rephraseLoader.next(false);
    if (this.undoArr.length > 0) {
      this.rephraseText = this.undoArr[this.undoArr.length - 1].text;
      if (isEmail) {
        this.pageData.emails.replyText = this.rephraseText
      } else {
        // this.replaceInputFromRephraseData();
      }
    }
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Error,
        message: this.translate.instant('Unable-to-generic-text-Please-try-again', { type }),
      },
    });
    this.cdr.detectChanges();
  }

  aiResponseInsert() {
    this.pageData.emails.replyText = this.rephraseText;
    this.replaceInputFromRephraseData();
    this.trackAIResponse(true);
  }

  replaceInputFromRephraseData() {
    const inputevent = {
      target: {
        value: this.rephraseText
      }
    }
    this.textAreaCount = [];
    let textareaObj = new TextAreaCount();
    const strUserSignature = this.emailSignatureParams.userSignatureSymbol + ' ' + this.emailSignatureParams.userSignature;
    if (this.emailSignatureParams.isAppendNewLineForSignature) {
      this.rephraseText = this.emailSignatureParams.userSignatureSymbol && this.emailSignatureParams.userSignature ? this.rephraseText + ' ' + strUserSignature.trim() : this.rephraseText;
    }
    else {
      this.rephraseText = this.emailSignatureParams.userSignatureSymbol && this.emailSignatureParams.userSignature ? strUserSignature.trim() + ' ' + this.rephraseText : this.rephraseText;
    }
    textareaObj.text = this.rephraseText;
    this.textAreaCount.push(textareaObj);
    this.cdr.detectChanges();
  }

  trackAIResponse(isInsert?: boolean) {
    // this.aiMessageFeedback = 1;
    const category = this.pageData.baseMention.categoryMap?.map((x) => x.name);
    let lastAuthorMsg = ""
    if (this.pageData?.baseMention?.channelGroup == ChannelGroup.Email) {
      lastAuthorMsg = this.pageData?.baseMention?.description || this.pageData?.baseMention?.emailContent || this.pageData?.baseMention?.emailContentHtml
    }
    else {
      lastAuthorMsg = this.pageData?.baseMention?.description
    }

    if (lastAuthorMsg) {
      const obj = {
        brand_name: this.pageData?.baseMention.brandInfo?.brandName,
        brand_id: this.pageData?.baseMention.brandInfo?.brandID,
        author_id: this.pageData?.baseMention.author?.socialId,
        author_name: this.pageData?.baseMention.author?.name,
        channel_group_id: this.pageData?.baseMention.channelGroup,
        ticket_id: this.pageData?.baseMention.ticketID,
        ticket_category: category,
        last_author_msg: lastAuthorMsg,
        channel_type: this.pageData?.baseMention.channelType,
        rating: this.pageData?.baseMention.rating,
        user_id: this.currentUser?.data?.user?.userId,
        tag_id: this.pageData?.baseMention?.tagID,
        Feedback_like: isInsert && this.aiMessageFeedback != 1 ? '' : 1,
        is_response_inserted: isInsert ? 1 : '',
        rejection_feedback: ''
      };

      this._chatBotService.trackAIResponse(obj).subscribe(res => {
        if (res?.success) {
          if (isInsert) {
            this.aiMessageFeedback = 2;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Thanks-for-your-feedback'),
              },
            });
          }
        } else {
          this.aiMessageFeedback = 2;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something-went-wrong'),
            },
          });
          this.cdr.detectChanges();
        }
      }, err => {
        this.aiMessageFeedback = 2;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something-went-wrong'),
          },
        });
        this.cdr.detectChanges();
      });
    }

  }

  rejectAi(thumbDown?: boolean) {
    if (thumbDown) { this.aiMessageFeedback = 0; }
    const category = this.pageData?.baseMention?.categoryMap?.map((x) => x.name);
    let lastAuthorMsg = ""
    if (this.pageData?.baseMention?.channelGroup == ChannelGroup.Email) {
      lastAuthorMsg = this.pageData?.baseMention?.description || this.pageData?.baseMention?.emailContent || this.pageData?.baseMention?.emailContentHtml
    }
    else {
      lastAuthorMsg = this.pageData?.baseMention?.description
    }
    const obj = {
      brand_name: this.pageData?.baseMention?.brandInfo?.brandName,
      brand_id: this.pageData?.baseMention?.brandInfo?.brandID,
      author_id: this.pageData?.baseMention?.author?.socialId,
      author_name: this.pageData?.baseMention?.author?.name,
      channel_group_id: this.pageData?.baseMention?.channelGroup,
      ticket_id: this.pageData?.baseMention?.ticketID,
      ticket_category: category,
      last_author_msg: lastAuthorMsg,
      channel_type: this.pageData?.baseMention?.channelType,
      rating: this.pageData?.baseMention?.rating,
      user_id: this.currentUser?.data?.user?.userId,
      tag_id: this.pageData?.baseMention?.tagID,
      Feedback_like: thumbDown ? 0 : this.aiMessageFeedback == 0 ? 0 : '',
      is_response_inserted: thumbDown ? '' : 0
    };
    const dialogRef = this.dialog.open(AiFeedbackPageComponent, {
      width: '40vw',
      data: obj,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.aiMessageFeedback = 0;
      }
      else {
        this.aiMessageFeedback = 2;
      }
    });
  }
  /* Ai Suggestion Methods */

  openMediaDialog(): void {
    this.mediaGalleryService.startDateEpoch = this.pageData?.postDetailTab?.tab?.Filters?.startDateEpoch;
    this.mediaGalleryService.endDateEpoch = this.pageData?.postDetailTab?.tab?.Filters?.endDateEpoch;
    this.dialog.open(MediaGalleryComponent, {
      autoFocus: false,
      panelClass: ['full-screen-modal'],
    });
  }

  removeSelectedMedia(ugcMention: UgcMention): void {
    if (ugcMention) {
      this.pageData.selectedMedia = this.pageData?.selectedMedia.filter((obj) => {
        return obj.mediaID !== ugcMention.mediaID;
      });
      this.mediaSelectedAsync.next(this.pageData?.selectedMedia);
      this.createAttachmentMediaPillView()
                  this.maximumAttachmentLength = this.pageData?.selectedMedia?.length;
      setTimeout(() => {
        this.checkEmailAttachmentWidth()
      }, 300);
      this.mediaGalleryService.selectedMedia = this.pageData?.selectedMedia;
    }
  }

  openCannedResponse(): void {
    this.dialog.open(CannedResponseComponent, {
      autoFocus: false,
      width: '50vw',
      data: { openedFrom: 'emailPopup', mention: this.pageData.baseMention },
    });
  }

  onReplyLinkChange(event, item) {
    item.checked = event.checked
  }

  onNext() {
    if (!this.pageData?.isForward && Object.keys(this.pageData?.reply?.value).length == 0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Reply-option-not-selected'),
        },
      });
      return false;
    }

    if (this.pageData.emails?.to?.value?.length == 0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Enter-valid-email-in-To-field'),
        },
      });
      return false;
    }

    if (this.pageData?.emails?.replyText?.trim().length == 0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Reply-text-empty'),
        },
      });
      return false;
    }

    this._ticketService.emailPopupToPostReplySetDataObsSignal.set({ status: true, data: this.pageData });
    this.onClose();
  }

  onClose() {
    this._ticketService.emailPopUpViewObs.next({ status: true, isOpen: false, data: null });
    this._postDetailService.openRephrasePopup = false;
    /* this.replyService.openRephrase.next({ openPopup: false, position: null, rephraseOptions: null, tab: this._navigationService.currentSelectedTab }); */
    this.replyService.openRephraseSignal.set({ openPopup: false, position: null, rephraseOptions: null, tab: this._navigationService.currentSelectedTab });
    this.subs.unsubscribe();
  }

  replyTypeChange(event): void {
    const brandInfo = this._filterService.fetchedBrandData.find((obj) => obj.brandID == this.pageData?.baseMention?.brandInfo?.brandID);

    if (this.pageData?.isSendFeedBackClosedCheckedDisabledFlag) {
      this.pageData?.replyCheckbox.forEach((element) => {
        if (element.replyLinkId == Replylinks.SendFeedback) {
          element.checked = true;
          element.disabled = true;
        }
      });
    } 
    else if (this.pageData?.isSendFeedBackClosedCheckedFlag) {
      this.pageData?.replyCheckbox.forEach((element) => {
        if (element.replyLinkId == Replylinks.SendFeedback) {
          element.checked = true;
          element.disabled = false;
        }
      });
    }

    if (event == 14) {
      if (brandInfo && brandInfo.isSafeFormActive) {
        if (this.pageData?.baseMention.channelType == ChannelType.Email) {
          const index = this.pageData?.replyCheckbox.findIndex((obj) => obj.replyLinkId == Replylinks.PersonalDetailsRequired);
          if (index > -1) { } 
          else {
            this.pageData?.replyCheckbox.push({
              name: 'Personal Details Required',
              socialId: '',
              replyLinkId: Replylinks.PersonalDetailsRequired,
              checked: false,
              disabled: false,
            });
          }
        } 
        else {
          const sendDmLinkFlag = this.pageData?.replyCheckbox.some((obj) => obj.replyLinkId == Replylinks.SendAsDM && obj.checked);
          if (sendDmLinkFlag) {
            const index = this.pageData?.replyCheckbox.findIndex((obj) => obj.replyLinkId == Replylinks.PersonalDetailsRequired);
            if (index > -1) {
              // this.replyLinkCheckbox.splice(index, 1);
            } 
            else {
              this.pageData?.replyCheckbox.push({
                name: 'Personal Details Required',
                socialId: '',
                replyLinkId: Replylinks.PersonalDetailsRequired,
                checked: false,
                disabled: false,
              });
            }
          }
        }
      }
    } 
    else {
      if (brandInfo && brandInfo.isSafeFormActive) {
        const index = this.pageData?.replyCheckbox.findIndex((obj) => obj.replyLinkId == Replylinks.PersonalDetailsRequired);
        if (index > -1) {
          this.pageData?.replyCheckbox.splice(index, 1);
        }
      }
    }

    if (brandInfo.isFeedbackEnabled && this.pageData?.feedbackFormValue == 0 && this.pageData?.sendFeedBack) {
      if (event != 3) {
        const index = this.pageData?.replyCheckbox.findIndex((obj) => obj.replyLinkId == Replylinks.SendFeedback);
        index > -1 ? this.pageData?.replyCheckbox.splice(index, 1) : 0;
      } 
      else {
        this.pageData?.replyCheckbox.unshift({
          name: 'Send Feedback',
          socialId: this.pageData?.baseMention.socialID,
          replyLinkId: Replylinks.SendFeedback,
          checked: true,
          disabled: true,
          feedbackForm: this.pageData?.feedbackFormValue
        })
      }
    }

    if (brandInfo.isFeedbackEnabled && (this.pageData?.feedbackFormValue == 1 || this.pageData?.feedbackFormValue == 2 || this.pageData?.feedbackFormValue == 3) && this.pageData?.sendFeedBack) {
      if (event != 3) {
        this.pageData?.replyCheckbox.forEach((obj) => {
          if (obj.replyLinkId == Replylinks.SendFeedback) {
            obj.checked = false;
          }
        })
      } else {
        this.pageData?.replyCheckbox.forEach((obj) => {
          if (obj.replyLinkId == Replylinks.SendFeedback) {
            obj.checked = true;
          }
        })
      }
    }
  }

  // Called when key is released to stop multi-selection mode
  onParentKeyup(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.metaKey) {
      this.ctrlKeyPressed = false; // Disable multi-selection mode when Ctrl is released
    }
  }
  // Handles chip click to select/deselect it
  selectChip(event: MouseEvent, mail: string, type: string) {
    event.stopPropagation();   

    if (this.currentType && this.currentType !== type) {
      this.selectedChips[this.currentType] = []; // Clear previous type's selection
    }

    // Update the current type
    this.currentType = type;
    
    if (!this.selectedChips[type]) {
      this.selectedChips[type] = []; // Initialize as an empty array if undefined
    }
    if (this.ctrlKeyPressed) {
      // If Ctrl key is pressed, toggle the selection of the clicked chip
      const isSelected = this.selectedChips[type]?.includes(mail);
      if (isSelected) {
        // Deselect the chip
        this.selectedChips[type] = this.selectedChips[type].filter(item => item !== mail);
      } else {
        // Select the chip
        this.selectedChips[type].push(mail);
      }
    }
    else {
      //single chip selection when ctrl key is not pressed
      this.selectedChips[type] = [];
      this.selectedChips[type].push(mail);
    }
  }
  handleCtrlKey(event: KeyboardEvent, copyEmail: any, emailType: string){
    if (event.ctrlKey || event.metaKey) {
      event.stopPropagation(); // Prevent the event from propagating to the parent
      this.ctrlKeyPressed = true;
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'c') {
      event.preventDefault();
      const selectedText = this.selectedChips[emailType].join(',');
      navigator.clipboard.writeText(selectedText);
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'x') {
      event.preventDefault();
      if (this.selectedChips[emailType]?.length > 0) {
        const selectedText = this.selectedChips[emailType].join(',');
        navigator.clipboard.writeText(selectedText);
      }

      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
  }

  handleKeyboardEvent(event: KeyboardEvent, copyEmail: any, emailType: string): void {
    if (event.ctrlKey || event.metaKey) {
      this.ctrlKeyPressed = true;  // Enable multi-selection mode when Ctrl is pressed
    }
    if (copyEmail?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      this.selectedChips[emailType] = [...copyEmail];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'c') {
      event.preventDefault();
      const selectedText = this.selectedChips[emailType].join(',');
      navigator.clipboard.writeText(selectedText);
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'x') {
      event.preventDefault();
      if (this.selectedChips[emailType]?.length > 0) {
        const selectedText = this.selectedChips[emailType].join(',');
        navigator.clipboard.writeText(selectedText);
      }

      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && event.key === 'Escape') {
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && event.shiftKey && event.code === 'ArrowDown') {
      event.preventDefault();
      if (emailType == 'to' && this.pageData?.emails?.to?.value){
        this.pageData.emails.to.value = this.pageData?.emails?.to?.value.filter((item) =>{return !this.selectedChips['to'].includes(item);});
        this.pageData.emails.cc.value = [...this.pageData?.emails?.cc?.value, ...this.selectedChips['to'].filter((email) => !this.pageData?.emails?.cc?.value.includes(email))];
        this.selectedChips['to'] = [];
        this.selectedChips['cc'] = [];
      }
      if (emailType == 'cc' && this.pageData?.emails?.cc?.value) {
        this.pageData.emails.cc.value = this.pageData?.emails?.cc?.value.filter((item) => { return !this.selectedChips['cc'].includes(item); });
        this.pageData.emails.bcc.value = [...this.pageData?.emails?.bcc?.value, ...this.selectedChips['cc'].filter((email) => !this.pageData?.emails?.bcc?.value.includes(email))];
        this.selectedChips['cc'] = [];
        this.selectedChips['bcc'] = [];
      }
    }
    if (this.selectedChips[emailType]?.length > 0 && event.shiftKey && event.code === 'ArrowUp') {
      event.preventDefault();
      if (emailType == 'bcc' && this.pageData?.emails?.bcc?.value) {
        this.pageData.emails.bcc.value = this.pageData?.emails?.bcc?.value.filter((item) => { return !this.selectedChips['bcc'].includes(item); });
        this.pageData.emails.cc.value = [...this.pageData?.emails?.cc?.value, ...this.selectedChips['bcc'].filter((email) => !this.pageData?.emails?.cc?.value.includes(email))];
        this.selectedChips['bcc'] = [];
        this.selectedChips['cc'] = [];
      }
      if (emailType == 'cc' && this.pageData?.emails?.cc?.value) {
        this.pageData.emails.cc.value = this.pageData?.emails?.cc?.value.filter((item) => { return !this.selectedChips['cc'].includes(item); });
        this.pageData.emails.to.value = [...this.pageData?.emails?.to?.value, ...this.selectedChips['cc'].filter((email) => !this.pageData?.emails?.to?.value.includes(email))];
        this.selectedChips['cc'] = [];
        this.selectedChips['to'] = [];
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      if (event.code === 'ArrowLeft') {
        let remainingItems = copyEmail.slice(0, copyEmail?.length - this.selectedChips[emailType]?.length);
        if (remainingItems?.length > 0) {
          this.selectedChips[emailType].push(remainingItems[remainingItems?.length - 1]);
        }
      } else if (event.code === 'ArrowRight') {
        if (this.selectedChips[emailType]?.length > 0) {
          this.selectedChips[emailType].pop();
        }
      }
    }
  }
  reorderDroppedItem(event: CdkDragDrop<string[]>, mailtype: string): void {    
    if (this.selectedChips[event.previousContainer.id]?.length) {
      this.draggedEmail = [...this.selectedChips[event.previousContainer.id]];
    }
    else{
      this.draggedEmail = [event.item.data];
    }    
    const emailTypeFrom = event.previousContainer.id; // Source email type (e.g., 'to', 'cc', 'bcc')
    const emailTypeTo = event.container.id; // Target email type

    const sourceEmails = this.pageData.emails[emailTypeFrom]?.value || [];
    const targetEmails = this.pageData.emails[emailTypeTo]?.value || [];

    // Determine the emails to move: single email or selected emails
    const emailsToMove = this.draggedEmail;

    if (emailTypeFrom === emailTypeTo) {
      // Same container, no further processing
      return;
    }

    // Remove the emails from the source list
    this.pageData.emails[emailTypeFrom].value = sourceEmails.filter(
      (email) => !emailsToMove.includes(email)
    );

    // Add the emails to the target list, avoiding duplicates
    emailsToMove.forEach((email) => {
      if (!targetEmails.includes(email)) {
        targetEmails.push(email);
      }
    });

    // Update the target list
    this.pageData.emails[emailTypeTo].value = targetEmails;

    // Clear selected chips after moving
    this.selectedChips[emailTypeFrom] = [];
    this.selectedChips[emailTypeTo] = [];
  }

  removeEmailPill(tag, type: string): void {
    const index = this.pageData?.emails?.[type]?.value?.indexOf(tag);
    if (index >= 0) {
      this.pageData?.emails?.[type]?.value?.splice(index, 1);
      this.checkEmailIDOutsideOrganizationOrNot();
    }
  }

  addEmailPill(event: MatChipInputEvent, type: string): void {
    const emailList: any[] = event?.value?.split(/[\s,]+/).filter(email => email.trim() !== '') || [];
    for (const email of emailList || []) {
      if (email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) && !['noreply', 'no-reply', 'no.reply'].includes(email)) {
        const index = this.pageData.emails[type]?.value.findIndex((item: string) => item == email);
        if (index == -1) {
          this.pageData.emails[type]?.value?.push(email);
        }
      }
    }

    if (event?.input) {
      event.input.value = '';
      setTimeout(() => {
        this.inputRecvd[type] = false;
      },500);      
    }
    this.checkEmailIDOutsideOrganizationOrNot();

    if(this.sendAlert)
    {
      this.agentEmailIds = this.tempAgentList
      this.emaillocationAttributes = this.tempEmaillocationAttributes
    }
  }

  addEmailOptionList(event:any, type: string,inputRef) {
    if (typeof event?.option?.value === 'string'){
      const index = this.pageData.emails[type]?.value.findIndex((item: string) => item == event?.option?.value);
      if (index == -1) {
        this.pageData.emails[type]?.value?.push(this.sendAlert && this.checkPlaceHolderOrNot(event?.option?.value) ? `{{${event?.option?.value}}}`:event?.option?.value);
      }
    }
    else if (event?.option?.value instanceof Object){
      const selectedGroup = event?.option?.value;
      const allAddedMail: any[] = [
        ...this.pageData?.emails?.to?.value,
        ...this.pageData?.emails?.cc?.value,
        ...this.pageData?.emails?.bcc?.value,

      ]
      if ('email_to' in selectedGroup && selectedGroup?.email_to?.trim()?.length > 0) {
        const email_to: any = selectedGroup?.email_to?.split(',');
        for (const toEmail of email_to) {
          if (!(allAddedMail.includes(this.sendAlert && this.checkPlaceHolderOrNot(toEmail) ? `{{${toEmail}}}`:toEmail))) {
            this.pageData?.emails?.to?.value?.push(this.sendAlert && this.checkPlaceHolderOrNot(toEmail) ? `{{${toEmail}}}`:toEmail);
          }
        }
      }

      if ('email_cc' in selectedGroup && selectedGroup?.email_cc?.trim()?.length > 0) {
        const email_cc: any = selectedGroup?.email_cc?.split(',');
        for (const toEmail of email_cc) {
          if (!(allAddedMail.includes(this.sendAlert && this.checkPlaceHolderOrNot(toEmail) ? `{{${toEmail}}}`:toEmail))) {
            this.pageData?.emails?.cc?.value?.push(this.sendAlert && this.checkPlaceHolderOrNot(toEmail) ? `{{${toEmail}}}`:toEmail);
            this.isCcEmailShow  = true;
          }
        }
      }

      if ('email_bcc' in selectedGroup && selectedGroup?.email_bcc?.trim()?.length > 0) {
        const email_bcc: any = selectedGroup?.email_bcc?.split(',');
        for (const toEmail of email_bcc) {
          if (!(allAddedMail.includes(this.sendAlert && this.checkPlaceHolderOrNot(toEmail) ? `{{${toEmail}}}`:toEmail))) {
            this.pageData?.emails?.bcc?.value?.push(this.sendAlert && this.checkPlaceHolderOrNot(toEmail) ? `{{${toEmail}}}`:toEmail);
            this.isBccEmailShow = true;
          }
        }
      }
    }
    this.checkEmailIDOutsideOrganizationOrNot();
    if(this.sendAlert)
    {
      this.agentEmailIds = this.tempAgentList
      this.emaillocationAttributes = this.tempEmaillocationAttributes
    }
    inputRef.value = '';
  }

  onInput(event,type?: string) {
    console.log(event);
    if(event && event.data){
      this.inputRecvd[type] = true;
    }
    else{
      this.inputRecvd[type] = false;
    }
    const text: string = (event?.target?.value || '').toString();
    if (text.trim().length > 0) {
      this.pageData.emails.suggestion = this.duplicate_suggestion.filter((item: string) => item?.toLowerCase()?.includes(text.toLowerCase()));
      this.pageData.emails.groupSuggestion = this.duplicate_groupSuggestion.filter((item: any) => (item?.groupName)?.toLowerCase()?.includes(text?.toLowerCase()));
    }

    if (text.trim().length == 0) {
      this.pageData.emails.suggestion = this.duplicate_suggestion;
      this.pageData.emails.groupSuggestion = this.duplicate_groupSuggestion;
    }
  }

  onInputProfiles(txt)
  {
    const value = txt.toLowerCase()
    
    this.agentEmailIds = this.tempAgentList?.filter((x) => x.toLowerCase().includes(value) );

    this.emaillocationAttributes = this.tempEmaillocationAttributes?.filter((x) => x?.attributeFriendlyName?.toLowerCase().includes(value));

  }

  saveOnlyEmailDetails(): void {
   
    if (this.pageData?.emails?.to?.value?.length == 0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Enter-valid-email-in-field', { field: this.templateFlag ? this.translate.instant('To') : this.pageData.isForward ? this.translate.instant('Forward-To') : this.translate.instant('Reply-To') }),
        },
      });
      return ;
    }
    
    if (this.pageData.emails.replyText.trim().length == 0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Email-body-cannot-be-empty'),
        },
      });
      return ;
    }

    const obj = {
      data:{
      Mode:1,
        EmailDetails:{
      SendToEmailIDs: this.pageData.emails.to.value,
      CC: this.pageData.emails.cc.value,
      BCC: this.pageData.emails.bcc.value,
      Subject: this.pageData.emails.subject,
      Body: this.pageData.emails.replyText,
      Attachments: this.pageData.selectedMedia
        }
      }
    }

    this.saveTemplate.emit(obj);
  }

  openNormalEmailMedia(): void {
    this.dialog.open(MediaGalleryComponent, {
      data: {
        type: 'MediaGallery',
        attachmentPermission:true
      },
      autoFocus: false,
      panelClass: ['full-screen-modal'],
    });
  }

  openTemplateCannedResponse():void
  {
    const dialogRef = this.dialog.open(CannedResponseComponent, {
      autoFocus: false,
      width: '50vw',
      data: { openedFrom: 'workflow', brandInfo: this.profileService.selectedBrand},
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if(dialogResult)
      {
        this.pageData.emails.replyText+=dialogResult.text;

      }
    }
    )
  }

  toogleMinimizeView():void
  {
    this.maximize = !this.maximize;
    this._ticketService.emailMaximumMinimumObs.next(this.maximize)
    this.maximumAttachmentLength = this.pageData?.selectedMedia?.length;
    setTimeout(() => {
      this.checkEmailAttachmentWidth();
    }, 300);
  }

  hideReplyView():void
  {
    if (this.hideMaximizeView)
    {
      this._ticketService.emailMaximumMinimumObs.next(false)
    }else
    {
      if (this.maximize)
      {
        this._ticketService.emailMaximumMinimumObs.next(true)
      }
    }

  }

  checkEmailIDOutsideOrganizationOrNot(): void {
    this.outsideEmailFlag = false;

    const allOrgEmails = this.tempAllGroupEmailList || [];
    const toEmails = this.pageData.emails.to.value || [];
    const ccEmails = this.pageData.emails.cc.value || [];
    const bccEmails = this.pageData.emails.bcc.value || [];

    const allEmails = [...toEmails, ...ccEmails, ...bccEmails];

    const outsideSet = [];
    this.outsideEmails =[]
    allEmails.forEach(email => {
      if (email && !allOrgEmails.includes(email)) {
        outsideSet.push(email);
      }
    });

    if (outsideSet?.length > 0) {
      outsideSet.forEach(email => {
        if (!this.outsideEmails.includes(email)) {
          this.outsideEmails.push(email);
        }
      });
      this.remainingEmailTooltip = outsideSet.splice(1, outsideSet.length - 1).join(', ');
      this.outsideEmailFlag = true;
      this.cdr.detectChanges();
    }
  }

  createAttachmentMediaPillView():void{
      this.selectedAttachmentList =[]
      const selectedMedia =[]
    this?.pageData?.selectedMedia?. forEach((item) => {
        const obj = {
          mediaType: item?.mediaType,
          mediaUrl: item?.mediaPath,
          fileName: item?.displayFileName,
                  iconUrl: (item?.mediaType == MediaEnum.IMAGE) ? 'assets/icons/JPEG.svg' : (item?.mediaType == MediaEnum.VIDEO) ? 'assets/icons/video-icon.svg' : (item?.mediaType == MediaEnum.PDF) ? 'assets/icons/PDF.svg' : (item?.mediaType == MediaEnum.EXCEL) ? 'assets/icons/Xls.svg' : item?.mediaType == MediaEnum.DOC ? 'assets/icons/DOC.svg' : item?.mediaPath.includes('doc') ? 'assets/icons/DOC.svg' : item?.mediaPath.includes('docx') ? 'assets/icons/DOCX.svg' : item?.mediaPath.includes('ppt') ? 'assets/icons/PPT.svg' : item?.mediaPath.includes('pptx') ? 'assets/icons/PPTX.svg' : item?.mediaPath.includes('xls') ? 'assets/icons/Xls.svg' : item?.mediaPath.includes('xlsx') ? 'assets/icons/Xlsx.svg' : item?.mediaPath.includes('pdf') ? 'assets/icons/PDF.svg' : 'assets/icons/Other.svg',
          mediaID: item?.mediaID,
        }
        selectedMedia.push(obj);
      }
    )
      this.selectedAttachmentList = selectedMedia;
      this.cdr.detectChanges();
    }

  checkEmailAttachmentWidth(): void {
    this.showMoreAttachment = false
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
    this.remainingAttachmentCount = this.selectedAttachmentList?.length - this.maximumAttachmentLength || 0;
    this.cdr.detectChanges();
  }

   previewFile(item):void{
        const attachments = [item]
              if (attachments.length > 0) {
                    this.dialog.open(VideoDialogComponent, {
                      panelClass: 'overlay_bgColor',
                      data: attachments,
                      autoFocus: false,
                    });
                  }
      }
  

  ngAfterViewInit(): void {
    this.checkEmailAttachmentWidth()
  }


  mergeLocationProfileAttributes(res): void {
    const emailLocationProfileAttributes  =[]


    res?.locationAttributes?.customAttributes.forEach((item) => {
      if (item?.isEmail) {
        emailLocationProfileAttributes.push(item);
      }
    });
    // emailLocationProfileAttributes.push('LocationManagerEmailAddress')
    this.emaillocationAttributes = emailLocationProfileAttributes
    this.tempEmaillocationAttributes = Object.assign([], emailLocationProfileAttributes)
    this.defaultLocationProfiles = res?.locationAttributes?.defaultAttributes;
    this.customLocationProfiles = res.locationAttributes.customAttributes

  }


  onEditorReady(event: any) {
    this.editorInstance = event.editor;
  }

  insertPlaceholder(placeholder: string, bracketFlag = false): void {
  if (this.editorInstance) {
    this.editorInstance.focus();

    const txtValue = bracketFlag ? `{{${placeholder}}}` : placeholder;
    const selection = this.editorInstance.getSelection();
    const ranges = selection.getRanges();

    if (ranges.length > 0) {
      const range = ranges[0];

      // Create a text node with the placeholder
      const textNode = this.editorInstance.document.createText(txtValue);

      // Delete selected content (optional, useful if text is selected)
      range.deleteContents();

      // Insert the new text node
      range.insertNode(textNode);

      // Move the range (caret) after the inserted text
      range.setStartAfter(textNode);
      range.setEndAfter(textNode);

      // Update the selection with the new range
      selection.selectRanges([range]);

      // Re-focus the editor (extra safety)
      this.editorInstance.focus();
      this.editorInstance.fire('change');
    }
  }
}

  insertQuestionListPlaceholder(placeholder: string, bracketFlag=false): void {
    this.insertPlaceholder(placeholder, bracketFlag);
}


  checkPlaceHolderOrNot(email:string):boolean{
    return this.emaillocationAttributes?.some((x) => x.attributeName == email)
  }

  getEmailTemplate(): void {

    this.workflowservice.getWorkflowEmailTemplate().subscribe((res) => {
      if (res?.success) {
        this.emailTemplatesList = res?.data?.templates || [];
        
      }
    }
  )
}

selectTemplate(Template: any): void {
    if (Template) {
      this.pageData.emails.replyText = Template?.TemplateBody || '';
      this.pageData.emails.subject = Template?.TemplateSubject || '';
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe()
  }

}

