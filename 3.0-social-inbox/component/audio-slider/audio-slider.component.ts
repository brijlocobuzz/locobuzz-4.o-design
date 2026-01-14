import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ChannelType } from 'app/core/enums/ChannelType';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { StreamState } from 'app/core/models/viewmodel/ChatWindowDetails';
import { ChatbotAudioService } from 'app/shared/services/chatbot-audio.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import moment from 'moment';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-audio-slider',
    templateUrl: './audio-slider.component.html',
    styleUrls: ['./audio-slider.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AudioSliderComponent implements OnInit, OnDestroy {
  @Input() postData: BaseMention;
  @Input() ticketHistoryData: AllBrandsTicketsDTO;
  subs = new SubSink();
  MediaEnum = MediaEnum;
  channelTypeEnum = ChannelType;
  iconPlayAudio = true;
  iconPauseAudio = false;
  state: StreamState;
  audioID;
  audioDuration;
  missedCallText = 'MissedCall!';
  startTimeout;
  audioLoading = false;
  isDragging = false;

  constructor(
    private _audioService: ChatbotAudioService,
    private _postDetailService: PostDetailService,
    private _cdr: ChangeDetectorRef,
    private _ngZone: NgZone
  ) { }

  ngOnInit(): void {
    if (this.ticketHistoryData.voipAudioUrls[0]) {
      this._ngZone.runOutsideAngular(() => {
        this.startTimeout = setTimeout(() => { this.getAudioDuration(this.ticketHistoryData?.voipAudioUrls[0]); }, 1000)
      })
    }
    if (this.ticketHistoryData?.description == 'Unanswered' || this.ticketHistoryData?.description?.includes('Agent Missed')) {
      this.missedCallText = `You have received a missed call due to agents didn’t answer`
    } else if (this.ticketHistoryData?.description?.includes('Customer Missed')) {
      this.missedCallText = `You have received a missed call due to customer didn’t answer`
    }
    this.subs.add(
      this._audioService.getState().subscribe((state) => {
        // Don't update state while user is dragging the slider
        if (!this.isDragging) {
          this.state = state;
          this._cdr.detectChanges()
        }
        //dummy commit
      })
    );
  }

  getAudioDuration(url) {
    // this._ngZone.run(() => {
    var au = document.createElement('audio');
    au.src = url;
    au.addEventListener(
      'loadedmetadata',
      async () => {
        this.audioDuration = moment.utc(au.duration * 1000).format('mm:ss');
        this._cdr.detectChanges()
      },
      false
    );
    // });
  }

  openFile(id, url): void {
    // this.audioID=''
    this._audioService.stop();
    this.iconPauseAudio = true;
    this.iconPlayAudio = false;
    this.audioLoading = true;
    this._postDetailService.audioID = id;
    this._audioService.playStream(url).subscribe((events) => {
      // listening for fun here
      this.audioLoading = false;
      this._cdr.detectChanges()
    });
  }
  
  onSliderChange(value: number): void {
    // Called during dragging - set flag to prevent audio service updates
    this.isDragging = true;
  }
  
  onSliderChangeEnd(value: number): void {
    // Called when dragging ends - seek to the new position
    this.isDragging = false;
    this._audioService.seekTo(value);
    this._cdr.detectChanges()
  }
  playAudio(): void {
    this.iconPauseAudio = true;
    this.iconPlayAudio = false;

    // this.audioID = this.postData.contentID;
    this._audioService.play();
    this._cdr.detectChanges()
  }
  pauseAudio(): void {
    this.iconPauseAudio = false;
    this.iconPlayAudio = true;
    // this.audioID = this.postData.contentID;
    this._audioService.pause();
    this._cdr.detectChanges()
  }
  ngOnDestroy(): void {
    this._postDetailService.audioID = '';
    this._audioService.stop();
    this.subs.unsubscribe();
  }
}

