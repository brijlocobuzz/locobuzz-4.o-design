import { Component, effect, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { BulkMentionChecked } from 'app/core/models/dbmodel/TicketReplyDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { AccountService } from 'app/core/services/account.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import moment from 'moment';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink/dist/subsink';
import { MatPaginator } from '@angular/material/paginator';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-parent-post',
    templateUrl: './parent-post.component.html',
    styleUrls: ['./parent-post.component.scss'],
    standalone: false
})
export class ParentPostComponent implements OnInit, OnDestroy {
  bulkActionpanelStatus: boolean;
  currentUser: any;
  checkAllCheckBox: any;
  subs = new SubSink();
  totalParentCount: number;
  firstPost: BaseMention;
  commentsLoader: boolean;
  Label: string = '';
  totalRecords: number=0;
  pageOffset: number=0;
  viewCommentFlag:boolean=false;
  parentPostFlag: boolean = false;
  groupView: boolean = false;
  channelGroup=ChannelGroup
  clickhouse:boolean=false;
  relatedMentionCount: number =0;
  totalAllMention: number = 0;
  rtTotalMentions: number = 0;
  ftTotalMentions: number = 0;
  constructor(
    private _postDetailService: PostDetailService,
    private _ticketService: TicketsService,
    private _snackBar: MatSnackBar,
    private _navigationService: NavigationService,
    private _chatBotService: ChatBotService,
    private accountService: AccountService,
    private _replyService: ReplyService,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<ParentPostComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: any
  ) {
    let onLoadFilterTab = true;
     effect(() => {
       const value = this._replyService.replyActionPerformedSignal();
          if (!onLoadFilterTab && value){
            this.replyActionPerformedSignalChanges(value);
          } else {
            onLoadFilterTab = false;
          }
    }, { allowSignalWrites: true });
  }
  postData: BaseMention;
  mentionList: BaseMention[];
  loaderTypeEnum = loaderTypeEnum;
  baseLogObject: any[] = [];
  parentPostLoading = false;
  ChannelType=ChannelType
  repliesFlag:boolean =false;
  retweetFlag:boolean=false;
  sortBy: string ='Unread';
  sortOrder: string ='asc'
  inputSearch = new FormControl('');
  ChannelGruop=ChannelGroup
  dateRange:boolean =true
  createdDate: any;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  ngOnInit(): void {
    this.viewCommentFlag = this.dialogData?.viewCommentFlag;
    this.parentPostFlag = this.dialogData?.parentPostFlag;
    this.groupView = this.dialogData?.groupView;
    this.subs.add(
      this._ticketService.parentbulkActionChange.subscribe((value) => {
        if (value > 0) {
          //this.dialogRef.close();
          if(this.parentPostFlag)
            {
          this.GetParentPostList(0);
            }
          if (this.groupView)
            {
            this.getGroupViewList(0);
            this.postData = this._postDetailService.postObj;
            // this.firstPost = this.postData
            }
        }
      })
    );

    // this.subs.add(
    //   this._replyService.replyActionPerformed.subscribe((obj) => {
    //     if (obj) {
    //       if (obj.ticketInfo.ticketID) {
    //         if(this.parentPostFlag)
    //           {
    //         this.GetParentPostList(0);
    //           }
    //         if (this.groupView) {
    //           this.getGroupViewList(0);
    //           this.postData = this._postDetailService.postObj;
    //           this.firstPost = this.postData
    //         }
    //       }
    //     }
    //   })
    // );

    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
      if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1){
        this.clickhouse=true
      }
    this.parentPostLoading = true;
    if(this.parentPostFlag)
      {
    this.GetParentPostList(0);
      }
    if (this.groupView) {
      this.postData = this._postDetailService.postObj;
      this.getGroupViewList(0);
      // this.firstPost = this.postData
      if (this.postData?.channelGroup == ChannelGroup.Twitter) {
        this.retweetFlag = true;
      }
    }
    if (this.postData?.channelGroup == ChannelGroup.Quora) {
      this.Label = 'Answer & Comments';
    }else{
      if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
        if (this.postData?.channelType == ChannelType.FBPageUser && !this.viewCommentFlag) {
          this.Label = 'Seperated media post';
        } 
        else if(this.postData?.channelGroup==ChannelGroup.GoogleMyReview){
          if(this.postData?.channelType==ChannelType.GMBAnswers){
            this.Label='Answers'
          }
          else if(this.postData?.channelType==ChannelType.GMBpost){
            this.Label='Posts'
          }
          else if(this.postData?.channelType==ChannelType.GoogleMyReview){
            this.Label='Reviews'
          }
        }
        else {
          this.Label = 'Comments';
        }
      }else
      {
        if (this.postData?.channelType == ChannelType.FBPageUser) {
          this.Label = 'Seperated Media Post';
        } else {
          this.Label = 'Comments';
        }
      }
    }

    this.subs.add(
      this._ticketService.updateChildMentionInParentPost.subscribe((res)=>{
        if(res)
        {
          this._ticketService.updateChildMentionInMentionList.next({tagID:this.postData.tagID,seenOrUnseen:res.seenOrUnseen})
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  replyActionPerformedSignalChanges(obj){
    if (obj) {
      if (obj.ticketInfo.ticketID) {
        if (this.parentPostFlag) {
          this.GetParentPostList(0);
        }
        if (this.groupView) {
          this.getGroupViewList(0);
          this.postData = this._postDetailService.postObj;
          this.firstPost = this.postData
        }
      }
    }
  }
  toggleBulkSelect(selectedPost: [boolean, number]): void {
    if (selectedPost[0] === true) {
      this._ticketService.selectedPostList.push(+selectedPost[1]);
      // this._ticketService.postSelectTrigger.next(
      //   this._ticketService.selectedPostList.length
      // );
      this._ticketService.postSelectTriggerSignal.set(this._ticketService.selectedPostList.length);

    } else {
      const index = this._ticketService.selectedPostList.indexOf(
        +selectedPost[1]
      );
      if (index > -1) {
        this._ticketService.selectedPostList.splice(index, 1);
        // this._ticketService.postSelectTrigger.next(
        //   this._ticketService.selectedPostList.length
        // );
        this._ticketService.postSelectTriggerSignal.set(this._ticketService.selectedPostList.length);
      }
    }
    this.bulkActionpanelStatus =
      this._ticketService.selectedPostList.length >= 2 ? true : false;
  }

  postBulkAction(event): void {
    if (event === 'dismiss') {
      this.bulkActionpanelStatus = false;
      //this._chatBotService.chatPosition.next(false);
      // this._chatBotService.chatPosition.next({
      //   bulkActionpanelFalg: this.bulkActionpanelStatus,
      // });
      this._chatBotService.chatPositionSignal.set({
        bulkActionpanelFalg: this.bulkActionpanelStatus,
      })
      // console.log(
      //   `emit from ParentPostComponent => postBulkAction(event) => line 109. Check: bulkActionpanelFalg always false`
      // );
      //this.refreshcountafterbulk();
    } else if (event === 'selectAll') {
      this._ticketService.bulkMentionChecked = [];
      this._ticketService.selectedPostList = [];
      if (this.checkAllCheckBox) {
        this.checkAllCheckBox = false;
      } else {
        this.checkAllCheckBox = true;
      }
      const List = this.mentionList.filter((data) => !data.isParentPost);
      for (const ticket of List) {
        if (this.checkAllCheckBox) {
          const obj: BulkMentionChecked = {
            guid: this._navigationService.currentSelectedTab.guid,
            mention: ticket,
          };
          this._ticketService.bulkMentionChecked.push(obj);
          this._ticketService.selectedPostList.push(ticket.ticketInfo.ticketID);
          // this._ticketService.postSelectTrigger.next(
          //   this._ticketService.selectedPostList.length
          // );
          this._ticketService.postSelectTriggerSignal.set(this._ticketService.selectedPostList.length);
        } else {
          // this._ticketService.postSelectTrigger.next(
          //   this._ticketService.selectedPostList.length
          // );
          this._ticketService.postSelectTriggerSignal.set(this._ticketService.selectedPostList.length);
        }

        this.bulkActionpanelStatus =
          this._ticketService.selectedPostList.length >= 2 ? true : false;
      }
    } else if (event === 'hideactionpanel') {
      this._ticketService.bulkMentionChecked = [];
      this._ticketService.selectedPostList = [];
      this.checkAllCheckBox = false;
      this.bulkActionpanelStatus = false;
      this._ticketService.unselectbulkpostTrigger.next(false);
    }
  }

  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  closeDailog() {
    if (this._ticketService.selectedPostList.length>1)
    {
      this._ticketService.bulkMentionChecked = [];
      this._ticketService.selectedPostList = [];
      // this._ticketService.postSelectTrigger.next(0);
      this._ticketService.postSelectTriggerSignal.set(0);
    }
  }

  GetParentPostList(offset: number): void {
    let parentpostid;
    this.postData = this._postDetailService.postObj;
    if (
      this.postData.channelGroup === ChannelGroup.Facebook ||
      this.postData.channelGroup === ChannelGroup.Twitter ||
      this.postData.channelGroup === ChannelGroup.Youtube ||
      this.postData.channelGroup === ChannelGroup.WhatsApp ||
      this.postData.channelGroup === ChannelGroup.WebsiteChatBot ||
      this.postData.channelGroup === ChannelGroup.LinkedIn ||
      this.postData.channelGroup === ChannelGroup.GooglePlus ||
      (this.postData.channelGroup === ChannelGroup.Quora &&
        (this.postData.channelType === ChannelType.QuoraAnswer ||
          this.postData.channelType === ChannelType.QuoraComment)) ||
      this.postData.channelGroup === ChannelGroup.TikTok ||
      this.postData.channelGroup === ChannelGroup.Pantip ||
      this.postData.channelGroup === ChannelGroup.Reddit
    ) {
      if (this.postData.parentPostSocialID !== null) {
        parentpostid = this.postData.parentPostSocialID;
      }else{
        if(this.viewCommentFlag)
        {
          parentpostid=this.postData?.socialID
        }
      }
    } else if (this.postData.channelGroup === ChannelGroup.Instagram) {
      if (
        this.postData.parentPostSocialID &&
        this.postData.instagramPostType !== 5
      ) {
        parentpostid = this.postData.parentPostSocialID;
      } else {
        if (this.viewCommentFlag) {
          parentpostid = this.postData?.socialID
        }
      }
    }  
     else if (this.postData.channelGroup === ChannelGroup.GoogleMyReview) {
      parentpostid=this.postData?.postSocialId
    }
    else if (this.postData.channelGroup === ChannelGroup.ECommerceWebsites) {
      if (this.postData.parentPostID) {
        parentpostid = this.postData.parentPostID;
      } else {
        if (this.viewCommentFlag) {
          parentpostid = this.postData?.socialID
        }
      }
    }
   

    let IsParentPost:boolean=true;
    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
      if (this.postData.channelGroup === ChannelGroup.Facebook) {
        if (this.postData.channelType == ChannelType.FBPageUser || this.postData.channelType == ChannelType.FBPublic || this.postData.channelType == ChannelType.FbMediaPosts || this.postData.channelType == ChannelType.FBReviews) {
          if (this.postData.parentSocialID !== null && this.postData.parentSocialID != '0') {
            parentpostid = this.viewCommentFlag?this.postData.socialID:this.postData?.parentSocialID
          }
        }
        if (this.postData.channelType == ChannelType.FBComments || this.postData.channelType == ChannelType.FBMediaComments || this.postData.channelType == ChannelType.FbGroupComments) {
          if (this.postData.parentPostSocialID !== null && this.postData.parentPostSocialID != '0') {
            parentpostid = this.viewCommentFlag ? this.postData.socialID : this.postData?.parentPostSocialID
          }
        }
      }
      if (this.postData.channelGroup === ChannelGroup.TripAdvisor || this.postData.channelGroup === ChannelGroup.ECommerceWebsites) {
        parentpostid = this.viewCommentFlag ? this.postData.socialID : this.postData?.parentPostSocialID
      }
      if (this.postData.channelGroup === ChannelGroup.AppStoreReviews || this.postData.channelGroup === ChannelGroup.GooglePlayStore) {
        parentpostid = this.postData.postSocialId
      }
       IsParentPost=this.viewCommentFlag?false:true
    }

    let keyobj:any = {
      brandInfo: this.postData.brandInfo,
      startDateEpoch: moment().startOf('day').utc().unix(),
      endDateEpoch: moment().endOf('day').utc().unix(),
      ticketId: this.postData.ticketInfo.ticketID,
      TagID: this.postData.tagID,
      SocialID: parentpostid,
      author: null,
      IsActionableData: 0,
      channel: this.postData.channelGroup,
      IsPlainLogText: false,
      targetBrandName: '',
      targetBrandID: 0,
      IsCopy: false,
      OFFSET: offset,
      NoOfRows: 20,
      IsParentPost: IsParentPost,
    };

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      if (this.currentUser?.data?.user?.isClickhouseEnabled == 1) {

        delete keyobj.TagID;
        keyobj.StrTagID = this.postData.tagID
        keyobj.subchannel=this.postData.channelType
      }
    }

    this._ticketService.GetParentPostAndComments(keyobj).subscribe(
      (data) => {
        this.commentsLoader = false;
        if (data.success) {
          if (data.data) {
            this.parentPostLoading = false;
            let mentionList = data.data.mentionList
            if (offset == 0) {
              if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
                if(this.postData.channelGroup==ChannelGroup.Facebook)
                {
                this.firstPost = mentionList.find((obj) => ((obj.parentPostSocialID == null || obj.parentPostSocialID == 0) && (obj.parentSocialID == null || obj.parentSocialID == 0)));
                if (!this.firstPost) {
                  this.firstPost = mentionList.find((obj) => (obj.parentPostSocialID == null || obj.parentPostSocialID == 0));
                }
                  mentionList = mentionList.filter((obj) => (obj.tagID !== this.firstPost.tagID));
                this.totalRecords = (data?.data?.totalRecords) ? data.data.totalRecords : 0;
              }else{
                  if (this.postData.channelGroup == ChannelGroup.ECommerceWebsites)
                  {
                    this.firstPost = mentionList.find((obj) => obj.postid !== null && obj.isBrandPost);
                    mentionList = mentionList.filter((obj) => (obj.tagID !== this.firstPost.tagID));
                    this.totalRecords = (data?.data?.totalRecords) ? data.data.totalRecords : 0;
                  }else
                  {
                  this.firstPost = mentionList.find((obj) => obj.parentPostSocialID == null || obj.parentPostSocialID == 0);
                  mentionList = mentionList.filter((obj) => (obj.tagID !== this.firstPost.tagID));
                    this.totalRecords = (data?.data?.totalRecords) ? data.data.totalRecords : 0;
                  }
              }
              }else{
                this.firstPost = mentionList[0];
                mentionList.splice(0, 1);
                /* if (this.postData.channelGroup == ChannelGroup.Facebook) {
                  mentionList = mentionList?.filter((obj) => obj.channelType == this.postData.channelType);
                } */
                this.totalRecords = (data?.data?.totalRecords) ? data.data.totalRecords - 1 : 0;
            }
          }
            this.mentionList = mentionList;
          }
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Error-Occurred-Fetching'),
            },
          });
        }
      },
      (err) => {
        this.commentsLoader = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something-went-wrong'),
          },
        });
      }
    );
  }

  getGroupViewList(offset: number): void {
    this.commentsLoader = true;
    let parentpostid;
    this.postData = this._postDetailService.postObj;
    if (
      this.postData.channelGroup === ChannelGroup.Facebook ||
      this.postData.channelGroup === ChannelGroup.Twitter ||
      this.postData.channelGroup === ChannelGroup.Youtube ||
      this.postData.channelGroup === ChannelGroup.WhatsApp ||
      this.postData.channelGroup === ChannelGroup.WebsiteChatBot ||
      this.postData.channelGroup === ChannelGroup.LinkedIn ||
      this.postData.channelGroup === ChannelGroup.GooglePlus ||
      (this.postData.channelGroup === ChannelGroup.Quora &&
        (this.postData.channelType === ChannelType.QuoraAnswer ||
          this.postData.channelType === ChannelType.QuoraComment)) ||
      this.postData.channelGroup === ChannelGroup.TikTok
    ) {
      if (this.postData.parentPostSocialID !== null) {
        parentpostid = this.postData.parentPostSocialID;
      } else {
        if (this.viewCommentFlag) {
          parentpostid = this.postData?.socialID
        }
      }
    } else if (this.postData.channelGroup === ChannelGroup.Instagram) {
      if (
        this.postData.parentPostSocialID &&
        this.postData.instagramPostType !== 5
      ) {
        parentpostid = this.postData.parentPostSocialID;
      } else {
        if (this.viewCommentFlag) {
          parentpostid = this.postData?.socialID
        }
      }
    } else if (this.postData.channelGroup === ChannelGroup.ECommerceWebsites) {
      if (this.postData.parentPostID) {
        parentpostid = this.postData.parentPostID;
      } else {
        if (this.viewCommentFlag) {
          parentpostid = this.postData?.socialID
        }
      }
    }

    let IsParentPost: boolean = true;

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM && this.currentUser?.data?.user?.isClickhouseEnabled == 1) {
      if (this.postData.channelGroup === ChannelGroup.Facebook) {
        if (this.postData.channelType == ChannelType.FBPageUser || this.postData.channelType == ChannelType.FBPublic || this.postData.channelType == ChannelType.FbMediaPosts || this.postData.channelType == ChannelType.FBReviews) {
          if (this.postData.parentSocialID !== null && this.postData.parentSocialID != '0') {
            parentpostid = this.viewCommentFlag ? this.postData.socialID : this.postData?.parentSocialID
          }
        }
        if (this.postData.channelType == ChannelType.FBComments || this.postData.channelType == ChannelType.FBMediaComments || this.postData.channelType == ChannelType.FbGroupComments) {
          if (this.postData.parentPostSocialID !== null && this.postData.parentPostSocialID != '0') {
            parentpostid = this.viewCommentFlag ? this.postData.socialID : this.postData?.parentPostSocialID
          }
        }
      }
      if (this.postData.channelGroup === ChannelGroup.TripAdvisor || this.postData.channelGroup === ChannelGroup.ECommerceWebsites) {
        parentpostid = this.viewCommentFlag ? this.postData.socialID : this.postData?.parentPostSocialID
      }
      IsParentPost = this.viewCommentFlag ? false : true
    }
   const filter = this._navigationService?.getFilterJsonBasedOnTabGUID(this._navigationService?.currentSelectedTab?.guid)
    const senario = !this.firstPost ? 1 : !this.dateRange ? 2 : 3
    const datetosend = senario == 2 ? this.firstPost?.ticketInfo?.createdDate : this.postData?.ticketInfo?.createdDate;
    this.createdDate = datetosend;
    this._postDetailService.createdDate.next(datetosend)
    let keyobj: any = {
      brandInfo: this.postData.brandInfo,
      startDateEpoch: this.clickhouse ? filter?.startDateEpoch: moment().startOf('day').utc().unix(),
      endDateEpoch: this.clickhouse ? filter?.endDateEpoch : moment().endOf('day').utc().unix(),
      ticketId: this.postData.ticketInfo.ticketID,
      TagID: this.postData.tagID,
      SocialID: parentpostid,
      author: null,
      IsActionableData: 0,
      channel: this.postData.channelGroup,
      IsPlainLogText: false,
      targetBrandName: '',
      targetBrandID: 0,
      IsCopy: false,
      OFFSET: offset,
      NoOfRows: 20,
      IsParentPost: IsParentPost,
      UniqueId: this.postData?.ticketInfo?.uniqueId,
      IsGroupView: true,
      PostSocialId: this.postData?.socialID,
      CreatedDate: datetosend,
      Istwitter : this.postData?.channelGroup == ChannelGroup.Twitter?true:false,
      Isretweet: this.retweetFlag,
      Isreplies: this.repliesFlag,
      Filter: this.sortBy,
      OrderBy:this.sortOrder,
      simpleSearch: this.inputSearch.value,
      isDaterange:this.dateRange,
      CommentPostSocialId:this.postData?.socialIdForunseenCount,
      Scenario: senario
    };


    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      if (this.currentUser?.data?.user?.isClickhouseEnabled == 1) {

        delete keyobj.TagID;
        keyobj.StrTagID = this.postData.tagID
        keyobj.subchannel = this.postData.channelType
      }
    }

    console.log('this keyObj is needed', keyobj);
    if (keyobj) {
      this._ticketService.keyObjSubject.next(keyobj);
    }

    this._ticketService.GetParentPostAndComments(keyobj).subscribe(
      (data) => {
        this.commentsLoader = false;
        if (data.success) {
          if (data.data) {
            this.parentPostLoading = false;
            let mentionList = data.data.mentionList
            this.mentionList = mentionList;
            if (offset == 0) {
              // this.totalRecords = data.data.totalRecords;
              this.relatedMentionCount = data.data.selected_duration_unseen_count; // selected_duration_count
              this.totalAllMention = data.data.total_unseen_count; // total_count 
              this.rtTotalMentions = data.data.selected_duration_count;
              this.ftTotalMentions = data.data.total_count;
              !this.firstPost ? this.firstPost = data.data.mentionListParent[0]:'';
              if(this.dateRange)
                {
                this.totalRecords = this.relatedMentionCount
                }else{
                this.totalRecords = this.totalAllMention
                }
            }
          }
        } else {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Error-Occurred-Fetching'),
            },
          });
        }
      },
      (err) => {
        this.commentsLoader = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something-went-wrong'),
          },
        });
      }
    );
  }

  OnPageChange(event: PageEvent): void {
    this.commentsLoader = true;
    let offset = 0;
    offset = event.pageIndex * event.pageSize;
    this.pageOffset = offset;
    if (event.pageIndex !== event.previousPageIndex) {
      this.checkAllCheckBox=false;
      this._ticketService.selectedPostList = [];
      // this._ticketService.postSelectTrigger.next(0);
      this._ticketService.postSelectTriggerSignal.set(0);
      this._ticketService.bulkMentionChecked = [];
      if(this.parentPostFlag)
        {
      this.GetParentPostList(offset);
        }
        if(this.groupView)
          {
          this.getGroupViewList(offset);
          }
    }
  }

  toogleEvent(event):void{
    if(event=='retweets')
    {
      if (this.retweetFlag && this.repliesFlag) 
        {
          this.retweetFlag = false;
        }
        else if(!this.retweetFlag && this.repliesFlag)
          {
          this.retweetFlag = true;
          }else{
            this.retweetFlag = false;
            this.repliesFlag = true;
          }

    }else{
      if (this.retweetFlag && this.repliesFlag) {
        this.repliesFlag = false;
      }
      else if (!this.repliesFlag && this.retweetFlag) {
        this.repliesFlag = true;
      } else {
        this.repliesFlag = false;
                    this.retweetFlag = true;
      }
    }
    this.getGroupViewList(0);
  }

  toogleRadioEvent():void{
    this.getGroupViewList(0);
  }

  search():void{
      if (this.inputSearch.value != '') {
        this._ticketService.selectedPostList = [];
        // this._ticketService.postSelectTrigger.next(0);
        this._ticketService.postSelectTriggerSignal.set(0);
        this._ticketService.bulkMentionChecked = [];
        this.getGroupViewList(0);
      } else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Warn,
            message: this.translate.instant('Please-type-something-to-search'),
          },
        });
      }
    }

  searchInput():void
  {
    if (this.inputSearch.value == '') {
      this.getGroupViewList(0);
      this._ticketService.selectedPostList = [];
      // this._ticketService.postSelectTrigger.next(0);
      this._ticketService.postSelectTriggerSignal.set(0);
      this._ticketService.bulkMentionChecked = [];
    }
  }

  filterBasedOnDuration(flag:boolean):void{
  this.dateRange =flag;
  this.getGroupViewList(0)
    this._postDetailService.relatedOrfullmention=flag
      this.paginator.firstPage();
  }
}

