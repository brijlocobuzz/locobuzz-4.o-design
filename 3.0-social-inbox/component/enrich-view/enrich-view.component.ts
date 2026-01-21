import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { loaderTypeEnum } from 'app/core/enums/loaderTypeEnum';
import { CommonService } from 'app/core/services/common.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-enrich-view',
    templateUrl: './enrich-view.component.html',
    styleUrls: ['./enrich-view.component.scss'],
    standalone: false
})
export class EnrichViewComponent implements OnInit {
  showLoader: boolean = true;
  showOverviewLoader: boolean = true;
  sfdcTicketView: any;
  constructor(private _cdr:ChangeDetectorRef, private _sidebarService: SidebarService, private commonService: CommonService) {}
  loaderTypeEnum = loaderTypeEnum;
  defaultLayout: boolean = false;
  subs = new SubSink();
  ngOnInit(): void {
    this.sfdcTicketView = JSON.parse(localStorage.getItem('sfdcTicketView'));
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }

  getData(event) {
    this.showLoader = event;
  }

  getOverviewLoading(event) {
    this.showOverviewLoader = event;
  }
}
