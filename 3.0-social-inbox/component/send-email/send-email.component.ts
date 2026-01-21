import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatChipInputEvent } from '@angular/material/chips';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ManageUsersService } from 'app/accounts/services/manage-users.service';
import { UserRoleEnum } from 'app/core/enums/UserRoleEnum';
import { GroupEmailList } from 'app/core/models/viewmodel/GroupEmailList';
@Component({
    selector: 'app-send-email',
    templateUrl: './send-email.component.html',
    styleUrls: ['./send-email.component.scss'],
    standalone: false
})
export class SendEmailComponent implements OnInit {
  public Editor = ClassicEditor;
  emailCc: boolean = false;
  emailBcc: boolean = false;
  CKEditorConfig = {
    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'Undo', 'Redo'],
  };

  editorConfig = {
    toolbar: {
      items: [
        'bold',
        'italic',
        'underline',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'indent',
        'outdent',
        '|',
        'imageUpload',
        'blockQuote',
        'insertTable',
        'undo',
        'redo',
      ],
    },
    image: {
      toolbar: [
        'imageStyle:full',
        'imageStyle:side',
        '|',
        'imageTextAlternative',
      ],
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
    },
    // This value must be kept in sync with the language defined in webpack.config.js.
    language: 'en',
    enterMode: 2,
  };

  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  groupToEmails: string[] = [];
  groupCCEmails: string[] = [];
  groupBCCEmails: string[] = [];

  draggedEmail: string[] = [];
  currentType: string = '';
  ctrlKeyPressed: boolean = false;
  selectedChips: { [key: string]: string[] } = {};
  input2Timeout: any;

  inputRecvd: { [key: string]: boolean } = {
    'groupto': false,
    'groupcc': false,
    'groupbcc': false,
    'rTo': false,
    'rCC': false,
    'rBCC': false,
    'to': false,
    'cc': false,
    'bcc': false,
    'replyTo': false,
    'replyCC': false,
    'replyBCC': false,
    'EFreplyTo': false,
    'EFreplyCC': false,
    'EFreplyBCC': false
  };

  emailToEmail: string[] = [];
  emailCCEmails: string[] = [];
  emailBCCEmails: string[] = [];

  replyEmailcc: boolean = false;
  replyEmailBcc: boolean = false;

  emailGroupList: GroupEmailList[];

  emailGroupSuggestList: GroupEmailList[];
  allGroupEmailList = [];

  emailBody: string = `<p>Hi [Supervisor&#39;s Name],<br />
Could you please update the authentication at the earliest so I can continue assisting customers without interruption?<br />
Looking forward to your response.</p>

<p>Best regards,<br />
[Agent Name]</p>
`;
  emailsubject: string = 'Request for Twitter account Re-Authentication';
  emailLists:any[] = [];

  constructor(public cdr: ChangeDetectorRef, private _manageUserService: ManageUsersService,) { }

  ngOnInit(): void { 
    this.getAllUsersEmails();
  }

  handleKeyboardEvent(event: KeyboardEvent, copyEmail: any, emailType: string): void {
    if (event.ctrlKey || event.metaKey) {
      this.ctrlKeyPressed = true;  // Enable multi-selection mode when Ctrl is pressed
    }
    if (copyEmail?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'a') {
      event.preventDefault();
      this.selectedChips[emailType] = [...copyEmail];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'c') {
      event.preventDefault();
      const selectedText = this.selectedChips[emailType].join(',');
      navigator.clipboard.writeText(selectedText);
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'x') {
      event.preventDefault();
      if (this.selectedChips[emailType]?.length > 0) {
        const selectedText = this.selectedChips[emailType].join(',');
        navigator.clipboard.writeText(selectedText);
      }

      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && event.key === 'Escape') {
      this.selectedChips[emailType] = [];
    }
    if (emailType) {
      const emailTypeMapping: { [key: string]: { previous: string, current: string, next: string } } = {
        to: { previous: null, current: 'to', next: 'cc' },
        cc: { previous: 'to', current: 'cc', next: 'bcc' },
        bcc: { previous: 'cc', current: 'bcc', next: null }, // No further shifting from bcc
        rTo: { previous: null, current: 'rTo', next: 'rCC' },
        rCC: { previous: 'rTo', current: 'rCC', next: 'rBCC' },
        rBCC: { previous: 'rCC', current: 'rBCC', next: null },
        replyTo: { previous: null, current: 'replyTo', next: 'replyCC' },
        replyCC: { previous: 'replyTo', current: 'replyCC', next: 'replyBCC' },
        replyBCC: { previous: 'replyCC', current: 'replyBCC', next: null },
        EFreplyTo: { previous: null, current: 'EFreplyTo', next: 'EFreplyCC' },
        EFreplyCC: { previous: 'EFreplyTo', current: 'EFreplyCC', next: 'EFreplyBCC' },
        EFreplyBCC: { previous: 'EFreplyCC', current: 'EFreplyBCC', next: null },
        groupto: { previous: null, current: 'groupto', next: 'groupcc' },
        groupcc: { previous: 'groupto', current: 'groupcc', next: 'groupbcc' },
        groupbcc: { previous: 'groupcc', current: 'groupbcc', next: null }
      };
      const { previous, current, next } = emailTypeMapping[emailType];
      if (this.selectedChips[emailType]?.length > 0 && event.shiftKey && event.code === 'ArrowDown') {
        event.preventDefault();
        if ((emailType == 'to' || emailType == 'rTo' || emailType == 'replyTo' || emailType == 'EFreplyTo') && this.emailToEmail) {
          this.emailToEmail = this.emailToEmail.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.emailCCEmails = [...this.emailCCEmails, ...this.selectedChips[current].filter((email) => !this.emailCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[next] = [];
        }
        if ((emailType == 'cc' || emailType == 'rCC' || emailType == 'replyCC' || emailType == 'EFreplyCC') && this.emailCCEmails) {
          this.emailCCEmails = this.emailCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.emailBCCEmails = [...this.emailBCCEmails, ...this.selectedChips[current].filter((email) => !this.emailBCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[next] = [];
        }
        if (emailType == 'groupto' && this.groupToEmails) {
          this.groupToEmails = this.groupToEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.groupCCEmails = [...this.groupCCEmails, ...this.selectedChips[current].filter((email) => !this.groupCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[next] = [];
        }
        if (emailType == 'groupcc' && this.groupCCEmails) {
          this.groupCCEmails = this.groupCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.groupBCCEmails = [...this.groupBCCEmails, ...this.selectedChips[current].filter((email) => !this.groupBCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[next] = [];
        }
      }
      if (this.selectedChips[emailType]?.length > 0 && event.shiftKey && event.code === 'ArrowUp') {
        event.preventDefault();
        if ((emailType == 'bcc' || emailType == 'rBCC' || emailType == 'replyBCC' || emailType == 'EFreplyBCC') && this.emailBCCEmails) {
          this.emailBCCEmails = this.emailBCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.emailCCEmails = [...this.emailCCEmails, ...this.selectedChips[current].filter((email) => !this.emailCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[previous] = [];
        }
        if ((emailType == 'cc' || emailType == 'rCC' || emailType == 'replyCC' || emailType == 'EFreplyCC') && this.emailCCEmails) {
          this.emailCCEmails = this.emailCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.emailToEmail = [...this.emailToEmail, ...this.selectedChips[current].filter((email) => !this.emailToEmail.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[previous] = [];
        }
        if (emailType == 'groupcc' && this.groupCCEmails) {
          this.groupCCEmails = this.groupCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.groupToEmails = [...this.groupToEmails, ...this.selectedChips[current].filter((email) => !this.groupToEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[previous] = [];
        }
        if (emailType == 'groupbcc' && this.groupBCCEmails) {
          this.groupBCCEmails = this.groupBCCEmails.filter((item) => { return !this.selectedChips[emailType].includes(item); });
          this.groupCCEmails = [...this.groupCCEmails, ...this.selectedChips[current].filter((email) => !this.groupCCEmails.includes(email))];
          this.selectedChips[current] = [];
          this.selectedChips[previous] = [];
        }
      }
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey) {
      if (event.code === 'ArrowLeft') {
        let remainingItems = copyEmail.slice(0, copyEmail?.length - this.selectedChips[emailType]?.length);
        if (remainingItems?.length > 0) {
          this.selectedChips[emailType].push(remainingItems[remainingItems?.length - 1]);
        }
      } else if (event.code === 'ArrowRight') {
        if (this.selectedChips[emailType]?.length > 0) {
          this.selectedChips[emailType].pop();
        }
      }
    }
  }

  // Called when key is released to stop multi-selection mode
  onParentKeyup(event: KeyboardEvent) {
    if (!event.ctrlKey && !event.metaKey) {
      this.ctrlKeyPressed = false; // Disable multi-selection mode when Ctrl is released
    }
  }

  reorderDroppedItem(event: CdkDragDrop<string[]>) {

    if (this.selectedChips[event.previousContainer.id]?.length) {
      this.draggedEmail = [...this.selectedChips[event.previousContainer.id]];
    }
    else {
      this.draggedEmail = [event.item.data];
    }
    console.log(event, 'event');

    if (event.previousContainer.id === event.container.id) {
      // Same container, no need to process
      return;
    }

    // Remove email from the source list
    if (event.previousContainer.id === 'to' || event.previousContainer.id === 'rTo' || event.previousContainer.id === 'replyTo' || event.previousContainer.id === 'EFreplyTo') {
      this.emailToEmail = this.emailToEmail.filter((email) => !this.draggedEmail.includes(email));
    } else if (event.previousContainer.id === 'cc' || event.previousContainer.id === 'rCC' || event.previousContainer.id === 'replyCC' || event.previousContainer.id === 'EFreplyCC') {
      this.emailCCEmails = this.emailCCEmails.filter((email) => !this.draggedEmail.includes(email));
    } else if (event.previousContainer.id === 'bcc' || event.previousContainer.id === 'rBCC' || event.previousContainer.id === 'replyBCC' || event.previousContainer.id === 'EFreplyBCC') {
      this.emailBCCEmails = this.emailBCCEmails.filter((email) => !this.draggedEmail.includes(email));
    }

    // Add email to the target list
    if (
      (event.container.id === 'to' || event.container.id === 'rTo' || event.container.id === 'replyTo' || event.container.id === 'EFreplyTo') &&
      this.draggedEmail.some(email => !this.emailToEmail.includes(email))
    ) {
      this.emailToEmail.push(...this.draggedEmail.filter(email => !this.emailToEmail.includes(email)));
    } else if (
      (event.container.id === 'cc' || event.container.id === 'rCC' || event.container.id === 'replyCC' || event.container.id === 'EFreplyCC') &&
      this.draggedEmail.some(email => !this.emailCCEmails.includes(email))
    ) {
      this.emailCCEmails.push(...this.draggedEmail.filter(email => !this.emailCCEmails.includes(email)));
    } else if (
      (event.container.id === 'bcc' || event.container.id === 'rBCC' || event.container.id === 'replyBCC' || event.container.id === 'EFreplyBCC') &&
      this.draggedEmail.some(email => !this.emailBCCEmails.includes(email))
    ) {
      this.emailBCCEmails.push(...this.draggedEmail.filter(email => !this.emailBCCEmails.includes(email)));
    }
    //after adding draggedEmail to target container, clearing the selected chips
    if (this.selectedChips[event.container.id]?.length > 0) {
      this.selectedChips[event.container.id] = [];
    }
  }

  removeEmailPill(tag, type: string): void {
    // remove from to emails
    if (type === 'to') {
      // if (
      //   !this.onlySendMail &&
      //   this.tempToEmail &&
      //   this.tempToEmail.some((email) => email == tag)
      // ) {
      //   this._snackBar.openFromComponent(CustomSnackbarComponent, {
      //     duration: 5000,
      //     data: {
      //       type: notificationType.Warn,
      //       message: 'You cannot remove original sender from the email list.',
      //     },
      //   });
      //   return;
      // }
      const index = this.emailToEmail.indexOf(tag);
      if (index > -1) {
        this.emailToEmail.splice(index, 1);
      }
    }
    // remove from cc emails
    if (type === 'cc') {
      const index = this.emailCCEmails.indexOf(tag);
      if (index > -1) {
        this.emailCCEmails.splice(index, 1);
      }
    }
    // remove from bcc emails
    if (type === 'bcc') {
      const index = this.emailBCCEmails.indexOf(tag);
      if (index > -1) {
        this.emailBCCEmails.splice(index, 1);
      }
    }
  }

  handleCtrlKey(event: KeyboardEvent, copyEmail: any, emailType: string) {
    if (event.ctrlKey || event.metaKey) {
      event.stopPropagation(); // Prevent the event from propagating to the parent
      this.ctrlKeyPressed = true;
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'c') {
      event.preventDefault();
      const selectedText = this.selectedChips[emailType].join(',');
      navigator.clipboard.writeText(selectedText);
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.key === 'Delete' || event.key === 'Backspace')) {
      event.preventDefault();
      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
    if (this.selectedChips[emailType]?.length > 0 && (event.ctrlKey || event.metaKey) && event.key === 'x') {
      event.preventDefault();
      if (this.selectedChips[emailType]?.length > 0) {
        const selectedText = this.selectedChips[emailType].join(',');
        navigator.clipboard.writeText(selectedText);
      }

      this.selectedChips[emailType].forEach((chip) => {
        const index = copyEmail.indexOf(chip);
        if (index > -1) {
          copyEmail.splice(index, 1);
        }
      });
      this.selectedChips[emailType] = [];
    }
  }

  selectChip(event: MouseEvent, mail: string, type: string) {
    event.stopPropagation();

    if (this.currentType && this.currentType !== type) {
      this.selectedChips[this.currentType] = []; // Clear previous type's selection
    }

    // Update the current type
    this.currentType = type;

    if (!this.selectedChips[type]) {
      this.selectedChips[type] = []; // Initialize as an empty array if undefined
    }
    if (this.ctrlKeyPressed) {
      // If Ctrl key is pressed, toggle the selection of the clicked chip
      const isSelected = this.selectedChips[type]?.includes(mail);
      if (isSelected) {
        // Deselect the chip
        this.selectedChips[type] = this.selectedChips[type].filter(item => item !== mail);
        console.log(`${mail} deselected`);
      } else {
        // Select the chip
        this.selectedChips[type].push(mail);
        console.log(`${mail} selected`);
      }
    }
    else {
      //single chip selection when ctrl key is not pressed
      this.selectedChips[type] = [];
      this.selectedChips[type].push(mail);
    }
  }

  addEmailPill(event: MatChipInputEvent, type: string): void {
    const input = event.input;
    const value = event.value;
    const splittedEmail = value.split(/[\s,]+/).filter(email => email.trim() !== '');
    splittedEmail.forEach((email) => {
      email = email.trim();
      if (email.trim() && this.isEmail(email.trim())) {
        if (!email.includes('noreply') && !email.includes('no-reply') && !email.includes('no.reply')) {
          if (type == 'to' || type == 'rTo' || type == 'replyTo' || type == 'EFreplyTo') {
            this.emailToEmail.some((grpEmail) => grpEmail.includes(email)) ? '' : this.emailToEmail.push(email.trim());
          }
          // add cc emails
          if (type == 'cc' || type == 'rCC' || type == 'replyCC' || type == 'EFreplyCC') {
            this.emailCCEmails.some((grpEmail) => grpEmail.includes(email)) ? '' : this.emailCCEmails.push(email.trim());
          }
          // add bcc emails
          if (type == 'bcc' || type == 'rBCC' || type == 'replyBCC' || type == 'EFreplyBCC') {
            this.emailBCCEmails.some((grpEmail) => grpEmail.includes(email)) ? '' : this.emailBCCEmails.push(email.trim());
          }
        }
      }
    })

    // Reset the input value
    if (input) {
      input.value = '';
      this.input2Timeout = setTimeout(() => {
        this.inputRecvd[type] = false;
      }, 500);
    }
  }

  onChangeTo(event, type?: string) {
    let allGroupEmailList = [];
    if (event && event.data !== '') {
      this.inputRecvd[type] = true;
      this.cdr.detectChanges();
    }
    else {
      this.inputRecvd[type] = false;
      this.cdr.detectChanges();
    }
    const inputElement = event.target as HTMLInputElement;
    const value = inputElement && inputElement?.value ? inputElement.value.trim() : '';
    if (value.length) {
      const filterValue = value.toLowerCase();
      this.allGroupEmailList = this.emailLists.filter(user => user?.email?.toLowerCase()?.includes(filterValue));
    } 
    else {
      this.emailGroupSuggestList = [];
      this.allGroupEmailList = [];
    }
  }

  addForwardEmailGroup(event, type) {
    if (event && event?.option && event?.option?.value && typeof event?.option?.value == 'string') {
      const value = event?.option?.value;
      if (!this.emailToEmail.includes(value.trim()) && type == 'to') {
        this.emailToEmail.push(value.trim());
      }
      if (!this.emailCCEmails.includes(value.trim()) && type == 'cc') {
        this.emailCCEmails.push(value.trim());
        this.replyEmailcc = true;
      }
      if (!this.emailBCCEmails.includes(value.trim()) && type == 'bcc') {
        this.emailBCCEmails.push(value.trim());
        this.replyEmailBcc = true;
      }
    } else if (event && event?.option && event?.option?.value) {
      const value = event.option.value;
      const toEmails = value.email_to ? value.email_to.split(',') : [];
      const ccEmails = value.email_cc ? value.email_cc.split(',') : [];
      const bccEmail = value.email_bcc ? value.email_bcc.split(',') : [];

      if (toEmails && toEmails.length) {
        toEmails.forEach(groupEmail => {
          if (!this.emailToEmail.includes(groupEmail.trim())) {
            this.emailToEmail.push(groupEmail.trim());
          }
        });
      }
      if (ccEmails && ccEmails.length) {
        ccEmails.forEach(groupEmail => {
          if (!this.emailCCEmails.includes(groupEmail.trim())) {
            this.emailCCEmails.push(groupEmail.trim());
            this.replyEmailcc = true;
          }
        });
      }
      if (bccEmail && bccEmail.length) {
        bccEmail.forEach(groupEmail => {
          if (!this.emailBCCEmails.includes(groupEmail.trim())) {
            this.emailBCCEmails.push(groupEmail.trim());
            this.replyEmailBcc = true;
          }
        });
      }

    }
    this.emailGroupSuggestList = [];
    this.allGroupEmailList = [];
  }

  isEmail(email): any {
    const regex =
      /^([a-zA-Z0-9_&#.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email);
  }

  getAllUsersEmails() {
    this._manageUserService.GetAllUsersEmailData().subscribe((result) => {
      if (result.success) {
        this.emailLists = result?.data?.filter(item=>item?.accountTypeID == UserRoleEnum.SupervisorAgent) || [];
        console.log(this.emailLists)
      }
    });
  }
}
