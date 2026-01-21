import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import moment from 'moment';
import { SrNewCrmformComponent } from '../sr-new-crmform/sr-new-crmform.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from 'app/shared/components';
import { notificationType } from 'app/core/enums/notificationType';
import { CrmService } from 'app/social-inbox/services/crm.service';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-lookup-detailscrm',
    templateUrl: './lookup-detailscrm.component.html',
    styleUrls: ['./lookup-detailscrm.component.scss'],
    standalone: false
})
export class LookupDetailscrmComponent implements OnInit {
  formData: any;
  formDataFields: any;
  public updateForm: UntypedFormGroup;
  crmDetails: any;
  orderType: any;
  brandDetails: BrandList;
  sfTicketDetails: any;
  actionProcessing: Boolean = false;
  Statuses = []
  ForumPicklist = []
  EscalationReason = []
  postData?: BaseMention;
  formDataShow = [];
  fetchSfTicketShow = [];
  fetchOrderDetailShow;
  selectedOrderID:any;
  selectedSubOrderID:any;
  crmDetailsTicker:any
  postType:any;
  constructor(@Inject(MAT_DIALOG_DATA) crmDetailsData: any, private _footericonService:FootericonsService,private dialogRef: MatDialogRef<LookupDetailscrmComponent>, private crmServices:CrmService, public dialog: MatDialog, private ticketService: TicketsService, private navigationService: NavigationService, private fb: UntypedFormBuilder, private _crmServices: CrmService, private _cdr: ChangeDetectorRef, private _snackBar: MatSnackBar, private _dialog: MatDialog, private translate: TranslateService) {
    // console.log(crmDetailsData);
    this.formData = crmDetailsData.formData
    this.crmDetails = crmDetailsData.crmDetails;
    if (crmDetailsData.type == 'ticketType' ){
      this.crmDetails = crmDetailsData.crmDetails;
      this.crmDetailsTicker = crmDetailsData.crmDetails
    }
    this.orderType = crmDetailsData.type;
    this.postData = crmDetailsData.postData;
    this.brandDetails = crmDetailsData.brandDetails;
    this.postType = crmDetailsData.postType;
  }

  ngOnInit(): void {
    this.setForm();
    this.formDataShow = this.fetchFormData();
    if (this.orderType == 'ticketType' && this.crmDetailsTicker.records.length > 0) {
      this.dropdownTicketDetils(this.crmDetailsTicker.records[0]);
    }
    if (this.orderType == 'orderType' && this.crmDetails?.length > 0) {
      this.changeCrmDetilsOnOrderID(this.formData.orderId[0],'order')
    }
    this._crmServices.getSnapDealJson().pipe(take(1)).subscribe(res => {
      this.formDataFields = res.snapdealData[0].FormFields.Create
      this.Statuses = res.snapdealData[0].FormFields.Update.find((res) => res.Label == 'Status')?.Data
      this.ForumPicklist = res.snapdealData[0].FormFields.Update.find((res) => res.Label == 'Forum Picklist')?.Data
      this.EscalationReason = res.snapdealData[0].FormFields.Update.find((res) => res.Label == 'Escalation Reason')?.Data
      this._cdr.detectChanges()
    })

    this.updateForm.controls['notes'].valueChanges.subscribe((res) => {
      this.disableUpdatebutton = false
    })
  }

  private setForm() {
    this.updateForm = this.fb.group({
      ticketId: [''],
      status: [''],
      forumPickupList: [''],
      escalationReason: [''],
      notes:['']
    })
  }
  convertEpochDate(date) {
    if (date) return moment.unix(date / 1000).format("DD MMM YYYY hh:mm A")
    else return '';
  }
  convertDate(date) {
    if (date)
      return moment(date).format("DD MMM YYYY hh:mm A")
    else return '';
  }
  selectedTicketId:any;
  dropdownTicketDetils(item) {
    this.selectedTicketId = item?.CaseNumber
    this.sfTicketDetails = {
      Status: item.Status,
      Forum_Picklist__c: item.Forum_Picklist__c ? item.Forum_Picklist__c : ChannelGroup[this.postData?.channelGroup],
      CEO_Social_Escalation_Reason__c: item.CEO_Social_Escalation_Reason__c,
      Forum__c: item.Forum__c,
      orderCode__c: item.orderCode__c,
      suborderCode__c: item.suborderCode__c,
      Forum_ID_URL__c: item.Forum_ID_URL__c,
      VOC__c: item.VOC__c,
      Level_1__c: item.Level_1__c,
      Level_2__c: item.Level_2__c,
      Origin: item.Origin,
      Owner: item.Owner,
      Level_1_Escalation_Reason__c: item.Level_1_Escalation_Reason__c,
      Level_2_Escalation_Reason__c: item.Level_2_Escalation_Reason__c,
      Level_3_Escalation_Reason__c: item.Level_3_Escalation_Reason__c,
      CreatedDate: item.CreatedDate,
      Issue_Reported_Date__c: item.Issue_Reported_Date__c,
      ClosedDate: item.ClosedDate,
      Description: item.Description,
      Notes: item.Feeds?.records,
    }
    this.foundTicketOnorderId = true;

    this.updateForm.controls['ticketId'].setValue(item?.CaseNumber)
    this.updateForm.controls['status'].setValue(this.sfTicketDetails?.Status)
    this.updateForm.controls['forumPickupList'].setValue(this.sfTicketDetails?.Forum_Picklist__c)
    this.updateForm.controls['escalationReason'].setValue(this.sfTicketDetails?.CEO_Social_Escalation_Reason__c)
    this.fetchSfTicketShow = this.fetchSfTicket();
    this._cdr.detectChanges()
  }

  openCreateForm() {
    let sendData;
    let snapdealrequest;
    if (this.orderType == 'ticketType') {
      sendData = this.sfTicketDetails
      snapdealrequest = {
        //ticket
        OrderId: sendData.orderCode__c,
        SubOrderId: sendData.suborderCode__c,
        Subject: sendData.CEO_Social_Escalation_Reason__c,
        ForumPicklist: sendData.Forum_Picklist__c ? sendData.Forum_Picklist__c: ChannelGroup[this.postData?.channelGroup],
        ForumId: this.postData?.ticketID,
        EscalationReason: '',
        Status: sendData.Status,
        comments: sendData.Description,
        Forum: sendData.Forum__c,
        Description: this.postData?.description
      }
    } else {
      sendData = this.fetchOrderDetailShow;
      snapdealrequest = {
        OrderId: sendData.OrderIds[0]?.Value, //order id
        SubOrderId: sendData.OrderIds[1]?.Value, //sub order id
        Subject: sendData.OrderDetails[0]?.Value, //product name
        ForumPicklist: ChannelGroup[this.postData?.channelGroup],
        ForumId: this.postData?.ticketID,
        EscalationReason: '',
        Status: sendData.OrderDetails[3]?.Value, //status
        comments: this.postData?.description,
        Forum: '',
        Description: this.postData?.description
      }
    }
    this._dialog.open(SrNewCrmformComponent, {
      width: '70vw',
      panelClass: 'crm-wrapper',
      data: {
        'crmDetails': sendData,
        'formField': this.formDataFields,
        'snapdealrequest': snapdealrequest,
        'postData': this.postData,
        'brandDetails': this.brandDetails,
        'postsType': this.postType
      },
      disableClose: true,
      autoFocus: false,
    });
  }
  updateFormFields() {
    let objData = {
      "ticketData": {
        "channel": this?.postData?.channelGroup?.toString(),
        "description": this.sfTicketDetails.Description,
        "forum": this.sfTicketDetails.Forum__c ? this.sfTicketDetails.Forum__c: ChannelGroup[this.postData?.channelGroup],
        "forumId": this.sfTicketDetails.Forum_ID_URL__c ? this.sfTicketDetails.Forum_ID_URL__c :this.postData?.ticketID,
        "issueReportedDate": this.sfTicketDetails?.Issue_Reported_Date__c ? this.sfTicketDetails?.Issue_Reported_Date__c : this.sfTicketDetails?.CreatedDate,
        "orderId": this.sfTicketDetails.orderCode__c,
        "subject": this.sfTicketDetails.CEO_Social_Escalation_Reason__c,
        "suborderId": this.sfTicketDetails.suborderCode__c,
        "escalationReason": this.updateForm.value.escalationReason,
        "forumPicklist": this.updateForm.value.forumPickupList,
        "ticketId": this.updateForm.value.ticketId,
        "ticketStatus": this.updateForm.value.status,
        "post":this.updateForm.value.notes
      },
      "snapDealCRM": {
        "LocobuzzTicketID": this?.postData?.ticketID?.toString(),
        "UCIC": this?.postData?.author?.socialId,
        "UserName": this?.postData?.author?.name,
        "Channel": this?.postData?.channelGroup?.toString()
      },
      "brandinfo": {
        "brandguid": this?.brandDetails?.brandGUID,
        "BrandID": Number(this.brandDetails.brandID),
        "brandName": this.brandDetails?.brandName,
      },
      "tagid": this?.postData?.tagID,
      
    }
    this.actionProcessing = true;
    this._crmServices.UpdateSnapDealTicket(objData).subscribe(
      (res) => {
        this.actionProcessing = false;
        if (
          (res && res.success && res.data)
        ) {
          res.data = JSON.parse(res.data);
          if (res.data.successful){
            let updatedData = {
              Status: this.updateForm.value.status,
              EscalationReason: this.updateForm.value.escalationReason,
              ForumPicklist: this.updateForm.value.forumPickupList
            }
            this.disableUpdatebutton=true
            this.afterUpdateFieldsUpdating(this.updateForm.value.ticketId, updatedData)
            // this.callTicketDetails(this.updateForm.value.ticketId, 'caseId')
            this.errorMessage(this.translate.instant('SR-Details-Updated-Successfully'), notificationType.Success)
          } else{
            this.errorMessage(res.data.message, notificationType.Warn)
          }
        } else {
          this.errorMessage(this.translate.instant('SR-Details-Not-Saved-Properly'), notificationType.Warn)
        }
      }, (error) => {
        this.actionProcessing = false
        this.errorMessage(this.translate.instant('Something went wrong'), notificationType.Warn)
      })

  }
  private errorMessage(message,type) {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: type,
        message: message,
      },
    });
    return false;
  }
  private fetchFormData() {
    return [
      { 'Lable': 'Email ID', 'Value': this.formData?.email },
      { 'Lable': 'Contact Number', 'Value': this.formData?.contactNumber },
      { 'Lable': 'Order ID', 'Value': this.formData?.orderId },
      { 'Lable': 'Sub Order ID', 'Value': this.formData?.subOrderId },
      { 'Lable': 'Ticket ID', 'Value': this.formData?.ticketId },
    ]
  }
  private fetchSfTicket() {
    return [
      { 'Lable': 'Forums', 'Value': this.sfTicketDetails?.Forum__c },
      { 'Lable': 'Forum URL', 'Value': this.sfTicketDetails?.Forum_ID_URL__c },
      { 'Lable': 'Voice of Customers', 'Value': this.sfTicketDetails?.VOC__c },
      { 'Lable': 'VOC Level 1', 'Value': this.sfTicketDetails?.Level_1__c },
      { 'Lable': 'VOC Level 2', 'Value': this.sfTicketDetails?.Level_2__c },
      { 'Lable': 'Origin', 'Value': this.sfTicketDetails?.Origin },
      { 'Lable': 'Case Owner', 'Value': this.sfTicketDetails?.Owner?.Name },
      { 'Lable': 'Reason 1', 'Value': this.sfTicketDetails?.Level_1_Escalation_Reason__c },
      { 'Lable': 'Reason 2', 'Value': this.sfTicketDetails?.Level_2_Escalation_Reason__c },
      { 'Lable': 'Reason 3', 'Value': this.sfTicketDetails?.Level_3_Escalation_Reason__c },
      { 'Lable': 'Open Date', 'Value': this.convertDate(this.sfTicketDetails?.CreatedDate) },
      { 'Lable': 'Issue Date', 'Value': this.convertDate(this.sfTicketDetails?.Issue_Reported_Date__c) },
      { 'Lable': 'Closed Date', 'Value': this.convertDate(this.sfTicketDetails?.ClosedDate) },
      { 'Lable': 'Description', 'Value': this.sfTicketDetails?.Description },
    ]
  }
  private fetchOrderDetail(element) {
    return {
      "OrderIds": [
        { 'Lable': 'Order ID', 'Value': element?.orderCode },
        { 'Lable': 'Sub Order ID', 'Value': element?.suborderCode },
      ],
      "OrderDetails": [
        { 'Lable': 'Product Name', 'Value': element?.productName },
        { 'Lable': 'Product Category', 'Value': element?.catName },
        { 'Lable': 'Order Status', 'Value': element?.status },
        { 'Lable': 'Courier Name', 'Value': element?.courierName },
        { 'Lable': 'Tracking URL', 'Value': element?.trackingUrl },
        { 'Lable': 'Purchase Date', 'Value': this.convertEpochDate(element?.purchaseDate) },
        { 'Lable': 'Delivery Date', 'Value': this.convertEpochDate(element?.deliverDate) },
        { 'Lable': 'Dispatch Date', 'Value': this.convertEpochDate(element?.dispatchDate) },
        { 'Lable': 'Expected Deliver Date', 'Value': this.convertEpochDate(element?.expectedDeliverDate) },
      ],
      "RefundDetails": element?.refundDetail,
      "RpuDetail": element?.rpuDetail
    }
  }
  changeCrmDetilsOnOrderID(id,type){
    if(type=='order'){
      let order = this.crmDetails.find((r) => r.orderCode == id)
      this.fetchOrderDetailShow = this.fetchOrderDetail(order)
      this.selectedOrderID = id
      this.selectedSubOrderID = this.fetchOrderDetailShow.OrderIds[1]?.Value;
      this.callTicketDetails(this.selectedSubOrderID, 'suborderCode')
      this.filterSubOrderId(id)
    }
    if (type =='suborder'){
      let subOrder = this.crmDetails.find((r) => r.suborderCode == id)
      this.fetchOrderDetailShow = this.fetchOrderDetail(subOrder)
      this.selectedOrderID = this.fetchOrderDetailShow.OrderIds[0]?.Value
      this.selectedSubOrderID = id
      this.callTicketDetails(this.selectedSubOrderID, 'suborderCode')
    }
    this._cdr.detectChanges()
  }
  filterSubOrderId(id){
    let order = this.crmDetails.filter((r) => r.orderCode == id)
    this.formData.subOrderId = order.map(({ suborderCode }) => suborderCode)
  }
  foundTicketOnorderId=false;
  ticketLoaderFound=false;
  callTicketDetails(id,type){
    let brandInfo = {
      "Brandid": this.brandDetails.brandID,
      "CategoryId": this.brandDetails.categoryID
    }
    let obj = {
      "brandInfo": brandInfo,
      "ticketId": id,
      "type": type,
    }
    this.ticketLoaderFound = true;
    this.foundTicketOnorderId = false;
    this.crmServices.getSnapDealTicket(obj).pipe(distinctUntilChanged()).subscribe((res) => {
      if (res.success) {
        if (res.data.records.length >0){
          this.ticketLoaderFound = false;
          if(type=='caseId'){
            this.sfTicketDetails.ClosedDate = res.data.records[0]?.ClosedDate
            this.fetchSfTicketShow = this.fetchSfTicket();
            this._cdr.detectChanges()
          }else{
            this.crmDetailsTicker = res.data;
            this.dropdownTicketDetils(this.crmDetailsTicker.records[0])
          }
        } else{
          this.ticketLoaderFound = false;
          this.foundTicketOnorderId = false;
        }
      } else {
        this.foundTicketOnorderId = false;
      }
    })
  }
  afterUpdateFieldsUpdating(id,details){
    let data = this.crmDetailsTicker.records.find(r => r.CaseNumber ==id);
    data.Status = details.Status;
    data.CEO_Social_Escalation_Reason__c = details.EscalationReason;
    data.Forum_Picklist__c = details.ForumPicklist;
  }
  disableUpdatebutton:Boolean=true;
  updateDisbleButton(event){
    this.disableUpdatebutton = false
  }
}

