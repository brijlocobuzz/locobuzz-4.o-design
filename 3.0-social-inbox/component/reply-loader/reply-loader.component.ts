import { Component, OnInit } from '@angular/core';
import { locobuzzAnimations } from './../../../@locobuzz/animations';

@Component({
    selector: 'app-reply-loader',
    templateUrl: './reply-loader.component.html',
    styleUrls: ['./reply-loader.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class ReplyLoaderComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
