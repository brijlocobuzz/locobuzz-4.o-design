import { BrandList } from './../../shared/components/filter/filter-models/brandlist.model';
import { ChannelImage } from 'app/core/enums/ChannelImgEnum';
import { ChatActionEnum } from 'app/core/enums/ChatActionEnum';
import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone, ElementRef, Inject, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LocobuzzUtils } from '@locobuzz/utils';
import {
  ActionStatusEnum,
  ClientStatusEnum,
} from 'app/core/enums/ActionStatus';
import { ActionTaken } from 'app/core/enums/ActionTakenEnum';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { MakerCheckerEnum } from 'app/core/enums/MakerCheckerEnum';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { PostActionType } from 'app/core/enums/PostActionType';
import { TicketSignalEnum } from 'app/core/enums/TicketSignalEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseSocialAccountConfiguration } from 'app/core/models/accountconfigurations/BaseSocialAccountConfiguration';
import { TicketsCommunicationLog } from 'app/core/models/dbmodel/TicketReplyDTO';
import { ReplyTimeExpire } from 'app/core/models/viewmodel/ReplyInputParams';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { environment } from 'environments/environment';
import moment from 'moment';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { map, take, takeUntil } from 'rxjs/operators';
import {
  ChatWindowDetails,
  ChatWindowresponse,
  filterData,
  GetBotSequence,
  mediaObj,
  StreamState,
} from '../../core/models/viewmodel/ChatWindowDetails';
import { BaseMention } from './../../core/models/mentions/locobuzz/BaseMention';
import { AttachmentMetadata } from './../../core/models/viewmodel/AttachmentMetadata';
import {
  ChannelInterface,
  ChatItem,
  ChatItemResponse,
  Chatlog,
  ChatWindowProfiles,
} from './../../core/models/viewmodel/ChatWindowDetails';
import { MediaContent } from './../../core/models/viewmodel/MediaContent';
import { DOCUMENT } from '@angular/common';
import { LogStatus } from 'app/core/enums/LogStatus';
import { MimeTypes } from 'app/core/models/viewmodel/MimeTypes';
import { WhatsAppMessageStatus } from 'app/core/enums/WhatsAppMessageStatus';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { DomSanitizer } from '@angular/platform-browser';
import { LinkStatusEnum } from 'app/core/enums/LinkStatusEnum';
import { CrmType } from 'app/core/enums/CrmEnum';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseReply } from 'app/core/models/viewmodel/PerformActionParameters';
import { TicketsService } from './tickets.service';
import { LocalStorageService } from './local-storage.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class ChatBotService {
  // currentUser: AuthUser;
  chatBoatReplayUpdate: Subject<any> = new Subject();
  constructor(
    private _filterService: FilterService,
    private _httpClient: HttpClient,
    private _replyService: ReplyService,
    private _ticketSignalrService: TicketsignalrService,
    private _ticketService: TicketsService,
    private _snackBar: MatSnackBar,
    private _accountService: AccountService,
    private _mapLocobuzzEntity: MaplocobuzzentitiesService,
    private _ngZone: NgZone,
    private _sanitizer: DomSanitizer,
    private localStorageService: LocalStorageService,
    private translate: TranslateService,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.onChatsRecieved = new Subject();
  }
  // objBrandSocialAcount: BaseSocialAccountConfiguration[];
  chatbotSignalRSubscription: Subscription;
  // quickReplies: object;
  public chatbotStatus: boolean = false;
  // private filterParams;
  chatObj: Array<ChatWindowDetails> = [];
  chattotalCount: number = 0;
  usertotalCount: number = 0;

  chatExpiredStatus: BehaviorSubject<ReplyTimeExpire> = new BehaviorSubject(
    null
  );
  onChatsRecieved: Subject<boolean>;
  // dataCount: Array<any> = [];
  chatdialogOpen = false;
  chatAudio = new Audio('assets/audio/chat-notification.mp3');
  assignAudio = new Audio('assets/audio/assign-notification.mp3');
  onChatUpdate: BehaviorSubject<{
    action: number;
    channelIndex?: number;
    authorIndex?: number;
    ticketIndex?: number;
    isBrandPost?: boolean;
  }> = new BehaviorSubject(null);
  audioEvents = [
    'ended',
    'error',
    'play',
    'playing',
    'pause',
    'timeupdate',
    'canplay',
    'loadedmetadata',
    'loadstart',
  ];

  private stop$ = new Subject();
  private audioObj = new Audio();
  public lazyLoadCount = 10;
  lazyLoadPagination = {
    from: 1,
    to: this.lazyLoadCount,
    endDateEpoch: null,
  };
  chatType: { chat: string[]; log: string } = {
    chat: [
      'LocobuzzNG.Entities.Classes.Mentions.WebsiteChatbotMention',
      'LocobuzzNG.Entities.Classes.Mentions.WhatsAppMention',
      'LocobuzzNG.Entities.Classes.Mentions.FacebookMention',
      'LocobuzzNG.Entities.Classes.Mentions.InstagramMention',
      'LocobuzzNG.Entities.Classes.Mentions.GoogleBusinessMessagesMention'
    ],
    log: 'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog',
  };

  onChatsRemove = new Subject();

  sentChatData: {
    channelIndex?: number;
    userIndex?: number;
    ticketIndex?: number;
    mentionIndex?: number;
    chatGroupIndex?: number;
    chatItemIndex?: number;
  }[] = [];

  channelID = 2;
  activeUser: number = -1;
  activeChannel: number = 0;
  activeTicket: number = -1;
  selectedBaseMention: BaseMention;
  tabActiveChange: Subject<[string, number]> = new Subject<[string, number]>();
  // chatPosition: Subject<any> = new Subject<any>();
  chatPositionSignal = signal<any>(null);

  chatbotHide: boolean = false;
  selectedBrandList: Array<BrandList>;
  chatSound = false;

  // chatBotHideObs: Subject<{ status: boolean; pageType?: number }> =
  //   new Subject<{
  //     status: boolean;
  //     pageType?: number;
  //   }>();
  chatBotHideObsSignal = signal<{
      status?: boolean;
      pageType?: number;
    }>(null);
  allChannels: Array<ChannelInterface> = [
    {
      name: 'Website',
      image: ChannelImage.WebsiteChatBot,
      channelId: ChannelGroup.WebsiteChatBot,
    },
    {
      name: 'Whatsapp',
      image: ChannelImage.WhatsApp,
      channelId: ChannelGroup.WhatsApp,
    },
    {
      name: 'Messenger',
      image: ChannelImage.Messenger,
      channelId: ChannelGroup.Facebook,
    },
    {
      name: 'Messenger',
      image: ChannelImage.InstaDM,
      channelId: ChannelGroup.Instagram,
    },
    {
      name: 'GMB',
      image: ChannelImage.GBM,
      channelId: ChannelGroup.GoogleBusinessMessages,
    },
    {
      name: 'Telegram',
      image: ChannelImage.Telegram,
      channelId: ChannelGroup.Telegram,
    },
  ];
  layout;
  sequenceData = [
    ChannelGroup.Facebook,
    ChannelGroup.Instagram,
    ChannelGroup.WhatsApp,
    ChannelGroup.WebsiteChatBot,
    ChannelGroup.GoogleBusinessMessages,
    ChannelGroup.Telegram,
  ];

  channelIcon = [
    {
      name: 'Website',
      image: ChannelImage.WhatsApp,
      channelId: ChannelGroup.WebsiteChatBot,
      channelType: ChannelType.WhatsAppChatbot,
    },
    {
      name: 'Website',
      image: ChannelImage.Messenger,
      channelId: ChannelGroup.WebsiteChatBot,
      channelType: ChannelType.FacebookChatbot,
    },
    {
      name: 'Website',
      image: ChannelImage.WebsiteChatBot,
      channelId: ChannelGroup.WebsiteChatBot,
      channelType: ChannelType.WesiteChatbot,
    },
  ];
  channels: Array<ChannelInterface> = [];

  channelIds = [];
  private state: StreamState = {
    playing: false,
    readableCurrentTime: '',
    readableDuration: '',
    duration: undefined,
    currentTime: undefined,
    canplay: false,
    error: false,
  };
  private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(
    this.state
  );

  getIndex(
    channelGroup?: number,
    socialID?: string,
    brandID?: number,
    ticketID?: number
  ): {
    channelIndex: number;
    authorIndex: number;
    ticketIndex: number;
  } {
    let channelIndex;
    if (this.layout !== 2) {
      channelIndex = channelGroup
        ? this.chatObj.findIndex(
            (channelItem) => channelItem.channelgroupid === channelGroup
          )
        : -1;
    } else {
      channelIndex = 0;
    }
    const authorIndex =
      channelIndex >= 0 && socialID && brandID
        ? this.chatObj[channelIndex].userProfiles.findIndex(
            (userItem) =>
              socialID === userItem?.authorSocialID &&
              +brandID === +userItem?.brandID
          )
        : -1;
    const ticketIndex =
      channelIndex >= 0 && authorIndex >= 0 && ticketID
        ? this.chatObj[channelIndex].userProfiles[
            authorIndex
          ].openTickets.findIndex(
            (ticketItem) => ticketItem.ticketID === ticketID
          )
        : -1;
    return {
      channelIndex,
      authorIndex,
      ticketIndex,
    };
  }

  fetchAndPopulateChatProfiles(
    filterParams: filterData,
    chatSequence: any,
    layout: number,
    chatSequenceChanged
  ): void {
    this.chatObj = [];
    this.channelIds = [];
    this.chattotalCount = 0;
    this.usertotalCount = 0;
    this.layout = layout;
    this.selectedBrandList = filterParams?.brandList;
    if (this.selectedBrandList.length > 0) {
      if (chatSequence) {
        for (let i = 1; i <= 5; i++) {
          const seq = Object.keys(chatSequence).find(
            (key) => chatSequence[key] === i
          );
          let val;
          if (seq === 'WhatsappSequence') {
            this.sequenceData[i - 1] = ChannelGroup.WhatsApp;
            this.chatType.chat[i - 1] =
              'LocobuzzNG.Entities.Classes.Mentions.WhatsAppMention';
            val = ChannelGroup.WhatsApp;
          } else if (seq === 'InstagramSequence') {
            this.sequenceData[i - 1] = ChannelGroup.Instagram;
            this.chatType.chat[i - 1] =
              'LocobuzzNG.Entities.Classes.Mentions.InstagramMention';
            val = ChannelGroup.Instagram;
          } else if (seq === 'MessengerSequence') {
            this.sequenceData[i - 1] = ChannelGroup.Facebook;
            this.chatType.chat[i - 1] =
              'LocobuzzNG.Entities.Classes.Mentions.FacebookMention';
            val = ChannelGroup.Facebook;
          } else if (seq === 'BotSequence') {
            this.sequenceData[i - 1] = ChannelGroup.WebsiteChatBot;
            this.chatType.chat[i - 1] =
              'LocobuzzNG.Entities.Classes.Mentions.WebsiteChatbotMention';
            val = ChannelGroup.WebsiteChatBot;
          }
          else if (seq === 'GMBSequence') {
            this.sequenceData[i - 1] = ChannelGroup.GoogleBusinessMessages;
            this.chatType.chat[i - 1] =
              'LocobuzzNG.Entities.Classes.Mentions.GoogleBusinessMessagesMention';
            val = ChannelGroup.GoogleBusinessMessages;
          }
          else if (seq === 'TelegramSequence') {
            this.sequenceData[i - 1] = ChannelGroup.Telegram;
            this.chatType.chat[i - 1] =
              'LocobuzzNG.Entities.Classes.Mentions.TelegramMention';
            val = ChannelGroup.Telegram;
          }
          if (this.layout !== 2 && val) {
            let data = this.allChannels.findIndex(
              (item) => +item.channelId === +val
            );
            this.channels[i - 1] = this.allChannels[data];
          }
        }
        // if (this.layout !== 2) {
        this.channels = (
          this.channels.length > 0 ? this.channels : this.allChannels
        ).filter(
          (channel) =>
            filterParams.channelWise[
              filterParams.channelWise.findIndex(
                (item) => item.channelGroupId === channel?.channelId
              )
            ]?.status
        );
      }
      // }

      if (this.layout !== 2) {
        this.chatType.chat =[];
        for (const channel of this.channels) {
          let chatTypevVal= ''
          switch (channel?.channelId){
            case ChannelGroup.WhatsApp:
              chatTypevVal = 'LocobuzzNG.Entities.Classes.Mentions.WhatsAppMention';
              break;
            case ChannelGroup.Facebook:
              chatTypevVal = 'LocobuzzNG.Entities.Classes.Mentions.FacebookMention';
              break;
            case ChannelGroup.Instagram:
              chatTypevVal = 'LocobuzzNG.Entities.Classes.Mentions.InstagramMention';
              break;
            case ChannelGroup.WebsiteChatBot:
              chatTypevVal = 'LocobuzzNG.Entities.Classes.Mentions.WebsiteChatbotMention';
              break;
            case ChannelGroup.GoogleBusinessMessages:
              chatTypevVal = 'LocobuzzNG.Entities.Classes.Mentions.GoogleBusinessMessagesMention';
              break;
            case ChannelGroup.Telegram:
              chatTypevVal = 'LocobuzzNG.Entities.Classes.Mentions.TelegramMention';
              break;
          }
          this.chatType.chat.push(chatTypevVal);
          this.channelIds.push(channel?.channelId);
          this.chatObj.push({
            channelgroupid: channel?.channelId,
            totalCount: 0,
            userProfiles: [],
          });
        }
      } else {
        this.channelIds = this.channels.map((channel) => channel?.channelId);
        this.chatObj.push({
          channelgroupid: ChannelGroup.NoChannel,
          totalCount: 0,
          userProfiles: [],
        });
      }
      if(this.channelIds && this.channelIds?.length > 0){
          this.getTotalCount()
            .pipe(take(1))
            .subscribe((response) => {
              if (response && response.success) {
                this.chattotalCount = response.data;
              }
            });

          this.getChatProfiles(filterParams)
            .pipe(take(1))
            .subscribe(
              (response) => {
                if (response) {
                  let chatItemIndex;
                  for (let i in this.chatObj) {
                    this.chatObj[i].userProfiles = [];
                  }
                  this.usertotalCount = 0;
                  response.userProfiles.forEach((author) => {
                    const brandIndex = this.selectedBrandList.findIndex(
                      (item) => +item.brandID === +author.brandID
                    );
                    const botEnable = this.selectedBrandList[brandIndex]?.botEnable;
                    if (
                      author?.channelGroup === ChannelGroup.WebsiteChatBot &&
                      !botEnable.showWebsiteBot
                    ) {
                      return;
                    } else if (
                      author?.channelGroup === ChannelGroup.WhatsApp &&
                      !botEnable.showWhatsapp
                    ) {
                      return;
                    } else if (
                      author?.channelGroup === ChannelGroup.Facebook &&
                      !botEnable.showMessenger
                    ) {
                      return;
                    } else if (
                      author?.channelGroup === ChannelGroup.Instagram &&
                      !botEnable.showInstagram
                    ) {
                      return;
                    }
                    else if (
                      author?.channelGroup === ChannelGroup.GoogleBusinessMessages &&
                      !botEnable.showGMB
                    ) {
                      return;
                    }
                    else if (
                      author?.channelGroup === ChannelGroup.Telegram &&
                      !botEnable.showTelegram
                    ) {
                      return;
                    }
                    const indices = this.getIndex(
                      author.channelgroupid,
                      author.authorSocialID,
                      +author.brandID
                    );
                    chatItemIndex = indices.channelIndex;
                    let authorIndex;
    
                    if (chatItemIndex >= 0) {
                      authorIndex = indices.authorIndex;
                    }
                    if (brandIndex >= 0) {

                      const assigntedTickets:any[] = JSON.parse(localStorage.getItem('assigntedTickets') || '[]') || [];
                      if (assigntedTickets?.length > 0) {
                        for (const tickets of assigntedTickets) {
                          if (author?.openTickets.some((item) => item?.ticketInfo?.ticketID == tickets)) {
                            author.newUserText = "New"
                            this.chatObj[chatItemIndex].newUserFlag = true
                          }
                        }
                      }

                      this.chatObj[chatItemIndex]?.userProfiles.push(author);
                      this.usertotalCount += 1;
                    }
                  });
                  if (this.layout === 2) {
                    let sortChat = [];
                    this.sequenceData.forEach((value) => {
                      let authorData = this.chatObj[
                        chatItemIndex
                      ]?.userProfiles.filter((obj) => obj.channelgroupid === value);
                      if (authorData) {
                        sortChat.push(...authorData);
                      }
                    });
                    if (sortChat.length > 0) {
                      this.chatObj = [
                        {
                          channelgroupid: ChannelGroup.NoChannel,
                          totalCount: 0,
                          userProfiles: [],
                        },
                      ];
                      this.chatObj[0].userProfiles = sortChat;
                    }
                  }
    
                  this.onChatsRecieved.next(true);
                } else {
                  this.onChatsRecieved.next(false);
                }
              },
              (error) => {
                this.onChatsRecieved.next(false);
              }
            );
        }
    }
  }

  attachChatLog(basementions): {
    channelIndex: number;
    authorIndex: number;
    ticketIndex: number;
  } {
    let selectedBaseMention;
    if (basementions.length > 0) {
      const recievedMentions = basementions.filter(
        (mention) => mention.isBrandPost === false
      );
      selectedBaseMention = recievedMentions[0];
    }
    const indices = this.getIndex(
      selectedBaseMention.channelGroup,
      selectedBaseMention?.author?.socialId,
      +selectedBaseMention?.brandInfo?.brandID,
      selectedBaseMention.ticketID
    );
    let channelIndex;
    channelIndex = indices.channelIndex;
    let authorIndex = -1;
    let ticketIndex = -1;
    const chatsArray = this.structureChatLog(
      basementions,
      selectedBaseMention.channelGroup
    );
    if (channelIndex >= 0) {
      authorIndex = indices.authorIndex;
      if (authorIndex >= 0) {
        ticketIndex = indices.ticketIndex;
        if (ticketIndex >= 0) {
          this.chatObj[channelIndex].userProfiles[authorIndex].openTickets[
            ticketIndex
          ].selectedMention = selectedBaseMention;
          this.chatObj[channelIndex].userProfiles[authorIndex].openTickets[
            ticketIndex
          ].mentions = basementions;
          this.chatObj[channelIndex].userProfiles[authorIndex].openTickets[
            ticketIndex
          ].chats = chatsArray;
          // console.log('onChatUpdate => AddChats emmited');
          this.onChatUpdate.next({
            action: ChatActionEnum.AddChats,
            channelIndex,
            authorIndex,
            ticketIndex,
          });
        }
      }
    }
    return {
      channelIndex,
      authorIndex,
      ticketIndex,
    };
  }

  changeTab(type: string, value: number): void {
    if (type === 'channel') {
      this.activeChannel = value;
    } else if (type === 'user') {
      this.activeUser = value;
    } else if (type === 'ticket') {
      this.activeTicket = value;
    }
    this.tabActiveChange.next([type, value]);
  }

  updateChatCount(
    channelIndex: number = 0,
    userIndex: number = -1,
    ticketIndex: number = -1,
    updateAll = true,
    decrementNotification = false,
    removeCount = 1
  ): void {
    let userToUpdate: ChatWindowProfiles;
    let channelToUpdate: ChatWindowDetails;
    let ticketToUpdate: BaseMention;
    let avoidNotifyOnActive =
      channelIndex === this.activeChannel &&
      userIndex === this.activeUser &&
      ticketIndex === this.activeTicket;
    if (updateAll) {
      this.chatObj.forEach((chatItem) => {
        chatItem.userProfiles.forEach((user) => {
          user.notificationCount = user.openTickets.reduce(
            (intialTicket, nextTicket) =>
              intialTicket + (nextTicket.count || 0),
            0
          );
          chatItem.notification = chatItem.userProfiles.reduce(
            (intialProfile, nextProfile) =>
              intialProfile + (nextProfile.notificationCount || 0),
            0
          );
        });

        this.chattotalCount =
          this.chattotalCount + (chatItem.notification || 0);
      });
    } else if (channelIndex >= 0) {
      channelToUpdate = this.chatObj[channelIndex];
      if (userIndex >= 0) {
        userToUpdate = channelToUpdate?.userProfiles[userIndex];
      }

      if (ticketIndex >= 0) {
        ticketToUpdate = userToUpdate?.openTickets[ticketIndex];
      }

      if (decrementNotification) {
        if (channelToUpdate) {
          channelToUpdate.notification -= removeCount;
        }

        if (ticketToUpdate) {
          ticketToUpdate.count -= removeCount;
        }

        if (userToUpdate) {
          userToUpdate.notificationCount -= removeCount;
        }

        this.chattotalCount -= removeCount;

        if (this.chattotalCount < 0) {
          this.chattotalCount = 0;
        }

        if (ticketToUpdate?.count < 0) {
          ticketToUpdate.count = 0;
        }

        if (userToUpdate?.notificationCount < 0) {
          userToUpdate.notificationCount = 0;
        }

        if (channelToUpdate?.notification < 0) {
          channelToUpdate.notification = 0;
        }
        this.checkMessageRead(ticketToUpdate.ticketID)
          .pipe(take(1))
          .subscribe();
      } else {
        if (
          !this.document.hasFocus() ||
          !this.chatdialogOpen ||
          !avoidNotifyOnActive
        ) {
          if (channelToUpdate) {
            if (!channelToUpdate?.notification) {
              channelToUpdate.notification = 0;
            }
            channelToUpdate.notification++;
          }
          if (userIndex >= 0) {
            if (!userToUpdate?.notificationCount) {
              userToUpdate.notificationCount = 0;
            }
            userToUpdate.notificationCount++;
            if (ticketIndex >= 0) {
              if (!ticketToUpdate?.count) {
                ticketToUpdate.count = 0;
              }
              ticketToUpdate.count++;
            }
          }
          if (this.chatSound) {
            this.chatAudio.play();
            this.chatSound = false;
          } else {
            this.assignAudio.play();
          }

          this.chattotalCount++;
        } else {
          this.checkMessageRead(ticketToUpdate.ticketID)
            .pipe(take(1))
            .subscribe();
        }
      }
    }
  }

  updateNewUserText(channelIndex: number = 0,
    userIndex: number = -1,
    ticketIndex: number = -1,
    remove= false){
    let userToUpdate: ChatWindowProfiles;
    let channelToUpdate: ChatWindowDetails;
    channelToUpdate = this.chatObj[channelIndex];
    if (userIndex >= 0) {
      userToUpdate = channelToUpdate?.userProfiles[userIndex];
    }
    if(remove &&  userToUpdate.newUserText == 'New'){
      userToUpdate.newUserText = ''
    }else{
      userToUpdate.newUserText = 'New'
    }

  }

  assignRecentChats(userActiveIndex = null, ticketActiveIndex = null): void {
    if (
      this.chatObj[this.activeChannel]?.userProfiles &&
      this.chatObj[this.activeChannel].userProfiles.length > 0
    ) {
      for (const [index, userItem] of this.chatObj[
        this.activeChannel
      ]?.userProfiles.entries()) {
        // if (
        //   userActiveIndex !== null &&
        //   userActiveIndex >= 0 &&
        //   userActiveIndex !== index
        // ) {
        //   continue;
        // }

        if (
          !userItem.openTickets[ticketActiveIndex || this.activeTicket]
            ?.chats ||
          (userActiveIndex !== null && index !== userActiveIndex)
        ) {
          if (
            !userItem?.openTickets[ticketActiveIndex || this.activeTicket]?.chats
          ) {
            userItem.openTickets[
              ticketActiveIndex || this.activeTicket
            ].lastChat = '...';
          }
          // continue;
        }

        const chatGroupList = userItem?.openTickets[
          ticketActiveIndex || this.activeTicket
        ]?.chats
          ?.slice()
          ?.filter(
            (chatItem) => chatItem.concreteClassName !== this.chatType.log
          );
        let chatList: ChatItem[];
        if (chatGroupList?.length > 0) {
          for (const chatGroupItem of chatGroupList.reverse()) {
            if (chatGroupItem.concreteClassName !== this.chatType.log) {
              chatList = chatGroupItem.chats;
              break;
            }
          }
          const lastChatItem = chatList[chatList.length - 1];
          if (lastChatItem.description && lastChatItem.description !== '') {
            userItem.openTickets[
              ticketActiveIndex || this.activeTicket
            ].lastChat = lastChatItem.description;
          } else {
            userItem.openTickets[
              ticketActiveIndex || this.activeTicket
            ].lastChat =
              lastChatItem.attachments[
                lastChatItem.attachments.length - 1
              ].name;
          }
        }
      }
    }
  }

  // Groups chat items by time and when flag toggle between sender and reciever
  structureChatLog(
    responseChat: BaseMention[],
    channelGroup: number
  ): Array<Chatlog> {
    const chatlog: Array<Chatlog> = [];
    const selectedBrand = this.selectedBrandList?.find(x => x?.brandID == responseChat[0]?.brandInfo?.brandID)
    const isPhishingEnabled = selectedBrand?.isPhishingSiteEnabled
    const channelIndex = JSON.parse(localStorage.getItem('sfdcTicketView'))?0:this.channels.findIndex(
      (item) => item.channelId === channelGroup
    );
    let mentionStart = moment.utc(
      responseChat[responseChat.length - 1].mentionTime
    );
    let timediff = 0;
    let chats: ChatItem[] = [];
    let isBrand = responseChat[responseChat.length - 1].isBrandPost;
    // tslint:disable-next-line: prefer-for-of
    for (let i = responseChat.length; i--; ) {
      let attachmentObj: { [key: string]: any };
      let scanContentUrlList = responseChat[i]?.phishingJson ? JSON.parse(responseChat[i].phishingJson) : []

      var phishingurlexp = new RegExp(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gi);
      if (responseChat[i]?.description ) {
        const urlmatches = responseChat[i]?.description.match(phishingurlexp);
        if (urlmatches) {
          urlmatches.forEach((url) => scanContentUrlList.push(url))
        }
      }
      let scanContentFlag = isPhishingEnabled && responseChat[i]?.phishingStatus == LinkStatusEnum.Unscanned ? true : false;
      let noLinkFound = scanContentUrlList.some((obj) => obj.status == LinkStatusEnum.Nolink) || !isPhishingEnabled ? true : false;
      if (responseChat[i]?.channelGroup === ChannelGroup.NoChannel) {
        if (responseChat[i].channelType === ChannelType.WhatsApp) {
          responseChat[i].channelGroup = ChannelGroup.WhatsApp;
        } else if (responseChat[i]?.channelType === ChannelType.FBMessages) {
          responseChat[i].channelGroup = ChannelGroup.Facebook;
        } else if (
          responseChat[i]?.channelType === ChannelType.InstagramMessages
        ) {
          responseChat[i].channelGroup = ChannelGroup.Instagram;
        } else {
          responseChat[i].channelGroup = ChannelGroup.WebsiteChatBot;
        }
      }
      if (
        responseChat[i].channelGroup === ChannelGroup.Instagram ||
        responseChat[i].channelGroup === ChannelGroup.WhatsApp
      ) {
        if (
          responseChat[i]?.messageStatus === WhatsAppMessageStatus.Unsupported
        ) {
          responseChat[i].title = 'Unsupported file format';
        }
      }
      if (responseChat[i].channelGroup === ChannelGroup.Instagram && !responseChat[i].description) {
        responseChat[i].description = responseChat[i].title;
      }
      if (
        responseChat[i].channelGroup === ChannelGroup.WebsiteChatBot &&
        responseChat[i].description &&
        responseChat[i].description.includes('File upload: ')
      ) {
        const mediaArray = responseChat[i].description.split('File upload: ');
        if (mediaArray.length > 1) {
          responseChat[i].attachmentMetadata.mediaContents.push({
            mediaUrl: mediaArray[mediaArray.length - 1],
          });
          responseChat[i].description = '';
        }
      }
      timediff = moment
        .utc(responseChat[i].mentionTime)
        .diff(mentionStart, 'seconds');
      let media: mediaObj;
      if (
        responseChat[i].concreteClassName === this.chatType.chat[channelIndex] ||
        responseChat[i]?.concreteClassName === 'LocobuzzNG.Entities.Classes.Mentions.WebsiteChatbotMention'
      ) {
        if (responseChat[i].attachmentMetadata?.mediaContents?.length > 0) {
          responseChat[i].attachmentMetadata.mediaContents = this.setMedia(
            responseChat[i].attachmentMetadata?.mediaContents,
            responseChat[i].channelGroup,
            environment.MediaUrl
          );
        }
        const description = responseChat[i].description;
        media = this.mediaTypeLoader(
          responseChat[i].attachmentMetadata,
          responseChat[i].description,
          responseChat[i].messageType
        );
        if (
          description &&
          description !== '' &&
          LocobuzzUtils.isJSON(description)
        ) {
          const descObj = JSON.parse(description);
          if (descObj?.messaging_type === 'RESPONSE') {
            responseChat[i].description = descObj?.message?.text;
          }
        }
        if (description === 'get_started_ping') {
          responseChat[i].description = 'Get Started';
        }
        if (description === 'agent_chat_delay') {
          responseChat[i].description = 'Agent chats delayed';
        }
        if (description === 'intent_engage_0') {
          responseChat[i].description = 'Engage';
        }
        if (description === 'intent_trial') {
          responseChat[i].description = 'Trial';
        }
        if (description && description.trim() === '') {
          responseChat[i].description = responseChat[i].description.trim();
        }
        if (
         ( media.attachmentType === MediaEnum.CONTACT ||
            media.attachmentType === MediaEnum.IMAGE) && responseChat[i].channelGroup != ChannelGroup.Telegram
        ) {
          responseChat[i].description = '';
        }
      }
      let isLogAllowed;
      if (responseChat[i].concreteClassName === this.chatType.log) {
        isLogAllowed =
          responseChat[i].status === LogStatus.NotesAdded ||
          responseChat[i].status === LogStatus.ReplyApproved ||
          responseChat[i].status === LogStatus.ReplyRejected ||
          responseChat[i].status === LogStatus.Escalated ||
          responseChat[i].status === LogStatus.Closed ||
          responseChat[i].status === LogStatus.Approve;
      }
      if (
        timediff >= 60 ||
        (responseChat[i].concreteClassName !== this.chatType.log &&
          responseChat[i].isBrandPost !== isBrand) ||
        (responseChat[i].concreteClassName === this.chatType.log &&
          isLogAllowed) ||
        i === 0
      ) {
        if (responseChat.length === 1) {
          chats.push({
            concreteClassName: responseChat[i].concreteClassName,
            description: responseChat[i].description,
            messageStatus: responseChat[i].messageStatus,
            attachments:
              media && media.mediaContent ? media.mediaContent : null,
            attachmentsType:
              media && media.attachmentType ? media.attachmentType : null,
            mentionTime: responseChat[i].mentionTime,
            ticketId: responseChat[i].ticketInfo.ticketID,
            isBrandPost: responseChat[i].isBrandPost,
            isMessageSent: true,
            channelGroupId: responseChat[i]?.channelGroup,
            BrandID: responseChat[i].brandInfo.brandID,
            BrandName: responseChat[i].brandInfo.brandName,
            PageID: responseChat[i].fbPageID,
            tagID: responseChat[i].tagID,
            PostSocialID: responseChat[i].socialID,
            InreplyToStatusID: responseChat[i].inReplyToStatusId,
            isPhishingEnabled: isPhishingEnabled,
            noScanLinkFound: noLinkFound,
            emailContent: responseChat[i]?.emailContentHtml ? JSON.parse(responseChat[i].emailContentHtml) : null,
            scanLoader: false,
            strInReplyToStatusId: responseChat[i]?.strInReplyToStatusId,
            objectId: responseChat[i]?.objectId,
            attachmentObj,
            ...(responseChat[i].status === LogStatus.NotesAdded && { noteAttachment: responseChat[i]?.notesAttachmentMetadata?.mediaContents})
          });
        }
        if (chats.length > 0) {
          chatlog.push({
            concreteClassName: chats[chats.length - 1].concreteClassName,
            mentionTime: chats[chats.length - 1].mentionTime,
            channelGroupId: chats[chats.length - 1]?.channelGroupId,
            isBrandPost: chats[chats.length - 1].isBrandPost,
            messageStatus: chats[chats.length - 1]?.messageStatus,
            chats,
          });
          chats = [];
          mentionStart = moment.utc(responseChat[i].mentionTime);
          isBrand = responseChat[i].isBrandPost;
        }
      }

      if (responseChat[i].concreteClassName === this.chatType.log) {
        if (isLogAllowed) {
          chatlog.push({
            concreteClassName: responseChat[i].concreteClassName,
            messageStatus: chats[chats.length - 1]?.messageStatus,
            channelGroupId: chats[chats.length - 1]?.channelGroupId,
            mentionTime: responseChat[i].mentionTime,
            logText: responseChat[i].logText,
            note: responseChat[i].note,
            status: responseChat[i].status,
            ticketID: responseChat[i].ticketID,
            ...(responseChat[i].status === LogStatus.NotesAdded && { noteAttachment: responseChat[i]?.notesAttachmentMetadata?.mediaContents })
          });
        }
      } else if (
        responseChat.length !== 1 &&
        (responseChat[i]?.description?.trim() !== '' ||
          media?.mediaContent?.length > 0 ||
          attachmentObj)
      ) {
        chats.push({
          concreteClassName: responseChat[i].concreteClassName,
          description: responseChat[i].description,
          messageStatus: responseChat[i].messageStatus,
          attachments: media && media.mediaContent ? media.mediaContent : null,
          attachmentsType:
            media && media.attachmentType ? media.attachmentType : null,
          mentionTime: responseChat[i].mentionTime,
          ticketId: responseChat[i].ticketInfo.ticketID,
          isBrandPost: responseChat[i].isBrandPost,
          channelGroupId: responseChat[i].channelGroup,
          BrandID: responseChat[i].brandInfo.brandID,
          BrandName: responseChat[i].brandInfo.brandName,
          PageID: responseChat[i].fbPageID,
          tagID: responseChat[i].tagID,
          PostSocialID: responseChat[i].socialID,
          InreplyToStatusID: responseChat[i].inReplyToStatusId,
          phishingJson: responseChat[i].phishingJson,
          phishingStatus: responseChat[i].phishingStatus,
          isPhishingEnabled: isPhishingEnabled,
          scanContentFlag: scanContentFlag,
          scanContentUrlList: scanContentUrlList,
          noScanLinkFound: noLinkFound,
          scanLoader: false,
          attachmentObj,
          isMessageSent: true,
          strInReplyToStatusId: responseChat[i]?.strInReplyToStatusId,
          objectId: responseChat[i]?.objectId,
          emailContent: responseChat[i]?.emailContentHtml ? JSON.parse(responseChat[i].emailContentHtml) : null,
          ...(responseChat[i].status === LogStatus.NotesAdded && { noteAttachment: responseChat[i]?.notesAttachmentMetadata?.mediaContents })
        });

        if (chats.length > 0 && i === 0) {
          chatlog.push({
            concreteClassName: chats[chats.length - 1].concreteClassName,
            messageStatus: chats[chats.length - 1]?.messageStatus,
            mentionTime: chats[chats.length - 1].mentionTime,
            isBrandPost: chats[chats.length - 1].isBrandPost,
            channelGroupId: chats[chats.length - 1]?.channelGroupId,
            chats,
          });
          chats = [];
          mentionStart = moment.utc(responseChat[i].mentionTime);
          isBrand = responseChat[i].isBrandPost;
        }
      }
    }
    return chatlog;
  }

  updateChats(
    chatItem: ChatItemResponse,
    recievedChannelIndex = 0,
    recievedAuthorIndex = -1,
    recievedTicketIndex = -1,
    onSend = false,
    baseMention?: BaseMention,
    selectedQuoteReply?:any
    ): void {
    const crmChatBotView = JSON.parse(localStorage.getItem('sfdcTicketView'));
    if (crmChatBotView)
   {
      recievedChannelIndex = 0,
        recievedAuthorIndex = 0,
        recievedTicketIndex = 0
   }
    if (this.chatbotHide) {
      // this.chatBotHideObs.next({ status: false });
      this.chatBotHideObsSignal.set({ status: false });
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.chatBotHideObsSignal.set({ status: true });

          // this.chatBotHideObs.next({ status: true });
          // console.log('setTimeout called');
        }, 4000);
      });
    }

    if (chatItem.chatText && chatItem.chatText.trim() === '') {
      chatItem.chatText = null;
    }
    const baseMentionObj: BaseMention = {
      author: {
        name: chatItem.author,
        socialId: chatItem.authorID,
        picUrl: chatItem.userPic,
      },
      brandInfo: {
        brandName: chatItem.BrandName,
        brandFriendlyName: chatItem.brandFriendlyName,
        brandID: chatItem.brandID,
      },
      description: chatItem.chatText,
      ticketID: chatItem.ticketId,
      channelGroup: chatItem.channelGroupId,
      channelType: chatItem.channelType,
      attachmentMetadata: chatItem.attachments,
      isBrandPost: chatItem.isbrandPost,
      mentionTime: chatItem.mentiontime,
      ticketInfo: {
        ticketID: chatItem.ticketId,
      },
      chats: [],
      mentions: [],
    };

    const authorObj: ChatWindowProfiles = {
      authorSocialID: chatItem.authorID,
      authorName: chatItem.author,
      picUrl: chatItem.userPic,
      brandName: chatItem.BrandName,
      brandFriendlyName: chatItem.brandFriendlyName,
      channelgroupid: chatItem.channelGroupId,
      channelType: chatItem.channelType,
      brandID: chatItem.brandID,
      channelGroup: chatItem.channelGroupId,
      openTickets: [],
      newUserText:chatItem.newUserText
    };

    let selectedAuthor: ChatWindowProfiles;
    if (recievedChannelIndex >= 0 && recievedAuthorIndex >= 0) {
      selectedAuthor =
        this.chatObj[recievedChannelIndex].userProfiles[recievedAuthorIndex];
    }

    if (recievedTicketIndex >= 0) {
      const selectedOpenTicket =
        selectedAuthor.openTickets[recievedTicketIndex];
      if (selectedOpenTicket?.chats && selectedOpenTicket?.chats.length > 0) {
        const selectedAuthorChats = selectedOpenTicket.chats.filter(
          (chatLog) =>
            chatLog.concreteClassName ===
            this.chatType.chat[recievedChannelIndex]
        );

        const timeNow = moment();
        const timediff = (
          chatItem.isbrandPost ? timeNow : moment.utc(chatItem?.mentiontime)
        ).diff(
          moment.utc(
            selectedAuthorChats[selectedAuthorChats.length - 1]?.mentionTime
          ),
          'seconds'
        );

        const chatSenderToggle =
          chatItem.isbrandPost !==
          selectedAuthorChats[selectedAuthorChats.length - 1]?.isBrandPost;
        let emailContent = chatItem?.emailContentHtml && !chatItem?.isbrandPost ? JSON.parse(chatItem.emailContentHtml) : null;

        if (chatItem?.channelGroupId == ChannelGroup.Telegram && chatItem?.isbrandPost){
          if (selectedAuthorChats && selectedAuthorChats.length){
            const isUserPost = selectedAuthorChats.filter(res => !res.isBrandPost);
            if(isUserPost && isUserPost.length){
              let lastChat:any = isUserPost[isUserPost.length - 1];
              lastChat = lastChat && lastChat.chats && lastChat.chats.length ? lastChat.chats[0] : null;
              lastChat = selectedQuoteReply ? selectedQuoteReply : lastChat;
              if (lastChat){
                const media = lastChat && lastChat?.attachments && lastChat?.attachments.length ? lastChat.attachments[0] : null;
                emailContent = {
                  replytomessagejson: {
                    from: {
                      first_name: this.selectedBaseMention?.author?.name
                    },
                    text: lastChat?.description
                  },
                  mediatype: media ? media.mediaType : '',
                  mediaurl: media ? media.mediaUrl : ''
                }
              }
            }
          }

        }
        const chatSingleNode: ChatItem = {
          description: chatItem?.chatText || null,
          attachments: chatItem?.attachments?.mediaContents || null,
          attachmentsType: chatItem.attachmentsType || null,
          isMessageSent: true,
          mentionIndex: selectedOpenTicket.mentions.length,
          scanContentFlag: chatItem?.scanContentFlag,
          noScanLinkFound : chatItem?.noScanLinkFound,
          scanLoader: false,
          isPhishingEnabled : chatItem?.isPhishingEnabled,
          emailContent: emailContent
        };
        const chatGroupNode: any = {
          concreteClassName: this.chatType.chat[recievedChannelIndex],
          mentionTime: chatItem.mentiontime || timeNow,
          messageStatus: WhatsAppMessageStatus.Sent,
          authorSocialID: chatItem?.authorID,
          channelGroupId: chatItem.channelGroupId,
          isBrandPost: chatItem.isbrandPost,
          chats: [
            {
              description: chatItem.chatText || null,
              attachments: chatItem?.attachments?.mediaContents || null,
              attachmentsType: chatItem.attachmentsType || null,
              isMessageSent: true,
              mentionId: chatItem.ticketId || null,
              attachmentObj: chatItem.attachmentObj,
              mentionIndex: selectedOpenTicket.mentions.length,
              scanContentFlag: chatItem?.scanContentFlag,
              noScanLinkFound: chatItem?.noScanLinkFound,
              scanLoader: false,
              isPhishingEnabled: chatItem?.isPhishingEnabled,
              emailContent: emailContent
            },
          ],
        };
        if (chatSenderToggle || timediff > 60) {
          selectedOpenTicket.chats.push(chatGroupNode);
          // console.log('onChatUpdate => UpdateChatGroup emited');
          this.onChatUpdate.next({
            action: ChatActionEnum.UpdateChatGroup,
            channelIndex: crmChatBotView?0:recievedChannelIndex,
            authorIndex: crmChatBotView?0:recievedAuthorIndex,
            ticketIndex: recievedTicketIndex,
            isBrandPost: chatItem?.isbrandPost
          });
        } else {
          selectedOpenTicket.chats[
            selectedOpenTicket.chats.length - 1
          ].chats.push(chatSingleNode);
        }
        if (onSend) {
          const dataInfoObj = {
            channelIndex: recievedChannelIndex,
            userIndex: recievedAuthorIndex,
            ticketIndex: recievedTicketIndex,
            mentionIndex: selectedOpenTicket.mentions.length - 1,
            chatGroupIndex: selectedOpenTicket.chats.length - 1,
            chatItemIndex:
              selectedOpenTicket.chats[
                selectedOpenTicket?.chats?.length - 1 || 0
              ].chats.length - 1,
          };
          this.sentChatData.push(dataInfoObj);
          baseMentionObj.chatGroupIndex = dataInfoObj.chatGroupIndex;
          baseMentionObj.chatItemIndex = dataInfoObj.chatItemIndex;
          selectedOpenTicket.mentions.push(baseMentionObj);
        } else if (baseMention) {
          selectedOpenTicket.selectedMention = baseMention;
        }

        // this.quickReplies = {};
        if (!onSend && !chatItem.hideNotification && !chatItem?.isbrandPost && !(recievedTicketIndex == this.activeTicket && recievedAuthorIndex == this.activeUser && recievedChannelIndex == this.activeChannel)) {
          this.updateChatCount(
            recievedChannelIndex,
            recievedAuthorIndex,
            recievedTicketIndex,
            false
          );
        }
        // console.log('onChatUpdate => UpdateSingleChat emited');
        this.onChatUpdate.next({
          action: ChatActionEnum.UpdateSingleChat,
          channelIndex: recievedChannelIndex,
          authorIndex: recievedAuthorIndex,
          ticketIndex: recievedTicketIndex,
          isBrandPost: chatItem?.isbrandPost
        });
      }

      // else{
      // Attach to current user and create open tickets  Object
    } else {
      if (
        recievedAuthorIndex === -1 &&
        +chatItem.brandID !== selectedAuthor?.brandID
      ) {
        authorObj.openTickets.push(baseMentionObj);

        const authorArr = this.chatObj[recievedChannelIndex].userProfiles;
        authorArr.push(authorObj);
        if (authorObj.newUserText== 'New'){
          this.chatObj[recievedChannelIndex].newUserFlag = true;
        }
        this.usertotalCount += 1;
        if (!onSend && !chatItem.hideNotification) {
          this.updateChatCount(
            recievedChannelIndex,
            authorArr.length - 1,
            0,
            false
          );
        }
        // console.log('onChatUpdate => AddAuthor emited');
        this.onChatUpdate.next({
          action: ChatActionEnum.AddAuthor,
          channelIndex: recievedChannelIndex,
          authorIndex: authorArr.length - 1,
          ticketIndex: 0,
        });
      } else if (baseMentionObj.ticketID != 0) {
        const openTicketsArr =
          this.chatObj[recievedChannelIndex].userProfiles[recievedAuthorIndex]
            .openTickets;
        openTicketsArr.push(baseMentionObj);
        if (!onSend) {
          this.updateChatCount(
            recievedChannelIndex,
            recievedAuthorIndex,
            openTicketsArr.length - 1,
            false
          );
        }
        // console.log('onChatUpdate => AddTicket emited');
        this.onChatUpdate.next({
          action: ChatActionEnum.AddTicket,
          channelIndex: recievedChannelIndex,
          authorIndex: recievedAuthorIndex,
          ticketIndex: openTicketsArr.length - 1,
        });
      }
    }
  }

  removeChats(
    recievedChannelIndex: number,
    recievedAuthorIndex: number,
    recievedTicketIndex: number
  ): void {
    if (recievedChannelIndex >= 0 && recievedAuthorIndex >= 0) {
      const ticketCount =
        this.chatObj[recievedChannelIndex].userProfiles[recievedAuthorIndex]
          .openTickets.length;

      if (ticketCount <= 1) {
        this.updateChatCount(
          recievedChannelIndex,
          recievedAuthorIndex,
          ticketCount - 1,
          false,
          true
        );
        this.chatObj[recievedChannelIndex].userProfiles.splice(
          recievedAuthorIndex,
          1
        );

        this.usertotalCount -= 1;
        // console.log('onChatUpdate => RemoveAuthor emmited');
        this.onChatUpdate.next({
          action: ChatActionEnum.RemoveAuthor,
          channelIndex: recievedChannelIndex,
          authorIndex: recievedAuthorIndex,
          ticketIndex: ticketCount - 1,
        });
      } else {
        this.updateChatCount(
          recievedChannelIndex,
          recievedAuthorIndex,
          recievedTicketIndex,
          false,
          true
        );
        this.chatObj[recievedChannelIndex].userProfiles[
          recievedAuthorIndex
        ].openTickets.splice(recievedTicketIndex, 1);
        // console.log('onChatUpdate => RemoveTicket emited');
        this.onChatUpdate.next({
          action: ChatActionEnum.RemoveTicket,
          channelIndex: recievedChannelIndex,
          authorIndex: recievedAuthorIndex,
          ticketIndex: recievedTicketIndex,
        });
      }
    }
  }

  processChats(
    chatItem: ChatItemResponse,
    actionType?: number,
    signalRmessage: string = null,
    onSend = false,
    baseMention?: BaseMention,
    selectedQuoteReply?:any
  ): void {
    const currentUser = this.localStorageService.getCurrentUserData();
    // Get index of Channel and Author in chat Object
    const indices = this.getIndex(
      chatItem.channelGroupId,
      chatItem.authorID,
      chatItem.brandID,
      chatItem.ticketId
    );
    const crmChatBotView = JSON.parse(localStorage.getItem('sfdcTicketView'));

    const recievedChannelIndex = crmChatBotView ? 0 : indices.channelIndex;
    const recievedAuthorIndex = crmChatBotView ? 0 : indices.authorIndex;
    const recievedTicketIndex = crmChatBotView ? 0 : indices.ticketIndex;

    if (
      (actionType === PostActionType.update ||
        actionType === PostActionType.reminder) &&
      ((recievedChannelIndex >= 0 &&
        recievedAuthorIndex >= 0 &&
        recievedTicketIndex >= 0) ||
        onSend)
    ) {
      if (actionType === PostActionType.reminder) {
        if (chatItem.reminderTime === 60 || (chatItem.channelType == ChannelType.WesiteChatbot && chatItem.reminderNo ==1)) {
          chatItem.chatText = "We haven’t heard from you in the last 60 seconds. Let us know if you're still connected, as resolving your query is our priority."
        } else if (chatItem.reminderTime === 120 || (chatItem.channelType == ChannelType.WesiteChatbot && chatItem.reminderNo == 2)) {
          chatItem.chatText = "Sorry, we seem to have missed you! Let us know if you would like to continue this conversation."
        }
        // `We are waiting for a response from you. This chat session will be closed if no response is received within the next ${
        //   chatItem.reminderTime === 120 ? 60 : 120
        // } seconds`;
        chatItem.isbrandPost = true;
      }
      this.chatSound = true;
      this.updateChats(
        chatItem,
        recievedChannelIndex,
        recievedAuthorIndex,
        recievedTicketIndex,
        onSend,
        baseMention,
        selectedQuoteReply
      );
    }
    if (recievedTicketIndex === -1) {
      if (
        currentUser?.data?.user.userId === +chatItem.assignToUserID &&
        (actionType === PostActionType.workflowApproveReject ||
          actionType === PostActionType.assign ||
          (actionType === PostActionType.makerCheckerApprove &&
            (chatItem.replyStatus ===
              ActionStatusEnum.ReplyAndAwaitingCustomerResponse ||
              chatItem.replyStatus === ActionStatusEnum.Open)) ||
          actionType === PostActionType.makercheckerReject)
      ) {
        this.updateChats(
          chatItem,
          recievedChannelIndex,
          recievedAuthorIndex,
          recievedTicketIndex
        );
        this._ticketService.changeChatOnReassignment.next(chatItem.assignToUserID);
        if (!chatItem.hideNotification) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: signalRmessage,
            },
          });
        }
      }
    } else {
      if (
        actionType === PostActionType.assign &&
        currentUser?.data?.user.userId !== +chatItem.assignToUserID
        // +chatItem.assignToUserID !== +chatItem.userID
      ) {
        // remove based on ticketid and author id
        this.removeChats(
          recievedChannelIndex,
          recievedAuthorIndex,
          recievedTicketIndex
        );

        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: signalRmessage,
          },
        });
      }
      if (
        (currentUser?.data?.user.userId !== +chatItem.assignToUserID &&
          (actionType === PostActionType.escalate ||
            actionType === PostActionType.replySentForApproval)) ||
        actionType === PostActionType.autoClose ||
        actionType === PostActionType.Close
      ) {
        // remove author by user id
        this.onChatsRemove.next(indices)
        this.removeChats(
          recievedChannelIndex,
          recievedAuthorIndex,
          recievedTicketIndex
        );
        if (
          actionType === PostActionType.autoClose &&
          signalRmessage?.trim() === ''
        ) {
          signalRmessage = 'Bot has closed this ticket';
        }
        if (
          (actionType === PostActionType.escalate &&
            +currentUser?.data?.user?.role === UserRoleEnum.CustomerCare) ||
          actionType !== PostActionType.escalate
        ) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: signalRmessage,
            },
          });
        }
      }
      if (
        actionType === PostActionType.enableMakerChecker ||
        (actionType === PostActionType.disableMakerChecker &&
          this.chatObj[recievedChannelIndex]?.userProfiles.length > 0)
      ) {
        const basemention =
          this.chatObj[recievedChannelIndex].userProfiles[recievedTicketIndex]
            .BaseMentions;
        const recievedBasemention = basemention.filter(
          (mention) => mention.isBrandPost === false
        );

        if (actionType === PostActionType.enableMakerChecker) {
          recievedBasemention[
            recievedBasemention.length - 1
          ].ticketInfo.isAutoClosureEnabled = true;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: signalRmessage,
            },
          });
        }

        if (actionType === PostActionType.disableMakerChecker) {
          recievedBasemention[
            recievedBasemention.length - 1
          ].ticketInfo.isAutoClosureEnabled = false;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: signalRmessage,
            },
          });
        }
      }
    }

    // Actions in which both add and remove author are required
    if (
      actionType === PostActionType.makerCheckerApprove ||
      actionType === PostActionType.makerCheckerApprove ||
      (actionType === PostActionType.reOpen &&
        currentUser?.data?.user?.userId === +chatItem.assignToUserID)
    ) {
      // append chat or append User
      this.updateChats(
        chatItem,
        recievedChannelIndex,
        recievedAuthorIndex,
        recievedTicketIndex
      );
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Success,
          message: signalRmessage,
        },
      });
    }

    if (
      actionType === PostActionType.caseDetach &&
      currentUser?.data?.user?.userId !== chatItem.assignToUserID
    ) {
      // remove mention or author based on ticketid and author id
      this.removeChats(
        recievedChannelIndex,
        recievedAuthorIndex,
        recievedTicketIndex
      );
    }
  }

  chatbotReply(chattext: string, chatAttachment: MediaContent[], sendFeedBack?: boolean, caption?:string): void {
    // sendFeedBack = true
    this._replyService
      .GetBrandAccountInformation({
        Brand: this.selectedBaseMention.brandInfo,
        ChannelGroup: this.selectedBaseMention.channelGroup,
      })
      .subscribe((data) => {
        let replyObj;
        let objBrandSocialAcount = data;
        if (this.selectedBaseMention.channelType === ChannelType.FBMessages) {
          if (
            objBrandSocialAcount &&
            objBrandSocialAcount.length > 0
          ) {
            objBrandSocialAcount = objBrandSocialAcount.filter(
              (obj) => {
                return (
                  obj.channelGroup === this.selectedBaseMention.channelGroup &&
                  obj.active &&
                  obj.isPrimary &&
                  obj.socialID === this.selectedBaseMention.fbPageID.toString()
                );
              }
            );
          }
        } else if (
          this.selectedBaseMention.channelGroup === ChannelGroup.WhatsApp
        ) {
          if (
            this.selectedBaseMention.whatsAppAccountID > 0 &&
            objBrandSocialAcount !== null &&
            objBrandSocialAcount.length > 0
          ) {
            objBrandSocialAcount = objBrandSocialAcount.filter(
              (obj) => {
                return (
                  obj.accountID === this.selectedBaseMention.whatsAppAccountID
                );
              }
            );
          }
        }
        if(sendFeedBack){
          // this.selectedBaseMention.ticketInfo.status = 0
          replyObj = this._replyService.BuildReply(
            this.selectedBaseMention,
            ActionStatusEnum.ReplyAndClose,
          );
          replyObj.ActionTaken = ActionTaken.Locobuzz;
          replyObj.Tasks = this.BuildCommunicationLog(this.selectedBaseMention, ActionStatusEnum.ReplyAndClose,sendFeedBack);
        }else{
          replyObj = this._replyService.BuildReply(
            this.selectedBaseMention,
            ActionStatusEnum.ReplyAndAwaitingCustomerResponse,
            );
          replyObj.ActionTaken = ActionTaken.Locobuzz;
          replyObj.Tasks = this.BuildCommunicationLog(this.selectedBaseMention, ActionStatusEnum.ReplyAndAwaitingCustomerResponse,sendFeedBack);
          }
          const source = this._mapLocobuzzEntity.mapMention(
            this.selectedBaseMention
            );
            replyObj.Source = source;
            if (
              this.selectedBaseMention.channelGroup === ChannelGroup.WebsiteChatBot
              ) {
                replyObj.ReplyFromAuthorSocialId =
                this.selectedBaseMention.author.socialId;
                replyObj.ReplyFromAccountId = 0;
            } else if (
              this.selectedBaseMention.channelGroup === ChannelGroup.GoogleBusinessMessages
            ) {
              replyObj.ReplyFromAuthorSocialId =
                this.selectedBaseMention.author.socialId;
              replyObj.ReplyFromAccountId = this.selectedBaseMention.settingID;
            } else {
                replyObj.ReplyFromAuthorSocialId =
                objBrandSocialAcount[0].socialID;
                replyObj.ReplyFromAccountId = objBrandSocialAcount[0].accountID;
              }
              const baseReply = new BaseReply();
              const customReplyObj = baseReply.getReplyClass();
              replyObj.Replies.push(customReplyObj);
              replyObj.Replies[0].replyText = chattext;
              replyObj.Replies[0].sendFeedback = sendFeedBack;
              // replyObj.Replies.push({
              //   replyText: chattext,
              //   GroupEmailList: {},
              //   attachmentsUgc: null,
              //   sendFeedback: sendFeedBack
              // });
        if (chatAttachment && chatAttachment.length > 0) {
          const ugcMention: UgcMention[] = [];
          chatAttachment.forEach((attachedItem) => {
            ugcMention.push({
              displayFileName: attachedItem.name,
              mediaPath: attachedItem.mediaUrl,
              mediaType: attachedItem.mediaType,
            });
          });
          let ugcMentionSelected =
            this._mapLocobuzzEntity.mapUgcMention(ugcMention);
          if (this.selectedBaseMention.channelGroup == ChannelGroup.Telegram) {
            ugcMentionSelected.forEach(res => res.TelegramCaption = caption ? caption : '');
          }
          replyObj.Replies[0].attachmentsUgc = ugcMentionSelected;
        } else {
          replyObj.Replies.forEach((obj) => {
            obj.attachmentsUgc = null;
          });
        }
        replyObj.Source['IsChatBotReply'] = true;
        /* extra flag added */
        const logdinUser = JSON?.parse(localStorage?.getItem('user') || '{}');
        if (logdinUser && Object.keys(logdinUser)?.length > 0) {
          const actionButton = logdinUser?.data?.user?.actionButton;
          if (Object.keys(actionButton)?.length > 0) {
            if (replyObj?.Source) replyObj.Source['IsChatBotEnable'] = actionButton?.chatSectionEnabled || false;
          }
        }
        if (this.selectedBaseMention.channelGroup == ChannelGroup.Telegram) {
          replyObj.TelegramReplyType = 1
        }
        if (this.selectedBaseMention.channelType == ChannelType.TelegramGroupMessages) {
          replyObj.TelegramReplyType = 2
        }
        /* extra flag added */
        this._replyService.Reply(replyObj, true).subscribe(
          (response) => {
            if (response.success && response.data) {
              this.markMessageOnSend(response.success);
            }
            const sfdcTicketView = JSON.parse(localStorage.getItem('sfdcTicketView'))
            if (sfdcTicketView && sendFeedBack)
            {
              this._ticketService.crmChatbotCloseTicketObsSignal.set({ status: 3, refresh: true })
            }
            this.chatBoatReplayUpdate.next({ ticketID: replyObj?.Source?.ticketInfo?.ticketID, status:response.success });
          },
          (err) => {
            this.markMessageOnSend(false);
          }
        );
      });
  }

  chatbotSignalR(chatResponse): void {
    const currentUser = this.localStorageService.getCurrentUserData();
    if (chatResponse && chatResponse.message && this.chatObj.length > 0) {
      let signalChannelType = chatResponse.message.channelType
        ? chatResponse.message.channelType
        : chatResponse.message.Data.ChannelType;
      if (!signalChannelType && chatResponse.message?.Data) {
        signalChannelType = chatResponse.message.Data.Channel;
      }
      const signalRmessage = chatResponse.message;
      const brandID = signalRmessage.BrandId
        ? signalRmessage.BrandId
        : signalRmessage.BrandID
        ? signalRmessage.BrandID
        : null;
      const brandIndex = this.selectedBrandList.findIndex(
        (item) => +item.brandID === +brandID
      );
      if (brandIndex >= 0) {
        let channelGroupid =
          chatResponse?.message?.Data?.ChannelGroupId ||
          chatResponse?.message?.Data?.Channel;
        if (signalChannelType === ChannelType.WhatsApp) {
          channelGroupid = ChannelGroup.WhatsApp;
        } else if (signalChannelType === ChannelType.FBMessages) {
          channelGroupid = ChannelGroup.Facebook;
        } else if (signalChannelType === ChannelType.InstagramMessages) {
          channelGroupid = ChannelGroup.Instagram;
        } else if (signalChannelType === ChannelType.GMBChat) {
          channelGroupid = ChannelGroup.GoogleBusinessMessages;
        } else if (signalChannelType === ChannelType.TelegramMessages || signalChannelType === ChannelType.TelegramGroupMessages) {
          channelGroupid = ChannelGroup.Telegram;
        } else {
          channelGroupid = ChannelGroup.WebsiteChatBot;
        }
        const botEnable = this.selectedBrandList[brandIndex]?.botEnable;
        if (
          channelGroupid === ChannelGroup.WebsiteChatBot &&
          !botEnable.showWebsiteBot
        ) {
          return;
        } else if (
          channelGroupid === ChannelGroup.WhatsApp &&
          !botEnable.showWhatsapp
        ) {
          return;
        } else if (
          channelGroupid === ChannelGroup.Facebook &&
          !botEnable.showMessenger
        ) {
          return;
        } else if (
          channelGroupid === ChannelGroup.Instagram &&
          !botEnable.showInstagram
        ) {
          return;
        } else if (
          channelGroupid === ChannelGroup.GoogleBusinessMessages &&
          !botEnable.showGMB
        ) {
          return;
        } else if (
          channelGroupid === ChannelGroup.Telegram &&
          !botEnable.showTelegram
        ) {
          return;
        }

        if (
          (+chatResponse.signalId === TicketSignalEnum.chatbotBrandReply ||
            +chatResponse.signalId ===
              TicketSignalEnum.closeByAutoSuggestion) &&
          channelGroupid === ChannelGroup.WebsiteChatBot
        ) {
          signalChannelType = ChannelType.FacebookChatbot;
        }

        if (
          signalChannelType === ChannelType.WhatsApp ||
          signalChannelType === ChannelType.WesiteChatbot ||
          signalChannelType === ChannelType.FacebookChatbot ||
          signalChannelType === ChannelType.AndroidChatbot ||
          signalChannelType === ChannelType.LineChatbot ||
          signalChannelType === ChannelType.WhatsAppChatbot ||
          signalChannelType === ChannelType.FBMessages ||
          signalChannelType === ChannelType.GMBChat ||
          signalChannelType === ChannelType.InstagramMessages ||
          signalChannelType === ChannelType.TelegramMessages ||
          signalChannelType === ChannelType.TelegramGroupMessages
        ) {
          let signalRMessage = null;
          if (chatResponse.message && chatResponse.message.Message) {
            signalRMessage = chatResponse.message.Message;
          }
          let attachments: AttachmentMetadata = {
            mediaContents: [],
            mediaContentText: null,
          };

          let media: mediaObj;
          let chatDescription;
          if (signalRmessage?.Data?.AttachmentXML) {
            attachments.mediaContentText = signalRmessage?.Data.AttachmentXML;
            const parseString = require('xml2js').parseString;
            parseString(signalRmessage.Data.AttachmentXML, (err, result) => {
              if (result && result?.Attachments?.Item.length > 0) {
                result?.Attachments?.Item.forEach((element) => {
                  if (element?.Url?.length > 0) {
                    attachments.mediaContents.push({
                      mediaUrl: element?.Url[0],
                      mediaType: +element?.MediaType[0],
                      displayName: element?.Name[0],
                      thumbUrl: element?.ThumbUrl[0],
                      name: element?.Name[0],
                    });
                    if (signalRmessage.Data.Description) {
                      chatDescription = signalRmessage.Data.Description.replace(
                        element.Url[0],
                        ''
                      );
                    }
                  }
                });
              }
            });
            if (
              attachments?.mediaContents &&
              attachments?.mediaContents.length > 0
            ) {
              attachments.mediaContents = this.setMedia(
                attachments?.mediaContents,
                channelGroupid,
                environment.MediaUrl
              );
            }
            // if(attachments?.mediaContents?.length===0 || attachments?.)
            media = this.mediaTypeLoader(attachments, chatDescription);
            if (attachments?.mediaContents?.length > 0) {
              attachments.mediaContents = media.mediaContent;
            }

            if (
              chatDescription &&
              chatDescription !== '' &&
              LocobuzzUtils.isJSON(chatDescription)
            ) {
              const descObj = JSON.parse(chatDescription);
              if (descObj?.messaging_type === 'RESPONSE') {
                chatDescription = descObj?.message?.text;
              }
            }

            if (chatDescription === 'get_started_ping') {
              chatDescription = 'Get Started';
            }
            if (chatDescription === 'agent_chat_delay') {
              chatDescription = 'Agent chats delayed';
            }
          }
          const isPhishingEnabled = this.selectedBrandList?.find(x => x?.brandID == signalRmessage?.Data?.BrandID)?.isPhishingSiteEnabled
          let scanContentUrlList = []

          var phishingurlexp = new RegExp(/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gi);
          if (signalRmessage?.Data?.Description) {
            const urlmatches = signalRmessage?.Data?.Description.match(phishingurlexp);
            if (urlmatches) {
              urlmatches.forEach((url) => scanContentUrlList.push(url))
            }
          }
          let scanContentFlag = isPhishingEnabled ;
          // && scanContentUrlList?.length > 0 ? true : false
          // let noLinkFound = scanContentUrlList?.length == 0 || !isPhishingEnabled ? true : false;
          let noLinkFound = false;
          const chatItem: ChatItemResponse = {
            chatText: chatDescription
              ? chatDescription
              : signalRmessage?.Data?.Description
              ? signalRmessage.Data.Description
              : null,
            isbrandPost: signalRmessage?.Data?.IsBrandPost
              ? signalRmessage.Data?.IsBrandPost
              : false,
            channelGroupId: channelGroupid ? channelGroupid : null,
            channelType: signalChannelType ? signalChannelType : null,
            author: signalRmessage?.Data?.Author
              ? signalRmessage.Data.Author
              : null,
            authorID: signalRmessage?.Data?.StrAuthorID
              ? signalRmessage.Data.StrAuthorID.toString()
              : null,
            userPic: signalRmessage?.Data?.UserPic
              ? signalRmessage.Data.UserPic
              : null,
            mentiontime: signalRmessage?.Data?.MentionTimeEpoch
              ? signalRmessage.Data.MentionTimeEpoch.toString()
              : null,
            brandID: signalRmessage?.BrandId
              ? signalRmessage?.BrandId
              : signalRmessage?.BrandID
              ? signalRmessage?.BrandID
              : null,
            brandFriendlyName:
              this.selectedBrandList[brandIndex].brandFriendlyName,
            BrandName: signalRmessage?.Data?.BrandName
              ? signalRmessage?.Data?.BrandName
              : null,

            ticketId:
              signalRmessage?.TicketID || signalRmessage?.Data.CaseID || null,
            userID: signalRmessage?.Data.SenderUserID
              ? signalRmessage?.Data.SenderUserID
              : null,
            assignToUserID: signalRmessage?.Data.AssignedToAgencyUser
              ? +signalRmessage?.Data.AssignedToAgencyUser
              : null,
            replyStatus: signalRmessage?.Data.CaseStatus
              ? +signalRmessage?.Data.CaseStatus
              : null,
            attachments: attachments,
            attachmentsType: media?.attachmentType
              ? media?.attachmentType
              : null,
            attachmentIcon: media?.attachmentIcon
              ? media?.attachmentIcon
              : null,
            tagID: signalRmessage?.Data?.TagID
              ? signalRmessage?.Data?.TagID
              : 0,
            UserName: signalRmessage?.Data?.UserName
              ? signalRmessage?.Data?.UserName
              : null,
            isPhishingEnabled: isPhishingEnabled,
            scanContentFlag: scanContentFlag,
            noScanLinkFound: noLinkFound,
            scanLoader: false,
            reminderTime: signalRmessage?.Data?.ReminderTime || null,
            reminderNo: signalRmessage?.ReminderNo || null,
            ticketStatus: signalRmessage?.Data?.CaseStatus || null,
            hideNotification: null,
            newUserText:'',
            emailContentHtml: signalRmessage?.Data?.EmailContentHTML && channelGroupid == ChannelGroup.Telegram ? signalRmessage?.Data?.EmailContentHTML : null
          };

          if (
            +chatResponse.signalId === TicketSignalEnum.FetchNewData ||
            +chatResponse.signalId === TicketSignalEnum.NewCaseAttach
            // +chatResponse.signalId ===
            // TicketSignalEnum.AgentReminderWebsiteSignalR
          ) {
            const indices = this.getIndex(
              chatItem.channelGroupId,
              chatItem.authorID,
              +chatItem.brandID,
              chatItem.ticketId
            );
            const channelIndex = indices.channelIndex;
            const authorIndex = indices.authorIndex;

            
            if (chatItem.assignToUserID === currentUser.data.user.userId && chatItem?.chatText?.toUpperCase() == 'CONNECT') {
              chatItem.newUserText = 'New'
            }

            if (
              chatItem?.ticketStatus !== TicketStatus.Close &&
              chatItem?.assignToUserID &&
              authorIndex < 0
            ) {
              chatItem.author = !chatItem.author
                ? chatItem.UserName
                : chatItem.author;
              this.processChats(
                chatItem,
                PostActionType.assign,
                signalRMessage
              );
            } else {
              const ticket = {
                brandInfo: {
                  brandID: chatItem.brandID,
                  brandName: chatItem.BrandName,
                },
                author: {
                  socialId: chatItem.authorID,
                },
                ticketID: chatItem.ticketId,
                channelGroup: chatItem.channelGroupId,
                tagID: chatItem.tagID,
              };
              let alertMessage = signalRMessage;
              let ticketIndex;
              if (channelIndex >= 0 && authorIndex >= 0) {
                ticketIndex = indices.ticketIndex;
                if (ticketIndex >= 0) {
                  this.getChatLog(ticket, false).subscribe((res) => {
                    if (res && res?.timeLine?.length > 0) {
                      const mention = res.timeLine[0];
                      chatItem.mentiontime = res.timeLine[0].mentionTime;
                      if (
                        (mention?.attachmentMetadata?.mediaContents &&
                          mention.attachmentMetadata?.mediaContents.length >
                            0) ||
                        mention.attachmentMetadata?.mediaContentText !== '' ||
                        (mention.description &&
                          mention.description?.trim() !== '')
                      ) {
                        if (
                          mention?.attachmentMetadata?.mediaContents &&
                          mention.attachmentMetadata?.mediaContents.length > 0
                        ) {
                          mention.attachmentMetadata.mediaContents =
                            this.setMedia(
                              mention.attachmentMetadata.mediaContents,
                              channelGroupid,
                              environment.MediaUrl
                            );
                        }
                        media = this.mediaTypeLoader(
                          mention?.attachmentMetadata,
                          mention.description
                        );
                        chatItem.attachmentsType = media?.attachmentType;
                        attachments.mediaContents = media?.mediaContent;
                        chatItem.attachments = attachments;
                      }
                      if (
                        mention.channelGroup === ChannelGroup.WebsiteChatBot &&
                        mention.description
                      ) {
                        const mediaArray =
                          mention.description.split('File upload: ');
                        if (mediaArray.length > 1) {
                          mention.attachmentMetadata.mediaContents.push({
                            mediaUrl: mediaArray[mediaArray.length - 1],
                            mediaType: this.getMediaTypebyExtension(
                              mediaArray[mediaArray.length - 1],
                              mention.mediaType
                            ).mediaType,
                          });
                          mention.description = null;
                          chatItem.attachmentsType =
                            mention.attachmentMetadata.mediaContents[0]?.mediaType;
                          attachments.mediaContents =
                            mention.attachmentMetadata.mediaContents;
                          chatItem.attachments = mention.attachmentMetadata;
                          chatItem.chatText = mention.description;
                        }
                      }
                      this.processChats(
                        chatItem,
                        PostActionType.update,
                        alertMessage,
                        false,
                        mention
                      );
                    }
                  });
                }
              }
            }
          } else if (
            +chatResponse.signalId === TicketSignalEnum.chatbotBrandReply ||
            +chatResponse.signalId === TicketSignalEnum.AgentReminderWebsiteSignalR
          ) {
            this.processChats(
              chatItem,
              PostActionType.reminder,
              signalRMessage
            );
          } else if (+chatResponse.signalId === TicketSignalEnum.CloseTicket) {
            this.processChats(chatItem, PostActionType.Close, signalRMessage);
          } else if (
            (+chatResponse.signalId === TicketSignalEnum.TicketReassigned ||
              +chatResponse.signalId ===
                TicketSignalEnum.AgentAssignedByService) &&
            chatItem.ticketStatus !== TicketStatus.Close
          ) {
            // chatItem.hideNotification =
            //   +chatResponse.signalId ===
            //   TicketSignalEnum.AgentAssignedByService;
            if(chatItem.assignToUserID === currentUser.data.user.userId){
              chatItem.newUserText ='New'
            }
            this.processChats(chatItem, PostActionType.assign, signalRMessage);
          } else if (
            +chatResponse.signalId === TicketSignalEnum.TicketEscalatedToCC ||
            +chatResponse.signalId === TicketSignalEnum.TicketEscalatedToBrand
          ) {
            this.processChats(
              chatItem,
              PostActionType.escalate,
              signalRMessage
            );
          } else if (+chatResponse.signalId === TicketSignalEnum.ReOpenTicket) {
            if (chatItem.assignToUserID === currentUser.data.user.userId) {
              chatItem.newUserText = 'New'
            }
            this.processChats(chatItem, PostActionType.reOpen, signalRMessage);
          } else if (
            +chatResponse.signalId === TicketSignalEnum.TicketIgnoredByBrand ||
            +chatResponse.signalId === TicketSignalEnum.TicketIgnoredByCC ||
            +chatResponse.signalId ===
              TicketSignalEnum.TicketApprovedByCCOrBrand
          ) {
            this.processChats(
              chatItem,
              PostActionType.workflowApproveReject,
              signalRMessage
            );
          } else if (
            +chatResponse.signalId === TicketSignalEnum.ReplySentForApproval
          ) {
            this.processChats(
              chatItem,
              PostActionType.replySentForApproval,
              signalRMessage
            );
          } else if (
            +chatResponse.signalId === TicketSignalEnum.ReplyApproved
          ) {
            this.processChats(
              chatItem,
              PostActionType.makerCheckerApprove,
              signalRMessage
            );
          } else if (
            +chatResponse.signalId === TicketSignalEnum.ReplyRejected
          ) {
            this.processChats(
              chatItem,
              PostActionType.makercheckerReject,
              signalRMessage
            );
          } else if (
            +chatResponse.signalId === TicketSignalEnum.CaseDetachFrom
          ) {
            this.processChats(
              chatItem,
              PostActionType.caseDetach,
              signalRMessage
            );
          } else if (
            +chatResponse.signalId === TicketSignalEnum.EnableMakerChecker
          ) {
            this.processChats(
              chatItem,
              PostActionType.enableMakerChecker,
              signalRMessage
            );
          }
          if (+chatResponse.signalId === TicketSignalEnum.DisableMakerChecker) {
            this.processChats(
              chatItem,
              PostActionType.disableMakerChecker,
              signalRMessage
            );
          } else if (
            +chatResponse.signalId === TicketSignalEnum.CloseWebsiteBotTicket ||
            +chatResponse.signalId === TicketSignalEnum.closeByAutoSuggestion
          ) {
            this.processChats(
              chatItem,
              PostActionType.autoClose,
              signalRMessage
            );
          }
        }
      }
    }
  }

  public getChatProfiles(
    filterParams: filterData
  ): Observable<ChatWindowDetails> {
    // create channel id array to create params
    this.channelID = this.channelIds[0];

    const channelParams = {
      Request: {
        ChannelGroupIds: this.channelIds,
        StartDateEpoch: filterParams.duration.startEpoch,
        EndDateEpoch: filterParams.duration.endEpoch,
      },
      BrandIDs: this.selectedBrandList.map((brand) => +brand.brandID),
    };
    return this._httpClient
      .post<ChatWindowresponse>(
        `${environment.baseUrl}/Tickets/GetChatWindowUserCountV2`,
        channelParams
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  getChatLog(
    ticket,
    getAllMentions = true
  ): Observable<{
    nextTicketID: string;
    previousTicket: string;
    timeLine: BaseMention[];
  }> {
    const userParams = {
      BrandInfo: {
        BrandName: ticket.brandInfo.brandName,
        BrandID: ticket.brandInfo.brandID,
      },
      TicketID: ticket.ticketID,
      AuthorId: ticket.author.socialId,
      Channel: ticket.channelGroup,
      TagID: getAllMentions ? 0 : ticket?.tagID,
    };
    return this._httpClient
      .post<any>(
        `${environment.baseUrl}/Tickets/GetChatWindowCommunicationV2`,
        userParams
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  GBMAgentJoinedLeft(obj): Observable<any> {
    return this._httpClient
      .post<any>(`${environment.baseUrl}/Tickets/GBMAgentJoinedLeft`, obj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getBotSequence(): Observable<GetBotSequence> {
    return this._httpClient
      .get<GetBotSequence>(`${environment.baseUrl}/Account/GetBotSequence`)
      .pipe(
        map((response) => {
          if (response) {
            const GetBotSequence: GetBotSequence = response;
            return GetBotSequence;
          }
        })
      );
  }

  getAISmartSuggestions(obj): Observable<any> {
    return this._httpClient
      .post<any>(`${environment.baseUrl}/TicketDisposition/GetAISuggestedResponse`, obj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getPreviousMessages(obj): Observable<any> {
    return this._httpClient
      .post<any>(`${environment.baseUrl}/TicketDisposition/GetAIPreviousMessages`, obj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }


  getAIProductHelp(obj): Observable<any> {
    return this._httpClient
      .post<any>(`${environment.baseUrl}/TicketDisposition/GetAIHelpWindow`, obj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  testAiResponse(obj): Observable<any> {
    return this._httpClient
      .post<any>(`${environment.baseUrl}/TicketDisposition/GetAITestResponse`, obj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  gptProductFeedback(obj): Observable<any> {
    return this._httpClient
      .post<any>(`${environment.baseUrl}/TicketDisposition/GetAIHelpFeedback`, obj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  rephraseData(keyObj): Observable<any> {
    return this._httpClient
      .post<any>(
        environment.baseUrl + '/TicketDisposition/GetAIRephraseData',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  trackAIResponse(keyObj): Observable<any> {
    return this._httpClient
      .post<any>(
        environment.baseUrl + '/TicketDisposition/TrackAIResponse',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  translateReply(keyObj): Observable<any> {
    return this._httpClient
      .post<any>(
        environment.baseUrl + '/TicketDisposition/GetAITranslateData',
        keyObj
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getTotalCount(): any {
    const filterParams = this._filterService.getGenericFilter();
    const params = {
      Request: {
        ChannelGroupIds: this.channelIds,
        StartDateEpoch: filterParams.startDateEpoch,
        EndDateEpoch: filterParams.endDateEpoch,
      },
      BrandIDs: this.selectedBrandList.map((brand) => +brand.brandID),
    };
    return this._httpClient
      .post<any>(`${environment.baseUrl}/Tickets/GetChatWindowCount`, params)
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  checkMessageRead(ticketId): any {
    return this._httpClient
      .post<any>(
        `${environment.baseUrl}/Tickets/UpdateMessangerReadTime?TicketID=${ticketId}`,
        {}
      )
      .pipe(
        map((response) => {
          return response.data;
        })
      );
  }

  getMediaTypebyExtension(mediaUrl, mediaType): { mediaType; mediaIcon } {
    let mediaIcon;
    if (mediaType == MediaEnum.URL) {
      mediaType = MediaEnum.URL;
      mediaIcon = '';
    } else if (mediaUrl?.includes('.xls') || mediaUrl?.includes('.xlsx')) {
      mediaType = MediaEnum.EXCEL;
      mediaIcon = 'assets/images/chatbot/xls.svg';
    } else if (
      mediaUrl?.includes('.mp3') ||
      mediaUrl?.includes('.oga') ||
      mediaUrl?.includes('.mpga')
    ) {
      mediaType = MediaEnum.AUDIO;
    } else if (mediaUrl?.includes('.doc') || mediaUrl?.includes('.docx')) {
      mediaIcon = 'assets/images/chatbot/doc.svg';
      mediaType = MediaEnum.DOC;
    } else if (mediaUrl?.includes('.pdf')) {
      mediaIcon = 'assets/images/chatbot/pdf.svg';
      mediaType = MediaEnum.PDF;
    } else if (
      mediaUrl?.includes('.jpeg') ||
      mediaUrl?.includes('.jpg') ||
      mediaUrl?.includes('.png') ||
      mediaUrl?.includes('.jpeg') ||
      mediaUrl?.includes('.gif')
    ) {
      mediaType = MediaEnum.IMAGE;
    } else if (mediaUrl?.includes('.mp4') && mediaType != MediaEnum.AUDIO) {
      mediaType = MediaEnum.VIDEO;
    } else if (mediaUrl?.includes('.ai')) {
      mediaIcon = 'assets/images/chatbot/xls.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.avi')) {
      mediaIcon = 'assets/images/chatbot/avi.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.bmp')) {
      mediaIcon = 'assets/images/chatbot/bmp.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.cad')) {
      mediaIcon = 'assets/images/chatbot/cad.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.cdr')) {
      mediaIcon = 'assets/images/chatbot/cdr.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.css')) {
      mediaIcon = 'assets/images/chatbot/css.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.eps')) {
      mediaIcon = 'assets/images/chatbot/eps.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.html')) {
      mediaIcon = 'assets/images/chatbot/html.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.iso')) {
      mediaIcon = 'assets/images/chatbot/iso.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.js')) {
      mediaIcon = 'assets/images/chatbot/js.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.php')) {
      mediaIcon = 'assets/images/chatbot/php.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.ppt')) {
      mediaIcon = 'assets/images/chatbot/ppt.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.psd')) {
      mediaIcon = 'assets/images/chatbot/psd.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.raw')) {
      mediaIcon = 'assets/images/chatbot/raw.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.sql')) {
      mediaIcon = 'assets/images/chatbot/sql.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.tif')) {
      mediaIcon = 'assets/images/chatbot/tif.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.txt')) {
      mediaIcon = 'assets/images/chatbot/txt.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.xml')) {
      mediaIcon = 'assets/images/chatbot/xml.svg';
      mediaType = MediaEnum.FILE;
    } else if (mediaUrl?.includes('.zip')) {
      mediaIcon = 'assets/images/chatbot/ZIP.svg';
      mediaType = MediaEnum.FILE;
    }

    return {
      mediaType,
      mediaIcon,
    };
  }

  setMedia(mediaContent: MediaContent[], channelGroup, url): MediaContent[] {
    for (const mediaItem of mediaContent) {
      // if (channelGroup === ChannelGroup.WhatsApp) {
      //   if (
      //     mediaItem.mediaType === MediaEnum.IMAGE ||
      //     mediaItem.mediaType === MediaEnum.VIDEO ||
      //     mediaItem.mediaType === MediaEnum.AUDIO
      //   ) {
      //     // mediaItem.mediaUrl = `${url}/api/WebHook/GetPrivateMediaS3?keyName=${mediaItem.mediaUrl}&MimeType=${mediaItem.thumbUrl}`;
      //   } else if (
      //     mediaItem.mediaType === MediaEnum.PDF ||
      //     mediaItem.mediaType === MediaEnum.DOC ||
      //     mediaItem.mediaType === MediaEnum.EXCEL ||
      //     mediaItem.mediaType === MediaEnum.OTHER
      //   ) {
      //     if (mediaItem?.mediaUrl) {
      //       if (
      //         mediaItem.mediaUrl.includes('.doc') ||
      //         mediaItem.mediaUrl.includes('.docx') ||
      //         (mediaItem.mediaUrl && mediaItem.mediaUrl.includes('.pdf'))
      //       ) {
      //         // mediaItem.mediaUrl = `${url}/api/WebHook/GetPrivateMediaS3?keyName=${mediaItem.mediaUrl}&MimeType=${mediaItem.thumbUrl}`;
      //       } else {
      //         mediaItem.mediaUrl = `${url}/api/WebHook/GetPrivateMediaS3?keyName=${mediaItem.mediaUrl}&MimeType=${mediaItem.thumbUrl}&FileName=${mediaItem.name}`;
      //       }
      //     }
      //   }
      // } else
      if (channelGroup === ChannelGroup.Facebook) {
        if (
          mediaItem.mediaType === MediaEnum.IMAGE ||
          mediaItem.mediaType === MediaEnum.ANIMATEDGIF
        ) {
          if (mediaItem.thumbUrl.includes('s3.amazonaws')) {
            const mimeType = MimeTypes.getMimeTypefromString(
              mediaItem.thumbUrl.split('.').pop()
            );
            const ReplaceText =
              'https://s3.amazonaws.com/locobuzz.socialimages/';
            let ThumbUrl = mediaItem.thumbUrl;
            ThumbUrl = ThumbUrl.replace(ReplaceText, '');
            mediaItem.mediaUrl = `${url}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${mediaItem.name}`;
          } else {
            mediaItem.mediaUrl = `${mediaItem.thumbUrl}`;
          }
        } else if (mediaItem.mediaType === MediaEnum.VIDEO) {
          if (mediaItem.thumbUrl.includes('s3.amazonaws')) {
            const mimeType = MimeTypes.getMimeTypefromString(
              mediaItem.thumbUrl.split('.').pop()
            );
            const ReplaceText =
              'https://s3.amazonaws.com/locobuzz.socialimages/';
            let ThumbUrl = mediaItem.thumbUrl;
            ThumbUrl = ThumbUrl.replace(ReplaceText, '');
            mediaItem.thumbUrl = `${url}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${mediaItem.name}`;
          }
        }
      } else if (channelGroup === ChannelGroup.Instagram) {
        var key = mediaItem.thumbUrl
          ? mediaItem.thumbUrl.replace(
              'https://s3.amazonaws.com/locobuzz.socialimages/',
              ''
            )
          : 'https://s3.amazonaws.com/';

        if (
          mediaItem.mediaType === MediaEnum.AUDIO ||
          mediaItem.mediaType === MediaEnum.IMAGE ||
          mediaItem.mediaType === MediaEnum.VIDEO
        ) {
          mediaItem.mediaUrl = !mediaItem.mediaUrl
            ? `${url}/api/WebHook/GetPrivateMediaS3?keyName=${key}&MimeType=image/jpeg&FileName=${mediaItem.name}`
            : mediaItem.mediaUrl;
        } else {
          mediaItem.mediaUrl = `${url}/api/WebHook/GetPrivateMediaS3?keyName=${key}&MimeType=image/jpeg&FileName=${mediaItem.name}`;
        }
      }
      const mediaIconAndType = this.getMediaTypebyExtension(
        mediaItem?.mediaUrl,
        mediaItem?.mediaType
      );
      mediaItem.mediaIcon = mediaIconAndType
        ? mediaIconAndType.mediaIcon
        : null;
    }
    return mediaContent;
  }

  private mediaTypeLoader(
    attachmentMetadata?: AttachmentMetadata,
    description?: string,
    messageTypeStr?: string
  ): { attachmentType?: number; mediaContent?: any } {
    const mediaObj: mediaObj = {
      attachmentType: null,
      mediaContent: null,
      attachmentIcon: null,
    };

    let attachmentObj: { [key: string]: any };

    const messageType = messageTypeStr ? messageTypeStr.toLowerCase() : 'NOTE';
    const messageArray: Array<any> = [];
    if (messageType === 'location') {
      mediaObj.attachmentType = MediaEnum.LOCATIONS;
      mediaObj.mediaContent.push({
        mediaUrl: attachmentMetadata.mediaContents[0].mediaUrl,
        mediaType: MediaEnum.LOCATIONS,
      });
    }

    if (
      messageType !== 'text' &&
      attachmentMetadata &&
      attachmentMetadata.mediaContents &&
      attachmentMetadata.mediaContents.length > 0
    ) {
      attachmentMetadata.mediaContents.forEach((mediaItem, index) => {
        const messagetext = mediaItem.name;
        if (messagetext != null && LocobuzzUtils.isJSON(messagetext)) {
          const media = JSON.parse(messagetext);
          const mediaIsArray = !!media && media.constructor === Array;
          if (media?.message) {
            if (media.message.hasOwnProperty('quick_replies')) {
              if (
                media.message.quick_replies &&
                media.message.quick_replies.length === 1 &&
                media.message.quick_replies[0].content_type === 'location'
              ) {
                // quick reply locations
                mediaObj.attachmentType = MediaEnum.QUICKREPLYLOCATION;
                mediaObj.mediaContent = [];
                return mediaObj;
              } else if (
                media.message?.quick_replies &&
                media.message.quick_replies?.length > 0 &&
                media.message?.quick_replies[0].hasOwnProperty('image_url')
              ) {
                // quick replies payload buttons with icons
                const mediaCopy = JSON.parse(JSON.stringify(media));
                mediaObj.attachmentType = MediaEnum.PAYLOADBUTTONSWITHICONS;
                mediaObj.mediaContent = [
                  {
                    text: mediaCopy.message.text,
                    quickReplyButtons: mediaCopy.message.quick_replies,
                  },
                ];
                return mediaObj;
              } else if (
                media.message?.quick_replies &&
                media.message?.quick_replies.length > 0 &&
                !media.message?.quick_replies[0].hasOwnProperty('image_url')
              ) {
                // quick replies buttons
                const mediaCopy = JSON.parse(JSON.stringify(media));
                mediaObj.attachmentType = MediaEnum.QUICKREPLY;
                mediaObj.mediaContent = [
                  {
                    text: mediaCopy.message.text,
                    quickReplyButtons: mediaCopy,
                    mediaType: MediaEnum.QUICKREPLY,
                  },
                ];
                return mediaObj;
              }
            }
            if (
              media.message.hasOwnProperty('text') &&
              !media.message.hasOwnProperty('quick_replies')
            ) {
              mediaObj.attachmentType = MediaEnum.TEXT;
              // simple Text
              mediaObj.mediaContent = [
                {
                  text: media.message.text,
                  quickReplyButtons: null,
                },
              ];
              return mediaObj;
            }
            if (media.message.hasOwnProperty('attachment')) {
              if (media.message?.attachment.hasOwnProperty('type')) {
                if (media.message.attachment.type === 'image') {
                  // single image
                  const mediaCopy = JSON.parse(JSON.stringify(media));
                  mediaObj.attachmentType = MediaEnum.IMAGE;
                  mediaObj.mediaContent = [
                    {
                      mediaUrl: mediaCopy.message.attachment.payload.url,
                      mediaType: MediaEnum.IMAGE,
                    },
                  ];
                  return mediaObj;
                } else if (media.message?.attachment?.type === 'video') {
                  // video
                  const mediaCopy = JSON.parse(JSON.stringify(media));
                  mediaObj.attachmentType = MediaEnum.VIDEO;
                  mediaObj.mediaContent = [
                    {
                      mediaUrl: mediaCopy.message.attachment.payload.url,
                      mediaType: MediaEnum.VIDEO,
                    },
                  ];
                  return mediaObj;
                } else if (media.message?.attachment?.type === 'audio') {
                  const mediaCopy = JSON.parse(JSON.stringify(media));
                  mediaObj.attachmentType = MediaEnum.AUDIO;
                  mediaObj.mediaContent = [
                    {
                      mediaUrl: mediaCopy.message.attachment.payload.url,
                      mediaType: MediaEnum.AUDIO,
                      attachmentObj: {
                        iconPlay: true,
                        iconPause: false,
                        audioGroupIndex: null,
                        audioChatIndex: null,
                      },
                    },
                  ];
                  return mediaObj;

                  // mediaItem.mediaType = MediaEnum.AUDIO;
                } else if (media.message?.attachment?.type === 'file') {
                  // file
                  const mediaCopy = JSON.parse(JSON.stringify(media));
                  const fileName = mediaCopy.message.attachment.payload.url
                    .replace(/^.*[\\\/]/, '')
                    .split('?')[0];
                  mediaObj.attachmentType = MediaEnum.FILE;

                  // if (
                  //   mediaItem.mediaUrl.includes('.xls') ||
                  //   mediaItem.mediaUrl.includes('.xlsx')
                  // ) {
                  //   mediaItem.mediaType = MediaEnum.EXCEL;
                  //   mediaObj.attachmentIcon = 'assets/images/chatbot/xls.svg';
                  // } else if (mediaItem.mediaUrl.includes('.mp3')) {
                  //   mediaItem.mediaType = MediaEnum.AUDIO;
                  // } else if (mediaItem.mediaUrl.includes('.doc') || mediaItem.mediaUrl.includes('.docx')) {
                  //   mediaObj.attachmentIcon = 'assets/images/chatbot/doc.svg';
                  //   mediaItem.mediaType = MediaEnum.DOC;
                  // } else if (mediaItem.mediaUrl.includes('.pdf')) {
                  //   mediaObj.attachmentIcon = 'assets/images/chatbot/pdf.svg';
                  //   mediaItem.mediaType = MediaEnum.PDF;
                  // }
                  let mediaTypebyExtension;
                  if (mediaItem) {
                    mediaTypebyExtension = this.getMediaTypebyExtension(
                      mediaItem.mediaUrl ||
                        mediaCopy?.message?.attachment?.payload?.url,
                      mediaItem.mediaType
                    );
                  }
                  if (mediaTypebyExtension?.mediaType) {
                    mediaItem.mediaType = mediaTypebyExtension.mediaType;
                    mediaObj.attachmentIcon = mediaTypebyExtension.mediaIcon;
                    mediaObj.attachmentType = mediaTypebyExtension.mediaType;
                  }
                  mediaObj.mediaContent = [
                    {
                      mediaIcon: mediaTypebyExtension.mediaIcon,
                      name: fileName,
                      mediaUrl: mediaCopy.message.attachment.payload.url,
                    },
                  ];

                  return mediaObj;
                } else if (
                  media.message?.attachment?.type === 'template' &&
                  !media.message?.attachment?.payload.hasOwnProperty(
                    'buttons'
                  ) &&
                  (media.message?.attachment?.payload?.elements.length > 0 &&
                  !media.message?.attachment?.payload?.elements[0].hasOwnProperty(
                    'subtitle'
                  ))
                ) {
                  // Image with subtitle
                  mediaObj.attachmentType = MediaEnum.IMAGEWITHSUBTITLE;
                  mediaObj.mediaContent = [
                    {
                      mediaUrl:
                        media.message?.attachment?.payload?.elements[0]
                          ?.image_url,
                      title:
                        media.message?.attachment?.payload?.elements[0]?.title,
                    },
                  ];
                  return mediaObj;
                } else if (
                  media.message?.attachment.type === 'template' &&
                  !media.message?.attachment?.payload.hasOwnProperty(
                    'buttons'
                  ) &&
                  media.message?.attachment?.payload?.elements.length === 1 &&
                  !media.message?.attachment?.payload?.elements[0].hasOwnProperty(
                    'buttons'
                  )
                ) {
                  // Image with title
                  mediaObj.attachmentType = MediaEnum.IMAGEWITHSUBTITLE;
                  mediaObj.mediaContent = [
                    {
                      mediaUrl:
                        media.message.attachment.payload.elements[0].image_url,
                      title: media.message.attachment.payload.elements[0].title,
                    },
                  ];
                  return mediaObj;
                }
              }
            }

            if (media?.message.hasOwnProperty('attachment')) {
              if (media.message?.attachment.hasOwnProperty('payload')) {
                if (
                  media.message.attachment?.payload?.template_type === 'button'
                ) {
                  // Payload Button
                  const mediaCopy = JSON.parse(JSON.stringify(media));
                  mediaObj.attachmentType = MediaEnum.PAYLOADBUTTONS;
                  mediaObj.mediaContent = [
                    {
                      text:
                        mediaCopy?.message?.text ||
                        mediaCopy.message.attachment.payload?.text,
                      buttons: mediaCopy.message.attachment.payload.buttons,
                    },
                  ];
                  return mediaObj;
                }
              }
            }

            if (media?.message.hasOwnProperty('attachment')) {
              if (media.message?.attachment.hasOwnProperty('payload')) {
                if (
                  media.message.attachment?.payload.hasOwnProperty('elements')
                ) {
                  if (
                    media.message.attachment.payload?.elements.length && media.message.attachment.payload?.elements[0].hasOwnProperty(
                      'buttons'
                    )
                  ) {
                    // slider with buttons
                    const mediaCopy = JSON.parse(JSON.stringify(media));
                    mediaObj.attachmentType = MediaEnum.SLIDERBUTTONS;
                    mediaObj.mediaContent = [
                      {
                        text: null,
                        buttons: mediaCopy.message.attachment.payload.elements,
                      },
                    ];
                    attachmentObj = {
                      attachmentHeight: null,
                    };
                    let size = 0;
                    let maxSize = 0;
                    if (
                      mediaObj?.mediaContent?.length > 0 &&
                      mediaObj.mediaContent[0]?.buttons?.length > 0
                    ) {
                      mediaObj.mediaContent[0].buttons.forEach((item) => {
                        if (item?.buttons?.length > 0) {
                          size = 46 * item.buttons.length;
                        }

                        if (item?.image_url !== 'null') {
                          size = size + 150;
                        }

                        if (item?.title?.includes('null')) {
                          size = size - 20;
                        } else if (item?.title.length > 0) {
                          size = size + Math.ceil(item.title.length / 28) * 24;
                        }

                        if (item?.subtitle?.includes('null')) {
                          size = size - 20;
                        } else if (item?.subtitle.length > 0) {
                          size =
                            size + Math.ceil(item.subtitle.length / 33) * 24;
                        }

                        if (size >= maxSize) {
                          maxSize = size;
                        }
                      });

                      attachmentObj.attachmentHeight = `${maxSize + 100}px`;
                    }
                    mediaObj.mediaContent[0].attachmentObj = attachmentObj;
                    return mediaObj;
                  } else {
                    if (media.message.attachment.payload?.elements.length &&
                      media.message.attachment.payload?.elements[0].hasOwnProperty(
                        'subtitle'
                      )
                    ) {
                      // Slider without button
                      const mediaCopy = JSON.parse(JSON.stringify(media));
                      mediaObj.attachmentType = MediaEnum.SLIDERNOBUTTONS;
                      mediaObj.mediaContent = [
                        {
                          text: null,
                          buttons:
                            mediaCopy.message.attachment.payload.elements,
                        },
                      ];
                      attachmentObj = {
                        attachmentHeight: null,
                      };
                      let size = 0;
                      let maxSize = 0;
                      if (
                        media?.mediaContent?.length > 0 &&
                        media.mediaContent[0]?.buttons?.length > 0
                      ) {
                        media.mediaContent[0].buttons.forEach((item) => {
                          if (item?.buttons?.length > 0) {
                            size = 46 * item.buttons.length;
                          }

                          if (item?.image_url !== 'null') {
                            size = size + 150;
                          }

                          if (item?.title?.includes('null')) {
                            size = size - 20;
                          } else if (item?.title.length > 0) {
                            size =
                              size + Math.ceil(item.title.length / 28) * 24;
                          }

                          if (item?.subtitle?.includes('null')) {
                            size = size - 20;
                          } else if (item?.subtitle.length > 0) {
                            size =
                              size + Math.ceil(item.subtitle.length / 28) * 24;
                          }

                          if (size >= maxSize) {
                            maxSize = size;
                          }
                        });

                        attachmentObj.attachmentHeight = `${maxSize + 100}px`;
                      }
                      mediaObj.mediaContent[0].attachmentObj = attachmentObj;
                      return mediaObj;
                    }
                  }
                }
              }
            }
          } else if (mediaIsArray) {
            if (mediaItem.mediaType === MediaEnum.CONTACT) {
              const contactarr = description.split('\n');
              var arr = [];
              contactarr.splice(0, 1);
              if (contactarr.length > 1) {
                for (let i = 0; i < contactarr.length; i += 2) {
                  let obj = {
                    name: contactarr[i].split(':')[1],
                    phoneno: contactarr[i + 1].split(':')[1].split(','),
                  };
                  arr.push(obj);
                }
                attachmentObj = {
                  contact: arr,
                };
                mediaObj.attachmentType = MediaEnum.CONTACT;
              }

              messageArray.push({
                name: mediaItem.name,
                thumbUrl: mediaItem.thumbUrl,
                mediaUrl: mediaItem.mediaUrl,
                mediaType: mediaItem.mediaType,
                mediaIcon: mediaObj.attachmentIcon,
                attachmentObj: attachmentObj,
              });
              mediaObj.mediaContent = messageArray;
            }
          } else {
            if (mediaItem?.mediaType === MediaEnum.LOCATIONS) {
              const mapLink =
                '//maps.google.com/maps?q=' +
                media.latitude +
                ',' +
                media.longitude +
                '&z=18&output=embed';
              const trustedURL = this._sanitizer.bypassSecurityTrustResourceUrl(
                mapLink
              );
              attachmentObj = {
                latitude: media.latitude,
                longitude: media.longitude,
                trustedURL: trustedURL
              };
              messageArray.push({
                name: mediaItem.name,
                thumbUrl: mediaItem.thumbUrl,
                mediaUrl: mediaItem.mediaUrl,
                mediaType: mediaItem.mediaType,
                mediaIcon: mediaObj.attachmentIcon,
                attachmentObj: attachmentObj,
              });
              mediaObj.mediaContent = messageArray;
              mediaObj.attachmentType = mediaItem.mediaType;
            }
          }
        } else if (messagetext && messagetext.includes('STICKER|')) {
          mediaObj.attachmentType = MediaEnum.STICKER;
          const imgID =
            'divSticker' + Math.floor(Math.random() * Math.floor(1000));
          const arry = messagetext.replace(/\_/g, ' ').split('|');
          const imgurl =
            'https://app.cxmonk.com/images/linestickers/' + arry[2] + '.jpg';
          messageArray.push({
            imageID: imgID,
            imageUrl: imgurl,
          });
          mediaObj.mediaContent = messageArray;
        } else if (messagetext === 'get_started_ping') {
          mediaObj.attachmentType = MediaEnum.PING;
          messageArray.push('Get Started');
          mediaObj.mediaContent = messageArray;
        } else if (attachmentMetadata) {
          // mediaObj.attachmentType = MediaEnum.IMAGEANDVIDEOGROUP;
          // messageArray.push({
          //   name: mediaItem.name,
          //   thumbUrl: mediaItem.thumbUrl,
          //   mediaUrl: mediaItem.mediaUrl,
          //   mediaType: mediaItem.mediaType,
          // });
          // mediaObj.mediaContent = messageArray;
          if (!mediaItem.mediaUrl && mediaItem.name) {
            mediaItem.mediaUrl = mediaItem.name;
          }
          if (mediaItem.mediaType === MediaEnum.LOCATIONS) {
            mediaObj.attachmentType = MediaEnum.LOCATIONS;
            let locationArr;
            if (description.includes('https://maps.google.com/maps')) {
              const locationUrlToArray = description.split('=');
              if (locationUrlToArray.length > 1) {
                locationArr = locationUrlToArray[1].split(',');
                if (locationArr.length > 1) {
                  attachmentObj = {
                    latitude: +locationArr[0],
                    longitude: +locationArr[1],
                  };
                }
              }
            } else {
              locationArr = description.includes(',')
                ? description.split(',')
                : description.split('\n');
              if (locationArr.length > 1) {
                attachmentObj = {
                  latitude: +locationArr[0].split(':')[1],
                  longitude: +locationArr[1].split(':')[1],
                };
              }
            }
          } else if (mediaItem.mediaType === MediaEnum.IMAGE) {
            mediaObj.attachmentType = MediaEnum.IMAGE;
            if (!mediaItem?.mediaUrl || mediaItem?.mediaUrl?.trim() === '') {
              mediaItem.mediaUrl = mediaItem.name;
            }
          } else if (
            mediaItem.mediaType === MediaEnum.CONTACT &&
            description !== ''
          ) {
            const contactarr = description.split('\n');
            var arr = [];
            contactarr.splice(0, 1);
            if (contactarr.length > 1) {
              for (let i = 0; i < contactarr.length; i += 2) {
                let obj = {
                  name: contactarr[i].split(':')[1],
                  phoneno: contactarr[i + 1].split(':')[1].split(','),
                };
                arr.push(obj);
              }
              mediaObj.attachmentType = MediaEnum.CONTACT;
              attachmentObj = {
                contact: arr,
              };
              mediaObj.attachmentType = MediaEnum.CONTACT;
            }
          } else {
            let mediaTypebyExtension;

            if (mediaItem) {
              mediaTypebyExtension = this.getMediaTypebyExtension(
                mediaItem.mediaUrl,
                mediaItem.mediaType
              );
            }
            if (mediaTypebyExtension.mediaType) {
              mediaItem.mediaType = mediaTypebyExtension.mediaType;
              mediaObj.attachmentIcon = mediaTypebyExtension.mediaIcon;
              mediaObj.attachmentType = mediaTypebyExtension.mediaType;
            }
            if (
              mediaItem.name === 'share' ||
              mediaItem.name === 'story_mention'
            ) {
              mediaObj.attachmentType = MediaEnum.IMAGE;
              mediaItem.mediaType = MediaEnum.IMAGE;
            }
          }

          messageArray.push({
            name: mediaItem.name,
            thumbUrl: mediaItem.thumbUrl,
            mediaUrl: mediaItem.mediaUrl,
            mediaType: mediaItem.mediaType,
            mediaIcon: mediaObj.attachmentIcon,
            attachmentObj: attachmentObj,
          });
          mediaObj.mediaContent = messageArray;
        }
      });
    }
    return mediaObj;
  }

  private BuildCommunicationLog(
    baseMention: BaseMention,
    replyType,
    sendFeedBack?
  ): TicketsCommunicationLog[] {
    const tasks: TicketsCommunicationLog[] = [];
    const selectedReplyType = replyType;
    switch (+selectedReplyType) {
      case ActionStatusEnum.ReplyAndAwaitingCustomerResponse: {
        const log1 = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        const log2 = new TicketsCommunicationLog(
          ClientStatusEnum.CustomerInfoAwaited
        );
        tasks.push(log1);
        tasks.push(log2);
        // this.replyLinkCheckbox.forEach((obj) => {
        //   if (obj.checked && obj.replyLinkId === Replylinks.SendFeedback) {
        //     const log3 = new TicketsCommunicationLog(
        //       ClientStatusEnum.FeedbackSent
        //     );
        //     tasks.push(log3);
        //   }
        // });

        baseMention.ticketInfo.makerCheckerStatus =
          MakerCheckerEnum.ReplyAwaitingResponse;

        break;
      }
      case ActionStatusEnum.ReplyAndClose: {
        const log1 = new TicketsCommunicationLog(
          ClientStatusEnum.RepliedToUser
        );
        const log2 = new TicketsCommunicationLog(ClientStatusEnum.Closed);

        tasks.push(log1);
        tasks.push(log2);
        // this.replyLinkCheckbox.forEach((obj) => {
        if (sendFeedBack) {
            const log3 = new TicketsCommunicationLog(
              ClientStatusEnum.FeedbackSent
            );
            tasks.push(log3);
          }
        // });

        baseMention.ticketInfo.makerCheckerStatus = MakerCheckerEnum.ReplyClose;
        break;
      }
      default:
        break;
    }
    tasks.forEach((obj) => {
      obj.TagID = String(baseMention.tagID);
    });
    return tasks;
  }

  checkReplyMessageExpiry(): void {
    const keyObj = {
      brandInfo: this.selectedBaseMention.brandInfo,
      authorId: this.selectedBaseMention.author.socialId,
      SubChannel: this.selectedBaseMention.channelType,
    };
    if (this.selectedBaseMention.channelGroup === ChannelGroup.WhatsApp) {
      this._replyService.getLastMentionTime(keyObj).subscribe((data) => {
        if (data.success) {
          const mentiondate = moment.utc(data.data).unix();
          const currentDateMinus24 = moment
            .utc()
            .subtract({ hours: 24 })
            .unix();
          if (mentiondate < currentDateMinus24) {
            const obj: ReplyTimeExpire = {
              message: this.translate.instant('Message-received-than-24'),
              baseMention: this.selectedBaseMention,
              status: true,
            };
            this.chatExpiredStatus.next(obj);
          } else {
            const obj: ReplyTimeExpire = {
              message: null,
              baseMention: null,
              status: false,
            };
            this.chatExpiredStatus.next(obj);
          }
        }
      });
    }
  }

  toggleChatBox(toggleStatus): void {
    this.chatdialogOpen = toggleStatus;
  }

  markMessageOnSend(
    status: boolean,
    channelGroupId?: number,
    socialId?: string,
    ticketId?: number,
    brandId?: number
  ) {
    const indices = this.getIndex(channelGroupId, socialId, brandId, ticketId);
    const channelIndexToUpdate = channelGroupId
      ? indices.channelIndex
      : this.sentChatData[0].channelIndex;
    if (channelIndexToUpdate >= 0) {
      const userIndexToUpdate = socialId
        ? indices.authorIndex
        : this.sentChatData[0].userIndex;
      if (userIndexToUpdate >= 0) {
        const ticketIndexToUpdate = ticketId
          ? indices.ticketIndex
          : this.sentChatData[0].ticketIndex;

        // this.chatObj[channelIndexToUpdate].userProfiles[
        //   userIndexToUpdate
        // ].openTickets[ticketToUpdate].mentions.splice(this.sentChatData[0].mentionIndex, 1);
        if (ticketIndexToUpdate >= 0) {
          if (this.sentChatData.length > 0) {
            this.chatObj[channelIndexToUpdate].userProfiles[
              userIndexToUpdate
            ].openTickets[ticketIndexToUpdate].chats[
              this.sentChatData[0].chatGroupIndex
            ].chats[this.sentChatData[0].chatItemIndex].isMessageSent = status;
            this.sentChatData.shift();
          } else {
            const mentions =
              this.chatObj[channelIndexToUpdate].userProfiles[userIndexToUpdate]
                .openTickets[ticketIndexToUpdate].mentions[0];
            if (
              mentions &&
              mentions?.chatGroupIndex >= 0 &&
              mentions?.chatItemIndex >= 0
            ) {
              this.chatObj[channelIndexToUpdate].userProfiles[
                userIndexToUpdate
              ].openTickets[ticketIndexToUpdate].chats[
                mentions.chatGroupIndex
              ].chats[mentions.chatItemIndex].isMessageSent = status;
            }
          }
        }
      }
    }
  }
  private updateStateEvents(event: Event): void {
    switch (event.type) {
      case 'canplay':
        this.state.duration = this.audioObj.duration;
        this.state.readableDuration = this.formatTime(this.state.duration);
        this.state.canplay = true;
        break;
      case 'playing':
        this.state.playing = true;
        break;
      case 'pause':
        this.state.playing = false;
        break;
      case 'timeupdate':
        this.state.currentTime = this.audioObj.currentTime;
        this.state.readableCurrentTime = this.formatTime(
          this.state.currentTime
        );
        break;
      case 'error':
        this.resetState();
        this.state.error = true;
        break;
    }
    this.stateChange.next(this.state);
  }

  private resetState() {
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false,
    };
  }

  getState(): Observable<StreamState> {
    return this.stateChange.asObservable();
  }

  private streamObservable(url) {
    return new Observable((observer) => {
      // Play audio
      this.audioObj.src = url;
      this.audioObj.load();
      this.audioObj.play();

      const handler = (event: Event) => {
        this.updateStateEvents(event);
        observer.next(event);
      };

      this.addEvents(this.audioObj, this.audioEvents, handler);
      return () => {
        // Stop Playing
        this.audioObj.pause();
        this.audioObj.currentTime = 0;
        // remove event listeners
        this.removeEvents(this.audioObj, this.audioEvents, handler);
        // reset state
        this.resetState();
      };
    });
  }

  private addEvents(obj, events, handler) {
    events.forEach((event) => {
      obj.addEventListener(event, handler);
    });
  }

  private removeEvents(obj, events, handler) {
    events.forEach((event) => {
      obj.removeEventListener(event, handler);
    });
  }

  playStream(url) {
    return this.streamObservable(url).pipe(takeUntil(this.stop$));
  }

  play() {
    this.audioObj.play();
  }

  pause() {
    this.audioObj.pause();
  }

  stop() {
    this.stop$.next(null);
  }

  seekTo(seconds) {
    this.audioObj.currentTime = seconds;
  }

  // setVolume(volume) {
  //   this.audioObj.volume = volume;
  // }

  formatTime(time: number, format: string = 'mm:ss') {
    const momentTime = time * 1000;
    return moment.utc(momentTime).format(format);
  }

  SetCRMButton(
    postCRMdata: BrandList,
    // currentUser: AuthUser,
    // chatlog: Chatlog,
    mention: BaseMention,
    // pageType: PostsType
  ): any {
    const currentUser = this.localStorageService.getCurrentUserData();

    mention.chatbotCrmObj = {
      crmcreatereqpop: false,
      createLead: false,
      crmmobilenopopup:false,
      salesForceCrm: false,
      animalWelfare: false,
      isDirectCloseVisible: false,
      createSR: false
    }
    if (
      postCRMdata.crmType === CrmType.Telecom &&
      postCRMdata.crmClassName.toLowerCase() === 'jiocrm' &&
      (mention.channelGroup === ChannelGroup.Facebook ||
        mention.channelGroup === ChannelGroup.Twitter) &&
      currentUser?.data?.user?.actionButton?.crmEnabled
    ) {
      mention.chatbotCrmObj.crmmobilenopopup = true;
    } else if (
      postCRMdata.crmType === CrmType.NonTelecom &&
      +currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
       currentUser.data.user.role !== UserRoleEnum.BrandAccount &&
      ((postCRMdata.crmClassName.toLowerCase() === 'titancrm' &&
        (mention.channelGroup === ChannelGroup.WhatsApp ||
          mention.channelGroup === ChannelGroup.Facebook ||
          mention.channelGroup === ChannelGroup.Twitter ||
          mention.channelGroup === ChannelGroup.Instagram ||
          mention.channelGroup === ChannelGroup.GoogleMyReview ||
          mention.channelGroup === ChannelGroup.Youtube)) ||
        postCRMdata.crmClassName.toLowerCase() === 'magmacrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'fedralcrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'bandhancrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'apollocrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'tataunicrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'recrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'extramarkscrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'octafxcrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'salesforcecrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'freshworkcrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'animalwelfarecrm' ||
        postCRMdata.crmClassName.toLowerCase() === 'dreamsolcrm' || postCRMdata.crmClassName.toLowerCase() === 'tatacapitalcrm' || postCRMdata.crmClassName.toLowerCase() === 'snapdealcrm' || postCRMdata.crmClassName.toLowerCase() == 'duraflexcrm') &&
       currentUser?.data?.user?.actionButton?.crmEnabled
    ) {
      // && pageType == PostsType.Tickets
      if (postCRMdata.typeOfCRM == 2 ) {
       mention.chatbotCrmObj.salesForceCrm = true;
       mention.chatbotCrmObj.createLead = true;
       mention.chatbotCrmObj.createSR = true;
      }
      // && pageType == PostsType.Tickets
      else if (postCRMdata.typeOfCRM == 3 ) {
       mention.chatbotCrmObj.salesForceCrm = true;
       mention.chatbotCrmObj.createLead = false;
       mention.chatbotCrmObj.createSR = true;
      }
      // && pageType == PostsType.Tickets
      else if (postCRMdata.typeOfCRM == 4 ) {
        mention.chatbotCrmObj.animalWelfare = true;
      }
      else {
        // CRM Create Request Popup
        // if (pageType == PostsType.Tickets) {
        mention.chatbotCrmObj.crmcreatereqpop = true;
        // }
      }
    }

    if (postCRMdata?.crmClassName.toLocaleLowerCase() == 'dreamsolcrm' && mention?.ticketInfo?.srid != null) {
     mention.chatbotCrmObj.isDirectCloseVisible = true;
    }
    return mention;
  }

  // changeNewText(chatIndices) {
  //   if (this.chatObj[chatIndices.channelIndex].userProfiles[
  //     chatIndices.authorIndex
  //   ].newUserText == 'New') {
  //     this.chatObj[chatIndices.channelIndex].userProfiles[
  //       chatIndices.authorIndex
  //     ].newUserText = ''
  //     this.chatObj[chatIndices.channelIndex].newUserFlag = this.chatObject[chatIndices.channelIndex].userProfiles.some(elem => {
  //       return elem.newUserText == 'New';
  //     })
  //     this.hasNewUser = this.chatObject.some(elem => { return elem.newUserFlag == true })
  //   }
  // }

  clearAllVariables() {
    // Resetting basic variables to initial states
    this.chatbotStatus = false;
    this.chatObj = [];
    this.chattotalCount = 0;
    this.usertotalCount = 0;
    this.chatdialogOpen = false;
    this.chatAudio = new Audio('assets/audio/chat-notification.mp3');
    this.assignAudio = new Audio('assets/audio/assign-notification.mp3');
    this.chatType = {
      chat: [
        'LocobuzzNG.Entities.Classes.Mentions.WebsiteChatbotMention',
        'LocobuzzNG.Entities.Classes.Mentions.WhatsAppMention',
        'LocobuzzNG.Entities.Classes.Mentions.FacebookMention',
        'LocobuzzNG.Entities.Classes.Mentions.InstagramMention',
        'LocobuzzNG.Entities.Classes.Mentions.GoogleBusinessMessagesMention'
      ],
      log: 'LocoBuzzRespondDashboardMVCBLL.Classes.TicketClasses.CommunicationLog',
    };
    this.sentChatData = [];
    this.channelID = 2;
    this.activeUser = -1;
    this.activeChannel = 0;
    this.activeTicket = -1;
    this.selectedBaseMention = null;
    this.chatbotHide = false;
    this.selectedBrandList = [];
    this.chatSound = false;
    this.layout = null;
    this.sequenceData = [
      ChannelGroup.Facebook,
      ChannelGroup.Instagram,
      ChannelGroup.WhatsApp,
      ChannelGroup.WebsiteChatBot,
      ChannelGroup.GoogleBusinessMessages,
      ChannelGroup.Telegram,
    ];
    this.channelIcon = [
      {
        name: 'Website',
        image: ChannelImage.WhatsApp,
        channelId: ChannelGroup.WebsiteChatBot,
        channelType: ChannelType.WhatsAppChatbot,
      },
      {
        name: 'Website',
        image: ChannelImage.Messenger,
        channelId: ChannelGroup.WebsiteChatBot,
        channelType: ChannelType.FacebookChatbot,
      },
      {
        name: 'Website',
        image: ChannelImage.WebsiteChatBot,
        channelId: ChannelGroup.WebsiteChatBot,
        channelType: ChannelType.WesiteChatbot,
      },
    ];
    this.channels = [];
    this.channelIds = [];
    this.state = {
      playing: false,
      readableCurrentTime: '',
      readableDuration: '',
      duration: undefined,
      currentTime: undefined,
      canplay: false,
      error: false,
    };
  }

}

