import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AiTicketTagService } from 'app/accounts/services/ai-ticket-tag.service';
import { brandData } from '../post-reply/post-reply.component';
import { P } from '@angular/cdk/keycodes';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from 'app/shared/components';
import { notificationType } from 'app/core/enums/notificationType';
import { error } from 'console';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { SubSink } from 'subsink';
import { CommonService } from 'app/core/services/common.service';

@Component({
    selector: 'app-edit-ai-ticket-label',
    templateUrl: './edit-ai-ticket-label.component.html',
    styleUrls: ['./edit-ai-ticket-label.component.scss'],
    standalone: false
})
export class EditAiTicketLabelComponent implements OnInit {
  inputValue;
  loading: boolean;
  brandInfo: brandData;
  ticketTagList = [];
  originalTicketTagList = [];
  defaultSelectedTagList = [];
  selectedTagList = [];
  ticketID;
  searchdebouncer: Subject<any> = new Subject<any>();
  subs = new SubSink();
  defaultLayout: boolean = false;

  constructor(
    public dialog: MatDialog,
    private _aiTicketTagService: AiTicketTagService,
    private _snackBar: MatSnackBar,
    private translate: TranslateService,
    private dialogRef: MatDialogRef<EditAiTicketLabelComponent>,
    private commonService: CommonService,
    @Optional()
    @Inject(MAT_DIALOG_DATA)
    public baseData:any
  ) {
    this.brandInfo = this.baseData && this.baseData.brandInfo ? this.baseData.brandInfo : null;
    this.defaultSelectedTagList = this.baseData && this.baseData?.selectedTagList ? this.baseData.selectedTagList : [];
    this.ticketID = this.baseData && this.baseData?.ticketID ? this.baseData.ticketID : null;
   }

  ngOnInit(): void {
    this.getAllBrandTags();
    this.searchdebouncer.pipe(debounceTime(500))
      .subscribe((result) => {
        if (result) {
          if (result.value) {
            this.ticketTagList = this.originalTicketTagList.filter(res =>
              res.tagName.toLowerCase().includes(result.value.toLowerCase())
            );
            this.selectedTagList = this.originalTicketTagList.filter(res => res.status);
          } else {
            this.ticketTagList = JSON.parse(JSON.stringify(this.originalTicketTagList));
            this.selectedTagList = this.originalTicketTagList.filter(res => res.status);
          }
        }
      });

    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
        }
      })
    )
  }

  getAllBrandTags(){
    this._aiTicketTagService.GetAllBrandTags(this.brandInfo.brandID).subscribe(res => {
      console.log(res);
      if (res.success){
        this.ticketTagList = [];
        if (res.data && res.data.length){
          res.data.forEach(tag => {
            if (tag.aiTicketTagsAndDescriptions && tag.aiTicketTagsAndDescriptions.length){
              const isExist = this.defaultSelectedTagList.find(selectedTag => selectedTag.tagName == tag.aiTicketTagsAndDescriptions[0]?.tagName)
              const obj = {
                tagName: tag.aiTicketTagsAndDescriptions[0].tagName,
                status: isExist ? true : false
              }
              this.ticketTagList.push(obj);
            }
          });
          if (this.defaultSelectedTagList && this.defaultSelectedTagList.length){
            this.defaultSelectedTagList.forEach(res => {
              const isExist = this.ticketTagList.find(tag => tag.tagName == res.tagName);
              if (!isExist){
                const obj = {
                  tagName: res.tagName,
                  status: true
                }
                this.ticketTagList.unshift(obj);
              }
            })
          }
          this.originalTicketTagList = JSON.parse(JSON.stringify(this.ticketTagList));
          this.selectedTagList = this.ticketTagList.filter(res => res.status);
        }
      }
    });
  }

  filter(inputValue){
    this.searchdebouncer.next({ value: inputValue });
  }
  onSelectTag(event,tag){
    const index = this.ticketTagList.findIndex(res => res.tagName == tag.tagName);
    const originalIndex = this.originalTicketTagList.findIndex(res => res.tagName == tag.tagName);
    if(event){
      if (index > -1){
        this.ticketTagList[index].status = true;
      }
      if (originalIndex > -1) {
        this.originalTicketTagList[originalIndex].status = true;
      }
    } else {
      if (index > -1) {
        this.ticketTagList[index].status = false;
      }
      if (originalIndex > -1) {
        this.originalTicketTagList[originalIndex].status = false;
      }
    }
    let list = this.originalTicketTagList.filter(res => res.status);
    if(list && list.length){
      this.selectedTagList = list.map(res => res.tagName);
    } else {
      this.selectedTagList = [];
    }
  }

  submit(){
    if (!this.selectedTagList.length){
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Please-select-at-least-one-tag'),
        },
      });
      return
    }

    const ticketTagging = [];
    this.selectedTagList.forEach(res => {
      const ticketTaggingSubTag = [];
      const isExist = this.defaultSelectedTagList.find(obj=> obj.tagName == res);
      ticketTaggingSubTag.push(res);
      ticketTaggingSubTag.push(isExist ? isExist.score : 1); 
      ticketTagging.push(ticketTaggingSubTag);
    })

    const obj = {
      brandId: this.brandInfo.brandID,
      ticketID: this.ticketID,
      ticketTagging: JSON.stringify(ticketTagging),
    }
    this.loading = true;
    this._aiTicketTagService.UpdateTicketTags(obj).subscribe(res => {
      this.loading = false;
      if(res.success){
        this.dialogRef.close(JSON.stringify(ticketTagging));
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Success,
            message: this.translate.instant('AI-Tag-changed-successfully'),
          },
        });
      }else {
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Unable-to-tag'),
          },
        });
      }
    }, error => {
      this.loading = false;
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Error,
          message: this.translate.instant('Unable-to-tag'),
        },
      });
    });
  }
}
