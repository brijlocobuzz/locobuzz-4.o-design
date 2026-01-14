import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locobuzzAnimations } from '@locobuzz/animations';
import { ProfileService } from 'app/accounts/services/profile.service';
import { post } from 'app/app-data/post';
import { notificationType } from 'app/core/enums/notificationType';
import { VoiceCallEventsEnum, VoiceCallTypeEnum } from 'app/core/enums/VoiceCallEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { CallObj } from 'app/core/models/viewmodel/VoiceCall';
import { AccountService } from 'app/core/services/account.service';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { TicketsignalrService } from 'app/core/services/signalrservices/ticketsignalr.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { MicrophonePermissionComponent } from 'app/shared/components/microphone-permission/microphone-permission.component';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-calling',
    templateUrl: './calling.component.html',
    styleUrls: ['./calling.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    animations: locobuzzAnimations,
    standalone: false
})
export class CallingComponent implements OnInit, OnDestroy {
  @Output() callAgainEvent = new EventEmitter<boolean>();
  voipSubs = new SubSink();
  callConnectBoolean = true;
  callEndBoolean = false;
  callDisconnect = false;
  calling = true;
  callAgainBoolen: Boolean;
  voipCallObj: CallObj;
  agentDetails: AuthUser;
  caller = '';
  callee = '';
  callerName = '';
  calleeName = '';
  interval: any;
  minTimer = 0;
  secondTimer = 0;
  startTimeout: any;
  endTimeout: any;
  postObj: BaseMention;
  voiceEventEnum = VoiceCallEventsEnum;
  subscription: Subscription;
  showConnectedStatus: boolean = false;
  voipBrandIVRData = ''
  unMuteFlag:boolean = false
  holdFlag:boolean = false
  incomingCallFlag:boolean = false
  profileDetails: any;


  constructor(
    private _cdr: ChangeDetectorRef,
    private _ticketService: TicketsService,
    private _voip: VoiceCallService,
    private _ticketSignalrService: TicketsignalrService,
    private _postDetailService: PostDetailService,
    private _accountService: AccountService,
    private _profileService: ProfileService,
    private _snackBar: MatSnackBar,
    private _ngZone: NgZone,
    private exotelService:ExotelService,
    private _dialog: MatDialog
  ) { }

  ngOnInit(): void {
    console.log('calling initialized')
    this.voipCallObj = this._voip.callObj
    this.postObj = this._postDetailService.postObj;
    this.voipCallObj.callStatusFlag = true;
    this.callee = ''
    this.caller = ''
    this.calleeName = ''
    this.callerName == ''
    this.showConnectedStatus = false;

    this.voipSubs.add(
      this._accountService.currentUser$.pipe(take(1)).subscribe((user) => {
        this.agentDetails = user;
      })
    );
    this.voipSubs.add(
      this._voip.onCallPick.subscribe((res) => {
        if (res == 'CallInitiated') {
          this.resetCallDetailWindow();
        }
      })
    );

    this.subscription = this._ticketSignalrService.voipSignalCall.subscribe(
      (res) => {
        if (res) {
          // this._ngZone.run(() => {
          this.voipCallObj = this._voip?.callObj
          this.callVoiceEvents();
          this._cdr.detectChanges();

          // })
        }
      })

      this.voipSubs.add(
        this.exotelService.exotelCallEnded.subscribe((res) => {
          if (res) {
            this.voipCallObj.endTime = moment().format('hh:mm:ss A')
            this.callEnd();
          }
        } 
      )      
      )

      this.voipSubs.add(
        this.exotelService.outGoingConnectedCallObs.subscribe((res) => {
          if (res) {
            this.callConnectBoolean = true;
            this.callEndBoolean = false;
            this.callDisconnect = false;
            this.calling = true;
            if (this.exotelService.callStatus == 'Connected...') {
              this.voipCallObj.startTime = moment().format('hh:mm:ss A');
              this.voipCallObj.callConnectedOn = moment().format('hh:mm:ss A');
              this._ngZone.runOutsideAngular(() => {
                this.interval = setInterval(() => {
                  this.startTimer();
                }, 1000);
              });
            }
            this.callerName = this.incomingCallFlag ? 'Customer' : 'Agent'
            this.calleeName = this.incomingCallFlag ? 'Agent' : 'Customer'
            this.incomingCallFlag = this._postDetailService?.incomingOrOutgoing
            this.profileDetails = this._ticketSignalrService?.Profiledetails
            // this.voipCallObj.status = this.exotelService.callStatus
            this._cdr.detectChanges();
          }
        })
      )

    this.voipSubs.add(
            this._ticketSignalrService.exotelCallConnectedObs.subscribe((res) => {
              if (this._ticketSignalrService?.exotelMultipleSignalR?.length == 2 && this._ticketSignalrService?.exotelMultipleSignalR[0] == this._ticketSignalrService?.exotelMultipleSignalR[1])
              {
                this.callConnectBoolean = true;
                this.callEndBoolean = false;
                this.callDisconnect = false;
                this.calling = true;
                this.exotelService.callStatus = 'Connected...'
                this._voip.callObj.status ='Connected...'
                this.voipCallObj.status = 'Connected...'
                this.voipCallObj.startTime = moment().format('hh:mm:ss A');
                this.voipCallObj.callConnectedOn = moment().format('hh:mm:ss A');
                this._ngZone.runOutsideAngular(() => {
                  this.interval = setInterval(() => {
                    this.startTimer();
                  }, 1000);
                });
                this.caller = this.exotelService.callFromNumber
                this.callee = this.exotelService.callToNumber
                this.incomingCallFlag = this._postDetailService?.incomingOrOutgoing
                this.profileDetails = this._ticketSignalrService?.Profiledetails
                this.callerName = this.incomingCallFlag ? 'Customer' : 'Agent'
                this.calleeName = this.incomingCallFlag ? 'Agent' : 'Customer'
                const mention: BaseMention = this._voip.voipMentionSignalR(res.data);
                this._postDetailService.voipTagID = mention?.tagID;
                // this.voipCallObj.status = this.exotelService.callStatus
              this._cdr.detectChanges();
              }
            }
          )
        )

        this.voipSubs.add(
          this.exotelService.pickUpCallObs.subscribe((res)=>{
            if(res){
              this.callConnectBoolean = true;
              this.callEndBoolean = false;
              this.callDisconnect = false;
              this.calling = true;
              this.exotelService.callStatus = 'Connected...'
              this._voip.callObj.status ='Connected...'
              this.voipCallObj.status = 'Connected...'
              this.voipCallObj.startTime = moment().format('hh:mm:ss A');
              this.voipCallObj.callConnectedOn = moment().format('hh:mm:ss A');
              this._ngZone.runOutsideAngular(() => {
                this.interval = setInterval(() => {
                  this.startTimer();
                }, 1000);
              });
              this.caller = this.exotelService.callFromNumber
              this.callee = this.exotelService.callToNumber
              this.incomingCallFlag = this._postDetailService?.incomingOrOutgoing
              this.profileDetails = this._ticketSignalrService?.Profiledetails
              this.callerName = this.incomingCallFlag ? 'Customer' : 'Agent'
              this.calleeName = this.incomingCallFlag ? 'Agent' : 'Customer'
            }
          })
        )
      

        this.callConnectBoolean = true;
        this.callEndBoolean = false;
        this.callDisconnect = false;
        this.calling = true;
    this.voipCallObj.status = 'Connected...'
      this.voipCallObj.startTime = moment().format('hh:mm:ss A');
      this.voipCallObj.callConnectedOn = moment().format('hh:mm:ss A');
      this._ngZone.runOutsideAngular(() => {
        this.interval = setInterval(() => {
          this.startTimer();
        }, 1000);
      });
    this.caller = this.exotelService.callFromNumber
    this.callee = this.exotelService.callToNumber
        this.incomingCallFlag  = this._postDetailService?.incomingOrOutgoing
    this.callerName = this.incomingCallFlag?'Customer': 'Agent'
    this.calleeName = this.incomingCallFlag?'Agent': 'Customer'
    this.profileDetails = this._ticketSignalrService?.Profiledetails
    // this.voipCallObj.status = this.exotelService.callStatus
  }

  callVoiceEvents() {
    if (this.voipCallObj.callEventType == 'outbound' || this.voipCallObj.callEventType == 'inbound') {
      this.resetCallDetailWindow()
    }
    if (this.voipCallObj.callEventType == VoiceCallEventsEnum.Answer) {
      this.callConnectBoolean = true;
      this.callEndBoolean = false;
      this.callDisconnect = false;
      this.calling = true;
    }
    if (
      this.voipCallObj.callEventType == 'outbound' ||
      this.voipCallObj.callEventType == VoiceCallEventsEnum.OutboundCDR ||
      this.voipCallObj.callEventType == VoiceCallEventsEnum.InboundCDR
    ) {
      this.postObj = this._postDetailService.postObj;
    }
    if (this.voipCallObj.callEventType == VoiceCallEventsEnum.OutboundBridge ||
      this.voipCallObj.callEventType == VoiceCallEventsEnum.InboundBridge) {
      this.voipCallObj.callConnectedOn = this._voip?.callObj?.callConnectedOn ? moment.utc(this.voipCallObj.callConnectedOn).local().format('D MMM, h:mm a') : '';
      this.showConnectedStatus = true
    }
    if (this.voipCallObj.callType == VoiceCallTypeEnum.Inbound) {
      this.caller = this._voip?.callObj?.customerContactNo;
      this.callee = this._voip?.callObj?.agentContactNo;
      this.callerName = this._voip?.callObj?.customerName;
      this.calleeName = this._voip?.callObj?.agentName;
    } else if (this.voipCallObj.callType == VoiceCallTypeEnum.Outbound) {
      this.caller = this._voip?.callObj?.agentContactNo;
      this.callee = this._voip?.callObj?.customerContactNo;
      this.callerName = this._voip?.callObj?.agentName;
      this.calleeName = this._voip.callObj.customerName;
    }
    if (
      this.voipCallObj.callEventType == this.voiceEventEnum.OutboundBridge ||
      this.voipCallObj.callEventType == this.voiceEventEnum.Answer
    ) {
      this.callAgainEvent.emit(true);
    }
    if (
      this.voipCallObj.callEventType == this.voiceEventEnum.Answer ||
      this.voipCallObj.callEventType == this.voiceEventEnum.AgentAnswer
    ) {
      this.callConnectBoolean = true;
      this.callEndBoolean = false;
    } else if (
      this.voipCallObj.callEventType == this.voiceEventEnum.OutboundHangup ||
      this.voipCallObj.callEventType == this.voiceEventEnum.InboundHangup
    ) {
      this.callConnectBoolean = false;
      this.callEndBoolean = true;
      this._ngZone.runOutsideAngular(() => {
        this.endTimeout = setTimeout(() => {
          this.callEnd();
        }, 2000);
      });
    }
    if (
      this.voipCallObj.callEventType == VoiceCallEventsEnum.OutboundBridge ||
      this.voipCallObj.callEventType == VoiceCallEventsEnum.InboundBridge
    ) {
      this._voip.callObj.startTime = this._voip.callObj.startTime
        ? moment.utc(this._voip.callObj.startTime).local().format('h:mm a')
        : '';
      this._ngZone.runOutsideAngular(() => {
        this.interval = setInterval(() => {
          this.startTimer();
        }, 1000);
      });
    } else if (
      (this.voipCallObj.callEventType == VoiceCallEventsEnum.OutboundHangup ||
        this.voipCallObj.callEventType == VoiceCallEventsEnum.InboundHangup) &&
      this.interval
    ) {
      let timer =
        this.minTimer > 0
          ? this.minTimer * 60 + this.secondTimer
          : this.secondTimer;
      this._voip.callObj.endTime = this._voip.callObj.endTime
        ? moment.utc(this._voip.callObj.endTime).local().format('h:mm a')
        : '';
      this._voip.callObj.callDuration = this._voip.getTimeDiff(timer);
      this.pauseTimer();
    }
    this._cdr.detectChanges();
  }

  callEnd(): void {
    let timer =
      this.minTimer > 0
        ? this.minTimer * 60 + this.secondTimer
        : this.secondTimer;
    this._voip.callObj.callDuration = this._voip.getTimeDiff(timer);
    this.voipCallObj.callDuration =  this._voip.callObj.callDuration;
    // this._ngZone.run(() => {
    this.callEndBoolean = false;
    this.callDisconnect = true;
    this.calling = false;
    this.minTimer = 0;
    this.secondTimer = 0;
    clearTimeout(this.startTimeout);
    clearTimeout(this.endTimeout);
    clearInterval(this.interval);
    this._cdr.detectChanges();
    // });
  }

  startTimer() {
    // this._ngZone.run(() => {
    if (this.secondTimer == 59) {
      this.minTimer++;
      this.secondTimer = 0;
    } else {
      this.secondTimer++;
    }
    this._cdr.detectChanges();

    // });
  }

  pauseTimer() {
    clearInterval(this.interval);
  }

  makeCall() {
    // const agentId = this.agentDetails?.data?.user?.userId;
    // const brandId = this.postObj?.brandInfo?.brandID;
    // const brandName = this.postObj?.brandInfo?.brandName;
    // const voipParams = {
    //   Brand: { brandID: brandId, brandName: brandName },
    //   CustomerNumber: this.voipCallObj?.customerContactNo,
    //   AgentID: agentId
    // };
    // this._voip.assignCallObjData();
    // this.voipSubs.unsubscribe();
    // this.voipSubs.add(
    //   this._voip.makeCall(voipParams).subscribe((response) => {
    //     if (response) {
    //       this._voip.onCallPick.next('CallInitiated');
    //       this._voip.callObj.customerContactNo = voipParams?.CustomerNumber
    //     } else {
    //       this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //         duration: 5000,
    //         data: {
    //           type: notificationType.Error,
    //           message: response.message,
    //         },
    //       });
    //     }
    //   })
    // );

    navigator.mediaDevices.getUserMedia({ audio: true })
          .then((stream) => {
            console.log('✅ Microphone access granted.');
            stream.getTracks().forEach(track => track.stop());
            const contactNo = this._postDetailService.callAgainNumber;
            this._voip.assignCallObjData();
            this.exotelService.SendDTMF(contactNo.replace('+91', '0'));
            this.exotelService.dialNumber(contactNo.replace('+91', '0'));
            this.exotelService.callToNumber = contactNo;
            setTimeout(() => {
              this.exotelService.acceptCall()
            }, 300);
          })
          .catch(async (err) => {
            console.error('❌ Microphone access denied:', err);
    
            if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
              try {
                const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                if (result.state === 'denied') {
                  this._dialog.open(MicrophonePermissionComponent, {
                    width: '400px',
                  })
                }
              } catch {
              }
            }
          });

  }

  resetCallDetailWindow() {
    this._voip.callObj.isCallDisconnect = false
    this.callConnectBoolean = true;
    this.callEndBoolean = false;
    this.callDisconnect = false;
    this.calling = true;
    this.secondTimer = 0
    this.minTimer = 0
    this.voipCallObj.callConnectedOn = '',
      this._voip.callObj.status = "Connecting..."
    this.voipCallObj.status = "Connecting..."
    this.showConnectedStatus = false
  }

  ngOnDestroy(): void {
    this._voip.assignCallObjData();
    clearTimeout(this.startTimeout);
    clearTimeout(this.endTimeout);
    clearInterval(this.interval);
    this.subscription.unsubscribe();
    this.voipSubs.unsubscribe();
  }

  muteUnmuteEvent():void
  {
   this.unMuteFlag= !this.unMuteFlag
   this.exotelService.onClickToggleMute();
  }

  holdUnholdEvent():void 
  {
    this.holdFlag= !this.holdFlag
    this.exotelService.onClickToggleHold();
  }

  callConnectedAgainEventRes():void{
    this.callDisconnect = false
    this.holdFlag = false
    this.unMuteFlag = false
    this.callConnectBoolean = true
    this.callEndBoolean = false;
    this.callDisconnect = false;
    this.calling = true;
    this.voipCallObj.startTime = new Date().getTime();
    this._ngZone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        this.startTimer();
      }, 1000);
    });
  }

  callHungUp():void{
    this.exotelService.hangup();
    if(!this.incomingCallFlag)
    {
    const postObj = this._postDetailService.postObj;
    const obj={
      brandInfo:postObj?.brandInfo,
      userInfo:postObj?.author,
      CustomerNumber: this.exotelService.callToNumber,
      AgentNumber: this.exotelService.callFromNumber,
    }

    this.exotelService.agentHangupCall(obj).subscribe((res)=>{
      if (res) {
       
      }
  })
    }
  }

}



