import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { notificationType } from 'app/core/enums/notificationType';
import { FormField } from 'app/core/models/crm/CRMMenu';
import { CustomSnackbarComponent } from 'app/shared/components';
import { CrmService } from 'app/social-inbox/services/crm.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { take } from 'rxjs/operators';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { NavigationService } from 'app/core/services/navigation.service';
import { TranslateService } from '@ngx-translate/core';
@Component({
    selector: 'app-sr-new-crmform',
    templateUrl: './sr-new-crmform.component.html',
    styleUrls: ['./sr-new-crmform.component.scss'],
    standalone: false
})
export class SrNewCrmformComponent implements OnInit {
  fields: FormField[];
  crmDetailsData: any;
  checkoutForm = this._formBuilder.group({});
  snapdealrequest: any;
  actionProcessing: Boolean = false;
  constructor(private _formBuilder: UntypedFormBuilder, public dialog: MatDialog, private ticketService: TicketsService, @Inject(MAT_DIALOG_DATA) crmDetailsData: any, private _snackBar: MatSnackBar, private navigationService: NavigationService, private _crmServices: CrmService,
    private dialogRef: MatDialogRef<SrNewCrmformComponent>, private translate: TranslateService
  ) {
    this.crmDetailsData = crmDetailsData;
  }

  ngOnInit(): void {
    let selectedrequest = this.crmDetailsData.formField;
    if (selectedrequest) {
      this.fields = selectedrequest;
      this.snapdealrequest = this.crmDetailsData.snapdealrequest
      for (const field of this.fields) {
        const objname = field.Field.toString().toLowerCase();
        const checkdependant = this.fields.find(
          (x) => x.DependentField === field.Field
        );
        this.checkoutForm.addControl(objname, new UntypedFormControl());
        this.checkoutForm.controls[objname].setValue(
          this.snapdealrequest[field.Field],
          Validators.required
        );
        if (field.Field == 'OrderId' || field.Field == 'SubOrderId' || field.Field == 'Subject' || field.Field == 'ForumId') {
          field.Disable = true;
        }
      }
    }
  }
  onSubmit(): any {
    if (this.checkoutForm.invalid) {
      this.errorMessage(this.translate.instant('Please-fill-the-required-fields'), notificationType.Warn)
    }
    if (
      (this.checkoutForm.value.description == null ||
        this.checkoutForm.value.description == '')
    ) {
      let msg = this.translate.instant('Please-enter-ticket-description');
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: msg,
        },
      });
      return false;
    }
    if (this.checkoutForm.valid) {
      let objData = {
        "ticketData": {
          "channel": this.crmDetailsData?.postData?.channelGroup?.toString(),
          "description": this.checkoutForm.value.description,
          "escalationReason": this.checkoutForm.value.escalationreason,
          "forum": this.checkoutForm.value.forumpicklist,
          "forumId": this.checkoutForm.value.forumid,
          "forumPicklist": this.checkoutForm.value.forumpicklist,
          "issueReportedDate": this.crmDetailsData?.crmDetails?.Issue_Reported_Date__c ? this.crmDetailsData?.crmDetails?.Issue_Reported_Date__c :this.crmDetailsData?.crmDetails?.CreatedDate,
          "orderId": this.checkoutForm.value.orderid,
          "subject": this.checkoutForm.value.subject,
          "suborderId": this.checkoutForm.value.suborderid,
        },
        "snapDealCRM": {
          "LocobuzzTicketID": this.crmDetailsData?.postData?.ticketID?.toString(),
          "UCIC": this.crmDetailsData?.postData?.author?.socialId,
          "UserName": this.crmDetailsData?.postData?.author?.name,
          "Channel": this.crmDetailsData?.postData?.channelGroup?.toString()
        },
        "brandinfo": {
          "brandguid": this.crmDetailsData?.brandDetails?.brandGUID,
          "BrandID": Number(this.crmDetailsData.brandDetails.brandID),
          "brandName": this.crmDetailsData.brandDetails?.brandName,
        },
        "tagid": this.crmDetailsData?.postData?.tagID,
        
      }
      this.actionProcessing = true
      this._crmServices.CreateSnapDealTicket(objData).subscribe(
        (res) => {
          console.log(res)
          this.actionProcessing = false;
          if (
            (res && res.success && res.data && res.data.srID) ||
            (res && res.success)
          ) {
            if (!this.crmDetailsData?.postData.ticketInfo.srid && res.data) {
              /* this.ticketService.updateCRMDetails.next({
                TagID: this.crmDetailsData?.postData?.tagID,
                SrID: res.data,
                guid: this.navigationService.currentSelectedTab.guid,
                postType: this.crmDetailsData.postsType
              }); */
              this.ticketService.updateCRMDetailsSignal.set({
                TagID: this.crmDetailsData?.postData?.tagID,
                SrID: res.data,
                guid: this.navigationService.currentSelectedTab.guid,
                postType: this.crmDetailsData.postsType
              });
            } else{
              let data = {
                TicketId: this.checkoutForm.value.forumid,
                SrID: res.data,
                guid: this.navigationService.currentSelectedTab.guid,
                postType: this.crmDetailsData.postsType
              }
              this.ticketService.refreshSRID.next(data)
            }
            this.dialog.closeAll();
            this.errorMessage(this.translate.instant('SR-Details-Submitted-Successfully'), notificationType.Success)
          } else {
            this.errorMessage(this.translate.instant('SR-Details-Not-Saved-Properly'), notificationType.Warn)
          }
        }, (error) => {
          this.actionProcessing = false
          this.errorMessage(this.translate.instant('Something-went-wrong'), notificationType.Warn)
        })
    }
  }

  closedDialog() {
    this.dialogRef.close()
  }
  errorMessage(message,type) {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type:type,
        message: message,
      },
    });
    return false;
  }

}
