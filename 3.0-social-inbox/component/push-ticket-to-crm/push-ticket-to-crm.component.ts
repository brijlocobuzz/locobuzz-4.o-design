import { ChangeDetectorRef, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, UntypedFormArray, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTabGroup } from '@angular/material/tabs';
import { DynamicCrmIntegrationService } from 'app/accounts/services/dynamic-crm-integration.service';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { NavigationService } from 'app/core/services/navigation.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { CustomSnackbarComponent } from 'app/shared/components/custom-snackbar/custom-snackbar.component';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { of, Subscription, timer } from 'rxjs';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { CategoryFilterComponent } from '../category-filter/category-filter.component';
import { TranslateService } from '@ngx-translate/core';

export enum SFDCInAppExperienceEnum {
  Native = 1,
  IFrame = 2
}

@Component({
    selector: 'app-push-ticket-to-crm',
    templateUrl: './push-ticket-to-crm.component.html',
    styleUrls: ['./push-ticket-to-crm.component.scss'],
    standalone: false
})
export class PushTicketToCrmComponent implements OnInit {
  lookUpField: any[]=[];
  formFields: any[]=[];
  Object = Object;
  accountDetails:any[]=[]
  selectedTabIndex:number = 0
  accountID: string;
  selectedcrmObj = {
    "crmDisplayName": "Id",
    "crmFieldName": "ID",
    "crmFieldDataType": "string",
    "locobuzzDisplayName": "",
    "locobuzzFieldName": "",
    "locobuzzFieldDataType": "String",
    "locobuzzFieldType": "",
    "crmValue": "",
    "locobuzzValue": " ",
    "locobuzzDropdownDataUI": [

    ],
    "locobuzzDropdownData": null,
    "isFieldDisabled": false,
    "isRequired": false,
    "priority": 0,
    "dataObject": 1,
    "isNonEditable": false
  };
  tempFormFields: any;
  ErrorMessageAfterWebhook: string;
  lookUpFieldFlag: boolean=true;
  customOrder = ["Name","PersonEmail","PersonMobilePhone", "FirstName", "LastName"];
  caseDatafieldsGroups: any[];
  contactDatafieldsGroups: any[];

  constructor(private ticketService:TicketsService,private postDetailsService:PostDetailService,
    private fb: FormBuilder, private _snackBar:MatSnackBar,
    private _matDialogRef: MatDialogRef<PushTicketToCrmComponent>,
    private navigationService:NavigationService,
    private _dynamicCrmIntegrationService:DynamicCrmIntegrationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _ticketSignalrService:TicketsignalrService,
    private cdk:ChangeDetectorRef,
    private _postDetailService:PostDetailService,
    private _dialog:MatDialog,
    private translate: TranslateService
  ) { }

  step:number = 1;
  postData:BaseMention
  saveFormLoader:boolean;
  formLoader: boolean;
  searchLoader:boolean;
  formFieldGroup = new UntypedFormGroup({});
  experienceType: SFDCInAppExperienceEnum;
  SFDCInAppExperienceEnumValue = SFDCInAppExperienceEnum
  accountDetailsUIRenderList: { Id: string, list: any, lookupdata:string } []=[]
  loaderTypeEnum = loaderTypeEnum;
  counter = 30;
  tick = 1000;
  timerButtonShow:boolean = false;
  @ViewChild('timer') timer: ElementRef;
  countDown: Subscription;
  reTryApiCallShow:boolean;
  editFlag:boolean;
  subs = new SubSink();
  @ViewChild(MatTabGroup) tabGroup: MatTabGroup;
  currentUser:AuthUser
  searchApiCalled:boolean = false

  ngOnInit(): void {
  this.currentUser = JSON.parse(localStorage.getItem('user'))
    this.subs.add(
      this._ticketSignalrService.enableCrmManualPushTicketCRMButton.subscribe((res: any) => {
        if (res) {
          if
            (
            res?.TagID == this?.postData?.ticketInfo?.tagID && res?.UserID == this?.currentUser?.data?.user?.userId
            // && res?.UserID == this?.data?.CurrentUser?.data?.user?.userId
          ) {
            this.counter = 0
            // this.countDown.unsubscribe();
            /* this.ticketService.updateCRMDetails.next({
              TagID: this?.postData?.ticketInfo?.tagID,
              SrID: res?.CrmID,
              guid: this.navigationService.currentSelectedTab.guid,
              postType: this.data?.pageType,
              agentID: this.data ?.fieldData?.defaultAgentUserID
            }); */
            this.ticketService.updateCRMDetailsSignal.set({
              TagID: this?.postData?.ticketInfo?.tagID,
              SrID: res?.CrmID,
              guid: this.navigationService.currentSelectedTab.guid,
              postType: this.data?.pageType,
              agentID: this.data ?.fieldData?.defaultAgentUserID
            });
            this.timerButtonShow = false;
            this.reTryApiCallShow = false;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('SR-Created-Successfully'),
              },
            });
            console.log('SR Created Successfully!', this?.postData?.ticketInfo?.tagID);
            
            this.cdk.detectChanges();
            this._matDialogRef.close()
          }
        }
      }
      )
    )

    this.subs.add(
      this.ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.subscribe(
        (data) => {
          if (data) {
            if (data.postObj.ticketID == this.postData.ticketID) {
                this.postData.ticketInfo.ticketCategoryMap = data.categoryCards;
              for (const [tabIndex, arrayKey] of Object.keys(this.formFields).entries()) {
                const formArray = this.getFormArray(arrayKey);

                for (let groupIndex = 0; groupIndex < formArray.length; groupIndex++) {
                  const group = formArray[groupIndex] as UntypedFormGroup;

                  if (group?.value?.locobuzzFieldName =='CaseCategorization')
                  {
                    let categoryText = '';
                    data.categoryCards?.forEach((x, index) => {
                      categoryText += index == 0 ? ` @${x.name?.trim()}/`.trim() : ` @${x.name?.trim()}/`;
                      x?.subCategories?.forEach((y, index) => {
                        categoryText += (index == 0) ? ` ${y.name?.trim()}/` : `${y.name?.trim()}/`;
                        y?.subSubCategories?.forEach(z => {
                          categoryText += `${z.name?.trim()}/`;
                        });
                      });
                    });
                    group.get('locobuzzValue').setValue(categoryText)
                  }
                }
              }
              }
            }
          }
        )
      )

    this.subs.add(
      this.ticketService.ticketcategoryMapChange.subscribe((value) => {
        if (value) {
          if (value?.BaseMention?.tagID === this.postData?.tagID) {
              this.postData.ticketInfo.ticketCategoryMap =
                value?.BaseMention.ticketInfo?.ticketCategoryMap;

            for (const [tabIndex, arrayKey] of Object.keys(this.formFields).entries()) {
              const formArray = this.getFormArray(arrayKey);

              for (let groupIndex = 0; groupIndex < formArray.length; groupIndex++) {
                const group = formArray[groupIndex] as UntypedFormGroup;
                if (group?.value?.locobuzzFieldName == 'CaseCategorization') {
                  let categoryText = '';
                  value?.BaseMention.ticketInfo?.ticketCategoryMap?.forEach((x,index) => {
                    categoryText += index == 0 ? ` @${x.name?.trim()}/`.trim() : ` @${x.name?.trim()}/`;
                    x?.subCategories?.forEach((y, index) => {
                      categoryText += (index == 0) ? ` ${y.name?.trim()}/` : `${y.name?.trim() }/`;
                      y?.subSubCategories?.forEach(z => {
                        categoryText +=`${z.name?.trim()}/`;
                      });
                    });
                  });
                  group.get('locobuzzValue').setValue(categoryText)
                }
              }
            }
            }
          }
        }
      )
    );


    this.editFlag = this.data.editFlag
    this.postData = this.postDetailsService.postObj;
    if(this.postData?.ticketInfo?.srid)
    {
     this.step =2;
     this.lookUpFieldFlag=false
    }
    this.getSavedSRDetailsRes(this.data.fieldData)
  }

  getSrDetails():void{

  }


  searchExitingAccount(value:string,crmFieldObj):void{

    if(value=='')
    {
      this.searchApiCalled = false
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-type-something'),
        },
      });
      return
    }

    if (crmFieldObj?.crmFieldDataType =='EmailId')
    {
      const emailval = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
      if (!emailval.test(value))
      {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-enter-valid-emailID'),
          },
        });
      }
    }

    // const Rgx = new RegExp(/^\+?[0-9][0-9]{7,14}$/);

    // if (
    //   this.author.locoBuzzCRMDetails.phoneNumber &&
    //   !Rgx.test(this.author.locoBuzzCRMDetails.phoneNumber)
    // ) {
    //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //     duration: 5000,
    //     data: {
    //       type: notificationType.Warn,
    //       message: 'Please enter valid mobile number',
    //     },
    //   });
    //   return false;
    // }

    this.lookUpField?.forEach((x)=>{
      if (x?.crmFieldName != crmFieldObj?.crmFieldName)
      {
        x.locobuzzValue = ''
      }
    })

   this.searchLoader = true
    this.accountDetailsUIRenderList = []
    const obj = {
      "input": value,
      "dataObject": crmFieldObj?.dataObject,
      "brandID": this.postData?.brandInfo?.brandID,
      "sfdcFieldData": {
        "displayName": crmFieldObj?.crmFieldObj,
        "fieldName": crmFieldObj?.crmFieldName,
        "dataType": crmFieldObj?.crmFieldDataType
      }
    }
    this.searchApiCalled = true
    this.ticketService.searchExitingCRMAccount(obj).subscribe((res)=>{
      if(res?.success)
      {
        this.accountDetails = res.data;
        this.createAccountDetailsUI();
        // this.selectedcrmObj = crmFieldObj;
      }else{
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: (res.message)?res.message:this.translate.instant('Unable-to-fetch-details'),
          },
        });
        this.searchLoader = false
      }
    },err=>{
      this.searchLoader = false
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something-went-wrong'),
        },
      });
  })
}

  createAccountDetailsUI():void
  {
    if(this.accountDetails?.length>0)
    {
     this.accountDetails?.forEach((x)=>{
       const IdObj = x?.savestructure?.find((y) => y?.crmFieldName == "Id");
      const list = [];
       const sortedStructure = this.sortSaveStructureByCustomOrder(x?.savestructure, this.customOrder);
       sortedStructure?.forEach(y => {
         list.push({ crmFieldName: y.crmFieldName, crmValue: y.crmValue })
       });
       if (IdObj) {
         this.accountDetailsUIRenderList.push({ Id: IdObj?.crmValue, list: list, lookupdata: x?.lookupdata })
       }
     })
    }
    this.searchLoader = false
  }

  sortSaveStructureByCustomOrder(data, customOrder) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.error("Invalid or empty data array.");
      return [];
    }

    if (!customOrder || !Array.isArray(customOrder) || customOrder.length === 0) {
      console.error("Invalid or empty custom order array.");
      return data; // Return data as is if no valid order is provided.
    }

    const orderMap = new Map(customOrder.map((name, index) => [name, index]));

    return data.sort((a, b) => {
      const aIndex = orderMap.get(a.crmFieldName) ?? Infinity; // Fields not in order array go last.
      const bIndex = orderMap.get(b.crmFieldName) ?? Infinity;
      return aIndex - bIndex;
    });
  }
  

  getFormDetails():void{
    this.formLoader = true
    const obj = {
      "BrandID": this?.postData?.brandInfo?.brandID,
      "TicketID": this.postData.ticketInfo.ticketID,
      "TagID": this.postData.tagID,
    }
    this.ticketService.getCrmFieldForm(obj).subscribe((res) => {
      if(res.success)
      {
        this.experienceType = res?.data?.experienceType
        this.lookUpField = res?.data?.lookupFields;
        if(this.lookUpField?.length==0)
        {
          this.step = 2
        }
        const formFields = res?.data?.formFields;
        this.tempFormFields = this.Object.assign({},formFields);
        if (this.experienceType == SFDCInAppExperienceEnum.IFrame)
        {
          delete formFields.socialPersonaMapping
          delete formFields.socialPostMapping

        }
        this.formFields = formFields;
        this.createFormArrays(this.formFields)
      }else{
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Unable-to-fetch-field-details'),
          },
        });
      }
      this.formLoader = false
    }
    )
  }

  createFormArrays(data: any): void {
    Object.keys(data).forEach(arrayKey => {
      // Create a FormArray for each key in the JSON
      const formArray: UntypedFormArray = this.fb.array([]);

      data[arrayKey].forEach(item => {
        // Push a new FormGroup for each item in the array
        const group = this.createItemFormGroup(item, data[arrayKey]);
        if (!(formArray?.value?.some((x) => (x.locobuzzDisplayName == item.locobuzzDisplayName) && (x.locobuzzFieldDataType == item.locobuzzFieldDataType))))
        {
          formArray.push(group);
        }
      });
      // Add each FormArray to the main FormGroup with the key as the name
      this.formFieldGroup.addControl(arrayKey, formArray);
    });
  }

  createItemFormGroup(item: any,list): UntypedFormGroup {
    const group = this.fb.group({});
    Object.keys(item).forEach(key => {
      let value;
      if (key == 'locobuzzDropdownData')
      {
        let value =[]
        if ((item[key] && typeof (item[key]) == 'string'))
        {
          const dropDownObj = JSON.parse(item[key])?.[0]
          if (dropDownObj?.DropDownName == item['locobuzzDisplayName'])
          {
            value = (dropDownObj?.DropDownData) ? dropDownObj?.DropDownData : [];
          }else{
            if (group.get('locobuzzValue').value)
            {
              dropDownObj?.DropDownData?.forEach(x => {
                x?.DropDownData?.forEach(y => {
                  if (y?.Value == group.get('locobuzzValue').value)
                  {
                    value = x?.DropDownData;
                  }
                  y?.DropDownData?.forEach(z => {
                    if (z?.Value == group.get('locobuzzValue').value) {
                      value = y?.DropDownData;
                    }
                  });
                });
              });
            }else{
              value = []
            }
          }

        }
      
        group.addControl('locobuzzDropdownDataUI', new UntypedFormControl(value,[]));
        group.addControl('locobuzzDropdownData', new UntypedFormControl(item[key], []));
      }else
      {
        value = item[key]
        
        // Auto-populate Notes field with post description if empty
        if (key == 'locobuzzValue' && item['locobuzzFieldName'] == 'Notes' && (!value || value === '')) {
          value = this.postData?.description || '';
        }
        
        group.addControl(key, new UntypedFormControl(value, (key == 'locobuzzValue' && item['isRequired']) ? [Validators.required] : []));
        if (key == 'locobuzzValue' && group.get('locobuzzFieldDataType').value == 'EmailId')
        {
          group.get('locobuzzValue').addValidators([Validators.pattern(/^([a-zA-Z0-9_&\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/)])
        }
      }
    });
    return group;
  }

  isDuplicate(name: string): boolean {
    return this.formFieldGroup.value.some(
      control => control === name
    );
  }



  saveForm():void
  {
    if(this.validateAndNavigate())
      {
        return
      };

    if (this.validateGroup('caseMapping',this.caseDatafieldsGroups))
      {
      this.tabGroup.selectedIndex = 0
        return
      }

    if (this.validateGroup('accountMapping',this.contactDatafieldsGroups))
      {
      this.tabGroup.selectedIndex = 1
        return
      }

    this.saveFormLoader = true
    this.timerButtonShow = true;

    let formValue = this.formFieldGroup.value;

    if(this.experienceType == SFDCInAppExperienceEnum.IFrame)
    {
      formValue.socialPersonaMapping = this.tempFormFields?.socialPersonaMapping;
      formValue.socialPostMapping = this.tempFormFields?.socialPostMapping;
    }

    if (formValue?.caseMapping)
    {
      formValue?.caseMapping?.forEach(x => {
        const sameDisplayNameFields = this.tempFormFields?.caseMapping?.filter((y) => y.locobuzzDisplayName == x?.locobuzzDisplayName);
        if (sameDisplayNameFields?.length>1)
        {
          console.log(sameDisplayNameFields);   
          const diffArray = sameDisplayNameFields?.filter((y) => y.crmDisplayName != x.crmDisplayName)
          diffArray?.forEach((element)=>{
            if (!(formValue?.caseMapping?.some((y) => y?.crmDisplayName == element?.crmDisplayName))) {
              element.locobuzzValue = x.locobuzzValue
            const index = formValue?.caseMapping?.findIndex((y) => y.locobuzzDisplayName == x.locobuzzDisplayName )
            if(index>-1)
            {
              formValue?.caseMapping?.splice(index+1, 0, element)
            }
          }
          })
        }
      });
    }

    if (formValue?.accountMapping) {
      formValue?.accountMapping?.forEach(x => {
        const sameDisplayNameFields = this.tempFormFields?.accountMapping?.filter((y) => y.locobuzzDisplayName == x?.locobuzzDisplayName);
        if (sameDisplayNameFields?.length > 1) {
          console.log(sameDisplayNameFields);
          const diffArray = sameDisplayNameFields?.filter((y) => y.crmDisplayName != x.crmDisplayName)
          diffArray?.forEach((element) => {
            if (!(formValue?.accountMapping?.some((y) => y?.crmDisplayName == element?.crmDisplayName))) {
              element.locobuzzValue = x.locobuzzValue
              const index = formValue?.accountMapping?.findIndex((y) => y.locobuzzDisplayName == x.locobuzzDisplayName)
              if (index > -1) {
                formValue?.accountMapping?.splice(index + 1, 0, element)
              }
            }
          })
        }
      });
    }


    if(this.selectedcrmObj)
    {
      formValue?.accountMapping?.push(this.selectedcrmObj) 
    }
    
    // Update caseDatafieldsGroups with current form values
    if (this.caseDatafieldsGroups && this.caseDatafieldsGroups.length > 0) {
      this.caseDatafieldsGroups.forEach(group => {
        if (group.fields && Array.isArray(group.fields)) {
          group.fields.forEach(field => {
            const formArray = this.formFieldGroup.get('caseMapping') as UntypedFormArray;
            if (formArray) {
              const matchingControl = formArray.controls.find(ctrl => 
                ctrl.value.locobuzzFieldName === field.locobuzzFieldName && 
                ctrl.value.locobuzzFieldDataType === field.locobuzzFieldDataType
              );
              if (matchingControl) {
                field.locobuzzValue = matchingControl.value.locobuzzValue;
              }
            }
          });
        }
      });
      formValue.caseDatafieldsGroups = this.caseDatafieldsGroups;
    }

    // Update contactDatafieldsGroups with current form values
    if (this.contactDatafieldsGroups && this.contactDatafieldsGroups.length > 0) {
      this.contactDatafieldsGroups.forEach(group => {
        if (group.fields && Array.isArray(group.fields)) {
          group.fields.forEach(field => {
            const formArray = this.formFieldGroup.get('accountMapping') as UntypedFormArray;
            if (formArray) {
              const matchingControl = formArray.controls.find(ctrl => 
                ctrl.value.locobuzzFieldName === field.locobuzzFieldName && 
                ctrl.value.locobuzzFieldDataType === field.locobuzzFieldDataType
              );
              if (matchingControl) {
                field.locobuzzValue = matchingControl.value.locobuzzValue;
              }
            }
          });
        }
      });
      formValue.contactDatafieldsGroups = this.contactDatafieldsGroups;
    }

    const obj ={
      FormMapping: formValue,
      BrandID:this.postData.brandInfo.brandID,
      TicketID:this.postData.ticketInfo.ticketID,
      TagID:this.postData.tagID,
      SocialID:this.postData.author.socialId,
      MapId:this.postData.ticketInfoCrm.mapid,
      BrandName:this.postData.brandInfo.brandName,
      ChannelGroupID:this.postData.channelGroup,
      ChannelType:this.postData.channelType
    }
    this.ticketService.pushTicketToCRM(obj).subscribe((res)=>{
      this.saveFormLoader = false;
      if(res.success)
      {
        this.counter = 30
        this.updateTimer()
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('CRM-Form-Submitted-Successfully'),
          },
        });
      }else{
        this.timerButtonShow = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: (res.message)?res.message:this.translate.instant('Unable-to-save-form'),
          },
        });
      }
    },err=>{
      this.timerButtonShow = false;
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Unable-to-save-form'),
        },
      });
    }
    )
  }1

  getFormArray(name: string): any[] {
    const arr = this.formFieldGroup.get(name) as UntypedFormArray;
    if (!arr) return [];
    // Return all controls without filtering by groupId
    return arr.controls;
  }

  /**
   * Returns controls from the form array with the given name, filtered by locobuzzFieldName present in the provided fieldNames array.
   * @param name The name of the form array in the form group
   * @param fieldNames Array of locobuzzFieldName to filter controls
   */
  getFormArrayByFieldNames(name: string, fieldNames: any[]): any[] {
    const arr = this.formFieldGroup.get(name) as UntypedFormArray;
    if (!arr || !Array.isArray(fieldNames) || fieldNames.length === 0) return [];
    return arr.controls.filter(ctrl => ctrl.value && fieldNames.some((x) => x.locobuzzFieldName == ctrl.value.locobuzzFieldName && x.locobuzzFieldDataType == ctrl.value.locobuzzFieldDataType));
  }

  isFieldInGroup(fieldNames: any[], fieldName: string, fieldDataType: string): boolean {
    if (!Array.isArray(fieldNames) || fieldNames.length === 0) return false;
    if (!fieldName || !fieldDataType) return false;
    const result = fieldNames.some((x) => x.locobuzzFieldName === fieldName && x.locobuzzFieldDataType === fieldDataType);
    console.log('isFieldInGroup called:', { fieldNames, fieldName, fieldDataType, result });
    return result;
  }

  isFieldBelongsToAnyGroup(fieldName: string, fieldDataType: string, arrayKey: string): boolean {
    const groups = arrayKey === 'caseMapping' ? this.caseDatafieldsGroups : arrayKey === 'accountMapping' ? this.contactDatafieldsGroups : [];
    if (!groups || groups.length === 0) return false;
    
    return groups.some(group => 
      group.fields && group.fields.some((x) => x.locobuzzFieldName === fieldName && x.locobuzzFieldDataType === fieldDataType)
    );
  }

  getLableName(key):string{
    return key == 'caseMapping' ? 'Case' : key == 'accountMapping' ? 'Account' : key == 'socialPersonaMapping'?'Social Persona':'Social Post'
  }

  validateAndNavigate():boolean {
    let flag = false
    if (this.formFieldGroup.invalid) {
      for (const [tabIndex, arrayKey] of Object.keys(this.formFields).entries()) {
        const formArray = this.getFormArray(arrayKey);

        for (let groupIndex = 0; groupIndex < formArray.length; groupIndex++) {
          const group = formArray[groupIndex] as UntypedFormGroup;

          for (const controlName of Object.keys(group.controls)) {
            const control = group.get(controlName);

            if (control?.invalid && group.get('groupId').value==0) {
              // Set the tab index to the current tab containing the invalid control
              this.tabGroup.selectedIndex = tabIndex;

              // Delay focus to ensure the tab switch is completed first
              // setTimeout(() => {
              //   const input = this.inputs.toArray().find((el, index) => index === groupIndex);
              //   input?.nativeElement.focus();
              // });

              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Warn,
                  message: `${group.get('locobuzzDisplayName').value } field is invalid.`,
                },
              });

              return true; // Exit after finding the first invalid control
            }
          }
        }
      }
    }
    return flag
  }

  createNewCase(item):void{
    this.selectedcrmObj = {
    "crmDisplayName": "Id",
    "crmFieldName": "ID",
    "crmFieldDataType": "string",
    "locobuzzDisplayName": "",
    "locobuzzFieldName": "",
    "locobuzzFieldDataType": "String",
    "locobuzzFieldType": "",
    "crmValue": "",
    "locobuzzValue": " ",
    "locobuzzDropdownDataUI": [

    ],
    "locobuzzDropdownData": null,
    "isFieldDisabled": false,
    "isRequired": false,
    "priority": 0,
    "dataObject": 1,
    "isNonEditable": false
  };
    this.selectedcrmObj.crmValue = item?.Id;
    this.selectedcrmObj.locobuzzValue = item?.lookupdata
  this.step = 2
  }

  checkIntegratedCustomFieldsOrNot(key:string):boolean
  {
    return this.formFields[key]?.some((x) => x.locobuzzFieldType =='IntegrationCustom')
  }

  updateTimer() {
    this.reTryApiCallShow = false;
    this.timerButtonShow = true;
    this.countDown = timer(0, this.tick)
      .pipe(take(this.counter))
      .subscribe(() => {
        --this.counter;
        // console.log(this.counter);
        if (this.counter == 1) {
          this.counter = 30
          this.timerButtonShow = false;
          this.reTryApiCall()
          this.countDown.unsubscribe();
        }
      });
  }

  reTryApiCall() {
    let body = { "TicketID": this?.postData?.ticketInfo?.ticketID, "BrandID": +this.postData?.brandInfo?.brandID }
    this._dynamicCrmIntegrationService.GetSRID(body).subscribe((res) => {
      this.ErrorMessageAfterWebhook = this.translate.instant('CRM-data-saved')

      if (res.success) {
        /* this.ticketService.updateCRMDetails.next({
          TagID: this?.postData?.ticketInfo?.tagID,
          SrID: res?.data,
          guid: this.navigationService.currentSelectedTab.guid,
          postType: this.data?.pageType,
          agentID: this.data?.fieldData?.defaultAgentUserID
        }); */
        this.ticketService.updateCRMDetailsSignal.set({
          TagID: this?.postData?.ticketInfo?.tagID,
          SrID: res?.data,
          guid: this.navigationService.currentSelectedTab.guid,
          postType: this.data?.pageType,
          agentID: this.data?.fieldData?.defaultAgentUserID
        });
        // this.reTryApiCallShow = false;
        this.timerButtonShow = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('SR-Created-Successfully'),
          },
        });
        this._matDialogRef.close()
      } else {
        this.timerButtonShow = false;
        this.reTryApiCallShow = true;
      }
    }, err => {
      this.timerButtonShow = false;
      this.reTryApiCallShow = true;
    })

  }

  getSavedSRDetails():void
  {
    const obj = {
      "BrandID": this?.postData?.brandInfo?.brandID,
      "TicketID": this.postData.ticketInfo.ticketID,
      "TagID": this.postData.tagID,
    }
    this.formLoader = true

    this.ticketService.getCrmFieldForm(obj).subscribe((res) => {
      if (res.success) {
        this.getSavedSRDetailsRes(res.data);
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Unable-to-fetch-field-details'),
          },
        });
      }
      this.formLoader = false
    }
    )
  }

  getSavedSRDetailsRes(data):void
  {
    this.experienceType = data?.experienceType
    this.lookUpField = data?.lookupFields;
    if (this.lookUpField?.length == 0) {
      this.step = 2;
      this.lookUpFieldFlag = false
    }
    const formFields = data?.formFields;
    this.tempFormFields = this.Object.assign({}, formFields);
    if (this.experienceType == SFDCInAppExperienceEnum.IFrame) {
      delete formFields.socialPersonaMapping
      delete formFields.socialPostMapping

    }
    
    if (formFields?.accountMapping?.length == 0 || !formFields?.accountMapping)
    {
      delete formFields.accountMapping
    }

    this.caseDatafieldsGroups = formFields?.caseDatafieldsGroups || [];
    this.contactDatafieldsGroups = formFields?.contactDatafieldsGroups || [];

    delete formFields?.caseDatafieldsGroups
    delete formFields?.contactDatafieldsGroups

    this.formFields = formFields;
    this.createFormArrays(this.formFields)
  }

  dropDownEvent(item):void{
    for (const [tabIndex, arrayKey] of Object.keys(this.formFields).entries()) {
      const formArray = this.getFormArray(arrayKey);

      for (let groupIndex = 0; groupIndex < formArray.length; groupIndex++) {
        const group = formArray[groupIndex] as UntypedFormGroup;

        if (group?.controls?.locobuzzDisplayName?.value == item?.DropDownName)
          {
          group?.controls?.locobuzzDropdownDataUI?.setValue(item?.DropDownData)
          if (item?.DropDownData[0]?.DropDownName)
          {
            formArray?.forEach((x)=>{
              if (x.get('locobuzzDisplayName').value == item?.DropDownData[0]?.DropDownName)
              {
                x.get('locobuzzDropdownDataUI').setValue([])
              }
            })
          }
        }
      }
    }
  }

  openCategoryDialog(event): void {
      // this.postActionTypeEvent.emit({ actionType: PostActionEnum.mentionCategory, param: {mentionCategory}});
      this.postData.categoryMapText = null;
      this._postDetailService.postObj = this.postData;
      this._postDetailService.isBulk = false;
      this._postDetailService.categoryType = event;
      this._postDetailService.pagetype = this.data.pageType;
      this._postDetailService.isBulkQualified = false;
      this._dialog.open(CategoryFilterComponent, {
        width: '73vw',
        panelClass: ['responsive__modal--fullwidth'],
        disableClose: false,
      });
    }

    backEvent():void
    {
      this.step=1;
      this.selectedcrmObj = {
        "crmDisplayName": "Id",
        "crmFieldName": "ID",
        "crmFieldDataType": "string",
        "locobuzzDisplayName": "",
        "locobuzzFieldName": "",
        "locobuzzFieldDataType": "String",
        "locobuzzFieldType": "",
        "crmValue": "",
        "locobuzzValue": "",
        "locobuzzDropdownDataUI": [

        ],
        "locobuzzDropdownData": null,
        "isFieldDisabled": false,
        "isRequired": false,
        "priority": 0,
        "dataObject": 1,
        "isNonEditable": false
      };
    }

    validateGroup(tabName:string,fieldGroups:any[]):boolean
    {
      let flag = false
      if(fieldGroups?.length>0)
      {
        fieldGroups?.forEach((group)=>{
          const formArray = this.getFormArrayByFieldNames(tabName, group.fields);
          let mandatoryFields = Number(group.mandatoryFields)
          let totalFields = formArray?.length;
          let filledFields = 0;
          formArray?.forEach((x)=>{
            if (x.get('locobuzzValue').value && x.get('locobuzzValue').value !='')
            {
              filledFields +=1
            }
          })
          if (filledFields < mandatoryFields)
          {
            flag = true
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: "Please fill at least " + mandatoryFields + " fields in " + group.name +" group.",
              },
            });
            return
          }
        })
        return flag
      }
    }
}




