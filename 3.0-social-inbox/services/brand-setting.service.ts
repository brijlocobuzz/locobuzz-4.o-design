import { Injectable } from '@angular/core';
import { AllBrandsTicketsDTO } from 'app/core/models/dbmodel/AllBrandsTicketsDTO';
import { BrandList } from 'app/shared/components/filter/filter-models/brandlist.model';

@Injectable({
  providedIn: 'root',
})
export class BrandSettingService {
  constructor() {}

  GetBrandSettings(
    currentBrand: BrandList,
    ticketHistoryData: AllBrandsTicketsDTO
  ): any {
    if (currentBrand.isBrandworkFlowEnabled) {
      ticketHistoryData.isBrandWorkFlowEnabled = true;
      ticketHistoryData.isBrandWorkFlow = true;
    }
    if (currentBrand.isCSDApprove) {
      ticketHistoryData.isCSDApprove = true;
    }
    if (currentBrand.isCSDReject) {
      ticketHistoryData.isCSDReject = true;
    }
    if (currentBrand.isTicketCategoryTagEnable) {
      ticketHistoryData.isTicketCategoryTagEnable = true;
    }
    if (currentBrand.isEnableReplyApprovalWorkFlow) {
      ticketHistoryData.isEnableReplyApprovalWorkFlow = true;
    }
    if (currentBrand.isSSREEnable) {
      ticketHistoryData.isSSREEnabled = currentBrand.isSSREEnable;
    }
    if (currentBrand.isWorkflowEnabled) {
      ticketHistoryData.isWorkflowEnabled = currentBrand.isWorkflowEnabled;
    }

    return ticketHistoryData;
  }
}
