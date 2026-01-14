import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LogStatus } from 'app/core/enums/LogStatus';
import { notificationType } from 'app/core/enums/notificationType';
import {
  BaseAuthorResponse,
  BaseSocialAuthor,
  ConnectedSocialAuthors,
} from 'app/core/models/authors/locobuzz/BaseSocialAuthor';
import { ChartResponse, Series } from 'app/core/models/charts/Series';
import {
  ChannelWiseActivityCount,
  ChannelWiseActivityCountResponse,
} from 'app/core/models/dbmodel/ChannelWiseActivityCount';
import {
  MentionInformation,
  MentionInformationResponse,
} from 'app/core/models/dbmodel/MentionInformation';
import { CustomResponse } from 'app/core/models/dbmodel/TicketReplyDTO';
import {
  UpliftAndSentimentScore,
  UpliftAndSentimentScoreResponse,
} from 'app/core/models/dbmodel/UpliftAndSentimentScore';
import {
  UserLoyaltyDetails,
  UserLoyaltyDetailsResponse,
} from 'app/core/models/dbmodel/UserLoyaltyDetails';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import {
  CommunicationLog,
  CommunicationLogResponse,
} from 'app/core/models/viewmodel/CommunicationLog';
import { GenericRequestParameters } from 'app/core/models/viewmodel/GenericRequestParameters';
import { IApiResponse } from 'app/core/models/viewmodel/IApiResponse';
import {
  TicketInfo,
  TicketInfoResponse,
} from 'app/core/models/viewmodel/TicketInfo';
import { ITraitsDeleteReq, ITraitsReq } from 'app/core/models/viewmodel/traits';
import {
  UserInteractionEnggagement,
  UserInteractionEnggagementResponse,
} from 'app/core/models/viewmodel/UserInteractionEnggagement';
import { CustomSnackbarComponent } from 'app/shared/components';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})

// eslint-disable-next-line @typescript-eslint/naming-convention
export class UserDetailService {
  communicationLog: CommunicationLog;
  schedulebreak: BehaviorSubject<any> = new BehaviorSubject(null);
  connectedUsers = new BehaviorSubject<ConnectedSocialAuthors>(null);
  updateTicketFields = new BehaviorSubject<boolean>(false);
  constructor(
    private httpClient: HttpClient,
    private _http: HttpClient,
    private _snackBar: MatSnackBar
  ) {}

  GetAuthorDetails(
    filterObj: GenericRequestParameters
  ): Observable<BaseSocialAuthor> {
    return this.httpClient
      .post<BaseAuthorResponse>(
        environment.baseUrl + '/Tickets/GetAuthorDetails',
        filterObj
      )
      .pipe(
        map((response) => {
          localStorage.setItem('AuthorDetails', JSON.stringify(response.data));
          return response.data;
        })
      );
  }

  GetAuthorTicketDetails(
    filterObj: GenericRequestParameters
  ): Observable<BaseSocialAuthor> {
    return this.httpClient
      .post<BaseAuthorResponse>(
        environment.baseUrl + '/Tickets/GetAuthorTicketDetails',
        filterObj
      )
      .pipe(
        map((response) => {
          // localStorage.setItem('CrmticketDetails', JSON.stringify(response.data));
          return response.data;
        })
      );
  }


  GetTicketTimeline(
    filterObj: GenericRequestParameters
  ): Observable<CommunicationLogResponse> {
    return this.httpClient
      .post<CustomResponse>(
        environment.baseUrl + '/Tickets/GetTicketTimeLine',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  GetTicketSummary(
    filterObj: GenericRequestParameters
  ): Observable<TicketInfo> {
    return this.httpClient
      .post<TicketInfoResponse>(
        environment.baseUrl + '/Tickets/GetTicketSummary',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  updateTicketDetails( obj) {
    return this.httpClient
      .post<TicketInfoResponse>(
        environment.baseUrl + '/Tickets/UpdateTicketDetailCRM',
        obj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetSentimentUpliftAndNPSScore(
    filterObj: GenericRequestParameters
  ): Observable<UpliftAndSentimentScore> {
    return this.httpClient
      .post<UpliftAndSentimentScoreResponse>(
        environment.baseUrl + '/Tickets/GetSentimentUpliftAndNPSScore',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  getAutoQueueingConfig(): void {
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo',
    });

    let key = {
      brandID: 7121,
      brandName: 'wrong',
      categoryGroupID: 0,
      categoryID: 0,
      categoryName: 'string',
      mainBrandID: 0,
      compititionBrandIDs: [0],
      brandFriendlyName: 'string',
      brandLogo: 'string',
      isBrandworkFlowEnabled: true,
      brandGroupName: 'string',
    };
    this.httpClient.post(
      environment.baseUrl + '/Account/GetAutoQueueingConfig',
      key,
      { headers: Theaders }
    );
  }

  likeDislikeMention(): Observable<object> {
    let key = {
      Source: {
        $type:
          'LocobuzzNG.Entities.Classes.Mentions.FacebookMention, LocobuzzNG.Entities',
        ChannelGroup: 2,
        BrandInfo: { BrandID: '7121', BrandName: 'wrong' },
        SocialID: '192524738874188_193950238731638',
      },
      Account: {
        $type:
          'LocobuzzNG.Entities.Classes.AccountConfigurations.FacebookAccountConfiguration, LocobuzzNG.Entities',
        AccountID: 31810,
        SocialID: '101146514678678',
        BrandInformation: { BrandID: '7121', BrandName: 'wrong' },
      },
      IsLike: true,
    };
    return this.httpClient.post(
      environment.baseUrl + '/Mention/LikeDislikeMention',
      key
    );
  }

  retweetUnretweetMention(): Observable<object> {
    let key = {
      Source: {
        $type:
          'LocobuzzNG.Entities.Classes.Mentions.TwitterMention, LocobuzzNG.Entities',
        ChannelGroup: 1,
        BrandInfo: { BrandID: '7121', BrandName: 'wrong' },
        SocialID: '1351528143564075015',
        ParentSocialID: '1347058220343324673',
      },
      Account: {
        $type:
          'LocobuzzNG.Entities.Classes.AccountConfigurations.TwitterAccountConfiguration, LocobuzzNG.Entities',
        AccountID: 10798,
        SocialID: '1054251559826141184',
        BrandInformation: { BrandID: '7121', BrandName: 'wrong' },
      },
      IsRetweet: false,
    };
    return this.httpClient.post(
      environment.baseUrl + '/Mention/RetweetUnretweetMention',
      key
    );
  }

  hideUnhideMention(): Observable<object> {
    let key = {
      Source: {
        $type:
          'LocobuzzNG.Entities.Classes.Mentions.FacebookMention, LocobuzzNG.Entities',
        ChannelGroup: 2,
        ChannelType: 8,
        TagID: 203788,
        BrandInfo: { BrandID: '7121', BrandName: 'wrong' },
        SocialID: '192524738874188_193950238731638',
      },
      Account: {
        $type:
          'LocobuzzNG.Entities.Classes.AccountConfigurations.FacebookAccountConfiguration, LocobuzzNG.Entities',
        AccountID: 31810,
        SocialID: '101146514678678',
        BrandInformation: { BrandID: '7121', BrandName: 'wrong' },
      },
      IsHidden: false,
      IsHiddenFromAllBrand: false,
    };
    return this.httpClient.post(
      environment.baseUrl + '/Mention/HideUnhideMention',
      key
    );
  }

  mapAsComminucationLog(mention: BaseMention): CommunicationLog {
    return (this.communicationLog = {
      note: mention.note,
      iD: mention.id,
      mentionTime: mention.mentionTime,
      userID: +mention.userID,
      username: mention.username,
      usernames: mention.usernames,
      ticketID: mention.ticketID,
      mentionID: mention.mentionID,
      postID: mention.postID,
      tagID: mention.tagID,
      assignedToUserID: mention.assignedToUserID,
      assignedToTeam: mention.assignedToTeam,
      assignedToTeamName: mention.assignedToTeamName,
      previousAssignToUserID: mention.previousAssignToUserID,
      previousAssignedToTeam: mention.previousAssignedToTeam,
      previousAssignedToTeamName: mention.previousAssignedToTeamName,
      assignedToUsername: mention.assignedToUsername,
      status: mention.status,
      lstStatus: mention.lstStatus,
      lstUserNames: mention.lstUserNames,
      lstUserIDs: mention.lstUserIDs,
      lstLogIDs: mention.lstLogIDs,
      lstAssignedtoUserNames: mention.lstAssignedtoUserNames,
      batchID: mention.batchID,
      agentPic: mention.agentPic,
      assignedToAgentPic: mention.assignedToAgentPic,
      assignedToAccountType: mention.assignedToAccountType,
      accountType: mention.accountType,
      postScheduledDateTime: mention.postScheduledDateTime,
      replyScheduledDateTime: mention.replyScheduledDateTime,
      replyEscalatedToUsername: mention.replyEscalatedToUsername,
      replyUserName: mention.replyUserName,
      isScheduled: mention.isScheduled,
      workflowReplyDetailID: mention.workflowReplyDetailID,
      channelType: mention.channelType,
      isLastLog: mention.isLastLog,
      author: mention.author,
      brandInfo: mention.brandInfo,
      globalTicketVersion: mention.globalTicketVersion,
      nextLogBatchID: mention.nextLogBatchID,
      nextLogStatus: mention.nextLogStatus,
      actionTakenFrom: mention.actionTakenFrom,
      logVersion: mention.logVersion,
      contentID: mention.contentID,
      isHtml: mention.isHtml,
      concreteClassName: mention.concreteClassName,
      mentionTimeEpoch: mention.mentionTimeEpoch,
      channelGroup: mention.channelGroup,
      logText: mention.logText,
    });
  }

  checkLogCondition(comObj: CommunicationLog): number {
    let logcondition = 0;
    if (
      comObj.logVersion === 1 &&
      comObj.status === LogStatus.GroupDisplayMessage
    ) {
      logcondition = 1;
    } else if (
      comObj.logVersion === 0 &&
      (comObj.status === LogStatus.RepliedToUser ||
        comObj.status === LogStatus.Escalated ||
        comObj.status === LogStatus.Ignore ||
        comObj.status === LogStatus.Approve ||
        comObj.status === LogStatus.NotesAdded ||
        comObj.status === LogStatus.Acknowledge ||
        comObj.status === LogStatus.SRCreated ||
        comObj.status === LogStatus.SRUpdated ||
        comObj.status === LogStatus.CopyMentionFrom ||
        comObj.status === LogStatus.CopyMentionTo ||
        comObj.status === LogStatus.MoveMentionFrom ||
        comObj.status === LogStatus.MoveMentionTo ||
        comObj.status === LogStatus.EmailSent ||
        comObj.status === LogStatus.CustomerInfoAwaited ||
        comObj.status === LogStatus.ModifiedTicketTagging ||
        comObj.status === LogStatus.TicketSubscribed ||
        comObj.status === LogStatus.TicketUnsubscribed ||
        comObj.status === LogStatus.TicketSubscriptionModified ||
        comObj.status === LogStatus.TicketSubscriptionEmailSent ||
        comObj.status === LogStatus.CrmLeadCreated ||
        comObj.status === LogStatus.PerformActionReplyFailed ||
        comObj.status === LogStatus.ReopenACase ||
        comObj.status === LogStatus.OnHold ||
        comObj.status === LogStatus.TeamDeleted ||
        comObj.status === LogStatus.BulkReplyRequestInitiated ||
        comObj.status === LogStatus.ReplyTextModified ||
        comObj.status === LogStatus.MakerCheckerSet ||
        comObj.status === LogStatus.MakerCheckerDisable ||
        comObj.status === LogStatus.SSREReplyRejected ||
        comObj.status === LogStatus.SSREReplyVerified)
    ) {
      logcondition = 2;
    } else if (
      comObj.logVersion === 0 &&
      (comObj.status === LogStatus.Closed ||
        comObj.status === LogStatus.SRClosed)
    ) {
      logcondition = 3;
    }
    return logcondition;
  }

  GetLoyaltyDetails(
    filterObj: GenericRequestParameters
  ): Observable<UserLoyaltyDetails> {
    return this.httpClient
      .post<UserLoyaltyDetailsResponse>(
        environment.baseUrl + '/Tickets/GetLoyaltyDetails',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  GetChannelWiseUserActivityCount(
    filterObj: GenericRequestParameters
  ): Observable<ChannelWiseActivityCount[]> {
    return this.httpClient
      .post<ChannelWiseActivityCountResponse>(
        environment.baseUrl + '/Tickets/GetChannelWiseUserActivityCount',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  GetUserInteraction(
    filterObj: GenericRequestParameters
  ): Observable<UserInteractionEnggagement[]> {
    return this.httpClient
      .post<UserInteractionEnggagementResponse>(
        environment.baseUrl + '/Tickets/GetUserInteraction',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  GetSentimentTrendDetailsEnrichMentView(
    filterObj: GenericRequestParameters
  ): Observable<Series[]> {
    return this.httpClient
      .post<ChartResponse>(
        environment.baseUrl + '/Tickets/GetSentimentTrendDetailsEnrichMentView',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  GetUserOneViewTimeline(
    filterObj: GenericRequestParameters
  ): Observable<MentionInformation> {
    return this.httpClient
      .post<MentionInformationResponse>(
        environment.baseUrl + '/Tickets/GetUserOneViewTimeline',
        filterObj
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  blockUnblockAuthor(keyObj): Observable<IApiResponse<any>> {
    return this.httpClient
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Author/BlockUnblockAuthor',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  muteUnmuteAuthor(keyObj): Observable<IApiResponse<any>> {
    return this.httpClient
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Author/MuteUnmuteAuthor',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  followUnfollowAuthor(keyObj): Observable<IApiResponse<any>> {
    return this.httpClient
      .post<IApiResponse<any>>(
        environment.baseUrl + '/Author/FollowUnfollowAuthor',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getUserAssigmentDetails(): any {
    return this._http
      .get(environment.baseUrl + '/Tickets/GetUserAssigmentDetails')
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  GetTotalTicketAssignedCount(): any {
    return this._http
      .get(environment.baseUrl + '/Tickets/GetTotalTicketAssignedCount')
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  GetStatusofMuteUnmute(obj): any {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetStatusofMuteUnmute', obj)
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  GetStatusofBlockUnblockUser(obj): any {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetStatusofBlockUnblockUser', obj)
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  GetStatusofFollowUnfollow(obj): any {
    return this._http
      .post(environment.baseUrl + '/Tickets/GetStatusofFollowUnfollow', obj)
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  schedulebreaksubmit(obj): void {
    this.schedulebreak.next(obj);
  }

  ScheduleBreakAndPauseAssignment(): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Account/ScheduleBreakAndPauseAssignment',
        {}
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while rejecting bulk reply',
              },
            });
          }
        })
      );
  }

  CancelBreakAndStartAssignment(): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Account/CancelBreakAndStartAssignment',
        {}
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while rejecting bulk reply',
              },
            });
          }
        })
      );
  }

  UserIsOnBreak(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Account/UserIsOnBreak',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }

  updateUserSetting(obj): any {
    return this._http
      .post(environment.baseUrl + '/Account/UpdateUserPersonalizationDetails', obj)
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  getAnalyticsMenu(obj): any {
    return this._http
      .post(environment.baseUrlAWA + '/analytics-menu', obj)
      .pipe(
        map((response: any) => {
          return response;
        })
      );
  }

  UserIsOnBreakFromCounter(keyObj): Observable<CustomResponse> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Account/UserIsOnBreakFromCounter',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while rejecting bulk reply',
              },
            });
          }
        })
      );
  }

  SSOUserResponseCallback(code:string): any {
    return this._http
      .get<CustomResponse>(
        environment.baseUrl + `/SSOUser/SSOEndBreakCallback/${code}`
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  
  EndBreakWithSSO(): any {
    return this._http
      .get<CustomResponse>(
        environment.baseUrl + '/SSOUser/EndBreakWithSSO'
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  BreakEnding(keyObj): any {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Account/BreakEnding',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  saveTraits(keyObj): any {
    return this._http
      .post<ITraitsReq>(environment.baseUrl + '/tickets/SaveUserTags', keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  deleteTraits(keyObj): any {
    return this._http
      .post<ITraitsDeleteReq>(
        environment.baseUrl + '/tickets/RemoveUserTags',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  unlinkMapSocialUsers(keyObj): any {
    return this._http
      .post<ITraitsDeleteReq>(
        environment.baseUrl + '/tickets/UnlinkMapSocialUsers',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetTicketCategoryDetails(
    data: any
  ): Observable<any> {
    return this.httpClient
      .post<BaseAuthorResponse>(
        environment.baseUrl + '/Tickets/GetTicketCategoryDetails',
        data
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  GetMentionCategoryDetails(
    data: any
  ): Observable<any> {
    return this.httpClient
      .post<BaseAuthorResponse>(
        environment.baseUrl + '/Tickets/GetMentionCategoryDetails',
        data
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  GetBlockPagesAndHandles(
    data: any
  ): Observable<any> {
    return this.httpClient
      .post<BaseAuthorResponse>(
        environment.baseUrl + '/Author/GetBlockPagesAndHandles',
        data
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  BlockPagesAndHandles(
    data: any
  ): Observable<any> {
    return this.httpClient
      .post<BaseAuthorResponse>(
        environment.baseUrl + '/Author/BlockPagesAndHandles',
        data
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  UnBlockPagesAndHandles(data): Observable<any> {
    return this.httpClient
      .post<BaseAuthorResponse>(
        environment.baseUrl + '/Author/UnBlockPagesAndHandles',
        data
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetAuthorTicketMandatoryDetails(obj: any): Observable<any> {
    return this.httpClient
      .post<BaseAuthorResponse>(
        environment.baseUrl + '/Tickets/GetAuthorTicketMandatoryDetails',
        obj
      )
      .pipe(
        map((response) => {
          return response;
        })
      )
  }
}
