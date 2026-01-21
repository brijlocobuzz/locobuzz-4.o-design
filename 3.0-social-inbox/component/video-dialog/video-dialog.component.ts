import { Component, Inject, OnInit, ChangeDetectorRef, ViewChild, ElementRef, HostListener, ChangeDetectionStrategy, AfterViewInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { MediaContent } from 'app/core/models/viewmodel/MediaContent';
import { fromEvent } from "rxjs";
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from 'app/shared/components';
import { notificationType } from 'app/core/enums/notificationType';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-video-dialog',
    templateUrl: './video-dialog.component.html',
    styleUrls: ['./video-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class VideoDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('image') image: ElementRef;
  @ViewChild('scaleImageInput') scaleImageInput: ElementRef;
  MediaEnum = MediaEnum;
  attachmentData: Array<any> = [];
  zoomIn: any;
  zoomInCount = 1;
  imageScale: number;
  setvalue: any;
  videoErrorMessage: boolean = false;
  channelGroupEnum = ChannelGroup;
  selectedIndex?:number=0
  previousIndex?:number=0
  constructor(@Inject(MAT_DIALOG_DATA) Attachments: Array<MediaContent>,
      private _snackBar: MatSnackBar,
      private translate: TranslateService,
    private dialogRef: MatDialogRef<VideoDialogComponent>,
  private cdkRef:ChangeDetectorRef, private postDetailsService: PostDetailService
) {
    // Attachments = Attachments.filter((attachment) => {
    //   return attachment?.thumbUrl != null;
    // });
    this.attachmentData = Attachments || [];
  }
  ngOnInit(): void {
    // fromEvent(window, "wheel").subscribe((ev: any) => {
    //   if (ev.wheelDelta > 0) {
    //     this.mediaZoomIn();
    //   }
    //   if (ev.wheelDelta < 0) {
    //     this.mediaZoomOut();
    //   }
    // });
    this.selectedIndex = this.postDetailsService?.galleryIndex
    this.previousIndex = this.postDetailsService?.galleryIndex
    if (this.attachmentData)
    {
      this.attachmentData.forEach((obj)=>{
        if (obj.mediaUrl instanceof Object) obj.mediaUrl = obj.mediaUrl?.fileUrl;
        if (obj.mediaType == MediaEnum.ANIMATEDGIF){
          if (obj.mediaUrl && obj.mediaUrl.includes('mp4')){
            obj.mediaType= MediaEnum.VIDEO
          }
        }
        obj.isFacebookUrl = obj.mediaUrl.includes('https://www.facebook.com/');
      })
    }
  }

  onImgError(attachmentitem, url) {
    if (url) {
      if (url.includes('WebHook/GetTwitterDMImage')){
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Twitter-Rate-Limit-Exceeded'),
          },
        });
        this.dialogRef.close();
        this.cdkRef.detectChanges();
        return
      }
      attachmentitem.mediaUrl = url;
      this.cdkRef.detectChanges();
    }
  }
  mediaZoomIn(): void {
    this.zoomInCount = this.zoomInCount + 0.5;
    (document.querySelector('.image__block--image') as HTMLElement).style.setProperty(
      "transform",
      `scale(${this.zoomInCount})`
    );
  }
  mediaZoomOut(): void {
    this.zoomInCount = this.zoomInCount - 0.5;
    this.zoomInCount = this.zoomInCount < 1 ? 1 : this.zoomInCount;
    if (this.zoomInCount == 1) {
      (document.querySelector('.image__block--image') as HTMLElement).style.setProperty(
        "transform",
        `none`
      );
    } else {
      (document.querySelector('.image__block--image') as HTMLElement).style.setProperty(
        "transform",
        `scale(${this.zoomInCount})`
      );
    }

  }

  // @HostListener("mousewheel", ["$event"]) onMousewheel(event) {
  //   if (event.ctrlKey == true) {
  //     event.preventDefault();
  //     if (event.wheelDelta > 0) {
  //        this.mediaZoomIn();
  //     }
  //     if (event.wheelDelta < 0) {
  //       this.mediaZoomOut();
  //     }
  //   }
  // }

  ngAfterViewInit(): void {
    var v = document.querySelector('video#vid');
    var sources = v?.querySelectorAll('source');

    if (sources && sources?.length !== 0) {
      var lastSource = sources[sources?.length - 1];

      lastSource.addEventListener('error', () => {
        this.videoErrorMessage = true;
        this.cdkRef.detectChanges();
      });
    }
  }
  facebookRedirecturl(item:any){
  console.log(item)
    if (item?.mediaUrl.includes('https://www.facebook.com/')) {
      window.open(item.mediaUrl, '_blank');
    }
  }

  onTabChanged(event:any){
    if (this.attachmentData[event.index]?.mediaType == MediaEnum.VIDEO && this.attachmentData[event.index]?.mediaUrl.includes('https://video.twimg.com')) {
      window.open(this.attachmentData[event.index].mediaUrl, '_blank','noopener,noreferrer');
      this.selectedIndex = this.previousIndex;
    }
    this.previousIndex = event.index;
  }
}
