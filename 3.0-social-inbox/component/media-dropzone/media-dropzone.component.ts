import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locobuzzAnimations } from '@locobuzz/animations';
import { BrandInfo } from 'app/core/models/viewmodel/BrandInfo';
import { MediaContent } from 'app/core/models/viewmodel/MediaContent';
import { SaveMediaListParameters } from 'app/core/models/viewmodel/SaveMediaListParameters';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { emitKeypressEvents } from 'readline';
import { SubSink } from 'subsink/dist/subsink';
import { notificationType } from './../../../core/enums/notificationType';
import { CustomSnackbarComponent } from './../../../shared/components/custom-snackbar/custom-snackbar.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-media-dropzone',
    templateUrl: './media-dropzone.component.html',
    styleUrls: ['./media-dropzone.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class MediaDropzoneComponent implements OnInit, OnDestroy {
  constructor(
    private _filterService: FilterService,
    private _postDetailService: PostDetailService,
    private _mediaGalleryService: MediagalleryService,
    public dialogRef: MatDialogRef<MediaDropzoneComponent>,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public socialPostdata: any
  ) {}

  isImageDropped: boolean;
  filesUploaded: any[] = [];
  mediaContent: MediaContent[];
  uploadLoading = false;
  defaultLayout: boolean = false;
  subs = new SubSink();
  ngOnInit(): void {
    this.subscribetoDropzoneEvent();
  }
  subscribetoDropzoneEvent(): void {
    this.subs.add(
      this._mediaGalleryService.EmitStarChangeEvent.subscribe((event) => {
        if (event) {
          const obj = JSON.parse(JSON.stringify(event));
          if (obj.value) {
            this.starAffect(obj);
          }
        }
      })
    );

    this.subs.add(
      this._mediaGalleryService.EmitPillsChanged.subscribe((event) => {
        if (event) {
          const obj = JSON.parse(JSON.stringify(event));
          if (obj.pillvalue) {
            this.onPillsChanged(obj);
          }
        }
      })
    );
  }

  onPillsChanged(event): void {
    if (this.mediaContent && this.mediaContent.length > 0) {
      if (event.operation === 'remove') {
        this.mediaContent = this.mediaContent.map((obj) => {
          if (obj.displayName === event.id) {
            const index = obj.mediaTagsList.indexOf(event.pillvalue);
            if (index > -1) {
              obj.mediaTagsList.splice(index, 1);
            }
          }
          return obj;
        });
      } else if (event.operation === 'add') {
        this.mediaContent = this.mediaContent.map((obj) => {
          if (obj.displayName === event.id) {
            if (obj.mediaTagsList && obj.mediaTagsList.length > 0) {
              obj.mediaTagsList.push(event.pillvalue);
            } else {
              obj.mediaTagsList = [];
              obj.mediaTagsList.push(event.pillvalue);
            }
          }
          return obj;
        });
      }
    }
  }

  onImageDropped(event): void {
    if (event.addedFiles.length > 0) {
      let totalFileSize = 0;
      event.addedFiles.forEach((element) => {
        totalFileSize = totalFileSize + element.size;
      });
      // if (totalFileSize > 25000000)
      // {
      //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
      //     duration: 5000,
      //     data: {
      //       type: notificationType.Warn,
      //       message: 'Total size of the file should be less than or equal to 25 MB.',
      //     },
      //   });
      //   return;
      // }
      this.isImageDropped = true;
      this.filesUploaded.push(...event.addedFiles);
      this.uploadLoading = true;
      this.uploadFilesToServer(event);
    }
  }

  onImageRemoved(event): void {
    this.filesUploaded.splice(this.filesUploaded.indexOf(event), 1);
    if (this.filesUploaded.length === 0) {
      this.isImageDropped = false;
    }
    if (this.mediaContent && this.mediaContent.length > 0) {
      this.mediaContent = this.mediaContent.filter((obj) => {
        return obj.displayName !== event.name;
      });
    }
  }

  uploadFilesToServer(event): void {
    let brandInfo;
    if (!this.socialPostdata) {
      brandInfo = {
        BrandID: this._postDetailService.postObj.brandInfo.brandID,
        BrandName: this._postDetailService.postObj.brandInfo.brandName,
      };
    } else {
      const fetchBrandDetails: BrandList =
        this._filterService.fetchedBrandData.find(
          (obj) => obj.brandID == this.socialPostdata.brandID
        );
      brandInfo = {
        BrandID: fetchBrandDetails.brandID,
        BrandName: fetchBrandDetails.brandName,
      };
    }
    if (this.validateMediaFiles(this.filesUploaded)) {
      // Use the filtered valid files for upload
      this._mediaGalleryService
        .uploadFilesToServer(this.filesUploaded, brandInfo)
        .subscribe((data) => {
          this.uploadLoading = false;
          if (data) {
            // console.log(`file data`, data);
            if (data) {
              this.mediaContent = data;
              data.forEach((serverobj) => {
                this.filesUploaded.forEach((obj) => {
                  if (serverobj.displayName === obj.name) {
                    obj['mediaType'] = serverobj.mediaType;
                  }
                });
              });
              /* this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: this.translate.instant('File-uploaded-successfully'),
                },
              }); */
            }
          } else {
            this.filesUploaded = this.filesUploaded.filter((obj) => {
              return !event.addedFiles.some((obj2) => {
                return obj.name === obj2.name;
              });
            });
            if (this.filesUploaded.length === 0) {
              this.isImageDropped = false;
            }
          }
        });
    } else {
      this.uploadLoading = false;
    }
  }

  validateMediaFiles(filesToUpload: any[]): boolean {
    if (filesToUpload.length == 0){
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Must-upload-media-file'),
        },
      });
      return false;
    }

    const invalidFiles: string[] = [];
    
    // eslint-disable-next-line @typescript-eslint/prefer-for-of
    for (let i = 0; i < filesToUpload.length; i++) {
      let fileextension = '';
      let isFileValid = true;
      
      if (filesToUpload[i].type.indexOf('image') > -1) {
        fileextension = filesToUpload[i].name
          .substring(filesToUpload[i].name.lastIndexOf('.') + 1)
          .toLowerCase();
        if (
          fileextension !== 'gif' &&
          fileextension !== 'png' &&
          fileextension !== 'jpeg' &&
          fileextension !== 'jpg'
        ) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Uploaded-file-valid-image'),
            },
          });
          isFileValid = false;
        }
        if (filesToUpload[i].size > (25 * 1024 * 1024)) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Image-size-limit'),
            },
          });
          isFileValid = false;
        }
      }
      if (filesToUpload[i].type.indexOf('video') > -1) {
        fileextension = filesToUpload[i].name
          .substring(filesToUpload[i].name.lastIndexOf('.') + 1)
          .toLowerCase();
        if (
          fileextension !== 'mp4' &&
          fileextension !== 'mov' &&
          fileextension !== 'flv' &&
          fileextension !== 'wmv' &&
          fileextension !== 'mkv'
        ) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Video-file-type'),
            },
          });
          isFileValid = false;
        }
        if (filesToUpload[i].size > 2147483648) {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Video-size-2gb'),
            },
          });
          isFileValid = false;
        }
      }

      if (!isFileValid) {
        invalidFiles.push(filesToUpload[i].name);
      }
    }

    // Remove invalid files from the upload list
    if (invalidFiles.length > 0) {
      this.filesUploaded = this.filesUploaded.filter(file => !invalidFiles.includes(file.name));
      
      // If all files are invalid, return false
      if (this.filesUploaded.length === 0) {
        this.isImageDropped = false;
        return false;
      }
      
      // Show summary message for partially valid uploads
      /* this.translate.instant('Must-upload-media-file') */
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 7000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('partial-upload-media-file'),
        },
      });
    }

    return true;
  }

  saveFilesToServer(): void {
    let brandInfo: BrandInfo;
    if (this.socialPostdata) {
      const fetchBrandDetails: BrandList =
        this._filterService.fetchedBrandData.find(
          (obj) => obj.brandID == this.socialPostdata.brandID
        );
      brandInfo = {
        brandID: Number(fetchBrandDetails.brandID),
        brandName: fetchBrandDetails.brandName,
        categoryGroupID: Number(fetchBrandDetails.categoryGroupID),
        // categoryID: Number(fetchBrandDetails.categoryID),
        // categoryName: fetchBrandDetails.categoryName,
        mainBrandID: 0,
        compititionBrandIDs: [],
        brandFriendlyName: fetchBrandDetails.brandFriendlyName,
        brandLogo: fetchBrandDetails.rSmallImageURL,
        isBrandworkFlowEnabled: fetchBrandDetails.isSLAFLRBreachEnable,
        brandGroupName: fetchBrandDetails.brandGroup,
      };
    }

    const saveMediaParam: SaveMediaListParameters = {
      brandInfo: this.socialPostdata
        ? brandInfo
        : this._postDetailService.postObj.brandInfo,
      mediaList: this.mediaContent,
    };

    if (this.validateMediaFiles(this.filesUploaded)) {
      this._mediaGalleryService
        .saveFilesToServer(saveMediaParam)
        .subscribe((data) => {
          // console.log(`file data`, data);
          if (!data.status) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: data.message,
              },
            });
          } 
          else {
            /* for saving media info into db */
            this._mediaGalleryService.saveMediaInfo(saveMediaParam).subscribe((res) => {
              if (res) console.log(res);
            })
            /* for saving media info into db */
            this._mediaGalleryService.LoadMediaGallery.next(true);
            this.dialogRef.close(true);
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('File-saved-successfully'),
              },
            });

            
          }
        });
    }
  }

  public starAffect(event): void {
    if (this.mediaContent && this.mediaContent.length > 0) {
      this.mediaContent = this.mediaContent.map((obj) => {
        if (obj.displayName === event.id) {
          obj.rating = event.value;
        }
        return obj;
      });
    }
  }

  cancelSaving(): void {
    this._mediaGalleryService.cancelSaving().subscribe((data) => {
      // console.log(`cancel data`, data);
      // this._mediaGalleryService.LoadMediaGallery.next(true);
    });
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
