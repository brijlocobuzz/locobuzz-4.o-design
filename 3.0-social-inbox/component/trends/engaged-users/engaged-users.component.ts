import { Component, Input, OnInit } from '@angular/core';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { Sentiment } from 'app/core/enums/Sentiment';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { AuthUser } from 'app/core/interfaces/User';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { AccountService } from 'app/core/services/account.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { BrandSettingService } from 'app/social-inbox/services/brand-setting.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { environment } from 'environments/environment';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-engaged-users',
    templateUrl: './engaged-users.component.html',
    styleUrls: ['./engaged-users.component.scss'],
    standalone: false
})
export class EngagedUsersComponent implements OnInit {
  @Input() postData: BaseMention;

  ticketHistoryData: AllBrandsTicketsDTO;
  ticketClient: TicketClient;
  currentUser: AuthUser;
  brandList: BrandList[];
  currentBrand: BrandList;
  MediaUrl: string;
  sentiment: Sentiment;
  followersCount: string;
  followingCount: string;
  tweetCount: string;
  isReplied: boolean;
  isRetweeted: boolean;

  constructor(
    private _footericonService: FootericonsService,
    private _ticketService: TicketsService,
    private _accountService: AccountService,
    private _filterService: FilterService,
    private _brandsettingService: BrandSettingService
  ) {}

  ngOnInit(): void {
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    this.mapEngagedUser();
  }

  public get getSentiment(): typeof Sentiment {
    return Sentiment;
  }

  public get getChannel(): typeof ChannelGroup {
    return ChannelGroup;
  }

  mapEngagedUser(): void {
    this.MediaUrl = environment.MediaUrl;
    this.sentiment = this.postData.sentiment ? this.postData.sentiment : 0;
    this.ticketClient = this._ticketService.mapPostByChannel(this.postData);
    this.followersCount = this._footericonService.kFormatter(
      +this.ticketClient.Userinfo.followers
    );
    this.followingCount = this._footericonService.kFormatter(
      +this.ticketClient.Userinfo.following
    );
    this.tweetCount = this._footericonService.kFormatter(
      +this.postData.author.tweetCount
    );
    this.isReplied = this.postData.inReplyToStatusId > 0 ? true : false;
    this.isRetweeted =
      this.postData.retweetedStatusID !== null &&
      this.postData.retweetedStatusID !== undefined
        ? true
        : false;
    this.ticketHistoryData =
      this._footericonService.setConditionsFromCommunicationLog(
        this.currentUser,
        this.ticketHistoryData,
        this.postData
      );
  }

  private mapwithRespectiveObject(mention: BaseMention): void {
    this.brandList = this._filterService.fetchedBrandData;
    this.ticketHistoryData =
      this._footericonService.SetDefaultTicketHistoryData(
        this.ticketHistoryData,
        this.currentUser
      );
    if (this.brandList) {
      const currentBrandObj = this.brandList.filter((obj) => {
        return +obj.brandID === +mention.brandInfo.brandID;
      });
      this.currentBrand =
        currentBrandObj[0] !== null ? currentBrandObj[0] : undefined;

      if (this.currentBrand) {
        this.ticketHistoryData = this._brandsettingService.GetBrandSettings(
          this.currentBrand,
          this.ticketHistoryData
        );
      }

      this.ticketHistoryData = this._footericonService.SetUserRole(
        PostsType.TicketHistory,
        this.ticketHistoryData,
        this.currentUser,
        mention
      );

      this.ticketHistoryData = this._footericonService.SetFooterIcons(
        this.ticketHistoryData,
        this.currentUser,
        mention,
        PostsType.TicketHistory,
        this.brandList.length,
        false,
        this.currentUser
      );

      this.ticketHistoryData =
        this._footericonService.SetMakerCheckerandSSREIcons(
          this.ticketHistoryData,
          this.currentUser,
          mention,
          this.MediaUrl
        );

      this.ticketHistoryData = this._footericonService.SetMentionID(
        PostsType.TicketHistory,
        this.ticketHistoryData,
        mention,
        this.currentBrand
      );

      this.ticketHistoryData = this._footericonService.SetDeleteMention(
        this.currentUser,
        PostsType.TicketHistory,
        this.ticketHistoryData,
        mention
      );

      if (+mention.inReplyToUserID === -3) {
        mention.ticketInfo.replyUserName = 'SSRE';
      }
    }

    this.ticketHistoryData = this._footericonService.SetTicketOrMentionIcon(
      this.currentUser,
      PostsType.TicketHistory,
      this.ticketHistoryData,
      mention
    );

    this.ticketHistoryData = this._footericonService.SetPriorityIcon(
      PostsType.TicketHistory,
      this.ticketHistoryData,
      mention
    );

    this.ticketHistoryData.channelTypeIcon =
      this._footericonService.getChannelCustomeIcon(mention);

    // this.ticketHistoryData = this._footericonService.SetBulkCheckbox(
    //   this.currentUser,
    //   this.ticketHistoryData,
    //   mention
    // );

    this.ticketHistoryData = this._footericonService.SetTicketStatusandAssignTo(
      this.currentBrand,
      this.currentUser,
      this.ticketHistoryData,
      mention
    );

    this.ticketHistoryData = this._footericonService.SetChannelWiseProperty(
      this.ticketHistoryData,
      mention
    );

    this.ticketHistoryData = this._footericonService.SetTicketDescription(
      this.currentUser,
      this.ticketHistoryData,
      mention,
      PostsType.TicketHistory
    );

    const postCRMdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === this.postData.brandInfo.brandID
    );
    if (postCRMdata.crmActive) {
      this.ticketHistoryData = this._footericonService.SetCRMButton(
        postCRMdata,
        this.currentUser,
        this.ticketHistoryData,
        mention,
        PostsType.Tickets
      );
    }

    // Media Content for twitter Channels

    this.ticketHistoryData = this._footericonService.SetMedia(
      this.ticketHistoryData,
      mention,
      this.MediaUrl
    );

    this.ticketHistoryData = this._footericonService.SetNote(
      this.currentUser,
      this.ticketHistoryData,
      mention,
      this.MediaUrl
    );

    this.ticketHistoryData.isReadBy = mention.isRead ? mention.isRead : false;
  }
}
