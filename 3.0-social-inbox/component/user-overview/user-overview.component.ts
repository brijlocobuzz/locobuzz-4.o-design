import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { Sentiment } from 'app/core/enums/Sentiment';
import { Charts } from 'app/core/models/charts/Chart';
import { ChartUtility } from 'app/core/models/charts/ChartUtility';
import { DashBoardChart } from 'app/core/models/charts/DashBoardChart';
import { TotalSentimetColor } from 'app/core/models/charts/GlobalChartColor';
import { Series } from 'app/core/models/charts/Series';
import { UserLoyaltyDetails } from 'app/core/models/dbmodel/UserLoyaltyDetails';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { UserInteractionEnggagement } from 'app/core/models/viewmodel/UserInteractionEnggagement';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import * as Highcharts from 'highcharts';
import { ChartParams } from './../../../core/interfaces/charts';
import { LoaderService } from './../../../shared/services/loader.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { SubSink } from 'subsink';
import { CommonService } from 'app/core/services/common.service';

@Component({
    selector: 'app-user-overview',
    templateUrl: './user-overview.component.html',
    styleUrls: ['./user-overview.component.scss'],
    standalone: false
})
export class UserOverviewComponent implements OnInit {
  postObj: BaseMention;
  userLoyaltyDetails: UserLoyaltyDetails;
  userInteractionEnggagement: UserInteractionEnggagement[];
  sentimentTrendDetails: Series[];
  sentimentDetailOptions: any;
  highcharts = Highcharts;
  userInteractionOptions: any;
  overviewLoading = false;
  loyaltyLoader = false
  sentimentTradeLoader = false;
  interactionLoader = false;
  loaderTypeEnum = loaderTypeEnum;
  @Output() setLoader = new EventEmitter();
  brandAfinity: number = 0;
  npsScore: any = 0;
  defaultLayout: boolean = false;
  subs = new SubSink();
  constructor(
    // private accountService: AccountService,
    private filterService: FilterService,
    private _postDetailService: PostDetailService,
    private _loaderService: LoaderService,
    // private _ticketService: TicketsService,
    // public dialog: MatDialog,
    // private MapLocobuzz: MaplocobuzzentitiesService,
    private _snackBar: MatSnackBar,
    private _userDetailService: UserDetailService,
    private _cdr: ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.postObj = this._postDetailService.postObj;
    this.GetLoyaltyDetails();
    this.GetSentimentTrendDetails();
    this.GetUserInteraction();
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }

  private GetLoyaltyDetails(): void {
    this.loyaltyLoader = true;
    this.loaderFun()
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this._userDetailService.GetLoyaltyDetails(filterObj).subscribe((data) => {
      this.userLoyaltyDetails = data;
      this.npsScore = this.postObj.channelGroup == ChannelGroup.Facebook || this.postObj.channelGroup == ChannelGroup.Twitter ? Math.round(this.userLoyaltyDetails.npsScore) : 'NA'
      this.setLoader.emit(false);
      this.loyaltyLoader = false;
      this.loaderFun()
    });
  }

  private GetSentimentTrendDetails(): void {
    this.sentimentTradeLoader =  true;
    this.loaderFun()
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    filterObj.chartType = 'M';
    this._userDetailService
      .GetSentimentTrendDetailsEnrichMentView(filterObj)
      .subscribe((data) => {
        this.sentimentTrendDetails = data;
        this.buildSentimentChart(data);
        this.sentimentTradeLoader = false
        this.loaderFun()
      });
  }

  private buildSentimentChart(seriesData: Series[]): void {
    const chartUtility = new ChartUtility(seriesData, 6); // chartType=6 for Line Chart
    const data = chartUtility.getJSChartDataStack();
    // const dashboardchart = new DashBoardChart();
    let positiveCount = 0;
    let negativeCount = 0;
    data.series.forEach((obj) => {
      if (obj.name == Sentiment[Sentiment.Positive]) {
        obj.color = TotalSentimetColor.positive;
        obj.data.forEach((dataObj) => {
          positiveCount += dataObj.y;
        });
      }
      if (obj.name == Sentiment[Sentiment.Negative]) {
        obj.color = TotalSentimetColor.negative;
        obj.data.forEach((dataObj) => {
          negativeCount += dataObj.y;
        });
          }
      if (obj.name == Sentiment[Sentiment.Neutral])
      {
        obj.color = TotalSentimetColor.neutral
            }
          }
      );
    let brandAfinity =positiveCount - negativeCount / positiveCount + negativeCount*10;
    this.brandAfinity = isNaN(brandAfinity) ? 0 : brandAfinity;
    this.brandAfinity = isFinite(Math.round(this.brandAfinity)) ? Math.round(this.brandAfinity) : 0;


    const chartParams: ChartParams = {
      highChartContainerObj: null,
      title: '',
      subtitle: '',
      xAxis: data.xAxis,
      yAxisLabel: '',
      series: data.series,
      pointWidth: null,
      stackingType: undefined,
      isTimeBased: false,
      ClickFunction: undefined,
      ChartType: 'spline',
      isxAxisLabelHTML: false,
      ischannel: false,
      height: undefined,
      isNotTickInterval: '',
      Logarithmic: true,
      polar: false,
      showLegend: true,
    };
    this.sentimentDetailOptions = DashBoardChart.drawHighChart(chartParams);
  }

  private GetUserInteraction(): void {
    this.interactionLoader=true;
    this.loaderFun()
    const filterObj = this.filterService.getGenericRequestFilter(this.postObj);
    this._userDetailService.GetUserInteraction(filterObj).subscribe((data) => {
      this.userInteractionEnggagement = data;
      this.EngagementData(this.userInteractionEnggagement);
      this.interactionLoader = false;
      this.loaderFun()
    });
  }

  private EngagementData(data: UserInteractionEnggagement[]): void {
    const brands = data.map((obj) => {
      return obj.brandFriendlyName;
    });
    // Enumerable.From(data).Select(function (s) { return [s.BrandFriendlyName] }).ToArray();
    const TotalPosts = data.map((obj) => {
      return obj.mentionCount;
    });
    // Enumerable.From(data).Select(function (s) { return [s.MentionCount] }).ToArray();
    const PositiveCounts = data.map((obj) => {
      return obj.positive;
    });
    // Enumerable.From(data).Select(function (s) { return [s.Positive] }).ToArray();
    const NeutralCounts = data.map((obj) => {
      return obj.neutral;
    });
    // Enumerable.From(data).Select(function (s) { return [s.Neutral] }).ToArray();
    const NegativeCounts = data.map((obj) => {
      return obj.negative;
    });
    // Enumerable.From(data).Select(function (s) { return [s.Negative] }).ToArray();
    const cat = ['Positive', 'Negative', 'Neutral'];
    const INFormat = new Intl.NumberFormat('en-IN');

    // for (let i = 0; i < brands.length; i++) {

    //     brands[i] = brands[i][0];
    //     TotalPosts[i] = TotalPosts[i][0];

    //     PositiveCounts[i] = PositiveCounts[i][0];

    //     NeutralCounts[i] = NeutralCounts[i][0];

    //     NegativeCounts[i] = NegativeCounts[i][0];

    // }
    if (
      !(
        +(
          PositiveCounts.reduce((a, b) => a + b, 0) +
          NeutralCounts.reduce((a, b) => a + b, 0) +
          NegativeCounts.reduce((a, b) => a + b, 0)
        ) > 0
      )
    ) {
      this.userInteractionOptions = {};
      // $('#ChannelChart').html('<div class="NoDataFound" style="text-align:center;margin-top:25px;min-height: 300px;"></div>');
    } else {
      const colors = [];
      const ChannelData = [];
      const EngagementData = [];
      for (let i = 0; i < brands.length; i++) {
        colors[i] = DashBoardChart.GetChannelColors(i);
        ChannelData.push({
          name: brands[i],
          y: +TotalPosts[i],
          color: colors[i],
        });

        EngagementData.push({
          name: cat[0],
          channel: brands[i],
          y: +PositiveCounts[i],
          color: '#76DE32', // Highcharts.Color(colors[i]).brighten(0.2).get()
        });

        EngagementData.push({
          name: cat[1],
          channel: brands[i],
          y: +NegativeCounts[i],
          color: '#F46666', // Highcharts.Color(colors[i]).brighten(0.133).get()
        });

        EngagementData.push({
          name: cat[2],
          channel: brands[i],
          y: +NeutralCounts[i],
          color: '#F4D039',
        });
      }
      const series = [
        {
          type: undefined,
          name: 'Total Count',
          data: ChannelData,
          // size: '50%',
          size: '70%',
          dataLabels: {
            /* eslint-disable */
            formatter() {
              // return this.percentage > 15
              //   ? '<b>' + this.point.name + '</b> '
              //   : null;
              return '';
            },
            color: 'white',
            distance: -45,
          },
          tooltip: {
            useHTML: false,
            headerFormat: '',
            pointFormat: '{point.name}:{point.y}',
          },
        },
        {
          type: undefined,
          name: 'Count',
          data: EngagementData,
          // size: '67%',
          // innerSize: '55%',
          size: '85%',
          innerSize: '60%',
          dataLabels: {
            distance: -25,
            formatter() {
              // return this.y > 0
              //   ? '<b>' + this.point.name + ' :</b> ' + INFormat.format(this.y)
              //   : null;
              return '';
            },
            color: '#ffffff',
            enabled: true,
          },
          tooltip: {
            useHTML: false,
            headerFormat: '',
            pointFormat: '{point.channel}  {point.name}:{point.y}',
          },
          showInLegend: false,
        },
      ];
      this.userInteractionOptions = Charts.DrawHighchartPieChart(
        '',
        '',
        '',
        '',
        '',
        series,
        true,
        '',
        true,
        true,
        false,
        undefined,
        '',
        '',
        true,
        false
      );
      // console.log('UserInteraction', JSON.stringify(this.userInteractionOptions));
    }
  }

  loaderFun():void
  {
   if(!this.interactionLoader && !this.sentimentTradeLoader && !this.loyaltyLoader)
   {
    this.overviewLoading = false
   }else{
     this.overviewLoading = true
   }
  }
}
