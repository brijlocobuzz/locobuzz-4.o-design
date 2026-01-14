import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnInit,
  Optional,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatRadioButton } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AccountSettingService } from 'app/accounts/services/account-setting.service';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { categoryFilterItem } from 'app/core/interfaces/locobuzz-navigation';
import { AuthUser } from 'app/core/interfaces/User';
import { TaggingCategory } from 'app/core/models/category/TaggingCategory';
import { CategoryTagDetails } from 'app/core/models/dbmodel/TagsInformation';
import { ManualTicketData } from 'app/core/models/viewmodel/AttachmentFile';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { TaggingRequestParameters } from 'app/core/models/viewmodel/TaggingRequestParameters';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { take } from 'rxjs/operators';
import { catefilterData } from '../../services/category.service';
import { TicketsService } from '../../services/tickets.service';
import { notificationType } from './../../../core/enums/notificationType';
import { CustomSnackbarComponent } from './../../../shared/components/custom-snackbar/custom-snackbar.component';
import { ClickhouseBulkPopupComponent } from 'app/social-inbox/clickhouse-bulk-popup/clickhouse-bulk-popup.component';
import { SidebarService } from 'app/core/services/sidebar.service';
import { TabService } from 'app/core/services/tab.service';
import { AlertDialogModel, AlertPopupComponent } from 'app/shared/components/alert-popup/alert-popup.component';
import { SubSink } from 'subsink/dist/subsink';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-category-filter',
    templateUrl: './category-filter.component.html',
    styleUrls: ['./category-filter.component.scss'],
    // providers: [TicketsService],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class CategoryFilterComponent implements OnInit, categoryFilterItem {
  tagretweet = false;
  isTicketCategoryTagEnable = false;
  selectedUpper;
  nullSentiment = true;
  dataSource = [];
  savedparent = new Map();
  savedsubCategory = new Map();
  savedsubsubCategory = new Map();
  temp;
  categoryCards = [];
  groupViewPopup: boolean = false;
  upperCategories = [];
  inputValue;
  treeData = [];
  categoryType;
  checkBoxes;
  DefaultSelected;
  parentRadio = new Map();
  subchildRadio = new Map();
  subsubRadio = new Map();
  taggingParameters: TaggingRequestParameters = {};
  manualTicketData: ManualTicketData = {};
  showAllMentionCheckBox = true;
  currentUser: AuthUser;
  setallmentionunderticket = false;
  setToTicket = false;
  settagTweet = false;
  showsettoticket = false;
  subs = new SubSink();
  keyObj: any;
  isBulkSelected :boolean =false;

  @ViewChildren('checkBox') parentCheckboxes: QueryList<MatCheckbox>;
  @ViewChildren('nestCheckbox') nestedCheckboxes: QueryList<MatCheckbox>;
  @ViewChildren('dnestedCheck') dnestedCheckboxes: QueryList<MatCheckbox>;
  @ViewChildren('parentradio') parentRadios: QueryList<MatRadioButton>;
  @ViewChildren('subRadio') subRadios: QueryList<MatRadioButton>;
  @ViewChildren('subsubRadios') subsubRadios: QueryList<MatRadioButton>;
  catchAllCategory: number = 0;
  ticketOrMentionCategoryMap: TaggingCategory[];
  categoryLoader: boolean = false;
  loaderTypeEnum = loaderTypeEnum;
  loading: boolean;
  selectedUpperCategoryDetails: any;
  postObjData: any;
  clickhouseEnabled: boolean=false;voipSetup: boolean;
;
  isFullThreadChecked: boolean = false;
  isGroupedView:boolean=false;
  relatedMentionsFlag:boolean=false;
  filterObj:any
  previousUpperCategory = false;
  changedCategoryOrNot = false;
  defaultLayout: boolean = false;
  onlyUpperCategory: boolean = false;
  aiUpperCategoryListWithIcon = [
    { name: 'query', icon: 'help', sentimentColor: 'sentiment-color-neutral', sentiment: 0 },
    { name: 'appreciation', icon: 'thumb_up', sentimentColor: 'sentiment-color-positive', sentiment: 1 },
    { name: 'complaint', icon: 'feedback', sentimentColor: 'sentiment-color-negative', sentiment: 2 },
    // { name: 'suggestion', icon: 'lightbulb', sentimentColor: 'sentiment-color-neutral', sentiment: 0 },
    { name: 'request', icon: 'post_add', sentimentColor: 'sentiment-color-neutral', sentiment: 0 },
    // { name: 'news', icon: 'article', sentimentColor: 'sentiment-color-neutral', sentiment: 0 },
    // { name: 'marketing/campaign/promotions', icon: 'campaign', sentimentColor: 'sentiment-color-positive', sentiment: 1 },
    // { name: 'other', icon: 'more_horiz', sentimentColor: 'sentiment-color-neutral', sentiment: 0 },
    // { name: 'marketing', icon: 'local_offer', sentimentColor: 'sentiment-color-positive', sentiment: 1 },
    // { name: 'feedback', icon: 'lightbulb', sentimentColor: 'sentiment-color-neutral', sentiment: 0 },
    { name: 'opportunity', icon: 'rocket_launch', sentimentColor: 'sentiment-color-positive', sentiment: 1 },
    { name: 'brand promotion', icon: 'campaign', sentimentColor: 'sentiment-color-positive', sentiment: 1 },
    { name: 'Moderation', icon: 'admin_panel_settings', sentimentColor: 'sentiment-color-neutral', sentiment: 0 },
    { name: 'feedback/review', icon: 'lightbulb', sentimentColor: 'sentiment-color-neutral', sentiment: 0 }
  ];
  searchCategory: string = '';
  upperCategoryLoader:boolean = true;
  manualUpperCategory:boolean = true;
  copyUpperCategories: any[] = [];
  constructor(
    public data: catefilterData,
    private _postDetailService: PostDetailService,
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef,
    private httpClient: HttpClient,
    private mapLocobuzzEntity: MaplocobuzzentitiesService,
    private _replyService: ReplyService,
    private _navigationService: NavigationService,
    private _snackBar: MatSnackBar,
    private _ticketService: TicketsService,
    private _filterService: FilterService,
    private _navService: NavigationService,
    private dialogRef: MatDialogRef<CategoryFilterComponent>,
    private _accountService: AccountService,
    private _ngZone: NgZone,
    private _accountSettngService: AccountSettingService,
    private sidebarService:SidebarService,
    private _tabService: TabService,
    private commonService: CommonService,
    private translate: TranslateService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public baseData: {
      onlyUpperCategory?: boolean;
      manualUpperCategory?: boolean;
      manualTicketData: ManualTicketData;
      manualCreationFlag: false;
        relatedMentionsFlag:boolean,
        voipSetup?: boolean;
    }
  ) {
    if (baseData && baseData.manualTicketData) {
      this.manualTicketData = baseData.manualTicketData;
    }
    if(baseData && baseData.relatedMentionsFlag){
      this.relatedMentionsFlag = baseData.relatedMentionsFlag
    }
    if (!baseData){
      this.relatedMentionsFlag = this._postDetailService.relatedOrfullmention ? true:false;
    }
    if( baseData && baseData?.onlyUpperCategory){
      this.onlyUpperCategory = baseData.onlyUpperCategory;
    }
    if (baseData && (baseData?.manualUpperCategory == false || baseData?.manualUpperCategory)) {
      this.manualUpperCategory = baseData.manualUpperCategory;
    }
  }
  postRequestData: object;

  ngOnInit(): void {
    this.categoryType = this._postDetailService.categoryType;
    this.postObjData = this._postDetailService.postObj;

    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
        }
      })
    )
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    const setallmentionunderticket = localStorage.getItem(
      'setallmentionunderticket' + this.currentUser.data.user.userId
    );
    if (setallmentionunderticket === '1') {
      this.setallmentionunderticket = true;
    } else {
      this.setallmentionunderticket = false;
    }
    const setToTicket = localStorage.getItem(
      'setToTicket' + this.currentUser.data.user.userId
    );
    if (setToTicket === '1') {
      this.setToTicket = true;
    } else if (setToTicket) {
      this.setToTicket = false;
    } else {
      this.setToTicket = true;
    }
    const settagTweet = localStorage.getItem(
      'settagTweet' + this.currentUser.data.user.userId
    );
    if (settagTweet === '1') {
      this.settagTweet = true;
    } else {
      this.settagTweet = false;
    }

    const brandList = this._filterService.fetchedBrandData;
    const currentBrandObj = brandList.filter((obj) => {
      return (
        +obj.brandID === +this._postDetailService.postObj.brandInfo.brandID
      );
    });
    const currentBrand =
      currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;

    // this.tagretweet =
    //   this._postDetailService.postObj.channelGroup === ChannelGroup.Twitter
    //     ? true
    //     : false;

    (this._postDetailService?.isBulk) ? this.tagretweet = this._ticketService.bulkMentionChecked.some((obj) => obj.mention.channelGroup == ChannelGroup.Twitter) : this.tagretweet =this._postDetailService.postObj.channelGroup==ChannelGroup.Twitter;

    if (currentBrand) {
      this.isTicketCategoryTagEnable = currentBrand.isTicketCategoryTagEnable;
    }
    if (!this.isTicketCategoryTagEnable){
      this.setToTicket = false;
    }

    if (this._postDetailService.isBulk) {
      if (
        this._postDetailService.pagetype !== PostsType.TicketHistory &&
        this.isTicketCategoryTagEnable &&
        this.categoryType !== 'ticketCategory'
      ) {
        this.showsettoticket = true;
      }
    } else {
      if (
        this._postDetailService.pagetype !== PostsType.Mentions &&
        this.isTicketCategoryTagEnable &&
        this.categoryType !== 'ticketCategory'
      ) {
        this.showsettoticket = true;
      }
    }
    const key = this._filterService.getEmptyGenericFilter();
    key.brands.push(this._postDetailService.postObj.brandInfo);
    const brand = this._filterService.fetchedBrandData.filter(
      (obj) =>
        Number(obj.brandID) ===
        this._postDetailService.postObj.brandInfo.brandID
    );
    if (brand) {
      key.brands[0].categoryGroupID = Number(brand[0].categoryGroupID);
      this.catchAllCategory = brand[0].catchAllCategory;
    }
    if (this._navService?.currentSelectedTab?.guid) {
      const genericFilter = this._navigationService.getFilterJsonBasedOnTabGUID(
        this._navService?.currentSelectedTab?.guid
      );
      key.startDateEpoch = genericFilter.startDateEpoch;
      key.endDateEpoch = genericFilter.endDateEpoch;
    }

    this.categoryLoader = true;
    this.cdr.detectChanges();
    this.data
      .categoryList(key)
      .pipe(take(1))
      .subscribe((apiData) => {
        this.categoryLoader = false;
        this.data.categoryData = apiData['data'];
        this.treeData = this.data.categoryData;
        this.DefaultSelected = 'default';
        this.dataSource = this.data.categoryData;
        // this.cdr.detectChanges();
        this.fillCategoryMap();
      });
    this.upperCategoryLoader = true;
    this.data.upperCategoryList(key).subscribe((apiData) => {
      this.upperCategories = apiData['data'];
      if(this.upperCategories && this.upperCategories.length){
        this.upperCategories.sort((a, b) => Number(b?.isAIBasedUpperCategory) - Number(a?.isAIBasedUpperCategory));
        this.copyUpperCategories = JSON.parse(JSON.stringify(this.upperCategories));
      }
      this.upperCategoryLoader = false;
      this.cdr.detectChanges();
    }, error => {
      this.upperCategoryLoader = false;
      this.cdr.detectChanges();
    });
    this.selectedUpper = '';
    // (this._postDetailService.postObj);
    // console.log('Ticket Priority');
    this._ticketService.hideUnhideMention().subscribe((data) => {
      // console.log(data);
      // console.log('DeleteData');
    });

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
    this.clickhouseEnabled=true
    }
    this.GroupView();
    // this.getCategoryConfiguration();

    this.subs.add(
      this._ticketService.keyObjSubject.subscribe((obj) => {
        if (obj) {
          this.keyObj = obj;
        }
      })
    );
    this.voipSetup = this.baseData?.voipSetup ? this.baseData.voipSetup : false;
  }
  searchUpperCategories(){
    const searchString = this.searchCategory.toLowerCase().trim();
    if(searchString) {
      this.upperCategories = this.copyUpperCategories.filter(category => this.translate.instant(category?.name).toLowerCase().includes(searchString)  || category?.name.toLowerCase().includes(searchString));
    } else {
      this.upperCategories = JSON.parse(JSON.stringify(this.copyUpperCategories));
    }
  }
  getCategorysIcons(category: string): string {
    if (category) {
      const categoryIcons = this.aiUpperCategoryListWithIcon.find(res => res?.name.toLowerCase() == category.toLowerCase());
      if (categoryIcons) {
        return categoryIcons.icon;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }
  getCategorysSentimentColor(category: string): string {
    if (category) {
      const categorySentimentColor = this.aiUpperCategoryListWithIcon.find(res => res?.name.toLowerCase() == category.toLowerCase());
      if (categorySentimentColor) {
        return categorySentimentColor.sentimentColor;
      } else {
        return 'sentiment-color-neutral';
      }
    } else {
      return 'sentiment-color-neutral';
    }
  }
  /*-------------------------Search/Filter ---------------------------------*/

  filter(value): void {
    if (!value) {
      this.treeData.forEach((data) => {
        let found = false;
        // console.log(this.savedparent.get(data.category));
        if (!this.savedparent.get(data.category + data.categoryID)) {
          data.sentiment = null;
        }

        data.depatments.forEach((subData) => {
          if (this.savedsubCategory.get(subData.departmentName + subData.departmentID) && !found) {
            found = true;
            data.sentiment = null;
            subData.departmentSentiment = '0';
          }

          subData.subCategories.forEach((subsubData) => {
            if (
              this.savedsubsubCategory.get(subsubData.subCategoryName + subsubData.subCategoryID) &&
              found
            ) {
              found = true;
              data.sentiment = null;
              subData.departmentSentiment = null;
              subsubData.subCategorySentiment = '0';
            }
          });
        });
      });

      this.dataSource = this.treeData;
      if (this.categoryCards.length !== 0) {
        this.parentCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          data._results.forEach((element, index) => {
            if (this.savedparent.get(element.name) === element.name) {
              element.checked = true;
            }
            if (index == data._results.length - 1) {
              this.cdr.detectChanges();
            }
          });
        });
        this.nestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              data._results.forEach((element, index) => {
                if (this.savedsubCategory.get(element.name) === element.name) {
                  element.checked = true;
                }
                if (index == data._results.length - 1) {
                  this.cdr.detectChanges();
                }
              });
            });
          });
        });

        this.dnestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              data._results.forEach((element, index) => {
                if (
                  this.savedsubsubCategory.get(element.name) === element.name
                ) {
                  element.checked = true;
                }
                if (index == data._results.length - 1) {
                  this.cdr.detectChanges();
                }
              });
            });
          });
        });

        this.parentRadios.changes.pipe(take(1)).subscribe((data) => {
          this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              data._results.forEach((button, index) => {
                if (this.parentRadio.get(button.name) === button.value) {
                  button.checked = true;
                }
                if (index == data._results.length - 1) {
                  this.cdr.detectChanges();
                }
              });
            });
          });
        });

        this.subRadios.changes.pipe(take(1)).subscribe((data) => {
          this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              data._results.forEach((button) => {
                if (this.subchildRadio.get(button.name) === button.value) {
                  button.checked = true;
                }
              });
              this.cdr.detectChanges();
            });
          });
        });

        this.subsubRadios.changes.pipe(take(1)).subscribe((data) => {
          this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              data._results.forEach((button, index) => {
                if (this.subsubRadio.get(button.name) === button.value) {
                  button.checked = true;
                }
                if (index == data._results.length - 1) {
                  this.cdr.detectChanges();
                }
              });
            });
          });
        });
      }
    } else {
      this.temp = [];

      // this.temp = this.treeData.filter(
      // (obj) =>
      // obj.category.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
      // obj.depatments.some(
      // (dep) =>
      // dep.departmentName.toLowerCase().indexOf(value.toLowerCase()) >
      // -1 ||
      // dep.subCategories.some(
      // (subCat) =>
      // subCat.subCategoryName
      // .toLowerCase()
      // .indexOf(value.toLowerCase()) > -1
      // )
      // )
      // );
      const searchString = value.toLowerCase();
      // this.treeData.map(obj => Object.assign(obj));
      const treeDataCopy = JSON.parse(JSON.stringify(this.treeData))

      this.dataSource = this._ticketService.levelFilter(searchString, treeDataCopy);
      // console.log(this.temp);

      if (this.dataSource.length !== 0) {
        // this.dataSource = this.temp;
        this.parentCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          data._results.forEach((element) => {
            if (this.savedparent.get(element.name) === element.name) {
              element.checked = true;
              this.nestedCheckboxes.changes
                .pipe(take(1))
                .subscribe((nestdata) => {
                  nestdata._results.forEach((nestelement, index) => {
                    if (
                      this.savedsubCategory.get(nestelement.name) ===
                      nestelement.name
                    ) {
                      nestelement.checked = true;
                    }
                    if (index == nestdata._results.length - 1) {
                      this.cdr.detectChanges();
                    }
                  });
                });
              this.cdr.detectChanges();
            }
          });
        });

        this.dnestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((element, index) => {
              if (this.savedsubsubCategory.get(element.name) === element.name) {
                element.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        this.parentRadios.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((button, index) => {
              if (this.parentRadio.get(button.name) === button.value) {
                button.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        this.subRadios.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((button, index) => {
              if (this.subchildRadio.get(button.name) === button.value) {
                button.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
            console.log('setTimeout called');
          });
        });

        this.subsubRadios.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((button, index) => {
              if (this.subsubRadio.get(button.name) === button.value) {
                button.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        this.dataSource.forEach((element) => {
          if (element.category + element.categoryID === this.savedparent.get(element.category + element.categoryID)) {
            element.sentiment = this.parentRadio.get(element.category + element.categoryID)
            element.depatments.forEach((subElement) => {
              if (subElement.departmentName + subElement.departmentID === this.savedsubCategory.get(subElement.departmentName + subElement.departmentID)) {
                element.sentiment = null;
                subElement.departmentSentiment = this.subchildRadio.get(subElement.departmentName + subElement.departmentID)
                subElement.subCategories.forEach((subSubElement) => {
                  if (subSubElement.subCategoryName + subSubElement.subCategoryID === this.savedsubsubCategory.get(subSubElement.subCategoryName + subSubElement.subCategoryID)) {
                    subElement.departmentSentiment = null;
                    subSubElement.subCategorySentiment = this.subsubRadio.get(subSubElement.subCategoryName + subSubElement.subCategoryID)
                  }
                })
              }
            })
          }
        })

        return;
      }

      this.treeData.forEach((data) => {
        let found = false;
        data.depatments.forEach((nestedData) => {
          if (nestedData.departmentName.includes(value) && value !== '') {
            if (this.temp.length === 0) {
              // console.log(this.savedparent.get(data.category));
              if (this.savedparent.get(data.category)) {
                data.sentiment = null;
              }

              this.temp.push({
                categoryID: data.categoryID,
                category: data.category,
                sentiment: data.sentiment,
                depatments: [nestedData],
              });
            } else {
              found = false;

              this.temp.forEach((element) => {
                if (element.category === data.category) {
                  if (this.savedparent.get(data.category)) {
                    data.sentiment = null;
                  }
                  // else {
                  // data.sentiment = null;

                  // }

                  found = true;
                  element.categoryID = data.categoryID;
                  element.sentiment = data.sentiment;
                  element.depatments.push(nestedData);
                }
              });

              if (!found) {
                if (this.savedparent.get(data.category)) {
                  data.sentiment = null;
                }
                // else {
                // data.sentiment = null;

                // }

                this.temp.push({
                  categoryID: data.categoryID,
                  category: data.category,
                  sentiment: data.sentiment,
                  depatments: [nestedData],
                });
              }
            }
          }
        });
      });

      let done = false;
      if (this.temp.length !== 0) {
        this.temp.forEach((data) => {
          let found = false;

          if (this.savedparent.get(data.category)) {
            data.sentiment = null;
          }
          // else {
          // data.sentiment = '';
          // }

          data.depatments.forEach((subData) => {
            if (this.savedsubCategory.get(subData.departmentName) && !found) {
              found = true;
              data.sentiment = null;
              subData.departmentSentiment = '0';
            }

            subData.subCategories.forEach((subsubData) => {
              if (
                this.savedsubsubCategory.get(subsubData.subCategoryName) &&
                found
              ) {
                found = true;
                data.sentiment = null;
                subData.departmentSentiment = null;
              }
            });
          });
        });

        this.dataSource = this.temp;
        this.parentCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          data._results.forEach((element, index) => {
            element.checked = true;
            if (index == data._results.length - 1) {
              this.cdr.detectChanges();
            }
          });
        });

        this.nestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((element, index) => {
              if (this.savedsubCategory.get(element.name) === element.name) {
                element.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        this.dnestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((element, index) => {
              if (this.savedsubsubCategory.get(element.name) === element.name) {
                element.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        this.parentRadios.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((button, index) => {
              if (this.parentRadio.get(button.name) === button.value) {
                button.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        this.subRadios.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((button, index) => {
              if (this.subchildRadio.get(button.name) === button.value) {
                button.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        this.subsubRadios.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((button, index) => {
              if (this.subsubRadio.get(button.name) === button.value) {
                button.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        done = true;
        return;
      }

      // ------------------------ Deep Search In Tree-------------------------------

      this.treeData.forEach((data) => {
        let found = false;
        data.depatments.forEach((nestedData) => {
          nestedData.subCategories.forEach((subNestedData) => {
            const say = subNestedData.subCategoryName;
            if (say && say.includes(value)) {
              if (this.temp.length === 0) {
                data.sentiment = null;
                this.temp.push({
                  categoryID: data.categoryID,
                  category: data.category,
                  sentiment: null,
                  depatments: [
                    {
                      departmentID: nestedData.departmentID,
                      departmentName: nestedData.departmentName,
                      labelID: nestedData.labelID,
                      departmentSentiment: nestedData.departmentSentiment,
                      subCategories: [subNestedData],
                    },
                  ],
                });
              } else {
                found = false;
                this.temp.forEach((element) => {
                  element.depatments.forEach((subelement) => {
                    if (
                      subelement.departmentName === nestedData.departmentName
                    ) {
                      found = true;
                      subelement.subCategories.push(subNestedData);
                    }
                  });

                  if (!found) {
                    let got = false;
                    this.temp.forEach((_element) => {
                      if (_element.category === data.category) {
                        got = true;

                        element.depatments.push({
                          departmentID: nestedData.departmentID,
                          departmentName: nestedData.departmentName,
                          labelID: nestedData.labelID,
                          departmentSentiment: nestedData.departmentSentiment,
                          subCategories: [subNestedData],
                        });
                      }
                    });

                    if (!got) {
                      data.sentiment = null;

                      this.temp.push({
                        categoryID: data.categoryID,
                        category: data.category,
                        sentiment: null,
                        depatments: [
                          {
                            departmentID: nestedData.departmentID,
                            departmentName: nestedData.departmentName,
                            labelID: nestedData.labelID,
                            departmentSentiment: nestedData.departmentSentiment,
                            subCategories: [subNestedData],
                          },
                        ],
                      });
                    }
                  }
                });
              }
            }
          });
        });
      });

      this.dataSource = this.temp;

      if (this.temp.length !== 0) {
        this.parentCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          data._results.forEach((element, index) => {
            element.checked = true;

            if (index == data._results.length - 1) {
              this.cdr.detectChanges();
            }
          });
        });

        this.nestedCheckboxes.changes.pipe(take(1)).subscribe((nestdata) => {
          nestdata._results.forEach((nestelement, index) => {
            nestelement.checked = true;
            if (index == nestdata._results.length - 1) {
              this.cdr.detectChanges();
            }
          });
        });

        this.dnestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
          this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              data._results.forEach((element, index) => {
                if (
                  this.savedsubsubCategory.get(element.name) === element.name
                ) {
                  element.checked = true;
                }
                if (index == data._results.length - 1) {
                  this.cdr.detectChanges();
                }
              });
            });
          });
        });

        this.parentRadios.changes.pipe(take(1)).subscribe((data) => {
          setTimeout(() => {
            data._results.forEach((button, index) => {
              if (this.parentRadio.get(button.name) === button.value) {
                button.checked = true;
              }
              if (index == data._results.length - 1) {
                this.cdr.detectChanges();
              }
            });
          });
        });

        this.subRadios.changes.pipe(take(1)).subscribe((data) => {
          this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              data._results.forEach((button, index) => {
                if (this.subchildRadio.get(button.name) === button.value) {
                  button.checked = true;
                }
                if (index == data._results.length - 1) {
                  this.cdr.detectChanges();
                }
              });
            });
          });
        });

        this.subsubRadios.changes.pipe(take(1)).subscribe((data) => {
          this._ngZone.runOutsideAngular(() => {
            this._ngZone.runOutsideAngular(() => {
              setTimeout(() => {
                data._results.forEach((button, index) => {
                  if (this.subsubRadio.get(button.name) === button.value) {
                    button.checked = true;
                  }
                  if (index == data._results.length - 1) {
                    this.cdr.detectChanges();
                  }
                });
              });
            });
          });
        });
      }
    }
  }


  recursiveFilter(obj, label: string, labelLower = label.toLowerCase()) {
    return obj.filter((item) => {
      if (item.items) item.items = this.recursiveFilter(item.items, label, labelLower);
      return item.label?.toLowerCase().includes(labelLower) || item.items?.length;
    });
  }

  // --------------------------- When Parent Checkbox is clicked ---------------------------------------

  onParentClick(event, data): void {
    this.changedCategoryOrNot = true;
    this.data.onParentClick(
      event,
      data,
      this.categoryCards,
      this.savedparent,
      this.savedsubCategory,
      this.savedsubsubCategory,
      this.parentRadio,
      this.nestedCheckboxes,
      this.dnestedCheckboxes
    );

    this.parentRadios.changes.pipe(take(1)).subscribe((data1) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data1._results.forEach((button, index) => {
            if (this.parentRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            if (index == data1._results.length - 1) {
              this.cdr.detectChanges();
            }

          });
        });
      });
    });
    if (this.catchAllCategory && this.catchAllCategory != data.categoryID && this.ticketOrMentionCategoryMap) {
      if (
        this.ticketOrMentionCategoryMap.some(
          (obj) => obj.id == Number(this.catchAllCategory)
        )
      ) {
        const findRemovedCard = this.ticketOrMentionCategoryMap.find(
          (obj) => obj.id == Number(this.catchAllCategory)
        );
        this.removeCatchAllCategoryCard(findRemovedCard);
      }
    }
  }

  removeCatchAllCategoryCard(findRemovedCard) {
    for (let ele of this.parentCheckboxes['_results']) {
      if (ele.name === findRemovedCard.name + findRemovedCard.id) {
        ele.checked = false;
        let value = this.dataSource.find((cat) => cat.categoryID === this.catchAllCategory);
        if(findRemovedCard.id === this.catchAllCategory && value) {
          this.onParentClick(ele, value);
        }
        this.cdr.detectChanges();
        break;
      }
    }

    this.data.remove(
      findRemovedCard,
      this.cdr,
      this.parentCheckboxes,
      this.nestedCheckboxes,
      this.categoryCards,
      this.savedparent,
      this.savedsubCategory,
      this.savedsubsubCategory,
      true
    );

  }

  /*----------------------- When NestedCheckbox is clicked-----------------------*/

  onchildClick(subdata, child, data, category, parentCheckBox): void {
    this.changedCategoryOrNot = true;
    if (child.checked && !parentCheckBox.checked) {
      parentCheckBox.checked = true;
      this.onParentClick(parentCheckBox, data);
    }
    this.data.onChildClick(
      subdata,
      child,
      data,
      category,
      this.categoryCards,
      this.savedsubCategory,
      this.savedparent,
      this.savedsubsubCategory,
      this.parentRadio,
      this.subchildRadio,
      this.subsubRadio,
      this.cdr,
      this.dnestedCheckboxes
    );

    this.parentRadios.changes.pipe(take(1)).subscribe((data1) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data1._results.forEach((button, index) => {
            if (this.parentRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            if (index == data1._results.length - 1) {
              this.cdr.detectChanges();
            }
          });
        });
      });
    });

    this.subRadios.changes.pipe(take(1)).subscribe((data1) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data1._results.forEach((button, index) => {
            if (this.subchildRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            if (index == data1._results.length - 1) {
              this.cdr.detectChanges();
            }
          });
        });
      });
    });
  }

  // ------------------------ When subNestedCheckbox is clicked-------------------------------------

  ondNestedChildClick(dsubdata, child, data, name, parentdata, childCheckBox, parentCheckBox): void {
    this.changedCategoryOrNot = true;
    if (child.checked && !childCheckBox.checked) {
      childCheckBox.checked = true;
      this.onchildClick(data, childCheckBox, parentdata, parentdata.category, parentCheckBox);
    }
    this.data.ondnested(
      dsubdata,
      child,
      data,
      name,
      parentdata,
      this.categoryCards,
      this.savedsubsubCategory,
      this.savedsubCategory,
      this.savedparent,
      this.subsubRadio,
      this.cdr
    );

    this.subsubRadios.changes.pipe(take(1)).subscribe((data1) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data1._results.forEach((button, index) => {
            if (this.subsubRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            if (index == data1._results.length - 1) {
              this.cdr.detectChanges();
            }
          });
        });
      });
    });
  }

  // -------------------------------- When radio buttons are clicked ----------------------------------
  radio(event, event1, type, Data): void {
    this.data.radio(
      event,
      event1,
      type,
      this.categoryCards,
      Data,
      this.savedparent,
      this.parentRadio,
      this.subchildRadio,
      this.subsubRadio
    );
    this.cdr.detectChanges();

  }

              // ------------------------------------Select the default
              // categories--------------------------------------------

  fillCategoryMap(): void {
    let categoryData, makeactionableEnabled;

    makeactionableEnabled = this.currentUser?.data?.user?.actionButton?.makeNonactionableToActionableEnabled;
    if(this._postDetailService.categoryType === 'ticketCategory') {
  // this.taggingParameters.isTicketCategoryEnabled = 2;
  this.taggingParameters.isTicket = true;
  // this.taggingParameters.isAllMentionUnderTicketId = false;
  // this.taggingParameters.tagAlltagIds = false;
  // this.categoryType = this._postDetailService.categoryType;
  if (this.manualTicketData && this.manualTicketData.isFromManual) {
    this.showAllMentionCheckBox = false;
    const currentCategory = this.treeData.filter(
      (obj) =>
        obj.categoryID === Number(this.manualTicketData.catchAllCategory)
    );
    if (currentCategory && currentCategory.length > 0) {
      const currentCategoryMap: TaggingCategory[] = [];
      const category: TaggingCategory = {
        id: currentCategory[0].categoryID,
        isTicket: false,
        name: currentCategory[0].category,
        sentiment: 0,
        subCategories: [],
        upperCategoryID: 0,
      };
      currentCategoryMap.push(category);
      categoryData = currentCategoryMap;
    }

    if (this._postDetailService?.postObj?.ticketInfo?.ticketCategoryMap && this.baseData?.voipSetup)
    {
     categoryData = this._postDetailService.postObj.ticketInfo.ticketCategoryMap;
    }

  } else {
    if (!this._postDetailService.isBulk) {
      categoryData =
        this._postDetailService.postObj.ticketInfo.ticketCategoryMap;
    }
  }

  // console.log('postObject', categoryData);

  if (
    this._postDetailService.postObj.ticketInfo.ticketUpperCategory &&
    this._postDetailService.postObj.ticketInfo.ticketUpperCategory.name
  ) {
    this.selectedUpper =
      this._postDetailService.postObj.ticketInfo.ticketUpperCategory.name;
    this.DefaultSelected =
      this._postDetailService.postObj.ticketInfo.ticketUpperCategory.name;
    this.selectedUpperCategoryDetails = this._postDetailService.postObj.ticketInfo.ticketUpperCategory

  }
  this.ticketOrMentionCategoryMap =
    this._postDetailService.postObj.ticketInfo.ticketCategoryMap;
} else {
  // this.taggingParameters.isAllMentionUnderTicketId = false;
  // this.taggingParameters.tagAlltagIds = false;
  // this.taggingParameters.isTicketCategoryEnabled = 0;
  this.taggingParameters.isTicket = false;
  this.showAllMentionCheckBox = true;
  this.categoryType = this._postDetailService.categoryType;
  if (!this._postDetailService.isBulk) {
    // if (this._postDetailService.categoryType !== 'mentionCategory'){
      categoryData = this._postDetailService.postObj.categoryMap;
      this.ticketOrMentionCategoryMap =
        this._postDetailService.postObj.categoryMap;
    // }
  }
  if (
    this._postDetailService.postObj.upperCategory &&
    this._postDetailService.postObj.upperCategory.name !== null && !this._postDetailService.isBulk
  ) {
    this.selectedUpper = this._postDetailService.postObj.upperCategory.name;
    this.selectedUpperCategoryDetails = this._postDetailService.postObj.upperCategory
    this.DefaultSelected =
      this._postDetailService.postObj.upperCategory.name;
  }
}

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      if (this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
        this.showAllMentionCheckBox=false
        this.showsettoticket=false;
      }
      makeactionableEnabled = false;
    }

if (categoryData) {
  categoryData.forEach((data) => {
    this.savedparent.set(data.name + data.id, data.name + data.id);
    let Sentiment;
    if (data.sentiment === 0) {
      this.parentRadio.set(data.name + + data.id, '0');
      Sentiment = 0;
    }
    if (data.sentiment === 1) {
      this.parentRadio.set(data.name + + data.id, '1');
      Sentiment = 1;
    }
    if (data.sentiment === 2) {
      this.parentRadio.set(data.name + + data.id, '2');
      Sentiment = 2;
    }

    this.categoryCards.push({
      id: data.id,
      name: data.name,
      sentiment: Sentiment,
      subCategories: [],
    });
    Sentiment = null;

    const pLength = this.categoryCards.length;
    data.subCategories.forEach((subData) => {
      this.savedsubCategory.set(subData.name + subData.id, subData.name + subData.id);
      this.parentRadio.delete(data.name + subData.id);
      if (subData.sentiment === 0) {
        this.subchildRadio.set(subData.name+ subData.id, '0');
        Sentiment = 0;
      }
      if (subData.sentiment === 1) {
        this.subchildRadio.set(subData.name+ subData.id, '1');
        Sentiment = 1;
      }
      if (subData.sentiment === 2) {
        this.subchildRadio.set(subData.name+ subData.id, '2');
        Sentiment = 2;
      }

      this.categoryCards[pLength - 1].subCategories.push({
        id: subData.id,
        name: subData.name,
        sentiment: Sentiment,
        subSubCategories: [],
      });

      const Length = this.categoryCards[pLength - 1].subCategories.length;

      Sentiment = '';

      subData.subSubCategories.forEach((subsubData) => {
        this.savedsubsubCategory.set(subsubData.name + subsubData.id, subsubData.name + subsubData.id);
        this.subchildRadio.delete(subData.name + subsubData.id);

        if (subsubData.sentiment === 0) {
          this.subsubRadio.set(subsubData.name + subsubData.id, '0');
          Sentiment = 0;
        }
        if (subsubData.sentiment === 1) {
          this.subsubRadio.set(subsubData.name + subsubData.id, '1');
          Sentiment = 1;
        }
        if (subsubData.sentiment === 2) {
          this.subsubRadio.set(subsubData.name + subsubData.id, '2');
          Sentiment = 2;
        }

        // console.log(this._postDetailService.postObj.ticketInfo);
        this.categoryCards[pLength - 1].subCategories[
          Length - 1
        ].subSubCategories.push({
          id: subsubData.id,
          name: subsubData.name,
          sentiment: Sentiment,
        });
      });
    });
  });
}

this.treeData.forEach((data) => {
  let found = false;

  if (this.savedparent.get(data.category + data.categoryID)) {
    data.sentiment = '';
  } else {
    data.sentiment = null;
  }

  data.depatments.forEach((subData) => {
    if (this.savedsubCategory.get(subData.departmentName + subData.departmentID) && !found) {
      found = true;
      data.sentiment = null;
      subData.departmentSentiment = '';
    }

    if (subData.subCategories) {
      subData.subCategories.forEach((subsubData) => {
        if (
          this.savedsubsubCategory.get(subsubData.subCategoryName + subsubData.subCategoryID) &&
          found
        ) {
          found = true;
          data.sentiment = null;
          subData.departmentSentiment = null;
          subsubData.subCategorySentiment = '';
        }
      });
    }

    found = false;
  });
});

this.parentCheckboxes.changes.pipe(take(1)).subscribe((data) => {
  data._results.forEach((element, index) => {
    if (this.savedparent.get(element.name) === element.name) {
      element.checked = true;
    }
    if (index == data._results.length - 1) {
      this.cdr.detectChanges();
    }
  });
});
this.nestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
  this._ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      data._results.forEach((element, index) => {
        if (this.savedsubCategory.get(element.name) === element.name) {
          element.checked = true;
        }
        if (index == data._results.length - 1) {
          this.cdr.detectChanges();
        }
      });
    });
  });
});

this.dnestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
  this._ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      data._results.forEach((element, index) => {
        if (this.savedsubsubCategory.get(element.name) === element.name) {
          element.checked = true;
        }
        if (index == data._results.length - 1) {
          this.cdr.detectChanges();
        }
      });
    });
  });
});

this.parentRadios.changes.pipe(take(1)).subscribe((data) => {
  this._ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      data._results.forEach((button, index) => {
        if (this.parentRadio.get(button.name) === button.value) {
          button.checked = true;
        }
        if (index == data._results.length - 1) {
          this.cdr.detectChanges();
        }
      });
      console.log('setTimeout called');
    });
  });
});

this.subRadios.changes.pipe(take(1)).subscribe((data) => {
  setTimeout(() => {
    data._results.forEach((button, index) => {
      if (this.subchildRadio.get(button.name) === button.value) {
        button.checked = true;
      }
      if (index == data._results.length - 1) {
        this.cdr.detectChanges();
      }
    });
  });
});

this.subsubRadios.changes.pipe(take(1)).subscribe((data) => {
  this._ngZone.runOutsideAngular(() => {
    setTimeout(() => {
      data._results.forEach((button, index) => {
        if (this.subsubRadio.get(button.name) === button.value) {
          button.checked = true;
        }
        if (index == data._results.length - 1) {
          this.cdr.detectChanges();
        }
      });
    });
  });
});
    if (!this.postObjData.isActionable && !this.postObjData.isBrandPost && makeactionableEnabled) {
      this.showAllMentionCheckBox = false;
      this.setallmentionunderticket = false;
    }
    
    this.cdr.detectChanges();
            }

// ----------------------------------------------Tagging Request Parameters-------------------------------

TaggingRequestParameters(checked, name): void {
  //this.data.taggingRequestParametres(event, name, this.taggingParameters);
  if(name === 'setallmentionunderticket') {
  if (checked) {
    this.setallmentionunderticket = true;
    localStorage.setItem(
      'setallmentionunderticket' + this.currentUser.data.user.userId,
      '1'
    );
  } else {
    this.setallmentionunderticket = false;
    localStorage.setItem(
      'setallmentionunderticket' + this.currentUser.data.user.userId,
      '0'
    );
  }
}

if (name === 'setToTicket') {
  if (checked) {
    this.setToTicket = true;
    localStorage.setItem(
      'setToTicket' + this.currentUser.data.user.userId,
      '1'
    );
  } else {
    this.setToTicket = false;
    localStorage.setItem(
      'setToTicket' + this.currentUser.data.user.userId,
      '0'
    );
  }
}

if (name === 'settagTweet') {
  if (checked) {
    this.settagTweet = true;
    localStorage.setItem(
      'settagTweet' + this.currentUser.data.user.userId,
      '1'
    );
  } else {
    this.settagTweet = false;
    localStorage.setItem(
      'settagTweet' + this.currentUser.data.user.userId,
      '0'
    );
  }
}
this.cdr.detectChanges();
              }

/*-------------------------For closing the popup ---------------------------------*/

// ------------------------- When upper category is selected ------------------------------

upperSelect(event, categoryMap?:boolean): void {
  this.previousUpperCategory = true;
  this.selectedUpper = event.name;
  this.selectedUpperCategoryDetails = event;
  if(categoryMap){
    let sentiment = 0;
    if (this.categoryCards && this.categoryCards.length) {
      if (this.selectedUpper && this.aiUpperCategoryListWithIcon) {
        sentiment = this.aiUpperCategoryListWithIcon.find(
          (category) => (category?.name).toLocaleLowerCase() === (this.selectedUpper).toLocaleLowerCase()
        )?.sentiment || 0;
      }
      if (sentiment != 0) {
        this.categoryCards.forEach((card) => {
          card.sentiment = sentiment;
          this.parentRadio.set(card.name + card.id, sentiment.toString());
          if (card?.subCategories && card?.subCategories?.length) {
            card.subCategories.forEach((subCategory) => {
              subCategory.sentiment = sentiment;
              this.subchildRadio.set(subCategory.name + subCategory.id, sentiment.toString());
              if (subCategory?.subSubCategories && subCategory?.subSubCategories?.length) {
                subCategory.subSubCategories.forEach((subSubCategory) => {
                  subSubCategory.sentiment = sentiment;
                  this.subsubRadio.set(subSubCategory.name + subSubCategory.id, sentiment.toString());
                });
              }
            });
          }
        });
        this.updateRadioButtonsDirect(sentiment);
      }
    }
  }
  this.cdr.detectChanges();
  // this._postDetailService.postObj.SelectedUpperCategory = event;
}

private updateRadioButtonsDirect(sentiment: number): void {
  this._ngZone.run(() => {
    setTimeout(() => {
      if (this.parentRadios && this.parentRadios.length > 0) {
        this.parentRadios.forEach((radioButton, index) => {
          const categoryKey = radioButton.name; // This should be categoryName + categoryID
          const isSelected = this.parentRadio.has(categoryKey);
          if (isSelected && radioButton.value === sentiment.toString()) {
            radioButton.checked = true;
            try {
              if (radioButton._inputElement && radioButton._inputElement.nativeElement) {
                radioButton._inputElement.nativeElement.dispatchEvent(new Event('change'));
              }
            } catch (e) {
              console.log('Could not trigger change event for parent radio');
            }
          } else {
            if (isSelected && radioButton.value !== sentiment.toString()) {
              radioButton.checked = false;
            }
          }
        });
      }
      if (this.subRadios && this.subRadios.length > 0) {
        this.subRadios.forEach((radioButton, index) => {
          const categoryKey = radioButton.name;
          const isSelected = this.subchildRadio.has(categoryKey);
          if (isSelected && radioButton.value === sentiment.toString()) {
            radioButton.checked = true;
            try {
              if (radioButton._inputElement && radioButton._inputElement.nativeElement) {
                radioButton._inputElement.nativeElement.dispatchEvent(new Event('change'));
              }
            } catch (e) {
              console.log('Could not trigger change event for sub radio');
            }
          } else {
            if (isSelected && radioButton.value !== sentiment.toString()) {
              radioButton.checked = false;
            }
          }
        });
      }
      if (this.subsubRadios && this.subsubRadios.length > 0) {
        this.subsubRadios.forEach((radioButton, index) => {
          
          const categoryKey = radioButton.name;
          const isSelected = this.subsubRadio.has(categoryKey);
          
          if (isSelected && radioButton.value === sentiment.toString()) {
            radioButton.checked = true;
            try {
              if (radioButton._inputElement && radioButton._inputElement.nativeElement) {
                radioButton._inputElement.nativeElement.dispatchEvent(new Event('change'));
              }
            } catch (e) {
              console.log('Could not trigger change event for subsub radio');
            }
          } else {
            if (isSelected && radioButton.value !== sentiment.toString()) {
              radioButton.checked = false;
            }
          }
        });
      }
      this.cdr.detectChanges();
    }, 0);
  });
}
// ---------------------------Clearing All Data--------------------------------------------------

uncheckAll(): void {
  this.parentCheckboxes.forEach((element, index) => {
    element.checked = false;
    if (index == this.parentCheckboxes.length - 1) {
      this.cdr.detectChanges();
    }
  });

  this.nestedCheckboxes.forEach((element, index) => {
    element.checked = false;
    if (index == this.nestedCheckboxes.length - 1) {
      this.cdr.detectChanges();
    }
  });

  this.dnestedCheckboxes.forEach((element, index) => {
    element.checked = false;
    if (index == this.dnestedCheckboxes.length - 1) {
      this.cdr.detectChanges();
    }
  });
}

// ---------------------------------- For removing the cards---------------------------------

removeCard(event): void {
  this.data.remove(
    event,
    this.cdr,
    this.parentCheckboxes,
    this.nestedCheckboxes,
    this.categoryCards,
    this.savedparent,
    this.savedsubCategory,
    this.savedsubsubCategory,
    false
  );
  this.cdr.detectChanges();

}

// ---------------------------------- For removing the upper category-----------------------------------

removeUpperCate(): void {
  this.selectedUpper = '';
  this.DefaultSelected = 'default';
  this.selectedUpperCategoryDetails = {
    brandInfo: null,
    id: 0,
    name: null,
    userID: null,
  };
  this.cdr.detectChanges();

}

// -------------------------Delete All the saved data--------------------------------------------------

deleteAllData(): void {
  this.savedsubsubCategory.clear();
  this.savedparent.clear();
  this.savedsubCategory.clear();
  this.parentRadio.clear();
  this.subchildRadio.clear();
  this.subsubRadio.clear();
  this.categoryCards = [];
  this.selectedUpper = '';
  this.DefaultSelected = 'default';
  this.cdr.detectChanges();
  this.selectedUpperCategoryDetails =
    { id: 0, name: null, userID: null, brandInfo: null }
}

// ---------------------------------------Clear/Refresh all the data------------------------------------

clearall(): void {
  this.deleteAllData();
  this.uncheckAll();
}

// -------------------------------------Submit data to Api-------------------------------------------

Submit(): void {
  let sentiment = 0;
  let CategoryModifyType = 1;
  if (this.previousUpperCategory) {
    CategoryModifyType = this.changedCategoryOrNot ? 3 : 2;
  }
  this.taggingParameters.CategoryModifyType = CategoryModifyType;

  let isTwitterPost: boolean = this._postDetailService?.postObj?.channelGroup == ChannelGroup.Twitter;
  if (this.categoryCards && this.categoryCards.length && this.onlyUpperCategory){
    if (this.selectedUpper && this.aiUpperCategoryListWithIcon){
      sentiment = this.aiUpperCategoryListWithIcon.find(
        (category) => (category?.name).toLocaleLowerCase() === (this.selectedUpper).toLocaleLowerCase()
      )?.sentiment || 0;
    }
    if (sentiment != 0){
      this.categoryCards.forEach((card) => {
        card.sentiment = sentiment;
        if (card?.subCategories && card?.subCategories?.length) {
          card.subCategories.forEach((subCategory) => {
            subCategory.sentiment = sentiment;
            if (subCategory?.subSubCategories && subCategory?.subSubCategories?.length) {
              subCategory.subSubCategories.forEach((subSubCategory) => {
                subSubCategory.sentiment = sentiment;
              });
            }
          });
        }
      });
    }
  }

  if(!this.data.isAnySentimentNull(this.categoryCards)) {
  this._snackBar.openFromComponent(CustomSnackbarComponent, {
    duration: 5000,
    data: {
      type: notificationType.Warn,
      message: this.translate.instant('Select-Category-with-sentiment'),
    },
  });
  return;
}

  if(this._postDetailService.isBulkQualified && this.clickhouseEnabled)
{
  this.openBulkWarningPopup();
  return;
}

let isTicket = false;
if (this._postDetailService.pagetype === PostsType.Tickets) {
  isTicket = true;
}

if (this._postDetailService.categoryType === 'ticketCategory') {
  if (this.selectedUpperCategoryDetails) {
    this._postDetailService.postObj.ticketInfo.ticketUpperCategory =
      this.selectedUpperCategoryDetails;
  }
} else {
  if (this.selectedUpperCategoryDetails) {
    this._postDetailService.postObj.upperCategory =
      this.selectedUpperCategoryDetails;
  }
}
if (this._postDetailService.isBulk) {
  if(this._postDetailService.isBulkQualified)
  {

  }else{
  const categoryTagDetails = [];
  const chkTicket = this._ticketService.bulkMentionChecked.filter(
    (obj) => obj.guid === this._navigationService.currentSelectedTab.guid
  );
    let totalMentions=0
  for (const checkedticket of chkTicket) {
    let commentcount = 0;
    let shareCount = 0;
    if (checkedticket.mention.mentionMetadata.commentCount) {
      commentcount = checkedticket.mention.mentionMetadata.commentCount;
    }
    if (checkedticket.mention.mentionMetadata.shareCount) {
      shareCount = checkedticket.mention.mentionMetadata.shareCount;
    }
    const properties: CategoryTagDetails = {
      tagID: checkedticket.mention.tagID,
      channelGroup: checkedticket.mention.channelGroup,
      shareCount,
      commentCount: commentcount,
      socialID: checkedticket.mention.socialIdForunseenCount,
      retweetedStatusID: checkedticket.mention.retweetedStatusID,
      brandID: checkedticket.mention.brandInfo.brandID,
      caseID: checkedticket.mention.ticketInfo.ticketID,
      mentionID: checkedticket.mention.mentionID,
    };

    // Conditionally add uniqueId and createdDate for groupView
    if (this._postDetailService.groupedView && !this.taggingParameters.isChild) {
      properties.uniqueID = checkedticket.mention.ticketInfo.uniqueId; // Replace with actual unique ID
      properties.createdDate = checkedticket.mention.ticketInfo.createdDate; // Set to current date or specify a date
    }
    categoryTagDetails.push(properties);
    totalMentions+= checkedticket.mention.mentionMetadata.childmentioncount+1;
  }

  let postObjectcopy = JSON.parse(
    JSON.stringify(this._postDetailService.postObj)
  );
  postObjectcopy.categoryMap = this.categoryCards;
  postObjectcopy = this.mapLocobuzzEntity.mapMention(postObjectcopy);
  this.SetTaggingParams();
  this.taggingParameters.source = postObjectcopy;

  this.taggingParameters.tagIDs = categoryTagDetails;
  this.taggingParameters.isGroupView=this._postDetailService.groupedView
  this.taggingParameters.isChild = this._postDetailService.childOrParentFlag

    if (this.taggingParameters.isGroupView && !this.taggingParameters.isChild) {
      let dialogData = new AlertDialogModel(
        this.translate.instant('Changing-the-category-or-sentiment'),
        '',
        'Update category',
        'Cancel',
      );
      dialogData.isGroupview = true
      const dialogRef = this.dialog.open(AlertPopupComponent, {
        disableClose: true,
        autoFocus: false,
        data: dialogData,
      });
      dialogRef.componentInstance.fullThreadChecked.subscribe((checked) => {
        this.isFullThreadChecked = checked;
      });
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult) {
          if (!this.isFullThreadChecked) {
            this.taggingParameters.IsDateRange = true
            this.taggingParameters.StartDateEpoch = this.filterObj?.startDateEpoch
            this.taggingParameters.EndDateEpoch = this.filterObj?.endDateEpoch
          } else {
            this.taggingParameters.IsDateRange = false
            this.taggingParameters.StartDateEpoch = null
            this.taggingParameters.EndDateEpoch = null
          }
          this.loading = true;

          const obj = {
            param: this.keyObj || {}, // Fallback to an empty object if keyObj is null/undefined
            operation: 0,
            TagCategory: this.categoryCards,
            upperCategory: this.selectedUpperCategoryDetails ? this.selectedUpperCategoryDetails : null,
            mentionCount: this._postDetailService.mentionCount,
            tagChildren: this.settagTweet,
          }
          if (this._postDetailService.isBulkQualified) {
          this.data.saveBulkCategoryDataV2(
            this.taggingParameters,
            this._postDetailService,
            this.categoryCards,
            this._snackBar,
            this.dialogRef,
            this._postDetailService.pagetype,
            obj,
            totalMentions,
          );
        }
          this.loading = true;
          this.data.saveBulkCategoryData(
            this.taggingParameters,
            this._postDetailService,
            this.categoryCards,
            this._snackBar,
            this.dialogRef,
            this._postDetailService.pagetype,
            totalMentions
          );
          this.loading = false;
        }
      else{
        return
      }
    })
    }
  //   if (this.taggingParameters.isGroupView) {
  //     let dialogData = new AlertDialogModel(
  //       'Changing the category  or sentiment will effect all the related mentions in this duration',
  //       '',
  //       'Update category',
  //       'Cancel',
  //     );
  //     dialogData.isGroupview = true
  //     const dialogRef = this.dialog.open(AlertPopupComponent, {
  //       disableClose: true,
  //       autoFocus: false,
  //       data: dialogData,
  //     });
  //     dialogRef.componentInstance.fullThreadChecked.subscribe((checked) => {
  //       this.isFullThreadChecked = checked;
  //     });
  //     dialogRef.afterClosed().subscribe((dialogResult) => {
  //       if (dialogResult) {
  //         if (!this.isFullThreadChecked) {
  //           this.taggingParameters.IsDateRange = true
  //           this.taggingParameters.StartDateEpoch = this.filterObj?.startDateEpoch
  //           this.taggingParameters.EndDateEpoch = this.filterObj?.endDateEpoch
  //         } else {
  //           this.taggingParameters.IsDateRange = false
  //           this.taggingParameters.StartDateEpoch = null
  //           this.taggingParameters.EndDateEpoch = null
  //         }

  //     this.loading = true;
  //     this.data.saveBulkCategoryData(
  //       this.taggingParameters,
  //       this._postDetailService,
  //       this.categoryCards,
  //       this._snackBar,
  //       this.dialogRef,
  //       this._postDetailService.pagetype,
  //       totalMentions
  //     );
  //   }
  //   else {
  //     return
  //   }
  // })
  //   }
    if (this.taggingParameters.isGroupView && this.taggingParameters.isChild) {
      if (this.relatedMentionsFlag) {         
          this.taggingParameters.IsDateRange = true
          this.taggingParameters.StartDateEpoch = this.filterObj?.startDateEpoch
          this.taggingParameters.EndDateEpoch = this.filterObj?.endDateEpoch
        }
        else {
          this.taggingParameters.IsDateRange = false
          this.taggingParameters.StartDateEpoch = null
          this.taggingParameters.EndDateEpoch = null
        }
      
      this.loading = true;
      
      this.isBulkSelected = this._postDetailService.isBulkselected ? true : false;
      const obj = {
        param: this.keyObj || {}, // Fallback to an empty object if keyObj is null/undefined
        operation: 0,
        TagCategory: this.categoryCards,
        upperCategory: this.selectedUpperCategoryDetails ? this.selectedUpperCategoryDetails : null,
        mentionCount: this.isBulkSelected ? this._postDetailService.totalCount : this._postDetailService.mentionCount,
        tagChildren: this.settagTweet,
      }
      if (this.isBulkSelected){        
        this.data.saveBulkCategoryDataV2(
          this.taggingParameters,
          this._postDetailService,
          this.categoryCards,
          this._snackBar,
          this.dialogRef,
          this._postDetailService.pagetype,
          obj,
          totalMentions,
        );
        this.loading = false;
      }
        else{

      this.data.saveBulkCategoryData(
        this.taggingParameters,
        this._postDetailService,
        this.categoryCards,
        this._snackBar,
        this.dialogRef,
        this._postDetailService.pagetype,
        totalMentions
      );
        this.loading = false;
    }
    
  }  
    if (!this.taggingParameters.isGroupView ){
  this.loading = true;
  this.data.saveBulkCategoryData(
    this.taggingParameters,
    this._postDetailService,
    this.categoryCards,
    this._snackBar,
    this.dialogRef,
    this._postDetailService.pagetype,
    totalMentions
  );

    // code for changing on ui
    this._postDetailService.postObj.categoryMap = this.categoryCards;
    if (this.taggingParameters.isTicketCategoryEnabled === 1) {
      this._postDetailService.postObj.ticketInfo.ticketCategoryMap =
        this.categoryCards;
      this._postDetailService.postObj.ticketInfo.ticketUpperCategory = this.selectedUpperCategoryDetails ?
        this.selectedUpperCategoryDetails : {
          brandInfo: null,
          id: 0,
          name: null,
          userID: null,
        }
      this._postDetailService.postObj.upperCategory = this.selectedUpperCategoryDetails ?
        this.selectedUpperCategoryDetails : {
          brandInfo: null,
          id: 0,
          name: null,
          userID: null,
        }
      /* this._replyService.postDetailObjectChanged.next(
        this._postDetailService.postObj
      ); */
      this._replyService.postDetailObjectChangedSignal.set(
        this._postDetailService.postObj
      );
    }
    if (this.taggingParameters.isAllMentionUnderTicketId && !isTwitterPost) {
      if (
        this._postDetailService.pagetype == PostsType.Tickets ||
        this._postDetailService.pagetype == PostsType.TicketHistory
      ) {
        this._ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.next(
          {
            postObj: this._postDetailService.postObj,
            type: 'Mention',
            categoryCards: this.categoryCards,
            upperCategories: this.selectedUpperCategoryDetails
          }
        );
      }
      if (this._postDetailService.pagetype == PostsType.Mentions) {
        this._ticketService.mentionTabCategoryChanges.next({
          postObj: this._postDetailService.postObj,
          type: 'Mention',
          categoryCards: this.categoryCards,
          upperCategories: this.selectedUpperCategoryDetails
        });
      }
    } else {
      this._ticketService.ticketcategoryMapChange.next(
        { BaseMention: this._postDetailService.postObj, categoryType: this._postDetailService.categoryType }
      );
    }
        // end of code

}
  }
  // this.dialogRef.close({ categoryData: this.categoryCards });
} else if (this.manualTicketData.isFromManual) {
  const obj = {
    categorydata: this.categoryCards,
    uppercategory: this.selectedUpperCategoryDetails,
  };

  this._ticketService.manualTicketData.next(obj);
  this.dialogRef.close(this.categoryCards);
} else {
  let postObjectcopy = JSON.parse(
    JSON.stringify(this._postDetailService.postObj)
  );
  postObjectcopy.categoryMap = this.categoryCards;

  postObjectcopy = this.mapLocobuzzEntity.mapMention(postObjectcopy);

  if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
    if (this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
      delete postObjectcopy.tagID;
      postObjectcopy.StrTagID = this._postDetailService.postObj.tagID
      postObjectcopy.strTagID = this._postDetailService.postObj.tagID
    }
  }
  this.SetTaggingParams();
  this.taggingParameters.source = postObjectcopy;

  if (this._postDetailService.crmFlag) {
    this.taggingParameters.source['srDetails'] = null;
  }
  // this.taggingParameters.Notes= this.makeCategoryLog(this.categoryCards)
  this.taggingParameters.isGroupView = this._postDetailService.groupedView
  this.taggingParameters.isChild = this._postDetailService.childOrParentFlag
  if (this.taggingParameters.isGroupView && !this.taggingParameters.isChild) {
    let dialogData = new AlertDialogModel(
      this.translate.instant('Changing-the-category-or-sentiment'),
      '',
      'Update category',
      'Cancel',
    );
    dialogData.isGroupview = true
    const dialogRef = this.dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });
    dialogRef.componentInstance.fullThreadChecked.subscribe((checked) => {
      this.isFullThreadChecked = checked;
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult){

        // code for changing on ui
        this._postDetailService.postObj.categoryMap = this.categoryCards;
    if (this.taggingParameters.isTicketCategoryEnabled === 1) {
      this._postDetailService.postObj.ticketInfo.ticketCategoryMap =
        this.categoryCards;
      this._postDetailService.postObj.ticketInfo.ticketUpperCategory = this.selectedUpperCategoryDetails ?
        this.selectedUpperCategoryDetails : {
          brandInfo: null,
          id: 0,
          name: null,
          userID: null,
        }
      this._postDetailService.postObj.upperCategory = this.selectedUpperCategoryDetails ?
        this.selectedUpperCategoryDetails : {
          brandInfo: null,
          id: 0,
          name: null,
          userID: null,
        }
      /* this._replyService.postDetailObjectChanged.next(
        this._postDetailService.postObj
      ); */
      this._replyService.postDetailObjectChangedSignal.set(
        this._postDetailService.postObj
      );
    }
    if (this.taggingParameters.isAllMentionUnderTicketId && !isTwitterPost) {
      if (
        this._postDetailService.pagetype == PostsType.Tickets ||
        this._postDetailService.pagetype == PostsType.TicketHistory
      ) {
        this._ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.next(
          {
            postObj: this._postDetailService.postObj,
            type: 'Mention',
            categoryCards: this.categoryCards,
            upperCategories: this.selectedUpperCategoryDetails
          }
        );
      }
      if (this._postDetailService.pagetype == PostsType.Mentions) {
        this._ticketService.mentionTabCategoryChanges.next({
          postObj: this._postDetailService.postObj,
          type: 'Mention',
          categoryCards: this.categoryCards,
          upperCategories: this.selectedUpperCategoryDetails
        });
      }
    } else {
      this._ticketService.ticketcategoryMapChange.next(
        { BaseMention: this._postDetailService.postObj, categoryType: this._postDetailService.categoryType }
      );
    }
        // end of code
    if (!this.isFullThreadChecked) {
      this.taggingParameters.IsDateRange = true
      this.taggingParameters.StartDateEpoch = this.filterObj?.startDateEpoch
      this.taggingParameters.EndDateEpoch = this.filterObj?.endDateEpoch
    }else{
      this.taggingParameters.IsDateRange = false
      this.taggingParameters.StartDateEpoch = null
      this.taggingParameters.EndDateEpoch =null
    }
      this.loading = true;
      // this.taggingParameters.source.postSocialId = this.postObjData?.socialID;
      // this.taggingParameters.source.socialIdForunseenCount = this.postObjData?.socialID;
      // outside send socialidforunseencount itself
      if(this._postDetailService.parentComponent) {
        this.taggingParameters.source.postSocialId = this.postObjData?.socialID;
        this.taggingParameters.source.socialIdForunseenCount = this.postObjData?.socialID; // this for inside parent post
      }
      this.data.saveCategoryData(
        this.taggingParameters,
        this._postDetailService,
        this.categoryCards,
        this._snackBar,
        this.dialogRef,
        this._postDetailService.pagetype
      )
    }
    else{
      this.groupViewPopup = true;
      return
    }
  })
  }
  if (this.taggingParameters.isGroupView && this.taggingParameters.isChild){

    if (this.relatedMentionsFlag) {          //if result is null then also it is related mentions
        this.taggingParameters.IsDateRange = true
        this.taggingParameters.StartDateEpoch = this.filterObj?.startDateEpoch
        this.taggingParameters.EndDateEpoch = this.filterObj?.endDateEpoch
      }
      else {
        this.taggingParameters.IsDateRange = false
        this.taggingParameters.StartDateEpoch = null
        this.taggingParameters.EndDateEpoch = null
      }
    
    this.loading = true;
    this.data.saveCategoryData(
      this.taggingParameters,
      this._postDetailService,
      this.categoryCards,
      this._snackBar,
      this.dialogRef,
      this._postDetailService.pagetype);
  }
  if (!this.taggingParameters.isGroupView){
  this.loading = true;
  this.data.saveCategoryData(
    this.taggingParameters,
    this._postDetailService,
    this.categoryCards,
    this._snackBar,
    this.dialogRef,
    this._postDetailService.pagetype
  );}
  // this._ticketService.selectedPostList = [];
  // this._ticketService.postSelectTrigger.next(0);
  // this._ticketService.bulkMentionChecked = [];
  // console.log(taggingParameters);
  // console.log('Done');
  if (this._postDetailService.categoryType === 'ticketCategory') {
    this._postDetailService.postObj.ticketInfo.ticketCategoryMap =
      this.categoryCards;
    if (this.taggingParameters.isAllMentionUnderTicketId) {
      this._postDetailService.postObj.categoryMap = this.categoryCards;
      this._postDetailService.postObj.upperCategory = this.selectedUpperCategoryDetails;
      /* this._replyService.postDetailObjectChanged.next(
        this._postDetailService.postObj
      ); */
      this._replyService.postDetailObjectChangedSignal.set(
        this._postDetailService.postObj
      );
      if (
        this._postDetailService.pagetype == PostsType.Tickets ||
        this._postDetailService.pagetype == PostsType.TicketHistory
      ) {
        this._ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.next(
          {
            postObj: this._postDetailService.postObj,
            type: 'Ticket',
            categoryCards: this.categoryCards,
            upperCategories: this.selectedUpperCategoryDetails
          }
        );
      }
      if (this._postDetailService.pagetype == PostsType.Mentions) {
        this._ticketService.mentionTabCategoryChanges.next({
          postObj: this._postDetailService.postObj,
          type: 'Ticket',
          categoryCards: this.categoryCards,
          upperCategories: this.selectedUpperCategoryDetails
        });
      }
    } else {
      this._ticketService.ticketcategoryMapChange.next(
        { BaseMention: this._postDetailService.postObj, categoryType: this._postDetailService.categoryType }
      );
    }
  } else if (!this._postDetailService.groupedView) {
    this._postDetailService.postObj.categoryMap = this.categoryCards;
    if (this.taggingParameters.isTicketCategoryEnabled === 1) {
      this._postDetailService.postObj.ticketInfo.ticketCategoryMap =
        this.categoryCards;
      this._postDetailService.postObj.ticketInfo.ticketUpperCategory = this.selectedUpperCategoryDetails ?
        this.selectedUpperCategoryDetails : {
          brandInfo: null,
          id: 0,
          name: null,
          userID: null,
        }
      this._postDetailService.postObj.upperCategory = this.selectedUpperCategoryDetails ?
        this.selectedUpperCategoryDetails : {
          brandInfo: null,
          id: 0,
          name: null,
          userID: null,
        }
      /* this._replyService.postDetailObjectChanged.next(
        this._postDetailService.postObj
      ); */
      this._replyService.postDetailObjectChangedSignal.set(
        this._postDetailService.postObj
      );
    }
    if (this.taggingParameters.isAllMentionUnderTicketId && !isTwitterPost) {
      if (
        this._postDetailService.pagetype == PostsType.Tickets ||
        this._postDetailService.pagetype == PostsType.TicketHistory
      ) {
        this._ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.next(
          {
            postObj: this._postDetailService.postObj,
            type: 'Mention',
            categoryCards: this.categoryCards,
            upperCategories: this.selectedUpperCategoryDetails
          }
        );
      }
      if (this._postDetailService.pagetype == PostsType.Mentions) {
        this._ticketService.mentionTabCategoryChanges.next({
          postObj: this._postDetailService.postObj,
          type: 'Mention',
          categoryCards: this.categoryCards,
          upperCategories: this.selectedUpperCategoryDetails
        });
      }
    } else {
      this._ticketService.ticketcategoryMapChange.next(
        { BaseMention: this._postDetailService.postObj, categoryType: this._postDetailService.categoryType }
      );
    }
  }
  // if (this._postDetailService.groupedView)
  //   {
    // this._ticketService.updateMentionSeenUnseen.next({ tagId: postObjectcopy.StrTagID, guid: this._navigationService.currentSelectedTab.guid, seenOrUnseen: 1 });
    // this._ticketService.updateChildMentionInParentPost.next({ seenOrUnseen:  true });
    // if(this._postDetailService.parentComponent)
    //   {
    //   this._ticketService.updateChildkMentionSeenUnseen.next({ seenOrUnseen: 1, postData: this._postDetailService.postObj });
    //   this._tabService.seenUnseenTabCountUpdateObs.next({ guid: this._navigationService.currentSelectedTab.guid, count: this._postDetailService.postObj.mentionMetadata.childmentioncount+1, seenUnseen: 1 });

    //   }
// }
  this.dialogRef.close(true);
  if (this.onlyUpperCategory && sentiment != 0) {
    this._ticketService.changeUpperCategory.next(sentiment)
  } else if (!this.defaultLayout) {
    this._ticketService.changeUpperCategory.next(10)
  }
  if (!this._postDetailService.groupedView){
  this._snackBar.openFromComponent(CustomSnackbarComponent, {
    duration: 5000,
    data: {
      type: notificationType.Success,
      message: `${isTwitterPost && (this.settagTweet || this.taggingParameters.isAllMentionUnderTicketId) ?  this.translate.instant('Bulk-action-initiated') : sentiment != 0 ? this.translate.instant('Upper-category-updated-successfully') : this.translate.instant('Category-saved-successfully')}`,
    },
  });
}
}
this.cdr.detectChanges();

}

makeCategoryLog(categoryCards): { } {
  let jsonObj = {
    name: `${this.currentUser.data.user.firstName} ${this.currentUser.data.user.lastName}`,
    selectedCategories: [],
    deselectedCategories: [],
  };
  let previouslySelectedEntries = [];
  if (this._postDetailService.categoryType === 'ticketCategory') {
    previouslySelectedEntries =
      this._postDetailService.postObj.ticketInfo.ticketCategoryMap;
  } else {
    previouslySelectedEntries = this._postDetailService.postObj.categoryMap;
  }
  let deselectedEntries = [],
    selectedEntries = [];
  if (previouslySelectedEntries.length > 0) {
    selectedEntries = categoryCards.filter((obj) =>
      previouslySelectedEntries.some((catObj) => catObj.id !== obj.id)
    );
    deselectedEntries = previouslySelectedEntries.filter((obj) =>
      categoryCards.some((catObj) => catObj.id !== obj.id)
    );
  } else {
    selectedEntries = categoryCards;
  }

  if (selectedEntries.length > 0) {
    jsonObj.selectedCategories = this.getCategoryJson(selectedEntries);
  }

  if (deselectedEntries.length > 0) {
    jsonObj.deselectedCategories = this.getCategoryJson(deselectedEntries);
  }

  return jsonObj;
}

getCategoryJson(List: any[]): any[] {
  const jsonList = [];
  List.forEach((obj) => {
    const subCategoryNameList = [];
    obj.subCategories.forEach((subObj) => {
      const subSubCategoryNameList = [];
      const subCateObj = {
        subCategoryName: subObj.name,
        sentiment: subObj.sentiment,
        subSubCategoryNameList: [],
      };
      subObj.subSubCategories.forEach((subSubObj) => {
        subCateObj.subSubCategoryNameList.push({
          subSubCategoryName: subSubObj.name,
          sentiment: subSubObj.sentiment,
        });
      });
      subCategoryNameList.push(subCateObj);
    });
    jsonList.push({
      categoryName: obj.name,
      sentiment: obj.sentiment,
      subCategoryNameList,
    });
  });
  return jsonList;
}

ngDestroy(): void {
  this.deleteAllData();
}

SetTaggingParams(): void {
  if(this.categoryType === 'ticketCategory') {
  if (this.setallmentionunderticket) {
    this.taggingParameters.isAllMentionUnderTicketId =
      this.setallmentionunderticket;
    this.taggingParameters.isTicketCategoryEnabled = 3;
  } else {
    this.taggingParameters.isAllMentionUnderTicketId =
      this.setallmentionunderticket;
    this.taggingParameters.isTicketCategoryEnabled = 2;
  }
} else {
  if (this.setToTicket) {
    this.taggingParameters.isAllMentionUnderTicketId =
      this.setallmentionunderticket;
    this.taggingParameters.isTicketCategoryEnabled = 1;
  } else {
    this.taggingParameters.isAllMentionUnderTicketId =
      this.setallmentionunderticket;
    this.taggingParameters.isTicketCategoryEnabled = 0;
  }
}

this.taggingParameters.tagAlltagIds = this.settagTweet;
this.cdr.detectChanges();

              }

  openBulkWarningPopup(): void {
    const dialogRef = this.dialog.open(ClickhouseBulkPopupComponent, {
      data: {
        categoryCards:this.categoryCards,
        upperCategories:this.selectedUpperCategoryDetails,
        actionType:0
      },
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((res)=>{
      if(res && this._postDetailService.groupedView)
      {
        let dialogData = new AlertDialogModel(
          this.translate.instant('Changing-the-category-or-sentiment'),
          '',
          'Update category',
          'Cancel',
        );
        dialogData.isGroupview = true
        const dialogRef = this.dialog.open(AlertPopupComponent, {
          disableClose: true,
          autoFocus: false,
          data: dialogData,
        });
        dialogRef.componentInstance.fullThreadChecked.subscribe((checked) => {
          this.isFullThreadChecked = checked;
        });
        dialogRef.afterClosed().subscribe((dialogResult) => {
          if (dialogResult){
        const obj = {
          filter: {...this._navigationService.getFilterJsonBasedOnTabGUID(this._navigationService.currentSelectedTab.guid),
            isDaterange: !this.isFullThreadChecked,
            startDateEpoch1: !this.isFullThreadChecked ? this.filterObj?.startDateEpoch : null,
            endDateEpoch1: !this.isFullThreadChecked ? this.filterObj?.endDateEpoch : null,
          },
          operation: 0,
          TagCategory: this.categoryCards,
          UpperCategory: this.selectedUpperCategoryDetails ? this.selectedUpperCategoryDetails:null,
          mentionCount: this._postDetailService.mentionCount,
          tagChildren: this.settagTweet,
        }
       this.cdr.detectChanges();
        this._ticketService.saveBulkQualifedFilter(obj).subscribe((res) => {
          this.loading = false
          if (res?.success) {
            this._postDetailService.postObj.categoryMap=this.categoryCards
            this._postDetailService.postObj.upperCategory = this.selectedUpperCategoryDetails
            const tagIDObj = [];
            const list =[]
            this._ticketService.bulkMentionChecked.forEach(element => {
              tagIDObj.push({ tagID :element.mention.tagID})
              list.push({ Tagid: element.mention.tagID, Ismarkseen: 1 });
            });
            if (this._postDetailService.groupedView) {
            this._ticketService.updateBulkMentionSeenUnseen.next({ guid: this._navigationService?.currentSelectedTab?.guid, list: list })
            }
            this._ticketService.ticketcategoryBulkMapChange.next({
              postData: this._postDetailService.postObj,
              tagIds: tagIDObj,
            });
            this._ticketService.updateUpperCategory.next({
              TagIds: tagIDObj,
              selectedUpperCategory: this._postDetailService.postObj.upperCategory,
              ticketType: PostsType.Mentions,
              postObj: this._postDetailService.postObj,
            });
            // this._ticketService.parentbulkActionChange.next(2);
            // this._ticketService.ticketStatusChange.next(true);
          
          const genericFilter = this._navigationService.getFilterJsonBasedOnTabGUID(
            this._navigationService.currentSelectedTab.guid
          );

          if (genericFilter.filters && genericFilter.filters.length > 0) {
            if (genericFilter.filters.some((obj) => obj.name == 'TaggedBy')) {
              const TaggedBy = genericFilter.filters.find(
                (obj) => obj.name == 'TaggedBy'
              );
              if (TaggedBy.value == 1) {
                const tagIds = [];
                tagIDObj.forEach((tagObj) => {
                  tagIds.push(tagObj.tagID);
                });
                this._ticketService.updateTaggedList.next({
                  tagIDs: tagIds,
                  guid: this._navigationService.currentSelectedTab.guid,
                });
              }
            }
          }
            this.sidebarService.bulkProgressSub.next(true)
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Data-processing-initiated'),
              },
            });
          this.dialogRef.close();
        }else{
            this.loading = false
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: res.message,
              },
            });
        }
          this.cdr.detectChanges();
        }, err => {
          this.loading = false
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something went wrong'),
            },
          });
        })
      }
      else{
        return;
      }
  
       })
      } 
      // mention view bulk select all operation
      else if(res) {
        const obj = {
          filter: {
            ...this._navigationService.getFilterJsonBasedOnTabGUID(this._navigationService.currentSelectedTab.guid),
            isDaterange: !this.isFullThreadChecked,
            startDateEpoch1: !this.isFullThreadChecked ? this.filterObj?.startDateEpoch : null,
            endDateEpoch1: !this.isFullThreadChecked ? this.filterObj?.endDateEpoch : null,
          },
          operation: 0,
          TagCategory: this.categoryCards,
          UpperCategory: this.selectedUpperCategoryDetails ? this.selectedUpperCategoryDetails : null,
          mentionCount: this._postDetailService.mentionCount,
          tagChildren: this.settagTweet,
        }
        this.cdr.detectChanges();
        this._ticketService.saveBulkQualifedFilter(obj).subscribe((res) => {
          this.loading = false
          if (res?.success) {
            this._postDetailService.postObj.categoryMap = this.categoryCards
            this._postDetailService.postObj.upperCategory = this.selectedUpperCategoryDetails
            const tagIDObj = [];
            const list = []
            this._ticketService.bulkMentionChecked.forEach(element => {
              tagIDObj.push({ tagID: element.mention.tagID })
              list.push({ Tagid: element.mention.tagID, Ismarkseen: 1 });
            });
            if (this._postDetailService.groupedView) {
              this._ticketService.updateBulkMentionSeenUnseen.next({ guid: this._navigationService?.currentSelectedTab?.guid, list: list })
            }
            this._ticketService.ticketcategoryBulkMapChange.next({
              postData: this._postDetailService.postObj,
              tagIds: tagIDObj,
            });
            this._ticketService.updateUpperCategory.next({
              TagIds: tagIDObj,
              selectedUpperCategory: this._postDetailService.postObj.upperCategory,
              ticketType: PostsType.Mentions,
              postObj: this._postDetailService.postObj,
            });
            // this._ticketService.parentbulkActionChange.next(2);
            // this._ticketService.ticketStatusChange.next(true);

            const genericFilter = this._navigationService.getFilterJsonBasedOnTabGUID(
              this._navigationService.currentSelectedTab.guid
            );

            if (genericFilter.filters && genericFilter.filters.length > 0) {
              if (genericFilter.filters.some((obj) => obj.name == 'TaggedBy')) {
                const TaggedBy = genericFilter.filters.find(
                  (obj) => obj.name == 'TaggedBy'
                );
                if (TaggedBy.value == 1) {
                  const tagIds = [];
                  tagIDObj.forEach((tagObj) => {
                    tagIds.push(tagObj.tagID);
                  });
                  this._ticketService.updateTaggedList.next({
                    tagIDs: tagIds,
                    guid: this._navigationService.currentSelectedTab.guid,
                  });
                }
              }
            }
            this.sidebarService.bulkProgressSub.next(true)
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Data-processing-initiated'),
              },
            });
            this.dialogRef.close();
          } else {
            this.loading = false
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: res.message,
              },
            });
          }
          this.cdr.detectChanges();
        }, err => {
          this.loading = false
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something went wrong'),
            },
          });
        })
      }
    })
  }
  GroupView(){
    this.isGroupedView=this._postDetailService.groupedView
    this.filterObj = this._navigationService.getFilterJsonBasedOnTabGUID(
      this._navService?.currentSelectedTab?.guid);
  }
              // getCategoryConfiguration() {
              // let object = {
              // BrandID: this._postDetailService.postObj.brandInfo.brandID,
              // BrandName: this._postDetailService.postObj.brandInfo.brandFriendlyName,
              // };
              // this._accountSettngService
              // .GetCategoryConfiguration(object)
              // .subscribe((result) => {
              // if (result) {
              // const catchAllCategory = JSON.parse(
              // result.configurationJson
              // ).catchAllCategory;
              // this.catchAllCategory = catchAllCategory;
              // }
              // });
              // }
              }