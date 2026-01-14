import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { PostActionEnum } from 'app/core/enums/postActionEnum';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import { SubSink } from 'subsink/dist/subsink';

@Component({
    selector: 'app-dial-pad',
    templateUrl: './dial-pad.component.html',
    styleUrls: ['./dial-pad.component.scss'],
    standalone: false
})
export class DialPadComponent implements OnInit {
  contactNo = '';
  dialPad = false;
  openCallDetail = false;
  dialPadBoolean: any;
  subs = new SubSink();
  @Input() number;
  @Output() makeCallEvent = new EventEmitter();
  @Output() closeEvent = new EventEmitter();
  public get PostActionEnum(): typeof PostActionEnum {
    return PostActionEnum;
  }
  constructor(
    private _voip: VoiceCallService,
    private _postDetailService: PostDetailService
  ) {}

  ngOnInit(): void {
    if (this.number.includes('+91')) {
      this.contactNo = this.number;
    } else {
      this.contactNo = this.number ? this.number[0] == '0' ? '+91' + this.number.substring(1) : '+91' + this.number : '';
    }
    console.log('contact no: ', this.contactNo, this.number);
  }
  deleteNumber(): void {
    this.contactNo = this.contactNo.slice(0, -1);
  }
  //   textbox() {
  //   var ctl = document.getElementById('Javascript_example');
  //   var startPos = ctl.selectionStart;
  //   var endPos = ctl.selectionEnd;
  //   alert(startPos + ", " + endPos);
  // }
  numberDial(num): void {
    if(this.contactNo?.length < 14){
      this.contactNo += num;
    }
  }
  makeCall() {
    this.makeCallEvent.emit(this.contactNo);
  }
  dialPadPopupClose(): void {
    //console.log('close popup ', this.dialPad);
    /* this._postDetailService.dialpadBoolean.next(this.dialPad); */
    this.closeEvent.emit(false);
    this._postDetailService.dialpadBooleanSignal.set(this.dialPad);
  }
}
