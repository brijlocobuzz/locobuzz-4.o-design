import {
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatRadioButton } from '@angular/material/radio';
import { MatSnackBar } from '@angular/material/snack-bar';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { notificationType } from 'app/core/enums/notificationType';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { NavigationService } from 'app/core/services/navigation.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { catefilterData } from 'app/social-inbox/services/category.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { PostDetailService } from 'app/social-inbox/services/post-detail.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { take } from 'rxjs/operators';
import _ from 'lodash';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { AiTicketTagService } from 'app/accounts/services/ai-ticket-tag.service';
import { ProfileService } from 'app/accounts/services/profile.service';
import { AccountService } from 'app/core/services/account.service';
import { AuthUser } from 'app/core/interfaces/User';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MediaEnum } from 'app/core/enums/MediaTypeEnum';
import moment from 'moment';
import { SubSink } from 'subsink';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';
import { TranslateService } from '@ngx-translate/core';
import { ChannelGroup } from 'app/core/enums/ChannelGroup';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { AiFeedbackPageComponent } from 'app/accounts/component/ai-feedback-page/ai-feedback-page.component';

export interface ticketDispositionList {
  id?: number;
  dispositionName?: string;
  isActive?: boolean;
  isDeleted?: boolean;
  createdDate?: string;
  isNoteMandatory: boolean;
  selectAllCategory:boolean
}

export interface ticketDispositionData {
  data?: ticketData;
}

export interface ticketData {
  note?: string;
  ticketdispositionID?: number;
}

export enum AgentIQResponseUsed
  {
      Original = 1,
      Suggested = 2,
      Modified = 3,
  }

@Component({
    selector: 'app-ticket-disposition',
    templateUrl: './ticket-disposition.component.html',
    styleUrls: ['./ticket-disposition.component.scss'],
    standalone: false
})
export class TicketDispositionComponent implements OnInit {
  loaderTypeEnum = loaderTypeEnum;
  categoryLoader = false;
  dataSource = [];
  treeData = [];
  parentRadio = new Map();
  subchildRadio = new Map();
  subsubRadio = new Map();
  dispositionForm: UntypedFormGroup;
  @ViewChildren('checkBox') parentCheckboxes: QueryList<MatCheckbox>;
  @ViewChildren('nestCheckbox') nestedCheckboxes: QueryList<MatCheckbox>;
  @ViewChildren('dnestedCheck') dnestedCheckboxes: QueryList<MatCheckbox>;
  @ViewChildren('parentradio') parentRadios: QueryList<MatRadioButton>;
  @ViewChildren('subRadio') subRadios: QueryList<MatRadioButton>;
  @ViewChildren('subsubRadios') subsubRadios: QueryList<MatRadioButton>;
  categoryShow: boolean = false;
  ticketDispositionList: ticketDispositionList[] = [];
  isAutoTicketCategorizationEnabled: boolean = false;
  AIBasedSuggestionFlag: boolean = false;
  AICatergoryLoader: boolean = false;
  AISuggestionNotDetected: boolean;
  AISuggestedCategories: any[];
  validationMessaage:string = '';
  isAllMentionUnderTicketId:boolean = false;
  isAITicketTagEnabled: boolean = false;
  ticketTagDetails;
  ticketTagList = [];
  ticketTagSuggestList = [];
  noMatchFoundShow: boolean = false;
  @ViewChild('allSelected') private allSelected: any;
  selectedSatisfactionRating = 0;
  oldSelectedSatisfactionRating = 0;
  selectedLead = 0;
  selectedSentiment = {start: 0, end:2};
  selectedEmotions = { start: 4, end: 8, startColor: '', endColor: '', startLabel: '', endLabel:''};
  selectedUpperTags = { start: 'Complaint', end: 'Appreciation' };
  selectedLabelTag = [];
  selectedBrandInfo;
  ticketIntelligenceView = false;
  currentUser: AuthUser;
  aiTagEnable:boolean = false;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  addOnBlur = true;
  selectable = true;
  removable = true;
  categoryCards = [];
  savedparent = new Map();
  savedsubCategory = new Map();
  savedsubsubCategory = new Map();
  bulkTicketList = [];
  isBulkAction:boolean = false;
  aiIntelligenceLoader:boolean = false;
  bulkaiIntelligenceData = [];
  selectedMedias = [];
  mediaTypeEnum = MediaEnum
  selectedCategoryForAI = [];
  dispositionOff:boolean = false;
  creditLimitExpire:boolean = false;
  aiTicketIntelligenceMessage:string = '';
  showTicketCategory:boolean = false;
  isAIInsightsEnabled:boolean = false;
  ticketData: boolean = false;
  updatedSatisfactionRating: number = 0;
  isSuggested: boolean = false;
  suggestedReply: string = '';
  satisfactionRatingDiff: number = 0;
  replyMessage: string = '';
  // csatText: string = '';
  isAgentIQEnabled: boolean = false;
  subs = new SubSink();
  // previousRating: any;
  // updatedRating: any;
  aiSuggestionApplied: boolean = false;
  foulWords: string[] = [];
  isSarcastic: number = 0;
  issueResolved: number = 0;
  agentCommitment: number = 0;
  inappropriateClosure: number = 0;
  hasChurnIntent: number = 0;
  hasUpsellOpportunity: number = 0;
  agentEmpathyScore: number = 0;
  showIqOnClose: boolean = false;
  closureApproved: boolean = false;
  closureJustification: string = '';
  onlyDisposition: boolean = false;
  iqForReply: boolean = false;
  showDirectClose: boolean = false;
  defaultLayout: boolean = false;
  predictedCSATJustification: string = '';
  currentCSATJustification: string = '';
  popupType: any[] = [];
  currentStep : number = 1;
  suggestionLoader:boolean = false;
  isAgentIQResponseSuggestionEnabled:boolean = false;
  editFlag:boolean = false;
  composeReplyFlag:boolean = false
  aiMessageFeedback: number=2;
  isAICaution: boolean = false;
  constructor(
    public data: catefilterData,
    private _filterService: FilterService,
    private _navService: NavigationService,
    private _ngZone: NgZone,
    public dialogRef: MatDialogRef<TicketDispositionComponent>,
    public cdr: ChangeDetectorRef,
    private replyService: ReplyService,
    private fb: UntypedFormBuilder,
    private _snackBar: MatSnackBar,
    private ngZone: NgZone,
    private _aiTicketTagService: AiTicketTagService,
    @Inject(MAT_DIALOG_DATA) public dispositionObj: any,
    private _ticketService:TicketsService,
    private _profileService: ProfileService,
    private _accountService: AccountService,
    private crd:ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    private translate: TranslateService,
    private _chatBotService: ChatBotService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    // this.data.subscribe((apiData) => {
    //     this.categoryLoader = false;
    //     this.dataSource = this.data.categoryData;
    //   });

    this.dispositionForm = this.fb.group({
      ticketTagLabel: [[], [Validators.required]],
      customerType: ['', [Validators.required]],
      dispositionName: ['', [Validators.required]],
      note: [],
    });
    this.dispositionOff = this.dispositionObj.dispositionOff;
    if (this.dispositionObj && this.dispositionObj?.ticketIntelligenceView) {
      this.dispositionOff = true;
      this.selectedCategoryForAI = this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap ? this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap : [];
      this.selectedMedias = this.dispositionObj?.baseMention?.notesAttachmentMetadata?.mediaContents;
      this.getAITicketIntelligenceData();
    }
    let brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.dispositionObj.baseMention.brandInfo.brandID
    );
     if (this.dispositionObj && this.dispositionObj?.qualifiedTickets) {
      this.bulkTicketList = this.dispositionObj?.qualifiedTickets ? this.dispositionObj?.qualifiedTickets : [];
      if(this.bulkTicketList && this.bulkTicketList.length) {
        const sameBrand = this.bulkTicketList.every(res => res?.mention?.brandInfo?.brandID == this.bulkTicketList[0]?.mention?.brandInfo?.brandID);
        if (sameBrand){
          const brand = this.bulkTicketList[0]?.mention?.brandInfo;
          brandInfo = this._filterService.fetchedBrandData.find(
            (obj) => obj.brandID == brand.brandID
          );
          this.isBulkAction = true;
        } else {
          brandInfo.aiTagEnabled = false;
          this.bulkTicketList = [];
        }
      }
    }
    this.ticketIntelligenceView = this.dispositionObj?.ticketIntelligenceView;
    this.selectedBrandInfo = brandInfo;
    if (brandInfo) {
      this.isAutoTicketCategorizationEnabled =
        brandInfo?.isAutoTicketCategorizationEnabled;
      if (this.isAutoTicketCategorizationEnabled) {
        this.getAICategorization();
      }
      if (brandInfo?.aiTagEnabled) {
        if (this.dispositionObj && !this.dispositionObj?.ticketIntelligenceView) {
          if (this.bulkTicketList && this.bulkTicketList?.length && this.isBulkAction) {
            this.generateBulkClosingTicket();
          } else {
            if (!this.dispositionObj.isReply) {
              // this.generateClosingTicketTag();
            }
          }
        }
        this.getBrandAllTicketTags();
      }
      if (brandInfo.isAgentIQEnabled) {
        this.isAgentIQEnabled = true;
      }
      if (brandInfo?.showIQOnDirectClose) {
        this.showIqOnClose = true;
      }
      this.showTicketCategory = brandInfo?.isTicketCategoryTagEnable;
      // this.isAIInsightsEnabled = brandInfo?.isShowTicketIntelligenceNotification;
      this.isAIInsightsEnabled = false;
    }
    // this.getDispositionList();
    this.ticketDispositionList = this.dispositionObj.dispositionList;
    this.getCategoryList();
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    this.userProfile();
    if (this.ticketDispositionList?.length > 0) {
      this.dispositionForm?.patchValue({ dispositionName: this.dispositionObj?.ticketdispositionID === 0 ? '' : this.dispositionObj?.ticketdispositionID });
    }
    if (this.dispositionObj?.note) {
      this.dispositionForm?.patchValue({ note: this.dispositionObj?.note })
    }
    this.dispositionForm?.get('dispositionName')?.valueChanges?.subscribe(() => {
      this.dispositionForm?.patchValue({ note: '' });
    });
    this.subs.add(
      this._ticketService.generateClosingTicket.subscribe((response) => {
        if (response && this.isAgentIQEnabled) {
          this.isSuggested = response?.result?.is_suggested;
          this.closureApproved = response?.result?.closure_approved;
          this.closureJustification = response?.result?.closure_justification;
          this.selectedSatisfactionRating = response?.result?.satisfaction_score?.current_satisfaction_rating;
          this.updatedSatisfactionRating = response?.result?.satisfaction_score?.updated_satisfaction_rating;
          this.currentCSATJustification = response?.result?.satisfaction_score?.justification_before;
          this.predictedCSATJustification = response?.result?.satisfaction_score?.justification_after;
          this.foulWords = response?.result?.foul_words || [];
          this.popupType = response?.popupType || [];
          if (this.selectedSatisfactionRating !== null && (this.selectedSatisfactionRating > this.updatedSatisfactionRating)) {
            // this.csatText = 'This response will decrease CSAT by';
            this.satisfactionRatingDiff = this.selectedSatisfactionRating - this.updatedSatisfactionRating;
          } else if (this.selectedSatisfactionRating !== null && (this.selectedSatisfactionRating == this.updatedSatisfactionRating)) {
            // this.csatText = 'This response will not affect a CSAT score of';
            this.satisfactionRatingDiff = 0;
          }
          this.suggestedReply = response?.result?.suggested_response ? response?.result?.suggested_response?.replace(/(?:\r\n|\r|\n)/g, '<br>') : '';
          this.replyMessage = this._ticketService.replyInputTextData;
          this.isAgentIQEnabled = true;
          // this.previousRating = `${(this.selectedSatisfactionRating / 10) * 100}, 100`;
          // this.updatedRating = `${(this.updatedSatisfactionRating / 10) * 100}, 100`;
        } else if (!this.isAgentIQEnabled) {
          this.isSuggested = false;
        } else if (response?.result == false) {
          this.creditLimitExpire = true;
          this.isSuggested = true;
          this.aiTicketIntelligenceMessage = 'Unable to load the Agent IQ feature. Please contact the support team for assistance.';
        }
      })
    )
    if (brandInfo?.isTicketDispositionFeatureEnabled && brandInfo?.isAgentIQEnabled && brandInfo?.showIQOnDirectClose) {
      if (this.dispositionObj.isReply && this.isSuggested) {
        this.iqForReply = true;
      } else if (!this.dispositionObj.isReply && !this.closureApproved) {
        this.showDirectClose = true;
      } else {
        this.onlyDisposition = true;
      }
    } else if (brandInfo?.isTicketDispositionFeatureEnabled && brandInfo?.isAgentIQEnabled && !brandInfo?.showIQOnDirectClose && this.isSuggested) {
      this.iqForReply = true;
    } else if (brandInfo?.isTicketDispositionFeatureEnabled && !brandInfo?.isAgentIQEnabled && brandInfo?.showIQOnDirectClose) {
      this.onlyDisposition = true;
    } else if (brandInfo?.isTicketDispositionFeatureEnabled && !brandInfo?.isAgentIQEnabled && !brandInfo?.showIQOnDirectClose) {
      this.onlyDisposition = true;
    } else if (!brandInfo?.isTicketDispositionFeatureEnabled && brandInfo?.isAgentIQEnabled && brandInfo?.showIQOnDirectClose) {
      if (this.dispositionObj.isReply && this.isSuggested) {
        this.iqForReply = true;
      } else if (!this.dispositionObj.isReply && !this.closureApproved) {
        this.showDirectClose = true;
      }
    } else if (!brandInfo?.isTicketDispositionFeatureEnabled && brandInfo?.isAgentIQEnabled && !brandInfo?.showIQOnDirectClose && this.isSuggested) {
      this.iqForReply = true;
    } else {
      this.onlyDisposition = true;
    }
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this.crd.detectChanges();
        }
      })
    )

    const matchedBrand = this._filterService.fetchedBrandData.find(
      (obj) => Number(obj.brandID) === this.dispositionObj.baseMention.brandInfo.brandID
    );
    this.isAgentIQResponseSuggestionEnabled = matchedBrand?.isAgentIQResponseSuggestionEnabled;
    if (!(!this.dispositionObj?.isReply && this.isAgentIQEnabled && this.showIqOnClose && !this.creditLimitExpire && !this.closureApproved))
    {
    this.generateAISuggestedResponse()
    }
  }

  getCategoryList(): void {
    const key = this._filterService.getEmptyGenericFilter();
    key.brands.push(this.dispositionObj.baseMention.brandInfo);
    const brand = this._filterService.fetchedBrandData.filter(
      (obj) => Number(obj.brandID) === this.dispositionObj.baseMention.brandInfo.brandID
    );
    if (brand) {
      key.brands[0].categoryGroupID = Number(brand[0].categoryGroupID);
    }
    const genericFilter = (this._navService?.currentSelectedTab?.guid)? this._navService.getFilterJsonBasedOnTabGUID(
      this._navService.currentSelectedTab.guid
    ) : { startDateEpoch: moment().subtract(29, 'days').startOf('day').utc().unix(), endDateEpoch: moment().endOf('day').utc().unix() };
    key.startDateEpoch = genericFilter.startDateEpoch;
    key.endDateEpoch = genericFilter.endDateEpoch;
    this.categoryLoader = true;
    this.data.categoryList(key).subscribe((apiData) => {
      console.log(apiData);
      this.categoryLoader = false;
      this.dataSource = apiData['data'];
      this.treeData = this.dataSource;
      this.fillCategoryMap();
    });
  }

  onParentClick(event, data): void {
    this.data.onParentClick(
      event,
      data,
      this.categoryCards,
      this.savedparent,
      this.savedsubCategory,
      this.savedsubsubCategory,
      this.parentRadio,
      this.nestedCheckboxes,
      this.dnestedCheckboxes
    );

    this.parentRadios.changes.pipe(take(1)).subscribe((data1) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data1._results.forEach((button) => {
            if (this.parentRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });
    });
    // if(this.categoryCards.length>1)
    // {
    //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
    //     duration: 5000,
    //     data: {
    //       type: notificationType.Warn,
    //       message: 'This is not the recommended approach to save ticket category mapping.',
    //     },
    //   });
    // }
    this.checkAISuggestedOrNot();
    this.checkValidation();
  }

  onchildClick(subdata, child, data, category, parentCheckBox): void {
    if (child.checked && !parentCheckBox.checked) {
      parentCheckBox.checked = true;
      this.onParentClick(parentCheckBox, data);
    }
    this.data.onChildClick(
      subdata,
      child,
      data,
      category,
      this.categoryCards,
      this.savedsubCategory,
      this.savedparent,
      this.savedsubsubCategory,
      this.parentRadio,
      this.subchildRadio,
      this.subsubRadio,
      this.cdr,
      this.dnestedCheckboxes
    );

    this.parentRadios.changes.pipe(take(1)).subscribe((data1) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data1._results.forEach((button) => {
            if (this.parentRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });
    });

    this.subRadios.changes.pipe(take(1)).subscribe((data1) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data1._results.forEach((button) => {
            if (this.subchildRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });
    });

    this.checkAISuggestedOrNot();
    this.checkValidation();
  }


  ondNestedChildClick(dsubdata, child, data, name, parentdata, childCheckBox, parentCheckBox): void {
    if (child.checked && !childCheckBox.checked) {
      childCheckBox.checked = true;
      this.onchildClick(data, childCheckBox, parentdata, parentdata.category, parentCheckBox);
    }
    this.data.ondnested(
      dsubdata,
      child,
      data,
      name,
      parentdata,
      this.categoryCards,
      this.savedsubsubCategory,
      this.savedsubCategory,
      this.savedparent,
      this.subsubRadio,
      this.cdr
    );

    this.subsubRadios.changes.pipe(take(1)).subscribe((data1) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data1._results.forEach((button) => {
            if (this.subsubRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });
    });
    this.checkAISuggestedOrNot();
    this.checkValidation();
  }
  openCategory(): void {
    this.categoryShow = !this.categoryShow;
    if (this.categoryShow) {
      this.getCategoryList();
    }
  }
  closeCategory(): void {
    this.categoryShow = !this.categoryShow;
  }

  // getDispositionList(): void {
  //   const brandInfo = this._filterService.fetchedBrandData.find(
  //     (obj) => obj.brandID == this.baseMention.brandInfo.brandID
  //   );
  //   if (brandInfo) {
  //     const obj = {
  //       CategoryGroupID: brandInfo.categoryGroupID,
  //       CategoryGroupName: brandInfo.categoryName,
  //     };
  //     this.replyService.getDispositionDetails(obj).subscribe((res) => {
  //       if (res.success) {
  //         this.ticketDispositionList = res.data.ticketDispositionList;
  //       }
  //     });
  //   }
  // }

  getAICategorization(): void {
    this.AICatergoryLoader = true;
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.dispositionObj.baseMention.brandInfo.brandID
    );
    const obj = [
      {
        brand_details: {
          brand_id: brandInfo?.brandID,
          category_id: brandInfo?.categoryID,
          brand_name: brandInfo?.brandName,
          category_name: brandInfo?.categoryGroupName,
          category_group_id: brandInfo?.categoryGroupID,
        },
        ticket_details: {
          ticket_id: this.dispositionObj.baseMention.ticketID,
          ticket_status: this.dispositionObj.baseMention.ticketInfo.status,
          author_id: this.dispositionObj.baseMention.socialID,
          channel_type: this.dispositionObj.baseMention.channelGroup,
          ticket_created_at: this.dispositionObj.baseMention.ticketInfo.caseCreatedDate,
          ticket_category_json: this.dispositionObj.baseMention.ticketInfo.ticketCategoryMap,
          mention_category_json: this.dispositionObj.baseMention.categoryMap,
        },
      },
    ];

    this.replyService.GetAISuggestedCategory(obj).subscribe(
      (res) => {
        this.AICatergoryLoader = false;
        if (res.success && res.data && Object.values(res.data).length > 0) {
          this.AIBasedSuggestionFlag = true;
          this.AISuggestionNotDetected = false;
          const aiSuggestedCategories = res?.data ? (Array.isArray(res?.data) ? res?.data : [res?.data]) : [];
          const existingCategories = this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap && this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap?.length 
          ? this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap : [];
          this.categoryCards = [...aiSuggestedCategories, ...existingCategories];
          this.AISuggestedCategories = [res.data];
        } else {
          this.AISuggestionNotDetected = true;
          this.AIBasedSuggestionFlag = false;
        }
      },
      (err) => {
        this.categoryCards = [];
        this.AISuggestionNotDetected = true;
        this.AIBasedSuggestionFlag = false;
        this.AICatergoryLoader = false;
      }
    );
  }

  filter(value): void {
    this.ngZone.runOutsideAngular(() => {
      this.dataSource = this.treeData.filter(
        (obj) =>
          obj.category.toLowerCase().indexOf(value.toLowerCase()) > -1 ||
          obj.depatments.some(
            (dep) =>
              dep.departmentName.toLowerCase().indexOf(value.toLowerCase()) >
                -1 ||
              dep.subCategories.some(
                (subCat) =>
                  subCat.subCategoryName
                    .toLowerCase()
                    .indexOf(value.toLowerCase()) > -1
              )
          )
      );
    });
    const searchString = value.toLowerCase();
    const treeDataCopy = JSON.parse(JSON.stringify(this.treeData));
    this.dataSource = this._ticketService.levelFilter(searchString, treeDataCopy);
    // this.dataSource = this._ticketService.levelFilter(searchString, this.treeData)

    if (this.treeData.length !== 0) {
      this.parentCheckboxes.changes.pipe(take(1)).subscribe((data) => {
        data._results.forEach((element) => {
          if (this.savedparent.get(element.name) === element.name) {
            element.checked = true;
            this.nestedCheckboxes.changes
              .pipe(take(1))
              .subscribe((nestdata) => {
                nestdata._results.forEach((nestelement) => {
                  if (
                    this.savedsubCategory.get(nestelement.name) ===
                    nestelement.name
                  ) {
                    nestelement.checked = true;
                    this.cdr.detectChanges();
                  }
                });
              });
            this.cdr.detectChanges();
          }
        });
      });

      this.dnestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
        setTimeout(() => {
          data._results.forEach((element) => {
            if (this.savedsubsubCategory.get(element.name) === element.name) {
              element.checked = true;
              this.cdr.detectChanges();
            }
          });
          console.log('setTimeout called');
        });
      });

      this.parentRadios.changes.pipe(take(1)).subscribe((data) => {
        setTimeout(() => {
          data._results.forEach((button) => {
            if (this.parentRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });

      this.subRadios.changes.pipe(take(1)).subscribe((data) => {
        setTimeout(() => {
          data._results.forEach((button) => {
            if (this.subchildRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });

      this.subsubRadios.changes.pipe(take(1)).subscribe((data) => {
        setTimeout(() => {
          data._results.forEach((button) => {
            if (this.subsubRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });

      this.dataSource.forEach((element) => {
        if (element.category + element.categoryID === this.savedparent.get(element.category + element.categoryID)) {
          element.sentiment = this.parentRadio.get(element.category + element.categoryID)
          element.depatments.forEach((subElement) => {
            if (subElement.departmentName + subElement.departmentID === this.savedsubCategory.get(subElement.departmentName + subElement.departmentID)) {
              element.sentiment = null;
              subElement.departmentSentiment = this.subchildRadio.get(subElement.departmentName + subElement.departmentID)
              subElement.subCategories.forEach((subSubElement) => {
                if (subSubElement.subCategoryName + subSubElement.subCategoryID === this.savedsubsubCategory.get(subSubElement.subCategoryName + subSubElement.subCategoryID)) {
                  subElement.departmentSentiment = null;
                  subSubElement.subCategorySentiment = this.subsubRadio.get(subSubElement.subCategoryName + subSubElement.subCategoryID)
                }
              })
            }
          })
        }
      })

      return;
    }
  }

 private checkValidation() {
  this.validationMessaage = '';
  const disposition = this.ticketDispositionList.find(
    (obj) => obj.id == this.dispositionForm.value.dispositionName
  );
  if (disposition && disposition?.selectAllCategory && this.categoryCards && this.categoryCards.length) {
    this.categoryCards.map(res => {
      const isExist = this.treeData.find(obj => obj.categoryID == res.id);
      if (isExist) {
        if (res.subCategories && res.subCategories.length) {
          res.subCategories.map(sub => {
            if (isExist.depatments && isExist.depatments.length) {
              const isExistSub = isExist.depatments.find(deprt => deprt.departmentID == sub.id);
              if (isExistSub) {
                if (sub.subSubCategories && sub.subSubCategories.length) {
                } else if (isExistSub.subCategories && isExistSub.subCategories.length) {
                  this.validationMessaage = this.translate.instant('Sub-Sub-Category-is-required');
                }
              }
            }
          });
        } else if (isExist.depatments && isExist.depatments.length) {
          this.validationMessaage = this.translate.instant('Sub-Category-is-required');
        }
      }
    });
  }
 }

 async saveTicketDisposition(applySuggestion?: boolean,editAiResponse=false) {
   if (!this.dispositionOff && this.dispositionForm?.controls?.dispositionName?.invalid && !editAiResponse) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Disposition-field-is-required'),
        },
      });
      return;
    }
   if (this.isAITicketTagEnabled && !this.creditLimitExpire && this.dispositionForm?.controls?.ticketTagLabel?.invalid) {
     this._snackBar.openFromComponent(CustomSnackbarComponent, {
       duration: 5000,
       data: {
         type: notificationType.Warn,
         message: this.translate.instant('Labels-field-is-required'),
       },
     });
     return;
   }
   if (this.dispositionForm?.controls?.customerType?.invalid && !this.creditLimitExpire && this.isAITicketTagEnabled && !this.isBulkAction ) {
     this._snackBar.openFromComponent(CustomSnackbarComponent, {
       duration: 5000,
       data: {
         type: notificationType.Warn,
         message: this.translate.instant('Customer-Type-field-is-required'),
       },
     });
     return;
   }
   if (this.categoryCards?.length == 0 && !this.dispositionOff && this.showTicketCategory) {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('Please-select-ticket-category'),
        },
      });
      return;
    }
   let dispositionName = '';
   if (!this.dispositionOff){
     const disposition = this.ticketDispositionList.find(
       (obj) => obj.id == this.dispositionForm.value.dispositionName
     );

     if (disposition && disposition?.selectAllCategory && this.validationMessaage) {
       this._snackBar.openFromComponent(CustomSnackbarComponent, {
         duration: 5000,
         data: {
           type: notificationType.Warn,
           message: this.validationMessaage,
         },
       });
       return
     }

     if (!this.data.isAnySentimentNull(this.categoryCards) && !this.dispositionOff && this.showTicketCategory) {
       this._snackBar.openFromComponent(CustomSnackbarComponent, {
         duration: 5000,
         data: {
           type: notificationType.Warn,
           message: this.translate.instant('Select-Category-with-sentiment-from-the-category-map"'),
         },
       });
       return;
     }

     if (this.dispositionForm.controls.note.invalid && !this.dispositionOff) {
       this._snackBar.openFromComponent(CustomSnackbarComponent, {
         duration: 5000,
         data: {
           type: notificationType.Warn,
           message: this.translate.instant('Note-field-is-required'),
         },
       });
       return;
     }
     dispositionName = this.ticketDispositionList.find(
       (obj) => obj.id == this.dispositionForm.value.dispositionName
     )?.dispositionName || '';
   }

    
   if (this.isAITicketTagEnabled || this.isAgentIQEnabled) {
     let ticketTagging = [];
     if (this.dispositionForm.value.ticketTagLabel && this.dispositionForm.value.ticketTagLabel.length){
       this.dispositionForm.value.ticketTagLabel.forEach(res => {
        let subTag = [];
        // const isExist = this.ticketTagList.find(tag => tag.tagName == res.tagName);
         if (res){
           subTag.push(res.tagName);
           subTag.push(res.score);
          ticketTagging.push(subTag);
        } 
       });
     }
     const customerType = this.dispositionForm.value.customerType;
     let aiTicketIntelligenceModel:any = {
       brandId: this.selectedBrandInfo?.brandID,
       ticketID: this.dispositionObj?.baseMention?.ticketID,
       brandName: this.selectedBrandInfo?.brandName,
       authorChannelGroupID: this.dispositionObj?.baseMention?.author?.channelGroup,
       ticketTagging: JSON.stringify(ticketTagging),
       upperCategoriesDeltaStart: this.selectedUpperTags.start,
       oldUpperCategoriesDeltaStart: this.selectedUpperTags.start,
       upperCategoriesDeltaEnd: this.selectedUpperTags.end,
       oldUpperCategoriesDeltaEnd: this.selectedUpperTags.end,
       emotionsDeltaStart: this.selectedEmotions.start,
       emotionsDeltaEnd: this.selectedEmotions.end,
       oldEmotionsDeltaStart: this.selectedEmotions.start,
       oldEmotionsDeltaEnd: this.selectedEmotions.end,
       sentimentDeltaStart: this.selectedSentiment.start,
       oldSentimentDeltaStart: this.selectedSentiment.start,
       sentimentDeltaEnd: this.selectedSentiment.end,
       oldSentimentDeltaEnd: this.selectedSentiment.end,
       customerType: Number(customerType),
       satisfactionRating: this.selectedSatisfactionRating,
       oldSatisfactionRating: this.oldSelectedSatisfactionRating,
       isModified: this.oldSelectedSatisfactionRating == this.selectedSatisfactionRating ? false : true,
       isLead: this.selectedLead,
       dispositionName: dispositionName,
       categoryXML: null,
       note: this.dispositionForm.value.note,
       IsSarcastic: this.isSarcastic,
       IssueResolved: this.issueResolved,
       AgentCommitted: this.agentCommitment,
       InappropriateClosure: this.inappropriateClosure,
       HasChurnIntent: this.hasChurnIntent,
       HasUpsellOpportunity: this.hasUpsellOpportunity,
       AgentEmpathyScore: this.agentEmpathyScore,
       UpdatedSatisfactionRating: this.updatedSatisfactionRating,
       IsSuggested: this.isSuggested,
       SuggestedReply: this.suggestedReply,
       FoulWords: this.foulWords
     }
     if (this.dispositionOff) {
       aiTicketIntelligenceModel.IsAIIntelligenceEnabled = true
     }
     if (this.selectedBrandInfo) {
       aiTicketIntelligenceModel.isAgentiQueEnabled = this.selectedBrandInfo.isAgentIQEnabled ? true : false;
     }
     if(this.isBulkAction && this.bulkaiIntelligenceData && this.bulkaiIntelligenceData.length){
       aiTicketIntelligenceModel = [];
       this.bulkaiIntelligenceData.forEach(res => {
         const aiObj: any = {
           brandId: res?.input?.brand_id,
           ticketID: res?.input?.ticket_id,
           brandName: res?.input?.brand_name,
           authorChannelGroupID: res?.input?.channel_group_id,
           ticketTagging: JSON.stringify(ticketTagging),
           upperCategoriesDeltaStart: res?.upper_tags?.start,
           oldUpperCategoriesDeltaStart: res?.upper_tags?.start,
           upperCategoriesDeltaEnd: res?.upper_tags?.end,
           oldUpperCategoriesDeltaEnd: res?.upper_tags?.end,
           emotionsDeltaStart: res?.emotions?.start,
           emotionsDeltaEnd: res?.emotions?.end,
           oldEmotionsDeltaStart: res?.emotions?.start,
           oldEmotionsDeltaEnd: res?.emotions?.end,
           sentimentDeltaStart: res?.sentiments?.start,
           oldSentimentDeltaStart: res?.sentiments?.start,
           sentimentDeltaEnd: res?.sentiments?.end,
           oldSentimentDeltaEnd: res?.sentiments?.end,
           customerType: res?.customer_type,
           satisfactionRating: res?.satisfaction_rating,
           oldSatisfactionRating: res?.satisfaction_rating,
           isModified: false,
           isLead: res?.lead,
           dispositionName: dispositionName,
           categoryXML: null,
           note: this.dispositionForm.value.note
         }
         if (this.dispositionOff) {
           aiObj.IsAIIntelligenceEnabled = true
         }
         if (this.selectedBrandInfo) {
           aiObj.isAgentiQueEnabled = this.selectedBrandInfo.isAgentIQEnabled ? true : false;
         }
         aiTicketIntelligenceModel.push(aiObj);
       });
      
     }
  
     const obj = {
       dispositionId: this.dispositionForm.value.dispositionName ? this.dispositionForm.value.dispositionName : 0,
       note: this.dispositionForm.value.note,
       categoryCards: this.categoryCards,
       isAllMentionUnderTicketId: this.isAllMentionUnderTicketId,
       NoteAttachments: this.replyService.selectedNoteMediaVal,
       dispositionName,
       aiTicketIntelligenceModel: aiTicketIntelligenceModel,
       applySuggestion: applySuggestion,
       suggestedReply: this.suggestedReply ? this.suggestedReply : '',
       editFlag:this.editFlag,
       composeReplyFlag:this.composeReplyFlag
      }
      // return
     this.dialogRef.close(obj);
     if (applySuggestion !== undefined && !this.editFlag) {
       this.aiSuggestionApplied = applySuggestion;
       this.logAgentIQ(applySuggestion);
     }
   } else {
     this.dialogRef.close({
       dispositionId: this.dispositionForm.value.dispositionName ? this.dispositionForm.value.dispositionName : 0,
       note: this.dispositionForm.value.note,
       categoryCards: this.categoryCards,
       isAllMentionUnderTicketId: this.isAllMentionUnderTicketId,
       NoteAttachments: this.replyService.selectedNoteMediaVal,
       dispositionName,
     });
   }
  }

  fillCategoryMap(): void {
    let categoryData = [];
    let aiSuggestedCategories = [];
    if (this.isAutoTicketCategorizationEnabled) {
      aiSuggestedCategories = Array.isArray(this.AISuggestedCategories) ? this.AISuggestedCategories : [];
      categoryData = this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap && this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap?.length
      ? this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap : [];
      categoryData = [...aiSuggestedCategories, ...categoryData];
    } else {
      categoryData = this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap && this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap?.length 
      ? this.dispositionObj?.baseMention?.ticketInfo?.ticketCategoryMap : [];
    }
    this.categoryCards = [];
    if (categoryData) {
      categoryData.forEach((data) => {
        this.savedparent.set(data.name + data.id, data.name + data.id);
        let Sentiment;
        if (data.sentiment === 0) {
          this.parentRadio.set(data.name + data.id, '0');
          Sentiment = 0;
        }
        if (data.sentiment === 1) {
          this.parentRadio.set(data.name + data.id, '1');
          Sentiment = 1;
        }
        if (data.sentiment === 2) {
          this.parentRadio.set(data.name + data.id, '2');
          Sentiment = 2;
        }

        this.categoryCards.push({
          id: data.id,
          name: data.name,
          sentiment: Sentiment,
          subCategories: [],
        });
        Sentiment = null;

        const pLength = this.categoryCards.length;
        data.subCategories.forEach((subData) => {
          this.savedsubCategory.set(subData.name + subData.id, subData.name + subData.id);
          this.parentRadio.delete(data.name + data.id);
          if (subData.sentiment === 0) {
            this.subchildRadio.set(subData.name+ subData.id, '0');
            Sentiment = 0;
          }
          if (subData.sentiment === 1) {
            this.subchildRadio.set(subData.name+ subData.id, '1');
            Sentiment = 1;
          }
          if (subData.sentiment === 2) {
            this.subchildRadio.set(subData.name+ subData.id, '2');
            Sentiment = 2;
          }

          this.categoryCards[pLength - 1].subCategories.push({
            id: subData.id,
            name: subData.name,
            sentiment: Sentiment,
            subSubCategories: [],
          });

          const Length = this.categoryCards[pLength - 1].subCategories.length;

          Sentiment = '';

          subData.subSubCategories.forEach((subsubData) => {
            this.savedsubsubCategory.set(subsubData.name + subsubData.id, subsubData.name + subsubData.id);
            this.subchildRadio.delete(subData.name + subData.id);

            if (subsubData.sentiment === 0) {
              this.subsubRadio.set(subsubData.name+ subsubData.id, '0');
              Sentiment = 0;
            }
            if (subsubData.sentiment === 1) {
              this.subsubRadio.set(subsubData.name+ subsubData.id, '1');
              Sentiment = 1;
            }
            if (subsubData.sentiment === 2) {
              this.subsubRadio.set(subsubData.name+ subsubData.id, '2');
              Sentiment = 2;
            }

            // console.log(this._postDetailService.postObj.ticketInfo);
            this.categoryCards[pLength - 1].subCategories[
              Length - 1
            ].subSubCategories.push({
              id: subsubData.id,
              name: subsubData.name,
              sentiment: Sentiment,
            });
          });
        });
      });
    }

    this.treeData.forEach((data) => {
      let found = false;

      if (this.savedparent.get(data.category + data.categoryID)) {
        data.sentiment = '';
      } else {
        data.sentiment = null;
      }

      data.depatments.forEach((subData) => {
        if (this.savedsubCategory.get(subData.departmentName + subData.departmentID) && !found) {
          found = true;
          data.sentiment = null;
          subData.departmentSentiment = '';
        }

        if (subData.subCategories) {
          subData.subCategories.forEach((subsubData) => {
            if (
              this.savedsubsubCategory.get(subsubData.subCategoryName + subsubData.subCategoryID) &&
              found
            ) {
              found = true;
              data.sentiment = null;
              subData.departmentSentiment = null;
              subsubData.subCategorySentiment = '';
            }
          });
        }

        found = false;
      });
    });

    this.parentCheckboxes.changes.pipe(take(1)).subscribe((data) => {
      data._results.forEach((element) => {
        if (this.savedparent.get(element.name) === element.name) {
          element.checked = true;
          this.cdr.detectChanges();
        }
      });
    });
    this.nestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data._results.forEach((element) => {
            if (this.savedsubCategory.get(element.name) === element.name) {
              element.checked = true;
              this.cdr.detectChanges();
            }
          });
          console.log('setTimeout called');
        });
      });
    });

    this.dnestedCheckboxes.changes.pipe(take(1)).subscribe((data) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data._results.forEach((element) => {
            if (this.savedsubsubCategory.get(element.name) === element.name) {
              element.checked = true;
              this.cdr.detectChanges();
            }
          });
          console.log('setTimeout called');
        });
      });
    });

    this.parentRadios.changes.pipe(take(1)).subscribe((data) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data._results.forEach((button) => {
            if (this.parentRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });
    });

    this.subRadios.changes.pipe(take(1)).subscribe((data) => {
      setTimeout(() => {
        data._results.forEach((button) => {
          if (this.subchildRadio.get(button.name) === button.value) {
            button.checked = true;
          }
          this.cdr.detectChanges();
        });
        console.log('setTimeout called');
      });
    });

    this.subsubRadios.changes.pipe(take(1)).subscribe((data) => {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          data._results.forEach((button) => {
            if (this.subsubRadio.get(button.name) === button.value) {
              button.checked = true;
            }
            this.cdr.detectChanges();
          });
          console.log('setTimeout called');
        });
      });
    });
  }

  radio(event, event1, type, Data): void {
    this.data.radio(
      event,
      event1,
      type,
      this.categoryCards,
      Data,
      this.savedparent,
      this.parentRadio,
      this.subchildRadio,
      this.subsubRadio
    );
  }

  checkAISuggestedOrNot(): void {
    const categoryData = this.AISuggestedCategories;
    if (categoryData){
      categoryData.forEach((element) => {
        delete element.isTicket;
        delete element.upperCategoryID;
        if (element.subCategories) {
          element.subCategories.forEach((obj) => {
            delete obj.categoryID;
          });
        }
      });
    }
    if (_.isEqual(this.categoryCards, categoryData)) {
      this.AIBasedSuggestionFlag = true;
    } else {
      this.AIBasedSuggestionFlag = false;
    }
  }

  changeDispositionEvent(obj: ticketDispositionList): void {
    if (obj.isNoteMandatory) {
      this.dispositionForm.controls.note.addValidators([Validators.required]);
      this.dispositionForm.controls.note.updateValueAndValidity();
    } else {
      this.dispositionForm.controls.note.clearValidators();
      this.dispositionForm.controls.note.updateValueAndValidity();
    }
  }
  onChangeDisposition() {
    this.checkValidation();
  }
  selectAllMention(event) {
    this.isAllMentionUnderTicketId = event;
  }

  getBrandAllTicketTags() {
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.dispositionObj.baseMention.brandInfo.brandID
    );
    this._aiTicketTagService.GetAllBrandTags(brandInfo?.brandID).subscribe(res => {
      console.log(res);
      if (res.success) {
        this.ticketTagList = [];
        if (res.data && res.data.length) {
          res.data.forEach(tag => {
            if (tag.aiTicketTagsAndDescriptions && tag.aiTicketTagsAndDescriptions.length) {
              const obj = {
                tagName: tag.aiTicketTagsAndDescriptions[0].tagName,
                score: 1,
                tagId: tag.tagId
              }
              this.ticketTagList.push(obj);
            }
          });
          this.ticketTagSuggestList = JSON.parse(JSON.stringify(this.ticketTagList));
          if (this.selectedLabelTag && this.selectedLabelTag.length) {
            let tags = [];
            this.selectedLabelTag.forEach(res => {
              if (res.length) {
                const isExist = this.ticketTagList.find(tag => tag.tagName == res[0]);
                if (isExist && isExist.tagId) {
                  tags.push(isExist);
                }else {
                 const obj = {
                    tagName: res[0],
                    score: res[1],
                  }
                  tags.push(obj);

                }
              }
            });
            this.dispositionForm.patchValue({ 'ticketTagLabel': tags });
          }
        }
      }
    });
  }

  userProfile() {
    this._profileService
      .GetUserDetailsByUserID(this.currentUser.data.user.userId)
      .subscribe((result:any) => {
        if (result.success && result?.data && result?.data?.permissions) {
          this.aiTagEnable = result.data.permissions?.aiTagEnable;
        }
      });
  }

  generateBulkClosingTicket() {
    let payload = [];
    if(this.bulkTicketList && this.bulkTicketList.length){
      this.bulkTicketList.forEach(res => {
        if (res.mention){
          const brandInfo = res?.mention?.brandInfo
          const obj = {
            brand_name: brandInfo?.brandName,
            brand_id: brandInfo?.brandID,
            author_id: res?.mention?.author.socialId,
            author_name: res?.mention?.author?.name ? res?.mention?.author?.name : '',
            channel_group_id: res?.mention?.channelGroup,
            ticket_id: res?.mention?.ticketID,
            channel_type: res?.mention?.channelType,
            tag_id: res?.mention?.tagID,
          }
          payload.push(obj);
        }
      });
    }
    this.aiIntelligenceLoader = true;
    this.crd.detectChanges();
    this._aiTicketTagService.GenerateBulkClosingTicket(payload).subscribe(res => {
      this.aiIntelligenceLoader = false;
      if (res.success){
        const result = res.data;
        if (result && result.length && result[0].output && result[0].output.length) {

          result[0].output.forEach(res => {
            const input = JSON.parse(res.input);
            res.result.input = input;
            this.bulkaiIntelligenceData.push(res.result);
          })
        }
        this.crd.detectChanges();
        if (this.bulkaiIntelligenceData && this.bulkaiIntelligenceData.length) {
          this.selectedLabelTag = [];
          this.bulkaiIntelligenceData.forEach(tag => {
            if (tag.ticket_tags && tag.ticket_tags.length) {
              tag.ticket_tags.forEach(subTag => {
                const isExist = this.selectedLabelTag.find(selectTag => selectTag.length && subTag.length && selectTag[0] == subTag[0]);
                if(!isExist) {
                  this.selectedLabelTag.push(subTag);
                }
              });
            }
          })
          if (this.selectedLabelTag && this.selectedLabelTag.length) {
            let tags = [];
            this.selectedLabelTag.forEach(res => {
              if (res.length) {
                const obj = {
                  tagName: res[0],
                  score: res[1]
                }
                tags.push(obj);
              }
            });
            this.dispositionForm.patchValue({ 'ticketTagLabel': tags });
          }
          this.isAITicketTagEnabled = true;
        }
      }
 
    }, error => {
      this.aiIntelligenceLoader = false;
      this.crd.detectChanges();
    });
  }

  getAITicketIntelligenceData() {
    this.aiIntelligenceLoader = true;
    this._aiTicketTagService.GetAITicketIntelligenceData(this.dispositionObj?.baseMention?.ticketID,).subscribe(res => {
      console.log(res);
      this.aiIntelligenceLoader = false;
      if (res.success && res.data) {
        let ticketTagDetails = res.data
        this.isAITicketTagEnabled = true;
        this.selectedLabelTag = ticketTagDetails.ticketTagging ? JSON.parse(ticketTagDetails.ticketTagging): [];
        if (res.data.dispositionName && this.dispositionObj?.dispositionList?.length){
          let dispositionName = res.data.dispositionName;
          const isExist = this.dispositionObj?.dispositionList.find(dis => dis?.dispositionName == dispositionName);
          if (isExist && isExist?.id) {
            this.dispositionForm.patchValue({ 'dispositionName': isExist.id });
          }
        }
        if (this.selectedLabelTag && this.selectedLabelTag.length) {
          let tags = [];
          this.selectedLabelTag.forEach(res => {
            if (res.length) {
              const obj = {
                tagName: res[0],
                score: res[1]
              }
              tags.push(obj);
            }
          });
          this.dispositionForm.patchValue({ 'ticketTagLabel': tags });
        }
        this.dispositionForm.patchValue({'customerType': (res?.data?.customerType).toString()});
        this.dispositionForm.patchValue({ 'note': res?.data?.note });
        this.selectedSatisfactionRating = res?.data?.satisfactionRating;
        this.selectedLead = ticketTagDetails.isLead;
        this.selectedSentiment = { start: ticketTagDetails.sentimentDeltaStart, end: ticketTagDetails.sentimentDeltaEnd };
        const allUpperTag = { 0: "Complaint", 1: "Appreciation", 2: "Inquiry", 3: "Suggestion", 4: "Experience", 5: 'Assistance', 6: 'Issue', 7: 'Request', 8: "Other" };
        this.selectedUpperTags = {
          start: allUpperTag[ticketTagDetails?.upperCategoriesDeltaStart] ? allUpperTag[ticketTagDetails?.upperCategoriesDeltaStart] : '',
          end: allUpperTag[ticketTagDetails?.upperCategoriesDeltaEnd] ? allUpperTag[ticketTagDetails?.upperCategoriesDeltaEnd] : '',
        }
        let emotionMap = {
          1: 'Joy',
          2: 'Sad',
          3: 'Excited',
          4: 'Angry',
          5: 'Disgusted',
          6: 'Confused',
          7: 'Satisfied',
          8: 'Grateful',
          9: 'Frustrated',
          10: 'Disappointed',
          11: 'Regretful',
          12: 'Happy',
          13: 'Love',
          14: 'Neutral'  // Capitalized all names
        };
        this.selectedEmotions = {
          startLabel: emotionMap[ticketTagDetails?.emotionsDeltaStart] ? emotionMap[ticketTagDetails?.emotionsDeltaStart] : '',
          endLabel: emotionMap[ticketTagDetails?.emotionsDeltaEnd] ? emotionMap[ticketTagDetails?.emotionsDeltaEnd] : '',
          startColor: '',
          endColor: '',
          start: ticketTagDetails?.emotionsDeltaStart,
          end: ticketTagDetails?.emotionsDeltaEnd
        }
      }
    }, error => {
      this.aiIntelligenceLoader = false;
    });
  }

  generateClosingTicketTag(){
    const brandInfo = this._filterService.fetchedBrandData.find(
      (obj) => obj.brandID == this.dispositionObj.baseMention.brandInfo.brandID
    );

    let obj = {
      brand_name: brandInfo?.brandName,
      brand_id: brandInfo?.brandID,
      author_id: this.dispositionObj?.baseMention?.author.socialId,
      author_name: this.dispositionObj.baseMention?.author?.name ? this.dispositionObj.baseMention?.author?.name : '',
      channel_group_id: this.dispositionObj.baseMention.channelGroup,
      ticket_id: this.dispositionObj.baseMention.ticketID,
      channel_type: this.dispositionObj.baseMention.channelType,
      tag_id: this.dispositionObj.baseMention.tagID,
    }
    this.aiIntelligenceLoader = true;
    this.ticketData = true;
    this._ticketService.generateClosingTicketTag(obj).subscribe((response) => {
      this.aiIntelligenceLoader = false;
      this.ticketData = false;
      if (response.success) {
        this.ticketTagDetails = response && response.data ? response.data.result : null;
        if (this.ticketTagDetails){
          this.isAITicketTagEnabled = brandInfo?.aiTagEnabled;
          // this.isAIInsightsEnabled = brandInfo?.isShowTicketIntelligenceNotification;
          this.isAgentIQEnabled = brandInfo?.isAgentIQEnabled;
          this.isAIInsightsEnabled = false;
          this.dispositionForm.controls.customerType.setValue(this.ticketTagDetails.customer_type.toString());
          this.selectedSatisfactionRating = this.ticketTagDetails.satisfaction_rating;
          this.oldSelectedSatisfactionRating = this.ticketTagDetails.satisfaction_rating;
          this.selectedLead = this.ticketTagDetails.lead;
          this.selectedSentiment = this.ticketTagDetails.sentiments;
          this.selectedLabelTag = this.ticketTagDetails.ticket_tags
          if (this.ticketTagDetails.upper_tags) {
            const allUpperTag = { 0: "Complaint", 1: "Appreciation", 2: "Inquiry", 3: "Suggestion", 4: "Experience", 5: 'Assistance', 6: 'Issue', 7: 'Request', 8: "Other" };
            this.selectedUpperTags = {
              start: allUpperTag[this.ticketTagDetails?.upper_tags?.start] ? allUpperTag[this.ticketTagDetails?.upper_tags?.start] : '',
              end: allUpperTag[this.ticketTagDetails?.upper_tags?.end] ? allUpperTag[this.ticketTagDetails?.upper_tags?.end] : '',
            }
          }
          if (this.ticketTagDetails.emotions) {
            let emotionMap = {
              1: 'Joy',
              2: 'Sad',
              3: 'Excited',
              4: 'Angry',
              5: 'Disgusted',
              6: 'Confused',
              7: 'Satisfied',
              8: 'Grateful',
              9: 'Frustrated',
              10: 'Disappointed',
              11: 'Regretful',
              12: 'Happy',
              13: 'Love',
              14: 'Neutral'  // Capitalized all names
            };
            this.selectedEmotions = {
              startLabel: emotionMap[this.ticketTagDetails?.emotions?.start] ? emotionMap[this.ticketTagDetails?.emotions?.start] : '',
              endLabel: emotionMap[this.ticketTagDetails?.emotions?.end] ? emotionMap[this.ticketTagDetails?.emotions?.end] : '',
              startColor: '',
              endColor: '',
              start: this.ticketTagDetails?.emotions?.start,
              end: this.ticketTagDetails?.emotions?.end
            }
          }
          if (this.selectedLabelTag && this.selectedLabelTag.length) {
            let tags = [];
            this.selectedLabelTag.forEach(res => {
              if (res.length) {
                const obj = {
                  tagName: res[0],
                  score: res[1]
                }
                tags.push(obj);
              }
            });
            this.dispositionForm.patchValue({ 'ticketTagLabel': tags });
          }
          this.isSarcastic = this.ticketTagDetails?.is_sarcastic;
          this.issueResolved = this.ticketTagDetails?.issue_resolution_status;
          this.agentCommitment = this.ticketTagDetails?.agent_commitment;
          this.inappropriateClosure = this.ticketTagDetails?.inappropriate_closure;
          this.hasChurnIntent = this.ticketTagDetails?.churn_intent;
          this.hasUpsellOpportunity = this.ticketTagDetails?.upsell_opportunity;
          this.agentEmpathyScore = this.ticketTagDetails?.agent_empathy_score;
          this.updatedSatisfactionRating = this.ticketTagDetails?.updated_satisfaction_rating !== null ? this.ticketTagDetails?.updated_satisfaction_rating : 0;
          this.isSuggested = this.ticketTagDetails?.is_suggested;
          this.suggestedReply = this.ticketTagDetails?.suggested_reply;
          this.foulWords = this.ticketTagDetails?.foul_words?.length ? this.ticketTagDetails?.foul_words : [];
        }
      } else {
        if (this.dispositionOff){
          this.isAITicketTagEnabled = true;
          // this.isAIInsightsEnabled = brandInfo?.isShowTicketIntelligenceNotification;
          this.isAIInsightsEnabled = false;
        }
        this.creditLimitExpire = true;
        if (response.data && typeof response.data == 'string' && response.data.includes('no minimum credits')){
          this.aiTicketIntelligenceMessage = this.translate.instant('AI-Ticket-Intelligence-Feature-Credit-Expired');
        } else {
          this.aiTicketIntelligenceMessage = this.translate.instant('Unable-to-load-AI');
        }
      }
    }, error => {
      if (this.dispositionOff) {
        this.isAITicketTagEnabled = true;
        // this.isAIInsightsEnabled = brandInfo?.isShowTicketIntelligenceNotification;
        this.isAIInsightsEnabled = false;
      }
      this.creditLimitExpire = true;
      this.aiTicketIntelligenceMessage = this.translate.instant('Unable-to-load-AI');
      this.aiIntelligenceLoader = false;
      this.ticketData = false;
    })
  }
  getSentimentJourney(): string {
    let colorMap = ['#DAA520', 'green','red'];
    let start = this.selectedSentiment.start;
    let end = this.selectedSentiment.end;
    start = Math.min(Math.max(start, 0), colorMap.length - 1);
    end = Math.min(Math.max(end, 0), colorMap.length - 1);
    let selectedColors: string[] = [colorMap[start], colorMap[end]];
    return `linear-gradient(to right, ${selectedColors.join(', ')})`;
  }

  getEmotionJourney(): string {
    let colorMap = ['#129C30', '#FF8D94', '#60CA3B', '#FF4487', '#6B8E23', '#FF6230', '#6B8E23', '#BBE347', '#FF0033', '#FF8D94', '#C50000', '#129C30', '#FF69B4', '#DAA520'];
    let start = this.selectedEmotions.start;
    let end = this.selectedEmotions.end;
    start = Math.min(Math.max(start, 0), colorMap.length);
    end = Math.min(Math.max(end, 0), colorMap.length);
    let selectedColors: string[] = [colorMap[start - 1], colorMap[end - 1]];
    this.selectedEmotions.startColor = colorMap[start - 1];
    this.selectedEmotions.endColor = colorMap[end - 1];
    return `linear-gradient(to right, ${selectedColors.join(', ')})`;
  }
  
  public compareDayParams(optionDayobj, dayObj) {
    return optionDayobj == +dayObj;
  }

  public onChangeTagLabel(){

  }

  showNoRecordFoundOnSearch(word: string) {
    if (this.ticketTagList?.filter((r) => r?.tagName?.toLowerCase()?.includes(word?.toLowerCase()))?.length == 0) {
      this.noMatchFoundShow = true
    } else {
      this.noMatchFoundShow = false
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    if (event.keyCode === 32) {
      event.stopPropagation();
    }
  }

  toggleAllSelection() {
    if (this.allSelected._selected) {
      this.allSelected.select();
      const allTagId = this.ticketTagList.map(res => res.tagId);
      this.dispositionForm.patchValue({
        ticketTagLabel: [...allTagId,0]
      });
      let index = this.dispositionForm.value.ticketTagLabel.indexOf(0);
      if (index > -1) {
        this.dispositionForm.value.ticketTagLabel.splice(index, 1);
      }
      this.cdr.detectChanges();
    } else {
      this.dispositionForm.patchValue({ 'ticketTagLabel': [] });
    }
  }

  tosslePerOne() {
    if (this.allSelected._selected) {
      this.allSelected.deselect();
      return false;
    }
    if (this.dispositionForm.controls['ticketTagLabel'].value.length == this.ticketTagList.length)
      this.allSelected.select();
    let index = this.dispositionForm.value.ticketTagLabel.indexOf(0);
    if (index > -1) {
      this.dispositionForm.value.ticketTagLabel.splice(index, 1);
    }
  }

  onChangeSatisfaction(value){
    if(!this.ticketIntelligenceView && this.aiTagEnable){
      this.selectedSatisfactionRating = value;
    }
  }

  addPill(event: MatChipInputEvent): void {
    const input = event.input;
    if (input) {
      input.value = '';
    }
  }

  onChangeTo(event) {
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement && inputElement?.value ? inputElement.value.trim() : '';
    if (value.length) {
      const filterValue = value.toLowerCase();
      if (this.ticketTagList && this.ticketTagList.length) {
        this.ticketTagSuggestList = this.ticketTagList.filter(tag => tag.tagName.toLowerCase().includes(filterValue));
      }
    } else {
      this.ticketTagSuggestList = [];
    }
  }

  addTag(event) {
    let ticketTagLabel = this.dispositionForm.get('ticketTagLabel')?.value ? this.dispositionForm.get('ticketTagLabel')?.value : [];
    if (event && event?.option && event?.option?.value) {
      const value = event.option.value;
      if (value && value.tagName) {
        if (!ticketTagLabel.find(res => res.tagName == value.tagName)) {
          ticketTagLabel.push(value);
          this.dispositionForm.patchValue({ 'ticketTagLabel': ticketTagLabel });
        }
      }
    }
  }

  removePill(tag): void {
    let ticketTagLabel = this.dispositionForm.get('ticketTagLabel')?.value ? this.dispositionForm.get('ticketTagLabel')?.value : [];
    const index = ticketTagLabel.indexOf(tag);
    if (index > -1) {
      ticketTagLabel.splice(index, 1);
    }
  }

  logAgentIQ(applySuggestion=false) {
    let obj = {
      responseUsed: this.aiSuggestionApplied,
      brandID: this.selectedBrandInfo?.brandID,
      ticketID: this.dispositionObj?.baseMention?.ticketID,
      tagID: this.dispositionObj?.baseMention?.tagID,
      prev_CSATScore: this.selectedSatisfactionRating,
      originalReply: this.replyMessage,
      new_CSATScore: this.updatedSatisfactionRating,
      suggestedReply: this.suggestedReply,
      ResponseUsedEnum: applySuggestion ? AgentIQResponseUsed.Suggested : this.dispositionObj?.agentIQResponseGenieEditMode ? AgentIQResponseUsed.Modified : AgentIQResponseUsed.Original,
    }
    this._aiTicketTagService.logAgentIQ(obj).subscribe((result) => {
      if (result.success) {
      }
    }, (error) => {
    })
  }

  generateAISuggestedResponse(){
   
    if (this.isAgentIQResponseSuggestionEnabled)
    {
      const brandInfo = this._filterService.fetchedBrandData.find(
        (obj) => obj.brandID == this.dispositionObj.baseMention.brandInfo.brandID
      );
      let isAgentIQ = brandInfo?.isAgentIQEnabled ? true : false;
      this.suggestedReply = '';
    this.suggestionLoader = true;
    const category = this.dispositionObj.baseMention.categoryMap?.map((x) => x.name);
  let lastAuthorMsg=""
    if (this.dispositionObj.baseMention.channelGroup == ChannelGroup.WhatsApp){
      lastAuthorMsg = this.dispositionObj.baseMention?.title || this.dispositionObj.baseMention.description
    } else if (this.dispositionObj.baseMention.channelGroup == ChannelGroup.Email){
      lastAuthorMsg = this.dispositionObj.baseMention?.description || this.dispositionObj.baseMention?.emailContent || this.dispositionObj.baseMention?.emailContentHtml
    } else{
      lastAuthorMsg = this.dispositionObj.baseMention?.description
    }
    const obj = {
      brand_name: this.dispositionObj.baseMention.brandInfo?.brandName,
      brand_id: this.dispositionObj.baseMention.brandInfo?.brandID,
      author_id: this.dispositionObj.baseMention.author?.socialId,
      author_name: this.dispositionObj.baseMention.author?.name,
      channel_group_id: this.dispositionObj.baseMention.channelGroup,
      ticket_id: this.dispositionObj.baseMention.ticketID,
      ticket_category: category,
      last_author_msg: lastAuthorMsg,
      channel_type: this.dispositionObj.baseMention.channelType,
      rating: this.dispositionObj.baseMention.rating,
      user_id: this.currentUser?.data?.user?.userId,
      tag_id: this.dispositionObj.baseMention?.tagID,
      is_agentiq: isAgentIQ,
      agent_guidelines: brandInfo?.brand_Response_guidlines ? brandInfo?.brand_Response_guidlines : '',
      agent_reasons: this.dispositionObj?.PopTypeReasons,
      mention_datetime: this.dispositionObj?.baseMention?.mentionTime
    };

    this._chatBotService.getAISmartSuggestions(obj).subscribe((res) => {
      this.suggestionLoader = false;
      if (res?.success && res?.data && res?.data?.result[0]) {
        this.suggestedReply = res?.data?.result[0];
        this.isAICaution = res?.data?.caution;
      }
    },err=>{
      this.suggestionLoader = false;
    })
  }
  }

  editResponse(): void {
    this.editFlag = true;
    this.saveTicketDisposition(false, true);

}

composeReply(): void {
  this.composeReplyFlag = true
  this.saveTicketDisposition(false);
}

rejectAi(thumbDown?:boolean) {
    if (thumbDown){
      this.aiMessageFeedback = 0;
    }
    const category = this.dispositionObj.baseMention.categoryMap?.map((x) => x.name);
    let lastAuthorMsg = ""
    if (this.dispositionObj.baseMention.channelGroup == ChannelGroup.WhatsApp) {
      lastAuthorMsg = this.dispositionObj.baseMention?.title || this.dispositionObj.baseMention.description
    } else if (this.dispositionObj.baseMention.channelGroup == ChannelGroup.Email) {
      lastAuthorMsg = this.dispositionObj.baseMention?.description || this.dispositionObj.baseMention?.emailContent || this.dispositionObj.baseMention?.emailContentHtml
    } else {
      lastAuthorMsg = this.dispositionObj.baseMention?.description
    }
    const obj = {
      brand_name: this.dispositionObj.baseMention.brandInfo?.brandName,
      brand_id: this.dispositionObj.baseMention.brandInfo?.brandID,
      author_id: this.dispositionObj.baseMention.author?.socialId,
      author_name: this.dispositionObj.baseMention.author?.name,
      channel_group_id: this.dispositionObj.baseMention.channelGroup,
      ticket_id: this.dispositionObj.baseMention.ticketID,
      ticket_category: category,
      last_author_msg: lastAuthorMsg,
      channel_type: this.dispositionObj.baseMention.channelType,
      rating: this.dispositionObj.baseMention.rating,
      user_id: this.currentUser?.data?.user?.userId,
      tag_id: this.dispositionObj.baseMention?.tagID,
      Feedback_like: thumbDown ? 0 : this.aiMessageFeedback == 0 ? 0 : '',
      is_response_inserted: thumbDown ? '' : 0
    };
    const dialogRef = this.dialog.open(AiFeedbackPageComponent, {
      width: '40vw',
      data: obj,
      autoFocus: false,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if(result){
        this.aiMessageFeedback = 0;
      }else {
        this.aiMessageFeedback = 2;
      }
    });
  }

   trackAIResponse(isInsert?: boolean) {
      // this.aiMessageFeedback = 1;
      const category = this.dispositionObj.baseMention.categoryMap?.map((x) => x.name);
      let lastAuthorMsg = ""
      if (this.dispositionObj.baseMention.channelGroup == ChannelGroup.WhatsApp) {
        lastAuthorMsg = this.dispositionObj.baseMention?.title || this.dispositionObj.baseMention.description
      } else if (this.dispositionObj.baseMention.channelGroup == ChannelGroup.Email) {
        lastAuthorMsg = this.dispositionObj.baseMention?.description || this.dispositionObj.baseMention?.emailContent || this.dispositionObj.baseMention?.emailContentHtml
      } else {
        lastAuthorMsg = this.dispositionObj.baseMention?.description
      }
      if (lastAuthorMsg){
        const obj = {
          brand_name: this.dispositionObj.baseMention.brandInfo?.brandName,
          brand_id: this.dispositionObj.baseMention.brandInfo?.brandID,
          author_id: this.dispositionObj.baseMention.author?.socialId,
          author_name: this.dispositionObj.baseMention.author?.name,
          channel_group_id: this.dispositionObj.baseMention.channelGroup,
          ticket_id: this.dispositionObj.baseMention.ticketID,
          ticket_category: category,
          last_author_msg: lastAuthorMsg,
          channel_type: this.dispositionObj.baseMention.channelType,
          rating: this.dispositionObj.baseMention.rating,
          user_id: this.currentUser?.data?.user?.userId,
          tag_id: this.dispositionObj.baseMention?.tagID,
          Feedback_like: isInsert && this.aiMessageFeedback != 1 ? '' : 1,
          is_response_inserted: isInsert ? 1 : '',
          rejection_feedback: ''
        };
  
        this._chatBotService.trackAIResponse(obj).subscribe(res => {
          if (res?.success) {
            if (isInsert) {
              this.aiMessageFeedback = 2;
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Success,
                  message: `Thanks for your feedback.`,
                },
              });
            }
          } else {
            this.aiMessageFeedback = 2;
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: `Something went wrong.`,
              },
            });
            this.cdr.detectChanges();
          }
        }, err => {
          this.aiMessageFeedback = 2;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: `Something went wrong.`,
            },
          });
          this.cdr.detectChanges();
        });
      }
   
    }
}
