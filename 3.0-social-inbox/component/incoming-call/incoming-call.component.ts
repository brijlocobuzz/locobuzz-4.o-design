import { ChangeDetectorRef, Component, EventEmitter, Input, NgZone, OnChanges, OnDestroy, OnInit, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { notificationType } from 'app/core/enums/notificationType';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import { Subscription } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-incoming-call',
    templateUrl: './incoming-call.component.html',
    styleUrls: ['./incoming-call.component.scss'],
    standalone: false
})

export class IncomingCallComponent implements OnInit, OnDestroy {
  @Input() singleRData
  @Input() inbound
  @Input() outboundCall
  @Input() detailedView
  @Output() acceptCallEvent = new EventEmitter();
  audio = new Audio('assets/audio/voice-call-notification.mp3');
  ivrDesc = '';
  constructor(
    private _voip: VoiceCallService,
    private _ngZone: NgZone,
    private exotelService:ExotelService,
   private cdk:ChangeDetectorRef,
   private navigationService:NavigationService,
    private _snackBar:MatSnackBar,
    private _ticketService:TicketsService,
    private _postDetailService:PostDetailService,
    private _chatBotService:ChatBotService,
    private ticketSignalRService: TicketsignalrService,
    private translate: TranslateService
  ) { }
  incomingCall = false;
  subs: Subscription;
  caller;
  callee;
  outboundCallFlag:boolean = true;
  ngOnInit(): void {
      this.subs=this._voip.onSelectIVRDesc.subscribe(res=>{
        if(res){
          this._ngZone.runOutsideAngular(() => {
              this._ngZone.run(() => {
                this.ivrDesc = res;
              });
            })
        }
      })
    this.audio.play();
    if (this.outboundCall)
    {
      this.singleRData._callerProfilePic = this.ticketSignalRService?.Profiledetails?.profilePic
    }else{
      this.singleRData._calleeProfilePic = this.ticketSignalRService?.Profiledetails?.profilePic
    }
  }

  acceptCall(incomingFlag = false):void{
    if (!incomingFlag)
    {
      this.outboundCallFlag = false;
    //   if (this.exotelService.selectedMention){
    //   this.exotelService.outGoingConnectedCallObs.next({guid: this?.navigationService?.currentSelectedTab?.guid,baseMention:this.exotelService.selectedMention})
    // }
      this.exotelService.acceptCall()
    return;
    }
   const obj = {
     "CallFrom": this.exotelService.callFromNumber.replace('+91', ''),
     "CallTo": this.exotelService.callToNumber.replace('+91', '0')
    }
    this.exotelService.getTicketDetailsBasedOnPhoneNUmber(obj).subscribe((res)=>{
      if(res.success && res.data)
      {
        const postData: BaseMention = this._voip.voipMentionSignalRViaAPI(res.data);
        this.exotelService.acceptCall()
              this._ticketService.openCallDetailWindowSignal.set(true);
              // if (this._postDetailService.postDetailPage) {
              //   return;
              // }

            this._ticketService.bulkMentionChecked = [];
            this._ticketService.selectedPostList = [];
            this._ticketService.postSelectTriggerSignal.set(
              this._ticketService.selectedPostList.length
            );
            this._postDetailService.postObj = postData;
        this._postDetailService.voipTagID = postData?.tagID;
            // this._postDetailService.startIndex = this.startIndex;
            // this._postDetailService.endIndex = this.endIndex;
        
            // this._postDetailService.pagetype = this.pageType;
            this._postDetailService.ticketOpenDetail = postData;
            // this._postDetailService.autoCloseWindow = this.autoCloseWindow;

            this._postDetailService.currentPostObjectSignal.set(
              postData.ticketInfo.ticketID
            );
            if (postData.channelGroup === ChannelGroup.GooglePlayStore) {
              this._postDetailService.playstoreurl = postData.url;
            }
            // this._postDetailService.isReplyVisibleCheckSignal.set(this.ticketHistoryData);
            // this._postDetailService.autoCloseWindow=this.autoCloseWindow;
            // this._postDetailService.selectedTicketType = this._navigationService.getFilterJsonBasedOnTabGUID(this._navigationService.currentSelectedTab.guid).ticketType[0];
           if(!this.detailedView)
           {
            this._ticketService.postDetailWindowTrigger({
              replyVisible:false,
              openState: true,
              guid: this.navigationService?.currentSelectedTab?.guid,
            });
          }
       
            this._chatBotService.chatPositionSignal.set({
              openPostDetailWindowStatus: true,
            })
            console.log(
              `emit from PostComponent =>  openTicketDetail() => line:1071 . Checks: openPostDetailWindowStatus always true .`
            );
            // this.subs.add(
            //   this._ticketService.openPostDetailWindow.subscribe((response) => {
            //     if (response && !response.openState) {

            //   }
            // }
            // )
            // );
        this.exotelService.pickUpCallObs.next(true);
        this.acceptCallEvent.emit(true)

      }else{
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,

          data: {
            type: notificationType.Error,
            message: res.message?res.message:this.translate.instant('Unable-to-generate-ticket-details'),
          },
        });
      }
    },err=>{
       this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message:this.translate.instant('Unable-to-generate-ticket-details'),
                },
              });
    })
  }

  rejectCall():void{
      if (!this.inbound) {
      const postObj = this.exotelService.selectedMention;
        if (postObj){
      const obj = {
        brandInfo: postObj?.brandInfo,
        userInfo: postObj?.author,
        CustomerNumber: this.exotelService.callToNumber,
        AgentNumber: this.exotelService.callFromNumber,
      }

      this.exotelService.agentHangupCall(obj).subscribe((res) => {
        if (res) {

        }
      })
    }
  }
    this.exotelService.hangup();
  }

  ngOnDestroy(){
    this.audio.pause()
    this.audio.remove()
    this.subs.unsubscribe()
  }
}
