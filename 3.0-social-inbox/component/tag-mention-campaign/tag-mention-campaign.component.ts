import { ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { TranslateService } from '@ngx-translate/core';
import { CampaignService } from 'app/campaign/services/campaign.service';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { CommonService } from 'app/core/services/common.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { SubSink } from 'subsink';

export interface campaignList {
  campaignName?: string;
  campaignID?: number;
  startDate?: any,
  endDate?: any;
  timeZoneOffset?: any;
  keyWords?: string
  checked?: boolean;
  createdDate?: any;
  stopDate?: any;
  isDeleted?: any;
}

@Component({
    selector: 'app-tag-mention-campaign',
    templateUrl: './tag-mention-campaign.component.html',
    styleUrls: ['./tag-mention-campaign.component.scss'],
    standalone: false
})
export class TagMentionCampaignComponent implements OnInit {

  campaignForm: UntypedFormControl
  campaignList: campaignList[] = []
  campaignListCopy: campaignList[] = []
  alreadyAddedCampaignIds: number[] = []
  dataSource: MatTableDataSource<campaignList>;
  spinner = true;
  loaderTypeEnum = loaderTypeEnum
  searchText = ''
  disableCheckAll = false;
  campaignSelectedList = []
  sortOrderValue = 'ascending';
  sortByValue = 'createdDate';
  selectAll = false;
  saveButtonSpinner: boolean = false;
  saveButtonDisable: boolean = true;
  currentUser:AuthUser;
  defaultLayout: boolean = false;
  subs = new SubSink();
  constructor(public dialogRef: MatDialogRef<TagMentionCampaignComponent>,
    @Inject(MAT_DIALOG_DATA) public baseMention: BaseMention,
    private tralsate: TranslateService,
    private _ticketService: TicketsService,
    private _snackBar: MatSnackBar,
    private commonService: CommonService,
    private _cdr:ChangeDetectorRef,
    private campaignService: CampaignService) { }

  ngOnInit(): void {
    this.getCampaignList();
    this.sortOrderValue = this.campaignService.sortOrderValue;
    this.sortByValue = this.campaignService.sortByValue;
    this.currentUser=JSON.parse(localStorage.getItem('user'));
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }

  displayedColumns: string[] = [
    'checkAll',
    'CampaignName',
    'Keywords/Topic',
    'Duration',
  ];

  getCampaignList(): void {
    this.spinner = true;
    let obj: any = {
      "BrandID": this.baseMention.brandInfo.brandID,
      "SearchText": this.searchText,
      "Offset": 0,
      "NoOfRows": 0,
      "SortOrder": "CampaignID desc",
      "TagID": this.baseMention.tagID,
      StrTagID: ''
    }

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      if (this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
        delete obj.TagID;
        obj.StrTagID = this.baseMention.tagID
      }
    } else {
      delete obj.StrTagID;
    }

    this.campaignService.GetCampaignListByBrandIDTickets(obj).subscribe((res) => {
      if (res.success && res.data && res.data.campaigns) {
        res.data.campaigns.forEach(obj => {
          const index = res.data.alreadyAddedCampaigns.findIndex(x => x == obj.campaignID)
          let isChecked = false;
          if (index > -1) {
            isChecked = true
            this.alreadyAddedCampaignIds.push(obj.campaignID);
            this.campaignSelectedList.push({ CampaignID: obj.campaignID, IsDeleted: false });
          }
          const campaignObj = {
            campaignName: obj.campaignName,
            keyWords: obj.keyWords,
            campaignID: obj.campaignID,
            checked: isChecked,
            startDate: obj.startDate,
            endDate: obj.endDate,
            timeZoneOffset: obj.timeZoneOffset,
            createdDate: obj.createdDate,
            stopDate: obj.stopDate,
          }
          this.campaignList.push(campaignObj);
          // if (this.alreadyAddedCampaignIds.length == this.campaignList.length) {
          //   this.disableCheckAll = true;
          //   // this._snackBar.openFromComponent(CustomSnackbarComponent, {
          //   //   duration: 5000,
          //   //   data: {
          //   //     type: notificationType.Warn,
          //   //     message: 'All campaigns are already selected.',
          //   //   },
          //   // });
          // }
        });
      }
      this.campaignListCopy = this.campaignList
      this.dataSource = new MatTableDataSource<campaignList>(this.campaignList);
      if (this.campaignList.some(list => !list.checked)) {
        this.selectAll = false;
      } else {
        this.selectAll = true;
      }
      this.sortTemplateList(this.sortByValue, this.sortOrderValue)
      this.spinner = false;
    })
  }
  // applyFilter(event: Event) {
  //   this.searchText = (event.target as HTMLInputElement).value;
  //   this.spinner=true;
  //   this.getCampaignList();
  // }

  save() {

    if (this.campaignList.length == 0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.tralsate.instant('Please-select-campaign-before-saving'),
        },
      });
      return
    }
    if (this.alreadyAddedCampaignIds.length == 0 && this.campaignSelectedList.length == 0) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.tralsate.instant('Please-select-atleast-one-campaign'),
        },
      });
      return false;
    }
    this.saveButtonSpinner = true;
    let campaignValue = []
    campaignValue = this.campaignSelectedList;
    this.alreadyAddedCampaignIds.forEach(x => {
      if (this.campaignSelectedList.findIndex(id => id.CampaignID == x) < 0) {
        const obj = {
          CampaignID: x,
          IsDeleted: true
        }
        campaignValue.push(obj);
      }
    })
    const obj:any = {
      "BrandInfo": { "BrandID": this.baseMention.brandInfo.brandID, "BrandName": this.baseMention.brandInfo.brandName },
      "ChannelType": this.baseMention.channelType,
      "SocialID": this.baseMention.socialID,
      "TagID": this.baseMention.tagID,
      "CampaignList": campaignValue,
       StrTagID:''
       
    }

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      if (this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
        delete obj.TagID;
        obj.StrTagID = this.baseMention.tagID
        obj.ChannelGroup = this.baseMention?.channelGroup
        obj.postType = this.baseMention?.postType;
        obj.instagramPostType = this.baseMention?.instagramPostType;
      }
    } else {
      delete obj.StrTagID;
    }

    this._ticketService.addPostToCampaign(obj).subscribe((res) => {
      if (res.success) {
        this.saveButtonSpinner = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.tralsate.instant('Operation-completed-successfully'),
          },
        });
        this.campaignService.sortByValue = this.sortByValue;
        this.campaignService.sortOrderValue = this.sortOrderValue;
        this.dialogRef.close();
      } else {
        this.saveButtonSpinner = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.tralsate.instant('Unable-save-campaign'),
          },
        });
      }
    })
  }

  removeHoursToDate(objDate, intHours) {
    var numberOfMlSeconds = new Date(objDate).getTime();
    var addMlSeconds = (intHours) * 60 * 1000;
    var newDateObj = new Date(numberOfMlSeconds + addMlSeconds);
    return newDateObj;
  }
  handleCheckAll(event) {
    if (event.checked) {
      // this.campaignSelectedList = this.campaignList.map(x => x.campaignID);
      this.campaignList.forEach(x => {
        const obj = {
          CampaignID: x.campaignID,
          IsDeleted: false
        }
        this.campaignSelectedList.push(obj)
      })
      this.campaignList.forEach(x =>
        x.checked = true
      )
      this.selectAll = true;
    } else {
      this.campaignSelectedList = [];
      this.campaignList.forEach(x =>
        x.checked = false
      )
      this.selectAll = false;
    }
    this.saveButtonDisable = false;
  }
  handleCheck(event, element) {
    const index = this.campaignList.findIndex(x => x.campaignID == element.campaignID);
    if (index > -1) {
      this.campaignList[index].checked = event.checked;
      if (event.checked) {
        const obj = {
          CampaignID: element.campaignID,
          IsDeleted: false
        }
        this.campaignSelectedList.push(obj);
      } else {
        this.campaignSelectedList = this.campaignSelectedList.filter(x => x.CampaignID !== element.campaignID);
      }
    }
    if (this.campaignList.some(list => !list.checked)) {
      this.selectAll = false;
    } else {
      this.selectAll = true;
    }
    this.saveButtonDisable = false;
  }

  searchCampaign(event) {
    const value = (event.target as HTMLInputElement).value
    this.campaignList = this.campaignListCopy;
    let filter = value.toLowerCase();
    let array: any = [];
    if (value.length > 0) {
      for (let i = 0; i < this.campaignListCopy.length; i++) {
        let option = this.campaignListCopy[i];
        if (option.campaignName.toLowerCase().includes(filter) && filter != '') {
          array.push(option);
        }
      }
      this.campaignList = array;
      if (this.campaignList.length == 0) {
      }
    } else {
      this.campaignList = this.campaignListCopy;
    }
    this.dataSource = new MatTableDataSource<campaignList>(this.campaignList);
    if (this.campaignList.some(list => !list.checked)) {
      this.selectAll = false;
    } else {
      this.selectAll = true;
    }
  }

  sortTemplateList(value, type) {
    if (type == 'sortBy') {
      this.sortByValue = value;
    }
    if (type == 'sortOrder') {
      this.sortOrderValue = value;
    }
    if (this.sortByValue == 'createdDate') {
      if (this.sortOrderValue == 'descending') {
        this.campaignList.sort((a, b) => new Date(b.startDate).valueOf() - new Date(a.startDate).valueOf())
      } else {
        this.campaignList.sort((a, b) => new Date(a.startDate).valueOf() - new Date(b.startDate).valueOf())
      }
    } else if (this.sortByValue == 'stopDate') {
      if (this.sortOrderValue == 'descending') {
        this.campaignList.sort((a, b) => new Date(b.endDate).valueOf() - new Date(a.endDate).valueOf())
      } else {
        this.campaignList.sort((a, b) => new Date(a.endDate).valueOf() - new Date(b.endDate).valueOf())
      }
    } else if (this.sortByValue == 'campaignName') {
      if (this.sortOrderValue == 'descending') {
        this.campaignList.sort((a, b) => b.campaignName.localeCompare(a.campaignName))
      } else {
        this.campaignList.sort((a, b) => a.campaignName.localeCompare(b.campaignName))
      }
    }
    this.dataSource = new MatTableDataSource<campaignList>(this.campaignList);
  }
}