import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import {
  VoiceCallEventsEnum,
  VoiceCallTypeEnum,
} from 'app/core/enums/VoiceCallEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { TicketInfo } from 'app/core/models/crm/CRMMentionMetaData';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { AttachmentMetadata } from 'app/core/models/viewmodel/AttachmentMetadata';
import { mediaObj } from 'app/core/models/viewmodel/ChatWindowDetails';
import { CallObj } from 'app/core/models/viewmodel/VoiceCall';
import { time } from 'console';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterService } from './filter.service';
import { PostDetailService } from './post-detail.service';

@Injectable({
  providedIn: 'root',
})
export class VoiceCallService {
  currentUser: AuthUser;
  callee = '';
  caller = '';
  callObj: CallObj = {
    agentContactNo: 'none',
    customerContactNo: 'none',
    status: 'Connecting...',
    callLog: '',
    callConnectedOn: '',
    callType: 'none',
    callRecordUrl: 'none',
    callStatusFlag: true,
    callHeader: '',
    agentName: '',
    customerName: '',
    callEventType: '',
    callPickStatus: false,
    isCallDisconnect: false,
    startTime:'',
    endTime:'',
    calledOnText:'',
    ivrSelectedNum: '',
    ivrSelectedDesc: '',
    agentProfilePic: ''
  };
  onCallSignalR = new BehaviorSubject<any>(false);
  onCallDisconnect = new Subject<any>();
  onCallConnect = new Subject<any>();
  onCallPick = new Subject<any>();
  openCallDetailWindow = new BehaviorSubject<any>(false);
  onSaveVoipSetting = new BehaviorSubject<any>(false);
  onDeleteVoipAgents = new Subject<any>();
  /* onReassignVoipAgent = new Subject<any>(); */
  onReassignVoipAgentSignal = signal<any>(null);
  onUpdatePhoneNumber = new Subject<any>();
  onSelectIVRDesc = new Subject<any>();
  // onPerformAction = new Subject<any>();
  makeCallParams;
  voiceBrandData;
  voiceMentionBrand:any;
  // voiceEventEnum = VoiceCallEventsEnum
  // callTypeEnum =VoiceCallTypeEnum


  constructor(
    private _http: HttpClient,
    private _filterService: FilterService,
    private _postDetailService: PostDetailService,
  ) {
  }

  connect(): void { }
  disconnect(): void { }
  reject(): void { }
  ignore(): void { }
  mute(): void { }

  voipSignalR(voipResponse) {
    // if (voipResponse) {
      if (!this.callObj) {
        this.assignCallObjData()
      }
      if (voipResponse?.message?.call_direction === "Outgoing" || voipResponse?.message?.call_direction === "Outbound") {
        this.callOutgoingVoiceEvents(voipResponse?.message)
      }
      else {
        this.callIncomingVoiceEvents(voipResponse?.message)
      }

    // }
  }
  callOutgoingVoiceEvents(message) {
    switch (message.event_type) {
      case 'AGENT_CALL':
        this.callObj.agentContactNo = message?.agent_number
        this.callObj.agentName = message?.agentName
        this.callObj.agentProfilePic = message?.agentProfilePic
        this.callObj.status = 'Connecting...'
        this.callObj.callStatusFlag = true
        this.callObj.calledOn = message?.account_number
        this.callObj.calledOnText = 'Called on '
        this.callObj.callEventType = 'outbound',
        this.callObj.callType = VoiceCallTypeEnum.Outbound
        this.callObj.callHeader = 'Calling to '
        // this.callObj.ivrSelectedNum = message?.dtmf_input
        // this.callObj.callConnectedOn = message?.event_Date_UTC
        this.onCallPick.next('outbound');
        this.onCallDisconnect.next(false);
        break;
      case 'AGENT_ANSWER':
        this.callObj.status = 'Connecting...';
        this.callObj.callType = VoiceCallTypeEnum.Outbound;
        this.callObj.callEventType = VoiceCallEventsEnum.AgentAnswer;
        // this.callObj.callConnectedOn = message?.event_Date_UTC
        this.onCallPick.next(VoiceCallEventsEnum.AgentAnswer);
        break;
      case 'CUSTOMER_CALL':
        this.callObj.customerContactNo = message?.customer_number;
        this.callObj.callEventType = VoiceCallEventsEnum.CustomerCall;
        this.callObj.status = 'Connecting...';
        // this.callObj.callConnectedOn = message?.event_Date_UTC
        this.callObj.callType = VoiceCallTypeEnum.Outbound;
        this.onCallPick.next(VoiceCallEventsEnum.CustomerCall);
        break;
      case 'CUSTOMER_ANSWER':
        this.callObj.customerContactNo = message?.customer_number;
        this.callObj.status = 'Connected...';
        this.callObj.callEventType = VoiceCallEventsEnum.CustomerAnswer;
        // this.callObj.callConnectedOn = message?.event_Date_UTC
        this.callObj.callType = VoiceCallTypeEnum.Outbound;
        this.onCallPick.next(VoiceCallEventsEnum.CustomerAnswer);
        break;
      case 'BRIDGE':
        this.callObj.callEventType = VoiceCallEventsEnum.OutboundBridge
        this.callObj.callConnectedOn = message?.event_Date_UTC
        // this.callObj.callHeader = 'Call with '
        // this.callObj.callLog = message?.event_Date_UTC
        this.callObj.startTime = message?.event_Date_UTC
        this.callObj.callType = VoiceCallTypeEnum.Outbound
        this.onCallPick.next(VoiceCallEventsEnum.OutboundBridge);
        break;
      case 'HANGUP':
        this.callObj.callStatusFlag = false;
        this.callObj.isCallDisconnect = true;
        this.callObj.callEventType = VoiceCallEventsEnum.OutboundHangup;
        this.callObj.callHeader = 'Call ended with ';
        this.callObj.status = 'Disonnected...';
        this.callObj.endTime = message?.event_Date_UTC;
        this.callObj.callType = VoiceCallTypeEnum.Outbound;
        this.onCallPick.next(VoiceCallEventsEnum.OutboundHangup);
        break;
      case 'CDR':
        this.callObj.callEventType = VoiceCallEventsEnum.OutboundCDR
        this.callObj.callRecordUrl = message?.resource_url
        // this.callObj.callLog = message?.event_Date_UTC
        // this.callObj.callDuration = this.getTimeDiff(message?.call_duration)
        this.callObj.isCallDisconnect = true;
        this.callObj.callType = VoiceCallTypeEnum.Outbound;
        this.onCallPick.next(VoiceCallEventsEnum.OutboundCDR);
        this.onCallDisconnect.next(true);
        break;
    }
  }

  callIncomingVoiceEvents(message) {
    switch (message.event_type) {
      case 'ORIGINATE':
        this.callObj.callType = VoiceCallTypeEnum.Inbound
        this.callObj.isCallDisconnect = false
        this.callObj.agentContactNo = message?.agent_number
        this.callObj.agentName = message?.agentName
        this.callObj.agentProfilePic = message?.agentProfilePic
        this.callObj.calledOn = message?.account_number
        this.callObj.calledOnText = 'Called from '
        this.callObj.customerContactNo = message?.customer_number
        this.callObj.status = 'Connecting...'
        this.callObj.callEventType = 'inbound'
        this.callObj.callHeader = 'Call received from '
        this.callObj.ivrSelectedNum = message?.dtmf_input || message?.dtmf_menu
        // this.callObj.callConnectedOn = message?.event_Date_UTC
        this.onCallPick.next('inbound');
        this.onCallDisconnect.next(false);
        break;
      case 'ANSWER':
        this.callObj.callType = VoiceCallTypeEnum.Inbound
        this.callObj.callPickStatus = true
        // this.callObj.callConnectedOn = message?.event_Date_UTC
        this.callObj.startTime = message?.event_Date_UTC
        this.callObj.callEventType = VoiceCallEventsEnum.Answer
        this.openCallDetailWindow.next(true);
        this.callObj.ivrSelectedNum = message?.dtmf_input || message?.dtmf_menu
        this.callObj.status = 'Connected...'
        this.onCallPick.next(VoiceCallEventsEnum.Answer);
        break;
      case 'BRIDGE':
        this.callObj.callType = VoiceCallTypeEnum.Inbound
        this.callObj.callPickStatus = true
        this.callObj.callConnectedOn = message?.event_Date_UTC
        this.callObj.ivrSelectedNum = message?.dtmf_input || message?.dtmf_menu
        // this.callObj.callHeader = 'Call with '
        this.callObj.callEventType = VoiceCallEventsEnum.InboundBridge
        this.onCallPick.next(VoiceCallEventsEnum.InboundBridge);
        break;
      case 'HANGUP':
        this.callObj.callType = VoiceCallTypeEnum.Inbound
        this.callObj.callHeader = 'Call ended with '
        this.callObj.status = 'Disonnected...'
        this.callObj.endTime = message?.event_Date_UTC
        this.callObj.callEventType = VoiceCallEventsEnum.InboundHangup
        this.callObj.ivrSelectedNum = message?.dtmf_input || message?.dtmf_menu
        this.onCallPick.next(VoiceCallEventsEnum.InboundHangup);
        break;
      case 'CDR':
        this.callObj.callType = VoiceCallTypeEnum.Inbound
        this.callObj.callRecordUrl = message?.resource_url
        // this.callObj.ivrSelectedNum = message.dtmf_input
        // this.callObj.callLog = message?.event_Date_UTC
        // this.callObj.callDuration = this.getTimeDiff(message?.call_duration)
        this.callObj.callEventType = VoiceCallEventsEnum.InboundCDR;
        this.callObj.isCallDisconnect = true;
        this.onCallPick.next(VoiceCallEventsEnum.InboundCDR);
        this.onCallDisconnect.next(true);
        break;
    }
  }

  voipMentionSignalR(voipMention): BaseMention {
    let attachments: AttachmentMetadata = {
      mediaContents: [],
      mediaContentText: null,
    };
    attachments = voipMention?.channel?.AttachmentXML ? this.parseXmlData(voipMention?.channel?.AttachmentXML) : attachments
    let mention: BaseMention = {
      title: voipMention?.channel?.Title,
      channelGroup: voipMention?.channel?.ChannelGroupId,
      channelType: voipMention?.channel?.ChannelType,
      ticketID: voipMention?.channel?.TicketNo,
      brandID: voipMention?.channel?.BrandID,
      brandName: voipMention?.channel?.BrandName,
      isBrandPost: voipMention?.channel?.IsBrandPost,
      description: voipMention?.channel?.Description,
      inReplyToStatusId: 0,
      insertedDate: null,
      isActionable: true,
      isDeleted: false,
      isDeletedFromSocial: false,
      isMakerCheckerEnable: false,
      isParentPost: false,
      isPrivateMessage: false,
      isRead: false,
      isReplied: false,
      isSSRE: false,
      isSendAsDMLink: false,
      isSendFeedback: false,
      isTypeExsitingTag: false,
      languageName: null,
      likeStatus: false,
      location: null,
      attachmentMetadata: attachments,
      status: 0,
      assignedToUserID: voipMention?.channel?.AssignedToID,
      ticketInfo: {
        ticketID: voipMention?.channel?.TicketNo,
        assignedTo: voipMention?.channel?.AssignedToID,
        status: voipMention?.tagdata?.CaseStatus,
        tagID: voipMention?.tagdata?.TagID,
        ticketUpperCategory: {
          id: 0,
          name: null,
          userID: null,
          brandInfo: null,
        },
      },
      upperCategory: {
        id: 0,
        name: null,
        userID: null,
        brandInfo: null,
      },
      mentionMetadata: {
        videoView: 0,
        postClicks: 0,
        postVideoAvgTimeWatched: 0,
        likeCount: 0,
        commentCount: null,
        reach: 0,
        impression: 0,
        videoViews: 0,
        engagementCount: 0,
        reachCountRate: 0,
        impressionsCountRate: 0,
        engagementCountRate: 0,
        isFromAPI: false,
        shareCount: 0,
      },
      brandInfo: {
        brandID: voipMention?.channel?.BrandID,
        brandName: voipMention?.channel.BrandName,
        categoryGroupID: 0,
        categoryID: 0,
        categoryName: null,
        mainBrandID: 0,
        compititionBrandIDs: null,
        brandFriendlyName: voipMention?.channel?.BrandName,
        brandLogo: null,
        isBrandworkFlowEnabled: false,
        brandGroupName: null,
      },
      author: {
        id: voipMention?.channel?.UserInfo?.Id,
        socialId: voipMention?.channel?.UserInfo?.AuthorSocialID,
        screenname: voipMention?.channel?.UserInfo?.ScreenName,
        channelGroup: voipMention?.channel?.UserInfo?.ChannelGroupID,
        isVerifed: voipMention?.channel?.UserInfo?.IsVerified,
        isBlocked: voipMention?.channel?.UserInfo?.IsBlocked,
        followersCount: voipMention?.channel?.UserInfo?.FollowersCount,
        followingCount: voipMention?.channel?.UserInfo?.FollowingCount,
        tweetCount: voipMention?.channel?.UserInfo?.TweetCount,
        locoBuzzCRMDetails:{
          phoneNumber:''
        }
      },
      ticketInfoSsre: {
        intentPVTRuleDisplayName: null,
        ssreOriginalIntent: 0,
        ssreReplyVerifiedOrRejectedBy: null,
        latestMentionActionedBySSRE: 0,
        transferTo: 0,
        ssreEscalatedTo: 0,
        ssreEscalationMessage: null,
        intentRuleType: 0,
        ssreStatus: 0,
        retrainTagid: 0,
        retrainBy: 0,
        retrainDate: '0001-01-01T00:00:00',
        ssreMode: 0,
        ssreIntent: 0,
        ssreReplyType: 0,
        intentFriendlyName: null,

        intentOrRuleID: 0,
        latestSSREReply: null,
        ssreReplyVerifiedOrRejectedTagid: 0,
        ssreReply: {
          authorid: null,
          replyresponseid: null,
          replymessage: null,
          channelType: 0,
          escalatedTo: 0,
          escalationMessage: null,
        },
      },
      makerCheckerMetadata: {
        workflowReplyDetailID: 0,
        replyMakerCheckerMessage: null,
        isSendGroupMail: false,
        replyStatus: null,
        replyEscalatedTeamName: null,
        workflowStatus: 0,
        isTakeOver: null,
      },
      mediaType: voipMention?.channel?.MediaEnum,
      contentID: voipMention?.tagdata?.ID,
      tagID: voipMention?.tagdata?.TagID,
      mentionTime: voipMention?.channel?.MentionDateTime

      // assigned
    };
    this.voiceMentionBrand = mention.brandInfo.brandID;
    if (this.callObj.ivrSelectedNum && this.voiceMentionBrand) {
      this.callObj.ivrSelectedDesc = this.setIVRDesc(this.callObj?.ivrSelectedNum);
      this.onSelectIVRDesc.next(this.callObj?.ivrSelectedDesc);
    }
    return mention;
  }

  voipMentionSignalRViaAPI(voipMention): BaseMention {
    let attachments: AttachmentMetadata = {
      mediaContents: [],
      mediaContentText: null,
    };
    attachments = voipMention?.channel?.attachmentXML ? this.parseXmlData(voipMention?.channel?.attachmentXML) : attachments
    let mention: BaseMention = {
      title: voipMention?.channel?.title,
      channelGroup: voipMention?.channel?.channelGroupId,
      channelType: voipMention?.channel?.channelType,
      ticketID: voipMention?.channel?.ticketNo,
      brandID: voipMention?.channel?.brandID,
      brandName: voipMention?.channel?.brandName,
      isBrandPost: voipMention?.channel?.isBrandPost,
      description: voipMention?.channel?.description,
      inReplyToStatusId: 0,
      insertedDate: null,
      isActionable: true,
      isDeleted: false,
      isDeletedFromSocial: false,
      isMakerCheckerEnable: false,
      isParentPost: false,
      isPrivateMessage: false,
      isRead: false,
      isReplied: false,
      isSSRE: false,
      isSendAsDMLink: false,
      isSendFeedback: false,
      isTypeExsitingTag: false,
      languageName: null,
      likeStatus: false,
      location: null,
      attachmentMetadata: attachments,
      status: 0,
      assignedToUserID: voipMention?.channel?.assignedToID,
      ticketInfo: {
        ticketID: voipMention?.channel?.ticketNo,
        assignedTo: voipMention?.channel?.assignedToID,
        status: voipMention?.tagdata?.caseStatus,
        tagID: voipMention?.tagdata?.tagID,
        ticketUpperCategory: {
          id: 0,
          name: null,
          userID: null,
          brandInfo: null,
        },
      },
      upperCategory: {
        id: 0,
        name: null,
        userID: null,
        brandInfo: null,
      },
      mentionMetadata: {
        videoView: 0,
        postClicks: 0,
        postVideoAvgTimeWatched: 0,
        likeCount: 0,
        commentCount: null,
        reach: 0,
        impression: 0,
        videoViews: 0,
        engagementCount: 0,
        reachCountRate: 0,
        impressionsCountRate: 0,
        engagementCountRate: 0,
        isFromAPI: false,
        shareCount: 0,
      },
      brandInfo: {
        brandID: voipMention?.channel?.brandID,
        brandName: voipMention?.channel.brandName,
        categoryGroupID: 0,
        categoryID: 0,
        categoryName: null,
        mainBrandID: 0,
        compititionBrandIDs: null,
        brandFriendlyName: voipMention?.channel?.brandName,
        brandLogo: null,
        isBrandworkFlowEnabled: false,
        brandGroupName: null,
      },
      author: {
        id: voipMention?.channel?.userInfo?.id,
        socialId: voipMention?.channel?.userInfo?.authorSocialID,
        screenname: voipMention?.channel?.userInfo?.screenName,
        channelGroup: voipMention?.channel?.userInfo?.channelGroupID,
        isVerifed: voipMention?.channel?.userInfo?.isVerified,
        isBlocked: voipMention?.channel?.userInfo?.isBlocked,
        followersCount: voipMention?.channel?.userInfo?.followersCount,
        followingCount: voipMention?.channel?.userInfo?.followingCount,
        tweetCount: voipMention?.channel?.userInfo?.tweetCount,
        locoBuzzCRMDetails: {
          phoneNumber: ''
        }
      },
      ticketInfoSsre: {
        intentPVTRuleDisplayName: null,
        ssreOriginalIntent: 0,
        ssreReplyVerifiedOrRejectedBy: null,
        latestMentionActionedBySSRE: 0,
        transferTo: 0,
        ssreEscalatedTo: 0,
        ssreEscalationMessage: null,
        intentRuleType: 0,
        ssreStatus: 0,
        retrainTagid: 0,
        retrainBy: 0,
        retrainDate: '0001-01-01T00:00:00',
        ssreMode: 0,
        ssreIntent: 0,
        ssreReplyType: 0,
        intentFriendlyName: null,

        intentOrRuleID: 0,
        latestSSREReply: null,
        ssreReplyVerifiedOrRejectedTagid: 0,
        ssreReply: {
          authorid: null,
          replyresponseid: null,
          replymessage: null,
          channelType: 0,
          escalatedTo: 0,
          escalationMessage: null,
        },
      },
      makerCheckerMetadata: {
        workflowReplyDetailID: 0,
        replyMakerCheckerMessage: null,
        isSendGroupMail: false,
        replyStatus: null,
        replyEscalatedTeamName: null,
        workflowStatus: 0,
        isTakeOver: null,
      },
      mediaType: voipMention?.channel?.mediaEnum,
      contentID: voipMention?.tagdata?.ID,
      tagID: (voipMention?.tagdata?.tagID) ? voipMention?.tagdata?.tagID : voipMention?.tagdata?.TagID,
      mentionTime: voipMention?.channel?.mentionDateTime

      // assigned
    };
    this.voiceMentionBrand = mention.brandInfo.brandID;
    if (this.callObj.ivrSelectedNum && this.voiceMentionBrand) {
      this.callObj.ivrSelectedDesc = this.setIVRDesc(this.callObj?.ivrSelectedNum);
      this.onSelectIVRDesc.next(this.callObj?.ivrSelectedDesc);
    }
    return mention;
  }

  parseXmlData(AttachmentXML) {
    let attachments: AttachmentMetadata = {
      mediaContents: [],
      mediaContentText: null,
    };

    let media: mediaObj;
    if (AttachmentXML) {
      attachments.mediaContentText = AttachmentXML;
      const parseString = require('xml2js').parseString;
      parseString(AttachmentXML, (err, result) => {
        if (result && result?.Attachments?.Item.length > 0) {
          result?.Attachments?.Item.forEach((element) => {
            if (element?.Url?.length > 0) {
              attachments.mediaContents.push({
                mediaUrl: element?.Url[0],
                mediaType: 11,
                displayName: element?.Name[0],
                thumbUrl: element?.ThumbUrl[0],
                name: element?.Name[0],
              });
            }
          });
        }
      });
    }
    return attachments;
  }

  makeCall(voipParams): Observable<any> {
    if (!voipParams && this.makeCallParams) {
      voipParams = this.makeCallParams;
    }
    return this._http
      .post<any>(environment.baseUrl + '/Voip/makecall', voipParams)
      .pipe(
        map((response) => {
          if (response) {
            console.log('Make call response: ', response);
            return response;
          }
        })
      );
  }
  getVoipNumbers(voipParams): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/VoIP/GetVOIPNumbers', voipParams)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }
  getVoipBrandIVRData(voipParams): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/VoIP/', voipParams)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }
  getAgentList(brandId): Observable<any> {
    const voipParams = { BrandIDs: [brandId], Roles: 1 };
    return this._http
      .post<any>(environment.baseUrl + '/Exotel/GetAgentList', voipParams)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }
  saveVOIP(voipParams): Observable<any> {
    return this._http
      .post<any>(environment.baseUrl + '/VoIP/SaveVOIP', voipParams)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }
  getVOIPAccountDetails(brandId,providerID): Observable<any> {
    const voipParams = { BrandID: brandId, ProviderID: providerID };
    return this._http
      .post<any>(
        environment.baseUrl + '/Exotel/GetVOIPAccountDetails',
        voipParams
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }
  deleteVoipAccount(brandId, number, agentDetails): Observable<any> {
    const voipParams = { BrandID: brandId, ProviderID: 1, Number: number, AgentDetails: agentDetails };
    return this._http
      .post<any>(environment.baseUrl + '/ChannelConfiguration/DeleteVOIPAccount', voipParams)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          }
        })
      );
  }
  getTimeDiff(callDuration): string {
    let time;
    let hh = Math.floor(callDuration / 60 / 60);
    callDuration -= hh * 60 * 60;
    let mm = Math.floor(callDuration / 60);
    callDuration -= mm * 60;
    let ss = Math.floor(callDuration);
    time =
      (hh > 0 ? hh + ' Hr ' : '') +
      (mm > 0 || (mm === 0 && hh > 0) ? mm + ' Min ' : '') +
      (ss >= 0 ? ss + ' Sec' : '');
    return time;
  }
  assignCallObjData() {
    this.callObj = {
      agentContactNo: 'none',
      customerContactNo: 'none',
      status: 'Connecting...',
      callLog: '',
      callConnectedOn: '',
      callType: 'none',
      callRecordUrl: 'none',
      callStatusFlag: true,
      callDuration: 'N/A',
      callHeader: '',
      agentName: '',
      customerName: '',
      callEventType: '',
      callPickStatus: false,
      isCallDisconnect: false,
      startTime: '',
      endTime: '',
      calledOnText: '',
      agentProfilePic: ''
    };
  }

  setIVRDesc(ivr) {
    let brandIVRDesc=''
    const ivrBrandData = this._filterService.voipBrandIVRData;
    const brandIVRJson = ivrBrandData.find(x => x.brandID == this.voiceMentionBrand)
    const brandIVRDescipt = brandIVRJson?.description;
    if (ivr && brandIVRDescipt) {
     brandIVRDesc = brandIVRDescipt[ivr]
    }
    return brandIVRDesc;
  }
}
