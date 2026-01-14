import { I } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, effect, EffectRef, HostListener, Input, OnDestroy, OnInit, signal, untracked } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { notificationType } from 'app/core/enums/notificationType';
import { Priority } from 'app/core/enums/Priority';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { AuthUser } from 'app/core/interfaces/User';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import {
  AlertDialogModel,
  AlertPopupComponent,
} from 'app/shared/components/alert-popup/alert-popup.component';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import moment from 'moment';
import { debounceTime, distinctUntilChanged, filter, take } from 'rxjs/operators';
import { LocobuzzmentionService } from './../../../core/services/locobuzzmention.service';
// import decode from 'decode-html'
import { LocobuzzUtils } from '@locobuzz/utils';
import { SubSink } from 'subsink';
import { environment } from 'environments/environment';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { Sentiment } from 'app/social-schedule/component/post-overview/post-overview.component';
import { NavigationService } from 'app/core/services/navigation.service';
@Component({
    selector: 'app-post-shortened',
    templateUrl: './post-shortened.component.html',
    styleUrls: ['./post-shortened.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class PostShortenedComponent implements OnInit, OnDestroy {
  @Input() postShortenedData: BaseMention;
  pageType: PostsType = 3;
  postShortenedDataAfterAssign: BaseMention;
  currentUser: AuthUser;
  data: TicketClient;
  ticketHistoryData: AllBrandsTicketsDTO;
  currentBrand: BrandList;
  brandList: BrandList[];
  channelGroupEnum = ChannelGroup;
  priorityClass: any;
  ChannelType = ChannelType;
  statusClass: any;
  actionableLoader: boolean=false;
  makeActionable:boolean = true
  selectedTicketView: number;
  subs = new SubSink();
  userProfileImg: string = '';
  initials: string = '';
  MarkActionableAPI:any;
  lockUnlockTicket:any;
  effectTicketStatusChangeObsShortendSignal: EffectRef;
  clearSignal=signal<boolean>(true);
  ivrBrandData: any;
  defaultLayout: boolean = false;
  mentionBackGround: string = 'White';
  colour: string = '';
  PostsType = PostsType;
  public get getSentiment(): typeof Sentiment {
    return Sentiment;
  }
  sentimentBackgroundColorClass = 'sentiment-background-neutral';
  post: TicketClient;
  ticektSentiment = this.getSentiment.Neutral;
  aiUpperCategoryListWithIcon = [
    { name: 'query', icon: 'help', sentimentColor: 'sentiment-background-neutral' },
    { name: 'appreciation', icon: 'thumb_up', sentimentColor: 'sentiment-background-positive' },
    { name: 'complaint', icon: 'feedback', sentimentColor: 'sentiment-background-negative' },
    { name: 'request', icon: 'post_add', sentimentColor: 'sentiment-background-neutral' },
    { name: 'opportunity', icon: 'rocket_launch', sentimentColor: 'sentiment-background-positive' },
    { name: 'brand promotion', icon: 'campaign', sentimentColor: 'sentiment-background-positive' },
    { name: 'Moderation', icon: 'admin_panel_settings', sentimentColor: 'sentiment-background-neutral' },
    { name: 'feedback/review', icon: 'lightbulb', sentimentColor: 'sentiment-background-neutral' }
  ];
  otherAspectsDetailsList = [];
  aiAspectsDetailsList = [];
  aspectsDetailsList = {};
  public aspectSentiment = Sentiment;
  characterLimit: number = 35;
  aiabsaEnabled: boolean = false;
  tooltipPositionAbove = true;

  constructor(
    private _navigationService: NavigationService,
    public postDetailService: PostDetailService,
    private _filterService: FilterService,
    private _locobuzzmentionService: LocobuzzmentionService,
    private _ticketsService: TicketsService,
    private _footericonService: FootericonsService,
    private _accountService: AccountService,
    private _dialog: MatDialog,
    private _mapLocobuzzService: MaplocobuzzentitiesService,
    private _replyService: ReplyService,
    private _snackBar: MatSnackBar,
    private ticketService: TicketsService,
    private cdk:ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    private translate: TranslateService // <-- add this
  ) {
    let onLoadTicketStatusChange = true;

    this.effectTicketStatusChangeObsShortendSignal = effect(() => {
      const value = this.clearSignal() ? this.ticketService.ticketStatusChangeObsSignal() : untracked(() => this.ticketService.ticketStatusChangeObsSignal());
      if (!onLoadTicketStatusChange && value && this.clearSignal()) {
            this.ticketStatusChangeObsSignalChanges(value)
          } else {
            onLoadTicketStatusChange = false;
          }
        }, { allowSignalWrites: true });
  }
  // @HostListener('click', ['$event'])
  // onClick(event): void {
  //   alert('ME I')
  //   // console.log('click event', event);
  //   // console.log(this.postShortenedData.ticketInfo.ticketID);
  //   if (this.postShortenedData.ticketInfo.ticketID > 0) {
  //     this.closePreviousTicketCase(this.postDetailService.postObj);
  //     this.postDetailService.postObj = this.postShortenedData;
  //     this._ticketsService.bulkMentionChecked = [];
  //     this._ticketsService.selectedPostList = [];
  //     this._ticketsService.postSelectTrigger.next(
  //       this._ticketsService.selectedPostList.length
  //     );
  //     this.postDetailService.currentPostObject.next(
  //       this.postShortenedData.ticketInfo.ticketID
  //     );
  //     this.postDetailService.makeActionableFlag = false;
  //   }
  // }

  copied(name): void {
    this._snackBar.openFromComponent(CustomSnackbarComponent, {
      duration: 5000,
      data: {
        type: notificationType.Success,
        message: this.translate.instant('copied-successfully', { name }), // Use translation
      },
    });
  }

  makeactionable(): void {
    const dialogData = new AlertDialogModel(
      this.translate.instant('Do-you-want-to-make-it-Actionable'),
      this.translate.instant('After-clicking-on-yes-you-can-perform-the-action'),
      'Yes',
      'No'
    );
    const dialogRef = this._dialog.open(AlertPopupComponent, {
      disableClose: true,
      autoFocus: false,
      data: dialogData,
    });
    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult) {
        this.actionableLoader=true;
        this.cdk.detectChanges();
        const source = this._mapLocobuzzService.mapMention(
          this.postShortenedData
        );
        const sourceobj = {
          Source: source,
          NonActionableAuthorName: 'Anonymous',
          actionTaken: 0,
        };
        this.MarkActionableAPI = this._replyService.MarkActionable(sourceobj).subscribe((data) => {
          this.postShortenedData.isActionable = true;
          this.postShortenedData.ticketInfo.ticketID = data.ticketID;
          this.postShortenedData.ticketID = data.ticketID;
          this.mapShortData();
          this._ticketsService.bulkMentionChecked = [];
          this._ticketsService.selectedPostList = [];
          this._ticketsService.postSelectTriggerSignal.set(
            this._ticketsService.selectedPostList.length
          );
          this.postDetailService.makeActionableFlag = true;
          /* this.postDetailService.currentPostObject.next(
            this.postShortenedData.ticketInfo.ticketID
          ); */
          this.postDetailService.currentPostObjectSignal.set(
            this.postShortenedData.ticketInfo.ticketID
          );
          this.actionableLoader = false;
          this.cdk.detectChanges();
        });
      }
    });
  }

  ngOnInit(): void {
    this.post = this.ticketService.mapPostByChannel(this.postShortenedData, this._navigationService?.currentSelectedTab?.Filters?.isModifiedDate);
    this.sentimentMapping();

    const message: any[] = [this.ChannelType.DirectMessages, this.ChannelType.FBMessages, this.ChannelType.LinkedinMessage, this.ChannelType.InstagramMessages, this.ChannelType.TelegramMessages, this.ChannelType.TelegramGroupMessages, this.ChannelType.WhatsApp, this.ChannelType.Email]
    const comment: any[] = [this.ChannelType.RedditComment, this.ChannelType.FBComments, this.ChannelType.FBMediaComments, this.ChannelType.TeamBHPComments, this.ChannelType.TeamBHPOtherPostsComments, this.ChannelType.YouTubeComments, this.ChannelType.InstagramComments, this.ChannelType.GoogleComments, this.ChannelType.ReviewWebsiteComments, this.ChannelType.ECommerceComments, this.ChannelType.MyGovComments, this.ChannelType.LinkedInComments, this.ChannelType.LinkedInMediaComments, this.ChannelType.AutomotiveIndiaOtherPostsComments, this.ChannelType.TikTokComments, this.ChannelType.SitejabberComments, this.ChannelType.FbGroupComments, this.ChannelType.QuoraComment, this.ChannelType.PantipComments, ...((this.postShortenedData?.parentPostSocialID != '0' && this.postShortenedData?.parentPostSocialID != null && this.postShortenedData?.channelGroup == ChannelGroup.Twitter) ? [this.postShortenedData?.parentPostSocialID] : [])]
    this.colour = localStorage.getItem('theme');
    this.subs.add(
      this._sidebarService.changesColor.subscribe((res) => {
        if (res.length > 0) {
          this.colour = res;
          if (this.pageType == this.PostsType.Tickets || this.pageType == this.PostsType.TicketHistory || this.pageType == this.PostsType.Mentions) {
            if (comment.includes(this.postShortenedData?.channelType) || comment.includes(this.postShortenedData?.parentPostSocialID)) {
              if (this.colour) {
                this.mentionBackGround = this.colour == 'light' ? '#E1F2FF' : '#29538D';
              }
            }
            else if (message.includes(this.postShortenedData?.channelType)) {
              if (this.colour) {
                this.mentionBackGround = this.colour == 'light' ? '#F6F0FF' : '#5B288D';
              }
            }
            else if (![...comment, ...message].includes(this.postShortenedData?.channelType) && !this.postShortenedData?.isBrandPost) {
              if (this.colour) {
                this.mentionBackGround = this.colour == 'light' ? '#FFF7E3' : '#7F4919';
              }
            }
          }
          else {
            this.mentionBackGround = 'White';
          }
        }
      })
    );
    if (this.pageType == this.PostsType.Tickets || this.pageType == this.PostsType.TicketHistory || this.pageType == this.PostsType.Mentions) {
      if (comment.includes(this.postShortenedData?.channelType) || comment.includes(this.postShortenedData?.parentPostSocialID)) {
        if (this.colour) {
          this.mentionBackGround = this.colour == 'light' ? '#E1F2FF' : '#29538D';
        }
      }
      else if (message.includes(this.postShortenedData?.channelType)) {
        if (this.colour) {
          this.mentionBackGround = this.colour == 'light' ? '#F6F0FF' : '#5B288D';
        }
      }
      else if (![...comment, ...message].includes(this.postShortenedData?.channelType) && !this.postShortenedData?.isBrandPost) {
        if (this.colour) {
          this.mentionBackGround = this.colour == 'light' ? '#FFF7E3' : '#7F4919';
        }
      }
    }
    else {
      this.mentionBackGround = 'White';
    }
        this.ivrBrandData = this._filterService.voipBrandIVRData;
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));

    this.mapShortData();
    this.subs.add(
    this._ticketsService.changeTicketPriorityObs
      .pipe(
        filter(
          (res) => this.postShortenedData.ticketInfo.ticketID === res?.ticketID
        )
      )
      .subscribe((data) => {
        if (data) {
          if (this.postShortenedData.ticketInfo.ticketID == data.ticketID) {
            this.data.ticketPriority = Priority[data.ticketPriority];
            const result = this._footericonService.togglePostfootClasses(
              this.postShortenedData,
              this.data.ticketPriority,
              this.data
            );
            this.priorityClass = result.priorityClass;
            this.statusClass = result.statusClass;
            this.cdk.detectChanges();
          }
        }
      })
    );

    // this._ticketsService.ticketStatusChangeObs
    //   .pipe(filter((res) => this.postShortenedData.tagID === res.tagID))
    //   .subscribe((res) => {
    //     if (res && this.postShortenedData.tagID === res.tagID) {
    //       if (
    //         res.status == TicketStatus.OnHoldCSD ||
    //         res.status == TicketStatus.OnHoldBrand ||
    //         res.status == TicketStatus.OnHoldAgent
    //       ) {
    //         this.data.ticketStatus = 'Kept On Hold';
    //       } else {
    //         this.data.ticketStatus = TicketStatus[res.status];
    //         const result = this._footericonService.togglePostfootClasses(
    //           this.postShortenedData,
    //           this.data.ticketPriority,
    //           this.data
    //         );
    //         this.statusClass = result.statusClass;
    //       }
    //       this.postShortenedData.ticketInfo.status=res.status;
    //       this.cdk.detectChanges();
    //     }
    //   });

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      this.makeActionable = false
    }

    this.selectedTicketView = localStorage.getItem('selctedView') ? parseInt(JSON.parse(localStorage.getItem('selctedView'))) : 1;

      this.subs.add(
        this._ticketsService.postDetailsAfterAssignTo.subscribe((res) => {
          if (res) {
          this.openDetailViewWithSub(res);
        }
      })
    )
    this.subs.add(
      this.postDetailService.sortHandTicketTimeUpdate.subscribe((status) => {
        if (status) {
          this.data.ticketTime = this._ticketsService.calculateTicketTimes(this.postShortenedData);
          this.cdk.detectChanges();
        }
      })
    )
    this.userProfileImg = this.data?.Userinfo?.image?.includes('assets/images/agentimages/sample-image.svg') ? 'initials' : this.data?.Userinfo?.image;
    // this.getInitials();
   this.initials = this.ticketService.getInitials(this.data?.Userinfo?.name)
    if (this.postShortenedData?.channelGroup == ChannelGroup.Voice) {
      this.userProfileImg = 'assets/images/agentimages/sample-image.svg'
    }
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this.cdk.detectChanges();
        }
      })
    )

   if(!this.defaultLayout){
     if (this.postShortenedData?.aspectGroupJson && this.postShortenedData?.aspectGroupJson.length) {
       this.aiAspectsDetailsList = [];
       this.otherAspectsDetailsList = [];
       this.postShortenedData?.aspectGroupJson.forEach(x => {
         if (x?.scope == 1) {
           if (this.postShortenedData?.aspectGroupJson.length == 1 && x?.aspectGroupName?.toLowerCase() == 'other') {
             if (x?.aspectsWithOpinion && x?.aspectsWithOpinion.length) {
               x?.aspectsWithOpinion.forEach((aspect) => {
                 x.feedbackStatus = 0;
                 aspect.entity = x?.entity;
                 aspect.entityType = x?.entityType;
                 if (aspect.sentiment == 0) {
                   if (this.postShortenedData && this.postShortenedData?.aspectNeutralFeedback && this.postShortenedData?.aspectNeutralFeedback.length) {
                     x.feedbackStatus = this.postShortenedData?.aspectNeutralFeedback[0].feedbackType;
                   }
                 } else if (aspect.sentiment == 1) {
                   if (this.postShortenedData && this.postShortenedData?.aspectPostiveFeedback && this.postShortenedData?.aspectPostiveFeedback.length) {
                     x.feedbackStatus = this.postShortenedData?.aspectPostiveFeedback[0].feedbackType;
                   }
                 } else if (aspect.sentiment == 2) {
                   if (this.postShortenedData && this.postShortenedData?.aspectNegativeFeedback && this.postShortenedData?.aspectNegativeFeedback.length) {
                     x.feedbackStatus = this.postShortenedData?.aspectNegativeFeedback[0].feedbackType;
                   }
                 }
                 if (!this.otherAspectsDetailsList.includes(aspect)) {
                   this.otherAspectsDetailsList.push(aspect);
                 }
               });
             }
           } else if (x?.aspectGroupName?.toLowerCase() != 'other') {
             // const emojiMatch = x?.aspectGroupName.match(/^\p{Emoji_Presentation}|\p{Emoji}/u);
             // const emoji = emojiMatch && emojiMatch.length ? emojiMatch[0] : '';
             if (x?.icon) {
               x.aspectGroupIcon = x?.icon;
             }
             // if (emoji){
             //   x.aspectGroupName = x?.aspectGroupName.replace(emoji, '').trim();
             //   x.aspectGroupIcon = emoji;
             // }
             const firstAspectSentiment = x?.aspectsWithOpinion?.length ? x?.aspectsWithOpinion.reduce((prev, current) => {
               return (prev.sentiment > current.sentiment) ? prev : current;
             }).sentiment : 0;
             x.feedbackStatus = 0;
             x.aspectSentiment = firstAspectSentiment;
             if (firstAspectSentiment == 0) {
               if (this.postShortenedData && this.postShortenedData?.aspectNeutralFeedback && this.postShortenedData?.aspectNeutralFeedback.length) {
                 x.feedbackStatus = this.postShortenedData?.aspectNeutralFeedback[0].feedbackType;
               }
             } else if (firstAspectSentiment == 1) {
               if (this.postShortenedData && this.postShortenedData?.aspectPostiveFeedback && this.postShortenedData?.aspectPostiveFeedback.length) {
                 x.feedbackStatus = this.postShortenedData?.aspectPostiveFeedback[0].feedbackType;
               }
             } else if (firstAspectSentiment == 2) {
               if (this.postShortenedData && this.postShortenedData?.aspectNegativeFeedback && this.postShortenedData?.aspectNegativeFeedback.length) {
                 x.feedbackStatus = this.postShortenedData?.aspectNegativeFeedback[0].feedbackType;
               }
             }
             this.aiAspectsDetailsList.push(x);
           }
         }
       });
     }
     if (this.postShortenedData?.aspectsDetailsList) {
       this.aspectsDetailsList = {};
       let neutralData = [];
       let negativeData = [];
       let positiveData = [];
       this.postShortenedData?.aspectsDetailsList.forEach(x => {
         x.feedbackStatus = 0;
         if (x.sentiment == 0) {
           if (this.postShortenedData && this.postShortenedData?.aspectNeutralFeedback && this.postShortenedData?.aspectNeutralFeedback.length) {
             x.feedbackStatus = this.postShortenedData?.aspectNeutralFeedback[0].feedbackType;
           }
           neutralData.push(x);
         } else if (x.sentiment == 1) {
           if (this.postShortenedData && this.postShortenedData?.aspectPostiveFeedback && this.postShortenedData?.aspectPostiveFeedback.length) {
             x.feedbackStatus = this.postShortenedData?.aspectPostiveFeedback[0].feedbackType;
           }
           positiveData.push(x);
         } else if (x.sentiment == 2) {
           if (this.postShortenedData && this.postShortenedData?.aspectNegativeFeedback && this.postShortenedData?.aspectNegativeFeedback.length) {
             x.feedbackStatus = this.postShortenedData?.aspectNegativeFeedback[0].feedbackType;
           }
           negativeData.push(x);
         }
       });
       this.aspectsDetailsList = {
         neutralAspect: neutralData,
         positiveAspect: positiveData,
         negativeAspect: negativeData,
       };
     }
     this.cdk.detectChanges();
   }
  }

  sentimentMapping() {
    if (this.post?.mentioncategories && this?.post?.mentioncategories.length) {
      const topSentiment = [...this.post.mentioncategories]
        .sort((a, b) => b.sentiment - a.sentiment)[0]?.sentiment;
      this.ticektSentiment = topSentiment;
    } else if (this.post?.ticketcategories && this.post?.ticketcategories.length) {
      const topSentiment = [...this.post.ticketcategories]
        .sort((a, b) => b.sentiment - a.sentiment)[0]?.sentiment;
      this.ticektSentiment = topSentiment;
    }
  }

  getCategorysSentiment(category: string, aI_Category: boolean): string {
    if (category) {
      const categorySentiment = this.aiUpperCategoryListWithIcon.find(res => res?.name.toLowerCase() == category.toLowerCase());
      if (categorySentiment && aI_Category) {
        return categorySentiment?.sentimentColor;
      } else {
        return 'manual-category-sentiment-color';
      }
    } else {
      return 'manual-category-sentiment-color';
    }
  }

  // getInitials() {
  //   const name = this.data?.Userinfo?.name?.trim();
  //   const userName = name?.replace(/[^a-zA-Z ]/g, '')?.replace(/\s+/g, ' ');
  //   const parts = userName?.split(' ');
  //   if (parts?.length > 1) {
  //     this.initials = `${parts[0][0]?.toUpperCase()}${parts[parts?.length - 1][0]?.toUpperCase()}`;
  //   } else if (parts?.length) {
  //     this.initials = parts[0]?.slice(0, 2)?.toUpperCase();
  //   }
  // }
  
  ticketStatusChangeObsSignalChanges(res){
    if (res && this.postShortenedData?.tagID === res?.tagID) {
      if (
        res.status == TicketStatus.OnHoldCSD ||
        res.status == TicketStatus.OnHoldBrand ||
        res.status == TicketStatus.OnHoldAgent
      ) {
        this.data.ticketStatus = 'Kept On Hold';
      } else {
        this.data.ticketStatus = TicketStatus[res.status];
        const result = this._footericonService.togglePostfootClasses(
          this.postShortenedData,
          this.data.ticketPriority,
          this.data
        );
        this.statusClass = result.statusClass;
      }
      this.postShortenedData.ticketInfo.status = res.status;
      this.cdk.detectChanges();
    }
  }

  getBrandLogo(brandID): string {
    const brandimage = this._filterService.fetchedBrandData.find(
      (obj) => Number(obj.brandID) === Number(brandID)
    );
    if (brandimage.rImageURL) {
      return brandimage.rImageURL;
    } else {
      return 'assets/social-mention/post/default_brand.svg';
    }
  }

  private MapChannelType(obj: BaseMention): string {
    switch (obj.channelType) {
      case ChannelType.PublicTweets:
        return 'Public Tweets';
      case ChannelType.FBPageUser:
        return 'User Post';
      case ChannelType.FBPublic:
        return 'Public Post';
      case ChannelType.Twitterbrandmention:
        return 'Brand Mention';
      case ChannelType.FBComments:
        return 'Comments';
      case ChannelType.BrandTweets:
        return 'Brand Tweets';
      case ChannelType.DirectMessages:
        return 'Direct Messages';
      case ChannelType.Blogs:
        return 'Blogs';
      case ChannelType.DiscussionForums:
        return 'Discussion Forums';
      case ChannelType.News:
        return 'News';
      case ChannelType.TripAdvisor:
        return 'TripAdvisor';
      case ChannelType.FbMediaPosts:
        return 'Media Posts';
      case ChannelType.FBMediaComments:
        return 'Media Comments';
      case ChannelType.TeamBHPPosts:
        return 'Posts';
      case ChannelType.TeamBHPComments:
        return 'Comments';
      case ChannelType.TeamBHPOtherPostsComments:
        return 'Other Posts Comments';
      case ChannelType.ComplaintWebsites:
        return 'Complaint Websites';
      case ChannelType.YouTubePosts:
        return 'Posts';
      case ChannelType.YouTubeComments:
        return 'Comments';
      case ChannelType.InstagramPagePosts:
        return 'Page Posts';
      case ChannelType.InstagramUserPosts:
        return 'User Posts';
      case ChannelType.InstagramComments:
        return 'Comments';
      case ChannelType.InstagramPublicPosts:
        return 'Public Posts';
      case ChannelType.GooglePagePosts:
        return 'Page Posts';
      case ChannelType.GoogleUserPosts:
        return 'User Posts';
      case ChannelType.GooglePublicPosts:
        return 'Public Posts';
      case ChannelType.GoogleComments:
        return 'Comments';
      case ChannelType.CustomerCare:
        return 'CustomerCare';
      case ChannelType.Expedia:
        return 'Expedia';
      case ChannelType.Booking:
        return 'Booking';
      case ChannelType.ReviewWebsiteComments:
        return 'Posts';
      case ChannelType.ReviewWebsitePosts:
        return 'Comments';
      case ChannelType.ECommercePosts:
        return 'Posts';
      case ChannelType.ECommerceComments:
        return 'Comments';
      case ChannelType.HolidayIQReview:
        return 'HolidayIQ Review';
      case ChannelType.HolidayIQReview:
        return 'HolidayIQ Review';
      case ChannelType.ZomatoComment:
        return 'Comments';
      case ChannelType.ZomatoPost:
        return 'Posts';
      case ChannelType.FBMessages:
        return 'Messages';
      case ChannelType.Videos:
        return 'Videos';
      case ChannelType.GooglePlayStore:
        return 'PlayStore';
      case ChannelType.LinkedInPageUser:
        return 'Page User';
      case ChannelType.LinkedInPublic:
        return 'Public';
      case ChannelType.LinkedInComments:
        return 'Comments';
      case ChannelType.LinkedInMediaPosts:
        return 'MediaPosts';
      case ChannelType.LinkedInMediaComments:
        return 'Comments';
      case ChannelType.LinkedinMessage:
        return 'Message';
      case ChannelType.FBReviews:
        return 'Reviews';
      case ChannelType.AutomotiveIndiaPost:
        return 'AutomotiveIndia Post';
      case ChannelType.AutomotiveIndiaComment:
        return 'AutomotiveIndia Comment';
      case ChannelType.AutomotiveIndiaOtherPostsComments:
        return 'AutomotiveIndia Other Posts Comments';
      case ChannelType.MakeMyTrip:
        return 'Make My Trip';
      case ChannelType.Email:
        return 'Email';
      case ChannelType.GoogleMyReview:
        return 'GMB Reviews';
      case ChannelType.Survey:
        return 'Survey';
      case ChannelType.ElectronicMedia:
        return 'Electronic Media';
      case ChannelType.GMBQuestion:
        return 'GMB Questions';
      case ChannelType.GMBAnswers:
        return 'GMB Answers';
      case ChannelType.WhatsApp:
        return 'WhatsApp';
      case ChannelType.FacebookChatbot:
        return 'Facebook Chatbot';
      case ChannelType.WesiteChatbot:
        return 'Website Chatbot';
      case ChannelType.AndroidChatbot:
        return 'Android Chatbot';
      case ChannelType.IOSChatbot:
        return 'IOS Chatbot';
      case ChannelType.LineChatbot:
        return 'Line Chatbot';
      case ChannelType.WhatsAppChatbot:
        return 'WhatsApp Chatbot';

      default:
        return ChannelType[obj.channelType];
    }
  }

  private mapShortData(): void {
    const assignToname = this._filterService.getNameByID(
      this.postShortenedData.ticketInfo.assignedTo,
      this._filterService.fetchedAssignTo
    );
    let username = 'Anonymous';

    if (this.postShortenedData.channelGroup == this.channelGroupEnum.Voice) {
      username = this.postShortenedData.author.name
        ? this.postShortenedData.author.name
        : this.postShortenedData.author.socialId;
      // if (this.postShortenedData.description?.includes('Unanswered') || this.postShortenedData.description?.includes('Agent Missed')) {
      //   this.postShortenedData.description = `You have received a missed call due to agents didn’t answer`
      // } else if (this.postShortenedData.description?.includes('Customer Missed')) {
      //   this.postShortenedData.description = `You have received a missed call due to customer didn’t answer`
      // } else {
      //   this.postShortenedData.description = ''
      // }
    }

    this.data = {
      ticketId: this.postShortenedData.ticketInfo.ticketID,
      mentionId: `${this.postShortenedData.brandInfo.brandID}/${this.postShortenedData.channelType}/${this.postShortenedData.contentID}`,
      brandLogo: this.getBrandLogo(this.postShortenedData.brandInfo.brandID),
      channelName: this.MapChannelType(this.postShortenedData),
      mentionCount: this.postShortenedData.ticketInfo.numberOfMentions,
      note: this.postShortenedData.note,
      isBrandPost: this.postShortenedData?.isBrandPost,
      assignTo: assignToname,
      ticketStatus: TicketStatus[this.postShortenedData.ticketInfo.status],
      ticketPriority:
        Priority[this.postShortenedData.ticketInfo.ticketPriority],
      ticketDescription:
        this.postShortenedData.channelGroup !== ChannelGroup.Email
          ? this.postShortenedData.description
            ? String(this.postShortenedData.description)
            : String(this.postShortenedData.title)
          : '',
      brandName: this.postShortenedData.brandInfo.brandName,
      brandFriendlyName: this.postShortenedData.brandInfo.brandFriendlyName,
      ticketCategory: {
        ticketUpperCategory:
          this.postShortenedData.ticketInfo?.ticketUpperCategory?.name,
        mentionUpperCategory: this.postShortenedData?.upperCategory?.name,
      },
      Userinfo: {
        name: this.postShortenedData.author.name
          ? this.postShortenedData.author.name
          : username,
        image: this.postShortenedData.author.picUrl
          ? this.postShortenedData.author.picUrl
          : 'assets/images/agentimages/sample-image.svg',
        screenName: this.postShortenedData.author.screenname,
        bio: this.postShortenedData.author.bio,
        followers: this.postShortenedData.author.followersCount,
        following: this.postShortenedData.author.followingCount,
        location: this.postShortenedData.author.location,
        sentimentUpliftScore:
          this.postShortenedData.author.sentimentUpliftScore,
        npsScore: this.postShortenedData.author.nPS,
        isVerified: this.postShortenedData.author.isVerifed,
      },
      ticketTime: this._ticketsService.calculateTicketTimes(
        this.postShortenedData
      ),
      channelImage: this._locobuzzmentionService.getChannelIcon(
        this.postShortenedData
      ),
      ticketCategoryTop: '',
      mentionCategoryTop: '',
    };
    if (this.data.channelName == 'Voice') {
      const date = moment.utc(this.postShortenedData.mentionTime).local().format('ll')
      const time = moment.utc(this.postShortenedData.mentionTime).local().format('h:mm a')

      let ivrData = '';

      if (this.data?.ticketDescription?.indexOf('IVR') > -1) {
        let ivrNum = '';

        if (this.data?.ticketDescription?.indexOf(",") > 0) {
          ivrData = this.data.ticketDescription.substring(
            this.data.ticketDescription.indexOf("IVR"),
            this.data.ticketDescription.indexOf(",")
          );
        } else {
          ivrData = this.data.ticketDescription.substring(this.data.ticketDescription.indexOf("IVR"));
        }

        if (this.ivrBrandData && ivrData) {
          ivrNum = ivrData.substring(ivrData.indexOf(":") + 1).trim();
          const brandIVRJson = this.ivrBrandData.find(x => x.brandID == this.postShortenedData?.brandInfo?.brandID);
          let brandIVRDesc = brandIVRJson?.description;

          if (brandIVRDesc && ivrNum) {
            brandIVRDesc = brandIVRDesc[ivrNum];
            ivrData = brandIVRDesc ? ivrData.replace(ivrNum, ` ${brandIVRDesc}`) : '';
            ivrData = ivrData ? ivrData.replace("IVR", "Selected IVR option").trim() : '';
          } else {
            ivrData = '';
          }
        }
      }

      const index = this.data?.ticketDescription?.indexOf('on');
      if (index >= 0) {
        if (this.ticketHistoryData?.description?.includes('disconnected')) {
          const onIndex = this.ticketHistoryData?.description?.indexOf(' on ')
          this.data.ticketDescription = this.data.ticketDescription.substring(0, onIndex + 4) + ' ' + date + ' at ' + time;
        }else
        {
        this.data.ticketDescription = this.data.ticketDescription.substring(0, index + 2) + ' ' + date + ' at ' + time;
        }
        if (this.data.isBrandPost) {
          this.data.ticketDescription = this.data.ticketDescription;
        } else {
          if (ivrData!='')
          {
            this.data.ticketDescription = ivrData ? this.data.ticketDescription + ' (' + ivrData + ')' : '';
          }else
          {
            this.data.ticketDescription = this.data.ticketDescription.replace('IVR:','')
          }
        }
      }

    }
    if (
      this.data &&
      this.data.ticketDescription &&
      this.data.ticketDescription.length > 143
    ) {
      this.data.ticketDescription = this.data.ticketDescription
      // .substring(
      //   0,
      //   143
      // );
    }
    if (this.data) {
      this.ticketHistoryData = {};
      this.ticketHistoryData.ticketClient = this.data;
      this.ticketHistoryData.deleteSocialEnabled =
        this.currentUser.data.user.actionButton.deleteSocialEnabled;
    }

    this.brandList = this._filterService.fetchedBrandData;
    this.ticketHistoryData =
      this._footericonService.SetDefaultTicketHistoryData(
        this.ticketHistoryData,
        this.currentUser
      );
    if (
      this.postShortenedData.channelType === ChannelType.Email &&
      this.postShortenedData.emailContent
    ) {
      this.ticketHistoryData.htmlData = this.postShortenedData.title;
    }

    if (this.brandList) {
      const currentBrandObj: any = this.brandList.find((obj) => {
        return Number(obj.brandID) === Number(this.postShortenedData.brandInfo.brandID);
      });
      this.currentBrand =
        currentBrandObj !== null ? currentBrandObj : undefined;
      if (this.currentBrand) {
        this.aiabsaEnabled = currentBrandObj?.aiabsaEnabled;
      }
    }
    this.ticketHistoryData = this._footericonService.SetTicketStatusandAssignTo(
      this.currentBrand,
      this.currentUser,
      this.ticketHistoryData,
      this.postShortenedData
    );

    this.data.ticketStatus = this.ticketHistoryData.currentticketstatus;

    const result = this._footericonService.togglePostfootClasses(
      this.postShortenedData,
      this.data.ticketPriority,
      this.data
    );
    this.priorityClass = result.priorityClass;
    this.statusClass = result.statusClass;
    // this.data.ticketDescription = linkifyStr(
    //   this.data?.ticketDescription,
    //   { target: '_system' }
    // );
    this.data.ticketDescription = LocobuzzUtils.checkLinkTag((this.data?.ticketDescription))
    const ticketHistoryData = this._footericonService.SetMedia({description:this.data?.ticketDescription }, this.postShortenedData, environment.MediaUrl)
    this.data.ticketDescription = ticketHistoryData?.description;
  }
  toHtml(input) {
    try {
      // return decode(input)
    } catch (error) {
      return input;
    }
  }

  closePreviousTicketCase(postData: BaseMention): void {
    const obj = {
      BrandID: postData?.brandInfo?.brandID,
      BrandName: postData?.brandInfo?.brandName,
      TicketID: postData?.ticketInfo?.ticketID,
      Status: 'C',
    };
    this.lockUnlockTicket = this._ticketsService.lockUnlockTicket(obj).subscribe((resp) => {
      if (resp.success) {
        // success
      }
    });
  }

  openDetailView() {
    if (this.postShortenedData.ticketInfo.ticketID > 0) {
      this.closePreviousTicketCase(this.postDetailService.postObj);
      this.postDetailService.postObj = this.postShortenedData;
      this._ticketsService.bulkMentionChecked = [];
      this._ticketsService.selectedPostList = [];
      this._ticketsService.postSelectTriggerSignal.set(
        this._ticketsService.selectedPostList.length
      );
      /* this.postDetailService.currentPostObject.next(
        this.postShortenedData.ticketInfo.ticketID
      ); */
      this.postDetailService.currentPostObjectSignal.set(
        this.postShortenedData.ticketInfo.ticketID
      );
      this.postDetailService.makeActionableFlag = false;
      this._ticketsService.newTicketSummary.next({
        status: true,
        type: 'ticket',
        data: this.postShortenedData.ticketInfo.ticketID
      })
    }
    // this._ticketsService.ticketHistoryAssignToObs.next(true);
    this._replyService.clearNoteAttachmentSignal.set(true);
    this._replyService.replyActionPerformedSignal.set(null)
    this.postDetailService.emailTicketAttachmentMedia=[]
    this.postDetailService.emailIdsInSameThread=[]
  }
  openDetailViewWithSub(data) {
    if (data?.ticketInfo?.ticketID > 0 && data) {
      this.closePreviousTicketCase(this.postDetailService.postObj);
      this.postDetailService.postObj = data;
      this._ticketsService.bulkMentionChecked = [];
      this._ticketsService.selectedPostList = [];
      this._ticketsService.postSelectTriggerSignal.set(
        this._ticketsService.selectedPostList.length
      );
      /* this.postDetailService.currentPostObject.next(
        data.ticketInfo.ticketID
      ); */
      this.postDetailService.currentPostObjectSignal.set(
        data.ticketInfo.ticketID
      );
      this.postDetailService.makeActionableFlag = false;
    }
    // this._ticketsService.ticketHistoryAssignToObs.next(true)
  }

  ngOnDestroy(): void {
    this.clearSignal.set(false);
    this.cdk.detectChanges();
    this.cdk.detach();
    if (this.MarkActionableAPI) {
      this.MarkActionableAPI.unsubscribe();
    }
    if (this.lockUnlockTicket){
      this.lockUnlockTicket.unsubscribe();
    }
    if (this.subs){
      this.subs.unsubscribe();
    }
    if (this.effectTicketStatusChangeObsShortendSignal) {
      this.effectTicketStatusChangeObsShortendSignal.destroy();
    }
  }

  detectArabic(text: string = ""): boolean {
    text = text?.replace(/<[^>]*>/g, '');
    const arabicChars = text?.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g) || [];
    const totalChars = text?.replace(/\s/g, '').length;
    const arabicRatio = arabicChars?.length / totalChars;
    return arabicRatio > 0.3;
  }

  getTextDirection(): 'rtl' | 'ltr' {
    return this.detectArabic(`${this.data?.ticketDescription}`) ? 'rtl' : 'ltr';
  }

  formatTextForDirection(text: string, dir: 'rtl' | 'ltr'): string {
    if (dir === 'rtl') {
      return text?.replace(/(@\w+)/g, '<span dir="ltr">$1</span>');
    }
    return text;
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

  getEntityIcon(entityType) {
    switch (entityType) {
      case 1:
        return 'assets/ticket-list/brand-entity.svg';
        break;
      case 2:
        return 'assets/ticket-list/person-entity.svg';
        break;
      case 3:
        return 'assets/ticket-list/location-entity.svg';
        break;
      case 4:
        return 'assets/ticket-list/product-entity.svg';
        break;
      case 5:
        return 'assets/ticket-list/organisation-entity.svg';
        break;
      case 6:
        return 'assets/ticket-list/other_entity.svg';
        break;
    }
  }

  checkSpaceAndSetPosition(aspectTooltip: HTMLElement) {
    if (aspectTooltip) {
      const buttonRect = aspectTooltip.getBoundingClientRect();
      const spaceAboveElement = buttonRect.top;

      if (spaceAboveElement > 400) {
        this.tooltipPositionAbove = true;
      } else {
        this.tooltipPositionAbove = false;
      }
    }
  }
}

