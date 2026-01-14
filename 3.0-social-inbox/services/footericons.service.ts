import { Injectable, Sanitizer } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelImage } from 'app/core/enums/ChannelImgEnum';
import { ChannelType } from 'app/core/enums/ChannelType';
import { CrmType } from 'app/core/enums/CrmEnum';
import { LogStatus } from 'app/core/enums/LogStatus';
import { MakerCheckerEnum } from 'app/core/enums/MakerCheckerEnum';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { Priority } from 'app/core/enums/Priority';
import { ReplyProcess } from 'app/core/enums/ReplyProcess';
import { SsreIntent } from 'app/core/enums/SsreIntentEnum';
import { SSRELogStatus, SSREMode } from 'app/core/enums/SsreLogStatusEnum';
import { TicketStatus } from 'app/core/enums/TicketStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { WhatsAppMessageStatus } from 'app/core/enums/WhatsAppMessageStatus';
import { TicketClient } from 'app/core/interfaces/TicketClient';
import { AuthUser } from 'app/core/interfaces/User';
import {
  AllBrandsTicketsDTO,
  AudioUrl,
  DocumentUrl,
  VideoUrl,
  fileUrl,
} from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { MimeTypes } from 'app/core/models/viewmodel/MimeTypes';
import { AccountService } from 'app/core/services/account.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import moment from 'moment';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { take } from 'rxjs/operators';
import { ChatBotService } from './chatbot.service';
import { FilterService } from './filter.service';
import { PostDetailService } from './post-detail.service';
import { ReplyService } from './reply.service';
import { TicketsService } from './tickets.service';
// import linkifyStr from 'linkifyjs/string';
// import decode from 'decode-html'
import { LocobuzzUtils } from '@locobuzz/utils';


import decode from 'decode-html'
import { AllMentionGroupView } from 'app/shared/components/post-options/post-options.component';
import { LocalStorageService } from './local-storage.service';
import { TranslateService } from '@ngx-translate/core';
@Injectable({
  providedIn: 'root',
})
export class FootericonsService {
  matClosePanel = new BehaviorSubject<boolean>(false);
  clickhouseEnabled: boolean=false;

  constructor(
    private MapLocobuzz: MaplocobuzzentitiesService,
    private _ticketService: TicketsService,
    private _postDetailService: PostDetailService,
    private _filterService: FilterService,
    private localStorageService: LocalStorageService,
    private translate: TranslateService
  ) {
      const currentUser = this.localStorageService.getCurrentUserData();
      if (currentUser && currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1) {
        this.clickhouseEnabled = true
      }
  }

  SetDefaultTicketHistoryData(
    ticketHistoryData: AllBrandsTicketsDTO,
    user: AuthUser
  ): any {
    ticketHistoryData.isCSDUser = false;
    ticketHistoryData.isBrandUser = false;
    ticketHistoryData.SLACounterStartInSecond = 0;
    ticketHistoryData.timetobreach = '';
    ticketHistoryData.alreadybreached = false;
    ticketHistoryData.typeOfShowTimeInSecond = 0;
    ticketHistoryData.iSEnableShowTimeInSecond = 0;
    ticketHistoryData.isBrandUser = false;
    ticketHistoryData.isReadOnlySupervisor = false;
    ticketHistoryData.isBrandWorkFlowEnabled = false;
    ticketHistoryData.isCSDApprove = false;
    ticketHistoryData.isCSDReject = false;
    ticketHistoryData.isemailattachement = false;
    ticketHistoryData.isAssignVisible = false;
    ticketHistoryData.isCurrentAssignToVisible = false;
    ticketHistoryData.isDirectCloseVisible = false;
    ticketHistoryData.isReplyVisible = false;
    ticketHistoryData.isAttachTicketVisible = false;
    ticketHistoryData.isCreateTicketVisible = false;
    ticketHistoryData.isEscalateVisible = false;
    ticketHistoryData.isTranslationVisible = false;
    ticketHistoryData.isEnableReplyApprovalWorkFlow = false;
    ticketHistoryData.isEnableDisableMakercheckerVisible = false;
    ticketHistoryData.isMarkInfluencerVisible = false;
    ticketHistoryData.isInfluencermarked = false;
    ticketHistoryData.isSendEmailVisible = false;
    ticketHistoryData.isApproveRejectMakerChecker = false;
    ticketHistoryData.isLiveSSRE = false;
    ticketHistoryData.isSSREVerified = false;
    ticketHistoryData.isSimulationSSRE = false;
    ticketHistoryData.isMakerCheckerPreview = false;
    ticketHistoryData.isForwardVisible = false;
    ticketHistoryData.MakerCheckerPreview = {
      messageContent: '',
      actionPerformed: '',
    };
    ticketHistoryData.isSSREPreview = false;
    ticketHistoryData.SSREPreview = {
      messageContent: '',
      actionPerformed: '',
    };
    ticketHistoryData.isTrendsVisible = false;
    ticketHistoryData.isCopyMoveVisible = false;
    ticketHistoryData.isDeleteFromLocobuzz = false;
    ticketHistoryData.isDeleteFromChannel = false;
    ticketHistoryData.isworkflowApproveVisible = false;
    ticketHistoryData.isworkflowRejectVisible = false;
    ticketHistoryData.isSSREEnabled = false;
    ticketHistoryData.isbreached = false;
    ticketHistoryData.isabouttobreach = false;
    ticketHistoryData.isBrandWorkFlow = false;
    ticketHistoryData.isTicketCategoryTagEnable = false;
    ticketHistoryData.isemailattachement = false;
    ticketHistoryData.ssretype = '';
    ticketHistoryData.tomaillist = '';
    ticketHistoryData.toMailList = [];
    ticketHistoryData.ccMailList = [];
    ticketHistoryData.bccMailList = [];
    ticketHistoryData.ismentionidVisible = false;
    ticketHistoryData.mentionid = '';
    ticketHistoryData.showTicketWindow = false;
    ticketHistoryData.showMarkactionable = false;
    ticketHistoryData.sendmailallmention = false;
    ticketHistoryData.setpriority = false;
    ticketHistoryData.showpriority = false;
    ticketHistoryData.showticketstatus = false;
    ticketHistoryData.isrejectedNote = false;
    ticketHistoryData.crmmobilenopopup = false;
    ticketHistoryData.crmcreatereqpop = false;
    ticketHistoryData.currentticketstatus = '';
    ticketHistoryData.currentassignTo = '';
    ticketHistoryData.currentassignToId='',
    ticketHistoryData.showcheckbox = false;
    ticketHistoryData.isticketcategorymapVisible = false;
    ticketHistoryData.isSubscribe = false;
    ticketHistoryData.viewparentpost = false;
    ticketHistoryData.isparentpostpopup = false;
    ticketHistoryData.audioUrls = [];
    ticketHistoryData.actionButton = user.data.user.actionButton;
    ticketHistoryData.isBrandPost = false;
    ticketHistoryData.replyString = '';
    ticketHistoryData.replyTicketIcon = '';
    ticketHistoryData.showActionableIcon = false;
    ticketHistoryData.showLanguageIcon = false;
    ticketHistoryData.languageName = '';
    ticketHistoryData.ticketProcessNote = '';
    ticketHistoryData.ticketProcessNoteFlag = false;
    ticketHistoryData.tweetExistsApiFlag = false;
    ticketHistoryData.hideUnhideShowIcon = false;
    ticketHistoryData.hideUnhideFacebookFlag = false;
    ticketHistoryData.hideUnhideInstagramFlag = false;
    ticketHistoryData.descriptionWithTitle = false;
    ticketHistoryData.videoIcon = false;
    ticketHistoryData.voipAudioUrls = [];
    ticketHistoryData.StoreCode = '';
    ticketHistoryData.locality = '';
    ticketHistoryData.locationName = '';
    ticketHistoryData.showVoipDesc = true;
    ticketHistoryData.downloadTemplate = false;
    ticketHistoryData.dispositionName = '';
    ticketHistoryData.toCCBCCArrowFlag = false;
    ticketHistoryData.viewComment = false;
    ticketHistoryData.isVOIPBrand=false;
    ticketHistoryData.showPendingMessageStatus=false;
    ticketHistoryData.goodReview='';
    ticketHistoryData.badReview=''
    ticketHistoryData.isMarkAllAsSeen = false;
    ticketHistoryData.showGroupView=false;
    ticketHistoryData.isMarkUnseen=false;
    ticketHistoryData.isMarkUneenBrandPost =false
    ticketHistoryData.makeParentPostSpamButton = false;
    ticketHistoryData.showBlackList = false;
    ticketHistoryData.replyDisabled = false;
    return ticketHistoryData;
  }

  SetUserRole(
    pageType: PostsType,
    ticketHistoryData: AllBrandsTicketsDTO,
    user: AuthUser,
    mention: BaseMention,
    currentBrand?:BrandList
  ): any {
    if (+user.data.user.role === UserRoleEnum.CustomerCare) {
      ticketHistoryData.isCSDUser = true;
    } else if (+user.data.user.role === UserRoleEnum.BrandAccount) {
      ticketHistoryData.isBrandUser = true;
    } else if (+user.data.user.role === UserRoleEnum.ReadOnlySupervisorAgent) {
      ticketHistoryData.isReadOnlySupervisor = true;
    }

    if (ticketHistoryData.isCSDUser) {

      if (
        pageType === PostsType.Tickets &&
        mention?.ticketInfo.status !== TicketStatus.Close &&
        mention?.ticketInfo.status !== TicketStatus.OnHoldCSD &&
        mention?.ticketInfoSsre.ssreStatus !== SSRELogStatus.SSREInProcessing &&
        mention?.ticketInfoSsre.ssreStatus !==
          SSRELogStatus.IntentFoundStillInProgress &&
        user.data.user.actionButton.allowAssignment
      ) {
        ticketHistoryData.isAssignVisible = true;
        // ticketHistoryData.isEscalateVisible = true;
      }
    } else if (ticketHistoryData.isBrandUser) {
      if (
        mention?.ticketInfo.status !== TicketStatus.Close &&
        mention?.ticketInfoSsre.ssreStatus !== SSRELogStatus.SSREInProcessing &&
        mention?.ticketInfoSsre.ssreStatus !==
          SSRELogStatus.IntentFoundStillInProgress
      ) {
        if (mention?.ticketInfo.status !== TicketStatus.ApprovedByBrand) {
          if (!ticketHistoryData.isReadOnlySupervisor) {
            if (
              +user.data.user.role === UserRoleEnum.Agent &&
              mention?.makerCheckerMetadata.workflowStatus ===
                LogStatus.ReplySentForApproval
            ) {
            } else {
              if (!mention?.isBrandPost || mention?.channelGroup == ChannelGroup.Voice) {
                ticketHistoryData.isDirectCloseVisible = true;
              }
              if (
                mention?.ticketInfo?.srid &&
                mention?.ticketInfo.status == TicketStatus.Open
              ) {
                const brandInfo = this._filterService.fetchedBrandData.find(
                  (obj) => obj.brandID == String(mention?.brandInfo.brandID)
                );
                if (brandInfo.isUpdateWorkflowEnabled) {
                  ticketHistoryData.isDirectCloseVisible = false;
                }
              }
            }
          }
        }
        if (user.data.user.actionButton.allowAssignment) { ticketHistoryData.isAssignVisible = true; }
      }
    } else {
      if (
        mention?.ticketInfo.status !== TicketStatus.Close &&
        mention?.ticketInfo.status !== TicketStatus.PendingwithCSD &&
        mention?.ticketInfo.status !== TicketStatus.PendingWithBrand &&
        mention?.ticketInfo.status !== TicketStatus.OnHoldCSD &&
        mention?.ticketInfoSsre.ssreStatus !== SSRELogStatus.SSREInProcessing &&
        mention?.ticketInfoSsre.ssreStatus !==
          SSRELogStatus.IntentFoundStillInProgress
      ) {
        const allowAssignement =
          user.data.user.actionButton.assignmentEnabled;
        if (
          (pageType === PostsType.Tickets ||
            (pageType === PostsType.TicketHistory && mention?.isActionable)) &&
          !ticketHistoryData.isReadOnlySupervisor &&
          user.data.user.role !== UserRoleEnum.Agent &&
          user?.data?.user?.role !== UserRoleEnum.TeamLead &&
          user.data.user.actionButton.allowAssignment
        ) {
          ticketHistoryData.isAssignVisible = true;
        }
        if (
          (user?.data?.user?.role === UserRoleEnum.Agent || user?.data?.user?.role === UserRoleEnum.TeamLead) &&
          allowAssignement
        ) {
          ticketHistoryData.isAssignVisible = true;
        }
      }
      if (
        mention?.ticketInfo.status !== TicketStatus.Close &&
        mention?.ticketInfo.status !== TicketStatus.PendingwithCSD &&
        mention?.ticketInfo.status !== TicketStatus.PendingWithBrand &&
        mention?.ticketInfo.status !==
          TicketStatus.PendingwithCSDWithNewMention &&
        mention?.ticketInfo.status !== TicketStatus.OnHoldCSD &&
        mention?.ticketInfo.status !== TicketStatus.OnHoldCSDWithNewMention &&
        mention?.ticketInfo.status !==
          TicketStatus.PendingWithBrandWithNewMention &&
        mention?.ticketInfo.status !== TicketStatus.OnHoldBrand &&
        // mention?.ticketInfo.status !== TicketStatus.RejectedByBrand &&
        mention?.ticketInfo.status !==
          TicketStatus.RejectedByBrandWithNewMention &&
        mention?.ticketInfo.status !== TicketStatus.OnHoldBrandWithNewMention &&
        mention?.ticketInfoSsre.ssreStatus !== SSRELogStatus.SSREInProcessing &&
        mention?.ticketInfoSsre.ssreStatus !==
          SSRELogStatus.IntentFoundStillInProgress
      ) {
        if (!ticketHistoryData.isReadOnlySupervisor) {
          if (
            +user.data.user.role === UserRoleEnum.Agent &&
            mention?.makerCheckerMetadata.workflowStatus ===
              LogStatus.ReplySentForApproval
          ) {
          } else {
            // if (!mention?.isBrandPost) {
            //   ticketHistoryData.isDirectCloseVisible = true;
            // }
            if (
              mention?.ticketInfo.status === TicketStatus.RejectedByBrand &&
              ticketHistoryData.isBrandWorkFlowEnabled
            ) {
            } else {
              if (!mention?.isBrandPost  || mention?.channelGroup == ChannelGroup.Voice) {
                ticketHistoryData.isDirectCloseVisible = true;
              } else {
                if (
                  mention?.channelGroup == ChannelGroup.Email &&
                  pageType == PostsType.Tickets
                ) {
                  ticketHistoryData.isDirectCloseVisible = true;
                }
              }
              if (
                mention?.ticketInfo?.srid &&
                mention?.ticketInfo.status == TicketStatus.Open
              ) {
                const brandInfo = this._filterService.fetchedBrandData.find(
                  (obj) => obj.brandID == String(mention?.brandInfo.brandID)
                );
                if (brandInfo.isUpdateWorkflowEnabled) {
                  ticketHistoryData.isDirectCloseVisible = false;
                }
              }
            }
          }
        }
      }
    }

    if (
      mention?.ticketInfo.status === TicketStatus.OnHoldAgent ||
      mention?.ticketInfo.status === TicketStatus.OnHoldBrand ||
      mention?.ticketInfo.status === TicketStatus.OnHoldCSD ||
      mention?.ticketInfo.status === TicketStatus.PendingwithCSD ||
      mention?.ticketInfo.status === TicketStatus.PendingWithBrand ||
      mention?.makerCheckerMetadata.workflowStatus ===
        LogStatus.ReplySentForApproval
    ) {
      ticketHistoryData.isCurrentAssignToVisible = true;
    }

    if (!ticketHistoryData.isCSDUser && !ticketHistoryData.isBrandUser) {
      if (
        mention?.ticketInfo.status ===
          TicketStatus.PendingwithCSDWithNewMention ||
        mention?.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention ||
        mention?.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention ||
        mention?.ticketInfo.status ===
          TicketStatus.RejectedByBrandWithNewMention ||
        mention?.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention
      ) {
        if (mention?.channelGroup === ChannelGroup.WhatsApp &&
          user?.data?.user?.actionButton?.replyEnabled &&
          !mention?.isBrandPost) {
          ticketHistoryData.isReplyVisible = true;
          if (!mention?.isBrandPost) {
            ticketHistoryData.sendmailallmention = true;
          }
        } else {
          if (
            mention?.ticketInfoSsre.ssreStatus !==
            SSRELogStatus?.SSREInProcessing &&
            mention?.ticketInfoSsre.ssreStatus !==
            SSRELogStatus?.IntentFoundStillInProgress &&
            user?.data?.user?.actionButton?.replyEnabled &&
            !mention?.isBrandPost
          ) {
            ticketHistoryData.isReplyVisible = true;
            if (!mention?.isBrandPost) {
              ticketHistoryData.sendmailallmention = true;
            }
          }
        }
        if (
          !mention?.isBrandPost &&
          user?.data?.user?.actionButton?.createNewTicketEnabled
        ) {
          ticketHistoryData.isCreateTicketVisible = true;
        }
        ticketHistoryData.isAcknowledge = true;
      } else if (
        mention?.ticketInfo.status !== TicketStatus.PendingwithCSD &&
        mention?.ticketInfo.status !== TicketStatus.PendingWithBrand &&
        mention?.ticketInfo.status !== TicketStatus.OnHoldCSD &&
        mention?.ticketInfo.status !== TicketStatus.OnHoldBrand
      ) {
        if (
          mention?.ticketInfo.status === TicketStatus.RejectedByBrand &&
          ticketHistoryData.isBrandWorkFlowEnabled
        ) {
        } else {
          if (
            mention?.channelGroup === ChannelGroup.Facebook ||
            mention?.channelGroup === ChannelGroup.Twitter ||
            mention?.channelGroup === ChannelGroup.Instagram ||
            mention?.channelGroup === ChannelGroup.LinkedIn ||
            mention?.channelGroup === ChannelGroup.GooglePlayStore ||
            mention?.channelGroup === ChannelGroup.Youtube ||
            mention?.channelGroup === ChannelGroup.Email ||
            mention?.channelGroup === ChannelGroup.GoogleMyReview ||
            mention?.channelGroup === ChannelGroup.GoogleBusinessMessages ||
            mention?.channelGroup === ChannelGroup.TikTok ||
            mention?.channelGroup === ChannelGroup.WhatsApp ||
            mention?.channelGroup === ChannelGroup.Voice ||
            mention?.channelGroup === ChannelGroup.WebsiteChatBot || 
            mention?.channelGroup === ChannelGroup.AppStoreReviews ||
            mention?.channelGroup === ChannelGroup.Sitejabber ||
            mention?.channelGroup === ChannelGroup.Telegram ||
            mention?.channelGroup === ChannelGroup.Pantip
          ) {
            if (mention?.channelGroup === ChannelGroup.WhatsApp &&
              user?.data?.user?.actionButton?.replyEnabled &&
              !mention?.isBrandPost){
              ticketHistoryData.isReplyVisible = true;
              if (!mention?.isBrandPost) {
                ticketHistoryData.sendmailallmention = true;
              }
            }else{
              if (
                mention?.ticketInfoSsre.ssreStatus !==
                  SSRELogStatus?.SSREInProcessing &&
                mention?.ticketInfoSsre.ssreStatus !==
                  SSRELogStatus?.IntentFoundStillInProgress &&
                user?.data?.user?.actionButton?.replyEnabled &&
                !mention?.isBrandPost
              ) {
                ticketHistoryData.isReplyVisible = true;
                if (!mention?.isBrandPost) {
                  ticketHistoryData.sendmailallmention = true;
                }
              }
            }

            ticketHistoryData.isAttachTicketVisible = true;
            if (
              !mention?.isBrandPost &&
              user?.data?.user?.actionButton?.createNewTicketEnabled
            ) {
              ticketHistoryData.isCreateTicketVisible = true;
            }
          }
          if (user?.data?.user?.actionButton?.ticketEscalationEnabled) {
            ticketHistoryData.isEscalateVisible = true;
          }
        }
      }
    } else if (ticketHistoryData.isCSDUser) {
      if (ticketHistoryData.isBrandWorkFlowEnabled) {
        if (ticketHistoryData.isCSDApprove && (!mention?.isBrandPost || mention?.channelGroup == ChannelGroup.Voice)) {
          ticketHistoryData.isworkflowApproveVisible = true;
        }
        if (ticketHistoryData.isCSDReject && (!mention?.isBrandPost || mention?.channelGroup == ChannelGroup.Voice)) {
          ticketHistoryData.isworkflowRejectVisible = true;
        }
        if (user?.data?.user?.actionButton?.ticketEscalationEnabled) {
          ticketHistoryData.isEscalateVisible = true;
        }
      } else {
        if (!mention?.isBrandPost || mention?.channelGroup == ChannelGroup.Voice) {
          ticketHistoryData.isworkflowApproveVisible = true;
          ticketHistoryData.isworkflowRejectVisible = true;
        }
      }
    } else {
      if (mention?.channelGroup === ChannelGroup.WhatsApp &&
        user?.data?.user?.actionButton?.replyEnabled &&
        !mention?.isBrandPost  ) {
        ticketHistoryData.isReplyVisible = true;
        if (!mention?.isBrandPost) {
          ticketHistoryData.sendmailallmention = true;
        }
      } else {``
        if (
          mention?.ticketInfoSsre.ssreStatus !==
          SSRELogStatus?.SSREInProcessing &&
          mention?.ticketInfoSsre.ssreStatus !==
          SSRELogStatus?.IntentFoundStillInProgress &&
          user?.data?.user?.actionButton?.replyEnabled &&
          (!mention?.isBrandPost || mention?.channelGroup == ChannelGroup.Voice)
        ) {
          ticketHistoryData.isReplyVisible = true;
          if (!mention?.isBrandPost) {
            ticketHistoryData.sendmailallmention = true;
          }
        }
      }
      ticketHistoryData.isworkflowApproveVisible = true;
      ticketHistoryData.isworkflowRejectVisible = true;
    }

    if (ticketHistoryData.isReadOnlySupervisor) {
      ticketHistoryData.isReplyVisible = false;
      ticketHistoryData.isForwardVisible = false;
      ticketHistoryData.isAttachTicketVisible = false;
      ticketHistoryData.isEscalateVisible = false;
      ticketHistoryData.isworkflowApproveVisible = false;
      ticketHistoryData.isworkflowRejectVisible = false;
    } else {
      if (
        mention?.ticketInfo.status === TicketStatus.Close ||
        (+user.data.user.role === UserRoleEnum.CustomerCare &&
          mention?.ticketInfo.status === TicketStatus.ApprovedByBrand) ||
        (+user.data.user.role === UserRoleEnum.BrandAccount &&
          (mention?.ticketInfo.status === TicketStatus.ApprovedByBrand ||
            mention?.ticketInfo.status === TicketStatus.RejectedByBrand))
      ) {
        ticketHistoryData.isReplyVisible = false;
        ticketHistoryData.isForwardVisible = false;
        ticketHistoryData.isAttachTicketVisible = false;
        ticketHistoryData.isEscalateVisible = false;
        ticketHistoryData.isworkflowApproveVisible = false;
        ticketHistoryData.isworkflowRejectVisible = false;
      } else {
        if (
          +user.data.user.role === UserRoleEnum.Agent ||
          +user.data.user.role === UserRoleEnum.SupervisorAgent ||
          +user.data.user.role === UserRoleEnum.LocationManager ||
          +user.data.user.role === UserRoleEnum.TeamLead
        ) {
          if (
            mention?.ticketInfo.status !== TicketStatus.PendingwithCSD &&
            mention?.ticketInfo.status !== TicketStatus.PendingWithBrand &&
            mention?.ticketInfo.status !== TicketStatus.RejectedByBrand &&
            mention?.ticketInfo.status !== TicketStatus.OnHoldCSD &&
            mention?.ticketInfo.status !== TicketStatus.OnHoldBrand
          ) {
          } else {
            if (
              !ticketHistoryData.isBrandWorkFlowEnabled &&
              mention?.ticketInfo.status === TicketStatus.RejectedByBrand
            ) {
            } else {
              ticketHistoryData.isReplyVisible = false;
              ticketHistoryData.isForwardVisible = false;
              ticketHistoryData.isAttachTicketVisible = false;
              ticketHistoryData.isEscalateVisible = false;
              ticketHistoryData.isworkflowApproveVisible = false;
              ticketHistoryData.isworkflowRejectVisible = false;
            }
          }
        } else if (+user.data.user.role === UserRoleEnum.CustomerCare) {
          if (
            mention?.ticketInfo.status === TicketStatus.PendingWithBrand ||
            mention?.ticketInfo.status ===
              TicketStatus.PendingWithBrandWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.OnHoldBrandWithNewMention ||
            mention?.ticketInfo.status === TicketStatus.OnHoldBrand ||
            mention?.ticketInfo.status === TicketStatus.PendingwithAgent ||
            mention?.ticketInfo.status === TicketStatus.Rejected ||
            mention?.ticketInfo.status === TicketStatus.ApprovedByBrand ||
            mention?.ticketInfo.status === TicketStatus.Open ||
            mention?.ticketInfo.status === TicketStatus.OnHoldAgent ||
            mention?.ticketInfo.status === TicketStatus.CustomerInfoAwaited
          ) {
            ticketHistoryData.isReplyVisible = false;
            ticketHistoryData.isForwardVisible = false;
            ticketHistoryData.isAttachTicketVisible = false;
            ticketHistoryData.isEscalateVisible = false;
            ticketHistoryData.isworkflowApproveVisible = false;
            ticketHistoryData.isworkflowRejectVisible = false;
          } else {
          }
        } else if (+user.data.user.role === UserRoleEnum.BrandAccount) {
          if (
            mention?.ticketInfo.status === TicketStatus.ApprovedByBrand ||
            mention?.ticketInfo.status === TicketStatus.RejectedByBrand ||
            mention?.ticketInfo.status ===
              TicketStatus.RejectedByBrandWithNewMention ||
            mention?.ticketInfo.status === TicketStatus.PendingwithCSD ||
            mention?.ticketInfo.status === TicketStatus.Open ||
            mention?.ticketInfo.status === TicketStatus.OnHoldAgent ||
            mention?.ticketInfo.status === TicketStatus.OnHoldCSD ||
            mention?.ticketInfo.status === TicketStatus.CustomerInfoAwaited ||
            mention?.ticketInfo.status === TicketStatus.PendingwithAgent ||
            mention?.ticketInfo.status === TicketStatus.Rejected ||
            mention?.ticketInfo.status ===
              TicketStatus.OnHoldCSDWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.PendingwithCSDWithNewMention
          ) {
            ticketHistoryData.isReplyVisible = false;
            ticketHistoryData.isForwardVisible = false;
            ticketHistoryData.isAttachTicketVisible = false;
            ticketHistoryData.isEscalateVisible = false;
            ticketHistoryData.isworkflowApproveVisible = false;
            ticketHistoryData.isworkflowRejectVisible = false;
          } else {
          }
        }

        if (mention?.ticketID==0) {
          ticketHistoryData.isReplyVisible = false;
          ticketHistoryData.isForwardVisible = false;
          ticketHistoryData.isAttachTicketVisible = false;
          ticketHistoryData.isEscalateVisible = false;
          ticketHistoryData.isworkflowApproveVisible = false;
          ticketHistoryData.isworkflowRejectVisible = false;
        }
      }
    }

    return ticketHistoryData;
  }

  SetFooterIcons(
    ticketHistoryData: AllBrandsTicketsDTO,
    user: AuthUser,
    mention: BaseMention,
    pageType: PostsType,
    brandsCount: number,
    isParentPostPopup: boolean = false,
    currentUser:AuthUser,
    mentionHistory?:boolean,
    groupView?:AllMentionGroupView,
    parentPostHeader?:boolean
  ): any {
    if (isParentPostPopup) {
      ticketHistoryData.isparentpostpopup = true;
    }

    if (
      mention?.description &&
      mention?.description.length > 0 &&
      user?.data?.user?.actionButton?.translateEnabled
    ) {
      ticketHistoryData.isTranslationVisible = true;
    } else if (
      mention?.channelGroup === ChannelGroup.WhatsApp &&
      mention?.title?.length > 0 &&
      user?.data?.user?.actionButton?.translateEnabled
    ) {
      ticketHistoryData.isTranslationVisible = true;
    } else if (
      mention?.channelGroup === ChannelGroup.Quora &&
      mention?.title?.length > 0 &&
      user?.data?.user?.actionButton?.translateEnabled
    ) {
      ticketHistoryData.isTranslationVisible = true;
    } else if (
      mention?.channelGroup === ChannelGroup.Booking &&
      mention?.title && mention?.title?.length > 0 &&
      user?.data?.user?.actionButton?.translateEnabled
    ) {
      ticketHistoryData.isTranslationVisible = true;
    }

    if (
      ticketHistoryData.isEnableReplyApprovalWorkFlow &&
      mention?.ticketInfo.status !== TicketStatus.Close &&
      mention?.ticketInfoSsre.ssreStatus !== SSRELogStatus.SSREInProcessing &&
      mention?.ticketInfoSsre.ssreStatus !==
        SSRELogStatus.IntentFoundStillInProgress
    ) {
      if (
        (+user.data.user.role === UserRoleEnum.Agent ||
          +user.data.user.role === UserRoleEnum.SupervisorAgent ||
          +user.data.user.role === UserRoleEnum.LocationManager ||
          +user.data.user.role === UserRoleEnum.TeamLead) &&
        mention?.makerCheckerMetadata.workflowStatus !==
          LogStatus.ReplySentForApproval
      ) {
        if (
          mention?.ticketInfo.ticketAgentWorkFlowEnabled &&
          +user.data.user.role === UserRoleEnum.Agent
        ) {
          ticketHistoryData.isEnableDisableMakercheckerVisible = false;
        } else {
          if (user?.data?.user?.actionButton.isMakerChekerEnabled && mention?.channelGroup != ChannelGroup?.Reddit) {
            ticketHistoryData.isEnableDisableMakercheckerVisible = true;
          }
        }
        if (!mention?.ticketInfo.ticketAgentWorkFlowEnabled) {
          ticketHistoryData.isTicketAgentWorkFlowEnabled = true;
        } else {
          ticketHistoryData.isTicketAgentWorkFlowEnabled = false;
        }
      }
    }

    if (
      mention?.channelGroup === ChannelGroup.Twitter ||
      mention?.channelGroup === ChannelGroup.Facebook ||
      mention?.channelGroup === ChannelGroup.Instagram ||
      mention?.channelGroup === ChannelGroup.Youtube ||
      mention?.channelGroup === ChannelGroup.WhatsApp ||
      mention?.channelGroup === ChannelGroup.Email ||
      mention?.channelGroup === ChannelGroup.Voice ||
      mention?.channelGroup === ChannelGroup.ECommerceWebsites ||
      ((currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled==1) && mention?.channelGroup ==ChannelGroup.TikTok ) 
    ) {
      if(currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1)
      {
        const actionButtonsObj = user?.data?.user.actionButton;
        if (
          !ticketHistoryData.isReadOnlySupervisor &&
          actionButtonsObj.markInfluencerEnabled
        ) {
          ticketHistoryData.isMarkInfluencerVisible = true;
          if (mention?.author?.influencerDetailsList?.length> 0) {
            ticketHistoryData.isInfluencermarked = true;
          } else {
            ticketHistoryData.isInfluencermarked = false;
          }
            if (mention?.author.socialId == '0' || mention?.author.socialId == null) {
              ticketHistoryData.isInfluencermarked = false;
              ticketHistoryData.isMarkInfluencerVisible = false;
            }
        }
      }else{
      const actionButtonsObj = user?.data?.user.actionButton;
      if (
        !ticketHistoryData.isReadOnlySupervisor &&
        actionButtonsObj.markInfluencerEnabled
      ) {
        ticketHistoryData.isMarkInfluencerVisible = true;
        if (mention?.author.markedInfluencerCategoryID !== 0) {
          ticketHistoryData.isInfluencermarked = true;
        } else {
          ticketHistoryData.isInfluencermarked = false;
        }
        if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1)
        {
          if (mention?.author.socialId == '0' || mention?.author.socialId == null)
        {
          ticketHistoryData.isInfluencermarked = false;
          ticketHistoryData.isMarkInfluencerVisible = false;
        }
      }
    }
      }
    }

    if (mention?.channelGroup === ChannelGroup.ECommerceWebsites)
    {

    }

    if (
      !ticketHistoryData.isReadOnlySupervisor &&
      mention?.ticketInfoSsre.ssreStatus !== SSRELogStatus.SSREInProcessing &&
      mention?.ticketInfoSsre.ssreStatus !==
        SSRELogStatus.IntentFoundStillInProgress
    ) {
      ticketHistoryData.isSendEmailVisible = true;
    }

    if (
      (+user.data.user.role === UserRoleEnum.TeamLead ||
        +user.data.user.role === UserRoleEnum.SupervisorAgent || +user.data.user.role === UserRoleEnum.LocationManager || (ticketHistoryData?.isWorkflowEnabled && mention?.ticketInfo?.replyUserID == -4)) &&
      mention?.makerCheckerMetadata.workflowStatus ===
        LogStatus.ReplySentForApproval
    ) {
      ticketHistoryData.isApproveRejectMakerChecker = true;
    } else if (
      +user?.data?.user?.role === UserRoleEnum.Agent &&
      mention?.makerCheckerMetadata?.workflowStatus ===
        LogStatus.ReplySentForApproval
    ) {
      ticketHistoryData.isReplyVisible = false;
      ticketHistoryData.isForwardVisible = false;
      /* tickt approval pending */
      ticketHistoryData.isAssignVisible = false
      ticketHistoryData.isAttachTicketVisible = false;
      ticketHistoryData.isEscalateVisible = false;
      ticketHistoryData.isCreateTicketVisible = false;
      ticketHistoryData.isDeleteFromLocobuzz = false;
      /* tickt approval pending */
    }

    if (
      mention?.channelGroup === ChannelGroup.Twitter ||
      mention?.channelGroup === ChannelGroup.Facebook ||
      mention?.channelGroup === ChannelGroup.Instagram ||
      mention?.channelGroup === ChannelGroup.Youtube ||
      mention?.channelGroup === ChannelGroup.WhatsApp
    ) {
      if (
        mention?.channelType !== ChannelType.DirectMessages &&
        mention?.channelType !== ChannelType.FBMessages &&
        mention?.channelType !== ChannelType.YouTubeComments &&
        mention?.channelType !== ChannelType.InstagramComments &&
        mention?.channelType !== ChannelType.WhatsApp
      ) {
        if (pageType === PostsType.Mentions && !mention?.isBrandPost) {
          ticketHistoryData.isTrendsVisible = true;
        }
      }
    }

    if (
      pageType === PostsType.Mentions &&
      (mention?.channelType === ChannelType.Blogs ||
        mention?.channelType === ChannelType.ComplaintWebsites ||
        mention?.channelType === ChannelType.DiscussionForums ||
        mention?.channelType === ChannelType.News ||
        mention?.channelType === ChannelType.Videos ||
        mention?.channelType === ChannelType.PublicTweets ||
        mention?.channelType === ChannelType.Twitterbrandmention ||
        mention?.channelType === ChannelType.TripAdvisor ||
        mention?.channelType === ChannelType.HolidayIQReview ||
        mention?.channelType === ChannelType.Booking ||
        mention?.channelGroup === ChannelGroup.AutomotiveIndia ||
        mention?.channelGroup === ChannelGroup.TeamBHP ||
        mention?.channelGroup === ChannelGroup.ECommerceWebsites) &&
      !mention?.isBrandPost &&
      brandsCount > 1
    ) {
      ticketHistoryData.isCopyMoveVisible = true;
    }

    if (!mention?.isBrandPost && mention?.channelGroup != ChannelGroup.Yotpo) {
      ticketHistoryData.isSubscribe = true;
    }
    if (pageType === PostsType.TicketHistory) {
      if (
        mention?.channelGroup === ChannelGroup.Facebook ||
        mention?.channelGroup === ChannelGroup.Youtube ||
        mention?.channelGroup === ChannelGroup.WhatsApp ||
        mention?.channelGroup === ChannelGroup.WebsiteChatBot ||
        mention?.channelGroup === ChannelGroup.LinkedIn ||
        mention?.channelGroup === ChannelGroup.GooglePlus ||
        (mention?.channelGroup === ChannelGroup.Quora &&
          (mention?.channelType === ChannelType.QuoraAnswer ||
            mention?.channelType === ChannelType.QuoraComment)) ||
        mention?.channelGroup === ChannelGroup.TikTok
      ) {
        if ((mention?.parentPostSocialID !== null) && !isParentPostPopup) {
          ticketHistoryData.viewparentpost = true;
        }
      }
      else if (mention?.channelGroup === ChannelGroup.Twitter && mention?.parentPostSocialID !== null && mention?.parentPostSocialID != '0') {
        ticketHistoryData.viewparentpost = true;
      }
       else if (mention?.channelGroup === ChannelGroup.Instagram && mention?.channelType !== ChannelType.InstagramMessages) {
        if (
          mention?.parentPostSocialID &&
          mention?.instagramPostType !== 5 &&
          !isParentPostPopup
        ) {
          ticketHistoryData.viewparentpost = true;
        }
      } else if (mention?.channelGroup === ChannelGroup.ECommerceWebsites) {
        if (mention?.postID && !isParentPostPopup) {
          ticketHistoryData.viewparentpost = true;
        }
      } else if (mention?.channelType === ChannelType.PantipComments) {
        if (mention?.parentPostSocialID !== null && mention?.parentPostSocialID !== undefined && mention?.parentPostSocialID != '0') {
          ticketHistoryData.viewparentpost = true;
        }
      } else if (mention?.channelGroup === ChannelGroup.Reddit && mention?.parentPostSocialID !== null && mention?.parentPostSocialID != '0') {
        ticketHistoryData.viewparentpost = true;
      }
    } else if (pageType === PostsType.Mentions) {
      if (
        mention?.channelGroup === ChannelGroup.Facebook ||

        mention?.channelGroup === ChannelGroup.Youtube ||
        mention?.channelGroup === ChannelGroup.WhatsApp ||
        mention?.channelGroup === ChannelGroup.WebsiteChatBot ||
        mention?.channelGroup === ChannelGroup.LinkedIn ||
        mention?.channelGroup === ChannelGroup.Instagram ||
        (mention?.channelGroup === ChannelGroup.Quora &&
          (mention?.channelType === ChannelType.QuoraAnswer ||
            mention?.channelType === ChannelType.QuoraComment)) ||
        mention?.channelGroup === ChannelGroup.TikTok       ) {
        if (
          (mention?.parentPostSocialID !== null && mention?.parentPostSocialID !=undefined) &&
           ( mention?.channelGroup === ChannelGroup.LinkedIn  || mention?.instagramPostType !== 5 ) &&
          !isParentPostPopup
        ) {
          ticketHistoryData.viewparentpost = true;
        }
      }
       else if (mention?.channelGroup === ChannelGroup.Twitter && mention?.parentPostSocialID !== null && mention?.parentPostSocialID != '0'){
        ticketHistoryData.viewparentpost = true;
      }
       else if (mention?.channelGroup === ChannelGroup.ECommerceWebsites) {
        if (
          mention?.postID !== null &&
          !isParentPostPopup &&
          !mention?.isBrandPost
        ) {
          ticketHistoryData.viewparentpost = true;
        }
      }
      else if (mention?.channelGroup === ChannelGroup.GoogleMyReview && (mention?.channelType=== ChannelType.GMBAnswers || (mention?.channelType===ChannelType.GoogleMyReview && mention?.isBrandPost))  && mention?.postSocialId !==null){
        ticketHistoryData.viewparentpost=true;  
      }
      else if (mention?.channelGroup === ChannelGroup.TripAdvisor && mention?.parentPostSocialID !== null && mention?.parentPostSocialID != '0' && currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled==1) {
        ticketHistoryData.viewparentpost = true;
      }
      else if (mention?.channelGroup === ChannelGroup.AppStoreReviews && mention?.isBrandPost && mention?.postSocialId !== null && mention?.postSocialId != '0' && currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1) {
        ticketHistoryData.viewparentpost = true;
      }
      else if (mention?.channelGroup === ChannelGroup.GooglePlayStore && mention?.isBrandPost && mention?.parentPostSocialID !== null && mention?.parentPostSocialID != '0' && currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1) {
        ticketHistoryData.viewparentpost = true;
      } 
      else if (mention?.channelType === ChannelType.PantipComments && mention?.parentPostSocialID !== null && mention?.parentPostSocialID !== undefined && mention?.parentPostSocialID != '0') {
        ticketHistoryData.viewparentpost = true;
      } 
      else if (mention?.channelGroup === ChannelGroup.Reddit && mention?.parentPostSocialID !== null && mention?.parentPostSocialID != '0') {
        ticketHistoryData.viewparentpost = true;
      }

      if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled==1)
      {
        if (mention?.channelGroup === ChannelGroup.Facebook)
        {
          if (mention?.channelType == ChannelType.FBPageUser || mention?.channelType == ChannelType.FBPublic || mention?.channelType == ChannelType.FbMediaPosts || mention?.channelType == ChannelType.FBReviews || mention?.channelType == ChannelType.FbGroupPost)
          {
            if (mention?.parentSocialID !== null && mention?.parentSocialID != '0') {
              ticketHistoryData.viewparentpost = true;
            }
          }
          if (mention?.channelType == ChannelType.FBComments || mention?.channelType == ChannelType.FBMediaComments || mention?.channelType == ChannelType.FbGroupComments) {  
            if (mention?.parentPostSocialID !== null && mention?.parentPostSocialID != '0') {
              ticketHistoryData.viewparentpost = true;
            }
          }
        }
      }
    }

    if (
      mention?.channelGroup != ChannelGroup.ElectronicMedia &&
      !mention?.isTypeExsitingTag &&
      mention?.isBrandPost &&
      mention?.channelType != ChannelType.GMBAnswers &&
      (currentUser.data.user.role == UserRoleEnum.SupervisorAgent || currentUser.data.user.role == UserRoleEnum.LocationManager) &&
      pageType === PostsType.Mentions &&
      mention?.ticketInfo.status !== TicketStatus.Close
    ) {
      ticketHistoryData.showActionableIcon = true;
      if (mention?.actionableType == 1 || mention?.actionableType == 0) {
        ticketHistoryData.actionOrNonActionFlag = true;
      } else {
        ticketHistoryData.actionOrNonActionFlag = false;
      }
    }

    if (((mention?.channelGroup == ChannelGroup.Twitter && mention?.channelType !== ChannelType.DirectMessages) ||
      (mention?.channelGroup == ChannelGroup.Facebook && (mention?.channelType == ChannelType.FBPageUser || mention?.channelType == ChannelType.FBPublic)) || (mention?.channelGroup == ChannelGroup.Instagram && (mention?.channelType == ChannelType.InstagramUserPosts || mention?.channelType == ChannelType.InstagramPagePosts || mention?.channelType == ChannelType.InstagramPublicPosts )) || (mention?.channelGroup == ChannelGroup.Youtube && mention?.channelType == ChannelType.YouTubePosts)
    //    mention?.channelGroup == ChannelGroup.Facebook ||
    //     mention?.channelGroup == ChannelGroup.Instagram ||
    //      mention?.channelGroup == ChannelGroup.LinkedIn ) &&
          
    //     mention?.channelType !== ChannelType.InstagramMessages &&
    //     mention?.channelType !== ChannelType.FBMessages &&
    // mention?.channelType !== ChannelType.LinkedinMessage
    ) &&
      !mention?.isBrandPost &&
      (currentUser.data.user.role == UserRoleEnum.SupervisorAgent || currentUser.data.user.role == UserRoleEnum.LocationManager) &&
      pageType === PostsType.Mentions &&
      mention?.ticketID != 0 && mention?.ticketInfo.status !== TicketStatus.Close)
     {
      ticketHistoryData.showActionableIcon = true;
      if (mention?.actionableType == 1 || mention?.actionableType == 0) {
        ticketHistoryData.actionOrNonActionFlag = true;
      } else {
        ticketHistoryData.actionOrNonActionFlag = false;
      }
    }




    if (pageType === PostsType.Mentions) {

      if (mention?.channelGroup == ChannelGroup.Facebook || mention?.channelGroup == ChannelGroup.Instagram)
      {
        if (mention?.isPromoted == 1 || mention?.isPromoted == 2 || mention?.isPromoted == 3 || mention?.isPromoted == 5) {
        ticketHistoryData.promotedPostFlag = true;
        ticketHistoryData.isAdPosts = (mention?.isPromoted == 2 || mention?.isPromoted == 3) ? true : false;
        ticketHistoryData.isDarkAdPost = mention?.isPromoted == 5 ? true : false;

          ticketHistoryData.promotedPostText = ticketHistoryData.isDarkAdPost
            ? "DarkAd Post"
            : ticketHistoryData.isAdPosts
              ? "AD Post"
              : "Boosted Post";
        }
      }

      if (mention?.channelType == ChannelType.PublicTweets || mention?.channelType == ChannelType.BrandTweets || mention?.channelType == ChannelType.Twitterbrandmention || mention?.channelGroup == ChannelGroup.LinkedIn)
      {
        if (mention?.isPromoted == 1 || mention?.isPromoted == 2)
        {
          ticketHistoryData.promotedPostFlag = true;
          ticketHistoryData.isAdPosts = mention?.isPromoted == 2 ? true : false;
          // ticketHistoryData.promotedPostText = mention?.isBrandPost
          //   ? 'Promoted Post'
          //   : 'Replied to promoted post';
          ticketHistoryData.promotedPostText = ticketHistoryData.isAdPosts ? "AD Post" : "Boosted Post";

        }
      }
    }
    if(pageType === PostsType.Tickets) {
      if (mention?.channelType == ChannelType.FBPageUser || mention?.channelType == ChannelType.FBComments) {
        if (mention?.isPromoted == 1 || mention?.isPromoted == 2 || mention?.isPromoted == 3) {
          ticketHistoryData.promotedPostFlag = true;
          ticketHistoryData.isAdPosts = (mention?.isPromoted == 2 || mention?.isPromoted == 3) ? true : false;
          ticketHistoryData.promotedPostText = ticketHistoryData.isAdPosts ? "AD Post" : "Boosted Post";
        }
      }
      if (mention?.channelType == ChannelType.PublicTweets || mention?.channelType == ChannelType.Twitterbrandmention || mention?.channelType == ChannelType.BrandTweets) {
        if (mention?.isPromoted == 1 || mention?.isPromoted == 2 && mention?.inReplyToStatusId > 0) {
          ticketHistoryData.promotedPostFlag = true;
          ticketHistoryData.isAdPosts =  mention?.isPromoted == 2 ? true : false;
          // ticketHistoryData.promotedPostText = "Replied to promoted post";
          ticketHistoryData.promotedPostText = ticketHistoryData.isAdPosts ? "AD Post" : "Boosted Post";

        }
      }
      if (mention?.channelGroup == ChannelGroup.LinkedIn) {
        if (mention?.isPromoted == 1 || mention?.isPromoted == 2) {
          ticketHistoryData.promotedPostFlag = true;
          ticketHistoryData.isAdPosts = mention?.isPromoted == 2 ? true : false;
          // ticketHistoryData.promotedPostText = mention?.isBrandPost
          //   ? 'Promoted Post'
          //   : 'Replied to promoted post';
          ticketHistoryData.promotedPostText = ticketHistoryData.isAdPosts ? "AD Post" : "Boosted Post";
        }
      }
    }


    if (
      mention?.channelType == ChannelType.PublicTweets ||
      mention?.channelType == ChannelType.Twitterbrandmention
    ) {
      if (mention?.isDeletedFromSocial) {
        ticketHistoryData.tweetExistsApiFlag = false;
        ticketHistoryData.isReplyVisible = false;
      } else {
        ticketHistoryData.tweetExistsApiFlag = true;
        // this.replyService.checkTweetExists(mention);
      }
    }

    if (
      pageType === PostsType.Mentions ||
      pageType === PostsType.TicketHistory
    ) {
      if (currentUser.data.user.actionButton.hideUnhideEnabled && mention?.typeofcomment == 1 && !mention?.isBrandPost) {
        if (mention?.channelType == 8) {
          ticketHistoryData.hideUnhideShowIcon = true;
          if (mention?.isHidden) {
            ticketHistoryData.hideUnhideFacebookFlag = true;
          } else {
            ticketHistoryData.hideUnhideFacebookFlag = false;
          }
        }
        if (mention?.channelType == ChannelType.InstagramComments) {
          ticketHistoryData.hideUnhideShowIcon = true;
          if (mention?.isHidden) {
            ticketHistoryData.hideUnhideInstagramFlag = true;
          } else {
            ticketHistoryData.hideUnhideInstagramFlag = false;
          }
        }
      }
    }

    if (
      mention?.ticketInfo.latestResponseTime &&
      pageType == PostsType.Tickets
    ) {
      if (
        moment(mention?.ticketInfo.latestResponseTime).local().format() !=
        'Invalid date'
      ) {
        const timeOffset = new Date().getTimezoneOffset();
        ticketHistoryData.lastReply = moment(
          mention?.ticketInfo.latestResponseTime
        )
          .add('minutes', -timeOffset)
          .local()
          .fromNow();
      }
    }

    if (
      mention?.dispositionName &&
      mention?.ticketInfo?.status == TicketStatus.Close
    ) {
      ticketHistoryData.dispositionName = mention?.dispositionName;
    }

    if(pageType==PostsType.Mentions)
    {
      ticketHistoryData.addCampaignFlag=true
    }

    if (mention?.channelGroup === ChannelGroup.Facebook || mention?.channelGroup === ChannelGroup.Instagram || mention?.channelGroup === ChannelGroup.Youtube || mention?.channelGroup === ChannelGroup.LinkedIn || mention?.channelGroup === ChannelGroup.GooglePlus || mention?.channelGroup === ChannelGroup.AutomotiveIndia || mention?.channelGroup === ChannelGroup.ECommerceWebsites || mention?.channelGroup === ChannelGroup.TeamBHP || mention?.channelGroup === ChannelGroup.Pantip)
    {
      let openLink =true;
      if (mention?.instagramPostType == 2 || mention?.instagramPostType == 5 && (mention?.channelType == ChannelType.InstagramComments))
      {
        openLink=false;
      }
      if (openLink)
      {
        if (pageType == PostsType.Mentions && mention?.channelType == ChannelType.PantipTopics && mention?.mentionMetadata?.commentCount > 0) {
          ticketHistoryData.viewComment = true;
        } else if (mention?.isBrandPost && (mention?.mentionMetadata?.commentCount > 0 && groupView == AllMentionGroupView.mentionView)) {
         ticketHistoryData.viewComment = true;
        }
      }
    }

    if (mention?.channelGroup == ChannelGroup.Email && !mention?.isBrandPost) {
      ticketHistoryData.downloadTemplate = true;
    }
    if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1) {
      if (groupView == AllMentionGroupView.groupView){
        if (!mention?.isBrandPost || pageType == PostsType.TicketHistory) 
        {
      if (!isParentPostPopup && pageType == PostsType.Mentions) {
        if (mention?.mentionMetadata?.childmentioncount > 0) {
          ticketHistoryData.showGroupView = true;
        }
        ticketHistoryData.viewparentpost = false;
      }

      if (isParentPostPopup && pageType == PostsType.TicketHistory) {
        if (parentPostHeader) {
          ticketHistoryData.isMarkAllAsSeen = true;
        }
      }

      if (mention?.mentionMetadata?.isMarkSeen == 0) {
        ticketHistoryData.isMarkAsSeen = true;
        ticketHistoryData.isMarkUnseen = false;
      }
      if (mention?.mentionMetadata?.isMarkSeen == 1 && mention?.mentionMetadata?.unseencount == 0) {
        ticketHistoryData.isMarkUnseen = true;
        ticketHistoryData.isMarkAsSeen = false;
      }
      if (mention?.mentionMetadata?.isMarkSeen == 1 && mention?.mentionMetadata?.unseencount > 0) {
        ticketHistoryData.isMarkUnseen = false;
        ticketHistoryData.isMarkAsSeen = true;
      }
    }
        else {
          if (mention?.mentionMetadata?.isMarkSeen == 1 && mention?.mentionMetadata?.unseencount == 0) {
            ticketHistoryData.isMarkUneenBrandPost = true;
          }
        }
  }

    }

    if(mention?.isBrandPost && groupView == AllMentionGroupView.groupView)
    {
      ticketHistoryData.viewparentpost = false;
    }


    if (mention?.channelGroup === ChannelGroup.Email && mentionHistory) {
      let tomail = mention?.toMailList.join(', ');
      if (!tomail) {
        tomail = mention?.ccMailList.join(', ');
      }
      if (!tomail) {
        tomail = mention?.bccMailList.join(', ');
      }
      ticketHistoryData.toMailList = mention?.toMailList;
      ticketHistoryData.ccMailList = mention?.ccMailList;
      ticketHistoryData.bccMailList = mention?.bccMailList;
      ticketHistoryData.tomaillist = tomail;
      let subject = mention?.title != null ? mention?.title : mention?.subject;
      if (subject) {
        if (subject.length > 0) {
          if (
            subject.length > 70 &&
            (pageType === PostsType.Tickets || pageType === PostsType.Mentions)
          ) {
            ticketHistoryData.title = subject.substring(0, 70) + '...';
          } else {
            ticketHistoryData.title = subject;
          }
        }
      }
    }
    if (mention?.channelGroup === ChannelGroup.Twitter && mention?.strInReplyToStatusId != null && mention?.strInReplyToStatusId != '0' && mention?.strInReplyToStatusId != '' && pageType === PostsType.Mentions && currentUser?.data?.user?.isClickhouseEnabled != 1) {
      ticketHistoryData.makeParentPostSpamButton = true;
    }
    if (mention?.author?.isBlocked){
      ticketHistoryData.isBlockedUser = true;
    }
    else{
      ticketHistoryData.isBlockedUser = false;
    }
    // const brandInfo = this._filterService.fetchedBrandData;
    if ((mention?.channelGroup === ChannelGroup?.GoogleMyReview && mention?.isReplySent == true) || mention?.channelGroup === ChannelGroup.Instagram && mention?.isReplySent == true){
      ticketHistoryData.replyDisabled = true;
    }
    if ((mention?.channelType === ChannelType.FBComments && ticketHistoryData?.hideUnhideFacebookFlag) || (mention?.channelType === ChannelType.InstagramComments && ticketHistoryData?.hideUnhideInstagramFlag) || mention?.channelGroup === ChannelGroup.Reddit) {
      ticketHistoryData.replyDisabled = true;
    }
    return ticketHistoryData;
  }

  SetMakerCheckerandSSREIcons(
    ticketHistoryData: AllBrandsTicketsDTO,
    currentUser: AuthUser,
    mention: BaseMention,
    MediaUrl: string,
    isPostDetailsLogView: boolean = false
  ): any {
    if (
      +currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
      +currentUser.data.user.role !== UserRoleEnum.BrandAccount &&
      mention?.makerCheckerMetadata.workflowStatus ===
        LogStatus.ReplySentForApproval
    ) {

      if (isPostDetailsLogView) {
        if (mention?.ticketInfo?.workFlowTagid && mention?.ticketInfo?.workFlowTagid == mention?.ticketInfo?.tagID) {
          ticketHistoryData.isMakerCheckerPreview = true;
        }
      }
      else {
        if (mention?.ticketInfo?.workFlowTagid && mention?.ticketInfo?.workFlowTagid == mention?.ticketInfo?.tagID) {
          ticketHistoryData.isMakerCheckerPreview = true;
          ticketHistoryData['isMakerCheckerNoteAvailable'] = false;
        }
        else ticketHistoryData['isMakerCheckerNoteAvailable'] = true;
      }
      

      if (+mention?.makerCheckerMetadata.workflowStatus !== 0) {
        // ticketHistoryData.MakerCheckerPreview.workflowstatusnotzero = true;
        if (
          mention?.makerCheckerMetadata.workflowStatus ===
            LogStatus.ReplySentForApproval &&
          !mention?.replyScheduledDateTime
        ) {
          if (mention?.isPrivateMessage && mention?.isSendFeedback) {
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Private-Message-With-Feedback', { replyUserName: mention?.ticketInfo.replyUserName });
          } else if (mention?.isPrivateMessage) {
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Private-Message-Text', { replyUserName: mention?.ticketInfo.replyUserName });
          } else if (mention?.isSendFeedback) {
            let action = '';
            switch (mention?.ticketInfo.makerCheckerStatus) {
              case MakerCheckerEnum.ReplyClose:
                action = 'Reply and Close';
                break;
              case MakerCheckerEnum.ReplyEscalate:
                action = 'Reply and Escalate';
                break;
              case MakerCheckerEnum.ReplyAwaitingResponse:
                action = 'Reply Awaiting Response';
                break;
              case MakerCheckerEnum.ReplyAndAssign:
                action = 'Reply and Assign';
                break;
              default:
                action = 'Reply';
                break;
            }
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Feedback-Form-Message', { replyUserName: mention?.ticketInfo.replyUserName, action: action });
          } else {
            switch (mention?.ticketInfo.makerCheckerStatus) {
              case MakerCheckerEnum.DirectClose:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Directly-Close-Ticket', { replyUserName: mention?.ticketInfo?.replyUserName });
                break;
              case MakerCheckerEnum.Escalate:
                if (mention?.ticketInfo.replyEscalatedToUsername) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message', { replyUserName : mention?.ticketInfo?.replyUserName, replyEscalatedToUsername: mention?.ticketInfo?.replyEscalatedToUsername });
                } else if (
                  mention?.makerCheckerMetadata &&
                  mention?.makerCheckerMetadata.replyEscalatedTeamName
                ) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message', { replyUserName: mention?.ticketInfo?.replyUserName, replyEscalatedToUsername: mention?.makerCheckerMetadata.replyEscalatedTeamName });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Want-to',{ replyUserName: mention?.ticketInfo?.replyUserName });
                }
                break;
              case MakerCheckerEnum.OnHoldAgent:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Ticket-On-Hold-Message', { replyUserName: mention?.ticketInfo?.replyUserName });
                break;
              case MakerCheckerEnum.CustomerInfoAwaited:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Needs-More-Info-From-Customer', { replyUserName: mention?.ticketInfo?.replyUserName });
                break;
              case MakerCheckerEnum.Close:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Close-Ticket-Message', { replyUserName: mention?.ticketInfo?.replyUserName });
                break;
              case MakerCheckerEnum.ReplyClose:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Reply-Close-Ticket-Message', { replyUserName: mention?.ticketInfo?.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? ` (${mention?.ticketInfoWorkflow?.workflowName})` : '' });
                break;
              case MakerCheckerEnum.ReplyEscalate:
                if (mention?.ticketInfo.replyEscalatedToUsername) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Reply-Escalate-Ticket-Message', { replyUserName: mention?.ticketInfo?.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '', replyEscalatedToUsername: mention?.ticketInfo?.replyEscalatedToUsername });
                } else if (
                  mention?.makerCheckerMetadata &&
                  mention?.makerCheckerMetadata.replyEscalatedTeamName
                ) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Reply-Escalate-Ticket-Message', { replyUserName: mention?.ticketInfo?.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '', replyEscalatedToUsername: mention?.makerCheckerMetadata.replyEscalatedTeamName });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Formatted-Fix', { replyUserName: mention?.ticketInfo?.replyUserName });
                }
                break;
              case MakerCheckerEnum.ReplyHold:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Customer-Following-message',{ replyUserName: mention?.ticketInfo?.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '' });
                break;
              case MakerCheckerEnum.ReplyAwaitingResponse:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('More-Info-Needed',{ replyUserName: mention?.ticketInfo?.replyUserName });
                break;
              case MakerCheckerEnum.CaseAttach:
                if (mention?.mentionsAttachToCaseid) {
                  const totalmention =
                    mention?.mentionsAttachToCaseid.split(',');
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Attach-Mentions-To-Ticket', { replyUserName: mention?.ticketInfo?.replyUserName, totalmention: totalmention?.length, attachToCaseid: mention?.attachToCaseid });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Attach-Ticket-Message', { replyUserName: mention?.ticketInfo?.replyUserName, attachToCaseid: mention?.attachToCaseid });
                }
                break;
              case MakerCheckerEnum.ReplyAndAssign:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Customer-with-reply-following-message', { replyUserName: mention?.ticketInfo?.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '', replyAssignTeamName : (mention?.makerCheckerMetadata?.replyassignagentname || mention?.makerCheckerMetadata?.replyAssignTeamName) });
                  break;
              default:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Following-Reply-Text', { replyUserName : mention?.ticketInfo?.replyUserName });
                break;
            }
          }

          if (
            mention?.ticketInfo.makerCheckerStatus !==
              MakerCheckerEnum.OnHoldAgent &&
            mention?.ticketInfo.makerCheckerStatus !== MakerCheckerEnum.Close &&
            mention?.ticketInfo.makerCheckerStatus !==
              MakerCheckerEnum.CustomerInfoAwaited &&
            mention?.ticketInfo.makerCheckerStatus !==
              MakerCheckerEnum.DirectClose
          ) {
            if (
              mention?.ticketInfo.escalationMessage &&
              (+currentUser.data.user.role === UserRoleEnum.CustomerCare ||
                +currentUser.data.user.role === UserRoleEnum.BrandAccount)
            ) {
              ticketHistoryData.MakerCheckerPreview.messageContent =
                mention?.ticketInfo.escalationMessage;
            } else if (
              mention?.makerCheckerMetadata &&
              mention?.makerCheckerMetadata.replyMakerCheckerMessage
            ) {
              ticketHistoryData.MakerCheckerPreview.messageContent =
                mention?.makerCheckerMetadata.replyMakerCheckerMessage;
            }

            this.approvalSectionMedia(mention, ticketHistoryData, MediaUrl);
          }
        } else if (
          mention?.makerCheckerMetadata.workflowStatus ===
            LogStatus.ReplySentForApproval &&
          mention?.replyScheduledDateTime
        ) {
          if (mention?.isPrivateMessage && mention?.isSendFeedback) {
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Private-Message', { replyUserName: mention?.ticketInfo.replyUserName })
          } else if (mention?.isPrivateMessage) {
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Private-Message-Formatted', { replyUserName: mention?.ticketInfo.replyUserName });
          } else if (mention?.isSendFeedback) {
            let action = '';
            switch (mention?.ticketInfo.makerCheckerStatus) {
              case MakerCheckerEnum.ReplyClose:
                action = 'Reply and Close';
                break;
              case MakerCheckerEnum.ReplyEscalate:
                action = 'Reply and Escalate';
                break;
              case MakerCheckerEnum.ReplyAwaitingResponse:
                action = 'Reply Awaiting Response';
                break;
              default:
                action = 'Reply';
                break;
            }
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Feedback-Form-Message',{ replyUserName: mention?.ticketInfo.replyUserName, action: action })
          } else {
            switch (mention?.ticketInfo.makerCheckerStatus) {
              case MakerCheckerEnum.DirectClose:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Directly-Close-Ticket', { replyUserName : mention?.ticketInfo?.replyUserName });
                break;
              case MakerCheckerEnum.Escalate:
                if (mention?.ticketInfo.replyEscalatedToUsername) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Only', { replyUserName: mention?.ticketInfo.replyUserName, replyEscalatedToUsername: mention?.ticketInfo.replyEscalatedToUsername });
                } else if (
                  mention?.makerCheckerMetadata &&
                  mention?.makerCheckerMetadata.replyEscalatedTeamName
                ) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Only', { replyUserName: mention?.ticketInfo.replyUserName, replyEscalatedToUsername: mention?.makerCheckerMetadata.replyEscalatedTeamName });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Want-to', { replyUserName: mention?.ticketInfo.replyUserName });
                }
                break;
              case MakerCheckerEnum.OnHoldAgent:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Ticket-On-Hold-Message-Fix', { replyUserName: mention?.ticketInfo.replyUserName });
                break;
              case MakerCheckerEnum.CustomerInfoAwaited:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Needs-More-Info-From-Customer', { replyUserName: mention?.ticketInfo.replyUserName });
                break;
              case MakerCheckerEnum.Close:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Close-Ticket-Message', { replyUserName: mention?.ticketInfo.replyUserName });
                break;
              case MakerCheckerEnum.ReplyClose:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Close-Ticket-Message-Formatted-Fix',{replyUserName: mention?.ticketInfo.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '' });
                break;
              case MakerCheckerEnum.ReplyEscalate:
                if (mention?.ticketInfo.replyEscalatedToUsername) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Formatted',{ replyUserName: mention?.ticketInfo.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '', replyEscalatedToUsername: mention?.ticketInfo.replyEscalatedToUsername });
                } else if (
                  mention?.makerCheckerMetadata &&
                  mention?.makerCheckerMetadata.replyEscalatedTeamName
                ) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Formatted', { replyUserName: mention?.ticketInfo.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '', replyEscalatedToUsername: mention?.makerCheckerMetadata.replyEscalatedTeamName });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Formatted-Fix', { replyUserName: mention?.ticketInfo.replyUserName })
                }
                break;
              case MakerCheckerEnum.ReplyHold:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Customer-Following-message', { replyUserName: mention?.ticketInfo?.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '' });
                break;
              case MakerCheckerEnum.ReplyAwaitingResponse:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('More-Info-Needed',{ replyUserName: mention?.ticketInfo.replyUserName });
                break;
              case MakerCheckerEnum.CaseAttach:
                if (mention?.mentionsAttachToCaseid) {
                  const totalmention =
                    mention?.mentionsAttachToCaseid.split(',');
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Attach-Mentions-To-Ticket',{ replyUserName: mention?.ticketInfo.replyUserName, totalmention: totalmention?.length, attachToCaseid: mention?.attachToCaseid });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Attach-Ticket-Message',{ replyUserName: mention?.ticketInfo.replyUserName, attachToCaseid: mention?.attachToCaseid });
                }
                break;
              case MakerCheckerEnum.ReplyAndAssign:
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Customer-with-reply-following-message', { replyUserName: mention?.ticketInfo.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '', replyAssignTeamName : (mention?.makerCheckerMetadata?.replyassignagentname || mention?.makerCheckerMetadata?.replyAssignTeamName) });
                break;
                break;
              default:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Following-Reply-Text',{ replyUserName: mention?.ticketInfo.replyUserName });
                break;
            }
          }

          // <span class="post__body--noteheaditem">
          //                                 Scheduled Reply on :
          //                                 <span data-repyscheduledatetimeepoch="@LocoBuzzHelper.ToUnixTime(item.ReplyScheduledDateTime.Value)"
          // class="text__locobuzz RepyScheduleDateTimeEpoch"></span>
          //                                 <span data-repyscheduledurationepoch="@LocoBuzzHelper.ToUnixTime(item.ReplyScheduledDateTime.Value)"
          // class="text__red RepyScheduleDurationEpoch"></span>
          //                             </span>

          if (
            mention?.ticketInfo.makerCheckerStatus !==
              MakerCheckerEnum.OnHoldAgent &&
            mention?.ticketInfo.makerCheckerStatus !== MakerCheckerEnum.Close &&
            mention?.ticketInfo.makerCheckerStatus !==
              MakerCheckerEnum.CustomerInfoAwaited
          ) {
            if (
              mention?.ticketInfo.escalationMessage &&
              (+currentUser.data.user.role === UserRoleEnum.CustomerCare ||
                +currentUser.data.user.role === UserRoleEnum.BrandAccount)
            ) {
              ticketHistoryData.MakerCheckerPreview.messageContent =
                mention?.ticketInfo.escalationMessage;
            } else if (
              mention?.makerCheckerMetadata &&
              mention?.makerCheckerMetadata.replyMakerCheckerMessage
            ) {
              ticketHistoryData.MakerCheckerPreview.messageContent =
                mention?.makerCheckerMetadata.replyMakerCheckerMessage;
            }
            this.approvalSectionMedia(mention, ticketHistoryData, MediaUrl);
          }
        } else if (
          +mention?.makerCheckerMetadata.workflowStatus ===
            LogStatus.ReplyScheduled &&
          mention?.replyScheduledDateTime != null &&
          mention?.ticketInfo.status === TicketStatus.Open
        ) {
          if (mention?.isPrivateMessage && mention?.isSendFeedback) {
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Private-Message-With-Feedback', { replyUserName: mention?.ticketInfo.replyUserName });
          } else if (mention?.isPrivateMessage) {
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Private-Message-Text', { replyUserName: mention?.ticketInfo.replyUserName });
          } else if (mention?.isSendFeedback) {
            let action = '';
            switch (mention?.ticketInfo.makerCheckerStatus) {
              case MakerCheckerEnum.ReplyClose:
                action = 'Reply and Close';
                break;
              case MakerCheckerEnum.ReplyEscalate:
                action = 'Reply and Escalate';
                break;
              case MakerCheckerEnum.ReplyAwaitingResponse:
                action = 'Reply Awaiting Response';
                break;
              default:
                action = 'Reply';
                break;
            }
            ticketHistoryData.MakerCheckerPreview.actionPerformed =
              this.translate.instant('Send-Feedback-Form-Message', { replyUserName: mention?.ticketInfo.replyUserName, action: action });
          } else {
            switch (mention?.ticketInfo.makerCheckerStatus) {
              case MakerCheckerEnum.DirectClose:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Directly-Close-Ticket', { replyUserName: mention?.ticketInfo?.replyUserName });
                break;
              case MakerCheckerEnum.Escalate:
                if (mention?.ticketInfo.replyEscalatedToUsername) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Only', { replyUserName: mention?.ticketInfo.replyUserName, replyEscalatedToUsername: mention?.ticketInfo.replyEscalatedToUsername });
                } else if (
                  mention?.makerCheckerMetadata &&
                  mention?.makerCheckerMetadata.replyEscalatedTeamName
                ) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Only', { replyUserName: mention?.ticketInfo.replyUserName, replyEscalatedToUsername: mention?.makerCheckerMetadata.replyEscalatedTeamName });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Want-to', { replyUserName: mention?.ticketInfo.replyUserName });
                }
                break;
              case MakerCheckerEnum.OnHoldAgent:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Ticket-On-Hold-Message-Fix', { replyUserName: mention?.ticketInfo.replyUserName });
                break;
              case MakerCheckerEnum.CustomerInfoAwaited:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Needs-More-Info-From-Customer', { replyUserName: mention?.ticketInfo.replyUserName });
                break;
              case MakerCheckerEnum.Close:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Close-Ticket-Message', { replyUserName: mention?.ticketInfo.replyUserName });
                break;
              case MakerCheckerEnum.ReplyClose:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Close-Ticket-Message-Formatted-Fix', { replyUserName: mention?.ticketInfo.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '' });
                break;
              case MakerCheckerEnum.ReplyEscalate:
                if (mention?.ticketInfo.replyEscalatedToUsername) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Formatted', { replyUserName: mention?.ticketInfo.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '', replyEscalatedToUsername: mention?.ticketInfo.replyEscalatedToUsername });
                } else if (
                  mention?.makerCheckerMetadata &&
                  mention?.makerCheckerMetadata.replyEscalatedTeamName
                ) {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Formatted', { replyUserName: mention?.ticketInfo.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '', replyEscalatedToUsername: mention?.makerCheckerMetadata.replyEscalatedTeamName });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Escalate-Ticket-Message-Formatted-Fix', { replyUserName: mention?.ticketInfo.replyUserName });
                }
                break;
              case MakerCheckerEnum.ReplyHold:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Customer-Following-message', { replyUserName: mention?.ticketInfo.replyUserName, workflowName: ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : '' });
                break;
              case MakerCheckerEnum.ReplyAwaitingResponse:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('More-Info-Needed', { replyUserName: mention?.ticketInfo.replyUserName });
                break;
              case MakerCheckerEnum.CaseAttach:
                if (mention?.mentionsAttachToCaseid) {
                  const totalmention =
                    mention?.mentionsAttachToCaseid.split(',');
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Attach-Mentions-To-Ticket', { replyUserName: mention?.ticketInfo.replyUserName, totalmention: totalmention?.length, attachToCaseid: mention?.attachToCaseid });
                } else {
                  ticketHistoryData.MakerCheckerPreview.actionPerformed =
                    this.translate.instant('Attach-Ticket-Message', { replyUserName: mention?.ticketInfo.replyUserName, attachToCaseid: mention?.attachToCaseid });
                }
                break;
              default:
                ticketHistoryData.MakerCheckerPreview.actionPerformed =
                  this.translate.instant('Following-Reply-Text', { replyUserName: mention?.ticketInfo.replyUserName });
                break;
            }
          }

          // <span class="post__body--noteheaditem">
          //                                 Scheduled Reply on :
          //                                 <span data-repyscheduledatetimeepoch="@LocoBuzzHelper.ToUnixTime(item.ReplyScheduledDateTime.Value)"
          // class="text__locobuzz RepyScheduleDateTimeEpoch"></span>
          //                                 <span data-repyscheduledurationepoch="@LocoBuzzHelper.ToUnixTime(item.ReplyScheduledDateTime.Value)"
          // class="text__red RepyScheduleDurationEpoch"></span>
          //                             </span>

          if (
            mention?.ticketInfo.makerCheckerStatus !==
              MakerCheckerEnum.OnHoldAgent &&
            mention?.ticketInfo.makerCheckerStatus !== MakerCheckerEnum.Close &&
            mention?.ticketInfo.makerCheckerStatus !==
              MakerCheckerEnum.CustomerInfoAwaited
          ) {
            if (
              mention?.ticketInfo.escalationMessage &&
              (+currentUser.data.user.role === UserRoleEnum.CustomerCare ||
                +currentUser.data.user.role === UserRoleEnum.BrandAccount)
            ) {
              ticketHistoryData.MakerCheckerPreview.messageContent =
                mention?.ticketInfo.escalationMessage;
            } else if (
              mention?.makerCheckerMetadata &&
              mention?.makerCheckerMetadata.replyMakerCheckerMessage
            ) {
              ticketHistoryData.MakerCheckerPreview.messageContent =
                mention?.makerCheckerMetadata.replyMakerCheckerMessage;
            }

            this.approvalSectionMedia(mention, ticketHistoryData, MediaUrl);
          }
        }
      } else if (
        mention?.ticketInfo.status === TicketStatus.Open &&
        mention?.replyScheduledDateTime
      ) {
        ticketHistoryData.MakerCheckerPreview.actionPerformed =
          this.translate.instant('Following-Reply-Text',{ replyUserName: mention?.ticketInfo.replyUserName });

        // <span class="post__body--noteheaditem">
        //                                 Scheduled Reply on :
        //                                 <span data-repyscheduledatetimeepoch="@LocoBuzzHelper.ToUnixTime(item.ReplyScheduledDateTime.Value)"
        // class="text__locobuzz RepyScheduleDateTimeEpoch"></span>
        //                                 <span data-repyscheduledurationepoch="@LocoBuzzHelper.ToUnixTime(item.ReplyScheduledDateTime.Value)"
        // class="text__red RepyScheduleDurationEpoch"></span>
        //                             </span>

        if (
          mention?.ticketInfo.makerCheckerStatus !==
            MakerCheckerEnum.OnHoldAgent &&
          mention?.ticketInfo.makerCheckerStatus !== MakerCheckerEnum.Close &&
          mention?.ticketInfo.makerCheckerStatus !==
            MakerCheckerEnum.CustomerInfoAwaited
        ) {
          if (
            mention?.ticketInfo.escalationMessage &&
            (+currentUser.data.user.role === UserRoleEnum.CustomerCare ||
              +currentUser.data.user.role === UserRoleEnum.BrandAccount)
          ) {
            ticketHistoryData.MakerCheckerPreview.messageContent =
              mention?.ticketInfo.escalationMessage;
          } else if (ticketHistoryData && ticketHistoryData.LastNote) {
            ticketHistoryData.MakerCheckerPreview.messageContent =
              ticketHistoryData.LastNote;
          }

          this.approvalSectionMedia(mention, ticketHistoryData, MediaUrl);
        }
      }
    } else if (
      (ticketHistoryData.isSSREEnabled || ticketHistoryData.isWorkflowEnabled) &&
      +currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
      +currentUser.data.user.role !== UserRoleEnum.BrandAccount &&
      mention?.isSSRE &&
      (+mention?.tagID === mention?.ticketInfoSsre.latestMentionActionedBySSRE ||
        mention?.ticketInfoSsre.ssreReplyType === 12) &&
      (mention?.ticketInfoSsre.ssreMode === SSREMode.Live ||
        mention?.ticketInfoSsre.ssreMode === SSREMode.Simulation) &&
      mention?.ticketInfoSsre.ssreIntent !== SsreIntent.Wrong &&
      (mention?.ticketInfoSsre.ssreStatus === SSRELogStatus.Successful ||
        mention?.ticketInfoSsre.ssreStatus ===
          SSRELogStatus.SSREMakerCheckerEnabled)
    ) {
      ticketHistoryData.isSSREPreview = true;
      let ssreclass = '';
      let ruleorintent = '';
      let ssretype = '';
      let ssreMode = '';
      if (mention?.ticketInfoSsre.intentRuleType === 1) {
        ruleorintent = 'Intent';
      } else if (mention?.ticketInfoSsre.intentRuleType === 2) {
        ruleorintent = 'Rule';
      }

      if (mention?.ticketInfoSsre.ssreReplyType === 3) {
        ssretype = 'Replied and Escalated';
      } else if (mention?.ticketInfoSsre.ssreReplyType === 2) {
        ssretype = 'Replied and Closed';
      } else if (mention?.ticketInfoSsre.ssreReplyType === 5) {
        ssretype = 'Replied and is Awaiting response from customer';
      } else if (mention?.ticketInfoSsre.ssreReplyType === 12) {
        ssretype = 'did not take any action on';
      }
      if (mention?.ticketInfoSsre.ssreIntent !== SsreIntent.Right) {
        ssreclass =
          mention?.ticketInfoSsre.ssreMode === SSREMode.Simulation
            ? 'post__simulation'
            : 'post__live';
        ssreMode =
          mention?.ticketInfoSsre.ssreMode === SSREMode.Simulation
            ? 'Simulation'
            : 'Live';
      }

      ticketHistoryData.SSREPreview.actionPerformed +=
        '<p class="post__note--title">';
      if (mention?.ticketInfoSsre.ssreMode === SSREMode.Live) {
        ticketHistoryData.SSREPreview.actionPerformed +=
          this.translate.instant('Ticket-History-Message', { status: ticketHistoryData.isWorkflowEnabled ? 'Workflow ' : 'SSRE ', ssretype, workflowName: (ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : mention?.ticketInfoSsre.intentFriendlyName), ruleorintent });
        if (mention?.ticketInfoSsre.intentPVTRuleDisplayName && !ticketHistoryData.isWorkflowEnabled) {
          ticketHistoryData.SSREPreview.actionPerformed +=
            this.translate.instant('Mapped-With-Rule', { intentPVTRuleDisplayName: mention?.ticketInfoSsre.intentPVTRuleDisplayName })
        }
        if (mention?.ticketInfoWorkflow?.workflowName && ticketHistoryData.isWorkflowEnabled) {
          ticketHistoryData.SSREPreview.actionPerformed +=
            '<span>'
        }
      } else if (mention?.ticketInfoSsre.ssreMode === SSREMode.Simulation) {
        ticketHistoryData.SSREPreview.actionPerformed +=
          this.translate.instant('Has-Suggested-Message', { Workflow: ticketHistoryData.isWorkflowEnabled ? 'Workflow ' : 'SSRE ', ssretype, intentFriendlyName: (ticketHistoryData.isWorkflowEnabled ? mention?.ticketInfoWorkflow?.workflowName : mention?.ticketInfoSsre.intentFriendlyName), ruleorintent });
          ruleorintent;
        if (mention?.ticketInfoSsre.intentPVTRuleDisplayName && !ticketHistoryData.isWorkflowEnabled) {
          ticketHistoryData.SSREPreview.actionPerformed +=
            this.translate.instant('Mapped-With-Rule-Message', { intentPVTRuleDisplayName: mention?.ticketInfoSsre.intentPVTRuleDisplayName });
        }
        if (mention?.ticketInfoWorkflow?.workflowName && ticketHistoryData.isWorkflowEnabled) {
          ticketHistoryData.SSREPreview.actionPerformed +=
            '<span>';
        }
      }

      if (mention?.ticketInfoSsre.ssreIntent !== SsreIntent.Right) {
        ticketHistoryData.SSREPreview.actionPerformed +=
          '<span class="post__ribbon ' +
          ssreclass +
        `">` + (ticketHistoryData.isWorkflowEnabled ? this.translate.instant('Workflow') : 'SSRE') +
          ssreMode +
          '</span>';
      }

      ticketHistoryData.SSREPreview.actionPerformed += '</p>';

      if (mention?.ticketInfoSsre.ssreReply) {
        ticketHistoryData.SSREPreview.messageContent =
          mention?.ticketInfoSsre.ssreReply.replymessage;
      }
    } else if (
      (ticketHistoryData.isSSREEnabled || ticketHistoryData.isWorkflowEnabled)&&
      +currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
      +currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
      (mention?.ticketInfoSsre.ssreStatus === SSRELogStatus.SSREInProcessing ||
        mention?.ticketInfoSsre.ssreStatus ===
          SSRELogStatus.IntentFoundStillInProgress) &&
      mention?.ticketInfo.status !== TicketStatus.Close
    ) {
      ticketHistoryData.isSSREPreview = true;
      ticketHistoryData.SSREPreview.actionPerformed +=
        `<span class="colored__locobuzz"> <img src="assets/images/common/loader-circle.svg" class="w-27">` + (ticketHistoryData.isWorkflowEnabled ?'Workflow ':'SSRE ')+` is working on this ticket please wait ....</span>`;
    }

    if (
      (ticketHistoryData.isSSREEnabled || ticketHistoryData.isWorkflowEnabled)&&
      +currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
      +currentUser.data.user.role !== UserRoleEnum.BrandAccount &&
      mention?.ticketInfoSsre.latestMentionActionedBySSRE &&
      (+mention?.tagID === mention?.ticketInfoSsre.latestMentionActionedBySSRE ||
        mention?.ticketInfoSsre.ssreReplyType === 12)
    ) {
      if (
        mention?.isSSRE &&
        mention?.ticketInfoSsre.ssreMode === SSREMode.Live &&
        (mention?.ticketInfoSsre.ssreStatus === SSRELogStatus.Successful ||
          mention?.ticketInfoSsre.ssreStatus ===
            SSRELogStatus.SSREMakerCheckerEnabled)
      ) {
        const instapostType = mention?.instagramPostType;

        if (mention?.ticketInfoSsre.ssreIntent === SsreIntent.Right) {
          ticketHistoryData.isLiveSSRE = false;
          ticketHistoryData.isSSREVerified = true;
        } else if (
          mention?.ticketInfoSsre.ssreIntent === SsreIntent.NoActionTaken &&
          mention?.ticketInfoSsre.ssreStatus === SSRELogStatus.Successful
        ) {
          ticketHistoryData.isLiveSSRE = true;
        }
      } else if (
        mention?.ticketInfoSsre.ssreMode === SSREMode.Simulation &&
        (mention?.ticketInfoSsre.ssreStatus === SSRELogStatus.Successful ||
          mention?.ticketInfoSsre.ssreStatus ===
            SSRELogStatus.SSREMakerCheckerEnabled)
      ) {
        if (mention?.ticketInfoSsre.ssreIntent === SsreIntent.Right) {
          ticketHistoryData.isSSREVerified = true;
          ticketHistoryData.isSimulationSSRE = false;
        } else if (
          mention?.ticketInfoSsre.ssreIntent === SsreIntent.NoActionTaken &&
          mention?.ticketInfoSsre.ssreStatus === SSRELogStatus.Successful &&
          currentUser.data.user.actionButton.markRightWrongSSREEnabled
        ) {
          ticketHistoryData.isSimulationSSRE = true;
        }
      }
    }

    return ticketHistoryData;
  }

  approvalSectionMedia(
    mention: BaseMention,
    ticketHistoryData: AllBrandsTicketsDTO,
    MediaUrl: string
  ): any {
    ticketHistoryData.makercheckerimageurls = [];
    ticketHistoryData.makercheckervideoUrls = [];
    ticketHistoryData.makercheckerdocumentUrls = [];
    if (mention?.channelGroup === ChannelGroup.Twitter) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const MediaContentItem of mention?.attachmentMetadata
          .mediaContents) {
          if (MediaContentItem.mediaType === MediaEnum.IMAGE) {
            if (
              mention?.channelType === ChannelType.DirectMessages &&
              MediaContentItem.thumbUrl
            ) {
              if (MediaContentItem?.thumbUrl?.includes('images.locobuzz') || MediaContentItem?.thumbUrl?.includes('s3.amazonaws')) {
                // eslint-disable-next-line max-len
                const mimeType = MimeTypes.getMimeTypefromString(
                  MediaContentItem.thumbUrl.split('.').pop()
                );
                const ReplaceText = 'https://images.locobuzz.com/';
                let ThumbUrl = MediaContentItem.thumbUrl;
                ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3New?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}&brandsocialid=${mention?.author.socialId}&brandID=${mention?.brandInfo.brandID}&brandName=${mention?.brandInfo.brandName}&channeltype=${mention?.channelType}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                MediaContentItem.mediaUrl = backgroundUrl;
              } else {
                if (mention?.isBrandPost) {
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem.mediaUrl}&brandsocialid=${mention?.author.socialId}&brandID=${mention?.brandInfo.brandID}&brandName=${mention?.brandInfo.brandName}&tagID=${mention?.tagID}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                } else {
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem.mediaUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo.brandID}&brandName=${mention?.brandInfo.brandName}&tagID=${mention?.tagID}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                }
              }
            } else {
              const backgroundUrl = `${MediaContentItem.thumbUrl}`;
              ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
            }
          }
          if (MediaContentItem.mediaType === MediaEnum.VIDEO) {
            if (
              mention?.channelType === ChannelType.DirectMessages &&
              MediaContentItem.thumbUrl
            ) {
              let SocialOrUserId = '';
              if (mention?.isBrandPost) {
                SocialOrUserId = mention?.author.socialId;
              } else {
                SocialOrUserId = mention?.inReplyToUserID;
              }
              if (MediaContentItem.thumbUrl.includes('images.locobuzz')) {
                // eslint-disable-next-line max-len
                const mimeType = MimeTypes.getMimeTypefromString(
                  MediaContentItem.thumbUrl.split('.').pop()
                );
                const ReplaceText = 'https://images.locobuzz.com/';
                let ThumbUrl = MediaContentItem.thumbUrl;
                ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              } else {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              }
            } else {
              const backgroundUrl = `${MediaContentItem.thumbUrl}`;
              ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.Facebook) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        if (mention?.mediaType === MediaEnum.IMAGE) {
          if (mention?.attachmentMetadata.mediaContents.length > 0) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (
                mention?.channelType === ChannelType.FBMessages &&
                MediaContentItem.thumbUrl
              ) {
                if (MediaContentItem?.thumbUrl?.includes('images.locobuzz')) {
                  const mimeType = MimeTypes.getMimeTypefromString(
                    MediaContentItem.thumbUrl.split('.').pop()
                  );
                  const ReplaceText = 'https://images.locobuzz.com/';
                  let ThumbUrl = MediaContentItem.thumbUrl;
                  ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                  MediaContentItem.thumbUrl = backgroundUrl;
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                }
              } else {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              }
            }
          }
        } else if (mention?.mediaType === MediaEnum.VIDEO) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (
                MediaContentItem.thumbUrl &&
                (MediaContentItem.thumbUrl.includes('.png') ||
                  MediaContentItem.thumbUrl.includes('.jpg') ||
                  MediaContentItem.thumbUrl.includes('.jpeg') ||
                  MediaContentItem.thumbUrl.includes('.gif'))
              ) {
                if (mention?.channelType === ChannelType.FBMessages) {
                  if (MediaContentItem.thumbUrl.includes('images.locobuzz')) {
                    const mimeType = MimeTypes.getMimeTypefromString(
                      MediaContentItem.thumbUrl.split('.').pop()
                    );
                    const ReplaceText = 'https://images.locobuzz.com/';
                    let ThumbUrl = MediaContentItem.thumbUrl;
                    ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                    const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                    ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                    MediaContentItem.thumbUrl = backgroundUrl;
                  } else {
                    const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                    ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                  }
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                }
              } else {
                if (MediaContentItem.mediaUrl) {
                  ticketHistoryData.makercheckerimageurls.push(
                    MediaContentItem.mediaUrl
                  );
                }
              }
            }
          }
        } else if (mention?.mediaType === MediaEnum.URL) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (
                MediaContentItem.mediaUrl &&
                (MediaContentItem.mediaUrl.includes('.png') ||
                  MediaContentItem.mediaUrl.includes('.jpeg') ||
                  MediaContentItem.mediaUrl.includes('.gif'))
              ) {
                const backgroundUrl = `${MediaContentItem.mediaUrl}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              } else {
                if (MediaContentItem.mediaUrl) {
                  ticketHistoryData.makercheckerimageurls.push(
                    MediaContentItem.mediaUrl
                  );
                }
              }
            }
          }
        } else if (mention?.mediaType === MediaEnum.AUDIO) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              ticketHistoryData.makercheckerimageurls.push(
                'assets/images/common/AudioMusic.svg'
              );
            }
          }
        } else if (mention?.mediaType === MediaEnum.ANIMATEDGIF) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              ticketHistoryData.makercheckerimageurls.push(
                'assets/images/common/AudioMusic.svg'
              );
            }
          }
        } else if (mention?.mediaType === MediaEnum.OTHER) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (
                MediaContentItem.mediaUrl &&
                (MediaContentItem.mediaUrl.includes('.png') ||
                  MediaContentItem.mediaUrl.includes('.jpeg') ||
                  MediaContentItem.mediaUrl.includes('.jpg') ||
                  MediaContentItem.mediaUrl.includes('.gif'))
              ) {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              } else if (MediaContentItem.mediaUrl) {
                if (MediaContentItem.mediaUrl.includes('.pdf')) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(
                    'assets/images/common/pdf.png'
                  );
                  // bind the  pdf url
                } else if (
                  MediaContentItem.mediaUrl.includes('.doc') ||
                  MediaContentItem.mediaUrl.includes('.docx')
                ) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(
                    'assets/images/common/word.png'
                  );
                } else if (
                  MediaContentItem.mediaUrl.includes('.xls') ||
                  MediaContentItem.mediaUrl.includes('.xlsx')
                ) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(
                    'assets/images/common/excel-file.png)'
                  );
                } else if (MediaContentItem.mediaUrl.includes('.mp3')) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(
                    'assets/images/common/AudioMusic.svg'
                  );
                } else {
                  ticketHistoryData.makercheckerimageurls.push(
                    MediaContentItem.mediaUrl
                  );
                }
              } else {
                if (MediaContentItem.mediaUrl) {
                  ticketHistoryData.makercheckerimageurls.push(
                    MediaContentItem.mediaUrl
                  );
                }
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.GoogleMyReview || mention?.channelGroup === ChannelGroup.GoogleBusinessMessages) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        if (mention?.mediaType === MediaEnum.IMAGE) {
          if (mention?.attachmentMetadata.mediaContents.length > 0) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (
                mention?.channelType === ChannelType.FBMessages &&
                MediaContentItem.thumbUrl
              ) {
                if (MediaContentItem?.thumbUrl?.includes('images.locobuzz')) {
                  const mimeType = MimeTypes.getMimeTypefromString(
                    MediaContentItem.thumbUrl.split('.').pop()
                  );
                  const ReplaceText = 'https://images.locobuzz.com/';
                  let ThumbUrl = MediaContentItem.thumbUrl;
                  ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                  MediaContentItem.thumbUrl = backgroundUrl;
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                }
              } else {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.GooglePlayStore) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        if (mention?.mediaType === MediaEnum.IMAGE) {
          if (mention?.attachmentMetadata.mediaContents.length > 0) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (
                mention?.channelType === ChannelType.FBMessages &&
                MediaContentItem.thumbUrl
              ) {
                if (MediaContentItem.thumbUrl.includes('images.locobuzz')) {
                  const mimeType = MimeTypes.getMimeTypefromString(
                    MediaContentItem.thumbUrl.split('.').pop()
                  );
                  const ReplaceText = 'https://images.locobuzz.com/';
                  let ThumbUrl = MediaContentItem.thumbUrl;
                  ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                  MediaContentItem.thumbUrl = backgroundUrl;
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                }
              } else {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.LinkedIn) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        if (mention?.mediaType === MediaEnum.IMAGE) {
          if (mention?.attachmentMetadata.mediaContents.length > 0) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (
                mention?.channelType === ChannelType.FBMessages &&
                MediaContentItem.thumbUrl
              ) {
                if (MediaContentItem?.thumbUrl?.includes('images.locobuzz')) {
                  const mimeType = MimeTypes.getMimeTypefromString(
                    MediaContentItem.thumbUrl.split('.').pop()
                  );
                  const ReplaceText = 'https://images.locobuzz.com/';
                  let ThumbUrl = MediaContentItem.thumbUrl;
                  ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                }
              } else {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.Instagram) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        if (mention?.mediaType === MediaEnum.IMAGE) {
          if (mention?.attachmentMetadata.mediaContents.length > 0) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              ticketHistoryData.makercheckerimageurls.push(
                MediaContentItem.mediaUrl
              );
            }
          }
        } else if (mention?.mediaType === MediaEnum.VIDEO) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            if (
              MediaContentItem.mediaUrl &&
              MediaContentItem.mediaUrl.includes('.mp4')
            ) {
              const vidurl: VideoUrl = {};
              vidurl.fileUrl = MediaContentItem.mediaUrl;
              vidurl.thumbUrl = MediaContentItem.mediaUrl;
              ticketHistoryData.makercheckervideoUrls.push(vidurl);
            } else if (
              (MediaContentItem?.thumbUrl &&
                MediaContentItem?.thumbUrl?.includes('.png')) ||
              MediaContentItem?.thumbUrl?.includes('.jpg') ||
              MediaContentItem?.thumbUrl?.includes('.jpeg') ||
              MediaContentItem?.thumbUrl?.includes('.gif')
            ) {
              ticketHistoryData.makercheckerimageurls.push(
                MediaContentItem.thumbUrl
              );
            } else {
              if (MediaContentItem.mediaUrl) {
                ticketHistoryData.makercheckerimageurls.push(
                  MediaContentItem.mediaUrl
                );
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.Youtube) {
      if (mention?.mediaType === MediaEnum.VIDEO) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem in mention?.attachmentMetadata
            .mediaContents) {
            // Youtube video logic is remaining
            // List<string>
            //     YoutubeVideoID = MediaContentItem.MediaUrl.Split('=').ToList();
            // var VideoID = "";
            // VideoID = YoutubeVideoID[YoutubeVideoID.Count - 1];
            // <div class="fine_bg youtubeVideo">
            //     <iframe src="https://www.youtube.com/embed/@VideoID?rel=0" allowfullscreen></iframe>
            // </div>
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.WhatsApp) {
      if (mention?.mediaType === MediaEnum.IMAGE) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.VIDEO) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            const vidurl: VideoUrl = {};
            vidurl.fileUrl = backgroundUrl;
            vidurl.thumbUrl = backgroundUrl;
            ticketHistoryData.makercheckervideoUrls.push(vidurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.AUDIO) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            const audurl: AudioUrl = {};
            audurl.fileUrl = backgroundUrl;
            audurl.thumbUrl = backgroundUrl;
            ticketHistoryData.audioUrls.push(audurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.PDF) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
            const docurl: DocumentUrl = {};
            docurl.fileName = MediaContentItem.name;
            docurl.fileUrl = backgroundUrl;
            docurl.thumbUrl = 'assets/images/common/pdf.png';
            ticketHistoryData.makercheckerdocumentUrls.push(docurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.DOC) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
            const docurl: DocumentUrl = {};
            docurl.fileName = MediaContentItem.name;
            docurl.fileUrl = backgroundUrl;
            docurl.thumbUrl = 'assets/images/common/word.png';
            ticketHistoryData.makercheckerdocumentUrls.push(docurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.EXCEL) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
            const docurl: DocumentUrl = {};
            docurl.fileName = MediaContentItem.name;
            docurl.fileUrl = backgroundUrl;
            docurl.thumbUrl = 'assets/images/common/excel-file.png';
            ticketHistoryData.makercheckerdocumentUrls.push(docurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.URL) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            if (
              MediaContentItem.mediaUrl &&
              (MediaContentItem.mediaUrl.includes('.png') ||
                MediaContentItem.mediaUrl.includes('.jpeg') ||
                MediaContentItem.mediaUrl.includes('.gif'))
            ) {
              ticketHistoryData.makercheckerimageurls.push(
                MediaContentItem.mediaUrl
              );
            } else {
              if (MediaContentItem.mediaUrl) {
                ticketHistoryData.makercheckerimageurls.push(
                  MediaContentItem.mediaUrl
                );
              }
            }
          }
        }
      } else if (
        mention?.mediaType === MediaEnum.OTHER ||
        mention?.mediaType === MediaEnum.HTML
      ) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            if (
              MediaContentItem.mediaUrl &&
              (MediaContentItem.mediaUrl.includes('.png') ||
                MediaContentItem.mediaUrl.includes('.jpeg') ||
                MediaContentItem.mediaUrl.includes('.gif'))
            ) {
              const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
              ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
            } else if (
              MediaContentItem.mediaUrl &&
              MediaContentItem.mediaUrl.includes('.mp4')
            ) {
              const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
              const vidurl: VideoUrl = {};
              vidurl.fileUrl = backgroundUrl;
              vidurl.thumbUrl = backgroundUrl;
              ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
            } else if (
              MediaContentItem.mediaUrl &&
              MediaContentItem.mediaUrl.includes('.mp3')
            ) {
              const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
              const audurl: AudioUrl = {};
              audurl.fileUrl = backgroundUrl;
              audurl.thumbUrl = backgroundUrl;
              ticketHistoryData.audioUrls.push(audurl);
            } else if (MediaContentItem.mediaUrl) {
              if (MediaContentItem.mediaUrl.includes('.pdf')) {
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/pdf.png';
                ticketHistoryData.makercheckerdocumentUrls.push(docurl);
              } else if (
                MediaContentItem.mediaUrl.includes('.doc') ||
                MediaContentItem.mediaUrl.includes('.docx')
              ) {
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/word.png';
                ticketHistoryData.makercheckerdocumentUrls.push(docurl);
              } else if (
                MediaContentItem.mediaUrl.includes('.xls') ||
                MediaContentItem.mediaUrl.includes('.xlsx')
              ) {
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/excel-file.png';
                ticketHistoryData.makercheckerdocumentUrls.push(docurl);
              } else {
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              }
            } else {
              if (MediaContentItem.mediaUrl) {
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              }
            }
          }
        }
      }
    } else if (
      mention?.channelGroup === ChannelGroup.Email &&
      mention?.attachmentMetadata.mediaContents &&
      mention?.attachmentMetadata.mediaContents.length > 0
    ) {
      ticketHistoryData.isemailattachement = true;
    } else if (
      mention?.channelGroup === ChannelGroup.AutomotiveIndia ||
      mention?.channelGroup === ChannelGroup.Blogs ||
      mention?.channelGroup === ChannelGroup.Booking ||
      mention?.channelGroup === ChannelGroup.ComplaintWebsites ||
      mention?.channelGroup === ChannelGroup.DiscussionForums ||
      mention?.channelGroup === ChannelGroup.ECommerceWebsites ||
      mention?.channelGroup === ChannelGroup.Expedia ||
      mention?.channelGroup === ChannelGroup.GooglePlus ||
      mention?.channelGroup === ChannelGroup.HolidayIQ ||
      mention?.channelGroup === ChannelGroup.MakeMyTrip ||
      mention?.channelGroup === ChannelGroup.News ||
      mention?.channelGroup === ChannelGroup.ReviewWebsites ||
      mention?.channelGroup === ChannelGroup.TeamBHP ||
      mention?.channelGroup === ChannelGroup.TripAdvisor ||
      mention?.channelGroup === ChannelGroup.Videos ||
      mention?.channelGroup === ChannelGroup.Zomato
    ) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        if (mention?.mediaType === MediaEnum.IMAGE) {
          if (mention?.attachmentMetadata.mediaContents.length > 0) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (
                mention?.channelType === ChannelType.FBMessages &&
                MediaContentItem.thumbUrl
              ) {
                if (MediaContentItem.thumbUrl.includes('images.locobuzz')) {
                  const mimeType = MimeTypes.getMimeTypefromString(
                    MediaContentItem.thumbUrl.split('.').pop()
                  );
                  const ReplaceText = 'https://images.locobuzz.com/';
                  let ThumbUrl = MediaContentItem.thumbUrl;
                  ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
                }
              } else {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.makercheckerimageurls.push(backgroundUrl);
              }
            }
          }
        }
      }
    }

    return ticketHistoryData;
  }

  SetMentionID(
    pageType: PostsType,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention,
    currentBrand: BrandList
  ): any {
    if (pageType === PostsType.Mentions) {
      ticketHistoryData.ismentionidVisible = true;
      ticketHistoryData.isticketcategorymapVisible = false;
    } else if (pageType === PostsType.Tickets || PostsType.TicketHistory) {
      if (currentBrand.isTicketCategoryTagEnable) {
        ticketHistoryData.isTicketCategoryTagEnable = true;
      }
      ticketHistoryData.isticketcategorymapVisible = true;
    }

    ticketHistoryData.mentionid =
      mention?.brandInfo.brandID +
      '/' +
      mention?.channelType +
      '/' +
      mention?.contentID;
    return ticketHistoryData;
  }

  SetDeleteMention(
    currentUser: AuthUser,
    pageType: PostsType,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    const ActionButton = currentUser.data.user.actionButton;
    if (ActionButton.deleteLocobuzzEnabled && pageType!=PostsType.Tickets) {
      ticketHistoryData.isDeleteFromLocobuzz = true;

      /* tickt approval pending */
      if (+currentUser?.data?.user?.role === UserRoleEnum.Agent && mention?.makerCheckerMetadata?.workflowStatus === LogStatus.ReplySentForApproval){
        ticketHistoryData.isDeleteFromLocobuzz = false;
      }
      /* tickt approval pending */
    }

    if (ActionButton.deleteSocialEnabled) {
      if (pageType === PostsType.TicketHistory) {
        if (mention?.channelGroup === ChannelGroup.Twitter) {
          if (
            (mention?.channelType === ChannelType.BrandTweets &&
              mention?.isBrandPost) ||
            (mention?.channelType === ChannelType.DirectMessages &&
              mention?.isBrandPost)
          ) {
            ticketHistoryData.isDeleteFromChannel = true;
          }
        } else if (mention?.channelGroup === ChannelGroup.Facebook) {
          if (
              mention?.channelType === ChannelType.FBComments
          ) {
            ticketHistoryData.isDeleteFromChannel = true;
          }
        } else if (mention?.channelGroup === ChannelGroup.Instagram) {
          if (
            mention?.channelType === ChannelType.InstagramComments &&
            (mention?.instagramPostType === 1 || mention?.instagramPostType === 4 || mention?.instagramPostType === 9)
          ) {
            ticketHistoryData.isDeleteFromChannel = true;

          }
        } else if (mention?.channelGroup === ChannelGroup.Youtube) {
          if (
            (mention?.channelType === ChannelType.YouTubePosts ||
              mention?.channelType === ChannelType.YouTubeComments) &&
            mention?.isBrandPost
          ) {
            ticketHistoryData.isDeleteFromChannel = true;
          }
        }
      } else if (
        pageType === PostsType.Mentions &&
        (mention?.channelType === ChannelType.FBPageUser ||
          mention?.channelType === ChannelType.FBComments ||
          mention?.channelType === ChannelType.BrandTweets ||
          mention?.channelType === ChannelType.DirectMessages ||
          mention?.channelType === ChannelType.YouTubePosts ||
          mention?.channelType === ChannelType.YouTubeComments
          || mention?.channelType === ChannelType.InstagramComments
          )
      ) {
        if (
          mention?.channelType === ChannelType.YouTubePosts ||
          mention?.channelType === ChannelType.YouTubeComments
          || mention?.channelType === ChannelType.InstagramComments
        ) {
          if (
            mention?.channelType === ChannelType.InstagramComments &&
            (mention?.instagramPostType === 1 || mention?.instagramPostType === 4 || mention?.instagramPostType === 9)
          ) {
            ticketHistoryData.isDeleteFromChannel = true;
          } else if (mention?.isBrandPost) {
            ticketHistoryData.isDeleteFromChannel = true;
          }
        } else {
          ticketHistoryData.isDeleteFromChannel = true;
        }
      }
      if ((mention?.channelType === ChannelType.FBPageUser || mention?.channelType === ChannelType.DirectMessages) && !mention?.isBrandPost)
      {
        ticketHistoryData.isDeleteFromChannel=false
      }
    }

    return ticketHistoryData;
  }

  SetTicketOrMentionIcon(
    currentUser: AuthUser,
    pageType: PostsType,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    if (pageType === PostsType.Tickets) {
      ticketHistoryData.showTicketWindow = true;
      ticketHistoryData.showMarkactionable = false;
      ticketHistoryData.sendmailallmention = true;
    } else if (pageType === PostsType.Mentions) {
      if (mention?.isActionable) {
        ticketHistoryData.showTicketWindow = true;
        ticketHistoryData.showMarkactionable = false;
      } else {
        if (!mention?.isBrandPost) {
          ticketHistoryData.showMarkactionable = true;
        }
        ticketHistoryData.sendmailallmention = true;
        ticketHistoryData.setpriority = true;
        ticketHistoryData.isabouttobreach = false;
        const ActionButton = currentUser.data.user.actionButton;
        if (ActionButton.deleteLocobuzzEnabled) {
        ticketHistoryData.isDeleteFromLocobuzz = true;
        }
        ticketHistoryData.showTicketWindow = false;
        ticketHistoryData.isReplyVisible = false;
        ticketHistoryData.isForwardVisible = false;
        ticketHistoryData.isAttachTicketVisible = false;
        ticketHistoryData.isEscalateVisible = false;
        ticketHistoryData.isCopyMoveVisible = false;
        ticketHistoryData.isDirectCloseVisible = false;
        ticketHistoryData.isSendEmailVisible = false;
        // ticketHistoryData.isTranslationVisible = false;
      }
    } else if (pageType === PostsType.TicketHistory) {
      // ticketHistoryData.sendmailallmention = true;
      if (mention?.isActionable) {
        ticketHistoryData.showpriority = true;
        ticketHistoryData.showticketstatus = true;
      } else {
        ticketHistoryData.showpriority = false;
        ticketHistoryData.showticketstatus = false;
      }
    }
    ticketHistoryData.isBrandPost = mention?.isBrandPost;
    const actionButtonsObj = currentUser?.data?.user?.actionButton;
    // (actionButtonsObj?.openInNewTabEnabled)?ticketHistoryData.showTicketWindow=true:ticketHistoryData.showTicketWindow=false;
    actionButtonsObj?.changeTicketPriorityEnabled
      ? (ticketHistoryData.ticketProrityDisabled = false)
      : (ticketHistoryData.ticketProrityDisabled = true);
    actionButtonsObj.sendEmailEnabled
      ? (ticketHistoryData.sendmailallmention = true)
      : (ticketHistoryData.sendmailallmention = false);
    actionButtonsObj.sendEmailEnabled
      ? (ticketHistoryData.isSendEmailVisible = true)
      : (ticketHistoryData.isSendEmailVisible = false);
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == String(mention?.brandInfo.brandID)
    );
    ticketHistoryData.isVOIPBrand = brandInfo?.isVOIPBrand;

    if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM) {
      ticketHistoryData.isReplyVisible = false;
      ticketHistoryData.showActionableIcon = false;
      ticketHistoryData.isDirectCloseVisible = false;
      ticketHistoryData.isworkflowApproveVisible = false;
      ticketHistoryData.isworkflowRejectVisible = false;
      ticketHistoryData.isCreateTicketVisible = false;
      ticketHistoryData.isAttachTicketVisible = false;
      ticketHistoryData.deleteSocialEnabled = false
      ticketHistoryData.isSubscribe = false;
      ticketHistoryData.isDeleteFromChannel = false
      ticketHistoryData.isEscalateVisible = false
      ticketHistoryData.showTicketWindow = false
      ticketHistoryData.sendmailallmention = false
      ticketHistoryData.hideUnhideShowIcon =false
      /* ticketHistoryData.isTranslationVisible = false */
    }

    // if ((currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM) && currentUser?.data?.user?.isClickhouseEnabled==1) {
    //   ticketHistoryData.showcheckbox=false;
    // }
    if(mention?.channelGroup==ChannelGroup.AppStoreReviews)
    {
      if (mention?.isBrandPost) {
       if(mention?.messageStatus==0)
       {
         ticketHistoryData.showPendingMessageStatus= true;
       }else
       {
         ticketHistoryData.showPendingMessageStatus = false;
       }
      }
    }

    return ticketHistoryData;
  }

  SetPriorityIcon(
    pageType: PostsType,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    ticketHistoryData.ticketPriorityClassName = '';
    if (mention?.ticketInfo.ticketPriority === Priority.High) {
      ticketHistoryData.ticketPriorityClassName = 'TicketPriority';
    } else {
      ticketHistoryData.ticketPriorityClassName = 'TicketNoPriority';
    }

    const mentiondate = new Date(mention?.mentionTime);
    ticketHistoryData.mentionTime = moment(mentiondate).format('MM-dd-YYYY'); // this.datepipe.transform(mentiondate, 'dd-MM-yyyy');

    ticketHistoryData.fbBrandfriendlyName = mention?.brandInfo.brandFriendlyName;
    ticketHistoryData.fbPageName = mention?.fbPageName;
    ticketHistoryData.GBMStoreCode = mention?.storeCode;

    ticketHistoryData.intentssre = 0;
    if (
      mention?.ticketInfoSsre.ssreMode === SSREMode.Simulation &&
      mention?.ticketInfoSsre.ssreIntent === SsreIntent.NoActionTaken
    ) {
      ticketHistoryData.intentssre = SsreIntent.Right;
    } else {
      ticketHistoryData.intentssre = mention?.ticketInfoSsre.ssreIntent;
    }

    ticketHistoryData.InstaAccountID = mention?.instaAccountID;
    ticketHistoryData.Rating = 0;

    return ticketHistoryData;
  }

  getChannelCustomeIcon(mention: BaseMention): string {
    let channeltypeicon = '';
    if (mention?.channelGroup === ChannelGroup.Twitter) {
      if (mention?.channelType === ChannelType.DirectMessages) {
        channeltypeicon = '~/images/channelsv/Twitter_DM.svg';
      } else if (mention?.channelType === ChannelType.PublicTweets) {
        channeltypeicon = 'assets/images/channelsv/Public_Tweet.svg';
        // eslint-disable-next-line max-len
        // <img src='~/images/channelsv/Public_Tweet.svg' title='Twitter Public Tweet' alt='Twitter Public Tweet' />
      } else if (
        mention?.channelType === ChannelType.BrandTweets &&
        !mention?.isBrandPost
      ) {
        channeltypeicon = 'assets/images/channelsv/Brand_Mention.svg';
        // <img src='~/images/channelsv/Brand_Mention.svg' title='Twitter Tweet' alt='Twitter Tweet' />
      } else if (
        mention?.channelType === ChannelType.Twitterbrandmention &&
        !mention?.isBrandPost
      ) {
        channeltypeicon = 'assets/images/channelsv/Brand_Mention.svg';
        // eslint-disable-next-line max-len
        // <img src='~/images/channelsv/Brand_Mention.svg' title='Twitter Brand Mentions' alt='Twitter Brand Mentions' />
      } else {
        channeltypeicon = 'assets/images/channel-logos/twitter.svg';
        // <img src='~/images/channelsv/Brand_Tweet.svg' alt='Twitter Mention' title='Twitter Mention' />
      }
    } else if (mention?.channelGroup === ChannelGroup.Facebook) {
      if (mention?.channelType === ChannelType.FBComments) {
        channeltypeicon = 'assets/images/channelsv/FB_Comment.svg';
      } else if (mention?.channelType === ChannelType.FBMediaComments) {
        channeltypeicon =
          'assets/images/channelsv/FB_Public_Post_Comment_1.svg';
      } else if (mention?.channelType === ChannelType.FBMessages) {
        channeltypeicon = 'assets/images/channelsv/Facebook_DM.svg';
      } else if (mention?.channelType === ChannelType.FBReviews) {
        channeltypeicon = 'assets/images/channelsv/FB_Review.svg';
      } else if (mention?.channelType === ChannelType.FBPublic) {
        channeltypeicon = 'assets/images/channelsv/FB_Public_post_1.svg';
      } else if (
        mention?.channelType === ChannelType.FBPageUser &&
        !mention?.isBrandPost
      ) {
        channeltypeicon = 'assets/images/channelsv/FB_User_Post.svg';
      } else {
        channeltypeicon = 'assets/images/channel-logos/facebook.svg';
      }
    } else if (mention?.channelGroup === ChannelGroup.WhatsApp) {
      channeltypeicon = 'assets/images/channelicons/WhatsApp.png';
    } else if (mention?.channelGroup === ChannelGroup.LinkedIn) {
      if (mention?.channelType === ChannelType.LinkedInPageUser) {
        channeltypeicon = 'assets/images/channelicons/linkedinicon.png';
      } else {
        channeltypeicon = 'assets/images/channel-logos/linkedin.svg';
      }
    } else if (mention?.channelGroup === ChannelGroup.GooglePlus) {
      if (mention?.channelType === ChannelType.GoogleComments) {
        channeltypeicon = 'assets/images/channelicons/googlepluscomment.png';
      } else {
        channeltypeicon = 'assets/images/channelicons/googlePlus.png';
      }
    } else if (mention?.channelGroup === ChannelGroup.Instagram) {
      if (mention?.channelType === ChannelType.InstagramComments) {
        channeltypeicon = 'assets/images/channelicons/Instagram_Comment.png';
      } else {
        channeltypeicon = 'assets/images/channelicons/instagram.png';
      }
    } else if (mention?.channelGroup === ChannelGroup.GoogleMyReview) {
      if (mention?.channelType === ChannelType.GMBQuestion) {
        channeltypeicon = 'assets/images/channelicons/GMBQuestion.png';
      } else if (mention?.channelType === ChannelType.GMBAnswers) {
        channeltypeicon = 'assets/images/channelicons/GMBQuestion.png';
      } else {
        channeltypeicon = 'assets/images/channelicons/GoogleMyReview.png';
      }
    } else if (mention?.channelGroup === ChannelGroup.GoogleBusinessMessages) {
      channeltypeicon = 'assets/images/channelicons/GoogleMyReview.png';
    } else if (mention?.channelGroup === ChannelGroup.AppStoreReviews) {
      channeltypeicon = 'assets/images/channelicons/AppStoreReviews.svg';
    } else if (mention?.channelGroup === ChannelGroup.WebsiteChatBot) {
      channeltypeicon = 'assets/images/channelicons/WebsiteChatBot.svg';
    } else {
      channeltypeicon = `assets/images/channelicons/${
        ChannelGroup[mention?.channelGroup]
      }.png`;
    }
    return channeltypeicon;
  }

  SetBulkCheckbox(
    pageType: PostsType,
    currentUser: AuthUser,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention,
    parentPostFlag?:boolean
  ): any {
    const actionButtonsObj = currentUser.data.user.actionButton;
    if (pageType !== PostsType.TicketHistory) {
      if (mention?.ticketInfo.status !== TicketStatus.Close) {
        if (
          (mention?.ticketInfo.status === TicketStatus.PendingwithCSD ||
            mention?.ticketInfo.status === TicketStatus.OnHoldCSD ||
            mention?.ticketInfo.status === TicketStatus.RejectedByBrand ||
            mention?.ticketInfo.status ===
              TicketStatus.PendingwithCSDWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.OnHoldCSDWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.RejectedByBrandWithNewMention) &&
          ticketHistoryData.isCSDUser
        ) {
          if (
            !ticketHistoryData.isReadOnlySupervisor &&
            !mention?.parentCheckBoxFlag &&
            actionButtonsObj.bulkActionEnabled
          ) {
            ticketHistoryData.showcheckbox = true;
          }
        } else if (
          (mention?.ticketInfo.status === TicketStatus.PendingWithBrand ||
            mention?.ticketInfo.status === TicketStatus.OnHoldBrand ||
            mention?.ticketInfo.status ===
              TicketStatus.PendingWithBrandWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.OnHoldBrandWithNewMention) &&
          ticketHistoryData.isBrandUser
        ) {
          if (
            !ticketHistoryData.isReadOnlySupervisor &&
            !mention?.parentCheckBoxFlag &&
            actionButtonsObj.bulkActionEnabled
          ) {
            ticketHistoryData.showcheckbox = true;
          }
        } else if (
          (mention?.ticketInfo.status === TicketStatus.Open ||
            mention?.ticketInfo.status === TicketStatus.OnHoldAgent ||
            mention?.ticketInfo.status === TicketStatus.CustomerInfoAwaited ||
            mention?.ticketInfo.status === TicketStatus.ApprovedByBrand ||
            mention?.ticketInfo.status ===
              TicketStatus.PendingwithCSDWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.OnHoldCSDWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.PendingWithBrandWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.RejectedByBrandWithNewMention ||
            mention?.ticketInfo.status ===
              TicketStatus.OnHoldBrandWithNewMention ||
            mention?.ticketInfo.status === TicketStatus.PendingwithAgent ||
            mention?.ticketInfo.status === TicketStatus.Rejected) &&
          !ticketHistoryData.isCSDUser &&
          !ticketHistoryData.isBrandUser
        ) {
          if (
            !ticketHistoryData.isReadOnlySupervisor &&
            !mention?.parentCheckBoxFlag &&
            actionButtonsObj.bulkActionEnabled
          ) {
            ticketHistoryData.showcheckbox = true;
          }
        }
      } else if (
        mention?.ticketInfo.status === TicketStatus.Close &&
        (currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
          currentUser.data.user.role === UserRoleEnum.LocationManager ||
          currentUser.data.user.role === UserRoleEnum.Agent ||
          currentUser.data.user.role === UserRoleEnum.TeamLead)
      ) {
        if (!mention?.parentCheckBoxFlag && actionButtonsObj.bulkActionEnabled) {
          // ticketHistoryDatashowcheckbox = false;
          ticketHistoryData.showcheckbox = true;
        }
      }
    } else {
      if (
        !ticketHistoryData.isReadOnlySupervisor &&
        !mention?.parentCheckBoxFlag
      ) {
        if (
          (mention?.isActionable || mention?.isBrandPost) &&
          actionButtonsObj.bulkActionEnabled
        ) {
          ticketHistoryData.showcheckbox = true;
        } else {
          ticketHistoryData.showcheckbox = false;
        }
      }
    }
    if(parentPostFlag){
      ticketHistoryData.showcheckbox=true
    }

    // if ((currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM) && currentUser?.data?.user?.isClickhouseEnabled == 1) {
    //   ticketHistoryData.showcheckbox = false;
    // }
    return ticketHistoryData;
  }

  SetTicketStatusandAssignTo(
    currentBrand: BrandList,
    currentUser: AuthUser,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    const CSDTeamName = mention?.ticketInfo.escalatedToCSDTeamName
      ? '(' + mention?.ticketInfo.escalatedToCSDTeamName + ')'
      : '';
    const BrandTeamName = mention?.ticketInfo.escalatedToBrandTeamName
      ? '(' + mention?.ticketInfo.escalatedToBrandTeamName + ')'
      : '';
    ticketHistoryData.currentassignToId= mention?.ticketInfo?.assignedTo;
    if (
      +mention?.makerCheckerMetadata.workflowStatus ===
      LogStatus.ReplySentForApproval
    ) {
      if (currentUser.data.user.role === UserRoleEnum.Agent) {
        if (mention?.ticketInfo.assignedTo) {
          // ticketHistoryData.currentticketstatus = 'Awaiting For Approval';
          ticketHistoryData.currentticketstatus =
            'Awaiting For ' +
            mention?.ticketInfo.assignToAgentUserName +
            ' Approval';
          ticketHistoryData.currentassignTo =
            mention?.ticketInfo.assignToAgentUserName;
        }
      } else if (
        currentUser.data.user.role === UserRoleEnum.TeamLead ||
        currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
        currentUser.data.user.role === UserRoleEnum.LocationManager
      ) {
        ticketHistoryData.currentticketstatus = 'Awaiting For Approval';

        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        }
      } else if (
        currentUser.data.user.role === UserRoleEnum.CustomerCare ||
        currentUser.data.user.role === UserRoleEnum.BrandAccount
      ) {
        // ticketHistoryData.currentticketstatus = 'Awaiting For Approval';

        if (
          mention?.ticketInfo.status ===
          TicketStatus.PendingwithCSDWithNewMention
        ) {
          if (
            mention?.ticketInfo.escalatedTotUserName ||
            mention?.ticketInfo.escalatedToCSDTeam
          ) {
            if (mention?.ticketInfo.escalatedTotUserName) {
              ticketHistoryData.currentticketstatus = 'Escalated to CSD(New)';
              // ticketHistoryData.currentassignTo = 'Escalated to CSD(New) : ' +
              //   mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
            } else if (CSDTeamName) {
              ticketHistoryData.currentticketstatus =
                'Escalated to CSD Team(New)';
              ticketHistoryData.currentassignTo = CSDTeamName;
            } else {
              ticketHistoryData.currentticketstatus = 'Escalated to CSD';
              // ticketHistoryData.currentassignTo = 'Escalated to CSD';
            }
          }
          if (mention?.ticketInfo.assignedTo) {
            // ticketHistoryData.currentticketstatus = 'Assigned(New)';
            // ticketHistoryData.currentassignTo = 'Assigned(New) :' + mention?.ticketInfo.assignToAgentUserName;
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (
          mention?.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention
        ) {
          if (
            mention?.ticketInfo.escalatedTo ||
            mention?.ticketInfo.escalatedToCSDTeam
          ) {
            if (mention?.ticketInfo.escalatedTotUserName) {
              ticketHistoryData.currentticketstatus = 'OnHold by CSD(New)';
              // ticketHistoryData.currentassignTo = 'OnHold by CSD(New) : ' +
              //   mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
            } else if (CSDTeamName) {
              ticketHistoryData.currentticketstatus = 'OnHold by CSD(New)';
              ticketHistoryData.currentassignTo = CSDTeamName;
            } else {
              ticketHistoryData.currentticketstatus = 'OnHold by CSD';
              // ticketHistoryData.currentassignTo = 'OnHold by CSD';
            }
          }
          if (mention?.ticketInfo.assignedTo) {
            if (mention?.ticketInfo.assignToAgentUserName) {
              // ticketHistoryData.currentticketstatus = 'Assigned(New)';
              // ticketHistoryData.currentassignTo = 'Assigned(New) : ' + mention?.ticketInfo.assignToAgentUserName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.assignToAgentUserName;
            }
          }
        } else if (
          mention?.ticketInfo.status ===
          TicketStatus.PendingWithBrandWithNewMention
        ) {
          if (
            mention?.ticketInfo.escalatedToBrand ||
            mention?.ticketInfo.escalatedToBrandTeam
          ) {
            if (mention?.ticketInfo.escalatedToBrandUserName) {
              ticketHistoryData.currentticketstatus = 'Escalated to Brand(New)';
              // ticketHistoryData.currentassignTo = 'Escalated to Brand(New) :' +
              //   mention?.ticketInfo.escalatedToBrandUserName + ' ' + BrandTeamName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.escalatedToBrandUserName +
                ' ' +
                BrandTeamName;
            } else if (BrandTeamName) {
              ticketHistoryData.currentticketstatus =
                'Escalated to Brand Team(New)';
              // ticketHistoryData.currentassignTo = 'Escalated to Brand Team(New): ' + mention?.ticketInfo.escalatedToBrandTeam;
              ticketHistoryData.currentassignTo = BrandTeamName;
            } else {
              // ticketHistoryData.currentassignTo = 'Escalated to Brand';
              ticketHistoryData.currentticketstatus = 'Escalated to Brand';
            }
          }
          if (mention?.ticketInfo.assignedTo) {
            if (mention?.ticketInfo.assignToAgentUserName) {
              // ticketHistoryData.currentticketstatus = 'Assigned(New)';
              // ticketHistoryData.currentassignTo = 'Assigned(New) :' + mention?.ticketInfo.assignToAgentUserName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.assignToAgentUserName;
            }
          }
        } else if (
          mention?.ticketInfo.status ===
          TicketStatus.RejectedByBrandWithNewMention
        ) {
          ticketHistoryData.currentticketstatus = 'Rejected by Brand';
          if (
            mention?.ticketInfo.escalatedTo ||
            mention?.ticketInfo.escalatedToCSDTeam
          ) {
            if (mention?.ticketInfo.escalatedTo) {
              // ticketHistoryData.currentassignTo = 'Escalated to CSD: ' +
              //   mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
            } else if (CSDTeamName) {
              // ticketHistoryData.currentassignTo = 'Escalated to CSD Team: ' + CSDTeamName;
              ticketHistoryData.currentassignTo = CSDTeamName;
            } else {
              // ticketHistoryData.currentassignTo = 'Escalated to CSD';
            }
          }
          if (mention?.ticketInfo.assignedTo) {
            if (mention?.ticketInfo.assignToAgentUserName) {
              // ticketHistoryData.currentassignTo = 'Assigned(New) : ' + mention?.ticketInfo.assignToAgentUserName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.assignToAgentUserName;
            }
          }
        } else if (
          mention?.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention
        ) {
          if (
            mention?.ticketInfo.escalatedToBrand ||
            mention?.ticketInfo.escalatedToBrandTeam
          ) {
            if (mention?.ticketInfo.escalatedToBrandUserName) {
              ticketHistoryData.currentticketstatus = 'OnHold by Brand(New)';
              // ticketHistoryData.currentassignTo = 'OnHold by Brand(New) :' +
              //   mention?.ticketInfo.escalatedToBrandUserName + ' ' + BrandTeamName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.escalatedToBrandUserName +
                ' ' +
                BrandTeamName;
            } else if (BrandTeamName) {
              ticketHistoryData.currentticketstatus =
                'OnHold by Brand Team(New)';
              // ticketHistoryData.currentassignTo = 'OnHold by Brand Team(New): ' + BrandTeamName;
              ticketHistoryData.currentassignTo = BrandTeamName;
            } else {
              // ticketHistoryData.currentassignTo = 'OnHold by Brand';
              ticketHistoryData.currentticketstatus = 'OnHold by Brand';
            }
          }
          if (mention?.ticketInfo.assignedTo) {
            if (mention?.ticketInfo.assignToAgentUserName) {
              // ticketHistoryData.currentassignTo = 'Assigned(New) : ' + mention?.ticketInfo.assignToAgentUserName;
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.assignToAgentUserName;
            }
          }
        }
      }
    } else {
      if (mention?.ticketInfo.status === TicketStatus.Open) {
        ticketHistoryData.currentticketstatus = 'Open';

        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
            if (mention?.ticketInfo.assignedToTeamName) {
              ticketHistoryData.currentassignTo +=
                '(' + mention?.ticketInfo.assignedToTeamName + ')';
            }
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        }
      } else if (mention?.ticketInfo.status === TicketStatus.Close) {
        ticketHistoryData.currentticketstatus = 'Closed';
      } else if (mention?.ticketInfo.status === TicketStatus.PendingwithAgent) {
        ticketHistoryData.currentticketstatus = 'Approved by CSD';

        if (mention?.ticketInfo.assignToAgentUserName) {
          ticketHistoryData.currentassignTo =
            mention?.ticketInfo.assignToAgentUserName;
        }
      } else if (mention?.ticketInfo.status === TicketStatus.Rejected) {
        ticketHistoryData.currentticketstatus = 'Rejected by CSD';

        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        }
      } else if (mention?.ticketInfo.status === TicketStatus.PendingwithCSD) {
        if (
          mention?.ticketInfo.escalatedTo ||
          mention?.ticketInfo.escalatedToCSDTeam
        ) {
          if (mention?.ticketInfo.escalatedTotUserName) {
            ticketHistoryData.currentticketstatus = 'Escalated to CSD';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
          } else if (CSDTeamName) {
            ticketHistoryData.currentticketstatus = 'Escalated to CSD Team';
            ticketHistoryData.currentassignTo = CSDTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'Escalated to CSD';
            // ticketHistoryData.currentassignTo = 'Escalated to CSD';
          }
        } else {
          ticketHistoryData.currentticketstatus = 'Escalated to CSD';
          // ticketHistoryData.currentassignTo = 'Escalated to CSD';
        }
      } else if (mention?.ticketInfo.status === TicketStatus.OnHoldAgent) {
        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentticketstatus = 'Kept On Hold';
            if (mention?.ticketInfo.assignedToTeamName)
            {
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.assignToAgentUserName + ` (${mention?.ticketInfo.assignedToTeamName})`;
            }else{
              ticketHistoryData.currentassignTo =
                mention?.ticketInfo.assignToAgentUserName;
            }
          } else {
            ticketHistoryData.currentticketstatus = 'Kept On Hold';
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          ticketHistoryData.currentticketstatus = 'Kept On Hold';
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo = mention?.ticketInfo.assignedToTeamName;
          }
        } else {
          ticketHistoryData.currentticketstatus = 'Kept On Hold';
        }
      } else if (mention?.ticketInfo.status === TicketStatus.OnHoldCSD) {
        if (
          mention?.ticketInfo.escalatedTo ||
          mention?.ticketInfo.escalatedToCSDTeam
        ) {
          if (mention?.ticketInfo.escalatedTo) {
            ticketHistoryData.currentticketstatus = 'Kept On Hold By CSD';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
          } else if (CSDTeamName) {
            ticketHistoryData.currentticketstatus = 'Kept On Hold By CSD Team';
            ticketHistoryData.currentassignTo = CSDTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'Kept On Hold By CSD';
            // ticketHistoryData.currentassignTo = 'Kept On Hold by CSD';
          }
        } else {
          ticketHistoryData.currentticketstatus = 'Kept On Hold By CSD';
          // ticketHistoryData.currentassignTo = 'Kept On Hold by CSD';
        }
      } else if (
        mention?.ticketInfo.status === TicketStatus.CustomerInfoAwaited
      ) {
        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentticketstatus =
              'Awaiting Response From Customer';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        } else {
          ticketHistoryData.currentticketstatus =
            'Awaiting Response From Customer';
        }
      } else if (mention?.ticketInfo.status === TicketStatus.PendingWithBrand) {
        if (
          mention?.ticketInfo.escalatedToBrand ||
          mention?.ticketInfo.escalatedToBrandTeam
        ) {
          if (mention?.ticketInfo.escalatedToBrandUserName) {
            ticketHistoryData.currentticketstatus = 'Escalated to Brand';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedToBrandUserName + ' ' + BrandTeamName;
          } else if (BrandTeamName) {
            ticketHistoryData.currentticketstatus = 'Escalated to Brand Team';
            ticketHistoryData.currentassignTo = BrandTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'Escalated to Brand';
          }
        } else {
          ticketHistoryData.currentticketstatus = 'Escalated to Brand';
        }
      } else if (mention?.ticketInfo.status === TicketStatus.RejectedByBrand) {
        // ticketHistoryData.currentticketstatus = 'Rejected by Brand';
        if (
          mention?.ticketInfo.escalatedToBrand ||
          mention?.ticketInfo.escalatedToBrandTeam
        ) {
          if (mention?.ticketInfo.escalatedToBrandUserName) {
            ticketHistoryData.currentticketstatus = 'Rejected by Brand';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedToBrandUserName + ' ' + BrandTeamName;
          } else if (BrandTeamName) {
            ticketHistoryData.currentticketstatus = 'Rejected by Brand';
            ticketHistoryData.currentassignTo = BrandTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'Rejected by Brand';
          }
        } else if (
          !currentBrand.isBrandworkFlowEnabled &&
          mention?.ticketInfo.assignedTo
        ) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentticketstatus = 'Rejected by Brand';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (
          !currentBrand.isBrandworkFlowEnabled &&
          mention?.ticketInfo.assignedToTeam
        ) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentticketstatus = 'Rejected by Brand';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        }
      } else if (mention?.ticketInfo.status === TicketStatus.ApprovedByBrand) {
        ticketHistoryData.currentticketstatus = 'Approved by Brand';

        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        }
      } else if (mention?.ticketInfo.status === TicketStatus.OnHoldBrand) {
        if (mention?.ticketInfo.escalatedToBrand || BrandTeamName) {
          if (mention?.ticketInfo.escalatedToBrand) {
            ticketHistoryData.currentticketstatus = 'Kept on hold by Brand';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedToBrandUserName + ' ' + BrandTeamName;
          } else if (BrandTeamName) {
            ticketHistoryData.currentticketstatus =
              'Kept on hold by Brand Team';
            ticketHistoryData.currentassignTo = BrandTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'Kept on hold by Brand';
          }
        } else {
          ticketHistoryData.currentticketstatus = 'Kept on hold by Brand';
        }
      } else if (
        mention?.ticketInfo.status === TicketStatus.PendingwithCSDWithNewMention
      ) {
        if (
          mention?.ticketInfo.escalatedTo ||
          mention?.ticketInfo.escalatedToCSDTeam
        ) {
          if (mention?.ticketInfo.escalatedTotUserName) {
            ticketHistoryData.currentticketstatus = 'Escalated to CSD(New)';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
          } else if (CSDTeamName) {
            ticketHistoryData.currentticketstatus =
              'Escalated to CSD Team(New)';
            ticketHistoryData.currentassignTo = CSDTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'Escalated to CSD(New)';
          }
        } else {
          ticketHistoryData.currentticketstatus = 'Escalated to CSD(New)';
        }

        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        }
      } else if (
        mention?.ticketInfo.status === TicketStatus.OnHoldCSDWithNewMention
      ) {
        if (
          mention?.ticketInfo.escalatedTo ||
          mention?.ticketInfo.escalatedToCSDTeam
        ) {
          if (mention?.ticketInfo.escalatedTo) {
            ticketHistoryData.currentticketstatus = 'OnHold by CSD(New)';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
          } else if (CSDTeamName) {
            ticketHistoryData.currentticketstatus = 'OnHold by CSD Team(New)';
            ticketHistoryData.currentassignTo = CSDTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'OnHold by CSD(New)';
          }
        } else {
          ticketHistoryData.currentticketstatus = 'OnHold by CSD(New)';
        }

        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        }
      } else if (
        mention?.ticketInfo.status ===
        TicketStatus.PendingWithBrandWithNewMention
      ) {
        if (
          mention?.ticketInfo.escalatedToBrand ||
          mention?.ticketInfo.escalatedToBrandTeam
        ) {
          if (mention?.ticketInfo.escalatedToBrandUserName) {
            ticketHistoryData.currentticketstatus = 'Escalated to Brand(New)';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedToBrandUserName + ' ' + BrandTeamName;
          } else if (BrandTeamName) {
            ticketHistoryData.currentticketstatus =
              'Escalated to Brand Team(New)';
            ticketHistoryData.currentassignTo = BrandTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'Escalated to Brand(New)';
          }
        } else {
          ticketHistoryData.currentticketstatus = 'Escalated to Brand(New)';
        }
        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        }
      } else if (
        mention?.ticketInfo.status === TicketStatus.RejectedByBrandWithNewMention
      ) {
        ticketHistoryData.currentticketstatus = 'Rejected by Brand';
        if (
          mention?.ticketInfo.escalatedTo ||
          mention?.ticketInfo.escalatedToCSDTeam
        ) {
          if (mention?.ticketInfo.escalatedTo) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedTotUserName + ' ' + CSDTeamName;
          } else if (CSDTeamName) {
            ticketHistoryData.currentassignTo = CSDTeamName;
          } else {
            // ticketHistoryData.currentassignTo = 'Escalated to CSD';
          }
        }
        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        }
      } else if (
        mention?.ticketInfo.status === TicketStatus.OnHoldBrandWithNewMention
      ) {
        if (
          mention?.ticketInfo.escalatedToBrand ||
          mention?.ticketInfo.escalatedToBrandTeam
        ) {
          if (mention?.ticketInfo.escalatedToBrand) {
            ticketHistoryData.currentticketstatus = 'OnHold by Brand(New)';
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.escalatedToBrandUserName + ' ' + BrandTeamName;
          } else if (BrandTeamName) {
            ticketHistoryData.currentticketstatus = 'OnHold by Brand Team(New)';
            ticketHistoryData.currentassignTo = BrandTeamName;
          } else {
            ticketHistoryData.currentticketstatus = 'OnHold by Brand(New)';
          }
        } else {
          ticketHistoryData.currentticketstatus = 'OnHold by Brand(New)';
        }

        if (mention?.ticketInfo.assignedTo) {
          if (mention?.ticketInfo.assignToAgentUserName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignToAgentUserName;
          }
        } else if (mention?.ticketInfo.assignedToTeam) {
          if (mention?.ticketInfo.assignedToTeamName) {
            ticketHistoryData.currentassignTo =
              mention?.ticketInfo.assignedToTeamName;
          }
        }
      }
    }
    return ticketHistoryData;
  }

  SetChannelWiseProperty(
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    switch (mention?.channelGroup) {
      case ChannelGroup.Twitter: {
        ticketHistoryData.screenName = mention?.author.screenname;
        // console.log(authorObj.name);
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.isVerified = mention?.author.isVerifed;
        ticketHistoryData.followersCount = mention?.author.followersCount;
        ticketHistoryData.KloutScore = mention?.author.kloutScore;
        ticketHistoryData.profileurl =
          'https://www.twitter.com/' + mention?.author.screenname;
        break;
      }
      case ChannelGroup.Facebook: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.Rating = mention?.rating;
        if (mention?.author.socialId && mention?.author.socialId !== '0') {
          ticketHistoryData.profileurl =
            'http://www.facebook.com/' + mention?.author.socialId;
          if (!mention?.author.picUrl) {
            ticketHistoryData.profilepicurl =
              'assets/images/agentimages/sample-image.svg';
          }
        } else {
          ticketHistoryData.profilepicurl =
            'assets/images/agentimages/sample-image.svg';
          ticketHistoryData.profileurl = undefined;
        }
        break;
      }
      case ChannelGroup.Instagram: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        if (mention?.author.name.toLowerCase() != 'anonymous' && !mention?.author.profileUrl) {
          ticketHistoryData.profileurl =
            'https://www.instagram.com/' + mention?.author.name;
        }
        else if (mention?.author.name.toLowerCase() != 'anonymous' && mention?.author.profileUrl){
          ticketHistoryData.profileurl = mention?.author.profileUrl
        }
        break;
      }
      case ChannelGroup.WhatsApp: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl =
          'assets/images/agentimages/sample-image.svg';
        ticketHistoryData.profileurl = '';
        break;
      }
      case ChannelGroup.WebsiteChatBot: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.profileurl = mention?.author.profileUrl;
        break;
      }
      case ChannelGroup.Youtube: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.profileurl = mention?.author.profileUrl;
        if (
          mention?.author.socialId &&
          mention?.author.socialId !== '0' &&
          !mention?.author.profileUrl
        ) {
          ticketHistoryData.profileurl =
            'https://www.youtube.com/channel/' + mention?.author.socialId;
        }
        break;
      }
      case ChannelGroup.LinkedIn: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.profileurl = mention?.author.profileUrl;
        break;
      }
      case ChannelGroup.GoogleMyReview: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.Rating = mention?.rating;
        ticketHistoryData.StoreCode = mention?.storeCode;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.profileurl = mention?.author.profileUrl;
        break;
      }
      case ChannelGroup.GoogleBusinessMessages: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.Rating = mention?.rating;
        ticketHistoryData.StoreCode = mention?.storeCode;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.profileurl = mention?.author.profileUrl;
        break;
      }
      case ChannelGroup.TikTok: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.Rating = mention?.rating;
        ticketHistoryData.StoreCode = mention?.storeCode;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.profileurl = mention?.author.profileUrl;
        break;
      }
      case ChannelGroup.GooglePlayStore: {
        ticketHistoryData.Rating = mention?.rating;
        ticketHistoryData.appFriendlyName = mention?.appFriendlyName;
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.profileurl = mention?.author.profileUrl;
        break;
      }
      case ChannelGroup.Email: {
        ticketHistoryData.screenName = mention?.author.socialId;
        break;
      }
      case ChannelGroup.AppStoreReviews: {
        ticketHistoryData.profilepicurl =
          'assets/images/agentimages/sample-image.svg';
        ticketHistoryData.profileurl = '';
        break;
      }
      case ChannelGroup.Reddit: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl = mention?.author.picUrl || 'assets/images/agentimages/sample-image.svg';
        ticketHistoryData.profileurl = '';
        if (mention?.author?.name){
          ticketHistoryData.profileurl = mention?.author?.profileUrl || `https://www.reddit.com/user/${mention?.author.name}`
        }
        break;
      }
      default: {
        ticketHistoryData.screenName = mention?.author.name;
        ticketHistoryData.profilepicurl = mention?.author.picUrl;
        ticketHistoryData.profileurl = mention?.author.profileUrl;
        break;
      }
    }

    if (
      mention?.channelGroup === ChannelGroup.HolidayIQ ||
      mention?.channelGroup === ChannelGroup.ECommerceWebsites ||
      mention?.channelGroup === ChannelGroup.AppStoreReviews
    ) {
      ticketHistoryData.Rating = Math.round(mention?.rating);
      if (ticketHistoryData.Rating > 0) {
        const HolidayRating = ticketHistoryData.Rating.toString();
        const result = HolidayRating.split('.');

        if (result[1] === '0') {
          ticketHistoryData.Rating = +result[0];
        }
      }
    }

    // if (!ticketHistoryData.profileurl) {
    //   ticketHistoryData.profileurl = 'javascript:void(0)';
    // }

    if (
      mention?.channelGroup === ChannelGroup.Twitter ||
      mention?.channelGroup === ChannelGroup.Facebook ||
      mention?.channelGroup === ChannelGroup.Instagram ||
      mention?.channelGroup === ChannelGroup.Youtube ||
      mention?.channelGroup === ChannelGroup.WhatsApp ||
      mention?.channelGroup === ChannelGroup.LinkedIn ||
      mention?.channelGroup === ChannelGroup.GoogleMyReview ||
      mention?.channelGroup === ChannelGroup.WebsiteChatBot
    ) {
      ticketHistoryData.showEnrichment = true;
    } else {
      ticketHistoryData.showEnrichment = false;
    }

    ticketHistoryData.star_03Length = 0;
    ticketHistoryData.star_deselected_03 = 0;
    ticketHistoryData.NoRating = 5;

    if (
      mention?.channelGroup === ChannelGroup.GooglePlayStore ||
      mention?.channelType === ChannelType.FBReviews ||
      mention?.channelGroup === ChannelGroup.ECommerceWebsites ||
      mention?.channelGroup === ChannelGroup.AppStoreReviews
    ) {
      for (let i = 1; i <= ticketHistoryData.Rating; i++) {
        ++ticketHistoryData.star_03Length;
      }
      for (
        let i = 1;
        i <= ticketHistoryData.NoRating - ticketHistoryData.Rating;
        i++
      ) {
        ++ticketHistoryData.star_deselected_03;
      }
    } else if (mention?.channelGroup === ChannelGroup.GoogleMyReview) {
      for (let i = 1; i <= ticketHistoryData.Rating; i++) {
        ++ticketHistoryData.star_03Length;
      }
      if (ticketHistoryData.Rating > 0) {
        for (
          let i = 1;
          i <= ticketHistoryData.NoRating - ticketHistoryData.Rating;
          i++
        ) {
          ++ticketHistoryData.star_deselected_03;
        }
      }
    }
    if (mention?.channelGroup === ChannelGroup.HolidayIQ) {
      ticketHistoryData.Rating = ticketHistoryData.Rating / 7;
    }
    //  ticketHistoryData.description = this.toHtml(ticketHistoryData.description)
    return ticketHistoryData;
  }

  SetTicketDescription(
    currentUser: AuthUser,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention,
    pageType: PostsType,
    searchText?: string
  ): any {
    if (mention?.channelGroup === ChannelGroup.Email) {
      let tomail = mention?.toMailList.join(', ');
      if (!tomail) {
        tomail = mention?.ccMailList.join(', ');
      }
      if (!tomail) {
        tomail = mention?.bccMailList.join(', ');
      }
      ticketHistoryData.toMailList = mention?.toMailList;
      ticketHistoryData.ccMailList = mention?.ccMailList;
      ticketHistoryData.bccMailList = mention?.bccMailList;
      ticketHistoryData.tomaillist = tomail;
      if (ticketHistoryData?.ccMailList?.length > 0) {
        ticketHistoryData.toCCBCCArrowFlag = true;
      }
      // ticketHistoryData.tomaillist =
      //   tomail.length <= 100 ? tomail : tomail.substring(0, 100) + '...';
      if (mention?.title != null) {
        if (mention?.title.length > 0) {
          if (
            mention?.title.length > 70 &&
            (pageType === PostsType.Tickets || pageType === PostsType.Mentions)
          ) {
            ticketHistoryData.title = mention?.title.substring(0, 70) + '...';
          } else {
            ticketHistoryData.title = mention?.title;
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.ECommerceWebsites) {
      if (mention?.title != null) {
        if (mention?.title.length > 0) {
          ticketHistoryData.descriptionWithTitle = true;
          if (
            mention?.title.length > 70 &&
            (pageType === PostsType.Tickets || pageType === PostsType.Mentions)
          ) {
            ticketHistoryData.title = mention?.title.substring(0, 70) + '...';
            ticketHistoryData.description = mention?.description;
          } else {
            ticketHistoryData.title = mention?.title;
            ticketHistoryData.description = mention?.description;
          }
        }
      }else
      {
        if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled==1)
        {
          ticketHistoryData.description = mention?.description;
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.Voice) {
      if(mention?.isBrandPost){
        // if (mention?.description == 'Unanswered' || mention?.description?.includes('Agent Missed') || mention?.description == 'User Disconnected' ) {
        //   ticketHistoryData.description = 'Agent missed the call on '
        // } else if (mention?.description?.includes('Customer Missed')) {
        //   ticketHistoryData.description = 'Customer missed the call on '
        // } else{
        //   ticketHistoryData.description = 'The outgoing call started on '
        // }
        ticketHistoryData.description = mention?.description
        ticketHistoryData.showVoipDesc = true;
      } else if (!mention?.isBrandPost) {
        // if (mention?.description == 'Unanswered' || mention?.description?.includes('Agent Missed') || mention?.description == 'User Disconnected') {
        //   ticketHistoryData.description = 'Agent missed the call on '
        // } else if (mention?.description?.includes('Customer Missed')) {
        //   ticketHistoryData.description = 'Customer disconnected the call on '
        // } else {
        //   ticketHistoryData.description = 'The incoming call started on '
        // }
        ticketHistoryData.description = mention?.description
        ticketHistoryData.showVoipDesc = true;
      }
      if (mention?.description?.indexOf(',') > -1){
        // ticketHistoryData.showVoipDesc = false;
        // ticketHistoryData.voipNote = mention?.description.split(',', 1)[1]
        ticketHistoryData.voipNote=mention.ticketInfo.lastNote
      }
    } else if (mention?.channelGroup === ChannelGroup.WhatsApp) {
      if (mention?.title != null) {
        if (
          mention?.title.length > 0 &&
          (mention?.attachmentMetadata.mediaContents === undefined ||
            mention?.attachmentMetadata.mediaContents === null ||
            mention?.attachmentMetadata.mediaContents.length === 0 ||
            (mention?.mediaType !== MediaEnum.OTHER &&
              mention?.mediaType !== MediaEnum.HTML))
        ) {
          if (
            mention?.title.length > 70 &&
            (pageType === PostsType.Tickets || pageType === PostsType.Mentions)
          ) {
            // ticketHistoryData.title = mention?.title.substring(0, 70) + '...';
            ticketHistoryData.description = mention?.title.substring(0, 70) + '...';
          } else {
            // ticketHistoryData.title = mention?.title;
            ticketHistoryData.description = mention?.title;
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.WebsiteChatBot) {
      ticketHistoryData = this._ticketService.SetWebsiteChatbotDescription(
        mention,
        ticketHistoryData
      );
    } else if (
      mention?.channelGroup === ChannelGroup.Quora ||
      mention?.channelGroup === ChannelGroup.TikTok
    ) {
      ticketHistoryData.description = mention?.channelGroup === ChannelGroup.TikTok ? mention?.description : mention?.title;
      if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1){
        if (mention?.channelGroup === ChannelGroup.Quora)
        {
          ticketHistoryData.description =mention?.description ;
        }
    }
    } else if(mention.channelGroup === ChannelGroup.Reddit) {
      ticketHistoryData.description = mention?.description;
    } else {
      if (mention?.description != null) {
        mention.description = String(mention?.description);
        if (mention?.description.length > 0) {
          if (mention?.description.length > 1200) {
            if (mention?.channelType === ChannelType.Email) {
              // this.getEmailHtmlData(ticketHistoryData, mention);
            } else if (
              mention?.channelType !== ChannelType.DirectMessages &&
              mention?.channelType !== ChannelType.FBMessages
            ) {
              ticketHistoryData.description = mention?.description;
            } else {
              ticketHistoryData.description = mention?.description;
            }
          } else {
            if (mention?.channelType === ChannelType.Email) {
              // this.getEmailHtmlData(ticketHistoryData, mention);
            } else {
              try {
                const parsedJson = JSON.parse(mention?.description)
                if (typeof parsedJson == 'object') {
                  ticketHistoryData.description =
                    parsedJson['message']['text'];
                } else {
                  ticketHistoryData.description = String(mention?.description);
                }
              } catch (e) {
                ticketHistoryData.description = mention?.description;
              }
            }
          }
        } 
        else {
          if (mention?.title && mention?.title.length > 0) {
            ticketHistoryData.description = mention?.title;
          }
        }
      }
    }

    if (
      mention?.makerCheckerMetadata.workflowStatus !==
        LogStatus.ReplySentForApproval &&
      mention?.makerCheckerMetadata.workflowStatus !== LogStatus.ReplyScheduled
    ) {
      if (mention?.channelGroup === ChannelGroup.Email) {
        if (
          mention?.makerCheckerMetadata.workflowStatus ===
            LogStatus.ReplyRejected &&
          currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
          currentUser.data.user.role !== UserRoleEnum.BrandAccount
        ) {
          ticketHistoryData.isrejectedNote = true;
        } else {
          ticketHistoryData.isrejectedNote = false;
        }
      } else {
        if (
          mention?.makerCheckerMetadata.workflowStatus ===
            LogStatus.ReplyRejected &&
          currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
          currentUser.data.user.role !== UserRoleEnum.BrandAccount
        ) {
          ticketHistoryData.isrejectedNote = true;
        } else {
          ticketHistoryData.isrejectedNote = false;
        }
      }
    }
    if (ticketHistoryData.description) {
      // ticketHistoryData.description = linkifyStr(
      //   ticketHistoryData.description,
      //   { target: '_system' }
      // );
      if (searchText && pageType !== PostsType.TicketHistory) {
        // const re = new RegExp('\\b(' + searchText + '\\b)', 'igm');
         const escapedSearchText = searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp('\\b(' + escapedSearchText + '\\b)', 'igm'); 
        ticketHistoryData.description = ticketHistoryData.description.replace(
          re,
          '<span class="highlighted-text">$&</span>'
        );
      }
      ticketHistoryData.description = LocobuzzUtils.checkLinkTag(ticketHistoryData.description)
    }

    if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1 && mention?.channelGroup == ChannelGroup.Booking) {
      if(mention?.caption)
      {
      ticketHistoryData.description = '';
      ticketHistoryData.goodReview = mention?.description;
      ticketHistoryData.badReview = mention?.caption;
        ticketHistoryData.bookingGoodBadReviewFlag = true
      }else 
      {
        if(mention?.description)
        {
       ticketHistoryData.bookingGoodBadReviewFlag=true;
          ticketHistoryData.goodReview = mention?.description;
          ticketHistoryData.description = '';
        }
      }
    }

    ticketHistoryData.description = this.toHtml(ticketHistoryData.description)
    return ticketHistoryData;
  }
  toHtml(input) {
    if(input)
    return decode(input)
    else
    return input;
  }
  getTicketDescription(
    currentUser: AuthUser,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    if (mention?.channelGroup === ChannelGroup.Email) {
      let tomail = mention?.toMailList.toString();
      if (!tomail) {
        tomail = mention?.ccMailList.toString();
      }
      if (!tomail) {
        tomail = mention?.bccMailList.toString();
      }

      ticketHistoryData.toMailList = mention?.toMailList;
      ticketHistoryData.ccMailList = mention?.ccMailList;
      ticketHistoryData.bccMailList = mention?.bccMailList;
      ticketHistoryData.tomaillist =
        tomail.length <= 100 ? tomail : tomail.substring(0, 100) + '...';
      if (mention?.title != null) {
        if (mention?.title.length > 0) {
          if (mention?.title.length > 70) {
            ticketHistoryData.title = mention?.title.substring(0, 70) + '...';
          } else {
            ticketHistoryData.title = mention?.title;
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.ECommerceWebsites) {
      if (mention?.title != null) {
        if (mention?.title.length > 0) {
          if (mention?.title.length > 70) {
            ticketHistoryData.title = mention?.title.substring(0, 70) + '...';
          } else {
            ticketHistoryData.title = mention?.title;
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.WhatsApp) {
      if (mention?.title != null) {
        if (
          mention?.title.length > 0 &&
          (mention?.attachmentMetadata.mediaContents === undefined ||
            mention?.attachmentMetadata.mediaContents === null ||
            mention?.attachmentMetadata.mediaContents.length === 0 ||
            (mention?.mediaType !== MediaEnum.OTHER &&
              mention?.mediaType !== MediaEnum.HTML &&
              mention?.mediaType !== MediaEnum.PDF &&
              mention?.mediaType !== MediaEnum.DOC &&
              mention?.mediaType !== MediaEnum.EXCEL))
        ) {
          if (mention?.title.length > 70) {
            ticketHistoryData.title = mention?.title.substring(0, 70) + '...';
          } else {
            ticketHistoryData.title = mention?.title;
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.WebsiteChatBot) {
      ticketHistoryData = this._ticketService.SetWebsiteChatbotDescription(
        mention,
        ticketHistoryData
      );
    } else if (
      mention?.channelGroup === ChannelGroup.Quora ||
      mention?.channelGroup === ChannelGroup.TikTok
    ) {
      ticketHistoryData.description = mention?.title;
    }
    if (mention?.description != null) {
      if (mention?.description.length > 0) {
        if (mention?.description.length > 1200) {
          if (mention?.channelType === ChannelType.Email) {
            this.getEmailHtmlData(ticketHistoryData, mention);
          } else if (
            mention?.channelType !== ChannelType.DirectMessages &&
            mention?.channelType !== ChannelType.FBMessages
          ) {
            ticketHistoryData.description = mention?.description;
          } else {
            ticketHistoryData.description = mention?.description;
          }
        } else {
          if (mention?.channelType === ChannelType.Email) {
            this.getEmailHtmlData(ticketHistoryData, mention);
          } else {
            ticketHistoryData.description = mention?.description;
          }
        }
      }
    }
    return ticketHistoryData;
  }

  SetCRMButton(
    postCRMdata: BrandList,
    currentUser: AuthUser,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention,
    pageType: PostsType
  ): any {
    if (
      postCRMdata?.crmType === CrmType.Telecom &&
      postCRMdata?.crmClassName.toLowerCase() === 'jiocrm' &&
      (mention?.channelGroup === ChannelGroup.Facebook ||
        mention?.channelGroup === ChannelGroup.Twitter) &&
      currentUser?.data?.user?.actionButton?.crmEnabled
    ) {
      ticketHistoryData.crmmobilenopopup = true;
    } else if (
      postCRMdata?.crmType === CrmType.NonTelecom &&
      +currentUser?.data?.user?.role !== UserRoleEnum.CustomerCare &&
      currentUser?.data?.user?.role !== UserRoleEnum.BrandAccount &&
      ((postCRMdata.crmClassName.toLowerCase() === 'titancrm' &&
        (mention?.channelGroup === ChannelGroup.WhatsApp ||
          mention?.channelGroup === ChannelGroup.Facebook ||
          mention?.channelGroup === ChannelGroup.Twitter ||
          mention?.channelGroup === ChannelGroup.Instagram ||
          mention?.channelGroup === ChannelGroup.GoogleMyReview ||
          mention?.channelGroup === ChannelGroup.GoogleBusinessMessages ||
          mention?.channelGroup === ChannelGroup.Youtube)) ||
        postCRMdata?.crmClassName.toLowerCase() === 'magmacrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'fedralcrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'bandhancrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'apollocrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'tataunicrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'recrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'extramarkscrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'octafxcrm'||
        postCRMdata?.crmClassName.toLowerCase() === 'salesforcecrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'freshworkcrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'animalwelfarecrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'dreamsolcrm' ||
        postCRMdata?.crmClassName.toLowerCase() === 'tatacapitalcrm'
        || postCRMdata?.crmClassName.toLowerCase() == 'duraflexcrm' || postCRMdata?.crmClassName.toLowerCase() === 'snapdealcrm') &&
      currentUser?.data?.user?.actionButton?.crmEnabled
    ) {
      if (postCRMdata?.typeOfCRM == 2 && pageType == PostsType.Tickets)
      {
        ticketHistoryData.salesForceCrm=true;
        ticketHistoryData.createLead=true;
        ticketHistoryData.createSR = true;
      }else if (postCRMdata?.typeOfCRM == 3 && pageType == PostsType.Tickets) {
        ticketHistoryData.salesForceCrm = true;
        ticketHistoryData.createLead = false;
        ticketHistoryData.createSR = true;
      }
      else if (postCRMdata?.typeOfCRM == 4 && pageType == PostsType.Tickets) {
        ticketHistoryData.animalWelfare = true;
      }
      else
      {
        // CRM Create Request Popup
        if (pageType == PostsType.Tickets) {
          ticketHistoryData.crmcreatereqpop = true;
        }
      }
    }
    else if ((postCRMdata?.typeOfCRM == 101 || postCRMdata?.typeOfCRM == 102)  && postCRMdata?.crmActive && postCRMdata?.isManualPush==1){
      if (pageType == PostsType.Tickets) {
        ticketHistoryData.crmcreatereqpop = true;
      }
    }
    if (postCRMdata?.crmClassName.toLocaleLowerCase() =='dreamsolcrm' && mention?.ticketInfo?.srid!=null){
      if (mention?.ticketInfo?.status != TicketStatus.Close) ticketHistoryData.isDirectCloseVisible=true;
    }
    
    return ticketHistoryData;
  }

  SetMedia(
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention,
    MediaUrl
  ): any {
    ticketHistoryData.imageurls = [];
    ticketHistoryData.videoUrls = [];
    ticketHistoryData.documentUrls = [];
    ticketHistoryData.voipAudioUrls = [];
    ticketHistoryData.fileUrls=[]
    ticketHistoryData.newThumburls =[]
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser?.data?.user?.isListening && !currentUser?.data?.user?.isORM && currentUser?.data?.user?.isClickhouseEnabled == 1) {
      this.clickhouseEnabled = true
    }else{
      this.clickhouseEnabled=false
    }
    if (mention?.channelGroup === ChannelGroup.Twitter) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const MediaContentItem of mention?.attachmentMetadata
          .mediaContents) {
          if (MediaContentItem.mediaType === MediaEnum.IMAGE) {
            if (
              mention?.channelType === ChannelType.DirectMessages &&
              MediaContentItem.thumbUrl
            ) {
              if (MediaContentItem?.thumbUrl?.includes('images.locobuzz') || MediaContentItem?.thumbUrl?.includes('s3.amazonaws')) {
                // eslint-disable-next-line max-len
                const mimeType = MimeTypes.getMimeTypefromString(
                  MediaContentItem.thumbUrl.split('.').pop()
                );
                const ReplaceText = 'https://images.locobuzz.com/';
                let ThumbUrl = MediaContentItem.thumbUrl;
                ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                const backgroundUrl = this.clickhouseEnabled ? MediaContentItem.mediaUrl :`${MediaUrl}/api/WebHook/GetPrivateMediaS3New?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}&brandsocialid=${mention?.author.socialId}&brandID=${mention?.brandInfo.brandID}&brandName=${mention?.brandInfo.brandName}&channeltype=${mention?.channelType}`;
                MediaContentItem.mediaUrl = backgroundUrl;
                ticketHistoryData.imageurls.push(backgroundUrl);
              } else {
                if (mention?.isBrandPost) {
                  let updatedUrl = `${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem?.mediaUrl}&brandsocialid=${mention?.author?.socialId}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`;
                  if (MediaContentItem?.mediaUrl?.includes('/api/WebHook/GetTwitterDMImage')){
                    updatedUrl = `${MediaContentItem?.mediaUrl}&brandsocialid=${mention?.author?.socialId}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`
                  }
                  const backgroundUrl = this.clickhouseEnabled ? MediaContentItem.mediaUrl : updatedUrl;
                  MediaContentItem.mediaUrl = backgroundUrl;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                } else {
                  let  updatedUrl = `${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem?.mediaUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`;    
                  if (MediaContentItem?.mediaUrl?.includes(`/api/WebHook/GetTwitterDMImage`)){
                    updatedUrl = `${MediaContentItem?.mediaUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`
                  }      
                  const backgroundUrl = this.clickhouseEnabled ? MediaContentItem.mediaUrl : updatedUrl;
                  MediaContentItem.mediaUrl = backgroundUrl;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                }
              }
            } else {
              const backgroundUrl = `${MediaContentItem.thumbUrl}`;
              ticketHistoryData.imageurls.push(backgroundUrl);
            }
          }
          if (
            MediaContentItem.mediaType === MediaEnum.VIDEO ||
            MediaContentItem.mediaType === MediaEnum.ANIMATEDGIF
          ) {
            if (
              mention?.channelType === ChannelType.DirectMessages &&
              MediaContentItem.thumbUrl
            ) {
              let SocialOrUserId = '';
              if (mention?.isBrandPost) {
                SocialOrUserId = mention?.author.socialId;
              } else {
                SocialOrUserId = mention?.inReplyToUserID;
              }
              if (MediaContentItem.thumbUrl.includes('images.locobuzz') || MediaContentItem?.thumbUrl?.includes('s3.amazonaws')) {
                // eslint-disable-next-line max-len
                const mimeType = MimeTypes.getMimeTypefromString(
                  MediaContentItem.thumbUrl.split('.').pop()
                );
                const ReplaceText = 'https://images.locobuzz.com/';
                let ThumbUrl = MediaContentItem.thumbUrl;
                ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                const backgroundUrl = this.clickhouseEnabled ? MediaContentItem.thumbUrl : `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
                ticketHistoryData.newThumburls.push(backgroundUrl)
              } else {
                if (mention?.isBrandPost && !this.clickhouseEnabled) {
                  let updatedUrl = `${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem?.thumbUrl}&brandsocialid=${mention?.author.socialId}&brandID=${mention?.brandInfo.brandID}&brandName=${mention?.brandInfo.brandName}&tagID=${mention?.tagID}`;
                  if (MediaContentItem?.thumbUrl?.includes(`/api/WebHook/GetTwitterDMImage`)) {
                    updatedUrl = `${MediaContentItem?.thumbUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`
                  } 
                  const backgroundUrl = updatedUrl;
                  MediaContentItem.thumbUrl = backgroundUrl;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  ticketHistoryData.newThumburls.push(backgroundUrl)
                } else if (this.clickhouseEnabled) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  ticketHistoryData.newThumburls.push(backgroundUrl)
                } else { 
                  let updatedUrl = `${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem?.thumbUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`;
                  if (MediaContentItem?.thumbUrl?.includes(`/api/WebHook/GetTwitterDMImage`)){
                    updatedUrl = `${MediaContentItem?.thumbUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`; 
                  }
                  const backgroundUrl = updatedUrl;
                  MediaContentItem.thumbUrl = backgroundUrl;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  ticketHistoryData.newThumburls.push(backgroundUrl)
                }
              }
            } else {
              const backgroundUrl = `${MediaContentItem.mediaUrl}`;
              const vidurl: VideoUrl = {};
              vidurl.fileUrl = backgroundUrl;
              vidurl.thumbUrl = `${MediaContentItem.thumbUrl}`;
              MediaContentItem.mediaUrl = backgroundUrl;
              ticketHistoryData.videoUrls.push(vidurl);
              MediaContentItem.mediaType = MediaEnum.VIDEO;
              ticketHistoryData.imageurls.push(vidurl.thumbUrl)
              ticketHistoryData.newThumburls.push(vidurl.thumbUrl)
            }
          }
          if ((MediaContentItem.mediaType === MediaEnum.STICKER || MediaContentItem.mediaType === MediaEnum.OTHER) && !this.clickhouseEnabled) {
            if (mention?.channelType === ChannelType.DirectMessages &&
                MediaContentItem.thumbUrl
            ) {
              if (MediaContentItem?.thumbUrl?.includes('images.locobuzz') || MediaContentItem?.thumbUrl?.includes('s3.amazonaws')) {
                const mimeType = MimeTypes.getMimeTypefromString(
                  MediaContentItem.thumbUrl.split('.').pop()
                );
                const ReplaceText = 'https://images.locobuzz.com/';
                let ThumbUrl = MediaContentItem?.thumbUrl;
                ThumbUrl = ThumbUrl?.replace(ReplaceText, '');
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                ticketHistoryData?.imageurls?.push(backgroundUrl);
                ticketHistoryData?.newThumburls?.push(backgroundUrl)
              } else {
                if (mention?.isBrandPost) {
                  let updatedUrl =`${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem?.thumbUrl}&brandsocialid=${mention?.author?.socialId}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`;
                  if (MediaContentItem?.thumbUrl?.includes(`/api/WebHook/GetTwitterDMImage`)){
                    updatedUrl = `${MediaContentItem?.thumbUrl}&brandsocialid=${mention?.author?.socialId}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`;
                  }
                  const backgroundUrl = updatedUrl;
                  MediaContentItem.thumbUrl = backgroundUrl;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  ticketHistoryData.newThumburls.push(backgroundUrl)
                } else {
                  let updatedUrl =`${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem?.thumbUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`;
                  if (MediaContentItem?.thumbUrl?.includes(`/api/WebHook/GetTwitterDMImage`)){
                    updatedUrl = `${MediaContentItem?.thumbUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo?.brandID}&brandName=${mention?.brandInfo?.brandName}&tagID=${mention?.tagID}`; 
                  }
                  const backgroundUrl = updatedUrl;
                  MediaContentItem.thumbUrl = backgroundUrl;
                  ticketHistoryData?.imageurls?.push(backgroundUrl);
                  ticketHistoryData?.newThumburls?.push(backgroundUrl)
                }
              }
            }
          }
          // if (MediaContentItem.mediaType === MediaEnum.ANIMATEDGIF) {
          //   if (
          //     (MediaContentItem.mediaUrl &&
          //       (MediaContentItem.mediaUrl.includes('.png') ||
          //         MediaContentItem.mediaUrl.includes('.jpeg') ||
          //         MediaContentItem.mediaUrl.includes('.gif'))) ||
          //     MediaContentItem.mediaUrl.includes('.jpg')
          //   ) {
          //     ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
          //   }else{

          //   }
          // }
        }
      }
    }

    // Media Content for facebook Channels
    else if (mention?.channelGroup === ChannelGroup.Facebook) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const MediaContentItem of mention?.attachmentMetadata
          .mediaContents) {
        if (MediaContentItem.mediaType === MediaEnum.IMAGE) {
          if (mention?.attachmentMetadata.mediaContents.length > 0) {
              if (
                mention?.channelType === ChannelType.FBMessages &&
                MediaContentItem.thumbUrl
              ) {
                if (MediaContentItem?.thumbUrl?.includes('images.locobuzz')) {
                  const mimeType = MimeTypes.getMimeTypefromString(
                    MediaContentItem.thumbUrl.split('.').pop()
                  );
                  const ReplaceText = 'https://images.locobuzz.com/';
                  let ThumbUrl = MediaContentItem.thumbUrl;
                  ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  MediaContentItem.mediaUrl = backgroundUrl;
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                }
              } else {
                let isScontentLinkExpired: boolean = false;
                isScontentLinkExpired = this.isScontentLinkExpire(
                  MediaContentItem.thumbUrl,
                  mention?.channelType
                );
                if (isScontentLinkExpired) {
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/Imageexpired.svg'
                  );
                  //link expired image logic
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  MediaContentItem.mediaUrl = backgroundUrl;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  // ticketHistoryData.newThumburls.push(backgroundUrl)
                }
              }
          }
        } else if (MediaContentItem.mediaType === MediaEnum.VIDEO) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            // for (const MediaContentItem of mention?.attachmentMetadata
            //   .mediaContents) {
              ticketHistoryData.videoIcon = true;
              if (
                MediaContentItem.thumbUrl &&
                (MediaContentItem.thumbUrl.includes('.png') ||
                  MediaContentItem.thumbUrl.includes('.jpg') ||
                  MediaContentItem.thumbUrl.includes('.jpeg') ||
                  MediaContentItem.thumbUrl.includes('.gif'))
              ) {
                if (mention?.channelType === ChannelType.FBMessages) {
                  if (MediaContentItem.thumbUrl.includes('images.locobuzz')) {
                    const mimeType = MimeTypes.getMimeTypefromString(
                      MediaContentItem.thumbUrl.split('.').pop()
                    );
                    const ReplaceText = 'https://images.locobuzz.com/';
                    let ThumbUrl = MediaContentItem.thumbUrl;
                    ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                    const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                    ticketHistoryData.imageurls.push(backgroundUrl);
                    ticketHistoryData.newThumburls.push(backgroundUrl)
                  } else {
                    const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                    ticketHistoryData.imageurls.push(backgroundUrl);
                    ticketHistoryData.newThumburls.push(backgroundUrl)
                  }
                } else {
                  let isScontentLinkExpired: boolean = false;
                  isScontentLinkExpired = this.isScontentLinkExpire(
                    MediaContentItem.thumbUrl,
                    mention?.channelType
                  );
                  if (isScontentLinkExpired) {
                    ticketHistoryData.imageurls.push(
                      'assets/images/common/Videoexpired.svg'
                    );
                    //link expired image logic
                  } else {
                    const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                    ticketHistoryData.imageurls.push(backgroundUrl);
                    ticketHistoryData.newThumburls?.push(backgroundUrl)
                  }
                }
              } else {
                if (MediaContentItem.mediaUrl) {
                  ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
                  ticketHistoryData.newThumburls.push(MediaContentItem.mediaUrl)
                }
              }
            // }
          }
        } else if (MediaContentItem.mediaType === MediaEnum.URL) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            // for (const MediaContentItem of mention?.attachmentMetadata
            //   .mediaContents) {
              if (
                MediaContentItem.mediaUrl &&
                (MediaContentItem.mediaUrl.includes('.png') ||
                  MediaContentItem.mediaUrl.includes('.jpeg') ||
                  MediaContentItem.mediaUrl.includes('.gif'))
              ) {
                const backgroundUrl = `${
                  MediaContentItem.thumbUrl
                    ? MediaContentItem.thumbUrl
                    : MediaContentItem.mediaUrl
                }`;
                ticketHistoryData.imageurls.push(backgroundUrl);
              } else {
                if (MediaContentItem.mediaUrl) {
                  const isUrlpresent = ticketHistoryData.description.includes(MediaContentItem.mediaUrl);
                  
                  if (!isUrlpresent){
                    //  ticketHistoryData.description += linkifyStr(
                    //    MediaContentItem.mediaUrl,
                    //    { target: '_system' }
                    //  );
                    
                    ticketHistoryData.description += LocobuzzUtils.checkLinkTag((MediaContentItem.mediaUrl))
                   }
                  // ticketHistoryData.description += ` ${MediaContentItem.mediaUrl}`;
                }
              }
            // }
          }
        } else if (MediaContentItem.mediaType === MediaEnum.AUDIO) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            // for (const MediaContentItem of mention?.attachmentMetadata
            //   .mediaContents) {
              ticketHistoryData.imageurls.push(
                'assets/images/common/AudioMusic.svg'
              );
            // }
          }
        } else if (MediaContentItem.mediaType === MediaEnum.ANIMATEDGIF) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            // for (const MediaContentItem of mention?.attachmentMetadata
            //   .mediaContents) {
              if(mention?.channelType === ChannelType.FBComments) {
                ticketHistoryData.videoIcon = true;
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
                ticketHistoryData.newThumburls.push(backgroundUrl)
              } else {
                let isScontentLinkExpired: boolean = false;
                isScontentLinkExpired = this.isScontentLinkExpire(
                  MediaContentItem.thumbUrl,
                  mention?.channelType
                );
                if (isScontentLinkExpired) {
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/Imageexpired.svg'
                  );
                  ticketHistoryData.newThumburls.push('assets/images/common/Imageexpired.svg')
                  //link expired image logic
                } else {
                  ticketHistoryData.imageurls.push(MediaContentItem.thumbUrl);
                  ticketHistoryData.newThumburls.push(MediaContentItem.thumbUrl)
                }
              }
            // }
          }
        }
        else if (MediaContentItem.mediaType === MediaEnum.PDF) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            // for (const MediaContentItem of mention?.attachmentMetadata
            //   .mediaContents) {
              const backgroundUrl = MediaContentItem.mediaUrl;
              const docurl: DocumentUrl = {};
              docurl.fileName = MediaContentItem.name;
              docurl.fileUrl = backgroundUrl;
              docurl.thumbUrl = 'assets/images/common/pdf.png';
              ticketHistoryData.documentUrls.push(docurl);
            }
          // }
        }
        else if (MediaContentItem.mediaType === MediaEnum.DOC) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            // for (const MediaContentItem of mention?.attachmentMetadata
            //   .mediaContents) {
              const backgroundUrl = MediaContentItem.mediaUrl;
              const docurl: DocumentUrl = {};
              docurl.fileName = MediaContentItem.name;
              docurl.fileUrl = backgroundUrl;
              docurl.thumbUrl = 'assets/images/common/word.png';
              ticketHistoryData.documentUrls.push(docurl);
            }
          // }
        }
        else if (MediaContentItem.mediaType === MediaEnum.EXCEL) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            // for (const MediaContentItem of mention?.attachmentMetadata
            //   .mediaContents) {
              const backgroundUrl = MediaContentItem.mediaUrl;
              const docurl: DocumentUrl = {};
              docurl.fileName = MediaContentItem.name;
              docurl.fileUrl = backgroundUrl;
              docurl.thumbUrl = 'assets/images/common/excel-file.png';
              ticketHistoryData.documentUrls.push(docurl);
            // }
          }
        }
         else if (MediaContentItem.mediaType === MediaEnum.OTHER) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            // for (const MediaContentItem of mention?.attachmentMetadata
            //   .mediaContents) {
              if (
                MediaContentItem.mediaUrl &&
                (MediaContentItem.mediaUrl.includes('.png') ||
                  MediaContentItem.mediaUrl.includes('.jpeg') ||
                  MediaContentItem.mediaUrl.includes('.jpg') ||
                  MediaContentItem.mediaUrl.includes('.gif'))
              ) {
                let imageurl = '';
                if (
                  MediaContentItem.thumbUrl &&
                  MediaContentItem.thumbUrl !== '' &&
                  MediaContentItem.thumbUrl !== null
                ) {
                  imageurl = MediaContentItem.thumbUrl;
                } else {
                  imageurl = MediaContentItem.mediaUrl;
                }
                const backgroundUrl = `${imageurl}`;
                let isScontentLinkExpired: boolean = false;
                isScontentLinkExpired = this.isScontentLinkExpire(
                  imageurl,
                  mention?.channelType
                );
                if (isScontentLinkExpired) {
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/Imageexpired.svg'
                  );
                  //link expired image logic
                } else {
                  ticketHistoryData.imageurls.push(backgroundUrl);
                }
              } else if (MediaContentItem.mediaUrl) {
                if (
                  MediaContentItem.mediaUrl &&
                  MediaContentItem.mediaUrl.includes('.mp4')
                ) {
                  let isScontentLinkExpired: boolean = false;
                  isScontentLinkExpired = this.isScontentLinkExpire(
                    MediaContentItem.mediaUrl,
                    mention?.channelType
                  );
                  if (isScontentLinkExpired) {
                    ticketHistoryData.imageurls.push(
                      'assets/images/common/Videoexpired.svg'
                    );
                    ticketHistoryData.newThumburls.push('assets/images/common/Imageexpired.svg')
                    //link expired image logic
                  } else {
                    const backgroundUrl = `${MediaContentItem.mediaUrl}`;
                    const vidurl: VideoUrl = {};
                    vidurl.fileUrl = backgroundUrl;
                    vidurl.thumbUrl = backgroundUrl;
                    MediaContentItem.mediaUrl = backgroundUrl;
                    ticketHistoryData.videoUrls.push(vidurl);
                  }
                } else if (MediaContentItem.mediaUrl.includes('.pdf')) {
                  // const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  // ticketHistoryData.imageurls.push(
                  //   'assets/images/common/pdf.png'
                  // );
                  const backgroundUrl = MediaContentItem.mediaUrl;
                  const docurl: DocumentUrl = {};
                  docurl.fileName = MediaContentItem.name;
                  docurl.fileUrl = backgroundUrl;
                  docurl.thumbUrl = 'assets/images/common/pdf.png';
                  ticketHistoryData.documentUrls.push(docurl);
                  // bind the  pdf url
                } else if (
                  MediaContentItem.mediaUrl.includes('.doc') ||
                  MediaContentItem.mediaUrl.includes('.docx')
                ) {
                  // const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  // ticketHistoryData.imageurls.push(
                  //   'assets/images/common/word.png'
                  // );
                  const backgroundUrl = MediaContentItem.mediaUrl;
                  const docurl: DocumentUrl = {};
                  docurl.fileName = MediaContentItem.name;
                  docurl.fileUrl = backgroundUrl;
                  docurl.thumbUrl = 'assets/images/common/word.png';
                  ticketHistoryData.documentUrls.push(docurl);
                } else if (
                  MediaContentItem.mediaUrl.includes('.xls') ||
                  MediaContentItem.mediaUrl.includes('.xlsx')
                ) {
                  // const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  // ticketHistoryData.imageurls.push(
                  //   'assets/images/common/excel-file.png'
                  // );
                  const backgroundUrl = MediaContentItem.mediaUrl;
                  const docurl: DocumentUrl = {};
                  docurl.fileName = MediaContentItem.name;
                  docurl.fileUrl = backgroundUrl;
                  docurl.thumbUrl = 'assets/images/common/excel-file.png';
                  ticketHistoryData.documentUrls.push(docurl);
                } else if (MediaContentItem.mediaUrl.includes('.mp3')) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/AudioMusic.svg'
                  );
                } else {
                  // ticketHistoryData.description += linkifyStr(
                  //  ' ' +MediaContentItem.mediaUrl,
                  //   { target: '_system' }
                  // );
                  ticketHistoryData.description += LocobuzzUtils.checkLinkTag((MediaContentItem.mediaUrl))
                  // ticketHistoryData.description += ` ${MediaContentItem.mediaUrl}`;
                  // ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
                }
              } else {
                if (MediaContentItem.mediaUrl) {
                  // ticketHistoryData.description += linkifyStr(
                  //   ' ' + MediaContentItem.mediaUrl,
                  //   { target: '_system' }
                  // );
                  ticketHistoryData.description += LocobuzzUtils.checkLinkTag((MediaContentItem.mediaUrl))

                  // ticketHistoryData.description += ` ${MediaContentItem.mediaUrl}`;
                  // ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
                }
              }
            }
          }
        else if (MediaContentItem.mediaType === MediaEnum.LOCATIONS){
          let isScontentLinkExpired: boolean = false;
          isScontentLinkExpired = this.isScontentLinkExpire(
            MediaContentItem.thumbUrl,
            mention?.channelType
          );
          if (isScontentLinkExpired) {
            ticketHistoryData.imageurls.push(
              'assets/images/common/Imageexpired.svg'
            );
            //link expired image logic
          } else {
            const backgroundUrl = `${MediaContentItem.thumbUrl}`;
            MediaContentItem.thumbUrl = backgroundUrl;
            ticketHistoryData.imageurls.push(backgroundUrl);
          }
        }
        }
      }
    } else if (
      mention?.channelGroup === ChannelGroup.Email &&
      mention?.attachmentMetadata.mediaContents &&
      mention?.attachmentMetadata.mediaContents.length > 0
    ) {
      ticketHistoryData.isemailattachement = true;
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const MediaContentItem of mention?.attachmentMetadata
          .mediaContents) {
          if (
            MediaContentItem.mediaType === MediaEnum.IMAGE ||
            MediaContentItem.mediaType === MediaEnum.ANIMATEDGIF
          ) {
            if (
              mention?.channelType === ChannelType.DirectMessages &&
              MediaContentItem.thumbUrl
            ) {
              if (MediaContentItem?.thumbUrl?.includes('images.locobuzz') || MediaContentItem?.thumbUrl?.includes('s3.amazonaws')) {
                // eslint-disable-next-line max-len
                const mimeType = MimeTypes.getMimeTypefromString(
                  MediaContentItem.thumbUrl.split('.').pop()
                );
                const ReplaceText = 'https://images.locobuzz.com/';
                let ThumbUrl = MediaContentItem.thumbUrl;
                ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
                MediaContentItem.thumbUrl = backgroundUrl;
              } else {
                if (mention?.isBrandPost) {
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem.mediaUrl}&brandsocialid=${mention?.author.socialId}&brandID=${mention?.brandInfo.brandID}&brandName=${mention?.brandInfo.brandName}&tagID=${mention?.tagID}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                } else {
                  const backgroundUrl = `${MediaUrl}/api/WebHook/GetTwitterDMImage?url=${MediaContentItem.mediaUrl}&brandsocialid=${mention?.inReplyToUserID}&brandID=${mention?.brandInfo.brandID}&brandName=${mention?.brandInfo.brandName}&tagID=${mention?.tagID}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                }
              }
            } else {
              if (MediaContentItem.mediaUrl.includes('jpg') || 
              MediaContentItem.mediaUrl.includes('png') || 
              MediaContentItem.mediaUrl.includes('jpeg') ||
               MediaContentItem.mediaUrl.includes('gif') || 
                MediaContentItem.mediaUrl.includes('jfif') || 
                MediaContentItem.mediaUrl.includes('pjpeg') || 
                MediaContentItem.mediaUrl.includes('pjp') ||
                MediaContentItem.mediaUrl.includes('apng') ||
                MediaContentItem.mediaUrl.includes('avif')  )
              {
                const backgroundUrl = `${MediaContentItem.thumbUrl
                  ? MediaContentItem.thumbUrl
                  : MediaContentItem.mediaUrl
                  }`;
                ticketHistoryData.imageurls.push(backgroundUrl);
            }else{
                const fileUrl: fileUrl = {};
                fileUrl.fileUrl = MediaContentItem.mediaUrl;
                fileUrl.thumbUrl = MediaContentItem.mediaUrl;
                MediaContentItem.mediaUrl = MediaContentItem.mediaUrl;
                fileUrl.fileName = MediaContentItem.name
                ticketHistoryData.fileUrls.push(fileUrl); 
            }
            }
          } else if (MediaContentItem.mediaType === MediaEnum.VIDEO) {
            if (
              mention?.channelType === ChannelType.DirectMessages &&
              MediaContentItem.thumbUrl
            ) {
              let SocialOrUserId = '';
              if (mention?.isBrandPost) {
                SocialOrUserId = mention?.author.socialId;
              } else {
                SocialOrUserId = mention?.inReplyToUserID;
              }
              if (MediaContentItem.thumbUrl.includes('images.locobuzz')) {
                // eslint-disable-next-line max-len
                const mimeType = MimeTypes.getMimeTypefromString(
                  MediaContentItem.thumbUrl.split('.').pop()
                );
                const ReplaceText = 'https://images.locobuzz.com/';
                let ThumbUrl = MediaContentItem.thumbUrl;
                ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
              } else {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
              }
            } else {
              if (MediaContentItem.thumbUrl) {
                if (MediaContentItem.mediaUrl.includes('.mp4')) {
                  const vidurl: VideoUrl = {};
                  vidurl.fileUrl = MediaContentItem.mediaUrl;
                  vidurl.thumbUrl = MediaContentItem.mediaUrl;
                  MediaContentItem.mediaUrl = MediaContentItem.mediaUrl;
                  vidurl.name = MediaContentItem.name
                  ticketHistoryData.videoUrls.push(vidurl);
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                }
              } else {
                if (MediaContentItem.mediaUrl.includes('.mp4')) {
                  const vidurl: VideoUrl = {};
                  vidurl.fileUrl = MediaContentItem.mediaUrl;
                  vidurl.thumbUrl = MediaContentItem.mediaUrl;
                  MediaContentItem.mediaUrl = MediaContentItem.mediaUrl;
                  vidurl.name = MediaContentItem.name
                  ticketHistoryData.videoUrls.push(vidurl);
                }
              }
            }
          } else if (
            MediaContentItem.mediaType === MediaEnum.PDF ||
            MediaContentItem.mediaType === MediaEnum.DOC ||
            MediaContentItem.mediaType === MediaEnum.EXCEL
          ) {
            const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
            const docurl: DocumentUrl = {};
            docurl.fileName = MediaContentItem.name;
            docurl.fileUrl = MediaContentItem.mediaUrl;
            docurl.thumbUrl =
              MediaContentItem.mediaType === MediaEnum.PDF
                ? 'assets/images/common/pdf.png'
                : MediaContentItem.mediaType === MediaEnum.DOC
                ? 'assets/images/common/word.png'
                : 'assets/images/common/excel-file.png';
            docurl.mediaType = MediaContentItem.mediaType;
            const ReplaceText =
              'https://s3.amazonaws.com/locobuzz.socialimages/Email/Attachment/600/';
            docurl.fileUrl = docurl.fileUrl.replace(ReplaceText, '');
            ticketHistoryData.documentUrls.push(docurl);
          } else if (MediaContentItem.mediaType === MediaEnum.OTHER) {
            if (
              MediaContentItem.mediaUrl &&
              (MediaContentItem.mediaUrl.includes('.png') ||
                MediaContentItem.mediaUrl.includes('.jpeg') ||
                MediaContentItem.mediaUrl.includes('.jpg') ||
                MediaContentItem.mediaUrl.includes('.gif'))
            ) {
              let imageurl = '';
              if (
                MediaContentItem.thumbUrl &&
                MediaContentItem.thumbUrl !== '' &&
                MediaContentItem.thumbUrl !== null
              ) {
                imageurl = MediaContentItem.thumbUrl;
              } else {
                imageurl = MediaContentItem.mediaUrl;
              }
              const backgroundUrl = `${imageurl}`;
              ticketHistoryData.imageurls.push(backgroundUrl);
            } else if (MediaContentItem.mediaUrl) {
              if (MediaContentItem.mediaUrl.includes('.pdf')) {
                // const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                // ticketHistoryData.imageurls.push(
                //   'assets/images/common/pdf.png'
                // );
                const backgroundUrl = MediaContentItem.mediaUrl;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/pdf.png';
                docurl.mediaType = MediaEnum.PDF;
                const ReplaceText =
                  'https://s3.amazonaws.com/locobuzz.socialimages/Email/Attachment/600/';
                docurl.fileName = docurl.fileUrl.replace(ReplaceText, '');
                ticketHistoryData.documentUrls.push(docurl);
                // bind the  pdf url
              }
              if (MediaContentItem.mediaUrl.includes('.pptx') || MediaContentItem.mediaUrl.includes('.ppt')) {
                // const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                // ticketHistoryData.imageurls.push(
                //   'assets/images/common/pdf.png'
                // );
                const backgroundUrl = MediaContentItem.mediaUrl;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/pdf.png';
                docurl.mediaType = MediaEnum.PDF;
                // const ReplaceText =
                //   'https://s3.amazonaws.com/locobuzz.socialimages/Email/Attachment/600/';
                // docurl.fileName = docurl.fileUrl.replace(ReplaceText, '');
                ticketHistoryData.documentUrls.push(docurl);
                // bind the  pdf url
              } else if (
                MediaContentItem.mediaUrl.includes('.doc') ||
                MediaContentItem.mediaUrl.includes('.docx')
              ) {
                // const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                // ticketHistoryData.imageurls.push(
                //   'assets/images/common/word.png'
                // );
                const backgroundUrl = MediaContentItem.mediaUrl;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/word.png';
                docurl.mediaType = MediaEnum.DOC;
                // const ReplaceText =
                //   'https://s3.amazonaws.com/locobuzz.socialimages/Email/Attachment/600/';
                // docurl.fileName = docurl.fileUrl.replace(ReplaceText, '');
                ticketHistoryData.documentUrls.push(docurl);
              } else if (
                MediaContentItem.mediaUrl.includes('.xls') ||
                MediaContentItem.mediaUrl.includes('.xlsx')
              ) {
                // const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                // ticketHistoryData.imageurls.push(
                //   'assets/images/common/excel-file.png'
                // );
                const backgroundUrl = MediaContentItem.mediaUrl;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/excel-file.png';
                docurl.mediaType = MediaEnum.EXCEL;
                // const ReplaceText =
                //   'https://s3.amazonaws.com/locobuzz.socialimages/Email/Attachment/600/';
                // docurl.fileName = docurl.fileUrl.replace(ReplaceText, '');
                ticketHistoryData.documentUrls.push(docurl);
              } else if (MediaContentItem.mediaUrl.includes('.mp3')) {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                ticketHistoryData.imageurls.push(
                  'assets/images/common/AudioMusic.svg'
                );
              } else if (MediaContentItem.mediaUrl.includes('.mp4')) {
                const vidurl: VideoUrl = {};
                vidurl.fileUrl = MediaContentItem.mediaUrl;
                vidurl.thumbUrl = MediaContentItem.mediaUrl;
                MediaContentItem.mediaUrl = MediaContentItem.mediaUrl;
                vidurl.name = MediaContentItem.name
                ticketHistoryData.videoUrls.push(vidurl);
              }else{
                const fileUrl: fileUrl = {};
                fileUrl.fileUrl = MediaContentItem.mediaUrl;
                fileUrl.thumbUrl = MediaContentItem.mediaUrl;
                MediaContentItem.mediaUrl = MediaContentItem.mediaUrl;
                fileUrl.fileName=MediaContentItem.name
                ticketHistoryData.fileUrls.push(fileUrl);
              }
            }
          } else {
            const backgroundUrl = `${MediaContentItem.mediaUrl}`;
            ticketHistoryData.imageurls.push(backgroundUrl);
          }
        }
      }
    }
    // for whatsApp channel media
    else if (mention?.channelGroup === ChannelGroup.WhatsApp) {
      if (mention?.mediaType === MediaEnum.IMAGE) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = MediaContentItem.mediaUrl.includes('https://images.locobuzz.com') ? MediaContentItem.mediaUrl : MediaContentItem.mediaUrl.includes('WebHook/GetPrivateMediaS3') ? MediaContentItem.mediaUrl :`${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
           backgroundUrl? MediaContentItem.mediaUrl = backgroundUrl:'';

            ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.VIDEO) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = MediaContentItem.mediaUrl.includes('https://images.locobuzz.com') ? MediaContentItem.mediaUrl : MediaContentItem.mediaUrl.includes('WebHook/GetPrivateMediaS3') ? MediaContentItem.mediaUrl : `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            const vidurl: VideoUrl = {};
            vidurl.fileUrl = backgroundUrl;
            vidurl.thumbUrl = backgroundUrl;
            MediaContentItem.mediaUrl = backgroundUrl;
            ticketHistoryData.videoUrls.push(vidurl);
            /* ticketHistoryData.imageurls.push(vidurl.thumbUrl) */
            ticketHistoryData.newThumburls.push(vidurl.thumbUrl)
          }
        }
      } else if (mention?.mediaType === MediaEnum.AUDIO) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = MediaContentItem.mediaUrl.includes('https://images.locobuzz.com') ? MediaContentItem.mediaUrl : MediaContentItem.mediaUrl.includes('WebHook/GetPrivateMediaS3') ? MediaContentItem.mediaUrl : `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            const audurl: AudioUrl = {};
            audurl.fileUrl = backgroundUrl;
            audurl.thumbUrl = 'assets/images/common/AudioMusic.svg';
            MediaContentItem.mediaUrl = backgroundUrl;
            ticketHistoryData.audioUrls.push(audurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.PDF) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = MediaContentItem.mediaUrl.includes('https://images.locobuzz.com') ? MediaContentItem.mediaUrl : MediaContentItem.mediaUrl.includes('WebHook/GetPrivateMediaS3') ? MediaContentItem.mediaUrl : `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
            const docurl: DocumentUrl = {};
            docurl.fileName = MediaContentItem.name;
            docurl.fileUrl = backgroundUrl;
            docurl.thumbUrl = 'assets/images/common/pdf.png';
            MediaContentItem.mediaUrl = backgroundUrl;
            ticketHistoryData.documentUrls.push(docurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.DOC) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = MediaContentItem.mediaUrl.includes('https://images.locobuzz.com') ? MediaContentItem.mediaUrl : MediaContentItem.mediaUrl.includes('WebHook/GetPrivateMediaS3') ? MediaContentItem.mediaUrl : `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
            const docurl: DocumentUrl = {};
            docurl.fileName = MediaContentItem.name;
            docurl.fileUrl = backgroundUrl;
            docurl.thumbUrl = 'assets/images/common/word.png';
            MediaContentItem.mediaUrl = backgroundUrl;
            ticketHistoryData.documentUrls.push(docurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.EXCEL) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            const backgroundUrl = MediaContentItem.mediaUrl.includes('https://images.locobuzz.com') ? MediaContentItem.mediaUrl : MediaContentItem.mediaUrl.includes('WebHook/GetPrivateMediaS3') ? MediaContentItem.mediaUrl : `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
            // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
            const docurl: DocumentUrl = {};
            docurl.fileName = MediaContentItem.name;
            docurl.fileUrl = backgroundUrl;
            docurl.thumbUrl = 'assets/images/common/excel-file.png';
            MediaContentItem.mediaUrl = backgroundUrl;
            ticketHistoryData.documentUrls.push(docurl);
          }
        }
      } else if (mention?.mediaType === MediaEnum.URL) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            if (
              MediaContentItem.mediaUrl &&
              (MediaContentItem.mediaUrl.includes('.png') ||
                MediaContentItem.mediaUrl.includes('.jpeg') ||
                MediaContentItem.mediaUrl.includes('.gif'))
            ) {
              ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
            } else {
              if (MediaContentItem.mediaUrl) {
                // ticketHistoryData.description = linkifyStr(
                //   MediaContentItem.mediaUrl,
                //   { target: '_system' }
                // );
                ticketHistoryData.description += LocobuzzUtils.checkLinkTag((MediaContentItem.mediaUrl))
                // ticketHistoryData.description += ` ${MediaContentItem.mediaUrl}`;
              }
            }
          }
        }
      } else if (
        mention?.mediaType === MediaEnum.OTHER ||
        mention?.mediaType === MediaEnum.HTML
      ) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            if (
              MediaContentItem.mediaUrl &&
              (MediaContentItem.mediaUrl.includes('.png') ||
                MediaContentItem.mediaUrl.includes('.jpeg') ||
                MediaContentItem.mediaUrl.includes('.gif')) ||
                MediaContentItem.mediaType === MediaEnum.IMAGE
            ) {
              const backgroundUrl = MediaContentItem.mediaUrl
              // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
              MediaContentItem.mediaUrl = backgroundUrl;
              ticketHistoryData.imageurls.push(backgroundUrl);
            } else if (
              MediaContentItem.mediaUrl &&
              (MediaContentItem.mediaUrl.includes('.mp4') ||
                MediaContentItem.mediaType === MediaEnum.VIDEO)
            ) {
              const backgroundUrl = MediaContentItem.mediaUrl
              // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
              const vidurl: VideoUrl = {};
              vidurl.fileUrl = backgroundUrl;
              vidurl.thumbUrl = backgroundUrl;
              MediaContentItem.mediaUrl = backgroundUrl;
              ticketHistoryData.videoUrls.push(vidurl);
              ticketHistoryData.imageurls.push(vidurl.thumbUrl)
              ticketHistoryData.newThumburls.push(vidurl.thumbUrl)
            } else if (
              MediaContentItem.mediaUrl &&
              MediaContentItem.mediaUrl.includes('.mp3')
            ) {
              const backgroundUrl = MediaContentItem.mediaUrl
              // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
              const audurl: AudioUrl = {};
              audurl.fileUrl = backgroundUrl;
              audurl.thumbUrl = backgroundUrl;
              MediaContentItem.mediaUrl = backgroundUrl;
              ticketHistoryData.audioUrls.push(audurl);
            } else if (MediaContentItem.mediaUrl) {
              if (MediaContentItem.mediaUrl.includes('.pdf') ||
                MediaContentItem.mediaType === MediaEnum.PDF) {
                const backgroundUrl = MediaContentItem.mediaUrl
                // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/pdf.png';
                MediaContentItem.mediaUrl = backgroundUrl;
                ticketHistoryData.documentUrls.push(docurl);
              } else if (
                MediaContentItem.mediaUrl.includes('.doc') ||
                MediaContentItem.mediaUrl.includes('.docx') ||
                MediaContentItem.mediaType === MediaEnum.DOC
              ) {
                const backgroundUrl = MediaContentItem.mediaUrl
                // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}`;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/word.png';
                MediaContentItem.mediaUrl = backgroundUrl;
                ticketHistoryData.documentUrls.push(docurl);
              } else if (
                MediaContentItem.mediaUrl.includes('.xls') ||
                MediaContentItem.mediaUrl.includes('.xlsx') ||
                MediaContentItem.mediaType === MediaEnum.EXCEL
              ) {
                const backgroundUrl = MediaContentItem.mediaUrl
                // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/excel-file.png';
                MediaContentItem.mediaUrl = backgroundUrl;
                ticketHistoryData.documentUrls.push(docurl);
              } else {
                const backgroundUrl = MediaContentItem.mediaUrl
                // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
                MediaContentItem.mediaUrl = backgroundUrl;
              }
            } else {
              if (MediaContentItem.mediaUrl) {
                const backgroundUrl = MediaContentItem.mediaUrl
                // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
                MediaContentItem.mediaUrl = backgroundUrl;
              }
            }
          }
        }
      }
    } else if (
      mention?.channelGroup === ChannelGroup.WebsiteChatBot &&
      mention?.mediaType !== MediaEnum.TEXT
    ) {
      let messagetext = '';
      // const error = '';
      let data = null;
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const media of mention?.attachmentMetadata.mediaContents) {
          messagetext = media.name;
          if (mention?.isBrandPost) {
            if (this.isJSON(messagetext)) {
              data = JSON.parse(messagetext);
              // load bot data
              // messagetext = BotInboxMessageDetails.MessageLoader(data);
            } else {
              if (media.mediaType === MediaEnum.IMAGE) {
                ticketHistoryData.imageurls.push(messagetext);
              } else if (media.mediaType === MediaEnum.VIDEO) {
                const vidurl: VideoUrl = {};
                vidurl.fileUrl = messagetext;
                vidurl.thumbUrl = messagetext;
                // ticketHistoryData.imageurls.push(messagetext);
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
                docurl.thumbUrl = 'assets/images/common/attachement-blured.png';
                // ticketHistoryData.documentUrls.push(docurl);
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
                ticketHistoryData.imageurls.push(messagetext);
              } else if (media.mediaType === MediaEnum.VIDEO) {
                const vidurl: VideoUrl = {};
                vidurl.fileUrl = messagetext;
                vidurl.thumbUrl = messagetext;
                // ticketHistoryData.videoUrls.push(vidurl);
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
                docurl.thumbUrl = 'assets/images/common/attachement-blured.png';
                // ticketHistoryData.documentUrls.push(docurl);
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
    } else if (mention?.channelGroup === ChannelGroup.Instagram) {
      if (
        mention?.channelType === ChannelType.InstagramMessages &&
        mention?.messageStatus == WhatsAppMessageStatus.Unsupported
      ) {
        ticketHistoryData.description = 'Unsupported file format';
        ticketHistoryData.imageurls.push('assets/images/Unsupported_File.svg');
      } else if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
          if (mention?.attachmentMetadata.mediaContents.length > 0) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              if (MediaContentItem.mediaType === MediaEnum.IMAGE) {
              if (mention?.channelType == ChannelType.InstagramMessages) {
                if (MediaContentItem?.thumbUrl?.includes('images.locobuzz')) {
                  const mimeType = MimeTypes.getMimeTypefromString(
                    MediaContentItem.thumbUrl.split('.').pop()
                  );
                  const ReplaceText = 'https://images.locobuzz.com/';
                  let ThumbUrl = MediaContentItem.thumbUrl;
                  ThumbUrl = ThumbUrl.replace(ReplaceText, '');
                  const backgroundUrl = this.clickhouseEnabled ? MediaContentItem.mediaUrl  :`${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${ThumbUrl}&MimeType=${mimeType}&FileName=${MediaContentItem.name}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  MediaContentItem.mediaUrl = backgroundUrl;
                } else {
                  const backgroundUrl = `${MediaContentItem.mediaUrl}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                }
              } else {
                let isScontentLinkExpired: boolean = false;
                isScontentLinkExpired = this.isScontentLinkExpire(
                  MediaContentItem.thumbUrl,
                  mention?.channelType
                );
                if (isScontentLinkExpired) {
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/Imageexpired.svg'
                  );
                  //link expired image logic
                } else {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  MediaContentItem.mediaUrl = `${MediaContentItem.thumbUrl}`;
                }
              }
            }
              else if (MediaContentItem.mediaType === MediaEnum.VIDEO) {
            if (MediaContentItem.mediaUrl) {
              let isScontentLinkExpired: boolean = false;
              isScontentLinkExpired = this.isScontentLinkExpire(
                MediaContentItem.mediaUrl,
                mention?.channelType
              );
              if (isScontentLinkExpired) {
                ticketHistoryData.imageurls.push(
                  'assets/images/common/Videoexpired.svg'
                );
                if(this.clickhouseEnabled){
                ticketHistoryData.newThumburls.push('assets/images/common/Videoexpired.svg') }
                //link expired image logic
              } else {
                const vidurl: VideoUrl = {};
                vidurl.fileUrl = MediaContentItem.mediaUrl;
                vidurl.thumbUrl = MediaContentItem.thumbUrl;
                ticketHistoryData.videoUrls.push(vidurl);
                    if(this.clickhouseEnabled){
                        let image = mention?.channelType === ChannelType.InstagramMessages ? 'assets/images/common/Insta_video_thumbnail.svg' : vidurl.thumbUrl
                        if (MediaContentItem.thumbUrl === null || MediaContentItem.thumbUrl.includes('mp4')) {
                          image = 'assets/images/common/Insta_video_thumbnail.svg'
                        }
                        ticketHistoryData.imageurls.push(image)
                        ticketHistoryData.newThumburls.push(image)
                    }
              }
            } else if (
              (MediaContentItem.thumbUrl &&
                MediaContentItem.thumbUrl.includes('.png')) ||
              MediaContentItem.thumbUrl.includes('.jpg') ||
              MediaContentItem.thumbUrl.includes('.jpeg') ||
              MediaContentItem.thumbUrl.includes('.gif')
            ) {
              ticketHistoryData.imageurls.push(MediaContentItem.thumbUrl);
              if(this.clickhouseEnabled){
              ticketHistoryData.newThumburls.push(MediaContentItem.thumbUrl) }
            } else {
              if (MediaContentItem.mediaUrl) {
                let isScontentLinkExpired: boolean = false;
                isScontentLinkExpired = this.isScontentLinkExpire(
                  MediaContentItem.mediaUrl,
                  mention?.channelType
                );
                if (isScontentLinkExpired) {
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/Imageexpired.svg'
                  );
                  if(this.clickhouseEnabled){
                    ticketHistoryData.newThumburls.push('assets/images/common/Imageexpired.svg')
                  }
                  //link expired image logic
                } else {
                  const vidurl: VideoUrl = {};
                  vidurl.fileUrl = MediaContentItem.mediaUrl;
                  vidurl.thumbUrl = MediaContentItem.mediaUrl;
                  ticketHistoryData.videoUrls.push(vidurl);
                if(this.clickhouseEnabled){
                  ticketHistoryData.imageurls.push(vidurl.thumbUrl)
                  ticketHistoryData.newThumburls.push(vidurl.thumbUrl)
                }
                }
              }
            }
          }
              else if (MediaContentItem.mediaType === MediaEnum.URL) {
              if (
                MediaContentItem.mediaUrl &&
                (MediaContentItem.mediaUrl.includes('.png') ||
                  MediaContentItem.mediaUrl.includes('.jpeg') ||
                  MediaContentItem.mediaUrl.includes('.gif'))
              ) {
                const backgroundUrl = `${MediaContentItem.mediaUrl}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
              } else {
                if (MediaContentItem.mediaUrl) {
                  ticketHistoryData.description += ` ${MediaContentItem.mediaUrl}`;
                }
              }
            }
              else if (MediaContentItem.mediaType === MediaEnum.AUDIO) {
              ticketHistoryData.imageurls.push(
                'assets/images/common/AudioMusic.svg'
              );
            }
              else if (MediaContentItem.mediaType === MediaEnum.ANIMATEDGIF) {
              let isScontentLinkExpired: boolean = false;
              isScontentLinkExpired = this.isScontentLinkExpire(
                MediaContentItem.thumbUrl,
                mention?.channelType
              );
              if (isScontentLinkExpired) {
                ticketHistoryData.imageurls.push(
                  'assets/images/common/Imageexpired.svg'
                );
                ticketHistoryData.newThumburls.push('assets/images/common/Imageexpired.svg')
                //link expired image logic
              } else {
                ticketHistoryData.imageurls.push(MediaContentItem.thumbUrl);
                ticketHistoryData.newThumburls.push(MediaContentItem.thumbUrl)
              }
          }
              else if (MediaContentItem.mediaType === MediaEnum.OTHER) {
              if (
                MediaContentItem.mediaUrl &&
                (MediaContentItem.mediaUrl.includes('.png') ||
                  MediaContentItem.mediaUrl.includes('.jpeg') ||
                  MediaContentItem.mediaUrl.includes('.jpg') ||
                  MediaContentItem.mediaUrl.includes('.gif'))
              ) {
                const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                let isScontentLinkExpired: boolean = false;
                isScontentLinkExpired = this.isScontentLinkExpire(
                  MediaContentItem.thumbUrl,
                  mention?.channelType
                );
                if (isScontentLinkExpired) {
                  //link expired image logic
                } else {
                  ticketHistoryData.imageurls.push(backgroundUrl);
                }
              } else if (MediaContentItem.mediaUrl) {
                if (MediaContentItem.mediaUrl.includes('.pdf')) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/pdf.png'
                  );
                  // bind the  pdf url
                } else if (
                  MediaContentItem.mediaUrl.includes('.doc') ||
                  MediaContentItem.mediaUrl.includes('.docx')
                ) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/word.png'
                  );
                } else if (
                  MediaContentItem.mediaUrl.includes('.xls') ||
                  MediaContentItem.mediaUrl.includes('.xlsx')
                ) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/excel-file.png)'
                  );
                } else if (MediaContentItem.mediaUrl.includes('.mp3')) {
                  const backgroundUrl = `${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(
                    'assets/images/common/AudioMusic.svg'
                  );
                } else {
                  // ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
                  // ticketHistoryData.description = MediaContentItem.mediaUrl;
                  // ticketHistoryData.description = linkifyStr(
                  //   MediaContentItem.mediaUrl,
                  //   { target: '_system' }
                  // );
                  ticketHistoryData.description += LocobuzzUtils.checkLinkTag((MediaContentItem.mediaUrl))
                }
              } else {
                if (MediaContentItem.mediaUrl) {
                  // ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
                  // ticketHistoryData.description = MediaContentItem.mediaUrl;
                  // ticketHistoryData.description = linkifyStr(
                  //   MediaContentItem.mediaUrl,
                  //   { target: '_system' }
                  // );
                  ticketHistoryData.description += LocobuzzUtils.checkLinkTag((MediaContentItem.mediaUrl))
                }
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.LinkedIn) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const MediaContentItem of mention?.attachmentMetadata
          .mediaContents) {
          if (MediaContentItem.mediaType === MediaEnum.IMAGE) {
            if (MediaContentItem?.thumbUrl?.includes('images.locobuzz')) {
              ticketHistoryData.imageurls.push(MediaContentItem.thumbUrl);
            } else {
              ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
            }
          } else if (MediaContentItem.mediaType === MediaEnum.ANIMATEDGIF) {
            ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
          } else if (MediaContentItem.mediaType === MediaEnum.VIDEO) {
            const vidurl: VideoUrl = {};
            vidurl.fileUrl = MediaContentItem.mediaUrl;
            vidurl.thumbUrl = MediaContentItem.mediaUrl;
            ticketHistoryData.videoUrls.push(vidurl);
          }
          else if (mention?.mediaType === MediaEnum.PDF) {
            if (
              mention?.attachmentMetadata.mediaContents &&
              mention?.attachmentMetadata.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                .mediaContents) {
                const backgroundUrl = MediaContentItem.mediaUrl;
                // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/pdf.png';
                MediaContentItem.mediaUrl = backgroundUrl;
                ticketHistoryData.documentUrls.push(docurl);
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.Youtube) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata
            .mediaContents) {
            if (MediaContentItem.mediaType === MediaEnum.VIDEO) {

            // Youtube video logic is remaining
            MediaContentItem.mediaUrl = MediaContentItem.mediaUrl.replace(
              'watch?v=',
              'embed/'
            );
            MediaContentItem.mediaUrl = MediaContentItem.mediaUrl.replace(/^http:/, 'https:');

            ticketHistoryData.youtubeSanitizeUrlObject =
              MediaContentItem.mediaUrl.substr(
                MediaContentItem.mediaUrl.lastIndexOf('/') + 1
              );
            // this.sanitzer.bypassSecurityTrustResourceUrl(
            MediaContentItem.mediaUrl;
              }
            // );
            // ticketHistoryData.youtubeUrl=
          }
      }
    } else if (mention?.channelGroup === ChannelGroup.TikTok) {
      if (mention?.mediaType === MediaEnum.VIDEO) {
        if (
          mention?.attachmentMetadata.mediaContents &&
          mention?.attachmentMetadata.mediaContents.length > 0
        ) {
          for (const MediaContentItem of mention?.attachmentMetadata.mediaContents) {
            if (MediaContentItem.thumbUrl) {
              ticketHistoryData.videoIcon = true;
              ticketHistoryData.imageurls.push(MediaContentItem.thumbUrl);
              ticketHistoryData.newThumburls.push(MediaContentItem.thumbUrl)
            } else {
              if (mention?.attachmentMetadata.mediaContents.length > 0) {
                const length = mention?.attachmentMetadata.mediaContents.length;
                const vidurl: VideoUrl = {};
                vidurl.fileUrl =
                  mention?.attachmentMetadata.mediaContents[length - 1].mediaUrl;
                vidurl.thumbUrl =
                  mention?.attachmentMetadata.mediaContents[length - 1].mediaUrl;
                ticketHistoryData.videoUrls.push(vidurl);
                mention.attachmentMetadata.mediaContents = [
                  mention?.attachmentMetadata.mediaContents[length - 1],
                ];
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.GoogleBusinessMessages)
    {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const MediaContentItem of mention?.attachmentMetadata
          .mediaContents) {
          if (MediaContentItem.mediaType === MediaEnum.IMAGE) {
              const backgroundUrl = `${MediaContentItem.thumbUrl}`;
              ticketHistoryData.imageurls.push(backgroundUrl);
            }
        }
      }
    } 
    else if(mention?.channelGroup === ChannelGroup.GoogleMyReview){
          for(const MediaContentItem of mention?.attachmentMetadata?.mediaContents || []){
            if(MediaContentItem.mediaType ===MediaEnum.IMAGE){
              if(MediaContentItem.thumbUrl){
                const backgroundUrl=`${MediaContentItem.thumbUrl}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
              }
              else if(MediaContentItem.mediaUrl){
                  const backgroundUrl=`${MediaContentItem.mediaUrl}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);

              }
              
              else{
                let isScontentLinkExpired : boolean =false;
                isScontentLinkExpired=this.isScontentLinkExpire(MediaContentItem.thumbUrl, mention?.channelType);
                if(isScontentLinkExpired){
                  ticketHistoryData.imageurls.push('assets/images/common/Imageexpired.svg');
                }
                else{
                  const backgroundUrl=`${MediaContentItem.thumbUrl}`;
                  ticketHistoryData.imageurls.push(backgroundUrl);
                  MediaContentItem.mediaUrl=`${MediaContentItem.thumbUrl}`;
                }

              }
            }
            else if(MediaContentItem.mediaType=== MediaEnum.URL){
              if (
                MediaContentItem.mediaUrl &&
                (MediaContentItem.mediaUrl.includes('.png') ||
                  MediaContentItem.mediaUrl.includes('.jpeg') ||
                  MediaContentItem.mediaUrl.includes('.gif'))
              ) {
                const backgroundUrl = `${MediaContentItem.mediaUrl}`;
                ticketHistoryData.imageurls.push(backgroundUrl);
              } else{
                if(MediaContentItem.mediaUrl){
                  ticketHistoryData.description += ` ${MediaContentItem.mediaUrl}`;
                }
              }
            }

          }
    } else if (mention?.channelGroup === ChannelGroup.Telegram) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const MediaContentItem of mention?.attachmentMetadata
          .mediaContents) {
          if (MediaContentItem.mediaType === MediaEnum.IMAGE) {
            if (MediaContentItem?.thumbUrl?.includes('images.locobuzz')) {
              ticketHistoryData.imageurls.push(MediaContentItem.thumbUrl);
            } else {
              ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
            }
          } else if (MediaContentItem.mediaType === MediaEnum.ANIMATEDGIF) {
            ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
          } else if (MediaContentItem.mediaType === MediaEnum.VIDEO) {
            const vidurl: VideoUrl = {};
            vidurl.fileUrl = MediaContentItem.mediaUrl;
            vidurl.thumbUrl = MediaContentItem.mediaUrl;
            ticketHistoryData.videoUrls.push(vidurl);
          }
          else if (mention?.mediaType === MediaEnum.PDF) {
            if (
              mention?.attachmentMetadata.mediaContents &&
              mention?.attachmentMetadata.mediaContents.length > 0
            ) {
              for (const MediaContentItem of mention?.attachmentMetadata
                .mediaContents) {
                const backgroundUrl = MediaContentItem.mediaUrl;
                // const backgroundUrl = `${MediaUrl}/api/WebHook/GetPrivateMediaS3?keyName=${MediaContentItem.mediaUrl}&MimeType=${MediaContentItem.thumbUrl}&FileName=${MediaContentItem.name}`;
                const docurl: DocumentUrl = {};
                docurl.fileName = MediaContentItem.name;
                docurl.fileUrl = backgroundUrl;
                docurl.thumbUrl = 'assets/images/common/pdf.png';
                MediaContentItem.mediaUrl = backgroundUrl;
                ticketHistoryData.documentUrls.push(docurl);
              }
            }
          }
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.Reddit) {
      const attachmentMetadata = mention?.attachmentMetadata;

      if (attachmentMetadata?.mediaContents?.length) {
      
        for (const MediaContentItem of attachmentMetadata?.mediaContents) {
      
          if (MediaContentItem.mediaType === MediaEnum.IMAGE) {
            if (MediaContentItem?.thumbUrl?.includes('images.locobuzz')) { ticketHistoryData.imageurls.push(MediaContentItem.thumbUrl); } 
            else { ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl); }
          } else if (MediaContentItem.mediaType === MediaEnum.VIDEO) {
            const vidurl: VideoUrl = {};
            vidurl.fileUrl = MediaContentItem.mediaUrl;
            vidurl.thumbUrl = MediaContentItem.mediaUrl;
            ticketHistoryData.videoUrls.push(vidurl);
          }
        }
      }
    }
    else if (mention?.mediaType === MediaEnum.OTHER) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        for (const MediaContentItem of mention?.attachmentMetadata
          .mediaContents) {
          if (
            MediaContentItem.mediaUrl &&
            (MediaContentItem.mediaUrl.includes('.png') ||
              MediaContentItem.mediaUrl.includes('.jpeg') ||
              MediaContentItem.mediaUrl.includes('.gif'))
          ) {
            ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
          } else if (
            MediaContentItem.mediaUrl &&
            MediaContentItem.mediaUrl.includes('.mp4')
          ) {
            const vidurl: VideoUrl = {};
            vidurl.fileUrl = MediaContentItem.mediaUrl;
            vidurl.thumbUrl = MediaContentItem.mediaUrl;
            ticketHistoryData.videoUrls.push(vidurl);
          } else if (MediaContentItem.mediaUrl) {
            if (MediaContentItem.mediaUrl.includes('.pdf')) {
              const docurl: DocumentUrl = {};
              docurl.fileName = MediaContentItem.name;
              docurl.fileUrl = MediaContentItem.mediaUrl;
              docurl.thumbUrl = 'assets/images/common/pdf.png';
              ticketHistoryData.documentUrls.push(docurl);
            } else if (
              MediaContentItem.mediaUrl.includes('.doc') ||
              MediaContentItem.mediaUrl.includes('.docx')
            ) {
              const docurl: DocumentUrl = {};
              docurl.fileName = MediaContentItem.name;
              docurl.fileUrl = MediaContentItem.mediaUrl;
              docurl.thumbUrl = 'assets/images/common/word.png';
              ticketHistoryData.documentUrls.push(docurl);
            } else if (
              MediaContentItem.mediaUrl.includes('.xls') ||
              MediaContentItem.mediaUrl.includes('.xlsx')
            ) {
              const docurl: DocumentUrl = {};
              docurl.fileName = MediaContentItem.name;
              docurl.fileUrl = MediaContentItem.mediaUrl;
              docurl.thumbUrl = 'assets/images/common/excel-file.png';
              ticketHistoryData.documentUrls.push(docurl);
            } else {
              ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
            }
          } else {
            if (MediaContentItem.mediaUrl) {
              ticketHistoryData.imageurls.push(MediaContentItem.mediaUrl);
            }
          }
        }
      }
    }
    if (mention?.channelGroup === ChannelGroup.Voice) {
      if (
        mention?.attachmentMetadata.mediaContents &&
        mention?.attachmentMetadata.mediaContents.length > 0
      ) {
        if (mention?.mediaType === MediaEnum.AUDIO) {
          if (
            mention?.attachmentMetadata.mediaContents &&
            mention?.attachmentMetadata.mediaContents.length > 0
          ) {
            for (const MediaContentItem of mention?.attachmentMetadata
              .mediaContents) {
              ticketHistoryData.voipAudioUrls.push(MediaContentItem.mediaUrl);
            }
            ticketHistoryData.imageurls = [];
          }
        }
      }
    }
    if (mention?.mediaType === MediaEnum.POLL) {
      // Twitter Polls remaining
    }
    ticketHistoryData.imageurls = ticketHistoryData.imageurls.filter(
      (obj) => obj != 'null'
    );

    // if (ticketHistoryData?.imageurls?.length>0 && (ticketHistoryData?.imageurls?.length + ticketHistoryData?.videoUrls?.length) > 4) {
    //   ticketHistoryData.videoUrls.forEach((item)=>{
    //     if (ticketHistoryData.imageurls.indexOf(item.thumbUrl) === -1) {
    //       ticketHistoryData.imageurls.push(item.thumbUrl)
    //       ticketHistoryData.newThumburls?.push(item.thumbUrl)
    //     }
    //   })
    // }
    if (mention?.channelGroup === ChannelGroup.Facebook || mention?.channelGroup === ChannelGroup.Twitter ||  (this.clickhouseEnabled  && mention?.channelGroup === ChannelGroup.Instagram)) {
      ticketHistoryData.videoUrls = [] 
    }
    
    return ticketHistoryData;
  }
  linkify(input: string): string {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return input.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_system">${url}</a>`;
  });
  }

  SetNote(
    currentUser: AuthUser,
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention,
    MediaUrl
  ): any {
    if (
      mention?.makerCheckerMetadata.workflowStatus !==
        LogStatus.ReplySentForApproval &&
      mention?.makerCheckerMetadata.workflowStatus !== LogStatus.ReplyScheduled
    ) {
      if (mention?.channelGroup === ChannelGroup.Email) {
        if (
          mention?.makerCheckerMetadata.workflowStatus ===
            LogStatus.ReplyRejected &&
          +currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
          +currentUser.data.user.role !== UserRoleEnum.BrandAccount
        ) {
          ticketHistoryData.rejectedNote =
            mention?.ticketInfo !== null && mention?.ticketInfo.lastNote
              ? mention?.ticketInfo.lastNote
                  .replace('\n', '')
                  .replace('<p>', '')
                  .replace('</p>', '')
              : '';
        } else {
          if (
            mention?.ticketInfo.lastNote &&
            mention?.makerCheckerMetadata.workflowStatus !==
              LogStatus.ReplyTextModified
          ) {
            ticketHistoryData.LastNote = mention?.ticketInfo.lastNote;
          }

          if (mention?.latestResponseTime) {
            ticketHistoryData.lastReply = mention?.latestResponseTime;
          }
        }
      } else {
        if (
          mention?.makerCheckerMetadata.workflowStatus ===
            LogStatus.ReplyRejected &&
          +currentUser.data.user.role !== UserRoleEnum.CustomerCare &&
          +currentUser.data.user.role !== UserRoleEnum.BrandAccount
        ) {
          ticketHistoryData.rejectedNote = mention?.ticketInfo.lastNote;
        } else {
          if (
            mention?.ticketInfo.lastNote &&
            mention?.makerCheckerMetadata.workflowStatus !==
              LogStatus.ReplyTextModified
          ) {
            ticketHistoryData.LastNote = mention?.ticketInfo.lastNote;
          }

          if (mention?.latestResponseTime) {
            ticketHistoryData.LastNote = mention?.ticketInfo.lastNote;
          }
        }
      }
    }
    return ticketHistoryData;
  }
  getEmailHtmlData(
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    const source = this.MapLocobuzz.mapMention(mention);
    const object = {
      BrandInfo: source.brandInfo,
      TagId: source.tagID,
    };

    this._ticketService.getEmailHtmlData(object).subscribe((data) => {
      if (data.success) {
        ticketHistoryData.htmlData = data.data;
      }
    });

    return ticketHistoryData;
  }

  isJSON(val: any): boolean {
    if (typeof val != 'string') {
      val = JSON.stringify(val);
    }

    try {
      JSON.parse(val);
      return true;
    } catch (e) {
      return false;
    }
  }

  setOpenPostLink(mention: BaseMention, openReply: boolean): any {
    let userpostLink = '';
    if (mention?.channelGroup === ChannelGroup.LinkedIn) {
      if (mention?.parentPostSocialID != null) {
        try {
          //const userpost = mention?.parentPostSocialID.split('-');
          userpostLink = `https://www.linkedin.com/feed/update/${mention?.parentPostSocialID}`;
        } catch (Exception) {
          const userpost = mention?.parentPostSocialID.split('-');
          const LinkedInParentPostSocialID =
            userpost.length === 3
              ? userpost[2]
              : userpost.length === 2
              ? userpost[1]
              : userpost.length === 1
              ? userpost[0]
              : '';
          userpostLink = `https://www.linkedin.com/feed/update/${LinkedInParentPostSocialID}`;
        }
      } else {
        try {
          //const userpost = mention?.socialID.split('-');
          userpostLink = `https://www.linkedin.com/feed/update/${mention?.socialID}`;
        } catch (Exception) {
          const userpost = mention?.socialID.split('-');
          const LinkedInParentPostSocialID =
            userpost.length === 3
              ? userpost[2]
              : userpost.length === 2
              ? userpost[1]
              : userpost.length === 1
              ? userpost[0]
              : '';
          userpostLink = `https://www.linkedin.com/feed/update/${LinkedInParentPostSocialID}`;
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.Youtube) {
      if (mention?.channelType === ChannelType.YouTubeComments) {
        userpostLink = `http://www.youtube.com/watch?v=${mention?.parentPostSocialID}&lc=${mention?.socialID}`;
      } else {
        userpostLink = `http://www.youtube.com/watch?v=${mention?.socialID}`;
      }
    } else if (mention?.channelGroup === ChannelGroup.Twitter) {
      if (mention?.channelType !== 17) {
        userpostLink = `http://twitter.com/${mention?.author.screenname}/status/${mention?.socialID}`;
      }
    } else if (mention?.channelGroup === ChannelGroup.Facebook) {
      if (mention?.channelType !== 40) {
        userpostLink = `http://www.facebook.com/${mention?.socialID}`;
        if (mention?.channelType === ChannelType.FBComments && mention?.author?.name?.toLowerCase() == 'anonymous') {
          userpostLink = `http://www.facebook.com/${mention?.parentPostSocialID}`;
        }
      }
    } else if (mention?.channelGroup === ChannelGroup.GooglePlayStore) {
      if (openReply) {
        userpostLink = this._postDetailService.playstoreurl;
      } else if (mention?.url) {
        userpostLink = mention?.url;
      }
    } else if (mention?.channelGroup === ChannelGroup.TikTok) {
      userpostLink = `https://www.tiktok.com/@${mention?.author.name}/video/${mention?.parentPostSocialID ? mention?.parentPostSocialID : mention?.socialID}`;
    } else if (mention?.channelType !== ChannelType.Email) {
      if (mention?.url) {
        userpostLink = mention?.url;
      }
    }

    return userpostLink;
  }

  togglePostfootClasses(
    postData: BaseMention,
    ticketPriority: string,
    post: TicketClient
  ): any {
    const postdata = this._filterService.fetchedBrandData.find(
      (brand: BrandList) => +brand.brandID === postData?.brandInfo.brandID
    );

    let crmClass = '';
    let priorityClass = '';
    let statusClass = '';
    if (postdata) {
      if (postdata?.crmActive) {
        if (postData?.ticketInfoCrm?.sRID !== null) {
          crmClass = 'colored__red';
          if (postData?.ticketInfoCrm?.isPartyID > 0) {
            crmClass = 'colored__yellow--dark';
          }
        }
      }
    }

    if (ticketPriority === 'Urgent') {
      priorityClass = 'colored__red--dark';
    } else if (ticketPriority === 'High') {
      priorityClass = 'colored__red';
    } else if (ticketPriority === 'Medium') {
      priorityClass = 'colored__yellow';
    } else if (ticketPriority === 'Low') {
      priorityClass = 'colored__main-text';
    }

    if (post?.ticketStatus === 'Open') {
      statusClass = 'colored__locobuzz';
    } else if (
      post?.ticketStatus === 'OnHoldAgent' ||
      post?.ticketStatus === 'OnHoldCSD' ||
      post?.ticketStatus === 'OnHoldBrand' ||
      post?.ticketStatus === 'OnHoldBrandWithNewMention' ||
      post?.ticketStatus === 'CustomerInfoAwaited'
    ) {
      statusClass = 'colored__red';
    } else if (
      postData?.ticketInfo.status ===
        TicketStatus.PendingwithCSDWithNewMention ||
      postData?.ticketInfo.status ===
        TicketStatus.PendingWithBrandWithNewMention ||
      postData?.ticketInfo.status === TicketStatus.PendingWithBrand ||
      postData?.ticketInfo.status === TicketStatus.PendingwithCSD
    ) {
      statusClass = 'colored__yellow--dark';
    } else if (postData?.ticketInfo.status === TicketStatus.Close) {
      statusClass = 'colored__red';
    }

    const obj = {
      crmClass,
      priorityClass,
      statusClass,
    };

    return obj;
  }

  setConditionsFromCommunicationLog(
    currentUser: AuthUser,
    ticketHistoryData: AllBrandsTicketsDTO,
    postData: BaseMention
  ): any {
    let IsCSDUser = false;
    let IsReadOnlySupervisor = false;
    ticketHistoryData.communicationLogProperty = {};
    ticketHistoryData.communicationLogProperty.likeCount = '0';
    ticketHistoryData.communicationLogProperty.shareCount = '0';
    ticketHistoryData.communicationLogProperty.commentCount = '0';
    ticketHistoryData.communicationLogProperty.showLikeShareBox = true;
    ticketHistoryData.communicationLogProperty.likeStatus = false;
    ticketHistoryData.communicationLogProperty.retweetStatus = false;
    ticketHistoryData.communicationLogProperty.reTweetEnabled = false;

    if (
      +currentUser.data.user.role === UserRoleEnum.CustomerCare ||
      +currentUser.data.user.role === UserRoleEnum.BrandAccount
    ) {
      IsCSDUser = true;
    }

    if (+currentUser.data.user.role === UserRoleEnum.ReadOnlySupervisorAgent) {
      IsReadOnlySupervisor = true;
    }
    ticketHistoryData.isAddDisableClass = false;
    ticketHistoryData.isDeletedMentionDisable = false;
    if (postData?.isDeletedFromSocial) {
      // addDisableClass = "CheckboxDisable";
      ticketHistoryData.isDeletedMentionDisable = true;
    }

    if (!postData?.isActionable) {
      ticketHistoryData.isAddDisableClass = true;
    }
    ticketHistoryData.communicationLogProperty.mentionId = `${postData?.brandInfo.brandID}/${postData?.channelType}/${postData?.id}`;
    const ActionButton = currentUser.data.user.actionButton;
    ticketHistoryData.communicationLogProperty.likeEnabled =
      ActionButton.likeEnabled;
    if (postData?.channelGroup === ChannelGroup.Twitter) {
      if (postData?.channelType !== ChannelType.DirectMessages) {
        if (ActionButton.likeEnabled) {
          if (postData?.likeStatus) {
            ticketHistoryData.communicationLogProperty.likeStatus = true;
            if (+postData?.mentionMetadata.likeCount > 0) {
              ticketHistoryData.communicationLogProperty.likeCount =
                this.kFormatter(+postData?.mentionMetadata.likeCount);
            }
          } else {
            if (+postData?.mentionMetadata.likeCount > 0) {
              ticketHistoryData.communicationLogProperty.likeCount =
                this.kFormatter(+postData?.mentionMetadata.likeCount);
            }
          }
        }

        if (ActionButton.retweetEnabled) {
          ticketHistoryData.communicationLogProperty.reTweetEnabled = true;
          if (postData?.isShared) {
            if (+postData?.mentionMetadata.shareCount > 0) {
              ticketHistoryData.communicationLogProperty.shareCount =
                this.kFormatter(+postData?.mentionMetadata.shareCount);
            }
            ticketHistoryData.communicationLogProperty.retweetStatus = true;
          } else {
            if (+postData?.mentionMetadata.shareCount > 0) {
              ticketHistoryData.communicationLogProperty.shareCount =
                this.kFormatter(+postData?.mentionMetadata.shareCount);
            }
          }
        }
      }
      if (postData?.mentionMetadata.commentCount > 0) {
        if (postData?.channelType === ChannelType.BrandTweets) {
          ticketHistoryData.communicationLogProperty.commentCount =
            this.kFormatter(+postData?.mentionMetadata.commentCount);
        } else {
          ticketHistoryData.communicationLogProperty.commentCount =
            this.kFormatter(+postData?.mentionMetadata.commentCount);
        }
      }
    }
    if (postData?.channelGroup === ChannelGroup.Facebook) {
      if (!IsReadOnlySupervisor) {
        if (
          postData?.channelType !== ChannelType.FBMessages &&
          ActionButton.likeEnabled
        ) {
          if (postData?.likeStatus) {
            if (+postData?.mentionMetadata.likeCount > 0) {
              ticketHistoryData.communicationLogProperty.likeCount =
                this.kFormatter(+postData?.mentionMetadata.likeCount);
            }
            ticketHistoryData.communicationLogProperty.likeStatus = true;
          } else {
            if (+postData?.mentionMetadata.likeCount > 0) {
              ticketHistoryData.communicationLogProperty.likeCount =
                this.kFormatter(+postData?.mentionMetadata.likeCount);
            }
          }
        }
        if (postData?.mentionMetadata.shareCount > 0) {
          ticketHistoryData.communicationLogProperty.shareCount =
            this.kFormatter(+postData?.mentionMetadata.shareCount);
        }
        if (postData?.mentionMetadata.commentCount > 0) {
          if (postData?.channelType !== ChannelType.FBPublic) {
            ticketHistoryData.communicationLogProperty.commentCount =
              this.kFormatter(+postData?.mentionMetadata.commentCount);
          } else {
            ticketHistoryData.communicationLogProperty.commentCount =
              this.kFormatter(+postData?.mentionMetadata.commentCount);
          }
        }
      } else {
        ticketHistoryData.communicationLogProperty.showLikeShareBox = false;
      }
    }
    if (postData?.channelGroup === ChannelGroup.Youtube) {
      if (ActionButton.likeEnabled) {
        if (postData?.channelType === ChannelType.YouTubePosts) {
          if (postData?.likeStatus) {
            ticketHistoryData.communicationLogProperty.likeStatus = true;
            // <strong><i class="fa fa-thumbs-up"></i></strong>
          } else {
            // <strong><i class="fa fa-thumbs-up"></i></strong>
          }
          if (postData?.dislikeStatus) {
            // <strong><i class="fa fa-thumbs-down"></i></strong>
          } else {
            // <strong><i class="fa fa-thumbs-down"></i></strong>
          }
        }
        if (postData?.mentionMetadata.commentCount > 0) {
          ticketHistoryData.communicationLogProperty.commentCount =
            this.kFormatter(+postData?.mentionMetadata.commentCount);
        }
      }
    }
    if (postData?.channelGroup === ChannelGroup.Instagram) {
      if (ActionButton.likeEnabled) {
        if (postData?.channelType === ChannelType.InstagramPagePosts) {
          if (postData?.likeStatus) {
            if (+postData?.mentionMetadata.likeCount > 0) {
              ticketHistoryData.communicationLogProperty.likeCount =
                this.kFormatter(+postData?.mentionMetadata.likeCount);
            }
            ticketHistoryData.communicationLogProperty.likeStatus = true;
          } else {
            if (+postData?.mentionMetadata.likeCount > 0) {
              ticketHistoryData.communicationLogProperty.likeCount =
                this.kFormatter(+postData?.mentionMetadata.likeCount);
            }
          }
        }
        if (postData?.mentionMetadata.commentCount > 0) {
          ticketHistoryData.communicationLogProperty.commentCount =
            this.kFormatter(+postData?.mentionMetadata.commentCount);
        }
      }
    }

    return ticketHistoryData;
  }

  setReplyHoverIcon(
    ticketHistoryData: AllBrandsTicketsDTO,
    mention: BaseMention
  ): any {
    // if (
    //   mention?.channelGroup === ChannelGroup.Blogs ||
    //   mention?.channelGroup === ChannelGroup.AppStoreReviews ||
    //   mention?.channelGroup === ChannelGroup.Booking ||
    //   mention?.channelGroup === ChannelGroup.ComplaintWebsites ||
    //   mention?.channelGroup === ChannelGroup.DiscussionForums ||
    //   mention?.channelGroup === ChannelGroup.ECommerceWebsites ||
    //   mention?.channelGroup === ChannelGroup.Email ||
    //   mention?.channelGroup === ChannelGroup.Expedia ||
    //   mention?.channelGroup === ChannelGroup.GoogleMyReview ||
    //   mention?.channelGroup === ChannelGroup.GooglePlayStore ||
    //   mention?.channelGroup === ChannelGroup.GooglePlus ||
    //   mention?.channelGroup === ChannelGroup.HolidayIQ ||
    //   mention?.channelGroup === ChannelGroup.MakeMyTrip ||
    //   mention?.channelGroup === ChannelGroup.News ||
    //   mention?.channelGroup === ChannelGroup.ReviewWebsites ||
    //   mention?.channelGroup === ChannelGroup.TeamBHP ||
    //   mention?.channelGroup === ChannelGroup.TripAdvisor ||
    //   mention?.channelGroup === ChannelGroup.Videos ||
    //   mention?.channelGroup === ChannelGroup.WhatsApp ||
    //   mention?.channelGroup === ChannelGroup.WebsiteChatBot ||
    //   mention?.channelGroup === ChannelGroup.Zomato
    // ) {
    //   if (mention?.isBrandPost) {
    //     ticketHistoryData.replyString = `Reply sent from ${
    //       ChannelGroup[mention?.channelGroup]
    //     }`;
    //     ticketHistoryData.replyTicketIcon =
    //       ChannelImage[ChannelGroup[mention?.channelGroup]];
    //     if (mention?.ticketInfo.replyUseid > 0) {
    //       ticketHistoryData.replyString = `Reply sent from Locobuzz`;
    //       ticketHistoryData.replyTicketIcon =
    //         '/assets/social-mention/post/logo-icon.png';
    //     }
    //   }
    // }

    if (
      mention?.channelGroup === ChannelGroup.Facebook ||
      mention?.channelGroup === ChannelGroup.Instagram ||
      mention?.channelGroup === ChannelGroup.Twitter ||
      mention?.channelGroup === ChannelGroup.Youtube ||
      mention?.channelGroup === ChannelGroup.LinkedIn
    ) {
      if (mention?.isBrandPost) {
        ticketHistoryData.replyString = this.translate.instant('Reply-sent-from', { channel: this.translate.instant(ChannelGroup[mention?.channelGroup]) });
        ticketHistoryData.replyTicketIcon =
          ChannelImage[ChannelGroup[mention?.channelGroup]];
        if (mention?.ticketInfo.replyUseid > 0 || mention?.ticketInfo.replyUseid === -1 || mention?.ticketInfo?.replyUseid === -4) {
          ticketHistoryData.replyString = this.translate.instant('Reply-sent-from-Locobuzz');
          ticketHistoryData.replyTicketIcon =
            '/assets/social-mention/post/logo-icon.png';
        }
      }
    }

    return ticketHistoryData;
  }

  kFormatter(num): any {
    return Math.abs(num) > 999
      ? Math.sign(num) * +(Math.abs(num) / 1000).toFixed(1) + 'k'
      : Math.sign(num) * Math.abs(num);
  }

  setLanguageDetected(
    pageType: PostsType,
    ticketHistoryData: AllBrandsTicketsDTO,
    postData: BaseMention
  ) {
    if (pageType === PostsType.Mentions) {
      ticketHistoryData.showLanguageIcon = true;
      ticketHistoryData.languageName =
        postData?.languageName != null ? postData?.languageName : 'Undetected';
    } else {
      ticketHistoryData.showLanguageIcon = false;
    }
    return ticketHistoryData;
  }

  setDeletedTicketIcon(
    ticketHistoryData: AllBrandsTicketsDTO,
    postData: BaseMention
  ) {
    if (
      postData?.ticketInfo.ticketProcessStatus != null &&
      postData?.ticketInfo.ticketProcessStatus ==
        ReplyProcess.ProcessCompletedWithError
    ) {
      if (postData?.ticketInfo.ticketProcessNote) {
        ticketHistoryData.ticketProcessNoteFlag = true;
        ticketHistoryData.ticketProcessNote =
          postData?.ticketInfo.ticketProcessNote;
      }
    }
    return ticketHistoryData;
  }

  setAuthorName(post: TicketClient, postData: BaseMention,currentUser:AuthUser) {
    if (!postData?.author.name || postData?.author.name == '') {
      if (postData?.channelGroup == ChannelGroup.Voice) {
        post.Userinfo.name = postData?.author?.socialId;
      } else {
        if ((currentUser?.data?.user?.isListening) && (!currentUser?.data?.user?.isORM) && (currentUser?.data?.user?.isClickhouseEnabled==1))
          {
          if (postData?.channelGroup == ChannelGroup.GooglePlayStore || postData?.channelGroup == ChannelGroup.AppStoreReviews)
            {
            post.Userinfo.name = 'Developer';
            }else
            {
            post.Userinfo.name = 'Anonymous';
            }
          }else
          {
          post.Userinfo.name = 'Anonymous';
          }
      }
    }
    return post;
  }

  setFooterIconsForParentPost(
    ticketHistoryData: AllBrandsTicketsDTO,
    isParentPostPopup: boolean = false
  ) {
    if (isParentPostPopup) {
      ticketHistoryData.isCreateTicketVisible = false;
      ticketHistoryData.isEscalateVisible = false;
      ticketHistoryData.isAttachTicketVisible = false;
      ticketHistoryData.isSubscribe = false;
      ticketHistoryData.isReplyVisible = false;
      ticketHistoryData.isForwardVisible = false;
    }
    return ticketHistoryData;
  }

  isScontentLinkExpire(mediaUrl: string, channelType: ChannelType) {
    // https://video-yyz1-1.cdninstagram.com/v/t50.31694-16/192392977_165938305394794_5211220240356378107_n.mp4?_nc_cat=108&ccb=1-3&_nc_sid=8ae9d6&_nc_ohc=BcIH6ZRWKxUAX-fnjJS&_nc_ht=video-yyz1-1.cdninstagram.com&oh=57e6014d31701ac43930b38a85388898&oe=60B1EA3A
    /Here in the above link -> oe=60B1EA3A  -> is hexadecimal epoch -> we need to convert to decimal./;

    let isExpired: boolean = false;
    try {
      if (
        mediaUrl &&
        mediaUrl.indexOf('s3.amazonaws') == -1 &&
        mediaUrl.indexOf('images.locobuzz.com') == -1
      ) {
        const tokens: string[] = mediaUrl.split('&');
        const HexDecimalCode = tokens.filter((x) => x.includes('oe='));
        if (
          HexDecimalCode != null &&
          HexDecimalCode.length > 0 &&
          HexDecimalCode[0].startsWith('oe=')
        ) {
          let DecimalEpoch: number = 0;
          if (HexDecimalCode.length > 0) {
            const HexDecimalTime: string = HexDecimalCode[0].replace('oe=', '');
            DecimalEpoch = parseInt(HexDecimalTime, 16);
          }
          // DateTimeOffset.Now.ToUnixTimeSeconds()
          if (
            moment().unix() > DecimalEpoch &&
            DecimalEpoch > 0 &&
            (channelType == ChannelType.InstagramPagePosts ||
              channelType == ChannelType.InstagramPublicPosts ||
              channelType == ChannelType.InstagramUserPosts ||
              channelType == ChannelType.InstagramComments ||
              channelType == ChannelType.FBPageUser ||
              channelType == ChannelType.FBPublic ||
              channelType == ChannelType.FBComments ||
              channelType == ChannelType.FbMediaPosts ||
              channelType == ChannelType.FBMediaComments ||
              channelType == ChannelType.FBReviews)
          ) {
            isExpired = true;
          }
        }
      }
    } catch (exception) {
      return false;
    }

    return isExpired;
  }

  setGmbLocationAndLocality(
    ticketHistoryData: AllBrandsTicketsDTO,
    postData: BaseMention
  ): AllBrandsTicketsDTO {
    if (postData?.channelGroup == ChannelGroup.GoogleMyReview) {
      ticketHistoryData.StoreCode = postData?.storeCode;
      ticketHistoryData.locality = postData?.locality;
      ticketHistoryData.locationName = postData?.locationName;
    }
    return ticketHistoryData;
  }
  setVoipIcons(
    user: AuthUser,
    pageType: PostsType,
    ticketHistoryData: AllBrandsTicketsDTO,
    postData: BaseMention
  ): AllBrandsTicketsDTO {
    if (postData?.channelGroup == ChannelGroup.Voice) {
      // ticketHistoryData = this.SetDefaultTicketHistoryData(ticketHistoryData, user);
      ticketHistoryData.isDeleteFromLocobuzz=true;
      ticketHistoryData.isAttachTicketVisible=true;
      ticketHistoryData.isCreateTicketVisible=true;
      ticketHistoryData.isSubscribe=true;
      // ticketHistoryData.isDirectCloseVisible=true;
      ticketHistoryData.isEscalateVisible=true;
      ticketHistoryData.sendmailallmention=false;
      ticketHistoryData.isAcknowledge=false;
      ticketHistoryData.isReplyVisible=false;
      ticketHistoryData.isTranslationVisible=false;
      ticketHistoryData.isForwardVisible=false;
      ticketHistoryData.isVOIPBrand=false
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == String(postData?.brandInfo.brandID)
      );
      ticketHistoryData.isVOIPBrand = brandInfo?.isVOIPBrand;
      // ticketHistoryData.isworkflowApproveVisible= false
      // ticketHistoryData.isworkflowRejectVisible = false
      // ticketHistoryData.isSimulationSSRE = false
      // ticketHistoryData.isLiveSSRE = false
      // ticketHistoryData.isApproveRejectMakerChecker = false
    }
    return ticketHistoryData;
  }
  getAudioDuration(url) {
    // this._ngZone.run(() => {
    let audioDuration: any;
    var au = document.createElement('audio');
    au.src = url;
    au.addEventListener(
      'loadedmetadata',
      async () => {
        audioDuration = moment.utc(au.duration * 1000).format('mm:ss');
      },
      false
    );
    return audioDuration;
    // })
  }
  getStartEndTime(time, duration) {
    // this._ngZone.run(() => {
    // })
  }
  setEmailWhitelist(brandInfo: BrandList, ticketHistoryData: AllBrandsTicketsDTO) {
    if (brandInfo) {
      ticketHistoryData.showBlackList = brandInfo.isEmailWhitelistingEnabled;
    }
  }
}

