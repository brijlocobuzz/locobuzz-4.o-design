import { Component } from '@angular/core';
import { AccountService } from 'app/core/services/account.service';

@Component({
    selector: 'app-tutorial-modal',
    templateUrl: './tutorial-modal.component.html',
    styleUrls: ['./tutorial-modal.component.scss'],
    standalone: false
})
export class TutorialModalComponent {
  MAX_SKIP = 1;

  constructor(private accountService: AccountService) {}

  handleSkip(): void {
    const cookie = this.accountService.getCookie('EmailGuide');
    if (cookie) {
      const settings = JSON.parse(cookie);
      settings.skipCount = (settings.skipCount || 0) + 1;

      if (settings.skipCount === this.MAX_SKIP) {
        settings.showFlag = false;
      }

      this.accountService.setCookie('EmailGuide', JSON.stringify(settings));
    }
  }

  handleDontShowAgain(): void {
    const cookie = this.accountService.getCookie('EmailGuide');
    if (cookie) {
      const settings = JSON.parse(cookie);
      settings.showFlag = false;

      this.accountService.setCookie('EmailGuide', JSON.stringify(settings));
    }
  }

}
