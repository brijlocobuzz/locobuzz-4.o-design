import { Component, OnInit } from '@angular/core';
import { locobuzzAnimations } from '@locobuzz/animations';

@Component({
    selector: 'app-post-loader',
    templateUrl: './post-loader.component.html',
    styleUrls: ['./post-loader.component.scss'],
    animations: locobuzzAnimations,
    standalone: false
})
export class PostLoaderComponent implements OnInit {
  constructor() {}
  ngOnInit(): void {}
}
