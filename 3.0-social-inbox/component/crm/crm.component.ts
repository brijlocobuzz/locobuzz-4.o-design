import { ChangeDetectorRef, Component, effect, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { CustomCrmColumns } from 'app/core/interfaces/AuthorDetails';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseSocialAuthor } from 'app/core/models/authors/locobuzz/BaseSocialAuthor';
import { Author } from 'app/core/models/crm/CRMMentionMetaData';
import { CRMMenu } from 'app/core/models/crm/CRMMenu';
import {
  ApolloRequestType,
  BTCCrmRequestType,
} from 'app/core/models/crm/NonTelecomRequest';
import { tataUniCrmDetails } from 'app/core/models/crm/TataUniCrmDetails';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { AccountService } from 'app/core/services/account.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { CrmService } from 'app/social-inbox/services/crm.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { take } from 'rxjs/operators';
import { NewSrComponent } from '../new-sr/new-sr.component';
import { SubSink } from 'subsink';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';

@Component({
    selector: 'app-crm',
    templateUrl: './crm.component.html',
    styleUrls: ['./crm.component.scss'],
    standalone: false
})
export class CrmComponent implements OnInit {
  eBTCCrmRequestType = BTCCrmRequestType;
  selected = '+91';
  crmLists = [];
  buttonList = [];
  selectedTab: number;
  defaultMenu = true;
  CrmDetails: any[] = [];
  ticketId: number;
  requestType: BTCCrmRequestType;
  apolloCrmMasterDetails: any;
  tataUniCrmMasterDetails: any;
  tataUniCrmDetails: tataUniCrmDetails;
  masterDetailsLoader: boolean;
  srId: string;
  @ViewChild('createCrmRef') createCrmRef:ElementRef;
  defaultLayout: boolean = false;
  subs = new SubSink();
  constructor(
    public dialog: MatDialog,
    private _crmService: CrmService,
    private _postDetailService: PostDetailService,
    private _filterService: FilterService,
    private _userDetailService: UserDetailService,
    private _accountService: AccountService,
    private _ticketService: TicketsService,
    private _cdr: ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
  ) {
    let onLoadClearNote = true;
    effect(() => {
      const value = this._ticketService.updateCrmCreateButtonSignal();
      if (!onLoadClearNote && value) {
        this.updateCrmCreateButtonSignalChange(value);
        this._ticketService.updateCrmCreateButtonSignal.set(null);
      } else {
        onLoadClearNote = false;
      }
    }, { allowSignalWrites: true });
  }

  crmmenu: CRMMenu;
  postData: BaseMention;
  author?: BaseSocialAuthor;
  currentUser: AuthUser;
  showCreateSrButton: boolean = false;

  ngOnInit(): void {
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    this.postData = this._postDetailService.postObj;
    this.ticketId = this._postDetailService.postObj.ticketID;
    this.srId = this.postData.ticketInfo.srid;
    this.getAuthorDetails();
    this.crmmenu = this._crmService.crmmenu;
    for (const menu of this.crmmenu.data.leftSide) {
      const item = {
        requestType: +menu.value,
        tabName: menu.label,
        menuName: menu.label + '(' + menu.totalCount + ')',
        isActive: menu.label == 'Sr' && menu.totalCount > 0 ? true : false,
      };
      if (item.menuName != 'Sr(0)' && menu.totalCount > 0) {
        setTimeout(() => {
          this.defaultMenu = false;
          this.openTab(+menu.value);
        }, 100);
      }
      this.crmLists.push(item);
      this.buttonList.push(item);
    }
    this.selectedTab = BTCCrmRequestType.CustomerInfo;
    this.requestType = this._crmService.requestType;
    if (this._crmService.crmName.toLowerCase() == 'apollocrm') {
      this.getCrmApolloMasterDetails();
    }
    if (this._crmService.crmName.toLowerCase() == 'tataunicrm') {
      this.GetTataUniCrmDetails();
    }
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
    /* this._ticketService.updateCrmCreateButton.subscribe((res) => {
      if (res) {
        const brandObj = this._filterService.fetchedBrandData.find(
          (obj) => +obj.brandID == this.postData.brandInfo.brandID
        );

        if (this.srId) {
          if (
            (this._crmService.crmName.toLowerCase() == 'bandhancrm' ||
              this._crmService.crmName.toLowerCase() == 'apollocrm' ||
              this._crmService.crmName.toLowerCase() == 'fedralcrm' ||
              this._crmService.crmName.toLowerCase() == 'tataunicrm' ||
              this._crmService.crmName.toLowerCase() == 'recrm' ||
              this._crmService.crmName.toLowerCase() == 'extramarkscrm' ||
              this._crmService.crmName.toLowerCase() == 'dreamsolcrm' ||
              this._crmService.crmName.toLowerCase() == 'octafxcrm' ||
              this._crmService.crmName.toLowerCase() == 'tatacapitalcrm' ||
              this._crmService.crmName.toLowerCase() == 'duraflexcrm') &&
            (this.postData.ticketInfo.status ==
              TicketStatus.PendingwithCSDWithNewMention ||
              this.postData.ticketInfo.status ==
                TicketStatus.OnHoldCSDWithNewMention ||
              this.postData.ticketInfo.status ==
                TicketStatus.PendingWithBrandWithNewMention ||
              this.postData.ticketInfo.status ==
                TicketStatus.RejectedByBrandWithNewMention ||
              (this.postData.ticketInfo.status ==
                TicketStatus.OnHoldBrandWithNewMention &&
                brandObj.isBrandworkFlowEnabled))
          ) {
            this.showCreateSrButton = true;
            this.createCrmRef.nativeElement.style.display = 'block';
            this._crmService.newMentionFound = true;
            if (this._crmService.crmName.toLowerCase() == 'fedralcrm') {
              if (this._crmService.fedralrequest.RequestType == 2) {
                this.showCreateSrButton = false;
                this.createCrmRef.nativeElement.style.display = 'none';
              }
              if (this._crmService.fedralrequest.RequestType == 1) {
                this.buttonList = this.buttonList.filter(
                  (obj) => obj.tabName != 'Lead'
                );
              }
            } else {
              let requestType: any;
              if (this._crmService.crmName.toLowerCase() == 'apollocrm') {
                requestType = this._crmService.apollorequest.RequestType;
              } else if (this._crmService.crmName.toLowerCase() == 'recrm') {
                requestType = this._crmService.rercrmRequest.RequestType;
              } else if (
                this._crmService.crmName.toLowerCase() == 'tataunicrm'
              ) {
                requestType = this._crmService.tataUniRequest.RequestType;
              } else if (
                this._crmService.crmName.toLowerCase() == 'extramarkscrm'
              ) {
                requestType = this._crmService.extramarksRequest.RequestType;
              } else if (
                this._crmService.crmName.toLowerCase() == 'octafxcrm'
              ) {
                requestType = this._crmService.octafxCrmRequest.RequestType;
              } else if (
                this._crmService.crmName.toLowerCase() == 'bandhancrm'
              ) {
                requestType = this._crmService.bandhanrequest.RequestType;
              } else if (this._crmService.crmName.toLowerCase() == 'magmacrm') {
                requestType = this._crmService.magmarequest.RequestType;
              } else if (
                this._crmService.crmName.toLowerCase() == 'extramarkscrm'
              ) {
                requestType = this._crmService.extramarksRequest.RequestType;
              } else if (this._crmService.crmName.toLowerCase() == 'dreamsolcrm'){
                requestType = this._crmService.dreamsolRequest.RequestType;
              } else if (this._crmService.crmName.toLowerCase() == 'tatacapitalcrm'){
                requestType = this._crmService.tataCapitalRequest.RequestType;
              
              } else if ( this._crmService.crmName.toLowerCase() == 'duraflexcrm'){
                requestType = this._crmService.duraflexRequest.RequestType;
              }
              this.buttonList = this.buttonList.filter(
                (obj) => obj.requestType == requestType
              );
            }
          }else{
            this.createCrmRef.nativeElement.style.display = 'none';
          }
        } else {
          this.showCreateSrButton = true;
          this.createCrmRef.nativeElement.style.display = 'block';
          this._crmService.newMentionFound = false;
        }
        setTimeout(() => {
          if (this.postData?.ticketInfo?.status != 0 && this.postData?.ticketInfo?.status != 4 && this.postData?.ticketInfo?.status != 12 && this.postData?.ticketInfo?.status != 5) {
            this.createCrmRef.nativeElement.style.display = 'none';
          }
        }, 10);
      }
    }); */
  }

  // create new SR

  newSRDialog(requesttype: BTCCrmRequestType, requestTypeTitle: string): void {
    if (this._crmService.crmName.toLowerCase() == 'apollocrm') {
      this.fillApolloFields(this.apolloCrmMasterDetails, requesttype);
    }
    this._crmService.requestTypeTitle = requestTypeTitle;
    this._crmService.requestType = requesttype;
    let dialogRef;
    if (this._crmService.crmName.toLowerCase() == 'tataunicrm') {
      dialogRef = this.dialog.open(NewSrComponent, {
        width: '1050px',
        data: {
          tataUniCrmDetailsDoesNotExist: this.tataUniCrmDetails ? false : true,
          CustomerHash: this.tataUniCrmDetails
            ? this.tataUniCrmDetails.customerDetails.customerHash
            : '',
          mobile: this.tataUniCrmDetails
            ? this.tataUniCrmDetails.customerDetails.primaryMobile.phoneNumber
            : '',
          email: this.tataUniCrmDetails
            ? this.tataUniCrmDetails.customerDetails.primaryEmailId
            : '',
          author: this.author,
        },
      });
    } else if (this._crmService.crmName.toLowerCase() == 'dreamsolcrm'){
      dialogRef = this.dialog.open(NewSrComponent, {
        width: '1050px',
        data: {
          mobile: this.CrmDetails.filter(r => r.id == "PhoneNumber")[0]?.value,
          email: this.CrmDetails.filter(r => r.id == 'EmailID')[0]?.value
        },
      });
    }
    else {
      dialogRef = this.dialog.open(NewSrComponent, {
        width: '1050px',
      });
    }
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (this._crmService.crmName.toLowerCase() == 'tataunicrm') {
          this.tataUniCrmDetails = result;
          this.CrmDetails.push({
            id: 'Contact Number',
            value: this.tataUniCrmDetails.encrptedPhoneNo,
          });
          this.CrmDetails.push({
            id: 'DOB',
            value: this.tataUniCrmDetails.customerDetails.dob
              ? this.tataUniCrmDetails.customerDetails.dob
              : 'NA',
          });
          this.CrmDetails.push({
            id: 'Gender',
            value: this.tataUniCrmDetails.customerDetails.gender
              ? this.tataUniCrmDetails.customerDetails.gender
              : 'NA',
          });
          this.CrmDetails.push({
            id: 'Primary Email ID',
            value: this.tataUniCrmDetails.encrptedEmailAddress
              ? this.tataUniCrmDetails.encrptedEmailAddress
              : 'NA',
          });
          this.CrmDetails.push({
            id: 'Coporate Email ID',
            value: this.tataUniCrmDetails.customerDetails.corporateEmailId
              ? this.tataUniCrmDetails.customerDetails.corporateEmailId
              : 'NA',
          });
          this.CrmDetails.push({
            id: 'Customer Hash',
            value: this.tataUniCrmDetails.customerDetails.customerHash
              ? this.tataUniCrmDetails.customerDetails.customerHash
              : 'NA',
          });
          this.CrmDetails.push({
            id: 'Tata',
            value:
              this.tataUniCrmDetails.customerDetails.tataFlag != null
                ? this.tataUniCrmDetails.customerDetails.tataFlag
                : 'NA',
          });
          this.CrmDetails.push({
            id: 'Activation Flag',
            value: this.tataUniCrmDetails.customerDetails.activationFlag
              ? this.tataUniCrmDetails.customerDetails.activationFlag
              : 'NA',
          });
          this.CrmDetails.push({
            id: 'Created Date',
            value: this.tataUniCrmDetails.customerDetails.createdDate
              ? this.tataUniCrmDetails.customerDetails.createdDate
              : 'NA',
          });
          this.CrmDetails.push({
            id: 'VIP',
            value:
              this.tataUniCrmDetails.customerDetails.isVIP != null
                ? this.tataUniCrmDetails.customerDetails.isVIP
                : 'NA',
          });
        }
      }
    });
  }

  // CRM data hide and show

  openTab(requestType: any) {
    if (requestType === 0) {
      this.defaultMenu = true;
    } else {
      this.defaultMenu = false;
    }
    this.getAuthorDetails();
    this.selectedTab = requestType;
    this.crmLists = this.crmLists.filter((x) => {
      if (x.requestType === requestType) {
        x.isActive = true;
      } else {
        x.isActive = false;
      }
      return x;
    });
  }

  private getAuthorDetails(): void {
    const filterObj = this._filterService.getGenericRequestFilter(
      this.postData
    );
    this._userDetailService.GetAuthorDetails(filterObj).subscribe((data) => {
      // console.log('User Details', data);
      this.author = {};
      this.author = data;
      this.CrmDetails =[]; //for refection in the customer details.
      this.mapCRMColumns(data);
    });
  }

  mapCRMColumns(author: BaseSocialAuthor): void {
    for (const column of author.crmColumns.existingColumns) {
      const crmObj: CustomCrmColumns = {};
      if (!column.isDisabled && !column.isDeleted) {
        switch (column.dbColumn) {
          case 'Name':
            crmObj.id = 'PersonalDetailsName';
            crmObj.value = author.locoBuzzCRMDetails.name;
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'EmailID':
            crmObj.id = 'PersonalDetailsEmail';
            crmObj.value = author.locoBuzzCRMDetails.emailID
              ? author.locoBuzzCRMDetails.emailID
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'AlternativeEmailID':
            crmObj.id = 'PersonalDetailsAlternateEmail';
            crmObj.value = author.locoBuzzCRMDetails.alternativeEmailID
              ? author.locoBuzzCRMDetails.alternativeEmailID
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'PhoneNumber':
            crmObj.id = 'PersonalDetailsNumber';
            crmObj.value = author.locoBuzzCRMDetails.phoneNumber
              ? author.locoBuzzCRMDetails.phoneNumber
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'AlternatePhoneNumber':
            crmObj.id = 'PersonalDetailsAlternateNumber';
            crmObj.value = author.locoBuzzCRMDetails.alternatePhoneNumber
              ? author.locoBuzzCRMDetails.alternatePhoneNumber
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Link':
            crmObj.id = 'PersonalDetailsLink';
            crmObj.value = author.locoBuzzCRMDetails.link
              ? author.locoBuzzCRMDetails.link
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Address1':
            crmObj.id = 'PersonalDetailsAddress1';
            crmObj.value = author.locoBuzzCRMDetails.address1
              ? author.locoBuzzCRMDetails.address1
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Address2':
            crmObj.id = 'PersonalDetailsAddress2';
            crmObj.value = author.locoBuzzCRMDetails.address2
              ? author.locoBuzzCRMDetails.address2
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'City':
            crmObj.id = 'PersonalDetailsCity';
            crmObj.value = author.locoBuzzCRMDetails.city
              ? author.locoBuzzCRMDetails.city
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'State':
            crmObj.id = 'PersonalDetailsState';
            crmObj.value = author.locoBuzzCRMDetails.state
              ? author.locoBuzzCRMDetails.state
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Country':
            crmObj.id = 'PersonalDetailsCountry';
            crmObj.value = author.locoBuzzCRMDetails.country
              ? author.locoBuzzCRMDetails.country
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'ZIPCode':
            crmObj.id = 'PersonalDetailsZipcode';
            crmObj.value = author.locoBuzzCRMDetails.zipCode
              ? author.locoBuzzCRMDetails.zipCode
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'SSN':
            crmObj.id = 'PersonalDetailsSSN';
            crmObj.value = author.locoBuzzCRMDetails.ssn
              ? author.locoBuzzCRMDetails.ssn
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
          case 'Notes':
            crmObj.id = 'PersonalDetailsNotes';
            crmObj.value = author.locoBuzzCRMDetails.notes
              ? author.locoBuzzCRMDetails.notes
              : '';
            crmObj.dbColumn = column.dbColumn;
            crmObj.dbColumnName = column.columnLable;
            break;
        }
        if (crmObj.value) {
          this.CrmDetails.push({ id: crmObj.dbColumn, value: crmObj.value });
        }
      }
    }
  }

  GetCrmLeftMenu(): void {
    const BrandIds = [];
    BrandIds.push(this.postData.brandInfo.brandID);
    const postCRMdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postData.brandInfo.brandID
    );
    const leftmenuobject = {
      BrandInfo: this.postData.brandInfo,
      AuthorSocialId: this.postData.author.socialId,
      ChannelGroup: this.postData.channelGroup,
      CrmClassName: postCRMdata.crmClassName,
    };
    this._crmService.GetCrmLeftMenu(leftmenuobject).subscribe((data) => {
      if (data) {
        const crmMenu: CRMMenu = data;
        this.crmmenu = crmMenu;
        for (const menu of this.crmmenu.data.leftSide) {
          const item = {
            requestType: +menu.value,
            tabName: menu.label,
            menuName: menu.label + '(' + menu.totalCount + ')',
            isActive: false,
          };
          this.crmLists.push(item);
        }
      }
    });
  }

  getCrmApolloMasterDetails(): void {
    this.masterDetailsLoader = true;
    this._crmService.getApolloMasterDetails().subscribe(
      (res) => {
        if (res.success) {
          this.masterDetailsLoader = false;
          this.apolloCrmMasterDetails = res.data;
          if (
            this._crmService.crmName.toLowerCase() == 'apollocrm' &&
            this._crmService.newMentionFound
          ) {
            this.buttonList = this.buttonList.filter(
              (obj) =>
                obj.requestType == this._crmService.apollorequest.RequestType
            );
          }
        }
      },
      (err) => {
        this.masterDetailsLoader = false;
      }
    );
  }

  GetTataUniCrmDetails(): void {
    this._crmService
      .GetTataUniCrmDetails(this.postData.brandInfo.brandID)
      .subscribe((res) => {
        if (res.success) {
          this.tataUniCrmMasterDetails = res.data;
        }
      });
  }

  fillApolloFields(res, type): void {
    const leadName = [];
    const cityList = [];
    const hospitalList = [];
    const doctorList = [];
    const specialityList = [];
    const subCategoryList = [];
    const attributeList = [];
    const categoryList = [];
    this.apolloCrmMasterDetails = res;
    if (res.lead_detials.value) {
      res.lead_detials.value.forEach((obj) => {
        leadName.push({
          Key: obj.msemr_healthcareservicereferralmethodid,
          Value: obj.msemr_name,
        });
      });
    }

    if (type == ApolloRequestType.Lead) {
      if (res.city_details.value) {
        res.city_details.value.forEach((obj) => {
          cityList.push({ Key: obj.apollo_cityid, Value: obj.apollo_name });
        });
      }
      if (res.location_details.value) {
        res.location_details.value.forEach((obj) => {
          hospitalList.push({
            Key: obj.msemr_locationid,
            Value: obj.msemr_name,
          });
        });
      }
    } else {
      if (res.city_detailsSR.value) {
        res.city_detailsSR.value.forEach((obj) => {
          cityList.push({ Key: obj.apollo_cityid, Value: obj.apollo_name });
        });
      }
      if (res.location_detailsSR.value) {
        res.location_detailsSR.value.forEach((obj) => {
          hospitalList.push({
            Key: obj.msemr_locationid,
            Value: obj.msemr_name,
          });
        });
      }
    }
    if (res.doctor_detials.value) {
      res.doctor_detials.value.forEach((obj) => {
        doctorList.push({ Key: obj.contactid, Value: obj.fullname });
      });
    }

    if (res.speciality_detials.value) {
      res.speciality_detials.value.forEach((obj) => {
        specialityList.push({
          Key: obj.msemr_healthcareservicespecialtyid,
          Value: obj.msemr_name,
        });
      });
    }
    if (res.attribute_details.value) {
      res.attribute_details.value.forEach((obj) => {
        attributeList.push({
          Key: obj.apl_attributemasterid,
          Value: obj.apl_name,
        });
      });
    }
    if (res.subcategory_details.value) {
      res.subcategory_details.value.forEach((obj) => {
        subCategoryList.push({
          Key: obj.msemr_healthcareservicecategoryid,
          Value: obj.msemr_name,
        });
      });
    }
    if (res.category_details.value) {
      res.category_details.value.forEach((obj) => {
        categoryList.push({
          Key: obj.msemr_healthcareservicecharacteristicid,
          Value: obj.msemr_name,
        });
      });
    }
    this._crmService.crmmenu.data.formJson.forEach((obj) => {
      if (obj.RequestType == type) {
        obj.FormFields.forEach((field) => {
          if (field.Label == 'Lead Name') {
            field.Data = leadName;
          }
          if (field.Label == 'City') {
            field.Data = cityList;
          }
          if (field.Label == 'Hospital') {
            field.Data = hospitalList;
          }
          if (field.Label == 'Speciality') {
            field.Data = specialityList;
          }
          if (field.Label == 'Doctor') {
            field.Data = doctorList;
          }
          if (field.Label == 'Attribute') {
            field.Data = attributeList;
          }
          if (field.Label == 'Sub-Category') {
            field.Data = subCategoryList;
          }
          if (field.Label == 'Category') {
            field.Data = categoryList;
          }
        });
      }
    });
  }

  updateCrmCreateButtonSignalChange(res){
    if (res) {
      const brandObj = this._filterService.fetchedBrandData.find(
        (obj) => +obj.brandID == this.postData.brandInfo.brandID
      );

      if (this.srId) {
        if (
          (this._crmService.crmName.toLowerCase() == 'bandhancrm' ||
            this._crmService.crmName.toLowerCase() == 'apollocrm' ||
            this._crmService.crmName.toLowerCase() == 'fedralcrm' ||
            this._crmService.crmName.toLowerCase() == 'tataunicrm' ||
            this._crmService.crmName.toLowerCase() == 'recrm' ||
            this._crmService.crmName.toLowerCase() == 'extramarkscrm' ||
            this._crmService.crmName.toLowerCase() == 'dreamsolcrm' ||
            this._crmService.crmName.toLowerCase() == 'octafxcrm' ||
            this._crmService.crmName.toLowerCase() == 'tatacapitalcrm' ||
            this._crmService.crmName.toLowerCase() == 'duraflexcrm') &&
          (this.postData.ticketInfo.status ==
            TicketStatus.PendingwithCSDWithNewMention ||
            this.postData.ticketInfo.status ==
            TicketStatus.OnHoldCSDWithNewMention ||
            this.postData.ticketInfo.status ==
            TicketStatus.PendingWithBrandWithNewMention ||
            this.postData.ticketInfo.status ==
            TicketStatus.RejectedByBrandWithNewMention ||
            (this.postData.ticketInfo.status ==
              TicketStatus.OnHoldBrandWithNewMention &&
              brandObj.isBrandworkFlowEnabled))
        ) {
          this.showCreateSrButton = true;
          this.createCrmRef.nativeElement.style.display = 'block';
          this._crmService.newMentionFound = true;
          if (this._crmService.crmName.toLowerCase() == 'fedralcrm') {
            if (this._crmService.fedralrequest.RequestType == 2) {
              this.showCreateSrButton = false;
              this.createCrmRef.nativeElement.style.display = 'none';
            }
            if (this._crmService.fedralrequest.RequestType == 1) {
              this.buttonList = this.buttonList.filter(
                (obj) => obj.tabName != 'Lead'
              );
            }
          } else {
            let requestType: any;
            if (this._crmService.crmName.toLowerCase() == 'apollocrm') {
              requestType = this._crmService.apollorequest.RequestType;
            } else if (this._crmService.crmName.toLowerCase() == 'recrm') {
              requestType = this._crmService.rercrmRequest.RequestType;
            } else if (
              this._crmService.crmName.toLowerCase() == 'tataunicrm'
            ) {
              requestType = this._crmService.tataUniRequest.RequestType;
            } else if (
              this._crmService.crmName.toLowerCase() == 'extramarkscrm'
            ) {
              requestType = this._crmService.extramarksRequest.RequestType;
            } else if (
              this._crmService.crmName.toLowerCase() == 'octafxcrm'
            ) {
              requestType = this._crmService.octafxCrmRequest.RequestType;
            } else if (
              this._crmService.crmName.toLowerCase() == 'bandhancrm'
            ) {
              requestType = this._crmService.bandhanrequest.RequestType;
            } else if (this._crmService.crmName.toLowerCase() == 'magmacrm') {
              requestType = this._crmService.magmarequest.RequestType;
            } else if (
              this._crmService.crmName.toLowerCase() == 'extramarkscrm'
            ) {
              requestType = this._crmService.extramarksRequest.RequestType;
            } else if (this._crmService.crmName.toLowerCase() == 'dreamsolcrm') {
              requestType = this._crmService.dreamsolRequest.RequestType;
            } else if (this._crmService.crmName.toLowerCase() == 'tatacapitalcrm') {
              requestType = this._crmService.tataCapitalRequest.RequestType;

            } else if (this._crmService.crmName.toLowerCase() == 'duraflexcrm') {
              requestType = this._crmService.duraflexRequest.RequestType;
            }
            this.buttonList = this.buttonList.filter(
              (obj) => obj.requestType == requestType
            );
          }
        } else {
          this.createCrmRef.nativeElement.style.display = 'none';
        }
      } else {
        this.showCreateSrButton = true;
        this.createCrmRef.nativeElement.style.display = 'block';
        this._crmService.newMentionFound = false;
      }
      setTimeout(() => {
        if (this.postData?.ticketInfo?.status != 0 && this.postData?.ticketInfo?.status != 4 && this.postData?.ticketInfo?.status != 12 && this.postData?.ticketInfo?.status != 5) {
          this.createCrmRef.nativeElement.style.display = 'none';
        }
      }, 10);
    }
  }
}
