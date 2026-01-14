import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { BrandInfo } from 'app/core/models/viewmodel/BrandInfo';
import { UpdateMediaDetailParameters } from 'app/core/models/viewmodel/MediaGalleryParameters';
import { UgcMention } from 'app/core/models/viewmodel/UgcMention';
import { MediagalleryService } from 'app/core/services/mediagallery.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { notificationType } from './../../../core/enums/notificationType';
import { CustomSnackbarComponent } from './../../../shared/components/custom-snackbar/custom-snackbar.component';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-media-dropitem',
    templateUrl: './media-dropitem.component.html',
    styleUrls: ['./media-dropitem.component.scss'],
    standalone: false
})
export class MediaDropitemComponent implements OnInit {
  @Input() onUpload: boolean = false;
  @Input() image: string;
  @Input() inModal: boolean = false;
  @Input() file: File;
  @Input() displayName: string;
  @Input() ugcMention: UgcMention;
  @Output() removeSelected = new EventEmitter();
  @ViewChild('tagInput') tagInput: ElementRef;
  visible = true;
  selectable = true;
  removable = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  tags: any[] = [];
  alltags: any[] = [];
  filteredtags: any[] = [];
  mediaEnum = MediaEnum;
  defaultLayout: boolean = false;

  constructor(
    private _mediaGalleryService: MediagalleryService,
    private _snackBar: MatSnackBar,
    private _postDetailService: PostDetailService,
    private _ticketService: TicketsService,
    public dialogRef: MatDialogRef<MediaDropitemComponent>,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public brandData: BrandInfo
  ) {}

  ngOnInit(): void {
    if (this.ugcMention && this.ugcMention.mediaTags) {
      const currentTags = JSON.parse(JSON.stringify(this.ugcMention.mediaTags));
      this.tags = currentTags;
    }

    this.GetAvailableMediaTags();
  }

  onImageRemoved(file): void {
    this.removeSelected.emit(file);
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our fruit
    if (value.trim()) {
      this.tags.push(value.trim());
      this._mediaGalleryService.emitPillsChanged({
        operation: 'add',
        pillvalue: value,
        id: this.file ? this.file.name : this.displayName,
      });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  selectedTag(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.value;

    // Add our fruit
    if (value.trim()) {
      this.tags.push(value.trim());
      this._mediaGalleryService.emitPillsChanged({
        operation: 'add',
        pillvalue: value,
        id: this.file ? this.file.name : this.displayName,
      });
    }
  }

  filterTags(event): any {
    const value = event.target.value;
    this.filteredtags = this.alltags.filter((tag) =>
      tag.toLowerCase().includes(value)
    );
  }

  remove(tag): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    if (tag) {
      this._mediaGalleryService.emitPillsChanged({
        operation: 'remove',
        pillvalue: tag,
        id: this.file ? this.file.name : this.displayName,
      });
    }
    // }
  }
  UpdateFileToServer(): void {
    const updateMediaObj: UpdateMediaDetailParameters = {
      brandInfo: this._postDetailService.postObj
        ? this._postDetailService.postObj.brandInfo
        : this.brandData,
      mediaID: this._mediaGalleryService.currentUGC.mediaID,
      isUGC: this._mediaGalleryService.currentUGC.isUGC,
      mediaRating: this._mediaGalleryService.currentUGC.rating,
      mediaTags: this._mediaGalleryService.currentUGC.mediaTags,
    };
    this._mediaGalleryService
      .updateFileToServer(updateMediaObj)
      .subscribe((data) => {
        // console.log(`file data`, data);
        this._mediaGalleryService.LoadMediaGallery.next(true);
        this.dialogRef.close(true);
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('File-Updated-Successfully'),
          },
        });
      });
  }

  GetAvailableMediaTags(): void {
    this._ticketService.GetAvailableMediaTags().subscribe((data) => {
      if (data.success) {
        this.alltags = data.data;
        this.filteredtags = data.data;
      }
    });
  }
}
