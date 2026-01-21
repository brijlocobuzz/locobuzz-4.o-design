import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { BrandDetails } from 'app/core/models/accounts/brandsList';
import { CrmService } from 'app/social-inbox/services/crm.service';
import { LookupDetailscrmComponent } from '../lookup-detailscrm/lookup-detailscrm.component';
import { debounce, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Brand } from 'app/shared/components/filter/filter-models/brand-reply.model';
import { BrandInfo } from 'app/core/models/viewmodel/BrandInfo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { notificationType } from 'app/core/enums/notificationType';
import { CustomSnackbarComponent } from 'app/shared/components';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-loopupcrm',
    templateUrl: './loopupcrm.component.html',
    styleUrls: ['./loopupcrm.component.scss'],
    standalone: false
})
export class LoopupcrmComponent implements OnInit, OnDestroy {
  public form: UntypedFormGroup;
  ticketNoRecordFound = this.translate.instant('Record-not-found-try-on-another-field')
  @Output() closeDialog = new EventEmitter();
  @Input() brandDetails?: BrandList;
  @Input() srid?: any;
  @Input() postData?: BaseMention;
  @Input() postType;
  showImages;
  nextButtonDisable: Boolean = true;
  foundImage = `assets/images/Found.svg`
  notFoundImage = `assets/images/Not-Found.svg`
  lookupdata = ''
  setTimeout;
  getSnapDealTicketApi;
  getSnapDealOrderApi;
  constructor(private crmServices: CrmService, private _snackBar: MatSnackBar, private _cdr: ChangeDetectorRef, private _fb: UntypedFormBuilder, private _dialog: MatDialog, private translate: TranslateService) {

  }

  ngOnInit(): void {
    this.setForm();
    if (this.srid !=null && this.srid!=''){
      this.form.controls['ticketId'].setValue(this.srid)
      this.setTimeout = setTimeout(() => {
        this.getLoopupData(this.srid, 'ticketId', 'caseId')
        this.getDataRelatedToLookUp()
      }, 100);
    }
  }

  private setForm() {
    this.form = this._fb.group({
      email: ['', Validators.email],
      contactNumber: ['', Validators.pattern("([0-9]|[ ]|[-]|[+])*")],
      orderId: [''],
      subOrderId: [''],
      ticketId: ['']
    })
  }
  get f() {
    return this.form.controls;
  }
  loading: boolean = false;
  enableDiableFromField(data, type, subtype) {
    let keys = Object.keys(this.form.controls);
    if (data != '') {
      keys.forEach((r) => {
        if (r == type) {
          this.lookupdata = subtype + 'Looks'; // make this Looks->Look if user want to dispaly lookupImages
          // this.showImages = this.lookupImage;
          this.nextButtonDisable = false;
          this.form.controls[r].enable();
          this.getLoopupData(data, r, subtype)
        } else {
          this.form.controls[r].disable();
        }
      })
    } else {
      this.nextButtonDisable = true;
      this.showImages = '';
      this.form.enable()
    }
  }
  // this.
  crmDetailsPayload: any;
  getLoopupData(data, type, subType) {
    let obj = {}
    let brandInfo = {
      "Brandid": this.brandDetails?.brandID,
      "CategoryId": this.brandDetails?.categoryID,
      "brandguid": this?.brandDetails?.brandGUID,
    }
    if (type == 'ticketId') {
      obj = {
        "brandInfo": brandInfo,
        "ticketId": data,
        "type": subType,
      }
      this.crmDetailsPayload = obj
    } else {
      obj = {
        "brandInfo": brandInfo,
        "orderId": data,
        "type": subType,
      }
      this.crmDetailsPayload = obj
    }
  }
  getDataRelatedToLookUp() {
    if (this.form.invalid) {
      return;
    }
    this.loading = true
    let crmDetails;
    if (this.crmDetailsPayload?.type == 'caseId') {
      this.getSnapDealTicketApi = this.crmServices.getSnapDealTicket(this.crmDetailsPayload).pipe(debounceTime(2000), distinctUntilChanged()).subscribe((res) => {
        // console.log(res);
        if (res.success) {
          crmDetails = res.data
          this.callDialog(crmDetails, 'ticketType', this.postData)
        } else {
          this.errorMessage(this.ticketNoRecordFound)
          this.closedDialog()
        }
        // this.getDataRelatedToLookUp(res.data)
      }, error => this.loading = false)
    } else {
      this.getSnapDealOrderApi = this.crmServices.getSnapDealOrder(this.crmDetailsPayload).pipe(debounceTime(2000), distinctUntilChanged()).subscribe((res) => {
        // console.log(res);
        if (res.success) {
          crmDetails = res.data
          this.lookupdata = this.crmDetailsPayload?.type + 'Found';
          this.showImages = this.foundImage;
          this.callDialog(crmDetails, 'orderType', this.postData)
        } else {
          this.lookupdata = this.crmDetailsPayload?.type + 'LookNotFound';
          this.showImages = this.notFoundImage;
          this.errorMessage(this.translate.instant('Record-not-found-correct-details'))
        }
        // this.getDataRelatedToLookUp(res.data)
      }, error => this.loading = false)
    }

  }
  callDialog(crmDetails, type, postData) {
    let sendData;
    let OrderIdList=[]
    let SubOrderIdList=[]
    if (type == 'ticketType') {
      if (crmDetails.records.length > 0) {
        sendData = crmDetails;
        this.showImages = this.foundImage;
        this.lookupdata = this.crmDetailsPayload?.type + 'Found';
      } else {
        this.showImages = this.notFoundImage;
        this.lookupdata = this.crmDetailsPayload?.type + 'LookNotFound';
        this.errorMessage(this.translate.instant('Record-not-found-ticket-id'))
        return;
      }
    } else {
      sendData = crmDetails;
      OrderIdList = this.getFilterOrderId(crmDetails)
      SubOrderIdList = this.getFilterSubOrderId(crmDetails)
    }
    this.loading = false
    this.closedDialog();
    this._cdr.detectChanges()

    if (this.srid != null && this.srid != '') {
      this.form.value.ticketId = this.srid
    } 
    let fromData = {
      email: this.form.value?.email ? this.form.value?.email : '',
      contactNumber: this.form.value?.contactNumber ? this.form.value?.contactNumber : '',
      orderId: this.form.value?.orderId ? [this.form.value?.orderId] : '',
      subOrderId: this.form.value?.subOrderId ? [this.form.value?.subOrderId] : '',
      ticketId: this.form.value?.ticketId ? this.form.value?.ticketId : '',
    }
    if (OrderIdList?.length>0){
      fromData.orderId = OrderIdList;
    }
    if (SubOrderIdList?.length>0){
      fromData.subOrderId = SubOrderIdList;
    }
    this._dialog.open(LookupDetailscrmComponent, {
      width: '98vw',
      panelClass: 'lookup-info',
      data: {
      'crmDetails': sendData, 
      'formData': fromData, 
      'type': type, 
      'postData': postData, 
      'brandDetails': this.brandDetails,
      "postType": this.postType 
    },
    disableClose: true,
    autoFocus: false
    });
  }
  closedDialog() {
    this.closeDialog.emit(true);
  }

  errorMessage(message) {
    this.loading = false
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Warn,
        message: message,
      },
    });
    this._cdr.detectChanges()
  }
  getFilterOrderId(crmData){
    return this.removewithfilter(crmData.map(({ orderCode }) => orderCode));
  }
  getFilterSubOrderId(crmData){
    return this.removewithfilter(crmData.map(({ suborderCode }) => suborderCode));
  }
  removewithfilter(arr) {
  let outputArray = arr.filter(function (v, i, self) {
    return i == self.indexOf(v);
  });
  return outputArray;
}
ngOnDestroy(): void {
  this._cdr.detach();
  if (this.setTimeout) {
    clearTimeout(this.setTimeout)
    this.setTimeout = null;
  }
  if (this.getSnapDealTicketApi){
    this.getSnapDealTicketApi.unsubscribe();
    this.getSnapDealTicketApi = null;
  }
  if (this.getSnapDealOrderApi) {
    this.getSnapDealOrderApi.unsubscribe();
    this.getSnapDealOrderApi = null;
  }
}
}
