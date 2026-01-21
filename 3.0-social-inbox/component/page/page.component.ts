import { CdkScrollable } from '@angular/cdk/scrolling';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
  NgZone,
  HostListener,
  Output,
  EventEmitter,
  effect,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTabGroup } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { locobuzzAnimations } from '@locobuzz/animations';
import { post } from 'app/app-data/post';
import { LoginService } from 'app/authentication/services/login.service';
import { TabStatus } from 'app/core/enums/TabStatusEnum';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { DefaultTabs } from 'app/core/interfaces/locobuzz-navigation';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { Tab, TabResolved } from 'app/core/models/menu/Menu';
import { filterData } from 'app/core/models/viewmodel/ChatWindowDetails';
import {
  GenericFilter,
  PostsType,
} from 'app/core/models/viewmodel/GenericFilter';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { PostDetailData } from 'app/core/models/viewmodel/PostDetailData';
import { AccountService } from 'app/core/services/account.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { DefaultTabAgentSelectedBrand } from 'app/shared/components/filter/filter-models/brandlist.model';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';
import { FilterService } from 'app/social-inbox/services/filter.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { AdvanceFilterService } from './../../services/advance-filter.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { CommonService } from 'app/core/services/common.service';

@Component({
    selector: 'app-page',
    templateUrl: './page.component.html',
    styleUrls: ['./page.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class PageComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @Input() postData: {}[] = post;
  navbar;
  TicketList: BaseMention[] = [];
  MentionList: BaseMention[] = [];
  filter: GenericFilter;
  postloader: boolean = false;
  ticketsFound: number;
  result: string = '';
  tickets: BaseMention[] = [];
  currentPageType: string;
  currentPostType: PostsType;
  currentGuid: string;
  isadvance: boolean = false;
  selectedPostList: number[] = [];
  bulkActionpanelStatus: boolean = false;
  loadedNavLinks = [];
  defaultTabs: DefaultTabs[] = [];
  CurrentTab: Tab = {};
  postDetailData: PostDetailData = {};
  selectedTabIndex: number;
  tabs = new Array<LocobuzzTab>();
  isSingleSocialBoxLoaded = false;
  updateTabDetails = true;
  @ViewChild('contenttabgroup', { static: false }) contenttabgroup: MatTabGroup;
  showToolbar: boolean;
  subs = new SubSink();
  tabReverseFilterSubscription = new SubSink();
  currentUser: AuthUser;
  initiateWithoutBrandSelection = false;
  chatbotStatus = false;
  brandList = [];
  filterStartEpoch: number;
  filterEndEpoch: number;
  UserRoleEnum = UserRoleEnum;
  filterParams: filterData;
  chatEnableMessenger: boolean;
  chatEnableWhatsapp: boolean;
  chatEnableChatbot: boolean;
  chatEnableInstagram: boolean;
  chatEnableGMB: boolean;
  chatEnableTelegram: boolean;
  @Output() responsivePills = new EventEmitter<boolean>();
  scrHeight: any;
  scrWidth: any;
  responsivePillsShow = true;
  expandIcon: boolean;
  signalAIFlag: boolean=false;
  pageComponentLoaded: boolean=false;
  currentGuidData: Tab;
  emailExpandView: boolean = false;
  minimizeEmailView:boolean =false;
  defaultLayout:boolean = false;
  constructor(
    private _ticketService: TicketsService,
    private _filterService: FilterService,
    private _advanceFilterService: AdvanceFilterService,
    public dialog: MatDialog,
    private navService: NavigationService,
    private _chatBotService: ChatBotService,
    private route: ActivatedRoute,
    private _accountService: AccountService,
    private _loginService: LoginService,
    private cdkScrollable: CdkScrollable,
    private _sidebarService: SidebarService,
    private commonService: CommonService,
    private _ngZone: NgZone
  ) {
    let onLoadFilterTab = true;
    this.getScreenSize();
    effect(() => {
      const value = this._filterService.filterTabSourceSignal();
      if (!onLoadFilterTab && value){
        this.filterTabSourceSignal(value);
      } else {
        onLoadFilterTab = false;
      }
      
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
        }
      })
    )
    this._accountService.currentUser$.pipe(take(1)).subscribe((user) => {
      this.currentUser = user;

    });

    this.resetValuesforPageComponent();
    this.selectedTabIndex = 0;
    this.subs.add(
      this.navService.tabSub.subscribe((tabs) => {
        let currentTabs = tabs;
        for (const obj of currentTabs) {
          obj.tabHide = true;
          if (obj.tab) {
            const filterJson =
              obj.tab.filterJson && obj.tab.filterJson.trim() !== ''
                ? JSON.parse(obj.tab.filterJson)
                : null;
            if (filterJson) {
              const genericFilter = filterJson as GenericFilter;
              if (genericFilter.postsType === PostsType.TicketHistory) {
                obj.tabHide = false;
              }
            }
          }
        }
        this.tabs = [];
        this.tabs = currentTabs;
        //    if (this.contenttabgroup){
        //   const array = this.contenttabgroup._tabs.toArray();
        //   console.log(array);
        //   this.contenttabgroup._tabs.reset(array);
        // }
        //  setTimeout(() => {
        //   if (this.contenttabgroup){
        //     const array = this.contenttabgroup._tabs.toArray();
        //     console.log(array);
        //     this.contenttabgroup._tabs.reset(array);
        //   }
        //  }, 20 );
      })
    );
    this.subs.add(
      this.navService.currentSelectedTabIndex.subscribe((index) => {
        this.selectedTabIndex = index;
        this.selectedTabIndex = index;
        this.cdkScrollable.scrollTo({ top: 0 });
        if (this.tabs && this.tabs[index] && !this.tabs[index].tabHide) {
          this.showToolbar = false;
          // appContent.classList.add('app__content--overflow--inherit');
        } else {
          this.showToolbar = true;
          // appContent.classList.remove('app__content--overflow--inherit');
        }

        if (this.tabs && this.tabs[index]) {
          // this._chatBotService.chatBotHideObs.next({ status: false });
          this._chatBotService.chatBotHideObsSignal.set({ status: false });
        }
      })
    );
    this.defaultTabs = this.navService.currentNavigation.defaultTabs;
    const isbrandlistshown = localStorage.getItem('isbrandlistshown');
    if (
      (this.currentUser.data.user.role === UserRoleEnum.Agent || this.currentUser.data.user.role === UserRoleEnum.TeamLead) &&
      isbrandlistshown !== '1'
    ) {
      // this.dialog.open(BrandSelectComponent, {
      //   autoFocus: false,
      //   panelClass: ['full-screen-modal']
      // });
    } else {
      this.initiateWithoutBrandSelection = true;
      this._loginService.initiateAfterBrandSelection.next(true);
    }
    // this._ticketService.checkBrandSelection(this.currentUser, isbrandlistshown);
    this.route.data.subscribe((data) => {
      if (data && data.resolvedjson && data.resolvedjson.tab.guid) {
        this.subs.add(
          this._loginService.initiateAfterBrandSelection.subscribe((flag) => {
            if (flag || this.initiateWithoutBrandSelection) {
              this.initiateWithoutBrandSelection = true;
              let resolvedData: TabResolved = data.resolvedjson;
              this.currentGuid = resolvedData.tab.guid;
              this.currentGuidData = resolvedData.tab
              // this._filterService.reverseApply(JSON.parse(resolvedData.tab.filterJson));
              // find the tab and add Json to it
              // call an api
              // call an api
              this.subs.add(
                this.navService.clickedOnSavedFilter.subscribe((tabdetails) => {
                  if (tabdetails && tabdetails.guid === this.currentGuid) {
                    this.updateTabDetails = false;
                    resolvedData.tab.status = TabStatus.Saved;
                    this.navService
                      .updateTabDetails(resolvedData.tab, true)
                      .subscribe((obj) => {
                        // console.log('Tab Updated');
                      });
                  }
                })
              );

              this.tabs = this.tabs.filter((obj) => {
                if (obj.guid === this.currentGuid) {
                  obj.tab.filterJson = resolvedData.tab.filterJson;

                  if (
                    this.navService.loadedNavLinks.includes(this.currentGuid)
                  ) {
                    obj.fireInitializeEvent = false;
                  //   // this._filterService.reverseApply(
                  //   //   JSON.parse(resolvedData.tab.filterJson)
                  //   // );
                  } else {
                    // loading tab for the first time
                    // take care of initializing filter with saved json after that initialize tab
                    // firing post-optionInitialEvent
                    // get filterJson
                    let genericFilterJson: GenericFilter;
                    const filterJson = resolvedData.tab.filterJson
                      ? JSON.parse(resolvedData.tab.filterJson)
                      : null;
                    this.tabReverseFilterSubscription.unsubscribe();

                    // initiateFilter for the tab
                    this.navService.fireFilterInitEvent.next(
                      resolvedData.tab.guid
                    );
                    

                    if (filterJson) {
                      genericFilterJson = filterJson as GenericFilter;
                      if (
                        genericFilterJson.postsType === PostsType.TicketHistory
                      ) {
                        this.navService.fireOpenInNewTab.next(
                          resolvedData.tab.guid
                        );
                      } else {
                        this.tabReverseFilterSubscription.add(
                          this.navService.tabReverseFilterSuccess.subscribe(
                            (objGuid) => {
                              if (objGuid) {
                                if (objGuid === this.currentGuid) {
                                  //initialize post option
                                  this.navService.firePostOptionsInitialEventSignal.set(this.currentGuidData.guid);

                                  this.navService.loadedNavLinks.push(
                                    this.currentGuidData.guid
                                  );
                                  if (this.isSingleSocialBoxLoaded) {
                                    this._filterService.filterTabSourceSignal.set(this.currentGuidData);
                                  }
                                  this.navService.fireSelectedTabInitialEventSignal.set(this.currentGuidData.guid);
                                  this.isSingleSocialBoxLoaded = true;


                                  this._filterService.filterTabSourceSignal.set(this.currentGuidData);

                                  obj.fireInitializeEvent = true;
                                  // this.initializePageComponent(resolvedData.tab[0]);
                                }
                              }
                            }
                          )
                        );
                      }
                    } else {
                      this.tabReverseFilterSubscription.add(
                        this.navService.tabReverseFilterSuccess.subscribe(
                          (objGuid) => {
                            if (objGuid) {
                              if (objGuid === resolvedData.tab.guid) {
                                this.navService.firePostOptionsInitialEventSignal.set(resolvedData.tab.guid);

                                this.navService.loadedNavLinks.push(
                                  resolvedData.tab.guid
                                );
                                if (this.isSingleSocialBoxLoaded) {
                                  this._filterService.filterTabSourceSignal.set(resolvedData.tab);
                                }
                                this.navService.fireSelectedTabInitialEventSignal.set(resolvedData.tab.guid);
                                this.isSingleSocialBoxLoaded = true;


                                this._filterService.filterTabSourceSignal.set(resolvedData.tab);
                                // }

                                obj.fireInitializeEvent = true;
                                // this.initializePageComponent(resolvedData.tab[0]);
                              }
                            }
                          }
                        )
                      );
                    }
                  }
                }
                return obj;
              });
              this.postDetailData.tab = resolvedData.tab;
              if (resolvedData.error) {
              }

              //this._loginService.initiateAfterBrandSelection.next(false);
            }
          })
        );
      }
    });
    // this.navService._currentNavigation.subscribe((data) =>
    // {
    //   if (data === 'All Mentions')
    //   {
    //     console.log('Mentions Called', this.MentionList);
    //     this.currentPageType = 'All Mentions';
    //   }

    //   if (data === 'tickets')
    //   {
    //     console.log('Tickets Called');
    //     this.currentPageType = 'tickets';
    //   }
    // });
    this.getScreenSize();

    if (this.currentUser?.data?.user?.isListening && !this.currentUser?.data?.user?.isORM) {
      const categoryID = 1636;
      if (this.currentUser?.data?.user?.categoryId == categoryID)
        this.signalAIFlag = true;
    }
    this.pageComponentLoaded=true;

    this.subs.add(
      this._ticketService.emailPopUpViewObs.subscribe((res) => {
        if (!document.getElementById('arrow_back'))
        {
        if (res.status) {
          this._ticketService.emailPopUpViewObs.next({ status: false, isOpen: false, data: null });
          this.emailExpandView = res.isOpen;
          if (res.isOpen && res.data) {
            this.minimizeEmailView = false;
            this._ticketService.emailPopDataObs.next({ status: true, data: res.data })
          }
        }
      }
      })
    )

    this.subs.add(
      this._ticketService.emailMaximumMinimumObs.subscribe((res)=>{
         if (!document.getElementById('arrow_back'))
        {
        this.minimizeEmailView = res;
        }
      })
    )
  }

  filterTabSourceSignal(value){
    if (value) {
      const filterObj = this.navService.getFilterJsonBasedOnTabGUID(value.guid);
      if (filterObj.postsType === PostsType.Tickets) {
        this.brandList = this._filterService.fetchedBrandData.filter(
          (item) =>
            filterObj.brands.some(
              (brand) => brand.brandID === +item.brandID
            )
        );

        this.chatEnableMessenger =
          this.brandList.find(
            (brand) => brand.botEnable.showMessenger == true
          ) !== undefined;
        this.chatEnableWhatsapp =
          this.brandList.find(
            (brand) => brand.botEnable.showWhatsapp == true
          ) !== undefined;
        this.chatEnableChatbot =
          this.brandList.find(
            (brand) => brand.botEnable.showWebsiteBot == true
          ) !== undefined;
        this.chatEnableInstagram =
          this.brandList.find(
            (brand) => brand.botEnable.showInstagram == true
          ) !== undefined;
        this.chatEnableGMB =
          this.brandList.find(
            (brand) => brand.botEnable.showGMB == true
          ) !== undefined;
        this.chatEnableTelegram =
          this.brandList.find(
            (brand) => brand.botEnable.showTelegram == true
          ) !== undefined;
        this.filterStartEpoch = filterObj.startDateEpoch;
        this.filterEndEpoch = filterObj.endDateEpoch;
        const ActionButton = this.currentUser.data.user.actionButton;
        this.chatbotStatus =
          this.brandList?.length > 0 &&
          (this.currentUser?.data?.user?.role === UserRoleEnum.Agent ||
            this.currentUser?.data?.user?.role ===
            UserRoleEnum.SupervisorAgent ||
          this.currentUser?.data?.user?.role ===
          UserRoleEnum.LocationManager ||
            this.currentUser?.data?.user?.role ===
            UserRoleEnum.TeamLead ||
            this.currentUser?.data?.user?.role == UserRoleEnum.NewBie) &&
          (this.chatEnableMessenger ||
            this.chatEnableWhatsapp ||
            this.chatEnableChatbot ||
            this.chatEnableInstagram || this.chatEnableGMB || this.chatEnableTelegram) && ActionButton.chatSectionEnabled


      }
    }
  }

  public get postTypeEnum(): typeof PostsType {
    return PostsType;
  }

  resetValuesforPageComponent(): void {
    this._filterService.filterTabSourceSignal.set(null);
    this._filterService.filterTabSignal.set(null);
    // this._filterService.filterApiSuccessFull.next(null);
    this._filterService.defaultTabAgentBrand = [];
    const agentbrands = localStorage.getItem('defaultTabAgentBrand');
    const agentSelectedBrand: DefaultTabAgentSelectedBrand[] =
      JSON.parse(agentbrands);
    if (agentSelectedBrand && agentSelectedBrand.length > 0) {
      this._filterService.defaultTabAgentBrand = agentSelectedBrand;
    }
  }


  private GetTickets(filterObj, firstCall): void {
    this.postloader = true;
    this._ticketService.GetTickets(filterObj).subscribe(
      (resp) => {
        this.postloader = false;
        this.TicketList = resp;
        // console.log('TikcetList', this.TicketList);
        this.ticketsFound = this._ticketService.ticketsFound;
        if (firstCall) {
          if (this.paginator) {
            this.paginator.pageIndex = 0;
            this.paginator._changePageSize(this.paginator.pageSize);
          }
          this._ngZone.runOutsideAngular(() => {
            setTimeout(() => {
              // this.paginator.length = this.ticketsFound;
              console.log('setTimeout called');
            }, 1);
          });
        }
      },
      (err) => {
        // console.log(err);
        this.postloader = false;
      },
      () => {
        // console.log('call completed');
      }
    );
  }

  OnPageChange(event: PageEvent): void {
    // console.log(event);
    if (this.isadvance) {
      this.filter = this._advanceFilterService.getGenericFilter();
    } else {
      this.filter = this._filterService.getGenericFilter();
    }
    this.filter.oFFSET = event.pageIndex * event.pageSize;
    this.GetTickets(this.filter, false);
  }

  ngOnDestroy(): void {
    // this._filterService.currentBrandSource.unsubscribe();
    this.subs.unsubscribe();
    this.tabReverseFilterSubscription.unsubscribe();
  }

  private getMentions(filterObj): void {
    this._ticketService.getMentionList(filterObj).subscribe((data) => {
      this.MentionList = data;
    });
  }

  toggleBulkSelect(selectedPost: [boolean, number]): void {
    if (selectedPost[0] === true) {
      this.selectedPostList.push(+selectedPost[1]);
    } else {
      const index = this.selectedPostList.indexOf(+selectedPost[1]);
      if (index > -1) {
        this.selectedPostList.splice(index, 1);
      }
    }
    this.bulkActionpanelStatus =
      this.selectedPostList.length >= 2 ? true : false;
  }

  postBulkAction(event): void {
    // console.log(event);
    if (event === 'dismiss') {
      this.bulkActionpanelStatus = false;
    }
  }

  // openCofirmDialog(): void {
  //   console.log('dialog called');
  //   const message = `By choosing to the delete action,
  // please note that the reply to customers previously published by the SSRE will also be erased from your configured platforms as well.?`;
  //   const dialogData = new AlertDialogModel('Would you like to delete the SSRE reply?', message, 'Keep SSRE Reply','Delete SSRE Reply');
  //   const dialogRef = this.dialog.open(AlertPopupComponent, {
  //     disableClose: true,
  //     autoFocus: false,
  //     data: dialogData
  //   });

  //   dialogRef.afterClosed().subscribe(dialogResult => {
  //     this.result = dialogResult;
  //     if(dialogResult){
  //       console.log(this.result);
  //     }else{
  //       console.log(this.result);
  //     }
  //   });
  // }
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    this.scrHeight = window.innerHeight;
    this.scrWidth = window.innerWidth;
    if (window.screen.width < 769) {
      this.responsivePillsShow = false;
      this.expandIcon = true;
    } else {
      this.responsivePillsShow = true;
      this.expandIcon = false;
    }
  }
  expandPills(): void {
    this.responsivePillsShow = true;
    this.expandIcon = false;
  }
  expandLessMoreEvent(event) {
    //console.log('event ',event);
    this.responsivePillsShow = false;
    this.expandIcon = true;
  }
}
