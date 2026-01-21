import { E } from '@angular/cdk/keycodes';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TabStatus } from 'app/core/enums/TabStatusEnum';
import { Tab } from 'app/core/models/menu/Menu';
import { GenericFilter, PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { IApiResponse } from 'app/core/models/viewmodel/IApiResponse';
import {
  TicketFilterTabParameters,
  TicketFilterTabParametersResponse,
} from 'app/core/models/viewmodel/TicketFilterTabParameters';
import { NavigationService } from 'app/core/services/navigation.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AdvanceFilterService } from './advance-filter.service';
import { FilterService } from './filter.service';

@Injectable({
  providedIn: 'root',
})
export class FilterGroupService {
  // To Send newLinkData
  private newLink: BehaviorSubject<any>;
  ticketparam: TicketFilterTabParameters = {};
  ticketFilterTab: Tab = {};

  constructor(
    private _filterService: FilterService,
    private _advanceFilterService: AdvanceFilterService,
    private _http: HttpClient,
    private _navigationService: NavigationService
  ) {
    this.newLink = new BehaviorSubject<any>(null);
  }

  saveData(
    filterGroupData: any,
    tabindex: number,
    FilterFilledDataReply: any
  ): Observable<any> {

    if (FilterFilledDataReply.postsType ==PostsType.Mentions)
    {
      FilterFilledDataReply.filters.push({
        name:"isbrandactivity",type:2,value:[2]});
    }
    this.ticketFilterTab.Filters = FilterFilledDataReply;
    this.ticketFilterTab.tabId = 0;
    this.ticketFilterTab.menuId =
      this._navigationService.currentNavigation.defaultTabs[0].menuId;
    this.ticketFilterTab.userID = FilterFilledDataReply.userID;
    this.ticketFilterTab.tabName = filterGroupData.GroupName;
    this.ticketFilterTab.tabDescription = filterGroupData.Description;
    this.ticketFilterTab.guid = '';
    this.ticketFilterTab.isEditable = true;
    this.ticketFilterTab.isPinned = false;
    this.ticketFilterTab.sortOrder =
      this._navigationService.currentNavigation.defaultTabs.length;
    this.ticketFilterTab.templateID = 0;
    this.ticketFilterTab.tabVersion =
      this._navigationService.currentNavigation.defaultTabs[0].tabVersion;
    this.ticketFilterTab.isdeleted = false;
    this.ticketFilterTab.status = this._filterService.saveAndApply
      ? TabStatus.Saved
      : TabStatus.NotSaved;
    // this.ticketparam.

    return this._http
      .post<TicketFilterTabParametersResponse>(
        environment.baseUrl + `/Tickets/SaveTicketFilterTab`,
        this.ticketFilterTab
      )
      .pipe(
        map((response) => {
          if (response.success) {
            // const customObj: Tab = {};
            // customObj.filterJson = JSON.stringify(this.ticketparam.filterJson);
            // customObj.tabId = response.data.tabID;
            // customObj.tabUrl = `${this._navigationService.currentNavigation.id}/${response.data.guid}`;
            // customObj.menuId = this.ticketparam.menuID;
            // customObj.userID = this.ticketparam.userID;
            // customObj.tabName = this.ticketparam.tabName;
            // customObj.tabDescription = this.ticketparam.tabDescription;
            // customObj.guid = response.data.guid;
            // customObj.isEditable = this.ticketparam.isEditable;
            // customObj.isPinned = this.ticketparam.isPinned;
            // customObj.sortOrder = this.ticketparam.sortOrder;
            // customObj.templateID = this.ticketparam.templateID;
            // customObj.tabVersion = this.ticketparam.tabVersion;
            // customObj.status = this.ticketparam.status;

            const respObj = {
              tab: response.data,
              success: true,
            };

            return respObj;
          }
          return response;
        })
      );
  }

  upDateTab(
    filterGroupData: any,
    tabindex: number,
    tab: Tab,
    FilterFilledDataReply: GenericFilter
  ): Observable<IApiResponse<any>> {
    let filterObj;
    // if (tabindex === 0) {
    filterObj = FilterFilledDataReply;

    if (FilterFilledDataReply.postsType == 0) {
      FilterFilledDataReply.postsType = 1;
    } else {
      FilterFilledDataReply.postsType = 2;
    }
    // } else {
    //   filterObj = this._advanceFilterService.getGenericFilter();
    // }

    let dateDiff = 1;

    let startDate, endDate;
    startDate = moment(filterObj.startDateEpoch * 1000);
    endDate = moment(filterObj.endDateEpoch * 1000);
    dateDiff = endDate.diff(startDate, 'days');
    filterObj.isCustom = dateDiff;
    this.ticketparam.Filters = filterObj;
    this.ticketparam.tabID = tab.tabId;
    this.ticketparam.categoryID = 0;
    this.ticketparam.menuID = 1;
    this.ticketparam.userID = filterObj.userID;
    this.ticketparam.tabName = filterGroupData.GroupName;
    this.ticketparam.tabDescription = filterGroupData.Description;
    this.ticketparam.guid = tab.guid;
    this.ticketparam.isEditable = tab.isEditable;
    this.ticketparam.isPinned = tab.isPinned;
    this.ticketparam.sortOrder = tab.sortOrder;
    this.ticketparam.templateID = tab.templateID;
    this.ticketparam.tabVersion = tab.tabVersion;
    this.ticketparam.isdeleted = tab.isdeleted;
    this.ticketparam.status = tab.status;
    // this.ticketparam.

    return this._http
      .post<IApiResponse<any>>(
        environment.baseUrl + `/Tickets/SaveTicketFilterTab`,
        this.ticketparam
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  saveNewTab(tab: Tab): Observable<any> {
    // const filterObj =  this._filterService.getGenericFilter();
    this.ticketFilterTab.Filters = tab.Filters;
    this.ticketFilterTab.tabId = 0;
    this.ticketFilterTab.menuId =
      this._navigationService.currentNavigation.defaultTabs[0].menuId;
    this.ticketFilterTab.userID = tab.Filters.userID;
    this.ticketFilterTab.tabName = tab.tabName;
    this.ticketFilterTab.tabDescription = tab.tabDescription;
    this.ticketFilterTab.guid = '';
    this.ticketFilterTab.isEditable = true;
    this.ticketFilterTab.isPinned = false;
    this.ticketFilterTab.sortOrder =
      this._navigationService.currentNavigation.defaultTabs.length;
    this.ticketFilterTab.templateID = 0;
    this.ticketFilterTab.tabVersion =
      this._navigationService.currentNavigation.defaultTabs[0].tabVersion;
    this.ticketFilterTab.isdeleted = false;
    this.ticketFilterTab.status = TabStatus.NotSaved;
    // this.ticketparam.

    return this._http
      .post<TicketFilterTabParametersResponse>(
        environment.baseUrl + `/Tickets/SaveTicketFilterTab`,
        this.ticketFilterTab
      )
      .pipe(
        map((response) => {
          if (response.success) {
            const respObj = {
              tab: response.data,
              success: true,
            };

            return respObj;
          }
          return response;
        })
      );
  }

  saveDataOne(filterGroupData: any, tabindex: number): void {
    // Arranging data to navLink Format
    // const link = new Tab(uuid.v4(), filterGroupData['Filter Group Name']);
    // link.filterData = filterFormData;
    // link.filterGroupData = filterGroupData;
    // this.setValue(link);
    //
  }

  // Send data to Header NavLink
  getValue(): Observable<any> {
    return this.newLink.asObservable();
  }
  setValue(newValue: any): void {
    this.newLink.next(newValue);
  }
}

