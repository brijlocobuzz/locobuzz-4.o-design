import { ChangeDetectorRef, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { CommonService } from 'app/core/services/common.service';
import { MaplocobuzzentitiesService } from 'app/core/services/maplocobuzzentities.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-add-associate-channels',
    templateUrl: './add-associate-channels.component.html',
    styleUrls: ['./add-associate-channels.component.scss'],
    standalone: false
})
export class AddAssociateChannelsComponent {
  searchedUsers: Array<object> = [];
  selectedAuthorSocialID: string;
  selectedChannel: string = '1';
  loaderTypeEnum = loaderTypeEnum;
  noUserFound = false;
  addAssociateLoading: boolean = false;
  isLoading: boolean;
  defaultLayout: boolean = false;
  subs = new SubSink();
  constructor(
    private _postDetailService: PostDetailService,
    private _ticketService: TicketsService,
    private mapLocobuzz: MaplocobuzzentitiesService,
    private snackBar: MatSnackBar,
    private commonService: CommonService,
    private _cdr:ChangeDetectorRef,
    private translate: TranslateService,
    public dialogRef: MatDialogRef<AddAssociateChannelsComponent>
  ) {}
  ngOnInit(): void {
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }
  searchUser(text): void {
    if (text.value && text.value.trim() !== '') {
      const object = {
        BrandInfo: this._postDetailService.postObj.brandInfo,
        ChannelGroup: this.selectedChannel,
        SearchText: text.value,
        Offset: 0,
        NoOfRows: 10,
      };
      this.addAssociateLoading = true;
      this.searchedUsers = [];
      this._ticketService.searchByNameUsers(object).subscribe(
        (response: { data: []; message: string; success: boolean }) => {
          if (response?.data && response?.data.length > 0) {
            this.searchedUsers = response.data;
            this.noUserFound = false;
          } else {
            this.noUserFound = true;
          }

          this.addAssociateLoading = false;
        },
        (err) => {
          this.searchedUsers = [];
          this.addAssociateLoading = false;
        }
      );
    } else {
      this.searchedUsers = [];
      this.addAssociateLoading = false;
    }
  }

  onSelect(event): void {
    this.selectedAuthorSocialID = event.socialId;
  }

  saveUsers(): void {
    this.isLoading = true;
    if (this.selectedAuthorSocialID) {
      const source = this.mapLocobuzz.mapMention(
        this._postDetailService.postObj
      );
      const object = {
        BrandInfo: source.brandInfo,
        Author: source.author,
        MapAuthorSocialID: this.selectedAuthorSocialID,
        Mapchannelgroupid: Number(this.selectedChannel),
      };

      // console.log(object);

      this._ticketService.SaveMapSocialUsers(object).subscribe(
        (data) => {
          if (data.success) {
            // console.log(data)
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('User-Added-Successfully'),
              },
            });
            this.dialogRef.close(true);
          } else {
            this.snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: data.message ? data.message:this.translate.instant('Unable-to-map-user'),
              },
            });
          }
          this.isLoading = false;
        },
        (err) => {
          this.snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Something went wrong'),
            },
          });
          this.isLoading = false;
        }
      );
    } else {
      this.snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-Select-The-User'),
        },
      });
      this.isLoading = false;
    }
  }
}
