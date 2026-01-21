import { Component, NgZone, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountSettingService } from 'app/accounts/services/account-setting.service';
import { ProfileService } from 'app/accounts/services/profile.service';
import { notificationType } from 'app/core/enums/notificationType';
import { AuthUser } from 'app/core/interfaces/User';
import { AccountService } from 'app/core/services/account.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { LoaderService } from 'app/shared/services/loader.service';
import { UserDetailService } from 'app/social-inbox/services/user-details.service';
import { take } from 'rxjs/internal/operators/take';

@Component({
    selector: 'app-break',
    templateUrl: './break.component.html',
    styleUrls: ['./break.component.scss'],
    standalone: false
})
export class BreakComponent implements OnInit {
  interval;
  currentUser: AuthUser;
  time = new Date();
  currenttime: any;
  oldBreakTime: any;
  username: string;
  profilePic:string = '';
  spinner:boolean = false;
  authorName:string = '';
  ssoUser: boolean = false;
  ssoCode: string = '';
  organizationDomain = '';
  isAutoAssignment = false;

  constructor(
    private _router: Router,
    private _userDetailService: UserDetailService,
    private _accountService: AccountService,
    private _loaderService: LoaderService,
    private _profileService: ProfileService,
    private _snackBar: MatSnackBar,
    private route: ActivatedRoute,
    public accountSettingService: AccountSettingService,
    private translate: TranslateService
  ) {}

  // private subscription: Subscription;

  public dDay = new Date();
  milliSecondsInASecond = 1000;
  hoursInADay = 24;
  minutesInAnHour = 60;
  SecondsInAMinute = 60;

  public timeDifference;
  public secondsToDday;
  public minutesToDday;
  public hoursToDday;
  public userEmail:string = '';

  intervalTimer;

  getTimeDifference(): void {
    this.timeDifference = new Date().getTime() - this.dDay.getTime();
    this.allocateTimeUnits(this.timeDifference);
  }

  allocateTimeUnits(timeDifference): string {
    this.hoursToDday = Math.floor(
      (timeDifference /
        (this.milliSecondsInASecond *
          this.minutesInAnHour *
          this.SecondsInAMinute)) %
        this.hoursInADay
    );
    this.minutesToDday = Math.floor(
      (timeDifference / (this.milliSecondsInASecond * this.minutesInAnHour)) %
        this.SecondsInAMinute
    );
    this.secondsToDday = Math.floor(
      (timeDifference / this.milliSecondsInASecond) % this.SecondsInAMinute
    );

    const currenttime =
      ('00' + this.hoursToDday).slice(-2) +
      ':' +
      ('00' + this.minutesToDday).slice(-2) +
      ':' +
      ('00' + this.secondsToDday).slice(-2);
    // console.log(currenttime);
    this.hoursToDday = ('00' + this.hoursToDday).slice(-2);
    this.minutesToDday = ('00' + this.minutesToDday).slice(-2);
    this.secondsToDday = ('00' + this.secondsToDday).slice(-2);
    return currenttime;
  }

  ngOnInit(): void {
    this.ssoCode = this.route.snapshot.queryParamMap.get('code');
    this.getSSOOrganizationList();
    if (this.ssoCode) {
      const baseUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, baseUrl);
      this.ssoUserResponseCallback();
    } else {
      this._loaderService.toggleMainLoader({ isApiLoaded: true });
      this._loaderService.toggleMainLoader({ isViewLoaded: true });
    }
    let BreakTime = localStorage.getItem('BreakTime');
    if (BreakTime){
      BreakTime = JSON.parse(BreakTime);
      this.dDay = new Date(BreakTime);
    }

    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    this.userProfile();
    this.userEmail = this.currentUser?.data?.user?.emailAddress;
    this.ssoUser = this.currentUser?.data?.user?.isOverrideAllUser;
    const loginType = localStorage.getItem('loginBy');
    if (loginType && loginType == 'Passward') {
      this.ssoUser = false;
    }
    this.username =
      this.currentUser.data.user.firstName +
      ' ' +
      this.currentUser.data.user.lastName;

    let user = localStorage.getItem(
      'useronbreak_' + this.currentUser.data.user.userId
    );
    if (user == '1') {
      this.intervalTimer = setInterval(() => {
        this.getTimeDifference();
        // console.log('Interval called');
      }, 1000);
    } else {
      this._router.navigate(['/social-inbox']);
    }

    localStorage.setItem('BreakTime', JSON.stringify(this.dDay))
    if (localStorage.getItem('IsUserAssignmentDisabled') == '1') {
      this.isAutoAssignment = true;
    }
    // this._ngZone.runOutsideAngular(() => {
    // });
    // this.subscription = interval(1000)
    //   .subscribe(x => { this.getTimeDifference(); });
  }

  getSSOOrganizationList() {
    this.accountSettingService
      .GetSSOOrgnicationList()
      .subscribe((result) => {
        if (result.success) {
          const ssoConfigurationListData = result?.data && result?.data?.data ? result?.data?.data : [];
          if (ssoConfigurationListData && ssoConfigurationListData.length > 0) {
            const ssoEnable = this.currentUser?.data?.user?.isUserSSOEnabled;
            this.organizationDomain = ssoConfigurationListData[0].organizationDomain;
            if (this.organizationDomain && ssoEnable && this.userEmail.includes(this.organizationDomain)){
              this.ssoUser = true;
              const loginType = localStorage.getItem('loginBy');
              if (loginType && loginType == 'Passward') {
                this.ssoUser = false;
              }
            }
          }
        }
      }, error => {
      });
  }

  userProfile() {
    const userID = this.currentUser?.data?.user?.userId;
    this._profileService
      .GetUserDetailsByUserID(userID)
      .subscribe((result) => {
        if (result.success && result.data) {
          this.profilePic = result?.data?.profilePic;
        }
      });
  }

  ssoUserEndBreak():void{
    this.spinner = true;
    this._userDetailService.EndBreakWithSSO().subscribe((res) => {
      if (res) {
        if (res.success) {
          this.spinner = false;
          window.location.href = res.message;
          localStorage.setItem('IsUserAssignmentDisabled', '0');
        } else {
          this.spinner = false;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Something-went-wrong-try-again'),
            },
          });
        }

      }
    }, error => this.spinner = false);
  }

  ssoUserResponseCallback(): void {
    this.spinner = true;
    this._userDetailService.SSOUserResponseCallback(this.ssoCode).subscribe((res) => {
      if (res) {
        if (res.success) {
          this.spinner = false;
          if (res.data.BreakEnded) {
            localStorage.removeItem('BreakTime')
            localStorage.removeItem(
              'useronbreak_' + this.currentUser.data.user.userId
            );
            this._router.navigate(['/social-inbox']);
            if (this.interval) {
              clearInterval(this.interval);
            }
          }
        } else {
          this._router.navigate(['/breaktime']);
          this.spinner = false;
          this._loaderService.toggleMainLoader({ isApiLoaded: true });
          this._loaderService.toggleMainLoader({ isViewLoaded: true });
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: res && res.message ? res.message : this.translate.instant('Something-went-wrong-try-again'),
            },
          });
        }
      }
    }, error => {
      this.spinner = false;
      this._loaderService.toggleMainLoader({ isApiLoaded: true });
      this._loaderService.toggleMainLoader({ isViewLoaded: true });
    });
  }

  endBreak(password: string): void {
    this.spinner = true;
    const obj = {
      password,
    };

    this._userDetailService.BreakEnding(obj).subscribe((res) => {
      if (res) {
        if (res.success) {
          this.spinner = false;
          if (res.data.BreakEnded) {
            localStorage.removeItem('BreakTime')
            localStorage.removeItem(
              'useronbreak_' + this.currentUser.data.user.userId
            );
            this._router.navigate(['/social-inbox']);
            if (this.interval) {
              clearInterval(this.interval);
            }
          }
          localStorage.setItem('IsUserAssignmentDisabled', '0');
        } else {
          this.spinner = false;
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Warn,
              message: this.translate.instant('Please-enter-valid-password'),
            },
          });
        }
    
      }
    }, error => this.spinner = false);
  }
}
