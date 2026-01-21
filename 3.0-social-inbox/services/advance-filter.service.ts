import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ticketMentionDropdown } from 'app/app-data/filter';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { Tab } from 'app/core/models/menu/Menu';
import { BrandInfo } from 'app/core/models/viewmodel/BrandInfo';
import {
  GenericFilter,
  PostsType,
} from 'app/core/models/viewmodel/GenericFilter';
import { GenericRequestParameters } from 'app/core/models/viewmodel/GenericRequestParameters';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { PostOptionService } from 'app/shared/services/post-options.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Rule } from '../../shared/components/filter/advance-filter/advance-filter-models/rules.models';
import { ActionStatus } from '../../shared/components/filter/filter-models/actionstatus.model';
import { AssignToList } from '../../shared/components/filter/filter-models/assign-to.model';
import {
  ApiReply,
  Brand,
} from '../../shared/components/filter/filter-models/brand-reply.model';
import { BrandList } from '../../shared/components/filter/filter-models/brandlist.model';
import { CategoryList } from '../../shared/components/filter/filter-models/categorylist.model';
import { ChannelList } from '../../shared/components/filter/filter-models/channelList.model';
import { Campaign } from '../../shared/components/filter/filter-models/compaign.model';
import { CountryList } from '../../shared/components/filter/filter-models/country-list.model';
import { CrmColumns } from '../../shared/components/filter/filter-models/crm-coloum.model';
import { EachOptions } from '../../shared/components/filter/filter-models/excludeDisplay.model';
import { InfluencerCategory } from '../../shared/components/filter/filter-models/influence-category.model';
import { LangaugeList } from '../../shared/components/filter/filter-models/language-list.model';
import { SocialProfile } from '../../shared/components/filter/filter-models/social-profile.model';
import { SsreStatus } from '../../shared/components/filter/filter-models/ssrestatus.model';
import { UpperCategory } from '../../shared/components/filter/filter-models/upper-category.model';
import {
  AdvanceFilterDisplayData,
  hideOnMentions,
  hideOnTickets,
} from './../../app-data/advance-filter';
import { allFilterReply } from './../../app-data/allFilterReply';
import { FilterConfig } from './filter.config.service';

@Injectable({
  providedIn: 'root',
})
export class AdvanceFilterService {
  AdvanceFilterDisplayData = AdvanceFilterDisplayData;
  private isFetched: BehaviorSubject<boolean>;
  brandDurationForm: UntypedFormGroup;
  selectedBrands: UntypedFormGroup;
  selectedBrandsbrandreply: Brand[];
  filledAdvanceFilterForm: {};
  filledBrandDurationForm: { selectBrand: any; Duration: any };
  brandreplyAll: Brand[];
  fetchedChannelData: ChannelList[];
  fetchedChannelgroupnameid: {};
  fetchedChanneltypenameid: {};
  fetchedBrandData: BrandList[];
  brandOptions: EachOptions[];
  durationsOptions: EachOptions[];
  fetchedCategoryData: CategoryList[];
  fetchedUpperCategoryData: UpperCategory[];
  fetchedCategoryDatacategory: {};
  fetchedCategoryDatadepartment: {};
  fetchedCategoryDatasubCategory: {};
  fetchedSocialProfile: SocialProfile[];
  fetchedAssignTo: AssignToList[];
  fetchedInfluencerCategory: InfluencerCategory[];
  fetchedCrmColums: CrmColumns;
  fetchedActionStatus: ActionStatus[];
  fetchedSsreStatuses: SsreStatus[];
  fetchedLangaugeList: LangaugeList[];
  fetchedCountryList: CountryList[];
  fetchedCampaigns: Campaign[];
  allFilterAttribute: {};
  advanceFilterRule: Rule;

  notToRepeatOgName: string[];
  notToRepeatDisplayName: string[];
  advanceFilterRuleDisplay: { metaData?: any };
  allAttributeOptions: any[];
  advanceFilterRuleForm: UntypedFormGroup;
  advanceFilledDataReply: ApiReply;
  genericFilter: GenericFilter;
  genericRequestParameter: GenericRequestParameters;
  hideOnTickets: string[];
  hideOnMentions: string[];
  whatToMonitor: string;

  currentBrandSource = new BehaviorSubject<boolean>(false);
  filterTabSource = new BehaviorSubject<Tab>(null);

  // API LINK
  channelConfigUrl = '/Tickets/GetChannelList';
  categoryListConfigUrl = '/Tickets/GetCategoriesList';
  brandConfigUrl = '/Tickets/GetBrandList';
  filterBasicConfigUrl = '/Tickets/GetFilters';

  constructor(
    private _filterService: FilterService,
    private _filterConfig: FilterConfig,
    private _locobuzzEntitiesService: MaplocobuzzentitiesService,
    private accountService: AccountService,
    private _postOptionService: PostOptionService,
    private _navigationService: NavigationService,
    private _http: HttpClient
  ) {}

  populateAdvanceFilter(): void {
    this.hideOnTickets = hideOnTickets;
    this.hideOnMentions = hideOnMentions;
    this.allAttributeOptions = [];
    for (const x of Object.keys(
      this.AdvanceFilterDisplayData.allFilterAttribute
    )) {
      const each = {
        id: x,
        label: this.AdvanceFilterDisplayData.allFilterAttribute[x].displayName,
      };
      this.allAttributeOptions.push(each);
    }
    this.notToRepeatOgName = ['Mentions', 'userActivity', 'brandActivity'];
    this.notToRepeatDisplayName = [
      'Mentions',
      'User Activity',
      'Brand Activity',
    ];
    this.advanceFilterRuleDisplay = {
      metaData: {
        maxGroupkey: -1,
      },
    };
    this.advanceFilterRuleForm = new UntypedFormGroup({});
    this.brandDurationForm = new UntypedFormGroup({});
    this.isFetched = new BehaviorSubject<boolean>(false);
    for (const each of Object.keys(
      this.AdvanceFilterDisplayData.brandDateDuration
    )) {
      if (each === 'displayName') {
        continue;
      } else if (each === 'Duration') {
        const innerFormGroup = new UntypedFormGroup({});
        const formcon = new UntypedFormControl(
          moment().subtract(2, 'days').startOf('day').utc().unix()
        );
        const formcon1 = new UntypedFormControl(moment().endOf('day').utc().unix());
        innerFormGroup.addControl('StartDate', formcon);
        innerFormGroup.addControl('EndDate', formcon1);
        innerFormGroup.addControl('Duration', new UntypedFormControl(null));
        innerFormGroup.addControl('isCustom', new UntypedFormControl(2));
        this.brandDurationForm.addControl(each, innerFormGroup);
      } else {
        this.brandDurationForm.addControl(
          each,
          new UntypedFormControl(
            this.AdvanceFilterDisplayData.brandDateDuration[each].default
          )
        );
      }
    }
    if (
      this._filterService.filterData.brandDateDuration.selectBrand.options
        .length > 0
    ) {
      this.AdvanceFilterDisplayData.brandDateDuration.selectBrand.options =
        this._filterService.brandOptions;
      this.AdvanceFilterDisplayData.allFilterAttribute =
        this._filterService.allAttributeForAdvance;
      this.brandreplyAll = this._filterService.brandreplyAll;
      this.fetchedChannelData = this._filterService.fetchedChannelData;
      this.fetchedBrandData = this._filterService.fetchedBrandData;
      this.brandOptions = this._filterService.brandOptions;
      this.durationsOptions = this._filterService.durationsOptions;
      this.fetchedCategoryData = this._filterService.fetchedCategoryData;
      this.fetchedUpperCategoryData =
        this._filterService.fetchedUpperCategoryData;
      this.fetchedSocialProfile = this._filterService.fetchedSocialProfile;
      this.fetchedAssignTo = this._filterService.fetchedAssignTo;
      this.fetchedInfluencerCategory =
        this._filterService.fetchedInfluencerCategory;
      this.fetchedCrmColums = this._filterService.fetchedCrmColums;
      this.fetchedActionStatus = this._filterService.fetchedActionStatus;
      this.fetchedSsreStatuses = this._filterService.fetchedSsreStatuses;
      this.fetchedLangaugeList = this._filterService.fetchedLangaugeList;
      this.fetchedCountryList = this._filterService.fetchedCountryList;
      this.fetchedCampaigns = this._filterService.fetchedCampaigns;
    } else {
      this.callAllApis();
    }
    this.advanceFilterRuleForm.addControl('condition', new UntypedFormControl('AND'));
    this.whatToMonitor = this.brandDurationForm.controls.whatToMonitor.value;
  }

  callAllApis(): void {
    this.fillBrandList();
  }

  fillBrandList(): void {
    this._filterConfig
      .postData(this.brandConfigUrl, {})
      .subscribe((resData) => {
        const data = JSON.stringify(resData);
        this.fetchedBrandData = JSON.parse(data).data;
        const options = [];
        const brandreply = [];
        // eslint-disable-next-line guard-for-in
        for (const each in this.fetchedBrandData) {
          options.push({
            id: this.fetchedBrandData[each].brandID,
            label: this.fetchedBrandData[each].brandName,
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
        this.AdvanceFilterDisplayData.brandDateDuration.selectBrand.options =
          options;
        this.durationsOptions =
          this.AdvanceFilterDisplayData.brandDateDuration.Duration.options;
        this.brandOptions = options;
        this.brandreplyAll = brandreply;
        this.readyForFilterBasicList(
          brandreply,
          this.brandDurationForm.controls.Duration.value.StartDate.value,
          this.brandDurationForm.controls.Duration.value.EndDate.value
        );
        this.readyForCategoryList(
          brandreply,
          this.brandDurationForm.controls.Duration.value.StartDate.value,
          this.brandDurationForm.controls.Duration.value.EndDate.value
        );
      });
  }

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
      this.selectedBrandsbrandreply = brandreply;
      const bodyreply = new ApiReply();
      bodyreply.brands = brandreply;
      bodyreply.categoryID = 0;
      bodyreply.categoryName = 'string';
      (bodyreply.startDateEpoch =
        this.selectedBrands.value.Duration.StartDate.value),
        (bodyreply.endDateEpoch =
          this.selectedBrands.value.Duration.EndDate.value),
        (bodyreply.userID = 0);
      bodyreply.filters = [];
      bodyreply.notFilters = [];
      bodyreply.isAdvance = false;
      bodyreply.query = 'string';
      (bodyreply.orderBYColumn = 'DateCreated'), (bodyreply.orderBY = 'desc');
      bodyreply.IsRawOrderBy = false;
      bodyreply.offset = 0;
      bodyreply.noOfRows = 1;
      this.fillCategoryList(bodyreply);
      this.fillFilterBasicList(bodyreply);
    }
  }

  onlyDurationSelected(startDate, endDate): void {
    this.readyForFilterBasicList(this.brandreplyAll, startDate, endDate);
    this.readyForCategoryList(this.brandreplyAll, startDate, endDate);
  }

  readyForFilterBasicList(brandreply: Brand[], startDate, endDate): void {
    const bodyreply = new ApiReply();
    bodyreply.brands = brandreply;
    bodyreply.categoryID = 0;
    bodyreply.categoryName = 'string';
    bodyreply.startDateEpoch = startDate;
    bodyreply.endDateEpoch = endDate;
    bodyreply.userID = 0;
    bodyreply.filters = [];
    bodyreply.notFilters = [];
    bodyreply.isAdvance = false;
    bodyreply.query = 'string';
    (bodyreply.orderBYColumn = 'DateCreated'), (bodyreply.orderBY = 'desc');
    bodyreply.IsRawOrderBy = false;
    bodyreply.offset = 0;
    bodyreply.noOfRows = 1;
    this.fillFilterBasicList(bodyreply);
  }

  readyForCategoryList(brandreply: Brand[], startDate, endDate): void {
    const bodyreply = new ApiReply();
    bodyreply.brands = brandreply;
    bodyreply.categoryID = 0;
    bodyreply.categoryName = 'string';
    bodyreply.startDateEpoch = startDate;
    bodyreply.endDateEpoch = endDate;
    bodyreply.userID = 0;
    bodyreply.filters = [];
    bodyreply.notFilters = [];
    bodyreply.isAdvance = false;
    bodyreply.query = 'string';
    (bodyreply.orderBYColumn = 'DateCreated'), (bodyreply.orderBY = 'desc');
    bodyreply.IsRawOrderBy = false;
    bodyreply.offset = 0;
    bodyreply.noOfRows = 1;
    this.fillCategoryList(bodyreply);
  }

  fillCategoryList(body: {}): void {
    this._filterConfig
      .postData(this.categoryListConfigUrl, body)
      .subscribe((resData) => {
        const data = JSON.stringify(resData);
        this.fetchedCategoryData = JSON.parse(data).data;
        const categoryData = {};
        this.fetchedCategoryDatacategory = {};
        this.fetchedCategoryDatadepartment = {};
        this.fetchedCategoryDatasubCategory = {};
        if (this.fetchedCategoryData) {
          for (const category of Object.keys(this.fetchedCategoryData)) {
            categoryData[this.fetchedCategoryData[category].category] = {};
            this.fetchedCategoryDatacategory[
              this.fetchedCategoryData[category].category
            ] = this.fetchedCategoryData[category].categoryID;
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
              }
            }
          }
        }
        // ASSIGN IT
        this.AdvanceFilterDisplayData.allFilterAttribute.Category.options =
          categoryData;
      });
  }

  fillFilterBasicList(body: ApiReply): void {
    if (body && body?.brands && body?.brands.length > 0) {
      this._filterConfig
        .postData(this.filterBasicConfigUrl, body)
        .subscribe((resData) => {
          const data = JSON.stringify(resData);
          const featchData = JSON.parse(data).data;
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
          this.fillChannelData(featchData.channels);
        });
    }
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
    this.AdvanceFilterDisplayData.allFilterAttribute.upperCategory.options =
      options;
  }

  fillSocialProfile(socialProfile): void {
    this.fetchedSocialProfile = socialProfile;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedSocialProfile) {
      options.push({
        authorID: this.fetchedSocialProfile[each].authorID,
        label: this.fetchedSocialProfile[each].screenName,
        brandID: this.fetchedSocialProfile[each].brandID,
        id: this.fetchedSocialProfile[each].btaid,
        channelGroupID: this.fetchedSocialProfile[each].channelGroupID,
        ImageUrl: this.fetchedSocialProfile[each].profileImageUrl,
      });
    }
    this.AdvanceFilterDisplayData.allFilterAttribute.socialProfile.options =
      options;
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
    this.AdvanceFilterDisplayData.allFilterAttribute.assigendTo.options =
      options;
  }

  fillInfluencerCategory(influencerCategory): void {
    this.fetchedInfluencerCategory = influencerCategory;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedInfluencerCategory) {
      options.push({
        id: this.fetchedInfluencerCategory[each].id,
        label: this.fetchedInfluencerCategory[each].name,
      });
    }
    this.AdvanceFilterDisplayData.allFilterAttribute.influencerCategory.options =
      options;
  }

  fillCrmColumns(crmColums): void {
    this.fetchedCrmColums = crmColums;
    const options = [];
    if (this.fetchedCrmColums) {
      // eslint-disable-next-line guard-for-in
      for (const each in this.fetchedCrmColums.existingColumns) {
        if (this.fetchedCrmColums.existingColumns[each].showInFilter) {
          options.push({
            id: this.fetchedCrmColums.existingColumns[each].orderID,
            label: this.fetchedCrmColums.existingColumns[each].columnLable,
          });
        }
      }
    }
    this.AdvanceFilterDisplayData.allFilterAttribute.userWith.options = options;
  }

  fillActionStatuses(actionStatus): void {
    this.fetchedActionStatus = actionStatus;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedActionStatus) {
      options.push({
        id: this.fetchedActionStatus[each].key,
        label: this.fetchedActionStatus[each].value,
      });
    }
    this.AdvanceFilterDisplayData.allFilterAttribute.actionStatuses.options =
      options;
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
    this.AdvanceFilterDisplayData.allFilterAttribute.SsreStatuses.options =
      options;
  }

  fillLangaugeList(langaugeList: LangaugeList[]): void {
    this.fetchedLangaugeList = langaugeList;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedLangaugeList) {
      options.push({
        id: this.fetchedLangaugeList[each].key,
        label: this.fetchedLangaugeList[each].value,
      });
    }
    this.AdvanceFilterDisplayData.allFilterAttribute.Language.options = options;
  }

  fillcountryList(countryList: CountryList[]): void {
    this.fetchedCountryList = countryList;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedCountryList) {
      options.push({
        id: this.fetchedCountryList[each].key,
        label: this.fetchedCountryList[each].value,
      });
    }
    this.AdvanceFilterDisplayData.allFilterAttribute.Countries.options =
      options;
  }

  fillCampaigns(campaigns): void {
    this.fetchedCampaigns = campaigns;
    const options = [];
    // eslint-disable-next-line guard-for-in
    for (const each in this.fetchedCampaigns) {
      options.push({
        id: this.fetchedCampaigns[each].campaignID,
        label: this.fetchedCampaigns[each].campaignName,
      });
    }
    this.AdvanceFilterDisplayData.allFilterAttribute.Campaign.options = options;
  }

  fillChannelData(chData): void {
    this.fetchedChannelData = chData;
    // Convert to Tree Structure
    const ChannelData = {};
    this.fetchedChannelgroupnameid = {};
    this.fetchedChanneltypenameid = {};
    for (const each in this.fetchedChannelData) {
      if (!(this.fetchedChannelData[each].channelGroupName in ChannelData)) {
        ChannelData[this.fetchedChannelData[each].channelGroupName] = [
          this.fetchedChannelData[each].channelName,
        ];
        this.fetchedChannelgroupnameid[
          this.fetchedChannelData[each].channelGroupName
        ] = this.fetchedChannelData[each].channelGroupType;
        this.fetchedChanneltypenameid[
          this.fetchedChannelData[each].channelName
        ] = this.fetchedChannelData[each].channelType;
      } else {
        ChannelData[this.fetchedChannelData[each].channelGroupName].push(
          this.fetchedChannelData[each].channelName
        );
        this.fetchedChanneltypenameid[
          this.fetchedChannelData[each].channelName
        ] = this.fetchedChannelData[each].channelType;
      }
    }
    this.AdvanceFilterDisplayData.allFilterAttribute.Channel.options =
      ChannelData;
    this.setValue(true);
  }

  getValue(): Observable<boolean> {
    return this.isFetched.asObservable();
  }

  setValue(newValue: boolean): void {
    this.isFetched.next(newValue);
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

  getBasicFiltersList(keyObj): Observable<any> {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetFilters', keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  fillAdvanceFilterForm(
    advFilterForm: UntypedFormGroup,
    brandDurationForm: UntypedFormGroup,
    callextraApis = true
  ): void {
    this.filledAdvanceFilterForm = advFilterForm.getRawValue();
    this.filledBrandDurationForm = brandDurationForm.value;
    // console.log(this.filledAdvanceFilterForm);
    this.advanceFilterRule = new Rule();
    this.advanceFilterRule.rules = [];
    for (const group of Object.keys(this.filledAdvanceFilterForm)) {
      if (group === 'condition') {
        this.advanceFilterRule.condition = this.filledAdvanceFilterForm[group];
        continue;
      }
      const groupInRule = new Rule();
      groupInRule.rules = [];
      for (const attribute of Object.keys(
        this.filledAdvanceFilterForm[group]
      )) {
        if (attribute === 'condition') {
          groupInRule.condition =
            this.filledAdvanceFilterForm[group][attribute];
          continue;
        }
        const attributeInRule = new Rule();
        // console.log(this.filledAdvanceFilterForm[group][attribute].attributeOptions);
        attributeInRule.field =
          allFilterReply[
            this.filledAdvanceFilterForm[group][attribute].attributeOptions
          ].adname;
        attributeInRule.id =
          this.filledAdvanceFilterForm[group][attribute].attributeOptions;
        attributeInRule.operator =
          allFilterReply[
            this.filledAdvanceFilterForm[group][attribute].attributeOptions
          ].operator;
        attributeInRule.type =
          allFilterReply[
            this.filledAdvanceFilterForm[group][attribute].attributeOptions
          ].advanceType;
        // value
        // IF CHANNEL HANDLE SEPRATELY
        if (
          this.filledAdvanceFilterForm[group][attribute].attributeOptions ===
          'Channel'
        ) {
          if (
            this.filledAdvanceFilterForm[group][attribute].originalAttribute
              ?.length > 0
          ) {
            const myFilter = [];
            const channelgroup = {
              field:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].adGname,
              id: this.filledAdvanceFilterForm[group][attribute]
                .attributeOptions,
              operator:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].operator,
              type: allFilterReply[
                this.filledAdvanceFilterForm[group][attribute].attributeOptions
              ].advanceType,
              value: [],
            };
            const channeltype = {
              field:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].adTname,
              id: this.filledAdvanceFilterForm[group][attribute]
                .attributeOptions,
              operator:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].operator,
              type: allFilterReply[
                this.filledAdvanceFilterForm[group][attribute].attributeOptions
              ].advanceType,
              value: [],
            };
            for (const each1 of Object.keys(
              this.filledAdvanceFilterForm[group][attribute].originalAttribute
            )) {
              if (
                this.filledAdvanceFilterForm[group][attribute]
                  .originalAttribute[each1].level === 0
              ) {
                channelgroup.value.push(
                  this.fetchedChannelgroupnameid[
                    this.filledAdvanceFilterForm[group][attribute]
                      .originalAttribute[each1].item
                  ]
                );
              }
              if (
                this.filledAdvanceFilterForm[group][attribute]
                  .originalAttribute[each1].level === 1
              ) {
                channeltype.value.push(
                  this.fetchedChanneltypenameid[
                    this.filledAdvanceFilterForm[group][attribute]
                      .originalAttribute[each1].item
                  ]
                );
              }
            }
            groupInRule.rules.push(channelgroup);
            groupInRule.rules.push(channeltype);
            continue;
          }
        } else if (
          this.filledAdvanceFilterForm[group][attribute].attributeOptions ===
          'upperCategory'
        ) {
          if (
            this.filledAdvanceFilterForm[group][attribute].originalAttribute !==
            null
          ) {
            const upperCategory = {
              field:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].Ticketsadname,
              id: this.filledAdvanceFilterForm[group][attribute]
                .attributeOptions,
              operator:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].operator,
              type: allFilterReply[
                this.filledAdvanceFilterForm[group][attribute].attributeOptions
              ].advanceType,
              value:
                this.filledAdvanceFilterForm[group][attribute]
                  .originalAttribute,
            };
            if (
              this.filledAdvanceFilterForm[group][attribute][
                this.filledAdvanceFilterForm[group][attribute]
                  .attributeOptions + 'condition'
              ]
            ) {
              upperCategory.field =
                allFilterReply[
                  this.filledAdvanceFilterForm[group][
                    attribute
                  ].attributeOptions
                ].Ticketsadname;
            } else {
              upperCategory.field =
                allFilterReply[
                  this.filledAdvanceFilterForm[group][
                    attribute
                  ].attributeOptions
                ].Mentionadname;
            }
            groupInRule.rules.push(upperCategory);
          }
          continue;
        } else if (
          this.filledAdvanceFilterForm[group][attribute].attributeOptions ===
          'Category'
        ) {
          if (
            this.filledAdvanceFilterForm[group][attribute].originalAttribute
              ?.length > 0
          ) {
            const category = {
              field:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].adTicketsCname,
              id: this.filledAdvanceFilterForm[group][attribute]
                .attributeOptions,
              operator:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].operator,
              type: allFilterReply[
                this.filledAdvanceFilterForm[group][attribute].attributeOptions
              ].advanceType,
              value: [],
            };
            const department = {
              field:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].adTicketsDname,
              id: this.filledAdvanceFilterForm[group][attribute]
                .attributeOptions,
              operator:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].operator,
              type: allFilterReply[
                this.filledAdvanceFilterForm[group][attribute].attributeOptions
              ].advanceType,
              value: [],
            };
            const subCategory = {
              field:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].adTicketsSname,
              id: this.filledAdvanceFilterForm[group][attribute]
                .attributeOptions,
              operator:
                allFilterReply[
                  this.filledAdvanceFilterForm[group][attribute]
                    .attributeOptions
                ].operator,
              type: allFilterReply[
                this.filledAdvanceFilterForm[group][attribute].attributeOptions
              ].advanceType,
              value: [],
            };
            if (
              this.filledAdvanceFilterForm[group][attribute][
                this.filledAdvanceFilterForm[group][attribute]
                  .attributeOptions + 'condition'
              ]
            ) {
              category.field =
                allFilterReply[
                  this.filledAdvanceFilterForm[group][
                    attribute
                  ].attributeOptions
                ].TicketsCname;
              department.field =
                allFilterReply[
                  this.filledAdvanceFilterForm[group][
                    attribute
                  ].attributeOptions
                ].TicketsDname;
              subCategory.field =
                allFilterReply[
                  this.filledAdvanceFilterForm[group][
                    attribute
                  ].attributeOptions
                ].TicketsSname;
            } else {
              category.field =
                allFilterReply[
                  this.filledAdvanceFilterForm[group][
                    attribute
                  ].attributeOptions
                ].MentionCname;
              department.field =
                allFilterReply[
                  this.filledAdvanceFilterForm[group][
                    attribute
                  ].attributeOptions
                ].MentionDname;
              subCategory.field =
                allFilterReply[
                  this.filledAdvanceFilterForm[group][
                    attribute
                  ].attributeOptions
                ].MentionSname;
            }
            for (const each1 of Object.keys(
              this.filledAdvanceFilterForm[group][attribute].originalAttribute
            )) {
              if (
                this.filledAdvanceFilterForm[group][attribute]
                  .originalAttribute[each1].level === 0
              ) {
                category.value.push(
                  this.fetchedCategoryDatacategory[
                    this.filledAdvanceFilterForm[group][attribute]
                      .originalAttribute[each1].item
                  ]
                );
              }
              if (
                this.filledAdvanceFilterForm[group][attribute]
                  .originalAttribute[each1].level === 1
              ) {
                department.value.push(
                  this.fetchedCategoryDatadepartment[
                    this.filledAdvanceFilterForm[group][attribute]
                      .originalAttribute[each1].item
                  ]
                );
              }
              if (
                this.filledAdvanceFilterForm[group][attribute]
                  .originalAttribute[each1].level === 2
              ) {
                subCategory.value.push(
                  this.fetchedCategoryDatasubCategory[
                    this.filledAdvanceFilterForm[group][attribute]
                      .originalAttribute[each1].item
                  ]
                );
              }
            }
            if (category.value.length > 0) {
              groupInRule.rules.push(category);
            }
            if (department.value.length > 0) {
              groupInRule.rules.push(department);
            }
            if (subCategory.value.length > 0) {
              groupInRule.rules.push(subCategory);
            }
          }
          continue;
        } else {
          attributeInRule.value =
            this.filledAdvanceFilterForm[group][attribute].originalAttribute;
        }
        groupInRule.rules.push(attributeInRule);
      }
      this.advanceFilterRule.rules.push(groupInRule);
    }
    // console.log(JSON.stringify(this.advanceFilterRule));
    // console.log(this.advanceFilterRule);
    this.ApiReplyReady();
    if (callextraApis) {
      this.currentBrandSource.next(true);
      this.filterTabSource.next(this._navigationService.currentSelectedTab);
    }
  }

  public reverseApply(saveFilter: GenericFilter): void {
    const brandid = [];
    for (const each of saveFilter.brands) {
      brandid.push('' + each.brandID);
    }
    if (brandid.length > 0) {
      this.brandDurationForm.get('selectBrand').patchValue(brandid);
      // const eachForm = filterForm.get('brandDateDuration').get('Duration');
      // // const startDate = eachForm.get('StartDate');
      // // const endDate = eachForm.get('EndDate');
      // // // const Duration = eachForm.get('Duration');
      // // startDate.patchValue(saveFilter.startDateEpoch);
      // // endDate.patchValue(saveFilter.endDateEpoch);
      // const brandDateDuration = (filterForm.get('brandDateDuration') as FormGroup);
      // this.fillBrandSelected(brandDateDuration);
    } else {
      this.brandDurationForm
        .get('selectBrand')
        .patchValue([
          ...this.AdvanceFilterDisplayData.brandDateDuration.selectBrand.options.map(
            (item) => item.id
          ),
          'All',
        ]);
    }
    // SET DURATION
    if (saveFilter.isCustom !== -1) {
    } else {
    }
    if (saveFilter.postsType === PostsType.Tickets) {
      this.brandDurationForm
        .get('ticketsMentions')
        .get('whatToMonitor')
        .patchValue(0);
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
      this.brandDurationForm
        .get('ticketsMentions')
        .get('whatToMonitor')
        .patchValue(1);
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
    this._filterService.setSearch.next(saveFilter.simpleSearch);
    if (saveFilter.ticketType.length > 0) {
      this.brandDurationForm
        .get('myTickets')
        .patchValue(saveFilter.ticketType[0]);
    } else {
      this.brandDurationForm.get('myTickets').patchValue(4);
    }
    const rules: Rule = JSON.parse(saveFilter.query);
    this.advanceFilterRuleForm = new UntypedFormGroup({});
    this.advanceFilterRuleDisplay = {};
    let countgroup = 0;
    const metaData = 'metaData';
    for (const groups of Object.keys(rules)) {
      if (groups === 'rules') {
        for (const group of rules.rules) {
          const groupdata = {};
          const groupForm = new UntypedFormGroup({});
          const attributeOptions = this.allAttributeOptions;
          let countattribute = 0;
          for (const attribute of group.rules) {
            for (const check of Object.keys(allFilterReply)) {
              if (attribute.field === allFilterReply[check].adname) {
                groupdata[countattribute] = {
                  attributeOptions: {
                    displayName: 'Attribute',
                    options: attributeOptions,
                  },
                  originalAttribute:
                    AdvanceFilterDisplayData.allFilterAttribute[check],
                };
                const attribute1 = new UntypedFormGroup({});
                attribute1.addControl(
                  'attributeOptions',
                  new UntypedFormControl(check)
                );
                attribute1.addControl(
                  'attributeOptions',
                  new UntypedFormControl(attribute.value)
                );
                groupForm.addControl('' + countattribute, attribute1);
              }
            }
            countattribute += 1;
          }
          // For Display
          groupdata[metaData] = {
            maxAttributekey: group.rules.length,
            options: attributeOptions,
          };
          this.advanceFilterRuleDisplay[countgroup] = groupdata;
          // For Form
          this.advanceFilterRuleForm.addControl('' + countgroup, groupForm);
          countgroup += 1;
        }
      } else {
        this.advanceFilterRuleForm.addControl(groups, rules[groups]);
        this.advanceFilterRuleDisplay.metaData = {
          maxGroupkey: Object.keys(rules).length,
        };
      }
    }
  }

  ApiReplyReady(): void {
    this.advanceFilledDataReply = new ApiReply();
    const brandInfo: BrandInfo[] = [];
    for (const value of this.filledBrandDurationForm.selectBrand) {
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
      this.filledBrandDurationForm.Duration.StartDate;
    const endDateEpoch1: number = this.filledBrandDurationForm.Duration.EndDate;
    this.advanceFilledDataReply.categoryID = 0;
    this.advanceFilledDataReply.brands = brandInfo;
    this.advanceFilledDataReply.categoryName = 'string';
    this.advanceFilledDataReply.startDateEpoch = startDateEpcoh1;
    this.advanceFilledDataReply.endDateEpoch = endDateEpoch1;
    this.advanceFilledDataReply.userID = 0;
    this.advanceFilledDataReply.userRole = 4;
    (this.advanceFilledDataReply.filters = []),
      (this.advanceFilledDataReply.notFilters = []);
    this.advanceFilledDataReply.isAdvance = true;
    this.advanceFilledDataReply.query = JSON.stringify(this.advanceFilterRule);
    // console.log((this.brandDurationForm.get('whatToMonitor') as FormControl).value);
    if (
      (this.brandDurationForm.get('whatToMonitor') as UntypedFormControl).value ===
      'All Mentions'
    ) {
      this.advanceFilledDataReply.postsType = 1;
      this.advanceFilledDataReply.orderBYColumn =
        ticketMentionDropdown.sortBy[
          this._postOptionService.optionForm.controls.sortBy.value
        ].mention;
    } else {
      this.advanceFilledDataReply.postsType = 0;
      this.advanceFilledDataReply.orderBYColumn =
        ticketMentionDropdown.sortBy[
          this._postOptionService.optionForm.controls.sortBy.value
        ].ticket;
    }
    this.advanceFilledDataReply.orderBY =
      ticketMentionDropdown.sortOrder.value[
        +this._postOptionService.optionForm.controls.sortOrder.value
      ];
    this.advanceFilledDataReply.isRawOrderBy = false;
    this.advanceFilledDataReply.oFFSET = 0;
    this.advanceFilledDataReply.noOfRows = 10;
    this.advanceFilledDataReply.ticketType = [
      this.brandDurationForm.controls.myTickets.value,
    ];
    // console.log(JSON.stringify(this.advanceFilledDataReply));
  }

  getGenericFilter(): GenericFilter {
    // fills the brand value from brand array
    let currentUser: AuthUser;
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (currentUser = user));
    const brandInfo: BrandInfo[] = [];
    let startDateEpcoh1: number;
    let endDateEpoch1: number;
    const filterArray = [];
    const notFiltersArray = [];
    let ticketType1 = [];
    let preQuery: string = 'string';
    let postsType1: PostsType = PostsType.Tickets;
    if (
      this.advanceFilledDataReply &&
      this.filledBrandDurationForm.selectBrand
    ) {
      for (const value of this.filledBrandDurationForm.selectBrand) {
        const searchedBrand = this._filterService.fetchedBrandData.find(
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
      startDateEpcoh1 = this.filledBrandDurationForm.Duration.StartDate;
      endDateEpoch1 = this.filledBrandDurationForm.Duration.EndDate;
      ticketType1 = this.advanceFilledDataReply.ticketType;
      preQuery = this.advanceFilledDataReply.query;
    } else {
      for (const searchedBrand of this._filterService.fetchedBrandData) {
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
      startDateEpcoh1 = this.brandDurationForm.value.Duration.StartDate;
      endDateEpoch1 = this.brandDurationForm.value.Duration.EndDate;
    }

    if (this.advanceFilledDataReply?.postsType) {
      if (+this.advanceFilledDataReply.postsType === 0) {
        postsType1 = PostsType.Tickets;
      } else {
        postsType1 = PostsType.Mentions;
      }
    }

    this.genericFilter = {
      categoryID: 0,
      brands: brandInfo,
      categoryName: 'string',
      startDateEpoch: startDateEpcoh1,
      endDateEpoch: endDateEpoch1,
      isCustom: -1,
      userID: currentUser.data.user.userId,
      userRole: currentUser.data.user.role,
      filters: filterArray,
      notFilters: notFiltersArray,
      isAdvance: true,
      query: preQuery,
      orderBYColumn: this.advanceFilledDataReply.orderBYColumn,
      orderBY: this.advanceFilledDataReply.orderBY,
      isRawOrderBy: false,
      oFFSET: 0,
      noOfRows: 10,
      ticketType: ticketType1,
      postsType: postsType1,
    };

    // console.log(JSON.stringify(this.genericFilter));

    return this.genericFilter;
  }

  getGenericRequestFilter(mentionObj: BaseMention): GenericRequestParameters {
    const brandInfo: BrandInfo[] = [];
    let startDateEpcoh1: number;
    let endDateEpoch1: number;
    if (
      this.filledBrandDurationForm &&
      this.filledBrandDurationForm.selectBrand
    ) {
      startDateEpcoh1 = this.filledBrandDurationForm.Duration.StartDate;
      endDateEpoch1 = this.filledBrandDurationForm.Duration.EndDate;
    } else {
      startDateEpcoh1 = this.brandDurationForm.value.Duration.StartDate;
      endDateEpoch1 = this.filledBrandDurationForm.Duration.EndDate;
    }

    this.genericRequestParameter = {
      brandInfo: mentionObj.brandInfo,
      startDateEpoch: startDateEpcoh1,
      endDateEpoch: endDateEpoch1,
      ticketId: mentionObj.ticketInfo.ticketID,
      tagID: mentionObj.tagID,
      to: 1,
      from: 1,
      authorId: mentionObj.author.socialId,
      author: this._locobuzzEntitiesService.mapMention(mentionObj).author,
      isActionableData: 0,
      channel: mentionObj.channelGroup,
      isPlainLogText: false,
      targetBrandName: '',
      targetBrandID: 0,
      isCopy: true,
    };

    return this.genericRequestParameter;
  }
}

