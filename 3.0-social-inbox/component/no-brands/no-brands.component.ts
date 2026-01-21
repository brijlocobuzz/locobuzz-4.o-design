import { Component, OnInit } from '@angular/core';
import { ProfileService } from 'app/accounts/services/profile.service';
import { AuthUser } from 'app/core/interfaces/User';
import { ProfileDetails } from 'app/core/models/accounts/userprofile';
import { AccountService } from 'app/core/services/account.service';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-no-brands',
    templateUrl: './no-brands.component.html',
    styleUrls: ['./no-brands.component.scss'],
    standalone: false
})
export class NoBrandsComponent implements OnInit {
  currentUser: AuthUser;
  profiledetails: ProfileDetails;
  constructor(
    private _accountService: AccountService,
    private _profileService: ProfileService
  ) {}

  ngOnInit(): void {
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    this.userProfile();
  }

  userProfile() {
    this._profileService
      .GetUserDetailsByUserID(this.currentUser.data.user.userId)
      .subscribe((result) => {
        if (result.success) {
          this.profiledetails = result.data;
        }
      });
  }
}
