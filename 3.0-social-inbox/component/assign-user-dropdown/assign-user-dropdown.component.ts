import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  NgZone,
  ChangeDetectorRef,
  effect,
  OnDestroy,
  signal,
  untracked,
} from '@angular/core';
import { UntypedFormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatMenuTrigger } from '@angular/material/menu';
import { LocobuzzUtils } from '@locobuzz/utils';
import { DashboardService } from 'app/analytics/services/dashboard.service';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { AuthUser } from 'app/core/interfaces/User';
import {
  BrandQueueData,
  ViewAs,
} from 'app/core/models/viewmodel/BrandQueueData';
import { LocoBuzzAgent } from 'app/core/models/viewmodel/LocoBuzzAgent';
import { LocobuzzTab } from 'app/core/models/viewmodel/LocobuzzTab';
import { AccountService } from 'app/core/services/account.service';
import { CommonService } from 'app/core/services/common.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { FootericonsService } from 'app/social-inbox/services/footericons.service';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { VoiceCallService } from 'app/social-inbox/services/voice-call.service';
import _ from 'lodash';
import { filter, take } from 'rxjs/operators';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-assign-user-dropdown',
    templateUrl: './assign-user-dropdown.component.html',
    styleUrls: ['./assign-user-dropdown.component.scss'],
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => AssignUserDropdownComponent),
            multi: true,
        },
    ],
    standalone: false
})
export class AssignUserDropdownComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  @Input() mode: string;
  @Input() sendForApproval: boolean=false;
  @Input() options: LocoBuzzAgent[]=[];
  @Input() queuesettings: BrandQueueData[];
  @Input() label: string = '';
  @Input() value?: string = '';
  @Input() showSortMenu: boolean = false;
  @Input() loader: boolean = false;
  @Input() postDetailTab: LocobuzzTab;
  @Input() disableTeamMember: boolean = false;
  @Input() assignToPopup: boolean = false;
  @Input() workflow: boolean = false;
  @Input() postDetailFlag: boolean = false;
  @Input() tagID:number=0;
  @Input() isAssignClickStop:boolean=false;
  @ViewChild('inputElement') inputElement: ElementRef;
  @ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;
  @Input() applyForAIModel: boolean = false;

  @Output() selectedData = new EventEmitter();
  @Output() selectedTeamData = new EventEmitter();
  teamSelectedData:any[] =[];
  public loggedInStatus = [0,3,4,5,7,11];
  sortvalue = 2;
  currentUser: AuthUser;
  private clearSignal = signal<boolean>(true);
  defaultLayout: boolean = false;
  constructor(
    private _footerService: FootericonsService,
    private _dashboardService: DashboardService,
    private _ngZone: NgZone,
    private _ticketService: TicketsService,
    private _voip: VoiceCallService,
    private accountService: AccountService,
    private replyService: ReplyService,
    private cdr:ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService
  ) {
    let onLoadOnReassign = true;
    effect(() => {
      const value = this.clearSignal() ? this._voip.onReassignVoipAgentSignal() : untracked(() => this._voip.onReassignVoipAgentSignal());
      if (!onLoadOnReassign && value && this.clearSignal()) {
            const userId = this.currentUser.data.user.userId ? this.currentUser.data.user.userId : '';
            this.setFormValue(String(userId))
          } else {
            onLoadOnReassign = false;
          }
        }, { allowSignalWrites: true });
  }

  selectedOption: string;
  filteredOptionsGrouped: { [k: string]: any };
  filteredOptions: { [k: string]: any };
  agentGroupedAll: { [k: string]: any };
  disabled = false;
  showOnlyTeam = false;
  showBoth = false;
  subs = new SubSink();

  form = new UntypedFormControl('');;
  UserRoleEnum = UserRoleEnum;
  Object = Object;
  onChange: any = () => {};
  onTouched: any = () => {};
  @ViewChild('clickMenuTrigger') assignUserMatMenu!: MatMenuTrigger;

  ngOnInit(): void {
    this.teamSelectedData = [];
    this.subs.add(
    this.accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user)));

    if (this.options && this.options.length) {
      this.options?.reverse();
      this.value = this.value;
      if (this.queuesettings || this.assignToPopup) this.filteredOptions = this.groupAgents(this.options);
      Object.keys(this.filteredOptions).forEach((key) => {
        const sorter = (a, b) => {
          const order = [0, 3, 4, 5, 7, 11, 2, 6, 10, 1]; // Custom order for sorting logIn_Status

          const indexA = order.indexOf(a.logIn_Status);
          const indexB = order.indexOf(b.logIn_Status);

          if (indexA < indexB) {
            return -1; // a should come before b
          }
          if (indexA > indexB) {
            return 1; // b should come before a
          }
          return 0; // They are equal in the custom order
        };
        this.filteredOptions[key] = this.filteredOptions[key].sort(sorter);
      });
      this.agentGroupedAll = JSON.parse(JSON.stringify(this.filteredOptions));
      this.form = new UntypedFormControl('Any User');
      //default selection of escalated user
      const csdRoleObject = this.options?.filter((x) => x.userRole === 2);
      const csdUserID = csdRoleObject?.reduce((min, current) => {
        return current.assignedTicketCount < min.assignedTicketCount ? current : min;
      }, csdRoleObject[0])?.agentID;
      if(csdUserID && !this.workflow) {
        if (this.currentUser?.data?.user?.categoryId == 1010) {
          let sbiTeam = this.options?.find((obj) => obj?.teamID == 129);
          if (sbiTeam && this.currentUser?.data?.user?.role == 2) {
            this.setFormValue(sbiTeam?.teamID);
          }
          else{
            this.setFormValue(csdUserID);
          }
        }
        else{
        this.setFormValue(csdUserID);
        }
      } else {
        const brandRoleObject = this.options?.filter((x) => x.userRole === 8);
        const brandUserID = brandRoleObject?.reduce((min, current) => {
          return current.assignedTicketCount < min.assignedTicketCount ? current : min;
        }, brandRoleObject[0])?.agentID;
        if (brandUserID && !this.workflow) {
          if (this.currentUser?.data?.user?.categoryId == 1010) {
            let sbiTeam = this.options?.find((obj) => obj?.teamID == 129);
            if (sbiTeam && this.currentUser?.data?.user?.role == 2) {
              this.setFormValue(sbiTeam?.teamID);
            }
            else {
              this.setFormValue(brandUserID);
            }
          }
          else {
          this.setFormValue(brandUserID);
          }
        }
      }
      this.cdr.detectChanges()
    }

    // this.subs.add(
    //   this._ticketService.scrollEventSocialBox
    //     .pipe(filter((res) => this.postDetailTab?.guid == res?.guid))
    //     .subscribe((data) => {
    //       if (data) {
    //         // this.scrollEvent();
    //       }
    //     })
    // );
    this.subs.add(
      this._ticketService.changeAssignee.subscribe((data) => {
        if (data != null) {
          this.value = data;
          this.selectedOption = this.value == 'Any User' ? 'Any User' : this.setAssignValue(+this.value);
          this._ticketService.changeAssignee.next(null);
        }
      })
    );

    /* this.subs.add(
      this._voip.onReassignVoipAgent.subscribe((value) => {
        if (value) {
          const userId = this.currentUser.data.user.userId ? this.currentUser.data.user.userId : '';
          this.setFormValue(String(userId))
        }
      })
    ); */

    /* if queuesettings getting late */
    this.subs.add(
      this.replyService?.autoQueueConfigUpdate.subscribe((res) => {
        if (res && res?.BrandQueueData?.length > 0 && res?.tagID==this.tagID) {
          this.queuesettings = res?.BrandQueueData;
          this.filteredOptions = this.groupAgents(this.options);
          Object.keys(this.filteredOptions).forEach((key) => {
            const sorter = (a, b) => {
              const order = [0, 3, 4, 5, 7, 11, 2, 6, 10, 1]; // Custom order for sorting logIn_Status

              const indexA = order.indexOf(a.logIn_Status);
              const indexB = order.indexOf(b.logIn_Status);

              if (indexA < indexB) {
                return -1; // a should come before b
              }
              if (indexA > indexB) {
                return 1; // b should come before a
              }
              return 0; // They are equal in the custom order
            };
            this.filteredOptions[key] = this.filteredOptions[key].sort(sorter);
          });
          this.agentGroupedAll = JSON.parse(JSON.stringify(this.filteredOptions));
          this.cdr.detectChanges()
        }
      })
    )
      /* if queuesettings getting late */


    this.subs.add(
      this._ticketService.ticketHistoryAssignToObs.subscribe((res)=>{
        if(res)
        {
          this.selectedOption = this.value == 'Any User' ? 'Any User' : this.setAssignValue(+this.value);
        }
      })
    )

    this.subs.add(
      this._ticketService.ticketAssignedToChange.subscribe((res) => {
        if (res!=null) {
          if(this.postDetailFlag)
          {
            this.value=res;
            this.selectedOption = this.value == 'Any User' ? 'Any User' : this.setAssignValue(+this.value);
            this.cdr.detectChanges();
          }
        }
      })
    )

    this.closeMatPanelTrigger();
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          if (this.applyForAIModel){
            this.defaultLayout = layoutType == 1 ? true : false;
          } else {
            this.defaultLayout = true;
          }
          this.cdr.detectChanges();
        }
      })
    )
  }
  ngOnChanges(changes: SimpleChanges): void {
    if(this.label =='Not Assigned'){
      this.value ='0'
    }
    if (changes?.value?.currentValue) {
      // this.value = changes.value.currentValue;
      if (this.value) {
        this.selectedOption = this.value == 'Any User' ? 'Any User' : this.setAssignValue(+this.value);
      }
    }
    if (changes.options && changes.options.currentValue?.length) {
      this.options?.reverse();
      // this.value = this.value;
      if (this.options.length && (this.queuesettings || this.assignToPopup)) {
        this.filteredOptions = this.groupAgents(this.options);
      }
      if (this.options.length && this.value) {
        this.selectedOption = this.value == 'Any User' ? 'Any User' : this.setAssignValue(+this.value);
      }
      if (this.filteredOptions){
        Object.keys(this.filteredOptions).forEach((key) => {
          const sorter = (a, b) => {
            const order = [0, 3, 4, 5, 7, 11, 2, 6, 10, 1]; // Custom order for sorting logIn_Status

            const indexA = order.indexOf(a.logIn_Status);
            const indexB = order.indexOf(b.logIn_Status);

            if (indexA < indexB) {
              return -1; // a should come before b
            }
            if (indexA > indexB) {
              return 1; // b should come before a
            }
            return 0; // They are equal in the custom order
          };
          this.filteredOptions[key] = this.filteredOptions[key].sort(sorter);
        });
        this.agentGroupedAll = JSON.parse(JSON.stringify(this.filteredOptions));
      }
      this.form = new UntypedFormControl('Any User');
      this.cdr.detectChanges()
    }
  }

  scrollEvent(): void {
    if (this.autocomplete && this.autocomplete.panelOpen)
      this.autocomplete ? this.autocomplete.closePanel() : '';
  }

  private groupAgents(userList: LocoBuzzAgent[]): any {
    if(userList==null)
    {
      return;
    }
    if (this.queuesettings) {
      if (this.sortvalue === 1) {
        userList = userList.sort((a, b) =>
          a.agentName.toLowerCase() > b.agentName.toLowerCase() ? 1 : -1
        );
        // const list = _.orderBy(
        //   userList,
        //   ({ agentName }) => agentName.agentName || '',
        //   ['asc']
        // );
        // userList = _.orderBy(
        //   userList,
        //   ({ teamName }) => teamName.teamName || '',
        //   ['asc']
        // );
        userList = _.orderBy(
          userList,
          (item) => [
            _.get(item, 'agentName.toLowerCase()', ''),
            _.get(item, 'teamName.toLowerCase()', ''),
          ],
          ['asc', 'asc']
        );
      } else {
        userList = userList.sort((a, b) =>
          a.agentName.toLowerCase() > b.agentName.toLowerCase() ? 1 : -1
        );
        // userList = _.orderBy(userList, ['agentName']);
        // userList = _.orderBy(userList, ['assignedTicketCount']);
        // userList = _.orderBy(userList, ['logIn_Status']);
        userList = _.orderBy(
          userList,
          (item) => [
            _.get(item, 'agentName.toLowerCase()', ''),
            _.get(item, 'assignedTicketCount.toLowerCase()', ''),
            _.get(item, 'logIn_Status.toLowerCase()', ''),
          ],
          ['asc', 'asc', 'asc']
        );
      }
      const CSDSetting = this.queuesettings.filter((x) => x.queueRole === 2)[0];
      const BrandSetting = this.queuesettings.filter(
        (x) => x.queueRole === 8
      )[0];

      let CSDList = userList.filter(
        (x) => x.userRole === UserRoleEnum.CustomerCare
      );
      let BrandList = userList.filter(
        (x) => x.userRole === UserRoleEnum.BrandAccount
      );
      let csdagentwithteam;
      let brandagentwithteam;

      if (CSDList.length > 0) {
        if (CSDSetting === undefined || !CSDSetting.autoQueueingEnabled) {
          csdagentwithteam = LocobuzzUtils.ObjectByGroup(CSDList, 'userRole');
        } else {

          if (CSDSetting !== undefined && CSDSetting.viewAs === ViewAs.Both){
            this.showBoth = true
          }

          if (CSDSetting !== undefined && CSDSetting.viewAs === ViewAs.Teams) {
            this.showOnlyTeam = true;
            let DistinctUser: LocoBuzzAgent[] = [];
            for (const csduser of CSDList) {
              if (
                DistinctUser.findIndex((obj) => obj.teamID === csduser.teamID) >
                -1
              ) {
              } else {
                csduser.showonlyteamname = true;
                DistinctUser.push(csduser);
              }
            }
            DistinctUser = DistinctUser.filter((x) => x.teamID > 0);
            csdagentwithteam = LocobuzzUtils.ObjectByGroup(
              DistinctUser,
              'userRole'
            );
            // }
          } else {
            CSDList = CSDList.filter(
              (x) => x.agentName || (x.teamName != null && x.teamName)
            );
            CSDList = CSDList.filter((x) => x.teamID > 0);
            csdagentwithteam = LocobuzzUtils.ObjectByGroup(CSDList, 'teamName');
          }
        }
      }

      if (BrandList.length > 0) {
        if (BrandSetting === undefined || !BrandSetting.autoQueueingEnabled) {
          brandagentwithteam = LocobuzzUtils.ObjectByGroup(
            BrandList,
            'userRole'
          );
        } else {

          if (BrandSetting !== undefined && BrandSetting.viewAs === ViewAs.Both) {
            this.showBoth = true
          }

          if (
            BrandSetting !== undefined &&
            BrandSetting.viewAs === ViewAs.Teams
          ) {
            // if (searchtext != "") {
            this.showOnlyTeam = true;
            BrandList = BrandList.filter((s) => s.teamName).filter(
              this.onlyUnique
            );
            let DistinctUser: LocoBuzzAgent[] = [];
            for (const branduser of BrandList) {
              if (
                DistinctUser.findIndex(
                  (obj) => obj.teamID === branduser.teamID
                ) > -1
              ) {
              } else {
                branduser.showonlyteamname = true;
                DistinctUser.push(branduser);
              }
            }
            DistinctUser = DistinctUser.filter((x) => x.teamID > 0);
            brandagentwithteam = LocobuzzUtils.ObjectByGroup(
              DistinctUser,
              'userRole'
            );
            // }
          } else {
            BrandList = BrandList.filter(
              (x) => x.agentName || (x.teamName != null && x.teamName)
            );
            BrandList = BrandList.filter((x) => x.teamID > 0);
            brandagentwithteam = LocobuzzUtils.ObjectByGroup(
              BrandList,
              'teamName'
            );
          }
        }
      }
      return { ...csdagentwithteam, ...brandagentwithteam };
    } else {
      this.showBoth = true;
      const agentWithTeam = LocobuzzUtils.ObjectByGroup(userList, 'teamName');
      if (agentWithTeam.null) {
        const agentNoTeam = agentWithTeam.null
          ? JSON.parse(JSON.stringify(agentWithTeam.null))
          : {};
        delete agentWithTeam.null;
        const agentNoTeamGrouped = LocobuzzUtils.ObjectByGroup(
          agentNoTeam,
          'userRole'
        );
        return { ...agentWithTeam, ...agentNoTeamGrouped };
      } else {
        return agentWithTeam;
      }
    }
  }

  isNumber(value): boolean {
    return !Number.isNaN(+value);
  }

  ngAfterViewInit(): void {
    if (this.value) {
      this._ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          this.selectedOption = this.value =='Any User'?'Any User':this.setAssignValue(+this.value);
          console.log('setTimeout called');
        }, 0);
      });
    }
  }

  setAssignValue(value: number): string {
    if (this.options) {
      const agent = this.options?.find((obj) => {
        return obj.agentID === value;
      });
      if (agent) {
        return agent.agentName;
      }
      if (!agent) {
        const team = this.options?.find((obj) => {
          return obj.teamID === value && obj.teamName !== null;
        });
        if (team) {
          return team.teamName;
        }
      }
    }
  }

  writeValue(value: string): void {
    // this.selectedOption = this.ogOptions.filter((optionItem) => {
    //   if (optionItem[this.label] === value){
    //     return  optionItem[this.label];
    //   }
    //   return '';
    // });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  setFormValue(value, isTeamSelections=false): void {
    if (this.value !== value) {
      if (this.assignUserMatMenu) this.assignUserMatMenu?.closeMenu();
      this.value = value;
      this.form.patchValue(this.value);
      
      if(isTeamSelections) {
        this.teamSelectedData = [value];
        this.selectedTeamData.emit(this.teamSelectedData)
      }

      this.selectedData.emit(this.form);
      this.filteredOptions = this.agentGroupedAll;
      this.inputElement.nativeElement.blur();
      this._dashboardService.memberEmitter.emit(this.value);
      this.selectedOption = this.value == 'Any User' ? 'Any User': this.setAssignValue(+this.value);
    }
  }

  filterOptions(value): any {
    if (this.autocomplete) {
      this.autocomplete.openPanel();
    }
    this.menuTrigger.openMenu();
    const optionsGrouped = this._filter(value);
    this.filteredOptions = this.groupAgents(optionsGrouped);
    this.onChange(this.selectedOption);
  }

  private _filter(value: string): any {
    const filterValue = value.toLowerCase();
    try {
      if(this.showBoth){
        return this.options.filter((option) => option.teamName?.toLowerCase().includes(filterValue) || option.agentName.toLowerCase().includes(filterValue))
      }
      else{
        if (!this.showOnlyTeam) {
          return this.options.filter(
            (option) => option.agentName.toLowerCase().includes(filterValue)
          );
        } else {
          return this.options.filter(
            (option) => option?.showonlyteamname ? option.teamName?.toLowerCase().includes(filterValue) : option.agentName?.toLowerCase().includes(filterValue)
          );
        }
      }
    } catch (err) {
      return this.options;
    }
  }

  filterSelection(event): void {
    // console.log(event);
    if (this.selectedOption !== event.option.value) {
      this.selectedOption = event.option.value;
      this.filteredOptions = this.agentGroupedAll;
      this.inputElement.nativeElement.blur();
    }
  }
  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
  }
  sortescalationlist(value: number): any {
    this.sortvalue = value;
    let userList = this.options;
    this.filteredOptions = this.groupAgents(userList);
    if (value === 1) {
      let alphabeticalList = this.filteredOptions;
      alphabeticalList = Object.keys(alphabeticalList)
        .sort(function (a, b) {
          return ('' + a).localeCompare(b);
        })
        .reduce(function (Obj, key) {
          Obj[key] = alphabeticalList[key];
          return Obj;
        }, {});
      this.filteredOptions = alphabeticalList;
    } else {
      Object.keys(this.filteredOptions).forEach((key) => {
        const sorter = (a, b) => {
          const order = [0, 3, 4, 5, 7, 11, 2, 6, 10, 1]; // Custom order for sorting logIn_Status

          const indexA = order.indexOf(a.logIn_Status);
          const indexB = order.indexOf(b.logIn_Status);

          if (indexA < indexB) {
            return -1; // a should come before b
          }
          if (indexA > indexB) {
            return 1; // b should come before a
          }
          return 0; // They are equal in the custom order
        };
        this.filteredOptions[key] = this.filteredOptions[key].sort(sorter);
      });
    }
    this.agentGroupedAll = JSON.parse(JSON.stringify(this.filteredOptions));
    this.form = new UntypedFormControl('Any User');
    this.cdr.detectChanges()
  }

  LogTeamId(teamId, teamName): void {
    console.log(teamId);
    // this.value = teamId;
    if (this.isNumber(teamName)) {
      teamName = 'Users: ' + UserRoleEnum[teamName];
    }
    this.selectedOption = teamName;
    this.autocomplete ? this.autocomplete.closePanel() : '';
    this.setFormValue(teamId, true);
  }
  closeMatPanelTrigger(): void {
    this.subs.add(
    this._footerService.matClosePanel.subscribe((obj) => {
      if (obj) {
        this.autocomplete ? this.autocomplete.closePanel() : '';
        this._footerService.matClosePanel.next(false);
      }
    }));
  }

  clearVariables() {
    this.mode = '';
    this.sendForApproval = false;
    this.options = [];
    this.queuesettings = [];
    this.label = '';
    this.value = '';
    this.showSortMenu = false;
    this.loader = false;
    this.postDetailTab = undefined;
    this.disableTeamMember = false;
    this.assignToPopup = false;
    this.workflow = false;
    this.postDetailFlag = false;
    this.tagID = 0;
    this.isAssignClickStop = false;
    this.loggedInStatus = [];
    this.sortvalue = 2;
    this.currentUser = undefined;
  }

  ngOnDestroy() {
    this.clearSignal.set(false);
    this.cdr.detectChanges();
    this.subs.unsubscribe();
    this.clearVariables();
    this._footerService = null;
    this._dashboardService=  null;
    this._ngZone = null;
    this._ticketService = null;
    this._voip = null;
    this.accountService = null;
    this.replyService = null;
    this.cdr = null;
  }


  
}
