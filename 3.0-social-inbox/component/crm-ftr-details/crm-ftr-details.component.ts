import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonService } from 'app/core/services/common.service';
import { SidebarService } from 'app/core/services/sidebar.service';
import { SubSink } from 'subsink';

@Component({
    selector: 'app-crm-ftr-details',
    templateUrl: './crm-ftr-details.component.html',
    styleUrls: ['./crm-ftr-details.component.scss'],
    standalone: false
})
export class CrmFtrDetailsComponent implements OnInit {
  constructor(
    private _cdr: ChangeDetectorRef,
    private _sidebarService: SidebarService,
    private commonService: CommonService
  ) {}
  defaultLayout: boolean = false;
  subs = new SubSink();
  ngOnInit(): void {
    this.subs.add(
      this.commonService.onChangeLayoutType.subscribe((layoutType) => {
        if (layoutType) {
          this.defaultLayout = layoutType == 1 ? true : false;
          this._cdr.detectChanges();
        }
      })
    )
  }
}
