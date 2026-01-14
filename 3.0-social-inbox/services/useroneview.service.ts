import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { TicketTimings } from 'app/core/interfaces/TicketClient';
import {
  AudioUrl,
  DocumentUrl,
  VideoUrl,
} from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { UserOneViewDTO } from 'app/core/models/dbmodel/UserOneViewDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { MimeTypes } from 'app/core/models/viewmodel/MimeTypes';
import { LocobuzzmentionService } from 'app/core/services/locobuzzmention.service';
import { environment } from 'environments/environment';
import moment from 'moment';

@Injectable({
  providedIn: 'root',
})
export class UseroneviewService {
  userOneViewDTO: UserOneViewDTO[];
  MediaUrl: string = environment.baseUrl;
  constructor(private _locobuzzmentionService: LocobuzzmentionService, private translate: TranslateService) {}

  calculateActivityTiming(activityTime: string): TicketTimings {
    const tickettiming: TicketTimings = {};

    const end = moment();
    const start = moment.utc(activityTime).local().format();

    const duration = moment.duration(moment(end).diff(moment(start)));
    // get Years
    const years = Math.round(duration.asYears());
    const yearsFormatted = years ? `${years} ${this.translate.instant('years-ago')}` : '';
    tickettiming.years = yearsFormatted;
    tickettiming.valYears = String(years);

    // get Months
    const months = Math.round(duration.asMonths());
    const monthsFormatted = months ? `${months} ${this.translate.instant('months-ago')}` : '';
    tickettiming.months = monthsFormatted;
    tickettiming.valMonths = String(months);

    // Get Days
    const days = Math.round(duration.asDays());
    const daysFormatted = days ? `${days} ${this.translate.instant('days-ago')} ` : '';
    tickettiming.days = daysFormatted;
    tickettiming.valDays = String(days);

    // Get Hours
    const hours = duration.hours();
    const hoursFormatted = `${hours} ${this.translate.instant('hours-ago')} `;
    tickettiming.hours = hoursFormatted;
    tickettiming.valHours = String(hours);

    // Get Minutes
    const minutes = duration.minutes();
    const minutesFormatted = `${minutes} ${this.translate.instant('minutes-ago')}`;
    tickettiming.minutes = minutesFormatted;
    tickettiming.valMinutes = String(minutes);

    // Get seconds
    const seconds = duration.seconds();
    const secondsFormatted = `${minutes} ${this.translate.instant('seconds-ago')}`;
    tickettiming.seconds = secondsFormatted;
    tickettiming.valSeconds = String(seconds);

    tickettiming.timetoshow = years
      ? tickettiming.years
      : months
      ? tickettiming.months
      : days
      ? tickettiming.days
      : hours
      ? tickettiming.hours
      : minutes
      ? tickettiming.minutes
      : tickettiming.seconds;

    return tickettiming;
  }

  buildUserOneviewObject(mentionList: BaseMention[]): UserOneViewDTO[] {
    this.userOneViewDTO = [];
    const timeOffset = new Date().getTimezoneOffset();
    if (mentionList.length > 0) {
      for (const mention of mentionList) {
        const userOneDTO: UserOneViewDTO = {
          imageurls: [],
          audioUrls: [],
          videoUrls: [],
          documentUrls: [],
          brandInfo: mention.brandInfo,
          attachmentMetadata: mention.attachmentMetadata,
          fbPageID: mention.fbPageID,
          socialID: mention.socialID,
          inReplyToStatusId: mention.inReplyToStatusId,
          originalMention: mention, // Store reference to original BaseMention
        };

        userOneDTO.ticketId = String(mention.ticketID);
        userOneDTO.mentionId =
          mention.brandInfo.brandID +
          '/' +
          mention.channelType +
          '/' +
          mention.contentID;
        if (mention.channelGroup === ChannelGroup.Facebook) {
          userOneDTO.channelGroup = ChannelGroup.Facebook;
          if (mention.channelType === ChannelType.FBMessages) {
            userOneDTO.channelIcon = 'assets/images/channelsv/Facebook_DM.svg';
            userOneDTO.messageText = 'Private Message';
          } else {
            userOneDTO.channelIcon = 'assets/images/channel-logos/facebook.svg';
            userOneDTO.messageText = 'Post on Facebook';
          }

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }
          userOneDTO.authorName = mention.author.name;
          userOneDTO.authorLink = `https://www.facebook.com/${mention.socialID}`;
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming =
          //   this._locobuzzmentionService.calculateTicketTimes(mention);

          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;

          // facebook media content
          if (
            mention?.attachmentMetadata?.mediaContents &&
            mention?.attachmentMetadata?.mediaContents.length > 0
          ) {
            if (mention.mediaType === MediaEnum.IMAGE) {
              if (mention?.attachmentMetadata?.mediaContents.length > 0) {
                for (const MediaContentItem of mention?.attachmentMetadata
                  ?.mediaContents) {
                  if (
                    mention.channelType === ChannelType.FBMessages &&
                    MediaContentItem.thumbUrl
                  ) {
                    if (MediaContentItem.thumbUrl.includes('s3.amazonaws')) {
                      const mimeType = MimeTypes.getMimeTypefromString(
                        MediaContentItem.thumbUrl.split('.').pop()
                      );
                      const ReplaceText =
                        'https://s3.amazonaws.com/locobuzz.socialimages/';
                      let ThumbUrl = MediaContentItem.thumbUrl;
                      ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                      const backgroundUrl = `${this.MediaUrl}/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                      userOneDTO.imageurls.push(backgroundUrl);
                    } else {
                      const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                      userOneDTO.imageurls.push(backgroundUrl);
                    }
                  } else {
                    const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                    userOneDTO.imageurls.push(backgroundUrl);
                  }
                }
              }
            } else if (mention.mediaType === MediaEnum.VIDEO) {
              if (
                mention?.attachmentMetadata?.mediaContents &&
                mention?.attachmentMetadata?.mediaContents.length > 0
              ) {
                for (const MediaContentItem of mention?.attachmentMetadata
                  ?.mediaContents) {
                  userOneDTO.videoIcon = true;
                  if (
                    MediaContentItem.thumbUrl &&
                    (MediaContentItem.thumbUrl.includes('.png') ||
                      MediaContentItem.thumbUrl.includes('.jpg') ||
                      MediaContentItem.thumbUrl.includes('.jpeg') ||
                      MediaContentItem.thumbUrl.includes('.gif'))
                  ) {
                    if (mention.channelType === ChannelType.FBMessages) {
                      if (MediaContentItem.thumbUrl.includes('images.locobuzz')) {
                        const mimeType = MimeTypes.getMimeTypefromString(
                          MediaContentItem.thumbUrl.split('.').pop()
                        );
                        const ReplaceText = 'https://images.locobuzz.com/';
                        let ThumbUrl = MediaContentItem.thumbUrl;
                        ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                        const backgroundUrl = `${this.MediaUrl}/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                        userOneDTO.imageurls.push(backgroundUrl);
                      } else {
                        const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                        userOneDTO.imageurls.push(backgroundUrl);
                      }
                    } else {
                      const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                      userOneDTO.imageurls.push(backgroundUrl);
                    }
                  } else {
                    if (MediaContentItem.mediaUrl) {
                      userOneDTO.imageurls.push(MediaContentItem.mediaUrl);
                    }
                  }
                }
              }
            } else if (mention.mediaType === MediaEnum.URL) {
              if (
                mention?.attachmentMetadata?.mediaContents &&
                mention?.attachmentMetadata?.mediaContents.length > 0
              ) {
                for (const MediaContentItem of mention?.attachmentMetadata
                  ?.mediaContents) {
                  if (
                    MediaContentItem.mediaUrl &&
                    (MediaContentItem.mediaUrl.includes('.png') ||
                      MediaContentItem.mediaUrl.includes('.jpeg') ||
                      MediaContentItem.mediaUrl.includes('.gif'))
                  ) {
                    const backgroundUrl = `${MediaContentItem.mediaUrl}`;
                    userOneDTO.imageurls.push(backgroundUrl);
                  } else {
                    if (MediaContentItem.mediaUrl) {
                      userOneDTO.imageurls.push(MediaContentItem.mediaUrl);
                    }
                  }
                }
              }
            } else if (mention.mediaType === MediaEnum.AUDIO) {
              if (
                mention?.attachmentMetadata?.mediaContents &&
                mention?.attachmentMetadata?.mediaContents.length > 0
              ) {
                for (const MediaContentItem of mention?.attachmentMetadata
                  ?.mediaContents) {
                  userOneDTO.imageurls.push(
                    'assets/images/common/AudioMusic.svg'
                  );
                }
              }
            } else if (mention.mediaType === MediaEnum.ANIMATEDGIF) {
              if (
                mention?.attachmentMetadata?.mediaContents &&
                mention?.attachmentMetadata?.mediaContents.length > 0
              ) {
                for (const MediaContentItem of mention?.attachmentMetadata
                  ?.mediaContents) {
                  userOneDTO.imageurls.push(
                    'assets/images/common/AudioMusic.svg'
                  );
                }
              }
            } else if (mention.mediaType === MediaEnum.OTHER) {
              if (
                mention?.attachmentMetadata?.mediaContents &&
                mention?.attachmentMetadata?.mediaContents.length > 0
              ) {
                for (const MediaContentItem of mention?.attachmentMetadata
                  ?.mediaContents) {
                  if (
                    MediaContentItem.mediaUrl &&
                    (MediaContentItem.mediaUrl.includes('.png') ||
                      MediaContentItem.mediaUrl.includes('.jpeg') ||
                      MediaContentItem.mediaUrl.includes('.jpg') ||
                      MediaContentItem.mediaUrl.includes('.gif'))
                  ) {
                    const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                    userOneDTO.imageurls.push(backgroundUrl);
                  } else if (MediaContentItem.mediaUrl) {
                    if (MediaContentItem.mediaUrl.includes('.pdf')) {
                      const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                      userOneDTO.imageurls.push('assets/images/common/pdf.png');
                      // bind the  pdf url
                    } else if (
                      MediaContentItem.mediaUrl.includes('.doc') ||
                      MediaContentItem.mediaUrl.includes('.docx')
                    ) {
                      const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                      userOneDTO.imageurls.push(
                        'assets/images/common/word.png'
                      );
                    } else if (
                      MediaContentItem.mediaUrl.includes('.xls') ||
                      MediaContentItem.mediaUrl.includes('.xlsx')
                    ) {
                      const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                      userOneDTO.imageurls.push(
                        'assets/images/common/excel-file.png)'
                      );
                    } else if (MediaContentItem.mediaUrl.includes('.mp3')) {
                      const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                      userOneDTO.imageurls.push(
                        'assets/images/common/AudioMusic.png)'
                      );
                    } else {
                      userOneDTO.imageurls.push(MediaContentItem.mediaUrl);
                    }
                  } else {
                    if (MediaContentItem.mediaUrl) {
                      userOneDTO.imageurls.push(MediaContentItem.mediaUrl);
                    }
                  }
                }
              }
            }
          }

          if (mention.channelType !== ChannelType.FBMessages) {
            userOneDTO.LikeCount = mention.mentionMetadata.likeCount
              ? mention.mentionMetadata.likeCount
              : 0;
            userOneDTO.CommentCount = mention.mentionMetadata.commentCount
              ? mention.mentionMetadata.commentCount
              : 0;
            // userOneDTO.fbShareCount = mention.mentionMetadata.
          }
        } else if (
          mention.channelGroup === ChannelGroup.Twitter &&
          mention.channelType !== ChannelType.BrandTweets
        ) {
          userOneDTO.channelGroup = ChannelGroup.Twitter;
          userOneDTO.screenName = mention.author.screenname;
          userOneDTO.isverified = mention.author.isVerifed;
          userOneDTO.LikeCount = mention.mentionMetadata.likeCount
            ? mention.mentionMetadata.likeCount
            : 0;
          userOneDTO.CommentCount = mention.mentionMetadata.commentCount
            ? mention.mentionMetadata.commentCount
            : 0;

          if (mention.channelType === ChannelType.DirectMessages) {
            userOneDTO.channelIcon = 'assets/images/channelsv/Twitter_DM.svg';
            userOneDTO.messageText = 'Direct Message';
          } else if (
            mention.channelType === ChannelType.Twitterbrandmention ||
            mention.channelType === ChannelType.PublicTweets
          ) {
            userOneDTO.channelIcon = 'assets/images/channel-logos/twitter.svg';
            userOneDTO.messageText = 'Tweet';
          }

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            } else {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }

          userOneDTO.authorName = mention.author.name;
          if (mention.channelType !== ChannelType.DirectMessages) {
            userOneDTO.authorLink = `http://twitter.com/a/status/${mention.socialID}`;
          } else {
            userOneDTO.authorLink = `https://www.twitter.com/${mention.author.screenname}`;
          }
          userOneDTO.twitterfollowerCount = mention.author.followingCount;
          userOneDTO.ticketId = String(mention.ticketID);
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming =
          //   this._locobuzzmentionService.calculateTicketTimes(mention);
          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;
          // twitter Media

          if (
            mention?.attachmentMetadata?.mediaContents &&
            mention?.attachmentMetadata?.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              ?.mediaContents) {
              if (mention.mediaType === MediaEnum.IMAGE) {
                if (mention.channelType === ChannelType.DirectMessages) {
                  if (mention.isBrandPost) {
                    const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem.mediaUrl}&brandsocialid=${mention.author.socialId}&brandID=${mention.brandInfo.brandID}&brandName=${mention.brandInfo.brandName}`;
                    userOneDTO.imageurls.push(backgroundUrl);
                  } else {
                    const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem.mediaUrl}&brandsocialid=${mention.inReplyToUserID}&brandID=${mention.brandInfo.brandID}&brandName=${mention.brandInfo.brandName}`;
                    userOneDTO.imageurls.push(backgroundUrl);
                  }
                } else {
                  userOneDTO.imageurls.push(MediaContentItem.mediaUrl);
                }
              }
              if (MediaContentItem.mediaType === MediaEnum.VIDEO) {
                userOneDTO.imageurls.push(MediaContentItem.thumbUrl);
              }
            }
          }
        } else if (mention.channelGroup === ChannelGroup.Instagram) {
          userOneDTO.channelGroup = ChannelGroup.Instagram;
          userOneDTO.messageText = 'Post on Instagram';

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }

          if (mention.channelType === ChannelType.InstagramComments) {
            userOneDTO.channelIcon =
              'assets/images/channel-logos/instagram.svg';
          } else {
            userOneDTO.channelIcon =
              'assets/images/channel-logos/instagram.svg';
          }
          userOneDTO.authorName = mention.author.name;
          userOneDTO.ticketId = String(mention.ticketID);
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming =
          //   this._locobuzzmentionService.calculateTicketTimes(mention);

          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;

          if (
            mention?.attachmentMetadata?.mediaContents &&
            mention?.attachmentMetadata?.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              ?.mediaContents) {
              if (
                MediaContentItem.mediaUrl &&
                MediaContentItem.mediaUrl.includes('.mp4')
              ) {
                const vidurl: VideoUrl = {};
                vidurl.fileUrl = MediaContentItem.mediaUrl;
                vidurl.thumbUrl = MediaContentItem.mediaUrl;
                userOneDTO.videoUrls.push(vidurl);
              } else if (
                MediaContentItem.thumbUrl &&
                (MediaContentItem.thumbUrl.includes('.png') ||
                  MediaContentItem.thumbUrl.includes('.jpg') ||
                  MediaContentItem.thumbUrl.includes('.jpeg') ||
                  MediaContentItem.thumbUrl.includes('.gif'))
              ) {
                userOneDTO.imageurls.push(MediaContentItem.thumbUrl);
              } else {
                if (MediaContentItem.mediaUrl) {
                  userOneDTO.imageurls.push(MediaContentItem.mediaUrl);
                }
              }
            }
          }
        } else if (mention.channelGroup === ChannelGroup.Email) {
          userOneDTO.channelGroup = ChannelGroup.Email;
          userOneDTO.channelIcon = 'assets/images/channel-logos/email.svg';
          if (mention.deliveredTo) {
            userOneDTO.messageText = 'Email Recieved';
          } else {
            userOneDTO.messageText = 'Email Opened';
          }

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }
          userOneDTO.emailFrom = mention.fromMail;
          userOneDTO.emailTo = mention.replytoEmail;
          userOneDTO.subject = mention.subject;
          userOneDTO.brandInfo = mention.brandInfo;
          userOneDTO.tagID = mention.tagID;
          userOneDTO.description = mention.description;
          userOneDTO.ticketInfo = mention.ticketInfo;
          const timeOffset = new Date().getTimezoneOffset();
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming = this._locobuzzmentionService.calculateTicketTimes(mention);
        } else if (mention.channelGroup === ChannelGroup.Youtube) {
          userOneDTO.channelGroup = ChannelGroup.Youtube;
          if (mention.channelType === ChannelType.YouTubePosts) {
            userOneDTO.messageText = 'Youtube Posts';
          } else if (mention.channelType === ChannelType.YouTubeComments) {
            userOneDTO.messageText = 'Youtube Comments';
          }

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }

          if (mention.channelType === ChannelType.YouTubeComments) {
            userOneDTO.authorLink = `http://www.youtube.com/watch?v=${mention.parentPostSocialID}&lc=${mention.socialID}`;
            userOneDTO.channelIcon = 'assets/images/channelicons/Youtube.svg';
          } else {
            userOneDTO.authorLink = `"http://www.youtube.com/watch?v=${mention.socialID}`;
            userOneDTO.channelIcon = 'assets/images/channelicons/Youtube.svg';
          }
          userOneDTO.authorName = mention.author.name;
          userOneDTO.ticketId = String(mention.ticketID);
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming =
          //   this._locobuzzmentionService.calculateTicketTimes(mention);

          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;

          if (mention.mediaType === MediaEnum.VIDEO) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                const YoutubeVideoID = MediaContentItem.mediaUrl.split('=');
                const VideoID = YoutubeVideoID[YoutubeVideoID.length - 1];

                userOneDTO.iframeUrl.push(
                  `https://www.youtube.com/embed/${VideoID}?rel=0`
                );
              }
            }
          }
        } else if (mention.channelGroup === ChannelGroup.WhatsApp) {
          userOneDTO.channelGroup = ChannelGroup.WhatsApp;
          userOneDTO.messageText = 'Whatsapp Message';
          userOneDTO.channelIcon = `assets/images/channelicons/WhatsApp.png`;

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }

          userOneDTO.authorName = mention.author.name;
          userOneDTO.ticketId = String(mention.ticketID);
          userOneDTO.ticketTiming = { timetoshow: '' };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming =
          //   this._locobuzzmentionService.calculateTicketTimes(mention);

          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;
          if (mention.mediaType === MediaEnum.IMAGE) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
                userOneDTO.imageurls.push(backgroundUrl);
              }
            }
          } else if (mention.mediaType === MediaEnum.VIDEO) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
                const vidurl: VideoUrl = {};
                vidurl.fileUrl = backgroundUrl;
                vidurl.thumbUrl = backgroundUrl;
                userOneDTO.videoUrls.push(vidurl);
              }
            }
          } else if (mention.mediaType === MediaEnum.AUDIO) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
                const audurl: AudioUrl = {};
                audurl.fileUrl = backgroundUrl;
                audurl.thumbUrl = backgroundUrl;
                userOneDTO.audioUrls.push(audurl);
              }
            }
          } else if (mention.mediaType === MediaEnum.PDF) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/pdf.png';
                userOneDTO.documentUrls.push(docurl);
              }
            }
          } else if (mention.mediaType === MediaEnum.DOC) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/word.png';
                userOneDTO.documentUrls.push(docurl);
              }
            }
          } else if (mention.mediaType === MediaEnum.EXCEL) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/excel-file.png';
                userOneDTO.documentUrls.push(docurl);
              }
            }
          } else if (mention.mediaType === MediaEnum.URL) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                if (
                  MediaContentItem.mediaUrl &&
                  (MediaContentItem.mediaUrl.includes('.png') ||
                    MediaContentItem.mediaUrl.includes('.jpeg') ||
                    MediaContentItem.mediaUrl.includes('.gif'))
                ) {
                  userOneDTO.imageurls.push(MediaContentItem.mediaUrl);
                } else {
                  if (MediaContentItem.mediaUrl) {
                    userOneDTO.imageurls.push(MediaContentItem.mediaUrl);
                  }
                }
              }
            }
          } else if (
            mention.mediaType === MediaEnum.OTHER ||
            mention.mediaType === MediaEnum.HTML
          ) {
            if (
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                ?.mediaContents) {
                if (
                  MediaContentItem.mediaUrl &&
                  (MediaContentItem.mediaUrl.includes('.png') ||
                    MediaContentItem.mediaUrl.includes('.jpeg') ||
                    MediaContentItem.mediaUrl.includes('.gif'))
                ) {
                  const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                  userOneDTO.imageurls.push(backgroundUrl);
                } else if (
                  MediaContentItem.mediaUrl &&
                  MediaContentItem.mediaUrl.includes('.mp4')
                ) {
                  const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                  const vidurl: VideoUrl = {};
                  vidurl.fileUrl = backgroundUrl;
                  vidurl.thumbUrl = backgroundUrl;
                  userOneDTO.imageurls.push(backgroundUrl);
                } else if (
                  MediaContentItem.mediaUrl &&
                  MediaContentItem.mediaUrl.includes('.mp3')
                ) {
                  const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                  const audurl: AudioUrl = {};
                  audurl.fileUrl = backgroundUrl;
                  audurl.thumbUrl = backgroundUrl;
                  userOneDTO.audioUrls.push(audurl);
                } else if (MediaContentItem.mediaUrl) {
                  if (MediaContentItem.mediaUrl.includes('.pdf')) {
                    const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                    const docurl: DocumentUrl = {};
                    docurl.fileUrl = backgroundUrl;
                    docurl.thumbUrl = 'assets/images/common/pdf.png';
                    userOneDTO.documentUrls.push(docurl);
                  } else if (
                    MediaContentItem.mediaUrl.includes('.doc') ||
                    MediaContentItem.mediaUrl.includes('.docx')
                  ) {
                    const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
                    const docurl: DocumentUrl = {};
                    docurl.fileUrl = backgroundUrl;
                    docurl.thumbUrl = 'assets/images/common/word.png';
                    userOneDTO.documentUrls.push(docurl);
                  } else if (
                    MediaContentItem.mediaUrl.includes('.xls') ||
                    MediaContentItem.mediaUrl.includes('.xlsx')
                  ) {
                    const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                    const docurl: DocumentUrl = {};
                    docurl.fileUrl = backgroundUrl;
                    docurl.thumbUrl = 'assets/images/common/excel-file.png';
                    userOneDTO.documentUrls.push(docurl);
                  } else {
                    const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                    userOneDTO.imageurls.push(backgroundUrl);
                  }
                } else {
                  if (MediaContentItem.mediaUrl) {
                    const backgroundUrl = `${this.MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                    userOneDTO.imageurls.push(backgroundUrl);
                  }
                }
              }
            }
          }
        } else if (mention.channelGroup === ChannelGroup.LinkedIn) {
          userOneDTO.channelGroup = ChannelGroup.LinkedIn;
          userOneDTO.messageText = 'Post on LinkedIn';
          userOneDTO.channelIcon = `assets/images/channel-logos/linkedin.svg`;

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }
          if (mention.parentPostSocialID) {
            try {
              userOneDTO.authorLink = `https://www.linkedin.com/feed/update/${
                mention.parentPostSocialID.split('-')[2]
              }`;
            } catch (exception) {
              const LinkedInDetails = mention.parentPostSocialID.split('-');
              const LinkedInParentPostSocialID =
                LinkedInDetails.length === 3
                  ? LinkedInDetails[2]
                  : LinkedInDetails.length === 2
                  ? LinkedInDetails[1]
                  : LinkedInDetails.length === 1
                  ? LinkedInDetails[0]
                  : '';
              userOneDTO.authorLink = `https://www.linkedin.com/feed/update/${LinkedInParentPostSocialID}`;
            }
          } else {
            try {
              userOneDTO.authorLink = `https://www.linkedin.com/feed/update/${
                mention.socialID.split('-')[2]
              }`;
            } catch (exception) {
              const LinkedInDetails = mention.socialID.split('-');
              const LinkedInSocialID =
                LinkedInDetails.length === 3
                  ? LinkedInDetails[2]
                  : LinkedInDetails.length === 2
                  ? LinkedInDetails[1]
                  : LinkedInDetails.length === 1
                  ? LinkedInDetails[0]
                  : '';
              userOneDTO.authorLink = `https://www.linkedin.com/feed/update/${LinkedInSocialID}`;
            }
          }

          userOneDTO.authorName = mention.author.name;
          userOneDTO.ticketId = String(mention.ticketID);
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming =
          //   this._locobuzzmentionService.calculateTicketTimes(mention);

          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;
        } else if (mention.channelGroup === ChannelGroup.GoogleMyReview) {
          userOneDTO.channelGroup = ChannelGroup.GoogleMyReview;
          if (mention.channelType === ChannelType.GMBQuestion) {
            userOneDTO.channelIcon =
              'assets/images/channelicons/GMBQuestion.png';
          } else if (mention.channelType === ChannelType.GMBAnswers) {
            userOneDTO.channelIcon = 'assets/images/channelicons/GMBAnswer.svg';
          } else {
            userOneDTO.channelIcon =
              'assets/images/channelicons/GoogleMyReview.png';
          }

          userOneDTO.messageText = 'Post on Google my Review';

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }

          userOneDTO.authorLink = mention.url;

          userOneDTO.authorName = mention.author.name;
          userOneDTO.ticketId = String(mention.ticketID);
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming =
          //   this._locobuzzmentionService.calculateTicketTimes(mention);

          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;
        } else if (mention.channelGroup === ChannelGroup.WebsiteChatBot) {
          userOneDTO.channelGroup = ChannelGroup.WebsiteChatBot;
          userOneDTO.channelIcon =
            'assets/images/channelicons/WebsiteChatBot.svg';
          if (mention.channelType === ChannelType.FacebookChatbot) {
            userOneDTO.messageText = 'Facebook Posts';
          } else if (mention.channelType === ChannelType.WhatsAppChatbot) {
            userOneDTO.messageText = 'Whatsapp Posts';
          } else if (mention.channelType === ChannelType.LineChatbot) {
            userOneDTO.messageText = 'Line Posts';
          } else if (mention.channelType === ChannelType.WesiteChatbot) {
            userOneDTO.messageText = 'Website Posts';
          } else if (mention.channelType === ChannelType.IOSChatbot) {
            userOneDTO.messageText = 'IOS Posts';
          } else if (mention.channelType === ChannelType.AndroidChatbot) {
            userOneDTO.messageText = 'Android Posts';
          }
          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }

          userOneDTO.authorName = mention.author.name;
          userOneDTO.ticketId = String(mention.ticketID);
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();
          // userOneDTO.ticketTiming =
          //   this._locobuzzmentionService.calculateTicketTimes(mention);

          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;
          let messagetext = '';

          {
            const error = '';
            let data = null;
            if (
              mention.messageType !== 'text' &&
              mention?.attachmentMetadata?.mediaContents &&
              mention?.attachmentMetadata?.mediaContents.length > 0
            ) {
              for (const media of mention?.attachmentMetadata?.mediaContents) {
                messagetext = media.name;
                if (mention.isBrandPost) {
                  if (this.isJSON(messagetext)) {
                    data = JSON.parse(messagetext);
                    // load bot data
                    // messagetext = BotInboxMessageDetails.MessageLoader(data);
                  } else {
                    if (media.mediaType === MediaEnum.IMAGE) {
                      userOneDTO.imageurls.push(messagetext);
                    } else if (media.mediaType === MediaEnum.VIDEO) {
                      const vidurl: VideoUrl = {};
                      vidurl.fileUrl = messagetext;
                      vidurl.thumbUrl = messagetext;
                      userOneDTO.imageurls.push(messagetext);
                    } else if (
                      media.mediaType === MediaEnum.EXCEL ||
                      media.mediaType === MediaEnum.DOC ||
                      media.mediaType === MediaEnum.PDF ||
                      media.mediaType === MediaEnum.FILE ||
                      media.mediaType === MediaEnum.OTHER
                    ) {
                      let name = '';
                      try {
                        name = messagetext;
                      } catch (Exception) {}
                      const docurl: DocumentUrl = {};
                      docurl.fileUrl = messagetext;
                      docurl.thumbUrl =
                        'assets/images/common/attachement-blured.png';
                      userOneDTO.documentUrls.push(docurl);
                    } else if (messagetext === 'get_started_ping') {
                      messagetext = 'Get Started';
                    } else {
                      messagetext = messagetext;
                    }
                  }
                } else {
                  if (this.isJSON(messagetext)) {
                    // load chatbot messages media
                    // data = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(messagetext);
                    // messagetext = BotInboxMessageDetails.MessageLoader(data);
                  } else {
                    if (media.mediaType === MediaEnum.IMAGE) {
                      userOneDTO.imageurls.push(messagetext);
                    } else if (media.mediaType === MediaEnum.VIDEO) {
                      const vidurl: VideoUrl = {};
                      vidurl.fileUrl = messagetext;
                      vidurl.thumbUrl = messagetext;
                      userOneDTO.videoUrls.push(vidurl);
                    } else if (
                      media.mediaType === MediaEnum.EXCEL ||
                      media.mediaType === MediaEnum.DOC ||
                      media.mediaType === MediaEnum.PDF ||
                      media.mediaType === MediaEnum.FILE ||
                      media.mediaType === MediaEnum.OTHER
                    ) {
                      let name = '';
                      try {
                        name = messagetext;
                      } catch (Exception) {}
                      const docurl: DocumentUrl = {};
                      docurl.fileUrl = messagetext;
                      docurl.thumbUrl =
                        'assets/images/common/attachement-blured.png';
                      userOneDTO.documentUrls.push(docurl);
                    } else if (messagetext === 'get_started_ping') {
                      messagetext = 'Get Started';
                    } else {
                      messagetext = messagetext;
                    }
                  }
                }
              }
            } else {
            }
          }

          if (messagetext && messagetext.length > 1) {
            userOneDTO.mentionDescription = messagetext;
          }
        } else if (mention.channelGroup === ChannelGroup.Voice) {
          userOneDTO.channelGroup = ChannelGroup.Voice;
          mention.description = mention.title
          userOneDTO.channelIcon = this._locobuzzmentionService.getChannelIcon(
            mention
          );  
          userOneDTO.messageText = 'Voice';

          if (mention.author.picUrl) {
            if (mention.author.picUrl.includes('s3.amazonaws.com')) {
              userOneDTO.userProfile = mention.author.picUrl;
            }
          } else {
            userOneDTO.userProfile =
              'assets/images/agentimages/sample-image.svg';
          }

          userOneDTO.authorName = mention.author.name;
          userOneDTO.ticketId = String(mention.ticketID);
          userOneDTO.ticketTiming = { timetoshow: null };
          userOneDTO.ticketTiming.timetoshow = moment(mention.mentionTime)
            .add('minutes', -timeOffset)
            .local()
            .fromNow();

          userOneDTO.description = mention.description;
          userOneDTO.mentionDescription = mention.title
            ? mention.title
            : mention.description;

          // Handle Voice audio URLs
          if (
            mention?.attachmentMetadata?.mediaContents &&
            mention?.attachmentMetadata?.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              ?.mediaContents) {
              if (MediaContentItem.mediaType === MediaEnum.AUDIO) {
                const audurl: AudioUrl = {};
                audurl.fileUrl = MediaContentItem.mediaUrl;
                audurl.thumbUrl = MediaContentItem.thumbUrl || MediaContentItem.mediaUrl;
                userOneDTO.audioUrls.push(audurl);
              }
            }
          }
        }
        this.userOneViewDTO.push(userOneDTO);
      }
    }

    return this.userOneViewDTO;
  }

  isJSON(val: any): boolean {
    if (typeof val !== 'string') {
      val = JSON.stringify(val);
    }

    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }
}

