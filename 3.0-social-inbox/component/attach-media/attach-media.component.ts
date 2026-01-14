import { ChangeDetectorRef, Component, effect, EventEmitter, Input, OnDestroy, OnInit, Output, signal, SimpleChanges, untracked } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { MediaGalleryComponent } from '../media-gallery/media-gallery.component';
import { SectionEnum } from 'app/core/enums/SectionEnum';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';

@Component({
    selector: 'app-attach-media',
    templateUrl: './attach-media.component.html',
    styleUrls: ['./attach-media.component.scss'],
    standalone: false
})
export class AttachMediaComponent implements OnInit, OnDestroy {

  mediaSelectedAsync = new Subject<UgcMention[]>();
  mediaSelectedAsync$ = this.mediaSelectedAsync.asObservable();
  selectedNoteMedia: UgcMention[] = [];
  mediaTypeEnum = MediaEnum
  subs = new SubSink();
  @Input() postDetailTab?: LocobuzzTab = null;
  @Input() postData: BaseMention;
  @Input() selectedTicketBrandIdforBulk: number[] = [];
  @Input() mediaAttachments: any[] = [];

  clearSignal= signal<boolean>(true)
  effectClearNoteAttachmentSignal;
  defaultLayout: boolean = false;
  constructor(
    private mediaGalleryService: MediagalleryService,
    private _dialog: MatDialog,
    private _replyService: ReplyService,
    private _cdr:ChangeDetectorRef,
    private _sidebarService:SidebarService,
    private commonService: CommonService
    
    ) {
    let onLoadClearNote = true;
    this.effectClearNoteAttachmentSignal= effect(() => {
      const value = this.clearSignal() ? this._replyService.clearNoteAttachmentSignal() : untracked(() => this._replyService.clearNoteAttachmentSignal());
            if (!onLoadClearNote && value) {
              this.clearNoteAttachmentSignalChanges(value);
            } else {
              onLoadClearNote = false;
            }
          }, { allowSignalWrites: true });
    }

  ngOnInit(): void {
    this.clearInputs()
    this.subscribeToObservables();
    // this.subs.add(
    //   this._replyService.clearNoteAttachment.subscribe(res => {
    //     if(res){
    //       if(this.selectedNoteMedia?.length > 0){
    //         this.clearInputs()
    //       }
    //     }
    //   })
    // );
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    if('mediaAttachments' in changes){
      this.mediaGalleryService.selectedNoteMedia = this.mediaAttachments;
      this._replyService.selectedNoteMedia.next({ media: this.mediaAttachments, section: SectionEnum.Ticket });
      console.log('mediaAttachments in attach media component', this.selectedNoteMedia, this.mediaAttachments);
    }
  }

  clearNoteAttachmentSignalChanges(res){
    if (res) {
      if (this.selectedNoteMedia?.length > 0) {
        this.clearInputs()
      }
    }
  }

  openMediaDialog(): void {
    if(this.postDetailTab){
      this.mediaGalleryService.startDateEpoch =
        this.postDetailTab?.tab?.Filters?.startDateEpoch;
      this.mediaGalleryService.endDateEpoch =
        this.postDetailTab?.tab?.Filters?.endDateEpoch;
    }
      this._dialog.open(MediaGalleryComponent, {
        data: {
          brandID: this.postData ? this.postData?.brandInfo?.brandID : this.selectedTicketBrandIdforBulk,
          type: 'AddNoteGallery',
        },
        autoFocus: false,
        panelClass: ['full-screen-modal'],
      });
      // this.cdkRef.detectChanges();
  }
  
  subscribeToObservables(): void {
    this.subs.add(
      this._replyService.selectedNoteMedia
        .pipe(filter((res) => res.section === SectionEnum.Ticket))
        .subscribe((ugcarray) => {
          if (ugcarray?.media && ugcarray?.media.length > 0) {
            this.selectedNoteMedia = [...ugcarray.media];
            this.mediaSelectedAsync.next(this.selectedNoteMedia);
            this._replyService.selectNoteMediaVal(this.selectedNoteMedia);
          }
        })
    );
  }
  
  removeselectedNoteMedia(ugcMention: UgcMention): void {
    if (ugcMention) {
      this.selectedNoteMedia = this.selectedNoteMedia.filter((obj) => {
        return obj.mediaID !== ugcMention.mediaID;
      });
      this.mediaSelectedAsync.next(this.selectedNoteMedia);
      this.mediaGalleryService.selectedNoteMedia = this.selectedNoteMedia;
      this._replyService.selectNoteMediaVal(this.selectedNoteMedia);
    }
  }

  clearInputs(): void {
    this.selectedNoteMedia = [];
    this._replyService.selectedNoteMedia.next({ media: [] });
    this._replyService.selectedNoteMediaVal = []
    this.mediaGalleryService.selectedNoteMedia = [];
    this.mediaSelectedAsync.next(this.selectedNoteMedia);
    this.mediaAttachments = [];
  }

  ngOnDestroy(): void {
    this.clearSignal.set(false);
    this._cdr.detectChanges();
    this.clearInputs()
    this.subs.unsubscribe();
    this.mediaSelectedAsync.complete();
    this.selectedNoteMedia = null;
    this.mediaTypeEnum = null;
    this.postDetailTab = null;
    this.postData = null;
    this.selectedTicketBrandIdforBulk = [];
    this.mediaGalleryService = null;
    this._dialog = null;
    this._replyService = null;
  }

}
