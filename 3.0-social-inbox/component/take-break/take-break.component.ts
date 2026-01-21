import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { notificationType } from 'app/core/enums/notificationType';
import { locobuzzAnimations } from '@locobuzz/animations';
import { AuthUser } from 'app/core/interfaces/User';
import { AccountService } from 'app/core/services/account.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { take } from 'rxjs/operators';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-take-break',
    templateUrl: './take-break.component.html',
    styleUrls: ['./take-break.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class TakeBreakComponent implements OnInit,OnDestroy {
  isAutoAssignmentDisabled: boolean;
  currentUser: AuthUser;
  isScheduled?: boolean = false;
  isScheduledLoader?: boolean = true;
  isScheduleButton?: boolean = false;
  typeofBreak?: string = 'Tea Break';
  timeofBreak?: string = '0';
  spinner:boolean = false;
  subs = new SubSink();
  getUserAssigmentDetailsApi;
  ScheduleBreakAndPauseAssignment;
  UserIsOnBreak;
  

  constructor(
    private _userDetailService: UserDetailService,
    private _accountService: AccountService,
    private _takeabreakDialog: MatDialogRef<TakeBreakComponent>,
    private _router: Router,
    private _snackBar: MatSnackBar,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.subs.add(
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user)));
    this.GetUserAssigmentDetails();
  }

  GetUserAssigmentDetails(): void {
    this.getUserAssigmentDetailsApi = this._userDetailService.getUserAssigmentDetails().subscribe((data) => {
      if (
        this.currentUser.data.user.isScheduledBreakApplicable &&
        this.currentUser.data.user.isScheduledBreakEnabled
      ) {
        this.isScheduled = true;
        this.isScheduledLoader = false;
        if (this.timeofBreak === '0') {
          this.isScheduleButton = false;
        } else {
          this.isScheduleButton = true;
        }
      } else {
        this.isScheduled = false;
        this.isScheduledLoader = false;
        this.isScheduleButton = false;
      }

      if (data.isUserAssignmentDisabled === 0) {
        this.isAutoAssignmentDisabled = false;
      } else {
        this.isAutoAssignmentDisabled = true;
      }
    });
  }

  scheduledbreak(): void {
    const obj = {
      typeofBreak: this.typeofBreak,
      timeofBreak: this.timeofBreak,
      isscheduled: true,
    };

    const scheduletime = this.timeofBreak;
    const breaktype = this.typeofBreak;
    const breaktime = new Date();
    breaktime.setMinutes(breaktime.getMinutes() + +scheduletime);
    const currentuserbreakschedule = localStorage.getItem(
      'currentuserbreakschedule_' + this.currentUser.data.user.userId
    );
    if (!currentuserbreakschedule) {
      localStorage.setItem(
        'currentuserbreakschedule_' + this.currentUser.data.user.userId,
        '1'
      );
    }

    const currentuserbreaktime = localStorage.getItem(
      'currentuserbreaktime_' + this.currentUser.data.user.userId
    );
    if (!currentuserbreaktime) {
      localStorage.setItem(
        'currentuserbreaktime_' + this.currentUser.data.user.userId,
        breaktime.toString()
      );
    }

    const currentuserbreaktype = localStorage.getItem(
      'currentuserbreaktype_' + this.currentUser.data.user.userId
    );
    if (!currentuserbreaktype) {
      localStorage.setItem(
        'currentuserbreaktype_' + this.currentUser.data.user.userId,
        breaktype
      );
    }

    this.ScheduleBreakAndPauseAssignment= this._userDetailService
      .ScheduleBreakAndPauseAssignment()
      .subscribe((data) => {
        this._takeabreakDialog.close(obj);
        // this._userDetailService.schedulebreaksubmit(obj);
      });
  }

  ScheduleBreaktime(): void {
    if (this.timeofBreak !== '0') {
      this.GetUserAssigmentDetails();
    } else {
      this.isScheduleButton = false;
    }
  }

  Goforbreak(): void {
    this.spinner = true;
    const obj = {
      pageURL: window.location.href,
      typeOfBreak: this.typeofBreak,
    };
    localStorage.removeItem('useronbreak_' + this.currentUser.data.user.userId);
    localStorage.setItem(
      'useronbreak_' + this.currentUser.data.user.userId,
      '1'
    );
    this.UserIsOnBreak = this._userDetailService.UserIsOnBreak(obj).subscribe((data) => {
      if(data.success) {
        this.spinner = false;
        this._takeabreakDialog.close();
        this._router.navigate(['/breaktime']);
      } else {
        this.spinner = false;
        this._snackBar.openFromComponent(CustomSnackbarComponent, {
          duration: 5000,
          data: {
            type: notificationType.Error,
            message: this.translate.instant('Something-went-wrong-sometime'),
          },
        });
      }
    }, error => this.spinner = false)
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.getUserAssigmentDetailsApi){
      this.getUserAssigmentDetailsApi.unsubscribe();
    }
    if (this.ScheduleBreakAndPauseAssignment) {
      this.ScheduleBreakAndPauseAssignment.unsubscribe();
    }
    if (this.UserIsOnBreak){
      this.UserIsOnBreak.unsubscribe();
    }
  }
}
