import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import {
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import {
  AttachmentFile,
  CreateManualTicketParam,
  ManualTicketData,
} from 'app/core/models/viewmodel/AttachmentFile';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { AccountService } from 'app/core/services/account.service';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { NavigationService } from 'app/core/services/navigation.service';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { CustomSnackbarComponent } from 'app/shared/components/custom-snackbar/custom-snackbar.component';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { Observable, Subject } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';
import { SubSink } from 'subsink';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

import {
  CategoryFilterComponent,
  MediaGalleryComponent,
  VideoDialogComponent,
} from '..';
import { map, startWith } from 'rxjs/operators';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ImageEditorEnum } from 'app/core/enums/ImageEditor';
import moment from 'moment';
import { DatePipe } from '@angular/common';
import { UpperCategory } from 'app/core/models/category/UpperCategory';
import { TaggingCategory } from 'app/core/models/category/TaggingCategory';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { ChannelConfigurationService } from 'app/accounts/services/channel-configuration.service';
export interface Food {
  value: string;
  viewValue: string;
  img: string;
}
export interface email {
  name: string;
}
export interface BrandEmails {
  settingId?: number;
  emailId?: string;
  userName?: string;
}
export interface PostContentData {
  profileImage?: string;
  screenName?: string;
  userName?: string;
  followers?: string;
  createdDate?: string;
  postContentText?: string;
  postContentImage?: string;
  postContentType?: string;
  attachment?: [];
  like?: number;
  share?: number;
  comment?: number;
}
export interface PostContentYoutube {
  profileImage?: string;
  userName?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  createdDate?: string;
  description?: string;
  thumbnailURL?: string;
  title?: string;
  url?: string;
  comment?:any;
}
@Component({
    selector: 'app-manual-ticket',
    templateUrl: './manual-ticket.component.html',
    styleUrls: ['./manual-ticket.component.scss'],
    standalone: false
})
export class ManualTicketComponent implements OnInit, OnDestroy {
  selectable = true;
  removable = true;
  addOnBlur = true;
  emailReplyText = '';
  readonly separatorKeysCodes = [ENTER, COMMA] as const;
  currentUser: AuthUser;
  selectedBrandList: BrandList[] = [];
  currentSelectedBrand: BrandList = {};
  filesUploaded: any[] = [];
  isMention:boolean = false;
  customChannels: any[] = [
    {
      channelName: 'Email',
      channelID: ChannelGroup.Email,
      channelImage: `assets/images/channel-logos/email.svg`,
      isDisabled: false
    }, {
      channelName: 'Twitter',
      channelID: ChannelGroup.Twitter,
      channelImage: `assets/images/channel-logos/twitter.svg`,
      isDisabled: false
    },
    {
      channelName: 'Facebook',
      channelID: ChannelGroup.Facebook,
      channelImage: `assets/images/channel-logos/facebook.svg`,
      isDisabled: false
    },

    // {
    //   channelName: 'TripAdvisor Post',
    //   channelID: ChannelGroup.TripAdvisor,
    //   channelImage: `assets/images/channel-logos/tripadvisor.svg`,
    // },

    // {
    //   channelName: 'TripAdvisor QA',
    //   channelID: ChannelGroup.TripAdvisor,
    //   channelImage: `assets/images/channel-logos/tripadvisor.svg`,
    // },

    {
      channelName: 'Youtube',
      channelID: ChannelGroup.Youtube,
      channelImage: `assets/images/channelicons/Youtube.svg`,
      isDisabled: false
    },
    {
      channelName: 'Blogs',
      channelID: ChannelGroup.Blogs,
      channelImage: `assets/images/channel-logos/blog.svg`,
      isDisabled: false
    },
    {
      channelName: 'Discussion Forums',
      channelID: ChannelGroup.DiscussionForums,
      channelImage: `assets/images/channelicons/DiscussionForums.svg`,
      isDisabled: false
    },
    {
      channelName: 'Complaint Website',
      channelID: ChannelGroup.ComplaintWebsites,
      channelImage: `assets/images/channel-logos/complaint-website.svg`,
      isDisabled: false
    },
    {
      channelName: 'News',
      channelID: ChannelGroup.News,
      channelImage: `assets/images/channel-logos/news-blog.svg`,
      isDisabled: false
    },
    // {
    //   channelName: 'HolidayIQ',
    //   channelID: ChannelGroup.HolidayIQ,
    //   channelImage: `assets/images/channel-logos/holidayiq.svg`,
    // },
    // {
    //   channelName: 'Electronic Media',
    //   channelID: ChannelGroup.ElectronicMedia,
    //   channelImage: `assets/images/channel-logos/ecomerce.svg`,
    // },

  ];
  loaderTypeEnum = loaderTypeEnum;
  selectedChannel: any;
  showNoBrandFound = false;
  brandEmails: BrandEmails[] = [];
  savedBrandEmails: BrandEmails[] = [];
  brandToEmails: BrandEmails[] = [];
  toEmails: email[] = [];
  fromEmails: email[] = [];
  emailCCEmails: email[] = [];
  emailBCCEmails: email[] = [];
  AttachmentFile: AttachmentFile[] = [];
  isActionable: Boolean = true;
  @ViewChild('emailToInput') emailToInput: ElementRef<HTMLInputElement>;
  @ViewChild('emailFromInput') emailFromInput: ElementRef<HTMLInputElement>;
  @ViewChild('emailccInput') emailccInput: ElementRef<HTMLInputElement>;
  @ViewChild('emailbccInput') emailbccInput: ElementRef<HTMLInputElement>;
  @ViewChild('dateRangePicker') pickerDirective: ElementRef<HTMLInputElement>;
  @ViewChild('autoCompleteInput', { read: MatAutocompleteTrigger })
  autoComplete: MatAutocompleteTrigger;

  sendEmailcc: boolean = false;
  sendEmailBcc: boolean = false;
  CreateManualTicketParam: CreateManualTicketParam = {};
  subs = new SubSink();
  emailSubject = '';
  userName = '';
  settingId = 0;
  attachmentFileAsync = new Subject<AttachmentFile[]>();
  attachmentFileAsync$ = this.attachmentFileAsync.asObservable();
  editor = ClassicEditor;
  foods: Food[] = [
    {
      value: 'steak-0',
      viewValue: 'Steak',
      img: 'https://www.akberiqbal.com/favicon-32x32.png',
    },
    {
      value: 'pizza-1',
      viewValue: 'Pizza',
      img: 'https://www.akberiqbal.com/favicon-16x16.png',
    },
    {
      value: 'tacos-2',
      viewValue: 'Tacos',
      img: 'https://www.akberiqbal.com/favicon-96x96.png',
    },
  ];
  // editorConfig = {
  //   //format_tags: 'p;h1;h2;h3;h4;h5;h6;pre',
  //   toolbar: [
  //     { name: 'document', groups: [ 'mode', 'document', 'doctools' ], items: [ 'Source', '-', 'Save', 'NewPage', 'ExportPdf', 'Preview', 'Print', '-', 'Templates' ] },
  //     { name: 'clipboard', groups: [ 'clipboard', 'undo' ], items: [ 'Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo' ] },
  //     { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ], items: [ 'Find', 'Replace', '-', 'SelectAll', '-', 'Scayt' ] },
  //     { name: 'forms', items: [ 'Form', 'Checkbox', 'Radio', 'TextField', 'Textarea', 'Select', 'Button', 'ImageButton', 'HiddenField' ] },
  //     '/',
  //     { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ], items: [ 'Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat' ] },
  //     { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ], items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl', 'Language' ] },
  //     { name: 'links', items: [ 'Link', 'Unlink', 'Anchor' ] },
  //     { name: 'insert', items: [ 'Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe' ] },
  //     '/',
  //     { name: 'styles', items: [ 'Styles', 'Format', 'Font', 'FontSize' ] },
  //     { name: 'colors', items: [ 'TextColor', 'BGColor' ] },
  //     { name: 'tools', items: [ 'Maximize', 'ShowBlocks' ] },
  //     { name: 'others', items: [ '-' ] },
  //     { name: 'about', items: [ 'About' ] }
  //   ],
  //   toolbarGroups : [
  //     { name: 'document', groups: [ 'mode', 'document', 'doctools' ] },
  // { name: 'clipboard', groups: [ 'clipboard', 'undo' ] },
  // { name: 'editing', groups: [ 'find', 'selection', 'spellchecker' ] },
  // { name: 'forms' },
  // '/',
  // { name: 'basicstyles', groups: [ 'basicstyles', 'cleanup' ] },
  // { name: 'paragraph', groups: [ 'list', 'indent', 'blocks', 'align', 'bidi' ] },
  // { name: 'links' },
  // { name: 'insert' },
  // '/',
  // { name: 'styles' },
  // { name: 'colors' },
  // { name: 'tools' },
  // { name: 'others' },
  // { name: 'about' }
  //   ],
  //   allowedContent: true,
  //   // This value must be kept in sync with the language defined in webpack.config.js.
  //   language: 'en',
  //   //removePlugins: 'elementspath'
  // };

  editorConfig = {
    format_tags: 'p;h1;h2;h3;h4;h5;h6;pre',
    toolbar: [
      ['Table'],
      ['Format'],
      ['Bold'],
      ['Italic'],
      ['Underline'],
      // ['Link'],
      ['BulletedList'],
      ['NumberedList'],
      ['Indent'],
      ['Outdent'],
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
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'en',
    removePlugins: 'elementspath',
    extraPlugins:
      'button,panelbutton,panel,floatpanel,colorbutton,colordialog,menu,' +
      ',justify,',
    removeButtons: 'Subscript,Superscript',
    enterMode: 2,
  };
  imageLoader: boolean;
  filteredEmailOptions: BrandEmails[];
  myControl = new UntypedFormControl();
  ckEditorLoader: boolean;
  base64ImageArray: string[] = [];
  uploadedServerLink: string[] = [];
  accountSettingService: any;
  addContentForm: UntypedFormGroup;
  postedDate: any = (new Date()).toLocaleString();
  authorName: string = '';
  contentUrl: string = '';
  title: string = '';
  bodyContentText: any = '';
  postContentData: PostContentData = {
    profileImage: '',
    screenName: '',
    userName: '',
    followers: '',
    createdDate: '',
    postContentText: '',
    postContentImage: '',
    postContentType: '',
  };
  postContentYoutube: PostContentYoutube = {
    profileImage:'',
    userName:'',
    viewCount:'',
    likeCount:'',
    commentCount:'',
    createdDate:'',
    description:'',
    thumbnailURL:'',
    title:'',
    url:'',
    comment:[]
  }
  postContentFullDetails:any;
  postContentLoading:any=false;
  clickhouseEnabled: boolean=false;
  defaultLayout: boolean = false;
  channelLoader: boolean = false;
  layout = "ltr";
  constructor(
    private dialog: MatDialog,
    private _filterService: FilterService,
    private _navService: NavigationService,
    private _accountService: AccountService,
    private _ticketService: TicketsService,
    private _snackBar: MatSnackBar,
    private _mediaGalleryService: MediagalleryService,
    private dialogRef: MatDialogRef<ManualTicketComponent>,
    private _postDetailService: PostDetailService,
    private _ngZone: NgZone,
    private _formBuilder: UntypedFormBuilder,
    private datePipe: DatePipe,
    private cdk:ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    private translate: TranslateService,
    private _channelConfigurationService: ChannelConfigurationService,
    @Inject(MAT_DIALOG_DATA) public baseData: any
  ) {
  }
  userRoleDisabled: boolean =true;
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  todayDate: Date = new Date();
  currentDateTime;
  ngOnInit(): void {
    this.isMention = this.baseData && this.baseData?.isMention ? this.baseData?.isMention : false;
    if(this.isMention){
      this.isActionable = false;
      const isExistIndex = this.customChannels.findIndex(res => res.channelName == 'Email');
      if(isExistIndex > -1) {
        this.customChannels.splice(isExistIndex,1);
      }
    }
    this.createAddContentForm()
    this.currentDateTime = this.datePipe.transform(
      moment(new Date()).toDate(),
      'yyyy-MM-dd HH:mm:ss'
    );
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    if (this.currentUser.data.user.role == UserRoleEnum.SupervisorAgent || this.currentUser.data.user.role == UserRoleEnum.LocationManager) {
      this.userRoleDisabled = false;
    }

    /* allow agent have add content permission */
    if (this.currentUser.data?.user.role == UserRoleEnum.Agent && this.currentUser?.data?.user?.actionButton?.addContent){
      this.userRoleDisabled = false;
    }
    /* allow agent have add content permission */
    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
      this.clickhouseEnabled = true;
      this.isActionable = false
    }
    this.setManualTicketsBrands();
    this.subscribeToEvent();
    this.filteredEmailOptions;
    this.cdk.detectChanges();
    // window.addEventListener('scroll', this.scrollEvent, true);
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this.cdk.detectChanges();
        }
      })
    )
    this.subs.add(
      this._sidebarService.selectedLanguage.subscribe(res => {
        if (this._sidebarService.rtlLanguages.includes(res)) {
          this.layout = "rtl";
        }
      })
    );
  }
  public objectComparisonFunction = function (option, value): boolean {
    return option.brandID === value.brandID;
  };
  public objectComparisonFunction2 = function (option, value): boolean {
    return option.channelID === value.channelID;
  };
  createAddContentForm() {
    this.addContentForm = this._formBuilder.group({
      brand: this.currentSelectedBrand,
      channel: this.selectedChannel,
      contentUrl: this.contentUrl,
      title: this.title,
      bodyContent: this.bodyContentText,
      author: this.authorName,
      date: this.postedDate,
      isActionable: this.isMention ? false : true
    })
  }
  checkUrl(string) {
    let givenURL;
    try {
      givenURL = new URL(string);
    } catch (error) {
      return false;
    }
    return true;
  }
  tagCreateTokenBoolean:Boolean = true;
  getInfoForContent() {
    if (this.contentUrl.length==0){
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Content-url-should-not-be-empty'),
        },
      });
      return;
    }
    if (!this.checkUrl(this.contentUrl)){
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-enter-a-valid-url'),
        },
      });
      return;
    }
    this.postContentLoading=true;
    switch (this.selectedChannel.channelID) {
      case 1: //twitter
        this._filterService.getTwitterInfo(this.contentUrl, this.currentSelectedBrand.brandID).subscribe((res: any) => {
          if (res.success) {
            this.tagCreateTokenBoolean = false
            this.postContentFullDetails = res.data;
            this.postContentData.userName = res.data.userName
            this.postContentData.attachment = this.xmlToJson(res.data.attachmentXML)
            this.postContentData.screenName = res.data.screenName
            this.postContentData.profileImage = res.data.profileImageURL
            this.postContentData.postContentText = res.data.tweettext
            this.postContentData.postContentImage = res.data.mediaUrls
            this.postContentData.postContentType = res.data.mediaType
            this.postContentData.createdDate = this.selectedChannel && this.selectedChannel.channelName == 'Youtube' ? res.data.mentionDateTime ? moment(res.data.mentionDateTime).format("MMM DD, YYYY h:mm a") : '' : res.data.mentionDateTime
            this.postContentData.followers = res.data.userFollowerCount
            if (this.postContentData?.postContentText && this.postContentData?.postContentText.match('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')) {
              this.postContentData.postContentText = this.checkLinkTag(this.postContentData?.postContentText);
            }
            if (this.postContentData?.postContentText && this.postContentData?.postContentText.includes('#')) {
              this.postContentData.postContentText = this.checkHashTag(this.postContentData?.postContentText);
            }
          } else{
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: res?.message?.length > 0 ? res?.message : this.translate.instant('Please-enter-a-valid-url'),
              },
            });
            this.postContentData = {
              profileImage: '',
              screenName: '',
              userName: '',
              followers: '',
              createdDate: '',
              postContentText: '',
              postContentImage: '',
              postContentType: '',
            };
          }

          this.postContentLoading = false;
        })
        break;
      case 4: //youtube
        let youtubeWatchId = this.getYouTubeVideoId(this.contentUrl)
        this._filterService.getYoutubeInfo(youtubeWatchId).subscribe((res:any) => {
          if (res.success) {
            this.tagCreateTokenBoolean=false
            this.postContentFullDetails = res.data;
            this.postContentYoutube.userName = res.data.uploadedBy
            this.postContentYoutube.profileImage = res.data?.profileImageURL
            this.postContentYoutube.description = res.data?.description
            this.postContentYoutube.thumbnailURL = res.data?.thumbnailURL
            this.postContentYoutube.createdDate = this.selectedChannel && this.selectedChannel.channelName == 'Youtube' ? res.data?.mentionDateTime ? moment(res.data?.mentionDateTime).format("MMM DD, YYYY h:mm a") : '' : res.data?.mentionDateTime
            this.postContentYoutube.likeCount = res.data?.likeCount
            this.postContentYoutube.commentCount = res.data?.commentsCount
            this.postContentYoutube.viewCount = res.data?.viewCount
            this.postContentYoutube.title = res.data?.title
            this.postContentYoutube.url = res.data?.uRl
            this.postContentYoutube.comment = res.data?.comments
            if (this.postContentYoutube?.description && this.postContentYoutube?.description.match('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')) {
              this.postContentYoutube.description = this.checkLinkTag(this.postContentYoutube?.description);
            }
            if (this.postContentYoutube?.description && this.postContentYoutube?.description.includes('#')) {
              this.postContentYoutube.description = this.checkHashTag(this.postContentYoutube?.description);
            }
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translate.instant('Please-enter-a-valid-url'),
              },
            });
            this.postContentYoutube = {
              profileImage: '',
              userName: '',
              viewCount: '',
              likeCount: '',
              commentCount: '',
              createdDate: '',
              description: '',
              thumbnailURL: '',
              title: '',
              url: '',
              comment: []
            }
          }
          this.postContentLoading = false;
        })
        break;
      case 2: // Facebook
        if(!this.isValidFacebookUrl(this.contentUrl)){
          this.postContentLoading = false;

          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Please-enter-a-valid-url'),
            },
          });
          return false;
        }
        let data: any = { "Url": this.contentUrl, "ChannelType": 3 }
        this._filterService.getFacebookInfo(data).subscribe((res: any) => {
          if (res.success) {
            this.tagCreateTokenBoolean = false
            this.postContentFullDetails = res.data;
            this.postContentData.userName = res.data.userName
            this.postContentData.attachment = this.xmlToJson(res.data.attachmentXML)
            this.postContentData.profileImage = res.data.picture
            this.postContentData.postContentText = res.data?.feedDescription
            // this.postContentData.postContentImage = res.data.mediaUrls
            this.postContentData.postContentType = res.data.mediaType
            this.postContentData.createdDate = res.data.postTime
            if (this.postContentData?.postContentText && this.postContentData?.postContentText.match('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')) {
              this.postContentData.postContentText = this.checkLinkTag(this.postContentData?.postContentText);
            }
            if (this.postContentData?.postContentText && this.postContentData?.postContentText.includes('#')) {
              this.postContentData.postContentText = this.checkHashTag(this.postContentData?.postContentText);
            }
            this.postContentData.like = res.data.numLikes ? res.data.numLikes : 0;
            this.postContentData.share = res.data.shareCount ? res.data.shareCount : 0;
            this.postContentData.comment = res.data.numComments ? res.data.numComments : 0;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: res.message ? res.message : this.translate.instant('Please-enter-a-valid-url'),
              },
            });
            this.postContentData = {
              profileImage: '',
              screenName: '',
              userName: '',
              followers: '',
              createdDate: '',
              postContentText: '',
              postContentImage: '',
              postContentType: '',
            };
          }

          this.postContentLoading = false;
        })
        break;
      default:
        break;
    }
  }
  addLinkAndHashtags(data):string{
    if (data.match('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?')) {
      data = this.checkLinkTag(data);
    }
    if (data.includes('#')) {
      data = this.checkHashTag(data);
    }
    return data;
  }
  _filter(value: string) {
    const filterValue = value.toLowerCase();
    this.filteredEmailOptions = this.brandEmails.filter((option) =>
      option.emailId.toLowerCase().includes(filterValue)
    );
  }

  openPanel() {
    if (this.autoComplete) {
      this.autoComplete.openPanel();
    }
  }

  scrollEvent(event: any): void {
    if (this.autoComplete?.panelOpen) this.autoComplete?.closePanel();
  }

  subscribeToEvent(): void {
    this.subs.add(
      this._ticketService.manualTicketData.subscribe((obj) => {
        if (obj) {
          this.tagAndCreateTicket(obj);
        }
      })
    );
  }

  setManualTicketsBrands(): void {
    this.selectedChannel = this.customChannels[0];
    const filterObj = this._navService.getFilterJsonBasedOnTabGUID(
      this._navService.currentSelectedTab.guid
    );
    const tabbrandlist = filterObj.brands;
    const allbrands = this._filterService.fetchedBrandData;

    const brandlist = allbrands; // allbrands.filter(x => tabbrandlist.map(y => y.brandID).includes(+x.brandID));
    const brandwithcreateticket = brandlist.filter(
      (x) =>
        // x.isManualTicketCreate === true &&
        x.manualTicketCreateSetting !== null &&
        x.manualTicketCreateSetting !== '' &&
        x.manualTicketCreateSetting !== undefined
    );
    if (brandwithcreateticket && brandwithcreateticket.length > 0) {
      // check role
      let selectedBrands = [];
      for (const brand of brandwithcreateticket) {
        const roles = JSON.parse(
          JSON.stringify(brand.manualTicketCreateSetting)
        );
        const checkRole = roles.findIndex(
          (obj) => obj.userRole === this.currentUser.data.user.role
        );
        if (checkRole > -1) {
          selectedBrands.push(brand);
        }
      }
      if (selectedBrands.length > 0) {
        const finalBrands = selectedBrands.filter((x) =>
          tabbrandlist.map((y) => y.brandID).includes(+x.brandID)
        );
        if (finalBrands.length > 0) {
          this.selectedBrandList = finalBrands;
          this.currentSelectedBrand = this.selectedBrandList[0];
          this.getBrandEmailSetting(this.currentSelectedBrand);
        }
      } else {
        this.showNoBrandFound = true;
      }
    } else {
      // this.ShowManualTicketOption = false;
    }

    if (this.clickhouseEnabled)
    {
      this.selectedBrandList = JSON.parse(JSON.stringify(this._filterService.fetchedBrandData));
      this.currentSelectedBrand = this.selectedBrandList[0];
      this.getBrandEmailSetting(this.currentSelectedBrand);
      this.customChannels = this.customChannels.filter(res => res.channelName == 'Twitter' || res.channelName == 'News' || res.channelName == 'Discussion Forums' || res.channelName == 'Blogs' || res.channelName =='Youtube');
      this.selectedChannel = this.customChannels[0];
      // this.customChannels.push({
      //   channelName: 'Youtube',
      //   channelID: ChannelGroup.Youtube,
      //   channelImage: `assets/images/channelicons/Youtube.svg`,
      // })
      // this.tagCreateTokenBoolean = false;
    }

    this.loadChannelAccounts(this.currentSelectedBrand.brandID);
  }

  public get mediaTypeEnum(): typeof MediaEnum {
    return MediaEnum;
  }

  getBrandEmailSetting(brand: BrandList): void {
    const keyObj = {
      BrandID: brand.brandID,
      BrandName: brand.brandName,
    };
    this._ticketService.GetEmailSettingByBrand(keyObj).subscribe((resp) => {
      if (resp.success) {
        //emailIdList
        if (resp.data && resp.data.length > 0) {
          this.brandEmails = resp.data;
          this.savedBrandEmails = resp.data;
          this.filteredEmailOptions = this.brandEmails;
        } else {
          this.brandEmails = [
            { userName: '', emailId: 'Brand Email Not Found', settingId: 0 },
          ];
        }
      }
    });
  }

  selectCurrentBrand(brand: BrandList): void {
    this.currentSelectedBrand = brand;
    this.getBrandEmailSetting(brand);
    this.loadChannelAccounts(brand.brandID);
  }
  selectCurrentChannel(channel): void {
    this.selectedChannel = channel;
    this.postContentData = {
      profileImage: '',
      screenName: '',
      userName: '',
      followers: '',
      createdDate: '',
      postContentText: '',
      postContentImage: '',
      postContentType: '',
    };
    this.postContentYoutube = {
      profileImage: '',
      userName: '',
      viewCount: '',
      likeCount: '',
      commentCount: '',
      createdDate: '',
      description: '',
      thumbnailURL: '',
      title: '',
      url: '',
      comment: []
    }
    this.handleTagCreateToken()
    this.title=''
    this.bodyContentText=''
    this.authorName=''
    this.contentUrl = '';
  }

  handleTagCreateToken(){
    if (this.selectedChannel.channelName == 'Blogs' || this.selectedChannel.channelName == 'Complaint Website' || this.selectedChannel.channelName == 'Discussion Forums' || this.selectedChannel.channelName == 'News'){
      this.tagCreateTokenBoolean = false;
    } else{
      this.tagCreateTokenBoolean = true;
    }
  }

  add(event: MatChipInputEvent, fromwhere: string): void {
    const value = (event.value || '').trim();

    // Add our fruit
    if (fromwhere === 'to') {
      if (value && this.isEmail(value)) {
        this.toEmails.push({ name: value });
      }
      this.emailToInput.nativeElement.value = '';
    } else if (fromwhere === 'from') {
      if (value && this.isEmail(value)) {
        if (this.fromEmails.length > 0) {
          //error
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Please-enter-one-email-id'),
            },
          });
        } else {
          this.fromEmails.push({ name: value });
        }
      }
      this.emailFromInput.nativeElement.value = '';
    } else if (fromwhere === 'cc') {
      if (value && this.isEmail(value)) {
        this.emailCCEmails.push({ name: value });
      }

      this.emailccInput.nativeElement.value = '';
    } else if (fromwhere === 'bcc') {
      if (value && this.isEmail(value)) {
        this.emailBCCEmails.push({ name: value });
      }
      this.emailbccInput.nativeElement.value = '';
    }
  }

  remove(email: email, fromwhere: string): void {
    if (fromwhere === 'to') {
      const index = this.toEmails.indexOf(email);
      if (index >= 0) {
        this.toEmails.splice(index, 1);
      }
    } else if (fromwhere === 'from') {
      const index = this.fromEmails.indexOf(email);
      if (index >= 0) {
        this.fromEmails.splice(index, 1);
      }
    } else if (fromwhere === 'cc') {
      const index = this.emailCCEmails.indexOf(email);
      if (index >= 0) {
        this.emailCCEmails.splice(index, 1);
      }
    } else if (fromwhere === 'bcc') {
      const index = this.emailBCCEmails.indexOf(email);
      if (index >= 0) {
        this.emailBCCEmails.splice(index, 1);
      }
    }
    const emailIndex = this.savedBrandEmails.findIndex((obj) => {
      return obj.emailId == email.name;
    });
    const selectedEmail = this.savedBrandEmails.find((obj) => {
      return obj.emailId === email.name;
    });
    if (emailIndex > -1) {
      this.brandEmails.splice(emailIndex, 0, selectedEmail);
    }
  }

  isEmail(email): any {
    const regex =
      /^([a-zA-Z0-9_&#.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = (event.option.value || '').trim();
    if (value === 'Brand Email Not Found') {
      return;
    }
    const index = this.toEmails.indexOf(value);
    // Add our fruit
    if (value && index < 0) {
      for (const email of this.toEmails) {
        const findIndex = this.brandEmails.findIndex(
          (obj) => obj.emailId === email.name
        );
        if (findIndex > -1) {
          this.toEmails = this.toEmails.filter(
            (obj) => obj.name !== this.brandEmails[findIndex].emailId
          );
        }
      }
      this.toEmails.push({ name: value });
      const emailindex = this.brandEmails.findIndex(
        (obj) => obj.emailId === value
      );
      if (emailindex > -1) {
        this.settingId = this.brandEmails[emailindex].settingId;
      }
    }
    this.brandEmails = this.savedBrandEmails.filter(
      (obj) => obj.emailId != value
    );
    this.emailToInput.nativeElement.value = '';
  }

  openMediaDialog(): void {
    this.dialog.open(MediaGalleryComponent, {
      autoFocus: false,
      panelClass: ['full-screen-modal'],
    });
  }

  onImageDropped(event): void {
    this.imageLoader = true;
    if (event.addedFiles.length > 0) {
      // this.isImageDropped = true;
      this.filesUploaded.push(...event.addedFiles);
      // this.uploadLoading = true;
      this.uploadFilesToServer();
    }
  }

  uploadFilesToServer(): void {
    const keyObj = {
      brandInfo: {
        key: 'brandInfo',
        value: {
          BrandID: this.currentSelectedBrand.brandID,
          BrandName: this.currentSelectedBrand.brandName,
        },
        description: '',
        type: 'text',
        enabled: true,
      },
      IsFromManual: {
        IsFromManual: true,
      },
    };
    if (this.validateMediaFiles(this.filesUploaded)) {
      this._mediaGalleryService
        .uploadEmailFilesToServer(this.filesUploaded, keyObj)
        .subscribe(
          (data) => {
            this.filesUploaded = [];
            this.imageLoader = false;
            // console.log(`file data`, data);
            if (data.success) {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: this.translate.instant('File-uploaded-successfully'),
                },
              });
              this.AttachmentFile = this.AttachmentFile.concat(data.data);
              this.attachmentFileAsync.next(this.AttachmentFile);
            } else {
            }

            //this.uploadLoading = false;
          },
          (err) => {
            this.filesUploaded = [];
            this.imageLoader = false;
          }
        );
    } else {
      this.filesUploaded = [];
      this.imageLoader = false;
      // this.uploadLoading = false;
    }
  }

  removeFile(selectedImgObj) {
    this.AttachmentFile = this.AttachmentFile.filter(
      (imgObj) => imgObj.fileName !== selectedImgObj.fileName
    );
    this.attachmentFileAsync.next(this.AttachmentFile);
  }

  validateMediaFiles(filesToUpload: any[]): boolean {
    let isValid = true;
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    let excludedTypes = [
      '.exe',
      '.scr',
      '.vbs',
      '.rtf',
      '.rtx',
      '.msi',
      '.bat',
      '.js',
    ];
    let excludedMimeTypes = [
      'application/x-msdownload',
      'application/rtf',
      'text/richtext',
      'application/javascript',
    ];
    for (let i = 0; i < filesToUpload.length; i++) {
      let fileextension = '';
      const CurrentFile = filesToUpload[i];
      const isValidMimeType = excludedMimeTypes.filter(
        (an) => CurrentFile.type.toLowerCase() === an.toLowerCase()
      );
      if (isValidMimeType && isValidMimeType.length > 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Invalid-file-type-selected'),
          },
        });
        isValid = false;
        break;
      }
      const IsValidFiletype = excludedTypes.filter(
        (w) => CurrentFile.name.toLowerCase().indexOf(w.toLowerCase()) > -1
      );
      if (IsValidFiletype && IsValidFiletype.length > 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Invalid-file-type-selected'),
          },
        });
        isValid = false;
        break;
      }

      if (filesToUpload[i].type.indexOf('image') > -1) {
        fileextension = filesToUpload[i].name
          .substring(filesToUpload[i].name.lastIndexOf('.') + 1)
          .toLowerCase();
        if (
          fileextension !== 'gif' &&
          fileextension !== 'png' &&
          fileextension !== 'jpeg' &&
          fileextension !== 'jpg'
        ) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Uploaded-file-valid-image'),
            },
          });
          isValid = false;
          break;
        }
        if (filesToUpload[i].size > 5242880) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Image-size-should-less'),
            },
          });
          isValid = false;
          break;
        }
      } else if (filesToUpload[i].type.indexOf('video') > -1) {
        fileextension = filesToUpload[i].name
          .substring(filesToUpload[i].name.lastIndexOf('.') + 1)
          .toLowerCase();
        if (
          fileextension !== 'mp4' &&
          fileextension !== 'mov' &&
          fileextension !== 'avi' &&
          fileextension !== 'flv' &&
          fileextension !== 'wmv' &&
          fileextension !== 'mkv'
        ) {
          // WarningModal('Video file type should be MP4, MOV, AVI, WMV or MKV');
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Video-file-type'),
            },
          });
          isValid = false;
          break;
        }
        if (filesToUpload[i].size > 1073741824) {
          // WarningModal('Video size should be less than or equal to 1 GB.');
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Video-size-should-less'),
            },
          });
          isValid = false;
          break;
        }
      } else {
        if (filesToUpload[i].size > 5242880) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('File-size-should-less'),
            },
          });
          isValid = false;
          break;
        }
      }
    }
    return isValid;
  }

  callTagData(): void {
    const keyObj = {
      BrandID: Number(this.currentSelectedBrand.brandID),
      BrandName: this.currentSelectedBrand.brandName,
    };

    if (this.validateModelData()) {
      this._ticketService.GetCategoryConfig(keyObj).subscribe((resp) => {
        if (resp.success) {
          const Data: any = JSON.parse(resp.data);
          if (Data.catchAllCategory) {
            const baseMention: BaseMention = {};
            baseMention.brandInfo = {};
            baseMention.brandInfo.brandID = Number(
              this.currentSelectedBrand.brandID
            );
            baseMention.brandInfo.brandName =
              this.currentSelectedBrand.brandName;
            baseMention.ticketInfo = {};
            baseMention.ticketInfo.ticketCategoryMap = [];
            baseMention.ticketInfo.ticketUpperCategory = {};
            this._postDetailService.categoryType = 'ticketCategory';
            this._postDetailService.postObj = baseMention;
            const manualdata: ManualTicketData = {};
            manualdata.isFromManual = true;
            manualdata.catchAllCategory = Data.catchAllCategory;
            let dialogRef = this.dialog.open(CategoryFilterComponent, {
              width: '73vw',
              disableClose: false,
              data: { manualTicketData: manualdata, manualCreationFlag: true },
            });
          }
        }
      });
    }
  }

  checkIfPostDeleted(){
    if (this.contentUrl.length==0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Content-url-should-not-be-empty'),
        },
      });
      return;
    }
    if (!this.checkUrl(this.contentUrl)){
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-enter-a-valid-url'),
        },
      });
      return;
    }
    if (this.selectedChannel.channelName == 'Blogs' || this.selectedChannel.channelName == 'Complaint Website' || this.selectedChannel.channelName == 'Discussion Forums' || this.selectedChannel.channelName == 'News'){
     this.isActionable = false;
      if(this.title.length==0){
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Title-should-not-be-empty'),
          },
        });
        return;
      }
      if (this.bodyContentText.length == 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Content-should-not-be-empty'),
          },
        });
        return;
      }
      if (this.authorName.length == 0 && this.selectedChannel.channelName != 'Discussion Forums') {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Author-should-not-be-empty'),
          },
        });
        return;
      }
      if (this.postedDate.length == 0) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Date-should-not-be-empty'),
          },
        });
        return;
      }

      if (this.isFutureDateTime(this.postedDate?.startDate?.toString())) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Date-cannot-be-future'),
          },
        });
        return;
      }
    }
    const keyObj = {
      "brandInfo": {
        "BrandID": this.currentSelectedBrand.brandID,
        "BrandName": this.currentSelectedBrand.brandName
      },
      "channelGroup": this.selectedChannel.channelID,
      "postDetails": {
        "TweetID": this.selectedChannel.channelID == 2? this.postContentFullDetails?.fbFeedID :this.postContentFullDetails?.tweetID,
        "URL": this.selectedChannel.channelID == 4 ? this.postContentYoutube.url : this.postContentFullDetails?.url ? this.postContentFullDetails?.url:this.contentUrl,
        "Title": this.title,
        "UserLocation": this.postContentFullDetails?.userLocation,
        "CreatedDate": this.postContentFullDetails?.createDate
      }
    }
    this._filterService.checkIfPostDeleted(keyObj).subscribe((res:any)=>{
      if(res.success) {
        if (!this.clickhouseEnabled)
        {
        const brandInfo = {
          BrandID: Number(this.currentSelectedBrand.brandID),
          BrandName: this.currentSelectedBrand.brandName,
        };
        this._ticketService.GetCategoryConfig(brandInfo).subscribe((resp) => {
          if (resp.success && resp.data.length > 0) {
            const Data: any = JSON.parse(resp.data);
            if (Data.catchAllCategory) {
              const baseMention: BaseMention = {};
              baseMention.brandInfo = {};
              baseMention.brandInfo.brandID = Number(
                this.currentSelectedBrand.brandID
              );
              baseMention.brandInfo.brandName =
                this.currentSelectedBrand.brandName;
              baseMention.ticketInfo = {};
              baseMention.ticketInfo.ticketCategoryMap = [];
              baseMention.ticketInfo.ticketUpperCategory = {};
              this._postDetailService.categoryType = 'ticketCategory';
              this._postDetailService.postObj = baseMention;
              const manualdata: ManualTicketData = {};
              manualdata.isFromManual = true;
              manualdata.catchAllCategory = Data.catchAllCategory;
              let dialogRef = this.dialog.open(CategoryFilterComponent, {
                width: '73vw',
                disableClose: false,
                data: { manualTicketData: manualdata, manualCreationFlag: true },
              });
            } else{
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: res.message ? res?.message : this.translate.instant('Catch-All-Category-are-empty-for-this-brand'),
                },
              });
            }
          } else{
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: res.message ? res?.message : this.translate.instant('Catch-All-Category-are-empty-for-this-brand'),
              },
            });
          }
        });
      }else{
          this.SaveAddContentTaggedCategory(null)
      }
      } else{
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: res.message ?res?.message:this.translate.instant('Post-already-deleted'),
            },
          });
      }

    })
  }
  SaveAddContentTaggedCategory(obj:any){
    if (obj && !obj?.uppercategory){
      obj.uppercategory = {
        "brandInfo": null,
        "id": 0,
        "name": null,
        "userID": null
      }
    }
    let dataJson:string='';
    this._ticketService.manualTicketData.next(null);
    switch (this.selectedChannel.channelID) {
      case 1:
        dataJson = JSON.stringify(this.postContentFullDetails)
        break;
      case 2:
        dataJson = JSON.stringify(this.postContentFullDetails)
        break;
      case 13:
        let dDF = {
          "DBPID": 0,
          "DBTitle": this.title,
          "DBContent": this.bodyContentText,
          "DBURL": this.contentUrl,
          "RecordDate": this.clickhouseEnabled ? moment(this.postedDate?.startDate?.toString()).utc().format("YYYY-MM-DD HH:mm:ss") :moment(this.postedDate).format("DD-MM-YYYY HH:mm:ss"),
          "SRID": "878866"
        }
        dataJson = JSON.stringify(dDF)
        break;
      case 4:
      dataJson ='';
      break;
      case 9:
        let dB = {
          "BlogTitle": this.title,
          "BlogContent": this.bodyContentText,
          "Author": this.authorName,
          "BlogURL": this.contentUrl,
          "PostURL": this.contentUrl,
          "PublishedDate": this.clickhouseEnabled ? moment(this.postedDate?.startDate?.toString()).utc().format("YYYY-MM-DD HH:mm:ss") :moment(this.postedDate).format("DD-MM-YYYY HH:mm:ss"),
          "DBURL": this.contentUrl,
          "RecordDate": this.clickhouseEnabled ? moment(this.postedDate?.startDate?.toString()).utc().format("YYYY-MM-DD HH:mm:ss") :moment(this.postedDate).format("DD-MM-YYYY HH:mm:ss"),
          "SRID": "878866"
        }
        dataJson = JSON.stringify(dB)
        break;
      case 11:
        let dCW = {
          "ID": 0,
          "DBTitle": this.title,
          "DBContent": this.bodyContentText,
          "DBURL": this.contentUrl,
          "RecordDate": this.clickhouseEnabled ? moment(this.postedDate?.startDate?.toString()).utc().format("YYYY-MM-DD HH:mm:ss") :moment(this.postedDate).format("DD-MM-YYYY HH:mm:ss"),
          "Author": this.authorName,
          "SRID": "878866"
        }
        dataJson = JSON.stringify(dCW)
        break;
      case 19:
        let dN = {
          "NewsID": 0,
          "DBTitle":this.title,
          "DBContent":this.bodyContentText,
          "DBURL":this.contentUrl,
          "Author": this.authorName,
          "RecordDate": this.clickhouseEnabled ? moment(this.postedDate?.startDate?.toString()).utc().format("YYYY-MM-DD HH:mm:ss") :moment(this.postedDate).format("DD-MM-YYYY HH:mm:ss"),
          "SRID": "878866"
        }
        dataJson = JSON.stringify(dN)
        break;
      default:
        break;
    }
    const keyObj ={
      "Category": obj?.categorydata,
      "IsActionable": this.isMention ? false : this.isActionable,
      "brandInfo": {
        "BrandID": this.currentSelectedBrand.brandID,
        "BrandName": this.currentSelectedBrand.brandName
      },
      "upperCategory": obj?.uppercategory,
      "ChannelType":this.selectedChannel.channelID,
      "DataJson": dataJson,
      "YoutubeJson": this.selectedChannel.channelID==4?JSON.stringify(this.postContentFullDetails):'',
      "TripAdvisorJson": ""
    }
    this._filterService.saveAddContentTaggedCategory(keyObj).subscribe((resp:any)=>{
    if (resp.success) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: this.clickhouseEnabled ? this.translate.instant('Mention-created-successfully') : this.translate.instant('Ticket-created-successfully'),
        },
      });
      this.dialogRef.close();
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Some-Error-Occurred'),
        },
      });
    }
    })

  }

  validateModelData(): boolean {
    let status = true;

    // check fromemail
    if (!this.checkValidUserName()) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-enter-valid-username'),
        },
      });
      return false;
    }
    if (this.fromEmails.length > 0) {
      status = true;
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-enter-from-email-address'),
        },
      });
      return false;
    }
    // check toEmail
    if (this.toEmails.length > 0) {
      let atleastOneBrandEmail = false;
      for (const email of this.toEmails) {
        const findIndex = this.savedBrandEmails.findIndex(
          (obj) => obj.emailId === email.name
        );
        if (findIndex > -1) {
          atleastOneBrandEmail = true;
          status = true;
          break;
        }
      }
      if (!atleastOneBrandEmail) {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Please select atleaset one email'),
          },
        });
        return false;
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-enter-to-email-address'),
        },
      });
      return false;
    }

    // check subject
    if (this.emailSubject && this.emailSubject !== '') {
      status = true;
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-enter-subject-line'),
        },
      });
      return false;
    }

    // check body
    if (this.emailReplyText && this.emailReplyText !== '') {
      status = true;
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-write-email-body'),
        },
      });
      return false;
    }

    return status;
  }

  tagAndCreateTicket(obj) {
    if (this.selectedChannel.channelID != 25){
      this.SaveAddContentTaggedCategory(obj)
      return false;
    }
    this._ticketService.manualTicketData.next(null);
    this.CreateManualTicketParam.brandDetails = {
      brandID: Number(this.currentSelectedBrand.brandID),
      brandName: this.currentSelectedBrand.brandName,
    };
    this.CreateManualTicketParam.channelGroup = ChannelGroup.Email;
    this.CreateManualTicketParam.channelType = ChannelType.Email;
    this.CreateManualTicketParam.upperCategoryId = obj?.uppercategory?.id;

    this.CreateManualTicketParam.isActionable = this.isMention ? false : true;

    const frommails = this.fromEmails.map((obj) => obj.name).join();
    const tomails = this.toEmails.map((obj) => obj.name).join();
    const ccmails = this.emailCCEmails.map((obj) => obj.name).join();
    const bccmails = this.emailBCCEmails.map((obj) => obj.name).join();

    var temporalDivElement = document.createElement('div');
    // Set the HTML content with the providen
    temporalDivElement.innerHTML = this.emailReplyText;
    // Retrieve the text property of the element (cross-browser support)
    const textContent = temporalDivElement.textContent;

    const MentionJson = {
      BrandID: Number(this.currentSelectedBrand.brandID),
      BrandName: this.currentSelectedBrand.brandName,
      ChannelGroup: 25,
      FromMail: frommails,
      ToMail: tomails,
      CcList: ccmails,
      BccList: bccmails,
      Subject: this.emailSubject,
      EmailContent: textContent,
      EmailContentHtml: this.emailReplyText,
      SettingId: this.settingId,
      Attachments: [],
      ChannelType: ChannelType.Email,
      FromUserName: this.userName,
    };
    this.CreateManualTicketParam.mentionJson = JSON.stringify(MentionJson);
    this.CreateManualTicketParam.categoryMapJsonData = JSON.stringify(
      this.mapCategoryMap(obj.categorydata)
    );
    //
    if (this.AttachmentFile.length > 0) {
      this.CreateManualTicketParam.attachments = this.mapAttachmentFiles();
    }

    this._ticketService
      .CreateManualTicket(this.CreateManualTicketParam)
      .subscribe((resp) => {
        if (resp.success) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Ticket-created-successfully'),
            },
          });
          this.dialogRef.close();
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Some-Error-Occurred'),
            },
          });
        }
      });
  }

  mapAttachmentFiles(): UgcMention[] {
    const ugcMentionArray: UgcMention[] = [];

    for (const ugcObj of this.AttachmentFile) {
      const currentObj: UgcMention = {};
      currentObj.$type =
        'LocobuzzNG.Entities.Classes.ViewModel.UgcMention, LocobuzzNG.Entities';
      currentObj.displayFileName = ugcObj.originalFileName;
      currentObj.uGCMediaUrl = ugcObj.path;
      currentObj.uGCMediaType = ugcObj.mediaType;
      ugcMentionArray.push(currentObj);
    }

    return ugcMentionArray;
  }

  mapCategoryMap(catObj: any): any {
    const categoryArray: any[] = [];
    for (const catOne of catObj) {
      const levelOne = catOne;

      let levelOneObj = {
        CategoryID: catOne.id,
        category: catOne.name,
        Sentiment: catOne?.sentiment,
        depatments: [],
      };
      if (catOne.subCategories && catOne.subCategories.length > 0) {
        for (const catTwo of catOne.subCategories) {
          const leveltwo = catTwo;

          let levelTwoObj = {
            DepartmentID: catTwo.id,
            DepartmentName: catTwo.name,
            LabelID: catOne.id,
            DepartmentSentiment: catTwo?.sentiment,
            SubCategories: [],
          };

          if (catTwo.subSubCategories && catTwo.subSubCategories.length > 0) {
            for (const catThree of catTwo.subSubCategories) {
              const levelthree = catThree;

              let levelThreeObj = {
                SubCategoryID: catThree.id,
                SubCategoryName: catThree.name,
                SubCategorySentiment: catThree?.sentiment,
                DepartmentID: catTwo.id,
                LabelID: catOne.id,
              };

              levelTwoObj.SubCategories.push(levelThreeObj);
            }
          } else {
          }
          levelOneObj.depatments.push(levelTwoObj);
        }
      } else {
      }

      // push Object;
      categoryArray.push(levelOneObj);
    }

    return categoryArray;
  }

  checkValidUserName(): boolean {
    const re = /^[a-zA-Z ]*$/;
    let isvalid = true;
    if (this.userName) {
      if (re.test(this.userName)) {
      } else {
        isvalid = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Please-enter-valid-username'),
          },
        });
      }
    }
    return isvalid;
  }

  closingMatDialogue(): void {
    const message = '';
    if (
      this.userName != '' ||
      this.fromEmails.length > 0 ||
      this.toEmails.length > 0 ||
      this.emailSubject != '' ||
      this.emailReplyText != ''
    ) {
      const dialogData = new AlertDialogModel(
        this.translate.instant('By-closing-changes'),
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
          // this.ssreLiveWrongKeep();
          this.dialogRef.close();
        } else {
          // this.ssreLiveWrongDelete();
        }
      });
    } else {
      this.dialogRef.close();
    }
  }
  checkCcBccEmpty(): void {
    // check CC & Bcc empty or not
    if (this.emailCCEmails.length > 0) {
      this.sendEmailcc = true;
    } else {
      this.sendEmailcc = false;
    }
    if (this.emailBCCEmails.length > 0) {
      this.sendEmailBcc = true;
    } else {
      this.sendEmailBcc = false;
    }
  }
  checkTicketEmailCc(): void {
    // focus on cc email field
    this.sendEmailcc = true;
    this._ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        if (this.emailccInput) {
          this.emailccInput.nativeElement.focus();
        }
      });
    });
  }
  checkTicketEmailBcc(): void {
    // focus on bcc email field
    this.sendEmailBcc = true;
    this._ngZone.runOutsideAngular(() => {
      requestAnimationFrame(() => {
        if (this.emailbccInput) {
          this.emailbccInput.nativeElement.focus();
        }
      });
    });
  }

  openAttachements(data) {
    data['name'] = data.originalFileName;
    data['mediaUrl'] = data.path;
    const attachments = [data];
    this.dialog.open(VideoDialogComponent, {
      panelClass: 'overlay_bgColor',
      data: attachments,
      autoFocus: false,
    });
  }

  drop(event): void {
    if (event?.data?.dataTransfer?.$?.files) {
      const files = event?.data?.dataTransfer?.$?.files;
      if (files) {
        this.ckEditorLoader = true;
        this.base64ImageArray = [];
        this.uploadedServerLink = [];
        Object.values(files).forEach((mediaObj) => {
          this.fileToBase64(mediaObj).then((result) => {
            this.base64ImageArray.push(result);
            const base64String = result
              .replace('data:', '')
              .replace(/^.+,/, '');
            const obj = {
              Image: base64String,
              Imagelocation: ImageEditorEnum.EmailContent,
            };
            this.accountSettingService
              .UploadUserProfilePicOnS3(obj)
              .subscribe((result) => {
                if (result.success) {
                  this.uploadedServerLink.push(result.data);
                  if (
                    this.uploadedServerLink.length ==
                    this.base64ImageArray.length
                  ) {
                    this.base64ImageArray.forEach((mediaString, index) => {
                      this.emailReplyText = this.emailReplyText.replace(
                        mediaString,
                        this.uploadedServerLink[index]
                      );
                    });
                    this.ckEditorLoader = false;
                  }
                }
              });
          });
        });
      }
    }
  }

  paste(event): void {
    console.log(event);
    if (event?.data?.dataValue) {
      let htmlValue: string = event.data.dataValue;
      if (htmlValue && htmlValue.includes('<img')) {
        this.ckEditorLoader = true;
        htmlValue = htmlValue.replace('<img src="', '');
        htmlValue = htmlValue.replace('" />', '');
        htmlValue = htmlValue.trim();
        const base64String = htmlValue.replace('data:', '').replace(/^.+,/, '');
        const obj = {
          Image: base64String,
          Imagelocation: ImageEditorEnum.EmailContent,
        };
        this.accountSettingService
          .UploadUserProfilePicOnS3(obj)
          .subscribe((result) => {
            if (result.success) {
              this.emailReplyText = this.emailReplyText.replace(
                htmlValue,
                result.data
              );
              this.ckEditorLoader = false;
            }
          });
      }
    }
  }

  fileToBase64 = (file: any): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.toString());
      reader.onerror = (error) => reject(error);
    });
  };
  showNoRecordFoundOnSearch(word: string, label: string) {
    switch (label) {
      case 'brands':
        if (this.selectedBrandList?.filter((r) => r?.brandFriendlyName?.toLowerCase()?.includes(word?.toLowerCase()))?.length == 0) {
          this.showNoBrandFound = true
        } else {
          this.showNoBrandFound = false
        }
        break;
  }
}
  _handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === 32) {
      // do not propagate spaces to MatSelect, as this would select the currently active option
      event.stopPropagation();
    }
  }
  dateChange(value, dateType: string) {
    if (value) {
      let date: any = moment(value);
      let dateDifference;
      if (dateType == 'startDate') {
        // this.selectedStartDate.startDate = date;
        // this.selectedStartDate.endDate = date;
        // this.endMinDate = value.toLocaleDateString();
        // dateDifference = (this.selectedEndDate?.endDate?._d.getTime() - this.selectedStartDate?.endDate?._d.getTime()) / 1000;
        // dateDifference /= 60 * 60 * 24 * 7 * 4;
        // console.log(dateDifference);
        // if (dateDifference < 0) {
        //   this.selectedEndDate.startDate = date;
        //   this.selectedEndDate.endDate = date;
        // }
      } else if (dateType == 'endDate') {
        // this.selectedEndDate.startDate = date;
        // this.selectedEndDate.endDate = date;
      }
      // if (new Date(this.selectedStartDate.startDate) > new Date(this.selectedEndDate.endDate)) {
      //   this.dateTimeErrorMsg = 'start ( date & time ) cannot be greater than end ( date & time )';
      // } else {
      //   this.dateTimeErrorMsg = '';
      // }
    }
  }
  private xmlToJson(xml: string): any {
    const xmlString = xml;
    // Create a new DOMParser object
    const parser = new DOMParser();

    // Parse the XML string to a DOM tree
    const dom = parser.parseFromString(xmlString, 'application/xml');

    // Get the root element of the DOM tree
    const attachmentsElement = dom.documentElement;

    // Create an empty JavaScript object to store the converted data
    const attachments = { Item: [] };

    // Traverse the child nodes of the root element to build the JavaScript object
    for (let i = 0; i < attachmentsElement.childNodes.length; i++) {
      const itemElement = attachmentsElement.childNodes[i];
      if (itemElement.nodeType === Node.ELEMENT_NODE) {
        const item = {};
        for (let j = 0; j < itemElement.childNodes.length; j++) {
          const propertyElement:any = itemElement.childNodes[j];
          if (propertyElement.nodeType === Node.ELEMENT_NODE) {
            item[propertyElement.tagName] = propertyElement.textContent;
          }
        }
        attachments.Item.push(item);
      }
    }
    return attachments;
  }

  openNewWindow(url){
    window.open(url, '_blank')
  }
  checkLinkTag(description: string): string {
    // const myArray = description.split(' ');
    const words = description
      .replace(/\n/g, '<br>\n')
      .split(/\s+/)
      .map((word) => {
        if (this.checkUrl(word)) {
          word =
            `<a class="user-tag" target="_blank" href="${word.replace(
              '<br>',
              ''
            )}">` +
            word +
            '</a>';
        }
        if (!word.includes('<br>')) word = word + ' ';
        return word;
      });
    description = '';
    words.forEach((res) => {
      description += res + ' ';
    });
    return description.trim();
  }
  checkHashTag(description: string): string {
    const words = description
      .replace(/\n/g, '<br>\n')
      .split(/\s+/)
      .map((word) => {
        if (word.startsWith('#') || word.includes('<br>#')) {
          if (word?.replace('<br>', '')) {
            word = '<span class="user-tag">' + word + '</span>';
          } else if (!word.includes('<br>')) {
            word = '<span class="user-tag">' + word + '</span>';
          }
        }
        if (
          !word.startsWith('<br>') &&
          word.includes('<br>') &&
          !word.endsWith('<br>')
        )
          word = word + ' ';
        else if (!word.includes('<br>')) word = word + ' ';
        return word;
      });
    description = '';
    words.forEach((word) => {
      description += word.startsWith('<span') ? ' ' + word : word;
    });
    return description.trim();
  }

  isFutureDateTime(inputDateTime) {
    // Parse the input date-time string to a Date object
    const currentDateTime = new Date();
    const inputDateTimeObject = new Date(inputDateTime);

    // Compare the input date-time with the current date-time
    return inputDateTimeObject > currentDateTime;
  }
 

  autoGrowHeight(textarea)
  {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
   }

  getYouTubeVideoId(url):string {
    if (url.includes('/shorts')) {
      // Regular expression to match YouTube video ID
      const regex = /(?:youtube\.com\/shorts\/)([A-Za-z0-9_-]{11})/;

      // Extract video ID using the regular expression
      const match = url.match(regex);

      // If a match is found, return the video ID, otherwise return null
      return match ? match[1] : null;
    } else{
      // Regular expression to match YouTube video ID
      const regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

      // Extract video ID using the regular expression
      const match = url.match(regex);

      // If a match is found, return the video ID, otherwise return null
      return match ? match[1] : null;
    }
  }

  isValidFacebookUrl(url) {
    const facebookBaseUrlRegex = /^https?:\/\/(?:www\.)?facebook\.com\/?/;
    return facebookBaseUrlRegex.test(url);
  }

  loadChannelAccounts(brandId?: number) {
    this.channelLoader = true
    this.cdk.detectChanges();
    let obj = {
      brandID: Number(brandId),
      channelenum: 0,
      pageOffSet: 0,
      pageSize: 0,
      searchText: null
    };

    if (obj?.brandID) {
      this.subs.add(
        this._channelConfigurationService
          .GetAccountsForManualTicket(obj)
          .subscribe((result) => {
            if(result?.success) {
              const channels: any = ['Twitter', 'Facebook', 'Youtube'];
              for (const ch of channels) {
                const channelWiseData = result?.data[ch];
                const isTherePrivateAccount: boolean = channelWiseData?.some(acc => acc.accountStatus === 'Authorized');
                const channelIndex = this.customChannels.findIndex(c => c.channelName === ch);
                if (channelIndex !== -1) {
                  this.customChannels[channelIndex]['isDisabled'] = !isTherePrivateAccount;
                }
              }
              this.selectedChannel = this.customChannels.find(channel => !channel.isDisabled);;
            }
            this.channelLoader = false;
            this.cdk.detectChanges();
          })
      );
    }
  }
}

