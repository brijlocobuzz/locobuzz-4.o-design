import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { DynamicCrmIntegrationService } from 'app/accounts/services/dynamic-crm-integration.service';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { forkJoin } from 'rxjs';
import { VideoDialogComponent } from '../video-dialog/video-dialog.component';

@Component({
    selector: 'app-quickwork-manual',
    templateUrl: './quickwork-manual.component.html',
    styleUrls: ['./quickwork-manual.component.scss'],
    standalone: false
})
export class QuickworkManualComponent implements OnInit {
  dataJson: any = [];
  ConversationLog: string = ''
  dataFieldsWithGroupIdAndColor = [];
  selectedMedia=[]
  mediaTypeEnum = MediaEnum;
  conversationDetails:any

  constructor(private _dynamicCrmIntegrationService: DynamicCrmIntegrationService, @Inject(MAT_DIALOG_DATA) public data: any, private _postDetailService: PostDetailService,
private matDialog: MatDialog) {
    this._postDetailService.postObj = data?.ticketInfo;
    // this._dynamicCrmIntegrationService.GetFieldJson(+data?.brandInfo?.brandID).subscribe((res) => {
    //   this.dataJson = res.data?.datafieldsGroups

    // })
    // this._dynamicCrmIntegrationService.GetpushedData(data.ticketInfo.ticketID).subscribe((res)=>{
    //   if(res.success){
    //     this.dataJson = res.data
    //     this.dataJson = this.dataJson.sort((a, b) => a.priority - b.priority).filter((r) => r.field!="TagId")
    //   }
    // })
    // const GetpushedData$ = this._dynamicCrmIntegrationService.GetpushedData(data.ticketInfo.ticketID);
    // const GetFieldJson$ = this._dynamicCrmIntegrationService.GetFieldJson(+data?.ticketInfo?.brandInfo?.brandID);
    // forkJoin([GetpushedData$, GetFieldJson$]).subscribe(
    //   ([data1, data2]) => {
    //     if (data1) {
    //       data2.data.datafieldsGroups = data2.data.datafieldsGroups ? data2.data?.datafieldsGroups.filter(r=>r.id!=0) : []
    //       if (data2?.data?.datafieldsGroups) {
    //         data2?.data?.datafieldsGroups.unshift({
    //           "name": "",
    //           "id": 0,
    //           "color": "",
    //           "fieldsCount": 0,
    //           "mandatoryFields": "",
    //         })
    //         data2.data.datafieldsGroups = data2?.data?.datafieldsGroups?.map(obj => ({ ...obj, fields: data1.data.filter((r) => r.groupId == obj.id).sort((a, b) => a.priority - b.priority).filter((r) => r.field != "TagId" && r.field != "ConversationLog") }))
    //         this.dataFieldsWithGroupIdAndColor = data2?.data?.datafieldsGroups
    //         // console.log(this.dataFieldsWithGroupIdAndColor);
    //       }
    //     }
    //   }
    // )
    this.selectedMedia = (data?.formAttachment?.fieldData) ? this.getMediaEnumByExtension(data?.formAttachment?.fieldData?.split(',')) : []
    this.dataFieldsWithGroupIdAndColor = data?.formData;

    this.dataFieldsWithGroupIdAndColor?.forEach((x)=>{
      x.fields?.forEach(y => {
        y.hideField = (y?.defaultVisibility != null) ? y?.defaultVisibility == true ? false : true : false;
          this.checkFieldRequirement(y, x.fields)
      });
    })

    this.ConversationLogFn(data)

    this.conversationDetails =  this.dataFieldsWithGroupIdAndColor.flatMap(s => s.fields || []).find(f => f.field === "ConversationDetails")

    if(this.conversationDetails)
    {
      this.conversationDetails.fieldData = this.conversationDetails.fieldData.replace(/\\n/g, '\n');
    }

    this.dataFieldsWithGroupIdAndColor.forEach(s => {
      s.fields = (s.fields || []).filter(f => f.field !== "ConversationDetails");
    });

  }

  ngOnInit(): void {
  }
  private ConversationLogFn(data) {
    let body = {
      "Brandid": +data?.brandObj?.brandID,
      "TagId": data?.ticketInfo?.tagID,
      "TicketId": data?.ticketInfo?.ticketID
    }
    this._dynamicCrmIntegrationService.ConversationLogFn(body).subscribe((res) => {
      if (res.success) {
        this.ConversationLog = res?.data?.map(item => `@${item.authorName}:\n ${item.createdDate}:\n ${item.description}`).join('\n\n');
      }
    })
  }

  getMediaEnumByExtension(urls: string[]): any[] {
    const extensionMapping: Record<string, MediaEnum> = {
      'txt': MediaEnum.TEXT,
      'jpg': MediaEnum.IMAGE,
      'jpeg': MediaEnum.IMAGE,
      'png': MediaEnum.IMAGE,
      'gif': MediaEnum.ANIMATEDGIF,
      'mp4': MediaEnum.VIDEO,
      'mp3': MediaEnum.AUDIO,
      'pdf': MediaEnum.PDF,
      'doc': MediaEnum.DOC,
      'docx': MediaEnum.DOC,
      'xls': MediaEnum.EXCEL,
      'xlsx': MediaEnum.EXCEL,
      'html': MediaEnum.HTML,
      'htm': MediaEnum.HTML,
      'json': MediaEnum.SYSTEM,
      'vcf': MediaEnum.CONTACT,
      'zip': MediaEnum.FILE,
      '7z': MediaEnum.FILE,
      'rar': MediaEnum.FILE,
      'tar': MediaEnum.FILE,
      'gz': MediaEnum.FILE,
    };

    return urls.map((url) => {
      const extension = url.split('.').pop()?.toLowerCase() || '';
      return {
        thumbUrl: url,
        mediaUrl: url,
        mediaPath: url,
        mediaType: extensionMapping[extension] || MediaEnum.OTHER
      };
    });
  }

  openAttachements(index) {
    this._postDetailService.galleryIndex = index
    const attachments = this.selectedMedia
    this.matDialog.open(VideoDialogComponent, {
      panelClass: 'overlay_bgColor',
      data: attachments,
      autoFocus: false,
    });
  }

  checkFieldRequirement(field, allFields): void {
    // ===== Requirement Rules =====
    if (field?.requirementTargetIds?.length > 0) {
      field.requirementTargetIds.forEach(id => {
        const targetField = allFields.find(f => f.fieldId === id);
        if (!targetField) return;
                                    
        let dropdownDetails = allFields.find(el => el.fieldId == id);
        // let control = this.getControlFromAll(id);

        if (targetField?.requirementRules?.groups?.length > 0) {
          // Default: not required
          dropdownDetails.isRequired = false;
          // if (control) control.isRequired = false;

          // Evaluate all groups with groupsCombineOperator
          const groupResults = targetField.requirementRules.groups.map(group =>
            this.evaluateGroup(group, field)
          );

          let finalResult = false;
          if (targetField.requirementRules.groupsCombineOperator === 'AND') {
            finalResult = groupResults.every(r => r === true);
          } else { // default OR
            finalResult = groupResults.some(r => r === true);
          }

          if (finalResult) {
            dropdownDetails.isRequired = true;
            // if (control) control.isRequired = true;

          }
        }
      });
    }


    // ===== Visibility Rules =====
    if (field?.visibilityTargetIds?.length > 0) {
      field.visibilityTargetIds.forEach(id => {
        const targetField = allFields.find(f => f.fieldId === id);
        if (!targetField) return;

        let dropdownDetails = allFields?.find(el => el.fieldId == id);
        // let control = this.getControlFromAll(id);

        if (targetField?.visibilityRules?.groups?.length > 0) {
          // Default: hidden
          dropdownDetails.hideField = true;
          // if (control) control.hideField = true;

          // Evaluate groups with groupsCombineOperator
          const groupResults = targetField.visibilityRules.groups.map(group =>
            this.evaluateVisibilityGroup(group, field)
          );

          let finalResult = false;
          if (targetField.visibilityRules.groupsCombineOperator === 'AND') {
            finalResult = groupResults.every(r => r === true);
          } else { // default OR
            finalResult = groupResults.some(r => r === true);
          }

          if (finalResult) {
            dropdownDetails.hideField = false;
            // if (control) control.hideField = false;
          }
        }
      });
    }

  }

  private evaluateVisibilityGroup(group: any, field: any): boolean {
    if (!group?.rules?.length) return false;

    const ruleResults = group.rules.map(rule => this.evaluateVisibilityRule(rule, field));

    if (group.combineOperator === 'AND') {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
      return ruleResults.every(r => r === true);
    } else { // default OR
      return ruleResults.some(r => r === true);
    }
  }

  private evaluateGroup(group: any, field: any): boolean {
    if (!group?.rules?.length) return false;

    const ruleResults = group.rules.map(rule => this.evaluateRule(rule, field));

    if (group.combineOperator === 'AND') {
      return ruleResults.every(r => r === true);
    } else { // default OR
      return ruleResults.some(r => r === true);
    }
  }

  
  private evaluateRule(rule: any, field: any): boolean {
    if (!rule || !field) return false;

    const sourceValue = field?.fieldData;

    switch (rule.operator) {
      case 'equals':
        return rule.sourceFieldId === field.fieldId && sourceValue === rule.value;
      case 'notEquals':
        return rule.sourceFieldId === field.fieldId && sourceValue !== rule.value;
      // 🔮 extend later for greaterThan, in, contains, etc.
      default:
        return false;
    }
  }

  


  private evaluateVisibilityRule(rule: any, field: any): boolean {
    if (!rule || !field) return false;

    const sourceValue = field?.fieldData;

    switch (rule.operator) {
      case 'equals':
        return rule.sourceFieldId === field.fieldId && sourceValue === rule.value;
      case 'notEquals':
        return rule.sourceFieldId === field.fieldId && sourceValue !== rule.value;
      default:
        return false;
    }
  }
}
