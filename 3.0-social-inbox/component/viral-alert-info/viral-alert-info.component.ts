import { AfterViewInit, Component, OnInit } from '@angular/core';
import { LoaderService } from 'app/shared/services/loader.service';

@Component({
    selector: 'app-viral-alert-info',
    templateUrl: './viral-alert-info.component.html',
    styleUrls: ['./viral-alert-info.component.scss'],
    standalone: false
})
export class ViralAlertInfoComponent implements OnInit, AfterViewInit {
  ViralAlertData:any = "";

  constructor(private _loaderService: LoaderService) { }

  ngOnInit(): void {
    this.ViralAlertData = JSON.parse(localStorage.getItem('viralAlertInfo'));
  }

  ngAfterViewInit(): void {
    this._loaderService.toggleMainLoader({ isViewLoaded: true });
  }
}