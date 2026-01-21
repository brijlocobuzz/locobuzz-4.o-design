import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BaseMention } from 'app/core/models/mentions/locobuzz/BaseMention';
import { TicketsService } from 'app/social-inbox/services/tickets.service';
import { SubSink } from 'subsink';

export interface dialogData {
  baseMention: BaseMention,
  url: string
}
@Component({
    selector: 'app-animal-wildfare-popup',
    templateUrl: './animal-wildfare-popup.component.html',
    styleUrls: ['./animal-wildfare-popup.component.scss'],
    standalone: false
})

export class AnimalWildfarePopupComponent implements OnInit, OnDestroy {
  iframeUrl: SafeResourceUrl;
    subs = new SubSink();
  

  constructor(public dialogRef: MatDialogRef<AnimalWildfarePopupComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogData: dialogData,
    private _sanitizer: DomSanitizer,
    private _ticketService:TicketsService) { }

  ngOnInit(): void {
      this.iframeUrl = this._sanitizer.bypassSecurityTrustResourceUrl(this.dialogData.url)
    this.subs.add(
    this._ticketService.animalWildFareObs.subscribe((res) => {
      if(res)
      {
        this.dialogRef.close(res?.data?.SRID);
      }
    }
    ))
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

}
