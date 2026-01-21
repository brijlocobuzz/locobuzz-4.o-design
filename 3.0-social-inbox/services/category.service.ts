import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { notificationType } from 'app/core/enums/notificationType';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { NavigationService } from 'app/core/services/navigation.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { FilterService } from './filter.service';
import { ReplyService } from './reply.service';
import { TicketsService } from './tickets.service';
import { TabService } from 'app/core/services/tab.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class catefilterData {
  // public postRequestData = {"Source":{"ID":0,"SocialID":"m_th7W6cdTFlJN5HsXFErBEkAiz4cAoV0uMo4F78HJrZpihP9RJezHpGIGr9mWFyms8SGwrEgFBzlBKED3mG7Dlg","ParentSocialID":"","ParentID":0,"Title":"","IsActionable":0,"ChannelType":"40","ChannelGroup":"2","LikeCount":0,"CommentCount":"0","Url":1,"TagID":277415,"IsDeleted":0,"MediaType":0,"Status":0,"IsBrandPost":0,"UpdatedDateTime":null,"Location":0,"LikeStatus":0,"BrandInfo":{"BrandID":"7121","BrandName":"wrong","BrandFriendlyName":"","CategoryID":0,"CategoryName":"","BrandGroupName":"","BColor":"","CampaignName":""},"Author":{ID:0,"SocialID":" 4987188741353989",Name:"","URL":"","PicUrl":"","Location":"","Screenname":"","IsVerified":false,"IsMute":false,"IsBlock":false,"IsUserFollowing":false,"IsBrandFollowing":false,"UserTags":[],"MarkInfluencer":{},"ConnectedUsers":[],"LocoBuzzCRMDetails":{ID:0,Name:null,"EmailID":null,"AlternativeEmailID":null,"PhoneNumber":null,"AlternatePhoneNumber":null,"Link":null,"Address1":null,"Address2":null,"Notes":null,"City":null,"State":null,"Country":null,"ZIPCode":null,"SSN":null},"type":""},"TicketInfo":{"TicketID":223797,"AssignedBy":0,"AssignedTo":0,"EscalatedTo":0,"EscalatedBy":0,"Status":0,"NumberOfMentions":0,"TicketPriority":0,"LastNote":"","AutoClose":false,"PreviousAssignedTo":0,"TagID":277415},"CategoryMap":[{ID:"33773",Name:"miscellaneous","Sentiment":null,"SubCategories":[{ID:"32531",Name:"Q1","Sentiment":null,"SubSubCategories":[{ID:"42406",Name:"Q2","Sentiment":"1"}]}]}],"UpperCategory":{ID: null,Name:"none","UserID":null},"type":"TicketTwitter","TaggedUsersJson":"","Description":"","Caption":"","CanReply":"true","ReplyScheduledDateTime":null,"WorkflowStatus":0,"IsTakeOver":null,"InReplyToStatusId":0,"ContentID":"32963","RetweetedStatusID":"","ShareCount":"0"},"TagAlltagIds":true,"isAllMentionUnderTicketId":false,"isTicketCategoryEnabled":"0","IsTicket":"false"};

  public categoryData;

  constructor(
    public httpClient: HttpClient,
    private _ticketService: TicketsService,
    private _replyService: ReplyService,
    private _snackBar: MatSnackBar,
    private filterService: FilterService,
    private navgationService: NavigationService,
    private _tabService:TabService,
    private translate: TranslateService
  ) { }

  onParentClick(
    event,
    data,
    categoryCards,
    savedparent,
    savedsubCategory,
    savedsubsubCategory,
    parentRadio,
    nestedCheckboxes?,
    dnestedCheckboxes?
  ): void {
    if (event._checked) {
      categoryCards.push({
        id: data.categoryID,
        name: data.category,
        sentiment: '',
        subCategories: [],
      });
      savedparent?.set(data.category + data.categoryID, data.category + data.categoryID);
      data.sentiment = '';
      parentRadio?.set(data.category + data.categoryID, '');
    } else {
      data.sentiment = null;
      savedparent?.delete(data.category + data.categoryID);
      parentRadio?.delete(data.category + data.categoryID)
      for (let i = 0; i < categoryCards.length; i += 1) {
        if (categoryCards[i].name + categoryCards[i].id === data.category + data.categoryID) {
          for (const item of categoryCards[i].subCategories) {
            if (nestedCheckboxes && nestedCheckboxes?._results.length){
              for (let index in nestedCheckboxes._results) {
                if (nestedCheckboxes._results[index].name === item.name + item.id) {
                   nestedCheckboxes._results[index]._checked = false;
                }
              };
            }
            savedsubCategory.delete(item.name + item.id);
            for (const subItem of item.subSubCategories) {
              if (dnestedCheckboxes && dnestedCheckboxes?._results.length) {
                for (let index in dnestedCheckboxes._results) {
                  if (dnestedCheckboxes._results[index].name === subItem.name + subItem.id) {
                    dnestedCheckboxes._results[index]._checked = false;
                  }
                };
              }
              savedsubsubCategory.delete(subItem.name + subItem.id);
            }
          }
          categoryCards.splice(i, 1);
          break;
        }
      }
    }
  }

  onChildClick(
    subdata,
    child,
    data,
    category,
    categoryCards,
    savedsubCategory,
    savedparent,
    savedsubsubCategory,
    parentRadio,
    subRadio,
    subsubRadios,
    cdr,
    dnestedCheckboxes?
  ): void {
    if (child._checked) {
      savedsubCategory?.set(subdata.departmentName + subdata.departmentID, subdata.departmentName + subdata.departmentID);
      savedparent?.set(data.category + data.categoryID, data.category + data.categoryID);
      subRadio?.set(subdata.departmentName + subdata.departmentID, '');

      if (categoryCards.length === 0) {
        categoryCards.push({
          id: data.categoryID,
          name: data.category,
          sentiment: null,
          subCategories: [
            {
              id: subdata.departmentID,
              name: subdata.departmentName,
              sentiment: '',
              subSubCategories: [],
            },
          ],
        });
        data.sentiment = null;
        subdata.departmentSentiment = '0';
      } else {
        let found = false;
        for (const item of categoryCards) {
          if (item.name === data.category) {
            item.sentiment = null;
            found = true;
            item.subCategories.push({
              id: subdata.departmentID,
              name: subdata.departmentName,
              sentiment: '',
              subSubCategories: [],
            });
            data.sentiment = null;
            subdata.departmentSentiment = '0';
            break;
          }
        }
        if (!found) {
          categoryCards.push({
            id: data.categoryID,
            name: data.category,
            sentiment: null,
            subCategories: [
              {
                id: subdata.departmentID,
                name: subdata.departmentName,
                sentiment: '',
                subSubCategories: [],
              },
            ],
          });
          data.sentiment = null;
          subdata.departmentSentiment = '0';
        }
      }
    } else {
      savedsubCategory?.delete(subdata.departmentName + subdata.departmentID);
      subRadio?.delete(subdata.departmentName + subdata.departmentID);
      parentRadio?.delete(data.category+data.categoryID)
      for (let i = 0; i < categoryCards.length; i += 1) {
        for (let j = 0; j < categoryCards[i].subCategories.length; j += 1) {
          if (
            categoryCards[i].subCategories[j].name === subdata.departmentName
          ) {
            for (const item of categoryCards[i].subCategories[j]
              .subSubCategories) {
              // console.log(item.name);
              savedsubsubCategory.delete(item.name + item.id);
              subsubRadios?.delete(item.name+item.id)
            }
            if (categoryCards.length >= 1 && subdata.departmentID == categoryCards[i].subCategories[j].id) {
              categoryCards[i].subCategories.splice(j, 1);
              if (categoryCards[i].subCategories ==0)
              {
              categoryCards[i].sentiment=''
              }
              break;
            } 
            else if (categoryCards.length == 0)
            {
              categoryCards[i].subCategories.splice(j, 1);
              categoryCards.splice(i, 1);
              break;
            }
          }
        }
      }
      for (const item of subdata.subCategories) {
        if (dnestedCheckboxes && dnestedCheckboxes?._results.length) {
          for (let index in dnestedCheckboxes._results) {
            if (dnestedCheckboxes._results[index].name === item.subCategoryName + item.subCategoryID) {
              dnestedCheckboxes._results[index]._checked = false;
            }
          };
        }
        item.departmentSentiment = null;
        item.subCategorySentiment = null
      }
      subdata.departmentSentiment = null;
    }

    let isAllSelected = true;
    let isAllparentSelected = false;
    // console.log(data);
    for (const item of data.depatments) {
      if (item.subCategories.length > 0) {
        for (const subItem of item.subCategories) {
          if (subItem.subCategorySentiment != null) {
            isAllSelected = false;
            break;
          }
        }
      }
    }
    for (const item of data.depatments) {
      if (item.departmentSentiment != null) {
        isAllparentSelected = true;
        break;
      }
    }

    // if (!isAllSelected) {
    //  subdata.departmentSentiment = null;

    // }

    if (!isAllparentSelected && isAllSelected) {
      data.sentiment = '0';
    } else {
      data.sentiment = null;
    }

    if(data.s)
    cdr.detectChanges();
  }

  ondnested(
    dsubdata,
    child,
    data,
    subSubCategory,
    parentdata,
    categoryCards,
    savedsubsubCategory,
    savedsubCategory,
    savedparent,
    subsubRadio,
    cdr
  ): void {
    if (child._checked) {
      savedparent?.set(parentdata.category + parentdata.categoryID, parentdata.category + parentdata.categoryID);
      savedsubCategory?.set(data.departmentName + data.departmentID, data.departmentName + data.departmentID);
      savedsubsubCategory?.set(child.name, child.name);
      subsubRadio?.set(subSubCategory + dsubdata.subCategoryID, '');

      if (categoryCards.length === 0) {
        categoryCards.push({
          id: parentdata.categoryID,
          name: parentdata.category,
          sentiment: null,
          subCategories: [
            {
              id: data.departmentID,
              name: data.departmentName,
              sentiment: null,
              subSubCategories: [
                {
                  id: dsubdata.subCategoryID,
                  name: dsubdata.subCategoryName,
                  sentiment: '',
                },
              ],
            },
          ],
        });

        parentdata.sentiment = null;
        data.departmentSentiment = null;
        dsubdata.subCategorySentiment = '0';
      } else {
        let parentFound = false;
        for (const item of categoryCards) {
          if (item.name === parentdata.category) {
            parentFound = true;
            let found = false;

            for (const subItem of item.subCategories) {
              if (subItem.name === data.departmentName) {
                subItem.sentiment = null;
                found = true;
                subItem.subSubCategories.push({
                  id: dsubdata.subCategoryID,
                  name: dsubdata.subCategoryName,
                  sentiment: '',
                });
                parentdata.sentiment = null;
                data.departmentSentiment = null;
                dsubdata.subCategorySentiment = '0';
                break;
              }
            }

            if (!found) {
              item.subCategories.push({
                id: data.departmentID,
                name: data.departmentName,
                sentiment: null,
                subSubCategories: [
                  {
                    id: dsubdata.subCategoryID,
                    name: dsubdata.subCategoryName,
                    sentiment: '',
                  },
                ],
              });

              dsubdata.subCategorySentiment = '0';
            }
          }
        }

        if (!parentFound) {
          categoryCards.push({
            id: parentdata.categoryID,
            name: parentdata.category,
            sentiment: null,
            subCategories: [
              {
                id: data.departmentID,
                name: data.departmentName,
                sentiment: null,
                subSubCategories: [
                  {
                    id: dsubdata.subCategoryID,
                    name: dsubdata.subCategoryName,
                    sentiment: '',
                  },
                ],
              },
            ],
          });
          parentdata.sentiment = null;
          data.departmentSentiment = null;
          dsubdata.subCategorySentiment = '0';
        }
      }
    } else {
      savedsubsubCategory?.delete(child.name);
      subsubRadio?.delete(dsubdata.subCategoryName + dsubdata.subCategoryID)
      for (const item of categoryCards) {
        for (const subItem of item.subCategories) {
          for (let k = 0; k < subItem.subSubCategories.length; k += 1) {
            if (subItem.subSubCategories[k].id === dsubdata.subCategoryID) {
              subItem.subSubCategories.splice(k, 1);
            }
          }
        }
      }

      // data.departmentSentiment = '';
      dsubdata.subCategorySentiment = null;
    }

    let isAllSelected = true;
    for (const item of data.subCategories) {
      // console.log(item.subCategorySentiment)
      if (item.subCategorySentiment !== null) {
        isAllSelected = false;
        break;
      }
    }

    if (isAllSelected) {
      data.departmentSentiment = '0';
    } else {
      data.departmentSentiment = null;
    }
    cdr.detectChanges()
  }

  async radio(
    event,
    event1,
    type,
    categoryCards,
    data,
    savedparent,
    parentRadio,
    subchildRadio,
    subsubRadio
  ){
    // console.log(event)

    // console.log(event1)
    if (type === 'parent') {
      parentRadio?.set(event1, event);
      savedparent?.set(data.category, data.category);
      let found = false;
      for (const item of categoryCards) {
        if (item.name === data.category) {
          found = true;
          break;
        }
      }
      if (!found) {
        categoryCards.push({
          name: data.category,
          sentiment: event,
          subCategories: [],
        });
      }

      data.sentiment = event;

      // const last = event[event.length - 1];
      for (const item of categoryCards) {
        if (item.id === data.categoryID) {
          if (event === '0') {
            item.sentiment = 0;
          }

          if (event === '1') {
            item.sentiment = 1;
          }

          if (event === '2') {
            item.sentiment = 2;
          }
        }
      }
    }

    if (type === 'child') {
      subchildRadio?.set(event1, event);

      for (let i = 0; i < categoryCards.length; i += 1) {
        for (let j = 0; j < categoryCards[i]['subCategories'].length; j += 1) {
          if (categoryCards[i]['subCategories'][j].id == data.departmentID) {
            const last = event[event.length - 1];

            if (event === '0') {
              categoryCards[i]['subCategories'][j]['sentiment'] = 0;
            }

            if (event === '1') {
              categoryCards[i]['subCategories'][j]['sentiment'] = 1;
            }

            if (event === '2') {
              categoryCards[i]['subCategories'][j]['sentiment'] = 2;
            }
          }
        }
      }
    }

    if (type === 'subchild') {
      subsubRadio?.set(event1, event);

      for (let i = 0; i < categoryCards.length; i += 1) {
        for (let j = 0; j < categoryCards[i]['subCategories'].length; j += 1) {
          for (
            let k = 0;
            k < categoryCards[i]['subCategories'][j]['subSubCategories'].length;
            k += 1
          ) {
            if (
              categoryCards[i]['subCategories'][j]['subSubCategories'][k].id ==
              data.subCategoryID
            ) {
              const last = event[event.length - 1];

              if (event === '0') {
                categoryCards[i]['subCategories'][j]['subSubCategories'][k][
                  'sentiment'
                ] = 0;
              }

              if (event === '1') {
                categoryCards[i]['subCategories'][j]['subSubCategories'][k][
                  'sentiment'
                ] = 1;
              }

              if (event === '2') {
                categoryCards[i]['subCategories'][j]['subSubCategories'][k][
                  'sentiment'
                ] = 2;
              }
            }
          }
        }
      }
    }
    await this.hierarchySentimentValueUpdate(categoryCards);
  }

  remove(
    event,
    cdr,
    parentCheckboxes,
    nested,
    categoryCards,
    savedparent,
    savedsubCategory,
    savedsubsubCategory,
    catchAllCategory?
  ): void {
    const eventKey = event.name + event.id;

    for (let i = 0; i < categoryCards.length; i++) {
      const category = categoryCards[i];

      for (let j = 0; j < category.subCategories.length; j++) {
        const subCategory = category.subCategories[j];
        const subKey = subCategory.name + subCategory.id;

        if (eventKey !== subKey) continue;

        // Remove subCategory
        savedsubCategory?.delete(eventKey);
        category.subCategories.splice(j, 1);

        // Remove sub-sub categories if exist
        if (subCategory.subSubCategories?.length) {
          for (const subSub of subCategory.subSubCategories) {
            savedsubsubCategory?.delete(subSub.name + subSub.id);
          }
        }

        // Uncheck nested checkbox
        nested._results.forEach((el) => {
          if (el.name === eventKey) {
            el.writeValue(false);
            el._checked = false;
          }
        });

        // If no subCategories left, remove category
        if (category.subCategories.length === 0) {
          savedparent?.delete(category.name + category.id);
          categoryCards.splice(i, 1);

          parentCheckboxes._results.forEach((el) => {
            if (el.name === category.name + category.id) {
              el.writeValue(false);
              el._checked = false;
            }
          });
        }

        cdr.detectChanges();
        return; // exit after handling the match
      }
    }

    // Handle direct category removal
    for (let i = 0; i < categoryCards.length; i++) {
      const category = categoryCards[i];
      if (event.id !== category.id) continue;

      savedparent?.delete(eventKey);
      categoryCards.splice(i, 1);

      parentCheckboxes._results.forEach((el) => {
        if (el.name === eventKey) {
          el.writeValue(false);
          el._checked = false;
        }
      });

      cdr.detectChanges();
      return;
    }
  }

  categoryList(keyObj): Observable<any> {
    return this.httpClient
      .post<any>(environment.baseUrl + '/Tickets/GetCategoriesList', keyObj)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            const somerror = response;
          }
        })
      );
  }

  upperCategoryList(keyObj): Observable<any> {
    return this.httpClient
      .post<any>(
        environment.baseUrl + '/Tickets/GetUpperCategoriesList',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            const somerror = response;
          }
        })
      );
  }

  getCategoryList(key): Observable<object> {
    // const key = {
    //   categoryID: 0,
    //   categoryName: 'string',
    //   brands: [
    //     {
    //       brandID: 7121,
    //       brandName: '\"wrong\"',
    //       categoryGroupID: 7,
    //       mainBrandID: 0,
    //       compititionBrandIDs: [
    //         0
    //       ],
    //       brandFriendlyName: 'string',
    //       brandLogo: 'string',
    //       isBrandworkFlowEnabled: true,
    //       brandGroupName: 'string'
    //     }
    //   ],
    //   startDateEpoch: 1605033000,
    //   endDateEpoch: 1608229798,
    //   userID: 0,
    //   filters: [

    //   ],
    //   notFilters: [],
    //   isAdvance: false,
    //   query: 'string',
    //   orderBY: ' \nORDER BY TicketPriority Desc, ModifiedDate desc\n',
    //   offset: 0,
    //   noOfRows: 1
    // };

    return this.httpClient.post(
      environment.baseUrl + '/Tickets/GetCategoriesList',
      key
    );
  }

  getUpperCategoryList(key): Observable<object> {
    // const key = {
    //   categoryID: 0,
    //   categoryName: 'string',
    //   brands: [
    //     {
    //       brandID: 7121,
    //       brandName: '\"wrong\"',
    //       categoryGroupID: 7,
    //       mainBrandID: 0,
    //       compititionBrandIDs: [
    //         0
    //       ],
    //       brandFriendlyName: 'string',
    //       brandLogo: 'string',
    //       isBrandworkFlowEnabled: true,
    //       brandGroupName: 'string'
    //     }
    //   ],
    //   startDateEpoch: 1605033000,
    //   endDateEpoch: 1608229798,
    //   userID: 0,
    //   filters: [

    //   ],
    //   notFilters: [],
    //   isAdvance: false,
    //   query: 'string',
    //   orderBY: ' \nORDER BY TicketPriority Desc, ModifiedDate desc\n',
    //   offset: 0,
    //   noOfRows: 1
    // };

    return this.httpClient.post(
      environment.baseUrl + '/Tickets/GetUpperCategoriesList',
      key
    );
  }

  saveCategoryData(
    taggingParameters,
    _postDetailService,
    categoryCards,
    snackBar,
    dialogRef,
    pagetype
  ): void {
    this.httpClient
      .post(
        environment.baseUrl + '/Tickets/SaveTaggingCategory',
        taggingParameters
      )
      .subscribe(
        (res) => {
          const result = JSON.stringify(res);
          const r = JSON.parse(result);
          if (r.success) {
            // this._ticketService.selectedPostList = [];
            // // this._ticketService.postSelectTrigger.next(0);
            // this._ticketService.bulkMentionChecked = [];
            // // console.log(taggingParameters);
            // // console.log('Done');
            // if (_postDetailService.categoryType === 'ticketCategory') {
            //   _postDetailService.postObj.ticketInfo.ticketCategoryMap =
            //     categoryCards;
            //   if (taggingParameters.isAllMentionUnderTicketId) {
            //     _postDetailService.postObj.categoryMap = categoryCards;
            //     this._replyService.postDetailObjectChanged.next(
            //       _postDetailService.postObj
            //     );
            //     if (
            //       pagetype == PostsType.Tickets ||
            //       pagetype == PostsType.TicketHistory
            //     ) {
            //       this._ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.next(
            //         {
            //           postObj: _postDetailService.postObj,
            //           type: 'Ticket',
            //           categoryCards: categoryCards,
            //         }
            //       );
            //     }
            //     if (pagetype == PostsType.Mentions) {
            //       this._ticketService.mentionTabCategoryChanges.next({
            //         postObj: _postDetailService.postObj,
            //         type: 'Ticket',
            //         categoryCards: categoryCards,
            //       });
            //     }
            //   } else {
            //     this._ticketService.ticketcategoryMapChange.next(
            //       _postDetailService.postObj
            //     );
            //   }
            // } else {
            //   _postDetailService.postObj.categoryMap = categoryCards;
            //   if (taggingParameters.isTicketCategoryEnabled === 1) {
            //     _postDetailService.postObj.ticketInfo.ticketCategoryMap =
            //       categoryCards;
            //     this._replyService.postDetailObjectChanged.next(
            //       _postDetailService.postObj
            //     );
            //   }
            //   if (taggingParameters.isAllMentionUnderTicketId) {
            //     if (
            //       pagetype == PostsType.Tickets ||
            //       pagetype == PostsType.TicketHistory
            //     ) {
            //       this._ticketService.ticketcategoryMapChangeForAllMentionUnderSameTicketId.next(
            //         {
            //           postObj: _postDetailService.postObj,
            //           type: 'Ticket',
            //           categoryCards: categoryCards,
            //         }
            //       );
            //     }
            //     if (pagetype == PostsType.Mentions) {
            //       this._ticketService.mentionTabCategoryChanges.next({
            //         postObj: _postDetailService.postObj,
            //         type: 'Ticket',
            //         categoryCards: categoryCards,
            //       });
            //     }
            //   } else {
            //     this._ticketService.ticketcategoryMapChange.next(
            //       _postDetailService.postObj
            //     );
            //   }
            // }
            if (_postDetailService?.groupedView){
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Category-saved-successfully'),
              },
            });}
            if (this.navgationService?.currentSelectedTab?.guid) {
              const genericFilter = this.navgationService.getFilterJsonBasedOnTabGUID(
                this.navgationService?.currentSelectedTab?.guid
              );
              if (genericFilter.filters && genericFilter.filters.length > 0) {
                if (genericFilter.filters.some((obj) => obj.name == 'TaggedBy')) {
                  const TaggedBy = genericFilter.filters.find(
                    (obj) => obj.name == 'TaggedBy'
                  );
                  if (TaggedBy.value == 1) {
                    this._ticketService.updateTaggedList.next({
                      tagIDs: [taggingParameters.source.tagID],
                      guid: this.navgationService?.currentSelectedTab?.guid,
                    });
                  }
                }
              }
            }
            // dialogRef.close();
          }
        },
        (err) => {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: 'Something went wrong.',
            },
          });
        }
      );
  }

  taggingRequestParametres(event, name, taggingParameters): void {
    // console.log(event);
    if (!event._checked) {
      // console.log('Aaya Re');
      if (
        taggingParameters.isTicketCategoryEnabled === 2 &&
        name === 'setToAllMention'
      ) {
        taggingParameters.isTicketCategoryEnabled = 3;
        taggingParameters.isAllMentionUnderTicketId = true;
      } else if (
        taggingParameters.isTicketCategoryEnabled === 0 &&
        name === 'setToTicket'
      ) {
        taggingParameters.isTicketCategoryEnabled = 1;
        taggingParameters.isAllMentionUnderTicketId = false;
      }

      if (name === 'tagTweet') {
        taggingParameters.tagAlltagIds = true;
      }
    } else {
      if (name === 'tagTweet') {
        taggingParameters.tagAlltagIds = false;
      }

      if (name === 'setToAllMention') {
        taggingParameters.isTicketCategoryEnabled = 2;
        taggingParameters.isAllMentionUnderTicketId = false;
      }

      if (name === 'setToTicket') {
        taggingParameters.isTicketCategoryEnabled = 0;
        taggingParameters.isTicketCategoryEnabled = 0;
      }
    }
  }

  isAnySentimentNull(categoryCards): boolean {
    let nullSentiment;
    for (const item of categoryCards) {
      nullSentiment = true;
      if (
        !item.sentiment &&
        item.sentiment !== 0 &&
        !item.subCategories.length
      ) {
        nullSentiment = false;
        break;
      }
      for (const subItem of item.subCategories) {
        if (
          !subItem.sentiment &&
          subItem.sentiment !== 0 &&
          !subItem.subSubCategories.length
        ) {
          nullSentiment = false;
          break;
        }

        for (const subsubItem of subItem.subSubCategories) {
          if (!subsubItem.sentiment && subsubItem.sentiment !== 0) {
            nullSentiment = false;
            break;
          }
        }

        if (!nullSentiment) {
          break;
        }
      }

      if (!nullSentiment) {
        break;
      }
    }
    return nullSentiment;
  }

  saveBulkCategoryData(
    taggingParameters,
    _postDetailService,
    categoryCards,
    snackBar,
    dialogRef,
    pagetype,
    totalMentions?
  ): void {
    // const Theaders = new HttpHeaders({
    //   'Content-Type': 'application/json',
    //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZDBlMTZlOS00NjlhLTRmNjQtYWFmNS1kMGYxZGFkMGQ1NGQiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMTM5NDA1OCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.fBErJVWFaWEv3Dx2kN_PpmxxiKKYevrv9mxF_YxGmMo'
    // });

    this.httpClient
      .post(
        environment.baseUrl + '/Tickets/SaveBulkTaggingCategory',
        taggingParameters
      )
      .subscribe((res) => {
        const result = JSON.stringify(res);
        const r = JSON.parse(result);
        if (r.success) {
          // this._ticketService.selectedPostList = [];
          // this._ticketService.postSelectTrigger.next(0);
          // this._ticketService.bulkMentionChecked = [];
          // console.log(taggingParameters);
          // console.log('Done');
          if (_postDetailService.categoryType === 'ticketCategory') {
            _postDetailService.postObj.ticketInfo.ticketCategoryMap =
              categoryCards;
            if (taggingParameters.isAllMentionUnderTicketId) {
              _postDetailService.postObj.ticketInfo.categoryMap = categoryCards;
              /* this._replyService.postDetailObjectChanged.next(
                _postDetailService.postObj
              ); */
              this._replyService.postDetailObjectChangedSignal.set(
                _postDetailService.postObj
              );
            }
            this._ticketService.ticketcategoryBulkMapChange.next({
              postData: _postDetailService.postObj,
              tagIds: taggingParameters.tagIDs,
            });
            this._ticketService.updateUpperCategory.next({
              TagIds: taggingParameters.tagIDs,
              selectedUpperCategory:
                _postDetailService.postObj.ticketInfo.ticketUpperCategory,
              ticketType: PostsType.Tickets,
              postObj: _postDetailService.postObj,
            });
          } else {
            
            /* via bulk mention category not update instantly */
            if (!_postDetailService?.isBulk) {
              _postDetailService.postObj.categoryMap = categoryCards;
            }
            /* via bulk mention category not update instantly */
            
            if (taggingParameters.isTicketCategoryEnabled === 1) {
              _postDetailService.postObj.ticketInfo.ticketCategoryMap =
                categoryCards;
              /* this._replyService.postDetailObjectChanged.next(
                _postDetailService.postObj
              ); */
              this._replyService.postDetailObjectChangedSignal.set(
                _postDetailService.postObj
              );
            }
            this._ticketService.ticketcategoryBulkMapChange.next({
              postData: _postDetailService.postObj,
              tagIds: taggingParameters.tagIDs,
            });
            this._ticketService.updateUpperCategory.next({
              TagIds: taggingParameters.tagIDs,
              selectedUpperCategory: _postDetailService.postObj.upperCategory,
              ticketType: PostsType.Mentions,
              postObj: _postDetailService.postObj,
            });
            // this._ticketService.parentbulkActionChange.next(2);
            // this._ticketService.ticketStatusChange.next(true);
            if (taggingParameters.isGroupView)
              {
                const list =[]
              let totalMentions = 0
              taggingParameters.tagIDs.forEach(x => {
                list.push({ Tagid: x.tagID, Ismarkseen: 1 });
                this._ticketService.updateChildMentionInParentPost.next({ seenOrUnseen: true });
                this._ticketService.updateChildMentionInMentionList.next({ tagID: x.tagID, seenOrUnseen: true })
                });
              this._ticketService.updateChildBulkMentionSeenUnseen.next({ list });
              this._tabService.seenUnseenTabCountUpdateObs.next({ guid: this.navgationService.currentSelectedTab.guid, count: totalMentions, seenUnseen: 1 });

              }
          }

          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: _postDetailService?.isBulk ? this.translate.instant('Bulk-action-initiated') : this.translate.instant('Category-saved-successfully'),
            },
          });

          const genericFilter = this.navgationService.getFilterJsonBasedOnTabGUID(
            this.navgationService.currentSelectedTab.guid
          );

          if (genericFilter.filters && genericFilter.filters.length > 0) {
            if (genericFilter.filters.some((obj) => obj.name == 'TaggedBy')) {
              const TaggedBy = genericFilter.filters.find(
                (obj) => obj.name == 'TaggedBy'
              );
              if (TaggedBy.value == 1) {
                const tagIds = [];
                taggingParameters.tagIDs.forEach((tagObj) => {
                  tagIds.push(tagObj.tagID);
                });
                this._ticketService.updateTaggedList.next({
                  tagIDs: tagIds,
                  guid: this.navgationService.currentSelectedTab.guid,
                });
              }
            }
          }
          dialogRef.close({ categoryData: categoryCards });
        }
      });
  }

  // for bulk category update in parentPost - selectAll Mentions
  saveBulkCategoryDataV2(
    taggingParameters,
    _postDetailService,
    categoryCards,
    snackBar,
    dialogRef,
    pagetype,
    obj,
    totalMentions?
  ): void {
    this.httpClient
      .post(
        environment.baseUrl + '/Tickets/SaveBulkTaggingCategoryV2Child',
        obj
      )
      .subscribe((res) => {
        const result = JSON.stringify(res);
        const r = JSON.parse(result);
        if (r.success) {
          if (_postDetailService.categoryType === 'ticketCategory') {
            _postDetailService.postObj.ticketInfo.ticketCategoryMap =
              categoryCards;
            if (taggingParameters.isAllMentionUnderTicketId) {
              _postDetailService.postObj.ticketInfo.categoryMap = categoryCards;
              /* this._replyService.postDetailObjectChanged.next(
                _postDetailService.postObj
              ); */
              this._replyService.postDetailObjectChangedSignal.set(
                _postDetailService.postObj
              );
            }
            this._ticketService.ticketcategoryBulkMapChange.next({
              postData: _postDetailService.postObj,
              tagIds: taggingParameters.tagIDs,
            });
            this._ticketService.updateUpperCategory.next({
              TagIds: taggingParameters.tagIDs,
              selectedUpperCategory:
                _postDetailService.postObj.ticketInfo.ticketUpperCategory,
              ticketType: PostsType.Tickets,
              postObj: _postDetailService.postObj,
            });
          } else {

            /* via bulk mention category not update instantly */
            if (!_postDetailService?.isBulk) {
              _postDetailService.postObj.categoryMap = categoryCards;
            }
            /* via bulk mention category not update instantly */

            if (taggingParameters.isTicketCategoryEnabled === 1) {
              _postDetailService.postObj.ticketInfo.ticketCategoryMap =
                categoryCards;
              /* this._replyService.postDetailObjectChanged.next(
                _postDetailService.postObj
              ); */
              this._replyService.postDetailObjectChangedSignal.set(
                _postDetailService.postObj
              );
            }
            this._ticketService.ticketcategoryBulkMapChange.next({
              postData: _postDetailService.postObj,
              tagIds: taggingParameters.tagIDs,
            });
            this._ticketService.updateUpperCategory.next({
              TagIds: taggingParameters.tagIDs,
              selectedUpperCategory: _postDetailService.postObj.upperCategory,
              ticketType: PostsType.Mentions,
              postObj: _postDetailService.postObj,
            });
            // this._ticketService.parentbulkActionChange.next(2);
            // this._ticketService.ticketStatusChange.next(true);
            if (taggingParameters.isGroupView) {
              const list = []
              let totalMentions = 0
              taggingParameters.tagIDs.forEach(x => {
                list.push({ Tagid: x.tagID, Ismarkseen: 1 });
                this._ticketService.updateChildMentionInParentPost.next({ seenOrUnseen: true });
                this._ticketService.updateChildMentionInMentionList.next({ tagID: x.tagID, seenOrUnseen: true })
              });
              this._ticketService.updateChildBulkMentionSeenUnseen.next({ list });
              this._tabService.seenUnseenTabCountUpdateObs.next({ guid: this.navgationService.currentSelectedTab.guid, count: totalMentions, seenUnseen: 1 });

            }
          }

          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Success,
              message: _postDetailService?.isBulk ? this.translate.instant('Bulk-action-initiated') : this.translate.instant('Category-saved-successfully'),
            },
          });

          const genericFilter = this.navgationService.getFilterJsonBasedOnTabGUID(
            this.navgationService.currentSelectedTab.guid
          );

          if (genericFilter.filters && genericFilter.filters.length > 0) {
            if (genericFilter.filters.some((obj) => obj.name == 'TaggedBy')) {
              const TaggedBy = genericFilter.filters.find(
                (obj) => obj.name == 'TaggedBy'
              );
              if (TaggedBy.value == 1) {
                const tagIds = [];
                taggingParameters.tagIDs.forEach((tagObj) => {
                  tagIds.push(tagObj.tagID);
                });
                this._ticketService.updateTaggedList.next({
                  tagIDs: tagIds,
                  guid: this.navgationService.currentSelectedTab.guid,
                });
              }
            }
          }
          dialogRef.close({ categoryData: categoryCards });
        }
      });
  }

  hierarchySentimentValueUpdate(arr: any[]): void {
    for (const item of arr) {
      let hasChildSentiment = false;

      // 🔹 Check subSubCategories
      if (item.subSubCategories?.length) {
        for (const subSub of item.subSubCategories) {
          if (subSub.sentiment !== null) {
            hasChildSentiment = true;
            break;
          }
        }
        if (hasChildSentiment) {
          item.sentiment = null;
        }
      }

      // 🔹 Check subCategories recursively
      if (item.subCategories?.length) {
        this.hierarchySentimentValueUpdate(item.subCategories);

        for (const sub of item.subCategories) {
          const subHasSentiment =
            sub.sentiment !== null ||
            sub.subSubCategories?.some(s => s.sentiment !== null);

          if (subHasSentiment) {
            hasChildSentiment = true;
            break;
          }
        }

        if (hasChildSentiment) {
          item.sentiment = null;
        }
      }
    }
  }

}
