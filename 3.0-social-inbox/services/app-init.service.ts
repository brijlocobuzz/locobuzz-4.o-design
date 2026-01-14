import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppInitService {
  private readonly CONFIG_URL = 'assets/config/config.js';
  private config$: Observable<any>;

  constructor() {}
}
