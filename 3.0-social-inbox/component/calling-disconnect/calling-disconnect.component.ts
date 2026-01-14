import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CallObj } from 'app/core/models/viewmodel/VoiceCall';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import moment from 'moment';
// import * as momentDurationFormat from "moment-duration-format";

@Component({
    selector: 'app-calling-disconnect',
    templateUrl: './calling-disconnect.component.html',
    styleUrls: ['./calling-disconnect.component.scss'],
    standalone: false
})
export class CallingDisconnectComponent implements OnInit, OnChanges {
  @Input() callObj: CallObj;
  @Output() makeCallEvent = new EventEmitter();
  @Output() callConnectedAgainEvent = new EventEmitter();
  IncomingOrOutgoingFlag:boolean;
  // callBackFlag:boolean = true;
  constructor(private postDetailService:PostDetailService,
    private exotelService:ExotelService
  ) {}

  ngOnInit(): void {
   this.IncomingOrOutgoingFlag = this.postDetailService.incomingOrOutgoing
   if(this.IncomingOrOutgoingFlag)
   {
     this.callObj.customerContactNo = this.exotelService.callFromNumber
   }else
   {
      this.callObj.customerContactNo = this.exotelService.callToNumber
   }
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.callObj) {
      this.callObj = changes.callObj.currentValue;
    }
  }
  makeCall() {
    // this.callBackFlag = false;
    this.makeCallEvent.emit();
  }

  acceptCall() {
    this.exotelService.acceptCall();
    this.callConnectedAgainEvent.emit(true);
  }
}

