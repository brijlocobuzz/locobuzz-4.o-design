import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Emoji } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { excludeEmojis } from 'app/app-data/emoji';
import { notificationType } from 'app/core/enums/notificationType';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { SocialHandle } from 'app/core/models/dbmodel/TicketReplyDTO';
import { UserOneViewDTO } from 'app/core/models/dbmodel/UserOneViewDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { UseroneviewService } from 'app/social-inbox/services/useroneview.service';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { MediaGalleryComponent } from '../media-gallery/media-gallery.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-quote-tweet',
    templateUrl: './quote-tweet.component.html',
    styleUrls: ['./quote-tweet.component.scss'],
    standalone: false
})
export class QuoteTweetComponent implements OnInit, OnDestroy {
  postData: BaseMention;
  userOneViewDTO: UserOneViewDTO[];
  maxLengthInput = 280;
  currentLength = 280;
  quotetweettext = '';
  keyObject: any;
  qouteSending = false;
  currentHandle: SocialHandle;
  constructor(
    private _userOneViewService: UseroneviewService,
    private _ticketService: TicketsService,
    private _footericonService: FootericonsService,
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private _mediaGalleryService: MediagalleryService,
    private replyService: ReplyService,
    private dialogRef: MatDialogRef<QuoteTweetComponent>,
    private translate: TranslateService,
    private _mapLocobuzzEntity: MaplocobuzzentitiesService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public baseData: {
      postData: BaseMention;
      keyObj: any;
      handle: SocialHandle;
    }
  ) {
    this.postData = baseData.postData;
    this.keyObject = baseData.keyObj;
    this.currentHandle = baseData.handle;
  }
  ngOnDestroy(): void {
    // this.replyService.selectedMedia.next([]);
    this._mediaGalleryService.selectedMedia = [];
  }
  subs = new SubSink();
  selectedMedia: UgcMention[] = [];
  mediaSelected = new Subject<UgcMention[]>();
  mediaSelected$ = this.mediaSelected.asObservable();
  ngOnInit(): void {
    this.setUserData();
    this.subs.add(
      this.replyService.selectedMedia
        .pipe(filter((res) => res.section === SectionEnum.Ticket))
        .subscribe((ugcarray) => {
          if (ugcarray?.media && ugcarray?.media.length > 0) {
            this.mediaSelected.next(ugcarray.media);
            this.selectedMedia = ugcarray.media;
          }
        })
    );
  }
  setUserData(): void {
    this.userOneViewDTO = this._userOneViewService.buildUserOneviewObject([
      this.postData,
    ]);
    this.userOneViewDTO[0].hideLikeRetweet = true;
    this.userOneViewDTO[0].showMentionId = true;
    this.userOneViewDTO[0].mentionId =
      this.postData.brandInfo.brandID +
      '/' +
      this.postData.channelType +
      '/' +
      this.postData.contentID;
  }

  InputChanges(event): void {
    if (event.target.value) {
      this.currentLength = this.maxLengthInput - event.target.value.length;
    } else {
      this.currentLength = 280;
    }
  }

  tweetRetweet(): void {
    this.qouteSending = true;
    const retweetObj = {
      text: this.quotetweettext,
    };
    // "QuoteStatus":"quoting this tweet sdfvbdws",
    // "TweetURL":"https://twitter.com/PapiloPapita/status/1414467398724292619"
    this.keyObject.QuoteStatus = this.quotetweettext;
    this.keyObject.TweetURL = this._footericonService.setOpenPostLink(
      this.postData,
      false
    );
    if (this.selectedMedia && this.selectedMedia.length > 0) {
      this.selectedMedia = this._mapLocobuzzEntity.mapUgcMention(
        this.selectedMedia
      );
      this.keyObject.AttachmentsUgc = this.selectedMedia;
    }

    this._ticketService
      .retweetUnRetweetMention(this.keyObject)
      .subscribe((data) => {
        if (data.success) {
          this.qouteSending = false;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: this.translate.instant('Retweeted-Successfully'),
            },
          });
          this.replyService.setRetweetStatus.next(this.postData);
        } else {
          this.qouteSending = false;
          if (data?.data?.apiErrorMessage) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: data.data.apiErrorMessage,
              },
            });
          } else if (data?.message) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: this.translate.instant('Some-error-occurred'),
              },
            });
          }
        }
        this.dialogRef.close();
      });
    // this.postActionTypeEvent.emit({
    //   actionType: PostActionEnum.tweetRetweet,
    //   param: { retweetObj},
    // });
  }

  loadEmojiSheet: Emoji['backgroundImageFn'] = (set, sheetSize) => {
    return `assets/images/emoji-sheets/${set}-emoji-sheet.png`;
  };

  filteredEmojis = (emoji) => {
    const emojiIndex = excludeEmojis.indexOf(emoji);
    if (emojiIndex < 0) {
      return true;
    } else {
      return false;
    }
  };

  selectEmoji(event): void {
    console.log(event);
    this.quotetweettext = this.quotetweettext.concat(event.emoji.native);
  }

  openMediaDialog(): void {
    this._mediaGalleryService.emptySelectedMedia();
    this._dialog.open(MediaGalleryComponent, {
      autoFocus: false,
      panelClass: ['full-screen-modal'],
    });
  }

  removeSelectedMedia(ugcMention: UgcMention): void {
    if (ugcMention) {
      this.selectedMedia = this.selectedMedia.filter((obj) => {
        return obj.mediaID !== ugcMention.mediaID;
      });
      this.mediaSelected.next(this.selectedMedia);
      this._mediaGalleryService.selectedMedia = this.selectedMedia;
    }
  }
}
