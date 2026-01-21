import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { Sentiment } from 'app/core/enums/Sentiment';
import {
  ChannelWiseActivityCount,
  CustomChannelWiseActivityCount,
} from 'app/core/models/dbmodel/ChannelWiseActivityCount';
import { MentionInformation } from 'app/core/models/dbmodel/MentionInformation';
import {
  UserOneViewDTO,
  UserOneViewModel,
} from 'app/core/models/dbmodel/UserOneViewDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { CommonService } from 'app/core/services/common.service';
import { LocobuzzmentionService } from 'app/core/services/locobuzzmention.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { UseroneviewService } from 'app/social-inbox/services/useroneview.service';
import moment from 'moment';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-user-activities',
    templateUrl: './user-activities.component.html',
    styleUrls: ['./user-activities.component.scss'],
    standalone: false
})
export class UserActivitiesComponent implements OnInit {
  userOneViewTimeline: MentionInformation;
  channelWiseUserActivityCount: ChannelWiseActivityCount[] = [];
  customActivityCount: CustomChannelWiseActivityCount[] = [];
  userOneViewDTO: UserOneViewDTO[];
  postObj: BaseMention;
  userOneViewModel: UserOneViewModel;
  activitiesLoading = true;
  loaderTypeEnum = loaderTypeEnum;
  spinnerFlag: boolean;
  defaultLayout: boolean = false;
  subs = new SubSink();
  constructor(
    private filterService: FilterService,
    private _postDetailService: PostDetailService,
    // private _ticketService: TicketsService,
    // public dialog: MatDialog,
    // private MapLocobuzz: MaplocobuzzentitiesService,
    private _userDetailService: UserDetailService,
    private _locobuzzMentionService: LocobuzzmentionService,
    private _userOneViewService: UseroneviewService,
    private _cdr:ChangeDetectorRef, 
    private _sidebarService: SidebarService,
    private commonService: CommonService
  ) {}

  public get channelGroupEnum(): typeof ChannelGroup {
    return ChannelGroup;
  }

  ngOnInit(): void {
    this.activitiesLoading = true;
    this.userOneViewModel = {};
    this.postObj = this._postDetailService.postObj;
    this.GetUserOneViewTimeline();
    this.GetChannelWiseUserActivityCount();
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    );
  }

  private GetUserOneViewTimeline(channelid?: number): void {
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    if (channelid) {
      filterObj.channel = channelid;
    } else {
      filterObj.channel = 0;
    }
    filterObj.author = null;
    const date = new Date();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    filterObj.startDateEpoch = moment(firstDay).utc().unix();
    filterObj.endDateEpoch =
      moment(lastDay).endOf('day').utc().unix() - parseInt('1');
    this._userDetailService
      .GetUserOneViewTimeline(filterObj)
      .subscribe((data) => {
        this.userOneViewTimeline = data;
        this.mapUserOneView();
      });
  }

  getUserTimelineByChannel(channelid): void {
    this.spinnerFlag=true;
    this.userOneViewDTO=[];
    this.activitiesLoading=true;
    this.GetUserOneViewTimeline(+channelid);
  }

  mapUserOneView(): void {
    // this.userOneViewModel.firstActivity = this.userOneViewTimeline.firstActivity
    //   ? this._userOneViewService.calculateActivityTiming(
    //       this.userOneViewTimeline.firstActivity
    //     ).timetoshow
    //   : 'NA';
    const timeOffset = new Date().getTimezoneOffset();
    this.userOneViewModel.firstActivity = moment(
      this.userOneViewTimeline.firstActivity
    )
      .add('minutes', -timeOffset)
      .local()
      .fromNow();
    this.userOneViewModel.lastActivity = moment(
      this.userOneViewTimeline.lastActivity
    )
      .add('minutes', -timeOffset)
      .local()
      .fromNow();
    // this.userOneViewModel.lastActivity = this.userOneViewTimeline.lastActivity
    //   ? this._userOneViewService.calculateActivityTiming(
    //       this.userOneViewTimeline.lastActivity
    //     ).timetoshow
    //   : 'NA';

    this.checkSentimentType();

    if (this.userOneViewTimeline.mentionList.length > 0) {
      this.userOneViewModel.channelIcon =
        this._locobuzzMentionService.getChannelIcon(
          this.userOneViewTimeline.mentionList[0]
        );
      this.userOneViewDTO = this._userOneViewService.buildUserOneviewObject(
        this.userOneViewTimeline.mentionList
      );
    }
    this.activitiesLoading = false;
    this.spinnerFlag = false;
  }

  private GetChannelWiseUserActivityCount(): void {
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this._userDetailService
      .GetChannelWiseUserActivityCount(filterObj)
      .subscribe((data) => {
        this.channelWiseUserActivityCount = data;
        this.setCustomActivityCount(this.channelWiseUserActivityCount);
      });
  }

  setCustomActivityCount(channelObj: ChannelWiseActivityCount[]): void {
    if (channelObj && channelObj.length > 0) {
      channelObj.forEach((obj) => {
        this.customActivityCount.push({
          channelGroup: obj.channelGroup,
          count: obj.count,
          channelName: ChannelGroup[obj.channelGroup],
        });
      });
    }
  }

  checkSentimentType(): void {
    try {
      this.userOneViewModel.firstSentiment =
        Sentiment[this.userOneViewTimeline.firstSentimentType];
      this.userOneViewModel.lastSentiMent =
        Sentiment[this.userOneViewTimeline.lastSentimentType];
      if (this.userOneViewTimeline.lastSentimentType === Sentiment.Positive) {
        this.userOneViewModel.lastsentimentcolor = 'colored__green';
      } else if (
        this.userOneViewTimeline.lastSentimentType === Sentiment.Negative
      ) {
        this.userOneViewModel.lastsentimentcolor = 'colored__red';
      } else if (
        this.userOneViewTimeline.lastSentimentType === Sentiment.Neutral
      ) {
        this.userOneViewModel.lastsentimentcolor = 'colored__yellow';
      }

      if (this.userOneViewTimeline.firstSentimentType === Sentiment.Positive) {
        this.userOneViewModel.firstsentimentcolor = 'colored__green';
      } else if (
        this.userOneViewTimeline.firstSentimentType === Sentiment.Negative
      ) {
        this.userOneViewModel.firstsentimentcolor = 'colored__red';
      } else if (
        this.userOneViewTimeline.firstSentimentType === Sentiment.Neutral
      ) {
        this.userOneViewModel.firstsentimentcolor = 'colored__yellow';
      }
    } catch (exception) {
      this.userOneViewModel.firstSentiment = 'Negative';
      this.userOneViewModel.lastSentiMent = 'Negative';
    }
  }
}

