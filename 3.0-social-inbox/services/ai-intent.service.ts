import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthUser } from 'app/core/interfaces/User';
import { GetFeedbackSetting } from 'app/core/models/accounts/getFeedbackSetting';
import { environment } from 'environments/environment';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AiIntentService {
  public tabIndex: BehaviorSubject<number> =
    new BehaviorSubject<number>(null);
  public redirectToPlayground = false;
  public selectedBrand: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public getEditDeleteAlertData: BehaviorSubject<any> = new BehaviorSubject<boolean>(false);


  constructor(private _http: HttpClient) { }

  RequestAIAlertActivation(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/RequestAIAlertActivation`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  SaveAIIntent(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/SaveAIIntent`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetAIAlert(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/GetAIIntent`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  SaveFeatureActiveStatus(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/SaveFeatureActiveStatus`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetAIIntentStatus(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/GetAIIntentStatus?BrandID=${keyObj}`, {})
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  DeleteAIIntent(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/DeleteAIIntent`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetAISuggestedScenario(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/GetAISuggestedScenario`, keyObj)
    .pipe(
      map((response) =>{
         return response;
      })
    );
  }
  
  TestAIExtraction(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/TestAIExtraction`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }


  SaveIntentActiveInactive(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/SaveIntentActiveInactive`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  GetCustomAttributes(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/GetCustomAttributes`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  SaveCustomAttribute(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/SaveCustomAttributes`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  DeleteCustomAttribute(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/DeleteCustomAttribute`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  ToggleAttributeStatus(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/ToggleAttributeStatus`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  ToggleCustomAttribute(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/ToggleCustomAttribute`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  GetCustomAttributeStatus(keyObj): Observable<any> {
    return this._http
      .get(`${environment.baseUrl}/AIAlert/CustomAttributeStatus?BrandID=${keyObj}`, {})
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
  TestAbsaPlayground(keyObj): Observable<any> {
    return this._http
      .post(`${environment.baseUrl}/AIAlert/AbsaPlayground`, keyObj)
      .pipe(
        map((response) => {
          return response;
        })
      );
  }
}
