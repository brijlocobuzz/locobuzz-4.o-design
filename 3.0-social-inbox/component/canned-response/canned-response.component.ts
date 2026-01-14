import { SectionEnum } from 'app/core/enums/SectionEnum';
import { ChangeDetectorRef, Component, Inject, OnInit, Optional } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChannelType } from 'app/core/enums/ChannelType';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { notificationType } from './../../../core/enums/notificationType';
import { CustomSnackbarComponent } from './../../../shared/components/custom-snackbar/custom-snackbar.component';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { NavigationService } from 'app/core/services/navigation.service';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { SocialScheduleService } from 'app/social-schedule/social-schedule.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-canned-response',
    templateUrl: './canned-response.component.html',
    styleUrls: ['./canned-response.component.scss'],
    standalone: false
})
export class CannedResponseComponent implements OnInit {
  cannedCategoryList: Array<any> = [];
  cannedResponseList: Array<any> = [];
  selectedCannedResponse: number;
  responseText: string;
  openedFrom: string = '';
  postObj: BaseMention;
  cannedResponseLoading: boolean = false;
  noDataAvailable = false;
  section: SectionEnum = SectionEnum.Ticket;
  selectedCannedData: any;
  loaderTypeEnum = loaderTypeEnum;
  editorConfig = {
    format_tags: 'p;h1;h2;h3;h4;h5;h6;pre',
    toolbar: [
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
  };
  brandInfo:any;
  typeFromCannedResponse: string;
  filteredCannedCategoryList: Array<any> = [];  
  filteredCannedResponseList: Array<any> = [];
  selectedCannedCategoryName: string = '';
  selectedCannedResponseName: string = '';
  selectedCannedCategoryID: number;
  acceptedResponse: boolean = false;
  acceptedCategory: boolean = false;
  defaultLayout: boolean = false;
  subs = new SubSink();
  mediaEnum = MediaEnum;
  mediaAttachments:any[] = [];
  isBulk: boolean = false;
  isMediaValidating: boolean = true;
  isMediaValidationBypass: boolean = false;
  isByPassMedia: boolean = false;
  constructor(
    private ticketService: TicketsService,
    private _postDetailService: PostDetailService,
    private _replyService: ReplyService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<CannedResponseComponent>,
    private _cdr:ChangeDetectorRef,
    private commonService: CommonService,
    private _navigationService: NavigationService,
    private _mediaGalleryService: MediagalleryService,
    private socialScheduleService: SocialScheduleService,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: any) {
    if (data?.mention) {
      this.postObj = data?.mention;
    }
    if (data?.openedFrom) {
      this.openedFrom = data?.openedFrom;
    }
    if (data?.openedFrom == 'workflow') {
      this.typeFromCannedResponse = data?.openedFrom
      this.brandInfo = data?.brandInfo;
    }

    if(data?.isMediaValidationBypass) {
      this.isMediaValidationBypass = data?.isMediaValidationBypass;
    }
    else { this.isMediaValidationBypass = false; }
    
    if (data?.isByPassMedia) {
      this.isByPassMedia = data?.isByPassMedia;
    }
    else { this.isByPassMedia = false; }
    //this.postObj = mention;
  }

  ngOnInit(): void {
    this.getCannedList();
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )

    this.isBulk = this._postDetailService.isBulk
  }

  private getCannedList(): void {
    this.cannedResponseLoading = true;
    // const object = {
    //   brandID : this._postDetailService.postObj.brandInfo.brandID,
    //   brandName : this._postDetailService.postObj.brandInfo.brandName,
    //   categoryGroupID : this._postDetailService.postObj.brandInfo.categoryGroupID,
    //   categoryID : this._postDetailService.postObj.brandInfo.categoryID,
    //   categoryName : this._postDetailService.postObj.brandInfo.categoryName,
    //   mainBrandID : this._postDetailService.postObj.brandInfo.mainBrandID,
    //   compititionBrandIDs : this._postDetailService.postObj.brandInfo.compititionBrandIDs,
    //   brandFriendlyName : this._postDetailService.postObj.brandInfo.brandFriendlyName,
    //   brandLogo : this._postDetailService.postObj.brandInfo.brandLogo,
    //   isBrandworkFlowEnabled : this._postDetailService.postObj.brandInfo.isBrandworkFlowEnabled,
    //   brandGroupName : this._postDetailService.postObj.brandInfo.brandGroupName
    // }
    let brandInfo = this.postObj?.brandInfo;
    const cannedresp = {
      Brand: brandInfo?brandInfo:this.brandInfo,
      SearchCategory: null,
    };

    this.ticketService
      .getCannedResponseCategories(cannedresp)
      .subscribe(
        (data: { data: Array<any>; message: string; success: boolean }) => {
          if (data.data.length > 0) {
            this.cannedCategoryList = data.data;
            this.filteredCannedCategoryList = this.cannedCategoryList;
            // console.log('Canned Category List', this.cannedCategoryList);
            this.selectedCannedCategoryName =
              this.cannedCategoryList[0]['responseCategoryName'];
            this.selectedCannedCategoryID =
              this.cannedCategoryList[0]['responseCategoryID'];
            this.getCannedName(this.selectedCannedCategoryID);
          }
          this.cannedResponseLoading = false;
        }
      );
  }

  filterCategories(value: string): void {
    this.acceptedCategory = false;
    const filterValue = value?.toLowerCase()?.trim();
    this.filteredCannedCategoryList = this.cannedCategoryList?.filter(category =>
      category?.responseCategoryName?.toLowerCase()?.includes(filterValue)
    );
  }
  
  selectCannedCategory(categoryName: string): void {
    if(categoryName == '' || categoryName == null){
      this.selectedCannedCategoryName = '';  
      this.mediaAttachments = [];
      this.responseText = '';
      this.getCannedName(null);  }
    else{
      const selectedCategory = this.cannedCategoryList?.find(category => category?.responseCategoryName === categoryName);
      if (selectedCategory) {
        this.selectedCannedCategoryName = selectedCategory?.responseCategoryName; // Set the name
        this.selectedCannedCategoryID = selectedCategory?.responseCategoryID; // Set the ID

        this.selectedCannedResponseName = '';
        this.mediaAttachments = [];
        this.responseText = '';
        this.getCannedName(this.selectedCannedCategoryID); // Fetch responses for the selected category
      }
    }
  }

  private getCannedName(event): void {
    this.isMediaValidating = true;
    const object = {
        Brand: this.postObj?.brandInfo ? this.postObj?.brandInfo: this.brandInfo,
        CannedCategoryID: event,
      };
    
    this.ticketService.getCannedResponse(object).subscribe({
      next: async (data) => {
        try {
          if (this.isMediaValidationBypass){
            this.cannedResponseList = data['data'];
            this.isMediaValidating = false;
            this._cdr.detectChanges();
          }
          else if (this.isByPassMedia){
            this.cannedResponseList = data['data'];
            this.cannedResponseList = this.cannedResponseList.map((response) => ({
              ...response,
              mediaAttachments:[]
            }));
            this.isMediaValidating = false;
            this._cdr.detectChanges();
          }
          else {
            this.cannedResponseList = await this.cannedResponseChannelWiseValidation(data['data']);
            // Note: isMediaValidating is set to false in the validation method's finally block
          }

          this.filteredCannedResponseList = this.cannedResponseList; // Initialize filtered list
          
          if (this.cannedResponseList.length > 0) {
            const validIndex = this.cannedResponseList.findIndex(response => !response.isDisabled);
            if (validIndex !== -1) {
              this.selectedCannedData = this.cannedResponseList[validIndex];
              this.selectedCannedResponseName = this.cannedResponseList[validIndex]['responseName'];
              this.mediaAttachments = this.cannedResponseList[validIndex]['mediaAttachments'] || [];
              this.responseText = this.CheckPersonalization(this.cannedResponseList[validIndex]['responseText']);
              this.selectedCannedData.responseType == 'text' ? this.responseText : (this.responseText = '');
            }
            this.noDataAvailable = false;
          } 
          else {
            this.noDataAvailable = true;
            this.selectedCannedResponseName = '';
            this.responseText = '';
          }
          
          // Force UI update after processing is complete
          this._cdr.detectChanges();
        } catch (error) {
          console.error('Error processing canned responses:', error);
          this.isMediaValidating = false;
          this.noDataAvailable = true;
          this.selectedCannedResponseName = '';
          this.responseText = '';
          this._cdr.detectChanges();
        }
      },
      error: (error) => {
        console.error('Error fetching canned responses:', error);
        this.isMediaValidating = false;
        this.noDataAvailable = true;
        this.selectedCannedResponseName = '';
        this.responseText = '';
        this._cdr.detectChanges();
      }
    });
  }

  filterResponses(value: string): void {
    this.acceptedResponse = false;
    const filterValue = value?.toLowerCase()?.trim();
    this.filteredCannedResponseList = this.cannedResponseList?.filter(response =>
      response?.responseName?.toLowerCase()?.includes(filterValue)
    );
  }

  selectCannedResponse(name): void {
    if(name == '' || name == null){
      this.selectedCannedResponseName = '';
      this.responseText = '';
    }
    else{
      this.selectedCannedResponseName = name;
      const selectedResponse = this.cannedResponseList?.find(response => response?.responseName == this.selectedCannedResponseName);
      this.mediaAttachments = selectedResponse?.mediaAttachments || [];
        if (selectedResponse && selectedResponse?.responseType == 'text') {
          this.responseText = this.CheckPersonalization(selectedResponse?.responseText);
        }
    }
  }

  setCannedResponse(): void {
    if (this.typeFromCannedResponse == 'workflow') {
      this.dialogRef.close({
        openedFrom: this.openedFrom,
        text: this.responseText,
        section: this._replyService.section,
      });
      return;
    }

    if (this.responseText) {
      let bulkMentionText:any = {};
      if (this._postDetailService.isBulk) {
        const selectedTickets: any[] = this.ticketService.bulkMentionChecked.filter(
          (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
        );
        const selectedResponse = this.cannedResponseList?.find(response => response?.responseName == this.selectedCannedResponseName);
        for (const ticket of selectedTickets) {
          if (selectedResponse && selectedResponse?.responseType == 'text') {
            bulkMentionText[`${ticket?.mention?.tagID}`] = this.CheckPersonalization(selectedResponse?.responseText, ticket);
          }
        }

        /* for bulk media not allowed */
        this.mediaAttachments = [];
        /* for bulk media not allowed */
      }
      if(this.postObj?.channelGroup === ChannelGroup.Email){
        this.responseText = this.responseText?.replace(/\n\n/g, '<br><br>')?.replace(/\n/g, '<br>');
      }
      this._replyService.selectedCannedResponseSignal.set({
        openedFrom: this.openedFrom,
        text: this.responseText,
        section: this._replyService.section,
        textBoxIndex: this.data?.textBoxIndex,
        tagId: this.data.mention.tagID,
        bulkMentionText: bulkMentionText || {},
        mediaAttachments: this.mediaAttachments || []
      });
      this._replyService.section = SectionEnum.Ticket;
      this.dialogRef.close(true);
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Response-can-be-empty'),
        },
      });
    }
  }

  CheckPersonalization(AutoreplyText, ticket:any = {}) {
    if (this.typeFromCannedResponse == 'workflow'){
      return AutoreplyText;
    }
    let ticketAuthor = this.postObj.author 
    if(Object.keys(ticket).length > 0){
      ticketAuthor = ticket?.mention?.author
    }
    const Author: any = {};

    Author.Name = ticketAuthor?.name;
    Author.Screenname = ticketAuthor?.screenname;
    var reg = new RegExp(/\{([^}]+)\}/g);
    Author.Name == 'Anonymous' ? (Author.Name = '') : Author.Name;
    Author.Screenname == 'Anonymous'
      ? (Author.Screenname = '')
      : Author.Screenname;
    if (reg.test(AutoreplyText)) {
      var matches = AutoreplyText.match(reg);
      if (matches.length > 0) {
        matches.forEach((element) => {
          switch (element) {
            case '{FullName}':
              var txttoreplace = '';
              if (
                Author.Name != null &&
                Author.Name != '' &&
                Author.Name != 'Anonymous'
              ) {
                txttoreplace = Author.Name;
              } else if (
                Author.Screenname != null &&
                Author.Screenname != '' &&
                this.postObj.channelType !== ChannelType.Email
              ) {
                txttoreplace = Author.Screenname;
              }
              AutoreplyText = AutoreplyText.replace(element, txttoreplace);

              break;
            case '{FirstName}':
              var firstname = '';
              if (
                Author.Name != null &&
                Author.Name != 'undefined' &&
                Author.Name != ''
              ) {
                firstname = Author.Name.split(' ');
                AutoreplyText = AutoreplyText.replace(element, firstname[0]);
              }
              break;
            case '{LastName}':
              var firstname = '';
              if (
                Author.Name != null &&
                Author.Name != 'undefined' &&
                Author.Name != ''
              ) {
                firstname = Author.Name.split(' ');
                AutoreplyText = AutoreplyText.replace(
                  element,
                  firstname.length > 1 ? firstname[1] : ''
                );
              }
              break;
            case '{ScreenName}':
              var txttoreplace = '';
              if (
                Author.Screenname != null &&
                Author.Screenname != 'undefined' &&
                Author.Screenname != '' &&
                Author.Screenname != 'Anonymous'
              ) {
                txttoreplace = Author.Screenname;
              } else if (
                Author.Name != null &&
                Author.Name != '' &&
                this.postObj.channelType !== ChannelType.Email
              ) {
                txttoreplace = Author.Name;
              }
              AutoreplyText = AutoreplyText.replace(element, txttoreplace);
              break;
            default:
              break;
          }
        });
      }
    }
    return AutoreplyText;
  }

  acceptCategoryName(event): void{
    if(this.filteredCannedCategoryList?.length == 1 && event.key == 'Enter'){
      // this.selectedCannedCategoryName = this.filteredCannedCategoryList[0]['responseCategoryName'];
      this.selectCannedCategory(this.filteredCannedCategoryList[0]['responseCategoryName']);
      this.filteredCannedCategoryList = []; 
      this.acceptedCategory = true;
    }
  }

  acceptResponseName(event): void{
    if (this.filteredCannedResponseList?.length == 1 && event.key == 'Enter') {
      // this.selectedCannedResponseName = this.filteredCannedResponseList[0]['responseName'];
      this.selectCannedResponse(this.filteredCannedResponseList[0]['responseName']);
      this.filteredCannedResponseList = [];
      this.acceptedResponse = true;
    }
  }

  onCategoryInputChange(value: string): void {
    if (value === '') {
      this.selectCannedCategory('');
    }
  }

  onResponseInputChange(value: string): void {
    if (value === '') {
      this.selectCannedResponse('');
    }
  }

  async cannedResponseChannelWiseValidation(cannedResponses: any[]): Promise<any[]> {
    let processedResponses = []
    const allowChannelGroup: ChannelGroup[] = [ChannelGroup.Twitter, ChannelGroup.Facebook, ChannelGroup.Email, ChannelGroup.Telegram, ChannelGroup.WhatsApp];
    
    try {
      if (this.postObj.channelType == ChannelType.InstagramMessages) {
        allowChannelGroup.push(ChannelGroup.Instagram);
      }

      if (allowChannelGroup.includes(this.postObj.channelGroup)) {
        const validationPromises = cannedResponses.map(async (response) => {
          try {
            response['isDisabled'] = false;
            response['disabledReason'] = '';
            const mediaAttachments = response?.mediaAttachments?.map(media => ({ ...media, mediaPath: media?.url || '' })) || [];

            // Handle async operations for media attachments
            const mediaPromises = mediaAttachments.map(async (media) => {
              if (!(media?.mediaInfo)) {
                try {
                  const payload = {
                    brandInfo: {},
                    media: [{
                      mediaID: media.mediaID,
                      URL: media.url,
                      isUGC: false,
                      mediaName: media.name,
                    }],
                  }

                  // Add timeout to prevent hanging requests
                  const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Media info request timeout')), 5000)
                  );
                  
                  const res = await Promise.race([
                    firstValueFrom(this.socialScheduleService.getMediaInfoData(payload)),
                    timeoutPromise
                  ]) as any;
                  
                  if (res && res.success) {
                    media.mediaInfo = res?.data[0]?.mediaInfo || {};
                  }
                } 
                catch (error) {
                  console.error('Error fetching media info for media ID:', media.mediaID, error);
                  // Continue processing even if individual media info fails
                }
              }
            });

            // Wait for all media info requests to complete
            await Promise.all(mediaPromises);

            // Now validate media after all mediaInfo has been fetched
            const mediaValidate = this._mediaGalleryService.validateMedia(this.postObj, mediaAttachments);
            if (!(mediaValidate.status)) {
              response['isDisabled'] = !mediaValidate.status;
              response['disabledReason'] = this.translate.instant('canned-response-media-not-support-channel');
            }

            return response;
          } 
          catch (error) {
            console.error('Error processing canned response:', response?.responseName, error);
            // Return response with error state if validation fails
            return {
              ...response,
              isDisabled: true,
              disabledReason: this.translate.instant('canned-response-validation-error') || 'Validation error'
            };
          }
        });

        // Wait for all responses to be processed
        processedResponses = await Promise.all(validationPromises);
      }
      else {
        processedResponses = cannedResponses.map((response) => {
          let extraProperties = {
            isDisabled: false,
            disabledReason: ''
          }
          if (response?.mediaAttachments?.length > 0) {
            extraProperties.isDisabled = true;
            extraProperties.disabledReason = this.translate.instant('canned-response-media-not-support-channel');
          }
          return { ...response, ...extraProperties }
        });
      }
    } 
    catch (error) {
      console.error('Error in cannedResponseChannelWiseValidation:', error);
      // Fallback: return responses with basic validation if the entire process fails
      processedResponses = cannedResponses.map((response) => ({
        ...response,
        isDisabled: false,
        disabledReason: ''
      }));
    } 
    finally {
      // Ensure loading state is always reset regardless of success or failure
      this.isMediaValidating = false;
      this._cdr.detectChanges(); // Force change detection to update UI immediately
    }
    
    console.log('Canned Responses after validation', processedResponses);
    return processedResponses;
  }
}
