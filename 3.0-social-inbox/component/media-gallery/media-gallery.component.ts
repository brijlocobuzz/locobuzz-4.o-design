import { E, I } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locobuzzAnimations } from '@locobuzz/animations';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelImage } from 'app/core/enums/ChannelImgEnum';
import { ChannelType } from 'app/core/enums/ChannelType';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BrandInfo } from 'app/core/models/viewmodel/BrandInfo';
import { GenericRequestParameters } from 'app/core/models/viewmodel/GenericRequestParameters';
import { MediaFilterSorting } from 'app/core/models/viewmodel/MediaFilterSorting';
import { MediaGalleryFilter } from 'app/core/models/viewmodel/MediaGalleryFilter';
import { MediaGalleryParameters } from 'app/core/models/viewmodel/MediaGalleryParameters';
import { LocobuzzMediaError, UGCBrandMentionInformation } from 'app/core/models/viewmodel/UGCBrandMentionInformation';
import {
  UgcMention,
  UgcMentionTextData,
} from 'app/core/models/viewmodel/UgcMention';
import { AccountService } from 'app/core/services/account.service';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import {
  BrandList,
  brandSearchList,
} from 'app/shared/components/filter/filter-models/brandlist.model';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import {
  MediaInfoDurations,
  mediaValidation,
} from 'app/social-schedule/component/socialpost/composePostInterface';
import { emitKeypressEvents } from 'readline';
import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { GalleryPreviewComponent } from '../gallery-preview/gallery-preview.component';
import { MediaDropzoneComponent } from '../media-dropzone/media-dropzone.component';
import { notificationType } from './../../../core/enums/notificationType';
import { CustomSnackbarComponent } from './../../../shared/components/custom-snackbar/custom-snackbar.component';
import { LoaderService } from './../../../shared/services/loader.service';
import { MediaDropitemComponent } from './../media-dropitem/media-dropitem.component';
import { ChannelConfigurationService } from 'app/accounts/services/channel-configuration.service';
import { SocialScheduleService } from 'app/social-schedule/social-schedule.service';
import { AddCaptionComponent } from './add-caption/add-caption.component';
import { TranslateService } from '@ngx-translate/core';
import { saveAs } from 'file-saver';

@Component({
    selector: 'app-media-gallery',
    templateUrl: './media-gallery.component.html',
    styleUrls: ['./media-gallery.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class MediaGalleryComponent implements OnInit, OnDestroy {
  attchEnableFlag: boolean = false;
  attchButtonLoader: boolean = false;
  UGCMentionObj: UGCBrandMentionInformation;

  UGCMentionList = new Subject<UgcMention[]>();
  UGCMentionList$ = this.UGCMentionList.asObservable();
  clickedFromMediaGallery = false;
  selectedMedia: number = 0;
  mediaGalleryFilter: MediaGalleryFilter;
  selectedUgcPost: string[] = [];
  mediaFilterSorting: MediaFilterSorting;
  ugcMentionTextData: UgcMentionTextData[] = [];
  showLoadMore = true;
  noDataFound = false;
  loaderTypeEnum = loaderTypeEnum;
  mediaValidation: mediaValidation[] = [];
  brandInfo: BrandInfo;
  mediaGalleryFlag: boolean = false;
  brandList: brandSearchList[] = [];
  selectedBrandDetails: brandSearchList;
  searchTempBrandList: brandSearchList[] = [];
  inputSearchField: string = '';
  selectOrder: number = 0;
  brandId: string | number;
  defaultLayout: boolean = false;
  constructor(
    private dialog: MatDialog,
    private _filterService: FilterService,
    private _postDetailService: PostDetailService,
    private _mediaGalleryService: MediagalleryService,
    private changeDetector: ChangeDetectorRef,
    private replyService: ReplyService,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MediaGalleryComponent>,
    private _loaderService: LoaderService,
    private _ticketService: TicketsService,
    private _footericonService: FootericonsService,
    private _accountService: AccountService,
    private _channelConfigurationService: ChannelConfigurationService,
    private socialScheduleSevice: SocialScheduleService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public socialPostdata: any
  ) {
    this.mediaGalleryFilter = new MediaGalleryFilter();
    this.mediaFilterSorting = new MediaFilterSorting();
  }
  whatsappTemplateType:string =  '';
  isActive: boolean = false;
  MediaSection = ['Media', 'UGC'];
  activeSection = this.MediaSection[0];
  subs = new SubSink();
  searchText = '';
  recordOffset = 0;
  mediaGalleryLoading: boolean = false;
  ugcTextChecked = true;
  ugcMediachecked = false;
  currentUser: AuthUser;
  listOfMediaSelected = [];
  getMediaInfo: MediaInfoDurations;
  channelGroupEnum = ChannelGroup;
  ugcChannelIcon: any
  caption:string = '';
  ngOnInit(): void {
    this.subs.add(
      this._channelConfigurationService.selectWhatsappTemplateMedia.subscribe(res => {
        if (res) {
          this.whatsappTemplateType = res;
          this._channelConfigurationService.selectWhatsappTemplateMedia.next(null);
        }
      })
    );

    // this._mediaGalleryService.LoadMediaGallery.subscribe(
    // (value) => {
    // if (value) {
    if (this._postDetailService.postObj) {
      this.ugcChannelIcon =
        ChannelImage[ChannelGroup[this._postDetailService.postObj.channelGroup]];

      if (this._postDetailService.postObj.channelGroup == this.channelGroupEnum.GoogleBusinessMessages) {
        this.setCustomFilterBasedOnMediaType(this.mediaTypeEnum.IMAGE);
        this.mediaValidation.push({
          imageCount: 1,
          videoCount: 0,
          bothFlag: false,
          totalCount: 1,
          channelName: 'GMB',
          unlimitedAccess: false,
        });
      }
    }
 
    if (this.socialPostdata && this.socialPostdata?.type == 'WhatsappGallery'){
      this.activeSection = this.MediaSection[0];
      this.mediaFilterSorting.mediaType =
        this.mediaFilterSorting.mediaType.filter((obj) => {
          return +obj.value === this.socialPostdata.mediaType;
        });
      this.mediaFilterSorting.mediaType.forEach((obj) => (obj.checked = true));
      this.mediaGalleryFilter.mediaTypes = [this.socialPostdata.mediaType];
      if (this.socialPostdata.mediaType == this.mediaTypeEnum.FILE) {
        this.mediaGalleryFilter.mediaTypes = [this.mediaTypeEnum.FILE, this.mediaTypeEnum.DOC, this.mediaTypeEnum.PDF,this.mediaTypeEnum.EXCEL];
      }
    }
    if (this.socialPostdata && this.socialPostdata?.type == 'SocialGallery') {
      this.setCustomFilterBasedOnMediaType(this.socialPostdata.mediaType);
      this.mediaValidation = this.socialPostdata?.attachmentValidation;
    }
    if (this.socialPostdata && this.socialPostdata?.type == 'SocialGalleryStory') {
      this.setCustomFilterBasedOnMediaType(this.socialPostdata.mediaType);
      this.mediaValidation = this.socialPostdata.attachmentValidation;
    }
    if (this.socialPostdata && this.socialPostdata?.type == 'MediaGallery') {
      this.mediaGalleryFlag = true;
      this.brandList = [];
      if (
        this._filterService.fetchedBrandData &&
        this._filterService.fetchedBrandData.length > 0
      ) {
        this._filterService.fetchedBrandData.map((obj) => {
          this.brandList.push({
            brandFriendlyName: obj.brandFriendlyName,
            brandID: obj.brandID,
            imgUrl: obj.rImageURL,
          });
          this.searchTempBrandList.push({
            brandFriendlyName: obj.brandFriendlyName,
            brandID: obj.brandID,
            imgUrl: obj.rImageURL,
          });
        });
        this.selectedBrandDetails = this.brandList[0];
      }
    }

    // Set media types based on selected media before loading gallery
    this.setMediaTypesBasedOnSelectedMedia();

    this.loadMediaGallery();
    this.subscribetoDropzoneEvent();
    this.subscribeToLoadMediaGallery();
    !this.socialPostdata ? this.setCustomFiltersBasedOnMention() : '';
    //  }
    // }
    // );
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));

  }

  addCaption() {
    const dialogRef = this.dialog.open(AddCaptionComponent, {
      width: '40vw',
      height: '320px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (result == 'without'){
          this.attachMediaToReply(true);
        }else {
          this.caption = result;
          this.attachMediaToReply(true);
        }
      }
    });
  }
  subscribeToLoadMediaGallery(): void {
    this.subs.add(
      this._mediaGalleryService.LoadMediaGallery.subscribe((value) => {
        if (value) {
          this.loadMediaGallery(true);
        }
      })
    );
  }

  openMediaDropzone(): void {
    this.clickedFromMediaGallery = false;
    this.dialog.open(MediaDropzoneComponent, {
      autoFocus: false,
      data:
        this.socialPostdata?.type == 'MediaGallery'
          ? this.selectedBrandDetails
          : this.socialPostdata,
      width: '900px',
      disableClose: true,
    });
  }

  setCustomFiltersBasedOnMention(): void {
    if (this._postDetailService.postObj.channelGroup === ChannelGroup.Twitter) {
      // remove file if twitter
      this.mediaFilterSorting.mediaType =
        this.mediaFilterSorting.mediaType.filter((obj) => {
          return +obj.value !== 19;
        });
    }
    if (
      this._postDetailService.postObj.channelGroup === ChannelGroup.Facebook ||
      this._postDetailService.postObj.channelGroup === ChannelGroup.Twitter
    ) {
    } else {
      this.MediaSection.splice(1, 1);
    }

    if (this._postDetailService.postObj.channelType === ChannelType.InstagramMessages) {
      this.mediaFilterSorting.mediaType =
        this.mediaFilterSorting.mediaType.filter((obj) => {
          return +obj.value === 2 || +obj.value === 3;
        });
    }
  }

  setCustomFilterBasedOnMediaType(mediaType: MediaEnum): void {
    if(mediaType==MediaEnum.ALBUM){
      this.mediaFilterSorting.mediaType =
        this.mediaFilterSorting.mediaType.filter((obj) => {
          return +obj.value === 2 || +obj.value === 3;
        });
      this.mediaFilterSorting.mediaType.forEach((obj) => (obj.checked = true));
      this.mediaGalleryFilter.mediaTypes = [2,3];
    } else{
      this.mediaFilterSorting.mediaType =
      this.mediaFilterSorting.mediaType.filter((obj) => {
        return +obj.value === mediaType;
      });
      this.mediaFilterSorting.mediaType.forEach((obj) => (obj.checked = true));
      this.mediaGalleryFilter.mediaTypes = [mediaType];
    }
  }

  public get mediaTypeEnum(): typeof MediaEnum {
    return MediaEnum;
  }

  /**
   * Set media types and filters based on currently selected media
   * This function is called in ngOnInit before loadMediaGallery
   */
  private setMediaTypesBasedOnSelectedMedia(): void {
    // Check if we have selected note media
    if (this._mediaGalleryService?.selectedNoteMedia?.length > 0) {
      this.setMediaTypeFilters(this._mediaGalleryService.selectedNoteMedia);
    }
    // Check if we have selected regular media
    else if (this._mediaGalleryService?.selectedMedia?.length > 0) {
      this.setMediaTypeFilters(this._mediaGalleryService.selectedMedia);
    }
  }

  /**
   * Helper function to set media type filters based on selected media array
   */
  private setMediaTypeFilters(selectedMediaArray: any[]): void {
    this.mediaFilterSorting?.mediaType?.forEach((x) => {
      if (x.value == 2 && selectedMediaArray?.some((y) => y.mediaType == MediaEnum.IMAGE)) {
        x.checked = true;
        if (!this.mediaGalleryFilter?.mediaTypes?.includes(2)) {
          this.mediaGalleryFilter?.mediaTypes?.push(2);
        }
      } else if (x.value == 3 && selectedMediaArray?.some((y) => y.mediaType == MediaEnum.VIDEO || y.mediaType == MediaEnum.ANIMATEDGIF)) {
        x.checked = true;
        if (!this.mediaGalleryFilter?.mediaTypes?.includes(3)) {
          this.mediaGalleryFilter?.mediaTypes?.push(3);
        }
        if (!this.mediaGalleryFilter?.mediaTypes?.includes(7)) {
          this.mediaGalleryFilter?.mediaTypes?.push(7);
        }
      } else if (x.value == 8 && selectedMediaArray?.some((y) => y.mediaType == MediaEnum.PDF)) {
        x.checked = true;
        if (!this.mediaGalleryFilter?.mediaTypes?.includes(MediaEnum.PDF)) {
          this.mediaGalleryFilter?.mediaTypes?.push(MediaEnum.PDF);
        }
      } else if (x.value == 19 && selectedMediaArray?.some((y) => 
        y.mediaType == MediaEnum.DOC || 
        y.mediaType == MediaEnum.EXCEL || 
        y.mediaType == MediaEnum.PDF || 
        y.mediaType == MediaEnum.FILE || 
        y.mediaType == MediaEnum.TEXT || 
        y.mediaType == MediaEnum.HTML
      )) {
        x.checked = true;
        const documentTypes = [MediaEnum.DOC, MediaEnum.EXCEL, MediaEnum.PDF, MediaEnum.FILE, MediaEnum.TEXT, MediaEnum.HTML];
        documentTypes.forEach(docType => {
          if (!this.mediaGalleryFilter?.mediaTypes?.includes(docType)) {
            this.mediaGalleryFilter?.mediaTypes?.push(docType);
          }
        });
      }
    });
  }

  loadMediaGallery(reloadAll?: boolean): void {
    // this.UGCMentionObj ? (this.UGCMentionObj.lstUGCMention = []) : '';
    this.mediaGalleryLoading = true;
    let genericFilter: GenericRequestParameters;
    if (!this.socialPostdata) {
      genericFilter = this._filterService.getGenericRequestFilter(
        this._postDetailService.postObj
      );
      if (this._mediaGalleryService.startDateEpoch) {
        genericFilter.startDateEpoch = this._mediaGalleryService.startDateEpoch;
      }
      if (this._mediaGalleryService.endDateEpoch) {
        genericFilter.endDateEpoch = this._mediaGalleryService.endDateEpoch;
      }
    } else {
      const brandId =
        this.socialPostdata.type == 'MediaGallery'
          ? this.selectedBrandDetails.brandID
          : this.socialPostdata.brandID;
      const fetchBrandDetails: BrandList =
        this._filterService.fetchedBrandData.find(
          (obj) => obj.brandID == brandId
        );
      if(fetchBrandDetails) {
        this.brandInfo = {
          brandID: Number(fetchBrandDetails.brandID),
          brandName: fetchBrandDetails.brandName,
          categoryGroupID: Number(fetchBrandDetails.categoryGroupID),
          // categoryID: Number(fetchBrandDetails.categoryID),
          // categoryName: fetchBrandDetails.categoryName,
          mainBrandID: 0,
          compititionBrandIDs: [],
          brandFriendlyName: fetchBrandDetails.brandFriendlyName,
          brandLogo: fetchBrandDetails.rImageURL,
          isBrandworkFlowEnabled: fetchBrandDetails.isSLAFLRBreachEnable,
          brandGroupName: fetchBrandDetails.brandGroup,
        };
      } else{
        this.brandInfo = {
          brandIDs: this.socialPostdata?.brandID,
        }
      }
      
      const startDateEpcoh1 = 0;
      const endDateEpoch1 = 0;
      genericFilter = {
        brandInfo: this.brandInfo,
        startDateEpoch: startDateEpcoh1,
        endDateEpoch: endDateEpoch1,
        ticketId: 0,
        tagID: 0,
        to: 1,
        from: 1,
        authorId: '',
        author: null,
        isActionableData: 0,
        channel: 0,
        isPlainLogText: false,
        targetBrandName: '',
        targetBrandID: 0,
        oFFSET: 0,
        noOfRows: 50,
        isCopy: true,
      };
    }

    genericFilter.oFFSET = this.recordOffset;
    // const mediaGalleryFilter = new MediaGalleryFilter();
    // mediaGalleryFilter.mediaTypes.push(2);
    this.brandId = genericFilter.brandInfo.brandID;

    genericFilter.noOfRows = 20;
    let type = '';
    if (this.activeSection === 'UGC') {
      if (this.ugcTextChecked) {
        type = 'ugcText';
      }
      this.mediaGalleryFilter.isUGC = true;
    } else {
      this.mediaGalleryFilter.isUGC = false;
    }
    const mediafilter: MediaGalleryParameters = {
      param: genericFilter,
      scheduleID: 0,
      filters: this.mediaGalleryFilter,
    };

    this.subs.add(
      this._mediaGalleryService.GetMediaList(mediafilter, type).subscribe(
        (data) => {
          // console.log(`data`, data);
          if (data && data.lstUGCMention && data.lstUGCMention.length > 0) {
            data.lstUGCMention.forEach((obj) => {
              if (this.activeSection === 'UGC') {
                if (obj.ugcMediaUrl) {
                  obj.mediaPath = obj.ugcMediaUrl.replace(
                    's3.amazonaws.com/locobuzz.socialimages',
                    'images.locobuzz.com'
                  );
                }
              } else {
                if (obj.mediaPath) {
                  obj.mediaPath = obj.mediaPath.replace(
                    's3.amazonaws.com/locobuzz.socialimages',
                    'images.locobuzz.com'
                  );
                }
              }
              obj.channelIcon = ChannelImage[ChannelGroup[obj.channelGroup]];

            });
            this.mediaGalleryLoading = false;
            if (this.socialPostdata?.type == 'AddNoteGallery' && this._mediaGalleryService.selectedNoteMedia.length > 0){
              data.lstUGCMention = data.lstUGCMention.map((obj) => {
                if (
                  this._mediaGalleryService.selectedNoteMedia.some(
                    (mediaObj) => mediaObj?.mediaPath == obj?.mediaPath
                  )
                ) {
                  obj.clicked = true;

                } else {
                  obj.clicked = false;
                }
                return obj;
              });
            }
            else if (this.socialPostdata?.type !== 'AddNoteGallery' && this._mediaGalleryService.selectedMedia.length > 0) {
              data.lstUGCMention = data.lstUGCMention.map((obj) => {
                if (
                  this._mediaGalleryService.selectedMedia.some(
                    (mediaObj) => mediaObj.mediaID == obj.mediaID
                  )
                ) {
                  obj.clicked = true;
                } else {
                  obj.clicked = false;
                }
                return obj;
              });
            } else {
              // data.lstUGCMention = data.lstUGCMention.map((obj) => {
              //   obj.clicked = false;
              //   return obj;
              // });
            }

            if (
              this.UGCMentionObj &&
              this.UGCMentionObj.lstUGCMention &&
              this.UGCMentionObj.lstUGCMention.length > 0 &&
              !reloadAll
            ) {
              if (data.lstUGCMention.length > 0) {
                this.UGCMentionObj.lstUGCMention.push(...data.lstUGCMention);
              }
              this.UGCMentionObj.totalRecords = data.totalRecords;
              this.noDataFound = false;
            } else {
              this.UGCMentionObj = data;
              this.noDataFound = false;
            }

            if (
              this.UGCMentionObj.lstUGCMention &&
              this.UGCMentionObj.lstUGCMention.length > 0
            ) {
            } else {
              this.noDataFound = true;
            }

            if (
              this.UGCMentionObj.lstUGCMention.length >=
              this.UGCMentionObj.totalRecords
            ) {
              this.showLoadMore = false;
            } else {
              this.showLoadMore = true;
            }
            if (this.activeSection === 'UGC') {
              if (this.ugcTextChecked) {
                this.setUgcTextmention(this.UGCMentionObj.lstUGCMention);
              }
            }
            this.UGCMentionList.next(this.UGCMentionObj.lstUGCMention);
            this.changeDetector.detectChanges();
          } else {
            this.mediaGalleryLoading = false;
            this.noDataFound = true;
            this.showLoadMore = false;
          }
          if (!this.socialPostdata) {
            this.selectedMedia = this._mediaGalleryService.selectedMedia.length;
          }
          this.attchEnableFlag = this.UGCMentionObj?.lstUGCMention.some(item => item.clicked)
          this.attchButtonLoader = false;
        },
        (err) => {
          this.mediaGalleryLoading = false;
          // console.log(err);
        },
        () => {
          // console.log('call completed');
        }
      )
    );    
  }

  setUgcTextmention(ugcmentionlist: UgcMention[]): void {
    this.ugcMentionTextData = [];
    if (ugcmentionlist && ugcmentionlist.length > 0) {
      for (const ugcmention of ugcmentionlist) {
        const ugcTextMention: UgcMentionTextData = {};
        const allBrandsTicketsDTO: AllBrandsTicketsDTO = {};
        ugcTextMention.mention = ugcmention.mention;
        ugcTextMention.channelIcon =
          ChannelImage[ChannelGroup[ugcmention.mention.channelGroup]];
        ugcTextMention.channelName = this._ticketService.MapChannelType(
          ugcmention.mention
        );
        ugcTextMention.ticketTimings = this._ticketService.calculateTicketTimes(
          ugcmention.mention
        );
        ugcTextMention.postlink = this._footericonService.setOpenPostLink(
          ugcmention.mention,
          false
        );
        ugcTextMention.checked = false;
        ugcTextMention.ticketHistoryData =
          this._footericonService.getTicketDescription(
            this.currentUser,
            allBrandsTicketsDTO,
            ugcmention.mention
          );
        this.ugcMentionTextData.push(ugcTextMention);
      }
    }
  }

  toggleSelectStatus(): void {
    this.isActive = !this.isActive;
  }

  ugcRadioChange(ugcType): void {
    if (ugcType === '1') {
      this.mediaFilterSorting.mediaType.forEach((obj) => {
        obj.checked = false;
      });
      this.ugcTextChecked = true;
      this.ugcMediachecked = false;
      if (typeof this.UGCMentionObj != 'undefined') {
        this.UGCMentionObj.lstUGCMention = []
      }
      this.loadMediaGallery(true);
    } else if (ugcType === '2') {
      this.mediaFilterSorting.mediaType.forEach((obj) => {
        if (obj.value === 2 || obj.value === 3) {
          obj.checked = true;
        }
      });
      this.mediaGalleryFilter.mediaTypes = [2, 3, 7];
      this.ugcMediachecked = true;
      this.ugcTextChecked = false;
      if (typeof this.UGCMentionObj != 'undefined') {
        this.UGCMentionObj.lstUGCMention = []
      }
      this.loadMediaGallery(true);
    }
  }

  openImagepopup(ugcmentionObj): void {
    this._mediaGalleryService.currentUGC = JSON.parse(
      JSON.stringify(ugcmentionObj)
    );
    this._mediaGalleryService.currentUGC.isUGC =
      this.activeSection === 'UGC' ? true : false;
    this.clickedFromMediaGallery = true;
    const dialogRef = this.dialog.open(MediaDropitemComponent, {
      autoFocus: false,
      width: '500px',
      data: this.brandInfo,
    });
    dialogRef.componentInstance.image = ugcmentionObj.mediaPath;
    dialogRef.componentInstance.inModal = true;
    dialogRef.componentInstance.displayName = ugcmentionObj.displayFileName;
    dialogRef.componentInstance.ugcMention = ugcmentionObj;
  }

  subscribetoDropzoneEvent(): void {
    this.subs.add(
      this._mediaGalleryService.EmitStarChangeEvent.subscribe((event) => {
        if (event && this.clickedFromMediaGallery) {
          const obj = JSON.parse(JSON.stringify(event));
          if (obj.value) {
            this.starAffect(obj);
          }
        }
      })
    );

    this.subs.add(
      this._mediaGalleryService.EmitPillsChanged.subscribe((event) => {
        if (event && this.clickedFromMediaGallery) {
          const obj = JSON.parse(JSON.stringify(event));
          if (obj.pillvalue) {
            this.onPillsChanged(obj);
          }
        }
      })
    );
  }

  onPillsChanged(event): void {
    if (this._mediaGalleryService.currentUGC) {
      if (event.operation === 'remove') {
        const index = this._mediaGalleryService.currentUGC.mediaTags.indexOf(
          event.pillvalue
        );
        if (index > -1) {
          this._mediaGalleryService.currentUGC.mediaTags.splice(index, 1);
        }
      } else if (event.operation === 'add') {
        if (this._mediaGalleryService.currentUGC) {
          if (
            this._mediaGalleryService.currentUGC &&
            this._mediaGalleryService.currentUGC.mediaTags &&
            this._mediaGalleryService.currentUGC.mediaTags.length > 0
          ) {
            this._mediaGalleryService.currentUGC.mediaTags.push(
              event.pillvalue
            );
          } else {
            this._mediaGalleryService.currentUGC.mediaTags = [];
            this._mediaGalleryService.currentUGC.mediaTags.push(
              event.pillvalue
            );
          }
        }
      }
    }
  }

  public starAffect(event): void {
    if (this._mediaGalleryService.currentUGC) {
      this._mediaGalleryService.currentUGC.rating = event.value;
    }
  }
  selectGivenMedia(event, ugcmention: UgcMention): void {
    const getmediainfo = {
      mediaID: ugcmention.mediaID,
      URL: ugcmention.mediaPath,
      isUGC: ugcmention.isUGC,
      mediaName: ugcmention.displayFileName,
    };

    this.UGCMentionObj.lstUGCMention = this.UGCMentionObj.lstUGCMention.map(
      (obj) => {
        if (obj.mediaID == ugcmention.mediaID) {
          ugcmention.clicked = !ugcmention.clicked;
          if (!ugcmention.clicked) {
            if(this.socialPostdata?.type == 'AddNoteGallery'){
              let local = this._mediaGalleryService.selectedNoteMedia.filter(
                (x) => x.mediaID == ugcmention.mediaID
              );
              if (local.length > 0) {
                const index = this._mediaGalleryService.selectedNoteMedia.findIndex(
                  (item) => item.mediaID === obj.mediaID
                );
                if (index >= 0) {
                  this._mediaGalleryService.selectedNoteMedia.splice(index, 1);
                }
              }
            }else{
              let local = this._mediaGalleryService.selectedMedia.filter(
                (x) => x.mediaID == ugcmention.mediaID
              );
              if (local.length > 0) {
                const index = this._mediaGalleryService.selectedMedia.findIndex(
                  (item) => item.mediaID === obj.mediaID
                );
                if (index >= 0) {
                  this._mediaGalleryService.selectedMedia.splice(index, 1);
                }
              }
            }
          }
          obj.order = this.selectOrder++;
          let flag = this.listOfMediaSelected.some(
            (object) => object.mediaID == getmediainfo.mediaID
          );
          if (!flag) this.listOfMediaSelected.push(getmediainfo);
          obj.clicked = ugcmention.clicked;
          // obj = ugcmention;
        } else if (this.socialPostdata && this.socialPostdata.type == 'WhatsappGallery') {
          obj.clicked = false;
        }
        return obj;
      }
    );

    if (!ugcmention?.mediaInfo) {
      const data = {
        brandInfo: {},
        media: [getmediainfo],
      };
      this.attchButtonLoader = true;
      this.socialScheduleSevice.getMediaInfoData(data).subscribe((res) => {
        if (res.success) {
          const mediaInfo = res?.data[0]?.mediaInfo;
          const findIndex = this.UGCMentionObj?.lstUGCMention?.findIndex(item => item?.mediaID == ugcmention?.mediaID)

          if (findIndex != -1) {
            this.UGCMentionObj.lstUGCMention[findIndex].mediaInfo = mediaInfo;
          }
          this.attchEnableFlag = this.UGCMentionObj?.lstUGCMention?.some(item => item?.clicked)
        }
        this.attchButtonLoader = false;
      },
      (err) => {
        this.attchButtonLoader = false;
      })
    }
    else {
      this.attchEnableFlag = this.UGCMentionObj?.lstUGCMention?.some(item => item?.clicked)
      this.attchButtonLoader = false;
    }
    // this.UGCMentionObj.lstUGCMention.push(ugcmention);
    // this.UGCMentionObj.lstUGCMention = this.UGCMentionObj.lstUGCMention.map(
    //   (obj) => {
    //     if (obj.mediaID === ugcmention.mediaID) {
    //       // obj.clicked = !obj.clicked;
    //       // if (obj.clicked) {
    //       //   this._mediaGalleryService.selectedMedia.push(ugcmention);
    //       // } else {
    //       //   if (
    //       //     this._mediaGalleryService.selectedMedia &&
    //       //     this._mediaGalleryService.selectedMedia.length > 0
    //       //   ) {
    //       //     this._mediaGalleryService.selectedMedia =
    //       //       this._mediaGalleryService.selectedMedia.filter((object) => {
    //       //         return object.mediaID !== obj.mediaID;
    //       //       });
    //       //   }
    //       // }
    //       // console.log('current selected media', this._mediaGalleryService.selectedMedia);
    //       this.selectedMedia = this._mediaGalleryService.selectedMedia.length;
    //     }

    //     return obj;
    //   }
    // );
  }

  selectGivenUgcMedia(event, postlink): void {
    // console.log(event);
    // console.log(ugcmention);
    // this.selectedIndex = index;
    // this.clickedFromMediaGallery = !this.clickedFromMediaGallery;
    event.checked = !event.checked;
    if (event.checked) {
      this.selectedUgcPost.push(postlink);
    } else {
      const findIndex = this.selectedUgcPost.findIndex(
        (obj) => obj === postlink
      );
      if (findIndex > -1) {
        this.selectedUgcPost.splice(findIndex, 1);
      }
    }
  }

  checkUgcMediaEvent(event, postlink): void {
    event.checked = !event.checked;
    if (event.checked) {
      this.selectedUgcPost.push(postlink);
    } else {
      const findIndex = this.selectedUgcPost.findIndex(
        (obj) => obj === postlink
      );
      if (findIndex > -1) {
        this.selectedUgcPost.splice(findIndex, 1);
      }
    }
  }

  clearAllFilters(): void { }

  applyMediaFilter(event, item): void {
    // console.log('media type', event);
    let selectedMediaType = false;
    if (typeof this.UGCMentionObj != 'undefined') {
      this.UGCMentionObj.lstUGCMention = []
    }
    // console.log((event.target as HTMLInputElement).value);
    if (item.type === 'mediatype') {
      if (event.checked) {
        this.mediaGalleryFilter.mediaTypes = [];
        this.mediaFilterSorting.mediaType.forEach((obj) => {
          obj.checked = obj.value === +item.value ? event.checked : obj.checked;
        });
        // if (item.value == 19) {
        //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.DOC);
        //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.EXCEL);
        //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.PDF);
        //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.FILE);
        //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.TEXT);
        //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.HTML);
        // } else {
        this.mediaFilterSorting.mediaType.forEach((obj) => {
          if (obj.checked) {
            switch (obj.value) {
              case 2:
                this.mediaGalleryFilter.mediaTypes.push(+obj.value);
                break;
              case 3:
                this.mediaGalleryFilter.mediaTypes.push(3);
                this.mediaGalleryFilter.mediaTypes.push(7);
                break;
              case 8:
                this.mediaGalleryFilter.mediaTypes.push(+obj.value);
                break;
              case 19:
                this.mediaGalleryFilter.mediaTypes.push(MediaEnum.DOC);
                this.mediaGalleryFilter.mediaTypes.push(MediaEnum.EXCEL);
                this.mediaGalleryFilter.mediaTypes.push(MediaEnum.PDF);
                this.mediaGalleryFilter.mediaTypes.push(MediaEnum.FILE);
                this.mediaGalleryFilter.mediaTypes.push(MediaEnum.TEXT);
                this.mediaGalleryFilter.mediaTypes.push(MediaEnum.HTML);
                break;
            }
            // if (obj.value == 3) {
            //   this.mediaGalleryFilter.mediaTypes.push(3);
            //   this.mediaGalleryFilter.mediaTypes.push(7);
            // } else if (item.value == 19) {
            //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.DOC);
            //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.EXCEL);
            //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.PDF);
            //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.FILE);
            //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.TEXT);
            //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.HTML);
            // } else {
            //   this.mediaGalleryFilter.mediaTypes.push(+obj.value);
            // }
          }
        });
        // if (item.value == 3 && this.activeSection == 'UGC') {
        //   this.mediaGalleryFilter.mediaTypes.push(3);
        //   this.mediaGalleryFilter.mediaTypes.push(7);
        // } else {
        //   this.mediaGalleryFilter.mediaTypes.push(+item.value);
        // }
        // }
      } else {
        let val = this.mediaGalleryFilter.mediaTypes;
        // this.mediaGalleryFilter.mediaTypes.filter((obj) => {
        //   return obj !== +item.value;
        // });
        if (+item.value == 3) {
          val = val.filter((obj) => {
            return obj !== 3;
          });
          val = val.filter((obj) => {
            return obj !== 7;
          });
        } 
        else if (+item.value == 8) { 
          val = val.filter((obj) => {
            return obj !== MediaEnum.PDF;
          });
        }
        else if (+item.value == 19){
          val = val.filter((obj) => (obj != MediaEnum.DOC) && (obj != MediaEnum.EXCEL) && (obj != MediaEnum.FILE) && (obj != MediaEnum.TEXT) && (obj != MediaEnum.HTML));
          const ispdfSingleOptionSelected: number = this.mediaFilterSorting.mediaType.findIndex(x => x.value == 8 && x.checked)
          if(ispdfSingleOptionSelected == -1){
            val = val.filter((obj) => {
              return obj !== MediaEnum.PDF;
            });
          }
        } 
        else {
          val = val.filter((obj) => {
            return obj !== 2;
          });
          // this.mediaGalleryFilter.mediaTypes = this.mediaGalleryFilter.mediaTypes.filter((obj) => {
          //   return obj !== +item.value;
          // });
        }
        this.mediaFilterSorting.mediaType.forEach((obj) => {
          obj.checked = obj.value === +item.value ? event.checked : obj.checked;
        });
        // if (this.mediaGalleryFilter.mediaTypes.length === 0) {
        //   this.mediaGalleryFilter.mediaTypes.push(MediaEnum.IMAGE);
        //   this.mediaFilterSorting.mediaType.forEach((obj) => {
        //     obj.checked = obj.value === +item.value ? event.checked : obj.checked;
        //   });
        // }
        this.mediaGalleryFilter.mediaTypes = val;
      }
      selectedMediaType = true;
    } else if (item.type === 'rating') {
      if (event.checked) {
        this.mediaGalleryFilter.ratings.push(+item.value);
      } else {
        this.mediaGalleryFilter.ratings =
          this.mediaGalleryFilter.ratings.filter((obj) => {
            return obj !== +item.value;
          });
      }
    } else if (item.type === 'sortby') {
      if (item.value === 1) {
        this.mediaGalleryFilter.sortcolumn = 'CreatedDate';
      } else if (item.value === 2) {
        this.mediaGalleryFilter.sortcolumn = 'rating';
      }
    } else if (item.type === 'sortorder') {
      if (item.value === 1) {
        this.mediaGalleryFilter.sortby = 'asc';
      } else if (item.value === 2) {
        this.mediaGalleryFilter.sortby = 'desc';
      }
    }
    this.loadMediaGallery(selectedMediaType);
  }

  attachMediaToReply(addCaption?): void {
    if (!addCaption && this._postDetailService?.postObj?.channelGroup == this.channelGroupEnum.Telegram && this.socialPostdata?.type != 'AddNoteGallery' && this.socialPostdata?.type != 'SocialGallery'){
      this.addCaption();
      return
    }
    if (this.socialPostdata && this.socialPostdata?.type == 'WhatsappGallery') {
      const selectedMediaList = [];
      this.UGCMentionObj.lstUGCMention.forEach((obj) => {
        if (obj.clicked) {
          selectedMediaList.push(obj);
        }
      });
      if (selectedMediaList && selectedMediaList.length > 0) {
        this.dialogRef.close(selectedMediaList);
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('Please-select-media'),
          },
        });
      }
    } else if (this.socialPostdata && this.socialPostdata?.type == 'AddNoteGallery'){
      this.attachNoteMedia();
    } else {
      if (!this.socialPostdata) {
        if (this.activeSection === 'UGC') {
          if (this.ugcTextChecked) {
            this.attachUgcTextMedia();
          } else {
            this.attachUgcMedia();
          }
        } else {
          this.attachMedia();
        }
      } else {
        this.attachMediaForSocialPost();
      }
    }
  }

  attachMediaForSocialPost(): void {
    let selectedMediaList: UgcMention[] = [];
    // if (this.mediaValidation.bothFlag) {
    selectedMediaList = Object.assign(
      [],
      this._mediaGalleryService.selectedMedia
    );
    // }
    this.UGCMentionObj.lstUGCMention.forEach((obj) => {
      if (obj.clicked) {
        selectedMediaList.push(obj);
      }
    });
    let uniqueSelectedMedia = [];
    selectedMediaList = selectedMediaList?.sort((a, b) => a?.order - b?.order);
    for (let item of selectedMediaList) {
      uniqueSelectedMedia = this.createMediaDataList(item, uniqueSelectedMedia);
    }
    const message = this.validationForSocialPost(
      this.mediaValidation,
      uniqueSelectedMedia
    );
    const message2 = this.validateVideoForSelectedChannels(
      uniqueSelectedMedia,
      this.socialPostdata.selectedChannelsList
    );
    const message3 = this.validateImagesForSelectedChannels(
      uniqueSelectedMedia,
      this.socialPostdata.selectedChannelsList
    );
    if (message || message2 || message3) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: message || message2 || message3,
        },
      });
      this._mediaGalleryService.selectedMedia =
        this._mediaGalleryService.selectedMedia.filter(
          (obj) => (obj) =>
            uniqueSelectedMedia.some(
              (uniqueObj) => uniqueObj.mediaID != obj.mediaID
            )
        );
      return;
    }
    const sendData = {
      brandInfo: {
        BrandID: Number(this.brandInfo?.brandID),
        BrandName: this.brandInfo?.brandName,
        CategoryID: Number(this.brandInfo?.categoryID),
        CategoryName: this.brandInfo?.categoryName,
      },
      media: this.listOfMediaSelected,
    };
    // if (this.socialPostdata?.attachmentValidation.channelName == 'Instagram' || this.socialPostdata?.attachmentValidation.channelName=='Twitter'){
    //   this._mediaGalleryService.getMediaListdetails(sendData).subscribe((res)=>{
    //     this._mediaGalleryService.selectedMedia = uniqueSelectedMedia;
    //     this.dialogRef.close(this._mediaGalleryService.selectedMedia);
    //   })
    // } else{
    // }
    this._mediaGalleryService.selectedMedia = uniqueSelectedMedia;
    this.dialogRef.close(this._mediaGalleryService.selectedMedia);
  }
  getAspectRatio(media) {
    const aspectRatio =
      media?.mediaInfo?.resolution.split('x')[0] /
      media?.mediaInfo?.resolution.split('x')[1];
    if (0.8 > aspectRatio || aspectRatio > 1.91) return 1;
    if (media?.mediaInfo?.fileSize?.split('MB')[0] > 8) return 2;
    return 0;
  }
  getAspectRatioForLinkedIn(media) {
    const aspectRatio =
      media?.mediaInfo?.resolution.split('x')[0] *
      media?.mediaInfo?.resolution.split('x')[1];
    if (aspectRatio > 36152320) return 1;
  }

  getAspectRatioForTwitter(media) {
    const splitData:any[] = media?.mediaInfo?.resolution?.split('x');
    if(splitData?.length > 1){
      if (splitData[0] > 8192 || splitData[1] > 8192) return 1;
    }
    
  }

  validateImagesForSelectedChannels(selectedMediaList, selectedChannelList) {
    let message;
    const imagesList = selectedMediaList.filter(
      (obj) =>
        obj.mediaType == MediaEnum.IMAGE || obj.mediaType == MediaEnum.ALBUM
    );
    selectedChannelList?.forEach((element) => {
      const channelValidation = this.mediaValidation.find(item=> item?.channelName?.toLowerCase() == element?.toLowerCase());
      if (element == 'Instagram' && this.socialPostdata.type == 'SocialGallery') {
        imagesList.forEach((image) => {
          if (image?.mediaInfo?.fileSize?.split('MB')[0] > channelValidation?.imageUploadSize) {
            message = `Size of this image ${image.displayFileName} does not supported by Instagram.`;
          }
          if (this.getAspectRatio(image) == 1) {
            message = this.translate.instant('Aspect-Ratio-Not-Supported-Instagram', { fileName: image.displayFileName });
          }
        });
      }
      if (element == 'Linkedin') {
        imagesList.forEach((image) => {
          if (image?.mediaInfo?.fileSize?.split('MB')[0] > channelValidation?.imageUploadSize && this.socialPostdata.type == 'SocialGallery') {
            message = `Size of this image ${image.displayFileName} does not supported by Linkedin.`;
          }
          
          if (this.getAspectRatioForLinkedIn(image) == 1) {
            message = this.translate.instant('Aspect-Ratio-Not-Supported-LinkedIn', { fileName: image.displayFileName });
          }
        });
      }
      if (element == 'Twitter') {
        if (imagesList?.length > 0){
          imagesList?.forEach((image) => {
            if (image?.mediaInfo?.fileSize?.split('MB')[0] > channelValidation?.imageUploadSize && this.socialPostdata.type == 'SocialGallery') {
              message = `Size of this image ${image.displayFileName} does not supported by Twitter.`;
            }
            if (this.getAspectRatioForTwitter(image) == 1) {
              message = this.translate.instant('Twitter-Resolution-Exceeds-Max-Dimensions', { displayFileName: image.displayFileName });
            }
          });
        }
      }
      if (element == 'Facebook'){
        const gifList = imagesList?.filter(image => image?.mediaInfo && image?.mediaInfo?.fileExtension?.toLowerCase() == 'gif');
        if(gifList.length > 1){
          message = this.translate.instant('Facebook-not-allow');
        }
        if (imagesList?.length > 0 && this.socialPostdata.type == 'SocialGallery') {
          imagesList?.forEach((image) => {
            if (image?.mediaInfo?.fileSize?.split('MB')[0] > channelValidation?.imageUploadSize) {
              message = `Size of this image ${image.displayFileName} does not supported by Facebook.`;
            }
          });
        }
      }
      if(element == 'GMB'){
        if (imagesList?.length > 0) {
          imagesList?.forEach((image) => {
            if (image && image?.mediaInfo){
              const units = ['B', 'KB', 'MB',];
              const sizeParts = image?.mediaInfo?.fileSize.match(/([\d\.]+)\s*(\w+)/);
              if (!sizeParts || sizeParts.length !== 3) {
                message = this.translate.instant('Invalid-file-size-format');
              }
              const value = parseFloat(sizeParts[1]);  
              const unit = sizeParts[2].toUpperCase();
              const unitIndex = units.indexOf(unit);
              if (unitIndex === -1) { message = this.translate.instant('Invalid-file-size-unit'); }
              if ((value * Math.pow(1024, unitIndex)) < 12288){
                message = this.translate.instant('Invalid-file-size')
              }
            }
          });
        }
      }
    });
    if (message) return message;
  }
  validateVideoForSelectedChannels(
    selectedMediaList,
    selectedChannelList
  ) {
    let message;
    selectedChannelList?.forEach((element) => {
      if (
        element == 'Instagram' ||
        element == 'Twitter' ||
        element == 'TikTok' ||
        element == 'Facebook'
      ) {
        const videoList = selectedMediaList.filter(
          (obj) => obj.mediaType == MediaEnum.VIDEO
        );

        if (videoList.length == 1) videoList[0].mediaInfo = (this.UGCMentionObj?.lstUGCMention.find(item => item?.mediaID == videoList[0]?.mediaID))?.mediaInfo

        if (videoList.length == 1 && element == 'Instagram') {
          if (
            videoList[0].mediaInfo &&
            videoList[0]?.mediaInfo?.durationInSeconds > 900
          ) {
            message = this.translate.instant('Instagram-reels-video-max-900');
          }
        } else if (videoList.length > 0 && element == 'Twitter') {

          for (let i = 0; i < videoList.length; i++) {
            const videoMedia = videoList[i];
            if (videoMedia?.mediaInfo && (videoMedia?.mediaInfo?.fileExtension?.toLowerCase() != 'mp4' && videoMedia?.mediaInfo?.fileExtension?.toLowerCase() != 'mov')){
              message = this.translate.instant('Twitter-video-format-mp4-mov');
            }

            if (videoMedia?.mediaInfo && videoMedia?.mediaInfo?.durationInSeconds > 140) {
              message = this.translate.instant('Twitter-video-max-140');
              break
            }

            if (videoMedia?.mediaInfo && videoMedia?.mediaInfo?.durationInSeconds <= 0.4) {
              message = this.translate.instant('Min-video-duration-0.5');
              break
            }

            if (!videoMedia?.mediaInfo) {
              message = this.translate.instant('Selected-video-duration-not-available');
              break
            }    
          }
        
        } 
        else if (videoList.length > 0 && element == 'Facebook') {
          
          for (let i = 0; i < videoList.length; i++) {
            const videoMedia = videoList[i];
            if (selectedMediaList.some(obj => obj?.mediaType == MediaEnum.IMAGE)){
              message = this.translate.instant('Facebook-video-or-image-only');
              break
            }

            if (videoMedia?.mediaInfo && videoMedia?.mediaInfo?.durationInSeconds > 1200) {
              message = this.translate.instant('Facebook-video-max-1200');
              break
            }
          }
        }
        else if (videoList.length == 1 && element == 'TikTok') {
          if (
            videoList[0]?.mediaInfo &&
            videoList[0]?.mediaInfo?.durationInSeconds > 600
          ) {
            message = this.translate.instant('TikTok-video-max-600');
          } else if (videoList[0]?.mediaInfo?.fileSize) {
            const size = videoList[0]?.mediaInfo?.fileSize?.split('GB');
            if (size && size.length && Number(size[0]) > 1) {
              message = this.translate.instant('TikTok-video-max-1GB');
            }
          } else if (!videoList[0]?.mediaInfo?.fileExtension.includes('mp4') && !videoList[0]?.mediaInfo?.fileExtension.includes('mov') && !videoList[0]?.mediaInfo?.fileExtension.includes('webm')) {
            message = this.translate.instant('TikTok-video-format-mp4-mov-webm');
          }
        } else {
          videoList.forEach((video) => {
            if (
              video?.mediaInfo &&
              video?.mediaInfo?.durationInSeconds >
              (element == 'Instagram' ? 60 : 140)
            ) {
              message = this.translate.instant('Instagram-video-max-60-carousel', { type: this.socialPostdata.type == 'SocialGalleryStory' ? 'story' : 'carousel' });
            }
          });
        }
      }
    });
    if (message) return message;
  }
  
  validationForSocialPost(validationObjs: mediaValidation[], selectedMediaList: UgcMention[]): string {
    for (const validationObj of validationObjs) {
      if (validationObj.channelName == 'Youtube') {
        if (selectedMediaList.length > 1) {
          return this.translate.instant('Youtube-does-not-allow-more-than-1-video');
        }
      } 
      else {
        const imageListLength = selectedMediaList.filter(
          (obj) => obj.mediaType == MediaEnum.IMAGE
        ).length;
        const videoListLength = selectedMediaList.filter(
          (obj) => obj.mediaType == MediaEnum.VIDEO
        ).length;
        const PDFListLength = selectedMediaList.filter(
          (obj) => obj.mediaType == MediaEnum.PDF
        ).length;
        const gifListLength = selectedMediaList.filter(
          (obj) =>
            obj.mediaPath
              .substr(obj.mediaPath.lastIndexOf('.') + 1)
              .toLowerCase() == 'gif'
        ).length;
        if (!validationObj.bothFlag) {
          if (
            validationObj.channelName == 'Twitter' ||
            validationObj.channelName == 'Facebook'
          ) {
            if (gifListLength > 0 && selectedMediaList.length > 1) {
              return `${validationObj.channelName} allows you to upload images or a single GIF at a time.`;
            }
          }
          if (validationObj.channelName == 'GMB') {
            if (gifListLength > 0) {
              return `${validationObj.channelName}  does not allow you to upload gif.`;
            }
            if (selectedMediaList.length > 1) {
              return `${validationObj.channelName} only allow you to upload 1 image at a time.`;
            }
          }

          if (
            this.mediaFilterSorting.mediaType[0].value == MediaEnum.IMAGE &&
            imageListLength > validationObj.imageCount
          ) {
            return `${validationObj.channelName} does not allow you to upload more than ${validationObj.imageCount} image.`;
          } else if (
            this.mediaFilterSorting.mediaType[0].value == MediaEnum.VIDEO &&
            videoListLength > validationObj.videoCount
          ) {
            return `${validationObj.channelName} does not allow you to upload more than ${validationObj.videoCount} video.`;
          } else if (
            this.mediaFilterSorting.mediaType[0].value == MediaEnum.PDF &&
            PDFListLength > validationObj.pdfCount
          ) {
            return `${validationObj.channelName} does not allow you to upload more than ${validationObj.pdfCount} file.`;
          }
        } 
        else if (validationObj.bothFlag) {
          const gifListLength = selectedMediaList.filter(
            (obj) =>
              obj.mediaPath
                .substr(obj.mediaPath.lastIndexOf('.') + 1)
                .toLowerCase() == 'gif'
          ).length;

          if (validationObj.channelName == 'Instagram') {
            if (gifListLength > 0 && this.socialPostdata.type == 'SocialGallery') {
              return `${validationObj.channelName} does not allow you to upload gif.`;
            }
            if (selectedMediaList.length > 10) {
              return `${validationObj.channelName} only allow you to upload max 10 images at a time.`;
            }
            if (videoListLength > 1 && this.socialPostdata.type == 'SocialGallery') {
              return `${validationObj.channelName} does not allow you to upload more than 1 video.`;
            }
          }
        } 
        else {
          if (!validationObj.unlimitedAccess) {
            if (selectedMediaList.length > validationObj.totalCount) {
              return this.translate.instant('Channel-max-attachments', { channel: validationObj.channelName, count: validationObj.totalCount });
            }
          }
        }
      }
    }
  }

  attachUgcTextMedia(): void {
    if (this.selectedUgcPost && this.selectedUgcPost.length > 0) {
      this.replyService.selectedUgcMedia.next(this.selectedUgcPost);
      this.dialogRef.close(true);
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: this.translate.instant('Please-select-at-least-one-UGC-post'),
        },
      });
    }
  }

  attachMedia(): void {
    /* if (this._mediaGalleryService.selectedMedia.length > 0) {
      if (!this.overrideMediaPopup()) {
        return;
      }
    } */
    this._mediaGalleryService.selectedMedia = [];
    const selectedMediaList = [];
    this.UGCMentionObj.lstUGCMention.forEach((obj) => {
      if (obj.clicked) {
        selectedMediaList.push(obj);
      }
    });

    let uniqueSelectedMedia = [];
    for (let item of selectedMediaList) {
      uniqueSelectedMedia = this.createMediaDataList(item, uniqueSelectedMedia);
    }

    if (uniqueSelectedMedia && uniqueSelectedMedia.length > 0) {
      // add validation channelwise
      const mediaValidate = this._mediaGalleryService.validateMedia(
        this._postDetailService.postObj,
        selectedMediaList
      );
      if (mediaValidate.status) {
        this._mediaGalleryService.selectedMedia = uniqueSelectedMedia;
        this.replyService.selectedMedia.next({
          media: uniqueSelectedMedia,
          section: this._mediaGalleryService.section,
          caption: this.caption
        });
        this._mediaGalleryService.section = SectionEnum.Ticket;
        this.dialogRef.close(true);
      } else {
        // this._mediaGalleryService.selectedMedia.pop();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: mediaValidate.message,
          },
        });
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-select-at-least-one-media-file'),
        },
      });
    }
  }
  attachNoteMedia(): void {
    /* if (this._mediaGalleryService.selectedNoteMedia.length > 0) {
      if (!this.overrideNoteMediaPopup()) {
        return;
      }
    } */
    this._mediaGalleryService.selectedNoteMedia = [];
    const selectedMediaList = [];
    this.UGCMentionObj.lstUGCMention.forEach((obj) => {
      if (obj.clicked) {
        selectedMediaList.push(obj);
      }
    });

    let uniqueSelectedMedia = [];
    for (let item of selectedMediaList) {
      uniqueSelectedMedia = this.createMediaDataList(item, uniqueSelectedMedia);
    }

    if (uniqueSelectedMedia && uniqueSelectedMedia.length > 0) {
      // add validation channelwise
      // const mediaValidate = this._mediaGalleryService.validateMedia(
      //   this._postDetailService.postObj,
      //   selectedMediaList
      // );
      // if (mediaValidate.status) {
        this._mediaGalleryService.selectedNoteMedia = uniqueSelectedMedia;
        this.replyService.selectedNoteMedia.next({
          media: uniqueSelectedMedia,
          section: this._mediaGalleryService.section,
        });
        this._mediaGalleryService.section = SectionEnum.Ticket;
        this.dialogRef.close(true);
      // } else {
      //   // this._mediaGalleryService.selectedMedia.pop();
      //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
      //     duration: 5000,
      //     data: {
      //       type: notificationType.Error,
      //       message: mediaValidate.message,
      //     },
      //   });
      // }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-select-at-least-one-media-file'),
        },
      });
    }
  }

  attachUgcMedia(): void {
    /* if (this._mediaGalleryService.selectedMedia.length > 0) {
      if (!this.overrideMediaPopup()) {
        return;
      }
    } */
    this._mediaGalleryService.selectedMedia = [];
    const selectedMediaList = [];
    this.UGCMentionObj.lstUGCMention.forEach((obj) => {
      if (obj.clicked) {
        selectedMediaList.push(obj);
      }
    });

    let uniqueSelectedMedia = [];
    for (let item of selectedMediaList) {
      uniqueSelectedMedia = this.createMediaDataList(item, uniqueSelectedMedia);
    }

    if (uniqueSelectedMedia && uniqueSelectedMedia.length > 0) {
      // add validation channelwise
      // const mediaValidate = this._mediaGalleryService.validateMedia(
      //   this._postDetailService.postObj,
      //   selectedMediaList
      // );
      const mediaValidate: LocobuzzMediaError = { message: '', status: true };

      const videoData = selectedMediaList.filter(
        (obj) => obj.mediaType === MediaEnum.VIDEO || obj.mediaType === MediaEnum.ANIMATEDGIF
      );

      if (videoData && videoData.length > 1) {
        mediaValidate.message = this.translate.instant('You-can-upload-video');
        mediaValidate.status = false;
      }

      if (mediaValidate.status) {
        this._mediaGalleryService.selectedMedia = uniqueSelectedMedia;
        this.replyService.selectedMedia.next({
          media: uniqueSelectedMedia,
          section: this._mediaGalleryService.section,
          caption: this.caption
        });
        this._mediaGalleryService.section = SectionEnum.Ticket;
        this.dialogRef.close(true);
      } else {
        // this._mediaGalleryService.selectedMedia.pop();
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: mediaValidate.message,
          },
        });
      }
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-select-at-least-one-media-file'),
        },
      });
    }
  }

  overrideMediaPopup(): boolean {
    const selectedMediaTypeObj = this.mediaFilterSorting.mediaType.find(
      (obj) => obj.checked == true
    );
    if (selectedMediaTypeObj.value == MediaEnum.FILE) {
      if (
        this._mediaGalleryService.selectedMedia.some(
          (obj) =>
            obj.mediaType == MediaEnum.HTML ||
            obj.mediaType == MediaEnum.PDF ||
            obj.mediaType == MediaEnum.EXCEL ||
            obj.mediaType == MediaEnum.FILE ||
            obj.mediaType == MediaEnum.TEXT ||
            obj.mediaType == MediaEnum.DOC
        )
      ) {
        return true;
      } else {
        const dialogData = new AlertDialogModel(
          this.translate.instant('Upload-media'),
          this.translate.instant('Upload-media-warning', { type: selectedMediaTypeObj.name.toLowerCase() }),
          'Yes',
          'No'
        );
        const dialogRef = this.dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });
        dialogRef.afterClosed().subscribe((obj) => {
          if (obj) {
            this._mediaGalleryService.selectedMedia = [];
            this.attachMedia();
          } else {
          }
        });
        return false;
      }
    } else {
      if (
        this._mediaGalleryService.selectedMedia.some(
          (obj) =>
            obj.mediaType ==
            this.mediaTypeEnum[selectedMediaTypeObj.name.toUpperCase()]
        )
      ) {
        return true;
      } else {
        const dialogData = new AlertDialogModel(
          this.translate.instant('Upload-media'),
          this.translate.instant('Upload-media-warning', { type: selectedMediaTypeObj.name.toLowerCase() }),
          'Yes',
          'No'
        );
        const dialogRef = this.dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });
        dialogRef.afterClosed().subscribe((obj) => {
          if (obj) {
            this._mediaGalleryService.selectedMedia = [];
            this.attachMedia();
          } else {
          }
        });
        return false;
      }
    }
  }
  overrideNoteMediaPopup(): boolean {
    const selectedMediaTypeObj = this.mediaFilterSorting.mediaType.find(
      (obj) => obj.checked == true
    );
    if (selectedMediaTypeObj.value == MediaEnum.FILE) {
      if (
        this._mediaGalleryService.selectedNoteMedia.some(
          (obj) =>
            obj.mediaType == MediaEnum.HTML ||
            obj.mediaType == MediaEnum.PDF ||
            obj.mediaType == MediaEnum.EXCEL ||
            obj.mediaType == MediaEnum.FILE ||
            obj.mediaType == MediaEnum.TEXT ||
            obj.mediaType == MediaEnum.DOC
        )
      ) {
        return true;
      } else {
        const dialogData = new AlertDialogModel(
          this.translate.instant('Upload-media'),
          this.translate.instant('Upload-media-warning', { type: selectedMediaTypeObj.name.toLowerCase() }),
          'Yes',
          'No'
        );
        const dialogRef = this.dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });
        dialogRef.afterClosed().subscribe((obj) => {
          if (obj) {
            this._mediaGalleryService.selectedNoteMedia = [];
            this.attachNoteMedia();
          } else {
          }
        });
        return false;
      }
    } else {
      if (
        this._mediaGalleryService.selectedNoteMedia.some(
          (obj) =>
            obj.mediaType ==
            this.mediaTypeEnum[selectedMediaTypeObj.name.toUpperCase()]
        )
      ) {
        return true;
      } else {
        const dialogData = new AlertDialogModel(
          this.translate.instant('Upload-media'),
          this.translate.instant('Upload-media-warning', { type: selectedMediaTypeObj.name.toLowerCase() }),
          'Yes',
          'No'
        );
        const dialogRef = this.dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });
        dialogRef.afterClosed().subscribe((obj) => {
          if (obj) {
            this._mediaGalleryService.selectedNoteMedia = [];
            this.attachNoteMedia();
          } else {
          }
        });
        return false;
      }
    }
  }

  createMediaDataList(item, generatedArray) {
    if (generatedArray.length > 0) {
      let array = generatedArray.filter((x) => x.mediaID == item.mediaID);
      if (array.length > 0) {
      } else {
        generatedArray.push(item);
      }
    } else {
      generatedArray.push(item);
    }
    return generatedArray;
  }

  ngOnDestroy(): void {
    // this._mediaGalleryService.EmitPillsChanged.unsubscribe();
    // this._mediaGalleryService.EmitStarChangeEvent.unsubscribe();
    // this._mediaGalleryService.LoadMediaGallery.unsubscribe();
    this._mediaGalleryService.LoadMediaGallery.next(false);
    this.subs.unsubscribe();
  }

  imageLoaded(): void {
    // loaded functionality
  }

  toggleSection(section): void {
    this.activeSection = section;
    if (section === 'Media') {
      this.mediaFilterSorting.mediaType =
        this.mediaFilterSorting.mediaType.filter((obj) => {
          if (obj.value === 2) {
            obj.checked = true;
          }
          return obj;
        });
      /* reset mediaTypes */
      this.mediaGalleryFilter.mediaTypes = [];
      this.mediaFilterSorting.mediaType.forEach((obj) => {
        if (obj.checked) {
          switch (obj.value) {
            case 2:
              this.mediaGalleryFilter.mediaTypes.push(+obj.value);
              break;
            case 3:
              this.mediaGalleryFilter.mediaTypes.push(3);
              this.mediaGalleryFilter.mediaTypes.push(7);
              break;
            case 19:
              this.mediaGalleryFilter.mediaTypes.push(MediaEnum.DOC);
              this.mediaGalleryFilter.mediaTypes.push(MediaEnum.EXCEL);
              this.mediaGalleryFilter.mediaTypes.push(MediaEnum.PDF);
              this.mediaGalleryFilter.mediaTypes.push(MediaEnum.FILE);
              this.mediaGalleryFilter.mediaTypes.push(MediaEnum.TEXT);
              this.mediaGalleryFilter.mediaTypes.push(MediaEnum.HTML);
              break;
          }
        }
      });
      /* reset mediaTypes */
      this.loadMediaGallery(true);
    } 
    else if (section === 'UGC') {
      this.mediaFilterSorting.mediaType =
        this.mediaFilterSorting.mediaType.filter((obj) => {
          if (obj.value === 2 || obj.value == 3) {
            obj.checked = false;
          }
          return obj;
        });
      this.ugcRadioChange('1');
    }
  }

  searchMedia(): void {
    if (typeof this.UGCMentionObj != 'undefined') {
      this.UGCMentionObj.lstUGCMention = []
    }
    if (this.searchText.trim()) {
      this.mediaGalleryFilter.imageTags = [this.searchText];
      this.loadMediaGallery();
    } else {
      this.mediaGalleryFilter.imageTags = [];
      this.loadMediaGallery();
    }
  }

  loadMoreMedia(): void {
    this.recordOffset = this.recordOffset + 20;
    this.loadMediaGallery();
  }
  galleryPreview(imgUrl: string): void {
    let data = {
      image: imgUrl,
      brandInfo: this.brandInfo,
    };
    this.dialog.open(GalleryPreviewComponent, {
      width: '75vw',
      autoFocus: false,
      data: data,
    });
  }

  selectedBrandEvent(brandObj: brandSearchList): void {
    this.selectedBrandDetails = brandObj;
    this.UGCMentionObj.lstUGCMention = [];
    this.recordOffset = 0;
    this.loadMediaGallery();
  }

  searchBrand(value: string): void {
    const filterValue = value ? value.toLowerCase() : '';
    this.brandList = this.searchTempBrandList.filter(
      (obj) => obj.brandFriendlyName.toLowerCase().indexOf(filterValue) >= 0
    );
  }

  menuClosed(): void {
    this.inputSearchField = '';
    this.brandList = this.searchTempBrandList;
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === 32 || event.keyCode === 65) {
      // do not propagate spaces to MatSelect, as this would select the currently active option
      event.stopPropagation();
    }
  }

  onInputChange(){
    if (this.searchText.trim().length == 0) {
      this.searchMedia()
    }
  }
    public downloadMedia(file): void {
      // let url = file;
      // if (file && file.includes('s3.amazonaws.com/locobuzz.socialimages')) {
      //   url = file.replace(
      //     'https://s3.amazonaws.com/locobuzz.socialimages',
      //     'https://images.locobuzz.com'
      //   );
      // }
      saveAs(file?.mediaPath, file?.displayFileName);
    }
}
