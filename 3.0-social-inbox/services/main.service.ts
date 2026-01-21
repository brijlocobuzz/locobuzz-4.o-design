import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { post } from 'app/app-data/post';
import { summary } from 'app/app-data/post-summary';
import { filter } from 'app/app-data/ticket';
import { GenericFilter } from 'app/core/models/viewmodel/GenericFilter';
import { IApiResponse } from 'app/core/models/viewmodel/IApiResponse';
import {
  MixedTicketCount,
  MyTicketsCount,
  MyTicketsCountResponse,
  TicketsCountResponse,
} from 'app/core/models/viewmodel/TicketsCount';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { navbarItem } from '../../core/interfaces/locobuzz-navigation';

@Injectable({
  providedIn: 'root',
})
export class MainService {
  selectedTabCountObs = new BehaviorSubject(null);
  ticketAboutToBreachedCancelObs = new Subject<boolean>();
  stopChatbotInterval = new Subject<boolean>()
  christmasPlayPauseObs = new Subject<string>();
  redirectToDIYDashboard = new Subject<any>();
  constructor(private httpClient: HttpClient) {}

  getSummaryData(): {}[] {
    return summary;
  }

  getNavData(): navbarItem[] {
    return filter;
  }

  getPostData(): {}[] {
    return post;
  }

  GetAllTicketsCount(filterObj: GenericFilter): Observable<MixedTicketCount> {
    return this.httpClient
      .post<TicketsCountResponse>(
        environment.baseUrl + '/Tickets/TicketCounts',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  GetUnseenTicketsCount(filterObj: GenericFilter): Observable<MyTicketsCount> {
    return this.httpClient
      .post<MyTicketsCountResponse>(
        environment.baseUrl + '/Tickets/GetUnseenCountStatusWise',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  GetTicketsCount(filterObj: GenericFilter): Observable<MyTicketsCount> {
    return this.httpClient
      .post<MyTicketsCountResponse>(
        environment.baseUrl + '/Tickets/GetTicketTabsCount',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  getTicketsAboutToBreach(
    filterObj: GenericFilter
  ): Observable<IApiResponse<any>> {
    return this.httpClient
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Tickets/TicketsAboutToBreach',
        filterObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getBulkPorgressList(
  ): Observable<IApiResponse<any>> {
    return this.httpClient
      .post<IApiResponse<any>>(
        environment.baseUrl + '/tickets/GetRunningBulkActions',
        {}
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
