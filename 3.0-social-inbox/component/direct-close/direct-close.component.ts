import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { notificationType } from 'app/core/enums/notificationType';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { Subject } from 'rxjs';
import { MediaGalleryComponent } from '../media-gallery/media-gallery.component';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { MatDialog } from '@angular/material/dialog';
import { filter } from 'rxjs/operators';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { SubSink } from 'subsink';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-direct-close',
    templateUrl: './direct-close.component.html',
    styleUrls: ['./direct-close.component.scss'],
    standalone: false
})
export class DirectCloseComponent implements OnInit, OnDestroy {
  @Input() buttonLoader: boolean = false;
  @Input() postDetailTab: LocobuzzTab;
  @Input() postData: BaseMention;
  @Output() replyEvent = new EventEmitter<boolean>();
  @Output() directCloseEmit = new EventEmitter<string>();
  textArea = '';
  mediaSelectedAsync = new Subject<UgcMention[]>();
  mediaSelectedAsync$ = this.mediaSelectedAsync.asObservable();
  selectedNoteMedia: UgcMention[] = [];
  mediaTypeEnum = MediaEnum
  subs = new SubSink();
  @ViewChild('txrArea', { static: true }) txrArea: ElementRef;
  closeData: boolean = false;
  defaultLayout: boolean = false;
  constructor(
    private _bottomSheet: MatBottomSheet,
    private mediaGalleryService: MediagalleryService,
    private _snackBar: MatSnackBar,
    private _ngZone: NgZone,
    private _cdr:ChangeDetectorRef,
    private _ticketService: TicketsService,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    private translate : TranslateService
  ) {
    this.textArea = '';
  }

  ngOnInit(): void {
    this._ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if(this.txrArea && this.txrArea.nativeElement){
          this.txrArea.nativeElement.focus();
        }
        console.log('setTimeout called');
      }, 0);
    });
    this.subs.add(
      this._ticketService.directCloseStatus.subscribe((data) => {
        this.closeData = data;
        this.buttonLoader = data;
      })
    )
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }

  directClose(): void {
    if (this.textArea.trim().length == 0 ) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-enter-closing-ticket'),
        },
      });
    } else {
      this.directCloseEmit.emit(this.textArea);
      this.buttonLoader = true;
    }
  }

  closePostReply(): void {
    this._bottomSheet.dismiss();
    this.replyEvent.emit(false);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  noteTextChange(nodeElement:any, holder: any) {
    if (this[holder] && this[holder]?.length > 2500) {
      this[holder] = this[holder].substring(0, 2500)
      if (nodeElement) nodeElement.value = this[holder].substring(0, 2500)
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('character-limit-note'),
        },
      });
      this._cdr.detectChanges();
      return false;
    }
  }
}
