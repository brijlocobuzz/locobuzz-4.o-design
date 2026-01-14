import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'environments/environment';
import { map, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AgentIqService {
  public agentIQBrandSubject: Subject<any> = new Subject<any>();


  constructor(
    private _http: HttpClient
  ) { }

  ToggleAgentIQ(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/ToggleAgentIQ`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  ChangeAgentIqLevel(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/ChangeAgentIQLevel`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetAgentIQsettings(data): Observable<any> {
    return this._http
      .get<any>(
        `${environment.baseUrl}/AIAlert/GetAgentIQsettings?BrandID=${data}`,
      )
      .pipe(
        map((response) => {
          if (response) {
            const GetAgentIQsettings: any = response;
            return GetAgentIQsettings;
          }
        })
      );
  }

  ChangeIQCloseSettings(data): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/ChangeIQCloseSettings`, data)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  SaveIQPolicy(data): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/SaveIQPolicy`, data)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  enableDisableResponseSuggestion(data): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/ChangeResponseSuggestionSettings`, data)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
