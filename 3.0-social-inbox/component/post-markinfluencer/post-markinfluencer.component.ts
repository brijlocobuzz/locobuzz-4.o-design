import { COMMA, E, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { cu } from '@fullcalendar/core/internal-common';
import { LocobuzzUtils } from '@locobuzz/utils';
import { TranslateService } from '@ngx-translate/core';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { notificationType } from 'app/core/enums/notificationType';
import { AuthUser, influencer } from 'app/core/interfaces/User';
import { CommonService } from 'app/core/services/common.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { map, startWith } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-post-markinfluencer',
    templateUrl: './post-markinfluencer.component.html',
    styleUrls: ['./post-markinfluencer.component.scss'],
    standalone: false
})
export class PostMarkinfluencerComponent implements OnInit {
  influencer: any;
  selectedInfluencer: any;
  influencerList: Array<influencer> = [];
  influencerLabel = 'Mark Influencer';
  showRemoveInfluncer = true;
  formGroup: UntypedFormGroup;
  filteredOptions = [];
  influencerLoader: boolean=false;
  clickhouseEnabled: boolean=false;
  separatorKeysCodes: number[] = [];
  searchInfluencerChipControl = new UntypedFormControl('');
  influencerSearchList: any;
  influencerChipList=[]
  incluencerChipCheckboxList: number[]=[];
  filteredInfluencer: influencer[]=[];
  defaultLayout: boolean = false;
  subs = new SubSink();
  constructor(
    private _ticketService: TicketsService,
    private _postDetailService: PostDetailService,
    private snackBar: MatSnackBar,
    private formBuilder: UntypedFormBuilder,
    public dialogRef: MatDialogRef<PostMarkinfluencerComponent>,
    private _cdr:ChangeDetectorRef,
    private _sidebarService:SidebarService,
    private commonService: CommonService,
    private translate: TranslateService,
  ) {}

  ngOnInit(): void {
    const currentUser:AuthUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser.data?.user?.isListening && !currentUser.data?.user?.isORM && currentUser.data?.user?.isClickhouseEnabled==1)
    {
      this.clickhouseEnabled=true;
      if (this._postDetailService.postObj.author.influencerDetailsList?.length > 0) {
        this.influencerLabel = 'Update Influencer';
        this.influencerChipList = Object.assign([],this._postDetailService.postObj.author.influencerDetailsList)
        this.incluencerChipCheckboxList = this.influencerChipList.map(obj => obj['influencerCategoryID'])
        if (this.influencerChipList.length == 0) {
          this.showRemoveInfluncer = false;
        }else{
          this.showRemoveInfluncer = true;
        }
      } else {
        this.influencerChipList =[];
        this.showRemoveInfluncer = false;
      } 
    }else
      {
      this.selectedInfluencer =
        this._postDetailService.postObj.author.markedInfluencerCategoryName;
      if (this.selectedInfluencer) {
        this.influencerLabel = 'Update Influencer';
      } else {
        this.showRemoveInfluncer = false;
      }
      this.initForm();
      }
    this.generateInfluencerList();
    // this.getInfluencerList();

    this.influencerSearchList = this.searchInfluencerChipControl.valueChanges.pipe(
      startWith(''),
      map((value) => this.filterInfluencer(value))
    );

    // console.log(this.selectedInfluencer)
    this.separatorKeysCodes = LocobuzzUtils.seperateKeyCodeFunc()
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }
  // getInfluencerList() {
  //   this.filteredOptions = this.influencerList;
  // }
  initForm() {
    this.formGroup = this.formBuilder.group({ category: [''] });
    this.formGroup.get('category').valueChanges.subscribe((response: any) => {
      console.log('data: ', response);
      this.filterData(response);
    });
  }
  filterData(response: any) {
    this.filteredOptions = this.influencerList.filter((item: influencer) => {
      return item.category.toLowerCase().indexOf(response.toLowerCase()) > -1;
    });
  }

  private generateInfluencerList(): void {
    // console.log(this._postDetailService.postObj);
    const object = {
      BrandID: this._postDetailService.postObj.brandInfo.brandID,
      BrandName: this._postDetailService.postObj.brandInfo.brandName,
      BrandFriendlyName:
        this._postDetailService.postObj.brandInfo.brandFriendlyName,
      // CategoryID: this._postDetailService.postObj.brandInfo.categoryID,
      // CategoryName: '',
      BrandGroupName: '',
      BColor: '',
      CampaignName: '',
    };

    // console.log(JSON.stringify(object));

    this._ticketService.getBrandInfluencerList(object).subscribe((data) => {
      this.influencerList = data['data'];
      this.filteredOptions = data['data'];
      this.filteredInfluencer = data['data'];
      this.filteredOptions = this.filteredOptions.sort(function (a, b) {
        return ('' + a.category).localeCompare(b.category);
      });
      this.searchInfluencerChipControl.setValue('');
      // ('Influencer', this.influencerList);
    });
  }

  updateInfluencer(event): void {
    this.influencer = event;
  }

  updateAPI(): void {
    // console.log(this.influencer['source'].triggerValue);
    if (this.influencer) {
      let data = this.influencerList.filter((item) => {
        return item.category == this.influencer['source'].value;
      });
      const object = {
        InfluencerCategoryID: data[0].categoryID,
        InfluencerCategoryName: data[0].category,
        ChannelType: ChannelGroup[this._postDetailService.postObj.channelGroup],
        AuthorSocialID: this._postDetailService.postObj.author.socialId,
        ScreenName: this._postDetailService.postObj.author.screenname || this._postDetailService.postObj.author.name ,
        BrandName: this._postDetailService.postObj.brandInfo.brandName,
        BrandID: this._postDetailService.postObj.brandInfo.brandID,
      };

      // if (object.ScreenName === null)
      // {
      //   object.ScreenName = '';
      // }

      // console.log(JSON.stringify(object));
      if (object.InfluencerCategoryID) {
        this.influencerLoader=true;
        this._ticketService.insertUpdateInfluencer(object).subscribe((data) => {
          this.influencerLoader = false;
          if (JSON.parse(JSON.stringify(data)).success) {
            this._postDetailService.postObj.author.markedInfluencerCategoryID =
              object.InfluencerCategoryID;
            this._postDetailService.postObj.author.markedInfluencerCategoryName =
              object.InfluencerCategoryName;
            this._postDetailService.setMarkInfluencer.next(
              this._postDetailService.postObj
            );
            this.dialogRef.close(true);
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Mark-as-influencer-updated-successfully'),
              },
            });
          } else {
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Warn,
                message: this.translate.instant('Unable-to-update'),
              },
            });
          }
        },err=>{
          this.influencerLoader = false;
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Something-went-wrong'),
            },
          });
        });
      } else {
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-select-influencer-category'),
          },
        });
      }
    } else {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-select-influencer-category'),
        },
      });
    }
  }

  inActiveInfluencer(): void {
    const object = {
      InfluencerCategoryID:
        this._postDetailService.postObj.author.markedInfluencerCategoryID,
      InfluencerCategoryName:
        this._postDetailService.postObj.author.markedInfluencerCategoryName,
      ChannelType: ChannelGroup[this._postDetailService.postObj.channelGroup],
      AuthorSocialID: this._postDetailService.postObj.author.socialId,
      ScreenName: this._postDetailService.postObj.author.screenname || '',
      BrandName: this._postDetailService.postObj.brandInfo.brandName,
      BrandID: this._postDetailService.postObj.brandInfo.brandID,
      IsInactive: 1,
    };

    // console.log(JSON.stringify(object));

    if (object.InfluencerCategoryID) {
      this._ticketService.inActiveInfluencer(object).subscribe((data) => {
        if (JSON.parse(JSON.stringify(data)).success) {
          // console.log('Influencer Removed', data);
          this._postDetailService.postObj.author.markedInfluencerCategoryID = 0;
          this._postDetailService.postObj.author.markedInfluencerCategoryName =
            null;
          this._postDetailService.setMarkInfluencer.next(
            this._postDetailService.postObj
          );
          this.selectedInfluencer = null;
          this.dialogRef.close(true);
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Influencer-Removed-successfully'),
            },
          });
        } else {
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Unable-to-remove-influencer'),
            },
          });
        }
      });
    } else {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Influencer-not-marked-for-current-author'),
        },
      });
    }
  }

  private filterInfluencer(value) {
    if (value != undefined && value !== null && typeof value !== 'object') {
      const filterValue = value.toLowerCase();
      if (filterValue.length > 0) {
      this.filteredInfluencer =  this.influencerList.filter(
          (option) => option.category.toLowerCase().includes(filterValue)
        );
        return this.influencerList.filter(
          (option) => option.category.toLowerCase().includes(filterValue)
        );
      } else {
        this.filteredInfluencer=this.influencerList;
        // if (!this.excelReportFlag) this.searchInfluencerControl.reset(); // this.filterFormSubmited(true);
        return this.influencerList;
      }
    }
  }
  
  selectInfluencerEvent(option,inputRef):void
  {
    if (!this.influencerChipList.some((obj) => obj.influencerCategoryID ==option.categoryID))
    {
      this.influencerChipList.push({ influencerCategoryID: option.categoryID, influencerCategoryName: option.category });
      this.incluencerChipCheckboxList.push(option.categoryID)
    }else
    {
      const index = this.influencerChipList.findIndex(obj => obj.influencerCategoryID === option.categoryID);
      if (index >= 0) {
        this.influencerChipList.splice(index, 1);
        this.incluencerChipCheckboxList.splice(index, 1);
      }
    }
    // inputRef.value = '';
    // (this.influencerChipList?.length>0)?this.showRemoveInfluncer=true:this.showRemoveInfluncer=false;
    (this.influencerChipList?.length > 0) ? this.influencer = true : this.influencer = false;
  }

  removeInfluencer(value):void
  {
    let index = this.influencerChipList.findIndex((obj) => obj.influencerCategoryID == value.influencerCategoryID);
    if (index >= 0) {
      this.influencerChipList.splice(index, 1);
      this.incluencerChipCheckboxList.splice(index, 1);
    }
    // (this.influencerChipList?.length > 0) ? this.showRemoveInfluncer = true : this.showRemoveInfluncer = false;
    (this.influencerChipList?.length > 0) ? this.influencer = true : this.influencer = false;
  }

  // new API Request for clickhouse API to update influencer category
  updateInfluencerCategoryClickhouse(removeInfluencerFlag?:boolean):void
  {
    if(this.influencerChipList.length==0 && !removeInfluencerFlag)
    {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-select-influencer-category'),
        },
      });
      return;
    }
    this.influencerLoader = true;
    let obj

    if(removeInfluencerFlag)
    {
      obj = {
        InfluencerCategoryID:
          this._postDetailService.postObj.author.markedInfluencerCategoryID,
        InfluencerCategoryName:
          this._postDetailService.postObj.author.markedInfluencerCategoryName,
        ChannelType: this._postDetailService.postObj.channelGroup == ChannelGroup.TikTok ? 'Tiktok' : ChannelGroup[this._postDetailService.postObj.channelGroup],
        AuthorSocialID: this._postDetailService.postObj.author.socialId,
        ScreenName: this._postDetailService.postObj.author.screenname || '',
        BrandName: this._postDetailService.postObj.brandInfo.brandName,
        BrandID: this._postDetailService.postObj.brandInfo.brandID,
        IsInactive: 1,
        InfluencerCategories: this.influencerChipList,
      };
    }else{
      obj = {
        InfluencerCategoryID: this._postDetailService.postObj.author.markedInfluencerCategoryID,
        InfluencerCategoryName: this._postDetailService.postObj.author.markedInfluencerCategoryName,
        ChannelType: this._postDetailService.postObj.channelGroup==ChannelGroup.TikTok?'Tiktok': ChannelGroup[this._postDetailService.postObj.channelGroup],
        AuthorSocialID: this._postDetailService.postObj.author.socialId,
        ScreenName: this._postDetailService.postObj.author.screenname || this._postDetailService.postObj.author.name,
        BrandName: this._postDetailService.postObj.brandInfo.brandName,
        BrandID: this._postDetailService.postObj.brandInfo.brandID,
        InfluencerCategories: this.influencerChipList,
      };
    }

    this._ticketService.updateInfluencerCategory(obj, removeInfluencerFlag).subscribe((data) => {
      this.influencerLoader = false;
      if (JSON.parse(JSON.stringify(data)).success) {
        const msg = removeInfluencerFlag
          ? this.translate.instant('Influencer-Removed-successfully')
          : this.translate.instant('Influencer-Updated-successfully');
        if(removeInfluencerFlag)
        {
         this._postDetailService.postObj.author.influencerDetailsList = [];
          this._postDetailService.setMarkInfluencerClickhouse.next(this._postDetailService.postObj);
        }else{
          this._postDetailService.postObj.author.influencerDetailsList = this.influencerChipList;
          this._postDetailService.setMarkInfluencerClickhouse.next(this._postDetailService.postObj);
        }
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: msg,
          },
        });
        this.dialogRef.close(true);
      }else{
        this.snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Unable-to-update-influencer-category'),
          },
        });
      }
    },err=>{
      this.influencerLoader = false;
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Something-went-wrong'),
        },
      });
    })
  }

  influencerChange(event, option): void {
    if (event.checked) {
      this.influencerChipList.push({ influencerCategoryID: option.categoryID, influencerCategoryName: option.category })
      this.incluencerChipCheckboxList.push(option.categoryID);
    } else {
      const index = this.influencerChipList.findIndex(obj => obj.influencerCategoryID === option.categoryID);
      if (index >= 0) {
        this.influencerChipList.splice(index, 1);
        this.incluencerChipCheckboxList.splice(index, 1);
      }
    }
    (this.influencerChipList?.length > 0) ? this.influencer = true : this.influencer = false;
  }

  influencerChangeSelectAllEvent(event): void {
    this.influencerChipList = [];
    this.incluencerChipCheckboxList = [];
    if (event.checked) {
      this.covertInfluenerMainArrayIntoChipList()
      this.incluencerChipCheckboxList = this.filteredInfluencer.map(obj => obj.categoryID);
    } else {
      this.influencerChipList = [];
      this.incluencerChipCheckboxList = [];
    }
    (this.influencerChipList?.length > 0) ? this.influencer = true : this.influencer = false;
  }

  selectAllInfluencer(event): void {
    this.influencerChipList = [];
    this.incluencerChipCheckboxList = [];
    if (!event.checked) {
      this.covertInfluenerMainArrayIntoChipList()
      this.incluencerChipCheckboxList = this.filteredInfluencer.map(obj => obj.categoryID);
    } else {
      this.influencerChipList = [];
      this.incluencerChipCheckboxList = [];
    }
    (this.influencerChipList?.length>0)?this.influencer=true:this.influencer=false;
  }

  covertInfluenerMainArrayIntoChipList(): void {
    const tempChipList = [];
    this.filteredInfluencer.forEach(obj => {
      tempChipList.push({ influencerCategoryID: obj.categoryID, influencerCategoryName: obj.category });
    });
    this.influencerChipList = tempChipList;
    this.incluencerChipCheckboxList = [];
  }



}
