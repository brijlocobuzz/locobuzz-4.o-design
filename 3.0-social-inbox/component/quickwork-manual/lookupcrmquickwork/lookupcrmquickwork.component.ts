import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicCrmIntegrationService } from 'app/accounts/services/dynamic-crm-integration.service';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { Priority } from 'app/core/enums/Priority';
import { Sentiment } from 'app/core/enums/Sentiment';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { NavigationService } from 'app/core/services/navigation.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { warn } from 'console';
import moment from 'moment';
import { element } from 'protractor';
import { Subject, Subscription, timer } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { MediaGalleryComponent } from '../../media-gallery/media-gallery.component';
import { VideoDialogComponent } from '../../video-dialog/video-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { CommonService } from 'app/core/services/common.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { J } from '@angular/cdk/keycodes';
import { cA } from '@fullcalendar/core/internal-common';

interface JsonFormValidators {
  min?: number;
  max?: number;
  required?: boolean;
  requiredTrue?: boolean;
  email?: boolean;
  minLength?: boolean;
  maxLength?: boolean;
  pattern?: string;
  nullValidator?: boolean;
}
interface JsonFormControlOptions {
  min?: string;
  max?: string;
  step?: string;
  icon?: string;
}
interface JsonFormControls {
  name: string;
  label: string;
  value: string;
  type: string;
  isDisableField: string;
  options?: JsonFormControlOptions;
  required: boolean;
  validators: JsonFormValidators;
}
export interface JsonFormData {
  controls: JsonFormControls[];
}
@Component({
    selector: 'app-lookupcrmquickwork',
    templateUrl: './lookupcrmquickwork.component.html',
    styleUrls: ['./lookupcrmquickwork.component.scss'],
    standalone: false
})

export class LookupcrmquickworkComponent implements OnInit, OnChanges,OnDestroy {
  // @Output() closeDialog = new EventEmitter();
  // @Input() brandDetails?: BrandList;
  // @Input() srid?: any;
  // @Input() postData?: BaseMention;
  // @Input() postType;
  public myFormLookupFields: FormGroup = this._fb.group({});
  public myFormDataFields: FormGroup = this._fb.group({});
  nextButtonDisable: boolean = false
  showImages: boolean = false
  durationFilterLoader: boolean = false
  lookupdata?: string = ''
  ConversationLog?: string = ''
  ErrorMessageAfterWebhook?: string = ''
  loaderTypeEnum = loaderTypeEnum;
  originalDataFields: any;
  jsonFormData: any = {}
  seconds = 0;
  subs = new SubSink();
  @ViewChild('timer') timer: ElementRef;
  countDown: Subscription;
  counter = 30;
  tick = 1000;
  timerButtonShow: boolean = false;
  reTryApiCallShow: boolean = false;
  dataFieldsWithGroupIdAndColor = [];
  lookUpFieldsWithGroupIdAndColor = [];
  FormType:any;
  inputDataFromParent:any;
  mediaSelectedAsync = new Subject<UgcMention[]>();
  mediaSelectedAsync$ = this.mediaSelectedAsync.asObservable();
  selectedNoteMedia: UgcMention[] = [];
  mediaTypeEnum = MediaEnum;
  defaultLayout: boolean = false;

  @ViewChild(CdkVirtualScrollViewport, { static: true })
  cdkVirtualScrollViewPort: CdkVirtualScrollViewport;
  formAttachmentObj: any;
  srID: any;
  tempOriginalDataField:any;
  conversationDetails:any;
  selectedIndexTab: number = 0;

  
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private _postDetailService: PostDetailService, private _matDialogRef: MatDialogRef<LookupcrmquickworkComponent>, private _snackBar: MatSnackBar, private navigationService: NavigationService, private _ticketSignalrService: TicketsignalrService, private ticketService: TicketsService, private _matDialog: MatDialog, private _cdr: ChangeDetectorRef, private _fb: FormBuilder, private _dynamicCrmIntegrationService: DynamicCrmIntegrationService,
    private mediaGalleryService: MediagalleryService,
    private _replyService: ReplyService, 
    private _dialog:MatDialog,
     private translate: TranslateService,
    private commonService: CommonService,
    private filterService:FilterService
  ) {
    // console.log(data);
    this.durationFilterLoader = true;
    this._postDetailService.postObj = data?.ticketInfo;
    this.inputDataFromParent = data;
    this.FormType = data?.FormType;
    if (data?.FormData) {
      let res = data?.FormData;
      this.durationFilterLoader = false;
      if (res.success) {
        res
        this.originalDataFields = res.data
        this.tempOriginalDataField = JSON.parse(JSON.stringify(res.data));
        if (res.data.lookupFields) {
          this.jsonFormData.lookupFields = this.convertFormToRequird(res.data.lookupFields, null, this.originalDataFields, data.AuthorDetails, data.CrmticketDetails);
          this.createForm(this.jsonFormData.lookupFields, 'lookupFields');
        }
        if (res.data.dataFields) {
                    this.conversationDetails = res?.data?.dataFields?.find(r => r.field == 'ConversationDetails')
          res.data.dataFields = res?.data?.dataFields?.filter(r => r.field != 'ConversationDetails')
          this.jsonFormData.dataFields = this.convertFormToRequird(res.data.dataFields, data?.ticketInfo, this.originalDataFields, data.AuthorDetails, data.CrmticketDetails);
          // this.jsonFormData.dataFields = this.jsonFormData.dataFields.filter((r)=>r.groupid==0);
          this.createForm(this.jsonFormData.dataFields, 'dataFields');
        }
        res.data.datafieldsGroups = res?.data?.datafieldsGroups ? res?.data?.datafieldsGroups.filter(r => r.id != 0) : []
        if (res?.data?.datafieldsGroups) {
          res?.data?.datafieldsGroups.unshift({
            "name": "",
            "id": 0,
            "color": "",
            "fieldsCount": 0,
            "mandatoryFields": "",
          })
          res.data.datafieldsGroups = res?.data?.datafieldsGroups?.map(obj => ({ ...obj, fields: this.jsonFormData.dataFields.filter((r) => r.groupId == obj.id && r.name !='formAttachment') }))
          this.formAttachmentObj = this.jsonFormData?.dataFields?.find(r=>r?.name == 'formAttachment')
          if (this.formAttachmentObj && this.formAttachmentObj?.value && this.data?.ticketInfo?.ticketInfo?.srid){
            const mediaArray = this.formAttachmentObj?.value.split(',') || [];
           const selectedMedia = this.getMediaEnumByExtension(mediaArray);  
            this.mediaSelectedAsync.next(selectedMedia)
            this.selectedNoteMedia = selectedMedia;
          }
          this.dataFieldsWithGroupIdAndColor = res?.data?.datafieldsGroups?.filter((r) => r.fields?.length>0);
          
          this.dataFieldsWithGroupIdAndColor.forEach((group) => {
            group?.fields?.forEach((field) => {
              if (field.type === 'dropdown') {
                field.dropdowndata.index = field.index || 0;
                field.dropdowndata.indexOne = field.indexOne || 0;
                field.dropdowndata.indexTwo = field.indexTwo || 0;
                field.dropdowndata.indexThree = field.indexThree || 0;
                field.dropdowndata.indexFour = field.indexFour || 0;
                field.searchDropDown = [...(field.dropdowndata || [])];
                assignSearchDropDown(field.dropdowndata);
              }
            });
          });

          function assignSearchDropDown(dropdowns: any[]) {
            if (!Array.isArray(dropdowns)) return;

            dropdowns.forEach((item) => {
              item.searchDropDown = Array.isArray(item.DropDownData) ? [...item.DropDownData] : [];

              // Recurse into next level if it exists
              if (item.DropDownData) {
                assignSearchDropDown(item.DropDownData);
              }
            });
          }

        }
        res.data.lookupfieldsGroups = res?.data?.lookupfieldsGroups ? res?.data?.lookupfieldsGroups.filter(r => r.id != 0) : []
        if (res?.data?.lookupfieldsGroups){
          res?.data?.lookupfieldsGroups.unshift({
            "name": "",
            "id": 0,
            "color": "",
            "fieldsCount": 0,
            "mandatoryFields": "",
          })
          res.data.lookupfieldsGroups = res?.data?.lookupfieldsGroups?.map(obj => ({ ...obj, fields: this.jsonFormData.lookupFields.filter((r) => r.groupId == obj.id) }))
          this.lookUpFieldsWithGroupIdAndColor = res?.data?.lookupfieldsGroups?.filter((r) => r.fields?.length > 0)
        }
        // this._cdr.detectChanges()
      }
    }
    this.dataFieldsWithGroupIdAndColor?.forEach(x => {
      x?.fields?.forEach(item => {
        // if (item?.type?.toLowerCase() == 'dynamicdropdown') {
          this.resetDependantFields(item, x?.fields, true);
        // }
      });
    });

    this.ConversationLogFn(data);
    this.srID = this.data?.ticketInfo?.ticketInfo?.srid
  }

  ngOnInit(): void {
    this.subs.add(
      this._ticketSignalrService.enableCrmManualPushTicketCRMButton.subscribe((res: any) => {
        if (res) {
          if
            (
            res?.TagID == this?.data?.ticketInfo?.tagID && res?.UserID == this?.data?.CurrentUser?.data?.user?.userId
            // && res?.UserID == this?.data?.CurrentUser?.data?.user?.userId
          ) {
            this.counter = 0
            // this.countDown.unsubscribe();
            /* this.ticketService.updateCRMDetails.next({
              TagID: this?.data?.ticketInfo?.tagID,
              SrID: res?.CrmID,
              guid: this.navigationService.currentSelectedTab.guid,
              postType: this.data?.PageType
            }); */
            this.ticketService.updateCRMDetailsSignal.set({
              TagID: this?.data?.ticketInfo?.tagID,
              SrID: res?.CrmID,
              guid: this.navigationService.currentSelectedTab.guid,
              postType: this.data?.PageType
            });
            this.timerButtonShow = false;
            this.reTryApiCallShow = false;
            this.errorMessage(this.translate.instant('SR-Created-Successfully'), 'Success')
            this._matDialogRef.close()
            this._cdr.detectChanges();
            this._ticketSignalrService.enableCrmManualPushTicketCRMButton.next(null);
          }
        }
      }
      )
    )
    this.subs.add(
      this._ticketSignalrService.enableCrmManualPushTicketCRMButtonLead.subscribe((res: any) => {
        if (res) {
          if
            (
            res?.TagID == this?.data?.ticketInfo?.tagID && res?.UserID == this?.data?.CurrentUser?.data?.user?.userId
            // && res?.UserID == this?.data?.CurrentUser?.data?.user?.userId
          ) {
            this.counter = 0
            // this.countDown.unsubscribe();
            /* this.ticketService.updateCRMDetails.next({
              TagID: this?.data?.ticketInfo?.tagID,
              leadID: res?.CrmID,
              guid: this.navigationService.currentSelectedTab.guid,
              postType: this.data?.PageType
            }); */
            this.ticketService.updateCRMDetailsSignal.set({
              TagID: this?.data?.ticketInfo?.tagID,
              leadID: res?.CrmID,
              guid: this.navigationService.currentSelectedTab.guid,
              postType: this.data?.PageType
            });
            this.timerButtonShow = false;
            this.reTryApiCallShow = false;
            this.errorMessage(this.translate.instant('Lead-ID-Created-Successfully'), 'Success')
            this._matDialogRef.close()
            this._cdr.detectChanges();
            this._ticketSignalrService.enableCrmManualPushTicketCRMButtonLead.next(null);
          }
        }
      }
      )
    )
    this.subs.add(
      this._ticketSignalrService.enableCrmManualPushTicketErrorMsg.subscribe((res: any) => {
        if (res) {
          if
            (
            res?.TagID == this?.data?.ticketInfo?.tagID && res?.UserID == this?.data?.CurrentUser?.data?.user?.userId
            // && res?.UserID == this?.data?.CurrentUser?.data?.user?.userId
          ) {
            // this.ticketService.updateCRMDetails.next({
            //   TagID: this?.data?.ticketInfo?.tagID,
            //   SrID: res?.CrmID,
            //   guid: this.navigationService.currentSelectedTab.guid,
            //   postType: this.data?.PageType
            // });
            this.timerButtonShow = false;
            this.reTryApiCallShow = true;
            this.ErrorMessageAfterWebhook = res.message
            // this.errorMessage(res.message, 'Warn')
            this.counter = 30
            this.countDown.unsubscribe();

            // this._matDialogRef.close()
            this._cdr.detectChanges()
            this._ticketSignalrService.enableCrmManualPushTicketErrorMsg.next(null);
          }
        }
      }
      )

    )

    this.subs.add(
      this._replyService.selectedNoteMedia
        .pipe(filter((res) => res?.section === SectionEnum.Ticket))
        .subscribe((ugcarray) => {
          if (ugcarray?.media && ugcarray?.media.length > 0) {
            this.mediaSelectedAsync.next(ugcarray.media);
            this.selectedNoteMedia = ugcarray.media;
          }
        })
    );

    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )

    // this.originalDataFields?.dataFields?.forEach(x => {
    //   if (x.field == "ChannelGroupName") {
    //     x.fieldData = ChannelGroup[this.data?.ticketInfo?.channelGroup];
    //   }
    //   if (x?.field?.toLowerCase()?.includes('authorna')) {
    //     x.fieldData = this.data?.ticketInfo?.author?.name;
    //   }
    //   if(x?.field=="Subject")
    //   {
    //     let parsedValue: any = '';

    //     if (x?.fieldValue && x.fieldValue !== 'null') {
    //       try {
    //         parsedValue = JSON.parse(x.fieldValue);
    //       } catch {
    //         parsedValue = '';
    //       }
    //     }

    //     x.fieldData = parsedValue;
    //   }
    // });

    if(this.conversationDetails)
    {
      this.getAgentCustomerDetails();
    }
  }
  ngOnChanges(changes: SimpleChanges) {

  }
  private createForm(controls: JsonFormControls[], type) {
    for (const control of controls) {
      const validatorsToAdd = [];
      for (const [key, value] of Object.entries(control.validators)) {
        switch (key) {
          case 'min':
            validatorsToAdd.push(Validators.min(value));
            break;
          case 'max':
            validatorsToAdd.push(Validators.max(value));
            break;
          case 'required':
            if (value) {
              validatorsToAdd.push(Validators.required);
            }
            break;
          case 'requiredTrue':
            if (value) {
              validatorsToAdd.push(Validators.requiredTrue);
            }
            break;
          case 'email':
            if (value) {
              validatorsToAdd.push(Validators.email);
            }
            break;
          case 'minLength':
            validatorsToAdd.push(Validators.minLength(value));
            break;
          case 'maxLength':
            validatorsToAdd.push(Validators.maxLength(value));
            break;
          case 'pattern':
            validatorsToAdd.push(Validators.pattern(value));
            break;
          case 'nullValidator':
            if (value) {
              validatorsToAdd.push(Validators.nullValidator);
            }
            break;
          default:
            break;
        }
      }
      if (type == 'lookupFields') {
        this.myFormLookupFields.addControl(
          control.name,
          this._fb.control(control.value, validatorsToAdd)
        );
      } else {
        this.myFormDataFields.addControl(
          control.name,
          this._fb.control(control.value, validatorsToAdd)
        );

      }
    }
  }
  private ConversationLogFn(data) {
    let body = {
      "Brandid": +data?.brandObj?.brandID,
      "TagId": +data?.ticketInfo?.tagID,
      "TicketId": +data?.ticketInfo?.ticketID
    }
    this._dynamicCrmIntegrationService.ConversationLogFn(body).subscribe((res) => {
      if (res.success) {
        this.ConversationLog = res?.data?.map(item => `@${item.authorName}:\n ${item.createdDate}:\n ${item.description}`).join('\n\n');
      }
    })
  }
  // get f() {
  //   return this.myForm.controls;
  // }
  loading: boolean = false;
  convertFormToRequird(inputArray, data, Array, AuthorDetails, CrmticketDetails) {
    const mergedObject = {
      ...data?.author?.locoBuzzCRMDetails, ...AuthorDetails?.locoBuzzCRMDetails, ...AuthorDetails?.locobuzzCRMDetailsTicket, ...CrmticketDetails?.ticketInfoOnSave[0]
    };
    let mergeArray = []
    if (mergedObject && (mergedObject?.customCRMColumnXml || mergedObject?.ticketCustomColumnXml)) {
      mergeArray = [...mergedObject.customCRMColumnXml ? mergedObject.customCRMColumnXml : [], ...mergedObject.ticketCustomColumnXml ? mergedObject.ticketCustomColumnXml : []]
    }
    function convertObject(inputObject) {
      // let value = data?.author?.locoBuzzCRMDetails.find(r => r.hasOwnProperty == inputObject.field)?.value
      let val,dynamicFieldValue;
      if (data) {

        let KeyValue = Object?.entries(mergedObject)?.find(([key, value]) => key?.toLowerCase() === inputObject?.field?.toLowerCase())

        // console.log(mergedObject);
        if (KeyValue) {
          const [, value] = KeyValue;
          val = value;
        } else {
          let data = mergeArray.find((element) => element?.excelColumn?.toLowerCase() == inputObject?.field?.toLowerCase());
          if (inputObject?.dataType?.toLowerCase() != 'dynamicdropdown'){
          if (data?.dropDownData) {
            inputObject.fieldValue = data.dropDownData
            let DropDownData = JSON.parse(data.dropDownData)[0]?.DropDownData
            // this.getInnerDropdownValue(data?.customColumValue, inputObject, JSON.parse(data.dropDownData)[0]?.DropDownData)
            inputObject.value2 = DropDownData.find((res) => data?.customColumValue === res.Value)?.selected;
            inputObject.value2Name = DropDownData.find((res) => data?.customColumValue === res.Value)?.DropDownName;
            // this.dropdownSelectionSecond()
            inputObject.index = DropDownData.findIndex((res) => data?.customColumValue?.toLowerCase() === res.Value?.toLowerCase()) <= 0 ? 0 : DropDownData.findIndex((res) => data?.customColumValue?.toLowerCase() === res.Value?.toLowerCase());
            if (DropDownData && DropDownData.length && (inputObject.index || inputObject.index == 0)) {
              if (DropDownData[inputObject?.index]?.DropDownData && DropDownData[inputObject?.index]?.DropDownData.length) {
                inputObject.value3 = DropDownData[inputObject?.index]?.DropDownData.find(
                  (res) => inputObject.value2 === res.Value
                )?.selected;
                inputObject.value3Name = DropDownData[inputObject?.index]?.DropDownData.find(
                  (res) => inputObject.value2 === res.Value
                )?.DropDownName;
                inputObject.indexOne = DropDownData[inputObject?.index]?.DropDownData.findIndex(
                  (res) => inputObject.value2 === res.Value
                ) <=0 ? 0 : DropDownData[inputObject?.index]?.DropDownData.findIndex(
                  (res) => inputObject.value2?.toLowerCase() === res.Value?.toLowerCase()
                );
                              }
            }
          }
            val = data?.customColumValue
        }else{
            dynamicFieldValue = data?.dropDownData
            try
            {
              val = JSON.parse(dynamicFieldValue)
            }
            catch (error)
            {
              val=''
            }
          }
        }
      }
      if (inputObject?.field?.toLowerCase() == ('description')) {
        val = data?.description;
      } else if (inputObject?.field?.toLowerCase()?.includes('authorna')) {
        val = data?.author?.name;
      } else if (inputObject?.field?.toLowerCase().includes('ticketid')) {
        val = data?.ticketID;
      } else if (inputObject?.field?.toLowerCase() == ('priority')) {
        val = Priority[data?.ticketInfo?.ticketPriority]
      } else if (inputObject?.field?.toLowerCase().includes('sentimenttype')) {
        val = Sentiment[extractSentimentValues((data?.categoryMap))]
      } else if (inputObject?.field?.toLowerCase().includes('inserteddate')) {
        val = moment.utc(data?.insertedDate).local().format("YYYY-MM-DD hh:mm:ss A");
      } else if (inputObject?.field?.toLowerCase().includes('modifieddate')) {
        val = moment.utc(data?.modifiedDate).local().format("YYYY-MM-DD hh:mm:ss A");
      } else if (inputObject?.field?.toLowerCase().includes('numberofmentions')) {
        val = data?.numberOfMentions
      } else if (inputObject?.field?.toLowerCase().includes("createddate")) {
        val = moment.utc(data?.ticketInfo?.caseCreatedDate).local().format("YYYY-MM-DD hh:mm:ss A");
      } else if (inputObject?.field == ("Bio")) {
        val = data?.author?.bio
      } else if (inputObject?.field == ("FollowersCount")) {
        val = data?.author?.followersCount;
      } else if (inputObject?.field == ("FollowingCount")) {
        val = data?.author?.followingCount;
      } else if (inputObject?.field == ("ChannelGroupName")) {
        val = ChannelGroup[data?.channelGroup]
      } else if (inputObject?.field == ("ScreenName")) {
        val = data?.author?.screenname?'@'+data?.author?.screenname:''
      } else if (inputObject?.field == ("AuthorPicUrl")) {
        val = data?.author?.picUrl
      } else if (inputObject?.field == ("InfluencerCategory")) {
        val = data?.author?.markedInfluencerCategoryName
      } else if (inputObject?.field == ("AuthorProfileUrl")) {
        val = setProfileUrl(AuthorDetails);
      } else if (inputObject?.field?.toLowerCase()?.replace(/\s+/g, '') == "firstname") {
        const firstName = AuthorDetails?.name?.split(' ')?.[0];
        val = firstName;
      } else if (inputObject?.field?.toLowerCase()?.replace(/\s+/g, '') == "lastname") {
        const lastName = AuthorDetails?.name?.split(' ')?.[1];
        val = lastName;
      }
      if(val=='null') val = '';
      const outputObject = {
        "name": inputObject.field,
        "label": inputObject.displayName,
        "value": val || '',
        "type": inputObject.dataType?.toLowerCase() || inputObject.type?.toLowerCase() || "text",
        "priority": inputObject.priority,
        "isDisableField": inputObject?.isDisableField,
        "isRequired": inputObject.isRequired,
        "validators": {
          "required": false
        },
        "index": inputObject?.index || 0,
        "value2": inputObject?.value2 || '',
        "indexOne": inputObject?.indexOne || 0,
        "indexTwo": inputObject?.indexTwo || 0,
        "indexThree": inputObject?.indexThree || 0,
        "indexFour": inputObject?.indexFour || 0,
        "value3": inputObject?.value3 || '',
         "value4": inputObject?.value4 || '',
        "value5": inputObject?.value5 || '',
        "value6": inputObject?.value6 || '',
        "characterLimit": inputObject?.characterLimit,
        "groupId": inputObject?.groupId,
        // "dropdowndata": inputObject.fieldValue && inputObject.dataType?.toLowerCase() == 'dropdown' ? JSON.parse(inputObject.fieldValue)?.[0]?.DropDownData || [] : [],
        "dropdowndata": inputObject.fieldValue && inputObject.dataType?.toLowerCase() == 'dropdown' ? JSON.parse(inputObject.fieldValue)[0]?.DropDownData : dynamicFieldValue && dynamicFieldValue!='null' && inputObject.dataType?.toLowerCase() == 'dynamicdropdown' ? checkReturnValidJSON(dynamicFieldValue) : [],
        "apiConfigKey": inputObject?.apiConfigKey || null,
        "dependsOn":inputObject?.dependsOn || [],
        "IsDependent": inputObject?.IsDependent || null,
        "fieldId": inputObject?.fieldId || null,
        "fieldData_id": inputObject?.fieldData_id || null,
        "requirementRules":inputObject?.requirementRules || [],
        "requirementTargetIds": inputObject?.requirementTargetIds || [],
        "visibilityTargetIds": inputObject?.visibilityTargetIds || [],
        "visibilityRules": inputObject?.visibilityRules || [],
        "hideField":(inputObject?.defaultVisibility!=null)?inputObject?.defaultVisibility==true?false:true:false,
        "autoFillTargetIds": inputObject?.autoFillTargetIds || [],
        "autoFillRules": inputObject?.autoFillRules || null,
        "dependsOnRules": inputObject?.dependsOnRules || null,
        "isNonEditable": inputObject?.isNonEditable || false,
      };
      if (val) {
        Array?.dataFields.forEach((element) => {
          if (element.field == outputObject.name) {
            element.fieldData = val;
          }
            if (element.value2 ) {
             dropdownSelectionSecond(element.value2, element, element.value2Name)
            }
            if (element.value3 ) {
             dropdownSelectionSecond(element.value3, element, element.value3Name)
            }
        });
      }
      function extractSentimentValues(data) {
        let sentimentsData = data?.flatMap(item => {
          const sentimentValues = [];
          if (item.sentiment !== undefined && item.sentiment !== null) {
            sentimentValues.push(item.sentiment);
          }
          if (item.subCategories && item.subCategories.length > 0) {
            item.subCategories.forEach(subCategory => {
              if (subCategory.sentiment !== undefined && subCategory.sentiment !== null) {
                sentimentValues.push(subCategory.sentiment);
              }
              if (subCategory.subSubCategories && subCategory.subSubCategories.length > 0) {
                subCategory.subSubCategories.forEach(subSubCategory => {
                  if (subSubCategory.sentiment !== undefined && subSubCategory.sentiment !== null) {
                    sentimentValues.push(subSubCategory.sentiment);
                  }
                });
              }
            });
          }
          return sentimentValues;

        });
        if (sentimentsData?.includes(Sentiment.Negative)) {
          return Sentiment.Negative;
        } else {
          return (data[0]?.subCategories?.length > 0 ? (data[0]?.subCategories[0]?.subSubCategories?.length > 0 ? data[0]?.subCategories[0]?.subSubCategories[0]?.sentiment : data[0]?.subCategories[0]?.sentiment) : data[0]?.sentiment)
        }
        // console.log(sentimentsData);
        // return 2;
      };

    function checkReturnValidJSON(value)
      {
        let parsedValue
        try {
          parsedValue = JSON.parse(value)
          if (typeof parsedValue === 'object')
          {
            parsedValue = [parsedValue]
          }else
          {
            parsedValue=[]
          }
        } catch (e) {
          parsedValue = []
        }
        return parsedValue
      }
      return outputObject;
    }
    function setProfileUrl(authorObj) {
      switch (authorObj.channelGroup) {
        case ChannelGroup.Twitter: {
          return 'https://www.twitter.com/' + authorObj?.screenname;
        }
        case ChannelGroup.Facebook: {
          // this.customAuthorDetails.screenName = authorObj.name;
          // this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          if (authorObj.socialId && authorObj.socialId !== '0' && data?.channelType != 40) {
            // this.customAuthorDetails.profileUrl = 

            return 'http://www.facebook.com/' + authorObj?.socialId;
            // if (!authorObj.picUrl) {
            //   this.customAuthorDetails.profilePicUrl =
            //     'assets/images/agentimages/sample-image.svg';
            // }
          } else {
            return '';
          }
          // break;
        }
        case ChannelGroup.Instagram: {
          return 'https://www.instagram.com/' + authorObj?.screenname;
          // break;
        }
        case ChannelGroup.WhatsApp: {
          // this.customAuthorDetails.screenName = authorObj.name;
          return authorObj?.profileUrl;
          // break;
        }
        case ChannelGroup.WebsiteChatBot: {
          // // this.customAuthorDetails.screenName = authorObj.name;
          // this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          // this.customAuthorDetails.profileUrl = 
          // break;
          return authorObj?.profileUrl;
        }
        case ChannelGroup.Youtube: {
          // this.customAuthorDetails.screenName = authorObj.name;

          return "https://www.youtube.com/channel/" + authorObj?.socialId;;
          // break;
          // this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          // this.customAuthorDetails.profileUrl = authorObj.profileUrl;
        }
        // case ChannelGroup.LinkedIn: {
        //   // this.customAuthorDetails.screenName = authorObj.name;
        //   // this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
        //   // this.customAuthorDetails.profileUrl = authorObj.profileUrl;
        //   return "https://www.linkedin.com/in/" + authorObj?.SocialHandle;
        //   // break;
        // }
        case ChannelGroup.GooglePlayStore: {
          // this.customAuthorDetails.screenName = authorObj.name;
          return authorObj?.profileUrl;
          // this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          // this.customAuthorDetails?.profileUrl = authorObj?.profileUrl;
          // break;
        }
        case ChannelGroup.Email: {
          return authorObj?.profileUrl;
          // this.customAuthorDetails.screenName = authorObj.socialId;
          // break;
        }
        case ChannelGroup.Voice: {
          // this.customAuthorDetails.screenName = authorObj.socialId;
          return authorObj?.profileUrl;

          // break;
        }
        default: {
          // this.customAuthorDetails.screenName = authorObj.name;
          return authorObj?.profileUrl;
          // this.customAuthorDetails.profilePicUrl = authorObj.picUrl;
          // this.customAuthorDetails.profileUrl = authorObj.profileUrl;
          break;
        }
      }
    }
    const outputArray = [];
    Array.newdataPayload = [];
    function dropdownSelectionSecond(data,type,name) {
      let secondeLevelDropDown = JSON.parse(JSON.stringify(Array.dataFields.find(element => (element.field == (type?.name || type?.field)))));
      secondeLevelDropDown.field = name;
      secondeLevelDropDown.displayName = name;
      secondeLevelDropDown.fieldData = data;
      secondeLevelDropDown.isRequired = type?.isRequired;
      secondeLevelDropDown.fieldValue = null;
      secondeLevelDropDown.value2 = secondeLevelDropDown?.fieldData;
      let findIndex = Array?.newdataPayload?.findIndex(r => r.field == name)
      if (findIndex >= 0) {
        Array.newdataPayload[findIndex].fieldData = data;
      } else {
        Array.newdataPayload.push(secondeLevelDropDown);
      }
    }
    inputArray.forEach(inputObject => {
      const convertedObject = convertObject(inputObject);
      outputArray.push(convertedObject);
    });
    outputArray.sort((a, b) => a.priority - b.priority)
    return outputArray;

  }

  enableDiableFromFieldDataPush(data, type, flag) {
    let keys = Object.keys(this.myFormDataFields.controls);
    if (type.type == 'date' || type.type =='datetime'){
      type.value = moment(data?.startDate ? data?.startDate?.toString() : new Date()).format("DD-MM-YYYY hh:mm A")
    } else{
      type.value = data
    }
    // if (data != '') {
    keys.forEach((r) => {
      if (r == type.name) {
        // this.myFormDataFields.controls[r].enable();
        this.getLoopupData(data, type, flag)
      }
    })
    // } else {
    //   // this.nextButtonDisable = true;
    //   // this.myFormLookupFields.enable()
    // }
  }
  crmDetailsPayload: any;
  getLoopupData(value, type, flag?) {
    if (flag == 'lookup') {
      this.originalDataFields?.lookupFields.forEach(element => {
        if (element.field == type.name) {
          element.fieldData = type.value;
          element.fieldValue = null
        }
      });
    } else {
      this.originalDataFields?.dataFields.forEach(element => {
        if (element.field == type.name) {
          element.fieldData = type.value;
          element.fieldValue = null
        }
      });
    }
  }
  errorMessage(message, type) {
    this.loading = false
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: type == 'Warn' ? notificationType.Warn : notificationType.Success,
        message: message,
      },
    });
    this._cdr.detectChanges()
  }

  removewithfilter(arr) {
    let outputArray = arr.filter(function (v, i, self) {
      return i == self.indexOf(v);
    });
    return outputArray;
  }
  errorMesArr = [];
  SaveManaulpushCRMData() {
    this.errorMesArr = [];
    let validationClear = true;
    let validationClearMsg = '';

    
    this.originalDataFields?.dataFields.forEach((r, index) => {
      if (r?.field == 'EmailID' && r.fieldData?.length > 0) {
        if (!/^([a-zA-Z0-9_&\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(r.fieldData)) {
          this.errorMessage(this.translate.instant('Please-enter-a-valid-Email-ID'), 'Warn')
          validationClear = false
          this.errorMesArr.push(r?.displayName)
          return;
        } else {
          validationClear = true
        }
      }
      if (r.isRequired && (!r.fieldData) && r.groupId == 0 && !r?.hideField) {
        validationClear = false;
        this.errorMesArr.push(r?.displayName)
        validationClearMsg = "Please fill the " + r?.displayName + ' field value!';
      }
      //  else if (r.isRequired && (!r.fieldData || r.fieldData?.trim().length == 0) && r.groupId!=0){
      //   // validationClear = this.groupMMarkMendatory(r);
      //   this.groupMMarkMendatory(r)
      // }
      // if (r.value2 && r.dataType == "DropDown") {
      //   r.fieldValue = null
      //   r.value2 = this.jsonFormData.dataFields[index]?.dropdowndata[this.jsonFormData.dataFields[index]?.index]?.selected || r.value2 
      //   this.dropdownSelectionSecond(r.value2, r, this.jsonFormData.dataFields[index]?.dropdowndata[this.jsonFormData.dataFields[index].index]?.DropDownName)
      // }
      // if (r.value3 && r.dataType == "DropDown") {
      //   this.jsonFormData.dataFields[index].indexOne < 0 ? 0 : this.jsonFormData.dataFields[index].indexOne;
      //   // r.value3 = 
      //   this.dropdownSelectionSecond(r.value3, r, this.jsonFormData.dataFields[index]?.dropdowndata[this.jsonFormData.dataFields[index].index]?.DropDownData[this.jsonFormData.dataFields[index]?.indexOne]?.DropDownName)
      // }
    })
    this.groupMMarkMendatory()
    // if (this.newdataPayload?.length>0){
    //   this.newdataPayload.forEach((r)=>{
    //     if ((!r.fieldData || r.fieldData?.trim().length == 0)) {
    //       validationClear = false;
    //       this.errorMesArr.push(r?.displayName)
    //       validationClearMsg = "Please fill the " + r?.displayName + ' field value!';
    //     }
    //   })
    // }
    const normalFields = this.dataFieldsWithGroupIdAndColor.find((r) => r.validationClear == false && r.name == '')

    if (normalFields) {
      this.errorMessage("Please fill the mandatory fields", 'Warn')
      return
    }

    let errorsGroupDetails = this.dataFieldsWithGroupIdAndColor.find((r) => r.validationClear == false && r.mandatoryFields)
    if (errorsGroupDetails){
      this.errorMessage(`${errorsGroupDetails?.name} - To submit the form, you must fill out any ${(errorsGroupDetails?.mandatoryFields && errorsGroupDetails?.mandatoryFields != '0' && errorsGroupDetails?.mandatoryFields != '') ? errorsGroupDetails?.mandatoryFields : errorsGroupDetails?.fields?.length} of the ${errorsGroupDetails?.fields?.length} fields`, 'Warn')
      return;
    }
    if(this.dataFieldsWithGroupIdAndColor?.filter(r=> r?.id==0)[0]?.fields?.find(r=>r?.label == this.errorMesArr[0])?.label){
      this.errorMessage(`Please enter a required field `+ this.dataFieldsWithGroupIdAndColor.filter(r=> r.id==0)[0]?.fields.find(r=>r.label == this.errorMesArr[0])?.label, 'Warn')
      return;
    }

    var result=[];
    if (this.originalDataFields?.newdataPayload?.length == 0 ){
      this.originalDataFields.newdataPayload = this.newdataPayload;
      result = this.newdataPayload;
    } else{
      this.originalDataFields?.newdataPayload.forEach((ele) => {
        if (!ele.fieldData) {
          if (ele.field == ele.value2Name) {
            ele.fieldData = ele.value2
          } else if (ele.field == ele.value3Name) {
            ele.fieldData = ele.value3
          }
        }
      })
      let data = [...this.originalDataFields?.newdataPayload, ...this.newdataPayload]
      const uniqueValuesMap = new Map();

      // Iterate through the array and add items to the Map
      data.forEach(item => {
        const fieldName = item.field;
        if (!uniqueValuesMap.has(fieldName)) {
          uniqueValuesMap.set(fieldName, item);
        }
      });
      
      // Convert the Map values back to an array
      result = Array.from(uniqueValuesMap.values());
    }

    if(this.conversationDetails)
    {
      if (this.originalDataFields.dataFields?.some((x) => x.field == 'ConversationDetails'))
      {
        this.originalDataFields.dataFields.find((x) => x.field == 'ConversationDetails').fieldData = this.conversationDetails?.fieldData
      }else{
        this.originalDataFields.dataFields.push(this.conversationDetails)
      }
    }

     this.crmDetailsPayload = {
      "BrandID": this.data?.brandObj?.brandID,
      "EventType": this.FormType == 'Case' ? "CreateCase":"CreateContact",
      "CaseID": this.data?.ticketInfo?.ticketID,
      "TagID": this.data?.ticketInfo?.tagID,
      "SocialId": this.data?.ticketInfo?.author?.socialId,
      "MapId": +this.data?.ticketInfo?.ticketInfoCrm?.mapid,
       "Datafields": [...this.originalDataFields?.dataFields, ...result]?.sort((a, b) => a?.priority - b?.priority),
    }

    if(this.crmDetailsPayload?.Datafields?.length > 0 && this.formAttachmentObj){
      this.crmDetailsPayload.Datafields.forEach((r)=>{
        if (r.field =='formAttachment')
        {
          r.fieldData = this.selectedNoteMedia.map(r => r.mediaPath).join(',')
        }
      })
    }

    if (validationClear) {
      this.loading = true;
      this.timerButtonShow = true;
      this.FormType == 'Case' ? this._dynamicCrmIntegrationService.SaveManaulpushCRMData(this.crmDetailsPayload).subscribe((res) => {
        this.loading = false;
        // console.log(res);
        if (res?.success) {
          this.counter = 30
          this.updateTimer()
          // this._matDialog.closeAll()
        } else {
          this.timerButtonShow = false;
          this.errorMessage(res?.message, 'Warn')
        }
      }):
        this._dynamicCrmIntegrationService.SaveLeadManualpushCRMData(this.crmDetailsPayload)
          .subscribe((res) => {
            this.loading = false;
            // console.log(res);
            if (res?.success) {
              this.counter = 30
              this.updateTimer()
              // this._matDialog.closeAll()
            } else {
              this.errorMessage(res?.message, 'Warn')
            }
          })
    }
  }
  innerDropdown: any;
  groupMMarkMendatory(){
    let emptyArrays=[]
    this.originalDataFields.datafieldsGroups.forEach((res)=>{
      let filledFieldCount=0
      res.fields.forEach((res2)=>{
        if(res2.value && res2.value!=''){
          filledFieldCount++;
          if(res2.type == 'dropdown' && res2.value != '' && res2.value && res2?.dropdowndata?.length > 0){
            if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData?.length > 0 && res2?.value2!='')
            {
              filledFieldCount++;
              if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData[res2?.dropdowndata?.indexOne]?.DropDownData?.length > 0 && res2?.value3!=''){
                filledFieldCount++;
                if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData[res2?.dropdowndata?.indexOne]?.DropDownData[res2?.dropdowndata?.indexTwo]?.DropDownData?.length > 0 && res2?.value4!=''){
                  filledFieldCount++;
                  if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData[res2?.dropdowndata?.indexOne]?.DropDownData[res2?.dropdowndata?.indexTwo]?.DropDownData[res2?.dropdowndata?.indexThree]?.DropDownData?.length > 0 && res2?.value5!=''){
                    filledFieldCount++;
                    if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData[res2?.dropdowndata?.indexOne]?.DropDownData[res2?.dropdowndata?.indexTwo]?.DropDownData[res2?.dropdowndata?.indexThree]?.DropDownData[res2?.dropdowndata?.indexFour]?.DropDownData?.length > 0 && res2?.value6!=''){
                      filledFieldCount++;
                    }
                  }
              }
            }
          }
        }
      }
    })
      res.fieldsCount = this.getOverallFilledFieldCount(res?.fields);
      // destinationArray = [...sourceArray]
      if(res.name!='')
      {
      if (filledFieldCount >= (+res.mandatoryFields + this.getDropdownFilledFieldCount(res?.fields)) && res.mandatoryFields!='0'){
        res.validationClear = true
      } else if (filledFieldCount > +res.mandatoryFields && res.mandatoryFields != '0')
        {
        res.validationClear = true
        } else if (res.mandatoryFields == '0' && filledFieldCount != res.fieldsCount){
        res.validationClear = false
        emptyArrays.push(res.fields.filter(res2 => (!res2.value || res2.value == '') && res2.isRequired)?.map(obj => obj.label))
      } else if (res.mandatoryFields == '0' && filledFieldCount == res.fieldsCount) {
        res.validationClear = true
      }else{
        res.validationClear = false
        emptyArrays.push(res.fields.filter(res2 =>( !res2.value || res2.value == '') && res2.isRequired)?.map(obj => obj.label))
      }
    }else
    {
        filledFieldCount =0
        res.fields.forEach((res2) => {
          if (res2.value && res2.value != '' && res2.isRequired) {
            filledFieldCount++;
            if (res2.type == 'dropdown' && res2.value != '' && res2.value && res2?.dropdowndata?.length > 0) {
              if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData?.length > 0 && res2?.value2 != '') {
                filledFieldCount++;
                if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData[res2?.dropdowndata?.indexOne]?.DropDownData?.length > 0 && res2?.value3 != '') {
                  filledFieldCount++;
                  if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData[res2?.dropdowndata?.indexOne]?.DropDownData[res2?.dropdowndata?.indexTwo]?.DropDownData?.length > 0 && res2?.value4 != '') {
                    filledFieldCount++;
                    if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData[res2?.dropdowndata?.indexOne]?.DropDownData[res2?.dropdowndata?.indexTwo]?.DropDownData[res2?.dropdowndata?.indexThree]?.DropDownData?.length > 0 && res2?.value5 != '') {
                      filledFieldCount++;
                      if (res2?.dropdowndata[res2?.dropdowndata?.index]?.DropDownData[res2?.dropdowndata?.indexOne]?.DropDownData[res2?.dropdowndata?.indexTwo]?.DropDownData[res2?.dropdowndata?.indexThree]?.DropDownData[res2?.dropdowndata?.indexFour]?.DropDownData?.length > 0 && res2?.value6 != '') {
                        filledFieldCount++;
                      }
                    }
                  }
                }
              }
            }
          }
        })
      res.fieldsCount = this.getOverallOnlyRequiredFilledFieldCount(res?.fields);
        if (filledFieldCount != res.fieldsCount)
        {
          res.validationClear = false
        }else
        {
          res.validationClear = true
        }
    }
    })
    this.errorMesArr = [].concat(this.errorMesArr,...emptyArrays);
  }
  dropdownSelection(data, type, flag) {
    let keys = Object.keys(this.myFormDataFields.controls);
    type.value = data;
    if (data != '') {
      keys.forEach((r) => {
        if (r == type.name) {
          // this.myFormDataFields.controls[r].enable();
          this.getLoopupData(data, type, flag)
        }
      })
    } else {
      // this.nextButtonDisable = true;
      // this.myFormLookupFields.enable()
    }
    if (type?.dropdowndata?.length > 0) {
      type.innerDropdown = true;
    }
  }
  newdataPayload = []
  dropdownSelectionSecond(data, type, name) {
    let keys = Object.keys(this.myFormDataFields.controls);
    if (data) {
      keys.forEach((r) => {
        if (r == type.name || r == type.field) {
          let secondeLevelDropDown = JSON.parse(JSON.stringify(this.originalDataFields?.dataFields.find(element => (element.field == (type?.name || type?.field)))));
          secondeLevelDropDown.field = name;
          secondeLevelDropDown.displayName = name;
          secondeLevelDropDown.fieldData = data;
          secondeLevelDropDown.isRequired = type?.isRequired;
          secondeLevelDropDown.fieldValue = null;
          secondeLevelDropDown.value2 = secondeLevelDropDown?.fieldData;
          let findIndex = this.newdataPayload.findIndex(r => r.field == name)
          if (findIndex >= 0) {
            this.newdataPayload[findIndex].fieldData = data;
          } else {
            this.newdataPayload.push(secondeLevelDropDown);
          }
          // this.newdataPayload = this.removeDuplicate(this.newdataPayload)
        }
      })
    }
  }

  clearDependentFieldData(state: any, dropDownName: string) {
    if (dropDownName) {
      this.originalDataFields?.newdataPayload.forEach((r) => {
        if (r?.field?.toLowerCase() == dropDownName?.toLowerCase()) {
          r.fieldData = null
          r.value2 = null
          r.value3 = null
          r.value4 = null
          r.value5 = null
          r.value6 = null
        }
      })

      // Also clear from dataFields if exists
      this.originalDataFields?.dataFields.forEach((element) => {
        if (element.field?.toLowerCase() == dropDownName?.toLowerCase()) {
          element.fieldData = null
          element.fieldValue = null
          element.value2 = null
          element.value3 = null
          element.value4 = null
          element.value5 = null
          element.value6 = null
        }
      });

      this.newdataPayload.forEach((r) => {
        if (r?.field?.toLowerCase() == dropDownName?.toLowerCase()) {
          r.fieldData = null
          r.value2 = null
          r.value3 = null
          r.value4 = null
          r.value5 = null
          r.value6 = null
        }
      })
    }
  }

  changeTicketFirstLevelDropdown(event, state, data, flag) {
    let index = data.findIndex(r => r.Value == event)
    console.log(event);
    let zIndex = this.jsonFormData.dataFields.findIndex(r => r.label == state.label)
    state.dropdowndata.index = index;
    state.dropdowndata.indexOne = 0;
    state.dropdowndata.indexTwo = 0;
    state.dropdowndata.indexThree = 0;
    state.dropdowndata.indexFour = 0;
    this.jsonFormData.dataFields[zIndex].value = state.dropdowndata[index].Value
    this.jsonFormData.dataFields[zIndex].dropdowndata.selected = state.dropdowndata[index].Value;
    this.dropdownSelection(state.dropdowndata[index].Value, this.jsonFormData.dataFields[zIndex], flag)
    this.originalDataFields?.newdataPayload.forEach((r) => {
      if (r?.field?.toLowerCase() == state?.dropdowndata[index]?.DropDownName?.toLowerCase()) {
        r.fieldData = null
      }
    })

    // Check if dependent levels have valid DropDownData, if not clear their field data
    const selectedDropdown = state.dropdowndata[index];
    // Level 2 doesn't exist, clear all dependent field data
    if (selectedDropdown?.DropDownName) {
      this.clearDependentFieldData(state, selectedDropdown?.DropDownName);

      // Level 2 exists, check level 3
      const level2Data = selectedDropdown.DropDownData[0];
      if (level2Data?.DropDownName) {
        // Level 3 doesn't exist, clear level 3+ field data
        this.clearDependentFieldData(state, level2Data?.DropDownName);

        // Level 3 exists, check level 4
        const level3Data = level2Data.DropDownData[0];
        if (level3Data?.DropDownName) {
          // Level 4 doesn't exist, clear level 4+ field data
          this.clearDependentFieldData(state, level3Data?.DropDownName);

          // Level 4 exists, check level 5
          const level4Data = level3Data.DropDownData[0];
          if (level4Data?.DropDownName) {
            // Level 5 doesn't exist, clear level 5+ field data
            this.clearDependentFieldData(state, level4Data?.DropDownName);

            // Level 5 exists, check level 6
            const level5Data = level4Data.DropDownData[0];
            if (level5Data?.DropDownName) {
              // Level 6 doesn't exist, clear level 6+ field data
              this.clearDependentFieldData(state, level5Data?.DropDownName);
            }
          }
        }
      }
    }

    state.value2 =''
    state.value3 = ''
    state.value4 = ''
    state.value5 = ''
    state.value6 = ''
    // this.cd.detectChanges();
    this.changeEmptyArray();
  }
  changeTicketSecondLevelDropdown(event, state, data) {
    let index = data.findIndex(r => r.Value == event)
    let zIndex = this.jsonFormData.dataFields.findIndex(r => r.label == state.label)
    if (!(state.dropdowndata.index>=0)) {
      state.dropdowndata.index = state.index;
    }
    state.dropdowndata.indexOne = index;
    state.dropdowndata.indexTwo = 0;
    state.dropdowndata.indexThree = 0;
    state.dropdowndata.indexFour = 0;
    state.dropdowndata.index = state?.dropdowndata?.index ? state?.dropdowndata?.index : this.jsonFormData?.dataFields[zIndex]?.dropdowndata.findIndex((r) => r?.Value == this.jsonFormData?.dataFields[zIndex]?.value)
    this.jsonFormData.dataFields[zIndex].dropdowndata[state?.dropdowndata?.index].selected = state?.dropdowndata[state?.dropdowndata?.index ].DropDownData[index].Value;
    this.dropdownSelectionSecond(this.jsonFormData.dataFields[zIndex].dropdowndata[state?.dropdowndata?.index].selected, this.jsonFormData.dataFields[zIndex], this.jsonFormData.dataFields[zIndex]?.dropdowndata[this.jsonFormData.dataFields[zIndex]?.dropdowndata?.index]?.DropDownName)
    // this.changeDetectionRef.detectChanges();
    this.originalDataFields?.newdataPayload.forEach((r) => {
      if (r?.field == state?.dropdowndata[0]?.DropDownName) {
        r.fieldData = state?.dropdowndata[state?.dropdowndata?.index]?.DropDownData[index]?.Value;
      }
    })
    // Check if dependent levels have valid DropDownData, if not clear their field data
    const selectedDropdown = state.dropdowndata[state.dropdowndata.index]?.DropDownData[index];
    if (selectedDropdown?.DropDownName) {
      // Level 3 doesn't exist, clear all dependent field data
      this.clearDependentFieldData(state, selectedDropdown?.DropDownName);

      // Level 3 exists, check level 4
      const level3Data = selectedDropdown.DropDownData[0];
      if (level3Data?.DropDownName) {
        // Level 4 doesn't exist, clear level 4+ field data
        this.clearDependentFieldData(state, level3Data?.DropDownName);
        // Level 4 exists, check level 5
        const level4Data = level3Data.DropDownData[0];
        if (level4Data?.DropDownName) {
          // Level 5 doesn't exist, clear level 5+ field data
          this.clearDependentFieldData(state, level4Data?.DropDownName);

          // Level 5 exists, check level 6
          const level5Data = level4Data.DropDownData[0];
          if (level5Data?.DropDownName) {
            // Level 6 doesn't exist, clear level 6+ field data
            this.clearDependentFieldData(state, level5Data?.DropDownName);
          }
        }
      }
    }
    state.value3 = ''
    state.value4 = ''
    state.value5 = ''
    state.value6 = ''
    this.changeEmptyArray();
  }

  changeTicketThirdLevelDropdown(event, state, data) {
    let index = data.findIndex(r => r.Value == event)
    let zIndex = this.jsonFormData.dataFields.findIndex(r => r.label == state.label)
    if (!(state.dropdowndata.indexOne >= 0)){
      state.dropdowndata.indexOne = state.indexOne;
    }
    if (!(state.dropdowndata.index >= 0)){
      state.dropdowndata.index = state.index;
    }
    state.dropdowndata.indexTwo = index;
    state.dropdowndata.indexThree = 0;
    state.dropdowndata.indexFour = 0;
    this.jsonFormData.dataFields[zIndex].dropdowndata[
      state?.dropdowndata?.index
    ].DropDownData[state?.dropdowndata?.indexOne].selected =
      state?.dropdowndata[state?.dropdowndata?.index].DropDownData[
        state?.dropdowndata?.indexOne
      ].DropDownData[index].Value;
    this.dropdownSelectionSecond(this.jsonFormData.dataFields[zIndex].dropdowndata[
      state?.dropdowndata?.index
    ].DropDownData[state?.dropdowndata?.indexOne].selected, this.jsonFormData.dataFields[zIndex], this.jsonFormData.dataFields[zIndex]?.dropdowndata[this.jsonFormData.dataFields[zIndex]?.dropdowndata?.index]?.DropDownData[this.jsonFormData.dataFields[zIndex]?.dropdowndata?.indexOne]?.DropDownName)
    // control.dropdowndata[control.dropdowndata.index].DropDownData[control.dropdowndata.indexOne]?.DropDownName
    // this.changeDetectionRef.detectChanges();
    this.originalDataFields?.newdataPayload.forEach((r) => {
      if (r.field == state.dropdowndata[0].DropDownData[0].DropDownName){
        r.fieldData = state?.dropdowndata[state?.dropdowndata?.index].DropDownData[
          state?.dropdowndata?.indexOne
        ].DropDownData[index].Value
      }
    })

    // Check if dependent levels have valid DropDownData, if not clear their field data
    const selectedDropdown = state.dropdowndata[state.dropdowndata.index]?.DropDownData[state.dropdowndata.indexOne]?.DropDownData[index];
    if (selectedDropdown?.DropDownName) {
      // Level 4 doesn't exist, clear all dependent field data
      this.clearDependentFieldData(state, selectedDropdown?.DropDownName);

      // Level 4 exists, check level 5
      const level4Data = selectedDropdown.DropDownData[0];
      if (level4Data?.DropDownName) {
        // Level 5 doesn't exist, clear level 5+ field data
        this.clearDependentFieldData(state, level4Data?.DropDownName);
        // Level 5 exists, check level 6
        const level5Data = level4Data.DropDownData[0];
        if (level5Data?.DropDownName) {
          // Level 6 doesn't exist, clear level 6+ field data
          this.clearDependentFieldData(state, level5Data?.DropDownName);
        }
      }
    }
    state.value4 = ''
    state.value5 = ''
    state.value6 = ''
    this.changeEmptyArray();
  }

  changeTicketFourthLevelDropdown(event: any, state: any, data: any[]) {
    const index = data.findIndex(r => r.Value === event);
    const zIndex = this.jsonFormData.dataFields.findIndex(r => r.label === state.label);

    // Fallback for dropdowndata indexes if not set
    if (!(state.dropdowndata.index >= 0)) state.dropdowndata.index = state.index;
    if (!(state.dropdowndata.indexOne >= 0)) state.dropdowndata.indexOne = state.indexOne;
    if (!(state.dropdowndata.indexTwo >= 0)) state.dropdowndata.indexTwo = state.indexTwo;

    // Set third-level index
    state.dropdowndata.indexThree = index;
    state.dropdowndata.indexFour = 0;


    const selectedValue = state.dropdowndata[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownData?.[index]?.Value;

    const currentDropdown = this.jsonFormData.dataFields[zIndex];

    // Set selected value in the fourth-level dropdown
    currentDropdown.dropdowndata[state.dropdowndata.index]
      .DropDownData[state.dropdowndata.indexOne]
      .DropDownData[state.dropdowndata.indexTwo].selected = selectedValue;

    // Call third-level handler to generate fifth level
    this.dropdownSelectionThird(
      selectedValue,
      currentDropdown,
      currentDropdown.dropdowndata[state.dropdowndata.index]
        ?.DropDownData?.[state.dropdowndata.indexOne]
        ?.DropDownData?.[state.dropdowndata.indexTwo]
        ?.DropDownName,
      state // Pass state as parentType
    );

    // Update originalDataFields' payload if fifth-level name matches
    const fifthLevelName = currentDropdown.dropdowndata[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownName;

    this.originalDataFields?.newdataPayload.forEach((r) => {
      if (r.field === fifthLevelName) {
        r.fieldData = selectedValue;
      }
    });
    // Check if dependent levels have valid DropDownData, if not clear their field data
    const selectedDropdownLevel = state.dropdowndata[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownData?.[index];
    if (!selectedDropdownLevel?.DropDownData || selectedDropdownLevel.DropDownData.length === 0) {
      // Level 5 doesn't exist, clear all dependent field data
      this.clearDependentFieldData(state, selectedDropdownLevel?.DropDownName);
    } else {
      // Level 5 exists, check level 6
      const level5Data = selectedDropdownLevel.DropDownData[0];
      if (!level5Data?.DropDownData || level5Data.DropDownData.length === 0) {
        // Level 6 doesn't exist, clear level 6+ field data
        this.clearDependentFieldData(state, level5Data?.DropDownName);
      }
    }
    state.value5 = ''
    state.value6 = ''
    this.changeEmptyArray();
  }


  dropdownSelectionThird(data: any, type: any, name: string, parentType: any) {
    let keys = Object.keys(this.myFormDataFields.controls);
    if (data) {
      keys.forEach((r) => {
        if (r === type.name || r === type.field) {
          let thirdLevelDropDown = JSON.parse(JSON.stringify(
            this.originalDataFields?.dataFields.find(element =>
              element.field === (type?.name || type?.field)
            )
          ));

          thirdLevelDropDown.field = name;
          thirdLevelDropDown.displayName = name;
          thirdLevelDropDown.fieldData = data;
          thirdLevelDropDown.isRequired = type?.isRequired;
          thirdLevelDropDown.fieldValue = null;
          thirdLevelDropDown.value2 = data;

          // Add reference to parent for context (optional, for tracing)
          thirdLevelDropDown.parentField = parentType?.field || parentType?.name;

          let findIndex = this.newdataPayload.findIndex(r => r.field === name);
          if (findIndex >= 0) {
            this.newdataPayload[findIndex].fieldData = data;
            this.newdataPayload[findIndex].value2 = data;
          } else {
            this.newdataPayload.push(thirdLevelDropDown);
          }

          // Optional: remove duplicates by field name
          // this.newdataPayload = this.removeDuplicate(this.newdataPayload);
        }
      });
    }
  }


  changeTicketFifthLevelDropdown(event: any, state: any, data: any[]) {
    const index = data.findIndex(r => r.Value === event);
    const zIndex = this.jsonFormData.dataFields.findIndex(r => r.label === state.label);

    if (!(state.dropdowndata.index >= 0)) state.dropdowndata.index = state.index;
    if (!(state.dropdowndata.indexOne >= 0)) state.dropdowndata.indexOne = state.indexOne;
    if (!(state.dropdowndata.indexTwo >= 0)) state.dropdowndata.indexTwo = state.indexTwo;
    if (!(state.dropdowndata.indexThree >= 0)) state.dropdowndata.indexThree = state.indexThree;

    state.dropdowndata.indexFour = index;

    const selectedValue = state.dropdowndata[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownData?.[state.dropdowndata.indexThree]
      ?.DropDownData?.[index]?.Value;

    const currentDropdown = this.jsonFormData.dataFields[zIndex];

    currentDropdown.dropdowndata[state.dropdowndata.index]
      .DropDownData[state.dropdowndata.indexOne]
      .DropDownData[state.dropdowndata.indexTwo]
      .DropDownData[state.dropdowndata.indexThree].selected = selectedValue;

    // Call next-level dropdown handler
    this.dropdownSelectionFourth(
      selectedValue,
      currentDropdown,
      currentDropdown.dropdowndata[state.dropdowndata.index]
        ?.DropDownData?.[state.dropdowndata.indexOne]
        ?.DropDownData?.[state.dropdowndata.indexTwo]
        ?.DropDownData?.[state.dropdowndata.indexThree]
        ?.DropDownName,
      state
    );

    const sixthLevelName = currentDropdown.dropdowndata[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownData?.[state.dropdowndata.indexThree]
      ?.DropDownName;

    this.originalDataFields?.newdataPayload.forEach((r) => {
      if (r.field === sixthLevelName) {
        r.fieldData = selectedValue;
      }
    });


    // Check if dependent levels have valid DropDownData, if not clear their field data
    const selectedDropdownLevel = state.dropdowndata[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownData?.[state.dropdowndata.indexThree]
      ?.DropDownData?.[index];
    if (selectedDropdownLevel?.DropDownName) {
      // Level 6 doesn't exist, clear all dependent field data
      this.clearDependentFieldData(state, selectedDropdownLevel?.DropDownName);
    }

    state.value6 = ''
    this.changeEmptyArray();
  }

  changeTicketSixthLevelDropdown(event: any, state: any, data: any[]) {
    const index = data.findIndex(r => r.Value === event);
    const zIndex = this.jsonFormData.dataFields.findIndex(r => r.label === state.label);

    // Ensure fallback index values are set
    if (!(state.dropdowndata.index >= 0)) state.dropdowndata.index = state.index;
    if (!(state.dropdowndata.indexOne >= 0)) state.dropdowndata.indexOne = state.indexOne;
    if (!(state.dropdowndata.indexTwo >= 0)) state.dropdowndata.indexTwo = state.indexTwo;
    if (!(state.dropdowndata.indexThree >= 0)) state.dropdowndata.indexThree = state.indexThree;
    if (!(state.dropdowndata.indexFour >= 0)) state.dropdowndata.indexFour = state.indexFour;

    state.dropdowndata.indexFive = index;

    const currentDropdown = this.jsonFormData.dataFields[zIndex];

    const selectedValue = currentDropdown.dropdowndata?.[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownData?.[state.dropdowndata.indexThree]
      ?.DropDownData?.[state.dropdowndata.indexFour]
      ?.DropDownData?.[index]?.Value;

    // Set selected value for 6th level
    currentDropdown.dropdowndata[state.dropdowndata.index]
      .DropDownData[state.dropdowndata.indexOne]
      .DropDownData[state.dropdowndata.indexTwo]
      .DropDownData[state.dropdowndata.indexThree]
      .DropDownData[state.dropdowndata.indexFour].selected = selectedValue;

    // Optional: handle further nesting if needed
    this.dropdownSelectionFourth(
      selectedValue,
      currentDropdown,
      currentDropdown.dropdowndata[state.dropdowndata.index]
        ?.DropDownData?.[state.dropdowndata.indexOne]
        ?.DropDownData?.[state.dropdowndata.indexTwo]
        ?.DropDownData?.[state.dropdowndata.indexThree]
        ?.DropDownData?.[state.dropdowndata.indexFour]
        ?.DropDownName,
      state
    );

    const seventhLevelName = currentDropdown.dropdowndata[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownData?.[state.dropdowndata.indexThree]
      ?.DropDownData?.[state.dropdowndata.indexFour]
      ?.DropDownName;

    this.originalDataFields?.newdataPayload.forEach((r) => {
      if (r.field === seventhLevelName) {
        r.fieldData = selectedValue;
      }
    });
    this.changeEmptyArray();

    // Clear dependent field data - this is the deepest level so just clear if no further data
    const selectedDropdownLevel = currentDropdown.dropdowndata?.[state.dropdowndata.index]
      ?.DropDownData?.[state.dropdowndata.indexOne]
      ?.DropDownData?.[state.dropdowndata.indexTwo]
      ?.DropDownData?.[state.dropdowndata.indexThree]
      ?.DropDownData?.[state.dropdowndata.indexFour]
      ?.DropDownData?.[index];
    if (selectedDropdownLevel?.DropDownName) {
      // No further levels exist, clear any remaining dependent field data
      this.clearDependentFieldData(state, selectedDropdownLevel?.DropDownName);
    }
  }


  dropdownSelectionFourth(data: any, type: any, name: string, parentType: any) {
    const keys = Object.keys(this.myFormDataFields.controls);
    if (data) {
      keys.forEach((r) => {
        if (r === type.name || r === type.field) {
          let fourthLevelDropDown = JSON.parse(JSON.stringify(
            this.originalDataFields?.dataFields.find(element =>
              element.field === (type?.name || type?.field)
            )
          ));

          fourthLevelDropDown.field = name;
          fourthLevelDropDown.displayName = name;
          fourthLevelDropDown.fieldData = data;
          fourthLevelDropDown.isRequired = type?.isRequired;
          fourthLevelDropDown.fieldValue = null;
          fourthLevelDropDown.value2 = data;
          fourthLevelDropDown.parentField = parentType?.field || parentType?.name;

          const findIndex = this.newdataPayload.findIndex(r => r.field === name);
          if (findIndex >= 0) {
            this.newdataPayload[findIndex].fieldData = data;
            this.newdataPayload[findIndex].value2 = data;
          } else {
            this.newdataPayload.push(fourthLevelDropDown);
          }

          // Optional deduplication
          // this.newdataPayload = this.removeDuplicate(this.newdataPayload);
        }
      });
    }
  }

  // Lookup dropdown functions
  changeLookupFirstLevelDropdown(event, state, data, flag) {
    let index = data.findIndex(r => r.Value == event)
    console.log(event);
    let zIndex = this.jsonFormData.lookupFields.findIndex(r => r.label == state.label)
    state.dropdowndata.index = index;
    state.dropdowndata.indexOne = 0;
    state.dropdowndata.indexTwo = 0;
    state.dropdowndata.indexThree = 0;
    state.dropdowndata.indexFour = 0;
    this.jsonFormData.lookupFields[zIndex].value = state.dropdowndata[index].Value
    this.jsonFormData.lookupFields[zIndex].dropdowndata.selected = state.dropdowndata[index].Value;
    this.dropdownSelectionLookup(state.dropdowndata[index].Value, this.jsonFormData.lookupFields[zIndex], flag)

    // Clear dependent field data for lookup fields
    this.originalDataFields?.lookupFields.forEach((r) => {
      if (r?.field?.toLowerCase() == state?.dropdowndata[index]?.DropDownName?.toLowerCase()) {
        r.fieldData = null
      }
    })

    // Check if dependent levels have valid DropDownData, if not clear their field data
    const selectedDropdown = state.dropdowndata[index];
    if (selectedDropdown?.DropDownName) {
      this.clearDependentLookupFieldData(state, selectedDropdown?.DropDownName);

      // Level 2 exists, check level 3
      const level2Data = selectedDropdown.DropDownData[0];
      if (level2Data?.DropDownName) {
        this.clearDependentLookupFieldData(state, level2Data?.DropDownName);

        // Level 3 exists, check level 4
        const level3Data = level2Data.DropDownData[0];
        if (level3Data?.DropDownName) {
          this.clearDependentLookupFieldData(state, level3Data?.DropDownName);

          // Level 4 exists, check level 5
          const level4Data = level3Data.DropDownData[0];
          if (level4Data?.DropDownName) {
            this.clearDependentLookupFieldData(state, level4Data?.DropDownName);

            // Level 5 exists, check level 6
            const level5Data = level4Data.DropDownData[0];
            if (level5Data?.DropDownName) {
              this.clearDependentLookupFieldData(state, level5Data?.DropDownName);
            }
          }
        }
      }
    }

    state.value2 = ''
    state.value3 = ''
    state.value4 = ''
    state.value5 = ''
    state.value6 = ''
    this.changeEmptyArray();
  }

  changeLookupSecondLevelDropdown(event, state, data) {
    let index = data.findIndex(r => r.Value == event)
    let zIndex = this.jsonFormData.lookupFields.findIndex(r => r.label == state.label)
    if (!(state.dropdowndata.index >= 0)) {
      state.dropdowndata.index = state.index;
    }
    state.dropdowndata.indexOne = index;
    state.dropdowndata.indexTwo = 0;
    state.dropdowndata.indexThree = 0;
    state.dropdowndata.indexFour = 0;
    state.dropdowndata.index = state?.dropdowndata?.index ? state?.dropdowndata?.index : this.jsonFormData?.lookupFields[zIndex]?.dropdowndata.findIndex((r) => r?.Value == this.jsonFormData?.lookupFields[zIndex]?.value)
    this.jsonFormData.lookupFields[zIndex].dropdowndata[state?.dropdowndata?.index].selected = state?.dropdowndata[state?.dropdowndata?.index].DropDownData[index].Value;
    this.dropdownSelectionLookupSecond(this.jsonFormData.lookupFields[zIndex].dropdowndata[state?.dropdowndata?.index].selected, this.jsonFormData.lookupFields[zIndex], this.jsonFormData.lookupFields[zIndex]?.dropdowndata[this.jsonFormData.lookupFields[zIndex]?.dropdowndata?.index]?.DropDownName)

    this.originalDataFields?.lookupFields.forEach((r) => {
      if (r?.field == state?.dropdowndata[0]?.DropDownName) {
        r.fieldData = state?.dropdowndata[state?.dropdowndata?.index]?.DropDownData[index]?.Value;
      }
    })

    // Check if dependent levels have valid DropDownData, if not clear their field data
    const selectedDropdown = state.dropdowndata[state.dropdowndata.index]?.DropDownData[index];
    if (selectedDropdown?.DropDownName) {
      this.clearDependentLookupFieldData(state, selectedDropdown?.DropDownName);

      // Level 3 exists, check level 4
      const level3Data = selectedDropdown.DropDownData[0];
      if (level3Data?.DropDownName) {
        this.clearDependentLookupFieldData(state, level3Data?.DropDownName);

        // Level 4 exists, check level 5
        const level4Data = level3Data.DropDownData[0];
        if (level4Data?.DropDownName) {
          this.clearDependentLookupFieldData(state, level4Data?.DropDownName);

          // Level 5 exists, check level 6
          const level5Data = level4Data.DropDownData[0];
          if (level5Data?.DropDownName) {
            this.clearDependentLookupFieldData(state, level5Data?.DropDownName);
          }
        }
      }
    }

    state.value3 = ''
    state.value4 = ''
    state.value5 = ''
    state.value6 = ''
    this.changeEmptyArray();
  }

  changeLookupThirdLevelDropdown(event, state, data) {
    let index = data.findIndex(r => r.Value == event)
    let zIndex = this.jsonFormData.lookupFields.findIndex(r => r.label == state.label)
    if (!(state.dropdowndata.indexOne >= 0)) {
      state.dropdowndata.indexOne = state.indexOne;
    }
    if (!(state.dropdowndata.index >= 0)) {
      state.dropdowndata.index = state.index;
    }
    state.dropdowndata.indexTwo = index;
    state.dropdowndata.indexThree = 0;
    state.dropdowndata.indexFour = 0;
    this.jsonFormData.lookupFields[zIndex].dropdowndata[
      state?.dropdowndata?.index
    ].DropDownData[state?.dropdowndata?.indexOne].selected =
      state?.dropdowndata[state?.dropdowndata?.index].DropDownData[
        state?.dropdowndata?.indexOne
      ].DropDownData[index].Value;
    this.dropdownSelectionLookupSecond(this.jsonFormData.lookupFields[zIndex].dropdowndata[
      state?.dropdowndata?.index
    ].DropDownData[state?.dropdowndata?.indexOne].selected, this.jsonFormData.lookupFields[zIndex], this.jsonFormData.lookupFields[zIndex]?.dropdowndata[this.jsonFormData.lookupFields[zIndex]?.dropdowndata?.index]?.DropDownData[this.jsonFormData.lookupFields[zIndex]?.dropdowndata?.indexOne]?.DropDownName)

    this.originalDataFields?.lookupFields.forEach((r) => {
      if (r.field == state.dropdowndata[0].DropDownData[0].DropDownName) {
        r.fieldData = state?.dropdowndata[state?.dropdowndata?.index].DropDownData[
          state?.dropdowndata?.indexOne
        ].DropDownData[index].Value
      }
    })

    // Check if dependent levels have valid DropDownData, if not clear their field data
    const selectedDropdown = state.dropdowndata[state.dropdowndata.index]?.DropDownData[state.dropdowndata.indexOne]?.DropDownData[index];
    if (selectedDropdown?.DropDownName) {
      this.clearDependentLookupFieldData(state, selectedDropdown?.DropDownName);

      // Level 4 exists, check level 5
      const level4Data = selectedDropdown.DropDownData[0];
      if (level4Data?.DropDownName) {
        this.clearDependentLookupFieldData(state, level4Data?.DropDownName);

        // Level 5 exists, check level 6
        const level5Data = level4Data.DropDownData[0];
        if (level5Data?.DropDownName) {
          this.clearDependentLookupFieldData(state, level5Data?.DropDownName);
        }
      }
    }

    state.value4 = ''
    state.value5 = ''
    state.value6 = ''
    this.changeEmptyArray();
  }

  // Helper functions for lookup dropdown operations
  clearDependentLookupFieldData(state: any, dropDownName: string) {
    if (dropDownName) {
      // Clear from lookupFields
      this.originalDataFields?.lookupFields.forEach((element) => {
        if (element.field?.toLowerCase() == dropDownName?.toLowerCase()) {
          element.fieldData = null
          element.fieldValue = null
          element.value2 = null
          element.value3 = null
          element.value4 = null
          element.value5 = null
          element.value6 = null
        }
      });
    }
  }

  dropdownSelectionLookup(data, type, flag) {
    let keys = Object.keys(this.myFormLookupFields.controls);
    type.value = data;
    if (data != '') {
      keys.forEach((r) => {
        if (r == type.name) {
          this.getLoopupData(data, type, flag)
        }
      })
    }
    if (type?.dropdowndata?.length > 0) {
      type.innerDropdown = true;
    }
  }

  dropdownSelectionLookupSecond(data, type, name) {
    let keys = Object.keys(this.myFormLookupFields.controls);
    if (data) {
      keys.forEach((r) => {
        if (r == type.name || r == type.field) {
          let secondeLevelDropDown = JSON.parse(JSON.stringify(this.originalDataFields?.lookupFields.find(element => (element.field == (type?.name || type?.field)))));
          secondeLevelDropDown.field = name;
          secondeLevelDropDown.displayName = name;
          secondeLevelDropDown.fieldData = data;
          secondeLevelDropDown.isRequired = type?.isRequired;
          secondeLevelDropDown.fieldValue = null;
          secondeLevelDropDown.value2 = secondeLevelDropDown?.fieldData;

          let findIndex = this.originalDataFields?.lookupFields.findIndex(r => r.field == name)
          if (findIndex >= 0) {
            this.originalDataFields.lookupFields[findIndex].fieldData = data;
          } else {
            this.originalDataFields.lookupFields.push(secondeLevelDropDown);
          }
        }
      })
    }
  }

  updateTimer() {
    this.reTryApiCallShow = false;
    this.timerButtonShow = true;
    this._cdr.detectChanges()
    this.countDown = timer(0, this.tick)
      .pipe(take(this.counter))
      .subscribe(() => {
        --this.counter;
        this._cdr.detectChanges()
        // console.log(this.counter);
        if (this.counter == 1) {
          this.counter = 30
          this.timerButtonShow = false;
          this.reTryApiCall()
          this._cdr.detectChanges()
          this.countDown.unsubscribe();
        }
      });
  }
  reTryApiCall() {
    let body = { "TicketID": this?.data?.ticketInfo?.ticketID, "BrandID": +this.data?.brandObj?.brandID }
    this._dynamicCrmIntegrationService.GetSRID(body).subscribe((res) => {
      this.ErrorMessageAfterWebhook = this.translate.instant('CRM-data-is-not-saved-please-try-again')

      if (res.success) {
        /* this.ticketService.updateCRMDetails.next({
          TagID: this?.data?.ticketInfo?.tagID,
          SrID: res?.data,
          guid: this.navigationService.currentSelectedTab.guid,
          postType: this.data?.PageType
        }); */
        this.ticketService.updateCRMDetailsSignal.set({
          TagID: this?.data?.ticketInfo?.tagID,
          SrID: res?.data,
          guid: this.navigationService.currentSelectedTab.guid,
          postType: this.data?.PageType
        });
        // this.reTryApiCallShow = false;
        this.timerButtonShow = false;
        this.errorMessage(this.translate.instant('SR-Created-Successfully'), 'Success')
        this._matDialogRef.close()
        this._cdr.detectChanges()
      } else {
        this.timerButtonShow = false;
        this.reTryApiCallShow = true;
      }
    }, err => {
      this.timerButtonShow = false;
      this.reTryApiCallShow = true;
    })

  }

  userProfileLinkEmitRes(event) {
    if (event) {
      // console.log(event);
      // this.UserProfileurl = event;
    }
  }
  LookupCrmDataDetails:any;
  errorMesArrLookup:any=[];
  lookuploader:boolean = false;
  groupMMarkMendatoryLookup(){
    let emptyArrays=[]

    this.originalDataFields.lookupfieldsGroups.forEach((res)=>{
      let filledFieldCount=0
      res.fields.forEach((res2)=>{
        if(res2.value && res2.value!=''){
          filledFieldCount++;
        }
      })
      // destinationArray = [...sourceArray]
      if (filledFieldCount >= +res.mandatoryFields && res.mandatoryFields!='0' && res.id!=0){
        res.validationClear = true
      } else if (res.mandatoryFields == '0' && filledFieldCount != res.fieldsCount && res.id!=0){
        res.validationClear = false
        emptyArrays.push(res.fields.filter(res2 => (!res2.value || res2.value == '') && res2.isRequired)?.map(obj => obj.label))
      } else if (res.mandatoryFields == '0' && filledFieldCount == res.fieldsCount && res.id!=0) {
        res.validationClear = true
      }else{
        res.validationClear = false
        emptyArrays.push(res.fields.filter(res2 =>( !res2.value || res2.value == '') && res2.isRequired)?.map(obj => obj.label))
      }
    })
    this.errorMesArrLookup = [].concat(...emptyArrays);
  }
  GetCRMLookUpData(){
    this.groupMMarkMendatoryLookup()
    let errorsGroupDetails = this.lookUpFieldsWithGroupIdAndColor.find((r) => r.validationClear == false && r.mandatoryFields)
    if (errorsGroupDetails){
      this.errorMessage(`${errorsGroupDetails?.name} - To submit the form, you must fill out any ${(errorsGroupDetails?.mandatoryFields && errorsGroupDetails?.mandatoryFields != '0' && errorsGroupDetails?.mandatoryFields != '') ? errorsGroupDetails?.mandatoryFields : errorsGroupDetails?.fields?.length} of the ${errorsGroupDetails?.fields?.length} fields`, 'Warn')
      return;
    }
    if(this.lookUpFieldsWithGroupIdAndColor?.filter(r=> r?.id==0)[0]?.fields?.find(r=>r?.label == this.errorMesArrLookup[0])?.label){
      this.errorMessage(`Please enter a required field `+ this.lookUpFieldsWithGroupIdAndColor.filter(r=> r.id==0)[0]?.fields.find(r=>r.label == this.errorMesArrLookup[0])?.label, 'Warn')
      return;
    }
    this.Idchecked = null;
    this.LookupCrmDataDetails = []
    this.lookuploader = true;
    let resposne = {
      "BrandID": +this.inputDataFromParent?.brandObj?.brandID,
      "EventType":  "LookupContact",
      "CaseID": +this.inputDataFromParent?.ticketInfo?.ticketID,
      "TagID":  +this.inputDataFromParent?.ticketInfo?.tagID,
      "Datafields": [...this.originalDataFields?.lookupFields]
    }
    this._dynamicCrmIntegrationService.GetCRMLookUpData(resposne).subscribe((res)=>{
      this.lookuploader = false;
      if(res.success){
        if (res?.data?.data){
          this.LookupCrmDataDetails = res?.data?.data? res?.data?.data : res?.data
        } else if(res?.data?.body?.error){
          this.LookupCrmDataDetails = []
          this.errorMessage(JSON.parse(res?.data?.body?.error)?.Message,'Warn')
        } else {
          this.LookupCrmDataDetails = res?.data?.data? res?.data?.data : res?.data
        }
      } else{
        this.errorMessage(res?.message,'Warn')
      }
    })
  }
  Idchecked:number;
  selectRadioButton(i:number,item){

    this.dataFieldsWithGroupIdAndColor?.forEach((r) => {
      if (r.fields.length > 0) {
        r?.fields?.forEach((da) => {
          if (Object.values(item.value)?.find((value, index) => Object.keys(item.value)[index]?.toLowerCase() === da?.name?.toLowerCase())) {
            if (da?.type?.toLowerCase() == 'dynamicdropdown') {
              const va: any = (Object.values(item.value)?.find((value, index) => Object.keys(item.value)[index]?.toLowerCase() === da?.name?.toLowerCase()) || '');
              try {
                const parsedValue = JSON.parse(va);

                if (typeof parsedValue === 'object' && parsedValue !== null) {
                  da.value = parsedValue;
                  da.dropdowndata = [parsedValue];
                  if (da.isNonEditable) {
                    da.isDisableField = true;
                    da.prePopulateField = true;
                  }
                  // Update the form control value to reflect changes in mat-select
                  if (this.myFormDataFields.get(da.name)) {
                    this.myFormDataFields.get(da.name).setValue(parsedValue);
                    this.myFormDataFields.get(da.name).updateValueAndValidity();
                  }
                } else {
                  da.value = '';
                  if (this.myFormDataFields.get(da.name)) {
                    this.myFormDataFields.get(da.name).setValue('');
                    this.myFormDataFields.get(da.name).updateValueAndValidity();
                  }
                }
              } catch (e) {
                da.value = '';
                if (this.myFormDataFields.get(da.name)) {
                  this.myFormDataFields.get(da.name).setValue('');
                  this.myFormDataFields.get(da.name).updateValueAndValidity();
                }
              }

            } else {
              da.value = (Object.values(item.value)?.find((value, index) => Object.keys(item.value)[index]?.toLowerCase() === da?.name?.toLowerCase()) || da?.value);
              if (da.isNonEditable) {
                da.isDisableField = true;
                da.prePopulateField = true;
              }
              // Update the form control value to reflect changes in mat-select
              if (this.myFormDataFields.get(da.name)) {
                this.myFormDataFields.get(da.name).setValue(da.value);
                this.myFormDataFields.get(da.name).updateValueAndValidity();
              }
            }
          } else {
            if (da.isNonEditable) {
              da.isDisableField = false;
              da.prePopulateField = false;
            }
          }
        })
      }
    })
    this.originalDataFields?.dataFields?.forEach((da) => {
      if (Object.values(item.value)?.find((value, index) => Object.keys(item.value)[index]?.toLowerCase() === da?.field?.toLowerCase())) {
        if (da?.dataType?.toLowerCase() == 'dynamicdropdown') {
          const va: any = (Object.values(item.value)?.find((value, index) => Object.keys(item.value)[index]?.toLowerCase() === da?.field?.toLowerCase()) || '');
          try {
            const parsedValue = JSON.parse(va);

            if (typeof parsedValue === 'object' && parsedValue !== null) {
              da.fieldData = parsedValue?.value;
              da.dropdowndata = [parsedValue];
              da.fieldData_id = parsedValue?.id;
              da.fieldValue = JSON.stringify(parsedValue);
            } else {
              da.fieldValue = '';
            }
          } catch (e) {
            da.fieldValue = '';
          }
        } else {
          da.fieldData = (Object.values(item.value)?.find((value, index) => Object.keys(item.value)[index]?.toLowerCase() === da?.field?.toLowerCase()) || da?.fieldData);
        }
      }
      // da.fieldData = da.value
    })
    this.selectedIndexTab = 1
  

    this.errorMessage(this.translate.instant('Fields-has-been-updated-successfully'),'Success');
    return this.Idchecked = i;
  }

  showNoRecordFoundOnSearch(strVal: string, fieldValue): void {

    !(fieldValue?.searchDropDown) ? fieldValue.searchDropDown = Object.assign([], fieldValue.dropdowndata) : '';
    fieldValue.dropdowndata = fieldValue?.searchDropDown?.filter((r) => r?.Value?.toLowerCase()?.includes(strVal?.toLowerCase()));
  }

  searchDynamicDropdown(strVal: string, fieldValue): void {

    !(fieldValue?.searchDropDown) ? fieldValue.searchDropDown = Object.assign([], fieldValue.dropdowndata) : '';
    fieldValue.dropdowndata = fieldValue?.searchDropDown?.filter((r) => r?.value?.toLowerCase()?.includes(strVal?.toLowerCase()));
  }

  secondLevelshowNoRecordFoundOnSearch(strVal: string, fieldValue): void {

    !(fieldValue?.searchDropDown) ? fieldValue.searchDropDown = Object.assign([], fieldValue.DropDownData) : '';
    fieldValue.DropDownData = fieldValue?.searchDropDown?.filter((r) => r?.Value?.toLowerCase()?.includes(strVal?.toLowerCase()))
  }

  _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === 32) {
      // do not propagate spaces to MatSelect, as this would select the currently active option
      event.stopPropagation();
    }
  }

  clearFirstLevelInput(searchTextboxControl,control):void
  {
    searchTextboxControl.value = '';
    if (control.searchDropDown)
    {
      control.dropdowndata = control.searchDropDown;
    }
  }

  clearSecondThirdLevelInput(searchTextboxControl, control): void {
    searchTextboxControl.value = '';
    if (control.searchDropDown) {
      control.DropDownData = control.searchDropDown;
    }
  }

  trackByName(index, item) {
    return item.Value;
  }

  foropen() {
    this.cdkVirtualScrollViewPort.scrollToIndex(5);
  }

  openChange($event: boolean) {
    if ($event) {
      this.foropen();
      this.cdkVirtualScrollViewPort.scrollToIndex(0);
      this.cdkVirtualScrollViewPort.checkViewportSize();
    }
  }

  onPanelOpen(): void {

  }

  onDynamicDropdownPanel(isOpen:boolean,field,fieldList):void{
    if (isOpen)
    {
    this.getDyanamicFieldData(field);
    }else
    {
      if (field.value == '') {
        field.dropdowndata = [];
        field.searchDropDown = [];
        field.isDataLoaded =false
      }
    }
  }

  openMediaDialog(): void {
    this.mediaGalleryService.startDateEpoch =
      this.navigationService.currentSelectedTab?.Filters?.startDateEpoch;
    this.mediaGalleryService.endDateEpoch =
      this.navigationService.currentSelectedTab?.Filters?.endDateEpoch;
    this._dialog.open(MediaGalleryComponent, {
      data: {
        brandID: this.data?.brandObj?.brandID,
        type: 'AddNoteGallery',
      },
      autoFocus: false,
      panelClass: ['full-screen-modal'],
    });
  }

  removeSelectedNoteMedia(ugcMention: UgcMention): void {
    if (ugcMention) {
      this.selectedNoteMedia = this.selectedNoteMedia.filter((obj) => {
        return obj.mediaID !== ugcMention.mediaID;
      });
      this.mediaSelectedAsync.next(this.selectedNoteMedia);
      this.mediaGalleryService.selectedNoteMedia = this.selectedNoteMedia;
    }
  }

  getMediaEnumByExtension(urls:string[]):any[] {
    const extensionMapping: Record<string, MediaEnum> = {
      'txt': MediaEnum.TEXT,
      'jpg': MediaEnum.IMAGE,
      'jpeg': MediaEnum.IMAGE,
      'png': MediaEnum.IMAGE,
      'gif': MediaEnum.ANIMATEDGIF,
      'mp4': MediaEnum.VIDEO,
      'mp3': MediaEnum.AUDIO,
      'pdf': MediaEnum.PDF,
      'doc': MediaEnum.DOC,
      'docx': MediaEnum.DOC,
      'xls': MediaEnum.EXCEL,
      'xlsx': MediaEnum.EXCEL,
      'html': MediaEnum.HTML,
      'htm': MediaEnum.HTML,
      'json': MediaEnum.SYSTEM,
      'vcf': MediaEnum.CONTACT,
      'zip': MediaEnum.FILE,
      '7z': MediaEnum.FILE,
      'rar': MediaEnum.FILE,
      'tar': MediaEnum.FILE,
      'gz': MediaEnum.FILE,
    };

    return urls.map((url) => {
      const extension = url.split('.').pop()?.toLowerCase() || '';
      return {
        thumbUrl:url,
        mediaUrl:url,
        mediaPath:url,
        mediaType: extensionMapping[extension] || MediaEnum.OTHER
      };
    });
  }

  openAttachements(index) {
    this._postDetailService.galleryIndex = index
    const attachments = [] 
    this.selectedNoteMedia?.forEach((x)=>{
      attachments.push({
        mediaPath: x.mediaPath,
        mediaType: x.mediaType,
        thumbUrl: x.mediaPath
      })
    });
    this._dialog.open(VideoDialogComponent, {
      panelClass: 'overlay_bgColor',
      data: attachments,
      autoFocus: false,
    });
  }

  getOverallFilledFieldCount(fields: any[]): number {
  let count = 0;

  fields.forEach((field) => {
      count++; // Level 1 (base)

    if (field.type === 'dropdown' && field.dropdowndata?.length > 0 && field.isRequired) {
      const level1 = field.dropdowndata[field.dropdowndata.index]?.DropDownData;
      if (level1?.length > 0 ) {
          count++; // Level 2

        const level2 = level1[field.dropdowndata.indexOne]?.DropDownData;
          if (level2?.length > 0 ) {
            count++; // Level 3

            const level3 = level2[field.dropdowndata.indexTwo]?.DropDownData;
            if (level3?.length > 0 ) {
              count++; // Level 4

              const level4 = level3[field.dropdowndata.indexThree]?.DropDownData;
              if (level4?.length > 0 ) {
                count++; // Level 5

                const level5 = level4[field.dropdowndata.indexFour]?.DropDownData;
                if (level5?.length > 0 ) {
                  count++; // Level 6
                }
              }
            }
          }
        }
      }
  });
  return count;
  }

  getOverallOnlyRequiredFilledFieldCount(fields: any[]): number {
    let count = 0;

    fields.forEach((field) => {
      if (!field?.hideField){
      field.isRequired? count++:''; // Level 1 (base)

      if (field.type === 'dropdown' && field.dropdowndata?.length > 0 && field.isRequired) {
        const level1 = field.dropdowndata[field.dropdowndata.index]?.DropDownData;
        if (level1?.length > 0) {
          count++; // Level 2

          const level2 = level1[field.dropdowndata.indexOne]?.DropDownData;
          if (level2?.length > 0) {
            count++; // Level 3

            const level3 = level2[field.dropdowndata.indexTwo]?.DropDownData;
            if (level3?.length > 0) {
              count++; // Level 4

              const level4 = level3[field.dropdowndata.indexThree]?.DropDownData;
              if (level4?.length > 0) {
                count++; // Level 5

                const level5 = level4[field.dropdowndata.indexFour]?.DropDownData;
                if (level5?.length > 0) {
                  count++; // Level 6
                }
              }
            }
          }
        }
      }
    }
    });
    return count;
    }


  getDropdownFilledFieldCount(fields: any[]): number {
    let count = 0;

    fields.forEach((field) => {
      // count++; // Level 1 (base)

      if (field.type === 'dropdown' && field.dropdowndata?.length > 0) {
        const level1 = field.dropdowndata[field.dropdowndata.index]?.DropDownData;
        if (level1?.length > 0) {
          count++; // Level 2

          const level2 = level1[field.dropdowndata.indexOne]?.DropDownData;
          if (level2?.length > 0) {
            count++; // Level 3

            const level3 = level2[field.dropdowndata.indexTwo]?.DropDownData;
            if (level3?.length > 0) {
              count++; // Level 4

              const level4 = level3[field.dropdowndata.indexThree]?.DropDownData;
              if (level4?.length > 0) {
                count++; // Level 5

                const level5 = level4[field.dropdowndata.indexFour]?.DropDownData;
                if (level5?.length > 0) {
                  count++; // Level 6
                }
              }
            }
          }
        }
      }
    });

    return count;
  }

  getDyanamicFieldData(field: any): void {
    const fieldList = this.originalDataFields?.dataFields;
    if (!field || !Array.isArray(fieldList)) return;

    const dependsOnRules = field?.dependsOnRules;

    let dependentFields: any[] = [];

    if (dependsOnRules) {
      field.loading = false;
      field.isDataLoaded = true;
      // ✅ 1. Evaluate complex dependency rules
      const { isSatisfied, failedGroups } = this.evaluateDependsOnRules(dependsOnRules, fieldList);

      // ✅ 2. If rules are not satisfied, show warning for all failed groups
      if (!isSatisfied) {
        const dependentFieldIds = failedGroups.flatMap(g => g.failedFields);
        const failedDependentFields = fieldList.filter(f => dependentFieldIds.includes(String(f.fieldId)));

        const msg = `Please select ${failedDependentFields.map(f => `"${f.displayName}"`).join(', ')} to enable the field "${field.label}".`;

        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: { type: notificationType.Warn, message: msg },
        });
        return;
      }

      // ✅ 3. Get dependent fields for API call
      dependentFields = this.getDependentFields(dependsOnRules, fieldList);
    }

    if (field?.dropdowndata?.length == 0) {
      field.loading = true;
      field.isDataLoaded = false
    }

    // ✅ 4. Build payload for API call
    const payloadArray = dependentFields.map(x => ({
      field_ID: x.fieldId,
      fieldName: x.field,
      fieldData: { id: x.dataType?.toLowerCase() !== "dynamicdropdown" ? x.fieldData : x?.fieldData_id }
    }));

    // If no dependent fields, we can still call API with empty FieldData
    const obj = {
      BrandID: this.data?.brandObj?.brandID,
      APIConfigID: field?.apiConfigKey,
      FieldData: payloadArray
    };

    // ✅ 6. API call
    this._dynamicCrmIntegrationService.getDynamicFieldData(obj).subscribe({
      next: (response) => {
        field.loading = false;
        field.isDataLoaded = true;

        if (response.success) {
          field.dropdowndata = response.data;
          field.searchDropDown = field.dropdowndata;

          let control = this.getControlFromAll(field?.fieldId);
          let dropdownDetails = this.originalDataFields?.dataFields.find(el => el.fieldId == field?.fieldId);
          const tempDropDown = this.tempOriginalDataField?.dataFields.find(el => el.fieldId == field?.fieldId);

          if (!response?.data?.length) {
            if (control) control.isRequired = false;
            if (dropdownDetails) dropdownDetails.isRequired = false;
          } else if (tempDropDown?.isRequired) {
            if (control) control.isRequired = true;
            if (dropdownDetails) dropdownDetails.isRequired = true;
          }
        } else {
          this.showErrorSnack(response.message || `Failed to fetch dynamic field data for "${field.label}".`);
        }
      },
      error: () => {
        field.loading = false;
        field.isDataLoaded = true;
        this.showErrorSnack(`Failed to fetch dynamic field data for "${field.label}".`);
      }
    });
  }


  // ✅ Helper for showing errors
  private showErrorSnack(message: string) {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Error,
        message
      }
    });
  }


  isAnyFieldValueNull(fielddata: any[]): boolean {
    return fielddata.some(field => field.value === null || field.value ==='');
  }

  resetDependantFields(field,fieldList,editFlag=false):void{
    !editFlag? this.resetDependantFieldsRecursively(field, fieldList):null;
    this.setAutoFieldValue(field, fieldList, this.myFormDataFields)
    if (field?.type =='dynamicdropdown'){
    let dropdownDetails = this.originalDataFields?.dataFields.find(element => (element.fieldId == field.fieldId));
    if (dropdownDetails)
    {
    dropdownDetails.fieldData = field?.value?.value;
    dropdownDetails.fieldData_id = field?.value?.id;
    dropdownDetails.fieldValue = JSON.stringify(field?.value);
    }
  }
    this.checkFieldRequirement(field, fieldList);
    !editFlag ?this.changeEmptyArray():null;
  }

  resetDependantFieldsRecursively(field: any, fieldList: any[]): void {
    fieldList?.forEach(f => {
      if (f.fieldId === field.fieldId) return;

      // Check if dependsOnRules exists and includes the current field
      const rules = f.dependsOnRules;
      if (rules?.groups?.some(group => group.fields?.includes(String(field.fieldId)))) {
        // Reset the dependent field
        if (!f.prePopulateField) {

        f.value = '';
        f.dropdowndata = [];
        f.searchDropDown = [];
        f.fieldValue = '';
        }

        // Recursively reset its dependants
        this.resetDependantFieldsRecursively(f, fieldList);
      }
    });
  }


  checkFieldRequirement(field, allFields): void {
    // ===== Requirement Rules =====
    if (field?.requirementTargetIds?.length > 0) {
      field.requirementTargetIds.forEach(id => {
        const targetField = allFields.find(f => f.fieldId === id);
        if (!targetField) return;

        let dropdownDetails = this.originalDataFields?.dataFields.find(el => el.fieldId == id);
        let control = this.getControlFromAll(id);

        if (targetField?.requirementRules?.groups?.length > 0) {
          // Default: not required
          dropdownDetails.isRequired = false;
          if (control) control.isRequired = false;

          // Evaluate all groups with groupsCombineOperator
          const groupResults = targetField.requirementRules.groups.map(group =>
            this.evaluateGroup(group, field)
          );

          let finalResult = false;
          if (targetField.requirementRules.groupsCombineOperator === 'AND') {
            finalResult = groupResults.every(r => r === true);
          } else { // default OR
            finalResult = groupResults.some(r => r === true);
          }

          if (finalResult) {
            dropdownDetails.isRequired = true;
            if (control) control.isRequired = true;
          }
        }
      });
    }


    // ===== Visibility Rules =====
    if (field?.visibilityTargetIds?.length > 0) {
      field.visibilityTargetIds.forEach(id => {
        const targetField = allFields.find(f => f.fieldId === id);
        if (!targetField) return;

        let dropdownDetails = this.originalDataFields?.dataFields.find(el => el.fieldId == id);
        let control = this.getControlFromAll(id);

        if (targetField?.visibilityRules?.groups?.length > 0) {
          // Default: hidden
          dropdownDetails.hideField = true;
          dropdownDetails.defaultVisibility = false;
          if (control) control.hideField = true;
          control ? control.defaultVisibility = true : null;

          // Evaluate groups with groupsCombineOperator
          const groupResults = targetField.visibilityRules.groups.map(group =>
            this.evaluateVisibilityGroup(group, field)
          );

          let finalResult = false;
          if (targetField.visibilityRules.groupsCombineOperator === 'AND') {
            finalResult = groupResults.every(r => r === true);
          } else { // default OR
            finalResult = groupResults.some(r => r === true);
          }

          if (finalResult) {
            dropdownDetails.defaultVisibility = true;
            dropdownDetails.hideField = false;
            if (control) control.hideField = false;
            control ? control.defaultVisibility = false : null;
          }
        }
      });
    }

  }


  getControlFromAll(fieldId: number): any | null {
    for (let group of this.dataFieldsWithGroupIdAndColor) {
      const found = group.fields.find((f: any) => f.fieldId === fieldId);
      if (found) {
        return found;
      }
    }
    return null;
  }


  private evaluateRule(rule: any, field: any): boolean {
    if (!rule || !field) return false;

    const sourceValue = (typeof field?.value === 'object') ? field?.value?.value : field?.value;

    switch (rule.operator) {
      case 'equals':
        return rule.sourceFieldId === field.fieldId && sourceValue === rule.value;
      case 'notEquals':
        return rule.sourceFieldId === field.fieldId && sourceValue !== rule.value;
      // 🔮 extend later for greaterThan, in, contains, etc.
      default:
        return false;
    }
  }

  private evaluateGroup(group: any, field: any): boolean {
    if (!group?.rules?.length) return false;

    const ruleResults = group.rules.map(rule => this.evaluateRule(rule, field));

    if (group.combineOperator === 'AND') {
      return ruleResults.every(r => r === true);
    } else { // default OR
      return ruleResults.some(r => r === true);
    }
  }

  private evaluateVisibilityGroup(group: any, field: any): boolean {
    if (!group?.rules?.length) return false;

    const ruleResults = group.rules.map(rule => this.evaluateVisibilityRule(rule, field));

    if (group.combineOperator === 'AND') {
      return ruleResults.every(r => r === true);
    } else { // default OR
      return ruleResults.some(r => r === true);
    }
  }

  /**
   * Evaluate a single visibility rule against the field value.
   */
  private evaluateVisibilityRule(rule: any, field: any): boolean {
    if (!rule || !field) return false;

    const sourceValue = (typeof field?.value === 'object') ? field?.value?.value : field?.value;

    switch (rule.operator) {
      case 'equals':
        return rule.sourceFieldId === field.fieldId && sourceValue === rule.value;
      case 'notEquals':
        return rule.sourceFieldId === field.fieldId && sourceValue !== rule.value;
      default:
        return false;
    }
  }

  public compareValuesParams = function (option, value): boolean {
    return value?.id == option?.id;
  }

  getAgentCustomerDetails():void
  {
    const obj = 
      {
      "BrandName": this.data?.brandObj?.brandName,
      "TicketID": this.data?.ticketInfo?.ticketID,
      "AuthorID": this.data?.ticketInfo?.author?.socialId,
      "ChannelGroupID": this.data?.ticketInfo?.channelGroup
}

    this._dynamicCrmIntegrationService.getAgentCustomerDetails(obj).subscribe((response)=>{
      if(response.success){
        this.conversationDetails.fieldData=response?.data?.conversationLog
      }
    })
  }

  setAutoFieldValue(field, fieldList,myFormDataFields):void{
    if (field?.autoFillTargetIds?.length > 0) {
      field?.autoFillTargetIds.forEach(id => {
        const targetField = fieldList.find(f => f.fieldId === id);
        console.log(myFormDataFields);
        if (!targetField) return;

        let dropdownDetails = this.originalDataFields?.dataFields.find(el => el.fieldId == id);
        let control = this.getControlFromAll(id);

        if (targetField?.autoFillRules?.length > 0 && dropdownDetails && control) {
        const value = this.applyAutoFillRule(targetField.autoFillRules, fieldList);
        targetField.value = value;
        dropdownDetails.fieldData = value;
        control.fieldData = value;
          myFormDataFields.get(targetField.name).setValue(value);
        }
      })
    }
  }

  applyAutoFillRule(autoFillRule: string, allFields: any[]): string {
  // Split rule into placeholders and separators
  const parts = autoFillRule.split(/({{\d+}})/g).filter(Boolean);

  const values: string[] = parts.map(part => {
    const match = part.match(/{{(\d+)}}/);
    if (match) {
      const fieldId = Number(match[1]);
      const field = allFields.find(f => f.fieldId === fieldId);
      return field
        ? (typeof field.value === "object" ? field.value?.value : field.value) || ""
        : "";
    }
    return part; // separator or literal text
  });

  // Rebuild string: keep separators only if surrounded by values
  let result = "";
  for (let i = 0; i < values.length; i++) {
    const current = values[i];
    if (/{{\d+}}/.test(parts[i])) {
      // placeholder value
      if (current) result += current;
    } else {
      // separator
      const prev = values[i - 1] || "";
      const next = values[i + 1] || "";
      if (prev && next) result += current;
    }
  }

  return result;
}

changeEmptyArray():void{
  this.errorMesArr=[]
  this.originalDataFields?.dataFields.forEach((r, index) => {
    if (r?.field == 'EmailID' && r.fieldData?.length > 0) {
      if (!/^([a-zA-Z0-9_&\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(r.fieldData)) {
        this.errorMesArr.push(r?.displayName)
        return;
      } else {
      }
    }
    if (r.isRequired && (!r.fieldData) && r.groupId == 0 && !r?.hideField) {
      this.errorMesArr.push(r?.displayName)
    }
    //  else if (r.isRequired && (!r.fieldData || r.fieldData?.trim().length == 0) && r.groupId!=0){
    //   // validationClear = this.groupMMarkMendatory(r);
    //   this.groupMMarkMendatory(r)
    // }
    // if (r.value2 && r.dataType == "DropDown") {
    //   r.fieldValue = null
    //   r.value2 = this.jsonFormData.dataFields[index]?.dropdowndata[this.jsonFormData.dataFields[index]?.index]?.selected || r.value2 
    //   this.dropdownSelectionSecond(r.value2, r, this.jsonFormData.dataFields[index]?.dropdowndata[this.jsonFormData.dataFields[index].index]?.DropDownName)
    // }
    // if (r.value3 && r.dataType == "DropDown") {
    //   this.jsonFormData.dataFields[index].indexOne < 0 ? 0 : this.jsonFormData.dataFields[index].indexOne;
    //   // r.value3 = 
    //   this.dropdownSelectionSecond(r.value3, r, this.jsonFormData.dataFields[index]?.dropdowndata[this.jsonFormData.dataFields[index].index]?.DropDownData[this.jsonFormData.dataFields[index]?.indexOne]?.DropDownName)
    // }
  })
}

  evaluateDependsOnRules(rule: any, fieldList: any[]): { isSatisfied: boolean, failedGroups: any[] } {
    if (!rule) return { isSatisfied: true, failedGroups: [] };

    const operator = (rule.operator || 'AND').toUpperCase();
    const failedGroups: any[] = [];

    if (!Array.isArray(rule.groups)) return { isSatisfied: true, failedGroups: [] };

    if (operator === 'AND') {
      // ✅ All groups must be satisfied
      for (const group of rule.groups) {
        const fields = group.fields || [];
        const isGroupSatisfied = fields.every((fieldId: string) => {
          const fieldsWithId = fieldList.filter(f => String(f.fieldId) === String(fieldId));
          return fieldsWithId.length > 0 && fieldsWithId.some(field => field.fieldData !== null && field.fieldData !== undefined && field.fieldData !== '');
        });

        if (!isGroupSatisfied) {
          // ⛔ Stop at first failed group (priority)
          failedGroups.push({ group, failedFields: fields });
          return { isSatisfied: false, failedGroups };
        }
      }

      // ✅ All groups satisfied
      return { isSatisfied: true, failedGroups: [] };
    }

    if (operator === 'OR') {
      // ✅ At least one group must be satisfied
      let firstFailedGroup: any = null;

      for (const group of rule.groups) {
        const fields = group.fields || [];
        const isGroupSatisfied = fields.every((fieldId: string) => {
          const fieldsWithId = fieldList.filter(f => String(f.fieldId) === String(fieldId));
          return fieldsWithId.length > 0 && fieldsWithId.some(field => field.fieldData !== null && field.fieldData !== undefined && field.fieldData !== '');
        });

        if (isGroupSatisfied) {
          // ✅ Stop immediately at first satisfied group
          return { isSatisfied: true, failedGroups: [] };
        } else if (!firstFailedGroup) {
          // store first failed group but continue checking in case a later group passes
          firstFailedGroup = { group, failedFields: fields };
        }
      }

      // ⛔ No group satisfied → return only the first failed group
      return { isSatisfied: false, failedGroups: firstFailedGroup ? [firstFailedGroup] : [] };
    }

    // Default fallback
    return { isSatisfied: true, failedGroups: [] };
  }


  getDependentFields(rule: any, fieldList: any[]): any[] {
    if (!rule || !Array.isArray(rule.groups)) return [];

    const operator = (rule.operator || 'AND').toUpperCase();
    let dependentFields: any[] = [];

    if (operator === 'AND') {
      // Include fields from all groups
      rule.groups.forEach((group: any) => {
        const fields = group.fields || [];
        fields.forEach((id: string) => {
          const fieldsWithId = fieldList.filter(f => String(f.fieldId) === String(id));
          if (fieldsWithId.length > 0) {
            dependentFields.push(...fieldsWithId);
          }
          if (this.originalDataFields?.newdataPayload?.length > 0) {
            const newFieldsWithId = this.originalDataFields?.newdataPayload.filter(f => String(f.fieldId) === String(id));
            if (newFieldsWithId.length > 0) {
              dependentFields.push(...newFieldsWithId);
            }
          } else if (this.newdataPayload?.length > 0) {
            const newFieldsWithId = this.newdataPayload?.filter(f => String(f.fieldId) === String(id));
            if (newFieldsWithId.length > 0) {
              dependentFields.push(...newFieldsWithId);
            }
          }

        });
      });
    } else if (operator === 'OR') {
      // Include fields only from the first satisfied group
      for (const group of rule.groups) {
        const { isSatisfied } = this.evaluateDependsOnRules({ groups: [group] }, fieldList);
        if (isSatisfied) {
          const fields = group.fields || [];
          fields.forEach((id: string) => {
            const fieldsWithId = fieldList.filter(f => String(f.fieldId) === String(id));
            if (fieldsWithId.length > 0) {
              dependentFields.push(...fieldsWithId);
            }
            if (this.originalDataFields?.newdataPayload?.length > 0) {
              const newFieldsWithId = this.originalDataFields?.newdataPayload.filter(f => String(f.fieldId) === String(id));
              if (newFieldsWithId.length > 0) {
                dependentFields.push(...newFieldsWithId);
              }
            } else if (this.newdataPayload?.length > 0) {
              const newFieldsWithId = this.newdataPayload?.filter(f => String(f.fieldId) === String(id));
              if (newFieldsWithId.length > 0) {
                dependentFields.push(...newFieldsWithId);
              }
            }
          });
          return dependentFields;
        }
      }

      // If none satisfied, include all fields (so API knows dependencies)
      rule.groups.forEach((group: any) => {
        const fields = group.Fields || [];
        fields.forEach((id: string) => {
          const fieldsWithId = fieldList.filter(f => String(f.fieldId) === String(id));
          if (fieldsWithId.length > 0) {
            dependentFields.push(...fieldsWithId);
          }
          if (this.originalDataFields?.newdataPayload?.length > 0) {
            const newFieldsWithId = this.originalDataFields?.newdataPayload.filter(f => String(f.fieldId) === String(id));
            if (newFieldsWithId.length > 0) {
              dependentFields.push(...newFieldsWithId);
            }
          } else if (this.newdataPayload?.length > 0) {
            const newFieldsWithId = this.newdataPayload?.filter(f => String(f.fieldId) === String(id));
            if (newFieldsWithId.length > 0) {
              dependentFields.push(...newFieldsWithId);
            }
          }
        });
      });
    }

    return dependentFields;

  }



  collectFieldIds(rule: any, ids: any[] = []): any[] {
    if (!rule || !Array.isArray(rule.groups)) return ids;

    rule.groups.forEach((group: any) => {
      if (group.Fields && Array.isArray(group.Fields)) {
        ids.push(...group.Fields);
      }
    });

    return ids;
  }

  // Helper method to check if a string is valid JSON
  isJsonString(str: any): boolean {
    if (typeof str !== 'string') return false;
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  }

  // Helper method to get value from JSON string
  getJsonValue(str: any): string {
    try {
      const parsed = JSON.parse(str);
      return parsed.value || str;
    } catch (e) {
      return str;
    }
  }

  changeTab(event): void {
    this.selectedIndexTab = event.index
  }




  ngOnDestroy(): void {
    this.selectedNoteMedia = [];
    this.mediaGalleryService.selectedNoteMedia = [];
    this.mediaSelectedAsync.next(this.selectedNoteMedia);
    this._replyService.selectedNoteMedia.next(null)
  }
}

