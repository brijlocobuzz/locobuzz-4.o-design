import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { PostsType } from 'app/core/models/viewmodel/GenericFilter';
import { ChatBotService } from 'app/social-inbox/services/chatbot.service';

@Component({
    selector: 'app-assignmentlimit',
    templateUrl: './assignmentlimit.component.html',
    styleUrls: ['./assignmentlimit.component.scss'],
    standalone: false
})
export class AssignmentlimitComponent implements OnInit, OnChanges {
  @Input() pageType: PostsType;
  @Input() BrandAssignmentList;
  @Input() showbreachnotification;
  @Output() assignmentLimitNotificationToggle = new EventEmitter();
  brandList = '';
  showPopup: boolean;
  constructor(private chatBotService: ChatBotService) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.showPopup = JSON.parse(localStorage.getItem('assignmentlimitmsg'));
    this.brandList = this.BrandAssignmentList.join();
    // if (this.showPopup) {
    //   this.chatBotService.chatPosition.next(true);
    // } else {
    //   //this.chatBotService.chatPosition.next(false);
    //   this.assignmentLimitNotificationClosed.emit(false);
    // }
    this.assignmentLimitNotificationToggle.emit(this.showPopup);
    // console.log(
    //   `emit from AssignmentlimitComponent => ngOnChanges => line 31. Check: ${this.showPopup} `
    // );
  }

  ngOnInit(): void {
    this.showPopup = JSON.parse(localStorage.getItem('assignmentlimitmsg'));
    this.brandList = this.BrandAssignmentList.join();
    // if (this.showPopup) {
    //   this.chatBotService.chatPosition.next(true);
    // } else {
    //   //this.chatBotService.chatPosition.next(false);
    //   this.assignmentLimitNotificationClosed.emit(false);
    // }
    this.assignmentLimitNotificationToggle.emit(this.showPopup);
    // console.log(
    //   `emit from AssignmentlimitComponent => ngOnInit() => line 42. Check: ${this.showPopup} `
    // );
  }

  close() {
    this.showPopup = false;
    //this.chatBotService.chatPosition.next(false);
    this.assignmentLimitNotificationToggle.emit(false);
    // console.log(
    //   `emit from AssignmentlimitComponent => close() => line 49 .Check: ${this.showPopup} `
    // );
  }
}
