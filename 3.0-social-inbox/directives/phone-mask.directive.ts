import { Directive, ElementRef, Input, HostListener } from '@angular/core';
// import { arrIndexOf } from '@microsoft/applicationinsights-core-js';
@Directive({
    selector: '[appPhoneMask]',
    standalone: false
})
export class PhoneMaskDirective {
  constructor() {}

  @Input() OnlyNumber: boolean;
  @HostListener('keydown', ['$event']) onKeyDown(event) {
    let e = <KeyboardEvent>event;
    if (this.OnlyNumber) {
      let keyArray: Array<string> = [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '0',
        '+',
        'ArrowLeft',
        'ArrowRight',
        'ArrowDown',
        'ArrowUp',
        'Backspace',
        'Delete',
      ];
      var u = e.key;
      console.log('---E.KEY---', u);
      if (
        // Allow: Ctrl+A
        (u === 'a' && (e.ctrlKey || e.metaKey)) ||
        (u === 'A' && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+C
        (u === 'c' && (e.ctrlKey || e.metaKey)) ||
        (u === 'C' && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+V
        (u === 'v' && (e.ctrlKey || e.metaKey)) ||
        (u === 'V' && (e.ctrlKey || e.metaKey)) ||
        // Allow: Ctrl+X
        (u === 'x' && (e.ctrlKey || e.metaKey)) ||
        (u === 'X' && (e.ctrlKey || e.metaKey))
      ) {
        return;
      }
      if (keyArray.indexOf(u) !== -1) {
        return true;
      } else return false;
    }
  }
}
