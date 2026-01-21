import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class FilterConfig {
  baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // make GET request by this
  getData(_URL: string): Observable<any> {
    const URL = this.baseUrl + _URL;
    return this.http.get(URL).pipe(catchError(this.handleError));
  }

  postData(_URL, body): Observable<any> {
    const URL = this.baseUrl + _URL;
    const authToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNWIyZjI5Mi0wYjljLTQ0OTItYjc5NC1hYTcyMjJhYzQ0ZGYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiIzIiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZWlkZW50aWZpZXIiOiIzMzUzNiIsImNhdGVnb3J5aWQiOiIzMzk4IiwiaHR0cDovL3NjaGVtYXMueG1sc29hcC5vcmcvd3MvMjAwNS8wNS9pZGVudGl0eS9jbGFpbXMvbmFtZSI6ImFkaXR5YSIsImV4cCI6MTYxMDc3NzE0MCwiaXNzIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIiwiYXVkIjoiaHR0cHM6Ly93d3cubG9jb2J1enouY29tIn0.y8xOyoUfLHu645FoUpRhw_5I-x0_irXLOhHv2q7rsmM';
    const Theaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`,
    });
    return this.http.post(URL, body).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}`
      );
    }
    // Return an observable with a user-facing error message.
    return throwError('Something bad happened; please try again later.');
  }
}
