import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  constructor() { }

  getCurrentUserData(): any {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;  // Return parsed data or null if not found
  }
}
