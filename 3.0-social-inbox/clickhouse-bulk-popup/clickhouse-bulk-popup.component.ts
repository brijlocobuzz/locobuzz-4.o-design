import { Component, OnInit } from '@angular/core';
import { TicketsService } from '../services/tickets.service';
import { NavigationService } from 'app/core/services/navigation.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CustomSnackbarComponent } from 'app/shared/components';
import { notificationType } from 'app/core/enums/notificationType';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-clickhouse-bulk-popup',
    templateUrl: './clickhouse-bulk-popup.component.html',
    styleUrls: ['./clickhouse-bulk-popup.component.scss'],
    standalone: false
})
export class ClickhouseBulkPopupComponent implements OnInit {

  constructor(private ticketService:TicketsService,
    private navigationService:NavigationService,
    private _snackBar:MatSnackBar,
    public dialogRef: MatDialogRef<ClickhouseBulkPopupComponent>) { }

  ngOnInit(): void {
  }

  submit()
  {
    this.dialogRef.close(true)
  }
  
}
