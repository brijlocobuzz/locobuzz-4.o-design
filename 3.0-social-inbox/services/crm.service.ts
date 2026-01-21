import { HttpClient } from '@angular/common/http';
import { Injectable, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { notificationType } from 'app/core/enums/notificationType';
import { ApolloRequest } from 'app/core/models/crm/ApolloRequest';
import { BandhanRequest } from 'app/core/models/crm/BandhanRequest';
import { CRMMentionMetaData } from 'app/core/models/crm/CRMMentionMetaData';
import { CRMMenu } from 'app/core/models/crm/CRMMenu';
import { DreamsolRequest, DuraflexRequest } from 'app/core/models/crm/DreamsolRequest';
import { ExtraMarksRequest } from 'app/core/models/crm/ExtraMarksRequest';
import { FedralRequest } from 'app/core/models/crm/FedralRequest';
import { MagmaRequest } from 'app/core/models/crm/MagmaRequest';
import { BTCCrmRequestType } from 'app/core/models/crm/NonTelecomRequest';
import { OctafxRequest } from 'app/core/models/crm/OctafxRequest';
import { RecrmRequest } from 'app/core/models/crm/RecrmRequest';
import { TataCapitalRequest } from 'app/core/models/crm/TataCapitalRequest';
import { TataUniRequest } from 'app/core/models/crm/TataUniRequest';
import { TitanRequest } from 'app/core/models/crm/TitanRequest';
import { CustomResponse } from 'app/core/models/dbmodel/TicketReplyDTO';
import { CustomSnackbarComponent } from 'app/shared/components';
import { environment } from 'environments/environment';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CrmService {
  constructor(private _http: HttpClient, private _snackBar: MatSnackBar) {}

  @Input() bandhanrequest: BandhanRequest;
  @Input() fedralrequest: FedralRequest;
  @Input() titanrequest: TitanRequest;
  @Input() magmarequest: MagmaRequest;
  @Input() apollorequest: ApolloRequest;
  @Input() crmmenu: CRMMenu;
  @Input() crmMentionData: CRMMentionMetaData;
  @Input() requestTypeTitle: string;
  @Input() requestType: BTCCrmRequestType;
  rercrmRequest: RecrmRequest;
  tataUniRequest: TataUniRequest;
  octafxCrmRequest: OctafxRequest;
  extramarksRequest: ExtraMarksRequest;
  dreamsolRequest: DreamsolRequest;
  tataCapitalRequest: TataCapitalRequest;
  duraflexRequest: DuraflexRequest;
  crmName: string;
  newMentionFound: boolean = false;

  NoLookupCrmRequest(keyObj): Observable<any> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Crm/NoLookupCrmRequest',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: response.message,
              },
            });
          }
        })
      );
  }

  GetBrandCrmRequestDetails(keyObj): Observable<any> {
    return this._http
      .post<CustomResponse>(
        environment.baseUrl + '/Crm/GetBrandCrmRequestDetails',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response.success) {
            return response.data;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while getting CRM details',
              },
            });
          }
        })
      );
  }

  GetCrmLeftMenu(keyObj): Observable<CRMMenu> {
    return this._http
      .post<CRMMenu>(environment.baseUrl + '/Crm/GetCrmLeftMenu', keyObj)
      .pipe(
        map((response) => {
          if (response.success) {
            const crmMenu: CRMMenu = response;
            return crmMenu;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Error Occurred while getting CRM Menu',
              },
            });
          }
        })
      );
  }

  GetCrmMentionList(keyObj): Observable<CRMMentionMetaData> {
    return this._http
      .post<CRMMentionMetaData>(
        environment.baseUrl + '/Crm/GetCrmMentionList',
        keyObj
      )
      .pipe(
        map((response) => {
          if (response) {
            const crmMMentionMetaData: CRMMentionMetaData = response;
            return crmMMentionMetaData;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Request failed to get mention CRM details',
              },
            });
          }
        })
      );
  }

  getApolloMasterDetails() {
    return this._http
      .post<any>(environment.baseUrl + '/Crm/GetApolloCrmMasterDetails', {})
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Request failed to get mention CRM details',
              },
            });
          }
        })
      );
  }
  getSnapDealTicket(keyObj) {
    return this._http
      .post<any>(environment.baseUrl + '/Crm/GetSnapDealTicket', keyObj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Request failed to get mention CRM details',
              },
            });
          }
        })
      );
  }
  getSnapDealOrder(keyObj) {
    return this._http
      .post<any>(environment.baseUrl + '/Crm/GetSnapDealOrder', keyObj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Request failed to get mention CRM details',
              },
            });
          }
        })
      );
  }

  GetTataUniCrmDetails(brandID) {
    return this._http
      .post<any>(
        environment.baseUrl + `/Crm/GetTataUniCrmDetails?brandId=${brandID}`,
        {}
      )
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            // this._snackBar.openFromComponent(CustomSnackbarComponent, {
            //   duration: 5000,
            //   data: {
            //     type: notificationType.Error,
            //     message: 'Request failed to get mention CRM details',
            //   },
            // });
          }
        })
      );
  }

  GetTataUniCrmLookup(obj) {
    return this._http
      .post<any>(environment.baseUrl + `/Crm/GetTataUniCrmLookup`, obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            // this._snackBar.openFromComponent(CustomSnackbarComponent, {
            //   duration: 5000,
            //   data: {
            //     type: notificationType.Error,
            //     message: 'Request failed to get mention CRM details',
            //   },
            // });
          }
        })
      );
  }
  CreateSnapDealTicket(obj) {
    return this._http
      .post<any>(environment.baseUrl + `/Crm/CreateSnapDealTicket`, obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Request failed to save CRM details',
              },
            });
          }
        })
      );
  }
  UpdateSnapDealTicket(obj) {
    return this._http
      .post<any>(environment.baseUrl + `/Crm/UpdateSnapDealTicket`, obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
            this._snackBar.openFromComponent(CustomSnackbarComponent, {
              duration: 5000,
              data: {
                type: notificationType.Error,
                message: 'Request failed to save CRM details',
              },
            });
          }
        })
      );
  }

  CreateSalesForceCrm(obj,type,crmName?:string)
  {
    let endPoint;
    if (crmName =='freshworkcrm')
    {
      endPoint ='/FreshWorks/CreateFreshworksSR';
    }else{
       endPoint = type == 1 ? '/SalesForce/CreateSalesForceSR' : '/SalesForce/CreateSalesForceLead'
    }
    return this._http
      .post<any>(environment.baseUrl + endPoint, obj)
      .pipe(
        map((response) => {
          if (response) {
            return response;
          } else {
          }
        })
      );
  }
  getSnapDealJson(): Observable<any> {
    return this._http.get('assets/jsonfiles/SnapDealJson.json').pipe(
      map((response: any) => {
        const authuser = response;
        if (response.success) {
          return response;
        } else {
          return response;
        }
      })
    );
  }
}
