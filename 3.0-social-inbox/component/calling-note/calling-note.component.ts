import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { ExotelService } from 'app/core/services/Exotel/exotel.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import { Subscription } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-calling-note',
    templateUrl: './calling-note.component.html',
    styleUrls: ['./calling-note.component.scss'],
    standalone: false
})
export class CallingNoteComponent implements OnInit ,OnDestroy, OnChanges {

  @ViewChild('noteTextarea') noteTextarea: ElementRef;
  @Input() postData: BaseMention;
  @Input() ivrData: any;
  @Output() addNoteEvent = new EventEmitter<any>();

  note='';
  @Input() enableNote=false;
  @Input() noteInput = false;
  subs = new SubSink();
  ivrBrandData:any;
  postObj:BaseMention;
  brandIVRDesc:any='';

  constructor(private _cdr: ChangeDetectorRef, private _voip: VoiceCallService, private _filterService: FilterService, private _postDetailService: PostDetailService,
    private exotelService:ExotelService,
    private cdk:ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.postObj=this._postDetailService.postObj;
    if (this.ivrData){this.setIVRDesc(this.ivrData)}
    this.subs.add(
      this._voip.onCallDisconnect.subscribe(res=>
      {
        this.enableNote=res
      })
    )
    this.subs.add(
      this._voip.onCallPick.subscribe(res => {
        if(res == 5 || res == 10)
        this.noteInput = true;
        this.noteTextarea.nativeElement.focus()
      })
    )

    this.subs.add(
      this.exotelService.exotelCallEnded.subscribe(res => {
        if(res)
        {
          this.enableNote = true;
          this.cdk.detectChanges()
        }
      }
    )
  )

  this.subs.add(
    this.exotelService.exotelIncomingOutgoingCall.subscribe((res)=>{
      if(res)
      {
        this.enableNote = false;
        this.cdk.detectChanges()
      }
    })
  )
  }
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.ivrData) {
      this.setIVRDesc(changes.ivrData.currentValue)
    }
  }
  changeInput(text){
    this.note=text;
    this._cdr.detectChanges()
  }
  addNote(): void {
    this.addNoteEvent.emit(this.note)
  }
  setIVRDesc(ivr){
    this.ivrBrandData = this._filterService.voipBrandIVRData;
    const brandIVRJson = this.ivrBrandData.find(x => x.brandID == this.postObj?.brandInfo?.brandID)
    const brandIVRDescipt = brandIVRJson?.description;
    if (ivr && brandIVRDescipt) {
      this.brandIVRDesc = brandIVRDescipt[ivr]
    }
  }
  ngOnDestroy(): void {
    this._cdr.detach();
    this.subs.unsubscribe();
    this.subs = null;
  }
}
