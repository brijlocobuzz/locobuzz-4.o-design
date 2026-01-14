import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, Input, OnInit } from '@angular/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
    selector: 'app-post-email',
    templateUrl: './post-email.component.html',
    styleUrls: ['./post-email.component.scss'],
    standalone: false
})
export class PostEmailComponent implements OnInit {
  constructor(private _bottomSheet: MatBottomSheet) {}
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  @Input() postMessage: any;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  emails: { id: string }[] = [{ id: 'john.doe@example.com' }];

  ngOnInit(): void {
    // console.log('ReplyMessage');
    // console.log(this.postMessage);
  }

  addEmail(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {
      this.emails.push({ id: value.trim() });
    }

    if (input) {
      input.value = '';
    }
  }

  removeEmail(email): void {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  closePostReply(): void {
    this._bottomSheet.dismiss();
  }
}
