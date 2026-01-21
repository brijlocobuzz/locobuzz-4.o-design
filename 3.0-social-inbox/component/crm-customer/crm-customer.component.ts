import { Component, OnInit } from '@angular/core';

export interface PeriodicElement {
  name: string;
  position: number;
}

const ELEMENT_DATA: PeriodicElement[] = [
  { position: 1, name: 'Hydrogen' },
  { position: 2, name: 'Hydrogen' },
  { position: 3, name: 'Hydrogen' },
];

@Component({
    selector: 'app-crm-customer',
    templateUrl: './crm-customer.component.html',
    styleUrls: ['./crm-customer.component.scss'],
    standalone: false
})
export class CrmCustomerComponent implements OnInit {
  displayedColumns: string[] = ['position', 'name'];
  dataSource = ELEMENT_DATA;

  constructor() {}

  ngOnInit(): void {}
}
