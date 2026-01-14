import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LogStatus } from 'app/core/enums/LogStatus';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { AuthUser } from 'app/core/interfaces/User';
import { GenericFilter } from 'app/core/models/viewmodel/GenericFilter';
import { environment } from 'environments/environment';
import { Observable, Subject, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AssignToList,
  AssignToListParams,
} from '../../shared/components/filter/filter-models/assign-to.model';
import { FilterService } from './filter.service';
import { PostDetailService } from './post-detail.service';

@Injectable({
  providedIn: 'root',
})
export class PostAssignToService {
  assignTo = new Subject<AssignToList[]>();
  assignTo$ = this.assignTo.asObservable();
  loadingUsers = new BehaviorSubject(false);
  selectedAssignTo: number;
  defaultNote: string;
  constructor(
    private _filterService: FilterService,
    private _postDetailService: PostDetailService,
    private _http: HttpClient
  ) {}

  setAssignedUsersList(keyObj): Observable<AssignToList[]> {
    return this._http
      .post<AssignToListParams>(
        environment.baseUrl + '/Tickets/GetAgentCSDBrandListnew',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            this._filterService.fetchedAssignToBrandWise = response.data;
            return response.data;
          }
        })
      );
  }
  onlyUnique(value, index, self): boolean {
    return self.indexOf(value) === index;
  }

  getAssignedUsersList(
    currentUser: AuthUser,
    WorkFlowStatus: LogStatus,
    disableFlag?: boolean,
    isRefreshList?:boolean,
  ): boolean {
    let objAgent: AssignToList[];
    const genericFilter: GenericFilter = this._filterService.getGenericFilter();
    genericFilter.brands = [];
    genericFilter.brands = [this._postDetailService.postObj.brandInfo];
    if (genericFilter && genericFilter?.brands && genericFilter?.brands.length > 0) {
      const payload_update = { filters: genericFilter, isrefresh: isRefreshList || false}
      this.loadingUsers.next(true);
      this.setAssignedUsersList(payload_update).subscribe((res) => {
        if (!disableFlag) {
          if(res && res.length){
            res = res.map(agent => ({
              ...agent,
              logIn_Status: agent?.currentLogInStatus,
            }));
          }
          if (
            currentUser.data.user.role === UserRoleEnum.CustomerCare ||
            currentUser.data.user.role === UserRoleEnum.BrandAccount
          ) {
            if (currentUser.data.user.role === UserRoleEnum.BrandAccount) {
              objAgent = res.filter(
                (x) => x.userRole === UserRoleEnum.BrandAccount
              );
            } else {
              if (this._postDetailService.postObj.brandInfo?.isBrandworkFlowEnabled) {
                objAgent = res.filter(
                  (x) => x.userRole === UserRoleEnum.CustomerCare || x.userRole === UserRoleEnum.BrandAccount
                );
              } else {
                objAgent = res.filter(
                  (x) => x.userRole === UserRoleEnum.CustomerCare
                );
              }
            }
          } else {
            if (currentUser.data.user.role === UserRoleEnum.Agent) {
              if (currentUser?.data?.user?.actionButton?.assignmentEnabled && currentUser?.data?.user?.actionButton?.assignToTeams) {
                const splittedTeamId: any[] = currentUser?.data?.user?.actionButton?.assignToTeamIds?.split(',').map(x => +x);
                if (splittedTeamId.length > 0) {
                  if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                    objAgent = res.filter(
                      (x) =>
                        splittedTeamId.includes(x.teamID) || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager
                    );
                  } else {
                    objAgent = res.filter(
                      (x) =>
                        splittedTeamId.includes(x.teamID)
                    );
                  }
                }
              }
              else {
                if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                  objAgent = res.filter((x) => x.userRole === UserRoleEnum.Agent || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager);

                } else {
                  objAgent = res.filter((x) => x.userRole === UserRoleEnum.Agent);
                }
              }
            } else if (currentUser.data.user.role === UserRoleEnum.TeamLead) {
              if (currentUser?.data?.user?.actionButton?.assignmentEnabled && currentUser?.data?.user?.actionButton?.assignToTeams) {
                const splittedTeamId: any[] = currentUser?.data?.user?.actionButton?.assignToTeamIds?.split(',').map(x => +x);
                if (splittedTeamId.length > 0) {
                  if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                    objAgent = res.filter(
                      (x) =>
                        splittedTeamId.includes(x.teamID) || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager
                    );
                  } else {
                    objAgent = res.filter(
                      (x) =>
                        splittedTeamId.includes(x.teamID)
                    );
                  }
                }
              }
              else {
                if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                  objAgent = res.filter(
                    (x) =>
                      x.userRole === UserRoleEnum.TeamLead ||
                      x.userRole === UserRoleEnum.Agent ||
                      x.userRole === UserRoleEnum.SupervisorAgent || 
                      x.userRole === UserRoleEnum.LocationManager
                  );
                } else {
                  objAgent = res.filter(
                    (x) =>
                      x.userRole === UserRoleEnum.TeamLead ||
                      x.userRole === UserRoleEnum.Agent
                  );
                }
              }
            } else {
              objAgent = res.filter(
                (x) =>
                  x.userRole === UserRoleEnum.Agent ||
                  x.userRole === UserRoleEnum.SupervisorAgent ||
                  x.userRole === UserRoleEnum.LocationManager ||
                  x.userRole === UserRoleEnum.TeamLead || (x.userRole === UserRoleEnum.BrandAccount && this._postDetailService.postObj.brandInfo?.isBrandworkFlowEnabled)
              );
            }
          }
        } else {
          objAgent = res;
        }
        // objAgent.filter(x => x.logIn_Status === 0).forEach(x => x.logIn_Status === 4);
        objAgent = objAgent.sort((x) => x.logIn_Status);
        let roles = objAgent
          .sort((x) => x.userRole)
          .map((s) => s.userRole)
          .filter(this.onlyUnique);

        if (
          WorkFlowStatus === LogStatus.ReplySentForApproval &&
          (currentUser.data.user.role === UserRoleEnum.SupervisorAgent ||
            currentUser.data.user.role === UserRoleEnum.LocationManager
          )
        ) {
          /* roles = roles.filter(
            (x) => x !== UserRoleEnum.Agent && x !== UserRoleEnum.SupervisorAgent
          ); */
          let Teams = [];
          Teams = objAgent.filter( (w) => w.teamID > 0 && objAgent.filter((x) => x.userRole));
          /* if (roles.length === 1 && roles[0] === 12) {
            Teams = objAgent.filter((w) => w.teamID > 0 && w.userRole === 12);
          } else {
            Teams = objAgent.filter(
              (w) => w.teamID > 0 && objAgent.filter((x) => x.userRole)
            );
          } */
          objAgent = objAgent.filter((w) => Teams.filter((x) => x.teamID));
        } else if (
          WorkFlowStatus === LogStatus.ReplySentForApproval &&
          currentUser.data.user.role === UserRoleEnum.TeamLead
        ) {
          if (currentUser?.data?.user?.actionButton?.assignmentEnabled) {
            if (currentUser?.data?.user?.actionButton?.assignToAll || (!currentUser?.data?.user?.actionButton?.assignToAll && !currentUser?.data?.user?.actionButton?.assignToTeams)) {
              roles = roles.filter(
                (x) => x !== UserRoleEnum.Agent && x !== UserRoleEnum.SupervisorAgent && x !== UserRoleEnum.LocationManager
              );
              const teamid = objAgent
                .filter((x) => x.agentID === currentUser.data.user.userId)
                .map((s) => s.teamID)
                .filter(this.onlyUnique);
              if (teamid) {
                if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                  objAgent = objAgent.filter((x) => x.teamID === teamid[0] || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager);
                } else {
                  objAgent = objAgent.filter((x) => x.teamID === teamid[0]);

                }
              }
            }
          }
          if (currentUser?.data?.user?.actionButton?.assignToTeams && currentUser?.data?.user?.actionButton?.assignmentEnabled) {
            const splittedTeamId: any[] = currentUser?.data?.user?.actionButton?.assignToTeamIds?.split(',').map(x => +x);
            if (splittedTeamId.length > 0) {
              if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                objAgent = res.filter(
                  (x) =>
                    splittedTeamId.includes(x.teamID) || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager
                );
              } else {
                objAgent = objAgent.filter(
                  (x) =>
                    splittedTeamId.includes(x.teamID)
                );
              }
            }
          }
        } else if (
          WorkFlowStatus !== LogStatus.ReplySentForApproval &&
          currentUser.data.user.role === UserRoleEnum.TeamLead
        ) {
          if (currentUser?.data?.user?.actionButton?.assignmentEnabled) {
            if (currentUser?.data?.user?.actionButton?.assignToAll) {
              
              /* part is blank because we need all users in list for assignment */

            }
            else if (!currentUser?.data?.user?.actionButton?.assignToAll && !currentUser?.data?.user?.actionButton?.assignToTeams) {
              roles = roles.filter((x) => x !== UserRoleEnum.SupervisorAgent && x !== UserRoleEnum.LocationManager);
              const teamid = objAgent
                .filter((x) => x.agentID === currentUser.data.user.userId)
                .map((s) => s.teamID)
                .filter(this.onlyUnique);
              if (teamid) {
                if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                  objAgent = objAgent.filter((x) => x.teamID === teamid[0] || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager);
                } else {
                  objAgent = objAgent.filter((x) => x.teamID === teamid[0]);
                }
              }
            }
          }
          if (currentUser?.data?.user?.actionButton?.assignToTeams && currentUser?.data?.user?.actionButton?.assignmentEnabled) {
            const splittedTeamId: any[] = currentUser?.data?.user?.actionButton?.assignToTeamIds?.split(',').map(x => +x);
            if (splittedTeamId.length > 0) {
              if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                objAgent = res.filter(
                  (x) =>
                    splittedTeamId.includes(x.teamID) || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager
                ); 
              } else {
                objAgent = objAgent.filter(
                  (x) =>
                    splittedTeamId.includes(x.teamID)
                );
              }
            }
          }
        } else if (
          WorkFlowStatus === LogStatus.ReplySentForApproval &&
          currentUser.data.user.role === UserRoleEnum.Agent
        ) {
          if (currentUser?.data?.user?.actionButton?.assignmentEnabled) {
            if (currentUser?.data?.user?.actionButton?.assignToAll || (!currentUser?.data?.user?.actionButton?.assignToAll && !currentUser?.data?.user?.actionButton?.assignToTeams)) {
              roles = roles.filter(
                (x) =>
                  x !== UserRoleEnum.TeamLead && x !== UserRoleEnum.SupervisorAgent && x !== UserRoleEnum.LocationManager
              );
              const teamid = objAgent
                .filter((x) => x.agentID === currentUser.data.user.userId)
                .map((s) => s.teamID)
                .filter(this.onlyUnique);
              if (teamid) {
                if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                  objAgent = objAgent.filter((x) => x.teamID === teamid[0] || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager);
                } else {
                  objAgent = objAgent.filter((x) => x.teamID === teamid[0]);
                }
              }
            }
            if (currentUser?.data?.user?.actionButton?.assignToTeams && currentUser?.data?.user?.actionButton?.assignmentEnabled) {
              const splittedTeamId: any[] = currentUser?.data?.user?.actionButton?.assignToTeamIds?.split(',').map(x => +x);
              if (splittedTeamId.length > 0) {
                if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                  objAgent = res.filter(
                    (x) =>
                      splittedTeamId.includes(x.teamID) || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager
                  );
                } else {
                  objAgent = objAgent.filter(
                    (x) =>
                      splittedTeamId.includes(x.teamID)
                  );
                }
              }
            }
          }
        } else if (currentUser.data.user.role === UserRoleEnum.Agent) {
          if (currentUser?.data?.user?.actionButton?.assignmentEnabled) {
            if (currentUser?.data?.user?.actionButton?.assignToAll || (!currentUser?.data?.user?.actionButton?.assignToAll && !currentUser?.data?.user?.actionButton?.assignToTeams)) {
              roles = roles.filter(
                (x) =>
                  x !== UserRoleEnum.TeamLead && x !== UserRoleEnum.SupervisorAgent && x !== UserRoleEnum.LocationManager
              );
              const teamid = objAgent
                .filter((x) => x.agentID === currentUser.data.user.userId)
                .map((s) => s.teamID)
                .filter(this.onlyUnique);
              if (teamid) {
                objAgent = objAgent.filter(
                  (x) =>
                    x.userRole === UserRoleEnum.Agent ||
                    x.teamID === teamid[0] || 
                    x.userRole === UserRoleEnum.SupervisorAgent ||
                    x.userRole === UserRoleEnum.LocationManager
                );
              }
            }
            if (currentUser?.data?.user?.actionButton?.assignToTeams && currentUser?.data?.user?.actionButton?.assignmentEnabled) {
              const splittedTeamId: any[] = currentUser?.data?.user?.actionButton?.assignToTeamIds?.split(',').map(x => +x);
              if (splittedTeamId.length > 0) {
                if (currentUser?.data?.user?.actionButton?.assignToSupervisor) {
                  objAgent = res.filter(
                    (x) =>
                      splittedTeamId.includes(x.teamID) || x.userRole === UserRoleEnum.SupervisorAgent || x.userRole === UserRoleEnum.LocationManager
                  );
                } else {
                  objAgent = objAgent.filter(
                    (x) =>
                      splittedTeamId.includes(x.teamID)
                  );
                }
              }
            }
          }
        }
        this.assignTo.next(objAgent);
        this.loadingUsers.next(false);
      });
    }
  
    return true;
  }
}
