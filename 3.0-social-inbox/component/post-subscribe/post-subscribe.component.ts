import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { notificationType } from 'app/core/enums/notificationType';
import { AuthUser } from 'app/core/interfaces/User';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { AccountService } from 'app/core/services/account.service';
import { CommonService } from 'app/core/services/common.service';
import { CustomSnackbarComponent } from 'app/shared/components';
import { ReplyService } from 'app/social-inbox/services/reply.service';
import { debounceTime, distinctUntilChanged, take } from 'rxjs/operators';
import { SubSink } from 'subsink/dist/subsink';

@Component({
    selector: 'app-post-subscribe',
    templateUrl: './post-subscribe.component.html',
    styleUrls: ['./post-subscribe.component.scss'],
    standalone: false
})
export class PostSubscribeComponent implements OnInit, OnDestroy {
  constructor(
    private _replyService: ReplyService,
    private commonService: CommonService,
    private _snackBar: MatSnackBar,
    private _accountService: AccountService,
    private translate: TranslateService,
    @Inject(MAT_DIALOG_DATA) public currentPost: BaseMention,
    private _currentDialog: MatDialogRef<PostSubscribeComponent>
  ) {}
  currentUser: AuthUser;
  visible = true;
  selectable = true;
  removable = true;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  emailCtrl = new UntypedFormControl();
  filteredEmails: string[] = [];
  activityType: number = 1;
  subject: string;
  emails: string[] = [];
  sendNewUpdates: boolean = false;
  subscribeLoader: boolean = false;
  modifySubscribeLoader: boolean = false;
  isSubscribe: boolean = false;
  subs = new SubSink();
  emailsLoading = false;
  subscribeId: number;
  subscribeLoading = false;
  defaultLayout: boolean = true;
  subscribeForm = new UntypedFormGroup({
    subscribeTo: new UntypedFormControl('', [Validators.required]),
    emailIds: new UntypedFormControl([], [Validators.required]),
    subject: new UntypedFormControl(''),
    sendNewUpdates: new UntypedFormControl(false),
  });
  @ViewChild('emailInput') emailInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  @ViewChild('subscribeFormElement') subscribeFormElement;
  ngOnInit(): void {
    this._accountService.currentUser$
      .pipe(take(1))
      .subscribe((user) => (this.currentUser = user));
    this.updateFilteredlist();
    this.subscribeLoading = true;
    this._replyService
      .getSubscibeData(this.currentPost)
      .pipe(take(1))
      .subscribe((response) => {
        this.isSubscribe = response.isSubscribe ? response.isSubscribe : false;
        this.subscribeId = response.id;
        let updateSubscribeInfo;
        if (this.isSubscribe) {
          updateSubscribeInfo = {
            subscribeTo: response?.activityType
              ? response?.activityType.toString()
              : '',
            emailIds: response.emailAddress
              ? response.emailAddress.split(',')
              : [],
            subject: response.subject ? response.subject : '',
            sendNewUpdates: response.sendOnlyNewUpdates
              ? response.sendOnlyNewUpdates
              : false,
          };
          this.emailIds.value = response.emailAddress
            ? response.emailAddress.split(',')
            : [];
        } else {
          const userEmail = this.currentUser?.data?.user?.emailAddress
            ? [this.currentUser?.data?.user?.emailAddress]
            : [];
          this.emailIds.value = userEmail;
          updateSubscribeInfo = {
            subscribeTo: '2',
            emailIds: userEmail,
            subject: '',
            sendNewUpdates: false,
          };
        }
        this.subscribeForm.setValue(updateSubscribeInfo);
        this.assignSubject(response?.activityType || '2');
        this.subscribeLoading = false;
      });

    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          
        }
      })
    )
  }

  get emailIds(): any {
    return this.subscribeForm.get('emailIds');
  }

  assignSubject(value): void {
    if (+value === 1) {
      this.subscribeForm.patchValue({
        subject: `Activity update regarding Ticket ID - ${this.currentPost.ticketID}`,
      });
    } else if (+value === 2) {
      this.subscribeForm.patchValue({
        subject: `Ticket status update regarding  Ticket ID - ${this.currentPost.ticketID}`,
      });
    }
  }

  addEmail(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    const valueIndex = this.emailIds.value.findIndex(
      (email) => email.toLowerCase() === value.toLowerCase()
    );
    if (valueIndex > 0) {
      // Add our email
      if ((value || '').trim()) {
        this.emailIds.value.push(value.trim());
        // this.emailIds.value.push(value);
        this.emailIds.markAsDirty();
        this.emailIds.updateValueAndValidity();
      }
      this.emailCtrl.setValue(null);
    }
    this.filteredEmails = [];
  }

  removeEmail(email: string): void {
    const index = this.emailIds.value.indexOf(email);
    if (index >= 0) {
      this.emailIds.value.splice(index, 1);
    }
  }

  selectedEmail(event: MatAutocompleteSelectedEvent): void {
    const itemIndex = this.emailIds.value.findIndex(
      (email) => email.toLowerCase() === event.option.viewValue.toLowerCase()
    );
    if (itemIndex === -1) {
      this.emailIds.value.push(event.option.viewValue);
      this.emailInput.nativeElement.value = '';
      // this.emailIds.value.push(event.option.viewValue);
      this.emailIds.updateValueAndValidity();
      this.emailCtrl.setValue(null);
      this.emailIds.markAsDirty();
    } else {
      this._snackBar.openFromComponent(CustomSnackbarComponent, {
        duration: 5000,
        data: {
          type: notificationType.Warn,
          message: this.translate.instant('You-have-already-email'),
        },
      });
    }
    this.emailInput.nativeElement.blur();
    this.emailInput.nativeElement.value = '';
    this.clearFilteredlist();
  }

  clearFilteredlist(): void {
    this.filteredEmails = [];
  }

  private updateFilteredlist(): void {
    this.subs.add(
      this.emailCtrl.valueChanges
        .pipe(debounceTime(500), distinctUntilChanged())
        .subscribe((value) => {
          if (value && value.trim() !== '') {
            this.emailsLoading = true;
            this._replyService
              .getmailList(value)
              .pipe(take(1))
              .subscribe(
                (emails) => {
                  this.filteredEmails = emails;
                  this.emailsLoading = false;
                },
                (err) => {
                  this.clearFilteredlist();
                }
              );
          } else {
            // this.clearFilteredlist();
          }
        })
    );
  }

  private assignSubscribeParam(
    status: boolean,
    isModified: boolean = false
  ): object {
    return {
      EmailAddress: this.emailIds.value.join(),
      Subject: this.subscribeForm.get('subject').value,
      ActivityType: +this.subscribeForm.get('subscribeTo').value,
      SendOnlyNewUpdates: this.subscribeForm.get('sendNewUpdates').value,
      IsSubscribe: status,
      TagID: this.currentPost.tagID,
      TicketID: this.currentPost.ticketID,
      BrandID: this.currentPost.brandInfo.brandID,
      BrandName: this.currentPost.brandInfo.brandName,
      ID: this.subscribeId,
      Channel: this.currentPost.channelType,
      IsModified: isModified,
      actionFrom: 0,
    };
  }

  modifySubscribe(): void {
    if (this.subscribeForm.valid) {
      this.modifySubscribeLoader = true;
      const subscribeParams = this.assignSubscribeParam(true, true);
      this._replyService.postSubscribe(subscribeParams).subscribe(
        (res) => {
          if (res.success) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Subscription-modified-for-Ticket-ID', { ticketID: this.currentPost.ticketID }),
              },
            });
            this.currentPost.ticketInfo.isSubscribed = true;
          } else {
            if (res.message !== '') {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: res.message,
                },
              });
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this.translate.instant('Error-Occured'),
                },
              });
            }
          }
          this.modifySubscribeLoader = false;
          this._currentDialog.close();
        },
        (err) => {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Error-Occured'),
            },
          });
          this.modifySubscribeLoader = false;
        }
      );
    }
  }

  unsubscribePost(): void {
    if (this.subscribeForm.valid) {
      this.subscribeLoader = true;
      const subscribeParams = this.assignSubscribeParam(false);
      this._replyService.postSubscribe(subscribeParams).subscribe(
        (res) => {
          if (res.success) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Subscription-disabled-for-Ticket-ID', { ticketID: this.currentPost.ticketID }),
              },
            });
            this.currentPost.ticketInfo.isSubscribed = false;
          } else {
            if (res.message !== '') {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: res.message,
                },
              });
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this.translate.instant('Error-Occured'),
                },
              });
            }
          }
          this.subscribeLoader = false;
          this._currentDialog.close();
        },
        (err) => {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Error-Occured'),
            },
          });
          this.subscribeLoader = false;
        }
      );
    }
  }

  subscribePost(): void {
    if (this.subscribeForm.valid) {
      this.subscribeLoader = true;
      const subscribeParams = this.assignSubscribeParam(true);

      this._replyService.postSubscribe(subscribeParams).subscribe(
        (res) => {
          if (res.success) {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Success,
                message: this.translate.instant('Subscription-enabled-for-Ticket-ID', { ticketID: this.currentPost.ticketID }),
              },
            });
            this.currentPost.ticketInfo.isSubscribed = true;
          } else {
            if (res.message !== '') {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: res.message,
                },
              });
            } else {
              this._snackBar.openFromComponent(CustomSnackbarComponent, {
                duration: 5000,
                data: {
                  type: notificationType.Error,
                  message: this.translate.instant('Error-Occured'),
                },
              });
            }
          }
          this.subscribeLoader = false;
          this._currentDialog.close();
        },
        (err) => {
          this._snackBar.openFromComponent(CustomSnackbarComponent, {
            duration: 5000,
            data: {
              type: notificationType.Error,
              message: this.translate.instant('Error-Occured'),
            },
          });
          this.subscribeLoader = false;
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
