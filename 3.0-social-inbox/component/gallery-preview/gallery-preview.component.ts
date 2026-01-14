import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProgressDialogModel } from 'app/accounts/component/progress-loader/progress-loader.component';
import { SocialScheduleService } from 'app/social-schedule/social-schedule.service';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { FilterService } from 'app/social-inbox/services/filter.service';
@Component({
    selector: 'app-gallery-preview',
    templateUrl: './gallery-preview.component.html',
    styleUrls: ['./gallery-preview.component.scss'],
    standalone: false
})
export class GalleryPreviewComponent implements OnInit {
  imgDataFromParent: any;
  mediaDetails: any;
  tags: any;
  loader: boolean = true;
  loaderTypeEnum = loaderTypeEnum;
  videoPlay = true;
  isPdfLoading: boolean = true;
  @ViewChild('video') video: ElementRef;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _service: SocialScheduleService,
    private _cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.imgDataFromParent = JSON.parse(
      JSON.stringify(this.data.image ? this.data.image : this.data)
    );
    if (this.imgDataFromParent?.mediaInfo) {
      this.mediaDetails = this.imgDataFromParent?.mediaInfo;
      this.loader = false;
    } else {
      const getmediainfo = {
        mediaID: this.imgDataFromParent.mediaID,
        URL: this.imgDataFromParent.mediaPath,
        isUGC: this.imgDataFromParent.isUGC,
        mediaName: this.imgDataFromParent.displayFileName,
      };
      const data = {
        brandInfo: {
          BrandID: this.data?.brandInfo?.brandID,
          BrandName: this.data?.brandInfo?.brandName,
          CategoryID: this.data?.brandInfo?.categoryID,
          CategoryName: this.data?.brandInfo?.categoryName,
        },
        media: [getmediainfo],
      };
      this._service.getMediaDetails(data).subscribe((res) => {
        if (res.success) {
          this.loader = false;
          this.mediaDetails = res.data[0];
          this.mediaDetails.tags = this.tags;
          this.mediaDetails.mediaPath = this.imgDataFromParent.mediaPath;
          this.mediaDetails.mediaType = this.imgDataFromParent.mediaType;
          this.mediaDetails.rating = this.imgDataFromParent.rating;
          this._cd.detectChanges();
        }
      });
    }
    if (this.imgDataFromParent && this.imgDataFromParent.mediaTags) {
      const currentTags = JSON.parse(
        JSON.stringify(this.imgDataFromParent.mediaTags)
      );
      this.tags = currentTags;
    }
  }
  public get mediaTypeEnum(): typeof MediaEnum {
    return MediaEnum;
  }
  videoPlayer(): void {
    if (this.video.nativeElement.pause()) {
      this.video.nativeElement.play();
      this.videoPlay = false;
    } else {
      this.videoPlay = true;
    }
  }
  buttonVideoPlay(): void {
    this.video.nativeElement.play();
    this.videoPlay = false;
  }

  onLoadComplete(){
    this.isPdfLoading = false;
  }
}
