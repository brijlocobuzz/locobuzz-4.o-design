import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  NgZone,
  Output,
} from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChannelType } from 'app/core/enums/ChannelType';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { TimerService } from 'app/social-inbox/services/timer.service';
import moment from 'moment';
import { Observable, Subscription, timer } from 'rxjs';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-replytimer',
    templateUrl: './replytimer.component.html',
    styleUrls: ['./replytimer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ReplytimerComponent implements OnInit, OnDestroy {
  @Output() TimerExpired: EventEmitter<any> = new EventEmitter<any>();

  @Input() mentionTime: any;
  @Input() channelGroup: ChannelGroup;
  @Input() channelType: ChannelType;
  @Input() postType: PostsType;
  @Input() showShortNote: boolean = false;

  private subscription: Subscription;

  everySecond: Observable<number> = timer(0, 1000);

  replyexpirydays: string;
  searchEndDate: any;
  subs = new SubSink();

  constructor(
    private _ticketService: TicketsService,
    private _ngZone: NgZone,
    private ref: ChangeDetectorRef,
    private timerService:TimerService,
    private translate: TranslateService
  ) {}

  public get PostsType(): typeof PostsType {
    return PostsType;
  }

  ngOnInit(): void {
    this.checkPostData();
  }

  checkPostData(): void {
    if (this.channelGroup && (this.channelGroup === ChannelGroup.WhatsApp || this.channelGroup == ChannelGroup.GoogleBusinessMessages)) {
      const start = moment();
      this.searchEndDate = moment
        .utc(this.mentionTime)
        .add({ days: 1 })
        .local();
      this._ngZone.runOutsideAngular(() => {
        this.setCounter();
      });
    } else if (
      this.channelType &&
      (this.channelType === ChannelType.FBMessages ||
        this.channelType === ChannelType.InstagramMessages)
    ) {
      const ticketTimings = this._ticketService.calculateCustomTicketTime(
        this.mentionTime
      );
      if (ticketTimings.valDays) {
        if (Number(ticketTimings.valDays) <= 7 && Number(ticketTimings.valDays) != 0) {
          const remainingDays = 7 - Number(ticketTimings.valDays);
          if (remainingDays == 1 || remainingDays === 0) {
            // start the counter
            const hours = ticketTimings.valHours
              ? Math.floor(Number(ticketTimings.valHours))
              : 0;
            const minutes = ticketTimings.valMinutes
              ? Math.floor(Number(ticketTimings.valMinutes))
              : 0;
            const seconds = ticketTimings.valSeconds
              ? Math.floor(Number(ticketTimings.valSeconds))
              : 0;
            const start = moment();
            this.searchEndDate = moment
              .utc(this.mentionTime)
              .add({ days: 7 })
              .local();
            this._ngZone.runOutsideAngular(() => {
              this.setCounter();
            });
          } else {
            this.replyexpirydays = String(remainingDays) + ` ${this.translate.instant('days')}`;
          }
        } else {
          // reply expired
        }
      }
    }
  }

  setCounter(): void {
    this.subs.add(
      this.timerService.timerSubscription.subscribe((res) => {
      var currentTime = moment();
      const duration = moment.duration(this.searchEndDate.diff(currentTime));
      const hours = Math.floor(duration.asHours());
      const minutes = Math.floor(duration.minutes());
      const secondss = Math.floor(duration.seconds());

      if (hours <= 0 && minutes <= 0 && secondss <= 0) {
        // this.SearchDate = moment();
        // this.searchEndDate = this.SearchDate.add(this.ElapsTime, "minutes");

        this.TimerExpired.emit();
      } else {
        if (hours && hours > 0) {
          if (this.replyexpirydays !== hours + ` ${this.translate.instant('hours')}`) {
            this._ngZone.run(() => {
              this.replyexpirydays = hours + ` ${this.translate.instant('hours')}`;
            });
          } else {
            this.replyexpirydays = hours + ` ${this.translate.instant('hours')}`;
          }
        } else if (minutes && minutes > 0) {
          if (this.replyexpirydays !== minutes + ` ${this.translate.instant('minutes')}`) {
            this._ngZone.run(() => {
              this.replyexpirydays = minutes + ` ${this.translate.instant('minutes')}`;
            });
          } else {
            this.replyexpirydays = minutes + ` ${this.translate.instant('minutes')}`;
          }
        } else {
          if (this.replyexpirydays !== secondss + ` ${this.translate.instant('seconds')}`) {
            this._ngZone.run(() => {
              this.replyexpirydays = String(secondss) + ` ${this.translate.instant('seconds')}`;
            });
          } else {
            this.replyexpirydays = String(secondss) + ` ${this.translate.instant('seconds')}`;
          }
        }
      }
      this.ref.detectChanges();
    }));
  }

  ngOnDestroy(): void {
    this.ref.detach();
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }
}

