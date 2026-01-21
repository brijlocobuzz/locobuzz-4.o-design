import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, signal } from '@angular/core';
import { UntypedFormArray, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { allFilterReply } from 'app/app-data/allFilterReply';
import { filterData } from 'app/app-data/filter';
import { LoginService } from 'app/authentication/services/login.service';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelImage } from 'app/core/enums/ChannelImgEnum';
import { ChannelType } from 'app/core/enums/ChannelType';
import { FilterEvents } from 'app/core/enums/FilterEvents';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import {
  BrandSettings,
  CategoryBrandReplySetting,
} from 'app/core/interfaces/BulkTicketActions';
import { FilterServiceStructure } from 'app/core/interfaces/locobuzz-navigation';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { Tab, TabEvent } from 'app/core/models/menu/Menu';
import { BrandInfo } from 'app/core/models/viewmodel/BrandInfo';
import {
  FilterBasedTab,
  GenericFilter,
} from 'app/core/models/viewmodel/GenericFilter';
import { GenericRequestParameters } from 'app/core/models/viewmodel/GenericRequestParameters';
import { MyTicketsCount } from 'app/core/models/viewmodel/TicketsCount';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { ActionStatus } from '../../shared/components/filter/filter-models/actionstatus.model';
import { AssignToList } from '../../shared/components/filter/filter-models/assign-to.model';
import {
  ApiReply,
  Brand,
} from '../../shared/components/filter/filter-models/brand-reply.model';
import {
  BrandList,
  brandSearchList,
  DefaultTabAgentSelectedBrand,
  LogicalBrand,
} from '../../shared/components/filter/filter-models/brandlist.model';
import { CategoryList } from '../../shared/components/filter/filter-models/categorylist.model';
import { ChannelList } from '../../shared/components/filter/filter-models/channelList.model';
import { Campaign } from '../../shared/components/filter/filter-models/compaign.model';
import { CountryList } from '../../shared/components/filter/filter-models/country-list.model';
import { CrmColumns } from '../../shared/components/filter/filter-models/crm-coloum.model';
import { EachFilters } from '../../shared/components/filter/filter-models/each-filter.model';
import {
  AspectEachOptions,
  EachOptions,
  ExcludeDisplay,
} from '../../shared/components/filter/filter-models/excludeDisplay.model';
import { FilterData } from '../../shared/components/filter/filter-models/filterData.model';
import { FilterFilledData } from '../../shared/components/filter/filter-models/filterFilledData.model';
import { InfluencerCategory } from '../../shared/components/filter/filter-models/influence-category.model';
import { LangaugeList } from '../../shared/components/filter/filter-models/language-list.model';
import { SocialProfile } from '../../shared/components/filter/filter-models/social-profile.model';
import { SocialProfileValue } from '../../shared/components/filter/filter-models/socialProfile.model';
import { SsreStatus } from '../../shared/components/filter/filter-models/ssrestatus.model';
import { UpperCategory } from '../../shared/components/filter/filter-models/upper-category.model';
import { PostOptionService } from '../../shared/services/post-options.service';
import { NoBrandsComponent } from '../component/no-brands/no-brands.component';
import {
  notToPass,
  notToShowInExclude,
  ticketMentionDropdown,
} from './../../app-data/filter';
import { PostsType } from './../../core/models/viewmodel/GenericFilter';
import {
  LoaderService,
  LoaderStatus,
} from './../../shared/services/loader.service';
import { FilterConfig } from './filter.config.service';
import { MainService } from './main.service';
import { LocalStorageService } from './local-storage.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from 'app/shared/components';
import { notificationType } from 'app/core/enums/notificationType';

@Injectable({
  providedIn: 'root',
})
export class FilterService implements FilterServiceStructure {
  initialFilterObj:any = {};
  filterForm = new UntypedFormGroup({});
  public _filterFilledData: FilterFilledData;
  filterData: FilterData = filterData;
  filterEmptyForm: UntypedFormGroup;

  notToPass: string[];
  notToShowInExclude: string[];

  selectedTabIndex: number = 0;
  // Exclude Filter Options and data:
  excludeOptions: Array<any>;
  allAttribute: any;
  allAttributeForAdvance: any;
  displayNameToOgName: {};

  // For Channel
  fetchedChannelData: ChannelList[];
  fetchedChannelDisplayData: {};
  fetchedChannelgroupnameid: {};
  fetchedChannelgroupidname: {};
  fetchedChanneltypenameid: {};
  fetchedChanneltypeidname: {};

  excludeDisplay: ExcludeDisplay;
  excludeFiltersForm: UntypedFormGroup;

  fetchedBrandData: BrandList[];
  voipBrandIVRData:any='';
  defaultTabAgentBrand: DefaultTabAgentSelectedBrand[];

  brandOptions: EachOptions[];
  durationsOptions: EachOptions[];
  fetchedCategoryData: CategoryList[];
  fetchedCategoryDatacategory: {};
  fetchedCategoryDatadepartment: {};
  fetchedCategoryDatasubCategory: {};
  fetchedCategoryDatacategoryidname: {};
  fetchedCategoryDatadepartmentidname: {};
  fetchedCategoryDatasubCategoryidname: {};
  fetchedUpperCategoryData: UpperCategory[];
  fetchedSocialProfile: SocialProfile[];
  fetchedAssignTo: AssignToList[];
  fetchedAssignToBrandWise: AssignToList[];
  fetchedInfluencerCategory: InfluencerCategory[];
  fetchedCrmColums: CrmColumns;
  fetchedActionStatus: ActionStatus[];
  fetchedSsreStatuses: SsreStatus[];
  fetchedLangaugeList: LangaugeList[];
  fetchedCountryList: CountryList[];
  fetchedCampaigns: Campaign[];
  genericFilter: GenericFilter;
  genericRequestParameter: GenericRequestParameters;
  durationlabel: string = 'Last Two Days';
  FilterFilledDataReply: ApiReply;
  filterCount: MyTicketsCount;
  filterBasedOnTab: FilterBasedTab[] = [];
  filterUserWithOptions: any[] = [];
  brandreplyAll: Brand[];

  filtersUniqueData: [];
  fillFilterBasicListData: any;
  selectedLocationFilterIDs = [];
  fetchedKeywordGroupNameList: any[];
  fetchedCategoryGroupData: any[];

  // API LINK
  channelConfigUrl = '/Tickets/GetChannelList';
  categoryListConfigUrl = '/Tickets/GetCategoriesList';
  brandConfigUrl = '/Tickets/GetBrandList';
  voipBrandConfigUrl ='/VOIP/GetIVRDescription'
  filterBasicConfigUrl = '/Tickets/GetFilters';
  filterBasicCrmDynamics = '/Tickets/GetCRMDynamicGetFilters';
  filterCountConfigUrl = '/Tickets/GetTicketTabsCount';
  logicalGroupConfigUrl = '/Account/GetBrandLogicalInfoMention';
  categoryGroupNameConfigUrl = '/Account/GetCategoryGroupsName';
  logicalCategoryGroupConfigUrl = '/Account/GetBrandLogicalInfoData';
  emailWhitelistConfigUrl = '/EmailActions/GetAllEmailWhiteList';

  selectedBrands: UntypedFormGroup;

  private isFetched: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(
    false
  );
  public createFilterPills = new BehaviorSubject<boolean>(false);
  firstTimeApplyButtonClicked = new BehaviorSubject<boolean>(false);
  // currentBrandSource = new BehaviorSubject<boolean>(false);
  currentBrandSourceSignal = signal<boolean>(false);
  currentBrandListFirstCall = new BehaviorSubject<boolean>(false);
  // filterTabSource = new Subject<Tab>();
  filterTabSourceSignal = signal<any>(null);
  saveAndApply = false;
  // currentCountData = new Subject<any>();
  currentCountDataSignal = signal<any>(null);
  ascDescFilterOpt = new BehaviorSubject<any>(null);
  setSearch = new BehaviorSubject<any>(null);
  closeFilterModal = new BehaviorSubject<any>(null);
  // to indicate which filter to call based on tabs
  // filterTab = new BehaviorSubject<TabEvent>(null);
  filterTabSignal = signal<TabEvent>(null);
  filterApiSuccessFull = new BehaviorSubject<boolean>(false);
  categoryBrandReplySetting: BrandSettings[];
  // currentUser: AuthUser;
  filterResetRecheckList = new BehaviorSubject<boolean>(false);
  filterUpdateObs = new BehaviorSubject<any>({});
  fiterMultiSelectReverseObs = new Subject<string>();
  filterSliderReverseObs = new BehaviorSubject<any>(null);
  filterSliderResetReverseObs = new Subject<any>();
  filterTreeCheckListReverseOBs = new Subject<any>();
  filterMatAutoListReverseObs = new Subject<any>();
  filterResetValueBasedOnJsonObs = new BehaviorSubject<any>(null);
  advancedFilterResetObs = new BehaviorSubject<boolean>(false);
  filterAssignedToResetObs = new Subject<any>();
  setSelectedAssignToFilter = new BehaviorSubject<any>(null);
  filterResetCategoryTreeCheckList = new Subject<any>();
  resetInputTreeSearch = new BehaviorSubject<boolean>(false);
  resetInputAutoCompleteSearch = new BehaviorSubject<boolean>(false);
  ticketAboutToBreachedObs = new BehaviorSubject<any>(null);
  // removeAllAppliedFiltersObs = new BehaviorSubject<any>(null);
  removeAllAppliedFiltersObsSignal = signal<any>(null);
  filterFirstTimeDataCount = new BehaviorSubject<any>(null);
  setHighlightedMentionItem = new BehaviorSubject<any>(null);
  filterAssignedToResetOptions = new BehaviorSubject<any>(null);
  ressetInitialState = new BehaviorSubject<any>({name:null});
  scrollEventFilter = new BehaviorSubject<any>(null);
  // setTicketTypeObs = new Subject<any>();
  setTicketTypeObsSignal = signal<any>(null);

  selectPillValueDropDown = new Subject<any>();
  dateTimeUpdateObs = new Subject<any>();
  setPills = new BehaviorSubject<boolean>(false);
  ugcCategoryListChange = new Subject<any>();
  setTicketAboutToBreached = new Subject<any>();
  brandList: brandSearchList[] = [];
  brandListSearchList: brandSearchList[] = [];
  selected: { startDate: any; endDate: any };
  filtersJsonLoaded = new Subject();
  updateCategoryInTreeCheckList = new Subject<any>();
  updateMultipleSelectAfterAPIResponse = new Subject<any>();
  ssreActionStatusChangeEvent = new Subject<any>();
  categoryListObs = new Subject<any>();
  skillsList:EachOptions[]=[];
  aiIntent: EachOptions[] = [];
  locationList: any[] = [];
  locationCountry: any[] = [];
  locationCity: any[] = [];
  locationState: any[] = [];
  locationManagersList: any[] = [];
  locationTags:any[] = [];
  aspectList: AspectEachOptions[] = []
  teamNameList: EachOptions[] = []
  subRedditList: EachOptions[] = []
  flairList: EachOptions[] = []
  autherDetail = signal<any>(null);
  changeDurationPostSummaryGet = new Subject<boolean>();
  ranges = {
    Today: [moment().startOf('day'), moment().endOf('day')],
    'Last 2 Days': [
      moment().subtract(1, 'days').startOf('day'),
      moment().endOf('day'),
    ],
    'Last 7 Days': [
      moment().subtract(6, 'days').startOf('day'),
      moment().endOf('day'),
    ],
    'Last 14 Days': [
      moment().subtract(13, 'days').startOf('day'),
      moment().endOf('day'),
    ],
    'Last 30 Days': [
      moment().subtract(29, 'days').startOf('day'),
      moment().endOf('day'),
    ],
    'Last 60 Days': [
      moment().subtract(59, 'days').startOf('day'),
      moment().endOf('day'),
    ],
    'Last 90 Days': [
      moment().subtract(89, 'days').startOf('day'),
      moment().endOf('day'),  
    ],
  };
  fetchedLogicalGroupData: LogicalBrand[]=[];
  LogicalGroupsData: any;
  fetchedEmailWhitelistData: any = {};
  locationCustomColumns;
  pantipTags: any[] = [];
  updateQuickFilterInTab = new Subject<string>();

  constructor(
    private _filterConfig: FilterConfig,
    private _locobuzzEntitiesService: MaplocobuzzentitiesService,
    private _loaderService: LoaderService,
    private accountService: AccountService,
    private _postOptionService: PostOptionService,
    private _navigationService: NavigationService,
    private _http: HttpClient,
    private dialog: MatDialog,
    private _ngZone: NgZone,
    private router:Router,
    private localStorageService: LocalStorageService,
    private _snackBar: MatSnackBar,
  ) {}

  populateFilter(): void {
    const currentUser = this.localStorageService.getCurrentUserData();
    this.notToPass = notToPass;
    this.notToShowInExclude = notToShowInExclude;
    // this.accountService.currentUser$
    //   .pipe(take(1))
    //   .subscribe((user) => (this.currentUser = user));
    this.filterData.ticketsMentions.ticketsYouWantToSee.options[0].id =
      currentUser?.data?.user.userId;
    this.callAllApis();
    this.excludeFiltersForm = new UntypedFormGroup({});
    this.filterForm = this.generateForms();

    this._postOptionService.optionForm.valueChanges.subscribe(() => {
      this.getFilled(this.filterForm.value, false);
      this.ascDescFilterOpt.next(JSON.stringify(this.getGenericFilter()));
    });
  }

  generateForms(): UntypedFormGroup {
    // initializing for exclude filter
    this.excludeOptions = [];
    this.allAttribute = {};
    this.allAttributeForAdvance = {};
    this.displayNameToOgName = {};
    this.excludeDisplay = {};
    const filterForm = new UntypedFormGroup({});

    /// Dynamically creating forms according to data
    for (const key of Object.keys(this.filterData)) {
      const value = this.filterData[key];
      const formGroup = new UntypedFormGroup({});
      // filling form group
      for (const key1 of Object.keys(value)) {
        const value1 = value[key1];
        if (key1 === 'displayName') {
          continue;
        }
        // exclude Options in same forloop for time saving
        if (key !== 'brandDateDuration') {
          if (key !== 'excludeFilters') {
            if (value1.type !== 'radio') {
              if (value1.type !== 'chips-radio') {
                if (value1.type !== 'chips') {
                  if (value1.type !== 'chips1') {
                    if (this.notToShowInExclude.indexOf(key1) === -1) {
                      this.excludeOptions.push(value1.displayName);
                    }
                    this.allAttribute[value1.displayName] = value[key1];
                    this.allAttributeForAdvance[key1] = value[key1];
                    this.displayNameToOgName[value1.displayName] = key1;
                  }
                }
              }
            }
          }
        }
        if (value1.type === 'checkbox') {
          const innerFormGroup = new UntypedFormGroup({});
          for (const ele of value1.options) {
            innerFormGroup.addControl(
              ele.label,
              new UntypedFormControl(value1.default)
            );
          }
          formGroup.addControl(key1, innerFormGroup);
        } else if (value1.type === 'chips' || value1.type === 'chips1') {
          const formArray = new UntypedFormArray([]);
          formGroup.addControl(key1, formArray);
        } else if (value1.type === 'chips-radio') {
          const innerFormGroup = new UntypedFormGroup({});
          const formArray = new UntypedFormArray([]);
          innerFormGroup.addControl('category', new UntypedFormControl('AND'));
          innerFormGroup.addControl('array', formArray);

          formGroup.addControl(key1, innerFormGroup);
        } else if (value1.type === 'Duration') {
          const innerFormGroup = new UntypedFormGroup({});
          const formcon = new UntypedFormControl(
            moment().subtract(1, 'days').startOf('day').utc().unix()
          );
          const formcon1 = new UntypedFormControl(moment().endOf('day').utc().unix());
          innerFormGroup.addControl('StartDate', formcon);
          innerFormGroup.addControl('EndDate', formcon1);
          innerFormGroup.addControl('isCustom', new UntypedFormControl(2));
          innerFormGroup.addControl(
            'Duration',
            new UntypedFormControl(value1.default)
          );
          formGroup.addControl(value1.type, innerFormGroup);
        } else {
          if (
            value1.displayName === 'Upper Category' ||
            value1.displayName === 'Category'
          ) {
            formGroup.addControl(key1 + 'condition', new UntypedFormControl(true));
          }
          formGroup.addControl(key1, new UntypedFormControl(value1.default));
        }
      }
      filterForm.addControl(key, formGroup);
    }
    return filterForm;
  }

  callAllApis(): void {
    this.fillBrandList();
    this.fillCategoryGroupsNameList();
    this.fillLogicalGroupsNameList();
    this.fillEmailWhitelist();
  }

  // get form filled data.
  getFilled(
    filterFilledData: FilterFilledData,
    isForCount: boolean,
    callextraapi = true
  ): void {
    this._filterFilledData = filterFilledData;
    this.fillAllFilterReply();
    if (!isForCount && callextraapi) {
      // this.currentBrandSource.next(true);
      this.currentBrandSourceSignal.set(true);
      this.filterTabSourceSignal.set(this._navigationService.currentSelectedTab);
    }
  }
  // takes Brand Date Duration FormGroup
  fillBrandSelected(brandData: UntypedFormGroup): void {
    this.selectedBrands = brandData;
    if (
      this.selectedBrands.value.selectBrand[
        this.selectedBrands.value.selectBrand.length - 1
      ] === 'All'
    ) {
      this.onlyDurationSelected(
        this.selectedBrands.value.Duration.StartDate.value,
        this.selectedBrands.value.Duration.EndDate.value
      );
      return;
    } else {
      const brandreply = [];
      // eslint-disable-next-line guard-for-in
      for (const each in this.selectedBrands.value.selectBrand) {
        const value = this.selectedBrands.value.selectBrand[each];
        const eachbrand = new Brand();
        const brandAllData = this.fetchedBrandData.find(
          (b) => b.brandID === value
        );
        eachbrand.brandID = Number(brandAllData.brandID);
        eachbrand.brandName = brandAllData.brandName;
        eachbrand.categoryGroupID = Number(brandAllData.categoryGroupID);
        eachbrand.mainBrandID = Number(brandAllData.brandID);
        eachbrand.compititionBrandIDs = [];
        eachbrand.brandFriendlyName = brandAllData.brandFriendlyName;
        eachbrand.brandLogo = '';
        eachbrand.isBrandworkFlowEnabled = brandAllData.isBrandworkFlowEnabled;
        eachbrand.brandGroupName = '';
        brandreply.push(eachbrand);
      }
      this.FilterFilledDataReply = new ApiReply();
      this.FilterFilledDataReply.brands = brandreply;
      this.FilterFilledDataReply.categoryID = 0;
      this.FilterFilledDataReply.categoryName = 'string';
      (this.FilterFilledDataReply.startDateEpoch =
        this.selectedBrands.value.Duration.StartDate),
        (this.FilterFilledDataReply.endDateEpoch =
          this.selectedBrands.value.Duration.EndDate),
        (this.FilterFilledDataReply.userID = 0);
      this.FilterFilledDataReply.filters = [];
      this.FilterFilledDataReply.notFilters = [];
      this.FilterFilledDataReply.isAdvance = false;
      this.FilterFilledDataReply.query = 'string';
      if (
        (
          (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
            'whatToMonitor'
          ) as UntypedFormControl
        ).value === 1
      ) {
        this.FilterFilledDataReply.orderBYColumn =
          ticketMentionDropdown.sortBy[
            this._postOptionService.optionForm.controls.sortBy.value
          ].mention;
      } else {
        this.FilterFilledDataReply.orderBYColumn =
          ticketMentionDropdown.sortBy[
            this._postOptionService.optionForm.controls.sortBy.value
          ].ticket;
      }
      this.FilterFilledDataReply.orderBY =
        ticketMentionDropdown.sortOrder.value[
          +this._postOptionService.optionForm.controls.sortOrder.value
        ];
      this.FilterFilledDataReply.IsRawOrderBy = false;
      this.FilterFilledDataReply.offset = 0;
      this.FilterFilledDataReply.noOfRows = 1;
      // this.fillCategoryList(this.FilterFilledDataReply);
      this.fillFilterBasicList(this.FilterFilledDataReply, false);
      this.callFilterCountAPI(this.FilterFilledDataReply);
    }
  }

  onlyDurationSelected(startDate, endDate): void {
    this.readyForFilterStartApi(this.brandreplyAll, startDate, endDate);
  }

  // Fetch data From Http and store it in ChannelData
  fillChannelData(chData): void {
    const currentUser = this.localStorageService.getCurrentUserData();
    if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM) {
      if (currentUser?.data?.user?.isClickhouseEnabled == 1) {
        chData = chData?.filter((obj) => obj?.channelGroupType == ChannelGroup.LinkedIn || obj?.channelGroupType == ChannelGroup.Twitter || obj?.channelGroupType == ChannelGroup.Facebook || obj?.channelGroupType == ChannelGroup.Instagram || obj?.channelGroupType == ChannelGroup.Youtube || obj?.channelGroupType == ChannelGroup.News || obj?.channelGroupType == ChannelGroup.Blogs || obj?.channelGroupType == ChannelGroup.DiscussionForums || obj?.channelGroupType == ChannelGroup.AppStoreReviews || obj?.channelGroupType == ChannelGroup.Booking || obj?.channelGroupType == ChannelGroup.TripAdvisor || obj?.channelGroupType == ChannelGroup.ECommerceWebsites || obj?.channelGroupType == ChannelGroup.Quora || obj?.channelGroupType == ChannelGroup.GlassDoor || obj?.channelGroupType == ChannelGroup.GooglePlayStore || obj?.channelGroupType == ChannelGroup.ComplaintWebsites || obj?.channelGroupType == ChannelGroup.TikTok || obj?.channelGroupType == ChannelGroup.GoogleMyReview)
        chData?.forEach((obj) => {
          if (obj?.channelType == ChannelType.FbGroupComments || obj?.channelType == ChannelType.FbGroupPost) {
            obj.channelGroupName = 'Facebook Group';
          }
        })
      }
    }else
    {
      chData = chData?.filter((obj) => obj?.channelType != ChannelType.FbGroupComments && obj?.channelType != ChannelType.FbGroupPost)
    }
    this.fetchedChannelData = chData;
    // Convert to Tree Structure
    const ChannelData = {};
    this.fetchedChannelgroupnameid = {};
    this.fetchedChanneltypenameid = {};
    this.fetchedChannelgroupidname = {};
    this.fetchedChanneltypeidname = {};
    for (const each in this.fetchedChannelData) {
      if (!(this.fetchedChannelData[each].channelGroupName in ChannelData)) {
        ChannelData[this.fetchedChannelData[each].channelGroupName] = [
          this.fetchedChannelData[each].channelName,
        ];
        this.fetchedChannelgroupnameid[
          this.fetchedChannelData[each].channelGroupName
        ] = this.fetchedChannelData[each].channelGroupType;
        this.fetchedChannelgroupidname[
          this.fetchedChannelData[each].channelGroupType
        ] = this.fetchedChannelData[each].channelGroupName;
        this.fetchedChanneltypenameid[
          this.fetchedChannelData[each].channelName
        ] = this.fetchedChannelData[each].channelType;
        this.fetchedChanneltypeidname[
          this.fetchedChannelData[each].channelType
        ] = this.fetchedChannelData[each].channelName;
      } else {
        ChannelData[this.fetchedChannelData[each].channelGroupName].push(
          this.fetchedChannelData[each].channelName
        );
        this.fetchedChanneltypenameid[
          this.fetchedChannelData[each].channelName
        ] = this.fetchedChannelData[each].channelType;
        this.fetchedChanneltypeidname[
          this.fetchedChannelData[each].channelType
        ] = this.fetchedChannelData[each].channelName;
      }
    }
    this.fetchedChannelDisplayData = ChannelData;
    this.filterData.ticketsMentions.Channel.options = ChannelData;

    let alphabeticalList = this.filterData.ticketsMentions.Channel.options;
    this.filterData.ticketsMentions.Channel.options = Object.keys(
      alphabeticalList
    )
      .sort(function (a, b) {
        return ('' + a).localeCompare(b);
      })
      .reduce(function (Obj, key) {
        Obj[key] = alphabeticalList[key];
        return Obj;
      }, {});
    alphabeticalList = this.filterData.ticketsMentions.Channel.options;
    // this.setValue(true);
  }

  fillBrandList(firstcall = false): void {
    this._filterConfig
      .postData(this.brandConfigUrl, {})
      .subscribe((resData) => {
        if (resData.success) {
          const data = JSON.stringify(resData);
          this.fetchedBrandData = JSON.parse(data).data;

          //voip ivr brand data fetch
          if (this.fetchedBrandData.some(x => x.isVOIPBrand)){
            const params=this.fetchedBrandData.filter(x => x.isVOIPBrand).map(x=> x.brandID)
            this._filterConfig.postData(this.voipBrandConfigUrl, params).subscribe(res=>{
              if(res){
                this.voipBrandIVRData=res.data;
                this.voipBrandIVRData.forEach(x => x.description = JSON.parse(x.description))
              }
            })
          }

          const options = [];
          const brandreply = [];
          // eslint-disable-next-line guard-for-in
          for (const each in this.fetchedBrandData) {
            options.push({
              id: this.fetchedBrandData[each].brandID,
              label: this.fetchedBrandData[each].brandFriendlyName,
            });
            // Brand data to be send
            const brand = new Brand();
            brand.brandID = Number(this.fetchedBrandData[each].brandID);
            brand.brandName = this.fetchedBrandData[each].brandName;
            brand.categoryGroupID = Number(
              this.fetchedBrandData[each].categoryGroupID
            );
            (brand.mainBrandID = Number(this.fetchedBrandData[each].brandID)),
              (brand.compititionBrandIDs = []);
            (brand.brandFriendlyName =
              this.fetchedBrandData[each].brandFriendlyName),
              (brand.brandLogo = '');
            brand.isBrandworkFlowEnabled =
              this.fetchedBrandData[each].isBrandworkFlowEnabled;
            brand.brandGroupName = '';
            brandreply.push(brand);
          }
          // Advance setting
          this.filterData.brandDateDuration.selectBrand.options = options;
          this.durationsOptions =
            this.filterData.brandDateDuration.Duration.options;

          if (
            (this.filterForm.get('brandDateDuration') as UntypedFormGroup).get(
              'selectBrand'
            ).value === null
          ) {
            (this.filterForm.get('brandDateDuration') as UntypedFormGroup)
              .get('selectBrand')
              .patchValue([
                ...this.filterData.brandDateDuration.selectBrand.options.map(
                  (item) => item.id
                ),
                'All',
              ]);
          }

          this.brandOptions = options;
          this.brandreplyAll = brandreply;
          this.readyForFilterStartApi(
            brandreply,
            this.filterForm.controls.brandDateDuration.value.Duration.StartDate,
            this.filterForm.controls.brandDateDuration.value.Duration.EndDate,
            firstcall
          );
          // this.readyForCategoryList(brandreply, this.filterForm.controls.brandDateDuration.value.Duration.StartDate,
          //     this.filterForm.controls.brandDateDuration.value.Duration.EndDate);
          // this.currentBrandSource.next(true);
          this.currentBrandSourceSignal.set(true);
          this.currentBrandListFirstCall.next(true);
          this._navigationService.tabs.forEach((obj)=>{
            if (obj?.tab?.filterJson)
              {
            let tempFilterJson = JSON.parse(obj.tab.filterJson)
            if (obj.tab.userID == -1) {
              tempFilterJson.brands = this.fetchedBrandData;
              tempFilterJson.startDateEpoch = moment()
                .subtract(1, 'days')
                .startOf('day').utc().unix(),
                tempFilterJson.endDateEpoch = moment()
                  .endOf('day').utc().unix(),
                tempFilterJson.endDateEpoch;
              obj.tab.filterJson = JSON.stringify(tempFilterJson);
            } else {
              tempFilterJson.startDateEpoch = moment()
                .subtract(tempFilterJson.isCustom, 'days')
                .startOf('day').utc().unix(),
                tempFilterJson.endDateEpoch = moment()
                  .endOf('day').utc().unix(),
                tempFilterJson.endDateEpoch;
              obj.tab.filterJson = JSON.stringify(tempFilterJson);
            }
          }
          })
        } else {
          //this._loaderService.toggleMainLoader(false);
          this._loaderService.toggleMainLoader({ isApiLoaded: true });
          this.dialog.open(NoBrandsComponent, {
            disableClose: true,
          });
        }
      });
  }

  fillBrandListWhileNavigating(): void {
    this._filterConfig
      .postData(this.brandConfigUrl, {})
      .subscribe((resData) => {
        if (resData.success) {
          const data = JSON.stringify(resData);
          this.fetchedBrandData = JSON.parse(data).data;
          const options = [];
          const brandreply = [];
          // eslint-disable-next-line guard-for-in
          for (const each in this.fetchedBrandData) {
            options.push({
              id: this.fetchedBrandData[each].brandID,
              label: this.fetchedBrandData[each].brandFriendlyName,
            });
            // Brand data to be send
            const brand = new Brand();
            brand.brandID = Number(this.fetchedBrandData[each].brandID);
            brand.brandName = this.fetchedBrandData[each].brandName;
            brand.categoryGroupID = Number(
              this.fetchedBrandData[each].categoryGroupID
            );
            (brand.mainBrandID = Number(this.fetchedBrandData[each].brandID)),
              (brand.compititionBrandIDs = []);
            (brand.brandFriendlyName =
              this.fetchedBrandData[each].brandFriendlyName),
              (brand.brandLogo = '');
            brand.isBrandworkFlowEnabled =
              this.fetchedBrandData[each].isBrandworkFlowEnabled;
            brand.brandGroupName = '';
            brandreply.push(brand);
          }
          // Advance setting
          this.filterData.brandDateDuration.selectBrand.options = options;
          this.durationsOptions =
            this.filterData.brandDateDuration.Duration.options;

          if (
            (this.filterForm.get('brandDateDuration') as UntypedFormGroup).get(
              'selectBrand'
            ).value === null
          ) {
            (this.filterForm.get('brandDateDuration') as UntypedFormGroup)
              .get('selectBrand')
              .patchValue([
                ...this.filterData.brandDateDuration.selectBrand.options.map(
                  (item) => item.id
                ),
                'All',
              ]);
          }
        }
      });
  }
  

  // getBrandList(): Observable<BrandList[]> {
  //     this._filterConfig.postData(this.brandConfigUrl, {}).subscribe(resData => {
  //         const data = JSON.stringify(resData);
  //         this.fetchedBrandData = JSON.parse(data).data;
  //         this.currentBrandSource.next(true);
  //         this.currentBrandListFirstCall.next(true);
  //     });
  // }

  readyForFilterStartApi(
    brandreply: Brand[],
    startDate,
    endDate,
    firstcall = false
  ): void {
    this.FilterFilledDataReply = new ApiReply();
    this.FilterFilledDataReply.brands = brandreply;
    this.FilterFilledDataReply.categoryID = 0;
    this.FilterFilledDataReply.categoryName = 'string';
    this.FilterFilledDataReply.startDateEpoch = startDate;
    this.FilterFilledDataReply.endDateEpoch = endDate;
    this.FilterFilledDataReply.userID = 0;
    this.FilterFilledDataReply.filters = [];
    this.FilterFilledDataReply.notFilters = [];
    this.FilterFilledDataReply.isAdvance = false;
    this.FilterFilledDataReply.query = 'string';
    if (
      (
        (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
          'whatToMonitor'
        ) as UntypedFormControl
      ).value === 1
    ) {
      this.FilterFilledDataReply.orderBYColumn =
        ticketMentionDropdown.sortBy[
          this._postOptionService.optionForm.controls.sortBy.value
        ]?.mention;
    } else {
      this.FilterFilledDataReply.orderBYColumn =
        ticketMentionDropdown.sortBy[
          this._postOptionService.optionForm.controls.sortBy.value
        ]?.ticket;
    }
    this.FilterFilledDataReply.orderBY =
      ticketMentionDropdown.sortOrder.value[
        +this._postOptionService.optionForm.controls.sortOrder.value
      ];
    this.FilterFilledDataReply.IsRawOrderBy = false;
    this.FilterFilledDataReply.offset = 0;
    this.FilterFilledDataReply.noOfRows = 1;
    this.fillFilterBasicList(this.FilterFilledDataReply, firstcall);
    // this.fillCategoryList(this.FilterFilledDataReply);
    this.callFilterCountAPI(this.FilterFilledDataReply);
  }

  // readyForCategoryList(brandreply: Brand[], startDate, endDate): void {
  //     const bodyreply = new ApiReply();
  //     bodyreply.brands = brandreply;
  //     bodyreply.categoryID = 0;
  //     bodyreply.categoryName = 'string';
  //     bodyreply.startDateEpoch = startDate;
  //     bodyreply.endDateEpoch = endDate;
  //     bodyreply.userID = 0;
  //     bodyreply.filters = [];
  //     bodyreply.notFilters = [];
  //     bodyreply.isAdvance = false;
  //     bodyreply.query = 'string';
  //     bodyreply.orderBYColumn = 'DateCreated',
  //     bodyreply.orderBY = 'desc';
  //     bodyreply.IsRawOrderBy = false;
  //     bodyreply.offset = 0;
  //     bodyreply.noOfRows = 1;
  //     this.fillCategoryList(bodyreply);
  // }

  getBasicFiltersList(keyObj): Observable<any> {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetFilters', keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  getAspectsList(keyObj): Observable<any> {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetAspectsList', keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  fillFilterBasicList(body: ApiReply, firstcall = false): void {
    const currentUser = this.localStorageService.getCurrentUserData();
    let data = JSON.stringify(body);
    let sfdcTicketView = localStorage.getItem('sfdcTicketView');
    if (sfdcTicketView)
    {
     setTimeout(() => {
       this.filtersJsonLoaded.next(true);
       this._loaderService.toggleMainLoader({ isApiLoaded: true });
       this.filterApiSuccessFull.next(true)
     }, 1000);
    }else
    {

    const url = this.router.url.includes('ticketView') || this.router.url.includes('ticketDetail') ? this.filterBasicCrmDynamics : this.filterBasicConfigUrl;
    if (url == '/Tickets/GetFilters' && body && body.brands && body.brands.length > 0) {
      this._filterConfig
        .postData(url, body)
        .subscribe((resData) => {
          data = JSON.stringify(resData);
          const featchData = JSON.parse(data).data;
          if (featchData) {
            this.fillFilterBasicListData = featchData;
            this.fillUpperCategory(featchData.upperCategories);
            this.fillSocialProfile(featchData.socialAccounts);
            this.fillActionStatuses(featchData.actionStatuses);
            this.fillAssignTo(featchData.assignToList);
            this.fillInfluencerCategory(featchData.influencerCategories);
            this.fillCrmColumns(featchData.crmColumns);
            this.fillSsreStatuses(featchData.ssreStatuses);
            this.fillLangaugeList(featchData.langaugeList);
            this.fillcountryList(featchData.countryList);
            this.fillCampaigns(featchData.campaigns);
            this.fillDispositionList(featchData.dispositionList);
            this.fillChannelData(featchData.channels);
            this.router.url.includes('ticketView') || this.router.url.includes('ticketDetail') ? '' : this.fillCategoryList(body);
          }
          if (firstcall) {
            // this.filterTabSource.next(this._navigationService.currentSelectedTab);
          }
          if (!sfdcTicketView)
          {
            this.filtersJsonLoaded.next(true);
            this._loaderService.toggleMainLoader({ isApiLoaded: true });
          }
          this.CategoryBrandReplySettingAPI();
          //this._loaderService.toggleMainLoader(false);
        });
    // } else if(!sfdcTicketView) {
      //  } else if(sfdcTicketView) {
      //   console.log('bypassed getcrmdynami... api');
      //  } 
    }
      else {
      this._filterConfig
        .postData(url, body)
        .subscribe((resData) => {
          data = JSON.stringify(resData);
          const featchData = JSON.parse(data).data;
          if (featchData) {
            this.fillFilterBasicListData = featchData;
            this.fillUpperCategory(featchData.upperCategories);
            this.fillSocialProfile(featchData.socialAccounts);
            this.fillActionStatuses(featchData.actionStatuses);
            this.fillAssignTo(featchData.assignToList);
            this.fillInfluencerCategory(featchData.influencerCategories);
            this.fillCrmColumns(featchData.crmColumns);
            this.fillSsreStatuses(featchData.ssreStatuses);
            this.fillLangaugeList(featchData.langaugeList);
            this.fillcountryList(featchData.countryList);
            this.fillCampaigns(featchData.campaigns);
            this.fillDispositionList(featchData.dispositionList);
            this.fillChannelData(featchData.channels);
            this.router.url.includes('ticketView') || this.router.url.includes('ticketDetail') ? '' : this.fillCategoryList(body);
          }
          if (firstcall) {
            // this.filterTabSource.next(this._navigationService.currentSelectedTab);
          }
          this.filtersJsonLoaded.next(true);
          this.CategoryBrandReplySettingAPI();
          //this._loaderService.toggleMainLoader(false);
          this._loaderService.toggleMainLoader({ isApiLoaded: true });
        });
    }
  }

    if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM) {
      if (currentUser?.data?.user?.isClickhouseEnabled == 1) {

        const BrandIDs = [];
        const BrandGroups = []
        if (body?.brands?.length > 0) {
          body?.brands.forEach((x) => {
            BrandIDs.push(x.brandID)
          })
        }

        if (body?.brandGroups?.length > 0) {
          body?.brandGroups.forEach((x) => {
            BrandGroups.push(x.brandGroup)
          })
        }

        const obj = {
          BrandIDs,
          BrandGroups
        }
        if (BrandIDs?.length == 1) {
          this.getKeywordGroupNameList(obj).subscribe((res) => {
            if (res.success) {
              const option = []
              res?.data?.forEach((obj) => {
                const brandInfo = this.fetchedBrandData.find(x => x.brandID == obj.brandID);
                option.push({
                  id: obj.orderID, label: obj.keywordGroupName, channelGroups: obj.channelGroupids ? obj.channelGroupids.split(',').map(Number) : [], brandImage: brandInfo && brandInfo.rImageURL
                    ? brandInfo.rImageURL
                    : 'assets/social-mention/post/default_brand.svg',
                });
              });
              this.fetchedKeywordGroupNameList = option;
            }
          })
        } else {
          this.fetchedKeywordGroupNameList = []
        }
      }
    }
   
  }

  CategoryBrandReplySettingAPI():void
  {
  this.CategoryBrandReplySetting().subscribe((data) => {
    if (data) {
      this.categoryBrandReplySetting = data.data;
    }
  });
  }

  fillDispositionList(dispositionList): void {
    const options = [];
    dispositionList?.forEach((obj) => {
      options.push({ id: obj.key, label: obj.value });
    });
    this.filterData.ticketsMentions.ticketDisposition.options = options;
  }

  fillUpperCategory(upperCategory): void {
    this.fetchedUpperCategoryData = upperCategory;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedUpperCategoryData) {
      options.push({
        id: this.fetchedUpperCategoryData[each].id,
        label: this.fetchedUpperCategoryData[each].name,
      });
    }
    this.filterData.ticketsMentions.upperCategory.options = options;
  }

  fillSocialProfile(socialProfile): void {
    this.fetchedSocialProfile = socialProfile;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedSocialProfile) {
      if (this.fetchedSocialProfile[each].authorName) {
        const brandObj = this.fetchedBrandData.find(
          (obj) =>
            obj.brandID == String(this.fetchedSocialProfile[each].brandID)
        );
        options.push({
          authorID: this.fetchedSocialProfile[each].authorID,
          label: this.fetchedSocialProfile[each].authorName,
          brandID: this.fetchedSocialProfile[each].brandID,
          id: this.fetchedSocialProfile[each].btaid,
          channelGroupID: this.fetchedSocialProfile[each].channelGroupID,
          ImageUrl: this.fetchedSocialProfile[each].profileImageUrl,
          channelImage:
            ChannelImage[
              ChannelGroup[this.fetchedSocialProfile[each].channelGroupID]
            ],
          brandLogo:
            brandObj && brandObj.rImageURL
              ? brandObj.rImageURL
              : 'assets/social-mention/post/default_brand.svg',
        });
      }
    }
    this.filterData.ticketsMentions.socialProfile.options = options;
  }

  fillAssignTo(assignTo): void {
    this.fetchedAssignTo = assignTo;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedAssignTo) {
      options.push({
        id: this.fetchedAssignTo[each].agentID,
        label: this.fetchedAssignTo[each].agentName,
      });
    }
    this.filterData.teamcharacteristics.assigendTo.options = options;
  }

  fillInfluencerCategory(influencerCategory): void {
    this.fetchedInfluencerCategory = influencerCategory;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedInfluencerCategory) {
      options.push({
        id: this.fetchedInfluencerCategory[each].name,
        label: this.fetchedInfluencerCategory[each].name,
      });
    }
    this.filterData.usercharacteristics.influencerCategory.options = options;
  }

  fillCrmColumns(crmColums): void {
    this.fetchedCrmColums = crmColums;
    const options = [];
    if (this.fetchedCrmColums) {
      // eslint-disable-next-line guard-for-in
      for (const each in this.fetchedCrmColums.existingColumns) {
        if (this.fetchedCrmColums.existingColumns[each].showInFilter) {
          options.push({
            id: this.fetchedCrmColums.existingColumns[each].dbColumn,
            label: this.fetchedCrmColums.existingColumns[each].columnLable,
          });
        }
      }
      for (const each in this.fetchedCrmColums.customColumns) {
        if (this.fetchedCrmColums.customColumns[each].showInFilter) {
          options.push({
            id: this.fetchedCrmColums.customColumns[each].dbColumn,
            label: this.fetchedCrmColums.customColumns[each].columnLable,
          });
        }
      }
    }
    this.filterData.usercharacteristics.userWith.options = options;
  }

  fillActionStatuses(actionStatus): void {
    this.fetchedActionStatus = actionStatus;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedActionStatus) {
      options.push({
        id: this.fetchedActionStatus[each].key,
        label: this.fetchedActionStatus[each].value.replace('Ssre', 'SSRE'),
      });
    }
    this.filterData.Others.actionStatuses.options = options;
  }

  fillSsreStatuses(ssreStatuses): void {
    this.fetchedSsreStatuses = ssreStatuses;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedSsreStatuses) {
      options.push({
        id: this.fetchedSsreStatuses[each].key,
        label: this.fetchedSsreStatuses[each].value,
      });
    }
    this.filterData.Others.SsreStatuses.options = options;
  }

  fillLangaugeList(langaugeList): void {
    this.fetchedLangaugeList = langaugeList;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedLangaugeList) {
      options.push({
        id: this.fetchedLangaugeList[each].value,
        label: this.fetchedLangaugeList[each].key,
      });
    }
    this.filterData.Others.Language.options = options;
  }

  fillcountryList(countryList): void {
    this.fetchedCountryList = countryList;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedCountryList) {
      options.push({
        id: this.fetchedCountryList[each].value,
        label: this.fetchedCountryList[each].key,
      });
    }
    this.filterData.Others.Countries.options = options;
  }

  fillCampaigns(campaigns): void {
    this.fetchedCampaigns = campaigns;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedCampaigns) {
      const brandObj = this.fetchedBrandData.find(
        (obj) => obj.brandID == String(this.fetchedCampaigns[each].brandID)
      );
      if (brandObj) {
        options.push({
          id: this.fetchedCampaigns[each].campaignID,
          label: this.fetchedCampaigns[each].campaignName,
          campaignCreatedDate: moment(
            this.fetchedCampaigns[each].campaignCreatedDate
          ).format('DD MMM, y, h:mm:ss A'),
          brandLogo:
            brandObj && brandObj.rImageURL
              ? brandObj.rImageURL
              : 'assets/social-mention/post/default_brand.svg',
          brandID: brandObj.brandID,
          brandFriendlyName: brandObj.brandFriendlyName,
        });
      }
    }
    this.filterData.Others.Campaign.options = options;
  }

  fillCategoryList(body:any, filterObj = null, onlyVariableUpdate?:boolean): void {
    if (!onlyVariableUpdate){
      this._filterConfig
        .postData(this.categoryListConfigUrl, body)
        .subscribe((resData) => {
          const data = JSON.stringify(resData);
          const currentUser:AuthUser = JSON.parse(localStorage.getItem('user'));
          if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled==1)
          {
            this.getBrandLogicalGroupList();
          }else{
            let sfdcTicketView = localStorage.getItem('sfdcTicketView');
            if (!sfdcTicketView) {
              this.filterApiSuccessFull.next(true)
            }
          }
          this.fetchedCategoryData = JSON.parse(data).data;
          const categoryData = {};
          if (this.fetchedCategoryData) {

            this.fetchedCategoryDatacategory = {};
            this.fetchedCategoryDatadepartment = {};
            this.fetchedCategoryDatasubCategory = {};
            this.fetchedCategoryDatacategoryidname = {};
            this.fetchedCategoryDatadepartmentidname = {};
            this.fetchedCategoryDatasubCategoryidname = {};

            for (const category of Object.keys(this.fetchedCategoryData)) {
              categoryData[this.fetchedCategoryData[category].category] = {};
              this.fetchedCategoryDatacategory[
                this.fetchedCategoryData[category].category
              ] = this.fetchedCategoryData[category].categoryID;
              this.fetchedCategoryDatacategoryidname[
                this.fetchedCategoryData[category].categoryID
              ] = this.fetchedCategoryData[category].category;
              if (this.fetchedCategoryData[category].depatments) {
                for (const dept of Object.keys(
                  this.fetchedCategoryData[category].depatments
                )) {
                  categoryData[this.fetchedCategoryData[category].category][
                    this.fetchedCategoryData[category].depatments[
                      dept
                    ].departmentName
                  ] = {};
                  this.fetchedCategoryDatadepartment[
                    this.fetchedCategoryData[category].depatments[
                      dept
                    ].departmentName
                  ] =
                    this.fetchedCategoryData[category].depatments[
                      dept
                    ].departmentID;
                  this.fetchedCategoryDatadepartmentidname[
                    this.fetchedCategoryData[category].depatments[
                      dept
                    ].departmentID
                  ] =
                    this.fetchedCategoryData[category].depatments[
                      dept
                    ].departmentName;
                  if (
                    this.fetchedCategoryData[category].depatments[dept]
                      .subCategories
                  ) {
                    for (const subCat of Object.keys(
                      this.fetchedCategoryData[category].depatments[dept]
                        .subCategories
                    )) {
                      categoryData[this.fetchedCategoryData[category].category][
                        this.fetchedCategoryData[category].depatments[
                          dept
                        ].departmentName
                      ][
                        this.fetchedCategoryData[category].depatments[
                          dept
                        ].subCategories[subCat].subCategoryName
                      ] = {};
                      this.fetchedCategoryDatasubCategory[
                        this.fetchedCategoryData[category].depatments[
                          dept
                        ].subCategories[subCat].subCategoryName
                      ] =
                        this.fetchedCategoryData[category].depatments[
                          dept
                        ].subCategories[subCat].subCategoryID;
                      this.fetchedCategoryDatasubCategoryidname[
                        this.fetchedCategoryData[category].depatments[
                          dept
                        ].subCategories[subCat].subCategoryID
                      ] =
                        this.fetchedCategoryData[category].depatments[
                          dept
                        ].subCategories[subCat].subCategoryName;
                    }
                  }
                }
              }
            }
          }
          this.filterData.ticketsMentions.Category.options = categoryData;
        });
    }

    /* when onlyVariableUpdate flag that time only worling*/
    if (onlyVariableUpdate && body && Object.keys(body).length > 0){
      this.fetchedCategoryData = body;
      const categoryData = {};
      this.fetchedCategoryDatacategory = {};
      this.fetchedCategoryDatadepartment = {};
      this.fetchedCategoryDatasubCategory = {};
      this.fetchedCategoryDatacategoryidname = {};
      this.fetchedCategoryDatadepartmentidname = {};
      this.fetchedCategoryDatasubCategoryidname = {};

      for (const category of Object.keys(this.fetchedCategoryData)) {
        categoryData[this.fetchedCategoryData[category].category] = {};
        this.fetchedCategoryDatacategory[
          this.fetchedCategoryData[category].category
        ] = this.fetchedCategoryData[category].categoryID;
        this.fetchedCategoryDatacategoryidname[
          this.fetchedCategoryData[category].categoryID
        ] = this.fetchedCategoryData[category].category;
        if (this.fetchedCategoryData[category].depatments) {
          for (const dept of Object.keys(
            this.fetchedCategoryData[category].depatments
          )) {
            categoryData[this.fetchedCategoryData[category].category][
              this.fetchedCategoryData[category].depatments[
                dept
              ].departmentName
            ] = {};
            this.fetchedCategoryDatadepartment[
              this.fetchedCategoryData[category].depatments[
                dept
              ].departmentName
            ] =
              this.fetchedCategoryData[category].depatments[
                dept
              ].departmentID;
            this.fetchedCategoryDatadepartmentidname[
              this.fetchedCategoryData[category].depatments[
                dept
              ].departmentID
            ] =
              this.fetchedCategoryData[category].depatments[
                dept
              ].departmentName;
            if (
              this.fetchedCategoryData[category].depatments[dept]
                .subCategories
            ) {
              for (const subCat of Object.keys(
                this.fetchedCategoryData[category].depatments[dept]
                  .subCategories
              )) {
                categoryData[this.fetchedCategoryData[category].category][
                  this.fetchedCategoryData[category].depatments[
                    dept
                  ].departmentName
                ][
                  this.fetchedCategoryData[category].depatments[
                    dept
                  ].subCategories[subCat].subCategoryName
                ] = {};
                this.fetchedCategoryDatasubCategory[
                  this.fetchedCategoryData[category].depatments[
                    dept
                  ].subCategories[subCat].subCategoryName
                ] =
                  this.fetchedCategoryData[category].depatments[
                    dept
                  ].subCategories[subCat].subCategoryID;
                this.fetchedCategoryDatasubCategoryidname[
                  this.fetchedCategoryData[category].depatments[
                    dept
                  ].subCategories[subCat].subCategoryID
                ] =
                  this.fetchedCategoryData[category].depatments[
                    dept
                  ].subCategories[subCat].subCategoryName;
              }
            }
          }
        }
      }
    }
    
  }

  getBrandLogicalGroupList()
  {
    this._filterConfig.postData(this.logicalGroupConfigUrl, {}).subscribe((resData) => {
      if (resData.success) {
        this.fetchedLogicalGroupData = (resData?.data?.groupData) ? resData?.data?.groupData:[];
        this.filterApiSuccessFull.next(true)
      }
    }
    );
  }

  getCategoryList(keyObj): Observable<any> {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetCategoriesList', keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // UPDATE FILTER
  updateFilter(data) {
    let object = {
      TabID: this._navigationService.currentSelectedTab.tabId,
      FilterJsons: [
        {
          ID: this._navigationService.currentSelectedTab.tabId,
          FilterJson: JSON.stringify(data.filter),
        },
      ],
    };
    return this._http
      .post(environment.baseUrl + '/DIY/UpdateTabFilterJson', object)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // UPDATE SECTION FILTER
  updateSectionFilter(data) {
    return this._http
      .post(environment.baseUrl + '/DIY/UpdateTabSectionFilterJson', data)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Start the ChecklistFlag
  // Observable to inform that Data is availabel and ready to display
  getValue(): Observable<boolean> {
    return this.isFetched.asObservable();
  }
  setValue(newValue: boolean): void {
    this.isFetched.next(newValue);
  }

  fillAllFilterReply(): void {
    this.FilterFilledDataReply = new ApiReply();
    const brandInfo: BrandInfo[] = [];
    for (const value of this._filterFilledData.brandDateDuration.selectBrand) {
      const searchedBrand = this.fetchedBrandData.find(
        (b) => b.brandID === value
      );
      if (!searchedBrand) {
        continue;
      }
      const eachbrand: BrandInfo = {
        brandID: +searchedBrand.brandID,
        brandName: searchedBrand.brandName,
        categoryGroupID: +searchedBrand.categoryGroupID,
        mainBrandID: 0,
        categoryID: +searchedBrand.categoryID,
        categoryName: searchedBrand.categoryName,
        compititionBrandIDs: [0],
        brandFriendlyName: searchedBrand.brandFriendlyName,
        brandLogo: 'string',
        isBrandworkFlowEnabled: searchedBrand.isBrandworkFlowEnabled,
        brandGroupName: 'string',
      };
      brandInfo.push(eachbrand);
    }
    const startDateEpcoh1: number =
      this._filterFilledData.brandDateDuration.Duration.StartDate;
    const endDateEpoch1: number =
      this._filterFilledData.brandDateDuration.Duration.EndDate;
    const isCustom: number =
      this._filterFilledData.brandDateDuration.Duration.isCustom;
    const myFilter = [];
    const excludeFilter = [];
    for (const group of Object.keys(this._filterFilledData)) {
      if (group === 'brandDateDuration') {
        continue;
      } else if (group === 'Keywords') {
        if (
          (this._filterFilledData[group].AND.array.length > 0 &&
            this._filterFilledData[group].AND.category !== null) ||
          this._filterFilledData[group].Donot.length > 0 ||
          this._filterFilledData[group].Or.length > 0
        ) {
          const eachFilters = new EachFilters();
          eachFilters.name = 'keywordsearch';
          eachFilters.type = 0;
          eachFilters.value = {};
          if (
            this._filterFilledData[group].AND.array.length > 0 &&
            this._filterFilledData[group].AND.category !== null
          ) {
            eachFilters.value.ShouldContain =
              this._filterFilledData[group].AND.array;
            eachFilters.value.ShouldContainCondition =
              this._filterFilledData[group].AND.category;
          }
          if (this._filterFilledData[group].Donot.length > 0) {
            eachFilters.value.ShouldNotContain =
              this._filterFilledData[group].Donot;
          }
          if (this._filterFilledData[group].Or.length > 0) {
            eachFilters.value.MayContain = this._filterFilledData[group].Or;
          }
          myFilter.push(eachFilters);
        }
        continue;
      } else if (group === 'excludeFilters') {
        for (const each of Object.keys(this._filterFilledData[group])) {
          if (
            each === 'myTickets' &&
            this._filterFilledData[group][each] !==
              this.allAttribute[each].default &&
            this._filterFilledData[group][each] !== null
          ) {
            this.FilterFilledDataReply.ticketType = [
              this._filterFilledData[group][each],
            ];
          } else if (each.indexOf('condition') !== -1) {
            continue;
          } else if (this.notToPass.indexOf(each) > -1) {
            continue;
          } else if (each === 'Mentions') {
            const mention = {
              name: allFilterReply[this.displayNameToOgName[each]].name,
              type: allFilterReply[this.displayNameToOgName[each]].type,
              value: [],
            };
            let count = 0;
            for (const every of filterData[group][each].options) {
              if (this._filterFilledData[group][each][every.label]) {
                mention.value.push(every.id);
                count += 1;
              }
            }
            if (count === 0) {
              mention.value.push(0);
              mention.value.push(1);
            }
            if (mention.value.length > 0) {
              excludeFilter.push(mention);
            }
            continue;
          } else if (each === 'userActivity') {
            const userActivity = {
              name: allFilterReply[this.displayNameToOgName[each]].name,
              type: allFilterReply[this.displayNameToOgName[each]].type,
              value: [],
            };
            let count = 0;
            for (const every of filterData[group][each].options) {
              if (this._filterFilledData[group][each][every.label]) {
                userActivity.value.push(every.id);
                count += 1;
              }
            }
            if (count === 0) {
              userActivity.value.push(0);
              userActivity.value.push(1);
            }
            if (userActivity.value.length > 0) {
              excludeFilter.push(userActivity);
            }
            continue;
          } else if (each === 'brandActivity') {
            const brandActivity = {
              name: allFilterReply[this.displayNameToOgName[each]].name,
              type: allFilterReply[this.displayNameToOgName[each]].type,
              value: [],
            };
            for (const every of filterData[group][each].options) {
              if (this._filterFilledData[group][each][every.label]) {
                brandActivity.value.push(every.id);
              }
            }
            if (brandActivity.value.length > 0) {
              excludeFilter.push(brandActivity);
            }
            continue;
          } else if (each === 'Channel') {
            if (this._filterFilledData[group][each]?.length > 0) {
              const channelgroup = {
                name: allFilterReply[this.displayNameToOgName[each]].gname,
                type: allFilterReply[this.displayNameToOgName[each]].type,
                value: [],
              };
              const channeltype = {
                name: allFilterReply[this.displayNameToOgName[each]].tname,
                type: allFilterReply[this.displayNameToOgName[each]].type,
                value: [],
              };
              for (const each1 of Object.keys(
                this._filterFilledData[group][each]
              )) {
                if (this._filterFilledData[group][each][each1].level === 0) {
                  channelgroup.value.push(
                    this.fetchedChannelgroupnameid[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
                if (this._filterFilledData[group][each][each1].level === 1) {
                  channeltype.value.push(
                    this.fetchedChanneltypenameid[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
              }
              excludeFilter.push(channelgroup);
              excludeFilter.push(channeltype);
            }
            continue;
          } else if (each === 'Category') {
            if (this._filterFilledData[group][each]?.length > 0) {
              const category = {
                name: allFilterReply[this.displayNameToOgName[each]]
                  .TicketsCname,
                type: allFilterReply[this.displayNameToOgName[each]].type,
                value: [],
              };
              const department = {
                name: allFilterReply[this.displayNameToOgName[each]]
                  .TicketsDname,
                type: allFilterReply[this.displayNameToOgName[each]].type,
                value: [],
              };
              const subCategory = {
                name: allFilterReply[this.displayNameToOgName[each]]
                  .TicketsSname,
                type: allFilterReply[this.displayNameToOgName[each]].type,
                value: [],
              };
              if (this._filterFilledData[group][each + 'condition']) {
                category.name =
                  allFilterReply[this.displayNameToOgName[each]].TicketsCname;
                department.name =
                  allFilterReply[this.displayNameToOgName[each]].TicketsDname;
                subCategory.name =
                  allFilterReply[this.displayNameToOgName[each]].TicketsSname;
              } else {
                category.name =
                  allFilterReply[this.displayNameToOgName[each]].MentionCname;
                department.name =
                  allFilterReply[this.displayNameToOgName[each]].MentionDname;
                subCategory.name =
                  allFilterReply[this.displayNameToOgName[each]].MentionSname;
              }
              for (const each1 of Object.keys(
                this._filterFilledData[group][each]
              )) {
                if (this._filterFilledData[group][each][each1].level === 0) {
                  category.value.push(
                    this.fetchedCategoryDatacategory[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
                if (this._filterFilledData[group][each][each1].level === 1) {
                  department.value.push(
                    this.fetchedCategoryDatadepartment[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
                if (this._filterFilledData[group][each][each1].level === 2) {
                  subCategory.value.push(
                    this.fetchedChanneltypenameid[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
              }
              if (category.value.length > 0) {
                excludeFilter.push(category);
              }
              if (department.value.length > 0) {
                excludeFilter.push(department);
              }
              if (subCategory.value.length > 0) {
                excludeFilter.push(subCategory);
              }
            }
            continue;
          } else if (each === 'Upper Category') {
            if (
              this._filterFilledData[group][each] &&
              this._filterFilledData[group][each] !==
                this.allAttribute[each].default &&
              this._filterFilledData[group][each] !== null
            ) {
              const upperCategory = {
                name: allFilterReply[this.displayNameToOgName[each]]
                  .Ticketsname,
                type: allFilterReply[this.displayNameToOgName[each]].type,
                value: this._filterFilledData[group][each],
              };
              if (this._filterFilledData[group][each + 'condition']) {
                upperCategory.name =
                  allFilterReply[this.displayNameToOgName[each]].Ticketsname;
              } else {
                upperCategory.name =
                  allFilterReply[this.displayNameToOgName[each]].Mentionname;
              }
              excludeFilter.push(upperCategory);
            }
            continue;
          } else if (
            this._filterFilledData[group][each] !==
              this.allAttribute[each].default &&
            this._filterFilledData[group][each] !== null
          ) {
            if (Array.isArray(this._filterFilledData[group][each])) {
              if (
                this._filterFilledData[group][each].length < 1 ||
                this._filterFilledData[group][each][0] == null
              ) {
                continue;
              }
            }
            const eachFilters = new EachFilters();
            eachFilters.name =
              allFilterReply[this.displayNameToOgName[each]].name;
            eachFilters.type =
              allFilterReply[this.displayNameToOgName[each]].type;
            if (each === 'Social Profile') {
              const value = [];
              for (const eachbtaid of this._filterFilledData[group][each]) {
                if (eachbtaid === 'All') {
                  continue;
                }
                const eachval = this.fetchedSocialProfile.find(
                  (b) => b.btaid === eachbtaid
                );
                const eachSocialProfile = new SocialProfileValue();
                eachSocialProfile.BrandID = eachval.brandID;
                eachSocialProfile.ChannelGroupID = eachval.channelGroupID;
                eachSocialProfile.BTAID = eachval.btaid;
                value.push(eachSocialProfile);
              }
              eachFilters.value = value;
            } else {
              eachFilters.value = this._filterFilledData[group][each];
            }
            excludeFilter.push(eachFilters);
          }
        }
      } else {
        // Basic Filter
        for (const each of Object.keys(this._filterFilledData[group])) {
          if (
            each === 'myTickets' &&
            this._filterFilledData[group][each] !== null
          ) {
            this.FilterFilledDataReply.ticketType = [
              this._filterFilledData[group][each],
            ];
          } else if (each === 'whatToMonitor') {
            this.FilterFilledDataReply.postsType =
              this._filterFilledData[group][each];
          } else if (each === 'refreshTime') {
            if (isNaN(+this._filterFilledData[group][each])) {
              // Still not decided how to do
            } else {
              this._ngZone.runOutsideAngular(() => {
                setTimeout(() => {
                  this.ApplyFilter();
                  console.log('setTimeout called');
                }, +this._filterFilledData[group][each]);
              });
            }
          } else if (this.notToPass.indexOf(each) > -1) {
            continue;
          } else if (each === 'Mentions') {
            const mention = {
              name: allFilterReply[each].name,
              type: allFilterReply[each].type,
              value: [],
            };
            for (const every of filterData[group][each].options) {
              if (this._filterFilledData[group][each][every.label]) {
                mention.value.push(every.id);
              }
            }
            if (mention.value.length > 0) {
              myFilter.push(mention);
            }
            continue;
          } else if (each === 'userActivity') {
            const userActivity = {
              name: allFilterReply[each].name,
              type: allFilterReply[each].type,
              value: [],
            };
            for (const every of filterData[group][each].options) {
              if (this._filterFilledData[group][each][every.label]) {
                userActivity.value.push(every.id);
              }
            }
            if (userActivity.value.length > 0) {
              myFilter.push(userActivity);
            }
            continue;
          } else if (each === 'brandActivity') {
            const brandActivity = {
              name: allFilterReply[each].name,
              type: allFilterReply[each].type,
              value: [],
            };
            for (const every of filterData[group][each].options) {
              if (this._filterFilledData[group][each][every.label]) {
                brandActivity.value.push(every.id);
              }
            }
            if (brandActivity.value.length > 0) {
              myFilter.push(brandActivity);
            }
            continue;
          } else if (each === 'Channel') {
            if (this._filterFilledData[group][each]?.length > 0) {
              const channelgroup = {
                name: allFilterReply[each].gname,
                type: allFilterReply[each].type,
                value: [],
              };
              const channeltype = {
                name: allFilterReply[each].tname,
                type: allFilterReply[each].type,
                value: [],
              };
              for (const each1 of Object.keys(
                this._filterFilledData[group][each]
              )) {
                if (this._filterFilledData[group][each][each1].level === 0) {
                  channelgroup.value.push(
                    this.fetchedChannelgroupnameid[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
                if (this._filterFilledData[group][each][each1].level === 1) {
                  channeltype.value.push(
                    this.fetchedChanneltypenameid[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
              }
              myFilter.push(channelgroup);
              myFilter.push(channeltype);
            }
            continue;
          } else if (each === 'Category') {
            if (this._filterFilledData[group][each]?.length > 0) {
              const category = {
                name: allFilterReply[each].TicketsCname,
                type: allFilterReply[each].type,
                value: [],
              };
              const department = {
                name: allFilterReply[each].TicketsDname,
                type: allFilterReply[each].type,
                value: [],
              };
              const subCategory = {
                name: allFilterReply[each].TicketsSname,
                type: allFilterReply[each].type,
                value: [],
              };
              if (this._filterFilledData[group][each + 'condition']) {
                category.name = allFilterReply[each].TicketsCname;
                department.name = allFilterReply[each].TicketsDname;
                subCategory.name = allFilterReply[each].TicketsSname;
              } else {
                category.name = allFilterReply[each].MentionCname;
                department.name = allFilterReply[each].MentionDname;
                subCategory.name = allFilterReply[each].MentionSname;
              }
              for (const each1 of Object.keys(
                this._filterFilledData[group][each]
              )) {
                if (this._filterFilledData[group][each][each1].level === 0) {
                  category.value.push(
                    this.fetchedCategoryDatacategory[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
                if (this._filterFilledData[group][each][each1].level === 1) {
                  department.value.push(
                    this.fetchedCategoryDatadepartment[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
                if (this._filterFilledData[group][each][each1].level === 2) {
                  subCategory.value.push(
                    this.fetchedCategoryDatasubCategory[
                      this._filterFilledData[group][each][each1].item
                    ]
                  );
                }
              }
              if (category.value.length > 0) {
                myFilter.push(category);
              }
              if (department.value.length > 0) {
                myFilter.push(department);
              }
              if (subCategory.value.length > 0) {
                myFilter.push(subCategory);
              }
            }
            continue;
          } else if (each === 'upperCategory') {
            if (
              this._filterFilledData[group][each] &&
              this._filterFilledData[group][each] !==
                this.filterData[group][each].default &&
              this._filterFilledData[group][each] !== null
            ) {
              const upperCategory = {
                name: allFilterReply[each].Ticketsname,
                type: allFilterReply[each].type,
                value: this._filterFilledData[group][each],
              };
              if (this._filterFilledData[group][each + 'condition']) {
                upperCategory.name = allFilterReply[each].Ticketsname;
              } else {
                upperCategory.name = allFilterReply[each].Mentionname;
              }
              myFilter.push(upperCategory);
            }
            continue;
          } else if (
            this._filterFilledData[group][each] !==
              this.filterData[group][each].default &&
            this._filterFilledData[group][each] !== null
          ) {
            if (each in allFilterReply) {
              if (Array.isArray(this._filterFilledData[group][each])) {
                if (
                  this._filterFilledData[group][each].length < 1 ||
                  this._filterFilledData[group][each][0] == null
                ) {
                  continue;
                }
              }
              const eachFilters = new EachFilters();
              eachFilters.name = allFilterReply[each].name;
              eachFilters.type = allFilterReply[each].type;
              if (each === 'socialProfile') {
                const value = [];
                for (const eachbtaid of this._filterFilledData[group][each]) {
                  if (eachbtaid === 'All') {
                    continue;
                  }
                  const eachval = this.fetchedSocialProfile.find(
                    (b) => b.btaid === eachbtaid
                  );
                  const eachSocialProfile = new SocialProfileValue();
                  eachSocialProfile.BrandID = eachval.brandID;
                  eachSocialProfile.ChannelGroupID = eachval.channelGroupID;
                  eachSocialProfile.BTAID = eachval.btaid;
                  value.push(eachSocialProfile);
                }
                eachFilters.value = value;
              } else {
                eachFilters.value = this._filterFilledData[group][each];
              }
              myFilter.push(eachFilters);
            }
          }
        }
      }
    }
    this.FilterFilledDataReply.categoryID = 0;
    this.FilterFilledDataReply.brands = brandInfo;
    this.FilterFilledDataReply.categoryName = 'string';
    this.FilterFilledDataReply.startDateEpoch = startDateEpcoh1;
    this.FilterFilledDataReply.endDateEpoch = endDateEpoch1;
    this.FilterFilledDataReply.isCustom = isCustom;
    this.FilterFilledDataReply.userID = 0;
    this.FilterFilledDataReply.userRole = 4;
    (this.FilterFilledDataReply.filters = myFilter),
      (this.FilterFilledDataReply.notFilters = excludeFilter);
    this.FilterFilledDataReply.isAdvance = false;
    this.FilterFilledDataReply.query = 'string';

    if (
      (
        (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
          'whatToMonitor'
        ) as UntypedFormControl
      ).value === 1
    ) {
      this.FilterFilledDataReply.orderBYColumn =
        ticketMentionDropdown.sortBy[
          this._postOptionService.optionForm.controls.sortBy.value
        ].mention;
    } else {
      this.FilterFilledDataReply.orderBYColumn =
        ticketMentionDropdown.sortBy[
          this._postOptionService.optionForm.controls.sortBy.value
        ].ticket;
    }
    this.FilterFilledDataReply.orderBY =
      ticketMentionDropdown.sortOrder.value[
        +this._postOptionService.optionForm.controls.sortOrder.value
      ];
    this.FilterFilledDataReply.isRawOrderBy = false;
    this.FilterFilledDataReply.oFFSET = 0;
    this.FilterFilledDataReply.noOfRows = 10;
    this.callFilterCountAPI(this.FilterFilledDataReply);
  }

  callFilterCountAPI(body): void {
    // this._mainService.GetTicketsCount(body).subscribe
    // (
    //     resData => { this.filterCount = resData; }
    // );
  }

  public setTicketType(value: number): void {
    if (!this.FilterFilledDataReply) {
      this.FilterFilledDataReply = {};
    }
    this.FilterFilledDataReply.ticketType = [value];
  }

  public setMention(value1: number[]): void {
    const filters = [];
    for (const eachFilters of this.FilterFilledDataReply.filters) {
      if (eachFilters.name === 'isbrandactivity') {
        continue;
      }
      filters.push(eachFilters);
    }
    this.FilterFilledDataReply.filters = filters;
    const brandActivity = {
      name: allFilterReply.Mentions.name,
      type: allFilterReply.Mentions.type,
      value: value1,
    };
    if (value1[0] === 2) {
      const filters = [];
      let count = 0;
      for (const eachFilters of this.FilterFilledDataReply.filters) {
        if (eachFilters.name === 'brandpostorreply') {
          continue;
        }
        if (eachFilters.name === 'isactionable') {
          count += 1;
        }
        filters.push(eachFilters);
      }
      if (count === 0) {
        filters.push({
          name: allFilterReply.userActivity.name,
          type: allFilterReply.userActivity.type,
          value: allFilterReply.userActivity.value,
        });
        (
          (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
            'Mentions'
          ) as UntypedFormControl
        )
          .get('User Activity')
          .patchValue(true);
        this.togleActionable(true);
        this.togleNonActionable(true);
      }
      (
        (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
          'Mentions'
        ) as UntypedFormControl
      )
        .get('Brand Activity')
        .patchValue(false);
      this.togleBrandPost(false);
      this.togleBrandReplies(false);
      this.FilterFilledDataReply.filters = filters;
    } else {
      const filters = [];
      let count = 0;
      for (const eachFilters of this.FilterFilledDataReply.filters) {
        if (eachFilters.name === 'isactionable') {
          continue;
        }
        if (eachFilters.name === 'brandpostorreply') {
          count += 1;
        }
        filters.push(eachFilters);
      }
      if (count === 0) {
        filters.push({
          name: allFilterReply.brandActivity.name,
          type: allFilterReply.brandActivity.type,
          value: allFilterReply.brandActivity.value,
        });
        (
          (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
            'Mentions'
          ) as UntypedFormControl
        )
          .get('Brand Activity')
          .patchValue(true);
        this.togleBrandPost(true);
        this.togleBrandReplies(true);
      }
      (
        (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
          'Mentions'
        ) as UntypedFormControl
      )
        .get('User Activity')
        .patchValue(false);
      this.togleActionable(false);
      this.togleNonActionable(false);
      this.FilterFilledDataReply.filters = filters;
    }
    this.FilterFilledDataReply.filters.push(brandActivity);
    this.getGenericFilter();
  }
  setSearchInFilter(value: string): void {
    this.FilterFilledDataReply.SimpleSearch = value;
  }

  getNameByID(id: number, searchin: AssignToList[]): string {
    for (const each of searchin) {
      if (id === each.agentID) {
        return each.agentName;
      }
    }
  }

  ApplyFilter(): void {
    // this.currentBrandSource.next(true);
    this.currentBrandSourceSignal.set(true);
    this.filterTabSourceSignal.set(this._navigationService.currentSelectedTab);
  }

  searchInFilter(value: string): void {
    this.FilterFilledDataReply.SimpleSearch = value;
    this.ApplyFilter();
  }

  togleActionable(value: boolean): void {
    (
      (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
        'userActivity'
      ) as UntypedFormControl
    )
      .get('Actionable')
      .patchValue(value);
    this.getFilled(this.filterForm.value, true);
  }

  togleNonActionable(value: boolean): void {
    (
      (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
        'userActivity'
      ) as UntypedFormControl
    )
      .get('Non Actionable')
      .patchValue(value);
    this.getFilled(this.filterForm.value, true);
  }

  togleBrandPost(value: boolean): void {
    (
      (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
        'brandActivity'
      ) as UntypedFormControl
    )
      .get('Brand Post')
      .patchValue(value);
    this.getFilled(this.filterForm.value, true);
  }

  togleBrandReplies(value: boolean): void {
    (
      (this.filterForm.get('ticketsMentions') as UntypedFormGroup).get(
        'brandActivity'
      ) as UntypedFormControl
    )
      .get('Brand Replies')
      .patchValue(value);
    this.getFilled(this.filterForm.value, true);
  }

  public applyabouttobreach(): void {
    // do it here
    // this.generateForms();
    // ((this.filterForm.get('ticketsMentions') as FormGroup).get('TAT') as FormControl).patchValue(1);
    // this.getFilled(this.filterForm.value, false);
    const tabevent: TabEvent = {
      tab: this._navigationService.currentSelectedTab,
      event: FilterEvents.applyabouttobreach,
      value: '',
    };
    this.filterTabSignal.set(tabevent);
  }
  setAssignUserFilter(filterForm: UntypedFormGroup): UntypedFormGroup {
    // AssignTO dissable
    const currentUser = JSON.parse(localStorage.getItem('user')).data;
    const currentUserRole = currentUser.user.role;
    const show = currentUser.user.userRole.isSelfAssigned;

    (
      filterForm
        .get('ticketsMentions')
        .get('ticketsYouWantToSee') as UntypedFormControl
    ).valueChanges.subscribe((val) => {
      if (val !== 1) {
        (
          filterForm.get('teamcharacteristics').get('assigendTo') as UntypedFormControl
        ).patchValue([val]);
      } else {
        (
          filterForm.get('teamcharacteristics').get('assigendTo') as UntypedFormControl
        ).patchValue([]);
      }
    });

    if (
      UserRoleEnum.CustomerCare === currentUserRole ||
      UserRoleEnum.BrandAccount === currentUserRole
    ) {
      if (show) {
        filterForm
          .get('teamcharacteristics')
          .get('assigendTo')
          .patchValue([currentUser.user.userId]);
        // filterForm.get('teamcharacteristics').get('assigendTo').disable();
      }
    }
    return filterForm;
  }

  public reverseApply(
    saveFilter: GenericFilter,
    justForView: boolean = false
  ): any {
    let filterForm: UntypedFormGroup = this.generateForms();
    filterForm = this.setAssignUserFilter(filterForm);
    const brandid = [];
    if (saveFilter?.brands) {
      for (const each of saveFilter.brands) {
        brandid.push('' + each.brandID);
      }
      if (brandid.length > 0) {
        filterForm
          .get('brandDateDuration')
          .get('selectBrand')
          .patchValue(brandid);
        // const startDate = eachForm.get('StartDate');
        // const endDate = eachForm.get('EndDate');
        // // const Duration = eachForm.get('Duration');
        // startDate.patchValue(saveFilter.startDateEpoch);
        // endDate.patchValue(saveFilter.endDateEpoch);
        const brandDateDuration = filterForm.get(
          'brandDateDuration'
        ) as UntypedFormGroup;
        this.fillBrandSelected(brandDateDuration);
      } else {
        filterForm
          .get('brandDateDuration')
          .get('selectBrand')
          .patchValue([
            ...this.filterData.brandDateDuration.selectBrand.options.map(
              (item) => item.id
            ),
            'All',
          ]);
      }
    }
    // SET DURATION
    if (saveFilter.isCustom !== -1) {
      if (!saveFilter.isCustom) {
        saveFilter.isCustom = 1;
      }
      for (const each of filterData.brandDateDuration.Duration.options) {
        if (each.id === saveFilter.isCustom) {
          this.durationlabel = each.label;
        }
      }
      const eachForm = filterForm.get('brandDateDuration').get('Duration');
      const startDate = eachForm.get('StartDate');
      const endDate = eachForm.get('EndDate');
      startDate.patchValue(
        moment()
          .subtract(saveFilter.isCustom, 'days')
          .startOf('day')
          .utc()
          .unix()
      );
      endDate.patchValue(moment().endOf('day').utc().unix());
    } else {
      this.durationlabel = '-1';
      const eachForm = filterForm.get('brandDateDuration').get('Duration');
      const startDate = eachForm.get('StartDate');
      const endDate = eachForm.get('EndDate');
      startDate.patchValue(saveFilter.startDateEpoch);
      endDate.patchValue(saveFilter.endDateEpoch);
    }
    // set PostType and orderbycoloum
    if (saveFilter.postsType === PostsType.Tickets) {
      filterForm.get('ticketsMentions').get('whatToMonitor').patchValue(0);
      if (
        saveFilter.orderBYColumn ===
        ticketMentionDropdown.sortBy.DateCreated.ticket
      ) {
        this._postOptionService.setSortByValue('createdDate');
      }
      if (
        saveFilter.orderBYColumn ===
        ticketMentionDropdown.sortBy.lastUpdated.ticket
      ) {
        this._postOptionService.setSortByValue('lastUpdated');
      }
      if (
        saveFilter.orderBYColumn ===
        ticketMentionDropdown.sortBy.authorName.ticket
      ) {
        this._postOptionService.setSortByValue('authorName');
      }
    }
    if (saveFilter.postsType === PostsType.Mentions) {
      filterForm.get('ticketsMentions').get('whatToMonitor').patchValue(1);
      if (
        saveFilter.orderBYColumn ===
        ticketMentionDropdown.sortBy.DateCreated.mention
      ) {
        this._postOptionService.setSortByValue('createdDate');
      }
      if (
        saveFilter.orderBYColumn ===
        ticketMentionDropdown.sortBy.lastUpdated.mention
      ) {
        this._postOptionService.setSortByValue('lastUpdated');
      }
      if (
        saveFilter.orderBYColumn ===
        ticketMentionDropdown.sortBy.authorName.mention
      ) {
        this._postOptionService.setSortByValue('authorName');
      }
    }
    // Set order by asc or dsc
    if (saveFilter.orderBY === 'asc') {
      this._postOptionService.setSortOrderValue('0');
    } else {
      this._postOptionService.setSortOrderValue('1');
    }
    // Set Search BY observable
    this.setSearch.next(saveFilter.simpleSearch);
    for (const key of Object.keys(this.filterData)) {
      if (key === 'excludeFilters' || key === 'brandDateDuration') {
        continue;
      }
      if (key === 'Keywords') {
        const formGroup = filterForm.get(key);
        for (const attribute of saveFilter.filters) {
          if (attribute.name === 'keywordsearch') {
            const value = attribute.value;

            if (value.ShouldContain.length > 0) {
              const formAttri = formGroup.get('AND').get('array');
              formAttri.patchValue(value.ShouldContain);
              const formAttriCondition = formGroup.get('AND').get('category');
              formAttriCondition.patchValue(value.ShouldContainCondition);
            }
            if (value.MayContain.length > 0) {
              const formAttri = formGroup.get('Or');
              formAttri.patchValue(value.MayContain);
            }
            if (value.ShouldNotContain.length > 0) {
              const formAttri = formGroup.get('Donot');
              formAttri.patchValue(value.ShouldNotContain);
            }
          }
        }
        continue;
      }
      const value = this.filterData[key];
      const formGroup = filterForm.get(key);
      // filling form group
      for (const key1 of Object.keys(value)) {
        if (key1 === 'displayName' || key1 === 'refreshTime') {
          continue;
        }
        const value1 = formGroup.get(key1);
        const find = allFilterReply[key1];
        // if (find === null)
        // {

        // }
        if (key1 === 'myTickets') {
          if (saveFilter.ticketType.length > 0) {
            value1.patchValue([]);
          } else {
            value1.patchValue([]);
          }
          continue;
        }
        for (const attribute of saveFilter.filters) {
          if (key1 === 'brandActivity') {
            if (find.name === attribute.name) {
              const BrandReplies = value1.get('Brand Replies');
              BrandReplies.patchValue(false);
              const BrandPost = value1.get('Brand Post');
              BrandPost.patchValue(false);
              for (const num of attribute.value) {
                if (num === 0) {
                  BrandPost.patchValue(true);
                }
                if (num === 1) {
                  BrandReplies.patchValue(true);
                }
              }
            }
          } else if (key1 === 'userActivity') {
            if (find.name === attribute.name) {
              const Actionable = value1.get('Actionable');
              Actionable.patchValue(false);
              const nonActionable = value1.get('Non Actionable');
              nonActionable.patchValue(false);
              for (const num of attribute.value) {
                if (num === 0) {
                  nonActionable.patchValue(true);
                }
                if (num === 1) {
                  Actionable.patchValue(true);
                }
              }
            }
          } else if (key1 === 'Mentions') {
            if (find.name === attribute.name) {
              const userActivity = value1.get('User Activity');
              userActivity.patchValue(false);
              const brandActivity = value1.get('Brand Activity');
              brandActivity.patchValue(false);
              for (const num of attribute.value) {
                if (num === 1) {
                  brandActivity.patchValue(true);
                }
                if (num === 2) {
                  userActivity.patchValue(true);
                }
              }
            }
          } else if (key1 === 'upperCategory') {
            // It's for Ticket
            if (find.Ticketsname === attribute.name) {
              const value2 = formGroup.get(key1 + 'condition');
              value2.patchValue(true);
              value1.patchValue(attribute.value);
            }
            // It's for Mention
            if (find.Mentionname === attribute.name) {
              const value2 = formGroup.get(key1 + 'condition');
              value2.patchValue(false);
              value1.patchValue(attribute.value);
            }
          }
          // {item: "Facebook", level: 0, expandable: true}
          else if (key1 === 'Category') {
            const categoryCondition = formGroup.get(key1 + 'condition');
            const list = [];
            for (const attribute of saveFilter.filters) {
              if (
                find.TicketsCname === attribute.name ||
                find.MentionCname === attribute.name
              ) {
                if (find.TicketsCname === attribute.name) {
                  categoryCondition.patchValue(true);
                } else {
                  categoryCondition.patchValue(false);
                }
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedCategoryDatacategoryidname[groupid],
                    level: 0,
                    expandable: true,
                  });
                }
              }
              if (
                find.TicketsDname === attribute.name ||
                find.MentionDname === attribute.name
              ) {
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedCategoryDatadepartmentidname[groupid],
                    level: 1,
                    expandable: false,
                  });
                }
              }
              if (
                find.TicketsSname === attribute.name ||
                find.MentionSname === attribute.name
              ) {
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedCategoryDatasubCategoryidname[groupid],
                    level: 2,
                    expandable: false,
                  });
                }
              }
            }
            value1.patchValue(list);
          } else if (key1 === 'Channel') {
            const list = [];
            for (const attribute of saveFilter.filters) {
              if (find.gname === attribute.name) {
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedChannelgroupidname[groupid],
                    level: 0,
                    expandable: true,
                  });
                }
              }
              if (find.tname === attribute.name) {
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedChanneltypeidname[groupid],
                    level: 1,
                    expandable: false,
                  });
                }
              }
            }
            value1.patchValue(list);
          } else if (attribute.name === find.name) {
            value1.patchValue(attribute.value);
          }
        }
      }
    }
    const excludeDisplay = {};
    const excludeFiltersForm: UntypedFormGroup = new UntypedFormGroup({});
    for (const key of Object.keys(this.filterData)) {
      if (
        key === 'excludeFilters' ||
        key === 'brandDateDuration' ||
        key === 'Keywords'
      ) {
        continue;
      }
      const value = this.filterData[key];
      // filling form group
      for (const key1 of Object.keys(value)) {
        if (
          key1 === 'displayName' ||
          key1 === 'refreshTime' ||
          key1 === 'brandActivity' ||
          key1 === 'userActivity' ||
          key1 === 'Mention'
        ) {
          continue;
        }
        const find = allFilterReply[key1];
        // if (find === null)
        // {
        //     ;
        // }
        for (const attribute of saveFilter.notFilters) {
          if (key1 === 'upperCategory') {
            // It's for Ticket
            if (find.Ticketsname === attribute.name) {
              excludeDisplay[this.filterData[key][key1].displayName] =
                this.filterData[key][key1];
              excludeFiltersForm.addControl(
                this.filterData[key][key1].displayName + 'condition',
                new UntypedFormControl(null)
              );
              excludeFiltersForm.addControl(
                this.filterData[key][key1].displayName,
                new UntypedFormControl(null)
              );
              const value1 = excludeFiltersForm.get(
                this.filterData[key][key1].displayName
              );
              const value2 = excludeFiltersForm.get(
                this.filterData[key][key1].displayName + 'condition'
              );
              value2.patchValue(true);
              value1.patchValue(attribute.value);
            }
            // It's for Mention
            if (find.Mentionname === attribute.name) {
              excludeDisplay[this.filterData[key][key1].displayName] =
                this.filterData[key][key1];
              excludeFiltersForm.addControl(
                this.filterData[key][key1].displayName + 'condition',
                new UntypedFormControl(null)
              );
              excludeFiltersForm.addControl(
                this.filterData[key][key1].displayName,
                new UntypedFormControl(null)
              );
              const value1 = excludeFiltersForm.get(
                this.filterData[key][key1].displayName
              );
              const value2 = excludeFiltersForm.get(
                this.filterData[key][key1].displayName + 'condition'
              );
              value2.patchValue(false);
              value1.patchValue(attribute.value);
            }
          }
          // {item: "Facebook", level: 0, expandable: true}
          else if (key1 === 'Category') {
            // excludeFiltersForm.addControl(this.filterData[key][key1].displayName + 'condition', null);
            // excludeFiltersForm.addControl(this.filterData[key][key1].displayName, null);
            const value1 = new UntypedFormControl(null);
            const categoryCondition = new UntypedFormControl(true);
            let isfill = false;
            const list = [];
            for (const attribute of saveFilter.filters) {
              if (
                find.TicketsCname === attribute.name ||
                find.MentionCname === attribute.name
              ) {
                isfill = true;
                if (find.TicketsCname === attribute.name) {
                  categoryCondition.patchValue(true);
                } else {
                  categoryCondition.patchValue(false);
                }
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedCategoryDatacategoryidname[groupid],
                    level: 0,
                    expandable: true,
                  });
                }
              }
              if (
                find.TicketsDname === attribute.name ||
                find.MentionDname === attribute.name
              ) {
                isfill = true;
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedCategoryDatadepartmentidname[groupid],
                    level: 1,
                    expandable: false,
                  });
                }
              }
              if (
                find.TicketsSname === attribute.name ||
                find.MentionSname === attribute.name
              ) {
                isfill = true;
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedCategoryDatasubCategoryidname[groupid],
                    level: 2,
                    expandable: false,
                  });
                }
              }
            }
            value1.patchValue(list);
            if (isfill) {
              excludeDisplay[this.filterData[key][key1].displayName] =
                this.filterData[key][key1];
              excludeFiltersForm.addControl(
                this.filterData[key][key1].displayName + 'condition',
                categoryCondition
              );
              excludeFiltersForm.addControl(
                this.filterData[key][key1].displayName,
                value1
              );
            }
          } else if (key1 === 'Channel') {
            const value1 = new UntypedFormControl(null);
            let isFill = false;
            const list = [];
            for (const attribute of saveFilter.filters) {
              if (find.gname === attribute.name) {
                isFill = true;
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedChannelgroupidname[groupid],
                    level: 0,
                    expandable: true,
                  });
                }
              }
              if (find.tname === attribute.name) {
                isFill = true;
                for (const groupid of attribute.value) {
                  list.push({
                    item: this.fetchedChanneltypeidname[groupid],
                    level: 1,
                    expandable: false,
                  });
                }
              }
            }
            value1.patchValue(list);
            if (isFill) {
              excludeDisplay[this.filterData[key][key1].displayName] =
                this.filterData[key][key1];
              excludeFiltersForm.addControl(
                this.filterData[key][key1].displayName,
                value1
              );
            }
          } else if (attribute.name === find.name) {
            const value1 = new UntypedFormControl(null);
            value1.patchValue(attribute.value);
            excludeDisplay[this.filterData[key][key1].displayName] =
              this.filterData[key][key1];
            excludeFiltersForm.addControl(
              this.filterData[key][key1].displayName,
              value1
            );
          }
        }
      }
    }
    const filterFromObject: FilterFilledData = filterForm.value;
    const excludeForm = excludeFiltersForm.value;
    filterFromObject.excludeFilters = excludeForm;
    if (justForView) {
      return filterFromObject;
    } else {
      // console.log(filterForm);
      this.filterForm = filterForm;
      this.excludeFiltersForm = excludeFiltersForm;
      this.excludeDisplay = excludeDisplay;
      this.getFilled(filterFromObject, true);
    }
  }

  getGenericFilter(): GenericFilter {
    // fills the brand value from brand array
    let currentUser: AuthUser;
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (currentUser = user));
    let brandInfo: BrandInfo[] = [];
    let startDateEpcoh1: number;
    let endDateEpoch1: number;
    let isCustom1: number;
    let filterArray = [];
    let notFiltersArray = [];
    let ticketType1 = [];
    let search: string = '';
    let postsType1: PostsType = PostsType.Tickets;
    if (this.FilterFilledDataReply) {
      brandInfo = this.FilterFilledDataReply.brands;
      startDateEpcoh1 = this.FilterFilledDataReply.startDateEpoch;
      endDateEpoch1 = this.FilterFilledDataReply.endDateEpoch;
      isCustom1 = this.FilterFilledDataReply.isCustom;
      filterArray = this.FilterFilledDataReply.filters;
      notFiltersArray = this.FilterFilledDataReply.notFilters;
    } else {
      for (const searchedBrand of this.fetchedBrandData) {
        const eachbrand: BrandInfo = {
          brandID: +searchedBrand.brandID,
          brandName: searchedBrand.brandName,
          categoryGroupID: +searchedBrand.categoryGroupID,
          mainBrandID: 0,
          // categoryID: +searchedBrand.categoryID,
          // categoryName: searchedBrand.categoryName,
          compititionBrandIDs: [0],
          brandFriendlyName: searchedBrand.brandFriendlyName,
          brandLogo: 'string',
          isBrandworkFlowEnabled: searchedBrand.isBrandworkFlowEnabled,
          brandGroupName: 'string',
        };
        brandInfo.push(eachbrand);
      }
      startDateEpcoh1 =
        this.filterForm.controls.brandDateDuration.value.Duration.StartDate;
      endDateEpoch1 =
        this.filterForm.controls.brandDateDuration.value.Duration.EndDate;
      isCustom1 =
        this.filterForm.controls.brandDateDuration.value.Duration.isCustom;
    }

    if (this.FilterFilledDataReply?.ticketType) {
      ticketType1 = this.FilterFilledDataReply.ticketType;
    }
    if (this.FilterFilledDataReply?.postsType) {
      if (+this.FilterFilledDataReply.postsType === 0) {
        postsType1 = PostsType.Tickets;
      } else {
        postsType1 = PostsType.Mentions;
      }
    }
    if (this.FilterFilledDataReply?.SimpleSearch) {
      search = this.FilterFilledDataReply.SimpleSearch;
    }

    this.genericFilter = {
      categoryID: 0,
      brands: brandInfo,
      categoryName: 'string',
      startDateEpoch: startDateEpcoh1,
      endDateEpoch: endDateEpoch1,
      isCustom: isCustom1,
      userID: currentUser?.data?.user?.userId,
      userRole: currentUser?.data?.user?.role,
      filters: filterArray,
      notFilters: notFiltersArray,
      isAdvance: false,
      query: 'string',
      orderBYColumn: this.FilterFilledDataReply.orderBYColumn,
      orderBY: this.FilterFilledDataReply.orderBY,
      isRawOrderBy: false,
      oFFSET: 0,
      noOfRows: 50,
      ticketType: ticketType1,
      simpleSearch: search,
      postsType: postsType1,
    };
    // console.log(JSON.stringify(this.genericFilter));
    // console.log('ME HERE')
    // this.reverseApply(this.genericFilter);
    return this.genericFilter;
  }

  getGenericFilterByTab(tabGuid: string): GenericFilter {
    // fills the brand value from brand array
    let currentUser: AuthUser;
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (currentUser = user));
    if (this.filterBasedOnTab.length > 0) {
      const filterindex = this.filterBasedOnTab.findIndex(
        (obj) => obj.tabid === tabGuid
      );
      if (filterindex > -1) {
        this.FilterFilledDataReply =
          this.filterBasedOnTab[filterindex].filledData;
      }
    }

    let brandInfo: BrandInfo[] = [];
    let startDateEpcoh1: number;
    let endDateEpoch1: number;
    let isCustom1: number;
    let filterArray = [];
    let notFiltersArray = [];
    let ticketType1 = [];
    let search: string = '';
    let postsType1: PostsType = PostsType.Tickets;
    if (this.FilterFilledDataReply) {
      brandInfo = this.FilterFilledDataReply.brands;
      startDateEpcoh1 = this.FilterFilledDataReply.startDateEpoch;
      endDateEpoch1 = this.FilterFilledDataReply.endDateEpoch;
      isCustom1 = this.FilterFilledDataReply.isCustom;
      filterArray = this.FilterFilledDataReply.filters;
      notFiltersArray = this.FilterFilledDataReply.notFilters;
    } else {
      for (const searchedBrand of this.fetchedBrandData) {
        const eachbrand: BrandInfo = {
          brandID: +searchedBrand.brandID,
          brandName: searchedBrand.brandName,
          categoryGroupID: +searchedBrand.categoryGroupID,
          mainBrandID: 0,
          // categoryID: +searchedBrand.categoryID,
          // categoryName: searchedBrand.categoryName,
          compititionBrandIDs: [0],
          brandFriendlyName: searchedBrand.brandFriendlyName,
          brandLogo: 'string',
          isBrandworkFlowEnabled: searchedBrand.isBrandworkFlowEnabled,
          brandGroupName: 'string',
        };
        brandInfo.push(eachbrand);
      }
      startDateEpcoh1 =
        this.filterForm.controls.brandDateDuration.value.Duration.StartDate;
      endDateEpoch1 =
        this.filterForm.controls.brandDateDuration.value.Duration.EndDate;
      isCustom1 =
        this.filterForm.controls.brandDateDuration.value.Duration.isCustom;
    }

    if (this.FilterFilledDataReply?.ticketType) {
      ticketType1 = this.FilterFilledDataReply.ticketType;
    }
    if (this.FilterFilledDataReply?.postsType) {
      if (+this.FilterFilledDataReply.postsType === 0) {
        postsType1 = PostsType.Tickets;
      } else {
        postsType1 = PostsType.Mentions;
      }
    } else {
      if (this._navigationService?.currentSelectedTab?.Filters) {
        postsType1 =
          this._navigationService.currentSelectedTab.Filters.postsType;
      }
    }
    if (this.FilterFilledDataReply?.SimpleSearch) {
      search = this.FilterFilledDataReply.SimpleSearch;
    }

    this.genericFilter = {
      categoryID: 0,
      brands: brandInfo,
      categoryName: 'string',
      startDateEpoch: startDateEpcoh1,
      endDateEpoch: endDateEpoch1,
      isCustom: isCustom1,
      userID: currentUser.data.user.userId,
      userRole: currentUser.data.user.role,
      filters: filterArray,
      notFilters: notFiltersArray,
      isAdvance: false,
      query: 'string',
      orderBYColumn: this.FilterFilledDataReply.orderBYColumn,
      orderBY: this.FilterFilledDataReply.orderBY,
      isRawOrderBy: false,
      oFFSET: 0,
      noOfRows: 50,
      ticketType: ticketType1,
      simpleSearch: search,
      postsType: postsType1,
    };
    // console.log(JSON.stringify(this.genericFilter));
    // console.log('ME HERE')
    // this.reverseApply(this.genericFilter);
    return this.genericFilter;
  }

  getGenericRequestFilter(mentionObj: BaseMention): GenericRequestParameters {
    let startDateEpcoh1: number;
    let endDateEpoch1: number;
    if (
      this._filterFilledData &&
      this._filterFilledData.brandDateDuration.selectBrand
    ) {
      startDateEpcoh1 =
        this._filterFilledData.brandDateDuration.Duration.StartDate;
      endDateEpoch1 = this._filterFilledData.brandDateDuration.Duration.EndDate;
    } else {
      startDateEpcoh1 =
        this.filterForm.controls.brandDateDuration.value.Duration.StartDate;
      endDateEpoch1 =
        this.filterForm.controls.brandDateDuration.value.Duration.EndDate;
    }

    const actionableValue = JSON.parse(localStorage.getItem('commlogfilter'));

    if(mentionObj.channelGroup == ChannelGroup.Email && mentionObj.channelType == ChannelType.Email && mentionObj.isBrandPost){
      mentionObj.author.socialId= mentionObj.inReplyToMail;
    }

    this.genericRequestParameter = {
      brandInfo: mentionObj.brandInfo,
      startDateEpoch: startDateEpcoh1,
      endDateEpoch: endDateEpoch1,
      ticketId: mentionObj.ticketInfo.ticketID,
      tagID: mentionObj.tagID,
      to: 1,
      from: 1,
      authorId: mentionObj.channelGroup == ChannelGroup.Email ? mentionObj.fromMail : mentionObj.author.socialId,
      author: this._locobuzzEntitiesService.mapMention(mentionObj).author,
      isActionableData: actionableValue != null ? actionableValue : 0,
      channel: mentionObj.channelGroup,
      isPlainLogText: false,
      targetBrandName: '',
      targetBrandID: 0,
      oFFSET: 0,
      noOfRows: 50,
      isCopy: true,
      IsAllChannel: 1
    };

    return this.genericRequestParameter;
  }

  getEmptyGenericFilter(): GenericFilter {
    return (this.genericFilter = {
      categoryID: 0,
      brands: [],
      categoryName: 'string',
      startDateEpoch: 0,
      endDateEpoch: 0,
      isCustom: 0,
      userID: 0,
      userRole: 0,
      filters: [],
      notFilters: [],
      isAdvance: false,
      query: 'string',
      orderBYColumn: 'DateCreated',
      orderBY: 'desc',
      isRawOrderBy: false,
      oFFSET: 0,
      noOfRows: 50,
      ticketType: [],
      simpleSearch: '',
      postsType: 0,
    });
  }

  CategoryBrandReplySetting(): Observable<CategoryBrandReplySetting> {
    return this._http
      .post<CategoryBrandReplySetting>(
        environment.baseUrl + '/Account/GetCategoryBrandLevelBulkReplySettings',
        {}
      )
      .pipe(
        map((response) => {
          if (response.success) {
            const categoryBrandReplySetting: CategoryBrandReplySetting =
              response;
            return categoryBrandReplySetting;
          }
        })
      );
  }

  filterAllTicketListBasedOnId(value) {
    let ticketList = [];
    if (value === 1) {
      // ticketList = [
      //   { id: 4, label: 'Open Tickets' },
      //   { id: 8, label: 'Awaiting Response from Customer' },
      //   { id: 2, label: 'Closed' },
      //   { id: 5, label: 'Pending' },
      //   { id: 0, label: 'All Tickets' },
      //   { id: 17, label: 'Assigned to Me' },
      //   { id: 10, label: 'Reply received for Approval' },
      //   { id: 21, label: 'Rejected Replies' },
      //   { id: 7, label: 'On Hold Tickets' },
      //   { id: 18, label: 'Approved by CSD' },
      //   { id: 13, label: 'Rejected by CSD' },
      //   { id: 14, label: 'Approved by Brand' },
      //   { id: 15, label: 'Rejected by Brand' },
      //   { id: 19, label: 'Escalated to CSD' },
      //   { id: 16, label: 'Escalated to Brand' },
      //   { id: 1, label: 'Awaiting Response Tickets' },
      //   { id: 8, label: 'Awaiting From Customer' },
      //   { id: 6, label: 'Unassigned Tickets' },
      //   { id: 7, label: 'On Hold Tickets' },
      //   { id: 9, label: 'Not Closed' },
      //   { id: 10, label: 'Awaiting TL Approval' },
      //   { id: 12, label: 'SSRE' },
      //   { id: 22, label: 'SR Open' },
      //   { id: 23, label: 'SR Updated' },
      //   { id: 24, label: 'SR Closed' },
      // ];
      ticketList = this.getFilterTicketStatusBasedOnRolesEnum();
    } else {
      ticketList = [
        { id: 4, label: 'Open Tickets' },
        { id: 8, label: 'Awaiting Response from Customer' },
        { id: 2, label: 'Closed' },
        { id: 5, label: 'Pending' },
      ];
    }
    return ticketList;
  }

  getFilterTicketStatusBasedOnRolesEnum(): Array<[]> {
    const currentUser = this.localStorageService.getCurrentUserData();
    let ticketstatusList = [];
    if (currentUser?.data?.user.role === UserRoleEnum.Agent) {
      ticketstatusList = [
        { id: 0, label: 'All Tickets' },
        { id: 4, label: 'Open Tickets' },
        { id: 5, label: 'Pending' },
        { id: 1, label: 'Awaiting Response Tickets' },
        { id: 2, label: 'Closed' },
        { id: 7, label: 'On Hold Tickets' },
        { id: 8, label: 'Awaiting Response from Customer' },
        { id: 10, label: 'Awaiting TL Approval' },
        { id: 25, label: 'Rejected By TL ' },
        { id: 22, label: 'SR Open' },
        { id: 23, label: 'SR Updated' },
        { id: 24, label: 'SR Closed' },
      ];
    }
    if (currentUser?.data?.user.role === UserRoleEnum.CustomerCare) {
      ticketstatusList = [
        { id: 0, label: 'All Tickets' },
        { id: 4, label: 'Open Tickets' },
        { id: 5, label: 'Pending' },
        { id: 1, label: 'Awaiting Response Tickets' },
        { id: 2, label: 'Closed' },
        { id: 7, label: 'On Hold Tickets' },
        { id: 22, label: 'SR Open' },
        { id: 23, label: 'SR Updated' },
        { id: 24, label: 'SR Closed' },
      ];
    }
    if (currentUser?.data?.user.role === UserRoleEnum.SupervisorAgent || currentUser?.data?.user.role === UserRoleEnum.LocationManager) {
      ticketstatusList = [
        { id: 0, label: 'All Tickets' },
        { id: 4, label: 'Open Tickets' },
        { id: 5, label: 'Pending' },
        { id: 1, label: 'Awaiting Response Tickets' },
        { id: 2, label: 'Closed' },
        { id: 6, label: 'Unassigned Tickets' },
        { id: 7, label: 'On Hold Tickets' },
        { id: 8, label: 'Awaiting Response from Customer' },
        { id: 10, label: 'Awaiting TL Approval' },
        { id: 25, label: 'Rejected By TL ' },
        { id: 22, label: 'SR Open' },
        { id: 23, label: 'SR Updated' },
        { id: 24, label: 'SR Closed' },
      ];
    }
    if (currentUser?.data?.user.role === UserRoleEnum.BrandAccount) {
      ticketstatusList = [
        { id: 0, label: 'All Tickets' },
        { id: 4, label: 'Open Tickets' },
        { id: 2, label: 'Closed' },
        { id: 7, label: 'On Hold Tickets' },
        { id: 22, label: 'SR Open' },
        { id: 23, label: 'SR Updated' },
        { id: 24, label: 'SR Closed' },
      ];
    }
    if (currentUser?.data?.user.role === UserRoleEnum.TeamLead) {
      ticketstatusList = [
        { id: 0, label: 'All Tickets' },
        { id: 4, label: 'Open Tickets' },
        { id: 5, label: 'Pending' },
        { id: 1, label: 'Awaiting Response Tickets' },
        { id: 2, label: 'Closed' },
        { id: 6, label: 'Unassigned Tickets' },
        { id: 7, label: 'On Hold Tickets' },
        { id: 8, label: 'Awaiting Response from Customer' },
        { id: 10, label: 'Awaiting TL Approval' },
        { id: 25, label: 'Rejected By TL ' },
        { id: 22, label: 'SR Open' },
        { id: 23, label: 'SR Updated' },
        { id: 24, label: 'SR Closed' },
      ];
    }
    if (currentUser?.data?.user.role === UserRoleEnum.WarRoom) {
      ticketstatusList = [
        { id: 0, label: 'All Tickets' },
        { id: 4, label: 'Open Tickets' },
        { id: 5, label: 'Pending' },
        { id: 1, label: 'Awaiting Response Tickets' },
        { id: 2, label: 'Closed' },
        { id: 7, label: 'On Hold Tickets' },
        { id: 8, label: 'Awaiting Response from Customer' },
      ];
    }
    return ticketstatusList;
  }

  getchannelGroupBasedOnChannelType(channelType): number {
    let channelgroup: number;
    if (
      channelType == ChannelType.AutomotiveIndiaPost ||
      channelType == ChannelType.AutomotiveIndiaComment ||
      channelType == ChannelType.AutomotiveIndiaOtherPostsComments
    ) {
      channelgroup = ChannelGroup.AutomotiveIndia;
    } else if (
      channelType == ChannelType.FacebookChatbot ||
      channelType == ChannelType.WesiteChatbot ||
      channelType == ChannelType.AndroidChatbot ||
      channelType == ChannelType.IOSChatbot ||
      channelType == ChannelType.LineChatbot ||
      channelType == ChannelType.WhatsAppChatbot ||
      channelType == 71
    ) {
      channelgroup = ChannelGroup.WebsiteChatBot;
    } else if (
      channelType == ChannelType.DiscourseTopic ||
      channelType == ChannelType.DiscoursePost
    ) {
      channelgroup = ChannelGroup.Discourse;
    } else if (
      channelType == ChannelType.ECommercePosts ||
      channelType == ChannelType.ECommerceComments
    ) {
      channelgroup = ChannelGroup.ECommerceWebsites;
    } else if (
      channelType == ChannelType.ElectronicMedia ||
      channelType == 57
    ) {
      channelgroup = ChannelGroup.ElectronicMedia;
    } else if (
      channelType == ChannelType.FBComments ||
      channelType == ChannelType.FBMessages ||
      channelType == ChannelType.FbMediaPosts ||
      channelType == ChannelType.FBMediaComments ||
      channelType == ChannelType.FBPageUser ||
      channelType == ChannelType.FBPublic ||
      channelType == ChannelType.FBReviews ||
      channelType == ChannelType.FbGroupComments ||
      channelType == ChannelType.FbGroupPost
    ) {
      channelgroup = ChannelGroup.Facebook;
    } else if (
      channelType == ChannelType.GoogleMyReview ||
      channelType == ChannelType.GMBQuestion ||
      channelType == ChannelType.GMBAnswers ||
      channelType==ChannelType.GMBpost
    ) {
      channelgroup = ChannelGroup.GoogleMyReview;
    }
    else if (
      channelType == ChannelType.Survey
    ) {
      channelgroup = ChannelGroup.Survey;
    }
     else if (channelType == ChannelType.MyGovComments ||
      channelType == ChannelType.MyGovPosts) {
      channelgroup = ChannelGroup.MyGov;
    }
     else if (
      channelType == ChannelType.InstagramMessages ||
      channelType == ChannelType.InstagramUserPosts ||
      channelType == ChannelType.InstagramComments ||
      channelType == ChannelType.InstagramPublicPosts ||
      channelType == ChannelType.InstagramPagePosts
    ) {
      channelgroup = ChannelGroup.Instagram;
    } else if (
      channelType == ChannelType.LinkedInPublic ||
      channelType == ChannelType.LinkedInComments ||
      channelType == ChannelType.LinkedInMediaPosts ||
      channelType == ChannelType.LinkedInMediaComments ||
      channelType == ChannelType.LinkedinMessage ||
      channelType == ChannelType.LinkedInPageUser
    ) {
      channelgroup = ChannelGroup.LinkedIn;
    } else if (
      channelType == ChannelType.ReviewWebsitePosts ||
      channelType == ChannelType.ReviewWebsiteComments
    ) {
      channelgroup = ChannelGroup.ReviewWebsites;
    } else if (
      channelType == ChannelType.TeamBHPPosts ||
      channelType == ChannelType.TeamBHPComments ||
      channelType == ChannelType.TeamBHPOtherPostsComments
    ) {
      channelgroup = ChannelGroup.TeamBHP;
    } else if (
      channelType == ChannelType.PublicTweets ||
      channelType == ChannelType.BrandTweets ||
      channelType == ChannelType.Twitterbrandmention ||
      channelType == ChannelType.DirectMessages
    ) {
      channelgroup = ChannelGroup.Twitter;
    } else if (
      channelType == ChannelType.YouTubePosts ||
      channelType == ChannelType.YouTubeComments
    ) {
      channelgroup = ChannelGroup.Youtube;
    } else if (
      channelType == ChannelType.ZomatoPost ||
      channelType == ChannelType.ZomatoComment
    ) {
      channelgroup = ChannelGroup.Zomato;
    } else if (
      channelType == ChannelType.QuoraAnswer ||
      channelType == ChannelType.QuoraComment ||
      channelType == ChannelType.QuoraQuestion
    ) {
      channelgroup = ChannelGroup.Quora;
    } else if (channelType == ChannelType.TikTokBrandPost || channelType == ChannelType.TikTokComments) {
      channelgroup = ChannelGroup.TikTok;
    } else if (channelType == ChannelType.TelegramMessages || channelType == ChannelType.TelegramGroupMessages) {
      channelgroup = ChannelGroup.Telegram;
    } else if (channelType == ChannelType.PantipTopics || channelType == ChannelType.PantipComments) {
      channelgroup = ChannelGroup.Pantip;
    } else if (channelType == ChannelType.RedditPost || channelType == ChannelType.RedditComment) {
      channelgroup = ChannelGroup.Reddit;
    }

    return channelgroup;
  }

  resetFilterServiceValues(): void {
    // reset any values for filter service
    this.filterApiSuccessFull.next(null);
  }

  createPillBasedOnFilterjson(filterObj,currentUser:AuthUser): any[] {
    const currentUserData = this.localStorageService.getCurrentUserData();
    let filterCardChip = [];
    let addedFilters = new Set<string>();
    // const filterObj = this.getGenericFilterByTab(
    //   this.postDetailTab.tab.guid
    // );
    filterCardChip = [];
    this.brandList = [];
    // this.fetchBrandDetails();
    // if (filterObj.brands.length == this.AllBrands.length) {
    //   this.AllBrands.forEach((obj) => {
    //     this.brandList.push({
    //       brandFriendlyName: obj.brandFriendlyName,
    //       brandID: obj.brandID,
    //       checked: true,
    //       imgUrl: obj.rImageURL,
    //     });
    //   });
    // } else {
    //   filterObj.brands.forEach((element) => {
    //     this.AllBrands.forEach((obj) => {
    //       if (+obj.brandID == element.brandID) {
    //         obj.checked == true;
    //       } else {
    //         obj.checked = false;
    //       }
    //     });
    //   });

    //   this.AllBrands.forEach((obj) => {
    //     this.brandList.push({
    //       brandFriendlyName: obj.brandFriendlyName,
    //       brandID: obj.brandID,
    //       checked: obj.checked,
    //       imgUrl: obj.rImageURL,
    //     });
    //   });
    // }
    this.brandListSearchList = this.brandList;
    if (filterObj.brands && filterObj.brands.length > 0) {
      if (
        filterObj.brands.length > 1 &&
        filterObj.brands.length === this.fetchedBrandData.length
      ) {
        filterCardChip.push({
          name: 'Brands',
          value: 'All',
        });
        this.brandList.unshift({
          brandFriendlyName: 'All',
          brandID: 'All',
          checked: true,
          imgUrl: '',
        });
      } else {
        let stringValue = '';
        this.brandList.unshift({
          brandFriendlyName: 'All',
          brandID: 'All',
          checked: false,
          imgUrl: '',
        });
        if (filterObj.brands.length > 3) {
          const firstFiveChannel = filterObj.brands.slice(0, 3);
          const allChannels = [];
          firstFiveChannel.forEach((val) => {
            stringValue += val.brandFriendlyName + ', ';
          });
          filterObj.brands.slice(3, filterObj.brands.length).forEach((val) => {
            const brandInfo = this.fetchedBrandData.find(
              (obj) => obj.brandID == String(val.brandID)
            );
            if (brandInfo) {
              allChannels.push({
                name: val.brandFriendlyName,
                imgUrl: brandInfo.rImageURL,
              });
            }
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          let arr = [];
          arr = stringValue.split(',');
          let newValue = arr.concat(allChannels);
          filterCardChip.push({
            name: 'Brands',
            value: newValue,
          });
        } else {
          filterObj.brands.forEach((val) => {
            stringValue += val.brandFriendlyName + ', ';
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          const arr = [];
          arr.push(stringValue);
          filterCardChip.push({
            name: 'Brands',
            value: arr,
          });
        }
        this.brandList.forEach((brandObj) => {
          if (
            filterObj.brands.some(
              (obj) => String(obj.brandID) == brandObj.brandID
            )
          ) {
            brandObj.checked = true;
          }
        });
      }
    }

    if (filterObj.startDateEpoch && filterObj.startDateEpoch) {
      let startDate, endDate, dateValue;
      startDate = moment(filterObj.startDateEpoch * 1000);
      endDate = moment(filterObj.endDateEpoch * 1000);
      this.selected = {
        startDate: startDate,
        endDate: endDate,
      };
      for (const [key, value] of Object.entries(this.ranges)) {
        if (value[0].isSame(startDate._d) || value[1].isSame(endDate._d)) {
          dateValue = key;
          let arr = [];
          arr.push(dateValue);
          filterCardChip.push({
            name: 'Duration',
            value: arr,
          });
        }
      }
      if (!dateValue) {
        dateValue = `${moment(startDate).format('D/MM/yyyy h:mm A')} - ${moment(
          endDate
        ).format('D/MM/yyyy h:mm A')}`;
        let arr = [];
        arr.push(dateValue);
        filterCardChip.push({
          name: 'Duration',
          value: arr,
        });
      }
    }
    if (filterObj?.ticketType?.length > 0) {
      let arr = [];
      for (const sType of filterObj?.ticketType || []) {
        const ticketStatusId = sType;
        if (
          ticketStatusId != 4 &&
          ticketStatusId != 8 &&
          ticketStatusId != 2 &&
          ticketStatusId != 0 &&
          ticketStatusId != 6 &&
          ticketStatusId != 12 &&
          ticketStatusId != 20 &&
          ticketStatusId != 9 &&
          ticketStatusId != 7 &&
          ticketStatusId != 5 &&
          ticketStatusId != 1 &&
          ticketStatusId != 10 &&
          ticketStatusId != 0
        ) {
          const ticketStausObj = this.filterData.ticketsMentions.myTickets.options.filter((obj) => obj.id == ticketStatusId);
          const a = ticketStausObj[0].label;
          arr.push(a);
        }
      }
      if (arr?.length > 0) {
        filterCardChip.push({
          name: 'Ticket Status',
          value: arr,
        });
      }
    }

    if (filterObj.filters && filterObj.filters.length > 0) {
      if (currentUserData?.data.user.role === UserRoleEnum.Agent) {
        filterObj.filters = filterObj.filters.filter(
          (obj) => obj.name != 'UsersWithTeam'
        );
      }
      filterObj.filters.forEach((obj) => {
        const fieldName = obj.name;
        if (fieldName === 'TATBreached') {
          const a = obj.value == 1 ? 'About To Breached' : 'Already Breached';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'SLA',
            value: arr,
          });
        } else if (fieldName === 'orderid') {
          filterCardChip.push({
            name: 'OrderId',
            value: obj.value,
          });
        } else if (fieldName === 'AutoClousre') {
          const a = obj.value === true ? 'Yes' : 'No';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Autoclosure enabled',
            value: arr,
          });
        } else if (fieldName === 'TicketSubscribe') {
          const a = obj.value === true ? 'Yes' : 'No';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Subscribe Ticket',
            value: arr,
          });
        } else if (fieldName === 'HideRetweet') {
          const a = obj.value === true ? 'Yes' : 'No';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Retweet',
            value: arr,
          });
        } else if (fieldName === 'QuoteTweet') {
          const a = obj.value === true ? 'Yes' : 'No';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Quote Tweet',
            value: arr,
          });
        } else if (fieldName === 'TaggedBy') {
          const a = obj.value === 1 ? 'Machine' : 'User';
          let arr = [a];
          filterCardChip.push({
            name: 'Tagged By',
            value: arr,
          });
        } else if (fieldName === 'Priority') {
          let stringValue = '';
          obj.value.forEach((value) => {
            stringValue +=
              value == 0
                ? 'Low, '
                : value == 1
                ? 'Medium, '
                : value == 2
                ? 'High, '
                : 'Urgent, ';
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          let newVal = [];
          newVal = stringValue.split(',');
          filterCardChip.push({ name: 'Priority', value: newVal });
        } else if (fieldName === 'MediaType') {
          let stringValue = '';
          obj.value.forEach((value) => {
            if (value != 0) {
            stringValue +=
              value == 1
                ? 'Text, '
                : value == 2
                ? 'Image Post, '
                : value == 3
                ? 'Video Post, '
                : 'Links, ';
            }
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          let newVal = [];
          newVal = stringValue.split(',');
          filterCardChip.push({
            name: 'Media type',
            value: newVal,
          });
        } else if ( fieldName === 'MentionUpperCategory' || fieldName === 'TicketUpperCategory') {
          const filterBasicListData = this.fillFilterBasicListData;
          let fetchedUpperCategoryData = filterBasicListData.upperCategories;
          if (!fetchedUpperCategoryData) {
            fetchedUpperCategoryData = [];
          }
          let stringValue = '';
          obj.value = obj.value.filter((element) => element);
          const firstCategory = obj.value.slice(0, 5);
          const allUpperCategory = [];
          if (obj.value.length > 5) {
            firstCategory.forEach((val) => {
              const upperCategoryData = fetchedUpperCategoryData.find(
                (obj) => obj.id == val
              );
              if (upperCategoryData) {
                stringValue += upperCategoryData.name + ', ';
              }
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              const upperCategoryData = fetchedUpperCategoryData.find(
                (obj) => obj.id == val
              );
              if (upperCategoryData) {
                allUpperCategory.push(upperCategoryData.name);
              }
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr = stringValue.split(',');
            let newValue = arr.concat(allUpperCategory);
            filterCardChip.push({
              name: 'Upper Category',
              value: newValue,
            });
          } else {
            obj.value.forEach((val) => {
              const upperCategoryData = fetchedUpperCategoryData.find(
                (obj) => obj.id == val
              );
              if (upperCategoryData) {
                stringValue += upperCategoryData.name + ', ';
              }
            });

            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr = stringValue.split(',');
            let newValue = arr.concat(allUpperCategory);
            filterCardChip.push({
              name: 'Upper Category',
              value: newValue,
            });
          }
        } else if (fieldName === 'TicketCategory' || fieldName === 'MentionCategory'
          || fieldName.includes('SubCategory')
          || fieldName.includes('SubSubCategory')
        ) {
          if (obj.value.length > 0) {
            const categoryList = [];
            for (const val of obj.value) {
              if (val) {
                if (fieldName == 'TicketSubCategory' || fieldName == 'MentionSubCategory') {
                  categoryList.push(this.fetchedCategoryDatadepartmentidname[val]);
                }
                else if (fieldName == 'TicketSubSubCategory' || fieldName == 'MentionSubSubCategory') {
                  categoryList.push(this.fetchedCategoryDatasubCategoryidname[val]);
                }
                else {
                  categoryList.push(this.fetchedCategoryDatacategoryidname[val]);
                }
              }
            }
            if(categoryList.length > 0){
              if (filterCardChip.some(item => item.name == 'Category')) {
                const existCategory = filterCardChip.findIndex(item => item.name == 'Category');
                filterCardChip[existCategory].value = [...filterCardChip[existCategory].value, ...categoryList];
              }
              else {
                filterCardChip.push({
                  name: 'Category',
                  value: categoryList,
                });
              }
            }
          }
        } else if (fieldName === 'ChannelGroup') {
          let stringValue = '';
          if (obj.value.length > 2) {
            const firstFiveChannel = obj.value.slice(0, 2);
            const allChannels = [];
            firstFiveChannel.forEach((val) => {
              stringValue += this.fetchedChannelgroupidname[val] + ', ';
            });
            obj.value.slice(2, obj.value.length).forEach((val) => {
              allChannels.push(this.fetchedChannelgroupidname[val]);
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr = stringValue.split(',');
            let newValue = arr.concat(allChannels);
            filterCardChip.push({
              name: 'Channels',
              value: newValue,
            });
          } else {
            obj.value.forEach((val) => {
              stringValue += this.fetchedChannelgroupidname[val] + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr.push(stringValue);
            filterCardChip.push({
              name: 'Channels',
              value: arr,
            });
          }
        } else if (fieldName === 'ChannelType') {
          if (obj.value.length > 0) {
            const channelList = [];
            for (const val of obj.value) {
              channelList.push(this.fetchedChanneltypeidname[val]);
            }
            filterCardChip.push({
              name: 'Channel Types',
              value: channelList,
            });
          }
        } else if (fieldName === 'socialprofiles') {
          const allSocialProfile = [];
          for (const item of obj?.value) {
            const locationID = item?.locationID;
            const authorObj = this.fetchedSocialProfile.find((element) => element.btaid == item.BTAID);
            if (authorObj) {
              let label;
              if (locationID instanceof Array && locationID.includes('-1')) label = 'All';
              else label = locationID?.length;
              console.log(label)
              allSocialProfile.push(`${authorObj.authorName} ${label == 0 ? '' : '(' + label + ')'}`);
            }
          }
          if (allSocialProfile?.length > 0) filterCardChip.push({ name: 'Social Profile', value: allSocialProfile});
        } else if (fieldName === 'Sentiment') {
          let stringValue = '';
          obj.value.forEach((value) => {
            stringValue +=
              value == 0
                ? 'Neutral, '
                : value == 1
                ? 'Positive, '
                : value == 2
                ? 'Negative, '
                : 'Multiple, ';
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          let newVal = [];
          newVal = stringValue.split(',');
          filterCardChip.push({
            name: 'Sentiments',
            value: newVal,
          });
        } else if (fieldName === 'DeletedFromSocial') {
          const a = obj.value === true ? 'Yes' : 'No';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Deleted From Social',
            value: arr,
          });
        } else if (fieldName === 'UsersWithTeam') {
          let stringValue = '';
          if (obj.value.TeamIds.length > 3 || obj.value.UserIDs.length > 3) {
            const firstTeam = obj.value.TeamIds.slice(0, 3);
            const firstAgent = obj.value.UserIDs.slice(0, 3);
            const allSocialProfile = [];
            firstTeam.forEach((val) => {
              let assignToObj = this.fetchedAssignTo.find(
                (element) => element.teamID == val
              );
              if (assignToObj) {
                stringValue += assignToObj.teamName + ', ';
              }
            });
            firstAgent.forEach((val) => {
              let assignToObj = this.fetchedAssignTo.find(
                (element) => element.agentID == val
              );
              if (assignToObj) {
                stringValue += assignToObj.agentName + ', ';
              }
            });
            obj.value.TeamIds.slice(3, obj.value.TeamIds.length).forEach(
              (val) => {
                let assignToObj = this.fetchedAssignTo.find(
                  (element) => element.teamID == val
                );
                if (assignToObj) {
                  allSocialProfile.push(assignToObj.teamName);
                }
              }
            );
            obj.value.UserIDs.slice(3, obj.value.UserIDs.length).forEach(
              (val) => {
                let assignToObj = this.fetchedAssignTo.find(
                  (element) => element.agentID == val
                );
                if (assignToObj) {
                  allSocialProfile.push(assignToObj.agentName);
                }
              }
            );
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            stringValue = stringValue.replace('null,', '');
            let arr = [];
            arr = stringValue.split(',');
            let newValue = arr.concat(allSocialProfile);
            filterCardChip.push({
              name: 'Assigned To',
              value: newValue,
            });
          } else {
            obj.value.TeamIds.forEach((val) => {
              let assignToObj = this.fetchedAssignTo.find(
                (element) => element.teamID == val
              );
              if (assignToObj) {
                stringValue += assignToObj.teamName + ', ';
              }
            });
            obj.value.UserIDs.forEach((val) => {
              let assignToObj = this.fetchedAssignTo.find(
                (element) => element.agentID == val
              );
              if (assignToObj) {
                stringValue += assignToObj.agentName + ', ';
              }
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr.push(stringValue);
            filterCardChip.push({
              name: 'Assigned To',
              value: arr,
            });
          }
        } else if (fieldName === 'AuthorName') {
          const a = obj.value;
          let arr = [];
          arr.push(a);
          filterCardChip.push({ name: 'Author Name', value: arr });
        } else if (fieldName === 'followercount') {
          const a = obj.value.from + ' - ' + obj.value.to;
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Followers Count',
            value: arr,
          });
        } else if (fieldName === 'InfluencerCategory' && !(currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1)) {
          const a = obj.value;
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Influencer Category',
            value: arr,
          });
        }
        else if (fieldName === 'InfluencerCategory' && (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1)) {
          let stringValue = [];
          if (obj.value.length > 5) {
            const firstInfluencers = obj.value.slice(0, 5);
            const allInfluencers = [];
            firstInfluencers.forEach((val) => {
              stringValue.push(val.influencerCategoryName);
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allInfluencers.push(
                val.influencerCategoryName
              );
            });
            filterCardChip.push({
              name: 'Influencer Category',
              value: stringValue,
              otherValues: allInfluencers,
            });
          } else {
            obj.value.forEach((val) => {
              stringValue.push(val.influencerCategoryName);
            });
            filterCardChip.push({
              name: 'Influencer Category',
              value: stringValue,
            });
          }
        } 
        else if (fieldName === 'IsVerified') {
          const a = obj.value === true ? 'Yes' : 'No';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Verified /Non verified',
            value: arr,
          });
        } else if (fieldName === 'SentimentUpliftScore') {
          const a = obj.value.from + ' - ' + obj.value.to;
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Sentiment Uplift Score',
            value: arr,
          });
        } else if (fieldName === 'UserWith') {
          if (obj.value.length > 0) {
            const list = this.filterUserWithOptions.find(
              (element) => element.id == obj.value
            );
            filterCardChip.push({
              name: 'User With',
              value: [list?.label ? list?.label : null],
            });
          }
        } else if (fieldName === 'NPSScore') {
          filterCardChip.push({
            name: 'NPS rating',
            value: [obj.value.from + ' - ' + obj.value.to],
          });
        } else if (fieldName === 'campaigns') {
          let stringValue = '';
          if (obj.value.length > 5) {
            const firstProfile = obj.value.slice(0, 5);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.Campaign.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.Campaign.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr = stringValue.split(',');
            let newValue = arr.concat(allSocialProfile);
            filterCardChip.push({
              name: 'Campaign',
              value: newValue,
            });
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.Campaign.options.find(
                  (element) => element.id == val
                )?.label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr.push(stringValue);
            filterCardChip.push({
              name: 'Campaign',
              value: arr,
            });
          }
        } else if (fieldName === 'SSREStatus') {
          let stringValue = '';
          if (obj.value.length > 2) {
            const firstProfile = obj.value.slice(0, 2);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.SsreStatuses.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(2, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.SsreStatuses.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr = stringValue.split(',');
            let newValue = arr.concat(allSocialProfile);
            filterCardChip.push({
              name: 'SSRE Statuses',
              value: newValue,
            });
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.SsreStatuses.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr.push(stringValue);
            filterCardChip.push({
              name: 'SSRE Statuses',
              value: arr,
            });
          }
        } else if (fieldName === 'FeedbackType') {
          let feedbackType = [];
          if (obj.value === 'All') {
            feedbackType = ['Feedback', 'NPS'];
          } else {
            feedbackType.push(obj.value ? 'NPS' : 'Feedback');
          }
          filterCardChip.push({
            name: 'Feedback Type',
            value: feedbackType,
          });
        } else if (fieldName === 'isreplied') {
          // const a = obj.value === true ? 'Replied' : 'Not Replied';
          const a = obj.value === 1 ? 'Replied' : obj.value === 2 ? 'Not Replied' : "Not Replied on Latest Mention";
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Reply Status',
            value: arr,
          });
        } else if (fieldName === 'Language') {
          let stringValue = '';
          if (obj.value.length > 5) {
            const firstProfile = obj.value.slice(0, 5);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.Language.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.Language.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr = stringValue.split(',');
            let newValue = arr.concat(allSocialProfile);
            filterCardChip.push({
              name: 'Language',
              value: newValue,
            });
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.Language.options.find(
                  (element) => element.id == val
                )?.label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr.push(stringValue);
            filterCardChip.push({
              name: 'Language',
              value: arr,
            });
          }
        } else if (fieldName === 'TicketActionStatus') {
          let stringValue = '';
          if (obj.value.length > 2) {
            const firstProfile = obj.value.slice(0, 2);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.actionStatuses.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(2, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.actionStatuses.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr = stringValue.split(',');
            let newValue = arr.concat(allSocialProfile);
            filterCardChip.push({
              name: 'Action Statuses',
              value: newValue,
            });
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.actionStatuses.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            let arr = [];
            arr.push(stringValue);
            filterCardChip.push({
              name: 'Action Statuses',
              value: arr,
            });
          }
        } else if (fieldName === 'FeedbackSent') {
          const a = obj.value === true ? 'Yes' : 'No';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Feedback Requested',
            value: arr,
          });
        } else if (fieldName === 'IsDarkPost') {
          const a =  obj.value == 0
                ? 'Organic'
                : obj.value == 1 ? 'Boosted' : 'Ad Posts';
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name:
              filterObj.postsType == 1
                ? 'Marketing Type'
                : 'Marketing Type',
            value: arr,
          });
        } else if (fieldName === 'ishiddenpost') {
          filterCardChip.push({
            name: 'Hidden Post',
            value: [obj.value == true ? 'Yes' : 'No'],
          });
        } else if (fieldName === 'keywordsearch') {
          const mayContain = obj.value.MayContain
            ? obj.value.MayContain.length
            : 0;
          const shouldNotContain = obj.value.ShouldNotContain
            ? obj.value.ShouldNotContain.length
            : 0;
          const ShouldContain = obj.value.ShouldContain
            ? obj.value.ShouldContain.length
            : 0;
          const totalKeyWords = mayContain + shouldNotContain + ShouldContain;
          const a = totalKeyWords > 0 ? `(${totalKeyWords})` : null;
          let arr = [];
          arr.push(a);
          filterCardChip.push({
            name: 'Keywords',
            value: arr,
          });
        } else if (fieldName === 'Countries') {
          if (obj.value.length > 0) {
            const countries = this.filterData?.Others?.Countries?.options || [];
            const list = [];
            for (const country of countries) {
              if (obj?.value.some((id) => id == country?.id)) {
                list.push(country?.label);
              }
            }
            filterCardChip.push({
              name: 'Countries',
              value: list,
            });
          }
        } else if (fieldName === 'FeedbackRating') {
          filterCardChip.push({
            name: 'Feedback Rating',
            value: obj.value,
          });
        } else if (fieldName === 'GMBRating'){
          let temp_value = '';
          if (obj.value == '0') temp_value = 'GMB Ratings with Reviews';
          else if (obj.value == '1') temp_value = 'GMB Ratings without Reviews';

          if(temp_value.trim().length > 0){
            filterCardChip.push({
              name: 'GMB Rating',
              value: [temp_value],
            });
          }
        } else if (fieldName === 'LocationManagerTags') {
          filterCardChip.push({
            name: 'Location Tags',
            value: obj.value,
          });
        } else if (fieldName === 'LocationManager') {
          let locationManagers = [];
          for (const val of obj.value) {
            const matchedUser = this.fillFilterBasicListData?.locationProfiles?.find(
              (user) => user.accountID === val
            );
            if (matchedUser) {
              locationManagers.push(matchedUser.profileName);
            }
          }
          filterCardChip.push({
            name: 'Location Profile',
            value: locationManagers?.length ? locationManagers : obj.value,
          });
        } else if (fieldName === 'LocationManagerChannel') {
          if (obj?.value?.length > 0) {
            const channelList = [];
            for (const val of obj.value) {
              channelList.push(this.fetchedChannelgroupidname[val]);
            }
            filterCardChip.push({
              name: 'Social Channel',
              value: channelList,
            });
          }
        } else if (fieldName === 'LocationManagerUser') {
          let locationManagerNames = [];
          for (const val of obj.value) {
            const matchedUser = this.fillFilterBasicListData?.locationManagerUserDetails?.find(
              (user) => user.locationManagerID === val
            );
            if (matchedUser) {
              locationManagerNames.push(matchedUser.locationManagername);
            }
          }
          filterCardChip.push({
            name: 'Location Manager',
            value: locationManagerNames?.length ? locationManagerNames : obj.value,
          });
        } else if (fieldName === 'LocationManagerCountry') {
          filterCardChip.push({
            name: 'Location Country',
            value: obj.value,
          });
        } else if (fieldName === 'LocationManagerState') {
          filterCardChip.push({
            name: 'Location State',
            value: obj.value,
          });
        } else if (fieldName === 'LocationManagerCity') {
          filterCardChip.push({
            name: 'Location City',
            value: obj.value,
          });
        } else if (fieldName === 'PantipTag') {
          filterCardChip.push({
            name: 'Pantip Tags',
            value: obj?.value?.map(item => item?.entityName),
          });
        } else if (fieldName) {
          if (!addedFilters.has(fieldName) && obj?.value) {
            filterCardChip.push({
              name: fieldName,
              value: obj.value,
            });
          }
          addedFilters.add(fieldName);
        }
      });
    } else {
      if (filterCardChip.length == 0) {
        filterCardChip = [];
      }
    }
    if (filterObj.notFilters && filterObj.notFilters.length > 0) {
      let generatedString = '';
      filterObj.notFilters.forEach((obj) => {
        const fieldName = obj.name;
        if (fieldName === 'TATBreached') {
          generatedString +=
            'SLA:' +
            (obj.value == 1 ? 'About To Breached' : 'Already Breached') +
            ', ';
        } else if (fieldName === 'AutoClousre') {
          generatedString +=
            'Autoclosure enabled:' + (obj.value === true ? 'Yes' : 'No') + ', ';
        } else if (fieldName === 'TicketSubscribe') {
          generatedString +=
            'Subscribe Ticket:' + (obj.value === true ? 'Yes' : 'No') + ', ';
        } else if (fieldName === 'HideRetweet') {
          generatedString +=
            'Retweet:' + (obj.value === true ? 'Yes' : 'No') + ', ';
        } else if (fieldName === 'QuoteTweet') {
          generatedString +=
            'Quote Tweet:' + (obj.value === true ? 'Yes' : 'No') + ', ';
        } else if (fieldName === 'TaggedBy') {
          generatedString +=
            'Tagged By:' + (obj.value === 1 ? 'Machine' : 'User') + ', ';
        } else if (fieldName === 'Priority') {
          let stringValue = '';
          obj.value.forEach((value) => {
            stringValue +=
              value == 0
                ? 'Low, '
                : value == 1
                ? 'Medium, '
                : value == 2
                ? 'High, '
                : 'Urgent, ';
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          generatedString += 'Priority:' + stringValue + ', ';
        } else if (fieldName === 'MediaType') {
          let stringValue = '';
          obj.value.forEach((value) => {
            stringValue +=
              value == 1
                ? 'Text, '
                : value == 2
                ? 'Image Post, '
                : value == 3
                ? 'Video Post, '
                : 'Links, ';
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          generatedString += 'Media type:' + stringValue + ', ';
        } else if (fieldName === 'MentionUpperCategory') {
          const filterBasicListData = this.fillFilterBasicListData;
          let fetchedUpperCategoryData = filterBasicListData.upperCategories;
          if (!fetchedUpperCategoryData) {
            fetchedUpperCategoryData = [];
          }
          let stringValue = '';
          for (let i = 0; i < fetchedUpperCategoryData.length; i++) {
            if (obj.value.includes(fetchedUpperCategoryData[i].id)) {
              stringValue += fetchedUpperCategoryData[i].name + ',';
            }
          }
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          generatedString += 'Upper Category:' + stringValue + ', ';
        } else if (fieldName === 'TicketCategory') {
          let stringValue = '';
          obj.value = obj.value.filter((element) => element);
          if (obj.value.length > 5) {
            const firstProfile = obj.value.slice(0, 5);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue += this.fetchedCategoryDatacategoryidname[val] + ', ';
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.fetchedCategoryDatacategoryidname[val]
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Category:' + stringValue + ', ';
          } else {
            obj.value.forEach((val) => {
              stringValue += this.fetchedCategoryDatacategoryidname[val] + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Category:' + stringValue + ', ';
          }
        } else if (fieldName === 'ChannelGroup') {
          let stringValue = '';
          if (obj.value.length > 5) {
            const firstFiveChannel = obj.value.slice(0, 5);
            const allChannels = [];
            firstFiveChannel.forEach((val) => {
              stringValue += this.fetchedChannelgroupidname[val] + ', ';
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allChannels.push(this.fetchedChannelgroupidname[val]);
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Channels:' + stringValue + ', ';
          } else {
            obj.value.forEach((val) => {
              stringValue += this.fetchedChannelgroupidname[val] + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Channels:' + stringValue + ', ';
          }
        } else if (fieldName === 'socialprofiles') {
          let stringValue = '';
          if (obj.value.length > 5) {
            const firstProfile = obj.value.slice(0, 5);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.fetchedSocialProfile.find(
                  (element) => element.btaid == val.BTAID
                ).authorName + ', ';
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.fetchedSocialProfile.find(
                  (element) => element.btaid == val.BTAID
                ).authorName
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Social Profile:' + stringValue + ', ';
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.fetchedSocialProfile.find(
                  (element) => element.btaid == val.BTAID
                ).authorName + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );

            generatedString += 'Social Profile:' + stringValue + ', ';
          }
        } else if (fieldName === 'Sentiment') {
          let stringValue = '';
          obj.value.forEach((value) => {
            stringValue +=
              value == 0
                ? 'Neutral, '
                : value == 1
                ? 'Positive, '
                : value == 2
                ? 'Negative, '
                : 'Links, ';
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          generatedString += 'Sentiments:' + stringValue + ', ';
        } else if (fieldName === 'DeletedFromSocial') {
          generatedString +=
            'Deleted From Social:' + (obj.value === true ? 'Yes' : 'No') + ', ';
        } else if (fieldName === 'UsersWithTeam') {
          let stringValue = '';
          if (obj.value.TeamIds.length > 3 || obj.value.UserIDs.length > 3) {
            const firstTeam = obj.value.TeamIds.slice(0, 3);
            const firstAgent = obj.value.UserIDs.slice(0, 3);
            const allSocialProfile = [];
            firstTeam.forEach((val) => {
              stringValue +=
                this.fetchedAssignTo.find((element) => element.teamID == val)
                  .teamName + ', ';
            });
            firstAgent.forEach((val) => {
              stringValue +=
                this.fetchedAssignTo.find((element) => element.agentID == val)
                  .agentName + ', ';
            });
            obj.value.TeamIds.slice(3, obj.value.TeamIds.length).forEach(
              (val) => {
                allSocialProfile.push(
                  this.fetchedAssignTo.find((element) => element.teamID == val)
                    .teamName
                );
              }
            );
            obj.value.UserIDs.slice(3, obj.value.UserIDs.length).forEach(
              (val) => {
                allSocialProfile.push(
                  this.fetchedAssignTo.find((element) => element.agentID == val)
                    .agentName
                );
              }
            );
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            stringValue = stringValue.replace('null,', '');
            generatedString += 'Assigned To:' + stringValue + ', ';
          } else {
            obj.value.TeamIds.forEach((val) => {
              stringValue +=
                this.fetchedAssignTo.find((element) => element.teamID == val)
                  .teamName + ', ';
            });
            obj.value.UserIDs.forEach((val) => {
              stringValue +=
                this.fetchedAssignTo.find((element) => element.agentID == val)
                  .agentName + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Assigned To:' + stringValue + ', ';
          }
        } else if (fieldName === 'AuthorName') {
          generatedString += 'Author Name:' + obj.value;
        } else if (fieldName === 'followercount') {
          generatedString +=
            'Followers Count:' + (obj.value.from + ' - ' + obj.value.to) + ', ';
        } else if (fieldName === 'InfluencerCategory') {
          generatedString += 'Influencer Category:' + obj.value + ', ';
        } else if (fieldName === 'IsVerified') {
          generatedString +=
            'Verified /Non verified:' +
            (obj.value === true ? 'Yes' : 'No') +
            ', ';
        } else if (fieldName === 'SentimentUpliftScore') {
          generatedString +=
            'Sentiment Uplift Score:' +
            (obj.value.from + ' - ' + obj.value.to) +
            ', ';
        } else if (fieldName === 'UserWith') {
          generatedString +=
            'User With:' +
            this.filterUserWithOptions.find(
              (element) => element.id == obj.value
            ).label +
            ', ';
        } else if (fieldName === 'FeedbackRating' && obj.value.from) {
          generatedString +=
            'NPS rating:' + (obj.value.from + ' - ' + obj.value.to) + ', ';
        } else if (fieldName === 'campaigns') {
          let stringValue = '';
          if (obj.value.length > 5) {
            const firstProfile = obj.value.slice(0, 5);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.Campaign.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.Campaign.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );

            generatedString += 'Campaign:' + stringValue + ', ';
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.Campaign.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Campaign:' + stringValue + ', ';
          }
        } else if (fieldName === 'SSREStatus') {
          let stringValue = '';
          if (obj.value.length > 2) {
            const firstProfile = obj.value.slice(0, 2);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.SsreStatuses.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(2, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.SsreStatuses.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'SSRE Statuses:' + stringValue + ', ';
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.SsreStatuses.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'SSRE Statuses:' + stringValue + ', ';
          }
        } else if (fieldName === 'FeedbackType') {
          generatedString +=
            'Feedback Type:' + (obj.value == 0 ? 'Feedback' : 'NPS') + ', ';
        } else if (fieldName === 'isreplied') {
          generatedString +=
            'Reply Status:' +
            // (obj.value === true ? 'Replied' : 'Not Replied') +
          (obj.value === 1 ? 'Replied' : obj.value === 2 ? 'Not Replied' : "Not Replied on Latest Mention") +
            ', ';
        } else if (fieldName === 'Language') {
          let stringValue = '';
          if (obj.value.length > 5) {
            const firstProfile = obj.value.slice(0, 5);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.Language.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.Language.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Language:' + stringValue + ', ';
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.Language.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Language:' + stringValue + ', ';
          }
        } else if (fieldName === 'TicketActionStatus') {
          let stringValue = '';
          if (obj.value.length > 2) {
            const firstProfile = obj.value.slice(0, 2);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.actionStatuses.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(2, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.actionStatuses.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Action Statuses:' + stringValue + ', ';
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.actionStatuses.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Action Statuses:' + stringValue + ', ';
          }
        } else if (fieldName === 'FeedbackSent') {
          generatedString +=
            'Feedback Requested:' + (obj.value === true ? 'Yes' : 'No') + ', ';
        } else if (fieldName === 'IsDarkPost') {
          generatedString +=
            (filterObj.postsType == 1
            ? 'Marketing Type: '
              : 'Marketing Type:') +
            ( obj.value == 0
              ? 'Organic'
              : obj.value == 1 ? 'Boosted' : 'Ad Posts') +
            ', ';
        } else if (fieldName === 'keywordsearch') {
          const mayContain = obj.value.MayContain
            ? obj.value.MayContain.length
            : 0;
          const shouldNotContain = obj.value.ShouldNotContain
            ? obj.value.ShouldNotContain.length
            : 0;
          const ShouldContain = obj.value.ShouldContain
            ? obj.value.ShouldContain.length
            : 0;
          const totalKeyWords = mayContain + shouldNotContain + ShouldContain;
          generatedString +=
            'Keywords:' +
            (totalKeyWords > 0 ? `(${totalKeyWords})` : null) +
            ', ';
        } else if (fieldName === 'Countries') {
          let stringValue = '';
          if (obj.value.length > 5) {
            const firstProfile = obj.value.slice(0, 5);
            const allSocialProfile = [];
            firstProfile.forEach((val) => {
              stringValue +=
                this.filterData.Others.Countries.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            obj.value.slice(5, obj.value.length).forEach((val) => {
              allSocialProfile.push(
                this.filterData.Others.Countries.options.find(
                  (element) => element.id == val
                ).label
              );
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );

            generatedString += 'Countries:' + stringValue + ', ';
          } else {
            obj.value.forEach((val) => {
              stringValue +=
                this.filterData.Others.Countries.options.find(
                  (element) => element.id == val
                ).label + ', ';
            });
            stringValue = stringValue.substring(
              0,
              stringValue.lastIndexOf(',')
            );
            generatedString += 'Countries:' + stringValue + ', ';
          }
        } else if (fieldName === 'FeedbackRating') {
          let stringValue = '';
          obj.value.forEach((value) => {
            stringValue += value + ', ';
          });
          stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
          generatedString += 'Feedback Rating:' + stringValue + ', ';
        }
      });
      generatedString = generatedString.substring(
        0,
        generatedString.lastIndexOf(',')
      );
      let arr = [];
      arr.push(generatedString);
      filterCardChip.push({
        name: 'Exclude Filters',
        value: arr,
      });
      // console.log(filterObj.notFilters);
      // let stringValue = '';
      // let generatedString = '';

      // for (let i = 0; i < filterObj.notFilters.length; i++) {
      //   filterObj.notFilters.forEach((value) => {
      //     stringValue += value + ', ';
      //   });
      //   stringValue = stringValue.substring(0, stringValue.lastIndexOf(','));
      //   generatedString = generatedString;
      // }
      //filterCardChip.push({
      //   name: 'Exclude Filters',
      //   value: stringValue,
      // });
      //filterCardChip.push({ name: 'Exclude Filters' });
    }
    // if (filterObj.filters.some((obj) => obj.name == 'users')) {
    //  filterCardChip =filterCardChip.filter(
    //     (obj) => obj.name != 'Assigned To'
    //   );
    //  filterCardChip.push({
    //     name: 'Ticket Type',
    //     value: 'My Tickets',
    //   });
    // }
    return filterCardChip;
  }
  getHistoricReportOrderId(data) {
    let object = {
      BrandIDs: data.brands.join(','),
      Offset: 0,
      NoORows: 0,
    };
    return this._http
      .post(environment.baseUrl + '/DIYReport/GetHistoricReportOrderId', object)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getGMBLocationDetails(req) {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetGmbLocationFilter', req)
  }
  getTwitterInfo(data, brandId?) {
    let url = `${environment.baseUrl}/AddContent/GetTwitterInfo?URL=${data}`
    if(brandId){
      url = url +`&BrandID=${brandId}`
    }

    return this._http
      .post(url,null)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  getFacebookInfo(data) {
    return this._http
      .post(environment.baseUrl + `/AddContent/GetFBInfo`, data)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  getYoutubeInfo(data) {
    return this._http
      .post(environment.baseUrl + `/AddContent/GetYoutubeInfo?VideoID=${data}`,null)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  checkIfPostDeleted(data) {
    return this._http
      .post(environment.baseUrl + `/AddContent/CheckIfPostDeleted`,data)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  saveAddContentTaggedCategory(data) {
    return this._http
      .post(environment.baseUrl + `/AddContent/SaveAddContentTaggedCategory`,data)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getLogicalGroupList(){
    return this._http.get(environment.baseUrl + '/Tickets/GetLogicalGroupList').pipe(
      map((response) => {
        return response;
      })
    );
  }

  getKeywordGroupNameList(keyObj): Observable<any> {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetKeywordGroupsmentions', keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  fillCategoryGroupsNameList(firstcall = false): void {
    this._filterConfig
      .postData(this.categoryGroupNameConfigUrl,{})
      .subscribe((res)=>{
        if(res.success){
          if (res.data) {
            let groupArray = [];
            for (var i = 0; i < res.data.length; i++) {
              if (res.data[i].categoryGroupName) {
                groupArray.push(res.data[i]);
              }
            }
            groupArray = groupArray.map((object) => {
              object.categoryGroupName = object.categoryGroupName.trim();
              return object;
            });
            this.fetchedCategoryGroupData = groupArray;
            }
        }
        else{
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: 'No category groups exist',
            },
          });
        }
      })
  }

  fillLogicalGroupsNameList(firstcall = false): void {
    const param = {
      "isCompetition": 0,
      "IsIndividual": 0,
      "Start": 0,
      "Length": 1000,
      "filteredtext": "",
      "filterType": 1,
      "OrderColumn": "BrandGroup",
      "OrderSeq": "ASC",
      "BrandGroup": ""
    }
    this._filterConfig
      .postData(this.logicalCategoryGroupConfigUrl, param)
      .subscribe((res) => {
        if(res.success){
          this.LogicalGroupsData = res.data.groupData;
        }
        else{
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
                  duration: 5000,
                  data: {
                    type: notificationType.Error,
                    message: 'No  logicalGroups Exist',
                  },
                });
        }
      });
  }

  fillEmailWhitelist(firstcall = false): void{
    this._filterConfig
      .getData(this.emailWhitelistConfigUrl)
      .subscribe((res) => {
        if(res.success){
          res.data.forEach((brand) => {
            this.fetchedEmailWhitelistData[brand.brandID] = brand.entries.map(
                (entry) => {
              const value = entry.whitelistingValue;
              return value.startsWith('@') ? value.slice(1) : value;
            }
            );
          });
        }
        else{
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: 'No whitelist email exist',
            },
          });
        }
      });
  }

  getPantipTags(obj): Observable<any> {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetPantipTagFilter', obj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  groupNumericSentiments(input): any {
    const grouped = {};

    input.forEach(entry => {
      const key = entry?.aspect;
      if (!grouped[key]) {
        grouped[key] = {
          aspect: entry?.aspect,
          isNegativeHover: entry?.isNegativeHover,
          isNeutralHover: entry?.isNeutralHover,
          isPositiveHover: entry?.isPositiveHover,
          sentiment: []
        };
      }

      if (entry?.sentiment && entry?.sentiment >= 0 && entry?.sentiment <= 2) {
        grouped?.[key]?.sentiment?.push(entry?.sentiment)
      }
    });

    return Object.values(grouped);
  }
}

