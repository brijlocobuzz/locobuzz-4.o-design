import { AgmMap } from '@agm/core';
import { I } from '@angular/cdk/keycodes';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  NgZone,
  OnInit,
  Optional,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import {
  randomColors,
  replyMapData,
  retweetMapData,
  trendData,
  wordCloudData,
} from 'app/app-data/widget-data';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { WidgetChartType } from 'app/core/enums/widgetEnum';
import { ChartParams } from 'app/core/interfaces/charts';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { ChartUtility } from 'app/core/models/charts/ChartUtility';
import { DashBoardChart } from 'app/core/models/charts/DashBoardChart';
import { Series } from 'app/core/models/charts/Series';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { TagCloudAndMentionData } from 'app/core/models/viewmodel/TagCloudAndMentionData';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import {} from 'googlemaps';
@Component({
    selector: 'app-trends',
    templateUrl: './trends.component.html',
    styleUrls: ['./trends.component.scss'],
    standalone: false
})
export class TrendsComponent implements OnInit {
  @Input() postData: BaseMention;
  @Input() post: TicketClient;
  baseMentionObj: BaseMention;

  @ViewChildren('usermention') usermentionscroll: QueryList<
    ElementRef<HTMLDivElement>
  >;
  @ViewChildren('trendchart') trendchartscroll: QueryList<
    ElementRef<HTMLDivElement>
  >;
  @ViewChildren('engageduser') engageduserscroll: QueryList<
    ElementRef<HTMLDivElement>
  >;
  @ViewChildren('replywordcloud') replywordcloudscroll: QueryList<
    ElementRef<HTMLDivElement>
  >;
  @ViewChildren('replymap') replymapscroll: QueryList<
    ElementRef<HTMLDivElement>
  >;

  retweetlat = 37.782;
  retweetlon = -122.447;

  replylat = 37.782;
  replylon = -122.447;

  retweetmap: any;
  replymap: any;
  retweetMarker: any[] = [];
  replyMarker: any[] = [];

  retweetheatmap: any;
  replyheatmap: any;

  retweetmapData: any = {};
  replymapData: any = {};
  tagCloudData: any = {};
  public agmMap: AgmMap;

  usermentionLi = true;
  trendchartLi = false;
  engageduserLi = false;
  replywordcloudLi = false;
  replymapLi = false;
  retweetmapLi = false;
  engagedUserList: BaseMention[] = [];
  totalEngagedUsers: number = 0;
  selectedfilter = -1;
  selectedOrderBy = 1;

  // word cloud
  str =
    'Exercitation duis ex laboris laboris est aliqua Lorem veniam ad. Minim aliqua enim do exercitation duis eiusmod sunt do exercitation qui ex. Aliqua velit sunt in commodo anim. Sunt labore sunt dolor exercitation non commodo laboris culpa culpa exercitation ex proident laborum.\n\nId dolore commodo occaecat in velit. Aliqua mollit ea qui ad aute est excepteur non aliqua occaecat ad non ea. Labore incididunt excepteur tempor culpa proident ex commodo. Nisi nostrud tempor deserunt';
  wclouddata: any;

  public rotate: any = 0;
  public fillMapper: any;
  public fillFx: any;
  public title: string = 'Welcome to d3-cloud-angular demo';
  public animations: boolean = true;
  public autoFill: boolean = true;
  public font: string = 'calibri';

  showUserMention: boolean;
  showUserTrendChart: boolean;
  showEngagedProfiles: boolean;
  showReplyWordCloud: boolean;
  showReTweetMap: boolean;
  showReplyMap: boolean;

  showUserMentionLoader: boolean;
  showUserTrendChartLoader: boolean;
  showEngagedProfilesLoader: boolean;
  showReplyWordCloudLoader: boolean;
  showReTweetMapLoader: boolean;
  showReplyMapLoader: boolean;

  showUserMentionNoDataF: boolean;
  showUserTrendChartNoDataF: boolean;
  showEngagedProfilesNoDataF: boolean;
  showReplyWordCloudNoDataF: boolean;
  showReTweetMapNoDataF: boolean;
  showReplyMapNoDataF: boolean;

  totalWC: number = 0;
  positiveWC: number = 0;
  negativeWC: number = 0;
  neutralWC: number = 0;

  chartOptions: any;

  trendUserFilter: any = {
    brandInfo: {
      brandID: 0,
      brandName: 0,
    },
    socialID: '',
    channel: 0,
    offset: 0,
    noOfRows: 10,
    timeOffset: 330,
    orderByColumn: 'FollowersCount',
    IsReplyOrRT: -1,
  };

  mapMarkerColor = {
    mapGreen: 'assets/images/common/map-green.svg',
    mapRed: 'assets/images/common/map-red.svg',
    mapBlue: 'assets/images/common/map-blue.svg',
    mapYellow: 'assets/images/common/map-yellow.svg',
  };
  showColorPicker: boolean;
  randomColors: string[];
  profileLoading: boolean;
  loaderTypeEnum = loaderTypeEnum;
  load: boolean = true;

  constructor(
    private _ticketService: TicketsService,
    private _ngZone: NgZone,
    private _chanedetector: ChangeDetectorRef,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public baseData: { postData: BaseMention }
  ) {
    if (baseData && baseData.postData) {
      this.baseMentionObj = baseData.postData;
      this.load = false;
    }
  }

  ngOnInit(): void {
    this.setTrendsProperties();
    this.randomColors = randomColors;
    this.profileLoading = true;
    // this.initData();
  }

  setTrendsProperties(): void {
    this.getTrendChart();
    this.getTrendEngagedUsers(this.trendUserFilter);
    this.getTrendsSentimentTagCloudData();

    if (this.baseMentionObj.channelGroup == ChannelGroup.Twitter) {
      this.getTrendRetweetLocation();
      this.getTrendReplyLocation();
      this.showReTweetMap = true;
      this.showReplyMap = true;
    } else {
      this.showReTweetMap = false;
      this.showReplyMap = false;
    }
  }

  loaderOutputEmitFlagResponse(flag) {
    if (flag != null) {
      this.profileLoading = flag;
    }
  }

  getTrendChart(): void {
    const obj = {
      brandInfo: {
        brandID: this.baseMentionObj.brandInfo.brandID,
        brandName: this.baseMentionObj.brandInfo.brandName,
      },
      socialID: this.baseMentionObj.socialID,
      channel: this.baseMentionObj.channelGroup,
      offset: 0,
      noOfRows: 0,
      timeOffset: 330,
      orderByColumn: '',
    };
    this.showUserTrendChartLoader = true;
    this._ticketService.GetRetweetReplyTrend(obj).subscribe((obj) => {
      if (obj.success) {
        const objData = obj.data;
        if (obj.data) {
          this.chartOptions = this.buildChart(
            objData.series,
            WidgetChartType.Line
          );
        } else {
          this.chartOptions = this.buildChart(
            trendData.series,
            WidgetChartType.Line
          );
          //this.trendsProperty.showUserTrendChartNoDataF = true;
        }
      } else {
        this.chartOptions = this.buildChart(
          trendData.series,
          WidgetChartType.Line
        );
        //this.trendsProperty.showUserTrendChartNoDataF = true;
      }
      this.showUserTrendChartLoader = false;
    });
  }

  getTrendEngagedUsers(trendFilter: any): void {
    trendFilter.brandInfo.brandID = this.baseMentionObj.brandInfo.brandID;
    trendFilter.brandInfo.brandName = this.baseMentionObj.brandInfo.brandName;
    trendFilter.socialID = this.baseMentionObj.socialID;
    trendFilter.channel = this.baseMentionObj.channelGroup;

    this.showEngagedProfilesLoader = true;
    this._ticketService.getTrendEngagedUsers(trendFilter).subscribe((obj) => {
      if (obj.success) {
        const objData = obj.data;
        if (obj.data && obj.data.mentionList.length > 0) {
          this.engagedUserList = obj.data.mentionList;
          this.totalEngagedUsers = obj.data.totalRecords;
        } else {
          this.showEngagedProfilesNoDataF = true;
        }
      } else {
        this.showEngagedProfilesNoDataF = true;
      }
      this.showEngagedProfilesLoader = false;
    });
  }

  getTrendRetweetLocation(): void {
    const obj = {
      brandInfo: {
        brandID: this.baseMentionObj.brandInfo.brandID,
        brandName: this.baseMentionObj.brandInfo.brandName,
      },
      socialID: this.baseMentionObj.socialID,
      channel: this.baseMentionObj.channelGroup,
      offset: 0,
      noOfRows: 10,
      timeOffset: 330,
      interval: 0,
      chartType: '',
      orderByColumn: '',
      IsReplyOrRT: -1,
    };
    this.showReTweetMapLoader = true;
    this._ticketService.getTrendRetweetLocation(obj).subscribe((obj) => {
      if (obj.success) {
        const objData = obj.data;
        if (obj.data && obj.data.length > 0) {
          this.retweetmapData = obj.data;
        } else {
          this.showReTweetMapNoDataF = true;
          this.retweetmapData = retweetMapData;
        }
      } else {
        this.showReTweetMapNoDataF = true;
        this.retweetmapData = retweetMapData;
      }
      this.showReTweetMapLoader = false;
    });
  }

  getTrendReplyLocation(): void {
    const obj = {
      brandInfo: {
        brandID: this.baseMentionObj.brandInfo.brandID,
        brandName: this.baseMentionObj.brandInfo.brandName,
      },
      socialID: this.baseMentionObj.socialID,
      channel: this.baseMentionObj.channelGroup,
      offset: 0,
      noOfRows: 0,
      timeOffset: 330,
      orderByColumn: '',
    };
    this.showReplyMapLoader = true;
    this._ticketService.getTrendReplyLocation(obj).subscribe((obj) => {
      if (obj.success) {
        const objData = obj.data;
        if (obj.data && obj.data.length > 0) {
          this.replymapData = obj.data;
        } else {
          // this.chartOptions = this.buildChart(trendData.series,WidgetChartType.Line);
          this.showReplyMapNoDataF = true;
          this.replymapData = replyMapData;
        }
      } else {
        // this.chartOptions = this.buildChart(trendData.series,WidgetChartType.Line);
        this.showReplyMapNoDataF = true;
        this.replymapData = replyMapData;
      }
      this.showReplyMapLoader = false;
    });
  }

  getTrendsSentimentTagCloudData(): void {
    const obj = {
      brandInfo: {
        brandID: this.baseMentionObj.brandInfo.brandID,
        brandName: this.baseMentionObj.brandInfo.brandName,
      },
      socialID: this.baseMentionObj.socialID,
      channel: this.baseMentionObj.channelGroup,
      offset: 0,
      noOfRows: 0,
      timeOffset: 330,
      interval: 0,
      chartType: '',
      orderByColumn: 'FollowersCount',
    };
    this.showReplyWordCloudLoader = true;
    this._ticketService.getTrendsSentimentTagCloudData(obj).subscribe((obj) => {
      if (obj.success) {
        const objData: TagCloudAndMentionData = obj.data;

        this.totalWC = +objData.mentionCount;
        this.positiveWC = +objData.positve;
        this.negativeWC = +objData.negative;
        this.neutralWC = +objData.neutral;

        if (obj.data && obj.data.lstdatatagcloud.length > 0) {
          // this.chartOptions = this.buildChart(objData.series,WidgetChartType.Line);
        } else {
          // this.chartOptions = this.buildChart(trendData.series,WidgetChartType.Line);
          this.showReplyWordCloudNoDataF = true;
          this.tagCloudData = wordCloudData.lstdatatagcloud;
          this.setCloudFunction();
        }
      } else {
        // this.chartOptions = this.buildChart(trendData.series,WidgetChartType.Line);
        this.showReplyWordCloudNoDataF = true;
        this.tagCloudData = wordCloudData.lstdatatagcloud;
        this.setCloudFunction();
      }
      this.showReplyWordCloudLoader = false;
    });
  }

  private buildChart(seriesData: Series[], chartType): void {
    let filteredSeries = seriesData;
    let filtereddata;

    const chartUtility = new ChartUtility(filteredSeries, chartType);
    const data = chartUtility.getJSChartDataStack();
    filtereddata = data;

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
      ChartType: chartType,
      isxAxisLabelHTML: false,
      ischannel: false,
      height: undefined,
      isNotTickInterval: '',
      Logarithmic: undefined,
      polar: undefined,
      showLegend: undefined,
      enableDatalabel: undefined,
      lableformatterfunction: undefined,
      uiJson: undefined,
      plotLines: undefined,
      isshowValueandPercentage: undefined,
      isNpsEmojiChart: undefined,
      datalabelsuffix: undefined,
      isBottomlegendForPieChart: undefined,
      isShowCenterCountInPie: undefined,
      showpositivevalues: undefined,
      isHideYAxis: undefined,
      xAxisLableFormatterfun: undefined,
      yAxisLableFormatterfun: undefined,
      tooltipformatter: undefined,
      datalableFormatter: undefined,
      minYaxisvalue: undefined,
    };
    return DashBoardChart.DrawChart(chartParams);
  }

  onRetweetMapLoad(mapInstance: google.maps.Map): void {
    this.retweetmap = mapInstance;
    const heatMapData: any = [];
    this.retweetMarker = [];
    let i = 0;
    for (const locationItem of this.retweetmapData) {
      const latitude = locationItem.latitude;
      const longitude = locationItem.longitude;
      const weight = locationItem.total;
      if (i == 0) {
        this.retweetlat = latitude;
        this.retweetlon = longitude;
        i++;
      }
      this.retweetMarker.push({
        lat: latitude,
        lng: longitude,
        icon: this.mapMarkerColor.mapBlue,
      });
      // const object = {
      //   location: new google.maps.LatLng(latitude, longitude),
      //   weight,
      // };
      // heatMapData.push(object);
    }
    // this.retweetheatmap = new google.maps.visualization.HeatmapLayer({
    //   map: this.retweetmap,
    //   data: heatMapData,
    // });
  }

  onReplyMapLoad(mapInstance: google.maps.Map): void {
    this.replymap = mapInstance;
    let i = 0;
    this.replyMarker = [];
    const heatMapData: any = [];
    for (const locationItem of this.replymapData) {
      const latitude = locationItem.latitude;
      const longitude = locationItem.longitude;
      const weight = locationItem.total;
      let iconUrl = ''; //[iconUrl]="data.iconUrl"
      if (locationItem.sentiment == 0) {
        iconUrl = this.mapMarkerColor.mapYellow;
      } else if (locationItem.sentiment == 1) {
        iconUrl = this.mapMarkerColor.mapGreen;
      } else if (locationItem.sentiment == 2) {
        iconUrl = this.mapMarkerColor.mapRed;
      } else {
        iconUrl = this.mapMarkerColor.mapYellow;
      }
      if (i == 0) {
        this.replylat = latitude;
        this.replylon = longitude;
        i++;
      }
      this.replyMarker.push({ lat: latitude, lng: longitude, icon: iconUrl });
      // const object = {
      //   location: new google.maps.LatLng(latitude, longitude),
      //   weight,
      // };
      // heatMapData.push(object);
    }
    // this.replyheatmap = new google.maps.visualization.HeatmapLayer({
    //   map: this.replymap,
    //   data: heatMapData,
    // });
  }

  scrollToclass(classname): void {
    if (classname === 'user-mention') {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.usermentionscroll.forEach((elementItem) => {
            if (elementItem.nativeElement.classList.contains('user-mention')) {
              elementItem.nativeElement.scrollIntoView();
            }
          });
          console.log('setTimeout called');
        }, 0);
      });
      this.usermentionLi = true;
      this.trendchartLi = false;
      this.engageduserLi = false;
      this.replywordcloudLi = false;
      this.replymapLi = false;
      this.retweetmapLi = false;
    } else if (classname === 'trend-chart') {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.trendchartscroll.forEach((elementItem) => {
            if (elementItem.nativeElement.classList.contains('trend-chart')) {
              elementItem.nativeElement.scrollIntoView();
            }
          });
          console.log('setTimeout called');
        }, 0);
      });
      this.usermentionLi = false;
      this.trendchartLi = true;
      this.engageduserLi = false;
      this.replywordcloudLi = false;
      this.replymapLi = false;
      this.retweetmapLi = false;
    } else if (classname === 'reply-map') {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.replymapscroll.forEach((elementItem) => {
            if (elementItem.nativeElement.classList.contains('reply-map')) {
              elementItem.nativeElement.scrollIntoView();
            }
          });
          console.log('setTimeout called');
        }, 0);
      });
      this.usermentionLi = false;
      this.trendchartLi = false;
      this.engageduserLi = false;
      this.replywordcloudLi = false;
      this.replymapLi = true;
      this.retweetmapLi = false;
    } else if (classname === 'retweet-map') {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.replymapscroll.forEach((elementItem) => {
            if (elementItem.nativeElement.classList.contains('reply-map')) {
              elementItem.nativeElement.scrollIntoView();
            }
          });
        }, 0);
      });
      this.usermentionLi = false;
      this.trendchartLi = false;
      this.engageduserLi = false;
      this.replywordcloudLi = false;
      this.replymapLi = false;
      this.retweetmapLi = true;
    } else if (classname === 'engaged-user-demo') {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.engageduserscroll.forEach((elementItem) => {
            if (
              elementItem.nativeElement.classList.contains('engaged-user-demo')
            ) {
              elementItem.nativeElement.scrollIntoView();
            }
          });
          console.log('setTimeout called');
        }, 0);
      });
      this.usermentionLi = false;
      this.trendchartLi = false;
      this.engageduserLi = true;
      this.replywordcloudLi = false;
      this.replymapLi = false;
      this.retweetmapLi = false;
    } else if (classname === 'reply-wordcloud') {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.replywordcloudscroll.forEach((elementItem) => {
            if (
              elementItem.nativeElement.classList.contains('reply-wordcloud')
            ) {
              elementItem.nativeElement.scrollIntoView();
            }
          });
          console.log('setTimeout called');
        }, 0);
      });

      this.usermentionLi = false;
      this.trendchartLi = false;
      this.engageduserLi = false;
      this.replywordcloudLi = true;
      this.replymapLi = false;
      this.retweetmapLi = false;
    }
  }

  applyOptions() {
    // this.animations = this.options.animations;
    // this.autoFill = this.options.autoFill;
    // if (this.options.rotate) {
    //   this.rotate = () => {
    //     return this.rotateScale(Math.random());
    //   }
    // } else {
    //   this.rotate = 0;
    // }

    // this.fillFx = scaleOrdinal(this.schemas[this.options.fillScheme].schema);

    this.fillMapper = (datum: any, index: number) => {
      console.log(datum);
      if (datum.sentiment === 0) {
        return '#DEAA0C';
      } else if (datum.sentiment === 1) {
        return '#1C9F00';
      } else if (datum.sentiment === 2) {
        return '#DC1E1E';
      } else if (datum.sentiment === 3) {
        return '#DEAA0C';
      } else {
        return '#DEAA0C';
      }
    };
    this.initData();
  }

  setCloudFunction(): void {
    this.initData();
    this.applyOptions();
  }

  initData() {
    this.wclouddata = this.tagCloudData.map((d) => {
      return {
        text: d.keyword,
        value: 10 + Math.random() * 90,
        fill: '0',
        sentiment: d.sentiment,
      };
    });
  }

  chnageColorOfWCLoud(event) {
    if (event.value == 0) {
      this.applyOptions();
      this.showColorPicker = false;
    } else if (event.value == 1) {
      this.fillMapper = (datum: any, index: number) => {
        return this.randomColors[index];
      };
      this.initData();
      this.showColorPicker = false;
    } else {
      this.showColorPicker = true;
    }
  }

  fontSizeMapper(word: string, idx: number) {
    console.log(word);
  }

  changeCustomColorEvent(event) {
    this.fillMapper = (datum: any, index: number) => {
      return event.color.hex;
    };
    this.initData();
  }

  onWordClick(event: any) {
    console.log(event);
  }

  OnPageChange(event: PageEvent): void {
    // console.log(event);
    this.trendUserFilter.offset = event.pageIndex * event.pageSize;
    if (event.pageIndex !== event.previousPageIndex) {
      this.getTrendEngagedUsers(this.trendUserFilter);
    }
  }

  filterApply(value): void {
    this.trendUserFilter.IsReplyOrRT = Number(value);
    this.getTrendEngagedUsers(this.trendUserFilter);
  }

  orderByApply(value): void {
    if (+value === 0) {
      this.trendUserFilter.orderByColumn = '(NoofReTweeted + NumLikes)';
    } else {
      this.trendUserFilter.orderByColumn = 'FollowersCount';
    }

    this.getTrendEngagedUsers(this.trendUserFilter);
  }

  redrawReplyMap(color): void {
    if (+color === 1) {
      // change all colors based on sentiment
    } else if (+color === 0) {
      for (const locitem in this.replyMarker) {
        // change all colors to blue
      }
    }
  }
}
