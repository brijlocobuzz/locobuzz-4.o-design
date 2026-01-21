import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Emoji } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { excludeEmojis } from 'app/app-data/emoji';

@Component({
    selector: 'app-add-caption',
    templateUrl: './add-caption.component.html',
    styleUrls: ['./add-caption.component.scss'],
    standalone: false
})
export class AddCaptionComponent implements OnInit {
  caption:string = '';
  emojiSet: string = 'facebook';
  loadEmojiSheet: Emoji['backgroundImageFn'] = (set, sheetSize) => {
    return `assets/images/emoji-sheets/${set}-emoji-sheet.png`;
  };
  filteredEmojis = (emoji) => {
    const emojiIndex = excludeEmojis.indexOf(emoji);
    if (emojiIndex > 0) {
      return false;
    } else {
      return true;
    }
  };
  constructor(
    public dialogRef: MatDialogRef<AddCaptionComponent>,
  ) { }

  ngOnInit(): void {
  }

  saveCaption(){
    this.dialogRef.close(this.caption);
  }

  proceedWithoutCaption(){
    this.dialogRef.close('without');
  }

  selectEmoji(event){
    this.caption = this.caption.concat(event.emoji.native);
  }

}
